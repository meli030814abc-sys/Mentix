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
      pdfPages: [],
      originalFormat: 'sections',
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
    const pdfPages = p.pdfPages || [];
    const isPdfView = pdfPages.length > 0;

    container.innerHTML = `
      <div style="max-width: ${isPdfView ? '980px' : '900px'}; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Barra Superior -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; flex-wrap: wrap; gap: 1rem;">
          <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')">
            ← Volver a Proyectos
          </button>
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="window.DocumentProjectView.openEditMode()">
              ✏️ Editar Documento
            </button>
            <button class="btn btn-cyan" onclick="window.print()" style="font-weight: 800;">
              🖨️ Imprimir / Guardar PDF
            </button>
          </div>
        </div>

        <!-- Encabezado del Documento -->
        <div class="glass-panel" style="padding: 2.25rem; border-radius: 20px; border: 2px solid #3b82f6; margin-bottom: 2rem; background: linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(0,0,0,0.5));">
          <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span class="badge-tag" style="background: rgba(59, 130, 246, 0.3); color: #93c5fd; font-weight: 800;">
                ${isPdfView ? '📄 DOCUMENTO / PDF ORIGINAL' : 'DOCUMENTO DIDÁCTICO'}
              </span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">${p.categoryName || 'General'}</span>
            </div>
            ${isPdfView ? `
              <span class="badge-tag" style="background: rgba(16, 185, 129, 0.2); color: #6ee7b7; font-weight: 800;">
                ✓ ${pdfPages.length} página${pdfPages.length > 1 ? 's' : ''} en formato original
              </span>
            ` : ''}
          </div>
          <h1 style="font-size: 2.2rem; font-weight: 900; margin: 0 0 0.8rem; color: var(--text-primary); line-height: 1.2;">
            ${this.escapeHtml(p.title)}
          </h1>
          <p style="font-size: 1.05rem; color: var(--text-secondary); margin: 0 0 1.25rem; line-height: 1.5;">
            ${this.escapeHtml(p.description || '')}
          </p>

          <div style="display: flex; align-items: center; gap: 1rem; border-top: 1px solid var(--border-color); padding-top: 1rem; font-size: 0.85rem; color: var(--text-muted); flex-wrap: wrap;">
            <span>${p.authorAvatar || '👤'} Creado por: <strong style="color: var(--text-primary);">${this.escapeHtml(p.author || 'Docente')}</strong></span>
            ${p.docFileUrl ? `<span>• <a href="${this.escapeHtml(p.docFileUrl)}" target="_blank" style="color: var(--neon-cyan); text-decoration: underline;">Descargar Archivo Adjunto 📥</a></span>` : ''}
          </div>
        </div>

        <!-- Visor del Documento: Modo PDF Fiel vs Modo Texto -->
        ${isPdfView ? `
          <div style="display: flex; flex-direction: column; gap: 2rem;">
            ${pdfPages.map((pageImg, idx) => `
              <div class="glass-panel" style="padding: 1rem; border-radius: 16px; border: 1.5px solid var(--border-color); background: #18181b; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.4rem 0.8rem 0.8rem; font-size: 0.82rem; color: var(--text-muted); border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 0.8rem;">
                  <span>Página ${idx + 1} de ${pdfPages.length}</span>
                  <span style="color: var(--neon-cyan); font-weight: 700;">Vista de Hoja Impresa</span>
                </div>
                <img 
                  src="${pageImg}" 
                  alt="Página ${idx + 1}" 
                  style="width: 100%; height: auto; display: block; border-radius: 8px; box-shadow: 0 4px 14px rgba(0,0,0,0.4);"
                  loading="lazy"
                />
              </div>
            `).join('')}
          </div>
        ` : `
          <!-- Modo de Lectura Tradicional -->
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
        `}

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

          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap;">
            <button class="btn btn-outline" style="border-color: #3b82f6; color: #93c5fd; font-weight: 800; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="window.DocumentProjectView.openImportModal()">
              <span>📥</span> Importar Documento
            </button>
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

        <!-- Panel de Páginas del Documento Fiel (Si fue importado como PDF/Word) -->
        ${(p.pdfPages && p.pdfPages.length > 0) ? `
          <div class="glass-panel" style="padding: 1.5rem; border-radius: 16px; margin-bottom: 1.5rem; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
              <div>
                <div style="font-size: 0.82rem; font-weight: 800; color: #6ee7b7; text-transform: uppercase;">
                  ✓ Formato Impreso Fiel Activo
                </div>
                <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0.2rem 0 0; color: var(--text-primary);">
                  Páginas del Documento (${p.pdfPages.length} página${p.pdfPages.length > 1 ? 's' : ''})
                </h3>
              </div>
              <button 
                type="button" 
                class="btn btn-outline" 
                style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: #ef4444; color: #fca5a5;" 
                onclick="window.DocumentProjectView.clearPdfPages()"
              >
                🗑️ Quitar formato de páginas fijas
              </button>
            </div>
            <div style="display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.75rem;">
              ${p.pdfPages.map((pg, i) => `
                <div style="min-width: 140px; max-width: 160px; background: #000; border: 1px solid var(--border-color); border-radius: 8px; padding: 0.4rem; text-align: center;">
                  <img src="${pg}" alt="Página ${i + 1}" style="width: 100%; height: 180px; object-fit: contain; border-radius: 4px; display: block; margin: 0 auto 0.4rem;" />
                  <span style="font-size: 0.78rem; color: var(--text-muted);">Página ${i + 1}</span>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}

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

  // ==========================================
  // 📥 IMPORTACIÓN INTELIGENTE DE DOCUMENTOS
  // ==========================================
  openImportModal() {
    const modal = document.getElementById('document-import-modal');
    if (modal) {
      modal.classList.add('active');
      const textarea = document.getElementById('doc-import-textarea');
      if (textarea) textarea.value = '';
      const label = document.getElementById('doc-dropzone-label');
      if (label) label.textContent = 'Arrastra tu documento aquí o haz clic para seleccionarlo';
      const filename = document.getElementById('doc-dropzone-filename');
      if (filename) filename.textContent = 'Soporta Word (.docx), PDF (.pdf), Markdown (.md) y archivos de texto (.txt)';
      this.pendingParsedDoc = null;
    }
  },

  closeImportModal() {
    const modal = document.getElementById('document-import-modal');
    if (modal) modal.classList.remove('active');
  },

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('doc-file-dropzone');
    if (dropzone) dropzone.classList.add('dragover');
  },

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('doc-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
  },

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('doc-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFileInput(e.dataTransfer.files[0]);
    }
  },

  async handleFileInput(file) {
    if (!file) return;
    const label = document.getElementById('doc-dropzone-label');
    const filename = document.getElementById('doc-dropzone-filename');
    const textarea = document.getElementById('doc-import-textarea');

    if (label) label.textContent = `📄 ${file.name}`;
    if (filename) filename.textContent = `Tamaño: ${(file.size / 1024).toFixed(1)} KB — Procesando archivo...`;

    const ext = file.name.toLowerCase().split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    // 1. Archivos PDF (.pdf) -> Renderizado fiel a páginas impresas
    if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (filename) filename.textContent = 'Renderizando páginas visuales de alta definición del PDF...';
          const pages = await this.renderPdfPagesFromBuffer(e.target.result);
          const text = await this.extractTextFromPDF(e.target.result);
          
          this.pendingParsedDoc = {
            title: baseName,
            pdfPages: pages || [],
            originalFormat: 'pdf',
            sections: this.parseDocumentText(text || baseName, baseName).sections
          };

          if (textarea) textarea.value = text.substring(0, 3000);
          if (filename) {
            filename.textContent = `✅ ¡PDF procesado! Se capturaron ${pages.length} páginas visuales idénticas al original. Haz clic en "Procesar e Importar".`;
          }
        } catch(err) {
          if (filename) filename.textContent = '⚠️ Error procesando PDF: ' + err.message;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 2. Archivos Word (.docx) -> Conversión visual a páginas fieles estilo hoja impresa PDF
    if (ext === 'docx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          if (filename) filename.textContent = 'Convirtiendo documento de Word a formato fiel de hoja PDF...';
          const text = await this.extractTextFromDOCX(e.target.result);
          if (text) {
            const pages = await this.renderTextToDocumentPages(text, baseName);
            const parsedOutline = this.parseDocumentText(text, baseName);

            this.pendingParsedDoc = {
              title: parsedOutline.title || baseName,
              pdfPages: pages || [],
              originalFormat: 'docx',
              sections: parsedOutline.sections
            };

            if (textarea) textarea.value = text.substring(0, 3000);
            if (filename) {
              filename.textContent = `✅ ¡Word procesado! Se generaron ${pages.length} páginas en formato PDF idéntico. Haz clic en "Procesar e Importar".`;
            }
          } else {
            if (filename) filename.textContent = '⚠️ No se pudo extraer el contenido del archivo Word.';
          }
        } catch(err) {
          if (filename) filename.textContent = '⚠️ Error leyendo DOCX: ' + err.message;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 3. Texto plano / Markdown (.txt, .md)
    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result || '';
      const pages = await this.renderTextToDocumentPages(text, baseName);
      const parsedOutline = this.parseDocumentText(text, baseName);

      this.pendingParsedDoc = {
        title: parsedOutline.title || baseName,
        pdfPages: pages || [],
        originalFormat: ext,
        sections: parsedOutline.sections
      };

      if (textarea) textarea.value = text;
      if (filename) {
        filename.textContent = `✅ Documento leído con éxito (${pages.length} páginas generadas en formato PDF). Haz clic en "Procesar e Importar".`;
      }
    };
    reader.readAsText(file, 'UTF-8');
  },

  async renderPdfPagesFromBuffer(arrayBuffer) {
    if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
      return [];
    }
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const pages = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        // Escala 2.0 para nitidez fotográfica idéntica al original
        const scale = 2.0;
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext('2d');
        await page.render({ canvasContext: ctx, viewport }).promise;
        pages.push(canvas.toDataURL('image/jpeg', 0.92));
      }
      return pages;
    } catch(err) {
      console.warn('PDF render pages error:', err);
      return [];
    }
  },

  /**
   * Transforma texto de Word (.docx) o TXT en hojas visuales PDF de alta calidad con márgenes,
   * tipografía editorial, encabezado y numeración de página.
   */
  async renderTextToDocumentPages(rawText, docTitle) {
    if (!rawText) return [];

    const pageWidth = 1600;
    const pageHeight = 2260; // Proporción A4 / Hoja estándar (1 : 1.414)
    const marginX = 140;
    const marginTop = 180;
    const marginBottom = 150;
    const lineHeight = 44;
    const contentWidth = pageWidth - (marginX * 2);

    const paragraphs = rawText.split('\n').map(p => p.trim()).filter(Boolean);
    const pages = [];

    let currentCanvas = document.createElement('canvas');
    currentCanvas.width = pageWidth;
    currentCanvas.height = pageHeight;
    let ctx = currentCanvas.getContext('2d');

    const initPageBackground = (ctxRef, pageIndex) => {
      // Fondo blanco tipo papel
      ctxRef.fillStyle = '#ffffff';
      ctxRef.fillRect(0, 0, pageWidth, pageHeight);

      // Encabezado sutil
      ctxRef.fillStyle = '#64748b';
      ctxRef.font = '500 22px system-ui, -apple-system, sans-serif';
      ctxRef.fillText((docTitle || 'Documento').substring(0, 60), marginX, 90);

      // Línea divisoria superior
      ctxRef.strokeStyle = '#e2e8f0';
      ctxRef.lineWidth = 2;
      ctxRef.beginPath();
      ctxRef.moveTo(marginX, 115);
      ctxRef.lineTo(pageWidth - marginX, 115);
      ctxRef.stroke();

      // Pie de página con numeración
      ctxRef.fillText(`Página ${pageIndex}`, pageWidth - marginX - 110, pageHeight - 70);
      ctxRef.beginPath();
      ctxRef.moveTo(marginX, pageHeight - 100);
      ctxRef.lineTo(pageWidth - marginX, pageHeight - 100);
      ctxRef.stroke();
    };

    let pageNum = 1;
    initPageBackground(ctx, pageNum);
    let currentY = marginTop;

    const wrapText = (text, maxWidth) => {
      const words = text.split(' ');
      const lines = [];
      let currentLine = words[0] || '';

      for (let i = 1; i < words.length; i++) {
        const word = words[i];
        const width = ctx.measureText(currentLine + ' ' + word).width;
        if (width < maxWidth) {
          currentLine += ' ' + word;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
      if (currentLine) lines.push(currentLine);
      return lines;
    };

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const pText = paragraphs[pIdx];

      // Detectar si es un encabezado o subtítulo
      const isHeading = pText.startsWith('#') || 
                        /^\d+[\.\)]\s+/.test(pText) || 
                        (pText.length < 80 && pText.endsWith('?')) || 
                        (pText.length < 60 && pText === pText.toUpperCase());

      if (isHeading) {
        ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
      } else {
        ctx.font = 'normal 27px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';
      }

      const cleanText = pText.replace(/^#+\s*/, '');
      const lines = wrapText(cleanText, contentWidth);
      const paragraphHeight = (lines.length * lineHeight) + (isHeading ? 36 : 24);

      // Si no cabe en la página actual, guardar y crear nueva hoja
      if (currentY + paragraphHeight > pageHeight - marginBottom) {
        pages.push(currentCanvas.toDataURL('image/jpeg', 0.92));
        pageNum++;
        currentCanvas = document.createElement('canvas');
        currentCanvas.width = pageWidth;
        currentCanvas.height = pageHeight;
        ctx = currentCanvas.getContext('2d');
        initPageBackground(ctx, pageNum);
        currentY = marginTop;
      }

      // Dibujar líneas
      if (isHeading) {
        ctx.font = 'bold 34px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#0f172a';
        currentY += 10;
      } else {
        ctx.font = 'normal 27px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#1e293b';
      }

      for (let l = 0; l < lines.length; l++) {
        ctx.fillText(lines[l], marginX, currentY);
        currentY += lineHeight;
      }
      currentY += isHeading ? 24 : 18;
    }

    pages.push(currentCanvas.toDataURL('image/jpeg', 0.92));
    return pages;
  },

  async extractTextFromPDF(arrayBuffer) {
    if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
      return '';
    }
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = '';
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += `\n\n--- Página ${pageNum} ---\n` + pageText;
      }
      return fullText.trim();
    } catch(err) {
      console.warn('PDF extract text error:', err);
      return '';
    }
  },

  async extractTextFromDOCX(arrayBuffer) {
    try {
      const bytes = new Uint8Array(arrayBuffer);
      const dv = new DataView(arrayBuffer);
      const dec = new TextDecoder('utf-8', { fatal: false });

      // Buscar document.xml en el zip
      let eocd = -1;
      for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 65600); i--) {
        if (dv.getUint32(i, true) === 0x06054b50) { eocd = i; break; }
      }
      if (eocd < 0) return '';

      const total = dv.getUint16(eocd + 10, true);
      let ptr = dv.getUint32(eocd + 16, true);
      let docXmlData = null;

      for (let n = 0; n < total; n++) {
        if (ptr + 46 > bytes.length || dv.getUint32(ptr, true) !== 0x02014b50) break;
        const method = dv.getUint16(ptr + 10, true);
        const csize = dv.getUint32(ptr + 20, true);
        const nl = dv.getUint16(ptr + 28, true);
        const el = dv.getUint16(ptr + 30, true);
        const cl = dv.getUint16(ptr + 32, true);
        const off = dv.getUint32(ptr + 42, true);
        const name = dec.decode(bytes.subarray(ptr + 46, ptr + 46 + nl));

        if (name === 'word/document.xml') {
          const l_nl = dv.getUint16(off + 26, true);
          const l_el = dv.getUint16(off + 28, true);
          const start = off + 30 + l_nl + l_el;
          const data = bytes.subarray(start, start + csize);
          if (method === 0) {
            docXmlData = data;
          } else if (method === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw');
            const writer = ds.writable.getWriter();
            writer.write(data);
            writer.close();
            docXmlData = new Uint8Array(await new Response(ds.readable).arrayBuffer());
          }
          break;
        }
        ptr += 46 + nl + el + cl;
      }

      if (!docXmlData) return '';
      const xmlStr = dec.decode(docXmlData);

      // Extraer párrafos de Word
      const pMatches = xmlStr.match(/<w:p[ >][\s\S]*?<\/w:p>/g) || [];
      const paragraphs = pMatches.map(p => {
        const tMatches = p.match(/<w:t[ >][\s\S]*?<\/w:t>/g) || [];
        return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
      }).filter(text => text.trim().length > 0);

      return paragraphs.join('\n\n');
    } catch(err) {
      console.warn('DOCX extract error:', err);
      return '';
    }
  },

  parseDocumentText(rawText, defaultTitle = 'Documento Importado') {
    if (!rawText) return { title: defaultTitle, sections: [] };

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let title = defaultTitle;
    const sections = [];
    let currentSection = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar título principal
      if (i === 0 && (line.startsWith('# ') || !line.includes('.'))) {
        title = line.replace(/^#+\s*/, '');
        continue;
      }

      // Detectar subtítulo o nueva sección (##, números como 1., 2., o mayúsculas cortas)
      const isHeader = line.startsWith('## ') || line.startsWith('### ') || 
                       /^\d+[\.\)]\s+[A-ZÁÉÍÓÚ]/.test(line) ||
                       (line.length < 65 && line === line.toUpperCase() && line.length > 3);

      if (isHeader) {
        if (currentSection) sections.push(currentSection);
        currentSection = {
          title: line.replace(/^#+\s*/, ''),
          text: ''
        };
      } else {
        if (!currentSection) {
          currentSection = {
            title: '1. Introducción',
            text: line
          };
        } else {
          currentSection.text += (currentSection.text ? '\n\n' : '') + line;
        }
      }
    }

    if (currentSection) sections.push(currentSection);

    // Si no se detectaron secciones específicas, crear una sección completa
    if (sections.length === 0) {
      sections.push({
        title: '1. Contenido General',
        text: rawText
      });
    }

    return { title, sections };
  },

  processImport() {
    const textarea = document.getElementById('doc-import-textarea');
    const textVal = textarea ? textarea.value.trim() : '';

    let parsed = this.pendingParsedDoc;
    if (!parsed && textVal) {
      parsed = this.parseDocumentText(textVal, 'Documento Importado');
    }

    if (!parsed || !parsed.sections || parsed.sections.length === 0) {
      alert('⚠️ Por favor selecciona un archivo (.docx, .pdf, .txt, .md) o pega texto en el cuadro para importar.');
      return;
    }

    if (parsed.title) {
      this.currentProject.title = parsed.title;
    }
    if (parsed.pdfPages && parsed.pdfPages.length > 0) {
      this.currentProject.pdfPages = parsed.pdfPages;
      this.currentProject.originalFormat = parsed.originalFormat || 'pdf';
    }
    this.currentProject.sections = parsed.sections || [];

    this.closeImportModal();
    this.renderEditor(document.getElementById('view-document'));

    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }
    const pageMsg = (this.currentProject.pdfPages && this.currentProject.pdfPages.length > 0)
      ? ` con ${this.currentProject.pdfPages.length} páginas en formato PDF idéntico al original`
      : ` con ${parsed.sections.length} secciones`;
    alert(`🎉 ¡Se importó el documento exitosamente${pageMsg}! Al publicarlo o visualizarlo se verá literalmente como tu archivo.`);
  },

  clearPdfPages() {
    if (confirm('¿Deseas quitar la vista de hojas fijas y volver a la vista de párrafos editables?')) {
      this.currentProject.pdfPages = [];
      this.renderEditor(document.getElementById('view-document'));
    }
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
