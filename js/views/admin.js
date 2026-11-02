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
  auditFilter: {
    search: '',
    module: 'all'
  },
  sidebarCollapsed: false,
  selectedProjectForModal: null,
  activeModalTab: 'general',

  /**
   * Inicialización y renderizado principal
   */
  render() {
    const container = document.getElementById('view-admin');
    if (!container) return;

    // Sincronizar datos globales
    this.ensureAuditLogs();
    this.sidebarCollapsed = localStorage.getItem('mentix_admin_sidebar_collapsed') === 'true';

    // Inyectar layout SaaS completo
    container.innerHTML = `
      <div class="mentix-admin-layout ${this.sidebarCollapsed ? 'sidebar-collapsed' : ''}" id="mentix-admin-root">
        
        <!-- SIDEBAR LATERAL AZUL OSCURO -->
        <aside class="mentix-admin-sidebar" id="admin-sidebar">
          <div class="admin-sidebar-header">
            <div class="admin-brand-icon">
              <span>⚡</span>
            </div>
            <div class="admin-brand-text">
              <h3>MENTIX</h3>
              <span>CENTRO ADMINISTRATIVO</span>
            </div>
            <button class="admin-sidebar-toggle-btn" title="Contraer menú" onclick="window.AdminView.toggleSidebar()">
              <span>◀</span>
            </button>
          </div>

          <!-- Navegación del Sidebar -->
          <nav class="admin-sidebar-nav">
            <button class="admin-nav-item ${this.activeTab === 'dashboard' ? 'active' : ''}" onclick="window.AdminView.switchTab('dashboard')">
              <span class="admin-nav-icon">📊</span>
              <span class="admin-nav-label">Dashboard</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'projects' ? 'active' : ''}" onclick="window.AdminView.switchTab('projects')">
              <span class="admin-nav-icon">🚀</span>
              <span class="admin-nav-label">Proyectos</span>
              <span class="admin-nav-badge">${(window.appState && window.appState.challenges ? window.appState.challenges.length : 0)}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'users' ? 'active' : ''}" onclick="window.AdminView.switchTab('users')">
              <span class="admin-nav-icon">👥</span>
              <span class="admin-nav-label">Usuarios</span>
              <span class="admin-nav-badge">${(window.appState && window.appState.users ? window.appState.users.length : 0)}</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'categories' ? 'active' : ''}" onclick="window.AdminView.switchTab('categories')">
              <span class="admin-nav-icon">🏷️</span>
              <span class="admin-nav-label">Categorías</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'reports' ? 'active' : ''}" onclick="window.AdminView.switchTab('reports')">
              <span class="admin-nav-icon">📈</span>
              <span class="admin-nav-label">Reportes</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'audit' ? 'active' : ''}" onclick="window.AdminView.switchTab('audit')">
              <span class="admin-nav-icon">🛡️</span>
              <span class="admin-nav-label">Auditoría</span>
            </button>
            <button class="admin-nav-item ${this.activeTab === 'settings' ? 'active' : ''}" onclick="window.AdminView.switchTab('settings')">
              <span class="admin-nav-icon">⚙️</span>
              <span class="admin-nav-label">Configuración</span>
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
      case 'users':
        content.innerHTML = this.templateUsers();
        break;
      case 'categories':
        content.innerHTML = this.templateCategories();
        break;
      case 'reports':
        content.innerHTML = this.templateReports();
        break;
      case 'audit':
        content.innerHTML = this.templateAudit();
        break;
      case 'settings':
        content.innerHTML = this.templateSettings();
        break;
      default:
        content.innerHTML = this.templateDashboard();
    }
  },

  /**
   * 1. DASHBOARD EJECUTIVO
   */
  templateDashboard() {
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
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
    const rawProjects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];

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
      if (this.projectFilter.status === 'completed') {
        return p.status === 'completed' || p.stage === 'completed';
      } else if (this.projectFilter.status === 'in_progress') {
        return p.status === 'in_progress' || p.status === 'active' || !p.status;
      } else if (this.projectFilter.status === 'review') {
        return p.status === 'review';
      } else if (this.projectFilter.status === 'public') {
        return p.visibility !== 'private';
      } else if (this.projectFilter.status === 'private') {
        return p.visibility === 'private';
      }
      return true;
    });

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Gestión de Proyectos Estudiantiles</span>
      </div>

      <!-- Header del Módulo -->
      <div class="admin-section-header">
        <div>
          <h2>Explorador & Moderación de Proyectos</h2>
          <p>Supervisa los retos creados por estudiantes y docentes, controla su visibilidad pública y estados.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.exportProjectsCSV()">
            <span>📥</span> Exportar CSV
          </button>
          <button class="btn btn-cyan" onclick="window.appRouter.navigate('projects')">
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
   * Vista de Cuadrícula de Tarjetas de Proyectos
   */
  renderProjectCardsGrid(projects) {
    return `
      <div class="admin-projects-grid">
        ${projects.map(p => {
          const isPublic = p.visibility !== 'private';
          const isCompleted = p.status === 'completed' || p.stage === 'completed';
          const coverImage = p.image || p.cover || 'assets/student_create_bg.jpg';
          const creatorName = p.creatorName || p.author || 'Estudiante Mentix';
          const creatorAvatar = p.creatorAvatar || '🎓';
          const categoryName = p.category || 'General';
          const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString('es-CO') : 'Reciente';

          return `
            <div class="admin-project-card">
              <!-- Portada y Badges -->
              <div class="card-cover-wrapper">
                <img src="${coverImage}" alt="${p.title}" class="card-cover-img" onerror="this.onerror=null; this.src='assets/student_create_bg.jpg';">
                <div class="card-badges-overlay">
                  <span class="badge-status ${isCompleted ? 'status-completed' : 'status-in-progress'}">
                    ${isCompleted ? '🏆 Completado' : '⚡ En Proceso'}
                  </span>
                  <span class="badge-visibility ${isPublic ? 'vis-public' : 'vis-private'}">
                    ${isPublic ? '🌐 Público' : '🔒 Privado'}
                  </span>
                </div>
              </div>

              <!-- Cuerpo de la Tarjeta -->
              <div class="card-body">
                <div class="card-category-tag">
                  <span>🏷️ ${categoryName}</span>
                </div>
                <h3 class="card-title" title="${p.title}">${p.title}</h3>
                <p class="card-desc">${p.description ? p.description.slice(0, 110) + '...' : 'Sin descripción registrada para este reto académico.'}</p>
                
                <!-- Info del Creador y Fecha -->
                <div class="card-author-row">
                  <div class="author-avatar">${creatorAvatar}</div>
                  <div class="author-details">
                    <span class="author-name">${creatorName}</span>
                    <span class="card-date">Creado el ${dateStr}</span>
                  </div>
                </div>

                <!-- Footer de Acciones Rápidas -->
                <div class="card-footer-actions">
                  <button class="btn btn-sm btn-outline" onclick="window.AdminView.openProjectDetailModal('${p.id}')">
                    <span>👁️</span> Detalle
                  </button>
                  <button class="btn btn-sm ${isPublic ? 'btn-outline-gold' : 'btn-outline-cyan'}" onclick="window.AdminView.toggleProjectVisibility('${p.id}')" title="Alternar público/privado">
                    ${isPublic ? '🔒 Ocultar' : '🌐 Publicar'}
                  </button>
                  <button class="btn btn-sm btn-danger-ghost" onclick="window.AdminView.deleteProject('${p.id}')" title="Eliminar proyecto">
                    <span>🗑️</span>
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
                    <span class="badge-status ${isCompleted ? 'status-completed' : 'status-in-progress'}">
                      ${isCompleted ? '🏆 Completado' : '⚡ En Proceso'}
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
   * 3. GESTIÓN DE USUARIOS
   */
  templateUsers() {
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

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Gestión de Usuarios y Cuentas</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Directorio de Usuarios & Roles Institucionales</h2>
          <p>Administra las cuentas de estudiantes, docentes y administradores con control de acceso granular.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-cyan" onclick="window.AdminView.openCreateUserModal()">
            <span>➕</span> Crear Administrador / Docente
          </button>
        </div>
      </div>

      <!-- Barra de Filtros -->
      <div class="admin-filter-bar">
        <div class="filter-search-box">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Buscar por nombre o correo electrónico..." value="${this.userFilter.search}" oninput="window.AdminView.setUserSearch(this.value)">
        </div>

        <div class="filter-pills">
          <button class="filter-pill ${this.userFilter.role === 'all' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('all')">Todos (${rawUsers.length})</button>
          <button class="filter-pill ${this.userFilter.role === 'admin' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('admin')">Administradores</button>
          <button class="filter-pill ${this.userFilter.role === 'teacher' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('teacher')">Docentes</button>
          <button class="filter-pill ${this.userFilter.role === 'student' ? 'active' : ''}" onclick="window.AdminView.setUserRoleFilter('student')">Estudiantes</button>
          <button class="filter-pill ${this.userFilter.status === 'blocked' ? 'active' : ''}" onclick="window.AdminView.setUserStatusFilter('blocked')">Bloqueados</button>
        </div>
      </div>

      <!-- Tabla de Usuarios -->
      <div class="admin-table-card">
        <table class="admin-data-table">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Correo Institucional</th>
              <th>Rol en Mentix</th>
              <th>Estado</th>
              <th>Nivel / XP</th>
              <th>Último Acceso</th>
              <th style="text-align: right;">Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${users.map(u => {
              const isBlocked = !!u.isBlocked;
              const roleBadge = u.role === 'admin' ? '<span class="role-badge role-admin">🛡️ Administrador</span>' :
                                u.role === 'teacher' ? '<span class="role-badge role-teacher">👨‍🏫 Docente</span>' :
                                '<span class="role-badge role-student">🎓 Estudiante</span>';

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
                  <td>${roleBadge}</td>
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
   * 4. CATEGORÍAS ACADÉMICAS
   */
  templateCategories() {
    const categories = (window.appState && window.appState.categories) ? window.appState.categories : [];
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];

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
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
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
   * 7. CONFIGURACIÓN VISUAL Y PARÁMETROS GLOBALES
   */
  templateSettings() {
    const heroBanner = localStorage.getItem('mentix_admin_hero_banner') || 'assets/projects_ui/robot_hero_banner.png';
    const s = this.getSavedDesign();

    return `
      <!-- Breadcrumbs -->
      <div class="admin-breadcrumbs">
        <span>Inicio</span>
        <span class="sep">/</span>
        <span class="active">Centro de Configuración y Personalización</span>
      </div>

      <!-- Header -->
      <div class="admin-section-header">
        <div>
          <h2>Configuración del Sistema & Personalización Visual</h2>
          <p>Ajusta el banner institucional del robot, temas cromáticos, estilos visuales y opciones avanzadas.</p>
        </div>
        <div class="admin-header-actions">
          <button class="btn btn-outline" onclick="window.AdminView.resetDesignDefaults()">
            <span>🔄</span> Restablecer Todo
          </button>
          <button class="btn btn-cyan" onclick="window.AdminView.saveDesignSettings()">
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
            <button class="modal-close-btn" onclick="window.AdminView.closeModal()">✕</button>
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
            <button class="btn btn-cyan" onclick="window.AdminView.toggleProjectVisibility('${p.id}'); window.AdminView.closeModal();">
              ${p.visibility === 'private' ? 'Hacer Público' : 'Hacer Privado'}
            </button>
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
      return `
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
                <span class="val badge-status ${p.status === 'completed' ? 'status-completed' : 'status-in-progress'}">
                  ${p.status === 'completed' ? '🏆 Completado' : '⚡ En Proceso'}
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
    const img = document.getElementById('admin-banner-preview-img');
    if (img) img.src = bannerPath;

    this.logAuditEvent(`Banner de proyectos actualizado a preset: ${bannerPath}`, 'Configuración');
    this.showToast('Banner de proyectos actualizado correctamente', 'success');
  },

  handleCustomBannerUpload(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const dataUrl = evt.target.result;
      localStorage.setItem('mentix_admin_hero_banner', dataUrl);
      const img = document.getElementById('admin-banner-preview-img');
      if (img) img.src = dataUrl;

      this.logAuditEvent('Banner personalizado subido por el administrador', 'Configuración');
      this.showToast('Banner personalizado guardado con éxito', 'success');
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
    const projects = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
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
