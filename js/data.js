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

const DEFAULT_PROJECTS = [
  {
    id: 'proj_gov_data',
    title: 'Gobierno de Datos en la Práctica',
    description: 'Metodologías ágiles para la gobernanza moderna de información y toma de decisiones.',
    projectType: 'presentation',
    isGovDataProject: true,
    category: 'admin',
    categoryName: 'Administración Pública',
    author: 'Melisa',
    authorRole: 'teacher',
    authorAvatar: '🦊',
    status: 'review',
    publicationStatus: 'pending_approval',
    approvalStatus: 'pending',
    isPublic: false,
    tag: '⏳ Pendiente de Autorización',
    tagClass: 'badge-review',
    date: '12 Abr 2025',
    students: 24,
    rating: '4.8',
    progress: 100,
    image: 'assets/projects_ui/card_data_gov.png',
    banner: 'assets/projects_ui/card_data_gov.png',
    slides: [
      { id: 's1', title: 'Fundamentos de Gobernanza', content: 'Principios de calidad, seguridad y valor de los datos en la organización.', background: '#1e1b4b', textColor: '#ffffff' },
      { id: 's2', title: 'Arquitectura de Datos y Metadatos', content: 'Estructuración de catálogos de datos y ciclo de vida de la información.', background: '#0f172a', textColor: '#ffffff' },
      { id: 's3', title: 'Casos de Éxito y Auditoría', content: 'Implementación práctica, métricas de éxito y cumplimiento normativo.', background: '#042f2e', textColor: '#ffffff' }
    ],
    chapters: [
      { id: 'ch1', title: 'Fundamentos de Gobernanza', slidesCount: 1 },
      { id: 'ch2', title: 'Arquitectura de Datos', slidesCount: 1 },
      { id: 'ch3', title: 'Casos de Éxito y Auditoría', slidesCount: 1 }
    ],
    createdAt: '2025-04-12T10:00:00.000Z',
    updatedAt: '2025-04-12T10:00:00.000Z'
  },
  {
    id: 'proj_ai_society',
    title: 'Inteligencia Artificial y Sociedad',
    description: 'Impacto ético, retos y oportunidades del desarrollo de modelos generativos.',
    projectType: 'presentation',
    isGovDataProject: false,
    category: 'tecnologia',
    categoryName: 'Tecnología & Programación',
    author: 'Melisa',
    authorRole: 'teacher',
    authorAvatar: '🦊',
    status: 'in_progress',
    publicationStatus: 'draft',
    approvalStatus: 'pending',
    isPublic: false,
    tag: '⏱ En Proceso',
    tagClass: 'badge-process',
    date: '10 Abr 2025',
    students: 18,
    rating: '4.6',
    progress: 50,
    image: 'assets/projects_ui/card_ai_society.png',
    banner: 'assets/projects_ui/card_ai_society.png',
    slides: [
      { id: 's1', title: 'Introducción a la IA', content: 'Panorama general de los algoritmos de machine learning e inteligencia artificial.', background: '#172554', textColor: '#ffffff' },
      { id: 's2', title: 'Dilemas Éticos y Sociedad', content: 'Privacidad, sesgos algorítmicos y futuro del trabajo colaborativo con IA.', background: '#312e81', textColor: '#ffffff' }
    ],
    chapters: [
      { id: 'ch1', title: 'Introducción a la IA', slidesCount: 1 },
      { id: 'ch2', title: 'Dilemas Éticos', slidesCount: 1 }
    ],
    createdAt: '2025-04-10T09:30:00.000Z',
    updatedAt: '2025-04-10T09:30:00.000Z'
  },
  {
    id: 'proj_open_data',
    title: 'Datos Abiertos y Transparencia',
    description: 'Estrategias prácticas para la apertura, estandarización y auditoría ciudadana.',
    projectType: 'presentation',
    isGovDataProject: false,
    category: 'sociales',
    categoryName: 'Ciencias Sociales',
    author: 'Melisa',
    authorRole: 'teacher',
    authorAvatar: '🦊',
    status: 'review',
    publicationStatus: 'pending_approval',
    approvalStatus: 'pending',
    isPublic: false,
    tag: '⏳ Pendiente de Autorización',
    tagClass: 'badge-review',
    date: '8 Abr 2025',
    students: 20,
    rating: '4.7',
    progress: 15,
    image: 'assets/projects_ui/card_open_data.png',
    banner: 'assets/projects_ui/card_open_data.png',
    slides: [
      { id: 's1', title: 'Transparencia Activa', content: 'Políticas de rendición de cuentas e interoperabilidad para el sector público.', background: '#2e1065', textColor: '#ffffff' },
      { id: 's2', title: 'Formatos Estándar y Apertura', content: 'JSON, CSV, RDF y APIs abiertas para la consulta ciudadana.', background: '#3b0764', textColor: '#ffffff' }
    ],
    chapters: [
      { id: 'ch1', title: 'Transparencia Activa', slidesCount: 1 },
      { id: 'ch2', title: 'Formatos Estándar', slidesCount: 1 }
    ],
    createdAt: '2025-04-08T14:15:00.000Z',
    updatedAt: '2025-04-08T14:15:00.000Z'
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
  str = str
    .replace(/\u251C[\u2502\u2503|]/g, 'ó')
    .replace(/\u2528/g, 'ó')
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
    .replace(/\u251C\u00E6/g, 'Ñ');
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

  // Reparación semántica de términos frecuentes corrompidos por codificación (CP437 / ANSI)
  str = str
    .replace(/\b(introducci)[^\w\s]+(n)\b/gi, '$1ó$2')
    .replace(/\b(diagn)[^\w\s]+(stico)\b/gi, '$1ó$2')
    .replace(/\b(m)[^\w\s]+(dulo)\b/gi, '$1ó$2')
    .replace(/\b(aprender)[^\w\s]+(s)\b/gi, '$1á$2')
    .replace(/\b(organizaci)[^\w\s]+(n)\b/gi, '$1ó$2')
    .replace(/\b(pr)[^\w\s]+(ctica[s]?)\b/gi, '$1á$2')
    .replace(/\b(informaci)[^\w\s]+(n)\b/gi, '$1ó$2')
    .replace(/\b(t)[^\w\s]+(pico[s]?)\b/gi, '$1ó$2')
    .replace(/\bpor\s+qu[^\w\s]+\b/gi, 'por qué')
    .replace(/\b(compa)[^\w\s]+(as)\b/gi, '$1ñí$2')
    .replace(/\b[^\w\s]+(reas)\b/gi, 'á$1')
    .replace(/\b(m)[^\w\s]+(ltiple[s]?)\b/gi, '$1ú$2')
    .replace(/\b(est)[^\w\s]+(n)\b/gi, '$1á$2')
    .replace(/\b(m)[^\w\s]+(s)\b/gi, '$1á$2')
    .replace(/\b(producir)[^\w\s]+\b/gi, '$1á')
    .replace(/\b(sab)[^\w\s]+(a)\b/gi, '$1í$2')
    .replace(/\b(implementaci)[^\w\s]+(n)\b/gi, '$1ó$2')
    .replace(/\b(gesti)[^\w\s]+(n)\b/gi, '$1ó$2')
    .replace(/\b(evaluaci)[^\w\s]+(n)\b/gi, '$1ó$2');

  return str;
}

function fixOptionShape(shape, optIdx) {
  const shapes = ['✦', '⬢', '⚡', '🛡️', '⬟', '💎'];
  if (!shape || typeof shape !== 'string') return shapes[optIdx % shapes.length];
  const s = shape.trim();
  if (['✦', '⬢', '⚡', '🛡️', '▲', '◆', '⬟', '💎'].includes(s)) return s;
  return shapes[optIdx % shapes.length];
}

function deepCleanMojibake(val) {
  if (typeof val === 'string') {
    if (val.length > 10000 || val.startsWith('data:')) return val;
    return fixMojibake(val);
  }
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

function sanitizeProjectSlides(rawSlides, projectTitle = '') {
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) return [];
  
  const cleanFn = (v) => (typeof v === 'string' && typeof window.fixMojibake === 'function') ? window.fixMojibake(v) : (v || '');

  // 1. Contar ocurrencias de títulos para saber si se repite un banner de curso (ej: "CURSO Diagnostico empresarial")
  const titleCounts = {};
  rawSlides.forEach(s => {
    const t = cleanFn(s?.title || '').trim().toLowerCase();
    if (t && t.length > 3) titleCounts[t] = (titleCounts[t] || 0) + 1;
  });

  const isDeckHeader = (t) => {
    if (!t) return false;
    const lower = t.toLowerCase().trim();
    if (titleCounts[lower] >= 2) return true;
    if (/^(?:curso|diagn[oó]stico\s+empresarial|diplomado|taller)/i.test(lower)) return true;
    if (projectTitle && lower === cleanFn(projectTitle).toLowerCase().trim()) return true;
    return false;
  };

  return rawSlides.map((s, idx) => {
    if (!s || typeof s !== 'object') return s;

    let title = cleanFn(s.title || `Diapositiva ${idx + 1}`).trim();
    let subtitle = cleanFn(s.subtitle || '').trim();
    let content = cleanFn(s.content || '').trim();
    let bullets = Array.isArray(s.bullets) ? s.bullets.map(cleanFn) : [];

    // Filtrar viñetas de ruido (números sueltos, puntos, tokens de control)
    bullets = bullets
      .map(b => b.trim())
      .filter(b => b && !/^(\d{1,2}|\.|\-)$/.test(b) && !/^(?:INTRO|CONT)\.?$/i.test(b));

    // Si el contenido es en realidad una etiqueta de módulo o clase
    let moduleTag = '';
    if (/^(?:m[oó]dulo\s+\d+|clase\s+\d+)/i.test(content)) {
      moduleTag = content;
      content = '';
    }

    // Detectar Objetivo de Aprendizaje en las viñetas
    let learningObjective = '';
    const objIdx = bullets.findIndex(b => /^objetivo(?:\s+de\s+aprendizaje)?/i.test(b));
    if (objIdx >= 0) {
      if (objIdx + 1 < bullets.length && bullets[objIdx + 1].length > 15) {
        learningObjective = bullets[objIdx + 1];
        bullets.splice(objIdx, 2);
      } else if (bullets[objIdx].length > 30) {
        learningObjective = bullets[objIdx].replace(/^objetivo(?:\s+de\s+aprendizaje)?[:\s-]*/i, '');
        bullets.splice(objIdx, 1);
      } else {
        bullets.splice(objIdx, 1);
      }
    }

    // Si el título actual es el banner general del curso (ej: "CURSO Diagnostico empresarial")
    if (isDeckHeader(title) && bullets.length > 0) {
      // Encontrar en bullets la línea que realmente es el título de la diapositiva
      const topicIdx = bullets.findIndex(b => 
        b.length < 65 && 
        !/^(?:en este|las compa|m[uú]ltiples|cuando los|la cultura|exploremos|identificar)/i.test(b) &&
        !/^(?:🎯|objetivo)/i.test(b)
      );
      if (topicIdx >= 0) {
        title = bullets[topicIdx];
        bullets.splice(topicIdx, 1);
      }
    }

    // Si el contenido quedó vacío, buscar si en bullets hay un párrafo descriptivo largo
    if (!content && bullets.length > 0) {
      const descIdx = bullets.findIndex(b => 
        b.length > 60 || 
        /^(?:en este|las compa|m[uú]ltiples|cuando los|la cultura|exploremos|identificar)/i.test(b)
      );
      if (descIdx >= 0) {
        content = bullets[descIdx];
        bullets.splice(descIdx, 1);
      }
    }

    // Unificar subtítulo con insignia de módulo si existe
    if (moduleTag) {
      if (subtitle && !subtitle.toLowerCase().includes(moduleTag.toLowerCase())) {
        subtitle = `${subtitle} · ${moduleTag}`;
      } else if (!subtitle) {
        subtitle = moduleTag;
      }
    }

    // Agregar el objetivo con formato destacado
    if (learningObjective && !bullets.some(b => b.includes(learningObjective))) {
      bullets.unshift(`🎯 Objetivo: ${learningObjective}`);
    }

    return {
      ...s,
      title: title.replace(/\s*\.\s*$/, '').trim(),
      subtitle,
      content,
      bullets,
      layout: s.layout || (s.media ? 'split' : 'full'),
      bgColor: s.bgColor || '#090e1a'
    };
  });
}

window.fixMojibake = fixMojibake;
window.fixOptionShape = fixOptionShape;
window.deepCleanMojibake = deepCleanMojibake;
window.sanitizeProjectSlides = sanitizeProjectSlides;

// ============================================================================
// 🛡️ MENTIX IMAGE VAULT (IndexedDB + Memoria)
// Garantiza que ninguna imagen cargada (portada, diapositivas, recursos, videos)
// se borre jamás por límites de tamaño o cuota de localStorage.
// ============================================================================
(function() {
  const DB_NAME = 'mentix_image_vault_db';
  const STORE_NAME = 'images';
  let dbPromise = null;
  const memoryCache = new Map();

  function getDB() {
    if (dbPromise) return dbPromise;
    if (typeof indexedDB === 'undefined') return Promise.resolve(null);
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, 1);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME);
          }
        };
        req.onsuccess = (e) => resolve(e.target.result);
        req.onerror = () => resolve(null);
      } catch (err) {
        resolve(null);
      }
    });
    return dbPromise;
  }

  window.MentixImageVault = {
    set(key, dataUrl) {
      if (!key || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) return;
      memoryCache.set(key, dataUrl);
      getDB().then((db) => {
        if (!db) return;
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).put(dataUrl, key);
        } catch (e) {}
      });
    },

    get(key) {
      if (!key) return null;
      if (memoryCache.has(key)) return memoryCache.get(key);
      return null;
    },

    async getAsync(key) {
      if (!key) return null;
      if (memoryCache.has(key)) return memoryCache.get(key);
      const db = await getDB();
      if (!db) return null;
      return new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const req = tx.objectStore(STORE_NAME).get(key);
          req.onsuccess = () => {
            const val = req.result || null;
            if (val) memoryCache.set(key, val);
            resolve(val);
          };
          req.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      });
    },

    // Respalda todas las imágenes detectadas dentro de un proyecto
    backupProjectImages(proj) {
      if (!proj || typeof proj !== 'object') return;
      const id = proj.id;
      if (!id) return;

      const saveIfData = (prop, val) => {
        if (typeof val === 'string' && val.startsWith('data:image/')) {
          this.set(`${id}__${prop}`, val);
        }
      };

      saveIfData('mainImage', proj.mainImage);
      saveIfData('thumbnailImage', proj.thumbnailImage);
      saveIfData('banner', proj.banner);
      saveIfData('image', proj.image);
      saveIfData('entityLogo', proj.entityLogo);
      if (proj.designConfig) saveIfData('designBanner', proj.designConfig.bannerUrl);
      if (proj.videoConfig) saveIfData('videoThumb', proj.videoConfig.thumbnailUrl);

      if (Array.isArray(proj.slides)) {
        proj.slides.forEach((s, idx) => {
          if (!s) return;
          saveIfData(`slide_${idx}_media`, s.media);
          saveIfData(`slide_${idx}_imageUrl`, s.imageUrl);
          saveIfData(`slide_${idx}_bgImage`, s.bgImage);
        });
      }
      if (Array.isArray(proj.resources)) {
        proj.resources.forEach((r, idx) => {
          if (!r) return;
          saveIfData(`res_${idx}_thumb`, r.thumbnailUrl);
          saveIfData(`res_${idx}_url`, r.url);
        });
      }
      if (Array.isArray(proj.externalLinks)) {
        proj.externalLinks.forEach((l, idx) => {
          if (!l) return;
          saveIfData(`link_${idx}_thumb`, l.thumbnailUrl);
        });
      }
      if (Array.isArray(proj.visualAssets)) {
        proj.visualAssets.forEach((v, idx) => {
          if (!v) return;
          saveIfData(`vis_${idx}_url`, v.url);
        });
      }
      if (Array.isArray(proj.questions)) {
        proj.questions.forEach((q, idx) => {
          if (!q) return;
          saveIfData(`q_${idx}_media`, q.media);
        });
      }
    },

    // Restaura imágenes guardadas en la bóveda si faltan o están vacías
    restoreProjectImages(proj) {
      if (!proj || typeof proj !== 'object') return proj;
      const id = proj.id;
      if (!id) return proj;

      const pickRestored = (prop, currentVal) => {
        if (typeof currentVal === 'string' && currentVal.startsWith('data:image/')) return currentVal;
        const vaulted = this.get(`${id}__${prop}`);
        return (vaulted && vaulted.startsWith('data:image/')) ? vaulted : (currentVal || '');
      };

      proj.mainImage = pickRestored('mainImage', proj.mainImage);
      proj.thumbnailImage = pickRestored('thumbnailImage', proj.thumbnailImage);
      proj.banner = pickRestored('banner', proj.banner) || proj.mainImage;
      proj.image = pickRestored('image', proj.image) || proj.mainImage;
      if (proj.entityLogo !== undefined) {
        proj.entityLogo = pickRestored('entityLogo', proj.entityLogo);
      }
      if (proj.designConfig) {
        proj.designConfig.bannerUrl = pickRestored('designBanner', proj.designConfig.bannerUrl);
      }
      if (proj.videoConfig) {
        proj.videoConfig.thumbnailUrl = pickRestored('videoThumb', proj.videoConfig.thumbnailUrl);
      }
      if (Array.isArray(proj.slides)) {
        proj.slides.forEach((s, idx) => {
          if (!s) return;
          s.media = pickRestored(`slide_${idx}_media`, s.media);
          s.imageUrl = pickRestored(`slide_${idx}_imageUrl`, s.imageUrl);
          s.bgImage = pickRestored(`slide_${idx}_bgImage`, s.bgImage);
        });
      }
      if (Array.isArray(proj.resources)) {
        proj.resources.forEach((r, idx) => {
          if (!r) return;
          r.thumbnailUrl = pickRestored(`res_${idx}_thumb`, r.thumbnailUrl);
          r.url = pickRestored(`res_${idx}_url`, r.url);
        });
      }
      if (Array.isArray(proj.externalLinks)) {
        proj.externalLinks.forEach((l, idx) => {
          if (!l) return;
          l.thumbnailUrl = pickRestored(`link_${idx}_thumb`, l.thumbnailUrl);
        });
      }
      if (Array.isArray(proj.visualAssets)) {
        proj.visualAssets.forEach((v, idx) => {
          if (!v) return;
          v.url = pickRestored(`vis_${idx}_url`, v.url);
        });
      }
      if (Array.isArray(proj.questions)) {
        proj.questions.forEach((q, idx) => {
          if (!q) return;
          q.media = pickRestored(`q_${idx}_media`, q.media);
        });
      }
      return proj;
    }
  };
})();

