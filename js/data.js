/**
 * 🔥 MENTIX - Almacén de Datos Predeterminados
 * Categorías, Niveles XP, Medallas, Retos de ejemplo completos y Usuarios
 */

const DEFAULT_CATEGORIES = [
  { id: 'matematicas', name: 'Matemáticas', icon: '🧮', color: '#ffb703', count: 18 },
  { id: 'lenguaje', name: 'Lenguaje y Literatura', icon: '📚', color: '#f72585', count: 14 },
  { id: 'sociales', name: 'Ciencias Sociales', icon: '🌎', color: '#4361ee', count: 12 },
  { id: 'ciencias', name: 'Ciencias Naturales', icon: '🔬', color: '#06d6a0', count: 16 },
  { id: 'tecnologia', name: 'Tecnología & Programación', icon: '💻', color: '#00f5d4', count: 24 },
  { id: 'ingles', name: 'Inglés Práctico', icon: '🇬🇧', color: '#7209b7', count: 15 },
  { id: 'derecho', name: 'Derecho & Leyes', icon: '⚖️', color: '#fb5607', count: 9 },
  { id: 'admin', name: 'Administración Pública', icon: '🏛️', color: '#3a0ca3', count: 8 },
  { id: 'cultura', name: 'Cultura General', icon: '🎨', color: '#f72585', count: 32 },
  { id: 'entretenimiento', name: 'Entretenimiento & Juegos', icon: '🎮', color: '#4cc9f0', count: 29 }
];

const DEFAULT_LEVELS = [
  { level: 1, name: 'Principiante', minXp: 0, maxXp: 500, icon: '🌱' },
  { level: 2, name: 'Explorador', minXp: 501, maxXp: 1500, icon: '🧭' },
  { level: 3, name: 'Competidor', minXp: 1501, maxXp: 3500, icon: '⚔️' },
  { level: 4, name: 'Experto', minXp: 3501, maxXp: 7000, icon: '🔮' },
  { level: 5, name: 'Maestro', minXp: 7001, maxXp: 12000, icon: '👑' },
  { level: 6, name: 'Leyenda', minXp: 12001, maxXp: 999999, icon: '🔥' }
];

const DEFAULT_MEDALS = [
  { id: 'streak_10', title: 'Racha Imparable', desc: '10 respuestas correctas seguidas', icon: '🔥', unlocked: true },
  { id: 'speed_demon', title: 'Velocista', desc: 'Responder en menos de 2 segundos', icon: '⚡', unlocked: true },
  { id: 'mastermind', title: 'Mente Maestra', desc: 'Obtener más de 8,000 puntos en una partida', icon: '🧠', unlocked: true },
  { id: 'champion', title: 'Campeón', desc: 'Quedar en primer lugar del podio', icon: '🏆', unlocked: false },
  { id: 'flawless', title: 'Sin Errores', desc: 'Completar un reto con 100% de aciertos', icon: '🎯', unlocked: false },
  { id: 'creator', title: 'Creador Estrella', desc: 'Crear y publicar tu primer reto', icon: '🚀', unlocked: false },
  { id: 'host_5', title: 'Anfitrión Popular', desc: 'Organizar una sala con más de 5 jugadores', icon: '👥', unlocked: false }
];

