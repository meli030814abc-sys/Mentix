/**
 * 🔥 TE RETO - Orquestador Principal y Enrutador SPA (app.js)
 * Conecta todas las vistas, modales, autenticación, experiencia XP y sonido.
 */

class AppRouter {
  constructor() {
    this.currentView = 'home';
    this.historyStack = [];
    this.init();
  }

  init() {
    // Limpieza segura de residuos previos de caché
    try {
      localStorage.removeItem('mentix_interface_design');
    } catch(e) {}

    // Restaurar tema guardado (modo claro uniforme por defecto en cualquier computador)
    const savedTheme = localStorage.getItem('te_reto_theme');
    if (savedTheme !== 'dark') {
      document.body.classList.add('light-theme');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = '☀️';
    }

    // Aplicar diseño exclusivo de Administrador si está configurado
    if (window.AdminView && window.AdminView.applySavedDesign) {
      window.AdminView.applySavedDesign();
    }
    this.syncDesignWithCloud();

    // Cargar estado inicial con respaldo anti-fallos
    try {
      window.appState = loadInitialState();
    } catch (initErr) {
      console.warn('Recuperando estado inicial tras excepción:', initErr);
      window.appState = {
        challenges: typeof DEFAULT_CHALLENGES !== 'undefined' ? [...DEFAULT_CHALLENGES] : [],
        users: typeof DEFAULT_USERS !== 'undefined' ? [...DEFAULT_USERS] : [],
        currentUser: typeof DEFAULT_USERS !== 'undefined' ? DEFAULT_USERS[0] : { id: 'u1', name: 'Docente', role: 'admin' },
        groups: typeof DEFAULT_GROUPS !== 'undefined' ? [...DEFAULT_GROUPS] : [],
        categories: typeof DEFAULT_CATEGORIES !== 'undefined' ? [...DEFAULT_CATEGORIES] : []
      };
    }

    // Actualizar navbar
    this.updateNavbar();
    if (window.supabaseService) {
      window.supabaseService.updateStatusBadge();
      window.supabaseService.syncChallenges(window.appState.challenges);
    }

    // Sincronizar categorías y retos globales desde la nube para todos los usuarios
    this.syncCategoriesWithCloud();
    this.syncChallengesWithCloud(true);

    // Manejar atajos globales
    this.setupGlobalEvents();

    // Retorno de Google/Microsoft: el hash/URL trae el token, no debe usarse como ruta
    const oauthReturn = /access_token=|[?&#]code=/.test(window.location.href);

    // Restaurar vista actual si se presionó F5 o se accedió con enlace directo
    this.booting = true;
    const restored = oauthReturn ? false : this.restoreInitialRoute();
    if (!restored) {
      this.navigate('home', {}, false);
    }
    this.booting = false;

    // Si arrancó directamente en una sub-vista (ej. #projects), sembrar #home debajo en el historial de Chrome
    // para que el 1er "Atrás" lleve a la página principal de Mentix y el 2do "Atrás" vuelva a Google
    try {
      if (this.currentView && this.currentView !== 'home') {
        const currentHash = window.location.hash || ('#' + this.currentView);
        const curState = (history.state && history.state.mentix)
          ? history.state
          : { mentix: true, view: this.currentView, subMode: this.currentView === 'projects' ? (window.ProjectsView?.viewMode || 'list') : undefined };
        if (!curState._seededOverHome) {
          history.replaceState({ mentix: true, view: 'home' }, '', '#home');
          if (this.currentView === 'projects' && window.ProjectsView && window.ProjectsView.viewMode && window.ProjectsView.viewMode !== 'list') {
            history.pushState({ mentix: true, view: 'projects', subMode: 'list', _seededOverHome: true }, '', '#projects');
          }
          history.pushState({ ...curState, _seededOverHome: true }, '', currentHash);
        }
      }
    } catch (e) {}

    // Registro obligatorio antes de mostrar la página
    if (oauthReturn) {
      this.checkOAuthSession().then(ok => { if (!ok) this.requireAuth(); });
    } else {
      this.requireAuth();
    }
  }

  restoreInitialRoute(fromPopState = false) {
    const hash = window.location.hash;
    if (hash && hash.length > 1) {
      const cleanHash = hash.replace(/^#/, '');
      const [viewPart, queryPart] = cleanHash.split('?');
      const params = {};
      if (queryPart) {
        const usp = new URLSearchParams(queryPart);
        for (const [k, v] of usp.entries()) {
          params[k] = v === 'true' ? true : (v === 'false' ? false : v);
        }
      }
      if (viewPart) {
        if (viewPart === 'join' || viewPart === 'lobby-join') {
          this.navigate('lobby-join', { pin: params.pin }, false);
          return true;
        }
        if (viewPart === 'experience' || viewPart === 'select-experience') {
          const id = params.id || params.challengeId || window.appState.challenges[0]?.id;
          const ch = (window.appState?.challenges || []).find(c => c && String(c.id) === String(id)) || window.appState?.challenges?.[0];
          if (ch) {
            this.navigate('select-experience', { challenge: ch, challengeId: ch.id, gameMode: params.gameMode || 'clasico', roomType: params.roomType || 'presented' }, false);
            return true;
          }
        }
        if (viewPart === 'admin') {
          this.navigate('admin', params, false);
          if (params.tab && window.AdminView && typeof window.AdminView.switchTab === 'function') {
            window.AdminView.switchTab(params.tab, false);
          }
          return true;
        }
        if (viewPart === 'projects') {
          this.navigate('projects', params, false);
          if (window.ProjectsView) {
            if (params.hub && window.ProjectHub) {
              window.ProjectHub.open(params.hub, params.tab || 'home', false);
            } else if (params.landing) {
              window.ProjectsView.openProjectLanding(params.landing, false);
            } else if (params.mode === 'join') {
              window.ProjectsView.openJoinProjectModal('', false);
            } else if (params.wizard && window.ProjectWizard) {
              window.ProjectWizard.openWizard(params.wizard, Number(params.step) || null, true, false);
            } else {
              window.ProjectsView.viewMode = 'list';
              const navEl = document.getElementById('main-navbar');
              if (navEl) navEl.style.display = 'none';
              document.body.classList.add('projects-pure-white-theme');
              window.ProjectsView.render();
            }
          }
          return true;
        }
        this.navigate(viewPart, params, false);
        return true;
      }
    }

    if (fromPopState) {
      this.navigate('home', {}, false);
      return true;
    }

    // Si no hay hash, restaurar la última vista desde sessionStorage
    try {
      const saved = sessionStorage.getItem('mentix_last_route');
      if (saved) {
        const route = JSON.parse(saved);
        if (route && route.view) {
          this.navigate(route.view, route.params || {}, false);
          return true;
        }
      }
    } catch (e) {}

    return false;
  }

  pushSubState(stateObj, hash, replace = false) {
    if (this._isPopStateNav) return;
    try {
      const payload = { mentix: true, ...(stateObj || {}) };
      const targetHash = hash || window.location.hash || ('#' + (payload.view || this.currentView || 'home'));
      if (replace || window.location.hash === targetHash) {
        history.replaceState(payload, '', targetHash);
      } else {
        history.pushState(payload, '', targetHash);
      }
      sessionStorage.setItem('mentix_last_route', JSON.stringify({
        view: payload.view || this.currentView,
        params: payload.params || {},
        subState: payload
      }));
    } catch (e) {}
  }

  applyHistoryState(state) {
    this._isPopStateNav = true;
    try {
      // Cerrar cualquier modal/overlay flotante si el estado al que retrocedemos no es ese modal
      if (!state || state.subMode !== 'hub') {
        const hubEl = document.getElementById('phub-overlay');
        if (hubEl) {
          if (window.ProjectHub && typeof window.ProjectHub.close === 'function') window.ProjectHub.close(false);
          else hubEl.remove();
        }
      }
      if (!state || state.subMode !== 'join') {
        const joinModal = document.getElementById('project-join-modal');
        if (joinModal) joinModal.remove();
      }
      // Si salimos de un examen/juego en curso al retroceder, detener temporizadores activos
      if (this.currentView === 'game' && (!state || state.view !== 'game')) {
        try {
          if (window.GameView && typeof window.GameView.stopTimer === 'function') window.GameView.stopTimer();
          if (window.GameView && window.GameView.timerInterval) {
            clearInterval(window.GameView.timerInterval);
            window.GameView.timerInterval = null;
          }
        } catch (e) {}
      }

      if (state && state.mentix) {
        if (state.subMode === 'hub' && state.projectId && window.ProjectHub) {
          if (state.view && this.currentView !== state.view) {
            this.navigate(state.view, state.params || {}, false);
          }
          window.ProjectHub.open(state.projectId, state.tab || 'home', false);
          return;
        }
        if (state.view === 'admin') {
          if (this.currentView !== 'admin') {
            this.navigate('admin', state.params || {}, false);
          }
          if (state.tab && window.AdminView && typeof window.AdminView.switchTab === 'function') {
            window.AdminView.switchTab(state.tab, false);
          }
          return;
        }
        if (state.view === 'projects') {
          if (this.currentView !== 'projects') {
            this.navigate('projects', {}, false);
          }
          if (window.ProjectsView) {
            if (state.subMode === 'landing' && state.projectId) {
              window.ProjectsView.openProjectLanding(state.projectId, false);
            } else if (state.subMode === 'join') {
              window.ProjectsView.openJoinProjectModal('', false);
            } else if (state.subMode === 'wizard' && window.ProjectWizard) {
              const targetStep = Number(state.step) || 1;
              if (window.ProjectsView.viewMode === 'wizard' && window.ProjectWizard.draft && (!state.projectId || String(window.ProjectWizard.draft.id) === String(state.projectId))) {
                window.ProjectWizard.goToStep(targetStep, false);
              } else {
                window.ProjectWizard.openWizard(state.projectId || null, targetStep, true, false);
              }
            } else {
              window.ProjectsView.viewMode = 'list';
              document.body.classList.add('projects-pure-white-theme');
              window.ProjectsView.render();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }
          return;
        }
        if (state.view) {
          this.navigate(state.view, state.params || {}, false);
          return;
        }
      }
      // Si no hay state explícito, reconstruir exactamente desde el hash actual del navegador
      this.restoreInitialRoute(true);
    } finally {
      setTimeout(() => { this._isPopStateNav = false; }, 50);
    }
  }

  setupGlobalEvents() {
    window.addEventListener('popstate', (event) => {
      this._lastPopStateAt = Date.now();
      this.applyHistoryState(event.state);
    });

    window.addEventListener('hashchange', () => {
      // Evitar doble disparo cuando el cambio vino del botón atrás/adelante (popstate)
      if (this._isPopStateNav || (Date.now() - (this._lastPopStateAt || 0)) < 150) return;
      this.restoreInitialRoute(true);
    });

    // Sincronización global automática: cuando el usuario regresa a la pestaña, vuelve a enfocar la ventana o periódicamente cada 15 segundos
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncChallengesWithCloud(true);
        this.syncCategoriesWithCloud();
        if (window.ProjectsView && typeof window.ProjectsView.syncHeroBannerFromCloud === 'function') {
          window.ProjectsView.syncHeroBannerFromCloud().catch(() => {});
        }
      }
    });

    window.addEventListener('focus', () => {
      const now = Date.now();
      if (now - (this._lastFocusSyncAt || 0) < 10000) return;
      this._lastFocusSyncAt = now;
      this.syncChallengesWithCloud();
      if (window.ProjectsView && typeof window.ProjectsView.syncHeroBannerFromCloud === 'function') {
        window.ProjectsView.syncHeroBannerFromCloud().catch(() => {});
      }
    });

    // Si el anfitrion cierra la pestana o recarga, cerrar la sala inmediatamente para todos los jugadores
    const handleHostTabExit = () => {
      try {
        const re = window.realtimeEngine;
        if (re && re.isHost && re.currentRoom && !re.roomClosed &&
            ['lobby-host', 'game', 'leaderboard', 'podium'].includes(this.currentView)) {
          re.closeRoomAsHost();
        }
      } catch (e) {}
    };
    window.addEventListener('pagehide', handleHostTabExit);
    window.addEventListener('beforeunload', handleHostTabExit);

    setInterval(() => {
      if (document.visibilityState === 'visible' && (this.currentView === 'home' || this.currentView === 'projects' || this.currentView === 'admin')) {
        this.syncChallengesWithCloud();
      }
    }, 15000);
  }

  isGuest() {
    const u = window.appState && window.appState.currentUser;
    return !!(u && (u.isGuest || u.username === 'invitado'));
  }

  guestBlocked(msg) {
    alert(msg || '🔒 Los invitados tienen acceso limitado. Regístrate o inicia sesión para continuar.');
    this.openAuthModal('register');
  }

