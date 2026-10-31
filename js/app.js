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

    // Restaurar tema guardado (claro u oscuro)
    const savedTheme = localStorage.getItem('te_reto_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = '☀️';
    }

    // Aplicar diseño exclusivo de Administrador si está configurado
    if (window.AdminView && window.AdminView.applySavedDesign) {
      window.AdminView.applySavedDesign();
    }
    this.syncDesignWithCloud();

    // Cargar estado inicial
    window.appState = loadInitialState();

    // Actualizar navbar
    this.updateNavbar();
    if (window.supabaseService) {
      window.supabaseService.updateStatusBadge();
      window.supabaseService.syncChallenges(window.appState.challenges);
    }

    // Sincronizar categorías y retos globales desde la nube para todos los usuarios
    this.syncCategoriesWithCloud();
    this.syncChallengesWithCloud();

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

    // Registro obligatorio antes de mostrar la página
    if (oauthReturn) {
      this.checkOAuthSession().then(ok => { if (!ok) this.requireAuth(); });
    } else {
      this.requireAuth();
    }
  }

  restoreInitialRoute() {
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
          this.navigate('lobby-join', { pin: params.pin });
          return true;
        }
        if (viewPart === 'experience') {
          const id = params.id || window.appState.challenges[0]?.id;
          if (id) {
            this.selectExperience(id);
            return true;
          }
        }
        this.navigate(viewPart, params, false);
        return true;
      }
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

  setupGlobalEvents() {
    window.addEventListener('popstate', () => {
      if (this.historyStack.length > 1) {
        this.historyStack.pop();
        const prev = this.historyStack[this.historyStack.length - 1];
        if (prev) this.navigate(prev, {}, false);
      }
    });

    window.addEventListener('hashchange', () => {
      this.restoreInitialRoute();
    });

    // Sincronización global automática: cuando el usuario regresa a la pestaña o periódicamente cada 30 segundos
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.syncChallengesWithCloud();
        this.syncCategoriesWithCloud();
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
      if (document.visibilityState === 'visible' && (this.currentView === 'home' || this.currentView === 'projects')) {
        this.syncChallengesWithCloud();
      }
    }, 30000);
  }

  isGuest() {
    const u = window.appState && window.appState.currentUser;
    return !!(u && u.isGuest);
  }

  guestBlocked() {
    alert('🔒 Los invitados solo pueden unirse a salas. Regístrate o inicia sesión para crear cuestionarios.');
    this.openAuthModal('register');
  }

  navigate(viewName, params = {}, pushToHistory = true) {
    // Invitados: solo unirse a salas (sin crear cuestionarios, proyectos ni salas)
    if (this.isGuest() && ['creator', 'projects', 'lobby-host'].includes(viewName)) {
      if (this.booting) {
        viewName = 'home';
      } else {
        this.guestBlocked();
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

    // Sincronizar hash en la URL para F5 y favoritos
    try {
      let hash = '#' + viewName;
      if (params && params.id) hash += '?id=' + encodeURIComponent(params.id);
      if (params && params.edit) hash += (hash.includes('?') ? '&' : '?') + 'edit=true';
      if (params && params.pin) hash += (hash.includes('?') ? '&' : '?') + 'pin=' + encodeURIComponent(params.pin);
      if (window.location.hash !== hash) {
        history.replaceState(null, '', hash);
      }
    } catch (e) {}

    // Ocultar todas las vistas
    document.querySelectorAll('.app-view').forEach(v => {
      v.classList.remove('active');
    });

    // Controlar visibilidad del navbar principal (ocultar en lobby-join, game, leaderboard y podium para diseño inmersivo con fondo Mentix completo)
    const navEl = document.getElementById('main-navbar');
    if (navEl) {
      const isWizardActive = (viewName === 'projects' && window.ProjectsView && window.ProjectsView.viewMode === 'wizard');
      if (viewName === 'lobby-join' || viewName === 'game' || viewName === 'leaderboard' || viewName === 'podium' || isWizardActive) {
        navEl.style.display = 'none';
      } else {
        navEl.style.display = '';
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
        if (params.challenge) {
          window.ExperienceView.render(params.challenge, params.gameMode || 'clasico', params.roomType || 'presented');
        }
        break;

      case 'lobby-host':
        document.getElementById('view-lobby')?.classList.add('active');
        const hostChallenge = params.challenge || window.LobbyView?.pendingChallenge || window.ExperienceView?.currentChallenge || window.realtimeEngine?.currentRoom?.challenge || window.appState?.challenges?.[0];
        if (hostChallenge) {
          const cleanRoomType = (params.roomType === 'normal') ? 'normal' : 'presented';
          window.LobbyView.initHost(hostChallenge, params.gameMode || 'clasico', params.modeConfig || {}, params.rosterConfig || null, cleanRoomType);
        } else {
          this.navigate('home');
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
        document.getElementById('view-teacher')?.classList.add('active');
        window.TeacherView.render();
        break;

      case 'admin':
        document.getElementById('view-admin')?.classList.add('active');
        window.AdminView.render();
        break;

      case 'ranking':
        document.getElementById('view-ranking')?.classList.add('active');
        window.RankingView.render();
        break;

      case 'projects':
        document.getElementById('view-projects')?.classList.add('active');
        if (window.ProjectsView) {
          window.ProjectsView.viewMode = 'list';
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

    if (teacherLink) {
      teacherLink.style.display = (user && (user.role === 'teacher' || user.role === 'admin')) ? 'inline-flex' : 'none';
    }
    if (adminLink) {
      adminLink.style.display = (user && user.role === 'admin') ? 'inline-flex' : 'none';
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
              ${c.timePerQuestion || 20}s
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
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;

    if (!this.isChallengeOwner(c)) {
      alert('🚫 Solo el creador original de este proyecto tiene permiso para eliminarlo.');
      return;
    }

    const ok = confirm(`⚠️ ¿Deseas eliminar definitivamente tu proyecto "${c.title}"?\n\nEsta acción borrará el reto de la plataforma para todos los usuarios.`);
    if (!ok) return;

    // Eliminar del estado local
    window.appState.challenges = window.appState.challenges.filter(item => item.id !== challengeId);
    const u = window.appState.currentUser;
    if (u && u.challengesCreated && u.challengesCreated > 0) {
      u.challengesCreated--;
    }
    try {
      const del = JSON.parse(localStorage.getItem('te_reto_deleted_ids') || '[]');
      if (!del.includes(challengeId)) del.push(challengeId);
      localStorage.setItem('te_reto_deleted_ids', JSON.stringify(del));
    } catch (e) {}
    saveGlobalState(window.appState);

    if (window.CreatorView && window.CreatorView.currentChallenge && window.CreatorView.currentChallenge.id === challengeId) {
      window.CreatorView.resetForm();
    }

    // Eliminar de la nube persistente
    this.deleteChallengeFromCloud(challengeId);

    // Eliminar de la nube pública Vercel / GitHub
    try {
      fetch('/api/challenges?id=' + encodeURIComponent(challengeId), { method: 'DELETE' }).catch(() => {});
    } catch (e) {}

    // Eliminar de Supabase en la nube si está conectado
    if (window.supabaseService && window.supabaseService.isConnected && window.supabaseService.client) {
      try {
        window.supabaseService.client.from('challenges').delete().eq('id', challengeId).then(() => {});
      } catch(e) {}
    }

    this.closeModal('preview-modal');
    if (window.soundEngine && window.soundEngine.playWrong) {
      window.soundEngine.playWrong();
    }
    alert(`🗑️ Tu proyecto "${c.title}" ha sido eliminado exitosamente.`);

    // Actualizar la vista actual
    if (this.currentView === 'home' && window.HomeView) window.HomeView.render();
    if (this.currentView === 'projects' && window.ProjectsView) window.ProjectsView.render();
    if (this.currentView === 'profile' && window.ProfileView) window.ProfileView.render();
    if (this.currentView === 'creator' && window.CreatorView) this.navigate('home');
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

  isCategoryOwner(cat) {
    const u = window.appState?.currentUser;
    if (!cat || !u || u.isGuest) return false;
    const name = (u.name || '').trim().toLowerCase();
    const email = (u.email || '').trim().toLowerCase();
    // Melisa puede eliminar cualquier categoría
    if (name === 'melisa' || email === 'meli030814abc@gmail.com') return true;
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
      alert('🚫 Solo el creador de esta categoría o Melisa pueden eliminarla.');
      return;
    }
    const catName = cat ? cat.name : categoryId;
    if (!confirm(`🗑️ ¿Estás seguro de que deseas eliminar la categoría "${catName}"?`)) return;

    const isBlocked = (c) => {
      if (!c || !c.id) return true;
      const cid = String(c.id).toLowerCase().trim();
      const cname = String(c.name || '').toLowerCase().trim();
      return cid === String(categoryId).toLowerCase().trim() || ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
    };

    // 1. Filtrar categoría localmente asegurando que DEFAULT_CATEGORIES sigan existiendo
    window.appState.categories = (window.appState.categories || []).filter(c => !isBlocked(c));
    if (window.appState.categories.length === 0) {
      window.appState.categories = [...DEFAULT_CATEGORIES];
    }
    saveGlobalState(window.appState);

    // 2. Reasignar cualquier reto que tuviera esta categoría
    if (Array.isArray(window.appState.challenges)) {
      window.appState.challenges.forEach(ch => {
        if (ch.category === categoryId || ['fhjr', 'kj'].includes(String(ch.category || '').toLowerCase().trim())) {
          ch.category = 'cultura';
          ch.categoryName = 'Cultura General';
        }
      });
      saveGlobalState(window.appState);
    }

    // 3. Actualizar la nube pública (/api/categories)
    try {
      const apiBase = this.getApiBase();
      await fetch(`${apiBase}/api/categories?id=${encodeURIComponent(categoryId)}`, {
        method: 'DELETE'
      });
    } catch (e) {
      console.warn('Error eliminando categoría en nube:', e);
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

    // 1. Conservar SIEMPRE DEFAULT_CATEGORIES y todas las categorías existentes sin borrar ninguna
    const catMap = new Map();
    (DEFAULT_CATEGORIES || []).forEach(c => {
      if (!isBlocked(c)) catMap.set(c.id, c);
    });
    (window.appState.categories || []).forEach(c => {
      if (!isBlocked(c)) catMap.set(c.id, c);
    });
    if (!isBlocked(newCat)) {
      catMap.set(newCat.id, newCat);
    }
    ['fhjr', 'kj'].forEach(b => catMap.delete(b));

    const mergedCategories = Array.from(catMap.values()).filter(c => !isBlocked(c));
    window.appState.categories = mergedCategories;
    saveGlobalState(window.appState);

    this.closeModal('category-modal');
    if (nameInput) nameInput.value = '';

    // Refrescar vistas locales activas inmediatamente
    if (window.HomeView && this.currentView === 'home') window.HomeView.render();
    if (window.ProjectsView && this.currentView === 'projects') window.ProjectsView.render();

    // 2. Guardar en la nube pública (/api/categories) uniendo todas las categorías sin perder ninguna
    try {
      const apiBase = this.getApiBase();
      const postRes = await fetch(`${apiBase}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newCat })
      });
      if (postRes.ok) {
        const data = await postRes.json();
        if (Array.isArray(data.categories)) {
          const finalMap = new Map();
          (DEFAULT_CATEGORIES || []).forEach(c => { if (!isBlocked(c)) finalMap.set(c.id, c); });
          mergedCategories.forEach(c => { if (!isBlocked(c)) finalMap.set(c.id, c); });
          data.categories.forEach(c => { if (!isBlocked(c)) finalMap.set(c.id, c); });
          if (!isBlocked(newCat)) finalMap.set(newCat.id, newCat);
          ['fhjr', 'kj'].forEach(b => finalMap.delete(b));
          window.appState.categories = Array.from(finalMap.values()).filter(c => !isBlocked(c));
          saveGlobalState(window.appState);
          if (window.HomeView && this.currentView === 'home') window.HomeView.render();
          if (window.ProjectsView && this.currentView === 'projects') window.ProjectsView.render();
        }
      }
    } catch (cloudErr) {
      console.warn('Categoría guardada localmente, sincronización en nube diferida:', cloudErr);
    }

    if (window.soundEngine) window.soundEngine.playCorrect();
    alert(`✅ Categoría "${name}" agregada con éxito conservando todas las demás categorías.`);
  }

  async syncCategoriesWithCloud() {
    try {
      let cloudCategories = null;
      try {
        const apiBase = this.getApiBase();
        const res = await fetch(`${apiBase}/api/categories?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json)) {
            cloudCategories = json;
          } else if (json.categories && Array.isArray(json.categories)) {
            cloudCategories = json.categories;
          }
        }
      } catch (errCloud) {
        try {
          const resStatic = await fetch(`data/categories.json?t=${Date.now()}`);
          if (resStatic.ok) cloudCategories = await resStatic.json();
        } catch(e) {}
      }

      const isBlocked = (c) => {
        if (!c || !c.id) return true;
        const cid = String(c.id).toLowerCase().trim();
        const cname = String(c.name || '').toLowerCase().trim();
        return ['fhjr', 'kj'].includes(cid) || ['fhjr', 'kj'].includes(cname);
      };

      // SIEMPRE garantizar las DEFAULT_CATEGORIES completas como base inmutable
      const map = new Map();
      (DEFAULT_CATEGORIES || []).forEach(c => {
        if (!isBlocked(c)) map.set(c.id, c);
      });
      (window.appState.categories || []).forEach(c => {
        if (!isBlocked(c)) map.set(c.id, c);
      });

      if (Array.isArray(cloudCategories) && cloudCategories.length > 0) {
        cloudCategories.forEach(c => {
          if (!isBlocked(c)) map.set(c.id, c);
        });
      }

      // Descartar explícitamente 'fhjr' y 'kj'
      ['fhjr', 'kj'].forEach(b => map.delete(b));

      const allMerged = Array.from(map.values()).filter(c => !isBlocked(c));
      window.appState.categories = allMerged;
      saveGlobalState(window.appState);

      if (this.currentView === 'home' && window.HomeView) {
        window.HomeView.render();
      } else if (this.currentView === 'projects' && window.ProjectsView) {
        window.ProjectsView.render();
      }
    } catch (e) {
      console.warn('Error sincronizando categorías globales:', e);
    }
  }

  isChallengeOwner(challenge) {
    if (!challenge) return false;
    const u = window.appState?.currentUser;
    if (!u || u.isGuest) return false;

    // Permisos: Melisa puede editar TODO; además cada autor puede editar sus propios cuestionarios.
    const cleanName = (u.name || '').trim().toLowerCase();
    const cleanEmail = (u.email || '').trim().toLowerCase();
    const isMelisa = cleanName === 'melisa' || cleanEmail === 'meli030814abc@gmail.com';

    // Si el reto de AGILE Y SCRUM no tiene autor definido, asignarlo a Melisa
    const cleanTitle = (challenge.title || '').trim().toLowerCase();
    const isAgileScrum = (cleanTitle.includes('agile') && cleanTitle.includes('scrum')) || challenge.id === 'reto_1792180343870';
    if (isMelisa && isAgileScrum && (!challenge.author || challenge.author === 'Profesor' || challenge.author === 'Comunidad')) {
      challenge.author = u.name || 'Melisa';
      challenge.authorAvatar = u.avatar || '🦊';
      challenge.authorId = u.id || 'usr_melisa';
    }
    if (isMelisa) return true;

    // AGILE Y SCRUM sigue siendo exclusivo de Melisa
    if (isAgileScrum) return false;

    // Autor del cuestionario: por id, correo o nombre exacto
    if (challenge.authorId && u.id && String(challenge.authorId) === String(u.id)) return true;
    if (challenge.authorEmail && cleanEmail && challenge.authorEmail.trim().toLowerCase() === cleanEmail) return true;
    if (challenge.author && cleanName && challenge.author.trim().toLowerCase() === cleanName) return true;

    return false;
  }

  async pushChallengeToCloud(challenge) {
    if (!challenge || !challenge.id || !challenge.title) return;
    try {
      challenge.isPublic = true;
      challenge.projectType = challenge.projectType || 'quiz';
      challenge.updatedAt = new Date().toISOString();

      const apiBase = this.getApiBase();
      const res = await fetch(`${apiBase}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge })
      });
      if (res.ok) {
        console.log('☁️ Reto guardado globalmente en MENTIX Cloud:', challenge.title);
      } else {
        console.warn('Respuesta no-ok al guardar en /api/challenges:', res.status);
      }
    } catch(e) {
      console.warn('Error al subir reto a la nube (/api/challenges):', e);
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

  async syncChallengesWithCloud() {
    try {
      let cloudChallenges = null;

      // 1. Consultar API global de retos en Vercel
      try {
        const apiBase = this.getApiBase();
        const res = await fetch(`${apiBase}/api/challenges?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (Array.isArray(json) && json.length > 0) {
            cloudChallenges = json;
          }
        }
      } catch (errApi) {
        console.warn('No se pudo conectar a /api/challenges:', errApi);
      }

      // 2. Fallback a archivo estático data/challenges.json
      if (!cloudChallenges) {
        try {
          const resStatic = await fetch(`data/challenges.json?t=${Date.now()}`);
          if (resStatic.ok) {
            const jsonStatic = await resStatic.json();
            if (Array.isArray(jsonStatic) && jsonStatic.length > 0) {
              cloudChallenges = jsonStatic;
            }
          }
        } catch(e) {}
      }

      // Retos eliminados: quitarlos de la nube y de este dispositivo
      let deletedIds = [];
      try {
        const resDel = await fetch(`${this.getApiBase()}/api/challenges?deleted=1&t=${Date.now()}`);
        if (resDel.ok) {
          const jd = await resDel.json();
          if (Array.isArray(jd)) deletedIds = jd;
        }
      } catch (errDel) {}
      try {
        const own = JSON.parse(localStorage.getItem('te_reto_deleted_ids') || '[]');
        if (Array.isArray(own)) deletedIds = Array.from(new Set([...deletedIds, ...own]));
      } catch (e) {}
      if (deletedIds.length > 0) {
        const gone = new Set(deletedIds);
        if (Array.isArray(cloudChallenges)) cloudChallenges = cloudChallenges.filter(c => c && !gone.has(c.id));
        const before = (window.appState.challenges || []).length;
        window.appState.challenges = (window.appState.challenges || []).filter(c => c && !gone.has(c.id));
        if (window.appState.challenges.length !== before) {
          saveGlobalState(window.appState);
          if (this.currentView === 'home' && window.HomeView) window.HomeView.render();
          else if (this.currentView === 'projects' && window.ProjectsView) window.ProjectsView.render();
        }
      }

      if (Array.isArray(cloudChallenges) && cloudChallenges.length > 0) {
        if (typeof window.deepCleanMojibake === 'function') {
          cloudChallenges = window.deepCleanMojibake(cloudChallenges);
        }
        const local = Array.isArray(window.appState.challenges) ? window.appState.challenges : [];
        const map = new Map();
        local.forEach(c => { if (c && c.id) map.set(c.id, c); });

        cloudChallenges.forEach(c => {
          if (!c || !c.id) return;
          if (c.isPublic === undefined) c.isPublic = true;
          if (!c.projectType) c.projectType = 'quiz';

          // Si el reto en la nube no tiene preguntas, restaurar preguntas por defecto si es muestra
          if (!Array.isArray(c.questions) || c.questions.length === 0) {
            if (c.id === 'reto_sample_cloud' && typeof DEFAULT_CHALLENGES !== 'undefined' && DEFAULT_CHALLENGES[0]) {
              c.questions = DEFAULT_CHALLENGES[0].questions;
            }
          }

          const isProjectItem = (c.projectType && c.projectType !== 'quiz') || c.isGovDataProject === true;
          if (!map.has(c.id)) {
            if ((Array.isArray(c.questions) && c.questions.length > 0) || isProjectItem) {
              map.set(c.id, c);
            }
          } else {
            const existing = map.get(c.id);
            if ((Array.isArray(c.questions) && c.questions.length > 0) || isProjectItem) {
              map.set(c.id, { ...existing, ...c });
            }
          }
        });

        const merged = Array.from(map.values());
        const beforeSig = (local || []).map(x => x.id + ':' + (x.updatedAt || '')).join('|');
        const afterSig = (merged || []).map(x => x.id + ':' + (x.updatedAt || '')).join('|');

        if (beforeSig !== afterSig) {
          window.appState.challenges = merged;
          saveGlobalState(window.appState);

          if (this.currentView === 'home' && window.HomeView) {
            window.HomeView.render();
          } else if (this.currentView === 'projects' && window.ProjectsView) {
            window.ProjectsView.render();
          }
        }
      }
    } catch (e) {
      console.warn('Error sincronizando retos con la nube:', e);
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
    const keyInput = document.getElementById('supabase-key-input');
    if (keyInput && window.supabaseService) {
      keyInput.value = window.supabaseService.anonKey || '';
    }
    if (modal) modal.classList.add('active');
  }

  async saveSupabaseKey() {
    const keyInput = document.getElementById('supabase-key-input');
    if (!keyInput) return;
    const key = keyInput.value.trim();
    if (!key) {
      alert('⚠️ Por favor ingresa la clave pública (anon key) de tu proyecto de Supabase.');
      return;
    }

    if (window.supabaseService) {
      window.supabaseService.setAnonKey(key);
      const ok = await window.supabaseService.testConnection();
      if (ok) {
        alert('🎉 ¡Conectado con éxito a Supabase!');
        this.closeModal('supabase-modal');
      } else {
        alert('🟡 Clave guardada. Si aún no has ejecutado el script "supabase_schema.sql" en el SQL Editor de Supabase, ejecútalo para crear las tablas necesarias.');
        this.closeModal('supabase-modal');
      }
    }
  }
}

// Inicializar la aplicación globalmente
window.appRouter = new AppRouter();
