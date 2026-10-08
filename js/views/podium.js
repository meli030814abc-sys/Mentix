/**
 * 🔥 TE RETO - Podio y Celebración Final (Podium View)
 * Podio 3D, animación de confeti explosivo, estadísticas detalladas y exportación.
 */

window.PodiumView = {
  render(room) {
    const container = document.getElementById('view-podium');
    if (!container) return;

    window.soundEngine.playFanfare();
    this.launchConfetti();

    // Ordenar final
    // Asegurar y sincronizar jugadores
    const playersList = (room && room.players && room.players.length > 0)
      ? room.players 
      : (window.realtimeEngine?.currentRoom?.players || window.GameView?.room?.players || []);

    const totalQuestions = room?.challenge?.questions?.length || 1;

    // Calcular y garantizar aciertos y puntuaciones de cada jugador
    playersList.forEach(p => {
      let c = p.correctCount || 0;
      if (p.answers && Array.isArray(p.answers) && p.answers.length > 0) {
        const inAnswers = p.answers.filter(a => a.isCorrect).length;
        if (inAnswers > c) c = inAnswers;
      }
      p.correctCount = c;
      if ((!p.score || p.score === 0) && p.answers && Array.isArray(p.answers)) {
        p.score = p.answers.reduce((acc, a) => acc + (a.pointsEarned || 0), 0);
      }
    });

    // Ordenar final
    const sorted = [...playersList].sort((a, b) => (b.score || 0) - (a.score || 0));
    const first = sorted[0] || { nickname: 'Campeón', score: 0, avatar: '👑', correctCount: 0 };
    const second = sorted[1] || null;
    const third = sorted[2] || null;

    // Calcular estadísticas globales
    const totalCorrect = sorted.reduce((acc, p) => acc + (p.correctCount || 0), 0);
    const accuracyDivisor = sorted.length === 1 ? totalQuestions : (sorted.length * totalQuestions);
    const avgAccuracy = Math.min(100, Math.max(0, Math.round((totalCorrect / (accuracyDivisor || 1)) * 100)));
    const maxScore = first.score || 0;

    // Otorgar XP al usuario actual
    const isWinner = sorted[0]?.id === (window.realtimeEngine?.localPlayer?.id || 'solo_player');
    const xpEarned = isWinner ? 500 : 250;
    window.appRouter.addXP(xpEarned);

    if (isWinner) {
      window.appState.currentUser.victories = (window.appState.currentUser.victories || 0) + 1;
      window.appRouter.checkMedals('champion');
    }
    window.appState.currentUser.challengesPlayed = (window.appState.currentUser.challengesPlayed || 0) + 1;
    saveGlobalState(window.appState);

    container.innerHTML = `
      <div style="max-width: 900px; margin: 0 auto; padding: 2rem 1.25rem 5rem; text-align: center;">
        
        <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: rgba(255, 183, 3, 0.15); border: 1px solid var(--neon-gold); padding: 0.4rem 1.2rem; border-radius: 9999px; margin-bottom: 1rem;">
          <span>🎉</span>
          <span style="font-weight: 800; font-size: 0.9rem; color: var(--neon-gold); text-transform: uppercase;">¡Fin del Encuentro!</span>
        </div>

        <h1 style="font-size: clamp(2.4rem, 6vw, 3.8rem); line-height: 1.1; margin-bottom: 0.5rem;" class="glow-text-gold">
          🏆 ¡RETO COMPLETADO!
        </h1>
        <p style="color: var(--text-secondary); font-size: 1.15rem; max-width: 600px; margin: 0 auto 2.5rem;">
          ${room.challenge.title}
        </p>

        <!-- Podio 3D Espectacular -->
        <div class="podium-wrapper">
          <!-- 2do Lugar (Plata) -->
          ${second ? `
            <div class="podium-step second">
              <div class="avatar-podium" style="border-color: #e0e6ed;">
                ${second.avatar || '🥈'}
              </div>
              <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary); margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
                ${second.nickname}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">
                ${(second.score || 0).toLocaleString()} pts
              </div>
              <div class="podium-pillar">
                <span>2</span>
              </div>
            </div>
          ` : ''}

          <!-- 1er Lugar (Oro / Ganador) -->
          <div class="podium-step first">
            <div class="avatar-podium">
              <div class="crown-icon">👑</div>
              ${first.avatar || '🥇'}
            </div>
            <div style="font-weight: 900; font-size: 1.25rem; color: #ffd700; margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;">
              ${first.nickname}
            </div>
            <div style="font-size: 0.95rem; color: var(--text-primary); margin-bottom: 0.5rem; font-weight: 800;">
              ${(first.score || 0).toLocaleString()} pts
            </div>
            <div class="podium-pillar">
              <span>1</span>
            </div>
          </div>

          <!-- 3er Lugar (Bronce) -->
          ${third ? `
            <div class="podium-step third">
              <div class="avatar-podium" style="border-color: #cd7f32;">
                ${third.avatar || '🥉'}
              </div>
              <div style="font-weight: 800; font-size: 1rem; color: var(--text-primary); margin-bottom: 0.25rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px;">
                ${third.nickname}
              </div>
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 700;">
                ${(third.score || 0).toLocaleString()} pts
              </div>
              <div class="podium-pillar">
                <span>3</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Estadísticas Clave del Reto -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;">
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PREMISAS DE ACIERTO</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-cyan);">${avgAccuracy}%</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PUNTAJE MÁXIMO</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-gold);">${(maxScore || 0).toLocaleString()}</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">XP GANADA</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--neon-magenta);">+${xpEarned} XP</div>
          </div>
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700; margin-bottom: 0.25rem;">PARTICIPANTES</div>
            <div style="font-size: 1.8rem; font-weight: 900; color: var(--text-primary);">${playersList.length}</div>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 1rem; margin-bottom: 3rem;">
          <button class="btn btn-primary btn-lg" onclick="window.appRouter.restartSameChallenge()">
            <span>🔄</span> Jugar Nuevamente
          </button>
          <button class="btn btn-cyan btn-lg" onclick="window.appRouter.navigate('home')">
            <span>🏠</span> Volver al Inicio
          </button>
          <button class="btn btn-outline" onclick="window.PodiumView.exportResults(window.GameView.room)">
            <span>📊</span> Exportar Resultados
          </button>
          <button class="btn btn-outline" onclick="window.PodiumView.shareResults()">
            <span>📤</span> Compartir Victoria
          </button>
        </div>

        <!-- Tabla Completa de Calificaciones -->
        <div class="glass-panel" style="padding: 1.75rem; text-align: left;">
          <h2 style="font-size: 1.2rem; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>📋</span> Desglose Completo de Calificaciones
          </h2>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 0.95rem;">
              <thead>
                <tr style="border-bottom: 1px solid var(--border-color); color: var(--text-secondary); text-align: left;">
                  <th style="padding: 0.75rem 0.5rem;">#</th>
                  <th style="padding: 0.75rem;">Jugador</th>
                  <th style="padding: 0.75rem;">Puntos</th>
                  <th style="padding: 0.75rem;">Aciertos</th>
                  <th style="padding: 0.75rem;">Racha Máx</th>
                </tr>
              </thead>
              <tbody>
                ${sorted.map((p, i) => `
                  <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.75rem 0.5rem; font-weight: 800;">${i + 1}</td>
                    <td style="padding: 0.75rem; font-weight: 700;">
                      <span style="font-size: 1.2rem; margin-right: 0.35rem;">${p.avatar || '👤'}</span>
                      ${p.nickname}
                    </td>
                    <td style="padding: 0.75rem; font-weight: 800; color: var(--neon-cyan);">${(p.score || 0).toLocaleString()}</td>
                    <td style="padding: 0.75rem; color: var(--text-secondary);">${p.correctCount || 0} / ${totalQuestions}</td>
                    <td style="padding: 0.75rem; color: #ff9e00; font-weight: 700;">🔥 ${p.maxStreak || p.streak || 0}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;

    // Si terminó el quiz y aún no tiene cuenta o sesión guardada, pedirle registro/acceso para guardar su progreso
    if (!localStorage.getItem('te_reto_session') || window.appState.currentUser?.isGuest) {
      setTimeout(() => {
        window.appRouter.openAuthModal('register');
      }, 1500);
    }
  },

  launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#00f5d4', '#f72585', '#7209b7', '#ffb703', '#06d6a0', '#ffffff'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: 6 + Math.random() * 8,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: -2 + Math.random() * 4,
        speedY: 3 + Math.random() * 6,
        rotation: Math.random() * 360,
        rotationSpeed: -5 + Math.random() * 10
      });
    }

    let frames = 0;
    const maxFrames = 180;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });

      frames++;
      if (frames < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  },

  exportResults(room) {
    if (!room) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(room, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `resultados_mentix_${room.pin || 'partida'}.json`);
    dlAnchor.click();
    alert('📥 ¡Resultados exportados en formato JSON!');
  },

  shareResults() {
    const text = '¡Acabo de competir en 🧠 MENTIX! ¿Tienes lo necesario para superarme?';
    if (navigator.share) {
      navigator.share({
        title: 'MENTIX',
        text: text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`).then(() => {
        alert('📋 ¡Mensaje de victoria copiado al portapapeles!');
      });
    }
  }
};