const DEFAULT_USERS = [
  {
    id: 'user_1',
    name: 'Mateo Gamer',
    username: 'mateo_pro',
    email: 'mateo@te-reto.app',
    role: 'student', // student | teacher | admin
    avatar: '🦊',
    xp: 2850,
    level: 3,
    levelName: 'Competidor',
    challengesPlayed: 0,
    challengesCreated: 0,
    victories: 0,
    rankPosition: 4,
    country: 'Colombia',
    institution: 'Instituto Tecnológico Nacional',
    medals: ['streak_10', 'speed_demon', 'mastermind'],
    status: 'active'
  },
  {
    id: 'user_2',
    name: 'Prof. Carlos Ruiz',
    username: 'prof_carlos',
    email: 'carlos.ruiz@colegio.edu',
    role: 'teacher',
    avatar: '👨‍🏫',
    xp: 8400,
    level: 5,
    levelName: 'Maestro',
    challengesPlayed: 52,
    challengesCreated: 14,
    victories: 19,
    rankPosition: 2,
    country: 'México',
    institution: 'Colegio Bolivariano',
    medals: ['streak_10', 'speed_demon', 'mastermind', 'champion', 'creator'],
    status: 'active'
  },
  {
    id: 'user_3',
    name: 'Laura Administradora',
    username: 'admin_laura',
    email: 'laura@te-reto.app',
    role: 'admin',
    avatar: '🛡️',
    xp: 14200,
    level: 6,
    levelName: 'Leyenda',
    challengesPlayed: 110,
    challengesCreated: 35,
    victories: 42,
    rankPosition: 1,
    country: 'España',
    institution: 'Plataforma Global MENTIX',
    medals: ['streak_10', 'speed_demon', 'mastermind', 'champion', 'flawless', 'creator', 'host_5'],
    status: 'active'
  }
];

const DEFAULT_GROUPS = [
  {
    id: 'group_7b',
    name: 'GRADO 7B - CIENCIAS Y TECNOLOGÍA',
    studentsCount: 32,
    teacherId: 'user_2',
    avgScore: 78,
    lastChallenge: 'Mega Quiz de Tecnología y Código Web',
    students: [
      { id: 'st_7b_1', name: 'Andrea Valderrama', email: 'andrea.valderrama@colegio.edu.co', points: 9850, played: 8, avatar: '🦄' },
      { id: 'st_7b_2', name: 'Juan Sebastián Mora', email: 'juan.mora@colegio.edu.co', points: 8920, played: 8, avatar: '🐯' },
      { id: 'st_7b_3', name: 'María Camila Gómez', email: 'maria.gomez@colegio.edu.co', points: 8430, played: 7, avatar: '🐼' },
      { id: 'st_7b_4', name: 'Santiago López', email: 'santiago.lopez@colegio.edu.co', points: 7650, played: 8, avatar: '🦁' },
      { id: 'st_7b_5', name: 'Valentina Díaz', email: 'valentina.diaz@colegio.edu.co', points: 7120, played: 6, avatar: '🐰' }
    ]
  },
  {
    id: 'group_10a',
    name: '10º A - MATEMÁTICAS AVANZADAS',
    studentsCount: 28,
    teacherId: 'user_2',
    avgScore: 84,
    lastChallenge: 'Desafío Relámpago de Matemáticas & Lógica',
    students: [
      { id: 'st_10a_1', name: 'Daniel Restrepo', email: 'daniel.restrepo@colegio.edu.co', points: 10400, played: 11, avatar: '🦅' },
      { id: 'st_10a_2', name: 'Estefanía Torres', email: 'estefania.torres@colegio.edu.co', points: 9850, played: 10, avatar: '🐱' },
      { id: 'st_10a_3', name: 'Felipe Mendoza', email: 'felipe.mendoza@colegio.edu.co', points: 9100, played: 9, avatar: '🐺' }
    ]
  }
];

