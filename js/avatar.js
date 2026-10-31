/**
 * 🦊 MENTIX / TE RETO - AVATAR ENGINE: KAHOOT CHARACTERS EDITION
 * Sistema de avatares oficiales estilo Kahoot con personajes animales vectoriales:
 * Zorro (Fox), Panda, Gato, Perro, León, Conejo, Koala, Búho, Mono, Lobo, etc.
 * Personalización completa con gorros, gafas, ropa, expresiones, físicas 3D y badges oficiales [ 🦊 Eimy  NIV. 3 ].
 */

window.AvatarEngine = {
  // Configuración predeterminada (basada exactamente en la captura del usuario: Zorro Eimy NIV. 3)
  defaultConfig: {
    animal: 'fox', // 'fox', 'panda', 'cat', 'dog', 'lion', 'rabbit', 'koala', 'owl', 'monkey', 'bear', 'wolf', 'tiger', 'penguin', 'unicorn', 'dragon', 'robot'
    alias: 'Eimy',
    title: 'Gamer Pro',
    themeColor: 'default', // 'default', 'neon_cyan', 'pink_punk', 'cyber_purple', 'golden', 'midnight', 'arctic_white', 'emerald'
    headwear: 'none', // 'none', 'headphones', 'gamer_cap', 'party_hat', 'crown', 'grad_hat', 'ninja_band', 'beanie', 'bow'
    headwearColor: '#00f5d4',
    eyewear: 'none', // 'none', 'sunglasses', 'nerd_glasses', 'cyber_visor', 'monocle', 'pirate_patch'
    eyewearColor: '#111827',
    outfit: 'hoodie', // 'none', 'hoodie', 'bowtie', 'scarf', 'cape', 'medal', 'bandana_neck'
    outfitColor: '#7928ca',
    expression: 'happy', // 'happy', 'cool', 'wink', 'star_eyes', 'focused'
    stageBg: 'matrix_neon', // 'matrix_neon', 'cyber_arcade', 'space_station', 'gamer_arena', 'chill_lab'
    emote: 'idle', // 'idle', 'wave', 'celebrate', 'dance', 'laugh', 'victory', 'focus', 'clap'
    preset: 'eimy_fox',
    xp: 220,
    level: 3, // NIV. 3 exactamente como la captura del usuario
    unlockedItems: ['fox', 'panda', 'cat', 'headphones', 'sunglasses', 'hoodie', 'crown', 'wave', 'victory']
  },

  // Catálogo de Animales / Personajes Kahoot
  animals: {
    fox: {
      name: 'Zorro',
      icon: '🦊',
      desc: 'El astuto zorro clásico de Kahoot.',
      primaryColor: '#f45d22',
      secondaryColor: '#ffffff'
    },
    panda: {
      name: 'Panda',
      icon: '🐼',
      desc: 'El oso panda tranquilo y experto.',
      primaryColor: '#ffffff',
      secondaryColor: '#1a1a1a'
    },
    cat: {
      name: 'Gato',
      icon: '🐱',
      desc: 'Felino ágil con reflejos legendarios.',
      primaryColor: '#f59e0b',
      secondaryColor: '#fef3c7'
    },
    dog: {
      name: 'Perro / Pug',
      icon: '🐶',
      desc: 'Cachorro leal y lleno de entusiasmo.',
      primaryColor: '#d97706',
      secondaryColor: '#ffedd5'
    },
    lion: {
      name: 'León',
      icon: '🦁',
      desc: 'El rey de la selva con melena dorada.',
      primaryColor: '#fbbf24',
      secondaryColor: '#b45309'
    },
    rabbit: {
      name: 'Conejo',
      icon: '🐰',
      desc: 'Súper veloz con orejas atentas.',
      primaryColor: '#e2e8f0',
      secondaryColor: '#fbcfe8'
    },
    koala: {
      name: 'Koala',
      icon: '🐨',
      desc: 'Orejas suaves y mente serena.',
      primaryColor: '#94a3b8',
      secondaryColor: '#ffffff'
    },
    owl: {
      name: 'Búho',
      icon: '🦉',
      desc: 'El sabio guardián del conocimiento.',
      primaryColor: '#64748b',
      secondaryColor: '#fde047'
    },
    monkey: {
      name: 'Mono',
      icon: '🐵',
      desc: 'Alegre, curioso e imparable.',
      primaryColor: '#92400e',
      secondaryColor: '#fed7aa'
    },
    bear: {
      name: 'Oso',
      icon: '🐻',
      desc: 'Fuerza mental y calma absoluta.',
      primaryColor: '#78350f',
      secondaryColor: '#fde68a'
    },
    wolf: {
      name: 'Lobo',
      icon: '🐺',
      desc: 'Líder de manada con visión certera.',
      primaryColor: '#64748b',
      secondaryColor: '#e2e8f0'
    },
    tiger: {
      name: 'Tigre',
      icon: '🐯',
      desc: 'Rayas de campeón y energía pura.',
      primaryColor: '#ea580c',
      secondaryColor: '#1a1a1a'
    },
    penguin: {
      name: 'Pingüino',
      icon: '🐧',
      desc: 'Elegante y fresco bajo presión.',
      primaryColor: '#0f172a',
      secondaryColor: '#ffffff'
    },
    unicorn: {
      name: 'Unicornio',
      icon: '🦄',
      desc: 'Magia brillante con cuerno cósmico.',
      primaryColor: '#fbcfe8',
      secondaryColor: '#fbbf24'
    },
    dragon: {
      name: 'Dragón',
      icon: '🐲',
      desc: 'Poder de fuego y espíritu gamer.',
      primaryColor: '#10b981',
      secondaryColor: '#f59e0b'
    },
    robot: {
      name: 'Robot Cuántico',
      icon: '🤖',
      desc: 'Cálculo a la velocidad de la luz.',
      primaryColor: '#0ea5e9',
      secondaryColor: '#00f5d4'
    }
  },

  // Presets temáticos
  presets: {
    eimy_fox: {
      name: 'Zorro Pro (Eimy)',
      icon: '🦊',
      desc: 'El personaje oficial de Kahoot con nivel 3.',
      config: {
        animal: 'fox',
        alias: 'Eimy',
        title: 'Gamer Pro',
        themeColor: 'default',
        headwear: 'none',
        eyewear: 'none',
        outfit: 'hoodie',
        outfitColor: '#7928ca',
        expression: 'happy',
        stageBg: 'matrix_neon',
        level: 3,
        xp: 220,
        emote: 'idle'
      }
    },
    panda_gamer: {
      name: 'Panda Gamer',
      icon: '🐼',
      desc: 'Panda con auriculares RGB y sudadera neón.',
      config: {
        animal: 'panda',
        alias: 'PandaByte',
        title: 'Cerebro Neón',
        themeColor: 'default',
        headwear: 'headphones',
        headwearColor: '#00f5d4',
        eyewear: 'none',
        outfit: 'hoodie',
        outfitColor: '#0f172a',
        expression: 'cool',
        stageBg: 'gamer_arena',
        level: 2,
        xp: 150,
        emote: 'victory'
      }
    },
    cat_ninja: {
      name: 'Gato Ninja',
      icon: '🐱',
      desc: 'Felino con bandana ninja y reflejos extremos.',
      config: {
        animal: 'cat',
        alias: 'NekoPro',
        title: 'Velocidad Rayo',
        themeColor: 'neon_cyan',
        headwear: 'ninja_band',
        headwearColor: '#ff007f',
        eyewear: 'none',
        outfit: 'bowtie',
        outfitColor: '#ff007f',
        expression: 'wink',
        stageBg: 'cyber_arcade',
        level: 3,
        xp: 260,
        emote: 'dance'
      }
    },
    dog_hero: {
      name: 'Perro Héroe',
      icon: '🐶',
      desc: 'Cachorro con capa de superhéroe y gafas gamer.',
      config: {
        animal: 'dog',
        alias: 'SuperPug',
        title: 'Maestro del Saber',
        themeColor: 'default',
        headwear: 'none',
        eyewear: 'sunglasses',
        eyewearColor: '#111827',
        outfit: 'cape',
        outfitColor: '#ef4444',
        expression: 'star_eyes',
        stageBg: 'space_station',
        level: 4,
        xp: 340,
        emote: 'celebrate'
      }
    },
    lion_king: {
      name: 'León Real',
      icon: '🦁',
      desc: 'Corona real dorada y pajarita elegante.',
      config: {
        animal: 'lion',
        alias: 'KingLeo',
        title: 'Leyenda de la Sala',
        themeColor: 'golden',
        headwear: 'crown',
        headwearColor: '#ffd166',
        eyewear: 'monocle',
        eyewearColor: '#ffd166',
        outfit: 'bowtie',
        outfitColor: '#b45309',
        expression: 'happy',
        stageBg: 'chill_lab',
        level: 5,
        xp: 480,
        emote: 'victory'
      }
    },
    owl_scholar: {
      name: 'Búho Sabio',
      icon: '🦉',
      desc: 'Birrete de graduación y gafas intelectuales.',
      config: {
        animal: 'owl',
        alias: 'DrOwl',
        title: 'Maestro del Saber',
        themeColor: 'default',
        headwear: 'grad_hat',
        headwearColor: '#1e293b',
        eyewear: 'nerd_glasses',
        eyewearColor: '#6366f1',
        outfit: 'scarf',
        outfitColor: '#4f46e5',
        expression: 'focused',
        stageBg: 'chill_lab',
        level: 4,
        xp: 320,
        emote: 'focus'
      }
    },
    cyber_wolf: {
      name: 'Lobo Cyber',
      icon: '🐺',
      desc: 'Visor holográfico futurista y armadura neón.',
      config: {
        animal: 'wolf',
        alias: 'NeonWolf',
        title: 'Hacker del Saber',
        themeColor: 'cyber_purple',
        headwear: 'none',
        eyewear: 'cyber_visor',
        eyewearColor: '#00f5d4',
        outfit: 'hoodie',
        outfitColor: '#7928ca',
        expression: 'cool',
        stageBg: 'matrix_neon',
        level: 3,
        xp: 240,
        emote: 'wave'
      }
    },
    unicorn_magic: {
      name: 'Unicornio Mágico',
      icon: '🦄',
      desc: 'Gorro de fiesta y estrellas en los ojos.',
      config: {
        animal: 'unicorn',
        alias: 'Starlight',
        title: 'Cerebro Neón',
        themeColor: 'default',
        headwear: 'party_hat',
        headwearColor: '#ff007f',
        eyewear: 'none',
        outfit: 'bow',
        outfitColor: '#ec4899',
        expression: 'star_eyes',
        stageBg: 'cyber_arcade',
        level: 3,
        xp: 210,
        emote: 'dance'
      }
    }
  },

  // Fondos de escenario virtual
  stageBackgrounds: {
    matrix_neon: {
      name: 'Matriz Neón',
      icon: '🌌',
      css: 'radial-gradient(circle at 50% 30%, rgba(0, 245, 212, 0.25) 0%, rgba(5, 10, 26, 0.95) 75%), linear-gradient(180deg, #050b1a 0%, #030712 100%)'
    },
    cyber_arcade: {
      name: 'Arcade Retro',
      icon: '🕹️',
      css: 'radial-gradient(circle at 50% 30%, rgba(255, 0, 127, 0.25) 0%, rgba(20, 5, 30, 0.95) 75%), linear-gradient(180deg, #180324 0%, #08010d 100%)'
    },
    space_station: {
      name: 'Estación Espacial',
      icon: '🛸',
      css: 'radial-gradient(circle at 50% 20%, rgba(56, 189, 248, 0.3) 0%, rgba(7, 18, 48, 0.95) 75%), linear-gradient(180deg, #091a3c 0%, #020617 100%)'
    },
    gamer_arena: {
      name: 'Arena eSports',
      icon: '🏆',
      css: 'radial-gradient(circle at 50% 25%, rgba(245, 158, 11, 0.3) 0%, rgba(30, 15, 5, 0.95) 80%), linear-gradient(180deg, #1c0e04 0%, #0a0401 100%)'
    },
    chill_lab: {
      name: 'Laboratorio Zen',
      icon: '🧪',
      css: 'radial-gradient(circle at 50% 30%, rgba(139, 92, 246, 0.3) 0%, rgba(15, 10, 35, 0.95) 80%), linear-gradient(180deg, #1e1338 0%, #070312 100%)'
    }
  },

  // Emotes y gestos
  emotes: {
    idle: { name: 'Respiración / Espera', icon: '🧘', desc: 'Postura base de juego' },
    wave: { name: 'Saludar', icon: '👋', desc: 'Saludo amistoso con la pata' },
    celebrate: { name: 'Celebrar', icon: '🎉', desc: 'Salto eufórico con orejas contentas' },
    dance: { name: 'Bailar', icon: '💃', desc: 'Paso de baile al ritmo gamer' },
    laugh: { name: 'Reír', icon: '😂', desc: 'Carcajada alegre' },
    victory: { name: 'Pose Victoria', icon: '✌️', desc: 'Señal de triunfo con destello dorado' },
    focus: { name: 'Concentración', icon: '🧠', desc: 'Modo ultra instinto' },
    clap: { name: 'Aplaudir', icon: '👏', desc: 'Aplausos de ánimo' }
  },

  // Títulos decorativos
  titles: [
    { name: 'Novato Curioso', xpReq: 0, icon: '🌱' },
    { name: 'Gamer Pro', xpReq: 50, icon: '🎮' },
    { name: 'Cerebro Neón', xpReq: 120, icon: '⚡' },
    { name: 'Velocidad Rayo', xpReq: 200, icon: '⚡' },
    { name: 'Maestro del Saber', xpReq: 300, icon: '🎓' },
    { name: 'Hacker del Saber', xpReq: 420, icon: '💻' },
    { name: 'Leyenda de la Sala', xpReq: 550, icon: '👑' }
  ],

  // Paleta de temas de color de pelaje
  themeColorMap: {
    default: null,
    neon_cyan: { primary: '#00f5d4', secondary: '#ffffff' },
    pink_punk: { primary: '#ff007f', secondary: '#ffffff' },
    cyber_purple: { primary: '#a855f7', secondary: '#ffffff' },
    golden: { primary: '#ffd166', secondary: '#fff3b0' },
    midnight: { primary: '#1e293b', secondary: '#475569' },
    arctic_white: { primary: '#f8fafc', secondary: '#cbd5e1' },
    emerald: { primary: '#10b981', secondary: '#d1fae5' }
  },

  // Recuperar avatar guardado (priorizando el jugador activo de esta pestaña)
  getSavedAvatar() {
    try {
      if (window.realtimeEngine && window.realtimeEngine.localPlayer && window.realtimeEngine.localPlayer.avatarConfig) {
        return {
          ...this.defaultConfig,
          ...window.realtimeEngine.localPlayer.avatarConfig,
          alias: window.realtimeEngine.localPlayer.nickname || window.realtimeEngine.localPlayer.avatarConfig.alias || this.defaultConfig.alias
        };
      }
      const tabRaw = sessionStorage.getItem('mentix_player_avatar_tab');
      if (tabRaw) {
        const parsedTab = JSON.parse(tabRaw);
        return { ...this.defaultConfig, ...parsedTab };
      }
      const raw = localStorage.getItem('mentix_player_avatar');
      if (raw) {
        const parsed = JSON.parse(raw);
        return { ...this.defaultConfig, ...parsed };
      }
    } catch (e) {
      console.warn('Error recuperando avatar:', e);
    }
    return { ...this.defaultConfig };
  },

  // Guardar avatar y sincronizar de inmediato con el jugador local
  saveAvatar(config) {
    try {
      const currentBase = this.getSavedAvatar();
      const merged = { ...currentBase, ...config };
      if (window.realtimeEngine && window.realtimeEngine.localPlayer) {
        // Preservar el nickname actual del jugador a menos que se cambie explícitamente el alias
        if (config && typeof config.alias === 'string' && config.alias.trim()) {
          window.realtimeEngine.localPlayer.nickname = config.alias.trim();
          merged.alias = config.alias.trim();
        } else if (window.realtimeEngine.localPlayer.nickname) {
          merged.alias = window.realtimeEngine.localPlayer.nickname;
        }
        window.realtimeEngine.localPlayer.avatarConfig = { ...merged };
        window.realtimeEngine.localPlayer.avatar = this.getAvatarEmoji(merged.animal);
      }
      try { sessionStorage.setItem('mentix_player_avatar_tab', JSON.stringify(merged)); } catch (e) {}
      try { localStorage.setItem('mentix_player_avatar', JSON.stringify(merged)); } catch (e) {}
      return merged;
    } catch (e) {
      console.warn('Error guardando avatar:', e);
      return config;
    }
  },

  getAvatarEmoji(animalKey) {
    return this.animals[animalKey]?.icon || '🦊';
  },

  awardXP(amount, reason = '') {
    const cur = this.getSavedAvatar();
    const prevXP = cur.xp || 0;
    const newXP = prevXP + amount;
    const newLevel = Math.floor(newXP / 100) + 1;
    const leveledUp = newLevel > (cur.level || 1);

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

    window.dispatchEvent(new CustomEvent('mentix_avatar_xp_updated', {
      detail: { xp: newXP, level: newLevel, title: newTitle, added: amount, reason, leveledUp }
    }));

    return updated;
  },

  // =========================================================================
  // 🏷️ RENDERIZADO DEL BADGE / PILL OFICIAL ESTILO KAHOOT: [ 🦊 Eimy  NIV. 3 ]
  // =========================================================================
  renderBadgeHTML(playerOrConfig, options = {}) {
    const cfg = playerOrConfig?.avatarConfig || playerOrConfig || this.defaultConfig;
    const name = playerOrConfig?.nickname || cfg.alias || 'Eimy';
    const level = playerOrConfig?.level || cfg.level || 3;
    const isReady = playerOrConfig?.isReady;
    const size = options.size || 28;

    return `
      <div class="kahoot-player-badge-pill ${isReady ? 'is-ready' : ''}" style="cursor: pointer;">
        <div class="kahoot-pill-avatar-wrap">
          ${this.renderIconSVG(cfg, size)}
        </div>
        <span class="kahoot-pill-name">${name}</span>
        <span class="kahoot-pill-level-tag">NIV. ${level}</span>
        ${isReady !== undefined ? `
          <span style="font-size: 0.72rem; margin-left: 0.15rem;">${isReady ? '🟢' : '✏️'}</span>
        ` : ''}
      </div>
    `;
  },

  // =========================================================================
  // 🖼️ PERSONAJES ILUSTRADOS (sprites estilo Kahoot bonito y animado)
  // =========================================================================
  spriteAnimals: ['fox', 'panda', 'cat', 'dog', 'lion', 'rabbit', 'koala', 'owl', 'monkey', 'bear', 'wolf', 'tiger', 'penguin', 'unicorn', 'dragon', 'robot'],

  // Coordenadas exactas medidas por píxel para cada uno de los 16 sprites (en viewBox 240x260):
  // cx: centro horizontal, hatY: tope de la cabeza, ey: altura de los ojos, es: escala de ojos, hs: escala de sombrero,
  // headW: semiancho de cabeza, shY: altura de hombros, chinY: borde inferior de la barbilla en cx,
  // sw: semiancho de hombros, armW: semiancho exterior de manga, pitW: semiancho exacto de axila, waistW: semiancho de cadera/cintura, hemY: borde inferior sobre las patas
  spriteMeta: {
    fox:     { cx: 102.4, hatY: 42, ey: 100.8, es: 2.12, hs: 1.55, headW: 78, mouthY: 148, shY: 156, chinY: 169, sw: 40.0, armW: 55.5, pitW: 37.5, waistW: 42.5, hemY: 221 },
    panda:   { cx: 119.6, hatY: 20, ey: 92.6,  es: 2.16, hs: 1.60, headW: 84, mouthY: 124, shY: 151, chinY: 160, sw: 43.5, armW: 58.5, pitW: 41.5, waistW: 44.0, hemY: 221 },
    cat:     { cx: 99.0,  hatY: 32, ey: 96.0,  es: 2.14, hs: 1.55, headW: 76, mouthY: 128, shY: 152, chinY: 161, sw: 41.0, armW: 57.0, pitW: 38.0, waistW: 42.5, hemY: 220 },
    dog:     { cx: 119.6, hatY: 18, ey: 90.7,  es: 2.55, hs: 1.60, headW: 82, mouthY: 124, shY: 145, chinY: 154, sw: 41.0, armW: 58.5, pitW: 39.5, waistW: 44.5, hemY: 218 },
    lion:    { cx: 118.0, hatY: 24, ey: 102.0, es: 2.45, hs: 1.55, headW: 92, mouthY: 127, shY: 170, chinY: 184, sw: 42.0, armW: 52.0, pitW: 35.5, waistW: 39.5, hemY: 223 },
    rabbit:  { cx: 119.9, hatY: 66, ey: 107.6, es: 1.98, hs: 1.45, headW: 63, mouthY: 144, shY: 170, chinY: 176, sw: 34.0, armW: 48.5, pitW: 33.0, waistW: 36.5, hemY: 223 },
    koala:   { cx: 119.9, hatY: 30, ey: 98.6,  es: 2.48, hs: 1.55, headW: 78, mouthY: 134, shY: 152, chinY: 160, sw: 41.0, armW: 56.5, pitW: 38.0, waistW: 42.5, hemY: 219 },
    owl:     { cx: 120.0, hatY: 18, ey: 88.0,  es: 2.35, hs: 1.60, headW: 83, mouthY: 122, shY: 141, chinY: 151, sw: 51.0, armW: 65.5, pitW: 48.0, waistW: 49.0, hemY: 218 },
    monkey:  { cx: 119.6, hatY: 26, ey: 100.3, es: 2.18, hs: 1.55, headW: 80, mouthY: 133, shY: 160, chinY: 166, sw: 39.0, armW: 53.5, pitW: 36.5, waistW: 40.0, hemY: 221 },
    bear:    { cx: 119.9, hatY: 25, ey: 99.5,  es: 2.10, hs: 1.60, headW: 82, mouthY: 134, shY: 160, chinY: 166, sw: 39.5, armW: 54.0, pitW: 37.0, waistW: 40.5, hemY: 222 },
    wolf:    { cx: 106.3, hatY: 40, ey: 98.8,  es: 2.05, hs: 1.55, headW: 76, mouthY: 146, shY: 154, chinY: 165, sw: 38.0, armW: 54.0, pitW: 36.5, waistW: 40.5, hemY: 219 },
    tiger:   { cx: 109.6, hatY: 21, ey: 93.5,  es: 2.52, hs: 1.60, headW: 83, mouthY: 127, shY: 150, chinY: 159, sw: 44.5, armW: 59.5, pitW: 41.5, waistW: 44.5, hemY: 220 },
    penguin: { cx: 119.5, hatY: 18, ey: 97.7,  es: 2.34, hs: 1.60, headW: 86, mouthY: 126, shY: 148, chinY: 158, sw: 48.5, armW: 66.0, pitW: 48.5, waistW: 51.0, hemY: 225 },
    unicorn: { cx: 120.0, hatY: 38, ey: 107.7, es: 2.02, hs: 1.50, headW: 77, mouthY: 140, shY: 164, chinY: 170, sw: 37.5, armW: 51.0, pitW: 35.0, waistW: 38.5, hemY: 221 },
    dragon:  { cx: 119.9, hatY: 24, ey: 99.5,  es: 2.10, hs: 1.55, headW: 82, mouthY: 134, shY: 158, chinY: 165, sw: 39.5, armW: 53.5, pitW: 37.0, waistW: 40.5, hemY: 221 },
    robot:   { cx: 119.5, hatY: 32, ey: 96.8,  es: 2.38, hs: 1.55, headW: 80, mouthY: 146, shY: 163, chinY: 169, sw: 37.0, armW: 51.5, pitW: 35.0, waistW: 38.0, hemY: 221 }
  },

  // Colores especiales: se aplican como tinte sobre el sprite
  themeFilterCss(themeColor) {
    const map = {
      neon_cyan: 'hue-rotate(150deg) saturate(1.4)',
      pink_punk: 'hue-rotate(305deg) saturate(1.3)',
      cyber_purple: 'hue-rotate(245deg) saturate(1.3)',
      golden: 'hue-rotate(18deg) saturate(1.5) brightness(1.12)',
      midnight: 'brightness(0.62) saturate(0.8) contrast(1.1)',
      arctic_white: 'saturate(0.25) brightness(1.25)',
      emerald: 'hue-rotate(95deg) saturate(1.3)'
    };
    return map[themeColor] ? `filter:${map[themeColor]};` : '';
  },

  renderSpriteAvatar(c, animal, emote, size, uniqueId) {
    const meta = this.spriteMeta[animal] || this.spriteMeta.fox;
    const { cx, hatY, ey, es, hs, headW, mouthY, shY, chinY, sw, armW, pitW, waistW, hemY } = meta;

    let emoteClass = 'anim-breathing';
    if (emote === 'wave') emoteClass = 'anim-wave';
    else if (emote === 'celebrate') emoteClass = 'anim-celebrate';
    else if (emote === 'dance') emoteClass = 'anim-dance';
    else if (emote === 'laugh') emoteClass = 'anim-laugh';
    else if (emote === 'victory') emoteClass = 'anim-victory';
    else if (emote === 'focus') emoteClass = 'anim-focus';
    else if (emote === 'clap') emoteClass = 'anim-clap';

    // 1. PRENDAS DE ROPA ILUSTRADAS QUE ENVUELVEN HOMBROS, BARBILLA, MANGAS Y CINTURA DE CADA ANIMAL
    const S = '#2a1810';
    let behind = '';
    let front = '';

    // Punto de control de Bezier para que la curva del cuello pase exactamente por (cx, chinY) desde (cx-sw, shY) hasta (cx+sw, shY)
    const colCy = 2 * chinY - shY;
    const slvY = shY + 24;       // borde exterior de la manga (justo antes de las manitas/patitas)
    const pitY = shY + 27;       // axila donde la manga se une al torso
    const pitX = pitW || (waistW * 0.90); // semiancho exacto de la línea de axila del sprite
    const hw = waistW;           // semiancho exacto del torso en la cintura
    const botY = hemY;

    // Silueta anatómica de camiseta/chaqueta adaptada a la curva real del cuerpo y mangas del animal
    const shirtPath = [
      `M ${(cx - sw).toFixed(1)} ${shY}`,
      `Q ${(cx - armW + 2).toFixed(1)} ${shY + 9} ${(cx - armW).toFixed(1)} ${slvY}`,
      `Q ${(cx - (armW + pitX) * 0.5).toFixed(1)} ${pitY + 2.5} ${(cx - pitX).toFixed(1)} ${pitY}`,
      `Q ${(cx - hw - 1).toFixed(1)} ${ (pitY + botY) * 0.5 } ${(cx - hw).toFixed(1)} ${botY - 4}`,
      `Q ${cx} ${botY + 7} ${(cx + hw).toFixed(1)} ${botY - 4}`,
      `Q ${(cx + hw + 1).toFixed(1)} ${ (pitY + botY) * 0.5 } ${(cx + pitX).toFixed(1)} ${pitY}`,
      `Q ${(cx + (armW + pitX) * 0.5).toFixed(1)} ${pitY + 2.5} ${(cx + armW).toFixed(1)} ${slvY}`,
      `Q ${(cx + armW - 2).toFixed(1)} ${shY + 9} ${(cx + sw).toFixed(1)} ${shY}`,
      `Q ${cx} ${colCy.toFixed(1)} ${(cx - sw).toFixed(1)} ${shY}`,
      `Z`
    ].join(' ');

    // Costuras internas de las mangas y cuello para dar volumen cartoon 2D real
    const sleeveSeams = `
      <path d="M ${(cx - pitX).toFixed(1)} ${pitY} Q ${(cx - pitX + 1.5).toFixed(1)} ${shY + 17} ${(cx - pitX + 3).toFixed(1)} ${shY + 12}" fill="none" stroke="${S}" stroke-width="2.8" stroke-linecap="round"/>
      <path d="M ${(cx + pitX).toFixed(1)} ${pitY} Q ${(cx + pitX - 1.5).toFixed(1)} ${shY + 17} ${(cx + pitX - 3).toFixed(1)} ${shY + 12}" fill="none" stroke="${S}" stroke-width="2.8" stroke-linecap="round"/>
    `;
    const collarRim = (rimCol) => `
      <path d="M ${(cx - sw + 2).toFixed(1)} ${shY + 1} Q ${cx} ${colCy.toFixed(1)} ${(cx + sw - 2).toFixed(1)} ${shY + 1} L ${(cx + sw - 6).toFixed(1)} ${shY + 6} Q ${cx} ${(colCy + 7).toFixed(1)} ${(cx - sw + 6).toFixed(1)} ${shY + 6} Z" fill="${rimCol}" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
    `;

    switch (c.outfit) {
      case 'tshirt_purple': {
        const baseCol = c.outfitColor || '#c084fc';
        front = `
          <path d="${shirtPath}" fill="${baseCol}" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Franja inferior rosa/magenta -->
          <path d="M ${(cx - hw + 1.5).toFixed(1)} ${botY - 14} Q ${cx} ${botY - 8} ${(cx + hw - 1.5).toFixed(1)} ${botY - 14} L ${(cx + hw).toFixed(1)} ${botY - 4} Q ${cx} ${botY + 6} ${(cx - hw).toFixed(1)} ${botY - 4} Z" fill="#f472b6" opacity="0.85"/>
          <path d="M ${(cx - hw + 1.5).toFixed(1)} ${botY - 14} Q ${cx} ${botY - 8} ${(cx + hw - 1.5).toFixed(1)} ${botY - 14}" fill="none" stroke="${S}" stroke-width="2.2"/>
          ${collarRim('#9333ea')}
          ${sleeveSeams}
          <path d="${shirtPath}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
        `;
        break;
      }
      case 'vest_adventurer': {
        front = `
          <!-- Camisa amarilla base con mangas -->
          <path d="${shirtPath}" fill="#fde047" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Paneles izquierdo y derecho del chaleco rojo sobre el torso -->
          <path d="M ${(cx - sw + 3).toFixed(1)} ${shY + 1} L ${(cx - pitX).toFixed(1)} ${pitY - 2} L ${(cx - hw).toFixed(1)} ${botY - 4} Q ${(cx - hw * 0.45).toFixed(1)} ${botY + 2} ${(cx - 5).toFixed(1)} ${botY + 1} L ${(cx - 5).toFixed(1)} ${chinY + 4} Q ${(cx - sw * 0.5).toFixed(1)} ${chinY - 1} ${(cx - sw + 3).toFixed(1)} ${shY + 1} Z" fill="#f43f5e" stroke="${S}" stroke-width="2.8" stroke-linejoin="round"/>
          <path d="M ${(cx + sw - 3).toFixed(1)} ${shY + 1} L ${(cx + pitX).toFixed(1)} ${pitY - 2} L ${(cx + hw).toFixed(1)} ${botY - 4} Q ${(cx + hw * 0.45).toFixed(1)} ${botY + 2} ${(cx + 5).toFixed(1)} ${botY + 1} L ${(cx + 5).toFixed(1)} ${chinY + 4} Q ${(cx + sw * 0.5).toFixed(1)} ${chinY - 1} ${(cx + sw - 3).toFixed(1)} ${shY + 1} Z" fill="#f43f5e" stroke="${S}" stroke-width="2.8" stroke-linejoin="round"/>
          <!-- Solapas del cuello en V naranjas -->
          <polygon points="${(cx - 20).toFixed(1)},${chinY - 3} ${(cx - 5).toFixed(1)},${chinY + 15} ${(cx - 5).toFixed(1)},${chinY}" fill="#f59e0b" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <polygon points="${(cx + 20).toFixed(1)},${chinY - 3} ${(cx + 5).toFixed(1)},${chinY + 15} ${(cx + 5).toFixed(1)},${chinY}" fill="#f59e0b" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          ${sleeveSeams}
          <path d="M ${(cx - sw).toFixed(1)} ${shY} Q ${cx} ${colCy.toFixed(1)} ${(cx + sw).toFixed(1)} ${shY}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linecap="round"/>
        `;
        break;
      }
      case 'shirt_cyan': {
        front = `
          <path d="${shirtPath}" fill="#38bdf8" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Camiseta interior blanca en el centro y apertura de camisa veraniega -->
          <path d="M ${(cx - 6).toFixed(1)} ${chinY} L ${(cx + 6).toFixed(1)} ${chinY} L ${(cx + 5).toFixed(1)} ${botY + 1} L ${(cx - 5).toFixed(1)} ${botY + 1} Z" fill="#ffffff" stroke="${S}" stroke-width="2.4"/>
          <!-- Estampado veraniego blanco -->
          <circle cx="${(cx - hw * 0.52).toFixed(1)}" cy="${chinY + 14}" r="4.5" fill="rgba(255,255,255,0.75)"/>
          <circle cx="${(cx + hw * 0.50).toFixed(1)}" cy="${chinY + 12}" r="4.2" fill="rgba(255,255,255,0.75)"/>
          <circle cx="${(cx - hw * 0.45).toFixed(1)}" cy="${botY - 14}" r="4.2" fill="rgba(255,255,255,0.75)"/>
          <circle cx="${(cx + hw * 0.52).toFixed(1)}" cy="${botY - 15}" r="4.5" fill="rgba(255,255,255,0.75)"/>
          ${collarRim('#0284c7')}
          ${sleeveSeams}
          <path d="${shirtPath}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
        `;
        break;
      }
      case 'tshirt_rainbow': {
        front = `
          <defs>
            <linearGradient id="rb_${uniqueId}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f43f5e"/>
              <stop offset="30%" stop-color="#facc15"/>
              <stop offset="60%" stop-color="#4ade80"/>
              <stop offset="82%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#c084fc"/>
            </linearGradient>
          </defs>
          <path d="${shirtPath}" fill="url(#rb_${uniqueId})" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          ${collarRim('#f43f5e')}
          ${sleeveSeams}
          <path d="${shirtPath}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
        `;
        break;
      }
      case 'jacket_brown': {
        front = `
          <path d="${shirtPath}" fill="#b45309" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <!-- Pretina inferior más oscura -->
          <path d="M ${(cx - hw + 1).toFixed(1)} ${botY - 10} Q ${cx} ${botY - 5} ${(cx + hw - 1).toFixed(1)} ${botY - 10} L ${(cx + hw).toFixed(1)} ${botY - 4} Q ${cx} ${botY + 6} ${(cx - hw).toFixed(1)} ${botY - 4} Z" fill="#78350f"/>
          <!-- Cremallera blanca central -->
          <line x1="${cx}" y1="${chinY + 2}" x2="${cx}" y2="${botY + 1}" stroke="#ffffff" stroke-width="3.2"/>
          <line x1="${cx - 2.2}" y1="${chinY + 2}" x2="${cx - 2.2}" y2="${botY + 1}" stroke="${S}" stroke-width="1.6"/>
          <line x1="${cx + 2.2}" y1="${chinY + 2}" x2="${cx + 2.2}" y2="${botY + 1}" stroke="${S}" stroke-width="1.6"/>
          <!-- Cuello blanco tipo sherpa aviador -->
          <polygon points="${(cx - 24).toFixed(1)},${chinY - 4} ${cx},${chinY + 8} ${(cx - 10).toFixed(1)},${chinY + 14}" fill="#ffffff" stroke="${S}" stroke-width="2.5" stroke-linejoin="round"/>
          <polygon points="${(cx + 24).toFixed(1)},${chinY - 4} ${cx},${chinY + 8} ${(cx + 10).toFixed(1)},${chinY + 14}" fill="#ffffff" stroke="${S}" stroke-width="2.5" stroke-linejoin="round"/>
          ${sleeveSeams}
          <path d="M ${(cx - sw).toFixed(1)} ${shY} Q ${cx} ${colCy.toFixed(1)} ${(cx + sw).toFixed(1)} ${shY}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linecap="round"/>
        `;
        break;
      }
      case 'hoodie': {
        const hCol = c.outfitColor || '#3b82f6';
        front = `
          <path d="${shirtPath}" fill="${hCol}" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          ${collarRim(hCol)}
          <!-- Bolsillo canguro frontal -->
          <path d="M ${(cx - hw * 0.56).toFixed(1)} ${botY - 21} L ${(cx + hw * 0.56).toFixed(1)} ${botY - 21} L ${(cx + hw * 0.68).toFixed(1)} ${botY - 5} Q ${cx} ${botY} ${(cx - hw * 0.68).toFixed(1)} ${botY - 5} Z" fill="rgba(0,0,0,0.22)" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <!-- Cordones blancos del hoodie -->
          <line x1="${(cx - 8).toFixed(1)}" y1="${chinY + 2}" x2="${(cx - 8).toFixed(1)}" y2="${chinY + 20}" stroke="${S}" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="${(cx + 8).toFixed(1)}" y1="${chinY + 2}" x2="${(cx + 8).toFixed(1)}" y2="${chinY + 20}" stroke="${S}" stroke-width="4.5" stroke-linecap="round"/>
          <line x1="${(cx - 8).toFixed(1)}" y1="${chinY + 2}" x2="${(cx - 8).toFixed(1)}" y2="${chinY + 20}" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
          <line x1="${(cx + 8).toFixed(1)}" y1="${chinY + 2}" x2="${(cx + 8).toFixed(1)}" y2="${chinY + 20}" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
          ${sleeveSeams}
          <path d="${shirtPath}" fill="none" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
        `;
        break;
      }
      case 'cape': {
        const capeCol = (c.outfitColor && c.outfitColor !== '#7928ca') ? c.outfitColor : '#ef4444';
        const capeOutW = armW + 18;
        const capeBotY = botY + 14;
        // Capa amplia ondeando detrás de los hombros y brazos, bien visible a ambos lados
        behind = `
          <path d="M ${(cx - sw).toFixed(1)} ${shY + 2}
                   Q ${(cx - capeOutW - 4).toFixed(1)} ${shY + 34} ${(cx - capeOutW).toFixed(1)} ${capeBotY}
                   Q ${(cx - capeOutW * 0.5).toFixed(1)} ${capeBotY + 10} ${cx} ${capeBotY + 4}
                   Q ${(cx + capeOutW * 0.5).toFixed(1)} ${capeBotY + 10} ${(cx + capeOutW).toFixed(1)} ${capeBotY}
                   Q ${(cx + capeOutW + 4).toFixed(1)} ${shY + 34} ${(cx + sw).toFixed(1)} ${shY + 2} Z"
                fill="${capeCol}" stroke="${S}" stroke-width="3.4" stroke-linejoin="round"/>
          <path d="M ${(cx - sw + 4).toFixed(1)} ${shY + 8}
                   Q ${(cx - capeOutW + 8).toFixed(1)} ${shY + 38} ${(cx - capeOutW + 10).toFixed(1)} ${capeBotY - 3}
                   Q ${cx} ${capeBotY + 4} ${(cx + capeOutW - 10).toFixed(1)} ${capeBotY - 3}
                   Q ${(cx + capeOutW - 8).toFixed(1)} ${shY + 38} ${(cx + sw - 4).toFixed(1)} ${shY + 8} Z"
                fill="rgba(0,0,0,0.18)"/>
        `;
        // Esclavina / cuello de la capa abrazando los hombros por delante + broche dorado bajo la barbilla
        front = `
          <path d="M ${(cx - sw - 2).toFixed(1)} ${shY}
                   Q ${cx} ${colCy.toFixed(1)} ${(cx + sw + 2).toFixed(1)} ${shY}
                   Q ${(cx + sw + 8).toFixed(1)} ${shY + 9} ${(cx + sw - 2).toFixed(1)} ${shY + 13}
                   Q ${cx} ${(colCy + 13).toFixed(1)} ${(cx - sw + 2).toFixed(1)} ${shY + 13}
                   Q ${(cx - sw - 8).toFixed(1)} ${shY + 9} ${(cx - sw - 2).toFixed(1)} ${shY} Z"
                fill="${capeCol}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="${cx}" cy="${chinY + 5}" r="8" fill="#ffd166" stroke="${S}" stroke-width="2.6"/>
          <circle cx="${cx}" cy="${chinY + 5}" r="4" fill="#f59e0b"/>
        `;
        break;
      }
      case 'scarf': {
        const scCol = (c.outfitColor && c.outfitColor !== '#7928ca') ? c.outfitColor : '#f97316';
        // Bufanda curva que abraza el cuello de hombro a hombro pasando bajo la barbilla + caída lateral con flecos
        front = `
          <!-- Caída vertical de la bufanda sobre el pecho derecho -->
          <path d="M ${(cx + 8).toFixed(1)} ${chinY + 2}
                   L ${(cx + 25).toFixed(1)} ${chinY}
                   L ${(cx + 27).toFixed(1)} ${chinY + 34}
                   Q ${(cx + 17).toFixed(1)} ${chinY + 38} ${(cx + 7).toFixed(1)} ${chinY + 34} Z"
                fill="${scCol}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <line x1="${(cx + 8).toFixed(1)}" y1="${chinY + 27}" x2="${(cx + 26).toFixed(1)}" y2="${chinY + 27}" stroke="#fde047" stroke-width="3.5"/>
          <!-- Cuello envolvente curvo -->
          <path d="M ${(cx - sw + 1).toFixed(1)} ${shY - 1}
                   Q ${cx} ${(colCy - 2).toFixed(1)} ${(cx + sw - 1).toFixed(1)} ${shY - 1}
                   Q ${(cx + sw + 4).toFixed(1)} ${shY + 9} ${(cx + sw - 3).toFixed(1)} ${shY + 14}
                   Q ${cx} ${(colCy + 15).toFixed(1)} ${(cx - sw + 3).toFixed(1)} ${shY + 14}
                   Q ${(cx - sw - 4).toFixed(1)} ${shY + 9} ${(cx - sw + 1).toFixed(1)} ${shY - 1} Z"
                fill="${scCol}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M ${(cx - sw * 0.55).toFixed(1)} ${chinY - 2} Q ${cx} ${chinY + 7} ${(cx + sw * 0.55).toFixed(1)} ${chinY - 2}" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="3" stroke-linecap="round"/>
        `;
        break;
      }
      case 'bowtie': {
        const bCol = (c.outfitColor && c.outfitColor !== '#7928ca') ? c.outfitColor : '#ef4444';
        const by = chinY + 5;
        front = `
          <!-- Cuello de camisa blanca elegante bajo la barbilla -->
          <polygon points="${(cx - 22).toFixed(1)},${chinY - 3} ${cx},${chinY + 7} ${(cx - 11).toFixed(1)},${chinY + 14}" fill="#ffffff" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <polygon points="${(cx + 22).toFixed(1)},${chinY - 3} ${cx},${chinY + 7} ${(cx + 11).toFixed(1)},${chinY + 14}" fill="#ffffff" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <!-- Pajarita centrada -->
          <polygon points="${cx - 2},${by} ${(cx - 21).toFixed(1)},${by - 9} ${(cx - 21).toFixed(1)},${by + 9}" fill="${bCol}" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/>
          <polygon points="${cx + 2},${by} ${(cx + 21).toFixed(1)},${by - 9} ${(cx + 21).toFixed(1)},${by + 9}" fill="${bCol}" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/>
          <circle cx="${cx}" cy="${by}" r="5.5" fill="${bCol}" stroke="${S}" stroke-width="2.4"/>
        `;
        break;
      }
      case 'medal': {
        const my = chinY + 24;
        const rx = sw * 0.56;
        const ry = shY + (chinY - shY) * 0.35;
        front = `
          <!-- Cintas desde los hombros bajo la barbilla hasta el centro del pecho -->
          <polygon points="${(cx - rx).toFixed(1)},${ry.toFixed(1)} ${cx},${my - 4} ${(cx - rx + 10).toFixed(1)},${(ry + 3).toFixed(1)}" fill="#3b82f6" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="${(cx + rx).toFixed(1)},${ry.toFixed(1)} ${cx},${my - 4} ${(cx + rx - 10).toFixed(1)},${(ry + 3).toFixed(1)}" fill="#ef4444" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
          <!-- Medalla dorada con estrella -->
          <circle cx="${cx}" cy="${my + 3}" r="13" fill="#ffd166" stroke="${S}" stroke-width="2.8"/>
          <circle cx="${cx}" cy="${my + 3}" r="8.5" fill="#f59e0b"/>
          <polygon transform="translate(${cx}, ${my + 3}) scale(0.65)" points="0,-10 3,-3 10,-2 5,3 6,10 0,6 -6,10 -5,3 -10,-2 -3,-3" fill="#fef08a"/>
        `;
        break;
      }
      default:
        break;
    }

    // 2. EXPRESIONES FACIALES EXTRA SOBRE LOS OJOS (si se eligen en Avatar Studio)
    let exprOverlay = '';
    const halfEyeSpan = 16 * es;
    if (c.expression === 'star_eyes') {
      const star = (sx, sy) => `<polygon transform="translate(${sx.toFixed(1)},${sy.toFixed(1)}) scale(${(es * 0.72).toFixed(2)})" points="0,-10 3,-3 10,-2 5,3 6,10 0,6 -6,10 -5,3 -10,-2 -3,-3" fill="#ffd166" stroke="#3b1d0e" stroke-width="1.6"/>`;
      exprOverlay = star(cx - halfEyeSpan, ey) + star(cx + halfEyeSpan, ey);
    } else if (c.expression === 'cool' || c.expression === 'focused') {
      exprOverlay = `
        <line x1="${(cx - halfEyeSpan - 10).toFixed(1)}" y1="${(ey - 16).toFixed(1)}" x2="${(cx - halfEyeSpan + 10).toFixed(1)}" y2="${(ey - 11).toFixed(1)}" stroke="#3b1d0e" stroke-width="4.5" stroke-linecap="round"/>
        <line x1="${(cx + halfEyeSpan + 10).toFixed(1)}" y1="${(ey - 16).toFixed(1)}" x2="${(cx + halfEyeSpan - 10).toFixed(1)}" y2="${(ey - 11).toFixed(1)}" stroke="#3b1d0e" stroke-width="4.5" stroke-linecap="round"/>
      `;
    }

    // 2.5 ANIMACIÓN DE CONVERSACIÓN ENTRE COMPAÑEROS (boca hablando en su posición exacta cuando hay pareja)
    let talkOverlay = '';
    if (c.talking) {
      const my = mouthY || (chinY - 22);
      const phaseClass = c.talkPhase === 1 ? 'talk-phase-b' : 'talk-phase-a';
      talkOverlay = `
        <g transform="translate(${cx.toFixed(1)}, ${my.toFixed(1)})">
          <g class="avatar-talk-mouth ${phaseClass}">
            <path d="M -7 -1.5 Q 0 -0.5 7 -1.5 C 8 8.5 -8 8.5 -7 -1.5 Z" fill="#7f1d1d" stroke="#2a1810" stroke-width="2.3" stroke-linejoin="round"/>
            <ellipse cx="0" cy="4.2" rx="4.2" ry="2.3" fill="#fb7185"/>
          </g>
        </g>
      `;
    }

    // 3. GAFAS (ancladas exactamente al centro y separación de los dos ojos: cx, ey, es)
    const eyewearSvg = this.generateEyewearSVG(c.eyewear, c.eyewearColor);
    const txEye = cx - 60 * es;
    const tyEye = ey - 64 * es;

    // 4. SOMBREROS, CORONAS, CINTA NINJA Y AURICULARES (anclados al tope real de cada cabeza: cx, hatY, headW)
    const hCol = c.headwearColor || '#00f5d4';
    let headwearGroup = '';
    if (c.headwear === 'headphones') {
      const archTop = Math.max(-14, hatY - 34);
      const earY = ey - 6;
      headwearGroup = `
        <path d="M${(cx - headW + 4).toFixed(1)} ${earY} C${(cx - headW - 6).toFixed(1)} ${archTop} ${(cx + headW + 6).toFixed(1)} ${archTop} ${(cx + headW - 4).toFixed(1)} ${earY}" stroke="${hCol}" stroke-width="9" fill="none" stroke-linecap="round"/>
        <rect x="${(cx - headW - 10).toFixed(1)}" y="${earY - 18}" width="18" height="36" rx="9" fill="#111827" stroke="${hCol}" stroke-width="3"/>
        <rect x="${(cx + headW - 8).toFixed(1)}" y="${earY - 18}" width="18" height="36" rx="9" fill="#111827" stroke="${hCol}" stroke-width="3"/>
        <circle cx="${(cx - headW - 1).toFixed(1)}" cy="${earY}" r="4.5" fill="${hCol}"/>
        <circle cx="${(cx + headW + 1).toFixed(1)}" cy="${earY}" r="4.5" fill="${hCol}"/>
      `;
    } else if (c.headwear === 'ninja_band') {
      const bandY = ey - 28;
      const bwHead = headW * 0.88;
      headwearGroup = `
        <rect x="${(cx - bwHead).toFixed(1)}" y="${bandY - 8}" width="${(bwHead * 2).toFixed(1)}" height="16" rx="6" fill="${hCol}" stroke="#3b1d0e" stroke-width="2.8"/>
        <rect x="${(cx - 22).toFixed(1)}" y="${bandY - 6}" width="44" height="12" rx="3" fill="#cbd5e1" stroke="#3b1d0e" stroke-width="2"/>
        <circle cx="${(cx - 14).toFixed(1)}" cy="${bandY}" r="1.8" fill="#3b1d0e"/>
        <circle cx="${(cx + 14).toFixed(1)}" cy="${bandY}" r="1.8" fill="#3b1d0e"/>
      `;
    } else if (c.headwear && c.headwear !== 'none') {
      const headwearSvg = this.generateHeadwearSVG(c.headwear, hCol);
      const anchorY = (c.headwear === 'bow') ? 32 : 44;
      const txHat = cx - 60 * hs;
      const tyHat = hatY - anchorY * hs;
      headwearGroup = `<g transform="translate(${txHat.toFixed(1)}, ${tyHat.toFixed(1)}) scale(${hs})">${headwearSvg}</g>`;
    }

    return `
      <div class="mentix-avatar-wrapper" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center; position: relative;">
        <svg id="${uniqueId}" class="mentix-avatar-svg sprite-avatar ${emoteClass}" viewBox="0 0 240 260" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible; filter: drop-shadow(0 8px 12px rgba(0,0,0,0.35));">
          ${behind}
          <image href="assets/sprites/${animal}.png?v=2" x="0" y="0" width="240" height="260" style="${this.themeFilterCss(c.themeColor)}" />
          ${front}
          ${talkOverlay}
          ${exprOverlay}
          <g transform="translate(${txEye.toFixed(1)}, ${tyEye.toFixed(1)}) scale(${es.toFixed(2)})">
            ${eyewearSvg}
          </g>
          ${headwearGroup}
        </svg>
      </div>
    `;
  },

  // Iconos vectoriales ilustrados (NO emojis) para el menú rápido izquierdo y el panel derecho de prendas
  renderQuickMenuIconSVG(catKey) {
    switch (catKey) {
      case 'animal':
        return `<svg viewBox="0 0 48 48" width="32" height="32"><circle cx="14" cy="18" r="5" fill="#fb923c" stroke="#2a1810" stroke-width="2.2"/><circle cx="24" cy="13" r="5" fill="#fb923c" stroke="#2a1810" stroke-width="2.2"/><circle cx="34" cy="18" r="5" fill="#fb923c" stroke="#2a1810" stroke-width="2.2"/><path d="M14 31 C14 23 34 23 34 31 C34 37 28 39 24 39 C20 39 14 37 14 31 Z" fill="#fb923c" stroke="#2a1810" stroke-width="2.4"/></svg>`;
      case 'hat':
        return `<svg viewBox="0 0 48 48" width="34" height="34"><ellipse cx="24" cy="33" rx="19" ry="6" fill="#d946ef" stroke="#2a1810" stroke-width="2.4"/><path d="M13 32 C13 16 19 14 24 17 C29 14 35 16 35 32 Z" fill="#e879f9" stroke="#2a1810" stroke-width="2.4"/><path d="M13 29 Q24 33 35 29" stroke="#701a75" stroke-width="3.5" fill="none"/></svg>`;
      case 'shirt':
        return `<svg viewBox="0 0 48 48" width="34" height="34"><path d="M15 11 L8 18 L13 24 L16 20 L16 38 L32 38 L32 20 L35 24 L40 18 L33 11 Q24 16 15 11 Z" fill="#38bdf8" stroke="#2a1810" stroke-width="2.4" stroke-linejoin="round"/></svg>`;
      case 'palette':
        return `<svg viewBox="0 0 48 48" width="34" height="34"><path d="M24 9 C14 9 8 16 8 25 C8 34 15 39 23 39 C27 39 29 36 29 33 C29 30 27 29 29 27 C31 25 34 27 37 25 C40 23 40 18 37 14 C34 10 29 9 24 9 Z" fill="#f59e0b" stroke="#2a1810" stroke-width="2.4"/><circle cx="16" cy="21" r="3" fill="#ef4444"/><circle cx="22" cy="16" r="3" fill="#38bdf8"/><circle cx="29" cy="18" r="3" fill="#a855f7"/><circle cx="16" cy="29" r="3" fill="#10b981"/></svg>`;
      case 'glasses':
        return `<svg viewBox="0 0 48 48" width="34" height="34"><circle cx="15" cy="26" r="8" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="2.6"/><circle cx="33" cy="26" r="8" fill="rgba(56,189,248,0.25)" stroke="#38bdf8" stroke-width="2.6"/><line x1="23" y1="25" x2="25" y2="25" stroke="#38bdf8" stroke-width="2.6"/><path d="M7 25 L10 18 M41 25 L38 18" stroke="#38bdf8" stroke-width="2.2" stroke-linecap="round"/></svg>`;
      default:
        return '';
    }
  },

  renderItemIconSVG(prop, id, color = '#a855f7') {
    if (id === 'none') {
      return `<svg viewBox="0 0 64 64" width="44" height="44"><circle cx="32" cy="32" r="18" fill="rgba(255,255,255,0.06)" stroke="#64748b" stroke-width="3" stroke-dasharray="4,3"/><line x1="20" y1="20" x2="44" y2="44" stroke="#ef4444" stroke-width="3.5" stroke-linecap="round"/></svg>`;
    }
    if (prop === 'headwear') {
      return `<svg viewBox="14 6 92 56" width="52" height="52" style="overflow:visible;">${this.generateHeadwearSVG(id, color)}</svg>`;
    }
    if (prop === 'eyewear') {
      return `<svg viewBox="20 42 80 42" width="52" height="52" style="overflow:visible;">${this.generateEyewearSVG(id, color)}</svg>`;
    }
    if (prop === 'themeColor') {
      const gradMap = {
        default: ['#fb923c', '#f97316', '#ea580c'],
        neon_cyan: ['#67e8f9', '#00f5d4', '#0284c7'],
        pink_punk: ['#f9a8d4', '#f43f5e', '#be185d'],
        cyber_purple: ['#e879f9', '#a855f7', '#6d28d9'],
        golden: ['#fef08a', '#facc15', '#ca8a04'],
        midnight: ['#64748b', '#1e293b', '#0f172a'],
        arctic_white: ['#ffffff', '#e0f2fe', '#94a3b8'],
        emerald: ['#6ee7b7', '#10b981', '#047857']
      };
      const g = gradMap[id] || ['#f43f5e', '#facc15', '#38bdf8'];
      const gid = 'tg_' + id + '_' + Math.random().toString(36).substr(2, 4);
      return `<svg viewBox="0 0 64 64" width="46" height="46">
        <defs><linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${g[0]}"/><stop offset="50%" stop-color="${g[1]}"/><stop offset="100%" stop-color="${g[2]}"/>
        </linearGradient></defs>
        <rect x="10" y="10" width="44" height="44" rx="12" fill="url(#${gid})" stroke="#2a1810" stroke-width="3"/>
      </svg>`;
    }
    // Outfits (Ropa ilustrada con silueta gordita, curvas suaves y costuras como en la imagen de referencia)
    const S = '#2a1810';
    const tee = 'M 22 14 C 15 15 9 21 7 28 L 15 33 L 18 28 L 16 50 Q 32 54 48 50 L 46 28 L 49 33 L 57 28 C 55 21 49 15 42 14 Q 32 21 22 14 Z';
    const teeBackNeck = `<path d="M 22 14 Q 32 11 42 14 Q 32 21 22 14 Z" fill="#581c87" stroke="${S}" stroke-width="2.4"/>`;
    const teeSeams = `<path d="M 18 28 Q 19 22 20 18 M 46 28 Q 45 22 44 18" fill="none" stroke="${S}" stroke-width="2.4" stroke-linecap="round"/>`;
    switch (id) {
      case 'tshirt_purple':
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          ${teeBackNeck}
          <path d="${tee}" fill="#c084fc" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 16.5 41 Q 32 44 47.5 41 L 48 50 Q 32 54 16 50 Z" fill="#e879f9" opacity="0.85"/>
          <path d="M 16.5 41 Q 32 44 47.5 41" fill="none" stroke="${S}" stroke-width="2"/>
          ${teeSeams}
          <path d="${tee}" fill="none" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
        </svg>`;
      case 'vest_adventurer':
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          <path d="M 22 14 Q 32 11 42 14 Q 32 21 22 14 Z" fill="#b45309" stroke="${S}" stroke-width="2.4"/>
          <path d="${tee}" fill="#fde047" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 21 15 L 18 27 L 16 50 Q 23 52 29 51.5 L 29 24 Z" fill="#f43f5e" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/>
          <path d="M 43 15 L 46 27 L 48 50 Q 41 52 35 51.5 L 35 24 Z" fill="#f43f5e" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/>
          <polygon points="22,14 32,28 29,15" fill="#f59e0b" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
          <polygon points="42,14 32,28 35,15" fill="#f59e0b" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
          ${teeSeams}
        </svg>`;
      case 'shirt_cyan':
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          <path d="M 22 14 Q 32 11 42 14 Q 32 21 22 14 Z" fill="#0369a1" stroke="${S}" stroke-width="2.4"/>
          <path d="${tee}" fill="#38bdf8" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 29 18 L 35 18 L 34 51.5 L 30 51.5 Z" fill="#e0f2fe" stroke="${S}" stroke-width="2.2"/>
          <circle cx="23" cy="31" r="3" fill="#e0f2fe"/><circle cx="40" cy="29" r="2.8" fill="#e0f2fe"/><circle cx="41" cy="42" r="3" fill="#e0f2fe"/><circle cx="23" cy="43" r="2.6" fill="#e0f2fe"/>
          ${teeSeams}
          <path d="${tee}" fill="none" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
        </svg>`;
      case 'tshirt_rainbow': {
        const rg = 'rg_' + Math.random().toString(36).substr(2, 4);
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          <defs><linearGradient id="${rg}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f43f5e"/><stop offset="32%" stop-color="#facc15"/><stop offset="65%" stop-color="#4ade80"/><stop offset="85%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#c084fc"/>
          </linearGradient></defs>
          <path d="M 22 14 Q 32 11 42 14 Q 32 21 22 14 Z" fill="#be123c" stroke="${S}" stroke-width="2.4"/>
          <path d="${tee}" fill="url(#${rg})" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          ${teeSeams}
        </svg>`;
      }
      case 'jacket_brown':
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          <path d="M 22 14 Q 32 11 42 14 Q 32 21 22 14 Z" fill="#451a03" stroke="${S}" stroke-width="2.4"/>
          <path d="${tee}" fill="#b45309" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <line x1="32" y1="22" x2="32" y2="51.5" stroke="#ffffff" stroke-width="3"/>
          <polygon points="21,14 32,24 25,29" fill="#ffffff" stroke="${S}" stroke-width="2.3" stroke-linejoin="round"/>
          <polygon points="43,14 32,24 39,29" fill="#ffffff" stroke="${S}" stroke-width="2.3" stroke-linejoin="round"/>
          ${teeSeams}
        </svg>`;
      case 'hoodie':
        return `<svg viewBox="0 0 64 64" width="52" height="52">
          <path d="M 19 15 Q 32 7 45 15 Q 32 21 19 15 Z" fill="#1d4ed8" stroke="${S}" stroke-width="2.6"/>
          <path d="${tee}" fill="${color || '#3b82f6'}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 22 38 L 42 38 L 44 48 Q 32 50 20 48 Z" fill="rgba(0,0,0,0.24)" stroke="${S}" stroke-width="2.2" stroke-linejoin="round"/>
          <line x1="28" y1="19" x2="28" y2="31" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
          <line x1="36" y1="19" x2="36" y2="31" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>
          ${teeSeams}
        </svg>`;
      case 'bowtie':
        return `<svg viewBox="0 0 64 64" width="50" height="50">
          <path d="M 30 32 L 11 19 C 9 25 9 39 11 45 Z" fill="#ef4444" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 34 32 L 53 19 C 55 25 55 39 53 45 Z" fill="#ef4444" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="32" cy="32" r="6.5" fill="#f87171" stroke="${S}" stroke-width="2.8"/>
        </svg>`;
      case 'scarf':
        return `<svg viewBox="0 0 64 64" width="50" height="50">
          <path d="M 34 28 L 47 28 L 49 51 Q 41 54 33 51 Z" fill="#ea580c" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <line x1="34" y1="45" x2="48" y2="45" stroke="#fde047" stroke-width="3"/>
          <path d="M 11 20 Q 32 26 53 20 Q 56 27 51 33 Q 32 38 13 33 Q 8 27 11 20 Z" fill="#f97316" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
        </svg>`;
      case 'cape':
        return `<svg viewBox="0 0 64 64" width="50" height="50">
          <path d="M 19 14 Q 32 18 45 14 Q 54 32 56 51 Q 32 57 8 51 Q 10 32 19 14 Z" fill="#ef4444" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M 18 14 Q 32 20 46 14 Q 48 19 44 22 Q 32 26 20 22 Q 16 19 18 14 Z" fill="#dc2626" stroke="${S}" stroke-width="2.6" stroke-linejoin="round"/>
          <circle cx="32" cy="20" r="5.5" fill="#facc15" stroke="${S}" stroke-width="2.4"/>
        </svg>`;
      case 'medal':
        return `<svg viewBox="0 0 64 64" width="50" height="50">
          <polygon points="16,11 32,36 24,11" fill="#3b82f6" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <polygon points="48,11 32,36 40,11" fill="#ef4444" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          <circle cx="32" cy="42" r="13" fill="#facc15" stroke="${S}" stroke-width="3"/>
          <circle cx="32" cy="42" r="8.5" fill="#f59e0b"/>
          <polygon transform="translate(32, 42) scale(0.6)" points="0,-10 3,-3 10,-2 5,3 6,10 0,6 -6,10 -5,3 -10,-2 -3,-3" fill="#fef08a"/>
        </svg>`;
      default:
        return '';
    }
  },

  // Renderiza solo el icono de cabeza vectorial compacto para pills y listas
  renderIconSVG(cfg, size = 32) {
    const c = { ...this.defaultConfig, ...(cfg || {}) };
    const animal = c.animal || 'fox';
    if (this.spriteAnimals.includes(animal)) {
      return `<span style="display:inline-block;width:${size}px;height:${size}px;vertical-align:middle;background:url('assets/sprites/${animal}.png?v=2') center / contain no-repeat;${this.themeFilterCss(c.themeColor)}"></span>`;
    }
    const uniqueId = 'head_' + Math.random().toString(36).substr(2, 6);

    const theme = this.themeColorMap[c.themeColor];
    const baseAnimal = this.animals[animal] || this.animals.fox;
    const primary = theme?.primary || baseAnimal.primaryColor;
    const secondary = theme?.secondary || baseAnimal.secondaryColor;

    const headSvg = this.generateHeadSVG(animal, primary, secondary, c.expression);
    const headwearSvg = this.generateHeadwearSVG(c.headwear, c.headwearColor);
    const eyewearSvg = this.generateEyewearSVG(c.eyewear, c.eyewearColor);

    return `
      <svg viewBox="0 0 120 120" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" style="overflow: visible;">
        <g id="${uniqueId}">
          ${headSvg}
          ${eyewearSvg}
          ${headwearSvg}
        </g>
      </svg>
    `;
  },

  // =========================================================================
  // 🎨 MOTOR PROCEDURAL VECTORIAL COMPLETO CON ROTACIÓN 3D Y GESTOS
  // =========================================================================
  renderSVG(cfg, options = {}) {
    const c = { ...this.defaultConfig, ...(cfg || {}) };
    const size = options.size || 250;
    const emote = options.emote || c.emote || 'idle';
    const animal = c.animal || 'fox';
    const uniqueId = 'av_' + Math.random().toString(36).substr(2, 6);

    const theme = this.themeColorMap[c.themeColor];
    const baseAnimal = this.animals[animal] || this.animals.fox;
    const primary = theme?.primary || baseAnimal.primaryColor;
    const secondary = theme?.secondary || baseAnimal.secondaryColor;

    let emoteClass = 'anim-breathing';

    // Animales con arte ilustrado (sprites): se dibujan con el estilo bonito y animado
    if (this.spriteAnimals.includes(animal)) {
      return this.renderSpriteAvatar(c, animal, emote, size, uniqueId);
    }
    if (emote === 'wave') emoteClass = 'anim-wave';
    else if (emote === 'celebrate') emoteClass = 'anim-celebrate';
    else if (emote === 'dance') emoteClass = 'anim-dance';
    else if (emote === 'laugh') emoteClass = 'anim-laugh';
    else if (emote === 'victory') emoteClass = 'anim-victory';
    else if (emote === 'focus') emoteClass = 'anim-focus';
    else if (emote === 'clap') emoteClass = 'anim-clap';

    const headSvg = this.generateHeadSVG(animal, primary, secondary, c.expression);
    const headwearSvg = this.generateHeadwearSVG(c.headwear, c.headwearColor);
    const eyewearSvg = this.generateEyewearSVG(c.eyewear, c.eyewearColor);
    const outfitSvg = this.generateOutfitSVG(c.outfit, c.outfitColor, primary, secondary, animal);
    const armsSvg = this.generateArmsSVG(emote, primary);
    const tailSvg = this.generateTailSVG(animal, primary, secondary);
    const legsSvg = this.generateLegsSVG(primary, animal);

    return `
      <div class="mentix-avatar-wrapper" style="width: ${size}px; height: ${size}px; display: inline-flex; align-items: center; justify-content: center; position: relative;">
        <svg 
          id="${uniqueId}" 
          class="mentix-avatar-svg ${emoteClass}" 
          viewBox="0 0 240 260" 
          width="${size}" 
          height="${size}" 
          xmlns="http://www.w3.org/2000/svg"
          style="filter: drop-shadow(0 10px 18px rgba(0,0,0,0.5)); overflow: visible;"
        >
          <defs>
            <radialGradient id="shadow_${uniqueId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="rgba(0,0,0,0.45)" />
              <stop offset="100%" stop-color="rgba(0,0,0,0)" />
            </radialGradient>
          </defs>

          <!-- Sombra proyectada en el suelo -->
          <ellipse cx="120" cy="242" rx="58" ry="10" fill="url(#shadow_${uniqueId})" />

          <!-- Cola, piernas, cuerpo y brazos -->
          ${tailSvg}
          ${legsSvg}
          <g class="avatar-body-group">
            ${outfitSvg}
            ${armsSvg}
          </g>

          <!-- Cabeza grande estilo chibi -->
          <g transform="translate(51, 8) scale(1.15)">
            ${headSvg}
            ${eyewearSvg}
            ${headwearSvg}
          </g>
        </svg>
      </div>
    `;
  },

  // Genera la cabeza específica de cada animal estilo Kahoot
  generateHeadSVG(animal, primary, secondary, expression) {
    let eyesSvg = '';
    switch (expression) {
      case 'wink':
        eyesSvg = `
          <!-- Ojo izquierdo normal -->
          <ellipse cx="44" cy="62" rx="4.5" ry="6.5" fill="#111111" />
          <circle cx="42.5" cy="60" r="1.8" fill="#ffffff" />
          <!-- Ojo derecho guiño -->
          <path d="M70 63 Q76 57 82 63" stroke="#111111" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
        break;
      case 'star_eyes':
        eyesSvg = `
          <!-- Ojos de estrellas emocionadas -->
          <polygon points="44,54 46,60 52,61 47,65 49,71 44,67 39,71 41,65 36,61 42,60" fill="#ffd166" stroke="#111" stroke-width="1"/>
          <polygon points="76,54 78,60 84,61 79,65 81,71 76,67 71,71 73,65 68,61 74,60" fill="#ffd166" stroke="#111" stroke-width="1"/>
        `;
        break;
      case 'cool':
        eyesSvg = `
          <ellipse cx="44" cy="62" rx="4.5" ry="6" fill="#111111" />
          <circle cx="42.5" cy="60" r="1.8" fill="#ffffff" />
          <ellipse cx="76" cy="62" rx="4.5" ry="6" fill="#111111" />
          <circle cx="74.5" cy="60" r="1.8" fill="#ffffff" />
          <!-- Cejas pro -->
          <path d="M38 52 L50 55" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
          <path d="M82 52 L70 55" stroke="#111" stroke-width="2.5" stroke-linecap="round"/>
        `;
        break;
      case 'focused':
        eyesSvg = `
          <ellipse cx="45" cy="63" rx="4" ry="5.5" fill="#111111" />
          <ellipse cx="75" cy="63" rx="4" ry="5.5" fill="#111111" />
          <path d="M38 54 L52 57" stroke="#111" stroke-width="2.8" stroke-linecap="round"/>
          <path d="M82 54 L68 57" stroke="#111" stroke-width="2.8" stroke-linecap="round"/>
        `;
        break;
      case 'happy':
      default:
        eyesSvg = `
          <ellipse cx="44" cy="62" rx="4.5" ry="6.5" fill="#111111" />
          <circle cx="42.5" cy="60" r="1.8" fill="#ffffff" />
          <ellipse cx="76" cy="62" rx="4.5" ry="6.5" fill="#111111" />
          <circle cx="74.5" cy="60" r="1.8" fill="#ffffff" />
        `;
    }

    switch (animal) {
      // 1. Zorro / Fox (Exacto como en la captura del usuario!)
      case 'fox':
        return `
          <!-- Orejas triangulares con puntas negras y centro blanco -->
          <polygon points="26,18 48,58 14,50" fill="${primary}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
          <polygon points="26,18 36,38 20,34" fill="#111111" />
          <polygon points="28,28 44,55 20,49" fill="${secondary}" />

          <polygon points="94,18 106,50 72,58" fill="${primary}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
          <polygon points="94,18 100,34 84,38" fill="#111111" />
          <polygon points="92,28 100,49 76,55" fill="${secondary}" />

          <!-- Cabeza base naranja del zorro -->
          <path d="M28 52 Q60 36 92 52 Q102 78 92 98 Q60 124 28 98 Q18 78 28 52 Z" fill="${primary}" stroke="#111" stroke-width="2.8" stroke-linejoin="round"/>

          <!-- Mejillas blancas flanqueadas hacia afuera (estilo exacto del pantallazo) -->
          <path d="M22 78 Q12 88 24 98 Q42 110 60 120 Q78 110 96 98 Q108 88 98 78 Q84 90 60 92 Q36 90 22 78 Z" fill="${secondary}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>

          <!-- Hocico blanco central -->
          <path d="M48 82 Q60 76 72 82 Q72 104 60 120 Q48 104 48 82 Z" fill="${secondary}" />

          <!-- Ojos -->
          ${eyesSvg}

          <!-- Nariz de botón negro -->
          <path d="M56 102 Q60 99 64 102 Q64 108 60 109 Q56 108 56 102 Z" fill="#111111" />
          <line x1="60" y1="109" x2="60" y2="114" stroke="#111" stroke-width="1.8" />
        `;

      // 2. Panda
      case 'panda':
        return `
          <!-- Orejas negras redondas -->
          <circle cx="28" cy="38" r="16" fill="#1a1a1a" stroke="#111" stroke-width="2.5" />
          <circle cx="92" cy="38" r="16" fill="#1a1a1a" stroke="#111" stroke-width="2.5" />

          <!-- Cabeza blanca redonda -->
          <ellipse cx="60" cy="74" rx="42" ry="38" fill="${primary}" stroke="#111" stroke-width="2.8" />

          <!-- Manchas negras ovaladas en los ojos -->
          <ellipse cx="44" cy="70" rx="12" ry="15" fill="#1a1a1a" transform="rotate(-15 44 70)" />
          <ellipse cx="76" cy="70" rx="12" ry="15" fill="#1a1a1a" transform="rotate(15 76 70)" />

          <!-- Ojos con brillo blanco -->
          <ellipse cx="44" cy="70" rx="4.5" ry="6" fill="#ffffff" />
          <circle cx="44" cy="70" r="3" fill="#111111" />
          <circle cx="43" cy="68" r="1.2" fill="#ffffff" />

          <ellipse cx="76" cy="70" rx="4.5" ry="6" fill="#ffffff" />
          <circle cx="76" cy="70" r="3" fill="#111111" />
          <circle cx="75" cy="68" r="1.2" fill="#ffffff" />

          <!-- Nariz y boca panda -->
          <ellipse cx="60" cy="88" rx="6" ry="4.5" fill="#111111" />
          <path d="M54 94 Q60 99 66 94" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
        `;

      // 3. Gato / Cat
      case 'cat':
        return `
          <!-- Orejas triangulares felinas -->
          <polygon points="26,24 48,56 18,52" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="28,32 44,52 24,49" fill="#f472b6" />

          <polygon points="94,24 102,52 72,56" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="92,32 96,49 76,52" fill="#f472b6" />

          <!-- Cabeza del gato -->
          <ellipse cx="60" cy="72" rx="42" ry="36" fill="${primary}" stroke="#111" stroke-width="2.8"/>
          <!-- Hocico blanco -->
          <ellipse cx="53" cy="85" rx="10" ry="7" fill="${secondary}" />
          <ellipse cx="67" cy="85" rx="10" ry="7" fill="${secondary}" />

          ${eyesSvg}

          <!-- Nariz rosada y boca -->
          <polygon points="57,80 63,80 60,85" fill="#f472b6" />
          <path d="M53 88 Q60 92 67 88" stroke="#111" stroke-width="1.8" fill="none"/>

          <!-- Bigotes -->
          <line x1="22" y1="80" x2="38" y2="83" stroke="#111" stroke-width="1.6"/>
          <line x1="22" y1="88" x2="38" y2="87" stroke="#111" stroke-width="1.6"/>
          <line x1="98" y1="80" x2="82" y2="83" stroke="#111" stroke-width="1.6"/>
          <line x1="98" y1="88" x2="82" y2="87" stroke="#111" stroke-width="1.6"/>
        `;

      // 4. Perro / Pug
      case 'dog':
        return `
          <!-- Orejas caídas suaves -->
          <path d="M22 46 C12 60 16 88 28 84 C34 76 34 56 30 46 Z" fill="#78350f" stroke="#111" stroke-width="2.5"/>
          <path d="M98 46 C108 60 104 88 92 84 C86 76 86 56 90 46 Z" fill="#78350f" stroke="#111" stroke-width="2.5"/>

          <!-- Cabeza redonda -->
          <ellipse cx="60" cy="72" rx="40" ry="38" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Mancha oscura del hocico -->
          <ellipse cx="60" cy="86" rx="20" ry="15" fill="#451a03" />

          ${eyesSvg}

          <!-- Nariz negra y lengua simpática -->
          <ellipse cx="60" cy="82" rx="7" ry="5" fill="#111111" />
          <path d="M54 88 Q60 94 66 88" stroke="#111" stroke-width="2" fill="none"/>
          <path d="M58 92 C58 100 62 100 62 92 Z" fill="#f43f5e" />
        `;

      // 5. León
      case 'lion':
        return `
          <!-- Melena majestuosa circular -->
          <circle cx="60" cy="72" r="48" fill="${secondary}" stroke="#111" stroke-width="3"/>
          <circle cx="34" cy="42" r="12" fill="${secondary}" />
          <circle cx="86" cy="42" r="12" fill="${secondary}" />

          <!-- Cara del león -->
          <ellipse cx="60" cy="74" rx="34" ry="32" fill="${primary}" stroke="#111" stroke-width="2.5"/>

          <!-- Orejas -->
          <circle cx="36" cy="50" r="9" fill="${primary}" stroke="#111" stroke-width="2"/>
          <circle cx="84" cy="50" r="9" fill="${primary}" stroke="#111" stroke-width="2"/>

          <!-- Hocico y nariz -->
          <ellipse cx="60" cy="86" rx="14" ry="10" fill="#ffffff" />
          <polygon points="56,80 64,80 60,86" fill="#b45309" />
          <path d="M54 90 Q60 94 66 90" stroke="#111" stroke-width="2" fill="none"/>

          ${eyesSvg}
        `;

      // 6. Conejo / Rabbit
      case 'rabbit':
        return `
          <!-- Orejas largas verticales con interior rosa -->
          <ellipse cx="38" cy="24" rx="10" ry="26" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <ellipse cx="38" cy="24" rx="5" ry="18" fill="#f472b6" />

          <ellipse cx="82" cy="24" rx="10" ry="26" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <ellipse cx="82" cy="24" rx="5" ry="18" fill="#f472b6" />

          <!-- Cabeza -->
          <ellipse cx="60" cy="76" rx="38" ry="34" fill="${primary}" stroke="#111" stroke-width="2.8"/>
          <!-- Mejillas rosadas -->
          <circle cx="32" cy="80" r="6" fill="#fbcfe8" />
          <circle cx="88" cy="80" r="6" fill="#fbcfe8" />

          <!-- Dientes de conejo -->
          <rect x="57" y="93" width="6" height="6" rx="1" fill="#ffffff" stroke="#111" stroke-width="1.2"/>

          <!-- Nariz rosa y boca -->
          <polygon points="57,84 63,84 60,88" fill="#ec4899" />
          <path d="M54 91 Q60 94 66 91" stroke="#111" stroke-width="1.8" fill="none"/>

          ${eyesSvg}
        `;

      // 7. Koala
      case 'koala':
        return `
          <!-- Orejas grandes y peludas -->
          <circle cx="22" cy="52" r="20" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <circle cx="22" cy="52" r="12" fill="${secondary}" />

          <circle cx="98" cy="52" r="20" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <circle cx="98" cy="52" r="12" fill="${secondary}" />

          <!-- Cabeza -->
          <ellipse cx="60" cy="74" rx="40" ry="35" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Gran nariz ovalada clásica de koala -->
          <ellipse cx="60" cy="80" rx="12" ry="16" fill="#1e293b" />
          <ellipse cx="58" cy="74" rx="3.5" ry="5" fill="rgba(255,255,255,0.25)" />

          ${eyesSvg}
        `;

      // 8. Búho / Owl
      case 'owl':
        return `
          <!-- Plumitas de las orejas -->
          <polygon points="34,36 46,52 26,50" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="86,36 94,50 74,52" fill="${primary}" stroke="#111" stroke-width="2.5"/>

          <!-- Cabeza redondeada -->
          <ellipse cx="60" cy="72" rx="40" ry="38" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Grandes círculos de ojos de búho inteligente -->
          <circle cx="44" cy="68" r="17" fill="#ffffff" stroke="#111" stroke-width="2.5"/>
          <circle cx="76" cy="68" r="17" fill="#ffffff" stroke="#111" stroke-width="2.5"/>

          <circle cx="44" cy="68" r="9" fill="${secondary}" />
          <circle cx="76" cy="68" r="9" fill="${secondary}" />

          <circle cx="44" cy="68" r="5" fill="#111111" />
          <circle cx="76" cy="68" r="5" fill="#111111" />
          <circle cx="42" cy="66" r="1.8" fill="#ffffff" />
          <circle cx="74" cy="66" r="1.8" fill="#ffffff" />

          <!-- Pico dorado -->
          <polygon points="57,76 63,76 60,86" fill="#f59e0b" stroke="#111" stroke-width="1.8"/>
        `;

      // 9. Mono / Monkey
      case 'monkey':
        return `
          <!-- Orejas redondas laterales -->
          <circle cx="18" cy="70" r="16" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <circle cx="18" cy="70" r="9" fill="${secondary}" />

          <circle cx="102" cy="70" r="16" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <circle cx="102" cy="70" r="9" fill="${secondary}" />

          <!-- Cabeza -->
          <circle cx="60" cy="70" r="38" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Máscara de cara clara -->
          <path d="M36 65 C36 50 50 48 60 58 C70 48 84 50 84 65 C84 85 75 92 60 92 C45 92 36 85 36 65 Z" fill="${secondary}" />

          ${eyesSvg}

          <circle cx="56" cy="78" r="1.8" fill="#111" />
          <circle cx="64" cy="78" r="1.8" fill="#111" />
          <path d="M50 84 Q60 90 70 84" stroke="#111" stroke-width="2" fill="none" stroke-linecap="round"/>
        `;

      // 10. Lobo / Wolf
      case 'wolf':
        return `
          <!-- Orejas afiladas de lobo -->
          <polygon points="26,18 46,54 18,48" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="28,26 42,50 22,46" fill="${secondary}" />

          <polygon points="94,18 102,48 74,54" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="92,26 98,46 78,50" fill="${secondary}" />

          <!-- Cabeza con mechones laterales -->
          <path d="M28 50 Q60 38 92 50 L98 74 L88 78 L96 92 L76 102 L60 114 L44 102 L24 92 L32 78 L22 74 Z" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <path d="M38 78 Q60 90 82 78 L60 112 Z" fill="${secondary}" />

          ${eyesSvg}

          <polygon points="56,92 64,92 60,98" fill="#111111" />
        `;

      // 11. Pingüino
      case 'penguin':
        return `
          <!-- Cabeza de pingüino negro y máscara blanca -->
          <ellipse cx="60" cy="72" rx="38" ry="40" fill="${primary}" stroke="#111" stroke-width="2.8"/>
          <!-- Cara blanca corazón -->
          <path d="M32 68 C32 48 48 48 60 60 C72 48 88 48 88 68 C88 95 76 104 60 104 C44 104 32 95 32 68 Z" fill="${secondary}" />

          ${eyesSvg}

          <!-- Pico naranja brillante -->
          <polygon points="53,78 67,78 60,90" fill="#f97316" stroke="#111" stroke-width="2"/>
        `;

      // 12. Unicornio
      case 'unicorn':
        return `
          <!-- Cuerno dorado en espiral mágico -->
          <polygon points="60,6 54,42 66,42" fill="${secondary}" stroke="#111" stroke-width="2"/>
          <line x1="56" y1="30" x2="64" y2="24" stroke="#d97706" stroke-width="1.8"/>
          <line x1="57" y1="18" x2="63" y2="14" stroke="#d97706" stroke-width="1.8"/>

          <!-- Orejas -->
          <polygon points="32,24 48,50 24,46" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <polygon points="88,24 96,46 72,50" fill="${primary}" stroke="#111" stroke-width="2.5"/>

          <!-- Cabeza -->
          <ellipse cx="60" cy="72" rx="36" ry="34" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Mechones de melena pastel -->
          <path d="M42 38 Q50 22 58 36" stroke="#a855f7" stroke-width="4" fill="none" stroke-linecap="round"/>
          <path d="M62 38 Q70 22 78 36" stroke="#38bdf8" stroke-width="4" fill="none" stroke-linecap="round"/>

          ${eyesSvg}

          <!-- Hocico -->
          <ellipse cx="60" cy="90" rx="14" ry="10" fill="#fdf2f8" />
          <circle cx="56" cy="88" r="1.8" fill="#111" />
          <circle cx="64" cy="88" r="1.8" fill="#111" />
        `;

      // 13. Robot
      case 'robot':
        return `
          <!-- Antena con foco de luz -->
          <line x1="60" y1="34" x2="60" y2="16" stroke="#111" stroke-width="3" />
          <circle cx="60" cy="14" r="7" fill="#00f5d4" stroke="#111" stroke-width="2"/>

          <!-- Orejas / Tornillos laterales -->
          <rect x="14" y="62" width="10" height="18" rx="3" fill="#64748b" stroke="#111" stroke-width="2"/>
          <rect x="96" y="62" width="10" height="18" rx="3" fill="#64748b" stroke="#111" stroke-width="2"/>

          <!-- Cabeza metálica redondeada -->
          <rect x="24" y="34" width="72" height="66" rx="14" fill="${primary}" stroke="#111" stroke-width="2.8"/>

          <!-- Pantalla visor ocular -->
          <rect x="34" y="48" width="52" height="26" rx="8" fill="#030712" stroke="#00f5d4" stroke-width="2"/>
          <line x1="38" y1="61" x2="82" y2="61" stroke="#00f5d4" stroke-width="3" stroke-linecap="round"/>
          <circle cx="48" cy="61" r="3.5" fill="#00f5d4" />
          <circle cx="72" cy="61" r="3.5" fill="#00f5d4" />

          <!-- Rejilla de boca -->
          <rect x="44" y="82" width="32" height="8" rx="3" fill="#1e293b" />
          <line x1="52" y1="82" x2="52" y2="90" stroke="#00f5d4" stroke-width="1.5"/>
          <line x1="60" y1="82" x2="60" y2="90" stroke="#00f5d4" stroke-width="1.5"/>
          <line x1="68" y1="82" x2="68" y2="90" stroke="#00f5d4" stroke-width="1.5"/>
        `;

      // Default / Tigre / Oso
      default:
        return `
          <circle cx="28" cy="40" r="14" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <circle cx="92" cy="40" r="14" fill="${primary}" stroke="#111" stroke-width="2.5"/>
          <ellipse cx="60" cy="72" rx="40" ry="36" fill="${primary}" stroke="#111" stroke-width="2.8"/>
          <ellipse cx="60" cy="85" rx="16" ry="12" fill="${secondary}" />
          ${eyesSvg}
          <polygon points="56,80 64,80 60,86" fill="#111" />
        `;
    }
  },

  // Gorros y accesorios para la cabeza (ilustración cartoon 2D con contorno grueso #2a1810, anclado en (60, 44))
  generateHeadwearSVG(headwear, color = '#00f5d4') {
    const S = '#2a1810';
    switch (headwear) {
      case 'fedora':
        return `
          <!-- Sombrero Fedora marrón clásico con cinta -->
          <ellipse cx="60" cy="44" rx="46" ry="10" fill="#8b5a2b" stroke="${S}" stroke-width="3.2"/>
          <path d="M22 43 Q60 51 98 43" fill="none" stroke="#6b421b" stroke-width="2.5"/>
          <path d="M30 43 C32 18 44 14 60 16 C76 14 88 18 90 43 Z" fill="#a66c38" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M44 18 Q60 24 76 18" fill="none" stroke="#78491d" stroke-width="3" stroke-linecap="round"/>
          <path d="M31 36 Q60 42 89 36 L90 42 Q60 48 30 42 Z" fill="#4a2c11" stroke="${S}" stroke-width="2.2"/>
        `;
      case 'bucket_hat':
        return `
          <!-- Sombrero pescador marrón con franja azul -->
          <path d="M14 44 Q60 34 106 44 Q98 53 60 51 Q22 53 14 44 Z" fill="#9c6635" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M28 41 L34 18 Q60 13 86 18 L92 41 Z" fill="#b07540" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M29 33 Q60 38 91 33 L92 40 Q60 45 28 40 Z" fill="#3b82f6" stroke="${S}" stroke-width="2.4"/>
          <path d="M38 22 Q60 19 82 22" fill="none" stroke="rgba(255,255,255,0.28)" stroke-width="2.5" stroke-linecap="round"/>
        `;
      case 'gamer_cap':
        return `
          <!-- Gorra deportiva amarilla/naranja con visera -->
          <path d="M24 44 C24 16 96 16 96 44 Z" fill="${color === '#00f5d4' ? '#fbbf24' : color}" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M44 19 C44 26 42 36 42 44 M76 19 C76 26 78 36 78 44" stroke="rgba(0,0,0,0.18)" stroke-width="2" fill="none"/>
          <path d="M20 42 Q60 36 104 43 Q112 49 88 51 Q54 48 20 42 Z" fill="#d97706" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="60" cy="18" r="4" fill="#d97706" stroke="${S}" stroke-width="2.4"/>
        `;
      case 'beret':
        return `
          <!-- Boina francesa rosa/coral -->
          <path d="M26 44 Q16 30 34 20 Q64 10 96 22 Q110 30 92 44 Z" fill="${color === '#00f5d4' ? '#fb7185' : color}" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <rect x="28" y="40" width="64" height="7" rx="3.5" fill="#e11d48" stroke="${S}" stroke-width="2.6"/>
          <path d="M58 15 L63 8" stroke="${S}" stroke-width="3.2" stroke-linecap="round"/>
          <ellipse cx="52" cy="24" rx="16" ry="5" fill="rgba(255,255,255,0.28)" transform="rotate(-10 52 24)"/>
        `;
      case 'red_cap':
        return `
          <!-- Gorra roja con visera frontal e insignia blanca -->
          <path d="M24 43 C24 15 96 15 96 43 Z" fill="#ef4444" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <circle cx="60" cy="29" r="6.5" fill="#ffffff" stroke="${S}" stroke-width="2.2"/>
          <path d="M18 42 Q60 35 102 42 Q94 52 60 51 Q26 52 18 42 Z" fill="#dc2626" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="60" cy="16" r="3.5" fill="#dc2626" stroke="${S}" stroke-width="2.2"/>
        `;
      case 'captain_cap':
        return `
          <!-- Gorra de capitán púrpura/azul con cinta dorada e insignia -->
          <path d="M18 30 C18 14 102 14 102 30 L92 42 L28 42 Z" fill="#7c3aed" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <rect x="28" y="36" width="64" height="7" rx="2" fill="#fbbf24" stroke="${S}" stroke-width="2.5"/>
          <path d="M24 43 Q60 52 96 43 L92 40 Q60 44 28 40 Z" fill="#1e293b" stroke="${S}" stroke-width="2.8" stroke-linejoin="round"/>
          <circle cx="60" cy="28" r="5.5" fill="#fbbf24" stroke="${S}" stroke-width="2.2"/>
        `;
      case 'sun_hat':
        return `
          <!-- Sombrero de sol amarillo dorado de ala ancha -->
          <ellipse cx="60" cy="43" rx="48" ry="11" fill="#f59e0b" stroke="${S}" stroke-width="3.2"/>
          <path d="M30 42 C32 18 88 18 90 42 Z" fill="#fbbf24" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M30 35 Q60 41 90 35 L90 41 Q60 47 30 41 Z" fill="#d97706" stroke="${S}" stroke-width="2.4"/>
          <ellipse cx="52" cy="26" rx="14" ry="4.5" fill="rgba(255,255,255,0.32)"/>
        `;
      case 'flower_bucket':
        return `
          <!-- Sombrero lila coquette con cinta y lazo -->
          <path d="M16 44 Q60 35 104 44 Q96 53 60 51 Q24 53 16 44 Z" fill="#a855f7" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M28 41 L34 19 Q60 14 86 19 L92 41 Z" fill="#c084fc" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M29 34 Q60 39 91 34 L92 40 Q60 45 28 40 Z" fill="#7e22ce" stroke="${S}" stroke-width="2.4"/>
          <polygon points="75,37 65,31 65,43" fill="#f472b6" stroke="${S}" stroke-width="2"/>
          <polygon points="79,37 89,31 89,43" fill="#f472b6" stroke="${S}" stroke-width="2"/>
          <circle cx="77" cy="37" r="3.5" fill="#fbcfe8" stroke="${S}" stroke-width="2"/>
        `;
      case 'headphones':
        return `
          <path d="M18 64 C12 20 108 20 102 64" stroke="${color}" stroke-width="7" fill="none" stroke-linecap="round"/>
          <path d="M18 64 C12 20 108 20 102 64" stroke="${S}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
          <rect x="10" y="54" width="14" height="26" rx="7" fill="#1e293b" stroke="${S}" stroke-width="2.8"/>
          <rect x="96" y="54" width="14" height="26" rx="7" fill="#1e293b" stroke="${S}" stroke-width="2.8"/>
          <circle cx="17" cy="67" r="4" fill="${color}" />
          <circle cx="103" cy="67" r="4" fill="${color}" />
        `;
      case 'party_hat':
        return `
          <polygon points="60,2 38,44 82,44" fill="${color}" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M44 32 L76 32 M49 20 L71 20" stroke="#ffd166" stroke-width="4" stroke-linecap="round"/>
          <circle cx="60" cy="4" r="7" fill="#ffd166" stroke="${S}" stroke-width="2.6"/>
        `;
      case 'crown':
        return `
          <polygon points="30,44 36,20 48,34 60,14 72,34 84,20 90,44" fill="#ffd166" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <rect x="30" y="39" width="60" height="6" rx="2" fill="#f59e0b" stroke="${S}" stroke-width="2.4"/>
          <circle cx="36" cy="20" r="3.5" fill="#ef4444" stroke="${S}" stroke-width="1.8"/>
          <circle cx="60" cy="14" r="4" fill="#3b82f6" stroke="${S}" stroke-width="1.8"/>
          <circle cx="84" cy="20" r="3.5" fill="#10b981" stroke="${S}" stroke-width="1.8"/>
        `;
      case 'grad_hat':
        return `
          <polygon points="60,20 14,34 60,46 106,34" fill="#1e293b" stroke="${S}" stroke-width="3.2" stroke-linejoin="round"/>
          <path d="M38 40 L38 50 Q60 56 82 50 L82 40" fill="#334155" stroke="${S}" stroke-width="2.8"/>
          <circle cx="60" cy="33" r="4" fill="#ffd166" stroke="${S}" stroke-width="2"/>
          <path d="M60 33 Q82 36 88 52" stroke="#ffd166" stroke-width="3" fill="none" stroke-linecap="round"/>
        `;
      case 'ninja_band':
        return `
          <path d="M20 44 Q60 48 100 44 L98 56 Q60 60 22 56 Z" fill="${color}" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <rect x="44" y="45" width="32" height="11" rx="3" fill="#e2e8f0" stroke="${S}" stroke-width="2.4"/>
          <circle cx="49" cy="50.5" r="1.5" fill="${S}"/>
          <circle cx="71" cy="50.5" r="1.5" fill="${S}"/>
        `;
      case 'beanie':
        return `
          <path d="M24 46 C22 18 98 18 96 46 Z" fill="${color}" stroke="${S}" stroke-width="3.2"/>
          <rect x="20" y="40" width="80" height="12" rx="6" fill="#f8fafc" stroke="${S}" stroke-width="3"/>
          <circle cx="60" cy="16" r="7.5" fill="#f8fafc" stroke="${S}" stroke-width="2.8"/>
        `;
      case 'bow':
        return `
          <path d="M58 34 L34 20 C28 26 28 40 34 46 Z" fill="#f43f5e" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M62 34 L86 20 C92 26 92 40 86 46 Z" fill="#f43f5e" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <circle cx="60" cy="34" r="6.5" fill="#fb7185" stroke="${S}" stroke-width="2.8"/>
        `;
      case 'none':
      default:
        return '';
    }
  },

  // Gafas y accesorios de ojos (ilustración cartoon 2D con contorno grueso #2a1810, anclado en (60, 64))
  generateEyewearSVG(eyewear, color = '#111111') {
    const S = '#2a1810';
    switch (eyewear) {
      case 'retro_shades':
        return `
          <!-- Gafas retro montura rosa/roja con cristales celestes -->
          <rect x="26" y="54" width="30" height="20" rx="6" fill="#38bdf8" stroke="#f43f5e" stroke-width="4.2"/>
          <rect x="64" y="54" width="30" height="20" rx="6" fill="#38bdf8" stroke="#f43f5e" stroke-width="4.2"/>
          <rect x="24.5" y="52.5" width="33" height="23" rx="7.5" fill="none" stroke="${S}" stroke-width="2.4"/>
          <rect x="62.5" y="52.5" width="33" height="23" rx="7.5" fill="none" stroke="${S}" stroke-width="2.4"/>
          <line x1="56" y1="62" x2="64" y2="62" stroke="#f43f5e" stroke-width="4.5"/>
          <line x1="56" y1="60" x2="64" y2="60" stroke="${S}" stroke-width="2"/>
          <line x1="31" y1="58" x2="40" y2="69" stroke="rgba(255,255,255,0.65)" stroke-width="2.6" stroke-linecap="round"/>
          <line x1="69" y1="58" x2="78" y2="69" stroke="rgba(255,255,255,0.65)" stroke-width="2.6" stroke-linecap="round"/>
        `;
      case 'sunglasses':
        return `
          <!-- Gafas de sol negras pro gamer -->
          <path d="M26 55 L56 55 L52 73 L30 73 Z" fill="#111827" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <path d="M64 55 L94 55 L90 73 L68 73 Z" fill="#111827" stroke="${S}" stroke-width="3" stroke-linejoin="round"/>
          <line x1="55" y1="61" x2="65" y2="61" stroke="${S}" stroke-width="3.5"/>
          <line x1="31" y1="59" x2="45" y2="69" stroke="rgba(255,255,255,0.5)" stroke-width="2.4" stroke-linecap="round"/>
          <line x1="69" y1="59" x2="83" y2="69" stroke="rgba(255,255,255,0.5)" stroke-width="2.4" stroke-linecap="round"/>
        `;
      case 'nerd_glasses':
        return `
          <circle cx="43" cy="64" r="14" fill="rgba(255,255,255,0.22)" stroke="${color === '#111111' ? '#3b82f6' : color}" stroke-width="3.8"/>
          <circle cx="77" cy="64" r="14" fill="rgba(255,255,255,0.22)" stroke="${color === '#111111' ? '#3b82f6' : color}" stroke-width="3.8"/>
          <circle cx="43" cy="64" r="15.5" fill="none" stroke="${S}" stroke-width="2"/>
          <circle cx="77" cy="64" r="15.5" fill="none" stroke="${S}" stroke-width="2"/>
          <line x1="57" y1="64" x2="63" y2="64" stroke="${S}" stroke-width="3.5"/>
        `;
      case 'cyber_visor':
        return `
          <rect x="24" y="55" width="72" height="17" rx="7" fill="#0f172a" stroke="#00f5d4" stroke-width="3.2"/>
          <rect x="22.5" y="53.5" width="75" height="20" rx="8.5" fill="none" stroke="${S}" stroke-width="2.2"/>
          <line x1="30" y1="63.5" x2="90" y2="63.5" stroke="#00f5d4" stroke-width="2.5" stroke-dasharray="5,3"/>
        `;
      case 'monocle':
        return `
          <circle cx="76" cy="64" r="13.5" fill="rgba(56,189,248,0.22)" stroke="#fbbf24" stroke-width="3.5"/>
          <circle cx="76" cy="64" r="15" fill="none" stroke="${S}" stroke-width="2"/>
          <path d="M89 64 Q96 82 90 98" stroke="#fbbf24" stroke-width="2.2" fill="none"/>
        `;
      case 'pirate_patch':
        return `
          <line x1="24" y1="48" x2="96" y2="74" stroke="${S}" stroke-width="3.5"/>
          <ellipse cx="76" cy="64" rx="13" ry="14" fill="#1e293b" stroke="${S}" stroke-width="3"/>
        `;
      case 'none':
      default:
        return '';
    }
  },

  // Cola del animal (detrás del cuerpo) con movimiento
  generateTailSVG(animal, primary = '#f45d22', secondary = '#ffffff') {
    const S = '#111';
    switch (animal) {
      case 'fox':
        return `
          <g class="avatar-tail">
            <path d="M146 206 C 196 226 238 192 220 136 C 213 116 192 122 192 142 C 192 168 174 188 146 192 Z" fill="${primary}" stroke="${S}" stroke-width="2.8" stroke-linejoin="round"/>
            <path d="M220 136 C 213 116 192 122 192 142 C 192 152 194 160 198 166 C 212 164 224 152 220 136 Z" fill="${secondary}" stroke="${S}" stroke-width="2.4" stroke-linejoin="round"/>
          </g>`;
      case 'cat': case 'tiger': case 'lion': case 'dog': case 'wolf': case 'unicorn': case 'dragon':
        return `
          <g class="avatar-tail">
            <path d="M150 208 C 190 216 214 190 206 156" stroke="${S}" stroke-width="18" fill="none" stroke-linecap="round"/>
            <path d="M150 208 C 190 216 214 190 206 156" stroke="${primary}" stroke-width="13" fill="none" stroke-linecap="round"/>
            <circle cx="206" cy="156" r="7.5" fill="${secondary}" stroke="${S}" stroke-width="2"/>
          </g>`;
      default:
        return `
          <g class="avatar-tail">
            <circle cx="164" cy="206" r="13" fill="${secondary === '#1a1a1a' ? '#ffffff' : secondary}" stroke="${S}" stroke-width="2.5"/>
          </g>`;
    }
  },

  // Piernas pequeñas con patitas oscuras
  generateLegsSVG(primary = '#f45d22', animal = 'fox') {
    const foot = (animal === 'panda' || animal === 'fox' || animal === 'cat' || animal === 'dog' || animal === 'wolf') ? '#2b1608' : '#3f2a1a';
    return `
      <path d="M94 204 L94 230 Q94 238 102 238 L116 238 Q119 238 119 232 L119 204 Z" fill="${primary}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
      <path d="M121 204 L121 232 Q121 238 124 238 L138 238 Q146 238 146 230 L146 204 Z" fill="${primary}" stroke="#111" stroke-width="2.5" stroke-linejoin="round"/>
      <ellipse cx="105" cy="236" rx="13" ry="6.5" fill="${foot}" stroke="#111" stroke-width="2"/>
      <ellipse cx="135" cy="236" rx="13" ry="6.5" fill="${foot}" stroke="#111" stroke-width="2"/>
    `;
  },

  // Torso base redondeado del animal (con pancita clara) + prendas
  generateOutfitSVG(outfit, color = '#7928ca', primary = '#f45d22', secondary = '#ffffff', animal = 'fox') {
    const bellyMap = { panda: '#ffffff', lion: '#fde68a', wolf: '#e5e7eb', tiger: '#fff7ed', dragon: '#fde68a' };
    const belly = bellyMap[animal] || (secondary === '#1a1a1a' ? '#ffffff' : secondary);
    const torsoPath = 'M86 148 Q86 140 96 140 L144 140 Q154 140 154 148 L158 202 Q158 214 146 214 L94 214 Q82 214 82 202 Z';
    const base = `
      <path d="${torsoPath}" fill="${primary}" stroke="#111" stroke-width="2.8" stroke-linejoin="round"/>
      <path d="M106 150 Q120 158 134 150 Q142 176 136 204 Q120 212 104 204 Q98 176 106 150 Z" fill="${belly}"/>
    `;
    switch (outfit) {
      case 'hoodie':
        return `
          <path d="${torsoPath}" fill="${color}" stroke="#111" stroke-width="2.8" stroke-linejoin="round"/>
          <path d="M98 184 L142 184 L146 208 Q120 214 94 208 Z" fill="rgba(0,0,0,0.2)"/>
          <ellipse cx="120" cy="146" rx="26" ry="8" fill="rgba(0,0,0,0.28)"/>
          <line x1="112" y1="150" x2="112" y2="172" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="128" y1="150" x2="128" y2="172" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
        `;
      case 'bowtie':
        return `
          <path d="${torsoPath}" fill="#ffffff" stroke="#111" stroke-width="2.8" stroke-linejoin="round"/>
          <polygon points="118,152 100,142 100,162" fill="${color}" stroke="#111" stroke-width="1.8"/>
          <polygon points="122,152 140,142 140,162" fill="${color}" stroke="#111" stroke-width="1.8"/>
          <circle cx="120" cy="152" r="5" fill="${color}" stroke="#111" stroke-width="1.5"/>
        `;
      case 'scarf':
        return `
          ${base}
          <rect x="86" y="138" width="68" height="17" rx="8" fill="${color}" stroke="#111" stroke-width="2.5"/>
          <rect x="134" y="150" width="15" height="32" rx="5" fill="${color}" stroke="#111" stroke-width="2.2"/>
        `;
      case 'cape':
        return `
          <path d="M80 142 L160 142 L180 224 L60 224 Z" fill="${color}" stroke="#111" stroke-width="2.6" stroke-linejoin="round"/>
          ${base}
          <polygon points="120,158 129,170 120,182 111,170" fill="#ffd166" stroke="#111" stroke-width="1.5"/>
        `;
      case 'medal':
        return `
          ${base}
          <polygon points="108,142 120,168 100,146" fill="#3b82f6"/>
          <polygon points="132,142 120,168 140,146" fill="#ef4444"/>
          <circle cx="120" cy="176" r="12" fill="#ffd166" stroke="#111" stroke-width="2"/>
          <circle cx="120" cy="176" r="7.5" fill="#f59e0b"/>
        `;
      case 'none':
      default:
        return base;
    }
  },

  // Brazos cortos según gesto (hombros en 88,154 y 152,154)
  generateArmsSVG(emote, primary = '#f45d22') {
    const arm = (d) => `
      <path d="${d}" stroke="#111" stroke-width="15.5" stroke-linecap="round" fill="none"/>
      <path d="${d}" stroke="${primary}" stroke-width="10.5" stroke-linecap="round" fill="none"/>`;
    if (emote === 'wave') {
      return `
        ${arm('M88 156 Q72 174 78 194')}
        <g class="arm-waving">${arm('M152 156 Q178 146 180 116')}</g>
      `;
    } else if (emote === 'celebrate' || emote === 'victory') {
      return `
        ${arm('M88 156 Q62 144 62 112')}
        ${arm('M152 156 Q178 144 178 112')}
      `;
    } else if (emote === 'dance') {
      return `
        ${arm('M88 156 Q58 164 70 190')}
        ${arm('M152 156 Q184 146 170 116')}
      `;
    } else if (emote === 'focus') {
      return `
        ${arm('M88 156 Q100 188 116 178')}
        ${arm('M152 156 Q140 188 124 178')}
      `;
    } else if (emote === 'clap') {
      return `
        ${arm('M88 156 Q104 176 118 166')}
        ${arm('M152 156 Q136 176 122 166')}
      `;
    }
    return `
      ${arm('M88 156 Q72 174 78 194')}
      ${arm('M152 156 Q168 174 162 194')}
    `;
  },

  // Icono de jugador para toda la app: usa su avatarConfig, o convierte su emoji a animal Kahoot
  emojiToAnimalMap: {
    '🦊': 'fox', '🐼': 'panda', '🐱': 'cat', '🐶': 'dog', '🦁': 'lion', '🐰': 'rabbit', '🐨': 'koala',
    '🦉': 'owl', '🐵': 'monkey', '🐻': 'bear', '🐺': 'wolf', '🐯': 'tiger', '🐧': 'penguin',
    '🦄': 'unicorn', '🐲': 'dragon', '🤖': 'robot'
  },

  renderPlayerIcon(player, size = 36) {
    try {
      const cfg = player && player.avatarConfig;
      if (cfg) return this.renderIconSVG(cfg, size);
      const animal = this.emojiToAnimalMap[player && player.avatar];
      if (animal) {
        return this.renderIconSVG({ ...this.defaultConfig, animal, headwear: 'none', eyewear: 'none', themeColor: 'default' }, size);
      }
    } catch (e) { /* fallback al emoji */ }
    return (player && player.avatar) || '🦊';
  },

  // Manejador de rotación interactiva 3D con arrastre de ratón o toque táctil
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

console.log('✅ AvatarEngine (Kahoot Edition) cargado exitosamente.');
