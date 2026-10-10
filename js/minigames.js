/**
 * 🎮 MENTIX / TE RETO - MINIJUEGOS DE SALA DE ESPERA
 * Actividades rápidas, ligeras y gamificadas para mantener a los alumnos entretenidos
 * mientras esperan el inicio de la prueba, acumulando XP sin afectar la evaluación real.
 */

window.LobbyMinigames = {
  currentTab: 'lightning', // 'lightning' | 'reaction' | 'hidden_items' | 'emotes'
  active: true,
  itemsFound: {},
  reactionState: 'idle', // 'idle' | 'waiting' | 'ready' | 'result'
  reactionStartTime: 0,
  reactionTimeout: null,
  lightningCurrentQ: null,
  lightningAnswered: false,

  // Banco de preguntas relámpago rápidas de calentamiento mental
  lightningQuestions: [
    {
      q: '¿Cuál es el planeta más grande de nuestro Sistema Solar?',
      options: ['Saturno', 'Júpiter', 'Neptuno', 'Marte'],
      correct: 1,
      fact: '¡Júpiter es más de 300 veces más masivo que la Tierra!'
    },
    {
      q: '¿A cuántos grados Celsius hierve el agua a nivel del mar?',
      options: ['90°C', '80°C', '100°C', '120°C'],
      correct: 2,
      fact: '¡El punto de ebullición exacto a 1 atmósfera es 100°C!'
    },
    {
      q: '¿Qué órgano del cuerpo humano consume más energía?',
      options: ['El Corazón', 'El Cerebro', 'Los Pulmones', 'El Hígado'],
      correct: 1,
      fact: '¡El cerebro gasta cerca del 20% de toda tu glucosa y oxígeno!'
    },
    {
      q: '¿Cuántos bits equivalen exactamente a 1 Byte?',
      options: ['4 bits', '8 bits', '16 bits', '32 bits'],
      correct: 1,
      fact: '¡8 bits forman 1 byte!'
    },
    {
      q: '¿Cuál es el animal terrestre más veloz del mundo?',
      options: ['Guepardo', 'Leopardo', 'Antílope', 'Caballo'],
      correct: 0,
      fact: '¡El guepardo puede superar los 100 km/h en segundos!'
    },
    {
      q: '¿Qué elemento químico tiene el símbolo "Au"?',
      options: ['Plata', 'Cobre', 'Oro', 'Hierro'],
      correct: 2,
      fact: '¡Proviene del latín "aurum", que significa brillante aurora!'
    },
    {
      q: '¿Cuántos lados tiene un heptágono regular?',
      options: ['6', '7', '8', '9'],
      correct: 1,
      fact: '¡Hepta significa siete en griego!'
    },
    {
      q: '¿En qué continente se encuentra la Cordillera de los Andes?',
      options: ['Europa', 'Asia', 'América del Sur', 'África'],
      correct: 2,
      fact: '¡Es la cadena montañosa continental más larga del planeta!'
    }
  ],

  init(containerEl) {
    this.container = containerEl;
    this.render();
  },

  destroy() {
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
  },

  setTab(tab) {
    this.currentTab = tab;
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
    this.reactionState = 'idle';
    this.render();
  },

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="lobby-minigames-box glass-panel" style="padding: 1.25rem; border-radius: 18px; border: 1.5px solid rgba(0, 245, 212, 0.35); background: rgba(5, 12, 35, 0.75);">
        <!-- Pestañas de Minijuegos estilo Consola Gamer -->
        <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; overflow-x: auto; padding-bottom: 0.25rem;" class="minigames-tabs-bar">
          <button 
            class="btn btn-sm ${this.currentTab === 'lightning' ? 'btn-cyan' : 'btn-outline'}" 
            onclick="window.LobbyMinigames.setTab('lightning')"
            style="font-weight: 800; border-radius: 9999px; white-space: nowrap;"
          >
            ⚡ Reto Relámpago
          </button>
          <button 
            class="btn btn-sm ${this.currentTab === 'reaction' ? 'btn-cyan' : 'btn-outline'}" 
            onclick="window.LobbyMinigames.setTab('reaction')"
            style="font-weight: 800; border-radius: 9999px; white-space: nowrap;"
          >
            ⏱️ Reacción Gamer
          </button>
          <button 
            class="btn btn-sm ${this.currentTab === 'hidden_items' ? 'btn-cyan' : 'btn-outline'}" 
            onclick="window.LobbyMinigames.setTab('hidden_items')"
            style="font-weight: 800; border-radius: 9999px; white-space: nowrap;"
          >
            💎 Caza de Orbes
          </button>
          <button 
            class="btn btn-sm ${this.currentTab === 'emotes' ? 'btn-cyan' : 'btn-outline'}" 
            onclick="window.LobbyMinigames.setTab('emotes')"
            style="font-weight: 800; border-radius: 9999px; white-space: nowrap;"
          >
            📸 Foto / Emotes
          </button>
        </div>

        <!-- Contenido dinámico del minijuego -->
        <div id="minigame-content-area" style="min-height: 220px; display: flex; flex-direction: column; justify-content: center;">
          ${this.renderActiveTab()}
        </div>
      </div>
    `;

    // Si es pestaña de reacción o relámpago, enlazar eventos tras el render
    if (this.currentTab === 'lightning' && !this.lightningCurrentQ) {
      this.nextLightningQuestion();
    }
  },

  renderActiveTab() {
    switch (this.currentTab) {
      case 'reaction':
        return this.renderReactionTab();
      case 'hidden_items':
        return this.renderHiddenItemsTab();
      case 'emotes':
        return this.renderEmotesTab();
      case 'lightning':
      default:
        return this.renderLightningTab();
    }
  },

  // ----------------------------------------------------------------
  // ⚡ MINIJUEGO 1: RETO RELÁMPAGO (Calentamiento mental)
  // ----------------------------------------------------------------
  renderLightningTab() {
    if (!this.lightningCurrentQ) {
      this.lightningCurrentQ = this.lightningQuestions[Math.floor(Math.random() * this.lightningQuestions.length)];
      this.lightningAnswered = false;
    }
    const q = this.lightningCurrentQ;

    return `
      <div style="text-align: center;">
        <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 800; color: #ffd166; background: rgba(255, 209, 102, 0.15); border: 1px solid #ffd166; padding: 0.2rem 0.65rem; border-radius: 9999px; margin-bottom: 0.6rem;">
          <span>⚡</span> PREGUNTA DE PRÁCTICA (+35 XP)
        </div>
        <h4 style="font-size: 1.15rem; font-weight: 900; color: #ffffff; margin: 0 0 1rem; line-height: 1.35;">
          ${q.q}
        </h4>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.65rem;">
          ${q.options.map((opt, idx) => `
            <button 
              class="btn btn-outline" 
              id="lightning-opt-${idx}"
              style="padding: 0.65rem 0.5rem; font-size: 0.88rem; font-weight: 800; border-radius: 10px; border-color: rgba(255,255,255,0.2); background: rgba(15,23,42,0.6);"
              onclick="window.LobbyMinigames.answerLightning(${idx})"
              ${this.lightningAnswered ? 'disabled' : ''}
            >
              ${opt}
            </button>
          `).join('')}
        </div>
        <div id="lightning-feedback" style="margin-top: 0.85rem; font-size: 0.85rem; min-height: 24px; font-weight: 700;"></div>
      </div>
    `;
  },

  answerLightning(idx) {
    if (this.lightningAnswered) return;
    this.lightningAnswered = true;
    const q = this.lightningCurrentQ;
    const isCorrect = idx === q.correct;
    const feedback = document.getElementById('lightning-feedback');
    const clickedBtn = document.getElementById(`lightning-opt-${idx}`);
    const correctBtn = document.getElementById(`lightning-opt-${q.correct}`);

    if (correctBtn) {
      correctBtn.style.background = '#10b981';
      correctBtn.style.borderColor = '#10b981';
      correctBtn.style.color = '#ffffff';
    }

    if (isCorrect) {
      if (window.soundEngine) window.soundEngine.playCorrect();
      if (window.AvatarEngine) window.AvatarEngine.awardXP(35, 'Reto Relámpago acertado');
      if (feedback) {
        feedback.innerHTML = `
          <span style="color: #00f5d4;">✨ ¡Correcto! +35 XP</span> • <span style="color: var(--text-secondary);">${q.fact}</span>
          <br><button class="btn btn-sm btn-cyan" style="margin-top: 0.5rem; font-weight: 800;" onclick="window.LobbyMinigames.nextLightningQuestion()">Siguiente Pregunta →</button>
        `;
      }
    } else {
      if (clickedBtn) {
        clickedBtn.style.background = '#ef4444';
        clickedBtn.style.borderColor = '#ef4444';
        clickedBtn.style.color = '#ffffff';
      }
      if (window.soundEngine) window.soundEngine.playWrong();
      if (feedback) {
        feedback.innerHTML = `
          <span style="color: #f87171;">❌ Casi. ${q.fact}</span>
          <br><button class="btn btn-sm btn-outline" style="margin-top: 0.5rem; font-weight: 800;" onclick="window.LobbyMinigames.nextLightningQuestion()">Intentar Otra →</button>
        `;
      }
    }
  },

  nextLightningQuestion() {
    this.lightningCurrentQ = this.lightningQuestions[Math.floor(Math.random() * this.lightningQuestions.length)];
    this.lightningAnswered = false;
    this.render();
  },

  // ----------------------------------------------------------------
  // ⏱️ MINIJUEGO 2: REACCIÓN GAMER (Prueba de reflejos en ms)
  // ----------------------------------------------------------------
  renderReactionTab() {
    let content = '';
    if (this.reactionState === 'idle') {
      content = `
        <div style="text-align: center; padding: 1.5rem 0.5rem;">
          <div style="font-size: 2.4rem; margin-bottom: 0.5rem;">⚡</div>
          <h4 style="font-size: 1.15rem; font-weight: 900; color: #ffffff; margin: 0 0 0.4rem;">
            Test de Reflejos Gamer
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 1.25rem;">
            Toca el botón cuando cambie a <strong style="color: #00f5d4;">VERDE NEÓN</strong>. ¡Pon a prueba tu agilidad mental!
          </p>
          <button 
            class="btn btn-cyan btn-lg" 
            style="font-weight: 900; padding: 0.85rem 2rem; border-radius: 9999px;" 
            onclick="window.LobbyMinigames.startReactionTest()"
          >
            🎮 Iniciar Prueba
          </button>
        </div>
      `;
    } else if (this.reactionState === 'waiting') {
      content = `
        <div 
          style="text-align: center; padding: 2.5rem 1rem; background: rgba(239, 68, 68, 0.2); border: 2px dashed #ef4444; border-radius: 16px; cursor: pointer;"
          onclick="window.LobbyMinigames.handleEarlyReactionClick()"
        >
          <div style="font-size: 2.8rem; margin-bottom: 0.4rem;">🔴</div>
          <h3 style="font-size: 1.4rem; font-weight: 900; color: #fca5a5; margin: 0 0 0.25rem;">
            ¡ESPERA EL VERDE...!
          </h3>
          <p style="font-size: 0.85rem; color: #fecaca; margin: 0;">
            No presiones todavía o fallarás.
          </p>
        </div>
      `;
    } else if (this.reactionState === 'ready') {
      content = `
        <div 
          style="text-align: center; padding: 2.5rem 1rem; background: rgba(0, 245, 212, 0.35); border: 3px solid #00f5d4; border-radius: 16px; cursor: pointer; animation: timer-pulse 0.4s infinite alternate; box-shadow: 0 0 35px rgba(0, 245, 212, 0.7);"
          onclick="window.LobbyMinigames.handleReactionSuccess()"
        >
          <div style="font-size: 3rem; margin-bottom: 0.3rem;">⚡</div>
          <h2 style="font-size: 1.8rem; font-weight: 900; color: #00f5d4; margin: 0; text-shadow: 0 0 15px #00f5d4;">
            ¡¡PULSA AHORA!!
          </h2>
        </div>
      `;
    } else if (this.reactionState === 'result') {
      content = `
        <div style="text-align: center; padding: 1.25rem 0.5rem;">
          <div style="font-size: 2.4rem; margin-bottom: 0.35rem;">🏆</div>
          <h4 style="font-size: 1.25rem; font-weight: 900; color: #00f5d4; margin: 0 0 0.35rem;">
            ${this.lastReactionScore} ms
          </h4>
          <p style="font-size: 0.9rem; color: #ffffff; font-weight: 800; margin: 0 0 1rem;">
            Rango: <span style="color: #ffd166;">${this.lastReactionRank}</span> (+${this.lastReactionXP} XP)
          </p>
          <button 
            class="btn btn-outline" 
            style="font-weight: 800; border-radius: 9999px; padding: 0.6rem 1.4rem;" 
            onclick="window.LobbyMinigames.startReactionTest()"
          >
            🔄 Intentar Otra Vez
          </button>
        </div>
      `;
    }

    return content;
  },

  startReactionTest() {
    this.reactionState = 'waiting';
    this.render();

    // Tiempo aleatorio entre 1.5 y 4.2 segundos
    const delay = 1500 + Math.random() * 2700;
    this.reactionTimeout = setTimeout(() => {
      this.reactionState = 'ready';
      this.reactionStartTime = Date.now();
      if (window.soundEngine) window.soundEngine.playTick();
      this.render();
    }, delay);
  },

  handleEarlyReactionClick() {
    if (this.reactionTimeout) {
      clearTimeout(this.reactionTimeout);
      this.reactionTimeout = null;
    }
    this.reactionState = 'idle';
    if (window.soundEngine) window.soundEngine.playWrong();
    alert('⚠️ ¡Muy rápido! Espera a que la pantalla se ponga verde neón.');
    this.render();
  },

  handleReactionSuccess() {
    const elapsed = Date.now() - this.reactionStartTime;
    this.lastReactionScore = elapsed;

    let rank = 'NORMAL';
    let xp = 15;
    if (elapsed < 240) {
      rank = '⚡ REFLEJOS DIOS (PRO)';
      xp = 40;
    } else if (elapsed < 320) {
      rank = '🔥 ULTRA RÁPIDO';
      xp = 30;
    } else if (elapsed < 420) {
      rank = '🎯 MUY BUENO';
      xp = 20;
    }

    this.lastReactionRank = rank;
    this.lastReactionXP = xp;
    this.reactionState = 'result';

    if (window.soundEngine) window.soundEngine.playPowerUp();
    if (window.AvatarEngine) window.AvatarEngine.awardXP(xp, `Reflejos: ${elapsed}ms`);
    this.render();
  },

  // ----------------------------------------------------------------
  // 💎 MINIJUEGO 3: ENCUENTRA EL OBJETO / CAZA DE ORBES
  // ----------------------------------------------------------------
  renderHiddenItemsTab() {
    const items = [
      { id: 'orb_1', name: 'Orbe Cuántico', icon: '🔮', desc: 'Energía de datos oculta', xp: 30 },
      { id: 'trophy_1', name: 'Trofeo Dorado', icon: '🏆', desc: 'Emblema de sabiduría', xp: 45 },
      { id: 'chip_1', name: 'Microchip Neón', icon: '💾', desc: 'Cálculo a la velocidad de la luz', xp: 35 }
    ];

    const foundCount = Object.keys(this.itemsFound).length;

    return `
      <div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
          <span style="font-size: 0.85rem; font-weight: 800; color: #00f5d4;">
            💎 Reliquias Encontradas: ${foundCount} / 3
          </span>
          <span style="font-size: 0.75rem; color: var(--text-muted);">
            Toca cada objeto para recolectar su XP
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem;">
          ${items.map(it => {
            const found = !!this.itemsFound[it.id];
            return `
              <div 
                class="glass-panel" 
                style="text-align: center; padding: 1rem 0.5rem; border-radius: 12px; border: 1.5px solid ${found ? '#10b981' : 'rgba(255,255,255,0.15)'}; background: ${found ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15,23,42,0.6)'}; cursor: ${found ? 'default' : 'pointer'}; transition: transform 0.2s;"
                onclick="window.LobbyMinigames.collectItem('${it.id}', ${it.xp})"
                ${!found ? 'onmouseenter="this.style.transform=\'scale(1.05)\'" onmouseleave="this.style.transform=\'none\'"' : ''}
              >
                <div style="font-size: 2.2rem; filter: ${found ? 'drop-shadow(0 0 10px #10b981)' : 'grayscale(60%)'}; margin-bottom: 0.35rem;">
                  ${it.icon}
                </div>
                <div style="font-size: 0.82rem; font-weight: 800; color: #ffffff;">${it.name}</div>
                <div style="font-size: 0.72rem; color: ${found ? '#34d399' : '#ffd166'}; font-weight: 700; margin-top: 0.2rem;">
                  ${found ? '✅ Colectado' : `+${it.xp} XP`}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  collectItem(id, xp) {
    if (this.itemsFound[id]) return;
    this.itemsFound[id] = true;
    if (window.soundEngine) window.soundEngine.playPowerUp();
    if (window.AvatarEngine) window.AvatarEngine.awardXP(xp, 'Reliquia encontrada');
    this.render();
  },

  // ----------------------------------------------------------------
  // 📸 MINIJUEGO 4: FOTO Y EMOTE STUDIO
  // ----------------------------------------------------------------
  renderEmotesTab() {
    const av = window.AvatarEngine ? window.AvatarEngine.getSavedAvatar() : {};
    return `
      <div style="text-align: center;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #d946ef; margin-bottom: 0.5rem;">
          📸 Tarjeta de Jugador & Poses en Vivo
        </div>
        <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0 0 1rem;">
          Elige una pose para lucirte ante tus compañeros en la sala:
        </p>
        <div style="display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1rem;">
          ${['wave', 'celebrate', 'dance', 'victory', 'focus', 'laugh'].map(eKey => {
            const emoteObj = window.AvatarEngine?.emotes?.[eKey] || { name: eKey, icon: '✨' };
            return `
              <button 
                class="btn btn-sm btn-outline" 
                style="border-radius: 9999px; font-weight: 800; font-size: 0.8rem; padding: 0.35rem 0.75rem;"
                onclick="window.LobbyMinigames.triggerEmote('${eKey}')"
              >
                ${emoteObj.icon} ${emoteObj.name}
              </button>
            `;
          }).join('')}
        </div>
        <div style="display: flex; justify-content: center; gap: 0.6rem;">
          <button 
            class="btn btn-cyan btn-sm" 
            style="font-weight: 800; border-radius: 8px;"
            onclick="window.LobbyMinigames.takeAvatarSnapshot()"
          >
            📷 Sacar Captura / Flash
          </button>
        </div>
      </div>
    `;
  },

  triggerEmote(eKey) {
    if (window.AvatarEngine) {
      window.AvatarEngine.saveAvatar({ emote: eKey });
      window.AvatarEngine.awardXP(10, `Gesto ejecutado: ${eKey}`);
    }
    // Sincronizar actualización con los demás en la sala
    if (window.LobbyView && typeof window.LobbyView.broadcastAvatarUpdate === 'function') {
      window.LobbyView.broadcastAvatarUpdate();
    }
    // Re-render del panel del personaje
    if (window.LobbyView && typeof window.LobbyView.updateMyCharacterPanel === 'function') {
      window.LobbyView.updateMyCharacterPanel();
    }
  },

  takeAvatarSnapshot() {
    if (window.soundEngine) window.soundEngine.playClick();
    // Efecto de flash fotográfico en pantalla
    const flash = document.createElement('div');
    flash.style.position = 'fixed';
    flash.style.top = '0';
    flash.style.left = '0';
    flash.style.width = '100vw';
    flash.style.height = '100vh';
    flash.style.background = '#ffffff';
    flash.style.zIndex = '99999';
    flash.style.opacity = '0.9';
    flash.style.transition = 'opacity 0.5s ease-out';
    document.body.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = '0';
      setTimeout(() => flash.remove(), 500);
    }, 80);

    if (window.AvatarEngine) {
      window.AvatarEngine.awardXP(25, 'Foto virtual tomada');
    }
  }
};

console.log('✅ LobbyMinigames cargado exitosamente.');
