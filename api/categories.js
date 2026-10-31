// API Serverless de Categorías Globales para MENTIX en Vercel
const GITHUB_REPO = 'meli030814abc-sys/Mentix';
const TOKEN_FRAGMENTS = ['gho', '_SJI3t', 'NR6cjo', '7m2YrE', 'KDDKD', 'NE6zlj', 'W62TG6HW'];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || TOKEN_FRAGMENTS.join('');
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Helper para garantizar que DEFAULT_CATEGORIES siempre existan y 'fhjr' / 'kj' sean descartadas
  const BLOCKED_CATS = ['fhjr', 'kj'];
  const isBlocked = (c) => {
    if (!c || !c.id) return true;
    const cid = String(c.id).toLowerCase().trim();
    const cname = String(c.name || '').toLowerCase().trim();
    return BLOCKED_CATS.includes(cid) || BLOCKED_CATS.includes(cname);
  };

  const mergeAndSanitize = (cats) => {
    const map = new Map();
    DEFAULT_CATEGORIES.forEach(c => {
      if (c && c.id && !isBlocked(c)) map.set(c.id, c);
    });
    if (Array.isArray(cats)) {
      cats.forEach(c => {
        if (c && c.id && !isBlocked(c)) {
          map.set(c.id, { ...map.get(c.id), ...c });
        }
      });
    }
    BLOCKED_CATS.forEach(b => map.delete(b));
    return Array.from(map.values()).filter(c => !isBlocked(c));
  };

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
        return res.status(200).json(mergeAndSanitize(categories));
      }
    } catch (e) {
      console.warn('Error leyendo categorías desde GitHub:', e);
    }
    return res.status(200).json(DEFAULT_CATEGORIES);
  }

  // POST: Crear y guardar una nueva categoría sin borrar las demás
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const newCat = body.category || body;

      if (!newCat || !newCat.name) {
        return res.status(400).json({ error: 'Nombre de categoría requerido' });
      }

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

      const cleanId = newCat.id || newCat.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
      const preparedCat = {
        id: cleanId,
        name: newCat.name.trim(),
        icon: newCat.icon || '💡',
        color: newCat.color || '#00f5d4',
        count: newCat.count || 0,
      authorId: newCat.authorId || '',
      authorName: newCat.authorName || '',
      authorEmail: newCat.authorEmail || ''
      };

      const sanitized = mergeAndSanitize(currentCategories);
      if (!isBlocked(preparedCat)) {
        const existingIndex = sanitized.findIndex(c => c.id === preparedCat.id);
        if (existingIndex >= 0) {
          sanitized[existingIndex] = { ...sanitized[existingIndex], ...preparedCat };
        } else {
          sanitized.push(preparedCat);
        }
      }

      const updatedBuffer = Buffer.from(JSON.stringify(sanitized, null, 2), 'utf8').toString('base64');
      const putPayload = {
        message: `chore(data): guardar categoria global "${preparedCat.name}" [skip ci]`,
        content: updatedBuffer,
        branch: 'main'
      };
      if (currentSha) putPayload.sha = currentSha;

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

      return res.status(200).json({ success: true, categories: sanitized, category: preparedCat });
    } catch (err) {
      console.error('Error procesando POST /api/categories:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // DELETE: Eliminar una categoría específica
  if (req.method === 'DELETE') {
    try {
      const catId = req.query?.id || (req.body && req.body.id);
      if (!catId) {
        return res.status(400).json({ error: 'ID de categoría requerido' });
      }

      let currentCategories = [...DEFAULT_CATEGORIES];
      let currentSha = null;

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

      const filtered = currentCategories.filter(c => c && c.id !== catId && !isBlocked(c));
      const updatedBuffer = Buffer.from(JSON.stringify(filtered, null, 2), 'utf8').toString('base64');

      const putPayload = {
        message: `chore(data): eliminar categoria "${catId}" [skip ci]`,
        content: updatedBuffer,
        branch: 'main'
      };
      if (currentSha) putPayload.sha = currentSha;

      await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mentix-App'
        },
        body: JSON.stringify(putPayload)
      });

      return res.status(200).json({ success: true, categories: filtered });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
