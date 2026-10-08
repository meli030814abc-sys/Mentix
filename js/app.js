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
    // Restaurar tema guardado (claro u oscuro)
    const savedTheme = localStorage.getItem('te_reto_theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      const btn = document.getElementById('theme-toggle-btn');
      if (btn) btn.textContent = '☀️';
    }

    // Cargar estado inicial
    window.appState = loadInitialState();

    // Actualizar navbar
    this.updateNavbar();
    if (window.supabaseService) {
      window.supabaseService.updateStatusBadge();
      window.supabaseService.syncChallenges(window.appState.challenges);
    }

    // Manejar atajos globales
    this.setupGlobalEvents();

    // Restaurar vista actual si se presionó F5 o se accedió con enlace directo
    const restored = this.restoreInitialRoute();
    if (!restored) {
      this.navigate('home', {}, false);
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
  }

  navigate(viewName, params = {}, pushToHistory = true) {
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

    window.scrollTo({ top: 0, behavior: 'smooth' });

    switch (viewName) {
      case 'home':
        document.getElementById('view-home')?.classList.add('active');
        window.HomeView.render();
        break;

      case 'creator':
        document.getElementById('view-creator')?.classList.add('active');
        if (params.editId) {
          // Editar un reto existente por id
          const challengeToEdit = (window.appState.challenges || []).find(c => c.id === params.editId);
          window.CreatorView.render(challengeToEdit || null);
        } else {
          window.CreatorView.render(params.challenge || null);
        }
        break;

      case 'select-experience':
        document.getElementById('view-experience')?.classList.add('active');
        if (params.challenge) {
          window.ExperienceView.render(params.challenge, params.gameMode || 'clasico');
        }
        break;

      case 'lobby-host':
        document.getElementById('view-lobby')?.classList.add('active');
        if (params.challenge) {
          window.LobbyView.initHost(params.challenge, params.gameMode || 'clasico', params.modeConfig || {}, params.rosterConfig || null);
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
        if (window.ProjectsView) window.ProjectsView.render();
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
    this.navigate('presentation', { id: id, edit: true });
  }

  createPresentation() {
    this.navigate('presentation', { edit: true });
  }

  openVideo(id) {
    this.navigate('video', { id: id, edit: false });
  }

  editVideo(id) {
    this.navigate('video', { id: id, edit: true });
  }

  createVideo() {
    this.navigate('video', { edit: true });
  }

  openDocument(id) {
    this.navigate('document', { id: id, edit: false });
  }

  editDocument(id) {
    this.navigate('document', { id: id, edit: true });
  }

  createDocument() {
    this.navigate('document', { edit: true });
  }

  openUrl(id) {
    this.navigate('url', { id: id, edit: false });
  }

  editUrl(id) {
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
            <span style="font-size: 1.2rem;">${user.avatar}</span>
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
  startSinglePlayer(challengeId) {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;
    this.navigate('game');
    window.GameView.initSolo(c);
  }

  hostRoom(challengeId) {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;
    this.selectExperience(challengeId);
  }

  selectExperience(challengeId, defaultMode = 'clasico') {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;
    this.navigate('select-experience', { challenge: c, gameMode: defaultMode });
  }

  launchHostWithMode(challengeId, modeId = 'clasico', config = {}, rosterConfig = null) {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;
    this.navigate('lobby-host', { challenge: c, gameMode: modeId, modeConfig: config, rosterConfig: rosterConfig });
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

    const u = window.appState.currentUser;
    const isOwner = u && (
      (c.author && c.author.toLowerCase() === u.name?.toLowerCase()) ||
      (c.authorId && c.authorId === u.id) ||
      u.role === 'admin'
    );

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
              <div style="font-size: 1.15rem; font-weight: 800;">Jugar Solo (Práctica)</div>
              <div style="font-size: 0.8rem; font-weight: 400; opacity: 0.85;">Entrena y supera tu puntuación personal</div>
            </div>
          </button>
          <button class="btn btn-primary btn-lg" style="box-shadow: 0 0 25px rgba(0, 245, 212, 0.35);" onclick="window.appRouter.closeModal('preview-modal'); window.appRouter.hostRoom('${c.id}')">
            <span style="font-size: 1.6rem;">🚀</span>
            <div style="text-align: left;">
              <div style="font-size: 1.15rem; font-weight: 800;">Crear Sala Multijugador</div>
              <div style="font-size: 0.8rem; font-weight: 400; opacity: 0.9;">Compite en vivo con amigos mediante código PIN</div>
            </div>
          </button>
        </div>

        <!-- Panel de Administración del Creador -->
        ${isOwner ? `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 3rem; padding: 1.25rem 1.75rem; background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: var(--border-radius-lg); flex-wrap: wrap; gap: 1rem;">
            <div style="display: flex; align-items: center; gap: 0.85rem;">
              <span style="font-size: 1.75rem;">👑</span>
              <div>
                <div style="font-size: 1rem; font-weight: 800; color: white;">Eres el creador de este cuestionario</div>
                <div style="font-size: 0.82rem; color: var(--text-muted);">Tienes permisos de autor para gestionar o remover este reto de la comunidad.</div>
              </div>
            </div>
            <button class="btn btn-danger" style="padding: 0.7rem 1.4rem; font-size: 0.9rem; font-weight: 800; display: inline-flex; align-items: center; gap: 0.5rem; border-radius: var(--border-radius-md);" onclick="window.appRouter.deleteChallenge('${c.id}')">
              <span>🗑️</span> <span>Eliminar Cuestionario</span>
            </button>
          </div>
        ` : ''}
      </div>
    `;

    modal.classList.add('active');
  }

  deleteChallenge(challengeId) {
    const c = window.appState.challenges.find(item => item.id === challengeId);
    if (!c) return;

    const u = window.appState.currentUser;
    const isOwner = u && (
      (c.author && c.author.toLowerCase() === u.name?.toLowerCase()) ||
      (c.authorId && c.authorId === u.id) ||
      u.role === 'admin'
    );

    if (!isOwner) {
      alert('🚫 Solo el creador original de este reto tiene permiso para eliminarlo.');
      return;
    }

    const ok = confirm(`⚠️ ¿Deseas eliminar definitivamente tu cuestionario "${c.title}"?\n\nEsta acción borrará el reto de la plataforma para todos los usuarios.`);
    if (!ok) return;

    // Eliminar del estado local
    window.appState.challenges = window.appState.challenges.filter(item => item.id !== challengeId);
    if (u.challengesCreated && u.challengesCreated > 0) {
      u.challengesCreated--;
    }
    saveGlobalState(window.appState);

    // Eliminar de Supabase en la nube si está conectado
    if (window.supabaseService && window.supabaseService.isConnected && window.supabaseService.client) {
      window.supabaseService.client.from('challenges').delete().eq('id', challengeId).then(() => {
        console.log('✅ Reto eliminado de Supabase');
      });
    }

    this.closeModal('preview-modal');
    if (window.soundEngine && window.soundEngine.playWrong) {
      window.soundEngine.playWrong();
    }
    alert(`🗑️ Tu cuestionario "${c.title}" ha sido eliminado exitosamente.`);

    // Actualizar la vista actual
    if (this.currentView === 'home' && window.HomeView) window.HomeView.render();
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

  handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    // Simular login con el usuario predeterminado o coincidente
    const user = window.appState.users.find(u => u.email.toLowerCase() === email.toLowerCase()) || window.appState.users[0];
    window.appState.currentUser = user;
    saveGlobalState(window.appState);
    this.closeModal('auth-modal');
    this.updateNavbar();
    alert(`¡Bienvenido de nuevo, ${user.name}!`);
    this.navigate('home');
  }

  handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value.trim();
    const username = document.getElementById('reg-username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const role = document.getElementById('reg-role').value;

    const newUser = {
      id: 'user_' + Date.now(),
      name: name,
      username: username,
      email: email,
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
    window.appState.currentUser = newUser;
    saveGlobalState(window.appState);
    this.closeModal('auth-modal');
    this.updateNavbar();
    window.soundEngine.playFanfare();
    alert(`🎉 ¡Cuenta creada con éxito! Bienvenido a MENTIX, ${name}.`);
    this.navigate('profile');
  }

  openCategoryModal() {
    const modal = document.getElementById('category-modal');
    if (modal) modal.classList.add('active');
  }

  handleCreateCategory(e) {
    e.preventDefault();
    const name = document.getElementById('cat-name').value.trim();
    const icon = document.getElementById('cat-icon').value.trim() || '💡';
    const color = document.getElementById('cat-color').value || '#00f5d4';

    const newCat = {
      id: name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      name: name,
      icon: icon,
      color: color,
      count: 0
    };

    window.appState.categories.push(newCat);
    saveGlobalState(window.appState);
    this.closeModal('category-modal');
    window.HomeView.render();
    alert('✅ Categoría creada exitosamente.');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
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
