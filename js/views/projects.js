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

    const navEl = document.getElementById('main-navbar');
    if (this.viewMode === 'wizard') {
      if (navEl) navEl.style.display = 'none';
      if (window.ProjectWizard) {
        window.ProjectWizard.render(container);
        return;
      }
    } else {
      if (navEl && (!window.appRouter || !['lobby-join', 'game', 'leaderboard', 'podium'].includes(window.appRouter.currentView))) {
        navEl.style.display = '';
      }
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
            <button class="btn btn-primary btn-lg" onclick="window.ProjectsView.openJoinProjectModal()" style="font-weight: 900; padding: 0.85rem 1.45rem; font-size: 1rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 0.5rem; cursor: pointer; box-shadow: 0 8px 24px rgba(247, 37, 133, 0.45); border: none; background: linear-gradient(135deg, #f72585, #7209b7); color: #ffffff; transition: transform 0.2s, box-shadow 0.2s;">
              <span style="font-size: 1.15rem;">🎮</span> <span>Unirse a un código</span>
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
            <button class="btn btn-outline" onclick="window.ProjectsView.toggleTheme()" style="padding: 0.8rem 1.2rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.5rem;" title="Alternar modo claro / oscuro">
              <span>${this.getLandingTheme() === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}</span>
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

      </div>
    `;
  },

  renderProjectAttemptsSection() {
    return '';
  },

  renderProjectCard(c, currentUser) {
    const isAuthor = window.appRouter ? window.appRouter.isChallengeOwner(c) : false;
    const cardProgress = this.calculateProjectProgress(c);

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

          <!-- Barra y porcentaje de avance real del proyecto -->
          <div style="margin-bottom: 0.95rem; background: rgba(0,0,0,0.22); border-radius: 8px; padding: 0.5rem 0.65rem; border: 1px solid rgba(255,255,255,0.08);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; font-size: 0.76rem;">
              <span style="font-weight: 700; color: var(--text-muted); display: flex; align-items: center; gap: 0.35rem;">
                <span>📈</span> Avance del proyecto
              </span>
              <strong style="color: ${cardProgress === 100 ? '#10b981' : (cardProgress > 50 ? '#00e5be' : '#f59e0b')}; font-weight: 900;">
                ${cardProgress}%
              </strong>
            </div>
            <div style="height: 6px; background: rgba(255,255,255,0.12); border-radius: 9999px; overflow: hidden;">
              <div style="height: 100%; width: ${cardProgress}%; background: ${cardProgress === 100 ? 'linear-gradient(90deg, #10b981, #059669)' : 'linear-gradient(90deg, #00e5be, #0ea5e9)'}; border-radius: 9999px; transition: width 0.4s ease;"></div>
            </div>
          </div>

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
    const navEl = document.getElementById('main-navbar');
    if (navEl) {
      if (mode === 'wizard') {
        navEl.style.display = 'none';
      } else if (!window.appRouter || !['lobby-join', 'game', 'leaderboard', 'podium'].includes(window.appRouter.currentView)) {
        navEl.style.display = '';
      }
    }
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

  openJoinProjectModal(prefillCode = '') {
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    const existing = document.getElementById('project-join-modal');
    if (existing) existing.remove();

    const savedCodes = this.getSavedProjectCodes();

    const modalHtml = `
      <div id="project-join-modal" style="position: fixed; inset: 0; z-index: 999999; display: flex; align-items: center; justify-content: center; background: rgba(5, 7, 15, 0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); padding: 1.25rem;" onclick="if(event.target === this) window.ProjectsView.closeJoinProjectModal();">
        <div class="glass-panel" style="width: 100%; max-width: 520px; background: linear-gradient(145deg, rgba(15, 23, 42, 0.98), rgba(24, 18, 43, 0.98)); border: 2.5px solid #f72585; box-shadow: 0 20px 60px rgba(247, 37, 133, 0.35), 0 0 40px rgba(114, 9, 183, 0.3); border-radius: 24px; padding: 2.25rem 2rem; position: relative; text-align: center; animation: fadeIn 0.25s ease-out;">
          
          <button type="button" onclick="window.ProjectsView.closeJoinProjectModal()" title="Cerrar" style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; width: 36px; height: 36px; border-radius: 50%; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseenter="this.style.background='rgba(247, 37, 133, 0.35)'; this.style.borderColor='#f72585';" onmouseleave="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.15)';">
            ✕
          </button>

          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(247, 37, 133, 0.16); color: #f72585; font-weight: 900; font-size: 0.82rem; text-transform: uppercase; padding: 0.4rem 1.1rem; border-radius: 9999px; letter-spacing: 0.6px; margin-bottom: 1.25rem; border: 1.5px solid rgba(247, 37, 133, 0.5);">
            <span>🎮</span> Acceso a Proyectos por PIN
          </div>

          <h2 style="font-size: clamp(1.6rem, 3.2vw, 2.1rem); font-weight: 900; color: #ffffff; margin: 0 0 0.5rem; line-height: 1.25;">
            Unirse a un Proyecto
          </h2>

          <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0 auto 1.6rem; max-width: 440px; line-height: 1.5;">
            Ingresa el código o PIN que te compartió tu docente o equipo para entrar directamente a la lección o landing page.
          </p>

          <form id="project-join-form" onsubmit="event.preventDefault(); window.ProjectsView.submitJoinProjectCode();" style="display: flex; flex-direction: column; gap: 1rem;">
            <div>
              <input
                type="text"
                id="project-join-code-input"
                placeholder="CÓDIGO O PIN"
                value="${this.escapeHtml(prefillCode)}"
                autocomplete="off"
                maxlength="32"
                style="width: 100%; box-sizing: border-box; text-align: center; font-size: clamp(1.5rem, 3.5vw, 2rem); font-weight: 900; padding: 1.1rem 1.25rem; border-radius: 16px; background: rgba(10, 15, 30, 0.95) !important; border: 2.5px solid #f72585 !important; color: #ffffff !important; outline: none; letter-spacing: 2px; text-transform: uppercase; box-shadow: 0 8px 30px rgba(247, 37, 133, 0.3) !important; transition: border-color 0.2s, box-shadow 0.2s;"
                onfocus="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 0 30px rgba(0, 245, 212, 0.5)';"
                onblur="this.style.borderColor='#f72585'; this.style.boxShadow='0 8px 30px rgba(247, 37, 133, 0.3)';"
                oninput="const e = document.getElementById('project-join-error'); if(e) e.style.display='none';"
              />
              <div id="project-join-error" style="display: none; color: #ff4d6d; background: rgba(255, 77, 109, 0.12); border: 1px solid rgba(255, 77, 109, 0.35); border-radius: 12px; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 700; margin-top: 0.85rem; text-align: center;"></div>
            </div>

            <div style="display: flex; gap: 0.75rem; justify-content: center; margin-top: 0.5rem; flex-wrap: wrap;">
              <button type="button" class="btn btn-outline" onclick="window.ProjectsView.closeJoinProjectModal()" style="padding: 0.85rem 1.4rem; font-weight: 800; border-radius: 12px;">
                Cancelar
              </button>
              <button type="submit" id="project-join-submit-btn" class="btn" style="background: linear-gradient(135deg, #f72585, #7209b7); color: #ffffff; border: none; font-weight: 900; padding: 0.85rem 2rem; font-size: 1.05rem; border-radius: 12px; box-shadow: 0 8px 25px rgba(247, 37, 133, 0.5); cursor: pointer; min-width: 190px;">
                <span>🚀</span> Entrar al Proyecto
              </button>
            </div>
          </form>

          ${savedCodes && savedCodes.length > 0 ? `
            <div style="margin-top: 1.75rem; padding-top: 1.25rem; border-top: 1px solid rgba(255,255,255,0.1); text-align: left;">
              <div style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.4rem;">
                <span>💡</span> Códigos de proyectos activos:
              </div>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${savedCodes.slice(0, 6).map(sc => `
                  <button type="button" onclick="document.getElementById('project-join-code-input').value='${this.escapeHtml(sc.code)}'; window.ProjectsView.submitJoinProjectCode();" style="background: rgba(247, 37, 133, 0.12); border: 1px solid rgba(247, 37, 133, 0.35); color: #fff; padding: 0.38rem 0.85rem; border-radius: 9999px; font-weight: 800; font-size: 0.85rem; cursor: pointer; transition: all 0.15s; letter-spacing: 0.5px;" onmouseenter="this.style.background='rgba(247, 37, 133, 0.28)'; this.style.borderColor='#f72585';" onmouseleave="this.style.background='rgba(247, 37, 133, 0.12)'; this.style.borderColor='rgba(247, 37, 133, 0.35)';">
                    #${this.escapeHtml(sc.code)}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Escape listener
    const escHandler = (evt) => {
      if (evt.key === 'Escape') {
        window.ProjectsView.closeJoinProjectModal();
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);

    setTimeout(() => {
      const input = document.getElementById('project-join-code-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 60);
  },

  closeJoinProjectModal() {
    const modal = document.getElementById('project-join-modal');
    if (modal) modal.remove();
  },

  submitJoinProjectCode() {
    const input = document.getElementById('project-join-code-input');
    const errEl = document.getElementById('project-join-error');
    const raw = input ? input.value.trim() : '';

    if (errEl) errEl.style.display = 'none';

    if (!raw) {
      if (errEl) {
        errEl.textContent = '⚠️ Por favor escribe el código o PIN del proyecto.';
        errEl.style.display = 'block';
      }
      if (input) input.focus();
      return;
    }

    const clean = raw.trim();
    const lower = clean.toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    const challenges = window.appState?.challenges || [];
    const projectItems = challenges.filter(c => 
      c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url' || c.isGovDataProject || c.isProject
    );

    // 1. Buscar en mentix_custom_project_codes
    const savedCodes = this.getSavedProjectCodes();
    const matchedCustom = savedCodes.find(sc => String(sc.code || '').trim().toLowerCase() === lower);

    let matchedProject = null;

    if (matchedCustom && matchedCustom.projectId) {
      matchedProject = challenges.find(c => String(c.id).trim() === String(matchedCustom.projectId).trim());
    }

    // 2. Buscar en proyectos por id, pin, slug, code o título
    if (!matchedProject) {
      matchedProject = projectItems.find(c => {
        const cId = String(c.id || '').trim().toLowerCase();
        const cPin = String(c.pin || '').trim().toLowerCase();
        const cCode = String(c.code || '').trim().toLowerCase();
        const cSlug = String(c.slug || '').trim().toLowerCase();
        const cTitle = String(c.title || '').trim().toLowerCase();

        if (cId === lower || cPin === lower || cCode === lower || cSlug === lower) return true;
        if (cleanDigits && cPin && cPin.replace(/\D/g, '') === cleanDigits) return true;
        if (cTitle === lower) return true;
        return false;
      });
    }

    // 3. Si coincide con un código de maestro pero sin projectId explícito, abrir el proyecto asociado o destacado
    if (!matchedProject && matchedCustom) {
      matchedProject = projectItems.find(c => c.isGovDataProject || c.slug === 'innovatech-nexus') || projectItems[0];
    }

    // 4. Buscar en todos los retos
    if (!matchedProject) {
      matchedProject = challenges.find(c => {
        const cId = String(c.id || '').trim().toLowerCase();
        const cPin = String(c.pin || '').trim().toLowerCase();
        const cCode = String(c.code || '').trim().toLowerCase();
        const cSlug = String(c.slug || '').trim().toLowerCase();
        if (cId === lower || cPin === lower || cCode === lower || cSlug === lower) return true;
        if (cleanDigits && cPin && cPin.replace(/\D/g, '') === cleanDigits) return true;
        return false;
      });
    }

    // 5. Buscar en borradores del asistente de proyectos
    if (!matchedProject && window.ProjectWizard && window.ProjectWizard.getAllSavedDrafts) {
      const drafts = window.ProjectWizard.getAllSavedDrafts();
      const matchedDraft = drafts.find(d => {
        const dId = String(d.id || '').trim().toLowerCase();
        const dTitle = String(d.title || '').trim().toLowerCase();
        return dId === lower || (d.code && String(d.code).toLowerCase() === lower) || dTitle === lower;
      });
      if (matchedDraft) {
        if (window.soundEngine && window.soundEngine.playSuccess) window.soundEngine.playSuccess();
        this.closeJoinProjectModal();
        window.ProjectWizard.openWizard(matchedDraft.id, 1);
        return;
      }
    }

    if (matchedProject) {
      if (window.soundEngine && window.soundEngine.playSuccess) {
        window.soundEngine.playSuccess();
      } else if (window.soundEngine && window.soundEngine.playClick) {
        window.soundEngine.playClick();
      }
      this.closeJoinProjectModal();
      window.ProjectWizard.openWizard(matchedProject.id, 1);
      return;
    }

    // Si coincide con código personalizado creado por el profesor
    if (matchedCustom) {
      if (window.soundEngine && window.soundEngine.playSuccess) window.soundEngine.playSuccess();
      this.closeJoinProjectModal();
      window.ProjectWizard.openWizard(matchedCustom.projectId || null, 1);
      return;
    }

    // Código no encontrado: dar opción directa de crear proyecto con este código
    if (window.soundEngine && window.soundEngine.playError) {
      window.soundEngine.playError();
    }
    if (errEl) {
      errEl.innerHTML = `
        <div style="margin-bottom: 0.5rem;">❌ Código <strong>${this.escapeHtml(clean)}</strong> no encontrado.</div>
        <div style="font-weight: 500; font-size: 0.82rem; opacity: 0.9; margin-bottom: 0.65rem;">Puedes verificarlo con tu docente o iniciar un nuevo proyecto con este código:</div>
        <button type="button" onclick="window.ProjectsView.closeJoinProjectModal(); window.ProjectWizard.openWizard(null, 1);" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 0.45rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.35);">
          ✨ Crear Proyecto Ahora
        </button>
      `;
      errEl.style.display = 'block';
    } else {
      if (confirm(`El código "${clean}" no existe aún. ¿Deseas iniciar la creación de un nuevo proyecto?`)) {
        this.closeJoinProjectModal();
        window.ProjectWizard.openWizard(null, 1);
        return;
      }
    }
    if (input) input.select();
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

  // ==========================================
  // AGENTE INTELIGENTE DE PROYECTO (IA PERSISTENTE)
  // ==========================================
  getAgentSavedData(projId) {
    if (!projId) return [];
    try {
      const raw = localStorage.getItem('mentix_agent_memory_' + projId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  saveAgentDataItem(projId, text) {
    if (!projId || !text) return;
    const clean = String(text).trim();
    if (!clean) return;

    let items = this.getAgentSavedData(projId);
    items = items.filter(x => x.toLowerCase() !== clean.toLowerCase());
    items.unshift(clean);
    if (items.length > 25) items = items.slice(0, 25);

    try {
      localStorage.setItem('mentix_agent_memory_' + projId, JSON.stringify(items));
    } catch (e) {}

    this.renderAgentSavedDataBar(projId);
  },

  deleteAgentDataItem(projId, itemText) {
    if (!projId) return;
    let items = this.getAgentSavedData(projId);
    items = items.filter(x => x !== itemText);
    try {
      localStorage.setItem('mentix_agent_memory_' + projId, JSON.stringify(items));
    } catch (e) {}
    this.renderAgentSavedDataBar(projId);
  },

  clearAgentHistory(projId) {
    if (!confirm('¿Deseas reiniciar la memoria y el historial del Agente para este proyecto?')) return;
    try {
      localStorage.removeItem('mentix_agent_chat_' + projId);
      localStorage.removeItem('mentix_agent_memory_' + projId);
    } catch (e) {}
    const proj = (window.appState?.challenges || []).find(c => c.id === projId);
    this.showProjectAgent(proj);
  },

  getAgentChatHistory(projId) {
    if (!projId) return [];
    try {
      const raw = localStorage.getItem('mentix_agent_chat_' + projId);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  saveAgentChatMessage(projId, html, sender) {
    if (!projId) return;
    try {
      let list = this.getAgentChatHistory(projId);
      list.push({ html, sender, timestamp: Date.now() });
      if (list.length > 60) list = list.slice(list.length - 60);
      localStorage.setItem('mentix_agent_chat_' + projId, JSON.stringify(list));
    } catch (e) {}
  },

  applyAgentDataToProject(projId, field, value) {
    if (!value) return;
    const cleanVal = String(value).trim();
    if (!cleanVal) return;

    const challenges = window.appState?.challenges || [];
    let proj = challenges.find(c => c.id === projId);
    if (!proj && challenges.length > 0) proj = challenges[0];
    if (!proj) return;

    if (field === 'title') {
      proj.title = cleanVal;
      if (!proj.publication) proj.publication = {};
      proj.publication.publicName = cleanVal;
      proj.publication.landingTitle = cleanVal;

      const subtitleEl = document.getElementById('mentix-agent-project-subtitle');
      if (subtitleEl) {
        subtitleEl.textContent = `Copiloto Oficial • ${cleanVal}`;
      }
      const titleDisplay = document.getElementById('mentix-agent-title-display');
      if (titleDisplay) {
        titleDisplay.textContent = cleanVal;
      }
    } else if (field === 'objective') {
      proj.mainObjective = cleanVal;
      if (!proj.valueProposition) proj.valueProposition = {};
      proj.valueProposition.problemSolved = cleanVal;
    } else if (field === 'description') {
      proj.description = cleanVal;
      proj.shortDescription = cleanVal;
      proj.fullDescription = cleanVal;
      if (!proj.publication) proj.publication = {};
      proj.publication.publicDescription = cleanVal;
    }

    try {
      localStorage.setItem('mentix_challenges', JSON.stringify(challenges));
      localStorage.setItem('mentix_active_landing_project', JSON.stringify(proj));

      const rawDrafts = localStorage.getItem('mentix_govdata_wizard_drafts');
      if (rawDrafts) {
        const drafts = JSON.parse(rawDrafts);
        const match = drafts.find(d => d.id === proj.id);
        if (match) {
          if (field === 'title') match.title = cleanVal;
          if (field === 'objective') match.mainObjective = cleanVal;
          if (field === 'description') {
            match.shortDescription = cleanVal;
            match.fullDescription = cleanVal;
          }
          localStorage.setItem('mentix_govdata_wizard_drafts', JSON.stringify(drafts));
        }
      }
    } catch (e) {
      console.warn('Error saving updated project data:', e);
    }

    const fieldLabel = field === 'title' ? 'Título' : (field === 'objective' ? 'Objetivo principal' : 'Descripción');
    const msg = `✨ <strong>¡Dato aplicado al proyecto!</strong> El campo <strong>${fieldLabel}</strong> se ha actualizado a: <strong>«${this.escapeHtml(cleanVal)}»</strong>.`;
    this.appendAgentChatMessage(msg, 'agent', true);

    if (this.viewMode === 'landing') {
      const container = document.getElementById('app');
      if (container) this.renderLandingPageView(container, challenges);
    }
  },

  renderAgentSavedDataBar(projId) {
    const bar = document.getElementById('mentix-agent-saved-data-bar');
    if (!bar) return;

    const items = this.getAgentSavedData(projId);
    if (!items || items.length === 0) {
      bar.innerHTML = `
        <div style="font-size: 0.74rem; color: #64748b; font-style: italic; display: flex; align-items: center; gap: 0.35rem;">
          <span>💡</span> Los datos, notas o textos que escribas (como títulos o ideas) se guardarán automáticamente aquí.
        </div>
      `;
      return;
    }

    bar.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
        <span style="font-size: 0.72rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 0.3rem;">
          <span>💾</span> Datos guardados en memoria (${items.length}):
        </span>
        <button type="button" onclick="window.ProjectsView.clearAgentHistory('${projId}')" title="Limpiar historial y memoria" style="background: none; border: none; color: #94a3b8; font-size: 0.7rem; cursor: pointer; text-decoration: underline; padding: 0;">
          Limpiar
        </button>
      </div>
      <div style="display: flex; gap: 0.4rem; overflow-x: auto; padding-bottom: 0.25rem; scrollbar-width: thin;">
        ${items.map(it => {
          const esc = this.escapeHtml(it);
          const safeJs = esc.replace(/'/g, "\\'");
          return `
            <div style="display: inline-flex; align-items: center; gap: 0.35rem; background: rgba(0, 245, 212, 0.12); border: 1px solid rgba(0, 245, 212, 0.35); border-radius: 9999px; padding: 0.2rem 0.6rem; font-size: 0.76rem; color: #ffffff; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
              <span title="Dato guardado" style="font-weight: 700; max-width: 140px; overflow: hidden; text-overflow: ellipsis;">«${esc}»</span>
              <button type="button" onclick="window.ProjectsView.applyAgentDataToProject('${projId}', 'title', '${safeJs}')" title="Aplicar como Título" style="background: rgba(16, 185, 129, 0.3); border: none; color: #10b981; border-radius: 4px; padding: 0 0.25rem; font-size: 0.68rem; font-weight: 800; cursor: pointer;">
                🏷️ Título
              </button>
              <button type="button" onclick="window.ProjectsView.deleteAgentDataItem('${projId}', '${safeJs}')" title="Eliminar este dato" style="background: none; border: none; color: #ff4d6d; font-size: 0.75rem; cursor: pointer; padding: 0 0.15rem;">
                ✕
              </button>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  showProjectAgent(project = null) {
    const existing = document.getElementById('mentix-project-agent-modal');
    if (existing) existing.remove();

    const challenges = window.appState?.challenges || [];
    const proj = project || 
                 challenges.find(c => c.id === this.selectedProjectId) || 
                 (challenges.length > 0 ? challenges[0] : null) || 
                 {};
    const title = this.escapeHtml(proj.title || 'Proyecto Educativo');
    const desc = this.escapeHtml(proj.description || proj.shortDescription || 'Explora lecciones interactivas, recursos didácticos y actividades guiadas.');
    const obj = this.escapeHtml(proj.mainObjective || proj.valueProposition?.problemSolved || 'Impulsar el aprendizaje práctico y colaborativo.');
    const cat = this.escapeHtml(proj.categoryName || 'Ciencia y Tecnología');
    const projId = proj.id || this.selectedProjectId || 'default_proj';
    this.activeAgentProjectId = projId;

    const history = this.getAgentChatHistory(projId);

    const agentHtml = `
      <div id="mentix-project-agent-modal" style="position: fixed; inset: 0; z-index: 1000000; display: flex; align-items: flex-end; justify-content: flex-end; padding: 1.5rem; pointer-events: none; animation: fadeIn 0.25s ease-out;">
        <div class="glass-panel" style="pointer-events: auto; width: 100%; max-width: 490px; max-height: 88vh; display: flex; flex-direction: column; background: linear-gradient(150deg, rgba(10, 16, 32, 0.98), rgba(22, 12, 38, 0.98)); border: 2px solid #00f5d4; box-shadow: 0 20px 60px rgba(0, 245, 212, 0.3), 0 0 40px rgba(247, 37, 133, 0.25); border-radius: 24px; overflow: hidden; transform: translateY(0); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);">
          
          <!-- Encabezado del Agente -->
          <div style="padding: 1.15rem 1.4rem; background: linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(247, 37, 133, 0.15)); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <div style="position: relative; width: 44px; height: 44px; border-radius: 14px; background: linear-gradient(135deg, #00f5d4, #7209b7); display: flex; align-items: center; justify-content: center; font-size: 1.4rem; box-shadow: 0 0 20px rgba(0,245,212,0.4);">
                🤖
                <span style="position: absolute; bottom: -2px; right: -2px; width: 12px; height: 12px; border-radius: 50%; background: #10b981; border: 2px solid #0a1020; box-shadow: 0 0 8px #10b981;"></span>
              </div>
              <div>
                <h3 style="margin: 0; font-size: 1.05rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; gap: 0.4rem;">
                  <span>Agente Inteligente</span>
                  <span style="font-size: 0.7rem; background: rgba(0,245,212,0.2); color: #00f5d4; border: 1px solid rgba(0,245,212,0.4); padding: 0.15rem 0.5rem; border-radius: 9999px; font-weight: 800; text-transform: uppercase;">En línea</span>
                </h3>
                <span id="mentix-agent-project-subtitle" style="font-size: 0.78rem; color: #94a3b8; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 270px;">
                  Copiloto Oficial • ${title}
                </span>
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.4rem;">
              <button type="button" onclick="window.ProjectsView.closeProjectAgent()" title="Cerrar agente" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #fff; width: 32px; height: 32px; border-radius: 50%; font-size: 1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;" onmouseenter="this.style.background='rgba(255, 77, 109, 0.4)'; this.style.borderColor='#ff4d6d';" onmouseleave="this.style.background='rgba(255,255,255,0.08)'; this.style.borderColor='rgba(255,255,255,0.15)';">
                ✕
              </button>
            </div>
          </div>

          <!-- Barra de Datos Guardados en Memoria por el Agente -->
          <div id="mentix-agent-saved-data-bar" style="padding: 0.65rem 1.25rem; background: rgba(15, 23, 42, 0.75); border-bottom: 1px solid rgba(255,255,255,0.06);">
          </div>

          <!-- Historial de Conversación / Mensajes -->
          <div id="mentix-agent-chat-stream" style="flex: 1; padding: 1.15rem 1.25rem; overflow-y: auto; max-height: 380px; display: flex; flex-direction: column; gap: 0.85rem;">
            
            <!-- Mensaje Inicial del Agente -->
            <div style="display: flex; gap: 0.65rem; align-items: flex-start;">
              <div style="width: 30px; height: 30px; border-radius: 10px; background: rgba(0, 245, 212, 0.2); color: #00f5d4; display: flex; align-items: center; justify-content: center; font-size: 1rem; flex-shrink: 0; border: 1px solid rgba(0,245,212,0.4);">
                🤖
              </div>
              <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(0, 245, 212, 0.3); border-radius: 16px; border-top-left-radius: 4px; padding: 0.95rem 1.15rem; color: #e2e8f0; font-size: 0.9rem; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
                ¡Hola! 🎉 Estás trabajando en el proyecto <strong id="mentix-agent-title-display">${title}</strong>.<br><br>
                Soy tu <strong>Agente Inteligente</strong>. Todo dato, nota o texto que escribas (como títulos, objetivos o ideas) se guardará automáticamente en la memoria del proyecto.
              </div>
            </div>

            <!-- Accesos Rápidos del Agente -->
            <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.25rem;">
              <button type="button" onclick="window.ProjectWizard.openWizard('${projId}'); window.ProjectsView.closeProjectAgent();" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.35)); border: 1.5px solid #10b981; color: #ffffff; padding: 0.75rem 1rem; border-radius: 14px; font-weight: 800; font-size: 0.88rem; cursor: pointer; text-align: left; transition: all 0.2s;" onmouseenter="this.style.background='linear-gradient(135deg, #10b981, #059669)'; this.style.boxShadow='0 0 20px rgba(16,185,129,0.5)';" onmouseleave="this.style.background='linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 78, 59, 0.35))'; this.style.boxShadow='none';">
                <span>✨ Abrir en el Asistente por Pasos</span>
                <span>→</span>
              </button>

              <button type="button" onclick="window.ProjectsView.openProjectLanding('${projId}'); window.ProjectsView.closeProjectAgent();" style="display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; background: rgba(0, 245, 212, 0.12); border: 1.5px solid rgba(0, 245, 212, 0.45); color: #ffffff; padding: 0.75rem 1rem; border-radius: 14px; font-weight: 800; font-size: 0.88rem; cursor: pointer; text-align: left; transition: all 0.2s;" onmouseenter="this.style.background='rgba(0, 245, 212, 0.25)'; this.style.borderColor='#00f5d4';" onmouseleave="this.style.background='rgba(0, 245, 212, 0.12)'; this.style.borderColor='rgba(0, 245, 212, 0.45)';">
                <span>📑 Explorar la Landing Page del Proyecto</span>
                <span>→</span>
              </button>

              <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; margin-top: 0.25rem;">
                <button type="button" onclick="window.ProjectsView.askAgentPredefined('objetivo')" style="background: rgba(247, 37, 133, 0.12); border: 1px solid rgba(247, 37, 133, 0.4); color: #f72585; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; cursor: pointer;">
                  🎯 ¿Cuál es el objetivo?
                </button>
                <button type="button" onclick="window.ProjectsView.askAgentPredefined('resumen')" style="background: rgba(0, 245, 212, 0.12); border: 1px solid rgba(0, 245, 212, 0.4); color: #00f5d4; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; cursor: pointer;">
                  💡 ¿De qué trata?
                </button>
                <button type="button" onclick="window.ProjectsView.askAgentPredefined('recursos')" style="background: rgba(168, 85, 247, 0.12); border: 1px solid rgba(168, 85, 247, 0.4); color: #c084fc; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; cursor: pointer;">
                  📚 ¿Qué recursos tiene?
                </button>
              </div>
            </div>

          </div>

          <!-- Barra de Entrada de Chat con el Agente -->
          <form onsubmit="event.preventDefault(); window.ProjectsView.sendAgentUserMessage();" style="padding: 0.85rem 1rem; background: rgba(5, 10, 22, 0.95); border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 0.5rem; align-items: center;">
            <input
              type="text"
              id="mentix-agent-user-input"
              placeholder="Escribe datos, título, notas o preguntas..."
              autocomplete="off"
              style="flex: 1; padding: 0.75rem 1rem; border-radius: 12px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #ffffff; font-size: 0.88rem; outline: none;"
              onfocus="this.style.borderColor='#00f5d4';"
              onblur="this.style.borderColor='rgba(255,255,255,0.15)';"
            />
            <button type="submit" title="Enviar al Agente" style="background: linear-gradient(135deg, #00f5d4, #059669); color: #050510; border: none; font-weight: 900; width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: transform 0.15s;" onmouseenter="this.style.transform='scale(1.08)'" onmouseleave="this.style.transform='scale(1)'">
              ➤
            </button>
          </form>

        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', agentHtml);
    this.renderAgentSavedDataBar(projId);

    // Cargar historial previo de mensajes persistente
    if (history && history.length > 0) {
      history.forEach(item => {
        this.appendAgentChatMessage(item.html, item.sender, false);
      });
    }

    if (window.soundEngine && window.soundEngine.playSuccess) window.soundEngine.playSuccess();
  },

  closeProjectAgent() {
    const el = document.getElementById('mentix-project-agent-modal');
    if (el) el.remove();
  },

  askAgentPredefined(type) {
    const projId = this.activeAgentProjectId || this.selectedProjectId || (window.appState?.challenges?.[0]?.id) || 'default_proj';
    const proj = (window.appState?.challenges || []).find(c => c.id === projId) || {};
    let q = '';
    let a = '';

    if (type === 'objetivo') {
      q = '🎯 ¿Cuál es el objetivo principal de este proyecto?';
      a = `El objetivo principal de <strong>${this.escapeHtml(proj.title || 'este proyecto')}</strong> es: <br><br><em>«${this.escapeHtml(proj.mainObjective || proj.valueProposition?.problemSolved || 'Impulsar el aprendizaje guiado y práctico')}»</em>.`;
    } else if (type === 'resumen') {
      q = '💡 ¿De qué trata este proyecto?';
      a = `Este proyecto corresponde a la categoría <strong>${this.escapeHtml(proj.categoryName || 'General')}</strong>.<br><br>${this.escapeHtml(proj.description || proj.shortDescription || 'Diseñado para impulsar habilidades mediante recursos interactivos, presentaciones y guías prácticas.')}`;
    } else if (type === 'recursos') {
      q = '📚 ¿Qué recursos didácticos incluye?';
      const slides = proj.slides ? proj.slides.length : 0;
      const vid = proj.video?.url || proj.videoUrl ? '1 Video Clase' : 'Video explicativo';
      a = `Este proyecto didáctico cuenta con:<br>• <strong>${slides > 0 ? slides + ' Diapositivas interactivas' : 'Presentación didáctica'}</strong>.<br>• <strong>${vid}</strong>.<br>• <strong>Documentos didácticos descargables</strong> y fichas de trabajo oficiales.<br><br>Puedes explorarlos en la Landing Page o paso a paso con el Asistente.`;
    }

    this.appendAgentChatMessage(q, 'user', true);
    setTimeout(() => {
      this.appendAgentChatMessage(a, 'agent', true);
    }, 300);
  },

  sendAgentUserMessage() {
    const input = document.getElementById('mentix-agent-user-input');
    const text = input ? input.value.trim() : '';
    if (!text) return;
    input.value = '';

    const projId = this.activeAgentProjectId || this.selectedProjectId || (window.appState?.challenges?.[0]?.id) || 'default_proj';
    const proj = (window.appState?.challenges || []).find(c => c.id === projId) || {};

    const escText = this.escapeHtml(text);
    this.appendAgentChatMessage(escText, 'user', true);

    // Guardar inmediatamente en la memoria persistente del agente
    this.saveAgentDataItem(projId, text);

    const t = text.toLowerCase();
    const safeJs = escText.replace(/'/g, "\\'");
    let reply = '';

    // Detección de comandos directos para título / objetivo / descripción
    if (t.startsWith('titulo ') || t.startsWith('nombre ') || t.includes('cambiar titulo a ') || t.includes('cambiar nombre a ') || t.includes('ponle de titulo ') || t.includes('ponle como titulo ')) {
      let val = text.replace(/^(titulo\s*[:=]?|nombre\s*[:=]?|cambiar\s+titulo\s+a\s*[:=]?|cambiar\s+nombre\s+a\s*[:=]?|ponle\s+de\s+titulo\s*[:=]?|ponle\s+como\s+titulo\s*[:=]?)/i, '').trim();
      if (!val) val = text;
      this.applyAgentDataToProject(projId, 'title', val);
      return;
    }

    if (t.startsWith('objetivo ') || t.includes('cambiar objetivo a ') || t.includes('pon de objetivo ')) {
      let val = text.replace(/^(objetivo\s*[:=]?|cambiar\s+objetivo\s+a\s*[:=]?|pon\s+de\s+objetivo\s*[:=]?)/i, '').trim();
      if (!val) val = text;
      this.applyAgentDataToProject(projId, 'objective', val);
      return;
    }

    if (t.includes('objetivo') || t.includes('meta') || t.includes('proposito')) {
      reply = `El objetivo de <strong>${this.escapeHtml(proj.title || 'este proyecto')}</strong> es: <br><br><em>«${this.escapeHtml(proj.mainObjective || proj.valueProposition?.problemSolved || 'Impulsar el aprendizaje guiado y colaborativo')}»</em>.`;
    } else if (t.includes('como empiezo') || t.includes('inicio') || t.includes('pasos') || t.includes('asistente') || t.includes('que hago')) {
      reply = `¡Es muy fácil! Puedes hacer clic en el botón verde <strong>«Abrir en el Asistente por Pasos»</strong> para completar la lección etapa por etapa, o explorar la <strong>Landing Page</strong> para ver los documentos y videos.`;
    } else if (t.includes('recurso') || t.includes('video') || t.includes('presentacion') || t.includes('doc') || t.includes('ficha')) {
      reply = `El proyecto tiene recursos interactivos cargados (presentaciones, video clases y material de lectura). Puedes acceder a ellos desde la sección de recursos de la portada.`;
    } else {
      // Reconocimiento fiel de lo escrito por el usuario (ej: "nhh")
      reply = `
        <div>
          ✅ <strong>Dato registrado:</strong> He guardado <strong>«${escText}»</strong> en la memoria del proyecto.<br><br>
          Se mantendrá guardado permanentemente para este proyecto. ¿Deseas aplicarlo directamente como configuración?
          <div style="display: flex; gap: 0.45rem; flex-wrap: wrap; margin-top: 0.75rem;">
            <button type="button" onclick="window.ProjectsView.applyAgentDataToProject('${projId}', 'title', '${safeJs}')" style="background: linear-gradient(135deg, #00f5d4, #059669); color: #022; border: none; border-radius: 8px; padding: 0.35rem 0.7rem; font-size: 0.78rem; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(0,245,212,0.3);">
              🏷️ Usar como Título
            </button>
            <button type="button" onclick="window.ProjectsView.applyAgentDataToProject('${projId}', 'objective', '${safeJs}')" style="background: rgba(247, 37, 133, 0.2); border: 1px solid #f72585; color: #ffffff; border-radius: 8px; padding: 0.35rem 0.7rem; font-size: 0.78rem; font-weight: 800; cursor: pointer;">
              🎯 Usar como Objetivo
            </button>
            <button type="button" onclick="window.ProjectsView.applyAgentDataToProject('${projId}', 'description', '${safeJs}')" style="background: rgba(168, 85, 247, 0.2); border: 1px solid #a855f7; color: #ffffff; border-radius: 8px; padding: 0.35rem 0.7rem; font-size: 0.78rem; font-weight: 800; cursor: pointer;">
              📝 Usar como Descripción
            </button>
          </div>
        </div>
      `;
    }

    setTimeout(() => {
      this.appendAgentChatMessage(reply, 'agent', true);
    }, 350);
  },

  appendAgentChatMessage(html, sender, saveToStorage = true) {
    const stream = document.getElementById('mentix-agent-chat-stream');
    if (stream) {
      const isUser = sender === 'user';
      const msg = document.createElement('div');
      msg.style.display = 'flex';
      msg.style.gap = '0.65rem';
      msg.style.alignItems = 'flex-start';
      if (isUser) msg.style.justifyContent = 'flex-end';

      msg.innerHTML = isUser ? `
        <div style="background: linear-gradient(135deg, #7209b7, #f72585); color: #ffffff; border-radius: 16px; border-top-right-radius: 4px; padding: 0.8rem 1.1rem; font-size: 0.88rem; max-width: 80%; line-height: 1.45; box-shadow: 0 4px 15px rgba(247,37,133,0.3); word-break: break-word;">
          ${html}
        </div>
        <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(247, 37, 133, 0.25); color: #f72585; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; flex-shrink: 0; font-weight: 800;">
          👤
        </div>
      ` : `
        <div style="width: 28px; height: 28px; border-radius: 8px; background: rgba(0, 245, 212, 0.2); color: #00f5d4; display: flex; align-items: center; justify-content: center; font-size: 0.95rem; flex-shrink: 0; border: 1px solid rgba(0,245,212,0.4);">
          🤖
        </div>
        <div style="background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(0, 245, 212, 0.3); border-radius: 16px; border-top-left-radius: 4px; padding: 0.85rem 1.1rem; color: #e2e8f0; font-size: 0.88rem; max-width: 82%; line-height: 1.5; box-shadow: 0 4px 15px rgba(0,0,0,0.3); word-break: break-word;">
          ${html}
        </div>
      `;

      stream.appendChild(msg);
      stream.scrollTop = stream.scrollHeight;
    }

    if (saveToStorage) {
      const projId = this.activeAgentProjectId || this.selectedProjectId || (window.appState?.challenges?.[0]?.id) || 'default_proj';
      this.saveAgentChatMessage(projId, html, sender);
    }
  },


  setLandingTheme(theme) {
    const validTheme = theme === 'dark' ? 'dark' : 'light';
    localStorage.setItem('mentix_landing_theme', validTheme);
    localStorage.setItem('te_reto_theme', validTheme);
    if (validTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    document.body.setAttribute('data-theme', validTheme);
    document.querySelectorAll('.plp-wrapper').forEach(w => {
      w.setAttribute('data-theme', validTheme);
    });
    const pvc = document.getElementById('projects-view-container');
    if (pvc) {
      pvc.setAttribute('data-theme', validTheme);
    }
    document.querySelectorAll('.inno-theme-btn').forEach(btn => {
      if (btn.classList.contains(validTheme)) btn.classList.add('active');
      else btn.classList.remove('active');
    });
  },

  getLandingTheme() {
    if (document.body.classList.contains('light-theme')) return 'light';
    return localStorage.getItem('mentix_landing_theme') || localStorage.getItem('te_reto_theme') || 'dark';
  },

  toggleTheme() {
    const current = this.getLandingTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setLandingTheme(next);
    const container = document.getElementById('projects-view-container') || document.getElementById('view-container');
    if (container) {
      if (this.currentViewMode === 'landing') {
        this.renderLandingPageView(container, window.appState?.challenges || []);
      } else {
        this.renderProjects(container);
      }
    }
  },

  getHexLuminance(hex) {
    if (!hex || typeof hex !== 'string') return 0;
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) {
      clean = clean.split('').map(c => c + c).join('');
    }
    if (clean.length !== 6) return 0.5;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    const toLinear = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  },

  getColorLuminance(colorStr) {
    if (!colorStr || typeof colorStr !== 'string') return 0.2;
    const str = colorStr.trim().toLowerCase();
    if (str.startsWith('#')) return this.getHexLuminance(str);
    const rgbMatch = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1], 10) / 255;
      const g = parseInt(rgbMatch[2], 10) / 255;
      const b = parseInt(rgbMatch[3], 10) / 255;
      const toLinear = c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
      return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    }
    const hexes = str.match(/#[0-9a-f]{3,6}/gi);
    if (hexes && hexes.length > 0) {
      const sum = hexes.reduce((acc, h) => acc + this.getHexLuminance(h), 0);
      return sum / hexes.length;
    }
    if (str.includes('white') || str.includes('light') || str.includes('fff') || str.includes('f8fafc') || str.includes('f1f5f9')) return 0.95;
    if (str.includes('black') || str.includes('dark') || str.includes('000') || str.includes('091e2d') || str.includes('050510')) return 0.05;
    return 0.2;
  },

  getBannerStyleCss(styleId) {
    switch (styleId) {
      case 'gradient-cosmos':
      case 'cosmos':
        return 'linear-gradient(135deg, #0b091a 0%, #171033 50%, #200f40 100%)';
      case 'cyberpunk-magenta':
      case 'cyberpunk':
        return 'linear-gradient(135deg, #0f051d 0%, #290833 50%, #15002b 100%)';
      case 'esmeralda-deep':
      case 'esmeralda':
        return 'linear-gradient(135deg, #041f17 0%, #06382b 50%, #021a13 100%)';
      case 'ocean-abyssal':
      case 'oceano':
        return 'linear-gradient(135deg, #05162a 0%, #08294d 50%, #041224 100%)';
      case 'obsidian-clean':
      case 'obsidiana':
        return 'linear-gradient(135deg, #0a0a0c 0%, #141418 50%, #070709 100%)';
      case 'marfil-light':
      case 'marfil':
        return 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)';
      case 'aurora-clean':
      case 'aurora-clara':
        return 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #e0f2fe 100%)';
      case 'coral-suave':
        return 'linear-gradient(135deg, #fff7ed 0%, #fed7aa 50%, #fef3c7 100%)';
      default:
        return 'linear-gradient(135deg, #091e2d 0%, #06131f 65%, #051d28 100%)';
    }
  },

  getBannerAutoContrast(bgValue, titleColor, textColor, accentColor, bannerUrl = '', currentTheme = 'dark') {
    let isDarkBg = true;
    if (bannerUrl) {
      isDarkBg = currentTheme !== 'light';
    } else if (bgValue) {
      const lum = this.getColorLuminance(bgValue);
      isDarkBg = lum < 0.48;
    } else {
      isDarkBg = currentTheme === 'dark';
    }

    let finalTitle = titleColor;
    let finalText = textColor;
    let finalAccent = accentColor || (isDarkBg ? '#00f5d4' : '#0284c7');

    const titleLum = finalTitle ? this.getColorLuminance(finalTitle) : (isDarkBg ? 1 : 0);
    const textLum = finalText ? this.getColorLuminance(finalText) : (isDarkBg ? 0.8 : 0.2);

    if (isDarkBg) {
      // Fondo oscuro: el texto DEBE ser claro
      if (!finalTitle || titleLum < 0.45) {
        finalTitle = '#ffffff';
      }
      if (!finalText || textLum < 0.38) {
        finalText = '#cbd5e1';
      }
    } else {
      // Fondo claro: el texto DEBE ser oscuro
      if (!finalTitle || titleLum >= 0.45) {
        finalTitle = '#091e2d';
      }
      if (!finalText || textLum >= 0.45) {
        finalText = '#334155';
      }
    }

    return {
      isDarkBg,
      titleColor: finalTitle,
      textColor: finalText,
      accentColor: finalAccent,
      bannerUrlGradient: isDarkBg
        ? 'linear-gradient(rgba(5, 10, 24, 0.82), rgba(8, 14, 30, 0.92))'
        : 'linear-gradient(rgba(255, 255, 255, 0.86), rgba(241, 245, 249, 0.94))',
      titleShadow: isDarkBg
        ? 'text-shadow: 0 2px 14px rgba(0,0,0,0.85), 0 0 4px rgba(0,0,0,0.9);'
        : 'text-shadow: 0 1px 3px rgba(255,255,255,0.8);',
      descShadow: isDarkBg
        ? 'text-shadow: 0 1px 8px rgba(0,0,0,0.75);'
        : '',
      gradientSpanStyle: isDarkBg
        ? 'background: linear-gradient(135deg, #00f5d4 0%, #00e5be 60%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;'
        : 'background: linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #4338ca 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;',
      eyebrowStyle: isDarkBg
        ? 'background: rgba(0, 245, 212, 0.15); border: 1px solid rgba(0, 245, 212, 0.45); color: #00f5d4;'
        : 'background: rgba(2, 132, 199, 0.12); border: 1px solid rgba(2, 132, 199, 0.35); color: #0369a1;'
    };
  },

  calculateProjectProgress(p) {
    if (!p) return 0;
    let score = 0;

    // 1. Nombre / Título del proyecto (base 5% si solo puso el nombre)
    const title = (p.title || '').trim();
    if (title.length >= 3) {
      score += 5;
    }

    // 2. Subtítulo o lema descriptivo
    const subtitle = (p.subtitle || '').trim();
    if (subtitle.length >= 3) {
      score += 5;
    }

    // 3. Descripción (corta o general)
    const desc = (p.description || p.shortDescription || '').trim();
    if (desc.length >= 15) {
      score += 10;
    } else if (desc.length > 0) {
      score += 5;
    }

    // 4. Categoría y clasificación
    if (p.category || p.categoryName || p.categoryId) {
      score += 5;
    }

    // 5. Configuración de diseño y banner (Paso 4)
    const des = p.designConfig || p.govdata?.designConfig;
    if (des && (des.themeId || des.bannerUrl || des.bannerStyle)) {
      score += 10;
    }

    // 6. Autores y correos de contacto (Paso 5)
    const aut = p.authorsConfig || p.govdata?.authorsConfig;
    if (aut && (aut.authorsList || aut.authorsEmails || p.authorEmail)) {
      score += 10;
    } else if (p.author && p.author !== 'Docente' && p.author !== 'Estudiante') {
      score += 5;
    }

    // 7. Problema y objetivo principal (Paso 6)
    const obj = (p.mainObjective || p.govdata?.problemSolved || p.valueProposition?.problemSolved || '').trim();
    if (obj.length >= 10) {
      score += 10;
    } else if (obj.length > 0) {
      score += 5;
    }

    // 8. Público objetivo y propuesta de valor (Paso 7)
    const aud = (p.targetAudience || p.valueProposition?.targetAudience || '').trim();
    if (aud.length >= 5) {
      score += 5;
    }

    // 9. Cronograma / fechas clave (Paso 8)
    const timeline = p.timeline || p.govdata?.timeline || [];
    if ((Array.isArray(timeline) && timeline.length > 0) || p.startDate || p.endDate) {
      score += 5;
    }

    // 10. Recursos y documentos adjuntos (Paso 11) - hasta 15%
    const resources = p.resources || p.govdata?.resources || p.documents || [];
    const resCount = Array.isArray(resources) ? resources.length : 0;
    if (resCount >= 3) {
      score += 15;
    } else if (resCount >= 2) {
      score += 12;
    } else if (resCount === 1) {
      score += 8;
    }

    // 11. Video explicativo o demostrativo (Paso 10)
    const vid = p.video || p.govdata?.video;
    const vidUrl = (typeof vid === 'string' ? vid : (vid?.youtubeUrl || vid?.url || p.videoUrl || '')).trim();
    if (vidUrl.length >= 8) {
      score += 5;
    }

    // 12. Activos visuales o diapositivas (Paso 12)
    const slides = p.slides || [];
    const visuals = p.visualAssets || p.govdata?.visualAssets || [];
    if (slides.length >= 2 || visuals.length >= 1) {
      score += 5;
    }

    // 13. Publicación oficial (Paso 14-15) - 10%
    const isPublished = p.publicationStatus === 'published' || p.isPublished === true || p.projectState === 'publicado' || p.projectState === 'en_ejecucion';
    if (isPublished) {
      score += 10;
    }

    // Borradores no alcanzan el 100% hasta ser publicados oficialmente
    if (!isPublished && score >= 95) {
      score = 90;
    }

    return Math.min(100, Math.max(score, (title.length >= 3 ? 5 : 0)));
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

    const brandTitle = this.escapeHtml((selected && (selected.categoryName || pub.visibleCategory)) || 'Proyecto');
    const brandSubtitle = this.escapeHtml((selected && (pub.publicName || selected.title)) || '');
    const selectedTitle = selected ? this.escapeHtml(pub.publicName || selected.title || 'Proyecto') : 'Proyecto';
    const heroEyebrow = this.escapeHtml((selected && (selected.subtitle || selected.categoryName)) || '🚀 Proyecto Educativo & Didáctico');
    const heroMainTitle1 = selected ? this.escapeHtml(pub.landingTitle || selected.title || 'Proyecto') : 'Proyecto';
    const heroMainTitle2 = (selected && selected.subtitle) ? this.escapeHtml(selected.subtitle) : '';
    const heroSubtitle = this.escapeHtml(
      (selected && (pub.publicDescription || selected.shortDescription || selected.description)) ||
      'Explora los objetivos, recursos y detalles de este proyecto educativo.'
    );

    const ctaText = this.escapeHtml((selected && (pub.ctaText || selected.ctaText || vp.visitorAction)) || 'Unirse / Colaborar');
    const ctaUrl = (selected && (pub.ctaUrl || selected.ctaUrl)) || '';
    const mainObjective = this.escapeHtml((selected && (selected.mainObjective || vp.problemSolved)) || 'Objetivo en desarrollo');
    const targetAudience = this.escapeHtml((selected && (selected.targetAudience || vp.targetAudience)) || 'Comunidad educativa y participantes');
    const visibleCategory = this.escapeHtml((selected && (selected.categoryName || pub.visibleCategory)) || 'General');
    const projectState = this.escapeHtml((selected && (selected.projectState || 'En ejecución')).toString().replace('_', ' '));

    const des = (selected && (selected.designConfig || selected.govdata?.designConfig)) || {};
    const aut = (selected && (selected.authorsConfig || selected.govdata?.authorsConfig)) || {};
    const customFont = des.fontFamily || 'Montserrat';
    const customTheme = (window.ProjectWizard?.SLIDE_THEMES || []).find(t => t.id === des.themeId);

    const progressPercent = this.calculateProjectProgress(selected);
    const contrast = this.getBannerAutoContrast(
      customTheme ? customTheme.bg : des.bannerStyle,
      des.titleColor,
      des.textColor,
      des.accentColor,
      des.bannerUrl,
      currentTheme
    );

    const heroBgStyle = des.bannerUrl
      ? `background-image: ${contrast.bannerUrlGradient}, url('${this.escapeHtml(des.bannerUrl)}'); background-size: cover; background-position: center;`
      : (customTheme ? `background: ${customTheme.bg};` : (des.bannerStyle ? `background: ${this.getBannerStyleCss(des.bannerStyle)};` : ''));
    const authorDisplayName = this.escapeHtml(aut.authorsList || selected?.author || 'Equipo del Proyecto');
    const authorDisplayEmail = this.escapeHtml(aut.authorsEmails || selected?.authorEmail || '');

    const fullScreenHref = selected
      ? `proyecto-landing.html?id=${encodeURIComponent(selected.id)}${selected.slug ? '&slug=' + encodeURIComponent(selected.slug) : ''}`
      : 'proyecto-landing.html';

    container.innerHTML = `
      <div style="max-width: 1400px; margin: 0 auto; padding: 0.25rem 0.5rem 3rem;">
        <div class="plp-wrapper animate-fade-in" data-theme="${currentTheme}" style="font-family: '${customFont}', sans-serif;">

          <!-- Barra de Control Mentix -->
          <div class="plp-mentix-bar">
            <div class="plp-mentix-bar-left">
              <span class="plp-mentix-badge">${this.isWizardPreview ? '👁️ Vista Previa del Asistente' : '✨ Landing Page Oficial'}</span>
              <span style="font-weight: 700; color: #ffffff;">${selectedTitle}</span>
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
               1. HEADER / NAVEGACIÓN
               ================================================================ -->
          <header class="inno-header" role="banner">
            <div class="inno-brand" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-hero')">
              <div class="inno-logo-icon">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div>
                <div class="inno-brand-title">${brandTitle}</div>
                <div class="inno-brand-subtitle">${brandSubtitle}</div>
              </div>
            </div>

            <nav class="inno-nav-links">
              <button type="button" class="inno-nav-item active" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-hero')">Inicio</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-why')">Sobre el Proyecto</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">Recursos</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">Presentaciones</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">Galería</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-timeline')">Contacto</button>
            </nav>

            <div class="inno-header-right">
              <div class="inno-theme-toggle" role="group" aria-label="Cambiar tema">
                <button type="button" class="inno-theme-btn light ${currentTheme === 'light' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('light')" title="Modo Claro">☀️</button>
                <button type="button" class="inno-theme-btn dark ${currentTheme === 'dark' ? 'active' : ''}" onclick="window.ProjectsView.setLandingTheme('dark')" title="Modo Oscuro">🌙</button>
              </div>

              <div class="inno-search-box">
                <span style="position:absolute; left:0.75rem; color:#94a3b8; font-size:0.85rem;">🔍</span>
                <input type="search" class="inno-search-input" placeholder="Buscar en el proyecto..." oninput="window.ProjectsView.filterLandingSearch(this.value)" />
              </div>

              ${ctaUrl ? `
                <a href="${this.escapeHtml(ctaUrl)}" target="_blank" rel="noopener noreferrer" class="inno-cta-pill" style="text-decoration:none;">
                  ${ctaText}
                </a>
              ` : `
                <button type="button" class="inno-cta-pill" onclick="window.ProjectsView.previewLandingDoc('${ctaText} — ${selectedTitle}')">
                  ${ctaText}
                </button>
              `}
            </div>
          </header>

          <!-- ================================================================
               2. HERO SECTION
               ================================================================ -->
          <section class="inno-hero" id="inno-sec-hero" style="${heroBgStyle}">
            <div class="inno-hero-bg-overlay"></div>
            <div class="inno-hero-bg-glow"></div>

            <div class="inno-hero-grid">
              <!-- Columna Izquierda: Información Principal -->
              <div>
                <div class="inno-eyebrow" style="${contrast.eyebrowStyle}">
                  <span>🚀</span> ${heroEyebrow}
                </div>

                <h1 class="inno-hero-title" style="color: ${contrast.titleColor}; ${contrast.titleShadow}">
                  ${heroMainTitle1}
                  ${heroMainTitle2 ? `<span class="inno-hero-title-gradient" style="${contrast.gradientSpanStyle}">${heroMainTitle2}</span>` : ''}
                </h1>

                <p class="inno-hero-desc" style="color: ${contrast.textColor}; ${contrast.descShadow}">
                  ${heroSubtitle}
                </p>

                <div class="inno-hero-actions">
                  <button type="button" class="inno-btn-cyan" onclick="window.ProjectsView.playLandingVideo()">
                    <span>▶</span> Ver video del proyecto
                  </button>
                  <button type="button" class="inno-btn-ghost" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">
                    <span>📄</span> Explorar recursos
                  </button>
                </div>

                <div class="inno-feature-pills">
                  <div class="inno-feature-pill"><span>🏛️</span> ${visibleCategory}</div>
                  <div class="inno-feature-pill"><span>🧠</span> ${(selected && selected.projectSubtype) ? this.escapeHtml(selected.projectSubtype) : 'Innovación'}</div>
                  <div class="inno-feature-pill"><span>📊</span> ${(selected && selected.difficulty) ? this.escapeHtml(selected.difficulty) : 'Didáctico'}</div>
                  <div class="inno-feature-pill"><span>⚙️</span> ${(selected && selected.projectType) ? this.escapeHtml(selected.projectType).toUpperCase() : 'PROYECTO'}</div>
                </div>
              </div>

              <!-- Columna Derecha: Tarjeta Estado del Proyecto -->
              <div>
                <article class="inno-status-card">
                  <div class="inno-status-header">
                    <h3 class="inno-status-title">Estado del proyecto</h3>
                    <span class="inno-status-badge">● ${projectState}</span>
                  </div>

                  <p class="inno-status-desc">
                    ${this.escapeHtml(selected?.description || selected?.shortDescription || vp?.problemSolved || 'El proyecto avanza en su desarrollo e implementación para generar valor, aprendizaje e impacto.')}
                  </p>

                  <div class="inno-progress-wrap">
                    <div class="inno-progress-labels">
                      <span>Avance general</span>
                      <strong style="color:var(--inno-cyan-600);">${progressPercent}%</strong>
                    </div>
                    <div class="inno-progress-bar">
                      <div class="inno-progress-fill" style="width: ${progressPercent}%;"></div>
                    </div>
                  </div>

                  <div class="inno-meta-rows">
                    <div class="inno-meta-row">
                      <div class="inno-meta-icon green">🎯</div>
                      <div class="inno-meta-content">
                        <strong>Objetivo principal</strong>
                        <span>${mainObjective}</span>
                      </div>
                    </div>
                    <div class="inno-meta-row">
                      <div class="inno-meta-icon blue">👥</div>
                      <div class="inno-meta-content">
                        <strong>Público objetivo</strong>
                        <span>${targetAudience}</span>
                      </div>
                    </div>
                    <div class="inno-meta-row">
                      <div class="inno-meta-icon purple">🏷️</div>
                      <div class="inno-meta-content">
                        <strong>Categoría</strong>
                        <span>${visibleCategory}</span>
                      </div>
                    </div>
                  </div>

                  <div class="inno-status-footer">
                    <button type="button" class="inno-status-link" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-why')" style="background:none; border:none; padding:0;">
                      <span>Ver más detalles</span> <span>→</span>
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <!-- ================================================================
               3. SECCIÓN ¿POR QUÉ ES IMPORTANTE?
               ================================================================ -->
          <section class="inno-why-section" id="inno-sec-why">
            <div class="inno-why-grid">
              <div class="inno-why-lead">
                <div>
                  <h2 class="inno-why-lead-title">¿Por qué es importante?</h2>
                  <p class="inno-why-lead-text">
                    El acceso, la calidad y el uso responsable de los datos, junto con la inteligencia artificial, permiten a las organizaciones tomar decisiones más informadas, mejorar la eficiencia y generar un mayor impacto social.
                  </p>
                </div>
                <button type="button" class="inno-why-lead-btn" onclick="window.ProjectsView.previewLandingDoc('Sobre el Proyecto — ${selectedTitle}')">
                  Conocer más sobre el proyecto →
                </button>
              </div>

              <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Problema / Oportunidad — ${selectedTitle}')" role="button" tabindex="0">
                <div>
                  <div class="inno-why-icon-circle" style="background:#e0f2fe; color:#0284c7;">📊</div>
                  <h4>Problema / Oportunidad</h4>
                  <p>La falta de datos confiables y la limitada analítica impiden una gestión pública más efectiva.</p>
                </div>
                <span class="inno-why-arrow">→</span>
              </article>

              <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Propuesta de Valor — ${selectedTitle}')" role="button" tabindex="0">
                <div>
                  <div class="inno-why-icon-circle" style="background:#dcfce7; color:#16a34a;">💡</div>
                  <h4>Propuesta de valor</h4>
                  <p>Un ecosistema de datos e IA que facilita la toma de decisiones y la transparencia.</p>
                </div>
                <span class="inno-why-arrow">→</span>
              </article>

              <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Metodología — ${selectedTitle}')" role="button" tabindex="0">
                <div>
                  <div class="inno-why-icon-circle" style="background:#f3e8ff; color:#7c3aed;">⚙️</div>
                  <h4>Metodología</h4>
                  <p>Gobierno de datos, analítica avanzada y tecnologías de IA aplicadas al sector público.</p>
                </div>
                <span class="inno-why-arrow">→</span>
              </article>

              <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Impacto Esperado — ${selectedTitle}')" role="button" tabindex="0">
                <div>
                  <div class="inno-why-icon-circle" style="background:#ecfdf5; color:#059669;">🛡️</div>
                  <h4>Impacto esperado</h4>
                  <p>Más transparencia, eficiencia y participación ciudadana.</p>
                </div>
                <span class="inno-why-arrow">→</span>
              </article>
            </div>
          </section>

          <!-- ================================================================
               4. SECCIÓN RECURSOS & GALERÍA MULTIMEDIA
               ================================================================ -->
          <section class="inno-resources-section" id="inno-sec-resources">
            <div class="inno-resources-inner">
              <div class="inno-resources-header">
                <div class="inno-resources-title-wrap">
                  <div class="inno-resources-icon">📁</div>
                  <div>
                    <h2 class="inno-resources-title">Recursos</h2>
                    <p class="inno-resources-sub">Accede a todos los materiales del proyecto</p>
                  </div>
                </div>

                <div style="display:flex; align-items:center; gap:0.75rem;">
                  <div class="inno-search-box">
                    <span style="position:absolute; left:0.75rem; color:#94a3b8; font-size:0.85rem;">🔍</span>
                    <input type="search" class="inno-search-input" placeholder="Buscar recursos..." oninput="window.ProjectsView.filterLandingSearch(this.value)" />
                  </div>
                  <select style="background:#ffffff; border:1px solid #cbd5e1; border-radius:999px; padding:0.45rem 1rem; font-size:0.84rem; font-weight:700; color:#334155; outline:none; cursor:pointer;">
                    <option>Más recientes ▾</option>
                    <option>Más descargados</option>
                    <option>Por categoría</option>
                  </select>
                </div>
              </div>

              <!-- Filtros de categoría -->
              <div class="inno-filter-tabs">
                <button type="button" class="inno-filter-pill active">Todos</button>
                <button type="button" class="inno-filter-pill">Videos</button>
                <button type="button" class="inno-filter-pill">Documentos</button>
                <button type="button" class="inno-filter-pill">Presentaciones</button>
                <button type="button" class="inno-filter-pill">Guías</button>
                <button type="button" class="inno-filter-pill">Imágenes</button>
                <button type="button" class="inno-filter-pill">Enlaces</button>
              </div>

              <div class="inno-resources-main-grid">
                <!-- 4 Tarjetas de Recursos -->
                <div class="inno-cards-grid">
                  <!-- Card 1: Video -->
                  <article class="inno-resource-card" data-plp-search="video explicativo objetivos alcance">
                    <div class="inno-card-thumb-wrap" style="background-image:url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80'); cursor:pointer;" onclick="window.ProjectsView.playLandingVideo()">
                      <span class="inno-card-tag" style="background:#0284c7;">▶ Video</span>
                      <div class="inno-card-play-btn">▶</div>
                    </div>
                    <div class="inno-card-body">
                      <div>
                        <h4 class="inno-card-title">Video explicativo del proyecto</h4>
                        <p class="inno-card-desc">Conoce los objetivos y el alcance de la iniciativa.</p>
                      </div>
                      <div class="inno-card-footer">
                        <span>📅 12 abr 2025 • ⏱️ 03:45</span>
                        <button type="button" class="inno-card-dl-btn" onclick="window.ProjectsView.playLandingVideo()" title="Reproducir">⬇</button>
                      </div>
                    </div>
                  </article>

                  <!-- Card 2: Informe técnico -->
                  <article class="inno-resource-card" data-plp-search="informe tecnico documento avances resultados pdf">
                    <div class="inno-card-thumb-wrap" style="background-image:url('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80'); cursor:pointer;" onclick="window.ProjectsView.previewLandingDoc('Informe Técnico — ${selectedTitle}')">
                      <span class="inno-card-tag" style="background:#ea580c;">📄 PDF</span>
                    </div>
                    <div class="inno-card-body">
                      <div>
                        <h4 class="inno-card-title">Informe técnico</h4>
                        <p class="inno-card-desc">Documento con los avances y resultados del proyecto.</p>
                      </div>
                      <div class="inno-card-footer">
                        <span>📅 10 abr 2025 • 💾 2.4 MB</span>
                        <button type="button" class="inno-card-dl-btn" onclick="window.ProjectsView.downloadLandingDoc('Informe_Tecnico.pdf')" title="Descargar">⬇</button>
                      </div>
                    </div>
                  </article>

                  <!-- Card 3: Presentación -->
                  <article class="inno-resource-card" data-plp-search="presentacion institucional resumen ejecutivo componentes">
                    <div class="inno-card-thumb-wrap" style="background-image:url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80'); cursor:pointer;" onclick="window.ProjectsView.previewLandingDoc('Presentación Institucional — ${selectedTitle}')">
                      <span class="inno-card-tag" style="background:#7c3aed;">📊 Presentación</span>
                    </div>
                    <div class="inno-card-body">
                      <div>
                        <h4 class="inno-card-title">Presentación institucional</h4>
                        <p class="inno-card-desc">Resumen ejecutivo del proyecto y sus componentes.</p>
                      </div>
                      <div class="inno-card-footer">
                        <span>📅 08 abr 2025 • 💾 5.8 MB</span>
                        <button type="button" class="inno-card-dl-btn" onclick="window.ProjectsView.downloadLandingDoc('Presentacion_Institucional.pdf')" title="Descargar">⬇</button>
                      </div>
                    </div>
                  </article>

                  <!-- Card 4: Guía de implementación -->
                  <article class="inno-resource-card" data-plp-search="guia de implementacion adopcion gobierno de datos">
                    <div class="inno-card-thumb-wrap" style="background-image:url('https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80'); cursor:pointer;" onclick="window.ProjectsView.previewLandingDoc('Guía de Implementación — ${selectedTitle}')">
                      <span class="inno-card-tag" style="background:#059669;">📘 Guía</span>
                    </div>
                    <div class="inno-card-body">
                      <div>
                        <h4 class="inno-card-title">Guía de implementación</h4>
                        <p class="inno-card-desc">Paso a paso para la adopción del gobierno de datos.</p>
                      </div>
                      <div class="inno-card-footer">
                        <span>📅 05 abr 2025 • 💾 1.2 MB</span>
                        <button type="button" class="inno-card-dl-btn" onclick="window.ProjectsView.downloadLandingDoc('Guia_Implementacion.pdf')" title="Descargar">⬇</button>
                      </div>
                    </div>
                  </article>
                </div>

                <!-- Columna Derecha: Galería Multimedia Widget -->
                <aside class="inno-gallery-box">
                  <div class="inno-gallery-header">
                    <div>
                      <h3 style="margin:0 0 0.2rem; font-size:1.15rem; font-weight:800; color:#ffffff;">🖼️ Galería multimedia</h3>
                      <p style="margin:0; font-size:0.8rem; color:#94a3b8;">Imágenes, videos y momentos del proyecto</p>
                    </div>
                    <button type="button" style="background:none; border:none; color:var(--inno-cyan-400); font-size:0.84rem; font-weight:700; cursor:pointer;" onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80', 'Centro de Monitoreo de Datos y Modelos IA')">
                      Ver galería →
                    </button>
                  </div>

                  <div class="inno-gallery-mosaic">
                    <div class="inno-gallery-big" style="background-image:url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80');" onclick="window.ProjectsView.playLandingVideo()">
                      <div class="inno-card-play-btn" style="width:52px; height:52px; font-size:1.25rem;">▶</div>
                    </div>
                    <div class="inno-gallery-stack">
                      <div class="inno-gallery-thumb" style="background-image:url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80');" onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80', 'Sesión de trabajo en equipo')"></div>
                      <div class="inno-gallery-thumb" style="background-image:url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80');" onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80', 'Analítica y métricas de desempeño')"></div>
                      <div class="inno-gallery-thumb" style="background-image:url('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80');" onclick="window.ProjectsView.openLandingLightbox('https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80', 'Comunidad y colaboradores')">
                        <div class="inno-gallery-overlay-badge">+12</div>
                      </div>
                    </div>
                  </div>

                  <div style="text-align:right;">
                    <span style="font-size:0.75rem; color:#64748b;">Actualizado recientemente • 16 archivos multimedia</span>
                  </div>
                </aside>
              </div>
            </div>
          </section>

          <!-- ================================================================
               5. SECCIÓN AVANCES E IMPACTO & SÉ PARTE DEL PROYECTO
               ================================================================ -->
          <section class="inno-bottom-section" id="inno-sec-timeline">
            <div class="inno-bottom-grid">
              <!-- Tarjeta Avances e Impacto -->
              <article class="inno-timeline-card">
                <div>
                  <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.35rem;">
                    <span style="font-size:1.3rem;">📋</span>
                    <h3 style="margin:0; font-size:1.25rem; font-weight:800; color:var(--inno-text-dark);">Avances e impacto</h3>
                  </div>
                  <p style="margin:0 0 1.5rem; font-size:0.86rem; color:var(--inno-text-muted);">Conoce los hitos y el progreso del proyecto</p>
                </div>

                <div class="inno-timeline-stepper">
                  <div class="inno-timeline-line"></div>
                  <div class="inno-timeline-line-active"></div>

                  <div class="inno-step-item active">
                    <div class="inno-step-dot">●</div>
                    <div class="inno-step-title">Inicio</div>
                    <div class="inno-step-date">Ene 2025</div>
                  </div>

                  <div class="inno-step-item active">
                    <div class="inno-step-dot">●</div>
                    <div class="inno-step-title">Fase 1: Diagnóstico</div>
                    <div class="inno-step-date">Mar 2025</div>
                  </div>

                  <div class="inno-step-item active">
                    <div class="inno-step-dot">●</div>
                    <div class="inno-step-title">Fase 2: Desarrollo</div>
                    <div class="inno-step-date">May 2025</div>
                  </div>

                  <div class="inno-step-item active">
                    <div class="inno-step-dot">●</div>
                    <div class="inno-step-title">Fase 3: Implementación</div>
                    <div class="inno-step-date">Ago 2025</div>
                  </div>

                  <div class="inno-step-item">
                    <div class="inno-step-dot">○</div>
                    <div class="inno-step-title">Resultados</div>
                    <div class="inno-step-date">Dic 2025</div>
                  </div>
                </div>
              </article>

              <!-- Banner Sé parte del proyecto -->
              <article class="inno-join-banner">
                <div class="inno-join-bg"></div>
                <div class="inno-join-content">
                  <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.5rem;">
                    <span style="font-size:1.5rem;">👥</span>
                    <h3 class="inno-join-title">¡Sé parte del proyecto!</h3>
                  </div>
                  <p class="inno-join-desc">
                    Proyecto creado por <strong>${authorDisplayName}</strong>${authorDisplayEmail ? ` • Contacto: <span style="color:var(--inno-cyan-400); font-weight:700;">${authorDisplayEmail}</span>` : ''}. Tu participación es clave para colaborar en este proyecto.
                  </p>
                  <button type="button" class="inno-btn-cyan" onclick="window.ProjectsView.previewLandingDoc('Contacto y Alianzas — ${selectedTitle}')" style="box-shadow:none;">
                    <span>Contactar al equipo</span> <span>→</span>
                  </button>
                </div>
              </article>
            </div>
          </section>

          <!-- ================================================================
               6. FOOTER
               ================================================================ -->
          <footer class="inno-footer">
            <div class="inno-footer-left">
              <div class="inno-logo-icon" style="width:28px; height:28px; border-radius:8px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <strong style="color:#ffffff;">${brandTitle}</strong> • <span style="color:var(--inno-cyan-400);">${brandSubtitle}</span>
            </div>

            <nav class="inno-footer-links">
              <a href="#inno-sec-hero" class="inno-footer-link">Inicio</a>
              <a href="#inno-sec-why" class="inno-footer-link">Sobre el Proyecto</a>
              <a href="#inno-sec-resources" class="inno-footer-link">Recursos</a>
              <a href="#inno-sec-resources" class="inno-footer-link">Presentaciones</a>
              <a href="#inno-sec-resources" class="inno-footer-link">Galería</a>
              <a href="#inno-sec-timeline" class="inno-footer-link">Contacto</a>
            </nav>

            <div class="inno-footer-right">
              <span style="font-size:0.8rem; color:#64748b;">Innovación • Datos • Personas</span>
            </div>
          </footer>

          <!-- Lightbox Modal Universal -->
          <div class="plp-lightbox" id="plp-inline-lightbox" role="dialog" aria-modal="true" onclick="if(event.target===this) window.ProjectsView.closeLandingLightbox()">
            <div class="plp-lightbox-content" id="plp-inline-lightbox-body"></div>
          </div>

          <!-- Botón Flotante para Invocar al Agente Inteligente de Proyecto -->
          <button 
            type="button" 
            onclick="window.ProjectsView.showProjectAgent()" 
            title="Abrir Agente Inteligente del Proyecto"
            style="position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 99999; background: linear-gradient(135deg, #0f172a, #1e1136); color: #ffffff; border: 2px solid #00f5d4; border-radius: 9999px; padding: 0.75rem 1.35rem; font-weight: 900; font-size: 0.92rem; box-shadow: 0 10px 30px rgba(0, 245, 212, 0.35), 0 0 20px rgba(247, 37, 133, 0.3); cursor: pointer; display: flex; align-items: center; gap: 0.6rem; transition: transform 0.2s, box-shadow 0.2s;"
            onmouseenter="this.style.transform='scale(1.06)'; this.style.borderColor='#f72585';"
            onmouseleave="this.style.transform='scale(1)'; this.style.borderColor='#00f5d4';"
          >
            <span style="font-size: 1.35rem;">🤖</span>
            <span style="letter-spacing: 0.4px;">Agente IA</span>
            <span style="width: 8px; height: 8px; border-radius: 50%; background: #00f5d4; box-shadow: 0 0 8px #00f5d4; display: inline-block;"></span>
          </button>
        </div>
      </div>
    `;
  },

  scrollToLandingSection(sectionId) {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  playLandingVideo() {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const vid = (selected && selected.video) ? selected.video : {};
    const rawUrl = vid.url || vid.embedUrl || (selected && selected.videoUrl) || 'https://www.youtube.com/embed/aircAruvnKk';

    let videoHtml = `
      <iframe
        width="100%"
        height="500px"
        src="https://www.youtube.com/embed/aircAruvnKk?autoplay=1&rel=0"
        title="Video Explicativo del Proyecto"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        style="border:0; width:100%; height:500px; display:block; border-radius:12px;"
      ></iframe>
    `;

    if (rawUrl) {
      const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      if (ytMatch) {
        videoHtml = `<iframe width="100%" height="500px" src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0" frameborder="0" allowfullscreen style="border:0; width:100%; height:500px; display:block; border-radius:12px;"></iframe>`;
      }
    }

    const projTitle = this.escapeHtml((selected && selected.title) || 'Proyecto');

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="background:#091e2d; padding:1.5rem; border-radius:16px;">
        <h3 style="color:#ffffff; margin:0 0 1rem;">🎬 Video Explicativo: ${projTitle}</h3>
        ${videoHtml}
      </div>
    `;
    modal.classList.add('active');
  },

  downloadLandingDoc(filename) {
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const title = (selected && selected.title) || 'PROYECTO EDUCATIVO';
    const content = `${title}\nDocumento: ${filename}\nFecha: ${new Date().toLocaleDateString()}\n\n1. RESUMEN:\n${(selected && (selected.description || selected.shortDescription)) || 'Documento y material didáctico oficial del proyecto.'}\n\n2. RECURSOS:\n- Material pedagógico y conceptual.\n- Implementación y aplicación práctica.`;
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
      <img src="${imgUrl}" alt="${this.escapeHtml(caption)}" style="width:100%; max-height:75vh; object-fit:contain; background:#091e2d; display:block;" />
      <div style="padding:1.25rem 1.75rem; background:#ffffff;">
        <h3 style="margin:0; font-size:1.15rem; color:#091e2d;">${this.escapeHtml(caption)}</h3>
      </div>
    `;
    modal.classList.add('active');
  },

  previewLandingDoc(title) {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    const selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    const projTitle = this.escapeHtml((selected && selected.title) || 'Proyecto');
    const isDark = (document.querySelector('.plp-wrapper')?.getAttribute('data-theme') || this.getLandingTheme()) === 'dark';
    const bg = isDark ? '#091e2d' : '#ffffff';
    const titleColor = isDark ? '#ffffff' : '#091e2d';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const border = isDark ? '1px solid #1e3a54' : 'none';

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="padding:2.5rem; background:${bg}; border:${border}; border-radius:20px;">
        <span class="inno-eyebrow">Vista Previa Oficial</span>
        <h2 style="margin:0.5rem 0 1rem; color:${titleColor};">${this.escapeHtml(title)}</h2>
        <p style="color:${textColor}; line-height:1.7;">
          Recurso oficial de <strong>${projTitle}</strong>. Diseñado para impulsar el aprendizaje, la experimentación y el desarrollo de competencias.
        </p>
        <div style="margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="inno-btn-cyan" onclick="window.ProjectsView.downloadLandingDoc('${this.escapeHtml(title.replace(/\s+/g, '_').slice(0, 40))}.txt'); window.ProjectsView.closeLandingLightbox();">
            ⬇ Descargar Ficha Oficial
          </button>
          <button class="inno-btn-ghost" style="color:${titleColor}; border-color:${titleColor};" onclick="window.ProjectsView.closeLandingLightbox()">
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