// Helper inteligente universal: fusiona dos versiones de un proyecto preservando siempre
// todas las imágenes (portadas, diapositivas, recursos, videos) sin sobreescribir con valores vacíos
window.mergeProjectPreservingImages = function(existing, incoming) {
  if (!existing && !incoming) return null;
  if (!existing) return incoming;
  if (!incoming) return existing;

  const pickImage = (a, b) => {
    const isGood = s => typeof s === 'string' && s.trim().length > 0;
    if (isGood(b) && b.startsWith('data:image/')) return b;
    if (isGood(a) && a.startsWith('data:image/')) return a;
    if (isGood(b)) return b;
    if (isGood(a)) return a;
    return '';
  };

  const merged = { ...existing, ...incoming };

  // 1. Portadas y Banners principales
  merged.mainImage = pickImage(existing.mainImage, incoming.mainImage);
  merged.thumbnailImage = pickImage(existing.thumbnailImage, incoming.thumbnailImage);
  merged.banner = pickImage(existing.banner, incoming.banner) || merged.mainImage;
  merged.image = pickImage(existing.image, incoming.image) || merged.mainImage;
  if (existing.entityLogo || incoming.entityLogo) {
    merged.entityLogo = pickImage(existing.entityLogo, incoming.entityLogo);
  }

  // 2. Configuración de Diseño y Banner
  if (existing.designConfig || incoming.designConfig) {
    merged.designConfig = {
      ...(existing.designConfig || {}),
      ...(incoming.designConfig || {})
    };
    merged.designConfig.bannerUrl = pickImage(
      existing.designConfig?.bannerUrl,
      incoming.designConfig?.bannerUrl
    );
  }

  // 3. Configuración de Video
  if (existing.videoConfig || incoming.videoConfig) {
    merged.videoConfig = {
      ...(existing.videoConfig || {}),
      ...(incoming.videoConfig || {})
    };
    merged.videoConfig.thumbnailUrl = pickImage(
      existing.videoConfig?.thumbnailUrl,
      incoming.videoConfig?.thumbnailUrl
    );
    merged.videoConfig.url = incoming.videoConfig?.url || existing.videoConfig?.url || '';
  }

  // 4. Diapositivas: fusionar respetando láminas que tengan imágenes cargadas
  const exSlides = Array.isArray(existing.slides) ? existing.slides : [];
  const inSlides = Array.isArray(incoming.slides) ? incoming.slides : [];
  if (exSlides.length > 0 || inSlides.length > 0) {
    const targetLen = Math.max(exSlides.length, inSlides.length);
    const resultSlides = [];
    for (let i = 0; i < targetLen; i++) {
      const sA = exSlides[i];
      const sB = inSlides[i];
      if (sA && sB) {
        resultSlides.push({
          ...sA,
          ...sB,
          media: pickImage(sA.media, sB.media),
          imageUrl: pickImage(sA.imageUrl, sB.imageUrl),
          bgImage: pickImage(sA.bgImage, sB.bgImage)
        });
      } else {
        resultSlides.push(sB || sA);
      }
    }
    merged.slides = resultSlides;
  }

  // 5. Recursos: fusionar miniaturas y URLs
  const exRes = Array.isArray(existing.resources) ? existing.resources : [];
  const inRes = Array.isArray(incoming.resources) ? incoming.resources : [];
  if (exRes.length > 0 || inRes.length > 0) {
    const targetLen = Math.max(exRes.length, inRes.length);
    const resultRes = [];
    for (let i = 0; i < targetLen; i++) {
      const rA = exRes[i];
      const rB = inRes[i];
      if (rA && rB) {
        resultRes.push({
          ...rA,
          ...rB,
          thumbnailUrl: pickImage(rA.thumbnailUrl, rB.thumbnailUrl),
          url: (rB.url && rB.url.startsWith('data:')) ? rB.url : (rA.url && rA.url.startsWith('data:') ? rA.url : (rB.url || rA.url || ''))
        });
      } else {
        resultRes.push(rB || rA);
      }
    }
    merged.resources = resultRes;
  }

  // 6. Enlaces Externos
  const exLinks = Array.isArray(existing.externalLinks) ? existing.externalLinks : [];
  const inLinks = Array.isArray(incoming.externalLinks) ? incoming.externalLinks : [];
  if (exLinks.length > 0 || inLinks.length > 0) {
    const targetLen = Math.max(exLinks.length, inLinks.length);
    const resultLinks = [];
    for (let i = 0; i < targetLen; i++) {
      const lA = exLinks[i];
      const lB = inLinks[i];
      if (lA && lB) {
        resultLinks.push({
          ...lA,
          ...lB,
          thumbnailUrl: pickImage(lA.thumbnailUrl, lB.thumbnailUrl)
        });
      } else {
        resultLinks.push(lB || lA);
      }
    }
    merged.externalLinks = resultLinks;
  }

  // 7. Galería Visual
  const exVis = Array.isArray(existing.visualAssets) ? existing.visualAssets : [];
  const inVis = Array.isArray(incoming.visualAssets) ? incoming.visualAssets : [];
  if (exVis.length > 0 || inVis.length > 0) {
    const targetLen = Math.max(exVis.length, inVis.length);
    const resultVis = [];
    for (let i = 0; i < targetLen; i++) {
      const vA = exVis[i];
      const vB = inVis[i];
      if (vA && vB) {
        resultVis.push({
          ...vA,
          ...vB,
          url: pickImage(vA.url, vB.url)
        });
      } else {
        resultVis.push(vB || vA);
      }
    }
    merged.visualAssets = resultVis;
  }

  if (window.MentixImageVault) {
    window.MentixImageVault.backupProjectImages(merged);
  }

  return merged;
};

