/**
 * 🔥 TE RETO - Motor en Tiempo Real y Multijugador
 * Soporta sincronización por BroadcastChannel, LocalStorage y Bots Autónomos.
 */

class RealtimeEngine {
  constructor() {
    this.channelName = 'te_reto_realtime_bus';
    this.channel = null;
    this.listeners = new Map();
    this.currentRoom = null;
    this.isHost = false;
    this.localPlayer = null;
    this.botIntervals = [];

    this.initBus();
  }

  initBus() {
    try {
      if (window.BroadcastChannel) {
        this.channel = new BroadcastChannel(this.channelName);
        this.channel.onmessage = (event) => this.handleMessage(event.data);
      }
    } catch (e) {
      console.warn('BroadcastChannel no soportado, usando fallback de Storage', e);
    }

    // Fallback con eventos de storage para navegadores antiguos
    window.addEventListener('storage', (event) => {
      if (event.key === 'te_reto_storage_bus' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.handleMessage(data);
        } catch (err) {}
      }
    });
  }

  broadcast(message) {
    message.timestamp = Date.now();
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {}
    }
    // Storage fallback
    try {
      localStorage.setItem('te_reto_storage_bus', JSON.stringify(message));
    } catch (e) {}
    // Supabase Realtime Cloud Broadcast
    if (window.supabaseService && window.supabaseService.isConnected) {
      const pin = message.pin || this.currentRoom?.pin;
      if (pin) {
        window.supabaseService.sendBroadcast(pin, message);
      }
    }
  }

  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
  }

  off(eventType, callback) {
    if (!this.listeners.has(eventType)) return;
    if (!callback) {
      this.listeners.delete(eventType);
    } else {
      const list = this.listeners.get(eventType).filter(cb => cb !== callback);
      this.listeners.set(eventType, list);
    }
  }

  emit(eventType, payload) {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType).forEach((cb) => {
        try {
          cb(payload);
        } catch (err) {
          console.error('Error in listener', err);
        }
      });
    }
  }

  handleMessage(msg) {
    if (!msg || !msg.type) return;
    // Evitar procesamiento duplicado instantáneo del mismo mensaje exacto
    if (msg.timestamp && this.lastProcessedTimestamp === msg.timestamp) {
      return;
    }
    // Si el mensaje es de una sala diferente y no es broadcast general, ignorar
    const myPin = this.currentRoom?.pin;
    if (myPin && msg.pin && String(msg.pin) !== String(myPin)) {
      return;
    }
    if (msg.timestamp) {
      this.lastProcessedTimestamp = msg.timestamp;
    }
    this.emit(msg.type, msg);
  }

  // Generador de PIN único de 6 dígitos
  generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Crear sala como Anfitrión (Host)
  createRoom(challenge, gameMode = 'clasico', modeConfig = {}, rosterConfig = null) {
    const pin = this.generatePin();
    this.isHost = true;
    this.localPlayer = null; // El anfitrión es el profesor/presentador, no un jugador competidor

    const rosterMode = rosterConfig?.mode || 'open'; // 'open' | 'roster'
    const rosterList = (rosterConfig?.students || []).map((st, idx) => ({
      id: st.id || ('st_' + idx + '_' + Math.random().toString(36).substr(2, 6)),
      name: st.name || 'Estudiante',
      email: st.email || '',
      avatar: st.avatar || '🎓',
      joined: false
    }));

    this.currentRoom = {
      pin: pin,
      challenge: challenge,
      hostName: window.appState.currentUser?.name || 'Profesor',
      status: 'lobby',
      gameMode: gameMode || 'clasico',
      modeConfig: modeConfig || {},
      rosterMode: rosterMode,
      rosterGroupName: rosterConfig?.groupName || (rosterMode === 'roster' ? 'Lista Oficial de Estudiantes' : ''),
      roster: rosterList,
      players: [], // Solo contendrá los alumnos o bots que se unan (el profesor no se incluye)
      currentQuestionIndex: 0,
      questionStartTime: 0,
      questionTimeLimit: challenge.timePerQuestion || 20,
      responses: {}
    };

    // Registrar en storage para persistencia y reconexión
    localStorage.setItem(`te_reto_room_${pin}`, JSON.stringify(this.currentRoom));
    
    // Broadcast de sala disponible con el modo de juego real seleccionado
    this.broadcast({
      type: 'ROOM_CREATED',
      pin: pin,
      title: challenge.title,
      gameMode: gameMode,
      modeConfig: modeConfig,
      rosterMode: rosterMode,
      rosterCount: rosterList.length
    });

    // Suscribir a Supabase Realtime si está conectado
    if (window.supabaseService && window.supabaseService.isConnected) {
      window.supabaseService.subscribeToRoom(pin, (msg) => this.handleMessage(msg));
    }

    return this.currentRoom;
  }

  // Unirse a una sala como Jugador
  joinRoom(pin, nickname, avatar = '😎', email = '', rosterStudentId = null, initialRoomData = null) {
    this.isHost = false;
    this.localPlayer = {
      id: rosterStudentId || ('p_' + Math.random().toString(36).substr(2, 9)),
      rosterStudentId: rosterStudentId,
      nickname: nickname.trim(),
      email: (email || '').trim(),
      avatar: avatar,
      score: 0,
      streak: 0,
      maxStreak: 0,
      answersCount: 0,
      correctCount: 0,
      answers: [],
      connected: true
    };

    // Recuperar datos completos de la sala creada por el profesor (gameMode, challenge, etc.)
    let roomData = initialRoomData || null;
    if (!roomData) {
      try {
        const stored = localStorage.getItem(`te_reto_room_${pin}`) || localStorage.getItem(`mentix_room_${pin}`);
        if (stored) {
          roomData = JSON.parse(stored);
        }
      } catch (e) {
        console.warn('Error al leer sala de storage:', e);
      }
    }

    if (roomData) {
      const existingPlayers = Array.isArray(roomData.players) ? roomData.players : [];
      this.currentRoom = {
        ...roomData,
        pin: pin,
        status: roomData.status || 'lobby',
        gameMode: roomData.gameMode || 'clasico',
        challenge: roomData.challenge || null,
        modeConfig: roomData.modeConfig || {},
        rosterMode: roomData.rosterMode || 'open',
        rosterGroupName: roomData.rosterGroupName || '',
        players: [
          ...existingPlayers.filter(p => p.id !== this.localPlayer.id && p.nickname !== this.localPlayer.nickname),
          this.localPlayer
        ]
      };
    } else {
      this.currentRoom = {
        pin: pin,
        status: 'lobby',
        gameMode: 'clasico',
        challenge: null,
        modeConfig: {},
        rosterMode: 'open',
        players: [this.localPlayer]
      };
    }

    // Suscribir a Supabase Realtime si está conectado
    if (window.supabaseService && window.supabaseService.isConnected) {
      window.supabaseService.subscribeToRoom(pin, (msg) => this.handleMessage(msg));
    }

    // Notificar al host y a la sala
    this.broadcast({
      type: 'PLAYER_JOIN',
      pin: pin,
      player: this.localPlayer
    });

    return this.localPlayer;
  }

  // Agregar bots autónomos para simulación de sala
  addBotPlayers(count = 4) {
    if (!this.isHost || !this.currentRoom) return [];
    const botNames = [
      { name: 'Sofía 🚀', avatar: '👩‍🚀' },
      { name: 'Leo Gamer 🎮', avatar: '🕹️' },
      { name: 'Elena M. 🦄', avatar: '✨' },
      { name: 'Lucas Pro ⚡', avatar: '⚡' },
      { name: 'Camila 🌺', avatar: '🌸' },
      { name: 'David Byte 💻', avatar: '🤖' }
    ];

    const added = [];
    for (let i = 0; i < count; i++) {
      const botProfile = botNames[i % botNames.length];
      const botId = 'bot_' + Math.random().toString(36).substr(2, 7);
      
      // Evitar nombres repetidos
      const uniqueName = this.currentRoom.players.some(p => p.nickname === botProfile.name) 
        ? `${botProfile.name} ${i + 1}` 
        : botProfile.name;

      const bot = {
        id: botId,
        nickname: uniqueName,
        avatar: botProfile.avatar,
        score: 0,
        streak: 0,
        maxStreak: 0,
        answersCount: 0,
        correctCount: 0,
        answers: [],
        connected: true,
        isBot: true
      };

      this.currentRoom.players.push(bot);
      added.push(bot);
    }

    this.syncRoomState();
    return added;
  }

  // Sincronizar estado completo de la sala
  syncRoomState() {
    if (!this.isHost || !this.currentRoom) return;

    // Actualizar asistencias en el roster si existe
    if (this.currentRoom.roster && this.currentRoom.roster.length > 0) {
      this.currentRoom.roster.forEach(st => {
        const isPresent = this.currentRoom.players.some(p => 
          (p.rosterStudentId && p.rosterStudentId === st.id) ||
          (p.email && st.email && p.email.toLowerCase() === st.email.toLowerCase()) ||
          (p.nickname && st.name && p.nickname.toLowerCase() === st.name.toLowerCase())
        );
        st.joined = isPresent;
      });
    }

    localStorage.setItem(`te_reto_room_${this.currentRoom.pin}`, JSON.stringify(this.currentRoom));
    this.broadcast({
      type: 'HOST_ROOM_STATE',
      pin: this.currentRoom.pin,
      room: this.currentRoom
    });
  }

  // Simulación de respuestas de bots en cada pregunta
  simulateBotAnswers(question) {
    this.clearBotTimeouts();
    if (!this.isHost || !this.currentRoom) return;

    const bots = this.currentRoom.players.filter(p => p.isBot);
    bots.forEach(bot => {
      // Simular delay humano entre 1.5s y el 70% del tiempo de la pregunta
      const maxDelay = Math.min((question.timeLimit || 20) * 800, 10000);
      const delay = 1200 + Math.random() * (maxDelay - 1200);

      const timeout = setTimeout(() => {
        if (!this.currentRoom || this.currentRoom.status !== 'question') return;

        // Probabilidad de acierto entre 65% y 85%
        const isCorrect = Math.random() < 0.75;
        let answerIndex;
        if (question.type === 'poll') {
          answerIndex = Math.floor(Math.random() * (question.options?.length || 4));
        } else if (question.type === 'open') {
          const sampleThoughts = [
            'Es un concepto clave para la innovación y el trabajo en equipo',
            'Considero que la práctica constante es lo que marca la diferencia',
            'Totalmente de acuerdo con el enfoque presentado',
            'Me parece un gran punto para analizar a fondo',
            'Aporta una perspectiva muy enriquecedora para todos'
          ];
          answerIndex = sampleThoughts[Math.floor(Math.random() * sampleThoughts.length)];
        } else if (question.type === 'text') {
          answerIndex = isCorrect 
            ? (question.correctAnswer || (question.acceptedAnswers && question.acceptedAnswers[0]) || 'Respuesta') 
            : 'Respuesta aproximada';
        } else if (Array.isArray(question.correctAnswer)) {
          if (isCorrect) {
            answerIndex = question.correctAnswer[Math.floor(Math.random() * question.correctAnswer.length)];
          } else {
            const wrongOptions = (question.options || []).map((_, i) => i).filter(i => !question.correctAnswer.includes(i));
            answerIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] ?? 0;
          }
        } else {
          if (isCorrect) {
            answerIndex = question.correctAnswer;
          } else {
            const wrongOptions = (question.options || []).map((_, i) => i).filter(i => i !== question.correctAnswer);
            answerIndex = wrongOptions[Math.floor(Math.random() * wrongOptions.length)] || 0;
          }
        }

        const timeTaken = (delay / 1000);
        this.processAnswer(bot.id, answerIndex, timeTaken, question);
        this.emit('PLAYER_ANSWER', {
          pin: this.currentRoom.pin,
          playerId: bot.id,
          answerIndex: answerIndex,
          timeTaken: timeTaken,
          isBot: true
        });
      }, delay);

      this.botIntervals.push(timeout);
    });
  }

  clearBotTimeouts() {
    this.botIntervals.forEach(t => clearTimeout(t));
    this.botIntervals = [];
  }

  // Procesar respuesta y calcular puntaje con combos
  processAnswer(playerId, answerIndex, timeTaken, question) {
    const room = this.currentRoom || window.GameView?.room;
    if (!room) return null;
    const player = room.players?.find(p => p.id === playerId);
    if (!player) return null;

    // Evitar doble respuesta
    if (room.responses && room.responses[playerId] !== undefined) {
      return null;
    }

    let isCorrect = false;
    if (question.type === 'poll' || question.type === 'open') {
      isCorrect = true;
    } else if (question.type === 'text') {
      const norm = (s) => (s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
      const userText = norm(String(answerIndex));
      const accepted = (question.acceptedAnswers && question.acceptedAnswers.length > 0) 
        ? question.acceptedAnswers 
        : [question.correctAnswer];
      isCorrect = accepted.some(a => norm(String(a)) === userText);
    } else if (Array.isArray(question.correctAnswer)) {
      isCorrect = question.correctAnswer.includes(answerIndex);
    } else {
      isCorrect = answerIndex === question.correctAnswer;
    }
    const maxTime = question.timeLimit || 20;
    const basePoints = question.points || 1000;

    let pointsEarned = 0;
    let comboMultiplier = 1;

    if (isCorrect) {
      player.streak = (player.streak || 0) + 1;
      player.correctCount = (player.correctCount || 0) + 1;
      if (player.streak > (player.maxStreak || 0)) {
        player.maxStreak = player.streak;
      }

      // Sistema de combos especificado en requerimientos:
      // x2 (2-3 racha), x3 (4-5 racha), x5 (6-9 racha), x10 (10+ racha)
      if (player.streak >= 10) comboMultiplier = 10;
      else if (player.streak >= 6) comboMultiplier = 5;
      else if (player.streak >= 4) comboMultiplier = 3;
      else if (player.streak >= 2) comboMultiplier = 2;

      // Puntos proporcionales a la velocidad
      // Formula: base * (0.5 + 0.5 * (tiempo_restante / tiempo_total)) * combo
      const timeRemaining = Math.max(0, maxTime - timeTaken);
      const speedBonus = 0.5 + 0.5 * (timeRemaining / maxTime);
      pointsEarned = Math.round(basePoints * speedBonus * comboMultiplier);
      player.score = (player.score || 0) + pointsEarned;
    } else {
      player.streak = 0; // Se resetea el combo
    }

    player.answersCount = (player.answersCount || 0) + 1;
    if (!player.answers) player.answers = [];
    player.answers.push({
      questionId: question.id,
      answerIndex: answerIndex,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
      timeTaken: timeTaken,
      comboMultiplier: comboMultiplier
    });

    if (!room.responses) room.responses = {};
    room.responses[playerId] = {
      answerIndex,
      isCorrect,
      pointsEarned,
      timeTaken,
      comboMultiplier
    };

    if (this.isHost && this.currentRoom) {
      this.syncRoomState();
    }

    return {
      playerId,
      isCorrect,
      pointsEarned,
      newScore: player.score,
      streak: player.streak,
      comboMultiplier,
      timeTaken
    };
  }

  // Generador de código QR nativo SVG (sin librería externa)
  generateQRCodeSVG(text) {
    // Generador de patrón matricial estilizado decorativo QR para el código PIN
    const size = 180;
    const cells = 21;
    const cellSize = size / cells;
    let rects = '';

    // Algoritmo de hash determinístico para el patrón visual
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        // Esquinas marcadoras fijas QR (Top-Left, Top-Right, Bottom-Left)
        const isCorner = 
          (r < 7 && c < 7) || 
          (r < 7 && c >= cells - 7) || 
          (r >= cells - 7 && c < 7);
        
        let filled = false;
        if (isCorner) {
          // Patrón de diana estándar QR
          const localR = r < 7 ? r : r - (cells - 7);
          const localC = c < 7 ? c : c - (cells - 7);
          if (localR === 0 || localR === 6 || localC === 0 || localC === 6) filled = true;
          else if (localR >= 2 && localR <= 4 && localC >= 2 && localC <= 4) filled = true;
        } else {
          // Datos pseudoaleatorios basados en el hash y coordenadas
          const v = Math.sin(r * 12.9898 + c * 78.233 + hash) * 43758.5453;
          filled = (v - Math.floor(v)) > 0.5;
        }

        if (filled) {
          rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize + 0.5}" height="${cellSize + 0.5}" fill="#00f5d4"/>`;
        }
      }
    }

    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="border-radius:12px; background:#0b0f19; padding:8px; box-shadow:0 0 20px rgba(0,245,212,0.4);">${rects}</svg>`;
  }
}

window.realtimeEngine = new RealtimeEngine();
