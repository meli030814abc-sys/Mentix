/**
 * 🔥 TE RETO - Tabla de Clasificación Dinámica (Leaderboard)
 * Muestra el ranking animado entre preguntas con rachas de fuego y cambios de posición.
 */

window.LeaderboardView = {
  waitingPollInterval: null,
  activePin: null,

  render(room, isHost = true) {
    const container = document.getElementById('view-leaderboard');
    if (!container) return;

    if (this.waitingPollInterval) {
      clearInterval(this.waitingPollInterval);
      this.waitingPollInterval = null;
    }

    this.activePin = room?.pin;
    window.soundEngine.playFanfare();

    if (room && window.GameView) {
      window.GameView.room = room;
    }

    // Ordenar jugadores por puntaje descendente
    const sortedPlayers = [...(room?.players || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
    const currentQIdx = (window.GameView && window.GameView.currentQuestionIndex !== undefined) ? window.GameView.currentQuestionIndex : (room?.currentQuestionIndex || 0);
    const totalQ = room?.challenge?.questions?.length || 0;

    container.innerHTML = `
      <div style="max-width: 750px; margin: 0 auto; padding: 2rem 1.25rem 4rem;">
        <div style="text-align: center; margin-bottom: 2rem;">
          <span class="badge-tag tag-easy" style="margin-bottom: 0.5rem; display: inline-block;">MARCADOR EN VIVO</span>
          <h1 style="font-size: 2.2rem; display: flex; align-items: center; justify-content: center; gap: 0.6rem;">
            <span class="glow-text-gold">🏆</span> Tabla de Posiciones
          </h1>
          <p style="color: var(--text-secondary);">Pregunta ${currentQIdx + 1} de ${totalQ}</p>
        </div>

        <!-- Lista de Posiciones -->
        <div style="display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 2.5rem;">
          ${sortedPlayers.map((p, idx) => {
            let rankIcon = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
            let bgGlow = idx === 0 
              ? 'border-color: #ffd700; background: linear-gradient(90deg, rgba(255, 215, 0, 0.15), rgba(23, 32, 54, 0.85));'
              : idx === 1 
              ? 'border-color: #e0e6ed; background: linear-gradient(90deg, rgba(224, 230, 237, 0.12), rgba(23, 32, 54, 0.85));'
              : idx === 2 
              ? 'border-color: #cd7f32; background: linear-gradient(90deg, rgba(205, 127, 50, 0.12), rgba(23, 32, 54, 0.85));'
              : 'border-color: var(--border-color); background: var(--bg-card);';

            return `
              <div class="glass-panel" style="${bgGlow} padding: 1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; border-radius: var(--border-radius-md); transition: var(--transition-bounce);">
                <div style="display: flex; align-items: center; gap: 0.85rem; overflow: hidden;">
                  <span style="font-size: 1.5rem; font-weight: 900; width: 36px; text-align: center;">${rankIcon}</span>
                  <span style="font-size: 1.8rem;">${p.avatar || '😎'}</span>
                  <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    <div style="font-weight: 800; font-size: 1.1rem; color: var(--text-primary);">${p.nickname}</div>
                    <div style="font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                      ${p.streak > 1 ? `<span style="color:#ff9e00; font-weight:700;">🔥 ${p.streak} en racha</span>` : ''}
                      <span>${p.correctCount || 0} aciertos</span>
                      ${isHost && window.PodiumView?.failuresLink ? `<span style="margin-left: 0.25rem;">· ${window.PodiumView.failuresLink(p, room, currentQIdx + 1)}</span>` : ''}
                    </div>
                  </div>
                </div>

                <div style="text-align: right; flex-shrink: 0;">
                  <div style="font-size: 1.4rem; font-weight: 900; color: var(--neon-cyan); letter-spacing: 0.5px;">
                    ${(p.score || 0).toLocaleString()} <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">pts</span>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Botón de siguiente pregunta (Solo para anfitrión) o estado de espera para alumno -->
        ${isHost ? `
          <div style="text-align: center;">
            <button class="btn btn-primary btn-lg" onclick="window.LeaderboardView.continueToNext()">
              <span>Siguiente Pregunta</span> ⏩
            </button>
          </div>
        ` : `
          <div style="text-align: center; color: var(--text-secondary); font-weight: 600; padding: 1rem; background: rgba(0,0,0,0.25); border-radius: 12px; border: 1px dashed rgba(255,255,255,0.15);">
            <div style="font-size: 1.8rem; margin-bottom: 0.4rem; animation: timer-pulse 1.2s infinite alternate;">⏳</div>
            <div style="font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.25rem;">Esperando a que el anfitrión avance a la siguiente pregunta...</div>
            <div style="font-size: 0.85rem; color: var(--text-muted);">La pantalla cambiará automáticamente a los botones de colores</div>
          </div>
        `}
      </div>
    `;

    if (!isHost) {
      this.startWaitingNextQuestionPoll(room);
    }
  },

  startWaitingNextQuestionPoll(room) {
    if (this.waitingPollInterval) clearInterval(this.waitingPollInterval);
    const pin = room?.pin || window.realtimeEngine.currentRoom?.pin;
    if (!pin) return;

    this.waitingPollInterval = setInterval(() => {
      // Si la vista actual ya no es leaderboard, cancelar poll
      const lbView = document.getElementById('view-leaderboard');
      if (!lbView || !lbView.classList.contains('active')) {
        clearInterval(this.waitingPollInterval);
        this.waitingPollInterval = null;
        return;
      }

      const stored = localStorage.getItem(`te_reto_room_${pin}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const currentIdx = window.GameView?.currentQuestionIndex || 0;
          if (parsed.status === 'question' && parsed.currentQuestionIndex !== undefined && parsed.currentQuestionIndex !== currentIdx) {
            clearInterval(this.waitingPollInterval);
            this.waitingPollInterval = null;
            window.GameView.room = parsed;
            window.GameView.currentQuestionIndex = parsed.currentQuestionIndex;
            window.appRouter.navigate('game');
            window.GameView.renderQuestionScreen();
          } else if (parsed.status === 'podium') {
            clearInterval(this.waitingPollInterval);
            this.waitingPollInterval = null;
            window.appRouter.showPodium(parsed);
          }
        } catch (e) {}
      }
    }, 250);
  },

  continueToNext() {
    if (this.waitingPollInterval) {
      clearInterval(this.waitingPollInterval);
      this.waitingPollInterval = null;
    }
    window.appRouter.navigate('game');
    window.GameView.nextQuestion();
  }
};
