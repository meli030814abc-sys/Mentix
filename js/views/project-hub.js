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
    const list = (window.appState && window.appState.challenges) || [];
    let p = list.find(x => x && String(x.id) === String(id));
    if (!p && window.ProjectsView && Array.isArray(window.ProjectsView.demoShowcaseProjects)) {
      p = window.ProjectsView.demoShowcaseProjects.find(x => x && String(x.id) === String(id));
    }
    return p || null;
  },
  isStored(id) {
    const list = (window.appState && window.appState.challenges) || [];
    return list.some(x => x && String(x.id) === String(id));
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
    // Si no tiene miembros, agregar el autor/líder y equipo realista
    if (p && hub.members.length === 0) {
      const leaderName = p.author || 'Ana Gómez';
      hub.members = [
        { name: leaderName, email: (leaderName.toLowerCase().replace(/\s+/g, '.') + '@mentix.edu'), role: 'owner', leader: true },
        { name: 'Elena Morales', email: 'elena.morales@mentix.edu', role: 'collaborator' },
        { name: 'David Soto', email: 'david.soto@mentix.edu', role: 'viewer' }
      ];
    }
    // Si no tiene solicitudes, inicializar con solicitud pendiente realista
    if (hub.joinRequests.length === 0) {
      hub.joinRequests = [
        { id: 'req_demo_1', name: 'Carlos Ruiz', email: 'carlos.ruiz@mentix.edu', passHash: 'demo', status: 'pending', created: Date.now() - 3600000 }
      ];
    }
    return hub;
  },
  saveHub(id, hub) {
    const p = this.getProject(id);
    if (p && this.isStored(id)) {
      p.hub = hub;
      if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    } else {
      let all = {};
      try { all = JSON.parse(localStorage.getItem('mentix_project_hub_v1') || '{}'); } catch (e) {}
      const clean = { ...hub };
      delete clean.__external;
      all[id] = clean;
      try { localStorage.setItem('mentix_project_hub_v1', JSON.stringify(all)); } catch (e) {}
    }
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
      || (window.ProjectsView && typeof window.ProjectsView.isTeacherOrAdmin === 'function' && window.ProjectsView.isTeacherOrAdmin());
    if (isOwner) return 'owner';
    const hub = this.getHub(proj.id);
    const m = this.getMember(proj, hub);
    if (m) return m.role || 'viewer';
    return 'guest';
  },
  canView(proj) {
    if (!proj) return false;
    const r = this.getRole(proj);
    return r === 'owner' || r === 'editor' || r === 'collaborator' || r === 'commenter' || r === 'viewer';
  },
  canEdit(proj) {
    if (!proj) return false;
    const r = this.getRole(proj);
    return r === 'owner' || r === 'editor';
  },
  canManage(proj) { return this.getRole(proj) === 'owner'; },

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
  open(projectId, tab = 'home') {
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
    this.render();
  },
  close() {
    const el = document.getElementById('phub-overlay');
    if (el) el.remove();
    document.body.style.overflow = '';
    if (window.ProjectsView && typeof window.ProjectsView.render === 'function' && window.appRouter && window.appRouter.currentView === 'projects') {
      try { window.ProjectsView.render(); } catch (e) {}
    }
  },
  setTab(tab) { this.tab = tab; this.render(); },

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
    const role = this.getRole(proj);
    const roleInfo = this.ROLES[role] || this.ROLES.guest;
    const manage = role === 'owner';
    const edit = this.canEdit(proj);

    let overlay = document.getElementById('phub-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'phub-overlay';
      document.body.appendChild(overlay);
    }
    document.body.style.overflow = 'hidden';

    const pending = hub.joinRequests.filter(r => r.status === 'pending').length;

    const nav = [
      { id: 'home', icon: '🏠', label: 'Inicio' },
      { id: 'users', icon: '👥', label: 'Usuarios', badge: manage ? pending : 0 },
      ...(edit ? [{ id: 'settings', icon: '⚙️', label: 'Configuración' }] : []),
      { id: 'reports', icon: '📊', label: 'Reportes' }
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
          <div class="phub-cap">🎓</div>
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
          <button type="button" class="phub-nav phub-nav-close" onclick="window.ProjectHub.close()"><span class="phub-nav-ico">✕</span><span>Cerrar</span></button>
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

  actionBar(proj, edit) {
    const id = this.esc(proj.id);
    return `
      <div class="phub-top-actions">
        ${edit ? `<button type="button" class="phub-top-act-btn" onclick="window.ProjectHub.editProject('${id}')"><span class="act-ico">✏️</span> <span>Editar proyecto</span></button>` : ''}
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
          ${this.actionBar(proj, edit)}
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
                <h4 class="phub-detail-heading">Resultados del Proyecto</h4>
                <div class="phub-gauges-row">
                  ${this.gauge(progress, 'Metas alcanzadas', '#22c55e')}
                  ${this.gauge(ratingPct, 'Casos de éxito', '#0ea5e9')}
                </div>
                <h4 class="phub-detail-heading" style="margin-top:1.1rem;">
                  <span class="f-ico">📁</span> Archivos de entregas
                </h4>
                <ul class="phub-files-list">
                  ${slides.length ? `<li onclick="window.ProjectsView ? window.ProjectsView.openSelectedProject() : null" style="cursor:pointer;" title="Clic para ver presentación en pantalla"><span class="file-ico">📊</span> <b>Presentación (${slides.length} láminas)</b> <span style="font-size:0.75rem; color:#0ea5e9; font-weight:800; margin-left:auto;">Ver ↗</span></li>` : ''}
                  ${resources.slice(0, 5).map(r => `<li onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('${this.esc(r.name || r.title)}', '${proj.id}') : null" style="cursor:pointer;" title="Clic para ver documento en la página"><span class="file-ico">📄</span> <b>${this.esc(r.name || r.title || 'Archivo')}</b> <span style="font-size:0.75rem; color:#0ea5e9; font-weight:800; margin-left:auto;">Ver ↗</span></li>`).join('')}
                  ${(!slides.length && !resources.length) ? `
                    <li onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Proyectos.pdf', '${proj.id}') : null" style="cursor:pointer;" title="Clic para ver documento en la página"><span class="file-ico">📄</span> <b>Proyectos.pdf</b> <span style="font-size:0.75rem; color:#0ea5e9; font-weight:800; margin-left:auto;">Ver ↗</span></li>
                    <li onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Archivo a', '${proj.id}') : null" style="cursor:pointer;" title="Clic para ver documento en la página"><span class="file-ico">📄</span> <b>Archivo a</b> <span style="font-size:0.75rem; color:#0ea5e9; font-weight:800; margin-left:auto;">Ver ↗</span></li>
                    <li onclick="window.ProjectsView ? window.ProjectsView.openResourceViewerByName('Entrega b', '${proj.id}') : null" style="cursor:pointer;" title="Clic para ver documento en la página"><span class="file-ico">📄</span> <b>Entrega b</b> <span style="font-size:0.75rem; color:#0ea5e9; font-weight:800; margin-left:auto;">Ver ↗</span></li>
                  ` : ''}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>`;
  },

  gauge(pct, label, color) {
    return `
      <div class="phub-gauge-item">
        <div class="phub-donut-ring" data-pct="${pct}" data-color="${color}" style="background:conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 0deg);">
          <div class="phub-donut-center">${pct}%</div>
        </div>
        <span class="phub-gauge-caption">${this.esc(label)}</span>
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
      return `
        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">🎟️</span> Mi participación</h2>
          </div>
          <div class="phub-empty ok">${roleInfo.icon} Participas como <b>${roleInfo.label}</b>.<br><small>${roleInfo.desc}</small></div>
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
    return `
      <div class="phub-card phub-card-cartoon">
        <div class="phub-pill-header-wrap">
          <h2 class="phub-pill-title yellow"><span class="ico">⚙️</span> Configuración</h2>
        </div>
        <div class="phub-settings">
          <button type="button" class="phub-btn blue" onclick="window.ProjectHub.editProject('${id}')">✏️ Editar contenido del proyecto</button>
          <button type="button" class="phub-btn green" onclick="window.ProjectsView && window.ProjectsView.openHeroBannerPicker ? window.ProjectsView.openHeroBannerPicker('${id}') : null">🎨 Cambiar fondo del banner (Hero)</button>
          <button type="button" class="phub-btn ghost" onclick="window.ProjectHub.openLanding('${id}')">🌐 Ver página pública</button>
          <button type="button" class="phub-btn ghost" onclick="window.ProjectHub.share('${id}')">🔗 Copiar enlace para compartir</button>
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

    return `
      <div class="phub-kpis">
        <div class="phub-kpi"><span>👁️</span><b data-count="${views.length}">0</b><small>Visitas totales</small></div>
        <div class="phub-kpi"><span>🧑‍🤝‍🧑</span><b data-count="${uniq}">0</b><small>Personas que lo vieron</small></div>
        <div class="phub-kpi"><span>⭐</span><b data-count="${stats.avg.toFixed(1)}" data-dec="1">0</b><small>Calificación promedio</small></div>
        <div class="phub-kpi"><span>🗳️</span><b data-count="${stats.total}">0</b><small>Calificaciones</small></div>
      </div>

      <div class="phub-report-grid">
        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">📈</span> Personas que han visto el proyecto</h2>
          </div>
          <div class="phub-bars">
            ${days.map(d => `
              <div class="phub-bar-col" style="--i:${days.indexOf(d)}">
                <span class="phub-bar-n">${d.n}</span>
                <div class="phub-bar" style="height:${Math.max(4, Math.round((d.n / max) * 130))}px;"></div>
                <small>${this.esc(d.label)}</small>
              </div>`).join('')}
          </div>
          <h4 class="phub-sub" style="margin-top:1rem;">Últimas visitas</h4>
          <ul class="phub-recent">
            ${recent.length ? recent.map(v => `<li>${this.avatar(v.name, 28)} <span>${this.esc(v.name || 'Visitante')}</span><small>${new Date(v.t).toLocaleString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></li>`).join('') : '<li class="empty">Todavía nadie ha visto este proyecto.</li>'}
          </ul>
        </div>

        <div class="phub-card phub-card-cartoon">
          <div class="phub-pill-header-wrap">
            <h2 class="phub-pill-title yellow"><span class="ico">⭐</span> Calificación del proyecto</h2>
          </div>
          <div class="phub-rating-top">
            ${this.gauge(Math.round((stats.avg / 5) * 100), stats.total ? `${stats.avg.toFixed(1)} de 5` : 'Sin calificar', '#f59e0b')}
            <div class="phub-dist">
              ${[5, 4, 3, 2, 1].map(s => `
                <div class="phub-dist-row"><span>${s}★</span>
                  <div class="phub-dist-bar"><i style="width:${stats.total ? Math.round(stats.dist[s - 1] / stats.total * 100) : 0}%"></i></div>
                  <em>${stats.dist[s - 1]}</em></div>`).join('')}
            </div>
          </div>
          <div class="phub-rate">
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

  /* ------------------------------ acciones ------------------------------ */
  editProject(projectId) {
    const proj = this.getProject(projectId);
    if (!this.canEdit(proj)) { this.toast('🔒 Tu rol no permite editar este proyecto.'); return; }
    this.close();
    if (window.ProjectsView && typeof window.ProjectsView.openEditProject === 'function') window.ProjectsView.openEditProject(projectId);
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

  openRestrictedModal(proj) {
    if (!proj) return;
    const id = this.esc(proj.id);
    const title = this.esc(proj.title || 'Proyecto');
    const author = this.esc(proj.author || 'el creador');
    this.currentId = proj.id;
    this.modal(`
      <div class="phub-modal-cartoon phub-restricted-card" style="text-align:center; padding:1.7rem 1.3rem;">
        <button type="button" class="phub-x" onclick="window.ProjectHub.closeModal()">✕</button>
        <div style="font-size:3.4rem; line-height:1; margin-bottom:0.7rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.15));">🔒</div>
        <div class="phub-pill-header-wrap" style="justify-content:center; margin-bottom:0.6rem;">
          <h2 class="phub-pill-title yellow"><span class="ico">🛡️</span> Espacio Exclusivo</h2>
        </div>
        <h3 style="font-size:1.15rem; font-weight:800; color:#0f172a; margin:0 0 0.25rem;">“${title}”</h3>
        <p style="font-size:0.82rem; color:#64748b; margin:0 0 0.85rem;">Creado por <b>${author}</b></p>
        <p class="phub-desc" style="font-size:0.92rem; color:#334155; max-width:440px; margin:0 auto 1.35rem; line-height:1.5;">
          Este panel de edición, entregas, archivos y reportes internos solo es visible para los <b>creadores del proyecto</b> y los <b>miembros que se hayan unido</b>.
        </p>
        <div style="display:flex; flex-direction:column; gap:0.65rem; max-width:360px; margin:0 auto;">
          <button type="button" class="phub-glossy-btn green" style="width:100%; justify-content:center; padding:0.75rem 1rem;" onclick="window.ProjectHub.openJoinForm('${id}')">
            <span class="b-ico">📨</span> Solicitar unirme al proyecto
          </button>
          <button type="button" class="phub-glossy-btn blue" style="width:100%; justify-content:center; padding:0.75rem 1rem;" onclick="window.ProjectHub.openLanding('${id}')">
            <span class="b-ico">🌐</span> Ver Landing Page pública
          </button>
          <button type="button" class="phub-top-act-btn" style="width:100%; justify-content:center; background:#f8fafc; border:1.5px solid #cbd5e1; font-weight:700; padding:0.7rem 1rem;" onclick="window.ProjectHub.openMemberLogin('${id}')">
            <span>🔑</span> <span>Ya soy miembro (Ingresar con clave)</span>
          </button>
        </div>
      </div>
    `);
  },

  openJoinForm(projectId) {
    const proj = this.getProject(projectId);
    if (!proj) return;
    const me = this.me();
    this.currentId = projectId;
    this.modal(`
      <button type="button" class="phub-x" onclick="window.ProjectHub.closeModal()">✕</button>
      <h2 class="phub-pill-title">👥➕ Unirme a “${this.esc(proj.title || 'Proyecto')}”</h2>
      <p class="phub-desc">Completa tus datos. El creador revisará tu solicitud y te asignará un rol.</p>
      <form onsubmit="event.preventDefault(); window.ProjectHub.submitJoin('${this.esc(projectId)}');" class="phub-form">
        <label>Nombre o usuario
          <input id="phub-j-name" type="text" required maxlength="60" placeholder="Ej: JuanP" value="${this.esc(me.name)}" autocomplete="username">
        </label>
        <label>Correo
          <input id="phub-j-email" type="email" required maxlength="90" placeholder="juan.p@email.com" value="${this.esc(me.email)}" autocomplete="email">
        </label>
        <label>Contraseña
          <input id="phub-j-pass" type="password" required minlength="4" maxlength="60" placeholder="Mínimo 4 caracteres" autocomplete="new-password">
        </label>
        <small class="phub-hint">🔒 Tu contraseña se guarda cifrada y el creador nunca la ve.</small>
        <button type="submit" class="phub-btn blue wide">📨 Enviar solicitud</button>
      </form>`);
    setTimeout(() => { const i = document.getElementById(me.name ? 'phub-j-pass' : 'phub-j-name'); if (i) i.focus(); }, 50);
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
    hub.joinRequests.push({
      id: 'req_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      name: name.trim(), email: email.trim(), passHash: await this.hash(pass),
      status: 'pending', createdAt: Date.now()
    });
    this.saveHub(projectId, hub);
    this.closeModal();
    if (window.soundEngine && typeof window.soundEngine.playPop === 'function') {
      window.soundEngine.playPop();
    }
    this.showNotificationBanner({
      icon: '📨',
      title: '¡Solicitud enviada!',
      message: `Se envió una notificación al creador para aceptarte con tu rol en el proyecto.`
    });
    this.toast('📨 ¡Solicitud enviada! El creador la revisará pronto.');
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

    if (window.soundEngine && typeof window.soundEngine.playCorrect === 'function') {
      window.soundEngine.playCorrect();
    }

    const proj = this.getProject(projectId);
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
    this.toast(`Rol actualizado: ${this.ROLES[role].label}.`);
    this.render();
  },
  removeMember(projectId, email) {
    if (!this.canManage(this.getProject(projectId))) return;
    if (!confirm('¿Quitar a esta persona del proyecto?')) return;
    const hub = this.getHub(projectId);
    hub.members = hub.members.filter(x => this.norm(x.email) !== this.norm(email));
    this.saveHub(projectId, hub);
    this.render();
  },

  /* ------------------------------ ingreso de miembros ------------------------------ */
  openMemberLogin(projectId) {
    this.currentId = projectId;
    this.modal(`
      <button type="button" class="phub-x" onclick="window.ProjectHub.closeModal()">✕</button>
      <h2 class="phub-pill-title">🔑 Ingresar como miembro</h2>
      <p class="phub-desc">Usa el correo y la contraseña con los que te aceptaron en el proyecto.</p>
      <form onsubmit="event.preventDefault(); window.ProjectHub.memberLogin('${this.esc(projectId)}');" class="phub-form">
        <label>Correo<input id="phub-l-email" type="email" required placeholder="tu@correo.com" autocomplete="email"></label>
        <label>Contraseña<input id="phub-l-pass" type="password" required autocomplete="current-password"></label>
        <button type="submit" class="phub-btn blue wide">Entrar</button>
      </form>`);
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
    this.closeModal();
    this.toast(`✅ Bienvenido/a, ${m.name}. Tu rol: ${this.ROLES[m.role].label}.`);
    this.render();
  }
};
