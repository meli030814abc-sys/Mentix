/**
 * 🔥 TE RETO - Panel de Administración General
 * Gestión de usuarios, moderación de retos, categorías y auditoría del sistema.
 */

window.AdminView = {
  render() {
    const container = document.getElementById('view-admin');
    if (!container) return;

    const users = window.appState.users;
    const challenges = window.appState.challenges;
    const categories = window.appState.categories;

    container.innerHTML = `
      <div style="max-width: 1050px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header Admin -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <span class="badge-tag tag-hard" style="margin-bottom: 0.5rem; display: inline-block;">CONTROL TOTAL</span>
            <h1 style="font-size: 2.2rem; display: flex; align-items: center; gap: 0.6rem;">
              <span>🛡️</span> Consola de Administración
            </h1>
            <p style="color: var(--text-secondary);">Supervisión de seguridad, moderación de contenido y administración global.</p>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.AdminView.exportFullDatabase()">
              <span>💾</span> Copia de Seguridad JSON
            </button>
            <button class="btn btn-danger" onclick="window.AdminView.resetFactoryData()">
              <span>⚠️</span> Restaurar Fábrica
            </button>
          </div>
        </div>

        <!-- Métricas del Servidor / Plataforma -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">USUARIOS TOTALES</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary);">${users.length}</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">RETOS ACTIVOS</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-cyan);">${challenges.length}</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">CATEGORÍAS</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-gold);">${categories.length}</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.82rem; color: var(--text-muted); font-weight: 700;">REPORTES PENDIENTES</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-emerald);">0 (Limpio)</div>
          </div>
        </div>

        <!-- Tabla: Gestión de Usuarios -->
        <div class="glass-panel" style="padding: 1.75rem; margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.3rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>👥</span> Gestión de Usuarios y Permisos
          </h2>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                  <th style="padding: 0.75rem;">Usuario</th>
                  <th style="padding: 0.75rem;">Email</th>
                  <th style="padding: 0.75rem;">Rol</th>
                  <th style="padding: 0.75rem;">Nivel / XP</th>
                  <th style="padding: 0.75rem;">Estado</th>
                  <th style="padding: 0.75rem; text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem; font-weight: 700;">
                      <span style="margin-right: 0.35rem;">${u.avatar}</span> ${u.name}
                    </td>
                    <td style="padding: 0.75rem; color: var(--text-secondary);">${u.email}</td>
                    <td style="padding: 0.75rem;">
                      <span class="badge-tag" style="background: rgba(0,245,212,0.15); color: var(--neon-cyan);">
                        ${u.role}
                      </span>
                    </td>
                    <td style="padding: 0.75rem; font-weight: 700;">Nivel ${u.level} (${u.xp} XP)</td>
                    <td style="padding: 0.75rem;">
                      <span style="color: ${u.status === 'blocked' ? '#ef4444' : '#06d6a0'}; font-weight: 700;">
                        ${u.status === 'blocked' ? '🚫 Bloqueado' : '🟢 Activo'}
                      </span>
                    </td>
                    <td style="padding: 0.75rem; text-align: right;">
                      <button class="btn btn-outline" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.AdminView.toggleUserBlock('${u.id}')">
                        ${u.status === 'blocked' ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Tabla: Moderación de Retos -->
        <div class="glass-panel" style="padding: 1.75rem;">
          <h2 style="font-size: 1.3rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>🎮</span> Moderación de Retos Publicados
          </h2>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                  <th style="padding: 0.75rem;">Título</th>
                  <th style="padding: 0.75rem;">Categoría</th>
                  <th style="padding: 0.75rem;">Preguntas</th>
                  <th style="padding: 0.75rem;">Autor</th>
                  <th style="padding: 0.75rem; text-align: right;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${challenges.map(c => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem; font-weight: 700;">${c.title}</td>
                    <td style="padding: 0.75rem; color: var(--neon-cyan);">${c.categoryName || c.category}</td>
                    <td style="padding: 0.75rem;">${c.questions?.length || 0}</td>
                    <td style="padding: 0.75rem; color: var(--text-secondary);">${c.author}</td>
                    <td style="padding: 0.75rem; text-align: right;">
                      <button class="btn btn-danger" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="window.AdminView.deleteChallenge('${c.id}')">
                        🗑️ Eliminar
                      </button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  },

  toggleUserBlock(userId) {
    const user = window.appState.users.find(u => u.id === userId);
    if (!user) return;
    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    saveGlobalState(window.appState);
    this.render();
    alert(`Estado de ${user.name} actualizado a: ${user.status}`);
  },

  deleteChallenge(challengeId) {
    if (confirm('¿Estás seguro de eliminar este reto definitivamente?')) {
      window.appState.challenges = window.appState.challenges.filter(c => c.id !== challengeId);
      saveGlobalState(window.appState);
      this.render();
      alert('Reto eliminado.');
    }
  },

  exportFullDatabase() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(window.appState, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `backup_te_reto_${Date.now()}.json`);
    dlAnchor.click();
    alert('📥 Base de datos exportada.');
  },

  resetFactoryData() {
    if (confirm('⚠️ ¿Restaurar todos los datos a la configuración inicial predeterminada?')) {
      localStorage.clear();
      window.location.reload();
    }
  }
};