const DEFAULT_CHALLENGES = [
  {
    id: 'reto_sample_cloud',
    title: 'Reto Prueba Cloud Actualizado',
    description: 'Desafío interactivo con preguntas de ciencia, cultura y tecnología.',
    category: 'ciencias',
    categoryName: 'Ciencias Naturales',
    author: 'Comunidad',
    authorAvatar: '👨‍🏫',
    plays: 15,
    difficulty: 'Medio',
    timePerQuestion: 20,
    pointsStandard: 1000,
    questions: [
      {
        id: 'q1',
        text: '¿Cuál es el planeta más cercano al Sol en el Sistema Solar?',
        type: 'quiz',
        timeLimit: 20,
        points: 1000,
        options: [
          { text: 'Mercurio' },
          { text: 'Venus' },
          { text: 'La Tierra' },
          { text: 'Marte' }
        ],
        correctAnswer: 0
      },
      {
        id: 'q2',
        text: 'La velocidad de la luz en el vacío es de aproximadamente 300,000 kilómetros por segundo.',
        type: 'truefalse',
        timeLimit: 20,
        points: 1000,
        options: [
          { text: 'Verdadero' },
          { text: 'Falso' }
        ],
        correctAnswer: 0
      },
      {
        id: 'q3',
        text: '¿Cuál es el elemento químico más abundante en el universo observable?',
        type: 'quiz',
        timeLimit: 20,
        points: 1000,
        options: [
          { text: 'Hidrógeno' },
          { text: 'Oxígeno' },
          { text: 'Carbono' },
          { text: 'Helio' }
        ],
        correctAnswer: 0
      },
      {
        id: 'q4',
        text: '¿Cuántos huesos forman aproximadamente el esqueleto humano de una persona adulta?',
        type: 'quiz',
        timeLimit: 20,
        points: 1000,
        options: [
          { text: '206' },
          { text: '195' },
          { text: '218' },
          { text: '300' }
        ],
        correctAnswer: 0
      },
      {
        id: 'q5',
        text: '¿Cuál es el océano de mayor superficie y profundidad en el planeta Tierra?',
        type: 'quiz',
        timeLimit: 20,
        points: 1000,
        options: [
          { text: 'Océano Pacífico' },
          { text: 'Océano Atlántico' },
          { text: 'Océano Índico' },
          { text: 'Océano Ártico' }
        ],
        correctAnswer: 0
      }
    ]
  }
];

const CP850_HIGH = 'ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»░▒▓│┤ÁÂÀ©╣║╗╝¢¥┐└┴┬├─┼ãÃ╚╔╩╦╠═╬¤ðÐÊËÈıÍÎÏ┘┌█▄¦Ì▀ÓßÔÒõÕµþÞÚÛÙýÝ¯´\u00AD±‗¾¶§÷¸°¨·¹³²■\u00A0';
function cp850Bytes(s, strict) {
  const out = [];
  for (const ch of s) {
    const c = ch.codePointAt(0);
    if (c < 128) { out.push(c); continue; }
    const i = CP850_HIGH.indexOf(ch);
    if (i < 0) { if (strict) return null; out.push(63); continue; }
    out.push(128 + i);
  }
  return out;
}
function utf8Strict(bytes) {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(new Uint8Array(bytes)); } catch (e) { return null; }
}
function repairCp850Mojibake(str) {
  if (!/[\u00D4\u251C\u252C]/.test(str)) return str;
  // Paso 1: tokens "Ô" + 2 caracteres = bytes UTF-8 E2 xx yy leídos como cp850
  let r = str.replace(/\u00D4([\u00F6\u00F2\u00FB\u00F9])(.)/g, (m, a, b) => {
    const x = cp850Bytes(a + b, true);
    const d = x && utf8Strict([0xE2, ...x]);
    return d || m;
  });
  r = r.replace(/\u00D4(.)(.)/g, (m, a, b) => {
    const x = cp850Bytes(a + b, true);
    const d = x && utf8Strict([0xE2, ...x]);
    return d || m;
  });
  // Paso 2: cadena completa cp850 -> UTF-8
  const whole = cp850Bytes(r, true);
  const dec = whole && utf8Strict(whole);
  if (dec) r = dec;
  r = r.replace(/\u251C\u252C[\u00AB\u00A1\u00ED]/g, m => ({ '\u00AB': 'é', '\u00A1': 'í', '\u00ED': 'í' }[m[2]]));
  r = r.replace(/[\u251C\u252C]./g, m => {
    const x = cp850Bytes(m, true);
    return (x && utf8Strict(x)) || m;
  });
  return r;
}

