// API Serverless de Retos y Proyectos Globales para MENTIX en Vercel
const GITHUB_REPO = 'meli030814abc-sys/Mentix';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';
const FILE_PATH = 'data/challenges.json';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Consultar todos los retos y proyectos compartidos en la nube
  if (req.method === 'GET') {
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mentix-App'
      };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, { headers });
      if (ghRes.ok) {
        const ghData = await ghRes.json();
        const contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
        const challenges = JSON.parse(contentStr);
        return res.status(200).json(Array.isArray(challenges) ? challenges : []);
      }
    } catch (e) {
      console.warn('Error leyendo retos desde GitHub:', e);
    }
    return res.status(200).json([]);
  }

  // 2. POST: Guardar o actualizar un reto / proyecto público
  if (req.method === 'POST') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const challenge = body.challenge || body;

      if (!challenge || !challenge.id || !challenge.title) {
        return res.status(400).json({ error: 'Reto inválido o incompleto' });
      }

      let currentChallenges = [];
      let currentSha = null;

      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mentix-App'
      };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      try {
        const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, { headers });
        if (ghGet.ok) {
          const ghData = await ghGet.json();
          currentSha = ghData.sha;
          const contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
          currentChallenges = JSON.parse(contentStr);
          if (!Array.isArray(currentChallenges)) currentChallenges = [];
        }
      } catch (err) {
        console.warn('No se pudo obtener SHA de GitHub:', err);
      }

      // Fusionar o agregar nuevo reto
      const existingIdx = currentChallenges.findIndex(c => c.id === challenge.id);
      if (existingIdx >= 0) {
        currentChallenges[existingIdx] = { ...currentChallenges[existingIdx], ...challenge };
      } else {
        currentChallenges.unshift(challenge);
      }

      // Si tenemos token de GitHub, persistir en el repositorio
      if (GITHUB_TOKEN) {
        const updatedBuffer = Buffer.from(JSON.stringify(currentChallenges, null, 2), 'utf8').toString('base64');
        const putPayload = {
          message: `feat: guardar reto "${challenge.title.slice(0, 40)}" para la comunidad`,
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
          const errText = await ghPut.text();
          console.error('Error al actualizar GitHub:', errText);
        }
      }

      return res.status(200).json({ success: true, challenge });
    } catch (err) {
      console.error('Error procesando POST /api/challenges:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  // 3. DELETE: Eliminar un reto por ID
  if (req.method === 'DELETE') {
    try {
      const challengeId = req.query?.id || (typeof req.body === 'object' ? req.body?.id : null);
      if (!challengeId) {
        return res.status(400).json({ error: 'ID de reto requerido' });
      }

      let currentChallenges = [];
      let currentSha = null;

      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mentix-App'
      };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      try {
        const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, { headers });
        if (ghGet.ok) {
          const ghData = await ghGet.json();
          currentSha = ghData.sha;
          const contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
          currentChallenges = JSON.parse(contentStr);
          if (!Array.isArray(currentChallenges)) currentChallenges = [];
        }
      } catch (err) {
        console.warn('No se pudo leer GitHub para DELETE:', err);
      }

      currentChallenges = currentChallenges.filter(c => c.id !== challengeId);

      if (GITHUB_TOKEN && currentSha) {
        const updatedBuffer = Buffer.from(JSON.stringify(currentChallenges, null, 2), 'utf8').toString('base64');
        const putPayload = {
          message: `feat: eliminar reto "${challengeId}" de la comunidad`,
          content: updatedBuffer,
          sha: currentSha,
          branch: 'main'
        };

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
      }

      return res.status(200).json({ success: true, id: challengeId });
    } catch (err) {
      console.error('Error en DELETE /api/challenges:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
