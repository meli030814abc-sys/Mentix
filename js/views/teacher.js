/**
 * 🔥 TE RETO - Panel del Profesor (Teacher Dashboard)
 * Gestión de cursos/grupos (ej. Grado 7B), métricas de acierto y lanzamiento directo de retos.
 */

window.TeacherView = {
  selectedGroupIdForLaunch: null,

  render() {
    const container = document.getElementById('view-teacher');
    if (!container) return;

    const groups = window.appState.groups || [];
    const challenges = window.appState.challenges || [];
    const currentUser = window.appState.currentUser || {};

    // Cuestionarios creados por el profesor o disponibles
    const myChallenges = challenges.filter(c => {
      if (!c) return false;
      if (c.authorId && currentUser.id && String(c.authorId) === String(currentUser.id)) return true;
      if (c.authorEmail && currentUser.email && c.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
      if (c.author && currentUser.name && c.author.toLowerCase() === currentUser.name.toLowerCase()) return true;
      return true; // Mostrar todos los retos globales para que el profesor pueda usarlos con sus grupos
    });

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header Profesor -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <span class="badge-tag tag-medium" style="margin-bottom: 0.5rem; display: inline-block;">PANEL DOCENTE</span>
            <h1 style="font-size: 2.2rem; display: flex; align-items: center; gap: 0.6rem;">
              <span>👨‍🏫</span> Gestión Académica y Evaluaciones
            </h1>
            <p style="color: var(--text-secondary);">Supervisa el rendimiento de tus clases, evalúa a tus alumnos y lanza cuestionarios en tiempo real.</p>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-outline" onclick="window.TeacherView.newGroupModal()">
              <span>➕</span> Crear Nuevo Grupo
            </button>
            <button class="btn btn-primary" onclick="window.appRouter.navigate('creator')">
              <span>🚀</span> Crear Nuevo Reto / Examen
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
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">EVALUACIONES DISPONIBLES</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--neon-cyan);">${challenges.length}</div>
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.25rem;">Listas para lanzar a tus grupos</div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PROMEDIO DE ACIERTOS</div>
            <div style="font-size: 2rem; font-weight: 900; color: var(--neon-emerald);">81%</div>
            <div style="font-size: 0.8rem; color: var(--neon-emerald); margin-top: 0.25rem;">Rendimiento óptimo general</div>
          </div>

          <div class="glass-panel" style="padding: 1.5rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">MODOS DE SALA</div>
            <div style="font-size: 1.2rem; font-weight: 800; color: var(--neon-gold); margin-top: 0.5rem; line-height: 1.2;">
              📽️ Presentadas & 🎮 Normal
            </div>
            <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 0.25rem;">Compatible con cualquier dispositivo</div>
          </div>
        </div>

        <!-- SECCIÓN 1: EVALUACIONES Y QUIZZES LISTOS PARA LANZAR O PROBAR -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <h2 style="font-size: 1.4rem; margin: 0; display: flex; align-items: center; gap: 0.5rem;">
            <span>📚</span> Quizzes y Evaluaciones Disponibles
          </h2>
          <span style="font-size: 0.85rem; color: var(--text-secondary);">
            Puedes probarlos como estudiante, proyectarlos en pantalla gigante o abrir sala normal.
          </span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; margin-bottom: 3rem;">
          ${challenges.length === 0 ? `
            <div class="glass-panel" style="padding: 2.5rem; text-align: center; grid-column: 1 / -1;">
              <span style="font-size: 2.5rem;">📝</span>
              <h3 style="margin-top: 0.5rem;">Aún no hay cuestionarios disponibles</h3>
              <p style="color: var(--text-secondary); margin-bottom: 1.25rem;">Crea tu primera evaluación interactiva para tus estudiantes.</p>
              <button class="btn btn-primary" onclick="window.appRouter.navigate('creator')">🚀 Crear Nueva Evaluación</button>
            </div>
          ` : challenges.map(c => {
            const isMyQuiz = (c.authorId && currentUser.id && String(c.authorId) === String(currentUser.id)) ||
              (c.author && currentUser.name && c.author.toLowerCase() === currentUser.name.toLowerCase());
            return `
              <div class="glass-panel" style="padding: 1.25rem; display: flex; flex-direction: column; justify-content: space-between; border-color: ${isMyQuiz ? 'var(--neon-cyan)' : 'var(--border-color)'};">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;">
                    <span class="badge-tag" style="background: rgba(0, 245, 212, 0.12); color: var(--neon-cyan); font-weight: 800; font-size: 0.75rem;">
                      ${c.categoryName || 'General'}
                    </span>
                    <span class="badge-tag" style="background: rgba(255,255,255,0.08); font-size: 0.75rem;">
                      ⏱️ ${c.timePerQuestion || 20}s • 📝 ${c.questions?.length || 0} preg.
                    </span>
                  </div>

                  <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.35rem; color: var(--text-primary); line-height: 1.3;">
                    ${c.title}
                  </h3>

                  <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                    ${c.description || 'Evaluación interactiva para clase.'}
                  </p>

                  <div style="font-size: 0.78rem; color: var(--text-muted); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.4rem;">
                    <span>${c.authorAvatar || '👤'}</span>
                    <span>Autor: <strong>${c.author || 'Profesor'}</strong></span>
                    ${isMyQuiz ? '<span class="badge-tag" style="background: rgba(16,185,129,0.2); color:#10b981; font-size:0.68rem; padding:0.1rem 0.4rem;">Creado por ti</span>' : ''}
                  </div>
                </div>

                <!-- Botones de Acción de la Evaluación -->
                <div style="display: flex; flex-wrap: wrap; gap: 0.45rem; border-top: 1px solid var(--border-color); padding-top: 0.85rem;">
                  <button 
                    class="btn btn-outline" 
                    title="Realizar la prueba como estudiante para verificarla"
                    style="flex: 1; min-width: 120px; font-size: 0.82rem; font-weight: 800; padding: 0.45rem 0.65rem;"
                    onclick="window.appRouter.startSinglePlayer('${c.id}')"
                  >
                    <span>▶️</span> Como Estudiante
                  </button>
                  <button 
                    class="btn btn-primary" 
                    title="Crear sala con preguntas proyectadas (Estilo Kahoot)"
                    style="flex: 1; min-width: 120px; font-size: 0.82rem; font-weight: 800; padding: 0.45rem 0.65rem;"
                    onclick="window.appRouter.hostRoom('${c.id}', 'presented')"
                  >
                    <span>📽️</span> Presentar
                  </button>
                  <button 
                    class="btn btn-cyan" 
                    title="Crear sala normal (preguntas en los celulares de los alumnos)"
                    style="flex: 1; min-width: 120px; font-size: 0.82rem; font-weight: 800; padding: 0.45rem 0.65rem;"
                    onclick="window.appRouter.hostRoom('${c.id}', 'normal')"
                  >
                    <span>🎮</span> Sala Normal
                  </button>
                  ${isMyQuiz ? `
                    <button 
                      class="btn btn-outline" 
                      title="Editar cuestionario"
                      style="padding: 0.45rem 0.65rem; font-size: 0.85rem;"
                      onclick="window.appRouter.navigate('creator', { editId: '${c.id}' })"
                    >
                      ✏️
                    </button>
                  ` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- SECCIÓN 2: GRUPOS Y CURSOS REGISTRADOS -->
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

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                  <button class="btn btn-primary" onclick="window.TeacherView.openLaunchModalForGroup('${grp.id}')">
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

      <!-- Modal de Selección de Cuestionario para Grupo -->
      <div id="teacher-launch-modal" class="custom-modal" style="display: none; position: fixed; inset: 0; background: rgba(3, 7, 18, 0.94); z-index: 9999; align-items: center; justify-content: center; padding: 1.5rem;">
        <div class="glass-panel" style="max-width: 520px; width: 100%; padding: 2rem; border-color: var(--neon-cyan); box-shadow: 0 20px 50px rgba(0,0,0,0.8);">
          <h2 style="font-size: 1.4rem; font-weight: 900; margin-bottom: 0.4rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🚀</span> Iniciar Reto con Grupo
          </h2>
          <p id="teacher-modal-group-name" style="color: var(--neon-cyan); font-weight: 800; font-size: 0.95rem; margin-bottom: 1.5rem;"></p>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-weight: 800; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
              EVALUACIÓN O QUIZ A LANZAR:
            </label>
            <select id="teacher-modal-challenge-select" style="width: 100%; padding: 0.75rem; border-radius: 10px; background: rgba(10,20,45,0.85); border: 1.5px solid var(--neon-cyan); color: #ffffff; font-weight: 700; outline: none;">
              ${challenges.map(c => `
                <option value="${c.id}">${c.title} (${c.questions?.length || 0} preguntas)</option>
              `).join('')}
            </select>
          </div>

          <div style="margin-bottom: 1.75rem;">
            <label style="display: block; font-weight: 800; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.45rem;">
              TIPO DE SALA:
            </label>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem;">
              <button 
                type="button" 
                id="teacher-type-btn-presented"
                class="btn btn-primary" 
                style="padding: 0.75rem; font-size: 0.88rem; font-weight: 800; text-align: center; border-radius: 10px;"
                onclick="window.TeacherView.selectModalRoomType('presented')"
              >
                📽️ Preguntas Presentadas
              </button>
              <button 
                type="button" 
                id="teacher-type-btn-normal"
                class="btn btn-outline" 
                style="padding: 0.75rem; font-size: 0.88rem; font-weight: 800; text-align: center; border-radius: 10px;"
                onclick="window.TeacherView.selectModalRoomType('normal')"
              >
                🎮 Sala Normal
              </button>
            </div>
            <p id="teacher-modal-type-desc" style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">
              Proyecta las preguntas en pantalla gigante y los alumnos responden en sus teléfonos.
            </p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.TeacherView.closeLaunchModal()">
              Cancelar
            </button>
            <button class="btn btn-primary" onclick="window.TeacherView.confirmLaunchForGroup()">
              <span>🚀</span> Abrir Sala Ahora
            </button>
          </div>
        </div>
      </div>
    `;
  },

  modalRoomType: 'presented',

  openLaunchModalForGroup(groupId) {
    const group = (window.appState.groups || []).find(g => g.id === groupId);
    if (!group) return;
    this.selectedGroupIdForLaunch = groupId;
    this.modalRoomType = 'presented';

    const modal = document.getElementById('teacher-launch-modal');
    const groupLabel = document.getElementById('teacher-modal-group-name');
    if (groupLabel) groupLabel.textContent = `Grupo: ${group.name} (${group.studentsCount} alumnos)`;
    this.selectModalRoomType('presented');

    if (modal) modal.style.display = 'flex';
  },

  selectModalRoomType(type) {
    this.modalRoomType = type;
    const btnPres = document.getElementById('teacher-type-btn-presented');
    const btnNorm = document.getElementById('teacher-type-btn-normal');
    const desc = document.getElementById('teacher-modal-type-desc');

    if (type === 'presented') {
      if (btnPres) { btnPres.className = 'btn btn-primary'; }
      if (btnNorm) { btnNorm.className = 'btn btn-outline'; }
      if (desc) desc.textContent = '📽️ Preguntas en pantalla grande (Estilo Kahoot / Proyector) y respuestas en dispositivos de los alumnos.';
    } else {
      if (btnPres) { btnPres.className = 'btn btn-outline'; }
      if (btnNorm) { btnNorm.className = 'btn btn-cyan'; }
      if (desc) desc.textContent = '🎮 Preguntas y respuestas directamente en el celular o PC de cada estudiante.';
    }
  },

  closeLaunchModal() {
    const modal = document.getElementById('teacher-launch-modal');
    if (modal) modal.style.display = 'none';
  },

  confirmLaunchForGroup() {
    const select = document.getElementById('teacher-modal-challenge-select');
    const challengeId = select ? select.value : null;
    const challenges = window.appState.challenges || [];
    const challenge = challenges.find(c => c.id === challengeId) || challenges[0];
    const groupId = this.selectedGroupIdForLaunch;

    if (!challenge) {
      alert('⚠️ Por favor selecciona un cuestionario válido.');
      return;
    }

    this.closeLaunchModal();

    // Abrir el configurador de acceso con los parámetros correctos:
    // (challenge, gameMode, modeConfig, roomType, preselectedGroupId)
    window.LobbyView.openCreateRoomRosterModal(
      challenge,
      'clasico',
      {},
      this.modalRoomType || 'presented',
      groupId
    );
  },

  launchGroupChallenge(groupId) {
    this.openLaunchModalForGroup(groupId);
  },

  newGroupModal() {
    const name = prompt('Nombre del nuevo curso o grupo (Ej: GRADO 8C - INFORMÁTICA):');
    if (!name) return;
    const count = parseInt(prompt('Cantidad aproximada de estudiantes:', '30')) || 30;

    const newGroup = {
      id: 'group_' + Date.now(),
      name: name.toUpperCase(),
      studentsCount: count,
      teacherId: window.appState.currentUser?.id || 'teacher_1',
      avgScore: 80,
      students: [
        { name: 'Estudiante Ejemplo 1', email: 'estudiante1@colegio.edu.co', points: 4200, played: 3, avatar: '🦊' },
        { name: 'Estudiante Ejemplo 2', email: 'estudiante2@colegio.edu.co', points: 3800, played: 3, avatar: '🐯' }
      ]
    };

    window.appState.groups.push(newGroup);
    saveGlobalState(window.appState);
    this.render();
    alert('✅ Grupo creado correctamente.');
  }
};
