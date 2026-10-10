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

    // PeerJS para comunicación WebRTC entre múltiples dispositivos
    this.peer = null;
    this.peerConnections = []; // Para el host: lista de conexiones con clientes
    // MQTT Cloud Backbone para conexión multidispositivo global
    this.mqttClient = null;
    this.activePin = null;

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

    // Fallback con eventos de storage para navegadores/pestañas locales
    window.addEventListener('storage', (event) => {
      if (event.key === 'te_reto_storage_bus' && event.newValue) {
        try {
          const data = JSON.parse(event.newValue);
          this.handleMessage(data);
        } catch (err) {}
      }
    });
  }

  // ==========================================
  // 🌐 MQTT CLOUD BACKBONE: MULTIDISPOSITIVO GLOBAL EN TIEMPO REAL
  // ==========================================
  initMqtt(pin, isHost = false) {
    if (!pin) return;
    const cleanPin = pin.toString().replace(/\D/g, '').trim();
    this.activePin = cleanPin;
    this.isHost = isHost;

    if (!window.mqtt) {
      console.warn('MQTT.js no disponible en window, usando WebRTC/Storage fallback');
      return;
    }

    if (!this.mqttQueue) {
      this.mqttQueue = [];
    }

    // Si ya existe cliente MQTT conectado o en proceso para este PIN y rol, no reiniciar la conexión
    if (this.mqttClient && this.activeMqttPin === cleanPin && this.activeMqttIsHost === isHost) {
      console.log(`🌐 MQTT ya está enlazado a la sala ${cleanPin} (${isHost ? 'Host' : 'Jugador'})`);
      if (this.mqttClient.connected) {
        if (!isHost && this.localPlayer) {
          this.publishMqtt(`mentix/rooms/${cleanPin}/player_events`, {
            type: 'PLAYER_JOIN',
            pin: cleanPin,
            player: this.localPlayer,
            timestamp: Date.now()
          });
        } else if (isHost && this.currentRoom) {
          this.publishMqtt(`mentix/rooms/${cleanPin}/host_state`, {
            type: 'HOST_ROOM_STATE',
            pin: cleanPin,
            room: this.currentRoom,
            timestamp: Date.now()
          });
        }
      }
      return;
    }

    if (this.mqttClient) {
      try { this.mqttClient.end(true); } catch (e) {}
      this.mqttClient = null;
    }

    this.activeMqttPin = cleanPin;
    this.activeMqttIsHost = isHost;

    try {
      const clientId = (isHost ? 'mentix_host_' : 'mentix_ply_') + cleanPin + '_' + Math.random().toString(36).substr(2, 6);
      const brokerUrl = 'wss://broker.emqx.io:8084/mqtt';
      const client = window.mqtt.connect(brokerUrl, {
        clientId: clientId,
        clean: true,
        connectTimeout: 5000,
        reconnectPeriod: 2000,
        keepalive: 30
      });

      this.mqttClient = client;

      client.on('connect', () => {
        console.log(`🌐 MQTT Cloud conectado exitosamente para sala ${cleanPin} (${isHost ? 'Host' : 'Jugador'})`);
        const topicFilter = `mentix/rooms/${cleanPin}/#`;
        client.subscribe(topicFilter, { qos: 0 }, (err) => {
          if (!err) {
            console.log(`📡 Suscripción MQTT activa a: ${topicFilter}`);

            // 1. Vaciar cola de mensajes enviados mientras se establecía la conexión
            if (this.mqttQueue && this.mqttQueue.length > 0) {
              const pending = [...this.mqttQueue];
              this.mqttQueue = [];
              pending.forEach(item => {
                if (Date.now() - item.time < 20000) {
                  this.publishMqtt(item.topic, item.payload);
                }
              });
            }

            // 2. Si es host, anunciar estado
            if (isHost && this.currentRoom) {
              this.publishMqtt(`mentix/rooms/${cleanPin}/host_state`, {
                type: 'HOST_ROOM_STATE',
                pin: cleanPin,
                room: this.currentRoom,
                timestamp: Date.now()
              });
            }

            // 3. Si es jugador y ya tiene perfil, anunciar PLAYER_JOIN de inmediato
            if (!isHost && this.localPlayer) {
              this.publishMqtt(`mentix/rooms/${cleanPin}/player_events`, {
                type: 'PLAYER_JOIN',
                pin: cleanPin,
                player: this.localPlayer,
                timestamp: Date.now()
              });
            }
          }
        });
      });

      client.on('message', (topic, messageBuffer) => {
        try {
          const msgStr = messageBuffer.toString();
          const data = JSON.parse(msgStr);
          const dataPin = String(data?.pin || data?.room?.pin || '').replace(/\D/g, '');
          if (data && (!dataPin || dataPin === cleanPin)) {
            // Si el host recibe solicitud de información de sala, responde de inmediato con su estado completo
            if (isHost && data.type === 'REQ_ROOM_INFO') {
              if (this.currentRoom) {
                this.publishMqtt(`mentix/rooms/${cleanPin}/host_state`, {
                  type: 'HOST_ROOM_STATE',
                  pin: cleanPin,
                  room: this.currentRoom,
                  timestamp: Date.now()
                });
              }
              return;
            }
            this.handleMessage(data);
          }
        } catch (e) {
          console.warn('Error procesando mensaje MQTT:', e);
        }
      });

      client.on('error', (err) => {
        console.warn('Aviso MQTT client:', err);
      });
    } catch (e) {
      console.warn('Error inicializando MQTT:', e);
    }
  }

  publishMqtt(topic, payload) {
    if (this.mqttClient && this.mqttClient.connected) {
      try {
        const payloadStr = typeof payload === 'string' ? payload : JSON.stringify(payload);
        this.mqttClient.publish(topic, payloadStr, { qos: 0 });
      } catch (e) {
        console.warn('Error publicando MQTT:', e);
      }
    } else {
      if (!this.mqttQueue) this.mqttQueue = [];
      this.mqttQueue.push({ topic, payload, time: Date.now() });
      if (this.mqttQueue.length > 50) this.mqttQueue.shift();
    }
  }

  // Descubrir y validar si existe una sala activa (Local o Cloud)
  async findRoom(pin) {
    if (!pin) return null;
    const clean = pin.toString().replace(/\D/g, '').trim();

    // 1. Probar en memoria activa local
    if (this.currentRoom && String(this.currentRoom.pin).replace(/\D/g, '') === clean && this.currentRoom.challenge) {
      return this.currentRoom;
    }

    // 2. Probar en almacenamiento local de este navegador
    try {
      const stored = localStorage.getItem(`te_reto_room_${clean}`) || localStorage.getItem(`mentix_room_${clean}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.challenge) {
          return parsed;
        }
      }
    } catch(e) {}

    // 3. Probar por MQTT Cloud preguntando al anfitrión en vivo
    return new Promise((resolve) => {
      let resolved = false;
      let tempClient = null;

      const finish = (result) => {
        if (resolved) return;
        resolved = true;
        if (tempClient) {
          try { tempClient.end(true); } catch(e) {}
        }
        resolve(result);
      };

      // Tiempo límite de respuesta: 3.5 segundos
      const timer = setTimeout(() => {
        finish(null);
      }, 3500);

      if (!window.mqtt) {
        clearTimeout(timer);
        return resolve(null);
      }

      try {
        const clientId = 'mentix_finder_' + clean + '_' + Math.random().toString(36).substr(2, 6);
        tempClient = window.mqtt.connect('wss://broker.emqx.io:8084/mqtt', {
          clientId,
          clean: true,
          connectTimeout: 3000
        });

        tempClient.on('connect', () => {
          const stateTopic = `mentix/rooms/${clean}/host_state`;
          tempClient.subscribe(stateTopic, () => {
            const reqTopic = `mentix/rooms/${clean}/player_events`;
            tempClient.publish(reqTopic, JSON.stringify({
              type: 'REQ_ROOM_INFO',
              pin: clean,
              timestamp: Date.now()
            }));
          });
        });

        tempClient.on('message', (topic, payload) => {
          try {
            const data = JSON.parse(payload.toString());
            if (data && (data.type === 'HOST_ROOM_STATE' || data.type === 'ROOM_CREATED') && data.room) {
              const resPin = String(data.pin || data.room.pin || '').replace(/\D/g, '');
              if (resPin === clean && data.room.challenge) {
                clearTimeout(timer);
                finish(data.room);
              }
            }
          } catch(e) {}
        });

        tempClient.on('error', () => {
          clearTimeout(timer);
          finish(null);
        });
      } catch(e) {
        clearTimeout(timer);
        finish(null);
      }
    });
  }

  // ==========================================
  // 🌐 WEBRTC P2P: CONECTIVIDAD MULTIDISPOSITIVO POR INTERNET
  // ==========================================
  initHostPeer(pin) {
    if (!window.Peer) return;
    try {
      if (this.peer) {
        try { this.peer.destroy(); } catch(e) {}
      }
      const hostPeerId = `mentix-room-${pin}`;
      this.peer = new window.Peer(hostPeerId, {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', (id) => {
        console.log('📡 Host P2P activo en la nube con ID:', id);
      });

      this.peer.on('connection', (conn) => {
        this.peerConnections.push(conn);
        console.log('📱 Nuevo jugador conectado por WebRTC:', conn.peer);

        const sendState = () => {
          if (this.currentRoom) {
            conn.send({
              type: 'HOST_ROOM_STATE',
              pin: this.currentRoom.pin,
              room: this.currentRoom,
              timestamp: Date.now()
            });
          }
        };

        if (conn.open) {
          sendState();
        } else {
          conn.on('open', sendState);
        }

        conn.on('data', (data) => {
          this.handleMessage(data);
        });

        conn.on('close', () => {
          this.peerConnections = this.peerConnections.filter(c => c !== conn);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host warning:', err.type || err);
      });
    } catch (e) {
      console.warn('Error inicializando Peer host:', e);
    }
  }

  initPlayerPeer(pin, onConnected) {
    if (!window.Peer) return;
    try {
      if (this.peer && this.hostConnection && this.hostConnection.open) {
        if (onConnected) onConnected(this.hostConnection);
        return;
      }
      if (this.peer) {
        try { this.peer.destroy(); } catch(e) {}
      }
      this.peer = new window.Peer({
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      });

      this.peer.on('open', () => {
        const hostPeerId = `mentix-room-${pin}`;
        console.log('🔗 Conectando jugador con el anfitrión:', hostPeerId);
        const conn = this.peer.connect(hostPeerId, { reliable: true });

        const onConnOpen = () => {
          console.log('✅ Conexión P2P establecida con la sala del anfitrión');
          this.hostConnection = conn;
          if (onConnected) onConnected(conn);

          if (this.localPlayer) {
            conn.send({
              type: 'PLAYER_JOIN',
              pin: pin,
              player: this.localPlayer,
              timestamp: Date.now()
            });
          }
        };

        if (conn.open) {
          onConnOpen();
        } else {
          conn.on('open', onConnOpen);
        }

        conn.on('data', (data) => {
          this.handleMessage(data);
        });

        conn.on('close', () => {
          console.warn('Conexión con el host cerrada');
          this.hostConnection = null;
        });

        conn.on('error', (e) => {
          console.warn('Error en conexión con host:', e);
        });
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Player warning:', err.type || err);
      });
    } catch (e) {
      console.warn('Error inicializando Peer player:', e);
    }
  }

  broadcast(message) {
    message.timestamp = Date.now();
    message._msgId = message._msgId || (message.type + '_' + (message.player?.id || message.playerId || '') + '_' + message.timestamp + '_' + Math.random().toString(36).substr(2, 5));

    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (e) {}
    }
    // Storage fallback
    try {
      localStorage.setItem('te_reto_storage_bus', JSON.stringify(message));
    } catch (e) {}

    // Publicación por MQTT Cloud en tiempo real
    const pin = String(message.pin || this.currentRoom?.pin || this.activePin || '').replace(/\D/g, '');
    if (pin) {
      const topic = this.isHost ? `mentix/rooms/${pin}/host_events` : `mentix/rooms/${pin}/player_events`;
      this.publishMqtt(topic, message);
    }

    // Enviar a todos los clientes WebRTC si somos el host
    if (this.isHost && this.peerConnections && this.peerConnections.length > 0) {
      this.peerConnections.forEach(conn => {
        if (conn && conn.open) {
          try { conn.send(message); } catch (e) {}
        }
      });
    }

    // Enviar al host si somos jugador remoto
    if (!this.isHost && this.hostConnection && this.hostConnection.open) {
      try { this.hostConnection.send(message); } catch (e) {}
    }

    // Supabase Realtime Cloud Broadcast si está conectado
    if (window.supabaseService && window.supabaseService.isConnected) {
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

    // Control de duplicados usando un set rotativo de identificadores únicos
    if (!this.processedMessageIds) {
      this.processedMessageIds = new Set();
    }
    const msgId = msg._msgId || (msg.type + '_' + (msg.player?.id || msg.playerId || '') + '_' + msg.timestamp);
    if (msgId && this.processedMessageIds.has(msgId)) {
      return;
    }
    if (msgId) {
      this.processedMessageIds.add(msgId);
      if (this.processedMessageIds.size > 150) {
        const first = this.processedMessageIds.values().next().value;
        this.processedMessageIds.delete(first);
      }
    }

    // Si el mensaje es de una sala diferente y ambos tienen PIN, ignorar
    const myPin = String(this.currentRoom?.pin || this.activePin || '').replace(/\D/g, '');
    const msgPin = String(msg.pin || msg.room?.pin || '').replace(/\D/g, '');
    if (myPin && msgPin && myPin !== msgPin) {
      return;
    }

    this.emit(msg.type, msg);
  }

  // Generador de PIN único de 6 dígitos
  generatePin() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Crear sala como Anfitrión (Host)
  createRoom(challenge, gameMode = 'clasico', modeConfig = {}, rosterConfig = null, roomType = 'presented') {
    const pin = this.generatePin();
    this.isHost = true;
    this.localPlayer = null; // El anfitrión es el profesor/presentador, no un jugador competidor

    const safeChallenge = challenge || { title: 'Reto MENTIX', questions: [], timePerQuestion: 20 };
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
      challenge: safeChallenge,
      hostName: window.appState?.currentUser?.name || 'Profesor',
      status: 'lobby',
      gameMode: gameMode || 'clasico',
      roomType: roomType || 'presented', // 'presented' | 'normal'
      modeConfig: modeConfig || {},
      rosterMode: rosterMode,
      rosterGroupName: rosterConfig?.groupName || (rosterMode === 'roster' ? 'Lista Oficial de Estudiantes' : ''),
      roster: rosterList,
      players: [], // Solo contendrá los alumnos o bots que se unan (el profesor no se incluye)
      currentQuestionIndex: 0,
      questionStartTime: 0,
      questionTimeLimit: safeChallenge.timePerQuestion || 20,
      responses: {}
    };

    // Registrar en storage para persistencia y reconexión local
    try {
      localStorage.setItem(`te_reto_room_${pin}`, JSON.stringify(this.currentRoom));
      localStorage.setItem(`mentix_room_${pin}`, JSON.stringify(this.currentRoom));
    } catch(e) {}
    
    // Broadcast de sala disponible con el modo de juego real seleccionado
    try {
      this.broadcast({
        type: 'ROOM_CREATED',
        pin: pin,
        title: safeChallenge.title,
        gameMode: gameMode,
        roomType: roomType || 'presented',
        modeConfig: modeConfig,
        rosterMode: rosterMode,
        rosterCount: rosterList.length
      });
    } catch(e) {}

    // Conectar MQTT Cloud y WebRTC P2P en la nube para conexión inmediata entre dispositivos
    try {
      this.initMqtt(pin, true);
      this.initHostPeer(pin);
    } catch(e) {}

    return this.currentRoom;
  }

  // Unirse a una sala como Jugador
  joinRoom(pin, nickname, avatar = '😎', email = '', rosterStudentId = null, initialRoomData = null) {
    const cleanPin = pin.toString().replace(/\D/g, '').trim();
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
        const stored = localStorage.getItem(`te_reto_room_${cleanPin}`) || localStorage.getItem(`mentix_room_${cleanPin}`);
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
        pin: cleanPin,
        status: roomData.status || 'lobby',
        gameMode: roomData.gameMode || 'clasico',
        challenge: roomData.challenge || null,
        modeConfig: roomData.modeConfig || {},
        rosterMode: roomData.rosterMode || 'open',
        rosterGroupName: roomData.rosterGroupName || '',
        players: [
          ...existingPlayers.filter(p => p.id !== this.localPlayer.id && p.nickname.toLowerCase() !== this.localPlayer.nickname.toLowerCase()),
          this.localPlayer
        ]
      };
    } else {
      this.currentRoom = {
        pin: cleanPin,
        status: 'lobby',
        gameMode: 'clasico',
        challenge: null,
        modeConfig: {},
        rosterMode: 'open',
        players: [this.localPlayer]
      };
    }

    // Conectar MQTT Cloud y WebRTC P2P del jugador a la sala del host
    try {
      this.initMqtt(cleanPin, false);
      this.initPlayerPeer(cleanPin);
    } catch(e) {}

    // Notificar al host y a la sala (se enviará inmediatamente o mediante la cola MQTT si está conectando)
    this.broadcast({
      type: 'PLAYER_JOIN',
      pin: cleanPin,
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
      questionIndex: (window.GameView && typeof window.GameView.currentQuestionIndex === 'number') ? window.GameView.currentQuestionIndex : room.currentQuestionIndex,
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

  // Generador de código QR auténtico, 100% escaneable desde celulares (cámara iOS / Android)
  generateQRCodeHTML(url, size = 180) {
    const boxId = 'qr-box-' + Math.random().toString(36).substr(2, 9);
    const encoded = encodeURIComponent(url);
    // API de respaldo inmediata con código QR estándar y zona segura blanca
    const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&margin=2&color=0b0f19&bgcolor=ffffff`;

    // Renderizado local instantáneo vía QRCode.js si está cargado
    setTimeout(() => {
      const container = document.getElementById(boxId);
      if (!container) return;
      if (typeof window.QRCode === 'function') {
        try {
          container.innerHTML = '';
          new window.QRCode(container, {
            text: url,
            width: size - 12,
            height: size - 12,
            colorDark: '#0b0f19',
            colorLight: '#ffffff',
            correctLevel: window.QRCode.CorrectLevel.M
          });
          const el = container.querySelector('canvas, img');
          if (el) {
            el.style.display = 'block';
            el.style.margin = '0 auto';
            el.style.borderRadius = '6px';
            el.style.maxWidth = '100%';
            el.style.height = 'auto';
          }
        } catch (e) {
          console.warn('Fallback a imagen QR de servidor:', e);
        }
      }
    }, 40);

    return `
      <div id="${boxId}" style="width: ${size}px; height: ${size}px; background: #ffffff; padding: 6px; border-radius: 14px; box-shadow: 0 4px 18px rgba(0,0,0,0.12), 0 0 10px rgba(0, 245, 212, 0.25); display: flex; align-items: center; justify-content: center; overflow: hidden; margin: 0 auto; border: 2px solid rgba(0, 245, 212, 0.4);">
        <img src="${qrImgUrl}" alt="Código QR de la sala" width="${size}" height="${size}" style="display: block; width: 100%; height: 100%; object-fit: contain; border-radius: 8px;" />
      </div>
    `;
  }

  generateQRCodeSVG(text) {
    return this.generateQRCodeHTML(text);
  }
}

window.realtimeEngine = new RealtimeEngine();
