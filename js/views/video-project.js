/**
 * 🎬 MENTIX - Vista y Reproductor Universal de Video Clases (video-project.js)
 * Soporta videos de todas las plataformas: YouTube, Google Drive, Vimeo, Dailymotion,
 * Loom, Dropbox y archivos de video directos (.mp4, .webm).
 * Incluye reproductor con capítulos, notas, debate y bypass inteligente para Error 153.
 */

window.VideoProjectView = {
  currentProject: null,
  isEditing: false,

  render(params = {}) {
    const container = document.getElementById('view-video');
    if (!container) return;

    if (params.edit) {
      this.isEditing = true;
      const proj = params.project || (params.id ? (window.appState.challenges || []).find(c => c.id === params.id) : null) || this.currentProject || this.createBlankVideoProject();
      this.currentProject = proj;
      this.renderEditor(container);
    } else {
      this.isEditing = false;
      const proj = params.project || (params.id ? window.appState.challenges.find(c => c.id === params.id) : null);
      if (!proj || !proj.videoUrl) {
        window.appRouter.navigate('projects');
        return;
      }
      this.currentProject = proj;
      this.renderPlayer(container);
    }
  },

  createBlankVideoProject() {
    return {
      id: 'proj_vid_' + Date.now(),
      title: '',
      description: '',
      projectType: 'video',
      videoUrl: '',
      duration: '',
      category: 'tecnologia',
      categoryName: 'Tecnología & Programación',
      author: window.appState.currentUser?.name || 'Profesor',
      authorAvatar: window.appState.currentUser?.avatar || '👨‍🏫',
      plays: 0,
      banner: '',
      difficulty: 'Medio',
      timePerQuestion: 20,
      summary: '',
      chapters: [],
      discussionQuestions: []
    };
  },

  /**
   * Analizador universal de fuentes de video.
   * Admite: YouTube, Google Drive, Vimeo, Dailymotion, Loom, Dropbox y MP4/WebM.
   */
  parseVideoSource(url) {
    if (!url) return { type: 'empty', url: '' };
    const trimmed = String(url).trim();

    // 1. Archivos directos de video (.mp4, .webm, .ogg, .mov)
    const cleanExt = trimmed.toLowerCase().split('?')[0];
    if (cleanExt.endsWith('.mp4') || cleanExt.endsWith('.webm') || cleanExt.endsWith('.ogg') || cleanExt.endsWith('.mov')) {
      return { type: 'direct', url: trimmed, platform: 'Archivo Directo (HTML5)' };
    }

    // 2. Dropbox (convertir dl=0 a raw=1 para reproducción directa)
    if (trimmed.includes('dropbox.com/')) {
      const directUrl = trimmed.replace('dl=0', 'raw=1').replace('?dl=1', '?raw=1');
      return { type: 'direct', url: directUrl, platform: 'Dropbox Video' };
    }

    // 3. Google Drive
    if (trimmed.includes('drive.google.com/')) {
      let fileId = '';
      const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        fileId = match[1];
      } else if (trimmed.includes('id=')) {
        fileId = trimmed.split('id=')[1].split('&')[0];
      }
      if (fileId) {
        return { 
          type: 'iframe', 
          url: `https://drive.google.com/file/d/${fileId}/preview`,
          platform: 'Google Drive'
        };
      }
    }

    // 4. Vimeo
    if (trimmed.includes('vimeo.com/')) {
      const match = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
      const vimeoId = match && match[3] ? match[3] : trimmed.split('/').pop().split('?')[0];
      if (vimeoId && !isNaN(vimeoId)) {
        return { 
          type: 'iframe', 
          url: `https://player.vimeo.com/video/${vimeoId}?autoplay=0`,
          platform: 'Vimeo'
        };
      }
    }

    // 5. Dailymotion
    if (trimmed.includes('dailymotion.com/video/') || trimmed.includes('dai.ly/')) {
      let dmId = '';
      if (trimmed.includes('dai.ly/')) {
        dmId = trimmed.split('dai.ly/')[1].split('?')[0];
      } else {
        dmId = trimmed.split('video/')[1].split('?')[0];
      }
      if (dmId) {
        return { 
          type: 'iframe', 
          url: `https://www.dailymotion.com/embed/video/${dmId}`,
          platform: 'Dailymotion'
        };
      }
    }

    // 6. Loom
    if (trimmed.includes('loom.com/')) {
      let loomId = '';
      if (trimmed.includes('/share/')) {
        loomId = trimmed.split('/share/')[1].split('?')[0];
      } else if (trimmed.includes('/embed/')) {
        loomId = trimmed.split('/embed/')[1].split('?')[0];
      }
      if (loomId) {
        return { 
          type: 'iframe', 
          url: `https://www.loom.com/embed/${loomId}`,
          platform: 'Loom Video'
        };
      }
    }

    // 7. YouTube
    let ytId = '';
    if (trimmed.includes('youtube.com/watch')) {
      const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
      if (match) ytId = match[1];
    } else if (trimmed.includes('youtu.be/')) {
      ytId = trimmed.split('youtu.be/')[1].split('?')[0].split('&')[0];
    } else if (trimmed.includes('youtube.com/embed/')) {
      ytId = trimmed.split('youtube.com/embed/')[1].split('?')[0].split('&')[0];
    } else if (trimmed.includes('youtube-nocookie.com/embed/')) {
      ytId = trimmed.split('youtube-nocookie.com/embed/')[1].split('?')[0].split('&')[0];
    } else if (trimmed.includes('youtube.com/shorts/')) {
      ytId = trimmed.split('youtube.com/shorts/')[1].split('?')[0].split('&')[0];
    }

    if (ytId) {
      return { 
        type: 'youtube', 
        id: ytId,
        url: trimmed,
        platform: 'YouTube',
        embedUrl: `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`
      };
    }

    // Genérico / otro embed
    return { type: 'iframe', url: trimmed, platform: 'Web Embed' };
  },

  renderPlayer(container) {
    const p = this.currentProject;
    const sourceInfo = this.parseVideoSource(p.videoUrl);
    const chapters = p.chapters || [];
    const questions = p.discussionQuestions || [];
    const isFileProto = window.location.protocol === 'file:';

    // Determinar la URL activa del embed
    let activeEmbedUrl = sourceInfo.embedUrl || sourceInfo.url;

    // Si se encuentra en protocolo de archivo local (file://), intentar sincronizar con servidor local
    if (isFileProto) {
      fetch('http://localhost:8080/index.html', { method: 'HEAD', cache: 'no-store' })
        .then(r => {
          if (r.ok) {
            window.location.replace('http://localhost:8080/#video');
          }
        })
        .catch(() => {});
    }

    container.innerHTML = `
      <div style="max-width: 1250px; margin: 0 auto; padding: 1.5rem 1rem 4rem;">
        
        <!-- Barra Superior de Navegación de la Video Clase -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')" style="padding: 0.45rem 0.85rem; font-size: 0.9rem;">
              <span>←</span> Volver a Proyectos
            </button>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
                <span class="badge-tag" style="background: rgba(239, 68, 68, 0.85); color: white;">🎬 VIDEO CLASE</span>
                <span class="badge-tag" style="background: rgba(0, 245, 212, 0.15); color: var(--neon-cyan);">${sourceInfo.platform || 'Video'}</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${p.categoryName || 'General'}</span>
                ${p.duration ? `<span class="badge-tag" style="background: rgba(0,0,0,0.5); color: white;">⏱️ ${this.escapeHtml(p.duration)}</span>` : ''}
              </div>
              <h2 style="font-size: 1.35rem; font-weight: 800; margin: 0.2rem 0 0; color: var(--text-primary);">
                ${this.escapeHtml(p.title)}
              </h2>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            ${p.videoUrl ? `
              <a 
                href="${p.videoUrl}" 
                target="_blank" 
                rel="noopener noreferrer" 
                class="btn btn-outline" 
                style="font-size: 0.85rem; padding: 0.45rem 0.85rem; border-color: #ef4444; color: #f87171; text-decoration: none; display: inline-flex; align-items: center; gap: 0.35rem;"
              >
                <span>↗</span> Abrir Enlace Original
              </a>
            ` : ''}
            <button class="btn btn-outline" onclick="window.VideoProjectView.openEditMode()" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;">
              <span>✏️</span> Editar Video Clase
            </button>
          </div>
        </div>

        <!-- Banner de modo local para file:// -->
        ${sourceInfo.type === 'youtube' && isFileProto ? `
          <div style="background: linear-gradient(135deg, rgba(0, 245, 212, 0.15), rgba(114, 9, 183, 0.25)); border: 1.5px solid var(--neon-cyan); border-radius: 14px; padding: 0.85rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <span style="font-size: 1.5rem;">⚡</span>
              <div>
                <div style="font-weight: 800; font-size: 0.92rem; color: #fff;">
                  Servidor local MENTIX activo y listo
                </div>
                <div style="font-size: 0.82rem; color: var(--text-secondary);">
                  Para reproducir los videos de YouTube directamente sin restricciones de archivo local:
                </div>
              </div>
            </div>
            <a href="http://localhost:8080/#video" class="btn btn-cyan" style="text-decoration: none; font-weight: 900; font-size: 0.88rem; padding: 0.5rem 1.15rem; display: inline-flex; align-items: center; gap: 0.4rem;">
              ▶ Abrir en MENTIX Web Local
            </a>
          </div>
        ` : ''}

        <!-- Layout Principal: Reproductor a la Izquierda y Capítulos / Apuntes a la Derecha -->
        <div style="display: grid; grid-template-columns: 1.65fr 1fr; gap: 1.75rem; align-items: start;">
          
          <!-- Columna Izquierda: Reproductor de Video y Resumen -->
          <div>
            
            <!-- Marco del Reproductor de Video -->
            <div class="glass-panel" style="padding: 0.5rem; border-radius: 18px; border: 2px solid rgba(239, 68, 68, 0.4); overflow: hidden; background: #000000; box-shadow: 0 15px 40px rgba(0,0,0,0.5); margin-bottom: 0.75rem;">
              <div id="yt-player-box" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 12px; background: #000;">
                
                ${sourceInfo.type === 'direct' ? `
                  <video 
                    id="main-video-element"
                    src="${sourceInfo.url}" 
                    controls 
                    autoplay
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: contain;"
                  ></video>
                ` : (sourceInfo.type === 'youtube' && isFileProto) ? `
                  <!-- Portada interactiva de YouTube idéntica a la vista oficial con botón rojo -->
                  <div 
                    onclick="window.VideoProjectView.playYouTubeVideo('${sourceInfo.id}', '${this.escapeHtml(p.title)}')"
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: pointer; background: #000; overflow: hidden; display: flex; align-items: center; justify-content: center;"
                    title="Haz clic para reproducir el video"
                  >
                    <img 
                      src="https://i.ytimg.com/vi/${sourceInfo.id}/maxresdefault.jpg" 
                      onerror="this.src='https://i.ytimg.com/vi/${sourceInfo.id}/hqdefault.jpg'" 
                      alt="${this.escapeHtml(p.title)}"
                      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.95; transition: transform 0.3s ease;"
                      onmouseenter="this.style.transform='scale(1.02)'"
                      onmouseleave="this.style.transform='scale(1)'"
                    />
                    
                    <!-- Barra superior degradada con avatar y título -->
                    <div style="position: absolute; top: 0; left: 0; right: 0; padding: 1rem 1.25rem; background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; gap: 0.75rem; pointer-events: none;">
                      <div style="width: 36px; height: 36px; border-radius: 50%; background: #ff0000; display: flex; align-items: center; justify-content: center; font-size: 1rem; color: #fff; font-weight: 900; box-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                        ▶
                      </div>
                      <div style="color: #ffffff; font-weight: 800; font-size: 0.95rem; text-shadow: 0 1px 4px rgba(0,0,0,0.9); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 80%;">
                        ${this.escapeHtml(p.title)}
                      </div>
                    </div>

                    <!-- Botón rojo oficial de YouTube en el centro -->
                    <div 
                      style="position: relative; z-index: 2; width: 72px; height: 50px; background: #ff0000; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 20px rgba(0,0,0,0.6); transition: transform 0.2s, background 0.2s;"
                      onmouseenter="this.style.transform='scale(1.12)'; this.style.background='#cc0000'"
                      onmouseleave="this.style.transform='scale(1)'; this.style.background='#ff0000'"
                    >
                      <div style="width: 0; height: 0; border-top: 11px solid transparent; border-bottom: 11px solid transparent; border-left: 19px solid white; margin-left: 4px;"></div>
                    </div>

                    <!-- Barra inferior con texto indicativo -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 0.75rem 1.25rem; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%); display: flex; align-items: center; justify-content: space-between; pointer-events: none;">
                      <span style="color: #ffffff; font-size: 0.85rem; font-weight: 700; text-shadow: 0 1px 3px rgba(0,0,0,0.8);">
                        ▶ Haz clic para reproducir
                      </span>
                      <span style="color: rgba(255,255,255,0.9); font-size: 0.8rem; font-weight: 700; background: rgba(0,0,0,0.6); padding: 0.2rem 0.55rem; border-radius: 6px;">
                        YouTube
                      </span>
                    </div>
                  </div>
                ` : `
                  <iframe 
                    id="main-video-iframe"
                    src="${activeEmbedUrl}" 
                    title="${this.escapeHtml(p.title)}"
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    referrerpolicy="strict-origin-when-cross-origin"
                    allowfullscreen
                    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                  ></iframe>
                `}

              </div>
            </div>

            <!-- Barra de accesibilidad del video -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; padding: 0.2rem 0.5rem; font-size: 0.82rem; color: var(--text-muted); flex-wrap: wrap; gap: 0.5rem;">
              <span>💡 Haz clic en los capítulos de la derecha para saltar al minuto exacto.</span>
            </div>

            <!-- Resumen y Descripción Pedagógica -->
            <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 0.6rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
                <span>📖</span> Resumen de la Clase
              </h3>
              <p style="font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; margin: 0;">
                ${this.escapeHtml(p.summary || p.description || 'Disfruta de esta lección audiovisual.')}
              </p>
            </div>

            <!-- Preguntas de Debate / Participación en Clase -->
            ${questions.length > 0 ? `
              <div class="glass-panel" style="padding: 1.5rem; border-color: rgba(0, 245, 212, 0.3);">
                <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 0.85rem; color: var(--neon-cyan); display: flex; align-items: center; gap: 0.5rem;">
                  <span>💬</span> Preguntas para el Debate de Clase
                </h3>
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                  ${questions.map((q, idx) => `
                    <div style="display: flex; align-items: flex-start; gap: 0.6rem; font-size: 0.95rem; color: var(--text-primary); line-height: 1.45;">
                      <span class="badge-tag" style="background: rgba(0,245,212,0.15); color: var(--neon-cyan); font-weight: 900;">${idx + 1}</span>
                      <span>${this.escapeHtml(q)}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

          </div>

          <!-- Columna Derecha: Capítulos y Marcas de Tiempo -->
          <div>
            <div class="glass-panel" style="padding: 1.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem;">
                <h3 style="font-size: 1.1rem; font-weight: 800; margin: 0; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem;">
                  <span>⏱️</span> Capítulos y Temas
                </h3>
                <span class="badge-tag" style="background: rgba(255,255,255,0.1); color: var(--text-muted); font-size: 0.75rem;">
                  ${chapters.length} secciones
                </span>
              </div>

              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                ${chapters.map((ch, idx) => `
                  <div 
                    onclick="window.VideoProjectView.jumpToTime('${ch.time}')"
                    style="padding: 0.85rem 1rem; border-radius: 12px; border: 1px solid var(--border-color); background: rgba(0,0,0,0.25); cursor: pointer; transition: var(--transition-bounce);"
                    onmouseenter="this.style.borderColor='var(--neon-cyan)'; this.style.transform='translateX(4px)'"
                    onmouseleave="this.style.borderColor='var(--border-color)'; this.style.transform='none'"
                  >
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem;">
                      <span style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary);">
                        ${this.escapeHtml(ch.title)}
                      </span>
                      <span class="badge-tag" style="background: rgba(239, 68, 68, 0.2); color: #f87171; font-weight: 800; font-size: 0.75rem;">
                        ${this.escapeHtml(ch.time)}
                      </span>
                    </div>
                    ${ch.summary ? `
                      <div style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.35;">
                        ${this.escapeHtml(ch.summary)}
                      </div>
                    ` : ''}
                  </div>
                `).join('')}
              </div>

              <!-- Ficha del Profesor Creador -->
              <div style="margin-top: 1.5rem; padding-top: 1.25rem; border-top: 1px solid var(--border-color); display: flex; align-items: center; gap: 0.75rem;">
                <span style="font-size: 1.8rem;">${p.authorAvatar || '👨‍🏫'}</span>
                <div>
                  <div style="font-size: 0.88rem; font-weight: 800; color: var(--text-primary);">${p.author || 'Profesor'}</div>
                  <div style="font-size: 0.78rem; color: var(--text-muted);">Docente Titular</div>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    `;
  },

  renderEditor(container) {
    const p = this.currentProject;
    const chapters = p.chapters || [];
    const questions = p.discussionQuestions || [];
    const detectedSource = this.parseVideoSource(p.videoUrl);

    container.innerHTML = `
      <div style="max-width: 1100px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header del Editor -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="badge-tag" style="background: rgba(239, 68, 68, 0.85); color: white;">EDITOR DE VIDEO CLASE</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Recurso Didáctico Audiovisual</span>
            </div>
            <h1 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: var(--text-primary);">
              Configurar Video Clase
            </h1>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.VideoProjectView.exitEditMode()">
              ✕ Cancelar
            </button>
            <button class="btn btn-cyan" onclick="window.VideoProjectView.saveAndWatch()" style="font-weight: 900;">
              💾 Guardar y Ver Video
            </button>
          </div>
        </div>

        <!-- Formulario Principal -->
        <div class="glass-panel" style="padding: 1.75rem; margin-bottom: 1.5rem;">
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Título de la Video Clase</label>
              <input 
                type="text" 
                value="${this.escapeHtml(p.title)}" 
                placeholder="Ej: Introducción a las Redes Neuronales y Machine Learning"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 1rem; outline: none;"
                oninput="window.VideoProjectView.currentProject.title = this.value"
              />
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Materia / Categoría</label>
              <select 
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                onchange="window.VideoProjectView.setCategory(this.value)"
              >
                ${(window.appState.categories || []).map(cat => `
                  <option value="${cat.id}" ${p.category === cat.id ? 'selected' : ''}>${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <!-- Campo de URL de Video Universal -->
          <div style="margin-bottom: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
              <label style="font-size: 0.85rem; font-weight: 800; color: var(--text-primary);">
                Enlace del Video (YouTube, Google Drive, Vimeo, Dailymotion, Loom, Dropbox o MP4)
              </label>
              <span id="detected-platform-badge" class="badge-tag" style="background: rgba(0, 245, 212, 0.15); color: var(--neon-cyan); font-weight: 800;">
                Plataforma: ${detectedSource.platform || 'Auto-detección'}
              </span>
            </div>

            <input 
              type="text" 
              id="video-url-input"
              value="${this.escapeHtml(p.videoUrl)}" 
              placeholder="Pega aquí cualquier enlace: https://youtu.be/... o Google Drive, Vimeo, MP4..."
              style="width: 100%; padding: 0.85rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.98rem; outline: none;"
              oninput="window.VideoProjectView.handleUrlInput(this.value)"
            />

            <!-- Guía de plataformas admitidas -->
            <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.65rem; font-size: 0.8rem; color: var(--text-muted);">
              <span>Formatos soportados:</span>
              <span class="badge-tag" style="background: rgba(239,68,68,0.15); color: #fca5a5;">🔴 YouTube</span>
              <span class="badge-tag" style="background: rgba(59,130,246,0.15); color: #93c5fd;">📁 Google Drive</span>
              <span class="badge-tag" style="background: rgba(14,165,233,0.15); color: #7dd3fc;">🟦 Vimeo</span>
              <span class="badge-tag" style="background: rgba(168,85,247,0.15); color: #d8b4fe;">📹 Loom</span>
              <span class="badge-tag" style="background: rgba(34,197,94,0.15); color: #86efac;">🎬 MP4 / WebM directo</span>
              <span class="badge-tag" style="background: rgba(245,158,11,0.15); color: #fde68a;">📦 Dropbox</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Duración Estimada</label>
              <input 
                type="text" 
                value="${this.escapeHtml(p.duration || '10:00 min')}" 
                placeholder="Ej: 15:30 min"
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                oninput="window.VideoProjectView.currentProject.duration = this.value"
              />
            </div>
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Imagen de Portada (Banner opcional)</label>
              <input 
                type="text" 
                value="${this.escapeHtml(p.banner || '')}" 
                placeholder="https://images.unsplash.com/..."
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                oninput="window.VideoProjectView.currentProject.banner = this.value"
              />
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Resumen de la Lección</label>
            <textarea 
              rows="3" 
              placeholder="Explica a los estudiantes qué conceptos aprenderán en este video..."
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
              oninput="window.VideoProjectView.currentProject.summary = this.value"
            >${this.escapeHtml(p.summary || '')}</textarea>
          </div>

          <div>
            <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">
              Preguntas de Reflexión / Debate (Una por línea)
            </label>
            <textarea 
              rows="3" 
              placeholder="¿Qué fue lo más interesante del video?&#10;¿Cómo aplicarías este conocimiento?"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
              oninput="window.VideoProjectView.updateDiscussionQuestions(this.value)"
            >${this.escapeHtml(questions.join('\n'))}</textarea>
          </div>
        </div>

        <!-- Capítulos / Marcas de Tiempo -->
        <div class="glass-panel" style="padding: 1.75rem;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem;">
            <div>
              <h3 style="font-size: 1.15rem; font-weight: 800; margin: 0 0 0.2rem; color: var(--text-primary);">
                Capítulos y Marcas de Tiempo
              </h3>
              <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0;">Permite a los estudiantes saltar rápidamente a partes específicas del video.</p>
            </div>
            <button class="btn btn-cyan" onclick="window.VideoProjectView.addChapter()" style="font-size: 0.85rem; font-weight: 800;">
              + Añadir Capítulo
            </button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            ${chapters.length === 0 ? `
              <div style="text-align: center; padding: 1.5rem 1rem; color: var(--text-muted); font-size: 0.88rem; border: 1.5px dashed var(--border-color); border-radius: 10px;">
                No hay capítulos agregados aún. Haz clic en "+ Añadir Capítulo" si deseas saltar a partes específicas del video.
              </div>
            ` : chapters.map((ch, idx) => `
              <div style="display: grid; grid-template-columns: 110px 1.5fr 2fr 40px; gap: 0.75rem; align-items: center; background: rgba(0,0,0,0.25); padding: 0.75rem; border-radius: 10px; border: 1px solid var(--border-color);">
                <input 
                  type="text" 
                  value="${this.escapeHtml(ch.time)}" 
                  placeholder="0:00"
                  style="padding: 0.5rem 0.6rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: var(--neon-cyan); font-weight: 800; font-size: 0.85rem; text-align: center; outline: none;"
                  oninput="window.VideoProjectView.updateChapterField(${idx}, 'time', this.value)"
                />
                <input 
                  type="text" 
                  value="${this.escapeHtml(ch.title)}" 
                  placeholder="Título del tema"
                  style="padding: 0.5rem 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.88rem; outline: none;"
                  oninput="window.VideoProjectView.updateChapterField(${idx}, 'title', this.value)"
                />
                <input 
                  type="text" 
                  value="${this.escapeHtml(ch.summary || '')}" 
                  placeholder="Descripción breve..."
                  style="padding: 0.5rem 0.75rem; border-radius: 8px; background: rgba(0,0,0,0.4); border: 1px solid var(--border-color); color: var(--text-secondary); font-size: 0.85rem; outline: none;"
                  oninput="window.VideoProjectView.updateChapterField(${idx}, 'summary', this.value)"
                />
                <button 
                  class="btn btn-danger" 
                  style="width: 32px; height: 32px; padding: 0; font-size: 0.8rem; border-radius: 8px;" 
                  onclick="window.VideoProjectView.removeChapter(${idx})"
                  title="Eliminar capítulo"
                >
                  ✕
                </button>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    `;
  },

  handleUrlInput(val) {
    this.currentProject.videoUrl = val;
    const source = this.parseVideoSource(val);
    const badge = document.getElementById('detected-platform-badge');
    if (badge) {
      badge.textContent = `Plataforma: ${source.platform || 'Enlace genérico'}`;
    }
  },

  jumpToTime(timeStr) {
    const parts = timeStr.split(':').map(Number);
    let seconds = 0;
    if (parts.length === 2) {
      seconds = (parts[0] * 60) + parts[1];
    } else if (parts.length === 3) {
      seconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    }

    const videoEl = document.getElementById('main-video-element');
    if (videoEl) {
      videoEl.currentTime = seconds;
      videoEl.play?.();
      return;
    }

    const iframe = document.getElementById('main-video-iframe');
    if (iframe) {
      const sourceInfo = this.parseVideoSource(this.currentProject?.videoUrl);
      let base = sourceInfo.embedUrl || sourceInfo.url;
      if (base) {
        const sep = base.includes('?') ? '&' : '?';
        iframe.src = `${base}${sep}start=${seconds}&autoplay=1`;
      }
    }
  },

  setCategory(catId) {
    const cat = (window.appState.categories || []).find(c => c.id === catId);
    if (cat) {
      this.currentProject.category = cat.id;
      this.currentProject.categoryName = cat.name;
    }
  },

  updateDiscussionQuestions(text) {
    this.currentProject.discussionQuestions = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
  },

  addChapter() {
    if (!this.currentProject.chapters) this.currentProject.chapters = [];
    this.currentProject.chapters.push({
      time: '0:00',
      title: 'Nuevo Tema',
      summary: ''
    });
    this.renderEditor(document.getElementById('view-video'));
  },

  removeChapter(idx) {
    this.currentProject.chapters.splice(idx, 1);
    this.renderEditor(document.getElementById('view-video'));
  },

  updateChapterField(idx, field, val) {
    if (!this.currentProject.chapters[idx]) return;
    this.currentProject.chapters[idx][field] = val;
  },

  openEditMode() {
    this.isEditing = true;
    this.renderEditor(document.getElementById('view-video'));
  },

  exitEditMode() {
    this.isEditing = false;
    const exists = window.appState.challenges && window.appState.challenges.some(c => c.id === this.currentProject?.id);
    if (!exists || !this.currentProject?.videoUrl) {
      window.appRouter.navigate('projects');
      return;
    }
    this.renderPlayer(document.getElementById('view-video'));
  },

  saveAndWatch() {
    const p = this.currentProject;
    if (!p.title || !p.title.trim()) {
      alert('Ingresa un título para la video clase.');
      return;
    }
    if (!p.videoUrl || !p.videoUrl.trim()) {
      alert('Ingresa un enlace válido de video (YouTube, Google Drive, Vimeo, MP4, etc.).');
      return;
    }

    const u = window.appState.currentUser;
    p.author = p.author || u?.name || 'Docente';
    p.authorAvatar = p.authorAvatar || u?.avatar || '👨‍🏫';
    p.authorId = p.authorId || u?.id || ('user_' + (u?.email || u?.name || 'anon'));
    p.authorEmail = p.authorEmail || u?.email || '';

    const existingIndex = window.appState.challenges.findIndex(c => c.id === p.id);
    if (existingIndex >= 0) {
      window.appState.challenges[existingIndex] = p;
    } else {
      window.appState.challenges.unshift(p);
    }

    saveGlobalState(window.appState);
    if (window.appRouter && window.appRouter.pushChallengeToCloud) {
      window.appRouter.pushChallengeToCloud(p);
    }
    alert('✅ ¡Video clase guardada exitosamente!');
    this.isEditing = false;
    this.renderPlayer(document.getElementById('view-video'));
  },

  playYouTubeVideo(ytId, title) {
    if (window.soundEngine) window.soundEngine.playClick();
    if (window.location.protocol === 'file:') {
      // Redirigir directamente al servidor local donde YouTube corre oficial y sin errores
      window.location.href = 'http://localhost:8080/#video';
      return;
    }
    const box = document.getElementById('yt-player-box');
    if (box) {
      box.innerHTML = `
        <iframe 
          id="main-video-iframe"
          src="https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1" 
          title="${this.escapeHtml(title || 'Video')}"
          frameborder="0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
        ></iframe>
      `;
    }
  },

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
