/**
 * 🎮 MENTIX / TE RETO - AVATAR ENGINE & AVATAR STUDIO
 * Motor procedural de renderizado de personajes 2.5D/3D con físicas de rotación,
 * catálogo de vestuario, estilos predefinidos, animaciones, gestos y progresión XP.
 */

window.AvatarEngine = {
  // Configuración predeterminada de avatar
  defaultConfig: {
    alias: 'Gamer Pro',
    title: 'Novato Curioso',
    gender: 'masc', // 'masc' | 'fem' | 'andro'
    skinColor: '#ffd1a4',
    faceStyle: 'confident', // 'smile', 'confident', 'focused', 'wink', 'cyber'
    hairStyle: 'spiky', // 'spiky', 'curly', 'short', 'fade', 'afro', 'long', 'cyber_fade', 'anime'
    hairColor: '#00f5d4',
    eyesStyle: 'tech', // 'normal', 'tech', 'anime', 'shades', 'cyber_visor'
    topType: 'hoodie', // 'hoodie', 'tshirt', 'jacket', 'labcoat', 'cyber_suit', 'jersey'
    topColor: '#7928ca',
    bottomType: 'cargo', // 'cargo', 'jeans', 'joggers', 'cyber_pants', 'shorts'
    bottomColor: '#1a1f36',
    shoesType: 'sneakers', // 'sneakers', 'boots', 'hightops', 'cyber_boots'
    shoesColor: '#00f5d4',
    accessory: 'headphones', // 'none', 'headphones', 'cap', 'glasses', 'backpack', 'mask', 'cyber_ear'
    accessoryColor: '#ff007f',
    stageBg: 'matrix_neon', // 'matrix_neon', 'cyber_arcade', 'space_station', 'gamer_arena', 'chill_lab'
    emote: 'idle', // 'idle', 'wave', 'celebrate', 'dance', 'laugh', 'victory', 'focus', 'clap'
    preset: 'gamer',
    xp: 60,
    level: 1,
    unlockedItems: ['headphones', 'glasses', 'hoodie', 'matrix_neon', 'wave', 'victory']
  },

  // Presets temáticos listos para usar
  presets: {
    gamer: {
      name: 'Gamer Pro',
      icon: '🎮',
      desc: 'Listo para rankear al 100% de reflejos.',
      config: {
        alias: 'Gamer Pro',
        title: 'Gamer Pro',
        gender: 'masc',
        skinColor: '#ffd1a4',
        faceStyle: 'confident',
        hairStyle: 'spiky',
        hairColor: '#00f5d4',
        eyesStyle: 'tech',
        topType: 'hoodie',
        topColor: '#7928ca',
        bottomType: 'joggers',
        bottomColor: '#121626',
        shoesType: 'sneakers',
        shoesColor: '#00f5d4',
        accessory: 'headphones',
        accessoryColor: '#00f5d4',
        stageBg: 'gamer_arena',
        emote: 'idle'
      }
    },
    cyberpunk: {
      name: 'Cyberpunk Neon',
      icon: '⚡',
      desc: 'Estilo futurista con implantes ópticos y luces neón.',
      config: {
        alias: 'Cyber Runner',
        title: 'Cerebro Neón',
        gender: 'andro',
        skinColor: '#fcd5b5',
        faceStyle: 'cyber',
        hairStyle: 'cyber_fade',
        hairColor: '#ff007f',
        eyesStyle: 'cyber_visor',
        topType: 'cyber_suit',
        topColor: '#111827',
        bottomType: 'cyber_pants',
        bottomColor: '#0b0f19',
        shoesType: 'cyber_boots',
        shoesColor: '#ff007f',
        accessory: 'mask',
        accessoryColor: '#00f5d4',
        stageBg: 'matrix_neon',
        emote: 'victory'
      }
    },
    scientist: {
      name: 'Científico / Genio',
      icon: '🧪',
      desc: 'Bata de laboratorio, gafas inteligentes y precisión absoluta.',
      config: {
        alias: 'Dr. Einstein',
        title: 'Maestro del Saber',
        gender: 'fem',
        skinColor: '#e0ac69',
        faceStyle: 'focused',
        hairStyle: 'curly',
        hairColor: '#4f46e5',
        eyesStyle: 'normal',
        topType: 'labcoat',
        topColor: '#ffffff',
        bottomType: 'jeans',
        bottomColor: '#1e293b',
        shoesType: 'sneakers',
        shoesColor: '#3b82f6',
        accessory: 'glasses',
        accessoryColor: '#6366f1',
        stageBg: 'chill_lab',
        emote: 'focus'
      }
    },
    explorer: {
      name: 'Explorador',
      icon: '🧭',
      desc: 'Aventurero preparado para descifrar cualquier enigma.',
      config: {
        alias: 'Vanguardista',
        title: 'Pionero Espacial',
        gender: 'masc',
        skinColor: '#c68642',
        faceStyle: 'smile',
        hairStyle: 'short',
        hairColor: '#d97706',
        eyesStyle: 'normal',
        topType: 'jacket',
        topColor: '#b45309',
        bottomType: 'cargo',
        bottomColor: '#451a03',
        shoesType: 'boots',
        shoesColor: '#78350f',
        accessory: 'backpack',
        accessoryColor: '#f59e0b',
        stageBg: 'space_station',
        emote: 'wave'
      }
    },
    hacker: {
      name: 'Hacker Ético',
      icon: '💻',
      desc: 'Experto en seguridad y matrices de datos digitales.',
      config: {
        alias: 'ZeroDay',
        title: 'Arquitecto Digital',
        gender: 'andro',
        skinColor: '#f5d0b5',
        faceStyle: 'confident',
        hairStyle: 'fade',
        hairColor: '#10b981',
        eyesStyle: 'tech',
        topType: 'hoodie',
        topColor: '#064e3b',
        bottomType: 'cargo',
        bottomColor: '#022c22',
        shoesType: 'sneakers',
        shoesColor: '#10b981',
        accessory: 'headphones',
        accessoryColor: '#34d399',
        stageBg: 'matrix_neon',
        emote: 'celebrate'
      }
    },
    ai: {
      name: 'Inteligencia Artificial',
      icon: '🤖',
      desc: 'Entidad cuántica con visión ultravioleta y nanotecnología.',
      config: {
        alias: 'Nexus AI',
        title: 'IA Consciente',
        gender: 'andro',
        skinColor: '#dbeafe',
        faceStyle: 'cyber',
        hairStyle: 'anime',
        hairColor: '#38bdf8',
        eyesStyle: 'cyber_visor',
        topType: 'cyber_suit',
        topColor: '#0f172a',
        bottomType: 'cyber_pants',
        bottomColor: '#0284c7',
        shoesType: 'cyber_boots',
        shoesColor: '#38bdf8',
        accessory: 'cyber_ear',
        accessoryColor: '#0ea5e9',
        stageBg: 'cyber_arcade',
        emote: 'dance'
      }
    },
    athletic: {
      name: 'Deportivo / Atleta',
      icon: '⚡',
      desc: 'Velocidad mental y energía competitiva al máximo.',
      config: {
        alias: 'Apex Runner',
        title: 'Velocidad Rayo',
        gender: 'fem',
        skinColor: '#8d5524',
        faceStyle: 'smile',
        hairStyle: 'long',
        hairColor: '#e11d48',
        eyesStyle: 'normal',
        topType: 'jersey',
        topColor: '#f43f5e',
        bottomType: 'joggers',
        bottomColor: '#881337',
        shoesType: 'hightops',
        shoesColor: '#fb7185',
        accessory: 'cap',
        accessoryColor: '#be123c',
        stageBg: 'gamer_arena',
        emote: 'celebrate'
      }
    },
    creative: {
      name: 'Académico Creativo',
      icon: '🎨',
      desc: 'Diseñador de ideas brillantes y soluciones ingeniosas.',
      config: {
        alias: 'DaVinci 2.0',
        title: 'Mente Creativa',
        gender: 'fem',
        skinColor: '#ffdbac',
        faceStyle: 'wink',
        hairStyle: 'curly',
        hairColor: '#8b5cf6',
        eyesStyle: 'anime',
        topType: 'jacket',
        topColor: '#6d28d9',
        bottomType: 'jeans',
        bottomColor: '#2e1065',
        shoesType: 'sneakers',
        shoesColor: '#c4b5fd',
        accessory: 'glasses',
        accessoryColor: '#a78bfa',
        stageBg: 'chill_lab',
        emote: 'victory'
      }
    }
  },

  // Fondos de escenario disponibles
  stageBackgrounds: {
    matrix_neon: {
      name: 'Matriz Neón',
      icon: '🌌',
      css: 'radial-gradient(circle at 50% 30%, rgba(0, 245, 212, 0.25) 0%, rgba(5, 10, 26, 0.95) 75%), linear-gradient(180deg, #050b1a 0%, #030712 100%)',
      gridColor: 'rgba(0, 245, 212, 0.15)'
    },
    cyber_arcade: {
      name: 'Arcade Retro',
      icon: '🕹️',
      css: 'radial-gradient(circle at 50% 30%, rgba(255, 0, 127, 0.25) 0%, rgba(20, 5, 30, 0.95) 75%), linear-gradient(180deg, #180324 0%, #08010d 100%)',
      gridColor: 'rgba(255, 0, 127, 0.15)'
    },
    space_station: {
      name: 'Estación Espacial',
      icon: '🛸',
      css: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.3) 0%, rgba(7, 18, 48, 0.95) 75%), linear-gradient(180deg, #091a3c 0%, #020617 100%)',
      gridColor: 'rgba(56, 189, 248, 0.15)'
    },
    gamer_arena: {
      name: 'Arena eSports',
      icon: '🏆',
      css: 'radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.3) 0%, rgba(30, 15, 5, 0.95) 80%), linear-gradient(180deg, #1c0e04 0%, #0a0401 100%)',
      gridColor: 'rgba(245, 158, 11, 0.15)'
    },
    chill_lab: {
      name: 'Laboratorio Zen',
      icon: '🧪',
      css: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.3) 0%, rgba(15, 10, 35, 0.95) 80%), linear-gradient(180deg, #1e1338 0%, #070312 100%)',
      gridColor: 'rgba(139, 92, 246, 0.15)'
    }
  },

  // Biblioteca de gestos y animaciones
  emotes: {
    idle: { name: 'Respiración / Espera', icon: '🧘', desc: 'Postura base gamer con respiración relajada' },
    wave: { name: 'Saludar', icon: '👋', desc: 'Saludo amistoso a los compañeros' },
    celebrate: { name: 'Celebrar', icon: '🎉', desc: 'Salto de euforia con puños arriba' },
    dance: { name: 'Bailar', icon: '💃', desc: 'Paso de baile rítmico gamer' },
    laugh: { name: 'Reír', icon: '😂', desc: 'Carcajada confiada y alegre' },
    victory: { name: 'Pose Victoria', icon: '✌️', desc: 'Signo de V brillante con pose pro' },
    focus: { name: 'Concentración', icon: '🧠', desc: 'Modo ultra instinto antes de la prueba' },
    clap: { name: 'Aplaudir', icon: '👏', desc: 'Aplausos de ánimo y respeto' }
  },

  // Títulos desbloqueables por XP
  titles: [
    { name: 'Novato Curioso', xpReq: 0, icon: '🌱' },
    { name: 'Gamer Pro', xpReq: 50, icon: '🎮' },
    { name: 'Cerebro Neón', xpReq: 100, icon: '⚡' },
    { name: 'Velocidad Rayo', xpReq: 160, icon: '⚡' },
    { name: 'Maestro del Saber', xpReq: 230, icon: '🎓' },
    { name: 'Hacker del Saber', xpReq: 320, icon: '💻' },
    { name: 'Leyenda de la Sala', xpReq: 450, icon: '👑' }
  ],

  // Cargar avatar guardado del jugador o inicializar por defecto
  getSavedAvatar() {
    try {
      const raw = localStorage.getItem('mentix_player_avatar');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...this.defaultConfig, ...parsed };
      }
    } catch (e) {
      console.warn('Error recuperando avatar guardado:', e);
    }
    return { ...this.defaultConfig };
  },

  saveAvatar(config) {
    try {
      const merged = { ...this.getSavedAvatar(), ...config };
      localStorage.setItem('mentix_player_avatar', JSON.stringify(merged));
      // Actualizar localPlayer en realtimeEngine si existe
      if (window.realtimeEngine && window.realtimeEngine.localPlayer) {
        window.realtimeEngine.localPlayer.avatarConfig = merged;
        window.realtimeEngine.localPlayer.avatar = this.getAvatarEmojiPreview(merged);
        window.realtimeEngine.localPlayer.nickname = merged.alias || window.realtimeEngine.localPlayer.nickname;
      }
      return merged;
    } catch (e) {
      console.warn('Error guardando avatar:', e);
      return config;
    }
  },

  // Genera un emoji representativo rápido para compatibilidad
  getAvatarEmojiPreview(cfg) {
    if (cfg?.eyesStyle === 'cyber_visor' || cfg?.faceStyle === 'cyber') return '⚡';
    if (cfg?.topType === 'labcoat') return '🧪';
    if (cfg?.accessory === 'headphones') return '🎧';
    if (cfg?.topType === 'hoodie') return '😎';
    if (cfg?.accessory === 'glasses') return '🤓';
    return '🚀';
  },

  // Otorgar XP al jugador y comprobar si sube de nivel
  awardXP(amount, reason = '') {
    const cur = this.getSavedAvatar();
    const prevXP = cur.xp || 0;
    const newXP = prevXP + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > (cur.level || 1);

    // Calcular título correspondiente
    let newTitle = cur.title || 'Novato Curioso';
    for (const t of this.titles) {
      if (newXP >= t.xpReq) newTitle = t.name;
    }

    const updated = this.saveAvatar({
      xp: newXP,
      level: newLevel,
      title: newTitle
    });

    if (window.soundEngine && amount > 0) {
      if (leveledUp) {
        window.soundEngine.playFanfare();
      } else {
        window.soundEngine.playTick();
      }
    }

    // Disparar evento para actualizar UI
    window.dispatchEvent(new CustomEvent('mentix_avatar_xp_updated', {
      detail: { xp: newXP, level: newLevel, title: newTitle, added: amount, reason, leveledUp }
    }));

    return updated;
  },

  // ============================================================
  // 🎨 MOTOR PROCEDURAL DE RENDERIZADO VECTORIAL 2.5D CON 3D TILT
  // ============================================================
  renderSVG(cfg, options = {}) {
    const c = { ...this.defaultConfig, ...(cfg || {}) };
    const size = options.size || 280;
    const emote = options.emote || c.emote || 'idle';
    const rotating = options.rotating ? 'avatar-rotating' : '';
    const uniqueId = 'av_' + Math.random().toString(36).substr(2, 6);

    // Colores base con fallback
    const skin = c.skinColor || '#ffd1a4';
    const hair = c.hairColor || '#00f5d4';
    const top = c.topColor || '#7928ca';
    const bottom = c.bottomColor || '#1a1f36';
    const shoes = c.shoesColor || '#00f5d4';
    const acc = c.accessoryColor || '#ff007f';

    // Clases CSS de animación según emote
    let emoteClass = 'anim-breathing';
    if (emote === 'wave') emoteClass = 'anim-wave';
    else if (emote === 'celebrate') emoteClass = 'anim-celebrate';
    else if (emote === 'dance') emoteClass = 'anim-dance';
    else if (emote === 'laugh') emoteClass = 'anim-laugh';
    else if (emote === 'victory') emoteClass = 'anim-victory';
    else if (emote === 'focus') emoteClass = 'anim-focus';
    else if (emote === 'clap') emoteClass = 'anim-clap';

    // Elementos de cabello según hairStyle
    let hairSvg = '';
    switch (c.hairStyle) {
      case 'curly':
        hairSvg = `
          <g fill="${hair}">
            <circle cx="85" cy="55" r="16" />
            <circle cx="100" cy="45" r="18" />
            <circle cx="118" cy="42" r="19" />
            <circle cx="136" cy="46" r="18" />
            <circle cx="152" cy="55" r="16" />
            <circle cx="78" cy="70" r="14" />
            <circle cx="158" cy="70" r="14" />
          </g>
        `;
        break;
      case 'fade':
      case 'short':
        hairSvg = `
          <path d="M78 68 Q118 36 158 68 C158 54 148 42 118 42 C88 42 78 54 78 68 Z" fill="${hair}" />
          <path d="M78 68 Q75 88 80 94 Q83 82 85 75 Z" fill="${hair}" opacity="0.6"/>
          <path d="M158 68 Q161 88 156 94 Q153 82 151 75 Z" fill="${hair}" opacity="0.6"/>
        `;
        break;
      case 'afro':
        hairSvg = `
          <ellipse cx="118" cy="58" rx="46" ry="40" fill="${hair}" />
          <circle cx="82" cy="72" r="18" fill="${hair}" />
          <circle cx="154" cy="72" r="18" fill="${hair}" />
        `;
        break;
      case 'long':
        hairSvg = `
          <path d="M74 65 Q118 32 162 65 C168 85 170 125 166 148 Q158 150 152 135 C154 110 152 85 148 76 Q118 60 88 76 C84 85 82 110 84 135 Q78 150 70 148 C66 125 68 85 74 65 Z" fill="${hair}" />
        `;
        break;
      case 'cyber_fade':
      case 'anime':
        hairSvg = `
          <!-- Mechones anime afilados con degradado neón -->
          <polygon points="118,22 132,48 118,44" fill="${hair}" />
          <polygon points="100,28 116,48 102,46" fill="${hair}" />
          <polygon points="138,30 144,52 132,48" fill="${hair}" />
          <polygon points="82,40 102,54 88,52" fill="${hair}" />
          <polygon points="154,42 144,55 158,54" fill="${hair}" />
          <path d="M78 66 Q118 38 158 66 C152 50 140 40 118 40 C96 40 84 50 78 66 Z" fill="${hair}" />
        `;
        break;
      case 'spiky':
      default:
        hairSvg = `
          <polygon points="118,26 128,48 114,46" fill="${hair}" />
          <polygon points="98,32 112,50 100,48" fill="${hair}" />
          <polygon points="138,34 142,54 130,50" fill="${hair}" />
          <polygon points="80,44 98,56 86,54" fill="${hair}" />
          <polygon points="156,44 144,58 158,56" fill="${hair}" />
          <path d="M78 66 Q118 40 158 66 C152 52 142 42 118 42 C94 42 84 52 78 66 Z" fill="${hair}" />
        `;
    }

    // Estilos de ojos y cejas
    let eyesSvg = '';
    switch (c.eyesStyle) {
      case 'cyber_visor':
        eyesSvg = `
          <!-- Visor holográfico neón estilo Cyberpunk -->
          <rect x="90" y="77" width="56" height="15" rx="6" fill="#030712" stroke="${acc}" stroke-width="2.5" />
          <line x1="93" y1="84.5" x2="143" y2="84.5" stroke="${acc}" stroke-width="2" stroke-dasharray="3,2" />
          <circle cx="138" cy="84.5" r="3" fill="${acc}" />
        `;
        break;
      case 'shades':
        eyesSvg = `
          <!-- Gafas de sol oscuras pro gamer -->
          <path d="M92 78 L113 78 L111 91 L95 91 Z" fill="#111827" stroke="#374151" stroke-width="1.5"/>
          <path d="M123 78 L144 78 L141 91 L125 91 Z" fill="#111827" stroke="#374151" stroke-width="1.5"/>
          <line x1="113" y1="82" x2="123" y2="82" stroke="#374151" stroke-width="2"/>
          <line x1="94" y1="80" x2="108" y2="88" stroke="rgba(255,255,255,0.4)" stroke-width="1.2"/>
        `;
        break;
      case 'anime':
        eyesSvg = `
          <!-- Ojos anime estilizados grandes con brillo -->
          <ellipse cx="103" cy="84" rx="7" ry="9" fill="#111827" />
          <ellipse cx="133" cy="84" rx="7" ry="9" fill="#111827" />
          <circle cx="101" cy="81" r="3" fill="#ffffff" />
          <circle cx="131" cy="81" r="3" fill="#ffffff" />
          <circle cx="105" cy="88" r="1.5" fill="#00f5d4" />
          <circle cx="135" cy="88" r="1.5" fill="#00f5d4" />
          <!-- Cejas expresivas -->
          <path d="M96 73 Q104 69 111 73" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <path d="M125 73 Q132 69 140 73" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        `;
        break;
      case 'tech':
      case 'normal':
      default:
        eyesSvg = `
          <!-- Ojos estilizados con brillo -->
          <ellipse cx="104" cy="84" rx="5" ry="6.5" fill="#111827" />
          <ellipse cx="132" cy="84" rx="5" ry="6.5" fill="#111827" />
          <circle cx="102.5" cy="82" r="2.2" fill="#ffffff" />
          <circle cx="130.5" cy="82" r="2.2" fill="#ffffff" />
          <!-- Cejas -->
          <path d="M97 74 Q105 71 112 74" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <path d="M124 74 Q131 71 139 74" stroke="#222" stroke-width="2.2" fill="none" stroke-linecap="round"/>
        `;
    }

    // Expresión de boca
    let mouthSvg = '';
    switch (c.faceStyle) {
      case 'wink':
        mouthSvg = `
          <path d="M111 100 Q118 107 125 100" stroke="#b91c1c" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        `;
        break;
      case 'focused':
        mouthSvg = `
          <line x1="113" y1="100" x2="123" y2="100" stroke="#7f1d1d" stroke-width="2.5" stroke-linecap="round"/>
        `;
        break;
      case 'cyber':
        mouthSvg = `
          <path d="M112 100 L124 100" stroke="${acc}" stroke-width="2" stroke-linecap="round"/>
          <circle cx="118" cy="100" r="1.8" fill="${acc}" />
        `;
        break;
      case 'confident':
      case 'smile':
      default:
        mouthSvg = `
          <path d="M111 98 Q118 108 126 98 Q118 103 111 98 Z" fill="#991b1b" stroke="#7f1d1d" stroke-width="1"/>
          <path d="M114 99 Q118 102 123 99" stroke="#ffffff" stroke-width="1.8" fill="none"/>
        `;
    }

    // Vestuario superior (Top)
    let topSvg = '';
    switch (c.topType) {
      case 'jacket':
        topSvg = `
          <!-- Chaqueta bomber abierta sobre camiseta neutra -->
          <path d="M96 122 L140 122 L143 175 L93 175 Z" fill="#0f172a" />
          <path d="M88 120 L110 124 L107 175 L84 175 Z" fill="${top}" />
          <path d="M148 120 L126 124 L129 175 L152 175 Z" fill="${top}" />
          <!-- Cuello y solapas -->
          <polygon points="90,120 110,140 108,124" fill="rgba(0,0,0,0.25)" />
          <polygon points="146,120 126,140 128,124" fill="rgba(0,0,0,0.25)" />
        `;
        break;
      case 'labcoat':
        topSvg = `
          <!-- Bata de laboratorio científica blanca/clara -->
          <path d="M96 122 L140 122 L144 185 L92 185 Z" fill="#0284c7" />
          <path d="M85 118 L112 125 L108 185 L79 185 Z" fill="${top}" stroke="#cbd5e1" stroke-width="1"/>
          <path d="M151 118 L124 125 L128 185 L157 185 Z" fill="${top}" stroke="#cbd5e1" stroke-width="1"/>
          <!-- Bolsillo con bolígrafo -->
          <rect x="94" y="146" width="12" height="15" rx="2" fill="rgba(0,0,0,0.08)" />
          <line x1="97" y1="142" x2="97" y2="150" stroke="#ef4444" stroke-width="2" />
        `;
        break;
      case 'cyber_suit':
        topSvg = `
          <!-- Armadura tecnológica con circuitos de luz neón -->
          <path d="M88 120 L148 120 L145 175 L91 175 Z" fill="${top}" />
          <polygon points="118,128 128,144 118,160 108,144" fill="#030712" stroke="${acc}" stroke-width="2"/>
          <circle cx="118" cy="144" r="4" fill="${acc}" />
          <line x1="92" y1="135" x2="108" y2="144" stroke="${acc}" stroke-width="1.8" />
          <line x1="144" y1="135" x2="128" y2="144" stroke="${acc}" stroke-width="1.8" />
        `;
        break;
      case 'jersey':
      case 'tshirt':
        topSvg = `
          <!-- Camiseta gamer clásica con logo frontal -->
          <path d="M89 120 L147 120 L144 175 L92 175 Z" fill="${top}" />
          <path d="M106 120 Q118 126 130 120" stroke="rgba(0,0,0,0.3)" stroke-width="2" fill="none" />
          <!-- Estampado / Rayo gamer -->
          <polygon points="119,135 125,145 117,146 121,157 113,149 118,148" fill="#ffd166" />
        `;
        break;
      case 'hoodie':
      default:
        topSvg = `
          <!-- Sudadera hoodie gamer con capucha y cordones -->
          <path d="M86 118 L150 118 L146 175 L90 175 Z" fill="${top}" />
          <!-- Capucha drapeada -->
          <path d="M96 118 Q118 132 140 118 Q118 124 96 118 Z" fill="rgba(0,0,0,0.25)" />
          <!-- Bolsillo canguro -->
          <path d="M99 152 L137 152 L134 172 L102 172 Z" fill="rgba(0,0,0,0.18)" rx="4"/>
          <!-- Cordones neón -->
          <line x1="112" y1="126" x2="112" y2="142" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
          <line x1="124" y1="126" x2="124" y2="142" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
        `;
    }

    // Pantalones (Bottom)
    let bottomSvg = `
      <!-- Pantalón / Cargo con costuras -->
      <path d="M91 175 L145 175 L141 228 L122 228 L118 190 L114 228 L95 228 Z" fill="${bottom}" />
      <line x1="118" y1="175" x2="118" y2="190" stroke="rgba(0,0,0,0.4)" stroke-width="2" />
    `;
    if (c.bottomType === 'cargo' || c.bottomType === 'cyber_pants') {
      bottomSvg += `
        <!-- Bolsillos laterales cargo -->
        <rect x="91" y="190" width="7" height="16" rx="2" fill="rgba(0,0,0,0.25)" />
        <rect x="138" y="190" width="7" height="16" rx="2" fill="rgba(0,0,0,0.25)" />
      `;
    }

    // Calzado (Shoes)
    let shoesSvg = `
      <!-- Zapatillas sneakers deportivas high-top -->
      <path d="M92 228 L104 228 L106 242 L84 242 Q86 235 92 228 Z" fill="${shoes}" />
      <path d="M132 228 L144 228 Q150 235 152 242 L130 242 L132 228 Z" fill="${shoes}" />
      <!-- Suelas blancas y cordones neón -->
      <rect x="83" y="240" width="24" height="4" rx="2" fill="#ffffff" />
      <rect x="129" y="240" width="24" height="4" rx="2" fill="#ffffff" />
    `;

    // Accesorios (Headphones, Cap, Glasses, Backpack, Mask, etc.)
    let accSvg = '';
    switch (c.accessory) {
      case 'headphones':
        accSvg = `
          <!-- Auriculares gamer RGB sobre la cabeza -->
          <path d="M78 80 C74 45 162 45 158 80" stroke="${acc}" stroke-width="5" fill="none" stroke-linecap="round"/>
          <rect x="70" y="73" width="12" height="22" rx="6" fill="#111827" stroke="${acc}" stroke-width="2" />
          <rect x="154" y="73" width="12" height="22" rx="6" fill="#111827" stroke="${acc}" stroke-width="2" />
          <circle cx="76" cy="84" r="3.5" fill="${acc}" />
          <circle cx="160" cy="84" r="3.5" fill="${acc}" />
        `;
        break;
      case 'cap':
        accSvg = `
          <!-- Gorra gamer hacia atrás o adelante -->
          <path d="M76 60 Q118 36 160 60 L168 62 Q140 50 118 50 Q96 50 68 62 Z" fill="${acc}" />
          <path d="M76 60 Q118 40 160 60 Z" fill="${acc}" />
          <!-- Visera -->
          <path d="M145 60 Q175 62 185 70 Q160 66 140 64 Z" fill="rgba(0,0,0,0.3)" />
        `;
        break;
      case 'glasses':
        accSvg = `
          <!-- Gafas cuadradas pro -->
          <rect x="91" y="76" width="22" height="16" rx="4" fill="none" stroke="${acc}" stroke-width="2.5" />
          <rect x="123" y="76" width="22" height="16" rx="4" fill="none" stroke="${acc}" stroke-width="2.5" />
          <line x1="113" y1="83" x2="123" y2="83" stroke="${acc}" stroke-width="2.5" />
        `;
        break;
      case 'mask':
        accSvg = `
          <!-- Mascarilla cyberpunk táctica -->
          <path d="M102 96 L134 96 L128 116 L108 116 Z" fill="#0f172a" stroke="${acc}" stroke-width="2" />
          <circle cx="118" cy="106" r="3" fill="${acc}" />
        `;
        break;
      case 'cyber_ear':
        accSvg = `
          <!-- Dispositivo holográfico en la oreja -->
          <polygon points="155,75 168,78 162,90 154,84" fill="${acc}" />
          <circle cx="160" cy="82" r="2.5" fill="#ffffff" />
        `;
        break;
      case 'backpack':
        accSvg = `
          <!-- Tirantes de mochila frontal -->
          <path d="M88 122 L94 175" stroke="${acc}" stroke-width="5" stroke-linecap="round"/>
          <path d="M148 122 L142 175" stroke="${acc}" stroke-width="5" stroke-linecap="round"/>
        `;
        break;
      case 'none':
      default:
        accSvg = '';
    }

    // Brazos según emote
    let armsSvg = `
      <!-- Brazos en reposo -->
      <path d="M86 122 L72 155 L75 178" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      <path d="M150 122 L164 155 L161 178" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
    `;

    if (emote === 'wave') {
      armsSvg = `
        <!-- Brazo izquierdo en reposo -->
        <path d="M86 122 L72 155 L75 178" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <!-- Brazo derecho saludando arriba -->
        <g class="arm-waving">
          <path d="M150 122 L172 105 L168 76" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
          <circle cx="168" cy="74" r="8" fill="${skin}" />
        </g>
      `;
    } else if (emote === 'celebrate' || emote === 'victory') {
      armsSvg = `
        <!-- Ambos brazos arriba celebrando -->
        <path d="M86 122 L64 100 L68 72" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="68" cy="70" r="8" fill="${skin}" />
        <path d="M150 122 L172 100 L168 72" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <circle cx="168" cy="70" r="8" fill="${skin}" />
      `;
    } else if (emote === 'dance') {
      armsSvg = `
        <path d="M86 122 L62 135 L80 152" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M150 122 L174 110 L160 85" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      `;
    } else if (emote === 'focus') {
      armsSvg = `
        <path d="M86 122 L100 145 L112 140" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M150 122 L136 145 L124 140" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      `;
    } else if (emote === 'clap') {
      armsSvg = `
        <path d="M86 122 L110 142 L116 145" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
        <path d="M150 122 L126 142 L120 145" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
      `;
    }

    return `
      <div class="mentix-avatar-wrapper ${rotating}" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center; position: relative;">
        <svg 
          id="${uniqueId}" 
          class="mentix-avatar-svg ${emoteClass}" 
          viewBox="0 0 236 260" 
          width="${size}" 
          height="${size}" 
          xmlns="http://www.w3.org/2000/svg"
          style="filter: drop-shadow(0 14px 25px rgba(0,0,0,0.65)); overflow: visible;"
        >
          <defs>
            <!-- Sombra de suelo estilizada -->
            <radialGradient id="shadow_${uniqueId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0, 245, 212, 0.45)" />
              <stop offset="60%" stop-color="rgba(0,0,0,0.55)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0)" />
            </radialGradient>
            <!-- Brillo de iluminación cenital neón -->
            <linearGradient id="glow_${uniqueId}" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0.1" />
            </linearGradient>
          </defs>

          <!-- Sombra proyectada en el suelo -->
          <ellipse cx="118" cy="248" rx="55" ry="10" fill="url(#shadow_${uniqueId})" />

          <!-- Grupo de Cuerpo con clase de emote -->
          <g class="avatar-body-group">
            <!-- Brazos traseros / base -->
            ${armsSvg}

            <!-- Piernas y Pantalón -->
            ${bottomSvg}

            <!-- Zapatos -->
            ${shoesSvg}

            <!-- Torso / Ropa Superior -->
            ${topSvg}

            <!-- Cuello -->
            <rect x="110" y="104" width="16" height="20" rx="4" fill="${skin}" />

            <!-- Cabeza Base -->
            <ellipse cx="118" cy="86" rx="26" ry="29" fill="${skin}" />
            <path d="M102 82 Q94 86 102 96" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" fill="none"/>
            <path d="M134 82 Q142 86 134 96" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" fill="none"/>

            <!-- Ojos y Cejas -->
            ${eyesSvg}

            <!-- Nariz estilizada -->
            <path d="M117 90 L115 95 L119 95" stroke="rgba(0,0,0,0.25)" stroke-width="1.5" fill="none" stroke-linecap="round"/>

            <!-- Boca y Expresión -->
            ${mouthSvg}

            <!-- Cabello y Peinado -->
            ${hairSvg}

            <!-- Accesorio Principal (Gafas, Cascos, Gorra) -->
            ${accSvg}
          </g>
        </svg>
      </div>
    `;
  },

  // Genera el visor 3D interactivo con rotación por arrastre de ratón y touch
  attachInteractive3D(containerEl, config) {
    if (!containerEl) return;
    let isDragging = false;
    let startX = 0;
    let currentRotation = 0;

    const wrapper = containerEl.querySelector('.mentix-avatar-wrapper');
    if (!wrapper) return;

    wrapper.style.perspective = '1000px';
    wrapper.style.cursor = 'grab';

    const onStart = (clientX) => {
      isDragging = true;
      startX = clientX;
      wrapper.style.cursor = 'grabbing';
      wrapper.style.transition = 'none';
    };

    const onMove = (clientX) => {
      if (!isDragging) return;
      const delta = clientX - startX;
      const deg = currentRotation + delta * 0.7;
      wrapper.style.transform = `perspective(800px) rotateY(${deg}deg)`;
    };

    const onEnd = (clientX) => {
      if (!isDragging) return;
      isDragging = false;
      const delta = clientX - startX;
      currentRotation = (currentRotation + delta * 0.7) % 360;
      wrapper.style.cursor = 'grab';
      wrapper.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      // Auto-regresar suavemente al frente tras unos momentos
      setTimeout(() => {
        if (!isDragging) {
          wrapper.style.transform = 'perspective(800px) rotateY(0deg)';
          currentRotation = 0;
        }
      }, 2500);
    };

    wrapper.onmousedown = (e) => onStart(e.clientX);
    window.addEventListener('mousemove', (e) => onMove(e.clientX));
    window.addEventListener('mouseup', (e) => onEnd(e.clientX));

    wrapper.ontouchstart = (e) => {
      if (e.touches && e.touches[0]) onStart(e.touches[0].clientX);
    };
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) onMove(e.touches[0].clientX);
    });
    window.addEventListener('touchend', (e) => {
      if (e.changedTouches && e.changedTouches[0]) onEnd(e.changedTouches[0].clientX);
    });
  }
};

console.log('✅ AvatarEngine cargado exitosamente.');
