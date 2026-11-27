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
  _cloudSyncInFlight: false,
  _hasSyncedCloudOnce: false,

  // Detecta si un item es un Proyecto (presentación, video, doc, url, etc.) y NO un examen puro
  isProjectItem(c) {
    if (!c || typeof c !== 'object') return false;
    const pType = String(c.projectType || c.project_type || '').toLowerCase().trim();
    if (pType === 'presentation' || pType === 'video' || pType === 'document' || pType === 'url') return true;
    if (c.isGovDataProject || c.is_gov_data_project) return true;
    if (pType !== 'quiz' && (!Array.isArray(c.questions) || c.questions.length === 0)) return true;
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

  // Devuelve solo los exámenes reales creados por el docente actual (nunca proyectos ni exámenes ajenos)
  getTeacherExams() {
    const challenges = window.appState?.challenges || [];
    return challenges.filter(c => {
      if (!c || this.isProjectItem(c)) return false;
      if (!Array.isArray(c.questions) || c.questions.length === 0) return false;
      return this.isOwnedByCurrentTeacher(c);
    });
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
                        <span>Prof: <strong>${c.author || 'Tú'}</strong></span>
                      </div>
                      <span class="t3d-badge-myquiz">⭐ Creado por ti</span>
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
                      onclick="window.appRouter.navigate('creator', { editId: '${c.id}' })"
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
           MODAL 1: LANZAR RETO DEL GRUPO (USA EL EXAMEN REAL DEL GRUPO)
           ========================================================================== -->
      <div id="teacher-launch-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-md" alt="" />
              <span>Lanzar Examen del Grupo</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeLaunchModal()">&times;</button>
          </div>

          <p id="teacher-modal-group-name" style="font-weight: 850; font-size: 1rem; color: #0284c7; margin-bottom: 1.25rem;"></p>

          <div class="t3d-form-group">
            <label class="t3d-form-label">EXAMEN REAL DEL GRUPO A INICIAR:</label>
            <select id="teacher-modal-challenge-select" class="t3d-form-select"></select>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">TIPO DE SALA EN VIVO:</label>
            <div class="t3d-room-type-grid">
              <div 
                id="t3d-type-btn-presented" 
                class="t3d-room-type-btn is-active" 
                onclick="window.TeacherView.selectModalRoomType('presented')"
              >
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-md" alt="" />
                <span style="font-weight: 900;">Proyector / Kahoot</span>
                <span style="font-size: 0.76rem; opacity: 0.85;">Pantalla grande</span>
              </div>
              <div 
                id="t3d-type-btn-normal" 
                class="t3d-room-type-btn" 
                onclick="window.TeacherView.selectModalRoomType('normal')"
              >
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Video%20game/3D/video_game_3d.png" class="t3d-ico-md" alt="" />
                <span style="font-weight: 900;">Sala Normal</span>
                <span style="font-size: 0.76rem; opacity: 0.85;">Móviles y PCs</span>
              </div>
            </div>
            <p id="t3d-modal-type-desc" style="font-size: 0.82rem; margin: 0.5rem 0 0; color: var(--text-secondary); line-height: 1.4;">
              📽️ Modo Proyector: Las preguntas aparecen en la pantalla central y los alumnos responden desde sus celulares.
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.8rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeLaunchModal()">Cancelar</button>
            <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.confirmLaunchForGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
              <span>Abrir Sala Ahora</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 2: CREAR NUEVO GRUPO 3D (PANTALLA AMPLIA + TODOS LOS EXÁMENES + CREAR EXAMEN)
           ========================================================================== -->
      <div id="teacher-new-group-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window" style="max-width: 820px; width: 96%; max-height: 92vh; overflow-y: auto; padding: 2.25rem;">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-md" alt="" />
              <span>Crear Nuevo Grupo 3D</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeNewGroupModal()">&times;</button>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">Nombre del Curso / Grado:</label>
            <input 
              type="text" 
              id="t3d-new-group-name" 
              class="t3d-form-input" 
              placeholder="Ej: GRADO 10-A CIENCIAS Y TECNOLOGÍA" 
            />
          </div>

          <div class="t3d-form-group" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.85rem;">
            <div>
              <label class="t3d-form-label">Alumnos Estimados:</label>
              <input type="number" id="t3d-new-group-count" class="t3d-form-input" value="30" min="1" max="300" />
            </div>
            <div>
              <label class="t3d-form-label">Promedio Base (%):</label>
              <input type="number" id="t3d-new-group-avg" class="t3d-form-input" value="80" min="0" max="100" />
            </div>
            <div>
              <label class="t3d-form-label">Código de Acceso:</label>
              <input type="text" id="t3d-new-group-code" class="t3d-form-input" maxlength="8" style="letter-spacing: 2px; text-align: center;" />
            </div>
          </div>

          <!-- Selección o Creación del Examen para el Grupo -->
          <div class="t3d-form-group" style="padding: 1.25rem; border-radius: 18px; border: 2px solid rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.05);">
            <label class="t3d-form-label" style="font-size: 0.95rem; margin-bottom: 0.75rem;">
              📝 ¿Qué examen va a ir en este grupo?
            </label>

            <div style="display: flex; gap: 0.65rem; flex-wrap: wrap; margin-bottom: 1rem;">
              <button type="button" id="t3d-ng-tab-existing" class="t3d-btn t3d-btn-primary" style="flex: 1; min-width: 200px;" onclick="window.TeacherView.switchNewGroupExamMode('existing')">
                📚 Elegir de Todos los Exámenes (${this.getAllRealExams().length})
              </button>
              <button type="button" id="t3d-ng-tab-create" class="t3d-btn t3d-btn-outline" style="flex: 1; min-width: 200px;" onclick="window.TeacherView.switchNewGroupExamMode('create')">
                ➕ Crear un Examen Nuevo Aquí
              </button>
            </div>

            <!-- MODO A: Elegir entre TODOS los exámenes reales disponibles -->
            <div id="t3d-ng-panel-existing">
              <input 
                type="text" 
                id="t3d-new-group-exam-filter" 
                class="t3d-form-input" 
                placeholder="🔍 Buscar examen por título o profesor..." 
                style="margin-bottom: 0.65rem;"
                oninput="window.TeacherView.filterNewGroupExams(this.value)"
              />
              <select id="t3d-new-group-exam" class="t3d-form-select" size="5" style="min-height: 145px; padding: 0.5rem;">
                ${this.getAllRealExams().length === 0 ? `
                  <option value="">No hay exámenes creados aún — usa "Crear un Examen Nuevo Aquí"</option>
                ` : this.getAllRealExams().map((ex, i) => `
                  <option value="${ex.id}" ${i === 0 ? 'selected' : ''}>
                    ${this.isOwnedByCurrentTeacher(ex) ? '⭐ [Tuyo] ' : '📚 '}${ex.title} — ${ex.author || 'Docente'} (${ex.questions.length} preg.)
                  </option>
                `).join('')}
              </select>
              <small style="display: block; margin-top: 0.45rem; opacity: 0.82; font-size: 0.8rem;">
                Lee todos los exámenes reales disponibles. Luego puedes añadir más, cambiarlos o borrarlos desde <strong>Editar / Exámenes</strong>.
              </small>
            </div>

            <!-- MODO B: Crear un Examen Nuevo directo dentro de Crear Grupo -->
            <div id="t3d-ng-panel-create" style="display: none;">
              <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 0.75rem; margin-bottom: 0.9rem;">
                <div>
                  <label class="t3d-form-label">Título del Nuevo Examen:</label>
                  <input type="text" id="t3d-inline-exam-title" class="t3d-form-input" placeholder="Ej: Parcial 1 - Biología Celular" />
                </div>
                <div>
                  <label class="t3d-form-label">Tiempo por pregunta:</label>
                  <select id="t3d-inline-exam-time" class="t3d-form-select">
                    <option value="20" selected>20 segundos</option>
                    <option value="30">30 segundos</option>
                    <option value="45">45 segundos</option>
                    <option value="60">60 segundos</option>
                    <option value="0">Sin límite</option>
                  </select>
                </div>
              </div>

              <div id="t3d-inline-questions-container" style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 0.85rem;"></div>

              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 0.5rem;">
                <button type="button" class="t3d-btn t3d-btn-emerald" style="padding: 0.5rem 0.95rem; font-size: 0.84rem;" onclick="window.TeacherView.addInlineQuestionRow()">
                  ➕ Agregar Pregunta
                </button>
                <button type="button" class="t3d-btn t3d-btn-outline" style="padding: 0.5rem 0.95rem; font-size: 0.82rem;" onclick="window.TeacherView.closeNewGroupModal(); window.appRouter.navigate('creator');">
                  🚀 Ir al Creador Completo (IA / PDF)
                </button>
              </div>
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.6rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeNewGroupModal()">Cancelar</button>
            <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.saveNewGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkles/3D/sparkles_3d.png" class="t3d-ico-sm" alt="" />
              <span>Crear Grupo y Generar Código</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 3: EDITAR GRUPO Y GESTIONAR EXÁMENES (AÑADIR / ACTIVAR / BORRAR)
           ========================================================================== -->
      <div id="teacher-edit-group-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window" style="max-width: 620px; max-height: 90vh; overflow-y: auto;">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-md" alt="" />
              <span>Editar Grupo y Exámenes</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeEditGroupModal()">&times;</button>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">Nombre del Curso / Grado:</label>
            <input type="text" id="t3d-edit-group-name" class="t3d-form-input" />
          </div>

          <div class="t3d-form-group" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem;">
            <div>
              <label class="t3d-form-label">Alumnos Estimados:</label>
              <input type="number" id="t3d-edit-group-count" class="t3d-form-input" min="1" max="300" />
            </div>
            <div>
              <label class="t3d-form-label">Promedio Base (%):</label>
              <input type="number" id="t3d-edit-group-avg" class="t3d-form-input" min="0" max="100" />
            </div>
            <div>
              <label class="t3d-form-label">Código de Acceso:</label>
              <input type="text" id="t3d-edit-group-code" class="t3d-form-input" maxlength="8" style="letter-spacing: 2px; text-align: center;" />
            </div>
          </div>

          <!-- Gestión Dinámica de Exámenes del Grupo -->
          <div class="t3d-form-group" style="padding: 1rem; border-radius: 16px; border: 1.5px solid rgba(59, 130, 246, 0.35); background: rgba(59, 130, 246, 0.06);">
            <label class="t3d-form-label" style="margin-bottom: 0.65rem;">📝 Exámenes Asignados a este Grupo:</label>
            <div id="t3d-edit-group-exams-list" style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 0.9rem;"></div>

            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <select id="t3d-edit-add-exam-select" class="t3d-form-select" style="flex: 1; min-width: 200px;">
                <option value="">-- Elegir examen para añadir --</option>
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

  openNewGroupModal() {
    const modal = document.getElementById('teacher-new-group-modal');
    const nameInput = document.getElementById('t3d-new-group-name');
    const codeInput = document.getElementById('t3d-new-group-code');
    const filterInput = document.getElementById('t3d-new-group-exam-filter');
    const inlineTitle = document.getElementById('t3d-inline-exam-title');
    const qContainer = document.getElementById('t3d-inline-questions-container');

    if (nameInput) nameInput.value = '';
    if (codeInput) codeInput.value = this.generateGroupAccessCode();
    if (filterInput) {
      filterInput.value = '';
      this.filterNewGroupExams('');
    }
    if (inlineTitle) inlineTitle.value = '';
    if (qContainer) {
      qContainer.innerHTML = '';
      this.addInlineQuestionRow();
    }

    this.switchNewGroupExamMode(this.getAllRealExams().length > 0 ? 'existing' : 'create');
    if (modal) modal.style.display = 'flex';
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  },

  switchNewGroupExamMode(mode) {
    this.newGroupExamMode = mode === 'create' ? 'create' : 'existing';
    const tabEx = document.getElementById('t3d-ng-tab-existing');
    const tabCr = document.getElementById('t3d-ng-tab-create');
    const panEx = document.getElementById('t3d-ng-panel-existing');
    const panCr = document.getElementById('t3d-ng-panel-create');

    if (this.newGroupExamMode === 'create') {
      if (tabEx) tabEx.className = 't3d-btn t3d-btn-outline';
      if (tabCr) tabCr.className = 't3d-btn t3d-btn-primary';
      if (panEx) panEx.style.display = 'none';
      if (panCr) panCr.style.display = 'block';
    } else {
      if (tabEx) tabEx.className = 't3d-btn t3d-btn-primary';
      if (tabCr) tabCr.className = 't3d-btn t3d-btn-outline';
      if (panEx) panEx.style.display = 'block';
      if (panCr) panCr.style.display = 'none';
    }
  },

  filterNewGroupExams(query) {
    const select = document.getElementById('t3d-new-group-exam');
    if (!select) return;
    const q = (query || '').toLowerCase().trim();
    const exams = this.getAllRealExams();
    const filtered = exams.filter(ex =>
      !q ||
      (ex.title || '').toLowerCase().includes(q) ||
      (ex.author || '').toLowerCase().includes(q) ||
      (ex.categoryName || '').toLowerCase().includes(q)
    );
    if (filtered.length === 0) {
      select.innerHTML = `<option value="">Sin coincidencias para "${query}"</option>`;
    } else {
      select.innerHTML = filtered.map((ex, i) => `
        <option value="${ex.id}" ${i === 0 ? 'selected' : ''}>
          ${this.isOwnedByCurrentTeacher(ex) ? '⭐ [Tuyo] ' : '📚 '}${ex.title} — ${ex.author || 'Docente'} (${ex.questions.length} preg.)
        </option>
      `).join('');
    }
  },

  addInlineQuestionRow() {
    const container = document.getElementById('t3d-inline-questions-container');
    if (!container) return;
    const idx = container.children.length + 1;
    const rowUid = 'iq_' + Date.now() + '_' + idx;
    const row = document.createElement('div');
    row.className = 't3d-inline-q-row';
    row.style.cssText = 'padding: 0.9rem; border-radius: 14px; border: 1.5px solid rgba(148,163,184,0.35); background: rgba(15,23,42,0.04);';
    row.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.55rem;">
        <strong style="font-size: 0.85rem;">Pregunta #${idx}</strong>
        ${idx > 1 ? `<button type="button" style="background:none;border:none;cursor:pointer;color:#ef4444;font-weight:900;" onclick="this.closest('.t3d-inline-q-row').remove()">🗑️ Quitar</button>` : ''}
      </div>
      <input type="text" class="t3d-form-input t3d-iq-text" placeholder="Escribe la pregunta aquí..." style="margin-bottom: 0.6rem;" />
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
        ${['A', 'B', 'C', 'D'].map((lbl, oi) => `
          <label style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem;">
            <input type="radio" name="correct_${rowUid}" value="${oi}" ${oi === 0 ? 'checked' : ''} title="Marcar como correcta" />
            <input type="text" class="t3d-form-input t3d-iq-opt" placeholder="Opción ${lbl}${oi < 2 ? ' *' : ' (opcional)'}" style="padding: 0.48rem 0.7rem; font-size: 0.84rem;" />
          </label>
        `).join('')}
      </div>
      <small style="display:block; margin-top:0.35rem; opacity:0.75; font-size:0.75rem;">Marca el círculo de la opción correcta.</small>
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
    const examSelect = document.getElementById('t3d-new-group-exam');

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
      const qRows = Array.from(document.querySelectorAll('.t3d-inline-q-row'));
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
      const chosenExamId = examSelect?.value || '';
      if (allRealExams.length > 0 && !chosenExamId) {
        alert('⚠️ Selecciona qué examen va a ir en este grupo.');
        if (examSelect) examSelect.focus();
        return;
      }
      chosenExam = allRealExams.find(ex => String(ex.id) === String(chosenExamId)) || null;
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
      listEl.innerHTML = `<div style="font-size: 0.85rem; opacity: 0.8;">No hay exámenes asignados todavía. Selecciona uno abajo y pulsa "➕ Añadir Examen".</div>`;
      return;
    }

    listEl.innerHTML = assigned.map(ex => {
      const isActive = active && String(active.id) === String(ex.id);
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; padding: 0.55rem 0.75rem; border-radius: 10px; border: 1.5px solid ${isActive ? '#3b82f6' : 'rgba(148,163,184,0.3)'}; background: ${isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent'};">
          <div style="min-width: 0; flex: 1;">
            <div style="font-weight: 850; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${isActive ? '🎯 ' : '📝 '}${ex.title}
            </div>
            <div style="font-size: 0.75rem; opacity: 0.8;">${ex.questions.length} preguntas ${isActive ? '• Examen Activo' : ''}</div>
          </div>
          <div style="display: flex; gap: 0.35rem;">
            ${!isActive ? `
              <button type="button" class="t3d-card-btn t3d-btn-primary" style="padding: 0.3rem 0.6rem; font-size: 0.74rem;" onclick="window.TeacherView.setActiveExamForEditingGroup('${ex.id}')">
                🎯 Activar
              </button>
            ` : ''}
            <button type="button" class="t3d-card-btn t3d-card-btn-test" style="padding: 0.3rem 0.55rem; font-size: 0.74rem; color: #ef4444;" onclick="window.TeacherView.removeExamFromEditingGroup('${ex.id}')" title="Quitar examen del grupo">
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
  }
};
