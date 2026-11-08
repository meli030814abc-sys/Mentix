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
                ${window.AvatarEngine ? window.AvatarEngine.renderPlayerIcon(u, 64) : u.avatar}
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
              <button class="btn btn-outline" onclick="window.appRouter.logout(${u.isGuest ? 'true' : ''})">
                ${u.isGuest ? '✨ Regístrate o inicia sesión' : '🚪 Cerrar Sesión'}
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
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem; ${u.isGuest ? 'display: none;' : ''}">
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
              window.appRouter ? window.appRouter.isChallengeOwner(c) : (
                (c.author && c.author.toLowerCase() === u.name?.toLowerCase()) ||
                (c.authorId && c.authorId === u.id)
              )
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
                          <span>⏱️ ${c.timePerQuestion === 0 ? 'Sin límite' : ((c.timePerQuestion || 20) + 's')}</span>
                          <span>•</span>
                          <span>${c.plays || 0} partidas</span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                      <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.startSinglePlayer('${c.id}')">
                        ▶️ Jugar
                      </button>
                      <button class="btn btn-primary" title="Crear Sala con Preguntas Presentadas (Proyector)" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.hostRoom('${c.id}', 'presented')">
                        🚀 Sala
                      </button>
                      <button class="btn btn-sala-normal" title="Crear Sala Normal: Preguntas y respuestas en la pantalla de cada jugador" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.hostRoom('${c.id}', 'normal')">
                        🎮 Sala Normal
                      </button>
                      <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.navigate('creator', { editId: '${c.id}' })">
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

        <!-- Sección: Mis Cuestionarios en Juego (En Proceso, Completados e Iniciados) -->
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem; ${u.isGuest ? 'display: none;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.6rem; margin: 0;">
                <span>🎯</span> Mis Retos y Evaluaciones en Juego
              </h2>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0.25rem 0 0;">
                Cuestionarios en proceso, retos completados y evaluaciones que has iniciado pero no has completado.
              </p>
            </div>

            <!-- Filtros / Pestañas de Estado -->
            ${(() => {
              const allAttempts = this.getQuizAttempts();
              const currentFilter = this.activeQuizFilter || 'all';
              const counts = {
                all: allAttempts.length,
                in_progress: allAttempts.filter(a => a.status === 'in_progress').length,
                initiated: allAttempts.filter(a => a.status === 'initiated').length,
                completed: allAttempts.filter(a => a.status === 'completed').length
              };

              return `
                <div style="display: flex; gap: 0.4rem; background: rgba(0,0,0,0.4); padding: 0.3rem 0.4rem; border-radius: 12px; border: 1px solid var(--border-color); flex-wrap: wrap;">
                  <button class="btn btn-sm ${currentFilter === 'all' ? 'btn-cyan' : 'btn-outline'}" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;"
                          onclick="window.ProfileView.setQuizFilter('all')">
                    📋 Todos (${counts.all})
                  </button>
                  <button class="btn btn-sm ${currentFilter === 'in_progress' ? 'btn-cyan' : 'btn-outline'}" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;"
                          onclick="window.ProfileView.setQuizFilter('in_progress')">
                    ⏳ En Proceso (${counts.in_progress})
                  </button>
                  <button class="btn btn-sm ${currentFilter === 'initiated' ? 'btn-cyan' : 'btn-outline'}" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;"
                          onclick="window.ProfileView.setQuizFilter('initiated')">
                    ⚡ Iniciados (${counts.initiated})
                  </button>
                  <button class="btn btn-sm ${currentFilter === 'completed' ? 'btn-cyan' : 'btn-outline'}" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px;"
                          onclick="window.ProfileView.setQuizFilter('completed')">
                    ✅ Completados (${counts.completed})
                  </button>
                </div>
              `;
            })()}
          </div>

          ${(() => {
            const allAttempts = this.getQuizAttempts();
            const currentFilter = this.activeQuizFilter || 'all';
            const filteredAttempts = allAttempts.filter(item => {
              if (currentFilter === 'all') return true;
              return item.status === currentFilter;
            });

            if (filteredAttempts.length === 0) {
              return `
                <div style="text-align: center; padding: 2.5rem 1rem; background: rgba(255,255,255,0.02); border-radius: var(--border-radius-md); border: 1px dashed var(--border-color);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🎮</div>
                  <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem;">No hay cuestionarios en esta sección</h3>
                  <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 1.25rem;">Explora los cuestionarios disponibles o únete a una sala para comenzar a jugar.</p>
                  <button class="btn btn-primary" onclick="window.appRouter.navigate('home')">
                    🚀 Explorar Retos
                  </button>
                </div>
              `;
            }

            return `
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${filteredAttempts.map(item => {
                  const totalQ = item.totalQuestions || 5;
                  const answeredQ = item.answeredQuestions || (item.status === 'completed' ? totalQ : 1);
                  const progressPct = Math.min(100, Math.max(10, Math.round((answeredQ / totalQ) * 100)));

                  let statusBadge = '';
                  let progressGradient = '';
                  if (item.status === 'completed') {
                    statusBadge = `<span class="badge-tag" style="background: rgba(6,214,160,0.18); color: #06d6a0; border: 1px solid rgba(6,214,160,0.4); font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 6px;">✓ Completado</span>`;
                    progressGradient = 'linear-gradient(90deg, #06d6a0, #00f5d4)';
                  } else if (item.status === 'in_progress') {
                    statusBadge = `<span class="badge-tag" style="background: rgba(0,245,212,0.18); color: var(--neon-cyan); border: 1px solid var(--neon-cyan); font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 6px;">⏳ En Proceso</span>`;
                    progressGradient = 'linear-gradient(90deg, #00f5d4, #00b4d8)';
                  } else {
                    statusBadge = `<span class="badge-tag" style="background: rgba(255,183,3,0.18); color: var(--neon-gold); border: 1px solid var(--neon-gold); font-size: 0.72rem; font-weight: 800; padding: 0.15rem 0.5rem; border-radius: 6px;">⚡ Iniciado sin terminar</span>`;
                    progressGradient = 'linear-gradient(90deg, #ffb703, #fb8500)';
                  }

                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(0,0,0,0.3); border: 1px solid var(--border-color); border-radius: var(--border-radius-md); padding: 1rem 1.25rem;">
                      <div style="display: flex; align-items: center; gap: 1rem; min-width: 220px; flex: 1 1 300px;">
                        <div style="width: 52px; height: 52px; border-radius: 10px; background: url('${item.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600'}') center/cover; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.15);"></div>
                        <div style="flex: 1;">
                          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                            <h4 style="font-size: 1.05rem; margin: 0;">${item.title}</h4>
                            ${statusBadge}
                          </div>
                          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: var(--text-secondary); flex-wrap: wrap;">
                            <span style="color: var(--neon-cyan); font-weight: 700;">${item.categoryName || 'General'}</span>
                            <span>•</span>
                            <span>${item.status === 'completed' ? `Completado: ${totalQ}/${totalQ} preguntas` : `Progreso: ${answeredQ}/${totalQ} preguntas (${progressPct}%)`}</span>
                            <span>•</span>
                            <span>🏆 ${(item.score || 0).toLocaleString()} pts</span>
                            <span>•</span>
                            <span>⏱️ ${item.dateFormatted || 'Reciente'}</span>
                          </div>
                          <!-- Mini Barra de Progreso -->
                          <div style="width: 100%; max-width: 260px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 9999px; margin-top: 0.45rem; overflow: hidden;">
                            <div style="width: ${progressPct}%; height: 100%; background: ${progressGradient}; border-radius: 9999px;"></div>
                          </div>
                        </div>
                      </div>

                      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${item.status === 'completed' ? `
                          <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.startSinglePlayer('${item.challengeId}')">
                            🔄 Reintentar
                          </button>
                          <button class="btn btn-primary" title="Crear Sala con Preguntas Presentadas (Proyector)" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.hostRoom('${item.challengeId}', 'presented')">
                            🚀 Sala
                          </button>
                          <button class="btn btn-sala-normal" title="Crear Sala Normal: Preguntas y respuestas en la pantalla de cada jugador" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.appRouter.hostRoom('${item.challengeId}', 'normal')">
                            🎮 Sala Normal
                          </button>
                          <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: rgba(0,245,212,0.4); color: var(--neon-cyan);" onclick="window.ProfileView.showAttemptResults('${item.id}')">
                            📊 Resultados
                          </button>
                          <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteAttempt('${item.id}')">
                            🗑️ Quitar
                          </button>
                        ` : `
                          <button class="btn btn-cyan" style="padding: 0.35rem 0.85rem; font-size: 0.82rem; font-weight: 800; box-shadow: 0 0 15px rgba(0, 245, 212, 0.35);" onclick="window.ProfileView.resumeAttempt('${item.id}')">
                            ▶️ Continuar Reto
                          </button>
                          <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.restartAttempt('${item.id}')">
                            🔄 Reiniciar
                          </button>
                          <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteAttempt('${item.id}')">
                            🗑️ Descartar
                          </button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}
        </div>

        <!-- Sección: Mis Proyectos Didácticos (En Proceso, Vistos/Leídos e Iniciados) - Lila Neón Brillante -->
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem; border: 2.5px solid rgba(192, 132, 252, 0.65); box-shadow: 0 10px 45px rgba(168, 85, 247, 0.32), inset 0 0 30px rgba(192, 132, 252, 0.12); background: rgba(22, 13, 44, 0.78); ${u.isGuest ? 'display: none;' : ''}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 0.75rem;">
            <div>
              <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.6rem; margin: 0; color: #f5edff; text-shadow: 0 0 16px rgba(192, 132, 252, 0.85), 0 0 32px rgba(168, 85, 247, 0.6); font-weight: 900;">
                <span>📁</span> Mis Proyectos en Curso
              </h2>
              <p style="font-size: 0.85rem; color: #d8b4fe; margin: 0.25rem 0 0; opacity: 0.95;">
                Proyectos en proceso, proyectos iniciados y proyectos que has visto o leído.
              </p>
            </div>

            <!-- Filtros / Pestañas de Estado (Lila Neón) -->
            ${(() => {
              const allProjAttempts = this.getProjectAttempts();
              const currentProjFilter = this.activeProjectFilter || 'all';
              const counts = {
                all: allProjAttempts.length,
                in_progress: allProjAttempts.filter(a => a.status === 'in_progress').length,
                initiated: allProjAttempts.filter(a => a.status === 'initiated').length,
                viewed: allProjAttempts.filter(a => a.status === 'viewed').length
              };

              return `
                <div style="display: flex; gap: 0.4rem; background: rgba(30, 15, 60, 0.75); padding: 0.35rem 0.45rem; border-radius: 12px; border: 1.5px solid rgba(192, 132, 252, 0.5); box-shadow: 0 0 18px rgba(192, 132, 252, 0.3); flex-wrap: wrap;">
                  <button class="btn btn-sm" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'all' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                          onclick="window.ProfileView.setProjectFilter('all')">
                    📋 Todos (${counts.all})
                  </button>
                  <button class="btn btn-sm" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'in_progress' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                          onclick="window.ProfileView.setProjectFilter('in_progress')">
                    ⏳ En Proceso (${counts.in_progress})
                  </button>
                  <button class="btn btn-sm" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'initiated' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                          onclick="window.ProfileView.setProjectFilter('initiated')">
                    ⚡ Iniciados (${counts.initiated})
                  </button>
                  <button class="btn btn-sm" 
                          style="padding: 0.35rem 0.75rem; font-size: 0.78rem; font-weight: 700; border-radius: 8px; transition: all 0.2s; ${currentProjFilter === 'viewed' ? 'background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 16px rgba(192, 132, 252, 0.7);' : 'background: transparent; color: #d8b4fe; border: 1px solid rgba(192, 132, 252, 0.25);'}"
                          onclick="window.ProfileView.setProjectFilter('viewed')">
                    👁️ Proyectos Vistos / Leídos (${counts.viewed})
                  </button>
                </div>
              `;
            })()}
          </div>

          ${(() => {
            const allProjAttempts = this.getProjectAttempts();
            const currentProjFilter = this.activeProjectFilter || 'all';
            const filteredProj = allProjAttempts.filter(item => {
              if (currentProjFilter === 'all') return true;
              return item.status === currentProjFilter;
            });

            if (filteredProj.length === 0) {
              return `
                <div style="text-align: center; padding: 2.5rem 1rem; background: rgba(192, 132, 252, 0.05); border-radius: var(--border-radius-md); border: 1px dashed rgba(192, 132, 252, 0.35);">
                  <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📂</div>
                  <h3 style="font-size: 1.15rem; margin-bottom: 0.25rem; color: #f5edff;">No hay proyectos en esta categoría</h3>
                  <p style="color: #d8b4fe; font-size: 0.85rem; margin-bottom: 1.25rem;">Explora los proyectos educativos de diapositivas, videos o documentos.</p>
                  <button class="btn" style="background: linear-gradient(135deg, #7c3aed, #c084fc); color: white; padding: 0.6rem 1.4rem; font-weight: 800; border: none; box-shadow: 0 0 18px rgba(192, 132, 252, 0.5);" onclick="window.appRouter.navigate('projects')">
                    🚀 Explorar Proyectos
                  </button>
                </div>
              `;
            }

            return `
              <div style="display: flex; flex-direction: column; gap: 0.85rem;">
                ${filteredProj.map(item => {
                  const totalP = item.totalParts || 6;
                  const viewedP = item.viewedParts || (item.status === 'viewed' ? totalP : 1);
                  const progressPct = Math.min(100, Math.max(12, Math.round((viewedP / totalP) * 100)));

                  let statusBadge = '';
                  let progressGradient = 'linear-gradient(90deg, #7c3aed, #c084fc, #e9d5ff)';
                  if (item.status === 'viewed') {
                    statusBadge = `<span class="badge-tag" style="background: rgba(192, 132, 252, 0.28); color: #f5edff; border: 1.5px solid #c084fc; font-size: 0.72rem; font-weight: 900; padding: 0.2rem 0.6rem; border-radius: 8px; box-shadow: 0 0 14px rgba(192, 132, 252, 0.55); text-transform: uppercase;">👁️ Visto / Leído</span>`;
                  } else if (item.status === 'in_progress') {
                    statusBadge = `<span class="badge-tag" style="background: rgba(168, 85, 247, 0.25); color: #d8b4fe; border: 1.5px solid rgba(168, 85, 247, 0.6); font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 8px; box-shadow: 0 0 10px rgba(168, 85, 247, 0.4);">⏳ En Proceso</span>`;
                  } else {
                    statusBadge = `<span class="badge-tag" style="background: rgba(216, 180, 254, 0.18); color: #e9d5ff; border: 1.5px solid rgba(216, 180, 254, 0.45); font-size: 0.72rem; font-weight: 800; padding: 0.2rem 0.6rem; border-radius: 8px;">⚡ Iniciado</span>`;
                  }

                  return `
                    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 1rem; background: rgba(26, 16, 52, 0.6); border: 1.5px solid rgba(192, 132, 252, 0.38); border-radius: var(--border-radius-md); padding: 1rem 1.25rem; box-shadow: 0 4px 20px rgba(0,0,0,0.35);">
                      <div style="display: flex; align-items: center; gap: 1rem; min-width: 220px; flex: 1 1 300px;">
                        <div style="width: 52px; height: 52px; border-radius: 10px; background: url('${item.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}') center/cover; flex-shrink: 0; border: 1.5px solid rgba(192, 132, 252, 0.65); box-shadow: 0 0 14px rgba(192, 132, 252, 0.38);"></div>
                        <div style="flex: 1;">
                          <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.25rem;">
                            <h4 style="font-size: 1.05rem; margin: 0; color: #ffffff; font-weight: 800;">${item.title}</h4>
                            ${statusBadge}
                          </div>
                          <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.78rem; color: #d8b4fe; flex-wrap: wrap;">
                            <span style="color: #c084fc; font-weight: 800;">${item.categoryName || 'General'}</span>
                            <span>•</span>
                            <span>${item.status === 'viewed' ? `Visto y leído completo (${totalP}/${totalP} partes)` : `Progreso de lectura: ${viewedP}/${totalP} partes (${progressPct}%)`}</span>
                            <span>•</span>
                            <span style="color: #f5edff;">${item.typeLabel || '📁 Proyecto'}</span>
                            <span>•</span>
                            <span>⏱️ ${item.dateFormatted || 'Reciente'}</span>
                          </div>
                          <!-- Mini Barra de Progreso en Lila Neón -->
                          <div style="width: 100%; max-width: 260px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 9999px; margin-top: 0.45rem; overflow: hidden; box-shadow: inset 0 1px 2px rgba(0,0,0,0.5);">
                            <div style="width: ${progressPct}%; height: 100%; background: ${progressGradient}; border-radius: 9999px; box-shadow: 0 0 12px rgba(192, 132, 252, 0.8);"></div>
                          </div>
                        </div>
                      </div>

                      <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                        ${item.status === 'viewed' ? `
                          <button class="btn btn-outline" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; border-color: rgba(192, 132, 252, 0.5); color: #f5edff;" onclick="window.ProfileView.openProject('${item.projectId}', '${item.projectType}')">
                            📖 Releer / Ver
                          </button>
                          <button class="btn" style="padding: 0.35rem 0.8rem; font-size: 0.8rem; background: linear-gradient(135deg, #7c3aed, #a855f7); color: white; border: none; box-shadow: 0 0 12px rgba(168, 85, 247, 0.4);" onclick="window.ProjectsView.openProjectLanding('${item.projectId}')">
                            🚀 Portada
                          </button>
                          <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteProjectAttempt('${item.id}')">
                            🗑️ Quitar
                          </button>
                        ` : `
                          <button class="btn" style="padding: 0.38rem 0.95rem; font-size: 0.82rem; font-weight: 800; background: linear-gradient(135deg, #7c3aed, #c084fc); color: #ffffff; border: none; box-shadow: 0 0 20px rgba(192, 132, 252, 0.65); border-radius: 8px;" onclick="window.ProfileView.openProject('${item.projectId}', '${item.projectType}')">
                            ▶️ Continuar Proyecto
                          </button>
                          <button class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.8rem; border-color: rgba(192, 132, 252, 0.4); color: #d8b4fe;" onclick="window.ProfileView.restartProjectAttempt('${item.id}')">
                            🔄 Reiniciar
                          </button>
                          <button class="btn btn-danger" style="padding: 0.35rem 0.75rem; font-size: 0.8rem;" onclick="window.ProfileView.deleteProjectAttempt('${item.id}')">
                            🗑️ Descartar
                          </button>
                        `}
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          })()}
        </div>

      </div>
    `;
  },

  activeQuizFilter: 'all',

  getQuizAttempts() {
    const u = window.appState?.currentUser;
    const storageKey = `mentix_quiz_attempts_${u?.id || 'default'}`;
    let attempts = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) attempts = JSON.parse(raw);
    } catch (e) {}

    // Si aún no hay intentos registrados en localStorage, inicializar inteligentemente
    // con retos reales de la plataforma en los 3 estados solicitados
    if (!Array.isArray(attempts) || attempts.length === 0) {
      const allChallenges = window.appState?.challenges || [];
      attempts = [];

      if (allChallenges.length > 0) {
        // 1. Cuestionario Completado
        const c1 = allChallenges[0];
        const qCount1 = c1.questions?.length || 5;
        attempts.push({
          id: 'attempt_' + c1.id + '_comp',
          challengeId: c1.id,
          title: c1.title,
          banner: c1.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
          categoryName: c1.categoryName || 'General',
          status: 'completed',
          totalQuestions: qCount1,
          answeredQuestions: qCount1,
          currentQuestionIndex: qCount1 - 1,
          score: 1250,
          accuracy: 100,
          updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
          dateFormatted: 'Hace 2 horas'
        });

        // 2. Cuestionario En Proceso (a mitad de camino)
        const c2 = allChallenges[1] || allChallenges[0];
        const qCount2 = c2.questions?.length || 5;
        const ans2 = Math.max(1, Math.floor(qCount2 / 2));
        attempts.push({
          id: 'attempt_' + c2.id + '_prog',
          challengeId: c2.id,
          title: c2.title,
          banner: c2.banner || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
          categoryName: c2.categoryName || 'General',
          status: 'in_progress',
          totalQuestions: qCount2,
          answeredQuestions: ans2,
          currentQuestionIndex: ans2,
          score: 620,
          accuracy: 80,
          updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
          dateFormatted: 'Hace 6 horas'
        });

        // 3. Cuestionario Iniciado pero no completado (en la primera pregunta)
        const c3 = allChallenges[2] || allChallenges[0];
        const qCount3 = c3.questions?.length || 4;
        attempts.push({
          id: 'attempt_' + c3.id + '_init',
          challengeId: c3.id,
          title: (c3.id === c1.id ? 'Prueba Inicial: ' : '') + c3.title,
          banner: c3.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600',
          categoryName: c3.categoryName || 'General',
          status: 'initiated',
          totalQuestions: qCount3,
          answeredQuestions: 1,
          currentQuestionIndex: 1,
          score: 150,
          accuracy: 100,
          updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
          dateFormatted: 'Ayer'
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(attempts));
        } catch (e) {}
      }
    }

    return attempts;
  },

  saveQuizAttempts(attempts) {
    const u = window.appState?.currentUser;
    const storageKey = `mentix_quiz_attempts_${u?.id || 'default'}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch (e) {}
  },

  setQuizFilter(filter) {
    this.activeQuizFilter = filter;
    this.render();
  },

  resumeAttempt(attemptId) {
    const attempts = this.getQuizAttempts();
    const item = attempts.find(a => a.id === attemptId);
    if (!item) return;

    const challenge = (window.appState?.challenges || []).find(c => c.id === item.challengeId);
    if (!challenge) {
      alert('⚠️ No se encontró la información del cuestionario.');
      return;
    }

    window.appRouter.startSinglePlayer(item.challengeId, {
      startIndex: item.currentQuestionIndex || 0,
      score: item.score || 0
    });
  },

  restartAttempt(attemptId) {
    const attempts = this.getQuizAttempts();
    const item = attempts.find(a => a.id === attemptId);
    if (!item) return;

    item.answeredQuestions = 0;
    item.currentQuestionIndex = 0;
    item.score = 0;
    item.status = 'initiated';
    item.updatedAt = new Date().toISOString();
    item.dateFormatted = 'Justo ahora';
    this.saveQuizAttempts(attempts);

    window.appRouter.startSinglePlayer(item.challengeId, {
      startIndex: 0,
      score: 0
    });
  },

  deleteAttempt(attemptId) {
    const ok = confirm('🗑️ ¿Deseas quitar este cuestionario de tu lista de actividades?');
    if (!ok) return;

    let attempts = this.getQuizAttempts();
    attempts = attempts.filter(a => a.id !== attemptId);
    this.saveQuizAttempts(attempts);
    this.render();
  },

  showAttemptResults(attemptId) {
    const attempts = this.getQuizAttempts();
    const item = attempts.find(a => a.id === attemptId);
    if (!item) return;

    const totalQ = item.totalQuestions || 5;
    const answeredQ = item.answeredQuestions || totalQ;
    const score = item.score || 0;
    const accuracy = item.accuracy || 100;

    const existingModal = document.getElementById('attempt-results-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'attempt-results-modal';
    modal.className = 'modal-backdrop active';
    modal.style.position = 'fixed';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100vw';
    modal.style.height = '100vh';
    modal.style.background = 'rgba(0,0,0,0.85)';
    modal.style.backdropFilter = 'blur(10px)';
    modal.style.zIndex = '99999';
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    modal.style.padding = '1.5rem';

    modal.innerHTML = `
      <div class="glass-panel" style="max-width: 500px; width: 100%; padding: 2.25rem; border-radius: 20px; text-align: center; border: 1.5px solid var(--border-color); box-shadow: 0 20px 60px rgba(0,0,0,0.8); position: relative;">
        <button onclick="document.getElementById('attempt-results-modal')?.remove()" style="position: absolute; top: 1rem; right: 1rem; background: transparent; border: none; font-size: 1.4rem; color: var(--text-muted); cursor: pointer;">✕</button>
        
        <div style="font-size: 3rem; margin-bottom: 0.5rem;">🏆</div>
        <h2 style="font-size: 1.5rem; margin-bottom: 0.25rem;" class="glow-text-gold">Resultados del Reto</h2>
        <h4 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 1.5rem;">${item.title}</h4>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; margin-bottom: 1.75rem;">
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Puntaje Total</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--neon-gold);">${score.toLocaleString()} pts</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Preguntas</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: #06d6a0;">${answeredQ} / ${totalQ}</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Precisión</div>
            <div style="font-size: 1.6rem; font-weight: 900; color: var(--neon-cyan);">${accuracy}%</div>
          </div>
          <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem;">
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.25rem;">Fecha</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary);">${item.dateFormatted || 'Hoy'}</div>
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap;">
          <button class="btn btn-outline" style="padding: 0.6rem 1.4rem;" onclick="document.getElementById('attempt-results-modal')?.remove(); window.appRouter.startSinglePlayer('${item.challengeId}')">
            🔄 Jugar de Nuevo
          </button>
          <button class="btn btn-primary" style="padding: 0.6rem 1.4rem;" onclick="document.getElementById('attempt-results-modal')?.remove()">
            Cerrar
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  recordQuizProgress(challenge, questionIndex, player) {
    if (!challenge || !challenge.id) return;
    const totalQ = challenge.questions ? challenge.questions.length : 5;
    let attempts = this.getQuizAttempts();
    let item = attempts.find(a => a.challengeId === challenge.id);

    const isFinished = questionIndex >= totalQ - 1;
    const status = isFinished ? 'completed' : (questionIndex === 0 ? 'initiated' : 'in_progress');

    if (!item) {
      item = {
        id: 'attempt_' + challenge.id + '_' + Date.now(),
        challengeId: challenge.id,
        title: challenge.title,
        banner: challenge.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
        categoryName: challenge.categoryName || 'General',
        status: status,
        totalQuestions: totalQ,
        answeredQuestions: questionIndex + 1,
        currentQuestionIndex: questionIndex,
        score: player?.score || 0,
        accuracy: 90,
        updatedAt: new Date().toISOString(),
        dateFormatted: 'Justo ahora'
      };
      attempts.unshift(item);
    } else {
      item.title = challenge.title || item.title;
      item.banner = challenge.banner || item.banner;
      item.totalQuestions = totalQ;
      item.answeredQuestions = Math.min(totalQ, Math.max(item.answeredQuestions || 1, questionIndex + 1));
      item.currentQuestionIndex = questionIndex;
      item.score = Math.max(item.score || 0, player?.score || 0);
      if (item.status !== 'completed' || isFinished) {
        item.status = status;
      }
      item.updatedAt = new Date().toISOString();
      item.dateFormatted = 'Justo ahora';
    }

    this.saveQuizAttempts(attempts);
  },

  recordQuizCompletion(challenge, player) {
    if (!challenge || !challenge.id) return;
    const totalQ = challenge.questions ? challenge.questions.length : 5;
    let attempts = this.getQuizAttempts();
    let item = attempts.find(a => a.challengeId === challenge.id);

    if (!item) {
      item = {
        id: 'attempt_' + challenge.id + '_' + Date.now(),
        challengeId: challenge.id,
        title: challenge.title,
        banner: challenge.banner || 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600',
        categoryName: challenge.categoryName || 'General',
        status: 'completed',
        totalQuestions: totalQ,
        answeredQuestions: totalQ,
        currentQuestionIndex: totalQ - 1,
        score: player?.score || 1000,
        accuracy: 100,
        updatedAt: new Date().toISOString(),
        dateFormatted: 'Justo ahora'
      };
      attempts.unshift(item);
    } else {
      item.status = 'completed';
      item.answeredQuestions = totalQ;
      item.score = Math.max(item.score || 0, player?.score || 0);
      item.updatedAt = new Date().toISOString();
      item.dateFormatted = 'Justo ahora';
    }

    this.saveQuizAttempts(attempts);
  },

  activeProjectFilter: 'all',

  getProjectAttempts() {
    const u = window.appState?.currentUser;
    const storageKey = `mentix_project_attempts_${u?.id || 'default'}`;
    let attempts = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) attempts = JSON.parse(raw);
    } catch (e) {}

    if (!Array.isArray(attempts) || attempts.length === 0) {
      const allProjects = (window.appState?.challenges || []).filter(c =>
        c.projectType === 'presentation' || c.projectType === 'video' || c.projectType === 'document' || c.projectType === 'url'
      );
      const pool = allProjects.length > 0 ? allProjects : (window.appState?.challenges || []);
      attempts = [];

      if (pool.length > 0) {
        // 1. Proyecto Visto / Leído (Completado)
        const p1 = pool[0];
        const totalP1 = p1.slides?.length || (p1.sections?.length) || 6;
        attempts.push({
          id: 'proj_att_' + p1.id + '_viewed',
          projectId: p1.id,
          title: p1.title,
          banner: p1.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
          categoryName: p1.categoryName || 'General',
          projectType: p1.projectType || 'presentation',
          typeLabel: p1.projectType === 'video' ? '🎬 Video Clase' : (p1.projectType === 'document' ? '📄 Documento' : (p1.projectType === 'url' ? '🌐 Enlace Web' : '📊 Diapositivas')),
          status: 'viewed',
          totalParts: totalP1,
          viewedParts: totalP1,
          updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
          dateFormatted: 'Hace 3 horas'
        });

        // 2. Proyecto En Proceso
        const p2 = pool[1] || pool[0];
        const totalP2 = p2.slides?.length || (p2.sections?.length) || 8;
        const viewedP2 = Math.max(1, Math.floor(totalP2 / 2));
        attempts.push({
          id: 'proj_att_' + p2.id + '_prog',
          projectId: p2.id,
          title: p2.title,
          banner: p2.banner || 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
          categoryName: p2.categoryName || 'General',
          projectType: p2.projectType || 'video',
          typeLabel: p2.projectType === 'video' ? '🎬 Video Clase' : (p2.projectType === 'document' ? '📄 Documento' : (p2.projectType === 'url' ? '🌐 Enlace Web' : '📊 Diapositivas')),
          status: 'in_progress',
          totalParts: totalP2,
          viewedParts: viewedP2,
          updatedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
          dateFormatted: 'Hace 8 horas'
        });

        // 3. Proyecto Iniciado sin terminar
        const p3 = pool[2] || pool[0];
        const totalP3 = p3.slides?.length || (p3.sections?.length) || 5;
        attempts.push({
          id: 'proj_att_' + p3.id + '_init',
          projectId: p3.id,
          title: (p3.id === p1.id ? 'Guía Inicial: ' : '') + p3.title,
          banner: p3.banner || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
          categoryName: p3.categoryName || 'General',
          projectType: p3.projectType || 'document',
          typeLabel: p3.projectType === 'video' ? '🎬 Video Clase' : (p3.projectType === 'document' ? '📄 Documento' : (p3.projectType === 'url' ? '🌐 Enlace Web' : '📊 Diapositivas')),
          status: 'initiated',
          totalParts: totalP3,
          viewedParts: 1,
          updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
          dateFormatted: 'Ayer'
        });

        try {
          localStorage.setItem(storageKey, JSON.stringify(attempts));
        } catch (e) {}
      }
    }

    return attempts;
  },

  saveProjectAttempts(attempts) {
    const u = window.appState?.currentUser;
    const storageKey = `mentix_project_attempts_${u?.id || 'default'}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(attempts));
    } catch (e) {}
  },

  setProjectFilter(filter) {
    this.activeProjectFilter = filter;
    this.render();
  },

  openProject(projectId, projectType) {
    if (projectType === 'video') {
      window.appRouter.openVideo(projectId);
    } else if (projectType === 'document') {
      window.appRouter.openDocument(projectId);
    } else if (projectType === 'url') {
      window.appRouter.openUrl(projectId);
    } else {
      window.appRouter.openPresentation(projectId);
    }
  },

  restartProjectAttempt(attemptId) {
    const attempts = this.getProjectAttempts();
    const item = attempts.find(a => a.id === attemptId);
    if (!item) return;

    item.viewedParts = 1;
    item.status = 'initiated';
    item.updatedAt = new Date().toISOString();
    item.dateFormatted = 'Justo ahora';
    this.saveProjectAttempts(attempts);

    this.openProject(item.projectId, item.projectType);
  },

  deleteProjectAttempt(attemptId) {
    const ok = confirm('🗑️ ¿Deseas quitar este proyecto de tu lista de actividades?');
    if (!ok) return;

    let attempts = this.getProjectAttempts();
    attempts = attempts.filter(a => a.id !== attemptId);
    this.saveProjectAttempts(attempts);
    this.render();
  },

  recordProjectProgress(project, currentPart, totalParts) {
    if (!project || !project.id) return;
    const totalP = totalParts || project.slides?.length || (project.sections?.length) || 5;
    let attempts = this.getProjectAttempts();
    let item = attempts.find(a => a.projectId === project.id);

    const isFinished = currentPart >= totalP - 1;
    const status = isFinished ? 'viewed' : (currentPart <= 1 ? 'initiated' : 'in_progress');

    if (!item) {
      item = {
        id: 'proj_att_' + project.id + '_' + Date.now(),
        projectId: project.id,
        title: project.title,
        banner: project.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        categoryName: project.categoryName || 'General',
        projectType: project.projectType || 'presentation',
        typeLabel: project.projectType === 'video' ? '🎬 Video Clase' : (project.projectType === 'document' ? '📄 Documento' : (project.projectType === 'url' ? '🌐 Enlace Web' : '📊 Diapositivas')),
        status: status,
        totalParts: totalP,
        viewedParts: currentPart + 1,
        updatedAt: new Date().toISOString(),
        dateFormatted: 'Justo ahora'
      };
      attempts.unshift(item);
    } else {
      item.title = project.title || item.title;
      item.banner = project.banner || item.banner;
      item.totalParts = totalP;
      item.viewedParts = Math.min(totalP, Math.max(item.viewedParts || 1, currentPart + 1));
      if (item.status !== 'viewed' || isFinished) {
        item.status = status;
      }
      item.updatedAt = new Date().toISOString();
      item.dateFormatted = 'Justo ahora';
    }

    this.saveProjectAttempts(attempts);
  },

  recordProjectViewed(project) {
    if (!project || !project.id) return;
    const totalP = project.slides?.length || (project.sections?.length) || 5;
    let attempts = this.getProjectAttempts();
    let item = attempts.find(a => a.projectId === project.id);

    if (!item) {
      item = {
        id: 'proj_att_' + project.id + '_' + Date.now(),
        projectId: project.id,
        title: project.title,
        banner: project.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
        categoryName: project.categoryName || 'General',
        projectType: project.projectType || 'presentation',
        typeLabel: project.projectType === 'video' ? '🎬 Video Clase' : (project.projectType === 'document' ? '📄 Documento' : (project.projectType === 'url' ? '🌐 Enlace Web' : '📊 Diapositivas')),
        status: 'viewed',
        totalParts: totalP,
        viewedParts: totalP,
        updatedAt: new Date().toISOString(),
        dateFormatted: 'Justo ahora'
      };
      attempts.unshift(item);
    } else {
      item.status = 'viewed';
      item.viewedParts = totalP;
      item.updatedAt = new Date().toISOString();
      item.dateFormatted = 'Justo ahora';
    }

    this.saveProjectAttempts(attempts);
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