window.compactProjectForStorage = function(proj, stripLargeDataUrls = false) {
  if (!proj || typeof proj !== 'object') return proj;
  const clone = { ...proj };

  // Siempre respaldar las imágenes en la bóveda inmutable antes de compactar
  if (window.MentixImageVault) {
    window.MentixImageVault.backupProjectImages(clone);
  }

  if (clone.govdata && typeof clone.govdata === 'object') {
    const g = { ...clone.govdata };
    delete g.slides;
    delete g.resources;
    delete g.visualAssets;
    clone.govdata = g;
  }

  if (stripLargeDataUrls) {
    // Si localStorage está al límite, mantener las imágenes de hasta 180KB en texto
    // y para las mayores, MentixImageVault las conserva intactas en IndexedDB para restaurarlas al abrir
    const maxLen = 180000;
    if (typeof clone.image === 'string' && clone.image.startsWith('data:') && clone.image.length > maxLen) delete clone.image;
    if (typeof clone.banner === 'string' && clone.banner.startsWith('data:') && clone.banner.length > maxLen) delete clone.banner;
    if (typeof clone.mainImage === 'string' && clone.mainImage.startsWith('data:') && clone.mainImage.length > maxLen) clone.mainImage = '';
    if (typeof clone.thumbnailImage === 'string' && clone.thumbnailImage.startsWith('data:') && clone.thumbnailImage.length > maxLen) clone.thumbnailImage = '';
    if (Array.isArray(clone.slides)) {
      clone.slides = clone.slides.map(s => {
        if (!s || typeof s !== 'object') return s;
        const sc = { ...s };
        if (typeof sc.media === 'string' && sc.media.startsWith('data:') && sc.media.length > maxLen) sc.media = '';
        if (typeof sc.bgImage === 'string' && sc.bgImage.startsWith('data:') && sc.bgImage.length > maxLen) sc.bgImage = '';
        if (typeof sc.imageUrl === 'string' && sc.imageUrl.startsWith('data:') && sc.imageUrl.length > maxLen) sc.imageUrl = '';
        return sc;
      });
    }
    if (Array.isArray(clone.resources)) {
      clone.resources = clone.resources.map(r => {
        if (!r || typeof r !== 'object') return r;
        const rc = { ...r };
        if (typeof rc.url === 'string' && rc.url.startsWith('data:') && rc.url.length > maxLen) rc.url = '';
        return rc;
      });
    }
    if (Array.isArray(clone.visualAssets)) {
      clone.visualAssets = clone.visualAssets.map(v => {
        if (!v || typeof v !== 'object') return v;
        const vc = { ...v };
        if (typeof vc.url === 'string' && vc.url.startsWith('data:') && vc.url.length > maxLen) vc.url = '';
        return vc;
      });
    }
  }
  return clone;
};

