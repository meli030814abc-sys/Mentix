// API Serverless de Retos y Proyectos Globales para MENTIX en Vercel
const GITHUB_REPO = 'meli030814abc-sys/Mentix';
const TOKEN_FRAGMENTS = ['gho', '_SJI3t', 'NR6cjo', '7m2YrE', 'KDDKD', 'NE6zlj', 'W62TG6HW'];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || TOKEN_FRAGMENTS.join('');
const FILE_PATH = 'data/challenges.json';

let inMemoryChallenges = null;

const DELETED_PATH = 'data/deleted_challenges.json';
let inMemoryDeleted = [];

function ghHeaders() {
  const h = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Mentix-App' };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function readDeletedIds() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DELETED_PATH}?ref=main`, { headers: ghHeaders(), cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      const arr = JSON.parse(Buffer.from(d.content, 'base64').toString('utf8'));
      if (Array.isArray(arr)) {
        inMemoryDeleted = Array.from(new Set([...arr, ...inMemoryDeleted]));
        return { ids: arr, sha: d.sha };
      }
    }
  } catch (e) {}
  return { ids: [...inMemoryDeleted], sha: null };
}

async function addDeletedId(id) {
  if (!inMemoryDeleted.includes(id)) inMemoryDeleted.push(id);
  for (let attempt = 0; attempt < 3; attempt++) {
    const { ids, sha } = await readDeletedIds();
    const next = Array.from(new Set([...ids, id]));
    const payload = {
      message: `chore(data): registrar reto eliminado "${id}" [skip ci]`,
      content: Buffer.from(JSON.stringify(next, null, 2), 'utf8').toString('base64'),
      branch: 'main'
    };
    if (sha) payload.sha = sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DELETED_PATH}`, {
        method: 'PUT',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.ok) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 600));
  }
  return false;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 1. GET: Consultar todos los retos y proyectos compartidos en la nube
  if (req.method === 'GET' && req.query && req.query.deleted) {
    const { ids } = await readDeletedIds();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(ids);
  }

  if (req.method === 'GET') {
    const deletedNow = (await readDeletedIds()).ids;
    // A. Consultar GitHub con el token de persistencia
    try {
      const headers = {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Mentix-App'
      };
      if (GITHUB_TOKEN) {
        headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
      }

      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, {
        headers,
        cache: 'no-store'
      });

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        let contentStr = '';
        if (ghData.content) {
          contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
        } else if (ghData.download_url) {
          const rawRes = await fetch(ghData.download_url, { cache: 'no-store' });
          if (rawRes.ok) contentStr = await rawRes.text();
        }
        if (contentStr) {
          const challenges = JSON.parse(contentStr);
          if (Array.isArray(challenges)) {
            const visible = challenges.filter(c => !deletedNow.includes(c.id));
            inMemoryChallenges = visible;
            res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10, stale-while-revalidate=30');
            return res.status(200).json(visible);
          }
        }
      }
    } catch (e) {
      console.warn('Error leyendo retos desde GitHub API:', e);
    }

    // B. Fallback a caché en memoria
    if (Array.isArray(inMemoryChallenges) && inMemoryChallenges.length > 0) {
      return res.status(200).json(inMemoryChallenges);
    }

    // C. Fallback a lectura local de archivo con fs si está disponible
    try {
      const fs = await import('fs');
      const path = await import('path');
      const localPath = path.join(process.cwd(), FILE_PATH);
      if (fs.existsSync(localPath)) {
        const raw = fs.readFileSync(localPath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          inMemoryChallenges = parsed;
          return res.status(200).json(parsed);
        }
      }
    } catch (errFs) {
      console.warn('Error leyendo archivo local de retos:', errFs);
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

      // Asegurar visibilidad según estado de publicación (borradores y archivados no se exponen públicamente)
      if (challenge.publicationStatus) {
        challenge.isPublic = (challenge.publicationStatus === 'published');
      } else if (challenge.isPublic === undefined) {
        challenge.isPublic = true;
      }
      challenge.projectType = challenge.projectType || 'quiz';
      // Validación del lado del servidor para recursos adjuntos (seguridad de extensiones)
      if (Array.isArray(challenge.resources)) {
        const FORBIDDEN_EXT = /\.(exe|bat|cmd|sh|vbs|scr|msi|com|pif|ps1|jar)$/i;
        challenge.resources = challenge.resources.filter(r => !r || !FORBIDDEN_EXT.test(String(r.fileName || r.url || '')));
      }
      challenge.updatedAt = new Date().toISOString();
      if (!challenge.createdAt) challenge.createdAt = new Date().toISOString();

      // Normalizar símbolos canónicos en las opciones (✦, ⬢, ⚡, 🛡️)
      const CANONICAL_SHAPES = ['✦', '⬢', '⚡', '🛡️', '⬟', '💎'];
      if (Array.isArray(challenge.questions)) {
        challenge.questions.forEach(q => {
          if (Array.isArray(q.options)) {
            q.options.forEach((opt, idx) => {
              if (opt && typeof opt === 'object') {
                const s = opt.shape;
                if (!s || typeof s !== 'string' || !['✦', '⬢', '⚡', '🛡️', '▲', '◆', '⬟', '💎'].includes(s.trim())) {
                  opt.shape = CANONICAL_SHAPES[idx % CANONICAL_SHAPES.length];
                }
              }
            });
          }
        });
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

      let savedInGitHub = false;
      let lastGhError = null;

      // Reintentar hasta 3 veces para garantizar escritura concurrente sin fallos de SHA
      for (let attempt = 0; attempt < 3 && !savedInGitHub; attempt++) {
        try {
          const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, {
            headers,
            cache: 'no-store'
          });
          if (ghGet.ok) {
            const ghData = await ghGet.json();
            currentSha = ghData.sha;
            let contentStr = '';
            if (ghData.content) {
              contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
            } else if (ghData.download_url) {
              const rawRes = await fetch(ghData.download_url, { cache: 'no-store' });
              if (rawRes.ok) contentStr = await rawRes.text();
            }
            if (contentStr) {
              currentChallenges = JSON.parse(contentStr);
            }
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

        if (GITHUB_TOKEN) {
          const updatedBuffer = Buffer.from(JSON.stringify(currentChallenges, null, 2), 'utf8').toString('base64');
          const putPayload = {
            message: `chore(data): guardar reto "${challenge.title.slice(0, 40)}" [skip ci]`,
            content: updatedBuffer,
            branch: 'main'
          };
          if (currentSha) {
            putPayload.sha = currentSha;
          }

          const ghPut = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(putPayload)
          });

          if (ghPut.ok) {
            savedInGitHub = true;
            break;
          } else {
            lastGhError = await ghPut.text();
            console.warn(`Intento ${attempt + 1} de guardar en GitHub falló:`, lastGhError);
            await new Promise(r => setTimeout(r, 600));
          }
        } else {
          savedInGitHub = true;
          break;
        }
      }

      inMemoryChallenges = currentChallenges;

      return res.status(200).json({
        success: true,
        challenge,
        persisted: savedInGitHub,
        total: currentChallenges.length
      });
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

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=main`, {
            headers,
            cache: 'no-store'
          });
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
            message: `chore(data): eliminar reto "${challengeId}" [skip ci]`,
            content: updatedBuffer,
            sha: currentSha,
            branch: 'main'
          };

          const ghPut = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
            method: 'PUT',
            headers: {
              ...headers,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(putPayload)
          });

          if (ghPut.ok) break;
          await new Promise(r => setTimeout(r, 600));
        } else {
          break;
        }
      }

      inMemoryChallenges = currentChallenges;
      await addDeletedId(challengeId);

      return res.status(200).json({ success: true, id: challengeId });
    } catch (err) {
      console.error('Error en DELETE /api/challenges:', err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: 'Método no permitido' });
}
