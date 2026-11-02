/**
 * 🔥 MENTIX - Vista de Proyectos & Retos (Projects View)
 * Gestión integral de proyectos educativos: Diapositivas, Videos interactivos y Quizzes gamificados.
 */

window.ProjectsView = {
  currentCategory: 'all',
  currentTypeFilter: 'all', // 'all' | 'presentation' | 'video' | 'document' | 'url'
  currentFilterTab: 'all',  // 'all' | 'mine' | 'in_progress' | 'completed' | 'favorites'
  sortBy: 'recent',         // 'recent' | 'popular' | 'alpha'
  layoutMode: 'grid',       // 'grid' | 'list'
  searchQuery: '',
  demoShowcaseProjects: [],
  legacyDemoShowcaseProjects: [
    {
      id: 'demo-gov-data',
      title: 'Gobierno de Datos en la Práctica',
      description: 'Metodologías ágiles para la gobernanza moderna de información y toma de decisiones.',
      tag: '✔ Completado',
      tagClass: 'badge-completed',
      date: '12 Abr 2025',
      students: 24,
      rating: '4.8',
      image: 'assets/projects_ui/card_data_gov.png',
      actionText: 'Ver Detalles →',
      secondaryText: 'Compartir',
      status: 'completed'
    },
    {
      id: 'demo-ai-society',
      title: 'Inteligencia Artificial y Sociedad',
      description: 'Impacto ético, retos y oportunidades del desarrollo de modelos generativos.',
      tag: '⏱ En Proceso',
      tagClass: 'badge-process',
      date: '10 Abr 2025',
      students: 18,
      rating: '4.6',
      image: 'assets/projects_ui/card_ai_society.png',
      actionText: 'Continuar →',
      secondaryText: 'Ver Detalles',
      status: 'in_progress'
    },
    {
      id: 'demo-open-data',
      title: 'Datos Abiertos y Transparencia',
      description: 'Estrategias prácticas para la apertura, estandarización y auditoría ciudadana.',
      tag: '👁 En Revisión',
      tagClass: 'badge-review',
      date: '8 Abr 2025',
      students: 20,
      rating: '4.7',
      image: 'assets/projects_ui/card_open_data.png',
      actionText: 'Ver Detalles →',
      secondaryText: '📊',
      status: 'review'
    }
  ],

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

  // =========================================================================
  // GESTIÓN DE BANNERS EXCLUSIVA PARA ADMINISTRADORES DE MENTIX (ROBOT BANNER)
  // =========================================================================
  isAdminUser() {
    const u = window.appState && window.appState.currentUser;
    if (!u) return false;
    const r = (u.role || '').toLowerCase().trim();
    if (r === 'admin' || r === 'administrador' || u.isAdmin === true) return true;
    if (localStorage.getItem('mentix_admin_override') === 'true') return true;
    return false;
  },

  getHeroBannerUrl() {
    const saved = localStorage.getItem('mentix_projects_hero_banner');
    if (saved) return saved;
    if (window.appState && window.appState.projectsHeroBanner) return window.appState.projectsHeroBanner;
    return 'assets/projects_ui/hero_banner.png?v=20261101_bright_sharp';
  },

  setHeroBannerUrl(url) {
    if (!this.isAdminUser()) {
      alert('⛔ Acceso denegado: Solo los administradores de Mentix pueden cambiar el banner de proyectos.');
      return false;
    }
    localStorage.setItem('mentix_projects_hero_banner', url);
    if (!window.appState) window.appState = {};
    window.appState.projectsHeroBanner = url;
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    return true;
  },

  setProjectCardBanner(projectId, bannerUrl) {
    if (!this.isAdminUser()) {
      alert('⛔ Acceso denegado: Solo los administradores de Mentix pueden cambiar el banner de proyectos.');
      return false;
    }
    if (!window.appState || !Array.isArray(window.appState.challenges)) return false;
    const proj = window.appState.challenges.find(c => c && String(c.id) === String(projectId));
    if (!proj) {
      alert('⚠️ No se encontró el proyecto seleccionado.');
      return false;
    }
    proj.banner = bannerUrl;
    proj.mainImage = bannerUrl;
    proj.thumbnailImage = bannerUrl;
    proj.image = bannerUrl;
    if (proj.govdata) {
      proj.govdata.banner = bannerUrl;
      proj.govdata.mainImage = bannerUrl;
      proj.govdata.thumbnailImage = bannerUrl;
    }
    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    return true;
  },

  promptAdminAccess() {
    const key = prompt('🛡️ Modo Administrador de Mentix\nIngresa tu clave de administrador o escribe "admin" para activar los controles exclusivos de banner:');
    if (!key) return;
    if (key.trim().toLowerCase() === 'admin' || key.trim() === 'mentix2026' || key.trim() === '1234') {
      if (!window.appState) window.appState = {};
      if (!window.appState.currentUser) window.appState.currentUser = { id: 'admin1', name: 'Administrador Mentix', role: 'admin' };
      window.appState.currentUser.role = 'admin';
      localStorage.setItem('mentix_admin_override', 'true');
      if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
      this.showToast('✅ ¡Modo Administrador activado con éxito!');
      this.render();
      this.openAdminBannerModal();
    } else {
      alert('❌ Clave no válida para el modo administrador.');
    }
  },

  ROBOT_BANNER_PRESETS: [
    {
      id: 'robot-mentor-oficial',
      title: '🤖 Robot Educador IA Mentix (Oficial)',
      desc: 'Robot humanoide cibernético en observatorio espacial de Mentix con cristales holográficos.',
      url: 'assets/projects_ui/robot_hero_banner.png',
      badge: 'OFICIAL ADMIN',
      accent: '#00f5d4'
    },
    {
      id: 'robot-cyber-ai',
      title: '🦾 Androide Mecatrónico High-Tech',
      desc: 'Interfaz neuronal cibernética, luces cian y circuitos de última generación.',
      url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1600&q=80',
      badge: 'CYBER ROBOT',
      accent: '#38bdf8'
    },
    {
      id: 'robot-quantum-lab',
      title: '🌐 Laboratorio Cuántico de Robótica',
      desc: 'Entorno de investigación en inteligencia artificial y robótica espacial.',
      url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?w=1600&q=80',
      badge: 'ROBÓTICA IA',
      accent: '#7c3aed'
    },
    {
      id: 'robot-neon-matrix',
      title: '⚡ Núcleo Robótico Cyberpunk Neón',
      desc: 'Energía violeta y neón magenta con arquitectura cibernética inmersiva.',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1600&q=80',
      badge: 'NEON MATRIX',
      accent: '#f72585'
    },
    {
      id: 'mentix-classic',
      title: '🚀 Ecosistema Mentix Clásico',
      desc: 'Banner institucional original de la plataforma Mentix.',
      url: 'assets/projects_ui/hero_banner.png?v=20261101_bright_sharp',
      badge: 'CLÁSICO',
      accent: '#0077ff'
    }
  ],

  openAdminBannerModal(targetProjectId = null) {
    if (!this.isAdminUser()) {
      alert('⛔ Acceso denegado: Solo los administradores de Mentix pueden cambiar el banner de proyectos.');
      return;
    }

    const existing = document.getElementById('mentix-admin-banner-modal-overlay');
    if (existing) existing.remove();

    const currentHero = this.getHeroBannerUrl();
    const projects = (window.appState?.challenges || []).filter(c => c && c.id && c.projectType !== 'quiz');
    const initialTargetType = targetProjectId ? 'project' : 'hero';
    let currentSelectedProj = targetProjectId ? projects.find(p => String(p.id) === String(targetProjectId)) : (projects[0] || null);

    this.selectedAdminBannerUrl = targetProjectId && currentSelectedProj ? (currentSelectedProj.banner || currentSelectedProj.mainImage || 'assets/projects_ui/robot_hero_banner.png') : (currentHero || 'assets/projects_ui/robot_hero_banner.png');
    this.selectedAdminBannerTarget = initialTargetType;
    this.selectedAdminBannerProjId = currentSelectedProj ? currentSelectedProj.id : (projects[0]?.id || '');

    const overlay = document.createElement('div');
    overlay.id = 'mentix-admin-banner-modal-overlay';
    overlay.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(4,9,24,0.88); backdrop-filter:blur(10px); z-index:999999; display:flex; align-items:center; justify-content:center; padding:1.25rem; overflow-y:auto;';

    overlay.innerHTML = this.renderAdminBannerModalHtml(projects);
    document.body.appendChild(overlay);
  },

  closeAdminBannerModal() {
    const modal = document.getElementById('mentix-admin-banner-modal-overlay');
    if (modal) modal.remove();
  },

  switchAdminBannerTarget(targetType) {
    this.selectedAdminBannerTarget = targetType;
    const heroBtn = document.getElementById('admin-banner-target-hero-btn');
    const projBtn = document.getElementById('admin-banner-target-project-btn');
    const selectBox = document.getElementById('admin-banner-project-select-container');
    const previewLabel = document.getElementById('admin-banner-preview-target-label');

    if (targetType === 'hero') {
      if (heroBtn) {
        heroBtn.style.border = '2px solid #00f5d4';
        heroBtn.style.background = 'rgba(0,245,212,0.15)';
      }
      if (projBtn) {
        projBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        projBtn.style.background = 'rgba(255,255,255,0.03)';
      }
      if (selectBox) selectBox.style.display = 'none';
      if (previewLabel) previewLabel.textContent = 'Banner Principal (Hero de Proyectos)';
      this.selectedAdminBannerUrl = this.getHeroBannerUrl();
    } else {
      if (projBtn) {
        projBtn.style.border = '2px solid #00f5d4';
        projBtn.style.background = 'rgba(0,245,212,0.15)';
      }
      if (heroBtn) {
        heroBtn.style.border = '1px solid rgba(255,255,255,0.15)';
        heroBtn.style.background = 'rgba(255,255,255,0.03)';
      }
      if (selectBox) selectBox.style.display = 'block';
      if (previewLabel) previewLabel.textContent = 'Proyecto Específico';
      const sel = document.getElementById('admin-banner-project-select');
      if (sel) this.onAdminBannerProjectChanged(sel.value);
    }

    const previewImg = document.getElementById('admin-banner-preview-img');
    if (previewImg) previewImg.src = this.selectedAdminBannerUrl;
    const urlInput = document.getElementById('admin-banner-url-input');
    if (urlInput) urlInput.value = this.selectedAdminBannerUrl;
  },

  onAdminBannerProjectChanged(projectId) {
    this.selectedAdminBannerProjId = projectId;
    const projects = (window.appState?.challenges || []);
    const proj = projects.find(p => p && String(p.id) === String(projectId));
    if (proj) {
      this.selectedAdminBannerUrl = proj.banner || proj.mainImage || proj.image || 'assets/projects_ui/robot_hero_banner.png';
      const previewImg = document.getElementById('admin-banner-preview-img');
      if (previewImg) previewImg.src = this.selectedAdminBannerUrl;
      const urlInput = document.getElementById('admin-banner-url-input');
      if (urlInput) urlInput.value = this.selectedAdminBannerUrl;
      const previewLabel = document.getElementById('admin-banner-preview-target-label');
      if (previewLabel) previewLabel.textContent = `Proyecto: "${proj.title}"`;
    }
  },

  selectAdminBannerPreset(presetId) {
    const preset = this.ROBOT_BANNER_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    this.selectedAdminBannerUrl = preset.url;
    const previewImg = document.getElementById('admin-banner-preview-img');
    if (previewImg) previewImg.src = preset.url;
    const urlInput = document.getElementById('admin-banner-url-input');
    if (urlInput) urlInput.value = preset.url;
    this.showToast(`🤖 Seleccionado: ${preset.title}`);
  },

  handleAdminBannerFileUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.selectedAdminBannerUrl = dataUrl;
      const previewImg = document.getElementById('admin-banner-preview-img');
      if (previewImg) previewImg.src = dataUrl;
      const urlInput = document.getElementById('admin-banner-url-input');
      if (urlInput) urlInput.value = dataUrl.slice(0, 50) + '... (Imagen cargada)';
      this.showToast('📷 Imagen local cargada para previsualización.');
    };
    reader.readAsDataURL(file);
  },

  previewAdminBannerUrl(url) {
    const trimmed = (url || '').trim();
    if (trimmed) {
      this.selectedAdminBannerUrl = trimmed;
      const previewImg = document.getElementById('admin-banner-preview-img');
      if (previewImg) previewImg.src = trimmed;
    }
  },

  applyAdminBanner() {
    if (!this.isAdminUser()) {
      alert('⛔ Acceso denegado: Solo los administradores de Mentix pueden cambiar el banner de proyectos.');
      return;
    }
    const finalUrl = this.selectedAdminBannerUrl;
    if (!finalUrl) {
      alert('⚠️ Por favor selecciona o ingresa una URL de banner antes de guardar.');
      return;
    }

    if (this.selectedAdminBannerTarget === 'hero') {
      this.setHeroBannerUrl(finalUrl);
      const heroImg = document.getElementById('mentix-projects-hero-banner-img');
      if (heroImg) heroImg.src = finalUrl;
      this.showToast('🤖 ¡Banner de Robot aplicado al Hero de Proyectos con éxito!');
    } else {
      const projId = this.selectedAdminBannerProjId;
      if (!projId) {
        alert('⚠️ Selecciona un proyecto válido de la lista.');
        return;
      }
      this.setProjectCardBanner(projId, finalUrl);
      const projects = (window.appState?.challenges || []);
      const p = projects.find(c => c && String(c.id) === String(projId));
      const pName = p ? p.title : 'el proyecto';
      this.showToast(`🤖 ¡Banner de Robot asignado al proyecto "${pName}"!`);
      this.render();
    }

    this.closeAdminBannerModal();
  },

  renderAdminBannerModalHtml(projects) {
    return `
      <div style="background: linear-gradient(135deg, #071739 0%, #0d204d 50%, #071129 100%); border: 2px solid #00f5d4; border-radius: 20px; max-width: 920px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 1.85rem; box-shadow: 0 25px 70px rgba(0,0,0,0.8), 0 0 40px rgba(0,245,212,0.25); color: #ffffff; position: relative;">
        <!-- Header -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.12); padding-bottom: 1rem;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(0,245,212,0.15); border: 1px solid #00f5d4; padding: 0.2rem 0.65rem; border-radius: 999px; font-size: 0.75rem; font-weight: 900; color: #00f5d4; margin-bottom: 0.4rem;">
              👑 MODO ADMINISTRADOR EXCLUSIVO
            </div>
            <h2 style="margin: 0; font-size: 1.45rem; font-weight: 900; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
              <span>🤖</span> <span>Gestor de Banners de Robot y Proyectos</span>
            </h2>
            <p style="margin: 0.25rem 0 0; font-size: 0.86rem; color: #cbd5e1;">
              Configura el Banner de Robot oficial para el encabezado principal de la plataforma o personaliza el banner de cualquier proyecto específico.
            </p>
          </div>
          <button type="button" onclick="window.ProjectsView.closeAdminBannerModal()" style="background: none; border: none; color: #cbd5e1; font-size: 1.5rem; cursor: pointer; line-height: 1;" title="Cerrar">✕</button>
        </div>

        <!-- Selector de Destino: Hero Banner vs Proyecto Específico -->
        <div style="background: rgba(0,0,0,0.35); border: 1.5px solid rgba(255,255,255,0.12); border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
          <label style="display: block; font-size: 0.85rem; font-weight: 800; color: #00f5d4; margin-bottom: 0.6rem; text-transform: uppercase; letter-spacing: 0.04em;">
            1. ¿A qué elemento deseas aplicar o cambiar el banner?
          </label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem;">
            <div 
              id="admin-banner-target-hero-btn"
              onclick="window.ProjectsView.switchAdminBannerTarget('hero')"
              style="padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; border: ${this.selectedAdminBannerTarget === 'hero' ? '2px solid #00f5d4; background: rgba(0,245,212,0.15);' : '1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.03);'}; display: flex; align-items: center; gap: 0.65rem;"
            >
              <span style="font-size: 1.5rem;">🌐</span>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: #ffffff;">Banner Principal (Hero Banner)</strong>
                <span style="font-size: 0.75rem; color: #94a3b8;">Encabezado superior de toda la vista de proyectos</span>
              </div>
            </div>

            <div 
              id="admin-banner-target-project-btn"
              onclick="window.ProjectsView.switchAdminBannerTarget('project')"
              style="padding: 0.85rem 1rem; border-radius: 12px; cursor: pointer; border: ${this.selectedAdminBannerTarget === 'project' ? '2px solid #00f5d4; background: rgba(0,245,212,0.15);' : '1px solid rgba(255,255,255,0.15); background: rgba(255,255,255,0.03);'}; display: flex; align-items: center; gap: 0.65rem;"
            >
              <span style="font-size: 1.5rem;">📁</span>
              <div>
                <strong style="display: block; font-size: 0.9rem; color: #ffffff;">Banner de un Proyecto Específico</strong>
                <span style="font-size: 0.75rem; color: #94a3b8;">Asignar el banner a una tarjeta y landing page concreta</span>
              </div>
            </div>
          </div>

          <!-- Dropdown de Proyecto (Visible si target === 'project') -->
          <div id="admin-banner-project-select-container" style="margin-top: 0.85rem; display: ${this.selectedAdminBannerTarget === 'project' ? 'block' : 'none'};">
            <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #cbd5e1; margin-bottom: 0.35rem;">
              Selecciona el proyecto a modificar:
            </label>
            <select 
              id="admin-banner-project-select" 
              onchange="window.ProjectsView.onAdminBannerProjectChanged(this.value)"
              style="width: 100%; padding: 0.65rem 0.9rem; border-radius: 10px; background: #040e24; color: #ffffff; border: 1.5px solid #00f5d4; font-size: 0.9rem; font-weight: 700; outline: none;"
            >
              ${projects.map(p => `
                <option value="${p.id}" ${String(p.id) === String(this.selectedAdminBannerProjId) ? 'selected' : ''}>
                  ${this.escapeHtml(p.title || 'Proyecto sin título')} (${p.categoryName || 'General'})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- Galería de Banners con Robot Destacado -->
        <div style="margin-bottom: 1.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
            <label style="font-size: 0.85rem; font-weight: 800; color: #00f5d4; text-transform: uppercase; letter-spacing: 0.04em;">
              2. Elige el Banner de Robot o Tema Prediseñado:
            </label>
            <span style="font-size: 0.75rem; color: #94a3b8;">Haz clic en cualquier tarjeta para previsualizar</span>
          </div>

          <!-- TARJETA DESTACADA: BANNER DE ROBOT EDUCADOR MENTIX -->
          <div 
            onclick="window.ProjectsView.selectAdminBannerPreset('robot-mentor-oficial')"
            style="margin-bottom: 1rem; border-radius: 14px; overflow: hidden; border: 2.5px solid #00f5d4; box-shadow: 0 0 25px rgba(0,245,212,0.35); cursor: pointer; position: relative; background: #071739;"
            title="Seleccionar el Banner Oficial de Robot"
          >
            <div style="position: relative; width: 100%; height: 180px; overflow: hidden;">
              <img 
                src="assets/projects_ui/robot_hero_banner.png" 
                alt="Banner de Robot Oficial Mentix" 
                style="width: 100%; height: 100%; object-fit: cover; display: block;" 
              />
              <div style="position: absolute; top: 12px; left: 12px; background: linear-gradient(135deg, #00f5d4, #0077ff); color: #071739; font-weight: 900; font-size: 0.78rem; padding: 0.25rem 0.75rem; border-radius: 999px; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                🤖 BANNER DE ROBOT OFICIAL MENTIX
              </div>
              <div style="position: absolute; bottom: 0; left: 0; right: 0; background: linear-gradient(to top, rgba(7,23,57,0.95), transparent); padding: 1rem 1.25rem 0.75rem; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                  <strong style="color: #ffffff; font-size: 1.05rem; display: block;">Robot Educador IA Mentix</strong>
                  <span style="color: #a7f3d0; font-size: 0.8rem;">Observatorio espacial con tecnología cibernética y cristales holográficos</span>
                </div>
                <button type="button" class="btn btn-cyan" style="font-weight: 900; font-size: 0.8rem; padding: 0.35rem 0.85rem;">
                  ✓ Seleccionar Robot
                </button>
              </div>
            </div>
          </div>

          <!-- Otras opciones robot / cyberpunk -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem;">
            ${this.ROBOT_BANNER_PRESETS.filter(p => p.id !== 'robot-mentor-oficial').map(preset => `
              <div 
                onclick="window.ProjectsView.selectAdminBannerPreset('${preset.id}')"
                style="border-radius: 12px; overflow: hidden; border: 1.5px solid ${this.selectedAdminBannerUrl === preset.url ? '#00f5d4' : 'rgba(255,255,255,0.15)'}; background: #0a122c; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;"
                onmouseenter="this.style.transform='translateY(-2px)'"
                onmouseleave="this.style.transform='none'"
              >
                <div style="height: 95px; width: 100%; overflow: hidden; position: relative;">
                  <img src="${preset.url}" alt="${preset.title}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
                  <span style="position: absolute; top: 6px; left: 6px; font-size: 0.68rem; font-weight: 800; background: rgba(0,0,0,0.7); color: ${preset.accent || '#00f5d4'}; padding: 0.15rem 0.45rem; border-radius: 4px;">
                    ${preset.badge}
                  </span>
                </div>
                <div style="padding: 0.6rem 0.75rem;">
                  <div style="font-size: 0.82rem; font-weight: 800; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${preset.title}
                  </div>
                  <div style="font-size: 0.7rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${preset.desc}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Opciones de Subida de Archivo y URL Externa -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem;">
          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem;">
              📷 Subir Imagen desde tu PC (.png, .jpg, .webp):
            </label>
            <input 
              type="file" 
              id="admin-banner-file-input" 
              accept="image/*" 
              style="display: none;" 
              onchange="if(this.files && this.files[0]) window.ProjectsView.handleAdminBannerFileUpload(this.files[0])"
            />
            <button 
              type="button" 
              class="btn btn-outline" 
              style="width: 100%; border-color: #00f5d4; color: #00f5d4; font-weight: 800; font-size: 0.82rem; padding: 0.5rem;"
              onclick="document.getElementById('admin-banner-file-input').click()"
            >
              📁 Buscar archivo local...
            </button>
          </div>

          <div>
            <label style="display: block; font-size: 0.8rem; font-weight: 800; color: #cbd5e1; margin-bottom: 0.4rem;">
              🔗 O escribir URL externa de la imagen:
            </label>
            <input 
              type="url" 
              id="admin-banner-url-input" 
              value="${this.selectedAdminBannerUrl || ''}" 
              placeholder="https://images.unsplash.com/..." 
              style="width: 100%; padding: 0.5rem 0.75rem; border-radius: 8px; background: #040e24; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-size: 0.82rem; outline: none;"
              oninput="window.ProjectsView.previewAdminBannerUrl(this.value)"
            />
          </div>
        </div>

        <!-- Vista Previa en Vivo -->
        <div style="margin-bottom: 1.5rem;">
          <div style="font-size: 0.8rem; font-weight: 800; color: #94a3b8; margin-bottom: 0.4rem; text-transform: uppercase;">
            Lienzo de Vista Previa en Tiempo Real:
          </div>
          <div style="border-radius: 14px; overflow: hidden; height: 160px; width: 100%; background: #000; border: 1.5px solid #00f5d4; box-shadow: 0 8px 25px rgba(0,0,0,0.5); position: relative;">
            <img 
              id="admin-banner-preview-img" 
              src="${this.selectedAdminBannerUrl}" 
              alt="Vista previa" 
              style="width: 100%; height: 100%; object-fit: cover; display: block;" 
            />
            <div style="position: absolute; bottom: 10px; left: 12px; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); padding: 0.3rem 0.75rem; border-radius: 999px; font-size: 0.75rem; color: #00f5d4; font-weight: 800;">
              Destino: <span id="admin-banner-preview-target-label">${this.selectedAdminBannerTarget === 'hero' ? 'Banner Principal (Hero)' : 'Proyecto Seleccionado'}</span>
            </div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div style="display: flex; justify-content: flex-end; gap: 0.75rem; border-top: 1px solid rgba(255,255,255,0.12); padding-top: 1rem;">
          <button type="button" class="btn btn-outline" style="font-size: 0.88rem; padding: 0.55rem 1.25rem;" onclick="window.ProjectsView.closeAdminBannerModal()">
            Cancelar
          </button>
          <button type="button" class="btn btn-cyan" style="font-size: 0.9rem; font-weight: 900; padding: 0.55rem 1.75rem; background: linear-gradient(135deg, #00f5d4, #0077ff); color: #071739; border: none; box-shadow: 0 4px 18px rgba(0,245,212,0.45);" onclick="window.ProjectsView.applyAdminBanner()">
            💾 Guardar y Aplicar Banner
          </button>
        </div>
      </div>
    `;
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

  setCustomFilter(tab) {
    this.currentFilterTab = tab;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  setSort(sortVal) {
    this.sortBy = sortVal;
    this.render();
  },

  setLayout(layout) {
    this.layoutMode = layout;
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
  },

  shareProject(id, title) {
    if (window.soundEngine) window.soundEngine.playClick();
    const url = window.location.origin + window.location.pathname + '#projects?id=' + encodeURIComponent(id);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('🔗 ¡Enlace del proyecto copiado al portapapeles!');
      }).catch(() => {
        prompt('Copia el enlace para compartir:', url);
      });
    } else {
      prompt('Copia el enlace para compartir:', url);
    }
  },

  showToast(msg) {
    const existing = document.getElementById('mentix-saas-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.id = 'mentix-saas-toast';
    toast.innerHTML = msg;
    toast.style.cssText = 'position:fixed;bottom:24px;right:24px;background:#0f172a;color:#ffffff;padding:12px 20px;border-radius:12px;box-shadow:0 12px 36px rgba(0,0,0,0.35);z-index:999999;font-weight:700;font-size:0.92rem;border:1.5px solid rgba(0,245,212,0.6);display:flex;align-items:center;gap:8px;';
    document.body.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3500);
  },

  openTutorialModal() {
    if (window.soundEngine) window.soundEngine.playClick();
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop active';
    modal.style.zIndex = '999999';
    modal.innerHTML = `
      <div class="modal" style="max-width: 580px; padding: 2.2rem; border-radius: 20px; background: #ffffff; color: #0f172a; text-align: center; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="font-size: 3.2rem; margin-bottom: 0.6rem;">🎓</div>
        <h3 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 0.75rem; color: #0f172a;">Tutorial MENTIX Proyectos</h3>
        <p style="color: #475569; font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.5;">
          Aprende a estructurar tus proyectos educativos con Inteligencia Artificial, diseñar presentaciones dinámicas y evaluar el avance de tus estudiantes en tiempo real.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 12px; margin-bottom: 1.5rem; text-align: left; font-size: 0.9rem; color: #334155;">
          <div style="margin-bottom: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            <span>🤖</span>
            <div><strong>1. Diseña con IA:</strong> Utiliza el asistente inteligente para generar diapositivas y actividades didácticas automáticamente.</div>
          </div>
          <div style="margin-bottom: 0.75rem; display: flex; align-items: flex-start; gap: 0.5rem;">
            <span>📊</span>
            <div><strong>2. Monitorea el Progreso:</strong> Visualiza en el panel circular el porcentaje completado y la participación estudiantil.</div>
          </div>
          <div style="display: flex; align-items: flex-start; gap: 0.5rem;">
            <span>🔗</span>
            <div><strong>3. Comparte y Evalúa:</strong> Envía el enlace a tus alumnos para que exploren el contenido interactivo y respondan preguntas.</div>
          </div>
        </div>
        <div style="display: flex; gap: 0.75rem; justify-content: center;">
          <button class="btn btn-primary" onclick="this.closest('.modal-backdrop').remove(); window.ProjectsView.openCreateProjectModal();" style="padding: 0.75rem 1.5rem; font-weight: 800; border-radius: 10px; background: #2563eb; color: #fff; border: none;">
            🚀 ¡Crear un Proyecto Ahora!
          </button>
          <button class="btn btn-outline" onclick="this.closest('.modal-backdrop').remove();" style="padding: 0.75rem 1.5rem; font-weight: 800; border-radius: 10px; border-color: #cbd5e1; color: #475569;">
            Cerrar
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  openCommunity() {
    this.showToast('👥 Comunidad MENTIX: ¡Conectando con más de 1,200 docentes e innovadores educativos!');
  },

  render() {
    const container = document.getElementById('view-projects');
    if (!container) return;

    const u = window.appState.currentUser;
    const isTeacherOrAdmin = this.isTeacherOrAdmin();
    const isAdmin = this.isAdminUser();
    // Asegurar que existan los proyectos estructurados en la base de datos
    if (!window.appState.challenges) window.appState.challenges = [];

    // Integrar proyectos y borradores del Asistente Inteligente (mentix_govdata_wizard_drafts)
    try {
      const rawDrafts = localStorage.getItem('mentix_govdata_wizard_drafts');
      if (rawDrafts) {
        const wizardDrafts = JSON.parse(rawDrafts);
        if (Array.isArray(wizardDrafts)) {
          wizardDrafts.forEach(wd => {
            if (wd && wd.id) {
              const exIdx = window.appState.challenges.findIndex(c => c && c.id === wd.id);
              const formatted = {
                id: wd.id,
                title: wd.title || wd.landingConfig?.publicName || 'Proyecto GovData',
                subtitle: wd.subtitle || 'Proyecto GovData Nexus',
                description: wd.shortDescription || wd.description || wd.fullDescription || 'Proyecto documentado con el Asistente Inteligente GovData Nexus.',
                projectType: wd.projectType || 'presentation',
                isGovDataProject: true,
                category: wd.category || 'tecnologia',
                categoryName: wd.categoryName || 'Tecnología & Programación',
                author: wd.author || wd.teamLead || 'Docente / Estudiante',
                authorRole: wd.authorRole || 'student',
                status: wd.status || (wd.publicationStatus === 'published' ? 'completed' : 'in_progress'),
                publicationStatus: wd.publicationStatus || 'pending_approval',
                approvalStatus: wd.approvalStatus || 'pending',
                isPublic: wd.isPublic === true,
                image: wd.mainImage || wd.thumbnailImage || wd.banner || 'assets/projects_ui/card_data_gov.png',
                banner: wd.banner || wd.mainImage || 'assets/projects_ui/card_data_gov.png',
                createdAt: wd.createdAt || new Date().toISOString(),
                updatedAt: wd.updatedAt || new Date().toISOString(),
                govdata: wd
              };
              if (exIdx >= 0) {
                window.appState.challenges[exIdx] = { ...formatted, ...window.appState.challenges[exIdx], title: wd.title || window.appState.challenges[exIdx].title };
              } else {
                window.appState.challenges.unshift(formatted);
              }
            }
          });
        }
      }
    } catch(e) {}

    // Integrar proyectos de bóvedas personales
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mentix_user_projects_')) {
          const vault = JSON.parse(localStorage.getItem(k) || '[]');
          if (Array.isArray(vault)) {
            vault.forEach(vp => {
              if (vp && vp.id && !window.appState.challenges.some(c => c && c.id === vp.id)) {
                window.appState.challenges.unshift(vp);
              }
            });
          }
        }
      }
    } catch(e) {}

    const hasDBProjects = window.appState.challenges.some(c => 
      c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url' || 
      c.isGovDataProject || c.project_type || c.is_gov_data_project
    );
    if (!hasDBProjects && typeof DEFAULT_PROJECTS !== 'undefined') {
      DEFAULT_PROJECTS.forEach(dp => {
        if (!window.appState.challenges.some(c => c.id === dp.id)) {
          window.appState.challenges.push({ ...dp });
        }
      });
      if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
    }

    // Regla estricta de autorización: Ningún proyecto está autorizado ni publicado públicamente
    // si no cuenta con aprobación explícita de un Administrador (approvalStatus === 'approved' y authorizedAt)
    window.appState.challenges.forEach(c => {
      if (!c || !c.id) return;
      const isProject = c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url' || c.isGovDataProject || c.project_type || c.is_gov_data_project;
      if (isProject) {
        if (c.approvalStatus !== 'approved' || !c.authorizedAt) {
          c.approvalStatus = 'pending';
          c.publicationStatus = 'pending_approval';
          c.isPublic = false;
          if (c.status === 'completed') c.status = 'review';
        }
      }
    });

    // En MENTIX, los proyectos son exclusivamente: Presentaciones, Video Clases, Documentos Didácticos, Enlaces Web/URL y Proyectos GovData / Asistente.
    // Las pruebas evaluativas y retos gamificados (quizzes) NO pertenecen a Proyectos (pertenecen a Retos).
    const rawProjects = (window.appState.challenges || []).filter(c => {
      if (!c || !c.id) return false;
      if (c.deleted || c.is_deleted) return false;
      if (c.projectType === 'quiz') return false;
      // Solo descartar cuestionarios gamificados puros de preguntas (Retos)
      if (!c.projectType && Array.isArray(c.questions) && c.questions.length > 0 && !c.isGovDataProject && !c.slides && !c.videoUrl && !c.docContent && !c.resourceWebUrl) {
        return false;
      }
      return true;
    });

    const navEl = document.getElementById('main-navbar');
    if (this.viewMode === 'wizard') {
      if (navEl) navEl.style.display = 'none';
      document.body.classList.remove('projects-pure-white-theme');
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.background = 'transparent';
      if (window.ProjectWizard) {
        window.ProjectWizard.render(container);
        return;
      }
    } else if (this.viewMode === 'create') {
      if (navEl) navEl.style.display = 'none';
      document.body.classList.remove('projects-pure-white-theme');
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.background = 'transparent';
      this.renderStudentCreatePageView(container);
      return;
    } else if (this.viewMode === 'join') {
      if (navEl) navEl.style.display = 'none';
      document.body.classList.remove('projects-pure-white-theme');
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.background = 'transparent';
      this.renderProjectJoinView(container);
      return;
    } else {
      document.body.classList.add('projects-pure-white-theme');
      if (navEl) navEl.style.display = 'none';
      container.style.padding = '0';
      container.style.margin = '0';
      container.style.background = '#f4f7fb';
    }

    if (this.viewMode === 'selector') {
      this.renderProjectSelectorView(container);
      return;
    }

    if (this.viewMode === 'landing') {
      this.renderLandingPageView(container, rawProjects);
      return;
    }

    // Filtrar proyectos: Solo los proyectos debidamente autorizados por el Administrador son públicos.
    // Los proyectos pendientes de autorización o en revisión solo son visibles para el Administrador (para validarlos) o para su respectivo autor.
    const allUserProjects = rawProjects.filter(c => {
      const isApproved = c.approvalStatus === 'approved';
      const isAuthor = (window.appRouter && window.appRouter.isChallengeOwner(c)) ||
        ((c.author || '').toLowerCase().trim() === (u?.name || '').toLowerCase().trim()) ||
        (c.authorId && c.authorId === u?.id);

      if (!isApproved) {
        // Si no cuenta con autorización, solo el administrador o el autor pueden verlo
        if (isAdmin || isTeacherOrAdmin || isAuthor) return true;
        return false;
      }

      // Si está autorizado por el administrador, verificar si fue marcado expresamente como privado
      const isPrivate = c.isPublic === false || c.accessMode === 'private';
      if (isPrivate) {
        if (isAdmin || isTeacherOrAdmin || isAuthor) return true;
        return false;
      }
      return true;
    });

    // Proyectos directos desde la base de datos
    let displayList = [...allUserProjects];

    // Métricas dinámicas calculadas 100% desde la Base de Datos
    const totalCreated = allUserProjects.length;
    const completedCount = allUserProjects.filter(p => 
      p.status === 'completed' || p.progress === 100 || p.publicationStatus === 'published'
    ).length;
    const inProgressCount = allUserProjects.filter(p => 
      (p.status === 'in_progress' || (p.progress > 0 && p.progress < 100) || p.publicationStatus === 'draft') && 
      p.status !== 'completed' && p.progress !== 100
    ).length;
    const justStartedCount = allUserProjects.filter(p => 
      (!p.progress || p.progress <= 25 || p.status === 'review' || p.publicationStatus === 'ready_for_review') && 
      p.status !== 'completed' && p.progress !== 100
    ).length;
    const avgProgress = totalCreated > 0 
      ? Math.min(100, Math.round(allUserProjects.reduce((acc, p) => acc + (p.progress || (p.status === 'completed' ? 100 : (p.status === 'in_progress' ? 50 : 20))), 0) / totalCreated)) 
      : 0;

    // Filtrar por pestañas (Todos, Mis Proyectos, En Proceso, Completados, Favoritos)
    if (this.currentFilterTab === 'mine') {
      displayList = displayList.filter(c => {
        if (window.appRouter && window.appRouter.isChallengeOwner(c)) return true;
        if (c.authorId && u && (c.authorId === u.id || c.authorId === 'usr_' + u.id)) return true;
        const cAuthor = (c.author || '').trim().toLowerCase();
        const uName = (u?.name || '').trim().toLowerCase();
        const uUser = (u?.username || '').trim().toLowerCase();
        if (cAuthor && (cAuthor === uName || cAuthor === uUser)) return true;
        return false;
      });
    } else if (this.currentFilterTab === 'in_progress') {
      displayList = displayList.filter(c => c.status === 'in_progress' || c.publicationStatus === 'draft' || c.publicationStatus === 'in_preparation');
    } else if (this.currentFilterTab === 'completed') {
      displayList = displayList.filter(c => c.status === 'completed' || c.publicationStatus === 'published');
    } else if (this.currentFilterTab === 'favorites') {
      const favs = JSON.parse(localStorage.getItem('mentix_fav_projects') || '[]');
      displayList = displayList.filter(c => favs.includes(c.id));
    }

    // Filtro por búsqueda
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase().trim();
      displayList = displayList.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.categoryName && c.categoryName.toLowerCase().includes(q))
      );
    }

    // Ordenamiento
    if (this.sortBy === 'popular') {
      displayList.sort((a, b) => (b.students || b.playsCount || 0) - (a.students || a.playsCount || 0));
    } else if (this.sortBy === 'alpha') {
      displayList.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    const userAvatarConfig = window.AvatarEngine ? window.AvatarEngine.getSavedAvatar() : { animal: 'fox', alias: 'Eimy' };
    const userAnimal = (userAvatarConfig && userAvatarConfig.animal) || 'fox';
    const userName = (u && u.name) ? u.name : (userAvatarConfig.alias || 'Eimy');
    const userRole = (u && u.role) ? (u.role === 'teacher' ? 'Docente' : (u.role === 'admin' ? 'Administrador' : 'Estudiante')) : 'Nivel 3 • Gamer Pro';
    const animalAvatarHtml = window.AvatarEngine ? window.AvatarEngine.renderIconSVG(userAvatarConfig, 105) : `<img src="assets/sprites/${userAnimal}.png" alt="${userAnimal}" style="width: 100px; height: 100px; object-fit: contain;" onerror="this.src='assets/sprites/fox.png';" />`;
    const animalTopPillHtml = window.AvatarEngine ? window.AvatarEngine.renderIconSVG(userAvatarConfig, 30) : `<img src="assets/sprites/${userAnimal}.png" alt="${userAnimal}" style="width: 28px; height: 28px; object-fit: contain;" onerror="this.src='assets/sprites/fox.png';" />`;

    const cardsHtml = displayList.length === 0 ? `
      <div style="grid-column: 1 / -1; background: #ffffff; border-radius: 16px; padding: 3rem 1.5rem; text-align: center; border: 1.5px dashed #cbd5e1;">
        <div style="font-size: 3rem; margin-bottom: 0.75rem;">🔍</div>
        <h3 style="color: #0f172a; font-size: 1.3rem; font-weight: 800; margin-bottom: 0.4rem;">No se encontraron proyectos</h3>
        <p style="color: #64748b; font-size: 0.95rem; margin-bottom: 1.25rem;">Intenta con otro término de búsqueda o limpia los filtros.</p>
        <button class="btn btn-primary" onclick="window.ProjectsView.searchQuery = ''; window.ProjectsView.currentFilterTab = 'all'; window.ProjectsView.render();" style="padding: 0.6rem 1.25rem; font-weight: 800; border-radius: 9999px;">
          Ver todos los proyectos
        </button>
      </div>
    ` : displayList.map(c => this.renderProjectCard(c, u)).join('');

    container.innerHTML = `
      <div class="mentix-saas-dashboard animate-fade-in">
        <!-- MAIN CONTENT AREA -->
        <main class="mentix-saas-main">
          <!-- TOPBAR -->
          <header class="saas-topbar" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; width: 100%;">
            
            <!-- Left: Brand / Home Link + Search Input -->
            <div style="display: flex; align-items: center; gap: 0.85rem; width: 100%; max-width: 620px;">
              <div 
                onclick="window.appRouter.navigate('home')" 
                title="Volver al Inicio" 
                style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.45rem 1rem; border-radius: 9999px; background: #ffffff; border: 1.5px solid #e2e8f0; color: #0f172a; box-shadow: 0 2px 8px rgba(0,0,0,0.03); transition: all 0.2s ease; flex-shrink: 0;"
                onmouseenter="this.style.borderColor='#00f5d4'; this.style.transform='translateY(-1px)';"
                onmouseleave="this.style.borderColor='#e2e8f0'; this.style.transform='translateY(0)';"
              >
                <span style="font-size: 1.15rem;">🧠</span>
                <span style="font-weight: 900; letter-spacing: -0.02em; font-size: 0.95rem;">MENTIX</span>
                <span style="color: #64748b; font-weight: 600; font-size: 0.8rem;">· Inicio</span>
              </div>

              <!-- Search Pill -->
              <div style="position: relative; width: 100%; display: flex; align-items: center;">
                <span style="position: absolute; left: 1.1rem; font-size: 1rem; color: #64748b; pointer-events: none; z-index: 2;">🔍</span>
                <input 
                  type="text" 
                  id="projects-search-input"
                  class="saas-search-input"
                  placeholder="Buscar proyectos, contenidos o temas..." 
                  value="${this.escapeHtml(this.searchQuery)}"
                  oninput="window.ProjectsView.handleSearch(this.value)"
                  style="width: 100% !important; padding: 0.72rem 1.25rem 0.72rem 2.75rem !important; border-radius: 9999px !important; background: #ffffff !important; border: 1.5px solid #cbd5e1 !important; color: #0f172a !important; font-size: 0.92rem !important; outline: none !important; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04) !important;"
                />
              </div>
            </div>

            <!-- Topbar Right: Admin Badge + Bell + User Pill -->
            <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
              ${isAdmin ? `
                <!-- Admin Mode Indicator & Direct Banner Access -->
                <div 
                  onclick="window.ProjectsView.openAdminBannerModal()" 
                  title="Consola de Banners (Modo Administrador Activo - Clic para cambiar banner)"
                  style="display: inline-flex; align-items: center; gap: 0.45rem; background: #071739; border: 1.5px solid #00f5d4; color: #00f5d4; padding: 0.38rem 0.95rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 800; cursor: pointer; box-shadow: 0 0 15px rgba(0, 245, 212, 0.35); transition: transform 0.2s ease;"
                  onmouseenter="this.style.transform='scale(1.04)';"
                  onmouseleave="this.style.transform='scale(1)';"
                >
                  <span style="font-size: 1rem;">🤖</span>
                  <span>Modo Admin · Banners</span>
                </div>
              ` : `
                <div 
                  onclick="window.ProjectsView.promptAdminAccess()" 
                  title="Activar Modo Administrador para gestión de banners"
                  style="display: inline-flex; align-items: center; gap: 0.35rem; background: #f8fafc; border: 1px solid #cbd5e1; color: #64748b; padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.74rem; font-weight: 700; cursor: pointer; transition: all 0.2s ease;"
                  onmouseenter="this.style.background='#e2e8f0';"
                  onmouseleave="this.style.background='#f8fafc';"
                >
                  <span>🛡️</span>
                  <span>Acceso Admin</span>
                </div>
              `}

              <!-- Bell with Badge -->
              <div 
                onclick="window.ProjectsView.showToast('🔔 Tienes 3 notificaciones nuevas de tus proyectos')" 
                title="Notificaciones"
                style="position: relative; width: 42px; height: 42px; border-radius: 50%; background: #ffffff; border: 1.5px solid #e2e8f0; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.03);"
              >
                <span style="font-size: 1.15rem;">🔔</span>
                <span style="position: absolute; top: -3px; right: -3px; background: #ef4444; color: #ffffff; font-size: 0.68rem; font-weight: 900; width: 18px; height: 18px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid #ffffff;">3</span>
              </div>

              <!-- User Pill -->
              <div 
                onclick="window.appRouter.navigate ? window.appRouter.navigate('profile') : (window.appRouter.openAuthModal ? window.appRouter.openAuthModal('profile') : null)" 
                title="Mi Perfil y Avatar Animal"
                style="display: flex; align-items: center; gap: 0.65rem; background: #ffffff; border: 1.5px solid #e2e8f0; padding: 0.35rem 0.95rem 0.35rem 0.4rem; border-radius: 9999px; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 2px 8px rgba(0,0,0,0.03);"
              >
                <div style="width: 36px; height: 36px; border-radius: 50%; overflow: hidden; background: radial-gradient(circle, #1e1b4b 0%, #0f172a 100%); border: 2px solid #00f5d4; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  ${animalTopPillHtml}
                </div>
                <div style="display: flex; flex-direction: column; text-align: left; line-height: 1.25;">
                  <span style="font-size: 0.88rem; font-weight: 800; color: #0f172a;">${this.escapeHtml(userName)}</span>
                  <span style="font-size: 0.74rem; font-weight: 600; color: #64748b;">${this.escapeHtml(userRole)} ⌄</span>
                </div>
              </div>
            </div>
          </header>

          <!-- HERO BANNER (Abarca toda la parte de arriba, luminoso y nitido) -->
          <div class="saas-hero-banner-wrapper" style="position: relative; width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 1.6rem; box-shadow: 0 12px 35px rgba(2, 40, 100, 0.16); background: #071739;">
            <img 
              id="mentix-projects-hero-banner-img"
              src="${this.getHeroBannerUrl()}" 
              alt="Tu ecosistema de aprendizaje estructurado - MENTIX" 
              style="width: 100%; height: auto; display: block; object-fit: cover; filter: brightness(1.12) contrast(1.08) saturate(1.15); image-rendering: -webkit-optimize-contrast; image-rendering: high-quality; transform: translateZ(0); backface-visibility: hidden;" 
            />

            ${isAdmin ? `
              <!-- BOTÓN FLOTANTE EXCLUSIVO DE ADMINISTRADOR PARA CAMBIAR BANNER -->
              <div style="position: absolute; top: 1rem; right: 1.25rem; z-index: 10;">
                <button 
                  type="button" 
                  onclick="window.ProjectsView.openAdminBannerModal()" 
                  title="Cambiar Banner de Proyectos y Banner de Robot (Exclusivo Administrador)"
                  style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(7, 23, 57, 0.92); backdrop-filter: blur(10px); color: #00f5d4; border: 2px solid #00f5d4; border-radius: 9999px; padding: 0.45rem 1.15rem; font-size: 0.84rem; font-weight: 900; cursor: pointer; box-shadow: 0 0 20px rgba(0, 245, 212, 0.45); transition: all 0.25s ease;"
                  onmouseenter="this.style.transform='scale(1.05)'; this.style.background='rgba(0, 245, 212, 0.25)';"
                  onmouseleave="this.style.transform='scale(1)'; this.style.background='rgba(7, 23, 57, 0.92)';"
                >
                  <span style="font-size: 1.1rem;">🤖</span>
                  <span>Cambiar Banner (Modo Administrador)</span>
                  <span style="background: #00f5d4; color: #071739; padding: 0.1rem 0.4rem; border-radius: 999px; font-size: 0.7rem; font-weight: 900;">ADMIN</span>
                </button>
              </div>
            ` : ''}

            <!-- BOTONES PRINCIPALES DE ACCIÓN INTEGRADOS EN EL BANNER ('estos aca') -->
            <div class="mentix-banner-action-row" style="position: absolute; left: 3.8%; bottom: 8.5%; z-index: 5; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; max-width: 58%;">
              
              <button 
                type="button" 
                onclick="window.ProjectsView.openJoinProjectModal()" 
                title="Unirse a un código"
                class="mentix-hero-action-btn"
                style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #f72585 0%, #b5179e 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(247, 37, 133, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
                onmouseenter="this.style.transform='translateY(-2px) scale(1.03)'; this.style.boxShadow='0 8px 22px rgba(247, 37, 133, 0.65)';"
                onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 16px rgba(247, 37, 133, 0.45)';"
              >
                <span style="font-size: 1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">🎮</span>
                <span>Unirse a un código</span>
              </button>

              <button 
                type="button" 
                onclick="window.ProjectsView.openCreateProjectModal()" 
                title="Crear Proyecto (Disponible para todos los estudiantes y docentes)"
                class="mentix-hero-action-btn"
                style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #00d2ff 0%, #0077ff 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(0, 180, 255, 0.48); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
                onmouseenter="this.style.transform='translateY(-2px) scale(1.03)'; this.style.boxShadow='0 8px 22px rgba(0, 180, 255, 0.7)';"
                onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 16px rgba(0, 180, 255, 0.48)';"
              >
                <span style="font-size: 1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">➕</span>
                <span>Crear Proyecto</span>
              </button>

              ${isTeacherOrAdmin ? `
              <button 
                type="button" 
                onclick="window.ProjectsView.openCreateCodeModal()" 
                title="Crear Código de Proyecto (Exclusivo Profesores y Administradores)"
                class="mentix-hero-action-btn"
                style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(16, 185, 129, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
                onmouseenter="this.style.transform='translateY(-2px) scale(1.03)'; this.style.boxShadow='0 8px 22px rgba(16, 185, 129, 0.65)';"
                onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 16px rgba(16, 185, 129, 0.45)';"
              >
                <span style="font-size: 1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">🔑</span>
                <span>Crear Código</span>
              </button>
              ` : ''}

              <button 
                type="button" 
                onclick="window.appRouter.openCategoryModal ? window.appRouter.openCategoryModal() : null" 
                title="Categorías"
                class="mentix-hero-action-btn"
                style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.52rem 1.25rem; font-size: 0.9rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 16px rgba(79, 70, 229, 0.45); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
                onmouseenter="this.style.transform='translateY(-2px) scale(1.03)'; this.style.boxShadow='0 8px 22px rgba(79, 70, 229, 0.65)';"
                onmouseleave="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 16px rgba(79, 70, 229, 0.45)';"
              >
                <span style="font-size: 1rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.25));">🏷️</span>
                <span>Categorías</span>
              </button>

            </div>
          </div>


          <!-- CONTROLS & FILTER TABS -->
          <div class="saas-controls-row">
            <div class="saas-tabs-group">
              <button 
                type="button" 
                class="saas-tab-pill ${this.currentFilterTab === 'all' ? 'active' : ''}" 
                onclick="window.ProjectsView.setCustomFilter('all')"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="3" y="3" width="7.5" height="7.5" rx="1.8"/>
                  <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.8"/>
                  <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.8"/>
                  <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.8"/>
                </svg>
                <span>Todos</span>
              </button>

              <button 
                type="button" 
                class="saas-tab-pill ${this.currentFilterTab === 'mine' ? 'active' : ''}" 
                onclick="window.ProjectsView.setCustomFilter('mine')"
              >
                <span>Mis Proyectos</span>
              </button>

              <button 
                type="button" 
                class="saas-tab-pill ${this.currentFilterTab === 'in_progress' ? 'active' : ''}" 
                onclick="window.ProjectsView.setCustomFilter('in_progress')"
              >
                <span>En Proceso</span>
              </button>

              <button 
                type="button" 
                class="saas-tab-pill ${this.currentFilterTab === 'completed' ? 'active' : ''}" 
                onclick="window.ProjectsView.setCustomFilter('completed')"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.85;">
                  <circle cx="12" cy="12" r="9"/>
                  <polyline points="9 12 11.5 14.5 15.5 9.5"/>
                </svg>
                <span>Completados</span>
              </button>

              <button 
                type="button" 
                class="saas-tab-pill ${this.currentFilterTab === 'favorites' ? 'active' : ''}" 
                onclick="window.ProjectsView.setCustomFilter('favorites')"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="#ec4899" stroke="#db2777" stroke-width="1.2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span>Favoritos</span>
              </button>
            </div>

            <div class="saas-controls-right">
              <div class="saas-sort-select-wrap">
                <select class="saas-sort-select" onchange="window.ProjectsView.setSort(this.value)">
                  <option value="recent" ${this.sortBy === 'recent' ? 'selected' : ''}>Más recientes ⌄</option>
                  <option value="popular" ${this.sortBy === 'popular' ? 'selected' : ''}>Más populares</option>
                  <option value="alpha" ${this.sortBy === 'alpha' ? 'selected' : ''}>Alfabético A-Z</option>
                </select>
              </div>

              <div class="saas-view-switchers">
                <button class="view-btn ${this.layoutMode === 'grid' ? 'active' : ''}" onclick="window.ProjectsView.setLayout('grid')" title="Vista en cuadrícula">
                  ⊞
                </button>
                <button class="view-btn ${this.layoutMode === 'list' ? 'active' : ''}" onclick="window.ProjectsView.setLayout('list')" title="Vista en lista">
                  ≡
                </button>
              </div>
            </div>
          </div>

          <!-- SECTION TITLE & ACTION -->
          <div class="saas-section-head">
            <div class="saas-section-titles">
              <h2 class="saas-head-title">🚀 Mis Proyectos</h2>
              <p class="saas-head-subtitle">Explora, gestiona y comparte tus proyectos de aprendizaje.</p>
            </div>

            <button 
              type="button" 
              class="saas-create-btn" 
              onclick="window.ProjectsView.openCreateProjectModal()"
              style="display: inline-flex; align-items: center; gap: 0.45rem; background: linear-gradient(135deg, #00d2ff 0%, #0077ff 100%); color: #ffffff; border: none; border-radius: 9999px; padding: 0.48rem 1.15rem; font-size: 0.85rem; font-weight: 800; cursor: pointer; box-shadow: 0 4px 14px rgba(0, 180, 255, 0.4); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); white-space: nowrap;"
              onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';"
              onmouseleave="this.style.transform='translateY(0) scale(1)';"
            >
              <span>➕</span>
              <span>Crear Proyecto</span>
            </button>
          </div>

          <!-- MAIN BODY GRID (Cards Col + Widgets Col) -->
          <div class="saas-body-grid">
            <!-- LEFT / CENTER: PROJECT CARDS -->
            <div class="saas-projects-col">
              <div class="saas-cards-grid ${this.layoutMode === 'list' ? 'layout-list-mode' : ''}">
                ${cardsHtml}
              </div>
            </div>

            <!-- RIGHT: WIDGETS -->
            <aside class="saas-widgets-col">
              <!-- Widget 1: Tu Progreso (Con Imagen de Usuario y Estados de Proyectos) -->
              <div class="saas-widget-card" style="padding: 1.35rem 1.4rem;">
                <div class="saas-widget-header" style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1.15rem;">
                  <span class="widget-head-icon" style="font-size: 1.25rem;">📊</span>
                  <span class="widget-head-title" style="font-size: 1.05rem; font-weight: 800; color: #0f172a;">Tu Progreso</span>
                </div>

                <!-- Imagen / Avatar del Usuario Animal en Círculo Central -->
                <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 1.25rem;">
                  <div style="position: relative; width: 140px; height: 140px; border-radius: 50%; padding: 5px; background: linear-gradient(135deg, #00f5d4 0%, #0047cc 50%, #7c3aed 100%); box-shadow: 0 10px 25px rgba(0, 71, 204, 0.22); transition: transform 0.25s ease; cursor: pointer;" onclick="window.appRouter.navigate('profile')" title="Cambiar mi Avatar Animal" onmouseenter="this.style.transform='scale(1.04)';" onmouseleave="this.style.transform='scale(1)';">
                    <div style="width: 100%; height: 100%; border-radius: 50%; overflow: hidden; background: radial-gradient(circle, #1e1b4b 0%, #0f172a 100%); border: 3px solid #ffffff; display: flex; align-items: center; justify-content: center;">
                      ${animalAvatarHtml}
                    </div>
                    <!-- Indicador Activo -->
                    <div style="position: absolute; bottom: 6px; right: 6px; background: #22c55e; border: 2.5px solid #ffffff; width: 22px; height: 22px; border-radius: 50%; box-shadow: 0 2px 6px rgba(0,0,0,0.25);" title="En línea"></div>
                  </div>

                  <div style="margin-top: 0.65rem; text-align: center;">
                    <div style="font-size: 1.05rem; font-weight: 900; color: #0f172a; line-height: 1.2;">${this.escapeHtml(userName)}</div>
                    <div style="font-size: 0.78rem; font-weight: 600; color: #64748b; margin-top: 2px;">${this.escapeHtml(userRole)}</div>
                  </div>
                </div>

                <!-- Resumen de Proyectos y Estados -->
                <div style="margin-bottom: 1.15rem; padding-top: 0.85rem; border-top: 1px solid #f1f5f9;">
                  <div style="display: flex; align-items: baseline; gap: 0.4rem; margin-bottom: 0.85rem;">
                    <span style="font-size: 1.45rem; font-weight: 900; color: #0f172a; line-height: 1;">${avgProgress}%</span>
                    <span style="font-size: 0.82rem; font-weight: 700; color: #64748b;">completado</span>
                  </div>

                  <div class="donut-legend" style="display: flex; flex-direction: column; gap: 0.55rem; font-size: 0.84rem;">
                    <div class="legend-row" style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="legend-dot dot-green" style="color: #22c55e; font-size: 1rem; line-height: 1;">●</span>
                        <span class="legend-text" style="color: #334155; font-weight: 600;">Proyectos Creados:</span>
                      </div>
                      <strong class="legend-val" style="color: #0f172a; font-weight: 800; font-size: 0.95rem;">${totalCreated}</strong>
                    </div>

                    <div class="legend-row" style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="legend-dot dot-blue" style="color: #0284c7; font-size: 1rem; line-height: 1;">●</span>
                        <span class="legend-text" style="color: #334155; font-weight: 600;">En Proceso:</span>
                      </div>
                      <strong class="legend-val" style="color: #0f172a; font-weight: 800; font-size: 0.95rem;">${inProgressCount}</strong>
                    </div>

                    <div class="legend-row" style="display: flex; align-items: center; justify-content: space-between;">
                      <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <span class="legend-dot dot-purple" style="color: #8b5cf6; font-size: 1rem; line-height: 1;">●</span>
                        <span class="legend-text" style="color: #334155; font-weight: 600;">Recién Empezados:</span>
                      </div>
                      <strong class="legend-val" style="color: #0f172a; font-weight: 800; font-size: 0.95rem;">${justStartedCount}</strong>
                    </div>
                  </div>
                </div>

                <!-- Tarjeta de Elogio / Trofeo -->
                <div class="saas-praise-card" style="background: #fefce8; border: 1.5px solid #fef08a; border-radius: 12px; padding: 0.75rem 0.95rem; display: flex; align-items: center; gap: 0.75rem;">
                  <span class="praise-trophy" style="font-size: 1.6rem; flex-shrink: 0;">🏆</span>
                  <div class="praise-body">
                    <div class="praise-head" style="font-size: 0.85rem; font-weight: 800; color: #854d0e; margin-bottom: 2px;">¡Excelente trabajo!</div>
                    <div class="praise-desc" style="font-size: 0.76rem; color: #a16207; line-height: 1.35;">Vas en el camino correcto. Mantén el ritmo.</div>
                  </div>
                </div>
              </div>

              <!-- Widget 2: Accesos Rápidos -->
              <div class="saas-widget-card">
                <div class="saas-widget-header">
                  <span class="widget-head-icon">⚡</span>
                  <span class="widget-head-title">Accesos Rápidos</span>
                </div>

                <div class="saas-quick-grid">
                  <button class="quick-mini-card mini-purple" onclick="window.appRouter.navigate('home')">
                    <span class="quick-mini-icon">📅</span>
                    <span class="quick-mini-label">Mis Evaluaciones</span>
                  </button>

                  <button class="quick-mini-card mini-green" onclick="window.ProjectsView.filterCategory('all')">
                    <span class="quick-mini-icon">📖</span>
                    <span class="quick-mini-label">Recursos Didácticos</span>
                  </button>

                  <button class="quick-mini-card mini-peach" onclick="window.ProjectsView.openCommunity()">
                    <span class="quick-mini-icon">👥</span>
                    <span class="quick-mini-label">Comunidad MENTIX</span>
                  </button>

                  <button class="quick-mini-card mini-blue" onclick="window.appRouter.navigate('home')">
                    <span class="quick-mini-icon">📊</span>
                    <span class="quick-mini-label">Reportes</span>
                  </button>
                </div>
              </div>
            </aside>
          </div>

          <!-- BOTTOM BANNER -->
          <div class="saas-bottom-banner">
            <div class="saas-bottom-left">
              <span class="bulb-icon">💡</span>
              <span>Construyamos juntos un aprendizaje más inteligente</span>
            </div>

            <button class="saas-bottom-btn" onclick="window.ProjectsView.openCreateProjectModal()">
              Descubrir más →
            </button>
          </div>
        </main>
      </div>
    `;
  },

  renderProjectAttemptsSection() {
    return '';
  },

  renderProjectCard(c, currentUser) {
    const isTeacherOrAdmin = this.isTeacherOrAdmin();
    const isAdmin = this.isAdminUser();
    const isAuthor = (window.appRouter ? window.appRouter.isChallengeOwner(c) : false) || isTeacherOrAdmin;
    const isApproved = c.approvalStatus === 'approved' && !c.rejectionReason;
    const isRejected = c.approvalStatus === 'rejected';
    const isDraft = c.status === 'in_progress' || c.publicationStatus === 'draft';
    const isPendingApproval = !isApproved;
    const projectType = c.projectType || c.project_type || 'presentation';
    let defaultBanner = c.image || c.banner || c.coverImage || 'assets/projects_ui/card_data_gov.png';
    let tag = 'Pendiente de Autorización';
    let tagIcon = '⏳';
    let tagColor = 'background: #d97706;';
    let primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
    let primaryText = 'Ver Detalles →';
    let secondaryAction = `window.ProjectsView.shareProject('${c.id}', '${this.escapeHtml(c.title || '')}')`;
    let secondaryText = 'Compartir <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
    let primaryIsBlue = false;

    if (isApproved) {
      tag = 'Completado';
      tagIcon = '✔';
      tagColor = 'background: #22c55e;';
    } else if (isRejected) {
      tag = 'Autorización Revocada';
      tagIcon = '❌';
      tagColor = 'background: #ef4444;';
    } else if (isDraft) {
      tag = 'En Proceso';
      tagIcon = '⏱';
      tagColor = 'background: #0284c7;';
      primaryIsBlue = true;
      primaryText = 'Continuar →';
      secondaryText = 'Ver Detalles';
      secondaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      if (!c.image && !c.banner) defaultBanner = 'assets/projects_ui/card_ai_society.png';
    } else {
      tag = 'Pendiente de Autorización';
      tagIcon = '⏳';
      tagColor = 'background: #d97706;';
    }

    if (c.id === 'proj_gov_data' || c.id === 'demo-gov-data') {
      if (isApproved) {
        tag = 'Completado';
        tagIcon = '✔';
        tagColor = 'background: #22c55e;';
      }
      defaultBanner = c.mainImage || c.image || c.banner || 'assets/projects_ui/card_data_gov.png';
      primaryText = 'Ver Detalles →';
      primaryAction = `window.ProjectsView.openGovDataLanding ? window.ProjectsView.openGovDataLanding() : window.ProjectsView.openProjectLanding('${c.id}')`;
      secondaryText = 'Compartir <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
      secondaryAction = `window.ProjectsView.shareProject('${c.id}', '${this.escapeHtml(c.title || '')}')`;
      primaryIsBlue = false;
    } else if (c.id === 'proj_ai_society' || c.id === 'demo-ai-society') {
      if (isApproved) {
        tag = 'Completado';
        tagIcon = '✔';
        tagColor = 'background: #22c55e;';
      } else {
        tag = 'En Proceso';
        tagIcon = '⏱';
        tagColor = 'background: #0284c7;';
      }
      defaultBanner = c.mainImage || c.image || c.banner || 'assets/projects_ui/card_ai_society.png';
      primaryText = 'Continuar →';
      primaryAction = `window.ProjectWizard ? window.ProjectWizard.openWizard('${c.id}') : window.ProjectsView.openProjectLanding('${c.id}')`;
      secondaryText = 'Ver Detalles';
      secondaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      primaryIsBlue = true;
    } else if (c.id === 'proj_open_data' || c.id === 'demo-open-data') {
      if (isApproved) {
        tag = 'Completado';
        tagIcon = '✔';
        tagColor = 'background: #22c55e;';
      } else {
        tag = 'Pendiente de Autorización';
        tagIcon = '⏳';
        tagColor = 'background: #d97706;';
      }
      defaultBanner = c.mainImage || c.image || c.banner || 'assets/projects_ui/card_open_data.png';
      primaryText = 'Ver Detalles →';
      primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      secondaryText = '📊';
      secondaryAction = `window.ProjectsView.showToast('📊 Reporte analítico de Transparencia de Datos')`;
      primaryIsBlue = false;
    } else if (c.govdata || c.isGovDataProject || c.is_gov_data_project) {
      // Proyectos creados por el usuario en el Asistente Inteligente
      defaultBanner = c.mainImage || c.banner || c.image || c.thumbnailImage || 'assets/projects_ui/card_data_gov.png';
      if (isDraft) {
        tag = 'En Proceso';
        tagIcon = '⏱';
        tagColor = 'background: #0284c7;';
        primaryText = 'Continuar →';
        primaryAction = `window.ProjectWizard ? window.ProjectWizard.openWizard('${c.id}') : window.ProjectsView.openProjectLanding('${c.id}')`;
        secondaryText = 'Ver Detalles';
        secondaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
        primaryIsBlue = true;
      } else if (isApproved) {
        tag = 'Completado';
        tagIcon = '✔';
        tagColor = 'background: #22c55e;';
        primaryText = 'Ver Detalles →';
        primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
        secondaryText = 'Compartir <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
        secondaryAction = `window.ProjectsView.shareProject('${c.id}', '${this.escapeHtml(c.title || '')}')`;
        primaryIsBlue = false;
      } else {
        tag = 'Pendiente de Autorización';
        tagIcon = '⏳';
        tagColor = 'background: #d97706;';
        primaryText = 'Ver Detalles →';
        primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
        secondaryText = 'Compartir <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-left:3px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>';
        secondaryAction = `window.ProjectsView.shareProject('${c.id}', '${this.escapeHtml(c.title || '')}')`;
        primaryIsBlue = false;
      }
    } else if (projectType === 'presentation') {
      defaultBanner = c.mainImage || c.image || c.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800';
      primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      primaryText = 'Ver Detalles →';
    } else if (projectType === 'video') {
      defaultBanner = c.mainImage || c.image || c.banner || 'https://images.unsplash.com/photo-1536240478700-b869070f9279?w=800';
      primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      primaryText = 'Ver Detalles →';
    } else if (projectType === 'document') {
      defaultBanner = c.mainImage || c.image || c.banner || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800';
      primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      primaryText = 'Ver Detalles →';
    } else if (projectType === 'url') {
      defaultBanner = c.mainImage || c.image || c.banner || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800';
      primaryAction = `window.ProjectsView.openProjectLanding('${c.id}')`;
      primaryText = 'Ver Detalles →';
    }

    const dateStr = c.date || (c.createdAt ? new Date(c.createdAt).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) : '12 Abr 2025');
    const studentsCount = (c.students !== undefined && c.students !== null) ? c.students : (c.playsCount || 0);
    const ratingStr = c.rating || '5.0';
    const desc = c.description || 'Proyecto académico de aprendizaje colaborativo.';

    const btnLeftStyle = primaryIsBlue
      ? 'background: #0047cc; color: #ffffff; border: none; box-shadow: 0 2px 8px rgba(0, 71, 204, 0.25);'
      : 'background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1;';
    
    const btnRightStyle = primaryIsBlue
      ? 'background: #ffffff; color: #0f172a; border: 1.5px solid #cbd5e1;'
      : 'background: #0047cc; color: #ffffff; border: none; box-shadow: 0 2px 8px rgba(0, 71, 204, 0.25);';

    return `
      <div class="saas-project-card animate-fade-in" onclick="${primaryAction}" style="border-radius: 16px; background: #ffffff; border: 1.5px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 18px rgba(0,0,0,0.04); display: flex; flex-direction: column; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease; position: relative;">
        
        <!-- Banner Image Wrapper (Fixed 135px height with object-fit cover) -->
        <div class="saas-card-banner-wrap" style="position: relative; width: 100%; height: 135px; min-height: 135px; max-height: 135px; overflow: hidden; background: #0f172a;">
          <img 
            src="${defaultBanner}" 
            alt="${this.escapeHtml(c.title)}" 
            class="saas-card-banner-img"
            style="width: 100%; height: 135px; min-height: 135px; max-height: 135px; object-fit: cover; object-position: center; display: block;" 
            onerror="this.onerror=null;this.src='assets/projects_ui/card_data_gov.png';" 
          />

          <!-- Pill Badge Floating Top-Left -->
          <div class="saas-card-badge" style="position: absolute; top: 10px; left: 10px; z-index: 2; ${tagColor} color: #ffffff; border-radius: 9999px; padding: 4px 12px; font-weight: 800; font-size: 0.76rem; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.22); letter-spacing: 0.01em;">
            <span style="font-size: 0.82rem; line-height: 1;">${tagIcon}</span>
            <span>${tag}</span>
          </div>

          <!-- Three Dots / Menu Button Floating Top-Right -->
          <div style="position: absolute; top: 10px; right: 10px; z-index: 2; display: flex; gap: 6px; align-items: center;">
            ${isAdmin ? `
              <button 
                title="Cambiar Banner de este Proyecto (Exclusivo Administrador)" 
                onclick="event.stopPropagation(); window.ProjectsView.openAdminBannerModal('${c.id}')"
                style="height: 30px; padding: 0 0.65rem; border-radius: 8px; background: rgba(7, 23, 57, 0.92); backdrop-filter: blur(6px); display: inline-flex; align-items: center; gap: 0.35rem; cursor: pointer; border: 1.5px solid #00f5d4; font-size: 0.74rem; font-weight: 900; color: #00f5d4; box-shadow: 0 2px 10px rgba(0, 245, 212, 0.35); transition: transform 0.2s ease;"
                onmouseenter="this.style.transform='scale(1.05)';"
                onmouseleave="this.style.transform='scale(1)';"
              >
                <span>🤖</span>
                <span>Banner</span>
              </button>
            ` : ''}
            ${(isAdmin || isAuthor) ? `
              <button 
                title="Editar este proyecto" 
                onclick="event.stopPropagation(); window.AdminView ? window.AdminView.openEditProjectModal('${c.id}') : window.ProjectsView.openProjectLanding('${c.id}')"
                style="width: 30px; height: 30px; border-radius: 8px; background: rgba(14, 165, 233, 0.92); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 0.85rem; color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.18); transition: transform 0.15s ease;"
                onmouseenter="this.style.transform='scale(1.1)';"
                onmouseleave="this.style.transform='scale(1)';"
              >
                ✏️
              </button>
            ` : ''}
            ${isAuthor ? `
              <button 
                title="Eliminar proyecto" 
                onclick="event.stopPropagation(); window.appRouter.deleteChallenge('${c.id}')"
                style="width: 30px; height: 30px; border-radius: 8px; background: rgba(239, 68, 68, 0.9); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 0.85rem; color: #ffffff; box-shadow: 0 2px 8px rgba(0,0,0,0.18);"
              >
                🗑️
              </button>
            ` : ''}
            <button 
              title="Opciones" 
              onclick="event.stopPropagation(); window.ProjectsView.openProjectLanding('${c.id}')"
              style="width: 30px; height: 30px; border-radius: 8px; background: rgba(255, 255, 255, 0.88); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; cursor: pointer; border: none; font-size: 1rem; color: #334155; font-weight: 900; line-height: 1; box-shadow: 0 2px 8px rgba(0,0,0,0.15);"
            >
              ···
            </button>
          </div>
        </div>

        <!-- Card Body -->
        <div class="saas-card-body" style="padding: 1.05rem 1.15rem 1.15rem; display: flex; flex-direction: column; flex: 1;">
          <h3 class="saas-card-title" style="font-size: 0.98rem; font-weight: 800; color: #0f172a; margin: 0 0 0.4rem; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${this.escapeHtml(c.title)}
          </h3>

          <p class="saas-card-desc" style="font-size: 0.81rem; color: #475569; margin: 0 0 0.85rem; line-height: 1.42; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; flex: 1;">
            ${this.escapeHtml(desc)}
          </p>

          <!-- Metadata Row -->
          <div class="saas-card-meta-row" style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; font-size: 0.78rem; font-weight: 700; color: #1e293b; border-bottom: none; padding-bottom: 0;">
            <span style="display: inline-flex; align-items: center; gap: 0.35rem;">📅 ${dateStr}</span>
            <span style="display: inline-flex; align-items: center; gap: 0.35rem; color: #0284c7; cursor: pointer; transition: transform 0.15s ease;" onmouseenter="this.style.transform='scale(1.1)';" onmouseleave="this.style.transform='scale(1)';" onclick="event.stopPropagation(); window.ProjectsView.openParticipantsModal('${c.id}');" title="Ver personas y roles participantes">👥 ${studentsCount}</span>
            <span style="display: inline-flex; align-items: center; gap: 0.25rem; color: #eab308;">⭐ ${ratingStr}</span>
          </div>

          <!-- Action Buttons Row -->
          <div class="saas-card-actions" style="display: flex; align-items: center; gap: 0.45rem; margin-top: auto;">
            <button 
              class="saas-card-btn-secondary"
              onclick="event.stopPropagation(); ${primaryAction}" 
              style="${btnLeftStyle} border-radius: 10px; padding: 0.52rem 0.5rem; font-size: 0.76rem; font-weight: 700; cursor: pointer; flex: 1 1 0; min-width: 0; display: inline-flex; align-items: center; justify-content: center; gap: 0.2rem; transition: all 0.2s ease; white-space: nowrap;"
            >
              ${primaryText}
            </button>
            ${isAdmin ? `<button 
              class="saas-card-btn-authorize ${isApproved ? 'approved' : ''}"
              onclick="event.stopPropagation(); window.ProjectsView.toggleAuthorizeProject('${c.id}')"
              style="${isApproved ? 'background:#f0fdf4; color:#15803d; border:1.5px solid #86efac;' : 'background:linear-gradient(135deg, #10b981 0%, #059669 100%); color:#ffffff; border:none; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.32);'} border-radius: 10px; padding: 0.52rem 0.5rem; font-size: 0.76rem; font-weight: 800; cursor: pointer; flex: 1 1 0; min-width: 0; display: inline-flex; align-items: center; justify-content: center; gap: 0.2rem; transition: all 0.2s ease; white-space: nowrap;"
              title="${isApproved ? 'Proyecto ya autorizado (clic para revocar)' : 'Autorizar y publicar este proyecto'}"
            >
              <span>${isApproved ? '✔' : '✅'}</span>
              <span>${isApproved ? 'Autorizado' : 'Autorizar'}</span>
            </button>` : ''}
            <button 
              class="saas-card-btn-primary"
              onclick="event.stopPropagation(); ${secondaryAction}" 
              style="${btnRightStyle} border-radius: 10px; padding: 0.52rem 0.5rem; font-size: 0.76rem; font-weight: 700; cursor: pointer; flex: 1 1 0; min-width: 0; display: inline-flex; align-items: center; justify-content: center; gap: 0.2rem; transition: all 0.2s ease; white-space: nowrap;"
            >
              ${secondaryText}
            </button>
          </div>
        </div>
      </div>
    `;
  },

  /**
   * Alterna la autorización y publicación de un proyecto desde la tarjeta
   */
  toggleAuthorizeProject(projectId) {
    if (!this.isAdminUser()) {
      alert('🔒 Solo los administradores pueden autorizar proyectos.');
      return;
    }
    let raw = (window.appState && window.appState.challenges) ? window.appState.challenges : [];
    let p = raw.find(item => item && item.id === projectId);
    if (!p) {
      if (this.showToast) this.showToast('No se encontró el proyecto', 'error');
      else alert('No se encontró el proyecto');
      return;
    }

    const isApproved = p.approvalStatus === 'approved' && !p.rejectionReason;

    if (isApproved) {
      if (window.AdminView && typeof window.AdminView.rejectProject === 'function') {
        window.AdminView.rejectProject(projectId);
      } else {
        const note = prompt('Ingresa el motivo de cancelación o corrección:', 'Faltan detalles o el contenido requiere ajustes antes de publicarse.');
        if (note === null) return;
        p.approvalStatus = 'rejected';
        p.publicationStatus = 'draft';
        p.status = 'in_progress';
        p.stage = 'in_progress';
        p.isPublic = false;
        p.accessMode = 'private';
        p.rejectionReason = note;
        p.rejectedAt = new Date().toISOString();
        if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
        if (this.showToast) this.showToast(`❌ Autorización cancelada para "${p.title}".`, 'warning');
      }
    } else {
      if (window.AdminView && typeof window.AdminView.approveProject === 'function') {
        window.AdminView.approveProject(projectId);
      } else {
        p.approvalStatus = 'approved';
        p.publicationStatus = 'published';
        p.status = 'completed';
        p.stage = 'completed';
        p.isPublic = true;
        p.accessMode = 'public';
        p.authorizedAt = new Date().toISOString();
        p.authorizedBy = (window.appState.currentUser?.name) || 'Administrador Mentix';
        delete p.rejectionReason;
        if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
        if (this.showToast) this.showToast(`✅ ¡Proyecto "${p.title}" autorizado y publicado con éxito!`, 'success');
      }
    }

    // Actualizar vista de proyectos
    this.render();
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
    const auditBar = document.getElementById('admin-audit-floating-banner');
    if (auditBar) auditBar.remove();
    document.body.style.paddingTop = '';

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

  // Habilitado para TODOS los usuarios (estudiantes, profesores y administradores)
  openCreateProjectModal() {
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    const u = window.appState?.currentUser;
    let savedDraft = null;
    try {
      const saved = localStorage.getItem('te_reto_student_create_draft');
      if (saved) savedDraft = JSON.parse(saved);
    } catch (e) {}

    this.createDraft = savedDraft || {
      title: '',
      author: (u && (u.name || u.username)) ? (u.name || u.username) : 'Estudiante',
      summary: '',
      description: '',
      isPublic: true
    };
    if (this.createDraft.isPublic === undefined) this.createDraft.isPublic = true;
    this.createProjectStep = (this.createDraft.title && this.createDraft.summary) ? 2 : 1;
    this.viewMode = 'create';
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  setStudentProjectVisibility(isPublic) {
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    if (!this.createDraft) this.createDraft = {};
    this.createDraft.isPublic = Boolean(isPublic);
    try {
      localStorage.setItem('te_reto_student_create_draft', JSON.stringify(this.createDraft));
    } catch (e) {}
    if (this.viewMode === 'create') {
      this.render();
    }
  },

  goToCreateProjectStep(step) {
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();

    if (step === 2) {
      const titleInput = document.getElementById('student-proj-title') || document.getElementById('proj-create-title');
      const authorInput = document.getElementById('student-proj-author') || document.getElementById('proj-create-author');
      const summaryInput = document.getElementById('student-proj-summary') || document.getElementById('proj-create-summary');
      const descInput = document.getElementById('student-proj-desc') || document.getElementById('proj-create-description');

      const title = (titleInput?.value || this.createDraft?.title || '').trim();
      if (!title) {
        alert('⚠️ Por favor ingresa el Nombre del Proyecto.');
        titleInput?.focus();
        return;
      }

      const author = (authorInput?.value || this.createDraft?.author || '').trim();
      if (!author) {
        alert('⚠️ Por favor indica Quién realizó el proyecto (autor o integrantes).');
        authorInput?.focus();
        return;
      }

      const summary = (summaryInput?.value || this.createDraft?.summary || '').trim();
      if (!summary) {
        alert('⚠️ Por favor escribe un Resumen breve de tu proyecto.');
        summaryInput?.focus();
        return;
      }

      this.createDraft = {
        title: title,
        author: author,
        summary: summary,
        description: (descInput?.value || this.createDraft?.description || '').trim(),
        isPublic: this.createDraft?.isPublic !== false
      };
      try {
        localStorage.setItem('te_reto_student_create_draft', JSON.stringify(this.createDraft));
      } catch (e) {}

      this.createProjectStep = 2;
    } else {
      const titleInput = document.getElementById('student-proj-title') || document.getElementById('proj-create-title');
      const authorInput = document.getElementById('student-proj-author') || document.getElementById('proj-create-author');
      const summaryInput = document.getElementById('student-proj-summary') || document.getElementById('proj-create-summary');
      const descInput = document.getElementById('student-proj-desc') || document.getElementById('proj-create-description');

      if (titleInput || authorInput) {
        this.createDraft = {
          title: (titleInput?.value || this.createDraft?.title || '').trim(),
          author: (authorInput?.value || this.createDraft?.author || '').trim(),
          summary: (summaryInput?.value || this.createDraft?.summary || '').trim(),
          description: (descInput?.value || this.createDraft?.description || '').trim(),
          isPublic: this.createDraft?.isPublic !== false
        };
        try {
          localStorage.setItem('te_reto_student_create_draft', JSON.stringify(this.createDraft));
        } catch (e) {}
      }
      this.createProjectStep = 1;
    }

    if (this.viewMode === 'create') {
      this.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  createStudentProject(format) {
    if (window.soundEngine && window.soundEngine.playSuccess) {
      window.soundEngine.playSuccess();
    } else if (window.soundEngine && window.soundEngine.playClick) {
      window.soundEngine.playClick();
    }

    const titleInput = document.getElementById('student-proj-title') || document.getElementById('proj-create-title');
    const authorInput = document.getElementById('student-proj-author') || document.getElementById('proj-create-author');
    const summaryInput = document.getElementById('student-proj-summary') || document.getElementById('proj-create-summary');
    const descInput = document.getElementById('student-proj-desc') || document.getElementById('proj-create-description');

    const draft = this.createDraft || {};
    const title = (titleInput?.value || draft.title || '').trim() || 'Proyecto Educativo';
    const author = (authorInput?.value || draft.author || '').trim() || (window.appState?.currentUser?.name || 'Estudiante');
    const summary = (summaryInput?.value || draft.summary || '').trim();
    const description = (descInput?.value || draft.description || '').trim() || summary || 'Proyecto escolar preparado para la comunidad educativa.';
    const finalSummary = summary || description.slice(0, 160);

    const currentUser = window.appState?.currentUser || {};
    const catId = (window.appState?.categories && window.appState.categories[0]) ? window.appState.categories[0].id : 'cat_general';
    const catName = (window.appState?.categories && window.appState.categories[0]) ? window.appState.categories[0].name : 'Proyectos de Estudiantes';

    const slug = title.toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || ('proyecto-' + Date.now());

    const newId = 'proj_' + format + '_' + Date.now();

    const newProject = {
      id: newId,
      fromStudentCreate: true,
      _isStudentDraft: true,
      title: title,
      author: author,
      authorId: currentUser.id || '',
      authorEmail: currentUser.email || '',
      authorAvatar: currentUser.avatar || '🎓',
      authorRole: currentUser.role || 'student',
      projectType: format,
      category: catId,
      categoryName: catName,
      difficulty: 'Medio',
      timePerQuestion: 25,
      plays: 0,
      banner: '',
      shortDescription: finalSummary,
      description: description,
      fullDescription: description,
      publicationStatus: (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin)) ? ((draft.isPublic !== false) ? 'published' : 'draft') : 'pending_approval',
      approvalStatus: (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin)) ? 'approved' : 'pending',
      status: (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin)) ? ((draft.isPublic !== false) ? 'completed' : 'in_progress') : 'review',
      isPublic: (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin)) ? (draft.isPublic !== false) : false,
      accessMode: (currentUser && (currentUser.role === 'admin' || currentUser.isAdmin)) ? ((draft.isPublic !== false) ? 'public' : 'private') : 'private',
      displayOrder: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      landingConfig: {
        publicName: title,
        landingTitle: title,
        publicDescription: finalSummary,
        slug: slug,
        visibleCategory: catName,
        tags: ['Estudiantes', 'Proyecto', format.toUpperCase()],
        ctaText: 'Ver Proyecto',
        ctaUrl: '#',
        displayOrder: 1,
        featuredVideoPublic: true
      },
      authorsConfig: {
        authorsList: author,
        authorsEmails: currentUser.email || '',
        authorsRole: 'Estudiante / Creador',
        collaborators: ''
      },
      designConfig: {
        themeId: 'cosmos',
        fontFamily: 'Montserrat',
        titleColor: '#ffffff',
        textColor: '#cbd5e1',
        accentColor: '#00f5d4',
        bannerStyle: 'gradient-cosmos',
        bannerUrl: ''
      }
    };

    if (format === 'presentation') {
      const bulletsList = description 
        ? description.split('\n').map(s => s.trim().replace(/^[-•*✦●▸★✔\d.]+\s*/, '')).filter(Boolean)
        : [finalSummary];
      newProject.slides = [
        {
          id: 'slide_1',
          title: title,
          subtitle: 'Por ' + author,
          content: finalSummary,
          bullets: bulletsList.length > 0 ? bulletsList : [finalSummary],
          media: '',
          videoUrl: '',
          layout: 'split',
          teacherNotes: '',
          titleColor: '#ffffff',
          subtitleColor: '#00f5d4',
          contentColor: '#cbd5e1',
          bulletsColor: '#ffffff',
          titleFont: "'Outfit', sans-serif",
          subtitleFont: "'Outfit', sans-serif",
          contentFont: "'Outfit', sans-serif",
          bulletsFont: "'Outfit', sans-serif",
          bulletStyle: '✦'
        }
      ];
      newProject.resources = [
        {
          name: 'Presentación del Proyecto',
          url: '',
          type: 'ppt',
          format: 'PPT',
          description: finalSummary
        }
      ];
    } else if (format === 'video') {
      newProject.videoUrl = '';
      newProject.videoConfig = {
        url: '',
        title: title,
        description: finalSummary,
        chapters: []
      };
    } else if (format === 'document') {
      newProject.docContent = `# ${title}\n\n**Autor(es):** ${author}\n\n### Resumen\n${finalSummary}\n\n### Descripción y Desarrollo\n${description}\n`;
      newProject.resources = [
        {
          name: 'Documento / Guía del Proyecto',
          url: '',
          type: 'doc',
          format: 'DOC',
          description: finalSummary
        }
      ];
    } else if (format === 'url') {
      newProject.resourceWebUrl = '';
      newProject.externalLinks = [
        {
          title: title,
          url: '',
          category: 'Enlace Web',
          description: finalSummary
        }
      ];
    }

    // Guardar con garantía inmutable en bóveda personal y estado global
    if (typeof window.saveUserProject === 'function') {
      window.saveUserProject(newProject, currentUser);
    } else {
      if (!Array.isArray(window.appState.challenges)) {
        window.appState.challenges = [];
      }
      window.appState.challenges.unshift(newProject);
      if (typeof saveGlobalState === 'function') {
        saveGlobalState(window.appState);
      }
      if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
        window.appRouter.pushChallengeToCloud(newProject);
      }
    }

    // Preservar borrador de datos del estudiante para no perderlos si cancela
    this.createDraft = {
      title: title,
      author: author,
      summary: summary,
      description: description
    };
    try {
      localStorage.setItem('te_reto_student_create_draft', JSON.stringify(this.createDraft));
    } catch (e) {}

    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.remove('active');
    this.createProjectStep = 2;
    this.viewMode = 'create';

    // Navegar directamente al editor según el formato seleccionado
    if (window.appRouter) {
      if (format === 'presentation') {
        window.appRouter.navigate('presentation', { id: newProject.id, edit: true, project: newProject, fromStudentCreate: true });
      } else if (format === 'video') {
        window.appRouter.navigate('video', { id: newProject.id, edit: true, project: newProject, fromStudentCreate: true });
      } else if (format === 'document') {
        window.appRouter.navigate('document', { id: newProject.id, edit: true, project: newProject, fromStudentCreate: true });
      } else if (format === 'url') {
        window.appRouter.navigate('url', { id: newProject.id, edit: true, project: newProject, fromStudentCreate: true });
      }
    }
  },

  returnToStudentCreateStep2(cleanUpProjectId = null) {
    if (cleanUpProjectId) {
      const existing = Array.isArray(window.appState?.challenges)
        ? window.appState.challenges.find(c => c && c.id === cleanUpProjectId)
        : null;
      // ¡NUNCA borrar un proyecto que ya fue publicado o guardado!
      const isPublishedOrSaved = existing && (
        existing.publicationStatus === 'published' ||
        existing.status === 'completed' ||
        existing.isPublic === true ||
        existing._isStudentDraft === false ||
        existing.fromStudentCreate === false
      );
      if (!isPublishedOrSaved) {
        if (Array.isArray(window.appState?.challenges)) {
          window.appState.challenges = window.appState.challenges.filter(c => c.id !== cleanUpProjectId);
          if (typeof saveGlobalState === 'function') {
            saveGlobalState(window.appState);
          }
        }
        if (window.supabaseService && typeof window.supabaseService.deleteChallengeFromSupabase === 'function') {
          window.supabaseService.deleteChallengeFromSupabase(cleanUpProjectId);
        }
      }
    }

    if (!this.createDraft) {
      try {
        const saved = localStorage.getItem('te_reto_student_create_draft');
        if (saved) this.createDraft = JSON.parse(saved);
      } catch (e) {}
    }

    this.createProjectStep = 2;
    this.viewMode = 'create';

    const viewPres = document.getElementById('view-presentation');
    if (viewPres) viewPres.classList.remove('active');
    const viewVid = document.getElementById('view-video');
    if (viewVid) viewVid.classList.remove('active');
    const viewDoc = document.getElementById('view-document');
    if (viewDoc) viewDoc.classList.remove('active');
    const viewUrl = document.getElementById('view-url');
    if (viewUrl) viewUrl.classList.remove('active');
    const viewProj = document.getElementById('view-projects');
    if (viewProj) viewProj.classList.add('active');

    if (window.appRouter) {
      window.appRouter.currentView = 'projects';
    }

    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  clearStudentCreateDraft() {
    this.createDraft = null;
    this.createProjectStep = 1;
    try {
      localStorage.removeItem('te_reto_student_create_draft');
    } catch (e) {}
  },

  renderStudentCreatePageView(container) {
    const u = window.appState?.currentUser || {};
    if (!this.createDraft) {
      this.createDraft = {
        title: '',
        author: u.name || u.username || 'Estudiante',
        summary: '',
        description: ''
      };
    }
    const d = this.createDraft;
    const step = this.createProjectStep || 1;

    container.innerHTML = `
      <div class="student-create-page-wrapper" style="min-height: 100vh; min-height: 100dvh; width: 100%; position: relative; overflow-x: hidden; box-sizing: border-box; background: #060b18 url('assets/student_create_bg.jpg') center center / cover no-repeat fixed; padding: 2.5rem 1.5rem 5rem; display: flex; flex-direction: column; align-items: center;">
        
        <!-- Capa de viñeta cinematográfica para contraste y profundidad visual perfecta -->
        <div style="position: fixed; inset: 0; background: radial-gradient(circle at 50% 25%, rgba(6, 11, 24, 0.40) 0%, rgba(3, 7, 18, 0.88) 100%); pointer-events: none; z-index: 0;"></div>

        <!-- Barra Superior de Navegación y Encabezado de Página -->
        <header style="position: relative; z-index: 10; width: 100%; max-width: 980px; margin-bottom: 2rem; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
          <button 
            type="button" 
            onclick="window.ProjectsView.closeCreateProjectModal()" 
            style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.4rem; border-radius: 14px; background: rgba(10, 18, 42, 0.85); border: 1.5px solid rgba(0, 245, 212, 0.4); color: #ffffff; font-size: 0.95rem; font-weight: 800; cursor: pointer; transition: all 0.2s ease; backdrop-filter: blur(16px); box-shadow: 0 4px 20px rgba(0,0,0,0.4);"
            onmouseenter="this.style.borderColor='var(--neon-cyan)'; this.style.boxShadow='0 0 15px rgba(0,245,212,0.4)';"
            onmouseleave="this.style.borderColor='rgba(0, 245, 212, 0.4)'; this.style.boxShadow='0 4px 20px rgba(0,0,0,0.4)';"
          >
            ← Volver a Proyectos
          </button>

          <div style="text-align: center; flex: 1; min-width: 260px;">
            <div class="student-header-badge" style="display: inline-flex; align-items: center; gap: 0.4rem; background: rgba(0,245,212,0.22); border: 1.5px solid #00f5d4; padding: 0.4rem 1.3rem; border-radius: 9999px; font-size: 0.88rem; font-weight: 900; color: #00f5d4; margin-bottom: 0.5rem; box-shadow: 0 0 25px rgba(0,245,212,0.45); text-transform: uppercase; letter-spacing: 0.6px; text-shadow: 0 0 12px rgba(0,245,212,0.8);">
              <span>✨</span> CREADOR DE PROYECTOS EDUCATIVOS
            </div>
            <h1 class="student-main-title" style="font-size: 2.3rem; font-weight: 900; margin: 0; color: #ffffff !important; letter-spacing: -0.5px; text-shadow: 0 2px 16px rgba(0,0,0,0.95), 0 0 30px rgba(0,245,212,0.4) !important;">
              ${step === 1 ? 'Datos Generales de tu Proyecto' : 'Elige el Formato de Contenido'}
            </h1>
            <p style="font-size: 1.05rem; color: #e2e8f0 !important; margin: 0.55rem 0 0; text-shadow: 0 1px 6px rgba(0,0,0,0.9);">
              ${step === 1 
                ? 'Paso 1 de 2: Registra la información general de tu proyecto para destacarlo en la Landing Page.' 
                : 'Paso 2 de 2: Selecciona la presentación, video, documentos o enlaces para estructurar tu proyecto.'}
            </p>
          </div>

          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(124, 58, 237, 0.35); border: 1.5px solid #a78bfa; padding: 0.6rem 1.2rem; border-radius: 14px; color: #ede9fe; font-size: 0.92rem; font-weight: 900; backdrop-filter: blur(12px); box-shadow: 0 4px 20px rgba(124,58,237,0.3);">
            <span>${step === 1 ? 'Paso 1 de 2' : 'Paso 2 de 2'}</span>
          </div>
        </header>

        <!-- Contenedor Principal Amplio (Pantallas Grandes) -->
        <main style="position: relative; z-index: 10; width: 100%; max-width: 980px;">
          ${step === 1 ? this.renderStudentCreateStep1Html(d) : this.renderStudentCreateStep2Html(d)}
        </main>
      </div>
    `;

    setTimeout(() => {
      if (step === 1) {
        const inp = document.getElementById('student-proj-title');
        if (inp && !inp.value.trim()) inp.focus();
      }
    }, 120);
  },

  renderStudentCreateStep1Html(d) {
    return `
      <div class="glass-panel" style="background: rgba(8, 14, 34, 0.85); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 2px solid rgba(0, 245, 212, 0.45); border-radius: 28px; padding: 2.75rem; box-shadow: 0 30px 90px rgba(0,0,0,0.85), 0 0 45px rgba(0,245,212,0.25);">
        
        <div style="display: flex; flex-direction: column; gap: 2rem; margin-bottom: 2.5rem;">
          
          <!-- PANTALLA 1: Nombre del Proyecto -->
          <div style="background: rgba(12, 20, 48, 0.75); border: 1.5px solid rgba(0, 245, 212, 0.5); border-radius: 20px; padding: 1.75rem 1.9rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3); transition: all 0.25s ease;" onfocuswithin="this.style.borderColor='#00f5d4'; this.style.boxShadow='0 0 30px rgba(0,245,212,0.45)';">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
              <label for="student-proj-title" class="student-title-cyan" style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.35rem !important; font-weight: 900 !important; color: #00f5d4 !important; text-shadow: 0 0 16px rgba(0, 245, 212, 0.85), 0 2px 6px rgba(0,0,0,0.95) !important;">
                <span style="font-size: 1.5rem;">🏷️</span> Nombre del Proyecto <span style="color: #ef4444;">*</span>
              </label>
              <span class="student-badge-cyan" style="font-size: 0.82rem; font-weight: 900; background: rgba(0,245,212,0.22); color: #00f5d4; border: 1px solid rgba(0,245,212,0.6); padding: 0.3rem 0.85rem; border-radius: 9999px; box-shadow: 0 0 12px rgba(0,245,212,0.35);">Obligatorio</span>
            </div>
            <p class="student-field-desc" style="font-size: 0.96rem; color: #cbd5e1; margin: 0 0 1rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              Título principal de impacto que se mostrará en grande en la portada de tu Landing Page y catálogo.
            </p>
            <input 
              type="text" 
              id="student-proj-title" 
              value="${this.escapeHtml(d.title || '')}"
              placeholder="Ej. Inteligencia Artificial en el Aula: El Futuro de la Educación" 
              style="width: 100%; font-size: 1.25rem; font-weight: 700; padding: 1.15rem 1.4rem; border-radius: 14px; background: rgba(5, 10, 24, 0.95) !important; border: 2px solid rgba(0, 245, 212, 0.35) !important; color: #ffffff !important; outline: none; box-sizing: border-box;"
            />
          </div>

          <!-- PANTALLA 2: Quién lo hizo -->
          <div style="background: rgba(12, 20, 48, 0.75); border: 1.5px solid rgba(192, 132, 252, 0.5); border-radius: 20px; padding: 1.75rem 1.9rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3); transition: all 0.25s ease;" onfocuswithin="this.style.borderColor='#c084fc'; this.style.boxShadow='0 0 30px rgba(192,132,252,0.45)';">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
              <label for="student-proj-author" class="student-title-purple" style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.35rem !important; font-weight: 900 !important; color: #c084fc !important; text-shadow: 0 0 16px rgba(192, 132, 252, 0.85), 0 2px 6px rgba(0,0,0,0.95) !important;">
                <span style="font-size: 1.5rem;">👤</span> Quién lo hizo (Autor o Integrantes) <span style="color: #ef4444;">*</span>
              </label>
              <span class="student-badge-purple" style="font-size: 0.82rem; font-weight: 900; background: rgba(192,132,252,0.22); color: #e9d5ff; border: 1px solid rgba(192,132,252,0.6); padding: 0.3rem 0.85rem; border-radius: 9999px; box-shadow: 0 0 12px rgba(192,132,252,0.35);">Obligatorio</span>
            </div>
            <p class="student-field-desc" style="font-size: 0.96rem; color: #cbd5e1; margin: 0 0 1rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              Nombres de los estudiantes, integrantes o creadores que desarrollaron este proyecto educativo.
            </p>
            <input 
              type="text" 
              id="student-proj-author" 
              value="${this.escapeHtml(d.author || '')}"
              placeholder="Ej. Valentina Gómez, Mateo Torres, Equipo Alfa..." 
              style="width: 100%; font-size: 1.25rem; font-weight: 700; padding: 1.15rem 1.4rem; border-radius: 14px; background: rgba(5, 10, 24, 0.95) !important; border: 2px solid rgba(192, 132, 252, 0.35) !important; color: #ffffff !important; outline: none; box-sizing: border-box;"
            />
          </div>

          <!-- PANTALLA 3: Resumen del Proyecto -->
          <div style="background: rgba(12, 20, 48, 0.75); border: 1.5px solid rgba(56, 189, 248, 0.5); border-radius: 20px; padding: 1.75rem 1.9rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3); transition: all 0.25s ease;" onfocuswithin="this.style.borderColor='#38bdf8'; this.style.boxShadow='0 0 30px rgba(56,189,248,0.45)';">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
              <label for="student-proj-summary" class="student-title-blue" style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.35rem !important; font-weight: 900 !important; color: #38bdf8 !important; text-shadow: 0 0 16px rgba(56, 189, 248, 0.85), 0 2px 6px rgba(0,0,0,0.95) !important;">
                <span style="font-size: 1.5rem;">📝</span> Resumen del Proyecto (Síntesis) <span style="color: #ef4444;">*</span>
              </label>
              <span class="student-badge-blue" style="font-size: 0.82rem; font-weight: 900; background: rgba(56,189,248,0.22); color: #7dd3fc; border: 1px solid rgba(56,189,248,0.6); padding: 0.3rem 0.85rem; border-radius: 9999px; box-shadow: 0 0 12px rgba(56,189,248,0.35);">Obligatorio</span>
            </div>
            <p class="student-field-desc" style="font-size: 0.96rem; color: #cbd5e1; margin: 0 0 1rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              Breve sinopsis (2 a 4 líneas) que resume el objetivo y cautiva a los visitantes en la portada de la Landing Page.
            </p>
            <textarea 
              id="student-proj-summary" 
              rows="3"
              placeholder="Escribe un resumen conciso de qué trata el proyecto, a quién va dirigido y cuál es su objetivo principal..." 
              style="width: 100%; font-size: 1.2rem; line-height: 1.6; padding: 1.15rem 1.4rem; border-radius: 14px; background: rgba(5, 10, 24, 0.95) !important; border: 2px solid rgba(56, 189, 248, 0.35) !important; color: #ffffff !important; outline: none; box-sizing: border-box; resize: vertical;"
            >${this.escapeHtml(d.summary || '')}</textarea>
          </div>

          <!-- PANTALLA 4: Descripción Detallada -->
          <div style="background: rgba(12, 20, 48, 0.75); border: 1.5px solid rgba(244, 114, 182, 0.5); border-radius: 20px; padding: 1.75rem 1.9rem; box-shadow: 0 8px 30px rgba(0,0,0,0.3); transition: all 0.25s ease;" onfocuswithin="this.style.borderColor='#f472b6'; this.style.boxShadow='0 0 30px rgba(244,114,182,0.45)';">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
              <label for="student-proj-desc" class="student-title-pink" style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.35rem !important; font-weight: 900 !important; color: #f472b6 !important; text-shadow: 0 0 16px rgba(244, 114, 182, 0.85), 0 2px 6px rgba(0,0,0,0.95) !important;">
                <span style="font-size: 1.5rem;">📖</span> Descripción Detallada del Proyecto
              </label>
              <span class="student-badge-pink" style="font-size: 0.82rem; font-weight: 900; background: rgba(244,114,182,0.22); color: #fbcfe8; border: 1px solid rgba(244,114,182,0.6); padding: 0.3rem 0.85rem; border-radius: 9999px; box-shadow: 0 0 12px rgba(244,114,182,0.35);">Detallada</span>
            </div>
            <p class="student-field-desc" style="font-size: 0.96rem; color: #cbd5e1; margin: 0 0 1rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              Profundiza en los antecedentes, el problema identificado, la metodología de trabajo, los aprendizajes y conclusiones.
            </p>
            <textarea 
              id="student-proj-desc" 
              rows="5"
              placeholder="Detalla toda la información de tu proyecto educativo para estructurar las secciones de la Landing Page..." 
              style="width: 100%; font-size: 1.2rem; line-height: 1.6; padding: 1.15rem 1.4rem; border-radius: 14px; background: rgba(5, 10, 24, 0.95) !important; border: 2px solid rgba(244, 114, 182, 0.35) !important; color: #ffffff !important; outline: none; box-sizing: border-box; resize: vertical;"
            >${this.escapeHtml(d.description || '')}</textarea>
          </div>

          <!-- PANTALLA 5: ¿Quieres que tu proyecto sea público o privado? -->
          <div style="background: rgba(12, 20, 48, 0.75); border: 2px solid ${d.isPublic !== false ? 'rgba(0, 245, 212, 0.65)' : 'rgba(245, 158, 11, 0.65)'}; border-radius: 20px; padding: 1.75rem 1.9rem; box-shadow: 0 8px 35px rgba(0,0,0,0.4); transition: all 0.25s ease;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
              <label class="student-title-cyan" style="display: flex; align-items: center; gap: 0.6rem; font-size: 1.35rem !important; font-weight: 900 !important; color: ${d.isPublic !== false ? '#00f5d4' : '#fbbf24'} !important; text-shadow: 0 0 16px ${d.isPublic !== false ? 'rgba(0, 245, 212, 0.85)' : 'rgba(251, 191, 36, 0.85)'}, 0 2px 6px rgba(0,0,0,0.95) !important;">
                <span style="font-size: 1.5rem;">${d.isPublic !== false ? '🌐' : '🔒'}</span> ¿Quieres que tu proyecto sea público o privado? <span style="color: #ef4444;">*</span>
              </label>
              <span style="font-size: 0.82rem; font-weight: 900; background: ${d.isPublic !== false ? 'rgba(0,245,212,0.22)' : 'rgba(245,158,11,0.22)'}; color: ${d.isPublic !== false ? '#00f5d4' : '#fbbf24'}; border: 1px solid ${d.isPublic !== false ? 'rgba(0,245,212,0.6)' : 'rgba(245,158,11,0.6)'}; padding: 0.3rem 0.85rem; border-radius: 9999px; box-shadow: 0 0 12px ${d.isPublic !== false ? 'rgba(0,245,212,0.35)' : 'rgba(245,158,11,0.35)'};">
                ${d.isPublic !== false ? '🌐 PÚBLICO' : '🔒 PRIVADO'}
              </span>
            </div>
            <p class="student-field-desc" style="font-size: 0.96rem; color: #cbd5e1; margin: 0 0 1.25rem; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              Selecciona cómo se visualizará tu proyecto en la plataforma para los demás usuarios y visitantes:
            </p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem;">
              
              <!-- Tarjeta 1: Público -->
              <div 
                onclick="window.ProjectsView.setStudentProjectVisibility(true)"
                style="cursor: pointer; border-radius: 16px; padding: 1.35rem 1.45rem; transition: all 0.25s ease; border: ${d.isPublic !== false ? '2.5px solid #00f5d4' : '1.5px solid rgba(255,255,255,0.15)'}; background: ${d.isPublic !== false ? 'rgba(0, 245, 212, 0.16)' : 'rgba(5, 10, 24, 0.7)'}; box-shadow: ${d.isPublic !== false ? '0 0 30px rgba(0,245,212,0.35)' : 'none'}; display: flex; flex-direction: column; justify-content: space-between;"
                onmouseenter="this.style.transform='translateY(-2px)';"
                onmouseleave="this.style.transform='none';"
              >
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                    <span style="font-size: 1.6rem;">🌐</span>
                    <span style="font-size: 0.78rem; font-weight: 900; padding: 0.25rem 0.75rem; border-radius: 999px; background: ${d.isPublic !== false ? 'rgba(0,245,212,0.28)' : 'rgba(255,255,255,0.08)'}; color: ${d.isPublic !== false ? '#00f5d4' : '#94a3b8'}; border: 1px solid ${d.isPublic !== false ? '#00f5d4' : 'rgba(255,255,255,0.2)'};">
                      ${d.isPublic !== false ? '✔ SELECCIONADO' : 'Elegir'}
                    </span>
                  </div>
                  <h4 style="margin: 0 0 0.4rem; font-size: 1.2rem; color: #ffffff; font-weight: 900;">
                    Proyecto Público (Para todos)
                  </h4>
                  <p style="margin: 0; font-size: 0.92rem; color: #cbd5e1; line-height: 1.45;">
                    Cualquier persona que se registre o navegue en MENTIX podrá descubrir, ver y acceder a este proyecto en la sección de proyectos y en su Landing Page.
                  </p>
                </div>
                <div style="margin-top: 1rem; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; font-weight: 800; color: #00f5d4; display: flex; align-items: center; gap: 0.35rem;">
                  <span>✨</span> Recomendado para proyectos estudiantiles
                </div>
              </div>

              <!-- Tarjeta 2: Privado -->
              <div 
                onclick="window.ProjectsView.setStudentProjectVisibility(false)"
                style="cursor: pointer; border-radius: 16px; padding: 1.35rem 1.45rem; transition: all 0.25s ease; border: ${d.isPublic === false ? '2.5px solid #fbbf24' : '1.5px solid rgba(255,255,255,0.15)'}; background: ${d.isPublic === false ? 'rgba(245, 158, 11, 0.16)' : 'rgba(5, 10, 24, 0.7)'}; box-shadow: ${d.isPublic === false ? '0 0 30px rgba(245, 158, 11, 0.35)' : 'none'}; display: flex; flex-direction: column; justify-content: space-between;"
                onmouseenter="this.style.transform='translateY(-2px)';"
                onmouseleave="this.style.transform='none';"
              >
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
                    <span style="font-size: 1.6rem;">🔒</span>
                    <span style="font-size: 0.78rem; font-weight: 900; padding: 0.25rem 0.75rem; border-radius: 999px; background: ${d.isPublic === false ? 'rgba(245,158,11,0.28)' : 'rgba(255,255,255,0.08)'}; color: ${d.isPublic === false ? '#fbbf24' : '#94a3b8'}; border: 1px solid ${d.isPublic === false ? '#fbbf24' : 'rgba(255,255,255,0.2)'};">
                      ${d.isPublic === false ? '✔ SELECCIONADO' : 'Elegir'}
                    </span>
                  </div>
                  <h4 style="margin: 0 0 0.4rem; font-size: 1.2rem; color: #ffffff; font-weight: 900;">
                    Proyecto Privado (Solo tú y profesores)
                  </h4>
                  <p style="margin: 0; font-size: 0.92rem; color: #cbd5e1; line-height: 1.45;">
                    Solo tú como creador y los docentes o administradores de la plataforma tendrán acceso para ver y editar este proyecto.
                  </p>
                </div>
                <div style="margin-top: 1rem; padding-top: 0.65rem; border-top: 1px solid rgba(255,255,255,0.1); font-size: 0.8rem; font-weight: 800; color: #fbbf24; display: flex; align-items: center; gap: 0.35rem;">
                  <span>🛡️</span> Acceso restringido y confidencial
                </div>
              </div>

            </div>
          </div>

        </div>

        <!-- Barra Inferior de Acción -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <button 
            type="button" 
            onclick="window.ProjectsView.closeCreateProjectModal()" 
            style="padding: 0.95rem 1.65rem; font-weight: 800; border-radius: 14px; background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(255,255,255,0.25); color: #cbd5e1; cursor: pointer; font-size: 1rem; transition: all 0.2s ease;"
            onmouseenter="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.4)';"
            onmouseleave="this.style.color='#cbd5e1'; this.style.borderColor='rgba(255,255,255,0.25)';"
          >
            ← Cancelar
          </button>

          <button 
            type="button" 
            onclick="window.ProjectsView.goToCreateProjectStep(2)" 
            style="display: inline-flex; align-items: center; gap: 0.75rem; padding: 1.05rem 2.25rem; font-weight: 900; font-size: 1.15rem; border-radius: 16px; background: linear-gradient(135deg, #00f5d4 0%, #7c3aed 100%); color: #050b14; border: none; cursor: pointer; box-shadow: 0 6px 28px rgba(0, 245, 212, 0.45); transition: transform 0.2s ease;"
            onmouseenter="this.style.transform='translateY(-2px) scale(1.02)';"
            onmouseleave="this.style.transform='none';"
          >
            <span>Siguiente: Elegir Formato y Recursos</span>
            <span>→</span>
          </button>
        </div>

      </div>
    `;
  },

  renderStudentCreateStep2Html(d) {
    return `
      <div class="glass-panel" style="background: rgba(8, 14, 34, 0.85); backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px); border: 2px solid rgba(0, 245, 212, 0.45); border-radius: 28px; padding: 2.75rem; box-shadow: 0 30px 90px rgba(0,0,0,0.85), 0 0 45px rgba(0,245,212,0.25);">
        
        <!-- Ficha Resumen del Proyecto -->
        <div style="background: rgba(0, 245, 212, 0.1); border: 1.5px solid rgba(0, 245, 212, 0.45); border-radius: 18px; padding: 1.4rem 1.8rem; margin-bottom: 2.25rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; box-shadow: 0 0 30px rgba(0,245,212,0.2);">
          <div>
            <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.35rem;">
              <span style="font-size: 1.6rem;">💡</span>
              <h3 style="font-size: 1.45rem; font-weight: 900; margin: 0; color: #00f5d4 !important; text-shadow: 0 0 16px rgba(0,245,212,0.85);">
                ${this.escapeHtml(d.title || 'Mi Proyecto Educativo')}
              </h3>
            </div>
            <p style="font-size: 1rem; color: #cbd5e1; margin: 0; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
              <strong style="color: #ffffff;">Por:</strong> ${this.escapeHtml(d.author || 'Estudiante')} 
              ${d.summary ? `<span style="color: #94a3b8; margin-left: 0.5rem;">• "${this.escapeHtml(d.summary)}"</span>` : ''}
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
            <div 
              onclick="window.ProjectsView.setStudentProjectVisibility(${d.isPublic === false ? 'true' : 'false'})" 
              style="cursor: pointer; display: inline-flex; align-items: center; gap: 0.45rem; padding: 0.5rem 1rem; border-radius: 999px; font-size: 0.88rem; font-weight: 900; transition: all 0.2s ease; ${d.isPublic !== false ? 'background: rgba(0,245,212,0.2); color: #00f5d4; border: 1.5px solid #00f5d4; box-shadow: 0 0 14px rgba(0,245,212,0.3);' : 'background: rgba(245,158,11,0.2); color: #fbbf24; border: 1.5px solid #fbbf24; box-shadow: 0 0 14px rgba(245,158,11,0.3);'}"
              title="Haz clic para cambiar la visibilidad de tu proyecto"
            >
              <span>${d.isPublic !== false ? '🌐 Proyecto Público' : '🔒 Proyecto Privado'}</span>
              <span style="font-size: 0.72rem; opacity: 0.85;">(Cambiar)</span>
            </div>

            <button 
              type="button" 
              onclick="window.ProjectsView.goToCreateProjectStep(1)" 
              style="background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.3); color: #ffffff; border-radius: 12px; padding: 0.65rem 1.25rem; font-size: 0.95rem; font-weight: 800; cursor: pointer; display: inline-flex; align-items: center; gap: 0.4rem; transition: all 0.2s ease;"
              onmouseenter="this.style.background='rgba(255,255,255,0.22)';"
              onmouseleave="this.style.background='rgba(255,255,255,0.12)';"
            >
              ✏️ Volver a editar datos
            </button>
          </div>
        </div>

        <div style="text-align: center; margin-bottom: 2.25rem;">
          <h2 style="font-size: 1.9rem; font-weight: 900; margin: 0 0 0.5rem; color: #ffffff; text-shadow: 0 2px 14px rgba(0,0,0,0.9), 0 0 25px rgba(0,245,212,0.35);">
            Selecciona el Formato de tu Proyecto
          </h2>
          <p style="font-size: 1.05rem; color: #cbd5e1; margin: 0; text-shadow: 0 1px 4px rgba(0,0,0,0.8);">
            Elige la estructura interactiva que deseas utilizar para publicar tu contenido en la Landing Page:
          </p>
        </div>

        <!-- Las 4 Pantallas Grandes de Formato (Presentación, Video Clase, Documento, URL) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem;">
          
          <!-- Opción 1: Presentación Interactiva -->
          <div 
            class="glass-panel student-format-presentation" 
            onclick="window.ProjectsView.createStudentProject('presentation')"
            style="padding: 2.3rem 1.8rem; border-radius: 22px; border: 2px solid #a855f7; background: rgba(124, 58, 237, 0.18); cursor: pointer; text-align: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(168,85,247,0.2);"
            onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 14px 35px rgba(168, 85, 247, 0.5)';"
            onmouseleave="this.style.transform='none'; this.style.borderColor='#a855f7'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(168,85,247,0.2)';"
          >
            <div>
              <div style="font-size: 3.8rem; margin-bottom: 0.85rem; filter: drop-shadow(0 0 12px rgba(192, 132, 252, 0.6));">📊</div>
              <h3 class="student-format-card-title" style="font-size: 1.5rem !important; font-weight: 900 !important; margin: 0 0 0.5rem; color: #d8b4fe !important; text-shadow: 0 0 16px rgba(192, 132, 252, 0.9);">Presentación</h3>
              <p style="font-size: 0.95rem; color: #e2e8f0; margin: 0 0 1.35rem; line-height: 1.5; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                Diapositivas interactivas con explicaciones, conceptos clave, notas e imágenes para proyectar en clase.
              </p>
            </div>
            <button type="button" class="btn btn-outline" style="width: 100%; font-size: 0.95rem; padding: 0.8rem 1rem; border-color: #a855f7; color: #e9d5ff; font-weight: 900; border-radius: 14px; pointer-events: none; background: rgba(168,85,247,0.15);">
              Crear Presentación →
            </button>
          </div>

          <!-- Opción 2: Video Clase -->
          <div 
            class="glass-panel student-format-video" 
            onclick="window.ProjectsView.createStudentProject('video')"
            style="padding: 2.3rem 1.8rem; border-radius: 22px; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.18); cursor: pointer; text-align: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(239,68,68,0.2);"
            onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 14px 35px rgba(239, 68, 68, 0.5)';"
            onmouseleave="this.style.transform='none'; this.style.borderColor='#ef4444'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(239,68,68,0.2)';"
          >
            <div>
              <div style="font-size: 3.8rem; margin-bottom: 0.85rem; filter: drop-shadow(0 0 12px rgba(248, 113, 113, 0.6));">🎬</div>
              <h3 class="student-format-card-title" style="font-size: 1.5rem !important; font-weight: 900 !important; margin: 0 0 0.5rem; color: #fca5a5 !important; text-shadow: 0 0 16px rgba(239, 68, 68, 0.9);">Video Clase</h3>
              <p style="font-size: 0.95rem; color: #e2e8f0; margin: 0 0 1.35rem; line-height: 1.5; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                Integra videos (YouTube, Google Drive, MP4) con capítulos, resumen y preguntas interactivas.
              </p>
            </div>
            <button type="button" class="btn btn-outline" style="width: 100%; font-size: 0.95rem; padding: 0.8rem 1rem; border-color: #ef4444; color: #fee2e2; font-weight: 900; border-radius: 14px; pointer-events: none; background: rgba(239,68,68,0.15);">
              Crear Video Clase →
            </button>
          </div>

          <!-- Opción 3: Documento Didáctico -->
          <div 
            class="glass-panel student-format-document" 
            onclick="window.ProjectsView.createStudentProject('document')"
            style="padding: 2.3rem 1.8rem; border-radius: 22px; border: 2px solid #3b82f6; background: rgba(59, 130, 246, 0.18); cursor: pointer; text-align: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(59,130,246,0.2);"
            onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 14px 35px rgba(59, 130, 246, 0.5)';"
            onmouseleave="this.style.transform='none'; this.style.borderColor='#3b82f6'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(59,130,246,0.2)';"
          >
            <div>
              <div style="font-size: 3.8rem; margin-bottom: 0.85rem; filter: drop-shadow(0 0 12px rgba(96, 165, 250, 0.6));">📄</div>
              <h3 class="student-format-card-title" style="font-size: 1.5rem !important; font-weight: 900 !important; margin: 0 0 0.5rem; color: #93c5fd !important; text-shadow: 0 0 16px rgba(59, 130, 246, 0.9);">Documentos</h3>
              <p style="font-size: 0.95rem; color: #e2e8f0; margin: 0 0 1.35rem; line-height: 1.5; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                Guías didácticas, apuntes de clase y lecturas estructuradas por secciones para la comunidad educativa.
              </p>
            </div>
            <button type="button" class="btn btn-outline" style="width: 100%; font-size: 0.95rem; padding: 0.8rem 1rem; border-color: #3b82f6; color: #dbeafe; font-weight: 900; border-radius: 14px; pointer-events: none; background: rgba(59,130,246,0.15);">
              Crear Documento →
            </button>
          </div>

          <!-- Opción 4: Recurso Web por URL -->
          <div 
            class="glass-panel student-format-url" 
            onclick="window.ProjectsView.createStudentProject('url')"
            style="padding: 2.3rem 1.8rem; border-radius: 22px; border: 2px solid #10b981; background: rgba(16, 185, 129, 0.18); cursor: pointer; text-align: center; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(16,185,129,0.2);"
            onmouseenter="this.style.transform='translateY(-6px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 14px 35px rgba(16, 185, 129, 0.5)';"
            onmouseleave="this.style.transform='none'; this.style.borderColor='#10b981'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.4), 0 0 25px rgba(16,185,129,0.2)';"
          >
            <div>
              <div style="font-size: 3.8rem; margin-bottom: 0.85rem; filter: drop-shadow(0 0 12px rgba(52, 211, 153, 0.6));">🌐</div>
              <h3 class="student-format-card-title" style="font-size: 1.5rem !important; font-weight: 900 !important; margin: 0 0 0.5rem; color: #6ee7b7 !important; text-shadow: 0 0 16px rgba(16, 185, 129, 0.9);">Enlace / URLs</h3>
              <p style="font-size: 0.95rem; color: #e2e8f0; margin: 0 0 1.35rem; line-height: 1.5; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                Enlaza e incrusta simuladores (PhET, GeoGebra), páginas web, formularios y herramientas en línea.
              </p>
            </div>
            <button type="button" class="btn btn-outline" style="width: 100%; font-size: 0.95rem; padding: 0.8rem 1rem; border-color: #10b981; color: #d1fae5; font-weight: 900; border-radius: 14px; pointer-events: none; background: rgba(16,185,129,0.15);">
              Crear Recurso URL →
            </button>
          </div>

        </div>

        <!-- Barra Inferior de Acción -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.14); padding-top: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <button 
            type="button" 
            onclick="window.ProjectsView.goToCreateProjectStep(1)" 
            style="padding: 0.95rem 1.65rem; font-weight: 800; border-radius: 14px; background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(255,255,255,0.25); color: #cbd5e1; cursor: pointer; font-size: 1rem; transition: all 0.2s ease;"
            onmouseenter="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.4)';"
            onmouseleave="this.style.color='#cbd5e1'; this.style.borderColor='rgba(255,255,255,0.25)';"
          >
            ← Volver a editar datos generales
          </button>

          <button 
            type="button" 
            onclick="window.ProjectsView.closeCreateProjectModal()" 
            style="padding: 0.95rem 1.65rem; font-weight: 800; border-radius: 14px; background: rgba(15, 23, 42, 0.7); border: 1.5px solid rgba(255,255,255,0.25); color: #cbd5e1; cursor: pointer; font-size: 1rem; transition: all 0.2s ease;"
            onmouseenter="this.style.color='#fff'; this.style.borderColor='rgba(255,255,255,0.4)';"
            onmouseleave="this.style.color='#cbd5e1'; this.style.borderColor='rgba(255,255,255,0.25)';"
          >
            Cerrar
          </button>
        </div>

      </div>
    `;
  },

  // Habilitado EXCLUSIVAMENTE para profesores y administradores
  openCreateCodeModal() {
    if (!this.isTeacherOrAdmin()) {
      alert('🚫 Solo los profesores y administradores pueden crear un código de proyecto para estudiantes.');
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
    this.clearStudentCreateDraft();
    const modal = document.getElementById('create-project-type-modal');
    if (modal) modal.classList.remove('active');
    if (window.soundEngine) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  openJoinProjectModal(prefillCode = '') {
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    const existing = document.getElementById('project-join-modal');
    if (existing) existing.remove();
    this.viewMode = 'join';
    this.prefillJoinCode = prefillCode;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const input = document.getElementById('project-join-code-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 80);
  },

  closeJoinProjectModal() {
    this.viewMode = 'list';
    const existing = document.getElementById('project-join-modal');
    if (existing) existing.remove();
    document.body.classList.add('projects-pure-white-theme');
    const navEl = document.getElementById('main-navbar');
    if (navEl) navEl.style.display = '';
    const container = document.getElementById('view-projects');
    if (container) {
      container.style.padding = '';
      container.style.margin = '';
      container.style.background = '';
    }
    if (window.soundEngine && window.soundEngine.playClick) window.soundEngine.playClick();
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      window.ProjectWizard.openWizard(matchedProject.id, 1);
      return;
    }

    // Si coincide con código personalizado creado por el profesor
    if (matchedCustom) {
      if (window.soundEngine && window.soundEngine.playSuccess) window.soundEngine.playSuccess();
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
        <button type="button" onclick="window.ProjectWizard.openWizard(null, 1);" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 0.45rem 1rem; border-radius: 8px; font-weight: 800; font-size: 0.85rem; cursor: pointer; box-shadow: 0 4px 12px rgba(16,185,129,0.35);">
          ✨ Crear Proyecto Ahora
        </button>
      `;
      errEl.style.display = 'block';
    } else {
      if (confirm(`El código "${clean}" no existe aún. ¿Deseas iniciar la creación de un nuevo proyecto?`)) {
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

  editSelectedProject(id) {
    const projId = id || this.selectedProjectId;
    const c = (window.appState?.challenges || []).find(x => x && x.id === projId);
    if (!c) return;
    const t = c.projectType;
    if (t === 'video') window.appRouter.editVideo(c.id);
    else if (t === 'document') window.appRouter.editDocument(c.id);
    else if (t === 'url') window.appRouter.editUrl(c.id);
    else if (t === 'presentation') window.appRouter.editPresentation(c.id);
    else if (window.ProjectWizard) window.ProjectWizard.openWizard(c.id);
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
      case 'robot-hero':
      case 'robot':
        return "#071739 url('assets/projects_ui/robot_hero_banner.png') center/cover no-repeat";
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
    if (bgValue && typeof bgValue === 'string') {
      const bgLower = bgValue.toLowerCase();
      if (['marfil-light', 'marfil', 'aurora-clean', 'aurora-clara', 'coral-suave'].includes(bgLower)) {
        isDarkBg = false;
      } else if (bgLower.startsWith('#') || bgLower.startsWith('rgb')) {
        isDarkBg = this.getColorLuminance(bgValue) < 0.52;
      } else {
        isDarkBg = true;
      }
    } else {
      // En Mentix el Hero principal es SIEMPRE un fondo oscuro y cibernético (#091e2d)
      isDarkBg = true;
    }

    let finalTitle = titleColor;
    let finalText = textColor;
    let finalAccent = accentColor || (isDarkBg ? '#00f5d4' : '#0284c7');

    const titleLum = finalTitle ? this.getColorLuminance(finalTitle) : (isDarkBg ? 1 : 0);
    const textLum = finalText ? this.getColorLuminance(finalText) : (isDarkBg ? 0.8 : 0.2);

    if (isDarkBg) {
      // Fondo oscuro: el texto DEBE ser blanco brillante y de alto contraste
      if (!finalTitle || titleLum < 0.5) {
        finalTitle = '#ffffff';
      }
      if (!finalText || textLum < 0.45) {
        finalText = '#e2e8f0';
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
        ? 'linear-gradient(rgba(5, 10, 24, 0.85), rgba(8, 14, 30, 0.94))'
        : 'linear-gradient(rgba(255, 255, 255, 0.88), rgba(241, 245, 249, 0.95))',
      titleShadow: isDarkBg
        ? 'text-shadow: 0 3px 20px rgba(0,0,0,0.95), 0 0 35px rgba(0, 245, 212, 0.35);'
        : 'text-shadow: 0 1px 3px rgba(255,255,255,0.8);',
      descShadow: isDarkBg
        ? 'text-shadow: 0 2px 10px rgba(0,0,0,0.9);'
        : '',
      gradientSpanStyle: isDarkBg
        ? 'background: linear-gradient(135deg, #00f5d4 0%, #00e5be 60%, #38bdf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: none;'
        : 'background: linear-gradient(135deg, #0284c7 0%, #2563eb 60%, #4338ca 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; text-shadow: none;',
      eyebrowStyle: isDarkBg
        ? 'background: rgba(0, 245, 212, 0.16); border: 1.5px solid rgba(0, 245, 212, 0.6); color: #00f5d4; font-weight: 800;'
        : 'background: rgba(2, 132, 199, 0.12); border: 1.5px solid rgba(2, 132, 199, 0.45); color: #0369a1; font-weight: 800;'
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
    let selected = allProjects.find(x => x.id === this.selectedProjectId) || (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (!selected) {
      try {
        const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
        selected = drafts.find(d => d && d.id === this.selectedProjectId);
      } catch (e) {}
    }
    if (!selected && window.ProjectWizard?.draft && window.ProjectWizard.draft.id === this.selectedProjectId) {
      selected = window.ProjectWizard.draft;
    }
    if (selected) {
      try {
        localStorage.setItem('mentix_active_landing_project', JSON.stringify(selected));
      } catch (e) {}
    }

    const gp = (selected && selected.govdata) ? selected.govdata : {};
    const vp = (selected && (selected.valueProp || selected.valueProposition)) ? (selected.valueProp || selected.valueProposition) : (gp.valueProp || {});
    const pub = (selected && (selected.landingConfig || selected.publication)) ? (selected.landingConfig || selected.publication) : {};
    const vid = (selected && (selected.videoConfig || selected.video)) ? (selected.videoConfig || selected.video) : {};

    const brandTitle = this.escapeHtml((selected && (selected.categoryName || pub.visibleCategory)) || 'Proyecto');
    const brandSubtitle = this.escapeHtml((selected && (pub.publicName || selected.title)) || '');
    const selectedTitle = selected ? this.escapeHtml(pub.publicName || selected.title || 'Proyecto') : 'Proyecto';
    const heroEyebrow = this.escapeHtml((selected && (selected.subtitle || selected.categoryName)) || '🚀 Proyecto Educativo & Didáctico');
    const heroMainTitle1 = selected ? this.escapeHtml(pub.landingTitle || selected.title || 'Proyecto') : 'Proyecto';
    const heroMainTitle2 = (selected && selected.subtitle) ? this.escapeHtml(selected.subtitle) : '';
    const heroSubtitle = this.escapeHtml(
      (selected && (pub.publicDescription || selected.shortDescription || selected.description || gp.shortDescription)) ||
      'Explora los objetivos, recursos y detalles de este proyecto educativo.'
    );

    const ctaText = this.escapeHtml((selected && (pub.ctaText || selected.ctaText || vp.visitorAction)) || 'Unirse / Colaborar');
    const ctaUrl = (selected && (pub.ctaUrl || selected.ctaUrl)) || '';
    const mainObjective = this.escapeHtml((selected && (selected.mainObjective || gp.mainObjective || vp.problemSolved)) || 'Objetivo en desarrollo');
    const targetAudience = this.escapeHtml((selected && (selected.targetAudience || gp.targetAudience || vp.targetAudience || vp.forWhom)) || 'Comunidad educativa y participantes');
    const visibleCategory = this.escapeHtml((selected && (selected.categoryName || pub.visibleCategory)) || 'General');
    const projectState = this.escapeHtml((selected && (selected.preparationStatus || selected.projectState || 'En desarrollo')).toString().replace(/_/g, ' '));

    const cardProblem = this.escapeHtml(
      (selected && (selected.problemStatement || gp.problemStatement || vp.problemSolved)) ||
      (selected && (selected.shortDescription || gp.shortDescription)) ||
      'Definición y planteamiento del reto o necesidad abordada por el proyecto.'
    );
    const cardValueProp = this.escapeHtml(
      (selected && (vp.howItWorks || selected.mainObjective || gp.mainObjective)) ||
      'Solución propuesta y enfoque central para resolver el reto planteado.'
    );
    const cardMethodology = this.escapeHtml(
      (selected && (selected.fullDescription || gp.fullDescription || (Array.isArray(vp.keyFeatures) && vp.keyFeatures.length ? vp.keyFeatures.join(', ') : '') || selected.projectSubtype)) ||
      'Metodología, etapas y procesos clave de ejecución del proyecto.'
    );
    const cardImpact = this.escapeHtml(
      (selected && (selected.benefits || gp.benefits || vp.resultsAndBenefits)) ||
      'Resultados tangibles, beneficios directos y alcance esperado para la comunidad.'
    );
    const leadWhyText = this.escapeHtml(
      (selected && (selected.shortDescription || gp.shortDescription || selected.description || selected.mainObjective)) ||
      'Conoce los objetivos, el problema identificado y el impacto positivo de este proyecto.'
    );

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

    // Video dinámico del proyecto
    const vc = (selected && (selected.videoConfig || selected.video)) ? (selected.videoConfig || selected.video) : (gp.videoConfig || gp.video || {});
    const videoUrl = (typeof vc === 'string' ? vc : (vc.url || vc.embedUrl || selected?.videoUrl || '')).trim();
    const hasVideo = Boolean(videoUrl && videoUrl.length >= 6);

    // Recursos, enlaces y activos visuales reales del proyecto (sin inventar datos ficticios)
    const userResources = (Array.isArray(selected?.resources) ? selected.resources : (Array.isArray(gp.resources) ? gp.resources : [])).filter(r => r && r.visibility !== 'private');
    const userLinks = (Array.isArray(selected?.externalLinks) ? selected.externalLinks : (Array.isArray(gp.externalLinks) ? gp.externalLinks : [])).filter(l => l && l.visibility !== 'private');
    const userVisuals = (Array.isArray(selected?.visualAssets) ? selected.visualAssets : (Array.isArray(gp.visualAssets) ? gp.visualAssets : [])).filter(v => v && v.visibility !== 'private');
    const mainCover = selected?.mainImage || gp.mainImage || '';

    let cardsHtml = '';
    let totalCardsCount = 0;

    // 1. Tarjeta de Video Real (si el usuario lo configuró)
    if (hasVideo) {
      totalCardsCount++;
      let videoThumb = '';
      const ytMatch = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
      if (ytMatch) {
        videoThumb = `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
      } else if (mainCover) {
        videoThumb = mainCover;
      }
      const vTitle = vc.title || 'Video explicativo del proyecto';
      const vDesc = vc.description || 'Conoce los objetivos y el alcance de la iniciativa.';
      const vSearch = (vTitle + ' ' + vDesc + ' video explicativo multimedia').toLowerCase();
      const vFile = vc.fileName || 'Video oficial';

      cardsHtml += `
        <article class="inno-resource-card" data-category="video" data-plp-search="${this.escapeHtml(vSearch)}">
          <div class="inno-card-thumb-wrap" style="${videoThumb ? `background-image:url('${this.escapeHtml(videoThumb)}'); background-size:cover; background-position:center;` : 'background:linear-gradient(135deg, #091e2d 0%, #0284c7 100%);'} cursor:pointer;" onclick="window.ProjectsView.playLandingVideo()">
            <span class="inno-card-tag" style="background:#0284c7;">▶ Video</span>
            <div class="inno-card-play-btn">▶</div>
          </div>
          <div class="inno-card-body">
            <div>
              <h4 class="inno-card-title">${this.escapeHtml(vTitle)}</h4>
              <p class="inno-card-desc">${this.escapeHtml(vDesc)}</p>
            </div>
            <div class="inno-card-footer">
              <span>🎬 ${this.escapeHtml(vFile)}</span>
              <button type="button" class="inno-card-dl-btn" onclick="window.ProjectsView.playLandingVideo()" title="Reproducir">▶</button>
            </div>
          </div>
        </article>
      `;
    }

    // 2. Tarjetas de Documentos Reales
    userResources.forEach((res, idx) => {
      totalCardsCount++;
      const name = res.name || res.title || `Documento ${idx + 1}`;
      const desc = res.description || 'Material oficial y recurso de apoyo del proyecto.';
      const type = (res.type || '').toLowerCase();
      const fmt = (res.format || '').toUpperCase();
      const cat = (res.category || '').toLowerCase();

      let dataCat = 'doc';
      let tagColor = '#ea580c';
      let tagLabel = '📄 ' + (fmt || 'DOC');

      if (type === 'ppt' || fmt.includes('PPT') || cat.includes('presentac')) {
        dataCat = 'pres';
        tagColor = '#7c3aed';
        tagLabel = '📽️ Presentación';
      } else if (type === 'guide' || type === 'manual' || cat.includes('gu') || cat.includes('manual')) {
        dataCat = 'guide';
        tagColor = '#059669';
        tagLabel = '📘 Guía';
      } else if (type === 'image' || fmt.match(/PNG|JPG|JPEG|WEBP|SVG/)) {
        dataCat = 'img';
        tagColor = '#0284c7';
        tagLabel = '🖼️ Imagen';
      } else if (type === 'excel' || fmt.match(/XLS|CSV/)) {
        dataCat = 'doc';
        tagColor = '#16a34a';
        tagLabel = '📊 Excel';
      } else if (type === 'word' || fmt.match(/DOC|DOCX/)) {
        dataCat = 'doc';
        tagColor = '#2563eb';
        tagLabel = '📝 Word';
      } else if (type === 'zip' || fmt.includes('ZIP')) {
        dataCat = 'doc';
        tagColor = '#d97706';
        tagLabel = '📦 ZIP';
      }

      const thumbUrl = res.thumbnailUrl || res.previewUrl || ((res.url && res.url.startsWith('data:image/')) ? res.url : '');
      const rSearch = (name + ' ' + desc + ' ' + tagLabel + ' ' + (res.category || '')).toLowerCase();
      const dateStr = res.date || res.updatedAt || 'Reciente';
      const sizeStr = res.sizeLabel || (res.sizeBytes ? (res.sizeBytes / 1024 / 1024).toFixed(1) + ' MB' : 'Archivo');

      const actionFn = res.url
        ? `window.ProjectsView.openOrDownloadResource('${this.escapeHtml(res.url)}', '${this.escapeHtml(name)}')`
        : `window.ProjectsView.downloadLandingDoc('${this.escapeHtml(name)}')`;

      cardsHtml += `
        <article class="inno-resource-card" data-category="${dataCat}" data-plp-search="${this.escapeHtml(rSearch)}">
          <div class="inno-card-thumb-wrap" style="${thumbUrl ? `background-image:url('${this.escapeHtml(thumbUrl)}'); background-size:cover; background-position:center;` : 'background:linear-gradient(135deg, #091e2d 0%, #1e293b 100%);'} cursor:pointer;" onclick="${actionFn}">
            <span class="inno-card-tag" style="background:${tagColor};">${tagLabel}</span>
          </div>
          <div class="inno-card-body">
            <div>
              <h4 class="inno-card-title">${this.escapeHtml(name)}</h4>
              <p class="inno-card-desc">${this.escapeHtml(desc)}</p>
            </div>
            <div class="inno-card-footer">
              <span>📅 ${this.escapeHtml(dateStr)} • 💾 ${this.escapeHtml(sizeStr)}</span>
              <button type="button" class="inno-card-dl-btn" onclick="${actionFn}" title="Abrir o Descargar">⬇</button>
            </div>
          </div>
        </article>
      `;
    });

    // 3. Tarjetas de Enlaces Externos Reales
    userLinks.forEach((lnk, idx) => {
      totalCardsCount++;
      const lTitle = lnk.title || `Enlace ${idx + 1}`;
      const lDesc = lnk.description || lnk.url || 'Enlace externo';
      const lCat = lnk.category || 'Enlace Web';
      const lSearch = (lTitle + ' ' + lDesc + ' ' + lCat + ' enlace link').toLowerCase();
      const domain = lnk.url ? lnk.url.replace(/^https?:\/\//i, '').split('/')[0] : 'Web';

      cardsHtml += `
        <article class="inno-resource-card" data-category="link" data-plp-search="${this.escapeHtml(lSearch)}">
          <div class="inno-card-thumb-wrap" style="background:linear-gradient(135deg, #064e3b 0%, #091e2d 100%); cursor:pointer;" onclick="window.open('${this.escapeHtml(lnk.url)}', '_blank')">
            <span class="inno-card-tag" style="background:#10b981;">🔗 ${this.escapeHtml(lCat)}</span>
          </div>
          <div class="inno-card-body">
            <div>
              <h4 class="inno-card-title">${this.escapeHtml(lTitle)}</h4>
              <p class="inno-card-desc">${this.escapeHtml(lDesc)}</p>
            </div>
            <div class="inno-card-footer">
              <span>🌐 ${this.escapeHtml(domain)}</span>
              <button type="button" class="inno-card-dl-btn" onclick="window.open('${this.escapeHtml(lnk.url)}', '_blank')" title="Visitar enlace">↗</button>
            </div>
          </div>
        </article>
      `;
    });

    if (totalCardsCount === 0) {
      cardsHtml = `
        <article class="inno-resource-card" data-category="doc">
          <div class="inno-res-thumb-wrap" style="background-image:url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&q=80'); cursor:pointer;" onclick="window.ProjectsView.previewLandingDoc('Guía del Proyecto — ${selectedTitle}')">
          </div>
          <div class="inno-res-body">
            <div>
              <span class="inno-res-badge doc">📘 Documento</span>
              <h4 class="inno-res-title">Guía del Proyecto</h4>
              <p class="inno-res-desc">Conoce los lineamientos y alcance del proyecto.</p>
            </div>
            <div class="inno-res-footer">
              <span>📅 12 Oct. 2026</span>
              <button type="button" class="inno-res-action-link" onclick="window.ProjectsView.previewLandingDoc('Guía del Proyecto — ${selectedTitle}')">
                Ver detalle <span>→</span>
              </button>
            </div>
          </div>
        </article>

        <article class="inno-resource-card" data-category="video">
          <div class="inno-res-thumb-wrap" style="background-image:url('assets/projects_ui/card_open_data.png'); cursor:pointer;" onclick="window.ProjectsView.playLandingVideo()">
            <div class="inno-res-play-btn">▶</div>
          </div>
          <div class="inno-res-body">
            <div>
              <span class="inno-res-badge video">🎬 Video</span>
              <h4 class="inno-res-title">Introducción al Proyecto</h4>
              <p class="inno-res-desc">Una mirada general a nuestra iniciativa.</p>
            </div>
            <div class="inno-res-footer">
              <span>📅 10 Oct. 2026</span>
              <button type="button" class="inno-res-action-link" onclick="window.ProjectsView.playLandingVideo()">
                Ver video <span>→</span>
              </button>
            </div>
          </div>
        </article>

        <article class="inno-resource-card" data-category="pres">
          <div class="inno-res-thumb-wrap" style="background-image:url('assets/projects_ui/card_data_gov.png'); cursor:pointer;" onclick="window.ProjectsView.previewLandingDoc('Plan de Trabajo — ${selectedTitle}')">
          </div>
          <div class="inno-res-body">
            <div>
              <span class="inno-res-badge pres">📊 Presentación</span>
              <h4 class="inno-res-title">Plan de Trabajo</h4>
              <p class="inno-res-desc">Cronograma y actividades clave.</p>
            </div>
            <div class="inno-res-footer">
              <span>📅 08 Oct. 2026</span>
              <button type="button" class="inno-res-action-link" onclick="window.ProjectsView.previewLandingDoc('Plan de Trabajo — ${selectedTitle}')">
                Ver detalle <span>→</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }

    const cu = window.appState?.currentUser || {};
    const currentUserName = this.escapeHtml(cu.name || 'Carlos Sánchez');
    const currentUserRole = this.escapeHtml(cu.role === 'admin' ? 'Administrador' : (cu.role === 'teacher' ? 'Docente' : 'Colaborador'));
    const currentUserAvatar = cu.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80';
    const participantAvatar = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&q=80';
    const lastUpdateDate = selected?.updatedAt
      ? new Date(selected.updatedAt).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : '12 Oct. 2026';
    const userPartPercent = 72;
    const totalActivities = 24;
    const totalDeliverables = totalCardsCount > 0 ? totalCardsCount : 8;
    const totalParticipants = aut.authorsList ? (aut.authorsList.split(',').length + 3) : 12;

    const teamLeaderName = aut.authorsList ? this.escapeHtml(aut.authorsList.split(',')[0].trim()) : 'María López';
    const teamArchitectName = (aut.authorsList && aut.authorsList.split(',')[1]) ? this.escapeHtml(aut.authorsList.split(',')[1].trim()) : 'Andrés Pérez';
    const teamAnalystName = (aut.authorsList && aut.authorsList.split(',')[2]) ? this.escapeHtml(aut.authorsList.split(',')[2].trim()) : 'Laura Gómez';

    // Cronograma / Timeline
    let timelineStepsHtml = '';
    const hasTimelineArray = Array.isArray(selected?.timeline) && selected.timeline.length > 0;
    if (hasTimelineArray) {
      timelineStepsHtml = selected.timeline.map((st, i) => `
        <div class="inno-road-step ${st.completed ? 'completed' : (i === 1 ? 'active' : '')}">
          <div class="inno-road-badge">${st.completed ? '✓' : (i === 1 ? '▶' : '○')}</div>
          <div class="inno-road-name ${i === 1 ? 'active' : ''}">${this.escapeHtml(st.title || `Fase ${i + 1}`)}</div>
          <div class="inno-road-sub ${i === 1 ? 'active' : ''}">${this.escapeHtml(st.date || '')}</div>
        </div>
      `).join('');
    } else {
      timelineStepsHtml = `
        <div class="inno-road-step completed">
          <div class="inno-road-badge">✓</div>
          <div class="inno-road-name">Descubrimiento</div>
          <div class="inno-road-sub">Analizar y entender</div>
        </div>
        <div class="inno-road-step completed">
          <div class="inno-road-badge">✓</div>
          <div class="inno-road-name">Planeación</div>
          <div class="inno-road-sub">Definir el plan</div>
        </div>
        <div class="inno-road-step active">
          <div class="inno-road-badge">▶</div>
          <div class="inno-road-name active">Diseño</div>
          <div class="inno-road-sub active">Diseñar la solución</div>
        </div>
        <div class="inno-road-step">
          <div class="inno-road-badge">&lt;/&gt;</div>
          <div class="inno-road-name">Desarrollo</div>
          <div class="inno-road-sub">Construir y probar</div>
        </div>
        <div class="inno-road-step">
          <div class="inno-road-badge">🚀</div>
          <div class="inno-road-name">Implementación</div>
          <div class="inno-road-sub">Poner en marcha</div>
        </div>
        <div class="inno-road-step">
          <div class="inno-road-badge">🏁</div>
          <div class="inno-road-name">Resultados</div>
          <div class="inno-road-sub">Medir el impacto</div>
        </div>
      `;
    }

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
                <button type="button" class="plp-mentix-btn" onclick="if (window.AdminView && window.AdminView.isAdminAuditing) { window.AdminView.exitAuditAndReturnToAdmin(); } else { window.ProjectsView.switchViewMode('list'); }">
                  <span>←</span> ${window.AdminView && window.AdminView.isAdminAuditing ? 'Volver al Admin' : 'Volver a Mis Proyectos'}
                </button>
                ${selected ? `
                <button type="button" class="plp-mentix-btn" onclick="window.ProjectsView.editSelectedProject('${selected.id}')">
                  <span>✏️</span> Editar Proyecto
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
               1. HEADER / NAVEGACIÓN (MOCKUP EXACTO)
               ================================================================ -->
          <header class="inno-header" role="banner">
            <div class="inno-brand" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-hero')">
              <div class="inno-logo-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.3">
                  <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                  <polyline points="2 17 12 22 22 17"></polyline>
                  <polyline points="2 12 12 17 22 12"></polyline>
                </svg>
              </div>
              <div>
                <span class="inno-brand-title">MENTIX</span>
                <span class="inno-brand-sep">·</span>
                <span class="inno-brand-section">Proyectos</span>
              </div>
            </div>

            <div class="inno-search-box">
              <span style="position:absolute; left:0.85rem; color:#94a3b8; font-size:0.85rem;">🔍</span>
              <input type="search" class="inno-search-input" placeholder="Buscar en el proyecto..." oninput="window.ProjectsView.filterLandingSearch(this.value)" />
            </div>

            <nav class="inno-nav-links">
              <button type="button" class="inno-nav-item active" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-hero')">
                Inicio
                <span class="inno-nav-indicator"></span>
              </button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-why')">Sobre el proyecto</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">Recursos</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-team')">Equipo</button>
              <button type="button" class="inno-nav-item" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-cta')">Contacto</button>
            </nav>

            <div class="inno-header-right">
              <div class="inno-bell-btn" title="Notificaciones" onclick="alert('🔔 Tienes 3 actualizaciones pendientes en el proyecto')">
                🔔
                <span class="inno-bell-badge">3</span>
              </div>
              <div class="inno-user-avatar-wrap" title="${currentUserName}">
                <img src="${currentUserAvatar}" alt="${currentUserName}" class="inno-user-avatar-img" />
              </div>
            </div>
          </header>

          <!-- ================================================================
               2. HERO SECTION (MOCKUP EXACTO)
               ================================================================ -->
          <section class="inno-hero" id="inno-sec-hero">
            <div class="inno-hero-bg-overlay"></div>
            <div class="inno-hero-bg-glow"></div>

            <div class="inno-hero-grid">
              <!-- Columna Izquierda: Información Principal -->
              <div class="inno-hero-main">
                <h1 class="inno-hero-title">
                  ${selected && selected.title ? `
                    <span style="color:#ffffff;">${this.escapeHtml(selected.title)}</span>
                    <span class="inno-hero-title-cyan" style="display:block; font-size:0.85em; margin-top:0.3rem;">${this.escapeHtml(selected.subtitle || 'Soluciones Tecnológicas')}</span>
                  ` : `
                    Transformamos ideas
                    <br>en <span class="inno-hero-title-cyan">soluciones tecnológicas</span>
                  `}
                </h1>

                <p class="inno-hero-desc">
                  ${heroSubtitle}
                </p>

                <div class="inno-hero-actions">
                  <button type="button" class="inno-btn-explore" onclick="window.ProjectsView.openSelectedProject()">
                    <span>▶</span> Explorar proyecto <span>→</span>
                  </button>
                  <button type="button" class="inno-btn-resources" onclick="window.ProjectsView.scrollToLandingSection('inno-sec-resources')">
                    <span>📑</span> Ver recursos
                  </button>
                </div>
              </div>

              <!-- Columna Derecha: Tarjeta Avance del Proyecto (Gauge Circular) -->
              <div class="inno-hero-status-wrap">
                <article class="inno-gauge-card">
                  <h3 class="inno-gauge-card-title">Avance del proyecto</h3>

                  <div class="inno-gauge-row">
                    <!-- Gauge Circular SVG -->
                    <div class="inno-gauge-circle-wrap">
                      <svg class="inno-gauge-svg" viewBox="0 0 100 100">
                        <defs>
                          <linearGradient id="innoGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stop-color="#00f5d4" />
                            <stop offset="100%" stop-color="#0284c7" />
                          </linearGradient>
                        </defs>
                        <circle class="inno-gauge-bg" cx="50" cy="50" r="42" />
                        <circle class="inno-gauge-fill" cx="50" cy="50" r="42" style="stroke:url(#innoGaugeGrad); stroke-dashoffset: calc(264 - (264 * ${progressPercent}) / 100);" />
                      </svg>
                      <div class="inno-gauge-center-text">
                        <span class="inno-gauge-number">${progressPercent}%</span>
                      </div>
                    </div>

                    <!-- Leyenda Checklist -->
                    <div class="inno-gauge-legend">
                      <div class="inno-legend-item">
                        <span class="inno-legend-dot green">✓</span>
                        <span class="inno-legend-label">Planeación</span>
                      </div>
                      <div class="inno-legend-item">
                        <span class="inno-legend-dot green">✓</span>
                        <span class="inno-legend-label">Diseño</span>
                      </div>
                      <div class="inno-legend-item">
                        <span class="inno-legend-dot blue">●</span>
                        <span class="inno-legend-label">Desarrollo</span>
                      </div>
                      <div class="inno-legend-item">
                        <span class="inno-legend-dot gray">○</span>
                        <span class="inno-legend-label">Implementación</span>
                      </div>
                    </div>
                  </div>

                  <!-- Barra de Progreso Horizontal -->
                  <div class="inno-gauge-bar-track">
                    <div class="inno-gauge-bar-fill" style="width: ${progressPercent}%;"></div>
                  </div>

                  <!-- Footer Actualización -->
                  <div class="inno-gauge-footer">
                    <span>🕒 Última actualización: ${lastUpdateDate}</span>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <!-- ================================================================
               3. BARRA DE MÉTRICAS / KPIS (MOCKUP EXACTO)
               ================================================================ -->
          <section class="inno-kpi-bar">
            <div class="inno-kpi-card">
              <div class="inno-kpi-icon blue">📊</div>
              <div class="inno-kpi-info">
                <div class="inno-kpi-val">${progressPercent}%</div>
                <div class="inno-kpi-lbl">Avance general</div>
              </div>
            </div>

            <div class="inno-kpi-card">
              <div class="inno-kpi-icon cyan">📅</div>
              <div class="inno-kpi-info">
                <div class="inno-kpi-val">${totalActivities}</div>
                <div class="inno-kpi-lbl">Actividades</div>
              </div>
            </div>

            <div class="inno-kpi-card">
              <div class="inno-kpi-icon purple">📦</div>
              <div class="inno-kpi-info">
                <div class="inno-kpi-val">${totalDeliverables}</div>
                <div class="inno-kpi-lbl">Entregables</div>
              </div>
            </div>

            <div class="inno-kpi-card">
              <div class="inno-kpi-icon green">👥</div>
              <div class="inno-kpi-info">
                <div class="inno-kpi-val">${totalParticipants}</div>
                <div class="inno-kpi-lbl">Participantes</div>
              </div>
            </div>
          </section>

          <!-- ================================================================
               4. SECCIÓN 2 COLUMNAS (POR QUÉ ESTE PROYECTO + SIDEBAR PARTICIPACIÓN)
               ================================================================ -->
          <div class="inno-main-two-col">
            <!-- Columna Izquierda (72%) -->
            <div class="inno-col-left">

              <!-- ¿Por qué este proyecto? -->
              <section class="inno-why-block" id="inno-sec-why">
                <div class="inno-section-head">
                  <h2 class="inno-section-title">¿Por qué este proyecto?</h2>
                  <p class="inno-section-sub">Porque juntos podemos lograr un mayor impacto.</p>
                </div>

                <div class="inno-why-cards-grid">
                  <!-- 1. Problema / Oportunidad -->
                  <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Problema / Oportunidad — ${selectedTitle}', 'problem')">
                    <div>
                      <div class="inno-why-icon-box light-blue">⚠️</div>
                      <h4 class="inno-why-card-title">Problema / Oportunidad</h4>
                      <p class="inno-why-card-desc">${cardProblem}</p>
                    </div>
                    <span class="inno-why-card-link">Saber más →</span>
                  </article>

                  <!-- 2. Objetivo -->
                  <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Objetivo — ${selectedTitle}', 'valueProp')">
                    <div>
                      <div class="inno-why-icon-box light-green">🎯</div>
                      <h4 class="inno-why-card-title">Objetivo</h4>
                      <p class="inno-why-card-desc">${cardValueProp}</p>
                    </div>
                    <span class="inno-why-card-link">Saber más →</span>
                  </article>

                  <!-- 3. Metodología -->
                  <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Metodología — ${selectedTitle}', 'methodology')">
                    <div>
                      <div class="inno-why-icon-box light-purple">⚙️</div>
                      <h4 class="inno-why-card-title">Metodología</h4>
                      <p class="inno-why-card-desc">${cardMethodology}</p>
                    </div>
                    <span class="inno-why-card-link">Saber más →</span>
                  </article>

                  <!-- 4. Impacto esperado -->
                  <article class="inno-why-card" onclick="window.ProjectsView.previewLandingDoc('Impacto Esperado — ${selectedTitle}', 'impact')">
                    <div>
                      <div class="inno-why-icon-box light-orange">🚀</div>
                      <h4 class="inno-why-card-title">Impacto esperado</h4>
                      <p class="inno-why-card-desc">${cardImpact}</p>
                    </div>
                    <span class="inno-why-card-link">Saber más →</span>
                  </article>
                </div>
              </section>

              <!-- Ruta del Proyecto -->
              <section class="inno-roadmap-block" id="inno-sec-roadmap">
                <div class="inno-section-head">
                  <h2 class="inno-section-title">Ruta del Proyecto</h2>
                  <p class="inno-section-sub">Seguimos un camino claro para alcanzar nuestros objetivos.</p>
                </div>

                <div class="inno-roadmap-track-wrap">
                  <div class="inno-roadmap-track-line"></div>
                  <div class="inno-roadmap-track-fill" style="width: 48%;"></div>

                  <div class="inno-roadmap-steps">
                    ${timelineStepsHtml}
                  </div>
                </div>
              </section>

            </div>

            <!-- Columna Derecha: Sidebar "Tu participación" (28%) -->
            <aside class="inno-col-right">
              <div class="inno-sidebar-card">
                <div class="inno-sidebar-head">
                  <span class="inno-sidebar-icon">👥</span>
                  <h3 class="inno-sidebar-title">Tu participación</h3>
                </div>

                <div class="inno-user-profile-center">
                  <div class="inno-avatar-online-wrap">
                    <img src="${participantAvatar}" alt="${currentUserName}" class="inno-user-big-avatar" />
                    <span class="inno-online-dot"></span>
                  </div>
                  <div class="inno-user-name">${currentUserName}</div>
                  <div class="inno-user-role">${currentUserRole}</div>
                </div>

                <div class="inno-user-part-metric">
                  <div class="inno-user-metric-label">
                    <strong>${userPartPercent}%</strong> de participación
                  </div>
                  <div class="inno-user-part-bar">
                    <div class="inno-user-part-fill" style="width: ${userPartPercent}%;"></div>
                  </div>
                </div>

                <div class="inno-sidebar-actions">
                  <button type="button" class="inno-btn-join" onclick="window.ProjectsView.previewLandingDoc('Unirse al Proyecto — ${selectedTitle}')">
                    <span>👥</span> Unirse al proyecto
                  </button>
                  <button type="button" class="inno-btn-comment" onclick="window.ProjectsView.previewLandingDoc('Dejar un comentario — ${selectedTitle}')">
                    <span>💬</span> Dejar un comentario
                  </button>
                </div>
              </div>
            </aside>
          </div>

          <!-- ================================================================
               5. SECCIÓN RECURSOS DEL PROYECTO (MOCKUP EXACTO)
               ================================================================ -->
          <section class="inno-resources-section" id="inno-sec-resources">
            <div class="inno-section-head">
              <h2 class="inno-section-title">Recursos del proyecto</h2>
              <p class="inno-section-sub">Encuentra aquí todo el material de interés.</p>
            </div>

            <!-- Filtros de categoría -->
            <div class="inno-filter-pills">
              <button type="button" class="inno-pill-tab active" onclick="window.ProjectsView.filterResourceCategory('all', this)">Todos</button>
              <button type="button" class="inno-pill-tab" onclick="window.ProjectsView.filterResourceCategory('doc', this)">Documentos</button>
              <button type="button" class="inno-pill-tab" onclick="window.ProjectsView.filterResourceCategory('video', this)">Videos</button>
              <button type="button" class="inno-pill-tab" onclick="window.ProjectsView.filterResourceCategory('pres', this)">Presentaciones</button>
              <button type="button" class="inno-pill-tab" onclick="window.ProjectsView.filterResourceCategory('link', this)">Enlaces</button>
            </div>

            <!-- Grid de Recursos (3 Columnas) -->
            <div class="inno-resources-grid" id="inno-resource-cards-container">
              ${cardsHtml}
            </div>
          </section>

          <!-- ================================================================
               6. SECCIÓN EQUIPO Y PARTICIPANTES (MOCKUP EXACTO)
               ================================================================ -->
          <section class="inno-team-section" id="inno-sec-team">
            <div class="inno-team-header-row">
              <div class="inno-section-head" style="margin-bottom: 0;">
                <h2 class="inno-section-title">Equipo y participantes</h2>
                <p class="inno-section-sub">Un equipo comprometido con el éxito del proyecto.</p>
              </div>

              <button type="button" class="inno-btn-view-all-team" onclick="window.ProjectsView.previewLandingDoc('Equipo Completo del Proyecto — ${selectedTitle}')">
                Ver todo el equipo <span>→</span>
              </button>
            </div>

            <div class="inno-team-grid">
              <div class="inno-team-card">
                <div class="inno-team-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&q=80" alt="María López" class="inno-team-avatar" />
                  <span class="inno-team-status-dot green"></span>
                </div>
                <div class="inno-team-info">
                  <div class="inno-team-name">${teamLeaderName}</div>
                  <div class="inno-team-role">Líder del proyecto</div>
                  <span class="inno-team-badge green">🟢 En línea</span>
                </div>
              </div>

              <div class="inno-team-card">
                <div class="inno-team-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&q=80" alt="Andrés Pérez" class="inno-team-avatar" />
                  <span class="inno-team-status-dot blue"></span>
                </div>
                <div class="inno-team-info">
                  <div class="inno-team-name">${teamArchitectName}</div>
                  <div class="inno-team-role">Arquitecto de Soluciones</div>
                  <span class="inno-team-badge blue">🔵 Activo</span>
                </div>
              </div>

              <div class="inno-team-card">
                <div class="inno-team-avatar-wrap">
                  <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&q=80" alt="Laura Gómez" class="inno-team-avatar" />
                  <span class="inno-team-status-dot blue"></span>
                </div>
                <div class="inno-team-info">
                  <div class="inno-team-name">${teamAnalystName}</div>
                  <div class="inno-team-role">Analista de Datos</div>
                  <span class="inno-team-badge blue">🔵 Activo</span>
                </div>
              </div>
            </div>
          </section>

          <!-- ================================================================
               7. BANNER INFERIOR DE ACCIÓN (MOCKUP EXACTO)
               ================================================================ -->
          <section class="inno-bottom-banner" id="inno-sec-cta">
            <div class="inno-cta-left">
              <div class="inno-cta-rocket-badge">
                <span style="font-size: 1.6rem;">🚀</span>
              </div>
              <div class="inno-cta-divider"></div>
              <div class="inno-cta-text">
                <h3 class="inno-cta-title">Construyamos el siguiente avance del proyecto</h3>
                <p class="inno-cta-sub">Tu aporte hace la diferencia</p>
              </div>
            </div>

            <div class="inno-cta-right">
              <button type="button" class="inno-cta-btn" onclick="window.ProjectsView.previewLandingDoc('Participar en el Proyecto — ${selectedTitle}')">
                Participar ahora <span>→</span>
              </button>
            </div>
          </section>

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

  // ==========================================
  // PARTICIPANTES Y ROLES (MOCKUP EXACTO)
  // ==========================================
  getParticipantsSectionHtml(proj = null, isModal = false) {
    const title = proj ? this.escapeHtml(proj.title || 'Empresa Privada') : 'Empresa Privada';
    return `
      <section class="inno-participants-section" id="inno-sec-participants" style="margin: 2.2rem 0; border-radius: 20px; overflow: hidden; background: #060e1d; padding: 2.25rem 2rem; border: 1.5px solid rgba(0, 245, 212, 0.25); box-shadow: 0 15px 40px rgba(0, 0, 0, 0.45); ${isModal ? 'margin: 0; border: none; box-shadow: none; padding: 0.5rem 0;' : ''}">
        <div class="inno-participants-inner" style="max-width: 1240px; margin: 0 auto;">
          
          <!-- Encabezado Superior -->
          <div class="inno-roles-category-heading" style="font-size: 0.88rem; font-weight: 800; letter-spacing: 1.5px; color: #00f5d4; text-transform: uppercase; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.6rem;">
            <span class="inno-roles-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00f5d4; box-shadow: 0 0 10px #00f5d4;"></span>
            ALGUNOS DE LOS ROLES CON LOS QUE TE REÚNES EN LA EMPRESA PRIVADA
          </div>

          <!-- Fila Principal: Tarjeta de Escenario + Tarjetas de Roles -->
          <div class="inno-roles-row-grid" style="display: flex; flex-wrap: wrap; gap: 1.25rem; align-items: stretch; justify-content: space-between;">
            
            <!-- Tarjeta Izquierda del Escenario -->
            <div class="inno-scenario-card-wrap" style="flex: 2 1 340px; min-width: 290px; border-radius: 16px; overflow: hidden; border: 1.5px solid rgba(0, 245, 212, 0.45); box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 245, 212, 0.15); transition: transform 0.25s ease, border-color 0.25s ease; background: #081528;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='#00f5d4';" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='rgba(0, 245, 212, 0.45)';">
              <img src="assets/projects_ui/scenario_card.png" alt="Entrenamiento Directivo en Empresa Privada" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            </div>

            <!-- Fila de las 3 Tarjetas de Roles -->
            <div class="inno-characters-flex-wrap" style="flex: 3 1 500px; display: flex; gap: 1rem; flex-wrap: wrap;">
              
              <!-- 1. Severo Recorte -->
              <div class="inno-char-card-wrap" style="flex: 1 1 150px; min-width: 140px; border-radius: 14px; overflow: hidden; border: 1.5px solid rgba(0, 245, 212, 0.35); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); background: #07152b; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 12px 28px rgba(0, 245, 212, 0.3)';" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='rgba(0, 245, 212, 0.35)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.4)';">
                <img src="assets/projects_ui/card_severo.png" alt="Severo Recorte - Director General" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              </div>

              <!-- 2. Clara Fuente -->
              <div class="inno-char-card-wrap" style="flex: 1 1 150px; min-width: 140px; border-radius: 14px; overflow: hidden; border: 1.5px solid rgba(0, 245, 212, 0.35); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); background: #07152b; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 12px 28px rgba(0, 245, 212, 0.3)';" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='rgba(0, 245, 212, 0.35)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.4)';">
                <img src="assets/projects_ui/card_clara.png" alt="Clara Fuente - Directora de Datos" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              </div>

              <!-- 3. Justo Sinrodeos -->
              <div class="inno-char-card-wrap" style="flex: 1 1 150px; min-width: 140px; border-radius: 14px; overflow: hidden; border: 1.5px solid rgba(0, 245, 212, 0.35); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4); background: #07152b; transition: transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease;" onmouseenter="this.style.transform='translateY(-4px)'; this.style.borderColor='#00f5d4'; this.style.boxShadow='0 12px 28px rgba(0, 245, 212, 0.3)';" onmouseleave="this.style.transform='translateY(0)'; this.style.borderColor='rgba(0, 245, 212, 0.35)'; this.style.boxShadow='0 8px 24px rgba(0, 0, 0, 0.4)';">
                <img src="assets/projects_ui/card_justo.png" alt="Justo Sinrodeos - Consejero Independiente" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
              </div>

            </div>
          </div>

          <!-- Encabezado Inferior -->
          <div class="inno-roles-category-heading" style="font-size: 0.88rem; font-weight: 800; letter-spacing: 1.5px; color: #00f5d4; text-transform: uppercase; margin-top: 2.25rem; display: flex; align-items: center; gap: 0.6rem; opacity: 0.9;">
            <span class="inno-roles-dot" style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #00f5d4; box-shadow: 0 0 10px #00f5d4;"></span>
            ALGUNOS DE LOS ROLES CON LOS QUE TE REÚNES EN LA ADMINISTRACIÓN PÚBLICA
          </div>

        </div>
      </section>
    `;
  },

  openParticipantsModal(projectId) {
    if (window.soundEngine) window.soundEngine.playClick();
    const proj = (window.appState.challenges || []).find(x => x.id === projectId) || 
                 this.demoShowcaseProjects.find(x => x.id === projectId);
    
    const existing = document.getElementById('mentix-participants-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'mentix-participants-modal';
    modal.className = 'animate-fade-in';
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 100000;
      background: rgba(3, 7, 18, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-y: auto;
    `;

    modal.innerHTML = `
      <div style="position: relative; width: 100%; max-width: 1100px; background: #070e1c; border: 1.5px solid rgba(0, 245, 212, 0.4); border-radius: 20px; box-shadow: 0 25px 60px rgba(0,0,0,0.7), 0 0 30px rgba(0, 245, 212, 0.2); overflow: hidden; margin: auto;">
        <!-- Modal Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.75rem; border-bottom: 1px solid rgba(0, 245, 212, 0.15); background: rgba(15, 23, 42, 0.6);">
          <div style="display: flex; align-items: center; gap: 0.65rem;">
            <span style="font-size: 1.35rem;">👥</span>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem; font-weight: 800; color: #ffffff;">Personas que participaron en el proyecto</h3>
              <p style="margin: 0; font-size: 0.8rem; color: #94a3b8;">${proj ? this.escapeHtml(proj.title) : 'Roles y Participantes'}</p>
            </div>
          </div>
          <button type="button" onclick="document.getElementById('mentix-participants-modal').remove()" style="background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.2); color: #ffffff; width: 34px; height: 34px; border-radius: 50%; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background 0.2s;" onmouseenter="this.style.background='rgba(239, 68, 68, 0.3)'" onmouseleave="this.style.background='rgba(255,255,255,0.08)'">
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div style="padding: 1.5rem 1.75rem;">
          ${this.getParticipantsSectionHtml(proj, true)}
        </div>
      </div>
    `;

    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    document.body.appendChild(modal);
  },

  playLandingVideo() {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;
    let selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (!selected) {
      try {
        const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
        selected = drafts.find(d => d && d.id === this.selectedProjectId);
      } catch (e) {}
    }
    if (!selected && window.ProjectWizard?.draft) selected = window.ProjectWizard.draft;

    const gp = selected?.govdata || {};
    const vc = (selected && (selected.videoConfig || selected.video)) ? (selected.videoConfig || selected.video) : (gp.videoConfig || gp.video || {});
    const rawUrl = (typeof vc === 'string' ? vc : (vc.url || vc.embedUrl || selected?.videoUrl || '')).trim();
    const projTitle = this.escapeHtml(vc.title || selected?.title || 'Proyecto');

    if (!rawUrl) {
      body.innerHTML = `
        <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
        <div style="background:#091e2d; padding:2.5rem 1.75rem; border-radius:16px; text-align:center;">
          <div style="font-size:3rem; margin-bottom:0.75rem;">🎬</div>
          <h3 style="color:#ffffff; margin:0 0 0.5rem; font-size:1.3rem;">Sin Video Disponible</h3>
          <p style="color:#94a3b8; font-size:0.95rem; margin:0 0 1.5rem; line-height:1.6;">Este proyecto aún no tiene un video configurado por su creador.</p>
          <button class="inno-btn-cyan" onclick="window.ProjectsView.closeLandingLightbox()">Entendido</button>
        </div>
      `;
      modal.classList.add('active');
      return;
    }

    let videoHtml = '';
    const ytMatch = rawUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
    const vimeoMatch = rawUrl.match(/vimeo\.com\/(?:video\/)?(\d+)/);

    if (ytMatch) {
      videoHtml = `<iframe width="100%" height="500px" src="https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:0; width:100%; height:500px; display:block; border-radius:12px;"></iframe>`;
    } else if (vimeoMatch) {
      videoHtml = `<iframe width="100%" height="500px" src="https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen style="border:0; width:100%; height:500px; display:block; border-radius:12px;"></iframe>`;
    } else if (rawUrl.startsWith('data:video/') || rawUrl.match(/\.(mp4|webm|ogg)($|\?)/i)) {
      videoHtml = `<video controls autoplay style="width:100%; max-height:500px; border-radius:12px; background:#000;"><source src="${rawUrl}" type="video/mp4">Tu navegador no soporta reproducción de video.</video>`;
    } else {
      videoHtml = `<iframe width="100%" height="500px" src="${rawUrl}" frameborder="0" allowfullscreen style="border:0; width:100%; height:500px; display:block; border-radius:12px;"></iframe>`;
    }

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="background:#091e2d; padding:1.5rem; border-radius:16px;">
        <h3 style="color:#ffffff; margin:0 0 1rem; font-size:1.2rem;">🎬 ${projTitle}</h3>
        ${videoHtml}
      </div>
    `;
    modal.classList.add('active');
  },

  openOrDownloadResource(url, filename) {
    if (!url) return;
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'recurso';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(url, '_blank');
    }
  },

  filterResourceCategory(cat, btn) {
    document.querySelectorAll('#view-projects .inno-filter-pill').forEach(b => b.classList.remove('active'));
    if (btn) btn.classList.add('active');

    document.querySelectorAll('#view-projects #inno-resource-cards-container article').forEach(el => {
      if (cat === 'all') {
        el.style.display = 'flex';
      } else {
        el.style.display = el.getAttribute('data-category') === cat ? 'flex' : 'none';
      }
    });
  },

  downloadLandingDoc(filename) {
    let selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (!selected) {
      try {
        const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
        selected = drafts.find(d => d && d.id === this.selectedProjectId);
      } catch (e) {}
    }
    if (!selected && window.ProjectWizard?.draft) selected = window.ProjectWizard.draft;

    const gp = selected?.govdata || {};
    const vp = selected?.valueProp || selected?.valueProposition || gp.valueProp || {};

    const title = (selected && (selected.landingConfig?.publicName || selected.title)) || 'PROYECTO';
    const subtitle = selected?.subtitle || '';
    const desc = selected?.fullDescription || selected?.shortDescription || selected?.description || '';
    const prob = selected?.problemStatement || gp.problemStatement || vp.problemSolved || '';
    const obj = selected?.mainObjective || gp.mainObjective || '';
    const ben = selected?.benefits || gp.benefits || vp.resultsAndBenefits || '';
    const author = selected?.author || '';

    const content = `=======================================================
${title.toUpperCase()}
${subtitle ? subtitle + '\n' : ''}=======================================================
Fecha: ${new Date().toLocaleDateString()}
Documento: ${filename}
Autor / Líder: ${author || 'Equipo del Proyecto'}

1. DESCRIPCIÓN:
${desc || 'Información del proyecto.'}

${prob ? `2. PROBLEMA O RETO:\n${prob}\n\n` : ''}${obj ? `3. OBJETIVO PRINCIPAL:\n${obj}\n\n` : ''}${ben ? `4. BENEFICIOS E IMPACTO ESPERADO:\n${ben}\n\n` : ''}=======================================================
Generado por Mentix - Plataforma de Proyectos y Retos
`;
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

  previewLandingDoc(title, cardType = '') {
    const modal = document.getElementById('plp-inline-lightbox');
    const body = document.getElementById('plp-inline-lightbox-body');
    if (!modal || !body) return;

    let selected = (window.appState.challenges || []).find(x => x.id === this.selectedProjectId);
    if (!selected) {
      try {
        const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
        selected = drafts.find(d => d && d.id === this.selectedProjectId);
      } catch (e) {}
    }
    if (!selected && window.ProjectWizard?.draft) {
      selected = window.ProjectWizard.draft;
    }

    const projTitle = this.escapeHtml((selected && (selected.landingConfig?.publicName || selected.title)) || 'Proyecto');
    const isDark = (document.querySelector('.plp-wrapper')?.getAttribute('data-theme') || this.getLandingTheme()) === 'dark';
    const bg = isDark ? '#091e2d' : '#ffffff';
    const titleColor = isDark ? '#ffffff' : '#091e2d';
    const textColor = isDark ? '#cbd5e1' : '#334155';
    const border = isDark ? '1px solid #1e3a54' : 'none';

    const gp = selected?.govdata || {};
    const vp = selected?.valueProp || selected?.valueProposition || gp.valueProp || {};
    const cleanTitle = (title || '').toLowerCase();

    let detailHtml = '';
    let docBadge = 'Documento Oficial';

    if (cardType === 'problem' || cleanTitle.includes('problema') || cleanTitle.includes('oportunidad')) {
      docBadge = 'Problema / Oportunidad';
      const prob = selected?.problemStatement || gp.problemStatement || vp.problemSolved || selected?.shortDescription || 'Sin problema documentado aún.';
      detailHtml = `
        <div style="background:rgba(2,132,199,0.08); border-left:4px solid #0284c7; padding:1.25rem; border-radius:12px; margin-bottom:1.25rem;">
          <h4 style="margin:0 0 0.5rem; color:#0284c7; font-size:0.95rem; font-weight:800;">Problema o reto que aborda el proyecto:</h4>
          <p style="margin:0; color:${textColor}; line-height:1.75; font-size:1.02rem; white-space:pre-wrap;">${this.escapeHtml(prob)}</p>
        </div>
        ${selected?.targetAudience ? `
          <div style="font-size:0.9rem; color:${textColor};">
            <strong>Público o Comunidad afectada:</strong> ${this.escapeHtml(selected.targetAudience)}
          </div>
        ` : ''}
      `;
    } else if (cardType === 'valueProp' || cleanTitle.includes('propuesta') || cleanTitle.includes('valor')) {
      docBadge = 'Propuesta de Valor';
      const how = vp.howItWorks || selected?.mainObjective || gp.mainObjective || 'En desarrollo.';
      const diff = vp.differentiator || '';
      detailHtml = `
        <div style="background:rgba(22,163,74,0.08); border-left:4px solid #16a34a; padding:1.25rem; border-radius:12px; margin-bottom:1.25rem;">
          <h4 style="margin:0 0 0.5rem; color:#16a34a; font-size:0.95rem; font-weight:800;">Cómo funciona la solución propuesta:</h4>
          <p style="margin:0; color:${textColor}; line-height:1.75; font-size:1.02rem; white-space:pre-wrap;">${this.escapeHtml(how)}</p>
        </div>
        ${diff ? `
          <div style="padding:1rem; background:rgba(22,163,74,0.08); border-radius:10px; font-size:0.92rem; color:${textColor}; margin-bottom:0.75rem;">
            <strong style="color:#16a34a;">Factor Diferenciador:</strong> ${this.escapeHtml(diff)}
          </div>
        ` : ''}
      `;
    } else if (cardType === 'methodology' || cleanTitle.includes('metodolog') || cleanTitle.includes('enfoque')) {
      docBadge = 'Metodología & Ejecución';
      const full = selected?.fullDescription || gp.fullDescription || (Array.isArray(vp.keyFeatures) && vp.keyFeatures.length ? vp.keyFeatures.map(f => '• ' + f).join('\n') : '') || selected?.projectSubtype || 'Metodología en desarrollo.';
      detailHtml = `
        <div style="background:rgba(124,58,237,0.08); border-left:4px solid #7c3aed; padding:1.25rem; border-radius:12px; margin-bottom:1.25rem;">
          <h4 style="margin:0 0 0.5rem; color:#7c3aed; font-size:0.95rem; font-weight:800;">Metodología y Alcance Técnico:</h4>
          <p style="margin:0; color:${textColor}; line-height:1.75; font-size:1.02rem; white-space:pre-wrap;">${this.escapeHtml(full)}</p>
        </div>
        ${selected?.preparationStatus ? `
          <div style="font-size:0.9rem; color:${textColor};">
            <strong>Estado de desarrollo:</strong> ${this.escapeHtml(selected.preparationStatus.replace(/_/g, ' '))}
          </div>
        ` : ''}
      `;
    } else if (cardType === 'impact' || cleanTitle.includes('impacto') || cleanTitle.includes('beneficio')) {
      docBadge = 'Impacto & Resultados';
      const ben = selected?.benefits || gp.benefits || vp.resultsAndBenefits || 'Impacto social y beneficios en desarrollo.';
      detailHtml = `
        <div style="background:rgba(5,150,105,0.08); border-left:4px solid #059669; padding:1.25rem; border-radius:12px; margin-bottom:1.25rem;">
          <h4 style="margin:0 0 0.5rem; color:#059669; font-size:0.95rem; font-weight:800;">Beneficios e impacto generado:</h4>
          <p style="margin:0; color:${textColor}; line-height:1.75; font-size:1.02rem; white-space:pre-wrap;">${this.escapeHtml(ben)}</p>
        </div>
      `;
    } else {
      docBadge = 'Visión General';
      const desc = selected?.fullDescription || selected?.shortDescription || selected?.description || gp.shortDescription || 'Información oficial del proyecto.';
      detailHtml = `
        <div style="padding:1.25rem; background:rgba(15,23,42,0.04); border-radius:12px; margin-bottom:1.25rem;">
          <p style="margin:0; color:${textColor}; line-height:1.75; font-size:1.02rem; white-space:pre-wrap;">${this.escapeHtml(desc)}</p>
        </div>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:0.75rem; font-size:0.88rem; color:${textColor};">
          ${selected?.targetAudience ? `<div><strong>Público:</strong> ${this.escapeHtml(selected.targetAudience)}</div>` : ''}
          ${selected?.categoryName ? `<div><strong>Categoría:</strong> ${this.escapeHtml(selected.categoryName)}</div>` : ''}
          ${selected?.author ? `<div><strong>Responsable:</strong> ${this.escapeHtml(selected.author)}</div>` : ''}
        </div>
      `;
    }

    body.innerHTML = `
      <button class="plp-lightbox-close" onclick="window.ProjectsView.closeLandingLightbox()" aria-label="Cerrar">✕</button>
      <div style="padding:2.5rem; background:${bg}; border:${border}; border-radius:20px; max-width:680px; margin:0 auto;">
        <span class="inno-eyebrow" style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.05em; font-weight:800; color:#10b981; margin-bottom:0.5rem; display:inline-block;">${docBadge}</span>
        <h2 style="margin:0.25rem 0 1.25rem; color:${titleColor}; font-size:1.4rem; font-weight:800;">${this.escapeHtml(title)}</h2>
        ${detailHtml}
        <div style="margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap;">
          <button class="inno-btn-cyan" onclick="window.ProjectsView.downloadLandingDoc('${this.escapeHtml(title.replace(/\s+/g, '_').slice(0, 40))}.txt'); window.ProjectsView.closeLandingLightbox();">
            ⬇ Descargar Resumen
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
    document.querySelectorAll('#view-projects #inno-resource-cards-container article').forEach((el) => {
      const text = (el.getAttribute('data-plp-search') + ' ' + el.innerText).toLowerCase();
      el.style.display = !q || text.includes(q) ? 'flex' : 'none';
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

    const isLight = document.body.classList.contains('projects-pure-white-theme') || 
                    document.body.classList.contains('light-theme') || 
                    (this.getLandingTheme && this.getLandingTheme() === 'light');

    const savedCodes = this.getSavedProjectCodes();
    const recentCode = this.lastCreatedCode || (savedCodes[0] ? savedCodes[0].code : '');

    // Variables de estilo adaptativas 100% legibles para modo claro y modo oscuro
    const cardBg = isLight ? '#ffffff' : 'linear-gradient(145deg, rgba(15, 23, 42, 0.96), rgba(19, 27, 46, 0.96))';
    const cardBorder = isLight ? '1.5px solid rgba(0, 0, 0, 0.12)' : '2px solid var(--neon-cyan)';
    const cardShadow = isLight ? '0 10px 40px rgba(0, 0, 0, 0.08)' : '0 15px 45px rgba(0, 245, 212, 0.2)';
    const titleColor = isLight ? '#0f172a' : '#ffffff';
    const textColor = isLight ? '#334155' : '#cbd5e1';
    const inputBg = isLight ? '#f8fafc' : 'rgba(8, 13, 26, 0.9)';
    const inputColor = isLight ? '#0f172a' : '#ffffff';
    const inputBorder = isLight ? '2px solid #0e7490' : '2px solid rgba(0, 245, 212, 0.6)';
    const itemBg = isLight ? '#f8fafc' : 'rgba(255, 255, 255, 0.05)';
    const itemBorder = isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)';
    const itemText = isLight ? '#0f172a' : '#ffffff';
    const itemSub = isLight ? '#64748b' : 'rgba(255, 255, 255, 0.6)';
    const cancelBtnBg = isLight ? '#f1f5f9' : 'transparent';
    const cancelBtnColor = isLight ? '#334155' : '#ffffff';
    const cancelBtnBorder = isLight ? '1.5px solid #cbd5e1' : '1.5px solid rgba(255, 255, 255, 0.2)';

    container.innerHTML = `
      <div class="project-code-fullpage animate-fade-in" style="width: 100%; max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 5rem; min-height: 85vh;">
        
        <!-- Barra Superior con Botón Volver -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;">
          <button 
            class="btn btn-outline" 
            onclick="ProjectsView.closeCreateProjectModal()"
            style="display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.65rem 1.25rem; font-weight: 800; border-radius: 12px; background: ${cancelBtnBg}; color: ${cancelBtnColor}; border: ${cancelBtnBorder}; cursor: pointer; font-size: 0.95rem;"
          >
            ← Volver a Proyectos
          </button>
          
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: ${isLight ? 'rgba(14, 116, 144, 0.1)' : 'rgba(0, 245, 212, 0.15)'}; color: ${isLight ? '#0e7490' : 'var(--neon-cyan)'}; font-weight: 900; font-size: 0.82rem; text-transform: uppercase; padding: 0.4rem 1rem; border-radius: 9999px; letter-spacing: 0.6px; border: 1px solid ${isLight ? 'rgba(14, 116, 144, 0.3)' : 'rgba(0,245,212,0.4)'};">
            <span>🛡️</span> Panel Docente Exclusivo
          </div>
        </div>

        <!-- Layout en Toda la Página (Grid de 2 Columnas) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 2rem; align-items: start;">
          
          <!-- Columna Principal: Creación y Código Activo -->
          <div class="glass-panel" style="padding: 2.5rem 2.25rem; border-radius: 22px; border: ${cardBorder}; background: ${cardBg}; box-shadow: ${cardShadow}; text-align: left;">
            
            <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: ${isLight ? 'rgba(14, 116, 144, 0.12)' : 'rgba(0, 245, 212, 0.15)'}; color: ${isLight ? '#0e7490' : 'var(--neon-cyan)'}; font-weight: 900; font-size: 0.8rem; text-transform: uppercase; padding: 0.35rem 0.9rem; border-radius: 9999px; letter-spacing: 0.6px; margin-bottom: 1.25rem; border: 1px solid ${isLight ? 'rgba(14, 116, 144, 0.3)' : 'rgba(0,245,212,0.4)'};">
              <span>👨‍🏫</span> Generador de Código de Acceso
            </div>

            <h1 style="font-size: clamp(1.8rem, 3.2vw, 2.4rem); font-weight: 900; color: ${titleColor} !important; margin: 0 0 0.6rem; line-height: 1.2;">
              🔑 Crear Código de Proyecto
            </h1>

            <p style="color: ${textColor} !important; font-size: 1rem; margin: 0 0 2rem; line-height: 1.55;">
              Escribe tú mismo el código personalizado que elijas para tu proyecto didáctico y compártelo con tus estudiantes para que se unan a la sesión.
            </p>

            <form onsubmit="event.preventDefault(); window.ProjectsView.saveCustomProjectCode();">
              <label for="custom-project-code-input" style="display: block; text-align: left; font-size: 0.88rem; font-weight: 900; color: ${isLight ? '#0e7490' : 'var(--neon-cyan)'} !important; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 0.75rem;">
                ✏️ Escribe el código que tú elijas:
              </label>

              <input
                type="text"
                id="custom-project-code-input"
                placeholder="Ej: PROYECTO1, 2026, CLASE10..."
                autocomplete="off"
                maxlength="24"
                style="width: 100%; box-sizing: border-box; padding: 1.15rem 1.25rem; font-size: 1.6rem; font-weight: 900; text-align: center; letter-spacing: 2px; color: ${inputColor} !important; background: ${inputBg} !important; border: ${inputBorder} !important; border-radius: 14px; outline: none; box-shadow: ${isLight ? '0 4px 15px rgba(0,0,0,0.04)' : 'inset 0 2px 10px rgba(0,0,0,0.6)'}; margin-bottom: 1.25rem;"
              />

              <div id="custom-code-error" style="display: none; color: #ff4d6d; background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.9rem; font-weight: 700; margin-bottom: 1.25rem;"></div>

              <div style="display: flex; gap: 0.85rem; align-items: center; flex-wrap: wrap;">
                <button type="submit" class="btn btn-cyan btn-lg" style="flex: 1; min-width: 200px; padding: 0.95rem 2rem; font-weight: 900; font-size: 1.05rem; border-radius: 12px; box-shadow: 0 6px 24px rgba(0,245,212,0.4); display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
                  <span>✅</span> Guardar Mi Código
                </button>
                <button type="button" class="btn btn-outline" onclick="window.ProjectsView.closeCreateProjectModal()" style="padding: 0.95rem 1.5rem; font-weight: 800; border-radius: 12px; background: ${cancelBtnBg}; color: ${cancelBtnColor}; border: ${cancelBtnBorder};">
                  Cancelar
                </button>
              </div>
            </form>

            ${recentCode ? `
              <div style="margin-top: 2.25rem; padding-top: 1.75rem; border-top: 1px solid ${isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.1)'};">
                <div style="font-size: 0.85rem; font-weight: 800; color: ${textColor} !important; text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 0.75rem;">
                  📢 Código activo elegido para tus estudiantes:
                </div>
                <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; background: ${isLight ? 'rgba(14, 116, 144, 0.08)' : 'rgba(0, 245, 212, 0.12)'}; border: 2px solid ${isLight ? '#0e7490' : 'var(--neon-cyan)'}; padding: 1rem 1.4rem; border-radius: 14px; flex-wrap: wrap;">
                  <div>
                    <span style="font-size: 2rem; font-weight: 900; color: ${isLight ? '#0e7490' : 'var(--neon-cyan)'} !important; letter-spacing: 3px; line-height: 1;">
                      ${this.escapeHtml(recentCode)}
                    </span>
                    <div style="font-size: 0.78rem; color: ${textColor}; margin-top: 0.25rem;">
                      Comparte este código para que tus estudiantes se unan al proyecto.
                    </div>
                  </div>
                  <button type="button" class="btn btn-cyan" onclick="window.ProjectsView.copyCustomProjectCode('${this.escapeHtml(recentCode)}')" style="font-weight: 800; padding: 0.65rem 1.25rem; border-radius: 10px; font-size: 0.9rem;">
                    📋 Copiar para enviar
                  </button>
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Columna Secundaria: Lista de Códigos y Guía Rápida -->
          <div style="display: flex; flex-direction: column; gap: 1.5rem;">
            
            <!-- Tarjeta de Códigos Guardados -->
            <div class="glass-panel" style="padding: 2rem; border-radius: 22px; border: ${cardBorder}; background: ${cardBg}; box-shadow: ${cardShadow};">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; gap: 0.5rem; flex-wrap: wrap;">
                <div>
                  <h3 style="font-size: 1.15rem; font-weight: 900; color: ${titleColor} !important; margin: 0 0 0.2rem;">
                    🗂️ Mis Códigos Creados
                  </h3>
                  <div style="font-size: 0.8rem; color: ${textColor} !important;">
                    ${savedCodes.length} código(s) disponible(s)
                  </div>
                </div>
                ${savedCodes.length > 0 ? `
                  <span class="badge-tag" style="background: rgba(0, 245, 212, 0.2); color: ${isLight ? '#0e7490' : 'var(--neon-cyan)'}; font-weight: 800; padding: 0.35rem 0.75rem; border-radius: 8px;">
                    Activos
                  </span>
                ` : ''}
              </div>

              ${savedCodes.length === 0 ? `
                <div style="text-align: center; padding: 2.5rem 1rem; color: ${textColor};">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏷️</div>
                  <div style="font-weight: 800; margin-bottom: 0.25rem; color: ${titleColor};">Aún no has creado ningún código</div>
                  <div style="font-size: 0.85rem;">Escribe uno en el formulario de la izquierda para comenzar.</div>
                </div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 380px; overflow-y: auto; padding-right: 0.25rem;">
                  ${savedCodes.map(item => `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: ${itemBg}; border: ${itemBorder}; padding: 0.75rem 1rem; border-radius: 12px; gap: 0.75rem; transition: transform 0.15s, border-color 0.15s;">
                      <div>
                        <div style="font-weight: 900; color: ${itemText} !important; font-size: 1.1rem; letter-spacing: 1.5px;">
                          ${this.escapeHtml(item.code)}
                        </div>
                        <div style="font-size: 0.76rem; color: ${itemSub} !important; margin-top: 0.15rem;">
                          Creado por: ${this.escapeHtml(item.author || 'Profesor')}
                        </div>
                      </div>
                      <div style="display: flex; gap: 0.45rem; align-items: center;">
                        <button type="button" class="btn btn-outline btn-sm" onclick="window.ProjectsView.copyCustomProjectCode('${this.escapeHtml(item.code)}')" style="padding: 0.4rem 0.75rem; font-size: 0.8rem; font-weight: 800; background: ${isLight ? '#ffffff' : 'transparent'}; color: ${isLight ? '#0f172a' : '#fff'}; border-color: ${isLight ? '#cbd5e1' : 'rgba(255,255,255,0.2)'};" title="Copiar código">
                          📋 Copiar
                        </button>
                        <button type="button" class="btn btn-danger btn-sm" onclick="window.ProjectsView.deleteCustomProjectCode('${this.escapeHtml(item.code)}')" style="padding: 0.4rem 0.65rem; font-size: 0.8rem;" title="Eliminar código">
                          🗑️
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>

            <!-- Tarjeta de Instrucciones para el Docente -->
            <div class="glass-panel" style="padding: 1.5rem 1.75rem; border-radius: 18px; border: ${cardBorder}; background: ${isLight ? '#f8fafc' : 'rgba(15, 23, 42, 0.7)'}; box-shadow: ${cardShadow};">
              <h4 style="font-size: 0.95rem; font-weight: 900; color: ${titleColor} !important; margin: 0 0 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                <span>💡</span> ¿Cómo lo usan tus estudiantes?
              </h4>
              <p style="font-size: 0.84rem; color: ${textColor} !important; margin: 0; line-height: 1.5;">
                Tus alumnos solo deben ingresar a la plataforma y hacer clic en el botón <strong>"🎮 Unirse a un código"</strong>. Al escribir tu código, entrarán automáticamente a tus materiales y lecciones.
              </p>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  renderProjectJoinView(container) {
    const savedCodes = this.getSavedProjectCodes();
    const prefillCode = this.prefillJoinCode || '';

    container.innerHTML = `
      <div style="min-height: 100vh; min-height: 100dvh; width: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.5rem; box-sizing: border-box; background: #0c0410 url('assets/mentix_project_join_bg.jpg') center center / cover no-repeat; position: relative; overflow-x: hidden; -webkit-text-size-adjust: 100%;">
        
        <!-- Overlay sutil para legibilidad perfecta conservando todo el brillo y geometrías -->
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: radial-gradient(circle at center, rgba(30, 5, 25, 0.42) 0%, rgba(12, 4, 16, 0.78) 100%); pointer-events: none; z-index: 0;"></div>

        <!-- Contenido principal interactivo sobre el fondo -->
        <div style="position: relative; z-index: 2; width: 100%; max-width: 680px; text-align: center; margin: 0 auto;">
          
          <!-- Nombre de la Página / Logotipo Destacado -->
          <a href="javascript:void(0)" onclick="window.ProjectsView.closeJoinProjectModal()" style="text-decoration: none; display: inline-flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 0.5rem 0.75rem; margin-bottom: 1.5rem; cursor: pointer;">
            <span style="font-size: clamp(2rem, 9vw, 2.8rem); filter: drop-shadow(0 0 16px rgba(247,37,133,0.85));">🧠</span>
            <span style="font-size: clamp(1.9rem, 8.5vw, 2.6rem); font-weight: 900; letter-spacing: -0.02em; color: #ffffff !important; text-shadow: 0 4px 20px rgba(0,0,0,0.95);">
              MEN<span style="color: #ffd166 !important; text-shadow: 0 0 25px rgba(255,209,102,0.95), 0 2px 10px rgba(0,0,0,0.9);">TIX</span>
            </span>
          </a>

          <h1 style="font-size: clamp(1.4rem, 5.5vw, 2.5rem); line-height: 1.2; font-weight: 900; margin: 0 0 0.6rem; color: #ffffff !important; letter-spacing: -0.02em; text-shadow: 0 4px 24px rgba(0,0,0,0.95), 0 0 30px rgba(247,37,133,0.5); padding: 0 0.5rem;">
            Ingresa el código para unirte
          </h1>
          
          <p style="color: #ffffff !important; font-size: clamp(1.05rem, 2.5vw, 1.25rem); font-weight: 700; margin: 0 0 2.25rem; text-shadow: 0 2px 12px rgba(0,0,0,0.95);">
            Está en la pantalla frente a ti
          </p>

          <form id="project-join-form" onsubmit="event.preventDefault(); window.ProjectsView.submitJoinProjectCode();" style="width: 100%;">
            <div style="margin-bottom: 1.75rem; width: 100%;">
              <input 
                type="text" 
                id="project-join-code-input" 
                placeholder="1234 5678" 
                maxlength="24" 
                value="${this.escapeHtml(prefillCode)}"
                required
                autocomplete="off"
                style="width: 100%; box-sizing: border-box; text-align: center; font-size: clamp(1.8rem, 4vw, 2.4rem); font-weight: 900; padding: 1.15rem 1.5rem; border-radius: 18px; background: rgba(22, 8, 28, 0.94) !important; border: 2.5px solid #f72585 !important; color: #ffffff !important; outline: none; transition: all 0.2s; box-shadow: 0 10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(247, 37, 133, 0.35) !important; letter-spacing: 2px; text-shadow: 0 0 15px rgba(247, 37, 133, 0.7), 0 2px 8px rgba(0,0,0,0.9);"
                onfocus="this.style.borderColor='#ffd166'; this.style.boxShadow='0 0 35px rgba(255,209,102,0.8)';"
                onblur="this.style.borderColor='#f72585'; this.style.boxShadow='0 10px 35px rgba(0,0,0,0.6), 0 0 25px rgba(247, 37, 133, 0.35)';"
                oninput="const e = document.getElementById('project-join-error'); if(e) e.style.display='none';"
              />
              <div id="project-join-error" style="color: #ff4d6d; font-size: 1rem; font-weight: 800; margin-top: 0.75rem; display: none; text-align: center; text-shadow: 0 2px 8px rgba(0,0,0,0.95);"></div>
            </div>

            <button 
              type="submit" 
              class="btn" 
              style="padding: 0.9rem 3.5rem; font-size: 1.25rem; font-weight: 900; border-radius: 9999px; background: #ffd166; color: #1a0b22 !important; border: 2px solid #ffd166; cursor: pointer; transition: all 0.2s; box-shadow: 0 8px 30px rgba(255, 209, 102, 0.55), 0 0 20px rgba(247, 37, 133, 0.4); min-width: 220px; letter-spacing: 0.5px;"
              onmouseenter="this.style.background='#ffffff'; this.style.color='#1a0b22'; this.style.borderColor='#ffffff'; this.style.boxShadow='0 0 35px rgba(255,255,255,0.9)';"
              onmouseleave="this.style.background='#ffd166'; this.style.color='#1a0b22'; this.style.borderColor='#ffd166'; this.style.boxShadow='0 8px 30px rgba(255, 209, 102, 0.55), 0 0 20px rgba(247, 37, 133, 0.4)';"
            >
              Unirse
            </button>
          </form>

          ${savedCodes && savedCodes.length > 0 ? `
            <!-- Códigos Activos Sugeridos (Pills) -->
            <div style="margin-top: 2rem; display: flex; flex-direction: column; align-items: center; gap: 0.65rem;">
              <span style="font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.7); text-shadow: 0 1px 4px rgba(0,0,0,0.8);">
                Códigos disponibles:
              </span>
              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; justify-content: center; max-width: 520px;">
                ${savedCodes.slice(0, 6).map(sc => `
                  <button 
                    type="button" 
                    onclick="document.getElementById('project-join-code-input').value='${this.escapeHtml(sc.code)}'; window.ProjectsView.submitJoinProjectCode();" 
                    style="background: rgba(247, 37, 133, 0.2); border: 1.5px solid rgba(255, 209, 102, 0.6); color: #ffffff !important; padding: 0.45rem 1rem; border-radius: 9999px; font-weight: 800; font-size: 0.92rem; cursor: pointer; transition: all 0.2s; letter-spacing: 0.8px; text-shadow: 0 1px 3px rgba(0,0,0,0.8);" 
                    onmouseenter="this.style.background='rgba(255, 209, 102, 0.35)'; this.style.borderColor='#ffd166'; this.style.transform='scale(1.05)';" 
                    onmouseleave="this.style.background='rgba(247, 37, 133, 0.2)'; this.style.borderColor='rgba(255, 209, 102, 0.6)'; this.style.transform='scale(1)';"
                  >
                    #${this.escapeHtml(sc.code)}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Enlace para volver -->
          <div style="margin-top: 2.75rem;">
            <a href="javascript:void(0)" onclick="window.ProjectsView.closeJoinProjectModal()" style="font-size: 1rem; font-weight: 700; color: #ffffff !important; text-decoration: none; transition: color 0.2s; text-shadow: 0 2px 10px rgba(0,0,0,0.95);" onmouseenter="this.style.color='#ffd166'" onmouseleave="this.style.color='#ffffff'">
              ← Volver a Proyectos
            </a>
          </div>

        </div>
      </div>
    `;

    setTimeout(() => {
      const input = document.getElementById('project-join-code-input');
      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
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

    if (['presentation', 'video', 'document', 'url'].includes(type)) {
      this.createStudentProject(type);
      return;
    }

    if (type === 'wizard' || type === 'govdata') {
      if (window.ProjectWizard) {
        window.ProjectWizard.openWizard();
      } else if (window.appRouter && window.appRouter.createPresentation) {
        window.appRouter.createPresentation();
      }
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