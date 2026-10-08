/**
 * 📊 MENTIX - Vista y Visor de Presentaciones de Diapositivas (presentation.js)
 * Permite presentar diapositivas interactivas en clase (pantalla completa, notas de docente,
 * navegación por flechas y miniaturas) y editar o crear nuevas presentaciones.
 */

window.PresentationView = {
  currentProject: null,
  currentSlideIndex: 0,
  isEditing: false,
  showTeacherNotes: false,
  showThemesPicker: false,
  keyboardHandlerAttached: false,

  SLIDE_THEMES: [
    {
      id: 'cosmos',
      name: 'Cosmos Neón',
      icon: '🌌',
      bg: 'linear-gradient(135deg, #0b091a 0%, #171033 50%, #200f40 100%)',
      titleColor: '#ffffff',
      subtitleColor: '#00f5d4',
      contentColor: '#cbd5e1',
      bulletsColor: '#f1f5f9'
    },
    {
      id: 'cyberpunk',
      name: 'Cyberpunk Magenta',
      icon: '⚡',
      bg: 'linear-gradient(135deg, #0f051d 0%, #290833 50%, #15002b 100%)',
      titleColor: '#ff007f',
      subtitleColor: '#00f0ff',
      contentColor: '#f5d0fe',
      bulletsColor: '#ffffff'
    },
    {
      id: 'esmeralda',
      name: 'Selva Esmeralda',
      icon: '🌿',
      bg: 'linear-gradient(135deg, #041f17 0%, #06382b 50%, #021a13 100%)',
      titleColor: '#34d399',
      subtitleColor: '#fbbf24',
      contentColor: '#d1fae5',
      bulletsColor: '#f3f4f6'
    },
    {
      id: 'atardecer',
      name: 'Atardecer Dorado',
      icon: '🌅',
      bg: 'linear-gradient(135deg, #2b0e1e 0%, #4a1525 50%, #682312 100%)',
      titleColor: '#fbbf24',
      subtitleColor: '#fb7185',
      contentColor: '#fed7aa',
      bulletsColor: '#fffbeb'
    },
    {
      id: 'obsidiana',
      name: 'Obsidiana Minimalista',
      icon: '🖤',
      bg: 'linear-gradient(135deg, #0a0a0c 0%, #141418 50%, #070709 100%)',
      titleColor: '#f8fafc',
      subtitleColor: '#94a3b8',
      contentColor: '#cbd5e1',
      bulletsColor: '#e2e8f0'
    },
    {
      id: 'oceano',
      name: 'Océano Abisal',
      icon: '🌊',
      bg: 'linear-gradient(135deg, #05162a 0%, #08294d 50%, #041224 100%)',
      titleColor: '#38bdf8',
      subtitleColor: '#2dd4bf',
      contentColor: '#bae6fd',
      bulletsColor: '#f0f9ff'
    },
    {
      id: 'volcan',
      name: 'Volcán Carmesí',
      icon: '🌋',
      bg: 'linear-gradient(135deg, #2a0808 0%, #450a0a 50%, #1f0505 100%)',
      titleColor: '#f87171',
      subtitleColor: '#fb923c',
      contentColor: '#fecaca',
      bulletsColor: '#fff1f2'
    },
    {
      id: 'pizarra',
      name: 'Pizarra Escolar',
      icon: '🎓',
      bg: 'linear-gradient(135deg, #10261e 0%, #17382d 50%, #0c1c16 100%)',
      titleColor: '#fef08a',
      subtitleColor: '#86efac',
      contentColor: '#f1f5f9',
      bulletsColor: '#ffffff'
    },
    {
      id: 'pergamino',
      name: 'Pergamino & Café',
      icon: '☕',
      bg: 'linear-gradient(135deg, #231710 0%, #362216 50%, #1a110a 100%)',
      titleColor: '#fcd34d',
      subtitleColor: '#fdba74',
      contentColor: '#fed7aa',
      bulletsColor: '#fef3c7'
    },
    {
      id: 'glaciar',
      name: 'Glaciar Ártico',
      icon: '🧊',
      bg: 'linear-gradient(135deg, #0c1e28 0%, #133345 50%, #091720 100%)',
      titleColor: '#7dd3fc',
      subtitleColor: '#a5f3fc',
      contentColor: '#e0f2fe',
      bulletsColor: '#ffffff'
    },
    {
      id: 'amatista',
      name: 'Amatista Real',
      icon: '🔮',
      bg: 'linear-gradient(135deg, #1b0a2a 0%, #2e1047 50%, #140620 100%)',
      titleColor: '#c084fc',
      subtitleColor: '#f472b6',
      contentColor: '#f3e8ff',
      bulletsColor: '#faf5ff'
    },
    {
      id: 'ambar',
      name: 'Miel y Ámbar',
      icon: '☀️',
      bg: 'linear-gradient(135deg, #271a06 0%, #3d2808 50%, #1c1203 100%)',
      titleColor: '#f59e0b',
      subtitleColor: '#fde047',
      contentColor: '#fef3c7',
      bulletsColor: '#ffffff'
    },
    {
      id: 'menta',
      name: 'Menta & Neón',
      icon: '🍃',
      bg: 'linear-gradient(135deg, #062224 0%, #0b383b 50%, #041719 100%)',
      titleColor: '#2dd4bf',
      subtitleColor: '#a7f3d0',
      contentColor: '#ccfbf1',
      bulletsColor: '#f0fdfa'
    },
    {
      id: 'zafiro',
      name: 'Zafiro & Plata',
      icon: '💎',
      bg: 'linear-gradient(135deg, #0c153b 0%, #15245c 50%, #080f2d 100%)',
      titleColor: '#93c5fd',
      subtitleColor: '#e2e8f0',
      contentColor: '#dbeafe',
      bulletsColor: '#ffffff'
    },
    {
      id: 'sakura',
      name: 'Cerezo Sakura',
      icon: '🌸',
      bg: 'linear-gradient(135deg, #2b0c1e 0%, #40122e 50%, #200716 100%)',
      titleColor: '#f472b6',
      subtitleColor: '#fbcfe8',
      contentColor: '#fce7f3',
      bulletsColor: '#ffffff'
    }
  ],

  SLIDE_FONTS: [
    { id: 'Outfit', name: 'Outfit (Moderna)', family: "'Outfit', sans-serif" },
    { id: 'Montserrat', name: 'Montserrat (Titular)', family: "'Montserrat', sans-serif" },
    { id: 'Poppins', name: 'Poppins (Amigable)', family: "'Poppins', sans-serif" },
    { id: 'Playfair Display', name: 'Playfair (Elegante Serif)', family: "'Playfair Display', serif" },
    { id: 'Cinzel', name: 'Cinzel (Imperial)', family: "'Cinzel', serif" },
    { id: 'Bebas Neue', name: 'Bebas Neue (Impacto)', family: "'Bebas Neue', sans-serif" },
    { id: 'Anton', name: 'Anton (Cartel Grueso)', family: "'Anton', sans-serif" },
    { id: 'Righteous', name: 'Righteous (Retro Futurista)', family: "'Righteous', cursive" },
    { id: 'Orbitron', name: 'Orbitron (Sci-Fi Cyber)', family: "'Orbitron', sans-serif" },
    { id: 'Press Start 2P', name: 'Press Start (Pixel Gamer)', family: "'Press Start 2P', monospace" },
    { id: 'Pacifico', name: 'Pacifico (Cursiva)', family: "'Pacifico', cursive" },
    { id: 'Caveat', name: 'Caveat (Manuscrita Pizarra)', family: "'Caveat', cursive" },
    { id: 'Comfortaa', name: 'Comfortaa (Redondeada)', family: "'Comfortaa', cursive" },
    { id: 'Lobster', name: 'Lobster (Vintage)', family: "'Lobster', cursive" },
    { id: 'Merriweather', name: 'Merriweather (Académica)', family: "'Merriweather', serif" },
    { id: 'Chewy', name: 'Chewy (Divertida & Cómica)', family: "'Chewy', cursive" },
    { id: 'Archivo Black', name: 'Archivo Black (Ultra Negrita)', family: "'Archivo Black', sans-serif" },
    { id: 'Gagalin', name: 'GAGALIN (Cómic Rústico)', family: "'Gagalin', sans-serif" }
  ],

  BULLET_TYPES: [
    { id: '✦', name: '✦ Destello Neón', icon: '✦' },
    { id: '•', name: '• Punto Clásico', icon: '•' },
    { id: '➤', name: '➤ Flecha Dinámica', icon: '➤' },
    { id: '✔', name: '✔ Check Verificado', icon: '✔' },
    { id: '◆', name: '◆ Rombo Elegante', icon: '◆' },
    { id: '⚡', name: '⚡ Rayo de Energía', icon: '⚡' },
    { id: 'custom', name: '😀 Emoji Personalizado...', icon: '😀' }
  ],

  QUICK_EMOJIS: ['🎯', '🚀', '💡', '🔥', '⭐', '🐾', '🏆', '📌', '🧠', '✨', '👑', '🎉'],

  render(params = {}) {
    const container = document.getElementById('view-presentation');
    if (!container) return;

    if (params.edit) {
      this.isEditing = true;
      const proj = params.project || (params.id ? (window.appState.challenges || []).find(c => c.id === params.id) : null) || this.currentProject || this.createBlankPresentation();
      this.currentProject = proj;
      this.currentSlideIndex = params.slideIndex || 0;
      this.renderEditor(container);
    } else {
      this.isEditing = false;
      const proj = params.project || (params.id ? (window.appState.challenges || []).find(c => c.id === params.id) : null);
      if (!proj) {
        window.appRouter.navigate('projects');
        return;
      }
      this.currentProject = proj;
      this.currentSlideIndex = params.slideIndex || 0;
      this.renderViewer(container);
      this.attachKeyboardNav();
    }
  },

  createBlankPresentation() {
    return {
      id: 'proj_pres_' + Date.now(),
      title: '',
      description: '',
      projectType: 'presentation',
      category: (window.appState.categories && window.appState.categories[0]) ? window.appState.categories[0].id : '',
      categoryName: (window.appState.categories && window.appState.categories[0]) ? window.appState.categories[0].name : 'General',
      author: window.appState.currentUser?.name || 'Profesor',
      authorAvatar: window.appState.currentUser?.avatar || '👨‍🏫',
      plays: 0,
      banner: '',
      difficulty: 'Medio',
      timePerQuestion: 25,
      slides: [
        {
          id: 'slide_1',
          title: '',
          subtitle: '',
          content: '',
          bullets: [],
          media: '',
          videoUrl: '',
          layout: 'split',
          teacherNotes: ''
        }
      ]
    };
  },

  /**
   * Analizador universal de videos para diapositivas.
   * Soporta YouTube, Vimeo, Google Drive, Loom, Dailymotion y archivos directos (.mp4, .webm).
   */
  parseVideoSource(url) {
    if (!url) return null;
    let trimmed = String(url).trim();
    if (!trimmed) return null;

    // Si pegaron un iframe completo, extraer src
    if (trimmed.includes('<iframe') && trimmed.includes('src=')) {
      const match = trimmed.match(/src=["']([^"']+)["']/i);
      if (match && match[1]) trimmed = match[1].trim();
    }

    // 1. Archivos directos (.mp4, .webm, .ogg, .mov)
    const cleanExt = trimmed.toLowerCase().split('?')[0];
    if (cleanExt.endsWith('.mp4') || cleanExt.endsWith('.webm') || cleanExt.endsWith('.ogg') || cleanExt.endsWith('.mov')) {
      return { type: 'direct', url: trimmed, platform: 'Video Directo (MP4)' };
    }

    // 2. Dropbox
    if (trimmed.includes('dropbox.com/')) {
      const directUrl = trimmed.replace('dl=0', 'raw=1').replace('?dl=1', '?raw=1');
      return { type: 'direct', url: directUrl, platform: 'Dropbox' };
    }

    // 3. Google Drive
    if (trimmed.includes('drive.google.com/')) {
      let fileId = '';
      const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) fileId = match[1];
      else if (trimmed.includes('id=')) fileId = trimmed.split('id=')[1].split('&')[0];
      if (fileId) {
        return { type: 'iframe', url: `https://drive.google.com/file/d/${fileId}/preview`, platform: 'Google Drive' };
      }
    }

    // 4. Vimeo
    if (trimmed.includes('vimeo.com/')) {
      const match = trimmed.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|video\/|)(\d+)/);
      const vimeoId = match && match[3] ? match[3] : trimmed.split('/').pop().split('?')[0];
      if (vimeoId && !isNaN(vimeoId)) {
        return { type: 'iframe', url: `https://player.vimeo.com/video/${vimeoId}?autoplay=0`, platform: 'Vimeo' };
      }
    }

    // 5. Dailymotion
    if (trimmed.includes('dailymotion.com/video/') || trimmed.includes('dai.ly/')) {
      const dmId = trimmed.includes('dai.ly/') ? trimmed.split('dai.ly/')[1].split('?')[0] : trimmed.split('video/')[1].split('?')[0];
      if (dmId) return { type: 'iframe', url: `https://www.dailymotion.com/embed/video/${dmId}`, platform: 'Dailymotion' };
    }

    // 6. Loom
    if (trimmed.includes('loom.com/')) {
      let loomId = '';
      if (trimmed.includes('/share/')) loomId = trimmed.split('/share/')[1].split('?')[0];
      else if (trimmed.includes('/embed/')) loomId = trimmed.split('/embed/')[1].split('?')[0];
      if (loomId) return { type: 'iframe', url: `https://www.loom.com/embed/${loomId}`, platform: 'Loom' };
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
        type: 'iframe', 
        url: `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`, 
        platform: 'YouTube' 
      };
    }

    // Fallback general (iframe)
    return { type: 'iframe', url: trimmed, platform: 'Video Web' };
  },

  /**
   * Genera el HTML del reproductor de video adaptativo
   */
  renderVideoPlayerHtml(parsed, extraStyle = '') {
    if (!parsed || !parsed.url) {
      return `
        <div style="background: rgba(0,0,0,0.5); border: 2px dashed rgba(239, 68, 68, 0.4); border-radius: 18px; padding: 2.5rem 1.5rem; text-align: center; color: var(--text-secondary); width: 100%;">
          <div style="font-size: 2.8rem; margin-bottom: 0.5rem;">🎬</div>
          <div style="font-weight: 800; color: #fca5a5; font-size: 1.05rem;">Video Explicativo</div>
          <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 0.25rem;">Ingresa una URL válida de YouTube, Drive, Vimeo o MP4</div>
        </div>
      `;
    }

    if (parsed.type === 'direct') {
      return `
        <video 
          controls 
          playsinline 
          src="${parsed.url}" 
          style="width: 100%; max-height: calc(100vh - 260px); min-height: 280px; border-radius: 18px; border: 2px solid rgba(255,255,255,0.22); box-shadow: 0 15px 45px rgba(0,0,0,0.7); background: #000000; object-fit: contain; ${extraStyle}"
        ></video>
      `;
    }

    return `
      <div style="position: relative; width: 100%; aspect-ratio: 16 / 9; max-height: calc(100vh - 260px); min-height: 280px; border-radius: 18px; overflow: hidden; border: 2px solid rgba(255,255,255,0.22); box-shadow: 0 15px 45px rgba(0,0,0,0.7); background: #000000; ${extraStyle}">
        <iframe 
          src="${parsed.url}" 
          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
          allowfullscreen
        ></iframe>
      </div>
    `;
  },

  renderViewer(container) {
    const p = this.currentProject;
    const slides = p.slides && p.slides.length > 0 ? p.slides : [
      {
        id: 's_default',
        title: p.title || 'Presentación',
        subtitle: p.description || '',
        content: 'No hay diapositivas registradas todavía en esta presentación.',
        bullets: [],
        media: p.banner || '',
        teacherNotes: ''
      }
    ];

    if (this.currentSlideIndex >= slides.length) this.currentSlideIndex = 0;
    if (this.currentSlideIndex < 0) this.currentSlideIndex = slides.length - 1;

    const currentSlide = slides[this.currentSlideIndex];
    const progressPct = ((this.currentSlideIndex + 1) / slides.length) * 100;

    // Determinar si es una Lámina en Pantalla Completa, Video Explicativo o Diapositiva Dividida
    const isVideoMode = currentSlide.layout === 'video' || Boolean(currentSlide.videoUrl && currentSlide.layout !== 'split' && currentSlide.layout !== 'full');
    const isImportedOrFull = Boolean(
      (currentSlide.layout === 'full' && !isVideoMode) ||
      currentSlide.isImported ||
      p.isImported ||
      currentSlide.isFullImage ||
      (currentSlide.media && currentSlide.media.startsWith('data:image/'))
    );

    const isSplitMode = currentSlide.layout === 'split' || isVideoMode || (!isImportedOrFull && (
      (currentSlide.content && currentSlide.content.trim()) ||
      (currentSlide.bullets && currentSlide.bullets.length > 0) ||
      (currentSlide.subtitle && currentSlide.subtitle.trim())
    ));

    const isPureVisualSlide = Boolean(currentSlide.media && !isSplitMode && !isVideoMode && currentSlide.layout === 'full');
    const slideBg = currentSlide.bgColor || 'linear-gradient(135deg, rgba(20, 15, 38, 0.96), rgba(10, 12, 24, 0.98))';

    // Si el canvas ya existe en pantalla, actualizar in-place sin destruir el nodo DOM.
    // Esto es fundamental: evita que el navegador salga de Pantalla Completa al pasar de diapositiva.
    const existingCanvas = document.getElementById('presentation-slide-canvas');
    if (existingCanvas && container && container.contains(existingCanvas)) {
      existingCanvas.style.background = isPureVisualSlide ? '#000000' : slideBg;
      existingCanvas.innerHTML = this.renderSlideCanvasInner(currentSlide, slides, isPureVisualSlide, slideBg);

      const pBar = document.getElementById('presentation-progress-bar');
      if (pBar) pBar.style.width = `${progressPct}%`;

      const thumbStrip = document.getElementById('presentation-thumb-strip');
      if (thumbStrip) thumbStrip.innerHTML = this.renderThumbnailsHtml(slides);
      return;
    }

    container.innerHTML = `
      <div style="max-width: 1300px; margin: 0 auto; padding: 1.5rem 1rem 4rem;">
        
        <!-- Barra Superior de Navegación de la Presentación -->
        <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1.25rem;">
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <button class="btn btn-outline" onclick="window.appRouter.navigate('projects')" style="padding: 0.45rem 0.85rem; font-size: 0.9rem;">
              <span>←</span> Volver a Proyectos
            </button>
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span class="badge-tag" style="background: rgba(124, 58, 237, 0.8); color: white;">📊 DIAPOSITIVAS</span>
                <span style="font-size: 0.85rem; color: var(--text-muted);">${p.categoryName || 'General'}</span>
              </div>
              <h2 style="font-size: 1.25rem; font-weight: 800; margin: 0.2rem 0 0; color: var(--text-primary);">
                ${this.escapeHtml(p.title)}
              </h2>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 0.6rem;">
            <button class="btn btn-outline" onclick="window.PresentationView.toggleTeacherNotes()" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;">
              <span>📝</span> ${this.showTeacherNotes ? 'Ocultar Notas' : 'Notas Docente'}
            </button>
            <button class="btn btn-outline" onclick="window.PresentationView.openEditMode()" style="font-size: 0.85rem; padding: 0.45rem 0.85rem;">
              <span>✏️</span> Editar Diapositivas
            </button>
            <button class="btn btn-cyan" onclick="window.PresentationView.toggleFullscreen()" style="font-size: 0.85rem; padding: 0.45rem 0.95rem; font-weight: 800;">
              <span>⛶</span> Pantalla Completa
            </button>
          </div>
        </div>

        <!-- Barra de Progreso de Diapositivas -->
        <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 9999px; overflow: hidden; margin-bottom: 1.25rem;">
          <div id="presentation-progress-bar" style="height: 100%; width: ${progressPct}%; background: linear-gradient(90deg, #7c3aed, var(--neon-cyan)); transition: width 0.3s ease;"></div>
        </div>

        <!-- Canvas Principal de la Diapositiva (16:9 Estilo Proyector / Pantalla) -->
        <div id="presentation-slide-canvas" class="glass-panel" style="border: 2px solid rgba(124, 58, 237, 0.4); border-radius: 20px; overflow: hidden; min-height: 540px; display: flex; flex-direction: column; position: relative; background: ${isPureVisualSlide ? '#000000' : slideBg}; box-shadow: 0 15px 40px rgba(0,0,0,0.6);">
          ${this.renderSlideCanvasInner(currentSlide, slides, isPureVisualSlide, slideBg)}
        </div>

        <!-- Tira de Miniaturas Inferiores para Salto Rápido -->
        <div id="presentation-thumb-strip" style="margin-top: 1.5rem; display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem;">
          ${this.renderThumbnailsHtml(slides)}
        </div>

      </div>
    `;
  },

  renderSlideCanvasInner(currentSlide, slides, isPureVisualSlide, slideBg) {
    const isVideoSlide = (currentSlide.layout === 'video') || Boolean(currentSlide.videoUrl && currentSlide.layout !== 'split' && currentSlide.layout !== 'full');
    const hasMedia = Boolean(isVideoSlide ? (currentSlide.videoUrl || currentSlide.media) : currentSlide.media);

    return `
      ${isPureVisualSlide ? `
        <!-- Diapositiva Visual en Toda la Pantalla (Lámina de PDF/Canva completa) -->
        <div 
          class="full-slide-img-container" 
          onclick="window.PresentationView.handleSlideCanvasClick(event)"
          style="flex: 1; width: 100%; min-height: 520px; display: flex; align-items: center; justify-content: center; background: #000000; position: relative; overflow: hidden; cursor: pointer;"
          title="Haz clic a la derecha para avanzar, o a la izquierda para retroceder"
        >
          <img 
            src="${currentSlide.media}" 
            alt="${this.escapeHtml(currentSlide.title || 'Diapositiva ' + (this.currentSlideIndex + 1))}" 
            class="full-slide-img"
            style="width: 100%; height: 100%; max-height: calc(100vh - 210px); min-height: 500px; object-fit: contain; display: block; margin: 0 auto;"
          />
        </div>
      ` : `
        <!-- Diapositiva con Textos (y opcionalmente Imagen o Video Explicativo al lado) -->
        <div class="slide-content-wrapper" style="padding: 3rem 3.5rem; flex: 1; display: flex; flex-direction: column; justify-content: center; background: ${slideBg}; width: 100%;">
          <div class="slide-grid-layout ${hasMedia ? 'has-media' : 'no-media'}" style="display: grid; grid-template-columns: ${hasMedia ? '1.15fr 0.85fr' : '1fr'}; gap: 2.5rem; align-items: center; width: 100%; max-width: 1600px; margin: 0 auto;">
            
            <!-- Columna de Textos -->
            <div class="slide-text-col">
              ${currentSlide.subtitle ? `
                <div class="slide-custom-subtitle" style="font-family: ${currentSlide.subtitleFont || "'Outfit', sans-serif"} !important; font-size: 1.1rem; color: ${currentSlide.subtitleColor || '#00f5d4'} !important; --slide-subtitle-color: ${currentSlide.subtitleColor || '#00f5d4'}; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.6rem;">
                  ${this.escapeHtml(currentSlide.subtitle)}
                </div>
              ` : ''}

              ${currentSlide.title ? `
                <h1 class="slide-custom-title" style="font-family: ${currentSlide.titleFont || "'Outfit', sans-serif"} !important; font-size: clamp(2rem, 3.8vw, 3rem); font-weight: 900; line-height: 1.15; margin: 0 0 1.25rem; color: ${currentSlide.titleColor || '#ffffff'} !important; --slide-title-color: ${currentSlide.titleColor || '#ffffff'}; text-shadow: 0 2px 10px rgba(0,0,0,0.5);">
                  ${this.escapeHtml(currentSlide.title)}
                </h1>
              ` : ''}

              ${currentSlide.content ? `
                <p class="slide-custom-content" style="font-family: ${currentSlide.contentFont || "'Inter', sans-serif"} !important; font-size: 1.15rem; color: ${currentSlide.contentColor || '#cbd5e1'} !important; --slide-content-color: ${currentSlide.contentColor || '#cbd5e1'}; line-height: 1.6; margin: 0 0 1.5rem;">
                  ${this.escapeHtml(currentSlide.content)}
                </p>
              ` : ''}

              ${currentSlide.bullets && currentSlide.bullets.length > 0 ? `
                <div class="slide-bullets-container" style="display: flex; flex-direction: column; gap: 0.85rem;">
                  ${currentSlide.bullets.map(b => {
                    const bIcon = (currentSlide.bulletStyle === 'custom') 
                      ? (currentSlide.bulletEmoji || '🎯') 
                      : (currentSlide.bulletStyle || currentSlide.bulletIcon || '✦');
                    return `
                      <div class="slide-custom-bullet" style="font-family: ${currentSlide.bulletsFont || "'Inter', sans-serif"} !important; display: flex; align-items: flex-start; gap: 0.75rem; font-size: 1.05rem; color: ${currentSlide.bulletsColor || '#f1f5f9'} !important; --slide-bullet-color: ${currentSlide.bulletsColor || '#f1f5f9'}; line-height: 1.45;">
                        <span class="slide-bullet-icon" style="color: ${currentSlide.subtitleColor || '#00f5d4'} !important; font-size: 1.2rem; line-height: 1; flex-shrink: 0;">${bIcon}</span>
                        <span>${this.escapeHtml(b)}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              ` : ''}
            </div>

            <!-- Columna de Media (Video Explicativo o Imagen de Apoyo) -->
            ${hasMedia ? `
              <div class="slide-media-col" style="text-align: center; display: flex; align-items: center; justify-content: center; width: 100%;">
                ${isVideoSlide ? `
                  <div class="slide-media-video" style="width: 100%; max-width: 100%;">
                    ${this.renderVideoPlayerHtml(this.parseVideoSource(currentSlide.videoUrl || currentSlide.media))}
                  </div>
                ` : `
                  <img 
                    src="${currentSlide.media}" 
                    alt="${this.escapeHtml(currentSlide.title || 'Imagen')}" 
                    class="slide-media-img"
                    style="max-width: 100%; max-height: calc(100vh - 280px); min-height: 280px; object-fit: contain; border-radius: 18px; border: 2px solid rgba(255,255,255,0.18); box-shadow: 0 12px 35px rgba(0,0,0,0.6);"
                  />
                `}
              </div>
            ` : ''}

          </div>
        </div>
      `}

      <!-- Drawer de Notas del Docente (Desplegable) -->
      ${this.showTeacherNotes ? `
        <div style="background: rgba(15, 23, 42, 0.95); border-top: 1px solid rgba(124, 58, 237, 0.5); padding: 1rem 2rem; display: flex; align-items: center; gap: 1rem;">
          <span style="font-size: 1.5rem;">💡</span>
          <div style="flex: 1;">
            <div style="font-size: 0.8rem; font-weight: 800; color: #a78bfa; text-transform: uppercase;">Guía del Docente para esta diapositiva:</div>
            <div style="font-size: 0.95rem; color: #e2e8f0; line-height: 1.4;">
              ${this.escapeHtml(currentSlide.teacherNotes || 'No hay notas especiales registradas para esta lámina.')}
            </div>
          </div>
        </div>
      ` : ''}

      <!-- Barra de Control Inferior del Visor -->
      <div class="slide-bottom-bar" style="background: rgba(0, 0, 0, 0.6); border-top: 1px solid rgba(255,255,255,0.08); padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
        
        <div style="display: flex; align-items: center; gap: 0.75rem;">
          <button 
            class="btn btn-outline" 
            onclick="window.PresentationView.prevSlide()" 
            style="padding: 0.6rem 1.2rem; font-weight: 800; font-size: 0.95rem;"
            ${this.currentSlideIndex === 0 ? 'disabled style="opacity: 0.4; cursor: not-allowed;"' : ''}
          >
            ◀ Anterior
          </button>
          
          <button 
            class="btn btn-primary" 
            onclick="window.PresentationView.nextSlide()" 
            style="padding: 0.6rem 1.4rem; font-weight: 900; font-size: 0.95rem;"
          >
            ${this.currentSlideIndex === slides.length - 1 ? 'Reiniciar ↺' : 'Siguiente ▶'}
          </button>
        </div>

        <div style="display: flex; align-items: center; gap: 0.5rem; font-weight: 800; font-size: 1rem; color: var(--text-secondary);">
          <span>Diapositiva</span>
          <span style="color: var(--neon-cyan); font-size: 1.2rem;">${this.currentSlideIndex + 1}</span>
          <span>de</span>
          <span>${slides.length}</span>
        </div>

        <div style="font-size: 0.85rem; color: var(--text-muted);">
          Usa las flechas ⬅️ ➡️ o Espacio para avanzar
        </div>

      </div>
    `;
  },

  renderThumbnailsHtml(slides) {
    return slides.map((s, idx) => `
      <div 
        onclick="window.PresentationView.goToSlide(${idx})"
        style="flex: 0 0 150px; height: 90px; border-radius: 10px; cursor: pointer; padding: 0.6rem; display: flex; flex-direction: column; justify-content: space-between; transition: var(--transition-bounce); ${idx === this.currentSlideIndex ? 'border: 2px solid var(--neon-cyan); background: rgba(0, 245, 212, 0.15);' : 'border: 1px solid var(--border-color); background: rgba(0,0,0,0.3);'}"
      >
        <div style="font-size: 0.75rem; font-weight: 800; color: ${idx === this.currentSlideIndex ? 'var(--neon-cyan)' : 'var(--text-muted)'}; display: flex; justify-content: space-between; align-items: center;">
          <span>#${idx + 1}</span>
          ${(s.layout === 'video' || s.videoUrl) ? '<span title="Tiene Video Explicativo">🎬</span>' : (s.media ? '<span title="Tiene Imagen">🖼️</span>' : '')}
        </div>
        <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
          ${this.escapeHtml(s.title || 'Diapositiva ' + (idx + 1))}
        </div>
      </div>
    `).join('');
  },

  renderEditor(container) {
    const p = this.currentProject;
    const slides = p.slides || [];
    const currentSlide = slides[this.currentSlideIndex] || slides[0] || { title: '', bullets: [] };
    const isVideoLayout = currentSlide.layout === 'video' || Boolean(currentSlide.videoUrl && currentSlide.layout !== 'split' && currentSlide.layout !== 'full');
    const isImportedOrFull = Boolean(
      (currentSlide.layout === 'full' && !isVideoLayout) ||
      currentSlide.isImported ||
      p.isImported ||
      currentSlide.isFullImage ||
      (currentSlide.media && currentSlide.media.startsWith('data:image/'))
    );

    const isSplitMode = currentSlide.layout === 'split' || isVideoLayout || (!isImportedOrFull && (
      (currentSlide.content && currentSlide.content.trim()) ||
      (currentSlide.bullets && currentSlide.bullets.length > 0) ||
      (currentSlide.subtitle && currentSlide.subtitle.trim())
    ));

    const isFullVisual = Boolean(currentSlide.media && !isSplitMode && !isVideoLayout && currentSlide.layout === 'full');

    container.innerHTML = `
      <div style="max-width: 1200px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        
        <!-- Header del Editor -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.75rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.35rem;">
              <span class="badge-tag" style="background: rgba(124, 58, 237, 0.8); color: white;">EDITOR DE PRESENTACIÓN</span>
              <span style="font-size: 0.85rem; color: var(--text-muted);">Diapositivas Didácticas</span>
            </div>
            <h1 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: var(--text-primary);">
              Diseñador de Diapositivas de Clase
            </h1>
          </div>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-outline" style="border-color: #7c3aed; color: #c4b5fd; font-weight: 800; display: inline-flex; align-items: center; gap: 0.4rem;" onclick="window.PresentationView.openImportModal()">
              <span>📥</span> Importar Presentación
            </button>
            <button class="btn btn-outline" onclick="window.PresentationView.exitEditMode()">
              ✕ Cancelar
            </button>
            <button class="btn btn-cyan" onclick="window.PresentationView.saveAndPresent()" style="font-weight: 900;">
              💾 Guardar y Presentar
            </button>
          </div>
        </div>

        <!-- Metadatos de la Presentación -->
        <div class="glass-panel" style="padding: 1.5rem; margin-bottom: 1.75rem;">
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.25rem; align-items: start;">
            <!-- 1. Título de la Presentación -->
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--text-primary);">
                Título de la Presentación
              </label>
              <input 
                type="text" 
                id="edit-pres-title" 
                value="${this.escapeHtml(p.title)}" 
                placeholder="Ej: El Sistema Solar y la Exploración Planetaria" 
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                oninput="window.PresentationView.currentProject.title = this.value"
              />
            </div>

            <!-- 2. Materia / Categoría -->
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem; color: var(--text-primary);">
                Materia / Categoría
              </label>
              <select 
                id="edit-pres-category" 
                style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                onchange="window.PresentationView.setCategory(this.value)"
              >
                ${(window.appState.categories || []).map(cat => `
                  <option value="${cat.id}" ${p.category === cat.id ? 'selected' : ''}>${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>

            <!-- 3. Link Portada / Banner (Visible en Proyectos) -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem;">
                <label style="font-size: 0.85rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                  🖼️ Link Portada / Banner (En Proyectos)
                </label>
              </div>
              <div style="display: flex; gap: 0.6rem; align-items: center;">
                <input 
                  type="text" 
                  id="edit-pres-banner" 
                  value="${this.escapeHtml(p.banner || '')}" 
                  placeholder="https://... enlace de imagen de portada" 
                  style="flex: 1; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                  oninput="window.PresentationView.setBanner(this.value)"
                />
                <!-- Miniatura de Vista Previa -->
                <div 
                  id="edit-pres-banner-preview-box" 
                  style="width: 52px; height: 44px; border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.2); overflow: hidden; background: #000000; flex-shrink: 0; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.4);"
                  title="Vista previa de portada"
                >
                  <img 
                    id="edit-pres-banner-preview" 
                    src="${p.banner || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'}" 
                    alt="Portada" 
                    style="width: 100%; height: 100%; object-fit: cover;" 
                    onerror="this.src='https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Zona de Edición Dividida: Lista de Diapositivas a la Izquierda y Formulario a la Derecha -->
        <div style="display: grid; grid-template-columns: 280px 1fr; gap: 1.5rem; align-items: start;">
          
          <!-- Lista de Diapositivas -->
          <div class="glass-panel" style="padding: 1.25rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
              <span style="font-weight: 800; font-size: 0.95rem;">Diapositivas (${slides.length})</span>
              <div style="display: flex; gap: 0.4rem;">
                <button class="btn btn-outline" style="padding: 0.35rem 0.65rem; font-size: 0.78rem; border-color: #7c3aed; color: #c4b5fd;" title="Importar PowerPoint, PDF o texto" onclick="window.PresentationView.openImportModal()">
                  📥 Importar
                </button>
                <button class="btn btn-cyan" style="padding: 0.35rem 0.7rem; font-size: 0.8rem; font-weight: 800;" onclick="window.PresentationView.addNewSlide()">
                  + Añadir
                </button>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 0.6rem; max-height: 500px; overflow-y: auto; padding-right: 0.3rem;">
              ${slides.map((s, idx) => `
                <div 
                  onclick="window.PresentationView.selectSlideToEdit(${idx})"
                  style="padding: 0.75rem; border-radius: 10px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; transition: var(--transition-bounce); ${idx === this.currentSlideIndex ? 'border: 2px solid var(--neon-cyan); background: rgba(0,245,212,0.12);' : 'border: 1px solid var(--border-color); background: rgba(0,0,0,0.2);'}"
                >
                  <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.88rem; font-weight: 700;">
                    <span style="color: var(--neon-cyan); margin-right: 0.35rem;">#${idx + 1}</span>
                    <span>${this.escapeHtml(s.title || 'Sin título')}</span>
                  </div>
                  ${slides.length > 1 ? `
                    <button 
                      class="btn btn-danger" 
                      style="width: 24px; height: 24px; padding: 0; font-size: 0.75rem; border-radius: 6px;" 
                      onclick="event.stopPropagation(); window.PresentationView.removeSlide(${idx})"
                      title="Eliminar diapositiva"
                    >
                      ✕
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Formulario de la Diapositiva Seleccionada -->
          <div class="glass-panel" style="padding: 1.75rem;">
            <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.85rem; margin-bottom: 1.25rem;">
              <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 0.75rem;">
                <div style="font-size: 1rem; font-weight: 800; color: var(--neon-cyan);">
                  Diapositiva #${this.currentSlideIndex + 1} ${currentSlide.title ? '— ' + this.escapeHtml(currentSlide.title) : ''}
                </div>

                <!-- 1. Color de la Diapositiva -->
                <div style="display: inline-flex; align-items: center; gap: 0.45rem; background: rgba(0,0,0,0.35); padding: 0.28rem 0.75rem; border-radius: 9999px; border: 1.5px solid rgba(255,255,255,0.15);" title="Cambiar color de fondo de esta diapositiva">
                  <span style="font-size: 0.78rem; font-weight: 700; color: var(--text-secondary);">Color Diapositiva:</span>
                  <div 
                    id="color-preview-slideBg" 
                    style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: ${currentSlide.bgColor || '#140f26'}; border: 2.5px solid rgba(255,255,255,0.85); box-shadow: 0 0 10px ${currentSlide.bgColor || '#140f26'}88; cursor: pointer; transition: transform 0.2s ease;"
                    onmouseenter="this.style.transform='scale(1.2)'"
                    onmouseleave="this.style.transform='scale(1)'"
                  >
                    <input 
                      type="color" 
                      value="${currentSlide.bgColor && currentSlide.bgColor.startsWith('#') ? currentSlide.bgColor : '#140f26'}" 
                      style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                      oninput="window.PresentationView.updateSlideBgColor(this.value)"
                      onchange="window.PresentationView.updateSlideBgColor(this.value)"
                    />
                  </div>
                </div>

                <!-- 2. Diseños de Diapositivas (15) -->
                <button 
                  type="button" 
                  class="btn ${this.showThemesPicker ? 'btn-cyan' : 'btn-outline'}" 
                  style="font-size: 0.8rem; padding: 0.35rem 0.85rem; font-weight: 800; border-color: #7c3aed; color: ${this.showThemesPicker ? '#000' : '#c4b5fd'}; display: inline-flex; align-items: center; gap: 0.45rem; box-shadow: 0 0 10px rgba(124,58,237,0.25);"
                  onclick="window.PresentationView.toggleSlideThemesPicker()"
                  title="Explorar y aplicar entre 15 diseños temáticos"
                >
                  <span>🎨</span>
                  <span>Diseños de Diapositivas (${this.SLIDE_THEMES.length})</span>
                </button>
              </div>
            </div>

            <!-- Panel Desplegable de los 15 Diseños de Diapositivas -->
            ${this.showThemesPicker ? `
              <div style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(20, 15, 38, 0.98)); border: 2px solid #7c3aed; border-radius: 16px; padding: 1.25rem; margin-bottom: 1.5rem; box-shadow: 0 12px 35px rgba(0,0,0,0.6);">
                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.75rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 0.75rem;">
                  <div>
                    <div style="font-weight: 900; font-size: 1.05rem; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
                      <span>🎨</span> Diseños de Diapositivas Disponibles (15 Estilos)
                    </div>
                    <div style="font-size: 0.82rem; color: var(--text-muted); margin-top: 0.15rem;">
                      Selecciona un diseño para transformar el fondo y la combinación de colores de esta lámina.
                    </div>
                  </div>
                  <div style="display: flex; gap: 0.5rem;">
                    <button 
                      class="btn btn-outline" 
                      style="padding: 0.35rem 0.75rem; font-size: 0.78rem;" 
                      onclick="window.PresentationView.toggleSlideThemesPicker()"
                    >
                      ✕ Ocultar
                    </button>
                  </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); gap: 0.85rem; max-height: 420px; overflow-y: auto; padding-right: 0.4rem;">
                  ${this.SLIDE_THEMES.map((theme, tIdx) => `
                    <div 
                      onclick="window.PresentationView.applySlideTheme(${tIdx}, false)"
                      style="background: ${theme.bg}; border: 1.5px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 0.85rem; cursor: pointer; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease; display: flex; flex-direction: column; justify-content: space-between; min-height: 110px; box-shadow: 0 4px 15px rgba(0,0,0,0.4);"
                      onmouseenter="this.style.transform='translateY(-3px)'; this.style.borderColor='var(--neon-cyan)'; this.style.boxShadow='0 8px 25px rgba(0,245,212,0.3)'"
                      onmouseleave="this.style.transform='none'; this.style.borderColor='rgba(255,255,255,0.2)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)'"
                      title="Aplicar ${theme.name} a esta diapositiva"
                    >
                      <div>
                        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.35rem;">
                          <div style="display: flex; align-items: center; gap: 0.4rem; overflow: hidden;">
                            <span style="font-size: 1.15rem;">${theme.icon}</span>
                            <span style="font-size: 0.88rem; font-weight: 800; color: ${theme.titleColor}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                              ${theme.name}
                            </span>
                          </div>
                        </div>
                        <div style="font-size: 0.73rem; color: ${theme.subtitleColor}; font-weight: 700; text-transform: uppercase; margin-bottom: 0.2rem;">
                          Subtítulo
                        </div>
                        <div style="font-size: 0.72rem; color: ${theme.contentColor}; line-height: 1.25;">
                          Texto y viñetas
                        </div>
                      </div>

                      <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 0.65rem; padding-top: 0.45rem; border-top: 1px solid rgba(255,255,255,0.15);">
                        <div style="display: flex; gap: 0.3rem;">
                          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${theme.titleColor}; display: inline-block; border: 1px solid rgba(0,0,0,0.5);" title="Título"></span>
                          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${theme.subtitleColor}; display: inline-block; border: 1px solid rgba(0,0,0,0.5);" title="Subtítulo"></span>
                          <span style="width: 12px; height: 12px; border-radius: 50%; background: ${theme.contentColor}; display: inline-block; border: 1px solid rgba(0,0,0,0.5);" title="Contenido"></span>
                        </div>
                        <button 
                          type="button"
                          class="btn btn-outline" 
                          style="font-size: 0.7rem; padding: 0.15rem 0.45rem; border-color: rgba(255,255,255,0.4); color: #ffffff;"
                          onclick="event.stopPropagation(); window.PresentationView.applySlideTheme(${tIdx}, true)"
                          title="Aplicar este tema a todas las diapositivas de la presentación"
                        >
                          A todas
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <!-- Selector de Formato de Diapositiva -->
            <div style="background: rgba(124, 58, 237, 0.1); border: 1.5px solid rgba(124, 58, 237, 0.35); border-radius: 14px; padding: 0.9rem 1.2rem; margin-bottom: 1.5rem; display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.85rem;">
              <div>
                <div style="font-weight: 800; font-size: 0.9rem; color: var(--text-primary); display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem;">
                  <span>${isFullVisual ? '🖥️' : (isVideoLayout ? '🎬' : '📝')}</span>
                  <span>Modo: ${isFullVisual ? 'Lámina en Pantalla Completa (Importada)' : (isVideoLayout ? 'Creada en la App (Texto + Video)' : 'Creada en la App (Texto + Imagen)')}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-muted);">
                  ${isFullVisual 
                    ? 'La lámina se proyectará limpia en toda la pantalla sin textos de la página.' 
                    : (isVideoLayout 
                      ? 'Texto explicativo con título y viñetas a la izquierda, y video interactivo a la derecha.'
                      : 'Texto explicativo con título y viñetas a la izquierda, e imagen de apoyo a la derecha.')}
                </div>
              </div>

              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <button 
                  type="button" 
                  class="btn ${isFullVisual ? 'btn-cyan' : 'btn-outline'}" 
                  style="font-size: 0.82rem; padding: 0.4rem 0.85rem; font-weight: 800;"
                  onclick="window.PresentationView.setSlideLayout('full')"
                  title="Mostrar solo la lámina en toda la pantalla"
                >
                  🖥️ Pantalla Completa
                </button>
                <button 
                  type="button" 
                  class="btn ${(!isFullVisual && !isVideoLayout) ? 'btn-cyan' : 'btn-outline'}" 
                  style="font-size: 0.82rem; padding: 0.4rem 0.85rem; font-weight: 800;"
                  onclick="window.PresentationView.setSlideLayout('split')"
                  title="Mostrar texto a la izquierda e imagen a la derecha"
                >
                  📝 Texto + Imagen
                </button>
                <button 
                  type="button" 
                  class="btn ${isVideoLayout ? 'btn-cyan' : 'btn-outline'}" 
                  style="font-size: 0.82rem; padding: 0.4rem 0.85rem; font-weight: 800;"
                  onclick="window.PresentationView.setSlideLayout('video')"
                  title="Mostrar texto a la izquierda y video explicativo interactivo a la derecha"
                >
                  🎬 Texto + Video
                </button>
              </div>
            </div>

            ${isFullVisual ? `
              <!-- Vista previa y controles de Diapositiva Importada / Lámina Visual -->
              <div style="background: #000; border-radius: 14px; padding: 0.85rem; text-align: center; border: 1.5px solid rgba(124, 58, 237, 0.4); margin-bottom: 1.5rem; box-shadow: 0 8px 25px rgba(0,0,0,0.5);">
                <img 
                  src="${currentSlide.media}" 
                  alt="Vista previa de lámina" 
                  style="max-width: 100%; max-height: 380px; object-fit: contain; border-radius: 8px; display: block; margin: 0 auto;"
                />
                <div style="margin-top: 0.75rem; font-size: 0.85rem; color: #38bdf8; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 0.4rem;">
                  <span>✨</span> Esta diapositiva se proyectará en toda la pantalla sin textos superpuestos.
                </div>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">
                    Nombre de Referencia (para la lista de diapositivas)
                  </label>
                  <input 
                    type="text" 
                    value="${this.escapeHtml(currentSlide.title || '')}" 
                    placeholder="Ej: Diapositiva ${this.currentSlideIndex + 1}" 
                    style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                    oninput="window.PresentationView.updateCurrentSlideField('title', this.value)"
                  />
                </div>

                <div>
                  <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">
                    Notas del Docente (Apuntes privados durante la clase)
                  </label>
                  <input 
                    type="text" 
                    value="${this.escapeHtml(currentSlide.teacherNotes || '')}" 
                    placeholder="Puntos clave al exponer esta lámina..." 
                    style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;"
                    oninput="window.PresentationView.updateCurrentSlideField('teacherNotes', this.value)"
                  />
                </div>
              </div>

              <div style="margin-bottom: 1rem;">
                <label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">
                  Imagen / Lámina (URL o base64)
                </label>
                <input 
                  type="text" 
                  value="${this.escapeHtml(currentSlide.media || '')}" 
                  placeholder="https://..." 
                  style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; outline: none;"
                  oninput="window.PresentationView.updateCurrentSlideField('media', this.value)"
                />
              </div>
            ` : `
              <!-- Formulario de Diapositiva Creada en la App (Texto + Imagen) -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                <!-- 1. Título de la Lámina -->
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.4rem;">
                    <label style="font-size: 0.85rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                      Título de la Lámina
                    </label>
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <!-- Selector de Fuente (Tipos de Letra) -->
                      <div style="display: flex; align-items: center; gap: 0.3rem;" title="Cambiar tipo de letra del título (${this.SLIDE_FONTS.length} fuentes)">
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Fuente:</span>
                        <select 
                          style="padding: 0.22rem 0.45rem; font-size: 0.78rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; outline: none; max-width: 140px;"
                          onchange="window.PresentationView.updateCurrentSlideFont('titleFont', this.value)"
                        >
                          ${this.SLIDE_FONTS.map(f => `
                            <option value="${f.family}" style="font-family: ${f.family};" ${(currentSlide.titleFont === f.family || (!currentSlide.titleFont && f.id === 'Outfit')) ? 'selected' : ''}>
                              ${f.name}
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <!-- Selector de Color -->
                      <div style="display: flex; align-items: center; gap: 0.35rem;" title="Haz clic en el círculo para elegir color del título">
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Color</span>
                        <div 
                          id="color-preview-titleColor" 
                          style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: ${currentSlide.titleColor || '#ffffff'}; border: 2.5px solid rgba(255,255,255,0.8); box-shadow: 0 0 10px ${currentSlide.titleColor || '#ffffff'}88; cursor: pointer; transition: transform 0.2s ease;"
                          onmouseenter="this.style.transform='scale(1.2)'"
                          onmouseleave="this.style.transform='scale(1)'"
                        >
                          <input 
                            type="color" 
                            value="${currentSlide.titleColor || '#ffffff'}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                            oninput="window.PresentationView.updateCurrentSlideColor('titleColor', this.value)"
                            onchange="window.PresentationView.updateCurrentSlideColor('titleColor', this.value)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    id="input-titleColor"
                    value="${this.escapeHtml(currentSlide.title || '')}" 
                    placeholder="Ej: El Origen de los Planetas" 
                    style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: ${currentSlide.titleColor || 'var(--text-primary)'}; font-family: ${currentSlide.titleFont || "'Outfit', sans-serif"}; font-size: 0.95rem; font-weight: 700; outline: none;"
                    oninput="window.PresentationView.updateCurrentSlideField('title', this.value)"
                  />
                </div>

                <!-- 2. Subtítulo o Tema -->
                <div>
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.4rem;">
                    <label style="font-size: 0.85rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                      Subtítulo o Tema
                    </label>
                    <div style="display: flex; align-items: center; gap: 0.65rem;">
                      <!-- Selector de Fuente (Tipos de Letra) -->
                      <div style="display: flex; align-items: center; gap: 0.3rem;" title="Cambiar tipo de letra del subtítulo (${this.SLIDE_FONTS.length} fuentes)">
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Fuente:</span>
                        <select 
                          style="padding: 0.22rem 0.45rem; font-size: 0.78rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; outline: none; max-width: 140px;"
                          onchange="window.PresentationView.updateCurrentSlideFont('subtitleFont', this.value)"
                        >
                          ${this.SLIDE_FONTS.map(f => `
                            <option value="${f.family}" style="font-family: ${f.family};" ${(currentSlide.subtitleFont === f.family || (!currentSlide.subtitleFont && f.id === 'Outfit')) ? 'selected' : ''}>
                              ${f.name}
                            </option>
                          `).join('')}
                        </select>
                      </div>

                      <!-- Selector de Color -->
                      <div style="display: flex; align-items: center; gap: 0.35rem;" title="Haz clic en el círculo para elegir color del subtítulo">
                        <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Color</span>
                        <div 
                          id="color-preview-subtitleColor" 
                          style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: ${currentSlide.subtitleColor || '#00f5d4'}; border: 2.5px solid rgba(255,255,255,0.8); box-shadow: 0 0 10px ${currentSlide.subtitleColor || '#00f5d4'}88; cursor: pointer; transition: transform 0.2s ease;"
                          onmouseenter="this.style.transform='scale(1.2)'"
                          onmouseleave="this.style.transform='scale(1)'"
                        >
                          <input 
                            type="color" 
                            value="${currentSlide.subtitleColor || '#00f5d4'}" 
                            style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                            oninput="window.PresentationView.updateCurrentSlideColor('subtitleColor', this.value)"
                            onchange="window.PresentationView.updateCurrentSlideColor('subtitleColor', this.value)"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <input 
                    type="text" 
                    id="input-subtitleColor"
                    value="${this.escapeHtml(currentSlide.subtitle || '')}" 
                    placeholder="Ej: Formación por acreción gravitatoria" 
                    style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: ${currentSlide.subtitleColor || 'var(--neon-cyan)'}; font-family: ${currentSlide.subtitleFont || "'Outfit', sans-serif"}; font-size: 0.95rem; font-weight: 700; outline: none;"
                    oninput="window.PresentationView.updateCurrentSlideField('subtitle', this.value)"
                  />
                </div>
              </div>

              <!-- 3. Explicación Central -->
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.4rem;">
                  <label style="font-size: 0.85rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                    Explicación Central
                  </label>
                  <div style="display: flex; align-items: center; gap: 0.65rem;">
                    <!-- Selector de Fuente (Tipos de Letra) -->
                    <div style="display: flex; align-items: center; gap: 0.3rem;" title="Cambiar tipo de letra de la explicación (${this.SLIDE_FONTS.length} fuentes)">
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Fuente:</span>
                      <select 
                        style="padding: 0.22rem 0.45rem; font-size: 0.78rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; outline: none; max-width: 140px;"
                        onchange="window.PresentationView.updateCurrentSlideFont('contentFont', this.value)"
                      >
                        ${this.SLIDE_FONTS.map(f => `
                          <option value="${f.family}" style="font-family: ${f.family};" ${(currentSlide.contentFont === f.family || (!currentSlide.contentFont && f.id === 'Outfit')) ? 'selected' : ''}>
                            ${f.name}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Selector de Color -->
                    <div style="display: flex; align-items: center; gap: 0.35rem;" title="Haz clic en el círculo para elegir color de la explicación">
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Color</span>
                      <div 
                        id="color-preview-contentColor" 
                        style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: ${currentSlide.contentColor || '#cbd5e1'}; border: 2.5px solid rgba(255,255,255,0.8); box-shadow: 0 0 10px ${currentSlide.contentColor || '#cbd5e1'}88; cursor: pointer; transition: transform 0.2s ease;"
                        onmouseenter="this.style.transform='scale(1.2)'"
                        onmouseleave="this.style.transform='scale(1)'"
                      >
                        <input 
                          type="color" 
                          value="${currentSlide.contentColor || '#cbd5e1'}" 
                          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                          oninput="window.PresentationView.updateCurrentSlideColor('contentColor', this.value)"
                          onchange="window.PresentationView.updateCurrentSlideColor('contentColor', this.value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <textarea 
                  rows="3" 
                  id="input-contentColor"
                  placeholder="Escribe la explicación teórica o concepto clave..."
                  style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: ${currentSlide.contentColor || 'var(--text-primary)'}; font-family: ${currentSlide.contentFont || "'Inter', sans-serif"}; font-size: 0.95rem; outline: none; resize: vertical;"
                  oninput="window.PresentationView.updateCurrentSlideField('content', this.value)"
                >${this.escapeHtml(currentSlide.content || '')}</textarea>
              </div>

              <!-- 4. Puntos Clave / Viñetas -->
              <div style="margin-bottom: 1rem;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.4rem; flex-wrap: wrap; gap: 0.4rem;">
                  <label style="font-size: 0.85rem; font-weight: 800; margin: 0; color: var(--text-primary);">
                    Puntos Clave / Viñetas (Uno por línea)
                  </label>
                  <div style="display: flex; align-items: center; gap: 0.65rem; flex-wrap: wrap;">
                    <!-- Selector de Viñetas (6 tipos + 1 de emojis personalizada) -->
                    <div style="display: flex; align-items: center; gap: 0.3rem;" title="Elige el estilo de viñeta para tus puntos clave">
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Viñeta:</span>
                      <select 
                        style="padding: 0.22rem 0.45rem; font-size: 0.78rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1.5px solid var(--neon-cyan); color: var(--text-primary); cursor: pointer; outline: none; max-width: 145px; font-weight: 700;"
                        onchange="window.PresentationView.updateCurrentSlideBulletStyle(this.value)"
                      >
                        ${this.BULLET_TYPES.map(bt => `
                          <option value="${bt.id}" ${(currentSlide.bulletStyle === bt.id || (!currentSlide.bulletStyle && bt.id === '✦')) ? 'selected' : ''}>
                            ${bt.name}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    ${currentSlide.bulletStyle === 'custom' ? `
                      <!-- Selector de Emoji Personalizado -->
                      <div style="display: inline-flex; align-items: center; gap: 0.3rem; background: rgba(0,245,212,0.12); padding: 0.18rem 0.45rem; border-radius: 8px; border: 1px solid var(--neon-cyan);" title="Escribe o selecciona tu emoji favorito">
                        <span style="font-size: 0.7rem; color: var(--neon-cyan); font-weight: 800;">Emoji:</span>
                        <input 
                          type="text" 
                          id="input-custom-bullet-emoji"
                          value="${this.escapeHtml(currentSlide.bulletEmoji || '🎯')}" 
                          placeholder="🎯"
                          maxlength="4"
                          style="width: 36px; text-align: center; font-size: 0.95rem; padding: 0.1rem; border-radius: 6px; background: rgba(0,0,0,0.55); border: 1px solid rgba(255,255,255,0.3); color: #ffffff; outline: none;"
                          oninput="window.PresentationView.updateCurrentSlideBulletEmoji(this.value)"
                        />
                        <div style="display: flex; gap: 0.2rem; align-items: center;">
                          ${this.QUICK_EMOJIS.slice(0, 6).map(em => `
                            <button 
                              type="button" 
                              style="background: transparent; border: none; font-size: 0.95rem; cursor: pointer; padding: 0; line-height: 1; transition: transform 0.15s ease;"
                              onmouseenter="this.style.transform='scale(1.3)'"
                              onmouseleave="this.style.transform='scale(1)'"
                              onclick="window.PresentationView.selectQuickBulletEmoji('${em}')"
                              title="Usar ${em}"
                            >${em}</button>
                          `).join('')}
                        </div>
                      </div>
                    ` : ''}

                    <!-- Selector de Fuente (Tipos de Letra) -->
                    <div style="display: flex; align-items: center; gap: 0.3rem;" title="Cambiar tipo de letra de las viñetas (${this.SLIDE_FONTS.length} fuentes)">
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Fuente:</span>
                      <select 
                        style="padding: 0.22rem 0.45rem; font-size: 0.78rem; border-radius: 8px; background: rgba(0,0,0,0.45); border: 1px solid var(--border-color); color: var(--text-primary); cursor: pointer; outline: none; max-width: 140px;"
                        onchange="window.PresentationView.updateCurrentSlideFont('bulletsFont', this.value)"
                      >
                        ${this.SLIDE_FONTS.map(f => `
                          <option value="${f.family}" style="font-family: ${f.family};" ${(currentSlide.bulletsFont === f.family || (!currentSlide.bulletsFont && f.id === 'Outfit')) ? 'selected' : ''}>
                            ${f.name}
                          </option>
                        `).join('')}
                      </select>
                    </div>

                    <!-- Selector de Color -->
                    <div style="display: flex; align-items: center; gap: 0.35rem;" title="Haz clic en el círculo para elegir color de las viñetas">
                      <span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 600;">Color</span>
                      <div 
                        id="color-preview-bulletsColor" 
                        style="position: relative; width: 22px; height: 22px; border-radius: 50%; background: ${currentSlide.bulletsColor || '#f1f5f9'}; border: 2.5px solid rgba(255,255,255,0.8); box-shadow: 0 0 10px ${currentSlide.bulletsColor || '#f1f5f9'}88; cursor: pointer; transition: transform 0.2s ease;"
                        onmouseenter="this.style.transform='scale(1.2)'"
                        onmouseleave="this.style.transform='scale(1)'"
                      >
                        <input 
                          type="color" 
                          value="${currentSlide.bulletsColor || '#f1f5f9'}" 
                          style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;"
                          oninput="window.PresentationView.updateCurrentSlideColor('bulletsColor', this.value)"
                          onchange="window.PresentationView.updateCurrentSlideColor('bulletsColor', this.value)"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <textarea 
                  rows="3" 
                  id="input-bulletsColor"
                  placeholder="Punto 1&#10;Punto 2&#10;Punto 3"
                  style="width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: ${currentSlide.bulletsColor || 'var(--text-primary)'}; font-family: ${currentSlide.bulletsFont || "'Inter', sans-serif"}; font-size: 0.95rem; outline: none; resize: vertical;"
                  oninput="window.PresentationView.updateCurrentSlideBullets(this.value)"
                >${this.escapeHtml((currentSlide.bullets || []).join('\n'))}</textarea>
              </div>

              ${this.renderSlideMediaInputs(currentSlide, isVideoLayout)}
            `}

          </div>

        </div>

      </div>
    `;
  },

  handleSlideCanvasClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX > rect.width * 0.4) {
      this.nextSlide();
    } else {
      this.prevSlide();
    }
  },

  nextSlide() {
    const slides = this.currentProject?.slides || [];
    if (this.currentSlideIndex < slides.length - 1) {
      this.currentSlideIndex++;
    } else {
      this.currentSlideIndex = 0; // Reiniciar
    }
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderViewer(document.getElementById('view-presentation'));
  },

  prevSlide() {
    if (this.currentSlideIndex > 0) {
      this.currentSlideIndex--;
      if (window.soundEngine) window.soundEngine.playClick();
      this.renderViewer(document.getElementById('view-presentation'));
    }
  },

  goToSlide(idx) {
    this.currentSlideIndex = idx;
    if (window.soundEngine) window.soundEngine.playClick();
    this.renderViewer(document.getElementById('view-presentation'));
  },

  toggleTeacherNotes() {
    this.showTeacherNotes = !this.showTeacherNotes;
    this.renderViewer(document.getElementById('view-presentation'));
  },

  toggleFullscreen() {
    const elem = document.getElementById('presentation-slide-canvas');
    if (!elem) return;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      const req = elem.requestFullscreen || elem.webkitRequestFullscreen || elem.msRequestFullscreen;
      if (req) {
        req.call(elem).then(() => {
          elem.classList.add('is-fullscreen-active');
        }).catch(() => {
          elem.classList.toggle('is-fullscreen-active');
        });
      } else {
        elem.classList.toggle('is-fullscreen-active');
      }
    } else {
      const exit = document.exitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
      if (exit) {
        exit.call(document).then(() => {
          elem.classList.remove('is-fullscreen-active');
        }).catch(() => {
          elem.classList.remove('is-fullscreen-active');
        });
      } else {
        elem.classList.remove('is-fullscreen-active');
      }
    }
  },

  attachKeyboardNav() {
    if (this.keyboardHandlerAttached) return;
    this.keyboardHandlerAttached = true;

    // Sincronizar clase de pantalla completa en eventos nativos
    ['fullscreenchange', 'webkitfullscreenchange', 'mozfullscreenchange', 'MSFullscreenChange'].forEach(evt => {
      document.addEventListener(evt, () => {
        const elem = document.getElementById('presentation-slide-canvas');
        if (!elem) return;
        const isFull = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
        if (isFull) {
          elem.classList.add('is-fullscreen-active');
        } else {
          elem.classList.remove('is-fullscreen-active');
        }
      });
    });

    window.addEventListener('keydown', (e) => {
      if (window.appRouter.currentView !== 'presentation' || this.isEditing) return;
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault();
        this.nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.prevSlide();
      }
    });
  },

  openEditMode() {
    this.isEditing = true;
    this.renderEditor(document.getElementById('view-presentation'));
  },

  exitEditMode() {
    this.isEditing = false;
    const exists = window.appState.challenges && window.appState.challenges.some(c => c.id === this.currentProject?.id);
    if (!exists) {
      window.appRouter.navigate('projects');
      return;
    }
    this.renderViewer(document.getElementById('view-presentation'));
  },

  setCategory(catId) {
    const cat = (window.appState.categories || []).find(c => c.id === catId);
    if (cat) {
      this.currentProject.category = cat.id;
      this.currentProject.categoryName = cat.name;
      // Persistir inmediatamente para que el filtro de Proyectos funcione
      const p = this.currentProject;
      if (window.appState && window.appState.challenges) {
        const idx = window.appState.challenges.findIndex(c => c.id === p.id);
        if (idx >= 0) {
          window.appState.challenges[idx] = p;
        } else {
          window.appState.challenges.unshift(p);
        }
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
      // Actualizar el label de categoría visible en el editor sin re-render completo
      const catLabel = document.getElementById('edit-pres-cat-label');
      if (catLabel) catLabel.textContent = `${cat.icon || ''} ${cat.name}`;
    }
  },

  setBanner(url) {
    this.currentProject.banner = url;
    const preview = document.getElementById('edit-pres-banner-preview');
    if (preview) {
      preview.src = url || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800';
    }
    // Persistir inmediatamente al estado global
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
  },

  addNewSlide() {
    if (!this.currentProject.slides) this.currentProject.slides = [];
    this.currentProject.slides.push({
      id: 'slide_' + Date.now(),
      title: 'Nueva Diapositiva ' + (this.currentProject.slides.length + 1),
      subtitle: '',
      content: 'Contenido explicativo de la lección.',
      bullets: ['Concepto clave 1', 'Concepto clave 2'],
      media: '',
      titleColor: '#ffffff',
      subtitleColor: '#00f5d4',
      contentColor: '#cbd5e1',
      bulletsColor: '#f1f5f9',
      titleFont: "'Outfit', sans-serif",
      subtitleFont: "'Outfit', sans-serif",
      contentFont: "'Inter', sans-serif",
      bulletsFont: "'Inter', sans-serif",
      bulletStyle: '✦',
      bulletEmoji: '🎯',
      layout: 'split',
      isImported: false,
      isFullImage: false,
      teacherNotes: ''
    });
    this.currentSlideIndex = this.currentProject.slides.length - 1;
    this.renderEditor(document.getElementById('view-presentation'));
  },

  setSlideLayout(mode) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const slide = this.currentProject.slides[this.currentSlideIndex];
    slide.layout = mode;
    slide.isFullImage = (mode === 'full');
    if (mode === 'video' && !slide.videoUrl && slide.media) {
      slide.videoUrl = slide.media;
    }
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
      }
    }
    this.renderEditor(document.getElementById('view-presentation'));
  },

  updateSlideVideo(val) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const slide = this.currentProject.slides[this.currentSlideIndex];
    slide.videoUrl = val;
    slide.media = val;
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);
      }
    }
  },

  removeSlide(idx) {
    if (this.currentProject.slides.length <= 1) return;
    this.currentProject.slides.splice(idx, 1);
    if (this.currentSlideIndex >= this.currentProject.slides.length) {
      this.currentSlideIndex = this.currentProject.slides.length - 1;
    }
    this.renderEditor(document.getElementById('view-presentation'));
  },

  selectSlideToEdit(idx) {
    this.currentSlideIndex = idx;
    this.renderEditor(document.getElementById('view-presentation'));
  },

  updateCurrentSlideField(field, val) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    this.currentProject.slides[this.currentSlideIndex][field] = val;
  },

  updateCurrentSlideBullets(text) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const bullets = text
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    this.currentProject.slides[this.currentSlideIndex].bullets = bullets;
  },

  updateCurrentSlideColor(prop, color) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    this.currentProject.slides[this.currentSlideIndex][prop] = color;
    const previewDot = document.getElementById('color-preview-' + prop);
    if (previewDot) {
      previewDot.style.background = color;
      previewDot.style.boxShadow = `0 0 10px ${color}88`;
    }
    const targetInput = document.getElementById('input-' + prop);
    if (targetInput) {
      targetInput.style.color = color;
    }
    // Sincronizar y persistir inmediatamente en el estado global
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const existingIndex = window.appState.challenges.findIndex(c => c.id === p.id);
      if (existingIndex >= 0) {
        window.appState.challenges[existingIndex] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
  },

  updateCurrentSlideFont(prop, fontVal) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    this.currentProject.slides[this.currentSlideIndex][prop] = fontVal;
    const inputMap = {
      titleFont: 'input-titleColor',
      subtitleFont: 'input-subtitleColor',
      contentFont: 'input-contentColor',
      bulletsFont: 'input-bulletsColor'
    };
    const targetInput = document.getElementById(inputMap[prop] || '');
    if (targetInput) {
      targetInput.style.fontFamily = fontVal;
    }
    // Sincronizar y persistir inmediatamente en el estado global
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
  },

  updateCurrentSlideBulletStyle(styleVal) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const slide = this.currentProject.slides[this.currentSlideIndex];
    slide.bulletStyle = styleVal;
    if (styleVal !== 'custom') {
      slide.bulletIcon = styleVal;
    }
    // Sincronizar y persistir inmediatamente en el estado global
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
    this.renderEditor(document.getElementById('view-presentation'));
  },

  updateCurrentSlideBulletEmoji(emojiVal) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const slide = this.currentProject.slides[this.currentSlideIndex];
    slide.bulletStyle = 'custom';
    slide.bulletEmoji = emojiVal || '🎯';
    // Sincronizar y persistir inmediatamente en el estado global
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
  },

  selectQuickBulletEmoji(emoji) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    const slide = this.currentProject.slides[this.currentSlideIndex];
    slide.bulletStyle = 'custom';
    slide.bulletEmoji = emoji;
    const emojiInput = document.getElementById('input-custom-bullet-emoji');
    if (emojiInput) emojiInput.value = emoji;
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
    this.renderEditor(document.getElementById('view-presentation'));
  },

  updateSlideBgColor(color) {
    if (!this.currentProject.slides[this.currentSlideIndex]) return;
    this.currentProject.slides[this.currentSlideIndex].bgColor = color;
    const preview = document.getElementById('color-preview-slideBg');
    if (preview) {
      preview.style.background = color;
      preview.style.boxShadow = `0 0 10px ${color}88`;
    }
    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }
  },

  toggleSlideThemesPicker() {
    this.showThemesPicker = !this.showThemesPicker;
    this.renderEditor(document.getElementById('view-presentation'));
  },

  applySlideTheme(themeIdx, applyToAll = false) {
    const theme = this.SLIDE_THEMES[themeIdx];
    if (!theme || !this.currentProject.slides) return;

    if (applyToAll) {
      this.currentProject.slides.forEach(slide => {
        slide.bgColor = theme.bg;
        slide.titleColor = theme.titleColor;
        slide.subtitleColor = theme.subtitleColor;
        slide.contentColor = theme.contentColor;
        slide.bulletsColor = theme.bulletsColor;
        slide.themeName = theme.name;
      });
    } else {
      const slide = this.currentProject.slides[this.currentSlideIndex];
      if (slide) {
        slide.bgColor = theme.bg;
        slide.titleColor = theme.titleColor;
        slide.subtitleColor = theme.subtitleColor;
        slide.contentColor = theme.contentColor;
        slide.bulletsColor = theme.bulletsColor;
        slide.themeName = theme.name;
      }
    }

    const p = this.currentProject;
    if (window.appState && window.appState.challenges) {
      const idx = window.appState.challenges.findIndex(c => c.id === p.id);
      if (idx >= 0) {
        window.appState.challenges[idx] = p;
        if (typeof saveGlobalState === 'function') {
          saveGlobalState(window.appState);
        }
      }
    }

    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }
    this.renderEditor(document.getElementById('view-presentation'));
  },

  saveAndPresent() {
    const p = this.currentProject;
    if (!p.title || !p.title.trim()) {
      alert('Ingresa un título para la presentación.');
      return;
    }

    // Guardar o actualizar en appState
    const existingIndex = window.appState.challenges.findIndex(c => c.id === p.id);
    if (existingIndex >= 0) {
      window.appState.challenges[existingIndex] = p;
    } else {
      window.appState.challenges.unshift(p);
    }

    saveGlobalState(window.appState);
    alert('✅ ¡Presentación guardada exitosamente!');
    this.isEditing = false;
    // Mantiene la diapositiva en la que estaba el usuario en vez de reiniciarla a 0
    if (this.currentSlideIndex >= (p.slides || []).length) {
      this.currentSlideIndex = 0;
    }
    this.renderViewer(document.getElementById('view-presentation'));
  },

  // =========================================================================
  // 📥 Importación Inteligente de Presentaciones (PowerPoint, PDF, Texto, JSON)
  // =========================================================================
  pendingParsedSlides: null,
  pendingPresentationTitle: '',

  openImportModal() {
    const modal = document.getElementById('presentation-import-modal');
    if (!modal) return;
    const label = document.getElementById('pres-dropzone-label');
    const filename = document.getElementById('pres-dropzone-filename');
    const fileInput = document.getElementById('pres-file-input');
    const textarea = document.getElementById('pres-import-textarea');
    const replaceCheck = document.getElementById('pres-replace-check');

    if (label) label.textContent = 'Arrastra tu presentación aquí o haz clic para buscarla';
    if (filename) filename.textContent = 'Soporta PowerPoint (.pptx), Documentos PDF (.pdf), Markdown (.md), texto (.txt) y .json';
    if (fileInput) fileInput.value = '';
    if (textarea) textarea.value = '';
    this.pendingParsedSlides = null;
    this.pendingPresentationTitle = '';

    if (replaceCheck) {
      const isBlank = (!this.currentProject.slides || this.currentProject.slides.length <= 1) && (!this.currentProject.slides?.[0]?.title);
      replaceCheck.checked = isBlank;
    }

    modal.classList.add('active');
  },

  closeImportModal() {
    const modal = document.getElementById('presentation-import-modal');
    if (modal) modal.classList.remove('active');
  },

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('pres-file-dropzone');
    if (dropzone) dropzone.classList.add('dragover');
  },

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('pres-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
  },

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('pres-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFileInput(e.dataTransfer.files[0]);
    }
  },

  async handleFileInput(file) {
    if (!file) return;
    const label = document.getElementById('pres-dropzone-label');
    const filename = document.getElementById('pres-dropzone-filename');
    const textarea = document.getElementById('pres-import-textarea');

    if (label) label.textContent = `📄 ${file.name}`;
    if (filename) filename.textContent = `Tamaño: ${(file.size / 1024).toFixed(1)} KB — Leyendo archivo...`;

    const ext = file.name.toLowerCase().split('.').pop();
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    // 1. Archivo JSON / Mentix
    if (ext === 'json' || ext === 'mentix') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
            this.pendingParsedSlides = parsed.slides;
            this.pendingPresentationTitle = parsed.title || baseName;
            if (textarea) textarea.value = `// Presentación JSON cargada: ${parsed.slides.length} diapositivas`;
            if (filename) filename.textContent = `✅ Archivo JSON cargado con ${parsed.slides.length} diapositivas. Haz clic en "Procesar e Importar".`;
            return;
          }
        } catch (err) {}
        if (textarea) textarea.value = e.target.result;
        if (filename) filename.textContent = `✅ Archivo leído. Haz clic en "Procesar e Importar".`;
      };
      reader.readAsText(file, 'UTF-8');
      return;
    }

    // 2. Documentos PDF (.pdf)
    if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Convirtiendo páginas de PDF en diapositivas visuales de alta definición...';
        const slides = await this.extractSlidesFromPDF(e.target.result);
        if (slides && slides.length > 0) {
          this.pendingParsedSlides = slides;
          this.pendingPresentationTitle = baseName;
          if (textarea) textarea.value = `// ✅ ${slides.length} diapositivas listas en pantalla completa.\n// Cada lámina se proyectará limpia con su diseño original sin textos adicionales.`;
          if (filename) filename.textContent = `✅ ¡PDF procesado! Se crearon ${slides.length} diapositivas en pantalla completa. Haz clic en "Procesar e Importar".`;
        } else {
          if (filename) filename.textContent = `⚠️ No se pudo procesar el PDF automáticamente. Prueba exportándolo a texto o PowerPoint.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 3. Presentaciones PowerPoint (.pptx)
    if (ext === 'pptx') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Extrayendo diapositivas de PowerPoint...';
        const slides = await this.extractSlidesFromPPTX(e.target.result);
        if (slides && slides.length > 0) {
          this.pendingParsedSlides = slides;
          this.pendingPresentationTitle = baseName;
          if (textarea) textarea.value = slides.map((s, i) => `## Diapositiva ${i+1}: ${s.title}\n${s.bullets.map(b => '- ' + b).join('\n')}`).join('\n\n---\n\n');
          if (filename) filename.textContent = `✅ ¡PowerPoint procesado! Se encontraron ${slides.length} diapositivas. Haz clic en "Procesar e Importar".`;
        } else {
          if (filename) filename.textContent = `⚠️ No se pudieron descomprimir las diapositivas de PowerPoint. Puedes pegar el texto en el recuadro.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 4. Texto plano / Markdown
    const reader = new FileReader();
    reader.onload = (e) => {
      if (textarea) textarea.value = e.target.result;
      if (filename) filename.textContent = `✅ Texto cargado con éxito. Haz clic en "Procesar e Importar".`;
    };
    reader.readAsText(file, 'UTF-8');
  },

  async extractSlidesFromPPTX(arrayBuffer) {
    try {
      const bytes = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      const slideEntries = [];

      let i = 0;
      while (i < bytes.length - 30) {
        if (bytes[i] === 0x50 && bytes[i+1] === 0x4B && bytes[i+2] === 0x03 && bytes[i+3] === 0x04) {
          const compression = bytes[i+8] | (bytes[i+9] << 8);
          const compSize = (bytes[i+18]) | (bytes[i+19] << 8) | (bytes[i+20] << 16) | (bytes[i+21] << 24);
          const nameLen = bytes[i+26] | (bytes[i+27] << 8);
          const extraLen = bytes[i+28] | (bytes[i+29] << 8);

          const fileNameBytes = bytes.slice(i + 30, i + 30 + nameLen);
          const fileName = textDecoder.decode(fileNameBytes);
          const dataStart = i + 30 + nameLen + extraLen;

          if (fileName.includes('ppt/slides/slide') && fileName.endsWith('.xml') && compSize > 0 && dataStart + compSize <= bytes.length) {
            try {
              const compData = bytes.slice(dataStart, dataStart + compSize);
              let xmlStr = '';
              if (compression === 8 && typeof DecompressionStream !== 'undefined') {
                const ds = new DecompressionStream('deflate-raw');
                const writer = ds.writable.getWriter();
                writer.write(compData);
                writer.close();
                const decomp = await new Response(ds.readable).arrayBuffer();
                xmlStr = textDecoder.decode(new Uint8Array(decomp));
              } else if (compression === 0) {
                xmlStr = textDecoder.decode(compData);
              }

              if (xmlStr) {
                const matchSlideNum = fileName.match(/slide(\d+)\.xml/);
                const slideNum = matchSlideNum ? parseInt(matchSlideNum[1], 10) : 999;

                const pMatches = xmlStr.match(/<a:p[\s\S]*?<\/a:p>/g) || [];
                const lines = pMatches.map(p => {
                  const tMatches = p.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
                  return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
                }).filter(l => l.trim().length > 0);

                if (lines.length > 0) {
                  slideEntries.push({ num: slideNum, lines });
                }
              }
            } catch (err) {
              console.warn('PPTX slide error:', fileName, err);
            }
          }
          i = dataStart + (compSize > 0 ? compSize : 1);
        } else {
          i++;
        }
      }

      if (slideEntries.length > 0) {
        slideEntries.sort((a, b) => a.num - b.num);
        return slideEntries.map((se, idx) => {
          const lines = se.lines;
          const title = lines[0] || `Diapositiva ${idx + 1}`;
          let subtitle = (lines.length > 1 && lines[1].length < 90) ? lines[1] : '';
          let startIndex = subtitle ? 2 : 1;
          let bullets = lines.slice(startIndex, startIndex + 5);
          let content = lines.slice(startIndex + 5).join(' ');
          return {
            id: 'slide_' + Date.now() + '_' + idx,
            title,
            subtitle,
            content,
            bullets,
            media: '',
            teacherNotes: ''
          };
        });
      }
    } catch (e) {
      console.warn('PPTX extraction warning:', e);
    }
    return null;
  },

  async extractSlidesFromPDF(arrayBuffer) {
    if (!window.pdfjsLib || !window.pdfjsLib.getDocument) {
      return null;
    }
    try {
      const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const slides = [];

      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);

        let imgDataUrl = '';
        try {
          // Escala 2.0 para nitidez máxima en pantallas grandes y proyectores
          const scale = 2.0;
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');
          await page.render({ canvasContext: ctx, viewport }).promise;
          imgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
        } catch (renderErr) {
          console.warn('PDF page render error:', renderErr);
        }

        // Las láminas de PDF ya contienen su diseño y textos completos. Se proyectan en pantalla completa sin textos adicionales.
        slides.push({
          id: 'slide_' + Date.now() + '_' + pageNum,
          title: `Diapositiva ${pageNum}`,
          subtitle: '',
          content: '',
          bullets: [],
          media: imgDataUrl,
          layout: 'full',
          isImported: true,
          isFullImage: true,
          teacherNotes: ''
        });
      }
      return slides;
    } catch (err) {
      console.error('Error procesando PDF:', err);
      return null;
    }
  },

  parseTextOutline(rawText) {
    if (!rawText || !rawText.trim()) return { slides: [], presentationTitle: '' };

    let blocks = [];
    if (rawText.includes('---') || rawText.includes('===')) {
      blocks = rawText.split(/\n\s*[-=]{3,}\s*\n/).map(b => b.trim()).filter(Boolean);
    } else if (rawText.match(/\n\s*##\s+/)) {
      blocks = rawText.split(/\n(?=\s*##\s+)/).map(b => b.trim()).filter(Boolean);
    } else {
      blocks = rawText.split(/\n\s*\n\s*\n/).map(b => b.trim()).filter(Boolean);
      if (blocks.length <= 1) {
        blocks = rawText.split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
      }
    }

    const slides = [];
    let detectedPresentationTitle = '';

    blocks.forEach((block, idx) => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      if (idx === 0 && lines[0].startsWith('# ') && !lines[0].startsWith('## ')) {
        detectedPresentationTitle = lines[0].replace(/^#\s*/, '').trim();
        lines.shift();
        if (lines.length === 0) return;
      }

      let title = '';
      let subtitle = '';
      const bullets = [];
      const contentLines = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (i === 0) {
          title = line.replace(/^(#+|Diapositiva\s*\d+:?|Lámina\s*\d+:?)/i, '').trim() || `Diapositiva ${slides.length + 1}`;
        } else if (line.startsWith('- ') || line.startsWith('* ') || line.startsWith('• ')) {
          bullets.push(line.replace(/^[-*•]\s*/, '').trim());
        } else if (!subtitle && line.length < 80 && bullets.length === 0 && contentLines.length === 0) {
          subtitle = line;
        } else {
          contentLines.push(line);
        }
      }

      slides.push({
        id: 'slide_' + Date.now() + '_' + (slides.length + 1),
        title: title || `Diapositiva ${slides.length + 1}`,
        subtitle: subtitle,
        content: contentLines.join(' '),
        bullets: bullets,
        media: '',
        teacherNotes: ''
      });
    });

    return { slides, presentationTitle: detectedPresentationTitle };
  },

  insertSampleTemplate() {
    const textarea = document.getElementById('pres-import-textarea');
    if (!textarea) return;
    textarea.value = `# El Sistema Solar y la Exploración Planetaria

---
## Diapositiva 1: El Sol y la Estrella Central
El Sol representa el 99.8% de la masa total de nuestro sistema solar y es el motor gravitatorio y de energía de todos los planetas.
- Tipo espectral: Enana amarilla (G2V)
- Temperatura superficial: Aprox. 5,500 °C
- Fuente de energía: Fusión nuclear de hidrógeno en helio

---
## Diapositiva 2: Planetas Rocosos o Terrestres
Los cuatro planetas más cercanos al Sol poseen superficies sólidas y atmósferas con composiciones variables.
- Mercurio: El más pequeño y cercano, sin atmósfera significativa.
- Venus: Efecto invernadero extremo y alta presión.
- Tierra: Único planeta conocido con vida y agua líquida superficial.
- Marte: El planeta rojo, con volcanes inactivos y presencia de hielo.

---
## Diapositiva 3: Gigantes Gaseosos y Helados
Más allá del cinturón de asteroides se encuentran los mundos masivos del sistema exterior.
- Júpiter: El planeta más grande con su Gran Mancha Roja.
- Saturno: Famoso por su espectacular sistema de anillos.
- Urano y Neptuno: Gigantes helados con metano en su atmósfera.

---
## Diapositiva 4: Preguntas de Discusión en Clase
Espacio para evaluar comprensión y debatir ideas principales con el grupo.
- ¿Por qué Mercurio no es el planeta más caliente si está más cerca del Sol?
- ¿Qué condiciones hicieron posible el surgimiento de la vida en la Tierra?`;
  },

  processImport() {
    const textarea = document.getElementById('pres-import-textarea');
    const replaceCheck = document.getElementById('pres-replace-check');
    const shouldReplace = replaceCheck ? replaceCheck.checked : true;

    let importedSlides = this.pendingParsedSlides || [];
    let customTitle = this.pendingPresentationTitle || '';

    const textVal = textarea ? textarea.value.trim() : '';
    if ((!importedSlides || importedSlides.length === 0) && textVal) {
      const parsed = this.parseTextOutline(textVal);
      importedSlides = parsed.slides || [];
      if (parsed.presentationTitle) customTitle = parsed.presentationTitle;
    }

    if (!importedSlides || importedSlides.length === 0) {
      alert('⚠️ No se encontraron diapositivas válidas para importar. Por favor selecciona un archivo (.pptx, .pdf, .json) o pega el esquema en el cuadro de texto.');
      return;
    }

    if (customTitle && (!this.currentProject.title || this.currentProject.title.trim() === '')) {
      this.currentProject.title = customTitle;
    }

    const hasFullImages = importedSlides.some(s => s.isImported || s.isFullImage || (s.media && s.media.startsWith('data:image/')));
    if (hasFullImages) {
      this.currentProject.isImported = true;
    }

    if (shouldReplace || !this.currentProject.slides || this.currentProject.slides.length === 0) {
      this.currentProject.slides = importedSlides;
    } else {
      this.currentProject.slides.push(...importedSlides);
    }

    this.currentSlideIndex = 0;
    this.pendingParsedSlides = null;
    this.pendingPresentationTitle = '';

    this.closeImportModal();
    this.renderEditor(document.getElementById('view-presentation'));

    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }
    alert(`🎉 ¡Se importaron exitosamente ${importedSlides.length} diapositivas a tu presentación!`);
  },

  renderSlideMediaInputs(currentSlide, isVideoLayout) {
    const e = (v) => this.escapeHtml(v || '');
    const inputStyle = 'width: 100%; padding: 0.75rem 1rem; border-radius: 10px; background: rgba(0,0,0,0.3); border: 1.5px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none;';
    const notes = '<label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">Notas del Docente (Privadas)</label>' +
      '<input type="text" value="' + e(currentSlide.teacherNotes) + '" placeholder="Puntos a recordar al exponer..." style="' + inputStyle + '" oninput="window.PresentationView.updateCurrentSlideField(\'teacherNotes\', this.value)" />';

    if (!isVideoLayout) {
      return '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">' +
        '<div><label style="display: block; font-size: 0.85rem; font-weight: 800; margin-bottom: 0.4rem;">URL de Imagen de Apoyo</label>' +
        '<input type="text" value="' + e(currentSlide.media) + '" placeholder="https://..." style="' + inputStyle + '" oninput="window.PresentationView.updateCurrentSlideField(\'media\', this.value)" /></div>' +
        '<div>' + notes + '</div></div>';
    }

    const videoSrc = currentSlide.videoUrl || currentSlide.media;
    const clearBtn = videoSrc
      ? '<button type="button" class="btn btn-outline" style="padding: 0.75rem 0.9rem; font-size: 0.85rem;" onclick="window.PresentationView.updateSlideVideo(\'\'); document.getElementById(\'edit-slide-video-input\').value=\'\';" title="Quitar video">🗑️</button>'
      : '';
    const preview = videoSrc
      ? '<div style="margin-top: 1rem; max-width: 560px;"><div style="font-size: 0.8rem; font-weight: 800; color: var(--neon-cyan); margin-bottom: 0.45rem;">Vista previa del reproductor:</div>' +
        this.renderVideoPlayerHtml(this.parseVideoSource(videoSrc), 'max-height: 240px; min-height: 200px;') + '</div>'
      : '';

    return '<div style="background: rgba(239, 68, 68, 0.08); border: 1.5px solid rgba(239, 68, 68, 0.35); border-radius: 14px; padding: 1.15rem 1.25rem; margin-bottom: 1.25rem;">' +
      '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; flex-wrap: wrap; gap: 0.5rem;">' +
      '<label style="font-size: 0.9rem; font-weight: 900; color: #fca5a5; display: flex; align-items: center; gap: 0.4rem; margin: 0;"><span>🎬</span> URL del Video Explicativo (en vez de imagen)</label>' +
      '<span style="font-size: 0.78rem; color: var(--text-muted);">YouTube, Google Drive, Vimeo, Loom o MP4 directo</span></div>' +
      '<div style="display: flex; gap: 0.75rem; align-items: center;">' +
      '<input type="text" id="edit-slide-video-input" value="' + e(videoSrc) + '" placeholder="https://www.youtube.com/watch?v=..." style="flex: 1; ' + inputStyle + '" oninput="window.PresentationView.updateSlideVideo(this.value)" />' +
      clearBtn + '</div>' + preview + '</div>' +
      '<div style="margin-bottom: 1rem;">' + notes + '</div>';
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
