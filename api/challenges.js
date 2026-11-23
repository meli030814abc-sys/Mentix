// API Serverless de Retos y Proyectos Globales para MENTIX en Vercel
import nodeCryptoMod from 'crypto';
const GITHUB_REPO = 'meli030814abc-sys/Mentix';
const TOKEN_FRAGMENTS = [];
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
const FILE_PATH = 'data/challenges.json';
const DATA_BRANCH = 'mentix-data';

let inMemoryChallenges = null;

const DELETED_PATH = 'data/deleted_challenges.json';
let inMemoryDeleted = [];

const CODES_PATH = 'data/custom_project_codes.json';
let inMemoryCodes = null;

const HERO_BANNER_PATH = 'data/hero_banner.json';
let inMemoryHeroBanner = null;

const HUBS_PATH = 'data/project_hubs.json';
let inMemoryHubs = null;

const CODE_PARTICIPANTS_PATH = 'data/code_participants.json';
let inMemoryCodeParticipants = null;

const inMemoryImages = new Map();

const USERS_PATH = 'data/users_registry.json';
let inMemoryUsers = null;
const nodeCrypto = { createHmac: (...a) => nodeCryptoMod.createHmac(...a) };
// La contraseña (ya hasheada en el cliente) se vuelve a firmar con un secreto del servidor antes de guardarse; nunca se devuelve por la API
function sealPwd(clientHash) {
  const pepper = process.env.USERS_PEPPER || GITHUB_TOKEN || 'mentix-pepper';
  return nodeCrypto.createHmac('sha256', pepper).update(String(clientHash || '')).digest('hex');
}
function publicUser(x) { const c = { ...x, hasPwd: !!x.pwd }; delete c.pwd; delete c.passwordHash; return c; }

function ghHeaders() {
  const h = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Mentix-App' };
  if (GITHUB_TOKEN) h['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

async function readGitHubJsonFile(filePath, fallbackVal) {
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}?ref=${DATA_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      let str = '';
      if (d.content) str = Buffer.from(d.content, 'base64').toString('utf8');
      else if (d.download_url) {
        const rawRes = await fetch(d.download_url, { cache: 'no-store' });
        if (rawRes.ok) str = await rawRes.text();
      }
      if (str) {
        return { data: JSON.parse(str), sha: d.sha };
      }
    }
  } catch (e) {}
  return { data: fallbackVal, sha: null };
}

async function writeGitHubJsonFile(filePath, dataObj, commitMessage) {
  if (!GITHUB_TOKEN) return false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { sha } = await readGitHubJsonFile(filePath, null);
    const payload = {
      message: `${commitMessage} [skip ci]`,
      content: Buffer.from(JSON.stringify(dataObj, null, 2), 'utf8').toString('base64'),
      branch: DATA_BRANCH
    };
    if (sha) payload.sha = sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
        method: 'PUT',
        headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (r.ok) return true;
    } catch (e) {}
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function readCustomProjectCodes(forceGitHub = false) {
  if (!forceGitHub && !GITHUB_TOKEN && Array.isArray(inMemoryCodes)) {
    return { codes: inMemoryCodes, sha: null };
  }
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${CODES_PATH}?ref=${DATA_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
    if (r.ok) {
      const d = await r.json();
      const str = Buffer.from(d.content, 'base64').toString('utf8');
      const arr = JSON.parse(str);
      if (Array.isArray(arr)) {
        inMemoryCodes = arr;
        return { codes: arr, sha: d.sha };
      }
    }
  } catch (e) {}
  if (Array.isArray(inMemoryCodes)) {
    return { codes: inMemoryCodes, sha: null };
  }
  try {
    const fs = await import('fs');
    const path = await import('path');
    const localPath = path.join(process.cwd(), CODES_PATH);
    if (fs.existsSync(localPath)) {
      const parsed = JSON.parse(fs.readFileSync(localPath, 'utf8'));
      if (Array.isArray(parsed)) {
        inMemoryCodes = parsed;
        return { codes: parsed, sha: null };
      }
    }
  } catch (e) {}
  return { codes: inMemoryCodes || [], sha: null };
}

