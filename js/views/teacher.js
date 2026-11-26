/**
 * 🔥 MENTIX - Panel del Profesor 3D (Teacher Dashboard 3D)
 * Experiencia táctil 3D con Fluent Icons, podio de cursos, métricas en tiempo real y lanzamiento instantáneo.
 * Soporte total para Modo Claro y Modo Oscuro con alto contraste.
 */

window.TeacherView = {
  selectedGroupIdForLaunch: null,
  modalRoomType: 'presented',
  searchQuery: '',
  selectedCategory: 'all',
  activeGroupForStudent: null,

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
    this.render();
  },

  handleSearchInput(val) {
    this.searchQuery = (val || '').toLowerCase().trim();
    this.filterQuizzesInDOM();
  },

  filterQuizzesInDOM() {
    const cards = document.querySelectorAll('.t3d-quiz-card');
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

  render() {
    const container = document.getElementById('view-teacher');
    if (!container) return;

    const groups = window.appState.groups || [];
    const challenges = window.appState.challenges || [];
    const currentUser = window.appState.currentUser || {};
    const currentTheme = this.getTheme();

    if (container) {
      container.classList.toggle('teacher-theme-light', currentTheme === 'light');
      container.classList.toggle('teacher-theme-dark', currentTheme !== 'light');
    }

    // Calcular métricas
    const totalStudents = groups.reduce((acc, g) => acc + (parseInt(g.studentsCount) || (g.students?.length || 0)), 0);
    const avgScoresList = groups.map(g => parseInt(g.avgScore) || 80).filter(n => !isNaN(n));
    const globalAvg = avgScoresList.length ? Math.round(avgScoresList.reduce((a, b) => a + b, 0) / avgScoresList.length) : 82;

    // Categorías únicas para filtro
    const categoriesMap = new Map();
    challenges.forEach(c => {
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
              <p class="t3d-hero-sub">Gestiona tus clases en tiempo real, lanza cuestionarios interactivos con podio 3D y supervisa el rendimiento de tus estudiantes.</p>
            </div>
          </div>

          <!-- Acciones Principales 3D -->
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
              <span>Crear Evaluación</span>
            </button>
          </div>
        </header>

        <!-- MÉTRICAS CLAVE KPI 3D CON BASES EXTRUIDAS -->
        <section class="t3d-kpi-grid">
          <!-- Card 1: Cursos Activos -->
          <div class="t3d-kpi-card t3d-kpi-blue">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Books/3D/books_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Cursos Activos</div>
              <div class="t3d-kpi-val">${groups.length}</div>
              <div class="t3d-kpi-sub">👥 ${totalStudents} alumnos inscritos</div>
            </div>
          </div>

          <!-- Card 2: Evaluaciones Listas -->
          <div class="t3d-kpi-card t3d-kpi-cyan">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Evaluaciones Listas</div>
              <div class="t3d-kpi-val">${challenges.length}</div>
              <div class="t3d-kpi-sub">📝 Disponibles para lanzar</div>
            </div>
          </div>

          <!-- Card 3: Promedio de Rendimiento -->
          <div class="t3d-kpi-card t3d-kpi-green">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Bullseye/3D/bullseye_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Aciertos Promedio</div>
              <div class="t3d-kpi-val">${globalAvg}%</div>
              <div class="t3d-kpi-sub">🎯 Rendimiento global óptimo</div>
            </div>
          </div>

          <!-- Card 4: Modos de Proyección -->
          <div class="t3d-kpi-card t3d-kpi-gold">
            <div class="t3d-kpi-icon-wrap">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-lg" alt="" />
            </div>
            <div class="t3d-kpi-info">
              <div class="t3d-kpi-label">Modos de Sala 3D</div>
              <div class="t3d-kpi-val" style="font-size: 1.35rem; margin-top: 0.25rem;">Proyector &amp; Móvil</div>
              <div class="t3d-kpi-sub">📽️ Kahoot Live &amp; Celulares</div>
            </div>
          </div>
        </section>

        <!-- SECCIÓN 1: EVALUACIONES Y QUIZZES DISPONIBLES CON TOOLBAR 3D -->
        <section style="margin-bottom: 3.5rem;">
          <div class="t3d-section-header">
            <h2 class="t3d-section-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Open%20book/3D/open_book_3d.png" class="t3d-ico-md" alt="" />
              <span>Quizzes y Evaluaciones Disponibles</span>
              <span class="t3d-pill-meta" id="t3d-quiz-counter" style="margin-left: 0.5rem;">${challenges.length}</span>
            </h2>

            <!-- Barra de Búsqueda 3D -->
            <div class="t3d-search-bar">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Magnifying%20glass%20tilted%20right/3D/magnifying_glass_tilted_right_3d.png" class="t3d-ico-sm" alt="" />
              <input 
                type="text" 
                class="t3d-search-input" 
                placeholder="Buscar evaluación o materia..." 
                value="${this.searchQuery}"
                oninput="window.TeacherView.handleSearchInput(this.value)" 
              />
            </div>
          </div>

          <!-- Chips de Filtro por Categoría 3D -->
          <div class="t3d-filter-chips">
            <div 
              class="t3d-filter-chip ${this.selectedCategory === 'all' ? 'is-active' : ''}" 
              onclick="window.TeacherView.setCategoryFilter('all')"
            >
              🌟 Todos (${challenges.length})
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

          <!-- Grid de Evaluaciones 3D -->
          <div class="t3d-quiz-grid">
            ${challenges.length === 0 ? `
              <div class="t3d-quiz-card" style="grid-column: 1 / -1; text-align: center; padding: 3rem 1.5rem;">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Clipboard/3D/clipboard_3d.png" class="t3d-ico-lg" style="margin: 0 auto 1rem;" alt="" />
                <h3 style="font-size: 1.3rem; font-weight: 900; margin: 0 0 0.5rem;">Aún no hay cuestionarios disponibles</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Crea tu primera evaluación interactiva para que tus alumnos compitan en vivo.</p>
                <div>
                  <button class="t3d-btn t3d-btn-primary" onclick="window.appRouter.navigate('creator')">
                    <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
                    <span>Crear Primera Evaluación</span>
                  </button>
                </div>
              </div>
            ` : challenges.map(c => {
              const isMyQuiz = (c.authorId && currentUser.id && String(c.authorId) === String(currentUser.id)) ||
                (c.authorEmail && currentUser.email && c.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                (c.author && currentUser.name && c.author.toLowerCase() === currentUser.name.toLowerCase());
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
                    <!-- Fila Superior de Badges -->
                    <div class="t3d-quiz-top-row">
                      <span class="t3d-pill-category">
                        📚 ${catName}
                      </span>
                      <span class="t3d-pill-meta">
                        ⏱️ ${timeLimit} • 📝 ${qCount} preg.
                      </span>
                    </div>

                    <!-- Título y Descripción -->
                    <h3 class="t3d-quiz-title">${c.title}</h3>
                    <p class="t3d-quiz-desc">${c.description || 'Evaluación interactiva para aplicar en el aula con puntajes y podio 3D.'}</p>
                    
                    <!-- Barra de Autor -->
                    <div class="t3d-quiz-author-bar">
                      <div class="t3d-author-info">
                        <span>${c.authorAvatar || '👤'}</span>
                        <span>Prof: <strong>${c.author || 'Docente'}</strong></span>
                      </div>
                      ${isMyQuiz ? `
                        <span class="t3d-badge-myquiz">
                          ⭐ Creado por ti
                        </span>
                      ` : ''}
                    </div>
                  </div>

                  <!-- Botones de Acción 3D -->
                  <div class="t3d-quiz-actions">
                    <button 
                      class="t3d-card-btn t3d-card-btn-test" 
                      title="Probar cuestionario como estudiante"
                      onclick="window.appRouter.startSinglePlayer('${c.id}')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Play%20button/3D/play_button_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Probar</span>
                    </button>
                    <button 
                      class="t3d-card-btn t3d-btn-primary" 
                      title="Proyectar preguntas en pantalla grande (Estilo Kahoot)"
                      onclick="window.appRouter.hostRoom('${c.id}', 'presented')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Television/3D/television_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Proyectar</span>
                    </button>
                    <button 
                      class="t3d-card-btn t3d-btn-cyan" 
                      title="Abrir sala normal donde los alumnos ven preguntas en sus celulares"
                      onclick="window.appRouter.hostRoom('${c.id}', 'normal')"
                    >
                      <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Video%20game/3D/video_game_3d.png" class="t3d-ico-sm" alt="" />
                      <span>Móvil</span>
                    </button>
                    ${isMyQuiz ? `
                      <button 
                        class="t3d-card-btn t3d-btn-amber" 
                        title="Editar cuestionario"
                        style="max-width: 44px; padding: 0.55rem 0.4rem;"
                        onclick="window.appRouter.navigate('creator', { editId: '${c.id}' })"
                      >
                        ✏️
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>

          <!-- Mensaje de Búsqueda Vacía -->
          <div id="t3d-quiz-empty-search" style="display: none; text-align: center; padding: 2rem;">
            <p style="font-size: 1.1rem; font-weight: 800; color: var(--text-secondary);">
              🔍 No se encontraron evaluaciones con ese término o categoría.
            </p>
          </div>
        </section>

        <!-- SECCIÓN 2: GRUPOS Y CURSOS REGISTRADOS CON CUADRO DE HONOR 3D -->
        <section>
          <div class="t3d-section-header">
            <h2 class="t3d-section-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Busts%20in%20silhouette/3D/busts_in_silhouette_3d.png" class="t3d-ico-md" alt="" />
              <span>Cursos y Grupos Registrados</span>
              <span class="t3d-pill-meta">${groups.length}</span>
            </h2>
            <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.openNewGroupModal()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
              <span>Crear Grupo</span>
            </button>
          </div>

          <div class="t3d-groups-grid">
            ${groups.length === 0 ? `
              <div class="t3d-group-card" style="text-align: center; padding: 3rem 1.5rem;">
                <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Graduation%20cap/3D/graduation_cap_3d.png" class="t3d-ico-lg" style="margin: 0 auto 1rem;" alt="" />
                <h3 style="font-size: 1.3rem; font-weight: 900; margin: 0 0 0.5rem;">No tienes cursos o grupos registrados</h3>
                <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">Crea un grupo para organizar a tus estudiantes y realizar evaluaciones específicas.</p>
                <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.openNewGroupModal()">
                  <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
                  <span>Crear Nuevo Grupo</span>
                </button>
              </div>
            ` : groups.map(grp => {
              const students = (grp.students || []).slice().sort((a, b) => (b.points || 0) - (a.points || 0));
              const topStudents = students.slice(0, 6);

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
                          <span>👥 ${grp.studentsCount || students.length} estudiantes</span>
                          <span>• Promedio: <strong style="color: #10b981;">${grp.avgScore || 80}%</strong></span>
                          ${grp.lastChallenge ? `<span>• Último reto: <em>${grp.lastChallenge}</em></span>` : ''}
                        </div>
                      </div>
                    </div>

                    <!-- Botones de Acción del Grupo -->
                    <div class="t3d-group-actions">
                      <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.openAddStudentModal('${grp.id}')" title="Inscribir un estudiante">
                        <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Plus/3D/plus_3d.png" class="t3d-ico-sm" alt="" />
                        <span>Añadir Alumno</span>
                      </button>
                      <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.openLaunchModalForGroup('${grp.id}')">
                        <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
                        <span>Lanzar Reto a este Grupo</span>
                      </button>
                    </div>
                  </div>

                  <!-- Cuadro de Honor / Podio 3D del Grupo -->
                  <div class="t3d-honor-title">
                    <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Trophy/3D/trophy_3d.png" class="t3d-ico-sm" alt="" />
                    <span>Cuadro de Honor y Mejores Puntajes</span>
                  </div>

                  <div class="t3d-students-grid">
                    ${topStudents.length === 0 ? `
                      <div style="grid-column: 1 / -1; font-size: 0.9rem; color: var(--text-secondary); font-style: italic;">
                        Aún no hay estudiantes registrados en este grupo. ¡Usa el botón "Añadir Alumno"!
                      </div>
                    ` : topStudents.map((st, index) => {
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
                          <div class="t3d-student-avatar">
                            ${st.avatar || '🦊'}
                          </div>
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
           MODAL 1: LANZAR RETO A GRUPO 3D
           ========================================================================== -->
      <div id="teacher-launch-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window">
          <div class="t3d-modal-header">
            <h3 class="t3d-modal-title">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-md" alt="" />
              <span>Iniciar Reto con Grupo 3D</span>
            </h3>
            <button class="t3d-modal-close" onclick="window.TeacherView.closeLaunchModal()">&times;</button>
          </div>

          <p id="teacher-modal-group-name" style="font-weight: 850; font-size: 1rem; color: #0284c7; margin-bottom: 1.4rem;"></p>

          <div class="t3d-form-group">
            <label class="t3d-form-label">EVALUACIÓN O QUIZ A LANZAR:</label>
            <select id="teacher-modal-challenge-select" class="t3d-form-select">
              ${challenges.map(c => `
                <option value="${c.id}">${c.title} (${c.questions?.length || 0} preguntas)</option>
              `).join('')}
            </select>
          </div>

          <div class="t3d-form-group">
            <label class="t3d-form-label">TIPO DE EXPERIENCIA EN VIVO:</label>
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
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeLaunchModal()">
              Cancelar
            </button>
            <button class="t3d-btn t3d-btn-primary" onclick="window.TeacherView.confirmLaunchForGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rocket/3D/rocket_3d.png" class="t3d-ico-sm" alt="" />
              <span>Abrir Sala Ahora</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 2: CREAR NUEVO GRUPO 3D
           ========================================================================== -->
      <div id="teacher-new-group-modal" class="t3d-modal-backdrop" style="display: none;">
        <div class="t3d-modal-window">
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

          <div class="t3d-form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
            <div>
              <label class="t3d-form-label">Alumnos Estimados:</label>
              <input 
                type="number" 
                id="t3d-new-group-count" 
                class="t3d-form-input" 
                value="30" 
                min="1" 
                max="300" 
              />
            </div>
            <div>
              <label class="t3d-form-label">Promedio Base (%):</label>
              <input 
                type="number" 
                id="t3d-new-group-avg" 
                class="t3d-form-input" 
                value="80" 
                min="0" 
                max="100" 
              />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.8rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeNewGroupModal()">
              Cancelar
            </button>
            <button class="t3d-btn t3d-btn-emerald" onclick="window.TeacherView.saveNewGroup()">
              <img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sparkles/3D/sparkles_3d.png" class="t3d-ico-sm" alt="" />
              <span>Crear Grupo</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ==========================================================================
           MODAL 3: AGREGAR ESTUDIANTE A GRUPO 3D
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
            <input 
              type="text" 
              id="t3d-student-name-input" 
              class="t3d-form-input" 
              placeholder="Ej: Laura Sofía Mendoza" 
            />
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
              <input 
                type="number" 
                id="t3d-student-points-input" 
                class="t3d-form-input" 
                value="1000" 
                min="0" 
                step="50" 
              />
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.8rem;">
            <button class="t3d-btn t3d-btn-outline" onclick="window.TeacherView.closeAddStudentModal()">
              Cancelar
            </button>
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
    this.selectedGroupIdForLaunch = groupId;
    this.modalRoomType = 'presented';

    const modal = document.getElementById('teacher-launch-modal');
    const groupLabel = document.getElementById('teacher-modal-group-name');
    if (groupLabel) {
      groupLabel.textContent = `🎯 Grupo seleccionado: ${group.name} (${group.studentsCount || (group.students?.length || 0)} alumnos)`;
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
    const challenges = window.appState.challenges || [];
    const challenge = challenges.find(c => c.id === challengeId) || challenges[0];
    const groupId = this.selectedGroupIdForLaunch;

    if (!challenge) {
      alert('⚠️ Por favor selecciona un cuestionario válido.');
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

  /* Modales 3D para Cursos y Alumnos */
  openNewGroupModal() {
    const modal = document.getElementById('teacher-new-group-modal');
    const nameInput = document.getElementById('t3d-new-group-name');
    if (nameInput) nameInput.value = '';
    if (modal) modal.style.display = 'flex';
    if (nameInput) setTimeout(() => nameInput.focus(), 100);
  },

  closeNewGroupModal() {
    const modal = document.getElementById('teacher-new-group-modal');
    if (modal) modal.style.display = 'none';
  },

  saveNewGroup() {
    const nameInput = document.getElementById('t3d-new-group-name');
    const countInput = document.getElementById('t3d-new-group-count');
    const avgInput = document.getElementById('t3d-new-group-avg');

    const name = (nameInput?.value || '').trim();
    if (!name) {
      alert('⚠️ Por favor escribe el nombre del grupo.');
      if (nameInput) nameInput.focus();
      return;
    }

    const count = parseInt(countInput?.value) || 30;
    const avg = parseInt(avgInput?.value) || 80;

    const newGroup = {
      id: 'group_' + Date.now(),
      name: name.toUpperCase(),
      studentsCount: count,
      teacherId: window.appState.currentUser?.id || 'teacher_1',
      avgScore: avg,
      students: [
        { id: 'st_' + Date.now() + '_1', name: 'Estudiante Ejemplo 1', email: 'alumno1@colegio.edu.co', points: 3500, played: 3, avatar: '🦊' },
        { id: 'st_' + Date.now() + '_2', name: 'Estudiante Ejemplo 2', email: 'alumno2@colegio.edu.co', points: 2800, played: 2, avatar: '🐯' }
      ]
    };

    if (!window.appState.groups) window.appState.groups = [];
    window.appState.groups.unshift(newGroup);

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    }

    this.closeNewGroupModal();
    this.render();
  },

  // Alias para retrocompatibilidad
  newGroupModal() {
    this.openNewGroupModal();
  },

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

  saveNewStudent() {
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

    group.studentsCount = group.students.length;

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    }

    this.closeAddStudentModal();
    this.render();
  }
};
