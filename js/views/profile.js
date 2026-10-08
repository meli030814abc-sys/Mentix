/**
 * 🔥 TE RETO - Perfil de Usuario, Niveles de XP y Medallas Desbloqueables
 */

window.ProfileView = {
  render() {
    const container = document.getElementById('view-profile');
    if (!container) return;

    const u = window.appState.currentUser;
    const levels = DEFAULT_LEVELS;
    const currentLevel = levels.find(l => l.level === u.level) || levels[0];
    const nextLevel = levels.find(l => l.level === u.level + 1);

    // Progreso de XP
    let progressPercent = 100;
    if (nextLevel) {
      const range = nextLevel.minXp - currentLevel.minXp;
      const current = u.xp - currentLevel.minXp;
      progressPercent = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
    }

    const medals = DEFAULT_MEDALS.map(m => {
      return {
        ...m,
        unlocked: u.medals && u.medals.includes(m.id)
      };
    });

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Tarjeta Principal del Perfil -->
        <div class="glass-panel" style="padding: 2.25rem; margin-bottom: 2rem; position: relative; overflow: hidden;">
          <div style="position: absolute; top: -30px; right: -30px; width: 140px; height: 140px; background: radial-gradient(circle, rgba(0,245,212,0.2) 0%, transparent 70%); border-radius: 50%;"></div>

          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.5rem;">
            <div style="display: flex; align-items: center; gap: 1.25rem;">
              <div style="width: 84px; height: 84px; border-radius: 50%; background: #131b2e; border: 3px solid var(--neon-cyan); display: flex; align-items: center; justify-content: center; font-size: 3rem; box-shadow: 0 0 25px rgba(0,245,212,0.3);">
                ${u.avatar}
              </div>
              <div>
                <div style="display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.25rem;">
                  <h1 style="font-size: 1.8rem; margin: 0;">${u.name}</h1>
                  <span class="badge-tag" style="background: rgba(247,37,133,0.2); color: var(--neon-magenta); border: 1px solid var(--neon-magenta);">
                    ${u.role === 'teacher' ? '👨‍🏫 Profesor' : u.role === 'admin' ? '🛡️ Administrador' : '🎒 Estudiante'}
                  </span>
                </div>
                <div style="color: var(--text-secondary); font-size: 0.95rem;">
                  @${u.username} • ${u.institution || 'Comunidad MENTIX'}
                </div>
              </div>
            </div>

            <div style="display: flex; gap: 0.5rem;">
              <button class="btn btn-outline" onclick="window.appRouter.logout()">
                🚪 Cerrar Sesión
              </button>
              <button class="btn btn-cyan" onclick="window.ProfileView.editAvatar()">
                🎨 Cambiar Avatar
              </button>
            </div>
          </div>

          <!-- Barra de Experiencia XP y Nivel -->
          <div style="margin-top: 2rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 1.25rem; border: 1px solid var(--border-color);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-size: 1.5rem;">${currentLevel.icon}</span>
                <span style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">
                  Nivel ${u.level} — <span class="glow-text-cyan">${currentLevel.name}</span>
                </span>
              </div>
              <div style="font-weight: 800; font-size: 0.95rem; color: var(--neon-gold);">
                ${u.xp.toLocaleString()} XP ${nextLevel ? ` / ${nextLevel.minXp.toLocaleString()} XP` : ' (Nivel Máximo)'}
              </div>
            </div>

            <div class="xp-bar-container">
              <div class="xp-bar-fill" style="width: ${progressPercent}%;"></div>
            </div>

            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
              <span>Progreso actual: ${progressPercent}%</span>
              <span>${nextLevel ? `Faltan ${(nextLevel.minXp - u.xp).toLocaleString()} XP para ${nextLevel.name}` : '¡Eres una Leyenda viviente!'}</span>
            </div>
          </div>
        </div>

        <!-- Métricas Rápidas de Rendimiento -->
        <div style="display: ${u.isGuest ? 'none' : 'grid'}; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;">
          <div class="glass-panel" style="padding: 1.25rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.25rem;">🎮</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--text-primary);">${u.challengesPlayed || 0}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">RETOS JUGADOS</div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.25rem;">🏆</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--neon-gold);">${u.victories || 0}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">VICTORIAS (1º)</div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.25rem;">✏️</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--neon-cyan);">${u.challengesCreated || 0}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">RETOS CREADOS</div>
          </div>

          <div class="glass-panel" style="padding: 1.25rem; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 0.25rem;">🎖️</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--neon-magenta);">${(u.medals || []).length} / ${DEFAULT_MEDALS.length}</div>
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">MEDALLAS</div>
          </div>
        </div>

        <!-- Vitrina de Medallas y Logros -->
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem; ${u.isGuest ? 'display: none;' : ''}">
          <h2 style="font-size: 1.4rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.6rem;">
            <span>🎖️</span> Vitrina de Medallas y Logros
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem;">
            ${medals.map(m => `
              <div class="medal-card ${m.unlocked ? 'unlocked' : 'locked'}">
                <div class="medal-icon-wrapper">
                  ${m.icon}
                </div>
                <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary);">${m.title}</div>
                <p style="font-size: 0.82rem; color: var(--text-secondary); margin: 0;">${m.desc}</p>
                <span class="badge-tag" style="margin-top: 0.5rem; background: ${m.unlocked ? 'rgba(6,214,160,0.2)' : 'rgba(255,255,255,0.05)'}; color: ${m.unlocked ? '#06d6a0' : 'var(--text-muted)'}; font-size: 0.72rem;">
                  ${m.unlocked ? '✓ Desbloqueada' : '🔒 Bloqueada'}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Sección: Mis Cuestionarios Creados -->
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.6rem; margin: 0;">
                <span>📚</span> Mis Cuestionarios Creados
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0;">
                Retos y lecciones que has publicado en la plataforma. Solo tú como autor puedes eliminarlos o modificarlos.
              </p>
            </div>
            <button class="btn btn-cyan" onclick="window.appRouter.navigate('creator')">
              <span>➕</span> Crear Nuevo Reto
            </button>
          </div>

          ${(() => {
            const myChallenges = (window.appState.challenges || []).filter(c => 
              (c.author && c.author.toLowerCase() === u.name?.toLowerCase()) ||
              (c.authorId && c.authorId === u.id)
            );

            if (myChallenges.length === 0) {
              return `
                <div style="text-align: center; padding: 2.5rem 1rem; background: rgba(255,255,255,0.02); border-radius: var(--border-radius-md); border: 1px dashed var(--border-color);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎯</div>
                  <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">Aún no has creado cuestionarios</h3>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem;">Crea retos educativos o de entretenimiento para compartirlos con tus alumnos o amigos.</p>
                  <button class="btn btn-primary" onclick="window.appRouter.navigate('creator')">
                    🚀 ¡Crear mi primer reto ahora!
                  </button>
                </div>
              `;
            }

            return `
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${myChallenges.map(c => `
                  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 1rem 1.25rem;">
                    <div style="display: flex; align-items: center; gap: 1rem; min-width: 200px;">
                      <div style="width: 52px; height: 52px; border-radius: 10px; background: url('${c.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}') center/cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);"></div>
                      <div>
                        <h4 style="font-size: 1.05rem; margin: 0 0 0.25rem 0;">${c.title}</h4>
                        <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary);">
                          <span style="color: var(--neon-cyan); font-weight: 700;">${c.categoryName || 'General'}</span>
                          <span>•</span>
                          <span>${c.questions ? c.questions.length : 0} preguntas</span>
                          <span>•</span>
                          <span>⏱️ ${c.timePerQuestion || 20}s</span>
                          <span>•</span>
                          <span>${c.plays || 0} partidas</span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; align-items: center;">
                      <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.startSinglePlayer('${c.id}')">
                        ▶️ Jugar
                      </button>
                      <button class="btn btn-primary" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.hostRoom('${c.id}')">
                        🚀 Sala
                      </button>
                      <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.CreatorView.render(window.appState.challenges.find(item => item.id === '${c.id}')); window.appRouter.navigate('creator');">
                        ✏️ Editar
                      </button>
                      <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.deleteChallenge('${c.id}')">
                        🗑️ Borrar
                      </button>
                    </div>
                  </div>
                `).join('')}
              </div>
            `;
          })()}
        </div>

      </div>
    `;
  },

  editAvatar() {
    const avatars = ['🦊', '🦄', '🐯', '🐼', '🦁', '🐰', '🦅', '🐱', '🐺', '🚀', '⚡', '🎮', '👨‍🏫', '👩‍💻', '🧙‍♂️'];
    const chosen = prompt(`Elige un avatar de la lista:\n${avatars.join(' ')}`, window.appState.currentUser.avatar);
    if (chosen && avatars.includes(chosen.trim())) {
      window.appState.currentUser.avatar = chosen.trim();
      saveGlobalState(window.appState);
      this.render();
      window.appRouter.updateNavbar();
    }
  },

  switchRoleModal() {
    const role = prompt("Selecciona rol:\n1. student (Estudiante)\n2. teacher (Profesor)\n3. admin (Administrador)");
    if (role === '1' || role === 'student') window.appState.currentUser.role = 'student';
    else if (role === '2' || role === 'teacher') window.appState.currentUser.role = 'teacher';
    else if (role === '3' || role === 'admin') window.appState.currentUser.role = 'admin';
    saveGlobalState(window.appState);
    this.render();
    window.appRouter.updateNavbar();
    alert('Rol actualizado a: ' + window.appState.currentUser.role);
  }
};
