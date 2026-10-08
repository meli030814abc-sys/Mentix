/**
 * 🔥 TE RETO - Sala de Juego (Lobby)
 * Gestiona la sala para el Anfitrión (Host) con PIN, QR, lista en tiempo real y bots;
 * y la pantalla de unión y espera para los Jugadores.
 */

window.LobbyView = {
  mode: 'host', // 'host' | 'join' | 'waiting'
  joinStep: 'pin', // 'pin' | 'profile'
  joinPin: '',
  joinRoomData: null,
  currentRoom: null,

  selectedRosterMode: 'open', // 'open' | 'roster'
  pendingChallenge: null,
  pendingModeId: 'clasico',
  pendingModeConfig: {},

  initHost(challenge, gameMode = 'clasico', modeConfig = {}, rosterConfig = null) {
    this.mode = 'host';
    this.currentRoom = window.realtimeEngine.createRoom(challenge, gameMode, modeConfig, rosterConfig);
    this.setupListeners();
    this.render();
  },

  initJoin(prefilledPin = '') {
    this.mode = 'join';
    const cleanPrefilled = (prefilledPin || '').toString().replace(/\D/g, '').trim();
    if (cleanPrefilled && cleanPrefilled.length >= 4) {
      this.joinPin = cleanPrefilled;
      const room = this.findRoomByPin(cleanPrefilled);
      if (room) {
        this.joinRoomData = room;
        this.joinStep = 'profile';
      } else {
        this.joinStep = 'pin';
      }
    } else {
      this.joinStep = 'pin';
      this.joinPin = '';
      this.joinRoomData = null;
    }
    this.setupListeners();
    this.render();
  },

  findRoomByPin(pin) {
    if (!pin) return null;
    const clean = pin.toString().replace(/\D/g, '').trim();
    try {
      const stored = localStorage.getItem(`te_reto_room_${clean}`) || localStorage.getItem(`mentix_room_${clean}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn(e);
    }
    if (window.realtimeEngine?.currentRoom?.pin === clean) {
      return window.realtimeEngine.currentRoom;
    }
    return null;
  },

  setupListeners() {
    if (this.listenersSetup) return;
    this.listenersSetup = true;

    window.realtimeEngine.on('PLAYER_JOIN', (data) => {
      if (this.mode === 'host' && this.currentRoom && data.pin === this.currentRoom.pin) {
        // Evitar duplicados por id o nickname idéntico
        const exists = this.currentRoom.players.some(p => p.id === data.player.id || p.nickname.toLowerCase() === data.player.nickname.toLowerCase());
        if (!exists) {
          this.currentRoom.players.push(data.player);
          if (this.currentRoom.roster && this.currentRoom.roster.length > 0) {
            this.currentRoom.roster.forEach(st => {
              if ((data.player.rosterStudentId && st.id === data.player.rosterStudentId) ||
                  (data.player.email && st.email && data.player.email.toLowerCase() === st.email.toLowerCase()) ||
                  (st.name.toLowerCase() === data.player.nickname.toLowerCase())) {
                st.joined = true;
              }
            });
          }
          window.soundEngine.playTick();
          window.realtimeEngine.syncRoomState();
          this.render();
        }
      }
    });

    window.realtimeEngine.on('START_GAME', (data) => {
      const myPin = window.realtimeEngine.currentRoom?.pin;
      if (this.mode === 'waiting' && (!data.pin || data.pin === myPin)) {
        if (this.waitingPollInterval) clearInterval(this.waitingPollInterval);
        window.soundEngine.playFanfare();
        window.appRouter.startLivePlayerGame(data.room || window.realtimeEngine.currentRoom);
      }
    });

    // Sincronizar el estado de la sala (incluyendo el modo de juego exacto) enviado por el anfitrión
    window.realtimeEngine.on('HOST_ROOM_STATE', (data) => {
      const myPin = window.realtimeEngine.currentRoom?.pin;
      if (data && (!data.pin || data.pin === myPin) && data.room) {
        if (this.mode === 'waiting') {
          const prevMode = window.realtimeEngine.currentRoom?.gameMode;
          window.realtimeEngine.currentRoom = {
            ...data.room,
            players: data.room.players || window.realtimeEngine.currentRoom?.players || []
          };
          if (prevMode !== data.room.gameMode) {
            this.render();
          }
        }
      }
    });

    // Detectar si el anfitrión cambió el modo de juego en vivo desde el lobby
    window.realtimeEngine.on('MODE_CHANGED', (data) => {
      const myPin = window.realtimeEngine.currentRoom?.pin;
      if (data && (!data.pin || data.pin === myPin) && data.gameMode) {
        if (window.realtimeEngine.currentRoom) {
          window.realtimeEngine.currentRoom.gameMode = data.gameMode;
          window.realtimeEngine.currentRoom.modeConfig = data.modeConfig || {};
        }
        if (this.mode === 'waiting') {
          this.render();
        }
      }
    });
  },

  // ==========================================
  // 🎓 MODAL DE ACCESO: LISTADO VS NICKNAMES
  // ==========================================
  openCreateRoomRosterModal(challenge, gameMode = 'clasico', modeConfig = {}, preselectedGroupId = null) {
    this.pendingChallenge = challenge;
    this.pendingModeId = gameMode;
    this.pendingModeConfig = modeConfig;

    const modal = document.getElementById('roster-config-modal');
    if (!modal) {
      window.appRouter.launchHostWithMode(challenge.id, gameMode, modeConfig);
      return;
    }

    const groupSelect = document.getElementById('roster-group-select');
    if (groupSelect) {
      const groups = window.appState.groups || [];
      groupSelect.innerHTML = `
        <option value="">-- Elige un curso o escribe lista propia --</option>
        ${groups.map(g => `
          <option value="${g.id}" ${preselectedGroupId === g.id ? 'selected' : ''}>
            ${g.name} (${g.students?.length || 0} alumnos con correo)
          </option>
        `).join('')}
        <option value="custom" ${!preselectedGroupId ? 'selected' : ''}>✏️ Escribir o pegar lista manual de alumnos...</option>
      `;
    }

    if (preselectedGroupId) {
      this.selectRosterMode('roster');
      this.onRosterGroupChanged(preselectedGroupId);
    } else {
      this.selectRosterMode('open');
      this.loadExampleRoster();
    }

    modal.classList.add('active');
  },

  closeRosterModal() {
    const modal = document.getElementById('roster-config-modal');
    if (modal) modal.classList.remove('active');
  },

  selectRosterMode(mode) {
    this.selectedRosterMode = mode;
    const cardOpen = document.getElementById('opt-roster-open');
    const cardList = document.getElementById('opt-roster-list');
    const panel = document.getElementById('roster-details-panel');

    if (mode === 'open') {
      cardOpen?.classList.add('selected');
      cardList?.classList.remove('selected');
      if (panel) panel.style.display = 'none';
    } else {
      cardList?.classList.add('selected');
      cardOpen?.classList.remove('selected');
      if (panel) panel.style.display = 'block';
      this.updateRosterPreviewCount();
    }
  },

  onRosterGroupChanged(groupId) {
    const textarea = document.getElementById('roster-students-textarea');
    if (!textarea) return;

    if (!groupId || groupId === 'custom') {
      return;
    }

    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (group && group.students && group.students.length > 0) {
      const lines = group.students.map(st => `${st.name}, ${st.email || (st.name.toLowerCase().replace(/\s+/g, '.') + '@colegio.edu.co')}`);
      textarea.value = lines.join('\n');
      this.updateRosterPreviewCount();
    }
  },

  loadExampleRoster() {
    const textarea = document.getElementById('roster-students-textarea');
    if (textarea && !textarea.value.trim()) {
      textarea.value = [
        'Andrea Valderrama, andrea.valderrama@colegio.edu.co',
        'Juan Sebastián Mora, juan.mora@colegio.edu.co',
        'María Camila Gómez, maria.gomez@colegio.edu.co',
        'Santiago López, santiago.lopez@colegio.edu.co',
        'Valentina Díaz, valentina.diaz@colegio.edu.co'
      ].join('\n');
    }
    this.updateRosterPreviewCount();
  },

  parseRosterTextarea() {
    const textarea = document.getElementById('roster-students-textarea');
    if (!textarea) return [];
    const text = textarea.value.trim();
    if (!text) return [];

    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const students = [];

    lines.forEach((line, idx) => {
      let name = '';
      let email = '';

      if (line.includes(',')) {
        const parts = line.split(',');
        name = parts[0].trim();
        email = parts.slice(1).join(',').trim();
      } else if (line.includes(';')) {
        const parts = line.split(';');
        name = parts[0].trim();
        email = parts.slice(1).join(';').trim();
      } else if (line.includes('\t')) {
        const parts = line.split('\t');
        name = parts[0].trim();
        email = parts.slice(1).join('\t').trim();
      } else {
        name = line.trim();
        email = '';
      }

      if (name) {
        students.push({
          id: 'st_custom_' + idx + '_' + Math.random().toString(36).substr(2, 5),
          name: name,
          email: email,
          avatar: ['😎', '🦁', '🚀', '🦊', '🐯', '🐼', '🐰', '⚡', '🦅', '🐱'][idx % 10]
        });
      }
    });

    return students;
  },

  updateRosterPreviewCount() {
    const students = this.parseRosterTextarea();
    const ind = document.getElementById('roster-count-indicator');
    if (ind) {
      ind.innerHTML = `👥 <strong>${students.length}</strong> alumnos listos con correo`;
    }
  },

  confirmRosterAndLaunch() {
    if (!this.pendingChallenge) return;
    this.closeRosterModal();

    let rosterConfig = { mode: 'open', students: [] };

    if (this.selectedRosterMode === 'roster') {
      const groupSelect = document.getElementById('roster-group-select');
      const selectedGroupId = groupSelect?.value;
      const group = (window.appState.groups || []).find(g => g.id === selectedGroupId);
      const groupName = group ? group.name : 'Curso Oficial';
      const parsedStudents = this.parseRosterTextarea();

      if (parsedStudents.length === 0) {
        alert('Por favor escribe al menos un alumno (Nombre, correo) o selecciona un grupo guardado.');
        this.openCreateRoomRosterModal(this.pendingChallenge, this.pendingModeId, this.pendingModeConfig);
        return;
      }

      rosterConfig = {
        mode: 'roster',
        groupName: groupName,
        students: parsedStudents
      };
    }

    if (window.soundEngine) window.soundEngine.playFanfare();

    window.appRouter.launchHostWithMode(
      this.pendingChallenge.id,
      this.pendingModeId,
      this.pendingModeConfig,
      rosterConfig
    );
  },

  openEditRosterModal() {
    if (!this.currentRoom) return;
    const promptText = prompt(
      '📋 Modificar o agregar alumnos a la lista oficial.\nEscribe los nombres y correos (uno por línea):\nEj: Juan Pérez, juan@colegio.edu.co',
      (this.currentRoom.roster || []).map(s => `${s.name}, ${s.email}`).join('\n')
    );
    if (promptText === null) return;

    const lines = promptText.split('\n').map(l => l.trim()).filter(Boolean);
    const newRoster = lines.map((line, idx) => {
      const parts = line.includes(',') ? line.split(',') : (line.includes(';') ? line.split(';') : [line, '']);
      const name = parts[0].trim();
      const email = parts[1]?.trim() || '';
      const existing = (this.currentRoom.roster || []).find(e => e.name.toLowerCase() === name.toLowerCase());
      return {
        id: existing?.id || ('st_' + idx + '_' + Math.random().toString(36).substr(2, 5)),
        name: name,
        email: email,
        avatar: existing?.avatar || '🎓',
        joined: existing?.joined || false
      };
    });

    this.currentRoom.rosterMode = newRoster.length > 0 ? 'roster' : 'open';
    this.currentRoom.roster = newRoster;
    window.realtimeEngine.syncRoomState();
    this.render();
    alert(`✅ Lista oficial actualizada con ${newRoster.length} alumnos.`);
  },

  openChangeModeModal() {
    if (!this.currentRoom) return;
    const modal = document.getElementById('change-mode-modal');
    if (!modal) return;
    this.renderChangeModeModalContent();
    modal.classList.add('active');
  },

  closeChangeModeModal() {
    const modal = document.getElementById('change-mode-modal');
    if (modal) modal.classList.remove('active');
  },

  renderChangeModeModalContent() {
    const listContainer = document.getElementById('change-mode-options-list');
    if (!listContainer || !window.GameModes) return;
    const currentModeId = this.currentRoom?.gameMode || 'clasico';
    listContainer.innerHTML = window.GameModes.modes.map(mode => `
      <div 
        class="change-mode-option-card ${mode.id === currentModeId ? 'selected' : ''}"
        onclick="window.LobbyView.changeRoomMode('${mode.id}')"
        style="display: flex; align-items: center; gap: 0.85rem; padding: 0.85rem 1rem; border-radius: 12px; border: 2px solid ${mode.id === currentModeId ? (mode.accentColor || 'var(--neon-cyan)') : 'var(--border-color)'}; background: ${mode.id === currentModeId ? 'rgba(0, 245, 212, 0.08)' : 'var(--bg-card)'}; cursor: pointer; transition: var(--transition-bounce);"
      >
        <div style="width: 44px; height: 44px; border-radius: 10px; background: ${mode.gradient}; display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0;">
          ${mode.icon}
        </div>
        <div style="flex: 1; text-align: left; overflow: hidden;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
            <strong style="font-size: 0.98rem; color: var(--text-primary);">${mode.name}</strong>
            <span class="badge-tag" style="background: rgba(255,255,255,0.1); font-size: 0.65rem; padding: 0.1rem 0.4rem;">${mode.badge}</span>
            ${mode.id === currentModeId ? '<span style="color: var(--neon-cyan); font-weight: 800; font-size: 0.8rem; margin-left: auto;">ACTIVO ✓</span>' : ''}
          </div>
          <p style="font-size: 0.78rem; color: var(--text-secondary); margin: 0; line-height: 1.3; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${mode.description}
          </p>
        </div>
      </div>
    `).join('');
  },

  changeRoomMode(newModeId) {
    if (!this.currentRoom) return;
    const mode = window.GameModes ? window.GameModes.getMode(newModeId) : null;
    if (!mode) return;

    this.currentRoom.gameMode = newModeId;
    this.currentRoom.modeConfig = { ...(mode.config || {}) };
    
    // Guardar explícitamente en localStorage para sincronización entre pestañas
    if (this.currentRoom.pin) {
      try {
        localStorage.setItem(`te_reto_room_${this.currentRoom.pin}`, JSON.stringify(this.currentRoom));
      } catch (e) {}
    }

    // Sincronizar en motor y enviar broadcast a todos los alumnos conectados
    window.realtimeEngine.syncRoomState();
    window.realtimeEngine.broadcast({
      type: 'MODE_CHANGED',
      pin: this.currentRoom.pin,
      gameMode: newModeId,
      modeConfig: this.currentRoom.modeConfig
    });

    if (window.soundEngine) window.soundEngine.playFanfare();
    this.closeChangeModeModal();
    this.render();
  },

  render() {
    const container = document.getElementById('view-lobby');
    if (!container) return;

    if (this.mode === 'host') {
      this.renderHostView(container);
    } else if (this.mode === 'join') {
      this.renderJoinView(container);
    } else if (this.mode === 'waiting') {
      this.renderWaitingView(container);
    }
  },

  renderHostView(container) {
    const r = this.currentRoom;
    const shareUrl = `${window.location.origin}${window.location.pathname}#join?pin=${r.pin}`;
    const qrSvg = window.realtimeEngine.generateQRCodeSVG(r.pin);

    // Formatear PIN con espacio (ej: 160 182) estilo Kahoot
    const formattedPin = r.pin.length === 6 ? `${r.pin.slice(0, 3)} ${r.pin.slice(3)}` : r.pin;

    // Obtener información del modo de juego seleccionado
    const currentMode = window.GameModes ? window.GameModes.getMode(r.gameMode) : { name: 'Modo Clásico', icon: '🏆', badge: '🏆 TRADICIONAL' };

    // Calcular alumnos del roster que faltan por unirse
    const missingStudents = (r.rosterMode === 'roster' && r.roster)
      ? r.roster.filter(st => !r.players.some(p => 
          (p.rosterStudentId && p.rosterStudentId === st.id) ||
          (p.email && st.email && p.email.toLowerCase() === st.email.toLowerCase()) ||
          (p.nickname && st.name && p.nickname.toLowerCase() === st.name.toLowerCase())
        ))
      : [];

    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        <!-- Header de la Sala del Profesor -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
              <span class="badge-tag tag-easy">PANTALLA DE PROFESOR</span>
              <span class="badge-tag badge-mode-pill">
                ${currentMode.icon} ${currentMode.name.toUpperCase()}
              </span>
              ${r.rosterMode === 'roster' ? `
                <span class="badge-tag badge-roster-pill">
                  📋 LISTA: ${r.rosterGroupName || 'Oficial'} (${r.players.length}/${r.roster?.length || 0} PRESENTES)
                </span>
              ` : `
                <span class="badge-tag badge-open-pill">
                  ✍️ NOMBRES LIBRES
                </span>
              `}
              <span class="kahoot-pin-pill">👤 ${r.players.length} Conectados</span>
            </div>
            <h1 style="font-size: 2rem; margin: 0; color: var(--text-primary);">
              ${r.challenge.title}
            </h1>
            <p style="color: var(--text-secondary); margin-top: 0.25rem;">${r.challenge.questions.length} preguntas • Tiempo estándar: ${r.challenge.timePerQuestion || 20}s</p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-outline btn-host-roster" onclick="window.LobbyView.openEditRosterModal()" title="Modificar o cargar lista de correos">
              <span>📋</span> ${r.rosterMode === 'roster' ? 'Gestionar Lista' : 'Activar Lista Correos'}
            </button>
            <button class="btn btn-outline btn-host-mode" onclick="window.LobbyView.openChangeModeModal()" title="Cambiar la dinámica o modo de juego de esta sala">
              <span>🔄</span> Cambiar Modo
            </button>
            <button class="btn btn-outline" onclick="window.LobbyView.toggleMusic()">
              <span id="lobby-music-icon">🎵</span> Música
            </button>
            <button class="btn btn-outline btn-host-bots" onclick="window.LobbyView.addBots()">
              <span>🤖</span> +4 Bots de Prueba
            </button>
            <button class="btn btn-primary btn-lg" id="btn-start-game" onclick="window.LobbyView.startGame()" ${r.players.length === 0 ? 'disabled' : ''} style="font-weight: 800; padding: 0.85rem 1.75rem;">
              <span>🚀</span> ¡Empezar!
            </button>
          </div>
        </div>

        <!-- Banner Informativo Destacado del Modo de Juego Escogido -->
        <div class="lobby-mode-banner" style="border-color: ${currentMode.accentColor || 'var(--neon-cyan)'};">
          <div style="display: flex; align-items: center; gap: 0.85rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: ${currentMode.gradient || 'var(--neon-cyan)'}; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; box-shadow: 0 4px 12px rgba(0,0,0,0.3); flex-shrink: 0;">
              ${currentMode.icon}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.15rem;">
                <span class="lobby-mode-banner-sub">Modo de Juego Seleccionado</span>
                <span class="badge-tag lobby-mode-badge">${currentMode.badge}</span>
              </div>
              <div class="lobby-mode-banner-title">
                ${currentMode.name}
              </div>
            </div>
          </div>
          <div class="lobby-mode-banner-desc">
            ${currentMode.description}
          </div>
        </div>

        <!-- Tarjeta Principal del Código PIN y QR estilo Kahoot (Blanca, limpia y nítida) -->
        <div style="background: #ffffff; color: #111827; border-radius: 18px; padding: 1.75rem 2.5rem; margin-bottom: 2.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 2rem; box-shadow: 0 15px 45px rgba(0, 0, 0, 0.45); border: 2px solid rgba(255, 255, 255, 0.9);">
          
          <!-- Bloque Información de Unión y PIN -->
          <div style="text-align: left; flex: 1; min-width: 260px;">
            <div style="font-size: 1.15rem; color: #4b5563; font-weight: 700; margin-bottom: 0.4rem;">
              Únete en <strong style="color: #46178f; font-size: 1.25rem;">${window.location.host || 'esta página'}</strong> o escanea el QR:
            </div>
            <div style="font-size: 0.95rem; color: #6b7280; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px;">
              PIN de juego:
            </div>
            <div style="font-size: clamp(3.2rem, 7vw, 4.8rem); font-weight: 900; letter-spacing: 4px; color: #111827; line-height: 1; margin: 0.35rem 0 0.85rem 0; font-family: monospace;">
              ${formattedPin}
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-outline" style="border-color: #46178f; color: #46178f; font-size: 0.88rem; padding: 0.45rem 1rem; font-weight: 700;" onclick="window.LobbyView.copyShareLink('${shareUrl}')">
                📋 Copiar Enlace Directo
              </button>
              <div style="display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.4rem 0.85rem; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #46178f;">
                <span style="font-size: 1.1rem;">${currentMode.icon}</span>
                <span style="font-size: 0.85rem; font-weight: 800; color: #1e1b4b;">Modo: ${currentMode.name}</span>
              </div>
            </div>
          </div>

          <!-- Bloque QR Code -->
          <div style="display: flex; flex-direction: column; align-items: center; background: #f8fafc; padding: 1rem 1.25rem; border-radius: 14px; border: 1px solid #e2e8f0; box-shadow: 0 4px 15px rgba(0,0,0,0.06);">
            <div style="margin-bottom: 0.4rem;">
              ${qrSvg}
            </div>
            <span style="font-size: 0.82rem; color: #64748b; font-weight: 700;">📱 Escanea con tu celular</span>
          </div>
        </div>

        <!-- Lista de Jugadores (Solo Alumnos - El profesor no se incluye) -->
        <div class="glass-panel" style="padding: 2rem; border-radius: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <h2 style="font-size: 1.35rem; display: flex; align-items: center; gap: 0.6rem; color: var(--text-primary);">
              <span>👥</span> Alumnos en la Sala (<span style="color: var(--neon-cyan);">${r.players.length}</span>)
            </h2>
            <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
              ${r.players.length === 0 ? 'Esperando a que los alumnos ingresen el PIN...' : '¡Listos para competir!'}
            </span>
          </div>

          ${r.players.length === 0 ? `
            <div style="text-align: center; padding: 3rem 1rem; color: var(--text-muted);">
              <div style="font-size: 3.5rem; margin-bottom: 1rem; animation: timer-pulse 1.5s infinite alternate;">🎮</div>
              <p style="font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 0.5rem;">Esperando a que los jugadores se unan...</p>
              <p style="font-size: 0.95rem; max-width: 480px; margin: 0 auto 1.5rem; color: var(--text-secondary);">
                Comparte el código <strong>${formattedPin}</strong> con tu grupo o haz clic en "+4 Bots de Prueba" para iniciar una partida de demostración.
              </p>
              <button class="btn btn-cyan" onclick="window.LobbyView.addBots()" style="font-weight: 800; padding: 0.75rem 1.5rem;">
                <span>🤖</span> Probar con 4 Jugadores Bots
              </button>
            </div>
          ` : `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: 1rem;">
              ${r.players.map((p, idx) => `
                <div class="lobby-player-card">
                  <div style="display: flex; align-items: center; gap: 0.65rem; overflow: hidden;">
                    <span style="font-size: 2rem;">${p.avatar || '😎'}</span>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${p.nickname}</div>
                      <div class="lobby-player-subtext" style="color: ${p.isBot ? 'var(--neon-purple)' : 'var(--neon-cyan)'};">
                        ${p.email ? `✉️ ${p.email}` : (p.isBot ? '🤖 Bot' : '🟢 Alumno')}
                      </div>
                    </div>
                  </div>
                  <button 
                    title="Expulsar jugador"
                    onclick="window.LobbyView.kickPlayer('${p.id}')"
                    class="lobby-player-kick-btn"
                  >✕</button>
                </div>
              `).join('')}
            </div>
          `}

          <!-- Lista de Alumnos que Faltan por Unirse (si el maestro activó roster) -->
          ${missingStudents.length > 0 ? `
            <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
                <h3 style="font-size: 1.15rem; color: #ffd166; font-weight: 800; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                  <span>⏳</span> Faltan por ingresar PIN (${missingStudents.length} de ${r.roster.length})
                </h3>
                <span style="font-size: 0.82rem; color: var(--text-muted);">
                  Aparecerán arriba automáticamente al ingresar el PIN
                </span>
              </div>
              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.75rem;">
                ${missingStudents.map(st => `
                  <div class="lobby-missing-student-card">
                    <span style="font-size: 1.6rem; filter: grayscale(70%);">${st.avatar || '🎓'}</span>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <div class="lobby-missing-student-name">${st.name}</div>
                      <div class="lobby-missing-student-email">${st.email || 'Sin correo registrado'}</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;
  },

  renderJoinView(container) {
    if (this.joinStep === 'profile') {
      this.renderJoinProfileStep(container);
    } else {
      this.renderJoinPinStep(container);
    }
  },

  // ==========================================
  // 🎮 PASO 1: INGRESO EXCLUSIVO DEL CÓDIGO PIN (ESTILO MINIMALISTA MENTIMETER)
  // ==========================================
  renderJoinPinStep(container) {
    container.innerHTML = `
      <div style="min-height: 100vh; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; box-sizing: border-box; background: url('assets/mentix_join_bg.jpg') center center / cover no-repeat; position: relative;">
        
        <!-- Overlay sutil para legibilidad perfecta conservando todo el brillo y geometrías -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(5, 12, 35, 0.45) 0%, rgba(3, 7, 24, 0.75) 100%); pointer-events: none;"></div>

        <!-- Contenido principal interactivo sobre el fondo -->
        <div style="position: relative; z-index: 2; width: 100%; max-width: 680px; text-align: center; margin: 0 auto;">
          
          <!-- Nombre de la Página / Logotipo Destacado -->
          <a href="javascript:void(0)" onclick="window.appRouter.navigate('home')" style="text-decoration: none; display: inline-flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; cursor: pointer;">
            <span style="font-size: 2.8rem; filter: drop-shadow(0 0 16px rgba(0,245,212,0.85));">🧠</span>
            <span style="font-size: 2.6rem; font-weight: 900; letter-spacing: -0.02em; color: #ffffff; text-shadow: 0 4px 20px rgba(0,0,0,0.8);">
              MEN<span style="color: var(--neon-cyan); text-shadow: 0 0 20px rgba(0,245,212,0.8);">TIX</span>
            </span>
          </a>

          <h1 style="font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 900; margin: 0 0 0.6rem; color: #ffffff; letter-spacing: -0.02em; text-shadow: 0 4px 24px rgba(0,0,0,0.8);">
            Ingresa el código para unirte
          </h1>
          
          <p style="color: rgba(220, 235, 255, 0.9); font-size: clamp(1rem, 2.5vw, 1.2rem); margin: 0 0 2.25rem; text-shadow: 0 2px 10px rgba(0,0,0,0.6);">
            Está en la pantalla frente a ti
          </p>

          <form id="join-pin-form" onsubmit="event.preventDefault(); window.LobbyView.submitPinStep();" style="width: 100%;">
            <div style="margin-bottom: 1.75rem; width: 100%;">
              <input 
                type="text" 
                id="join-pin-input" 
                placeholder="1234 5678" 
                maxlength="7"
                inputmode="numeric"
                value="${this.joinPin ? (this.joinPin.length === 6 ? this.joinPin.slice(0, 3) + ' ' + this.joinPin.slice(3) : this.joinPin) : ''}"
                required
                autofocus
                autocomplete="off"
                style="width: 100%; box-sizing: border-box; text-align: center; font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 800; padding: 1.15rem 1.5rem; border-radius: 18px; background: rgba(10, 20, 45, 0.75); backdrop-filter: blur(12px); border: 2.5px solid rgba(0, 245, 212, 0.6); color: #ffffff; outline: none; transition: var(--transition-bounce); box-shadow: 0 10px 35px rgba(0,0,0,0.5), 0 0 20px rgba(0, 245, 212, 0.25); letter-spacing: 2px;"
                onfocus="this.style.borderColor='var(--neon-cyan)'; this.style.boxShadow='0 0 30px rgba(0,245,212,0.5)';"
                onblur="this.style.borderColor='rgba(0, 245, 212, 0.6)'; this.style.boxShadow='0 10px 35px rgba(0,0,0,0.5), 0 0 20px rgba(0, 245, 212, 0.25)';"
                oninput="window.LobbyView.formatPinInput(this)"
              />
              <div id="pin-error-msg" style="color: #ff4d6d; font-size: 0.95rem; font-weight: 700; margin-top: 0.75rem; display: none; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,0.8);"></div>
            </div>

            <button 
              type="submit" 
              class="btn" 
              style="padding: 0.85rem 3.5rem; font-size: 1.25rem; font-weight: 900; border-radius: 9999px; background: #0b152d; color: #ffffff; border: 2px solid rgba(0, 245, 212, 0.5); cursor: pointer; transition: var(--transition-bounce); box-shadow: 0 8px 25px rgba(0,0,0,0.5), 0 0 18px rgba(0, 245, 212, 0.3); min-width: 200px;"
              onmouseenter="this.style.background='var(--neon-cyan)'; this.style.color='#050510'; this.style.borderColor='var(--neon-cyan)'; this.style.boxShadow='0 0 30px rgba(0,245,212,0.8)'; this.style.transform='translateY(-2px) scale(1.03)';"
              onmouseleave="this.style.background='#0b152d'; this.style.color='#ffffff'; this.style.borderColor='rgba(0, 245, 212, 0.5)'; this.style.boxShadow='0 8px 25px rgba(0,0,0,0.5), 0 0 18px rgba(0, 245, 212, 0.3)'; this.style.transform='none';"
            >
              Unirse
            </button>
          </form>

          <!-- Enlace discreto para volver -->
          <div style="margin-top: 2.75rem;">
            <a href="javascript:void(0)" onclick="window.appRouter.navigate('home')" style="font-size: 0.95rem; color: rgba(220, 235, 255, 0.8); text-decoration: none; transition: color 0.2s; text-shadow: 0 2px 8px rgba(0,0,0,0.8);" onmouseenter="this.style.color='var(--neon-cyan)'" onmouseleave="this.style.color='rgba(220, 235, 255, 0.8)'">
              ← Volver al inicio
            </a>
          </div>

        </div>
      </div>
    `;
  },

  formatPinInput(el) {
    if (!el) return;
    const clean = el.value.replace(/\D/g, '').slice(0, 6);
    if (clean.length > 3) {
      el.value = clean.slice(0, 3) + ' ' + clean.slice(3);
    } else {
      el.value = clean;
    }
    const err = document.getElementById('pin-error-msg');
    if (err) err.style.display = 'none';
  },

  submitPinStep() {
    const pinInput = document.getElementById('join-pin-input');
    const rawPin = pinInput ? pinInput.value : '';
    const cleanPin = rawPin.replace(/\D/g, '').trim();

    const err = document.getElementById('pin-error-msg');
    if (err) err.style.display = 'none';

    if (!cleanPin || cleanPin.length < 4) {
      if (err) {
        err.textContent = '⚠️ Ingresa un código PIN válido (de al menos 4 a 6 dígitos).';
        err.style.display = 'block';
      } else {
        alert('Ingresa un código PIN válido.');
      }
      return;
    }

    // Conectar a la sala (si existe en almacenamiento local o se sincroniza por WebRTC en red)
    const room = this.findRoomByPin(cleanPin);

    this.joinPin = cleanPin;
    this.joinRoomData = room || { pin: cleanPin, rosterMode: 'open', gameMode: 'clasico' };
    this.joinStep = 'profile';

    // Iniciar conexión anticipada por WebRTC para descubrir la sala remota
    if (window.realtimeEngine && window.realtimeEngine.initPlayerPeer) {
      window.realtimeEngine.initPlayerPeer(cleanPin, (conn) => {
        console.log('📡 Sala remota detectada y enlazada por WebRTC:', cleanPin);
      });
    }

    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  backToPinStep() {
    this.joinStep = 'pin';
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  // ==========================================
  // 🐾 PASO 2: NOMBRE, LISTA OFICIAL Y ANIMAL
  // ==========================================
  renderJoinProfileStep(container) {
    const rawPin = this.joinPin || '';
    const formattedPin = rawPin.length === 6 ? `${rawPin.slice(0, 3)} ${rawPin.slice(3)}` : rawPin;
    const room = this.joinRoomData || this.findRoomByPin(rawPin) || { pin: rawPin, rosterMode: 'open', gameMode: 'clasico' };

    const currentMode = window.GameModes ? window.GameModes.getMode(room.gameMode) : { name: 'Modo Clásico', icon: '🏆', badge: '🏆 TRADICIONAL', description: 'Todos compiten por acumular la mayor cantidad de puntos en tiempo real.' };

    const avatars = ['🦊', '🦄', '🐯', '🐼', '🦁', '🐰', '🦅', '🐱', '🐺', '🚀', '⚡', '🎮'];
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    container.innerHTML = `
      <div style="max-width: 520px; margin: 2.5rem auto; padding: 0 1.25rem;">
        <div class="glass-panel" style="padding: 2.25rem 2rem; text-align: center; border-color: ${currentMode.accentColor || 'var(--neon-cyan)'}; box-shadow: 0 15px 45px rgba(0,0,0,0.35);">
          
          <!-- Encabezado de la Sala Encontrada y Modo Elegido por el Docente -->
          <div style="background: rgba(0,0,0,0.25); border: 1.5px solid ${currentMode.accentColor || 'var(--neon-cyan)'}; border-radius: 14px; padding: 0.95rem 1.25rem; margin-bottom: 1.75rem; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: ${currentMode.gradient || 'var(--neon-cyan)'}; display: flex; align-items: center; justify-content: center; font-size: 1.8rem; flex-shrink: 0; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                ${currentMode.icon}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.45rem; margin-bottom: 0.15rem;">
                  <span style="font-size: 0.72rem; font-weight: 800; color: #ffd166; text-transform: uppercase;">SALA PIN: ${formattedPin}</span>
                  <span class="badge-tag" style="background: rgba(255,255,255,0.12); font-size: 0.68rem; padding: 0.1rem 0.45rem; font-weight: 800;">${currentMode.badge}</span>
                </div>
                <div style="font-size: 1.15rem; font-weight: 900; color: var(--text-primary); line-height: 1.2;">
                  ${room.challenge?.title || 'Reto en Vivo'}
                </div>
                <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.2rem;">
                  Modo activo: <strong>${currentMode.name}</strong>
                </div>
              </div>
            </div>
            <button type="button" class="btn btn-outline" style="font-size: 0.78rem; padding: 0.35rem 0.75rem; border-color: rgba(255,255,255,0.2);" onclick="window.LobbyView.backToPinStep()" title="Cambiar código PIN">
              ← Cambiar PIN
            </button>
          </div>

          <!-- Formulario de Entrada: Lista oficial de correos vs Nombre libre -->
          <form id="join-profile-form" onsubmit="event.preventDefault(); window.LobbyView.submitJoin();">
            <input type="hidden" id="join-pin-input" value="${rawPin}" />
            <div id="join-name-field-container">
              ${this.renderJoinNameField(room)}
            </div>

            <!-- Selector de Animal / Avatar -->
            <div style="margin-bottom: 2rem; text-align: left;">
              <label style="display: block; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>🐾</span> ELIGE TU ANIMAL O AVATAR
              </label>
              <div style="display: flex; gap: 0.55rem; flex-wrap: wrap; justify-content: center;" id="avatar-selector">
                ${avatars.map(av => `
                  <button 
                    type="button" 
                    onclick="window.LobbyView.selectAvatar('${av}', this)"
                    class="avatar-pick-btn ${av === randomAvatar ? 'selected' : ''}"
                    style="width: 48px; height: 48px; font-size: 1.6rem; border-radius: 12px; border: 2.5px solid ${av === randomAvatar ? 'var(--neon-cyan)' : 'var(--border-color)'}; background: rgba(0,0,0,0.3); cursor: pointer; transition: var(--transition-bounce);"
                  >${av}</button>
                `).join('')}
              </div>
              <input type="hidden" id="join-avatar-input" value="${randomAvatar}" />
            </div>

            <!-- Botón de Entrada Final -->
            <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 1.25rem; font-weight: 900; padding: 1.05rem; letter-spacing: 0.5px; box-shadow: 0 6px 25px rgba(247, 37, 133, 0.45);">
              <span>🚀</span> ¡ENTRAR A LA SALA!
            </button>
          </form>

          <div style="margin-top: 1.5rem;">
            <button class="btn btn-outline" style="font-size: 0.85rem; width: 100%;" onclick="window.LobbyView.backToPinStep()">
              ← Volver a ingresar otro PIN
            </button>
          </div>

        </div>
      </div>
    `;
  },

  renderJoinNameField(room) {
    if (room && room.rosterMode === 'roster' && Array.isArray(room.roster) && room.roster.length > 0) {
      const roster = room.roster;
      const joinedCount = roster.filter(s => s.joined).length;
      return `
        <div style="margin-bottom: 1.5rem; text-align: left; background: rgba(14, 116, 144, 0.08); border: 1.5px solid var(--neon-cyan); border-radius: var(--border-radius-md); padding: 1.1rem; box-shadow: 0 4px 15px rgba(14, 116, 144, 0.15);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
            <label style="display: block; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; color: var(--neon-cyan); margin: 0; display: flex; align-items: center; gap: 0.4rem;">
              <span>📋</span> LISTA OFICIAL (${room.rosterGroupName || 'Estudiantes'})
            </label>
            <span style="font-size: 0.75rem; background: rgba(0,0,0,0.5); padding: 0.2rem 0.6rem; border-radius: 999px; color: #ffd166; font-weight: 800;">
              ${joinedCount}/${roster.length} conectados
            </span>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 0.85rem; line-height: 1.35;">
            El profesor cargó la lista oficial. Selecciona tu nombre y correo registrado para ingresar:
          </p>
          <select 
            id="join-roster-select" 
            onchange="window.LobbyView.onRosterStudentSelected(this)"
            required
            style="width: 100%; font-size: 0.98rem; font-weight: 700; padding: 0.85rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 2px solid var(--neon-cyan); color: var(--text-primary); outline: none; margin-bottom: 0.5rem;"
          >
            <option value="">-- Selecciona tu nombre y correo --</option>
            ${roster.map(st => {
              const isJoined = !!st.joined;
              const nameEsc = (st.name || '').replace(/"/g, '&quot;');
              const emailText = st.email ? (' (' + st.email + ')') : '';
              const joinedText = isJoined ? ' ✓ (Ya ingresó)' : '';
              const disabledAttr = isJoined ? 'disabled style="color: var(--text-muted);"' : '';
              return '<option value="' + st.id + '" data-name="' + nameEsc + '" data-email="' + (st.email || '') + '" data-avatar="' + (st.avatar || '🦊') + '" ' + disabledAttr + '>' + (st.name || '') + emailText + joinedText + '</option>';
            }).join('')}
            <option value="__manual__">➕ No aparezco en la lista (Escribir nombre)</option>
          </select>

          <input type="hidden" id="join-nickname-input" value="" />
          <input type="hidden" id="join-email-input" value="" />
          <input type="hidden" id="join-student-id-input" value="" />

          <div id="join-manual-inputs-container" style="display: none; margin-top: 0.85rem; padding-top: 0.85rem; border-top: 1px dashed rgba(255,255,255,0.2);">
            <div style="margin-bottom: 0.75rem;">
              <label style="display: block; font-weight: 700; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                Tu Nombre Completo:
              </label>
              <input 
                type="text" 
                id="join-manual-name-input" 
                placeholder="Ej: Pedro Pérez"
                maxlength="30"
                oninput="document.getElementById('join-nickname-input').value = this.value"
                style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 0.65rem; border-radius: 8px; background: var(--bg-card); border: 1.5px solid var(--border-color); color: var(--text-primary);"
              />
            </div>
            <div>
              <label style="display: block; font-weight: 700; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.35rem;">
                Tu Correo Institucional / Personal:
              </label>
              <input 
                type="email" 
                id="join-manual-email-input" 
                placeholder="pedro.perez@colegio.edu.co"
                oninput="document.getElementById('join-email-input').value = this.value"
                style="width: 100%; font-size: 0.95rem; font-weight: 600; padding: 0.65rem; border-radius: 8px; background: var(--bg-card); border: 1.5px solid var(--border-color); color: var(--text-primary);"
              />
            </div>
          </div>
        </div>
      `;
    }

    // Modo Abierto estándar (los estudiantes ponen su nombre libremente)
    return `
      <div style="margin-bottom: 1.5rem; text-align: left;">
        <label style="display: block; font-weight: 800; font-size: 0.85rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 0.5rem;">
          TU NOMBRE O NICKNAME
        </label>
        <input 
          type="text" 
          id="join-nickname-input" 
          placeholder="Ej: Mateo El Rápido" 
          maxlength="25"
          value="${window.appState?.currentUser?.name || ''}"
          required
          style="width: 100%; font-size: 1.1rem; font-weight: 700; padding: 0.85rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); outline: none;"
          onfocus="this.style.borderColor='var(--neon-magenta)'"
        />
        <input type="hidden" id="join-email-input" value="${window.appState?.currentUser?.email || ''}" />
        <input type="hidden" id="join-student-id-input" value="" />
      </div>
    `;
  },

  onRosterStudentSelected(selectEl) {
    const val = selectEl.value;
    const manualContainer = document.getElementById('join-manual-inputs-container');
    const nickHidden = document.getElementById('join-nickname-input');
    const emailHidden = document.getElementById('join-email-input');
    const idHidden = document.getElementById('join-student-id-input');

    if (val === '__manual__') {
      if (manualContainer) manualContainer.style.display = 'block';
      const manualName = document.getElementById('join-manual-name-input')?.value || '';
      const manualEmail = document.getElementById('join-manual-email-input')?.value || '';
      if (nickHidden) nickHidden.value = manualName;
      if (emailHidden) emailHidden.value = manualEmail;
      if (idHidden) idHidden.value = '';
      return;
    }

    if (manualContainer) manualContainer.style.display = 'none';

    if (!val) {
      if (nickHidden) nickHidden.value = '';
      if (emailHidden) emailHidden.value = '';
      if (idHidden) idHidden.value = '';
      return;
    }

    const selectedOption = selectEl.options[selectEl.selectedIndex];
    const studentName = selectedOption.getAttribute('data-name') || '';
    const studentEmail = selectedOption.getAttribute('data-email') || '';
    const studentAvatar = selectedOption.getAttribute('data-avatar');

    if (nickHidden) nickHidden.value = studentName;
    if (emailHidden) emailHidden.value = studentEmail;
    if (idHidden) idHidden.value = val;

    if (studentAvatar) {
      // Auto-seleccionar animal sugerido en los botones
      const avatarButtons = document.querySelectorAll('.avatar-pick-btn');
      avatarButtons.forEach(btn => {
        if (btn.textContent.trim() === studentAvatar) {
          this.selectAvatar(studentAvatar, btn);
        }
      });
    }
  },

  renderWaitingView(container) {
    const p = window.realtimeEngine.localPlayer;
    let room = window.realtimeEngine.currentRoom;

    // Sincronizar el modo de juego exacto configurado por el anfitrión si en memoria no está definido o es clásico
    const targetPin = (room?.pin || this.joinPin || '').toString().replace(/\D/g, '').trim();
    const storedRoom = this.findRoomByPin(targetPin) || this.joinRoomData;
    if (storedRoom && storedRoom.gameMode) {
      if (!room || !room.gameMode || room.gameMode === 'clasico') {
        window.realtimeEngine.currentRoom = {
          ...(room || {}),
          ...storedRoom,
          pin: targetPin,
          gameMode: storedRoom.gameMode,
          players: room?.players || storedRoom.players || [p]
        };
        room = window.realtimeEngine.currentRoom;
      }
    }

    const currentMode = window.GameModes ? window.GameModes.getMode(room?.gameMode) : { name: 'Modo Clásico', icon: '🏆', badge: '🏆 TRADICIONAL', description: 'Todos compiten por acumular la mayor cantidad de puntos en tiempo real.' };

    // Formatear PIN con espacio (ej: 507 640)
    const rawPin = room?.pin || '';
    const formattedPin = rawPin.length === 6 ? `${rawPin.slice(0, 3)} ${rawPin.slice(3)}` : rawPin;

    container.innerHTML = `
      <div class="waiting-fullscreen-view">
        <div class="waiting-fullscreen-content">
          
          <!-- Avatar Flotante con Halo Neón -->
          <div class="waiting-avatar-halo">
            ${p?.avatar || '😎'}
          </div>

          <!-- Saludo Principal -->
          <h1 class="waiting-title">
            ¡Estás dentro, <span class="glow-text-cyan">${p?.nickname || 'Jugador'}</span>!
          </h1>

          <!-- Código PIN de la Sala -->
          <div class="waiting-pin-pill">
            <span>📱</span> <span>SALA PIN: ${formattedPin}</span>
          </div>

          <!-- Tarjeta Completa del Modo de Juego Escogido -->
          <div class="waiting-mode-card" style="border-color: ${currentMode.accentColor || 'var(--neon-cyan)'};">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 54px; height: 54px; border-radius: 14px; background: ${currentMode.gradient || 'var(--neon-cyan)'}; display: flex; align-items: center; justify-content: center; font-size: 2rem; flex-shrink: 0; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">
                ${currentMode.icon}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
                  <span style="font-size: 0.78rem; font-weight: 800; color: #ffd166; text-transform: uppercase; letter-spacing: 0.5px;">Modo de Juego Activo</span>
                  <span class="badge-tag" style="background: rgba(255,255,255,0.12); font-size: 0.72rem; padding: 0.15rem 0.5rem; font-weight: 800;">${currentMode.badge}</span>
                </div>
                <div style="font-size: 1.35rem; font-weight: 900; color: var(--text-primary);">
                  ${currentMode.name}
                </div>
              </div>
            </div>
            <div style="color: var(--text-secondary); font-size: 0.95rem; max-width: 480px; line-height: 1.45;">
              ${currentMode.description}
            </div>
          </div>

          <!-- Estado de Espera en Vivo -->
          <div class="waiting-status-box">
            <div style="font-size: 2.4rem; animation: timer-pulse 1.2s infinite alternate;">⏳</div>
            <h3 style="font-weight: 800; font-size: 1.3rem; color: var(--text-primary); margin: 0;">
              Esperando a que el profesor inicie la partida...
            </h3>
            <p style="font-size: 0.95rem; color: var(--text-secondary); margin: 0; max-width: 580px;">
              Mantén esta pantalla lista. En cuanto el profesor pulse <strong>¡Empezar!</strong>, las preguntas se proyectarán en pantalla gigante y responderás aquí con tus figuras de colores.
            </p>
          </div>

          <!-- Botón de Salida -->
          <div style="margin-top: 0.5rem;">
            <button class="btn btn-outline" style="padding: 0.65rem 1.6rem; font-size: 0.95rem; font-weight: 700; border-radius: var(--border-radius-md);" onclick="window.appRouter.navigate('home')">
              🚪 Salir de la sala
            </button>
          </div>

        </div>
      </div>
    `;
  },

  selectAvatar(avatar, btn) {
    document.querySelectorAll('.avatar-pick-btn').forEach(b => {
      b.style.borderColor = 'var(--border-color)';
    });
    btn.style.borderColor = 'var(--neon-cyan)';
    document.getElementById('join-avatar-input').value = avatar;
  },

  submitJoin() {
    const rawPin = this.joinPin || document.getElementById('join-pin-input')?.value || '';
    const pin = rawPin.replace(/\D/g, '').trim();
    const nickname = document.getElementById('join-nickname-input')?.value.trim();
    const avatar = document.getElementById('join-avatar-input')?.value || '😎';
    const email = document.getElementById('join-email-input')?.value.trim() || '';
    const studentId = document.getElementById('join-student-id-input')?.value.trim() || null;

    if (!pin || pin.length < 4) {
      alert('Ingresa un código PIN válido.');
      this.joinStep = 'pin';
      this.render();
      return;
    }
    if (!nickname) {
      alert('Por favor selecciona tu nombre de la lista o escribe tu nombre para unirte.');
      return;
    }

    // Obtener los datos reales de la sala para no perder el modo de juego
    const room = this.joinRoomData || this.findRoomByPin(pin);
    if (!room) {
      console.log('Buscando sala en la red con PIN:', pin);
    }

    window.realtimeEngine.joinRoom(pin, nickname, avatar, email, studentId, room);
    if (room && room.gameMode && window.realtimeEngine.currentRoom) {
      window.realtimeEngine.currentRoom.gameMode = room.gameMode;
      window.realtimeEngine.currentRoom.challenge = room.challenge || window.realtimeEngine.currentRoom.challenge;
      window.realtimeEngine.currentRoom.modeConfig = room.modeConfig || window.realtimeEngine.currentRoom.modeConfig;
    }

    if (window.soundEngine) window.soundEngine.playClick();
    this.mode = 'waiting';
    this.setupListeners();
    this.startWaitingPoll();
    this.render();
  },

  startWaitingPoll() {
    if (this.waitingPollInterval) clearInterval(this.waitingPollInterval);
    this.waitingPollInterval = setInterval(() => {
      if (this.mode !== 'waiting') {
        clearInterval(this.waitingPollInterval);
        return;
      }
      const pin = window.realtimeEngine.currentRoom?.pin || this.joinPin;
      if (pin) {
        const stored = localStorage.getItem(`te_reto_room_${pin}`) || localStorage.getItem(`mentix_room_${pin}`);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            // Sincronizar dinámicamente si el anfitrión cambió o configuró el modo de juego
            if (parsed.gameMode && window.realtimeEngine.currentRoom && parsed.gameMode !== window.realtimeEngine.currentRoom.gameMode) {
              window.realtimeEngine.currentRoom.gameMode = parsed.gameMode;
              window.realtimeEngine.currentRoom.challenge = parsed.challenge;
              window.realtimeEngine.currentRoom.modeConfig = parsed.modeConfig;
              this.render();
            }
            if (parsed.status === 'question' || parsed.status === 'intro') {
              clearInterval(this.waitingPollInterval);
              window.soundEngine.playFanfare();
              window.appRouter.startLivePlayerGame(parsed);
            }
          } catch(e) {}
        }
      }
    }, 350);
  },

  addBots() {
    window.realtimeEngine.addBotPlayers(4);
    window.soundEngine.playClick();
    this.render();
    const startBtn = document.getElementById('btn-start-game');
    if (startBtn) startBtn.removeAttribute('disabled');
  },

  kickPlayer(id) {
    if (!this.currentRoom) return;
    const removed = this.currentRoom.players.find(p => p.id === id);
    this.currentRoom.players = this.currentRoom.players.filter(p => p.id !== id);
    if (removed && this.currentRoom.roster) {
      const match = this.currentRoom.roster.find(st => st.id === removed.rosterStudentId || st.name.toLowerCase() === removed.nickname.toLowerCase() || (st.email && st.email === removed.email));
      if (match) match.joined = false;
    }
    window.realtimeEngine.syncRoomState();
    this.render();
  },

  toggleMusic() {
    const active = window.soundEngine.toggleMusic();
    const icon = document.getElementById('lobby-music-icon');
    if (icon) icon.textContent = active ? '🔊' : '🎵';
  },

  copyShareLink(url) {
    navigator.clipboard.writeText(url).then(() => {
      alert('📋 ¡Enlace copiado al portapapeles! Compártelo con los jugadores.');
    }).catch(() => {
      prompt('Copia este enlace:', url);
    });
  },

  startGame() {
    if (!this.currentRoom || this.currentRoom.players.length === 0) {
      alert('No hay jugadores en la sala. Agrega bots o espera a que se conecten.');
      return;
    }

    this.currentRoom.status = 'intro';
    localStorage.setItem(`te_reto_room_${this.currentRoom.pin}`, JSON.stringify(this.currentRoom));
    window.realtimeEngine.broadcast({
      type: 'START_GAME',
      pin: this.currentRoom.pin,
      room: this.currentRoom
    });

    window.soundEngine.playFanfare();
    window.appRouter.startLiveHostGame(this.currentRoom);
  }
};
