/**
 * 🔥 TE RETO - Pantalla "Seleccionar experiencia"
 * Permite a los profesores y anfitriones elegir entre los 14 modos de juego
 * con tarjetas horizontales, ilustraciones vectoriales 3D estilo videojuego,
 * previsualización de mecánicas y configuración antes de abrir la sala (Lobby).
 */

window.ExperienceView = {
  currentChallenge: null,
  selectedModeId: 'clasico',
  customConfig: {},

  render(challenge, preselectedModeId = 'clasico') {
    const container = document.getElementById('view-experience');
    if (!container) return;

    this.currentChallenge = challenge;
    this.selectedModeId = preselectedModeId;
    const modes = window.GameModes ? window.GameModes.modes : [];
    const selectedMode = window.GameModes ? window.GameModes.getMode(this.selectedModeId) : modes[0];
    this.customConfig = { ...(selectedMode?.config || {}) };

    container.innerHTML = `
      <div class="experience-screen-container">
        
        <!-- Header de la Pantalla "Seleccionar experiencia" -->
        <div class="experience-header">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem;">
            <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.5rem;" onclick="window.appRouter.navigate('home')">
              <span>←</span> Volver a los Retos
            </button>
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="badge-tag" style="background: rgba(0, 245, 212, 0.15); color: var(--neon-cyan); font-weight: 800; border: 1px solid var(--neon-cyan); padding: 0.35rem 0.8rem;">
                🎮 14 MODOS DISPONIBLES
              </span>
            </div>
          </div>

          <div style="text-align: center; max-width: 800px; margin: 0 auto 2.5rem;">
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(114, 9, 183, 0.2); border: 1px solid rgba(247, 37, 133, 0.4); padding: 0.35rem 1rem; border-radius: 9999px; margin-bottom: 0.85rem;">
              <span style="font-size: 1.1rem;">✨</span>
              <span style="font-size: 0.82rem; font-weight: 800; color: #ffd166; text-transform: uppercase; letter-spacing: 0.5px;">Estudio de Dinámicas de Juego</span>
            </div>
            <h1 style="font-size: clamp(2.2rem, 5vw, 3.4rem); font-weight: 900; line-height: 1.15; margin-bottom: 0.75rem;">
              Seleccionar <span class="gradient-title">experiencia</span>
            </h1>
            <p style="font-size: clamp(1rem, 2vw, 1.25rem); color: var(--text-secondary); max-width: 650px; margin: 0 auto 1.25rem;">
              Elige la dinámica con la que tus alumnos competirán en el reto:
            </p>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: var(--bg-card); border: 1px solid var(--border-color); padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 800; font-size: 0.95rem; color: var(--text-primary); box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
              <span>🎯</span> <span>${challenge.title}</span>
              <span style="color: var(--text-muted);">•</span>
              <span style="color: var(--neon-cyan);">${challenge.questions?.length || 0} preguntas</span>
            </div>
          </div>
        </div>

        <!-- Cuadrícula Responsiva de Tarjetas Horizontales de Modos -->
        <div class="experience-grid-wrapper">
          <div class="experience-grid" id="experience-cards-grid">
            ${modes.map(mode => this.renderCard(mode, mode.id === this.selectedModeId)).join('')}
          </div>
        </div>

        <!-- Panel Inferior de Configuración y Lanzamiento a la Sala -->
        <div class="experience-action-bar" id="experience-action-bar">
          ${this.renderConfigBar(selectedMode)}
        </div>

      </div>
    `;
  },

  renderCard(mode, isSelected) {
    return `
      <div 
        class="experience-card ${isSelected ? 'selected' : ''}" 
        id="card-mode-${mode.id}"
        onclick="window.ExperienceView.selectMode('${mode.id}')"
        style="--mode-color: ${mode.themeColor}; --mode-accent: ${mode.accentColor};"
      >
        <!-- Badge de Categoría / Tipo en la esquina -->
        <div class="experience-card-badge">
          ${mode.badge}
        </div>

        <!-- Indicador visual de selección -->
        <div class="experience-selected-check">
          ✓
        </div>

        <!-- Contenedor de Ilustración Vectorial 3D / Cartoon con proporción fija -->
        <div class="experience-illustration-box">
          ${mode.renderIllustration()}
          <div class="experience-illustration-glow"></div>
        </div>

        <!-- Nombre corto y descripción debajo de la tarjeta -->
        <div class="experience-card-footer">
          <div class="experience-card-name">
            <span class="experience-card-icon">${mode.icon}</span>
            <span class="experience-card-title">${mode.shortName}</span>
          </div>
          <p class="experience-card-desc">
            ${mode.description}
          </p>
        </div>
      </div>
    `;
  },

  renderConfigBar(mode) {
    if (!mode) return '';

    return `
      <div class="glass-panel experience-config-panel">
        <div class="experience-config-left">
          <div class="experience-mode-avatar" style="background: ${mode.gradient};">
            <span>${mode.icon}</span>
          </div>
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
              <h3 style="font-size: 1.4rem; color: var(--text-primary); margin: 0; font-weight: 900;">${mode.name}</h3>
              <span class="badge-tag" style="background: rgba(255,255,255,0.12); color: #ffd166; font-size: 0.75rem; font-weight: 800;">${mode.badge}</span>
            </div>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin-top: 0.35rem; line-height: 1.4; max-width: 620px;">
              ${mode.description}
            </p>
          </div>
        </div>

        <div class="experience-config-right">
          <!-- Opciones rápidas de configuración según el modo -->
          ${this.renderModeCustomSettings(mode)}

          <button 
            class="btn btn-outline btn-lg" 
            onclick="window.ExperienceView.playSoloWithMode()"
            style="border: 2px solid ${mode.accentColor || 'var(--neon-cyan)'}; color: var(--text-primary); font-weight: 800; font-size: 1rem; padding: 0.85rem 1.4rem; border-radius: var(--border-radius-md); display: inline-flex; align-items: center; gap: 0.5rem;"
          >
            <span>▶️</span> <span>Probar Solo</span>
          </button>

          <button 
            class="btn btn-primary btn-lg experience-launch-btn" 
            onclick="window.ExperienceView.confirmAndLaunch()"
            style="background: ${mode.gradient}; border: none; font-weight: 900; font-size: 1.15rem; padding: 0.9rem 2.2rem; box-shadow: 0 0 25px rgba(0, 245, 212, 0.4); border-radius: var(--border-radius-md); display: inline-flex; align-items: center; gap: 0.65rem;"
          >
            <span>🚀</span> <span>¡Crear Sala con este Modo!</span>
          </button>
        </div>
      </div>
    `;
  },

  renderModeCustomSettings(mode) {
    switch (mode.id) {
      case 'carrera_relampago':
        return `
          <div class="experience-setting-pill">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block;">MULTIPLICADOR DE VELOCIDAD</label>
            <select onchange="window.ExperienceView.customConfig.multiplier = parseFloat(this.value)" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #ffd166; border-radius: 8px; padding: 0.35rem 0.65rem; font-weight: 800; font-size: 0.9rem; outline: none;">
              <option value="1.5">⚡ 1.5x (Moderado)</option>
              <option value="2.0" selected>⚡ 2.0x (Relámpago Estándar)</option>
              <option value="3.0">⚡ 3.0x (Ultrarápido)</option>
            </select>
          </div>
        `;

      case 'bomba_preguntas':
        return `
          <div class="experience-setting-pill">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block;">TIEMPO DE LA MECHA</label>
            <select onchange="window.ExperienceView.customConfig.fuseSeconds = parseInt(this.value)" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #ef4444; border-radius: 8px; padding: 0.35rem 0.65rem; font-weight: 800; font-size: 0.9rem; outline: none;">
              <option value="10">💣 10 segundos (Frenético)</option>
              <option value="15" selected>💣 15 segundos (Estándar)</option>
              <option value="20">💣 20 segundos (Estratégico)</option>
            </select>
          </div>
        `;

      case 'ultimo_superviviente':
        return `
          <div class="experience-setting-pill">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block;">VIDAS INICIALES</label>
            <select onchange="window.ExperienceView.customConfig.startingLives = parseInt(this.value)" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #f43f5e; border-radius: 8px; padding: 0.35rem 0.65rem; font-weight: 800; font-size: 0.9rem; outline: none;">
              <option value="2">❤️❤️ 2 Vidas (Extremo)</option>
              <option value="3" selected>❤️❤️❤️ 3 Vidas (Recomendado)</option>
              <option value="5">❤️❤️❤️❤️❤️ 5 Vidas (Casual)</option>
            </select>
          </div>
        `;

      case 'conquista':
        return `
          <div class="experience-setting-pill">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block;">TERRITORIOS DEL MAPA</label>
            <select onchange="window.ExperienceView.customConfig.territories = parseInt(this.value)" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #00f5d4; border-radius: 8px; padding: 0.35rem 0.65rem; font-weight: 800; font-size: 0.9rem; outline: none;">
              <option value="3">🗺️ 3 Zonas (Rápido)</option>
              <option value="5" selected>🗺️ 5 Zonas (Estándar)</option>
              <option value="7">🗺️ 7 Zonas (Guerra Total)</option>
            </select>
          </div>
        `;

      case 'rompecabezas':
        return `
          <div class="experience-setting-pill">
            <label style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; display: block;">PIEZAS DEL PUZZLE</label>
            <select onchange="window.ExperienceView.customConfig.puzzlePieces = parseInt(this.value)" style="background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #a78bfa; border-radius: 8px; padding: 0.35rem 0.65rem; font-weight: 800; font-size: 0.9rem; outline: none;">
              <option value="4">🧩 4 Piezas (Fácil)</option>
              <option value="6" selected>🧩 6 Piezas (Equilibrado)</option>
              <option value="9">🧩 9 Piezas (Desafío)</option>
            </select>
          </div>
        `;

      default:
        return '';
    }
  },

  selectMode(modeId) {
    if (this.selectedModeId === modeId) return;
    this.selectedModeId = modeId;
    if (window.soundEngine) window.soundEngine.playTick();

    // Actualizar clases de selección en las tarjetas
    const cards = document.querySelectorAll('.experience-card');
    cards.forEach(card => card.classList.remove('selected'));

    const selectedCard = document.getElementById(`card-mode-${modeId}`);
    if (selectedCard) {
      selectedCard.classList.add('selected');
    }

    // Actualizar barra de configuración inferior con suave animación
    const mode = window.GameModes ? window.GameModes.getMode(modeId) : null;
    this.customConfig = { ...(mode?.config || {}) };
    const actionBar = document.getElementById('experience-action-bar');
    if (actionBar && mode) {
      actionBar.innerHTML = this.renderConfigBar(mode);
    }
  },

  confirmAndLaunch() {
    if (!this.currentChallenge) return;
    if (window.soundEngine) window.soundEngine.playClick();

    // Preguntar al maestro si tiene lista de nombres y correos o si los alumnos ponen su nombre
    window.LobbyView.openCreateRoomRosterModal(
      this.currentChallenge,
      this.selectedModeId,
      this.customConfig
    );
  },

  playSoloWithMode() {
    if (!this.currentChallenge) return;
    if (window.soundEngine && window.soundEngine.playClick) {
      window.soundEngine.playClick();
    }
    window.appRouter.navigate('game');
    window.GameView.initSolo(this.currentChallenge, this.selectedModeId);
  }
};
