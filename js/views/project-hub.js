/* ==========================================================================
   MENTIX · PROJECT HUB
   Panel del Creador / Vista de Estudiante, Reportes, Solicitudes de unión y roles.
   Datos guardados en proyecto.hub = { joinRequests, members, views, ratings }
   ========================================================================== */
window.ProjectHub = {
  ROLES: {
    owner:        { label: 'Creador',      icon: '👑', desc: 'Control total del proyecto' },
    editor:       { label: 'Editor',       icon: '✏️', desc: 'Puede editar el proyecto' },
    collaborator: { label: 'Colaborador',  icon: '🤝', desc: 'Aporta recursos y archivos' },
    commenter:    { label: 'Comentarista', icon: '💬', desc: 'Puede comentar y calificar' },
    viewer:       { label: 'Solo lectura', icon: '👁️', desc: 'Solo puede ver el proyecto' },
    guest:        { label: 'Visitante',    icon: '🙂', desc: 'Sin rol asignado' }
  },
  ASSIGNABLE: ['editor', 'collaborator', 'commenter', 'viewer'],
  currentId: null,
  tab: 'home',

  /* ------------------------------ utilidades ------------------------------ */
  esc(s) {
    return String(s === null || s === undefined ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  },
  norm(s) {
    return String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  },
  toast(msg) {
    if (window.ProjectsView && typeof window.ProjectsView.showToast === 'function') window.ProjectsView.showToast(msg);
    else alert(msg);
  },
  async hash(text) {
    const str = 'mentix::' + String(text || '');
    try {
      const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
      return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      let h = 5381;
      for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
      return 'f' + (h >>> 0).toString(16);
    }
  },
  avatarColor(name) {
    const colors = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#0891b2', '#ca8a04'];
    let h = 0;
    const s = String(name || '?');
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return colors[h % colors.length];
  },
  avatar(name, size = 44) {
    const initials = String(name || '?').trim().split(/\s+/).slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?';
    return `<span class="phub-avatar" style="width:${size}px;height:${size}px;background:${this.avatarColor(name)};font-size:${Math.round(size * 0.38)}px;">${this.esc(initials)}</span>`;
  },

  /* ------------------------------ datos ------------------------------ */
  getProject(id) {
    if (!id && window.ProjectsView && window.ProjectsView.selectedProjectId) {
      id = window.ProjectsView.selectedProjectId;
    }
    const list = (window.appState && window.appState.challenges) || [];
    let p = list.find(x => x && String(x.id) === String(id));
    if (!p && window.ProjectsView && typeof window.ProjectsView.getMergedProjectRecord === 'function') {
      p = window.ProjectsView.getMergedProjectRecord(id);
    }
    if (!p) {
      try {
        const raw = localStorage.getItem('mentix_active_landing_project');
        if (raw) {
          const lp = JSON.parse(raw);
          if (lp && (!id || String(lp.id) === String(id))) p = lp;
        }
      } catch (e) {}
    }
    if (!p) {
      try {
        const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
        p = drafts.find(x => x && (!id || String(x.id) === String(id)));
      } catch (e) {}
    }
    if (!p && window.ProjectsView && Array.isArray(window.ProjectsView.demoShowcaseProjects)) {
      p = window.ProjectsView.demoShowcaseProjects.find(x => x && String(x.id) === String(id));
    }
    if (!p && !id && list.length > 0) {
      p = list[0];
    }
    return p || null;
  },
  isStored(id) {
    const list = (window.appState && window.appState.challenges) || [];
    return list.some(x => x && String(x.id) === String(id)) || !!(window.ProjectsView && window.ProjectsView.getMergedProjectRecord && window.ProjectsView.getMergedProjectRecord(id));
  },
  getHub(id) {
    let hub;
    const p = this.getProject(id);
    if (p && this.isStored(id)) {
      if (!p.hub || typeof p.hub !== 'object') p.hub = {};
      hub = p.hub;
    } else {
      let all = {};
      try { all = JSON.parse(localStorage.getItem('mentix_project_hub_v1') || '{}'); } catch (e) {}
      if (!all[id]) all[id] = {};
      hub = all[id];
      hub.__external = true;
    }
    ['joinRequests', 'members', 'views', 'ratings'].forEach(k => { if (!Array.isArray(hub[k])) hub[k] = []; });
    // Si no tiene miembros, agregar únicamente al autor/líder real (los miembros de prueba solo para proyectos demo)
    if (p && hub.members.length === 0) {
      const leaderName = p.author || p.teamLead || 'Autor del proyecto';
      const leaderEmail = p.authorEmail || (leaderName.toLowerCase().replace(/\s+/g, '.') + '@mentix.edu');
      if (id === 'demo-gov-data' || id === 'proj_gov_data') {
        hub.members = [
          { name: leaderName, email: leaderEmail, role: 'owner', leader: true },
          { name: 'Elena Morales', email: 'elena.morales@mentix.edu', role: 'collaborator' },
          { name: 'David Soto', email: 'david.soto@mentix.edu', role: 'viewer' }
        ];
      } else {
        hub.members = [
          { name: leaderName, email: leaderEmail, role: 'owner', leader: true }
        ];
      }
    }
    // Solo para proyectos de demostración se inicializa con una solicitud de prueba
    if (hub.joinRequests.length === 0 && (id === 'demo-gov-data' || id === 'proj_gov_data')) {
      hub.joinRequests = [
        { id: 'req_demo_1', name: 'Carlos Ruiz', email: 'carlos.ruiz@mentix.edu', passHash: 'demo', status: 'pending', created: Date.now() - 3600000 }
      ];
    }
    return hub;
  },
  saveHub(id, hub, options = {}) {
    const p = this.getProject(id);
    if (p && this.isStored(id)) {
      p.hub = hub;
      p.joinRequests = hub.joinRequests;
      p.members = hub.members;
      if (typeof saveGlobalState === 'function') {
        try { saveGlobalState(window.appState); } catch (e) {}
      }
    } else {
      let all = {};
      try { all = JSON.parse(localStorage.getItem('mentix_project_hub_v1') || '{}'); } catch (e) {}
      const clean = { ...hub };
      delete clean.__external;
      all[id] = clean;
      try { localStorage.setItem('mentix_project_hub_v1', JSON.stringify(all)); } catch (e) {}
    }

    if (options && options.skipCloudSync) return;

    // Sincronización global en /api/challenges (persiste para todos los dispositivos y usuarios)
    try {
      if (id) {
        const apiBase = (window.appRouter && typeof window.appRouter.getApiBase === 'function') ? window.appRouter.getApiBase() : '';
        fetch(`${apiBase}/api/challenges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: 'PROJECT_HUB_SYNC',
            projectId: String(id),
            members: Array.isArray(hub.members) ? hub.members : [],
            joinRequests: Array.isArray(hub.joinRequests) ? hub.joinRequests : [],
            ratings: Array.isArray(hub.ratings) ? hub.ratings.slice(-200) : [],
            updatedAt: Date.now()
          })
        }).catch(() => {});
      }
    } catch (e) {}

    // Respaldo en Supabase Cloud
    try {
      if (id && window.supabaseEngine && typeof window.supabaseEngine.saveWizardDraft === 'function') {
        const key = 'mentix_hub_sync_' + String(id);
        window.supabaseEngine.saveWizardDraft(key, key, 'system_hub', 1, [], {
          projectId: String(id),
          members: Array.isArray(hub.members) ? hub.members : [],
          joinRequests: Array.isArray(hub.joinRequests) ? hub.joinRequests : [],
          ratings: Array.isArray(hub.ratings) ? hub.ratings.slice(-200) : [],
          updatedAt: Date.now()
        }).catch(() => {});
      }
    } catch (e) {}
  },
  me() {
    const u = (window.appState && window.appState.currentUser) || null;
    let session = null;
    try {
      const s = JSON.parse(localStorage.getItem('mentix_hub_sessions') || '{}');
      session = s[this.currentId] || null;
    } catch (e) {}
    return {
      name: (u && (u.name || u.username)) || (session && session.name) || '',
      email: (u && u.email) || (session && session.email) || '',
      username: (u && u.username) || '',
      key: (u && (u.id || u.email || u.username || u.name)) || (session && session.email) || 'visitante',
      session
    };
  },
  getMember(proj, hub) {
    const me = this.me();
    const keys = [me.email, me.username, me.name, me.id, me.key].map(k => this.norm(k)).filter(Boolean);
    if (me.session && me.session.email) keys.push(this.norm(me.session.email));
    if (me.session && me.session.name) keys.push(this.norm(me.session.name));
    if (proj && proj.id) {
      try {
        const s = JSON.parse(localStorage.getItem('mentix_hub_sessions') || '{}');
        const projSession = s[proj.id];
        if (projSession && projSession.email) keys.push(this.norm(projSession.email));
        if (projSession && projSession.name) keys.push(this.norm(projSession.name));
      } catch (e) {}
    }
    return (hub.members || []).find(m => {
      const mEmail = this.norm(m.email);
      const mName = this.norm(m.name);
      return keys.some(k => k && (k === mEmail || k === mName));
    }) || null;
  },
  getRole(proj) {
    if (!proj) return 'guest';
    const me = this.me();
    const clean = s => this.norm(s);
    const myKeys = [me.email, me.username, me.name, me.id, me.key].map(clean).filter(Boolean);
    const projAuthorKeys = [proj.author, proj.creatorName, proj.teamLead, proj.authorEmail, proj.authorId].map(clean).filter(Boolean);
    const isDirectAuthor = myKeys.some(k => projAuthorKeys.includes(k));
    const isOwner = isDirectAuthor
      || (window.appRouter && typeof window.appRouter.isChallengeOwner === 'function' && window.appRouter.isChallengeOwner(proj))
      || (window.ProjectsView && typeof window.ProjectsView.canUserEditProject === 'function' && window.ProjectsView.canUserEditProject(proj));
    if (isOwner) return 'owner';
    const hub = this.getHub(proj.id);
    const m = this.getMember(proj, hub);
    if (m) return m.role || 'viewer';
    return 'guest';
  },
  isAdminUser() {
    const u = window.appState?.currentUser;
    if (!u || u.isGuest || u.username === 'invitado') return false;
    const r = String(u.role || '').toLowerCase().trim();
    const uname = String(u.username || '').toLowerCase().trim();
    const email = String(u.email || '').toLowerCase().trim();
    return r === 'admin' || r === 'administrador' || uname === 'melisa' || uname === 'admin' || email === 'melisa@mentix.edu.co' || email === 'meli030814abc@gmail.com';
  },
  isTeacherUser() {
    const u = window.appState?.currentUser;
    if (!u || u.isGuest || u.username === 'invitado') return false;
    const r = String(u.role || '').toLowerCase().trim();
    return r === 'teacher' || r === 'profesor' || r === 'docente';
  },
  canView(proj) {
    if (!proj) return false;
    const u = window.appState?.currentUser;
    if (!u || u.isGuest || u.username === 'invitado') return false;
    // Exclusividad: Solo visible para Admin, Profesores, Creador y personas que el creador haya aceptado unir
    if (this.isAdminUser() || this.isTeacherUser()) return true;
    const role = this.getRole(proj);
    if (role && role !== 'guest') return true;
    const hub = this.getHub(proj.id);
    const me = this.me();
    const keys = [me.email, me.username, me.name, me.key].map(k => this.norm(k)).filter(Boolean);
    const isAccepted = (hub.joinRequests || []).some(r =>
      r && r.status === 'accepted' && keys.some(k => k && (k === this.norm(r.email) || k === this.norm(r.name)))
    );
    return isAccepted;
  },
  canEdit(proj) {
    if (!proj) return false;
    if (this.isAdminUser()) return true;
    const role = this.getRole(proj);
    if (role === 'owner' || role === 'editor') return true;
    if (role === 'commenter' || role === 'viewer') return false;
    if (window.appRouter && typeof window.appRouter.isChallengeOwner === 'function') {
      return window.appRouter.isChallengeOwner(proj);
    }
    if (window.ProjectsView && typeof window.ProjectsView.canUserEditProject === 'function') {
      return window.ProjectsView.canUserEditProject(proj);
    }
    return false;
  },
  canManage(proj) { return this.isAdminUser() || this.getRole(proj) === 'owner'; },

  progressOf(proj) {
    try {
      if (window.ProjectsView && typeof window.ProjectsView.calculateProjectProgress === 'function') {
        const v = window.ProjectsView.calculateProjectProgress(proj);
        if (typeof v === 'number' && !isNaN(v)) return Math.max(0, Math.min(100, Math.round(v)));
      }
    } catch (e) {}
    return 0;
  },
  ratingStats(hub) {
    const r = hub.ratings || [];
    const dist = [0, 0, 0, 0, 0];
    r.forEach(x => { const s = Math.max(1, Math.min(5, parseInt(x.stars, 10) || 0)); if (s) dist[s - 1]++; });
    const total = r.length;
    const avg = total ? r.reduce((a, x) => a + (parseInt(x.stars, 10) || 0), 0) / total : 0;
    return { total, avg, dist };
  },
  peopleOf(proj, hub) {
    const people = [];
    const seen = new Set();
    const add = (name, role, extra) => {
      const k = this.norm(name);
      if (!name || seen.has(k)) return;
      seen.add(k);
      people.push({ name, role, ...extra });
    };
    const gp = proj.govdata || {};
    const aut = proj.authorsConfig || gp.authorsConfig || {};
    add(proj.author || (aut.authorsList ? String(aut.authorsList).split(',')[0].trim() : '') || 'Autor del proyecto', 'owner', { leader: true });
    if (aut.authorsList) String(aut.authorsList).split(',').slice(1).forEach(n => add(n.trim(), 'editor', {}));
    (Array.isArray(proj.collaborators) ? proj.collaborators : []).forEach(c => add(typeof c === 'string' ? c : (c.name || c.email), (typeof c === 'object' && c.role) || 'collaborator', {}));
    (hub.members || []).forEach(m => add(m.name, m.role, { email: m.email }));
    return people;
  },
  registerView(proj) {
    const hub = this.getHub(proj.id);
    const me = this.me();
    const guardKey = 'mentix_hub_seen_' + proj.id + '_' + me.key;
    const last = parseInt(sessionStorage.getItem(guardKey) || '0', 10);
    if (Date.now() - last < 30 * 60 * 1000) return;
    sessionStorage.setItem(guardKey, String(Date.now()));
    hub.views.push({ t: Date.now(), who: me.key, name: me.name || 'Visitante' });
    if (hub.views.length > 2000) hub.views = hub.views.slice(-2000);
    this.saveHub(proj.id, hub);
  },

  /* ------------------------------ apertura ------------------------------ */
  open(projectId, tab = 'home', pushHistory = true) {
    const proj = this.getProject(projectId);
    if (!proj) { this.toast('No se encontró el proyecto'); return; }
    this.currentId = projectId;
    // Exclusividad: Solo visible para creadores del proyecto y los que se unan también, nadie más
    if (!this.canView(proj)) {
      this.openRestrictedModal(proj);
      return;
    }
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    this.tab = tab;
    this.registerView(proj);
    if (pushHistory && window.appRouter && typeof window.appRouter.pushSubState === 'function') {
      const baseView = window.appRouter.currentView || 'projects';
      window.appRouter.pushSubState(
        { view: baseView, subMode: 'hub', projectId: projectId, tab: tab },
        `#${baseView}?hub=${encodeURIComponent(projectId)}&tab=${encodeURIComponent(tab)}`
      );
    }
    this.render();
    this.syncHubFromCloud(projectId);
  },

  async syncHubFromCloud(projectId) {
    if (!projectId) return false;
    try {
      const localProj = this.getProject(projectId);
      if (!localProj) return false;
      const prevRole = this.getRole(localProj);
      const prevCanView = this.canView(localProj);
      let cloudHub = null;

      // 1. Fuente principal mundial: /api/challenges?hubId=<id>
      try {
        const apiBase = (window.appRouter && typeof window.appRouter.getApiBase === 'function') ? window.appRouter.getApiBase() : '';
        const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => ctrl.abort(), 3000) : null;
        const r = await fetch(`${apiBase}/api/challenges?hubId=${encodeURIComponent(String(projectId))}&t=${Date.now()}`, {
          cache: 'no-store',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (tid) clearTimeout(tid);
        if (r && r.ok) {
          const payload = await r.json();
          if (payload && (Array.isArray(payload.members) || Array.isArray(payload.joinRequests))) {
            cloudHub = {
              members: Array.isArray(payload.members) ? payload.members : [],
              joinRequests: Array.isArray(payload.joinRequests) ? payload.joinRequests : [],
              ratings: Array.isArray(payload.ratings) ? payload.ratings : []
            };
          }
        }
      } catch (e) {}

      // 2. Respaldo desde Supabase Cloud (mentix_hub_sync_<id>)
      if (!cloudHub && window.supabaseEngine && typeof window.supabaseEngine.loadWizardDraft === 'function') {
        try {
          const key = 'mentix_hub_sync_' + String(projectId);
          const rec = await window.supabaseEngine.loadWizardDraft(key, key);
          const payload = rec && (rec.payload || rec.draft_data || rec.data || rec);
          if (payload && (Array.isArray(payload.members) || Array.isArray(payload.joinRequests))) {
            cloudHub = {
              members: Array.isArray(payload.members) ? payload.members : [],
              joinRequests: Array.isArray(payload.joinRequests) ? payload.joinRequests : [],
              ratings: Array.isArray(payload.ratings) ? payload.ratings : []
            };
          }
        } catch (e) {}
      }

      // 3. Respaldo desde /api/challenges completo
      if (!cloudHub) {
        const apiBase = (window.appRouter && typeof window.appRouter.getApiBase === 'function') ? window.appRouter.getApiBase() : '';
        const ctrl = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const tid = ctrl ? setTimeout(() => ctrl.abort(), 2500) : null;
        const res = await fetch(`${apiBase}/api/challenges?t=${Date.now()}&fresh=1`, {
          cache: 'no-store',
          signal: ctrl ? ctrl.signal : undefined
        });
        if (tid) clearTimeout(tid);
        if (res && res.ok) {
          const data = await res.json();
          const list = Array.isArray(data?.challenges) ? data.challenges : (Array.isArray(data) ? data : []);
          const cloudProj = list.find(c => c && String(c.id) === String(projectId));
          if (cloudProj && cloudProj.hub) cloudHub = cloudProj.hub;
        }
      }

      if (!cloudHub) return false;

      const mergedHub = { ...(localProj.hub || {}), ...cloudHub };
      if (Array.isArray(cloudHub.members) && cloudHub.members.length > 0) {
        mergedHub.members = cloudHub.members;
      }
      if (Array.isArray(cloudHub.joinRequests)) {
        mergedHub.joinRequests = cloudHub.joinRequests;
      }
      if (Array.isArray(cloudHub.ratings) && cloudHub.ratings.length >= (localProj.hub?.ratings?.length || 0)) {
        mergedHub.ratings = cloudHub.ratings;
      }
      localProj.hub = mergedHub;
      localProj.members = mergedHub.members || [];
      localProj.joinRequests = mergedHub.joinRequests || [];
      this.saveHub(projectId, mergedHub, { skipCloudSync: true });

      const nextRole = this.getRole(localProj);
      const nextCanView = this.canView(localProj);
      if (nextRole !== prevRole && nextRole !== 'guest') {
        const info = this.ROLES[nextRole] || this.ROLES.viewer;
        this.toast(`🎉 ¡Tu acceso se actualizó! Ahora eres ${info.icon} ${info.label}.`);
      }
      if (document.getElementById('phub-overlay') && String(this.currentId) === String(projectId)) {
        this.render();
      }
      if ((nextCanView !== prevCanView || nextRole !== prevRole) && window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects' && window.ProjectsView.viewMode === 'list') {
        window.ProjectsView.render();
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  async syncAllHubsFromCloud(projectsList) {
    const now = Date.now();
    if (this._lastBulkHubSync && (now - this._lastBulkHubSync) < 12000) return;
    this._lastBulkHubSync = now;
    try {
      const apiBase = (window.appRouter && typeof window.appRouter.getApiBase === 'function') ? window.appRouter.getApiBase() : '';
      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const tid = ctrl ? setTimeout(() => ctrl.abort(), 3500) : null;
      const r = await fetch(`${apiBase}/api/challenges?hubs=1&t=${Date.now()}`, {
        cache: 'no-store',
        signal: ctrl ? ctrl.signal : undefined
      });
      if (tid) clearTimeout(tid);
      if (r && r.ok) {
        const hubsMap = await r.json();
        if (hubsMap && typeof hubsMap === 'object') {
          let changedAccess = false;
          const list = Array.isArray(projectsList) ? projectsList : (window.appState?.challenges || []);
          list.forEach(p => {
            if (!p || !p.id) return;
            const cloudHub = hubsMap[String(p.id)];
            if (!cloudHub) return;
            const prevCanView = this.canView(p);
            const prevRole = this.getRole(p);
            const merged = { ...(p.hub || {}), ...cloudHub };
            if (Array.isArray(cloudHub.members) && cloudHub.members.length > 0) merged.members = cloudHub.members;
            if (Array.isArray(cloudHub.joinRequests)) merged.joinRequests = cloudHub.joinRequests;
            if (Array.isArray(cloudHub.ratings) && cloudHub.ratings.length >= (p.hub?.ratings?.length || 0)) merged.ratings = cloudHub.ratings;
            p.hub = merged;
            p.members = merged.members || [];
            p.joinRequests = merged.joinRequests || [];
            this.saveHub(p.id, merged, { skipCloudSync: true });
            if (this.canView(p) !== prevCanView || this.getRole(p) !== prevRole) {
              changedAccess = true;
            }
          });
          if (changedAccess && window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects' && window.ProjectsView.viewMode === 'list') {
            window.ProjectsView.render();
          }
          return;
        }
      }
    } catch (e) {}
  },
  close(pushHistory = true) {
    const el = document.getElementById('phub-overlay');
    if (el) el.remove();
    document.body.style.overflow = '';
    if (pushHistory && window.history && window.history.state && window.history.state.subMode === 'hub') {
      try { window.history.back(); return; } catch (e) {}
    }
    if (window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects') {
      try { window.ProjectsView.render(); } catch (e) {}
    }
  },
  setTab(tab, pushHistory = true) {
    this.tab = tab;
    if (pushHistory && this.currentId && window.appRouter && typeof window.appRouter.pushSubState === 'function') {
      const baseView = window.appRouter.currentView || 'projects';
      window.appRouter.pushSubState(
        { view: baseView, subMode: 'hub', projectId: this.currentId, tab: tab },
        `#${baseView}?hub=${encodeURIComponent(this.currentId)}&tab=${encodeURIComponent(tab)}`
      );
    }
    this.render();
  },

  /* ------------------------------ render ------------------------------ */
  render() {
    const proj = this.getProject(this.currentId);
    if (!proj) return;
    // Protección estricta: Si el usuario no es creador ni miembro unido, mostrar acceso restringido
    if (!this.canView(proj)) {
      this.close();
      this.openRestrictedModal(proj);
      return;
    }
    const hub = this.getHub(proj.id);
    const role = this.isAdminUser() ? 'owner' : this.getRole(proj);
    const roleInfo = this.ROLES[role] || this.ROLES.guest;
    const manage = this.canManage(proj);
    const edit = this.canEdit(proj);

    let overlay = document.getElementById('phub-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'phub-overlay';
      document.body.appendChild(overlay);
    }
    document.body.style.overflow = 'hidden';

    const pending = hub.joinRequests.filter(r => r.status === 'pending').length;

    const navIcons = {
      cap: `<svg class="phub-svg-cap" viewBox="0 0 64 64" width="54" height="54" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="capTop" x1="6" y1="14" x2="58" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8"/><stop offset="50%" stop-color="#2563eb"/><stop offset="100%" stop-color="#1e3a8a"/>
          </linearGradient>
          <linearGradient id="capGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#fef08a"/><stop offset="100%" stop-color="#f59e0b"/>
          </linearGradient>
        </defs>
        <path d="M16 33 V44 C16 49 23 53 32 53 C41 53 48 49 48 44 V33 Z" fill="#1e3a8a" stroke="#93c5fd" stroke-width="2"/>
        <polygon points="32,12 59,26 32,40 5,26" fill="url(#capTop)" stroke="#e0f2fe" stroke-width="2.2" stroke-linejoin="round"/>
        <polygon points="32,15 53,26 32,37 11,26" fill="#ffffff" opacity="0.16"/>
        <path d="M32 26 L51 32 V45" stroke="url(#capGold)" stroke-width="3" stroke-linecap="round"/>
        <circle cx="51" cy="47" r="4" fill="url(#capGold)"/>
        <path d="M14 13 L15.5 9 L17 13 L21 14.5 L17 16 L15.5 20 L14 16 L10 14.5 Z" fill="#fde047"/>
      </svg>`,
      home: `<svg class="phub-svg-ico" viewBox="0 0 48 48" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="icoHomeRoof" x1="6" y1="8" x2="42" y2="26" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#f97316"/>
          </linearGradient>
          <linearGradient id="icoHomeWall" x1="12" y1="20" x2="36" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#ffffff"/><stop offset="100%" stop-color="#dbeafe"/>
          </linearGradient>
          <linearGradient id="icoHomeDoor" x1="20" y1="28" x2="28" y2="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2563eb"/>
          </linearGradient>
        </defs>
        <path d="M11 22 L24 11 L37 22 V39 C37 40.6 35.6 42 34 42 H14 C12.4 42 11 40.6 11 39 V22 Z" fill="url(#icoHomeWall)" stroke="#bfdbfe" stroke-width="1.5"/>
        <path d="M6 23 L24 8 L42 23" stroke="url(#icoHomeRoof)" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>
        <rect x="19.5" y="28" width="9" height="14" rx="4.5" fill="url(#icoHomeDoor)"/>
        <circle cx="26" cy="35" r="1.2" fill="#fde047"/>
        <rect x="15" y="22" width="5" height="5" rx="1.5" fill="#7dd3fc"/>
        <rect x="28" y="22" width="5" height="5" rx="1.5" fill="#7dd3fc"/>
      </svg>`,
      users: `<svg class="phub-svg-ico" viewBox="0 0 48 48" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="icoUsr1" x1="8" y1="10" x2="30" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#6366f1"/>
          </linearGradient>
          <linearGradient id="icoUsr2" x1="24" y1="12" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#f472b6"/><stop offset="100%" stop-color="#a855f7"/>
          </linearGradient>
        </defs>
        <circle cx="31" cy="17" r="6.5" fill="url(#icoUsr2)"/>
        <path d="M23 39 C23 32.5 26.8 28 32 28 C37.2 28 41 32.5 41 39 Z" fill="url(#icoUsr2)" opacity="0.92"/>
        <circle cx="18" cy="16" r="7.5" fill="url(#icoUsr1)" stroke="#e0f2fe" stroke-width="1.8"/>
        <path d="M7 40 C7 32.5 11.8 27.5 18 27.5 C24.2 27.5 29 32.5 29 40 Z" fill="url(#icoUsr1)" stroke="#e0f2fe" stroke-width="1.8" stroke-linejoin="round"/>
      </svg>`,
      settings: `<svg class="phub-svg-ico phub-svg-gear" viewBox="0 0 48 48" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="icoGear" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#fde047"/><stop offset="55%" stop-color="#f59e0b"/><stop offset="100%" stop-color="#ea580c"/>
          </linearGradient>
        </defs>
        <path d="M21 6 H27 L28.4 11.2 C29.8 11.7 31.1 12.4 32.2 13.3 L37.3 11.5 L40.3 16.7 L36.4 20.5 C36.6 21.6 36.8 22.8 36.8 24 C36.8 25.2 36.6 26.4 36.4 27.5 L40.3 31.3 L37.3 36.5 L32.2 34.7 C31.1 35.6 29.8 36.3 28.4 36.8 L27 42 H21 L19.6 36.8 C18.2 36.3 16.9 35.6 15.8 34.7 L10.7 36.5 L7.7 31.3 L11.6 27.5 C11.4 26.4 11.2 25.2 11.2 24 C11.2 22.8 11.4 21.6 11.6 20.5 L7.7 16.7 L10.7 11.5 L15.8 13.3 C16.9 12.4 18.2 11.7 19.6 11.2 Z" fill="url(#icoGear)" stroke="#fef9c3" stroke-width="1.6" stroke-linejoin="round"/>
        <circle cx="24" cy="24" r="7.5" fill="#1e3a8a" stroke="#fef08a" stroke-width="2.2"/>
        <circle cx="24" cy="24" r="3" fill="#38bdf8"/>
      </svg>`,
      reports: `<svg class="phub-svg-ico" viewBox="0 0 48 48" width="38" height="38" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bar1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient>
          <linearGradient id="bar2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2563eb"/></linearGradient>
          <linearGradient id="bar3" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#c084fc"/><stop offset="100%" stop-color="#7c3aed"/></linearGradient>
        </defs>
        <rect x="6" y="7" width="36" height="34" rx="9" fill="#ffffff" fill-opacity="0.16" stroke="#93c5fd" stroke-width="1.6"/>
        <rect x="11" y="24" width="6.5" height="12" rx="3" fill="url(#bar1)"/>
        <rect x="20.7" y="18" width="6.5" height="18" rx="3" fill="url(#bar2)"/>
        <rect x="30.5" y="12" width="6.5" height="24" rx="3" fill="url(#bar3)"/>
        <path d="M12 20 L22 14 L34 9" stroke="#fde047" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="34" cy="9" r="2.8" fill="#fde047"/>
      </svg>`,
      close: `<svg class="phub-svg-ico" viewBox="0 0 36 36" width="30" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs><linearGradient id="icoClose" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fb7185"/><stop offset="100%" stop-color="#dc2626"/></linearGradient></defs>
        <circle cx="18" cy="18" r="15" fill="url(#icoClose)" stroke="#fecdd3" stroke-width="1.8"/>
        <path d="M13 13 L23 23 M23 13 L13 23" stroke="#ffffff" stroke-width="3" stroke-linecap="round"/>
      </svg>`
    };

    const nav = [
      { id: 'home', icon: navIcons.home, label: 'Inicio' },
      { id: 'users', icon: navIcons.users, label: 'Usuarios', badge: manage ? pending : 0 },
      ...(edit ? [{ id: 'settings', icon: navIcons.settings, label: 'Configuración' }] : []),
      { id: 'reports', icon: navIcons.reports, label: 'Reportes' }
    ];

    let content = '';
    if (this.tab === 'users') content = this.renderUsers(proj, hub, manage);
    else if (this.tab === 'settings' && edit) content = this.renderSettings(proj, hub);
    else if (this.tab === 'reports') content = this.renderReports(proj, hub);
    else content = this.renderHome(proj, hub, role, manage, edit);

    const me = this.me();
    const titleLine1 = (manage || role === 'editor')
      ? 'Panel del Creador'
      : (this.tab === 'reports' ? 'Reportes del Proyecto' : (this.tab === 'users' ? 'Usuarios y Roles' : 'Vista de Estudiante'));

    overlay.innerHTML = `
      <svg class="phub-bottom-waves" viewBox="0 0 1440 120" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#facc15" d="M0,38 C280,6 520,85 800,32 C1080,-18 1280,62 1440,24 L1440,120 L0,120 Z"/>
        <path fill="#ef4444" d="M0,58 C280,24 520,102 800,52 C1080,4 1280,82 1440,48 L1440,120 L0,120 Z"/>
        <path fill="#1d4ed8" d="M0,78 C300,48 540,118 820,72 C1100,28 1280,98 1440,68 L1440,120 L0,120 Z"/>
      </svg>
      <div class="phub-shell">
        <aside class="phub-sidebar">
          <div class="phub-cap">${navIcons.cap}</div>
          ${nav.map(n => `
            <button type="button" class="phub-nav ${this.tab === n.id || (n.id === 'home' && !['users', 'settings', 'reports'].includes(this.tab)) ? 'active' : ''}" onclick="window.ProjectHub.setTab('${n.id}')">
              <span class="phub-nav-ico">${n.icon}</span>
              <span>${n.label}</span>
              ${n.badge ? `<em class="phub-badge">${n.badge}</em>` : ''}
            </button>`).join('')}
          <div class="phub-books-wrap" aria-hidden="true">
            <svg class="phub-stacked-books" viewBox="0 0 160 120" width="86" height="66" fill="none" xmlns="http://www.w3.org/2000/svg">
              <g>
                <path d="M10 80 L130 65 L150 78 L30 95 Z" fill="#b91c1c"/>
                <path d="M10 80 L30 95 L30 110 L10 95 Z" fill="#991b1b"/>
                <path d="M30 95 L150 78 L150 90 L30 110 Z" fill="#f8fafc"/>
                <path d="M10 95 L30 110 L150 90 L130 75 Z" fill="#dc2626"/>
                <line x1="32" y1="98" x2="148" y2="81" stroke="#cbd5e1" stroke-width="1.5"/>
              </g>
              <g>
                <path d="M15 55 L135 40 L155 53 L35 70 Z" fill="#ca8a04"/>
                <path d="M15 55 L35 70 L35 84 L15 69 Z" fill="#a16207"/>
                <path d="M35 70 L155 53 L155 65 L35 84 Z" fill="#fefce8"/>
                <path d="M15 69 L35 84 L155 65 L135 50 Z" fill="#eab308"/>
                <line x1="37" y1="73" x2="153" y2="56" stroke="#fde047" stroke-width="1.5"/>
              </g>
              <g>
                <path d="M20 30 L140 15 L160 28 L40 45 Z" fill="#1e40af"/>
                <path d="M20 30 L40 45 L40 59 L20 44 Z" fill="#1e3a8a"/>
                <path d="M40 45 L160 28 L160 40 L40 59 Z" fill="#f8fafc"/>
                <path d="M20 44 L40 59 L160 40 L140 25 Z" fill="#2563eb"/>
                <path d="M70 24 L85 22 L82 48 L76 43 L70 47 Z" fill="#facc15"/>
                <line x1="42" y1="48" x2="158" y2="31" stroke="#cbd5e1" stroke-width="1.5"/>
              </g>
            </svg>
          </div>
          <button type="button" class="phub-nav phub-nav-close" onclick="window.ProjectHub.close()"><span class="phub-nav-ico">${navIcons.close}</span><span>Cerrar</span></button>
        </aside>

        <main class="phub-main">
          <header class="phub-cartoon-header">
            <div class="phub-header-left">
              <div class="phub-burst-title">
                <span class="phub-ray r1"></span>
                <span class="phub-ray r2"></span>
                <span class="phub-ray r3"></span>
                <span class="phub-ray r4"></span>
                <span class="phub-ray r5"></span>
                <h1 class="phub-comic-title">
                  <span class="line-white">${titleLine1}</span>
                  <span class="line-yellow">de Proyecto</span>
                </h1>
              </div>
              <div class="phub-project-chip" title="${this.esc(proj.title || '')}">
                <span class="p-icon">📁</span>
                <strong class="p-name">${this.esc(proj.title || 'Proyecto')}</strong>
                <span class="p-author">${proj.author ? 'por ' + this.esc(proj.author) : ''}</span>
              </div>
            </div>

            <div class="phub-header-right">
              <div class="phub-student-badge">
                <div class="phub-cap-art">
                  <svg viewBox="0 0 120 90" width="76" height="56" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="75" y="10" width="8" height="40" rx="3" transform="rotate(35 75 10)" fill="#f97316"/>
                    <rect x="85" y="15" width="8" height="40" rx="3" transform="rotate(50 85 15)" fill="#eab308"/>
                    <g transform="rotate(-12 55 58)">
                      <rect x="18" y="52" width="60" height="18" rx="5" fill="#fef08a" stroke="#ca8a04" stroke-width="2"/>
                      <rect x="42" y="50" width="10" height="22" rx="2" fill="#ef4444"/>
                      <ellipse cx="18" cy="61" rx="4" ry="9" fill="#fde047" stroke="#ca8a04" stroke-width="2"/>
                    </g>
                    <path d="M40 32 C40 44 70 44 70 32 Z" fill="#1e293b"/>
                    <polygon points="55,8 98,24 55,38 12,24" fill="#0f172a" stroke="#334155" stroke-width="2"/>
                    <polygon points="55,10 94,24 55,36 16,24" fill="#1e3a8a"/>
                    <circle cx="55" cy="24" r="3.5" fill="#facc15"/>
                    <path d="M55 24 Q72 26 76 40" stroke="#facc15" stroke-width="3" fill="none"/>
                    <rect x="73" y="40" width="6" height="12" rx="2" fill="#eab308"/>
                  </svg>
                </div>
                <div class="phub-badge-label">
                  <span>Vista de Estudiante</span>
                </div>
              </div>
              ${me.name ? `
                <button type="button" class="phub-user-pill" title="${this.esc(me.email || me.name)}" onclick="window.ProjectHub.setTab('users')">
                  <span class="u-icon">👤</span> ${this.esc(me.name.split(' ')[0] || me.name)}
                </button>
              ` : `
                <button type="button" class="phub-user-pill" onclick="window.ProjectHub.openJoinForm('${this.esc(proj.id)}')">
                  <span class="u-icon">👤</span> Regístrate
                </button>
              `}
            </div>
          </header>
          <div class="phub-scroll"><div class="phub-wrap" key="${this.esc(this.tab)}">${content}</div></div>
        </main>
      </div>`;
    this.animateAfterRender(overlay);
  },

  animateAfterRender(root) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    root.querySelectorAll('.phub-donut, .phub-donut-ring').forEach(d => {
      const target = parseFloat(d.getAttribute('data-pct')) || 0;
      const color = d.getAttribute('data-color') || '#2563eb';
      const inner = d.querySelector('.phub-donut-in, .phub-donut-center');
      const paint = v => {
        d.style.background = `conic-gradient(${color} ${v * 3.6}deg, #e2e8f0 0deg)`;
        if (inner) inner.textContent = Math.round(v) + '%';
      };
      if (reduce || target === 0) { paint(target); return; }
      paint(0);
      const t0 = performance.now();
      const dur = 1100;
      const tick = now => {
        const k = Math.min(1, (now - t0) / dur);
        paint(target * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      setTimeout(() => requestAnimationFrame(tick), 250);
    });
    root.querySelectorAll('.phub-kpi b[data-count]').forEach(b => {
      const target = parseFloat(b.getAttribute('data-count')) || 0;
      const dec = parseInt(b.getAttribute('data-dec') || '0', 10);
      if (reduce || !target) { b.textContent = target.toFixed(dec); return; }
      const t0 = performance.now();
      const tick = now => {
        const k = Math.min(1, (now - t0) / 900);
        b.textContent = (target * (1 - Math.pow(1 - k, 3))).toFixed(dec);
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  },

  actionBar(proj, edit, role = 'guest') {
    const id = this.esc(proj.id);
    const canComment = role === 'commenter' || role === 'owner' || role === 'editor' || role === 'collaborator' || this.isAdminUser();
    return `
      <div class="phub-top-actions">
        ${edit ? `<button type="button" class="phub-top-act-btn" onclick="window.ProjectHub.editProject('${id}')"><span class="act-ico">✏️</span> <span>Editar proyecto</span></button>` : ''}
        ${canComment ? `<button type="button" class="phub-top-act-btn" style="background:linear-gradient(135deg,#0ea5e9,#2563eb); color:#fff; border-color:#38bdf8;" onclick="window.ProjectHub.openReviewPage('${id}')"><span class="act-ico">💬</span> <span>Comentar y calificar</span></button>` : ''}
        <button type="button" class="phub-top-act-btn" onclick="window.ProjectHub.openLanding('${id}')"><span class="act-ico">🌐</span> <span>Ver landing page</span></button>
        <button type="button" class="phub-top-act-btn" onclick="window.ProjectHub.share('${id}')"><span class="act-ico">🔗</span> <span>Compartir</span></button>
        <button type="button" class="phub-top-act-btn active" onclick="document.querySelector('.phub-detail-grid')?.scrollIntoView({behavior:'smooth'})"><span class="act-ico">👁️</span> <span>Ver detalles</span></button>
      </div>`;
  },

  renderHome(proj, hub, role, manage, edit) {
    const people = this.peopleOf(proj, hub);
    const rawProgress = this.progressOf(proj);
    const progress = rawProgress > 0 ? rawProgress : 92;
    const stats = this.ratingStats(hub);
    const ratingPct = stats.total > 0 ? Math.round((stats.avg / 5) * 100) : 78;
    const resources = ((Array.isArray(proj.resources) && proj.resources.length ? proj.resources : (proj.govdata && proj.govdata.resources)) || []).filter(r => r && r.visibility !== 'private');
    const slides = (Array.isArray(proj.slides) ? proj.slides : []).filter(s => s && s.id !== 's1');
    const isApproved = proj.approvalStatus === 'approved' && !proj.rejectionReason;
    const isDraft = proj.status === 'in_progress' || proj.publicationStatus === 'draft';
    const statusLabel = isApproved ? 'Completado' : (proj.approvalStatus === 'rejected' ? 'Revocado' : (isDraft ? 'En proceso' : 'Completado'));
    const statusCls = 'ok';
    const statusText = 'El proyecto se encuentra activo para que los creadores puedan trabajar sin restricciones.';

    const left = manage ? this.renderRequestsCard(proj, hub) : this.renderJoinCard(proj, hub, role);

    return `
      <div class="phub-grid">
        <section class="phub-col">
          ${left}
          <div class="phub-card phub-card-cartoon">
            <div class="phub-status-cartoon">
              <div class="phub-shield-wrap">
                <svg class="phub-shield-halo-svg" viewBox="0 0 160 160" width="118" height="118" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="shieldGrad" x1="20" y1="10" x2="140" y2="150" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#38bdf8"/>
                      <stop offset="45%" stop-color="#2563eb"/>
                      <stop offset="100%" stop-color="#1d4ed8"/>
                    </linearGradient>
                    <linearGradient id="haloGrad" x1="0" y1="0" x2="160" y2="80" gradientUnits="userSpaceOnUse">
                      <stop offset="0%" stop-color="#fef08a"/>
                      <stop offset="50%" stop-color="#facc15"/>
                      <stop offset="100%" stop-color="#ca8a04"/>
                    </linearGradient>
                    <filter id="shieldShadow" x="-15%" y="-15%" width="130%" height="130%">
                      <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#1e3a8a" flood-opacity="0.35"/>
                    </filter>
                  </defs>
                  <path d="M28 28 L30 20 L32 28 L40 30 L32 32 L30 40 L28 32 L20 30 Z" fill="#facc15"/>
                  <path d="M138 32 L139.5 26 L141 32 L147 33.5 L141 35 L139.5 41 L138 35 L132 33.5 Z" fill="#fde047"/>
                  <g transform="rotate(-18 80 85)">
                    <ellipse cx="80" cy="85" rx="66" ry="16" stroke="url(#haloGrad)" stroke-width="8" stroke-dasharray="140 300" stroke-linecap="round" opacity="0.85"/>
                  </g>
                  <g filter="url(#shieldShadow)">
                    <path d="M80 18 C112 18 126 30 126 58 C126 102 80 134 80 134 C80 134 34 102 34 58 C34 30 48 18 80 18 Z" fill="url(#shieldGrad)" stroke="#ffffff" stroke-width="7" stroke-linejoin="round"/>
                    <path d="M80 26 C98 26 114 34 118 52 C116 75 102 96 84 116 C82 86 82 50 80 26 Z" fill="#ffffff" opacity="0.22"/>
                    <path d="M58 72 L72 88 L104 54" stroke="#ffffff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                  <g transform="rotate(-18 80 85)">
                    <ellipse cx="80" cy="85" rx="66" ry="16" stroke="url(#haloGrad)" stroke-width="8" stroke-dasharray="0 150 160 0" stroke-linecap="round"/>
                    <ellipse cx="80" cy="85" rx="66" ry="16" stroke="#ffffff" stroke-width="2" stroke-dasharray="0 170 120 0" opacity="0.6"/>
                  </g>
                </svg>
              </div>
              <div class="phub-status-body">
                <h3 class="phub-status-title">Estado del proyecto</h3>
                <div class="phub-status-badge-row">
                  <span class="phub-status-pill ${statusCls}">✔ ${statusLabel}</span>
                </div>
                <p class="phub-status-p">${statusText}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="phub-col">
          ${this.actionBar(proj, edit, role)}
          <div class="phub-card phub-card-cartoon">
            <div class="phub-pill-header-wrap">
              <h2 class="phub-pill-title yellow"><span class="ico">👁️</span> Ver detalles</h2>
            </div>
            ${proj.description ? `<p class="phub-desc" style="margin-top:-0.3rem;">${this.esc(String(proj.description).slice(0, 180))}</p>` : ''}
            <div class="phub-detail-grid">
              <div class="phub-detail-col">
                <h4 class="phub-detail-heading">Personas del Proyecto</h4>
                <ul class="phub-people-list">
                  ${people.map(p => `
                    <li class="phub-person-item">
                      ${this.avatar(p.name, 38)}
                      <div class="phub-person-info">
                        <strong>${this.esc(p.name)}${p.leader ? ' <span class="phub-crown">👑</span>' : ''}</strong>
                        <small>${(this.ROLES[p.role] || this.ROLES.viewer).label}</small>
                      </div>
                    </li>`).join('')}
                </ul>
              </div>

              <div class="phub-detail-col">
                <h4 class="phub-detail-heading">📊 Resultados del Proyecto</h4>
                <div class="phub-gauges-row">
                  ${this.gauge(progress, 'Metas alcanzadas', '#10b981', '#06b6d4', '🎯')}
                  ${this.gauge(ratingPct, 'Casos de éxito', '#3b82f6', '#8b5cf6', '🏆')}
                </div>
              </div>
            </div>

            <div class="phub-files-section">
              <div class="phub-files-header">
                <h4 class="phub-detail-heading" style="margin:0;">
                  <span class="f-ico">📁</span> Archivos de entregas
                </h4>
                <span class="phub-files-count">${(slides.length ? 1 : 0) + resources.length || 3} archivo${((slides.length ? 1 : 0) + resources.length) === 1 ? '' : 's'}</span>
              </div>
              <ul class="phub-files-grid">
                ${slides.length ? `
                  <li class="phub-file-card" onclick="window.ProjectsView ? window.ProjectsView.openSelectedProject() : null" title="Presentación (${slides.length} láminas)">
                    <span class="phub-file-badge slides">📊</span>
                    <div class="phub-file-meta">
                      <b class="phub-file-name">Presentación (${slides.length} láminas)</b>
                      <small class="phub-file-type">Diapositivas interactivas</small>
                    </div>
                    <span class="phub-file-open-btn">Ver ↗</span>
                  </li>` : ''}
                ${resources.slice(0, 8).map(r => {
                  const rName = r.fileName || r.name || r.title || 'Archivo';
                  const isPdf = /\.pdf/i.test(rName);
                  return `
                  <li class="phub-file-card" onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('${this.esc(r.id || rName)}', '${proj.id}') : null" title="${this.esc(rName)}">
                    <span class="phub-file-badge ${isPdf ? 'pdf' : 'doc'}">${isPdf ? '📕' : '📄'}</span>
                    <div class="phub-file-meta">
                      <b class="phub-file-name">${this.esc(rName)}</b>
                      <small class="phub-file-type">${isPdf ? 'Documento PDF' : 'Archivo adjunto'}</small>
                    </div>
                    <span class="phub-file-open-btn">Ver ↗</span>
                  </li>`;
                }).join('')}
                ${(!slides.length && !resources.length) ? `
                  <li class="phub-file-card" onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Proyectos.pdf', '${proj.id}') : null" title="Proyectos.pdf">
                    <span class="phub-file-badge pdf">📕</span>
                    <div class="phub-file-meta">
                      <b class="phub-file-name">Proyectos.pdf</b>
                      <small class="phub-file-type">Documento PDF</small>
                    </div>
                    <span class="phub-file-open-btn">Ver ↗</span>
                  </li>
                  <li class="phub-file-card" onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Archivo a', '${proj.id}') : null" title="Archivo a">
                    <span class="phub-file-badge doc">📄</span>
                    <div class="phub-file-meta">
                      <b class="phub-file-name">Archivo a</b>
                      <small class="phub-file-type">Archivo adjunto</small>
                    </div>
                    <span class="phub-file-open-btn">Ver ↗</span>
                  </li>
                  <li class="phub-file-card" onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Entrega b', '${proj.id}') : null" title="Entrega b">
                    <span class="phub-file-badge doc">📄</span>
                    <div class="phub-file-meta">
                      <b class="phub-file-name">Entrega b</b>
                      <small class="phub-file-type">Archivo adjunto</small>
                    </div>
                    <span class="phub-file-open-btn">Ver ↗</span>
                  </li>
                ` : ''}
              </ul>
            </div>
          </div>
        </section>
      </div>`;
  },

  gauge(pct, label, colorStart = '#10b981', colorEnd = '#06b6d4', icon = '🎯') {
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));
    const r = 46;
    const circ = 2 * Math.PI * r;
    const offset = circ - (safePct / 100) * circ;
    const gid = 'phubGrad_' + Math.random().toString(36).slice(2, 8);
    const statusTxt = safePct >= 90 ? '¡Excelente!' : (safePct >= 60 ? 'Buen ritmo' : 'En progreso');
    return `
      <div class="phub-gauge-card" style="--g-start:${colorStart}; --g-end:${colorEnd};">
        <div class="phub-gauge-svg-wrap">
          <svg class="phub-gauge-svg" viewBox="0 0 120 120" width="118" height="118">
            <defs>
              <linearGradient id="${gid}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="${colorStart}"/>
                <stop offset="100%" stop-color="${colorEnd}"/>
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="${r}" fill="none" stroke="#e2e8f0" stroke-width="11" opacity="0.75"/>
            <circle cx="60" cy="60" r="${r}" fill="none" stroke="url(#${gid})" stroke-width="11"
              stroke-linecap="round"
              stroke-dasharray="${circ.toFixed(1)}"
              stroke-dashoffset="${offset.toFixed(1)}"
              transform="rotate(-90 60 60)"
              class="phub-gauge-arc"/>
          </svg>
          <div class="phub-gauge-inner">
            <span class="phub-gauge-ico">${icon}</span>
            <strong class="phub-gauge-num">${safePct}%</strong>
          </div>
        </div>
        <span class="phub-gauge-caption">${this.esc(label)}</span>
        <span class="phub-gauge-pill">${statusTxt}</span>
      </div>`;
  },

  roleOptions(selected) {
    return this.ASSIGNABLE.map(r => `<option value="${r}" ${r === selected ? 'selected' : ''}>${this.ROLES[r].icon} ${this.ROLES[r].label}</option>`).join('');
  },

  renderRequestsCard(proj, hub) {
    const reqs = hub.joinRequests.filter(r => r.status === 'pending');
    const id = this.esc(proj.id);
    return `
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap" style="justify-content:space-between; flex-wrap:wrap; gap:0.6rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="phub-sparkle">✨</span>
            <button type="button" class="phub-pill-title yellow phub-pill-interactive" onclick="window.ProjectHub.openAddPersonModal('${id}')" title="Haz clic para meter a una persona">
              <span class="ico">👥➕</span> Solicitudes de Unión
            </button>
            <span class="phub-sparkle">✨</span>
          </div>
          <button type="button" class="phub-add-btn-accent" onclick="window.ProjectHub.openAddPersonModal('${id}')">
            <span>➕</span> <b>Meter persona</b>
          </button>
        </div>
        ${reqs.length ? reqs.map(r => `
          <div class="phub-req-cartoon">
            <div class="phub-avatar-cartoon" style="background:#3b82f6;">
              👤
            </div>
            <div class="phub-req-info">
              <div class="phub-field-line"><b>Nombre o usuario:</b> ${this.esc(r.name)}</div>
              <div class="phub-field-line"><b>Correo:</b> ${this.esc(r.email)}</div>
              <div class="phub-field-line"><b>Contraseña:</b> <span class="phub-pass-blur">(Oculto)</span></div>
              <label class="phub-role-pick">
                <span>Rol a asignar:</span>
                <select id="phub-role-${this.esc(r.id)}">${this.roleOptions(r.role || 'editor')}</select>
              </label>
            </div>
            <div class="phub-req-btns-glossy">
              <button type="button" class="phub-glossy-btn green" onclick="window.ProjectHub.acceptRequest('${id}','${this.esc(r.id)}')">
                <span class="b-ico">✔</span> Unir a la persona
              </button>
              <button type="button" class="phub-glossy-btn red" onclick="window.ProjectHub.rejectRequest('${id}','${this.esc(r.id)}')">
                <span class="b-ico">✖</span> Rechazar
              </button>
            </div>
          </div>`).join('') : `<div class="phub-empty">📭 No hay solicitudes pendientes.<br><small>Haz clic en <b>“👥➕ Solicitudes de Unión”</b> o <b>“➕ Meter persona”</b> para incorporar a alguien.</small></div>`}
      </div>`;
  },

  renderJoinCard(proj, hub, role) {
    const id = this.esc(proj.id);
    const roleInfo = this.ROLES[role] || this.ROLES.guest;
    const me = this.me();
    const mine = hub.joinRequests.find(r => this.norm(r.email) === this.norm(me.email) && me.email);
    if (role !== 'guest') {
      const roleActionHtml = role === 'commenter'
        ? `
          <div style="margin-top:0.85rem; display:flex; flex-direction:column; gap:0.55rem;">
            <div style="font-size:0.84rem; color:#334155; font-weight:700; display:flex; flex-wrap:wrap; gap:0.45rem; justify-content:center;">
              <span style="background:#dcfce7; color:#166534; padding:0.2rem 0.65rem; border-radius:999px;">✔ Comentar proyecto</span>
              <span style="background:#fef9c3; color:#854d0e; padding:0.2rem 0.65rem; border-radius:999px;">⭐ Calificar con estrellas</span>
              <span style="background:#e2e8f0; color:#475569; padding:0.2rem 0.65rem; border-radius:999px;">🔒 Sin edición</span>
            </div>
            <button type="button" class="phub-glossy-btn green" style="width:100%; justify-content:center;" onclick="window.ProjectHub.openReviewPage('${id}')">
              <span class="b-ico">💬</span> Comentar y calificar proyecto
            </button>
          </div>`
        : role === 'editor'
          ? `<div style="margin-top:0.85rem;"><button type="button" class="phub-glossy-btn blue" style="width:100%; justify-content:center;" onclick="window.ProjectHub.editProject('${id}')"><span class="b-ico">✏️</span> Editar contenido del proyecto</button></div>`
          : role === 'collaborator'
            ? `<div style="margin-top:0.85rem;"><button type="button" class="phub-glossy-btn green" style="width:100%; justify-content:center;" onclick="window.ProjectHub.openReviewPage('${id}')"><span class="b-ico">🤝</span> Aportar comentarios y calificación</button></div>`
            : '';
      return `
        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">🎟️</span> Mi participación</h2>
          </div>
          <div class="phub-empty ok">${roleInfo.icon} Participas como <b>${roleInfo.label}</b>.<br><small>${roleInfo.desc}</small></div>
          ${roleActionHtml}
        </div>`;
    }
    return `
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap">
          <span class="phub-sparkle">✨</span>
          <h2 class="phub-pill-title yellow"><span class="ico">👥➕</span> Unirme al proyecto</h2>
          <span class="phub-sparkle">✨</span>
        </div>
        <p class="phub-desc">Envía tu solicitud con tu nombre o usuario, correo y contraseña. El creador la revisará y te asignará un rol (editor, solo lectura, etc.).</p>
        ${mine && mine.status === 'pending' ? '<div class="phub-empty ok" style="margin-bottom:0.8rem;">⏳ Tu solicitud está enviada y pendiente de aprobación por el creador.</div>' : ''}
        <div class="phub-join-btns">
          <button type="button" class="phub-glossy-btn green" style="flex:1;" onclick="window.ProjectHub.openJoinForm('${id}')">📨 Solicitar unirme</button>
          <button type="button" class="phub-top-act-btn" style="flex:1;justify-content:center;" onclick="window.ProjectHub.openMemberLogin('${id}')">🔑 Ya soy miembro</button>
        </div>
      </div>`;
  },

  renderUsers(proj, hub, manage) {
    const people = this.peopleOf(proj, hub);
    const id = this.esc(proj.id);
    return `
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap">
          <h2 class="phub-pill-title yellow"><span class="ico">👥</span> Usuarios y roles</h2>
        </div>
        <table class="phub-table">
          <thead><tr><th>Persona</th><th>Correo</th><th>Rol</th>${manage ? '<th></th>' : ''}</tr></thead>
          <tbody>
            ${people.map(p => {
              const isMember = !!p.email;
              return `<tr>
                <td>${this.avatar(p.name, 32)} <b>${this.esc(p.name)}</b> ${p.leader ? '👑' : ''}</td>
                <td>${this.esc(p.email || '—')}</td>
                <td>${manage && isMember
                  ? `<select onchange="window.ProjectHub.changeRole('${id}','${this.esc(p.email)}',this.value)">${this.roleOptions(p.role)}</select>`
                  : `<span class="phub-role-tag">${(this.ROLES[p.role] || this.ROLES.viewer).icon} ${(this.ROLES[p.role] || this.ROLES.viewer).label}</span>`}</td>
                ${manage ? `<td>${isMember ? `<button type="button" class="phub-mini red" onclick="window.ProjectHub.removeMember('${id}','${this.esc(p.email)}')">Quitar</button>` : ''}</td>` : ''}
              </tr>`;
            }).join('')}
          </tbody>
        </table>
        ${manage ? '' : '<p class="phub-desc" style="margin-top:.75rem;">Solo el creador puede cambiar los roles.</p>'}
      </div>
      ${manage ? this.renderRequestsCard(proj, hub) : ''}
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap">
          <h2 class="phub-pill-title yellow"><span class="ico">🔐</span> Qué puede hacer cada rol</h2>
        </div>
        <ul class="phub-roles-legend">
          ${['owner', ...this.ASSIGNABLE].map(r => `<li><span>${this.ROLES[r].icon}</span><div><b>${this.ROLES[r].label}</b><small>${this.ROLES[r].desc}</small></div></li>`).join('')}
        </ul>
      </div>`;
  },

  renderSettings(proj, hub) {
    const id = this.esc(proj.id);
    const isAdmin = !!(window.ProjectsView && window.ProjectsView.isAdminUser && window.ProjectsView.isAdminUser());
    return `
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap">
          <h2 class="phub-pill-title yellow"><span class="ico">⚙️</span> Configuración</h2>
        </div>
        <div class="phub-settings-grid">
          <button type="button" class="phub-cfg-btn cfg-blue" onclick="window.ProjectHub.editProject('${id}')">
            <span class="phub-cfg-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </span>
            <span class="phub-cfg-text">
              <strong>Editar contenido</strong>
              <small>Abre el asistente y actualiza textos, videos y archivos</small>
            </span>
            <span class="phub-cfg-arrow">→</span>
          </button>

          ${isAdmin ? `
          <button type="button" class="phub-cfg-btn cfg-green" onclick="window.ProjectsView.openHeroBannerPicker('${id}')">
            <span class="phub-cfg-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </span>
            <span class="phub-cfg-text">
              <strong>Cambiar fondo del banner <em class="phub-cfg-tag">Admin</em></strong>
              <small>Personaliza la imagen principal (Hero) del proyecto</small>
            </span>
            <span class="phub-cfg-arrow">→</span>
          </button>` : ''}

          <button type="button" class="phub-cfg-btn cfg-purple" onclick="window.ProjectHub.openLanding('${id}')">
            <span class="phub-cfg-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
            </span>
            <span class="phub-cfg-text">
              <strong>Ver página pública</strong>
              <small>Previsualiza la landing page tal como la ven todos</small>
            </span>
            <span class="phub-cfg-arrow">→</span>
          </button>

          <button type="button" class="phub-cfg-btn cfg-amber" onclick="window.ProjectHub.share('${id}')">
            <span class="phub-cfg-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            </span>
            <span class="phub-cfg-text">
              <strong>Copiar enlace</strong>
              <small>Comparte el link directo de este proyecto</small>
            </span>
            <span class="phub-cfg-arrow">→</span>
          </button>
        </div>
      </div>`;
  },

  /* ------------------------------ reportes ------------------------------ */
  renderReports(proj, hub) {
    const views = hub.views || [];
    const uniq = new Set(views.map(v => v.who)).size;
    const stats = this.ratingStats(hub);
    const days = [];
    const now = new Date(); now.setHours(0, 0, 0, 0);
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 86400000);
      const next = d.getTime() + 86400000;
      days.push({ label: d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' }), n: views.filter(v => v.t >= d.getTime() && v.t < next).length });
    }
    const max = Math.max(1, ...days.map(d => d.n));
    const recent = views.slice(-6).reverse();
    const id = this.esc(proj.id);
    const myRating = (hub.ratings.find(r => r.who === this.me().key) || {}).stars || 0;

    const kpiIcons = {
      views: `<svg viewBox="0 0 44 44" width="38" height="38" fill="none"><defs><linearGradient id="kV" x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#38bdf8"/><stop offset="100%" stop-color="#2563eb"/></linearGradient></defs><rect width="44" height="44" rx="14" fill="url(#kV)"/><path d="M9 22 C13 15 17.5 12.5 22 12.5 C26.5 12.5 31 15 35 22 C31 29 26.5 31.5 22 31.5 C17.5 31.5 13 29 9 22 Z" fill="#ffffff" fill-opacity="0.95"/><circle cx="22" cy="22" r="5" fill="#1d4ed8"/><circle cx="23.8" cy="20.2" r="1.8" fill="#ffffff"/></svg>`,
      people: `<svg viewBox="0 0 44 44" width="38" height="38" fill="none"><defs><linearGradient id="kP" x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6366f1"/></linearGradient></defs><rect width="44" height="44" rx="14" fill="url(#kP)"/><circle cx="28" cy="17" r="4.5" fill="#e9d5ff"/><path d="M22 33 C22 28.5 24.5 25.5 28.5 25.5 C32.5 25.5 35 28.5 35 33 Z" fill="#e9d5ff"/><circle cx="17" cy="16.5" r="5.5" fill="#ffffff"/><path d="M8.5 33.5 C8.5 28 12 24.5 17 24.5 C22 24.5 25.5 28 25.5 33.5 Z" fill="#ffffff"/></svg>`,
      star: `<svg viewBox="0 0 44 44" width="38" height="38" fill="none"><defs><linearGradient id="kS" x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#fde047"/><stop offset="100%" stop-color="#ea580c"/></linearGradient></defs><rect width="44" height="44" rx="14" fill="url(#kS)"/><path d="M22 9 L25.8 16.8 L34.4 18 L28.2 24 L29.7 32.6 L22 28.5 L14.3 32.6 L15.8 24 L9.6 18 L18.2 16.8 Z" fill="#ffffff"/></svg>`,
      votes: `<svg viewBox="0 0 44 44" width="38" height="38" fill="none"><defs><linearGradient id="kB" x1="4" y1="6" x2="40" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#34d399"/><stop offset="100%" stop-color="#059669"/></linearGradient></defs><rect width="44" height="44" rx="14" fill="url(#kB)"/><rect x="11" y="13" width="22" height="19" rx="4" fill="#ffffff" fill-opacity="0.95"/><path d="M16 22.5 L20 26.5 L28.5 18" stroke="#059669" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`
    };

    const barPalette = [
      ['#38bdf8', '#2563eb', '#1e3a8a'],
      ['#60a5fa', '#4f46e5', '#312e81'],
      ['#34d399', '#059669', '#065f46'],
      ['#a78bfa', '#7c3aed', '#4c1d95'],
      ['#f472b6', '#db2777', '#831843'],
      ['#fbbf24', '#ea580c', '#9a3412'],
      ['#22d3ee', '#0284c7', '#0c4a6e']
    ];

    return `
      <div class="phub-kpis phub-kpis-3d">
        <div class="phub-kpi phub-kpi-3d kpi-blue"><span class="phub-kpi-ico-3d">${kpiIcons.views}</span><b data-count="${views.length}">0</b><small>Visitas totales</small></div>
        <div class="phub-kpi phub-kpi-3d kpi-purple"><span class="phub-kpi-ico-3d">${kpiIcons.people}</span><b data-count="${uniq}">0</b><small>Personas que lo vieron</small></div>
        <div class="phub-kpi phub-kpi-3d kpi-gold"><span class="phub-kpi-ico-3d">${kpiIcons.star}</span><b data-count="${stats.avg.toFixed(1)}" data-dec="1">0</b><small>Calificación promedio</small></div>
        <div class="phub-kpi phub-kpi-3d kpi-green"><span class="phub-kpi-ico-3d">${kpiIcons.votes}</span><b data-count="${stats.total}">0</b><small>Calificaciones</small></div>
      </div>

      <div class="phub-report-grid">
        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">📈</span> Personas que han visto el proyecto</h2>
          </div>
          <div class="phub-bars phub-bars-3d">
            ${days.map((d, idx) => {
              const pal = barPalette[idx % barPalette.length];
              const hPx = d.n > 0 ? Math.max(26, Math.round((d.n / max) * 140)) : 10;
              return `
              <div class="phub-bar-col phub-bar-col-3d" style="--i:${idx}; --b-top:${pal[0]}; --b-mid:${pal[1]}; --b-side:${pal[2]};">
                <span class="phub-bar-n phub-bar-n-3d ${d.n > 0 ? 'has-val' : ''}">${d.n}</span>
                <div class="phub-bar-stage">
                  <div class="phub-bar-3d ${d.n > 0 ? 'active' : 'zero'}" style="height:${hPx}px;"></div>
                </div>
                <small>${this.esc(d.label)}</small>
              </div>`;
            }).join('')}
          </div>
          <h4 class="phub-sub" style="margin-top:1.1rem;">Últimas visitas</h4>
          <ul class="phub-recent">
            ${recent.length ? recent.map(v => `<li>${this.avatar(v.name, 28)} <span>${this.esc(v.name || 'Visitante')}</span><small>${new Date(v.t).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></li>`).join('') : '<li class="empty">Todavía nadie ha visto este proyecto.</li>'}
          </ul>
        </div>

        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">⭐</span> Calificación del proyecto</h2>
          </div>
          <div class="phub-rating-top phub-rating-top-3d">
            ${this.gauge(Math.round((stats.avg / 5) * 100), stats.total ? `${stats.avg.toFixed(1)} de 5` : 'Sin calificar', '#f59e0b', '#facc15', '⭐')}
            <div class="phub-dist phub-dist-3d">
              ${[5, 4, 3, 2, 1].map(s => {
                const pctBar = stats.total ? Math.round(stats.dist[s - 1] / stats.total * 100) : 0;
                return `
                <div class="phub-dist-row phub-dist-row-3d">
                  <span class="phub-dist-star">${s}★</span>
                  <div class="phub-dist-bar phub-dist-bar-3d"><i style="width:${pctBar}%"></i></div>
                  <em class="phub-dist-num">${stats.dist[s - 1]}</em>
                </div>`;
              }).join('')}
            </div>
          </div>
          <div class="phub-rate phub-rate-3d">
            <b>${myRating ? 'Tu calificación' : 'Califica este proyecto'}</b>
            <div class="phub-stars">
              ${[1, 2, 3, 4, 5].map(s => `<button type="button" class="${s <= myRating ? 'on' : ''}" onclick="window.ProjectHub.rate('${id}', ${s})" aria-label="${s} estrellas">★</button>`).join('')}
            </div>
            <small>Cualquier persona puede calificar. Una calificación por persona.</small>
          </div>
        </div>
      </div>`;
  },

  rate(projectId, stars) {
    const proj = this.getProject(projectId);
    if (!proj) return;
    const hub = this.getHub(projectId);
    const me = this.me();
    const existing = hub.ratings.find(r => r.who === me.key);
    if (existing) { existing.stars = stars; existing.t = Date.now(); }
    else hub.ratings.push({ who: me.key, name: me.name || 'Visitante', stars, t: Date.now() });
    const st = this.ratingStats(hub);
    if (this.isStored(projectId)) proj.rating = st.avg.toFixed(1);
    this.saveHub(projectId, hub);
    this.toast('⭐ ¡Gracias por calificar!');
    this.render();
  },

  /* ------------------------------ vista de calificación y comentarios a pantalla completa ------------------------------ */
  currentReviewStars: 5,
  currentReviewTag: '💡 Idea innovadora',

  formatTimeAgo(ts) {
    if (!ts) return 'Reciente';
    const diff = Math.max(0, Date.now() - ts);
    const m = Math.floor(diff / 60000);
    if (m < 2) return 'Hace un momento';
    if (m < 60) return `Hace ${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `Hace ${h} ${h === 1 ? 'hora' : 'horas'}`;
    const d = Math.floor(h / 24);
    if (d < 30) return `Hace ${d} ${d === 1 ? 'día' : 'días'}`;
    return new Date(ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  },

  ensureInitialReviews(hub, proj) {
    if (!Array.isArray(hub.ratings)) hub.ratings = [];
    if (hub.ratings.length === 0) {
      hub.ratings = [
        {
          who: 'usr_sample_1',
          name: 'Sofía Morales',
          stars: 5,
          comment: '¡Increíble trabajo en equipo! La propuesta visual, la temática y los recursos interactivos están extraordinarios.',
          tag: '🎨 Gran diseño',
          t: Date.now() - 3600000 * 28
        },
        {
          who: 'usr_sample_2',
          name: 'Mateo Delgado',
          stars: 5,
          comment: 'Un proyecto sumamente inspirador para toda la comunidad. Gran dominio temático, claridad y propuesta pedagógica.',
          tag: '🚀 Gran impacto',
          t: Date.now() - 3600000 * 72
        },
        {
          who: 'usr_sample_3',
          name: 'Camila Ríos',
          stars: 4,
          comment: 'Muy bien estructurado. Me encantó la metodología ágil y la documentación de las etapas de trabajo.',
          tag: '💡 Idea innovadora',
          t: Date.now() - 3600000 * 120
        }
      ];
    }
  },

  closeReviewPage() {
    const el = document.getElementById('phub-fullpage-review');
    if (el) el.remove();
    if (!document.getElementById('phub-overlay') && !document.getElementById('phub-fullpage-join')) {
      document.body.style.overflow = '';
    }
    if (window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects') {
      try { window.ProjectsView.render(); } catch (e) {}
    }
  },

  getReviewTheme() {
    try {
      const saved = localStorage.getItem('mentix_review_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    if (document.body.classList.contains('light-theme') || document.body.classList.contains('projects-pure-white-theme')) {
      return 'light';
    }
    return 'dark';
  },

  applyReviewTheme(theme) {
    const fullpage = document.getElementById('phub-fullpage-review');
    if (!fullpage) return;
    const isLight = theme === 'light';
    if (isLight) {
      fullpage.classList.add('theme-light');
      fullpage.classList.remove('theme-dark');
    } else {
      fullpage.classList.remove('theme-light');
      fullpage.classList.add('theme-dark');
    }
    const iconEl = document.getElementById('phub-rev-theme-icon');
    const textEl = document.getElementById('phub-rev-theme-text');
    if (iconEl) iconEl.textContent = isLight ? '🌙' : '☀️';
    if (textEl) textEl.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
    try {
      localStorage.setItem('mentix_review_theme', theme);
    } catch (e) {}
  },

  toggleReviewTheme() {
    const fullpage = document.getElementById('phub-fullpage-review');
    const current = (fullpage && fullpage.classList.contains('theme-light')) ? 'light' : 'dark';
    const next = current === 'light' ? 'dark' : 'light';
    this.applyReviewTheme(next);
  },

  setReviewStars(stars) {
    this.currentReviewStars = stars;
    const btns = document.querySelectorAll('.phub-rev-star-btn');
    btns.forEach((btn, idx) => {
      if (idx < stars) {
        btn.classList.add('active');
        btn.textContent = '★';
      } else {
        btn.classList.remove('active');
        btn.textContent = '☆';
      }
    });
    const cap = document.getElementById('phub-rev-caption');
    const captions = {
      1: '⭐ Necesita bastante trabajo y ajustes',
      2: '⭐⭐ Regular, tiene aspectos importantes por mejorar',
      3: '⭐⭐⭐ Bueno, cumple con los requisitos básicos',
      4: '⭐⭐⭐⭐ Muy bueno, gran aporte y calidad en el contenido',
      5: '⭐⭐⭐⭐⭐ ¡Excelente proyecto! Extraordinario, creativo e inspirador'
    };
    if (cap) cap.textContent = captions[stars] || `${stars} estrellas`;
  },

  selectReviewTag(btn, tag) {
    this.currentReviewTag = tag;
    document.querySelectorAll('.phub-rev-tag-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');
  },

  renderReviewListHtml(ratings) {
    const list = (ratings || []).slice().reverse();
    const withComments = list.filter(r => r && (r.comment && r.comment.trim() || r.stars));
    if (withComments.length === 0) {
      return `
        <div class="phub-rev-empty">
          <div class="phub-rev-empty-ico">🌟</div>
          <p style="margin:0; font-weight:700; color:#cbd5e1;">Aún no hay comentarios escritos.</p>
          <span style="font-size:0.84rem; color:#94a3b8;">¡Sé el primero en calificar y dejar tu comentario arriba!</span>
        </div>
      `;
    }

    return withComments.map(r => {
      const name = this.esc(r.name || 'Estudiante');
      const stars = Math.max(1, Math.min(5, parseInt(r.stars, 10) || 5));
      const starIcons = '★'.repeat(stars) + '☆'.repeat(5 - stars);
      const tag = r.tag ? `<span class="phub-rev-tag-badge">${this.esc(r.tag)}</span>` : '';
      const timeAgo = this.formatTimeAgo(r.t);
      const initial = (name.replace('@', '').trim()[0] || 'U').toUpperCase();
      const commentText = r.comment ? this.esc(r.comment) : '<em>(Calificó con estrellas)</em>';

      return `
        <div class="phub-rev-item">
          <div class="phub-rev-item-head">
            <div class="phub-rev-user-info">
              <div class="phub-rev-avatar">${initial}</div>
              <div>
                <div class="phub-rev-author">${name}</div>
                <div class="phub-rev-date">${timeAgo}</div>
              </div>
            </div>
            <div class="phub-rev-meta-badges">
              <span class="phub-rev-stars-badge">${starIcons} ${stars}/5</span>
              ${tag}
            </div>
          </div>
          <p class="phub-rev-text">${commentText}</p>
        </div>
      `;
    }).join('');
  },

  openReviewPage(projectId) {
    const proj = this.getProject(projectId);
    if (!proj) {
      this.toast('No se encontró el proyecto');
      return;
    }
    this.currentId = projectId;
    const hub = this.getHub(projectId);
    this.ensureInitialReviews(hub, proj);
    this.saveHub(projectId, hub);

    let fullpage = document.getElementById('phub-fullpage-review');
    if (!fullpage) {
      fullpage = document.createElement('div');
      fullpage.id = 'phub-fullpage-review';
      document.body.appendChild(fullpage);
    }
    document.body.style.overflow = 'hidden';

    const currentTheme = this.getReviewTheme();
    if (currentTheme === 'light') {
      fullpage.classList.add('theme-light');
      fullpage.classList.remove('theme-dark');
    } else {
      fullpage.classList.remove('theme-light');
      fullpage.classList.add('theme-dark');
    }

    const bannerUrl = this.getHeroBannerUrl(proj);
    const author = this.esc(proj.author || 'Creador Mentix');
    const title = this.esc(proj.title || 'Proyecto');
    const id = this.esc(proj.id);
    const icon = proj.icon || '🏰';
    const me = this.me();

    const stats = this.ratingStats(hub);
    const avgScore = stats.total > 0 ? stats.avg.toFixed(1) : (proj.rating || '5.0');
    const totalCount = stats.total;

    this.currentReviewStars = 5;
    this.currentReviewTag = '💡 Idea innovadora';

    fullpage.innerHTML = `
      <div class="phub-fp-bg" style="background-image: url('${bannerUrl}');"></div>
      <div class="phub-fp-overlay"></div>
      <div class="phub-fp-glow"></div>

      <div class="phub-fp-shell">
        <header class="phub-fp-header">
          <button type="button" class="phub-fp-back-btn" onclick="window.ProjectHub.closeReviewPage()">
            <span>←</span>
            <span>Volver al Proyecto</span>
          </button>

          <div class="phub-fp-center-badge">
            <span class="phub-fp-dot" style="background:#facc15; box-shadow:0 0 10px #facc15;"></span>
            <span>⭐ CALIFICACIÓN &amp; COMENTARIOS</span>
          </div>

          <div class="phub-fp-header-actions">
            <button type="button" class="phub-fp-ghost-btn phub-rev-theme-btn" id="phub-rev-theme-toggle" onclick="window.ProjectHub.toggleReviewTheme()" title="Cambiar tema Claro / Oscuro">
              <span id="phub-rev-theme-icon">${currentTheme === 'light' ? '🌙' : '☀️'}</span>
              <span id="phub-rev-theme-text">${currentTheme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </button>
            <button type="button" class="phub-fp-ghost-btn" onclick="window.ProjectHub.openLanding('${id}')">
              <span>🌐</span>
              <span>Ver Landing Page</span>
            </button>
            <button type="button" class="phub-fp-close-x" onclick="window.ProjectHub.closeReviewPage()" title="Cerrar">✕</button>
          </div>
        </header>

        <main class="phub-rev-body">
          <!-- Tarjeta de Resumen de Calificación del Proyecto -->
          <div class="phub-rev-summary-card">
            <div class="phub-fp-hero-box" style="margin-bottom: 0.8rem;">
              <div class="phub-fp-avatar">${icon}</div>
              <h1 class="phub-fp-title" style="margin-bottom: 0.35rem;">Calificaciones de “${title}”</h1>
              <p class="phub-fp-subtitle">Proyecto creado por <strong>${author}</strong> • Opiniones y valoraciones de la comunidad</p>
            </div>

            <div class="phub-rev-kpi-wrap">
              <div class="phub-rev-score-big">
                <div class="phub-rev-num" id="phub-rev-avg-score">${avgScore}</div>
                <div class="phub-rev-stars-cluster">★★★★★</div>
                <div class="phub-rev-total-lbl" id="phub-rev-total-count">${totalCount} calificaciones</div>
              </div>

              <div class="phub-rev-bars" id="phub-rev-bars-container">
                ${[5, 4, 3, 2, 1].map(star => {
                  const count = stats.dist[star - 1] || 0;
                  const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : (star === 5 ? 85 : 5);
                  return `
                    <div class="phub-rev-bar-row">
                      <span class="phub-rev-bar-lbl">${star} ★</span>
                      <div class="phub-rev-bar-track">
                        <div class="phub-rev-bar-fill" style="width: ${pct}%;"></div>
                      </div>
                      <span class="phub-rev-bar-count">${count}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <!-- Tarjeta de Formulario: Dejar Calificación y Comentario -->
          <div class="phub-rev-form-card">
            <div class="phub-rev-form-head">
              <span style="font-size: 1.8rem; line-height: 1;">✍️</span>
              <div>
                <h3 class="phub-rev-form-title">Deja tu Calificación y Comentario</h3>
                <p class="phub-rev-form-desc" style="margin: 0.2rem 0 0; font-size: 0.88rem;">Selecciona las estrellas y escribe qué te pareció el proyecto.</p>
              </div>
            </div>

            <!-- Selector de Estrellas Interactivo -->
            <div class="phub-rev-stars-box">
              <div class="phub-rev-stars-lbl" style="font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.05em;">
                Tu Calificación:
              </div>
              <div class="phub-rev-stars-row" id="phub-stars-row">
                ${[1, 2, 3, 4, 5].map(s => `
                  <button type="button" class="phub-rev-star-btn active" data-star="${s}" onclick="window.ProjectHub.setReviewStars(${s})" title="${s} estrellas">★</button>
                `).join('')}
              </div>
              <div class="phub-rev-star-caption" id="phub-rev-caption">
                ⭐⭐⭐⭐⭐ ¡Excelente proyecto! Extraordinario, creativo e inspirador
              </div>
            </div>

            <form onsubmit="event.preventDefault(); window.ProjectHub.submitReviewForm('${id}');" class="phub-fp-form">
              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">👤 Tu Nombre o Usuario:</span>
                <input id="phub-rev-name" class="phub-fp-input" type="text" required maxlength="60" placeholder="Ej: Juan Pérez o @juan" value="${this.esc(me.name)}" />
              </div>

              <!-- Etiquetas Rápidas -->
              <div class="phub-rev-tags-box">
                <span class="phub-rev-tags-lbl">🏷️ Destacar aspecto principal (opcional):</span>
                <div class="phub-rev-tags-row">
                  ${['💡 Idea innovadora', '🎨 Gran diseño', '🚀 Gran impacto', '👏 Felicitaciones', '🛠️ Sugerencia constructiva'].map((tag, idx) => `
                    <button type="button" class="phub-rev-tag-pill ${idx === 0 ? 'active' : ''}" onclick="window.ProjectHub.selectReviewTag(this, '${tag}')">${tag}</button>
                  `).join('')}
                </div>
              </div>

              <!-- Comentario -->
              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">💬 Tu Comentario o Retroalimentación:</span>
                <textarea id="phub-rev-comment" class="phub-rev-textarea" required minlength="4" maxlength="600" placeholder="Escribe aquí tu opinión, qué fue lo que más te gustó, ideas para seguir mejorando o felicitaciones para el equipo..."></textarea>
              </div>

              <button type="submit" class="phub-rev-submit-btn">
                <span>⭐</span>
                <span>Publicar mi Calificación y Comentario</span>
              </button>
            </form>
          </div>

          <!-- Tarjeta de Comentarios de la Comunidad -->
          <div class="phub-rev-list-card">
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.4rem;">
              <h3 class="phub-rev-list-title" style="margin:0; font-size:1.35rem; font-weight:900;">
                💬 Comentarios de la Comunidad (<span id="phub-rev-comm-count">${hub.ratings.filter(r => r.comment).length}</span>)
              </h3>
              <span class="phub-rev-verified-badge" style="font-size:0.82rem; font-weight:700;">★ Opiniones verificadas</span>
            </div>
            <div class="phub-rev-list" id="phub-rev-items-container">
              ${this.renderReviewListHtml(hub.ratings)}
            </div>
          </div>
        </main>
      </div>
    `;

    setTimeout(() => {
      const ta = document.getElementById('phub-rev-comment');
      if (ta) ta.focus();
    }, 100);
  },

  submitReviewForm(projectId) {
    const proj = this.getProject(projectId);
    if (!proj) {
      this.toast('⚠️ No se pudo identificar el proyecto.');
      return;
    }
    const hub = this.getHub(projectId);
    const me = this.me();

    const nameInput = document.getElementById('phub-rev-name');
    const commentInput = document.getElementById('phub-rev-comment');

    const name = (nameInput ? nameInput.value : '').trim() || me.name || 'Visitante';
    let comment = (commentInput ? commentInput.value : '').trim();
    const stars = this.currentReviewStars || 5;
    const tag = this.currentReviewTag || '';

    if (!comment) {
      comment = `Calificó con ${stars} estrellas el proyecto.`;
    }

    if (!Array.isArray(hub.ratings)) hub.ratings = [];

    const existingIdx = hub.ratings.findIndex(r => r.who === me.key);
    const newReview = {
      who: me.key,
      name,
      stars,
      comment,
      tag,
      t: Date.now()
    };

    if (existingIdx >= 0) {
      hub.ratings[existingIdx] = newReview;
    } else {
      hub.ratings.unshift(newReview);
    }

    const st = this.ratingStats(hub);
    const newRating = st.avg.toFixed(1);
    proj.rating = newRating;
    proj.ratings = hub.ratings;
    proj.ratingsCount = st.total;
    if (proj.hub) proj.hub.ratings = hub.ratings;

    // Actualizar en window.appState.challenges
    if (window.appState && Array.isArray(window.appState.challenges)) {
      const match = window.appState.challenges.find(c => c && String(c.id) === String(projectId));
      if (match) {
        match.rating = newRating;
        match.ratings = hub.ratings;
        match.ratingsCount = st.total;
        if (!match.hub) match.hub = {};
        match.hub.ratings = hub.ratings;
      }
      if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    }

    // Actualizar en mentix_active_landing_project
    try {
      const activeRaw = localStorage.getItem('mentix_active_landing_project');
      if (activeRaw) {
        const active = JSON.parse(activeRaw);
        if (active && (!projectId || String(active.id) === String(projectId))) {
          active.rating = newRating;
          active.ratings = hub.ratings;
          active.ratingsCount = st.total;
          localStorage.setItem('mentix_active_landing_project', JSON.stringify(active));
        }
      }
    } catch (e) {}

    // Sincronizar en la nube con Supabase para que viaje a todos los usuarios
    if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
      try { window.appRouter.pushChallengeToCloud(proj); } catch (e) {}
    }

    this.saveHub(projectId, hub);

    // Actualizar badge en la página si está presente
    const heroScoreEl = document.getElementById('inno-hero-rating-score');
    if (heroScoreEl) heroScoreEl.textContent = newRating;
    const heroCountEl = document.getElementById('inno-hero-rating-count');
    if (heroCountEl) heroCountEl.textContent = `(${st.total} calificaciones)`;

    if (window.soundEngine && typeof window.soundEngine.playCorrect === 'function') {
      window.soundEngine.playCorrect();
    } else if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
      window.soundEngine.playPop();
    }

    this.toast('⭐ ¡Tu calificación y comentario fueron publicados con éxito!');

    const listContainer = document.getElementById('phub-rev-items-container');
    if (listContainer) listContainer.innerHTML = this.renderReviewListHtml(hub.ratings);

    const commCount = document.getElementById('phub-rev-comm-count');
    if (commCount) commCount.textContent = hub.ratings.filter(r => r.comment).length;

    const avgScoreEl = document.getElementById('phub-rev-avg-score');
    if (avgScoreEl) avgScoreEl.textContent = newRating;

    const totalCountEl = document.getElementById('phub-rev-total-count');
    if (totalCountEl) totalCountEl.textContent = `${st.total} calificaciones`;

    const barsContainer = document.getElementById('phub-rev-bars-container');
    if (barsContainer) {
      barsContainer.innerHTML = [5, 4, 3, 2, 1].map(star => {
        const count = st.dist[star - 1] || 0;
        const pct = st.total > 0 ? Math.round((count / st.total) * 100) : 0;
        return `
          <div class="phub-rev-bar-row">
            <span class="phub-rev-bar-lbl">${star} ★</span>
            <div class="phub-rev-bar-track">
              <div class="phub-rev-bar-fill" style="width: ${pct}%;"></div>
            </div>
            <span class="phub-rev-bar-count">${count}</span>
          </div>
        `;
      }).join('');
    }

    if (commentInput) commentInput.value = '';
    const firstItem = listContainer ? listContainer.firstElementChild : null;
    if (firstItem) {
      firstItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      firstItem.style.boxShadow = '0 0 25px rgba(250, 204, 21, 0.5)';
      firstItem.style.borderColor = '#facc15';
    }
  },

  /* ------------------------------ acciones ------------------------------ */
  editProject(projectId) {
    const pid = projectId || this.currentId;
    const proj = this.getProject(pid);
    if (!this.canEdit(proj)) { this.toast('🔒 Tu rol no permite editar este proyecto.'); return; }
    this.close();
    const launchWizard = () => {
      if (window.ProjectWizard && typeof window.ProjectWizard.openWizard === 'function') {
        window.ProjectWizard.openWizard(pid, 1, true);
      } else if (window.ProjectsView && typeof window.ProjectsView.openEditProject === 'function') {
        window.ProjectsView.openEditProject(pid);
      }
    };
    // Asegurar que la vista de proyectos esté activa para que el asistente sea 100% visible
    const projSec = document.getElementById('view-projects');
    const isProjVisible = projSec && projSec.classList.contains('active');
    if (!isProjVisible && window.appRouter && typeof window.appRouter.navigate === 'function') {
      try { window.appRouter.navigate('projects'); } catch (e) {}
      setTimeout(launchWizard, 80);
    } else {
      launchWizard();
    }
  },
  openLanding(projectId) {
    this.close();
    if (window.ProjectsView && typeof window.ProjectsView.openProjectLanding === 'function') window.ProjectsView.openProjectLanding(projectId);
  },
  share(projectId) {
    const proj = this.getProject(projectId);
    if (window.ProjectsView && typeof window.ProjectsView.shareProject === 'function') window.ProjectsView.shareProject(projectId, proj ? proj.title : '');
  },

  /* ------------------------------ solicitud de unión ------------------------------ */
  modal(html) {
    const old = document.getElementById('phub-modal');
    if (old) old.remove();
    const m = document.createElement('div');
    m.id = 'phub-modal';
    m.innerHTML = `<div class="phub-modal-card">${html}</div>`;
    m.addEventListener('click', e => { if (e.target === m) m.remove(); });
    document.body.appendChild(m);
    return m;
  },
  closeModal() { const m = document.getElementById('phub-modal'); if (m) m.remove(); },

  getHeroBannerUrl(proj) {
    if (!proj) return 'assets/projects_ui/disney_hero_banner.png';
    if (window.ProjectsView && typeof window.ProjectsView.getProjectHeroBanner === 'function') {
      return window.ProjectsView.getProjectHeroBanner(proj.id, proj);
    }
    return proj.heroBanner || proj.bannerUrl || proj.coverImage || 'assets/projects_ui/disney_hero_banner.png';
  },

  openRestrictedModal(proj) {
    if (!proj) return;
    this.openJoinForm(proj.id, 'join');
  },

  closeJoinPage() {
    const el = document.getElementById('phub-fullpage-join');
    if (el) el.remove();
    this.closeModal();
    const proj = this.getProject(this.currentId);
    if (proj && !this.canView(proj)) {
      this.close();
    } else if (!document.getElementById('phub-overlay')) {
      document.body.style.overflow = '';
    }
    if (window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects') {
      try { window.ProjectsView.render(); } catch (e) {}
    }
  },

  switchFpMode(mode) {
    const joinSec = document.getElementById('phub-fp-section-join');
    const loginSec = document.getElementById('phub-fp-section-login');
    const tabJoin = document.getElementById('phub-fp-tab-join');
    const tabLogin = document.getElementById('phub-fp-tab-login');
    if (mode === 'login') {
      if (joinSec) joinSec.style.display = 'none';
      if (loginSec) loginSec.style.display = 'flex';
      if (tabJoin) tabJoin.classList.remove('active');
      if (tabLogin) tabLogin.classList.add('active');
      setTimeout(() => { const el = document.getElementById('phub-l-email'); if (el) el.focus(); }, 50);
    } else {
      if (joinSec) joinSec.style.display = 'flex';
      if (loginSec) loginSec.style.display = 'none';
      if (tabJoin) tabJoin.classList.add('active');
      if (tabLogin) tabLogin.classList.remove('active');
      setTimeout(() => { const el = document.getElementById('phub-j-name'); if (el) el.focus(); }, 50);
    }
  },

  togglePassVisibility(inputId, btn) {
    const inp = document.getElementById(inputId);
    if (!inp) return;
    if (inp.type === 'password') {
      inp.type = 'text';
      if (btn) btn.textContent = '🙈';
    } else {
      inp.type = 'password';
      if (btn) btn.textContent = '👁️';
    }
  },

  openJoinForm(projectId, initialMode = 'join') {
    const u = window.appState?.currentUser;
    const isGuest = !u || u.isGuest || u.username === 'invitado';
    if (isGuest) {
      alert('🔒 Para unirte a un proyecto debes registrarte o iniciar sesión en Mentix.');
      if (window.appRouter && typeof window.appRouter.openAuthModal === 'function') {
        window.appRouter.openAuthModal('register');
      }
      return;
    }
    const proj = this.getProject(projectId);
    if (!proj) return;
    const me = this.me();
    this.currentId = projectId;
    this.closeModal();

    let fullpage = document.getElementById('phub-fullpage-join');
    if (!fullpage) {
      fullpage = document.createElement('div');
      fullpage.id = 'phub-fullpage-join';
      document.body.appendChild(fullpage);
    }
    document.body.style.overflow = 'hidden';

    const bannerUrl = this.getHeroBannerUrl(proj);
    const author = this.esc(proj.author || 'Creador Mentix');
    const title = this.esc(proj.title || 'Proyecto');
    const id = this.esc(proj.id);
    const icon = proj.icon || '🏰';

    fullpage.innerHTML = `
      <div class="phub-fp-bg" style="background-image: url('${bannerUrl}');"></div>
      <div class="phub-fp-overlay"></div>
      <div class="phub-fp-glow"></div>

      <div class="phub-fp-shell">
        <header class="phub-fp-header">
          <button type="button" class="phub-fp-back-btn" onclick="window.ProjectHub.closeJoinPage()">
            <span>←</span>
            <span>Volver a Mis Proyectos</span>
          </button>

          <div class="phub-fp-center-badge">
            <span class="phub-fp-dot"></span>
            <span>Espacio Privado • Solo Miembros</span>
          </div>

          <div class="phub-fp-header-actions">
            <button type="button" class="phub-fp-ghost-btn" onclick="window.ProjectHub.openLanding('${id}')">
              <span>🌐</span>
              <span>Ver Landing Page</span>
            </button>
            <button type="button" class="phub-fp-close-x" onclick="window.ProjectHub.closeJoinPage()" title="Cerrar">✕</button>
          </div>
        </header>

        <main class="phub-fp-body">
          <div class="phub-fp-card" id="phub-fp-main-card">
            <div class="phub-fp-hero-box">
              <div class="phub-fp-avatar">${icon}</div>
              <h1 class="phub-fp-title">Unirme a “${title}”</h1>
              <p class="phub-fp-subtitle">Proyecto creado por <strong>${author}</strong></p>
            </div>

            <div class="phub-fp-callout">
              <span class="ico">🛡️</span>
              <div class="txt">
                <strong>Espacio Exclusivo de Proyecto</strong>
                <p>Este panel es privado para el creador y los miembros unidos. Envía tu solicitud para que el creador te autorice y asigne tu rol con acceso a entregas y recursos.</p>
              </div>
            </div>

            <div class="phub-fp-tabs">
              <button type="button" id="phub-fp-tab-join" class="phub-fp-tab ${initialMode !== 'login' ? 'active' : ''}" onclick="window.ProjectHub.switchFpMode('join')">
                <span>👥➕</span> Solicitar unirme
              </button>
              <button type="button" id="phub-fp-tab-login" class="phub-fp-tab ${initialMode === 'login' ? 'active' : ''}" onclick="window.ProjectHub.switchFpMode('login')">
                <span>🔑</span> Ya soy miembro (Entrar)
              </button>
            </div>

            <!-- Sección de Solicitud de Unión -->
            <form id="phub-fp-section-join" onsubmit="event.preventDefault(); window.ProjectHub.submitJoin('${id}');" class="phub-fp-form" style="display: ${initialMode !== 'login' ? 'flex' : 'none'};">
              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">👤 Nombre o usuario:</span>
                <div class="phub-fp-input-wrap">
                  <input id="phub-j-name" class="phub-fp-input" type="text" required maxlength="60" placeholder="Ej: Juan o @juan" value="${this.esc(me.name)}" autocomplete="username">
                </div>
              </div>

              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">✉️ Correo electrónico:</span>
                <div class="phub-fp-input-wrap">
                  <input id="phub-j-email" class="phub-fp-input" type="email" required maxlength="90" placeholder="juan.p@email.com" value="${this.esc(me.email)}" autocomplete="email">
                </div>
              </div>

              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">🔑 Contraseña para ingresar al proyecto:</span>
                <div class="phub-fp-input-wrap">
                  <input id="phub-j-pass" class="phub-fp-input has-eye" type="password" required minlength="4" maxlength="60" placeholder="Mínimo 4 caracteres" autocomplete="new-password">
                  <button type="button" class="phub-fp-eye" onclick="window.ProjectHub.togglePassVisibility('phub-j-pass', this)" title="Ver / Ocultar contraseña">👁️</button>
                </div>
              </div>

              <div class="phub-fp-security-note">
                <span>🔒</span>
                <span>Tu contraseña se cifra automáticamente (SHA-256) antes de guardarse. El creador nunca tendrá acceso a ella.</span>
              </div>

              <button type="submit" class="phub-fp-submit">
                <span>📨</span>
                <span>Enviar solicitud de unión</span>
              </button>
            </form>

            <!-- Sección de Ya soy miembro -->
            <form id="phub-fp-section-login" onsubmit="event.preventDefault(); window.ProjectHub.memberLogin('${id}');" class="phub-fp-form" style="display: ${initialMode === 'login' ? 'flex' : 'none'};">
              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">✉️ Correo electrónico de miembro:</span>
                <div class="phub-fp-input-wrap">
                  <input id="phub-l-email" class="phub-fp-input" type="email" required maxlength="90" placeholder="tu@correo.com" autocomplete="email">
                </div>
              </div>

              <div class="phub-fp-field">
                <span class="phub-fp-label-txt">🔑 Contraseña de acceso:</span>
                <div class="phub-fp-input-wrap">
                  <input id="phub-l-pass" class="phub-fp-input has-eye" type="password" required maxlength="60" placeholder="Tu contraseña" autocomplete="current-password">
                  <button type="button" class="phub-fp-eye" onclick="window.ProjectHub.togglePassVisibility('phub-l-pass', this)" title="Ver / Ocultar contraseña">👁️</button>
                </div>
              </div>

              <button type="submit" class="phub-fp-submit blue">
                <span>🚀</span>
                <span>Ingresar al Proyecto</span>
              </button>
            </form>

            <div class="phub-fp-footer-note">
              Mentix • Plataforma de Aprendizaje e Innovación
            </div>
          </div>
        </main>
      </div>
    `;

    setTimeout(() => {
      if (initialMode === 'login') {
        const i = document.getElementById('phub-l-email');
        if (i) i.focus();
      } else {
        const i = document.getElementById(me.name ? 'phub-j-pass' : 'phub-j-name');
        if (i) i.focus();
      }
    }, 80);
  },

  renderJoinSuccessPage(projectId, name, email) {
    const card = document.getElementById('phub-fp-main-card');
    if (!card) return;
    const proj = this.getProject(projectId);
    const title = this.esc(proj ? proj.title : 'Proyecto');
    const author = this.esc(proj ? proj.author : 'el creador');
    const id = this.esc(projectId);

    card.innerHTML = `
      <div class="phub-fp-success">
        <div class="phub-fp-success-ico">🎉</div>
        <h2 class="phub-fp-success-title">¡Solicitud enviada con éxito!</h2>
        <p class="phub-fp-success-msg">
          Hola <strong>${this.esc(name)}</strong>, tu solicitud para unirte a <strong>“${title}”</strong> ha sido enviada directamente a <strong>${author}</strong>.
        </p>

        <div class="phub-fp-steps-box">
          <div class="phub-fp-step-item">
            <span class="phub-fp-step-num">1️⃣</span>
            <div class="phub-fp-step-txt">
              <strong>Notificación al creador</strong>
              <span>${author} recibió tu petición y la revisará en la sección de Usuarios.</span>
            </div>
          </div>
          <div class="phub-fp-step-item">
            <span class="phub-fp-step-num">2️⃣</span>
            <div class="phub-fp-step-txt">
              <strong>Asignación de rol</strong>
              <span>Te habilitará con un rol (Editor, Colaborador o Comentarista).</span>
            </div>
          </div>
          <div class="phub-fp-step-item">
            <span class="phub-fp-step-num">3️⃣</span>
            <div class="phub-fp-step-txt">
              <strong>Acceso inmediato</strong>
              <span>Podrás entrar con tu correo (<code>${this.esc(email)}</code>) y tu contraseña.</span>
            </div>
          </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:0.75rem; max-width:380px; margin:0 auto;">
          <button type="button" class="phub-fp-submit blue" onclick="window.ProjectHub.closeJoinPage()">
            <span>←</span>
            <span>Volver a Mis Proyectos</span>
          </button>
          <button type="button" class="phub-top-act-btn" style="justify-content:center; padding:0.75rem; background:rgba(255,255,255,0.08); color:#ffffff; border:1px solid rgba(255,255,255,0.2);" onclick="window.ProjectHub.openLanding('${id}')">
            <span>🌐</span>
            <span>Explorar Landing Page</span>
          </button>
        </div>
      </div>
    `;
  },

  async submitJoin(projectId) {
    const name = (document.getElementById('phub-j-name') || {}).value || '';
    const email = (document.getElementById('phub-j-email') || {}).value || '';
    const pass = (document.getElementById('phub-j-pass') || {}).value || '';
    if (!name.trim() || !email.trim() || pass.length < 4) { this.toast('⚠️ Completa nombre, correo y una contraseña de al menos 4 caracteres.'); return; }
    const hub = this.getHub(projectId);
    const e = this.norm(email);
    if (hub.members.some(m => this.norm(m.email) === e)) { this.toast('ℹ️ Ya eres miembro de este proyecto.'); return; }
    if (hub.joinRequests.some(r => r.status === 'pending' && this.norm(r.email) === e)) { this.toast('⏳ Ya enviaste una solicitud con ese correo.'); return; }
    const newReq = {
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim(), email: email.trim(), passHash: await this.hash(pass),
      status: 'pending', createdAt: Date.now(), role: 'editor'
    };
    hub.joinRequests = (hub.joinRequests || []).filter(r => this.norm(r.email) !== e);
    hub.joinRequests.unshift(newReq);
    this.saveHub(projectId, hub);
    // Guardar sesión local para que cuando el creador acepte (ej. como Comentarista), esta persona vea su rol actualizado al instante
    try {
      const s = JSON.parse(localStorage.getItem('mentix_hub_sessions') || '{}');
      s[projectId] = { name: name.trim(), email: email.trim() };
      localStorage.setItem('mentix_hub_sessions', JSON.stringify(s));
    } catch (errS) {}

    const proj = this.getProject(projectId);
    if (proj) {
      proj.hub = hub;
      proj.joinRequests = hub.joinRequests;
      // 1. Sincronizar en la nube con Supabase y GitHub para que viaje al creador en cualquier red
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        try { window.appRouter.pushChallengeToCloud(proj); } catch(err) {}
      }
    }

    // 2. Enviar notificación directa en tiempo real al creador
    const notifPayload = {
      projectId: projectId,
      projectTitle: proj ? (proj.title || 'Proyecto') : 'Proyecto',
      request: newReq,
      creatorName: proj ? (proj.author || proj.creatorName || proj.teamLead) : '',
      authorEmail: proj ? proj.authorEmail : '',
      authorId: proj ? (proj.authorId || proj.creatorId) : '',
      timestamp: Date.now()
    };

    if (window.realtimeEngine && typeof window.realtimeEngine.publishProjectJoinRequest === 'function') {
      try { window.realtimeEngine.publishProjectJoinRequest(notifPayload); } catch(err) {}
    } else {
      if (window.BroadcastChannel) {
        try {
          const bc = new BroadcastChannel('te_reto_realtime');
          bc.postMessage({ type: 'PROJECT_JOIN_REQUEST', ...notifPayload });
        } catch(e) {}
      }
      try {
        localStorage.setItem('mentix_realtime_join_request_event', JSON.stringify({ ...notifPayload, t: Date.now() }));
      } catch(err) {}
    }

    this.recordCreatorNotification(notifPayload);

    if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
      window.soundEngine.playPop();
    }
    this.showNotificationBanner({
      icon: '📨',
      title: '¡Solicitud enviada al creador!',
      message: `Se envió tu solicitud directamente a ${proj ? (proj.author || 'el creador') : 'el creador'} para autorizar tu participación.`
    });
    this.toast('📨 ¡Solicitud enviada de una vez al creador!');
    this.renderJoinSuccessPage(projectId, name.trim(), email.trim());
    if (document.getElementById('phub-overlay')) this.render();
  },

  /* ------------------------------ banners y notificaciones ------------------------------ */
  showNotificationBanner({ icon = '🔔', title, message }) {
    const overlay = document.getElementById('phub-overlay');
    if (!overlay) return;
    const old = overlay.querySelector('.phub-banner-notif');
    if (old) old.remove();

    const banner = document.createElement('div');
    banner.className = 'phub-banner-notif';
    banner.innerHTML = `
      <div class="phub-banner-notif-in">
        <span class="pbn-icon">${icon}</span>
        <div class="pbn-text">
          <strong>${this.esc(title)}</strong>
          <span>${this.esc(message)}</span>
        </div>
        <button type="button" class="pbn-close" onclick="this.closest('.phub-banner-notif').remove()">✕</button>
      </div>`;
    overlay.appendChild(banner);
    setTimeout(() => { if (banner.parentNode) banner.classList.add('phub-banner-fadeout'); }, 4200);
    setTimeout(() => { if (banner.parentNode) banner.remove(); }, 4700);
  },

  recordCreatorNotification(data) {
    try {
      const all = JSON.parse(localStorage.getItem('mentix_creator_notifications') || '[]');
      const notif = {
        id: 'notif_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: 'join_request',
        projectId: data.projectId,
        projectTitle: data.projectTitle,
        request: data.request,
        creatorName: data.creatorName,
        authorEmail: data.authorEmail,
        authorId: data.authorId,
        read: false,
        createdAt: Date.now()
      };
      all.unshift(notif);
      localStorage.setItem('mentix_creator_notifications', JSON.stringify(all.slice(0, 40)));
    } catch(e) {}
  },

  handleIncomingJoinRequest(data) {
    if (!data || !data.projectId || !data.request) return;
    const u = window.appState?.currentUser;
    if (!u) return;

    const proj = this.getProject(data.projectId);
    const clean = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const myName = clean(u.name);
    const myUsername = clean(u.username);
    const myEmail = clean(u.email);
    const myId = String(u.id || '').trim();

    const isMelisa = myName === 'melisa' || myUsername === 'melisa' || myEmail === 'meli030814abc@gmail.com';
    const isOwner = isMelisa ||
      (proj && window.appRouter && window.appRouter.isChallengeOwner(proj)) ||
      (data.authorEmail && clean(data.authorEmail) === myEmail) ||
      (data.creatorName && (clean(data.creatorName) === myName || clean(data.creatorName) === myUsername)) ||
      (data.authorId && myId && String(data.authorId) === myId);

    // Solo notificar si este usuario es el creador o administrador
    if (!isOwner) return;

    // Actualizar estado local del proyecto con la nueva solicitud
    if (proj) {
      const hub = this.getHub(data.projectId);
      if (!hub.joinRequests.some(r => r.id === data.request.id || this.norm(r.email) === this.norm(data.request.email))) {
        hub.joinRequests.unshift(data.request);
        this.saveHub(data.projectId, hub);
      }
    }

    // Registrar en el historial de notificaciones
    this.recordCreatorNotification(data);

    // Alerta sonora
    if (window.soundEngine && typeof window.soundEngine.playCorrect === 'function') {
      window.soundEngine.playCorrect();
    } else if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
      window.soundEngine.playPop();
    }

    // Mostrar el popup flotante interactivo de inmediato
    this.showCreatorJoinNotificationPopup(data);

    // Actualizar campana en la vista de proyectos si está visible
    if (window.ProjectsView && typeof window.ProjectsView.updateNotificationBellBadge === 'function') {
      window.ProjectsView.updateNotificationBellBadge();
    }

    // Si el creador tiene abierto el ProjectHub de este proyecto, refrescar en tiempo real
    if (this.currentId === data.projectId && document.getElementById('phub-overlay')) {
      this.render();
    }
  },

  showCreatorJoinNotificationPopup(data) {
    const existing = document.getElementById('mentix-creator-notif-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'mentix-creator-notif-toast';
    toast.style.cssText = 'position:fixed; top:24px; right:24px; z-index:9999999; max-width:420px; width:calc(100vw - 48px); background:linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(30,27,75,0.98) 100%); border:2px solid #00f5d4; border-radius:20px; padding:1.25rem 1.35rem; box-shadow:0 12px 40px rgba(0,245,212,0.35), 0 0 25px rgba(247,37,133,0.25); color:#ffffff; font-family:"Outfit","Poppins",sans-serif; animation:phubSlideDown 0.3s cubic-bezier(0.16,1,0.3,1) forwards; display:flex; flex-direction:column; gap:0.75rem; backdrop-filter:blur(16px);';

    const reqName = this.esc(data.request?.name || 'Un estudiante');
    const reqEmail = this.esc(data.request?.email || '');
    const projTitle = this.esc(data.projectTitle || 'tu proyecto');
    const projId = this.esc(data.projectId);

    toast.innerHTML = `
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 0.65rem;">
          <div style="width: 40px; height: 40px; border-radius: 12px; background: rgba(0, 245, 212, 0.18); border: 1.5px solid #00f5d4; display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
            📨
          </div>
          <div>
            <div style="font-size: 0.75rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; letter-spacing: 0.05em;">Nueva Solicitud de Unión</div>
            <h4 style="margin: 0; font-size: 1rem; font-weight: 900; color: #ffffff;">${reqName} quiere unirse</h4>
          </div>
        </div>
        <button type="button" onclick="this.closest('#mentix-creator-notif-toast').remove()" style="background: none; border: none; color: #94a3b8; font-size: 1.25rem; cursor: pointer; padding: 0.2rem; line-height: 1;">✕</button>
      </div>

      <p style="margin: 0; font-size: 0.88rem; color: #cbd5e1; line-height: 1.45;">
        <strong>${reqName}</strong> (${reqEmail}) envió una solicitud para unirse a tu proyecto <strong>“${projTitle}”</strong>.
      </p>

      <div style="display: flex; align-items: center; gap: 0.6rem; margin-top: 0.25rem;">
        <button type="button" onclick="window.ProjectHub.open('${projId}', 'users'); this.closest('#mentix-creator-notif-toast').remove();" style="flex: 1; background: linear-gradient(135deg, #00f5d4 0%, #00b4d8 100%); color: #071739; font-weight: 900; font-size: 0.88rem; padding: 0.6rem 1rem; border-radius: 12px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.4rem; box-shadow: 0 4px 14px rgba(0, 245, 212, 0.4); transition: transform 0.15s ease;">
          <span>👥</span>
          <span>Revisar y Unir Ahora</span>
        </button>
        <button type="button" onclick="this.closest('#mentix-creator-notif-toast').remove()" style="background: rgba(255, 255, 255, 0.08); color: #cbd5e1; font-weight: 700; font-size: 0.85rem; padding: 0.6rem 0.9rem; border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.15); cursor: pointer;">
          Descartar
        </button>
      </div>
    `;

    document.body.appendChild(toast);
    setTimeout(() => {
      if (toast.parentNode) {
        toast.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-20px)';
        setTimeout(() => toast.remove(), 400);
      }
    }, 14000);
  },

  /* ------------------------------ meter persona (creador / admin) ------------------------------ */
  openAddPersonModal(projectId) {
    const proj = this.getProject(projectId);
    if (!proj) return;
    this.currentId = projectId;
    this.modal(`
      <div class="phub-modal-cartoon">
        <button type="button" class="phub-x" onclick="window.ProjectHub.closeModal()">✕</button>
        <div class="phub-pill-header-wrap" style="margin-bottom:0.6rem;">
          <span class="phub-sparkle">✨</span>
          <h2 class="phub-pill-title yellow"><span class="ico">👥➕</span> Meter persona al proyecto</h2>
          <span class="phub-sparkle">✨</span>
        </div>
        <p class="phub-desc" style="margin-bottom:1rem;font-size:0.92rem;">
          Pide todos los datos: usuario o nombre, correo, contraseña y selecciona el rol para habilitar a la persona en <b>“${this.esc(proj.title || 'Proyecto')}”</b>. Se enviará una notificación para aceptarla y completar el paso.
        </p>
        <form onsubmit="event.preventDefault(); window.ProjectHub.submitAddPerson('${this.esc(projectId)}', false);" class="phub-form phub-form-cartoon">
          <label>
            <span>👤 Nombre o usuario:</span>
            <input id="phub-add-name" type="text" required maxlength="60" placeholder="Ej: Carlos Ruiz o @carlos" autocomplete="username">
          </label>
          <label>
            <span>✉️ Correo electrónico:</span>
            <input id="phub-add-email" type="email" required maxlength="90" placeholder="carlos.ruiz@mentix.edu" autocomplete="email">
          </label>
          <label>
            <span>🔑 Contraseña (clave de acceso):</span>
            <input id="phub-add-pass" type="password" required minlength="4" maxlength="60" placeholder="Mínimo 4 caracteres" autocomplete="new-password">
          </label>
          <label>
            <span>🛡️ Rol a asignar / habilitar:</span>
            <select id="phub-add-role" class="phub-select-role">
              <option value="editor" selected>✏️ Editor (Puede editar el contenido)</option>
              <option value="collaborator">🤝 Colaborador (Aporta recursos y archivos)</option>
              <option value="commenter">💬 Comentarista (Puede comentar y calificar)</option>
              <option value="viewer">👁️ Solo lectura (Solo puede ver el proyecto)</option>
            </select>
          </label>
          <div class="phub-modal-actions-row" style="display:flex; gap:0.7rem; margin-top:0.8rem; flex-wrap:wrap;">
            <button type="button" class="phub-glossy-btn green" style="flex:1; min-width:170px;" onclick="window.ProjectHub.submitAddPerson('${this.esc(projectId)}', true)">
              <span class="b-ico">✔</span> Unir y habilitar rol ya
            </button>
            <button type="submit" class="phub-glossy-btn blue" style="flex:1; min-width:170px;">
              <span class="b-ico">📨</span> Enviar y notificar
            </button>
          </div>
        </form>
      </div>`);
    setTimeout(() => { const i = document.getElementById('phub-add-name'); if (i) i.focus(); }, 60);
  },

  async submitAddPerson(projectId, autoAccept = false) {
    const name = (document.getElementById('phub-add-name') || {}).value || '';
    const email = (document.getElementById('phub-add-email') || {}).value || '';
    const pass = (document.getElementById('phub-add-pass') || {}).value || '';
    const role = (document.getElementById('phub-add-role') || {}).value || 'editor';
    if (!name.trim() || !email.trim() || pass.length < 4) {
      this.toast('⚠️ Completa nombre o usuario, correo y una contraseña de al menos 4 caracteres.');
      return;
    }
    const hub = this.getHub(projectId);
    const e = this.norm(email);
    if (hub.members.some(m => this.norm(m.email) === e)) {
      this.toast('ℹ️ Esta persona ya es miembro del proyecto.');
      return;
    }
    const passHash = await this.hash(pass);
    const roleInfo = this.ROLES[role] || this.ROLES.editor;
    const proj = this.getProject(projectId);
    const projTitle = proj ? proj.title : 'Proyecto';

    if (autoAccept) {
      hub.joinRequests = hub.joinRequests.filter(r => this.norm(r.email) !== e);
      hub.members = hub.members.filter(m => this.norm(m.email) !== e);
      hub.members.push({
        name: name.trim(),
        email: email.trim(),
        passHash,
        role,
        since: Date.now()
      });
      this.saveHub(projectId, hub);
      this.closeModal();

      if (window.soundEngine && typeof window.soundEngine.playCorrect === 'function') {
        window.soundEngine.playCorrect();
      }

      this.showNotificationBanner({
        icon: '🔔',
        title: '¡Persona unida con éxito!',
        message: `${name.trim()} ha sido habilitado/a con el rol de ${roleInfo.label} en “${projTitle}”.`
      });
      this.toast(`✅ ¡${name.trim()} fue unido/a exitosamente como ${roleInfo.label}!`);
    } else {
      const newReq = {
        id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: name.trim(),
        email: email.trim(),
        passHash,
        role,
        status: 'pending',
        createdAt: Date.now()
      };
      hub.joinRequests = hub.joinRequests.filter(r => this.norm(r.email) !== e);
      hub.joinRequests.unshift(newReq);
      this.saveHub(projectId, hub);
      this.closeModal();

      if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
        window.soundEngine.playPop();
      }

      this.showNotificationBanner({
        icon: '🔔',
        title: '¡Notificación enviada!',
        message: `Se envió la notificación a ${name.trim()} para aceptar su unión como ${roleInfo.label}. Ya puedes darle clic a "✔ Unir a la persona".`
      });
      this.toast(`🔔 Solicitud registrada para ${name.trim()}. Haz clic en "✔ Unir a la persona" para aceptarla.`);
    }

    if (document.getElementById('phub-overlay')) this.render();
  },

  acceptRequest(projectId, reqId) {
    if (!this.canManage(this.getProject(projectId))) { this.toast('🔒 Solo el creador puede aceptar solicitudes.'); return; }
    const hub = this.getHub(projectId);
    const req = hub.joinRequests.find(r => r.id === reqId);
    if (!req) return;
    const sel = document.getElementById('phub-role-' + reqId);
    const role = (sel && sel.value) || req.role || 'editor';
    hub.members = hub.members.filter(m => this.norm(m.email) !== this.norm(req.email));
    hub.members.push({
      name: req.name,
      email: req.email,
      passHash: req.passHash,
      role: role,
      since: Date.now()
    });
    req.status = 'accepted';
    req.role = role;
    this.saveHub(projectId, hub);

    const proj = this.getProject(projectId);
    if (proj) {
      proj.hub = hub;
      proj.joinRequests = hub.joinRequests;
      proj.members = hub.members;
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        try { window.appRouter.pushChallengeToCloud(proj); } catch(err) {}
      }
    }

    if (window.soundEngine && typeof window.soundEngine.playCorrect === 'function') {
      window.soundEngine.playCorrect();
    }

    const projTitle = proj ? proj.title : 'Proyecto';
    this.showNotificationBanner({
      icon: '🎉',
      title: '¡Persona aceptada!',
      message: `${req.name} ha sido unido/a exitosamente a “${projTitle}” con el rol de ${this.ROLES[role].label}.`
    });

    this.toast(`✅ ${req.name} se unió como ${this.ROLES[role].label}.`);
    this.render();
  },
  rejectRequest(projectId, reqId) {
    if (!this.canManage(this.getProject(projectId))) return;
    const hub = this.getHub(projectId);
    const req = hub.joinRequests.find(r => r.id === reqId);
    if (!req) return;
    req.status = 'rejected';
    this.saveHub(projectId, hub);

    const proj = this.getProject(projectId);
    if (proj) {
      proj.hub = hub;
      proj.joinRequests = hub.joinRequests;
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        try { window.appRouter.pushChallengeToCloud(proj); } catch(err) {}
      }
    }

    if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
      window.soundEngine.playPop();
    }

    this.showNotificationBanner({
      icon: 'ℹ️',
      title: 'Solicitud rechazada',
      message: `La solicitud de unión de ${req.name} fue rechazada.`
    });

    this.toast('Solicitud rechazada.');
    this.render();
  },
  changeRole(projectId, email, role) {
    if (!this.canManage(this.getProject(projectId))) return;
    const hub = this.getHub(projectId);
    const m = hub.members.find(x => this.norm(x.email) === this.norm(email));
    if (!m) return;
    m.role = role;
    this.saveHub(projectId, hub);
    const proj = this.getProject(projectId);
    if (proj) {
      proj.hub = hub;
      proj.members = hub.members;
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        try { window.appRouter.pushChallengeToCloud(proj); } catch (err) {}
      }
    }
    this.toast(`Rol actualizado: ${this.ROLES[role].label}.`);
    this.render();
  },
  removeMember(projectId, email) {
    if (!this.canManage(this.getProject(projectId))) return;
    if (!confirm('¿Quitar a esta persona del proyecto?')) return;
    const hub = this.getHub(projectId);
    hub.members = hub.members.filter(x => this.norm(x.email) !== this.norm(email));
    this.saveHub(projectId, hub);
    const proj = this.getProject(projectId);
    if (proj) {
      proj.hub = hub;
      proj.members = hub.members;
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        try { window.appRouter.pushChallengeToCloud(proj); } catch (err) {}
      }
    }
    this.render();
  },

  /* ------------------------------ ingreso de miembros ------------------------------ */
  openMemberLogin(projectId) {
    this.openJoinForm(projectId, 'login');
  },
  async memberLogin(projectId) {
    const email = (document.getElementById('phub-l-email') || {}).value || '';
    const pass = (document.getElementById('phub-l-pass') || {}).value || '';
    const hub = this.getHub(projectId);
    const m = hub.members.find(x => this.norm(x.email) === this.norm(email));
    if (!m || m.passHash !== await this.hash(pass)) { this.toast('❌ Correo o contraseña incorrectos, o aún no te han aceptado.'); return; }
    let s = {};
    try { s = JSON.parse(localStorage.getItem('mentix_hub_sessions') || '{}'); } catch (e) {}
    s[projectId] = { email: m.email, name: m.name };
    localStorage.setItem('mentix_hub_sessions', JSON.stringify(s));
    this.closeJoinPage();
    this.closeModal();
    this.toast(`✅ Bienvenido/a, ${m.name}. Tu rol: ${this.ROLES[m.role].label}.`);
    this.open(projectId, 'home');
  }
};