// Sanitizador universal para limpiar texto corrupto (mojibake)
function fixMojibake(str) {
  if (typeof str !== 'string') return str;
  str = repairCp850Mojibake(str);
  return str
    .replace(/\u251C\u00A1/g, 'í')
    .replace(/\u251C\u00ED/g, 'á')
    .replace(/\u251C\u2502/g, 'ó')
    .replace(/\u251C\u00AE/g, 'é')
    .replace(/\u251C\u2592/g, 'ñ')
    .replace(/\u251C\u2551/g, 'ú')
    .replace(/\u251C\u255D/g, 'ü')
    .replace(/\u251C\u00FC/g, 'Á')
    .replace(/\u251C\u00EB/g, 'É')
    .replace(/\u251C\u00EC/g, 'Í')
    .replace(/\u251C\u00F4/g, 'Ó')
    .replace(/\u251C\u00DC/g, 'Ú')
    .replace(/\u251C\u00E6/g, 'Ñ')
    .replace(/\u252C[\u00A1\u00ED]/g, '¡')
    .replace(/\u252C[\u2510\u00BF]/g, '¿')
    .replace(/­ƒªü/g, '🦁')
    .replace(/­ƒÉ¼/g, '🐬')
    .replace(/­ƒªÆ/g, '🦒')
    .replace(/­ƒªè/g, '🦊')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã/g, 'Á')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Â¡/g, '¡')
    .replace(/Â¿/g, '¿')
    .replace(/Ô£ª/g, '✦')
    .replace(/Ô¼ó/g, '⬢')
    .replace(/ÔÜí/g, '⚡')
    .replace(/­ƒøí´©Å/g, '🛡️')
    .replace(/ƒøí´©Å/g, '🛡️');
}

function fixOptionShape(shape, optIdx) {
  const shapes = ['✦', '⬢', '⚡', '🛡️', '⬟', '💎'];
  if (!shape || typeof shape !== 'string') return shapes[optIdx % shapes.length];
  const s = shape.trim();
  if (['✦', '⬢', '⚡', '🛡️', '▲', '◆', '⬟', '💎'].includes(s)) return s;
  return shapes[optIdx % shapes.length];
}

function deepCleanMojibake(val) {
  if (typeof val === 'string') return fixMojibake(val);
  if (Array.isArray(val)) return val.map(deepCleanMojibake);
  if (val && typeof val === 'object') {
    const res = {};
    for (const k in val) {
      res[k] = deepCleanMojibake(val[k]);
    }
    if (Array.isArray(res.options)) {
      res.options.forEach((opt, optIdx) => {
        if (opt && typeof opt === 'object') {
          opt.shape = fixOptionShape(opt.shape, optIdx);
        }
      });
    }
    return res;
  }
  return val;
}
window.fixMojibake = fixMojibake;
window.fixOptionShape = fixOptionShape;
window.deepCleanMojibake = deepCleanMojibake;

