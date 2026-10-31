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
  studentQuestionOrder: null,
  playerOptionMapping: null,

  generateStudentQuestionOrder() {
    const total = this.challenge?.questions?.length || 0;
    if (total <= 1) {
      this.studentQuestionOrder = [0];
      return;
    }
    const arr = Array.from({ length: total }, (_, i) => i);
    const pin = this.room?.pin;

    // 📽️ SALA CON PREGUNTAS PRESENTADAS: todos ven la misma pregunta a la vez (la proyecta el profesor),
    // así que el orden aleatorio debe ser el MISMO para profesor y alumnos. Se calcula con una semilla
    // derivada del PIN, de modo que cada sala tiene su propio orden revuelto sin necesidad de sincronizar.
    if (!this.isSolo && pin && this.room?.roomType !== 'normal') {
      let seed = 0;
      String(pin).split('').forEach(ch => { seed = (seed * 31 + ch.charCodeAt(0)) >>> 0; });
      seed = (seed + total * 7919) >>> 0;
      const rand = () => {
        seed = (seed + 0x6D2B79F5) >>> 0;
        let t = seed;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      this.studentQuestionOrder = arr;
      return;
    }

    // 🎮 SALA NORMAL / SOLITARIO: orden aleatorio distinto para cada estudiante
    const storageKey = `te_reto_student_order_${pin || 'SOLO'}`;
    if (!this.isSolo && pin) {
      try {
        const saved = sessionStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length === total) {
            this.studentQuestionOrder = parsed;
            return;
          }
        }
      } catch (e) {}
    }
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    this.studentQuestionOrder = arr;
    if (!this.isSolo && pin) {
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(arr));
      } catch (e) {}
    }
  },

  getActualQuestionIndex() {
    if (this.studentQuestionOrder && this.studentQuestionOrder[this.currentQuestionIndex] !== undefined) {
      return this.studentQuestionOrder[this.currentQuestionIndex];
    }
    return this.currentQuestionIndex;
  },

  getCurrentQuestion() {
    const actualIdx = this.getActualQuestionIndex();
    return this.challenge?.questions?.[actualIdx] || null;
  },

  initSolo(challenge, gameMode, options = {}) {
    this.isSolo = true;
    this.isHost = true;
    let resolved = challenge;
    if (challenge && typeof challenge === 'string') {
      resolved = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(challenge).trim())
        || (window.appState?.projects || []).find(c => c && String(c.id).trim() === String(challenge).trim());
    }
    if ((!resolved || !Array.isArray(resolved.questions) || resolved.questions.length === 0) && challenge?.id) {
      resolved = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(challenge.id).trim()) || resolved;
    }
    if (!resolved && window.ExperienceView?.currentChallenge) resolved = window.ExperienceView.currentChallenge;
    if (!resolved && window.LobbyView?.pendingChallenge) resolved = window.LobbyView.pendingChallenge;
    if (!resolved && window.appState?.challenges?.length > 0) resolved = window.appState.challenges[0];

    this.challenge = resolved;
    this.currentQuestionIndex = (options && typeof options.startIndex === 'number') ? options.startIndex : 0;
    this.generateStudentQuestionOrder();
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
      score: (options && options.score) || 0,
      streak: (options && options.streak) || 0,
      maxStreak: (options && options.maxStreak) || 0,
      answersCount: (options && options.answersCount) || this.currentQuestionIndex,
      correctCount: (options && options.correctCount) || 0,
      answers: (options && options.answers) || []
    };

    this.room = {
      pin: 'SOLO',
      challenge: resolved,
      gameMode: this.gameMode,
      players: [soloPlayer],
      responses: {}
    };

    // Conectar explícitamente con el motor en tiempo real
    window.realtimeEngine.currentRoom = this.room;
    window.realtimeEngine.localPlayer = soloPlayer;
    window.realtimeEngine.isHost = true;

    if (window.ProfileView && typeof window.ProfileView.recordQuizProgress === 'function') {
      window.ProfileView.recordQuizProgress(resolved, this.currentQuestionIndex, soloPlayer);
    }

    this.startCountdownIntro();
  },

  isSelfPaced() {
    return this.room?.roomType === 'normal' && !this.isSolo;
  },

  initHostGame(room) {
    this.isSolo = false;
    this.isHost = true;
    this.room = room;
    if (this.room && !this.room.questionResponses) {
      this.room.questionResponses = {};
    }
    this.challenge = room.challenge;
    if (this.room?.challenge?.id && (!this.challenge?.questions || this.challenge.questions.length === 0)) {
      const matched = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(this.room.challenge.id).trim());
      if (matched && Array.isArray(matched.questions) && matched.questions.length > 0) {
        this.challenge = matched;
        this.room.challenge = matched;
      }
    }
    this.gameMode = room.gameMode || 'clasico';
    this.modeConfig = room.modeConfig || {};
    this.currentQuestionIndex = 0;
    // 🎲 Preguntas aleatorias también en "Preguntas Presentadas" (mismo orden para profesor y alumnos)
    if (!this.isSelfPaced() && this.room?.randomizeQuestions !== false) {
      this.generateStudentQuestionOrder();
    } else {
      this.studentQuestionOrder = null;
    }
    this.setupHostListeners();

    if (this.isSelfPaced()) {
      if (!this.challenge || !Array.isArray(this.challenge.questions) || this.challenge.questions.length === 0) {
        if (typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
          this.challenge = { ...(this.challenge || {}), questions: DEFAULT_CHALLENGES[0].questions };
          this.room.challenge = this.challenge;
        }
      }
      this.room.status = 'self_paced';
      window.realtimeEngine.currentRoom = this.room;
      window.realtimeEngine.syncRoomState();
      window.realtimeEngine.simulateSelfPacedBots(this.challenge?.questions || []);
      this.renderHostSelfPacedDashboard();
      return;
    }

    this.startCountdownIntro();
  },

  initPlayerGame(room) {
    this.isSolo = false;
    this.isHost = false;
    this.room = room || window.realtimeEngine.currentRoom;
    this.challenge = this.room?.challenge;
    if (this.room?.challenge?.id && (!this.challenge?.questions || this.challenge.questions.length === 0)) {
      const matched = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(this.room.challenge.id).trim());
      if (matched && Array.isArray(matched.questions) && matched.questions.length > 0) {
        this.challenge = matched;
        if (this.room) this.room.challenge = matched;
      }
    }
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
    const pin = this.room?.pin || window.realtimeEngine.currentRoom?.pin;
    if (pin) {
      try {
        const stored = localStorage.getItem(`te_reto_room_${pin}`) || localStorage.getItem(`mentix_room_${pin}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.gameMode && (!detectedMode || detectedMode === 'clasico')) {
            detectedMode = parsed.gameMode;
            this.room.gameMode = parsed.gameMode;
            this.room.modeConfig = parsed.modeConfig || this.room.modeConfig;
          }
          if (parsed.roomType && !this.room.roomType) {
            this.room.roomType = parsed.roomType;
          }
        }
      } catch (e) {}
    }

    if (!this.room.roomType && window.LobbyView?.joinRoomData?.roomType) {
      this.room.roomType = window.LobbyView.joinRoomData.roomType;
    }
    if (!this.room.roomType && window.realtimeEngine?.currentRoom?.roomType) {
      this.room.roomType = window.realtimeEngine.currentRoom.roomType;
    }
    if (!this.room.roomType) {
      this.room.roomType = 'presented';
    }

    this.gameMode = detectedMode || 'clasico';
    this.currentQuestionIndex = this.isSelfPaced() ? 0 : (this.room?.currentQuestionIndex || 0);
    if (this.room?.randomizeQuestions !== false) {
      this.generateStudentQuestionOrder();
    } else {
      this.studentQuestionOrder = null;
    }

    // Aplicar diseño y colores configurados para este juego
    const activeDesign = this.room?.design || window.realtimeEngine?.currentRoom?.design || (window.AdminView && window.AdminView.getSavedDesign());
    if (activeDesign && window.AdminView) {
      window.AdminView.applyDesign(activeDesign);
    }

    this.setupPlayerListeners();

    if (this.room?.status === 'intro' || this.room?.status === 'self_paced' || this.currentQuestionIndex === 0) {
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
        if (this.isSelfPaced()) {
          const qIdx = typeof data.questionIndex === 'number' ? data.questionIndex : 0;
          const qObj = this.challenge?.questions?.[qIdx] || this.challenge?.questions?.[0];
          if (!data.isBot && qObj) {
            window.realtimeEngine.processAnswer(data.playerId, data.answerIndex, data.timeTaken, qObj, qIdx);
          }
          if (data.completedExam && this.room?.players) {
            const pl = this.room.players.find(p => p.id === data.playerId);
            if (pl) pl.completedExam = true;
          }
          if (window.soundEngine && window.soundEngine.playPop) {
            window.soundEngine.playPop();
          }
          this.renderHostSelfPacedDashboard();
          return;
        }
        if (!data.isBot) {
          window.realtimeEngine.processAnswer(data.playerId, data.answerIndex, data.timeTaken, this.getCurrentQuestion());
        }
        this.onAnswerReceived(data);
      }
    });

    window.realtimeEngine.on('PLAYER_EXAM_FINISHED', (data) => {
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin && this.room?.players) {
        const pl = this.room.players.find(p => p.id === data.playerId);
        if (pl) {
          pl.completedExam = true;
          if (typeof data.score === 'number') pl.score = Math.max(pl.score || 0, data.score);
          if (typeof data.correctCount === 'number') pl.correctCount = Math.max(pl.correctCount || 0, data.correctCount);
          if (typeof data.answersCount === 'number') pl.answersCount = Math.max(pl.answersCount || 0, data.answersCount);
          window.realtimeEngine.syncRoomState();
        }
        if (this.isSelfPaced()) {
          this.renderHostSelfPacedDashboard();
        }
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
          if (this.isSelfPaced()) {
            this.renderHostSelfPacedDashboard();
            return;
          }
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

    window.realtimeEngine.on('GLOBAL_DESIGN_UPDATED', (data) => {
      if (data?.design && window.AdminView) {
        window.AdminView.applyDesign(data.design);
      }
    });

    window.realtimeEngine.on('ROOM_ANSWER_PROGRESS', (data) => {
      if (this.isSelfPaced()) return;
      const myPin = String(this.room?.pin || window.realtimeEngine.currentRoom?.pin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (myPin && dataPin === myPin) {
        this.updateResponseCounter(data.totalResponses, data.totalPlayers);
      }
    });

    window.realtimeEngine.on('SHOW_QUESTION_RESULTS', (data) => {
      if (this.isSelfPaced()) return;
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
      if (this.isSelfPaced()) return;
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
          const prevRoomType = this.room?.roomType;
          this.room = data.room;
          if (!this.room.roomType && prevRoomType) this.room.roomType = prevRoomType;
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
      if (this.isSelfPaced()) return;
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
        <span class="badge-tag tag-medium countdown-banner" style="margin-bottom: 1.5rem; font-size: clamp(0.95rem, 3.2vw, 1.15rem); padding: 0.55rem 1.5rem; font-weight: 900; letter-spacing: 1.5px; border-radius: 9999px;">
          ¡EL RETO COMIENZA EN...
        </span>
        <div id="intro-countdown-num" style="font-size: clamp(7rem, 24vw, 12rem); font-weight: 900; line-height: 1; color: var(--timer-color, #ffe600) !important; text-shadow: 0 0 50px var(--timer-glow, rgba(255,230,0,0.9)), 0 0 100px var(--timer-glow, rgba(255,230,0,0.5)) !important; animation: timer-pulse 0.9s infinite alternate;">
          ${count}
        </div>
        <p style="color: var(--text-secondary); font-size: clamp(1.15rem, 3.8vw, 1.45rem); margin-top: 1.5rem; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.85);">
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
          el.style.color = 'var(--timer-color, #ffe600)';
          el.style.textShadow = '0 0 50px var(--timer-glow, rgba(255,230,0,0.95))';
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

    // 🎲 Asegurar el orden aleatorio de preguntas (salas presentadas y normales)
    if (this.room?.randomizeQuestions !== false && !this.isSolo) {
      if (!Array.isArray(this.studentQuestionOrder) || this.studentQuestionOrder.length !== this.challenge.questions.length) {
        this.generateStudentQuestionOrder();
      }
    } else if (this.room?.randomizeQuestions === false) {
      this.studentQuestionOrder = null;
    }

    if (this.currentQuestionIndex >= this.challenge.questions.length) {
      if (this.isSelfPaced() && !this.isHost) {
        this.finishSelfPacedStudentExam();
        return;
      }
      this.finishGame();
      return;
    }

    const q = this.getCurrentQuestion();
    if (!q) {
      if (this.isSelfPaced() && !this.isHost) {
        this.finishSelfPacedStudentExam();
        return;
      }
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
    const isMulti = q.type === 'multi' || (Array.isArray(q.correctAnswer) && !isTextOrOpen);
    this.multiSelected = [];

    container.innerHTML = `
      <div class="game-fullscreen-wrapper">
        <!-- Barra Superior de Anfitrión / Profesor -->
        <div class="kahoot-host-topbar">
          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <span class="kahoot-pin-pill">
              <span>📱</span> Únete con PIN: <strong style="color: var(--neon-cyan); letter-spacing: 1px;">${this.room.pin}</strong>
            </span>
            <span class="badge-tag" style="background:${this.room?.roomType === 'normal' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(168, 85, 247, 0.2)'}; border: 1.5px solid ${this.room?.roomType === 'normal' ? '#0ea5e9' : '#a855f7'}; color: ${this.room?.roomType === 'normal' ? '#38bdf8' : '#d8b4fe'}; font-weight: 800; font-size: 0.85rem; padding: 0.25rem 0.65rem; border-radius: 9999px;">
              ${this.room?.roomType === 'normal' ? '🎮 SALA NORMAL' : '📽️ PREGUNTAS PRESENTADAS'}
            </span>
            <span style="font-weight: 800; font-size: 1.15rem; color: var(--text-primary);">
              Pregunta ${this.currentQuestionIndex + 1} de ${this.challenge.questions.length}
            </span>
          </div>

          <div style="display: flex; align-items: center; gap: 1rem;">
            <span style="color: var(--text-secondary); font-weight: 700; font-size: 1rem;">
              👤 <span id="host-players-count">${totalPlayers}</span> Alumnos
            </span>
            <button class="btn-kahoot-skip" id="btn-skip-timer" onclick="window.GameView.skipTimer()" title="Omitir temporizador y ver respuestas">
              <span>⏭️</span> <span>Omitir temporizador</span>
            </button>
          </div>
        </div>

        <!-- Overlay Dinámico del Modo de Juego Seleccionado -->
        ${window.GameModes ? window.GameModes.renderHostQuestionOverlay(this.gameMode, this) : ''}

        ${(q.type === 'case' || q.caseContext) ? `
          <!-- Tarjeta de Caso Práctico / Situacional para el Proyector / Pantalla Grande -->
          <div class="case-study-hero-card" style="margin-bottom: 1.25rem; background: rgba(11, 19, 43, 0.96); border: 2.5px solid #00f5d4; border-radius: 18px; padding: 1.35rem 1.8rem; text-align: left; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.2); max-height: 400px; overflow-y: auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.85rem; border-bottom: 1.5px solid rgba(0,245,212,0.3); padding-bottom: 0.7rem; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 1.4rem;">📁</span>
                <span style="font-size: 0.85rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #00f5d4; background: rgba(0,245,212,0.14); padding: 0.25rem 0.65rem; border-radius: 6px;">
                  Caso Práctico / Análisis Situacional
                </span>
              </div>
              ${q.caseTitle ? `
                <div style="font-weight: 900; font-size: 1.15rem; color: #ffffff;">
                  ${this.escapeHtml(q.caseTitle)}
                </div>
              ` : ''}
            </div>
            <div style="color: #f1f5f9; font-size: 1rem; line-height: 1.7; white-space: pre-wrap; font-family: inherit;">
              ${this.escapeHtml(q.caseContext || '')}
            </div>
            ${q.referenceNorm ? `
              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.18); display: flex; align-items: center; gap: 0.5rem; font-size: 0.88rem; color: #ffd166;">
                <span>⚖️ Marco normativo:</span>
                <span style="font-weight: 700; color: #ffffff;">${this.escapeHtml(q.referenceNorm)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

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
              <div class="kahoot-host-media-fallback" style="padding: 0.6rem 1.6rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.75rem; background: rgba(255,255,255,0.06); border: 1.5px solid rgba(255,255,255,0.15); max-width: none;">
                <span style="font-size: 1.5rem;">🎮</span>
                <span style="font-size: 1.15rem; font-weight: 800; color: #ffffff;">${this.challenge.title || 'MENTIX'}</span>
                <span class="badge-tag" style="background: rgba(0,245,212,0.15); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); font-weight: 800; font-size: 0.8rem; padding: 0.2rem 0.6rem; border-radius: 9999px;">${this.challenge.categoryName || 'Reto en Vivo'}</span>
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
    const isMulti = q.type === 'multi' || (Array.isArray(q.correctAnswer) && !isTextOrOpen);
    this.multiSelected = [];

    // Determinar si es Sala Normal (examen individual en cada dispositivo) o Preguntas Presentadas
    const isNormalRoom = this.room?.roomType === 'normal';

    // 🎲 En Sala Normal los alumnos leen la pregunta y opciones en su propia pantalla (se pueden aleatorizar opciones)
    // 📽️ En Sala con Preguntas Presentadas: el alumno mira la pantalla del profesor/anfitrión,
    // por lo que los colores y formas deben coincidir 1 a 1 con el anfitrión (SIN aleatorizar)
    const rawOptions = q.options || [];
    let displayOptions = rawOptions;
    this.playerOptionMapping = null;

    if (isNormalRoom && rawOptions.length > 1 && !isTextOrOpen) {
      const indices = rawOptions.map((_, i) => i);
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]];
      }
      this.playerOptionMapping = indices;
      displayOptions = indices.map(idx => rawOptions[idx]);
    }

    container.innerHTML = `
      <div class="kahoot-player-fullscreen-container ${!isNormalRoom ? 'presented-player-screen' : ''}">
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
            <div class="badge-tag student-timer-badge" style="background: rgba(10, 20, 45, 0.85); border: 2px solid var(--timer-color, #00f5d4); color: var(--timer-color, #00f5d4) !important; font-weight: 900; font-size: 0.95rem; padding: 0.35rem 0.85rem; border-radius: 9999px; text-shadow: 0 0 10px var(--timer-glow, rgba(0, 245, 212, 0.8)); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              ⏱️ <span id="player-timer-num">${this.timeLeft}</span>s
            </div>
            <div class="badge-tag" style="background: rgba(10, 20, 45, 0.85); border: 1.5px solid #ffd166; color: #ffd166 !important; font-weight: 900; font-size: 0.95rem; padding: 0.35rem 0.9rem; border-radius: 9999px; text-shadow: 0 0 10px rgba(255, 209, 102, 0.6); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
              🏆 <span id="player-score-val">${window.realtimeEngine.localPlayer?.score || 0}</span> PTS
            </div>
            <button type="button" class="btn btn-outline" style="padding: 0.3rem 0.7rem; font-size: 0.9rem; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.4); background: rgba(10,20,45,0.7); color: #ffffff !important; cursor: pointer; text-shadow: 0 2px 6px rgba(0,0,0,0.8);" onclick="if(confirm('¿Deseas salir del cuestionario?')) window.appRouter.navigate('home');" title="Salir del cuestionario">
              🚪
            </button>
          </div>
        </div>

        ${(q.type === 'case' || q.caseContext) ? `
          <!-- Tarjeta del Caso Práctico para el Estudiante -->
          <div class="case-study-hero-card" style="margin: 0.5rem 0 1rem; background: rgba(11, 19, 43, 0.96); border: 2px solid #00f5d4; border-radius: 16px; padding: 1.15rem 1.35rem; text-align: left; box-shadow: 0 8px 24px rgba(0, 245, 212, 0.18); max-height: 280px; overflow-y: auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0,245,212,0.3); padding-bottom: 0.5rem;">
              <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #00f5d4; background: rgba(0,245,212,0.14); padding: 0.2rem 0.6rem; border-radius: 6px;">
                📁 Caso Práctico
              </span>
              <span style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">${this.escapeHtml(q.caseTitle || 'Análisis Situacional')}</span>
            </div>
            <div style="color: #f1f5f9; font-size: 0.92rem; line-height: 1.65; white-space: pre-wrap; font-family: inherit;">
              ${this.escapeHtml(q.caseContext || '')}
            </div>
          </div>
        ` : ''}

        ${isNormalRoom ? `
          <!-- Enunciado de la Pregunta para el Estudiante (Solo en Sala Normal) -->
          <div class="kahoot-host-question-banner" style="font-size: clamp(1.4rem, 3.4vw, 2.2rem); font-weight: 900; margin: 0.5rem 0 1.15rem; padding: 1.1rem 1.6rem; border-radius: 18px; min-height: auto;">
            ${this.escapeHtml(q.text)}
          </div>

          <!-- Media / Imagen si la pregunta tiene imagen -->
          ${q.media && q.mediaType === 'image' ? `
            <div style="text-align: center; margin: 0 0 0.85rem; max-height: 160px; overflow: hidden; border-radius: 12px; display: flex; justify-content: center; align-items: center;">
              <img src="${q.media}" alt="Pregunta" style="max-height: 160px; max-width: 100%; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.4); object-fit: contain;" />
            </div>
          ` : ''}
        ` : ''}

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
          <!-- Pads Táctiles Gigantes -->
          <div class="kahoot-player-grid ${isTwoOptions ? 'two-options' : ''} ${!isNormalRoom ? 'presented-grid' : ''}" id="player-pads-grid">
            ${displayOptions.map((opt, displayIdx) => {
              const shapeDef = this.getShapeDef(displayIdx);
              return `
                <button 
                  type="button" 
                  class="kahoot-player-pad ${shapeDef.colorClass} ${!isNormalRoom ? 'presented-mode' : ''}" 
                  id="player-pad-${displayIdx}"
                  title="${shapeDef.name}${isNormalRoom ? ': ' + this.escapeAttr(this.getOptionText(opt)) : ''}"
                  onclick="${isMulti ? `window.GameView.toggleMultiOption(${displayIdx})` : `window.GameView.handleSelectAnswer(${displayIdx})`}"
                  style="cursor: pointer;"
                >
                  ${(q.type === 'case' || q.caseContext) ? `
          <!-- Tarjeta del Caso Práctico para el Estudiante -->
          <div class="case-study-hero-card" style="margin: 0.5rem 0 1rem; background: rgba(11, 19, 43, 0.96); border: 2px solid #00f5d4; border-radius: 16px; padding: 1.15rem 1.35rem; text-align: left; box-shadow: 0 8px 24px rgba(0, 245, 212, 0.18); max-height: 280px; overflow-y: auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.6rem; border-bottom: 1px solid rgba(0,245,212,0.3); padding-bottom: 0.5rem;">
              <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #00f5d4; background: rgba(0,245,212,0.14); padding: 0.2rem 0.6rem; border-radius: 6px;">
                📁 Caso Práctico
              </span>
              <span style="font-weight: 800; font-size: 0.95rem; color: #ffffff;">${this.escapeHtml(q.caseTitle || 'Análisis Situacional')}</span>
            </div>
            <div style="color: #f1f5f9; font-size: 0.92rem; line-height: 1.65; white-space: pre-wrap; font-family: inherit;">
              ${this.escapeHtml(q.caseContext || '')}
            </div>
          </div>
        ` : ''}

        ${isNormalRoom ? `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.45rem; width: 100%; height: 100%; padding: 0.85rem; text-align: center; box-sizing: border-box;">
                      <div class="pad-shape" style="height: auto; width: auto;">${shapeDef.svg}</div>
                      <div class="pad-option-text" style="color: #ffffff; font-weight: 800; font-size: clamp(0.95rem, 2.5vw, 1.3rem); line-height: 1.25; text-shadow: 0 2px 10px rgba(0,0,0,0.85); max-width: 95%; word-break: break-word;">
                        ${this.escapeHtml(this.getOptionText(opt))}
                      </div>
                    </div>
                  ` : `
                    <div class="pad-shape">
                      ${shapeDef.svg}
                    </div>
                  `}
                </button>
              `;
            }).join('')}
          </div>
          ${isMulti ? `
            <div style="text-align:center; margin-top: 0.9rem;">
              <div style="font-size:0.85rem; font-weight:800; color:#ffe600; margin-bottom:0.5rem; text-shadow:0 2px 8px rgba(0,0,0,0.8);">☑️ Esta pregunta tiene VARIAS respuestas correctas: marca todas las que creas correctas y presiona Enviar.</div>
              <button type="button" id="btn-submit-multi" class="btn btn-primary btn-lg" onclick="window.GameView.submitMultiAnswer()" style="width:100%; max-width:420px; padding:0.9rem; font-size:1.1rem; font-weight:900; border-radius:14px; background:linear-gradient(135deg,#00ff88,#00b4d8); color:#041230; border:none; box-shadow:0 6px 20px rgba(0,255,136,0.4); cursor:pointer;">✅ Enviar respuestas (<span id="multi-count">0</span>)</button>
            </div>` : ''}

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

    setTimeout(() => {
      this.adjustCardAndBannerTextSizes();
    }, 60);
  },

  /* ⚡ MODO SOLITARIO (PRÁCTICA CON FORMAS TE RETO) */
  renderSoloQuestion(container, q) {
    const isTwoOptions = (q.options || []).length === 2;
    const isTextOrOpen = q.type === 'text' || q.type === 'open';
    const isMulti = q.type === 'multi' || (Array.isArray(q.correctAnswer) && !isTextOrOpen);
    this.multiSelected = [];
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
      <div class="game-fullscreen-wrapper">
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

          <div class="solo-timer-badge" style="font-size: 1.4rem; font-weight: 900; color: var(--timer-color, var(--neon-gold)) !important; background: rgba(0,0,0,0.55); padding: 0.4rem 1.1rem; border-radius: 9999px; border: 2px solid var(--timer-color, var(--border-color)); box-shadow: 0 0 15px var(--timer-glow, rgba(255, 183, 3, 0.35)); text-shadow: 0 0 10px var(--timer-glow, rgba(255, 183, 3, 0.8));">
            ⏱️ <span id="timer-text">${this.timeLeft}</span>s
          </div>
        </div>

        ${(q.type === 'case' || q.caseContext) ? `
          <!-- Tarjeta de Caso Práctico / Situacional Extenso -->
          <div class="case-study-hero-card" style="margin-bottom: 1.25rem; background: rgba(11, 19, 43, 0.96); border: 2px solid #00f5d4; border-radius: 18px; padding: 1.35rem 1.6rem; text-align: left; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.18); max-height: 420px; overflow-y: auto;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 0.85rem; border-bottom: 1.5px solid rgba(0,245,212,0.3); padding-bottom: 0.7rem; flex-wrap: wrap;">
              <div style="display: flex; align-items: center; gap: 0.6rem;">
                <span style="font-size: 1.35rem;">📁</span>
                <span style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #00f5d4; background: rgba(0,245,212,0.14); padding: 0.25rem 0.65rem; border-radius: 6px;">
                  Caso Práctico / Situacional
                </span>
              </div>
              ${q.caseTitle ? `
                <div style="font-weight: 900; font-size: 1.05rem; color: #ffffff;">
                  ${this.escapeHtml(q.caseTitle)}
                </div>
              ` : ''}
            </div>
            <div style="color: #f1f5f9; font-size: 0.96rem; line-height: 1.7; white-space: pre-wrap; font-family: inherit;">
              ${this.escapeHtml(q.caseContext || '')}
            </div>
            ${q.referenceNorm ? `
              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px dashed rgba(255,255,255,0.18); display: flex; align-items: center; gap: 0.5rem; font-size: 0.84rem; color: #ffd166;">
                <span>⚖️ Marco normativo:</span>
                <span style="font-weight: 700; color: #ffffff;">${this.escapeHtml(q.referenceNorm)}</span>
              </div>
            ` : ''}
          </div>
        ` : ''}

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
              const isCase = q.type === 'case';
              const caseLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
              return `
                <button 
                  type="button" 
                  class="kahoot-answer-card ${shapeDef.colorClass}" 
                  id="opt-btn-${displayIdx}"
                  style="cursor: pointer; width: 100%; text-align: left; justify-content: flex-start; padding: 1.1rem 1.4rem;"
                  onclick="${isMulti ? `window.GameView.toggleMultiOption(${displayIdx})` : `window.GameView.handleSelectAnswer(${displayIdx})`}"
                >
                  ${isCase ? `
                    <span style="display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 34px; font-size: 1.15rem; font-weight: 900; background: rgba(0,0,0,0.45); border-radius: 10px; margin-right: 0.85rem; flex-shrink: 0; border: 1.5px solid rgba(255,255,255,0.4); color: #ffffff;">
                      ${caseLetters[displayIdx] || (displayIdx + 1)}
                    </span>
                  ` : `
                    <span class="kahoot-shape">${shapeDef.svg}</span>
                  `}
                  <span class="kahoot-card-text" style="font-size: ${isCase ? '0.98rem' : '1.15rem'}; line-height: 1.4; font-weight: 700;">
                    ${this.escapeHtml(this.getOptionText(opt))}
                  </span>
                </button>
              `;
            }).join('')}
          </div>
          ${isMulti ? `
            <div style="text-align:center; margin-top: 0.9rem;">
              <div style="font-size:0.85rem; font-weight:800; color:#ffe600; margin-bottom:0.5rem; text-shadow:0 2px 8px rgba(0,0,0,0.8);">☑️ Esta pregunta tiene VARIAS respuestas correctas: marca todas las que creas correctas y presiona Enviar.</div>
              <button type="button" id="btn-submit-multi" class="btn btn-primary btn-lg" onclick="window.GameView.submitMultiAnswer()" style="width:100%; max-width:420px; padding:0.9rem; font-size:1.1rem; font-weight:900; border-radius:14px; background:linear-gradient(135deg,#00ff88,#00b4d8); color:#041230; border:none; box-shadow:0 6px 20px rgba(0,255,136,0.4); cursor:pointer;">✅ Enviar respuestas (<span id="multi-count">0</span>)</button>
            </div>` : ''}
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    // 1. Ajustar banner si la pregunta es extensa para que se lea completa sin cortes ni desorden
    document.querySelectorAll('.kahoot-host-question-banner').forEach(banner => {
      const qLen = (banner.textContent || '').trim().length;
      banner.style.wordBreak = 'break-word';
      banner.style.overflowWrap = 'break-word';
      banner.style.whiteSpace = 'normal';
      banner.style.height = 'auto';

      if (isMobile) {
        if (qLen > 180) {
          banner.style.fontSize = 'clamp(0.8rem, 3.2vw, 0.96rem)';
          banner.style.lineHeight = '1.2';
          banner.style.padding = '0.45rem 0.65rem';
        } else if (qLen > 110) {
          banner.style.fontSize = 'clamp(0.88rem, 3.5vw, 1.05rem)';
          banner.style.lineHeight = '1.24';
          banner.style.padding = '0.55rem 0.8rem';
        } else if (qLen > 60) {
          banner.style.fontSize = 'clamp(0.96rem, 3.9vw, 1.18rem)';
          banner.style.lineHeight = '1.26';
          banner.style.padding = '0.65rem 0.9rem';
        } else {
          banner.style.fontSize = 'clamp(1.08rem, 4.3vw, 1.32rem)';
          banner.style.lineHeight = '1.3';
          banner.style.padding = '0.75rem 1rem';
        }
      } else {
        if (qLen > 220) {
          banner.style.fontSize = 'clamp(1.2rem, 2.4vw, 1.6rem)';
          banner.style.lineHeight = '1.3';
          banner.style.padding = '1.2rem 1.6rem';
        } else if (qLen > 150) {
          banner.style.fontSize = 'clamp(1.4rem, 2.7vw, 1.9rem)';
          banner.style.lineHeight = '1.32';
          banner.style.padding = '1.4rem 2rem';
        } else if (qLen > 90) {
          banner.style.fontSize = 'clamp(1.65rem, 3.1vw, 2.3rem)';
          banner.style.lineHeight = '1.34';
          banner.style.padding = '1.6rem 2.5rem';
        } else if (qLen > 45) {
          banner.style.fontSize = 'clamp(1.85rem, 3.4vw, 2.7rem)';
          banner.style.lineHeight = '1.32';
          banner.style.padding = '1.8rem 2.8rem';
        } else {
          banner.style.fontSize = 'clamp(2.1rem, 3.8vw, 3.3rem)';
          banner.style.lineHeight = '1.32';
          banner.style.padding = '2rem 3rem';
        }
      }
    });

    // 2. Ajustar opciones de pantalla principal (host) y modo solitario
    document.querySelectorAll('.kahoot-card-text').forEach(el => {
      const len = (el.textContent || '').trim().length;
      el.style.wordBreak = 'break-word';
      el.style.overflowWrap = 'break-word';
      el.style.whiteSpace = 'normal';

      if (isMobile) {
        if (len > 120) {
          el.style.fontSize = 'clamp(0.72rem, 2.8vw, 0.88rem)';
          el.style.lineHeight = '1.18';
        } else if (len > 70) {
          el.style.fontSize = 'clamp(0.8rem, 3vw, 0.95rem)';
          el.style.lineHeight = '1.2';
        } else if (len > 35) {
          el.style.fontSize = 'clamp(0.88rem, 3.4vw, 1.05rem)';
          el.style.lineHeight = '1.24';
        } else {
          el.style.fontSize = 'clamp(0.96rem, 3.8vw, 1.18rem)';
          el.style.lineHeight = '1.28';
        }
      } else {
        if (len > 140) {
          el.style.fontSize = 'clamp(1.1rem, 1.9vw, 1.45rem)';
          el.style.lineHeight = '1.25';
        } else if (len > 90) {
          el.style.fontSize = 'clamp(1.25rem, 2.1vw, 1.7rem)';
          el.style.lineHeight = '1.28';
        } else if (len > 55) {
          el.style.fontSize = 'clamp(1.4rem, 2.3vw, 1.95rem)';
          el.style.lineHeight = '1.3';
        } else if (len > 30) {
          el.style.fontSize = 'clamp(1.55rem, 2.5vw, 2.2rem)';
          el.style.lineHeight = '1.3';
        } else {
          el.style.fontSize = 'clamp(1.7rem, 2.8vw, 2.5rem)';
          el.style.lineHeight = '1.3';
        }
      }
    });

    // 3. Ajustar opciones en pads de jugadores (celulares / tablets / PC)
    document.querySelectorAll('.pad-option-text').forEach(el => {
      const len = (el.textContent || '').trim().length;
      el.style.wordBreak = 'break-word';
      el.style.overflowWrap = 'break-word';
      el.style.whiteSpace = 'normal';

      if (isMobile) {
        if (len > 110) {
          el.style.fontSize = 'clamp(0.68rem, 2.7vw, 0.84rem)';
          el.style.lineHeight = '1.15';
        } else if (len > 65) {
          el.style.fontSize = 'clamp(0.76rem, 2.9vw, 0.92rem)';
          el.style.lineHeight = '1.18';
        } else if (len > 30) {
          el.style.fontSize = 'clamp(0.85rem, 3.2vw, 1.02rem)';
          el.style.lineHeight = '1.22';
        } else {
          el.style.fontSize = 'clamp(0.95rem, 3.6vw, 1.15rem)';
          el.style.lineHeight = '1.25';
        }
      } else {
        if (len > 140) {
          el.style.fontSize = 'clamp(1.05rem, 2.3vw, 1.35rem)';
          el.style.lineHeight = '1.22';
        } else if (len > 90) {
          el.style.fontSize = 'clamp(1.18rem, 2.5vw, 1.55rem)';
          el.style.lineHeight = '1.25';
        } else if (len > 55) {
          el.style.fontSize = 'clamp(1.32rem, 2.8vw, 1.75rem)';
          el.style.lineHeight = '1.28';
        } else if (len > 25) {
          el.style.fontSize = 'clamp(1.45rem, 3.2vw, 2rem)';
          el.style.lineHeight = '1.3';
        } else {
          el.style.fontSize = 'clamp(1.6rem, 3.5vw, 2.3rem)';
          el.style.lineHeight = '1.3';
        }
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
    const playerTimerNum = document.getElementById('player-timer-num');
    const hostTimerNum = document.getElementById('host-timer-num');
    const hostTimerCircle = document.getElementById('host-timer-circle');

    this.timerInterval = setInterval(() => {
      this.timeLeft--;

      if (textEl) textEl.textContent = Math.max(0, this.timeLeft);
      if (playerTimerNum) playerTimerNum.textContent = Math.max(0, this.timeLeft);
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
        <div class="host-live-author-avatar">${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(player, 38) : player.avatar}</div>
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

  // ☑️ PREGUNTAS DE VARIAS RESPUESTAS: marcar / desmarcar una opción con chulito (no envía todavía)
  toggleMultiOption(displayIdx) {
    if (this.hasAnswered || this.timeLeft <= 0 || this.questionFinished) return;
    if (!Array.isArray(this.multiSelected)) this.multiSelected = [];
    const pos = this.multiSelected.indexOf(displayIdx);
    if (pos >= 0) this.multiSelected.splice(pos, 1);
    else this.multiSelected.push(displayIdx);
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    this.refreshMultiSelectionUI();
  },

  refreshMultiSelectionUI() {
    const selected = new Set(this.multiSelected || []);
    document.querySelectorAll('.kahoot-player-pad, #solo-answers-grid .kahoot-answer-card').forEach((btn, i) => {
      const on = selected.has(i);
      btn.classList.toggle('selected', on);
      btn.style.outline = on ? '4px solid #ffffff' : '';
      btn.style.outlineOffset = on ? '-4px' : '';
      btn.style.transform = on ? 'scale(0.97)' : '';
      let badge = btn.querySelector('.multi-check-badge');
      if (on && !badge) {
        badge = document.createElement('span');
        badge.className = 'multi-check-badge';
        badge.textContent = '✓';
        badge.style.cssText = 'position:absolute; top:8px; right:10px; width:30px; height:30px; border-radius:50%; background:#00ff88; color:#041230; font-weight:900; font-size:1.2rem; display:flex; align-items:center; justify-content:center; box-shadow:0 0 14px rgba(0,255,136,0.9); z-index:5;';
        btn.style.position = 'relative';
        btn.appendChild(badge);
      } else if (!on && badge) {
        badge.remove();
      }
    });
    const counter = document.getElementById('multi-count');
    if (counter) counter.textContent = selected.size;
  },

  submitMultiAnswer() {
    if (this.hasAnswered || this.questionFinished) return;
    if (!Array.isArray(this.multiSelected) || this.multiSelected.length === 0) {
      const btn = document.getElementById('btn-submit-multi');
      if (btn) {
        btn.animate([{ transform: 'translateX(-6px)' }, { transform: 'translateX(6px)' }, { transform: 'translateX(0)' }], { duration: 250 });
      }
      return;
    }
    const mapping = this.playerOptionMapping;
    const originals = this.multiSelected
      .map(d => (mapping && mapping[d] !== undefined) ? mapping[d] : d)
      .sort((a, b) => a - b);
    this.handleSelectAnswer(originals);
  },

  handleSelectAnswer(index) {
    if (this.hasAnswered || this.timeLeft <= 0 || this.questionFinished) return;
    this.hasAnswered = true;

    const isMultiAnswer = Array.isArray(index);
    const displayIndex = index;
    let originalIndex = index;
    if (typeof index === 'number' && this.playerOptionMapping && this.playerOptionMapping[index] !== undefined) {
      originalIndex = this.playerOptionMapping[index];
    }
    this.selectedAnswer = originalIndex;

    const timeTaken = Math.max(0.1, (Date.now() - this.questionStartTime) / 1000);
    const q = this.getCurrentQuestion();
    const actualQIndex = this.getActualQuestionIndex();

    // Marcar visualmente botón(es) seleccionado(s) y desactivar los demás
    const pickedDisplay = new Set(isMultiAnswer ? (this.multiSelected || []) : [displayIndex]);
    document.querySelectorAll('.game-answer-btn, .kahoot-player-pad, .kahoot-answer-card').forEach((b, i) => {
      b.setAttribute('disabled', 'true');
      if (pickedDisplay.has(i)) {
        b.classList.add('selected');
        b.classList.remove('dimmed');
      } else {
        b.classList.add('dimmed');
      }
    });
    const submitMultiBtn = document.getElementById('btn-submit-multi');
    if (submitMultiBtn) {
      submitMultiBtn.setAttribute('disabled', 'true');
      submitMultiBtn.style.opacity = '0.6';
    }
    if (!isMultiAnswer) {
      const chosenBtn = document.getElementById(`player-pad-${displayIndex}`) || document.getElementById(`opt-btn-${displayIndex}`);
      if (chosenBtn) {
        chosenBtn.classList.remove('dimmed');
        chosenBtn.classList.add('selected');
      }
    }

    if (this.isSolo || (!this.isHost && this.isSelfPaced())) {
      // ⚡ MODO SOLITARIO O SALA NORMAL (EXAMEN INDIVIDUAL A SU RITMO):
      // Se detiene el reloj inmediatamente (aunque falten 20s)
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.questionFinished = true;

      const p = this.isSolo ? this.room.players[0] : window.realtimeEngine.localPlayer;
      const playerKey = this.isSolo ? 'solo_player' : (p?.id || 'local_player');
      const res = this.isSolo
        ? window.realtimeEngine.processAnswer('solo_player', originalIndex, timeTaken, q, actualQIndex)
        : null;

      let isCorr = false;
      if (q.type === 'poll' || q.type === 'open') {
        isCorr = true;
      } else if (q.type === 'text') {
        const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
        const userText = norm(String(originalIndex));
        const accepted = (q.acceptedAnswers && q.acceptedAnswers.length > 0) ? q.acceptedAnswers : [q.correctAnswer];
        isCorr = accepted.some(a => norm(String(a)) === userText);
      } else if (Array.isArray(q.correctAnswer)) {
        const pickedArr = Array.isArray(originalIndex) ? originalIndex : [originalIndex];
        const pickedSet = new Set(pickedArr);
        isCorr = pickedSet.size === q.correctAnswer.length && q.correctAnswer.every(i => pickedSet.has(i));
      } else {
        isCorr = originalIndex === q.correctAnswer;
      }
      let comboMult = 1;
      let ptsEarned = 0;

      if (res) {
        isCorr = res.isCorrect;
        ptsEarned = res.pointsEarned;
        comboMult = res.comboMultiplier || 1;
      } else if (p) {
        if (isCorr) {
          p.streak = (p.streak || 0) + 1;
          p.correctCount = (p.correctCount || 0) + 1;
          if (p.streak >= 10) comboMult = 10;
          else if (p.streak >= 6) comboMult = 5;
          else if (p.streak >= 4) comboMult = 3;
          else if (p.streak >= 2) comboMult = 2;
          const maxTime = q.timeLimit || 20;
          const basePoints = q.points !== undefined ? q.points : 1000;
          const speedBonus = 0.5 + 0.5 * (Math.max(0, maxTime - timeTaken) / maxTime);
          ptsEarned = Math.round(basePoints * speedBonus * comboMult);
          p.score = (p.score || 0) + ptsEarned;
          if (p.streak > (p.maxStreak || 0)) p.maxStreak = p.streak;
        } else {
          p.streak = 0;
        }
        p.answersCount = (p.answersCount || 0) + 1;
        p.currentQuestionIndex = this.currentQuestionIndex + 1;
        if (this.currentQuestionIndex >= this.challenge.questions.length - 1) {
          p.completedExam = true;
        }
        if (!p.answers) p.answers = [];
        p.answers.push({ questionId: q.id, questionIndex: actualQIndex, displayStep: this.currentQuestionIndex, answerIndex: originalIndex, isCorrect: isCorr, pointsEarned: ptsEarned, timeTaken, comboMultiplier: comboMult });
      }

      // Si es Sala Normal, enviar progreso de esta pregunta al profesor en tiempo real
      if (!this.isSolo && this.isSelfPaced()) {
        window.realtimeEngine.broadcast({
          type: 'PLAYER_ANSWER',
          pin: this.room.pin,
          playerId: p?.id,
          questionIndex: actualQIndex,
          displayStep: this.currentQuestionIndex,
          answerIndex: originalIndex,
          timeTaken: timeTaken,
          completedExam: this.currentQuestionIndex >= this.challenge.questions.length - 1
        });
      }

      const responses = {
        [playerKey]: {
          answerIndex: originalIndex,
          isCorrect: isCorr,
          pointsEarned: ptsEarned,
          timeTaken: timeTaken,
          comboMultiplier: comboMult
        }
      };
      this.room.responses = responses;

      if (this.gameMode && this.gameMode !== 'clasico') {
        this.pendingSoloResults = {
          responses: responses,
          correctAnswer: q.correctAnswer
        };
        this.showWaitingFeedback();
      } else {
        this.revealQuestionResults({
          responses: responses,
          correctAnswer: q.correctAnswer
        });
      }
    } else if (this.isHost) {
      // 👥 MODO MULTIJUGADOR (ANFITRIÓN):
      // El host no responde
    } else {
      // 👥 MODO MULTIJUGADOR CON PREGUNTAS PRESENTADAS (CLIENTE REMOTO):
      if (window.realtimeEngine.sendAnswer) {
        window.realtimeEngine.sendAnswer(originalIndex, timeTaken);
      }
      window.realtimeEngine.broadcast({
        type: 'PLAYER_ANSWER',
        pin: this.room.pin,
        playerId: window.realtimeEngine.localPlayer?.id,
        questionIndex: this.currentQuestionIndex,
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

        ${(this.isSolo || this.isSelfPaced()) ? `
          <button 
            type="button" 
            id="btn-solo-skip-to-results" 
            class="btn btn-outline" 
            style="width: 100%; margin-top: 0.6rem; padding: 0.6rem; font-size: 0.9rem; font-weight: 800;"
            onclick="window.GameView.continueSoloToResults()"
          >
            ➡️ Continuar a Resultado
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
      if (this.isSelfPaced()) {
        setTimeout(() => {
          this.continueSoloToResults();
        }, 1900);
      }
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
      if (this.isSelfPaced()) {
        setTimeout(() => {
          this.continueSoloToResults();
        }, 1900);
      }
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
      <div style="font-size: 1.8rem;">${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(data, 40) : data.avatar}</div>
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
    const q = this.getCurrentQuestion();
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

    const q = this.getCurrentQuestion();
    const actualQIndex = this.getActualQuestionIndex();
    const resultsPayload = {
      type: 'SHOW_QUESTION_RESULTS',
      pin: this.room.pin,
      questionIndex: actualQIndex,
      displayStep: this.currentQuestionIndex,
      responses: this.room.responses || {},
      correctAnswer: q?.correctAnswer,
      players: this.room.players
    };

    // Broadcast sincronizado a todos los jugadores
    window.realtimeEngine.broadcast(resultsPayload);
    // Mostrar en la pantalla del host
    this.revealQuestionResults(resultsPayload);
  },

  timeExpired() {
    if (this.questionFinished) return;
    if (this.isHost && !this.isSolo) {
      if (this.isSelfPaced()) return;
      this.finishQuestionHost();
    } else if (!this.isHost && this.isSelfPaced()) {
      const p = window.realtimeEngine.localPlayer;
      const q = this.getCurrentQuestion();
      const actualQIndex = this.getActualQuestionIndex();
      if (p) {
        p.streak = 0;
        p.answersCount = (p.answersCount || 0) + 1;
        p.currentQuestionIndex = this.currentQuestionIndex + 1;
        if (this.currentQuestionIndex >= this.challenge.questions.length - 1) {
          p.completedExam = true;
        }
        if (!p.answers) p.answers = [];
        p.answers.push({
          questionId: q?.id,
          questionIndex: actualQIndex,
          displayStep: this.currentQuestionIndex,
          answerIndex: -1,
          isCorrect: false,
          pointsEarned: 0,
          timeTaken: this.totalTime,
          comboMultiplier: 1
        });
      }
      window.realtimeEngine.broadcast({
        type: 'PLAYER_ANSWER',
        pin: this.room?.pin,
        playerId: p?.id,
        questionIndex: actualQIndex,
        displayStep: this.currentQuestionIndex,
        answerIndex: -1,
        timeTaken: this.totalTime,
        completedExam: this.currentQuestionIndex >= this.challenge.questions.length - 1
      });
      this.revealQuestionResults({
        responses: {},
        correctAnswer: q?.correctAnswer
      });
    } else {
      const q = this.getCurrentQuestion();
      this.revealQuestionResults({
        responses: this.room?.responses || {},
        correctAnswer: q?.correctAnswer
      });
    }
  },

  revealQuestionResults(data = {}) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.questionFinished = true;

    const q = this.getCurrentQuestion();
    const correctIdx = (data && data.correctAnswer !== undefined) ? data.correctAnswer : q?.correctAnswer;
    const responses = (data && data.responses) ? data.responses : (this.room?.responses || {});
    const isLastQuestion = this.currentQuestionIndex >= this.challenge.questions.length - 1;

    // 🎓 1. PANTALLA DEL PROFESOR / CREADOR DE LA SALA:
    if (this.isHost && !this.isSolo) {
      if (this.isSelfPaced()) {
        this.renderHostSelfPacedDashboard();
        return;
      }
      window.soundEngine.playFanfare();
      // El creador de la sala ve la pantalla completa con el histograma desahogado y la tabla de resumen
      this.renderFullStatsScreen(responses, correctIdx, q, null, null);
      return;
    }

    // 📱 2. PANTALLA DEL ALUMNO O MODO SOLITARIO:
    // 1. Resaltar visualmente las respuestas en los botones
    if (q?.type === 'poll') {
      (q.options || []).forEach((opt, idx) => {
        const displayIdx = this.playerOptionMapping ? this.playerOptionMapping.indexOf(idx) : idx;
        const btn = document.getElementById(`opt-btn-${displayIdx}`) || document.getElementById(`player-pad-${displayIdx}`);
        if (btn) {
          btn.setAttribute('disabled', 'true');
          btn.classList.add('correct-highlight');
        }
      });
    } else if (Array.isArray(correctIdx)) {
      (q?.options || []).forEach((opt, idx) => {
        const displayIdx = this.playerOptionMapping ? this.playerOptionMapping.indexOf(idx) : idx;
        const btn = document.getElementById(`opt-btn-${displayIdx}`) || document.getElementById(`player-pad-${displayIdx}`);
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
    } else if (q?.type === 'text') {
      const textInput = document.getElementById('game-text-answer-input');
      if (textInput) textInput.setAttribute('disabled', 'true');
    } else {
      (q?.options || []).forEach((opt, idx) => {
        const displayIdx = this.playerOptionMapping ? this.playerOptionMapping.indexOf(idx) : idx;
        const btn = document.getElementById(`opt-btn-${displayIdx}`) || document.getElementById(`player-pad-${displayIdx}`);
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
  // 📱 PANTALLA DEL ALUMNO (CON FONDO AZUL + AMARILLO Y VERDE NEÓN)
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
      correctText = correctIdx.map(i => this.getOptionText(q.options[i])).filter(Boolean).join(', ');
    } else if (q.options && q.options[correctIdx]) {
      correctText = this.getOptionText(q.options[correctIdx]);
    }

    const isPollOrOpen = q.type === 'poll' || q.type === 'open';
    const accentBorder = (isPollOrOpen || isCorrect) ? '#00ff88' : '#ffe600';
    const accentGlow = (isPollOrOpen || isCorrect) ? 'rgba(0, 255, 136, 0.5)' : 'rgba(255, 230, 0, 0.45)';
    const titleColor = (isPollOrOpen || isCorrect) ? '#00ff88' : '#ffe600';

    container.innerHTML = `
      <div class="student-feedback-container">
        <!-- Tarjeta de Resultado Individual del Alumno con Fondo Azul, Amarillo y Verde Neón -->
        <div class="student-feedback-card ${isPollOrOpen || isCorrect ? 'is-correct' : 'is-wrong'}" style="background: linear-gradient(155deg, rgba(6, 22, 66, 0.84) 0%, rgba(4, 15, 48, 0.90) 100%), url('assets/mentix_stage_bg.svg') center center / cover no-repeat !important; border: 2.5px solid ${accentBorder} !important; box-shadow: 0 0 45px ${accentGlow}, 0 25px 60px rgba(0, 0, 0, 0.9), inset 0 0 28px rgba(0, 255, 136, 0.14) !important; border-radius: 24px; padding: 2.5rem 1.75rem; color: #ffffff !important;">
          <div style="font-size: 4rem; margin-bottom: 0.75rem; line-height: 1; filter: drop-shadow(0 0 20px ${accentGlow});">
            ${isPollOrOpen ? '📊' : (isCorrect ? '🎯' : (isTimeout ? '⏱️' : '⚡'))}
          </div>
          
          <h2 style="font-size: 2.1rem; font-weight: 900; margin-bottom: 0.75rem; letter-spacing: -0.5px; color: ${titleColor} !important; text-shadow: 0 0 22px ${accentGlow};">
            ${isPollOrOpen ? '¡Respuesta Registrada!' : (isCorrect ? '¡Respuesta Correcta!' : (isTimeout ? '¡Tiempo Agotado!' : '¡Respuesta Incorrecta!'))}
          </h2>

          ${localResp && localResp.pointsEarned ? `
            <div style="display: inline-flex; align-items: center; gap: 0.65rem; background: rgba(0, 255, 136, 0.16) !important; border: 2px solid #00ff88 !important; padding: 0.55rem 1.5rem; border-radius: 9999px; margin-bottom: 1.25rem; box-shadow: 0 0 25px rgba(0, 255, 136, 0.35);">
              <span style="font-weight: 900; font-size: 1.25rem; color: #00ff88 !important; text-shadow: 0 0 14px rgba(0, 255, 136, 0.9); letter-spacing: 0.5px;">+${localResp.pointsEarned} PTS</span>
              ${localResp.comboMultiplier > 1 ? `<span style="font-weight: 900; font-size: 1rem; color: #ffe600 !important; text-shadow: 0 0 12px rgba(255, 230, 0, 0.9); background: rgba(255, 230, 0, 0.18); padding: 0.25rem 0.65rem; border-radius: 8px; border: 1.5px solid rgba(255, 230, 0, 0.6);">🔥 Racha x${localResp.comboMultiplier}</span>` : ''}
            </div>
          ` : ''}

          ${(!isCorrect && !isPollOrOpen && correctText) ? `
            <div style="background: rgba(7, 24, 68, 0.92) !important; border: 1.5px solid #00ff88 !important; border-radius: 14px; padding: 1rem 1.35rem; margin: 1.25rem auto; max-width: 480px; text-align: left; box-shadow: 0 10px 25px rgba(0,0,0,0.65), 0 0 18px rgba(0, 255, 136, 0.2);">
              <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; color: #ffe600 !important; margin-bottom: 0.35rem; letter-spacing: 0.5px;">
                Respuesta correcta:
              </div>
              <div style="font-size: 1.2rem; font-weight: 800; color: #00ff88 !important; text-shadow: 0 0 12px rgba(0, 255, 136, 0.8);">
                ${this.escapeHtml(correctText)}
              </div>
            </div>
          ` : ''}

          ${(q.explanation || q.referenceNorm) ? `
            <!-- Justificación Pedagógica y Normativa de Referencia para el Alumno -->
            <div style="background: rgba(8, 20, 52, 0.94) !important; border: 1.5px solid #00f5d4 !important; border-radius: 16px; padding: 1.2rem 1.5rem; margin: 1.25rem auto; max-width: 580px; text-align: left; box-shadow: 0 10px 30px rgba(0,0,0,0.7), 0 0 20px rgba(0, 245, 212, 0.2);">
              ${q.explanation ? `
                <div style="font-size: 0.8rem; text-transform: uppercase; font-weight: 800; color: #00f5d4 !important; margin-bottom: 0.45rem; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.4rem;">
                  <span>💡</span> Justificación Pedagógica:
                </div>
                <div style="font-size: 0.95rem; color: #f1f5f9 !important; line-height: 1.6; white-space: pre-wrap;">
                  ${this.escapeHtml(q.explanation)}
                </div>
              ` : ''}
              ${q.referenceNorm ? `
                <div style="margin-top: 0.85rem; padding-top: 0.65rem; border-top: 1px dashed rgba(255,255,255,0.18); display: flex; align-items: flex-start; gap: 0.55rem; font-size: 0.86rem;">
                  <span style="font-size: 1.15rem; line-height: 1;">⚖️</span>
                  <div>
                    <span style="font-weight: 800; color: #ffd166 !important; text-transform: uppercase; letter-spacing: 0.5px; display: block; font-size: 0.76rem;">Normativa de referencia:</span>
                    <span style="color: #ffffff !important; font-weight: 600;">${this.escapeHtml(q.referenceNorm)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

          <!-- Puntaje Acumulado -->
          <div style="margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid rgba(0, 255, 136, 0.25) !important; display: flex; align-items: center; justify-content: center; gap: 0.85rem; flex-wrap: wrap;">
            <span style="font-size: 0.95rem; font-weight: 800; color: #f1f5f9 !important; text-transform: uppercase; letter-spacing: 1px; text-shadow: 0 2px 4px rgba(0,0,0,0.9);">Tu Puntaje Total:</span>
            <span style="font-size: 1.55rem; font-weight: 900; color: #ffe600 !important; text-shadow: 0 0 18px rgba(255, 230, 0, 0.95);">🏆 ${finalScore} PTS</span>
          </div>

          ${this.isSelfPaced() ? `
            <div style="margin-top: 1.6rem;">
              <button
                type="button"
                class="btn btn-primary btn-lg"
                onclick="${isLastQuestion ? 'window.GameView.finishSelfPacedStudentExam()' : 'window.GameView.nextQuestion()'}"
                style="width: 100%; max-width: 340px; padding: 0.95rem 2rem; font-size: 1.15rem; font-weight: 900; border-radius: 14px; background: linear-gradient(90deg, #00ff88, #ffe600); color: #041230 !important; border: none; box-shadow: 0 0 28px rgba(0, 255, 136, 0.6); cursor: pointer;"
              >
                <span>${isLastQuestion ? '🏆 Terminar y Ver Mi Resultado' : 'Siguiente Pregunta ⏩'}</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  finishSelfPacedStudentExam() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    const p = window.realtimeEngine.localPlayer;
    const totalQuestions = this.challenge?.questions?.length || 1;
    if (p) {
      p.completedExam = true;
      window.realtimeEngine.broadcast({
        type: 'PLAYER_EXAM_FINISHED',
        pin: this.room?.pin,
        playerId: p.id,
        score: p.score || 0,
        correctCount: p.correctCount || 0,
        answersCount: p.answersCount || totalQuestions
      });
    }

    const container = document.getElementById('view-game');
    if (!container) return;

    const score = p?.score || 0;
    const correct = p?.correctCount || 0;
    const accuracy = Math.round((correct / totalQuestions) * 100);
    const maxStreak = p?.maxStreak || 0;

    if (window.soundEngine) window.soundEngine.playFanfare();

    container.innerHTML = `
      <div class="student-feedback-container" style="padding: 2rem 1rem;">
        <div class="student-feedback-card is-correct" style="max-width: 680px; width: 100%; background: linear-gradient(155deg, rgba(6, 22, 66, 0.86) 0%, rgba(4, 15, 48, 0.92) 100%), url('assets/mentix_stage_bg.svg') center center / cover no-repeat !important; border: 2.5px solid #00ff88 !important; box-shadow: 0 0 50px rgba(0, 255, 136, 0.45), 0 25px 60px rgba(0,0,0,0.9) !important; border-radius: 24px; padding: 2.5rem 2rem; color: #ffffff !important;">
          <div style="font-size: 4rem; margin-bottom: 0.5rem;">🏆</div>
          <span class="badge-tag" style="background: rgba(0, 255, 136, 0.18); border: 1.5px solid #00ff88; color: #00ff88; font-weight: 900; padding: 0.35rem 1rem; border-radius: 9999px; font-size: 0.85rem;">
            ✅ EXAMEN INDIVIDUAL COMPLETADO
          </span>
          <h2 style="font-size: 2.2rem; font-weight: 900; color: #ffe600 !important; margin: 0.75rem 0 0.35rem; text-shadow: 0 0 20px rgba(255, 230, 0, 0.75);">
            ¡Excelente trabajo, ${this.escapeHtml(p?.nickname || 'Estudiante')}!
          </h2>
          <p style="color: #cbd5e1; font-size: 0.98rem; margin-bottom: 1.5rem;">
            Tus resultados ya fueron enviados en vivo al panel del profesor.
          </p>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 1rem; margin-bottom: 1.75rem;">
            <div style="background: rgba(5, 18, 52, 0.88); border: 1.5px solid #ffe600; border-radius: 16px; padding: 1rem;">
              <div style="font-size: 0.78rem; color: #fef08a; font-weight: 800; text-transform: uppercase;">Puntaje Final</div>
              <div style="font-size: 1.85rem; font-weight: 900; color: #ffe600; margin-top: 0.25rem;">🏆 ${score}</div>
            </div>
            <div style="background: rgba(5, 18, 52, 0.88); border: 1.5px solid #00ff88; border-radius: 16px; padding: 1rem;">
              <div style="font-size: 0.78rem; color: #86efac; font-weight: 800; text-transform: uppercase;">Aciertos</div>
              <div style="font-size: 1.85rem; font-weight: 900; color: #00ff88; margin-top: 0.25rem;">✓ ${correct}/${totalQuestions}</div>
            </div>
            <div style="background: rgba(5, 18, 52, 0.88); border: 1.5px solid #00b4d8; border-radius: 16px; padding: 1rem;">
              <div style="font-size: 0.78rem; color: #7dd3fc; font-weight: 800; text-transform: uppercase;">Precisión</div>
              <div style="font-size: 1.85rem; font-weight: 900; color: #38bdf8; margin-top: 0.25rem;">🎯 ${accuracy}%</div>
            </div>
            <div style="background: rgba(5, 18, 52, 0.88); border: 1.5px solid #ffe600; border-radius: 16px; padding: 1rem;">
              <div style="font-size: 0.78rem; color: #fef08a; font-weight: 800; text-transform: uppercase;">Mejor Racha</div>
              <div style="font-size: 1.85rem; font-weight: 900; color: #ffe600; margin-top: 0.25rem;">🔥 x${maxStreak}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap;">
            <button
              type="button"
              class="btn btn-primary btn-lg"
              onclick="window.appRouter.showPodium(window.GameView.room)"
              style="padding: 0.9rem 2.2rem; font-size: 1.1rem; font-weight: 900; border-radius: 14px; background: linear-gradient(90deg, #00ff88, #ffe600); color: #041230 !important; border: none; box-shadow: 0 0 25px rgba(0, 255, 136, 0.55); cursor: pointer;"
            >
              🏆 Ver Podio de la Sala
            </button>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================
  // 🎓 PANEL EN VIVO DEL PROFESOR PARA SALA NORMAL (EXAMEN INDIVIDUAL SIN AVANCE MANUAL)
  // ==========================================
  renderHostSelfPacedDashboard() {
    const container = document.getElementById('view-game');
    if (!container) return;

    const players = Array.isArray(this.room?.players) ? [...this.room.players] : [];
    const questions = Array.isArray(this.challenge?.questions) ? this.challenge.questions : [];
    const totalQuestions = Math.max(1, questions.length);

    // Ordenar estudiantes por puntaje descendente y progreso
    players.sort((a, b) => (b.score || 0) - (a.score || 0) || (b.answersCount || 0) - (a.answersCount || 0));

    const completedCount = players.filter(p => p.completedExam || (p.answersCount || 0) >= totalQuestions).length;
    const inProgressCount = Math.max(0, players.length - completedCount);

    let totalAnsweredAll = 0;
    let totalCorrectAll = 0;
    players.forEach(p => {
      totalAnsweredAll += (p.answersCount || 0);
      totalCorrectAll += (p.correctCount || 0);
    });
    const avgAccuracy = totalAnsweredAll > 0 ? Math.round((totalCorrectAll / totalAnsweredAll) * 100) : 0;

    container.innerHTML = `
      <div style="max-width: 1120px; margin: 0 auto; padding: 1.5rem 1.25rem 4rem;">
        <!-- Cabecera del Monitor de Examen Individual del Profesor -->
        <div class="host-selfpaced-panel" style="background: linear-gradient(155deg, rgba(6, 22, 66, 0.84) 0%, rgba(4, 15, 48, 0.90) 100%), url('assets/mentix_stage_bg.svg') center center / cover no-repeat; border: 2px solid #00ff88; border-radius: 22px; padding: 1.5rem 2rem; margin-bottom: 1.5rem; box-shadow: 0 0 35px rgba(0, 255, 136, 0.3), 0 15px 40px rgba(0,0,0,0.65);">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
                <span class="badge-tag" style="background: rgba(0, 255, 136, 0.18); border: 1.5px solid #00ff88; color: #00ff88; font-weight: 900; padding: 0.3rem 0.85rem; border-radius: 9999px;">
                  📝 SALA NORMAL • EXAMEN INDIVIDUAL A SU RITMO
                </span>
                <span class="badge-tag" style="background: rgba(255, 230, 0, 0.18); border: 1.5px solid #ffe600; color: #ffe600; font-weight: 900; padding: 0.3rem 0.85rem; border-radius: 9999px;">
                  🔑 PIN: ${this.room?.pin || ''}
                </span>
              </div>
              <h1 style="font-size: clamp(1.5rem, 3vw, 2.1rem); font-weight: 900; color: #ffffff; margin: 0;">
                📊 Resultados en Vivo — ${this.escapeHtml(this.challenge?.title || 'Cuestionario MENTIX')}
              </h1>
              <p style="color: #cbd5e1; font-size: 0.95rem; margin: 0.25rem 0 0; font-weight: 600;">
                Cada estudiante avanza a su propio ritmo como en solitario. Aquí ves el progreso y calificaciones en tiempo real.
              </p>
            </div>

            <div>
              <button
                type="button"
                class="btn btn-primary btn-lg"
                onclick="window.GameView.finishGame()"
                style="padding: 0.85rem 1.8rem; font-size: 1.05rem; font-weight: 900; border-radius: 14px; background: linear-gradient(90deg, #00ff88, #ffe600); color: #041230 !important; border: none; box-shadow: 0 0 25px rgba(0, 255, 136, 0.55); cursor: pointer;"
              >
                🏆 Finalizar y Ver Podio Final
              </button>
            </div>
          </div>

          <!-- Tarjetas de Métricas en Vivo (Azul + Amarillo Neón + Verde Neón) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.4rem;">
            <div style="background: rgba(4, 14, 42, 0.86); border: 1.5px solid #00b4d8; border-radius: 16px; padding: 1rem 1.25rem;">
              <div style="font-size: 0.78rem; color: #7dd3fc; font-weight: 800; text-transform: uppercase;">👥 Estudiantes</div>
              <div style="font-size: 2rem; font-weight: 900; color: #38bdf8; margin-top: 0.2rem;">${players.length}</div>
            </div>
            <div style="background: rgba(4, 14, 42, 0.86); border: 1.5px solid #ffe600; border-radius: 16px; padding: 1rem 1.25rem;">
              <div style="font-size: 0.78rem; color: #fef08a; font-weight: 800; text-transform: uppercase;">✍️ Respondiendo</div>
              <div style="font-size: 2rem; font-weight: 900; color: #ffe600; margin-top: 0.2rem;">${inProgressCount}</div>
            </div>
            <div style="background: rgba(4, 14, 42, 0.86); border: 1.5px solid #00ff88; border-radius: 16px; padding: 1rem 1.25rem;">
              <div style="font-size: 0.78rem; color: #86efac; font-weight: 800; text-transform: uppercase;">✅ Finalizados</div>
              <div style="font-size: 2rem; font-weight: 900; color: #00ff88; margin-top: 0.2rem;">${completedCount} / ${players.length}</div>
            </div>
            <div style="background: rgba(4, 14, 42, 0.86); border: 1.5px solid #00ff88; border-radius: 16px; padding: 1rem 1.25rem;">
              <div style="font-size: 0.78rem; color: #86efac; font-weight: 800; text-transform: uppercase;">🎯 Precisión Global</div>
              <div style="font-size: 2rem; font-weight: 900; color: #00ff88; margin-top: 0.2rem;">${avgAccuracy}%</div>
            </div>
          </div>
        </div>

        <!-- Tabla de Progreso y Resultados Individuales en Vivo -->
        <div style="background: linear-gradient(160deg, rgba(6, 20, 58, 0.88) 0%, rgba(3, 11, 34, 0.94) 100%), url('assets/mentix_stage_bg.svg') center center / cover no-repeat; border: 2px solid rgba(0, 255, 136, 0.55); border-radius: 22px; padding: 1.5rem 1.75rem; box-shadow: 0 12px 35px rgba(0,0,0,0.65);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.5rem;">
            <h2 style="font-size: 1.35rem; font-weight: 900; color: #ffe600; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
              <span>📋</span> Progreso y Resultados de los Estudiantes en Tiempo Real
            </h2>
            <span style="font-size: 0.88rem; color: #00ff88; font-weight: 800;">
              Total del examen: ${totalQuestions} preguntas
            </span>
          </div>

          ${players.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: #94a3b8;">
              Esperando respuestas de los estudiantes...
            </div>
          ` : `
            <div style="overflow-x: auto;">
              <table class="host-stats-table" style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid rgba(0, 255, 136, 0.35); color: #ffe600; text-align: left;">
                    <th style="padding: 0.85rem;">#</th>
                    <th style="padding: 0.85rem;">Estudiante</th>
                    <th style="padding: 0.85rem;">Estado / Avance</th>
                    <th style="padding: 0.85rem; text-align: center;">Aciertos</th>
                    <th style="padding: 0.85rem; text-align: center;">Precisión</th>
                    <th style="padding: 0.85rem; text-align: center;">Racha</th>
                    <th style="padding: 0.85rem; text-align: right;">Puntaje</th>
                  </tr>
                </thead>
                <tbody>
                  ${players.map((p, idx) => {
                    const ansCount = Math.min(totalQuestions, p.answersCount || 0);
                    const corrCount = p.correctCount || 0;
                    const isDone = p.completedExam || ansCount >= totalQuestions;
                    const pctProgress = Math.min(100, Math.round((ansCount / totalQuestions) * 100));
                    const accuracy = ansCount > 0 ? Math.round((corrCount / ansCount) * 100) : 0;
                    return `
                      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08); background: ${isDone ? 'rgba(0, 255, 136, 0.08)' : 'transparent'};">
                        <td style="padding: 0.85rem; font-weight: 900; color: ${idx === 0 ? '#ffe600' : '#94a3b8'}; font-size: 1.05rem;">
                          ${idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : (idx + 1)}
                        </td>
                        <td style="padding: 0.85rem;">
                          <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <div style="width: 42px; height: 42px; display: flex; align-items: center; justify-content: center;">
                              ${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(p, 40) : (p.avatar || '🎓')}
                            </div>
                            <div>
                              <div style="font-weight: 900; color: #ffffff; font-size: 1rem;">${this.escapeHtml(p.nickname || 'Estudiante')}</div>
                              <div style="font-size: 0.75rem; color: #7dd3fc;">${this.escapeHtml(p.email || 'En sala')}</div>
                            </div>
                          </div>
                        </td>
                        <td style="padding: 0.85rem; min-width: 200px;">
                          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.3rem; font-size: 0.82rem; font-weight: 800;">
                            <span style="color: ${isDone ? '#00ff88' : '#ffe600'};">
                              ${isDone ? '✅ Examen Finalizado' : `📝 Pregunta ${Math.min(totalQuestions, ansCount + 1)} de ${totalQuestions}`}
                            </span>
                            <span style="color: #cbd5e1;">${ansCount}/${totalQuestions} (${pctProgress}%)</span>
                          </div>
                          <div style="width: 100%; height: 10px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
                            <div style="width: ${pctProgress}%; height: 100%; background: linear-gradient(90deg, #00b4d8, #00ff88, #ffe600); border-radius: 999px; transition: width 0.35s ease;"></div>
                          </div>
                        </td>
                        <td style="padding: 0.85rem; text-align: center; font-weight: 900; color: #00ff88; font-size: 1.05rem;">
                          ${corrCount} / ${totalQuestions}
                        </td>
                        <td style="padding: 0.85rem; text-align: center; font-weight: 800; color: #38bdf8;">
                          ${accuracy}%
                        </td>
                        <td style="padding: 0.85rem; text-align: center; font-weight: 900; color: #ffe600;">
                          🔥 x${p.streak || 0}
                        </td>
                        <td style="padding: 0.85rem; text-align: right; font-weight: 900; font-size: 1.15rem; color: #ffe600;">
                          🏆 ${p.score || 0} PTS
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          `}
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
        const picks = Array.isArray(r.answerIndex) ? r.answerIndex : [r.answerIndex];
        picks.forEach(pi => {
          if (pi !== undefined && counts[pi] !== undefined) {
            counts[pi]++;
          }
        });
      });
    }

    if (this.isSolo && this.selectedAnswer !== null) {
      const soloPicks = Array.isArray(this.selectedAnswer) ? this.selectedAnswer : [this.selectedAnswer];
      soloPicks.forEach(pi => {
        if (counts[pi] !== undefined) counts[pi] = 1;
      });
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
                        <div class="host-live-author-avatar">${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(p, 38) : p.avatar}</div>
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

          ${(q.explanation || q.referenceNorm) ? `
            <!-- Panel de Justificación Pedagógica y Normativa de Referencia para el Docente y Grupo -->
            <div style="background: rgba(11, 24, 56, 0.96); border: 2px solid #00f5d4; border-radius: 18px; padding: 1.4rem 1.8rem; margin: 1.75rem auto 0; text-align: left; box-shadow: 0 12px 35px rgba(0,0,0,0.7), 0 0 25px rgba(0, 245, 212, 0.2); max-width: 850px;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.85rem; border-bottom: 1.5px solid rgba(0,245,212,0.3); padding-bottom: 0.65rem;">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                  <span style="font-size: 1.3rem;">💡</span>
                  <span style="font-size: 0.88rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.8px; color: #00f5d4;">
                    Justificación Pedagógica del Caso
                  </span>
                </div>
                ${q.caseTitle ? `
                  <span style="font-size: 0.95rem; font-weight: 800; color: #ffffff;">${this.escapeHtml(q.caseTitle)}</span>
                ` : ''}
              </div>
              ${q.explanation ? `
                <div style="font-size: 1rem; color: #f1f5f9; line-height: 1.65; white-space: pre-wrap; margin-bottom: 0.75rem;">
                  ${this.escapeHtml(q.explanation)}
                </div>
              ` : ''}
              ${q.referenceNorm ? `
                <div style="margin-top: 1rem; padding: 0.85rem 1.1rem; background: rgba(0, 245, 212, 0.08); border-radius: 10px; border-left: 4px solid #ffd166; display: flex; align-items: flex-start; gap: 0.6rem;">
                  <span style="font-size: 1.2rem; line-height: 1;">⚖️</span>
                  <div>
                    <span style="font-size: 0.78rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #ffd166; display: block; margin-bottom: 0.2rem;">Normativa / Marco de Referencia:</span>
                    <span style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">${this.escapeHtml(q.referenceNorm)}</span>
                  </div>
                </div>
              ` : ''}
            </div>
          ` : ''}

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
    if (this.isSolo && window.ProfileView && typeof window.ProfileView.recordQuizCompletion === 'function') {
      window.ProfileView.recordQuizCompletion(this.challenge || this.room?.challenge, this.room?.players?.[0]);
    }
    window.appRouter.showPodium(this.room);
  },

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.isSolo && window.ProfileView && typeof window.ProfileView.recordQuizProgress === 'function') {
      window.ProfileView.recordQuizProgress(this.challenge, this.currentQuestionIndex, this.room?.players?.[0]);
    }
    this.renderQuestionScreen();
  }
};

window.addEventListener('resize', () => {
  if (window.GameView && typeof window.GameView.adjustCardAndBannerTextSizes === 'function') {
    window.GameView.adjustCardAndBannerTextSizes();
  }
});

