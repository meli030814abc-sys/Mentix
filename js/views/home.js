/**
 * 🔥 Helper global para hacer transparente cualquier logo de entidad en tiempo de ejecución
 */
window.makeEntityLogoTransparent = function(imgEl) {
  if (!imgEl || imgEl.dataset.processedTransparent) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = imgEl.naturalWidth || imgEl.width;
    canvas.height = imgEl.naturalHeight || imgEl.height;
    if (!canvas.width || !canvas.height) return;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imgEl, 0, 0);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imgData.data;
    let modified = false;

    // Detectar píxeles blancos o muy claros (fondo blanco típico de logos JPG)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Si el color es casi blanco o muy claro
      if (r >= 220 && g >= 220 && b >= 220) {
        data[i + 3] = 0; // Transparente 100%
        modified = true;
      }
    }

    if (modified) {
      ctx.putImageData(imgData, 0, 0);
      imgEl.dataset.processedTransparent = 'true';
      imgEl.src = canvas.toDataURL('image/png');
    }
  } catch (err) {
    // Si la imagen tiene bloqueo CORS externo y no permite canvas, usamos filtro css inteligente
    imgEl.style.mixBlendMode = 'lighten';
    imgEl.dataset.processedTransparent = 'true';
  }
};

window.HomeView = {
  activeCategory: 'all',
  searchQuery: '',

  render() {
    const container = document.getElementById('view-home');
    if (!container) return;

    // En MENTIX, los Retos son exclusivamente Quizzes con modos de juego
    const quizChallenges = (window.appState.challenges || []).filter(c => !c.projectType || c.projectType === 'quiz');
    const categories = window.appState.categories;
    const currentUser = window.appState.currentUser;

    // Reconciliar categorías: si un reto tiene categoryName pero category id no coincide,
    // intentar encontrar el id correcto por nombre automáticamente
    let needsSave = false;
    quizChallenges.forEach(proj => {
      if (proj.category) {
        const catExists = (categories || []).find(cat => cat.id === proj.category);
        if (!catExists && proj.categoryName) {
          const catByName = (categories || []).find(cat =>
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

    // Filtrar retos
    let filtered = quizChallenges.filter(c => {
      const matchCat = this.activeCategory === 'all' || c.category === this.activeCategory;
      const matchSearch = !this.searchQuery || 
        c.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        c.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });

    const popularChallenges = [...quizChallenges].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 4);

    container.innerHTML = `
      <!-- Hero Principal Juvenil y Gamer -->
      <section style="text-align: center; padding: 3rem 1rem 2.5rem; max-width: 900px; margin: 0 auto; position: relative;">
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(0, 245, 212, 0.12); border: 1px solid var(--neon-cyan); padding: 0.4rem 1.1rem; border-radius: 9999px; margin-bottom: 1.25rem;">
          <span style="animation: timer-pulse 1s infinite alternate;">⚡</span>
          <span style="font-weight: 800; font-size: 0.85rem; color: var(--neon-cyan); letter-spacing: 0.05em; text-transform: uppercase;">¡Temporada de Retos 2026 Activa!</span>
        </div>

        <h1 style="font-size: clamp(2.5rem, 6vw, 4.2rem); line-height: 1.08; margin-bottom: 1rem;">
          <span class="gradient-title">🧠 MENTIX</span>
        </h1>
        
        <p style="font-size: clamp(1.1rem, 2.2vw, 1.4rem); color: var(--text-secondary); max-width: 650px; margin: 0 auto 2.2rem; font-weight: 500;">
          ¿Tienes lo necesario para llegar al primer lugar?
        </p>

        <!-- Botones de Acción Principales -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-bottom: 2.5rem;">
          <button class="btn btn-primary btn-lg" onclick="window.appRouter.navigate('lobby-join')" style="font-weight: 900; padding: 0.9rem 1.8rem; box-shadow: 0 6px 20px rgba(114, 9, 183, 0.4);">
            <span style="font-size: 1.4rem;">🎮</span> Unirse a un reto
          </button>
          <button class="btn btn-cyan btn-lg" onclick="window.appRouter.navigate('creator')" style="font-weight: 900; padding: 0.9rem 1.8rem; box-shadow: 0 6px 20px rgba(0, 245, 212, 0.4);">
            <span style="font-size: 1.4rem;">🚀</span> Crear un reto
          </button>
          ${!currentUser ? `
            <button class="btn btn-outline" onclick="window.appRouter.openAuthModal('login')">
              <span>👤</span> Iniciar sesión
            </button>
            <button class="btn btn-outline" style="border-color: var(--neon-magenta); color: var(--neon-magenta);" onclick="window.appRouter.openAuthModal('register')">
              <span>✨</span> Registrarse
            </button>
          ` : `
            <button class="btn btn-outline" onclick="window.appRouter.navigate('profile')">
              <span>${currentUser.avatar}</span> Mi Perfil (${currentUser.levelName})
            </button>
          `}
        </div>

        <!-- Buscador Inteligente -->
        <div style="max-width: 550px; margin: 0 auto; position: relative;">
          <input 
            type="text" 
            id="home-search-input" 
            placeholder="🔍 Buscar por tema, materia o creador..."
            value="${this.searchQuery}"
            oninput="window.HomeView.handleSearch(this.value)"
            style="width: 100%; padding: 0.9rem 1.25rem; border-radius: var(--border-radius-lg); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 1rem; outline: none; transition: var(--transition-normal);"
            onfocus="this.style.borderColor='var(--neon-cyan)'"
            onblur="this.style.borderColor='var(--border-color)'"
          />
        </div>
      </section>

      <!-- Carrusel / Filtros de Categorías -->
      <section style="max-width: 1200px; margin: 0 auto 2.5rem; padding: 0 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
          <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📚</span> Explorar Categorías
          </h2>
          <button class="btn btn-outline" style="font-size: 0.85rem; padding: 0.4rem 0.8rem;" onclick="window.appRouter.openCategoryModal()">
            <span>➕</span> Nueva Categoría
          </button>
        </div>

        <div style="display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.75rem; scrollbar-width: thin;">
          <button 
            onclick="window.HomeView.filterCategory('all')"
            style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; border-radius: 9999px; background: ${this.activeCategory === 'all' ? 'var(--neon-cyan)' : 'var(--bg-card)'}; color: ${this.activeCategory === 'all' ? '#0b0f19' : 'var(--text-primary)'}; border: 1px solid ${this.activeCategory === 'all' ? 'var(--neon-cyan)' : 'var(--border-color)'}; font-weight: 700; cursor: pointer; white-space: nowrap; transition: var(--transition-bounce);">
            <span>🌟</span> Todos
          </button>
          ${categories.map(cat => `
            <button 
              onclick="window.HomeView.filterCategory('${cat.id}')"
              style="display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; border-radius: 9999px; background: ${this.activeCategory === cat.id ? cat.color : 'var(--bg-card)'}; color: ${this.activeCategory === cat.id ? '#0b0f19' : 'var(--text-primary)'}; border: 1px solid ${this.activeCategory === cat.id ? cat.color : 'var(--border-color)'}; font-weight: 700; cursor: pointer; white-space: nowrap; transition: var(--transition-bounce);">
              <span>${cat.icon}</span> ${cat.name}
            </button>
          `).join('')}
        </div>
      </section>

      <!-- Retos Populares / Destacados -->
      <section style="max-width: 1200px; margin: 0 auto 3.5rem; padding: 0 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.6rem; display: flex; align-items: center; gap: 0.6rem; margin: 0 0 0.25rem;">
              <span class="glow-text-cyan">🔥</span> Retos Populares
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0;">Los desafíos más jugados por la comunidad de MENTIX</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
          ${popularChallenges.length === 0 ? `
            <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; border: 1.5px dashed var(--border-color); border-radius: 16px;">
              <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">🚀</span>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">Aún no hay retos creados</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem;">Crea tu primer cuestionario interactivo para que aparezca aquí.</p>
              <button class="btn btn-cyan" onclick="window.appRouter.navigate('creator')" style="font-weight: 800;">🚀 Crear Reto</button>
            </div>
          ` : popularChallenges.map(c => this.renderCard(c)).join('')}
        </div>
      </section>


      <!-- Todos los Retos / Resultados de Búsqueda -->
      <section style="max-width: 1200px; margin: 0 auto 4rem; padding: 0 1.25rem;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
          <div>
            <h2 style="font-size: 1.6rem; display: flex; align-items: center; gap: 0.6rem; margin: 0 0 0.25rem;">
              <span class="glow-text-cyan">⚡</span> Todos los Retos
            </h2>
            <p style="color: var(--text-secondary); font-size: 0.95rem; margin: 0;">Explora y demuestra tus habilidades en cualquier área</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(290px, 1fr)); gap: 1.5rem;">
          ${filtered.length === 0 ? `
            <div class="glass-panel" style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; border: 1.5px dashed var(--border-color); border-radius: 16px;">
              <span style="font-size: 2.2rem; display: block; margin-bottom: 0.5rem;">🎮</span>
              <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.35rem;">No hay retos disponibles</h3>
              <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1.25rem;">Crea tu primer cuestionario interactivo para empezar a jugar con tus estudiantes.</p>
              <button class="btn btn-cyan" onclick="window.appRouter.navigate('creator')" style="font-weight: 800;">🚀 Crear Reto</button>
            </div>
          ` : filtered.map(c => this.renderCard(c)).join('')}
        </div>
      </section>
    `;
  },

  renderCard(challenge) {
    const u = window.appState.currentUser;
    const isOwner = u && (
      (challenge.author && challenge.author.toLowerCase() === u.name?.toLowerCase()) ||
      (challenge.authorId && challenge.authorId === u.id) ||
      u.role === 'admin'
    );
    const diffTag = challenge.difficulty === 'Fácil' ? 'tag-easy' : challenge.difficulty === 'Medio' ? 'tag-medium' : 'tag-hard';
    const projectType = challenge.projectType || 'quiz';
    const cardAction = projectType === 'presentation' 
      ? `window.appRouter.openPresentation('${challenge.id}')` 
      : (projectType === 'video' ? `window.appRouter.openVideo('${challenge.id}')` : `window.appRouter.startChallengePreview('${challenge.id}')`);

    return `
      <div class="challenge-card" onclick="${cardAction}" style="cursor: pointer;">
        <div class="challenge-banner" style="background-image: url('${challenge.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}'); position: relative; height: 165px; border-radius: 16px 16px 0 0; overflow: hidden; display: flex; align-items: flex-end; padding: 1rem;">
          
          <!-- Insignia Superior Izquierda: Tipo de Proyecto o Dificultad -->
          <div style="position: absolute; top: 0.75rem; left: 0.75rem; z-index: 4;">
            ${projectType === 'presentation' 
              ? '<span class="badge-tag" style="background: rgba(124, 58, 237, 0.9); color: white; font-weight: 800; font-size: 0.85rem; padding: 0.4rem 0.85rem; border-radius: 9999px;">📊 Diapositivas</span>' 
              : (projectType === 'video' 
                ? '<span class="badge-tag" style="background: rgba(239, 68, 68, 0.9); color: white; font-weight: 800; font-size: 0.85rem; padding: 0.4rem 0.85rem; border-radius: 9999px;">🎬 Video</span>' 
                : (projectType === 'document' 
                  ? '<span class="badge-tag" style="background: rgba(59, 130, 246, 0.9); color: white; font-weight: 800; font-size: 0.85rem; padding: 0.4rem 0.85rem; border-radius: 9999px;">📄 Documento</span>' 
                  : (projectType === 'url' 
                    ? '<span class="badge-tag" style="background: rgba(16, 185, 129, 0.9); color: white; font-weight: 800; font-size: 0.85rem; padding: 0.4rem 0.85rem; border-radius: 9999px;">🌐 Enlace</span>' 
                    : `<span class="badge-tag ${diffTag}" style="font-size: 0.88rem; font-weight: 900; padding: 0.4rem 1rem; border-radius: 9999px; display: inline-flex; align-items: center; gap: 0.35rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);"><span style="font-size: 0.8rem;">📊</span> ${challenge.difficulty || 'Normal'}</span>`)))}
          </div>

          <!-- Superior Derecha: Tiempo + Botón Eliminar -->
          <div style="position: absolute; top: 0.75rem; right: 0.75rem; display: flex; align-items: center; gap: 0.5rem; z-index: 4;">
            <div style="background: rgba(10, 15, 30, 0.85); backdrop-filter: blur(8px); border: 1.5px solid rgba(0, 245, 212, 0.4); border-radius: 9999px; padding: 0.35rem 0.75rem; display: flex; align-items: center; gap: 0.35rem; font-weight: 900; font-size: 0.85rem; color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.4);">
              <span style="font-size: 0.9rem;">⏱️</span> <span>${challenge.timePerQuestion || 20}</span>
            </div>
            ${isOwner ? `
              <button 
                class="btn btn-danger" 
                title="Eliminar este reto"
                style="width: 36px; height: 36px; padding: 0; border-radius: 10px; font-size: 0.95rem; display: flex; align-items: center; justify-content: center; background: rgba(239, 68, 68, 0.9); border: none; box-shadow: 0 4px 12px rgba(239,68,68,0.35); cursor: pointer;"
                onclick="event.stopPropagation(); window.appRouter.deleteChallenge('${challenge.id}')"
              >
                🗑️
              </button>
            ` : ''}
          </div>

          <!-- Entidad Destacada en el Banner (Ocupa todo el cuadrito con PNG transparente) -->
          ${(challenge.entityLogo || challenge.entityName) ? `
            <div class="entity-badge-box" style="position: absolute; right: 0.85rem; bottom: 0.75rem; width: 84px; height: 56px; display: flex; align-items: center; justify-content: center; background: rgba(5, 10, 25, 0.9); backdrop-filter: blur(12px); border: 2px solid rgba(59, 130, 246, 0.85); border-radius: 12px; padding: 0; box-shadow: 0 8px 24px rgba(0,0,0,0.65), 0 0 15px rgba(59, 130, 246, 0.35); z-index: 3; overflow: hidden;">
              ${challenge.entityLogo ? `
                <img 
                  src="${challenge.entityLogo}" 
                  alt="${challenge.entityName || 'Entidad'}" 
                  style="width: 100%; height: 100%; object-fit: contain; object-position: center; display: block;" 
                  onload="window.makeEntityLogoTransparent ? window.makeEntityLogoTransparent(this) : null"
                  onerror="this.style.display='none'"
                />
              ` : `
                <span style="font-size: 1.05rem; font-weight: 900; color: #ffffff; letter-spacing: 0.5px; text-transform: uppercase; padding: 4px; text-align: center;">${challenge.entityName}</span>
              `}
            </div>
          ` : ''}

        </div>
        
        <div style="padding: 1.25rem; display: flex; flex-direction: column; flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
            <span style="font-size: 0.85rem; color: var(--neon-cyan); font-weight: 700;">${challenge.categoryName || 'General'}</span>
            <span style="color: var(--text-muted);">•</span>
            <span style="font-size: 0.85rem; color: var(--text-muted);">
              ${projectType === 'presentation' ? (challenge.slides ? challenge.slides.length : 0) + ' diapositivas' : (projectType === 'video' ? (challenge.chapters ? challenge.chapters.length : 0) + ' capítulos' : (challenge.questions ? challenge.questions.length : 0) + ' preguntas')}
            </span>
          </div>

          <h3 style="font-size: 1.15rem; margin-bottom: 0.5rem; line-height: 1.3;">
            ${challenge.title}
          </h3>

          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-bottom: 1.25rem; flex: 1; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${challenge.description || 'Contenido didáctico interactivo.'}
          </p>

          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 0.85rem; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.4rem; font-size: 0.82rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
              <span>${challenge.authorAvatar || '👤'}</span>
              <span>${challenge.author || 'Profesor'}</span>
            </div>
            <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
              ${projectType === 'presentation' ? `
                <button 
                  class="btn btn-outline" 
                  title="Editar Diapositivas"
                  style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                  onclick="event.stopPropagation(); window.appRouter.editPresentation('${challenge.id}')">
                  ✏️
                </button>
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.88rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, var(--neon-cyan)); border: none;"
                  onclick="event.stopPropagation(); window.appRouter.openPresentation('${challenge.id}')">
                  🖥️ Presentar
                </button>
              ` : (projectType === 'video' ? `
                <button 
                  class="btn btn-outline" 
                  title="Editar Video Clase"
                  style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                  onclick="event.stopPropagation(); window.appRouter.editVideo('${challenge.id}')">
                  ✏️
                </button>
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 1rem; font-size: 0.88rem; font-weight: 800; background: linear-gradient(135deg, #ef4444, #dc2626); border: none;"
                  onclick="event.stopPropagation(); window.appRouter.openVideo('${challenge.id}')">
                  🎬 Ver Video
                </button>
              ` : `
                ${isOwner ? `
                  <button 
                    class="btn btn-outline" 
                    title="Editar Reto"
                    style="padding: 0.45rem 0.75rem; font-size: 0.85rem;" 
                    onclick="event.stopPropagation(); window.appRouter.navigate('creator', { editId: '${challenge.id}' })">
                    ✏️
                  </button>
                ` : ''}
                <button 
                  class="btn btn-cyan" 
                  style="padding: 0.45rem 0.95rem; font-size: 0.88rem; font-weight: 800;"
                  onclick="event.stopPropagation(); window.appRouter.startSinglePlayer('${challenge.id}')">
                  ▶️ Jugar
                </button>
                <button 
                  class="btn btn-primary" 
                  style="padding: 0.45rem 0.95rem; font-size: 0.88rem; font-weight: 800;"
                  onclick="event.stopPropagation(); window.appRouter.hostRoom('${challenge.id}')">
                  🚀 Sala
                </button>
              `)}
            </div>
          </div>
        </div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = val;
    this.render();
  },

  filterCategory(catId) {
    this.activeCategory = catId;
    this.render();
  },

  joinByQuickPin() {
    const pin = document.getElementById('home-pin-input')?.value.trim();
    if (!pin || pin.length < 4) {
      alert('Ingresa un código PIN válido de al menos 4 a 6 dígitos');
      return;
    }
    window.appRouter.navigate('lobby-join', { pin: pin });
  }
};