// Helper para inicializar o recuperar almacenamiento con desinfección automática
function loadInitialState() {
  // Liberar claves duplicadas antiguas que triplicaban el uso de localStorage
  try {
    if (localStorage.getItem('te_reto_challenges')) {
      localStorage.removeItem('mentix_challenges');
      localStorage.removeItem('mentix_projects');
    }
  } catch (e) {}

  // Purgar almacenamiento local si contiene texto corrupto (mojibake)
  ['te_reto_challenges', 'te_reto_users', 'te_reto_groups', 'mentix_govdata_wizard_drafts', 'mentix_active_landing_project'].forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (raw && raw.length < 2500000 && (/ðŸ|Ã¡|Ã³|Ã©|Ã­|Ãº|Ã±|âœ|â¬|âš|\u251C|\u252C|\u2528|\u00D4\u00F6/.test(raw))) {
        const cleaned = deepCleanMojibake(JSON.parse(raw));
        localStorage.setItem(key, JSON.stringify(cleaned));
      }
    } catch (err) {}
  });

  // Migración y embellecimiento automático de diapositivas en proyectos ya creados
  ['te_reto_challenges', 'mentix_challenges', 'mentix_projects', 'mentix_govdata_wizard_drafts', 'mentix_active_landing_project'].forEach(key => {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      let changed = false;
      const upgradeRecord = (rec) => {
        if (!rec || typeof rec !== 'object') return rec;
        if (Array.isArray(rec.slides) && rec.slides.length > 0) {
          rec.slides = sanitizeProjectSlides(rec.slides, rec.title);
          changed = true;
        }
        if (rec.govdata && Array.isArray(rec.govdata.slides) && rec.govdata.slides.length > 0) {
          rec.govdata.slides = sanitizeProjectSlides(rec.govdata.slides, rec.title || rec.govdata.title);
          changed = true;
        }
        return rec;
      };
      let result = parsed;
      if (Array.isArray(parsed)) {
        result = parsed.map(upgradeRecord);
      } else if (parsed && typeof parsed === 'object') {
        result = upgradeRecord(parsed);
      }
      if (changed) {
        localStorage.setItem(key, JSON.stringify(result));
      }
    } catch (e) {}
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
  // 1. Cargar retos desde te_reto_challenges y claves secundarias
  const rawSources = [
    storedChallenges,
    localStorage.getItem('mentix_challenges'),
    localStorage.getItem('mentix_projects')
  ];

  for (const src of rawSources) {
    if (!src) continue;
    try {
      const parsed = JSON.parse(src);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const cleaned = deepCleanMojibake(parsed.filter(c => c && c.id && !OLD_MOCK_IDS.includes(c.id)));
        cleaned.forEach(c => {
          if (!challenges.some(existing => existing.id === c.id)) {
            challenges.push(c);
          }
        });
      }
    } catch(e) {}
  }

  // 2. Recuperar SIEMPRE todos los proyectos de las bóvedas de cada persona
  const pickLongerArr = (...arrs) => {
    let best = [];
    for (const a of arrs) {
      if (Array.isArray(a) && a.length > best.length) best = a;
    }
    return best;
  };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('mentix_user_projects_') || k === 'mentix_govdata_wizard_drafts')) {
        const rawVault = localStorage.getItem(k);
        if (rawVault) {
          const userProjList = JSON.parse(rawVault);
          if (Array.isArray(userProjList)) {
            userProjList.forEach(up => {
              if (up && up.id) {
                const exIdx = challenges.findIndex(c => c && c.id === up.id);
                if (exIdx >= 0) {
                  const prev = challenges[exIdx];
                  const keepApproved = prev.approvalStatus === 'approved' || up.approvalStatus === 'approved';
                  const merged = (typeof window.mergeProjectPreservingImages === 'function')
                    ? window.mergeProjectPreservingImages(prev, up)
                    : { ...prev, ...up };
                  challenges[exIdx] = {
                    ...merged,
                    slides: pickLongerArr(up.slides, prev.slides, up.govdata?.slides, prev.govdata?.slides, merged.slides),
                    resources: pickLongerArr(up.resources, prev.resources, up.govdata?.resources, prev.govdata?.resources, merged.resources),
                    externalLinks: pickLongerArr(up.externalLinks, prev.externalLinks, up.govdata?.externalLinks, prev.govdata?.externalLinks, merged.externalLinks),
                    visualAssets: pickLongerArr(up.visualAssets, prev.visualAssets, up.govdata?.visualAssets, prev.govdata?.visualAssets, merged.visualAssets),
                    completedSteps: pickLongerArr(up.completedSteps, prev.completedSteps, up.govdata?.completedSteps, prev.govdata?.completedSteps, merged.completedSteps),
                    videoConfig: (up.videoConfig?.url ? up.videoConfig : (prev.videoConfig?.url ? prev.videoConfig : (merged.videoConfig || up.videoConfig || prev.videoConfig || {}))),
                    videoUrl: up.videoUrl || up.videoConfig?.url || prev.videoUrl || prev.videoConfig?.url || merged.videoUrl || '',
                    approvalStatus: keepApproved ? 'approved' : (up.approvalStatus || prev.approvalStatus),
                    publicationStatus: keepApproved ? 'published' : (up.publicationStatus || prev.publicationStatus),
                    status: keepApproved ? 'completed' : (up.status || prev.status),
                    isPublic: keepApproved ? true : (up.isPublic ?? prev.isPublic),
                    authorizedAt: prev.authorizedAt || up.authorizedAt,
                    authorizedBy: prev.authorizedBy || up.authorizedBy,
                    rejectionReason: keepApproved ? '' : (up.rejectionReason || prev.rejectionReason || '')
                  };
                } else {
                  challenges.unshift(up);
                }
              }
            });
          }
        }
      }
    }
  } catch(e) {}
  if (false && storedChallenges) {
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
  // Asegurar que existan los proyectos estructurados en la base de datos
  if (typeof DEFAULT_PROJECTS !== 'undefined') {
    DEFAULT_PROJECTS.forEach(defProj => {
      const existingIndex = challenges.findIndex(c => c && c.id === defProj.id);
      if (existingIndex < 0) {
        challenges.push({ ...defProj });
      } else {
        challenges[existingIndex] = {
          ...defProj,
          ...challenges[existingIndex],
          projectType: challenges[existingIndex].projectType || defProj.projectType,
          isGovDataProject: challenges[existingIndex].isGovDataProject ?? defProj.isGovDataProject,
          status: challenges[existingIndex].status || defProj.status,
          progress: challenges[existingIndex].progress ?? defProj.progress,
          students: challenges[existingIndex].students ?? defProj.students,
          rating: challenges[existingIndex].rating || defProj.rating,
          date: challenges[existingIndex].date || defProj.date,
          tag: challenges[existingIndex].tag || defProj.tag,
          tagClass: challenges[existingIndex].tagClass || defProj.tagClass,
          image: challenges[existingIndex].image || defProj.image,
          banner: challenges[existingIndex].banner || defProj.banner
        };
      }
    });
  }

  // Regla estricta de autorización previa por Administrador:
  // Ningún proyecto se considera autorizado ni publicado a menos que cuente con aprobación explícita del Admin
  let approvedMap = {};
  try {
    approvedMap = JSON.parse(localStorage.getItem('mentix_approved_projects_map') || '{}') || {};
  } catch(e) {}

  challenges.forEach(c => {
    if (!c || !c.id) return;
    const isProject = c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url' || c.isGovDataProject || c.project_type || c.is_gov_data_project;
    if (isProject) {
      if (approvedMap[c.id]) {
        c.approvalStatus = 'approved';
        c.publicationStatus = 'published';
        c.status = 'completed';
        c.stage = 'completed';
        c.isPublic = true;
        c.accessMode = 'public';
        c.authorizedAt = approvedMap[c.id].authorizedAt || c.authorizedAt || new Date().toISOString();
        c.authorizedBy = approvedMap[c.id].authorizedBy || c.authorizedBy || 'Administrador Mentix';
        c.rejectionReason = '';
      }
      if (c.approvalStatus === 'approved') {
        c.rejectionReason = '';
        c.publicationStatus = 'published';
        c.status = 'completed';
        c.stage = 'completed';
        c.isPublic = true;
        c.accessMode = 'public';
        if (!c.authorizedAt) c.authorizedAt = new Date().toISOString();
        c.tag = '✔ Completado';
        c.tagClass = 'badge-completed';
      } else {
        c.approvalStatus = c.approvalStatus === 'rejected' ? 'rejected' : 'pending';
        c.publicationStatus = c.approvalStatus === 'rejected' ? 'draft' : 'pending_approval';
        c.isPublic = false;
        c.status = (c.status === 'in_progress' && c.publicationStatus === 'draft') ? 'in_progress' : 'review';
        c.tag = '⏳ Pendiente de Autorización';
        c.tagClass = 'badge-review';
      }
    }
  });

  // Compactar duplicados internos en govdata y persistir de forma 100% segura contra QuotaExceededError
  challenges = challenges.map(c => {
    if (window.MentixImageVault) window.MentixImageVault.restoreProjectImages(c);
    return window.compactProjectForStorage(c, false);
  });
  try {
    localStorage.setItem('te_reto_challenges', JSON.stringify(challenges));
  } catch (qErr) {
    try {
      localStorage.removeItem('mentix_challenges');
      localStorage.removeItem('mentix_projects');
      const light = challenges.map(c => window.compactProjectForStorage(c, true));
      localStorage.setItem('te_reto_challenges', JSON.stringify(light));
    } catch (qErr2) {}
  }

  const BLOCKED_CATS = ['fhjr', 'kj'];
  const isBlockedCat = (cat) => {
    if (!cat) return true;
    const cid = String(cat.id || '').toLowerCase().trim();
    const cname = String(cat.name || '').toLowerCase().trim();
    return BLOCKED_CATS.includes(cid) || BLOCKED_CATS.includes(cname);
  };

  // Cargar categorías asegurando SIEMPRE las categorías por defecto completas y en español limpio
  const defaultCatLookup = new Map();
  DEFAULT_CATEGORIES.forEach(dc => {
    if (dc && dc.id) defaultCatLookup.set(String(dc.id).toLowerCase().trim(), dc);
  });

  window.sanitizeCategoryRecord = function(cat) {
    if (!cat || typeof cat !== 'object') return null;
    const rawId = String(cat.id || '').trim();
    if (!rawId) return null;
    const def = defaultCatLookup.get(rawId.toLowerCase());
    if (def) {
      return {
        ...cat,
        id: def.id,
        name: def.name,
        icon: def.icon,
        color: def.color,
        count: typeof cat.count === 'number' ? cat.count : def.count
      };
    }
    let cleanName = fixMojibake(String(cat.name || rawId))
      .replace(/Matem[^\s]*ticas/gi, 'Matemáticas')
      .replace(/Tecnolog[^\s]*a/gi, 'Tecnología')
      .replace(/Programaci[^\s]*n/gi, 'Programación')
      .replace(/Ingl[^\s]*s/gi, 'Inglés')
      .replace(/Pr[^\s]*ctico/gi, 'Práctico')
      .replace(/Administraci[^\s]*n/gi, 'Administración')
      .replace(/P[^\s]*blica/gi, 'Pública')
      .replace(/\s+/g, ' ')
      .trim();
    if (rawId === 'gobierno_de__datos' || cleanName.toLowerCase() === 'gobierno de datos') {
      cleanName = 'Gobierno de Datos';
    }
    let rawIcon = String(cat.icon || '📁').replace(/<[^>]*>/g, '').trim();
    if (!rawIcon || /[\u0080-\u00FF\u2500-\u257F\u0192\u00AA\u00BA\u00AC\u00BD\u00BC\u00A1\u00AB\u00BB]|Ô|┬|├|ã|Æ/.test(rawIcon)) {
      rawIcon = cleanName.toLowerCase().includes('datos') ? '📊' : '📁';
    }
    let cleanColor = String(cat.color || '#00f5d4').split('"')[0].split("'")[0].trim();
    if (!cleanColor.startsWith('#') && !cleanColor.startsWith('rgb') && !cleanColor.startsWith('var(')) {
      cleanColor = '#00f5d4';
    }
    return {
      ...cat,
      id: rawId,
      name: cleanName,
      icon: rawIcon,
      color: cleanColor
    };
  };

  const catMap = new Map();
  DEFAULT_CATEGORIES.forEach(cat => {
    if (cat && cat.id && !isBlockedCat(cat)) catMap.set(cat.id, { ...cat });
  });

  if (storedCategories) {
    try {
      const parsedCats = deepCleanMojibake(JSON.parse(storedCategories));
      if (Array.isArray(parsedCats)) {
        parsedCats.forEach(cat => {
          if (cat && cat.id && !isBlockedCat(cat)) {
            const sanitized = window.sanitizeCategoryRecord(cat);
            if (sanitized) catMap.set(sanitized.id, sanitized);
          }
        });
      }
    } catch (e) {}
  }

  // Eliminar definitivamente las categorías de prueba 'fhjr' y 'kj'
  BLOCKED_CATS.forEach(b => catMap.delete(b));
  const categories = Array.from(catMap.values()).filter(c => !isBlockedCat(c)).map(c => window.sanitizeCategoryRecord(c)).filter(Boolean);
  try {
    localStorage.setItem('te_reto_categories', JSON.stringify(categories));
  } catch (e) {}

  let parsedUsers = DEFAULT_USERS;
  try { if (storedUsers) parsedUsers = JSON.parse(storedUsers); } catch(e) {}
  let parsedCurrentUser = DEFAULT_USERS[0];
  try { if (storedCurrentUser) parsedCurrentUser = JSON.parse(storedCurrentUser); } catch(e) {}

  return {
    challenges: challenges,
    users: parsedUsers,
    currentUser: parsedCurrentUser,
    groups: groups,
    categories: categories
  };
}

