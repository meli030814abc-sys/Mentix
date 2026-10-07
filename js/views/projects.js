/**
 * 🔥 MENTIX - Vista de Proyectos & Retos (Projects View)
 * Gestión integral de proyectos educativos: Diapositivas, Videos interactivos y Quizzes gamificados.
 */

window.ProjectsView = {
  currentCategory: 'all',
  currentTypeFilter: 'all', // 'all' | 'presentation' | 'video'
  searchQuery: '',

  render() {
    const container = document.getElementById('view-projects');
    if (!container) return;

    const u = window.appState.currentUser;
    // En MENTIX, los proyectos son estrictamente Presentaciones (Diapositivas) y Video Clases
    const allProjects = (window.appState.challenges || []).filter(c => c.projectType === 'presentation' || c.projectType === 'video');
    const categories = window.appState.categories || [];

    // Reconciliar categorías: si un proyecto tiene categoryName pero category no coincide con ningún id,
    // intentar encontrar la categoría por nombre para corregirlo automáticamente
    let needsSave = false;
    allProjects.forEach(proj => {
      if (proj.category) {
        const catExists = categories.find(cat => cat.id === proj.category);
        if (!catExists && proj.categoryName) {
          // Buscar por nombre
          const catByName = categories.find(cat =>
            cat.name.toLowerCase() === (proj.categoryName || '').toLowerCase()
          );
          if (catByName) {
            proj.category = catByName.id;
            proj.categoryName = catByName.name;
            needsSave = true;
          }
        }
      }
    });
    if (needsSave && typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    }

    // Filtrar proyectos
    let filtered = allProjects;

    if (this.currentCategory !== 'all') {
      filtered = filtered.filter(c => c.category === this.currentCategory);
    }

    if (this.currentTypeFilter !== 'all') {
      filtered = filtered.filter(c => c.projectType === this.currentTypeFilter);
    }

    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q)) ||
        (c.author && c.author.toLowerCase().includes(q))
      );
    }

    // Estadísticas exclusivas de Proyectos (Presentaciones y Videos)
    const totalProjects = allProjects.length;
    const totalSlides = allProjects.filter(c => c.projectType === 'presentation').reduce((acc, c) => acc + (c.slides ? c.slides.length : 0), 0);
    const totalVideos = allProjects.filter(c => c.projectType === 'video').length;

    container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 2.5rem 1.25rem 5rem;">
        
        <!-- Header Principal de Proyectos -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1.5rem; margin-bottom: 2rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0, 245, 212, 0.12); border: 1px solid var(--neon-cyan); padding: 0.35rem 0.95rem; border-radius: 9999px; margin-bottom: 0.75rem;">
              <span>📁</span>
              <span style="font-weight: 800; font-size: 0.85rem; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 0.5px;">Panel de Proyectos Didácticos</span>
            </div>
            <h1 style="font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 900; margin: 0 0 0.5rem;">
              <span class="gradient-title">Mis Proyectos Educativos</span>
            </h1>
            <p style="color: var(--text-secondary); font-size: 1.05rem; margin: 0; max-width: 650px;">
              Diseña lecciones completas con presentaciones visuales en diapositivas o video clases explicativas.
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn" style="background: linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%); color: #fff; font-weight: 800; border: none; box-shadow: 0 0 16px rgba(124,58,237,0.55), 0 4px 12px rgba(0,0,0,0.3); letter-spacing: 0.03em;" onclick="window.ProjectsView.openImportPresentationModal()">
              <span>📥</span> Importar Presentación
            </button>
            <button class="btn btn-cyan btn-lg" onclick="window.ProjectsView.openCreateProjectModal()" style="box-shadow: 0 6px 20px rgba(0,245,212,0.35); font-weight: 800;">
              <span>➕</span> <span>Crear Nuevo Proyecto</span>
            </button>
            <button class="btn btn-outline" onclick="window.appRouter.openCategoryModal()">
              <span>🏷️</span> Categorías
            </button>
          </div>
        </div>

        <!-- Suite de Creación Rápida de Tipos de Proyecto (Solo Presentaciones y Videos) -->
        <section style="margin-bottom: 2.5rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            
            <!-- Card 1: Presentaciones -->
            <div 
              class="glass-panel" 
              onclick="window.ProjectsView.startNewProject('presentation')"
              style="padding: 1.6rem; border-radius: 16px; border: 2px solid #7c3aed; background: linear-gradient(135deg, rgba(124, 58, 237, 0.12), rgba(0,0,0,0.3)); cursor: pointer; transition: var(--transition-bounce);"
              onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--neon-cyan)'"
              onmouseleave="this.style.transform='none'; this.style.borderColor='#7c3aed'"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="font-size: 2.6rem;">📊</span>
                <span class="badge-tag" style="background: rgba(124, 58, 237, 0.25); color: #c4b5fd; font-weight: 800; font-size: 0.75rem;">DIAPOSITIVAS</span>
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 900; margin: 0 0 0.4rem; color: var(--text-primary);">Presentación Interactiva</h3>
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 1.2rem; line-height: 1.45;">
                Diapositivas visuales para explicar conceptos en clase con notas del docente, imágenes y temas estructurados.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 0.85rem; font-weight: 800; color: #a78bfa;">+ Crear Presentación</span>
                <span style="font-size: 1.1rem; color: #a78bfa;">→</span>
              </div>
            </div>

            <!-- Card 2: Video Interactivo -->
            <div 
              class="glass-panel" 
              onclick="window.ProjectsView.startNewProject('video')"
              style="padding: 1.6rem; border-radius: 16px; border: 2px solid #ef4444; background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(0,0,0,0.3)); cursor: pointer; transition: var(--transition-bounce);"
              onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--neon-cyan)'"
              onmouseleave="this.style.transform='none'; this.style.borderColor='#ef4444'"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.75rem;">
                <span style="font-size: 2.6rem;">🎬</span>
                <span class="badge-tag" style="background: rgba(239, 68, 68, 0.25); color: #fca5a5; font-weight: 800; font-size: 0.75rem;">VIDEO CLASE</span>
              </div>
              <h3 style="font-size: 1.25rem; font-weight: 900; margin: 0 0 0.4rem; color: var(--text-primary);">Video Clase</h3>
              <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 1.2rem; line-height: 1.45;">
                Integra videos educativos (YouTube, Drive, Vimeo, MP4) con capítulos, resumen pedagógico y debate de clase.
              </p>
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <span style="font-size: 0.85rem; font-weight: 800; color: #f87171;">+ Crear Video Clase</span>
                <span style="font-size: 1.1rem; color: #f87171;">→</span>
              </div>
            </div>

          </div>
        </section>

        <!-- Barra de Estadísticas Resumen -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2.25rem;">
          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(0, 245, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: var(--neon-cyan);">
              📁
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalProjects}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Proyectos Creados</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(124, 58, 237, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #a78bfa;">
              📊
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalSlides}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Diapositivas Totales</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; color: #f87171;">
              🎬
            </div>
            <div>
              <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalVideos}</div>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.2rem;">Video Clases</div>
            </div>
          </div>
        </div>

        <!-- Filtros de Tipo de Proyecto y Buscador -->
        <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 2rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            
            <!-- Selector de Tipo de Proyecto (Solo Presentaciones y Videos) -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button 
                onclick="window.ProjectsView.filterType('all')" 
                class="btn ${this.currentTypeFilter === 'all' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                🌟 Todos los Proyectos
              </button>
              <button 
                onclick="window.ProjectsView.filterType('presentation')" 
                class="btn ${this.currentTypeFilter === 'presentation' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                📊 Diapositivas
              </button>
              <button 
                onclick="window.ProjectsView.filterType('video')" 
                class="btn ${this.currentTypeFilter === 'video' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                🎬 Videos Interactivos
              </button>
            </div>

            <!-- Buscador -->
            <div style="flex: 1; min-width: 240px; position: relative;">
              <input 
                type="text" 
                id="projects-search-input"
                placeholder="🔍 Buscar por título o tema..." 
                value="${this.escapeHtml(this.searchQuery)}"
                oninput="window.ProjectsView.handleSearch(this.value)"
                style="width: 100%; padding: 0.7rem 1rem; border-radius: var(--border-radius-md); background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
              />
            </div>
          </div>

          <!-- Filtros de Categoría -->
          <div style="display: flex; gap: 0.5rem; overflow-x: auto; padding-bottom: 0.35rem; max-width: 100%;">
            <button 
              onclick="window.ProjectsView.filterCategory('all')" 
              class="btn ${this.currentCategory === 'all' ? 'btn-primary' : 'btn-outline'}"
              style="padding: 0.4rem 0.85rem; font-size: 0.82rem; white-space: nowrap;"
            >
              Todas las Materias (${allProjects.length})
            </button>
            ${categories.map(cat => {
              const count = allProjects.filter(c => c.category === cat.id).length;
              return `
                <button 
                  onclick="window.ProjectsView.filterCategory('${cat.id}')" 
                  class="btn ${this.currentCategory === cat.id ? 'btn-primary' : 'btn-outline'}"
                  style="padding: 0.4rem 0.85rem; font-size: 0.82rem; white-space: nowrap;"
                >
                  <span>${cat.icon}</span> ${cat.name} (${count})
                </button>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Grid de Proyectos / Retos -->
        ${allProjects.length === 0 ? `
          <div class="glass-panel" style="text-align: center; padding: 4.5rem 1.5rem; border: 2px dashed rgba(0, 245, 212, 0.35); border-radius: 20px;">
            <div style="font-size: 3.8rem; margin-bottom: 1rem;">📁</div>
            <h3 style="font-size: 1.5rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">Aún no has creado proyectos</h3>
            <p style="color: var(--text-secondary); font-size: 1rem; max-width: 500px; margin: 0 auto 1.75rem; line-height: 1.5;">
              Tu panel está limpio. Puedes crear tu primera presentación interactiva o video clase cuando desees.
            </p>
            <button class="btn btn-cyan btn-lg" onclick="window.ProjectsView.openCreateProjectModal()" style="font-weight: 900; box-shadow: 0 6px 20px rgba(0,245,212,0.35);">
              ➕ Crear Mi Primer Proyecto
            </button>
          </div>
        ` : (filtered.length === 0 ? `
          <div class="glass-panel" style="text-align: center; padding: 4rem 1.5rem;">
            <div style="font-size: 3.5rem; margin-bottom: 1rem;">🔍</div>
            <h3 style="font-size: 1.4rem; color: var(--text-primary); margin-bottom: 0.5rem;">No se encontraron proyectos</h3>
            <p style="color: var(--text-secondary); max-width: 480px; margin: 0 auto 1.5rem;">
              No hay proyectos que coincidan con los filtros seleccionados.
            </p>
            <button class="btn btn-primary" onclick="window.ProjectsView.resetFilters()">
              Restablecer Filtros
            </button>
          </div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem;">
            ${filtered.map(c => this.renderProjectCard(c, u)).join('')}
          </div>
        `)}

      </div>
    `;
  },

  renderProjectCard(c, currentUser) {
    const isAuthor = (currentUser && (
      (c.author && c.author.toLowerCase() === currentUser.name?.toLowerCase()) ||
      (c.authorId && c.authorId === currentUser.id)
    )) || (currentUser && (currentUser.role === 'teacher' || currentUser.role === 'admin'));

    const diffBadge = c.difficulty === 'Difícil' || c.difficulty === 'hard'
      ? '<span class="badge-tag tag-hard">Difícil</span>'
      : ((c.difficulty === 'Medio' || c.difficulty === 'medium') ? '<span class="badge-tag tag-medium">Medio</span>' : '<span class="badge-tag tag-easy">Fácil</span>');

    const projectType = c.projectType || 'presentation';
    const typeBadge = projectType === 'presentation'
      ? '<span class="badge-tag" style="background: rgba(124, 58, 237, 0.85); color: white;">📊 Diapositivas</span>'
      : '<span class="badge-tag" style="background: rgba(239, 68, 68, 0.85); color: white;">🎬 Video Clase</span>';

    const cardAction = projectType === 'presentation' 
      ? `window.appRouter.openPresentation('${c.id}')` 
      : `window.appRouter.openVideo('${c.id}')`;

    return `
      <div class="challenge-card" onclick="${cardAction}" style="display: flex; flex-direction: column; height: 100%; cursor: pointer;">
        <div class="challenge-banner" style="background-image: url('${c.banner || (projectType === 'presentation' ? 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800' : 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800')}'); position: relative; height: 160px;">
          <div style="position: absolute; top: 0.6rem; left: 0.6rem; display: flex; gap: 0.35rem;">
            ${typeBadge}
            ${diffBadge}
          </div>
          <span class="badge-tag" style="position: absolute; bottom: 0.6rem; left: 0.6rem; background: rgba(0,0,0,0.65); color: white;">
            ${projectType === 'presentation' ? `📄 ${(c.slides ? c.slides.length : 0)} diaps` : `⏱️ ${c.duration || 'Video'}`}
          </span>
          
          ${isAuthor ? `
            <button 
              class="btn btn-danger" 
              title="Eliminar este proyecto" 
              style="position: absolute; top: 0.6rem; right: 0.6rem; width: 34px; height: 34px; padding: 0; border-radius: 8px; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; z-index: 5; background: rgba(239, 68, 68, 0.9); box-shadow: 0 2px 8px rgba(0,0,0,0.4);" 
              onclick="event.stopPropagation(); window.appRouter.deleteChallenge('${c.id}')"
            >
              🗑️
            </button>
          ` : ''}
        </div>
        
        <div style="padding: 1.35rem; display: flex; flex-direction: column; flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; color: var(--neon-cyan); font-weight: 800;">${c.categoryName || 'General'}</span>
            <span style="color: var(--text-muted);">•</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              ${projectType === 'presentation' ? (c.slides ? c.slides.length : 0) + ' diapositivas' : (c.chapters ? c.chapters.length : 0) + ' capítulos'}
            </span>
          </div>

          <h3 style="font-size: 1.2rem; margin: 0 0 0.5rem; line-height: 1.3; font-weight: 800; color: var(--text-primary);">
            ${this.escapeHtml(c.title)}
          </h3>

          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0 0 1.25rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45;">
            ${this.escapeHtml(c.description || (projectType === 'presentation' ? 'Presentación de diapositivas interactivas para clase.' : 'Video clase con capítulos y resumen pedagógico.'))}
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1rem; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.82rem; color: var(--text-muted);">
              <span>${c.authorAvatar || '👤'}</span>
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.author || 'Docente'}</span>
            </div>

            <div style="display: flex; gap: 0.45rem; align-items: center;">
              ${projectType === 'presentation' ? `
                <button 
                  class="btn btn-outline" 
                  title="Editar Diapositivas"
                  style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                  onclick="event.stopPropagation(); window.appRouter.editPresentation('${c.id}')"
                >
                  ✏️
                </button>
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, var(--neon-cyan)); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openPresentation('${c.id}')"
                >
                  🖥️ Presentar
                </button>
              ` : `
                <button 
                  class="btn btn-outline" 
                  title="Editar Video Clase"
                  style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                  onclick="event.stopPropagation(); window.appRouter.editVideo('${c.id}')"
                >
                  ✏️
                </button>
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #ef4444, #dc2626); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openVideo('${c.id}')"
                >
                  🎬 Ver Video
                </button>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  filterType(type) {
    this.currentTypeFilter = type;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  filterCategory(catId) {
    this.currentCategory = catId;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  },

  resetFilters() {
    this.currentCategory = 'all';
    this.currentTypeFilter = 'all';
    this.searchQuery = '';
    this.render();
  },

  openCreateProjectModal() {
    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.add('active');
  },

  closeCreateProjectModal() {
    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.remove('active');
  },

  startNewProject(type) {
    this.closeCreateProjectModal();
    if (type === 'presentation') {
      window.appRouter.createPresentation();
    } else if (type === 'video') {
      window.appRouter.createVideo();
    } else {
      window.appRouter.navigate('creator');
    }
  },

  openImportPresentationModal() {
    window.appRouter.createPresentation();
    setTimeout(() => {
      if (window.PresentationView) {
        window.PresentationView.openImportModal();
      }
    }, 120);
  },

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
