/**
 * 📄 MENTIX - Vista de Documentos Educativos (document-project.js)
 * Permite crear, redactar y estructurar guías de clase, lecturas, apuntes o PDFs.
 */

window.DocumentProjectView = {
  currentProject: null,
  isEditing: false,

  render(params = {}) {
    const container = document.getElementById('view-document');
    if (!container) return;

    if (params.edit) {
      this.isEditing = true;
      const proj = params.project || (params.id ? (window.appState.challenges || []).find(c => c.id === params.id) : null) || this.currentProject || this.createBlankDocumentProject();
      this.currentProject = proj;
      this.renderEditor(container);
    } else {
      this.isEditing = false;
      const proj = params.project || (params.id ? window.appState.challenges.find(c => c.id === params.id) : null);
      if (!proj) {
        window.appRouter.navigate('projects');
        return;
      }
      this.currentProject = proj;
      this.renderViewer(container);
    }
  },

  createBlankDocumentProject() {
    return {
      id: 'proj_doc_' + Date.now(),
      title: 'Nuevo Documento de Estudio',
      description: 'Guía pedagógica, apuntes y lecturas complementarias.',
      projectType: 'document',
      docContent: '',
      docFileUrl: '',
      category: 'tecnologia',
      categoryName: 'Tecnología & Programación',
      author: window.appState.currentUser?.name || 'Profesor',
      authorAvatar: window.appState.currentUser?.avatar || '👨‍🏫',
      banner: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
      difficulty: 'Medio',
      sections: [
        { title: '1. Introducción y Objetivos', text: 'Define el propósito principal de esta lectura o guía.' },
        { title: '2. Contenido Teórico', text: 'Desarrolla los conceptos clave explicados con claridad.' },
        { title: '3. Conclusiones y Actividades', text: 'Preguntas de repaso o ejercicios prácticos para el estudiante.' }
      ]
    };
  },

  renderViewer(container) {
    const p = this.currentProject;
    const sections = p.sections || [];

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Barra Superior -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')">
            ← Volver a Proyectos
          </button>
          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline" onclick="window.DocumentProjectView.openEditMode()">
              ✏️ Editar Documento
            </button>
            <button class="btn btn-cyan" onclick="window.print()">
              🖨️ Imprimir / Guardar PDF
            </button>
          </div>
        </div>

        <!-- Encabezado del Documento -->
        <div class="glass-panel" style="padding: 2.5rem; border-radius: 20px; border: 2px solid #3b82f6; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(0,0,0,0.4));">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem;">
            <span class="badge-tag" style="background: rgba(59, 130, 246, 0.25); color: #93c5fd; font-weight: 800;">DOCUMENTO DIDÁCTICO</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">${p.categoryName || 'General'}</span>
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 900; margin: 0 0 0.8rem; color: var(--text-primary); line-height: 1.2;">
            ${this.escapeHtml(p.title)}
          </h1>
          <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0 0 1.5rem; line-height: 1.5;">
            ${this.escapeHtml(p.description || '')}
          </p>

          <div style="display: flex; align-items: center; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            <span>${p.authorAvatar || '👤'} Creado por: <strong style="color: var(--text-primary);">${this.escapeHtml(p.author || 'Docente')}</strong></span>
            ${p.docFileUrl ? `<span>• <a href="${this.escapeHtml(p.docFileUrl)}" target="_blank" style="color: var(--neon-cyan); text-decoration: underline;">Descargar Archivo Adjunto 📥</a></span>` : ''}
          </div>
        </div>

        <!-- Cuerpo del Documento -->
        <div class="glass-panel" style="padding: 2.5rem; border-radius: 20px; border: 1.5px solid var(--border-color); line-height: 1.7; font-size: 1.05rem; color: var(--text-primary);">
          ${p.docContent ? `
            <div style="white-space: pre-wrap; margin-bottom: 2rem;">${this.escapeHtml(p.docContent)}</div>
          ` : ''}

          ${sections.map((sec, i) => `
            <div style="margin-bottom: 2rem; border-bottom: ${i < sections.length - 1 ? '1px solid rgba(255,255,255,0.08)' : 'none'}; padding-bottom: ${i < sections.length - 1 ? '1.5rem' : '0'};">
              <h3 style="font-size: 1.35rem; font-weight: 800; color: #60a5fa; margin: 0 0 0.6rem;">
                ${this.escapeHtml(sec.title)}
              </h3>
              <div style="white-space: pre-wrap; color: var(--text-secondary);">
                ${this.escapeHtml(sec.text)}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  renderEditor(container) {
    const p = this.currentProject;
    const categories = window.appState.categories || [];
    const sections = p.sections || [];

    container.innerHTML = `
      <div style="max-width: 950px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header Editor -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="badge-tag" style="background: rgba(59, 130, 246, 0.8); color: white;">EDITOR DE DOCUMENTO</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Guía & Apuntes</span>
            </div>
            <h1 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: var(--text-primary);">
              Redactar Documento Didáctico
            </h1>
          </div>

          <div style="display: flex; gap: 0.6rem;">
            <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')">
              Cancelar
            </button>
            <button class="btn btn-cyan" onclick="window.DocumentProjectView.saveDocument()" style="font-weight: 800; background: linear-gradient(135deg, #3b82f6, var(--neon-cyan)); border: none;">
              💾 Guardar Documento
            </button>
          </div>
        </div>

        <!-- Panel de Ajustes Generales -->
        <div class="glass-panel" style="padding: 1.75rem; border-radius: 16px; margin-bottom: 1.5rem; border: 1.5px solid var(--border-color);">
          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Título del Documento *</label>
            <input 
              type="text" 
              value="${this.escapeHtml(p.title)}" 
              placeholder="Ej: Guía de Estudio: Las Leyes de Newton"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 1.05rem; font-weight: 700; outline: none;"
              oninput="window.DocumentProjectView.currentProject.title = this.value"
            />
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Materia / Categoría</label>
              <select 
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                onchange="window.DocumentProjectView.setCategory(this.value)"
              >
                ${categories.map(cat => `
                  <option value="${cat.id}" ${p.category === cat.id ? 'selected' : ''}>
                    ${cat.icon} ${cat.name}
                  </option>
                `).join('')}
              </select>
            </div>

            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">URL de Archivo PDF / Word (Opcional)</label>
              <input 
                type="text" 
                value="${this.escapeHtml(p.docFileUrl || '')}" 
                placeholder="https://drive.google.com/... o enlace de descarga"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                oninput="window.DocumentProjectView.currentProject.docFileUrl = this.value"
              />
            </div>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Descripción Corta / Resumen</label>
            <textarea 
              rows="2" 
              placeholder="Breve resumen del propósito de este documento..."
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
              oninput="window.DocumentProjectView.currentProject.description = this.value"
            >${this.escapeHtml(p.description || '')}</textarea>
          </div>
        </div>

        <!-- Secciones del Documento -->
        <div class="glass-panel" style="padding: 1.75rem; border-radius: 16px; margin-bottom: 1.5rem; border: 1.5px solid var(--border-color);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 0.2rem; color: var(--text-primary);">
                Secciones de Contenido
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Estructura el documento por subtítulos y párrafos temáticos.</p>
            </div>
            <button class="btn btn-cyan" onclick="window.DocumentProjectView.addSection()" style="font-size: 0.85rem; font-weight: 800;">
              + Añadir Sección
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 1.25rem;">
            ${sections.map((sec, idx) => `
              <div style="background: rgba(0,0,0,0.3); padding: 1.25rem; border-radius: 12px; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; gap: 1rem;">
                  <input 
                    type="text" 
                    value="${this.escapeHtml(sec.title)}" 
                    placeholder="Título de la sección..." 
                    style="flex: 1; padding: 0.55rem 0.85rem; border-radius: 8px; background: rgba(0,0,0,0.5); border: 1px solid var(--border-color); color: #60a5fa; font-weight: 800; font-size: 0.95rem; outline: none;"
                    oninput="window.DocumentProjectView.updateSection(${idx}, 'title', this.value)"
                  />
                  <button 
                    class="btn btn-danger" 
                    style="width: 34px; height: 34px; padding: 0; font-size: 0.85rem; border-radius: 8px;" 
                    onclick="window.DocumentProjectView.removeSection(${idx})"
                    title="Eliminar sección"
                  >
                    ✕
                  </button>
                </div>
                <textarea 
                  rows="4" 
                  placeholder="Escribe la explicación, apuntes o ejercicios para esta sección..."
                  style="width: 100%; padding: 0.75rem 1rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
                  oninput="window.DocumentProjectView.updateSection(${idx}, 'text', this.value)"
                >${this.escapeHtml(sec.text || '')}</textarea>
              </div>
            `).join('')}
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

  addSection() {
    if (!this.currentProject.sections) this.currentProject.sections = [];
    this.currentProject.sections.push({
      title: `Sección ${this.currentProject.sections.length + 1}`,
      text: ''
    });
    this.renderEditor(document.getElementById('view-document'));
  },

  removeSection(idx) {
    this.currentProject.sections.splice(idx, 1);
    this.renderEditor(document.getElementById('view-document'));
  },

  updateSection(idx, field, val) {
    if (!this.currentProject.sections[idx]) return;
    this.currentProject.sections[idx][field] = val;
  },

  openEditMode() {
    this.isEditing = true;
    this.renderEditor(document.getElementById('view-document'));
  },

  saveDocument() {
    const p = this.currentProject;
    if (!p.title || !p.title.trim()) {
      alert('Ingresa un título para el documento.');
      return;
    }

    const existingIndex = window.appState.challenges.findIndex(c => c.id === p.id);
    if (existingIndex >= 0) {
      window.appState.challenges[existingIndex] = p;
    } else {
      window.appState.challenges.unshift(p);
    }

    saveGlobalState(window.appState);
    alert('✅ ¡Documento guardado con éxito!');
    this.isEditing = false;
    this.renderViewer(document.getElementById('view-document'));
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
