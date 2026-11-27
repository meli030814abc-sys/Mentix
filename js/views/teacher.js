/**
 * 🔥 MENTIX - Panel del Profesor 3D (Teacher Dashboard 3D)
 * - Filtra exclusivamente exámenes/cuestionarios reales creados por el docente (oculta proyectos).
 * - Muestra únicamente los cursos/grupos creados por el docente actual y sincronizados en la nube.
 * - Genera Código de Acceso único por grupo para que los estudiantes se unan desde "Unirse a un código".
 * - Permite añadir, cambiar y borrar exámenes dinámicamente en cada grupo y lanzar el examen real del grupo.
 */

window.TeacherView = {
  selectedGroupIdForLaunch: null,
  modalRoomType: 'presented',
  searchQuery: '',
  selectedCategory: 'all',
  activeGroupForStudent: null,
  editingGroupId: null,
  selectedExamIdForNewGroup: null,
  newGroupExamMode: 'existing',
  _cloudSyncInFlight: false,
  _hasSyncedCloudOnce: false,

  // Detecta si un item es un Proyecto (presentación, video, doc, url, etc.) y NO un examen puro
  isProjectItem(c) {
    if (!c || typeof c !== 'object') return false;
    const pType = String(c.projectType || c.project_type || '').toLowerCase().trim();
    if (pType === 'quiz') return false;
    if (pType === 'presentation' || pType === 'video' || pType === 'document' || pType === 'url') return true;
    if (c.isGovDataProject || c.is_gov_data_project) return true;
    if (!Array.isArray(c.questions) || c.questions.length === 0) return true;
    return false;
  },

  // Verifica si un examen o grupo pertenece al docente actual
  isOwnedByCurrentTeacher(item) {
    if (!item || typeof item !== 'object') return false;
    const u = window.appState?.currentUser || {};
    const uid = String(u.id || '').trim();
    const uemail = String(u.email || '').trim().toLowerCase();
    const uname = String(u.name || '').trim().toLowerCase();

    const itemIds = [item.teacherId, item.authorId, item.creatorId].filter(Boolean).map(v => String(v).trim());
    const itemEmails = [item.teacherEmail, item.authorEmail].filter(Boolean).map(v => String(v).trim().toLowerCase());
    const itemNames = [item.teacherName, item.author].filter(Boolean).map(v => String(v).trim().toLowerCase());

    if (uid && itemIds.includes(uid)) return true;
    if (uemail && itemEmails.includes(uemail)) return true;
    if (uname && itemNames.includes(uname)) return true;
    return false;
  },

  // Devuelve TODOS los exámenes creados (incluyendo los que están en proceso, propios primero)
  getTeacherExams() {
    const challenges = window.appState?.challenges || [];
    const exams = challenges.filter(c => c && !this.isProjectItem(c));
    return exams.sort((a, b) => {
      const aMine = this.isOwnedByCurrentTeacher(a) ? 1 : 0;
      const bMine = this.isOwnedByCurrentTeacher(b) ? 1 : 0;
      return bMine - aMine;
    });
  },

  // Devuelve los proyectos autorizados para mostrar en la sección de evaluaciones del docente (solo Presentar / Ver Landing)
  getAuthorizedProjects() {
    const challenges = window.appState?.challenges || [];
    return challenges.filter(c => {
      if (!c || !this.isProjectItem(c)) return false;
      if (c.rejectionReason) return false;
      return c.approvalStatus === 'approved' || (c.publicationStatus === 'published' && c.approvalStatus !== 'pending');
    });
  },

  presentAuthorizedProject(projectId) {
    const p = (window.appState?.challenges || []).find(c => String(c.id) === String(projectId));
    if (!p) {
      window.appRouter.navigate('projects');
      return;
    }
    const pType = String(p.projectType || p.project_type || 'presentation').toLowerCase().trim();
    if (pType === 'presentation') {
      window.appRouter.navigate('presentation', { id: p.id, project: p });
    } else if (pType === 'video') {
      window.appRouter.navigate('video', { id: p.id, project: p });
    } else if (pType === 'document') {
      window.appRouter.navigate('document', { id: p.id, project: p });
    } else if (pType === 'url') {
      window.appRouter.navigate('url', { id: p.id, project: p });
    } else if (window.ProjectsView && typeof window.ProjectsView.openProjectLanding === 'function') {
      window.ProjectsView.openProjectLanding(p.id);
    } else {
      window.appRouter.navigate('projects');
    }
  },

  editExam(examId) {
    if (!examId) return;
    const allExams = (window.appState?.challenges || []).concat(window.appState?.projects || []);
    let exam = allExams.find(c => c && String(c.id).trim() === String(examId).trim());
    if (!exam && typeof DEFAULT_CHALLENGES !== 'undefined') {
      exam = DEFAULT_CHALLENGES.find(c => c && String(c.id).trim() === String(examId).trim());
    }
    window.appRouter.navigate('creator', { editId: String(examId).trim(), challenge: exam, fromTeacher: true });
  },

  // Devuelve TODOS los exámenes reales disponibles en la plataforma (propios primero)
  getAllRealExams() {
    const challenges = window.appState?.challenges || [];
    const real = challenges.filter(c => c && !this.isProjectItem(c) && Array.isArray(c.questions) && c.questions.length > 0);
    return real.sort((a, b) => {
      const aMine = this.isOwnedByCurrentTeacher(a) ? 1 : 0;
      const bMine = this.isOwnedByCurrentTeacher(b) ? 1 : 0;
      return bMine - aMine;
    });
  },

  // Devuelve los grupos creados por el docente actual
  getTeacherGroups() {
    const groups = window.appState?.groups || [];
    return groups.filter(g => g && this.isOwnedByCurrentTeacher(g));
  },

  // Genera un código numérico de 6 dígitos único para el grupo
  generateGroupAccessCode() {
    const existing = new Set((window.appState?.groups || []).map(g => String(g.accessCode || '').trim()));
    for (let i = 0; i < 20; i++) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      if (!existing.has(code)) return code;
    }
    return String(Date.now()).slice(-6);
  },

  getApiBaseUrl() {
    if (typeof window.MENTIX_API_URL === 'string' && window.MENTIX_API_URL) return window.MENTIX_API_URL;
    if (window.location.hostname.includes('vercel.app') || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '/api/challenges';
    }
    return 'https://mentixs.vercel.app/api/challenges';
  },

  async syncGroupsFromCloud() {
    if (this._cloudSyncInFlight) return;
    this._cloudSyncInFlight = true;
    try {
      const res = await fetch(`${this.getApiBaseUrl()}?teacherGroups=1&t=${Date.now()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.groups)) {
          const localGroups = Array.isArray(window.appState?.groups) ? window.appState.groups : [];
          const map = new Map();
          localGroups.forEach(g => { if (g && g.id) map.set(g.id, g); });
          data.groups.forEach(cg => {
            if (!cg || !cg.id) return;
            const local = map.get(cg.id);
            if (!local || (cg.updatedAt || 0) >= (local.updatedAt || 0)) {
              map.set(cg.id, cg);
            }
          });
          window.appState.groups = Array.from(map.values());
          if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
          if (document.getElementById('view-teacher')?.classList.contains('active')) {
            this._hasSyncedCloudOnce = true;
            this.render(true);
          }
        }
      }
    } catch (e) {
      console.warn('No se pudieron sincronizar grupos docentes desde la nube:', e);
    } finally {
      this._cloudSyncInFlight = false;
    }
  },

  async pushGroupToCloud(group) {
    try {
      await fetch(this.getApiBaseUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'SAVE_TEACHER_GROUP', group })
      });
    } catch (e) {
      console.warn('No se pudo guardar el grupo en la nube:', e);
    }
  },

  async deleteGroupFromCloud(groupId) {
    try {
      await fetch(this.getApiBaseUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'DELETE_TEACHER_GROUP', groupId })
      });
    } catch (e) {
      console.warn('No se pudo eliminar el grupo en la nube:', e);
    }
  },

  getTheme() {
    try {
      const saved = localStorage.getItem('mentix_teacher_theme') || localStorage.getItem('te_reto_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (e) {}
    return document.body.classList.contains('light-theme') ? 'light' : 'dark';
  },

  applyTheme(theme) {
    const root = document.getElementById('teacher-panel-root');
    const isLight = theme === 'light';
    if (root) {
      root.classList.toggle('teacher-theme-light', isLight);
      root.classList.toggle('teacher-theme-dark', !isLight);
    }
    const container = document.getElementById('view-teacher');
    if (container) {
      container.classList.toggle('teacher-theme-light', isLight);
      container.classList.toggle('teacher-theme-dark', !isLight);
    }
    document.querySelectorAll('.t3d-modal-backdrop').forEach(m => {
      m.classList.toggle('teacher-theme-light', isLight);
      m.classList.toggle('teacher-theme-dark', !isLight);
    });
    const iconEl = document.getElementById('t3d-theme-icon');
    const textEl = document.getElementById('t3d-theme-text');
    if (iconEl) {
      iconEl.src = isLight
        ? 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Crescent%20moon/3D/crescent_moon_3d.png'
        : 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sun/3D/sun_3d.png';
    }
    if (textEl) {
      textEl.textContent = isLight ? 'Modo Oscuro' : 'Modo Claro';
    }
    try {
      localStorage.setItem('mentix_teacher_theme', theme);
    } catch (e) {}
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    this.applyTheme(next);
  },

  setCategoryFilter(catId) {
    this.selectedCategory = catId;
    this.render(true);
  },

  handleSearchInput(val) {
    this.searchQuery = (val || '').toLowerCase().trim();
    this.filterQuizzesInDOM();
  },

  filterQuizzesInDOM() {
    const cards = document.querySelectorAll('.t3d-quiz-card[data-title]');
    let visibleCount = 0;
    const query = this.searchQuery;
    const cat = this.selectedCategory;

    cards.forEach(card => {
      const title = (card.getAttribute('data-title') || '').toLowerCase();
      const desc = (card.getAttribute('data-desc') || '').toLowerCase();
      const cardCat = (card.getAttribute('data-cat') || '').toLowerCase();

      const matchesQuery = !query || title.includes(query) || desc.includes(query);
      const matchesCat = cat === 'all' || cardCat === cat.toLowerCase();

      if (matchesQuery && matchesCat) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    const countEl = document.getElementById('t3d-quiz-counter');
    if (countEl) countEl.textContent = visibleCount;

    const emptyMsg = document.getElementById('t3d-quiz-empty-search');
    if (emptyMsg) {
      emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  },

  // Resuelve los exámenes asignados a un grupo (lista completa + examen activo)
  getGroupAssignedExams(grp) {
    const allChallenges = window.appState?.challenges || [];
    const examIds = Array.isArray(grp.examIds) ? grp.examIds.slice() : [];
    if (grp.examId && !examIds.includes(grp.examId)) {
      examIds.unshift(grp.examId);
    }
    const resolved = examIds
      .map(id => allChallenges.find(c => c && String(c.id) === String(id)))
      .filter(c => c && !this.isProjectItem(c) && Array.isArray(c.questions) && c.questions.length > 0);
    return resolved;
  },

  getGroupActiveExam(grp) {
    const assigned = this.getGroupAssignedExams(grp);
    if (assigned.length === 0) return null;
    if (grp.examId) {
      const exact = assigned.find(c => String(c.id) === String(grp.examId));
      if (exact) return exact;
    }
    return assigned[0];
  },

  copyGroupCode(code, btnEl) {
    if (!code) return;
    try {
      navigator.clipboard?.writeText(String(code));
    } catch (e) {}
    if (btnEl) {
      const prev = btnEl.innerHTML;
      btnEl.innerHTML = '✅ ¡Copiado!';
      setTimeout(() => { btnEl.innerHTML = prev; }, 1600);
    }
  },

  render(skipCloudSync = false) {
    const container = document.getElementById('view-teacher');
    if (!container) return;

    if (!skipCloudSync && !this._hasSyncedCloudOnce) {
      this._hasSyncedCloudOnce = true;
      setTimeout(() => this.syncGroupsFromCloud(), 50);
    }

    const myGroups = this.getTeacherGroups();
    const myExams = this.getTeacherExams();
    const authorizedProjects = this.getAuthorizedProjects();
    const currentTheme = this.getTheme();

    container.classList.toggle('teacher-theme-light', currentTheme === 'light');
    container.classList.toggle('teacher-theme-dark', currentTheme !== 'light');

    const totalStudents = myGroups.reduce((acc, g) => acc + (parseInt(g.studentsCount) || (g.students?.length || 0)), 0);
    const avgScoresList = myGroups.map(g => parseInt(g.avgScore) || 80).filter(n => !isNaN(n));
    const globalAvg = avgScoresList.length ? Math.round(avgScoresList.reduce((a, b) => a + b, 0) / avgScoresList.length) : 82;

    const categoriesMap = new Map();
    myExams.forEach(c => {
      const cat = c.categoryName || 'General';
      categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
    });

    container.innerHTML = `
      <div class="t3d-container ${currentTheme === 'light' ? 'teacher-theme-light' : 'teacher-theme-dark'}" id="teacher-panel-root">
        
        <!-- HERO BANNER 3D -->
        <header class="t3d-hero">
          <div class="t3d-hero-left">
            <div class="t3d-hero-mascot-box">
              <img 
                src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Teacher/Default/3D/teacher_3d_default.png" 
                alt="Docente 3D" 
                class="t3d-hero-mascot"
              />
            </div>
            <div>
              <span class="t3d-badge-gold">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-sm" alt="" />
                AULA &amp; DOCENCIA 3D
              </span>
              <h1 class="t3d-hero-title">Panel Docente 3D</h1>
              <p class="t3d-hero-sub">Tus grupos con código de acceso, tus exámenes reales y lanzamiento en vivo para tus estudiantes.</p>
            </div>
          </div>

          <div class="t3d-hero-actions">
            <button class="t3d-btn t3d-btn-outline" id="t3d-theme-btn" onclick="window.TeacherView.toggleTheme()" title="Cambiar Tema Claro / Oscuro">
              <img 
                id="t3d-theme-icon" 
                class="t3d-ico-sm" 
                src="${currentTheme === 'light' ? 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Crescent%20moon/3D/crescent_moon_3d.png' : 'https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sun/3D/sun_3d.png'}" 
                alt="" 
              />
              <span id="t3d-theme-text">${currentTheme === 'light' ? 'Modo Oscuro' : 'Modo Claro'}</span>
            </button>
            <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.openNewGroupModal()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
              <span>Nuevo Grupo</span>
            </button>
            <button class="t3d-btn t3d-btn-primary" onclick="window.appRouter.navigate('creator')">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
              <span>Crear Examen</span>
            </button>
          </div>
        </header>

        <!-- MÉTRICAS CLAVE KPI 3D -->
        <section class="t3d-kpi-grid">
          <div class="t3d-kpi-card t3d-kpi-blue">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Books/3D/books_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Mis Cursos Activos</div>
              <div class="t3d-kpi-val">${myGroups.length}</div>
              <div class="t3d-kpi-sub">👥 ${totalStudents} alumnos inscritos</div>
            </div>
          </div>

          <div class="t3d-kpi-card t3d-kpi-cyan">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Mis Exámenes Reales</div>
              <div class="t3d-kpi-val">${myExams.length}</div>
              <div class="t3d-kpi-sub">📝 Listos para tus grupos</div>
            </div>
          </div>

          <div class="t3d-kpi-card t3d-kpi-green">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bullseye/3D/bullseye_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Aciertos Promedio</div>
              <div class="t3d-kpi-val">${globalAvg}%</div>
              <div class="t3d-kpi-sub">🎯 Rendimiento de tus cursos</div>
            </div>
          </div>

          <div class="t3d-kpi-card t3d-kpi-gold">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Código de Grupo</div>
              <div class="t3d-kpi-val" style="font-size: 1.25rem; margin-top: 0.25rem;">Acceso Directo</div>
              <div class="t3d-kpi-sub">🔑 Los alumnos entran con código</div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 1: MIS EXÁMENES Y EVALUACIONES (SOLO DEL DOCENTE, SIN PROYECTOS) -->
        <section style="margin-bottom: 3.5rem;">
          <div class="t3d-section-header">
            <h2 class="t3d-section-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Open%20book/3D/open_book_3d.png" class="t3d-ico-md" alt="" />
              <span>Mis Exámenes y Evaluaciones</span>
              <span class="t3d-pill-meta" id="t3d-quiz-counter" style="margin-left: 0.5rem;">${myExams.length}</span>
            </h2>

            <div class="t3d-search-bar">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png" class="t3d-ico-sm" alt="" />
              <input 
                type="text" 
                class="t3d-search-input" 
                placeholder="Buscar en mis exámenes..." 
                value="${this.searchQuery}"
                oninput="window.TeacherView.handleSearchInput(this.value)" 
              />
            </div>
          </div>

          ${myExams.length > 0 ? `
            <div class="t3d-filter-chips">
              <div 
                class="t3d-filter-chip ${this.selectedCategory === 'all' ? 'is-active' : ''}" 
                onclick="window.TeacherView.setCategoryFilter('all')"
              >
                🌟 Todos (${myExams.length})
              </div>
              ${Array.from(categoriesMap.entries()).map(([catName, count]) => `
                <div 
                  class="t3d-filter-chip ${this.selectedCategory.toLowerCase() === catName.toLowerCase() ? 'is-active' : ''}" 
                  onclick="window.TeacherView.setCategoryFilter('${catName}')"
                >
                  📁 ${catName} (${count})
                </div>
              `).join('')}
            </div>
          ` : ''}

          <div class="t3d-quiz-grid">
            ${myExams.length === 0 ? `
              <div class="t3d-quiz-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-lg" style="margin: 0 auto 1rem;" alt="" />
                <h3 style="font-size: 1.3rem; font-weight: 900; margin: 0 0 0.5rem;">Aún no has creado exámenes</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Crea tu primer examen real con preguntas para poder asignarlo a tus grupos.</p>
                <div>
                  <button class="t3d-btn t3d-btn-primary" onclick="window.appRouter.navigate('creator')">
                    <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
                    <span>Crear Mi Primer Examen</span>
                  </button>
                </div>
              </div>
            ` : myExams.map(c => {
              const catName = c.categoryName || 'General';
              const timeLimit = c.timePerQuestion === 0 ? 'Sin límite' : ((c.timePerQuestion || 20) + 's');
              const qCount = c.questions?.length || 0;
              const isInProcess = c.approvalStatus === 'pending' || c.status === 'in_progress' || c.status === 'draft' || qCount === 0;
              const isMine = this.isOwnedByCurrentTeacher(c);
              const currentUser = window.appState?.currentUser;
              const isCreatorOrAdmin = isMine || this.isOwnedByCurrentTeacher(c) || (window.appRouter && window.appRouter.isChallengeOwner && window.appRouter.isChallengeOwner(c)) || (currentUser && (['admin', 'administrador'].includes(String(currentUser.role).toLowerCase()) || currentUser.isAdmin === true));

              return `
                <div 
                  class="t3d-quiz-card" 
                  data-title="${(c.title || '').replace(/"/g, '&quot;')}" 
                  data-desc="${(c.description || '').replace(/"/g, '&quot;')}" 
                  data-cat="${catName}"
                >
                  <div>
                    <div class="t3d-quiz-top-row">
                      <span class="t3d-pill-category">📚 ${catName}</span>
                      <span class="t3d-pill-meta">⏱️ ${timeLimit} • 📝 ${qCount} preg.</span>
                    </div>

                    <h3 class="t3d-quiz-title">${c.title}</h3>
                    <p class="t3d-quiz-desc">${c.description || 'Evaluación real lista para aplicar en tus grupos.'}</p>
                    
                    <div class="t3d-quiz-author-bar">
                      <div class="t3d-author-info">
                        <span>${c.authorAvatar || '👨‍🏫'}</span>
                        <span>Prof: <strong>${c.author || 'Docente'}</strong></span>
                      </div>
                      <div style="display: inline-flex; align-items: center; gap: 0.45rem; flex-wrap: wrap;">
                        ${isCreatorOrAdmin ? `
                          <button 
                            type="button" 
                            class="t3d-btn-details-badge" 
                            title="⚙️ Detalles y Aleatorización inteligente de preguntas y respuestas"
                            onclick="window.TeacherView.openExamDetailsModal('${c.id}')"
                          >
                            <span>⚙️ Detalles</span>
                          </button>
                        ` : ''}
                        ${isInProcess
                          ? `<span class="t3d-badge-myquiz" style="background: rgba(245, 158, 11, 0.18); color: #f59e0b; border-color: rgba(245, 158, 11, 0.4);">⏳ En Proceso</span>`
                          : (isMine
                            ? `<span class="t3d-badge-myquiz">⭐ Creado por ti</span>`
                            : `<span class="t3d-badge-myquiz" style="background: rgba(16, 185, 129, 0.16); color: #10b981; border-color: rgba(16, 185, 129, 0.35);">✅ Listo</span>`
                          )
                        }
                      </div>
                    </div>
                  </div>

                  <div class="t3d-quiz-actions">
                    <button 
                      class="t3d-card-btn t3d-card-btn-test" 
                      title="Probar examen como estudiante"
                      onclick="window.appRouter.startSinglePlayer('${c.id}')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Play%20button/3D/play_button_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Probar</span>
                    </button>
                    <button 
                      class="t3d-card-btn t3d-btn-primary" 
                      title="Proyectar en pantalla grande (Estilo Kahoot)"
                      onclick="window.appRouter.hostRoom('${c.id}', 'presented')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Proyectar</span>
                    </button>
                    <button 
                      class="t3d-card-btn t3d-btn-cyan" 
                      title="Sala normal para celulares"
                      onclick="window.appRouter.hostRoom('${c.id}', 'normal')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Video%20game/3D/video_game_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Móvil</span>
                    </button>
                    <button 
                      class="t3d-card-btn t3d-btn-amber" 
                      title="Editar examen"
                      style="max-width: 44px; padding: 0.55rem 0.4rem;"
                      onclick="window.TeacherView.editExam('${c.id}')"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <div id="t3d-quiz-empty-search" style="display: none; text-align: center; padding: 2rem;">
            <p style="font-size: 1.1rem; font-weight: 800; color: var(--text-secondary);">
              🔍 No se encontraron exámenes con ese término o categoría.
            </p>
          </div>

          <!-- PROYECTOS AUTORIZADOS (SOLO PRESENTAR O VER LANDING, Y BOTÓN PARA IR A PROYECTOS) -->
          <div style="margin-top: 2.5rem; padding-top: 2rem; border-top: 1.5px dashed rgba(148, 163, 184, 0.25);">
            <div class="t3d-section-header" style="margin-bottom: 1.15rem;">
              <h3 class="t3d-section-title" style="font-size: 1.2rem;">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-md" alt="" />
                <span>Proyectos Autorizados</span>
                <span class="t3d-pill-meta" style="margin-left: 0.5rem;">${authorizedProjects.length}</span>
              </h3>
              <button class="t3d-btn t3d-btn-outline" onclick="window.appRouter.navigate('projects')">
                <span>🌐 Ver más en Proyectos →</span>
              </button>
            </div>

            ${authorizedProjects.length === 0 ? `
              <div class="t3d-quiz-card" style="padding: 1.75rem; text-align: center;">
                <p style="margin: 0 0 1rem; color: var(--text-secondary); font-weight: 600;">No hay proyectos autorizados publicados en este momento.</p>
                <div>
                  <button class="t3d-btn t3d-btn-cyan" onclick="window.appRouter.navigate('projects')">
                    <span>🌐 Ir a la Página de Proyectos</span>
                  </button>
                </div>
              </div>
            ` : `
              <div class="t3d-quiz-grid">
                ${authorizedProjects.slice(0, 6).map(p => {
                  const pCat = p.categoryName || 'Proyecto';
                  const pTitle = p.landingConfig?.publicName || p.title || 'Proyecto Autorizado';
                  return `
                    <div class="t3d-quiz-card">
                      <div>
                        <div class="t3d-quiz-top-row">
                          <span class="t3d-pill-category">🚀 ${pCat}</span>
                          <span class="t3d-badge-myquiz" style="background: rgba(16, 185, 129, 0.16); color: #10b981; border-color: rgba(16, 185, 129, 0.35);">✅ Autorizado</span>
                        </div>
                        <h3 class="t3d-quiz-title">${pTitle}</h3>
                        <p class="t3d-quiz-desc">${p.description || 'Proyecto educativo autorizado para presentar en clase.'}</p>
                        <div class="t3d-quiz-author-bar">
                          <div class="t3d-author-info">
                            <span>${p.authorAvatar || '👨‍🏫'}</span>
                            <span>Por: <strong>${p.author || 'Equipo Mentix'}</strong></span>
                          </div>
                        </div>
                      </div>
                      <div class="t3d-quiz-actions" style="grid-template-columns: 1fr 1fr; display: grid; gap: 0.6rem;">
                        <button 
                          class="t3d-card-btn t3d-btn-primary" 
                          onclick="window.TeacherView.presentAuthorizedProject('${p.id}')"
                        >
                          <span>📽️ Presentar</span>
                        </button>
                        <button 
                          class="t3d-card-btn t3d-btn-cyan" 
                          onclick="window.ProjectsView ? window.ProjectsView.openProjectLanding('${p.id}') : window.appRouter.navigate('projects')"
                        >
                          <span>🚀 Ver Landing</span>
                        </button>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        </section>

        <!-- SECCIÓN 2: CURSOS Y GRUPOS REGISTRADOS DEL DOCENTE -->
        <section>
          <div class="t3d-section-header">
            <h2 class="t3d-section-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png" class="t3d-ico-md" alt="" />
              <span>Mis Cursos y Grupos</span>
              <span class="t3d-pill-meta">${myGroups.length}</span>
            </h2>
            <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.openNewGroupModal()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
              <span>Crear Nuevo Grupo 3D</span>
            </button>
          </div>

          <div class="t3d-groups-grid">
            ${myGroups.length === 0 ? `
              <div class="t3d-group-card" style="text-align: center; padding: 3rem 1.5rem;">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-lg" style="margin: 0 auto 1rem;" alt="" />
                <h3 style="font-size: 1.3rem; font-weight: 900; margin: 0 0 0.5rem;">Aún no has creado grupos o cursos</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Crea tu primer grupo: se generará un código único para que tus estudiantes se unan y podrás asignarle o cambiarle los exámenes cuando quieras.</p>
                <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.openNewGroupModal()">
                  <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
                  <span>Crear Mi Primer Grupo</span>
                </button>
              </div>
            ` : myGroups.map(grp => {
              const students = (grp.students || []).slice().sort((a, b) => (b.points || 0) - (a.points || 0));
              const accessCode = grp.accessCode || 'Sin código';
              const assignedExams = this.getGroupAssignedExams(grp);
              const activeExam = this.getGroupActiveExam(grp);

              return `
                <div class="t3d-group-card">
                  <!-- Cabecera del Grupo 3D -->
                  <div class="t3d-group-header">
                    <div class="t3d-group-identity">
                      <div class="t3d-group-icon-emblem">
                        <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-md" alt="" />
                      </div>
                      <div>
                        <h3 class="t3d-group-name">${grp.name}</h3>
                        <div class="t3d-group-meta">
                          <span>👥 ${students.length} / ${grp.studentsCount || students.length} estudiantes</span>
                          <span>• Promedio: <strong style="color: #10b981;">${grp.avgScore || 80}%</strong></span>
                        </div>

                        <!-- Código de Acceso + Examen Activo del Grupo -->
                        <div style="display: flex; flex-wrap: wrap; gap: 0.55rem; align-items: center; margin-top: 0.65rem;">
                          <span style="display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.32rem 0.8rem; border-radius: 999px; background: rgba(0, 245, 212, 0.14); border: 1.5px solid rgba(0, 245, 212, 0.45); font-weight: 900; font-size: 0.84rem; letter-spacing: 1px;">
                            🔑 Código: <strong>${accessCode}</strong>
                          </span>
                          <button 
                            type="button"
                            class="t3d-card-btn t3d-card-btn-test"
                            style="padding: 0.28rem 0.65rem; font-size: 0.76rem;"
                            onclick="window.TeacherView.copyGroupCode('${accessCode}', this)"
                          >
                            📋 Copiar
                          </button>

                          ${activeExam ? `
                            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.32rem 0.8rem; border-radius: 999px; background: rgba(59, 130, 246, 0.14); border: 1.5px solid rgba(59, 130, 246, 0.4); font-weight: 850; font-size: 0.82rem;">
                              📝 Examen activo: <strong>${activeExam.title}</strong> (${activeExam.questions.length} preg.)
                            </span>
                          ` : `
                            <span style="display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.32rem 0.8rem; border-radius: 999px; background: rgba(245, 158, 11, 0.14); border: 1.5px solid rgba(245, 158, 11, 0.45); font-weight: 850; font-size: 0.8rem;">
                              ⚠️ Sin examen asignado (pulsa Editar / Exámenes)
                            </span>
                          `}
                        </div>
                      </div>
                    </div>

                    <!-- Botones de Acción del Grupo -->
                    <div class="t3d-group-actions">
                      <button class="t3d-btn t3d-btn-amber" onclick="window.TeacherView.openEditGroupModal('${grp.id}')" title="Editar grupo, añadir, cambiar o borrar exámenes">
                        <span>✏️</span>
                        <span>Editar / Exámenes (${assignedExams.length})</span>
                      </button>
                      <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.openAddStudentModal('${grp.id}')" title="Inscribir alumno manualmente">
                        <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
                        <span>Alumno</span>
                      </button>
                      <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.openLaunchModalForGroup('${grp.id}')">
                        <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
                        <span>Lanzar Reto a este Grupo</span>
                      </button>
                    </div>
                  </div>

                  <!-- Cuadro de Honor / Estudiantes Unidos al Grupo -->
                  <div class="t3d-honor-title">
                    <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Trophy/3D/trophy_3d.png" class="t3d-ico-sm" alt="" />
                    <span>Estudiantes en el Grupo (${students.length})</span>
                  </div>

                  <div class="t3d-students-grid">
                    ${students.length === 0 ? `
                      <div style="grid-column: 1 / -1; font-size: 0.9rem; color: var(--text-secondary); padding: 0.5rem 0;">
                        Aún no se han unido estudiantes. Comparte el código <strong>${accessCode}</strong> para que entren desde <em>"Unirse a un código"</em>.
                      </div>
                    ` : students.map((st, index) => {
                      let medalHtml = '';
                      let podiumClass = '';

                      if (index === 0) {
                        podiumClass = 't3d-student-gold';
                        medalHtml = `<div class="t3d-medal-badge"><img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/1st%20place%20medal/3D/1st_place_medal_3d.png" class="t3d-ico-sm" alt="Oro" /></div>`;
                      } else if (index === 1) {
                        podiumClass = 't3d-student-silver';
                        medalHtml = `<div class="t3d-medal-badge"><img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/2nd%20place%20medal/3D/2nd_place_medal_3d.png" class="t3d-ico-sm" alt="Plata" /></div>`;
                      } else if (index === 2) {
                        podiumClass = 't3d-student-bronze';
                        medalHtml = `<div class="t3d-medal-badge"><img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/3rd%20place%20medal/3D/3rd_place_medal_3d.png" class="t3d-ico-sm" alt="Bronce" /></div>`;
                      }

                      return `
                        <div class="t3d-student-card ${podiumClass}">
                          ${medalHtml}
                          <div class="t3d-student-avatar">${st.avatar || '🦊'}</div>
                          <div style="min-width: 0; flex: 1;">
                            <div class="t3d-student-name">${st.name}</div>
                            <div class="t3d-student-pts">⚡ ${(st.points || 0).toLocaleString()} pts</div>
                          </div>
                        </div>
                      `;
                    }).join('')}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </section>

      </div>

      <!-- ==========================================================================
           MODAL 1: LANZAR RETO DEL GRUPO (PANTALLA 3D ULTRA CHÉVERE)
           ========================================================================== -->
      <div id="teacher-launch-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window" style="max-width: 680px; width: 96%; padding: 2.2rem;">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-md" alt="" />
              <span>Lanzar Examen a Grupo 3D</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeLaunchModal()">&times;</button>
          </div>

          <div id="teacher-modal-group-name" style="padding: 0.85rem 1.1rem; border-radius: 14px; background: rgba(59, 130, 246, 0.12); border: 1.5px solid rgba(59, 130, 246, 0.35); font-weight: 850; font-size: 0.95rem; color: #38bdf8; margin-bottom: 1.35rem; display: flex; align-items: center; gap: 0.5rem;"></div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">📝 EXAMEN A EVALUAR EN ESTA SALA:</label>
            <select id="teacher-modal-challenge-select" class="t3d-form-select"></select>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">🎮 ELIGE EL TIPO DE EXPERIENCIA EN VIVO:</label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
              <div 
                id="t3d-type-btn-presented" 
                class="t3d-launch-mode-card is-active" 
                onclick="window.TeacherView.selectModalRoomType('presented')"
              >
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-lg" alt="" />
                <div>
                  <div style="font-weight: 950; font-size: 1.05rem; margin-bottom: 0.25rem;">📽️ Modo Proyector / TV</div>
                  <div style="font-size: 0.78rem; opacity: 0.85; line-height: 1.35;">Estilo Kahoot Live. Preguntas en pantalla grande y los alumnos responden con 4 formas geométricas de colores en sus celulares.</div>
                </div>
                <span class="t3d-pill-category" style="background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(59, 130, 246, 0.4); font-size: 0.72rem;">⭐ Recomendado para Aula</span>
              </div>

              <div 
                id="t3d-type-btn-normal" 
                class="t3d-launch-mode-card" 
                onclick="window.TeacherView.selectModalRoomType('normal')"
              >
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Video%20game/3D/video_game_3d.png" class="t3d-ico-lg" alt="" />
                <div>
                  <div style="font-weight: 950; font-size: 1.05rem; margin-bottom: 0.25rem;">🎮 Sala Móvil &amp; PCs</div>
                  <div style="font-size: 0.78rem; opacity: 0.85; line-height: 1.35;">Desafío individual en dispositivos. Cada alumno lee las preguntas completas en su propio teléfono o computadora.</div>
                </div>
                <span class="t3d-pill-category" style="background: rgba(6, 182, 212, 0.2); color: #22d3ee; border: 1px solid rgba(6, 182, 212, 0.4); font-size: 0.72rem;">📱 Sin Proyector</span>
              </div>
            </div>
            <p id="t3d-modal-type-desc" style="font-size: 0.82rem; margin: 0.75rem 0 0; color: var(--text-secondary); line-height: 1.4; text-align: center;">
              📽️ Modo Proyector: Las preguntas aparecen en la pantalla central y los alumnos responden desde sus celulares.
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.8rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeLaunchModal()">Cancelar</button>
            <button class="t3d-btn t3d-btn-primary" style="padding: 0.85rem 1.6rem; font-size: 0.96rem;" onclick="window.TeacherView.confirmLaunchForGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
              <span>🚀 ¡ABRIR SALA Y LANZAR AHORA!</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 2: CREAR NUEVO GRUPO 3D (PANTALLA AMPLIA, ULTRA CHÉVERE & GAMING)
           ========================================================================== -->
      <div id="teacher-new-group-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window is-large">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-md" alt="" />
              <span>Crear Nuevo Grupo 3D</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeNewGroupModal()">&times;</button>
          </div>

          <!-- TARJETA HOLOGRÁFICA DE CÓDIGO DE ACCESO -->
          <div class="t3d-hologram-code-card" style="margin-bottom: 1.4rem;">
            <div>
              <div style="font-size: 0.76rem; font-weight: 850; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.85; margin-bottom: 0.35rem;">
                🔑 CÓDIGO DE ACCESO PARA TUS ALUMNOS (SE UNEN DESDE "UNIRSE A UN CÓDIGO"):
              </div>
              <div class="t3d-code-digits" id="t3d-new-group-code-preview">------</div>
              <input type="hidden" id="t3d-new-group-code" />
            </div>
            <div style="display: flex; gap: 0.5rem; align-items: center; position: relative; z-index: 2;">
              <button type="button" class="t3d-btn t3d-btn-outline" style="padding: 0.5rem 0.85rem; font-size: 0.8rem;" onclick="window.TeacherView.rerollNewGroupCode()" title="Generar un nuevo código aleatorio">
                🎲 Nuevo Código
              </button>
              <button type="button" class="t3d-btn t3d-btn-cyan" style="padding: 0.5rem 0.95rem; font-size: 0.8rem;" onclick="window.TeacherView.copyGroupCode(document.getElementById('t3d-new-group-code')?.value, this)">
                📋 Copiar
              </button>
            </div>
          </div>

          <!-- DATOS GENERALES DEL GRUPO -->
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.85rem; margin-bottom: 1.4rem;">
            <div>
              <label class="t3d-form-label">🏫 Nombre del Curso / Grado:</label>
              <input 
                type="text" 
                id="t3d-new-group-name" 
                class="t3d-form-input" 
                placeholder="Ej: GRADO 10-A CIENCIAS Y TECNOLOGÍA" 
              />
            </div>
            <div>
              <label class="t3d-form-label">👥 Alumnos Estimados:</label>
              <input type="number" id="t3d-new-group-count" class="t3d-form-input" value="30" min="1" max="300" />
            </div>
            <div>
              <label class="t3d-form-label">🎯 Promedio Base (%):</label>
              <input type="number" id="t3d-new-group-avg" class="t3d-form-input" value="80" min="0" max="100" />
            </div>
          </div>

          <!-- SECCIÓN: ¿QUÉ EXAMEN VA A IR EN ESTE GRUPO? -->
          <div style="padding: 1.35rem; border-radius: 22px; border: 2px solid rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.04); margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 950; margin: 0 0 0.2rem; display: flex; align-items: center; gap: 0.45rem;">
                  <span>📝</span> ¿Qué examen va a ir en este grupo?
                </h4>
                <p style="font-size: 0.82rem; margin: 0; opacity: 0.85;">Selecciona uno de la biblioteca o créalo al instante con preguntas interactivas.</p>
              </div>

              <!-- Pestañas segmentadas 3D -->
              <div class="t3d-segmented-tabs" style="margin-bottom: 0;">
                <button type="button" id="t3d-ng-tab-existing" class="t3d-tab-btn is-active" onclick="window.TeacherView.switchNewGroupExamMode('existing')">
                  📚 Biblioteca (${this.getAllRealExams().length})
                </button>
                <button type="button" id="t3d-ng-tab-create" class="t3d-tab-btn" onclick="window.TeacherView.switchNewGroupExamMode('create')">
                  ⚡ Crear Examen Aquí
                </button>
              </div>
            </div>

            <!-- PANEL A: ELECCIÓN DE EXAMEN CON TARJETAS 3D INTERACTIVAS -->
            <div id="t3d-ng-panel-existing">
              <div style="position: relative; margin-bottom: 0.75rem;">
                <input 
                  type="text" 
                  id="t3d-new-group-exam-filter" 
                  class="t3d-form-input" 
                  placeholder="🔍 Buscar examen por título, tema o profesor..." 
                  oninput="window.TeacherView.filterNewGroupExams(this.value)"
                />
              </div>

              <!-- Grid scrolleable de tarjetas 3D -->
              <div class="t3d-exam-grid-scroll" id="t3d-new-group-exam-cards-container"></div>
              <input type="hidden" id="t3d-new-group-selected-exam-id" />

              <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; margin-top: 0.5rem; font-size: 0.8rem; opacity: 0.85;">
                <span>💡 Haz clic sobre cualquier examen para seleccionarlo.</span>
                <span id="t3d-new-group-exam-selected-preview" style="font-weight: 900; color: #38bdf8;"></span>
              </div>
            </div>

            <!-- PANEL B: CREADOR DE EXAMEN RÁPIDO CON PREGUNTAS Y BOTONES KAHOOT -->
            <div id="t3d-ng-panel-create" style="display: none;">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.85rem; margin-bottom: 1.15rem;">
                <div>
                  <label class="t3d-form-label">✨ Título del Examen a Crear:</label>
                  <input type="text" id="t3d-inline-exam-title" class="t3d-form-input" placeholder="Ej: Parcial de Ciencias Naturales 10°" />
                </div>
                <div>
                  <label class="t3d-form-label">⏱️ Tiempo por Pregunta:</label>
                  <select id="t3d-inline-exam-time" class="t3d-form-select">
                    <option value="20" selected>20 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="45">45 segundos</option>
                    <option value="60">60 segundos</option>
                    <option value="0">Sin límite de tiempo</option>
                  </select>
                </div>
              </div>

              <div id="t3d-inline-questions-container" style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem;"></div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.65rem; padding-top: 0.5rem;">
                <button type="button" class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.addInlineQuestionRow()">
                  <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
                  <span>Añadir Otra Pregunta</span>
                </button>
                <button type="button" class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeNewGroupModal(); window.appRouter.navigate('creator');">
                  <span>🚀 Ir al Creador con IA o PDF</span>
                </button>
              </div>
            </div>
          </div>

          <!-- BOTONES DE ACCIÓN DEL MODAL -->
          <div style="display: flex; justify-content: flex-end; gap: 0.85rem; margin-top: 1.6rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeNewGroupModal()">Cancelar</button>
            <button class="t3d-btn t3d-btn-emerald" style="padding: 0.85rem 1.6rem; font-size: 0.95rem;" onclick="window.TeacherView.saveNewGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkles/3D/sparkles_3d.png" class="t3d-ico-sm" alt="" />
              <span>✨ CREAR GRUPO Y ACTIVAR CÓDIGO</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 3: EDITAR GRUPO Y GESTIONAR EXÁMENES (AÑADIR / ACTIVAR / BORRAR)
           ========================================================================== -->
      <div id="teacher-edit-group-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window is-large" style="max-width: 780px;">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-md" alt="" />
              <span>Editar Grupo y Exámenes 3D</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeEditGroupModal()">&times;</button>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 0.85rem; margin-bottom: 1.35rem;">
            <div>
              <label class="t3d-form-label">🏫 Nombre del Curso / Grado:</label>
              <input type="text" id="t3d-edit-group-name" class="t3d-form-input" />
            </div>
            <div>
              <label class="t3d-form-label">👥 Alumnos Estimados:</label>
              <input type="number" id="t3d-edit-group-count" class="t3d-form-input" min="1" max="300" />
            </div>
            <div>
              <label class="t3d-form-label">🎯 Promedio Base (%):</label>
              <input type="number" id="t3d-edit-group-avg" class="t3d-form-input" min="0" max="100" />
            </div>
          </div>

          <div class="t3d-hologram-code-card" style="margin-bottom: 1.35rem;">
            <div>
              <div style="font-size: 0.74rem; font-weight: 850; text-transform: uppercase; opacity: 0.85; margin-bottom: 0.25rem;">
                🔑 CÓDIGO DE ACCESO PARA LOS ESTUDIANTES:
              </div>
              <input type="text" id="t3d-edit-group-code" class="t3d-form-input" style="font-family: 'Gagalin', 'Montserrat', monospace; font-size: 1.6rem; letter-spacing: 4px; font-weight: 900; max-width: 220px;" maxlength="8" />
            </div>
            <button type="button" class="t3d-btn t3d-btn-cyan" style="padding: 0.5rem 0.95rem; font-size: 0.8rem;" onclick="window.TeacherView.copyGroupCode(document.getElementById('t3d-edit-group-code')?.value, this)">
              📋 Copiar Código
            </button>
          </div>

          <!-- Gestión Dinámica de Exámenes del Grupo -->
          <div style="padding: 1.25rem; border-radius: 20px; border: 2px solid rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.05); margin-bottom: 1.25rem;">
            <label class="t3d-form-label" style="font-size: 0.95rem; margin-bottom: 0.75rem;">📝 Exámenes Asignados a este Grupo:</label>
            <div id="t3d-edit-group-exams-list" style="display: flex; flex-direction: column; gap: 0.65rem; margin-bottom: 1.1rem;"></div>

            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
              <select id="t3d-edit-add-exam-select" class="t3d-form-select" style="flex: 1; min-width: 220px;">
                <option value="">-- Elegir examen para añadir a este grupo --</option>
                ${this.getAllRealExams().map(ex => `<option value="${ex.id}">${this.isOwnedByCurrentTeacher(ex) ? '⭐ ' : '📚 '}${ex.title} (${ex.questions.length} preg.)</option>`).join('')}
              </select>
              <button type="button" class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.addExamToEditingGroup()">
                <span>➕ Añadir Examen</span>
              </button>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; margin-top: 1.6rem; flex-wrap: wrap;">
            <button type="button" class="t3d-btn t3d-btn-outline" style="color: #ef4444; border-color: rgba(239,68,68,0.45);" onclick="window.TeacherView.deleteEditingGroup()">
              <span>🗑️ Borrar Grupo</span>
            </button>
            <div style="display: flex; gap: 0.75rem;">
              <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeEditGroupModal()">Cancelar</button>
              <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.saveEditGroup()">
                <span>💾 Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 4: AGREGAR ESTUDIANTE MANUALMENTE
           ========================================================================== -->
      <div id="teacher-add-student-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Trophy/3D/trophy_3d.png" class="t3d-ico-md" alt="" />
              <span>Inscribir Alumno en el Grupo</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeAddStudentModal()">&times;</button>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">Nombre y Apellido:</label>
            <input type="text" id="t3d-student-name-input" class="t3d-form-input" placeholder="Ej: Laura Sofía Mendoza" />
          </div>

          <div class="t3d-form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label class="t3d-form-label">Avatar del Estudiante:</label>
              <select id="t3d-student-avatar-select" class="t3d-form-select">
                <option value="🦊">🦊 Zorro Curioso</option>
                <option value="🐯">🐯 Tigre Ágil</option>
                <option value="🐼">🐼 Panda Sabio</option>
                <option value="🦁">🦁 León Líder</option>
                <option value="🦄">🦄 Unicornio Mágico</option>
                <option value="🤖">🤖 Bot Creador</option>
                <option value="🚀">🚀 Piloto Espacial</option>
              </select>
            </div>
            <div>
              <label class="t3d-form-label">Puntos Iniciales:</label>
              <input type="number" id="t3d-student-points-input" class="t3d-form-input" value="1000" min="0" step="50" />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.8rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeAddStudentModal()">Cancelar</button>
            <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.saveNewStudent()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
              <span>Registrar Alumno</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  openLaunchModalForGroup(groupId) {
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (!group) return;

    const assignedExams = this.getGroupAssignedExams(group);
    const activeExam = this.getGroupActiveExam(group);

    if (!activeExam) {
      alert('⚠️ Este grupo aún no tiene un examen asignado. Pulsa "Editar / Exámenes" para añadirle un examen real.');
      this.openEditGroupModal(groupId);
      return;
    }

    this.selectedGroupIdForLaunch = groupId;
    this.modalRoomType = 'presented';

    const modal = document.getElementById('teacher-launch-modal');
    const groupLabel = document.getElementById('teacher-modal-group-name');
    const select = document.getElementById('teacher-modal-challenge-select');

    if (groupLabel) {
      groupLabel.textContent = `🎯 Grupo: ${group.name} • 🔑 Código: ${group.accessCode || 'N/A'}`;
    }
    if (select) {
      select.innerHTML = assignedExams.map(ex => `
        <option value="${ex.id}" ${String(ex.id) === String(activeExam.id) ? 'selected' : ''}>
          ${ex.title} (${ex.questions.length} preguntas) ${String(ex.id) === String(activeExam.id) ? '— [Activo]' : ''}
        </option>
      `).join('');
    }
    this.selectModalRoomType('presented');
    if (modal) modal.style.display = 'flex';
  },

  selectModalRoomType(type) {
    this.modalRoomType = type;
    const btnPres = document.getElementById('t3d-type-btn-presented');
    const btnNorm = document.getElementById('t3d-type-btn-normal');
    const desc = document.getElementById('t3d-modal-type-desc');

    if (type === 'presented') {
      if (btnPres) btnPres.classList.add('is-active');
      if (btnNorm) btnNorm.classList.remove('is-active');
      if (desc) desc.textContent = '📽️ Modo Proyector: Las preguntas aparecen en la pantalla central y los alumnos responden desde sus celulares.';
    } else {
      if (btnPres) btnPres.classList.remove('is-active');
      if (btnNorm) btnNorm.classList.add('is-active');
      if (desc) desc.textContent = '🎮 Sala Normal: Cada estudiante lee las preguntas y opciones directamente en su propio teléfono o PC.';
    }
  },

  closeLaunchModal() {
    const modal = document.getElementById('teacher-launch-modal');
    if (modal) modal.style.display = 'none';
  },

  confirmLaunchForGroup() {
    const select = document.getElementById('teacher-modal-challenge-select');
    const challengeId = select ? select.value : null;
    const groupId = this.selectedGroupIdForLaunch;
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    const challenge = (window.appState.challenges || []).find(c => String(c.id) === String(challengeId))
      || (group ? this.getGroupActiveExam(group) : null);

    if (!challenge || !Array.isArray(challenge.questions) || challenge.questions.length === 0) {
      alert('⚠️ Por favor selecciona un examen real válido.');
      return;
    }

    this.closeLaunchModal();

    window.LobbyView.openCreateRoomRosterModal(
      challenge,
      'clasico',
      {},
      this.modalRoomType || 'presented',
      groupId
    );
  },

  launchGroupChallenge(groupId) {
    this.openLaunchModalForGroup(groupId);
  },

  /* ==========================================================================
     MODAL CREAR NUEVO GRUPO 3D
     ========================================================================== */
  newGroupExamMode: 'existing',
  selectedExamIdForNewGroup: null,

  openNewGroupModal() {
    const modal = document.getElementById('teacher-new-group-modal');
    const nameInput = document.getElementById('t3d-new-group-name');
    const filterInput = document.getElementById('t3d-new-group-exam-filter');
    const inlineTitle = document.getElementById('t3d-inline-exam-title');
    const qContainer = document.getElementById('t3d-inline-questions-container');

    if (nameInput) nameInput.value = '';
    this.rerollNewGroupCode();
    if (filterInput) filterInput.value = '';
    this.renderNewGroupExamCards('');

    if (inlineTitle) inlineTitle.value = '';
    if (qContainer) {
      qContainer.innerHTML = '';
      this.addInlineQuestionRow();
    }

    this.switchNewGroupExamMode(this.getAllRealExams().length > 0 ? 'existing' : 'create');
    if (modal) modal.style.display = 'flex';
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  },

  rerollNewGroupCode() {
    const code = this.generateGroupAccessCode();
    const input = document.getElementById('t3d-new-group-code');
    const preview = document.getElementById('t3d-new-group-code-preview');
    if (input) input.value = code;
    if (preview) preview.textContent = code;
    return code;
  },

  switchNewGroupExamMode(mode) {
    this.newGroupExamMode = mode === 'create' ? 'create' : 'existing';
    const tabEx = document.getElementById('t3d-ng-tab-existing');
    const tabCr = document.getElementById('t3d-ng-tab-create');
    const panEx = document.getElementById('t3d-ng-panel-existing');
    const panCr = document.getElementById('t3d-ng-panel-create');

    if (this.newGroupExamMode === 'create') {
      if (tabEx) tabEx.className = 't3d-tab-btn';
      if (tabCr) tabCr.className = 't3d-tab-btn is-active';
      if (panEx) panEx.style.display = 'none';
      if (panCr) panCr.style.display = 'block';
    } else {
      if (tabEx) tabEx.className = 't3d-tab-btn is-active';
      if (tabCr) tabCr.className = 't3d-tab-btn';
      if (panEx) panEx.style.display = 'block';
      if (panCr) panCr.style.display = 'none';
    }
  },

  filterNewGroupExams(query) {
    this.renderNewGroupExamCards(query);
  },

  renderNewGroupExamCards(query) {
    const container = document.getElementById('t3d-new-group-exam-cards-container');
    const hiddenInput = document.getElementById('t3d-new-group-selected-exam-id');
    const preview = document.getElementById('t3d-selected-exam-preview');
    if (!container) return;

    const q = (query || '').toLowerCase().trim();
    const exams = this.getAllRealExams();
    const filtered = exams.filter(ex =>
      !q ||
      (ex.title || '').toLowerCase().includes(q) ||
      (ex.author || '').toLowerCase().includes(q) ||
      (ex.categoryName || '').toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; padding: 2.2rem 1.5rem; text-align: center; color: var(--t3d-text-sub); background: rgba(148,163,184,0.06); border: 1.5px dashed rgba(148,163,184,0.3); border-radius: 16px;">
          <div style="font-size: 2rem; margin-bottom: 0.4rem;">🔍</div>
          <p style="font-size: 1rem; font-weight: 750; margin-bottom: 0.35rem; color: var(--t3d-text-main);">No se encontraron exámenes para "${query || ''}"</p>
          <p style="font-size: 0.82rem; margin: 0;">¡Puedes crear uno nuevo inmediatamente haciendo clic arriba en <strong>✨ Crear Examen Nuevo</strong>!</p>
        </div>
      `;
      if (hiddenInput) hiddenInput.value = '';
      if (preview) preview.textContent = 'Ninguno';
      this.selectedExamIdForNewGroup = null;
      return;
    }

    let curSelectedId = this.selectedExamIdForNewGroup;
    if (!curSelectedId || !filtered.some(e => String(e.id) === String(curSelectedId))) {
      curSelectedId = filtered[0].id;
      this.selectedExamIdForNewGroup = curSelectedId;
    }
    if (hiddenInput) hiddenInput.value = curSelectedId;

    const selectedExam = filtered.find(e => String(e.id) === String(curSelectedId));
    if (preview && selectedExam) {
      preview.textContent = selectedExam.title;
    }

    container.innerHTML = filtered.map(ex => {
      const isSelected = String(ex.id) === String(curSelectedId);
      const isOwned = this.isOwnedByCurrentTeacher(ex);
      const qCount = Array.isArray(ex.questions) ? ex.questions.length : 0;
      const safeTitle = (ex.title || 'Sin Título').replace(/"/g, '&quot;');
      const safeAuthor = (ex.author || 'Docente').replace(/"/g, '&quot;');
      const safeCat = (ex.categoryName || ex.category || 'General').toUpperCase();

      return `
        <div class="t3d-exam-pick-card ${isSelected ? 'is-selected' : ''}" 
             data-exam-id="${ex.id}" 
             onclick="window.TeacherView.selectExamPickCard('${ex.id}')">
          <div class="t3d-pick-check-badge">✓</div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.4rem; margin-bottom: 0.4rem;">
            <span class="t3d-badge-pill" style="font-size: 0.68rem; padding: 0.15rem 0.55rem; background: rgba(59,130,246,0.15); color: #3b82f6;">${safeCat}</span>
            ${isOwned ? '<span class="t3d-badge-pill" style="font-size: 0.68rem; padding: 0.15rem 0.55rem; background: rgba(16,185,129,0.18); color: #10b981;">⭐ Tuyo</span>' : ''}
          </div>
          <h4 style="font-size: 0.94rem; font-weight: 850; margin: 0 0 0.35rem 0; line-height: 1.25; color: var(--t3d-text-main);">${safeTitle}</h4>
          <div style="font-size: 0.77rem; color: var(--t3d-text-sub); display: flex; align-items: center; gap: 0.5rem; margin-top: auto; padding-top: 0.35rem;">
            <span>📝 ${qCount} preg.</span>
            <span>•</span>
            <span>👤 ${safeAuthor}</span>
          </div>
        </div>
      `;
    }).join('');
  },

  selectExamPickCard(examId) {
    this.selectedExamIdForNewGroup = examId;
    const hiddenInput = document.getElementById('t3d-new-group-selected-exam-id');
    const preview = document.getElementById('t3d-selected-exam-preview');
    if (hiddenInput) hiddenInput.value = examId;

    const allExams = this.getAllRealExams();
    const chosen = allExams.find(e => String(e.id) === String(examId));
    if (preview && chosen) {
      preview.textContent = chosen.title;
    }

    const cards = document.querySelectorAll('.t3d-exam-pick-card');
    cards.forEach(card => {
      if (card.getAttribute('data-exam-id') === String(examId)) {
        card.classList.add('is-selected');
      } else {
        card.classList.remove('is-selected');
      }
    });
  },

  addInlineQuestionRow() {
    const container = document.getElementById('t3d-inline-questions-container');
    if (!container) return;
    const idx = container.children.length + 1;
    const rowUid = 'iq_' + Date.now() + '_' + idx;
    const row = document.createElement('div');
    row.className = 't3d-q-builder-card';

    const tileConfig = [
      { shape: '✦', class: 't3d-tile-opt1', label: 'Opción Roja' },
      { shape: '⬢', class: 't3d-tile-opt2', label: 'Opción Azul' },
      { shape: '⚡', class: 't3d-tile-opt3', label: 'Opción Amarilla' },
      { shape: '🛡️', class: 't3d-tile-opt4', label: 'Opción Verde' }
    ];

    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px dashed rgba(148,163,184,0.3); padding-bottom: 0.45rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span style="display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 9px; background: linear-gradient(135deg, #3b82f6, #06b6d4); color: #fff; font-weight: 900; font-size: 0.85rem;">#${idx}</span>
          <strong style="font-size: 0.95rem; font-weight: 850;">Pregunta del Examen</strong>
        </div>
        ${idx > 1 ? `<button type="button" class="t3d-btn t3d-btn-outline" style="color: #ef4444; border-color: rgba(239,68,68,0.4); padding: 0.35rem 0.75rem; font-size: 0.76rem;" onclick="this.closest('.t3d-q-builder-card').remove()">🗑️ Quitar Pregunta</button>` : ''}
      </div>

      <input type="text" class="t3d-form-input t3d-iq-text" placeholder="Escribe el enunciado de la pregunta aquí... (Ej: ¿Cuál es el resultado de 15 × 12?)" style="margin-bottom: 0.85rem; font-size: 0.95rem; font-weight: 650;" />

      <div class="t3d-kahoot-grid">
        ${tileConfig.map((cfg, oi) => `
          <div class="t3d-kahoot-tile ${cfg.class}">
            <div class="t3d-tile-badge">${cfg.shape}</div>
            <input type="text" class="t3d-form-input t3d-iq-opt" placeholder="${cfg.label}${oi < 2 ? ' *' : ' (opcional)'}" style="background: rgba(255,255,255,0.92); color: #0f172a; font-weight: 650; font-size: 0.86rem; border: none;" />
            <label class="t3d-tile-radio" title="Marcar como respuesta correcta">
              <input type="radio" name="correct_${rowUid}" value="${oi}" ${oi === 0 ? 'checked' : ''} />
              <span class="t3d-tile-radio-custom"></span>
            </label>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 0.55rem; font-size: 0.75rem; color: var(--t3d-text-sub); display: flex; align-items: center; gap: 0.4rem;">
        <span>🎯 Haz clic en el círculo de la opción que sea la respuesta correcta.</span>
      </div>
    `;
    container.appendChild(row);
  },

  closeNewGroupModal() {
    const modal = document.getElementById('teacher-new-group-modal');
    if (modal) modal.style.display = 'none';
  },

  async saveNewGroup() {
    const nameInput = document.getElementById('t3d-new-group-name');
    const countInput = document.getElementById('t3d-new-group-count');
    const avgInput = document.getElementById('t3d-new-group-avg');
    const codeInput = document.getElementById('t3d-new-group-code');
    const hiddenExamId = document.getElementById('t3d-new-group-selected-exam-id');

    const name = (nameInput?.value || '').trim();
    if (!name) {
      alert('⚠️ Por favor escribe el nombre del grupo.');
      if (nameInput) nameInput.focus();
      return;
    }

    const cleanCode = String(codeInput?.value || this.generateGroupAccessCode()).replace(/\D/g, '').trim() || this.generateGroupAccessCode();
    if (cleanCode.length < 4) {
      alert('⚠️ El código de acceso debe tener al menos 4 dígitos numéricos.');
      if (codeInput) codeInput.focus();
      return;
    }

    const u = window.appState?.currentUser || {};
    let chosenExam = null;

    if (this.newGroupExamMode === 'create') {
      const exTitle = (document.getElementById('t3d-inline-exam-title')?.value || '').trim();
      const exTime = parseInt(document.getElementById('t3d-inline-exam-time')?.value);
      const qRows = Array.from(document.querySelectorAll('.t3d-q-builder-card, .t3d-inline-q-row'));
      if (!exTitle) {
        alert('⚠️ Escribe el título del nuevo examen.');
        document.getElementById('t3d-inline-exam-title')?.focus();
        return;
      }

      const shapes = ['✦', '⬢', '⚡', '🛡️'];
      const colors = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];
      const parsedQuestions = [];

      for (const row of qRows) {
        const qText = (row.querySelector('.t3d-iq-text')?.value || '').trim();
        const optInputs = Array.from(row.querySelectorAll('.t3d-iq-opt'));
        const checkedRadio = row.querySelector('input[type="radio"]:checked');
        const rawCorrectIdx = checkedRadio ? parseInt(checkedRadio.value) : 0;

        const validOptions = [];
        let mappedCorrect = 0;
        optInputs.forEach((inp, idx) => {
          const t = (inp.value || '').trim();
          if (t) {
            if (idx === rawCorrectIdx) mappedCorrect = validOptions.length;
            validOptions.push({ text: t, shape: shapes[validOptions.length] || '✦', color: colors[validOptions.length] || 'opt-1' });
          }
        });

        if (qText && validOptions.length >= 2) {
          parsedQuestions.push({
            id: 'q_' + Date.now() + '_' + parsedQuestions.length,
            text: qText,
            options: validOptions,
            correctAnswer: mappedCorrect,
            timeLimit: isNaN(exTime) ? 20 : exTime
          });
        }
      }

      if (parsedQuestions.length === 0) {
        alert('⚠️ Agrega al menos 1 pregunta completa con mínimo 2 opciones de respuesta.');
        return;
      }

      chosenExam = {
        id: 'exam_' + Date.now(),
        title: exTitle,
        description: `Examen creado para el grupo ${name.toUpperCase()}`,
        category: 'general',
        categoryName: 'General',
        projectType: 'quiz',
        approvalStatus: 'approved',
        isPublic: true,
        timePerQuestion: isNaN(exTime) ? 20 : exTime,
        questions: parsedQuestions,
        author: u.name || 'Docente',
        authorAvatar: u.avatar || '👨‍🏫',
        authorId: u.id || 'teacher_1',
        authorEmail: u.email || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        plays: 0
      };

      if (!Array.isArray(window.appState.challenges)) window.appState.challenges = [];
      window.appState.challenges.unshift(chosenExam);
      if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);

      try {
        await fetch(this.getApiBaseUrl(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chosenExam)
        });
      } catch (e) {}
    } else {
      const allRealExams = this.getAllRealExams();
      const chosenExamId = (hiddenExamId?.value) || (this.selectedExamIdForNewGroup) || '';
      if (allRealExams.length > 0 && !chosenExamId) {
        alert('⚠️ Por favor selecciona qué examen va a ir en este grupo.');
        return;
      }
      chosenExam = allRealExams.find(ex => String(ex.id) === String(chosenExamId)) || allRealExams[0] || null;
    }

    const count = parseInt(countInput?.value) || 30;
    const avg = parseInt(avgInput?.value) || 80;

    const newGroup = {
      id: 'group_' + Date.now(),
      name: name.toUpperCase(),
      studentsCount: count,
      avgScore: avg,
      accessCode: cleanCode,
      examId: chosenExam ? chosenExam.id : null,
      examIds: chosenExam ? [chosenExam.id] : [],
      lastChallenge: chosenExam ? chosenExam.title : '',
      teacherId: u.id || 'teacher_1',
      teacherEmail: u.email || '',
      teacherName: u.name || 'Docente',
      students: [],
      updatedAt: Date.now()
    };

    if (!window.appState.groups) window.appState.groups = [];
    window.appState.groups.unshift(newGroup);
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);

    this.closeNewGroupModal();
    this.render(true);
    await this.pushGroupToCloud(newGroup);
  },

  newGroupModal() {
    this.openNewGroupModal();
  },

  /* ==========================================================================
     MODAL EDITAR GRUPO Y GESTIONAR EXÁMENES DINÁMICAMENTE
     ========================================================================== */
  openEditGroupModal(groupId) {
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (!group) return;
    this.editingGroupId = groupId;

    const modal = document.getElementById('teacher-edit-group-modal');
    document.getElementById('t3d-edit-group-name').value = group.name || '';
    document.getElementById('t3d-edit-group-count').value = group.studentsCount || 30;
    document.getElementById('t3d-edit-group-avg').value = group.avgScore || 80;
    document.getElementById('t3d-edit-group-code').value = group.accessCode || this.generateGroupAccessCode();

    this.renderEditingGroupExamsList();
    if (modal) modal.style.display = 'flex';
  },

  closeEditGroupModal() {
    const modal = document.getElementById('teacher-edit-group-modal');
    if (modal) modal.style.display = 'none';
    this.editingGroupId = null;
  },

  renderEditingGroupExamsList() {
    const listEl = document.getElementById('t3d-edit-group-exams-list');
    const group = (window.appState.groups || []).find(g => g.id === this.editingGroupId);
    if (!listEl || !group) return;

    const assigned = this.getGroupAssignedExams(group);
    const active = this.getGroupActiveExam(group);

    if (assigned.length === 0) {
      listEl.innerHTML = `<div style="font-size: 0.88rem; padding: 1rem; text-align: center; color: var(--t3d-text-sub); background: rgba(148,163,184,0.06); border-radius: 12px;">⚠️ No hay exámenes asignados todavía. Selecciona uno abajo y pulsa "➕ Añadir Examen".</div>`;
      return;
    }

    listEl.innerHTML = assigned.map(ex => {
      const isActive = active && String(active.id) === String(ex.id);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 14px; border: 2px solid ${isActive ? '#3b82f6' : 'rgba(148,163,184,0.25)'}; background: ${isActive ? 'rgba(59, 130, 246, 0.12)' : 'var(--t3d-surface-card)'}; box-shadow: ${isActive ? '0 0 16px rgba(59,130,246,0.25)' : 'none'};">
          <div style="min-width: 0; flex: 1;">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.2rem;">
              <span style="font-size: 1.1rem;">${isActive ? '🎯' : '📝'}</span>
              <div style="font-weight: 850; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: var(--t3d-text-main);">
                ${ex.title}
              </div>
              ${isActive ? '<span class="t3d-badge-pill" style="background: rgba(59,130,246,0.2); color: #3b82f6; font-size: 0.72rem; padding: 0.15rem 0.55rem;">ACTIVO</span>' : ''}
            </div>
            <div style="font-size: 0.78rem; color: var(--t3d-text-sub); display: flex; align-items: center; gap: 0.5rem;">
              <span>${ex.questions.length} preguntas</span>
              <span>•</span>
              <span>👤 ${ex.author || 'Docente'}</span>
            </div>
          </div>
          <div style="display: flex; gap: 0.45rem; align-items: center;">
            <button type="button" class="t3d-btn t3d-btn-amber" style="padding: 0.4rem 0.65rem; font-size: 0.78rem;" onclick="window.TeacherView.closeEditGroupModal(); window.TeacherView.editExam('${ex.id}')" title="Editar preguntas y contenido de este examen">
              ✏️
            </button>
            ${!isActive ? `
              <button type="button" class="t3d-btn t3d-btn-primary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;" onclick="window.TeacherView.setActiveExamForEditingGroup('${ex.id}')">
                🎯 Activar
              </button>
            ` : ''}
            <button type="button" class="t3d-btn t3d-btn-outline" style="padding: 0.4rem 0.65rem; font-size: 0.78rem; color: #ef4444; border-color: rgba(239,68,68,0.4);" onclick="window.TeacherView.removeExamFromEditingGroup('${ex.id}')" title="Quitar examen del grupo">
              🗑️
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  addExamToEditingGroup() {
    const group = (window.appState.groups || []).find(g => g.id === this.editingGroupId);
    const select = document.getElementById('t3d-edit-add-exam-select');
    const examId = select?.value;
    if (!group || !examId) return;

    if (!Array.isArray(group.examIds)) group.examIds = [];
    if (group.examId && !group.examIds.includes(group.examId)) group.examIds.push(group.examId);
    if (!group.examIds.includes(examId)) group.examIds.push(examId);
    group.examId = examId; // El recién añadido pasa a ser el examen activo

    const ex = (window.appState.challenges || []).find(c => String(c.id) === String(examId));
    if (ex) group.lastChallenge = ex.title;
    group.updatedAt = Date.now();

    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    if (select) select.value = '';
    this.renderEditingGroupExamsList();
  },

  setActiveExamForEditingGroup(examId) {
    const group = (window.appState.groups || []).find(g => g.id === this.editingGroupId);
    if (!group) return;
    group.examId = examId;
    const ex = (window.appState.challenges || []).find(c => String(c.id) === String(examId));
    if (ex) group.lastChallenge = ex.title;
    group.updatedAt = Date.now();
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    this.renderEditingGroupExamsList();
  },

  removeExamFromEditingGroup(examId) {
    const group = (window.appState.groups || []).find(g => g.id === this.editingGroupId);
    if (!group) return;
    group.examIds = (group.examIds || []).filter(id => String(id) !== String(examId));
    if (String(group.examId) === String(examId)) {
      group.examId = group.examIds[0] || null;
      const nextEx = (window.appState.challenges || []).find(c => String(c.id) === String(group.examId));
      group.lastChallenge = nextEx ? nextEx.title : '';
    }
    group.updatedAt = Date.now();
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    this.renderEditingGroupExamsList();
  },

  async saveEditGroup() {
    const group = (window.appState.groups || []).find(g => g.id === this.editingGroupId);
    if (!group) return;

    const name = (document.getElementById('t3d-edit-group-name')?.value || '').trim();
    if (!name) {
      alert('⚠️ El nombre del grupo no puede estar vacío.');
      return;
    }

    const code = String(document.getElementById('t3d-edit-group-code')?.value || group.accessCode || '').replace(/\D/g, '').trim();
    if (code.length < 4) {
      alert('⚠️ El código debe tener al menos 4 dígitos numéricos.');
      return;
    }

    group.name = name.toUpperCase();
    group.studentsCount = parseInt(document.getElementById('t3d-edit-group-count')?.value) || 30;
    group.avgScore = parseInt(document.getElementById('t3d-edit-group-avg')?.value) || 80;
    group.accessCode = code;
    group.updatedAt = Date.now();

    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    this.closeEditGroupModal();
    this.render(true);
    await this.pushGroupToCloud(group);
  },

  async deleteEditingGroup() {
    const groupId = this.editingGroupId;
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (!group) return;
    if (!confirm(`¿Seguro que deseas eliminar el grupo "${group.name}"?`)) return;

    window.appState.groups = (window.appState.groups || []).filter(g => g.id !== groupId);
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);

    this.closeEditGroupModal();
    this.render(true);
    await this.deleteGroupFromCloud(groupId);
  },

  /* ==========================================================================
     MODAL AÑADIR ESTUDIANTE MANUALMENTE
     ========================================================================== */
  openAddStudentModal(groupId) {
    this.activeGroupForStudent = groupId;
    const modal = document.getElementById('teacher-add-student-modal');
    const nameInput = document.getElementById('t3d-student-name-input');
    if (nameInput) nameInput.value = '';
    if (modal) modal.style.display = 'flex';
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  },

  closeAddStudentModal() {
    const modal = document.getElementById('teacher-add-student-modal');
    if (modal) modal.style.display = 'none';
  },

  async saveNewStudent() {
    const groupId = this.activeGroupForStudent;
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (!group) return;

    const nameInput = document.getElementById('t3d-student-name-input');
    const avatarSelect = document.getElementById('t3d-student-avatar-select');
    const pointsInput = document.getElementById('t3d-student-points-input');

    const name = (nameInput?.value || '').trim();
    if (!name) {
      alert('⚠️ Escribe el nombre del alumno.');
      if (nameInput) nameInput.focus();
      return;
    }

    const avatar = avatarSelect?.value || '🦊';
    const points = parseInt(pointsInput?.value) || 1000;

    if (!group.students) group.students = [];
    group.students.push({
      id: 'st_' + Date.now(),
      name: name,
      avatar: avatar,
      points: points,
      played: 1,
      email: `${name.toLowerCase().replace(/\s+/g, '.')}@colegio.edu.co`
    });

    group.studentsCount = Math.max(parseInt(group.studentsCount) || 0, group.students.length);
    group.updatedAt = Date.now();

    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    this.closeAddStudentModal();
    this.render(true);
    await this.pushGroupToCloud(group);
  },

  // ==========================================================================
  // MÓDULO: DETALLES Y ALEATORIZACIÓN INTELIGENTE DE PREGUNTAS Y RESPUESTAS
  // ==========================================================================
  canConfigureExam(exam) {
    if (!exam) return false;
    const u = window.appState?.currentUser;
    const isAdmin = Boolean(u && (['admin', 'administrador'].includes(String(u.role).toLowerCase()) || u.isAdmin === true));
    if (isAdmin) return true;
    const isMine = this.isOwnedByCurrentTeacher(exam);
    const isOwner = Boolean(window.appRouter && typeof window.appRouter.isChallengeOwner === 'function' && window.appRouter.isChallengeOwner(exam));
    return isMine || isOwner;
  },

  openExamDetailsModal(examId) {
    if (window.ExamDetailsView && typeof window.ExamDetailsView.open === 'function') {
      window.ExamDetailsView.open(examId, 'config');
      return;
    }
    let exam = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(examId).trim());
    if (!exam && typeof DEFAULT_CHALLENGES !== 'undefined') {
      exam = DEFAULT_CHALLENGES.find(c => c && String(c.id).trim() === String(examId).trim());
    }
    if (!exam) {
      alert('⚠️ No se encontró la información del examen.');
      return;
    }

    if (!this.canConfigureExam(exam)) {
      alert('🔒 Solo el administrador o el creador de este examen puede configurar sus detalles y aleatorización.');
      return;
    }

    const totalAvailable = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const defaultPerStudent = totalAvailable > 0 ? Math.min(10, totalAvailable) : 1;

    if (!exam.randomizationConfig || typeof exam.randomizationConfig !== 'object') {
      exam.randomizationConfig = {
        enabled: true,
        questionsPerStudent: defaultPerStudent,
        shuffleQuestions: true,
        shuffleOptions: true,
        mandatoryQuestionIds: [],
        distributionEnabled: false,
        distributionRules: []
      };
    } else {
      if (typeof exam.randomizationConfig.enabled !== 'boolean') exam.randomizationConfig.enabled = true;
      const curCount = parseInt(exam.randomizationConfig.questionsPerStudent, 10);
      exam.randomizationConfig.questionsPerStudent = (!curCount || curCount < 1)
        ? defaultPerStudent
        : (totalAvailable > 0 ? Math.min(curCount, totalAvailable) : curCount);
      if (typeof exam.randomizationConfig.shuffleQuestions !== 'boolean') exam.randomizationConfig.shuffleQuestions = true;
      if (typeof exam.randomizationConfig.shuffleOptions !== 'boolean') exam.randomizationConfig.shuffleOptions = true;
      if (!Array.isArray(exam.randomizationConfig.mandatoryQuestionIds)) exam.randomizationConfig.mandatoryQuestionIds = [];
      if (typeof exam.randomizationConfig.distributionEnabled !== 'boolean') exam.randomizationConfig.distributionEnabled = false;
      if (!Array.isArray(exam.randomizationConfig.distributionRules)) exam.randomizationConfig.distributionRules = [];
    }

    // Trabajar sobre un borrador editable para que cancelar no altere nada hasta guardar
    this.activeExamForDetails = exam;
    this.draftRandomizationConfig = JSON.parse(JSON.stringify(exam.randomizationConfig));

    this.ensureRandomizeModalsInDOM();
    this.renderRandomizeModalContent();

    const modal = document.getElementById('teacher-randomize-modal');
    if (modal) {
      modal.style.display = 'flex';
      const isDark = document.body.classList.contains('teacher-theme-dark') ||
                     document.getElementById('view-teacher')?.classList.contains('teacher-theme-dark') ||
                     document.querySelector('.teacher-panel-wrapper')?.classList.contains('teacher-theme-dark') ||
                     !document.body.classList.contains('light-theme');
      modal.classList.toggle('teacher-theme-dark', isDark);
    }
    this.updateSimulationPreview();
  },

  closeExamDetailsModal() {
    const modal = document.getElementById('teacher-randomize-modal');
    if (modal) modal.style.display = 'none';
  },

  ensureRandomizeModalsInDOM() {
    if (!document.getElementById('teacher-randomize-modal')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div id="teacher-randomize-modal" class="t3d-modal-backdrop" style="display: none; z-index: 10020;">
          <div class="t3d-modal-window is-rand-modal" id="teacher-randomize-modal-content"></div>
        </div>
      `;
      document.body.appendChild(wrap.firstElementChild);
    }
    if (!document.getElementById('teacher-mandatory-modal')) {
      const wrap2 = document.createElement('div');
      wrap2.innerHTML = `
        <div id="teacher-mandatory-modal" class="t3d-modal-backdrop" style="display: none; z-index: 10030;">
          <div class="t3d-modal-window" style="max-width: 680px; width: 92vw; max-height: 85vh; overflow-y: auto;">
            <div class="t3d-modal-header">
              <h3 class="t3d-modal-title">
                <span>📌</span>
                <span>Seleccionar Preguntas Obligatorias</span>
              </h3>
              <button class="t3d-modal-close" onclick="window.TeacherView.closeMandatoryModal()">&times;</button>
            </div>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Estas preguntas aparecerán <strong>siempre</strong> en la evaluación de cada estudiante, antes de completar el cupo con preguntas aleatorias.
            </p>
            <div id="teacher-mandatory-list" style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 50vh; overflow-y: auto; padding-right: 0.35rem;"></div>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.5rem; padding-top: 1rem; border-top: 1px solid rgba(148,163,184,0.2);">
              <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.closeMandatoryModal()">
                <span>Listo</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap2.firstElementChild);
    }
  },

  renderDistributionRowsHtml(rules, existingTopics) {
    if (!Array.isArray(rules) || rules.length === 0) {
      return `
        <tr>
          <td colspan="4" style="text-align: center; padding: 1rem; color: #94a3b8; font-size: 0.82rem;">
            No hay reglas definidas aún. Pulsa "+ Agregar regla" para distribuir por temática y dificultad.
          </td>
        </tr>
      `;
    }
    return rules.map((r, idx) => {
      const diff = (r.difficulty || 'media').toLowerCase();
      const diffClass = diff === 'baja' ? 'is-baja' : (diff === 'alta' ? 'is-alta' : 'is-media');
      const topicVal = (r.topic || existingTopics[0] || 'General').replace(/"/g, '&quot;');
      const topicOptions = Array.from(new Set([r.topic, ...existingTopics, 'Programación', 'Bases de Datos', 'Redes', 'General'].filter(Boolean)));
      return `
        <tr>
          <td>
            <select class="t3d-rand-input-sm" onchange="window.TeacherView.onDistributionRuleChange(${idx}, 'topic', this.value)">
              ${topicOptions.map(t => `<option value="${String(t).replace(/"/g, '&quot;')}" ${t === topicVal ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </td>
          <td>
            <select class="t3d-rand-select-diff ${diffClass}" onchange="window.TeacherView.onDistributionRuleChange(${idx}, 'difficulty', this.value)">
              <option value="baja" ${diff === 'baja' ? 'selected' : ''}>Baja</option>
              <option value="media" ${diff === 'media' ? 'selected' : ''}>Media</option>
              <option value="alta" ${diff === 'alta' ? 'selected' : ''}>Alta</option>
            </select>
          </td>
          <td>
            <input type="number" class="t3d-rand-input-sm" min="1" max="100" value="${parseInt(r.count, 10) || 1}" onchange="window.TeacherView.onDistributionRuleChange(${idx}, 'count', parseInt(this.value, 10) || 1)" />
          </td>
          <td style="text-align: center;">
            <button type="button" class="t3d-rand-btn-del-rule" title="Eliminar regla" onclick="window.TeacherView.removeDistributionRule(${idx})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderRandomizeModalContent() {
    const exam = this.activeExamForDetails;
    const cfg = this.draftRandomizationConfig;
    if (!exam || !cfg) return;

    const total = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const mandatoryCount = (cfg.mandatoryQuestionIds || []).length;
    const content = document.getElementById('teacher-randomize-modal-content');
    if (!content) return;

    const existingTopics = Array.from(new Set((exam.questions || []).map(q => q.topic || q.category || exam.categoryName || 'General').filter(Boolean)));
    if (existingTopics.length === 0) existingTopics.push('General');

    // Consultar intentos registrados para trazabilidad
    let attempts = [];
    try {
      const rawAtt = localStorage.getItem(`mentix_exam_attempts_${exam.id}`);
      if (rawAtt) attempts = JSON.parse(rawAtt) || [];
    } catch (e) {}

    content.innerHTML = `
      <!-- Barra superior con breadcrumb y botones de acción -->
      <div class="t3d-rand-topbar">
        <div class="t3d-rand-brand-crumbs">
          <span>🎓 Plataforma Educativa</span>
          <span>›</span>
          <span>Cuestionarios</span>
          <span>›</span>
          <strong>Configurar cuestionario: ${(exam.title || 'Examen').replace(/</g, '&lt;')}</strong>
        </div>
        <div class="t3d-rand-topbar-actions">
          <button type="button" class="t3d-rand-btn-preview" onclick="window.TeacherView.previewRandomizedExam('${exam.id}')" title="Probar evaluación aleatorizada como estudiante">
            <span>👁️</span>
            <span>Vista previa</span>
          </button>
          <button type="button" class="t3d-rand-btn-save" onclick="window.TeacherView.saveExamRandomization('${exam.id}')" title="Guardar cambios">
            <span>💾</span>
            <span>Guardar cambios</span>
          </button>
          <button class="t3d-modal-close" style="font-size: 1.6rem; margin-left: 0.35rem;" onclick="window.TeacherView.closeExamDetailsModal()">&times;</button>
        </div>
      </div>

      <!-- Layout 2 Columnas -->
      <div class="t3d-rand-layout">
        <!-- COLUMNA IZQUIERDA -->
        <div class="t3d-rand-main-card">
          <div class="t3d-rand-header-row">
            <div class="t3d-rand-header-ico">🎲</div>
            <div>
              <h2 class="t3d-rand-header-title">Aleatorización de preguntas y respuestas</h2>
              <p class="t3d-rand-header-sub">Personaliza la evaluación para que cada estudiante reciba un cuestionario distinto.</p>
            </div>
          </div>

          <!-- 1. Selección aleatoria de preguntas -->
          <div class="t3d-rand-setting-box">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">🎲</div>
              <div>
                <h4 class="t3d-rand-setting-title">Selección aleatoria de preguntas</h4>
                <p class="t3d-rand-setting-desc">El sistema elegirá automáticamente las preguntas del banco.</p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" id="t3d-rand-enable-toggle" ${cfg.enabled ? 'checked' : ''} onchange="window.TeacherView.onRandomizeConfigChange('enabled', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- Estadísticas: Preguntas disponibles y Preguntas por estudiante -->
          <div class="t3d-rand-stats-row">
            <div class="t3d-rand-stat-card">
              <div class="t3d-rand-stat-ico">📚</div>
              <div class="t3d-rand-stat-content">
                <div class="t3d-rand-stat-label">Preguntas disponibles</div>
                <div class="t3d-rand-stat-num" id="t3d-rand-disp-total">${total}</div>
              </div>
            </div>
            <div class="t3d-rand-stat-card">
              <div class="t3d-rand-stat-ico">📋</div>
              <div class="t3d-rand-stat-content">
                <div class="t3d-rand-stat-label">Preguntas por estudiante <span style="color:#ef4444;">*</span></div>
                <input
                  type="number"
                  id="t3d-rand-input-count"
                  class="t3d-rand-stat-input"
                  value="${cfg.questionsPerStudent}"
                  min="1"
                  max="${Math.max(1, total)}"
                  oninput="window.TeacherView.onRandomizeConfigChange('questionsPerStudent', parseInt(this.value, 10) || 1)"
                />
                <div class="t3d-rand-stat-hint" id="t3d-rand-count-hint">Cada estudiante responderá ${cfg.questionsPerStudent} de ${total} preguntas.</div>
              </div>
            </div>
          </div>

          <!-- 2. Orden aleatorio de preguntas -->
          <div class="t3d-rand-setting-box">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">🔀</div>
              <div>
                <h4 class="t3d-rand-setting-title">Orden aleatorio de preguntas</h4>
                <p class="t3d-rand-setting-desc">Las preguntas se mostrarán en un orden diferente para cada estudiante.</p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" id="t3d-rand-shuffle-q-toggle" ${cfg.shuffleQuestions ? 'checked' : ''} onchange="window.TeacherView.onRandomizeConfigChange('shuffleQuestions', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- 3. Orden aleatorio de opciones de respuesta -->
          <div class="t3d-rand-setting-box">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">🔤</div>
              <div>
                <h4 class="t3d-rand-setting-title">Orden aleatorio de opciones de respuesta</h4>
                <p class="t3d-rand-setting-desc">Las opciones (A, B, C, D, ...) se mostrarán en distinto orden.</p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" id="t3d-rand-shuffle-opt-toggle" ${cfg.shuffleOptions ? 'checked' : ''} onchange="window.TeacherView.onRandomizeConfigChange('shuffleOptions', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- 4. Preguntas obligatorias -->
          <div class="t3d-rand-setting-box">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">📌</div>
              <div>
                <h4 class="t3d-rand-setting-title">Preguntas obligatorias</h4>
                <p class="t3d-rand-setting-desc">Selecciona preguntas que siempre deberán aparecer en el cuestionario.</p>
              </div>
            </div>
            <button type="button" class="t3d-rand-btn-select-pill" onclick="window.TeacherView.openMandatoryModal()">
              <span id="t3d-rand-mandatory-badge">Seleccionar (${mandatoryCount})</span>
              <span>›</span>
            </button>
          </div>

          <!-- 5. Distribución por temática y dificultad (opcional) -->
          <div class="t3d-rand-setting-box" style="flex-direction: column; align-items: stretch;">
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 1rem;">
              <div class="t3d-rand-setting-info">
                <div class="t3d-rand-setting-ico">🎛️</div>
                <div>
                  <h4 class="t3d-rand-setting-title">Distribución por temática y dificultad (opcional)</h4>
                  <p class="t3d-rand-setting-desc">Define la cantidad de preguntas por temática y nivel.</p>
                </div>
              </div>
              <label class="t3d-ios-switch">
                <input type="checkbox" id="t3d-rand-dist-toggle" ${cfg.distributionEnabled ? 'checked' : ''} onchange="window.TeacherView.onRandomizeConfigChange('distributionEnabled', this.checked)">
                <span class="t3d-ios-slider"></span>
              </label>
            </div>

            <div id="t3d-rand-dist-rules-container" style="${cfg.distributionEnabled ? 'display: block;' : 'display: none;'}">
              <div class="t3d-rand-dist-table-wrap">
                <table class="t3d-rand-dist-table">
                  <thead>
                    <tr>
                      <th style="width: 44%;">Temática</th>
                      <th style="width: 30%;">Dificultad</th>
                      <th style="width: 16%;">Cantidad</th>
                      <th style="width: 10%;"></th>
                    </tr>
                  </thead>
                  <tbody id="t3d-rand-dist-tbody">
                    ${this.renderDistributionRowsHtml(cfg.distributionRules, existingTopics)}
                  </tbody>
                </table>
              </div>
              <button type="button" class="t3d-rand-btn-add-rule" onclick="window.TeacherView.addDistributionRule()">
                <span>+</span>
                <span>Agregar regla</span>
              </button>
            </div>
          </div>

          ${attempts.length > 0 ? `
            <div class="t3d-rand-setting-box" style="flex-direction: column; align-items: stretch; margin-top: 0.9rem;">
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div class="t3d-rand-setting-info">
                  <div class="t3d-rand-setting-ico">🧾</div>
                  <div>
                    <h4 class="t3d-rand-setting-title">Trazabilidad de intentos (${attempts.length})</h4>
                    <p class="t3d-rand-setting-desc">Cuestionarios exactos generados recientemente para cada estudiante.</p>
                  </div>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem; max-height: 150px; overflow-y: auto; margin-top: 0.5rem;">
                ${attempts.slice(-6).reverse().map(att => `
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; font-size: 0.78rem; padding: 0.45rem 0.7rem; border-radius: 10px; background: rgba(124, 58, 237, 0.08); border: 1px solid rgba(124, 58, 237, 0.2);">
                    <span><strong>👤 ${(att.studentName || 'Estudiante').replace(/</g, '&lt;')}</strong> (${att.questionNumbers?.length || 0} preg.)</span>
                    <span style="font-family: monospace; opacity: 0.85;">[#${(att.questionNumbers || []).join(', #')}]</span>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <!-- COLUMNA DERECHA -->
        <div class="t3d-rand-right-col">
          <!-- Tarjeta 1: ¿Cómo funciona? -->
          <div class="t3d-rand-card-how">
            <h3 class="t3d-rand-card-how-title">
              <span>🎯</span>
              <span>¿Cómo funciona?</span>
            </h3>
            <p class="t3d-rand-card-how-p" id="t3d-rand-how-text">
              Con un banco de <strong>${total}</strong> preguntas y una evaluación de <strong>${cfg.questionsPerStudent}</strong> preguntas, cada estudiante recibirá una selección aleatoria de <strong>${cfg.questionsPerStudent}</strong> preguntas, con un orden distinto y opciones de respuesta reordenadas.
            </p>
          </div>

          <!-- Tarjeta 2: Vista previa de la aleatorización -->
          <div class="t3d-rand-card-preview">
            <div class="t3d-rand-card-prev-title">
              <div style="display: flex; align-items: center; gap: 0.45rem;">
                <span>👁️</span>
                <span>Vista previa de la aleatorización</span>
              </div>
              <button
                type="button"
                class="t3d-btn-details-badge"
                style="padding: 0.22rem 0.6rem; font-size: 0.72rem;"
                onclick="window.TeacherView.updateSimulationPreview()"
                title="Regenerar simulación"
              >
                🔄 Simular
              </button>
            </div>

            <div class="t3d-rand-prev-box">
              <div class="t3d-rand-prev-box-label">
                <span>📚</span>
                <span>Banco de preguntas (${total})</span>
              </div>
              <div class="t3d-sim-chips-container" id="t3d-sim-bank-chips"></div>
            </div>

            <div class="t3d-rand-arrow-down">↓</div>

            <div class="t3d-rand-engine-box">
              <div class="t3d-rand-engine-title">
                <span>🎲</span>
                <span>Motor de aleatorización</span>
              </div>
              <div class="t3d-rand-engine-desc" id="t3d-sim-engine-desc">
                Selección de ${cfg.questionsPerStudent} preguntas por estudiante y orden aleatorio de respuestas
              </div>
            </div>

            <div class="t3d-rand-arrow-down">↓</div>

            <div class="t3d-rand-student-row s1">
              <div class="t3d-rand-student-header"><span>👤</span><span>Estudiante 1</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student1-chips"></div>
            </div>

            <div class="t3d-rand-student-row s2">
              <div class="t3d-rand-student-header"><span>👤</span><span>Estudiante 2</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student2-chips"></div>
            </div>

            <div class="t3d-rand-student-row s3">
              <div class="t3d-rand-student-header"><span>👤</span><span>Estudiante 3</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student3-chips"></div>
            </div>
          </div>

          <!-- Tarjeta 3: Beneficios -->
          <div class="t3d-rand-card-benefits">
            <h3 class="t3d-rand-card-ben-title">
              <span>✅</span>
              <span>Beneficios</span>
            </h3>
            <ul class="t3d-rand-ben-list">
              <li><span>✓</span> Evaluaciones individualizadas.</li>
              <li><span>✓</span> Reduce la copia entre estudiantes.</li>
              <li><span>✓</span> Mantiene la calificación automática.</li>
              <li><span>✓</span> Registra y conserva el cuestionario de cada intento.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  onRandomizeConfigChange(field, value) {
    if (!this.draftRandomizationConfig || !this.activeExamForDetails) return;
    const total = Array.isArray(this.activeExamForDetails.questions) ? this.activeExamForDetails.questions.length : 0;

    if (field === 'questionsPerStudent') {
      let n = parseInt(value, 10) || 1;
      if (n < 1) n = 1;
      if (total > 0 && n > total) n = total;
      this.draftRandomizationConfig.questionsPerStudent = n;

      const hint = document.getElementById('t3d-rand-count-hint');
      if (hint) hint.textContent = `Cada estudiante responderá ${n} de ${total} preguntas.`;
      const how = document.getElementById('t3d-rand-how-text');
      if (how) {
        how.innerHTML = `Con un banco de <strong>${total}</strong> preguntas y una evaluación de <strong>${n}</strong> preguntas, cada estudiante recibirá una selección aleatoria de <strong>${n}</strong> preguntas, con un orden distinto y opciones de respuesta reordenadas.`;
      }
      const eng = document.getElementById('t3d-sim-engine-desc');
      if (eng) {
        eng.textContent = `Selección de ${n} preguntas por estudiante y ${this.draftRandomizationConfig.shuffleOptions ? 'orden aleatorio de respuestas' : 'orden fijo de respuestas'}`;
      }
    } else {
      this.draftRandomizationConfig[field] = value;
      if (field === 'distributionEnabled') {
        const cont = document.getElementById('t3d-rand-dist-rules-container');
        if (cont) cont.style.display = value ? 'block' : 'none';
        if (value && (!this.draftRandomizationConfig.distributionRules || this.draftRandomizationConfig.distributionRules.length === 0)) {
          this.addDistributionRule();
          return;
        }
      }
    }

    this.updateSimulationPreview();
  },

  addDistributionRule() {
    if (!this.draftRandomizationConfig || !this.activeExamForDetails) return;
    if (!Array.isArray(this.draftRandomizationConfig.distributionRules)) {
      this.draftRandomizationConfig.distributionRules = [];
    }
    const existingTopics = Array.from(new Set((this.activeExamForDetails.questions || []).map(q => q.topic || q.category || this.activeExamForDetails.categoryName || 'General').filter(Boolean)));
    const defaultTopic = existingTopics[this.draftRandomizationConfig.distributionRules.length % existingTopics.length] || 'General';
    const diffs = ['media', 'alta', 'baja'];
    const defaultDiff = diffs[this.draftRandomizationConfig.distributionRules.length % diffs.length];

    this.draftRandomizationConfig.distributionRules.push({
      topic: defaultTopic,
      difficulty: defaultDiff,
      count: 2
    });
    const tbody = document.getElementById('t3d-rand-dist-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderDistributionRowsHtml(this.draftRandomizationConfig.distributionRules, existingTopics);
    }
    this.updateSimulationPreview();
  },

  removeDistributionRule(idx) {
    if (!this.draftRandomizationConfig || !Array.isArray(this.draftRandomizationConfig.distributionRules)) return;
    this.draftRandomizationConfig.distributionRules.splice(idx, 1);
    const existingTopics = Array.from(new Set((this.activeExamForDetails?.questions || []).map(q => q.topic || q.category || this.activeExamForDetails?.categoryName || 'General').filter(Boolean)));
    const tbody = document.getElementById('t3d-rand-dist-tbody');
    if (tbody) {
      tbody.innerHTML = this.renderDistributionRowsHtml(this.draftRandomizationConfig.distributionRules, existingTopics);
    }
    this.updateSimulationPreview();
  },

  onDistributionRuleChange(idx, field, value) {
    if (!this.draftRandomizationConfig?.distributionRules?.[idx]) return;
    this.draftRandomizationConfig.distributionRules[idx][field] = value;
    if (field === 'difficulty') {
      const existingTopics = Array.from(new Set((this.activeExamForDetails?.questions || []).map(q => q.topic || q.category || this.activeExamForDetails?.categoryName || 'General').filter(Boolean)));
      const tbody = document.getElementById('t3d-rand-dist-tbody');
      if (tbody) {
        tbody.innerHTML = this.renderDistributionRowsHtml(this.draftRandomizationConfig.distributionRules, existingTopics);
      }
    }
    this.updateSimulationPreview();
  },

  openMandatoryModal() {
    const exam = this.activeExamForDetails;
    const cfg = this.draftRandomizationConfig;
    if (!exam || !cfg) return;
    const modal = document.getElementById('teacher-mandatory-modal');
    const list = document.getElementById('teacher-mandatory-list');
    if (!modal || !list) return;

    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const selectedSet = new Set((cfg.mandatoryQuestionIds || []).map(String));

    if (questions.length === 0) {
      list.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:1.5rem;">Este examen aún no tiene preguntas en el banco.</p>`;
    } else {
      list.innerHTML = questions.map((q, idx) => {
        const qKey = String(q.id || idx);
        const checked = selectedSet.has(qKey);
        const text = (q.text || q.question || `Pregunta #${idx + 1}`).replace(/</g, '&lt;');
        return `
          <label style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:12px; border:1.5px solid ${checked ? '#7c3aed' : 'rgba(148,163,184,0.3)'}; background:${checked ? 'rgba(124,58,237,0.08)' : 'transparent'}; cursor:pointer;">
            <input type="checkbox" ${checked ? 'checked' : ''} style="margin-top:0.2rem; width:18px; height:18px; accent-color:#7c3aed;" onchange="window.TeacherView.toggleMandatoryQuestion('${qKey.replace(/'/g, "\\'")}', this.checked)" />
            <div style="flex:1;">
              <div style="font-weight:850; font-size:0.86rem;">Pregunta #${idx + 1}</div>
              <div style="font-size:0.82rem; opacity:0.85; line-height:1.35;">${text.slice(0, 140)}${text.length > 140 ? '...' : ''}</div>
            </div>
          </label>
        `;
      }).join('');
    }

    const isDark = document.getElementById('teacher-randomize-modal')?.classList.contains('teacher-theme-dark');
    modal.classList.toggle('teacher-theme-dark', Boolean(isDark));
    modal.style.display = 'flex';
  },

  closeMandatoryModal() {
    const modal = document.getElementById('teacher-mandatory-modal');
    if (modal) modal.style.display = 'none';
    const badge = document.getElementById('t3d-rand-mandatory-badge');
    if (badge && this.draftRandomizationConfig) {
      badge.textContent = `Seleccionar (${(this.draftRandomizationConfig.mandatoryQuestionIds || []).length})`;
    }
    this.updateSimulationPreview();
  },

  toggleMandatoryQuestion(qKey, isChecked) {
    if (!this.draftRandomizationConfig) return;
    const arr = new Set((this.draftRandomizationConfig.mandatoryQuestionIds || []).map(String));
    if (isChecked) arr.add(String(qKey));
    else arr.delete(String(qKey));
    this.draftRandomizationConfig.mandatoryQuestionIds = Array.from(arr);
  },

  simulateSingleStudentOrder(total, cfg, previousSignatures) {
    if (total <= 0) return [];
    const target = cfg.enabled ? Math.max(1, Math.min(Number(cfg.questionsPerStudent) || total, total)) : total;
    const exam = this.activeExamForDetails;
    const allQ = Array.isArray(exam?.questions) ? exam.questions : [];
    const mandatoryIds = new Set((cfg.mandatoryQuestionIds || []).map(String));

    let bestOrder = null;
    for (let attempt = 0; attempt < 8; attempt++) {
      const picked = [];
      const pickedIdx = new Set();

      // 1. Obligatorias
      allQ.forEach((q, idx) => {
        if (mandatoryIds.has(String(q.id || idx)) && picked.length < target) {
          pickedIdx.add(idx);
          picked.push(idx + 1);
        }
      });

      // 2. Restantes aleatorias
      const pool = [];
      for (let i = 0; i < total; i++) {
        if (!pickedIdx.has(i)) pool.push(i + 1);
      }
      if (cfg.enabled) {
        for (let i = pool.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
      }
      while (picked.length < target && pool.length > 0) {
        picked.push(pool.shift());
      }

      // 3. Orden aleatorio de preguntas
      if (cfg.shuffleQuestions) {
        for (let i = picked.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [picked[i], picked[j]] = [picked[j], picked[i]];
        }
      } else {
        picked.sort((a, b) => a - b);
      }

      const sig = picked.join(',');
      bestOrder = picked;
      if (!previousSignatures.has(sig)) {
        previousSignatures.add(sig);
        break;
      }
    }
    return bestOrder || [];
  },

  updateSimulationPreview() {
    const exam = this.activeExamForDetails;
    const cfg = this.draftRandomizationConfig;
    if (!exam || !cfg) return;

    const total = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const bankEl = document.getElementById('t3d-sim-bank-chips');
    const s1El = document.getElementById('t3d-sim-student1-chips');
    const s2El = document.getElementById('t3d-sim-student2-chips');
    const s3El = document.getElementById('t3d-sim-student3-chips');
    if (!bankEl || !s1El || !s2El || !s3El) return;

    if (total === 0) {
      bankEl.innerHTML = `<span style="font-size:0.78rem; color:#94a3b8;">Agrega preguntas al examen para ver la simulación.</span>`;
      s1El.innerHTML = s2El.innerHTML = s3El.innerHTML = `<span style="font-size:0.75rem; opacity:0.65;">Sin preguntas</span>`;
      return;
    }

    // Mostrar banco (si son más de 12, resumir con "...")
    let bankHtml = '';
    if (total <= 12) {
      for (let i = 1; i <= total; i++) {
        bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank">${i}</span>`;
      }
    } else {
      for (let i = 1; i <= 5; i++) bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank">${i}</span>`;
      bankHtml += `<span style="font-weight:900; color:#94a3b8; padding:0 4px;">...</span>`;
      for (let i = total - 4; i <= total; i++) bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank">${i}</span>`;
    }
    bankEl.innerHTML = bankHtml;

    const sigs = new Set();
    const o1 = this.simulateSingleStudentOrder(total, cfg, sigs);
    const o2 = this.simulateSingleStudentOrder(total, cfg, sigs);
    const o3 = this.simulateSingleStudentOrder(total, cfg, sigs);

    const renderChips = (arr, cls) => arr.map(n => `<span class="t3d-sim-chip ${cls}" title="Pregunta #${n}">${n}</span>`).join('');
    s1El.innerHTML = renderChips(o1, 't3d-sim-chip-s1');
    s2El.innerHTML = renderChips(o2, 't3d-sim-chip-s2');
    s3El.innerHTML = renderChips(o3, 't3d-sim-chip-s3');
  },

  async saveExamRandomization(examId) {
    const exam = this.activeExamForDetails;
    const cfg = this.draftRandomizationConfig;
    if (!exam || !cfg) return;

    const total = Array.isArray(exam.questions) ? exam.questions.length : 0;
    if (cfg.enabled && total > 0) {
      if (cfg.questionsPerStudent < 1 || cfg.questionsPerStudent > total) {
        alert(`⚠️ La cantidad de preguntas por estudiante debe estar entre 1 y ${total}.`);
        return;
      }
      if ((cfg.mandatoryQuestionIds || []).length > cfg.questionsPerStudent) {
        alert(`⚠️ Has seleccionado ${cfg.mandatoryQuestionIds.length} preguntas obligatorias, pero el límite por estudiante es ${cfg.questionsPerStudent}. Ajusta alguno de los dos valores.`);
        return;
      }
    }

    exam.randomizationConfig = JSON.parse(JSON.stringify(cfg));
    exam.updatedAt = Date.now();

    // Actualizar en appState.challenges
    if (window.appState && Array.isArray(window.appState.challenges)) {
      const idx = window.appState.challenges.findIndex(c => c && String(c.id).trim() === String(exam.id).trim());
      if (idx !== -1) {
        window.appState.challenges[idx].randomizationConfig = exam.randomizationConfig;
        window.appState.challenges[idx].updatedAt = exam.updatedAt;
      }
    }

    // Limpiar caché de intentos solo previos para este examen para que el docente pueda probar de inmediato
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith(`mentix_rand_attempt_${exam.id}_`)) sessionStorage.removeItem(k);
      });
    } catch (e) {}

    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);

    // Sincronizar con backend /api/challenges si está disponible
    try {
      await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(exam)
      });
    } catch (e) {
      console.warn('Guardado local exitoso; sincronización en la nube omitida:', e);
    }

    this.closeExamDetailsModal();
    if (window.appRouter?.currentView === 'teacher') {
      this.render(true);
    } else if (window.appRouter?.currentView === 'admin' && window.AdminView?.render) {
      window.AdminView.render();
    }
    alert('✅ ¡Configuración de aleatorización inteligente guardada exitosamente!');
  },

  previewRandomizedExam(examId) {
    // Aplicar temporalmente el borrador y lanzar prueba como estudiante
    if (this.activeExamForDetails && this.draftRandomizationConfig) {
      this.activeExamForDetails.randomizationConfig = JSON.parse(JSON.stringify(this.draftRandomizationConfig));
      try {
        Object.keys(sessionStorage).forEach(k => {
          if (k.startsWith(`mentix_rand_attempt_${this.activeExamForDetails.id}_SOLO`)) {
            sessionStorage.removeItem(k);
          }
        });
      } catch (e) {}
    }
    this.closeExamDetailsModal();
    if (window.appRouter && typeof window.appRouter.startSinglePlayer === 'function') {
      window.appRouter.startSinglePlayer(examId);
    }
  }
};