  navigate(viewName, params = {}, pushToHistory = true) {
    // Invitados: pueden ver home, explore y projects (modo solo lectura y landing pages).
    // Solo bloqueados de crear cuestionarios ('creator') y hostear salas ('lobby-host')
    if (this.isGuest() && ['creator', 'lobby-host'].includes(viewName)) {
      if (this.booting) {
        viewName = 'home';
      } else {
        this.guestBlocked('🔒 Los invitados no pueden crear cuestionarios ni salas. Regístrate o inicia sesión.');
        return;
      }
    }
    // Si el anfitrion abandona la sala (lobby, juego o resultados), se cierra para todos los jugadores
    try {
      const hostViews = ['lobby-host', 'game', 'leaderboard', 'podium'];
      const re = window.realtimeEngine;
      if (re && re.isHost && re.currentRoom && !re.roomClosed &&
          hostViews.includes(this.currentView) && !hostViews.includes(viewName)) {
        re.closeRoomAsHost();
      }
    } catch (e) {}

    if (pushToHistory) {
      this.historyStack.push(viewName);
    }
    this.currentView = viewName;

    // Guardar para que al presionar F5 siempre se conserve la misma pestaña
    try {
      sessionStorage.setItem('mentix_last_route', JSON.stringify({ view: viewName, params: params || {} }));
    } catch (e) {}

    // Sincronizar historial real del navegador (pushState) para que la flecha atrás/adelante de Chrome
    // retroceda paso a paso dentro de todo Mentix (exámenes, juegos, creador, perfil, admin, proyectos, etc.)
    try {
      const safeParams = {};
      if (params && typeof params === 'object') {
        ['id', 'edit', 'pin', 'tab', 'mode', 'landing', 'wizard', 'step', 'editId', 'challengeId', 'gameMode', 'roomType'].forEach(k => {
          if (params[k] !== undefined && params[k] !== null && typeof params[k] !== 'object') {
            safeParams[k] = params[k];
          }
        });
        if (params.challenge && params.challenge.id && !safeParams.challengeId) {
          safeParams.challengeId = params.challenge.id;
        }
      }
      let hash = '#' + viewName;
      const hashId = safeParams.id || safeParams.challengeId || safeParams.editId;
      if (hashId) hash += '?id=' + encodeURIComponent(hashId);
      if (safeParams.edit) hash += (hash.includes('?') ? '&' : '?') + 'edit=true';
      if (safeParams.pin) hash += (hash.includes('?') ? '&' : '?') + 'pin=' + encodeURIComponent(safeParams.pin);
      if (safeParams.tab) hash += (hash.includes('?') ? '&' : '?') + 'tab=' + encodeURIComponent(safeParams.tab);
      const statePayload = {
        mentix: true,
        view: viewName,
        tab: viewName === 'admin' ? (safeParams.tab || window.AdminView?.activeTab || 'dashboard') : safeParams.tab,
        subMode: viewName === 'projects' ? (window.ProjectsView?.viewMode || 'list') : undefined,
        params: safeParams
      };
      if (pushToHistory && !this._isPopStateNav && window.location.hash !== hash) {
        history.pushState(statePayload, '', hash);
      } else {
        history.replaceState(statePayload, '', hash);
      }
    } catch (e) {}

    // Ocultar todas las vistas
    document.querySelectorAll('.app-view').forEach(v => {
      v.classList.remove('active');
    });

    // Control de tema totalmente blanco exclusivo para la vista de proyectos
    if (viewName === 'projects') {
      const isProjectsView = (window.ProjectsView && (window.ProjectsView.viewMode === 'wizard' || window.ProjectsView.viewMode === 'join'));
      if (isProjectsView) {
        document.body.classList.remove('projects-pure-white-theme');
      } else {
        document.body.classList.add('projects-pure-white-theme');
      }
    } else {
      document.body.classList.remove('projects-pure-white-theme');
    }

    // Controlar visibilidad del navbar principal (ocultar en lobby-join, game, leaderboard y podium para diseño inmersivo con fondo Mentix completo)
    const navEl = document.getElementById('main-navbar');
    if (navEl) {
      const isProjectsView = (viewName === 'projects');
      if (viewName === 'lobby-join' || viewName === 'game' || viewName === 'leaderboard' || viewName === 'podium' || isProjectsView) {
        navEl.style.display = 'none';
      } else {
        navEl.style.display = '';
        this.updateNavbar();
      }
    }

    switch (viewName) {
      case 'home':
        document.getElementById('view-home')?.classList.add('active');
        window.HomeView.render();
        this.syncChallengesWithCloud();
        break;

      case 'creator':
        document.getElementById('view-creator')?.classList.add('active');
        if (params.editId) {
          // Editar un reto existente por id
          const challengeToEdit = (window.appState.challenges || []).find(c => c.id === params.editId);
          if (challengeToEdit && !this.isChallengeOwner(challengeToEdit)) {
            alert('🚫 Solo el creador de este cuestionario tiene permiso para editarlo.');
            this.navigate('home');
            return;
          }
          window.CreatorView.render(challengeToEdit || null);
        } else if (params.challenge) {
          window.CreatorView.render(params.challenge);
        } else {
          // Crear un nuevo reto desde cero:
          // Si no hay reto actual o si el que está en el creador ya está publicado/guardado, reiniciar el formulario
          if (window.CreatorView) {
            const currentC = window.CreatorView.currentChallenge;
            const isAlreadyPublished = currentC && (window.appState.challenges || []).some(item => item.id === currentC.id);
            if (!currentC || isAlreadyPublished) {
              window.CreatorView.resetForm(null);
            }
          }
          window.CreatorView.render();
        }
        break;

      case 'select-experience':
        document.getElementById('view-experience')?.classList.add('active');
        {
          const expId = params.challenge?.id || params.challengeId || params.id;
          const expChallenge = params.challenge
            || (expId ? (window.appState?.challenges || []).find(c => c && String(c.id) === String(expId)) : null)
            || window.ExperienceView?.currentChallenge
            || window.appState?.challenges?.[0];
          if (expChallenge) {
            window.ExperienceView.render(expChallenge, params.gameMode || 'clasico', params.roomType || 'presented');
          } else {
            this.navigate('home', {}, false);
          }
        }
        break;

      case 'lobby-host':
        document.getElementById('view-lobby')?.classList.add('active');
        {
          const hostId = params.challenge?.id || params.challengeId || params.id;
          const hostChallenge = params.challenge
            || (hostId ? (window.appState?.challenges || []).find(c => c && String(c.id) === String(hostId)) : null)
            || window.LobbyView?.pendingChallenge
            || window.ExperienceView?.currentChallenge
            || window.realtimeEngine?.currentRoom?.challenge
            || window.appState?.challenges?.[0];
          if (hostChallenge) {
            const cleanRoomType = (params.roomType === 'normal') ? 'normal' : 'presented';
            window.LobbyView.initHost(hostChallenge, params.gameMode || 'clasico', params.modeConfig || {}, params.rosterConfig || null, cleanRoomType);
          } else {
            this.navigate('home', {}, false);
          }
        }
        break;

      case 'lobby-join':
        document.getElementById('view-lobby')?.classList.add('active');
        window.LobbyView.initJoin(params.pin || '');
        break;

      case 'game':
        document.getElementById('view-game')?.classList.add('active');
        break;

      case 'leaderboard':
        document.getElementById('view-leaderboard')?.classList.add('active');
        break;

      case 'podium':
        document.getElementById('view-podium')?.classList.add('active');
        break;

      case 'profile':
        document.getElementById('view-profile')?.classList.add('active');
        window.ProfileView.render();
        break;

      case 'teacher':
        const rTeacher = (window.appState?.currentUser?.role || '').toLowerCase().trim();
        if (rTeacher === 'student' || rTeacher === 'estudiante') {
          alert('🚫 Acceso exclusivo para docentes y administradores.');
          this.navigate('home');
          return;
        }
        document.getElementById('view-teacher')?.classList.add('active');
        window.TeacherView.render();
        break;

      case 'admin':
        document.getElementById('view-admin')?.classList.add('active');
        window.AdminView.render();
        this.syncChallengesWithCloud();
        break;

      case 'ranking':
        document.getElementById('view-ranking')?.classList.add('active');
        window.RankingView.render();
        break;

      case 'projects':
        document.getElementById('view-projects')?.classList.add('active');
        if (window.ProjectsView) {
          if (params?.returnToStudentCreate || params?.viewMode === 'create') {
            window.ProjectsView.returnToStudentCreateStep2(params?.cleanUpProjectId);
            break;
          } else if (params?.viewMode) {
            window.ProjectsView.viewMode = params.viewMode;
          } else if (window.ProjectsView.viewMode !== 'create') {
            window.ProjectsView.viewMode = 'list';
          }
          window.ProjectsView.render();
        }
        this.syncChallengesWithCloud();
        break;

      case 'presentation':
        document.getElementById('view-presentation')?.classList.add('active');
        if (window.PresentationView) window.PresentationView.render(params);
        break;

      case 'video':
        document.getElementById('view-video')?.classList.add('active');
        if (window.VideoProjectView) window.VideoProjectView.render(params);
        break;

      case 'document':
        document.getElementById('view-document')?.classList.add('active');
        if (window.DocumentProjectView) window.DocumentProjectView.render(params);
        break;

      case 'url':
        document.getElementById('view-url')?.classList.add('active');
        if (window.UrlProjectView) window.UrlProjectView.render(params);
        break;

      default:
        document.getElementById('view-home')?.classList.add('active');
        window.HomeView.render();
    }

    this.updateNavbar();
  }

  openPresentation(id) {
    this.navigate('presentation', { id: id, edit: false });
  }

  editPresentation(id) {
    const p = (window.appState.challenges || []).find(c => c.id === id);
    if (p && !this.isChallengeOwner(p)) {
      alert('🚫 Solo el creador de esta presentación puede editarla.');
      return;
    }
    this.navigate('presentation', { id: id, edit: true });
  }

  createPresentation() {
    this.navigate('presentation', { edit: true });
  }

  openVideo(id) {
    this.navigate('video', { id: id, edit: false });
  }

  editVideo(id) {
    const p = (window.appState.challenges || []).find(c => c.id === id);
    if (p && !this.isChallengeOwner(p)) {
      alert('🚫 Solo el creador de esta video clase puede editarla.');
      return;
    }
    this.navigate('video', { id: id, edit: true });
  }

  createVideo() {
    this.navigate('video', { edit: true });
  }

  openDocument(id) {
    this.navigate('document', { id: id, edit: false });
  }

  editDocument(id) {
    const p = (window.appState.challenges || []).find(c => c.id === id);
    if (p && !this.isChallengeOwner(p)) {
      alert('🚫 Solo el creador de este documento puede editarlo.');
      return;
    }
    this.navigate('document', { id: id, edit: true });
  }

  createDocument() {
    this.navigate('document', { edit: true });
  }

  openUrl(id) {
    this.navigate('url', { id: id, edit: false });
  }

  editUrl(id) {
    const p = (window.appState.challenges || []).find(c => c.id === id);
    if (p && !this.isChallengeOwner(p)) {
      alert('🚫 Solo el creador de este recurso web puede editarlo.');
      return;
    }
    this.navigate('url', { id: id, edit: true });
  }

  createUrl() {
    this.navigate('url', { edit: true });
  }

  updateNavbar() {
    const user = window.appState.currentUser;
    const userSlot = document.getElementById('nav-user-slot');
    const teacherLink = document.getElementById('nav-teacher-link');
    const adminLink = document.getElementById('nav-admin-link');
    const projectsLink = document.getElementById('nav-projects-link');

    const clean = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isMelisa = user && (clean(user.name) === 'melisa' || clean(user.username) === 'melisa' || clean(user.email) === 'meli030814abc@gmail.com' || clean(user.email).startsWith('melisa'));
    const roleLower = clean(user?.role);

    // 1. ¿Es Administrador genuino?
    const isAdmin = isMelisa || (roleLower === 'admin' || roleLower === 'administrador');

    // 2. ¿Es Docente / Profesor genuino?
    const isTeacher = !isAdmin && (roleLower === 'teacher' || roleLower === 'profesor' || roleLower === 'docente');

    // 3. Todo usuario que no sea Admin ni Docente es ESTUDIANTE
    const isStudent = !isAdmin && !isTeacher;

    if (isStudent) {
      if (user) user.isAdmin = false;
      try { localStorage.removeItem('mentix_admin_override'); } catch (e) {}
    }

    // En la barra de navegación: "Inicio", "Unirse a un código" y "Proyectos" visibles para estudiantes y todos los usuarios
    if (projectsLink) {
      projectsLink.style.removeProperty('display');
      projectsLink.style.display = 'inline-flex';
    }

    if (teacherLink) {
      if (!isStudent && (isTeacher || isAdmin)) {
        teacherLink.style.removeProperty('display');
        teacherLink.style.display = 'inline-flex';
      } else {
        teacherLink.style.setProperty('display', 'none', 'important');
      }
    }

    if (adminLink) {
      if (!isStudent && isAdmin) {
        adminLink.style.removeProperty('display');
        adminLink.style.display = 'inline-flex';
      } else {
        adminLink.style.setProperty('display', 'none', 'important');
      }
    }

    if (userSlot) {
      if (user) {
        userSlot.innerHTML = `
          <button class="btn btn-outline" style="padding: 0.4rem 0.85rem; border-radius: 9999px;" onclick="window.appRouter.navigate('profile')">
            <span style="font-size: 1.2rem;">${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(user, 26) : user.avatar}</span>
            <span style="font-weight: 700; font-size: 0.9rem;">${user.name}</span>
            <span class="badge-tag" style="background: rgba(0,245,212,0.15); color: var(--neon-cyan); font-size: 0.7rem; padding: 0.15rem 0.4rem;">
              Niv. ${user.level}
            </span>
          </button>
        `;
      } else {
        userSlot.innerHTML = `
          <button class="btn btn-primary" style="padding: 0.45rem 1rem;" onclick="window.appRouter.openAuthModal('login')">
            <span>👤</span> Entrar
          </button>
        `;
      }
    }
  }

