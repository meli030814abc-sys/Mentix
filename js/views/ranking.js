/**
 * 🔥 TE RETO - Clasificación Global (Global Leaderboard)
 * Ranking general con filtros por tiempo (Semana, Mes, Todos los tiempos) y ámbito (Global, País, Curso).
 */

window.RankingView = {
  scope: 'global',
  timeframe: 'all',

  render() {
    const container = document.getElementById('view-ranking');
    if (!container) return;

    const users = [...window.appState.users].sort((a, b) => (b.xp || 0) - (a.xp || 0));

    // Agregar competidores simulados para enriquecer el ranking
    const mockRankings = [
      { name: 'Andrea Valderrama', xp: 12850, level: 6, levelName: 'Leyenda', avatar: '🦄', country: 'Colombia', institution: 'Colegio Bolivariano', wins: 38 },
      { name: 'Juan Sebastián Mora', xp: 11400, level: 5, levelName: 'Maestro', avatar: '🐯', country: 'México', institution: 'Inst. Tecnológico', wins: 29 },
      { name: 'María Camila Gómez', xp: 9950, level: 5, levelName: 'Maestro', avatar: '🐼', country: 'España', institution: 'Univ. Complutense', wins: 24 },
      { name: 'Santiago López', xp: 8200, level: 5, levelName: 'Maestro', avatar: '🦁', country: 'Colombia', institution: 'Colegio Bolivariano', wins: 19 },
      { name: 'Daniel Restrepo', xp: 7600, level: 5, levelName: 'Maestro', avatar: '🦅', country: 'Argentina', institution: 'Nacional Buenos Aires', wins: 18 },
      { name: 'Valentina Díaz', xp: 5800, level: 4, levelName: 'Experto', avatar: '🐰', country: 'Chile', institution: 'Liceo 1', wins: 14 }
    ];

    // Combinar con usuarios reales
    const allRanked = [
      ...users.map(u => ({
        name: u.name,
        xp: u.xp,
        level: u.level,
        levelName: u.levelName,
        avatar: u.avatar,
        country: u.country || 'Global',
        institution: u.institution || 'Comunidad MENTIX',
        wins: u.victories || 0
      })),
      ...mockRankings
    ].sort((a, b) => b.xp - a.xp);

    const top1 = allRanked[0];
    const top2 = allRanked[1];
    const top3 = allRanked[2];

    container.innerHTML = `
      <div style="max-width: 950px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 2.5rem;">
          <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 183, 3, 0.15); border: 1px solid var(--neon-gold); padding: 0.35rem 1rem; border-radius: 9999px; margin-bottom: 0.75rem;">
            <span>👑</span>
            <span style="font-weight: 800; font-size: 0.85rem; color: var(--neon-gold); text-transform: uppercase;">Salón de la Fama</span>
          </div>

          <h1 style="font-size: clamp(2rem, 5vw, 3rem); margin-bottom: 0.5rem;">
            <span class="gradient-title">🏆 Clasificación General</span>
          </h1>
          <p style="color: var(--text-secondary); max-width: 550px; margin: 0 auto;">
            Los mejores retadores del mundo compitiendo por el primer lugar de la temporada.
          </p>
        </div>

        <!-- Filtros de Ámbito y Tiempo -->
        <div class="glass-panel" style="padding: 1rem 1.5rem; margin-bottom: 2.5rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem;">
          
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <button 
              class="btn ${this.scope === 'global' ? 'btn-cyan' : 'btn-outline'}" 
              style="padding: 0.4rem 0.9rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('scope', 'global')">
              🌎 Global
            </button>
            <button 
              class="btn ${this.scope === 'country' ? 'btn-cyan' : 'btn-outline'}" 
              style="padding: 0.4rem 0.9rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('scope', 'country')">
              🇨🇴 Por País
            </button>
            <button 
              class="btn ${this.scope === 'institution' ? 'btn-cyan' : 'btn-outline'}" 
              style="padding: 0.4rem 0.9rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('scope', 'institution')">
              🏛️ Institución
            </button>
            <button 
              class="btn ${this.scope === 'course' ? 'btn-cyan' : 'btn-outline'}" 
              style="padding: 0.4rem 0.9rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('scope', 'course')">
              👥 Curso / Grado
            </button>
          </div>

          <div style="display: flex; gap: 0.5rem;">
            <button 
              class="btn ${this.timeframe === 'week' ? 'btn-gold' : 'btn-outline'}" 
              style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('timeframe', 'week')">
              Semana
            </button>
            <button 
              class="btn ${this.timeframe === 'month' ? 'btn-gold' : 'btn-outline'}" 
              style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('timeframe', 'month')">
              Mes
            </button>
            <button 
              class="btn ${this.timeframe === 'all' ? 'btn-gold' : 'btn-outline'}" 
              style="padding: 0.4rem 0.85rem; font-size: 0.85rem;"
              onclick="window.RankingView.setFilter('timeframe', 'all')">
              Histórico
            </button>
          </div>
        </div>

        <!-- Podio Top 3 Destacado -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 2.5rem;">
          
          <!-- Top 2 -->
          ${top2 ? `
            <div class="glass-panel" style="padding: 1.75rem; text-align: center; border-color: #e0e6ed;">
              <div style="font-size: 2rem; margin-bottom: 0.25rem;">🥈</div>
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${top2.avatar}</div>
              <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${top2.name}</h3>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${top2.institution}</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary);">${top2.xp.toLocaleString()} <span style="font-size:0.85rem; color:var(--text-muted);">XP</span></div>
              <span class="badge-tag" style="background: rgba(255,255,255,0.1); margin-top: 0.5rem; display: inline-block;">Nivel ${top2.level} ${top2.levelName}</span>
            </div>
          ` : ''}

          <!-- Top 1 (Líder Supremo) -->
          <div class="glass-panel" style="padding: 2rem; text-align: center; border-color: #ffd700; box-shadow: 0 0 35px rgba(255, 215, 0, 0.25); transform: translateY(-8px);">
            <div style="font-size: 2.5rem; margin-bottom: 0.25rem; animation: float-crown 2s infinite;">👑</div>
            <div style="font-size: 3.2rem; margin-bottom: 0.5rem;">${top1.avatar}</div>
            <h3 style="font-size: 1.35rem; margin-bottom: 0.25rem; color: #ffd700;">${top1.name}</h3>
            <div style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${top1.institution}</div>
            <div style="font-size: 1.7rem; font-weight: 900; color: #ffd700;">${top1.xp.toLocaleString()} <span style="font-size:0.9rem; color:var(--text-muted);">XP</span></div>
            <span class="badge-tag" style="background: rgba(255,215,0,0.2); color: #ffd700; border: 1px solid #ffd700; margin-top: 0.5rem; display: inline-block;">
              Nivel ${top1.level} ${top1.levelName}
            </span>
          </div>

          <!-- Top 3 -->
          ${top3 ? `
            <div class="glass-panel" style="padding: 1.75rem; text-align: center; border-color: #cd7f32;">
              <div style="font-size: 2rem; margin-bottom: 0.25rem;">🥉</div>
              <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">${top3.avatar}</div>
              <h3 style="font-size: 1.2rem; margin-bottom: 0.25rem;">${top3.name}</h3>
              <div style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 0.75rem;">${top3.institution}</div>
              <div style="font-size: 1.4rem; font-weight: 900; color: var(--text-primary);">${top3.xp.toLocaleString()} <span style="font-size:0.85rem; color:var(--text-muted);">XP</span></div>
              <span class="badge-tag" style="background: rgba(255,255,255,0.1); margin-top: 0.5rem; display: inline-block;">Nivel ${top3.level} ${top3.levelName}</span>
            </div>
          ` : ''}
        </div>

        <!-- Tabla Completa de Clasificación -->
        <div class="glass-panel" style="padding: 1.5rem;">
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                  <th style="padding: 0.75rem 0.5rem;">#</th>
                  <th style="padding: 0.75rem;">Jugador</th>
                  <th style="padding: 0.75rem;">Institución / País</th>
                  <th style="padding: 0.75rem;">Rango</th>
                  <th style="padding: 0.75rem; text-align: right;">Experiencia XP</th>
                </tr>
              </thead>
              <tbody>
                ${allRanked.map((p, idx) => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
                    <td style="padding: 0.85rem 0.5rem; font-weight: 900; font-size: 1.1rem; color: ${idx === 0 ? '#ffd700' : idx === 1 ? '#e0e6ed' : idx === 2 ? '#cd7f32' : 'var(--text-muted)'};">
                      ${idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : idx + 1}
                    </td>
                    <td style="padding: 0.85rem; font-weight: 700;">
                      <span style="font-size: 1.3rem; margin-right: 0.4rem;">${p.avatar}</span>
                      ${p.name}
                    </td>
                    <td style="padding: 0.85rem; color: var(--text-secondary); font-size: 0.88rem;">
                      ${p.institution} • ${p.country}
                    </td>
                    <td style="padding: 0.85rem;">
                      <span class="badge-tag" style="background: rgba(0,245,212,0.1); color: var(--neon-cyan); font-size: 0.75rem;">
                        ${p.levelName}
                      </span>
                    </td>
                    <td style="padding: 0.85rem; font-weight: 900; color: var(--neon-gold); text-align: right; font-size: 1.1rem;">
                      ${p.xp.toLocaleString()} XP
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

  setFilter(type, value) {
    if (type === 'scope') this.scope = value;
    if (type === 'timeframe') this.timeframe = value;
    this.render();
  }
};
