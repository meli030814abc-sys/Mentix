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

        <!-- Panel Exclusivo Administrador: Personalización de Interfaces (Fondos, Colores y Textos) -->
        <div class="glass-panel" style="padding: 1.75rem; margin-bottom: 2.5rem; border: 1.5px solid var(--neon-cyan);">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <span class="badge-tag" style="background: rgba(0,245,212,0.15); color: var(--neon-cyan); border: 1px solid var(--neon-cyan); font-weight: 800; font-size: 0.78rem;">
                👑 EXCLUSIVO ADMINISTRADOR
              </span>
              <h2 style="font-size: 1.35rem; margin: 0.35rem 0 0; display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary);">
                <span>🎨</span> Personalización de Interfaces (Fondos, Textos y Colores en Móvil y PC)
              </h2>
              <p style="color: var(--text-secondary); font-size: 0.88rem; margin: 0.25rem 0 0;">
                Configura la apariencia visual de la plataforma. Esta personalización solo está disponible para el Administrador.
              </p>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <button type="button" class="btn btn-outline" style="font-size: 0.85rem;" onclick="window.AdminView.resetDesignDefaults()">
                <span>🔄</span> Restablecer Predeterminado
              </button>
              <button type="button" class="btn btn-cyan" style="font-size: 0.85rem; font-weight: 800;" onclick="window.AdminView.saveDesignSettings()">
                <span>💾</span> Guardar y Aplicar
              </button>
            </div>
          </div>

          <!-- Selección de Fondo de la Página -->
          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-weight: 800; font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 0.5rem;">
              🖼️ FONDO DE LA PÁGINA:
            </label>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 0.6rem;" id="admin-theme-grid">
              ${this.renderThemeCards()}
            </div>
          </div>

          <!-- Selección de Color de Acento y Textos -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem; background: rgba(0,0,0,0.25); border-radius: 12px; padding: 1.25rem; border: 1px solid var(--border-color);">
            <div>
              <label style="display: block; font-weight: 800; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.6rem;">
                ✨ COLOR DE ACENTO Y NEÓN:
              </label>
              <div style="display: flex; gap: 0.65rem; flex-wrap: wrap;" id="admin-accent-dots">
                ${this.renderAccentDots()}
              </div>
            </div>

            <div>
              <label style="display: block; font-weight: 800; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
                🔤 TAMAÑO DE TEXTO (MÓVIL Y PC):
              </label>
              <select id="admin-fontsize-select" style="width: 100%; padding: 0.55rem; border-radius: 8px; background: #0b0f19; color: white; border: 1px solid var(--border-color); font-weight: 700;">
                <option value="normal" ${(this.selectedDesign || this.getSavedDesign()).fontSize === 'normal' ? 'selected' : ''}>Estándar (100%)</option>
                <option value="small" ${(this.selectedDesign || this.getSavedDesign()).fontSize === 'small' ? 'selected' : ''}>Compacto (90%)</option>
                <option value="large" ${(this.selectedDesign || this.getSavedDesign()).fontSize === 'large' ? 'selected' : ''}>Grande (+15%)</option>
                <option value="xlarge" ${(this.selectedDesign || this.getSavedDesign()).fontSize === 'xlarge' ? 'selected' : ''}>Muy Grande (+25% Proyector)</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-weight: 800; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.35rem;">
                👁️ CONTRASTE DE TEXTOS:
              </label>
              <select id="admin-contrast-select" style="width: 100%; padding: 0.55rem; border-radius: 8px; background: #0b0f19; color: white; border: 1px solid var(--border-color); font-weight: 700;">
                <option value="normal" ${(this.selectedDesign || this.getSavedDesign()).contrast === 'normal' ? 'selected' : ''}>Estándar Suave</option>
                <option value="high" ${(this.selectedDesign || this.getSavedDesign()).contrast === 'high' ? 'selected' : ''}>Alto Contraste (Ultra Nítido)</option>
              </select>
            </div>
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
  },

  getSavedDesign() {
    try {
      const saved = localStorage.getItem('mentix_admin_design');
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      bgTheme: 'mentix_official',
      accentColor: 'cyan',
      fontSize: 'normal',
      contrast: 'normal'
    };
  },

  renderThemeCards() {
    const current = this.selectedDesign || this.getSavedDesign();
    const themes = [
      { id: 'mentix_official', icon: '🌌', name: 'Mentix Oficial', desc: 'Espacial Original' },
      { id: 'cyberpunk', icon: '⚡', name: 'Cyberpunk', desc: 'Neón Púrpura/Rosa' },
      { id: 'galaxy', icon: '🪐', name: 'Galaxia', desc: 'Cosmos Violeta/Azul' },
      { id: 'matrix', icon: '💻', name: 'Matrix Tech', desc: 'Cian y Verde Código' },
      { id: 'ocean', icon: '🌊', name: 'Océano', desc: 'Azul Marino Sereno' },
      { id: 'sunset', icon: '🔥', name: 'Atardecer', desc: 'Ámbar y Fuego Rubí' },
      { id: 'amoled', icon: '🖤', name: 'AMOLED Puro', desc: 'Negro 100% Contraste' },
      { id: 'grid', icon: '📐', name: 'Retícula', desc: 'Cuadrícula Arcade' },
      { id: 'light', icon: '☀️', name: 'Estudio Claro', desc: 'Luminoso para Aulas' }
    ];

    return themes.map(t => {
      const active = (current.bgTheme === t.id);
      return `
        <div 
          onclick="window.AdminView.selectTheme('${t.id}')"
          style="border: 2px solid ${active ? 'var(--neon-cyan)' : 'var(--border-color)'}; background: ${active ? 'rgba(0, 245, 212, 0.15)' : 'rgba(15, 23, 42, 0.65)'}; border-radius: 12px; padding: 0.65rem; text-align: center; cursor: pointer; transition: all 0.2s;"
        >
          <div style="font-size: 1.5rem; margin-bottom: 0.2rem;">${t.icon}</div>
          <div style="font-weight: 800; font-size: 0.82rem; color: var(--text-primary);">${t.name}</div>
          <div style="font-size: 0.68rem; color: var(--text-secondary);">${t.desc}</div>
        </div>
      `;
    }).join('');
  },

  renderAccentDots() {
    const current = this.selectedDesign || this.getSavedDesign();
    const accents = [
      { id: 'cyan', color: '#00f5d4', name: 'Cian' },
      { id: 'magenta', color: '#f72585', name: 'Magenta' },
      { id: 'gold', color: '#ffb703', name: 'Oro' },
      { id: 'emerald', color: '#06d6a0', name: 'Esmeralda' },
      { id: 'purple', color: '#a855f7', name: 'Violeta' },
      { id: 'blue', color: '#3b82f6', name: 'Azul' },
      { id: 'orange', color: '#fb5607', name: 'Naranja' }
    ];

    return accents.map(a => {
      const active = (current.accentColor === a.id);
      return `
        <button 
          type="button"
          onclick="window.AdminView.selectAccent('${a.id}')"
          title="${a.name}"
          style="width: 36px; height: 36px; border-radius: 50%; background: ${a.color}; border: 3px solid ${active ? '#ffffff' : 'rgba(255,255,255,0.2)'}; transform: ${active ? 'scale(1.15)' : 'scale(1)'}; cursor: pointer; box-shadow: ${active ? `0 0 12px ${a.color}` : 'none'}; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 900; color: #0b0f19;"
        >${active ? '✓' : ''}</button>
      `;
    }).join('');
  },

  selectTheme(themeId) {
    if (!this.selectedDesign) this.selectedDesign = this.getSavedDesign();
    this.selectedDesign.bgTheme = themeId;
    const grid = document.getElementById('admin-theme-grid');
    if (grid) grid.innerHTML = this.renderThemeCards();
  },

  selectAccent(accentId) {
    if (!this.selectedDesign) this.selectedDesign = this.getSavedDesign();
    this.selectedDesign.accentColor = accentId;
    const dots = document.getElementById('admin-accent-dots');
    if (dots) dots.innerHTML = this.renderAccentDots();
  },

  saveDesignSettings() {
    if (!this.selectedDesign) this.selectedDesign = this.getSavedDesign();
    const sizeSelect = document.getElementById('admin-fontsize-select');
    const contrastSelect = document.getElementById('admin-contrast-select');

    if (sizeSelect) this.selectedDesign.fontSize = sizeSelect.value;
    if (contrastSelect) this.selectedDesign.contrast = contrastSelect.value;

    try {
      localStorage.setItem('mentix_admin_design', JSON.stringify(this.selectedDesign));
    } catch(e) {}

    this.applySavedDesign();
    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }
    alert('🎉 ¡Diseño de interfaz personalizado y aplicado con éxito por el Administrador!');
    this.render();
  },

  resetDesignDefaults() {
    try {
      localStorage.removeItem('mentix_admin_design');
    } catch(e) {}
    this.selectedDesign = null;
    this.applySavedDesign();
    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }
    alert('🔄 Diseño de interfaz restablecido al modo predeterminado de Mentix.');
    this.render();
  },

  applySavedDesign() {
    try {
      const saved = localStorage.getItem('mentix_admin_design');
      if (!saved) {
        document.body.style.background = '';
        document.body.style.backgroundAttachment = '';
        document.documentElement.style.removeProperty('--neon-cyan');
        document.documentElement.style.removeProperty('--border-glow');
        document.documentElement.style.removeProperty('--text-primary');
        document.documentElement.style.removeProperty('--text-secondary');
        document.documentElement.style.fontSize = '';
        return;
      }
      const s = JSON.parse(saved);

      // Fondos
      if (s.bgTheme === 'cyberpunk') {
        document.body.style.background = 'radial-gradient(circle at 15% 25%, rgba(114, 9, 183, 0.55) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(247, 37, 133, 0.45) 0%, transparent 55%), linear-gradient(180deg, #070913 0%, #110d24 50%, #080314 100%)';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'galaxy') {
        document.body.style.background = 'radial-gradient(circle at 20% 15%, rgba(67, 97, 238, 0.45) 0%, transparent 50%), radial-gradient(circle at 80% 85%, rgba(114, 9, 183, 0.5) 0%, transparent 60%), linear-gradient(135deg, #02020a 0%, #0b0726 50%, #030114 100%)';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'matrix') {
        document.body.style.background = 'radial-gradient(circle at 50% 20%, rgba(6, 214, 160, 0.28) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(0, 245, 212, 0.22) 0%, transparent 50%), linear-gradient(180deg, #030d0a 0%, #061814 50%, #020807 100%)';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'ocean') {
        document.body.style.background = 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.4) 0%, transparent 55%), radial-gradient(circle at 80% 70%, rgba(14, 165, 233, 0.3) 0%, transparent 50%), linear-gradient(180deg, #040d1a 0%, #081e36 50%, #020710 100%)';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'sunset') {
        document.body.style.background = 'radial-gradient(circle at 10% 20%, rgba(251, 86, 7, 0.45) 0%, transparent 55%), radial-gradient(circle at 90% 80%, rgba(247, 37, 133, 0.4) 0%, transparent 50%), linear-gradient(180deg, #180908 0%, #290e18 50%, #0d0407 100%)';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'amoled') {
        document.body.style.background = '#000000';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'grid') {
        document.body.style.backgroundColor = '#0b0f19';
        document.body.style.backgroundImage = 'linear-gradient(rgba(0, 245, 212, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 245, 212, 0.08) 1px, transparent 1px), radial-gradient(circle at center, rgba(114, 9, 183, 0.25) 0%, transparent 70%)';
        document.body.style.backgroundSize = '32px 32px, 32px 32px, 100% 100%';
        document.body.style.backgroundAttachment = 'fixed';
      } else if (s.bgTheme === 'light') {
        document.body.classList.add('light-theme');
      } else {
        document.body.style.background = '';
        document.body.style.backgroundAttachment = '';
      }

      // Colores de acento
      const colors = {
        cyan: '#00f5d4',
        magenta: '#f72585',
        gold: '#ffb703',
        emerald: '#06d6a0',
        purple: '#a855f7',
        blue: '#3b82f6',
        orange: '#fb5607'
      };
      if (s.accentColor && colors[s.accentColor]) {
        const hex = colors[s.accentColor];
        document.documentElement.style.setProperty('--neon-cyan', hex);
        document.documentElement.style.setProperty('--border-glow', hex + '55');
      }

      // Tamaño de fuentes
      if (s.fontSize === 'small') document.documentElement.style.fontSize = '14.5px';
      else if (s.fontSize === 'large') document.documentElement.style.fontSize = '17px';
      else if (s.fontSize === 'xlarge') document.documentElement.style.fontSize = '18.5px';
      else document.documentElement.style.fontSize = '';

      // Contraste
      if (s.contrast === 'high') {
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#f1f5f9');
      } else {
        document.documentElement.style.removeProperty('--text-primary');
        document.documentElement.style.removeProperty('--text-secondary');
      }
    } catch(e) {}
  }
};