  // Modos de Juego
  resolveChallenge(challengeOrId) {
    if (!challengeOrId) return null;
    if (typeof challengeOrId === 'object' && challengeOrId.title) return challengeOrId;
    const idStr = String(typeof challengeOrId === 'object' ? (challengeOrId.id || '') : challengeOrId).trim();
    if (!idStr) return null;
    let found = (window.appState?.challenges || []).find(item => item && String(item.id).trim() === idStr)
      || (window.appState?.projects || []).find(item => item && String(item.id).trim() === idStr);
    if (!found && typeof DEFAULT_CHALLENGES !== 'undefined') {
      found = DEFAULT_CHALLENGES.find(item => item && String(item.id).trim() === idStr);
    }
    return found || null;
  }

  startSinglePlayer(challengeId, options = {}) {
    let c = this.resolveChallenge(challengeId);
    if (!c && window.ExperienceView?.currentChallenge) c = window.ExperienceView.currentChallenge;
    if (!c && window.LobbyView?.pendingChallenge) c = window.LobbyView.pendingChallenge;
    if (!c && Array.isArray(window.appState?.challenges) && window.appState.challenges.length > 0) {
      c = window.appState.challenges[0];
    }
    if (!c) {
      alert('⚠️ No se encontró la información del cuestionario para iniciar la prueba.');
      return;
    }

    const isOwner = this.isChallengeOwner(c);
    const mode = c.accessMode || (c.isPublic === false ? 'private' : 'public');

    if (!isOwner) {
      if (mode === 'private') {
        alert('🔒 Este cuestionario es privado: solo el creador puede ver el cuestionario.');
        return;
      }
      if (mode === 'room_only') {
        alert('🔑 Acceso por código de sala: los usuarios que tengan el código pueden entrar a la sala, pero no pueden ver el cuestionario.');
        return;
      }
      if (mode === 'temporary' && c.expiresAt && Date.now() > new Date(c.expiresAt).getTime()) {
        alert('⌛ Este cuestionario era temporal y ya no se encuentra disponible.');
        return;
      }
      if (mode === 'private_code') {
        const entered = prompt('🛡️ Este cuestionario es Privado con código o enlace.\n\n⚠️ Importante: en el modo 5, sin el código o el enlace no se puede entrar ni ver el cuestionario.\n\nIngresa el código de acceso autorizado:');
        if (!entered || entered.trim() !== String(c.accessCode || '').trim()) {
          alert('❌ Código de acceso incorrecto. Sin el código o el enlace no se puede entrar ni ver el cuestionario. 🔐');
          return;
        }
      }
    }

    this.navigate('game');
    window.GameView.initSolo(c, options.gameMode || 'clasico', options);
  }

  hostRoom(challengeId, roomType = 'presented') {
    if (this.isGuest()) { this.guestBlocked(); return; }
    let c = this.resolveChallenge(challengeId);
    if (!c && Array.isArray(window.appState?.challenges) && window.appState.challenges.length > 0) {
      c = window.appState.challenges[0];
    }
    if (!c) {
      alert('⚠️ No se encontró el cuestionario seleccionado.');
      return;
    }
    const cleanRoomType = (roomType === 'normal') ? 'normal' : 'presented';
    this.selectExperience(c, 'clasico', cleanRoomType);
  }

  selectExperience(challengeId, defaultMode = 'clasico', roomType = 'presented') {
    let c = this.resolveChallenge(challengeId);
    if (!c) return;
    const cleanRoomType = (roomType === 'normal') ? 'normal' : 'presented';
    this.navigate('select-experience', { challenge: c, gameMode: defaultMode, roomType: cleanRoomType });
  }

  launchHostWithMode(challengeOrId, modeId = 'clasico', config = {}, rosterConfig = null, roomType = 'presented') {
    let c = this.resolveChallenge(challengeOrId);

    if (!c && window.LobbyView?.pendingChallenge) {
      c = window.LobbyView.pendingChallenge;
    }
    if (!c && window.ExperienceView?.currentChallenge) {
      c = window.ExperienceView.currentChallenge;
    }
    if (!c && Array.isArray(window.appState?.challenges) && window.appState.challenges.length > 0) {
      c = window.appState.challenges[0];
    }

    if (!c) {
      alert('⚠️ No se encontró la información del cuestionario para abrir la sala.');
      this.navigate('home');
      return;
    }

    const cleanRoomType = (roomType === 'normal') ? 'normal' : 'presented';
    this.navigate('lobby-host', { challenge: c, gameMode: modeId, modeConfig: config, rosterConfig: rosterConfig, roomType: cleanRoomType });
  }

  startLiveHostGame(room) {
    this.navigate('game');
    window.GameView.initHostGame(room);
  }

  startLivePlayerGame(room) {
    this.navigate('game');
    window.GameView.initPlayerGame(room);
  }

  showLeaderboard(room, isHost) {
    this.navigate('leaderboard');
    window.LeaderboardView.render(room, isHost);
  }

  showPodium(room) {
    this.navigate('podium');
    window.PodiumView.render(room);
  }

  restartSameChallenge() {
    if (window.GameView.challenge) {
      if (window.GameView.isSolo) {
        this.startSinglePlayer(window.GameView.challenge.id);
      } else {
        this.hostRoom(window.GameView.challenge.id);
      }
    } else {
      this.navigate('home');
    }
  }

  startChallengePreview(challengeId) {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;

    const modal = document.getElementById('preview-modal');
    const content = document.getElementById('preview-modal-body');
    if (!modal || !content) return;

    const isOwner = this.isChallengeOwner(c);
    const mode = c.accessMode || (c.isPublic === false ? 'private' : 'public');

    if (!isOwner) {
      if (mode === 'private') {
        alert('🔒 Este cuestionario es privado: solo el creador puede ver el cuestionario.');
        return;
      }
      if (mode === 'room_only') {
        alert('🔑 Acceso por código de sala: los usuarios que tengan el código pueden entrar a la sala, pero no pueden ver el cuestionario directamente.');
        return;
      }
      if (mode === 'temporary' && c.expiresAt && Date.now() > new Date(c.expiresAt).getTime()) {
        alert('⌛ Este cuestionario era temporal y su período de disponibilidad ha finalizado.');
        return;
      }
      if (mode === 'private_code') {
        const entered = prompt('🛡️ Este cuestionario es Privado con código o enlace.\n\n⚠️ Importante: en el modo 5, sin el código o el enlace no se puede entrar ni ver el cuestionario.\n\nIngresa el código de acceso autorizado:');
        if (!entered || entered.trim() !== String(c.accessCode || '').trim()) {
          alert('❌ Código de acceso incorrecto. Sin el código o el enlace no se puede entrar ni ver el cuestionario. 🔐');
          return;
        }
      }
    }

    const diffTag = c.difficulty === 'Fácil' ? 'tag-easy' : c.difficulty === 'Difícil' ? 'tag-hard' : 'tag-medium';
    const numQuestions = c.questions ? c.questions.length : 0;
    const estimatedXp = numQuestions * 50;

    content.innerHTML = `
      <!-- Barra superior fija de navegación -->
      <div class="preview-fullscreen-header">
        <button class="btn btn-outline" style="padding: 0.55rem 1.1rem; font-weight: 700; display: inline-flex; align-items: center; gap: 0.6rem; border-radius: var(--border-radius-md);" onclick="window.appRouter.closeModal('preview-modal')">
          <span style="font-size: 1.1rem;">←</span> <span>Volver a los Retos</span>
        </button>
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          ${isOwner ? `
            <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-weight: 800; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 0.4rem; border-radius: var(--border-radius-md);" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.navigate('creator', { editId: '${c.id}' })">
              <span>✏️</span> <span>Editar Reto</span>
            </button>
          ` : ''}
          <button class="btn btn-outline btn-icon" title="Cerrar" style="width: 38px; height: 38px; border-radius: 50%; font-size: 1.1rem;" onclick="window.appRouter.closeModal('preview-modal')">✕</button>
        </div>
      </div>

      <!-- Hero Banner Panorámico -->
      <div class="preview-fullscreen-hero" style="background-image: url('${c.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200'}');">
        <div class="preview-hero-gradient"></div>
        <div style="position: relative; z-index: 2; max-width: 980px; width: 100%; margin: 0 auto;">
          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; margin-bottom: 1rem; align-items: center;">
            <span class="badge-tag ${diffTag}" style="font-size: 0.85rem; padding: 0.35rem 0.8rem;">${c.categoryName || 'General'}</span>
            <span class="badge-tag" style="background: rgba(0, 0, 0, 0.65); color: var(--neon-gold); border: 1px solid rgba(255, 215, 0, 0.35); font-size: 0.85rem; padding: 0.35rem 0.8rem;">
              🏆 +${estimatedXp} XP posibles
            </span>
            ${c.author ? `<span class="badge-tag" style="background: rgba(255, 255, 255, 0.12); color: var(--text-secondary); font-size: 0.85rem; padding: 0.35rem 0.8rem;">👤 Creador: ${c.author}</span>` : ''}
          </div>
          <h1 style="font-size: clamp(2rem, 4.5vw, 3.2rem); font-weight: 900; color: white; line-height: 1.15; margin: 0 0 0.5rem 0; text-shadow: 0 3px 20px rgba(0,0,0,0.85);">
            ${c.title}
          </h1>
        </div>
      </div>

      <!-- Contenedor Centralizado de Información y Acciones -->
      <div class="preview-fullscreen-container">
        <!-- Descripción -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--border-radius-lg); padding: 1.75rem 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.25);">
          <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 0.65rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📖</span> Acerca de este reto
          </h3>
          <p style="color: var(--text-secondary); font-size: 1.05rem; line-height: 1.65; margin: 0;">
            ${c.description || 'Sin descripción disponible.'}
          </p>
        </div>

        <!-- Estadísticas Clave del Reto -->
        <div class="preview-stats-grid">
          <div class="preview-stat-card">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
              📝 Preguntas
            </div>
            <div style="font-size: 2.3rem; font-weight: 900; color: var(--neon-cyan);">
              ${numQuestions}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">preguntas en el quiz</div>
          </div>

          <div class="preview-stat-card">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
              ⏱️ Tiempo / Pregunta
            </div>
            <div style="font-size: 2.3rem; font-weight: 900; color: var(--neon-gold);">
              ${c.timePerQuestion === 0 ? 'Sin tiempo' : ((c.timePerQuestion || 20) + 's')}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">segundos de límite</div>
          </div>

          <div class="preview-stat-card">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
              ⚡ Nivel de Dificultad
            </div>
            <div style="font-size: 2.3rem; font-weight: 900; color: var(--neon-magenta);">
              ${c.difficulty || 'Medio'}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">complejidad general</div>
          </div>

          <div class="preview-stat-card">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.4rem;">
              🏆 Recompensa
            </div>
            <div style="font-size: 2.3rem; font-weight: 900; color: #10b981;">
              +${estimatedXp} XP
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">máxima experiencia</div>
          </div>
        </div>

        <!-- Botones de Acción para Jugar -->
        <div class="preview-actions-bar">
          <button class="btn btn-outline" style="border-width: 2px;" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.startSinglePlayer('${c.id}')">
            <span style="font-size: 1.6rem;">🎯</span>
            <div style="text-align: left;">
              <div style="font-size: 1.1rem; font-weight: 800;">Jugar Solo (Práctica)</div>
              <div style="font-size: 0.78rem; font-weight: 400; opacity: 0.85;">Entrena y supera tu puntuación personal</div>
            </div>
          </button>
          <button class="btn btn-primary btn-lg" style="box-shadow: 0 0 25px rgba(247, 37, 133, 0.45); background: linear-gradient(135deg, #7928ca, #f72585);" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.hostRoom('${c.id}', 'presented')">
            <span style="font-size: 1.6rem;">📽️</span>
            <div style="text-align: left;">
              <div style="font-size: 1.1rem; font-weight: 900;">Crear Sala con Preguntas Presentadas</div>
              <div style="font-size: 0.78rem; font-weight: 400; opacity: 0.9;">Proyecta en pantalla gigante (Estilo Kahoot / TV)</div>
            </div>
          </button>
          <button class="btn btn-cyan btn-lg" style="box-shadow: 0 0 25px rgba(0, 245, 212, 0.45); background: linear-gradient(135deg, #00b4d8, #0077b6); color: #ffffff;" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.hostRoom('${c.id}', 'normal')">
            <span style="font-size: 1.6rem;">🎮</span>
            <div style="text-align: left;">
              <div style="font-size: 1.1rem; font-weight: 900;">Crear Sala Normal</div>
              <div style="font-size: 0.78rem; font-weight: 400; opacity: 0.9;">Preguntas y respuestas en la pantalla de cada jugador</div>
            </div>
          </button>
        </div>

        <!-- Panel de Administración del Creador -->
        ${isOwner ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; padding: 1.25rem 1.75rem; background: rgba(0, 245, 212, 0.08); border: 1px solid rgba(0, 245, 212, 0.35); border-radius: var(--border-radius-lg); flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <span style="font-size: 1.75rem;">👑</span>
              <div>
                <div style="font-size: 1rem; font-weight: 800; color: white;">Eres el autor de este cuestionario</div>
                <div style="font-size: 0.82rem; color: var(--text-muted);">Tienes permisos exclusivos para editar las preguntas, configuración o remover este reto.</div>
              </div>
            </div>
            <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
              <button class="btn btn-primary" style="padding: 0.65rem 1.3rem; font-size: 0.9rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.45rem; border-radius: var(--border-radius-md);" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.navigate('creator', { editId: '${c.id}' })">
                <span>✏️</span> <span>Editar Cuestionario</span>
              </button>
              <button class="btn btn-danger" style="padding: 0.65rem 1.3rem; font-size: 0.9rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.45rem; border-radius: var(--border-radius-md);" onclick="window.appRouter.deleteChallenge('${c.id}')">
                <span>🗑️</span> <span>Eliminar</span>
              </button>
            </div>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('active');
  }

  deleteChallenge(challengeId) {
    // Redirigir a la función maestra de purga total
    this.purgeProjectCompletely(challengeId);
  }

  /**
   * 🗑️ PURGA TOTAL DE PROYECTO — Elimina un proyecto completamente de toda la plataforma:
   * local, nube (GitHub/Vercel + Supabase), localStorage y tiempo real (MQTT + BroadcastChannel).
   * Solo el autor original o un Administrador pueden invocar esta función.
   * @param {string} projectId - ID del proyecto a eliminar
   * @param {boolean} skipConfirm - Si true, no muestra el diálogo de confirmación (usado desde AdminView)
   */
  async purgeProjectCompletely(projectId, skipConfirm = false) {
    if (!projectId) return;

    const pidStr = String(projectId);
    const allChallenges = window.appState.challenges || [];
    const c = allChallenges.find(item => item && String(item.id) === pidStr);
    // Si no existe en el estado, buscar en Supabase o simplemente proceder con limpieza
    const pTitle = c ? c.title : pidStr;

    // ── 1. Verificar permisos: solo autor o administrador pueden borrar ──────
    if (c && !this.isChallengeOwner(c)) {
      alert('🚫 Solo el creador original o un Administrador pueden eliminar este proyecto.');
      return;
    }

    // ── 2. Confirmación ──────────────────────────────────────────────────────
    if (!skipConfirm) {
      const ok = confirm(`⚠️ ¿Eliminar DEFINITIVAMENTE el proyecto "${pTitle}"?\n\nSe borrará de la plataforma para TODOS los usuarios en todos los dispositivos.`);
      if (!ok) return;
    }

    // ── 3. Eliminar del estado en memoria ────────────────────────────────────
    window.appState.challenges = (window.appState.challenges || []).filter(item => item && String(item.id) !== pidStr);
    if (window.appState.projects) {
      window.appState.projects = (window.appState.projects || []).filter(item => item && String(item.id) !== pidStr);
    }
    // Decrementar contador del usuario si era el autor
    const u = window.appState.currentUser;
    if (u && u.challengesCreated && u.challengesCreated > 0 && c && this.isChallengeOwner(c)) {
      u.challengesCreated--;
    }

    // ── 4. Registrar ID como eliminado en localStorage ───────────────────────
    try {
      const del = JSON.parse(localStorage.getItem('te_reto_deleted_ids') || '[]');
      if (!del.includes(pidStr)) del.push(pidStr);
      localStorage.setItem('te_reto_deleted_ids', JSON.stringify(del));
    } catch (e) {}

    // ── 5. Limpiar todos los almacenes de localStorage ───────────────────────
    try {
      // Mapa de proyectos aprobados
      const approvedMap = JSON.parse(localStorage.getItem('mentix_approved_projects_map') || '{}');
      if (approvedMap[pidStr]) { delete approvedMap[pidStr]; localStorage.setItem('mentix_approved_projects_map', JSON.stringify(approvedMap)); }
    } catch (e) {}
    try {
      // Borradores del asistente GovData
      const drafts = JSON.parse(localStorage.getItem('mentix_govdata_wizard_drafts') || '[]');
      const filteredDrafts = Array.isArray(drafts) ? drafts.filter(d => d && String(d.id) !== pidStr) : [];
      localStorage.setItem('mentix_govdata_wizard_drafts', JSON.stringify(filteredDrafts));
    } catch (e) {}
    try {
      // Landing activo
      const activeLanding = JSON.parse(localStorage.getItem('mentix_active_landing_project') || 'null');
      if (activeLanding && String(activeLanding.id) === pidStr) { localStorage.removeItem('mentix_active_landing_project'); }
    } catch (e) {}
    try {
      // Bóvedas personales de todos los usuarios
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('mentix_user_projects_')) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const list = JSON.parse(raw);
            if (Array.isArray(list) && list.some(item => item && String(item.id) === pidStr)) {
              localStorage.setItem(k, JSON.stringify(list.filter(item => item && String(item.id) !== pidStr)));
            }
          }
        }
      }
    } catch (e) {}
    try {
      // Project Hub
      const allHub = JSON.parse(localStorage.getItem('mentix_project_hub_v1') || '{}');
      if (allHub[pidStr]) { delete allHub[pidStr]; localStorage.setItem('mentix_project_hub_v1', JSON.stringify(allHub)); }
    } catch (e) {}
    try {
      // Códigos personalizados de proyecto
      const codes = JSON.parse(localStorage.getItem('mentix_custom_project_codes') || '[]');
      const filteredCodes = Array.isArray(codes) ? codes.filter(item => item && String(item.projectId) !== pidStr) : [];
      localStorage.setItem('mentix_custom_project_codes', JSON.stringify(filteredCodes));
    } catch (e) {}
    try {
      // IDs de proyectos creados por este navegador
      const myIds = JSON.parse(localStorage.getItem('mentix_my_created_challenge_ids') || '[]');
      if (Array.isArray(myIds) && myIds.includes(pidStr)) {
        localStorage.setItem('mentix_my_created_challenge_ids', JSON.stringify(myIds.filter(id => id !== pidStr)));
      }
      localStorage.removeItem('mentix_creator_' + pidStr);
    } catch (e) {}

    // ── 6. Guardar estado global actualizado ─────────────────────────────────
    saveGlobalState(window.appState);

    // ── 7. Resetear CreatorView si estaba editando este proyecto ─────────────
    if (window.CreatorView && window.CreatorView.currentChallenge && String(window.CreatorView.currentChallenge.id) === pidStr) {
      window.CreatorView.resetForm();
    }

    // ── 8. Eliminar de la nube (Vercel/GitHub) ───────────────────────────────
    try {
      const apiBase = this.getApiBase ? this.getApiBase() : '';
      fetch(`${apiBase}/api/challenges?id=${encodeURIComponent(pidStr)}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}

