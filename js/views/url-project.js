/**
 * 🔗 MENTIX - Vista de Enlaces Web / Recursos URL (url-project.js)
 * Permite incrustar y enlazar recursos web interactivos, simuladores, GeoGebra, Wikipedia, formularios, etc.
 */

window.UrlProjectView = {
  currentProject: null,
  isEditing: false,

  render(params = {}) {
    const container = document.getElementById('view-url');
    if (!container) return;

    if (params.edit) {
      this.isEditing = true;
      const proj = params.project || (params.id ? (window.appState.challenges || []).find(c => c.id === params.id) : null) || this.currentProject || this.createBlankUrlProject();
      this.currentProject = proj;
      this.renderEditor(container);
    } else {
      this.isEditing = false;
      const proj = params.project || (params.id ? window.appState.challenges.find(c => c.id === params.id) : null);
      if (!proj || !proj.resourceWebUrl) {
        window.appRouter.navigate('projects');
        return;
      }
      this.currentProject = proj;
      this.renderViewer(container);
    }
  },

  createBlankUrlProject() {
    return {
      id: 'proj_url_' + Date.now(),
      title: 'Nuevo Recurso Web',
      description: 'Enlace interactivo a simulador, sitio web educativo o herramienta digital.',
      projectType: 'url',
      resourceWebUrl: '',
      allowIframe: true,
      category: 'tecnologia',
      categoryName: 'Tecnología & Programación',
      author: window.appState.currentUser?.name || 'Profesor',
      authorAvatar: window.appState.currentUser?.avatar || '👨‍🏫',
      banner: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800',
      difficulty: 'Fácil'
    };
  },

  renderViewer(container) {
    const p = this.currentProject;
    const url = p.resourceWebUrl || '';

    container.innerHTML = `
      <div style="max-width: 1250px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Barra Superior -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')">
              ← Volver a Proyectos
            </button>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge-tag" style="background: rgba(16, 185, 129, 0.25); color: #6ee7b7; font-weight: 800;">ENLACE / WEB</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${p.categoryName || 'General'}</span>
              </div>
              <h2 style="font-size: 1.3rem; font-weight: 800; margin: 0.2rem 0 0; color: var(--text-primary);">
                ${this.escapeHtml(p.title)}
              </h2>
            </div>
          </div>

          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline" onclick="window.UrlProjectView.openEditMode()">
              ✏️ Editar
            </button>
            <a href="${this.escapeHtml(url)}" target="_blank" rel="noopener noreferrer" class="btn btn-cyan" style="font-weight: 800; background: linear-gradient(135deg, #10b981, var(--neon-cyan)); border: none; text-decoration: none;">
              ↗️ Abrir en Nueva Pestaña
            </a>
          </div>
        </div>

        <!-- Marco Interactivo del Recurso Web -->
        <div class="glass-panel" style="padding: 1rem; border-radius: 20px; border: 2px solid #10b981; overflow: hidden; min-height: 600px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 0.6rem 1rem; border-radius: 12px; margin-bottom: 0.8rem; font-size: 0.85rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span style="color: #10b981;">🌐</span>
              <span style="color: var(--text-muted); max-width: 600px; overflow: hidden; text-overflow: ellipsis;">${this.escapeHtml(url)}</span>
            </div>
            <a href="${this.escapeHtml(url)}" target="_blank" style="color: var(--neon-cyan); font-weight: 700; text-decoration: underline;">
              Visitar sitio oficial ↗
            </a>
          </div>

          <iframe 
            src="${this.escapeHtml(url)}" 
            style="width: 100%; height: calc(100vh - 280px); min-height: 540px; border: none; border-radius: 12px; background: #ffffff;"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
          ></iframe>
        </div>

      </div>
    `;
  },

  renderEditor(container) {
    const p = this.currentProject;
    const categories = window.appState.categories || [];

    container.innerHTML = `
      <div style="max-width: 850px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header Editor -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="badge-tag" style="background: rgba(16, 185, 129, 0.8); color: white;">EDITOR DE ENLACE WEB</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Recurso / Simulador</span>
            </div>
            <h1 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: var(--text-primary);">
              Crear Recurso por URL
            </h1>
          </div>

          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')">
              Cancelar
            </button>
            <button class="btn btn-cyan" onclick="window.UrlProjectView.saveUrlProject()" style="font-weight: 800; background: linear-gradient(135deg, #10b981, var(--neon-cyan)); border: none;">
              💾 Guardar Enlace
            </button>
          </div>
        </div>

        <!-- Formulario -->
        <div class="glass-panel" style="padding: 2rem; border-radius: 20px; border: 2px solid #10b981;">
          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.9rem; font-weight: 800; margin-bottom: 0.4rem; color: #6ee7b7;">
              🌐 URL o Dirección Web del Recurso *
            </label>
            <input 
              type="url" 
              value="${this.escapeHtml(p.resourceWebUrl || '')}" 
              placeholder="https://phet.colorado.edu/... o https://geogebra.org/..."
              style="width: 100%; padding: 0.85rem 1rem; border-radius: 12px; background: rgba(0,0,0,0.4); border: 2px solid #10b981; color: var(--text-primary); font-size: 1.05rem; outline: none;"
              oninput="window.UrlProjectView.currentProject.resourceWebUrl = this.value"
            />
            <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.3rem; display: block;">
              Soporta simuladores (PhET, GeoGebra), páginas de consulta, mapas interactivos, formularios de Google o sitios web educativos.
            </span>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Título del Proyecto *</label>
            <input 
              type="text" 
              value="${this.escapeHtml(p.title)}" 
              placeholder="Ej: Simulador Interactivo de Circuitos Eléctricos"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 1rem; font-weight: 700; outline: none;"
              oninput="window.UrlProjectView.currentProject.title = this.value"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Materia / Categoría</label>
              <select 
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                onchange="window.UrlProjectView.setCategory(this.value)"
              >
                ${categories.map(cat => `
                  <option value="${cat.id}" ${p.category === cat.id ? 'selected' : ''}>
                    ${cat.icon} ${cat.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Imagen de Portada (Opcional)</label>
              <input 
                type="text" 
                value="${this.escapeHtml(p.banner || '')}" 
                placeholder="https://images.unsplash.com/..."
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                oninput="window.UrlProjectView.currentProject.banner = this.value"
              />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Descripción del Recurso</label>
            <textarea 
              rows="3" 
              placeholder="Explica a los estudiantes qué aprenderán o experimentarán en esta página web..."
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
              oninput="window.UrlProjectView.currentProject.description = this.value"
            >${this.escapeHtml(p.description || '')}</textarea>
          </div>
        </div>

      </div>
    `;
  },

  setCategory(catId) {
    const cat = (window.appState.categories || []).find(c => c.id === catId);
    if (cat) {
      this.currentProject.category = cat.id;
      this.currentProject.categoryName = cat.name;
    }
  },

  openEditMode() {
    this.isEditing = true;
    this.renderEditor(document.getElementById('view-url'));
  },

  saveUrlProject() {
    const p = this.currentProject;
    if (!p.title || !p.title.trim()) {
      alert('Ingresa un título para el recurso web.');
      return;
    }
    if (!p.resourceWebUrl || !p.resourceWebUrl.trim()) {
      alert('Ingresa una URL válida (ej: https://...).');
      return;
    }

    if (!p.resourceWebUrl.startsWith('http://') && !p.resourceWebUrl.startsWith('https://')) {
      p.resourceWebUrl = 'https://' + p.resourceWebUrl;
    }

    const u = window.appState.currentUser;
    p.author = p.author || u?.name || 'Docente';
    p.authorAvatar = p.authorAvatar || u?.avatar || '👨‍🏫';
    p.authorId = p.authorId || u?.id || ('user_' + (u?.email || u?.name || 'anon'));
    p.authorEmail = p.authorEmail || u?.email || '';

    const existingIndex = window.appState.challenges.findIndex(c => c.id === p.id);
    if (existingIndex >= 0) {
      window.appState.challenges[existingIndex] = p;
    } else {
      window.appState.challenges.unshift(p);
    }

    saveGlobalState(window.appState);
    if (window.appRouter && window.appRouter.pushChallengeToCloud) {
      window.appRouter.pushChallengeToCloud(p);
    }
    alert('✅ ¡Recurso Web guardado exitosamente!');
    this.isEditing = false;
    this.renderViewer(document.getElementById('view-url'));
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
