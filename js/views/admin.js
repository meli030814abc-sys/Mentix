/**
 * 🛡️ MENTIX ACADEMY - Backend Administrativo SaaS de Alta Calidad
 * Panel ejecutivo para supervisión de proyectos, usuarios, categorías,
 * analítica visual, auditoría y personalización del sistema.
 */

window.AdminView = {
  activeTab: 'dashboard',
  projectFilter: {
    search: '',
    category: 'all',
    status: 'all',
    viewMode: 'cards' // 'cards' | 'table'
  },
  userFilter: {
    search: '',
    role: 'all',
    status: 'all'
  },
  resourceFilter: {
    search: '',
    type: 'all'
  },
  auditFilter: {
    search: '',
    module: 'all'
  },
  sidebarCollapsed: false,
  selectedProjectForModal: null,
  activeModalTab: 'general',

  /**
   * Obtener URL del banner hero del robot
   */
  getHeroBannerUrl() {
    const saved = localStorage.getItem('mentix_admin_hero_banner') || localStorage.getItem('mentix_projects_hero_banner');
    if (saved) return saved;
    if (window.appState && window.appState.projectsHeroBanner) return window.appState.projectsHeroBanner;
    return 'assets/projects_ui/robot_hero_banner.png';
  },

  /**
   * Obtiene exclusivamente los proyectos reales estructurados (presentaciones, videos, documentos, URLs, GovData)
   * EXCLUYENDO completamente los cuestionarios de preguntas / retos gamificados de trivia.
   */
  getRealProjects() {
    let raw = (window.appState && Array.isArray(window.appState.challenges)) ? window.appState.challenges : [];
    
    // Si DEFAULT_PROJECTS existe y no están en raw, integrarlos
    if (typeof DEFAULT_PROJECTS !== 'undefined' && Array.isArray(DEFAULT_PROJECTS)) {
      DEFAULT_PROJECTS.forEach(dp => {
        if (!raw.some(c => c && c.id === dp.id)) {
          raw.push({ ...dp });
        }
      });
    }

    return raw.filter(c => {
      if (!c || !c.id || c.deleted || c.is_deleted) return false;
      // Excluir retos de tipo quiz/cuestionario
      if (c.projectType === 'quiz') return false;
      // Si tiene preguntas de trivia pero NINGÚN componente de proyecto real (slides, video, doc, url, govdata)
      if (!c.projectType && Array.isArray(c.questions) && c.questions.length > 0 && !c.isGovDataProject && !c.slides && !c.videoUrl && !c.docContent && !c.resourceWebUrl) {
        return false;
      }
      // Si el título empieza por "reto" o "desafío" y no tiene artefactos de proyecto estructurado
      const titleLower = (c.title || '').toLowerCase().trim();
      if ((titleLower.startsWith('reto ') || titleLower.startsWith('desafío ') || titleLower.startsWith('desafio ')) && !c.slides && !c.videoUrl && !c.docContent && !c.resourceWebUrl && !c.isGovDataProject) {
        return false;
      }
      // Solo proyectos con tipos de proyecto válidos o contenido estructurado
      return c.projectType === 'presentation' || 
             c.projectType === 'video' || 
             c.projectType === 'document' || 
             c.projectType === 'url' || 
             c.isGovDataProject || 
             c.is_gov_data_project || 
             (Array.isArray(c.slides) && c.slides.length > 0) || 
             c.videoUrl || 
             c.docContent || 
             c.resourceWebUrl || 
             (c.id && String(c.id).startsWith('proj_'));
    });
  },

  /**
   * Comprobar si el usuario actual tiene permisos de Administrador
   */
  isAdminUser() {
    const u = window.appState && window.appState.currentUser;
    if (!u) return false;
    const r = (u.role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'administrador' || u.isAdmin === true) return true;
    if (localStorage.getItem('mentix_admin_override') === 'true') return true;
    return false;
  },

  /**
   * Permitir el acceso en modo administrador para pruebas o usuarios autorizados
   */
  simulateAdminLogin() {
    if (window.appState) {
      if (!window.appState.currentUser) {
        window.appState.currentUser = {
          id: 'admin_master',
          name: 'Administrador Mentix',
          email: 'admin@mentix.edu',
          role: 'admin',
          isAdmin: true
        };
      } else {
        window.appState.currentUser.role = 'admin';
        window.appState.currentUser.isAdmin = true;
      }
    }
    localStorage.setItem('mentix_admin_override', 'true');
    this.logAuditEvent('Inicio de sesión en Modo Administrador autorizado', 'Seguridad');
    this.showToast('Acceso como Administrador habilitado', 'success');
    this.render();
  },

  /**
   * Inicialización y renderizado principal
   */
  render() {
    const container = document.getElementById('view-admin');
    if (!container) return;

    // Control estricto de acceso exclusivo para administradores
    if (!this.isAdminUser()) {
      const u = window.appState && window.appState.currentUser;
      container.innerHTML = `
        <div class="admin-unauthorized-wrapper">
          <div class="admin-unauthorized-card">
            <div class="admin-unauth-header">
              <div class="admin-brain-logo large">
                <svg viewBox="0 0 100 100" class="admin-brain-svg" width="60" height="60">
                  <defs>
                    <linearGradient id="brainGradPinkUnauth" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ff007f" />
                      <stop offset="100%" stop-color="#d946ef" />
                    </linearGradient>
                    <linearGradient id="brainGradCyanUnauth" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00f5d4" />
                      <stop offset="100%" stop-color="#0066ff" />
                    </linearGradient>
                  </defs>
                  <path d="M 47,15 C 38,15 28,18 22,25 C 16,32 15,40 18,48 C 14,53 14,61 17,68 C 20,75 27,82 36,84 C 42,85 46,81 47,78 Z" fill="url(#brainGradPinkUnauth)"/>
                  <path d="M 28,32 C 34,30 40,36 44,38 M 24,52 C 30,50 36,54 44,53 M 28,70 C 35,68 40,73 45,71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85"/>
                  <path d="M 53,15 C 62,15 72,18 78,25 C 84,32 85,40 82,48 C 86,53 86,61 83,68 C 80,75 73,82 64,84 C 58,85 54,81 53,78 Z" fill="url(#brainGradCyanUnauth)"/>
                  <path d="M 72,32 C 66,30 60,36 56,38 M 76,52 C 70,50 64,54 56,53 M 72,70 C 65,68 60,73 55,71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85"/>
                </svg>
              </div>
              <span class="unauth-security-badge">🔒 ACCESO RESTRINGIDO</span>
            </div>

            <h2>Panel Exclusivo de Administradores</h2>
            <p class="unauth-desc">
              Esta sección contiene los controles ejecutivos de configuración, ajustes de diseño de robots, reportes y gestión de roles de Mentix. Tu cuenta actual (<strong>${u ? u.name : 'Invitado'}</strong>) tiene rol de <strong>${u ? (u.role || 'Estudiante') : 'Sin sesión'}</strong>.
            </p>

            <div class="unauth-actions">
              <button class="btn btn-cyan" onclick="window.appRouter.navigate('projects')">
                <span>🚀</span> Volver al Portal de Proyectos
              </button>
              <button class="btn btn-outline" onclick="window.AdminView.simulateAdminLogin()">
                <span>🔑</span> Entrar en Modo Administrador
              </button>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // Sincronizar datos globales
    this.ensureAuditLogs();
    this.ensureResources();
    this.sidebarCollapsed = localStorage.getItem('mentix_admin_sidebar_collapsed') === 'true';

    // Inyectar layout SaaS completo
    container.innerHTML = `
      <div class="mentix-admin-layout ${this.sidebarCollapsed ? 'sidebar-collapsed' : ''}" id="mentix-admin-root">
        
        <!-- SIDEBAR LATERAL AZUL OSCURO -->
        <aside class="mentix-admin-sidebar" id="admin-sidebar">
          <div class="admin-sidebar-header">
            <div class="admin-brand-wrap" onclick="window.AdminView.switchTab('dashboard')">
              <div class="admin-brain-logo">
                <svg viewBox="0 0 100 100" class="admin-brain-svg" width="38" height="38">
                  <defs>
                    <linearGradient id="brainGradPink" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ff007f" />
                      <stop offset="100%" stop-color="#d946ef" />
                    </linearGradient>
                    <linearGradient id="brainGradCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#00f5d4" />
                      <stop offset="100%" stop-color="#0066ff" />
                    </linearGradient>
                    <filter id="brainGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="2.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>
                  <!-- Hemisferio Izquierdo Magenta/Rosa -->
                  <path d="M 47,15 C 38,15 28,18 22,25 C 16,32 15,40 18,48 C 14,53 14,61 17,68 C 20,75 27,82 36,84 C 42,85 46,81 47,78 Z" fill="url(#brainGradPink)" filter="url(#brainGlow)"/>
                  <path d="M 28,32 C 34,30 40,36 44,38 M 24,52 C 30,50 36,54 44,53 M 28,70 C 35,68 40,73 45,71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85"/>
                  <!-- Hemisferio Derecho Cyan/Azul Eléctrico -->
                  <path d="M 53,15 C 62,15 72,18 78,25 C 84,32 85,40 82,48 C 86,53 86,61 83,68 C 80,75 73,82 64,84 C 58,85 54,81 53,78 Z" fill="url(#brainGradCyan)" filter="url(#brainGlow)"/>
                  <path d="M 72,32 C 66,30 60,36 56,38 M 76,52 C 70,50 64,54 56,53 M 72,70 C 65,68 60,73 55,71" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.85"/>
                </svg>
              </div>
              <div class="admin-brand-text sidebar-hideable">
                <h3 class="admin-brand-title">MEN<span>TI</span>X</h3>
                <span class="admin-brand-slogan">Aprende · Crea · Innova</span>
              </div>
            </div>
            <button class="admin-sidebar-toggle-btn" title="Contraer menú" onclick="window.AdminView.toggleSidebar()">
              <span>◀</span>
            </button>
          </div>

          <!-- Navegación del Sidebar (Idéntico a la imagen) -->
          <nav class="admin-sidebar-nav">
            <button class="admin-nav-item ${this.activeTab === 'dashboard' ? 'active' : ''}" onclick="window.AdminView.switchTab('dashboard')">
              <span class="admin-nav-icon">🏠</span>
              <span class="admin-nav-label sidebar-hideable">Inicio</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'projects' ? 'active' : ''}" onclick="window.AdminView.switchTab('projects')">
              <span class="admin-nav-icon">📁</span>
              <span class="admin-nav-label sidebar-hideable">Mis Proyectos</span>
              <span class="admin-nav-badge sidebar-hideable">${this.getRealProjects().length}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'teacher' ? 'active' : ''}" onclick="window.AdminView.switchTab('teacher')">
              <span class="admin-nav-icon">📋</span>
              <span class="admin-nav-label sidebar-hideable">Panel Docente</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'evaluations' ? 'active' : ''}" onclick="window.AdminView.switchTab('evaluations')">
              <span class="admin-nav-icon">📝</span>
              <span class="admin-nav-label sidebar-hideable">Evaluaciones</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'resources' ? 'active' : ''}" onclick="window.AdminView.switchTab('resources')">
              <span class="admin-nav-icon">📂</span>
              <span class="admin-nav-label sidebar-hideable">Recursos</span>
              <span class="admin-nav-badge sidebar-hideable" id="admin-resources-count-badge">6</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'community' || this.activeTab === 'roles' ? 'active' : ''}" onclick="window.AdminView.switchTab('community')">
              <span class="admin-nav-icon">👥</span>
              <span class="admin-nav-label sidebar-hideable">Comunidad</span>
              <span class="admin-nav-badge sidebar-hideable">${(window.appState && window.appState.users ? window.appState.users.length : 0)}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'reports' ? 'active' : ''}" onclick="window.AdminView.switchTab('reports')">
              <span class="admin-nav-icon">📊</span>
              <span class="admin-nav-label sidebar-hideable">Reportes</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'settings' || this.activeTab === 'design' ? 'active' : ''}" onclick="window.AdminView.switchTab('settings')">
              <span class="admin-nav-icon">⚙️</span>
              <span class="admin-nav-label sidebar-hideable">Configuración</span>
            </button>
          </nav>

          <!-- Tarjeta de Soporte Institucional -->
          <div class="admin-sidebar-footer">
            <div class="admin-support-card">
              <div class="admin-support-icon">🏛️</div>
              <div class="admin-support-content">
                <h4>Mentix Cloud v3.5</h4>
                <p>Modo Administrador Activo con permisos de auditoría.</p>
                <button class="admin-support-btn" onclick="window.AdminView.switchTab('audit')">Ver logs de seguridad</button>
              </div>
            </div>
          </div>
        </aside>

        <!-- CONTENIDO PRINCIPAL Y HEADER SUPERIOR -->
        <div class="mentix-admin-main">
          
          <!-- HEADER SUPERIOR HORIZONTAL -->
          <header class="mentix-admin-topbar">
            <div class="admin-topbar-left">
              <button class="admin-mobile-toggle" onclick="window.AdminView.toggleMobileSidebar()">
                <span>☰</span>
              </button>
              <div class="admin-global-search">
                <span class="admin-search-icon">🔍</span>
                <input type="text" id="admin-global-search-input" placeholder="Búsqueda global de proyectos, usuarios, categorías..." oninput="window.AdminView.handleGlobalSearch(this.value)">
              </div>
            </div>

            <div class="admin-topbar-right">
              <!-- Botón rápido hacia la plataforma de estudiantes -->
              <button class="admin-btn-portal" onclick="window.appRouter.navigate('projects')" title="Ver portal de estudiantes">
                <span>🌐</span> Ver Plataforma
              </button>

              <!-- Notificaciones -->
              <div class="admin-notifications-dropdown-wrapper">
                <button class="admin-icon-btn" onclick="window.AdminView.toggleNotificationsMenu()" title="Centro de Notificaciones">
                  <span>🔔</span>
                  <span class="admin-notif-dot"></span>
                </button>
                <div class="admin-notif-popover" id="admin-notif-popover" style="display: none;">
                  <div class="admin-notif-header">
                    <h4>Notificaciones del Sistema</h4>
                    <span class="badge-tag">3 Nuevas</span>
                  </div>
                  <div class="admin-notif-list">
                    <div class="admin-notif-item unread">
                      <div class="notif-icon cyan">🚀</div>
                      <div class="notif-body">
                        <p class="notif-title">Nuevo proyecto registrado</p>
                        <span class="notif-time">Hace 5 minutos</span>
                      </div>
                    </div>
                    <div class="admin-notif-item unread">
                      <div class="notif-icon gold">👤</div>
                      <div class="notif-body">
                        <p class="notif-title">Estudiante completó reto</p>
                        <span class="notif-time">Hace 22 minutos</span>
                      </div>
                    </div>
                    <div class="admin-notif-item">
                      <div class="notif-icon blue">🛡️</div>
                      <div class="notif-body">
                        <p class="notif-title">Copia de respaldo generada</p>
                        <span class="notif-time">Hoy 04:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Avatar y Perfil de Administrador -->
              <div class="admin-user-profile-chip" onclick="window.AdminView.toggleUserMenu()">
                <div class="admin-user-avatar">
                  <span>👨‍💼</span>
                </div>
                <div class="admin-user-info">
                  <span class="admin-user-name">${(window.appState && window.appState.currentUser ? window.appState.currentUser.name : 'Administrador')}</span>
                  <span class="admin-user-role">Super Admin</span>
                </div>
                <span class="admin-dropdown-arrow">▾</span>
              </div>
            </div>
          </header>

          <!-- ÁREA CENTRAL DE CONTENIDO DINÁMICO -->
          <main class="mentix-admin-content" id="admin-dynamic-content">
            <!-- Se inyecta según this.activeTab -->
          </main>

        </div>

      </div>

      <!-- CONTENEDOR DE MODALES -->
      <div id="admin-modal-root"></div>

      <!-- CONTENEDOR DE TOASTS -->
      <div class="admin-toast-container" id="admin-toast-container"></div>
    `;

    // Renderizar la pestaña activa
    this.renderActiveTab();
  },

  /**
   * Cambiar de sección en el sidebar
   */
  switchTab(tabName) {
    if (tabName === 'design') tabName = 'settings';
    if (tabName === 'roles' || tabName === 'users') tabName = 'community';
    this.activeTab = tabName;
    
    // Actualizar clase activa en nav
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    const currentBtn = Array.from(navItems).find(btn => btn.getAttribute('onclick')?.includes(`'${tabName}'`));
    if (currentBtn) currentBtn.classList.add('active');

    // Cerrar sidebar en mobile si estaba abierto
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Renderizar contenido dinámico
    this.renderActiveTab();
  },

  /**
   * Renderiza el contenido central correspondiente a la pestaña activa
   */
  renderActiveTab() {
    const content = document.getElementById('admin-dynamic-content');
    if (!content) return;

    switch (this.activeTab) {
      case 'dashboard':
        content.innerHTML = this.templateDashboard();
        break;
      case 'projects':
        content.innerHTML = this.templateProjects();
        break;
      case 'teacher':
        content.innerHTML = this.templateTeacher();
        break;
      case 'evaluations':
        content.innerHTML = this.templateEvaluations();
        break;
      case 'resources':
        content.innerHTML = this.templateResources();
        break;
      case 'community':
      case 'roles':
      case 'users':
        content.innerHTML = this.templateRoles();
        break;
      case 'reports':
        content.innerHTML = this.templateReports();
        break;
      case 'settings':
      case 'design':
        content.innerHTML = this.templateDesign();
        break;
      case 'categories':
        content.innerHTML = this.templateCategories();
        break;
      case 'audit':
        content.innerHTML = this.templateAudit();
        break;
      default:
        content.innerHTML = this.templateDashboard();
    }
  },

  templateTeacher() {
    return `
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Panel Docente</span>
      </div>
      <div class="admin-section-header">
        <div>
          <h2>Panel Docente & Mentoría Académica</h2>
          <p>Supervisa los cursos activos, asignaciones de retos y acompañamiento pedagógico a estudiantes.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-cyan" onclick="window.appRouter.navigate('teacher')">
            <span>👨‍🏫</span> Abrir Panel Docente Completo
          </button>
        </div>
      </div>
      <div class="admin-roles-overview-grid">
        <div class="admin-role-card role-card-teacher">
          <div class="role-card-top">
            <span class="role-card-icon">📚</span>
            <span class="role-card-badge">Activo</span>
          </div>
          <h3>Cursos & Grupos</h3>
          <p>4 Grupos activos en formulación de proyectos tecnológicos y de ciencias.</p>
        </div>
        <div class="admin-role-card role-card-admin">
          <div class="role-card-top">
            <span class="role-card-icon">🚀</span>
            <span class="role-card-badge">12 Retos</span>
          </div>
          <h3>Retos en Desarrollo</h3>
          <p>Proyectos estudiantiles en fase de prototipado y validación de hipótesis.</p>
        </div>
        <div class="admin-role-card role-card-student">
          <div class="role-card-top">
            <span class="role-card-icon">📝</span>
            <span class="role-card-badge">8 Entregas</span>
          </div>
          <h3>Entregas Pendientes</h3>
          <p>Entregas listas para revisión y retroalimentación docente con rúbrica.</p>
        </div>
      </div>
    `;
  },

  templateEvaluations() {
    return `
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Evaluaciones & Rúbricas</span>
      </div>
      <div class="admin-section-header">
        <div>
          <h2>Centro de Evaluaciones & Rúbricas Oficiales</h2>
          <p>Gestiona los criterios de calificación, ponderaciones y rúbricas de proyectos de innovación.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-cyan" onclick="window.AdminView.switchTab('resources')">
            <span>📝</span> Ver Rúbricas en Recursos
          </button>
        </div>
      </div>
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Criterio de Evaluación</th>
              <th>Ponderación</th>
              <th>Público Objetivo</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Impacto y Pertinencia Social</strong></td>
              <td>25%</td>
              <td>Todos los Proyectos</td>
              <td><span class="perm-yes">✅ Activo</span></td>
            </tr>
            <tr>
              <td><strong>Rigor Técnico & Prototipado</strong></td>
              <td>30%</td>
              <td>Robótica, IA y Software</td>
              <td><span class="perm-yes">✅ Activo</span></td>
            </tr>
            <tr>
              <td><strong>Pitch y Comunicación (Diapositivas / Video)</strong></td>
              <td>25%</td>
              <td>Presentaciones y Videos</td>
              <td><span class="perm-yes">✅ Activo</span></td>
            </tr>
            <tr>
              <td><strong>Originalidad e Innovación</strong></td>
              <td>20%</td>
              <td>Todos los Proyectos</td>
              <td><span class="perm-yes">✅ Activo</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 1. DASHBOARD EJECUTIVO
   */
  templateDashboard() {
    const projects = this.getRealProjects();
    const users = (window.appState && window.appState.users) ? window.appState.users : [];
    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];

    const totalProjects = projects.length;
    const completedProjects = projects.filter(p => p.status === 'completed' || p.stage === 'completed').length;
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'in_progress' || !p.status).length;
    const pendingProjects = projects.filter(p => p.status === 'review' || p.status === 'pending').length;
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;

    // Donut chart math
    const pCompletedPct = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;
    const pActivePct = totalProjects > 0 ? Math.round((activeProjects / totalProjects) * 100) : 0;
    const pPendingPct = totalProjects > 0 ? (100 - pCompletedPct - pActivePct) : 0;

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Dashboard Ejecutivo</span>
      </div>

      <!-- Header de la sección -->
      <div class="admin-section-header">
        <div>
          <h2>Panel Ejecutivo & Monitoreo Global</h2>
          <p>Supervisión en tiempo real de proyectos estudiantiles, interacción académica y salud del sistema.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.exportFullDatabase()">
            <span>💾</span> Backup JSON
          </button>
          <button class="btn btn-cyan" onclick="window.AdminView.switchTab('projects')">
            <span>🚀</span> Gestionar Proyectos
          </button>
        </div>
      </div>

      <!-- PRIMERA SECCIÓN: 6 TARJETAS DE INDICADORES (KPIS) -->
      <div class="admin-kpi-grid">
        <div class="admin-kpi-card kpi-blue">
          <div class="kpi-icon-wrap">🚀</div>
          <div class="kpi-content">
            <span class="kpi-label">TOTAL PROYECTOS</span>
            <div class="kpi-val">${totalProjects}</div>
            <div class="kpi-subtext positive">↑ +14% respecto al mes anterior</div>
          </div>
        </div>

        <div class="admin-kpi-card kpi-cyan">
          <div class="kpi-icon-wrap">⚡</div>
          <div class="kpi-content">
            <span class="kpi-label">PROYECTOS ACTIVOS</span>
            <div class="kpi-val">${activeProjects}</div>
            <div class="kpi-subtext">En desarrollo por estudiantes</div>
          </div>
        </div>

        <div class="admin-kpi-card kpi-emerald">
          <div class="kpi-icon-wrap">🏆</div>
          <div class="kpi-content">
            <span class="kpi-label">COMPLETADOS</span>
            <div class="kpi-val">${completedProjects}</div>
            <div class="kpi-subtext positive">Tasa de finalización alta</div>
          </div>
        </div>

        <div class="admin-kpi-card kpi-gold">
          <div class="kpi-icon-wrap">⏳</div>
          <div class="kpi-content">
            <span class="kpi-label">PENDIENTES / REVISIÓN</span>
            <div class="kpi-val">${pendingProjects}</div>
            <div class="kpi-subtext">Requieren evaluación</div>
          </div>
        </div>

        <div class="admin-kpi-card kpi-purple">
          <div class="kpi-icon-wrap">👥</div>
          <div class="kpi-content">
            <span class="kpi-label">USUARIOS REGISTRADOS</span>
            <div class="kpi-val">${totalUsers}</div>
            <div class="kpi-subtext positive">↑ 8 nuevos esta semana</div>
          </div>
        </div>

        <div class="admin-kpi-card kpi-navy">
          <div class="kpi-icon-wrap">🛡️</div>
          <div class="kpi-content">
            <span class="kpi-label">ADMINISTRADORES</span>
            <div class="kpi-val">${adminUsers}</div>
            <div class="kpi-subtext">Equipo docente y de control</div>
          </div>
        </div>
      </div>

      <!-- SEGUNDA SECCIÓN: ANALÍTICA VISUAL (GRÁFICOS SVG MODERNOS) -->
      <div class="admin-charts-grid">
        <!-- Gráfico de Donut de Estados -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>Distribución de Proyectos por Estado</h3>
              <p>Proporción de retos completados, en curso y pendientes.</p>
            </div>
            <span class="badge-tag">En vivo</span>
          </div>
          <div class="admin-donut-wrapper">
            <svg viewBox="0 0 36 36" class="admin-donut-svg">
              <path class="admin-donut-ring" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <!-- Segmento 1: Activos (Cyan) -->
              <path class="admin-donut-segment donut-seg-cyan" stroke-dasharray="${pActivePct}, 100" stroke-dashoffset="0" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <!-- Segmento 2: Completados (Emerald) -->
              <path class="admin-donut-segment donut-seg-emerald" stroke-dasharray="${pCompletedPct}, 100" stroke-dashoffset="-${pActivePct}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <!-- Segmento 3: Pendientes (Gold) -->
              <path class="admin-donut-segment donut-seg-gold" stroke-dasharray="${pPendingPct}, 100" stroke-dashoffset="-${pActivePct + pCompletedPct}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div class="admin-donut-center-text">
              <span class="donut-num">${totalProjects}</span>
              <span class="donut-sub">Total</span>
            </div>
          </div>
          <div class="admin-donut-legend">
            <div class="legend-item"><span class="dot cyan"></span> Activos (${pActivePct}%)</div>
            <div class="legend-item"><span class="dot emerald"></span> Completados (${pCompletedPct}%)</div>
            <div class="legend-item"><span class="dot gold"></span> Pendientes (${pPendingPct}%)</div>
          </div>
        </div>

        <!-- Gráfico de Distribución por Categorías -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>Participación por Categoría</h3>
              <p>Demanda académica en áreas del conocimiento.</p>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.AdminView.switchTab('categories')">Ver Todas</button>
          </div>
          <div class="admin-category-bars">
            ${categories.slice(0, 5).map(cat => {
              const count = projects.filter(p => p.category === cat.id || p.category === cat.name).length;
              const pct = totalProjects > 0 ? Math.round((count / totalProjects) * 100) : 0;
              return `
                <div class="cat-bar-item">
                  <div class="cat-bar-info">
                    <span class="cat-name">${cat.icon || '🏷️'} ${cat.name}</span>
                    <span class="cat-count"><b>${count}</b> proyectos (${pct}%)</span>
                  </div>
                  <div class="cat-bar-track">
                    <div class="cat-bar-fill" style="width: ${Math.max(pct, 6)}%; background: ${cat.color || '#00f5d4'};"></div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>

      <!-- TERCERA SECCIÓN: ACTIVIDAD RECIENTE Y ACCESOS RÁPIDOS -->
      <div class="admin-dashboard-split">
        <!-- Línea de Tiempo de Actividad Reciente -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>Actividad Reciente del Sistema</h3>
              <p>Eventos de proyectos, usuarios y moderación en vivo.</p>
            </div>
            <button class="btn btn-sm btn-outline" onclick="window.AdminView.switchTab('audit')">Registro Completo</button>
          </div>
          <div class="admin-timeline">
            ${this.getRecentActivityItems().slice(0, 5).map(item => `
              <div class="timeline-row">
                <div class="timeline-dot ${item.type}"></div>
                <div class="timeline-content">
                  <div class="timeline-title">${item.title}</div>
                  <div class="timeline-meta">${item.actor} • <span class="time">${item.time}</span></div>
                </div>
                <span class="badge-tag tag-${item.type}">${item.badge}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Accesos Rápidos Ejecutivos -->
        <div class="admin-card">
          <div class="admin-card-header">
            <div>
              <h3>Accesos Rápidos</h3>
              <p>Operaciones frecuentes de la administración.</p>
            </div>
          </div>
          <div class="admin-quick-actions-grid">
            <button class="quick-action-tile" onclick="window.AdminView.switchTab('projects')">
              <span class="tile-icon">🚀</span>
              <span class="tile-title">Moderar Proyectos</span>
              <span class="tile-desc">Aprobar, editar o destacar</span>
            </button>
            <button class="quick-action-tile" onclick="window.AdminView.openCreateUserModal()">
              <span class="tile-icon">👤</span>
              <span class="tile-title">Crear Administrador</span>
              <span class="tile-desc">Asignar nuevo rol docente</span>
            </button>
            <button class="quick-action-tile" onclick="window.AdminView.exportProjectsCSV()">
              <span class="tile-icon">📥</span>
              <span class="tile-title">Exportar Datos CSV</span>
              <span class="tile-desc">Descargar reporte completo</span>
            </button>
            <button class="quick-action-tile" onclick="window.AdminView.switchTab('settings')">
              <span class="tile-icon">🤖</span>
              <span class="tile-title">Banner de Proyectos</span>
              <span class="tile-desc">Personalizar portada y robot</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * 2. GESTIÓN VISUAL DE PROYECTOS (VISTA DE TARJETAS Y TABLA)
   */
  templateProjects() {
    const rawProjects = this.getRealProjects();
    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];
    const pendingApprovalCount = rawProjects.filter(p => p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review').length;

    // Filtrado
    let projects = rawProjects.filter(p => {
      // Filtro de texto
      if (this.projectFilter.search) {
        const q = this.projectFilter.search.toLowerCase();
        const matchTitle = (p.title || '').toLowerCase().includes(q);
        const matchDesc = (p.description || '').toLowerCase().includes(q);
        const matchAuthor = (p.creatorName || p.author || '').toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchAuthor) return false;
      }
      // Filtro de categoría
      if (this.projectFilter.category !== 'all') {
        if (p.category !== this.projectFilter.category) return false;
      }
      // Filtro de estado
      if (this.projectFilter.status === 'pending_approval') {
        return p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review';
      } else if (this.projectFilter.status === 'approved') {
        return p.approvalStatus === 'approved' || (p.publicationStatus === 'published' && p.approvalStatus !== 'pending');
      } else if (this.projectFilter.status === 'completed') {
        return p.status === 'completed' || p.stage === 'completed';
      } else if (this.projectFilter.status === 'in_progress') {
        return (p.status === 'in_progress' || p.status === 'active' || !p.status) && p.approvalStatus !== 'pending';
      } else if (this.projectFilter.status === 'review') {
        return p.status === 'review' || p.approvalStatus === 'pending';
      } else if (this.projectFilter.status === 'public') {
        return p.visibility !== 'private' && p.isPublic !== false;
      } else if (this.projectFilter.status === 'private') {
        return p.visibility === 'private' || p.isPublic === false;
      }
      return true;
    });

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Mis Proyectos</span>
      </div>

      <!-- HERO BANNER INSTITUCIONAL DEL ROBOT (SOLO PARA ADMINS CON BOTONES DE ACCIÓN) -->
      <div class="saas-hero-banner-wrapper" style="position: relative; width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 1.75rem; box-shadow: 0 12px 35px rgba(2, 40, 100, 0.16); background: #071739;">
        <img 
          id="mentix-admin-projects-hero-banner-img"
          src="${this.getHeroBannerUrl()}" 
          alt="Banner de Robot de Proyectos Mentix" 
          style="width: 100%; height: auto; max-height: 270px; display: block; object-fit: cover; filter: brightness(1.08) contrast(1.05); image-rendering: high-quality;" 
        />

        <!-- BOTÓN FLOTANTE EXCLUSIVO DE ADMINISTRADOR PARA CAMBIAR BANNER -->
        <div style="position: absolute; top: 1rem; right: 1.25rem; z-index: 10;">
          <button 
            type="button" 
            onclick="window.AdminView.switchTab('settings')" 
            title="Cambiar Banner de Proyectos y Banner de Robot (Exclusivo Administrador)"
            style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(7, 23, 57, 0.92); backdrop-filter: blur(10px); color: #00f5d4; border: 2px solid #00f5d4; border-radius: 9999px; padding: 0.45rem 1.15rem; font-size: 0.84rem; font-weight: 900; cursor: pointer; box-shadow: 0 0 20px rgba(0, 245, 212, 0.45); transition: all 0.25s ease;"
          >
            <span style="font-size: 1.1rem;">🤖</span>
            <span>Cambiar Banner (Modo Administrador)</span>
            <span style="background: #00f5d4; color: #071739; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 900;">ADMIN</span>
          </button>
        </div>

        <!-- BOTONES PRINCIPALES DE ACCIÓN INTEGRADOS EN EL BANNER -->
        <div class="mentix-banner-action-row" style="position: absolute; left: 3.5%; bottom: 8.5%; z-index: 5; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
          
          <button 
            type="button" 
            onclick="window.ProjectsView ? window.ProjectsView.openJoinProjectModal() : window.appRouter.navigate('projects', { viewMode: 'join' })" 
            title="Unirse a un código"
            class="mentix-hero-action-btn"
            style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #f72585 0%, #b5179e 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(247, 37, 133, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
          >
            <span style="font-size: 1rem;">🎮</span>
            <span>Unirse a un código</span>
          </button>

          <button 
            type="button" 
            onclick="window.appRouter.navigate('projects', { viewMode: 'create' })" 
            title="Crear Proyecto"
            class="mentix-hero-action-btn"
            style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #00d2ff 0%, #0077ff 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(0, 180, 255, 0.48); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
          >
            <span style="font-size: 1rem;">➕</span>
            <span>Crear Proyecto</span>
          </button>

          <button 
            type="button" 
            onclick="window.ProjectsView ? window.ProjectsView.openCreateCodeModal() : window.AdminView.showToast('Generador de código disponible')" 
            title="Crear Código de Proyecto"
            class="mentix-hero-action-btn"
            style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
          >
            <span style="font-size: 1rem;">🔑</span>
            <span>Crear Código</span>
          </button>

          <button 
            type="button" 
            onclick="window.appRouter.openCategoryModal ? window.appRouter.openCategoryModal() : window.AdminView.switchTab('categories')" 
            title="Categorías"
            class="mentix-hero-action-btn"
            style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
          >
            <span style="font-size: 1rem;">🏷️</span>
            <span>Categorías</span>
          </button>

        </div>
      </div>

      <!-- Header del Módulo -->
      <div class="admin-section-header">
        <div>
          <h2>Mis Proyectos</h2>
          <p>Supervisa, administra y gestiona exclusivamente los proyectos educativos de la plataforma.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.exportProjectsCSV()">
            <span>📥</span> Exportar CSV
          </button>
          <button class="btn btn-cyan" onclick="window.appRouter.navigate('projects', { viewMode: 'create' })">
            <span>➕</span> Crear Proyecto
          </button>
        </div>
      </div>

      <!-- Barra de Filtros y Búsqueda Superior -->
      <div class="admin-filter-bar">
        <div class="filter-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar por título, estudiante o tema..." value="${this.projectFilter.search}" oninput="window.AdminView.setProjectSearch(this.value)">
        </div>

        <div class="filter-select-box">
          <select onchange="window.AdminView.setProjectCategoryFilter(this.value)">
            <option value="all" ${this.projectFilter.category === 'all' ? 'selected' : ''}>Todas las categorías</option>
            ${categories.map(c => `
              <option value="${c.id}" ${this.projectFilter.category === c.id ? 'selected' : ''}>${c.icon || '🏷️'} ${c.name}</option>
            `).join('')}
          </select>
        </div>

        <!-- Filtros de Píldoras -->
        <div class="filter-pills">
          <button class="filter-pill ${this.projectFilter.status === 'all' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('all')">Todos (${rawProjects.length})</button>
          <button class="filter-pill ${this.projectFilter.status === 'pending_approval' ? 'active' : ''}" style="${pendingApprovalCount > 0 ? 'background: rgba(245, 158, 11, 0.22); border: 1.5px solid #f59e0b; color: #fbbf24; font-weight: 800;' : ''}" onclick="window.AdminView.setProjectStatusFilter('pending_approval')">
            ⏳ Pendientes (${pendingApprovalCount})
          </button>
          <button class="filter-pill ${this.projectFilter.status === 'approved' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('approved')">✔ Autorizados</button>
          <button class="filter-pill ${this.projectFilter.status === 'in_progress' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('in_progress')">En Proceso</button>
          <button class="filter-pill ${this.projectFilter.status === 'completed' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('completed')">Completados</button>
          <button class="filter-pill ${this.projectFilter.status === 'public' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('public')">Públicos</button>
          <button class="filter-pill ${this.projectFilter.status === 'private' ? 'active' : ''}" onclick="window.AdminView.setProjectStatusFilter('private')">Privados</button>
        </div>

        <!-- Alternador de Vista (Tarjetas / Tabla) -->
        <div class="view-mode-toggle">
          <button class="view-mode-btn ${this.projectFilter.viewMode === 'cards' ? 'active' : ''}" title="Vista en Tarjetas" onclick="window.AdminView.setProjectViewMode('cards')">
            <span>🎴</span>
          </button>
          <button class="view-mode-btn ${this.projectFilter.viewMode === 'table' ? 'active' : ''}" title="Vista en Tabla" onclick="window.AdminView.setProjectViewMode('table')">
            <span>📋</span>
          </button>
        </div>
      </div>

      <!-- CONTENIDO DE PROYECTOS -->
      ${projects.length === 0 ? `
        <div class="admin-empty-state">
          <div class="empty-icon">📂</div>
          <h3>No se encontraron proyectos</h3>
          <p>Intenta ajustar tus filtros de búsqueda o categoría seleccionada.</p>
          <button class="btn btn-outline" onclick="window.AdminView.resetProjectFilters()">Restablecer filtros</button>
        </div>
      ` : (this.projectFilter.viewMode === 'cards' ? this.renderProjectCardsGrid(projects) : this.renderProjectsTable(projects))}
    `;
  },

  /**
   * Vista de Cuadrícula de Tarjetas de Proyectos (Diseño Idéntico a Imagen 2)
   */
  renderProjectCardsGrid(projects) {
    return `
      <div class="admin-projects-grid">
        ${projects.map(p => {
          const isPendingApproval = p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review';
          const isApproved = p.approvalStatus === 'approved' || (p.publicationStatus === 'published' && !isPendingApproval);
          const isCompleted = isApproved && (p.status === 'completed' || p.stage === 'completed');
          const coverImage = p.image || p.cover || p.banner || 'assets/student_create_bg.jpg';
          const title = p.title || 'Gobierno de Datos en la Práctica';
          const description = p.description || 'Metodologías ágiles para la gobernanza moderna de información y toma de decisiones.';
          
          let dateStr = '12 Abr 2025';
          if (p.createdAt) {
            try {
              const d = new Date(p.createdAt);
              if (!isNaN(d.getTime())) {
                dateStr = d.toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
              }
            } catch(e) {}
          }
          
          const participants = p.participantsCount || (p.collaborators ? p.collaborators.length : null) || 24;
          const rating = p.rating || '4.8';

          return `
            <div class="admin-project-card">
              <!-- Portada con Badges y Acciones Flotantes Superiores (Idéntico a Imagen 2) -->
              <div class="admin-card-banner">
                <img src="${coverImage}" alt="${title}" class="admin-card-cover-img" onerror="this.onerror=null; this.src='assets/student_create_bg.jpg';">
                
                <div class="admin-card-badge-row">
                  <!-- Badge Izquierdo de Estado -->
                  <div class="admin-card-status-badge ${isPendingApproval ? 'pending' : (isCompleted ? 'completed' : 'in-progress')}" style="${isPendingApproval ? 'background: #f59e0b; color: #07152b; border: 1.5px solid #fbbf24; font-weight: 900; box-shadow: 0 0 10px rgba(245, 158, 11, 0.45);' : ''}">
                    <span>${isPendingApproval ? '⏳' : (isCompleted ? '✔' : '⚡')}</span>
                    <span>${isPendingApproval ? 'Pendiente Autorización' : (isCompleted ? 'Completado' : 'En Proceso')}</span>
                  </div>

                  <!-- Botones Flotantes Derechos -->
                  <div class="admin-card-top-actions">
                    <button class="btn-card-robot-banner" title="Personalizar banner del robot" onclick="window.AdminView.switchTab('design')">
                      <span>🤖</span> Banner
                    </button>
                    <button class="btn-card-review" title="Revisar Landing Page y Autorización" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">
                      <span>🔍</span> Revisar
                    </button>
                    <button class="btn-card-edit" title="Editar proyecto" onclick="window.AdminView.openEditProjectModal('${p.id}')">
                      ✏️
                    </button>
                    <button class="btn-card-trash" title="Eliminar proyecto" onclick="window.AdminView.deleteProject('${p.id}')">
                      🗑️
                    </button>
                    <button class="btn-card-more" title="Editar y más opciones" onclick="window.AdminView.openEditProjectModal('${p.id}')">
                      •••
                    </button>
                  </div>
                </div>
              </div>

              <!-- Contenido de la Tarjeta -->
              <div class="admin-card-body">
                <h3 class="admin-card-title" title="${title}">${title}</h3>
                <p class="admin-card-desc">${description}</p>

                <!-- Fila de Metadatos: Fecha, Participantes y Puntuación -->
                <div class="admin-card-meta-row">
                  <div class="meta-item">
                    <span class="meta-icon">📅</span>
                    <span class="meta-text">${dateStr}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">👥</span>
                    <span class="meta-text">${participants}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-icon">⭐</span>
                    <span class="meta-text">${rating}</span>
                  </div>
                </div>

                <!-- Botones Inferiores: Ver Detalles, Revisar y Compartir -->
                <div class="admin-card-actions-row">
                  <button class="btn-card-details" onclick="window.AdminView.openProjectDetailModal('${p.id}')">
                    Ver Detalles →
                  </button>
                  <button class="btn-card-review-bottom" title="Revisar Landing Page para Autorización" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">
                    <span>🔍</span> Revisar
                  </button>
                  <button class="btn-card-share" onclick="window.AdminView.shareProject('${p.id}')">
                    <span>Compartir</span>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <circle cx="18" cy="5" r="3"></circle>
                      <circle cx="6" cy="12" r="3"></circle>
                      <circle cx="18" cy="19" r="3"></circle>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * Vista de Tabla Moderna de Proyectos
   */
  renderProjectsTable(projects) {
    return `
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Proyecto</th>
              <th>Estudiante Creador</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Visibilidad</th>
              <th>Fecha</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${projects.map(p => {
              const isPublic = p.visibility !== 'private';
              const isCompleted = p.status === 'completed' || p.stage === 'completed';
              const creatorName = p.creatorName || p.author || 'Estudiante';
              const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : 'Reciente';

              return `
                <tr>
                  <td>
                    <div class="table-project-cell">
                      <img src="${p.image || 'assets/student_create_bg.jpg'}" class="table-thumb" onerror="this.onerror=null; this.src='assets/student_create_bg.jpg';">
                      <div class="table-project-meta">
                        <strong class="title">${p.title}</strong>
                        <span class="subtitle">${p.stages ? p.stages.length + ' etapas' : '1 reto'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="table-user-cell">
                      <span>👤</span>
                      <span>${creatorName}</span>
                    </div>
                  </td>
                  <td><span class="table-cat-badge">${p.category || 'General'}</span></td>
                  <td>
                    <span class="badge-status ${p.approvalStatus === 'pending' || p.status === 'review' ? 'status-review' : (isCompleted ? 'status-completed' : 'status-in-progress')}" style="${p.approvalStatus === 'pending' || p.status === 'review' ? 'background: #f59e0b; color: #07152b; font-weight: 800;' : ''}">
                      ${p.approvalStatus === 'pending' || p.status === 'review' ? '⏳ Pendiente' : (isCompleted ? '🏆 Autorizado' : '⚡ En Proceso')}
                    </span>
                  </td>
                  <td>
                    <span class="badge-visibility ${isPublic ? 'vis-public' : 'vis-private'}">
                      ${isPublic ? '🌐 Público' : '🔒 Privado'}
                    </span>
                  </td>
                  <td class="table-date">${dateStr}</td>
                  <td style="text-align: right;">
                    <div class="table-actions">
                      <button class="btn-icon" title="Revisar Landing Page y Autorización" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">🔍</button>
                      <button class="btn-icon" title="Editar proyecto" onclick="window.AdminView.openEditProjectModal('${p.id}')">✏️</button>
                      <button class="btn-icon" title="Ver detalle" onclick="window.AdminView.openProjectDetailModal('${p.id}')">👁️</button>
                      <button class="btn-icon" title="Alternar visibilidad" onclick="window.AdminView.toggleProjectVisibility('${p.id}')">
                        ${isPublic ? '🔒' : '🌐'}
                      </button>
                      <button class="btn-icon danger" title="Eliminar" onclick="window.AdminView.deleteProject('${p.id}')">🗑️</button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 3. CONFIGURACIÓN DE ROLES & USUARIOS
   */
  templateRoles() {
    const rawUsers = (window.appState && window.appState.users) ? window.appState.users : [];
    
    // Filtro
    let users = rawUsers.filter(u => {
      if (this.userFilter.search) {
        const q = this.userFilter.search.toLowerCase();
        const matchName = (u.name || '').toLowerCase().includes(q);
        const matchEmail = (u.email || '').toLowerCase().includes(q);
        if (!matchName && !matchEmail) return false;
      }
      if (this.userFilter.role !== 'all') {
        if (u.role !== this.userFilter.role) return false;
      }
      if (this.userFilter.status === 'blocked') {
        return u.isBlocked === true;
      } else if (this.userFilter.status === 'active') {
        return !u.isBlocked;
      }
      return true;
    });

    const adminCount = rawUsers.filter(u => u.role === 'admin').length;
    const teacherCount = rawUsers.filter(u => u.role === 'teacher').length;
    const studentCount = rawUsers.filter(u => u.role === 'student' || !u.role).length;

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Configuración de Roles & Permisos</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Configuración de Roles & Permisos Institucionales</h2>
          <p>Administra las cuentas de estudiantes, docentes y administradores con control de acceso granular y asignación inmediata de roles.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-cyan" onclick="window.AdminView.openCreateUserModal()">
            <span>➕</span> Crear Administrador / Docente
          </button>
        </div>
      </div>

      <!-- Tarjetas de Roles Principales -->
      <div class="admin-roles-overview-grid">
        <div class="admin-role-card role-card-admin">
          <div class="role-card-top">
            <span class="role-card-icon">🛡️</span>
            <span class="role-card-badge">${adminCount} Cuentas</span>
          </div>
          <h3>Super Administrador</h3>
          <p>Control total del backend, personalización del robot y banners, gestión de usuarios, recursos y auditoría completa.</p>
          <ul class="role-caps-list">
            <li>✅ Acceso exclusivo a panel administrativo</li>
            <li>✅ Cambio de banner de robot & colores</li>
            <li>✅ Moderación y eliminación global</li>
          </ul>
        </div>

        <div class="admin-role-card role-card-teacher">
          <div class="role-card-top">
            <span class="role-card-icon">👨‍🏫</span>
            <span class="role-card-badge">${teacherCount} Cuentas</span>
          </div>
          <h3>Docente / Mentor</h3>
          <p>Creación y asignación de retos académicos, revisión de proyectos de estudiantes y evaluación con rúbricas oficiales.</p>
          <ul class="role-caps-list">
            <li>✅ Gestión de proyectos y retos de curso</li>
            <li>✅ Rúbricas y retroalimentación didáctica</li>
            <li>✅ Visualización de analítica de alumnos</li>
          </ul>
        </div>

        <div class="admin-role-card role-card-student">
          <div class="role-card-top">
            <span class="role-card-icon">🎓</span>
            <span class="role-card-badge">${studentCount} Cuentas</span>
          </div>
          <h3>Estudiante Creador</h3>
          <p>Creación de proyectos multimedia interactivos (públicos y privados), diapositivas, videos y documentos con IA.</p>
          <ul class="role-caps-list">
            <li>✅ Creación de proyectos en 4 formatos</li>
            <li>✅ Publicación y Landing Pages públicas</li>
            <li>✅ Participación en desafíos y XP</li>
          </ul>
        </div>
      </div>

      <!-- Matriz de Permisos del Sistema -->
      <div class="admin-card" style="margin-bottom: 1.5rem;">
        <div class="admin-card-header">
          <div>
            <h3>Matriz de Permisos por Rol</h3>
            <p>Capacidades autorizadas en cada módulo de Mentix según el tipo de cuenta autenticada.</p>
          </div>
          <span class="badge-tag tag-cyan">Políticas de Seguridad Activas</span>
        </div>
        <div class="admin-permissions-table-wrap">
          <table class="admin-permissions-table">
            <thead>
              <tr>
                <th>Capacidad / Módulo</th>
                <th style="text-align: center;">🎓 Estudiante</th>
                <th style="text-align: center;">👨‍🏫 Docente</th>
                <th style="text-align: center;">🛡️ Administrador</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Crear proyectos interactivos</strong> (Públicos / Privados)</td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
              </tr>
              <tr>
                <td><strong>Editor de Diapositivas, Videos y Documentos</strong></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Sí</span></td>
              </tr>
              <tr>
                <td><strong>Modificar Banner de Robot de Proyectos y Temas de Diseño</strong></td>
                <td style="text-align: center;"><span class="perm-no">❌ No</span></td>
                <td style="text-align: center;"><span class="perm-no">❌ No</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Exclusivo</span></td>
              </tr>
              <tr>
                <td><strong>Gestionar Biblioteca de Recursos y Plantillas</strong></td>
                <td style="text-align: center;"><span class="perm-readonly">👁️ Solo Descarga</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Crear Guías</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Control Total</span></td>
              </tr>
              <tr>
                <td><strong>Asignar Roles, Suspender Cuentas y Crear Administradores</strong></td>
                <td style="text-align: center;"><span class="perm-no">❌ No</span></td>
                <td style="text-align: center;"><span class="perm-no">❌ No</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Exclusivo</span></td>
              </tr>
              <tr>
                <td><strong>Exportar Reportes Globales y Registros de Auditoría</strong></td>
                <td style="text-align: center;"><span class="perm-no">❌ No</span></td>
                <td style="text-align: center;"><span class="perm-readonly">📊 Reporte Curso</span></td>
                <td style="text-align: center;"><span class="perm-yes">✅ Exclusivo</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Barra de Filtros del Directorio -->
      <div class="admin-filter-bar">
        <div class="filter-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar usuario por nombre o correo electrónico..." value="${this.userFilter.search}" oninput="window.AdminView.setUserSearch(this.value)">
        </div>

        <div class="filter-pills">
          <button class="filter-pill ${this.userFilter.role === 'all' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('all')">Todos (${rawUsers.length})</button>
          <button class="filter-pill ${this.userFilter.role === 'admin' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('admin')">Administradores (${adminCount})</button>
          <button class="filter-pill ${this.userFilter.role === 'teacher' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('teacher')">Docentes (${teacherCount})</button>
          <button class="filter-pill ${this.userFilter.role === 'student' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('student')">Estudiantes (${studentCount})</button>
          <button class="filter-pill ${this.userFilter.status === 'blocked' ? 'active' : ''}" onclick="window.AdminView.setUserStatusFilter('blocked')">Bloqueados</button>
        </div>
      </div>

      <!-- Tabla de Usuarios y Cambio Directo de Rol -->
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo Institucional</th>
              <th>Rol Actual (Asignación Rápida)</th>
              <th>Estado</th>
              <th>Nivel / XP</th>
              <th>Último Acceso</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const isBlocked = !!u.isBlocked;

              return `
                <tr>
                  <td>
                    <div class="table-user-cell">
                      <div class="user-avatar-circle">${u.avatar || '👤'}</div>
                      <div class="user-meta">
                        <strong class="name">${u.name}</strong>
                        <span class="handle">@${(u.name || '').toLowerCase().replace(/\s+/g, '')}</span>
                      </div>
                    </div>
                  </td>
                  <td><span class="table-email">${u.email || 'sin-correo@mentix.edu'}</span></td>
                  <td>
                    <select class="admin-role-select" onchange="window.AdminView.changeUserRole('${u.id}', this.value)">
                      <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>🛡️ Administrador</option>
                      <option value="teacher" ${u.role === 'teacher' ? 'selected' : ''}>👨‍🏫 Docente</option>
                      <option value="student" ${u.role === 'student' || !u.role ? 'selected' : ''}>🎓 Estudiante</option>
                    </select>
                  </td>
                  <td>
                    <span class="badge-status ${isBlocked ? 'status-blocked' : 'status-active'}">
                      ${isBlocked ? '🚫 Bloqueado' : '🟢 Activo'}
                    </span>
                  </td>
                  <td>
                    <div class="xp-pill">
                      <span>⭐ Nvl ${u.level || 1}</span>
                      <small>(${u.xp || 0} XP)</small>
                    </div>
                  </td>
                  <td class="table-date">${u.lastLogin || 'Hoy'}</td>
                  <td style="text-align: right;">
                    <div class="table-actions">
                      <button class="btn-icon ${isBlocked ? 'success' : 'warning'}" title="${isBlocked ? 'Desbloquear acceso' : 'Suspender acceso'}" onclick="window.AdminView.toggleUserBlock('${u.id}')">
                        ${isBlocked ? '🔓' : '🔒'}
                      </button>
                      <button class="btn-icon danger" title="Eliminar cuenta" onclick="window.AdminView.deleteUser('${u.id}')">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * Alias de compatibilidad
   */
  templateUsers() {
    return this.templateRoles();
  },

  /**
   * 4. GESTIÓN DE RECURSOS DIDÁCTICOS Y PLANTILLAS
   */
  templateResources() {
    this.ensureResources();
    const resources = this.getResources();
    
    // Filtro
    let list = resources.filter(r => {
      if (this.resourceFilter.search) {
        const q = this.resourceFilter.search.toLowerCase();
        const mTitle = (r.title || '').toLowerCase().includes(q);
        const mDesc = (r.description || '').toLowerCase().includes(q);
        if (!mTitle && !mDesc) return false;
      }
      if (this.resourceFilter.type !== 'all') {
        if (r.type !== this.resourceFilter.type) return false;
      }
      return true;
    });

    const totalCount = resources.length;
    const slidesCount = resources.filter(r => r.type === 'presentation').length;
    const docsCount = resources.filter(r => r.type === 'document').length;
    const assetsCount = resources.filter(r => r.type === 'assets' || r.type === 'multimedia').length;

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Recursos Didácticos & Plantillas</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Biblioteca de Recursos & Plantillas Didácticas</h2>
          <p>Gestiona plantillas de diapositivas oficiales, guías en PDF, rúbricas de evaluación y kits de assets para creadores.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.resetDefaultResources()">
            <span>🔄</span> Restaurar Oficiales
          </button>
          <button class="btn btn-cyan" onclick="window.AdminView.openAddResourceModal()">
            <span>➕</span> Subir / Agregar Recurso
          </button>
        </div>
      </div>

      <!-- KPIs de Recursos -->
      <div class="admin-kpi-grid" style="margin-bottom: 1.5rem;">
        <div class="admin-kpi-card">
          <div class="kpi-icon-box cyan"><span>📦</span></div>
          <div class="kpi-content">
            <span class="kpi-label">Total Recursos Activos</span>
            <div class="kpi-value-row"><span class="kpi-value">${totalCount}</span></div>
            <span class="kpi-trend positive">Disponibles en el sistema</span>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="kpi-icon-box purple"><span>📊</span></div>
          <div class="kpi-content">
            <span class="kpi-label">Plantillas Diapositivas</span>
            <div class="kpi-value-row"><span class="kpi-value">${slidesCount}</span></div>
            <span class="kpi-trend positive">Para exposiciones y pitch</span>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="kpi-icon-box gold"><span>📝</span></div>
          <div class="kpi-content">
            <span class="kpi-label">Guías & Rúbricas Oficiales</span>
            <div class="kpi-value-row"><span class="kpi-value">${docsCount}</span></div>
            <span class="kpi-trend positive">Documentos pedagógicos</span>
          </div>
        </div>

        <div class="admin-kpi-card">
          <div class="kpi-icon-box green"><span>🎨</span></div>
          <div class="kpi-content">
            <span class="kpi-label">Kits de Assets & Multimedia</span>
            <div class="kpi-value-row"><span class="kpi-value">${assetsCount}</span></div>
            <span class="kpi-trend positive">Ilustraciones y vectores</span>
          </div>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="admin-filter-bar">
        <div class="filter-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar recurso por título o descripción..." value="${this.resourceFilter.search}" oninput="window.AdminView.setResourceSearch(this.value)">
        </div>

        <div class="filter-pills">
          <button class="filter-pill ${this.resourceFilter.type === 'all' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('all')">Todos (${totalCount})</button>
          <button class="filter-pill ${this.resourceFilter.type === 'presentation' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('presentation')">Diapositivas (${slidesCount})</button>
          <button class="filter-pill ${this.resourceFilter.type === 'document' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('document')">Guías & Rúbricas (${docsCount})</button>
          <button class="filter-pill ${this.resourceFilter.type === 'assets' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('assets')">Assets Gráficos</button>
          <button class="filter-pill ${this.resourceFilter.type === 'multimedia' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('multimedia')">Multimedia</button>
          <button class="filter-pill ${this.resourceFilter.type === 'links' ? 'active' : ''}" onclick="window.AdminView.setResourceTypeFilter('links')">APIs & Enlaces</button>
        </div>
      </div>

      <!-- Cuadrícula de Tarjetas de Recursos -->
      <div class="admin-resources-grid">
        ${list.map(r => `
          <div class="admin-resource-card">
            <div class="resource-card-top">
              <div class="resource-icon-badge">${r.icon || '📄'}</div>
              <div class="resource-badges-wrap">
                <span class="badge-tag tag-cyan">${r.category || 'Recurso'}</span>
                <span class="badge-tag tag-purple">${r.audience || 'Todos'}</span>
              </div>
            </div>

            <h3 class="resource-title">${r.title}</h3>
            <p class="resource-desc">${r.description || 'Recurso didáctico integrado en Mentix Academy.'}</p>

            <div class="resource-meta-row">
              <span class="resource-format">📁 ${r.format || 'Formato Mentix'}</span>
              <span class="resource-date">🕒 ${r.updatedAt || 'Reciente'}</span>
            </div>

            <div class="resource-actions-bar">
              <button class="btn btn-sm btn-cyan" onclick="window.AdminView.downloadResource('${r.id}')">
                <span>📥</span> Descargar / Usar
              </button>
              <button class="btn-icon danger" title="Eliminar recurso" onclick="window.AdminView.deleteResource('${r.id}')">
                🗑️
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * 4. CATEGORÍAS ACADÉMICAS
   */
  templateCategories() {
    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];
    const projects = this.getRealProjects();

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Categorías Académicas</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Estructura de Categorías & Áreas</h2>
          <p>Organiza las materias y disciplinas disponibles para los retos y proyectos educativos.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-cyan" onclick="window.AdminView.openCreateCategoryModal()">
            <span>➕</span> Nueva Categoría
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Categorías -->
      <div class="admin-categories-grid">
        ${categories.map(c => {
          const projectCount = projects.filter(p => p.category === c.id || p.category === c.name).length;
          return `
            <div class="admin-category-card">
              <div class="cat-card-header">
                <div class="cat-icon-box" style="background: ${c.color || '#00f5d4'}22; color: ${c.color || '#00f5d4'};">
                  <span>${c.icon || '🏷️'}</span>
                </div>
                <span class="badge-tag">${projectCount} Proyectos</span>
              </div>
              <h3 class="cat-title">${c.name}</h3>
              <p class="cat-desc">${c.description || 'Área de conocimiento integrada en la plataforma Mentix.'}</p>
              <div class="cat-footer">
                <span class="cat-id">ID: <code>${c.id}</code></span>
                <button class="btn btn-sm btn-outline" onclick="window.AdminView.filterBySpecificCategory('${c.id}')">Ver Proyectos</button>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  /**
   * 5. REPORTES Y ANALÍTICA
   */
  templateReports() {
    const projects = this.getRealProjects();
    const users = (window.appState && window.appState.users) ? window.appState.users : [];

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Centro de Reportes & Exportación</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Informes Ejecutivos & Estadísticas</h2>
          <p>Genera resúmenes ejecutivos imprimibles o descarga datos en formato CSV y JSON.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.print()">
            <span>🖨️</span> Imprimir Reporte
          </button>
          <button class="btn btn-cyan" onclick="window.AdminView.exportProjectsCSV()">
            <span>📥</span> Descargar CSV
          </button>
        </div>
      </div>

      <!-- Resumen de Métricas -->
      <div class="admin-reports-summary-grid">
        <div class="admin-card report-kpi">
          <h4>Índice de Retención Estudiantil</h4>
          <div class="big-stat">94.8%</div>
          <p>Estudiantes que completan su primer proyecto.</p>
        </div>
        <div class="admin-card report-kpi">
          <h4>Proyectos Colaborativos</h4>
          <div class="big-stat">${projects.length}</div>
          <p>Iniciativas registradas en el ciclo lectivo actual.</p>
        </div>
        <div class="admin-card report-kpi">
          <h4>Presentaciones Multimedia</h4>
          <div class="big-stat">${Math.max(1, Math.round(projects.length * 0.75))}</div>
          <p>Proyectos con diapositivas o videos integrados.</p>
        </div>
      </div>

      <!-- Ranking de Proyectos Más Activos -->
      <div class="admin-card" style="margin-top: 1.5rem;">
        <div class="admin-card-header">
          <div>
            <h3>Proyectos con Mayor Actividad Académica</h3>
            <p>Listado de proyectos con mayor número de interacciones y avances.</p>
          </div>
        </div>
        <div class="admin-ranking-list">
          ${projects.slice(0, 5).map((p, idx) => `
            <div class="ranking-item">
              <span class="ranking-position">#${idx + 1}</span>
              <div class="ranking-info">
                <strong>${p.title}</strong>
                <span>Por ${p.creatorName || p.author || 'Estudiante'} • Categoría: ${p.category || 'General'}</span>
              </div>
              <span class="badge-tag tag-cyan">Destacado</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  /**
   * 6. AUDITORÍA DEL SISTEMA
   */
  templateAudit() {
    const logs = this.getAuditLogs();

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Registro de Auditoría & Seguridad</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Auditoría & Trazabilidad del Sistema</h2>
          <p>Historial inmutable de acciones administrativas, cambios de estado y accesos al panel.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.clearAuditLogs()">
            <span>🧹</span> Limpiar Historial
          </button>
        </div>
      </div>

      <!-- Tabla de Auditoría -->
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Fecha y Hora</th>
              <th>Administrador</th>
              <th>Acción Realizada</th>
              <th>Módulo Afectado</th>
              <th>Origen / Dispositivo</th>
              <th>Resultado</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td class="table-date">${log.timestamp}</td>
                <td>
                  <div class="table-user-cell">
                    <span>🛡️</span>
                    <strong>${log.admin}</strong>
                  </div>
                </td>
                <td><span class="audit-action">${log.action}</span></td>
                <td><span class="audit-module badge-tag">${log.module}</span></td>
                <td><code>${log.ip || '192.168.1.1 (Local)'}</code></td>
                <td>
                  <span class="badge-status ${log.status === 'success' ? 'status-active' : 'status-blocked'}">
                    ${log.status === 'success' ? 'Éxito' : 'Advertencia'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  /**
   * 7. AJUSTES DEL DISEÑO (BANNER DE ROBOT, TEMAS, NEÓN)
   */
  templateDesign() {
    const heroBanner = localStorage.getItem('mentix_admin_hero_banner') || localStorage.getItem('mentix_projects_hero_banner') || 'assets/projects_ui/robot_hero_banner.png';
    const s = this.getSavedDesign();

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Ajustes del Diseño & Personalización</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Ajustes del Diseño & Personalización Visual (Exclusivo Administrador)</h2>
          <p>Personaliza el banner del robot de proyectos, temas cromáticos, estilos visuales y colores de acento neón de Mentix.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.resetDesignDefaults()">
            <span>🔄</span> Restablecer Todo
          </button>
          <button class="btn btn-cyan" onclick="window.AdminView.saveDesignSettings()">
            <span>💾</span> Guardar y Aplicar Cambios
          </button>
        </div>
      </div>
            <span>💾</span> Guardar Cambios
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Configuración -->
      <div class="admin-settings-grid">
        
        <!-- Tarjeta 1: Banner Hero del Robot para Proyectos -->
        <div class="admin-card settings-card">
          <div class="admin-card-header">
            <div>
              <h3>🤖 Banner del Robot de Proyectos (Modo Administrador)</h3>
              <p>Esta imagen se proyecta como fondo superior en la sección pública de proyectos.</p>
            </div>
            <span class="badge-tag tag-cyan">Exclusivo Admin</span>
          </div>
          
          <div class="admin-banner-preview-box">
            <img src="${heroBanner}" id="admin-banner-preview-img" alt="Banner de Proyectos">
          </div>

          <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.75rem;">
            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">Seleccionar Imagen Predefinida del Robot:</label>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-sm btn-outline" onclick="window.AdminView.setRobotBannerPreset('assets/projects_ui/robot_hero_banner.png')">
                🤖 Robot Cyber Educador
              </button>
              <button class="btn btn-sm btn-outline" onclick="window.AdminView.setRobotBannerPreset('assets/student_create_bg.jpg')">
                🌌 Espacio Futurista
              </button>
            </div>

            <label style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); margin-top: 0.5rem;">O Subir Imagen Personalizada (Archivo):</label>
            <input type="file" id="admin-banner-file-input" accept="image/*" class="admin-file-input" onchange="window.AdminView.handleCustomBannerUpload(event)">
          </div>
        </div>

        <!-- Tarjeta 2: Temas de Fondo de la Plataforma -->
        <div class="admin-card settings-card">
          <div class="admin-card-header">
            <div>
              <h3>🎨 Temas de Fondo & Estética Global</h3>
              <p>Cambia el ambiente cromático de toda la plataforma educativa.</p>
            </div>
          </div>

          <div class="theme-options-grid">
            ${[
              { id: 'cyber', name: 'Cyber Neon', desc: 'Espacio oscuro con neón' },
              { id: 'matrix', name: 'Matrix Emerald', desc: 'Verde cibernético' },
              { id: 'ocean', name: 'Deep Ocean', desc: 'Azul náutico moderno' },
              { id: 'sunset', name: 'Neon Sunset', desc: 'Púrpura y dorado' },
              { id: 'amoled', name: 'Amoled Black', desc: 'Negro puro 100%' },
              { id: 'light', name: 'Académico Claro', desc: 'Blanco y gris suave' }
            ].map(t => `
              <div class="theme-option-card ${s.bgTheme === t.id ? 'active' : ''}" onclick="window.AdminView.selectTheme('${t.id}')">
                <div class="theme-option-title">${t.name}</div>
                <div class="theme-option-sub">${t.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Tarjeta 3: Color de Acento Neón -->
        <div class="admin-card settings-card">
          <div class="admin-card-header">
            <div>
              <h3>⚡ Color de Acento Neón</h3>
              <p>Color principal de botones, bordes luminosos e indicadores.</p>
            </div>
          </div>

          <div class="accent-colors-row">
            ${[
              { id: 'cyan', hex: '#00f5d4', label: 'Cyan Eléctrico' },
              { id: 'magenta', hex: '#f72585', label: 'Magenta Neón' },
              { id: 'gold', hex: '#ffb703', label: 'Oro Solar' },
              { id: 'emerald', hex: '#06d6a0', label: 'Esmeralda' },
              { id: 'purple', hex: '#a855f7', label: 'Violeta Digital' },
              { id: 'blue', hex: '#3b82f6', label: 'Azul Real' }
            ].map(a => `
              <button class="accent-btn ${s.accentColor === a.id ? 'active' : ''}" style="background: ${a.hex};" title="${a.label}" onclick="window.AdminView.selectAccent('${a.id}')"></button>
            `).join('')}
          </div>
        </div>

        <!-- Tarjeta 4: Respaldo y Restauración de Base de Datos -->
        <div class="admin-card settings-card">
          <div class="admin-card-header">
            <div>
              <h3>💾 Seguridad & Base de Datos</h3>
              <p>Exporta o importa copias de seguridad de usuarios y proyectos.</p>
            </div>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="window.AdminView.exportFullDatabase()">
              <span>💾</span> Exportar Base Completa JSON
            </button>
            <button class="btn btn-danger" onclick="window.AdminView.resetFactoryData()">
              <span>⚠️</span> Restaurar Valores de Fábrica
            </button>
          </div>
        </div>

      </div>
    `;
  },

  /**
   * Alias de compatibilidad
   */
  templateSettings() {
    return this.templateDesign();
  },

  // ==========================================
  // MODALES DEL SISTEMA (PROYECTOS Y USUARIOS)
  // ==========================================

  /**
   * Abre el Modal de Detalle Profesional de Proyecto con 4 Pestañas
   */
  openProjectDetailModal(projectId) {
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    const p = projects.find(item => item.id === projectId);
    if (!p) return;

    const isPendingApproval = p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review';
    const isApproved = p.approvalStatus === 'approved' || (p.publicationStatus === 'published' && !isPendingApproval);

    this.selectedProjectForModal = p;
    this.activeModalTab = 'general';

    const modalRoot = document.getElementById('admin-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="admin-modal-overlay" onclick="window.AdminView.handleModalBackdropClick(event)">
        <div class="admin-modal-window modal-lg">
          
          <!-- Modal Header -->
          <div class="admin-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">🚀</span>
              <div>
                <h3>${p.title}</h3>
                <span class="modal-sub">ID: ${p.id} • Categoría: ${p.category || 'General'}</span>
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <button class="btn btn-sm btn-cyan" style="font-weight: 800;" onclick="window.AdminView.openEditProjectModal('${p.id}')">
                <span>✏️</span> Editar Proyecto
              </button>
              <button class="modal-close-btn" onclick="window.AdminView.closeModal()">✕</button>
            </div>
          </div>

          <!-- Pestañas del Modal -->
          <div class="admin-modal-tabs">
            <button class="modal-tab-btn ${this.activeModalTab === 'general' ? 'active' : ''}" onclick="window.AdminView.switchModalTab('general')">
              📋 Información General
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'participants' ? 'active' : ''}" onclick="window.AdminView.switchModalTab('participants')">
              👥 Participantes
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'resources' ? 'active' : ''}" onclick="window.AdminView.switchModalTab('resources')">
              📊 Recursos & Presentación
            </button>
            <button class="modal-tab-btn ${this.activeModalTab === 'history' ? 'active' : ''}" onclick="window.AdminView.switchModalTab('history')">
              🛡️ Historial & Auditoría
            </button>
          </div>

          <!-- Contenido de la pestaña -->
          <div class="admin-modal-body" id="admin-modal-tab-body">
            ${this.renderProjectModalTabBody()}
          </div>

          <!-- Modal Footer -->
          <div class="admin-modal-footer">
            <button class="btn btn-outline" onclick="window.AdminView.closeModal()">Cerrar</button>
            <button class="btn btn-outline" style="border-color: #06b6d4; color: #06b6d4; font-weight: 800;" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">
              <span>🔍</span> Revisar Landing
            </button>
            <button class="btn btn-outline" style="border-color: #00f5d4; color: #00f5d4; font-weight: 800;" onclick="window.AdminView.openEditProjectModal('${p.id}')">
              <span>✏️</span> Editar Proyecto
            </button>
            ${isPendingApproval ? `
              <button class="btn btn-cyan" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border: none; font-weight: 900;" onclick="window.AdminView.approveProject('${p.id}'); window.AdminView.closeModal();">
                ✅ Autorizar y Publicar
              </button>
            ` : `
              <button class="btn btn-cyan" onclick="window.AdminView.toggleProjectVisibility('${p.id}'); window.AdminView.closeModal();">
                ${p.visibility === 'private' ? 'Hacer Público' : 'Hacer Privado'}
              </button>
            `}
          </div>

        </div>
      </div>
    `;
  },

  switchModalTab(tabKey) {
    this.activeModalTab = tabKey;
    const tabBtns = document.querySelectorAll('.modal-tab-btn');
    tabBtns.forEach(btn => btn.classList.remove('active'));
    const activeBtn = Array.from(tabBtns).find(btn => btn.getAttribute('onclick')?.includes(`'${tabKey}'`));
    if (activeBtn) activeBtn.classList.add('active');

    const body = document.getElementById('admin-modal-tab-body');
    if (body) body.innerHTML = this.renderProjectModalTabBody();
  },

  renderProjectModalTabBody() {
    const p = this.selectedProjectForModal;
    if (!p) return '';

    if (this.activeModalTab === 'general') {
      const isPendingApproval = p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review';
      const isApproved = p.approvalStatus === 'approved' || (p.publicationStatus === 'published' && !isPendingApproval);

      return `
        ${isPendingApproval ? `
          <div style="background: rgba(245, 158, 11, 0.14); border: 1.5px solid #f59e0b; border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h4 style="margin: 0 0 0.25rem; color: #fbbf24; font-weight: 800; display: flex; align-items: center; gap: 0.45rem;">
                <span>⏳</span> Solicitud de Autorización Pendiente
              </h4>
              <p style="margin: 0; font-size: 0.83rem; color: #cbd5e1;">
                Este proyecto fue enviado para validación antes de publicarse en Mentix.
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
              <button class="btn btn-sm btn-cyan" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border: none; font-weight: 900;" onclick="window.AdminView.approveProject('${p.id}'); window.AdminView.closeModal();">
                ✅ Autorizar y Publicar
              </button>
              <button class="btn btn-sm btn-outline" style="border-color: #06b6d4; color: #06b6d4; font-weight: 800;" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">
                🔍 Revisar Landing Page
              </button>
              <button class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #f87171; font-weight: 800;" onclick="window.AdminView.rejectProject('${p.id}'); window.AdminView.closeModal();">
                ❌ Denegar
              </button>
            </div>
          </div>
        ` : `
          <div style="background: rgba(16, 185, 129, 0.12); border: 1.5px solid #10b981; border-radius: 12px; padding: 0.85rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div>
              <h4 style="margin: 0 0 0.2rem; color: #34d399; font-weight: 800; display: flex; align-items: center; gap: 0.45rem;">
                <span>✔</span> Proyecto Autorizado y Publicado
              </h4>
              <span style="font-size: 0.8rem; color: #94a3b8;">Cuenta con autorización del Administrador y es visible para todos en la plataforma.</span>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-sm btn-outline" style="border-color: #06b6d4; color: #06b6d4; font-weight: 800;" onclick="window.AdminView.reviewProjectInLanding('${p.id}')">
                🔍 Ver Landing Page
              </button>
              <button class="btn btn-sm btn-outline" style="border-color: #ef4444; color: #f87171; font-weight: 800;" onclick="window.AdminView.rejectProject('${p.id}'); window.AdminView.closeModal();">
                ❌ Cancelar Autorización
              </button>
            </div>
          </div>
        `}
        <div class="modal-project-general-grid">
          <div class="general-cover">
            <img src="${p.image || 'assets/student_create_bg.jpg'}" alt="${p.title}" onerror="this.onerror=null; this.src='assets/student_create_bg.jpg';">
          </div>
          <div class="general-info">
            <h4>Descripción del Reto</h4>
            <p>${p.description || 'Sin descripción detallada registrada.'}</p>
            
            <div class="general-meta-grid">
              <div class="meta-item">
                <span class="label">Estado Actual:</span>
                <span class="val badge-status ${isApproved ? 'status-completed' : (isPendingApproval ? 'status-review' : 'status-in-progress')}">
                  ${isApproved ? '🏆 Autorizado' : (isPendingApproval ? '⏳ Pendiente Autorización' : '⚡ En Proceso')}
                </span>
              </div>
              <div class="meta-item">
                <span class="label">Visibilidad:</span>
                <span class="val badge-visibility ${p.visibility === 'private' ? 'vis-private' : 'vis-public'}">
                  ${p.visibility === 'private' ? '🔒 Privado' : '🌐 Público'}
                </span>
              </div>
              <div class="meta-item">
                <span class="label">Categoría:</span>
                <span class="val">${p.category || 'General'}</span>
              </div>
              <div class="meta-item">
                <span class="label">Creado el:</span>
                <span class="val">${p.createdAt ? new Date(p.createdAt).toLocaleString('es-CO') : 'Reciente'}</span>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeModalTab === 'participants') {
      return `
        <div class="modal-participants-list">
          <div class="participant-row main-author">
            <div class="author-avatar">${p.creatorAvatar || '🎓'}</div>
            <div class="author-info">
              <strong>${p.creatorName || p.author || 'Estudiante Creador'}</strong>
              <span>Rol: Autor Principal / Creador del Proyecto</span>
            </div>
            <span class="badge-tag tag-cyan">Líder</span>
          </div>

          <div style="margin-top: 1.5rem;">
            <h4>Colaboradores Registrados</h4>
            <p style="color: var(--text-muted); font-size: 0.88rem;">Este proyecto permite adición de estudiantes en modalidad de equipo.</p>
            <div class="collaborator-pill-list">
              <span class="badge-tag">Equipo Mentix</span>
              <span class="badge-tag">Revisión Docente</span>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeModalTab === 'resources') {
      return `
        <div class="modal-resources-content">
          <h4>Material Didáctico y Presentación</h4>
          <p>Archivos, presentaciones de diapositivas y enlaces adjuntos a este reto.</p>

          <div class="resource-tiles-grid">
            <div class="resource-tile">
              <div class="res-icon">📊</div>
              <div class="res-info">
                <strong>Presentación Interactiva</strong>
                <span>${p.slides ? p.slides.length + ' Diapositivas' : 'Diapositivas listas en agente'}</span>
              </div>
              <button class="btn btn-sm btn-cyan" onclick="window.appRouter.navigate('projects'); window.AdminView.closeModal();">Ver</button>
            </div>

            <div class="resource-tile">
              <div class="res-icon">🎬</div>
              <div class="res-info">
                <strong>Video Demostrativo</strong>
                <span>Formato audiovisual integrado</span>
              </div>
              <span class="badge-tag tag-emerald">Activo</span>
            </div>
          </div>
        </div>
      `;
    } else if (this.activeModalTab === 'history') {
      return `
        <div class="modal-history-timeline">
          <div class="timeline-row">
            <div class="timeline-dot cyan"></div>
            <div class="timeline-content">
              <div class="timeline-title">Proyecto creado por el estudiante</div>
              <div class="timeline-meta">${p.createdAt ? new Date(p.createdAt).toLocaleString('es-CO') : 'Registro inicial'}</div>
            </div>
          </div>
          <div class="timeline-row">
            <div class="timeline-dot emerald"></div>
            <div class="timeline-content">
              <div class="timeline-title">Validación automática de contenido aprobada</div>
              <div class="timeline-meta">Sistema Antigravity Mentix</div>
            </div>
          </div>
          <div class="timeline-row">
            <div class="timeline-dot gold"></div>
            <div class="timeline-content">
              <div class="timeline-title">Visibilidad asignada: ${p.visibility === 'private' ? 'Privado' : 'Público'}</div>
              <div class="timeline-meta">Configuración del usuario</div>
            </div>
          </div>
        </div>
      `;
    }
  },

  /**
   * Modal para Crear Administrador / Docente
   */
  openCreateUserModal() {
    const modalRoot = document.getElementById('admin-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="admin-modal-overlay" onclick="window.AdminView.handleModalBackdropClick(event)">
        <div class="admin-modal-window modal-md">
          <div class="admin-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">👤</span>
              <div>
                <h3>Nuevo Usuario Administrativo</h3>
                <span class="modal-sub">Asigna credenciales y permisos institucionales</span>
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.AdminView.closeModal()">✕</button>
          </div>

          <form onsubmit="window.AdminView.handleCreateUserSubmit(event)" class="admin-modal-form">
            <div class="form-section">
              <h4>1. Información Personal</h4>
              <div class="form-row">
                <label>Nombre Completo *</label>
                <input type="text" id="new-user-name" required placeholder="Ej: Dra. Elena Ramírez">
              </div>
              <div class="form-row">
                <label>Correo Electrónico Institucional *</label>
                <input type="email" id="new-user-email" required placeholder="elena.ramirez@mentix.edu">
              </div>
            </div>

            <div class="form-section">
              <h4>2. Credenciales y Rol</h4>
              <div class="form-row">
                <label>Rol en el Sistema *</label>
                <select id="new-user-role" required>
                  <option value="admin">Administrador General (Acceso Total)</option>
                  <option value="teacher">Docente Mentor (Moderación)</option>
                  <option value="student">Estudiante</option>
                </select>
              </div>
              <div class="form-row">
                <label>Contraseña Temporal *</label>
                <input type="password" id="new-user-password" required placeholder="••••••••••••" value="Mentix2026!">
              </div>
            </div>

            <div class="admin-modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.AdminView.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-cyan">Crear Usuario</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  handleCreateUserSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-user-name')?.value.trim();
    const email = document.getElementById('new-user-email')?.value.trim();
    const role = document.getElementById('new-user-role')?.value || 'admin';

    if (!name || !email) {
      this.showToast('Por favor completa todos los campos requeridos', 'warning');
      return;
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      role,
      avatar: role === 'admin' ? '🛡️' : (role === 'teacher' ? '👨‍🏫' : '🎓'),
      level: 5,
      xp: 2500,
      createdAt: new Date().toISOString(),
      lastLogin: 'Nunca'
    };

    if (!window.appState.users) window.appState.users = [];
    window.appState.users.unshift(newUser);

    try {
      localStorage.setItem('mentix_users', JSON.stringify(window.appState.users));
    } catch(e) {}

    this.logAuditEvent(`Usuario creado: ${name} (${role})`, 'Usuarios');
    this.closeModal();
    this.showToast(`Usuario ${name} creado con éxito`, 'success');
    this.renderActiveTab();
  },

  /**
   * Modal para Crear Categoría
   */
  openCreateCategoryModal() {
    const modalRoot = document.getElementById('admin-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="admin-modal-overlay" onclick="window.AdminView.handleModalBackdropClick(event)">
        <div class="admin-modal-window modal-sm">
          <div class="admin-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">🏷️</span>
              <div>
                <h3>Nueva Categoría Académica</h3>
                <span class="modal-sub">Define un área de conocimiento para retos</span>
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.AdminView.closeModal()">✕</button>
          </div>

          <form onsubmit="window.AdminView.handleCreateCategorySubmit(event)" class="admin-modal-form">
            <div class="form-row">
              <label>Nombre de Categoría *</label>
              <input type="text" id="new-cat-name" required placeholder="Ej: Inteligencia Artificial">
            </div>
            <div class="form-row">
              <label>Emoji / Icono *</label>
              <input type="text" id="new-cat-icon" required value="💡" style="font-size: 1.5rem; text-align: center;">
            </div>
            <div class="form-row">
              <label>Descripción Breve</label>
              <textarea id="new-cat-desc" rows="3" placeholder="Enfoque temático de esta área..."></textarea>
            </div>

            <div class="admin-modal-footer" style="padding: 1rem 0 0; margin-top: 1rem;">
              <button type="button" class="btn btn-outline" onclick="window.AdminView.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-cyan">Guardar Categoría</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  handleCreateCategorySubmit(e) {
    e.preventDefault();
    const name = document.getElementById('new-cat-name')?.value.trim();
    const icon = document.getElementById('new-cat-icon')?.value.trim() || '🏷️';
    const desc = document.getElementById('new-cat-desc')?.value.trim();

    if (!name) return;

    const newCat = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name,
      icon,
      description: desc,
      color: '#00f5d4'
    };

    if (!window.appState.categories) window.appState.categories = [];
    window.appState.categories.push(newCat);

    try {
      localStorage.setItem('mentix_categories', JSON.stringify(window.appState.categories));
    } catch(e) {}

    this.logAuditEvent(`Categoría creada: ${name}`, 'Categorías');
    this.closeModal();
    this.showToast(`Categoría "${name}" agregada correctamente`, 'success');
    this.renderActiveTab();
  },

  closeModal() {
    const modalRoot = document.getElementById('admin-modal-root');
    if (modalRoot) modalRoot.innerHTML = '';
    this.selectedProjectForModal = null;
  },

  handleModalBackdropClick(e) {
    if (e.target.classList.contains('admin-modal-overlay')) {
      this.closeModal();
    }
  },

  // ==========================================
  // OPERACIONES SOBRE PROYECTOS Y USUARIOS
  // ==========================================

  toggleProjectVisibility(projectId) {
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    const p = projects.find(item => item.id === projectId);
    if (!p) return;

    p.visibility = p.visibility === 'private' ? 'public' : 'private';
    p.isPublic = p.visibility !== 'private';
    p.accessMode = p.visibility !== 'private' ? 'public' : 'private';

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    } else {
      try {
        localStorage.setItem('mentix_challenges', JSON.stringify(projects));
        localStorage.setItem('mentix_projects', JSON.stringify(projects));
      } catch(e) {}
    }

    this.logAuditEvent(`Visibilidad cambiada: "${p.title}" a ${p.visibility}`, 'Proyectos');
    this.showToast(`Proyecto marcado como ${p.visibility === 'private' ? 'Privado' : 'Público'}`, 'success');
    this.renderActiveTab();
  },

  deleteProject(projectId) {
    if (!confirm('¿Estás seguro de que deseas eliminar este proyecto de manera permanente?')) return;

    let projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    const p = projects.find(item => item.id === projectId);
    const pTitle = p ? p.title : projectId;

    projects = projects.filter(item => item.id !== projectId);
    window.appState.challenges = projects;

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    } else {
      try {
        localStorage.setItem('mentix_challenges', JSON.stringify(projects));
        localStorage.setItem('mentix_projects', JSON.stringify(projects));
      } catch(e) {}
    }
    // Limpiar de bóvedas personales si el admin lo elimina
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mentix_user_projects_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.some(item => item.id === projectId)) {
              localStorage.setItem(k, JSON.stringify(list.filter(item => item.id !== projectId)));
            }
          }
        }
      }
    } catch(e) {}

    this.logAuditEvent(`Proyecto eliminado: "${pTitle}"`, 'Proyectos');
    this.showToast('Proyecto eliminado del sistema', 'success');
    this.renderActiveTab();
  },

  shareProject(projectId) {
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    const p = projects.find(item => item.id === projectId);
    const title = p ? p.title : 'Proyecto';
    const landingUrl = `${window.location.origin}${window.location.pathname}#landing-${projectId}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(landingUrl).then(() => {
        this.showToast(`Enlace de "${title}" copiado al portapapeles`, 'success');
      }).catch(() => {
        this.showToast('Enlace de Landing Page generado', 'info');
      });
    } else {
      this.showToast('Enlace de Landing Page generado', 'info');
    }

    if (window.ProjectsView && typeof window.ProjectsView.openProjectLanding === 'function') {
      window.ProjectsView.openProjectLanding(projectId);
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  },

  /**
   * Modal de Edición de Proyectos para Administradores
   */
  openEditProjectModal(projectId) {
    const raw = this.getRealProjects();
    const p = raw.find(item => item.id === projectId) || (window.appState?.challenges || []).find(item => item.id === projectId);
    if (!p) {
      this.showToast('No se encontró el proyecto para editar', 'error');
      return;
    }

    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];
    const isCompleted = p.status === 'completed' || p.stage === 'completed';
    const isReview = p.status === 'review';
    const isPublic = p.visibility !== 'private';
    const currentRating = p.rating || '4.8';
    const currentStudents = p.participantsCount || (p.collaborators ? p.collaborators.length : null) || p.students || 24;
    const coverImage = p.image || p.cover || p.banner || 'assets/student_create_bg.jpg';

    const modalRoot = document.getElementById('admin-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="admin-modal-overlay" onclick="window.AdminView.handleModalBackdropClick(event)">
        <div class="admin-modal-window modal-lg" style="max-width: 780px;">
          
          <!-- Modal Header -->
          <div class="admin-modal-header" style="border-bottom: 1px solid #1e293b; padding-bottom: 1rem;">
            <div class="modal-title-wrap">
              <span class="modal-icon" style="background: rgba(0, 245, 212, 0.15); color: #00f5d4; border-radius: 12px; padding: 0.5rem; font-size: 1.3rem;">✏️</span>
              <div>
                <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #ffffff;">Editar Proyecto</h3>
                <span class="modal-sub" style="color: #94a3b8; font-size: 0.82rem;">ID: <code>${p.id}</code> • Modo Administrador</span>
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.AdminView.closeModal()" style="font-size: 1.2rem; cursor: pointer; background: transparent; border: none; color: #94a3b8;">✕</button>
          </div>

          <!-- Modal Body Formulario -->
          <div class="admin-modal-body" style="padding: 1.5rem 0; max-height: 70vh; overflow-y: auto;">
            <form id="admin-edit-project-form" onsubmit="window.AdminView.submitProjectEdit(event, '${p.id}')">
              
              <!-- Fila 1: Título y Categoría -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.25rem;">
                <div class="form-group">
                  <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Título del Proyecto *
                  </label>
                  <input 
                    type="text" 
                    id="edit-proj-title" 
                    value="${this.escapeHtml(p.title || '')}" 
                    required 
                    style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.65rem 0.85rem; font-size: 0.92rem; outline: none;"
                    onfocus="this.style.borderColor='#00f5d4'"
                    onblur="this.style.borderColor='#1e293b'"
                  />
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Categoría Académica
                  </label>
                  <select 
                    id="edit-proj-category" 
                    style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.65rem 0.85rem; font-size: 0.92rem; outline: none; cursor: pointer;"
                  >
                    ${categories.map(c => `
                      <option value="${c.id}" ${p.category === c.id ? 'selected' : ''}>
                        ${c.icon || '🏷️'} ${c.name}
                      </option>
                    `).join('')}
                    ${!categories.some(c => c.id === p.category) ? `<option value="${p.category || 'general'}" selected>${p.category || 'General'}</option>` : ''}
                  </select>
                </div>
              </div>

              <!-- Fila 2: Subtítulo o Resumen Corto -->
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                  Subtítulo / Breve Resumen
                </label>
                <input 
                  type="text" 
                  id="edit-proj-subtitle" 
                  value="${this.escapeHtml(p.subtitle || p.description || '')}" 
                  style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.65rem 0.85rem; font-size: 0.92rem; outline: none;"
                  placeholder="Ej: Metodologías ágiles para la gobernanza de información"
                />
              </div>

              <!-- Fila 3: Descripción Detallada -->
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                  Descripción Detallada
                </label>
                <textarea 
                  id="edit-proj-description" 
                  rows="3" 
                  style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.65rem 0.85rem; font-size: 0.92rem; outline: none; resize: vertical;"
                >${this.escapeHtml(p.description || '')}</textarea>
              </div>

              <!-- Fila 4: Estado, Visibilidad, Participantes y Rating -->
              <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.85rem; margin-bottom: 1.25rem;">
                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Estado
                  </label>
                  <select id="edit-proj-status" style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.6rem 0.65rem; font-size: 0.88rem; outline: none;">
                    <option value="completed" ${isCompleted ? 'selected' : ''}>✔ Completado</option>
                    <option value="in_progress" ${(!isCompleted && !isReview) ? 'selected' : ''}>⚡ En Proceso</option>
                    <option value="review" ${isReview ? 'selected' : ''}>⏳ En Revisión</option>
                  </select>
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Visibilidad
                  </label>
                  <select id="edit-proj-visibility" style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.6rem 0.65rem; font-size: 0.88rem; outline: none;">
                    <option value="public" ${isPublic ? 'selected' : ''}>🌐 Público</option>
                    <option value="private" ${!isPublic ? 'selected' : ''}>🔒 Privado</option>
                  </select>
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Participantes 👥
                  </label>
                  <input type="number" id="edit-proj-students" min="0" value="${currentStudents}" style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.6rem 0.65rem; font-size: 0.88rem; outline: none;" />
                </div>

                <div class="form-group">
                  <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                    Rating ⭐
                  </label>
                  <input type="number" step="0.1" min="1" max="5" id="edit-proj-rating" value="${currentRating}" style="width: 100%; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.6rem 0.65rem; font-size: 0.88rem; outline: none;" />
                </div>
              </div>

              <!-- Fila 5: Imagen de Portada / Banner con Previsualización -->
              <div class="form-group" style="margin-bottom: 1.25rem;">
                <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
                  URL Imagen de Portada o Banner
                </label>
                <div style="display: flex; gap: 0.75rem; align-items: center;">
                  <input 
                    type="text" 
                    id="edit-proj-cover" 
                    value="${this.escapeHtml(coverImage)}" 
                    style="flex: 1; background: #0b1528; border: 1.5px solid #1e293b; border-radius: 10px; color: #ffffff; padding: 0.65rem 0.85rem; font-size: 0.92rem; outline: none;"
                    oninput="document.getElementById('edit-cover-preview').src = this.value || 'assets/student_create_bg.jpg'"
                  />
                  <img 
                    id="edit-cover-preview" 
                    src="${coverImage}" 
                    alt="Preview" 
                    style="width: 65px; height: 42px; object-fit: cover; border-radius: 8px; border: 1.5px solid #00f5d4;" 
                    onerror="this.onerror=null; this.src='assets/student_create_bg.jpg';"
                  />
                </div>
                <div style="display: flex; gap: 0.5rem; margin-top: 0.5rem;">
                  <button type="button" class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="document.getElementById('edit-proj-cover').value='assets/projects_ui/robot_hero_banner.png'; document.getElementById('edit-cover-preview').src='assets/projects_ui/robot_hero_banner.png';">
                    🤖 Usar Banner Robot
                  </button>
                  <button type="button" class="btn btn-sm btn-outline" style="font-size: 0.75rem; padding: 0.25rem 0.5rem;" onclick="document.getElementById('edit-proj-cover').value='assets/student_create_bg.jpg'; document.getElementById('edit-cover-preview').src='assets/student_create_bg.jpg';">
                    🌌 Usar Cosmos
                  </button>
                </div>
              </div>

              <!-- Banner de Edición Profunda del Contenido Interactivo -->
              <div style="background: linear-gradient(135deg, rgba(0, 245, 212, 0.08) 0%, rgba(124, 58, 237, 0.12) 100%); border: 1.5px dashed #00f5d4; border-radius: 14px; padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1.25rem;">
                <div>
                  <h4 style="margin: 0 0 0.25rem 0; font-size: 0.95rem; color: #00f5d4; font-weight: 800;">
                    🎨 Edición Completa de Contenido & Diapositivas
                  </h4>
                  <p style="margin: 0; font-size: 0.82rem; color: #cbd5e1;">
                    Modifica diapositivas, textos, videos, notas y recursos interactivos directamente en el diseñador.
                  </p>
                </div>
                <button 
                  type="button" 
                  class="btn btn-cyan" 
                  style="font-size: 0.85rem; font-weight: 900; white-space: nowrap; padding: 0.55rem 1.1rem;" 
                  onclick="window.AdminView.editProjectContent('${p.id}')"
                >
                  Abrir Diseñador ➜
                </button>
              </div>

              <!-- Modal Footer -->
              <div class="admin-modal-footer" style="border-top: 1px solid #1e293b; padding-top: 1.25rem; margin-top: 1.5rem; display: flex; justify-content: flex-end; gap: 0.75rem;">
                <button type="button" class="btn btn-outline" onclick="window.AdminView.closeModal()">
                  Cancelar
                </button>
                <button type="submit" class="btn btn-cyan" style="font-weight: 900; padding: 0.65rem 1.5rem; box-shadow: 0 0 15px rgba(0, 245, 212, 0.45);">
                  <span>💾</span> Guardar Cambios
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    `;
  },

  submitProjectEdit(event, projectId) {
    if (event) event.preventDefault();
    
    const title = (document.getElementById('edit-proj-title')?.value || '').trim();
    if (!title) {
      this.showToast('El título del proyecto es obligatorio', 'warning');
      return;
    }

    const categoryId = document.getElementById('edit-proj-category')?.value || 'general';
    const subtitle = (document.getElementById('edit-proj-subtitle')?.value || '').trim();
    const description = (document.getElementById('edit-proj-description')?.value || '').trim();
    const status = document.getElementById('edit-proj-status')?.value || 'completed';
    const visibility = document.getElementById('edit-proj-visibility')?.value || 'public';
    const students = parseInt(document.getElementById('edit-proj-students')?.value || '24', 10);
    const rating = (document.getElementById('edit-proj-rating')?.value || '4.8').trim();
    const cover = (document.getElementById('edit-proj-cover')?.value || '').trim();

    if (!window.appState.challenges) window.appState.challenges = [];
    let p = window.appState.challenges.find(item => item && item.id === projectId);

    if (!p) {
      if (typeof DEFAULT_PROJECTS !== 'undefined') {
        const dp = DEFAULT_PROJECTS.find(d => d.id === projectId);
        if (dp) {
          p = { ...dp };
          window.appState.challenges.push(p);
        }
      }
    }

    if (!p) {
      this.showToast('No se encontró el proyecto a actualizar', 'error');
      return;
    }

    // Actualizar campos del proyecto
    p.title = title;
    p.subtitle = subtitle;
    p.description = description || subtitle || title;
    p.category = categoryId;
    
    const cats = window.appState.categories || [];
    const catObj = cats.find(c => c.id === categoryId);
    if (catObj) p.categoryName = catObj.name;

    p.status = status;
    p.stage = status;
    p.visibility = visibility;
    p.isPublic = (visibility !== 'private');
    p.accessMode = (visibility !== 'private') ? 'public' : 'private';
    p.rating = rating;
    p.students = students;
    p.participantsCount = students;
    if (cover) {
      p.image = cover;
      p.cover = cover;
      p.banner = cover;
    }

    // Guardar cambios globalmente
    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    } else {
      try {
        localStorage.setItem('mentix_challenges', JSON.stringify(window.appState.challenges));
        localStorage.setItem('mentix_projects', JSON.stringify(window.appState.challenges));
        localStorage.setItem('te_reto_challenges', JSON.stringify(window.appState.challenges));
      } catch(e) {}
    }

    // Actualizar en bóvedas de usuario si existe
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mentix_user_projects_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            let list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const idx = list.findIndex(item => item && item.id === projectId);
              if (idx >= 0) {
                list[idx] = { ...list[idx], ...p };
                localStorage.setItem(k, JSON.stringify(list));
              }
            }
          }
        }
      }
    } catch(e) {}

    this.logAuditEvent(`Proyecto editado: "${title}"`, 'Proyectos');
    this.closeModal();
    this.showToast(`✨ ¡Proyecto "${title}" actualizado exitosamente!`, 'success');
    this.renderActiveTab();
  },

  editProjectContent(projectId) {
    this.closeModal();
    const p = (window.appState.challenges || []).find(item => item && item.id === projectId);
    if (!p) {
      this.showToast('No se encontró el proyecto', 'error');
      return;
    }

    const type = p.projectType || (p.slides ? 'presentation' : 'presentation');
    if (type === 'video') {
      if (window.appRouter && typeof window.appRouter.editVideo === 'function') {
        window.appRouter.editVideo(projectId);
      } else {
        window.appRouter.navigate('video', { id: projectId, edit: true });
      }
    } else if (type === 'document') {
      if (window.appRouter && typeof window.appRouter.editDocument === 'function') {
        window.appRouter.editDocument(projectId);
      } else {
        window.appRouter.navigate('document', { id: projectId, edit: true });
      }
    } else if (type === 'url') {
      if (window.appRouter && typeof window.appRouter.editUrl === 'function') {
        window.appRouter.editUrl(projectId);
      } else {
        window.appRouter.navigate('url', { id: projectId, edit: true });
      }
    } else {
      if (window.appRouter && typeof window.appRouter.editPresentation === 'function') {
        window.appRouter.editPresentation(projectId);
      } else {
        window.appRouter.navigate('presentation', { id: projectId, edit: true });
      }
    }
  },

  // ==========================================
  // AUTORIZACIÓN Y AUDITORÍA DE PROYECTOS (MODERACIÓN ADMINISTRATIVA)
  // ==========================================
  isAdminAuditing: false,

  /**
   * Abre la Landing Page completa de un proyecto con la Barra Flotante de Auditoría para Administrador
   */
  reviewProjectInLanding(projectId) {
    this.closeModal();
    const raw = this.getRealProjects();
    const p = raw.find(item => item && item.id === projectId) || (window.appState?.challenges || []).find(item => item && item.id === projectId);
    if (!p) {
      this.showToast('No se encontró el proyecto para revisar', 'error');
      return;
    }

    this.isAdminAuditing = true;

    // Navegar a la vista de proyectos en modo landing para auditarla
    if (window.ProjectsView && typeof window.ProjectsView.openProjectLanding === 'function') {
      window.ProjectsView.openProjectLanding(projectId);
      setTimeout(() => {
        this.renderLandingAuditBar(projectId);
      }, 150);
    } else if (window.appRouter) {
      window.appRouter.navigate('projects');
      setTimeout(() => {
        if (window.ProjectsView) {
          window.ProjectsView.openProjectLanding(projectId);
          this.renderLandingAuditBar(projectId);
        }
      }, 200);
    }
  },

  /**
   * Barra Superior Flotante de Auditoría y Autorización en la Landing Page
   */
  renderLandingAuditBar(projectId) {
    const prev = document.getElementById('admin-audit-floating-banner');
    if (prev) prev.remove();

    const p = (window.appState?.challenges || []).find(item => item && item.id === projectId);
    if (!p) return;

    const isPendingApproval = p.approvalStatus === 'pending' || p.status === 'review' || p.publicationStatus === 'pending_approval' || p.publicationStatus === 'ready_for_review';
    const isApproved = p.approvalStatus === 'approved' || (p.publicationStatus === 'published' && !isPendingApproval);
    const authorName = p.creatorName || p.author || 'Estudiante';

    const bar = document.createElement('div');
    bar.id = 'admin-audit-floating-banner';
    bar.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 9999999;
      background: rgba(7, 21, 43, 0.96);
      backdrop-filter: blur(18px);
      border-bottom: 2px solid #00f5d4;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.55);
      padding: 0.65rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      color: #ffffff;
      font-family: 'Outfit', sans-serif;
    `;

    bar.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.85rem;">
        <span style="font-size: 1.35rem; background: rgba(0, 245, 212, 0.15); padding: 0.35rem 0.55rem; border-radius: 10px; border: 1.5px solid #00f5d4;">🛡️</span>
        <div>
          <div style="display: flex; align-items: center; gap: 0.55rem; flex-wrap: wrap;">
            <strong style="font-size: 0.96rem; color: #ffffff;">Modo Auditoría & Autorización de Proyecto</strong>
            <span style="padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.76rem; font-weight: 900; ${isPendingApproval ? 'background: #f59e0b; color: #07152b;' : 'background: #10b981; color: #ffffff;'}">
              ${isPendingApproval ? '⏳ Pendiente de Autorización' : '✔ Autorizado y Publicado'}
            </span>
          </div>
          <span style="font-size: 0.78rem; color: #94a3b8;">
            Revisando: <strong style="color: #ffffff;">${this.escapeHtml(p.title)}</strong> (Autor: ${this.escapeHtml(authorName)})
          </span>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
        <button 
          type="button" 
          class="btn btn-sm btn-outline" 
          style="border-color: #00f5d4; color: #00f5d4; font-weight: 800; font-size: 0.82rem; padding: 0.45rem 0.85rem;" 
          onclick="window.AdminView.openEditProjectModal('${p.id}')"
          title="Modificar metadatos, textos, categorías o detalles que falten"
        >
          ✏️ Editar Proyecto
        </button>
        <button 
          type="button" 
          class="btn btn-sm btn-outline" 
          style="border-color: #38bdf8; color: #38bdf8; font-weight: 800; font-size: 0.82rem; padding: 0.45rem 0.85rem;" 
          onclick="window.AdminView.editProjectContent('${p.id}')"
          title="Modificar diapositivas, recursos o contenido interactivo directamente"
        >
          🎨 Diseñador Diapositivas
        </button>
        ${!isApproved ? `
          <button 
            type="button" 
            class="btn btn-sm btn-cyan" 
            style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; font-weight: 900; font-size: 0.84rem; padding: 0.45rem 1rem; border: none; box-shadow: 0 0 15px rgba(16, 185, 129, 0.45);" 
            onclick="window.AdminView.approveProject('${p.id}')"
          >
            ✅ Autorizar y Publicar
          </button>
          <button 
            type="button" 
            class="btn btn-sm btn-outline" 
            style="border-color: #ef4444; color: #f87171; font-weight: 800; font-size: 0.82rem; padding: 0.45rem 0.8rem;" 
            onclick="window.AdminView.rejectProject('${p.id}')"
          >
            ❌ Denegar
          </button>
        ` : `
          <button 
            type="button" 
            class="btn btn-sm btn-outline" 
            style="border-color: #ef4444; color: #f87171; font-weight: 800; font-size: 0.82rem; padding: 0.45rem 0.8rem;" 
            onclick="window.AdminView.rejectProject('${p.id}')"
          >
            ❌ Cancelar Autorización
          </button>
        `}
        <button 
          type="button" 
          class="btn btn-sm btn-outline" 
          style="font-weight: 800; font-size: 0.82rem; padding: 0.45rem 0.85rem;" 
          onclick="window.AdminView.exitAuditAndReturnToAdmin()"
        >
          ← Volver al Admin
        </button>
      </div>
    `;

    document.body.appendChild(bar);
    document.body.style.paddingTop = '68px';
  },

  updateLandingAuditBar(projectId) {
    if (document.getElementById('admin-audit-floating-banner')) {
      this.renderLandingAuditBar(projectId);
    }
  },

  exitAuditAndReturnToAdmin() {
    this.isAdminAuditing = false;
    const banner = document.getElementById('admin-audit-floating-banner');
    if (banner) banner.remove();
    document.body.style.paddingTop = '';
    if (window.appRouter) {
      window.appRouter.navigate('admin');
      if (window.AdminView) {
        window.AdminView.switchTab('projects');
      }
    }
  },

  /**
   * Concede autorización formal a un proyecto y lo publica en la plataforma
   */
  approveProject(projectId) {
    let raw = window.appState.challenges || [];
    let p = raw.find(item => item && item.id === projectId);
    if (!p) {
      this.showToast('No se encontró el proyecto', 'error');
      return;
    }

    p.approvalStatus = 'approved';
    p.publicationStatus = 'published';
    p.status = 'completed';
    p.stage = 'completed';
    p.isPublic = true;
    p.accessMode = 'public';
    p.authorizedAt = new Date().toISOString();
    p.authorizedBy = (window.appState.currentUser?.name) || 'Administrador Mentix';
    delete p.rejectionReason;

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    } else {
      try {
        localStorage.setItem('mentix_challenges', JSON.stringify(window.appState.challenges));
        localStorage.setItem('mentix_projects', JSON.stringify(window.appState.challenges));
        localStorage.setItem('te_reto_challenges', JSON.stringify(window.appState.challenges));
      } catch(e) {}
    }

    this.syncProjectToUserVaults(p);
    this.logAuditEvent(`Proyecto autorizado y publicado: "${p.title}"`, 'Autorizaciones');
    this.showToast(`✅ ¡Proyecto "${p.title}" autorizado y publicado con éxito!`, 'success');
    
    this.updateLandingAuditBar(projectId);
    this.renderActiveTab();
  },

  /**
   * Cancela o deniega la autorización de un proyecto
   */
  rejectProject(projectId, reason = '') {
    let raw = window.appState.challenges || [];
    let p = raw.find(item => item && item.id === projectId);
    if (!p) {
      this.showToast('No se encontró el proyecto', 'error');
      return;
    }

    const note = prompt('Ingresa el motivo de cancelación o corrección que debe realizar el autor:', reason || 'Faltan detalles o el contenido requiere ajustes antes de publicarse.');
    if (note === null) return;

    p.approvalStatus = 'rejected';
    p.publicationStatus = 'draft';
    p.status = 'in_progress';
    p.stage = 'in_progress';
    p.isPublic = false;
    p.accessMode = 'private';
    p.rejectionReason = note;
    p.rejectedAt = new Date().toISOString();

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    } else {
      try {
        localStorage.setItem('mentix_challenges', JSON.stringify(window.appState.challenges));
        localStorage.setItem('mentix_projects', JSON.stringify(window.appState.challenges));
        localStorage.setItem('te_reto_challenges', JSON.stringify(window.appState.challenges));
      } catch(e) {}
    }

    this.syncProjectToUserVaults(p);
    this.logAuditEvent(`Autorización cancelada para "${p.title}": ${note}`, 'Autorizaciones');
    this.showToast(`❌ Autorización cancelada para "${p.title}".`, 'warning');

    this.updateLandingAuditBar(projectId);
    this.renderActiveTab();
  },

  syncProjectToUserVaults(project) {
    if (!project || !project.id) return;
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mentix_user_projects_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            let list = JSON.parse(raw);
            if (Array.isArray(list)) {
              const idx = list.findIndex(item => item && item.id === project.id);
              if (idx >= 0) {
                list[idx] = { ...list[idx], ...project };
                localStorage.setItem(k, JSON.stringify(list));
              }
            }
          }
        }
      }
    } catch(e) {}
  },

  toggleUserBlock(userId) {
    const users = (window.appState && window.appState.users) ? window.appState.users : [];
    const u = users.find(item => item.id === userId);
    if (!u) return;

    u.isBlocked = !u.isBlocked;

    try {
      localStorage.setItem('mentix_users', JSON.stringify(users));
    } catch(e) {}

    this.logAuditEvent(`Estado de usuario cambiado: ${u.name} (${u.isBlocked ? 'Bloqueado' : 'Activo'})`, 'Usuarios');
    this.showToast(`Usuario ${u.isBlocked ? 'bloqueado' : 'desbloqueado'} exitosamente`, 'success');
    this.renderActiveTab();
  },

  deleteUser(userId) {
    if (!confirm('¿Deseas eliminar definitivamente este usuario?')) return;

    let users = (window.appState && window.appState.users) ? window.appState.users : [];
    const u = users.find(item => item.id === userId);
    const uName = u ? u.name : userId;

    users = users.filter(item => item.id !== userId);
    window.appState.users = users;

    try {
      localStorage.setItem('mentix_users', JSON.stringify(users));
    } catch(e) {}

    this.logAuditEvent(`Usuario eliminado: ${uName}`, 'Usuarios');
    this.showToast('Usuario eliminado', 'success');
    this.renderActiveTab();
  },

  // ==========================================
  // FILTROS Y CONTROLADORES
  // ==========================================

  setProjectSearch(val) {
    this.projectFilter.search = val;
    this.renderActiveTab();
  },

  setProjectCategoryFilter(catId) {
    this.projectFilter.category = catId;
    this.renderActiveTab();
  },

  setProjectStatusFilter(status) {
    this.projectFilter.status = status;
    this.renderActiveTab();
  },

  setProjectViewMode(mode) {
    this.projectFilter.viewMode = mode;
    this.renderActiveTab();
  },

  resetProjectFilters() {
    this.projectFilter.search = '';
    this.projectFilter.category = 'all';
    this.projectFilter.status = 'all';
    this.renderActiveTab();
  },

  setUserSearch(val) {
    this.userFilter.search = val;
    this.renderActiveTab();
  },

  setUserRoleFilter(role) {
    this.userFilter.role = role;
    this.renderActiveTab();
  },

  setUserStatusFilter(status) {
    this.userFilter.status = status;
    this.renderActiveTab();
  },

  changeUserRole(userId, newRole) {
    let users = (window.appState && window.appState.users) ? window.appState.users : [];
    const u = users.find(item => item.id === userId);
    if (!u) return;

    const oldRole = u.role || 'student';
    u.role = newRole;
    u.isAdmin = (newRole === 'admin');

    try {
      localStorage.setItem('mentix_users', JSON.stringify(users));
    } catch(e) {}

    this.logAuditEvent(`Rol de usuario actualizado: ${u.name} (${oldRole} ➔ ${newRole})`, 'Roles');
    this.showToast(`Rol de ${u.name} actualizado a ${newRole}`, 'success');
    this.renderActiveTab();
  },

  setResourceSearch(val) {
    this.resourceFilter.search = val;
    this.renderActiveTab();
  },

  setResourceTypeFilter(type) {
    this.resourceFilter.type = type;
    this.renderActiveTab();
  },

  getDefaultResources() {
    return [
      {
        id: 'res_pitch_deck',
        title: 'Plantilla Pitch Deck Proyectos (Diapositivas)',
        type: 'presentation',
        category: 'Plantilla',
        audience: 'Estudiantes',
        icon: '📊',
        description: 'Estructura interactiva de 6 diapositivas lista para presentar proyectos ante docentes y jurados.',
        url: '#',
        format: 'Diapositivas Mentix',
        updatedAt: '2026-11-01'
      },
      {
        id: 'res_guia_robotica',
        title: 'Guía Pedagógica de Proyectos STEM & Robótica',
        type: 'document',
        category: 'Guía',
        audience: 'Docentes & Estudiantes',
        icon: '🤖',
        description: 'Manual paso a paso para formular proyectos de innovación, prototipado y robótica educativa.',
        url: '#',
        format: 'PDF / Documento',
        updatedAt: '2026-11-01'
      },
      {
        id: 'res_rubrica_evaluacion',
        title: 'Rúbrica Oficial de Evaluación de Proyectos Mentix',
        type: 'document',
        category: 'Rúbrica',
        audience: 'Docentes',
        icon: '📝',
        description: 'Matriz de valoración con 5 criterios: impacto social, originalidad, rigor técnico, presentación y viabilidad.',
        url: '#',
        format: 'Rúbrica Docente',
        updatedAt: '2026-11-01'
      },
      {
        id: 'res_kit_grafico',
        title: 'Pack de Recursos Gráficos & Iconografía Cyberpunk',
        type: 'assets',
        category: 'Multimedia',
        audience: 'Estudiantes',
        icon: '🎨',
        description: 'Colección de vectores, stickers e ilustraciones futuristas para embellecer diapositivas y portadas.',
        url: '#',
        format: 'Pack Gráfico ZIP',
        updatedAt: '2026-11-01'
      },
      {
        id: 'res_guia_pitch_video',
        title: 'Guía de Grabación & Pitch en Video para Proyectos',
        type: 'multimedia',
        category: 'Tutorial',
        audience: 'Estudiantes',
        icon: '🎬',
        description: 'Consejos de iluminación, guion de 90 segundos y estructura para proyectos en formato video.',
        url: '#',
        format: 'Guía Audiovisual',
        updatedAt: '2026-11-01'
      },
      {
        id: 'res_directorio_apis',
        title: 'Directorio de APIs Abiertas & Datos para Estudiantes',
        type: 'links',
        category: 'Herramientas',
        audience: 'Estudiantes',
        icon: '🌐',
        description: 'Lista curada de APIs de astronomía (NASA), clima, biodiversidad y datos abiertos para proyectos.',
        url: 'https://github.com/public-apis/public-apis',
        format: 'Directorio Web',
        updatedAt: '2026-11-01'
      }
    ];
  },

  ensureResources() {
    if (!localStorage.getItem('mentix_admin_resources')) {
      localStorage.setItem('mentix_admin_resources', JSON.stringify(this.getDefaultResources()));
    }
    const badge = document.getElementById('admin-resources-count-badge');
    if (badge) {
      badge.textContent = this.getResources().length;
    }
  },

  getResources() {
    try {
      const data = localStorage.getItem('mentix_admin_resources');
      return data ? JSON.parse(data) : this.getDefaultResources();
    } catch(e) {
      return this.getDefaultResources();
    }
  },

  resetDefaultResources() {
    if (!confirm('¿Deseas restaurar el catálogo oficial de recursos didácticos de Mentix?')) return;
    localStorage.setItem('mentix_admin_resources', JSON.stringify(this.getDefaultResources()));
    this.showToast('Recursos oficiales restaurados', 'success');
    this.ensureResources();
    this.renderActiveTab();
  },

  openAddResourceModal() {
    const modalRoot = document.getElementById('admin-modal-root');
    if (!modalRoot) return;

    modalRoot.innerHTML = `
      <div class="admin-modal-overlay" onclick="window.AdminView.handleModalBackdropClick(event)">
        <div class="admin-modal-window modal-md">
          <div class="admin-modal-header">
            <div class="modal-title-wrap">
              <span class="modal-icon">📦</span>
              <div>
                <h3>Nuevo Recurso / Plantilla Didáctica</h3>
                <span class="modal-sub">Publica diapositivas, guías o recursos para la comunidad</span>
              </div>
            </div>
            <button class="modal-close-btn" onclick="window.AdminView.closeModal()">✕</button>
          </div>

          <form onsubmit="window.AdminView.handleCreateResourceSubmit(event)" class="admin-modal-form">
            <div class="form-section">
              <h4>1. Datos del Recurso</h4>
              <div class="form-row">
                <label>Título del Recurso *</label>
                <input type="text" id="new-res-title" required placeholder="Ej: Plantilla Pitch Maker para Estudiantes">
              </div>
              <div class="form-row">
                <label>Descripción Breve *</label>
                <textarea id="new-res-desc" required rows="2" placeholder="Explica cómo deben utilizar este recurso los estudiantes o docentes..."></textarea>
              </div>
            </div>

            <div class="form-section">
              <h4>2. Tipo y Destinatarios</h4>
              <div class="form-grid-2">
                <div class="form-row">
                  <label>Tipo de Recurso *</label>
                  <select id="new-res-type" required>
                    <option value="presentation">Diapositivas / Presentación</option>
                    <option value="document">Guía o Documento PDF</option>
                    <option value="assets">Kit Gráfico / Assets</option>
                    <option value="multimedia">Video / Multimedia</option>
                    <option value="links">Enlace Externo / API</option>
                  </select>
                </div>
                <div class="form-row">
                  <label>Dirigido a *</label>
                  <select id="new-res-audience" required>
                    <option value="Estudiantes">Estudiantes Creadores</option>
                    <option value="Docentes">Docentes & Mentores</option>
                    <option value="Todos">Toda la Comunidad</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <label>Enlace o Archivo de Referencia (URL / Doc) *</label>
                <input type="text" id="new-res-url" required placeholder="https://... o nombre del recurso" value="#">
              </div>
            </div>

            <div class="admin-modal-footer">
              <button type="button" class="btn btn-outline" onclick="window.AdminView.closeModal()">Cancelar</button>
              <button type="submit" class="btn btn-cyan"><span>💾</span> Publicar Recurso</button>
            </div>
          </form>
        </div>
      </div>
    `;
  },

  handleCreateResourceSubmit(e) {
    e.preventDefault();
    const title = document.getElementById('new-res-title').value.trim();
    const desc = document.getElementById('new-res-desc').value.trim();
    const type = document.getElementById('new-res-type').value;
    const audience = document.getElementById('new-res-audience').value;
    const url = document.getElementById('new-res-url').value.trim();

    const iconMap = {
      presentation: '📊',
      document: '📝',
      assets: '🎨',
      multimedia: '🎬',
      links: '🌐'
    };

    const newRes = {
      id: 'res_' + Date.now(),
      title,
      description: desc,
      type,
      category: type === 'presentation' ? 'Plantilla' : (type === 'document' ? 'Guía' : 'Recurso'),
      audience,
      url,
      icon: iconMap[type] || '📦',
      format: type === 'presentation' ? 'Diapositivas Mentix' : (type === 'document' ? 'PDF Oficial' : 'Recurso Web'),
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    const list = this.getResources();
    list.unshift(newRes);
    try {
      localStorage.setItem('mentix_admin_resources', JSON.stringify(list));
    } catch(err) {}

    this.logAuditEvent(`Nuevo recurso didáctico publicado: "${title}"`, 'Recursos');
    this.showToast('Recurso publicado exitosamente', 'success');
    this.closeModal();
    this.ensureResources();
    this.renderActiveTab();
  },

  deleteResource(resId) {
    if (!confirm('¿Deseas eliminar este recurso didáctico?')) return;
    let list = this.getResources();
    const item = list.find(r => r.id === resId);
    list = list.filter(r => r.id !== resId);
    try {
      localStorage.setItem('mentix_admin_resources', JSON.stringify(list));
    } catch(err) {}

    this.logAuditEvent(`Recurso didáctico eliminado: ${item ? item.title : resId}`, 'Recursos');
    this.showToast('Recurso eliminado', 'info');
    this.ensureResources();
    this.renderActiveTab();
  },

  downloadResource(resId) {
    const list = this.getResources();
    const item = list.find(r => r.id === resId);
    if (!item) return;

    if (item.type === 'presentation') {
      this.showToast(`Cargando plantilla de diapositivas "${item.title}"...`, 'success');
      setTimeout(() => {
        window.appRouter.navigate('projects', { viewMode: 'create' });
      }, 700);
    } else {
      this.showToast(`Descargando recurso: ${item.title}`, 'success');
      const blob = new Blob([JSON.stringify(item, null, 2)], { type: 'application/json' });
      const dlUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = `${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(dlUrl);
    }
  },

  filterBySpecificCategory(catId) {
    this.projectFilter.category = catId;
    this.switchTab('projects');
  },

  handleGlobalSearch(query) {
    if (!query) return;
    if (this.activeTab !== 'projects' && this.activeTab !== 'users') {
      this.switchTab('projects');
    }
    if (this.activeTab === 'projects') {
      this.setProjectSearch(query);
    } else if (this.activeTab === 'users') {
      this.setUserSearch(query);
    }
  },

  // ==========================================
  // SIDEBAR, NOTIFICACIONES Y UI MENUS
  // ==========================================

  toggleSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;
    localStorage.setItem('mentix_admin_sidebar_collapsed', this.sidebarCollapsed);
    const root = document.getElementById('mentix-admin-root');
    if (root) {
      if (this.sidebarCollapsed) root.classList.add('sidebar-collapsed');
      else root.classList.remove('sidebar-collapsed');
    }
  },

  toggleMobileSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    if (sidebar) sidebar.classList.toggle('mobile-open');
  },

  toggleNotificationsMenu() {
    const pop = document.getElementById('admin-notif-popover');
    if (pop) {
      pop.style.display = pop.style.display === 'none' ? 'block' : 'none';
    }
  },

  toggleUserMenu() {
    if (confirm('¿Deseas cerrar sesión del panel de administración?')) {
      window.appRouter.navigate('projects');
    }
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('admin-toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `admin-toast toast-${type}`;
    const icon = type === 'success' ? '✅' : (type === 'warning' ? '⚠️' : 'ℹ️');
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  // ==========================================
  // PERSONALIZACIÓN DEL ROBOT HERO BANNER Y TEMAS
  // ==========================================

  setRobotBannerPreset(bannerPath) {
    localStorage.setItem('mentix_admin_hero_banner', bannerPath);
    localStorage.setItem('mentix_projects_hero_banner', bannerPath);
    if (window.appState) {
      window.appState.projectsHeroBanner = bannerPath;
    }
    const img = document.getElementById('admin-banner-preview-img');
    if (img) img.src = bannerPath;

    this.logAuditEvent(`Banner de proyectos actualizado a preset: ${bannerPath}`, 'Diseño');
    this.showToast('Banner del robot actualizado para toda la plataforma', 'success');
  },

  handleCustomBannerUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      localStorage.setItem('mentix_admin_hero_banner', dataUrl);
      localStorage.setItem('mentix_projects_hero_banner', dataUrl);
      if (window.appState) {
        window.appState.projectsHeroBanner = dataUrl;
      }
      const img = document.getElementById('admin-banner-preview-img');
      if (img) img.src = dataUrl;

      this.logAuditEvent('Banner personalizado de robot subido por el administrador', 'Diseño');
      this.showToast('Banner personalizado guardado y activado globalmente', 'success');
    };
    reader.readAsDataURL(file);
  },

  getSavedDesign() {
    try {
      const s = localStorage.getItem('mentix_admin_design');
      return s ? JSON.parse(s) : { bgTheme: 'ocean', accentColor: 'cyan', timerColor: 'yellow', fontSize: 'normal', contrast: 'normal' };
    } catch(e) {
      return { bgTheme: 'ocean', accentColor: 'cyan', timerColor: 'yellow', fontSize: 'normal', contrast: 'normal' };
    }
  },

  selectTheme(themeId) {
    const s = this.getSavedDesign();
    s.bgTheme = themeId;
    localStorage.setItem('mentix_admin_design', JSON.stringify(s));
    this.applyDesign(s);
    this.renderActiveTab();
    this.showToast(`Tema visual cambiado a "${themeId}"`, 'info');
  },

  selectAccent(accentId) {
    const s = this.getSavedDesign();
    s.accentColor = accentId;
    localStorage.setItem('mentix_admin_design', JSON.stringify(s));
    this.applyDesign(s);
    this.renderActiveTab();
    this.showToast(`Color de acento cambiado a "${accentId}"`, 'info');
  },

  saveDesignSettings() {
    this.showToast('Configuraciones guardadas y aplicadas globalmente', 'success');
  },

  resetDesignDefaults() {
    if (!confirm('¿Deseas restablecer los colores y banners a sus valores predeterminados?')) return;
    localStorage.removeItem('mentix_admin_design');
    localStorage.removeItem('mentix_admin_hero_banner');
    this.applyGlobalDesignSettings();
    this.renderActiveTab();
    this.showToast('Diseño restablecido a valores por defecto', 'info');
  },

  applyDesign(s) {
    if (!s) return;
    try {
      // Temas de fondo
      if (s.bgTheme === 'cyber') {
        document.body.style.background = 'radial-gradient(circle at 15% 15%, rgba(0, 245, 212, 0.12) 0%, transparent 45%), radial-gradient(circle at 85% 85%, rgba(247, 37, 133, 0.12) 0%, transparent 45%), #070913';
      } else if (s.bgTheme === 'matrix') {
        document.body.style.background = 'radial-gradient(circle at 50% 20%, rgba(6, 214, 160, 0.15) 0%, transparent 60%), #040d09';
      } else if (s.bgTheme === 'ocean') {
        document.body.style.background = 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.18) 0%, transparent 55%), #040d1a';
      } else if (s.bgTheme === 'sunset') {
        document.body.style.background = 'radial-gradient(circle at 10% 20%, rgba(251, 86, 7, 0.2) 0%, transparent 55%), #180908';
      } else if (s.bgTheme === 'amoled') {
        document.body.style.background = '#000000';
      } else {
        document.body.style.background = '';
      }

      // Colores de acento
      const colors = {
        cyan: '#00f5d4',
        magenta: '#f72585',
        gold: '#ffb703',
        emerald: '#06d6a0',
        purple: '#a855f7',
        blue: '#3b82f6'
      };
      if (s.accentColor && colors[s.accentColor]) {
        document.documentElement.style.setProperty('--neon-cyan', colors[s.accentColor]);
        document.documentElement.style.setProperty('--border-glow', colors[s.accentColor] + '55');
      }
    } catch(e) {}
  },

  applyGlobalDesignSettings() {
    const s = this.getSavedDesign();
    this.applyDesign(s);
  },

  // ==========================================
  // AUDITORÍA Y HISTORIAL
  // ==========================================

  ensureAuditLogs() {
    let logs = [];
    try {
      logs = JSON.parse(localStorage.getItem('mentix_admin_audit_logs') || '[]');
    } catch(e) {}

    if (!logs || logs.length === 0) {
      logs = [
        { id: 1, timestamp: new Date(Date.now() - 3600000).toLocaleString('es-CO'), admin: 'Super Admin', action: 'Acceso a consola administrativa', module: 'Autenticación', ip: '192.168.1.10', status: 'success' },
        { id: 2, timestamp: new Date(Date.now() - 7200000).toLocaleString('es-CO'), admin: 'Super Admin', action: 'Aprobación de proyecto de Ciencias', module: 'Proyectos', ip: '192.168.1.10', status: 'success' },
        { id: 3, timestamp: new Date(Date.now() - 14400000).toLocaleString('es-CO'), admin: 'Docente Mentor', action: 'Actualización de categoría Robótica', module: 'Categorías', ip: '192.168.1.45', status: 'success' }
      ];
      localStorage.setItem('mentix_admin_audit_logs', JSON.stringify(logs));
    }
  },

  getAuditLogs() {
    try {
      return JSON.parse(localStorage.getItem('mentix_admin_audit_logs') || '[]');
    } catch(e) {
      return [];
    }
  },

  logAuditEvent(action, module = 'General') {
    const logs = this.getAuditLogs();
    const newLog = {
      id: Date.now(),
      timestamp: new Date().toLocaleString('es-CO'),
      admin: (window.appState && window.appState.currentUser && window.appState.currentUser.name) || 'Super Admin',
      action,
      module,
      ip: '192.168.1.10 (Local)',
      status: 'success'
    };
    logs.unshift(newLog);
    if (logs.length > 100) logs.pop();
    try {
      localStorage.setItem('mentix_admin_audit_logs', JSON.stringify(logs));
    } catch(e) {}
  },

  clearAuditLogs() {
    if (!confirm('¿Deseas vaciar el registro histórico de auditoría?')) return;
    localStorage.setItem('mentix_admin_audit_logs', JSON.stringify([]));
    this.showToast('Historial de auditoría vaciado', 'info');
    this.renderActiveTab();
  },

  getRecentActivityItems() {
    const logs = this.getAuditLogs();
    return logs.map(l => ({
      title: l.action,
      actor: l.admin,
      time: l.timestamp,
      type: l.module === 'Proyectos' ? 'cyan' : (l.module === 'Usuarios' ? 'gold' : 'blue'),
      badge: l.module
    }));
  },

  // ==========================================
  // EXPORTACIÓN Y BACKUP
  // ==========================================

  exportProjectsCSV() {
    const projects = this.getRealProjects();
    if (projects.length === 0) {
      this.showToast('No hay proyectos para exportar', 'warning');
      return;
    }

    let csvContent = 'ID,Titulo,Creador,Categoria,Estado,Visibilidad,Fecha\n';
    projects.forEach(p => {
      const title = `"${(p.title || '').replace(/"/g, '""')}"`;
      const creator = `"${(p.creatorName || p.author || 'Estudiante').replace(/"/g, '""')}"`;
      const cat = `"${(p.category || 'General').replace(/"/g, '""')}"`;
      const status = p.status || 'in_progress';
      const vis = p.visibility || 'public';
      const date = p.createdAt || '';
      csvContent += `${p.id},${title},${creator},${cat},${status},${vis},${date}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentix_proyectos_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    this.logAuditEvent('Exportación CSV de proyectos generada', 'Reportes');
    this.showToast('Archivo CSV descargado con éxito', 'success');
  },

  exportFullDatabase() {
    const data = {
      version: '3.5.0',
      timestamp: new Date().toISOString(),
      challenges: window.appState.challenges || [],
      users: window.appState.users || [],
      categories: window.appState.categories || [],
      auditLogs: this.getAuditLogs(),
      designSettings: this.getSavedDesign()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentix_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    this.logAuditEvent('Copia de respaldo completa JSON exportada', 'Seguridad');
    this.showToast('Respaldo JSON descargado con éxito', 'success');
  },

  resetFactoryData() {
    if (!confirm('⚠️ ATENCIÓN: Esta acción restaurará la base de datos de usuarios y proyectos a sus valores iniciales. ¿Deseas continuar?')) return;
    localStorage.clear();
    location.reload();
  }
};
