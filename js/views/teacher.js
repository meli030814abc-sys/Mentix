/**
 * 🔥 TE RETO - Panel del Profesor (Teacher Dashboard)
 * Gestión de cursos/grupos (ej. Grado 7B), métricas de acierto y lanzamiento directo de retos.
 */

window.TeacherView = {
  render() {
    const container = document.getElementById('view-teacher');
    if (!container) return;

    const groups = window.appState.groups || [];
    const myChallenges = window.appState.challenges.filter(c => c.author === window.appState.currentUser.name || true);

    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header Profesor -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <span class="badge-tag tag-medium" style="margin-bottom: 0.5rem; display: inline-block;">PANEL DOCENTE</span>
            <h1 style="font-size: 2.2rem; display: flex; align-items: center; gap: 0.6rem;">
              <span>👨‍🏫</span> Gestión Académica y Grupos
            </h1>
            <p style="color: var(--text-secondary);">Supervisa el rendimiento de tus clases y lanza cuestionarios en tiempo real.</p>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.TeacherView.newGroupModal()">
              <span>➕</span> Crear Nuevo Grupo
            </button>
            <button class="btn btn-primary" onclick="window.appRouter.navigate('creator')">
              <span>🚀</span> Crear Nuevo Reto
            </button>
          </div>
        </div>

        <!-- Métricas Docentes Clave -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">CURSOS ACTIVOS</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--text-primary);">${groups.length}</div>
            <div style="font-size: 0.8rem; color: var(--neon-cyan); margin-top: 0.25rem;">+2 grados este semestre</div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">ALUMNOS EVALUADOS</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--neon-cyan);">60</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">En 6 retos recientes</div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PROMEDIO DE ACIERTOS</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--neon-emerald);">81%</div>
            <div style="font-size: 0.8rem; color: var(--neon-emerald); margin-top: 0.25rem;">Rendimiento óptimo general</div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PREGUNTA MÁS COMPLEJA</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--neon-magenta); margin-top: 0.5rem; line-height: 1.2;">
              Jerarquía en matemáticas
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">54% de acierto</div>
          </div>
        </div>

        <!-- Sección de Grupos / Cursos -->
        <h2 style="font-size: 1.4rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
          <span>👥</span> Grupos y Cursos Registrados
        </h2>

        <div style="display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 3rem;">
          ${groups.map(grp => `
            <div class="glass-panel" style="padding: 1.75rem;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem;">
                <div>
                  <div style="font-size: 1.3rem; font-weight: 800; color: var(--text-primary);">
                    ${grp.name}
                  </div>
                  <div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">
                    👥 ${grp.studentsCount} estudiantes inscritos • Promedio grupal: <strong style="color:var(--neon-emerald);">${grp.avgScore}%</strong>
                  </div>
                </div>

                <div style="display: flex; gap: 0.5rem;">
                  <button class="btn btn-primary" onclick="window.TeacherView.launchGroupChallenge('${grp.id}')">
                    <span>🚀</span> Iniciar Reto para este Grupo
                  </button>
                </div>
              </div>

              <!-- Top Estudiantes del Grupo -->
              <div style="font-size: 0.9rem; font-weight: 700; color: var(--text-secondary); margin-bottom: 0.75rem;">
                Cuadro de Honor del Grupo:
              </div>

              <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem;">
                ${grp.students.map(st => `
                  <div style="background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 0.75rem; border: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.6rem;">
                    <span style="font-size: 1.6rem;">${st.avatar}</span>
                    <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                      <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">${st.name}</div>
                      <div style="font-size: 0.75rem; color: var(--neon-cyan);">${st.points.toLocaleString()} pts</div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  launchGroupChallenge(groupId) {
    const group = window.appState.groups.find(g => g.id === groupId);
    const challenges = window.appState.challenges;
    const challenge = challenges[0];
    if (!group || !challenge) return;

    // Abrir el configurador de acceso con este grupo preseleccionado
    window.LobbyView.openCreateRoomRosterModal(
      challenge,
      'clasico',
      {},
      groupId
    );
  },

  newGroupModal() {
    const name = prompt('Nombre del nuevo curso o grupo (Ej: GRADO 8C - INFORMÁTICA):');
    if (!name) return;
    const count = parseInt(prompt('Cantidad aproximada de estudiantes:', '30')) || 30;

    const newGroup = {
      id: 'group_' + Date.now(),
      name: name.toUpperCase(),
      studentsCount: count,
      teacherId: window.appState.currentUser.id,
      avgScore: 80,
      students: [
        { name: 'Estudiante Ejemplo 1', points: 4200, played: 3, avatar: '🦊' },
        { name: 'Estudiante Ejemplo 2', points: 3800, played: 3, avatar: '🐯' }
      ]
    };

    window.appState.groups.push(newGroup);
    saveGlobalState(window.appState);
    this.render();
    alert('✅ Grupo creado correctamente.');
  }
};