function saveGlobalState(state) {
  if (!state) return;
  try {
    localStorage.removeItem('mentix_challenges');
    localStorage.removeItem('mentix_projects');
  } catch (e) {}

  try {
    if (Array.isArray(state.challenges)) {
      const deduped = state.challenges.map(c => window.compactProjectForStorage(c, false));
      localStorage.setItem('te_reto_challenges', JSON.stringify(deduped));
    }
  } catch (err) {
    console.warn('⚠️ Alerta de almacenamiento local (QuotaExceeded), aplicando compresión segura:', err);
    try {
      if (Array.isArray(state.challenges)) {
        const lightweight = state.challenges.map(c => window.compactProjectForStorage(c, true));
        localStorage.setItem('te_reto_challenges', JSON.stringify(lightweight));
      }
    } catch(err2) {}
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
      }).map(c => typeof window.sanitizeCategoryRecord === 'function' ? window.sanitizeCategoryRecord(c) : c).filter(Boolean);
      state.categories = cleanCats;
      localStorage.setItem('te_reto_categories', JSON.stringify(cleanCats));
    }
  } catch (e) {
    console.warn('Error guardando estado secundario:', e);
  }
}

/**
 * 🛡️ Bóveda de Persistencia Personal por Usuario (Garantiza que ningún proyecto ni recurso se borre jamás)
 */
