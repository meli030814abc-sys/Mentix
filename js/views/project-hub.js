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
    const keys = [me.email, me.username, me.name].map(k => this.norm(k)).filter(Boolean);
    if (me.session && me.session.email) keys.push(this.norm(me.session.email));
    return (hub.members || []).find(m => keys.includes(this.norm(m.email)) || keys.includes(this.norm(m.name))) || null;
  },
  getRole(proj) {
    if (!proj) return 'guest';
    const hub = this.getHub(proj.id);
    const isOwner = (window.appRouter && typeof window.appRouter.isChallengeOwner === 'function' && window.appRouter.isChallengeOwner(proj))
      || (window.ProjectsView && window.ProjectsView.isTeacherOrAdmin && window.ProjectsView.isTeacherOrAdmin());
    if (isOwner) return 'owner';
    const m = this.getMember(proj, hub);
    if (m) return m.role || 'viewer';
    return 'guest';
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
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    this.currentId = projectId;
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

    overlay.innerHTML = `
      <div class="phub-shell">
        <aside class="phub-sidebar">
          <div class="phub-cap">🎓</div>
          ${nav.map(n => `
            <button type="button" class="phub-nav ${this.tab === n.id || (n.id === 'home' && !['users', 'settings', 'reports'].includes(this.tab)) ? 'active' : ''}" onclick="window.ProjectHub.setTab('${n.id}')">
              <span class="phub-nav-ico">${n.icon}</span>
              <span>${n.label}</span>
              ${n.badge ? `<em class="phub-badge">${n.badge}</em>` : ''}
            </button>`).join('')}
          <button type="button" class="phub-nav phub-nav-close" onclick="window.ProjectHub.close()"><span class="phub-nav-ico">✕</span><span>Cerrar</span></button>
        </aside>

        <main class="phub-main">
          <header class="phub-head">
            <div class="phub-titles">
              <span class="phub-kicker">${manage ? 'Panel del Creador' : (edit ? 'Panel del Editor' : 'Vista de Estudiante')}</span>
              <h1 class="phub-title">${this.esc(proj.title || 'Proyecto')}</h1>
            </div>
            <div class="phub-head-right">
              <span class="phub-role-pill">${roleInfo.icon} ${roleInfo.label}</span>
            </div>
          </header>
          <div class="phub-scroll">${content}</div>
        </main>
      </div>`;
  },

  actionBar(proj, edit) {
    const id = this.esc(proj.id);
    return `
      <div class="phub-actions">
        ${edit ? `<button type="button" class="phub-act" onclick="window.ProjectHub.editProject('${id}')"><span>✏️</span> Editar proyecto</button>` : ''}
        <button type="button" class="phub-act" onclick="window.ProjectHub.share('${id}')"><span>🔗</span> Compartir</button>
        <button type="button" class="phub-act" onclick="window.ProjectHub.openLanding('${id}')"><span>👁️</span> Ver detalles</button>
      </div>`;
  },

  renderHome(proj, hub, role, manage, edit) {
    const people = this.peopleOf(proj, hub);
    const progress = this.progressOf(proj);
    const stats = this.ratingStats(hub);
    const ratingPct = Math.round((stats.avg / 5) * 100);
    const resources = ((Array.isArray(proj.resources) && proj.resources.length ? proj.resources : (proj.govdata && proj.govdata.resources)) || []).filter(r => r && r.visibility !== 'private');
    const slides = (Array.isArray(proj.slides) ? proj.slides : []).filter(s => s && s.id !== 's1');
    const isApproved = proj.approvalStatus === 'approved' && !proj.rejectionReason;
    const isDraft = proj.status === 'in_progress' || proj.publicationStatus === 'draft';
    const statusLabel = isApproved ? 'Completado' : (proj.approvalStatus === 'rejected' ? 'Revocado' : (isDraft ? 'En proceso' : 'Pendiente de autorización'));
    const statusCls = isApproved ? 'ok' : (proj.approvalStatus === 'rejected' ? 'bad' : 'wait');
    const statusText = isApproved
      ? 'El proyecto se encuentra activo para que los creadores puedan trabajar sin restricciones.'
      : (proj.approvalStatus === 'rejected' ? 'La autorización fue revocada. Revisa las observaciones del administrador.' : 'El proyecto está en construcción o espera la autorización de un administrador.');

    const left = manage ? this.renderRequestsCard(proj, hub) : this.renderJoinCard(proj, hub, role);

    return `
      <div class="phub-grid">
        <section class="phub-col">
          ${left}
          <div class="phub-card">
            <div class="phub-status">
              <div class="phub-shield">🛡️</div>
              <div class="phub-status-body">
                <h3>Estado del proyecto</h3>
                <span class="phub-status-pill ${statusCls}">${statusCls === 'ok' ? '✔' : (statusCls === 'bad' ? '✖' : '⏳')} ${statusLabel}</span>
                <p>${statusText}</p>
              </div>
            </div>
          </div>
        </section>

        <section class="phub-col">
          ${this.actionBar(proj, edit)}
          <div class="phub-card">
            <h2 class="phub-pill-title">👁️ Ver detalles</h2>
            ${proj.description ? `<p class="phub-desc">${this.esc(String(proj.description).slice(0, 220))}</p>` : ''}
            <div class="phub-detail-grid">
              <div>
                <h4 class="phub-sub">Personas del Proyecto</h4>
                <ul class="phub-people">
                  ${people.map(p => `
                    <li>
                      ${this.avatar(p.name, 40)}
                      <div class="phub-person"><strong>${this.esc(p.name)}${p.leader ? ' <span class="phub-crown">👑</span>' : ''}</strong>
                      <small>${(this.ROLES[p.role] || this.ROLES.viewer).label}</small></div>
                    </li>`).join('')}
                </ul>
              </div>
              <div>
                <h4 class="phub-sub">Resultados del Proyecto</h4>
                <div class="phub-gauges">
                  ${this.gauge(progress, 'Avance del proyecto', '#16a34a')}
                  ${this.gauge(ratingPct, stats.total ? `Calificación (${stats.avg.toFixed(1)}★)` : 'Sin calificaciones', '#0ea5e9')}
                </div>
                <h4 class="phub-sub" style="margin-top:1rem;">Archivos de entregas</h4>
                <ul class="phub-files">
                  ${slides.length ? `<li><span>📊</span> Presentación (${slides.length} láminas)</li>` : ''}
                  ${resources.slice(0, 6).map(r => `<li><span>📄</span> ${this.esc(r.name || r.title || 'Archivo')}</li>`).join('')}
                  ${(!slides.length && !resources.length) ? '<li class="empty">Aún no hay archivos cargados.</li>' : ''}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>`;
  },

  gauge(pct, label, color) {
    return `
      <div class="phub-gauge">
        <div class="phub-donut" style="background:conic-gradient(${color} ${pct * 3.6}deg, #e2e8f0 0deg);">
          <div class="phub-donut-in">${pct}%</div>
        </div>
        <span>${this.esc(label)}</span>
      </div>`;
  },

  roleOptions(selected) {
    return this.ASSIGNABLE.map(r => `<option value="${r}" ${r === selected ? 'selected' : ''}>${this.ROLES[r].icon} ${this.ROLES[r].label}</option>`).join('');
  },

  renderRequestsCard(proj, hub) {
    const reqs = hub.joinRequests.filter(r => r.status === 'pending');
    const id = this.esc(proj.id);
    return `
      <div class="phub-card">
        <h2 class="phub-pill-title">👥➕ Solicitudes de Unión</h2>
        ${reqs.length ? reqs.map(r => `
          <div class="phub-req">
            ${this.avatar(r.name, 64)}
            <div class="phub-req-info">
              <div><b>Nombre o usuario:</b> ${this.esc(r.name)}</div>
              <div><b>Correo:</b> ${this.esc(r.email)}</div>
              <div><b>Contraseña:</b> (Oculto)</div>
              <label class="phub-role-pick">Rol a asignar:
                <select id="phub-role-${this.esc(r.id)}">${this.roleOptions('viewer')}</select>
              </label>
            </div>
            <div class="phub-req-btns">
              <button type="button" class="phub-btn green" onclick="window.ProjectHub.acceptRequest('${id}','${this.esc(r.id)}')">✔ Unir a la persona</button>
              <button type="button" class="phub-btn red" onclick="window.ProjectHub.rejectRequest('${id}','${this.esc(r.id)}')">✖ Rechazar</button>
            </div>
          </div>`).join('') : `<div class="phub-empty">📭 No hay solicitudes pendientes.<br><small>Cuando alguien pida unirse aparecerá aquí.</small></div>`}
      </div>`;
  },

  renderJoinCard(proj, hub, role) {
    const id = this.esc(proj.id);
    const roleInfo = this.ROLES[role] || this.ROLES.guest;
    const me = this.me();
    const mine = hub.joinRequests.find(r => this.norm(r.email) === this.norm(me.email) && me.email);
    if (role !== 'guest') {
      return `
        <div class="phub-card">
          <h2 class="phub-pill-title">🎟️ Mi participación</h2>
          <div class="phub-empty ok">${roleInfo.icon} Participas como <b>${roleInfo.label}</b>.<br><small>${roleInfo.desc}</small></div>
        </div>`;
    }
    return `
      <div class="phub-card">
        <h2 class="phub-pill-title">👥➕ Unirme al proyecto</h2>
        <p class="phub-desc">Envía tu solicitud con tu nombre o usuario, correo y contraseña. El creador la revisará y te asignará un rol (editor, solo lectura, etc.).</p>
        ${mine && mine.status === 'pending' ? '<div class="phub-empty">⏳ Tu solicitud está pendiente de aprobación.</div>' : ''}
        <div class="phub-join-btns">
          <button type="button" class="phub-btn blue" onclick="window.ProjectHub.openJoinForm('${id}')">📨 Solicitar unirme</button>
          <button type="button" class="phub-btn ghost" onclick="window.ProjectHub.openMemberLogin('${id}')">🔑 Ya soy miembro</button>
        </div>
      </div>`;
  },

  renderUsers(proj, hub, manage) {
    const people = this.peopleOf(proj, hub);
    const id = this.esc(proj.id);
    return `
      <div class="phub-card">
        <h2 class="phub-pill-title">👥 Usuarios y roles</h2>
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
      <div class="phub-card">
        <h2 class="phub-pill-title">🔐 Qué puede hacer cada rol</h2>
        <ul class="phub-roles-legend">
          ${['owner', ...this.ASSIGNABLE].map(r => `<li><span>${this.ROLES[r].icon}</span><div><b>${this.ROLES[r].label}</b><small>${this.ROLES[r].desc}</small></div></li>`).join('')}
        </ul>
      </div>`;
  },

  renderSettings(proj, hub) {
    const id = this.esc(proj.id);
    return `
      <div class="phub-card">
        <h2 class="phub-pill-title">⚙️ Configuración</h2>
        <div class="phub-settings">
          <button type="button" class="phub-btn blue" onclick="window.ProjectHub.editProject('${id}')">✏️ Editar contenido del proyecto</button>
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
        <div class="phub-kpi"><span>👁️</span><b>${views.length}</b><small>Visitas totales</small></div>
        <div class="phub-kpi"><span>🧑‍🤝‍🧑</span><b>${uniq}</b><small>Personas que lo vieron</small></div>
        <div class="phub-kpi"><span>⭐</span><b>${stats.total ? stats.avg.toFixed(1) : '—'}</b><small>Calificación promedio</small></div>
        <div class="phub-kpi"><span>🗳️</span><b>${stats.total}</b><small>Calificaciones</small></div>
      </div>

      <div class="phub-report-grid">
        <div class="phub-card">
          <h2 class="phub-pill-title">📈 Personas que han visto el proyecto</h2>
          <div class="phub-bars">
            ${days.map(d => `
              <div class="phub-bar-col">
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

        <div class="phub-card">
          <h2 class="phub-pill-title">⭐ Calificación del proyecto</h2>
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
    this.toast('📨 ¡Solicitud enviada! El creador la revisará pronto.');
    if (document.getElementById('phub-overlay')) this.render();
  },

  acceptRequest(projectId, reqId) {
    if (!this.canManage(this.getProject(projectId))) { this.toast('🔒 Solo el creador puede aceptar solicitudes.'); return; }
    const hub = this.getHub(projectId);
    const req = hub.joinRequests.find(r => r.id === reqId);
    if (!req) return;
    const sel = document.getElementById('phub-role-' + reqId);
    const role = (sel && sel.value) || 'viewer';
    hub.members = hub.members.filter(m => this.norm(m.email) !== this.norm(req.email));
    hub.members.push({ name: req.name, email: req.email, passHash: req.passHash, role, since: Date.now() });
    req.status = 'accepted';
    req.role = role;
    this.saveHub(projectId, hub);
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
