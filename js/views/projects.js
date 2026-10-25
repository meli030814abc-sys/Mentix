/**
 * 🔥 MENTIX - Vista de Proyectos & Retos (Projects View)
 * Gestión integral de proyectos educativos: Diapositivas, Videos interactivos y Quizzes gamificados.
 */

window.ProjectsView = {
  currentCategory: 'all',
  currentTypeFilter: 'all', // 'all' | 'presentation' | 'video' | 'document' | 'url'
  searchQuery: '',
  viewMode: 'list', // 'list' | 'selector' | 'landing'
  selectedProjectId: null,
  selectedProjectTypeId: 'presentation',
  currentSlideIndex: 0,

  isTeacherOrAdmin() {
    const u = window.appState && window.appState.currentUser;
    if (!u) return false;
    const r = (u.role || '').toLowerCase().trim();
    if (r === 'teacher' || r === 'admin' || r === 'profesor' || r === 'maestro' || r === 'administrador') return true;
    const name = (u.name || '').toLowerCase().trim();
    const uname = (u.username || '').toLowerCase().trim();
    if (name === 'melisa' || uname === 'melisa' || name.startsWith('prof') || uname.startsWith('prof')) return true;
    return false;
  },

  projectModes: [
    {
      id: 'presentation',
      name: 'Presentación Interactiva',
      shortName: 'Presentación Interactiva',
      badge: '📊 DIAPOSITIVAS',
      icon: '📊',
      themeColor: '#7c3aed',
      accentColor: '#a78bfa',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 55%, #00f5d4 100%)',
      actionLabel: '¡Crear Presentación!',
      description: 'Diapositivas visuales para explicar conceptos en clase con notas del orador, imágenes, bloques de código y videos.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-pres" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#170b30" />
                <stop offset="55%" stop-color="#4c1d95" />
                <stop offset="100%" stop-color="#6d28d9" />
              </linearGradient>
              <linearGradient id="proj-slide-card" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#2e1065" />
                <stop offset="100%" stop-color="#1e1b4b" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-pres)" />
            <circle cx="330" cy="45" r="55" fill="rgba(0, 245, 212, 0.1)" />
            <circle cx="70" cy="195" r="65" fill="rgba(167, 139, 250, 0.12)" />
            <!-- Diapositiva trasera -->
            <rect x="92" y="34" width="230" height="140" rx="14" fill="rgba(124, 58, 237, 0.35)" stroke="rgba(196, 181, 253, 0.4)" stroke-width="2" transform="rotate(4 207 104)" />
            <!-- Pantalla principal de diapositiva -->
            <rect x="78" y="42" width="244" height="148" rx="14" fill="url(#proj-slide-card)" stroke="#00f5d4" stroke-width="2.5" />
            <rect x="98" y="60" width="115" height="14" rx="7" fill="#00f5d4" />
            <rect x="98" y="82" width="82" height="9" rx="4.5" fill="rgba(255,255,255,0.45)" />
            <!-- Gráfica de barras 3D dentro de la diapositiva -->
            <rect x="104" y="138" width="24" height="32" rx="5" fill="#f72585" />
            <rect x="138" y="118" width="24" height="52" rx="5" fill="#ffd166" />
            <rect x="172" y="98" width="24" height="72" rx="5" fill="#00f5d4" />
            <!-- Tarjeta visual derecha -->
            <rect x="218" y="96" width="84" height="74" rx="10" fill="rgba(255,255,255,0.08)" stroke="rgba(167,139,250,0.5)" stroke-width="1.5" />
            <circle cx="260" cy="124" r="14" fill="#a78bfa" />
            <rect x="234" y="147" width="52" height="8" rx="4" fill="rgba(255,255,255,0.6)" />
          </svg>
        `;
      }
    },
    {
      id: 'video',
      name: 'Video Clase Interactiva',
      shortName: 'Video Clase',
      badge: '🎬 VIDEO CLASE',
      icon: '🎬',
      themeColor: '#ef4444',
      accentColor: '#f87171',
      gradient: 'linear-gradient(135deg, #7f1d1d 0%, #ef4444 55%, #f97316 100%)',
      actionLabel: '¡Crear Video Clase!',
      description: 'Integra videos (YouTube, Drive, Vimeo o MP4) con capítulos interactivos, resumen pedagógico y preguntas de debate.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-vid" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#28080c" />
                <stop offset="55%" stop-color="#991b1b" />
                <stop offset="100%" stop-color="#dc2626" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-vid)" />
            <circle cx="320" cy="50" r="60" fill="rgba(251, 146, 60, 0.14)" />
            <!-- Reproductor de video 3D -->
            <rect x="75" y="38" width="250" height="154" rx="16" fill="#0f172a" stroke="#f87171" stroke-width="2.5" />
            <!-- Claqueta superior -->
            <path d="M75 54 Q75 38 91 38 L309 38 Q325 38 325 54 L325 64 L75 64 Z" fill="#1e293b" />
            <line x1="105" y1="38" x2="90" y2="64" stroke="#f87171" stroke-width="5" />
            <line x1="155" y1="38" x2="140" y2="64" stroke="#ffd166" stroke-width="5" />
            <line x1="205" y1="38" x2="190" y2="64" stroke="#f87171" stroke-width="5" />
            <line x1="255" y1="38" x2="240" y2="64" stroke="#ffd166" stroke-width="5" />
            <line x1="305" y1="38" x2="290" y2="64" stroke="#f87171" stroke-width="5" />
            <!-- Botón Play central brillante -->
            <circle cx="200" cy="118" r="30" fill="#ef4444" stroke="#ffffff" stroke-width="2.5" />
            <polygon points="193,103 193,133 217,118" fill="#ffffff" />
            <!-- Barra de progreso con capítulos -->
            <rect x="98" y="168" width="204" height="7" rx="3.5" fill="rgba(255,255,255,0.2)" />
            <rect x="98" y="168" width="118" height="7" rx="3.5" fill="#00f5d4" />
            <circle cx="145" cy="171.5" r="5" fill="#ffd166" />
            <circle cx="216" cy="171.5" r="6.5" fill="#ffffff" stroke="#00f5d4" stroke-width="2.5" />
            <circle cx="265" cy="171.5" r="5" fill="#ffd166" />
          </svg>
        `;
      }
    },
    {
      id: 'document',
      name: 'Documento de Clase',
      shortName: 'Documento de Clase',
      badge: '📄 DOCUMENTO',
      icon: '📄',
      themeColor: '#3b82f6',
      accentColor: '#60a5fa',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 55%, #00f5d4 100%)',
      actionLabel: '¡Crear Documento!',
      description: 'Redacta lecturas estructuradas por secciones, guías pedagógicas de estudio o adjunta documentos PDF completos.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-doc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#09193a" />
                <stop offset="55%" stop-color="#1d4ed8" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-doc)" />
            <circle cx="85" cy="60" r="50" fill="rgba(96, 165, 250, 0.15)" />
            <!-- Hoja trasera -->
            <rect x="138" y="26" width="140" height="182" rx="12" fill="rgba(147, 197, 253, 0.25)" transform="rotate(6 208 117)" />
            <!-- Hoja principal -->
            <rect x="125" y="28" width="150" height="184" rx="12" fill="#0f172a" stroke="#60a5fa" stroke-width="2.5" />
            <!-- Encabezado del documento -->
            <rect x="145" y="48" width="76" height="14" rx="6" fill="#38bdf8" />
            <rect x="230" y="46" width="26" height="18" rx="5" fill="rgba(239, 68, 68, 0.85)" />
            <text x="243" y="58" font-family="sans-serif" font-weight="900" font-size="9" fill="#ffffff" text-anchor="middle">PDF</text>
            <!-- Líneas de lectura -->
            <rect x="145" y="76" width="110" height="8" rx="4" fill="rgba(255,255,255,0.75)" />
            <rect x="145" y="92" width="96" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
            <rect x="145" y="108" width="104" height="8" rx="4" fill="rgba(255,255,255,0.5)" />
            <!-- Bloque destacado -->
            <rect x="145" y="128" width="110" height="42" rx="8" fill="rgba(0, 245, 212, 0.14)" stroke="#00f5d4" stroke-width="1.5" />
            <rect x="155" y="140" width="65" height="7" rx="3.5" fill="#00f5d4" />
            <rect x="155" y="153" width="85" height="6" rx="3" fill="rgba(255,255,255,0.65)" />
            <rect x="145" y="182" width="78" height="8" rx="4" fill="rgba(255,255,255,0.45)" />
          </svg>
        `;
      }
    },
    {
      id: 'url',
      name: 'Recurso por URL / Simulador',
      shortName: 'Recurso por URL',
      badge: '🌐 ENLACE / URL',
      icon: '🌐',
      themeColor: '#10b981',
      accentColor: '#34d399',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 55%, #00f5d4 100%)',
      actionLabel: '¡Agregar Recurso URL!',
      description: 'Incrusta simuladores interactivos (PhET, GeoGebra), mapas, tableros colaborativos, páginas de consulta y sitios web.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-url" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#04261f" />
                <stop offset="55%" stop-color="#047857" />
                <stop offset="100%" stop-color="#10b981" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-url)" />
            <!-- Ventana de navegador web -->
            <rect x="70" y="34" width="260" height="168" rx="14" fill="#0f172a" stroke="#34d399" stroke-width="2.5" />
            <rect x="70" y="34" width="260" height="30" rx="14" fill="#1e293b" />
            <circle cx="88" cy="49" r="4.5" fill="#ef4444" />
            <circle cx="102" cy="49" r="4.5" fill="#ffd166" />
            <circle cx="116" cy="49" r="4.5" fill="#10b981" />
            <!-- Barra de dirección URL -->
            <rect x="132" y="41" width="178" height="16" rx="8" fill="#0f172a" stroke="rgba(52,211,153,0.45)" stroke-width="1" />
            <text x="221" y="52.5" font-family="monospace" font-weight="700" font-size="9.5" fill="#00f5d4" text-anchor="middle">https://mentix.edu/lab</text>
            <!-- Globo interactivo central -->
            <circle cx="200" cy="132" r="44" fill="rgba(16, 185, 129, 0.16)" stroke="#00f5d4" stroke-width="2.5" />
            <ellipse cx="200" cy="132" rx="22" ry="44" fill="none" stroke="#34d399" stroke-width="2" />
            <line x1="156" y1="132" x2="244" y2="132" stroke="#34d399" stroke-width="2" />
            <line x1="163" y1="112" x2="237" y2="112" stroke="rgba(52,211,153,0.65)" stroke-width="1.5" />
            <line x1="163" y1="152" x2="237" y2="152" stroke="rgba(52,211,153,0.65)" stroke-width="1.5" />
          </svg>
        `;
      }
    },
    {
      id: 'import_presentation',
      name: 'Importar Presentación',
      shortName: 'Importar Presentación',
      badge: '📥 IMPORTAR PPTX / PDF',
      icon: '📥',
      themeColor: '#9333ea',
      accentColor: '#e879f9',
      gradient: 'linear-gradient(135deg, #581c87 0%, #9333ea 55%, #f72585 100%)',
      actionLabel: '¡Subir Presentación!',
      description: 'Importa archivos PDF, PowerPoint o pega el contenido de tus diapositivas para convertirlas automáticamente en una presentación.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-imppres" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#240a38" />
                <stop offset="55%" stop-color="#6b21a8" />
                <stop offset="100%" stop-color="#be185d" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-imppres)" />
            <rect x="85" y="44" width="230" height="150" rx="16" fill="#0f172a" stroke="#e879f9" stroke-width="2.5" stroke-dasharray="8 5" />
            <circle cx="200" cy="105" r="34" fill="rgba(232, 121, 249, 0.2)" stroke="#e879f9" stroke-width="2" />
            <path d="M200 122 L200 88 M186 102 L200 88 L214 102" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="135" y="154" width="130" height="22" rx="11" fill="#9333ea" />
            <text x="200" y="169" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">PPTX • PDF • TEXTO</text>
          </svg>
        `;
      }
    },
    {
      id: 'import_document',
      name: 'Importar Documento',
      shortName: 'Importar Documento',
      badge: '📑 IMPORTAR PDF / GUÍA',
      icon: '📑',
      themeColor: '#0284c7',
      accentColor: '#38bdf8',
      gradient: 'linear-gradient(135deg, #0c4a6e 0%, #0284c7 55%, #00f5d4 100%)',
      actionLabel: '¡Subir Documento!',
      description: 'Importa un archivo PDF o texto estructurado desde tu dispositivo para crear una guía de lectura interactiva al instante.',
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="proj-bg-impdoc" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#071f33" />
                <stop offset="55%" stop-color="#0369a1" />
                <stop offset="100%" stop-color="#0d9488" />
              </linearGradient>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#proj-bg-impdoc)" />
            <rect x="85" y="44" width="230" height="150" rx="16" fill="#0f172a" stroke="#38bdf8" stroke-width="2.5" stroke-dasharray="8 5" />
            <circle cx="200" cy="105" r="34" fill="rgba(56, 189, 248, 0.2)" stroke="#00f5d4" stroke-width="2" />
            <path d="M200 122 L200 88 M186 102 L200 88 L214 102" fill="none" stroke="#ffffff" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" />
            <rect x="135" y="154" width="130" height="22" rx="11" fill="#0284c7" />
            <text x="200" y="169" font-family="sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">PDF • GUÍA • LECTURA</text>
          </svg>
        `;
      }
    }
  ],

  getProjectMode(id) {
    return this.projectModes.find(m => m.id === id) || this.projectModes[0];
  },

  render() {
    const container = document.getElementById('view-projects');
    if (!container) return;

    const u = window.appState.currentUser;
    const isTeacherOrAdmin = this.isTeacherOrAdmin();
    // En MENTIX, los proyectos abarcan: Presentaciones, Video Clases, Documentos Didácticos, Enlaces Web/URL y Proyectos GovData Nexus
    const rawProjects = (window.appState.challenges || []).filter(c => 
      c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url' || c.isGovDataProject
    );

    if (this.viewMode === 'wizard' && window.ProjectWizard) {
      window.ProjectWizard.render(container);
      return;
    }

    if (this.viewMode === 'selector') {
      this.renderProjectSelectorView(container);
      return;
    }

    if (this.viewMode === 'landing') {
      this.renderLandingPageView(container, rawProjects);
      return;
    }

    // Filtrar borradores y proyectos en preparación para que solo los vea su autor o el profesor/admin
    const allProjects = rawProjects.filter(c => {
      if (!c.publicationStatus || c.publicationStatus === 'published' || c.publicationStatus === 'approved') return true;
      const isOwner = window.appRouter ? window.appRouter.isChallengeOwner(c) : false;
      return isOwner || isTeacherOrAdmin;
    });

    const categories = (window.appState.categories || []).filter(c => {
      if (!c || !c.id) return false;
      const cid = String(c.id).toLowerCase().trim();
      const cname = String(c.name || '').toLowerCase().trim();
      return !['fhjr', 'kj'].includes(cid) && !['fhjr', 'kj'].includes(cname);
    });

    // Reconciliar categorías
    let needsSave = false;
    allProjects.forEach(proj => {
      if (proj.category) {
        const catExists = categories.find(cat => cat.id === proj.category);
        if (!catExists && proj.categoryName) {
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

    // Estadísticas exclusivas de Proyectos
    const totalProjects = allProjects.length;
    const totalSlides = allProjects.filter(c => c.projectType === 'presentation').reduce((acc, c) => acc + (c.slides ? c.slides.length : 0), 0);
    const totalVideos = allProjects.filter(c => c.projectType === 'video').length;
    const totalDocs = allProjects.filter(c => c.projectType === 'document').length;
    const totalUrls = allProjects.filter(c => c.projectType === 'url').length;

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
              Diseña lecciones completas con presentaciones, video clases, documentos didácticos o enlaces web y simuladores.
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: flex-start;">
            <button class="btn btn-lg" onclick="window.ProjectWizard.openWizard()" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; box-shadow: 0 8px 24px rgba(16, 185, 129, 0.35); font-weight: 900; padding: 0.85rem 1.45rem; font-size: 1rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer;">
              <span>✨</span> <span>Asistente Inteligente de Proyecto</span>
            </button>
            ${isTeacherOrAdmin ? `
            <div style="display: flex; flex-direction: column; align-items: flex-start; gap: 0.4rem;">
              <button class="btn btn-cyan btn-lg" onclick="window.ProjectsView.openCreateProjectModal()" style="box-shadow: 0 6px 24px rgba(0,245,212,0.4); font-weight: 900; padding: 0.85rem 1.65rem; font-size: 1.05rem;">
                <span>➕</span> <span>Crear Proyecto</span>
              </button>
              
                <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(0, 245, 212, 0.12); border: 1px solid rgba(0, 245, 212, 0.4); padding: 0.35rem 0.75rem; border-radius: 8px; font-size: 0.8rem; font-weight: 800; color: var(--neon-cyan); max-width: 300px; line-height: 1.3; text-shadow: 0 0 10px rgba(0,245,212,0.3);">
                  <span>📢</span> Enviar un código o crear un código de proyecto para estudiantes
                </div>
              
            </div>
            ` : ''}
            <button class="btn btn-outline" onclick="window.appRouter.openCategoryModal()" style="padding: 0.8rem 1.2rem; font-weight: 800;">
              <span>🏷️</span> Categorías
            </button>
          </div>
        </div>

        ${(() => {
          const drafts = window.ProjectWizard ? window.ProjectWizard.getAllSavedDrafts() : [];
          if (!drafts.length) return '';
          return `
            <div class="glass-panel animate-fade-in" style="padding: 1.15rem 1.4rem; margin-bottom: 1.65rem; border: 1.5px solid rgba(16, 185, 129, 0.45); background: linear-gradient(135deg, rgba(6, 78, 59, 0.35), rgba(15, 23, 42, 0.9)); border-radius: 16px;">
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; margin-bottom: 0.75rem;">
                <div style="display: flex; align-items: center; gap: 0.6rem;">
                  <span style="font-size: 1.35rem;">🧭</span>
                  <div>
                    <strong style="color: #10b981; font-size: 0.95rem; display: block;">Asistente Inteligente de Proyectos — Borradores Guardados (${drafts.length})</strong>
                    <span style="font-size: 0.8rem; color: var(--text-secondary);">Retoma la creación de tu proyecto exactamente en el paso donde quedaste.</span>
                  </div>
                </div>
                <button class="btn btn-sm" onclick="window.ProjectWizard.startNewWizard()" style="background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.4); font-weight: 800; padding: 0.4rem 0.85rem; border-radius: 8px; cursor: pointer;">
                  + Nuevo Proyecto Guiado
                </button>
              </div>
              <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;">
                ${drafts.slice(0, 4).map(dr => `
                  <div style="display: inline-flex; align-items: center; gap: 0.6rem; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255,255,255,0.12); padding: 0.45rem 0.85rem; border-radius: 10px;">
                    <div>
                      <div style="font-weight: 800; font-size: 0.85rem; color: #fff;">${this.escapeHtml(dr.title || 'Proyecto sin título')}</div>
                      <div style="font-size: 0.72rem; color: #94a3b8;">Paso ${dr.currentStep || 1} de 8 • ${dr.lastSavedAt ? new Date(dr.lastSavedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Guardado'}</div>
                    </div>
                    <button class="btn btn-cyan btn-sm" onclick="window.ProjectWizard.openWizard('${dr.id}')" style="padding: 0.3rem 0.65rem; font-size: 0.76rem; font-weight: 800;">
                      Continuar →
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>
          `;
        })()}

        ${isTeacherOrAdmin ? `
          <!-- Banner Exclusivo para Profesores y Administradores -->
          <div class="teacher-admin-project-notice animate-fade-in" style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(20, 35, 65, 0.92)); border: 1.5px solid var(--neon-cyan); border-radius: 16px; padding: 1.15rem 1.5rem; margin-bottom: 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1.25rem; flex-wrap: wrap; box-shadow: 0 8px 30px rgba(0, 245, 212, 0.18);">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(0, 245, 212, 0.15); border: 1.5px solid var(--neon-cyan); display: flex; align-items: center; justify-content: center; font-size: 1.75rem; flex-shrink: 0; box-shadow: 0 0 15px rgba(0,245,212,0.3);">
                👨‍🏫
              </div>
              <div>
                <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(0, 245, 212, 0.18); color: var(--neon-cyan); font-weight: 900; font-size: 0.75rem; text-transform: uppercase; padding: 0.2rem 0.65rem; border-radius: 9999px; letter-spacing: 0.5px; margin-bottom: 0.35rem; border: 1px solid rgba(0,245,212,0.35);">
                  <span>🛡️</span> Solo para Maestros y Administradores
                </div>
                <h3 style="font-size: 1.15rem; font-weight: 900; color: #ffffff; margin: 0 0 0.2rem; text-shadow: 0 2px 8px rgba(0,0,0,0.8); line-height: 1.35;">
                  Enviar un código o crear un código de proyecto para estudiantes
                </h3>
                <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.4;">
                  Como maestro o administrador, puedes crear un código de proyecto o enviar el código a tus estudiantes para que se unan a la sesión.
                </p>
              </div>
            </div>
            <button class="btn btn-cyan btn-sm" onclick="window.ProjectsView.openCreateProjectModal()" style="font-weight: 900; padding: 0.65rem 1.25rem; border-radius: 10px; box-shadow: 0 4px 15px rgba(0,245,212,0.35); white-space: nowrap; font-size: 0.9rem;">
              <span>🔑</span> Crear Código de Proyecto
            </button>
          </div>
        ` : ''}

        <!-- Barra de Estadísticas Resumen -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2.25rem;">
          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(0, 245, 212, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: var(--neon-cyan);">
              📁
            </div>
            <div>
              <div style="font-size: 1.7rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalProjects}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">Total Proyectos</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(124, 58, 237, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #a78bfa;">
              📊
            </div>
            <div>
              <div style="font-size: 1.7rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalSlides}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">Diapositivas</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(239, 68, 68, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #f87171;">
              🎬
            </div>
            <div>
              <div style="font-size: 1.7rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalVideos}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">Video Clases</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(59, 130, 246, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #60a5fa;">
              📄
            </div>
            <div>
              <div style="font-size: 1.7rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalDocs}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">Documentos</div>
            </div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; display: flex; align-items: center; gap: 1rem;">
            <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(16, 185, 129, 0.15); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; color: #34d399;">
              🌐
            </div>
            <div>
              <div style="font-size: 1.7rem; font-weight: 900; color: var(--text-primary); line-height: 1;">${totalUrls}</div>
              <div style="font-size: 0.82rem; color: var(--text-secondary); margin-top: 0.2rem;">Enlaces Web</div>
            </div>
          </div>
        </div>

        <!-- Filtros de Tipo de Proyecto y Buscador -->
        <div class="glass-panel" style="padding: 1.25rem; margin-bottom: 2rem;">
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
            
            <!-- Selector de Tipo de Proyecto -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button 
                onclick="window.ProjectsView.filterType('all')" 
                class="btn ${this.currentTypeFilter === 'all' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                🌟 Todos (${allProjects.length})
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
                🎬 Videos
              </button>
              <button 
                onclick="window.ProjectsView.filterType('document')" 
                class="btn ${this.currentTypeFilter === 'document' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                📄 Documentos
              </button>
              <button 
                onclick="window.ProjectsView.filterType('url')" 
                class="btn ${this.currentTypeFilter === 'url' ? 'btn-cyan' : 'btn-outline'}"
                style="padding: 0.45rem 0.9rem; font-size: 0.85rem; font-weight: 700;"
              >
                🌐 Enlaces / URL
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
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
            ${filtered.map(c => this.renderProjectCard(c, u)).join('')}
          </div>
        `)}

        <!-- Sección de Seguimiento: Mis Proyectos en Curso (Lila Neón Brillante) -->
        ${this.renderProjectAttemptsSection()}

      </div>
    `;
  },

  renderProjectAttemptsSection() {
    if (!window.ProfileView || typeof window.ProfileView.getProjectAttempts !== 'function') return '';
    const allProjAttempts = window.ProfileView.getProjectAttempts();
    const currentProjFilter = window.ProfileView.activeProjectFilter || 'all';
    const counts = {
      all: allProjAttempts.length,
      in_progress: allProjAttempts.filter(a => a.status === 'in_progress').length,
      initiated: allProjAttempts.filter(a => a.status === 'initiated').length,
      viewed: allProjAttempts.filter(a => a.status === 'viewed').length
    };

    const filteredProj = allProjAttempts.filter(item => {
      if (currentProjFilter === 'all') return true;
      return item.status === currentProjFilter;
    });

    return `
      <div class="glass-panel" style="padding: 2rem; margin-top: 1.5rem; margin-bottom: 2rem; border: 2.5px solid rgba(192, 132, 252, 0.65); box-shadow: 0 10px 45px rgba(168, 85, 247, 0.32), inset 0 0 30px rgba(192, 132, 252, 0.12); background: rgba(22, 13, 44, 0.78);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
          <div>
            <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.6rem; margin: 0; color: #f5edff; text-shadow: 0 0 16px rgba(192, 132, 252, 0.85), 0 0 32px rgba(168, 85, 247, 0.6); font-weight: 900;">
              <span>📁</span> Mis Proyectos en Curso
            </h2>
            <p style="font-size: 0.85rem; color: #d8b4fe; margin: 0.25rem 0 0; opacity: 0.95;">
              Proyectos en proceso, proyectos iniciados y proyectos que has visto o leído.
            </p>
          </div>

          <div style="display: flex; gap: 0.4rem; background: rgba(30, 15, 60, 0.75); padding: 0.35rem 0.45rem; border-radius: 12px; border: 1.5px solid rgba(192, 132, 252, 0.5); box-shadow: 0 0 18px rgba(192, 132, 252, 0.3); flex-wrap: wrap;">
            <button class="btn btn-sm" 
                    style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'all' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                    onclick="window.ProfileView.activeProjectFilter = 'all'; window.ProjectsView.render();">
              📋 Todos (${counts.all})
            </button>
            <button class="btn btn-sm" 
                    style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'in_progress' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                    onclick="window.ProfileView.activeProjectFilter = 'in_progress'; window.ProjectsView.render();">
              ⏳ En Proceso (${counts.in_progress})
            </button>
            <button class="btn btn-sm" 
                    style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'initiated' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                    onclick="window.ProfileView.activeProjectFilter = 'initiated'; window.ProjectsView.render();">
              ⚡ Iniciados (${counts.initiated})
            </button>
            <button class="btn btn-sm" 
                    style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'viewed' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                    onclick="window.ProfileView.activeProjectFilter = 'viewed'; window.ProjectsView.render();">
              👁️ Proyectos Vistos / Leídos (${counts.viewed})
            </button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 0.85rem;">
          ${filteredProj.map(item => {
            const totalP = item.totalParts || 6;
            const viewedP = item.viewedParts || (item.status === 'viewed' ? totalP : 1);
            const progressPct = Math.min(100, Math.max(12, Math.round((viewedP / totalP) * 100)));

            let statusBadge = '';
            let progressGradient = 'linear-gradient(90deg, #7c3aed, #c084fc, #e9d5ff)';
            if (item.status === 'viewed') {
              statusBadge = `<span class="badge-tag" style="background: rgba(192, 132, 252, 0.28); color: #f5edff; border: 1.5px solid #c084fc; font-size: 0.72rem; font-weight: 900; padding: 0.2rem 0.6rem; border-radius: 8px; box-shadow: 0 0 14px rgba(192, 132, 252, 0.55); text-transform: uppercase;">👁️ Visto / Leído</span>`;
            } else if (item.status === 'in_progress') {
              statusBadge = `<span class="badge-tag" style="background: rgba(168, 85, 247, 0.25); color: #d8b4fe; border: 1.5px solid rgba(168, 85, 247, 0.6); font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 8px; box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);">⏳ En Proceso</span>`;
            } else {
              statusBadge = `<span class="badge-tag" style="background: rgba(216, 180, 254, 0.18); color: #e9d5ff; border: 1.5px solid rgba(216, 180, 254, 0.45); font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 8px;">⚡ Iniciado</span>`;
            }

            return `
              <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(26, 16, 52, 0.6); border: 1.5px solid rgba(192, 132, 252, 0.38); border-radius: var(--border-radius-md); padding: 1rem 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
                <div style="display: flex; align-items: center; gap: 1rem; min-width: 220px; flex: 1 1 300px;">
                  <div style="width: 52px; height: 52px; border-radius: 10px; background: url('${item.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}') center/cover; flex-shrink: 0; border: 1.5px solid rgba(192, 132, 252, 0.65); box-shadow: 0 0 14px rgba(192, 132, 252, 0.38);"></div>
                  <div style="flex: 1;">
                    <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                      <h4 style="font-size: 1.05rem; margin: 0; color: #ffffff; font-weight: 800;">${item.title}</h4>
                      ${statusBadge}
                    </div>
                    <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #d8b4fe; flex-wrap: wrap;">
                      <span style="color: #c084fc; font-weight: 800;">${item.categoryName || 'General'}</span>
                      <span>•</span>
                      <span>${item.status === 'viewed' ? `Visto y leído completo (${totalP}/${totalP} partes)` : `Progreso de lectura: ${viewedP}/${totalP} partes (${progressPct}%)`}</span>
                      <span>•</span>
                      <span style="color: #f5edff;">${item.typeLabel || '📁 Proyecto'}</span>
                      <span>•</span>
                      <span>⏱️ ${item.dateFormatted || 'Reciente'}</span>
                    </div>
                    <!-- Mini Barra de Progreso en Lila Neón -->
                    <div style="width: 100%; max-width: 260px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 9999px; margin-top: 0.45rem; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);">
                      <div style="width: ${progressPct}%; height: 100%; background: ${progressGradient}; border-radius: 9999px; box-shadow: 0 0 12px rgba(192, 132, 252, 0.8);"></div>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                  ${item.status === 'viewed' ? `
                    <button class="btn btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; border-color: rgba(192, 132, 252, 0.5); color: #f5edff;" onclick="window.ProfileView.openProject('${item.projectId}', '${item.projectType}')">
                      📖 Releer / Ver
                    </button>
                    <button class="btn" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; border: none; box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);" onclick="window.ProjectsView.openProjectLanding('${item.projectId}')">
                      🚀 Portada
                    </button>
                    <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteProjectAttempt('${item.id}'); window.ProjectsView.render();">
                      🗑️ Quitar
                    </button>
                  ` : `
                    <button class="btn" style="padding: 0.38rem 0.95rem; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 20px rgba(192, 132, 252, 0.65); border-radius: 8px;" onclick="window.ProfileView.openProject('${item.projectId}', '${item.projectType}')">
                      ▶️ Continuar Proyecto
                    </button>
                    <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: rgba(192, 132, 252, 0.4); color: #d8b4fe;" onclick="window.ProfileView.restartProjectAttempt('${item.id}'); window.ProjectsView.render();">
                      🔄 Reiniciar
                    </button>
                    <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteProjectAttempt('${item.id}'); window.ProjectsView.render();">
                      🗑️ Descartar
                    </button>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  },

  renderProjectCard(c, currentUser) {
    const isAuthor = window.appRouter ? window.appRouter.isChallengeOwner(c) : false;

    const diffBadge = c.difficulty === 'Difícil' || c.difficulty === 'hard'
      ? '<span class="badge-tag tag-hard">Difícil</span>'
      : ((c.difficulty === 'Medio' || c.difficulty === 'medium') ? '<span class="badge-tag tag-medium">Medio</span>' : '<span class="badge-tag tag-easy">Fácil</span>');

    const projectType = c.projectType || 'presentation';
    let typeBadge = '<span class="badge-tag" style="background: rgba(124, 58, 237, 0.85); color: white;">📊 Diapositivas</span>';
    let defaultBanner = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800';
    let cardAction = `window.appRouter.openPresentation('${c.id}')`;
    let countBadge = `📄 ${(c.slides ? c.slides.length : 0)} diaps`;

    if (projectType === 'video') {
      typeBadge = '<span class="badge-tag" style="background: rgba(239, 68, 68, 0.85); color: white;">🎬 Video Clase</span>';
      defaultBanner = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800';
      cardAction = `window.appRouter.openVideo('${c.id}')`;
      countBadge = `⏱️ ${c.duration || 'Video'}`;
    } else if (projectType === 'document') {
      typeBadge = '<span class="badge-tag" style="background: rgba(59, 130, 246, 0.85); color: white;">📄 Documento</span>';
      defaultBanner = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800';
      cardAction = `window.appRouter.openDocument('${c.id}')`;
      countBadge = (c.pdfPages && c.pdfPages.length > 0)
        ? `📄 ${c.pdfPages.length} págs (PDF)`
        : `📝 ${(c.sections ? c.sections.length : 1)} secciones`;
    } else if (projectType === 'url') {
      typeBadge = '<span class="badge-tag" style="background: rgba(16, 185, 129, 0.85); color: white;">🌐 Enlace / URL</span>';
      defaultBanner = 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800';
      cardAction = `window.appRouter.openUrl('${c.id}')`;
      countBadge = `🔗 Enlace Web`;
    }

    return `
      <div class="challenge-card" onclick="window.ProjectsView.openProjectLanding('${c.id}')" style="display: flex; flex-direction: column; height: 100%; cursor: pointer;">
        <div class="challenge-banner" style="background-image: url('${c.banner || c.coverImage || defaultBanner}'); position: relative; height: 160px;">
          <div style="position: absolute; top: 0.6rem; left: 0.6rem; display: flex; gap: 0.35rem; flex-wrap: wrap;">
            ${typeBadge}
            ${c.publicationStatus === 'draft' || c.publicationStatus === 'in_preparation' ? '<span class="badge-tag" style="background: rgba(245, 158, 11, 0.92); color: #fff;">📝 Borrador</span>' : ''}
            ${c.publicationStatus === 'ready_for_review' ? '<span class="badge-tag" style="background: rgba(59, 130, 246, 0.92); color: #fff;">🔎 En Revisión</span>' : ''}
            ${c.publicationStatus === 'published' && c.isGovDataProject ? '<span class="badge-tag" style="background: rgba(16, 185, 129, 0.92); color: #fff;">🚀 Publicado</span>' : ''}
          </div>
          <span class="badge-tag" style="position: absolute; bottom: 0.6rem; left: 0.6rem; background: rgba(0,0,0,0.65); color: white;">
            ${countBadge}
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
              ${projectType === 'presentation' ? (c.slides ? c.slides.length : 0) + ' diapositivas' : (projectType === 'video' ? (c.chapters ? c.chapters.length : 0) + ' capítulos' : (projectType === 'document' ? 'Lectura / Guía' : 'Recurso Web'))}
            </span>
          </div>

          <h3 style="font-size: 1.2rem; margin: 0 0 0.5rem; line-height: 1.3; font-weight: 800; color: var(--text-primary);">
            ${this.escapeHtml(c.title)}
          </h3>

          <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0 0 1.25rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; line-height: 1.45;">
            ${this.escapeHtml(c.description || 'Proyecto interactivo para aprendizaje de clase.')}
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 1rem; gap: 0.5rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.45rem; font-size: 0.82rem; color: var(--text-muted);">
              <span>${c.authorAvatar || '👤'}</span>
              <span style="max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${c.author || 'Docente'}</span>
            </div>

            <div style="display: flex; gap: 0.45rem; align-items: center; flex-wrap: wrap;">
              ${isAuthor ? `
                <button 
                  class="btn btn-outline" 
                  title="Abrir en el Asistente Inteligente de Proyectos" 
                  style="padding: 0.42rem 0.68rem; font-size: 0.8rem; border-color: rgba(16, 185, 129, 0.55); color: #10b981; font-weight: 800;" 
                  onclick="event.stopPropagation(); window.ProjectWizard.openWizard('${c.id}')"
                >
                  ✨ Asistente
                </button>
              ` : ''}
              ${projectType === 'presentation' ? `
                ${isAuthor ? `
                  <button 
                    class="btn btn-outline" 
                    title="Editar Diapositivas" 
                    style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                    onclick="event.stopPropagation(); window.appRouter.editPresentation('${c.id}')"
                  >
                    ✏️
                  </button>
                ` : ''}
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, var(--neon-cyan)); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openPresentation('${c.id}')"
                >
                  🖥️ Presentar
                </button>
              ` : (projectType === 'video' ? `
                ${isAuthor ? `
                  <button 
                    class="btn btn-outline" 
                    title="Editar Video Clase" 
                    style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                    onclick="event.stopPropagation(); window.appRouter.editVideo('${c.id}')"
                  >
                    ✏️
                  </button>
                ` : ''}
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #ef4444, #dc2626); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openVideo('${c.id}')"
                >
                  🎬 Ver Video
                </button>
              ` : (projectType === 'document' ? `
                ${isAuthor ? `
                  <button 
                    class="btn btn-outline" 
                    title="Editar Documento" 
                    style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                    onclick="event.stopPropagation(); window.appRouter.editDocument('${c.id}')"
                  >
                    ✏️
                  </button>
                ` : ''}
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #3b82f6, var(--neon-cyan)); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openDocument('${c.id}')"
                >
                  📄 Leer
                </button>
              ` : `
                ${isAuthor ? `
                  <button 
                    class="btn btn-outline" 
                    title="Editar Recurso Web" 
                    style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                    onclick="event.stopPropagation(); window.appRouter.editUrl('${c.id}')"
                  >
                    ✏️
                  </button>
                ` : ''}
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.85rem; font-weight: 800; background: linear-gradient(135deg, #10b981, var(--neon-cyan)); border: none;" 
                  onclick="event.stopPropagation(); window.appRouter.openUrl('${c.id}')"
                >
                  🌐 Abrir
                </button>
              `))}
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

  switchViewMode(mode) {
    this.viewMode = mode;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openCreateProjectModal() {
    if (!this.isTeacherOrAdmin()) {
      alert('🚫 Solo los maestros y administradores pueden crear un código de proyecto para estudiantes.');
      return;
    }
    this.viewMode = 'selector';
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const inp = document.getElementById('custom-project-code-input');
      if (inp) inp.focus();
    }, 100);
  },

  closeCreateProjectModal() {
    this.viewMode = 'list';
    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.remove('active');
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  // Al hacer clic en un proyecto se muestra su landing page
  openProjectLanding(projectId) {
    this.selectedProjectId = projectId;
    this.isWizardPreview = false;
    this.viewMode = 'landing';
    const proj = (window.appState.challenges || []).find(x => x.id === projectId);
    if (proj) {
      try {
        localStorage.setItem('mentix_active_landing_project', JSON.stringify(proj));
      } catch (e) {}
    }
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Abre el editor/visor real del proyecto seleccionado
  openSelectedProject() {
    const c = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (!c) return;
    const t = c.projectType;
    if (t === 'video') window.appRouter.openVideo(c.id);
    else if (t === 'document') window.appRouter.openDocument(c.id);
    else if (t === 'url') window.appRouter.openUrl(c.id);
    else window.appRouter.openPresentation(c.id);
  },

  setLandingTheme(theme) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('mentix_landing_theme', validTheme);
    document.querySelectorAll('.plp-wrapper').forEach(w => {
      w.setAttribute('data-theme', validTheme);
    });
    document.querySelectorAll('.plp-envelope-btn').forEach(btn => {
      if (btn.classList.contains(validTheme)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  },

  getLandingTheme() {
    return localStorage.getItem('mentix_landing_theme') || 'light';
  },

  renderLandingPageView(container, allProjects = []) {
    this.currentSlideIndex = 0;
    const currentTheme = this.getLandingTheme();
    const selected = allProjects.find(x => x.id === this.selectedProjectId) || (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (selected) {
      try {
        localStorage.setItem('mentix_active_landing_project', JSON.stringify(selected));
      } catch (e) {}
    }

    const pub = (selected && selected.publication) ? selected.publication : {};
    const vp = (selected && selected.valueProposition) ? selected.valueProposition : {};
    const vid = (selected && selected.video) ? selected.video : {};

    const brandTitle = this.escapeHtml((selected && (selected.categoryName || pub.visibleCategory)) || 'Gobierno de Datos e IA');
    const brandSubtitle = this.escapeHtml((selected && (pub.publicName || selected.title)) || 'Proyecto Innovatech');
    const selectedTitle = selected ? this.escapeHtml(pub.publicName || selected.title || 'Proyecto') : 'Proyecto Innovatech';
    const heroEyebrow = this.escapeHtml((selected && (selected.subtitle || selected.categoryName)) || '🚀 Innovación Tecnológica & Gobernanza Inteligente');
    const heroMainTitle = selected
      ? `${this.escapeHtml(pub.landingTitle || selected.title || 'Proyecto Innovatech')}`
      : `Transformando el Futuro: <span>Proyecto Innovatech</span>`;
    const heroSubtitle = this.escapeHtml(
      (selected && (pub.publicDescription || selected.shortDescription || selected.description)) ||
      'Plataforma integral de Gobierno de Datos e Inteligencia Artificial diseñada para impulsar decisiones estratégicas con ética, transparencia y alto impacto.'
    );

    const ctaText = this.escapeHtml((selected && (pub.ctaText || selected.ctaText || vp.visitorAction)) || 'Unirse / Colaborar');
    const ctaUrl = (selected && (pub.ctaUrl || selected.ctaUrl)) || '';
    const coverPoster = (selected && (pub.coverImage || selected.coverImage || selected.banner)) || 'https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=1200&q=80';

    // Video público (respeta visibilidad independiente)
    const isVideoPublic = vid.visibility ? (vid.visibility === 'public' && pub.featuredVideoPublic !== false) : true;
    const videoTitle = this.escapeHtml((vid && vid.title) || (selected && selected.title ? `Video Explicativo: ${selected.title}` : 'Video Explicativo: Proyecto Innovatech'));
    const videoDuration = this.escapeHtml((selected && selected.duration) || (vid && vid.verified ? 'Verificado • HD' : '03:45 min • Full HD'));

    // Misión, Problema y Beneficios
    const missionText = this.escapeHtml(
      (selected && (selected.mainObjective || vp.problemSolved || selected.fullDescription || selected.description)) ||
      'Estructurar un ecosistema de Gobierno de Datos e Inteligencia Artificial que garantice la calidad, seguridad e interoperabilidad de la información para potenciar la innovación educativa y empresarial.'
    );
    const visionText = this.escapeHtml(
      (selected && (selected.userBenefits || vp.resultsOffered || vp.differentiator || selected.problemAddressed)) ||
      'Convertirnos en el referente regional en analítica ética y automatización inteligente, reduciendo brechas tecnológicas y generando valor sostenible para toda la comunidad.'
    );
    const howItWorksText = selected && (vp.howItWorks || vp.keyFeatures)
      ? `<p class="plp-hero-def-text"><strong>Cómo funciona y Funcionalidades:</strong> ${this.escapeHtml(vp.howItWorks || vp.keyFeatures)}</p>`
      : '';

    // Filtrar estrictamente recursos públicos (un proyecto publicado NUNCA expone archivos privados)
    const publicResources = (selected && Array.isArray(selected.resources))
      ? selected.resources.filter(r => r && r.visibility !== 'private').sort((a, b) => (a.order || 1) - (b.order || 1))
      : [];

    // Filtrar activos visuales públicos
    const publicVisuals = (selected && Array.isArray(selected.visualAssets))
      ? selected.visualAssets.filter(v => v && v.visibility !== 'private').sort((a, b) => (a.order || 1) - (b.order || 1))
      : [];

    // Filtrar enlaces externos públicos
    const publicLinks = (selected && Array.isArray(selected.externalLinks))
      ? selected.externalLinks.filter(l => l && l.visibility !== 'private').sort((a, b) => (a.order || 1) - (b.order || 1))
      : [];

    // FAQs públicas
    const publicFaqs = (selected && Array.isArray(selected.faqs)) ? selected.faqs : [];

    // Diapositivas para el carrusel (usa selected.slides si existen, o las 4 por defecto)
    const customSlides = (selected && Array.isArray(selected.slides) && selected.slides.length > 0)
      ? selected.slides
      : null;
    const totalCarouselSlides = customSlides ? customSlides.length : 4;

    const fullScreenHref = selected
      ? `proyecto-landing.html?id=${encodeURIComponent(selected.id)}${selected.slug ? '&slug=' + encodeURIComponent(selected.slug) : ''}`
      : 'proyecto-landing.html';

    container.innerHTML = `
      <div style="max-width: 1340px; margin: 0 auto; padding: 1.25rem 1rem 4rem;">
        <div class="plp-wrapper animate-fade-in" data-theme="${currentTheme}">
          
          <!-- Barra superior de control Mentix (Volver a la lista de proyectos / Asistente / dos sobres) -->
          <div class="plp-mentix-bar">
            <div class="plp-mentix-bar-left">
              <span class="plp-mentix-badge">${this.isWizardPreview ? '👁️ Vista Previa del Asistente' : '✨ Landing Page del Proyecto'}</span>
              <span style="font-weight: 700; color: #ffffff;">${selectedTitle}</span>

              <!-- DOS SOBRES INTERACTIVOS PARA TEMA CLARO Y OSCURO -->
              <div class="plp-envelopes-control" role="group" aria-label="Cambiar tema de la landing page con dos sobres">
                <span class="plp-envelopes-title">✉️ Sobres:</span>
                <button type="button" class="plp-envelope-btn light ${currentTheme === 'light' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('light')" title="Poner landing page en modo claro (Sobre Claro)">
                  <span class="plp-envelope-icon">✉️</span>
                  <span>Sobre Claro</span>
                  <span class="plp-envelope-badge">☀️</span>
                </button>
                <button type="button" class="plp-envelope-btn dark ${currentTheme === 'dark' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('dark')" title="Poner landing page en modo oscuro (Sobre Oscuro)">
                  <span class="plp-envelope-icon">✉️</span>
                  <span>Sobre Oscuro</span>
                  <span class="plp-envelope-badge">🌙</span>
                </button>
              </div>
            </div>
            <div class="plp-mentix-actions">
              ${this.isWizardPreview ? `
                <button type="button" class="plp-mentix-btn" onclick="window.ProjectsView.isWizardPreview = false; window.ProjectsView.switchViewMode('wizard')">
                  <span>←</span> Volver al Asistente (Paso 8)
                </button>
                <button type="button" class="plp-mentix-btn primary" onclick="window.ProjectWizard.publishProject()">
                  <span>🚀</span> Publicar Ahora
                </button>
              ` : `
                <button type="button" class="plp-mentix-btn" onclick="window.ProjectsView.switchViewMode('list')">
                  <span>←</span> Volver a Mis Proyectos
                </button>
                ${selected ? `
                <button type="button" class="plp-mentix-btn" onclick="window.ProjectWizard.openWizard('${selected.id}')">
                  <span>✨</span> Editar en Asistente
                </button>
                <button type="button" class="plp-mentix-btn primary" onclick="window.ProjectsView.openSelectedProject()">
                  <span>📂</span> Abrir Proyecto
                </button>` : ''}
              `}
              <a href="${fullScreenHref}" target="_blank" class="plp-mentix-btn" style="text-decoration:none;">
                <span>↗</span> Abrir en Pantalla Completa
              </a>
            </div>
          </div>

          <!-- ================================================================
               1. BARRA DE NAVEGACIÓN (HEADER) - FIJA (STICKY)
               ================================================================ -->
          <header class="plp-header" role="banner" aria-label="Navegación principal del proyecto">
            <!-- Izquierda: Logotipo e Isotipo Moderno -->
            <div class="plp-brand" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-inicio')" role="button" tabindex="0" aria-label="${brandTitle} - Inicio">
              <div class="plp-brand-isotipo" aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div class="plp-brand-text">
                <span class="plp-brand-title">${brandTitle}</span>
                <span class="plp-brand-subtitle">${brandSubtitle}</span>
              </div>
            </div>

            <!-- Centro: Enlaces de navegación rápida con efecto hover suave -->
            <nav class="plp-nav" role="navigation" aria-label="Enlaces de navegación rápida">
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-inicio')">Inicio</button>
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-sobre')">Sobre el Proyecto</button>
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-recursos')">Recursos</button>
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-presentaciones')">Presentaciones</button>
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-galeria')">Galería</button>
              <button type="button" class="plp-nav-link" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-contacto')">Contacto</button>
            </nav>

            <!-- Derecha: Buscador funcional discreto + Dos sobres de acceso directo + Botón CTA -->
            <div class="plp-header-right">
              <!-- Dos sobres de acceso rápido en el header -->
              <div class="plp-envelopes-control" style="background: var(--plp-bg-subtle); border-color: var(--plp-border);">
                <button type="button" class="plp-envelope-btn light ${currentTheme === 'light' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('light')" title="Sobre Claro (Día)">
                  <span class="plp-envelope-icon">✉️</span>
                  <span class="plp-envelope-hide-mobile">Claro</span>
                  <span class="plp-envelope-badge">☀️</span>
                </button>
                <button type="button" class="plp-envelope-btn dark ${currentTheme === 'dark' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('dark')" title="Sobre Oscuro (Noche)">
                  <span class="plp-envelope-icon">✉️</span>
                  <span class="plp-envelope-hide-mobile">Oscuro</span>
                  <span class="plp-envelope-badge">🌙</span>
                </button>
              </div>

              <div class="plp-search-box" role="search">
                <span class="plp-search-icon" aria-hidden="true">🔍</span>
                <input
                  type="search"
                  class="plp-search-input"
                  placeholder="Buscar recurso o sección..."
                  aria-label="Buscar en el proyecto"
                  oninput="window.ProjectsView.filterLandingSearch(this.value)"
                />
              </div>
              ${ctaUrl ? `
                <a href="${this.escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" class="plp-cta-btn" style="text-decoration:none;">
                  ${ctaText}
                </a>
              ` : `
                <button type="button" class="plp-cta-btn" onclick="window.ProjectsView.previewLandingDoc('${ctaText} — ${selectedTitle}')">
                  ${ctaText}
                </button>
              `}
            </div>
          </header>

          <!-- ================================================================
               2. SECCIÓN PRINCIPAL (HERO) - ESTILO PAWLY SMART CARE BENTO HUB
               ================================================================ -->
          <section class="plp-hero" id="plp-sec-inicio" aria-labelledby="plp-hero-title">
            <div class="plp-hero-heading-wrap" id="plp-sec-sobre">
              <span class="plp-eyebrow">${heroEyebrow}</span>
              <h1 class="plp-hero-main-title" id="plp-hero-title">
                ${heroMainTitle}
              </h1>
              <p class="plp-section-subtitle">
                ${heroSubtitle}
              </p>
            </div>

            <div class="plp-hero-grid">
              <!-- Columna Izquierda: Video / Stream estilo Pawly Smart Care HUD -->
              <div class="plp-video-card" id="plp-hero-video-box" aria-label="Smart Pet Care & Health Stream">
                <!-- Barra HUD Superior de Telemetría estilo Pawly -->
                <div class="plp-hud-stream-bar">
                  <span class="plp-hud-chip live">● EN VIVO</span>
                  <span class="plp-hud-chip">🔋 98% Batería • 🐾 Telemetría Activa</span>
                </div>

                ${isVideoPublic ? `
                  <div
                    class="plp-video-poster"
                    style="background-image: url('${coverPoster}');"
                    onclick="window.ProjectsView.playLandingVideo()"
                    role="button"
                    tabindex="0"
                    aria-label="Reproducir ${videoTitle}"
                  >
                    <div class="plp-play-btn" aria-hidden="true">▶</div>
                    <div class="plp-video-caption">
                      <span>🎬 ${videoTitle}</span>
                      <span>❤️ 78 BPM • 🌡️ 38.2°C • 📍 Telemetría</span>
                    </div>
                  </div>
                ` : `
                  <div class="plp-video-poster" style="background-image: url('${coverPoster}'); cursor: default;">
                    <div class="plp-video-caption">
                      <span>🖼️ ${selectedTitle}</span>
                      <span>🐾 Dispositivo de Monitoreo Conectado</span>
                    </div>
                  </div>
                `}
              </div>

              <!-- Columna Derecha: Pawly Smart Care & Health Monitoring Dashboard Hub -->
              <article class="plp-bento-hero-panel">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.15rem; gap: 0.5rem; flex-wrap: wrap;">
                  <span class="plp-pawly-header-badge">
                    <span>🐾</span> Pawly Smart Health Hub
                  </span>
                  <span style="font-size: 0.78rem; font-weight: 800; color: var(--plp-emerald-600); background: var(--plp-emerald-100); padding: 0.25rem 0.65rem; border-radius: 999px;">
                    ● Dispositivo Sincronizado
                  </span>
                </div>

                <!-- Score Circular de Vitalidad / Salud estilo Pawly Dribbble -->
                <div class="plp-vitals-score-row">
                  <div class="plp-vitals-ring-box">
                    <svg viewBox="0 0 80 80">
                      <circle class="plp-vitals-ring-bg" cx="40" cy="40" r="35"></circle>
                      <circle class="plp-vitals-ring-fill" cx="40" cy="40" r="35"></circle>
                    </svg>
                    <div class="plp-vitals-ring-text">98%</div>
                  </div>
                  <div class="plp-vitals-score-info">
                    <h4>❤️ Índice de Salud & Bienestar</h4>
                    <p>Estado óptimo general. Signos vitales estables y actividad dentro del rango saludable.</p>
                  </div>
                </div>

                <!-- Mini Bento Grid de 3 Indicadores Rápidos -->
                <div class="plp-mini-bento-grid">
                  <div class="plp-mini-bento-card">
                    <span class="plp-mini-bento-icon">❤️</span>
                    <strong class="plp-mini-bento-val">78 BPM</strong>
                    <span class="plp-mini-bento-lbl">Frecuencia</span>
                  </div>
                  <div class="plp-mini-bento-card">
                    <span class="plp-mini-bento-icon">🔥</span>
                    <strong class="plp-mini-bento-val">8.4k</strong>
                    <span class="plp-mini-bento-lbl">Actividad</span>
                  </div>
                  <div class="plp-mini-bento-card">
                    <span class="plp-mini-bento-icon">💧</span>
                    <strong class="plp-mini-bento-val">650 ml</strong>
                    <span class="plp-mini-bento-lbl">Hidratación</span>
                  </div>
                </div>

                <!-- Rutina Diaria de Cuidados y Telemetría -->
                <div class="plp-care-checklist">
                  <div class="plp-care-check-title">
                    <span>📋</span> Rutina Diaria & Monitoreo Inteligente
                  </div>
                  <div class="plp-care-check-item">
                    <span class="plp-care-check-icon">✔</span>
                    <span>Revisión matutina y calibración de sensores</span>
                  </div>
                  <div class="plp-care-check-item">
                    <span class="plp-care-check-icon">✔</span>
                    <span>Sincronización de registros clínicos y métricas</span>
                  </div>
                  <div class="plp-care-check-item">
                    <span class="plp-care-check-icon pending">⏳</span>
                    <span>Sesión vespertina de actividad y suplementos</span>
                  </div>
                </div>

                <p style="font-size: 0.9rem; color: var(--plp-text-body); margin: 0 0 1.25rem; line-height: 1.55;">
                  <strong>Propósito del Proyecto:</strong> ${missionText}
                </p>

                <button type="button" class="plp-pawly-action-btn" onclick="window.ProjectsView.scrollToLandingSection('plp-sec-recursos')">
                  <span>🐾 Ver Historial de Salud, Guías y Recursos (${publicResources.length || 3})</span>
                  <span>→</span>
                </button>
              </article>
            </div>
          </section>

          <!-- ================================================================
               3. SECCIÓN DE DOCUMENTOS Y RECURSOS (CARDS INTERACTIVOS)
               ================================================================ -->
          <section class="plp-section-alt" id="plp-sec-recursos" aria-labelledby="plp-docs-heading">
            <div class="plp-section-alt-inner">
              <div class="plp-section-header">
                <span class="plp-eyebrow">📄 Documentación Oficial (Solo Recursos Públicos)</span>
                <h2 class="plp-section-title" id="plp-docs-heading">Documentos, Guías y Recursos</h2>
                <p class="plp-section-subtitle">
                  Explora y descarga los informes estratégicos, guías de usuario, manuales técnicos y recursos autorizados para consulta pública.
                </p>
              </div>

              <div class="plp-docs-grid">
                ${publicResources.length > 0 ? publicResources.map(res => `
                  <article class="plp-doc-card" data-plp-search="${this.escapeHtml((res.name || '') + ' ' + (res.category || '') + ' ' + (res.format || '') + ' ' + (res.description || ''))}">
                    <div>
                      <div class="plp-doc-icon-wrap" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      <span class="plp-doc-meta">${this.escapeHtml((res.format || 'DOC').toUpperCase())} • ${this.escapeHtml(res.sizeFormatted || 'Recurso Público')}</span>
                      <h3 class="plp-doc-title">${this.escapeHtml(res.name || 'Recurso del Proyecto')}</h3>
                      <p class="plp-doc-desc">
                        ${this.escapeHtml(res.description || 'Recurso oficial verificado y habilitado para consulta y descarga pública.')}
                      </p>
                    </div>
                    <div class="plp-doc-actions">
                      <button type="button" class="plp-doc-btn outline" onclick="window.ProjectsView.previewCustomLandingResource('${res.id}')">
                        👁️ Visualizar
                      </button>
                      <button type="button" class="plp-doc-btn" onclick="window.ProjectsView.downloadCustomLandingResource('${res.id}')">
                        ⬇ Descargar
                      </button>
                    </div>
                  </article>
                `).join('') : `
                  <!-- Card 1: Plan de Negocios -->
                  <article class="plp-doc-card" data-plp-search="plan de negocios pdf estrategia modelo">
                    <div>
                      <div class="plp-doc-icon-wrap" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                      </div>
                      <span class="plp-doc-meta">DOCUMENTO PDF • 4.2 MB</span>
                      <h3 class="plp-doc-title">Plan de Negocios</h3>
                      <p class="plp-doc-desc">
                        Arquitectura financiera, estrategia de adopción institucional, modelo de sostenibilidad y hoja de ruta 2026–2030.
                      </p>
                    </div>
                    <div class="plp-doc-actions">
                      <button type="button" class="plp-doc-btn outline" onclick="window.ProjectsView.previewLandingDoc('Plan de Negocios — ${selectedTitle}')">
                        👁️ Visualizar
                      </button>
                      <button type="button" class="plp-doc-btn" onclick="window.ProjectsView.downloadLandingDoc('Plan_de_Negocios_Innovatech.pdf')">
                        ⬇ Descargar
                      </button>
                    </div>
                  </article>

                  <!-- Card 2: Estudio de Impacto -->
                  <article class="plp-doc-card" data-plp-search="estudio de impacto metricas resultados pdf">
                    <div>
                      <div class="plp-doc-icon-wrap" aria-hidden="true">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <path d="M8 17v-3"></path>
                          <path d="M12 17v-6"></path>
                          <path d="M16 17v-4"></path>
                        </svg>
                      </div>
                      <span class="plp-doc-meta">DOCUMENTO PDF • 6.8 MB</span>
                      <h3 class="plp-doc-title">Estudio de Impacto</h3>
                      <p class="plp-doc-desc">
                        Evaluación detallada de indicadores de desempeño (KPIs), optimización de procesos y auditoría de transparencia algorítmica.
                      </p>
                    </div>
                    <div class="plp-doc-actions">
                      <button type="button" class="plp-doc-btn outline" onclick="window.ProjectsView.previewLandingDoc('Estudio de Impacto — ${selectedTitle}')">
                        👁️ Visualizar
                      </button>
                      <button type="button" class="plp-doc-btn" onclick="window.ProjectsView.downloadLandingDoc('Estudio_de_Impacto_Innovatech.pdf')">
                        ⬇ Descargar
                      </button>
                    </div>
                  </article>
                `}

                <!-- Card Descargar todo -->
                <article class="plp-doc-card" data-plp-search="descargar todo paquete masivo zip recursos">
                  <div>
                    <div class="plp-doc-icon-wrap" aria-hidden="true">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </div>
                    <span class="plp-doc-meta">DESCARGA MASIVA (.TXT / .ZIP) • ${publicResources.length || 2} RECURSOS</span>
                    <h3 class="plp-doc-title">Descargar Resumen Completo</h3>
                    <p class="plp-doc-desc">
                      Ficha técnica consolidada del proyecto con su descripción ejecutiva, enlaces públicos y listado de recursos autorizados.
                    </p>
                  </div>
                  <div>
                    <div class="plp-doc-actions">
                      <button type="button" class="plp-doc-btn" onclick="window.ProjectsView.triggerLandingBulkDownload()">
                        📦 Descargar todo
                      </button>
                    </div>
                    <div class="plp-progress-wrap" id="plp-bulk-progress-wrap" aria-live="polite">
                      <div class="plp-progress-track">
                        <div class="plp-progress-fill" id="plp-bulk-progress-fill"></div>
                      </div>
                      <span class="plp-progress-status" id="plp-bulk-progress-status">Preparando descarga... 0%</span>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <!-- ================================================================
               4. SECCIÓN DE PRESENTACIONES (CARRUSEL INTERACTIVO)
               ================================================================ -->
          <section class="plp-section" id="plp-sec-presentaciones" aria-labelledby="plp-pres-heading">
            <div class="plp-section-header">
              <span class="plp-eyebrow">📊 Diapositivas Ejecutivas</span>
              <h2 class="plp-section-title" id="plp-pres-heading">Presentaciones del Proyecto</h2>
              <p class="plp-section-subtitle">
                Recorre las diapositivas de la presentación utilizando las flechas laterales o los indicadores inferiores.
              </p>
            </div>

            <div class="plp-carousel-container" role="region" aria-roledescription="carrusel" aria-label="Presentaciones del Proyecto">
              <button type="button" class="plp-carousel-arrow prev" onclick="window.ProjectsView.moveLandingSlide(-1)" aria-label="Diapositiva anterior">❮</button>
              <button type="button" class="plp-carousel-arrow next" onclick="window.ProjectsView.moveLandingSlide(1)" aria-label="Siguiente diapositiva">❯</button>

              <div class="plp-carousel-viewport">
                <div class="plp-carousel-track" id="plp-landing-carousel-track">
                  ${customSlides ? customSlides.map((sl, idx) => `
                    <div class="plp-slide-item">
                      <div class="plp-slide-preview">
                        <span class="plp-slide-badge">Diapositiva ${String(idx + 1).padStart(2, '0')} / ${String(customSlides.length).padStart(2, '0')}</span>
                        <img src="${sl.image || sl.mediaUrl || coverPoster}" alt="${this.escapeHtml(sl.title || `Diapositiva ${idx + 1}`)}" loading="lazy" />
                      </div>
                      <div class="plp-slide-info">
                        <h3>${idx + 1}. ${this.escapeHtml(sl.title || `Diapositiva ${idx + 1}`)}</h3>
                        <p>${this.escapeHtml(sl.content || sl.text || heroSubtitle)}</p>
                        <div class="plp-slide-kpis">
                          <span class="plp-slide-kpi">✔ ${brandSubtitle}</span>
                          <span class="plp-slide-kpi">✔ Lámina ${idx + 1}</span>
                        </div>
                      </div>
                    </div>
                  `).join('') : `
                    <!-- Slide 1 -->
                    <div class="plp-slide-item">
                      <div class="plp-slide-preview">
                        <span class="plp-slide-badge">Diapositiva 01 / 04</span>
                        <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80" alt="Arquitectura de Gobierno de Datos" loading="lazy" />
                      </div>
                      <div class="plp-slide-info">
                        <h3>1. Arquitectura de Gobierno de Datos</h3>
                        <p>Estructura centralizada de ingesta, catalogación inteligente y trazabilidad de extremo a extremo con estándares de seguridad corporativa.</p>
                        <div class="plp-slide-kpis">
                          <span class="plp-slide-kpi">✔ Catálogo Maestro</span>
                          <span class="plp-slide-kpi">✔ Linaje Automatizado</span>
                        </div>
                      </div>
                    </div>

                    <!-- Slide 2 -->
                    <div class="plp-slide-item">
                      <div class="plp-slide-preview">
                        <span class="plp-slide-badge">Diapositiva 02 / 04</span>
                        <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80" alt="Modelos de IA y Analítica Predictiva" loading="lazy" />
                      </div>
                      <div class="plp-slide-info">
                        <h3>2. Modelos de IA y Analítica Predictiva</h3>
                        <p>Despliegue de algoritmos auditables que transforman grandes volúmenes de datos en proyecciones accionables en tiempo real.</p>
                        <div class="plp-slide-kpis">
                          <span class="plp-slide-kpi">✔ +38% Precisión</span>
                          <span class="plp-slide-kpi">✔ IA Explicable</span>
                        </div>
                      </div>
                    </div>

                    <!-- Slide 3 -->
                    <div class="plp-slide-item">
                      <div class="plp-slide-preview">
                        <span class="plp-slide-badge">Diapositiva 03 / 04</span>
                        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80" alt="Ética y Privacidad por Diseño" loading="lazy" />
                      </div>
                      <div class="plp-slide-info">
                        <h3>3. Ética, Privacidad y Cumplimiento</h3>
                        <p>Protocolos de protección de datos personales, anonimización avanzada y comités de validación ética en cada ciclo de vida del modelo.</p>
                        <div class="plp-slide-kpis">
                          <span class="plp-slide-kpi">✔ Privacidad Total</span>
                          <span class="plp-slide-kpi">✔ ISO/IEC 42001</span>
                        </div>
                      </div>
                    </div>

                    <!-- Slide 4 -->
                    <div class="plp-slide-item">
                      <div class="plp-slide-preview">
                        <span class="plp-slide-badge">Diapositiva 04 / 04</span>
                        <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80" alt="Escalabilidad e Impacto" loading="lazy" />
                      </div>
                      <div class="plp-slide-info">
                        <h3>4. Escalabilidad e Impacto Regional</h3>
                        <p>Resultados alcanzados en instituciones aliadas, transferencia tecnológica y próximos hitos de expansión del Proyecto Innovatech.</p>
                        <div class="plp-slide-kpis">
                          <span class="plp-slide-kpi">✔ 12 Nodos Activos</span>
                          <span class="plp-slide-kpi">✔ Red Colaborativa</span>
                        </div>
                      </div>
                    </div>
                  `}
                </div>
              </div>

              <!-- Dots inferiores -->
              <div class="plp-carousel-thumbs" role="tablist">
                ${Array.from({ length: totalCarouselSlides }).map((_, idx) => `
                  <button type="button" class="plp-carousel-dot ${idx === 0 ? 'active' : ''}" onclick="window.ProjectsView.goToLandingSlide(${idx})" aria-label="Diapositiva ${idx + 1}"></button>
                `).join('')}
              </div>
            </div>

            <div class="plp-carousel-cta-wrap">
              <button type="button" class="plp-btn-emerald-lg" onclick="${selected && selected.projectType === 'presentation' ? `window.ProjectsView.openSelectedProject()` : `window.ProjectsView.previewLandingDoc('Presentación Completa — ${selectedTitle}')`}">
                <span>🖥️ Ver Presentación Completa</span>
              </button>
            </div>
          </section>

          <!-- ================================================================
               5. SECCIÓN DE GALERÍA DE IMÁGENES (GRID DINÁMICO / MASONRY)
               ================================================================ -->
          <section class="plp-section-alt" id="plp-sec-galeria" aria-labelledby="plp-gallery-heading">
            <div class="plp-section-alt-inner">
              <div class="plp-section-header">
                <span class="plp-eyebrow">📸 Galería Visual</span>
                <h2 class="plp-section-title" id="plp-gallery-heading">Imágenes y Capturas del Proyecto</h2>
                <p class="plp-section-subtitle">
                  Cuadrícula visual con capturas, diagramas e infografías públicas del proyecto. Haz clic en cualquier imagen para abrir el visor Lightbox.
                </p>
              </div>

              <div class="plp-masonry-grid">
                ${publicVisuals.length > 0 ? publicVisuals.map((img, idx) => {
                  const spanClass = idx === 0 ? 'span-7 row-2' : (idx < 3 ? 'span-5' : 'span-4');
                  const safeUrl = img.url || coverPoster;
                  const safeTitle = this.escapeHtml(img.title || 'Imagen del Proyecto');
                  const safeCat = this.escapeHtml(img.category || 'Galería');
                  return `
                    <figure
                      class="plp-gallery-item ${spanClass}"
                      onclick="window.ProjectsView.openLandingLightbox('${safeUrl.replace(/'/g, "\\'")}', '${safeTitle.replace(/'/g, "\\'")}')"
                    >
                      <img src="${safeUrl}" alt="${safeTitle}" loading="lazy" />
                      <figcaption class="plp-gallery-overlay">
                        <span class="plp-gallery-tag">${safeCat}</span>
                        <p class="plp-gallery-caption">${safeTitle}</p>
                      </figcaption>
                    </figure>
                  `;
                }).join('') : `
                  <figure
                    class="plp-gallery-item span-7 row-2"
                    onclick="window.ProjectsView.openLandingLightbox('${coverPoster}', '${selectedTitle} — Portada Principal')"
                  >
                    <img src="${coverPoster}" alt="Portada del proyecto" loading="lazy" />
                    <figcaption class="plp-gallery-overlay">
                      <span class="plp-gallery-tag">Portada Principal</span>
                      <p class="plp-gallery-caption">${selectedTitle}</p>
                    </figcaption>
                  </figure>

                  <figure
                    class="plp-gallery-item span-5"
                    onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85', 'Prototipo de Dashboard Analítico en Tiempo Real')"
                  >
                    <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80" alt="Prototipo de dashboard" loading="lazy" />
                    <figcaption class="plp-gallery-overlay">
                      <span class="plp-gallery-tag">Prototipo Funcional</span>
                      <p class="plp-gallery-caption">Panel de monitoreo de modelos e indicadores</p>
                    </figcaption>
                  </figure>

                  <figure
                    class="plp-gallery-item span-5"
                    onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1400&q=85', 'Validación experimental de algoritmos de IA')"
                  >
                    <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80" alt="Laboratorio de IA" loading="lazy" />
                    <figcaption class="plp-gallery-overlay">
                      <span class="plp-gallery-tag">Laboratorio IA</span>
                      <p class="plp-gallery-caption">Pruebas de rendimiento y calibración de modelos</p>
                    </figcaption>
                  </figure>
                `}
              </div>
            </div>
          </section>

          <!-- ================================================================
               6. SECCIÓN DE ENLACES DE INTERÉS Y PREGUNTAS FRECUENTES (FAQ)
               ================================================================ -->
          <section class="plp-section" id="plp-sec-contacto" aria-labelledby="plp-links-heading">
            <div class="plp-section-header">
              <span class="plp-eyebrow">🔗 Accesos Directos & Preguntas Frecuentes</span>
              <h2 class="plp-section-title" id="plp-links-heading">Enlaces Externos y Recursos Web</h2>
              <p class="plp-section-subtitle">
                Conecta con los enlaces oficiales públicos, demos interactivas, repositorios y preguntas frecuentes del proyecto.
              </p>
            </div>

            <div class="plp-links-grid">
              ${publicLinks.length > 0 ? publicLinks.map(lnk => `
                <a href="${this.escapeHtml(lnk.url)}" target="_blank" rel="noopener noreferrer" class="plp-link-card" data-plp-search="${this.escapeHtml((lnk.name || '') + ' ' + (lnk.category || '') + ' ' + (lnk.description || ''))}">
                  <div class="plp-link-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="plp-link-title">${this.escapeHtml(lnk.name || 'Enlace Externo')} ${lnk.verified ? '<span style="font-size:0.7rem;color:#10b981;font-weight:800;">✔ Verificado</span>' : ''}</h3>
                    <p class="plp-link-desc">${this.escapeHtml(lnk.description || lnk.url)}</p>
                  </div>
                </a>
              `).join('') : `
                <!-- Sitio Web Aliado -->
                <a href="https://mentixs.vercel.app" target="_blank" rel="noopener noreferrer" class="plp-link-card" data-plp-search="sitio web aliado portal">
                  <div class="plp-link-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="2" y1="12" x2="22" y2="12"></line>
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                    </svg>
                  </div>
                  <div>
                    <h3 class="plp-link-title">Plataforma Oficial Mentix</h3>
                    <p class="plp-link-desc">Portal oficial de la red interinstitucional de innovación y proyectos.</p>
                  </div>
                </a>

                <!-- Repositorio de Código -->
                <a href="https://github.com/meli030814abc-sys/Mentix" target="_blank" rel="noopener noreferrer" class="plp-link-card" data-plp-search="repositorio de codigo github desarrollo">
                  <div class="plp-link-icon" aria-hidden="true">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="16 18 22 12 16 6"></polyline>
                      <polyline points="8 6 2 12 8 18"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h3 class="plp-link-title">Repositorio de Código</h3>
                    <p class="plp-link-desc">Código fuente, arquitecturas de referencia y scripts en GitHub.</p>
                  </div>
                </a>
              `}

              <!-- Impactos y Beneficios -->
              <div class="plp-link-card" role="button" tabindex="0" onclick="window.ProjectsView.previewLandingDoc('Impactos y Beneficios — ${selectedTitle}')" data-plp-search="impactos frecuentes metricas resultados">
                <div class="plp-link-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="20" x2="18" y2="10"></line>
                    <line x1="12" y1="20" x2="12" y2="4"></line>
                    <line x1="6" y1="20" x2="6" y2="14"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="plp-link-title">Impactos y Resultados</h3>
                  <p class="plp-link-desc">Beneficios clave, alcance para usuarios y propuesta de valor del proyecto.</p>
                </div>
              </div>

              <!-- Preguntas Frecuentes (FAQ) -->
              <div class="plp-link-card" role="button" tabindex="0" onclick="window.ProjectsView.openProjectFaqModal()" data-plp-search="preguntas frecuentes faq soporte ayuda">
                <div class="plp-link-icon" aria-hidden="true">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="plp-link-title">Preguntas Frecuentes (FAQ)</h3>
                  <p class="plp-link-desc">${publicFaqs.length > 0 ? `${publicFaqs.length} preguntas respondidas sobre el uso del proyecto.` : 'Respuestas rápidas sobre uso, gobernanza y soporte técnico.'}</p>
                </div>
              </div>
            </div>
          </section>

          <!-- Footer -->
          <footer class="plp-footer">
            <div>
              <strong>${brandTitle} — ${brandSubtitle}</strong> • © 2026
            </div>
            <div>
              Experiencia UX/UI Corporativa • Accesibilidad & Diseño Responsivo
            </div>
          </footer>

          <!-- Lightbox / Modal Universal -->
          <div class="plp-lightbox" id="plp-inline-lightbox" role="dialog" aria-modal="true" onclick="if(event.target===this) window.ProjectsView.closeLandingLightbox()">
            <div class="plp-lightbox-content" id="plp-inline-lightbox-body"></div>
          </div>
        </div>
      </div>
    `;
  },

  scrollToLandingSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  playLandingVideo() {
    const box = document.getElementById('plp-hero-video-box');
    if (!box) return;
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const vid = (selected && selected.video) ? selected.video : {};
    const rawUrl = vid.url || vid.embedUrl || (selected && selected.videoUrl) || '';

    if (vid.sourceType === 'upload' && vid.fileDataUrl) {
      box.innerHTML = `<video src="${vid.fileDataUrl}" controls autoplay style="width:100%; height:100%; display:block; background:#000;"></video>`;
      return;
    }

    if (rawUrl) {
      const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (ytMatch) {
        box.innerHTML = `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0" title="Video del Proyecto" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:0; width:100%; height:100%; display:block;"></iframe>`;
        return;
      }
      if (vimeoMatch) {
        box.innerHTML = `<iframe width="100%" height="100%" src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" title="Video del Proyecto" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border:0; width:100%; height:100%; display:block;"></iframe>`;
        return;
      }
      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(rawUrl) || rawUrl.startsWith('data:video/')) {
        box.innerHTML = `<video src="${rawUrl}" controls autoplay style="width:100%; height:100%; display:block; background:#000;"></video>`;
        return;
      }
    }

    box.innerHTML = `
      <iframe
        width="100%"
        height="100%"
        src="https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0"
        title="Video Explicativo Proyecto Innovatech"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style="border:0; width:100%; height:100%; display:block;"
      ></iframe>
    `;
  },

  goToLandingSlide(index) {
    const slides = document.querySelectorAll('#plp-landing-carousel-track .plp-slide-item');
    const total = slides.length || 4;
    this.currentSlideIndex = (index + total) % total;
    const track = document.getElementById('plp-landing-carousel-track');
    if (track) {
      track.style.transform = `translateX(-${this.currentSlideIndex * 100}%)`;
    }
    document.querySelectorAll('#view-projects .plp-carousel-dot').forEach((dot, idx) => {
      dot.classList.toggle('active', idx === this.currentSlideIndex);
    });
  },

  moveLandingSlide(step) {
    this.goToLandingSlide((this.currentSlideIndex || 0) + step);
  },

  previewCustomLandingResource(resId) {
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const res = ((selected && selected.resources) || []).find(r => r.id === resId && r.visibility !== 'private');
    if (!res) return;
    if (res.textExtract) {
      this.previewLandingDoc(`${res.name} — Extracto:\n${res.textExtract.slice(0, 600)}`);
      return;
    }
    const targetUrl = res.url || res.fileDataUrl;
    if (targetUrl && (targetUrl.startsWith('http') || targetUrl.startsWith('data:image/'))) {
      if (res.format === 'PNG' || res.format === 'JPG' || res.format === 'WEBP' || targetUrl.startsWith('data:image/')) {
        this.openLandingLightbox(targetUrl, res.name || 'Recurso gráfico');
      } else {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }
    this.previewLandingDoc(res.name || 'Recurso del Proyecto');
  },

  downloadCustomLandingResource(resId) {
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const res = ((selected && selected.resources) || []).find(r => r.id === resId && r.visibility !== 'private');
    if (!res) return;
    const targetUrl = res.fileDataUrl || res.url;
    if (targetUrl) {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.download = res.fileName || `${(res.name || 'recurso').replace(/\s+/g, '_')}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }
    this.downloadLandingDoc(`${(res.name || 'Recurso').replace(/\s+/g, '_')}.txt`);
  },

  openProjectFaqModal() {
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const faqs = (selected && Array.isArray(selected.faqs) && selected.faqs.length > 0)
      ? selected.faqs
      : [
          { question: '¿Cuál es el propósito principal de este proyecto?', answer: (selected && (selected.mainObjective || selected.description)) || 'Facilitar el acceso a recursos estructurados, documentación oficial y herramientas interactivas.' },
          { question: '¿Qué recursos están disponibles públicamente?', answer: 'Todos los documentos, presentaciones y enlaces marcados como públicos por el equipo responsable.' }
        ];
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    const isDark = (document.querySelector('.plp-wrapper')?.getAttribute('data-theme') || this.getLandingTheme()) === 'dark';
    const bg = isDark ? '#0f172a' : '#ffffff';
    const titleColor = isDark ? '#ffffff' : '#0a192f';
    const textColor = isDark ? '#e2e8f0' : '#334155';

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="padding:2.25rem; background:${bg}; border-radius:var(--plp-radius-lg); max-height:80vh; overflow-y:auto;">
        <span class="plp-eyebrow">❓ Preguntas Frecuentes (FAQ)</span>
        <h2 style="margin:0.4rem 0 1.25rem; color:${titleColor};">${this.escapeHtml((selected && selected.title) || 'Proyecto Innovatech')}</h2>
        <div style="display:flex; flex-direction:column; gap:1rem;">
          ${faqs.map(f => `
            <div style="padding:1rem 1.2rem; border-radius:12px; border:1px solid rgba(16,185,129,0.3); background:rgba(16,185,129,0.06);">
              <strong style="display:block; color:${titleColor}; margin-bottom:0.35rem;">${this.escapeHtml(f.question || '')}</strong>
              <p style="margin:0; color:${textColor}; line-height:1.55; font-size:0.94rem;">${this.escapeHtml(f.answer || '')}</p>
            </div>
          `).join('')}
        </div>
        <div style="margin-top:1.5rem; text-align:right;">
          <button class="plp-btn-secondary" onclick="window.ProjectsView.closeLandingLightbox()">Cerrar</button>
        </div>
      </div>
    `;
    modal.classList.add('active');
  },

  triggerLandingBulkDownload() {
    const wrap = document.getElementById('plp-bulk-progress-wrap');
    const fill = document.getElementById('plp-bulk-progress-fill');
    const status = document.getElementById('plp-bulk-progress-status');
    if (!wrap || !fill || !status) return;

    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const safeSlug = (selected && selected.slug) ? selected.slug : 'Innovatech';

    wrap.classList.add('active');
    let progress = 0;
    fill.style.width = '0%';
    status.textContent = 'Empaquetando documentos públicos y ficha técnica... 0%';

    const timer = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(timer);
        fill.style.width = '100%';
        status.textContent = `✔ ¡Resumen público ${safeSlug}_Completo.txt descargado!`;
        this.downloadLandingDoc(`${safeSlug}_Ficha_Publica.txt`);
      } else {
        fill.style.width = progress + '%';
        status.textContent = `Descargando paquete... ${progress}%`;
      }
    }, 260);
  },

  downloadLandingDoc(filename) {
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const title = (selected && selected.title) || 'PROYECTO INNOVATECH - GOBIERNO DE DATOS E IA';
    const desc = (selected && (selected.fullDescription || selected.description)) || 'Plataforma integral de Gobierno de Datos e Inteligencia Artificial.';
    const obj = (selected && selected.mainObjective) || 'Definición Estratégica y Gobernanza de Datos.';
    const ben = (selected && selected.userBenefits) || 'Indicadores de Impacto y Sostenibilidad.';
    const pubRes = ((selected && selected.resources) || []).filter(r => r.visibility !== 'private').map((r, i) => `  ${i + 1}. ${r.name} (${r.format || 'DOC'})`).join('\n');

    const content = `${title.toUpperCase()}\nDocumento: ${filename}\nFecha: ${new Date().toLocaleDateString()}\n\n1. DESCRIPCIÓN:\n${desc}\n\n2. OBJETIVO PRINCIPAL:\n${obj}\n\n3. BENEFICIOS:\n${ben}\n\n4. RECURSOS PÚBLICOS INCLUIDOS:\n${pubRes || '  - Documentación general del proyecto'}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  openLandingLightbox(imgUrl, caption) {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <img src="${imgUrl}" alt="${this.escapeHtml(caption)}" style="width:100%; max-height:75vh; object-fit:contain; background:#0a192f; display:block;" />
      <div style="padding:1.25rem 1.75rem; background:#ffffff;">
        <h3 style="margin:0; font-size:1.15rem; color:#0a192f;">${this.escapeHtml(caption)}</h3>
      </div>
    `;
    modal.classList.add('active');
  },

  previewLandingDoc(title) {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const isDark = (document.querySelector('.plp-wrapper')?.getAttribute('data-theme') || this.getLandingTheme()) === 'dark';
    const bg = isDark ? '#0f172a' : '#ffffff';
    const titleColor = isDark ? '#ffffff' : '#0a192f';
    const textColor = isDark ? '#e2e8f0' : '#334155';
    const border = isDark ? '1px solid #334155' : 'none';
    const summaryText = (selected && (selected.fullDescription || selected.description)) || 'Recurso oficial del Proyecto Innovatech — Gobierno de Datos e IA. Incluye lineamientos estratégicos, protocolos de calidad de datos, arquitectura técnica y métricas de impacto verificadas.';

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="padding:2.5rem; background:${bg}; border:${border}; border-radius:var(--plp-radius-lg);">
        <span class="plp-eyebrow">Vista Previa Interactiva</span>
        <h2 style="margin:0.5rem 0 1rem; color:${titleColor};">${this.escapeHtml(title)}</h2>
        <p style="color:${textColor}; line-height:1.7; white-space:pre-line;">${this.escapeHtml(summaryText)}</p>
        <div style="margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="plp-cta-btn" onclick="window.ProjectsView.downloadLandingDoc('${this.escapeHtml(title.replace(/\s+/g, '_').slice(0, 40))}.txt'); window.ProjectsView.closeLandingLightbox();">
            ⬇ Descargar Ficha
          </button>
          <button class="plp-btn-secondary" onclick="window.ProjectsView.closeLandingLightbox()">
            Cerrar
          </button>
        </div>
      </div>
    `;
    modal.classList.add('active');
  },


  closeLandingLightbox() {
    const modal = document.getElementById('plp-inline-lightbox');
    if (modal) modal.classList.remove('active');
  },

  filterLandingSearch(query) {
    const q = (query || '').toLowerCase().trim();
    document.querySelectorAll('#view-projects [data-plp-search]').forEach((el) => {
      const text = (el.getAttribute('data-plp-search') + ' ' + el.innerText).toLowerCase();
      el.style.opacity = !q || text.includes(q) ? '1' : '0.25';
    });
  },

  getSavedProjectCodes() {
    try {
      const raw = localStorage.getItem('mentix_custom_project_codes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  saveCustomProjectCode() {
    if (!this.isTeacherOrAdmin()) {
      alert('🚫 Solo maestros y administradores pueden crear códigos de proyecto.');
      return;
    }
    const input = document.getElementById('custom-project-code-input');
    const errEl = document.getElementById('custom-code-error');
    const okEl = document.getElementById('custom-code-success');
    const rawCode = input ? input.value.trim() : '';

    if (errEl) errEl.style.display = 'none';
    if (okEl) okEl.style.display = 'none';

    if (!rawCode) {
      if (errEl) {
        errEl.textContent = '⚠️ Por favor escribe el código que deseas asignar (ej: 1234, PROYECTO1, etc.).';
        errEl.style.display = 'block';
      } else {
        alert('Por favor escribe un código.');
      }
      if (input) input.focus();
      return;
    }

    const u = window.appState?.currentUser || {};
    const codes = this.getSavedProjectCodes().filter(item => String(item.code).toLowerCase() !== rawCode.toLowerCase());
    const newEntry = {
      code: rawCode,
      author: u.name || u.username || 'Profesor',
      createdAt: new Date().toLocaleString()
    };
    codes.unshift(newEntry);

    try {
      localStorage.setItem('mentix_custom_project_codes', JSON.stringify(codes));
      localStorage.removeItem('te_reto_room_closed_' + rawCode);
    } catch (e) {}

    this.lastCreatedCode = rawCode;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  copyCustomProjectCode(code) {
    if (!code) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(() => {
        alert('✅ Código "' + code + '" copiado para enviarlo a los estudiantes.');
      }).catch(() => {
        prompt('Copia este código para tus estudiantes:', code);
      });
    } else {
      prompt('Copia este código para tus estudiantes:', code);
    }
  },

  deleteCustomProjectCode(code) {
    const codes = this.getSavedProjectCodes().filter(item => item.code !== code);
    try {
      localStorage.setItem('mentix_custom_project_codes', JSON.stringify(codes));
    } catch (e) {}
    if (this.lastCreatedCode === code) this.lastCreatedCode = null;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  renderProjectSelectorView(container) {
    const isTeacherOrAdmin = this.isTeacherOrAdmin();
    if (!isTeacherOrAdmin) {
      this.viewMode = 'list';
      this.render();
      return;
    }

    const savedCodes = this.getSavedProjectCodes();
    const recentCode = this.lastCreatedCode || (savedCodes[0] ? savedCodes[0].code : '');

    container.innerHTML = `
      <div class="experience-screen-container animate-fade-in" style="min-height: 80vh; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 2rem 1.25rem 4rem;">
        <!-- Header -->
        <div class="experience-header" style="width: 100%; max-width: 680px; margin-bottom: 1.5rem;">
          <button class="experience-back-btn" onclick="ProjectsView.closeCreateProjectModal()">
            ← Volver a Proyectos
          </button>
        </div>

        <!-- Tarjeta única para que el profesor escriba el código que él elija -->
        <div class="glass-panel" style="width: 100%; max-width: 640px; padding: 2.5rem 2rem; border-radius: 22px; border: 2px solid var(--neon-cyan); background: linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(19, 27, 46, 0.96)); box-shadow: 0 15px 45px rgba(0, 245, 212, 0.2); text-align: center;">
          
          <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(0, 245, 212, 0.15); color: var(--neon-cyan); font-weight: 900; font-size: 0.8rem; text-transform: uppercase; padding: 0.35rem 0.9rem; border-radius: 9999px; letter-spacing: 0.6px; margin-bottom: 1rem; border: 1px solid rgba(0,245,212,0.4);">
            <span>👨‍🏫</span> Solo para Maestros y Administradores
          </div>

          <h1 style="font-size: clamp(1.6rem, 3.5vw, 2.2rem); font-weight: 900; color: #ffffff; margin: 0 0 0.5rem; line-height: 1.25;">
            🔑 Crear Código de Proyecto
          </h1>

          <p style="color: var(--text-secondary); font-size: 1rem; margin: 0 auto 1.75rem; max-width: 500px; line-height: 1.5;">
            Escribe tú mismo el código que elijas para este proyecto y compártelo con tus estudiantes.
          </p>

          <form onsubmit="event.preventDefault(); window.ProjectsView.saveCustomProjectCode();" style="max-width: 460px; margin: 0 auto;">
            <label for="custom-project-code-input" style="display: block; text-align: left; font-size: 0.85rem; font-weight: 900; color: var(--neon-cyan); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.6rem;">
              ✏️ Escribe el código que tú elijas:
            </label>

            <input
              type="text"
              id="custom-project-code-input"
              placeholder="Ej: PROYECTO1, 2026, CLASE10..."
              autocomplete="off"
              maxlength="24"
              style="width: 100%; box-sizing: border-box; padding: 1.1rem 1.25rem; font-size: 1.5rem; font-weight: 900; text-align: center; letter-spacing: 2px; color: #ffffff; background: rgba(8, 13, 26, 0.9); border: 2px solid rgba(0, 245, 212, 0.6); border-radius: 14px; outline: none; box-shadow: inset 0 2px 10px rgba(0,0,0,0.6), 0 0 20px rgba(0,245,212,0.15); margin-bottom: 1rem;"
            />

            <div id="custom-code-error" style="display: none; color: #ff6b6b; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 10px; padding: 0.65rem 1rem; font-size: 0.9rem; font-weight: 700; margin-bottom: 1rem;"></div>

            <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; margin-top: 0.5rem;">
              <button type="button" class="btn btn-outline" onclick="window.ProjectsView.closeCreateProjectModal()" style="padding: 0.85rem 1.4rem; font-weight: 800; border-radius: 12px;">
                Cancelar
              </button>
              <button type="submit" class="btn btn-cyan btn-lg" style="padding: 0.85rem 2rem; font-weight: 900; font-size: 1.05rem; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,245,212,0.4);">
                <span>✅</span> Guardar Mi Código
              </button>
            </div>
          </form>

          ${recentCode ? `
            <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(255,255,255,0.1);">
              <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.5rem;">
                Código activo elegido por el profesor:
              </div>
              <div style="display: inline-flex; align-items: center; gap: 0.85rem; background: rgba(0, 245, 212, 0.12); border: 1.5px solid var(--neon-cyan); padding: 0.75rem 1.4rem; border-radius: 14px; margin-bottom: 0.75rem; flex-wrap: wrap; justify-content: center;">
                <span style="font-size: 1.75rem; font-weight: 900; color: var(--neon-cyan); letter-spacing: 3px; text-shadow: 0 0 15px rgba(0,245,212,0.5);">
                  ${this.escapeHtml(recentCode)}
                </span>
                <button type="button" class="btn btn-cyan btn-sm" onclick="window.ProjectsView.copyCustomProjectCode('${this.escapeHtml(recentCode)}')" style="font-weight: 800; padding: 0.45rem 0.9rem; border-radius: 8px;">
                  📋 Copiar para enviar
                </button>
              </div>
            </div>
          ` : ''}

          ${savedCodes.length > 0 ? `
            <div style="margin-top: 1.25rem; text-align: left;">
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
                Mis códigos creados (${savedCodes.length}):
              </div>
              <div style="display: flex; flex-direction: column; gap: 0.45rem; max-height: 180px; overflow-y: auto;">
                ${savedCodes.map(item => `
                  <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 0.5rem 0.85rem; border-radius: 10px;">
                    <div>
                      <span style="font-weight: 900; color: #ffffff; font-size: 1rem; letter-spacing: 1px;">${this.escapeHtml(item.code)}</span>
                      <span style="font-size: 0.75rem; color: var(--text-muted); margin-left: 0.5rem;">• ${this.escapeHtml(item.author || 'Profesor')}</span>
                    </div>
                    <div style="display: flex; gap: 0.4rem;">
                      <button type="button" class="btn btn-outline btn-sm" onclick="window.ProjectsView.copyCustomProjectCode('${this.escapeHtml(item.code)}')" style="padding: 0.25rem 0.6rem; font-size: 0.78rem;">
                        📋 Copiar
                      </button>
                      <button type="button" class="btn btn-danger btn-sm" onclick="window.ProjectsView.deleteCustomProjectCode('${this.escapeHtml(item.code)}')" style="padding: 0.25rem 0.55rem; font-size: 0.78rem;">
                        🗑️
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderProjectModeCard(mode, isSelected) {
    const accent = mode.accent || mode.themeColor || '#7c3aed';
    const bgGrad = mode.bgGradient || mode.gradient || 'linear-gradient(135deg, #1e1b4b, #312e81)';
    const artwork = typeof mode.renderIllustration === 'function' ? mode.renderIllustration() : (mode.svg || '');
    const cta = mode.ctaLabel || mode.actionLabel || '➕ Crear proyecto';

    return `
      <div class="experience-card ${isSelected ? 'selected' : ''}" 
           id="project-mode-card-${mode.id}"
           style="--exp-accent: ${accent}; --exp-bg: ${bgGrad}; --exp-border: ${accent};"
           onclick="ProjectsView.selectProjectType('${mode.id}')">
        
        <!-- Top Badges -->
        <div class="experience-card-badges">
          <span class="experience-card-badge" style="background: ${accent};">
            ${mode.badge}
          </span>
        </div>

        <!-- Checkmark for selected -->
        <div class="experience-selected-check">✓</div>

        <!-- Artwork Illustration -->
        <div class="experience-illustration-box">
          ${artwork}
        </div>

        <!-- Card Footer -->
        <div class="experience-card-footer">
          <div class="experience-card-title-row">
            <span class="experience-card-emoji">${mode.icon}</span>
            <h3 class="experience-card-name">${mode.name}</h3>
          </div>
          <p class="experience-card-desc">${mode.tagline || mode.description}</p>
          <div style="margin-top: 0.7rem;">
            <button class="btn btn-sm" 
                    style="width: 100%; background: ${accent}; color: #fff; border: none; font-weight: 800; border-radius: 10px; padding: 0.5rem 0.75rem; box-shadow: 0 6px 16px rgba(0,0,0,0.25);"
                    onclick="event.stopPropagation(); ProjectsView.startNewProject('${mode.id}')">
              ${cta}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderProjectConfigBar(mode) {
    if (!mode) return '';
    const accent = mode.accent || mode.themeColor || '#7c3aed';
    const bgGrad = mode.bgGradient || mode.gradient || 'linear-gradient(135deg, #1e1b4b, #312e81)';
    const cta = mode.ctaLabel || mode.actionLabel || ('➕ Crear ' + mode.name);

    return `
      <div class="experience-config-panel" style="--exp-accent: ${accent};">
        <div class="experience-selected-summary">
          <div class="experience-selected-icon" style="background: ${bgGrad}; border-color: ${accent};">
            ${mode.icon}
          </div>
          <div class="experience-selected-text">
            <div class="experience-selected-name-row">
              <span class="experience-selected-name">${mode.name}</span>
              <span class="experience-selected-pill" style="background: ${accent}22; color: ${accent}; border: 1px solid ${accent}55;">
                ${mode.badge}
              </span>
            </div>
            <p class="experience-selected-desc">${mode.description}</p>
          </div>
        </div>

        <div class="experience-config-controls">
          <button class="btn btn-secondary" onclick="ProjectsView.closeCreateProjectModal()">
            Cancelar
          </button>
          <button class="experience-launch-btn" style="background: linear-gradient(135deg, ${accent}, #4f46e5);" onclick="ProjectsView.confirmSelectedProject()">
            <span>${cta}</span>
            <span class="experience-launch-arrow">➔</span>
          </button>
        </div>
      </div>
    `;
  },

  selectProjectType(modeId) {
    this.selectedProjectTypeId = modeId;
    if (window.soundEngine) window.soundEngine.playClick();

    document.querySelectorAll('#view-projects .experience-card').forEach((card) => {
      card.classList.remove('selected');
    });
    const activeCard = document.getElementById(`project-mode-card-${modeId}`);
    if (activeCard) activeCard.classList.add('selected');

    const selectedMode = this.projectModes.find((m) => m.id === modeId);
    const actionBar = document.getElementById('project-selector-action-bar');
    if (actionBar && selectedMode) {
      actionBar.innerHTML = this.renderProjectConfigBar(selectedMode);
    }
  },

  confirmSelectedProject() {
    this.startNewProject(this.selectedProjectTypeId || 'presentation');
  },

  startNewProject(type) {
    this.viewMode = 'list';
    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.remove('active');

    if (type === 'presentation') {
      window.appRouter.createPresentation();
    } else if (type === 'video') {
      window.appRouter.createVideo();
    } else if (type === 'document') {
      window.appRouter.createDocument();
    } else if (type === 'url') {
      window.appRouter.createUrl();
    } else if (type === 'import_presentation') {
      this.openImportPresentationModal();
    } else if (type === 'import_document') {
      this.openImportDocumentModal();
    } else {
      window.appRouter.navigate('creator');
    }
  },

  openImportPresentationModal() {
    this.viewMode = 'list';
    window.appRouter.createPresentation();
    setTimeout(() => {
      if (window.PresentationView) {
        window.PresentationView.openImportModal();
      }
    }, 120);
  },

  openImportDocumentModal() {
    this.viewMode = 'list';
    window.appRouter.createDocument();
    setTimeout(() => {
      if (window.DocumentProjectView) {
        window.DocumentProjectView.openImportModal();
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