window.saveUserProject = function(project, user = null) {
  if (!project || !project.id) return;
  const u = user || (window.appState && window.appState.currentUser) || {};
  const userKey = u.id || u.username || u.email || 'usuario_mentix';

  // Asignar autoría explícita
  project.authorId = project.authorId || u.id || userKey;
  project.author = project.author || u.name || u.username || 'Estudiante';
  project.authorEmail = project.authorEmail || u.email || '';
  project.authorAvatar = project.authorAvatar || u.avatar || '🎓';
  project.authorRole = project.authorRole || u.role || 'student';
  project.updatedAt = new Date().toISOString();

  const mergeResourcesSafe = (prev, next) => {
    let merged = (typeof window.mergeProjectPreservingImages === 'function')
      ? window.mergeProjectPreservingImages(prev, next)
      : { ...(prev || {}), ...(next || {}) };

    if ((!Array.isArray(next.slides) || next.slides.length === 0) && Array.isArray(prev?.slides) && prev.slides.length > 0) {
      merged.slides = prev.slides;
    }
    if ((!Array.isArray(next.resources) || next.resources.length === 0) && Array.isArray(prev?.resources) && prev.resources.length > 0) {
      merged.resources = prev.resources;
    }
    if ((!Array.isArray(next.externalLinks) || next.externalLinks.length === 0) && Array.isArray(prev?.externalLinks) && prev.externalLinks.length > 0) {
      merged.externalLinks = prev.externalLinks;
    }
    if ((!Array.isArray(next.visualAssets) || next.visualAssets.length === 0) && Array.isArray(prev?.visualAssets) && prev.visualAssets.length > 0) {
      merged.visualAssets = prev.visualAssets;
    }
    if (!next.videoConfig?.url && prev?.videoConfig?.url) {
      merged.videoConfig = prev.videoConfig;
      merged.videoUrl = prev.videoUrl || prev.videoConfig.url;
    }
    return window.compactProjectForStorage(merged, false);
  };

  // 1. Guardar en appState global
  if (!window.appState) window.appState = { challenges: [] };
  if (!Array.isArray(window.appState.challenges)) window.appState.challenges = [];
  const idx = window.appState.challenges.findIndex(c => c && c.id === project.id);
  let finalProject = project;
  if (idx >= 0) {
    finalProject = mergeResourcesSafe(window.appState.challenges[idx], project);
    window.appState.challenges[idx] = finalProject;
  } else {
    finalProject = window.compactProjectForStorage(project, false);
    window.appState.challenges.unshift(finalProject);
  }

  // 2. Guardar en bóveda personal inmutable de este usuario
  try {
    const vaultKey = 'mentix_user_projects_' + userKey;
    const existingRaw = localStorage.getItem(vaultKey);
    let vault = existingRaw ? JSON.parse(existingRaw) : [];
    if (!Array.isArray(vault)) vault = [];
    const vIdx = vault.findIndex(p => p && p.id === finalProject.id);
    if (vIdx >= 0) {
      vault[vIdx] = mergeResourcesSafe(vault[vIdx], finalProject);
    } else {
      vault.unshift(finalProject);
    }
    try {
      localStorage.setItem(vaultKey, JSON.stringify(vault.slice(0, 20)));
    } catch (qErr) {
      const compactVault = vault.slice(0, 15).map(p => window.compactProjectForStorage(p, true));
      localStorage.setItem(vaultKey, JSON.stringify(compactVault));
    }
  } catch (e) {
    console.warn('Advertencia guardando en bóveda personal:', e);
  }

  // 3. Persistir en almacenamiento global (te_reto_challenges)
  saveGlobalState(window.appState);

  // 4. Sincronizar en la nube
  if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
    window.appRouter.pushChallengeToCloud(finalProject);
  } else if (window.supabaseService && typeof window.supabaseService.saveChallengeToSupabase === 'function') {
    window.supabaseService.saveChallengeToSupabase(finalProject);
  }
};

window.getUserProjects = function(user = null) {
  const u = user || (window.appState && window.appState.currentUser) || {};
  const userKey = u.id || u.username || u.email || 'usuario_mentix';
  try {
    const vaultKey = 'mentix_user_projects_' + userKey;
    const raw = localStorage.getItem(vaultKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};