// Helper para inicializar o recuperar almacenamiento con desinfección automática
function loadInitialState() {
  // Purgar almacenamiento local si contiene texto corrupto (mojibake)
  ['te_reto_challenges', 'te_reto_users', 'te_reto_groups'].forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw && (/ðŸ|Ã¡|Ã³|Ã©|Ã­|Ãº|Ã±|âœ|â¬|âš|\u251C|\u252C|\u00D4\u00F6/.test(raw))) {
      console.log(`[Auto-Clean] Desinfectando entrada de localStorage: ${key}`);
      try {
        const cleaned = deepCleanMojibake(JSON.parse(raw));
        localStorage.setItem(key, JSON.stringify(cleaned));
      } catch (err) {
        localStorage.removeItem(key);
      }
    }
  });

  const storedChallenges = localStorage.getItem('te_reto_challenges');
  const storedUsers = localStorage.getItem('te_reto_users');
  const storedCurrentUser = localStorage.getItem('te_reto_current_user');
  const storedGroups = localStorage.getItem('te_reto_groups');
  const storedCategories = localStorage.getItem('te_reto_categories');

  const groups = storedGroups ? JSON.parse(storedGroups) : DEFAULT_GROUPS;
  groups.forEach(g => {
    (g.students || []).forEach((st, idx) => {
      if (!st.id) st.id = 'st_' + (g.id || 'grp') + '_' + idx;
      if (!st.email) {
        const clean = (st.name || 'alumno').toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '.');
        st.email = `${clean}@colegio.edu.co`;
      }
    });
  });

  // Lista de IDs de proyectos de muestra predeterminados que deben removerse
  const OLD_MOCK_IDS = [
    'proj_presentacion_1',
    'proj_video_2',
    'proj_quiz_3',
    'reto_tech_1',
    'reto_cultura_3',
    'reto_1',
    'reto_2',
    'reto_3'
  ];

  let challenges = [];
  if (storedChallenges) {
    try {
      const parsed = JSON.parse(storedChallenges);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Conservar solo proyectos reales creados por el usuario, eliminando los de muestra
        challenges = deepCleanMojibake(parsed.filter(c => c && c.id && !OLD_MOCK_IDS.includes(c.id)));
      }
    } catch(e) {}
  }

  // Si no hay retos o los que hay no tienen preguntas, sembrar retos por defecto
  if (challenges.length === 0) {
    challenges = [...DEFAULT_CHALLENGES];
  } else {
    // Si algún reto por defecto existe pero tiene preguntas vacías, restaurar sus preguntas
    challenges = challenges.map(c => {
      if (c.id === 'reto_sample_cloud' && (!c.questions || c.questions.length === 0)) {
        return { ...c, questions: DEFAULT_CHALLENGES[0].questions };
      }
      const catIdLower = (c.category || '').toLowerCase().trim();
      const catNameLower = (c.categoryName || '').toLowerCase().trim();
      if (['fhjr', 'kj'].includes(catIdLower) || ['fhjr', 'kj'].includes(catNameLower)) {
        return { ...c, category: 'cultura', categoryName: 'Cultura General' };
      }
      return c;
    });
  }
  localStorage.setItem('te_reto_challenges', JSON.stringify(challenges));

  const BLOCKED_CATS = ['fhjr', 'kj'];
  const isBlockedCat = (cat) => {
    if (!cat) return true;
    const cid = String(cat.id || '').toLowerCase().trim();
    const cname = String(cat.name || '').toLowerCase().trim();
    return BLOCKED_CATS.includes(cid) || BLOCKED_CATS.includes(cname);
  };

  // Cargar categorías asegurando SIEMPRE las categorías por defecto completas
  const catMap = new Map();
  DEFAULT_CATEGORIES.forEach(cat => {
    if (cat && cat.id && !isBlockedCat(cat)) catMap.set(cat.id, cat);
  });

  if (storedCategories) {
    try {
      const parsedCats = deepCleanMojibake(JSON.parse(storedCategories));
      if (Array.isArray(parsedCats)) {
        parsedCats.forEach(cat => {
          if (cat && cat.id && !isBlockedCat(cat)) {
            catMap.set(cat.id, { ...catMap.get(cat.id), ...cat });
          }
        });
      }
    } catch (e) {}
  }

  // Eliminar definitivamente las categorías de prueba 'fhjr' y 'kj'
  BLOCKED_CATS.forEach(b => catMap.delete(b));
  const categories = Array.from(catMap.values()).filter(c => !isBlockedCat(c));
  localStorage.setItem('te_reto_categories', JSON.stringify(categories));

  return {
    challenges: challenges,
    users: storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS,
    currentUser: storedCurrentUser ? JSON.parse(storedCurrentUser) : DEFAULT_USERS[0],
    groups: groups,
    categories: categories
  };
}

function saveGlobalState(state) {
  try {
    if (state.challenges) localStorage.setItem('te_reto_challenges', JSON.stringify(state.challenges));
  } catch (err) {
    console.warn('⚠️ Alerta de almacenamiento local (QuotaExceeded):', err);
  }
  try {
    if (state.users) localStorage.setItem('te_reto_users', JSON.stringify(state.users));
    if (state.currentUser) localStorage.setItem('te_reto_current_user', JSON.stringify(state.currentUser));
    if (state.groups) localStorage.setItem('te_reto_groups', JSON.stringify(state.groups));
    if (state.categories) {
      const cleanCats = state.categories.filter(c => {
        if (!c || !c.id) return false;
        const cid = String(c.id).toLowerCase().trim();
        const cname = String(c.name || '').toLowerCase().trim();
        return !['fhjr', 'kj'].includes(cid) && !['fhjr', 'kj'].includes(cname);
      });
      state.categories = cleanCats;
      localStorage.setItem('te_reto_categories', JSON.stringify(cleanCats));
    }
  } catch (e) {
    console.warn('Error guardando estado secundario:', e);
  }
}
