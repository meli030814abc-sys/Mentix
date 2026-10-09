// API Serverless de Categorías Globales para MENTIX en Vercel
const GITHUB_REPO = 'meli030814abc-sys/Mentix';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const FILE_PATH = 'data/categories.json';

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

export default async function handler(req, res) {
  // Configurar CORS para acceso desde cualquier dispositivo o navegador
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET: Obtener todas las categorías públicas compartidas
  if (req.method === 'GET') {
    try {
      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, {
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'Mentix-App'
        }
      });

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
        const categories = JSON.parse(contentStr);
        return res.status(200).json(categories);
      }
    } catch (e) {
      console.warn('Error leyendo categorías desde GitHub:', e);
    }
    return res.status(200).json(DEFAULT_CATEGORIES);
  }

  // POST: Crear y guardar una nueva categoría para que la vean todos
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const newCat = body.category || body;

      if (!newCat || !newCat.name) {
        return res.status(400).json({ error: 'Nombre de categoría requerido' });
      }

      // 1. Obtener contenido actual y SHA del archivo en GitHub
      let currentCategories = [...DEFAULT_CATEGORIES];
      let currentSha = null;

      try {
        const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, {
          headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
            'User-Agent': 'Mentix-App'
          }
        });

        if (ghGet.ok) {
          const ghData = await ghGet.json();
          currentSha = ghData.sha;
          const contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
          currentCategories = JSON.parse(contentStr);
        }
      } catch (err) {
        console.warn('No se pudo obtener SHA actual de GitHub:', err);
      }

      // 2. Fusionar nueva categoría sin duplicados
      const cleanId = newCat.id || newCat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
      const preparedCat = {
        id: cleanId,
        name: newCat.name.trim(),
        icon: newCat.icon || '💡',
        color: newCat.color || '#00f5d4',
        count: newCat.count || 0
      };

      const existingIndex = currentCategories.findIndex(c => c.id === preparedCat.id);
      if (existingIndex >= 0) {
        currentCategories[existingIndex] = { ...currentCategories[existingIndex], ...preparedCat };
      } else {
        currentCategories.push(preparedCat);
      }

      // 3. Escribir archivo actualizado en GitHub
      const updatedBuffer = Buffer.from(JSON.stringify(currentCategories, null, 2), 'utf8').toString('base64');
      const putPayload = {
        message: `feat: guardar categoria global "${preparedCat.name}" para todos los usuarios`,
        content: updatedBuffer,
        branch: 'main'
      };
      if (currentSha) {
        putPayload.sha = currentSha;
      }

      const ghPut = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mentix-App'
        },
        body: JSON.stringify(putPayload)
      });

      if (!ghPut.ok) {
        const putErr = await ghPut.text();
        console.error('Error al guardar en GitHub:', putErr);
      }

      return res.status(200).json({ success: true, categories: currentCategories, category: preparedCat });
    } catch (err) {
      console.error('Error procesando POST /api/categories:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
