/**
 * 🔥 TE RETO - Experiencia de Juego en Vivo (Game Play)
 * Temporizador visual dinámico, combos de fuego (x2, x3, x5, x10),
 * bloqueo anti-trampas, gráficos de respuestas y animaciones de acierto.
 */

window.GameView = {
  isHost: false,
  room: null,
  challenge: null,
  currentQuestionIndex: 0,
  timerInterval: null,
  timeLeft: 20,
  totalTime: 20,
  hasAnswered: false,
  selectedAnswer: null,
  questionStartTime: 0,
  isSolo: false,
  gameMode: 'clasico',
  modeConfig: {},
  modeActionDone: false,
  dartThrown: false,
  pendingSoloResults: null,

  initSolo(challenge, gameMode) {
    this.isSolo = true;
    this.isHost = true;
    this.challenge = challenge;
    this.currentQuestionIndex = 0;
    this.gameMode = gameMode || 'clasico';
    this.modeConfig = {};
    this.modeActionDone = false;
    this.dartThrown = false;
    this.pendingSoloResults = null;
    
    // Configurar jugador local
    const soloPlayer = {
      id: 'solo_player',
      nickname: window.appState.currentUser?.name || 'Retador Solitario',
      avatar: window.appState.currentUser?.avatar || '⚡',
      score: 0,
      streak: 0,
      maxStreak: 0,
      answersCount: 0,
      correctCount: 0,
      answers: []
    };

    this.room = {
      pin: 'SOLO',
      challenge: challenge,
      gameMode: this.gameMode,
      players: [soloPlayer],
      responses: {}
    };

    // Conectar explícitamente con el motor en tiempo real
    window.realtimeEngine.currentRoom = this.room;
    window.realtimeEngine.localPlayer = soloPlayer;
    window.realtimeEngine.isHost = true;

    this.startCountdownIntro();
  },

  initHostGame(room) {
    this.isSolo = false;
    this.isHost = true;
    this.room = room;
    this.challenge = room.challenge;
    this.gameMode = room.gameMode || 'clasico';
    this.modeConfig = room.modeConfig || {};
    this.currentQuestionIndex = 0;
    this.setupHostListeners();
    this.startCountdownIntro();
  },

  initPlayerGame(room) {
    this.isSolo = false;
    this.isHost = false;
    this.room = room || window.realtimeEngine.currentRoom;
    this.challenge = this.room?.challenge;
    if (!this.challenge && window.LobbyView?.joinRoomData?.challenge) {
      this.challenge = window.LobbyView.joinRoomData.challenge;
      if (this.room) this.room.challenge = this.challenge;
    }
    if ((!this.challenge || !Array.isArray(this.challenge.questions) || this.challenge.questions.length === 0) && window.appState?.challenges?.length > 0) {
      this.challenge = window.appState.challenges[0];
      if (this.room) this.room.challenge = this.challenge;
    }
    if ((!this.challenge || !Array.isArray(this.challenge.questions) || this.challenge.questions.length === 0) && typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
      this.challenge = DEFAULT_CHALLENGES[0];
      if (this.room) this.room.challenge = this.challenge;
    }
    let detectedMode = this.room?.gameMode;
    if (!detectedMode || detectedMode === 'clasico') {
      const pin = this.room?.pin || window.realtimeEngine.currentRoom?.pin;
      if (pin) {
        try {
          const stored = localStorage.getItem(`te_reto_room_${pin}`) || localStorage.getItem(`mentix_room_${pin}`);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.gameMode) {
              detectedMode = parsed.gameMode;
              this.room.gameMode = parsed.gameMode;
              this.room.modeConfig = parsed.modeConfig || this.room.modeConfig;
            }
          }
        } catch (e) {}
      }
    }

    this.gameMode = detectedMode || 'clasico';
    this.modeConfig = this.room?.modeConfig || {};
    this.currentQuestionIndex = this.room?.currentQuestionIndex || 0;
    this.setupPlayerListeners();

    if (this.room?.status === 'intro' || this.currentQuestionIndex === 0) {
      this.startCountdownIntro();
    } else {
      this.renderQuestionScreen();
    }
  },

  setupHostListeners() {
    if (this.hostListenersAttached) return;
    this.hostListenersAttached = true;

    window.realtimeEngine.on('PLAYER_ANSWER', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        if (!data.isBot) {
          window.realtimeEngine.processAnswer(data.playerId, data.answerIndex, data.timeTaken, this.challenge.questions[this.currentQuestionIndex]);
        }
        this.onAnswerReceived(data);
      }
    });

    window.realtimeEngine.on('PLAYER_MODE_ACTION', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        this.showHostModeActionToast(data);
        if (this.room && this.room.players && data.playerId && data.bonusPoints) {
          const targetPlayer = this.room.players.find(p => p.id === data.playerId);
          if (targetPlayer) {
            targetPlayer.score = (targetPlayer.score || 0) + data.bonusPoints;
            window.realtimeEngine.syncRoomState();
          }
        }
        if (this.isHost) {
          this.modeActionsCount = (this.modeActionsCount || 0) + 1;
          const totalPlayers = this.room?.players?.length || 1;
          this.updateHostModeActivityBanner(this.modeActionsCount, totalPlayers);

          const totalResponses = Object.keys(this.room?.responses || {}).length;
          // Si todos los jugadores respondieron y todos completaron su actividad de modo
          if (totalResponses >= totalPlayers && this.modeActionsCount >= totalPlayers && !this.questionFinished) {
            setTimeout(() => {
              this.finishQuestionHost();
            }, 1200);
          }
        }
      }
    });
  },

  setupPlayerListeners() {
    if (this.playerListenersAttached) return;
    this.playerListenersAttached = true;

    window.realtimeEngine.on('ROOM_ANSWER_PROGRESS', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        this.updateResponseCounter(data.totalResponses, data.totalPlayers);
      }
    });

    window.realtimeEngine.on('SHOW_QUESTION_RESULTS', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (data.responses) this.room.responses = data.responses;
        if (data.players) {
          this.room.players = data.players;
          const myId = window.realtimeEngine.localPlayer?.id;
          const me = data.players.find(p => p.id === myId);
          if (me) Object.assign(window.realtimeEngine.localPlayer, me);
        }

        // Si el estudiante aún está realizando la actividad del modo (ej: lanzando dardo o desactivando bomba)
        const inMiddleOfModeAction = this.gameMode && this.gameMode !== 'clasico' && !this.modeActionDone && !this.dartThrown && this.hasAnswered;
        if (inMiddleOfModeAction) {
          const panel = document.getElementById('answer-feedback-panel');
          if (panel) {
            const hint = document.createElement('div');
            hint.style.cssText = 'font-size: 0.82rem; color: #ffd166; font-weight: 800; margin-top: 0.5rem; animation: timer-pulse 0.8s infinite alternate;';
            hint.textContent = '⏳ ¡Completa tu acción del modo ahora!';
            panel.appendChild(hint);
          }
          setTimeout(() => {
            this.revealQuestionResults(data);
          }, 3500);
        } else {
          this.revealQuestionResults(data);
        }
      }
    });

    window.realtimeEngine.on('NEXT_QUESTION', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (window.LeaderboardView && window.LeaderboardView.waitingPollInterval) {
          clearInterval(window.LeaderboardView.waitingPollInterval);
          window.LeaderboardView.waitingPollInterval = null;
        }
        this.currentQuestionIndex = data.questionIndex;
        if (data.room) {
          this.room = data.room;
          window.realtimeEngine.currentRoom = data.room;
        } else if (this.room) {
          this.room.currentQuestionIndex = data.questionIndex;
          this.room.status = 'question';
        }
        // Asegurar que el alumno cambie de la pantalla de tabla de posiciones o estadísticas a la pregunta
        window.appRouter.navigate('game');
        this.renderQuestionScreen();
      }
    });

    window.realtimeEngine.on('SHOW_LEADERBOARD', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (data.room) {
          this.room = data.room;
          window.realtimeEngine.currentRoom = data.room;
        }
        window.appRouter.showLeaderboard(data.room || this.room, false);
      }
    });

    window.realtimeEngine.on('SHOW_PODIUM', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
        if (this.timerInterval) clearInterval(this.timerInterval);
        if (window.LeaderboardView && window.LeaderboardView.waitingPollInterval) {
          clearInterval(window.LeaderboardView.waitingPollInterval);
          window.LeaderboardView.waitingPollInterval = null;
        }
        if (data.room) {
          this.room = data.room;
          window.realtimeEngine.currentRoom = data.room;
        }
        window.appRouter.showPodium(data.room || this.room);
      }
    });
  },

  startCountdownIntro() {
    const container = document.getElementById('view-game');
    if (!container) return;

    if (!this.challenge || !Array.isArray(this.challenge.questions) || this.challenge.questions.length === 0) {
      if (typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
        this.challenge = { ...(this.challenge || {}), questions: DEFAULT_CHALLENGES[0].questions };
      } else {
        alert('⚠️ Este reto aún no tiene preguntas configuradas. Edita el reto o agrega preguntas para comenzar a jugar.');
        window.appRouter.navigate('home');
        return;
      }
    }

    let count = 3;
    window.soundEngine.playTick();

    container.innerHTML = `
      <div style="min-height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; padding: 2rem;">
        <span class="badge-tag tag-medium" style="margin-bottom: 1.5rem; font-size: 1rem; padding: 0.5rem 1.25rem;">
          ¡EL RETO COMIENZA EN...
        </span>
        <div id="intro-countdown-num" style="font-size: clamp(6rem, 18vw, 10rem); font-weight: 900; line-height: 1; color: var(--neon-cyan); text-shadow: 0 0 50px rgba(0,245,212,0.8); animation: timer-pulse 0.9s infinite alternate;">
          ${count}
        </div>
        <p style="color: var(--text-secondary); font-size: 1.3rem; margin-top: 1.5rem; font-weight: 700;">
          ${this.challenge.title || 'Reto MENTIX'}
        </p>
      </div>
    `;

    const timer = setInterval(() => {
      count--;
      const el = document.getElementById('intro-countdown-num');
      if (count > 0) {
        if (el) el.textContent = count;
        window.soundEngine.playTick();
      } else if (count === 0) {
        if (el) {
          el.textContent = '¡A RETAR! 🔥';
          el.style.color = 'var(--neon-magenta)';
        }
        window.soundEngine.playFanfare();
      } else {
        clearInterval(timer);
        try {
          this.renderQuestionScreen();
        } catch (err) {
          console.error('Error al renderizar pregunta:', err);
          alert('Hubo un inconveniente al cargar la pregunta. Regresando al inicio.');
          window.appRouter.navigate('home');
        }
      }
    }, 1000);
  },

  renderQuestionScreen() {
    const container = document.getElementById('view-game');
    if (!container) return;

    if (!this.challenge || !Array.isArray(this.challenge.questions) || this.challenge.questions.length === 0) {
      if (typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
        this.challenge = { ...(this.challenge || {}), questions: DEFAULT_CHALLENGES[0].questions };
      } else {
        alert('⚠️ Este reto aún no tiene preguntas configuradas.');
        window.appRouter.navigate('home');
        return;
      }
    }

    if (this.currentQuestionIndex >= this.challenge.questions.length) {
      this.finishGame();
      return;
    }

    const q = this.challenge.questions[this.currentQuestionIndex];
    if (!q) {
      this.finishGame();
      return;
    }

    if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
    if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);

    this.hasAnswered = false;
    this.selectedAnswer = null;
    this.questionFinished = false;
    this.modeActionDone = false;
    this.dartThrown = false;
    this.pendingSoloResults = null;
    this.modeActionsCount = 0;
    this.waitingForModeActions = false;

    // Limpiar elementos de la pregunta anterior
    const prevRibbon = document.getElementById('full-screen-ribbon-wrapper');
    if (prevRibbon) prevRibbon.remove();
    const prevHist = document.getElementById('answers-stats-histogram');
    if (prevHist) prevHist.remove();
    const prevAdv = document.getElementById('auto-advance-container');
    if (prevAdv) prevAdv.remove();
    const prevModeBanner = document.getElementById('host-mode-activity-banner');
    if (prevModeBanner) prevModeBanner.remove();

    this.totalTime = q.timeLimit || 20;
    this.timeLeft = this.totalTime;
    this.questionStartTime = Date.now();

    if (this.room) {
      this.room.responses = {};
      this.room.status = 'question';
      this.room.currentQuestionIndex = this.currentQuestionIndex;
      if (this.isHost && !this.isSolo) {
        window.realtimeEngine.currentRoom = this.room;
        window.realtimeEngine.syncRoomState();
      }
    }

    if (this.isHost && !this.isSolo) {
      window.realtimeEngine.broadcast({
        type: 'NEXT_QUESTION',
        pin: this.room.pin,
        questionIndex: this.currentQuestionIndex,
        room: this.room
      });
      window.realtimeEngine.simulateBotAnswers(q);
      this.renderKahootHostQuestion(container, q);
    } else if (!this.isHost && !this.isSolo) {
      this.renderKahootPlayerQuestion(container, q);
    } else {
      this.renderSoloQuestion(container, q);
    }

    this.startQuestionTimer();
    this.bindKeyboardShortcuts();
  },

  /* ==========================================================================
     🎮 IDENTIDAD VISUAL PROPIA DE "TE RETO" (FIGURAS Y PALETA GAMER)
     Diferenciación total de Kahoot:
     0: ✦ Estrella Cósmica (Magenta Neón)
     1: ⬢ Hexágono Futurista (Púrpura Cósmico)
     2: ⚡ Rayo de Reto (Naranja Fuego)
     3: 🛡️ Escudo de Campeón (Cian Eléctrico)
     4: ⬟ Pentágono Cristal (Esmeralda Menta)
     5: 💎 Gema Radiante (Azul Cobalto)
     ========================================================================== */
  retoShapes: [
    {
      id: 'star',
      name: 'Estrella',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M12 1.5L14.7 8.8L22.5 12L14.7 15.2L12 22.5L9.3 15.2L1.5 12L9.3 8.8L12 1.5Z"/></svg>`,
      colorClass: 'reto-card-magenta',
      hex: '#f72585'
    },
    {
      id: 'hexagon',
      name: 'Hexágono',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M12 2L21 7.2V16.8L12 22L3 16.8V7.2L12 2Z"/></svg>`,
      colorClass: 'reto-card-purple',
      hex: '#7928ca'
    },
    {
      id: 'bolt',
      name: 'Rayo',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M13.5 1.5L4 13H11L9.5 22.5L20 10H13L13.5 1.5Z"/></svg>`,
      colorClass: 'reto-card-orange',
      hex: '#ff6b00'
    },
    {
      id: 'shield',
      name: 'Escudo',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M12 2L20.5 5.5V12C20.5 17.2 16.9 21.6 12 22.8C7.1 21.6 3.5 17.2 3.5 12V5.5L12 2Z"/></svg>`,
      colorClass: 'reto-card-cyan',
      hex: '#00b4d8'
    },
    {
      id: 'pentagon',
      name: 'Pentágono',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M12 2L21.5 8.9L17.9 20H6.1L2.5 8.9L12 2Z"/></svg>`,
      colorClass: 'reto-card-emerald',
      hex: '#06d6a0'
    },
    {
      id: 'gem',
      name: 'Gema',
      svg: `<svg viewBox="0 0 24 24" class="reto-shape-svg" fill="currentColor"><path d="M6 3H18L22 9L12 22L2 9L6 3Z"/></svg>`,
      colorClass: 'reto-card-cobalt',
      hex: '#4361ee'
    }
  ],

  getShapeDef(index) {
    return this.retoShapes[index % this.retoShapes.length];
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  getOptionText(opt) {
    if (opt === null || opt === undefined) return '';
    if (typeof opt === 'string') return opt;
    if (typeof opt === 'object' && opt.text !== undefined) return String(opt.text);
    return String(opt);
  },

  escapeAttr(str) {
    return this.escapeHtml(str);
  },

  /* 🎓 PANTALLA DEL PROFESOR / HOST (PROYECCIÓN EN VIVO CON FORMAS Y COLORES TE RETO) */
  renderKahootHostQuestion(container, q) {
    const totalPlayers = this.room?.players?.length || 0;
    const isTwoOptions = (q.options || []).length === 2;
    const isTextOrOpen = q.type === 'text' || q.type === 'open';

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto; padding: 1rem 1.25rem 4rem;">
        <!-- Barra Superior de Anfitrión / Profesor -->
        <div class="kahoot-host-topbar">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="kahoot-pin-pill">
              <span>📱</span> Únete con PIN: <strong style="color: var(--neon-cyan); letter-spacing: 1px;">${this.room.pin}</strong>
            </span>
            <span style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">
              Pregunta ${this.currentQuestionIndex + 1} de ${this.challenge.questions.length}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="color: var(--text-secondary); font-weight: 700; font-size: 0.95rem;">
              👤 <span id="host-players-count">${totalPlayers}</span> Alumnos
            </span>
            <button class="btn-kahoot-skip" id="btn-skip-timer" onclick="window.GameView.skipTimer()" title="Omitir temporizador y ver respuestas">
              <span>⏭️</span> <span>Omitir temporizador</span>
            </button>
          </div>
        </div>

        <!-- Overlay Dinámico del Modo de Juego Seleccionado -->
        ${window.GameModes ? window.GameModes.renderHostQuestionOverlay(this.gameMode, this) : ''}

        <!-- Banner de Pregunta Estilo TE RETO -->
        <div class="kahoot-host-question-banner">
          ${q.text}
        </div>

        <!-- Escenario Central (Temporizador a la izquierda, Media al centro, Contador a la derecha) -->
        <div class="kahoot-host-stage">
          <!-- Temporizador Circular Morado a la Izquierda -->
          <div class="kahoot-host-circle-badge timer-badge" id="host-timer-circle">
            <span id="host-timer-num">${this.timeLeft}</span>
          </div>

          <!-- Imagen / Media en el Centro -->
          <div class="kahoot-host-media-box">
            ${q.media && q.mediaType === 'image' ? `
              <img src="${q.media}" alt="Pregunta" />
            ` : `
              <div class="kahoot-host-media-fallback">
                <div style="font-size: 3.5rem; margin-bottom: 0.5rem;">🎮</div>
                <div style="font-size: 1.2rem; font-weight: 900; color: var(--text-primary);">${this.challenge.title}</div>
                <div style="font-size: 0.85rem; color: var(--neon-cyan); margin-top: 0.35rem; font-weight: 700;">${this.challenge.categoryName || 'Reto en Vivo'}</div>
              </div>
            `}
          </div>

          <!-- Contador de Respuestas a la Derecha -->
          <div class="kahoot-host-circle-badge answers-badge">
            <span id="host-responses-num" style="font-size: 2.2rem; font-weight: 900; line-height: 1;">0</span>
            <span style="font-size: 0.65rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.9;">Respuestas</span>
          </div>
        </div>

        <!-- Si es Respuesta Corta o Abierta, mostrar Muro de Respuestas en Vivo (Estilo Mentix) -->
        ${isTextOrOpen ? `
          <div class="host-text-responses-stage" id="host-text-responses-stage">
            <div class="host-text-responses-header">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.8rem;">${q.type === 'open' ? '💬' : '✍️'}</span>
                <div>
                  <div style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary);">
                    ${q.type === 'open' ? 'Muro de Respuestas Abiertas en Vivo' : 'Respuestas de los Estudiantes en Vivo'}
                  </div>
                  <div style="font-size: 0.85rem; color: var(--text-secondary);">
                    ${q.type === 'open' ? 'Cada estudiante comparte su idea o reflexión libremente. Aparecen aquí al instante.' : 'Las respuestas enviadas por los estudiantes aparecen aquí en tiempo real.'}
                  </div>
                </div>
              </div>
              <div class="badge-tag" id="host-live-counter-pill" style="background: rgba(0, 245, 212, 0.15); border: 2px solid var(--neon-cyan); color: var(--neon-cyan); font-weight: 900; font-size: 1rem; padding: 0.4rem 1.1rem; border-radius: 9999px;">
                👥 <span id="host-live-answers-count">0</span> Respuestas
              </div>
            </div>

            <div class="host-text-responses-grid" id="host-live-answers-grid">
              <div class="host-text-empty-box" id="host-text-empty-box">
                <div style="font-size: 3rem; margin-bottom: 0.6rem; animation: timer-pulse 1.4s infinite alternate;">⏳</div>
                <div style="font-size: 1.25rem; font-weight: 800; color: var(--text-primary);">Esperando que los estudiantes envíen sus respuestas...</div>
                <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0.35rem 0 0; max-width: 480px;">
                  En cuanto un estudiante presione <strong>Enviar</strong> en su dispositivo, su respuesta aparecerá aquí de inmediato.
                </p>
              </div>
            </div>
          </div>
        ` : `
          <!-- Opciones de Respuesta TE RETO (Figuras Vectoriales: ✦ Estrella, ⬢ Hexágono, ⚡ Rayo, 🛡️ Escudo) -->
          <div class="kahoot-answers-grid ${isTwoOptions ? 'two-options' : ''}" id="host-answers-grid">
            ${(q.options || []).map((opt, optIdx) => {
              const shapeDef = this.getShapeDef(optIdx);
              return `
                <div class="kahoot-answer-card ${shapeDef.colorClass}" id="host-opt-card-${optIdx}">
                  <span class="kahoot-shape">${shapeDef.svg}</span>
                  <span class="kahoot-card-text">${this.escapeHtml(this.getOptionText(opt))}</span>
                  <div class="kahoot-stat-pill" id="host-stat-pill-${optIdx}" style="display: none;"></div>
                </div>
              `;
            }).join('')}
          </div>
        `}

        <!-- Botón de Avance del Profesor (Visible al finalizar la pregunta) -->
        <div id="host-next-action-container" style="display: none; text-align: center; margin-top: 2rem;"></div>
      </div>
    `;

    // Si ya hay respuestas recibidas previamente en esta pregunta, renderizarlas en el muro
    if (isTextOrOpen && this.room?.responses) {
      setTimeout(() => {
        Object.entries(this.room.responses).forEach(([pId, r]) => {
          this.renderLiveTextAnswerOnHost(pId, r.answerIndex);
        });
      }, 50);
    }

    // Ajustar font-size dinámicamente según longitud del texto de la pregunta y de cada opción
    setTimeout(() => {
      this.adjustCardAndBannerTextSizes();
    }, 60);
  },

  /* 📱 PANTALLA DEL ALUMNO / JUGADOR */
  renderKahootPlayerQuestion(container, q) {
    const isTwoOptions = (q.options || []).length === 2;
    const isTextOrOpen = q.type === 'text' || q.type === 'open';

    // 🎲 Variación / Aleatorización de opciones exclusiva para este alumno (anti-copia)
    const rawOptions = q.options || [];
    let displayOptions = rawOptions;
    this.playerOptionMapping = null;

    if (rawOptions.length > 1 && !isTextOrOpen) {
      const indices = rawOptions.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      this.playerOptionMapping = indices;
      displayOptions = indices.map(idx => rawOptions[idx]);
    }

    container.innerHTML = `
      <div class="kahoot-player-fullscreen-container">
        <!-- Barra Superior Compacta del Alumno -->
        <div class="kahoot-player-topbar">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <div style="background: rgba(10, 20, 45, 0.85); width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #ffffff !important; border: 1.5px solid #00f5d4; text-shadow: 0 0 10px rgba(0,245,212,0.8); box-shadow: 0 0 12px rgba(0,245,212,0.3);">
              ${this.currentQuestionIndex + 1}
            </div>
            <span style="font-weight: 800; font-size: 1rem; color: #ffffff !important; text-shadow: 0 2px 10px rgba(0,0,0,0.95);">
              Pregunta ${this.currentQuestionIndex + 1} de ${this.challenge.questions.length}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div class="badge-tag" style="background: rgba(10, 20, 45, 0.85); border: 1.5px solid #ffd166; color: #ffd166 !important; font-weight: 900; font-size: 0.95rem; padding: 0.35rem 0.9rem; border-radius: 9999px; text-shadow: 0 0 10px rgba(255, 209, 102, 0.6); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              🏆 <span id="player-score-val">${window.realtimeEngine.localPlayer?.score || 0}</span> PTS
            </div>
            <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.9rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(10,20,45,0.7); color: #ffffff !important; cursor: pointer; text-shadow: 0 2px 6px rgba(0,0,0,0.8);" onclick="if(confirm('¿Deseas salir del cuestionario?')) window.appRouter.navigate('home');" title="Salir del cuestionario">
              🚪
            </button>
          </div>
        </div>

        <!-- Enunciado de la Pregunta para el Estudiante -->
        <div class="kahoot-host-question-banner" style="font-size: clamp(1.05rem, 3.2vw, 1.35rem); margin: 0.4rem 0 0.85rem; padding: 0.75rem 1rem; border-radius: 14px; min-height: auto;">
          ${this.escapeHtml(q.text)}
        </div>

        ${isTextOrOpen ? `
          <!-- Entrada de Respuesta Corta o Abierta para el Estudiante -->
          <div class="player-text-input-container">
            <div class="player-text-input-card">
              <div style="font-size: 2.6rem; margin-bottom: 0.5rem;">
                ${q.type === 'open' ? '💬' : '✍️'}
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary); margin: 0 0 0.4rem;">
                ${q.type === 'open' ? 'Respuesta Abierta' : 'Respuesta Corta'}
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0 0 1.25rem; line-height: 1.45;">
                ${q.type === 'open' 
                  ? 'Escribe tu idea, opinión o reflexión libremente. ¡Aparecerá en vivo en la pantalla del profesor!' 
                  : 'Escribe la respuesta lo más rápido que puedas para obtener mayor puntaje.'}
              </p>

              <div style="width: 100%; margin-bottom: 1.25rem;">
                ${q.type === 'open' ? `
                  <textarea 
                    id="player-text-input" 
                    class="player-text-field"
                    rows="3"
                    placeholder="Escribe aquí tu pensamiento, idea o respuesta..."
                    maxlength="280"
                    style="resize: none; font-family: inherit;"
                    onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.GameView.handleTextAnswer(); }"
                  ></textarea>
                ` : `
                  <input 
                    type="text" 
                    id="player-text-input" 
                    class="player-text-field"
                    placeholder="Escribe tu respuesta aquí..."
                    maxlength="90"
                    autocomplete="off"
                    onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.GameView.handleTextAnswer(); }"
                  />
                `}
              </div>

              <button 
                type="button" 
                id="btn-submit-text-answer" 
                class="btn btn-primary btn-lg" 
                style="width: 100%; padding: 0.95rem; font-size: 1.15rem; font-weight: 900; border-radius: 14px; background: linear-gradient(135deg, var(--neon-cyan), #0077b6); border: none; box-shadow: 0 6px 20px rgba(0, 245, 212, 0.4); cursor: pointer;"
                onclick="window.GameView.handleTextAnswer()"
              >
                <span>🚀</span> ¡Enviar Respuesta!
              </button>
            </div>

            <!-- Feedback de Espera Flotante -->
            <div id="answer-feedback-panel" style="display: none; width: 100%; margin-top: 1rem;"></div>
          </div>
        ` : `
          <!-- Pads Táctiles Gigantes con Respuestas Aleatorizadas por Estudiante y Figuras TE RETO -->
          <div class="kahoot-player-grid ${isTwoOptions ? 'two-options' : ''}" id="player-pads-grid">
            ${displayOptions.map((opt, displayIdx) => {
              const shapeDef = this.getShapeDef(displayIdx);
              return `
                <button 
                  type="button" 
                  class="kahoot-player-pad ${shapeDef.colorClass}" 
                  id="player-pad-${displayIdx}"
                  title="${shapeDef.name}: ${this.escapeAttr(this.getOptionText(opt))}"
                  onclick="window.GameView.handleSelectAnswer(${displayIdx})"
                  style="cursor: pointer;"
                >
                  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.45rem; width: 100%; height: 100%; padding: 0.85rem; text-align: center; box-sizing: border-box;">
                    <div class="pad-shape" style="height: auto; width: auto;">${shapeDef.svg}</div>
                    <div class="pad-option-text" style="color: #ffffff; font-weight: 800; font-size: clamp(0.95rem, 2.5vw, 1.3rem); line-height: 1.25; text-shadow: 0 2px 10px rgba(0,0,0,0.85); max-width: 95%; word-break: break-word;">
                      ${this.escapeHtml(this.getOptionText(opt))}
                    </div>
                  </div>
                </button>
              `;
            }).join('')}
          </div>

          <!-- Feedback de Espera Flotante -->
          <div id="answer-feedback-panel" style="display: none;"></div>
        `}
      </div>
    `;

    if (isTextOrOpen) {
      setTimeout(() => {
        const inp = document.getElementById('player-text-input');
        if (inp) inp.focus();
      }, 100);
    }
  },

  /* ⚡ MODO SOLITARIO (PRÁCTICA CON FORMAS TE RETO) */
  renderSoloQuestion(container, q) {
    const isTwoOptions = (q.options || []).length === 2;
    const isTextOrOpen = q.type === 'text' || q.type === 'open';
    const localPlayer = this.room?.players?.[0];
    const currentScore = localPlayer?.score || 0;
    const streak = localPlayer?.streak || 0;

    // 🎲 Variación / Aleatorización de opciones para práctica
    const rawOptions = q.options || [];
    let displayOptions = rawOptions;
    this.playerOptionMapping = null;

    if (rawOptions.length > 1 && !isTextOrOpen) {
      const indices = rawOptions.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      this.playerOptionMapping = indices;
      displayOptions = indices.map(idx => rawOptions[idx]);
    }

    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; padding: 1.5rem 1rem 4rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span style="font-weight: 800; font-size: 1.1rem; color: var(--neon-cyan);">
              Pregunta ${this.currentQuestionIndex + 1} de ${this.challenge.questions.length}
            </span>
            <span class="badge-tag" style="background: rgba(255,183,3,0.15); border: 1px solid rgba(255,183,3,0.4); color: #ffb703; font-weight: 800; font-size: 0.95rem; padding: 0.35rem 0.85rem; border-radius: 9999px;">
              🏆 <span id="player-score-val">${currentScore}</span> PTS
            </span>
          </div>

          <div class="combo-gauge">
            <span>⚡</span> Racha: ${streak}
          </div>

          <div style="font-size: 1.4rem; font-weight: 900; color: var(--neon-gold); background: rgba(0,0,0,0.4); padding: 0.4rem 1rem; border-radius: 9999px; border: 1px solid var(--border-color);">
            ⏱️ <span id="timer-text">${this.timeLeft}</span>s
          </div>
        </div>

        <div class="kahoot-host-question-banner">
          ${q.text}
        </div>

        ${q.media && q.mediaType === 'image' ? `
          <div style="text-align: center; margin-bottom: 1.5rem;">
            <img src="${q.media}" alt="Pregunta" style="max-height: 250px; border-radius: 12px; box-shadow: var(--shadow-md); object-fit: contain;" />
          </div>
        ` : ''}

        ${isTextOrOpen ? `
          <div class="player-text-input-container">
            <div class="player-text-input-card">
              <div style="font-size: 2.6rem; margin-bottom: 0.5rem;">
                ${q.type === 'open' ? '💬' : '✍️'}
              </div>
              <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary); margin: 0 0 0.4rem;">
                ${q.type === 'open' ? 'Respuesta Abierta' : 'Respuesta Corta'}
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.92rem; margin: 0 0 1.25rem;">
                ${q.type === 'open' 
                  ? 'Escribe tu idea u opinión libremente. ¡Todas las respuestas suman puntos!' 
                  : 'Escribe la respuesta esperada antes de que acabe el tiempo.'}
              </p>

              <div style="width: 100%; margin-bottom: 1.25rem;">
                ${q.type === 'open' ? `
                  <textarea 
                    id="player-text-input" 
                    class="player-text-field"
                    rows="3"
                    placeholder="Escribe aquí tu pensamiento, idea o respuesta..."
                    maxlength="280"
                    style="resize: none; font-family: inherit;"
                    onkeydown="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); window.GameView.handleTextAnswer(); }"
                  ></textarea>
                ` : `
                  <input 
                    type="text" 
                    id="player-text-input" 
                    class="player-text-field"
                    placeholder="Escribe tu respuesta aquí..."
                    maxlength="90"
                    autocomplete="off"
                    onkeydown="if(event.key === 'Enter') { event.preventDefault(); window.GameView.handleTextAnswer(); }"
                  />
                `}
              </div>

              <button 
                type="button" 
                id="btn-submit-text-answer" 
                class="btn btn-primary btn-lg" 
                style="width: 100%; padding: 0.95rem; font-size: 1.15rem; font-weight: 900; border-radius: 14px; background: linear-gradient(135deg, var(--neon-cyan), #0077b6); border: none; box-shadow: 0 6px 20px rgba(0, 245, 212, 0.4); cursor: pointer;"
                onclick="window.GameView.handleTextAnswer()"
              >
                <span>🚀</span> ¡Enviar Respuesta!
              </button>
            </div>
            <div id="answer-feedback-panel" style="display: none; width: 100%; margin-top: 1rem;"></div>
          </div>
        ` : `
          <div class="kahoot-answers-grid ${isTwoOptions ? 'two-options' : ''}" id="solo-answers-grid">
            ${displayOptions.map((opt, displayIdx) => {
              const shapeDef = this.getShapeDef(displayIdx);
              return `
                <button 
                  type="button" 
                  class="kahoot-answer-card ${shapeDef.colorClass}" 
                  id="opt-btn-${displayIdx}"
                  style="cursor: pointer; width: 100%;"
                  onclick="window.GameView.handleSelectAnswer(${displayIdx})"
                >
                  <span class="kahoot-shape">${shapeDef.svg}</span>
                  <span class="kahoot-card-text">${this.escapeHtml(this.getOptionText(opt))}</span>
                </button>
              `;
            }).join('')}
          </div>
        `}

        <div id="answer-feedback-panel" style="display: none; margin-top: 1.5rem; text-align: center;"></div>
      </div>
    `;

    if (isTextOrOpen) {
      setTimeout(() => {
        const inp = document.getElementById('player-text-input');
        if (inp) inp.focus();
      }, 100);
    }

    setTimeout(() => {
      this.adjustCardAndBannerTextSizes();
    }, 60);
  },

  adjustCardAndBannerTextSizes() {
    // 1. Ajustar banner si la pregunta es extensa para que se lea completa sin cortes
    const banner = document.querySelector('.kahoot-host-question-banner');
    if (banner) {
      const qLen = (banner.textContent || '').trim().length;
      if (qLen > 180) {
        banner.style.fontSize = '1.2rem';
        banner.style.lineHeight = '1.3';
        banner.style.padding = '1rem 1.25rem';
      } else if (qLen > 110) {
        banner.style.fontSize = '1.4rem';
        banner.style.lineHeight = '1.35';
        banner.style.padding = '1.15rem 1.5rem';
      } else if (qLen > 65) {
        banner.style.fontSize = '1.65rem';
      }
    }

    // 2. Ajustar opciones para que se lean completas
    document.querySelectorAll('.kahoot-card-text').forEach(el => {
      const len = (el.textContent || '').trim().length;
      if (len > 120) {
        el.style.fontSize = '0.85rem';
        el.style.lineHeight = '1.25';
      } else if (len > 80) {
        el.style.fontSize = '0.95rem';
        el.style.lineHeight = '1.3';
      } else if (len > 50) {
        el.style.fontSize = '1.08rem';
        el.style.lineHeight = '1.32';
      } else if (len > 30) {
        el.style.fontSize = '1.2rem';
      } else {
        el.style.fontSize = '1.35rem';
      }
    });
  },

  skipTimer() {
    if (this.questionFinished) return;
    if (this.timerInterval) clearInterval(this.timerInterval);
    window.realtimeEngine.clearBotTimeouts();
    this.finishQuestionHost();
  },

  startQuestionTimer() {
    if (this.timerInterval) clearInterval(this.timerInterval);

    const textEl = document.getElementById('timer-text');
    const hostTimerNum = document.getElementById('host-timer-num');
    const hostTimerCircle = document.getElementById('host-timer-circle');

    this.timerInterval = setInterval(() => {
      this.timeLeft--;

      if (textEl) textEl.textContent = Math.max(0, this.timeLeft);
      if (hostTimerNum) {
        hostTimerNum.textContent = Math.max(0, this.timeLeft);
        if (this.timeLeft <= 5 && hostTimerCircle) {
          hostTimerCircle.classList.add('urgent');
        }
      }

      if (this.timeLeft <= 5) {
        window.soundEngine.playUrgentTick();
      } else {
        window.soundEngine.playTick();
      }

      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.timeExpired();
      }
    }, 1000);
  },

  bindKeyboardShortcuts() {
    const handler = (e) => {
      if (this.hasAnswered || this.timeLeft <= 0 || this.questionFinished) return;
      const key = e.key;
      if (['1', '2', '3', '4', '5', '6'].includes(key)) {
        const index = parseInt(key) - 1;
        const btn = document.getElementById(`opt-btn-${index}`);
        if (btn) this.handleSelectAnswer(index);
      }
    };
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    this.keyHandler = handler;
    window.addEventListener('keydown', this.keyHandler);
  },

  handleTextAnswer() {
    if (this.hasAnswered || this.timeLeft <= 0 || this.questionFinished) return;
    const input = document.getElementById('player-text-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      input.focus();
      return;
    }
    input.setAttribute('disabled', 'true');
    const submitBtn = document.getElementById('btn-submit-text-answer');
    if (submitBtn) {
      submitBtn.setAttribute('disabled', 'true');
      submitBtn.innerHTML = `<span>✓</span> ¡Enviada!`;
      submitBtn.style.opacity = '0.75';
    }

    this.handleSelectAnswer(text);
  },

  renderLiveTextAnswerOnHost(playerId, answerText) {
    const grid = document.getElementById('host-live-answers-grid');
    if (!grid) return;

    // Quitar caja vacía de espera
    const emptyBox = document.getElementById('host-text-empty-box');
    if (emptyBox) emptyBox.remove();

    // Si ya existe la tarjeta para este jugador, actualizar texto
    const existing = document.getElementById(`host-live-card-${playerId}`);
    if (existing) {
      const bubble = existing.querySelector('.host-live-answer-bubble');
      if (bubble) bubble.textContent = `"${answerText || ''}"`;
      return;
    }

    const player = this.room?.players?.find(p => p.id === playerId) || {
      nickname: 'Estudiante',
      avatar: '🎓'
    };

    const card = document.createElement('div');
    card.className = 'host-live-answer-card';
    card.id = `host-live-card-${playerId}`;
    card.innerHTML = `
      <div class="host-live-answer-author">
        <div class="host-live-author-avatar">${player.avatar || '🎓'}</div>
        <div class="host-live-author-name">${this.escapeHtml(player.nickname || 'Estudiante')}</div>
      </div>
      <div class="host-live-answer-bubble">
        "${this.escapeHtml(String(answerText || ''))}"
      </div>
    `;

    grid.appendChild(card);
    if (window.soundEngine && window.soundEngine.playPop) {
      window.soundEngine.playPop();
    }

    grid.scrollTop = grid.scrollHeight;

    const count = grid.querySelectorAll('.host-live-answer-card').length;
    const counterPill = document.getElementById('host-live-answers-count');
    if (counterPill) counterPill.textContent = count;
    const hostRespNum = document.getElementById('host-responses-num');
    if (hostRespNum) hostRespNum.textContent = count;
  },

  handleSelectAnswer(index) {
    if (this.hasAnswered || this.timeLeft <= 0 || this.questionFinished) return;
    this.hasAnswered = true;

    const displayIndex = index;
    let originalIndex = index;
    if (typeof index === 'number' && this.playerOptionMapping && this.playerOptionMapping[index] !== undefined) {
      originalIndex = this.playerOptionMapping[index];
    }
    this.selectedAnswer = originalIndex;

    const timeTaken = Math.max(0.1, (Date.now() - this.questionStartTime) / 1000);
    const q = this.challenge.questions[this.currentQuestionIndex];

    // Marcar visualmente botón seleccionado y desactivar los demás
    document.querySelectorAll('.game-answer-btn, .kahoot-player-pad, .kahoot-answer-card').forEach((b, i) => {
      b.setAttribute('disabled', 'true');
      if (i === displayIndex) {
        b.classList.add('selected');
        b.classList.remove('dimmed');
      } else {
        b.classList.add('dimmed');
      }
    });
    const chosenBtn = document.getElementById(`player-pad-${displayIndex}`) || document.getElementById(`opt-btn-${displayIndex}`);
    if (chosenBtn) {
      chosenBtn.classList.remove('dimmed');
      chosenBtn.classList.add('selected');
    }

    if (this.isSolo) {
      // ⚡ MODO SOLITARIO:
      // Se detiene el reloj inmediatamente (aunque falten 20s)
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.questionFinished = true;

      const p = this.room.players[0];
      const res = window.realtimeEngine.processAnswer('solo_player', originalIndex, timeTaken, q);

      let isCorr = false;
      if (q.type === 'poll' || q.type === 'open') {
        isCorr = true;
      } else if (q.type === 'text') {
        const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const userText = norm(String(originalIndex));
        const accepted = (q.acceptedAnswers && q.acceptedAnswers.length > 0) ? q.acceptedAnswers : [q.correctAnswer];
        isCorr = accepted.some(a => norm(String(a)) === userText);
      } else if (Array.isArray(q.correctAnswer)) {
        isCorr = q.correctAnswer.includes(originalIndex);
      } else {
        isCorr = originalIndex === q.correctAnswer;
      }
      let ptsEarned = (isCorr || q.type === 'poll' || q.type === 'open') ? Math.round((q.points !== undefined ? q.points : 1000) * (0.5 + 0.5 * Math.max(0, (q.timeLimit || 20) - timeTaken) / (q.timeLimit || 20))) : 0;
      let comboMult = 1;

      if (res) {
        isCorr = res.isCorrect;
        ptsEarned = res.pointsEarned;
        comboMult = res.comboMultiplier || 1;
      } else {
        // Fallback directo sobre el objeto de jugador local
        if (isCorr) {
          p.streak = (p.streak || 0) + 1;
          p.correctCount = (p.correctCount || 0) + 1;
          p.score = (p.score || 0) + ptsEarned;
          if (p.streak > (p.maxStreak || 0)) p.maxStreak = p.streak;
        } else {
          p.streak = 0;
        }
        p.answersCount = (p.answersCount || 0) + 1;
        if (!p.answers) p.answers = [];
        p.answers.push({ questionId: q.id, answerIndex: index, isCorrect: isCorr, pointsEarned: ptsEarned, timeTaken });
      }

      const responses = {
        'solo_player': {
          answerIndex: index,
          isCorrect: isCorr,
          pointsEarned: ptsEarned,
          timeTaken: timeTaken,
          comboMultiplier: comboMult
        }
      };
      this.room.responses = responses;

      if (this.gameMode && this.gameMode !== 'clasico') {
        // En modo solo con experiencia especial (ej: tiro_perfecto):
        // Permitir que el estudiante interactúe con el minijuego del modo antes de ver estadísticas
        this.pendingSoloResults = {
          responses: responses,
          correctAnswer: q.correctAnswer
        };
        this.showWaitingFeedback();
      } else {
        // Muestra feedback y estadísticas de inmediato sin demoras
        this.revealQuestionResults({
          responses: responses,
          correctAnswer: q.correctAnswer
        });
      }
    } else if (this.isHost) {
      // 👥 MODO MULTIJUGADOR (ANFITRIÓN):
      // El host no responde
    } else {
      // 👥 MODO MULTIJUGADOR (CLIENTE REMOTO):
      if (window.realtimeEngine.sendAnswer) {
        window.realtimeEngine.sendAnswer(originalIndex, timeTaken);
      }
      window.realtimeEngine.broadcast({
        type: 'PLAYER_ANSWER',
        pin: this.room.pin,
        playerId: window.realtimeEngine.localPlayer?.id,
        answerIndex: originalIndex,
        timeTaken: timeTaken
      });

      // Mostrar estado de espera sincronizado con minijuego del modo
      this.showWaitingFeedback();
    }
  },

  continueSoloToResults() {
    if (this.pendingSoloResults) {
      const res = this.pendingSoloResults;
      this.pendingSoloResults = null;
      const panel = document.getElementById('answer-feedback-panel');
      if (panel) panel.style.display = 'none';
      this.revealQuestionResults(res);
    }
  },

  showWaitingFeedback() {
    const panel = document.getElementById('answer-feedback-panel');
    if (!panel) return;

    if (window.soundEngine && window.soundEngine.playClick) {
      window.soundEngine.playClick();
    }
    const isTextAnswer = typeof this.selectedAnswer === 'string';
    const mode = this.gameMode || 'clasico';
    const modeActionHtml = this.renderModeWaitingAction(mode);

    panel.innerHTML = `
      <div class="glass-panel" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 1.35rem 1.6rem; background: rgba(11, 15, 25, 0.98); border: 2px solid var(--neon-cyan); border-radius: 20px; box-shadow: 0 15px 45px rgba(0,0,0,0.85); z-index: 50; text-align: center; pointer-events: auto; max-width: 95%; width: 440px; max-height: 90vh; overflow-y: auto;">
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem; margin-bottom: 0.35rem;">
          <span style="font-size: 1.5rem; color: var(--neon-cyan); line-height: 1;">✓</span>
          <span style="font-size: 1.25rem; font-weight: 900; color: var(--text-primary);">¡Respuesta Registrada!</span>
        </div>
        ${isTextAnswer ? `
          <div style="background: rgba(0,0,0,0.4); border-left: 3px solid var(--neon-cyan); padding: 0.5rem 0.75rem; border-radius: 8px; margin: 0.5rem 0; font-size: 0.9rem; color: var(--text-primary); font-style: italic; word-break: break-word; text-align: left;">
            "${this.escapeHtml(this.selectedAnswer)}"
          </div>
        ` : ''}

        <!-- CONTENEDOR DE MECÁNICA INTERACTIVA DEL MODO -->
        <div id="mode-interactive-action-container" style="margin: 0.5rem 0;">
          ${modeActionHtml}
        </div>

        ${this.isSolo ? `
          <button 
            type="button" 
            id="btn-solo-skip-to-results" 
            class="btn btn-outline" 
            style="width: 100%; margin-top: 0.6rem; padding: 0.6rem; font-size: 0.9rem; font-weight: 800;"
            onclick="window.GameView.continueSoloToResults()"
          >
            ➡️ Continuar a Estadísticas
          </button>
        ` : ''}
      </div>
    `;
    panel.style.display = 'block';
  },

  throwDart(event) {
    if (this.dartThrown) return;
    this.dartThrown = true;

    const board = document.getElementById('target-dartboard');
    const crosshair = document.getElementById('dart-crosshair');
    const projectile = document.getElementById('dart-projectile');
    const resultBox = document.getElementById('dart-result-box');
    const throwBtn = document.getElementById('btn-throw-dart');

    if (throwBtn) {
      throwBtn.disabled = true;
      throwBtn.style.opacity = '0.6';
      throwBtn.innerHTML = '🎯 ¡Dardo Clavado en el Blanco!';
    }

    let clickX = 105;
    let clickY = 105;

    if (board) {
      const boardRect = board.getBoundingClientRect();
      if (crosshair) {
        const crossRect = crosshair.getBoundingClientRect();
        clickX = Math.round(crossRect.left + crossRect.width / 2 - boardRect.left);
        clickY = Math.round(crossRect.top + crossRect.height / 2 - boardRect.top);
      } else if (event && event.clientX) {
        clickX = Math.round(event.clientX - boardRect.left);
        clickY = Math.round(event.clientY - boardRect.top);
      }
      clickX = Math.max(15, Math.min(boardRect.width - 15, clickX));
      clickY = Math.max(15, Math.min(boardRect.height - 15, clickY));
    }

    if (crosshair) {
      crosshair.style.animation = 'none';
      crosshair.style.left = `${clickX}px`;
      crosshair.style.top = `${clickY}px`;
      crosshair.style.transform = 'translate(-50%, -50%)';
    }

    if (projectile) {
      projectile.style.left = `${clickX}px`;
      projectile.style.top = `${clickY}px`;
      projectile.style.transform = 'translate(-50%, -50%) scale(1.15)';
      projectile.style.opacity = '1';
    }

    const centerX = board ? board.offsetWidth / 2 : 105;
    const centerY = board ? board.offsetHeight / 2 : 105;
    const dx = clickX - centerX;
    const dy = clickY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const maxRadius = centerX;
    const ratio = dist / maxRadius;

    let bonusPts = 150;
    let hitTitle = '🎯 ¡EN EL BLANCO!';
    let hitColor = '#38bdf8';
    let hitBadge = '¡Impacto en la diana!';

    if (ratio <= 0.22) {
      bonusPts = 500;
      hitTitle = '🎯 ¡DIANA PERFECTA! (BULLSEYE)';
      hitColor = '#ffd166';
      hitBadge = '¡Precisión legendaria en el centro de oro!';
    } else if (ratio <= 0.52) {
      bonusPts = 300;
      hitTitle = '🎯 ¡TIRO CERTERO!';
      hitColor = '#00f5d4';
      hitBadge = '¡Gran puntería en los anillos interiores!';
    } else {
      bonusPts = 150;
      hitTitle = '🎯 ¡EN EL BLANCO!';
      hitColor = '#f72585';
      hitBadge = '¡Buen lanzamiento en el blanco!';
    }

    if (window.soundEngine && window.soundEngine.playPowerup) {
      window.soundEngine.playPowerup();
    }

    if (resultBox) {
      resultBox.innerHTML = `
        <div class="dart-hit-badge" style="border-color: ${hitColor};">
          <div style="font-weight: 900; font-size: 1rem; color: ${hitColor};">${hitTitle}</div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #ffd166; margin-top: 0.2rem;">+${bonusPts} PUNTOS EXTRA</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.15rem;">${hitBadge}</div>
        </div>
      `;
      resultBox.style.display = 'block';
    }

    // Sumar puntos al jugador
    if (this.isSolo) {
      const p = this.room?.players?.[0];
      if (p) {
        p.score = (p.score || 0) + bonusPts;
        const scoreVal = document.getElementById('player-score-val');
        if (scoreVal) scoreVal.textContent = p.score;
      }
      setTimeout(() => {
        this.continueSoloToResults();
      }, 1900);
    } else {
      const p = window.realtimeEngine.localPlayer;
      if (p) {
        p.score = (p.score || 0) + bonusPts;
        const scoreVal = document.getElementById('player-score-val');
        if (scoreVal) scoreVal.textContent = p.score;
      }
      window.realtimeEngine.broadcast({
        type: 'PLAYER_MODE_ACTION',
        pin: this.room?.pin || window.realtimeEngine.currentRoom?.pin,
        playerId: p?.id,
        playerName: p?.nickname || 'Estudiante',
        avatar: p?.avatar || '🎯',
        modeId: 'tiro_perfecto',
        bonusPoints: bonusPts,
        detail: hitTitle
      });
    }
  },

  performModeAction(modeId, actionType) {
    if (this.modeActionDone) return;
    this.modeActionDone = true;

    let bonusPts = 300;
    let actionTitle = '¡ACCIÓN COMPLETADA!';
    let detail = '¡Bonificación del modo de juego!';

    switch (modeId) {
      case 'bomba_preguntas':
        bonusPts = 300;
        actionTitle = '💣 ¡BOMBA DESACTIVADA!';
        detail = '¡Cable cortado justo a tiempo!';
        break;
      case 'reto_misterioso':
        bonusPts = 350;
        actionTitle = '💎 ¡COFRE DESBLOQUEADO!';
        detail = '¡Has encontrado gemas de conocimiento!';
        break;
      case 'turbo_quiz':
        bonusPts = 350;
        actionTitle = '🏎️ ¡NITRO ACTIVADO A 350 KM/H!';
        detail = '¡Aceleración supersónica!';
        break;
      case 'mision_espacial':
        bonusPts = 400;
        actionTitle = '🌌 ¡SALTO HIPERESPACIAL!';
        detail = '¡Coordenadas estelares alcanzadas!';
        break;
      case 'mundo_sorpresa':
        bonusPts = 350;
        actionTitle = '🎰 ¡RULETA PREMIADA!';
        detail = '¡La fortuna sonríe a tu esfuerzo!';
        break;
      case 'ultimo_superviviente':
        bonusPts = 250;
        actionTitle = '🛡️ ¡ESCUDO REFORZADO!';
        detail = '¡Defensas recargadas al 100%!';
        break;
      case 'carrera_relampago':
        bonusPts = 300;
        actionTitle = '⚡ ¡SOBRECARGA RELÁMPAGO!';
        detail = '¡Descarga a la velocidad de la luz!';
        break;
      case 'conquista':
        bonusPts = 300;
        actionTitle = '🏰 ¡TERRITORIO CONQUISTADO!';
        detail = '¡Bandera de victoria izada!';
        break;
      case 'rey_del_reto':
        bonusPts = 350;
        actionTitle = '👑 ¡CORONA DEL REY ASEGURADA!';
        detail = '¡Dominio sobre el tablero!';
        break;
      case 'desafio_volcanico':
        bonusPts = 300;
        actionTitle = '🌋 ¡CRISTAL DE LAVA OBTENIDO!';
        detail = '¡Poder ígneo asegurado!';
        break;
      case 'duelo_mental':
        bonusPts = 300;
        actionTitle = '🧠 ¡ONDA MENTAL MÁXIMA!';
        detail = '¡Concentración total demostrada!';
        break;
      case 'rompecabezas':
        bonusPts = 300;
        actionTitle = '🧩 ¡PIEZA MAESTRA ENCAJADA!';
        detail = '¡El misterio se va revelando!';
        break;
      default:
        bonusPts = 150;
        actionTitle = '⚡ ¡ENERGÍA ENVIADA AL PODIO!';
        detail = '¡Puntos de participación acumulados!';
        break;
    }

    if (window.soundEngine && window.soundEngine.playPowerup) {
      window.soundEngine.playPowerup();
    }

    const resBox = document.getElementById('mode-action-result-box');
    if (resBox) {
      resBox.innerHTML = `
        <div class="dart-hit-badge" style="border-color: #00f5d4;">
          <div style="font-weight: 900; font-size: 1rem; color: #00f5d4;">${actionTitle}</div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #ffd166; margin-top: 0.2rem;">+${bonusPts} PUNTOS EXTRA</div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.15rem;">${detail}</div>
        </div>
      `;
      resBox.style.display = 'block';
    }

    const btn = document.getElementById('btn-mode-generic-action');
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.6';
      btn.innerHTML = `<span>✓</span> ${actionTitle}`;
    }

    // Sumar puntos al jugador
    if (this.isSolo) {
      const p = this.room?.players?.[0];
      if (p) {
        p.score = (p.score || 0) + bonusPts;
        const scoreVal = document.getElementById('player-score-val');
        if (scoreVal) scoreVal.textContent = p.score;
      }
      setTimeout(() => {
        this.continueSoloToResults();
      }, 1900);
    } else {
      const p = window.realtimeEngine.localPlayer;
      if (p) {
        p.score = (p.score || 0) + bonusPts;
        const scoreVal = document.getElementById('player-score-val');
        if (scoreVal) scoreVal.textContent = p.score;
      }
      window.realtimeEngine.broadcast({
        type: 'PLAYER_MODE_ACTION',
        pin: this.room?.pin || window.realtimeEngine.currentRoom?.pin,
        playerId: p?.id,
        playerName: p?.nickname || 'Estudiante',
        avatar: p?.avatar || '⚡',
        modeId: modeId,
        bonusPoints: bonusPts,
        detail: actionTitle
      });
    }
  },

  renderModeWaitingAction(modeId) {
    if (modeId === 'tiro_perfecto') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 0.95rem; font-weight: 900; color: #ef4444; margin-bottom: 0.35rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
            <span>🎯</span> MODO TIRO PERFECTO: ¡LANZA AL BLANCO!
          </div>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin: 0 0 0.65rem;">
            ¡Apunta a la diana para ganar hasta +500 PTS extra de precisión!
          </p>

          <div class="target-dartboard-wrapper" id="target-dartboard" onclick="window.GameView.throwDart(event)">
            <div class="dart-crosshair-reticle" id="dart-crosshair"></div>
            <div class="flying-dart-projectile" id="dart-projectile">🎯</div>
            <svg viewBox="0 0 200 200" width="100%" height="100%">
              <circle cx="100" cy="100" r="96" fill="#f8fafc" stroke="#cbd5e1" stroke-width="3" />
              <circle cx="100" cy="100" r="76" fill="#0f172a" stroke="#334155" stroke-width="2" />
              <circle cx="100" cy="100" r="50" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
              <circle cx="100" cy="100" r="28" fill="#ef4444" stroke="#fca5a5" stroke-width="2" />
              <circle cx="100" cy="100" r="12" fill="#ffd166" stroke="#ffffff" stroke-width="2" />
              <circle cx="100" cy="100" r="4" fill="#ffffff" />
            </svg>
          </div>

          <div id="dart-result-box" style="display: none; margin-bottom: 0.65rem;"></div>

          <button 
            type="button" 
            id="btn-throw-dart" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 1rem; font-weight: 900; background: linear-gradient(135deg, #ef4444, #f59e0b); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.throwDart(event)"
          >
            🎯 ¡LANZAR DARDO AL BLANCO!
          </button>
        </div>
      `;
    }

    if (modeId === 'bomba_preguntas') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 0.95rem; font-weight: 900; color: #f59e0b; margin-bottom: 0.35rem;">
            💣 ¡BOMBA ACTIVADA!
          </div>
          <div class="fuse-burning-bar" style="margin: 0.65rem 0 1rem;"></div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #ef4444, #b45309); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('bomba_preguntas', 'defuse')"
          >
            ✂️ ¡CORTAR CABLE Y DESACTIVAR BOMBA (+300 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'reto_misterioso') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🗝️📦</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #ffd166; margin-bottom: 0.35rem;">
            COFRE DEL RETO MISTERIOSO
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #7c3aed, #ffd166); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('reto_misterioso', 'open_chest')"
          >
            ✨ ¡ABRIR COFRE MISTERIOSO (+350 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'turbo_quiz') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🏎️💨</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #ff5400; margin-bottom: 0.35rem;">
            TURBO QUIZ: INYECCIÓN NITRO
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #ff5400, #ffb703); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('turbo_quiz', 'boost')"
          >
            🔥 ¡ACTIVAR NITRO SUPERSONIC (+350 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'mision_espacial') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🚀🌌</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #00f5d4; margin-bottom: 0.35rem;">
            MISIÓN ESPACIAL: PROPULSORES ESTELARES
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #3a0ca3, #00f5d4); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('mision_espacial', 'warp')"
          >
            ☄️ ¡ACTIVAR SALTO HIPERESPACIAL (+400 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'mundo_sorpresa') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🎰🌀</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #ec4899; margin-bottom: 0.35rem;">
            RULETA DEL MUNDO SORPRESA
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #701a75, #ec4899); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('mundo_sorpresa', 'spin')"
          >
            🎲 ¡GIRAR RULETA DE PREMIOS (+350 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'ultimo_superviviente') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">🛡️❤️</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #f43f5e; margin-bottom: 0.35rem;">
            ESCUDO DE SUPERVIVENCIA
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #881337, #f43f5e); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('ultimo_superviviente', 'shield')"
          >
            🛡️ ¡ACTIVAR ESCUDO PROTECTOR (+250 PTS)!
          </button>
        </div>
      `;
    }

    if (modeId === 'carrera_relampago') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">⚡⚡</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: #ffd166; margin-bottom: 0.35rem;">
            DESCARGA RELÁMPAGO VELOZ
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: linear-gradient(135deg, #b45309, #ffd166); border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('carrera_relampago', 'zap')"
          >
            ⚡ ¡DESCARGA ELÉCTRICA VELOZ (+300 PTS)!
          </button>
        </div>
      `;
    }

    const currentMode = window.GameModes ? window.GameModes.getMode(modeId) : null;
    if (currentMode && modeId !== 'clasico') {
      return `
        <div class="interactive-mode-panel" style="padding: 1rem; border-radius: 16px; margin: 0.5rem 0;">
          <div style="font-size: 2.2rem; margin-bottom: 0.35rem;">${currentMode.icon}</div>
          <div style="font-size: 0.95rem; font-weight: 900; color: ${currentMode.themeColor || 'var(--neon-cyan)'}; margin-bottom: 0.35rem;">
            ${currentMode.name}
          </div>
          <div id="mode-action-result-box" style="display: none; margin-bottom: 0.65rem;"></div>
          <button 
            type="button" 
            id="btn-mode-generic-action" 
            class="btn btn-primary mode-action-btn-glow" 
            style="width: 100%; padding: 0.8rem; font-size: 0.95rem; font-weight: 900; background: ${currentMode.gradient || 'linear-gradient(135deg, #4c1d95, #00f5d4)'}; border: none; border-radius: 12px; cursor: pointer;"
            onclick="window.GameView.performModeAction('${modeId}', 'trigger')"
          >
            ✨ ¡ACTIVAR BONO DE MODO (+300 PTS)!
          </button>
        </div>
      `;
    }

    return `
      <div class="interactive-mode-panel" style="padding: 0.85rem; border-radius: 14px; margin: 0.5rem 0; background: rgba(0,0,0,0.35); border-color: rgba(255,255,255,0.15);">
        <div style="font-size: 1.8rem; margin-bottom: 0.25rem;">🏆</div>
        <div style="font-size: 0.88rem; font-weight: 800; color: var(--neon-cyan); margin-bottom: 0.4rem;">
          ENERGÍA COMPETITIVA
        </div>
        <div id="mode-action-result-box" style="display: none; margin-bottom: 0.5rem;"></div>
        <button 
          type="button" 
          id="btn-mode-generic-action" 
          class="btn btn-outline" 
          style="width: 100%; padding: 0.65rem; font-size: 0.85rem; font-weight: 800;"
          onclick="window.GameView.performModeAction('clasico', 'cheer')"
        >
          ⚡ ¡ENVIAR ENERGÍA AL PODIO (+150 PTS)!
        </button>
      </div>
    `;
  },

  showHostModeActionToast(data) {
    let container = document.getElementById('host-mode-actions-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'host-mode-actions-toast-container';
      container.style.cssText = 'position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; pointer-events: none; max-width: 360px;';
      document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'glass-panel';
    toast.style.cssText = 'background: rgba(15, 23, 42, 0.95); border: 2px solid var(--neon-cyan); padding: 0.75rem 1rem; border-radius: 14px; box-shadow: 0 10px 30px rgba(0,0,0,0.7); display: flex; align-items: center; gap: 0.75rem; animation: bounce-in 0.35s ease; pointer-events: auto;';
    toast.innerHTML = `
      <div style="font-size: 1.8rem;">${data.avatar || '🎯'}</div>
      <div style="flex: 1;">
        <div style="font-weight: 900; font-size: 0.95rem; color: var(--text-primary);">${this.escapeHtml(data.playerName || 'Estudiante')}</div>
        <div style="font-size: 0.82rem; color: var(--neon-gold); font-weight: 800;">${this.escapeHtml(data.detail || '¡Acción realizada!')} (+${data.bonusPoints || 0} pts)</div>
      </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(20px)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  },

  onAnswerReceived(data) {
    if (this.questionFinished) return;
    const totalResponses = Object.keys(this.room?.responses || {}).length;
    const totalPlayers = this.room?.players?.length || 1;

    // Actualizar muro en vivo si es pregunta de texto o respuesta abierta
    const q = this.challenge.questions[this.currentQuestionIndex];
    if (data && (q?.type === 'text' || q?.type === 'open')) {
      this.renderLiveTextAnswerOnHost(data.playerId, data.answerIndex);
    }

    // Actualizar contador en la pantalla del host
    this.updateResponseCounter(totalResponses, totalPlayers);

    // Enviar progreso en tiempo real a todos los clientes
    window.realtimeEngine.broadcast({
      type: 'ROOM_ANSWER_PROGRESS',
      pin: this.room.pin,
      totalResponses: totalResponses,
      totalPlayers: totalPlayers
    });

    // ¡Si TODOS los jugadores han respondido antes de que acabe el tiempo!
    if (totalResponses >= totalPlayers && totalPlayers > 0) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      window.realtimeEngine.clearBotTimeouts();

      const isSpecialMode = this.gameMode && this.gameMode !== 'clasico';
      if (isSpecialMode) {
        // En modos especiales con minijuego/actividad: el maestro espera a los estudiantes
        this.waitingForModeActions = true;
        this.updateHostModeActivityBanner(this.modeActionsCount || 0, totalPlayers);

        // Si ya todos completaron la actividad del modo:
        if ((this.modeActionsCount || 0) >= totalPlayers) {
          setTimeout(() => {
            this.finishQuestionHost();
          }, 1200);
        }
      } else {
        // Modo clásico: pasar a resultados tras breve pausa
        setTimeout(() => {
          this.finishQuestionHost();
        }, 500);
      }
    }
  },

  updateHostModeActivityBanner(completedCount, totalPlayers) {
    if (!this.isHost) return;
    const mode = window.GameModes ? window.GameModes.getMode(this.gameMode) : null;
    const modeName = mode ? mode.name : 'Modo';
    let banner = document.getElementById('host-mode-activity-banner');
    if (!banner) {
      const stage = document.querySelector('.kahoot-host-stage');
      if (stage && stage.parentNode) {
        banner = document.createElement('div');
        banner.id = 'host-mode-activity-banner';
        banner.style.cssText = 'margin: 1rem auto 1.5rem; max-width: 750px; padding: 0.85rem 1.4rem; border-radius: 14px; background: rgba(0, 245, 212, 0.12); border: 2px solid var(--neon-cyan); display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; box-shadow: 0 0 25px rgba(0,245,212,0.25); animation: bounce-in 0.3s ease;';
        stage.parentNode.insertBefore(banner, stage);
      }
    }
    if (banner) {
      banner.style.display = 'flex';
      const allDone = completedCount >= totalPlayers;
      banner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <span style="font-size: 1.8rem; animation: timer-pulse 1s infinite alternate;">${mode?.icon || '🎮'}</span>
          <div>
            <div style="font-weight: 900; font-size: 1.05rem; color: var(--neon-cyan); text-transform: uppercase;">
              ${allDone ? '¡Actividad del Modo Completada!' : `Actividad de ${modeName} en curso`}
            </div>
            <div style="font-size: 0.88rem; color: var(--text-secondary); margin-top: 0.15rem;">
              ${allDone ? 'Todos los estudiantes completaron la acción' : 'Esperando a que los estudiantes terminen la mecánica del modo...'}
            </div>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 0.85rem;">
          <span style="background: rgba(255, 209, 102, 0.2); border: 1.5px solid #ffd166; color: #ffd166; font-weight: 900; font-size: 1rem; padding: 0.35rem 0.85rem; border-radius: 9999px;">
            ${completedCount} de ${totalPlayers} listos
          </span>
          <button class="btn btn-primary" onclick="window.GameView.finishQuestionHost()" style="padding: 0.5rem 1.1rem; font-weight: 800; font-size: 0.9rem; border-radius: 8px;">
            Ver Resultados ⏩
          </button>
        </div>
      `;
    }

    const skipBtn = document.getElementById('btn-skip-timer');
    if (skipBtn) {
      skipBtn.innerHTML = `<span>⏩</span> <span>Ver Resultados (${completedCount}/${totalPlayers})</span>`;
    }
  },

  updateResponseCounter(totalResponses, totalPlayers) {
    const counterEl = document.getElementById('responses-counter');
    if (counterEl) {
      counterEl.textContent = `👥 ${totalResponses} de ${totalPlayers} han respondido`;
    }
    const liveCount = document.getElementById('waiting-live-count');
    if (liveCount) {
      liveCount.textContent = totalResponses;
    }
    const hostRespNum = document.getElementById('host-responses-num');
    if (hostRespNum) {
      hostRespNum.textContent = totalResponses;
    }
    const hostLiveAnsCount = document.getElementById('host-live-answers-count');
    if (hostLiveAnsCount) {
      hostLiveAnsCount.textContent = totalResponses;
    }
  },

  finishQuestionHost() {
    if (this.questionFinished) return;
    this.questionFinished = true;
    if (this.timerInterval) clearInterval(this.timerInterval);
    window.realtimeEngine.clearBotTimeouts();

    const q = this.challenge.questions[this.currentQuestionIndex];
    const resultsPayload = {
      type: 'SHOW_QUESTION_RESULTS',
      pin: this.room.pin,
      questionIndex: this.currentQuestionIndex,
      responses: this.room.responses || {},
      correctAnswer: q.correctAnswer,
      players: this.room.players
    };

    // Broadcast sincronizado a todos los jugadores
    window.realtimeEngine.broadcast(resultsPayload);
    // Mostrar en la pantalla del host
    this.revealQuestionResults(resultsPayload);
  },

  timeExpired() {
    if (this.questionFinished) return;
    if (this.isHost) {
      this.finishQuestionHost();
    } else {
      this.revealQuestionResults({
        responses: this.room?.responses || {},
        correctAnswer: this.challenge.questions[this.currentQuestionIndex].correctAnswer
      });
    }
  },

  revealQuestionResults(data = {}) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.questionFinished = true;

    const q = this.challenge.questions[this.currentQuestionIndex];
    const correctIdx = (data && data.correctAnswer !== undefined) ? data.correctAnswer : q.correctAnswer;
    const responses = (data && data.responses) ? data.responses : (this.room?.responses || {});
    const isLastQuestion = this.currentQuestionIndex >= this.challenge.questions.length - 1;

    // 🎓 1. PANTALLA DEL PROFESOR / CREADOR DE LA SALA:
    if (this.isHost && !this.isSolo) {
      window.soundEngine.playFanfare();
      // El creador de la sala ve la pantalla completa con el histograma desahogado y la tabla de resumen
      this.renderFullStatsScreen(responses, correctIdx, q, null, null);
      return;
    }

    // 📱 2. PANTALLA DEL ALUMNO O MODO SOLITARIO:
    // 1. Resaltar visualmente las respuestas en los botones
    if (q.type === 'poll') {
      (q.options || []).forEach((opt, idx) => {
        const btn = document.getElementById(`opt-btn-${idx}`);
        if (btn) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('correct-highlight');
        }
      });
    } else if (Array.isArray(correctIdx)) {
      (q.options || []).forEach((opt, idx) => {
        const btn = document.getElementById(`opt-btn-${idx}`);
        if (btn) {
          btn.setAttribute('disabled', 'true');
          if (correctIdx.includes(idx)) {
            btn.classList.add('correct-highlight');
            btn.classList.remove('wrong-highlight');
          } else {
            btn.classList.add('wrong-highlight');
            btn.classList.remove('correct-highlight');
          }
        }
      });
    } else if (q.type === 'text') {
      const textInput = document.getElementById('game-text-answer-input');
      if (textInput) textInput.setAttribute('disabled', 'true');
    } else {
      (q.options || []).forEach((opt, idx) => {
        const btn = document.getElementById(`opt-btn-${idx}`);
        if (btn) {
          btn.setAttribute('disabled', 'true');
          if (idx === correctIdx) {
            btn.classList.add('correct-highlight');
            btn.classList.remove('wrong-highlight');
          } else {
            btn.classList.add('wrong-highlight');
            btn.classList.remove('correct-highlight');
          }
        }
      });
    }

    // 2. Determinar feedback individual del jugador local
    let localPlayerId = null;
    if (this.isSolo) {
      localPlayerId = 'solo_player';
    } else if (this.isHost) {
      const hostP = this.room?.players?.find(p => p.isHost) || this.room?.players?.[0];
      localPlayerId = hostP ? hostP.id : null;
    } else {
      localPlayerId = window.realtimeEngine.localPlayer?.id;
    }

    const localResp = localPlayerId ? responses[localPlayerId] : null;
    const isCorrect = localResp ? !!localResp.isCorrect : false;
    const isTimeout = !localResp;

    // 3. Sonido según acierto o fallo
    if (isCorrect || q.type === 'poll' || q.type === 'open') {
      window.soundEngine.playCorrect();
      if (localResp && localResp.comboMultiplier && localResp.comboMultiplier > 1) {
        window.soundEngine.playStreak(localResp.comboMultiplier);
      }
    } else {
      window.soundEngine.playWrong();
    }

    // 3.5 Actualizar y animar puntaje acumulado en vivo
    let updatedPlayer = null;
    if (this.isSolo) {
      updatedPlayer = this.room?.players?.[0];
    } else if (this.isHost) {
      updatedPlayer = this.room?.players?.find(p => p.id === localPlayerId) || this.room?.players?.[0];
    } else {
      updatedPlayer = window.realtimeEngine.localPlayer;
    }
    const updatedScore = updatedPlayer ? (updatedPlayer.score || 0) : 0;
    const scoreValEl = document.getElementById('player-score-val');
    if (scoreValEl) {
      scoreValEl.textContent = updatedScore;
      scoreValEl.classList.remove('score-bump');
      void scoreValEl.offsetWidth; // trigger reflow
      scoreValEl.classList.add('score-bump');
    }

    // 4. Mostrar BANDA DIAGONAL EN TODA LA PÁGINA (en document.body para abarcar toda la pantalla)
    const oldWrapper = document.getElementById('full-screen-ribbon-wrapper');
    if (oldWrapper) oldWrapper.remove();

    const ribbonWrapper = document.createElement('div');
    ribbonWrapper.id = 'full-screen-ribbon-wrapper';
    ribbonWrapper.className = 'diagonal-ribbon-screen-wrapper';

    const ribbon = document.createElement('div');
    const ribbonText = q.type === 'poll' ? '¡Voto Registrado!' : (q.type === 'open' ? '¡Idea Compartida!' : (isCorrect ? 'Correcto' : (isTimeout ? 'Tiempo Agotado' : 'Incorrecto')));
    const ribbonIcon = q.type === 'poll' ? '📊' : (q.type === 'open' ? '💬' : (isCorrect ? '✓' : (isTimeout ? '⏱' : '✕')));
    ribbon.className = `diagonal-feedback-ribbon ${isCorrect || q.type === 'poll' || q.type === 'open' ? 'correct' : (isTimeout ? 'timeout' : 'wrong')}`;
    ribbon.innerHTML = `
      <div class="ribbon-icon-circle">${ribbonIcon}</div>
      <div class="ribbon-text-main">${ribbonText}</div>
      ${localResp && localResp.pointsEarned ? `<div class="ribbon-sub-pill">+${localResp.pointsEarned} pts</div>` : ''}
    `;
    ribbonWrapper.appendChild(ribbon);
    document.body.appendChild(ribbonWrapper);

    // 5. Transición tras 1.3s
    if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
    this.transitionTimeout = setTimeout(() => {
      const activeWrapper = document.getElementById('full-screen-ribbon-wrapper');
      if (activeWrapper) activeWrapper.remove();
      if (this.isSolo) {
        this.renderFullStatsScreen(responses, correctIdx, q, localResp, isCorrect);
      } else {
        this.renderStudentFeedbackScreen(q, localResp, isCorrect, correctIdx, isTimeout);
      }
    }, 1300);
  },

  // ==========================================
  // 📱 PANTALLA DEL ALUMNO (SIN GRÁFICAS)
  // ==========================================
  renderStudentFeedbackScreen(q, localResp, isCorrect, correctIdx, isTimeout) {
    const container = document.getElementById('view-game');
    if (!container) return;

    let updatedPlayer = window.realtimeEngine.localPlayer;
    const finalScore = updatedPlayer ? (updatedPlayer.score || 0) : 0;
    const isLastQuestion = this.currentQuestionIndex >= this.challenge.questions.length - 1;

    let correctText = '';
    if (q.type === 'text') {
      correctText = q.correctAnswer || (q.acceptedAnswers && q.acceptedAnswers[0]) || '';
    } else if (Array.isArray(correctIdx)) {
      correctText = correctIdx.map(i => q.options[i]?.text).filter(Boolean).join(', ');
    } else if (q.options && q.options[correctIdx]) {
      correctText = q.options[correctIdx].text;
    }

    const isPollOrOpen = q.type === 'poll' || q.type === 'open';

    container.innerHTML = `
      <div class="student-feedback-container">
        <!-- Tarjeta de Resultado Individual del Alumno -->
        <div class="student-feedback-card ${isPollOrOpen || isCorrect ? 'is-correct' : 'is-wrong'}">
          <div style="font-size: 3.5rem; margin-bottom: 0.5rem; line-height: 1;">
            ${isPollOrOpen ? '📊' : (isCorrect ? '🎯' : (isTimeout ? '⏱️' : '❌'))}
          </div>
          
          <h2 style="font-size: 1.85rem; font-weight: 900; margin-bottom: 0.5rem; color: ${isPollOrOpen || isCorrect ? 'var(--neon-emerald)' : 'var(--neon-magenta)'};">
            ${isPollOrOpen ? '¡Respuesta Registrada!' : (isCorrect ? '¡Respuesta Correcta!' : (isTimeout ? '¡Tiempo Agotado!' : '¡Respuesta Incorrecta!'))}
          </h2>

          ${localResp && localResp.pointsEarned ? `
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0, 245, 212, 0.15); border: 1.5px solid var(--neon-cyan); padding: 0.45rem 1.25rem; border-radius: 9999px; margin-bottom: 1rem;">
              <span style="font-weight: 900; font-size: 1.15rem; color: var(--neon-cyan);">+${localResp.pointsEarned} PTS</span>
              ${localResp.comboMultiplier > 1 ? `<span style="font-weight: 800; font-size: 0.95rem; color: #ffb703;">🔥 Racha x${localResp.comboMultiplier}</span>` : ''}
            </div>
          ` : ''}

          ${(!isCorrect && !isPollOrOpen && correctText) ? `
            <div style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 0.85rem 1.25rem; margin: 1rem auto; max-width: 480px; text-align: left;">
              <div style="font-size: 0.78rem; text-transform: uppercase; font-weight: 800; color: var(--text-secondary); margin-bottom: 0.25rem;">
                Respuesta correcta:
              </div>
              <div style="font-size: 1.1rem; font-weight: 800; color: var(--neon-cyan);">
                ${this.escapeHtml(correctText)}
              </div>
            </div>
          ` : ''}

          <!-- Puntaje Acumulado -->
          <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; gap: 0.75rem;">
            <span style="font-size: 0.9rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase;">Tu Puntaje Total:</span>
            <span style="font-size: 1.4rem; font-weight: 900; color: #ffd166;">🏆 ${finalScore} PTS</span>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // 🎓 PANTALLA COMPLETA DE ESTADÍSTICAS Y TABLA PARA EL PROFESOR
  // ==========================================
  renderFullStatsScreen(responses, correctIdx, q, localResp, isCorrect) {
    const container = document.getElementById('view-game');
    if (!container) return;

    // Calcular estadísticas de respuestas
    const counts = new Array((q.options || []).length).fill(0);
    if (responses) {
      Object.values(responses).forEach(r => {
        if (r.answerIndex !== undefined && counts[r.answerIndex] !== undefined) {
          counts[r.answerIndex]++;
        }
      });
    }

    if (this.isSolo && this.selectedAnswer !== null && counts[this.selectedAnswer] !== undefined) {
      counts[this.selectedAnswer] = 1;
    }

    const totalVotes = counts.reduce((a, b) => a + b, 0);
    const maxVotes = Math.max(...counts, 1);
    const colors = this.retoShapes.map(s => s.hex);
    const isLastQuestion = this.currentQuestionIndex >= this.challenge.questions.length - 1;

    let updatedPlayer = null;
    if (this.isSolo) {
      updatedPlayer = this.room?.players?.[0];
    } else if (this.isHost) {
      updatedPlayer = this.room?.players?.find(p => p.isHost) || this.room?.players?.[0];
    } else {
      updatedPlayer = window.realtimeEngine.localPlayer;
    }
    const finalScore = updatedPlayer ? (updatedPlayer.score || 0) : 0;

    container.innerHTML = `
      <div class="full-stats-container">
        <!-- Barra Superior de Estado y Avance -->
        <div class="full-stats-header">
          <div style="display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap;">
            <span style="font-weight: 900; font-size: 1.15rem; color: var(--neon-cyan);">
              Pregunta ${this.currentQuestionIndex + 1} de ${this.challenge.questions.length}
            </span>
            <span class="badge-tag" style="background: rgba(0, 245, 212, 0.12); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); font-weight: 800; font-size: 0.9rem; padding: 0.35rem 0.85rem; border-radius: 9999px;">
              👥 ${Object.keys(responses || {}).length} ${(Object.keys(responses || {}).length === 1) ? 'respuesta' : 'respuestas'}
            </span>
            ${this.isSolo ? `
              <span class="badge-tag" style="background: rgba(255,183,3,0.15); border: 1px solid rgba(255,183,3,0.4); color: #ffb703; font-weight: 800; font-size: 0.95rem; padding: 0.35rem 0.85rem; border-radius: 9999px;">
                🏆 ${finalScore} PTS
              </span>
            ` : ''}
          </div>

          <!-- Botón de avance del profesor -->
          <div>
            ${(this.isHost || this.isSolo) ? `
              <button id="btn-next-direct" class="btn btn-primary btn-lg" onclick="window.GameView.goToNextDirect(${isLastQuestion})" style="padding: 0.75rem 2rem; font-weight: 900; font-size: 1.15rem; box-shadow: 0 0 25px rgba(0,245,212,0.45); border-radius: 12px;">
                <span>${isLastQuestion ? '🏆 ¡Ver Podio Final!' : 'Siguiente Pregunta ⏩'}</span>
              </button>
            ` : ''}
          </div>
        </div>

        <!-- Pregunta en Pantalla Gigante -->
        <div class="kahoot-host-question-banner" style="margin-bottom: 1.5rem; font-size: 1.5rem; padding: 1.25rem 2rem; border-radius: 14px;">
          ${q.text}
        </div>

        <!-- Tarjeta de Estadísticas e Histograma Desahogado -->
        <div class="full-stats-card">
          <div style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem;">
            📊 ${q.type === 'open' ? 'Ideas y Reflexiones Compartidas' : 'Estadísticas de Respuestas'}
          </div>
          <p style="color: var(--text-secondary); font-size: 0.95rem; margin-bottom: 1.75rem; font-weight: 600;">
            ${Object.keys(responses || {}).length} ${(Object.keys(responses || {}).length === 1) ? 'estudiante participó' : 'estudiantes participaron'} en esta pregunta
          </p>

          ${(q.type === 'text' || q.type === 'open') ? `
            <div style="margin-top: 1rem; width: 100%;">
              ${q.type === 'text' ? `
                <div style="padding: 1.15rem 1.5rem; background: rgba(0, 245, 212, 0.1); border-radius: 16px; margin-bottom: 1.5rem; border: 2px solid var(--neon-cyan); text-align: center; box-shadow: 0 0 25px rgba(0,245,212,0.18);">
                  <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.35rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Respuesta esperada:</div>
                  <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-cyan);">${this.escapeHtml(q.correctAnswer || (q.acceptedAnswers && q.acceptedAnswers[0]) || '')}</div>
                  ${q.acceptedAnswers && q.acceptedAnswers.length > 1 ? `
                    <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.4rem;">
                      Otras aceptadas: ${q.acceptedAnswers.slice(1).map(a => this.escapeHtml(a)).join(', ')}
                    </div>
                  ` : ''}
                </div>
              ` : `
                <div style="padding: 1rem 1.5rem; background: rgba(168, 85, 247, 0.12); border-radius: 14px; margin-bottom: 1.5rem; border: 1.5px solid #a855f7; text-align: center;">
                  <span style="font-size: 1.2rem; font-weight: 900; color: var(--text-primary);">💬 Ideas y Respuestas de la Comunidad</span>
                </div>
              `}

              <!-- Galería de respuestas enviadas -->
              <div class="host-text-responses-grid" style="max-height: 380px; text-align: left;">
                ${Object.entries(responses || {}).map(([pId, r]) => {
                  const p = this.room?.players?.find(pl => pl.id === pId) || { nickname: pId === 'solo_player' ? 'Tú' : 'Estudiante', avatar: '🎓' };
                  const isAnsCorrect = r.isCorrect;
                  return `
                    <div class="host-live-answer-card ${q.type === 'open' || isAnsCorrect ? 'correct-text-card' : 'wrong-text-card'}">
                      <div class="host-live-answer-author">
                        <div class="host-live-author-avatar">${p.avatar || '🎓'}</div>
                        <div class="host-live-author-name">${this.escapeHtml(p.nickname || 'Estudiante')}</div>
                        <span style="margin-left: auto; font-size: 0.85rem; font-weight: 900; color: ${q.type === 'open' || isAnsCorrect ? '#00f5d4' : '#f72585'};">
                          ${q.type === 'open' ? '💡 Válida' : (isAnsCorrect ? '✓ Correcto' : '✗ No coincide')}
                        </span>
                      </div>
                      <div class="host-live-answer-bubble">
                        "${this.escapeHtml(String(r.answerIndex !== undefined ? r.answerIndex : ''))}"
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          ` : (q.options && q.options.length > 0) ? `
            <!-- 📊 Histograma de Barras Amplio y Desahogado -->
            <div class="full-stats-grid">
              ${q.options.map((opt, idx) => {
                const count = counts[idx] || 0;
                const heightPx = Math.max(16, Math.round((count / maxVotes) * 150));
                const isCorr = q.type === 'poll' ? true : Array.isArray(correctIdx) ? correctIdx.includes(idx) : (idx === correctIdx);
                const color = colors[idx % colors.length];
                const shapeDef = this.getShapeDef(idx);

                return `
                  <div class="full-stats-col">
                    <div class="full-stats-bar-wrap">
                      <div class="full-stats-bar" style="height: ${heightPx}px; background: ${color};"></div>
                    </div>
                    <div class="full-stats-badge" style="background: ${color};">
                      <span style="display: inline-flex; width: 18px; height: 18px; align-items: center; justify-content: center; vertical-align: middle;">${shapeDef.svg}</span>
                      <span>${count}</span>
                      ${isCorr ? `<span class="histogram-check" title="Respuesta Correcta">✓</span>` : ''}
                    </div>
                    <div class="full-stats-label">
                      ${this.escapeHtml(opt.text)}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>

            <!-- 📋 Tabla Resumen de Respuestas por Opción para el Creador -->
            <div class="host-stats-table-wrapper">
              <div style="padding: 0.85rem 1.25rem; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border-color); text-align: left; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: 800; font-size: 0.9rem; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 0.5px;">📋 Tabla Detallada de Respuestas</span>
                <span style="font-size: 0.82rem; color: var(--text-secondary); font-weight: 700;">${totalVotes} votos totales</span>
              </div>
              <table class="host-stats-table">
                <thead>
                  <tr>
                    <th style="width: 50%;">Opción</th>
                    <th style="text-align: center; width: 15%;">Votos</th>
                    <th style="text-align: center; width: 20%;">Porcentaje</th>
                    <th style="text-align: center; width: 15%;">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  ${q.options.map((opt, idx) => {
                    const count = counts[idx] || 0;
                    const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isCorr = q.type === 'poll' ? true : Array.isArray(correctIdx) ? correctIdx.includes(idx) : (idx === correctIdx);
                    const color = colors[idx % colors.length];
                    const shapeDef = this.getShapeDef(idx);
                    return `
                      <tr class="${isCorr ? 'correct-row' : ''}">
                        <td>
                          <div style="display: flex; align-items: center; gap: 0.65rem;">
                            <span style="display: inline-flex; width: 24px; height: 24px; border-radius: 6px; background: ${color}; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
                              ${shapeDef.svg}
                            </span>
                            <span style="font-weight: 700; color: var(--text-primary); line-height: 1.3;">
                              ${this.escapeHtml(opt.text)}
                            </span>
                          </div>
                        </td>
                        <td style="text-align: center; font-weight: 900; font-size: 1.1rem; color: ${color};">
                          ${count}
                        </td>
                        <td style="text-align: center;">
                          <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                            <div style="width: 60px; height: 8px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                              <div style="width: ${pct}%; height: 100%; background: ${color}; border-radius: 999px;"></div>
                            </div>
                            <span style="font-weight: 800; font-size: 0.85rem; color: var(--text-secondary);">${pct}%</span>
                          </div>
                        </td>
                        <td style="text-align: center;">
                          ${isCorr ? `
                            <span style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(6, 214, 160, 0.15); border: 1px solid var(--neon-emerald); color: #06d6a0; font-weight: 800; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 999px;">
                              ✓ Correcta
                            </span>
                          ` : `
                            <span style="color: var(--text-muted); font-size: 0.8rem; font-weight: 600;">
                              —
                            </span>
                          `}
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          ` : `
            <div style="padding: 2.5rem 1.5rem; background: rgba(0,0,0,0.3); border-radius: 12px; margin: 1.5rem auto; max-width: 550px; border: 1px dashed var(--neon-cyan); text-align: center;">
              <div style="font-size: 1rem; color: var(--text-secondary); margin-bottom: 0.6rem; font-weight: 700;">Respuesta correcta esperada:</div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-cyan);">${q.correctAnswer || (q.acceptedAnswers && q.acceptedAnswers[0]) || ''}</div>
            </div>
          `}

          <!-- Botón de avance inferior para el profesor -->
          ${(this.isHost || this.isSolo) ? `
            <div style="margin-top: 2.25rem; display: flex; justify-content: center;">
              <button class="btn btn-primary btn-lg" onclick="window.GameView.goToNextDirect(${isLastQuestion})" style="padding: 0.95rem 2.8rem; font-size: 1.2rem; font-weight: 900; box-shadow: 0 0 30px rgba(0,245,212,0.45); border-radius: 12px;">
                <span>${isLastQuestion ? '🏆 ¡Ver Podio Final!' : 'Siguiente Pregunta ⏩'}</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    // Avance 100% manual: el maestro espera a los estudiantes sin temporizadores forzados
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
  },

  goToNextDirect(isLastQuestion) {
    if (this.transitionTimeout) clearTimeout(this.transitionTimeout);
    const activeRibbon = document.getElementById('full-screen-ribbon-wrapper');
    if (activeRibbon) activeRibbon.remove();
    if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (isLastQuestion) {
      if (this.isHost && !this.isSolo) {
        if (this.room) {
          this.room.status = 'podium';
          window.realtimeEngine.currentRoom = this.room;
          window.realtimeEngine.syncRoomState();
        }
        window.realtimeEngine.broadcast({
          type: 'SHOW_PODIUM',
          pin: this.room.pin,
          room: this.room
        });
      }
      window.appRouter.showPodium(this.room);
    } else {
      this.nextQuestion();
    }
  },

  goToLeaderboardHost(isLastQuestion) {
    if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);

    if (isLastQuestion) {
      if (this.isHost && !this.isSolo) {
        if (this.room) {
          this.room.status = 'podium';
          window.realtimeEngine.currentRoom = this.room;
          window.realtimeEngine.syncRoomState();
        }
        window.realtimeEngine.broadcast({
          type: 'SHOW_PODIUM',
          pin: this.room.pin,
          room: this.room
        });
      }
      window.appRouter.showPodium(this.room);
    } else {
      if (this.isHost && !this.isSolo) {
        if (this.room) {
          this.room.status = 'leaderboard';
          window.realtimeEngine.currentRoom = this.room;
          window.realtimeEngine.syncRoomState();
        }
        window.realtimeEngine.broadcast({
          type: 'SHOW_LEADERBOARD',
          pin: this.room.pin,
          room: this.room
        });
      }
      window.appRouter.showLeaderboard(this.room, true);
    }
  },

  finishGame() {
    if (this.autoAdvanceInterval) clearInterval(this.autoAdvanceInterval);
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.room) {
      this.room.status = 'podium';
      if (this.isHost && !this.isSolo) {
        window.realtimeEngine.currentRoom = this.room;
        window.realtimeEngine.syncRoomState();
        window.realtimeEngine.broadcast({
          type: 'SHOW_PODIUM',
          pin: this.room.pin,
          room: this.room
        });
      }
    }
    window.appRouter.showPodium(this.room);
  },

  nextQuestion() {
    this.currentQuestionIndex++;
    this.renderQuestionScreen();
  }
};