async function saveCustomProjectCodes(newCodes) {
  const cleanList = Array.isArray(newCodes) ? newCodes : [];
  inMemoryCodes = cleanList;
  if (!GITHUB_TOKEN) return false;
  for (let attempt = 0; attempt < 3; attempt++) {
    const { sha } = await readCustomProjectCodes(true);
    const payload = {
      message: `chore(data): sincronizar codigos de proyectos [skip ci]`,
      content: Buffer.from(JSON.stringify(cleanList, null, 2), 'utf8').toString('base64'),
      branch: DATA_BRANCH
    };
    if (sha) payload.sha = sha;
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${CODES_PATH}`, {
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

async function readDeletedIds() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${DELETED_PATH}?ref=${DATA_BRANCH}`, { headers: ghHeaders(), cache: 'no-store' });
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
      branch: DATA_BRANCH
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

  // 0. Diagnóstico de la conexión con GitHub (no expone el token)
  if (req.method === 'GET' && req.query && req.query.status) {
    const info = { hasToken: !!GITHUB_TOKEN, tokenLength: GITHUB_TOKEN ? GITHUB_TOKEN.length : 0, tokenValid: false, canWrite: false };
    if (GITHUB_TOKEN) {
      try {
        const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, { headers: ghHeaders(), cache: 'no-store' });
        info.githubStatus = r.status;
        if (r.ok) {
          const d = await r.json();
          info.tokenValid = true;
          info.canWrite = !!(d.permissions && d.permissions.push);
        }
      } catch (e) { info.error = String(e.message || e); }
    }
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(info);
  }

  // 0b. GET ?img=data/uploads/... : Servir imagen real guardada en el repositorio/BD (rama mentix-data)
  if (req.method === 'GET' && req.query && req.query.img) {
    const rawPath = String(req.query.img || '').trim().replace(/^\/+/, '');
    if (!rawPath.startsWith('data/uploads/') || rawPath.includes('..') || !/^data\/uploads\/[a-zA-Z0-9_\-\/\.]+$/.test(rawPath)) {
      return res.status(400).json({ error: 'Ruta de imagen inválida' });
    }
    const ext = rawPath.split('.').pop().toLowerCase();
    const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' };
    const contentType = mimeMap[ext] || 'image/jpeg';

    if (inMemoryImages.has(rawPath)) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      return res.status(200).send(inMemoryImages.get(rawPath));
    }

    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${rawPath}?ref=${DATA_BRANCH}`, {
        headers: ghHeaders(),
        cache: 'no-store'
      });
      if (r.ok) {
        const d = await r.json();
        let buf = null;
        if (d.content) {
          buf = Buffer.from(d.content.replace(/\s+/g, ''), 'base64');
        } else if (d.download_url) {
          const rawRes = await fetch(d.download_url, { headers: ghHeaders(), cache: 'no-store' });
          if (rawRes.ok) buf = Buffer.from(await rawRes.arrayBuffer());
        }
        if (buf && buf.length > 0) {
          if (inMemoryImages.size > 40) {
            const firstKey = inMemoryImages.keys().next().value;
            inMemoryImages.delete(firstKey);
          }
          inMemoryImages.set(rawPath, buf);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          return res.status(200).send(buf);
        }
      }
    } catch (e) {}
    return res.status(404).json({ error: 'Imagen no encontrada' });
  }

  // 1. GET: Consultar banner global, hubs, participantes de códigos, códigos o retos
  if (req.method === 'GET' && req.query && (req.query.heroBanner || req.query.banner)) {
    const { data } = await readGitHubJsonFile(HERO_BANNER_PATH, inMemoryHeroBanner);
    if (data && data.bannerUrl) inMemoryHeroBanner = data;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(inMemoryHeroBanner || { bannerUrl: '', style: null, updatedAt: 0 });
  }

  if (req.method === 'GET' && req.query && req.query.users) {
    const { data } = await readGitHubJsonFile(USERS_PATH, inMemoryUsers || []);
    if (Array.isArray(data)) inMemoryUsers = data;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json((inMemoryUsers || []).map(publicUser));
  }

  if (req.method === 'GET' && req.query && (req.query.hubs || req.query.hubId)) {
    const { data } = await readGitHubJsonFile(HUBS_PATH, inMemoryHubs || {});
    if (data && typeof data === 'object') inMemoryHubs = data;
    const hubsMap = inMemoryHubs || {};
    res.setHeader('Cache-Control', 'no-store');
    if (req.query.hubId) {
      return res.status(200).json(hubsMap[String(req.query.hubId)] || null);
    }
    return res.status(200).json(hubsMap);
  }

  if (req.method === 'GET' && req.query && req.query.codeParticipants) {
    const { data } = await readGitHubJsonFile(CODE_PARTICIPANTS_PATH, inMemoryCodeParticipants || {});
    if (data && typeof data === 'object') inMemoryCodeParticipants = data;
    const map = inMemoryCodeParticipants || {};
    res.setHeader('Cache-Control', 'no-store');
    if (req.query.code) {
      const k = String(req.query.code).trim().toLowerCase().replace(/[\s\-_]/g, '');
      return res.status(200).json(Array.isArray(map[k]) ? map[k] : []);
    }
    return res.status(200).json(map);
  }

  if (req.method === 'GET' && req.query && (req.query.customCodes || req.query.codes)) {
    const { codes } = await readCustomProjectCodes(true);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(codes);
  }

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

      const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${DATA_BRANCH}&t=${Date.now()}`, {
        headers: { ...headers, 'Cache-Control': 'no-cache' },
        cache: 'no-store'
      });

      if (ghRes.ok) {
        const ghData = await ghRes.json();
        let contentStr = '';
        if (ghData.content) {
          contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
        } else if (ghData.download_url) {
          const rawRes = await fetch(`${ghData.download_url}?t=${Date.now()}`, { cache: 'no-store' });
          if (rawRes.ok) contentStr = await rawRes.text();
        }
        if (contentStr) {
          const challenges = JSON.parse(contentStr);
          if (Array.isArray(challenges)) {
            const visible = challenges.filter(c => !deletedNow.includes(c.id));
            inMemoryChallenges = visible;
            if (req.query && (req.query.t || req.query.fresh)) {
              res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
            } else {
              res.setHeader('Cache-Control', 'public, max-age=5, s-maxage=10, stale-while-revalidate=30');
            }
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

      // A0. Subida y almacenamiento permanente de imágenes dentro del mismo proyecto y BD (data/uploads/<projectId>/...)
      if (body && body.type === 'UPLOAD_PROJECT_IMAGE' && body.dataUrl) {
        const dataUrl = String(body.dataUrl || '').trim();
        const m = dataUrl.match(/^data:(image\/(jpeg|jpg|png|webp|gif));base64,([A-Za-z0-9+/=\s]+)$/i);
        if (!m) {
          return res.status(400).json({ error: 'Formato de imagen no válido (se requiere data:image/...;base64,...)' });
        }
        const rawExt = m[2].toLowerCase() === 'jpeg' ? 'jpg' : m[2].toLowerCase();
        const b64Clean = m[3].replace(/\s+/g, '');
        const safeProj = String(body.projectId || 'general').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 64) || 'general';
        const safeSlot = String(body.slot || 'img').replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 32) || 'img';
        const filePath = `data/uploads/${safeProj}/${Date.now()}_${Math.random().toString(36).slice(2, 6)}_${safeSlot}.${rawExt}`;

        const buf = Buffer.from(b64Clean, 'base64');
        if (buf.length > 3500000) {
          return res.status(413).json({ error: 'Imagen demasiado grande (máx 3.5 MB)' });
        }

        let persisted = false;
        if (GITHUB_TOKEN) {
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              const ghPut = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
                method: 'PUT',
                headers: { ...ghHeaders(), 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  message: `chore(media): subir imagen ${safeProj}/${safeSlot} [skip ci]`,
                  content: b64Clean,
                  branch: DATA_BRANCH
                })
              });
              if (ghPut.ok) { persisted = true; break; }
            } catch (e) {}
            await new Promise(r => setTimeout(r, 400));
          }
        }

        if (persisted) {
          if (inMemoryImages.size > 40) {
            const firstKey = inMemoryImages.keys().next().value;
            inMemoryImages.delete(firstKey);
          }
          inMemoryImages.set(filePath, buf);
          const publicUrl = `https://mentixs.vercel.app/api/challenges?img=${encodeURIComponent(filePath)}`;
          return res.status(200).json({ success: true, persisted: true, path: filePath, url: publicUrl });
        }
        return res.status(200).json({ success: false, persisted: false });
      }

      // A. Soporte para actualización y persistencia mundial del banner principal (Hero de Proyectos) + encuadre
      if (body && (body.type === 'GLOBAL_HERO_BANNER' || body.target === 'hero') && (body.bannerUrl || body.style)) {
        const { data: prevBanner } = await readGitHubJsonFile(HERO_BANNER_PATH, inMemoryHeroBanner || {});
        const cleanBanner = body.bannerUrl ? String(body.bannerUrl).trim() : (prevBanner && prevBanner.bannerUrl ? String(prevBanner.bannerUrl).trim() : '');
        const cleanStyle = (body.style && typeof body.style === 'object') ? body.style : (prevBanner && prevBanner.style ? prevBanner.style : null);
        const nowTs = Number(body.updatedAt || Date.now());
        const bannerPayload = {
          bannerUrl: cleanBanner,
          style: cleanStyle,
          updatedAt: nowTs
        };
        inMemoryHeroBanner = bannerPayload;
        const savedDedicated = await writeGitHubJsonFile(HERO_BANNER_PATH, bannerPayload, 'chore(data): actualizar banner principal global');

        // También reflejar en challenges.json solo si es URL corta (evita inflar challenges.json)
        if (cleanBanner && cleanBanner.length < 4000 && Array.isArray(inMemoryChallenges)) {
          inMemoryChallenges.forEach(c => { if (c) c._globalHeroBanner = cleanBanner; });
        }
        return res.status(200).json({ success: true, target: 'hero', bannerUrl: cleanBanner, style: cleanStyle, updatedAt: nowTs, persisted: savedDedicated });
      }

      // A1c. Inicio de sesion desde cualquier dispositivo con una cuenta del registro global
      if (body && body.type === 'USER_LOGIN' && body.email && body.hash) {
        const { data: usersNow } = await readGitHubJsonFile(USERS_PATH, inMemoryUsers || []);
        const arr = Array.isArray(usersNow) ? usersNow : [];
        const em = String(body.email).trim().toLowerCase();
        const found = arr.find(x => x && String(x.email || '').toLowerCase() === em);
        if (!found || !found.pwd) return res.status(404).json({ success: false, error: 'not_found' });
        if (found.pwd !== sealPwd(body.hash)) return res.status(401).json({ success: false, error: 'bad_password' });
        if (found.isBlocked) return res.status(403).json({ success: false, error: 'blocked' });
        return res.status(200).json({ success: true, user: publicUser(found) });
      }

      // A1b. Registro global de cuentas de Mentix (para que el Admin vea a TODAS las personas registradas con su animal)
      if (body && body.type === 'USER_SYNC' && body.user && typeof body.user === 'object') {
        const u = body.user;
        const emailKey = String(u.email || '').trim().toLowerCase();
        const idKey = String(u.id || '').trim();
        if (!emailKey && !idKey) return res.status(400).json({ error: 'Usuario sin id ni correo' });
        if (u.isGuest || /^guest_/.test(idKey)) return res.status(200).json({ success: true, skipped: true });
        const { data: prevUsers } = await readGitHubJsonFile(USERS_PATH, inMemoryUsers || []);
        const list = Array.isArray(prevUsers) ? [...prevUsers] : [];
        const idx = list.findIndex(x => x && ((emailKey && String(x.email || '').toLowerCase() === emailKey) || (idKey && x.id === idKey)));
        const nowIso = new Date().toISOString();
        const clean = {
          id: idKey || ('user_' + Date.now()),
          name: String(u.name || '').slice(0, 80),
          username: String(u.username || '').slice(0, 60),
          email: emailKey,
          avatar: String(u.avatar || '').slice(0, 2000),
          role: ['admin', 'teacher', 'student'].includes(u.role) ? u.role : 'student',
          xp: Number(u.xp) || 0,
          level: Number(u.level) || 1,
          levelName: String(u.levelName || '').slice(0, 40),
          institution: String(u.institution || '').slice(0, 80),
          provider: u.provider ? String(u.provider).slice(0, 20) : undefined,
          isBlocked: !!u.isBlocked,
          lastLoginAt: nowIso
        };
        const sealed = body.passwordHash ? sealPwd(body.passwordHash) : '';
        if (idx >= 0) {
          const prev = list[idx];
          if (sealed && !prev.pwd) clean.pwd = sealed;
          // Solo el Admin puede cambiar rol / bloqueo de una cuenta ya registrada
          if (!body.adminUpdate) {
            clean.role = prev.role || clean.role;
            clean.isBlocked = !!prev.isBlocked;
          }
          list[idx] = { ...prev, ...clean, createdAt: prev.createdAt || nowIso };
        } else {
          if (sealed) clean.pwd = sealed;
          list.push({ ...clean, createdAt: nowIso });
        }
        inMemoryUsers = list;
        const persisted = await writeGitHubJsonFile(USERS_PATH, list, `chore(data): cuenta ${clean.username || clean.email}`);
        return res.status(200).json({ success: true, persisted });
      }

      // A2. Sincronización global de miembros y solicitudes de ProjectHub (Detalles)
      if (body && body.type === 'PROJECT_HUB_SYNC' && body.projectId) {
        const pid = String(body.projectId).trim();
        const { data: prevMap } = await readGitHubJsonFile(HUBS_PATH, inMemoryHubs || {});
        const hubsMap = (prevMap && typeof prevMap === 'object') ? { ...prevMap } : {};
        hubsMap[pid] = {
          projectId: pid,
          members: Array.isArray(body.members) ? body.members : [],
          joinRequests: Array.isArray(body.joinRequests) ? body.joinRequests : [],
          ratings: Array.isArray(body.ratings) ? body.ratings : [],
          updatedAt: Number(body.updatedAt || Date.now())
        };
        inMemoryHubs = hubsMap;
        const persisted = await writeGitHubJsonFile(HUBS_PATH, hubsMap, `chore(data): sincronizar miembros del proyecto ${pid}`);
        return res.status(200).json({ success: true, persisted, hub: hubsMap[pid] });
      }

      // A3. Sincronización global de participantes y progreso en códigos de proyecto (📊 Detalles)
      if (body && body.type === 'CODE_PARTICIPANTS_SYNC' && body.normCode && body.entry) {
        const normCode = String(body.normCode).trim().toLowerCase().replace(/[\s\-_]/g, '');
        const entry = body.entry;
        const { data: prevMap } = await readGitHubJsonFile(CODE_PARTICIPANTS_PATH, inMemoryCodeParticipants || {});
        const map = (prevMap && typeof prevMap === 'object') ? { ...prevMap } : {};
        const list = Array.isArray(map[normCode]) ? [...map[normCode]] : [];
        const idx = list.findIndex(x => x && (x.userKey === entry.userKey || (entry.projectId && x.projectId === entry.projectId)));
        if (idx >= 0) list[idx] = { ...list[idx], ...entry, joinedAt: list[idx].joinedAt || entry.joinedAt };
        else list.unshift(entry);
        map[normCode] = list;
        inMemoryCodeParticipants = map;
        const persisted = await writeGitHubJsonFile(CODE_PARTICIPANTS_PATH, map, `chore(data): progreso codigo ${normCode}`);
        return res.status(200).json({ success: true, persisted, participants: list });
      }

      // B. Soporte para sincronización y persistencia mundial de códigos de proyectos
      if (body && (body.type === 'CUSTOM_PROJECT_CODES' || body.customProjectCodes)) {
        const newCodes = Array.isArray(body.customProjectCodes) ? body.customProjectCodes : [];
        const savedDedicated = await saveCustomProjectCodes(newCodes);

        let currentChallenges = [];
        let currentSha = null;
        const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'Mentix-App' };
        if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`;
        let savedInGitHub = savedDedicated;

        for (let attempt = 0; attempt < 3 && !savedInGitHub; attempt++) {
          try {
            const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${DATA_BRANCH}`, { headers, cache: 'no-store' });
            if (ghGet.ok) {
              const ghData = await ghGet.json();
              currentSha = ghData.sha;
              let contentStr = '';
              if (ghData.content) contentStr = Buffer.from(ghData.content, 'base64').toString('utf8');
              else if (ghData.download_url) {
                const rawRes = await fetch(ghData.download_url, { cache: 'no-store' });
                if (rawRes.ok) contentStr = await rawRes.text();
              }
              if (contentStr) currentChallenges = JSON.parse(contentStr);
            }
          } catch (err) {}
          if (!Array.isArray(currentChallenges)) currentChallenges = [];
          if (currentChallenges.length > 0) {
            currentChallenges.forEach((ch, idx) => {
              if (!ch) return;
              if (idx === 0) ch.customProjectCodes = newCodes;
              else if (ch.customProjectCodes) delete ch.customProjectCodes;
            });
          }
          if (GITHUB_TOKEN) {
            const updatedBuffer = Buffer.from(JSON.stringify(currentChallenges, null, 2), 'utf8').toString('base64');
            const putPayload = {
              message: `chore(data): sincronizar codigos de proyectos [skip ci]`,
              content: updatedBuffer,
              branch: DATA_BRANCH
            };
            if (currentSha) putPayload.sha = currentSha;
            const ghPut = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`, {
              method: 'PUT',
              headers: { ...headers, 'Content-Type': 'application/json' },
              body: JSON.stringify(putPayload)
            });
            if (ghPut.ok) { savedInGitHub = true; break; }
            await new Promise(r => setTimeout(r, 600));
          } else {
            break;
          }
        }
        if (currentChallenges.length > 0) inMemoryChallenges = currentChallenges;
        return res.status(200).json({ success: true, customProjectCodes: newCodes, persisted: savedInGitHub });
      }

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
          const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${DATA_BRANCH}`, {
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

        // Fusionar o agregar nuevo reto preservando siempre imágenes, galería, diapositivas y recursos del proyecto
        const existingIdx = currentChallenges.findIndex(c => c.id === challenge.id);
        if (existingIdx >= 0) {
          const prev = currentChallenges[existingIdx] || {};
          const mergedProj = { ...prev, ...challenge };
          const pickImg = (incoming, oldVal) => {
            const a = typeof incoming === 'string' ? incoming.trim() : '';
            const b = typeof oldVal === 'string' ? oldVal.trim() : '';
            const isDef = (u) => !u || u.includes('photo-1451187580459-43490279c0fa') || u.includes('card_data_gov.png') || u.includes('hero_banner.png');
            if (!isDef(a)) return a;
            if (!isDef(b)) return b;
            return a || b;
          };
          mergedProj.heroBanner = pickImg(challenge.heroBanner, prev.heroBanner);
          mergedProj.banner = pickImg(challenge.banner, prev.banner);
          mergedProj.mainImage = pickImg(challenge.mainImage, prev.mainImage);
          mergedProj.thumbnailImage = pickImg(challenge.thumbnailImage, prev.thumbnailImage);
          mergedProj.image = pickImg(challenge.image, prev.image);
          if ((!Array.isArray(mergedProj.visualAssets) || mergedProj.visualAssets.length === 0) && Array.isArray(prev.visualAssets) && prev.visualAssets.length > 0) {
            mergedProj.visualAssets = prev.visualAssets;
          }
          if ((!Array.isArray(mergedProj.slides) || mergedProj.slides.length === 0) && Array.isArray(prev.slides) && prev.slides.length > 0) {
            mergedProj.slides = prev.slides;
          }
          if ((!Array.isArray(mergedProj.resources) || mergedProj.resources.length === 0) && Array.isArray(prev.resources) && prev.resources.length > 0) {
            mergedProj.resources = prev.resources;
          }
          if (prev.designConfig || challenge.designConfig) {
            mergedProj.designConfig = { ...(prev.designConfig || {}), ...(challenge.designConfig || {}) };
            mergedProj.designConfig.bannerUrl = pickImg(challenge.designConfig?.bannerUrl, prev.designConfig?.bannerUrl);
          }
          currentChallenges[existingIdx] = mergedProj;
        } else {
          currentChallenges.unshift(challenge);
        }
        if (challenge._globalHeroBanner) {
          currentChallenges.forEach(c => { if (c) c._globalHeroBanner = challenge._globalHeroBanner; });
        }

        if (GITHUB_TOKEN) {
          const updatedBuffer = Buffer.from(JSON.stringify(currentChallenges, null, 2), 'utf8').toString('base64');
          const putPayload = {
            message: `chore(data): guardar reto "${challenge.title.slice(0, 40)}" [skip ci]`,
            content: updatedBuffer,
            branch: DATA_BRANCH
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
          savedInGitHub = false; // sin GITHUB_TOKEN valido no se puede persistir
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
          const ghGet = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}?ref=${DATA_BRANCH}`, {
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
            branch: DATA_BRANCH
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