    // ── 9. Eliminar de Supabase ───────────────────────────────────────────────
    if (window.supabaseService && window.supabaseService.isConnected && window.supabaseService.client) {
      try {
        window.supabaseService.client.from('challenges').delete().eq('id', pidStr).then(() => {}).catch(() => {});
      } catch (e) {}
    }

    // ── 10. Broadcast en tiempo real a TODOS los demás clientes ──────────────
    const broadcastPayload = { type: 'PROJECT_DELETED', projectId: pidStr, timestamp: Date.now() };
    // Via MQTT global
    if (window.realtimeEngine) {
      try {
        const payloadStr = JSON.stringify(broadcastPayload);
        if (window.realtimeEngine.globalMqttClient && window.realtimeEngine.globalMqttClient.connected) {
          window.realtimeEngine.globalMqttClient.publish('mentix/global/project_deleted', payloadStr, { qos: 0 });
        }
        if (window.realtimeEngine.mqttClient && window.realtimeEngine.mqttClient.connected) {
          window.realtimeEngine.mqttClient.publish('mentix/global/project_deleted', payloadStr, { qos: 0 });
        }
        // Via BroadcastChannel (misma pestaña/mismo dispositivo)
        window.realtimeEngine.broadcast(broadcastPayload);
      } catch (e) {}
    }
    // Via localStorage (fallback cross-tab)
    try {
      localStorage.setItem('mentix_realtime_project_deleted', JSON.stringify({ id: pidStr, t: Date.now() }));
    } catch (e) {}

    // ── 11. Feedback sonoro y toast/alert ────────────────────────────────────
    if (window.soundEngine && window.soundEngine.playWrong) { try { window.soundEngine.playWrong(); } catch (e) {} }
    this.closeModal('preview-modal');
    alert(`🗑️ Proyecto "${pTitle}" eliminado definitivamente de toda la plataforma.`);

    // ── 12. Redirigir si el usuario estaba viendo el landing/hub de ese proyecto ─
    if (window.ProjectsView) {
      if (window.ProjectsView.selectedProjectId === pidStr || window.ProjectsView.viewMode === 'landing') {
        window.ProjectsView.selectedProjectId = null;
        window.ProjectsView.viewMode = 'grid';
      }
    }
    if (window.ProjectHub && document.getElementById('phub-overlay')) {
      window.ProjectHub.close();
    }

