/**
 * 🔥 TE RETO - Catálogo de Modos de Juego y Experiencias de Aprendizaje
 * Arquitectura modular y extensible de 14 modos de juego con mecánicas,
 * ilustraciones vectoriales 3D estilo videojuego y overlays interactivos.
 */

window.GameModes = {
  // Registro de todos los modos de juego
  modes: [
    {
      id: 'clasico',
      name: 'Modo Clásico',
      shortName: 'Clásico',
      badge: '🏆 TRADICIONAL',
      icon: '🏆',
      themeColor: '#7928ca',
      accentColor: '#00f5d4',
      gradient: 'linear-gradient(135deg, #4c1d95 0%, #7c3aed 50%, #00f5d4 100%)',
      description: 'El formato competitivo tradicional. Todos los estudiantes compiten individualmente por acumular la mayor cantidad de puntos y alcanzar el podio.',
      config: {
        scoring: 'standard'
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-clasico" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e103a" />
                <stop offset="50%" stop-color="#4c1d95" />
                <stop offset="100%" stop-color="#7c3aed" />
              </linearGradient>
              <linearGradient id="gold-trophy" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fff3b0" />
                <stop offset="35%" stop-color="#ffd166" />
                <stop offset="70%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#d97706" />
              </linearGradient>
              <linearGradient id="podium-1" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="100%" stop-color="#099268" />
              </linearGradient>
              <linearGradient id="podium-2" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f72585" />
                <stop offset="100%" stop-color="#b5179e" />
              </linearGradient>
              <linearGradient id="podium-3" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#4361ee" />
                <stop offset="100%" stop-color="#3a0ca3" />
              </linearGradient>
              <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-clasico)" />
            <!-- Rayos de luz de fondo -->
            <path d="M200 120 L150 0 L250 0 Z" fill="rgba(255,255,255,0.06)" />
            <path d="M200 120 L50 20 L90 0 Z" fill="rgba(255,255,255,0.04)" />
            <path d="M200 120 L350 20 L310 0 Z" fill="rgba(255,255,255,0.04)" />
            
            <!-- Podios -->
            <rect x="155" y="145" width="90" height="75" rx="8" fill="url(#podium-1)" />
            <rect x="75" y="165" width="80" height="55" rx="8" fill="url(#podium-2)" />
            <rect x="245" y="175" width="80" height="45" rx="8" fill="url(#podium-3)" />
            <text x="200" y="195" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#ffffff" text-anchor="middle">1</text>
            <text x="115" y="205" font-family="'Outfit', sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">2</text>
            <text x="285" y="210" font-family="'Outfit', sans-serif" font-weight="900" font-size="20" fill="#ffffff" text-anchor="middle">3</text>

            <!-- Trofeo de Oro Central -->
            <g transform="translate(160, 45)" filter="url(#glow-gold)">
              <ellipse cx="40" cy="98" rx="28" ry="7" fill="rgba(0,0,0,0.3)" />
              <rect x="25" y="80" width="30" height="15" rx="3" fill="#d97706" />
              <path d="M35 60 L45 60 L44 80 L36 80 Z" fill="#f59e0b" />
              <path d="M20 20 C20 55 32 60 40 60 C48 60 60 55 60 20 Z" fill="url(#gold-trophy)" />
              <!-- Asas -->
              <path d="M20 25 C8 25 8 45 22 48" fill="none" stroke="url(#gold-trophy)" stroke-width="4.5" stroke-linecap="round" />
              <path d="M60 25 C72 25 72 45 58 48" fill="none" stroke="url(#gold-trophy)" stroke-width="4.5" stroke-linecap="round" />
              <!-- Estrella en el trofeo -->
              <polygon points="40,30 42,36 48,36 43,40 45,46 40,42 35,46 37,40 32,36 38,36" fill="#ffffff" opacity="0.9" />
            </g>

            <!-- Estrellas y chispas -->
            <circle cx="90" cy="70" r="3" fill="#ffd166" />
            <circle cx="310" cy="65" r="3.5" fill="#00f5d4" />
            <circle cx="130" cy="40" r="2.5" fill="#f72585" />
            <circle cx="280" cy="110" r="2" fill="#ffd166" />
          </svg>
        `;
      }
    },
    {
      id: 'carrera_relampago',
      name: 'Carrera Relámpago',
      shortName: 'Carrera Relámpago',
      badge: '⚡ VELOCIDAD',
      icon: '⚡',
      themeColor: '#ffd166',
      accentColor: '#f72585',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 45%, #ffd166 100%)',
      description: 'Responder rápidamente antes de que termine el tiempo. La velocidad influye directamente en la puntuación: ¡los primeros segundos otorgan un multiplicador relámpago x2!',
      config: {
        speedBonus: true,
        multiplier: 2.0
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-relampago" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1f1300" />
                <stop offset="40%" stop-color="#78350f" />
                <stop offset="100%" stop-color="#b45309" />
              </linearGradient>
              <linearGradient id="chrono-rim" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffe66d" />
                <stop offset="50%" stop-color="#ffd166" />
                <stop offset="100%" stop-color="#f59e0b" />
              </linearGradient>
              <linearGradient id="lightning-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="40%" stop-color="#00f5d4" />
                <stop offset="100%" stop-color="#06d6a0" />
              </linearGradient>
              <filter id="lightning-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-relampago)" />

            <!-- Líneas de velocidad dinámicas -->
            <path d="M20 60 L120 60" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" opacity="0.4" />
            <path d="M10 100 L90 100" stroke="#ffd166" stroke-width="4" stroke-linecap="round" opacity="0.6" />
            <path d="M30 140 L130 140" stroke="#f59e0b" stroke-width="3" stroke-linecap="round" opacity="0.5" />
            <path d="M280 80 L380 80" stroke="#ffd166" stroke-width="4" stroke-linecap="round" opacity="0.5" />
            <path d="M310 130 L390 130" stroke="#00f5d4" stroke-width="3" stroke-linecap="round" opacity="0.7" />

            <!-- Cronómetro Central 3D -->
            <g transform="translate(140, 40)">
              <!-- Sombra -->
              <ellipse cx="60" cy="155" rx="55" ry="12" fill="rgba(0,0,0,0.4)" />
              <!-- Pulsador superior -->
              <rect x="52" y="10" width="16" height="15" rx="3" fill="#ffd166" />
              <rect x="46" y="5" width="28" height="7" rx="3" fill="#ffffff" />
              <path d="M85 22 L98 33" stroke="#ffd166" stroke-width="5" stroke-linecap="round" />
              <!-- Esfera exterior -->
              <circle cx="60" cy="85" r="60" fill="url(#chrono-rim)" />
              <circle cx="60" cy="85" r="50" fill="#0f172a" />
              <!-- Tics del reloj -->
              <circle cx="60" cy="42" r="2.5" fill="#ffd166" />
              <circle cx="103" cy="85" r="2.5" fill="#ffd166" />
              <circle cx="60" cy="128" r="2.5" fill="#ffd166" />
              <circle cx="17" cy="85" r="2.5" fill="#ffd166" />
              <!-- Aguja a gran velocidad -->
              <line x1="60" y1="85" x2="88" y2="55" stroke="#f72585" stroke-width="4.5" stroke-linecap="round" />
              <circle cx="60" cy="85" r="6" fill="#f72585" />
            </g>

            <!-- Rayos Neón Cruzados -->
            <path d="M90 20 L60 90 L85 90 L50 170 L110 80 L80 80 Z" fill="url(#lightning-grad)" filter="url(#lightning-glow)" opacity="0.95" />
            <path d="M320 50 L290 115 L312 115 L280 185 L335 110 L310 110 Z" fill="#ffd166" filter="url(#lightning-glow)" opacity="0.9" />

            <!-- Chispas -->
            <polygon points="260,35 264,43 272,45 266,51 267,59 260,54 253,59 254,51 248,45 256,43" fill="#ffffff" />
            <polygon points="120,180 123,186 130,187 125,192 126,198 120,195 114,198 115,192 110,187 117,186" fill="#00f5d4" />
          </svg>
        `;
      }
    },
    {
      id: 'duelo_mental',
      name: 'Duelo Mental',
      shortName: 'Duelo Mental',
      badge: '⚔️ 1 VS 1',
      icon: '⚔️',
      themeColor: '#7209b7',
      accentColor: '#f72585',
      gradient: 'linear-gradient(135deg, #3b0764 0%, #7209b7 50%, #f72585 100%)',
      description: 'Dos jugadores se enfrentan directamente pregunta por pregunta. La pantalla destaca el choque de titanes cara a cara: gana quien consiga más puntos.',
      config: {
        bracketMode: 'leaderboard_clash'
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-duelo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#18002e" />
                <stop offset="50%" stop-color="#3b0764" />
                <stop offset="100%" stop-color="#581c87" />
              </linearGradient>
              <linearGradient id="brain-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#a7f3d0" />
                <stop offset="50%" stop-color="#00f5d4" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              <linearGradient id="brain-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fbcfe8" />
                <stop offset="50%" stop-color="#f72585" />
                <stop offset="100%" stop-color="#9d174d" />
              </linearGradient>
              <filter id="clash-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="7" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-duelo)" />

            <!-- Fondo de choque de energía -->
            <path d="M190 0 L215 0 L205 240 L180 240 Z" fill="rgba(255,255,255,0.08)" />

            <!-- Personaje / Cerebro Izquierdo (Cian) -->
            <g transform="translate(60, 50)">
              <ellipse cx="50" cy="130" rx="45" ry="12" fill="rgba(0,0,0,0.4)" />
              <!-- Aura cian -->
              <circle cx="50" cy="65" r="48" fill="#00f5d4" opacity="0.2" filter="url(#clash-glow)" />
              <!-- Cabeza / Cerebro -->
              <path d="M20 70 C10 50 15 25 35 20 C45 15 55 18 60 25 C65 18 75 15 85 20 C105 25 110 50 100 70 C100 95 80 105 50 105 C20 105 20 95 20 70 Z" fill="url(#brain-cyan)" />
              <!-- Detalles de circunvoluciones -->
              <path d="M35 45 C45 40 50 55 60 50 C70 45 75 60 85 55" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
              <path d="M30 65 C40 60 45 75 55 70 C65 65 70 80 80 75" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
              <!-- Ojo desafiante -->
              <circle cx="75" cy="55" r="6" fill="#0b0f19" />
              <circle cx="77" cy="53" r="2" fill="#ffffff" />
            </g>

            <!-- Personaje / Cerebro Derecho (Magenta) -->
            <g transform="translate(240, 50)">
              <ellipse cx="50" cy="130" rx="45" ry="12" fill="rgba(0,0,0,0.4)" />
              <!-- Aura magenta -->
              <circle cx="50" cy="65" r="48" fill="#f72585" opacity="0.2" filter="url(#clash-glow)" />
              <!-- Cabeza / Cerebro -->
              <path d="M100 70 C110 50 105 25 85 20 C75 15 65 18 60 25 C55 18 45 15 35 20 C15 25 10 50 20 70 C20 95 40 105 70 105 C100 105 100 95 100 70 Z" fill="url(#brain-magenta)" />
              <!-- Detalles circunvoluciones -->
              <path d="M85 45 C75 40 70 55 60 50 C50 45 45 60 35 55" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
              <path d="M90 65 C80 60 75 75 65 70 C55 65 50 80 40 75" fill="none" stroke="#ffffff" stroke-width="3" stroke-linecap="round" opacity="0.7" />
              <!-- Ojo desafiante -->
              <circle cx="45" cy="55" r="6" fill="#0b0f19" />
              <circle cx="43" cy="53" r="2" fill="#ffffff" />
            </g>

            <!-- Emblema Central "VS" con Relámpagos de Choque -->
            <g transform="translate(170, 75)" filter="url(#clash-glow)">
              <circle cx="30" cy="35" r="28" fill="#1e103a" stroke="#ffd166" stroke-width="3" />
              <text x="30" y="44" font-family="'Outfit', sans-serif" font-weight="900" font-size="24" fill="#ffd166" text-anchor="middle" font-style="italic">VS</text>
            </g>
            <!-- Chispas del choque central -->
            <path d="M190 60 L200 40 L205 55 L220 35" stroke="#ffffff" stroke-width="3" fill="none" stroke-linecap="round" />
            <path d="M185 130 L195 150 L200 135 L215 155" stroke="#00f5d4" stroke-width="3" fill="none" stroke-linecap="round" />
          </svg>
        `;
      }
    },
    {
      id: 'bomba_preguntas',
      name: 'Bomba de Preguntas',
      shortName: 'Bomba de Preguntas',
      badge: '💣 EXPLOSIVO',
      icon: '💣',
      themeColor: '#f97316',
      accentColor: '#ef4444',
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #ea580c 50%, #f97316 100%)',
      description: 'Una bomba pasa de jugador en jugador. El alumno debe responder correctamente antes de que la cuenta regresiva termine o la bomba detonará.',
      config: {
        fuseSeconds: 15
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-bomba" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1c0702" />
                <stop offset="45%" stop-color="#431407" />
                <stop offset="100%" stop-color="#7c2d12" />
              </linearGradient>
              <radialGradient id="bomb-body" cx="35%" cy="35%" r="65%">
                <stop offset="0%" stop-color="#475569" />
                <stop offset="35%" stop-color="#1e293b" />
                <stop offset="80%" stop-color="#090d16" />
                <stop offset="100%" stop-color="#000000" />
              </radialGradient>
              <linearGradient id="fire-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="30%" stop-color="#ffd166" />
                <stop offset="70%" stop-color="#f97316" />
                <stop offset="100%" stop-color="#ef4444" />
              </linearGradient>
              <filter id="spark-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-bomba)" />

            <!-- Ondas expansivas de fondo -->
            <circle cx="200" cy="130" r="110" fill="none" stroke="#f97316" stroke-width="2" opacity="0.15" />
            <circle cx="200" cy="130" r="140" fill="none" stroke="#ef4444" stroke-width="1.5" opacity="0.1" />

            <!-- Sombra de la bomba -->
            <ellipse cx="200" cy="205" rx="70" ry="16" fill="rgba(0,0,0,0.55)" />

            <!-- Bomba Principal -->
            <g transform="translate(130, 50)">
              <!-- Mecha curvada -->
              <path d="M70 25 C75 -5 105 -10 115 5" fill="none" stroke="#d97706" stroke-width="5" stroke-linecap="round" />
              <!-- Chispa de fuego en la mecha -->
              <g transform="translate(115, 0)" filter="url(#spark-glow)">
                <circle cx="0" cy="0" r="12" fill="url(#fire-grad)" />
                <polygon points="0,-18 5,-5 18,-3 8,6 10,18 0,10 -10,18 -8,6 -18,-3 -5,-5" fill="#ffd166" />
                <circle cx="0" cy="0" r="5" fill="#ffffff" />
              </g>

              <!-- Boquilla de la bomba -->
              <rect x="58" y="20" width="24" height="12" rx="3" fill="#334155" stroke="#64748b" stroke-width="1.5" />

              <!-- Esfera de la bomba -->
              <circle cx="70" cy="85" r="58" fill="url(#bomb-body)" />
              <!-- Brillo specular 3D -->
              <ellipse cx="48" cy="62" rx="18" ry="9" transform="rotate(-30 48 62)" fill="rgba(255,255,255,0.3)" />

              <!-- Pantalla digital con contador LED de peligro -->
              <rect x="42" y="70" width="56" height="28" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="2" />
              <text x="70" y="91" font-family="monospace" font-weight="900" font-size="20" fill="#ef4444" text-anchor="middle" letter-spacing="2">0:05</text>
            </g>

            <!-- Chispas dispersas -->
            <circle cx="270" cy="40" r="2.5" fill="#ffd166" />
            <circle cx="290" cy="60" r="3.5" fill="#f97316" />
            <circle cx="245" cy="20" r="2" fill="#ffffff" />
            <circle cx="310" cy="35" r="2" fill="#ef4444" />
          </svg>
        `;
      }
    },
    {
      id: 'conquista',
      name: 'Conquista del Conocimiento',
      shortName: 'Conquista',
      badge: '🗺️ ESTRATEGIA',
      icon: '🗺️',
      themeColor: '#2563eb',
      accentColor: '#10b981',
      gradient: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #059669 100%)',
      description: 'Cada respuesta correcta permite conquistar territorios dentro de un mapa temático. El objetivo es dominar la mayor cantidad de zonas de la arena.',
      config: {
        territories: 5
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-conquista" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0c1938" />
                <stop offset="50%" stop-color="#1e3a8a" />
                <stop offset="100%" stop-color="#1d4ed8" />
              </linearGradient>
              <linearGradient id="map-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#10b981" />
                <stop offset="100%" stop-color="#047857" />
              </linearGradient>
              <linearGradient id="map-grad-2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="100%" stop-color="#0284c7" />
              </linearGradient>
              <linearGradient id="flag-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffd166" />
                <stop offset="100%" stop-color="#f59e0b" />
              </linearGradient>
              <filter id="map-shadow">
                <feDropShadow dx="0" dy="8" stdDeviation="6" flood-color="#000000" flood-opacity="0.4" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-conquista)" />

            <!-- Mapa Isométrico Estilizado -->
            <g transform="translate(60, 30)" filter="url(#map-shadow)">
              <!-- Base del tablero -->
              <polygon points="140,25 270,75 140,150 10,95" fill="#1e293b" />
              
              <!-- Territorio Norte (Esmeralda) -->
              <polygon points="140,28 200,52 140,85 80,60" fill="url(#map-grad-1)" />
              <polygon points="80,60 140,85 140,95 80,70" fill="#065f46" />
              <polygon points="140,85 200,52 200,62 140,95" fill="#047857" />

              <!-- Territorio Este (Cian / Zafiro) -->
              <polygon points="200,52 265,77 210,110 145,85" fill="url(#map-grad-2)" />
              <polygon points="145,85 210,110 210,120 145,95" fill="#0369a1" />

              <!-- Territorio Sur / Oeste (Magenta) -->
              <polygon points="80,60 140,85 75,125 15,95" fill="#f72585" />
              <polygon points="15,95 75,125 75,135 15,105" fill="#9d174d" />

              <!-- Territorio Central (Oro) -->
              <polygon points="140,85 180,102 140,125 100,105" fill="#ffd166" />

              <!-- Bandera de Conquista Clavada en el Centro -->
              <g transform="translate(140, 20)">
                <line x1="0" y1="20" x2="0" y2="85" stroke="#ffffff" stroke-width="4" stroke-linecap="round" />
                <path d="M0 20 C20 15 30 30 50 20 L50 48 C30 58 20 42 0 48 Z" fill="url(#flag-gold)" />
                <circle cx="0" cy="18" r="4.5" fill="#ffffff" />
                <!-- Escudo en la bandera -->
                <circle cx="22" cy="33" r="6" fill="#1e103a" />
                <text x="22" y="37" font-family="sans-serif" font-weight="900" font-size="8" fill="#ffffff" text-anchor="middle">★</text>
              </g>

              <!-- Pequeñas torres / fortines -->
              <rect x="70" y="35" width="8" height="15" rx="2" fill="#ffffff" />
              <rect x="220" y="60" width="8" height="15" rx="2" fill="#ffffff" />
            </g>

            <!-- Rosa de los vientos / Brújula -->
            <g transform="translate(325, 45)" opacity="0.8">
              <circle cx="20" cy="20" r="18" fill="none" stroke="#00f5d4" stroke-width="1.5" />
              <polygon points="20,5 24,18 20,15 16,18" fill="#00f5d4" />
              <polygon points="20,35 24,22 20,25 16,22" fill="#ffffff" />
              <text x="20" y="2" font-family="sans-serif" font-weight="900" font-size="8" fill="#00f5d4" text-anchor="middle">N</text>
            </g>
          </svg>
        `;
      }
    },
    {
      id: 'tiro_perfecto',
      name: 'Tiro Perfecto',
      shortName: 'Tiro Perfecto',
      badge: '🎯 PRECISIÓN',
      icon: '🎯',
      themeColor: '#ef4444',
      accentColor: '#00f5d4',
      gradient: 'linear-gradient(135deg, #991b1b 0%, #ef4444 50%, #00f5d4 100%)',
      description: 'Cada respuesta correcta permite realizar un lanzamiento hacia la diana. Las respuestas más rápidas desbloquean proyectiles de precisión y objetivos especiales.',
      config: {
        bullseyeBonus: true
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-tiro" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#180404" />
                <stop offset="45%" stop-color="#450a0a" />
                <stop offset="100%" stop-color="#7f1d1d" />
              </linearGradient>
              <linearGradient id="arrow-glow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="50%" stop-color="#00f5d4" />
                <stop offset="100%" stop-color="#06d6a0" />
              </linearGradient>
              <filter id="bullseye-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-tiro)" />

            <!-- Mira telescópica / Crosshair en el fondo -->
            <line x1="200" y1="20" x2="200" y2="220" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.3" />
            <line x1="60" y1="120" x2="340" y2="120" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.3" />

            <!-- Diana 3D con Anillos Concéntricos -->
            <g transform="translate(130, 40)">
              <!-- Sombra base -->
              <ellipse cx="70" cy="160" rx="65" ry="14" fill="rgba(0,0,0,0.5)" />

              <!-- Anillo 1 (Exterior blanco) -->
              <circle cx="70" cy="80" r="75" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2" />
              <!-- Anillo 2 (Negro) -->
              <circle cx="70" cy="80" r="60" fill="#0f172a" />
              <!-- Anillo 3 (Azul / Turquesa) -->
              <circle cx="70" cy="80" r="45" fill="#0284c7" />
              <!-- Anillo 4 (Rojo) -->
              <circle cx="70" cy="80" r="30" fill="#ef4444" />
              <!-- Centro / Diana de Oro (Bullseye) -->
              <circle cx="70" cy="80" r="15" fill="#ffd166" />
              <circle cx="70" cy="80" r="5" fill="#ffffff" />

              <!-- Flecha neón impactando al centro exacto -->
              <g transform="translate(70, 80) rotate(-35)" filter="url(#bullseye-glow)">
                <!-- Eje de la flecha -->
                <line x1="-90" y1="0" x2="0" y2="0" stroke="url(#arrow-glow)" stroke-width="5" stroke-linecap="round" />
                <!-- Plumas de la flecha -->
                <path d="M-85 0 L-95 -12 L-80 -12 Z" fill="#00f5d4" />
                <path d="M-85 0 L-95 12 L-80 12 Z" fill="#00f5d4" />
                <path d="M-72 0 L-82 -10 L-68 -10 Z" fill="#ffffff" />
                <path d="M-72 0 L-82 10 L-68 10 Z" fill="#ffffff" />
                <!-- Punta de impacto incrustada -->
                <polygon points="0,-4 10,0 0,4" fill="#ffffff" />
              </g>

              <!-- Destellos de impacto en el centro -->
              <polygon points="70,68 73,77 82,80 73,83 70,92 67,83 58,80 67,77" fill="#ffffff" filter="url(#bullseye-glow)" />
            </g>

            <!-- Puntuaciones flotantes -->
            <text x="310" y="70" font-family="'Outfit', sans-serif" font-weight="900" font-size="22" fill="#00f5d4" text-anchor="middle">+1000</text>
            <text x="310" y="90" font-family="'Outfit', sans-serif" font-weight="800" font-size="11" fill="#ffffff" text-anchor="middle" letter-spacing="1">DIANA PERFECTA</text>
          </svg>
        `;
      }
    },
    {
      id: 'desafio_volcanico',
      name: 'Desafío Volcánico',
      shortName: 'Desafío Volcánico',
      badge: '🌋 INTENSO',
      icon: '🌋',
      themeColor: '#ea580c',
      accentColor: '#fbbf24',
      gradient: 'linear-gradient(135deg, #7c2d12 0%, #dc2626 50%, #f97316 100%)',
      description: 'El escenario es un volcán en erupción que aumenta progresivamente la dificultad. Las preguntas correctas permiten escalar senderos seguros hacia la cima.',
      config: {
        lavaSpeed: 'medium'
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-volcan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1f0a04" />
                <stop offset="45%" stop-color="#451205" />
                <stop offset="100%" stop-color="#7c2d12" />
              </linearGradient>
              <linearGradient id="lava-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffd166" />
                <stop offset="30%" stop-color="#f97316" />
                <stop offset="70%" stop-color="#ef4444" />
                <stop offset="100%" stop-color="#b91c1c" />
              </linearGradient>
              <filter id="lava-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-volcan)" />

            <!-- Nubes de ceniza y humo volcánico -->
            <ellipse cx="200" cy="35" rx="55" ry="25" fill="rgba(30, 41, 59, 0.7)" />
            <ellipse cx="160" cy="25" rx="40" ry="20" fill="rgba(51, 65, 85, 0.6)" />
            <ellipse cx="240" cy="25" rx="45" ry="20" fill="rgba(51, 65, 85, 0.6)" />

            <!-- Montaña Volcánica -->
            <g transform="translate(60, 50)">
              <!-- Silueta rocosa del volcán -->
              <polygon points="140,25 210,165 70,165" fill="#1c1917" />
              <polygon points="140,25 70,165 20,165" fill="#292524" />
              <polygon points="140,25 260,165 210,165" fill="#0c0a09" />

              <!-- Cráter con magma hirviendo -->
              <ellipse cx="140" cy="25" rx="35" ry="12" fill="url(#lava-grad)" filter="url(#lava-glow)" />

              <!-- Ríos de lava descendientes -->
              <path d="M135 32 Q125 70 145 105 Q155 130 140 165" fill="none" stroke="url(#lava-grad)" stroke-width="7" stroke-linecap="round" filter="url(#lava-glow)" />
              <path d="M150 32 Q175 75 165 115 Q180 140 185 165" fill="none" stroke="url(#lava-grad)" stroke-width="5" stroke-linecap="round" filter="url(#lava-glow)" />
              <path d="M125 32 Q105 80 110 120 Q95 145 90 165" fill="none" stroke="url(#lava-grad)" stroke-width="4.5" stroke-linecap="round" />

              <!-- Sendero de ascenso (escaleras de piedra de los supervivientes) -->
              <path d="M60 160 L85 135 L80 110 L105 85 L115 50" fill="none" stroke="#ffd166" stroke-width="3" stroke-dasharray="4,4" />
            </g>

            <!-- Rocas de fuego disparadas al aire -->
            <circle cx="160" cy="30" r="5" fill="#ffd166" filter="url(#lava-glow)" />
            <circle cx="230" cy="20" r="6" fill="#f97316" filter="url(#lava-glow)" />
            <circle cx="195" cy="10" r="4" fill="#ffffff" filter="url(#lava-glow)" />
            <circle cx="260" cy="45" r="3.5" fill="#ef4444" />
          </svg>
        `;
      }
    },
    {
      id: 'rey_del_reto',
      name: 'Rey del Reto',
      shortName: 'Rey del Reto',
      badge: '👑 COMPETITIVO',
      icon: '👑',
      themeColor: '#ffd700',
      accentColor: '#7c3aed',
      gradient: 'linear-gradient(135deg, #581c87 0%, #7c3aed 45%, #f59e0b 100%)',
      description: 'Los estudiantes compiten por arrebatar y conservar la corona dorada. Responder correctamente permite lucir la corona o robársela al líder actual.',
      config: {
        crownSteal: true
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-rey" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e0a38" />
                <stop offset="50%" stop-color="#3b0764" />
                <stop offset="100%" stop-color="#581c87" />
              </linearGradient>
              <linearGradient id="crown-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fffbeb" />
                <stop offset="30%" stop-color="#ffd166" />
                <stop offset="70%" stop-color="#f59e0b" />
                <stop offset="100%" stop-color="#b45309" />
              </linearGradient>
              <filter id="crown-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-rey)" />

            <!-- Laureles de victoria en el fondo -->
            <g stroke="#ffd166" stroke-width="2" fill="none" opacity="0.35">
              <path d="M120 170 C90 140 90 90 130 60" />
              <path d="M280 170 C310 140 310 90 270 60" />
            </g>

            <!-- Sombra de la corona -->
            <ellipse cx="200" cy="185" rx="75" ry="14" fill="rgba(0,0,0,0.5)" />

            <!-- Pedestal Real -->
            <rect x="145" y="165" width="110" height="30" rx="6" fill="#4c1d95" stroke="#7c3aed" stroke-width="2" />

            <!-- Corona Dorada Majestuosa -->
            <g transform="translate(130, 60)" filter="url(#crown-glow)">
              <!-- Base arqueada de la corona -->
              <path d="M10 90 C50 98 90 98 130 90 L125 50 L100 70 L70 30 L40 70 L15 50 Z" fill="url(#crown-gold)" stroke="#b45309" stroke-width="2" />
              <!-- Banda inferior con gemas -->
              <path d="M10 90 C50 98 90 98 130 90 L132 105 C90 113 50 113 8 105 Z" fill="#b45309" />
              
              <!-- Gemas incrustadas -->
              <circle cx="70" cy="100" r="5.5" fill="#ef4444" />
              <circle cx="40" cy="98" r="4.5" fill="#00f5d4" />
              <circle cx="100" cy="98" r="4.5" fill="#00f5d4" />
              <circle cx="20" cy="95" r="3.5" fill="#ffd166" />
              <circle cx="120" cy="95" r="3.5" fill="#ffd166" />

              <!-- Esferas en las puntas -->
              <circle cx="70" cy="30" r="6" fill="#ffffff" />
              <circle cx="15" cy="50" r="4.5" fill="#ffffff" />
              <circle cx="125" cy="50" r="4.5" fill="#ffffff" />
              <circle cx="40" cy="70" r="4" fill="#ffd166" />
              <circle cx="100" cy="70" r="4" fill="#ffd166" />
            </g>

            <!-- Destellos brillantes de grandeza -->
            <polygon points="200,30 203,42 215,45 205,53 207,65 198,58 189,65 191,53 181,45 193,42" fill="#ffffff" filter="url(#crown-glow)" />
            <polygon points="120,70 122,78 130,80 123,85 125,93 119,89 113,93 115,85 108,80 116,78" fill="#ffd166" />
            <polygon points="280,75 282,83 290,85 283,90 285,98 279,94 273,98 275,90 268,85 276,83" fill="#00f5d4" />
          </svg>
        `;
      }
    },
    {
      id: 'mision_espacial',
      name: 'Misión Espacial',
      shortName: 'Misión Espacial',
      badge: '🚀 AVENTURA',
      icon: '🚀',
      themeColor: '#6366f1',
      accentColor: '#00f5d4',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 45%, #6366f1 100%)',
      description: 'Cada respuesta correcta impulsa una nave espacial a hipervelocidad. Los jugadores superan planetas, asteroides y viajan juntos rumbo a la galaxia.',
      config: {
        destination: 'marte'
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-espacio" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#050515" />
                <stop offset="50%" stop-color="#0f172a" />
                <stop offset="100%" stop-color="#1e1b4b" />
              </linearGradient>
              <linearGradient id="rocket-body" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="60%" stop-color="#e2e8f0" />
                <stop offset="100%" stop-color="#94a3b8" />
              </linearGradient>
              <linearGradient id="thruster-fire" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="40%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="#f72585" />
              </linearGradient>
              <filter id="rocket-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-espacio)" />

            <!-- Planeta de fondo con anillos (Saturno/Neptuno) -->
            <g transform="translate(60, 40)">
              <circle cx="45" cy="45" r="30" fill="#7c3aed" opacity="0.8" />
              <ellipse cx="45" cy="45" rx="55" ry="14" fill="none" stroke="#00f5d4" stroke-width="4" transform="rotate(-25 45 45)" opacity="0.6" />
            </g>

            <!-- Planeta rojo (Marte) -->
            <circle cx="330" cy="170" r="22" fill="#ef4444" opacity="0.85" />

            <!-- Estrellas y constelaciones -->
            <circle cx="150" cy="30" r="2" fill="#ffffff" />
            <circle cx="210" cy="20" r="1.5" fill="#ffd166" />
            <circle cx="280" cy="50" r="2.5" fill="#00f5d4" />
            <circle cx="120" cy="190" r="1.5" fill="#ffffff" />
            <circle cx="260" cy="210" r="2" fill="#ffd166" />

            <!-- Nave Espacial / Cohete 3D en vuelo diagonal -->
            <g transform="translate(180, 70) rotate(-45)" filter="url(#rocket-glow)">
              <!-- Fuego propulsor neón -->
              <polygon points="0,75 -15,120 0,105 15,120" fill="url(#thruster-fire)" />
              <polygon points="0,75 -8,100 0,90 8,100" fill="#ffffff" />

              <!-- Aletas laterales -->
              <polygon points="-20,45 -35,75 -12,70" fill="#f72585" />
              <polygon points="20,45 35,75 12,70" fill="#f72585" />

              <!-- Fuselaje del cohete -->
              <path d="M0,0 C25,25 25,65 18,75 L-18,75 C-25,65 -25,25 0,0 Z" fill="url(#rocket-body)" />
              <!-- Ojiva roja -->
              <path d="M0,0 C12,12 15,25 15,30 L-15,30 C-15,25 -12,12 0,0 Z" fill="#ef4444" />
              <!-- Ventana / Escotilla -->
              <circle cx="0" cy="45" r="9" fill="#0284c7" stroke="#00f5d4" stroke-width="2" />
              <circle cx="-2" cy="43" r="3" fill="#ffffff" />
            </g>

            <!-- Estela de velocidad espacial -->
            <path d="M80 180 Q140 160 170 140" stroke="#00f5d4" stroke-width="2.5" stroke-dasharray="8,6" opacity="0.5" />
          </svg>
        `;
      }
    },
    {
      id: 'rompecabezas',
      name: 'Rompecabezas',
      shortName: 'Rompecabezas',
      badge: '🧩 VISUAL',
      icon: '🧩',
      themeColor: '#06d6a0',
      accentColor: '#a78bfa',
      gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 45%, #a78bfa 100%)',
      description: 'Cada respuesta correcta desbloquea y ensambla una pieza del rompecabezas. El objetivo del grupo es completar la ilustración oculta antes que se agoten los turnos.',
      config: {
        puzzlePieces: 6
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-puzzle" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#022c22" />
                <stop offset="50%" stop-color="#064e3b" />
                <stop offset="100%" stop-color="#0f766e" />
              </linearGradient>
              <filter id="piece-shadow">
                <feDropShadow dx="0" dy="6" stdDeviation="5" flood-color="#000000" flood-opacity="0.4" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-puzzle)" />

            <!-- Tablero de Rompecabezas Central -->
            <g transform="translate(110, 35)" filter="url(#piece-shadow)">
              <!-- Marco base -->
              <rect x="0" y="0" width="180" height="150" rx="12" fill="#0f172a" stroke="#334155" stroke-width="3" />
              
              <!-- Pieza 1 (Top-Left, Verde esmeralda) -->
              <path d="M 10 10 L 80 10 C 80 20 95 20 95 10 L 95 75 C 85 75 85 90 95 90 L 10 75 Z" fill="#06d6a0" stroke="#ffffff" stroke-width="1.5" />
              <text x="50" y="50" font-family="'Outfit', sans-serif" font-weight="900" font-size="22" fill="#ffffff" text-anchor="middle">★</text>

              <!-- Pieza 2 (Top-Right, Lila pastel) -->
              <path d="M 95 10 L 170 10 L 170 75 C 160 75 160 90 170 90 L 95 75 C 95 65 80 65 95 55 Z" fill="#a78bfa" stroke="#ffffff" stroke-width="1.5" />

              <!-- Pieza 3 (Bottom-Left, Turquesa) -->
              <path d="M 10 75 L 95 75 C 95 85 110 85 95 95 L 95 140 L 10 140 Z" fill="#38bdf8" stroke="#ffffff" stroke-width="1.5" />

              <!-- Hueco de pieza faltante (Silueta con borde luminoso) -->
              <rect x="95" y="75" width="75" height="65" fill="rgba(255,255,255,0.06)" stroke="#00f5d4" stroke-width="2.5" stroke-dasharray="6,4" />
              <text x="132" y="115" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#00f5d4" text-anchor="middle" opacity="0.6">?</text>
            </g>

            <!-- Pieza Flotante en el Aire (Rosa / Neón) lista para encajar -->
            <g transform="translate(290, 80) rotate(15)" filter="url(#piece-shadow)">
              <rect x="0" y="0" width="55" height="50" rx="8" fill="#f72585" stroke="#ffffff" stroke-width="2" />
              <!-- Conector macho -->
              <circle cx="27" cy="0" r="9" fill="#f72585" stroke="#ffffff" stroke-width="2" />
              <circle cx="55" cy="25" r="9" fill="#f72585" />
              <text x="27" y="32" font-family="'Outfit', sans-serif" font-weight="900" font-size="16" fill="#ffffff" text-anchor="middle">🧩</text>
            </g>

            <!-- Chispas -->
            <circle cx="80" cy="60" r="3" fill="#ffd166" />
            <circle cx="330" cy="50" r="2.5" fill="#00f5d4" />
          </svg>
        `;
      }
    },
    {
      id: 'ultimo_superviviente',
      name: 'Último Superviviente',
      shortName: 'Superviviente',
      badge: '🛡️ SURVIVAL',
      icon: '🛡️',
      themeColor: '#ef4444',
      accentColor: '#10b981',
      gradient: 'linear-gradient(135deg, #881337 0%, #e11d48 50%, #10b981 100%)',
      description: 'Cada jugador comienza con varias vidas (corazones ❤️). Una respuesta incorrecta elimina una vida: ¡el último estudiante en pie gana la partida!',
      config: {
        startingLives: 3
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-superviviente" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1c050c" />
                <stop offset="45%" stop-color="#4c0519" />
                <stop offset="100%" stop-color="#881337" />
              </linearGradient>
              <linearGradient id="shield-titan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#f8fafc" />
                <stop offset="50%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#475569" />
              </linearGradient>
              <linearGradient id="heart-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fda4af" />
                <stop offset="50%" stop-color="#f43f5e" />
                <stop offset="100%" stop-color="#be123c" />
              </linearGradient>
              <filter id="heart-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-superviviente)" />

            <!-- Barreras / Obstáculos angulares de peligro -->
            <polygon points="40,190 70,140 85,190" fill="#334155" opacity="0.6" />
            <polygon points="310,195 340,135 360,195" fill="#334155" opacity="0.6" />

            <!-- Escudo de Titanio Defensivo -->
            <g transform="translate(145, 45)" filter="url(#heart-glow)">
              <!-- Sombra -->
              <ellipse cx="55" cy="150" rx="55" ry="12" fill="rgba(0,0,0,0.5)" />

              <!-- Forma del escudo -->
              <path d="M10 20 C55 10 55 10 100 20 C100 80 80 125 55 140 C30 125 10 80 10 20 Z" fill="url(#shield-titan)" stroke="#cbd5e1" stroke-width="3" />
              <path d="M20 28 C55 20 55 20 90 28 C90 75 75 115 55 128 C35 115 20 75 20 28 Z" fill="#0f172a" />
              
              <!-- Emblema de vida en el escudo -->
              <path d="M55 45 C40 30 25 45 40 65 L55 80 L70 65 C85 45 70 30 55 45 Z" fill="url(#heart-grad)" />
            </g>

            <!-- Tres Corazones de Vidas Flotantes (❤️ ❤️ ❤️) -->
            <g transform="translate(135, 175)">
              <g transform="translate(0, 0)">
                <path d="M15 5 C10 -2 0 3 6 12 L15 20 L24 12 C30 3 20 -2 15 5 Z" fill="url(#heart-grad)" filter="url(#heart-glow)" />
              </g>
              <g transform="translate(50, -5)">
                <path d="M15 5 C10 -2 0 3 6 12 L15 20 L24 12 C30 3 20 -2 15 5 Z" fill="url(#heart-grad)" filter="url(#heart-glow)" />
              </g>
              <g transform="translate(100, 0)">
                <path d="M15 5 C10 -2 0 3 6 12 L15 20 L24 12 C30 3 20 -2 15 5 Z" fill="url(#heart-grad)" filter="url(#heart-glow)" />
              </g>
            </g>

            <!-- Destellos protectores -->
            <circle cx="100" cy="50" r="3" fill="#10b981" />
            <circle cx="300" cy="65" r="3.5" fill="#ffd166" />
          </svg>
        `;
      }
    },
    {
      id: 'mundo_sorpresa',
      name: 'Mundo Sorpresa',
      shortName: 'Mundo Sorpresa',
      badge: '🌀 ALEATORIO',
      icon: '🌀',
      themeColor: '#ec4899',
      accentColor: '#fbbf24',
      gradient: 'linear-gradient(135deg, #701a75 0%, #c026d3 50%, #fbbf24 100%)',
      description: 'Cada ronda introduce una mecánica aleatoria inesperada: doble puntuación, tiempo recortado, preguntas invertidas o eventos de ruleta mágica.',
      config: {
        eventFrequency: 'every_question'
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-sorpresa" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1e0024" />
                <stop offset="50%" stop-color="#4a044e" />
                <stop offset="100%" stop-color="#701a75" />
              </linearGradient>
              <linearGradient id="portal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="35%" stop-color="#ec4899" />
                <stop offset="70%" stop-color="#8b5cf6" />
                <stop offset="100%" stop-color="#fbbf24" />
              </linearGradient>
              <filter id="portal-glow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-sorpresa)" />

            <!-- Portal Mágico en Espiral Concéntrico -->
            <g transform="translate(200, 120)">
              <!-- Anillos del vórtice dimensional -->
              <ellipse cx="0" cy="0" rx="90" ry="75" fill="none" stroke="#ec4899" stroke-width="3" opacity="0.3" filter="url(#portal-glow)" />
              <ellipse cx="0" cy="0" rx="70" ry="58" fill="none" stroke="#8b5cf6" stroke-width="4.5" opacity="0.6" />
              <ellipse cx="0" cy="0" rx="50" ry="40" fill="none" stroke="#00f5d4" stroke-width="5" opacity="0.8" />
              <ellipse cx="0" cy="0" rx="30" ry="24" fill="url(#portal-grad)" filter="url(#portal-glow)" />
              <circle cx="0" cy="0" r="12" fill="#ffffff" />
            </g>

            <!-- Objetos Sorpresa Mágicos Flotando fuera del Portal -->
            <!-- Dado dorado 3D -->
            <g transform="translate(90, 70) rotate(-20)">
              <rect x="0" y="0" width="38" height="38" rx="6" fill="#fbbf24" stroke="#ffffff" stroke-width="2" />
              <circle cx="10" cy="10" r="3.5" fill="#78350f" />
              <circle cx="19" cy="19" r="3.5" fill="#78350f" />
              <circle cx="28" cy="28" r="3.5" fill="#78350f" />
            </g>

            <!-- Signo de interrogación místico brillante -->
            <text x="310" y="105" font-family="'Outfit', sans-serif" font-weight="900" font-size="52" fill="#00f5d4" filter="url(#portal-glow)">?</text>

            <!-- Carta sorpresa -->
            <g transform="translate(100, 140) rotate(15)">
              <rect x="0" y="0" width="32" height="46" rx="4" fill="#ffffff" stroke="#ec4899" stroke-width="2" />
              <text x="16" y="30" font-family="sans-serif" font-weight="900" font-size="20" fill="#ec4899" text-anchor="middle">★</text>
            </g>

            <!-- Esfera de cristal con chispas -->
            <circle cx="290" cy="170" r="16" fill="#8b5cf6" stroke="#ffffff" stroke-width="2" />
            <circle cx="285" cy="165" r="4" fill="#ffffff" />
          </svg>
        `;
      }
    },
    {
      id: 'turbo_quiz',
      name: 'Turbo Quiz',
      shortName: 'Turbo Quiz',
      badge: '🏎️ CARRERA',
      icon: '🏎️',
      themeColor: '#ff5400',
      accentColor: '#00f5d4',
      gradient: 'linear-gradient(135deg, #7c1d06 0%, #ff5400 45%, #00f5d4 100%)',
      description: 'Los jugadores compiten en un circuito de alta velocidad. Cada respuesta acertada activa el tanque de nitro y dispara el bólido en la pista.',
      config: {
        nitroMultiplier: 1.8
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-turbo" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#120400" />
                <stop offset="45%" stop-color="#3a0d02" />
                <stop offset="100%" stop-color="#7c1d06" />
              </linearGradient>
              <linearGradient id="car-body" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ff7900" />
                <stop offset="40%" stop-color="#ff5400" />
                <stop offset="100%" stop-color="#c92a00" />
              </linearGradient>
              <linearGradient id="nitro-flame" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#00f5d4" />
                <stop offset="60%" stop-color="#3b82f6" />
                <stop offset="100%" stop-color="transparent" />
              </linearGradient>
              <filter id="speed-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-turbo)" />

            <!-- Pista de asfalto y líneas de velocidad en fuga -->
            <polygon points="120,240 280,240 230,120 170,120" fill="#0f172a" />
            <line x1="200" y1="120" x2="200" y2="240" stroke="#ffd166" stroke-width="4" stroke-dasharray="16,12" />

            <!-- Líneas de aceleración laterales -->
            <line x1="40" y1="90" x2="150" y2="90" stroke="#ff5400" stroke-width="3" stroke-linecap="round" opacity="0.4" />
            <line x1="20" y1="130" x2="120" y2="130" stroke="#00f5d4" stroke-width="4" stroke-linecap="round" opacity="0.6" />
            <line x1="280" y1="80" x2="380" y2="80" stroke="#ff5400" stroke-width="3" stroke-linecap="round" opacity="0.5" />
            <line x1="260" y1="125" x2="390" y2="125" stroke="#00f5d4" stroke-width="4" stroke-linecap="round" opacity="0.7" />

            <!-- Vehículo Bólido Futurista (Vista frontal-diagonal) -->
            <g transform="translate(135, 80)" filter="url(#speed-glow)">
              <!-- Sombra del auto -->
              <ellipse cx="65" cy="105" rx="60" ry="14" fill="rgba(0,0,0,0.6)" />

              <!-- Llantas de carrera -->
              <rect x="5" y="75" width="22" height="28" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2" />
              <rect x="103" y="75" width="22" height="28" rx="6" fill="#0f172a" stroke="#334155" stroke-width="2" />

              <!-- Chasis y Carrocería deportiva -->
              <path d="M20 85 L35 45 L50 35 L80 35 L95 45 L110 85 L95 95 L35 95 Z" fill="url(#car-body)" />
              
              <!-- Parabrisas tintado neón -->
              <polygon points="40,55 52,40 78,40 90,55" fill="#0f172a" stroke="#00f5d4" stroke-width="2" />
              
              <!-- Faros delanteros LED cian -->
              <ellipse cx="32" cy="78" rx="8" ry="4" fill="#00f5d4" />
              <ellipse cx="98" cy="78" rx="8" ry="4" fill="#00f5d4" />

              <!-- Fuego Nitro saliendo de los costados -->
              <path d="M5 88 L-30 82 L-10 94 Z" fill="url(#nitro-flame)" />
              <path d="M125 88 L160 82 L140 94 Z" fill="url(#nitro-flame)" />
            </g>

            <!-- Velocímetro Digital Superior -->
            <rect x="290" y="30" width="85" height="32" rx="6" fill="#0f172a" stroke="#00f5d4" stroke-width="1.5" />
            <text x="332" y="52" font-family="monospace" font-weight="900" font-size="16" fill="#00f5d4" text-anchor="middle">320 KM/H</text>
          </svg>
        `;
      }
    },
    {
      id: 'reto_misterioso',
      name: 'Reto Misterioso',
      shortName: 'Reto Misterioso',
      badge: '🗝️ MISTERIO',
      icon: '🗝️',
      themeColor: '#4338ca',
      accentColor: '#eab308',
      gradient: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #ca8a04 100%)',
      description: 'Las preguntas esconden cartas secretas, cofres mágicos y pistas que se van desvelando con el paso de los segundos para cambiar el destino del juego.',
      config: {
        mysteryClues: true
      },
      renderIllustration() {
        return `
          <svg viewBox="0 0 400 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="bg-misterio" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0b0726" />
                <stop offset="50%" stop-color="#1e1b4b" />
                <stop offset="100%" stop-color="#312e81" />
              </linearGradient>
              <linearGradient id="chest-gold" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fef08a" />
                <stop offset="50%" stop-color="#eab308" />
                <stop offset="100%" stop-color="#854d0e" />
              </linearGradient>
              <filter id="chest-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="9" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>
            <rect width="400" height="240" rx="16" fill="url(#bg-misterio)" />

            <!-- Haz de luz mágica emanando del cofre -->
            <polygon points="200,60 110,0 290,0" fill="rgba(234, 179, 8, 0.25)" filter="url(#chest-glow)" />

            <!-- Cartas arcanas flotantes con signos de interrogación -->
            <g transform="translate(70, 75) rotate(-25)">
              <rect x="0" y="0" width="40" height="60" rx="6" fill="#1e1b4b" stroke="#eab308" stroke-width="2" />
              <text x="20" y="42" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#eab308" text-anchor="middle">?</text>
            </g>
            <g transform="translate(290, 65) rotate(20)">
              <rect x="0" y="0" width="40" height="60" rx="6" fill="#1e1b4b" stroke="#00f5d4" stroke-width="2" />
              <text x="20" y="42" font-family="'Outfit', sans-serif" font-weight="900" font-size="28" fill="#00f5d4" text-anchor="middle">★</text>
            </g>

            <!-- Cofre del Tesoro Arcano -->
            <g transform="translate(135, 75)" filter="url(#chest-glow)">
              <!-- Sombra -->
              <ellipse cx="65" cy="125" rx="65" ry="14" fill="rgba(0,0,0,0.6)" />

              <!-- Base de madera del cofre -->
              <rect x="15" y="65" width="100" height="50" rx="6" fill="#451a03" stroke="url(#chest-gold)" stroke-width="3" />
              <!-- Tapa entreabierta con luz dorada -->
              <path d="M10 65 L25 25 C65 15 65 15 105 25 L120 65 Z" fill="#78350f" stroke="url(#chest-gold)" stroke-width="3" />
              
              <!-- Resplandor interior del cofre -->
              <rect x="22" y="58" width="86" height="10" fill="#ffd166" filter="url(#chest-glow)" />

              <!-- Cerradura dorada con forma de ojo / bocallave -->
              <rect x="55" y="60" width="20" height="22" rx="4" fill="url(#chest-gold)" />
              <circle cx="65" cy="68" r="3.5" fill="#1e1b4b" />
              <polygon points="63,68 67,68 69,76 61,76" fill="#1e1b4b" />
            </g>

            <!-- Llave dorada flotante -->
            <g transform="translate(80, 160) rotate(45)">
              <circle cx="10" cy="10" r="8" fill="none" stroke="#eab308" stroke-width="3" />
              <line x1="18" y1="10" x2="38" y2="10" stroke="#eab308" stroke-width="3" stroke-linecap="round" />
              <line x1="32" y1="10" x2="32" y2="16" stroke="#eab308" stroke-width="2.5" />
              <line x1="38" y1="10" x2="38" y2="16" stroke="#eab308" stroke-width="2.5" />
            </g>

            <!-- Destellos dorados y amatista -->
            <circle cx="150" cy="40" r="3.5" fill="#ffd166" />
            <circle cx="260" cy="35" r="3" fill="#00f5d4" />
            <circle cx="210" cy="50" r="4" fill="#ffffff" />
          </svg>
        `;
      }
    }
  ],

  // Obtener un modo por su ID (con fallback al clásico)
  getMode(modeId) {
    if (!modeId) return this.modes[0];
    return this.modes.find(m => m.id === modeId) || this.modes[0];
  },

  // Genera el overlay especial para la pantalla del profesor en tiempo real
  renderHostQuestionOverlay(modeId, gameView) {
    const mode = this.getMode(modeId);
    if (!mode || mode.id === 'clasico') {
      return `
        <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(76,29,149,0.4), rgba(0,245,212,0.15)); border: 1px solid rgba(0,245,212,0.3); border-radius: 12px; padding: 0.5rem 1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span style="font-size: 1.2rem;">🏆</span>
            <span style="font-weight: 800; font-size: 0.88rem; color: #ffffff; letter-spacing: 0.5px;">MODO CLÁSICO</span>
          </div>
          <span style="font-size: 0.78rem; color: var(--neon-cyan); font-weight: 700;">Competición estándar en vivo</span>
        </div>
      `;
    }

    switch (mode.id) {
      case 'carrera_relampago':
        return `
          <div class="game-mode-host-banner mode-relampago-surge" style="background: linear-gradient(90deg, rgba(180,83,9,0.35), rgba(245,158,11,0.25)); border: 1px solid #ffd166; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="anim-pulse" style="font-size: 1.3rem;">⚡</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ffd166; letter-spacing: 0.5px;">CARRERA RELÁMPAGO</span>
                <span style="font-size: 0.75rem; color: #fef08a; display: block;">¡Responde en los primeros 5 segundos para Multiplicador x2 de Velocidad!</span>
              </div>
            </div>
            <div style="background: rgba(255,209,102,0.2); border: 1px solid #ffd166; padding: 0.25rem 0.65rem; border-radius: 9999px; font-weight: 900; font-size: 0.85rem; color: #ffd166;">
              BONUS ACTIVO ⚡
            </div>
          </div>
        `;

      case 'duelo_mental':
        const top1 = gameView.room?.players?.[0]?.nickname || 'Líder 1';
        const top2 = gameView.room?.players?.[1]?.nickname || 'Líder 2';
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(114,9,183,0.35), rgba(247,37,133,0.35)); border: 1px solid #f72585; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">⚔️</span>
              <span style="font-weight: 900; font-size: 0.9rem; color: #f72585; letter-spacing: 0.5px;">DUELO MENTAL 1 VS 1</span>
            </div>
            <div style="display: flex; align-items: center; gap: 0.6rem; font-weight: 800; font-size: 0.85rem;">
              <span style="color: var(--neon-cyan);">${top1}</span>
              <span style="color: #ffd166; font-style: italic;">VS</span>
              <span style="color: #f72585;">${top2}</span>
            </div>
          </div>
        `;

      case 'bomba_preguntas':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(239,68,68,0.3), rgba(249,115,22,0.25)); border: 1px solid #ef4444; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span class="anim-bounce" style="font-size: 1.3rem;">💣</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ef4444; letter-spacing: 0.5px;">BOMBA DE PREGUNTAS</span>
                <span style="font-size: 0.75rem; color: #fca5a5; display: block;">¡Responde antes de que la mecha se consuma o explotará!</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 1rem; color: #ffd166; animation: timer-pulse 0.8s infinite alternate;">⏳ TIC-TAC</span>
          </div>
        `;

      case 'conquista':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(37,99,235,0.35), rgba(16,185,129,0.3)); border: 1px solid #00f5d4; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🗺️</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #00f5d4; letter-spacing: 0.5px;">CONQUISTA TERRITORIAL</span>
                <span style="font-size: 0.75rem; color: #a7f3d0; display: block;">Zona en disputa: Sector Central • Quien acierte reclama el territorio</span>
              </div>
            </div>
            <div style="display: flex; gap: 0.35rem;">
              <span style="padding: 0.15rem 0.45rem; background: #10b981; border-radius: 4px; font-size: 0.72rem; font-weight: 800;">Norte ✓</span>
              <span style="padding: 0.15rem 0.45rem; background: #2563eb; border-radius: 4px; font-size: 0.72rem; font-weight: 800;">Sur ✓</span>
              <span style="padding: 0.15rem 0.45rem; background: #ffd166; color: #000; border-radius: 4px; font-size: 0.72rem; font-weight: 800;">Centro ⚔️</span>
            </div>
          </div>
        `;

      case 'tiro_perfecto':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(239,68,68,0.3), rgba(0,245,212,0.2)); border: 1px solid #ef4444; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🎯</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ef4444; letter-spacing: 0.5px;">TIRO PERFECTO</span>
                <span style="font-size: 0.75rem; color: #fca5a5; display: block;">¡Diana en la mira! Máxima precisión = +1000 Puntos</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #00f5d4; background: rgba(0,245,212,0.15); border: 1px solid #00f5d4; padding: 0.2rem 0.6rem; border-radius: 9999px;">BLANCO FIJADO</span>
          </div>
        `;

      case 'desafio_volcanico':
        const currentQ = (gameView.currentQuestionIndex || 0) + 1;
        const totalQ = gameView.challenge?.questions?.length || 1;
        const lavaPct = Math.min(100, Math.round((currentQ / totalQ) * 100));
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(124,45,18,0.4), rgba(220,38,38,0.3)); border: 1px solid #ea580c; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🌋</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ea580c; letter-spacing: 0.5px;">DESAFÍO VOLCÁNICO</span>
                <span style="font-size: 0.75rem; color: #fed7aa; display: block;">Ascenso al cráter • Nivel de magma: ${lavaPct}%</span>
              </div>
            </div>
            <div style="width: 120px; background: rgba(0,0,0,0.4); border-radius: 9999px; height: 10px; overflow: hidden; border: 1px solid #ea580c;">
              <div style="width: ${lavaPct}%; height: 100%; background: linear-gradient(90deg, #f97316, #ef4444); border-radius: 9999px;"></div>
            </div>
          </div>
        `;

      case 'rey_del_reto':
        const kingName = gameView.room?.players?.[0]?.nickname || 'Nadie aún';
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(88,28,135,0.4), rgba(245,158,11,0.3)); border: 1px solid #ffd700; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">👑</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ffd700; letter-spacing: 0.5px;">REY DEL RETO</span>
                <span style="font-size: 0.75rem; color: #fef08a; display: block;">¡El acierto más rápido se apodera de la corona dorada!</span>
              </div>
            </div>
            <div style="background: rgba(255,215,0,0.15); border: 1px solid #ffd700; padding: 0.2rem 0.75rem; border-radius: 9999px; font-weight: 900; font-size: 0.85rem; color: #ffd700;">
              👑 Rey Actual: ${kingName}
            </div>
          </div>
        `;

      case 'mision_espacial':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(30,27,75,0.5), rgba(99,102,241,0.3)); border: 1px solid #6366f1; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🚀</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #818cf8; letter-spacing: 0.5px;">MISIÓN ESPACIAL</span>
                <span style="font-size: 0.75rem; color: #c7d2fe; display: block;">Trayectoria Orbital: Rumbo a Marte • Cada acierto enciende los propulsores</span>
              </div>
            </div>
            <span style="font-size: 0.8rem; font-weight: 800; color: #00f5d4;">HIPERVELOCIDAD 🌌</span>
          </div>
        `;

      case 'rompecabezas':
        const piecesUnlocked = Math.min(6, (gameView.currentQuestionIndex || 0) + 1);
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(6,78,59,0.4), rgba(167,139,250,0.25)); border: 1px solid #06d6a0; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🧩</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #06d6a0; letter-spacing: 0.5px;">ROMPECABEZAS COLECTIVO</span>
                <span style="font-size: 0.75rem; color: #a7f3d0; display: block;">¡Descubriendo la ilustración misteriosa pieza por pieza!</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #a78bfa; background: rgba(167,139,250,0.15); border: 1px solid #a78bfa; padding: 0.2rem 0.65rem; border-radius: 8px;">
              PIEZAS: ${piecesUnlocked}/6
            </span>
          </div>
        `;

      case 'ultimo_superviviente':
        const activeSurvivors = gameView.room?.players?.length || 0;
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(136,19,55,0.4), rgba(244,63,94,0.25)); border: 1px solid #f43f5e; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🛡️</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #f43f5e; letter-spacing: 0.5px;">ÚLTIMO SUPERVIVIENTE</span>
                <span style="font-size: 0.75rem; color: #fecdd3; display: block;">¡Cuidado con los errores! Cada fallo resta una vida (❤️❤️❤️)</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #10b981; background: rgba(16,185,129,0.15); border: 1px solid #10b981; padding: 0.2rem 0.65rem; border-radius: 9999px;">
              ${activeSurvivors} En Pie
            </span>
          </div>
        `;

      case 'mundo_sorpresa':
        const surprises = ['¡Puntos Dobles x2!', '¡Velocidad Turbo!', '¡Ronda de Bonificación!', '¡Puntuación Invertida!'];
        const currentSurprise = surprises[(gameView.currentQuestionIndex || 0) % surprises.length];
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(112,26,117,0.4), rgba(236,72,153,0.3)); border: 1px solid #ec4899; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🌀</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ec4899; letter-spacing: 0.5px;">MUNDO SORPRESA</span>
                <span style="font-size: 0.75rem; color: #fbcfe8; display: block;">Modificador activo en esta ronda:</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #fbbf24; background: rgba(251,191,36,0.18); border: 1px solid #fbbf24; padding: 0.25rem 0.75rem; border-radius: 9999px;">
              ${currentSurprise}
            </span>
          </div>
        `;

      case 'turbo_quiz':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(124,29,6,0.4), rgba(255,84,0,0.3)); border: 1px solid #ff5400; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🏎️</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #ff5400; letter-spacing: 0.5px;">TURBO QUIZ NITRO</span>
                <span style="font-size: 0.75rem; color: #fed7aa; display: block;">¡Pisa el acelerador! Las respuestas consecutivas activan el nitro</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #00f5d4; background: rgba(0,245,212,0.15); border: 1px solid #00f5d4; padding: 0.2rem 0.65rem; border-radius: 9999px;">
              NITRO 280 KM/H 🚀
            </span>
          </div>
        `;

      case 'reto_misterioso':
        return `
          <div class="game-mode-host-banner" style="background: linear-gradient(90deg, rgba(30,27,75,0.4), rgba(67,56,202,0.3)); border: 1px solid #eab308; border-radius: 12px; padding: 0.55rem 1.1rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 0.6rem;">
              <span style="font-size: 1.3rem;">🗝️</span>
              <div>
                <span style="font-weight: 900; font-size: 0.9rem; color: #eab308; letter-spacing: 0.5px;">RETO MISTERIOSO</span>
                <span style="font-size: 0.75rem; color: #fef08a; display: block;">El cofre oculta secretos • ¡Atentos a los comodines revelados!</span>
              </div>
            </div>
            <span style="font-weight: 900; font-size: 0.85rem; color: #ffd166; background: rgba(234,179,8,0.15); border: 1px solid #eab308; padding: 0.2rem 0.65rem; border-radius: 9999px;">
              COFRE CERRADO 🔒
            </span>
          </div>
        `;

      default:
        return '';
    }
  },

  // Genera el overlay especial para la pantalla del alumno en su móvil
  renderPlayerQuestionOverlay(modeId, gameView) {
    const mode = this.getMode(modeId);
    if (!mode || mode.id === 'clasico') return '';

    let hint = '';
    if (modeId === 'tiro_perfecto') {
      hint = '🎯 ¡Al responder podrás lanzar tu dardo al blanco!';
    } else if (modeId === 'bomba_preguntas') {
      hint = '💣 ¡Desactiva la bomba antes de que explote!';
    } else if (modeId === 'reto_misterioso') {
      hint = '🗝️ ¡Cofre con gemas misteriosas activo!';
    } else if (modeId === 'turbo_quiz') {
      hint = '🏎️ ¡Inyección nitro supersónica disponible!';
    } else if (modeId === 'mision_espacial') {
      hint = '🚀 ¡Salto hiperespacial listo!';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; margin: 0.4rem auto; max-width: fit-content;">
        <div style="display: flex; align-items: center; gap: 0.4rem; padding: 0.35rem 0.85rem; background: rgba(0,0,0,0.45); border-radius: 9999px; border: 1.5px solid ${mode.accentColor || 'rgba(255,255,255,0.2)'}; font-size: 0.84rem; font-weight: 800; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
          <span>${mode.icon}</span>
          <span style="color: ${mode.themeColor};">${mode.name}</span>
          <span class="badge-tag" style="background: rgba(255,255,255,0.1); font-size: 0.72rem; padding: 0.15rem 0.45rem;">${mode.badge}</span>
        </div>
        ${hint ? `<div style="font-size: 0.76rem; color: #ffd166; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">${hint}</div>` : ''}
      </div>
    `;
  }
};
