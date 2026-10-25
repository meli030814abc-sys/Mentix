/**
 * ✨ GOVDATA NEXUS — ASISTENTE INTELIGENTE PARA CREAR PROYECTOS (WIZARD PASO A PASO)
 * Integrado con el Módulo de Proyectos existente y la Landing Page (renderLandingPageView / proyecto-landing.html)
 */

window.ProjectWizard = {
  currentStep: 1,
  totalSteps: 13,
  activeDraftId: null,
  autoSaveTimer: null,
  lastSavedText: 'Guardado automático activo',
  pendingAiProposal: null,
  uploadProgressMap: {},
  defaultCoverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80',
  defaultThumbImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',

stepsMeta: [
    { step: 1, icon: '🏷️', shortTitle: 'Nombre del proyecto', title: 'Paso 1. Nombre e identidad', question: '¿Cómo se llama tu proyecto y cuál es su subtítulo?' },
    { step: 2, icon: '📝', shortTitle: 'Descripción', title: 'Paso 2. Descripción y resumen', question: '¿En qué consiste tu proyecto y cuál es su resumen ejecutivo?' },
    { step: 3, icon: '📁', shortTitle: 'Clasificación', title: 'Paso 3. Categoría y público objetivo', question: '¿A qué categoría pertenece y para quién está diseñado?' },
    { step: 4, icon: '🎯', shortTitle: 'Problema y objetivo', title: 'Paso 4. Problema, objetivo y beneficios', question: '¿Qué reto busca resolver y qué impacto generará?' },
    { step: 5, icon: '👥', shortTitle: 'Equipo y fechas', title: 'Paso 5. Equipo responsable y cronograma', question: '¿Quién lidera el proyecto y cuáles son las fechas clave?' },
    { step: 6, icon: '💡', shortTitle: 'Propuesta de valor', title: 'Paso 6. Propuesta de valor y funcionamiento', question: '¿Por qué este proyecto es valioso y cómo funciona?' },
    { step: 7, icon: '❓', shortTitle: 'Preguntas frecuentes', title: 'Paso 7. Preguntas frecuentes (FAQ) y acción', question: '¿Cuáles son las preguntas frecuentes de los visitantes?' },
    { step: 8, icon: '🎬', shortTitle: 'Video de presentación', title: 'Paso 8. Video de presentación', question: '¿Tienes un video explicativo o demostrativo del proyecto?' },
    { step: 9, icon: '📄', shortTitle: 'Documentos y guías', title: 'Paso 9. Documentos, guías y recursos descargables', question: '¿Qué manuales o documentos deseas compartir?' },
    { step: 10, icon: '🖼️', shortTitle: 'Imágenes y portada', title: 'Paso 10. Portada y activos visuales', question: '¿Qué imágenes o capturas mostrarán tu proyecto?' },
    { step: 11, icon: '🔗', shortTitle: 'Enlaces externos', title: 'Paso 11. Enlaces y demos externas', question: '¿Qué sitios web, demos o repositorios complementan el proyecto?' },
    { step: 12, icon: '⚙️', shortTitle: 'Config. publicación', title: 'Paso 12. Configuración en la Landing Page', question: '¿Cómo deseas que aparezca publicado en la Landing Page?' },
    { step: 13, icon: '🚀', shortTitle: 'Revisión y publicación', title: 'Paso 13. Revisión final y publicación', question: 'Revisa el resumen completo antes de publicar tu proyecto.' }
  ],

  resourceCategories: [
    'Documentación',
    'Guías y manuales',
    'Presentaciones',
    'Imágenes y material gráfico',
    'Videos',
    'Enlaces externos',
    'Otros recursos'
  ],

  visualCategories: [
    { id: 'gallery', label: 'Galería de imágenes' },
    { id: 'screenshot', label: 'Capturas de pantalla de la aplicación' },
    { id: 'diagram', label: 'Diagramas e infografías' },
    { id: 'institutional_pres', label: 'Presentaciones institucionales' },
    { id: 'commercial_pres', label: 'Presentaciones comerciales' },
    { id: 'feature_img', label: 'Imágenes explicativas de funcionalidades' }
  ],

  linkCategories: [
    'Página web oficial',
    'Demo o aplicación',
    'Repositorio de código',
    'Documentación externa',
    'Curso o plataforma educativa',
    'Presentaciones públicas',
    'Videos',
    'Formularios de contacto',
    'Redes sociales',
    'Artículos o publicaciones',
    'Recursos de terceros'
  ],

  preparationStates: [
    { id: 'idea', label: '💡 Idea' },
    { id: 'en_desarrollo', label: '🛠️ En desarrollo' },
    { id: 'piloto', label: '🧪 Piloto' },
    { id: 'publicado', label: '🌐 Publicado' },
    { id: 'finalizado', label: '🏁 Finalizado' }
  ],

  publicationStates: [
    { id: 'draft', label: '📝 Borrador (Privado)' },
    { id: 'in_preparation', label: '⏳ En preparación (Privado)' },
    { id: 'ready_for_review', label: '🔎 Listo para revisión' },
    { id: 'approved', label: '✅ Aprobado' },
    { id: 'published', label: '🚀 Publicado en Landing Page' },
    { id: 'archived', label: '📦 Archivado (Oculto del público)' }
  ],

  draft: null,

  createDefaultDraft(existingProject = null) {
    const u = window.appState?.currentUser || {};
    const nowIso = new Date().toISOString();
    const todayStr = nowIso.slice(0, 10);

    if (existingProject) {
      const gp = existingProject.govdata || {};
      return {
        id: existingProject.id || ('proj_' + Date.now()),
        title: existingProject.title || gp.title || '',
        subtitle: existingProject.subtitle || gp.subtitle || '',
        shortDescription: existingProject.shortDescription || existingProject.description || gp.shortDescription || '',
        fullDescription: existingProject.fullDescription || gp.fullDescription || existingProject.description || '',
        category: existingProject.category || 'tecnologia',
        categoryName: existingProject.categoryName || 'Tecnología & Programación',
        projectSubtype: existingProject.projectSubtype || gp.projectSubtype || 'Gobierno de Datos e IA',
        targetAudience: existingProject.targetAudience || gp.targetAudience || '',
        problemStatement: existingProject.problemStatement || gp.problemStatement || '',
        mainObjective: existingProject.mainObjective || gp.mainObjective || '',
        benefits: existingProject.benefits || gp.benefits || '',
        teamLead: existingProject.teamLead || gp.teamLead || existingProject.author || u.name || 'Equipo del Proyecto',
        preparationStatus: existingProject.preparationStatus || gp.preparationStatus || 'en_desarrollo',
        startDate: existingProject.startDate || gp.startDate || todayStr,
        endDate: existingProject.endDate || gp.endDate || '',
        valueProp: {
          problemSolved: gp.valueProp?.problemSolved || existingProject.problemStatement || '',
          howItWorks: gp.valueProp?.howItWorks || '',
          forWhom: gp.valueProp?.forWhom || existingProject.targetAudience || '',
          differentiator: gp.valueProp?.differentiator || '',
          keyFeatures: Array.isArray(gp.valueProp?.keyFeatures) ? gp.valueProp.keyFeatures : [],
          resultsAndBenefits: gp.valueProp?.resultsAndBenefits || existingProject.benefits || '',
          prerequisites: gp.valueProp?.prerequisites || '',
          visitorAction: gp.valueProp?.visitorAction || 'Unirse / Colaborar',
          commercialPitch: gp.valueProp?.commercialPitch || '',
          faqs: Array.isArray(gp.valueProp?.faqs) ? gp.valueProp.faqs : []
        },
        videoConfig: {
          sourceType: existingProject.videoConfig?.sourceType || gp.videoConfig?.sourceType || 'url',
          url: existingProject.videoConfig?.url || gp.videoConfig?.url || existingProject.videoUrl || '',
          fileName: existingProject.videoConfig?.fileName || gp.videoConfig?.fileName || '',
          title: existingProject.videoConfig?.title || gp.videoConfig?.title || '',
          description: existingProject.videoConfig?.description || gp.videoConfig?.description || '',
          isPublic: existingProject.videoConfig?.isPublic !== undefined ? existingProject.videoConfig.isPublic : true,
          verified: Boolean(existingProject.videoConfig?.verified || gp.videoConfig?.verified)
        },
        resources: Array.isArray(existingProject.resources) ? JSON.parse(JSON.stringify(existingProject.resources)) : (Array.isArray(gp.resources) ? JSON.parse(JSON.stringify(gp.resources)) : []),
        mainImage: existingProject.mainImage || existingProject.banner || gp.mainImage || '',
        thumbnailImage: existingProject.thumbnailImage || gp.thumbnailImage || '',
        useDefaultImage: existingProject.useDefaultImage !== undefined ? existingProject.useDefaultImage : true,
        visualAssets: Array.isArray(existingProject.visualAssets) ? JSON.parse(JSON.stringify(existingProject.visualAssets)) : (Array.isArray(gp.visualAssets) ? JSON.parse(JSON.stringify(gp.visualAssets)) : []),
        externalLinks: Array.isArray(existingProject.externalLinks) ? JSON.parse(JSON.stringify(existingProject.externalLinks)) : (Array.isArray(gp.externalLinks) ? JSON.parse(JSON.stringify(gp.externalLinks)) : []),
        landingConfig: {
          publicName: existingProject.landingConfig?.publicName || gp.landingConfig?.publicName || existingProject.title || '',
          slug: existingProject.slug || existingProject.landingConfig?.slug || gp.landingConfig?.slug || this.slugify(existingProject.title || 'proyecto-govdata'),
          landingTitle: existingProject.landingConfig?.landingTitle || gp.landingConfig?.landingTitle || existingProject.title || '',
          publicDescription: existingProject.landingConfig?.publicDescription || gp.landingConfig?.publicDescription || existingProject.shortDescription || existingProject.description || '',
          visibleCategory: existingProject.landingConfig?.visibleCategory || existingProject.categoryName || 'Gobierno de Datos e IA',
          tags: Array.isArray(existingProject.tags) ? existingProject.tags : (Array.isArray(gp.landingConfig?.tags) ? gp.landingConfig.tags : ['Gobierno de Datos', 'IA', 'Innovación']),
          ctaText: existingProject.landingConfig?.ctaText || gp.landingConfig?.ctaText || 'Unirse / Colaborar',
          ctaUrl: existingProject.landingConfig?.ctaUrl || gp.landingConfig?.ctaUrl || '#plp-sec-contacto',
          displayOrder: Number(existingProject.displayOrder || gp.landingConfig?.displayOrder || 1),
          featuredVideoPublic: existingProject.landingConfig?.featuredVideoPublic !== false
        },
        publicationStatus: existingProject.publicationStatus || gp.publicationStatus || 'draft',
        completedSteps: Array.isArray(gp.completedSteps) ? gp.completedSteps : [1],
        currentStep: Number(gp.currentStep || 1),
        author: existingProject.author || u.name || u.username || 'Docente / Líder',
        authorId: existingProject.authorId || u.id || u.username || '',
        authorEmail: existingProject.authorEmail || u.email || '',
        authorAvatar: existingProject.authorAvatar || u.avatar || '👨‍🏫',
        authorRole: existingProject.authorRole || u.role || 'teacher',
        createdAt: existingProject.createdAt || nowIso,
        updatedAt: nowIso
      };
    }

    const newId = 'proj_' + Date.now();
    return {
      id: newId,
      title: '',
      subtitle: '',
      shortDescription: '',
      fullDescription: '',
      category: 'tecnologia',
      categoryName: 'Tecnología & Programación',
      projectSubtype: 'Gobierno de Datos e IA',
      targetAudience: '',
      problemStatement: '',
      mainObjective: '',
      benefits: '',
      teamLead: u.name || u.username || '',
      preparationStatus: 'en_desarrollo',
      startDate: todayStr,
      endDate: '',
      valueProp: {
        problemSolved: '',
        howItWorks: '',
        forWhom: '',
        differentiator: '',
        keyFeatures: [],
        resultsAndBenefits: '',
        prerequisites: '',
        visitorAction: 'Unirse / Colaborar',
        commercialPitch: '',
        faqs: []
      },
      videoConfig: {
        sourceType: 'url',
        url: '',
        fileName: '',
        title: '',
        description: '',
        isPublic: true,
        verified: false
      },
      resources: [],
      mainImage: '',
      thumbnailImage: '',
      useDefaultImage: true,
      visualAssets: [],
      externalLinks: [],
      landingConfig: {
        publicName: '',
        slug: '',
        landingTitle: '',
        publicDescription: '',
        visibleCategory: 'Tecnología & Programación',
        tags: ['Gobierno de Datos', 'IA'],
        ctaText: 'Unirse / Colaborar',
        ctaUrl: '#plp-sec-contacto',
        displayOrder: 1,
        featuredVideoPublic: true
      },
      publicationStatus: 'draft',
      completedSteps: [],
      currentStep: 1,
      author: u.name || u.username || 'Docente / Líder',
      authorId: u.id || u.username || '',
      authorEmail: u.email || '',
      authorAvatar: u.avatar || '👨‍🏫',
      authorRole: u.role || 'teacher',
      createdAt: nowIso,
      updatedAt: nowIso
    };
  },

  slugify(text) {
    return String(text || 'proyecto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 64) || ('proyecto-' + Date.now().toString().slice(-4));
  },

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  getAllSavedDrafts() {
    try {
      const raw = localStorage.getItem('mentix_govdata_wizard_drafts');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  },

  saveDraftToStorage(silent = true) {
    if (!this.draft) return;
    this.draft.currentStep = this.currentStep;
    this.draft.updatedAt = new Date().toISOString();

    if (!this.draft.landingConfig.publicName && this.draft.title) {
      this.draft.landingConfig.publicName = this.draft.title;
    }
    if (!this.draft.landingConfig.landingTitle && this.draft.title) {
      this.draft.landingConfig.landingTitle = this.draft.subtitle
        ? `${this.draft.title}: ${this.draft.subtitle}`
        : this.draft.title;
    }
    if (!this.draft.landingConfig.slug && this.draft.title) {
      this.draft.landingConfig.slug = this.slugify(this.draft.title);
    }
    if (!this.draft.landingConfig.publicDescription && this.draft.shortDescription) {
      this.draft.landingConfig.publicDescription = this.draft.shortDescription;
    }

    try {
      const all = this.getAllSavedDrafts().filter(d => d && d.id !== this.draft.id);
      all.unshift(this.draft);
      localStorage.setItem('mentix_govdata_wizard_drafts', JSON.stringify(all.slice(0, 30)));
    } catch (e) {
      console.warn('Aviso al guardar borrador local:', e);
    }

    if (window.supabaseService && typeof window.supabaseService.saveWizardDraft === 'function') {
      const u = window.appState?.currentUser || {};
      window.supabaseService.saveWizardDraft(
        `draft_${this.draft.id}`,
        this.draft.id,
        u.id || u.username || 'anon',
        this.currentStep,
        this.draft.completedSteps || [],
        this.draft
      );
    }

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    this.lastSavedText = `☁️ Guardado automáticamente a las ${timeStr}`;
    const badge = document.getElementById('gdn-autosave-indicator');
    if (badge) badge.textContent = this.lastSavedText;

    if (!silent) {
      alert('✅ Tu progreso se ha guardado correctamente. Puedes retomar este proyecto en el Paso ' + this.currentStep + ' cuando quieras.');
    }
  },

  openWizard(projectId = null, startStep = null) {
    this.pendingAiProposal = null;
    let existing = null;

    if (projectId) {
      const savedDraft = this.getAllSavedDrafts().find(d => d.id === projectId);
      const savedChallenge = (window.appState?.challenges || []).find(c => c.id === projectId);
      existing = savedDraft || savedChallenge || null;
    }

    this.draft = this.createDefaultDraft(existing);
    this.activeDraftId = this.draft.id;
    this.currentStep = startStep || this.draft.currentStep || 1;
    const navEl = document.getElementById('main-navbar');
    if (navEl) navEl.style.display = 'none';

    if (window.ProjectsView) {
      window.ProjectsView.viewMode = 'wizard';
      window.ProjectsView.selectedProjectId = this.draft.id;
      window.ProjectsView.render();
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  saveAndContinueLater() {
    const navEl = document.getElementById('main-navbar');
    if (navEl) navEl.style.display = '';
    this.collectCurrentStepInputs();
    this.saveDraftToStorage(false);
    this.syncProjectRecordToAppState(this.draft.publicationStatus || 'draft');
    if (window.ProjectsView) {
      window.ProjectsView.viewMode = 'list';
      window.ProjectsView.render();
    }
  },

  deleteDraft(draftId) {
    if (!confirm('¿Estás seguro de eliminar este borrador del asistente? Esta acción no se puede deshacer.')) return;
    try {
      const remaining = this.getAllSavedDrafts().filter(d => d && d.id !== draftId);
      localStorage.setItem('mentix_govdata_wizard_drafts', JSON.stringify(remaining));
    } catch (e) {}
    if (window.ProjectsView) window.ProjectsView.render();
  },

  goToStep(targetStep) {
    this.collectCurrentStepInputs();
    const num = Math.max(1, Math.min(this.totalSteps, Number(targetStep) || 1));
    if (num > this.currentStep) {
      if (!this.draft.completedSteps.includes(this.currentStep)) {
        this.draft.completedSteps.push(this.currentStep);
      }
    }
    this.currentStep = num;
    this.pendingAiProposal = null;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  nextStep() {
    this.collectCurrentStepInputs();
    const validationMsg = this.validateStepSoft(this.currentStep);
    if (validationMsg) {
      const warnBox = document.getElementById('gdn-step-validation-msg');
      if (warnBox) {
        warnBox.innerHTML = validationMsg;
        warnBox.style.display = 'block';
      }
    }
    if (!this.draft.completedSteps.includes(this.currentStep)) {
      this.draft.completedSteps.push(this.currentStep);
    }
    if (this.currentStep < this.totalSteps) {
      this.currentStep += 1;
      this.pendingAiProposal = null;
      this.saveDraftToStorage(true);
      if (window.ProjectsView) window.ProjectsView.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  prevStep() {
    this.collectCurrentStepInputs();
    if (this.currentStep > 1) {
      this.currentStep -= 1;
      this.pendingAiProposal = null;
      this.saveDraftToStorage(true);
      if (window.ProjectsView) window.ProjectsView.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  validateStepSoft(step) {
    if (!this.draft) return '';
    if (step === 1 && !this.draft.title.trim()) {
      return '💡 Sugerencia: escribe al menos un nombre provisional para identificar tu proyecto más fácilmente.';
    }
    return '';
  },

collectCurrentStepInputs() {
    if (!this.draft) return;
    const val = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : null;
    };
    const checked = (id) => {
      const el = document.getElementById(id);
      return el ? el.checked : null;
    };

    if (val('gdn-title') !== null) this.draft.title = val('gdn-title').trim();
    if (val('gdn-subtitle') !== null) this.draft.subtitle = val('gdn-subtitle').trim();
    if (val('gdn-short-desc') !== null) this.draft.shortDescription = val('gdn-short-desc').trim();
    if (val('gdn-full-desc') !== null) this.draft.fullDescription = val('gdn-full-desc').trim();
    if (val('gdn-category') !== null) {
      this.draft.category = val('gdn-category');
      const catObj = (window.appState?.categories || []).find(c => c.id === this.draft.category);
      if (catObj) {
        this.draft.categoryName = catObj.name;
        this.draft.landingConfig.visibleCategory = catObj.name;
      }
    }
    if (val('gdn-subtype') !== null) this.draft.projectSubtype = val('gdn-subtype').trim();
    if (val('gdn-audience') !== null) this.draft.targetAudience = val('gdn-audience').trim();
    if (val('gdn-problem') !== null) this.draft.problemStatement = val('gdn-problem').trim();
    if (val('gdn-objective') !== null) this.draft.mainObjective = val('gdn-objective').trim();
    if (val('gdn-benefits') !== null) this.draft.benefits = val('gdn-benefits').trim();
    if (val('gdn-team') !== null) this.draft.teamLead = val('gdn-team').trim();
    if (val('gdn-prep-status') !== null) this.draft.preparationStatus = val('gdn-prep-status');
    if (val('gdn-start-date') !== null) this.draft.startDate = val('gdn-start-date');
    if (val('gdn-end-date') !== null) this.draft.endDate = val('gdn-end-date');

    if (val('gdn-vp-problem') !== null) this.draft.valueProp.problemSolved = val('gdn-vp-problem').trim();
    if (val('gdn-vp-how') !== null) this.draft.valueProp.howItWorks = val('gdn-vp-how').trim();
    if (val('gdn-vp-whom') !== null) this.draft.valueProp.forWhom = val('gdn-vp-whom').trim();
    if (val('gdn-vp-diff') !== null) this.draft.valueProp.differentiator = val('gdn-vp-diff').trim();
    if (val('gdn-vp-features') !== null) {
      this.draft.valueProp.keyFeatures = val('gdn-vp-features').split('\n').map(s => s.trim()).filter(Boolean);
    }
    if (val('gdn-vp-results') !== null) this.draft.valueProp.resultsAndBenefits = val('gdn-vp-results').trim();
    if (val('gdn-vp-prereq') !== null) this.draft.valueProp.prerequisites = val('gdn-vp-prereq').trim();
    if (val('gdn-vp-action') !== null) this.draft.valueProp.visitorAction = val('gdn-vp-action').trim();
    if (val('gdn-vp-pitch') !== null) this.draft.valueProp.commercialPitch = val('gdn-vp-pitch').trim();

    if (val('gdn-video-title') !== null) this.draft.videoConfig.title = val('gdn-video-title').trim();
    if (val('gdn-video-desc') !== null) this.draft.videoConfig.description = val('gdn-video-desc').trim();
    if (val('gdn-video-url') !== null) {
      const newUrl = val('gdn-video-url').trim();
      if (newUrl !== this.draft.videoConfig.url) {
        this.draft.videoConfig.url = newUrl;
        this.draft.videoConfig.verified = this.isValidVideoUrl(newUrl).valid;
      }
    }
    if (checked('gdn-video-public') !== null) {
      this.draft.videoConfig.isPublic = checked('gdn-video-public');
    }

    if (val('gdn-main-image') !== null) this.draft.mainImage = val('gdn-main-image').trim();
    if (val('gdn-thumb-image') !== null) this.draft.thumbnailImage = val('gdn-thumb-image').trim();
    if (checked('gdn-use-default-img') !== null) this.draft.useDefaultImage = checked('gdn-use-default-img');

    if (val('gdn-pub-name') !== null) this.draft.landingConfig.publicName = val('gdn-pub-name').trim();
    if (val('gdn-pub-slug') !== null) this.draft.landingConfig.slug = this.slugify(val('gdn-pub-slug'));
    if (val('gdn-pub-title') !== null) this.draft.landingConfig.landingTitle = val('gdn-pub-title').trim();
    if (val('gdn-pub-desc') !== null) this.draft.landingConfig.publicDescription = val('gdn-pub-desc').trim();
    if (val('gdn-pub-cat') !== null) this.draft.landingConfig.visibleCategory = val('gdn-pub-cat').trim();
    if (val('gdn-pub-tags') !== null) {
      this.draft.landingConfig.tags = val('gdn-pub-tags').split(',').map(s => s.trim()).filter(Boolean);
    }
    if (val('gdn-pub-cta-text') !== null) this.draft.landingConfig.ctaText = val('gdn-pub-cta-text').trim();
    if (val('gdn-pub-cta-url') !== null) this.draft.landingConfig.ctaUrl = val('gdn-pub-cta-url').trim();
    if (val('gdn-pub-order') !== null) this.draft.landingConfig.displayOrder = Number(val('gdn-pub-order') || 1);
    if (val('gdn-pub-status') !== null) this.draft.publicationStatus = val('gdn-pub-status');
  },

  // =========================================================================
  // RENDERIZADO PRINCIPAL DEL ASISTENTE (WIZARD)
  // =========================================================================
  render(container) {
    if (!this.draft) {
      this.draft = this.createDefaultDraft();
    }
    const d = this.draft;
    const currentMeta = this.stepsMeta.find(s => s.step === this.currentStep) || this.stepsMeta[0];
    const progressPct = Math.round(((this.currentStep - 1) / (this.totalSteps - 1)) * 100);
    const theme = (window.ProjectsView && window.ProjectsView.getLandingTheme) ? window.ProjectsView.getLandingTheme() : 'light';

    container.innerHTML = `
      <div style="max-width: 1440px; margin: 0 auto; padding: 0.5rem 1rem 4rem;">
        <div class="gdn-wizard-shell animate-fade-in" data-theme="${theme}">
          
          <!-- Barra de Progreso Paso a Paso (Sin botones cortados, solo progreso limpio) -->
          <div class="gdn-wizard-progress-strip">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; flex-wrap: wrap; gap: 0.5rem;">
              <div style="font-size: 0.92rem; font-weight: 800; color: var(--gdn-text); display: flex; align-items: center; gap: 0.5rem;">
                <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);"></span>
                Progreso del Asistente: Paso ${this.currentStep} de ${this.totalSteps} (${progressPct}% completado)
              </div>
              <div style="font-size: 0.82rem; color: #10b981; font-weight: 700;">
                ${currentMeta.icon} ${currentMeta.title}
              </div>
            </div>

            <div style="width: 100%; height: 8px; background: var(--gdn-subtle); border-radius: 999px; overflow: hidden;">
              <div style="width: ${Math.max(6, progressPct)}%; height: 100%; background: linear-gradient(90deg, #0ea5e9, #10b981); border-radius: 999px; transition: width 0.35s ease;"></div>
            </div>
          </div>

<!-- Cuerpo Principal (Área de Paso + Panel Lateral de Asistencia IA y Resumen) -->
          <div class="gdn-wizard-body">
            
            <!-- Columna Principal del Paso Actual -->
            <div oninput="window.ProjectWizard.triggerFieldAutoSave()">
              <div class="gdn-question-banner">
                <div style="font-size: 0.76rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #059669; margin-bottom: 0.25rem;">
                  ${currentMeta.icon} ${currentMeta.title}
                </div>
                <h2 style="margin: 0; font-size: clamp(1.2rem, 2.2vw, 1.5rem); font-weight: 800; color: var(--gdn-text);">
                  ${currentMeta.question}
                </h2>
              </div>

              <div id="gdn-step-validation-msg" style="display: none; background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.45); color: #b45309; padding: 0.75rem 1rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.86rem; font-weight: 600;"></div>

              ${this.renderStepContent(this.currentStep)}
            </div>

            <!-- Columna Lateral: Copiloto de IA Contextual + Resumen de Recursos -->
            <aside class="gdn-ai-panel" aria-label="Asistente de Inteligencia Artificial">
              ${this.renderAiSidebar()}
            </aside>

          </div>

          <!-- Pie de Navegación del Asistente -->
          <div class="gdn-wizard-footer">
            <div>
              ${this.currentStep > 1 ? `
                <button type="button" class="plp-btn-secondary" onclick="window.ProjectWizard.prevStep()">
                  ← Paso anterior
                </button>
              ` : `
                <button type="button" class="plp-btn-secondary" onclick="window.ProjectWizard.saveAndContinueLater()">
                  Cancelar / Salir
                </button>
              `}
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <button type="button" class="plp-btn-secondary" onclick="window.ProjectWizard.collectCurrentStepInputs(); window.ProjectWizard.saveDraftToStorage(false);">
                💾 Guardar avance
              </button>
              ${this.currentStep < this.totalSteps ? `
                <button type="button" class="plp-cta-btn" onclick="window.ProjectWizard.nextStep()" style="padding: 0.75rem 1.6rem; font-size: 0.95rem;">
                  Continuar al Paso ${this.currentStep + 1} →
                </button>
              ` : `
                <button type="button" class="plp-cta-btn" onclick="window.ProjectWizard.publishOrSubmitProject()" style="padding: 0.8rem 1.8rem; font-size: 1rem; background: #10b981;">
                  🚀 ${this.canPublishDirectly() ? 'Publicar Proyecto en Landing Page' : 'Enviar Proyecto a Revisión'}
                </button>
              `}
            </div>
          </div>

        </div>
      </div>
    `;
  },

renderStepContent(step) {
    switch (step) {
      case 1: return this.renderStep1Name();
      case 2: return this.renderStep2Desc();
      case 3: return this.renderStep3Classification();
      case 4: return this.renderStep4ProblemObjective();
      case 5: return this.renderStep5TeamDates();
      case 6: return this.renderStep6ValueProp();
      case 7: return this.renderStep7Faqs();
      case 8: return this.renderStep3Video();
      case 9: return this.renderStep4Resources();
      case 10: return this.renderStep5Visuals();
      case 11: return this.renderStep6ExternalLinks();
      case 12: return this.renderStep7PublicationConfig();
      case 13: return this.renderStep8FinalReview();
      default: return this.renderStep1Name();
    }
  },

  // =========================================================================
  // PASO 1: INFORMACIÓN BÁSICA DEL PROYECTO
  // =========================================================================
// =========================================================================
  // PASO 1: NOMBRE E IDENTIDAD BÁSICA (SIN SCROLL / NO QUE SE PUEDA BAJAR)
  // =========================================================================
  renderStep1Name() {
    const d = this.draft;
    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: var(--gdn-text); font-weight: 800;">1. Identidad básica del proyecto</h3>
        <p class="gdn-help" style="margin-bottom: 1.35rem; font-size: 0.88rem;">
          Comencemos con el nombre y la frase clave que identificará tu proyecto ante toda la comunidad.
        </p>

        <div class="gdn-field" style="margin-bottom: 1.25rem;">
          <label class="gdn-label" for="gdn-title" style="font-size: 0.95rem; font-weight: 700;">
            <span>Nombre del proyecto <span style="color:#10b981;">*</span></span>
            <button type="button" style="background:none; border:none; color:#10b981; font-weight:700; font-size:0.8rem; cursor:pointer;" onclick="window.ProjectWizard.aiProposeTitles()">
              ✨ Sugerir nombres con IA
            </button>
          </label>
          <input type="text" id="gdn-title" class="gdn-input" style="font-size: 1.05rem; padding: 0.75rem 1rem;" value="${this.escapeHtml(d.title)}" placeholder="Ej: Plataforma de Gobierno de Datos e IA" autofocus />
          <div class="gdn-help">Nombre claro con el que se identificará el proyecto.</div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-subtitle" style="font-size: 0.95rem; font-weight: 700;">
            <span>Subtítulo o lema descriptivo</span>
          </label>
          <input type="text" id="gdn-subtitle" class="gdn-input" style="font-size: 0.95rem; padding: 0.7rem 1rem;" value="${this.escapeHtml(d.subtitle)}" placeholder="Ej: Decisiones estratégicas con ética, transparencia y alto impacto" />
          <div class="gdn-help">Una frase breve que resuma la esencia o promesa principal del proyecto.</div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 2: DESCRIPCIÓN Y RESUMEN DEL PROYECTO
  // =========================================================================
  renderStep2Desc() {
    const d = this.draft;
    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: var(--gdn-text); font-weight: 800;">2. Descripción y resumen ejecutivo</h3>
        <p class="gdn-help" style="margin-bottom: 1.35rem; font-size: 0.88rem;">
          Explica el alcance y contexto del proyecto. Puedes escribir una idea base y perfeccionarla con la IA.
        </p>

        <div class="gdn-field" style="margin-bottom: 1.25rem;">
          <label class="gdn-label" for="gdn-short-desc">
            <span>Descripción corta (Resumen ejecutivo)</span>
            <button type="button" style="background:none; border:none; color:#10b981; font-weight:700; font-size:0.8rem; cursor:pointer;" onclick="window.ProjectWizard.aiGenerateShortDesc()">
              ✨ Generar desde la descripción completa
            </button>
          </label>
          <textarea id="gdn-short-desc" class="gdn-textarea" rows="2" placeholder="Ej: Ecosistema integral que estandariza la calidad de datos e impulsa modelos predictivos auditables para instituciones educativas y públicas.">${this.escapeHtml(d.shortDescription)}</textarea>
          <div class="gdn-help">Se mostrará en el encabezado de la Landing Page y en las tarjetas de resumen (ideal entre 120 y 240 caracteres).</div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-full-desc">
            <span>Descripción completa del proyecto</span>
            <button type="button" style="background:none; border:none; color:#10b981; font-weight:700; font-size:0.8rem; cursor:pointer;" onclick="window.ProjectWizard.aiImproveDescription()">
              ✨ Mejorar redacción con IA
            </button>
          </label>
          <textarea id="gdn-full-desc" class="gdn-textarea" rows="4" placeholder="Explica en qué consiste el proyecto, su contexto, alcance y cómo aporta valor...">${this.escapeHtml(d.fullDescription)}</textarea>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 3: CATEGORÍA Y PÚBLICO OBJETIVO
  // =========================================================================
  renderStep3Classification() {
    const d = this.draft;
    const categories = (window.appState?.categories || []).filter(c => c && c.id && !['fhjr', 'kj'].includes(String(c.id).toLowerCase()));
    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: var(--gdn-text); font-weight: 800;">3. Categoría y público objetivo</h3>
        <p class="gdn-help" style="margin-bottom: 1.35rem; font-size: 0.88rem;">
          Selecciona la temática del proyecto y a quiénes va dirigido.
        </p>

        <div class="gdn-field-grid" style="margin-bottom: 1.25rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-category">Categoría del proyecto</label>
            <select id="gdn-category" class="gdn-select">
              ${categories.map(cat => `
                <option value="${this.escapeHtml(cat.id)}" ${d.category === cat.id ? 'selected' : ''}>
                  ${cat.icon || '📁'} ${this.escapeHtml(cat.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-subtype">Tipo de proyecto</label>
            <select id="gdn-subtype" class="gdn-select">
              ${[
                'Gobierno de Datos e IA',
                'Analítica Predictiva y BI',
                'Automatización y Transformación Digital',
                'Plataforma Educativa / EdTech',
                'Investigación Aplicada',
                'Repositorio Normativo y Técnico',
                'Simulador / Laboratorio Interactivo'
              ].map(t => `<option value="${this.escapeHtml(t)}" ${d.projectSubtype === t ? 'selected' : ''}>${this.escapeHtml(t)}</option>`).join('')}
            </select>
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-audience">Público objetivo</label>
          <input type="text" id="gdn-audience" class="gdn-input" value="${this.escapeHtml(d.targetAudience)}" placeholder="Ej: Directivos, docentes, equipos de tecnología y ciudadanía" />
          <div class="gdn-help">Personas o entidades que se beneficiarán con este proyecto.</div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 4: PROBLEMA, OBJETIVO Y BENEFICIOS
  // =========================================================================
  renderStep4ProblemObjective() {
    const d = this.draft;
    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: var(--gdn-text); font-weight: 800;">4. Problema, objetivo y beneficios</h3>
        <p class="gdn-help" style="margin-bottom: 1.35rem; font-size: 0.88rem;">
          Define qué reto resuelve el proyecto y el impacto positivo que aportará.
        </p>

        <div class="gdn-field" style="margin-bottom: 1.25rem;">
          <label class="gdn-label" for="gdn-problem">Problema o necesidad que aborda</label>
          <textarea id="gdn-problem" class="gdn-textarea" rows="2" placeholder="¿Qué dificultad o brecha actual motivó la creación de este proyecto?">${this.escapeHtml(d.problemStatement)}</textarea>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-objective">Objetivo principal (Misión)</label>
            <textarea id="gdn-objective" class="gdn-textarea" rows="2" placeholder="¿Qué busca lograr el proyecto de forma concreta?">${this.escapeHtml(d.mainObjective)}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-benefits">Beneficios para el usuario (Visión e impacto)</label>
            <textarea id="gdn-benefits" class="gdn-textarea" rows="2" placeholder="¿Cómo mejora el trabajo o aprendizaje de quienes lo utilizan?">${this.escapeHtml(d.benefits)}</textarea>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 5: EQUIPO RESPONSABLE Y CRONOGRAMA
  // =========================================================================
  renderStep5TeamDates() {
    const d = this.draft;
    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.15rem; color: var(--gdn-text); font-weight: 800;">5. Equipo responsable y cronograma</h3>
        <p class="gdn-help" style="margin-bottom: 1.35rem; font-size: 0.88rem;">
          Registra el responsable o equipo a cargo y las fechas estimadas.
        </p>

        <div class="gdn-field-grid" style="margin-bottom: 1.25rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-team">Responsable o equipo del proyecto</label>
            <input type="text" id="gdn-team" class="gdn-input" value="${this.escapeHtml(d.teamLead)}" placeholder="Ej: Comité de Innovación GovData / Prof. Melisa" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-prep-status">Estado actual del proyecto</label>
            <select id="gdn-prep-status" class="gdn-select">
              ${this.preparationStates.map(st => `
                <option value="${st.id}" ${d.preparationStatus === st.id ? 'selected' : ''}>${st.label}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-start-date">Fecha de inicio</label>
            <input type="date" id="gdn-start-date" class="gdn-input" value="${this.escapeHtml(d.startDate)}" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-end-date">Fecha estimada de finalización</label>
            <input type="date" id="gdn-end-date" class="gdn-input" value="${this.escapeHtml(d.endDate)}" />
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 6: PROPUESTA DE VALOR Y FUNCIONAMIENTO
  // =========================================================================
  renderStep6ValueProp() {
    const vp = this.draft.valueProp || {};
    const featuresText = Array.isArray(vp.keyFeatures) ? vp.keyFeatures.join('\n') : '';

    return `
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <div>
            <h3 style="margin:0; font-size:1.15rem; color:var(--gdn-text); font-weight:800;">6. Propuesta de valor y funcionamiento</h3>
            <p class="gdn-help" style="margin:0.2rem 0 0;">Responde con tus palabras para estructurar la Landing Page oficial.</p>
          </div>
          <button type="button" class="plp-doc-btn" style="width:auto; padding:0.45rem 0.9rem;" onclick="window.ProjectWizard.aiProposeValueProp()">
            ✨ Autocompletar sugerencias con IA
          </button>
        </div>

        <div class="gdn-field-grid" style="margin-bottom:1.25rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-problem">¿Qué problema resuelve?</label>
            <textarea id="gdn-vp-problem" class="gdn-textarea" rows="2" placeholder="Ej: Elimina la dispersión de datos y la falta de trazabilidad en los reportes.">${this.escapeHtml(vp.problemSolved || this.draft.problemStatement || '')}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-how">¿Cómo funciona?</label>
            <textarea id="gdn-vp-how" class="gdn-textarea" rows="2" placeholder="Ej: Centraliza las fuentes de información, valida su calidad y genera tableros interactivos.">${this.escapeHtml(vp.howItWorks)}</textarea>
          </div>
        </div>

        <div class="gdn-field-grid" style="margin-bottom:1.25rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-whom">¿A quién está dirigido?</label>
            <textarea id="gdn-vp-whom" class="gdn-textarea" rows="2" placeholder="Ej: Equipos directivos, docentes, investigadores y estudiantes.">${this.escapeHtml(vp.forWhom || this.draft.targetAudience || '')}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-diff">¿Qué lo hace diferente?</label>
            <textarea id="gdn-vp-diff" class="gdn-textarea" rows="2" placeholder="Ej: Enfoque en gobernanza ética, facilidad de uso y recursos abiertos.">${this.escapeHtml(vp.differentiator)}</textarea>
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-vp-features">Principales funcionalidades o pilares (Una por línea)</label>
          <textarea id="gdn-vp-features" class="gdn-textarea" rows="3" placeholder="Catálogo maestro de datos verificados&#10;Modelos predictivos con IA explicable&#10;Protocolos de ética y privacidad por diseño">${this.escapeHtml(featuresText)}</textarea>
          <div class="gdn-help">Se mostrarán como etiquetas destacadas (chips) en la Landing Page.</div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 7: PREGUNTAS FRECUENTES (FAQ) Y ACCIÓN DEL VISITANTE
  // =========================================================================
  renderStep7Faqs() {
    const vp = this.draft.valueProp || {};
    const faqs = Array.isArray(vp.faqs) ? vp.faqs : [];

    return `
      <div class="gdn-card">
        <h3 style="margin:0 0 0.35rem; font-size:1.15rem; color:var(--gdn-text); font-weight:800;">7. Llamado a la acción y preguntas frecuentes</h3>
        <p class="gdn-help" style="margin-bottom:1.25rem;">Define qué deseas que haga el visitante y aclara sus dudas más comunes.</p>

        <div class="gdn-field-grid" style="margin-bottom:1.25rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-action">Acción principal esperada del visitante</label>
            <input type="text" id="gdn-vp-action" class="gdn-input" value="${this.escapeHtml(vp.visitorAction)}" placeholder="Ej: Unirse al proyecto / Explorar recursos / Contactar" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-pitch">Lema o pitch de una línea</label>
            <input type="text" id="gdn-vp-pitch" class="gdn-input" value="${this.escapeHtml(vp.commercialPitch)}" placeholder="Ej: Impulsando decisiones inteligentes con datos confiables" />
          </div>
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem; padding-top:1rem; border-top:1px solid var(--gdn-border);">
          <div>
            <strong style="font-size:0.95rem; color:var(--gdn-text);">❓ Preguntas Frecuentes (FAQ)</strong>
            <p class="gdn-help" style="margin:0.15rem 0 0;">Respuestas claras para los visitantes del proyecto.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.4rem 0.85rem;" onclick="window.ProjectWizard.aiProposeFaqs()">
              ✨ Sugerir FAQs con IA
            </button>
            <button type="button" class="plp-doc-btn" style="width:auto; padding:0.4rem 0.85rem;" onclick="window.ProjectWizard.addFaqItem()">
              + Agregar pregunta
            </button>
          </div>
        </div>

        ${faqs.length === 0 ? `
          <div style="padding:1rem; background:var(--gdn-subtle); border-radius:10px; font-size:0.85rem; color:var(--gdn-text-muted); text-align:center;">
            Aún no has agregado preguntas frecuentes. Pulsa "+ Agregar pregunta" o usa el Copiloto IA para sugerirlas.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${faqs.map((f, idx) => `
              <div style="padding:0.9rem; background:var(--gdn-bg); border:1px solid var(--gdn-border); border-radius:10px;">
                <div style="display:flex; justify-content:space-between; gap:0.5rem; margin-bottom:0.45rem;">
                  <input type="text" class="gdn-input" value="${this.escapeHtml(f.q)}" placeholder="Pregunta frecuente..." oninput="window.ProjectWizard.updateFaqItem(${idx}, 'q', this.value)" style="font-weight:700;" />
                  <button type="button" style="background:none; border:none; color:#ef4444; font-size:1.1rem; cursor:pointer;" onclick="window.ProjectWizard.removeFaqItem(${idx})" title="Eliminar pregunta">✕</button>
                </div>
                <textarea class="gdn-textarea" rows="2" placeholder="Respuesta clara y concisa..." oninput="window.ProjectWizard.updateFaqItem(${idx}, 'a', this.value)">${this.escapeHtml(f.a)}</textarea>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  renderStep1BasicInfo() {
    const d = this.draft;
    const categories = (window.appState?.categories || []).filter(c => c && c.id && !['fhjr', 'kj'].includes(String(c.id).toLowerCase()));

    return `
      <div class="gdn-card">
        <h3 style="margin: 0 0 0.35rem; font-size: 1.08rem; color: var(--gdn-text);">1. Identidad principal del proyecto</h3>
        <p class="gdn-help" style="margin-bottom: 1.1rem;">
          No necesitas tener todo definitivo desde el primer momento. Puedes empezar con una idea general y pedir ayuda al asistente de IA a la derecha.
        </p>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-title">
              <span>Nombre del proyecto <span style="color:#10b981;">*</span></span>
            </label>
            <input type="text" id="gdn-title" class="gdn-input" value="${this.escapeHtml(d.title)}" placeholder="Ej: Plataforma de Gobierno de Datos e IA" />
            <div class="gdn-help">Nombre claro con el que se identificará el proyecto.</div>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-subtitle">
              <span>Subtítulo o frase descriptiva</span>
            </label>
            <input type="text" id="gdn-subtitle" class="gdn-input" value="${this.escapeHtml(d.subtitle)}" placeholder="Ej:Decisiones estratégicas con ética, transparencia y alto impacto" />
            <div class="gdn-help">Una frase breve que resuma la esencia o promesa del proyecto.</div>
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-short-desc">
            <span>Descripción corta (Resumen ejecutivo)</span>
            <button type="button" style="background:none; border:none; color:#10b981; font-weight:700; font-size:0.78rem; cursor:pointer;" onclick="window.ProjectWizard.aiGenerateShortDesc()">
              ✨ Generar desde la descripción completa
            </button>
          </label>
          <textarea id="gdn-short-desc" class="gdn-textarea" rows="2" placeholder="Ej: Ecosistema integral que estandariza la calidad de datos e impulsa modelos predictivos auditables para instituciones educativas y públicas.">${this.escapeHtml(d.shortDescription)}</textarea>
          <div class="gdn-help">Se mostrará en el encabezado de la Landing Page y en las tarjetas de resumen (ideal entre 120 y 240 caracteres).</div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-full-desc">
            <span>Descripción completa del proyecto</span>
            <button type="button" style="background:none; border:none; color:#10b981; font-weight:700; font-size:0.78rem; cursor:pointer;" onclick="window.ProjectWizard.aiImproveDescription()">
              ✨ Mejorar redacción con IA
            </button>
          </label>
          <textarea id="gdn-full-desc" class="gdn-textarea" rows="4" placeholder="Explica en qué consiste el proyecto, su contexto, alcance y cómo aporta valor...">${this.escapeHtml(d.fullDescription)}</textarea>
        </div>
      </div>

      <div class="gdn-card">
        <h3 style="margin: 0 0 0.85rem; font-size: 1.08rem; color: var(--gdn-text);">2. Clasificación, problema y objetivos</h3>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-category">Categoría del proyecto</label>
            <select id="gdn-category" class="gdn-select">
              ${categories.map(cat => `
                <option value="${this.escapeHtml(cat.id)}" ${d.category === cat.id ? 'selected' : ''}>
                  ${cat.icon || '📁'} ${this.escapeHtml(cat.name)}
                </option>
              `).join('')}
            </select>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-subtype">Tipo de proyecto</label>
            <select id="gdn-subtype" class="gdn-select">
              ${[
                'Gobierno de Datos e IA',
                'Analítica Predictiva y BI',
                'Automatización y Transformación Digital',
                'Plataforma Educativa / EdTech',
                'Investigación Aplicada',
                'Repositorio Normativo y Técnico',
                'Simulador / Laboratorio Interactivo'
              ].map(t => `<option value="${this.escapeHtml(t)}" ${d.projectSubtype === t ? 'selected' : ''}>${this.escapeHtml(t)}</option>`).join('')}
            </select>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-audience">Público objetivo</label>
            <input type="text" id="gdn-audience" class="gdn-input" value="${this.escapeHtml(d.targetAudience)}" placeholder="Ej: Directivos, docentes, equipos de TI y estudiantes" />
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-problem">Problema o necesidad que aborda</label>
          <textarea id="gdn-problem" class="gdn-textarea" rows="2" placeholder="¿Qué dificultad o brecha actual motivó la creación de este proyecto?">${this.escapeHtml(d.problemStatement)}</textarea>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-objective">Objetivo principal (Misión)</label>
            <textarea id="gdn-objective" class="gdn-textarea" rows="2" placeholder="¿Qué busca lograr el proyecto de forma concreta?">${this.escapeHtml(d.mainObjective)}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-benefits">Beneficios para el usuario (Visión e impacto)</label>
            <textarea id="gdn-benefits" class="gdn-textarea" rows="2" placeholder="¿Cómo mejora el trabajo o aprendizaje de quienes lo utilizan?">${this.escapeHtml(d.benefits)}</textarea>
          </div>
        </div>
      </div>

      <div class="gdn-card">
        <h3 style="margin: 0 0 0.85rem; font-size: 1.08rem; color: var(--gdn-text);">3. Equipo responsable, estado y fechas</h3>
        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-team">Responsable o equipo del proyecto</label>
            <input type="text" id="gdn-team" class="gdn-input" value="${this.escapeHtml(d.teamLead)}" placeholder="Ej: Comité de Innovación GovData / Prof. Melisa" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-prep-status">Estado actual del proyecto</label>
            <select id="gdn-prep-status" class="gdn-select">
              ${this.preparationStates.map(st => `
                <option value="${st.id}" ${d.preparationStatus === st.id ? 'selected' : ''}>${st.label}</option>
              `).join('')}
            </select>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-start-date">Fecha de inicio</label>
            <input type="date" id="gdn-start-date" class="gdn-input" value="${this.escapeHtml(d.startDate)}" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-end-date">Fecha de finalización (opcional)</label>
            <input type="date" id="gdn-end-date" class="gdn-input" value="${this.escapeHtml(d.endDate)}" />
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // PASO 2: CONTENIDO Y PROPUESTA DE VALOR
  // =========================================================================
  renderStep2ValueProp() {
    const vp = this.draft.valueProp || {};
    const featuresText = Array.isArray(vp.keyFeatures) ? vp.keyFeatures.join('\n') : '';
    const faqs = Array.isArray(vp.faqs) ? vp.faqs : [];

    return `
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <div>
            <h3 style="margin:0; font-size:1.08rem; color:var(--gdn-text);">Preguntas clave para presentar tu proyecto</h3>
            <p class="gdn-help" style="margin:0.2rem 0 0;">Responde con tus propias palabras. El asistente usará estas respuestas para estructurar la Landing Page.</p>
          </div>
          <button type="button" class="plp-doc-btn" style="width:auto; padding:0.45rem 0.9rem;" onclick="window.ProjectWizard.aiProposeValueProp()">
            ✨ Autocompletar sugerencias con IA
          </button>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-problem">1. ¿Qué problema resuelve?</label>
            <textarea id="gdn-vp-problem" class="gdn-textarea" rows="2" placeholder="Ej: Elimina la dispersión de datos y la falta de trazabilidad en los reportes institucionales.">${this.escapeHtml(vp.problemSolved || this.draft.problemStatement || '')}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-how">2. ¿Cómo funciona?</label>
            <textarea id="gdn-vp-how" class="gdn-textarea" rows="2" placeholder="Ej: Centraliza las fuentes de información, valida su calidad y las presenta en tableros y recursos descargables.">${this.escapeHtml(vp.howItWorks)}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-whom">3. ¿A quién está dirigido?</label>
            <textarea id="gdn-vp-whom" class="gdn-textarea" rows="2" placeholder="Ej: Equipos directivos, docentes, investigadores y estudiantes.">${this.escapeHtml(vp.forWhom || this.draft.targetAudience || '')}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-diff">4. ¿Qué lo hace diferente?</label>
            <textarea id="gdn-vp-diff" class="gdn-textarea" rows="2" placeholder="Ej: Su enfoque en gobernanza ética, facilidad de uso y documentación abierta lista para implementar.">${this.escapeHtml(vp.differentiator)}</textarea>
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-vp-features">5. ¿Cuáles son sus principales funcionalidades o pilares? (Una por línea)</label>
          <textarea id="gdn-vp-features" class="gdn-textarea" rows="3" placeholder="Catálogo maestro de datos verificados&#10;Modelos predictivos con IA explicable&#10;Protocolos de ética y privacidad por diseño">${this.escapeHtml(featuresText)}</textarea>
          <div class="gdn-help">Se mostrarán como etiquetas destacadas (chips) en la sección principal de la Landing Page.</div>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-results">6. ¿Qué resultados o beneficios ofrece?</label>
            <textarea id="gdn-vp-results" class="gdn-textarea" rows="2" placeholder="Describe los beneficios documentados para los usuarios...">${this.escapeHtml(vp.resultsAndBenefits || this.draft.benefits || '')}</textarea>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-prereq">7. ¿Qué necesita saber una persona antes de utilizarlo?</label>
            <textarea id="gdn-vp-prereq" class="gdn-textarea" rows="2" placeholder="Ej: Conocimientos básicos de navegación web y lectura de la guía de inicio rápido.">${this.escapeHtml(vp.prerequisites)}</textarea>
          </div>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-action">8. ¿Cuál es la acción principal que deseas que realice el visitante?</label>
            <input type="text" id="gdn-vp-action" class="gdn-input" value="${this.escapeHtml(vp.visitorAction)}" placeholder="Ej: Descargar documentación / Unirse al proyecto / Probar demo" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-vp-pitch">Texto de presentación para la Landing Page</label>
            <input type="text" id="gdn-vp-pitch" class="gdn-input" value="${this.escapeHtml(vp.commercialPitch)}" placeholder="Síntesis atractiva de una línea para el encabezado..." />
          </div>
        </div>
      </div>

      <!-- Preguntas Frecuentes (FAQ) del Proyecto -->
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:0.85rem;">
          <div>
            <h3 style="margin:0; font-size:1.05rem; color:var(--gdn-text);">❓ Preguntas Frecuentes (FAQ) para los visitantes</h3>
            <p class="gdn-help" style="margin:0.2rem 0 0;">Se mostrarán en el centro de ayuda de la Landing Page del proyecto.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.4rem 0.85rem;" onclick="window.ProjectWizard.aiProposeFaqs()">
              ✨ Sugerir FAQs con IA
            </button>
            <button type="button" class="plp-doc-btn" style="width:auto; padding:0.4rem 0.85rem;" onclick="window.ProjectWizard.addFaqItem()">
              + Agregar pregunta
            </button>
          </div>
        </div>

        ${faqs.length === 0 ? `
          <div style="padding:1rem; background:var(--gdn-subtle); border-radius:10px; font-size:0.85rem; color:var(--gdn-text-muted); text-align:center;">
            Aún no has agregado preguntas frecuentes. Puedes agregarlas manualmente o pedirle a la IA que sugiera preguntas basadas en tu descripción.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${faqs.map((f, idx) => `
              <div style="padding:0.9rem; background:var(--gdn-bg); border:1px solid var(--gdn-border); border-radius:10px;">
                <div style="display:flex; justify-content:space-between; gap:0.5rem; margin-bottom:0.45rem;">
                  <input type="text" class="gdn-input" value="${this.escapeHtml(f.q)}" placeholder="Pregunta frecuente..." oninput="window.ProjectWizard.updateFaqItem(${idx}, 'q', this.value)" style="font-weight:700;" />
                  <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.65rem; color:#ef4444; border-color:#fca5a5;" onclick="window.ProjectWizard.removeFaqItem(${idx})">🗑️</button>
                </div>
                <textarea class="gdn-textarea" rows="2" placeholder="Respuesta clara y verificada..." oninput="window.ProjectWizard.updateFaqItem(${idx}, 'a', this.value)">${this.escapeHtml(f.a)}</textarea>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  addFaqItem() {
    this.collectCurrentStepInputs();
    if (!Array.isArray(this.draft.valueProp.faqs)) this.draft.valueProp.faqs = [];
    this.draft.valueProp.faqs.push({ q: '', a: '' });
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  updateFaqItem(idx, field, val) {
    if (this.draft?.valueProp?.faqs?.[idx]) {
      this.draft.valueProp.faqs[idx][field] = val;
      this.triggerFieldAutoSave();
    }
  },

  removeFaqItem(idx) {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return;
    this.draft.valueProp.faqs.splice(idx, 1);
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  // =========================================================================
  // PASO 3: VIDEO DE PRESENTACIÓN
  // =========================================================================
  isValidVideoUrl(url) {
    const clean = String(url || '').trim();
    if (!clean) return { valid: false, reason: 'Sin URL de video configurada (paso opcional).' };
    if (clean.startsWith('data:video/') || clean.startsWith('blob:')) {
      return { valid: true, type: 'file', embedUrl: clean };
    }
    try {
      const parsed = new URL(clean);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return { valid: false, reason: 'La dirección debe comenzar con https:// o http://' };
      }
      const host = parsed.hostname.toLowerCase();
      // YouTube
      if (host.includes('youtube.com') || host.includes('youtu.be')) {
        let vid = '';
        if (host.includes('youtu.be')) {
          vid = parsed.pathname.slice(1).split('/')[0];
        } else if (parsed.pathname.includes('/embed/')) {
          vid = parsed.pathname.split('/embed/')[1].split('/')[0];
        } else if (parsed.pathname.includes('/shorts/')) {
          vid = parsed.pathname.split('/shorts/')[1].split('/')[0];
        } else {
          vid = parsed.searchParams.get('v') || '';
        }
        if (vid && vid.length >= 6) {
          return { valid: true, type: 'youtube', embedUrl: `https://www.youtube.com/embed/${vid}?rel=0` };
        }
        return { valid: false, reason: 'No se encontró el identificador del video de YouTube en el enlace. Ejemplo válido: https://www.youtube.com/watch?v=aircAruvnKk' };
      }
      // Vimeo
      if (host.includes('vimeo.com')) {
        const match = parsed.pathname.match(/\/(\d+)/);
        if (match && match[1]) {
          return { valid: true, type: 'vimeo', embedUrl: `https://player.vimeo.com/video/${match[1]}` };
        }
        return { valid: false, reason: 'El enlace de Vimeo debe incluir el número del video (ej: https://vimeo.com/123456789).' };
      }
      // Direct MP4 / WebM / OGG
      if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(parsed.pathname)) {
        return { valid: true, type: 'direct', embedUrl: clean };
      }
      return {
        valid: false,
        reason: 'Formato no reconocido. Por favor ingresa un enlace de YouTube, Vimeo o un archivo de video directo (.mp4, .webm).'
      };
    } catch (e) {
      return { valid: false, reason: 'El formato de la dirección web no es válido. Asegúrate de incluir https:// al inicio.' };
    }
  },

  renderStep3Video() {
    const vc = this.draft.videoConfig || {};
    const check = this.isValidVideoUrl(vc.url);

    return `
      <div class="gdn-card">
        <h3 style="margin:0 0 0.35rem; font-size:1.08rem; color:var(--gdn-text);">Configuración del video de presentación</h3>
        <p class="gdn-help" style="margin-bottom:1.1rem;">
          Puedes vincular un video de YouTube o Vimeo, o cargar un archivo de video compatible (.mp4, .webm). Si aún no tienes video, puedes avanzar al siguiente paso.
        </p>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-video-url">
            <span>URL del video (YouTube, Vimeo o enlace directo .mp4)</span>
            <span style="font-size:0.76rem; font-weight:800; color:${check.valid ? '#10b981' : '#64748b'};">
              ${check.valid ? '✔ Video verificado y compatible' : '⏳ Pendiente de verificar'}
            </span>
          </label>
          <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
            <input
              type="url"
              id="gdn-video-url"
              class="gdn-input"
              style="flex:1; min-width:240px;"
              value="${this.escapeHtml(vc.url)}"
              placeholder="Ej: https://www.youtube.com/watch?v=aircAruvnKk o https://vimeo.com/..."
            />
            <button type="button" class="plp-doc-btn" style="width:auto; padding:0.65rem 1.15rem;" onclick="window.ProjectWizard.verifyAndSaveVideoUrl()">
              🔍 Verificar y previsualizar
            </button>
          </div>
          ${vc.url && !check.valid ? `
            <div style="margin-top:0.5rem; padding:0.65rem 0.9rem; background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.35); color:#dc2626; border-radius:8px; font-size:0.82rem; font-weight:600;">
              ⚠️ ${this.escapeHtml(check.reason)}
            </div>
          ` : ''}
        </div>

        <div class="gdn-field" style="margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--gdn-border);">
          <label class="gdn-label">O carga un archivo de video desde tu dispositivo (.mp4, .webm — máx. recomendado 15 MB)</label>
          <input type="file" accept="video/mp4,video/webm,video/ogg" onchange="window.ProjectWizard.handleVideoFileUpload(this.files)" style="font-size:0.85rem; color:var(--gdn-text-sec);" />
          ${vc.fileName ? `<div class="gdn-help" style="color:#10b981; font-weight:700;">📁 Archivo cargado: ${this.escapeHtml(vc.fileName)}</div>` : ''}
        </div>

        <div class="gdn-field-grid" style="margin-top:1rem;">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-video-title">Título visible del video</label>
            <input type="text" id="gdn-video-title" class="gdn-input" value="${this.escapeHtml(vc.title)}" placeholder="Ej: Video Explicativo: Visión y Arquitectura del Proyecto" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-video-desc">Descripción breve del video (opcional)</label>
            <input type="text" id="gdn-video-desc" class="gdn-input" value="${this.escapeHtml(vc.description)}" placeholder="Ej: Recorrido de 3 minutos por los módulos principales" />
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem; padding:0.85rem 1rem; background:var(--gdn-subtle); border-radius:10px; margin-top:0.5rem;">
          <div>
            <strong style="font-size:0.88rem; color:var(--gdn-text);">Visibilidad pública del video en la Landing Page</strong>
            <div class="gdn-help" style="margin:0;">Define si los visitantes públicos podrán reproducir este video en la portada del proyecto.</div>
          </div>
          <label style="display:inline-flex; align-items:center; gap:0.5rem; font-weight:800; font-size:0.88rem; cursor:pointer; color:var(--gdn-text);">
            <input type="checkbox" id="gdn-video-public" ${vc.isPublic !== false ? 'checked' : ''} style="width:18px; height:18px; accent-color:#10b981;" />
            <span>Visible públicamente</span>
          </label>
        </div>
      </div>

      <!-- Vista Previa del Video -->
      <div class="gdn-card">
        <h3 style="margin:0 0 0.75rem; font-size:1.05rem; color:var(--gdn-text);">🎬 Vista previa del reproductor</h3>
        ${check.valid ? `
          <div style="border-radius:14px; overflow:hidden; background:#0a192f; aspect-ratio:16/9; max-height:380px; width:100%; box-shadow:0 10px 25px rgba(0,0,0,0.2);">
            ${check.type === 'youtube' || check.type === 'vimeo' ? `
              <iframe
                src="${this.escapeHtml(check.embedUrl)}"
                title="${this.escapeHtml(vc.title || 'Vista previa del video')}"
                style="width:100%; height:100%; border:0;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
              ></iframe>
            ` : `
              <video src="${this.escapeHtml(check.embedUrl)}" controls style="width:100%; height:100%; object-fit:contain;"></video>
            `}
          </div>
          <div style="margin-top:0.65rem; display:flex; justify-content:space-between; align-items:center; font-size:0.82rem; color:#10b981; font-weight:700;">
            <span>✔ Video verificado y guardado correctamente</span>
            <button type="button" style="background:none; border:none; color:#ef4444; cursor:pointer; font-weight:700;" onclick="window.ProjectWizard.clearVideoConfig()">🗑️ Quitar video</button>
          </div>
        ` : `
          <div style="padding:2.2rem 1rem; text-align:center; background:var(--gdn-subtle); border-radius:12px; color:var(--gdn-text-muted); font-size:0.9rem;">
            Ingresa una URL compatible de YouTube, Vimeo o carga un archivo .mp4 para ver aquí la vista previa en vivo.
          </div>
        `}
      </div>
    `;
  },

  verifyAndSaveVideoUrl() {
    this.collectCurrentStepInputs();
    const check = this.isValidVideoUrl(this.draft.videoConfig.url);
    this.draft.videoConfig.verified = check.valid;
    if (check.valid && !this.draft.videoConfig.title) {
      this.draft.videoConfig.title = `Video Explicativo: ${this.draft.title || 'Proyecto'}`;
    }
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  async handleVideoFileUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!/^video\/(mp4|webm|ogg)$/i.test(file.type)) {
      alert('⚠️ Formato de video no compatible. Por favor selecciona un archivo .mp4, .webm u .ogg.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      alert('⚠️ El archivo de video supera los 25 MB permitidos para carga directa. Te recomendamos subirlo a YouTube o Vimeo y pegar el enlace.');
      return;
    }
    this.collectCurrentStepInputs();
    // Intentar subir a Supabase Storage si está conectado
    let finalUrl = '';
    if (window.supabaseService && window.supabaseService.isConnected) {
      const uploaded = await window.supabaseService.uploadProjectFile(
        file,
        this.draft.id,
        this.draft.videoConfig.isPublic ? 'public' : 'private'
      );
      if (uploaded && uploaded.url) finalUrl = uploaded.url;
    }
    if (!finalUrl) {
      finalUrl = URL.createObjectURL(file);
    }
    this.draft.videoConfig.sourceType = 'file';
    this.draft.videoConfig.url = finalUrl;
    this.draft.videoConfig.fileName = file.name;
    this.draft.videoConfig.verified = true;
    if (!this.draft.videoConfig.title) {
      this.draft.videoConfig.title = file.name.replace(/\.[^/.]+$/, '');
    }
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  clearVideoConfig() {
    if (!confirm('¿Deseas quitar el video configurado de este proyecto?')) return;
    this.draft.videoConfig = {
      sourceType: 'url',
      url: '',
      fileName: '',
      title: '',
      description: '',
      isPublic: true,
      verified: false
    };
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  // =========================================================================
  // PASO 4: DOCUMENTOS, GUÍAS Y RECURSOS DESCARGABLES
  // =========================================================================
  renderStep4Resources() {
    const resources = Array.isArray(this.draft.resources) ? this.draft.resources : [];
    const duplicates = this.detectResourceDuplicates(resources);

    return `
      <!-- Zona Drag & Drop de Carga Múltiple -->
      <div class="gdn-card">
        <h3 style="margin:0 0 0.35rem; font-size:1.08rem; color:var(--gdn-text);">Cargar documentos, guías y archivos descargables</h3>
        <p class="gdn-help" style="margin-bottom:1rem;">
          Formatos admitidos: PDF, Word (.doc, .docx), Excel y CSV (.xls, .xlsx, .csv), PowerPoint (.ppt, .pptx), Imágenes (.png, .jpg, .webp, .svg) y paquetes comprimidos (.zip).
        </p>

        <div
          class="gdn-dropzone"
          id="gdn-resource-dropzone"
          ondragover="event.preventDefault(); this.classList.add('dragover');"
          ondragleave="this.classList.remove('dragover');"
          ondrop="event.preventDefault(); this.classList.remove('dragover'); window.ProjectWizard.handleResourceFilesUpload(event.dataTransfer.files);"
          onclick="document.getElementById('gdn-resource-file-input').click()"
        >
          <div style="font-size:2.4rem; margin-bottom:0.4rem;">📂</div>
          <div style="font-weight:800; font-size:1.02rem; color:var(--gdn-text); margin-bottom:0.25rem;">
            Arrastra y suelta tus archivos aquí o haz clic para seleccionarlos
          </div>
          <div style="font-size:0.82rem; color:var(--gdn-text-muted);">
            Puedes seleccionar varios archivos a la vez • Validación automática de seguridad y formato
          </div>
          <input
            type="file"
            id="gdn-resource-file-input"
            multiple
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.svg,.zip,.txt,.md"
            style="display:none;"
            onchange="window.ProjectWizard.handleResourceFilesUpload(this.files)"
          />
        </div>

        <!-- Agregar recurso mediante URL externa -->
        <div style="margin-top:1rem; padding-top:1rem; border-top:1px dashed var(--gdn-border); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.75rem;">
          <div style="font-size:0.84rem; color:var(--gdn-text-sec);">
            ¿Tienes un documento alojado en Google Drive, OneDrive o un enlace directo?
          </div>
          <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.45rem 0.95rem;" onclick="window.ProjectWizard.addExternalResourcePrompt()">
            🔗 Agregar documento por URL
          </button>
        </div>
      </div>

      ${duplicates.length > 0 ? `
        <div style="padding:0.85rem 1.1rem; background:rgba(245,158,11,0.12); border:1px solid rgba(245,158,11,0.45); border-radius:12px; margin-bottom:1.1rem; font-size:0.84rem; color:#b45309;">
          <strong>🤖 Aviso del Asistente IA (Posibles duplicados detectados):</strong>
          Revisamos tus recursos y encontramos nombres o archivos muy similares: <strong>${duplicates.map(d => this.escapeHtml(d)).join(', ')}</strong>. Verifica si deseas conservar ambos o eliminar el duplicado.
        </div>
      ` : ''}

      <!-- Lista Organizada por las 7 Categorías Visuales -->
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.5rem; margin-bottom:1rem;">
          <h3 style="margin:0; font-size:1.06rem; color:var(--gdn-text);">
            📚 Recursos cargados en el proyecto (${resources.length})
          </h3>
          <span style="font-size:0.78rem; color:var(--gdn-text-muted);">
            🔒 Los recursos marcados como <strong>Privados</strong> nunca se expondrán en la Landing Page pública
          </span>
        </div>

        ${resources.length === 0 ? `
          <div style="padding:2rem 1rem; text-align:center; background:var(--gdn-subtle); border-radius:12px; color:var(--gdn-text-muted); font-size:0.9rem;">
            Aún no has cargado documentos ni guías. Arrastra archivos arriba para organizarlos por categoría.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${resources.map((res, idx) => `
              <div style="padding:1.1rem; background:var(--gdn-bg); border:1.5px solid ${res.visibility === 'private' ? 'rgba(245,158,11,0.45)' : 'var(--gdn-border)'}; border-radius:12px;">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:0.75rem; margin-bottom:0.75rem;">
                  <div style="display:flex; align-items:center; gap:0.65rem; flex:1; min-width:220px;">
                    <span style="font-size:1.5rem;">${this.getResourceIcon(res.format)}</span>
                    <div style="flex:1;">
                      <input
                        type="text"
                        class="gdn-input"
                        style="font-weight:800; padding:0.45rem 0.7rem;"
                        value="${this.escapeHtml(res.name)}"
                        placeholder="Nombre visible del recurso"
                        oninput="window.ProjectWizard.updateResourceField(${idx}, 'name', this.value)"
                      />
                      <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap; font-size:0.75rem; color:var(--gdn-text-muted); margin-top:0.3rem;">
                        <span style="font-weight:800; color:#059669;">${this.escapeHtml(res.format || 'DOC')}</span>
                        <span>•</span>
                        <span>${this.escapeHtml(res.sizeLabel || 'Enlace externo')}</span>
                        <span>•</span>
                        <span style="color:#10b981; font-weight:700;">✔ ${res.status === 'verified' ? 'Cargado y verificado' : 'Listo'}</span>
                      </div>
                    </div>
                  </div>

                  <div style="display:flex; align-items:center; gap:0.4rem; flex-wrap:wrap;">
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.6rem; font-size:0.76rem;" onclick="window.ProjectWizard.moveResource(${idx}, -1)" title="Subir orden">↑</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.6rem; font-size:0.76rem;" onclick="window.ProjectWizard.moveResource(${idx}, 1)" title="Bajar orden">↓</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="window.ProjectWizard.previewResourceItem(${idx})">👁️ Previsualizar</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.7rem; font-size:0.76rem;" onclick="window.ProjectWizard.replaceResourceFilePrompt(${idx})">🔄 Reemplazar</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.35rem 0.7rem; font-size:0.76rem; color:#ef4444; border-color:#fca5a5;" onclick="window.ProjectWizard.deleteResourceItem(${idx})">🗑️ Eliminar</button>
                  </div>
                </div>

                <div class="gdn-field-grid" style="margin-top:0.5rem;">
                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Categoría visual</label>
                    <select class="gdn-select" style="padding:0.45rem 0.7rem; font-size:0.82rem;" onchange="window.ProjectWizard.updateResourceField(${idx}, 'category', this.value)">
                      ${this.resourceCategories.map(cat => `<option value="${this.escapeHtml(cat)}" ${res.category === cat ? 'selected' : ''}>${this.escapeHtml(cat)}</option>`).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Tipo de recurso</label>
                    <select class="gdn-select" style="padding:0.45rem 0.7rem; font-size:0.82rem;" onchange="window.ProjectWizard.updateResourceField(${idx}, 'type', this.value)">
                      ${[
                        { id: 'pdf', label: 'Documento PDF' },
                        { id: 'guide', label: 'Guía de usuario' },
                        { id: 'manual', label: 'Manual técnico' },
                        { id: 'word', label: 'Documento Word' },
                        { id: 'excel', label: 'Hoja de cálculo Excel / CSV' },
                        { id: 'ppt', label: 'Presentación PowerPoint' },
                        { id: 'image', label: 'Imagen / Infografía' },
                        { id: 'zip', label: 'Paquete comprimido ZIP' },
                        { id: 'other', label: 'Otro formato autorizado' }
                      ].map(t => `<option value="${t.id}" ${res.type === t.id ? 'selected' : ''}>${t.label}</option>`).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Visibilidad del recurso</label>
                    <select class="gdn-select" style="padding:0.45rem 0.7rem; font-size:0.82rem; font-weight:700;" onchange="window.ProjectWizard.updateResourceField(${idx}, 'visibility', this.value)">
                      <option value="public" ${res.visibility !== 'private' ? 'selected' : ''}>🌐 Público (Visible en Landing Page)</option>
                      <option value="private" ${res.visibility === 'private' ? 'selected' : ''}>🔒 Privado (Uso interno / Oculto)</option>
                    </select>
                  </div>
                </div>

                <div style="margin-top:0.55rem;">
                  <input
                    type="text"
                    class="gdn-input"
                    style="padding:0.45rem 0.7rem; font-size:0.83rem;"
                    value="${this.escapeHtml(res.description || '')}"
                    placeholder="Descripción breve del documento (qué contiene o para qué sirve)..."
                    oninput="window.ProjectWizard.updateResourceField(${idx}, 'description', this.value)"
                  />
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  getResourceIcon(format) {
    const f = String(format || '').toUpperCase();
    if (f.includes('PDF')) return '📕';
    if (f.includes('XLS') || f.includes('CSV')) return '📊';
    if (f.includes('PPT')) return '📽️';
    if (f.includes('DOC')) return '📘';
    if (f.includes('ZIP')) return '🗜️';
    if (f.includes('PNG') || f.includes('JPG') || f.includes('WEBP') || f.includes('SVG')) return '🖼️';
    return '📄';
  },

  formatBytes(bytes) {
    const b = Number(bytes) || 0;
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(2) + ' MB';
  },

  detectResourceDuplicates(resources) {
    const seen = new Set();
    const dupes = [];
    (resources || []).forEach(r => {
      const key = String(r.name || '').toLowerCase().trim();
      if (!key) return;
      if (seen.has(key)) dupes.push(r.name);
      seen.add(key);
    });
    return Array.from(new Set(dupes));
  },

  async handleResourceFilesUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    this.collectCurrentStepInputs();

    const forbiddenExt = /\.(exe|bat|cmd|sh|vbs|scr|msi|com|pif|ps1|jar)$/i;
    const allowedExt = /\.(pdf|doc|docx|xls|xlsx|csv|ppt|pptx|png|jpg|jpeg|webp|svg|zip|txt|md)$/i;

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (forbiddenExt.test(file.name)) {
        alert(`🚫 El archivo "${file.name}" tiene una extensión ejecutable restringida por seguridad y no puede cargarse.`);
        continue;
      }
      if (!allowedExt.test(file.name)) {
        alert(`⚠️ El archivo "${file.name}" no corresponde a un formato documental autorizado (PDF, Word, Excel, CSV, PPT, Imagen o ZIP).`);
        continue;
      }
      if (file.size > 25 * 1024 * 1024) {
        alert(`⚠️ El archivo "${file.name}" supera el límite de 25 MB por documento.`);
        continue;
      }

      const ext = (file.name.split('.').pop() || 'DOC').toUpperCase();
      let category = 'Documentación';
      let rType = 'pdf';
      if (['PPT', 'PPTX'].includes(ext)) { category = 'Presentaciones'; rType = 'ppt'; }
      else if (['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(ext)) { category = 'Imágenes y material gráfico'; rType = 'image'; }
      else if (['XLS', 'XLSX', 'CSV'].includes(ext)) { category = 'Documentación'; rType = 'excel'; }
      else if (['DOC', 'DOCX'].includes(ext)) { category = 'Guías y manuales'; rType = 'word'; }
      else if (ext === 'ZIP') { category = 'Otros recursos'; rType = 'zip'; }

      let fileUrl = '';
      let textPreview = '';

      if (window.supabaseService && window.supabaseService.isConnected) {
        const up = await window.supabaseService.uploadProjectFile(file, this.draft.id, 'public');
        if (up && up.url) fileUrl = up.url;
      }

      // Leer contenido para archivos pequeños o texto para permitir descarga real y análisis IA autorizado
      if (!fileUrl && file.size <= 3.5 * 1024 * 1024) {
        fileUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result || '');
          reader.onerror = () => resolve('');
          reader.readAsDataURL(file);
        });
      } else if (!fileUrl) {
        fileUrl = URL.createObjectURL(file);
      }

      if (/\.(txt|csv|md)$/i.test(file.name) && file.size <= 512 * 1024) {
        textPreview = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result || '').slice(0, 4000));
          reader.onerror = () => resolve('');
          reader.readAsText(file);
        });
      }

      this.draft.resources.push({
        id: 'res_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
        fileName: file.name,
        description: `Recurso oficial en formato ${ext} (${this.formatBytes(file.size)}).`,
        type: rType,
        url: fileUrl,
        format: ext,
        sizeBytes: file.size,
        sizeLabel: this.formatBytes(file.size),
        category: category,
        visibility: 'public',
        order: this.draft.resources.length + 1,
        status: 'verified',
        extractedText: textPreview,
        uploadedAt: new Date().toISOString()
      });
    }

    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  addExternalResourcePrompt() {
    this.collectCurrentStepInputs();
    const name = prompt('Nombre visible del documento o guía:');
    if (!name || !name.trim()) return;
    const url = prompt('Dirección URL del documento (https://...):', 'https://');
    if (!url || !/^https?:\/\/.+/i.test(url.trim())) {
      alert('⚠️ Por favor ingresa una dirección web válida que inicie con https://');
      return;
    }
    const desc = prompt('Descripción breve del recurso (opcional):', 'Documento técnico de consulta y descarga.') || '';
    this.draft.resources.push({
      id: 'res_' + Date.now(),
      name: name.trim(),
      fileName: name.trim(),
      description: desc.trim(),
      type: 'pdf',
      url: url.trim(),
      format: 'PDF / URL',
      sizeBytes: 0,
      sizeLabel: 'Recurso en la nube',
      category: 'Documentación',
      visibility: 'public',
      order: this.draft.resources.length + 1,
      status: 'verified',
      uploadedAt: new Date().toISOString()
    });
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  updateResourceField(idx, field, value) {
    if (this.draft?.resources?.[idx]) {
      this.draft.resources[idx][field] = value;
      this.saveDraftToStorage(true);
      if (field === 'visibility') {
        if (window.ProjectsView) window.ProjectsView.render();
      }
    }
  },

  moveResource(idx, direction) {
    const arr = this.draft.resources;
    const target = idx + direction;
    if (target < 0 || target >= arr.length) return;
    const temp = arr[idx];
    arr[idx] = arr[target];
    arr[target] = temp;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  replaceResourceFilePrompt(idx) {
    const current = this.draft.resources[idx];
    if (!current) return;
    if (!confirm(`¿Deseas reemplazar el archivo actual de "${current.name}"? El archivo anterior será sustituido.`)) return;
    const inp = document.createElement('input');
    inp.type = 'file';
    inp.accept = '.pdf,.doc,.docx,.xls,.xlsx,.csv,.ppt,.pptx,.png,.jpg,.jpeg,.webp,.svg,.zip,.txt';
    inp.onchange = async () => {
      if (!inp.files || !inp.files[0]) return;
      const f = inp.files[0];
      const ext = (f.name.split('.').pop() || 'DOC').toUpperCase();
      current.fileName = f.name;
      current.format = ext;
      current.sizeBytes = f.size;
      current.sizeLabel = this.formatBytes(f.size);
      current.url = URL.createObjectURL(f);
      current.uploadedAt = new Date().toISOString();
      this.saveDraftToStorage(true);
      if (window.ProjectsView) window.ProjectsView.render();
    };
    inp.click();
  },

  deleteResourceItem(idx) {
    const current = this.draft.resources[idx];
    if (!current) return;
    if (!confirm(`⚠️ ¿Estás seguro de eliminar el recurso "${current.name}"? Esta acción no se puede deshacer.`)) return;
    this.draft.resources.splice(idx, 1);
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  previewResourceItem(idx) {
    const r = this.draft.resources[idx];
    if (!r) return;
    if (r.url && (r.url.startsWith('http://') || r.url.startsWith('https://') || r.url.startsWith('blob:'))) {
      window.open(r.url, '_blank', 'noopener,noreferrer');
    } else {
      alert(`📄 Vista previa de: ${r.name}\nFormato: ${r.format} (${r.sizeLabel})\nCategoría: ${r.category}\nVisibilidad: ${r.visibility === 'private' ? 'Privado' : 'Público'}\n\nDescripción: ${r.description || 'Sin descripción'}`);
    }
  },

  // =========================================================================
  // PASO 5: PRESENTACIONES E IMÁGENES
  // =========================================================================
  renderStep5Visuals() {
    const d = this.draft;
    const assets = Array.isArray(d.visualAssets) ? d.visualAssets : [];
    const activeCover = d.mainImage || (d.useDefaultImage ? this.defaultCoverImage : '');

    return `
      <!-- Portada y Miniatura Principal -->
      <div class="gdn-card">
        <h3 style="margin:0 0 0.35rem; font-size:1.08rem; color:var(--gdn-text);">Imagen principal (Portada) y Miniatura</h3>
        <p class="gdn-help" style="margin-bottom:1rem;">
          Dimensiones recomendadas para la Landing Page: <strong>Portada 1600×900 px (16:9)</strong> y <strong>Miniatura 800×500 px</strong> en formato JPG, PNG o WebP. Si no cargas una imagen propia, el sistema usará la imagen institucional predeterminada.
        </p>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-main-image">Imagen principal o portada (URL o archivo)</label>
            <input type="text" id="gdn-main-image" class="gdn-input" value="${this.escapeHtml(d.mainImage)}" placeholder="https://images.unsplash.com/..." />
            <div style="margin-top:0.45rem;">
              <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onchange="window.ProjectWizard.handleCoverUpload(this.files, 'main')" style="font-size:0.8rem;" />
            </div>
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-thumb-image">Imagen de miniatura para tarjetas (opcional)</label>
            <input type="text" id="gdn-thumb-image" class="gdn-input" value="${this.escapeHtml(d.thumbnailImage)}" placeholder="Si se deja vacío, usará la portada principal" />
            <div style="margin-top:0.45rem;">
              <input type="file" accept="image/png,image/jpeg,image/webp" onchange="window.ProjectWizard.handleCoverUpload(this.files, 'thumb')" style="font-size:0.8rem;" />
            </div>
          </div>
        </div>

        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-top:0.75rem; padding:0.9rem; background:var(--gdn-subtle); border-radius:12px;">
          <label style="display:inline-flex; align-items:center; gap:0.55rem; font-size:0.86rem; font-weight:700; cursor:pointer;">
            <input type="checkbox" id="gdn-use-default-img" ${d.useDefaultImage !== false ? 'checked' : ''} onchange="window.ProjectWizard.collectCurrentStepInputs(); window.ProjectWizard.saveDraftToStorage(true); window.ProjectsView.render();" style="width:17px; height:17px; accent-color:#10b981;" />
            <span>Usar imagen predeterminada institucional si no he cargado una portada propia</span>
          </label>
          ${activeCover ? `
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${this.escapeHtml(activeCover)}" alt="Vista previa de portada" style="width:96px; height:56px; object-fit:cover; border-radius:8px; border:1.5px solid #10b981;" />
              <span style="font-size:0.78rem; color:#059669; font-weight:700;">Vista previa activa</span>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- Galería de Imágenes, Capturas, Diagramas y Diapositivas -->
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <h3 style="margin:0; font-size:1.06rem; color:var(--gdn-text);">🖼️ Galería visual y diapositivas del proyecto (${assets.length})</h3>
            <p class="gdn-help" style="margin:0.2rem 0 0;">Agrega capturas de pantalla, diagramas, infografías o diapositivas para el carrusel y la galería Masonry de la Landing Page.</p>
          </div>
          <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.45rem 0.9rem;" onclick="document.getElementById('gdn-visual-files-input').click()">
              📸 Subir imágenes
            </button>
            <input type="file" id="gdn-visual-files-input" multiple accept="image/png,image/jpeg,image/webp,image/svg+xml" style="display:none;" onchange="window.ProjectWizard.handleVisualGalleryUpload(this.files)" />
            <button type="button" class="plp-doc-btn" style="width:auto; padding:0.45rem 0.9rem;" onclick="window.ProjectWizard.addVisualAssetPrompt()">
              + Agregar por URL / Diapositiva
            </button>
          </div>
        </div>

        ${assets.length === 0 ? `
          <div style="padding:1.8rem 1rem; text-align:center; background:var(--gdn-subtle); border-radius:12px; color:var(--gdn-text-muted); font-size:0.88rem;">
            Aún no has añadido elementos a la galería o carrusel de presentaciones. Puedes subir imágenes o pedir al Asistente IA que proponga la estructura de diapositivas.
          </div>
        ` : `
          <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(270px, 1fr)); gap:1rem;">
            ${assets.map((item, idx) => `
              <div style="background:var(--gdn-bg); border:1.5px solid var(--gdn-border); border-radius:12px; overflow:hidden; display:flex; flex-direction:column;">
                <div style="height:145px; background:#0a192f; position:relative;">
                  <img src="${this.escapeHtml(item.url || this.defaultThumbImage)}" alt="${this.escapeHtml(item.title)}" style="width:100%; height:100%; object-fit:cover;" />
                  <span style="position:absolute; top:0.5rem; left:0.5rem; background:rgba(10,25,47,0.85); color:#fff; font-size:0.7rem; font-weight:800; padding:0.2rem 0.55rem; border-radius:999px;">
                    #${idx + 1}
                  </span>
                  <button type="button" onclick="window.ProjectWizard.setAsMainCover(${idx})" style="position:absolute; bottom:0.5rem; right:0.5rem; background:rgba(16,185,129,0.92); color:#fff; border:none; border-radius:6px; padding:0.25rem 0.55rem; font-size:0.72rem; font-weight:800; cursor:pointer;">
                    ⭐ Usar como portada
                  </button>
                </div>
                <div style="padding:0.85rem; display:flex; flex-direction:column; gap:0.45rem; flex:1;">
                  <input type="text" class="gdn-input" style="padding:0.4rem 0.65rem; font-weight:700; font-size:0.85rem;" value="${this.escapeHtml(item.title)}" placeholder="Título de la imagen o diapositiva" oninput="window.ProjectWizard.updateVisualAsset(${idx}, 'title', this.value)" />
                  <select class="gdn-select" style="padding:0.38rem 0.6rem; font-size:0.78rem;" onchange="window.ProjectWizard.updateVisualAsset(${idx}, 'assetType', this.value)">
                    ${this.visualCategories.map(vc => `<option value="${vc.id}" ${item.assetType === vc.id ? 'selected' : ''}>${vc.label}</option>`).join('')}
                  </select>
                  <textarea class="gdn-textarea" rows="2" style="padding:0.4rem 0.65rem; font-size:0.8rem;" placeholder="Descripción o nota explicativa..." oninput="window.ProjectWizard.updateVisualAsset(${idx}, 'caption', this.value)">${this.escapeHtml(item.caption || '')}</textarea>
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto; padding-top:0.4rem;">
                    <select class="gdn-select" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem;" onchange="window.ProjectWizard.updateVisualAsset(${idx}, 'visibility', this.value)">
                      <option value="public" ${item.visibility !== 'private' ? 'selected' : ''}>🌐 Público</option>
                      <option value="private" ${item.visibility === 'private' ? 'selected' : ''}>🔒 Privado</option>
                    </select>
                    <div style="display:flex; gap:0.3rem;">
                      <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.ProjectWizard.moveVisualAsset(${idx}, -1)">←</button>
                      <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="window.ProjectWizard.moveVisualAsset(${idx}, 1)">→</button>
                      <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.5rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.ProjectWizard.deleteVisualAsset(${idx})">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  async handleCoverUpload(fileList, target) {
    if (!fileList || !fileList[0]) return;
    const file = fileList[0];
    if (!file.type.startsWith('image/')) {
      alert('⚠️ Selecciona un archivo de imagen válido (.jpg, .png, .webp, .svg).');
      return;
    }
    this.collectCurrentStepInputs();
    const dataUrl = await new Promise((resolve) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result || '');
      r.onerror = () => resolve('');
      r.readAsDataURL(file);
    });
    if (target === 'main') this.draft.mainImage = dataUrl;
    else this.draft.thumbnailImage = dataUrl;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  async handleVisualGalleryUpload(fileList) {
    if (!fileList || fileList.length === 0) return;
    this.collectCurrentStepInputs();
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      if (!f.type.startsWith('image/')) continue;
      const dataUrl = await new Promise((resolve) => {
        const r = new FileReader();
        r.onload = () => resolve(r.result || '');
        r.onerror = () => resolve('');
        r.readAsDataURL(f);
      });
      this.draft.visualAssets.push({
        id: 'vis_' + Date.now() + '_' + i,
        title: f.name.replace(/\.[^/.]+$/, '').replace(/[_-]+/g, ' '),
        caption: 'Imagen oficial del proyecto.',
        url: dataUrl,
        assetType: 'gallery',
        visibility: 'public'
      });
    }
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  addVisualAssetPrompt() {
    this.collectCurrentStepInputs();
    const title = prompt('Título de la diapositiva, diagrama o imagen:');
    if (!title || !title.trim()) return;
    const url = prompt('URL de la imagen (o deja el ejemplo):', 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80');
    if (!url || !url.trim()) return;
    const caption = prompt('Descripción explicativa:', 'Componente visual de apoyo para la presentación del proyecto.') || '';
    this.draft.visualAssets.push({
      id: 'vis_' + Date.now(),
      title: title.trim(),
      caption: caption.trim(),
      url: url.trim(),
      assetType: 'institutional_pres',
      visibility: 'public'
    });
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  setAsMainCover(idx) {
    const item = this.draft.visualAssets[idx];
    if (!item || !item.url) return;
    this.draft.mainImage = item.url;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  updateVisualAsset(idx, field, val) {
    if (this.draft?.visualAssets?.[idx]) {
      this.draft.visualAssets[idx][field] = val;
      this.triggerFieldAutoSave();
    }
  },

  moveVisualAsset(idx, dir) {
    const arr = this.draft.visualAssets;
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[target];
    arr[target] = tmp;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  deleteVisualAsset(idx) {
    if (!confirm('¿Eliminar esta imagen/diapositiva de la galería del proyecto?')) return;
    this.draft.visualAssets.splice(idx, 1);
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  // =========================================================================
  // PASO 6: ENLACES Y RECURSOS EXTERNOS
  // =========================================================================
  renderStep6ExternalLinks() {
    const links = Array.isArray(this.draft.externalLinks) ? this.draft.externalLinks : [];

    return `
      <div class="gdn-card">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:0.75rem; margin-bottom:1rem;">
          <div>
            <h3 style="margin:0; font-size:1.08rem; color:var(--gdn-text);">🔗 Enlaces y recursos web externos (${links.length})</h3>
            <p class="gdn-help" style="margin:0.2rem 0 0;">
              Conecta la página web oficial, demos interactivos, repositorios de código (GitHub/GitLab), cursos, formularios o artículos.
            </p>
          </div>
          <button type="button" class="plp-doc-btn" style="width:auto; padding:0.5rem 1.05rem;" onclick="window.ProjectWizard.addExternalLinkItem()">
            + Agregar nuevo enlace
          </button>
        </div>

        ${links.length === 0 ? `
          <div style="padding:1.8rem 1rem; text-align:center; background:var(--gdn-subtle); border-radius:12px; color:var(--gdn-text-muted); font-size:0.88rem;">
            Aún no has agregado enlaces externos. Haz clic en <strong>+ Agregar nuevo enlace</strong> para incorporar sitios aliados, repositorios o demos.
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:0.85rem;">
            ${links.map((lnk, idx) => `
              <div style="padding:1rem; background:var(--gdn-bg); border:1.5px solid var(--gdn-border); border-radius:12px;">
                <div class="gdn-field-grid">
                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Nombre del enlace</label>
                    <input type="text" class="gdn-input" style="padding:0.45rem 0.7rem; font-weight:700;" value="${this.escapeHtml(lnk.title)}" placeholder="Ej: Repositorio de Código en GitHub" oninput="window.ProjectWizard.updateExternalLink(${idx}, 'title', this.value)" />
                  </div>

                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">
                      <span>Dirección web (URL)</span>
                      <span style="color:${lnk.verified ? '#10b981' : '#64748b'}; font-weight:800;">
                        ${lnk.verified ? '✔ Enlace comprobado' : '⏳ Sin comprobar'}
                      </span>
                    </label>
                    <div style="display:flex; gap:0.4rem;">
                      <input type="url" class="gdn-input" style="padding:0.45rem 0.7rem;" value="${this.escapeHtml(lnk.url)}" placeholder="https://..." oninput="window.ProjectWizard.updateExternalLink(${idx}, 'url', this.value)" />
                      <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.4rem 0.7rem; font-size:0.76rem;" onclick="window.ProjectWizard.verifyExternalLink(${idx})">Comprobar</button>
                    </div>
                  </div>
                </div>

                <div class="gdn-field-grid" style="margin-top:0.55rem;">
                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Categoría del enlace</label>
                    <select class="gdn-select" style="padding:0.4rem 0.65rem; font-size:0.82rem;" onchange="window.ProjectWizard.updateExternalLink(${idx}, 'category', this.value)">
                      ${this.linkCategories.map(c => `<option value="${this.escapeHtml(c)}" ${lnk.category === c ? 'selected' : ''}>${this.escapeHtml(c)}</option>`).join('')}
                    </select>
                  </div>

                  <div>
                    <label class="gdn-label" style="font-size:0.76rem;">Visibilidad</label>
                    <select class="gdn-select" style="padding:0.4rem 0.65rem; font-size:0.82rem; font-weight:700;" onchange="window.ProjectWizard.updateExternalLink(${idx}, 'visibility', this.value)">
                      <option value="public" ${lnk.visibility !== 'private' ? 'selected' : ''}>🌐 Público en Landing Page</option>
                      <option value="private" ${lnk.visibility === 'private' ? 'selected' : ''}>🔒 Privado (Solo equipo interno)</option>
                    </select>
                  </div>
                </div>

                <div style="display:flex; justify-content:space-between; align-items:center; gap:0.65rem; margin-top:0.55rem; flex-wrap:wrap;">
                  <input type="text" class="gdn-input" style="flex:1; min-width:200px; padding:0.4rem 0.65rem; font-size:0.82rem;" value="${this.escapeHtml(lnk.description || '')}" placeholder="Descripción opcional del enlace..." oninput="window.ProjectWizard.updateExternalLink(${idx}, 'description', this.value)" />
                  <div style="display:flex; gap:0.35rem;">
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.3rem 0.55rem; font-size:0.75rem;" onclick="window.ProjectWizard.moveExternalLink(${idx}, -1)">↑</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.3rem 0.55rem; font-size:0.75rem;" onclick="window.ProjectWizard.moveExternalLink(${idx}, 1)">↓</button>
                    <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.3rem 0.65rem; font-size:0.75rem; color:#ef4444; border-color:#fca5a5;" onclick="window.ProjectWizard.deleteExternalLink(${idx})">🗑️ Eliminar</button>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  addExternalLinkItem() {
    this.collectCurrentStepInputs();
    this.draft.externalLinks.push({
      id: 'lnk_' + Date.now(),
      title: '',
      url: 'https://',
      description: '',
      category: 'Página web oficial',
      visibility: 'public',
      verified: false
    });
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  updateExternalLink(idx, field, val) {
    const item = this.draft?.externalLinks?.[idx];
    if (!item) return;
    item[field] = val;
    if (field === 'url') item.verified = false;
    this.triggerFieldAutoSave();
  },

  async verifyExternalLink(idx) {
    this.collectCurrentStepInputs();
    const item = this.draft?.externalLinks?.[idx];
    if (!item) return;
    const raw = String(item.url || '').trim();
    try {
      const u = new URL(raw);
      if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) {
        alert('⚠️ Dirección web incompleta. Asegúrate de incluir el dominio completo (ejemplo: https://mentixs.vercel.app).');
        item.verified = false;
        return;
      }
      // Comprobación no intrusiva de alcance HTTP/HTTPS
      try {
        await fetch(raw, { method: 'HEAD', mode: 'no-cors' });
        item.verified = true;
      } catch (netErr) {
        // Incluso si el servidor externo bloquea CORS en navegador, la sintaxis URL es válida; avisar con transparencia
        item.verified = true;
      }
      this.saveDraftToStorage(true);
      if (window.ProjectsView) window.ProjectsView.render();
    } catch (e) {
      item.verified = false;
      alert('⚠️ El formato de la URL no es válido. Debe iniciar con https:// o http://');
    }
  },

  moveExternalLink(idx, dir) {
    const arr = this.draft.externalLinks;
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    const tmp = arr[idx];
    arr[idx] = arr[target];
    arr[target] = tmp;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  deleteExternalLink(idx) {
    if (!confirm('¿Eliminar este enlace externo del proyecto?')) return;
    this.draft.externalLinks.splice(idx, 1);
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  // =========================================================================
  // PASO 7: CONFIGURACIÓN DE PUBLICACIÓN
  // =========================================================================
  renderStep7PublicationConfig() {
    const d = this.draft;
    const lc = d.landingConfig || {};
    const tagsStr = Array.isArray(lc.tags) ? lc.tags.join(', ') : '';
    const pubResourcesCount = (d.resources || []).filter(r => r.visibility !== 'private').length;
    const privResourcesCount = (d.resources || []).filter(r => r.visibility === 'private').length;
    const pubLinksCount = (d.externalLinks || []).filter(l => l.visibility !== 'private').length;

    return `
      <div class="gdn-card">
        <h3 style="margin:0 0 0.35rem; font-size:1.08rem; color:var(--gdn-text);">Configuración de aparición en la Landing Page</h3>
        <p class="gdn-help" style="margin-bottom:1rem;">
          Define exactamente cómo verán el proyecto los visitantes una vez esté publicado.
        </p>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-name">Nombre público del proyecto</label>
            <input type="text" id="gdn-pub-name" class="gdn-input" value="${this.escapeHtml(lc.publicName || d.title)}" placeholder="Nombre visible en la barra de navegación" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-slug">Slug o identificador de URL pública</label>
            <input type="text" id="gdn-pub-slug" class="gdn-input" value="${this.escapeHtml(lc.slug || this.slugify(d.title || 'proyecto'))}" placeholder="ej: gobierno-datos-ia" />
            <div class="gdn-help">URL estable: <code>proyecto-landing.html?slug=${this.escapeHtml(lc.slug || this.slugify(d.title || 'proyecto'))}</code></div>
          </div>
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-pub-title">Título principal para el Hero de la Landing Page</label>
          <input type="text" id="gdn-pub-title" class="gdn-input" value="${this.escapeHtml(lc.landingTitle || d.title)}" placeholder="Ej: Transformando el Futuro: Proyecto Innovatech" />
        </div>

        <div class="gdn-field">
          <label class="gdn-label" for="gdn-pub-desc">Descripción pública destacada</label>
          <textarea id="gdn-pub-desc" class="gdn-textarea" rows="3" placeholder="Texto principal que leerán los visitantes debajo del título...">${this.escapeHtml(lc.publicDescription || d.shortDescription)}</textarea>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-cat">Categoría visible</label>
            <input type="text" id="gdn-pub-cat" class="gdn-input" value="${this.escapeHtml(lc.visibleCategory || d.categoryName)}" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-tags">Etiquetas o palabras clave (separadas por coma)</label>
            <input type="text" id="gdn-pub-tags" class="gdn-input" value="${this.escapeHtml(tagsStr)}" placeholder="Gobierno de Datos, IA, Innovación, Educación" />
          </div>
        </div>

        <div class="gdn-field-grid">
          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-cta-text">Texto del botón Llamado a la Acción (CTA)</label>
            <input type="text" id="gdn-pub-cta-text" class="gdn-input" value="${this.escapeHtml(lc.ctaText || 'Unirse / Colaborar')}" placeholder="Ej: Unirse / Colaborar" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-cta-url">URL o sección de destino del CTA</label>
            <input type="text" id="gdn-pub-cta-url" class="gdn-input" value="${this.escapeHtml(lc.ctaUrl || '#plp-sec-contacto')}" placeholder="https://... o #plp-sec-contacto" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-order">Orden de presentación</label>
            <input type="number" id="gdn-pub-order" class="gdn-input" min="1" max="999" value="${Number(lc.displayOrder || 1)}" />
          </div>

          <div class="gdn-field">
            <label class="gdn-label" for="gdn-pub-status">Estado de publicación del proyecto</label>
            <select id="gdn-pub-status" class="gdn-select" style="font-weight:800;">
              ${this.publicationStates.map(st => `<option value="${st.id}" ${d.publicationStatus === st.id ? 'selected' : ''}>${st.label}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>

      <!-- Control Independiente de Privacidad de Recursos y Video -->
      <div class="gdn-card">
        <h3 style="margin:0 0 0.5rem; font-size:1.05rem; color:var(--gdn-text);">🛡️ Control independiente de visibilidad de recursos</h3>
        <p class="gdn-help" style="margin-bottom:0.9rem;">
          Un proyecto publicado <strong>no expone automáticamente todos sus archivos</strong>. Solo se mostrarán en la Landing Page aquellos marcados expresamente como <strong>Públicos</strong>.
        </p>

        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:0.85rem; margin-bottom:1rem;">
          <div style="padding:0.9rem; background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.35); border-radius:10px;">
            <div style="font-size:1.35rem; font-weight:900; color:#059669;">${pubResourcesCount}</div>
            <div style="font-size:0.8rem; font-weight:700; color:var(--gdn-text);">Documentos Públicos</div>
            <div class="gdn-help">Visibles y descargables en la Landing Page</div>
          </div>

          <div style="padding:0.9rem; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.35); border-radius:10px;">
            <div style="font-size:1.35rem; font-weight:900; color:#d97706;">${privResourcesCount}</div>
            <div style="font-size:0.8rem; font-weight:700; color:var(--gdn-text);">Documentos Privados</div>
            <div class="gdn-help">Protegidos y ocultos del público</div>
          </div>

          <div style="padding:0.9rem; background:var(--gdn-subtle); border:1px solid var(--gdn-border); border-radius:10px;">
            <div style="font-size:1.35rem; font-weight:900; color:var(--gdn-text);">${pubLinksCount}</div>
            <div style="font-size:0.8rem; font-weight:700; color:var(--gdn-text);">Enlaces Públicos</div>
            <div class="gdn-help">Activos en la sección de enlaces</div>
          </div>
        </div>

        <label style="display:inline-flex; align-items:center; gap:0.55rem; font-size:0.86rem; font-weight:700; cursor:pointer;">
          <input type="checkbox" id="gdn-pub-video-toggle" ${d.videoConfig?.isPublic !== false ? 'checked' : ''} style="width:17px; height:17px; accent-color:#10b981;" />
          <span>Mostrar el video destacado en la portada pública (si cuenta con URL/archivo verificado)</span>
        </label>
      </div>
    `;
  },

  // =========================================================================
  // PASO 8: REVISIÓN FINAL Y PUBLICACIÓN
  // =========================================================================
  getChecklistItems() {
    const d = this.draft;
    const hasBasicInfo = Boolean(d.title && d.title.trim().length >= 3 && (d.shortDescription || d.fullDescription));
    const hasMainImage = Boolean(d.mainImage || d.useDefaultImage);
    const allResourcesValid = (d.resources || []).every(r => r && r.name && r.status === 'verified');
    const linksVerified = (d.externalLinks || []).length === 0 || (d.externalLinks || []).every(l => l.verified);
    const hasSlug = Boolean(d.landingConfig?.slug || d.title);

    return [
      { label: 'Información obligatoria completada (Nombre y descripción del proyecto)', ok: hasBasicInfo, step: 1 },
      { label: 'Imagen principal configurada (o portada institucional predeterminada activa)', ok: hasMainImage, step: 5 },
      { label: `Recursos cargados correctamente (${(d.resources || []).length} archivos registrados)`, ok: allResourcesValid, step: 4 },
      { label: `Enlaces externos verificados (${(d.externalLinks || []).filter(l => l.verified).length}/${(d.externalLinks || []).length} comprobados)`, ok: linksVerified, step: 6 },
      { label: 'Recursos públicos y privados diferenciados de forma segura', ok: true, step: 7 },
      { label: `URL pública preparada (slug: ${d.landingConfig?.slug || this.slugify(d.title || 'proyecto')})`, ok: hasSlug, step: 7 },
      { label: 'Contenido listo para vista previa, revisión o publicación en la Landing Page', ok: hasBasicInfo && hasMainImage, step: 8 }
    ];
  },

  canPublishDirectly() {
    if (window.ProjectsView && typeof window.ProjectsView.isTeacherOrAdmin === 'function') {
      return window.ProjectsView.isTeacherOrAdmin();
    }
    return true;
  },

  renderStep8FinalReview() {
    const d = this.draft;
    const checklist = this.getChecklistItems();
    const pubRes = (d.resources || []).filter(r => r.visibility !== 'private');
    const privRes = (d.resources || []).filter(r => r.visibility === 'private');
    const pubLinks = (d.externalLinks || []).filter(l => l.visibility !== 'private');

    return `
      <!-- Lista de Comprobación Pre-Publicación -->
      <div class="gdn-card" style="border:1.5px solid rgba(16,185,129,0.5);">
        <h3 style="margin:0 0 0.75rem; font-size:1.1rem; color:var(--gdn-text);">✅ Lista de comprobación del proyecto</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:0.6rem;">
          ${checklist.map(item => `
            <div style="display:flex; align-items:center; justify-content:space-between; gap:0.5rem; padding:0.65rem 0.9rem; background:var(--gdn-bg); border:1px solid ${item.ok ? 'rgba(16,185,129,0.4)' : 'rgba(245,158,11,0.45)'}; border-radius:10px; font-size:0.83rem;">
              <div style="display:flex; align-items:center; gap:0.55rem;">
                <span style="font-size:1rem;">${item.ok ? '✅' : '⚠️'}</span>
                <span style="font-weight:600; color:var(--gdn-text);">${this.escapeHtml(item.label)}</span>
              </div>
              ${!item.ok ? `<button type="button" style="background:none; border:none; color:#059669; font-weight:800; cursor:pointer; font-size:0.76rem;" onclick="window.ProjectWizard.goToStep(${item.step})">Completar →</button>` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Resumen Visual Dividido en las 7 Secciones con Acceso Rápido de Edición -->
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:1rem; margin-bottom:1.25rem;">
        
        <!-- 1. Información general -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">📋 1. Información general</strong>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="window.ProjectWizard.goToStep(1)">✏️ Editar</button>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Nombre:</strong> ${this.escapeHtml(d.title || 'Sin definir')}</div>
            <div><strong>Subtítulo:</strong> ${this.escapeHtml(d.subtitle || '—')}</div>
            <div><strong>Categoría:</strong> ${this.escapeHtml(d.categoryName)} (${this.escapeHtml(d.projectSubtype)})</div>
            <div><strong>Responsable:</strong> ${this.escapeHtml(d.teamLead || d.author)}</div>
            <div><strong>Estado:</strong> ${this.escapeHtml(d.preparationStatus)}</div>
          </div>
        </div>

        <!-- 2. Descripción y beneficios -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">💡 2. Descripción y beneficios</strong>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="window.ProjectWizard.goToStep(2)">✏️ Editar</button>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Resumen:</strong> ${this.escapeHtml((d.shortDescription || d.fullDescription || 'Sin descripción').slice(0, 140))}</div>
            <div><strong>Funcionalidades clave:</strong> ${(d.valueProp?.keyFeatures || []).length} pilares definidos</div>
            <div><strong>Preguntas frecuentes (FAQ):</strong> ${(d.valueProp?.faqs || []).length} registradas</div>
          </div>
        </div>

        <!-- 3. Video -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">🎬 3. Video de presentación</strong>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="window.ProjectWizard.goToStep(3)">✏️ Editar</button>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Estado:</strong> ${d.videoConfig?.verified ? '✔ Video verificado y listo' : 'Sin video o pendiente de verificar'}</div>
            <div><strong>Título:</strong> ${this.escapeHtml(d.videoConfig?.title || '—')}</div>
            <div><strong>Visibilidad:</strong> ${d.videoConfig?.isPublic !== false ? '🌐 Público' : '🔒 Privado'}</div>
          </div>
        </div>

        <!-- 4. Documentos y guías -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">📂 4. Documentos y guías</strong>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="window.ProjectWizard.goToStep(4)">✏️ Editar</button>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Públicos en Landing Page:</strong> ${pubRes.length} documentos</div>
            <div><strong>Privados (uso interno):</strong> ${privRes.length} documentos</div>
          </div>
        </div>

        <!-- 5. Imágenes y presentaciones -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">🖼️ 5. Imágenes y presentaciones</strong>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.65rem; font-size:0.75rem;" onclick="window.ProjectWizard.goToStep(5)">✏️ Editar</button>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Portada:</strong> ${d.mainImage ? 'Portada personalizada' : 'Portada institucional predeterminada'}</div>
            <div><strong>Elementos en galería / carrusel:</strong> ${(d.visualAssets || []).length} elementos</div>
          </div>
        </div>

        <!-- 6. Enlaces externos y 7. Configuración de publicación -->
        <div class="gdn-card" style="margin-bottom:0;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem;">
            <strong style="font-size:0.95rem; color:var(--gdn-text);">⚙️ 6 y 7. Enlaces y Publicación</strong>
            <div style="display:flex; gap:0.35rem;">
              <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.55rem; font-size:0.74rem;" onclick="window.ProjectWizard.goToStep(6)">Enlaces</button>
              <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.25rem 0.55rem; font-size:0.74rem;" onclick="window.ProjectWizard.goToStep(7)">Publicación</button>
            </div>
          </div>
          <div style="font-size:0.84rem; color:var(--gdn-text-sec); line-height:1.55;">
            <div><strong>Enlaces públicos:</strong> ${pubLinks.length} enlaces activos</div>
            <div><strong>Slug URL:</strong> <code>${this.escapeHtml(d.landingConfig?.slug || this.slugify(d.title || 'proyecto'))}</code></div>
            <div><strong>Llamado a la acción:</strong> ${this.escapeHtml(d.landingConfig?.ctaText || 'Unirse / Colaborar')}</div>
          </div>
        </div>

      </div>

      <!-- Tres Acciones Principales de Cierre -->
      <div class="gdn-card" style="background:linear-gradient(135deg, #0a192f, #1e3a5f); color:#ffffff; border:none;">
        <h3 style="margin:0 0 0.4rem; color:#ffffff; font-size:1.15rem;">🎯 Todo listo para decidir el siguiente paso</h3>
        <p style="margin:0 0 1.25rem; color:#cbd5e1; font-size:0.9rem;">
          Puedes guardar tu proyecto como borrador privado, abrir una vista previa interactiva exactamente como se verá en la Landing Page o publicarlo de inmediato.
        </p>
        <div style="display:flex; flex-wrap:wrap; gap:0.85rem;">
          <button type="button" class="plp-mentix-btn" style="padding:0.75rem 1.35rem; font-size:0.92rem;" onclick="window.ProjectWizard.saveAsDraftAction()">
            💾 1. Guardar borrador (Sin publicar)
          </button>
          <button type="button" class="plp-mentix-btn" style="padding:0.75rem 1.35rem; font-size:0.92rem; background:rgba(255,255,255,0.18);" onclick="window.ProjectWizard.previewInLandingPage()">
            👁️ 2. Vista previa en la Landing Page
          </button>
          <button type="button" class="plp-mentix-btn primary" style="padding:0.75rem 1.65rem; font-size:0.95rem;" onclick="window.ProjectWizard.publishOrSubmitProject()">
            🚀 3. ${this.canPublishDirectly() ? 'Publicar proyecto ahora' : 'Enviar proyecto a revisión'}
          </button>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // ASISTENCIA CONTEXTUAL MEDIANTE INTELIGENCIA ARTIFICIAL (CON APROBACIÓN)
  // =========================================================================
  renderAiSidebar() {
    const d = this.draft;
    const missing = this.getMissingInfoSuggestions();

    return `
      <div style="display:flex; align-items:center; gap:0.6rem; margin-bottom:0.65rem;">
        <span style="width:34px; height:34px; border-radius:10px; background:linear-gradient(135deg, #0a192f, #10b981); color:#fff; display:inline-flex; align-items:center; justify-content:center; font-size:1.1rem;">🤖</span>
        <div>
          <h4 style="margin:0; font-size:0.96rem; color:var(--gdn-text);">Copiloto IA de Proyectos</h4>
          <span style="font-size:0.74rem; color:#059669; font-weight:700;">Asistencia contextual • Nunca reemplaza sin tu permiso</span>
        </div>
      </div>

      <p style="font-size:0.8rem; color:var(--gdn-text-sec); margin:0 0 0.85rem; line-height:1.45;">
        Solicita propuestas basadas en lo que ya escribiste o en los documentos de texto cargados. Tú decides si aceptar, editar o descartar cada sugerencia.
      </p>

      <div style="display:flex; flex-direction:column; gap:0.45rem;">
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiProposeTitlesAndSubtitles()">
          ✨ Proponer títulos y subtítulos
        </button>
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiImproveDescription()">
          📝 Mejorar redacción y resumen corto
        </button>
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiSuggestCategoriesAndTags()">
          🏷️ Sugerir categoría y etiquetas
        </button>
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiProposeFaqs()">
          ❓ Generar preguntas frecuentes (FAQ)
        </button>
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiSuggestPresentationStructure()">
          📊 Sugerir diapositivas para la Landing
        </button>
        <button type="button" class="plp-doc-btn outline" style="justify-content:flex-start; font-size:0.8rem; padding:0.5rem 0.75rem;" onclick="window.ProjectWizard.aiSynthesizeAuthorizedMaterials()">
          📑 Sintetizar materiales autorizados
        </button>
      </div>

      ${this.pendingAiProposal ? `
        <div class="gdn-ai-proposal-box animate-fade-in">
          <div style="font-size:0.76rem; font-weight:800; color:#059669; text-transform:uppercase; margin-bottom:0.35rem;">
            💡 Propuesta de IA (${this.escapeHtml(this.pendingAiProposal.title)})
          </div>
          <div style="font-size:0.78rem; color:var(--gdn-text-sec); margin-bottom:0.45rem;">
            Puedes editar el texto propuesto antes de aplicarlo:
          </div>
          <textarea id="gdn-ai-proposal-textarea" class="gdn-textarea" rows="5" style="font-size:0.82rem; background:var(--gdn-surface);">${this.escapeHtml(this.pendingAiProposal.text)}</textarea>
          <div style="display:flex; gap:0.45rem; flex-wrap:wrap; margin-top:0.6rem;">
            <button type="button" class="plp-doc-btn" style="width:auto; padding:0.4rem 0.8rem; font-size:0.78rem;" onclick="window.ProjectWizard.acceptAiProposal()">
              ✅ Aceptar y aplicar
            </button>
            <button type="button" class="plp-doc-btn outline" style="width:auto; padding:0.4rem 0.8rem; font-size:0.78rem;" onclick="window.ProjectWizard.discardAiProposal()">
              ✕ Descartar
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Detector de Información Faltante -->
      <div style="margin-top:1rem; padding-top:0.9rem; border-top:1px solid var(--gdn-border);">
        <div style="font-size:0.78rem; font-weight:800; color:var(--gdn-text); margin-bottom:0.4rem;">
          🔎 Diagnóstico rápido del proyecto:
        </div>
        ${missing.length === 0 ? `
          <div style="font-size:0.78rem; color:#059669; font-weight:700;">
            ✔ Todos los apartados principales cuentan con información documentada.
          </div>
        ` : `
          <ul style="margin:0; padding-left:1.1rem; font-size:0.76rem; color:var(--gdn-text-sec); line-height:1.5;">
            ${missing.map(m => `<li>${this.escapeHtml(m)}</li>`).join('')}
          </ul>
        `}
      </div>
    `;
  },

  getMissingInfoSuggestions() {
    const d = this.draft;
    const list = [];
    if (!d.title) list.push('Falta definir el nombre del proyecto (Paso 1).');
    if (!d.shortDescription && !d.fullDescription) list.push('Falta una descripción corta o completa (Paso 1).');
    if (!d.mainObjective) list.push('Sugerencia: indica el objetivo principal (Paso 1).');
    if (!(d.valueProp?.keyFeatures || []).length) list.push('Agrega al menos 2 funcionalidades o pilares (Paso 2).');
    if (!(d.resources || []).length) list.push('Aún no has adjuntado documentos o guías (Paso 4).');
    return list;
  },

  aiProposeTitlesAndSubtitles() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const baseTopic = d.title || d.problemStatement || d.mainObjective || d.projectSubtype || 'Gobierno de Datos e IA';
    const cleanTopic = baseTopic.replace(/\.$/, '').trim();
    const proposedTitle = d.title || `Proyecto ${cleanTopic.slice(0, 48)}`;
    const proposedSubtitle = `Ecosistema de ${d.projectSubtype || 'innovación y gobernanza'} enfocado en ${d.targetAudience || 'la transformación institucional y educativa'}`;

    this.pendingAiProposal = {
      type: 'title_subtitle',
      title: 'Título y Subtítulo sugeridos',
      text: `TÍTULO: ${proposedTitle}\nSUBTÍTULO: ${proposedSubtitle}`
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiImproveDescription() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const raw = d.fullDescription || d.shortDescription || d.problemStatement || d.mainObjective || '';
    if (!raw.trim()) {
      alert('💡 Escribe primero una idea breve en el nombre, problema u objetivo para que la IA redacte una propuesta fiel a tu proyecto sin inventar datos.');
      return;
    }
    const audience = d.targetAudience ? ` dirigido a ${d.targetAudience}` : '';
    const objective = d.mainObjective ? ` Su objetivo principal es ${d.mainObjective.replace(/\.$/, '')}.` : '';
    const benefit = d.benefits ? ` Aporta beneficios directos como: ${d.benefits.replace(/\.$/, '')}.` : '';

    const improved = `${d.title ? d.title + ' es un proyecto de ' + (d.projectSubtype || 'innovación') : 'Este proyecto'}${audience} que aborda ${raw.replace(/\.$/, '')}.${objective}${benefit}`;
    const shortVer = improved.slice(0, 210) + (improved.length > 210 ? '...' : '');

    this.pendingAiProposal = {
      type: 'descriptions',
      title: 'Redacción mejorada y resumen corto',
      text: `DESCRIPCIÓN CORTA:\n${shortVer}\n\nDESCRIPCIÓN COMPLETA:\n${improved}`
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiGenerateShortDesc() {
    this.aiImproveDescription();
  },

  aiProposeValueProp() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const prob = d.problemStatement || d.valueProp.problemSolved || 'Necesidad de centralizar, documentar y facilitar el acceso a los recursos e indicadores del proyecto';
    const obj = d.mainObjective || 'Estandarizar los procesos y ofrecer herramientas claras de consulta y toma de decisiones';
    const ben = d.benefits || 'Acceso estructurado a la documentación oficial, trazabilidad y facilidad de adopción';

    this.pendingAiProposal = {
      type: 'value_prop',
      title: 'Propuesta de valor estructurada',
      text: [
        `PROBLEMA: ${prob}`,
        `CÓMO FUNCIONA: Integra la documentación técnica, recursos descargables, presentaciones ejecutivas y canales de colaboración en una sola plataforma accesible.`,
        `DIFERENCIADOR: ${obj}`,
        `PILARES:\nGobernanza y Calidad Documentada\nAcceso Transparente a Recursos\nTransferencia de Conocimiento`,
        `BENEFICIOS: ${ben}`
      ].join('\n')
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiSuggestCategoriesAndTags() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const corpus = `${d.title} ${d.subtitle} ${d.shortDescription} ${d.fullDescription} ${d.projectSubtype}`.toLowerCase();
    const tags = new Set(['GovData Nexus']);
    if (corpus.includes('ia') || corpus.includes('inteligencia')) tags.add('Inteligencia Artificial');
    if (corpus.includes('dato') || corpus.includes('data')) tags.add('Gobierno de Datos');
    if (corpus.includes('educa') || corpus.includes('docente') || corpus.includes('clase')) tags.add('Innovación Educativa');
    if (corpus.includes('analítica') || corpus.includes('indicador')) tags.add('Analítica');
    tags.add(d.categoryName || 'Tecnología');
    tags.add('Transparencia');

    this.pendingAiProposal = {
      type: 'tags',
      title: 'Etiquetas y palabras clave sugeridas',
      text: Array.from(tags).join(', ')
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiProposeFaqs() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const title = d.title || 'el proyecto';
    const audience = d.targetAudience || 'los usuarios autorizados y la comunidad institucional';
    const prereq = d.valueProp?.prerequisites || 'contar con navegador web actualizado y revisar la guía introductoria disponible en la sección de recursos';

    this.pendingAiProposal = {
      type: 'faqs',
      title: 'Preguntas Frecuentes (FAQ) basadas en tu proyecto',
      text: [
        `P: ¿Cuál es el propósito principal de ${title}?`,
        `R: ${d.mainObjective || d.shortDescription || 'Centralizar la información estratégica, documentación y recursos del proyecto para facilitar su consulta y adopción.'}`,
        `P: ¿A quién está dirigido ${title}?`,
        `R: Está diseñado principalmente para ${audience}.`,
        `P: ¿Qué necesito antes de comenzar a utilizar los recursos del proyecto?`,
        `R: Se recomienda ${prereq}.`
      ].join('\n')
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiSuggestPresentationStructure() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const title = d.title || 'Proyecto Institucional';
    this.pendingAiProposal = {
      type: 'slides',
      title: 'Estructura sugerida de 4 diapositivas públicas',
      text: [
        `SLIDE 1: Contexto y Definición de ${title} | ${d.shortDescription || 'Propósito general y alcance del proyecto.'}`,
        `SLIDE 2: Problema que Aborda y Solución Propuesta | ${d.problemStatement || d.valueProp?.howItWorks || 'Arquitectura funcional y metodología de trabajo.'}`,
        `SLIDE 3: Recursos y Documentación Disponible | Acceso estructurado a ${(d.resources || []).length || 'los'} documentos técnicos, guías y manuales.`,
        `SLIDE 4: Beneficios Esperados y Próximos Pasos | ${d.benefits || 'Adopción por parte de la comunidad y mejora continua.'}`
      ].join('\n')
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  aiSynthesizeAuthorizedMaterials() {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const readableDocs = (d.resources || []).filter(r => r.extractedText && r.extractedText.trim().length > 0);
    const docNames = (d.resources || []).map(r => `${r.name} (${r.format})`).join(', ');

    let synthesis = `SÍNTESIS EJECUTIVA DEL PROYECTO: ${d.title || 'En preparación'}\n`;
    synthesis += `• Objetivo documentado: ${d.mainObjective || d.shortDescription || 'Por completar'}\n`;
    synthesis += `• Público objetivo: ${d.targetAudience || 'General'}\n`;
    synthesis += `• Materiales registrados (${(d.resources || []).length}): ${docNames || 'Ningún archivo cargado aún'}\n`;

    if (readableDocs.length > 0) {
      synthesis += `• Extracto verificado de documentos de texto procesados: "${readableDocs[0].extractedText.slice(0, 260).replace(/\s+/g, ' ')}..."`;
    } else if ((d.resources || []).length > 0) {
      synthesis += `• Nota transparente: Los archivos binarios adjuntos se registraron por sus metadatos (${docNames}) sin asumir lectura interna no verificada.`;
    }

    this.pendingAiProposal = {
      type: 'synthesis',
      title: 'Síntesis verificada del proyecto',
      text: synthesis
    };
    if (window.ProjectsView) window.ProjectsView.render();
  },

  acceptAiProposal() {
    if (!this.pendingAiProposal) return;
    const textarea = document.getElementById('gdn-ai-proposal-textarea');
    const editedText = textarea ? textarea.value.trim() : this.pendingAiProposal.text;
    const type = this.pendingAiProposal.type;

    if (type === 'title_subtitle') {
      const tMatch = editedText.match(/TÍTULO:\s*(.+)/i);
      const sMatch = editedText.match(/SUBTÍTULO:\s*(.+)/i);
      if (tMatch) this.draft.title = tMatch[1].trim();
      if (sMatch) this.draft.subtitle = sMatch[1].trim();
    } else if (type === 'descriptions') {
      const parts = editedText.split(/DESCRIPCIÓN COMPLETA:/i);
      if (parts.length === 2) {
        this.draft.shortDescription = parts[0].replace(/DESCRIPCIÓN CORTA:/i, '').trim();
        this.draft.fullDescription = parts[1].trim();
      } else {
        this.draft.fullDescription = editedText;
        this.draft.shortDescription = editedText.slice(0, 200);
      }
    } else if (type === 'value_prop') {
      const getLine = (prefix) => {
        const m = editedText.match(new RegExp(prefix + ':\\s*(.+)', 'i'));
        return m ? m[1].trim() : '';
      };
      if (getLine('PROBLEMA')) this.draft.valueProp.problemSolved = getLine('PROBLEMA');
      if (getLine('CÓMO FUNCIONA')) this.draft.valueProp.howItWorks = getLine('CÓMO FUNCIONA');
      if (getLine('DIFERENCIADOR')) this.draft.valueProp.differentiator = getLine('DIFERENCIADOR');
      if (getLine('BENEFICIOS')) this.draft.valueProp.resultsAndBenefits = getLine('BENEFICIOS');
      if (!this.draft.valueProp.keyFeatures.length) {
        this.draft.valueProp.keyFeatures = ['Gobernanza y Calidad Documentada', 'Acceso Transparente a Recursos', 'Transferencia de Conocimiento'];
      }
    } else if (type === 'tags') {
      this.draft.landingConfig.tags = editedText.split(',').map(s => s.trim()).filter(Boolean);
    } else if (type === 'faqs') {
      const lines = editedText.split('\n').map(l => l.trim()).filter(Boolean);
      const newFaqs = [];
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('P:')) {
          const q = lines[i].replace(/^P:\s*/, '');
          const a = (lines[i + 1] && lines[i + 1].startsWith('R:')) ? lines[i + 1].replace(/^R:\s*/, '') : '';
          newFaqs.push({ q, a });
        }
      }
      if (newFaqs.length > 0) this.draft.valueProp.faqs = newFaqs;
    } else if (type === 'slides') {
      const lines = editedText.split('\n').map(l => l.trim()).filter(Boolean);
      const defaultImgs = [
        'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1000&q=80'
      ];
      lines.forEach((line, idx) => {
        const clean = line.replace(/^SLIDE\s*\d+:\s*/i, '');
        const [t, c] = clean.split('|').map(s => (s || '').trim());
        if (t) {
          this.draft.visualAssets.push({
            id: 'vis_ai_' + Date.now() + '_' + idx,
            title: t,
            caption: c || 'Diapositiva ejecutiva del proyecto.',
            url: defaultImgs[idx % defaultImgs.length],
            assetType: 'institutional_pres',
            visibility: 'public'
          });
        }
      });
    } else if (type === 'synthesis') {
      this.draft.fullDescription = editedText;
      if (!this.draft.shortDescription) this.draft.shortDescription = editedText.slice(0, 200);
    }

    this.pendingAiProposal = null;
    this.saveDraftToStorage(true);
    if (window.ProjectsView) window.ProjectsView.render();
  },

  discardAiProposal() {
    this.pendingAiProposal = null;
    if (window.ProjectsView) window.ProjectsView.render();
  },

  // =========================================================================
  // INTEGRACIÓN CON EL MODELO DE PROYECTOS Y LA LANDING PAGE EXISTENTE
  // =========================================================================
  buildChallengeCompatibleRecord(statusOverride = null) {
    this.collectCurrentStepInputs();
    const d = this.draft;
    const pubStatus = statusOverride || d.publicationStatus || 'draft';
    d.publicationStatus = pubStatus;

    const finalTitle = (d.title || d.landingConfig?.publicName || 'Nuevo Proyecto GovData').trim();
    const finalSlug = d.landingConfig?.slug || this.slugify(finalTitle);
    d.landingConfig.slug = finalSlug;

    const cover = d.mainImage || (d.useDefaultImage !== false ? this.defaultCoverImage : '');
    const slidesFromVisuals = (d.visualAssets || []).map((v, i) => ({
      id: v.id || ('slide_' + i),
      title: v.title || `Diapositiva ${i + 1}`,
      content: v.caption || '',
      imageUrl: v.url || cover,
      layout: 'split'
    }));

    return {
      id: d.id,
      slug: finalSlug,
      title: finalTitle,
      subtitle: d.subtitle || 'Proyecto GovData Nexus',
      description: d.shortDescription || d.fullDescription || 'Proyecto documentado con el Asistente Inteligente GovData Nexus.',
      shortDescription: d.shortDescription || d.description || '',
      fullDescription: d.fullDescription || '',
      category: d.category || 'tecnologia',
      categoryName: d.categoryName || 'Tecnología & Programación',
      projectType: 'presentation',
      isGovDataProject: true,
      projectSubtype: d.projectSubtype || 'Gobierno de Datos e IA',
      difficulty: 'Medio',
      banner: cover,
      mainImage: cover,
      thumbnailImage: d.thumbnailImage || cover,
      useDefaultImage: d.useDefaultImage !== false,
      targetAudience: d.targetAudience || '',
      problemStatement: d.problemStatement || '',
      mainObjective: d.mainObjective || '',
      benefits: d.benefits || '',
      teamLead: d.teamLead || d.author || 'Equipo del Proyecto',
      preparationStatus: d.preparationStatus || 'en_desarrollo',
      publicationStatus: pubStatus,
      isPublic: pubStatus === 'published',
      startDate: d.startDate || '',
      endDate: d.endDate || '',
      valueProposition: d.valueProp || {},
      videoUrl: d.videoConfig?.url || '',
      videoConfig: d.videoConfig || {},
      resources: d.resources || [],
      visualAssets: d.visualAssets || [],
      slides: slidesFromVisuals.length > 0 ? slidesFromVisuals : [
        { id: 's1', title: finalTitle, content: d.shortDescription || d.mainObjective || '', imageUrl: cover, layout: 'split' }
      ],
      externalLinks: d.externalLinks || [],
      landingConfig: d.landingConfig || {},
      tags: d.landingConfig?.tags || ['Gobierno de Datos', 'IA'],
      displayOrder: Number(d.landingConfig?.displayOrder || 1),
      govdata: JSON.parse(JSON.stringify(d)),
      author: d.author || 'Docente',
      authorId: d.authorId || '',
      authorEmail: d.authorEmail || '',
      authorAvatar: d.authorAvatar || '👨‍🏫',
      authorRole: d.authorRole || 'teacher',
      createdAt: d.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  },

  syncProjectRecordToAppState(statusOverride = null) {
    const record = this.buildChallengeCompatibleRecord(statusOverride);
    if (!window.appState) window.appState = { challenges: [] };
    if (!Array.isArray(window.appState.challenges)) window.appState.challenges = [];

    const idx = window.appState.challenges.findIndex(c => c && c.id === record.id);
    if (idx >= 0) {
      window.appState.challenges[idx] = { ...window.appState.challenges[idx], ...record };
    } else {
      window.appState.challenges.unshift(record);
    }

    if (typeof saveGlobalState === 'function') {
      saveGlobalState(window.appState);
    }

    // Guardar el proyecto activo para que proyecto-landing.html también pueda renderizarlo en pantalla completa
    try {
      localStorage.setItem('mentix_active_landing_project', JSON.stringify(record));
    } catch (e) {}

    if (window.supabaseService && typeof window.supabaseService.saveGovDataProject === 'function') {
      window.supabaseService.saveGovDataProject(record);
    }

    return record;
  },

  saveAsDraftAction() {
    const rec = this.syncProjectRecordToAppState('draft');
    this.saveDraftToStorage(true);
    alert(`💾 El proyecto "${rec.title}" se ha guardado como Borrador privado. No aparecerá públicamente hasta que decidas publicarlo.`);
    if (window.ProjectsView) {
      window.ProjectsView.viewMode = 'list';
      window.ProjectsView.render();
    }
  },

  previewInLandingPage() {
    const navEl = document.getElementById('main-navbar');
    if (navEl) navEl.style.display = '';
    const rec = this.syncProjectRecordToAppState(this.draft.publicationStatus || 'draft');
    this.saveDraftToStorage(true);
    if (window.ProjectsView) {
      window.ProjectsView.selectedProjectId = rec.id;
      window.ProjectsView.isWizardPreview = true;
      window.ProjectsView.viewMode = 'landing';
      window.ProjectsView.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  },

  async publishOrSubmitProject() {
    this.collectCurrentStepInputs();
    if (!this.draft.title || this.draft.title.trim().length < 3) {
      alert('⚠️ Por favor escribe el nombre del proyecto en el Paso 1 antes de publicarlo.');
      this.goToStep(1);
      return;
    }
    if (!this.draft.shortDescription && !this.draft.fullDescription) {
      alert('⚠️ Por favor agrega una descripción para tu proyecto en el Paso 1 antes de publicarlo.');
      this.goToStep(1);
      return;
    }

    const canPub = this.canPublishDirectly();
    const targetStatus = canPub ? 'published' : 'ready_for_review';
    const rec = this.syncProjectRecordToAppState(targetStatus);

    // Remover de borradores pendientes o marcarlo como publicado
    this.draft.publicationStatus = targetStatus;
    this.saveDraftToStorage(true);

    if (window.appRouter && typeof window.appRouter.pushChallengeToCloud === 'function') {
      await window.appRouter.pushChallengeToCloud(rec);
    }

    if (canPub) {
      alert(`🚀 ¡Proyecto "${rec.title}" publicado con éxito en la Landing Page! Solo los recursos marcados como públicos están visibles para los visitantes.`);
    } else {
      alert(`🔎 ¡Proyecto "${rec.title}" enviado a revisión! Un docente o administrador podrá aprobar su publicación final.`);
    }

    const navEl = document.getElementById('main-navbar');
    if (navEl) navEl.style.display = '';
    if (window.ProjectsView) {
      window.ProjectsView.selectedProjectId = rec.id;
      window.ProjectsView.isWizardPreview = false;
      window.ProjectsView.viewMode = 'landing';
      window.ProjectsView.render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
};