    // ── 13. Refrescar todas las vistas ────────────────────────────────────────
    if (this.currentView === 'home' && window.HomeView) window.HomeView.render();
    if (this.currentView === 'projects' && window.ProjectsView) window.ProjectsView.render();
    if (this.currentView === 'profile' && window.ProfileView) window.ProfileView.render();
    if (this.currentView === 'creator' && window.CreatorView) this.navigate('home');
    if (window.AdminView && typeof window.AdminView.renderActiveTab === 'function') {
      try { window.AdminView.renderActiveTab(); } catch (e) {}
    }
  }

  // Progreso de XP y subida de nivel
  addXP(amount) {
    const u = window.appState.currentUser;
    if (!u) return;

    u.xp = (u.xp || 0) + amount;
    const oldLevel = u.level || 1;

    // Calcular si sube de nivel
    for (let i = DEFAULT_LEVELS.length - 1; i >= 0; i--) {
      if (u.xp >= DEFAULT_LEVELS[i].minXp) {
        u.level = DEFAULT_LEVELS[i].level;
        u.levelName = DEFAULT_LEVELS[i].name;
        break;
      }
    }

    if (u.level > oldLevel) {
      window.soundEngine.playFanfare();
      alert(`🎉 ¡FELICITACIONES! Has subido al Nivel ${u.level} — ${u.levelName}!`);
    }

    saveGlobalState(window.appState);
    this.updateNavbar();
  }

  checkMedals(medalId) {
    const u = window.appState.currentUser;
    if (!u.medals) u.medals = [];
    if (!u.medals.includes(medalId)) {
      u.medals.push(medalId);
      saveGlobalState(window.appState);
      const medal = DEFAULT_MEDALS.find(m => m.id === medalId);
      if (medal) {
        alert(`🎖️ ¡Nueva medalla desbloqueada: "${medal.title}"! ${medal.icon}`);
      }
    }
  }

  // Modales
  openAuthModal(tab = 'login') {
    const modal = document.getElementById('auth-modal');
    if (!modal) return;
    this.switchAuthTab(tab);
    const closeBtn = document.getElementById('auth-close-btn');
    if (closeBtn) closeBtn.style.display = localStorage.getItem('te_reto_session') ? '' : 'none';
    modal.classList.add('active');
  }

  switchAuthTab(tab) {
    const loginForm = document.getElementById('auth-login-form');
    const registerForm = document.getElementById('auth-register-form');
    const tabLogin = document.getElementById('tab-btn-login');
    const tabReg = document.getElementById('tab-btn-reg');

    if (tab === 'login') {
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      tabLogin.classList.add('btn-cyan');
      tabLogin.classList.remove('btn-outline');
      tabReg.classList.add('btn-outline');
      tabReg.classList.remove('btn-cyan');
    } else {
      loginForm.style.display = 'none';
      registerForm.style.display = 'block';
      tabReg.classList.add('btn-cyan');
      tabReg.classList.remove('btn-outline');
      tabLogin.classList.add('btn-outline');
      tabLogin.classList.remove('btn-cyan');
    }
  }

  async hashPassword(email, password) {
    const data = new TextEncoder().encode(email.toLowerCase() + ':' + password);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  finishAuth(user, message) {
    window.appState.currentUser = user;
    saveGlobalState(window.appState);
    localStorage.setItem('te_reto_session', '1');
    this.closeModal('auth-modal');
    this.updateNavbar();
    this.syncChallengesWithCloud(true);
    if (message) alert(message);
  }

  async handleLogin(e) {
    e.preventDefault();
    const id = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    const user = window.appState.users.find(u =>
      (u.email && u.email.toLowerCase() === id) || (u.username && u.username.toLowerCase() === id)
    );
    if (!user) {
      alert('⚠️ No existe una cuenta con ese correo o usuario. Crea una cuenta nueva.');
      return;
    }
    if (!user.passwordHash) {
      alert('⚠️ Esta cuenta no tiene contraseña (se creó con Google/Microsoft o es antigua). Usa el botón de Google/Microsoft o crea una cuenta nueva.');
      return;
    }
    const hash = await this.hashPassword(user.email, password);
    if (hash !== user.passwordHash) {
      alert('❌ Contraseña incorrecta.');
      return;
    }
    this.finishAuth(user, `¡Bienvenido de nuevo, ${user.name}!`);
    this.navigate('home');
  }

  async handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;
    const role = document.getElementById('reg-role').value;

    if (password.length < 6) {
      alert('⚠️ La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== password2) {
      alert('⚠️ Las contraseñas no coinciden.');
      return;
    }
    const exists = window.appState.users.find(u =>
      (u.email && u.email.toLowerCase() === email.toLowerCase()) ||
      (u.username && u.username.toLowerCase() === username.toLowerCase())
    );
    if (exists) {
      alert('⚠️ Ya existe una cuenta con ese correo o usuario. Inicia sesión.');
      this.switchAuthTab('login');
      return;
    }

    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: username,
      email: email,
      passwordHash: await this.hashPassword(email, password),
      role: role,
      avatar: role === 'teacher' ? '👨‍🏫' : '🦊',
      xp: 100,
      level: 1,
      levelName: 'Principiante',
      challengesPlayed: 0,
      challengesCreated: 0,
      victories: 0,
      medals: [],
      institution: 'Comunidad MENTIX',
      status: 'active'
    };

    window.appState.users.push(newUser);
    this.finishAuth(newUser);
    window.soundEngine.playFanfare();
    alert(`🎉 ¡Cuenta creada con éxito! Bienvenido a MENTIX, ${name}.`);
    this.navigate('profile');
  }

  guestLogin() {
    const guest = {
      id: 'guest_' + Date.now(),
      name: 'Invitado',
      username: 'invitado',
      email: '',
      role: 'student',
      avatar: '👤',
      xp: 0,
      level: 1,
      levelName: 'Invitado',
      challengesPlayed: 0,
      challengesCreated: 0,
      victories: 0,
      medals: [],
      institution: 'Invitado',
      status: 'active',
      isGuest: true
    };
    this.finishAuth(guest);
    this.navigate('home');
  }

  async logout(skipConfirm = false) {
    if (!skipConfirm && !confirm('¿Seguro que quieres cerrar sesión?')) return;
    try {
      if (window.supabaseService && window.supabaseService.client) {
        await window.supabaseService.client.auth.signOut();
      }
    } catch (e) {}
    localStorage.removeItem('te_reto_session');
    localStorage.removeItem('te_reto_current_user');
    window.location.hash = '';
    window.location.reload();
  }

  // Inicio de sesión real con Google (Gmail) o Microsoft mediante Supabase Auth
  async oauthLogin(provider) {
    const client = window.supabaseService && window.supabaseService.client;
    if (!client) {
      alert('⚠️ No se pudo conectar con el servicio de autenticación. Revisa tu conexión a internet.');
      return;
    }
    try {
      const options = { redirectTo: window.location.origin + window.location.pathname };
      if (provider === 'azure') options.scopes = 'email';
      const { error } = await client.auth.signInWithOAuth({ provider, options });
      if (error) throw error;
    } catch (err) {
      alert(`⚠️ No se pudo iniciar con ${provider === 'google' ? 'Google' : 'Microsoft'}: ${err.message || err}\n\nVerifica que el proveedor esté activado en Supabase (Authentication → Providers).`);
    }
  }

  // Al volver de Google/Microsoft: crear o recuperar el usuario local con ese correo
  async checkOAuthSession() {
    const client = window.supabaseService && window.supabaseService.client;
    if (!client) return false;
    try {
      const { data } = await client.auth.getSession();
      const su = data && data.session && data.session.user;
      if (!su || !su.email) return false;

      const meta = su.user_metadata || {};
      let user = window.appState.users.find(u => u.email && u.email.toLowerCase() === su.email.toLowerCase());
      if (!user) {
        user = {
          id: 'user_' + Date.now(),
          name: meta.full_name || meta.name || su.email.split('@')[0],
          username: su.email.split('@')[0],
          email: su.email,
          role: 'student',
          avatar: '🦊',
          xp: 100,
          level: 1,
          levelName: 'Principiante',
          challengesPlayed: 0,
          challengesCreated: 0,
          victories: 0,
          medals: [],
          institution: 'Comunidad MENTIX',
          status: 'active',
          provider: (su.app_metadata && su.app_metadata.provider) || 'oauth'
        };
        window.appState.users.push(user);
      }
      this.finishAuth(user);
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', window.location.pathname);
      }
      return true;
    } catch (e) {
      return false;
    }
  }

  openCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) {
      this.renderCategoryModalList();
      modal.classList.add('active');
    }
  }

  renderCategoryModalList() {
    const listContainer = document.getElementById('cat-existing-list');
    if (!listContainer) return;
    const isBlocked = (c) => {
      if (!c || !c.id) return true;
      const cid = String(c.id).toLowerCase().trim();
      const cname = String(c.name || '').toLowerCase().trim();
      return ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
    };
    const cats = (window.appState.categories || []).filter(c => !isBlocked(c));
    if (cats.length === 0) {
      listContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem; margin: 0;">No hay categorías registradas.</p>';
      return;
    }
    listContainer.innerHTML = cats.map(c => `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.45rem 0.75rem; background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem;">
          <span>${c.icon || '📁'}</span>
          <span style="font-weight: 700; color: ${c.color || 'white'};">${c.name}</span>
        </div>
        ${this.isCategoryOwner(c) ? `<button type="button" class="btn btn-outline" style="padding: 0.2rem 0.5rem; font-size: 0.75rem; border-color: rgba(239, 68, 68, 0.5); color: #f87171;" onclick="window.appRouter.deleteCategory('${c.id}')" title="Eliminar categoría">
          🗑️
        </button>` : ''}
      </div>
    `).join('');
  }

  getDeletedCategoryIds() {
    try {
      const arr = JSON.parse(localStorage.getItem('mentix_deleted_categories_v1') || '[]');
      return Array.isArray(arr) ? arr.map(x => String(x || '').toLowerCase().trim()).filter(Boolean) : [];
    } catch (e) {
      return [];
    }
  }

  saveDeletedCategoryIds(ids) {
    try {
      const unique = Array.from(new Set((ids || []).map(x => String(x || '').toLowerCase().trim()).filter(Boolean)));
      localStorage.setItem('mentix_deleted_categories_v1', JSON.stringify(unique));
    } catch (e) {}
  }

  async saveGlobalCategoriesToSupabase(categoriesList, deletedIds) {
    try {
      if (window.supabaseEngine && typeof window.supabaseEngine.saveWizardDraft === 'function') {
        const cleanDeleted = Array.from(new Set((deletedIds || []).map(x => String(x || '').toLowerCase().trim()).filter(Boolean)));
        await window.supabaseEngine.saveWizardDraft(
          'mentix_global_exam_categories_v1',
          'mentix_global_exam_categories_v1',
          'system_admin',
          1,
          [],
          { categories: categoriesList || [], deletedIds: cleanDeleted, updatedAt: Date.now() }
        );
      }
    } catch (e) {
      console.warn('No se pudo guardar categorías globales en Supabase:', e);
    }
  }

  async loadGlobalCategoriesFromSupabase() {
    try {
      if (window.supabaseEngine && typeof window.supabaseEngine.loadWizardDraft === 'function') {
        const res = await window.supabaseEngine.loadWizardDraft('mentix_global_exam_categories_v1');
        const payload = res && (res.draftData || res.draft_data || res.data || res);
        if (payload && (Array.isArray(payload.categories) || Array.isArray(payload.deletedIds))) {
          return payload;
        }
      }
    } catch (e) {
      console.warn('No se pudo leer categorías globales desde Supabase:', e);
    }
    return null;
  }

  isCategoryOwner(cat) {
    if (!cat) return false;
    // Verificar primero cualquier credencial de Administrador activa
    if (window.AdminView && typeof window.AdminView.isAdminUser === 'function' && window.AdminView.isAdminUser()) {
      return true;
    }
    try {
      if (localStorage.getItem('mentix_admin_override') === 'true') return true;
    } catch (e) {}

    const u = window.appState?.currentUser;
    if (!u) return false;
    const role = (u.role || '').trim().toLowerCase();
    const name = (u.name || '').trim().toLowerCase();
    const email = (u.email || '').trim().toLowerCase();
    // Administradores y Melisa pueden eliminar cualquier categoría globalmente
    if (u.isAdmin === true || role === 'admin' || role === 'administrador' || role === 'superadmin' || name === 'melisa' || email === 'meli030814abc@gmail.com') {
      return true;
    }
    if (u.isGuest) return false;
    // El autor puede eliminar las categorías que creó
    if (cat.authorId && u.id && String(cat.authorId) === String(u.id)) return true;
    if (cat.authorEmail && email && String(cat.authorEmail).trim().toLowerCase() === email) return true;
    if (cat.authorName && name && String(cat.authorName).trim().toLowerCase() === name) return true;
    return false;
  }

  async deleteCategory(categoryId) {
    if (!categoryId) return;
    const cat = (window.appState.categories || []).find(c => c.id === categoryId);
    if (cat && !this.isCategoryOwner(cat)) {
      alert('🚫 Solo el creador de esta categoría o un Administrador pueden eliminarla.');
      return;
    }
    const catName = cat ? cat.name : categoryId;
    if (!confirm(`🗑️ ¿Estás seguro de que deseas eliminar la categoría "${catName}" para TODOS los usuarios?`)) return;

    const targetId = String(categoryId).toLowerCase().trim();
    const targetName = String(catName || '').toLowerCase().trim();
    const deletedSet = new Set(this.getDeletedCategoryIds());
    deletedSet.add(targetId);
    if (targetName) deletedSet.add(targetName);
    const deletedIds = Array.from(deletedSet);
    this.saveDeletedCategoryIds(deletedIds);

    const isBlocked = (c) => {
      if (!c || !c.id) return true;
      const cid = String(c.id).toLowerCase().trim();
      const cname = String(c.name || '').toLowerCase().trim();
      return deletedSet.has(cid) || deletedSet.has(cname) || ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
    };

    // 1. Eliminar localmente sin re-inyectar categorías por defecto
    window.appState.categories = (window.appState.categories || []).filter(c => !isBlocked(c));
    saveGlobalState(window.appState);

    // 2. Reasignar cualquier reto que tuviera esta categoría a otra disponible
    const fallbackCat = window.appState.categories[0] || { id: 'general', name: 'General' };
    if (Array.isArray(window.appState.challenges)) {
      window.appState.challenges.forEach(ch => {
        if (String(ch.category || '').toLowerCase().trim() === targetId || ['fhjr', 'kj'].includes(String(ch.category || '').toLowerCase().trim())) {
          ch.category = fallbackCat.id;
          ch.categoryName = fallbackCat.name;
        }
      });
      saveGlobalState(window.appState);
    }

    // 3. Guardar borrado inmediatamente en Supabase Cloud (propagación en vivo a TODOS los estudiantes)
    await this.saveGlobalCategoriesToSupabase(window.appState.categories, deletedIds);

    // 4. Eliminar también en la nube pública (/api/categories -> GitHub)
    try {
      const apiBase = this.getApiBase();
      await fetch(`${apiBase}/api/categories?id=${encodeURIComponent(categoryId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Error eliminando categoría en /api/categories:', e);
    }

    // Si estaba filtrada la categoría eliminada, volver a 'all'
    if (window.HomeView && String(window.HomeView.activeCategory || '').toLowerCase().trim() === targetId) {
      window.HomeView.activeCategory = 'all';
    }

    this.renderCategoryModalList();
    if (window.HomeView && this.currentView === 'home') window.HomeView.render();
    if (window.ProjectsView && this.currentView === 'projects') window.ProjectsView.render();
    if (window.soundEngine) window.soundEngine.playTrash();
  }

  getApiBase() {
    const h = window.location.hostname || '';
    return h.endsWith('vercel.app') ? '' : 'https://mentixs.vercel.app';
  }

  async handleCreateCategory(e) {
    e.preventDefault();
    const nameInput = document.getElementById('cat-name');
    const iconInput = document.getElementById('cat-icon');
    const colorInput = document.getElementById('cat-color');
    const name = nameInput ? nameInput.value.trim() : '';
    const icon = (iconInput && iconInput.value.trim()) ? iconInput.value.trim() : '💡';
    const color = (colorInput && colorInput.value) ? colorInput.value : '#00f5d4';

    if (!name) return;

    const cleanId = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '_');
    const cu = window.appState.currentUser || {};
    const newCat = {
      id: cleanId,
      name: name,
      icon: icon,
      color: color,
      count: 0,
      authorId: cu.id || '',
      authorName: cu.name || '',
      authorEmail: cu.email || ''
    };

    const isBlocked = (c) => {
      if (!c || !c.id) return true;
      const cid = String(c.id).toLowerCase().trim();
      const cname = String(c.name || '').toLowerCase().trim();
      return ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
    };

    // 1. Conservar las categorías vigentes sin resucitar categorías eliminadas por el administrador
    const catMap = new Map();
    const baseCats = (Array.isArray(window.appState.categories) && window.appState.categories.length > 0)
      ? window.appState.categories
      : (DEFAULT_CATEGORIES || []);
    baseCats.forEach(c => {
      if (!isBlocked(c)) catMap.set(c.id, c);
    });
    if (!isBlocked(newCat)) {
      catMap.set(newCat.id, newCat);
    }
    ['fhjr', 'kj'].forEach(b => catMap.delete(b));

    // Si se vuelve a crear una categoría antes borrada, quitarla de deletedIds
    const deletedAfterCreate = this.getDeletedCategoryIds().filter(id => id !== cleanId && id !== name.toLowerCase());
    this.saveDeletedCategoryIds(deletedAfterCreate);

    const mergedCategories = Array.from(catMap.values()).filter(c => !isBlocked(c));
    window.appState.categories = mergedCategories;
    saveGlobalState(window.appState);

    this.closeModal('category-modal');
    if (nameInput) nameInput.value = '';

    // Refrescar vistas locales activas inmediatamente
    if (window.HomeView && this.currentView === 'home') window.HomeView.render();
    if (window.ProjectsView && this.currentView === 'projects') window.ProjectsView.render();

    // 2. Guardar en Supabase Cloud en vivo para todos los usuarios
    await this.saveGlobalCategoriesToSupabase(mergedCategories, deletedAfterCreate);

    // 3. Guardar también en la nube pública (/api/categories)
    try {
      const apiBase = this.getApiBase();
      await fetch(`${apiBase}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCat })
      });
    } catch (cloudErr) {
      console.warn('Categoría guardada localmente/Supabase, sincronización GitHub diferida:', cloudErr);
    }

    if (window.soundEngine) window.soundEngine.playCorrect();
    alert(`✅ Categoría "${name}" agregada con éxito.`);
  }

  async syncCategoriesWithCloud() {
    try {
      const sanitizeCat = (c) => (typeof window.sanitizeCategoryRecord === 'function' ? window.sanitizeCategoryRecord(c) : c);

      // 1. Leer primero desde Supabase Cloud (estado global autoritativo en tiempo real)
      const supaState = await this.loadGlobalCategoriesFromSupabase();
      const deletedSet = new Set(this.getDeletedCategoryIds());
      if (supaState && Array.isArray(supaState.deletedIds)) {
        supaState.deletedIds.forEach(id => {
          const norm = String(id || '').toLowerCase().trim();
          if (norm) deletedSet.add(norm);
        });
        this.saveDeletedCategoryIds(Array.from(deletedSet));
      }

      const isBlocked = (c) => {
        if (!c || !c.id) return true;
        const cid = String(c.id).toLowerCase().trim();
        const cname = String(c.name || '').toLowerCase().trim();
        return deletedSet.has(cid) || deletedSet.has(cname) || ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
      };

      if (supaState && Array.isArray(supaState.categories)) {
        window.appState.categories = supaState.categories.map(sanitizeCat).filter(c => c && !isBlocked(c));
        saveGlobalState(window.appState);
      } else {
        // Respaldo: leer de /api/categories o data/categories.json aplicando siempre deletedSet
        let cloudCategories = null;
        try {
          const apiBase = this.getApiBase();
          const res = await fetch(`${apiBase}/api/categories?t=${Date.now()}`, { cache: 'no-store' });
          if (res.ok) {
            const json = await res.json();
            if (Array.isArray(json)) cloudCategories = json;
            else if (json.categories && Array.isArray(json.categories)) cloudCategories = json.categories;
          }
        } catch (errCloud) {
          try {
            const resStatic = await fetch(`data/categories.json?t=${Date.now()}`, { cache: 'no-store' });
            if (resStatic.ok) cloudCategories = await resStatic.json();
          } catch (e) {}
        }

        if (Array.isArray(cloudCategories)) {
          window.appState.categories = cloudCategories.map(sanitizeCat).filter(c => c && !isBlocked(c));
          saveGlobalState(window.appState);
        } else if (!Array.isArray(window.appState.categories) || window.appState.categories.length === 0) {
          window.appState.categories = (DEFAULT_CATEGORIES || []).map(sanitizeCat).filter(c => c && !isBlocked(c));
          saveGlobalState(window.appState);
        }
      }

      if (this.currentView === 'home' && window.HomeView) {
        window.HomeView.render();
      } else if (this.currentView === 'projects' && window.ProjectsView && window.ProjectsView.viewMode !== 'wizard') {
        window.ProjectsView.render();
      }
    } catch (e) {
      console.warn('Error sincronizando categorías globales:', e);
    }
  }

  isChallengeOwner(challenge) {
    if (!challenge) return false;
    const u = window.appState?.currentUser;
    if (!u) return false;

    const clean = s => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const cleanName = clean(u.name);
    const cleanUsername = clean(u.username);
    const cleanEmail = clean(u.email);
    const isMelisa = cleanName === 'melisa' || cleanUsername === 'melisa' || cleanEmail === 'meli030814abc@gmail.com' || cleanEmail.startsWith('melisa');

    // 1. Melisa tiene permisos globales absolutos para editar todos los exámenes, retos y proyectos
    if (isMelisa) return true;

    // 2. Administradores oficiales de la plataforma
    const roleLower = String(u.role || '').toLowerCase().trim();
    const isStudentOrTeacher = roleLower === 'student' || roleLower === 'estudiante' || roleLower === 'teacher' || roleLower === 'profesor' || roleLower === 'docente';
    const isAdmin = !isStudentOrTeacher && (roleLower === 'admin' || roleLower === 'administrador' || u.isAdmin === true || (window.AdminView && window.AdminView.isAdminAuditing));
    if (isAdmin) return true;

    // Si el reto de AGILE Y SCRUM es exclusivo de Melisa
    const cleanTitle = clean(challenge.title);
    const isAgileScrum = (cleanTitle.includes('agile') && cleanTitle.includes('scrum')) || challenge.id === 'reto_1792180343870';
    if (isAgileScrum) return false;

    // 3. Creador original del examen o proyecto (por id, correo, nombre o username)
    const currentId = String(u.id || '').trim();
    const authorId = String(challenge.authorId || challenge.creatorId || '').trim();
    const authorEmail = clean(challenge.authorEmail);
    const authorName = clean(challenge.author || challenge.creatorName || challenge.teamLead);
    const authorsConfigList = clean(challenge.authorsConfig?.authorsList);
    const authorsConfigEmails = clean(challenge.authorsConfig?.authorsEmails);

    if (currentId && authorId && (authorId === currentId || authorId === 'usr_' + currentId)) return true;
    if (cleanEmail && (authorEmail === cleanEmail || (authorsConfigEmails && authorsConfigEmails.includes(cleanEmail)))) return true;
    if (cleanName && authorName && (authorName === cleanName || (authorsConfigList && authorsConfigList.includes(cleanName)))) return true;
    if (cleanUsername && authorName && (authorName === cleanUsername || (authorsConfigList && authorsConfigList.includes(cleanUsername)))) return true;

    // 4. Verificar si este navegador creó este reto/proyecto localmente (IDs guardados en localStorage)
    try {
      const myIds = JSON.parse(localStorage.getItem('mentix_my_created_challenge_ids') || '[]');
      if (Array.isArray(myIds) && myIds.includes(challenge.id)) {
        return true;
      }
      if (localStorage.getItem('mentix_creator_' + challenge.id) === 'true') {
        return true;
      }
    } catch(e) {}

    // 5. Verificar si el proyecto reside en la bóveda personal del usuario
    try {
      const userKey = u.id || u.username || u.email;
      if (userKey) {
        const vault = JSON.parse(localStorage.getItem('mentix_user_projects_' + userKey) || '[]');
        if (Array.isArray(vault) && vault.some(p => p && String(p.id) === String(challenge.id))) {
          return true;
        }
      }
    } catch(e) {}

    return false;
  }

  async pushChallengeToCloud(challenge) {
    if (!challenge || !challenge.id) return { ok: false, persisted: false };
    this.lastCloudPersisted = undefined;
    try {
      if (!challenge.title || !String(challenge.title).trim()) {
        challenge.title = challenge.landingConfig?.publicName || 'Proyecto Mentix';
      }
      if (!challenge.projectType) {
        challenge.projectType = (challenge.isGovDataProject || challenge.slides) ? 'presentation' : 'quiz';
      }
      // Los proyectos solo son públicos en la nube cuando un administrador los autoriza
      if (challenge.projectType !== 'quiz') {
        const isApprovedNow = challenge.approvalStatus === 'approved' && !challenge.rejectionReason;
        challenge.isPublic = isApprovedNow;
        if (isApprovedNow) {
          challenge.accessMode = 'public';
          challenge.visibility = 'public';
          challenge.publicationStatus = 'published';
          challenge.status = 'completed';
          challenge.stage = 'completed';
        }
      } else {
        challenge.isPublic = true;
      }
      if (window.supabaseService && typeof window.supabaseService.saveChallengeToSupabase === 'function') {
        try { window.supabaseService.saveChallengeToSupabase(challenge); } catch(e) {}
      }
      challenge.updatedAt = new Date().toISOString();

      const buildCleanBody = (stripHeavy = false) => {
        let obj = typeof window.compactProjectForStorage === 'function'
          ? window.compactProjectForStorage(challenge, stripHeavy)
          : { ...challenge };
        if (stripHeavy) {
          const stripGiantData = (val) => {
            if (typeof val === 'string') {
              return (val.startsWith('data:image/') && val.length > 55000) ? '' : val;
            }
            if (Array.isArray(val)) return val.map(stripGiantData);
            if (val && typeof val === 'object') {
              const out = {};
              for (const k in val) out[k] = stripGiantData(val[k]);
              return out;
            }
            return val;
          };
          obj = stripGiantData(obj);
        }
        return JSON.stringify({ challenge: obj });
      };

      const apiBase = this.getApiBase();
      const sendPayload = async (bodyStr) => {
        const controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
        const timeoutId = controller ? setTimeout(() => controller.abort(), 22000) : null;
        const resp = await fetch(`${apiBase}/api/challenges`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: bodyStr,
          signal: controller ? controller.signal : undefined
        }).catch(err => {
          console.warn('Aviso de red al sincronizar reto (/api/challenges):', err.message);
          return null;
        });
        if (timeoutId) clearTimeout(timeoutId);
        return resp;
      };

      let bodyStr = buildCleanBody(false);
      // Si el proyecto supera 3.2 MB (riesgo de 413 en Vercel), compactar automáticamente para no perder la autorización en la nube
      if (bodyStr.length > 3200000) {
        bodyStr = buildCleanBody(true);
      }

      let res = await sendPayload(bodyStr);
      if (!res || (!res.ok && (res.status === 413 || res.status >= 500))) {
        const lightBody = buildCleanBody(true);
        if (lightBody.length < bodyStr.length) {
          res = await sendPayload(lightBody);
        }
      }

      if (res && res.ok) {
        let persisted = false;
        try { const j = await res.json(); persisted = !!(j && j.persisted); } catch (e) {}
        this.lastCloudPersisted = persisted;
        console.log('☁️ Reto enviado a MENTIX Cloud (persistido: ' + persisted + '):', challenge.title);
        return { ok: true, persisted };
      } else {
        this.lastCloudPersisted = false;
        if (res) console.warn('Respuesta no-ok al guardar en /api/challenges:', res.status);
        return { ok: false, persisted: false };
      }
    } catch(e) {
      this.lastCloudPersisted = false;
      console.warn('Error al subir reto a la nube (/api/challenges):', e);
      return { ok: false, persisted: false };
    }
  }

  async deleteChallengeFromCloud(challengeId) {
    if (!challengeId) return;
    try {
      const apiBase = this.getApiBase();
      await fetch(`${apiBase}/api/challenges?id=${encodeURIComponent(challengeId)}`, {
        method: 'DELETE'
      });
      console.log('🗑️ Reto eliminado de MENTIX Cloud:', challengeId);
    } catch(e) {
      console.warn('Error eliminando reto de la nube:', e);
    }
  }

  async syncChallengesWithCloud(force = false) {
    const nowMs = Date.now();
    if (this._challengesSyncInFlight) {
      if (force) this._pendingForcedChallengesSync = true;
      return;
    }
    if (!force && (nowMs - (this._lastChallengesSyncAt || 0)) < 8000) {
      return;
    }
    this._challengesSyncInFlight = true;
    this._lastChallengesSyncAt = nowMs;

    try {
      let cloudChallenges = null;

      // Sincronizar códigos de proyectos creados por profesores y admins en la nube (Supabase + API, respetando eliminaciones)
      try {
        if (window.ProjectsView && typeof window.ProjectsView.syncCustomProjectCodesFromCloud === 'function') {
          await window.ProjectsView.syncCustomProjectCodesFromCloud();
        }
      } catch (errCodes) {}

      // 1. Consultar API global de retos en Vercel sin caché
      try {
        const apiBase = this.getApiBase();
        const res = await fetch(`${apiBase}/api/challenges?t=${Date.now()}&fresh=1`, { cache: 'no-store' });
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            cloudChallenges = json;
          }
        }
      } catch (errApi) {
        console.warn('No se pudo conectar a /api/challenges:', errApi);
      }

      // 2. Fallback directo a la rama de base de datos global mentix-data en GitHub y luego a data/challenges.json local
      if (!cloudChallenges) {
        try {
          const resRawGh = await fetch(`https://raw.githubusercontent.com/meli030814abc-sys/Mentix/mentix-data/data/challenges.json?t=${Date.now()}`, { cache: 'no-store' });
          if (resRawGh.ok) {
            const jsonRawGh = await resRawGh.json();
            if (Array.isArray(jsonRawGh) && jsonRawGh.length > 0) {
              cloudChallenges = jsonRawGh;
            }
          }
        } catch(e) {}
      }
      if (!cloudChallenges) {
        try {
          const resStatic = await fetch(`data/challenges.json?t=${Date.now()}`, { cache: 'no-store' });
          if (resStatic.ok) {
            const jsonStatic = await resStatic.json();
            if (Array.isArray(jsonStatic) && jsonStatic.length > 0) {
              cloudChallenges = jsonStatic;
            }
          }
        } catch(e) {}
      }

      // Retos eliminados: quitarlos de la nube y de este dispositivo (sin ocultar nunca proyectos autorizados vigentes en la nube)
      const cloudApprovedIds = new Set(
        (Array.isArray(cloudChallenges) ? cloudChallenges : [])
          .filter(c => c && c.id && c.approvalStatus === 'approved' && !c.rejectionReason)
          .map(c => String(c.id))
      );
      let deletedIds = [];
      try {
        const resDel = await fetch(`${this.getApiBase()}/api/challenges?deleted=1&t=${Date.now()}`, { cache: 'no-store' });
        if (resDel.ok) {
          const jd = await resDel.json();
          if (Array.isArray(jd)) deletedIds = jd;
        }
      } catch (errDel) {}
      try {
        const own = JSON.parse(localStorage.getItem('te_reto_deleted_ids') || '[]');
        if (Array.isArray(own)) {
          const cleanOwn = own.filter(id => !cloudApprovedIds.has(String(id)));
          deletedIds = Array.from(new Set([...deletedIds, ...cleanOwn]));
        }
      } catch (e) {}
      deletedIds = deletedIds.filter(id => !cloudApprovedIds.has(String(id)));
      if (deletedIds.length > 0) {
        const gone = new Set(deletedIds.map(id => String(id)));
        // Persistir globalmente la lista de eliminados en localStorage para que ninguna vista los resucite
        try { localStorage.setItem('te_reto_deleted_ids', JSON.stringify(Array.from(gone))); } catch (e) {}

        let purgedAny = false;
        if (Array.isArray(cloudChallenges)) {
          cloudChallenges = cloudChallenges.filter(c => c && !gone.has(String(c.id)));
        }
        const before = (window.appState.challenges || []).length;
        window.appState.challenges = (window.appState.challenges || []).filter(c => c && !gone.has(String(c.id)));
        if (window.appState.challenges.length !== before) purgedAny = true;

        // Purgar también todos los cachés/borradores locales del navegador (estudiantes, docentes, admins)
        ['mentix_govdata_wizard_drafts', 'mentix_projects_vault', 'te_reto_challenges', 'mentix_challenges', 'mentix_projects'].forEach(key => {
          try {
            const raw = localStorage.getItem(key);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) {
              const filtered = parsed.filter(item => item && !gone.has(String(item.id)));
              if (filtered.length !== parsed.length) {
                localStorage.setItem(key, JSON.stringify(filtered));
                purgedAny = true;
              }
            }
          } catch (e) {}
        });

        try {
          const activeLanding = JSON.parse(localStorage.getItem('mentix_active_landing_project') || 'null');
          if (activeLanding && gone.has(String(activeLanding.id))) {
            localStorage.removeItem('mentix_active_landing_project');
            purgedAny = true;
          }
        } catch (e) {}

        try {
          const appMap = JSON.parse(localStorage.getItem('mentix_approved_projects_map') || '{}');
          let changedMap = false;
          gone.forEach(gid => { if (appMap[gid]) { delete appMap[gid]; changedMap = true; } });
          if (changedMap) localStorage.setItem('mentix_approved_projects_map', JSON.stringify(appMap));
        } catch (e) {}

        try {
          const codeMap = JSON.parse(localStorage.getItem('mentix_code_draft_map') || '{}');
          let changedCodeMap = false;
          Object.keys(codeMap).forEach(k => { if (gone.has(String(codeMap[k]))) { delete codeMap[k]; changedCodeMap = true; } });
          if (changedCodeMap) localStorage.setItem('mentix_code_draft_map', JSON.stringify(codeMap));
        } catch (e) {}

        if (purgedAny) {
          saveGlobalState(window.appState);
          if (this.currentView === 'home' && window.HomeView) window.HomeView.render();
          else if (this.currentView === 'projects' && window.ProjectsView && window.ProjectsView.viewMode !== 'wizard') window.ProjectsView.render();
          else if (this.currentView === 'admin' && window.AdminView) window.AdminView.render();
          else if (this.currentView === 'profile' && window.ProfileView) window.ProfileView.render();
        }
      }

      // Sincronizar Banner Principal Global del Admin para TODOS los usuarios siempre al iniciar
      if (window.ProjectsView && typeof window.ProjectsView.syncHeroBannerFromCloud === 'function') {
        window.ProjectsView.syncHeroBannerFromCloud().catch(() => {});
      }

      if (Array.isArray(cloudChallenges) && cloudChallenges.length > 0) {
        if (typeof window.deepCleanMojibake === 'function') {
          cloudChallenges = window.deepCleanMojibake(cloudChallenges);
        }

        const local = Array.isArray(window.appState.challenges) ? window.appState.challenges : [];
        const map = new Map();
        local.forEach(c => { if (c && c.id) map.set(c.id, c); });

        let appMap = {};
        let appMapDirty = false;
        try { appMap = JSON.parse(localStorage.getItem('mentix_approved_projects_map') || '{}') || {}; } catch(e) {}

        let unappMap = {};
        let unappMapDirty = false;
        try { unappMap = JSON.parse(localStorage.getItem('mentix_unapproved_projects_map') || '{}') || {}; } catch(e) {}

        let wizardDraftsCache = null;
        let wizardDraftsDirty = false;
        try {
          const rawWd = localStorage.getItem('mentix_govdata_wizard_drafts');
          if (rawWd) {
            const parsedWd = JSON.parse(rawWd);
            if (Array.isArray(parsedWd)) wizardDraftsCache = parsedWd;
          }
        } catch (e) {}

        const syncLocalDraftApproval = (projId, isApprovedNow, metaProj) => {
          if (!Array.isArray(wizardDraftsCache)) return;
          const dIdx = wizardDraftsCache.findIndex(d => d && String(d.id) === String(projId));
          if (dIdx < 0) return;
          const wd = wizardDraftsCache[dIdx];
          if (isApprovedNow) {
            if (wd.approvalStatus !== 'approved' || wd.isPublic !== true) {
              wd.approvalStatus = 'approved';
              wd.publicationStatus = 'published';
              wd.status = 'completed';
              wd.isPublic = true;
              wd.rejectionReason = '';
              wd.authorizedAt = metaProj.authorizedAt || wd.authorizedAt || new Date().toISOString();
              wd.authorizedBy = metaProj.authorizedBy || wd.authorizedBy || 'Administrador Mentix';
              wizardDraftsDirty = true;
            }
          } else if (wd.approvalStatus === 'approved') {
            wd.approvalStatus = metaProj.approvalStatus || 'pending';
            wd.publicationStatus = metaProj.publicationStatus || 'completed';
            wd.isPublic = false;
            wd.rejectionReason = metaProj.rejectionReason || '';
            wizardDraftsDirty = true;
          }
        };

        cloudChallenges.forEach(c => {
          if (!c || !c.id) return;
          if (!c.projectType) c.projectType = (c.isGovDataProject || c.slides) ? 'presentation' : 'quiz';
          if (c.isPublic === undefined) c.isPublic = (c.projectType === 'quiz') ? true : (c.approvalStatus === 'approved');

          // Si el reto en la nube no tiene preguntas, restaurar preguntas por defecto si es muestra
          if (!Array.isArray(c.questions) || c.questions.length === 0) {
            if (c.id === 'reto_sample_cloud' && typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
              c.questions = DEFAULT_CHALLENGES[0].questions;
            }
          }

          const isProjectItem = (c.projectType && c.projectType !== 'quiz') || c.isGovDataProject === true;
          const unappEntry = unappMap[c.id];
          const appEntry = appMap[c.id];
          const unappTs = unappEntry ? (new Date(unappEntry.updatedAt || unappEntry.rejectedAt || 0).getTime() || 0) : 0;
          const appTs = appEntry ? (new Date(appEntry.updatedAt || appEntry.authorizedAt || 0).getTime() || 0) : 0;
          const cTs = new Date(c.updatedAt || c.rejectedAt || c.authorizedAt || 0).getTime() || 0;
          const cloudAuthTs = new Date(c.authorizedAt || 0).getTime() || 0;
          const cloudReauthorizedAfterLocalUnapp = Boolean(c.approvalStatus === 'approved' && !c.rejectionReason && cloudAuthTs > 0 && unappTs > 0 && cloudAuthTs > unappTs + 1000);

          if (!map.has(c.id)) {
            if ((Array.isArray(c.questions) && c.questions.length > 0) || isProjectItem) {
              if (isProjectItem && unappEntry && unappTs >= appTs && !cloudReauthorizedAfterLocalUnapp) {
                c.approvalStatus = unappEntry.approvalStatus || 'pending';
                c.publicationStatus = 'completed';
                c.isPublic = false;
                c.accessMode = 'private';
                c.visibility = 'private';
                c.rejectionReason = unappEntry.rejectionReason || 'Desautorizado por el Administrador.';
                c.rejectedAt = unappEntry.rejectedAt || new Date().toISOString();
                if (c.govdata && typeof c.govdata === 'object') {
                  c.govdata.approvalStatus = c.approvalStatus;
                  c.govdata.publicationStatus = 'completed';
                  c.govdata.isPublic = false;
                  c.govdata.rejectionReason = c.rejectionReason;
                }
                syncLocalDraftApproval(c.id, false, c);
              } else if (isProjectItem && ((c.approvalStatus === 'approved' && !c.rejectionReason) || (appEntry && appTs > cTs && appTs > unappTs))) {
                c.approvalStatus = 'approved';
                c.isPublic = true;
                c.accessMode = 'public';
                c.visibility = 'public';
                c.publicationStatus = 'published';
                c.status = 'completed';
                c.stage = 'completed';
                c.rejectionReason = '';
                c.authorizedAt = c.authorizedAt || appEntry?.authorizedAt || new Date().toISOString();
                c.authorizedBy = c.authorizedBy || appEntry?.authorizedBy || 'Administrador Mentix';
                if (c.govdata && typeof c.govdata === 'object') {
                  c.govdata.approvalStatus = 'approved';
                  c.govdata.publicationStatus = 'published';
                  c.govdata.status = 'completed';
                  c.govdata.isPublic = true;
                  c.govdata.rejectionReason = '';
                }
                syncLocalDraftApproval(c.id, true, c);
              }
              map.set(c.id, c);
            }
          } else {
            const existing = map.get(c.id);
            if ((Array.isArray(c.questions) && c.questions.length > 0) || isProjectItem) {
              const cloudTs = cTs;
              const localTs = new Date(existing.updatedAt || existing.rejectedAt || existing.authorizedAt || 0).getTime() || 0;
              const localExplicitlyUnapproved = isProjectItem && (
                (unappEntry && unappTs >= appTs && !cloudReauthorizedAfterLocalUnapp) ||
                (existing.approvalStatus !== 'approved' && (Boolean(existing.rejectedAt) || Boolean(existing.rejectionReason)) && (localTs >= cloudTs || localTs >= cloudAuthTs))
              );
              const cloudExplicitlyUnapproved = isProjectItem && c.approvalStatus !== 'approved' && (Boolean(c.rejectedAt) || Boolean(c.rejectionReason)) && cloudTs >= localTs && cloudTs >= appTs;
              const localApproved = !localExplicitlyUnapproved && (Boolean(appEntry && appTs >= unappTs) || (existing.approvalStatus === 'approved' && !existing.rejectionReason));
              const cloudApproved = !localExplicitlyUnapproved && c.approvalStatus === 'approved' && !c.rejectionReason;
              const mergedItem = (typeof window.mergeProjectPreservingImages === 'function')
                ? window.mergeProjectPreservingImages(existing, c)
                : { ...existing, ...c };

              // Preservar siempre la versión que tenga más diapositivas, presentaciones, recursos, enlaces, imágenes y pasos completados para no perder avances nunca
              if (Array.isArray(existing.slides) && (!Array.isArray(c.slides) || existing.slides.length > c.slides.length)) {
                mergedItem.slides = existing.slides;
              }
              if (Array.isArray(existing.presentations) && (!Array.isArray(c.presentations) || existing.presentations.length > c.presentations.length)) {
                mergedItem.presentations = existing.presentations;
              }
              if (Array.isArray(existing.completedSteps) && (!Array.isArray(c.completedSteps) || existing.completedSteps.length > c.completedSteps.length)) {
                mergedItem.completedSteps = existing.completedSteps;
              }
              if (Array.isArray(existing.resources) && (!Array.isArray(c.resources) || existing.resources.length > c.resources.length)) {
                mergedItem.resources = existing.resources;
              }
              if (Array.isArray(existing.externalLinks) && (!Array.isArray(c.externalLinks) || existing.externalLinks.length > c.externalLinks.length)) {
                mergedItem.externalLinks = existing.externalLinks;
              }
              if (Array.isArray(existing.visualAssets) && (!Array.isArray(c.visualAssets) || existing.visualAssets.length > c.visualAssets.length)) {
                mergedItem.visualAssets = existing.visualAssets;
              }
              if (existing.videoConfig?.url && !c.videoConfig?.url) {
                mergedItem.videoConfig = existing.videoConfig;
                mergedItem.videoUrl = existing.videoUrl || existing.videoConfig.url;
              }

              if (cloudExplicitlyUnapproved || localExplicitlyUnapproved) {
                // El administrador revocó/desautorizó el proyecto (en tiempo real o en la nube)
                const unappSrc = cloudExplicitlyUnapproved ? c : (unappEntry || existing);
                mergedItem.approvalStatus = unappSrc.approvalStatus || 'pending';
                mergedItem.publicationStatus = 'completed';
                mergedItem.status = 'completed';
                mergedItem.stage = 'completed';
                mergedItem.isPublic = false;
                mergedItem.accessMode = 'private';
                mergedItem.visibility = 'private';
                mergedItem.rejectionReason = unappSrc.rejectionReason || 'Desautorizado por el Administrador.';
                mergedItem.rejectedAt = unappSrc.rejectedAt || new Date().toISOString();
                if (mergedItem.govdata && typeof mergedItem.govdata === 'object') {
                  mergedItem.govdata.approvalStatus = mergedItem.approvalStatus;
                  mergedItem.govdata.publicationStatus = mergedItem.publicationStatus;
                  mergedItem.govdata.status = mergedItem.status;
                  mergedItem.govdata.isPublic = false;
                  mergedItem.govdata.rejectionReason = mergedItem.rejectionReason;
                }
                if (appMap[c.id]) {
                  delete appMap[c.id];
                  appMapDirty = true;
                }
                syncLocalDraftApproval(c.id, false, mergedItem);
              } else if (cloudApproved || (localApproved && c.approvalStatus !== 'rejected')) {
                mergedItem.approvalStatus = 'approved';
                mergedItem.publicationStatus = 'published';
                mergedItem.status = 'completed';
                mergedItem.stage = 'completed';
                mergedItem.isPublic = true;
                mergedItem.accessMode = 'public';
                mergedItem.visibility = 'public';
                mergedItem.rejectionReason = '';
                mergedItem.rejectedAt = '';
                mergedItem.authorizedAt = c.authorizedAt || appMap[c.id]?.authorizedAt || existing.authorizedAt || new Date().toISOString();
                mergedItem.authorizedBy = c.authorizedBy || appMap[c.id]?.authorizedBy || existing.authorizedBy || 'Administrador Mentix';
                if (mergedItem.govdata && typeof mergedItem.govdata === 'object') {
                  mergedItem.govdata.approvalStatus = 'approved';
                  mergedItem.govdata.publicationStatus = 'published';
                  mergedItem.govdata.status = 'completed';
                  mergedItem.govdata.isPublic = true;
                  mergedItem.govdata.rejectionReason = '';
                  mergedItem.govdata.authorizedAt = mergedItem.authorizedAt;
                  mergedItem.govdata.authorizedBy = mergedItem.authorizedBy;
                }
                if (unappMap[c.id]) {
                  delete unappMap[c.id];
                  unappMapDirty = true;
                }
                syncLocalDraftApproval(c.id, true, mergedItem);
              }

              if (c.hub && typeof c.hub === 'object') {
                mergedItem.hub = { ...(existing.hub || {}), ...c.hub };
                if (Array.isArray(c.hub.members) && c.hub.members.length > 0) mergedItem.hub.members = c.hub.members;
                if (Array.isArray(c.hub.joinRequests)) mergedItem.hub.joinRequests = c.hub.joinRequests;
                mergedItem.members = mergedItem.hub.members || c.members || existing.members || [];
                mergedItem.joinRequests = mergedItem.hub.joinRequests || c.joinRequests || existing.joinRequests || [];
              }
              map.set(c.id, mergedItem);
            }
          }
        });

        if (appMapDirty) {
          try { localStorage.setItem('mentix_approved_projects_map', JSON.stringify(appMap)); } catch(e) {}
        }
        if (unappMapDirty) {
          try { localStorage.setItem('mentix_unapproved_projects_map', JSON.stringify(unappMap)); } catch(e) {}
        }
        if (wizardDraftsDirty && Array.isArray(wizardDraftsCache)) {
          try { localStorage.setItem('mentix_govdata_wizard_drafts', JSON.stringify(wizardDraftsCache)); } catch(e) {}
        }

        const merged = Array.from(map.values());
        const sigOf = (arr) => (arr || []).map(x => [
          x.id,
          x.updatedAt || '',
          x.approvalStatus || '',
          String(x.isPublic),
          x.accessMode || '',
          x.publicationStatus || '',
          x.status || '',
          x.rejectionReason || '',
          (x.title || '').slice(0, 40),
          (x.hub?.members?.length) || 0,
          (x.heroBanner || x.mainImage || x.banner || '').slice(-40),
          (Array.isArray(x.visualAssets) ? x.visualAssets.length : 0),
          (Array.isArray(x.slides) ? x.slides.length : 0),
          (Array.isArray(x.presentations) ? x.presentations.length : 0)
        ].join(':')).join('|');
        const beforeSig = sigOf(local);
        const afterSig = sigOf(merged);

        window.appState.challenges = merged;
        saveGlobalState(window.appState);

        // Si en este navegador hay proyectos autorizados o desautorizados por Admin que aún no coinciden en la nube, subirlos automáticamente
        const cloudLookup = new Map((cloudChallenges || []).map(c => [String(c?.id || ''), c]));
        const unsyncedApproved = merged.filter(p => {
          if (!p || !p.id || p.projectType === 'quiz' || p.approvalStatus !== 'approved' || p.rejectionReason || unappMap[p.id]) return false;
          const inCloud = cloudLookup.get(String(p.id));
          return !inCloud || inCloud.approvalStatus !== 'approved' || inCloud.isPublic !== true;
        });
        if (unsyncedApproved.length > 0 && !this._pushingUnsyncedApproved) {
          this._pushingUnsyncedApproved = true;
          (async () => {
            try {
              for (const ap of unsyncedApproved) {
                const resPush = await this.pushChallengeToCloud(ap);
                if (resPush && resPush.ok && window.realtimeEngine && typeof window.realtimeEngine.publishProjectAuthSync === 'function') {
                  window.realtimeEngine.publishProjectAuthSync(ap.id, 'approved', ap.title, {
                    isPublic: true,
                    authorizedAt: ap.authorizedAt,
                    authorizedBy: ap.authorizedBy,
                    updatedAt: ap.updatedAt
                  });
                }
              }
            } catch (e) {} finally {
              this._pushingUnsyncedApproved = false;
            }
          })();
        }

        const unsyncedUnapproved = merged.filter(p => {
          if (!p || !p.id || p.projectType === 'quiz') return false;
          const isLocallyUnapproved = Boolean(unappMap[p.id]) || (p.approvalStatus !== 'approved' && (Boolean(p.rejectedAt) || Boolean(p.rejectionReason)));
          if (!isLocallyUnapproved) return false;
          const inCloud = cloudLookup.get(String(p.id));
          return Boolean(inCloud && (inCloud.approvalStatus === 'approved' || inCloud.isPublic === true));
        });
        if (unsyncedUnapproved.length > 0 && !this._pushingUnsyncedUnapproved) {
          this._pushingUnsyncedUnapproved = true;
          (async () => {
            try {
              for (const up of unsyncedUnapproved) {
                if (window.realtimeEngine && typeof window.realtimeEngine.publishProjectAuthSync === 'function') {
                  window.realtimeEngine.publishProjectAuthSync(up.id, up.approvalStatus || 'pending', up.title, {
                    isPublic: false,
                    rejectedAt: up.rejectedAt,
                    rejectionReason: up.rejectionReason,
                    updatedAt: up.updatedAt
                  });
                }
                await this.pushChallengeToCloud(up);
              }
            } catch (e) {} finally {
              this._pushingUnsyncedUnapproved = false;
            }
          })();
        }

        const shouldRenderNow = !this._initialCloudRenderDone || force === true || beforeSig !== afterSig;
        this._initialCloudRenderDone = true;

        if (shouldRenderNow) {
          if (this.currentView === 'home' && window.HomeView) {
            window.HomeView.render();
          } else if (this.currentView === 'projects' && window.ProjectsView && window.ProjectsView.viewMode !== 'wizard') {
            window.ProjectsView.render();
          } else if (this.currentView === 'admin' && window.AdminView && typeof window.AdminView.renderActiveTab === 'function') {
            window.AdminView.renderActiveTab();
          }
          if (document.getElementById('phub-overlay') && window.ProjectHub && typeof window.ProjectHub.render === 'function') {
            window.ProjectHub.render();
          }
        }
      }
    } catch (e) {
      console.warn('Error sincronizando retos con la nube:', e);
    } finally {
      this._challengesSyncInFlight = false;
      if (this._pendingForcedChallengesSync) {
        this._pendingForcedChallengesSync = false;
        setTimeout(() => this.syncChallengesWithCloud(true), 250);
      }
    }
  }

  async syncDesignWithCloud() {
    try {
      const res = await fetch(`data/design.json?t=${Date.now()}`);
      if (res.ok) {
        const fileDesign = await res.json();
        const local = localStorage.getItem('mentix_admin_design');
        if (!local || JSON.parse(local)?.timerColor === 'cyan') {
          const merged = local ? { ...JSON.parse(local), timerColor: fileDesign.timerColor || 'yellow' } : fileDesign;
          localStorage.setItem('mentix_admin_design', JSON.stringify(merged));
          if (window.AdminView) window.AdminView.applyDesign(merged);
        }
      }
    } catch(e) {}
  }

  closeModal(modalId) {
    // El acceso es obligatorio: no se puede cerrar sin registrarse o iniciar sesión
    if (modalId === 'auth-modal' && !localStorage.getItem('te_reto_session')) return;
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
  }

  // Muestra el registro obligatorio antes de ver la página principal
  // Si entra directamente por enlace a #lobby-join o #join, NO lo pide al inicio
  requireAuth() {
    if (localStorage.getItem('te_reto_session')) return;
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.includes('lobby-join') || hash.includes('join') || this.currentView === 'lobby-join') {
      return; // Permitir entrar directo a la sala sin pedir registro
    }
    this.openAuthModal('register');
    const closeBtn = document.getElementById('auth-close-btn');
    if (closeBtn) closeBtn.style.display = 'none';
  }

  toggleTheme() {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('te_reto_theme', isLight ? 'light' : 'dark');
    const btn = document.getElementById('theme-toggle-btn');
    if (btn) btn.textContent = isLight ? '☀️' : '🌙';
  }

  toggleSound() {
    const muted = window.soundEngine.toggleMute();
    const btn = document.getElementById('sound-toggle-btn');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
  }

  openSupabaseModal() {
    const modal = document.getElementById('supabase-modal');
    const urlInput = document.getElementById('supabase-url-input');
    const keyInput = document.getElementById('supabase-key-input');
    const statusBox = document.getElementById('supabase-modal-status');
    if (window.supabaseService) {
      if (urlInput) urlInput.value = window.supabaseService.url || '';
      if (keyInput) keyInput.value = window.supabaseService.anonKey || '';
      if (statusBox) {
        if (window.supabaseService.isConnected) {
          statusBox.textContent = '⚡ Estado: Conectado con éxito a Supabase Cloud';
          statusBox.style.color = '#10b981';
          statusBox.style.background = 'rgba(16, 185, 129, 0.12)';
        } else {
          statusBox.textContent = '🟡 Estado: Clave configurada. Haz clic en "Guardar y Conectar"';
          statusBox.style.color = '#f59e0b';
          statusBox.style.background = 'rgba(245, 158, 11, 0.1)';
        }
      }
    }
    if (modal) modal.classList.add('active');
  }

  async saveSupabaseCredentials() {
    const urlInput = document.getElementById('supabase-url-input');
    const keyInput = document.getElementById('supabase-key-input');
    const url = urlInput ? urlInput.value.trim() : '';
    const key = keyInput ? keyInput.value.trim() : '';

    if (!key) {
      alert('⚠️ Por favor ingresa la clave pública (anon key) de tu proyecto de Supabase.');
      return;
    }

    if (window.supabaseService) {
      window.supabaseService.setCredentials(url, key);
      const ok = await window.supabaseService.testConnection();
      if (ok) {
        alert('🎉 ¡Conectado con éxito a la base de datos de Supabase! Tus proyectos y avances del asistente se guardarán en la nube.');
        this.closeModal('supabase-modal');
      } else {
        alert('🟡 Credenciales guardadas correctamente. Si estás usando una base de datos nueva, recuerda ejecutar el script "supabase_schema.sql" en el SQL Editor de Supabase para habilitar las tablas de proyectos.');
        this.closeModal('supabase-modal');
      }
    }
  }

  async saveSupabaseKey() {
    return this.saveSupabaseCredentials();
  }
}

// Inicializar la aplicación globalmente
window.appRouter = new AppRouter();
