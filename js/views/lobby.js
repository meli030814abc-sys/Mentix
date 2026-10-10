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
  pendingRoomType: 'presented', // 'presented' | 'normal'

  initHost(challenge, gameMode = 'clasico', modeConfig = {}, rosterConfig = null, roomType = 'presented') {
    this.mode = 'host';
    this.pendingRoomType = roomType || 'presented';
    try {
      this.currentRoom = window.realtimeEngine.createRoom(challenge, gameMode, modeConfig, rosterConfig, roomType);
    } catch (e) {
      console.error('Error inicializando sala de anfitrión:', e);
    }
    this.setupListeners();
    this.render();
  },

  async initJoin(prefilledPin = '') {
    this.mode = 'join';
    const cleanPrefilled = (prefilledPin || '').toString().replace(/\D/g, '').trim();
    if (cleanPrefilled && cleanPrefilled.length >= 4) {
      this.joinPin = cleanPrefilled;
      const room = await (window.realtimeEngine ? window.realtimeEngine.findRoom(cleanPrefilled) : null);
      if (room && room.challenge) {
        this.joinRoomData = room;
        this.joinStep = 'profile';
        if (window.realtimeEngine && window.realtimeEngine.initMqtt) {
          window.realtimeEngine.initMqtt(cleanPrefilled, false);
        }
      } else {
        this.joinStep = 'pin';
        this.joinRoomData = null;
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
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      const hostPin = String(this.currentRoom?.pin || '').replace(/\D/g, '');
      if (this.mode === 'host' && this.currentRoom && dataPin === hostPin && data.player) {
        // Evitar duplicados por id o nickname idéntico
        const existingIdx = this.currentRoom.players.findIndex(p => 
          (p.id && data.player.id && p.id === data.player.id) || 
          (p.nickname && data.player.nickname && p.nickname.toLowerCase() === data.player.nickname.toLowerCase())
        );

        if (existingIdx === -1) {
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
          if (window.soundEngine) window.soundEngine.playTick();
          window.realtimeEngine.syncRoomState();
          this.render();
        } else {
          // Si el jugador ya estaba en la lista, actualizar sus datos y conexión
          this.currentRoom.players[existingIdx] = {
            ...this.currentRoom.players[existingIdx],
            ...data.player,
            connected: true
          };
          window.realtimeEngine.syncRoomState();
          this.render();
        }
      } else if (this.mode === 'waiting') {
        const myPin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
        if (dataPin === myPin && data.player) {
          if (!window.realtimeEngine.currentRoom) window.realtimeEngine.currentRoom = { players: [] };
          if (!Array.isArray(window.realtimeEngine.currentRoom.players)) window.realtimeEngine.currentRoom.players = [];
          const existingIdx = window.realtimeEngine.currentRoom.players.findIndex(p => 
            p.id === data.player.id || (p.nickname && p.nickname.toLowerCase() === data.player.nickname.toLowerCase())
          );
          if (existingIdx === -1) {
            window.realtimeEngine.currentRoom.players.push(data.player);
            this.showJoinToast(data.player.nickname || 'Un compañero');
            this.updateClassmatesList();
          } else {
            window.realtimeEngine.currentRoom.players[existingIdx] = {
              ...window.realtimeEngine.currentRoom.players[existingIdx],
              ...data.player
            };
            this.updateClassmatesList();
          }
        }
      }
    });

    // Sincronización en tiempo real de actualizaciones de avatar y estado listo
    window.realtimeEngine.on('PLAYER_AVATAR_UPDATE', (data) => {
      const myPin = String(this.currentRoom?.pin || window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      if (data && (!dataPin || dataPin === myPin) && data.playerId) {
        if (this.mode === 'host' && this.currentRoom?.players) {
          const idx = this.currentRoom.players.findIndex(p => p.id === data.playerId);
          if (idx !== -1) {
            this.currentRoom.players[idx] = {
              ...this.currentRoom.players[idx],
              avatarConfig: data.avatarConfig || this.currentRoom.players[idx].avatarConfig,
              nickname: data.nickname || this.currentRoom.players[idx].nickname,
              isReady: data.isReady !== undefined ? data.isReady : this.currentRoom.players[idx].isReady,
              status: data.status || this.currentRoom.players[idx].status,
              title: data.title || this.currentRoom.players[idx].title,
              xp: data.xp !== undefined ? data.xp : this.currentRoom.players[idx].xp,
              level: data.level !== undefined ? data.level : this.currentRoom.players[idx].level
            };
            window.realtimeEngine.syncRoomState();
            this.render();
          }
        }
        if (this.mode === 'waiting') {
          if (window.realtimeEngine.currentRoom?.players) {
            const idx = window.realtimeEngine.currentRoom.players.findIndex(p => p.id === data.playerId);
            if (idx !== -1) {
              window.realtimeEngine.currentRoom.players[idx] = {
                ...window.realtimeEngine.currentRoom.players[idx],
                avatarConfig: data.avatarConfig || window.realtimeEngine.currentRoom.players[idx].avatarConfig,
                nickname: data.nickname || window.realtimeEngine.currentRoom.players[idx].nickname,
                isReady: data.isReady !== undefined ? data.isReady : window.realtimeEngine.currentRoom.players[idx].isReady,
                status: data.status || window.realtimeEngine.currentRoom.players[idx].status,
                title: data.title || window.realtimeEngine.currentRoom.players[idx].title
              };
              this.updateClassmatesList();
            }
          }
        }
      }
    });

    // Reacciones de emojis en vivo en la sala
    window.realtimeEngine.on('LOBBY_REACTION', (data) => {
      const myPin = String(this.currentRoom?.pin || window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      if (data && (!dataPin || dataPin === myPin) && data.emoji) {
        this.spawnFloatingEmoji(data.emoji, data.sender || 'Jugador');
      }
    });

    // Configuración del anfitrión en vivo (Minijuegos y Personalización)
    window.realtimeEngine.on('LOBBY_CONFIG_UPDATE', (data) => {
      const myPin = String(this.currentRoom?.pin || window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      if (data && (!dataPin || dataPin === myPin)) {
        if (window.realtimeEngine.currentRoom) {
          window.realtimeEngine.currentRoom.allowMinigames = data.allowMinigames !== false;
          window.realtimeEngine.currentRoom.allowCustomization = data.allowCustomization !== false;
        }
        if (this.mode === 'waiting') {
          this.render();
        }
      }
    });

    window.realtimeEngine.on('START_GAME', (data) => {
      const myPin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (this.mode === 'waiting' && (!dataPin || dataPin === myPin)) {
        if (this.waitingPollInterval) clearInterval(this.waitingPollInterval);
        if (window.LobbyMinigames) window.LobbyMinigames.destroy();
        this.showGameStartTransition(() => {
          window.soundEngine.playFanfare();
          const fullRoom = data.room || window.realtimeEngine.currentRoom || this.joinRoomData;
          if (fullRoom?.design && window.AdminView) {
            window.AdminView.applyDesign(fullRoom.design);
            try { localStorage.setItem('mentix_admin_design', JSON.stringify(fullRoom.design)); } catch(e) {}
          }
          window.appRouter.startLivePlayerGame(fullRoom);
        });
      }
    });

    // Sincronizar el estado de la sala (incluyendo diseño, modo de juego y reto) enviado por el anfitrión
    window.realtimeEngine.on('HOST_ROOM_STATE', (data) => {
      const myPin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
      if (data && (!dataPin || dataPin === myPin) && data.room) {
        if (data.room.design && window.AdminView) {
          window.AdminView.applyDesign(data.room.design);
          try { localStorage.setItem('mentix_admin_design', JSON.stringify(data.room.design)); } catch(e) {}
        }
        if (data.room.challenge) {
          this.joinRoomData = data.room;
        }
        if (this.mode === 'waiting') {
          const prevMode = window.realtimeEngine.currentRoom?.gameMode;
          window.realtimeEngine.currentRoom = {
            ...data.room,
            players: data.room.players || window.realtimeEngine.currentRoom?.players || []
          };
          if (prevMode !== data.room.gameMode || !window.realtimeEngine.currentRoom.challenge) {
            this.render();
          }
        }
      }
    });

    // Detectar si el anfitrión cambió el tipo de sala en vivo (presentadas vs normal)
    window.realtimeEngine.on('ROOM_TYPE_CHANGED', (data) => {
      const myPin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      const dataPin = String(data?.pin || '').replace(/\D/g, '');
      if ((!dataPin || dataPin === myPin) && data.roomType) {
        if (window.realtimeEngine.currentRoom) {
          window.realtimeEngine.currentRoom.roomType = data.roomType;
        }
        if (this.joinRoomData) {
          this.joinRoomData.roomType = data.roomType;
        }
        if (this.mode === 'waiting') {
          this.render();
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

    window.addEventListener('mentix_avatar_xp_updated', () => {
      if (this.mode === 'waiting') {
        this.updateMyCharacterPanel();
      }
    });
  },

  // ==========================================
  // 🎓 MODAL DE ACCESO: LISTADO VS NICKNAMES
  // ==========================================
  openCreateRoomRosterModal(challenge, gameMode = 'clasico', modeConfig = {}, roomType = 'presented', preselectedGroupId = null) {
    this.pendingChallenge = challenge;
    this.pendingModeId = gameMode;
    this.pendingModeConfig = modeConfig;
    this.pendingRoomType = roomType || 'presented';

    const modal = document.getElementById('roster-config-modal');
    if (!modal) {
      window.appRouter.launchHostWithMode(challenge, gameMode, modeConfig, null, this.pendingRoomType);
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
    if (!this.pendingChallenge) {
      this.pendingChallenge = window.ExperienceView?.currentChallenge || window.appState?.challenges?.[0];
    }
    if (!this.pendingChallenge) {
      alert('⚠️ No se ha seleccionado un cuestionario para abrir la sala.');
      return;
    }
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
      this.pendingChallenge,
      this.pendingModeId,
      this.pendingModeConfig,
      rosterConfig,
      this.pendingRoomType || 'presented'
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

  toggleRoomType() {
    if (!this.currentRoom) return;
    this.currentRoom.roomType = (this.currentRoom.roomType === 'normal') ? 'presented' : 'normal';
    this.pendingRoomType = this.currentRoom.roomType;
    
    if (this.currentRoom.pin) {
      try {
        localStorage.setItem(`te_reto_room_${this.currentRoom.pin}`, JSON.stringify(this.currentRoom));
        localStorage.setItem(`mentix_room_${this.currentRoom.pin}`, JSON.stringify(this.currentRoom));
      } catch (e) {}
    }

    window.realtimeEngine.syncRoomState();
    window.realtimeEngine.broadcast({
      type: 'ROOM_TYPE_CHANGED',
      pin: this.currentRoom.pin,
      roomType: this.currentRoom.roomType
    });

    if (window.soundEngine) window.soundEngine.playClick();
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
    if (!r || !r.pin) {
      console.warn('No hay currentRoom válido al renderizar host view');
      container.innerHTML = `
        <div style="text-align: center; padding: 4rem 1rem; color: #ffffff;">
          <h2>⚠️ Creando la sala...</h2>
          <p style="color: var(--text-secondary);">Un momento por favor.</p>
        </div>
      `;
      return;
    }

    const origin = window.location.origin || (window.location.protocol + '//' + window.location.host);
    const pathname = window.location.pathname || '/';
    const shareUrl = `${origin}${pathname}#lobby-join?pin=${r.pin}`;
    
    let qrSvg = '';
    try {
      qrSvg = window.realtimeEngine.generateQRCodeHTML(shareUrl, 180);
    } catch(e) {
      qrSvg = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}" style="width:180px;height:180px;border-radius:8px;" />`;
    }

    // Formatear PIN con espacio (ej: 160 182) estilo Kahoot
    const pinStr = String(r.pin || '');
    const formattedPin = pinStr.length === 6 ? `${pinStr.slice(0, 3)} ${pinStr.slice(3)}` : pinStr;

    // Obtener información del modo de juego seleccionado
    const currentMode = (window.GameModes && typeof window.GameModes.getMode === 'function')
      ? window.GameModes.getMode(r.gameMode) 
      : { name: 'Modo Clásico', icon: '🏆', badge: '🏆 TRADICIONAL', description: 'Todos compiten en vivo.' };

    const playersList = Array.isArray(r.players) ? r.players : [];
    const rosterList = Array.isArray(r.roster) ? r.roster : [];

    // Calcular alumnos del roster que faltan por unirse
    const missingStudents = (r.rosterMode === 'roster' && rosterList.length > 0)
      ? rosterList.filter(st => !playersList.some(p => 
          (p.rosterStudentId && p.rosterStudentId === st.id) ||
          (p.email && st.email && String(p.email).toLowerCase() === String(st.email).toLowerCase()) ||
          (p.nickname && st.name && String(p.nickname).trim().toLowerCase() === String(st.name).trim().toLowerCase())
        ))
      : [];

    const challengeTitle = r.challenge?.title || 'Cuestionario MENTIX';
    const questionsCount = Array.isArray(r.challenge?.questions) 
      ? r.challenge.questions.length 
      : (r.challenge?.slides?.length || r.challenge?.sections?.length || 0);
    const timeLimit = r.challenge?.timePerQuestion || 20;

    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        <!-- Header de la Sala del Profesor -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.4rem; flex-wrap: wrap;">
              <span class="badge-tag tag-easy">PANTALLA DE PROFESOR</span>
              <span class="badge-tag" style="background:${r.roomType === 'normal' ? 'rgba(14, 165, 233, 0.2)' : 'rgba(168, 85, 247, 0.2)'}; border: 1.5px solid ${r.roomType === 'normal' ? '#0ea5e9' : '#a855f7'}; color: ${r.roomType === 'normal' ? '#38bdf8' : '#d8b4fe'}; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 9999px;">
                ${r.roomType === 'normal' ? '🎮 SALA NORMAL' : '📽️ PREGUNTAS PRESENTADAS'}
              </span>
              <span class="badge-tag badge-mode-pill">
                ${currentMode.icon} ${currentMode.name.toUpperCase()}
              </span>
              ${r.rosterMode === 'roster' ? `
                <span class="badge-tag badge-roster-pill">
                  📋 LISTA: ${r.rosterGroupName || 'Oficial'} (${playersList.length}/${rosterList.length} PRESENTES)
                </span>
              ` : `
                <span class="badge-tag badge-open-pill">
                  ✍️ NOMBRES LIBRES
                </span>
              `}
              <span class="kahoot-pin-pill">👤 ${playersList.length} Conectados</span>
              <span class="badge-tag" style="background: rgba(16, 185, 129, 0.2); border: 1.5px solid #10b981; color: #34d399; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 9999px;">
                🟢 ${playersList.filter(p => p.isReady).length} Listos
              </span>
              <span class="badge-tag" style="background: rgba(234, 179, 8, 0.2); border: 1.5px solid #eab308; color: #fde047; font-weight: 800; padding: 0.3rem 0.75rem; border-radius: 9999px;">
                ✏️ ${playersList.filter(p => !p.isReady).length} Editando
              </span>
            </div>
            <h1 style="font-size: 2rem; margin: 0; color: var(--text-primary);">
              ${challengeTitle}
            </h1>
            <p style="color: var(--text-secondary); margin-top: 0.25rem;">
              ${questionsCount} preguntas • Tiempo estándar: ${timeLimit}s • Modo de sala: <strong style="color: ${r.roomType === 'normal' ? 'var(--neon-cyan)' : '#d8b4fe'};">${r.roomType === 'normal' ? '🎮 Preguntas y respuestas en cada dispositivo' : '📽️ Preguntas proyectadas en pantalla principal'}</strong>
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="window.LobbyView.toggleHostMinigames()" title="Habilitar o pausar minijuegos durante la espera">
              <span>${r.allowMinigames !== false ? '🎮' : '⏸️'}</span> Minijuegos: ${r.allowMinigames !== false ? 'Activos' : 'Pausados'}
            </button>
            <button class="btn btn-outline" onclick="window.LobbyView.toggleHostCustomization()" title="Permitir o bloquear la personalización de avatares">
              <span>${r.allowCustomization !== false ? '🎨' : '🔒'}</span> Avatares: ${r.allowCustomization !== false ? 'Abiertos' : 'Bloqueados'}
            </button>
            <button class="btn btn-outline" onclick="window.LobbyView.toggleRoomType()" title="Cambiar si las preguntas se proyectan en pantalla grande o aparecen en cada celular">
              <span>${r.roomType === 'normal' ? '📽️' : '🎮'}</span> ${r.roomType === 'normal' ? 'Cambiar a Preguntas Presentadas' : 'Cambiar a Sala Normal'}
            </button>
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
            <button class="btn btn-primary btn-lg" id="btn-start-game" onclick="window.LobbyView.startGame()" ${playersList.length === 0 ? 'disabled' : ''} style="font-weight: 800; padding: 0.85rem 1.75rem;">
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
          <div style="display: flex; flex-direction: column; align-items: center; background: #ffffff; padding: 1.15rem 1.35rem; border-radius: 16px; border: 1.5px solid #e2e8f0; box-shadow: 0 4px 18px rgba(0,0,0,0.06); cursor: pointer;" onclick="window.open('${shareUrl}', '_blank')" title="Toca o escanea para unirte">
            <div style="margin-bottom: 0.6rem;">
              ${qrSvg}
            </div>
            <span style="font-size: 0.82rem; color: #475569; font-weight: 800; display: flex; align-items: center; gap: 0.35rem;">
              <span>📱</span> Escanea con tu celular
            </span>
          </div>
        </div>

        <!-- Lista de Jugadores (Solo Alumnos - El profesor no se incluye) -->
        <div class="glass-panel" style="padding: 2rem; border-radius: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.5rem;">
            <h2 style="font-size: 1.35rem; display: flex; align-items: center; gap: 0.6rem; color: var(--text-primary);">
              <span>👥</span> Alumnos en la Sala (<span style="color: var(--neon-cyan);">${playersList.length}</span>)
            </h2>
            <span style="font-size: 0.9rem; color: var(--text-muted); font-weight: 600;">
              ${playersList.length === 0 ? 'Esperando a que los alumnos ingresen el PIN...' : '¡Listos para competir!'}
            </span>
          </div>

          ${playersList.length === 0 ? `
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
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 1rem;">
              ${playersList.map((p, idx) => `
                <div class="lobby-player-card" style="padding: 0.85rem 1rem; border-radius: 16px; border: 1.5px solid ${p.isReady ? '#10b981' : 'rgba(0, 245, 212, 0.3)'}; background: ${p.isReady ? 'rgba(16, 185, 129, 0.12)' : 'rgba(15, 23, 42, 0.85)'}; display: flex; align-items: center; justify-content: space-between; gap: 0.65rem; transition: transform 0.2s;">
                  <div style="display: flex; align-items: center; gap: 0.75rem; overflow: hidden;">
                    <div style="width: 52px; height: 52px; border-radius: 12px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);">
                      ${p.avatarConfig && window.AvatarEngine ? window.AvatarEngine.renderSVG(p.avatarConfig, { size: 52 }) : `<span style="font-size: 1.8rem;">${p.avatar || '😎'}</span>`}
                    </div>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <div style="font-weight: 800; font-size: 0.98rem; color: #ffffff;">${p.nickname}</div>
                      <div style="display: flex; align-items: center; gap: 0.35rem; margin-top: 0.2rem; flex-wrap: wrap;">
                        <span style="font-size: 0.7rem; color: #ffd166; font-weight: 700;">${p.title || 'Novato'}</span>
                        <span style="font-size: 0.65rem; padding: 0.1rem 0.45rem; border-radius: 9999px; background: ${p.isReady ? 'rgba(16,185,129,0.25)' : 'rgba(234,179,8,0.25)'}; color: ${p.isReady ? '#34d399' : '#fde047'}; font-weight: 800; border: 1px solid ${p.isReady ? '#10b981' : '#eab308'};">
                          ${p.isReady ? '🟢 Listo' : '✏️ Editando'}
                        </span>
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
            <span style="font-size: 2.6rem; font-weight: 900; letter-spacing: -0.02em; color: #ffffff !important; text-shadow: 0 4px 20px rgba(0,0,0,0.95);">
              MEN<span style="color: #00f5d4 !important; text-shadow: 0 0 25px rgba(0,245,212,0.95), 0 2px 10px rgba(0,0,0,0.9);">TIX</span>
            </span>
          </a>

          <h1 style="font-size: clamp(2rem, 5vw, 2.75rem); font-weight: 900; margin: 0 0 0.6rem; color: #ffffff !important; letter-spacing: -0.02em; text-shadow: 0 4px 24px rgba(0,0,0,0.95), 0 0 30px rgba(0,245,212,0.45);">
            Ingresa el código para unirte
          </h1>
          
          <p style="color: #ffffff !important; font-size: clamp(1.05rem, 2.5vw, 1.25rem); font-weight: 700; margin: 0 0 2.25rem; text-shadow: 0 2px 12px rgba(0,0,0,0.95);">
            Está en la pantalla frente a ti
          </p>

          <form id="join-pin-form" onsubmit="event.preventDefault(); window.LobbyView.submitPinStep();" style="width: 100%;">
            <div style="margin-bottom: 1.75rem; width: 100%;">
              <input 
                type="text" 
                id="join-pin-input" 
                placeholder="1234 5678" 
                maxlength="10" 
                inputmode="numeric"
                value="${this.joinPin ? (this.joinPin.length === 6 ? this.joinPin.slice(0, 3) + ' ' + this.joinPin.slice(3) : this.joinPin) : ''}"
                required
                autofocus
                autocomplete="off"
                style="width: 100%; box-sizing: border-box; text-align: center; font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 900; padding: 1.15rem 1.5rem; border-radius: 18px; background: rgba(10, 20, 45, 0.88) !important; backdrop-filter: blur(12px); border: 2.5px solid #00f5d4 !important; color: #ffffff !important; outline: none; transition: var(--transition-bounce); box-shadow: 0 10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(0, 245, 212, 0.35) !important; letter-spacing: 2px; text-shadow: 0 0 15px rgba(0, 245, 212, 0.7), 0 2px 8px rgba(0,0,0,0.9);"
                onfocus="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 0 35px rgba(0,245,212,0.7)';"
                onblur="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(0, 245, 212, 0.35)';"
                oninput="window.LobbyView.formatPinInput(this)"
              />
              <div id="pin-error-msg" style="color: #ff4d6d; font-size: 1rem; font-weight: 800; margin-top: 0.75rem; display: none; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,0.95);"></div>
            </div>

            <button 
              type="submit" 
              class="btn" 
              style="padding: 0.9rem 3.5rem; font-size: 1.25rem; font-weight: 900; border-radius: 9999px; background: #00f5d4; color: #050510 !important; border: 2px solid #00f5d4; cursor: pointer; transition: var(--transition-bounce); box-shadow: 0 8px 30px rgba(0, 245, 212, 0.55), 0 0 20px rgba(0, 245, 212, 0.4); min-width: 220px; letter-spacing: 0.5px;"
              onmouseenter="this.style.background='#ffffff'; this.style.color='#050510'; this.style.borderColor='#ffffff'; this.style.boxShadow='0 0 35px rgba(255,255,255,0.9)';"
              onmouseleave="this.style.background='#00f5d4'; this.style.color='#050510'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 8px 30px rgba(0, 245, 212, 0.55), 0 0 20px rgba(0, 245, 212, 0.4)';"
            >
              Unirse
            </button>
          </form>

          <!-- Enlace discreto para volver -->
          <div style="margin-top: 2.75rem;">
            <a href="javascript:void(0)" onclick="window.appRouter.navigate('home')" style="font-size: 1rem; font-weight: 700; color: #ffffff !important; text-decoration: none; transition: color 0.2s; text-shadow: 0 2px 10px rgba(0,0,0,0.95);" onmouseenter="this.style.color='#00f5d4'" onmouseleave="this.style.color='#ffffff'">
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

  async submitPinStep() {
    const pinInput = document.getElementById('join-pin-input');
    const submitBtn = document.querySelector('#join-pin-form button[type="submit"]');
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

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>⏳</span> Conectando...`;
    }

    try {
      const room = await (window.realtimeEngine ? window.realtimeEngine.findRoom(cleanPin) : null);

      if (!room || !room.challenge) {
        if (err) {
          err.innerHTML = `❌ No encontramos una sala activa con el código <strong>${cleanPin}</strong>.<br><span style="font-size: 0.82rem; font-weight: 500; color: #ffd166;">Verifica que el anfitrión tenga la sala abierta en pantalla e intenta de nuevo.</span>`;
          err.style.display = 'block';
        } else {
          alert(`No se encontró ninguna sala activa con el PIN ${cleanPin}.`);
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Unirse';
        }
        return;
      }

      this.joinPin = cleanPin;
      this.joinRoomData = room;
      this.joinStep = 'profile';

      // Conectar MQTT y WebRTC en el cliente del jugador
      if (window.realtimeEngine && window.realtimeEngine.initMqtt) {
        window.realtimeEngine.initMqtt(cleanPin, false);
      }
      if (window.realtimeEngine && window.realtimeEngine.initPlayerPeer) {
        window.realtimeEngine.initPlayerPeer(cleanPin);
      }

      if (window.soundEngine) window.soundEngine.playClick();
      this.render();
    } catch(e) {
      console.warn('Error verificando sala:', e);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Unirse';
      }
    }
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
      <div style="min-height: 100vh; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2.5rem 1.25rem; box-sizing: border-box; background: url('assets/mentix_join_bg.jpg') center center / cover no-repeat fixed; position: relative;">
        <!-- Overlay sutil para legibilidad perfecta conservando todo el brillo y geometrías -->
        <div style="position: absolute; inset: 0; background: radial-gradient(circle at center, rgba(5, 12, 35, 0.45) 0%, rgba(3, 7, 24, 0.75) 100%); pointer-events: none;"></div>

        <!-- Contenedor interactivo -->
        <div style="position: relative; z-index: 2; width: 100%; max-width: 520px; margin: 0 auto;">
          <div class="glass-panel" style="padding: 2.25rem 2rem; text-align: center; border-color: var(--neon-cyan); box-shadow: 0 15px 45px rgba(0,0,0,0.5); backdrop-filter: blur(16px);">
            
            <!-- Encabezado de la Sala Encontrada -->
            <div style="background: rgba(10, 20, 45, 0.75); border: 1.5px solid rgba(0, 245, 212, 0.6); border-radius: 14px; padding: 0.95rem 1.25rem; margin-bottom: 1.75rem; text-align: left; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
              <div>
                <div style="font-size: 0.82rem; font-weight: 900; color: #ffd166 !important; text-transform: uppercase; margin-bottom: 0.2rem; text-shadow: 0 2px 8px rgba(0,0,0,0.9);">
                  SALA PIN: ${formattedPin}
                </div>
                <div style="font-size: 1.25rem; font-weight: 900; color: #ffffff !important; line-height: 1.2; text-shadow: 0 2px 12px rgba(0,0,0,0.95);">
                  ${room.challenge?.title || 'Reto MENTIX'}
                </div>
              </div>
              <button type="button" class="btn btn-outline" style="font-size: 0.8rem; font-weight: 800; padding: 0.4rem 0.85rem; color: #ffffff !important; border-color: rgba(255,255,255,0.4) !important; background: rgba(10,20,45,0.7) !important; text-shadow: 0 2px 6px rgba(0,0,0,0.8);" onclick="window.LobbyView.backToPinStep()" title="Cambiar código PIN">
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
                <label style="display: block; font-weight: 900; font-size: 0.9rem; text-transform: uppercase; color: #ffffff !important; text-shadow: 0 2px 8px rgba(0,0,0,0.9); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
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
              <button type="submit" class="btn btn-primary btn-lg" style="width: 100%; font-size: 1.25rem; font-weight: 900; padding: 1.05rem; letter-spacing: 0.5px; color: #ffffff !important; background: linear-gradient(135deg, #f72585, #7209b7); box-shadow: 0 6px 25px rgba(247, 37, 133, 0.5); text-shadow: 0 2px 8px rgba(0,0,0,0.8);">
                <span>🚀</span> ¡ENTRAR A LA SALA!
              </button>
            </form>

            <div style="margin-top: 1.5rem;">
              <button class="btn btn-outline" style="font-size: 0.9rem; font-weight: 800; width: 100%; color: #ffffff !important; border-color: rgba(255,255,255,0.4) !important; background: rgba(10,20,45,0.7) !important; text-shadow: 0 2px 6px rgba(0,0,0,0.8);" onclick="window.LobbyView.backToPinStep()">
                ← Volver a ingresar otro PIN
              </button>
            </div>

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

    // Modo Abierto estándar (los estudiantes ponen su nombre y correo libremente)
    return `
      <div style="margin-bottom: 1.25rem; text-align: left;">
        <label style="display: block; font-weight: 900; font-size: 0.88rem; text-transform: uppercase; color: #ffffff !important; text-shadow: 0 2px 8px rgba(0,0,0,0.9); margin-bottom: 0.5rem;">
          TU NOMBRE O NICKNAME
        </label>
        <input 
          type="text" 
          id="join-nickname-input" 
          placeholder="Ej: Mateo El Rápido" 
          maxlength="25"
          value="${window.appState?.currentUser?.name || ''}"
          required
          style="width: 100%; font-size: 1.15rem; font-weight: 800; padding: 0.9rem; border-radius: var(--border-radius-md); background: rgba(10, 20, 45, 0.88) !important; border: 2px solid #00f5d4 !important; color: #ffffff !important; outline: none; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-shadow: 0 1px 4px rgba(0,0,0,0.8);"
          onfocus="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 0 20px rgba(0,245,212,0.5)';"
          onblur="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.5)';"
        />
      </div>

      <div style="margin-bottom: 1.5rem; text-align: left;">
        <label style="display: block; font-weight: 900; font-size: 0.88rem; text-transform: uppercase; color: #ffffff !important; text-shadow: 0 2px 8px rgba(0,0,0,0.9); margin-bottom: 0.5rem;">
          CORREO ELECTRÓNICO
        </label>
        <input 
          type="email" 
          id="join-email-input" 
          placeholder="Ej: usuario@correo.com" 
          maxlength="60"
          value="${window.appState?.currentUser?.email || ''}"
          required
          style="width: 100%; font-size: 1.1rem; font-weight: 700; padding: 0.9rem; border-radius: var(--border-radius-md); background: rgba(10, 20, 45, 0.88) !important; border: 2px solid #00f5d4 !important; color: #ffffff !important; outline: none; box-shadow: 0 4px 15px rgba(0,0,0,0.5); text-shadow: 0 1px 4px rgba(0,0,0,0.8);"
          onfocus="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 0 20px rgba(0,245,212,0.5)';"
          onblur="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.5)';"
        />
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

  waitingMobileTab: 'character', // 'character' | 'minigames' | 'classmates'
  studioTempConfig: null,
  currentStudioTab: 'presets',

  switchWaitingTab(tab) {
    this.waitingMobileTab = tab;
    const panelChar = document.getElementById('waiting-panel-character');
    const panelMini = document.getElementById('waiting-panel-minigames');
    const panelPeers = document.getElementById('waiting-panel-classmates');
    if (panelChar) panelChar.classList.toggle('mobile-hidden', tab !== 'character');
    if (panelMini) panelMini.classList.toggle('mobile-hidden', tab !== 'minigames');
    if (panelPeers) panelPeers.classList.toggle('mobile-hidden', tab !== 'classmates');

    document.querySelectorAll('.gamified-mobile-tabs button').forEach((btn, idx) => {
      const isTarget = (idx === 0 && tab === 'character') || (idx === 1 && tab === 'minigames') || (idx === 2 && tab === 'classmates');
      btn.className = `btn btn-sm ${isTarget ? 'btn-cyan' : 'btn-outline'}`;
    });
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

    // Cargar avatar del jugador con AvatarEngine
    const avatarConfig = window.AvatarEngine ? window.AvatarEngine.getSavedAvatar() : null;
    if (p && avatarConfig) {
      p.avatarConfig = avatarConfig;
      p.nickname = avatarConfig.alias || p.nickname;
      p.title = avatarConfig.title || p.title || 'Novato Curioso';
      p.xp = avatarConfig.xp || p.xp || 60;
      p.level = avatarConfig.level || p.level || 1;
    }

    const currentMode = window.GameModes ? window.GameModes.getMode(room?.gameMode) : { name: 'Modo Clásico', icon: '🏆', badge: '🏆 TRADICIONAL', description: 'Todos compiten por acumular la mayor cantidad de puntos en tiempo real.' };

    const rawPin = room?.pin || this.joinPin || '';
    const formattedPin = rawPin.length === 6 ? `${rawPin.slice(0, 3)} ${rawPin.slice(3)}` : rawPin;
    const shareUrl = `${window.location.origin || ''}${window.location.pathname || '/'}#lobby-join?pin=${rawPin}`;

    const stageBgObj = window.AvatarEngine?.stageBackgrounds?.[avatarConfig?.stageBg || 'matrix_neon'] || window.AvatarEngine?.stageBackgrounds?.matrix_neon;
    const stageBgCss = stageBgObj?.css || 'radial-gradient(circle at 50% 30%, rgba(0, 245, 212, 0.25) 0%, rgba(5, 10, 26, 0.95) 75%)';

    const xpPercent = Math.min(100, (p?.xp || 60) % 100);
    const classmates = Array.isArray(room?.players) ? room.players.filter(pl => pl.id !== p?.id) : [];

    container.innerHTML = `
      <div class="gamified-lobby-container">
        <!-- Barra Superior de Navegación Gamer -->
        <div class="gamified-topbar">
          <div style="display: flex; align-items: center; gap: 1rem; flex-wrap: wrap;">
            <a href="javascript:void(0)" onclick="window.appRouter.navigate('home')" style="text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
              <span style="font-size: 1.8rem; filter: drop-shadow(0 0 10px #00f5d4);">🧠</span>
              <span style="font-size: 1.5rem; font-weight: 900; color: #ffffff;">MEN<span style="color: #00f5d4;">TIX</span></span>
            </a>
            <div class="gamified-topbar-pin" onclick="window.LobbyView.copyShareLink('${shareUrl}')" title="Toca para copiar enlace" style="cursor: pointer;">
              <span>📱</span> <span>PIN: ${formattedPin}</span>
              <span style="font-size: 0.8rem; opacity: 0.75; font-weight: 600;">(Copiar)</span>
            </div>
            <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); padding: 0.4rem 0.85rem; border-radius: 9999px; font-size: 0.82rem; font-weight: 800; color: #ffffff;">
              <span>${currentMode.icon}</span> <span>${room?.challenge?.title || 'Reto MENTIX'}</span>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 0.35rem 0.8rem; border-radius: 9999px; font-size: 0.8rem; font-weight: 800; color: #34d399;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; display: inline-block;"></span> En Línea
            </div>
            <button class="btn btn-outline btn-sm" onclick="window.appRouter.navigate('home')" style="border-radius: 9999px; font-weight: 800; padding: 0.4rem 1rem;">
              🚪 Salir
            </button>
          </div>
        </div>

        <!-- Pestañas Móviles (visibles solo en pantallas pequeñas) -->
        <div class="gamified-mobile-tabs">
          <button class="btn btn-sm ${this.waitingMobileTab === 'character' ? 'btn-cyan' : 'btn-outline'}" onclick="window.LobbyView.switchWaitingTab('character')" style="flex: 1; font-weight: 800; border-radius: 9999px;">
            👤 Mi Personaje
          </button>
          <button class="btn btn-sm ${this.waitingMobileTab === 'minigames' ? 'btn-cyan' : 'btn-outline'}" onclick="window.LobbyView.switchWaitingTab('minigames')" style="flex: 1; font-weight: 800; border-radius: 9999px;">
            🎮 Minijuegos
          </button>
          <button class="btn btn-sm ${this.waitingMobileTab === 'classmates' ? 'btn-cyan' : 'btn-outline'}" onclick="window.LobbyView.switchWaitingTab('classmates')" style="flex: 1; font-weight: 800; border-radius: 9999px;">
            👥 Compañeros (${classmates.length + 1})
          </button>
        </div>

        <!-- Layout Principal de 3 Paneles AAA -->
        <div class="gamified-lobby-grid">
          
          <!-- ==========================================
               PANEL IZQUIERDO: MI PERSONAJE
               ========================================== -->
          <div class="gamified-panel-left ${this.waitingMobileTab !== 'character' ? 'mobile-hidden' : ''}" id="waiting-panel-character">
            <div class="glass-panel" style="padding: 1.5rem 1.25rem; border-radius: 20px; border-color: rgba(0, 245, 212, 0.35); display: flex; flex-direction: column; gap: 1rem;">
              
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; color: var(--neon-cyan); text-transform: uppercase;">
                  MI PERSONAJE 3D
                </span>
                <span class="badge-tag" style="background: rgba(121, 40, 202, 0.25); border: 1px solid #7928ca; color: #d8b4fe; font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.55rem; border-radius: 9999px;">
                  Nivel ${p?.level || 1}
                </span>
              </div>

              <!-- Escenario del Avatar con Rotación Interactiva -->
              <div 
                id="waiting-avatar-viewport-container"
                class="avatar-stage-viewport" 
                style="background: ${stageBgCss}; min-height: 270px; border-color: ${p?.isReady ? '#10b981' : 'rgba(0, 245, 212, 0.5)'}; box-shadow: ${p?.isReady ? '0 0 35px rgba(16, 185, 129, 0.45)' : '0 10px 30px rgba(0,0,0,0.5)'};"
              >
                <div id="waiting-avatar-viewport">
                  ${window.AvatarEngine ? window.AvatarEngine.renderSVG(avatarConfig, { size: 230 }) : `<span style="font-size: 4rem;">${p?.avatar || '😎'}</span>`}
                </div>
                <div style="font-size: 0.72rem; color: rgba(255,255,255,0.7); font-weight: 700; margin-top: 0.4rem; pointer-events: none;">
                  🔄 Arrastra para girar 360°
                </div>
              </div>

              <!-- Nombre, Título y Progreso de XP -->
              <div style="text-align: center;">
                <h3 style="font-size: 1.35rem; font-weight: 900; color: #ffffff; margin: 0 0 0.2rem; text-shadow: 0 0 15px rgba(0,245,212,0.6);" id="waiting-my-nickname">
                  ${p?.nickname || 'Jugador Pro'}
                </h3>
                <div style="font-size: 0.82rem; font-weight: 800; color: #ffd166; margin-bottom: 0.65rem;" id="waiting-my-title">
                  ${p?.title || 'Novato Curioso'}
                </div>

                <!-- Barra de XP -->
                <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">
                  <span id="waiting-my-xp">XP: ${p?.xp || 60}</span>
                  <span>Siguiente Nivel: 100 XP</span>
                </div>
                <div class="xp-progress-track">
                  <div class="xp-progress-fill" id="waiting-my-xp-bar" style="width: ${xpPercent}%;"></div>
                </div>
              </div>

              <!-- Selector Rápido de Gestos / Poses -->
              <div>
                <label style="display: block; font-size: 0.75rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 0.4rem;">
                  Gestos Rápidos:
                </label>
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.4rem;">
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.triggerQuickEmote('wave')" title="Saludar" style="padding: 0.4rem 0.2rem; font-size: 0.78rem; font-weight: 800;">
                    👋 Saludo
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.triggerQuickEmote('celebrate')" title="Celebrar" style="padding: 0.4rem 0.2rem; font-size: 0.78rem; font-weight: 800;">
                    🎉 Salto
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.triggerQuickEmote('dance')" title="Bailar" style="padding: 0.4rem 0.2rem; font-size: 0.78rem; font-weight: 800;">
                    💃 Baile
                  </button>
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.triggerQuickEmote('victory')" title="Victoria" style="padding: 0.4rem 0.2rem; font-size: 0.78rem; font-weight: 800;">
                    ✌️ Victoria
                  </button>
                </div>
              </div>

              <!-- Botones Principales: Personalizar y Estoy Listo -->
              <div style="display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.25rem;">
                <button 
                  class="btn btn-cyan btn-lg" 
                  style="width: 100%; font-weight: 900; font-size: 1.05rem; padding: 0.85rem; border-radius: 14px; background: linear-gradient(135deg, #00f5d4, #0ea5e9); color: #020617 !important; box-shadow: 0 4px 20px rgba(0, 245, 212, 0.4);"
                  onclick="window.LobbyView.openAvatarStudio()"
                >
                  <span>🎨</span> AVATAR STUDIO
                </button>

                <button 
                  id="btn-ready-toggle"
                  class="btn btn-lg" 
                  style="width: 100%; font-weight: 900; font-size: 1.05rem; padding: 0.85rem; border-radius: 14px; transition: all 0.2s; ${p?.isReady ? 'background: #10b981; color: #ffffff !important; border: 2px solid #10b981; box-shadow: 0 0 25px rgba(16, 185, 129, 0.6);' : 'background: rgba(15, 23, 42, 0.8); color: #ffd166 !important; border: 2px solid #ffd166;'}"
                  onclick="window.LobbyView.toggleReadyStatus()"
                >
                  ${p?.isReady ? '<span>🟢</span> ¡ESTOY LISTO!' : '<span>✏️</span> MARCAR COMO LISTO'}
                </button>
              </div>

            </div>
          </div>

          <!-- ==========================================
               PANEL CENTRAL: MUNDO INTERACTIVO / MINIJUEGOS
               ========================================== -->
          <div class="gamified-panel-center ${this.waitingMobileTab !== 'minigames' ? 'mobile-hidden' : ''}" id="waiting-panel-minigames">
            <div class="glass-panel" style="padding: 1.5rem 1.4rem; border-radius: 20px; border-color: rgba(0, 245, 212, 0.35); min-height: 480px; display: flex; flex-direction: column;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem; flex-wrap: wrap; gap: 0.5rem;">
                <div>
                  <div style="display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.78rem; font-weight: 900; color: #00f5d4; text-transform: uppercase;">
                    <span>🎮</span> MUNDO INTERACTIVO & MINIJUEGOS
                  </div>
                  <h2 style="font-size: 1.35rem; font-weight: 900; margin: 0.2rem 0 0; color: #ffffff;">
                    Zona de Calentamiento
                  </h2>
                </div>
                <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(255, 209, 102, 0.15); border: 1px solid #ffd166; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; color: #ffd166;">
                  <span>⏳</span> Esperando inicio por el docente
                </div>
              </div>

              <!-- Contenedor Dinámico de Minijuegos de Espera -->
              <div id="gamified-minigames-container" style="flex: 1; margin-bottom: 1.25rem;">
                <!-- Minijuegos renderizados por window.LobbyMinigames.init(...) -->
              </div>

              <!-- Barra Inferior de Reacciones Flotantes a la Sala -->
              <div style="background: rgba(10, 20, 45, 0.7); border: 1.5px solid rgba(255, 255, 255, 0.12); border-radius: 16px; padding: 0.85rem 1.15rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap;">
                <span style="font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); display: flex; align-items: center; gap: 0.35rem;">
                  <span>🔥</span> Reaccionar en vivo:
                </span>
                <div style="display: flex; gap: 0.45rem; flex-wrap: wrap;">
                  ${['🔥', '🎉', '🚀', '💯', '👏', '👋'].map(em => `
                    <button 
                      class="btn btn-sm btn-outline" 
                      style="font-size: 1.25rem; padding: 0.3rem 0.6rem; border-radius: 10px; background: rgba(15, 23, 42, 0.8);"
                      onclick="window.LobbyView.sendLobbyReaction('${em}')"
                      title="Enviar reacción"
                    >
                      ${em}
                    </button>
                  `).join('')}
                </div>
              </div>

            </div>
          </div>

          <!-- ==========================================
               PANEL DERECHO: SALA DE COMPAÑEROS
               ========================================== -->
          <div class="gamified-panel-right ${this.waitingMobileTab !== 'classmates' ? 'mobile-hidden' : ''}" id="waiting-panel-classmates">
            <div class="glass-panel" style="padding: 1.5rem 1.25rem; border-radius: 20px; border-color: rgba(0, 245, 212, 0.35); min-height: 480px; display: flex; flex-direction: column;">
              
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-size: 0.8rem; font-weight: 900; letter-spacing: 1px; color: var(--neon-cyan); text-transform: uppercase;">
                  SALA DE COMPAÑEROS
                </span>
                <span class="badge-tag" style="background: rgba(0, 245, 212, 0.15); border: 1px solid var(--neon-cyan); color: var(--neon-cyan); font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.55rem; border-radius: 9999px;" id="waiting-classmates-badge">
                  👤 ${classmates.length + 1}
                </span>
              </div>

              <!-- Lista de Compañeros con Avatares Renderizados -->
              <div id="waiting-classmates-list" style="display: flex; flex-direction: column; gap: 0.65rem; overflow-y: auto; max-height: 450px; flex: 1; padding-right: 0.25rem;">
                ${this.renderClassmatesItems(classmates, p)}
              </div>

              <!-- Contenedor de Notificaciones Toast de Nuevas Llegadas -->
              <div id="waiting-toasts-container" style="margin-top: 0.75rem;"></div>

            </div>
          </div>

        </div>

        <!-- ==========================================
             MODAL: AVATAR STUDIO (EDITOR COMPLETO AAA)
             ========================================== -->
        <div id="avatar-studio-modal" class="avatar-studio-overlay" style="display: none;">
          <div class="avatar-studio-container">
            
            <div class="avatar-studio-header">
              <div style="display: flex; align-items: center; gap: 0.65rem;">
                <span style="font-size: 1.8rem;">🎨</span>
                <div>
                  <h2 style="font-size: 1.35rem; font-weight: 900; margin: 0; color: #ffffff;">
                    AVATAR STUDIO
                  </h2>
                  <span style="font-size: 0.78rem; color: #00f5d4; font-weight: 700;">
                    Personaliza tu personaje • Estilo Videojuego AAA
                  </span>
                </div>
              </div>
              <button class="btn btn-outline btn-icon" onclick="window.LobbyView.closeAvatarStudio()" style="border-radius: 50%; width: 36px; height: 36px; font-weight: 900;">✕</button>
            </div>

            <div class="avatar-studio-body">
              <!-- Columna Izquierda: Vista Previa en Vivo -->
              <div class="avatar-studio-preview-col">
                <div id="studio-avatar-preview-box" style="margin-bottom: 1rem;">
                  <!-- Renderizado en vivo por updateStudioPreview -->
                </div>
                <div style="font-size: 0.75rem; color: rgba(255,255,255,0.7); font-weight: 700; margin-bottom: 1rem;">
                  🔄 Arrastra para girar en 3D
                </div>
                <div style="display: flex; gap: 0.4rem; justify-content: center; flex-wrap: wrap;">
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.previewStudioEmote('wave')" style="border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">👋 Saludo</button>
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.previewStudioEmote('celebrate')" style="border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">🎉 Celebrar</button>
                  <button class="btn btn-sm btn-outline" onclick="window.LobbyView.previewStudioEmote('victory')" style="border-radius: 9999px; font-size: 0.75rem; font-weight: 800;">✌️ Victoria</button>
                </div>
              </div>

              <!-- Columna Derecha: Pestañas y Catálogo de Opciones -->
              <div class="avatar-studio-controls-col">
                <!-- Pestañas de Categoría -->
                <div style="display: flex; gap: 0.45rem; overflow-x: auto; padding-bottom: 0.25rem;">
                  <button class="studio-tab-btn active" id="stab-presets" onclick="window.LobbyView.setStudioTab('presets')">⚡ Estilos</button>
                  <button class="studio-tab-btn" id="stab-appearance" onclick="window.LobbyView.setStudioTab('appearance')">👤 Rostro & Pelo</button>
                  <button class="studio-tab-btn" id="stab-clothing" onclick="window.LobbyView.setStudioTab('clothing')">👕 Ropa</button>
                  <button class="studio-tab-btn" id="stab-emotes" onclick="window.LobbyView.setStudioTab('emotes')">🎭 Gestos</button>
                  <button class="studio-tab-btn" id="stab-alias" onclick="window.LobbyView.setStudioTab('alias')">🏷️ Alias & Escenario</button>
                </div>

                <!-- Panel dinámico de controles de la pestaña activa -->
                <div id="studio-tab-content-panel" style="flex: 1;">
                  <!-- Contenido inyectado por renderStudioTabContent -->
                </div>

                <!-- Botones de Guardar / Cancelar -->
                <div style="display: flex; gap: 0.85rem; padding-top: 1rem; border-top: 1.5px solid rgba(255,255,255,0.1); margin-top: auto;">
                  <button class="btn btn-outline" onclick="window.LobbyView.closeAvatarStudio()" style="flex: 1; font-weight: 800; border-radius: 12px;">
                    Cancelar
                  </button>
                  <button class="btn btn-cyan btn-lg" onclick="window.LobbyView.saveAvatarStudio()" style="flex: 2; font-weight: 900; border-radius: 12px; background: linear-gradient(135deg, #00f5d4, #7928ca); color: #ffffff !important; box-shadow: 0 4px 20px rgba(0, 245, 212, 0.4);">
                    💾 Guardar Personaje (+50 XP)
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;

    // Inicializar visualización interactiva 3D
    const viewportEl = document.getElementById('waiting-avatar-viewport-container');
    if (viewportEl && window.AvatarEngine) {
      window.AvatarEngine.attachInteractive3D(viewportEl, avatarConfig);
    }

    // Inicializar minijuegos en el panel central
    const minigamesEl = document.getElementById('gamified-minigames-container');
    if (minigamesEl && window.LobbyMinigames) {
      window.LobbyMinigames.init(minigamesEl);
    }
  },

  renderClassmatesItems(classmates, localPlayer) {
    let html = '';
    // Incluir al jugador local de primero
    if (localPlayer) {
      html += `
        <div class="classmate-gamer-card ${localPlayer.isReady ? 'is-ready' : ''}" style="border-left: 4px solid var(--neon-cyan);">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);">
            ${localPlayer.avatarConfig && window.AvatarEngine ? window.AvatarEngine.renderSVG(localPlayer.avatarConfig, { size: 44 }) : `<span style="font-size: 1.6rem;">${localPlayer.avatar || '😎'}</span>`}
          </div>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            <div style="font-weight: 800; font-size: 0.92rem; color: #ffffff;">${localPlayer.nickname} <span style="font-size: 0.72rem; color: var(--neon-cyan);">(Tú)</span></div>
            <div style="font-size: 0.7rem; color: #ffd166; font-weight: 700;">${localPlayer.title || 'Novato'} • Nvl ${localPlayer.level || 1}</div>
          </div>
          <span style="font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 9999px; background: ${localPlayer.isReady ? 'rgba(16,185,129,0.25)' : 'rgba(234,179,8,0.25)'}; color: ${localPlayer.isReady ? '#34d399' : '#fde047'}; font-weight: 800; border: 1px solid ${localPlayer.isReady ? '#10b981' : '#eab308'};">
            ${localPlayer.isReady ? '🟢 Listo' : '✏️ Editando'}
          </span>
        </div>
      `;
    }

    if (!classmates || classmates.length === 0) {
      html += `
        <div style="text-align: center; padding: 2rem 1rem; color: var(--text-muted);">
          <div style="font-size: 2.2rem; margin-bottom: 0.4rem;">👥</div>
          <p style="font-size: 0.85rem; font-weight: 700; margin: 0; color: var(--text-secondary);">
            Esperando a que tus compañeros ingresen con el código...
          </p>
        </div>
      `;
      return html;
    }

    classmates.forEach(c => {
      html += `
        <div class="classmate-gamer-card ${c.isReady ? 'is-ready' : ''}">
          <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);">
            ${c.avatarConfig && window.AvatarEngine ? window.AvatarEngine.renderSVG(c.avatarConfig, { size: 44 }) : `<span style="font-size: 1.6rem;">${c.avatar || '😎'}</span>`}
          </div>
          <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1;">
            <div style="font-weight: 800; font-size: 0.92rem; color: #ffffff;">${c.nickname}</div>
            <div style="font-size: 0.7rem; color: #ffd166; font-weight: 700;">${c.title || 'Gamer Pro'} • Nvl ${c.level || 1}</div>
          </div>
          <span style="font-size: 0.68rem; padding: 0.15rem 0.5rem; border-radius: 9999px; background: ${c.isReady ? 'rgba(16,185,129,0.25)' : 'rgba(234,179,8,0.25)'}; color: ${c.isReady ? '#34d399' : '#fde047'}; font-weight: 800; border: 1px solid ${c.isReady ? '#10b981' : '#eab308'};">
            ${c.isReady ? '🟢 Listo' : '✏️ Editando'}
          </span>
        </div>
      `;
    });

    return html;
  },

  updateClassmatesList() {
    const listEl = document.getElementById('waiting-classmates-list');
    const badgeEl = document.getElementById('waiting-classmates-badge');
    const p = window.realtimeEngine.localPlayer;
    const room = window.realtimeEngine.currentRoom;
    const classmates = Array.isArray(room?.players) ? room.players.filter(pl => pl.id !== p?.id) : [];

    if (badgeEl) badgeEl.textContent = `👤 ${classmates.length + 1}`;
    if (listEl) {
      listEl.innerHTML = this.renderClassmatesItems(classmates, p);
    }
  },

  updateMyCharacterPanel() {
    const p = window.realtimeEngine.localPlayer;
    const av = window.AvatarEngine ? window.AvatarEngine.getSavedAvatar() : null;
    if (!p || !av) return;

    p.avatarConfig = av;
    p.nickname = av.alias || p.nickname;
    p.title = av.title || p.title;
    p.xp = av.xp || p.xp;
    p.level = av.level || p.level;

    const nickEl = document.getElementById('waiting-my-nickname');
    const titleEl = document.getElementById('waiting-my-title');
    const xpEl = document.getElementById('waiting-my-xp');
    const xpBar = document.getElementById('waiting-my-xp-bar');
    const viewPort = document.getElementById('waiting-avatar-viewport');

    if (nickEl) nickEl.textContent = p.nickname;
    if (titleEl) titleEl.textContent = p.title;
    if (xpEl) xpEl.textContent = `XP: ${p.xp}`;
    if (xpBar) xpBar.style.width = `${Math.min(100, p.xp % 100)}%`;

    if (viewPort && window.AvatarEngine) {
      viewPort.innerHTML = window.AvatarEngine.renderSVG(av, { size: 230 });
      const containerEl = document.getElementById('waiting-avatar-viewport-container');
      if (containerEl) {
        const bgObj = window.AvatarEngine.stageBackgrounds?.[av.stageBg || 'matrix_neon'];
        if (bgObj) containerEl.style.background = bgObj.css;
        window.AvatarEngine.attachInteractive3D(containerEl, av);
      }
    }
  },

  toggleReadyStatus() {
    const p = window.realtimeEngine.localPlayer;
    if (!p) return;
    p.isReady = !p.isReady;
    p.status = p.isReady ? 'ready' : 'customizing';

    const btn = document.getElementById('btn-ready-toggle');
    const stageContainer = document.getElementById('waiting-avatar-viewport-container');

    if (btn) {
      if (p.isReady) {
        btn.innerHTML = `<span>🟢</span> ¡ESTOY LISTO!`;
        btn.style.background = '#10b981';
        btn.style.color = '#ffffff';
        btn.style.borderColor = '#10b981';
        btn.style.boxShadow = '0 0 25px rgba(16, 185, 129, 0.6)';
      } else {
        btn.innerHTML = `<span>✏️</span> CONTINUAR EDITANDO`;
        btn.style.background = 'rgba(15, 23, 42, 0.8)';
        btn.style.color = '#ffd166';
        btn.style.borderColor = '#ffd166';
        btn.style.boxShadow = 'none';
      }
    }

    if (stageContainer) {
      stageContainer.style.borderColor = p.isReady ? '#10b981' : 'rgba(0, 245, 212, 0.5)';
      stageContainer.style.boxShadow = p.isReady ? '0 0 35px rgba(16, 185, 129, 0.45)' : '0 10px 30px rgba(0,0,0,0.5)';
    }

    if (window.soundEngine) {
      p.isReady ? window.soundEngine.playPowerUp() : window.soundEngine.playTick();
    }

    this.broadcastAvatarUpdate();
    this.updateClassmatesList();
  },

  triggerQuickEmote(eKey) {
    if (window.AvatarEngine) {
      const updated = window.AvatarEngine.saveAvatar({ emote: eKey });
      window.AvatarEngine.awardXP(10, `Gesto: ${eKey}`);
      this.updateMyCharacterPanel();
      this.broadcastAvatarUpdate();
      if (window.soundEngine) window.soundEngine.playClick();
    }
  },

  sendLobbyReaction(emoji) {
    const p = window.realtimeEngine.localPlayer;
    const pin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
    if (window.realtimeEngine) {
      window.realtimeEngine.broadcast({
        type: 'LOBBY_REACTION',
        pin: pin,
        sender: p?.nickname || 'Jugador',
        emoji: emoji
      });
    }
    this.spawnFloatingEmoji(emoji, p?.nickname);
    if (window.AvatarEngine) window.AvatarEngine.awardXP(5, 'Reacción en sala');
    if (window.soundEngine) window.soundEngine.playPop();
  },

  spawnFloatingEmoji(emoji, sender) {
    const el = document.createElement('div');
    el.className = 'floating-reaction-emoji';
    el.textContent = emoji;
    const randomLeft = 15 + Math.random() * 70;
    el.style.left = `${randomLeft}vw`;
    el.style.bottom = '15vh';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  },

  showJoinToast(nickname) {
    const container = document.getElementById('waiting-toasts-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.style.background = 'rgba(0, 245, 212, 0.15)';
    toast.style.border = '1px solid #00f5d4';
    toast.style.color = '#00f5d4';
    toast.style.padding = '0.4rem 0.75rem';
    toast.style.borderRadius = '10px';
    toast.style.fontSize = '0.78rem';
    toast.style.fontWeight = '800';
    toast.style.marginBottom = '0.35rem';
    toast.style.animation = 'anim-breathing 1.5s ease';
    toast.innerHTML = `👋 ¡<strong>${nickname}</strong> se unió a la sala!`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  },

  showGameStartTransition(callback) {
    const curtain = document.createElement('div');
    curtain.className = 'game-start-transition-curtain';
    curtain.innerHTML = `
      <div style="font-size: 4.5rem; margin-bottom: 0.5rem; filter: drop-shadow(0 0 25px #00f5d4); animation: timer-pulse 0.6s infinite alternate;">🚀</div>
      <h1 style="font-size: clamp(2.4rem, 6vw, 3.8rem); font-weight: 900; color: #ffffff; margin: 0 0 0.5rem; text-shadow: 0 0 35px #00f5d4; text-align: center;">
        ¡EL EXAMEN INICIA AHORA!
      </h1>
      <p style="font-size: 1.3rem; color: #ffd166; font-weight: 800; margin: 0; text-align: center;">
        ¡Prepárate para responder en tu dispositivo!
      </p>
    `;
    document.body.appendChild(curtain);

    setTimeout(() => {
      curtain.remove();
      if (typeof callback === 'function') callback();
    }, 2600);
  },

  toggleHostMinigames() {
    if (!this.currentRoom) return;
    this.currentRoom.allowMinigames = this.currentRoom.allowMinigames === false ? true : false;
    window.realtimeEngine.broadcast({
      type: 'LOBBY_CONFIG_UPDATE',
      pin: this.currentRoom.pin,
      allowMinigames: this.currentRoom.allowMinigames,
      allowCustomization: this.currentRoom.allowCustomization !== false
    });
    window.realtimeEngine.syncRoomState();
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  toggleHostCustomization() {
    if (!this.currentRoom) return;
    this.currentRoom.allowCustomization = this.currentRoom.allowCustomization === false ? true : false;
    window.realtimeEngine.broadcast({
      type: 'LOBBY_CONFIG_UPDATE',
      pin: this.currentRoom.pin,
      allowMinigames: this.currentRoom.allowMinigames !== false,
      allowCustomization: this.currentRoom.allowCustomization
    });
    window.realtimeEngine.syncRoomState();
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  broadcastAvatarUpdate() {
    const p = window.realtimeEngine.localPlayer;
    const pin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
    if (!p || !pin) return;

    window.realtimeEngine.broadcast({
      type: 'PLAYER_AVATAR_UPDATE',
      pin: pin,
      playerId: p.id,
      avatarConfig: p.avatarConfig,
      isReady: !!p.isReady,
      status: p.status || 'ready',
      nickname: p.nickname,
      title: p.title,
      xp: p.xp,
      level: p.level
    });

    if (window.realtimeEngine.publishMqtt) {
      window.realtimeEngine.publishMqtt(`mentix/rooms/${pin}/player_events`, {
        type: 'PLAYER_AVATAR_UPDATE',
        pin: pin,
        playerId: p.id,
        avatarConfig: p.avatarConfig,
        isReady: !!p.isReady,
        status: p.status || 'ready',
        nickname: p.nickname,
        title: p.title,
        xp: p.xp,
        level: p.level
      });
    }
  },

  // ==========================================
  // 🎨 AVATAR STUDIO: MODAL Y FUNCIONES
  // ==========================================
  openAvatarStudio() {
    const room = window.realtimeEngine.currentRoom;
    if (room && room.allowCustomization === false) {
      alert('🔒 El profesor ha cerrado la edición de avatares para comenzar la prueba.');
      return;
    }

    const modal = document.getElementById('avatar-studio-modal');
    if (!modal) return;

    this.studioTempConfig = { ...window.AvatarEngine.getSavedAvatar() };
    this.currentStudioTab = 'presets';
    modal.style.display = 'flex';

    this.setStudioTab('presets');
    this.updateStudioPreview();
    if (window.soundEngine) window.soundEngine.playClick();
  },

  closeAvatarStudio() {
    const modal = document.getElementById('avatar-studio-modal');
    if (modal) modal.style.display = 'none';
  },

  setStudioTab(tab) {
    this.currentStudioTab = tab;
    ['presets', 'appearance', 'clothing', 'emotes', 'alias'].forEach(t => {
      const btn = document.getElementById(`stab-${t}`);
      if (btn) btn.classList.toggle('active', t === tab);
    });
    this.renderStudioTabContent();
  },

  updateStudioPreview() {
    const box = document.getElementById('studio-avatar-preview-box');
    if (!box || !window.AvatarEngine) return;

    box.innerHTML = window.AvatarEngine.renderSVG(this.studioTempConfig, { size: 240 });
    const col = document.querySelector('.avatar-studio-preview-col');
    if (col && this.studioTempConfig.stageBg) {
      const bgObj = window.AvatarEngine.stageBackgrounds?.[this.studioTempConfig.stageBg];
      if (bgObj) col.style.background = bgObj.css;
    }
    window.AvatarEngine.attachInteractive3D(box, this.studioTempConfig);
  },

  previewStudioEmote(eKey) {
    this.studioTempConfig.emote = eKey;
    this.updateStudioPreview();
    if (window.soundEngine) window.soundEngine.playTick();
  },

  selectStudioPreset(key) {
    const pr = window.AvatarEngine?.presets?.[key];
    if (!pr) return;
    this.studioTempConfig = { ...this.studioTempConfig, ...pr.config };
    this.updateStudioPreview();
    this.renderStudioTabContent();
    if (window.soundEngine) window.soundEngine.playClick();
  },

  updateStudioProp(prop, val) {
    this.studioTempConfig[prop] = val;
    this.updateStudioPreview();
  },

  validateNickname(name) {
    if (!name || name.trim().length < 3) {
      return { valid: false, error: 'El alias debe tener al menos 3 caracteres.' };
    }
    if (name.trim().length > 20) {
      return { valid: false, error: 'El alias no puede superar los 20 caracteres.' };
    }
    const forbidden = ['puta', 'puto', 'mierda', 'gonorrea', 'malparido', 'culo', 'estupido', 'idiota', 'pendejo', 'imbecil', 'marica'];
    const lower = name.toLowerCase();
    for (const word of forbidden) {
      if (lower.includes(word)) {
        return { valid: false, error: 'Por favor elige un alias respetuoso y amigable.' };
      }
    }
    return { valid: true, cleanName: name.trim() };
  },

  renderStudioTabContent() {
    const panel = document.getElementById('studio-tab-content-panel');
    if (!panel) return;
    const c = this.studioTempConfig || window.AvatarEngine.getSavedAvatar();

    if (this.currentStudioTab === 'presets') {
      const presets = window.AvatarEngine.presets || {};
      panel.innerHTML = `
        <div>
          <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; margin-bottom: 0.85rem;">
            ⚡ Selecciona un Estilo Completo (1-Clic):
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.75rem;">
            ${Object.keys(presets).map(k => {
              const p = presets[k];
              return `
                <div 
                  class="studio-option-card ${c.preset === k ? 'active' : ''}"
                  onclick="window.LobbyView.selectStudioPreset('${k}')"
                >
                  <span style="font-size: 1.8rem;">${p.icon}</span>
                  <div>
                    <div style="font-weight: 900; font-size: 0.92rem; color: #ffffff;">${p.name}</div>
                    <div style="font-size: 0.74rem; color: var(--text-secondary); line-height: 1.25;">${p.desc}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (this.currentStudioTab === 'appearance') {
      const skinColors = ['#ffd1a4', '#fcd5b5', '#e0ac69', '#c68642', '#8d5524', '#2d1e18', '#38bdf8', '#d946ef'];
      const hairColors = ['#00f5d4', '#ff007f', '#ffd166', '#10b981', '#8b5cf6', '#111827', '#78350f', '#ffffff'];
      const hairStyles = [
        { id: 'spiky', label: 'Anime Spiky' },
        { id: 'curly', label: 'Rizado' },
        { id: 'short', label: 'Fade Corto' },
        { id: 'afro', label: 'Afro' },
        { id: 'long', label: 'Melena Larga' },
        { id: 'cyber_fade', label: 'Cyber Fade' }
      ];
      const eyesStyles = [
        { id: 'normal', label: 'Normal' },
        { id: 'tech', label: 'Reflejos Tech' },
        { id: 'anime', label: 'Anime' },
        { id: 'shades', label: 'Gafas Oscuras' },
        { id: 'cyber_visor', label: 'Visor Holográfico' }
      ];
      const faceStyles = [
        { id: 'smile', label: 'Sonrisa' },
        { id: 'confident', label: 'Confiado' },
        { id: 'focused', label: 'Concentrado' },
        { id: 'wink', label: 'Guiño' },
        { id: 'cyber', label: 'Cibernético' }
      ];

      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Tono de piel -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              🎨 Tono de Piel:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${skinColors.map(color => `
                <div 
                  class="studio-color-swatch ${c.skinColor === color ? 'active' : ''}" 
                  style="background: ${color};"
                  onclick="window.LobbyView.updateStudioProp('skinColor', '${color}')"
                ></div>
              `).join('')}
            </div>
          </div>

          <!-- Peinado -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              ✂️ Estilo de Cabello:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${hairStyles.map(h => `
                <button 
                  class="btn btn-sm ${c.hairStyle === h.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('hairStyle', '${h.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${h.label}</button>
              `).join('')}
            </div>
          </div>

          <!-- Color de pelo -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              🌈 Color de Cabello:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${hairColors.map(color => `
                <div 
                  class="studio-color-swatch ${c.hairColor === color ? 'active' : ''}" 
                  style="background: ${color};"
                  onclick="window.LobbyView.updateStudioProp('hairColor', '${color}')"
                ></div>
              `).join('')}
            </div>
          </div>

          <!-- Ojos / Mirada -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              👀 Mirada / Ojos:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${eyesStyles.map(e => `
                <button 
                  class="btn btn-sm ${c.eyesStyle === e.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('eyesStyle', '${e.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${e.label}</button>
              `).join('')}
            </div>
          </div>

          <!-- Expresión facial -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              😄 Expresión de Rostro:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${faceStyles.map(f => `
                <button 
                  class="btn btn-sm ${c.faceStyle === f.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('faceStyle', '${f.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${f.label}</button>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (this.currentStudioTab === 'clothing') {
      const topTypes = [
        { id: 'hoodie', label: 'Hoodie Gamer' },
        { id: 'tshirt', label: 'Camiseta' },
        { id: 'jacket', label: 'Chaqueta Bomber' },
        { id: 'labcoat', label: 'Bata Científica' },
        { id: 'cyber_suit', label: 'Traje Cyber' }
      ];
      const topColors = ['#7928ca', '#f72585', '#00f5d4', '#10b981', '#3b82f6', '#f59e0b', '#111827', '#ffffff'];
      const bottomTypes = [
        { id: 'cargo', label: 'Cargo Táctico' },
        { id: 'jeans', label: 'Jeans' },
        { id: 'joggers', label: 'Joggers' },
        { id: 'cyber_pants', label: 'Cyber Pants' }
      ];
      const bottomColors = ['#1a1f36', '#0f172a', '#1e293b', '#2e1065', '#064e3b', '#451a03'];
      const shoeTypes = [
        { id: 'sneakers', label: 'Sneakers' },
        { id: 'boots', label: 'Botas' },
        { id: 'cyber_boots', label: 'Cyber Boots' }
      ];
      const accessories = [
        { id: 'none', label: 'Ninguno' },
        { id: 'headphones', label: 'Auriculares RGB' },
        { id: 'cap', label: 'Gorra' },
        { id: 'glasses', label: 'Gafas Pro' },
        { id: 'mask', label: 'Mascarilla Táctica' },
        { id: 'cyber_ear', label: 'Dispositivo Cyber' },
        { id: 'backpack', label: 'Mochila' }
      ];
      const accColors = ['#ff007f', '#00f5d4', '#ffd166', '#a855f7', '#3b82f6', '#ffffff'];

      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Ropa Superior -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              👕 Prenda Superior:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
              ${topTypes.map(t => `
                <button 
                  class="btn btn-sm ${c.topType === t.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('topType', '${t.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${t.label}</button>
              `).join('')}
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${topColors.map(color => `
                <div 
                  class="studio-color-swatch ${c.topColor === color ? 'active' : ''}" 
                  style="background: ${color}; width: 28px; height: 28px;"
                  onclick="window.LobbyView.updateStudioProp('topColor', '${color}')"
                ></div>
              `).join('')}
            </div>
          </div>

          <!-- Pantalones -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              👖 Pantalones:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
              ${bottomTypes.map(b => `
                <button 
                  class="btn btn-sm ${c.bottomType === b.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('bottomType', '${b.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${b.label}</button>
              `).join('')}
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${bottomColors.map(color => `
                <div 
                  class="studio-color-swatch ${c.bottomColor === color ? 'active' : ''}" 
                  style="background: ${color}; width: 28px; height: 28px;"
                  onclick="window.LobbyView.updateStudioProp('bottomColor', '${color}')"
                ></div>
              `).join('')}
            </div>
          </div>

          <!-- Calzado -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              👟 Calzado:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              ${shoeTypes.map(s => `
                <button 
                  class="btn btn-sm ${c.shoesType === s.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('shoesType', '${s.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${s.label}</button>
              `).join('')}
            </div>
          </div>

          <!-- Accesorios -->
          <div>
            <label style="display: block; font-size: 0.82rem; font-weight: 800; color: #ffffff; margin-bottom: 0.45rem;">
              🎧 Accesorios:
            </label>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.45rem;">
              ${accessories.map(a => `
                <button 
                  class="btn btn-sm ${c.accessory === a.id ? 'btn-cyan' : 'btn-outline'}" 
                  onclick="window.LobbyView.updateStudioProp('accessory', '${a.id}')"
                  style="border-radius: 8px; font-weight: 800; font-size: 0.82rem;"
                >${a.label}</button>
              `).join('')}
            </div>
            <div style="display: flex; gap: 0.4rem; flex-wrap: wrap;">
              ${accColors.map(color => `
                <div 
                  class="studio-color-swatch ${c.accessoryColor === color ? 'active' : ''}" 
                  style="background: ${color}; width: 28px; height: 28px;"
                  onclick="window.LobbyView.updateStudioProp('accessoryColor', '${color}')"
                ></div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    } else if (this.currentStudioTab === 'emotes') {
      const emotes = window.AvatarEngine.emotes || {};
      panel.innerHTML = `
        <div>
          <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; margin-bottom: 0.85rem;">
            🎭 Gestos y Animaciones:
          </label>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.65rem;">
            ${Object.keys(emotes).map(k => {
              const e = emotes[k];
              return `
                <div 
                  class="studio-option-card ${c.emote === k ? 'active' : ''}"
                  onclick="window.LobbyView.updateStudioProp('emote', '${k}')"
                >
                  <span style="font-size: 1.6rem;">${e.icon}</span>
                  <div>
                    <div style="font-weight: 900; font-size: 0.9rem; color: #ffffff;">${e.name}</div>
                    <div style="font-size: 0.72rem; color: var(--text-secondary); line-height: 1.2;">${e.desc}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `;
    } else if (this.currentStudioTab === 'alias') {
      const backgrounds = window.AvatarEngine.stageBackgrounds || {};
      const titles = window.AvatarEngine.titles || [];

      panel.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1.25rem;">
          <!-- Alias del Jugador -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; margin-bottom: 0.45rem;">
              🏷️ Alias Visible en la Sala:
            </label>
            <input 
              type="text" 
              id="studio-alias-input" 
              value="${c.alias || ''}" 
              placeholder="Ej: CyberPro" 
              maxlength="20"
              oninput="window.LobbyView.studioTempConfig.alias = this.value; window.LobbyView.updateStudioPreview();"
              style="width: 100%; box-sizing: border-box; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(15,23,42,0.8); border: 2px solid var(--neon-cyan); color: #ffffff; font-weight: 800; font-size: 1.05rem;"
            />
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.35rem;">
              De 3 a 20 caracteres. Palabras ofensivas no están permitidas.
            </div>
          </div>

          <!-- Fondo de Escenario -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; margin-bottom: 0.45rem;">
              🌌 Fondo de Escenario Virtual:
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.65rem;">
              ${Object.keys(backgrounds).map(k => {
                const bg = backgrounds[k];
                return `
                  <div 
                    class="studio-option-card ${c.stageBg === k ? 'active' : ''}"
                    onclick="window.LobbyView.updateStudioProp('stageBg', '${k}')"
                  >
                    <span style="font-size: 1.5rem;">${bg.icon}</span>
                    <span style="font-weight: 800; font-size: 0.88rem; color: #ffffff;">${bg.name}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Títulos Decorativos -->
          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; margin-bottom: 0.45rem;">
              👑 Título Decorativo del Personaje:
            </label>
            <select 
              onchange="window.LobbyView.updateStudioProp('title', this.value)"
              style="width: 100%; padding: 0.75rem; border-radius: 12px; background: rgba(15,23,42,0.8); border: 1.5px solid var(--neon-cyan); color: #ffffff; font-weight: 800; font-size: 0.95rem;"
            >
              ${titles.map(t => `
                <option value="${t.name}" ${c.title === t.name ? 'selected' : ''}>
                  ${t.icon} ${t.name} (Desbloqueado con ${t.xpReq} XP)
                </option>
              `).join('')}
            </select>
          </div>
        </div>
      `;
    }
  },

  saveAvatarStudio() {
    const input = document.getElementById('studio-alias-input');
    const aliasToSave = (input ? input.value : this.studioTempConfig.alias) || 'Gamer Pro';
    const validation = this.validateNickname(aliasToSave);

    if (!validation.valid) {
      alert(`⚠️ ${validation.error}`);
      return;
    }

    this.studioTempConfig.alias = validation.cleanName;
    const updated = window.AvatarEngine.saveAvatar(this.studioTempConfig);
    window.AvatarEngine.awardXP(50, 'Personalización de Avatar guardada');

    const p = window.realtimeEngine.localPlayer;
    if (p) {
      p.avatarConfig = updated;
      p.nickname = updated.alias;
      p.title = updated.title;
      p.xp = updated.xp;
      p.level = updated.level;
    }

    this.closeAvatarStudio();
    this.updateMyCharacterPanel();
    this.broadcastAvatarUpdate();
    if (window.soundEngine) window.soundEngine.playPowerUp();
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

    let finalEmail = email;
    if (!finalEmail) {
      if (room && room.rosterMode === 'roster') {
        alert('Por favor selecciona tu nombre y correo oficial de la lista.');
        return;
      }
      finalEmail = `${nickname.toLowerCase().replace(/[^a-z0-9]/g, '') || 'alumno'}@mentix.player`;
    }
    if (!room) {
      console.log('Buscando sala en la red con PIN:', pin);
    }

    window.realtimeEngine.joinRoom(pin, nickname, avatar, finalEmail, studentId, room);
    if (room && window.realtimeEngine.currentRoom) {
      if (room.gameMode) window.realtimeEngine.currentRoom.gameMode = room.gameMode;
      window.realtimeEngine.currentRoom.challenge = room.challenge || window.realtimeEngine.currentRoom.challenge;
      window.realtimeEngine.currentRoom.modeConfig = room.modeConfig || window.realtimeEngine.currentRoom.modeConfig;
      if (room.design) {
        window.realtimeEngine.currentRoom.design = room.design;
        if (window.AdminView) window.AdminView.applyDesign(room.design);
        try { localStorage.setItem('mentix_admin_design', JSON.stringify(room.design)); } catch(e) {}
      }
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
      const pin = String(window.realtimeEngine.currentRoom?.pin || this.joinPin || '').replace(/\D/g, '');
      if (pin) {
        // Enviar anuncio periódico cada ~1.5s al anfitrión por MQTT/WebRTC para garantizar presencia permanente
        if (!this.lastJoinPing || Date.now() - this.lastJoinPing > 1500) {
          this.lastJoinPing = Date.now();
          if (window.realtimeEngine && window.realtimeEngine.localPlayer) {
            window.realtimeEngine.broadcast({
              type: 'PLAYER_JOIN',
              pin: pin,
              player: window.realtimeEngine.localPlayer
            });
          }
        }

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
    }, 400);
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

    const cleanPin = String(this.currentRoom.pin).replace(/\D/g, '');
    this.currentRoom.status = 'intro';
    localStorage.setItem(`te_reto_room_${cleanPin}`, JSON.stringify(this.currentRoom));
    window.realtimeEngine.broadcast({
      type: 'START_GAME',
      pin: cleanPin,
      room: this.currentRoom
    });

    window.soundEngine.playFanfare();
    window.appRouter.startLiveHostGame(this.currentRoom);
  }
};
