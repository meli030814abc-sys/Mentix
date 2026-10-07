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

const DEFAULT_CHALLENGES = [];

// Helper para inicializar o recuperar almacenamiento con desinfección automática
function loadInitialState() {
  // Purgar almacenamiento local si contiene texto corrupto (mojibake)
  ['te_reto_challenges', 'te_reto_users', 'te_reto_groups', 'te_reto_categories'].forEach(key => {
    const raw = localStorage.getItem(key);
    if (raw && (/ðŸ|Ã¡|Ã³|Ã©|Ã­|Ãº|Ã±|âœ|â¬|âš|Ã/.test(raw))) {
      console.log(`[Auto-Clean] Desinfectando entrada de localStorage: ${key}`);
      localStorage.removeItem(key);
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
        challenges = parsed.filter(c => c && c.id && !OLD_MOCK_IDS.includes(c.id));
      }
    } catch(e) {}
  }
  localStorage.setItem('te_reto_challenges', JSON.stringify(challenges));

  return {
    challenges: challenges,
    users: storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS,
    currentUser: storedCurrentUser ? JSON.parse(storedCurrentUser) : DEFAULT_USERS[0],
    groups: groups,
    categories: storedCategories ? JSON.parse(storedCategories) : DEFAULT_CATEGORIES
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
    if (state.categories) localStorage.setItem('te_reto_categories', JSON.stringify(state.categories));
  } catch (e) {
    console.warn('Error guardando estado secundario:', e);
  }
}
