/**
 * 🔥 TE RETO - Creador de Retos y Preguntas Multimedia
 * Permite a profesores y usuarios crear cuestionarios con múltiples tipos de preguntas y validaciones.
 */

window.CreatorView = {
  currentChallenge: null,
  currentPage: 1,
  pageSize: 20,

  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  escapeAttr(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  },

  cleanAIText(str, isQuestion = false) {
    if (!str) return '';
    let res = String(str)
      // 1. Quitar encabezados o separadores (ej: --- Gestión de datos --- o === ...)
      .replace(/^[-=~#*_]{2,}\s*[^-\n=]+\s*[-=~#*_]{2,}/g, '')
      .replace(/[-=~#*_]{2,}/g, ' ')
      // 2. Quitar referencias bibliográficas tipo [1], [2], etc.
      .replace(/\[\d+\]/g, '')
      // 3. Quitar viñetas o prefijos redundantes de incisos (ej: "a) ", "1. ", "- ")
      .replace(/^[\s•\-\*\>]+/, '')
      .replace(/^[a-dA-D1-4]\)\s*/, '')
      .replace(/^[1-4]\.\s*/, '')
      // 4. Normalizar espacios sin cortar texto
      .replace(/\s+/g, ' ')
      .trim();

    // 5. Para preguntas, asegurar que inicien y finalicen con signos interrogativos si corresponde
    if (isQuestion && res) {
      if (/^(¿|qué|cuál|cuáles|cómo|cuándo|dónde|por qué|quién|quiénes|en qué|de qué)/i.test(res) && !res.endsWith('?')) {
        res = res + '?';
      }
      if (res.endsWith('?') && !res.startsWith('¿') && !res.includes(':')) {
        res = '¿' + res;
      }
    }

    return res;
  },

  autoResizeTextarea(el) {
    if (!el) return;
    el.style.height = 'auto';
    const isQ = el.classList.contains('creator-question-textarea');
    const minH = isQ ? 58 : 38;
    const targetH = Math.max(minH, el.scrollHeight);
    el.style.height = targetH + 'px';
  },

  autoResizeAllTextareas() {
    setTimeout(() => {
      const textareas = document.querySelectorAll('.creator-question-textarea, .creator-option-textarea');
      textareas.forEach(el => this.autoResizeTextarea(el));
    }, 40);
  },

  resetForm(existingChallenge = null) {
    this.currentPage = 1;
    if (existingChallenge) {
      this.currentChallenge = JSON.parse(JSON.stringify(existingChallenge));
    } else {
      this.currentChallenge = {
        id: 'reto_' + Date.now(),
        title: '',
        description: '',
        category: 'tecnologia',
        difficulty: 'Medio',
        banner: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800',
        timePerQuestion: 20,
        pointsStandard: 1000,
        isPublic: true,
        questions: [
          this.createBlankQuestion(1)
        ]
      };
    }
  },

  createBlankQuestion(index = 1, type = 'single') {
    const base = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      text: '',
      type: type,
      media: '',
      mediaType: 'none',
      timeLimit: 20,
      points: 1000
    };

    if (type === 'boolean') {
      return {
        ...base,
        timeLimit: 15,
        options: [
          { text: 'Verdadero', shape: '✦', color: 'opt-1' },
          { text: 'Falso', shape: '⬢', color: 'opt-2' }
        ],
        correctAnswer: 0
      };
    }

    if (type === 'multi') {
      return {
        ...base,
        options: [
          { text: '', shape: '✦', color: 'opt-1' },
          { text: '', shape: '⬢', color: 'opt-2' },
          { text: '', shape: '⚡', color: 'opt-3' },
          { text: '', shape: '🛡️', color: 'opt-4' }
        ],
        correctAnswer: [0]
      };
    }

    if (type === 'text') {
      return {
        ...base,
        options: [],
        acceptedAnswers: [''],
        correctAnswer: ''
      };
    }

    if (type === 'open') {
      return {
        ...base,
        timeLimit: 30,
        options: [],
        correctAnswer: null
      };
    }

    if (type === 'poll') {
      return {
        ...base,
        points: 0,
        options: [
          { text: '', shape: '✦', color: 'opt-1' },
          { text: '', shape: '⬢', color: 'opt-2' },
          { text: '', shape: '⚡', color: 'opt-3' },
          { text: '', shape: '🛡️', color: 'opt-4' }
        ],
        correctAnswer: null
      };
    }

    return {
      ...base,
      options: [
        { text: '', shape: '✦', color: 'opt-1' },
        { text: '', shape: '⬢', color: 'opt-2' },
        { text: '', shape: '⚡', color: 'opt-3' },
        { text: '', shape: '🛡️', color: 'opt-4' }
      ],
      correctAnswer: 0
    };
  },

  render(existingChallenge = null) {
    const container = document.getElementById('view-creator');
    if (!container) return;

    if (!this.currentChallenge || existingChallenge) {
      this.resetForm(existingChallenge);
    }

    const c = this.currentChallenge;
    const categories = window.appState.categories;
    const totalCount = c.questions ? c.questions.length : 0;
    const totalPages = Math.max(1, Math.ceil(totalCount / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;
    const startIdx = (this.currentPage - 1) * this.pageSize;
    const endIdx = Math.min(startIdx + this.pageSize, totalCount);
    const visibleQuestions = c.questions ? c.questions.slice(startIdx, endIdx) : [];

    container.innerHTML = `
      <div style="max-width: 950px; margin: 0 auto; padding: 2rem 1.25rem 5rem;">
        <!-- Header -->
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 2rem;">
          <div>
            <button class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem; margin-bottom: 0.5rem;" onclick="window.appRouter.navigate('home')">
              ← Volver al Inicio
            </button>
            <h1 style="font-size: 2.2rem; display: flex; align-items: center; gap: 0.6rem;">
              <span class="glow-text-cyan">🎯</span> Estudio de Creación de Retos
            </h1>
            <p style="color: var(--text-secondary);">Diseña cuestionarios competitivos, rápidos y multimedia para tus clases o amigos.</p>
          </div>

          <div style="display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-primary" style="background: linear-gradient(135deg, #7209b7, #f72585); border: none; box-shadow: 0 0 15px rgba(247,37,133,0.35);" onclick="window.CreatorView.openAIModal()">
              <span>✨</span> Generar con IA
            </button>
            <button class="btn btn-outline" style="border-color: #3b82f6; color: #60a5fa;" onclick="window.CreatorView.openFileImportModal()">
              <span>📁</span> Importar Archivo
            </button>
            <button class="btn btn-outline" onclick="window.CreatorView.exportChallenge()">
              <span>💾</span> Exportar .mentix
            </button>
            <button class="btn btn-danger" style="background: rgba(239, 68, 68, 0.18); border: 1px solid #ef4444; color: #fca5a5; display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.65rem 1rem; border-radius: var(--border-radius-md); font-weight: 700; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#ef4444'; this.style.color='#fff';" onmouseout="this.style.background='rgba(239, 68, 68, 0.18)'; this.style.color='#fca5a5';" onclick="window.CreatorView.deleteCurrentChallenge()">
              <span>🗑️</span> Borrar Examen
            </button>
            <button class="btn btn-primary btn-lg" onclick="window.CreatorView.saveChallenge()">
              <span>🚀</span> Publicar Reto
            </button>
          </div>
        </div>

        <!-- Ajustes Principales del Reto -->
        <div class="glass-panel" style="padding: 2rem; margin-bottom: 2.5rem;">
          <h2 style="font-size: 1.3rem; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem;">
            <span>⚙️</span> Información General del Reto
          </h2>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.25rem; margin-bottom: 1.25rem;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Nombre del Reto *</label>
              <input 
                type="text" 
                id="challenge-title" 
                value="${c.title}" 
                placeholder="Ej: Torneo de Historia & Geografía Universal"
                style="width: 100%; padding: 0.75rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 1rem; outline: none;"
                onchange="window.CreatorView.currentChallenge.title = this.value"
              />
            </div>

            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Categoría</label>
              <select 
                id="challenge-category" 
                style="width: 100%; padding: 0.75rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 1rem; outline: none;"
                onchange="(function(sel){ const cat = (window.appState.categories||[]).find(c=>c.id===sel.value); window.CreatorView.currentChallenge.category = sel.value; window.CreatorView.currentChallenge.categoryName = cat ? cat.name : 'General'; })(this)"
              >
                ${categories.map(cat => `
                  <option value="${cat.id}" ${c.category === cat.id ? 'selected' : ''}>${cat.icon} ${cat.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1.25rem;">
            <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Descripción</label>
            <textarea 
              id="challenge-desc" 
              rows="2" 
              placeholder="Explica de qué trata el reto y qué temas incluye..."
              style="width: 100%; padding: 0.75rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.95rem; outline: none; resize: vertical;"
              onchange="window.CreatorView.currentChallenge.description = this.value"
            >${c.description}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Dificultad</label>
              <select 
                id="challenge-difficulty" 
                style="width: 100%; padding: 0.65rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary);"
                onchange="window.CreatorView.currentChallenge.difficulty = this.value"
              >
                <option value="Fácil" ${c.difficulty === 'Fácil' ? 'selected' : ''}>🟢 Fácil</option>
                <option value="Medio" ${c.difficulty === 'Medio' ? 'selected' : ''}>🟡 Medio</option>
                <option value="Difícil" ${c.difficulty === 'Difícil' ? 'selected' : ''}>🔴 Difícil</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Tiempo estándar (seg)</label>
              <select 
                id="challenge-time" 
                style="width: 100%; padding: 0.65rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary);"
                onchange="window.CreatorView.currentChallenge.timePerQuestion = parseInt(this.value)"
              >
                <option value="10" ${c.timePerQuestion === 10 ? 'selected' : ''}>10 segundos</option>
                <option value="15" ${c.timePerQuestion === 15 ? 'selected' : ''}>15 segundos</option>
                <option value="20" ${c.timePerQuestion === 20 ? 'selected' : ''}>20 segundos</option>
                <option value="30" ${c.timePerQuestion === 30 ? 'selected' : ''}>30 segundos</option>
                <option value="60" ${c.timePerQuestion === 60 ? 'selected' : ''}>60 segundos</option>
              </select>
            </div>

            <div>
              <label style="display: block; font-weight: 700; margin-bottom: 0.5rem; font-size: 0.9rem;">Imagen de Portada (URL)</label>
              <input 
                type="text" 
                id="challenge-banner" 
                value="${c.banner || ''}" 
                placeholder="https://images.unsplash..."
                style="width: 100%; padding: 0.65rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem;"
                onchange="window.CreatorView.currentChallenge.banner = this.value"
                oninput="window.CreatorView.currentChallenge.banner = this.value"
              />
            </div>
          </div>

          <!-- Entidad (Opcional) -->
          <div style="margin-top: 1.25rem; padding: 1rem 1.15rem; border-radius: 12px; border: 1.5px dashed rgba(0,245,212,0.3); background: rgba(0,245,212,0.04);">
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.85rem;">
              <span style="font-size: 1.1rem;">🏫</span>
              <span style="font-weight: 800; font-size: 0.95rem; color: var(--text-primary);">Entidad</span>
              <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 500;">(opcional) — aparece en la esquina de la tarjeta</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
              <div>
                <label style="display: block; font-weight: 700; margin-bottom: 0.4rem; font-size: 0.85rem; color: var(--text-secondary);">Nombre de la Entidad</label>
                <input 
                  type="text"
                  id="challenge-entity-name"
                  value="${c.entityName || ''}"
                  placeholder="Ej: Colegio San José"
                  style="width: 100%; padding: 0.65rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.88rem; outline: none; box-sizing: border-box;"
                  oninput="window.CreatorView.currentChallenge.entityName = this.value"
                />
              </div>
              <div>
                <label style="display: block; font-weight: 700; margin-bottom: 0.4rem; font-size: 0.85rem; color: var(--text-secondary);">Logo de la Entidad (URL o Subir Imagen)</label>
                <div style="display: flex; gap: 0.5rem; align-items: center; flex-wrap: wrap;">
                  <input 
                    type="text"
                    id="challenge-entity-logo"
                    value="${c.entityLogo || ''}"
                    placeholder="https://... o sube una imagen"
                    style="flex: 1; min-width: 160px; padding: 0.65rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; outline: none;"
                    oninput="window.CreatorView.currentChallenge.entityLogo = this.value; const prev=document.getElementById('entity-logo-preview'); if(prev) prev.src = this.value || '';"
                  />
                  <label class="btn btn-outline" style="padding: 0.55rem 0.85rem; font-size: 0.82rem; cursor: pointer; display: inline-flex; align-items: center; gap: 0.35rem; margin: 0;">
                    <span>📁</span> Subir Logo
                    <input 
                      type="file" 
                      accept="image/*" 
                      style="display: none;" 
                      onchange="window.CreatorView.handleEntityLogoUpload(this.files[0])"
                    />
                  </label>
                  <div style="width: 44px; height: 44px; border-radius: 10px; border: 1.5px solid var(--border-color); background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px;">
                    <img 
                      id="entity-logo-preview"
                      src="${c.entityLogo || ''}"
                      alt="logo"
                      style="width: 100%; height: 100%; object-fit: contain; display: ${c.entityLogo ? 'block' : 'none'};"
                      onerror="this.style.display='none'"
                      onload="this.style.display='block'"
                    />
                  </div>
                </div>
                <span style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.3rem; display: block;">
                  ✨ Al subir el logo, Mentix remueve automáticamente fondos blancos para que quede como PNG transparente perfecto.
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Lista de Preguntas -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.25rem; flex-wrap: wrap; gap: 0.75rem;">
          <h2 style="font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
            <span>📋</span> Preguntas del Reto (<span id="question-count">${totalCount.toLocaleString()}</span>)
          </h2>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
            <button class="btn btn-outline" onclick="window.CreatorView.addQuestion('boolean')">
              <span>⚖️</span> + V / F
            </button>
            <button class="btn btn-cyan" onclick="window.CreatorView.addQuestion('single')">
              <span>➕</span> Agregar Pregunta
            </button>
          </div>
        </div>

        ${this.renderPaginationControls(totalCount)}

        <div id="questions-list">
          ${visibleQuestions.map((q, localIdx) => this.renderQuestionCard(q, startIdx + localIdx)).join('')}
        </div>

        ${totalCount > this.pageSize ? this.renderPaginationControls(totalCount) : ''}

        </div>
      </div>
    `;

    this.autoResizeAllTextareas();
  },

  renderPaginationControls(totalCount) {
    if (!totalCount || totalCount <= this.pageSize) return '';
    const totalPages = Math.ceil(totalCount / this.pageSize);
    const p = Math.max(1, Math.min(this.currentPage, totalPages));
    const start = (p - 1) * this.pageSize + 1;
    const end = Math.min(p * this.pageSize, totalCount);

    return `
      <div class="creator-pagination-bar" style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.75rem; background: var(--bg-card); padding: 0.75rem 1rem; border-radius: var(--border-radius-md); border: 1px solid var(--border-color); margin-bottom: 1.25rem;">
        <div style="font-size: 0.9rem; color: var(--text-secondary); font-weight: 600;">
          Mostrando preguntas <strong style="color: var(--neon-cyan);">${start.toLocaleString()} - ${end.toLocaleString()}</strong> de <strong style="color: var(--text-primary);">${totalCount.toLocaleString()}</strong>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;">
          <button type="button" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" ${p <= 1 ? 'disabled style="opacity: 0.4; pointer-events: none;"' : ''} onclick="window.CreatorView.changePage(${p - 1})">
            ◀ Anterior
          </button>
          <span style="font-weight: 700; font-size: 0.9rem; padding: 0 0.5rem; color: var(--text-primary);">
            Página ${p} de ${totalPages}
          </span>
          <button type="button" class="btn btn-outline" style="padding: 0.35rem 0.75rem; font-size: 0.85rem;" ${p >= totalPages ? 'disabled style="opacity: 0.4; pointer-events: none;"' : ''} onclick="window.CreatorView.changePage(${p + 1})">
            Siguiente ▶
          </button>
          <div style="display: flex; align-items: center; gap: 0.35rem; margin-left: 0.5rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted);">Ir a pregunta:</span>
            <input type="number" min="1" max="${totalCount}" placeholder="#" style="width: 75px; padding: 0.3rem 0.5rem; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem; font-weight: 700; text-align: center;" onkeydown="if(event.key==='Enter'){ window.CreatorView.jumpToQuestion(parseInt(this.value)); }" />
          </div>
        </div>
      </div>
    `;
  },

  changePage(newPage) {
    const totalPages = Math.ceil(this.currentChallenge.questions.length / this.pageSize);
    this.currentPage = Math.max(1, Math.min(newPage, totalPages));
    this.render();
    const qList = document.getElementById('questions-list');
    if (qList) qList.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  jumpToQuestion(qNum) {
    if (!qNum || isNaN(qNum)) return;
    const qIdx = Math.max(0, Math.min(qNum - 1, this.currentChallenge.questions.length - 1));
    this.currentPage = Math.floor(qIdx / this.pageSize) + 1;
    this.render();
    setTimeout(() => {
      const card = document.getElementById('q-card-' + qIdx);
      if (card) {
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        card.style.outline = '2px solid var(--neon-cyan)';
        setTimeout(() => { card.style.outline = ''; }, 1800);
      }
    }, 120);
  },

  renderQuestionCard(q, idx) {
    const isText = q.type === 'text';
    const isOpen = q.type === 'open';
    const isMulti = q.type === 'multi';
    const isPoll = q.type === 'poll';
    const isBool = q.type === 'boolean';

    return `
      <div class="question-item-card" id="q-card-${idx}">
        <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 0.5rem; margin-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
          <div style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap;">
            <span style="background: var(--neon-cyan); color: #0b0f19; font-weight: 900; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.9rem;">
              ${idx + 1}
            </span>
            <span style="font-weight: 800; font-size: 1.05rem;">Pregunta ${idx + 1}</span>

            <!-- Selector Interactivo de Tipo de Pregunta -->
            <select 
              class="question-type-select" 
              style="padding: 0.3rem 0.75rem; border-radius: 9999px; background: rgba(0, 245, 212, 0.12); color: var(--neon-cyan); border: 1.5px solid var(--neon-cyan); font-size: 0.82rem; font-weight: 700; cursor: pointer; outline: none; transition: all 0.2s;"
              onchange="window.CreatorView.changeQuestionType(${idx}, this.value)"
              title="Cambiar formato de esta pregunta"
            >
              <option value="single" ${q.type === 'single' || !q.type ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">🔘 Selección Múltiple</option>
              <option value="boolean" ${q.type === 'boolean' ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">⚖️ Verdadero / Falso</option>
              <option value="multi" ${q.type === 'multi' ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">☑️ Varias Respuestas</option>
              <option value="text" ${q.type === 'text' ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">✍️ Respuesta Corta</option>
              <option value="open" ${q.type === 'open' ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">💬 Respuesta Abierta</option>
              <option value="poll" ${q.type === 'poll' ? 'selected' : ''} style="background: var(--bg-card); color: var(--text-primary);">📊 Encuesta / Votación</option>
            </select>
          </div>

          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem;">
              <span>⏱️</span>
              <select 
                style="padding: 0.25rem 0.5rem; border-radius: 6px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color);"
                onchange="window.CreatorView.updateQuestionParam(${idx}, 'timeLimit', parseInt(this.value))"
              >
                <option value="10" ${q.timeLimit === 10 ? 'selected' : ''}>10s</option>
                <option value="15" ${q.timeLimit === 15 ? 'selected' : ''}>15s</option>
                <option value="20" ${q.timeLimit === 20 ? 'selected' : ''}>20s</option>
                <option value="30" ${q.timeLimit === 30 ? 'selected' : ''}>30s</option>
                <option value="60" ${q.timeLimit === 60 ? 'selected' : ''}>60s</option>
              </select>
            </div>

            <div style="display: flex; align-items: center; gap: 0.35rem; font-size: 0.85rem;">
              <span>🏆</span>
              <select 
                style="padding: 0.25rem 0.5rem; border-radius: 6px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color);"
                onchange="window.CreatorView.updateQuestionParam(${idx}, 'points', parseInt(this.value))"
              >
                <option value="1000" ${q.points === 1000 ? 'selected' : ''}>1.000 pts</option>
                <option value="2000" ${q.points === 2000 ? 'selected' : ''}>2.000 pts (Doble)</option>
                <option value="0" ${q.points === 0 || isPoll ? 'selected' : ''}>Sin puntos</option>
              </select>
            </div>

            <button class="btn btn-outline" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;" onclick="window.CreatorView.duplicateQuestion(${idx})">
              📋 Duplicar
            </button>
            <button class="btn btn-danger" style="padding: 0.25rem 0.6rem; font-size: 0.8rem;" onclick="window.CreatorView.removeQuestion(${idx})">
              🗑️
            </button>
          </div>
        </div>

        <!-- Enunciado de la pregunta (Textarea autoexpandible para que preguntas extensas se lean completas) -->
        <div style="margin-bottom: 1rem;">
          <textarea 
            class="creator-question-textarea"
            rows="2" 
            placeholder="Escribe aquí la pregunta..." 
            style="width: 100%; min-height: 58px; padding: 0.85rem 1rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 2px solid var(--border-color); color: var(--text-primary); font-size: 1.05rem; font-weight: 700; outline: none; resize: vertical; line-height: 1.45; font-family: inherit; overflow: hidden; box-sizing: border-box;"
            oninput="window.CreatorView.updateQuestionText(${idx}, this.value); window.CreatorView.autoResizeTextarea(this);"
            onfocus="this.style.borderColor='var(--neon-cyan)'"
            onblur="this.style.borderColor='var(--border-color)'"
          >${this.escapeHtml(q.text)}</textarea>
        </div>

        <!-- Adjunto Multimedia (Imagen, Audio o Video) -->
        <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1.25rem; background: rgba(0,0,0,0.25); padding: 0.6rem 0.85rem; border-radius: var(--border-radius-md);">
          <span style="font-size: 0.85rem; color: var(--text-secondary); font-weight: 600;">🖼️ Multimedia opcional:</span>
          <select 
            style="padding: 0.3rem 0.6rem; border-radius: 6px; background: var(--bg-card); color: var(--text-primary); border: 1px solid var(--border-color); font-size: 0.85rem;"
            onchange="window.CreatorView.updateQuestionParam(${idx}, 'mediaType', this.value)"
          >
            <option value="none" ${q.mediaType === 'none' ? 'selected' : ''}>Ninguno</option>
            <option value="image" ${q.mediaType === 'image' ? 'selected' : ''}>Imagen (URL)</option>
            <option value="audio" ${q.mediaType === 'audio' ? 'selected' : ''}>Audio (Clip)</option>
            <option value="video" ${q.mediaType === 'video' ? 'selected' : ''}>Video (Embed)</option>
          </select>

          ${q.mediaType !== 'none' ? `
            <input 
              type="text" 
              placeholder="Pega la URL de la ${q.mediaType}..."
              value="${this.escapeAttr(q.media || '')}"
              style="flex: 1; min-width: 200px; padding: 0.35rem 0.65rem; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-size: 0.85rem;"
              onchange="window.CreatorView.updateQuestionParam(${idx}, 'media', this.value)"
            />
          ` : ''}
        </div>

        <!-- Opciones de Respuesta según el Tipo de Pregunta -->
        ${isOpen ? `
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 1.25rem; border: 1.5px dashed #a855f7;">
            <div style="font-weight: 800; font-size: 1.05rem; margin-bottom: 0.35rem; color: #c084fc; display: flex; align-items: center; gap: 0.5rem;">
              <span>💬</span> Pregunta / Respuesta Abierta (Estilo Mentix)
            </div>
            <p style="font-size: 0.88rem; color: var(--text-secondary); margin: 0 0 0.75rem; line-height: 1.45;">
              Los estudiantes responderán con sus propias palabras, ideas o reflexiones. Todas las respuestas aparecerán en tiempo real como un muro de tarjetas en la pantalla del profesor o presentador.
            </p>
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.82rem; color: var(--neon-cyan); background: rgba(0, 245, 212, 0.08); padding: 0.55rem 0.85rem; border-radius: 8px; border: 1px solid rgba(0, 245, 212, 0.2);">
              <span>⚡</span> Otorga puntos por participación automáticamente a cada respuesta enviada.
            </div>
          </div>
        ` : isText ? `
          <div style="background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 1.25rem; border: 1px dashed var(--neon-cyan);">
            <label style="display: block; font-weight: 700; font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--neon-cyan);">
              ✍️ Respuesta(s) correcta(s) aceptada(s):
            </label>
            <input 
              type="text" 
              placeholder="Escribe la respuesta esperada (ej: Ludwig van Beethoven, Beethoven)"
              value="${this.escapeAttr(Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.join(', ') : (q.correctAnswer || ''))}"
              style="width: 100%; padding: 0.75rem 1rem; border-radius: var(--border-radius-md); background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-primary); font-weight: 600; font-size: 1rem; outline: none;"
              oninput="window.CreatorView.updateAcceptedAnswers(${idx}, this.value)"
            />
            <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 0.45rem;">
              💡 Separa con comas las variantes válidas. La corrección automática no distingue mayúsculas, minúsculas ni tildes.
            </div>
          </div>
        ` : isPoll ? `
          <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #a78bfa; font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
            <span>📊</span> En una encuesta no hay respuestas incorrectas. Todos los votos de los participantes se registrarán.
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
            ${(q.options || []).map((opt, optIdx) => `
              <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 0.5rem; border: 1px solid rgba(167, 139, 250, 0.4);">
                <div 
                  style="width: 38px; height: 38px; border-radius: 8px; border: 2px solid rgba(167, 139, 250, 0.5); background: rgba(167, 139, 250, 0.15); color: #c4b5fd; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; flex-shrink: 0;"
                >
                  ${opt.shape}
                </div>

                <textarea 
                  class="creator-option-textarea"
                  rows="1"
                  placeholder="Opción ${optIdx + 1} de encuesta"
                  style="flex: 1; min-height: 38px; padding: 0.45rem 0.6rem; border-radius: 6px; background: transparent; border: none; color: var(--text-primary); font-weight: 600; font-size: 0.95rem; outline: none; resize: vertical; font-family: inherit; line-height: 1.35; word-break: break-word; overflow: hidden; box-sizing: border-box;"
                  oninput="window.CreatorView.updateOptionText(${idx}, ${optIdx}, this.value); window.CreatorView.autoResizeTextarea(this);"
                >${this.escapeHtml(opt.text)}</textarea>
              </div>
            `).join('')}
          </div>
        ` : isMulti ? `
          <div style="margin-bottom: 0.5rem; font-size: 0.85rem; color: var(--neon-cyan); font-weight: 700; display: flex; align-items: center; gap: 0.4rem;">
            <span>☑️</span> Haz clic en los botones para marcar una o más respuestas correctas (se iluminarán en verde):
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
            ${(q.options || []).map((opt, optIdx) => {
              const isCorr = Array.isArray(q.correctAnswer) ? q.correctAnswer.includes(optIdx) : (q.correctAnswer === optIdx);
              return `
              <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 0.5rem; border: 1.5px solid ${isCorr ? 'var(--neon-emerald)' : 'var(--border-color)'};">
                <button 
                  type="button" 
                  title="${isCorr ? 'Desmarcar como correcta' : 'Marcar como correcta'}"
                  onclick="window.CreatorView.toggleMultiCorrectAnswer(${idx}, ${optIdx})"
                  style="width: 38px; height: 38px; border-radius: 8px; border: 2px solid ${isCorr ? 'var(--neon-emerald)' : 'rgba(255,255,255,0.2)'}; background: ${isCorr ? 'var(--neon-emerald)' : 'transparent'}; color: ${isCorr ? '#0b0f19' : 'white'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: var(--transition-bounce); flex-shrink: 0;"
                >
                  ${isCorr ? '✓' : opt.shape}
                </button>

                <textarea 
                  class="creator-option-textarea"
                  rows="1"
                  placeholder="Opción ${optIdx + 1}"
                  style="flex: 1; min-height: 38px; padding: 0.45rem 0.6rem; border-radius: 6px; background: transparent; border: none; color: var(--text-primary); font-weight: 600; font-size: 0.95rem; outline: none; resize: vertical; font-family: inherit; line-height: 1.35; word-break: break-word; overflow: hidden; box-sizing: border-box;"
                  oninput="window.CreatorView.updateOptionText(${idx}, ${optIdx}, this.value); window.CreatorView.autoResizeTextarea(this);"
                >${this.escapeHtml(opt.text)}</textarea>
              </div>
            `}).join('')}
          </div>
        ` : `
          <!-- Selección Múltiple o Verdadero/Falso (1 correcta) -->
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 0.75rem;">
            ${(q.options || []).map((opt, optIdx) => `
              <div style="display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.3); border-radius: var(--border-radius-md); padding: 0.5rem; border: 1px solid ${q.correctAnswer === optIdx ? 'var(--neon-emerald)' : 'var(--border-color)'};">
                <button 
                  type="button" 
                  title="Marcar como respuesta correcta"
                  onclick="window.CreatorView.setCorrectAnswer(${idx}, ${optIdx})"
                  style="width: 38px; height: 38px; border-radius: 8px; border: 2px solid ${q.correctAnswer === optIdx ? 'var(--neon-emerald)' : 'rgba(255,255,255,0.2)'}; background: ${q.correctAnswer === optIdx ? 'var(--neon-emerald)' : 'transparent'}; color: ${q.correctAnswer === optIdx ? '#0b0f19' : 'white'}; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; cursor: pointer; transition: var(--transition-bounce); flex-shrink: 0;"
                >
                  ${q.correctAnswer === optIdx ? '✓' : opt.shape}
                </button>

                <textarea 
                  class="creator-option-textarea"
                  rows="1"
                  placeholder="Opción ${optIdx + 1}"
                  style="flex: 1; min-height: 38px; padding: 0.45rem 0.6rem; border-radius: 6px; background: transparent; border: none; color: var(--text-primary); font-weight: 600; font-size: 0.95rem; outline: none; resize: vertical; font-family: inherit; line-height: 1.35; word-break: break-word; overflow: hidden; box-sizing: border-box;"
                  oninput="window.CreatorView.updateOptionText(${idx}, ${optIdx}, this.value); window.CreatorView.autoResizeTextarea(this);"
                >${this.escapeHtml(opt.text)}</textarea>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;
  },

  changeQuestionType(qIdx, newType) {
    const q = this.currentChallenge.questions[qIdx];
    if (!q) return;
    q.type = newType;

    const shapes = ['✦', '⬢', '⚡', '🛡️'];
    const colors = ['opt-1', 'opt-2', 'opt-3', 'opt-4'];

    if (newType === 'boolean') {
      q.options = [
        { text: 'Verdadero', shape: '✦', color: 'opt-1' },
        { text: 'Falso', shape: '⬢', color: 'opt-2' }
      ];
      q.correctAnswer = 0;
      if (q.timeLimit > 20) q.timeLimit = 15;
    } else if (newType === 'multi') {
      if (!q.options || q.options.length < 4) {
        q.options = [
          { text: q.options?.[0]?.text || '', shape: '✦', color: 'opt-1' },
          { text: q.options?.[1]?.text || '', shape: '⬢', color: 'opt-2' },
          { text: q.options?.[2]?.text || '', shape: '⚡', color: 'opt-3' },
          { text: q.options?.[3]?.text || '', shape: '🛡️', color: 'opt-4' }
        ];
      }
      if (!Array.isArray(q.correctAnswer)) {
        q.correctAnswer = (q.correctAnswer !== undefined && q.correctAnswer !== null) ? [q.correctAnswer] : [0];
      }
    } else if (newType === 'text') {
      if (!q.acceptedAnswers || q.acceptedAnswers.length === 0) {
        if (typeof q.correctAnswer === 'string' && q.correctAnswer) {
          q.acceptedAnswers = [q.correctAnswer];
        } else if (q.options && q.options[q.correctAnswer]) {
          q.acceptedAnswers = [q.options[q.correctAnswer].text];
          q.correctAnswer = q.options[q.correctAnswer].text;
        } else {
          q.acceptedAnswers = [''];
          q.correctAnswer = '';
        }
      }
      q.options = [];
    } else if (newType === 'open') {
      q.options = [];
      q.acceptedAnswers = [];
      q.correctAnswer = null;
      if (q.timeLimit < 20) q.timeLimit = 30;
    } else if (newType === 'poll') {
      if (!q.options || q.options.length < 2) {
        q.options = [
          { text: '', shape: '✦', color: 'opt-1' },
          { text: '', shape: '⬢', color: 'opt-2' },
          { text: '', shape: '⚡', color: 'opt-3' },
          { text: '', shape: '🛡️', color: 'opt-4' }
        ];
      }
      q.correctAnswer = null;
      q.points = 0;
    } else {
      // single
      if (!q.options || q.options.length < 4) {
        q.options = [
          { text: q.options?.[0]?.text || '', shape: '🔷', color: 'opt-1' },
          { text: q.options?.[1]?.text || '', shape: '🔶', color: 'opt-2' },
          { text: q.options?.[2]?.text || '', shape: '🟢', color: 'opt-3' },
          { text: q.options?.[3]?.text || '', shape: '🟣', color: 'opt-4' }
        ];
      }
      if (Array.isArray(q.correctAnswer)) {
        q.correctAnswer = q.correctAnswer[0] || 0;
      } else if (typeof q.correctAnswer !== 'number') {
        q.correctAnswer = 0;
      }
    }

    this.render();
  },

  toggleMultiCorrectAnswer(qIdx, optIdx) {
    const q = this.currentChallenge.questions[qIdx];
    if (!q) return;
    if (!Array.isArray(q.correctAnswer)) {
      q.correctAnswer = (q.correctAnswer !== undefined && q.correctAnswer !== null) ? [q.correctAnswer] : [];
    }
    const idxInArray = q.correctAnswer.indexOf(optIdx);
    if (idxInArray >= 0) {
      if (q.correctAnswer.length > 1) {
        q.correctAnswer.splice(idxInArray, 1);
      } else {
        alert('⚠️ Debe haber al menos una respuesta marcada como correcta.');
      }
    } else {
      q.correctAnswer.push(optIdx);
      q.correctAnswer.sort((a, b) => a - b);
    }
    this.render();
  },

  updateAcceptedAnswers(qIdx, textVal) {
    const q = this.currentChallenge.questions[qIdx];
    if (!q) return;
    const list = textVal.split(',').map(s => s.trim()).filter(Boolean);
    q.acceptedAnswers = list.length > 0 ? list : [textVal.trim()];
    q.correctAnswer = list[0] || textVal.trim();
  },

  addQuestion(type = 'single') {
    const newQ = this.createBlankQuestion(this.currentChallenge.questions.length + 1, type);
    this.currentChallenge.questions.push(newQ);
    this.currentPage = Math.ceil(this.currentChallenge.questions.length / this.pageSize);
    this.render();
  },

  duplicateQuestion(idx) {
    const copy = JSON.parse(JSON.stringify(this.currentChallenge.questions[idx]));
    copy.id = 'q_' + Date.now();
    this.currentChallenge.questions.splice(idx + 1, 0, copy);
    this.render();
  },

  removeQuestion(idx) {
    if (this.currentChallenge.questions.length <= 1) {
      alert('El reto debe tener al menos 1 pregunta.');
      return;
    }
    this.currentChallenge.questions.splice(idx, 1);
    const totalPages = Math.max(1, Math.ceil(this.currentChallenge.questions.length / this.pageSize));
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    this.render();
  },

  updateQuestionText(idx, val) {
    this.currentChallenge.questions[idx].text = val;
  },

  updateOptionText(qIdx, optIdx, val) {
    this.currentChallenge.questions[qIdx].options[optIdx].text = val;
  },

  setCorrectAnswer(qIdx, optIdx) {
    this.currentChallenge.questions[qIdx].correctAnswer = optIdx;
    this.render();
  },

  updateQuestionParam(qIdx, param, val) {
    this.currentChallenge.questions[qIdx][param] = val;
    this.render();
  },

  validateChallenge() {
    const c = this.currentChallenge;
    if (!c.title.trim()) {
      alert('⚠️ Por favor escribe un nombre para el reto.');
      return false;
    }
    if (!c.questions || c.questions.length === 0) {
      alert('⚠️ No se puede publicar un reto sin preguntas.');
      return false;
    }
    for (let i = 0; i < c.questions.length; i++) {
      const q = c.questions[i];
      if (!q.text.trim()) {
        alert(`⚠️ La pregunta #${i + 1} no tiene texto.`);
        return false;
      }
      if (q.type === 'open') {
        // Pregunta abierta no requiere opciones predefinidas
      } else if (q.type === 'text') {
        const ans = Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.filter(a => a && a.trim()) : [];
        const singleAns = (typeof q.correctAnswer === 'string' && q.correctAnswer.trim());
        if (ans.length === 0 && !singleAns) {
          alert(`⚠️ En la pregunta #${i + 1} debes ingresar al menos una respuesta aceptada.`);
          return false;
        }
      } else if (q.type === 'poll') {
        const filledOpts = (q.options || []).filter(o => o.text && o.text.trim());
        if (filledOpts.length < 2) {
          alert(`⚠️ En la pregunta #${i + 1} (Encuesta) debes escribir al menos 2 opciones.`);
          return false;
        }
      } else if (q.type === 'multi') {
        const emptyOptions = (q.options || []).filter(o => !o.text.trim());
        if (emptyOptions.length > 0) {
          alert(`⚠️ En la pregunta #${i + 1} hay respuestas vacías. Completa todas las opciones.`);
          return false;
        }
        if (!Array.isArray(q.correctAnswer) || q.correctAnswer.length === 0) {
          alert(`⚠️ En la pregunta #${i + 1} no has marcado ninguna respuesta correcta.`);
          return false;
        }
      } else {
        const emptyOptions = (q.options || []).filter(o => !o.text.trim());
        if (emptyOptions.length > 0) {
          alert(`⚠️ En la pregunta #${i + 1} hay respuestas vacías. Completa todas las opciones.`);
          return false;
        }
        if (q.correctAnswer === undefined || q.correctAnswer === null) {
          alert(`⚠️ En la pregunta #${i + 1} no has marcado la respuesta correcta.`);
          return false;
        }
      }
    }
    return true;
  },

  async handleEntityLogoUpload(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const originalDataUrl = e.target.result;
      try {
        const transparentDataUrl = await this.removeWhiteBackgroundFromImage(originalDataUrl);
        this.currentChallenge.entityLogo = transparentDataUrl || originalDataUrl;
      } catch (err) {
        this.currentChallenge.entityLogo = originalDataUrl;
      }
      const logoInput = document.getElementById('challenge-entity-logo');
      if (logoInput) logoInput.value = this.currentChallenge.entityLogo;
      const preview = document.getElementById('entity-logo-preview');
      if (preview) {
        preview.src = this.currentChallenge.entityLogo;
        preview.style.display = 'block';
      }
    };
    reader.readAsDataURL(file);
  },

  removeWhiteBackgroundFromImage(dataUrl, threshold = 215) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imgData.data;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            // Si el pixel es blanco o casi blanco (fondo típico de logos JPG)
            if (r >= threshold && g >= threshold && b >= threshold) {
              data[i + 3] = 0; // Transparente 100%
            }
          }

          ctx.putImageData(imgData, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  },

  async saveChallenge() {
    const titleEl = document.getElementById('challenge-title');
    const descEl = document.getElementById('challenge-desc');
    const catEl = document.getElementById('challenge-category');
    const diffEl = document.getElementById('challenge-difficulty');
    const timeEl = document.getElementById('challenge-time');
    const bannerEl = document.getElementById('challenge-banner');
    const entityNameEl = document.getElementById('challenge-entity-name');
    const entityLogoEl = document.getElementById('challenge-entity-logo');

    if (titleEl && titleEl.value.trim()) this.currentChallenge.title = titleEl.value.trim();
    if (descEl) this.currentChallenge.description = descEl.value.trim();
    if (catEl) this.currentChallenge.category = catEl.value;
    if (diffEl) this.currentChallenge.difficulty = diffEl.value;
    if (timeEl) this.currentChallenge.timePerQuestion = parseInt(timeEl.value) || 20;
    if (bannerEl) this.currentChallenge.banner = bannerEl.value.trim();
    if (entityNameEl) this.currentChallenge.entityName = entityNameEl.value.trim();
    if (entityLogoEl && entityLogoEl.value.trim()) {
      let logoVal = entityLogoEl.value.trim();
      try {
        // Convertir automáticamente a PNG transparente si tiene fondo blanco
        logoVal = await this.removeWhiteBackgroundFromImage(logoVal);
      } catch(e) {}
      this.currentChallenge.entityLogo = logoVal;
    }

    if (!this.validateChallenge()) return;

    const c = this.currentChallenge;
    const cat = window.appState.categories.find(item => item.id === c.category);
    c.categoryName = cat ? cat.name : 'General';
    const u = window.appState.currentUser;
    c.author = c.author || u?.name || 'Creador';
    c.authorAvatar = c.authorAvatar || u?.avatar || '👤';
    c.authorId = c.authorId || u?.id || ('user_' + (u?.email || u?.name || 'anon'));
    c.authorEmail = c.authorEmail || u?.email || '';
    if (c.plays === undefined) c.plays = 0;

    // Verificar si es edición o nuevo
    const existingIndex = window.appState.challenges.findIndex(item => item.id === c.id);
    if (existingIndex >= 0) {
      window.appState.challenges[existingIndex] = c;
    } else {
      window.appState.challenges.unshift(c);
      // Recompensar al usuario con XP por crear reto
      window.appState.currentUser.challengesCreated = (window.appState.currentUser.challengesCreated || 0) + 1;
      window.appRouter.addXP(300);
      window.appRouter.checkMedals('creator');
    }

    saveGlobalState(window.appState);
    if (window.appRouter && window.appRouter.pushChallengeToCloud) {
      window.appRouter.pushChallengeToCloud(c);
    }
    window.soundEngine.playCorrect();

    // Sincronizar en la nube con Supabase si está disponible
    if (window.supabaseService && window.supabaseService.isConnected && window.supabaseService.client) {
      window.supabaseService.client.from('challenges').upsert({
        id: c.id,
        title: c.title,
        description: c.description || '',
        category: c.category,
        category_name: c.categoryName || 'General',
        author: c.author,
        author_avatar: c.authorAvatar,
        plays: c.plays || 0,
        difficulty: c.difficulty || 'Medio',
        banner: c.banner || '',
        time_per_question: c.timePerQuestion || 20,
        points_standard: c.pointsStandard || 1000,
        is_public: true,
        questions: c.questions
      }).then(() => console.log('✅ Reto respaldado en Supabase'));
    }

    if (confirm(`🎉 ¡Cuestionario "${c.title}" publicado con ${c.questions.length} preguntas!\n\n¿Quieres jugarlo ahora mismo?`)) {
      window.appRouter.startSinglePlayer(c.id);
    } else {
      window.appRouter.navigate('home');
    }
  },

  deleteCurrentChallenge() {
    const c = this.currentChallenge;
    if (!c) return;

    const isSaved = window.appState.challenges.some(item => item.id === c.id);
    const u = window.appState.currentUser;

    if (isSaved) {
      // Si ya está publicado, verificar estrictamente que el usuario sea el autor original o administrador
      const isOwner = u && (
        (c.author && c.author.toLowerCase() === u.name?.toLowerCase()) ||
        (c.authorId && c.authorId === u.id) ||
        u.role === 'admin'
      );
      if (!isOwner) {
        alert('🚫 Solo el creador original de este examen tiene permiso para eliminarlo.');
        return;
      }
      if (confirm(`🗑️ ¿Estás seguro de que deseas eliminar permanentemente el examen "${c.title || 'este examen'}"? Esta acción borrará el reto de la plataforma.`)) {
        window.appRouter.deleteChallenge(c.id);
      }
      return;
    }

    // Si es un borrador o examen recién generado en el estudio de creación
    const hasQuestions = c.questions && c.questions.length > 0 && c.questions.some(q => q.text && q.text.trim());
    const hasTitle = c.title && c.title.trim();

    if (!hasQuestions && !hasTitle) {
      this.resetForm();
      this.render();
      alert('🗑️ El examen ha sido reiniciado.');
      return;
    }

    if (confirm(`🗑️ ¿Deseas borrar y descartar este examen ("${c.title || 'Borrador'}")?\n\nSe eliminarán todas las preguntas y datos cargados en el creador.`)) {
      this.resetForm();
      this.render();
      if (window.soundEngine && window.soundEngine.playWrong) {
        window.soundEngine.playWrong();
      }
      alert('🗑️ Examen descartado y borrado con éxito.');
      window.appRouter.navigate('home');
    }
  },

  // =========================================================================
  // 📁 Importación de Archivos y Texto de Preguntas
  // =========================================================================
  openFileImportModal() {
    const modal = document.getElementById('creator-file-modal');
    if (!modal) return;
    const label = document.getElementById('dropzone-label');
    const filename = document.getElementById('dropzone-filename');
    const fileInput = document.getElementById('creator-file-input');
    const textarea = document.getElementById('creator-import-textarea');
    const replaceCheck = document.getElementById('file-replace-check');

    if (label) label.textContent = 'Arrastra tu archivo aquí o haz clic para buscarlo';
    if (filename) filename.textContent = 'Soporta archivos .txt, .csv, .docx, .json y .md';
    if (fileInput) fileInput.value = '';
    if (textarea) textarea.value = '';

    // Si solo hay una pregunta y está vacía, marcar reemplazo por defecto
    if (replaceCheck) {
      const isEmptySingle = this.currentChallenge.questions.length === 1 && !this.currentChallenge.questions[0].text.trim();
      replaceCheck.checked = isEmptySingle;
    }

    modal.classList.add('active');
  },

  closeFileImportModal() {
    const modal = document.getElementById('creator-file-modal');
    if (modal) modal.classList.remove('active');
  },

  handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('creator-file-dropzone');
    if (dropzone) dropzone.classList.add('dragover');
  },

  handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('creator-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
  },

  handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const dropzone = document.getElementById('creator-file-dropzone');
    if (dropzone) dropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      this.handleFileInput(e.dataTransfer.files[0]);
    }
  },

  async handleFileInput(file) {
    if (!file) return;
    const label = document.getElementById('dropzone-label');
    const filename = document.getElementById('dropzone-filename');
    const textarea = document.getElementById('creator-import-textarea');

    if (label) label.textContent = `📄 ${file.name}`;
    if (filename) filename.textContent = `Tamaño: ${(file.size / 1024).toFixed(1)} KB — Leyendo archivo...`;

    const ext = file.name.toLowerCase().split('.').pop();

    // 1. Archivo propio de la plataforma (.mentix o .json)
    if (ext === 'mentix' || ext === 'json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const parsed = JSON.parse(e.target.result);
          if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
            if (parsed.title) this.currentChallenge.title = parsed.title;
            if (parsed.description) this.currentChallenge.description = parsed.description;
            if (parsed.category) this.currentChallenge.category = parsed.category;
            if (parsed.difficulty) this.currentChallenge.difficulty = parsed.difficulty;
            if (parsed.timePerQuestion) this.currentChallenge.timePerQuestion = parsed.timePerQuestion;
            if (parsed.banner) this.currentChallenge.banner = parsed.banner;
            this.currentChallenge.questions = parsed.questions;
            if (window.soundEngine && window.soundEngine.playCorrect) window.soundEngine.playCorrect();
            this.closeFileImportModal();
            this.render();
            alert(`🎉 ¡Cuestionario "${parsed.title || 'Mentix'}" cargado con éxito (${parsed.questions.length} preguntas)!`);
            return;
          }
        } catch (err) {}
        if (textarea) textarea.value = e.target.result;
        if (filename) filename.textContent = `✅ Archivo cargado con éxito. Haz clic en "Procesar" abajo.`;
      };
      reader.readAsText(file, 'UTF-8');
      return;
    }

    // 2. Hojas de Cálculo de Excel (.xlsx, .xls)
    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Leyendo y organizando preguntas desde Excel...';
        try {
          if (window.XLSX) {
            const workbook = window.XLSX.read(e.target.result, { type: 'array' });
            let combined = '';
            workbook.SheetNames.forEach(sheetName => {
              const sheet = workbook.Sheets[sheetName];
              const csv = window.XLSX.utils.sheet_to_csv(sheet);
              if (csv && csv.trim()) {
                combined += (combined ? '\n\n' : '') + csv.trim();
              }
            });
            if (combined.trim()) {
              if (textarea) textarea.value = combined;
              if (filename) filename.textContent = `✅ Excel leído con éxito (${workbook.SheetNames.length} hoja(s)). Haz clic en "Procesar" abajo.`;
              return;
            }
          }
        } catch (err) {
          console.warn('XLSX library warning:', err);
        }

        const extracted = await this.extractTextFromZip(e.target.result, 'xlsx');
        if (extracted && extracted.trim()) {
          if (textarea) textarea.value = extracted;
          if (filename) filename.textContent = `✅ Celdas de Excel extraídas con éxito. Haz clic en "Procesar" abajo.`;
        } else {
          if (filename) filename.textContent = `⚠️ No se pudo procesar el archivo Excel. Prueba guardándolo como CSV o copia y pega las columnas.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 3. Documentos PDF (.pdf)
    if (ext === 'pdf') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Extrayendo texto del documento PDF...';
        const extracted = await this.extractTextFromPDF(e.target.result);
        if (extracted && extracted.trim()) {
          if (textarea) textarea.value = extracted;
          if (filename) filename.textContent = `✅ Texto de PDF extraído con éxito. Haz clic en "Procesar" abajo.`;
        } else {
          if (filename) filename.textContent = `⚠️ No se pudo extraer texto del PDF (es posible que sea una imagen escaneada). Pega las preguntas directamente.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 4. Documentos de Word (.docx, .doc)
    if (ext === 'docx' || ext === 'doc') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Extrayendo texto del documento Word...';
        const extracted = await this.extractTextFromZip(e.target.result, 'docx');
        if (extracted && extracted.trim()) {
          if (textarea) textarea.value = extracted;
          if (filename) filename.textContent = `✅ Texto de Word extraído con éxito. Haz clic en "Procesar" abajo.`;
        } else {
          if (filename) filename.textContent = `⚠️ Archivo Word comprimido o protegido. Pega las preguntas en el cuadro de texto.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 5. Presentaciones de PowerPoint (.pptx, .ppt)
    if (ext === 'pptx' || ext === 'ppt') {
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (filename) filename.textContent = 'Extrayendo diapositivas de la presentación PowerPoint...';
        const extracted = await this.extractTextFromZip(e.target.result, 'pptx');
        if (extracted && extracted.trim()) {
          if (textarea) textarea.value = extracted;
          if (filename) filename.textContent = `✅ Diapositivas de PowerPoint extraídas con éxito. Haz clic en "Procesar" abajo.`;
        } else {
          if (filename) filename.textContent = `⚠️ No se pudo descomprimir la presentación PowerPoint. Pega las preguntas en el cuadro de texto.`;
        }
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    // 6. Archivos de texto plano (.txt, .csv, .tsv, .md)
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      if (textarea) textarea.value = content;
      if (filename) filename.textContent = `✅ Archivo cargado con éxito. Haz clic en "Procesar" abajo.`;
    };
    reader.readAsText(file, 'UTF-8');
  },

  async extractTextFromZip(arrayBuffer, fileType) {
    try {
      const bytes = new Uint8Array(arrayBuffer);
      const textDecoder = new TextDecoder('utf-8', { fatal: false });
      let extractedPieces = [];

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

          let isTarget = false;
          if (fileType === 'docx' && (fileName === 'word/document.xml' || fileName.includes('document.xml'))) {
            isTarget = true;
          } else if (fileType === 'pptx' && fileName.includes('ppt/slides/slide') && fileName.endsWith('.xml')) {
            isTarget = true;
          } else if (fileType === 'xlsx' && (fileName === 'xl/sharedStrings.xml' || fileName.includes('sheet1.xml') || fileName.includes('worksheets/sheet'))) {
            isTarget = true;
          }

          if (isTarget && compSize > 0 && dataStart + compSize <= bytes.length) {
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
                if (fileType === 'docx') {
                  const pMatches = xmlStr.match(/<w:p[\s\S]*?<\/w:p>/g);
                  if (pMatches) {
                    const lines = pMatches.map(p => {
                      const tMatches = p.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g) || [];
                      return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
                    }).filter(l => l.trim().length > 0);
                    if (lines.length > 0) extractedPieces.push(lines.join('\n'));
                  }
                } else if (fileType === 'pptx') {
                  const pMatches = xmlStr.match(/<a:p[\s\S]*?<\/a:p>/g);
                  if (pMatches) {
                    const lines = pMatches.map(p => {
                      const tMatches = p.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g) || [];
                      return tMatches.map(t => t.replace(/<[^>]+>/g, '')).join('');
                    }).filter(l => l.trim().length > 0);
                    if (lines.length > 0) extractedPieces.push(lines.join('\n'));
                  }
                } else if (fileType === 'xlsx') {
                  const tMatches = xmlStr.match(/<t[^>]*>([\s\S]*?)<\/t>/g) || xmlStr.match(/<v[^>]*>([\s\S]*?)<\/v>/g) || [];
                  const lines = tMatches.map(t => t.replace(/<[^>]+>/g, '').trim()).filter(l => l.length > 0);
                  if (lines.length > 0) extractedPieces.push(lines.join('\t'));
                }
              }
            } catch (err) {
              console.warn('Zip entry error:', fileName, err);
            }
          }
          i = dataStart + (compSize > 0 ? compSize : 1);
        } else {
          i++;
        }
      }

      if (extractedPieces.length > 0) {
        return extractedPieces.join('\n\n');
      }

      // Escaneo de respaldo para etiquetas xml sin compresión
      const rawText = textDecoder.decode(bytes);
      if (fileType === 'docx') {
        const tAll = rawText.match(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g);
        if (tAll) return tAll.map(t => t.replace(/<[^>]+>/g, '')).join('\n');
      } else if (fileType === 'pptx') {
        const tAll = rawText.match(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g);
        if (tAll) return tAll.map(t => t.replace(/<[^>]+>/g, '')).join('\n');
      }
    } catch (e) {
      console.warn('extractTextFromZip warning:', e);
    }
    return '';
  },

  async extractTextFromPDF(arrayBuffer) {
    // 1. Probar con PDF.js si está cargado en ventana
    if (window.pdfjsLib && window.pdfjsLib.getDocument) {
      try {
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        const pageTexts = [];
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const content = await page.getTextContent();
          const strings = content.items.map(it => it.str);
          pageTexts.push(strings.join(' '));
        }
        if (pageTexts.length > 0) {
          return pageTexts.join('\n\n');
        }
      } catch (err) {
        console.warn('PDF.js extract warning:', err);
      }
    }

    // 2. Extractor nativo de texto de PDF (streams de texto y comandos Tj/TJ)
    try {
      const bytes = new Uint8Array(arrayBuffer);
      const latin = new TextDecoder('latin1').decode(bytes);
      const textPieces = [];

      const tjMatches = latin.match(/\(([^()]{1,250})\)\s*Tj/g);
      if (tjMatches && tjMatches.length > 3) {
        return tjMatches.map(m => m.replace(/\)\s*Tj$/, '').replace(/^\(/, '')).join('\n');
      }

      const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
      let match;
      while ((match = streamRegex.exec(latin)) !== null) {
        const sRaw = match[1];
        const sBytes = new Uint8Array(sRaw.length);
        for (let j = 0; j < sRaw.length; j++) sBytes[j] = sRaw.charCodeAt(j) & 0xff;
        try {
          if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate');
            const writer = ds.writable.getWriter();
            writer.write(sBytes);
            writer.close();
            const dec = await new Response(ds.readable).arrayBuffer();
            const decStr = new TextDecoder('utf-8', { fatal: false }).decode(dec);
            const subMatches = decStr.match(/\(([^()]{1,250})\)\s*Tj/g);
            if (subMatches) {
              textPieces.push(subMatches.map(m => m.replace(/\)\s*Tj$/, '').replace(/^\(/, '')).join(' '));
            }
          }
        } catch (err) {}
      }
      if (textPieces.length > 0) return textPieces.join('\n\n');
    } catch (e) {
      console.warn('Native PDF fallback warning:', e);
    }
    return '';
  },

  exportChallenge() {
    const c = this.currentChallenge;
    if (!c) return;
    const jsonStr = JSON.stringify(c, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    const safeTitle = (c.title ? c.title.toLowerCase().replace(/[^a-z0-9]/gi, '_') : 'cuestionario_mentix');
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", `${safeTitle}.mentix`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  },

  insertSampleTemplate() {
    const textarea = document.getElementById('creator-import-textarea');
    if (!textarea) return;
    textarea.value = 
`1. ¿Cuál es la capital de Colombia?
a) Medellín
b) Cali
c) Bogotá*
d) Barranquilla

2. ¿Cuál es el río más largo y caudaloso del mundo?
a) Río Nilo
b) Río Amazonas*
c) Río Misisipi
d) Río Danubio

3. La fotosíntesis de las plantas produce oxígeno como subproducto.
Respuesta: Verdadero

4. ¿En qué año llegó la misión Apolo 11 con el ser humano a la Luna?
a) 1965
b) 1969 [x]
c) 1972
d) 1980

5. ¿Qué molécula contiene las instrucciones genéticas de los seres vivos?
a) Hemoglobina
b) ADN*
c) Glucosa
d) Insulina`;
  },

  processImport() {
    const textarea = document.getElementById('creator-import-textarea');
    const replaceCheck = document.getElementById('file-replace-check');
    const forcedTypeSelect = document.getElementById('file-type-select');
    const forcedType = forcedTypeSelect ? forcedTypeSelect.value : 'auto';
    const rawText = textarea ? textarea.value.trim() : '';

    if (!rawText) {
      alert('⚠️ Por favor selecciona un archivo o escribe/pega tus preguntas en el área de texto.');
      return;
    }

    const parsedQuestions = this.parseQuestions(rawText);

    if (!parsedQuestions || parsedQuestions.length === 0) {
      alert('⚠️ No se lograron detectar preguntas válidas en el texto.\n\nVerifica que sigan un formato numerado (1. Pregunta), opciones con letras (a, b, c, d) y un asterisco (*) o la línea "Respuesta: B" para indicar la correcta.');
      return;
    }

    // Si el usuario eligió forzar un tipo de pregunta específico
    if (forcedType && forcedType !== 'auto') {
      parsedQuestions.forEach(q => {
        q.type = forcedType;
        if (forcedType === 'boolean') {
          q.options = [
            { text: 'Verdadero', shape: '✦', color: 'opt-1' },
            { text: 'Falso', shape: '⬢', color: 'opt-2' }
          ];
          q.correctAnswer = 0;
          if (q.timeLimit > 20) q.timeLimit = 15;
        } else if (forcedType === 'multi') {
          if (!Array.isArray(q.correctAnswer)) {
            q.correctAnswer = (q.correctAnswer !== undefined && q.correctAnswer !== null) ? [q.correctAnswer] : [0];
          }
        } else if (forcedType === 'text') {
          const ans = (q.options && q.options[q.correctAnswer]) ? q.options[q.correctAnswer].text : (q.correctAnswer || 'Respuesta');
          q.acceptedAnswers = [String(ans)];
          q.correctAnswer = String(ans);
          q.options = [];
        } else if (forcedType === 'open') {
          q.acceptedAnswers = [];
          q.correctAnswer = null;
          q.options = [];
        } else if (forcedType === 'poll') {
          q.correctAnswer = null;
          q.points = 0;
        } else if (forcedType === 'single') {
          if (Array.isArray(q.correctAnswer)) q.correctAnswer = q.correctAnswer[0] || 0;
        }
      });
    }

    const replace = replaceCheck ? replaceCheck.checked : false;

    if (replace) {
      this.currentChallenge.questions = parsedQuestions;
    } else {
      // Si la primera pregunta está vacía, reemplazarla
      if (this.currentChallenge.questions.length === 1 && !this.currentChallenge.questions[0].text.trim()) {
        this.currentChallenge.questions = parsedQuestions;
      } else {
        this.currentChallenge.questions.push(...parsedQuestions);
      }
    }

    if (window.soundEngine && window.soundEngine.playCorrect) {
      window.soundEngine.playCorrect();
    }

    this.closeFileImportModal();
    this.render();
    alert(`🎉 ¡Se importaron con éxito ${parsedQuestions.length} preguntas al cuestionario!\nPuedes revisarlas, cambiar tiempos y editarlas.`);
  },

  parseDelimitedLine(line) {
    if (!line) return [];
    let delimiter = '\t';
    if (line.includes('\t')) {
      delimiter = '\t';
    } else {
      const commas = (line.match(/,/g) || []).length;
      const semis = (line.match(/;/g) || []).length;
      delimiter = semis >= commas ? ';' : ',';
    }

    const cols = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"' || ch === "'") {
        if (inQuotes && line[i + 1] === ch) {
          cur += ch;
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === delimiter && !inQuotes) {
        cols.push(cur.trim());
        cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur.trim());
    return cols.map(c => c.replace(/^["']|["']$/g, '').trim());
  },

  parseQuestions(rawText) {
    if (!rawText || !rawText.trim()) return [];
    let text = rawText.trim();

    // 1. Detectar si es formato JSON (.json / .mentix)
    if (text.startsWith('[') || text.startsWith('{')) {
      try {
        const parsed = JSON.parse(text);
        const list = Array.isArray(parsed) ? parsed : (parsed.questions || []);
        if (list.length > 0) {
          return list.map(q => {
            const qText = q.text || q.pregunta || q.question || 'Pregunta';
            const rawOpts = q.options || q.opciones || [q.a, q.b, q.c, q.d].filter(Boolean);
            let correct = q.correctAnswer ?? q.correcta ?? q.answer ?? 0;
            if (typeof correct === 'string') {
              const letterIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(correct.toLowerCase().trim());
              if (letterIdx >= 0) correct = letterIdx;
              else {
                const foundIdx = rawOpts.findIndex(o => (typeof o === 'string' ? o : o.text).toLowerCase().trim() === correct.toLowerCase().trim());
                if (foundIdx >= 0) correct = foundIdx;
                else correct = parseInt(correct) || 0;
              }
            }
            return this.buildQuestionItem(qText, rawOpts, correct, q.type || (rawOpts.length === 2 ? 'boolean' : 'single'), q.timeLimit || 20, q.points || 1000);
          });
        }
      } catch (e) {}
    }

    // 2. Detectar si es formato CSV / TSV / Excel tabulado
    const allLines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const delimitedRows = [];
    for (const l of allLines) {
      if (l.includes('\t') || l.includes(';') || l.includes(',')) {
        const cols = this.parseDelimitedLine(l);
        if (cols.length >= 3) {
          delimitedRows.push(cols);
        }
      }
    }

    // Si al menos 2 filas o más del 40% de las líneas son tabulares con 3+ columnas
    if (delimitedRows.length >= 2 || (delimitedRows.length >= 1 && allLines.length <= 2)) {
      const results = [];
      for (const cleanCols of delimitedRows) {
        if (/^(pregunta|question|enunciado|item|pregunta\/tema)/i.test(cleanCols[0]) && /opci[oó]n|answer|respuesta|correcta/i.test(cleanCols[1])) {
          continue;
        }

        const qText = cleanCols[0].replace(/^[-=~#*_]{2,}\s*[^-\n=]+\s*[-=~#*_]{2,}/g, '').trim();
        if (!qText) continue;

        let lastCol = cleanCols[cleanCols.length - 1];
        let optCols = cleanCols.slice(1);
        let correctIdx = 0;
        let isAnswerInLastCol = false;

        const isLetter = /^[a-fA-F]$/.test(lastCol);
        const isDigit = /^[1-6]$/.test(lastCol);
        const isBoolWord = /^(verdadero|falso|true|false)$/i.test(lastCol);
        const hasExplicitAnswer = /^correct[ao]|resp|^rta|ans/i.test(lastCol);

        if (optCols.length >= 3 && (isLetter || isDigit || isBoolWord || hasExplicitAnswer)) {
          isAnswerInLastCol = true;
          if (isLetter) {
            correctIdx = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(lastCol.toLowerCase());
          } else if (isDigit) {
            correctIdx = parseInt(lastCol) - 1;
          } else if (isBoolWord) {
            correctIdx = /^verdadero|^true/i.test(lastCol) ? 0 : 1;
          }
          optCols.pop();
        }

        optCols = optCols.map((opt, idx) => {
          let clean = opt;
          if (/\*|✓|\[x\]|\(x\)|\(correcta\)|\(correct\)/i.test(clean)) {
            if (!isAnswerInLastCol) correctIdx = idx;
            clean = clean.replace(/\*|✓|\[x\]|\(x\)|\(correcta\)|\(correct\)/gi, '').trim();
          }
          return clean.replace(/^(?:[a-fA-F1-6][\.\)\-]|[-*•])\s*/, '').trim();
        }).filter(Boolean);

        if (optCols.length >= 2) {
          const isBool = optCols.length === 2 && (
            optCols[0].toLowerCase().includes('verdadero') || optCols[0].toLowerCase().includes('falso') ||
            optCols[1].toLowerCase().includes('verdadero') || optCols[1].toLowerCase().includes('falso')
          );
          results.push(this.buildQuestionItem(qText, optCols, correctIdx, isBool ? 'boolean' : 'single'));
        }
      }
      if (results.length > 0) return results;
    }

    // 3. Procesar texto estructurado y documentos (Word, PDF, PowerPoint, texto libre)
    text = text.replace(/^[-=~#*_]{2,}\s*[^-\n=]+\s*[-=~#*_]{2,}\s*$/gm, '');

    const rawBlocks = text.split(/\n\s*(?=(?:\b(?:Pregunta|Item|P|Q)\s*\d*[\.\:\)]|\d+[\.\)\-]\s+|¿))/i);
    const blocksToProcess = rawBlocks.length > 1 ? rawBlocks : text.split(/\n\s*\n+/);
    const parsedQuestions = [];

    for (let block of blocksToProcess) {
      block = block.trim();
      if (!block) continue;

      const blockLines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (blockLines.length === 0) continue;

      while (blockLines.length > 1 && (/^[-=~#*_]{2,}/.test(blockLines[0]) || /^(?:Unidad|Cap[ií]tulo|Tema|M[oó]dulo)\b/i.test(blockLines[0]))) {
        blockLines.shift();
      }

      let qText = '';
      const options = [];
      let correctAnswer = 0;
      let multiCorrect = [];

      let optStartIndex = -1;
      for (let i = 0; i < blockLines.length; i++) {
        if (i === 0 && blockLines.length > 1) continue;
        const line = blockLines[i];
        const isOpt = /^(?:[a-fA-F][\.\)\-]|[-*•]|\([a-fA-F]\)|\[[a-fA-F]\])\s*/.test(line) ||
                      (/^[1-6][\.\)\-]\s+/.test(line) && !line.includes('?') && !line.includes('¿')) ||
                      /^(?:Respuesta|Correcta|Soluci[oó]n|Rta|R|Clave|Ans)[\:\s]/i.test(line);
        if (isOpt) {
          optStartIndex = i;
          break;
        }
      }

      if (optStartIndex === -1) {
        const fullBlock = blockLines.join(' ');
        const inlineMatch = fullBlock.match(/(?:^|[\s])([a-dA-D][\.\)\-]\s+[^a-dA-D\.\)\-]+)/g);
        if (inlineMatch && inlineMatch.length >= 2) {
          const firstOptPos = fullBlock.search(/\b[a-dA-D][\.\)\-]\s+/);
          if (firstOptPos > 0) {
            qText = fullBlock.slice(0, firstOptPos).replace(/^\d+[\.\)\-]\s*/, '').replace(/^Pregunta\s*\d*[\.\:]\s*/i, '').trim();
            for (const item of inlineMatch) {
              let optText = item.trim();
              let isCorr = false;
              if (/\*|✓|\[x\]/i.test(optText)) {
                isCorr = true;
                optText = optText.replace(/\*|✓|\[x\]/gi, '').trim();
              }
              optText = optText.replace(/^[a-dA-D][\.\)\-]\s*/, '').trim();
              if (optText) {
                if (isCorr) correctAnswer = options.length;
                options.push(optText);
              }
            }
            if (options.length >= 2) {
              parsedQuestions.push(this.buildQuestionItem(qText, options, correctAnswer));
              continue;
            }
          }
        }

        qText = blockLines[0].replace(/^\d+[\.\)\-]\s*/, '').replace(/^Pregunta\s*\d*[\.\:]\s*/i, '').trim();
        if (/respuesta[\:\s]+verdadero|es\s+verdadero/i.test(fullBlock)) {
          parsedQuestions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 0, 'boolean'));
          continue;
        } else if (/respuesta[\:\s]+falso|es\s+falso/i.test(fullBlock)) {
          parsedQuestions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 1, 'boolean'));
          continue;
        }

        const ansMatch = fullBlock.match(/(?:Respuesta|Correcta|Soluci[oó]n|Rta|R)[\:\s]+(.+)/i);
        if (ansMatch) {
          const ansVal = ansMatch[1].trim();
          qText = blockLines.filter(l => !/^(?:Respuesta|Correcta|Soluci[oó]n|Rta|R)[\:\s]/i.test(l)).join(' ').replace(/^\d+[\.\)\-]\s*/, '').trim();
          parsedQuestions.push(this.buildQuestionItem(qText, [ansVal], ansVal, 'text'));
          continue;
        } else if (qText.length > 15) {
          parsedQuestions.push(this.buildQuestionItem(qText, [], null, 'open'));
          continue;
        }
        continue;
      }

      qText = blockLines.slice(0, optStartIndex).join(' ')
        .replace(/^[-=~#*_]{2,}\s*[^-\n=]+\s*[-=~#*_]{2,}/g, '')
        .replace(/^\d+[\.\)\-]\s*/, '')
        .replace(/^Pregunta\s*\d*[\.\:]\s*/i, '')
        .trim();

      if (!qText) qText = blockLines[0].replace(/^\d+[\.\)\-]\s*/, '').trim();

      for (let i = optStartIndex; i < blockLines.length; i++) {
        const line = blockLines[i];

        const ansMatch = line.match(/^(?:Respuesta|Correcta|Soluci[oó]n|Rta|R|Clave|Ans)[\:\s]+([a-fA-F1-6]|Verdadero|Falso|True|False|.*)/i);
        if (ansMatch) {
          const ansVal = ansMatch[1].trim();
          if (/^verdadero|^true/i.test(ansVal)) {
            correctAnswer = 0;
          } else if (/^falso|^false/i.test(ansVal)) {
            correctAnswer = 1;
          } else if (/^[a-fA-F]$/i.test(ansVal)) {
            correctAnswer = ['a', 'b', 'c', 'd', 'e', 'f'].indexOf(ansVal.toLowerCase());
          } else if (/^[1-6]$/.test(ansVal)) {
            correctAnswer = parseInt(ansVal) - 1;
          } else {
            const foundIdx = options.findIndex(o => o.toLowerCase() === ansVal.toLowerCase());
            if (foundIdx >= 0) correctAnswer = foundIdx;
          }
          continue;
        }

        let isCorrectThisOpt = false;
        let cleanOpt = line;

        if (/\*|✓|\[x\]|\(x\)|\(correcta\)|\(correct\)/i.test(cleanOpt)) {
          isCorrectThisOpt = true;
          cleanOpt = cleanOpt.replace(/\*|✓|\[x\]|\(x\)|\(correcta\)|\(correct\)/gi, '').trim();
        }

        cleanOpt = cleanOpt.replace(/^(?:[a-fA-F1-6][\.\)\-]|[-*•])\s*/, '').trim();

        if (cleanOpt.length > 0) {
          const optIndex = options.length;
          options.push(cleanOpt);
          if (isCorrectThisOpt) {
            correctAnswer = optIndex;
            multiCorrect.push(optIndex);
          }
        }
      }

      if (options.length === 0) {
        options.push('Verdadero', 'Falso');
      }

      if (options.length >= 2) {
        const isBool = options.length === 2 && (
          options[0].toLowerCase().includes('verdadero') || options[0].toLowerCase().includes('falso') ||
          options[1].toLowerCase().includes('verdadero') || options[1].toLowerCase().includes('falso')
        );
        const qType = multiCorrect.length > 1 ? 'multi' : (isBool ? 'boolean' : 'single');
        const finalAns = multiCorrect.length > 1 ? multiCorrect : correctAnswer;
        parsedQuestions.push(this.buildQuestionItem(qText, options, finalAns, qType));
      }
    }

    return parsedQuestions;
  },

  buildQuestionItem(text, optionsArray, correctAnswerIndex = 0, type = 'single', timeLimit = 20, points = 1000) {
    const isBool = type === 'boolean' || (Array.isArray(optionsArray) && optionsArray.length === 2 && (
      (optionsArray[0].toLowerCase?.().includes('verdadero') || optionsArray[0].toLowerCase?.().includes('true')) ||
      (optionsArray[1].toLowerCase?.().includes('verdadero') || optionsArray[1].toLowerCase?.().includes('true'))
    ));
    const isText = type === 'text';
    const isOpen = type === 'open';
    const isPoll = type === 'poll';
    const isMulti = type === 'multi';

    const shapes = ['✦', '⬢', '⚡', '🛡️', '⬟', '💎'];
    const colors = ['opt-1', 'opt-2', 'opt-3', 'opt-4', 'opt-1', 'opt-2'];

    if (isOpen) {
      return {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: (text || '').trim(),
        type: 'open',
        media: '',
        mediaType: 'none',
        timeLimit: timeLimit || 30,
        points: points || 1000,
        options: [],
        correctAnswer: null
      };
    }

    if (isText) {
      const ans = typeof correctAnswerIndex === 'string' ? correctAnswerIndex : (optionsArray?.[0] || 'Respuesta');
      return {
        id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        text: (text || '').trim(),
        type: 'text',
        media: '',
        mediaType: 'none',
        timeLimit: timeLimit || 20,
        points: points || 1000,
        options: [],
        acceptedAnswers: [String(ans).trim()],
        correctAnswer: String(ans).trim()
      };
    }

    let opts = [];
    if (isBool) {
      opts = [
        { text: 'Verdadero', shape: '✦', color: 'opt-1' },
        { text: 'Falso', shape: '⬢', color: 'opt-2' }
      ];
    } else {
      opts = (optionsArray || []).map((o, idx) => {
        const txt = typeof o === 'string' ? o : (o.text || '');
        return {
          text: txt.trim(),
          shape: shapes[idx % shapes.length],
          color: colors[idx % colors.length]
        };
      });
      if (opts.length < 2) {
        while (opts.length < 2) {
          const idx = opts.length;
          opts.push({
            text: 'Opción ' + (idx + 1),
            shape: shapes[idx % shapes.length],
            color: colors[idx % colors.length]
          });
        }
      }
    }

    let finalCorrect = 0;
    if (isPoll) {
      finalCorrect = null;
    } else if (isMulti) {
      if (Array.isArray(correctAnswerIndex)) {
        finalCorrect = correctAnswerIndex;
      } else {
        finalCorrect = [Math.max(0, Math.min(parseInt(correctAnswerIndex) || 0, opts.length - 1))];
      }
    } else {
      finalCorrect = Math.max(0, Math.min(parseInt(correctAnswerIndex) || 0, opts.length - 1));
    }

    return {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      text: (text || '').trim(),
      type: isBool ? 'boolean' : isPoll ? 'poll' : isMulti ? 'multi' : 'single',
      media: '',
      mediaType: 'none',
      timeLimit: timeLimit || (isBool ? 15 : 20),
      points: isPoll ? 0 : (points || 1000),
      options: opts,
      correctAnswer: finalCorrect
    };
  },

  shuffleOptions(options, correctIndex) {
    const items = options.map((opt, idx) => ({ 
      text: typeof opt === 'string' ? opt : opt.text, 
      isCorrect: idx === correctIndex 
    }));
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
    const newCorrect = items.findIndex(it => it.isCorrect);
    return {
      options: items.map(it => it.text),
      correctAnswer: newCorrect >= 0 ? newCorrect : 0
    };
  },

  // =========================================================================
  // ✨ Generador Inteligente de Cuestionarios (IA)
  // Nota: Cumple estrictamente con no etiquetar ni indicar IA al jugar
  // =========================================================================
  openAIModal() {
    const modal = document.getElementById('creator-ai-modal');
    if (!modal) return;
    const topicInput = document.getElementById('ai-topic-input');
    const notesInput = document.getElementById('ai-notes-input');
    const replaceCheck = document.getElementById('ai-replace-check');
    const loader = document.getElementById('ai-loading-indicator');
    const submitBtn = document.getElementById('ai-submit-btn');

    if (loader) loader.style.display = 'none';
    if (submitBtn) submitBtn.disabled = false;
    if (notesInput) notesInput.value = '';

    const countInput = document.getElementById('ai-count-input');
    if (countInput && (!countInput.value || parseInt(countInput.value) <= 0)) {
      countInput.value = '5';
    }

    // Sugerir título actual si existe
    if (topicInput) {
      topicInput.value = this.currentChallenge.title ? this.currentChallenge.title.replace(/^Reto de\s*/i, '') : '';
    }

    if (replaceCheck) {
      const isEmptySingle = this.currentChallenge.questions.length === 1 && !this.currentChallenge.questions[0].text.trim();
      replaceCheck.checked = isEmptySingle;
    }

    modal.classList.add('active');
  },

  handleAICountChange(val) {
    // Para compatibilidad
  },

  closeAIModal() {
    const modal = document.getElementById('creator-ai-modal');
    if (modal) modal.classList.remove('active');
  },

  async executeAIGeneration(event) {
    if (event) event.preventDefault();

    const topicInput = document.getElementById('ai-topic-input');
    const notesInput = document.getElementById('ai-notes-input');
    const countInput = document.getElementById('ai-count-input') || document.getElementById('ai-count-select');
    const diffSelect = document.getElementById('ai-diff-select');
    const typeSelect = document.getElementById('ai-type-select');
    const timeSelect = document.getElementById('ai-time-select');
    const replaceCheck = document.getElementById('ai-replace-check');
    const loader = document.getElementById('ai-loading-indicator');
    const loadText = document.getElementById('ai-loading-text');
    const submitBtn = document.getElementById('ai-submit-btn');

    const topic = topicInput ? topicInput.value.trim() : '';
    if (!topic) {
      alert('⚠️ Por favor escribe el tema o materia para el cuestionario.');
      return;
    }

    const notes = notesInput ? notesInput.value.trim() : '';

    // Sin límite máximo: genera la cantidad exacta de preguntas que la persona escriba
    let count = 5;
    if (countInput) {
      count = parseInt(countInput.value) || 5;
    }
    count = Math.max(1, count);

    const difficulty = diffSelect ? diffSelect.value : 'Medio';
    const type = typeSelect ? typeSelect.value : 'single';
    const timeLimit = timeSelect ? parseInt(timeSelect.value) || 20 : 20;
    const replace = replaceCheck ? replaceCheck.checked : true;

    // Feedback visual animado
    if (loader) loader.style.display = 'block';
    if (submitBtn) submitBtn.disabled = true;

    if (loadText) loadText.textContent = `🔍 Búsqueda rápida en vivo: Consultando conocimientos sobre "${topic}"...`;

    // 1. Realizar búsqueda rápida enciclopédica en la web (Wikipedia / DuckDuckGo)
    let webKnowledge = null;
    try {
      webKnowledge = await this.fetchKnowledgeFromWeb(topic);
    } catch (e) {
      console.warn('Error en búsqueda web rápida:', e);
    }

    if (webKnowledge && loadText) {
      loadText.textContent = `🌐 Búsqueda completada (${webKnowledge.source}: "${webKnowledge.title}"). Sintetizando preguntas académicas...`;
    } else if (loadText) {
      loadText.textContent = `📚 Consultando base de conocimientos de carreras universitarias y escolares...`;
    }

    await new Promise(resolve => setTimeout(resolve, 350));

    try {
      if (loadText) loadText.textContent = `✨ Formulando ${count.toLocaleString()} preguntas pedagógicas...`;
      const generatedQuestions = await this.generateQuestionsWithAI({
        topic,
        notes,
        webKnowledge,
        count,
        difficulty,
        type,
        timeLimit,
        onProgress: (current, total) => {
          if (loadText) {
            loadText.textContent = `✨ Formulando preguntas pedagógicas (${current.toLocaleString()} de ${total.toLocaleString()})...`;
          }
        }
      });

      if (!generatedQuestions || generatedQuestions.length === 0) {
        throw new Error('No se pudieron sintetizar preguntas para el tema.');
      }

      if (replace) {
        this.currentChallenge.questions = generatedQuestions;
      } else {
        if (this.currentChallenge.questions.length === 1 && !this.currentChallenge.questions[0].text.trim()) {
          this.currentChallenge.questions = generatedQuestions;
        } else {
          this.currentChallenge.questions.push(...generatedQuestions);
        }
      }

      // Configurar título y metadatos limpios sin signos de puntuación según lo solicitado
      const cleanTopicClean = this.cleanAIText(topic.trim());
      const cleanTitle = cleanTopicClean.charAt(0).toUpperCase() + cleanTopicClean.slice(1);
      this.currentChallenge.title = this.cleanAIText(`Reto de ${cleanTitle}`);
      this.currentChallenge.description = this.cleanAIText(`Cuestionario interactivo de evaluación y destreza sobre ${cleanTopicClean.toLowerCase()}`);
      this.currentChallenge.difficulty = difficulty;
      this.currentChallenge.timePerQuestion = timeLimit;
      this.currentChallenge.banner = this.getTopicBanner(topic);

      // Asignar categoría adecuada según el tema (asegurando IDs válidos en DEFAULT_CATEGORIES)
      const lowerTopic = topic.toLowerCase();
      if (/colombia|historia|guerra|revoluci|\broma\b|independencia|imperio|sociales|pol[ií]tica/i.test(lowerTopic)) {
        this.currentChallenge.category = 'sociales';
      } else if (/ciencia|biolog|qu[ií]mica|f[ií]sica|c[eé]lula|astro|solar|naturaleza|ecosistema/i.test(lowerTopic)) {
        this.currentChallenge.category = 'ciencias';
      } else if (/dama|dmbok|cdmp|gobierno de datos|data governance|gesti[oó]n de datos|data management|program|c[oó]digo|software|web|computa|tecnolog|hardware|javascript|python|\bia\b|inteligencia artificial/i.test(lowerTopic)) {
        this.currentChallenge.category = 'tecnologia';
      } else if (/geograf|capital|\bpa[ií]s\b|\bpa[ií]ses\b|continente|r[ií]o|monta|mapa/i.test(lowerTopic)) {
        this.currentChallenge.category = 'sociales';
      } else if (/piano|m[uú]sica|instrument|guitarra|viol[ií]n|canto|solfeo|arte|cine|pel[ií]cula|deporte|f[uú]tbol|literatura|libro/i.test(lowerTopic)) {
        this.currentChallenge.category = 'cultura';
      } else if (/matem[aá]tic|[aá]lgebra|geometr|c[aá]lculo|ecuaci|fracci/i.test(lowerTopic)) {
        this.currentChallenge.category = 'matematicas';
      } else if (/lengua|gram[aá]tica|espa[nñ]ol|ortograf|redacci/i.test(lowerTopic)) {
        this.currentChallenge.category = 'lenguaje';
      } else if (/ingl[eé]s|english|grammar|vocabulary/i.test(lowerTopic)) {
        this.currentChallenge.category = 'ingles';
      } else if (/derecho|ley|leyes|constituci|jur[ií]dic|norma/i.test(lowerTopic)) {
        this.currentChallenge.category = 'derecho';
      } else if (/admin|gobierno|gesti[oó]n|p[uú]blic/i.test(lowerTopic)) {
        this.currentChallenge.category = 'admin';
      } else if (/juego|videojuego|gaming|entretenimiento|anime|manga|c[oó]mic/i.test(lowerTopic)) {
        this.currentChallenge.category = 'entretenimiento';
      } else {
        this.currentChallenge.category = 'cultura';
      }

      // La autoría siempre pertenece al usuario actual
      this.currentChallenge.author = window.appState.currentUser?.name || 'Profesor';
      this.currentChallenge.authorAvatar = window.appState.currentUser?.avatar || '⚡';

      if (window.soundEngine && window.soundEngine.playCorrect) {
        window.soundEngine.playCorrect();
      }

      this.currentPage = 1;
      this.closeAIModal();
      this.render();
      setTimeout(() => {
        alert(`🎉 ¡Cuestionario de "${topic}" generado con éxito (${generatedQuestions.length.toLocaleString()} preguntas)!\n\nSe han organizado en páginas de 20 preguntas para que puedas revisarlas con total rapidez y fluidez.`);
      }, 100);
    } catch (err) {
      console.error('Error generando preguntas:', err);
      alert('⚠️ Hubo un problema al generar las preguntas. Intenta especificar el tema con mayor claridad.');
    } finally {
      if (loader) loader.style.display = 'none';
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  getTopicBanner(topic) {
    const t = (topic || '').toLowerCase().trim();
    if (/dama|dmbok|cdmp|gobierno de datos|data governance|gesti[oó]n de datos|data management|datos maestros|calidad de datos/i.test(t)) {
      return 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80';
    } else if (/gomita|gomitas|dulce|dulces|golosina|golosinas|caramelo|caramelos|malvavisco|marshmallow/i.test(t)) {
      return 'https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?auto=format&fit=crop&w=1200&q=80';
    } else if (/comida|comidas|gastronom|cocina|alimento|receta|postre|restaurante/i.test(t)) {
      return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80';
    } else if (/piano/i.test(t)) {
      return 'https://images.unsplash.com/photo-1520523839898-507127027581?auto=format&fit=crop&w=1200&q=80';
    } else if (/guitarra/i.test(t)) {
      return 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80';
    } else if (/m[uú]sica|canto|instrument|orquesta|sonata|partitura|trompeta|viol[ií]n|bater[ií]a/i.test(t)) {
      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80';
    } else if (/colombia/i.test(t)) {
      return 'https://images.unsplash.com/photo-1583531172005-824a73229b47?auto=format&fit=crop&w=1200&q=80';
    } else if (/historia|guerra|\broma\b|egipto|independencia|imperio/i.test(t)) {
      return 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80';
    } else if (/ciencia|biolog|qu[ií]mica|c[eé]lula|laboratorio|gen[eé]tic/i.test(t)) {
      return 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80';
    } else if (/universo|espacio|planeta|galaxia|solar|astro/i.test(t)) {
      return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80';
    } else if (/f[ií]sica|energ[ií]a|electricidad|[aá]tomo/i.test(t)) {
      return 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=80';
    } else if (/matem[aá]tic|[aá]lgebra|geometr|c[aá]lculo/i.test(t)) {
      return 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80';
    } else if (/program|c[oó]digo|software|web|javascript|python|computa|\bia\b|inteligencia artificial/i.test(t)) {
      return 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';
    } else if (/geograf|\bpa[ií]s\b|\bpa[ií]ses\b|mapa|continente|monta|viaje/i.test(t)) {
      return 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80';
    } else if (/animal|\baves?\b|fauna|naturaleza|selva|\bpez\b|peces|zoolog/i.test(t)) {
      return 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80';
    } else if (/literatura|libro|poes[ií]a|espa[nñ]ol|lectura/i.test(t)) {
      return 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1200&q=80';
    } else if (/deporte|f[uú]tbol|baloncesto|atletismo/i.test(t)) {
      return 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80';
    } else if (/juego|videojuego|gaming|anime/i.test(t)) {
      return 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80';
    } else if (/ingl[eé]s|english/i.test(t)) {
      return 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80';
    } else if (/derecho|ley|leyes|justicia/i.test(t)) {
      return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1200&q=80';
    }
    return 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=1200&q=80';
  },

  // =========================================================================
  // 🌐 Motor de Búsqueda Rápida en Vivo (Wikipedia / DuckDuckGo Instant)
  // Permite a la IA comprender cualquier carrera o tema universitario/escolar al instante
  // =========================================================================
  async fetchKnowledgeFromWeb(topic) {
    if (!topic || topic.trim().length < 2) return null;
    const cleanTopic = topic.trim();

    // 1. Búsqueda rápida en Wikipedia en Español (Action API pública CORS)
    try {
      const searchUrl = `https://es.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanTopic)}&utf8=&format=json&origin=*`;
      const searchRes = await fetch(searchUrl, { signal: AbortSignal.timeout(3000) });
      if (searchRes.ok) {
        const searchData = await searchRes.json();
        const hits = searchData?.query?.search || [];
        if (hits.length > 0) {
          const topHits = hits.slice(0, 2);
          const titles = topHits.map(h => h.title);
          const extractUrl = `https://es.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext=1&titles=${encodeURIComponent(titles.join('|'))}&format=json&origin=*`;
          const extractRes = await fetch(extractUrl, { signal: AbortSignal.timeout(3500) });
          if (extractRes.ok) {
            const extractData = await extractRes.json();
            const pages = extractData?.query?.pages || {};
            let fullText = '';
            let mainTitle = titles[0];
            Object.values(pages).forEach(p => {
              if (p.extract && p.extract.length > 60) {
                fullText += `\n\n` + p.extract;
              }
            });

            if (fullText.trim().length > 100) {
              return {
                title: mainTitle,
                content: fullText.trim(),
                snippets: topHits.map(h => (h.snippet || '').replace(/<[^>]*>/g, '')).join('; '),
                source: 'Wikipedia'
              };
            }
          }
        }
      }
    } catch (e) {
      console.warn('Búsqueda rápida en Wikipedia ES no disponible:', e);
    }

    // 2. Respaldo DuckDuckGo Instant Answer
    try {
      const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanTopic)}&format=json&no_html=1&skip_disambig=1`;
      const ddgRes = await fetch(ddgUrl, { signal: AbortSignal.timeout(2500) });
      if (ddgRes.ok) {
        const ddgData = await ddgRes.json();
        const text = ddgData?.AbstractText || ddgData?.Answer;
        if (text && text.length > 40) {
          return {
            title: ddgData?.Heading || cleanTopic,
            content: text,
            snippets: text,
            source: 'DuckDuckGo'
          };
        }
      }
    } catch (e) {}

    return null;
  },

  // Sintetizador de preguntas fácticas a partir de contenido extraído de la web
  extractQuestionsFromKnowledge(knowledge, topic, count, type, timeLimit) {
    if (!knowledge || !knowledge.content) return [];
    
    // Limpiar títulos de sección de Wikipedia y bibliografía
    let cleanText = knowledge.content
      .replace(/==+[^=]+==+/g, ' ')
      .replace(/[-=~#*_]{2,}\s*[^-\n=]+\s*[-=~#*_]{2,}/g, ' ')
      .replace(/[-=~#*_]{2,}/g, ' ')
      .replace(/\[\d+\]/g, '')
      .replace(/\s+/g, ' ');

    const rawSentences = cleanText
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length >= 35 && s.length <= 260 && !/^(Véase|Enlaces|Referencias|Bibliografía|Categoría|Portal)/i.test(s));

    if (rawSentences.length === 0) return [];

    const questions = [];
    const cleanTopic = topic.trim();

    for (let i = 0; i < rawSentences.length && questions.length < count; i++) {
      const sentence = rawSentences[i];
      const isBool = type === 'boolean' || (type === 'mixed' && questions.length % 2 === 1);

      if (isBool) {
        const isTrue = questions.length % 2 === 0;
        let qText = '';
        if (isTrue) {
          qText = `Respecto a ${cleanTopic} es verdadera la siguiente afirmación: ${sentence}`;
          questions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 0, 'boolean', timeLimit));
        } else {
          // Invertir ligeramente la afirmación
          let inverted = sentence.replace(/\b(siempre|todos|nunca|aumenta|mayor|principal|primero|directamente|positivo|máximo)\b/i, (m) => {
            const map = { 
              siempre: 'rara vez', 
              todos: 'ninguno', 
              nunca: 'habitualmente', 
              aumenta: 'disminuye', 
              mayor: 'menor', 
              principal: 'secundario', 
              primero: 'último',
              directamente: 'inversamente',
              positivo: 'negativo',
              máximo: 'mínimo'
            };
            return map[m.toLowerCase()] || 'no';
          });
          if (inverted === sentence) inverted = `En ${cleanTopic} se descarta que: ${sentence}`;
          qText = `Afirmación sobre ${cleanTopic}: ${inverted}`;
          questions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 1, 'boolean', timeLimit));
        }
      } else {
        // Opción múltiple con distractores académicos completos sin truncar
        let qText = '';
        let correctOpt = '';
        
        // Detectar si la oración tiene formato de definición: "X es Y..."
        const defMatch = sentence.match(/^([A-ZÁÉÍÓÚ][\w\s,]{2,45})\s+(es|son|fue|se define como|se refiere a|describe|constituye)\s+(.+)/i);
        if (defMatch && defMatch[1].length < 40 && defMatch[3].length > 20) {
          const concept = defMatch[1].trim();
          const desc = defMatch[3].trim();
          qText = `En el ámbito de ${cleanTopic}: Qué concepto se define o describe como: ${desc}`;
          correctOpt = concept;
        } else {
          qText = `De acuerdo con los fundamentos documentados de ${cleanTopic}, cuál de los siguientes enunciados es verdadero`;
          correctOpt = sentence;
        }

        // Distractores plausibles usando otras oraciones o contrastes académicos completos
        const nextSent1 = rawSentences[(i + 1) % rawSentences.length];
        const nextSent2 = rawSentences[(i + 2) % rawSentences.length];
        const d1 = (nextSent1 && nextSent1 !== sentence) ? nextSent1 : 'Es un principio descartado por la evidencia empírica';
        const d2 = (nextSent2 && nextSent2 !== sentence) ? nextSent2 : 'Aplica únicamente a modelos teóricos sin respaldo real';
        const d3 = 'Carece de aplicación en la práctica profesional contemporánea';

        const shuffled = this.shuffleOptions([correctOpt, d1, d2, d3], 0);
        questions.push(this.buildQuestionItem(qText, shuffled.options, shuffled.correctAnswer, 'single', timeLimit));
      }
    }

    return questions;
  },

  async generateQuestionsWithAI({ topic, notes, webKnowledge, count, difficulty, type, timeLimit, onProgress }) {
    let questions = [];

    // 1. Si el usuario proporcionó notas o texto de base, extraer preguntas contextualmente
    if (notes && notes.length > 30) {
      const contextual = this.getContextualQuestionsFromNotes(notes, count, type, timeLimit);
      questions.push(...contextual);
      if (questions.length >= count) return this.cleanAIQuestionsList(questions.slice(0, count));
    }

    // 2. Si se obtuvo información de la búsqueda rápida en vivo en la web (Wikipedia / DuckDuckGo)
    if (webKnowledge && webKnowledge.content && webKnowledge.content.length > 80 && questions.length < count) {
      const remainder = count - questions.length;
      const webQuestions = this.extractQuestionsFromKnowledge(webKnowledge, topic, remainder, type, timeLimit);
      questions.push(...webQuestions);
      if (questions.length >= count) return this.cleanAIQuestionsList(questions.slice(0, count));
    }

    // 3. Complementar o generar a partir de la Ontología Académica Universal de Carreras y Especialidades
    const remainder = count - questions.length;
    const topicQ = await this.getTopicQuestions(topic, remainder, difficulty, type, timeLimit, onProgress);
    questions.push(...topicQ);

    return this.cleanAIQuestionsList(questions.slice(0, count));
  },

  cleanAIQuestionsList(questions) {
    return (questions || []).map(q => {
      q.text = this.cleanAIText(q.text, true);
      if (Array.isArray(q.options)) {
        q.options = q.options.map(opt => {
          if (typeof opt === 'string') return this.cleanAIText(opt, false);
          return {
            ...opt,
            text: this.cleanAIText(opt.text, false)
          };
        });
      }
      if (Array.isArray(q.acceptedAnswers)) {
        q.acceptedAnswers = q.acceptedAnswers.map(ans => this.cleanAIText(ans, false));
      }
      if (typeof q.correctAnswer === 'string') {
        q.correctAnswer = this.cleanAIText(q.correctAnswer, false);
      }
      return q;
    });
  },

  getContextualQuestionsFromNotes(notes, count, type, timeLimit) {
    const sentences = notes
      .split(/[.\n;]+/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && !/^[0-9]+$/.test(s));

    const questions = [];

    for (let i = 0; i < sentences.length && questions.length < count; i++) {
      const sentence = sentences[i];
      const isBool = type === 'boolean' || (type === 'mixed' && questions.length % 2 === 1);

      if (isBool) {
        const isTrue = questions.length % 2 === 0;
        let qText = '';
        if (isTrue) {
          qText = `De acuerdo con el texto: ${sentence}`;
          questions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 0, 'boolean', timeLimit));
        } else {
          let inverted = sentence.replace(/\b(siempre|todos|nunca|aumenta|mayor|principal|primero)\b/i, (m) => {
            const map = { siempre: 'rara vez', todos: 'ninguno', nunca: 'siempre', aumenta: 'disminuye', mayor: 'menor', principal: 'secundario', primero: 'último' };
            return map[m.toLowerCase()] || 'no';
          });
          if (inverted === sentence) inverted = `No es cierto que: ${sentence}`;
          qText = `Afirmación: ${inverted}`;
          questions.push(this.buildQuestionItem(qText, ['Verdadero', 'Falso'], 1, 'boolean', timeLimit));
        }
      } else {
        let qText = `Cuál de los siguientes enunciados resume correctamente el concepto: ${sentence}`;
        const correct = sentence;
        
        const distractor1 = sentences[(i + 1) % sentences.length] ? sentences[(i + 1) % sentences.length] : 'Ocurre únicamente en condiciones artificiales controladas';
        const distractor2 = sentences[(i + 2) % sentences.length] ? sentences[(i + 2) % sentences.length] : 'Carece de relevancia para el proceso principal analizado';
        const distractor3 = 'Es un principio descartado por la evidencia empírica reciente';

        const shuffled = this.shuffleOptions([correct, distractor1, distractor2, distractor3], 0);
        questions.push(this.buildQuestionItem(qText, shuffled.options, shuffled.correctAnswer, 'single', timeLimit));
      }
    }

    return questions;
  },

  async getTopicQuestions(topic, count, difficulty, type, timeLimit, onProgress) {
    const t = topic.toLowerCase().trim();
    let candidates = [];

    // =========================================================================
    // 📚 DAMA-DMBOK (Data Management Body of Knowledge - DAMA International / CDMP)
    // Cobertura completa de las 11 Áreas de Conocimiento, Rueda de DAMA y Mejores Prácticas
    // =========================================================================
    if (/dama|dmbok|dama-dmbok|cdmp|gobierno de datos|data governance|gesti[oó]n de datos|data management|datos maestros|mdm|calidad de datos|data quality|arquitectura de datos|data steward/i.test(t)) {
      candidates = [
        {
          text: `En el marco internacional DAMA-DMBOK2, ¿cuál de las 11 áreas de conocimiento se ubica en el centro de la Rueda de DAMA (DAMA Wheel) como función integradora y rectora?`,
          opts: ['El Gobierno de Datos (Data Governance)', 'El Almacén de Datos (Data Warehousing)', 'El Modelado y Diseño de Datos', 'La Seguridad de Datos'],
          correct: 0,
          isBool: false
        },
        {
          text: `Según DAMA-DMBOK, ¿cuál es la diferencia fundamental entre el Gobierno de Datos (Data Governance) y la Gestión de Datos (Data Management)?`,
          opts: [
            'El Gobierno define la estrategia, políticas y autoridad de decisión (\'hacer lo correcto\'), mientras la Gestión ejecuta y opera (\'hacerlo correctamente\')',
            'El Gobierno es exclusivo del departamento de TI y la Gestión pertenece al área comercial',
            'No existe diferencia sustancial; DAMA los define como términos idénticos e intercambiables',
            'El Gobierno aplica únicamente a datos no estructurados y la Gestión a bases de datos relacionales'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `De acuerdo con la disciplina de Calidad de Datos (Data Quality) en DAMA-DMBOK, ¿cuáles son las seis dimensiones canónicas para medir la calidad del dato?`,
          opts: [
            'Exactitud, Completitud, Consistencia, Puntualidad (Timeliness), Validez y Unicidad',
            'Volumen, Velocidad, Variedad, Veracidad, Valor y Viabilidad',
            'Cifrado, Autenticación, Trazabilidad, Disponibilidad, Hash y Privacidad',
            'Almacenamiento, Conectividad, Latencia, Indexación, Rendimiento y Rendición'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Gestión de Datos Maestros (MDM) según DAMA-DMBOK, ¿cómo se denomina a la versión única, consolidada y confiable de la verdad sobre una entidad de negocio (e.g. Cliente)?`,
          opts: ['El Registro Dorado (\'Golden Record\' o Single Source of Truth)', 'La Clave Primaria Clustered', 'El Snapshot Temporal Incremental', 'El Hash Criptográfico Maestro'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la arquitectura DAMA-DMBOK, ¿en qué se diferencian los Datos Maestros (Master Data) de los Datos de Referencia (Reference Data)?`,
          opts: [
            'Los datos maestros representan las entidades esenciales del negocio (clientes, productos), mientras los de referencia definen valores permitidos y clasificaciones (códigos ISO, divisas)',
            'Los datos de referencia son numéricos y los maestros son alfanuméricos',
            'Los datos maestros cambian cada milisegundo y los de referencia son volátiles en tiempo real',
            'Los datos de referencia solo residen en hardware local y los maestros en nubes públicas'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el marco de gobernanza de DAMA, ¿qué rol actúa como custodio y puente entre el negocio y la tecnología velando por la definición y calidad de los datos de su dominio?`,
          opts: ['El Data Steward (Custodio de Datos)', 'El Ingeniero de Redes WAN', 'El Operador del centro de cómputo', 'El Auditor Externo de Hardware'],
          correct: 0,
          isBool: false
        },
        {
          text: `En el Modelado de Datos según DAMA-DMBOK, ¿cuál es la secuencia metodológica estándar desde las necesidades de negocio hasta su despliegue en el DBMS?`,
          opts: [
            'Modelo Conceptual (entidades de negocio) ➔ Modelo Lógico (atributos y relaciones 3NF) ➔ Modelo Físico (tablas, índices y DBMS)',
            'Modelo Físico ➔ Modelo Lógico ➔ Modelo Conceptual',
            'Modelo Dimensional ➔ Modelo Jerárquico ➔ Modelo de Red',
            'Modelo NoSQL ➔ Modelo Relacional ➔ Modelo de Metadatos'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la arquitectura de Data Warehousing (DW/BI) documentada en DAMA-DMBOK, ¿cuál es el enfoque atribuido a Ralph Kimball frente al de Bill Inmon?`,
          opts: [
            'Kimball propone un enfoque ascendente con modelos dimensionales (Data Marts en estrella), mientras Inmon propone un enfoque descendente corporativo normalizado (EDW en 3NF)',
            'Inmon solo utiliza archivos CSV y Kimball bases de datos documentales NoSQL',
            'Kimball descarta los procesos ETL y aboga únicamente por consultas federadas',
            'Inmon propone descentralizar los datos sin ningún modelo de gobierno corporativo'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `Según DAMA-DMBOK, ¿cuáles son las tres categorías primarias en las que se clasifican los Metadatos organizacionales?`,
          opts: [
            'Metadatos de Negocio (definiciones, reglas), Metadatos Técnicos (esquemas, tipos) y Metadatos Operativos (logs, volumen, linaje)',
            'Metadatos de Entrada, Metadatos de Proceso y Metadatos de Salida',
            'Metadatos de Usuario, Metadatos de Administrador y Metadatos de Proveedor',
            'Metadatos Públicos, Metadatos Privados y Metadatos Ocultos'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Gestión de Metadatos según DAMA, ¿qué capacidad permite mapear el ciclo de vida completo de un dato, mostrando su origen, transformaciones y destino final?`,
          opts: ['El Linaje de Datos (Data Lineage)', 'La Replicación Maestro-Esclavo', 'La Compresión Bitmap', 'El Profiling de Índices'],
          correct: 0,
          isBool: false
        },
        {
          text: `En los diagramas contextuales de DAMA-DMBOK, ¿qué elementos ambientales enmarcan cada una de las 11 áreas de conocimiento (Hexágono de DAMA)?`,
          opts: [
            'Metas y Principios, Actividades, Entregables, Roles y Responsabilidades, Prácticas y Métodos, Herramientas, y Organización y Cultura',
            'Entrada, Proceso, Salida, Realimentación, Memoria y Control',
            'Planear, Hacer, Verificar, Actuar, Auditar y Reportar',
            'Servidores, Redes, Almacenamiento, Software, Licencias y Costos'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Seguridad y Privacidad de Datos (DAMA-DMBOK), ¿qué principio exige que la gobernanza, anonimización y controles de seguridad se integren desde la fase conceptual del sistema?`,
          opts: ['Privacidad desde el Diseño (\'Privacy by Design\')', 'Seguridad por Oscuridad', 'Acceso Abierto por Omisión', 'Auditoría Post-Despliegue Únicamente'],
          correct: 0,
          isBool: false
        },
        {
          text: `En el modelado relacional transaccional (OLTP) según DAMA-DMBOK, ¿cuál es el beneficio central de normalizar una base de datos hasta Tercera Forma Normal (3NF)?`,
          opts: [
            'Eliminar la redundancia innecesaria y prevenir anomalías de inserción, actualización y borrado',
            'Acelerar drásticamente los reportes analíticos masivos agregando datos repetidos',
            'Permitir que las tablas carezcan de clave primaria o índices',
            'Convertir automáticamente los datos en un esquema NoSQL sin esquemas'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el modelado dimensional para analítica (DAMA-DMBOK), ¿cómo se estructura un esquema en estrella (\'Star Schema\')?`,
          opts: [
            'Una tabla central de Hechos (Fact Table con métricas numéricas) rodeada de tablas de Dimensiones (con contexto descriptivo)',
            'Múltiples tablas normalizadas en 3NF unidas por claves foráneas en cascada',
            'Un árbol jerárquico de nodos XML con etiquetas autodescriptivas',
            'Una base de datos de clave-valor sin relaciones predefinidas'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el Modelo de Madurez de Gestión de Datos de DAMA (Data Management Maturity Model), ¿cuál es la escala típica de niveles de madurez organizacional?`,
          opts: [
            'Nivel 1 (Inicial / Ad-hoc) ➔ Nivel 2 (Repetible) ➔ Nivel 3 (Definido) ➔ Nivel 4 (Gestionado) ➔ Nivel 5 (Optimizado)',
            'Nivel Bronce ➔ Nivel Plata ➔ Nivel Oro ➔ Nivel Platino',
            'Nivel Básico ➔ Nivel Medio ➔ Nivel Avanzado',
            'Nivel Alpha ➔ Nivel Beta ➔ Nivel Release ➔ Nivel Gold'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Gestión de Datos Maestros y Gobierno, ¿qué artefacto formal centraliza las definiciones compartidas y consensuadas de los conceptos de negocio para evitar ambigüedades terminológicas?`,
          opts: ['El Glosario de Negocio (Business Glossary)', 'El Catálogo de Cables y Servidores', 'El Repositorio de Código Git', 'El Registro de Eventos del Sistema Operativo'],
          correct: 0,
          isBool: false
        },
        {
          text: `En el almacenamiento analítico (DW/BI) según DAMA, ¿cómo gestiona una Dimensión de Cambio Lento de Tipo 2 (SCD Tipo 2) la actualización histórica de un atributo?`,
          opts: [
            'Crea un nuevo registro en la dimensión con fechas de vigencia (Start Date / End Date e indicador actual), preservando todo el historial',
            'Sobrescribe el valor anterior borrando permanentemente el dato histórico (SCD Tipo 1)',
            'Elimina toda la tabla de hechos asociada al cliente',
            'Bloquea la base de datos para impedir cualquier modificación futura'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el capítulo de Ética de los Datos de DAMA-DMBOK, ¿qué principio postula que los modelos analíticos y de IA deben ser transparentes, justos y libres de discriminación sistemática?`,
          opts: ['Equidad Algorítmica y Tratamiento Justo de Datos', 'Monetización Agresiva de Datos de Usuarios', 'Ocultamiento de Sesgos Estadísticos', 'Opacidad de Modelos de Caja Negra'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la disciplina de Calidad de Datos (DAMA-DMBOK), ¿qué técnica consiste en examinar empíricamente los datos reales de una fuente para identificar patrones, distribuciones y porcentajes de nulos?`,
          opts: ['El Perfilamiento de Datos (Data Profiling)', 'El Particionamiento de Disco Lógico', 'La Desfragmentación de Archivos', 'El Escaneo de Puertos de Red'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Gestión de Datos Maestros (MDM), ¿qué proceso algorítmico identifica si registros en sistemas dispares corresponden al mismo cliente o paciente del mundo real?`,
          opts: ['La Resolución de Entidades (Entity Resolution / Matching)', 'El Protocolo de Enrutamiento BGP', 'La Serialización JSON', 'El Algoritmo de Compresión GZIP'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Cuál es la certificación profesional internacional oficial otorgada por DAMA International que acredita el conocimiento integral del DMBOK?`,
          opts: ['CDMP (Certified Data Management Professional)', 'CISSP de Ciberseguridad', 'PMP de Gestión de Proyectos', 'CFA de Análisis Financiero'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la Integración de Datos (DAMA-DMBOK), ¿en qué consiste la técnica de Captura de Datos Modificados (Change Data Capture - CDC)?`,
          opts: [
            'Identificar y capturar únicamente las filas que han cambiado en la fuente (insert, update, delete) para sincronizaciones eficientes sin recargar toda la base',
            'Hacer una copia de seguridad física completa de todos los terabytes cada 5 minutos',
            'Eliminar los registros que superen más de un año de antigüedad',
            'Convertir automáticamente los datos numéricos en cadenas de texto'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la arquitectura de datos contemporánea documentada en las evoluciones de DAMA, ¿cuál es la diferencia conceptual entre un Data Warehouse y un Data Lake?`,
          opts: [
            'El Data Warehouse almacena datos curados y estructurados para analítica (Schema-on-Write), mientras el Data Lake almacena datos nativos estructurados y no estructurados (Schema-on-Read)',
            'El Data Lake no admite almacenar texto y el Data Warehouse solo admite archivos PDF',
            'El Data Warehouse se aloja en cinta magnética y el Data Lake en disquetes',
            'Son soluciones idénticas sin ninguna diferencia técnica o arquitectónica'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `¿El marco DAMA-DMBOK considera a los datos como un activo corporativo estratégico que posee valor económico real y debe ser gestionado con el mismo rigor que los activos financieros o físicos?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿El Gobierno de Datos según DAMA-DMBOK es un proyecto con fecha final definida y no un programa continuo e interactivo de la organización?`,
          opts: ['Verdadero', 'Falso'],
          correct: 1, // Falso: DAMA afirma que es un programa continuo y una disciplina permanente, no un proyecto que termina
          isBool: true
        }
      ];
    }
    // 0. Confitería / Gomitas / Dulces / Golosinas / Caramelos
    else if (/gomita|gomitas|dulce|dulces|golosina|golosinas|caramelo|caramelos|confiter|malvavisco|marshmallow|paleta|chupet/i.test(t)) {
      candidates = [
        {
          text: `En la elaboración tradicional de gomitas, ¿cuál es el agente gelificante principal que les otorga su textura elástica y masticable característica?`,
          opts: ['La grenetina o gelatina purificada (colágeno animal)', 'El gluten de trigo deshidratado', 'El bicarbonato de sodio', 'La levadura seca activa'],
          correct: 0,
          isBool: false
        },
        {
          text: `Para fabricar gomitas aptas para consumidores veganos o vegetarianos, ¿qué alternativa vegetal a la gelatina animal se emplea mayoritariamente?`,
          opts: ['La pectina de frutas cítricas o el agar-agar (de algas marinas)', 'La harina de soya tostada', 'La celulosa sintética no digestible', 'El almidón de yuca frito'],
          correct: 0,
          isBool: false
        },
        {
          text: `En 1920 en Bonn (Alemania), Hans Riegel fundó una célebre empresa de golosinas cuyo nombre es un acrónimo de su nombre y ciudad. ¿Cuál es esta marca creadora de los ositos de goma ('Tanzbären') en 1922?`,
          opts: ['Haribo (HAns RIegel BOnn)', 'Trolli Candy Corp', 'Chupa Chups Internacional', 'Jelly Belly Company'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la manufactura industrial de gomitas, ¿cómo se denomina la máquina y método clásico donde el jarabe líquido caliente se vierte en cavidades moldeadas sobre bandejas de almidón de maíz?`,
          opts: ['El sistema o planta Mogul (Moulding Mogul)', 'La extrusión continua en frío', 'El hilado centrífugo térmico', 'El laminado por rodillos de vacío'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué ácido alimentario en polvo se combina con azúcar sobre las gomitas ácidas ('sour gummies') para producir su sensación de acidez chispeante y refrescante?`,
          opts: ['Ácido cítrico o ácido málico', 'Ácido acético concentrado', 'Ácido fosfórico puro', 'Ácido clorhídrico diluido'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué sustancia natural de origen vegetal o apícola se aplica en una capa microscópica sobre las gomitas para otorgarles brillo reluciente y evitar que se peguen en la bolsa?`,
          opts: ['Cera de carnauba o cera de abejas con aceite vegetal', 'Manteca de cacao hidrogenada', 'Goma arábiga en polvo', 'Glaseado de clara de huevo cruda'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Por qué las gomitas de gelatina tradicional se derriten suavemente en la boca al consumirlas?`,
          opts: ['Porque el punto de fusión térmico de la gelatina (aprox. 35 °C a 37 °C) es muy similar a la temperatura corporal humana', 'Porque la saliva contiene enzimas que desintegran polímeros plásticos', 'Porque el azúcar produce una reacción química exotérmica inmediata', 'Porque contienen microcápsulas de gas que estallan con la masticación'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la formulación de gomitas y caramelos blandos, ¿qué ingrediente es indispensable para controlar la viscosidad y evitar que la sacarosa cristalice volviendo opaca la mezcla?`,
          opts: ['El jarabe de glucosa (o jarabe de maíz)', 'El alcohol etílico rectificado', 'El vinagre blanco destilado', 'El aceite de oliva virgen'],
          correct: 0,
          isBool: false
        },
        {
          text: `En 1981, la compañía alemana de golosinas Trolli revolucionó el mercado infantil lanzando al mundo una nueva forma de gomitas que hoy es un clásico. ¿Cuál fue?`,
          opts: ['Los gusanos de goma masticables', 'Los tiburones bicolores', 'Las botellitas de cola azucaradas', 'Los aros de manzana con relleno'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué función esencial cumple el almidón de maíz en las bandejas durante el proceso de moldeado de gomitas?`,
          opts: ['Sostener la forma de la gomita y absorber lentamente la humedad residual durante el secado', 'Aportar el sabor dulce principal del caramelo', 'Colorear de blanco la superficie exterior', 'Impedir el paso de la luz ultravioleta'],
          correct: 0,
          isBool: false
        },
        {
          text: `En los últimos años, ¿qué tipo de gomitas ha crecido exponencialmente en el mercado de suplementos de salud frente a las pastillas o jarabes tradicionales?`,
          opts: ['Gomitas vitamínicas y nutricionales (con vitaminas C, D, biotina o melatonina)', 'Gomitas con cafeína para deportistas de motor', 'Gomitas anestésicas para odontología', 'Gomitas deshidratadas para viajes espaciales'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué colorante natural se utiliza con frecuencia en gomitas para conseguir tonos rojos o púrpuras sin recurrir a tintes sintéticos como el Rojo 40?`,
          opts: ['Jugo concentrado de remolacha (betanina) o extracto de zanahoria negra', 'Extracto de carbón mineral activado', 'Sulfato de cobre soluble', 'Polvo de cúrcuma tostada'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué propiedad física describe la capacidad mecánica de las gomitas para estirarse o deformarse ante la presión y regresar luego a su forma original?`,
          opts: ['La viscoelasticidad y elasticidad del gel de polímeros', 'La dureza superficial en la escala de Mohs', 'La fragilidad y fractura por cizallamiento', 'La densidad volumétrica de sólidos'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Las gomitas de gelatina tradicional contienen un alto contenido de colágeno debido a su origen en tejidos animales conectivos purificados?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿Las gomitas elaboradas con pectina vegetal suelen tener una textura ligeramente más corta y suave al morder que las de gelatina, y resisten mejor las altas temperaturas sin derretirse?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿El recubrimiento de cera de carnauba en las gomitas se extrae de las hojas de una palma originaria del noreste de Brasil?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿Las gomitas comerciales deben conservarse idealmente en lugares secos y frescos para evitar que la humedad ambiente las vuelva pegajosas o deformes?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿Es históricamente cierto que los primeros ositos de goma de Haribo se inspiraron en los osos amaestrados que bailaban en los mercados populares de Europa en el siglo XIX y XX?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿Qué término de confitería describe a las gomitas que tienen una capa externa elástica y un centro líquido o semilíquido con sabor frutal concentrado?`,
          opts: ['Gomitas con centro líquido (liquid center gummies)', 'Gomitas grageadas duras', 'Gomitas efervescentes carbonatadas', 'Gomitas cristalizadas por liofilización'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Cuál de las siguientes opciones describe una variedad popular de gomitas con forma de aro cubiertas de azúcar ácido?`,
          opts: ['Aros o anillos frutales ácidos (Peach rings)', 'Tiras de regaliz negro trenzado', 'Pastillas de menta prensadas', 'Caramelos macizos de mantequilla'],
          correct: 0,
          isBool: false
        }
      ];
    }
    // 1. Gastronomía / Comidas / Cocina / Alimentos / Recetas
    else if (/comida|comidas|gastronom|cocina|alimento|alimentos|receta|recetas|culinari|nutrici|chef|plato|platos|ingrediente|postre|panader|reposter|restaurante/i.test(t)) {
      candidates = [
        {
          text: `En la gastronomía mundial, ¿cuál de los siguientes cereales es el ingrediente base para elaborar la pasta tradicional y el pan?`,
          opts: ['El trigo (harina o sémola de trigo)', 'El arroz blanco pulido', 'La avena forrajera', 'El centeno silvestre'],
          correct: 0,
          isBool: false
        },
        {
          text: `La pizza Margherita nació en Nápoles en 1889 creada por Raffaele Esposito. ¿Qué representan sus tres ingredientes (tomate, mozzarella y albahaca)?`,
          opts: [
            'Los colores de la bandera de Italia (rojo, blanco y verde) en honor a la reina Margarita',
            'Las tres provincias más ricas del Imperio Romano',
            'Los tres puertos mercantes de Nápoles en el siglo XIX',
            'Un tributo a los tres elementos del mar Mediterráneo'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `¿En qué región del planeta se originó históricamente el cultivo de la papa (patata), alimento que revolucionó la nutrición mundial?`,
          opts: [
            'En la cordillera de los Andes de Sudamérica (actual Perú y Bolivia)',
            'En las llanuras fluviales de Mesopotamia',
            'En las estepas de Europa Oriental',
            'En el delta del río Nilo'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `El chocolate proviene del grano de cacao. ¿Qué civilizaciones mesoamericanas fueron las primeras en cultivarlo y beberlo como una preparación sagrada ('xocolatl')?`,
          opts: ['Los mayas y los aztecas', 'Los incas y los chimúes', 'Los fenicios y los griegos', 'Los egipcios y los persas'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la alta cocina internacional, ¿cuál es la especia más costosa del mundo por gramo, recolectada a mano de los estigmas desecados de una flor?`,
          opts: ['El azafrán (Crocus sativus)', 'La vainilla natural', 'El cardamomo verde', 'La canela de Ceilán'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Cuál de las siguientes salsas es una de las 5 'salsas madre' de la cocina tradicional francesa formulada a base de leche y roux de mantequilla con harina?`,
          opts: ['La salsa bechamel', 'La salsa holandesa', 'La salsa chimichurri', 'La salsa tártara'],
          correct: 0,
          isBool: false
        },
        {
          text: `En la cocina japonesa tradicional, ¿qué significa originariamente la palabra 'Sushi'?`,
          opts: [
            'Arroz sazonado con vinagre (un método antiguo de preservación)',
            'Pescado crudo fileteado finamente',
            'Alga marina tostada para enrollar',
            'Bocado cocinado al vapor'
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué proceso biológico realizan las levaduras en la masa para producir dióxido de carbono y lograr que el pan crezca esponjoso?`,
          opts: ['La fermentación alcohólica', 'La pasteurización térmica', 'La coagulación enzimática', 'La hidrólisis ácida'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Cuál es el quinto sabor básico reconocido científicamente por las papilas gustativas, asociado al glutamato y descrito como sabroso o profundo?`,
          opts: ['Umami', 'Astringente', 'Amargo', 'Metálico'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué fruto oleaginoso es la materia prima indispensable para elaborar el aceite virgen base de la dieta mediterránea?`,
          opts: ['La aceituna (fruto del olivo)', 'La semilla de colza', 'El grano de sésamo tostado', 'La nuez de macadamia'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿En el ceviche tradicional, el ácido cítrico del jugo de limón o lima actúa desnaturalizando y coagulando las proteínas del pescado fresco?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿El queso se obtiene mediante la coagulación de la leche, separando la cuajada de los sólidos lácteos del suero líquido?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿El café es una infusión originaria de las mesetas y tierras altas de Etiopía en África Oriental?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿La miel pura de abeja posee propiedades antibacterianas naturales y casi nula humedad, lo que le permite conservarse durante siglos sin caducar?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿La técnica culinaria del 'salteado' consiste en cocinar alimentos a fuego bajo durante varias horas cubiertos de caldo?`,
          opts: ['Falso', 'Verdadero'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿Qué tipo de corte en gastronomía consiste en cortar verduras en tiras finas y alargadas de unos 5 cm de largo por 2 mm de grosor?`,
          opts: ['Corte en juliana', 'Corte brunoise', 'Corte chifonada', 'Corte paisana'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué hongo subterráneo silvestre de intenso aroma, recolectado con ayuda de perros o cerdos adiestrados, es un tesoro culinario de gran valor?`,
          opts: ['La trufa (negra o blanca)', 'El champiñón de París', 'La seta shiitake', 'El hongo portobello'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué plato icónico de la gastronomía española se prepara tradicionalmente a fuego de leña con arroz, azafrán, carnes o mariscos en una sartén ancha y plana?`,
          opts: ['La paella valenciana', 'El gazpacho andaluz', 'La tortilla de patatas', 'El cocido madrileño'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Qué proteína compleja presente en el trigo, la cebada y el centeno aporta elasticidad y estructura a las masas de panadería?`,
          opts: ['El gluten', 'La albúmina', 'La caseína', 'El colágeno'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿El guacamole tradicional mexicano tiene como ingrediente principal al aguacate (palta) triturado con cebolla, cilantro y zumo de lima?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        }
      ];
    }
    // 1. Zoología / Animales / Vertebrados e Invertebrados / Ecosistemas
    else if (/animal|vertebrad|invertebrad|mam[ií]fer|\baves?\b|reptil|anfibio|\bpez\b|peces|fauna|zoolog|selva|especie/i.test(t)) {
      candidates = [
        { text: `En el estudio de ${topic}, ¿cuál es la característica fundamental que define a los animales vertebrados?`, opts: ['Poseen columna vertebral y un endoesqueleto articulado', 'Carecen por completo de tejido muscular', 'Tienen únicamente un caparazón externo de carbonato', 'Obtienen energía mediante fotosíntesis'], correct: 0, isBool: false },
        { text: `¿Cuál de los siguientes grupos de animales pertenece a los invertebrados?`, opts: ['Los artrópodos (insectos, arácnidos y crustáceos)', 'Los mamíferos', 'Las aves rapaces', 'Los reptiles'], correct: 0, isBool: false },
        { text: `¿Qué función esencial cumple el sistema esquelético en los animales vertebrados?`, opts: ['Proporcionar soporte estructural, protección de órganos y locomoción', 'Secretar hormonas digestivas exclusivamente', 'Sustituir la respiración celular', 'Evitar la pérdida de clorofila'], correct: 0, isBool: false },
        { text: `¿Cuál de las siguientes es una adaptación típica de los animales que habitan en ecosistemas selváticos?`, opts: ['Camuflaje y adaptaciones para trepar o volar en el dosel', 'Ausencia total de órganos sensoriales', 'Hibernación continua durante todo el año', 'Incapacidad de interactuar con otras especies'], correct: 0, isBool: false },
        { text: `¿Los animales invertebrados representan más del 90% de todas las especies animales conocidas en la Tierra?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Los mamíferos se caracterizan por alimentar a sus crías con leche materna producida por glándulas mamarias?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Los reptiles y anfibios son organismos endotérmicos (de sangre caliente que regulan su temperatura internamente)?`, opts: ['Falso', 'Verdadero'], correct: 0, isBool: true },
        { text: `¿Qué tipo de respiración presentan los peces en su entorno acuático?`, opts: ['Respiración branquial', 'Respiración exclusivamente pulmonar', 'Respiración traqueal aérea', 'Respiración celular anaeróbica estricta'], correct: 0, isBool: false }
      ];
    }
    // 2. Botánica / Plantas / Fotosíntesis / Flora
    else if (/planta|bot[aá]nic|flora|fotos[ií]ntesis|hoja|ra[ií]z|clorofila|vegetal|semilla|bosque/i.test(t)) {
      candidates = [
        { text: `En relación con ${topic}, ¿en qué orgánulo celular de las plantas se realiza la fotosíntesis?`, opts: ['En los cloroplastos', 'En el aparato de Golgi', 'En los ribosomas libres', 'En los lisosomas'], correct: 0, isBool: false },
        { text: `¿Qué pigmento vegetal es el principal responsable de absorber la luz solar para la fotosíntesis?`, opts: ['La clorofila', 'La hemoglobina', 'La melanina', 'La queratina'], correct: 0, isBool: false },
        { text: `¿Qué estructura de la planta tiene como función primordial absorber agua y nutrientes del suelo?`, opts: ['La raíz', 'El cáliz floral', 'El fruto maduro', 'La cutícula superior'], correct: 0, isBool: false },
        { text: `¿Qué gas liberan las plantas a la atmósfera como subproducto de la fotosíntesis?`, opts: ['Oxígeno (O2)', 'Dióxido de carbono (CO2)', 'Monóxido de carbono (CO)', 'Metano (CH4)'], correct: 0, isBool: false },
        { text: `¿El xilema y el floema son los tejidos conductores encargados del transporte de savia en las plantas vasculares?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Las plantas son organismos autótrofos capaces de producir su propio alimento a partir de luz y compuestos inorgánicos?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Las plantas carnívoras obtienen toda su energía de la digestión de insectos sin realizar fotosíntesis?`, opts: ['Falso', 'Verdadero'], correct: 0, isBool: true }
      ];
    }
    // 3. Anatomía / Cuerpo Humano / Medicina / Salud
    else if (/cuerpo|anatom|coraz[oó]n|cerebro|pulm[oó]n|hueso|m[uú]sculo|sangre|m[eé]dic|salud|enfermedad/i.test(t)) {
      candidates = [
        { text: `En relación con ${topic}, ¿cuál es el órgano principal del sistema circulatorio encargado de bombear sangre?`, opts: ['El corazón', 'El hígado', 'El bazo', 'El páncreas'], correct: 0, isBool: false },
        { text: `¿Qué tipo de células sanguíneas tienen como función principal defender al organismo contra agentes infecciosos?`, opts: ['Los leucocitos (glóbulos blancos)', 'Los eritrocitos (glóbulos rojos)', 'Las plaquetas (trombocitos)', 'Los adipocitos'], correct: 0, isBool: false },
        { text: `¿Qué estructura del sistema nervioso central coordina los movimientos voluntarios, el pensamiento y la memoria?`, opts: ['El cerebro', 'La médula espinal', 'El nervio ciático', 'Los ganglios periféricos'], correct: 0, isBool: false },
        { text: `¿En qué órgano del cuerpo humano se realiza el intercambio gaseoso de oxígeno y dióxido de carbono?`, opts: ['En los pulmones (alvéolos)', 'En la tráquea', 'En el diafragma', 'En los bronquios principales'], correct: 0, isBool: false },
        { text: `¿El sistema esquelético humano de un adulto está compuesto aproximadamente por 206 huesos?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Las arterias transportan generalmente sangre rica en oxígeno desde el corazón hacia los tejidos del cuerpo?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 4. Astronomía / Sistema Solar / Espacio
    else if (/sistema solar|planeta|espacio|universo|estrella|galaxia|marte|jupiter|tierra|luna|astronom|cosmos/i.test(t)) {
      candidates = [
        { text: `Respecto a ${topic}, ¿cuál es el planeta de mayor tamaño en nuestro sistema solar?`, opts: ['Júpiter', 'Saturno', 'Neptuno', 'Urano'], correct: 0, isBool: false },
        { text: `¿Cuál es el objeto celeste central que concentra más del 99% de la masa total del sistema solar?`, opts: ['El Sol', 'Júpiter', 'La Vía Láctea', 'El cinturón de asteroides'], correct: 0, isBool: false },
        { text: `¿Por qué se conoce a Marte popularmente como el "Planeta Rojo"?`, opts: ['Por la abundancia de óxido de hierro en su superficie', 'Por tener volcanes de lava activa constante', 'Por reflejar la luz de la estrella Betelgeuse', 'Por estar cubierto de nubes de ácido'], correct: 0, isBool: false },
        { text: `¿Qué fuerza fundamental mantiene a los planetas orbitando alrededor del Sol?`, opts: ['La fuerza de gravedad', 'La fuerza electromagnética', 'La presión solar fotónica', 'La fuerza centrífuga'], correct: 0, isBool: false },
        { text: `¿La Tierra es el tercer planeta en orden de cercanía al Sol?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿La Luna tiene luz propia generada por reacciones nucleares internas?`, opts: ['Falso', 'Verdadero'], correct: 0, isBool: true }
      ];
    }
    // 5. Física / Fuerzas / Energía / Movimiento
    else if (/f[ií]sica|gravedad|newton|energ[ií]a|fuerza|movimiento|onda|velocidad|aceleraci|termodin[aá]mic|electricidad/i.test(t)) {
      candidates = [
        { text: `En el ámbito de ${topic}, ¿qué principio enuncia que para toda fuerza de acción existe una reacción de igual magnitud y sentido opuesto?`, opts: ['Tercera Ley de Newton', 'Primera Ley de Newton (Inercia)', 'Ley de Gravitación Universal', 'Principio de Pascal'], correct: 0, isBool: false },
        { text: `¿Qué tipo de energía posee un cuerpo en virtud de su movimiento y velocidad?`, opts: ['Energía cinética', 'Energía potencial gravitatoria', 'Energía química latente', 'Energía estática'], correct: 0, isBool: false },
        { text: `¿Cuál es la unidad de medida de la fuerza en el Sistema Internacional de Unidades?`, opts: ['El Newton (N)', 'El Joule (J)', 'El Watt (W)', 'El Pascal (Pa)'], correct: 0, isBool: false },
        { text: `¿Qué ley de la termodinámica establece que la energía no se crea ni se destruye, solo se transforma?`, opts: ['Primera Ley de la Termodinámica (Conservación)', 'Segunda Ley de la Termodinámica (Entropía)', 'Ley Cero', 'Tercera Ley'], correct: 0, isBool: false },
        { text: `¿La velocidad de la luz en el vacío es de aproximadamente 300.000 kilómetros por segundo?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿Un objeto en caída libre en el vacío experimenta aceleración independiente de su masa?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 6. Química / Materia / Átomos / Reacciones
    else if (/qu[ií]mica|[aá]tomo|mol[eé]cula|tabla peri[oó]dica|elemento|reacci[oó]n|enlace|compuesto/i.test(t)) {
      candidates = [
        { text: `En el estudio de ${topic}, ¿cuáles son las partículas con carga positiva ubicadas en el núcleo del átomo?`, opts: ['Los protones', 'Los electrones', 'Los neutrones', 'Los fotones'], correct: 0, isBool: false },
        { text: `¿Cuál es la fórmula química que representa la molécula del agua?`, opts: ['H2O', 'CO2', 'NaCl', 'CH4'], correct: 0, isBool: false },
        { text: `¿Cómo se llama el proceso de cambio de estado de la materia de sólido directamente a gaseoso?`, opts: ['Sublimación', 'Evaporación', 'Condensación', 'Fusión'], correct: 0, isBool: false },
        { text: `¿Qué tipo de enlace químico se produce cuando dos átomos comparten uno o más pares de electrones?`, opts: ['Enlace covalente', 'Enlace iónico', 'Enlace metálico', 'Puente de hidrógeno'], correct: 0, isBool: false },
        { text: `¿El número atómico (Z) de un elemento químico representa el número de protones en su núcleo?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿El pH 7 en una escala química se considera una solución neutra?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 7. Matemáticas / Geometría / Álgebra
    else if (/matem[aá]tic|[aá]lgebra|geometr|c[aá]lculo|ecuaci|fracci|porcentaje|teorema|tri[aá]ngulo/i.test(t)) {
      candidates = [
        { text: `Respecto a ${topic}, ¿qué teorema fundamental establece que en un triángulo rectángulo a² + b² = c²?`, opts: ['Teorema de Pitágoras', 'Teorema de Tales', 'Teorema de Euclides', 'Ley de Senos'], correct: 0, isBool: false },
        { text: `¿Cuánto es el resultado exacto de la operación aritmética: 12 + 6 × 4?`, opts: ['36', '72', '48', '24'], correct: 0, isBool: false },
        { text: `¿Cuál es el único número primo que también es un número par?`, opts: ['2', '4', '0', '1'], correct: 0, isBool: false },
        { text: `¿Cuál es el valor aproximado más utilizado de la constante matemática Pi (π)?`, opts: ['3.1416', '2.7182', '1.6180', '1.4142'], correct: 0, isBool: false },
        { text: `¿La suma de los tres ángulos internos de cualquier triángulo plano siempre es igual a 180 grados?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿El número cero (0) se clasifica formalmente como un número natural positivo?`, opts: ['Falso', 'Verdadero'], correct: 0, isBool: true }
      ];
    }
    // 8. Geografía / Países / Continentes / Relieve
    else if (/geograf|capital|pa[ií]s|continente|r[ií]o|monta|oc[eé]ano|cordillera|desierto|clima/i.test(t)) {
      candidates = [
        { text: `En relación con ${topic}, ¿cuál es el río más largo y caudaloso del mundo?`, opts: ['Río Amazonas', 'Río Nilo', 'Río Yangtsé', 'Río Misisipi'], correct: 0, isBool: false },
        { text: `¿Cuál es el océano de mayor extensión superficial en el planeta Tierra?`, opts: ['Océano Pacífico', 'Océano Atlántico', 'Océano Índico', 'Océano Ártico'], correct: 0, isBool: false },
        { text: `¿En qué continente se ubica el pico más alto del planeta, el Monte Everest?`, opts: ['Asia', 'Europa', 'América', 'África'], correct: 0, isBool: false },
        { text: `¿Cuál es la cordillera montañosa continua más larga del mundo, situada en América del Sur?`, opts: ['La Cordillera de los Andes', 'El Himalaya', 'Los Alpes', 'Las Montañas Rocosas'], correct: 0, isBool: false },
        { text: `¿El Desierto del Sahara es el desierto cálido más grande del mundo?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿La línea del Ecuador divide geográficamente a la Tierra en hemisferio Norte y hemisferio Sur?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 9. Historia de Colombia
    else if (/colombia|independencia|boyac|bogot|bol[ií]var|santander|nari[nñ]o|policarpa/i.test(t)) {
      candidates = [
        { text: `En el marco de ${topic}, ¿en qué fecha memorable se firmó el Acta de Independencia de Colombia?`, opts: ['20 de julio de 1810', '7 de agosto de 1819', '11 de noviembre de 1811', '12 de octubre de 1492'], correct: 0, isBool: false },
        { text: `¿Qué batalla selló de manera decisiva la independencia de la Nueva Granada el 7 de agosto de 1819?`, opts: ['La Batalla de Boyacá', 'La Batalla del Pantano de Vargas', 'La Batalla de Carabobo', 'La Batalla de Pichincha'], correct: 0, isBool: false },
        { text: `¿Quién es recordado con el título histórico de "El Libertador" de varias naciones sudamericanas?`, opts: ['Simón Bolívar', 'Francisco de Paula Santander', 'Antonio Nariño', 'Camilo Torres'], correct: 0, isBool: false },
        { text: `¿Quién tradujo del francés y difundió de forma clandestina los Derechos del Hombre y del Ciudadano en Colombia?`, opts: ['Antonio Nariño', 'Policarpa Salavarrieta', 'José Celestino Mutis', 'Francisco José de Caldas'], correct: 0, isBool: false },
        { text: `¿Policarpa Salavarrieta colaboró activamente con el ejército patriota como espía durante la Reconquista española?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿La Gran Colombia creada tras el Congreso de Angostura unía territorialmente a Colombia, Venezuela, Ecuador y Panamá?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 10. Historia Universal / Civilizaciones / Guerras
    else if (/historia|guerra|\broma\b|romano|egipto|grecia|revoluci|imperio|edad media|renacimiento/i.test(t)) {
      candidates = [
        { text: `En el contexto de ${topic}, ¿en qué año dio inicio la Primera Guerra Mundial?`, opts: ['1914', '1918', '1939', '1945'], correct: 0, isBool: false },
        { text: `¿Qué célebre líder militar romano cruzó el río Rubicón y fue proclamado dictador vitalicio?`, opts: ['Julio César', 'César Augusto', 'Nerón', 'Marco Aurelio'], correct: 0, isBool: false },
        { text: `¿Qué acontecimiento simbólico marcó el inicio de la Revolución Francesa en 1789?`, opts: ['La Toma de la Bastilla', 'La coronación de Napoleón', 'La Batalla de Waterloo', 'La Declaración de Filadelfia'], correct: 0, isBool: false },
        { text: `¿En qué año se produjo la caída del Muro de Berlín, símbolo del fin de la Guerra Fría?`, opts: ['1989', '1991', '1985', '1975'], correct: 0, isBool: false },
        { text: `¿La civilización egipcia antigua floreció a lo largo de las fértiles riberas del río Nilo?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true },
        { text: `¿El Renacimiento europeo se caracterizó por un resurgimiento del humanismo y de la cultura clásica greco-romana?`, opts: ['Verdadero', 'Falso'], correct: 0, isBool: true }
      ];
    }
    // 11. Música / Instrumentos Musicales / Piano / Cuerdas / Solfeo
    else if (/piano|m[uú]sica|instrument|guitarra|viol[ií]n|bater[ií]a|canto|solfeo|melod[ií]a|acorde|compositor|orquesta|sonata|partitura|trompeta|flauta/i.test(t)) {
      if (/piano/i.test(t)) {
        candidates = [
          {
            text: `Hacia el año 1700 en Florencia (Italia), el maestro luthier Bartolomeo Cristofori trabajaba bajo el mecenazgo de los Médici buscando un instrumento con dinámica sonora variable. ¿Cuál fue la innovación mecánica revolucionaria que dio origen al 'pianoforte' distinguiéndolo del clavecín de su época?`,
            opts: [
              `Un mecanismo de macillos articulados que golpean las cuerdas y escapan de inmediato, permitiendo modular el volumen según la fuerza de la pulsación`,
              `La incorporación de plectros de pluma de cuervo que pellizcan cuerdas dobles afinadas por quintas`,
              `Un sistema de fuelles accionados por pedales que impulsan aire continuo hacia tubos de resonancia`,
              `El uso de cuerdas de tripa entorchada frotadas por una rueda giratoria bañada en resina`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `A lo largo de los siglos XIX y XX, el piano expandió progresivamente su tesitura para satisfacer las exigencias técnicas de virtuosos como Liszt, Chopin y Brahms. ¿Cómo está conformado con exactitud el teclado canónico de un piano acústico moderno de concierto?`,
            opts: [
              `88 teclas en total, divididas en 52 teclas blancas (notas naturales) y 36 teclas negras (alteraciones cromáticas), abarcando más de 7 octavas (de La0 a Do8)`,
              `76 teclas en total: 46 blancas y 30 negras organizadas en temperamento mesotónico sin sostenidos`,
              `96 teclas distribuidas en dos pisos manuales independientes similares a la consola de un órgano`,
              `64 teclas afinadas exclusivamente en intervalos de cuarta justa bajo el sistema pitagórico puro`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En la década de 1820, la evolución técnica del piano introdujo una pieza monumental de ingeniería para soportar las más de 18 a 20 toneladas de tensión combinada ejercidas por las cuerdas de acero afinadas. ¿Qué elemento estructural hizo posible esta resistencia?`,
            opts: [
              `El marco o arpa de hierro fundido (placa de hierro colado integral de una sola pieza)`,
              `Un sistema de vigas transversales de titanio y amortiguadores neumáticos de presión`,
              `Un doble mástil de roble macizo reforzado con contrapesos de plomo exterior`,
              `Un bastidor de bronce forjado atornillado directamente a los cimientos del escenario`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `El virtuoso y compositor Anton Rubinstein afirmó célebremente que 'el pedal es el alma misma del piano'. ¿Qué efecto acústico y mecánico produce el pedal de resonancia (pedal derecho o sustain) al ser pisado por el intérprete?`,
            opts: [
              `Eleva simultáneamente todos los apagadores de fieltro, permitiendo que las notas tocadas y las cuerdas adyacentes vibren libremente por simpatía acústica`,
              `Desplaza el teclado hacia la izquierda para que los macillos percutan una sola cuerda por unísono`,
              `Intercala una franja de fieltro grueso entre los macillos y las cuerdas para apagar el brillo tímbrico`,
              `Modifica la afinación global elevándola un semitono mediante un rotor central de clavijas`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En 1818, Ludwig van Beethoven recibió un piano de seis octavas del fabricante inglés Thomas Broadwood y compuso su monumental Sonata op. 106 'Hammerklavier'. ¿Qué hito histórico y personal marcó la composición de esta cumbre pianística?`,
            opts: [
              `Beethoven padecía ya de sordera casi total y compuso la colosal obra guiado por su genial oído interno y apoyando varas de madera en el instrumento para sentir las vibraciones`,
              `Fue la primera composición para piano grabada en un cilindro fonográfico en presencia del autor`,
              `Fue un encargo militar confidencial de Napoleón Bonaparte antes de la batalla de Waterloo`,
              `La sonata fue concebida para ser tocada por cuatro pianistas sincronizados en dos pianos de cola enfrentados`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En la luthería de pianos de concierto de alta gama (Steinway & Sons, Bösendorfer, Yamaha), la elección del material para la tabla armónica es determinante. ¿Qué madera es considerada insustituible por su ligereza y velocidad de transmisión del sonido?`,
            opts: [
              `Abeto o pícea alpina (Sitka o europea), de vetas rectas, estrechas y curada durante años`,
              `Ébano negro macizo seleccionado por su altísima densidad y peso específico`,
              `Madera de balsa prensada con resinas epoxi y filamentos de fibra de carbono`,
              `Roble centenario lacado con barnices minerales impermeables`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En un piano de cola de concierto, ¿cómo opera mecánicamente el pedal izquierdo (denominado históricamente 'una corda' o pedal celeste) para alterar el timbre sonoro?`,
            opts: [
              `Desplaza lateralmente todo el bloque de teclas y macillos, haciendo que estos percutan menos cuerdas por nota y con una sección de fieltro más blanda`,
              `Baja una lámina de tela acolchada entre los macillos y las cuerdas para silenciar los armónicos agudos`,
              `Acorta la longitud física de vibración de las cuerdas mediante un puente auxiliar móvil`,
              `Desactiva la tracción mecánica de las cuerdas del registro grave para resaltar la melodía`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En la notación clásica para piano, el discurso musical se plasma habitualmente en un 'gran pentagrama' acoplado por una llave. ¿Cuál es la disposición de claves tradicional para las manos del intérprete?`,
            opts: [
              `Pentagrama superior en Clave de Sol (típicamente mano derecha, registro medio y agudo) y pentagrama inferior en Clave de Fa en cuarta línea (típicamente mano izquierda, registro grave)`,
              `Ambos pentagramas en Clave de Do en tercera línea para unificar la lectura sin líneas adicionales`,
              `Pentagrama superior en Clave de Fa para la línea melódica y pentagrama inferior en Clave de Sol para el acompañamiento`,
              `Un único pentagrama extendido de diez líneas paralelas sin separación de registros`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Es históricamente cierto que en muchos fortepianos y clavecines de los siglos XVII y XVIII el color de las teclas solía estar invertido respecto a la actualidad (las notas naturales eran negras de ébano y las alteraciones eran blancas de marfil o hueso)?`,
            opts: ['Verdadero', 'Falso'],
            correct: 0,
            isBool: true
          },
          {
            text: `¿En el sistema taxonómico organológico de Hornbostel-Sachs, el piano se clasifica científicamente como un cordófono de cuerda percutida mediante mecanismo de teclado?`,
            opts: ['Verdadero', 'Falso'],
            correct: 0,
            isBool: true
          }
        ];
      } else if (/guitarra/i.test(t)) {
        candidates = [
          {
            text: `A mediados del siglo XIX en Sevilla, el luthier español Antonio de Torres revolucionó para siempre la construcción de la guitarra. ¿Qué trascendental aporte de diseño consolidó Torres fijando la guitarra clásica moderna?`,
            opts: [
              `Aumentó las dimensiones de la caja de resonancia y perfeccionó el sistema de varetaje armónico en abanico debajo de la tapa`,
              `Introdujo la séptima cuerda de acero y un mástil curvo de palisandro`,
              `Sustituyó los trastes de madera por barras continuas de grafito sintético`,
              `Diseñó el primer puente flotante accionado por palanca de vibrato metálica`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `En una guitarra clásica o española afinada en el estándar de concierto internacional, ¿cuál es la afinación exacta de sus 6 cuerdas al aire de la más grave (6ª) a la más aguda (1ª)?`,
            opts: [
              `Mi2 - La2 - Re3 - Sol3 - Si3 - Mi4 (E - A - D - G - B - E)`,
              `Do2 - Sol2 - Re3 - La3 - Mi4 - Si4 (C - G - D - A - E - B)`,
              `Re2 - La2 - Re3 - Sol3 - La3 - Re4 (afinación abierta en DADGAD)`,
              `Sol2 - Si2 - Re3 - Sol3 - Si3 - Re4 (afinación en Sol abierto de blues)`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Qué virtuoso concertista español del siglo XX es unánimemente reconocido por haber elevado la guitarra clásica de instrumento folclórico a instrumento solista en las más prestigiosas salas de concierto del mundo?`,
            opts: ['Andrés Segovia', 'Paco de Lucía', 'Narciso Yepes', 'Francisco Tárrega'],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Cómo se denominan las divisiones metálicas incrustadas a lo largo del diapasón de la guitarra que marcan exactamente los semitonos de la escala temperada?`,
            opts: ['Los trastes', 'Las cejuelas', 'Las clavijas', 'Los varetajes'],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Históricamente, antes de la invención del nylon por DuPont en la década de 1940, las cuerdas agudas de la guitarra clásica se fabricaban artesanalmente con tripa animal (generalmente de cordero)?`,
            opts: ['Verdadero', 'Falso'],
            correct: 0,
            isBool: true
          }
        ];
      } else {
        candidates = [
          {
            text: `En la Grecia clásica del siglo VI a.C., ¿qué célebre filósofo y matemático experimentó con el monocordio descubriendo que los intervalos musicales consonantes corresponden a proporciones numéricas exactas (como 2:1 para la octava y 3:2 para la quinta)?`,
            opts: ['Pitágoras de Samos', 'Aristóteles de Estagira', 'Arquímedes de Siracusa', 'Euclides de Alejandría'],
            correct: 0,
            isBool: false
          },
          {
            text: `En el siglo XI, el monje benedictino Guido de Arezzo transformó la historia de la notación musical universal. ¿Qué trascendental sistema pedagógico y gráfico ideó?`,
            opts: [
              `El tetragrama (pauta de 4 líneas) y los nombres de las notas musicales a partir del himno 'Ut queant laxis' (Ut/Do, Re, Mi, Fa, Sol, La)`,
              `La notación mensural moderna con figuras de redonda, blanca y negra`,
              `El cifrado armónico americano con letras de la A a la G`,
              `El sistema atonal dodecafónico basado en series numéricas`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Qué cualidad física del sonido permite al oído humano diferenciar dos instrumentos distintos (por ejemplo, una flauta y un violín) cuando ambos interpretan la misma nota exacta con idéntica intensidad y duración?`,
            opts: [
              `El timbre (determinado por el espectro de armónicos característico de cada instrumento)`,
              `La frecuencia fundamental de oscilación en hercios (Hz)`,
              `La amplitud de onda medida en decibelios (dB)`,
              `La velocidad de propagación acústica en el aire a temperatura ambiente`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `Durante el periodo Clásico (segunda mitad del siglo XVIII), compositores como Haydn y Mozart estandarizaron una de las formas orquestales instrumentales más monumentales. ¿Cuál es esta estructura en cuatro movimientos?`,
            opts: ['La Sinfonía clásica', 'El Poema Sinfónico romántico', 'El Madrigal a cinco voces', 'La Misa de Réquiem gregoriana'],
            correct: 0,
            isBool: false
          },
          {
            text: `¿El silencio en la partitura musical posee una duración rítmica rigurosamente definida que equivale en tiempo a su correspondiente figura de nota sonora?`,
            opts: ['Verdadero', 'Falso'],
            correct: 0,
            isBool: true
          }
        ];
      }
    }
    // 12. Tecnología / Programación / Informática / IA
    else if (/program|c[oó]digo|javascript|python|web|software|computa|html|css|base de datos|algoritmo|\bia\b|inteligencia artificial|ciberseguridad|tecnolog/i.test(t)) {
      candidates = [
        {
          text: `En 1843, la matemática británica Ada Lovelace tradujo y anotó las memorias sobre la 'Máquina Analítica' de Charles Babbage. ¿Por qué es históricamente celebrada Ada Lovelace en el mundo de la computación?`,
          opts: [
            `Escribió el primer algoritmo destinado a ser procesado por una máquina (el cálculo de números de Bernoulli), siendo la primera programadora de la historia`,
            `Inventó el primer transistor de silicio comercial para memorias electrónicas`,
            `Diseñó el primer compilador de código de alto nivel en lenguaje binario`,
            `Fundó el primer laboratorio de telecomunicaciones inalámbricas de Europa`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `Durante la Segunda Guerra Mundial en Bletchley Park, el matemático Alan Turing lideró el desarrollo de la máquina electromecánica 'Bombe'. ¿Qué objetivo decisivo para el curso de la historia cumplía esta máquina?`,
          opts: [
            `Descifrar los mensajes militares encriptados por la máquina alemana Enigma`,
            `Calcular las trayectorias balísticas de cohetes intercontinentales en tiempo real`,
            `Transmitir ondas de radar submarinas por primera vez en el Atlántico`,
            `Simular redes neuronales artificiales para la predicción meteorológica`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el ámbito de las estructuras de datos y la algoritmia clásica, ¿qué estructura opera bajo el estricto principio LIFO (Last In, First Out), donde el último elemento insertado es el primero en ser extraído?`,
          opts: [
            `Pila (Stack), empleada en el historial de navegación y la pila de llamadas de funciones (Call Stack)`,
            `Cola (Queue), utilizada para planificadores de impresión y buffers de mensajes`,
            `Árbol binario de búsqueda equilibrado (AVL)`,
            `Tabla hash con resolución de colisiones por encadenamiento abierto`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En 1969, la agencia DARPA del Departamento de Defensa de EE. UU. conectó por primera vez cuatro nodos universitarios en una red experimental descentralizada. ¿Cómo se denominó este hito precursor de la actual Internet?`,
          opts: ['ARPANET', 'Ethernet', 'World Wide Web (WWW)', 'Usenet'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Un algoritmo informático se define formalmente como un conjunto finito, ordenado y no ambiguo de instrucciones lógicas para resolver un problema o cómputo determinado?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿La memoria de acceso aleatorio (RAM) es un tipo de almacenamiento permanente y no volátil que conserva sus datos al desconectar la fuente de energía eléctrica?`,
          opts: ['Falso', 'Verdadero'],
          correct: 0,
          isBool: true
        }
      ];
    }
    // 13. Literatura / Español / Ortografía / Lenguaje
    else if (/literatura|espa[nñ]ol|lengua|gram[aá]tica|oraci|poes[ií]a|novela|figura ret[oó]rica|cuento|ortograf/i.test(t)) {
      candidates = [
        {
          text: `Publicada en dos partes en 1605 y 1615 por Miguel de Cervantes Saavedra, 'El ingenioso hidalgo Don Quijote de la Mancha' marcó un antes y un después en las letras universales. ¿Por qué es considerada por la crítica la primera novela moderna?`,
          opts: [
            `Desmitifica los libros de caballerías mediante la polifonía de voces, la evolución psicológica de sus personajes y la metaficción narrativa`,
            `Fue la primera obra literaria escrita íntegramente en verso alejandrino rimado`,
            `Constituyó el primer manifiesto político contra la monarquía absoluta de los Austrias`,
            `Fue el primer manuscrito impreso en papel de lino sin intervención de copistas monásticos`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En 1967, la publicación en Buenos Aires de la novela 'Cien años de soledad' del colombiano Gabriel García Márquez consagró internacionalmente una corriente estética singular. ¿Cómo se denomina este movimiento?`,
          opts: [
            `El Realismo Mágico (integración natural y cotidiana de elementos míticos y fantásticos en la realidad)`,
            `El Modernismo estético hispanoamericano fundado por Rubén Darío`,
            `El Costumbrismo decimonónico del Altiplano Cundiboyacense`,
            `El Existencialismo filosófico de posguerra`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En la retórica literaria clásica, ¿qué figura de pensamiento consiste en alterar el orden sintáctico habitual y lógico de las palabras en una frase para generar énfasis o musicalidad (ej. 'Volverán las oscuras golondrinas de tu balcón sus nidos a colgar')?`,
          opts: ['El hipérbaton', 'La sinestesia', 'La personificación o prosopopeya', 'La antítesis'],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Las palabras esdrújulas son aquellas cuya mayor fuerza de voz o acento prosódico recae en la antepenúltima sílaba y, según la regla ortográfica de la RAE, siempre llevan tilde gráfica?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        }
      ];
    }
    // 14. GENERADOR DINÁMICO TÓPICO-ESPECÍFICO HISTÓRICO Y MULTIFACÉTICO (Para cualquier tema personalizado)
    // Garantiza que cada pregunta sea rica, completa, histórica y aborde un ángulo diferente del mismo tema
    else {
      candidates = [
        {
          text: `A lo largo del desarrollo histórico y disciplinar de "${topic}", ¿cuál de los siguientes hitos o premisas fundamentales definió su origen y consolidación?`,
          opts: [
            `El establecimiento de principios conceptuales rigurosos y metodologías empíricas que delimitaron su campo de estudio`,
            `Una mera coincidencia accidental sin ningún tipo de fundamentación previa ni continuidad`,
            `La subordinación pasiva a doctrinas arcaicas que prohibían la experimentación o el análisis crítico`,
            `Un proceso exclusivo de divulgación popular carente de bases teóricas estructuradas`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el análisis estructural y anatómico de "${topic}", ¿qué elemento o mecanismo interno resulta indispensable para su correcto funcionamiento y manifestación?`,
          opts: [
            `La articulación sinérgica de sus componentes esenciales conforme a las leyes y estándares reconocidos en su ámbito`,
            `La eliminación arbitraria de variables de control para evitar contradicciones`,
            `La dependencia exclusiva de factores externos impredecibles sin conexión causal`,
            `El aislamiento absoluto de cualquier interacción con su entorno de aplicación`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `Desde una perspectiva de impacto sociocultural y avance del conocimiento, ¿qué transformación histórica clave propició la evolución de "${topic}"?`,
          opts: [
            `Permitió resolver problemas complejos de su disciplina, abriendo nuevos paradigmas teóricos y aplicaciones prácticas`,
            `Provocó el estancamiento permanente de su área de conocimiento al rechazar toda innovación`,
            `Se limitó a una formulación puramente nominal sin ninguna repercusión tangible en la realidad`,
            `Obligó a descartar por completo todos los conocimientos científicos previos a su aparición`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `Al examinar las figuras, escuelas o movimientos pioneros vinculados a "${topic}", ¿cuál de los siguientes enfoques metodológicos ha caracterizado su práctica más rigurosa?`,
          opts: [
            `La contrastación sistemática de hipótesis respaldada por evidencia verificable y pensamiento crítico`,
            `La adopción incondicional de conjeturas subjetivas sin comprobación documental ni empírica`,
            `La extrapolación forzada de conceptos incompatibles tomados de áreas inconexas`,
            `La renuncia explícita a cualquier estándar de calidad, medición o reproducibilidad`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `En el contexto contemporáneo, ¿cuál representa uno de los debates o campos de desarrollo más activos y avanzados respecto a "${topic}"?`,
          opts: [
            `La optimización de sus procesos y la integración con nuevas tecnologías para responder a los desafíos globales actuales`,
            `El abandono total de su estudio debido a la falta de aplicaciones prácticas en la sociedad moderna`,
            `La reducción simplista de sus postulados a fórmulas mecánicas carentes de contexto`,
            `La imposibilidad absoluta de medir o evaluar su efectividad en entornos reales`
          ],
          correct: 0,
          isBool: false
        },
        {
          text: `¿Es históricamente verídico que la comprensión y aplicación de "${topic}" ha evolucionado mediante sucesivas revisiones de paradigmas superando concepciones iniciales limitadas?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿El estudio riguroso de "${topic}" carece de normas, principios lógicos o criterios de validez reconocidos por su comunidad de especialistas?`,
          opts: ['Falso', 'Verdadero'],
          correct: 0,
          isBool: true
        },
        {
          text: `¿La adecuada contextualización histórica y teórica de "${topic}" es esencial para interpretar correctamente su relevancia y proyecciones futuras?`,
          opts: ['Verdadero', 'Falso'],
          correct: 0,
          isBool: true
        }
      ];
    }

    // Filtrar candidatos según el tipo solicitado
    let filtered = candidates;
    if (type === 'boolean') {
      filtered = candidates.filter(c => c.isBool);
      if (filtered.length < count) {
        candidates.forEach(c => {
          if (!c.isBool && filtered.length < count) {
            filtered.push({
              text: `Respecto a "${topic}", ¿es correcto afirmar que: ${c.text.replace(/^[¿\s]+|[?\s]+$/g, '')} corresponde a: "${c.opts[c.correct]}"?`,
              opts: ['Verdadero', 'Falso'],
              correct: 0,
              isBool: true
            });
          }
        });
      }
    } else if (type === 'single') {
      filtered = candidates.filter(c => !c.isBool);
      if (filtered.length < count) {
        const extraQuestions = [
          {
            text: `En relación con "${topic}", ¿cuál de las siguientes opciones describe un elemento o manifestación clave?`,
            opts: [
              `Las propiedades funcionales y estructurales que definen a ${topic}`,
              `Un factor secundario sin influencia en los resultados`,
              `Un mecanismo opuesto que anula sus efectos`,
              `Una variable irrelevante para su disciplina`
            ],
            correct: 0,
            isBool: false
          },
          {
            text: `¿Cuál de los siguientes criterios es fundamental al evaluar la efectividad o desarrollo de "${topic}"?`,
            opts: [
              `La coherencia de sus resultados con los objetivos y fundamentos establecidos`,
              `La ausencia total de métricas o comprobaciones`,
              `La dependencia de factores puramente fortuitos`,
              `El aislamiento frente a estándares de calidad`
            ],
            correct: 0,
            isBool: false
          }
        ];
        filtered.push(...extraQuestions);
      }
    }

    // Deduplicación inicial estricta del banco base
    const seenTexts = new Set();
    const normKey = str => (str || '').trim().toLowerCase().replace(/\s+/g, ' ');
    const uniqueCandidates = [];
    for (const item of filtered) {
      const key = normKey(item.text);
      if (!seenTexts.has(key)) {
        seenTexts.add(key);
        uniqueCandidates.push(item);
      }
    }

    const pool = [...uniqueCandidates].sort(() => Math.random() - 0.5);

    // Detectar dominios temáticos especializados de todas las carreras y campos de estudio
    const isDama = /dama|dmbok|dama-dmbok|cdmp|gobierno de datos|data governance|gesti[oó]n de datos|data management|datos maestros|mdm|calidad de datos|data quality|arquitectura de datos|data steward/i.test(t);
    const isCandy = !isDama && /gomita|gomitas|dulce|dulces|golosina|golosinas|caramelo|caramelos|confiter|malvavisco|marshmallow|paleta|chupet/i.test(t);
    const isFood = !isDama && !isCandy && /comida|comidas|gastronom|cocina|alimento|alimentos|receta|recetas|culinari|chef|plato|platos|ingrediente|postre|reposter|panader/i.test(t);
    const isHealth = !isDama && !isCandy && !isFood && /medicina|médic|anatomía|fisiología|patología|farmacología|farmacia|enfermería|salud|quirúrgic|cirugía|cardio|pediatría|odontolog|diente|veterinari|zootecn|nutrición|fisioterapia|clínic|hospital|biomédic/i.test(t);
    const isEngineering = !isDama && !isCandy && !isFood && !isHealth && /ingeniería|termodinámica|mecánica|fluidos|resistencia de materiales|civil|estructuras|suelos|topografía|eléctric|electrónic|circuito|kirchhoff|ohm|industrial|six sigma|lean|química industrial|ambiental|mecatrónica|robótica|termodinamic/i.test(t);
    const isLaw = !isDama && !isCandy && !isFood && !isHealth && !isEngineering && /derecho|ley|leyes|penal|civil|constitucional|laboral|jurídic|norma|código|delito|tutela|tribunal|juez|abogad|política|ciencia política|democracia|legislaci|jurisprudencia/i.test(t);
    const isBusiness = !isDama && !isCandy && !isFood && !isHealth && !isEngineering && !isLaw && /economía|microeconomía|macroeconomía|pib|inflación|contabilidad|contaduría|financier|finanzas|balance general|niif|ifrs|administración|empresa|marketing|mercadeo|publicidad|branding|negocios|tributar/i.test(t);
    const isSocial = !isDama && !isCandy && !isFood && !isHealth && !isEngineering && !isLaw && !isBusiness && /psicología|mente|conducta|freud|conductismo|cognitiv|filosofía|ética|epistemología|sócrates|platón|aristóteles|kant|sociología|sociedad|marx|weber|durkheim|pedagogía|educación|didáctica|piaget|vygotsky/i.test(t);
    const isDesign = !isDama && !isCandy && !isFood && !isHealth && !isEngineering && !isLaw && !isBusiness && !isSocial && /arquitectura|urbanismo|edificio|diseño|gráfico|tipografía|comunicación|periodismo|noticia|prensa/i.test(t);

    // Si la cantidad solicitada supera el banco base, sintetizar preguntas 100% enfocadas en el tema y SIN repetirse
    if (pool.length < count) {
      let qNum = pool.length + 1;
      let loopCount = 0;
      const maxLoops = count * 6;

      if (isDama) {
        // Banco temático de alta fidelidad para DAMA-DMBOK y GOBIERNO DE DATOS
        const damaTemplates = [
          {
            q: (t, n) => `En el marco DAMA-DMBOK (#${n}), ¿cuál es la razón primordial por la que el Gobierno de Datos (Data Governance) se sitúa en el centro de la Rueda de DAMA?`,
            c: (t) => `Porque actúa como el núcleo de autoridad, supervisión y políticas que articula a las demás 10 áreas de conocimiento de la gestión de datos`,
            d: ['Porque es la única área que requiere escribir código SQL', 'Porque sustituye completamente la función de los servidores de bases de datos', 'Porque solo interviene en auditorías fiscales externas']
          },
          {
            q: (t, n) => `Al implementar un programa de Calidad de Datos según DAMA-DMBOK (#${n}), ¿qué dimensión evalúa si los datos representan la realidad sin distorsión?`,
            c: (t) => `La dimensión de Exactitud (Accuracy)`,
            d: ['La compresión gzip del fichero', 'La tasa de baudios de transmisión', 'El tamaño en gigabytes de la tabla']
          },
          {
            q: (t, n) => `En la Gestión de Datos Maestros (MDM) de DAMA-DMBOK (#${n}), ¿qué beneficio estratégico genera la consolidación del 'Golden Record'?`,
            c: (t) => `Garantizar una vista única y confiable de entidades críticas de negocio entre todos los sistemas transaccionales y analíticos`,
            d: ['Eliminar todos los respaldos de seguridad antiguos', 'Obligar a usar únicamente bases de datos documentales NoSQL', 'Impedir el acceso de los analistas de negocio']
          },
          {
            q: (t, n) => `En el modelado conceptual de datos según DAMA (#${n}), ¿cuál es el enfoque principal de los diagramas y artefactos generados?`,
            c: (t) => `Comunicar el vocabulario, las entidades clave y las reglas de negocio entre líderes empresariales y arquitectos de datos`,
            d: ['Configurar los parámetros de memoria caché de PostgreSQL u Oracle', 'Compilar el código fuente binario del driver JDBC', 'Diseñar la topología de cableado estructurado']
          },
          {
            q: (t, n) => `En la Gestión de Metadatos de DAMA-DMBOK (#${n}), ¿qué función cumple el Catálogo de Datos (Data Catalog)?`,
            c: (t) => `Permitir la búsqueda, comprensión, linaje y descubrimiento democrático de los activos de datos por parte de los usuarios autorizados`,
            d: ['Bloquear cualquier consulta interactiva de datos', 'Registrar los números de serie de los procesadores físicos', 'Reemplazar el motor transaccional del ERP']
          },
          {
            q: (t, n) => `En la Seguridad de Datos según DAMA-DMBOK (#${n}), ¿qué técnica altera datos sensibles sustituyéndolos por valores ficticios que conservan el formato pero no la identidad real?`,
            c: (t) => `El enmascaramiento de datos (Data Masking) y la tokenización`,
            d: ['El formateo físico de bajo nivel', 'La partición RAID 0 de discos', 'La fragmentación de paquetes IP']
          },
          {
            q: (t, n) => `En la Integración de Datos (DAMA-DMBOK) (#${n}), ¿qué técnica permite consultar datos en tiempo real de múltiples fuentes heterogéneas sin necesidad de replicarlos físicamente?`,
            c: (t) => `La Virtualización de Datos (Data Virtualization) o federación`,
            d: ['El volcado en frío a cinta magnética', 'La compresión offline zip', 'La migración nocturna por lotes']
          },
          {
            q: (t, n) => `En los principios éticos de DAMA-DMBOK (#${n}), ¿qué compromiso adquiere la organización con respecto a los datos personales recolectados?`,
            c: (t) => `Tratarlos con transparencia, respeto a la privacidad, consentimiento informado y uso ético no discriminatorio`,
            d: ['Comercializarlos a terceros sin autorización previa', 'Ocultar las brechas de ciberseguridad a los usuarios', 'Ignorar las regulaciones como el RGPD o leyes de protección de datos']
          }
        ];

        let dIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = damaTemplates[dIdx % damaTemplates.length];
          const round = Math.floor(dIdx / damaTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Área de DAMA-DMBOK: ' : round === 2 ? 'Criterio CDMP: ' : round === 3 ? 'Mejor práctica de datos: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          dIdx++;
        }
      } else if (isCandy) {
        // Banco temático de alta fidelidad para GOMITAS, DULCES Y CONFITERÍA
        const candyTemplates = [
          {
            q: (n) => `En la formulación de gomitas (#${n}), ¿qué propiedad del gel de gelatina permite que se funda suavemente a la temperatura bucal (35 °C - 37 °C)?`,
            c: 'La termorreversibilidad del gel coloidal de colágeno',
            d: ['La degradación ácida instantánea', 'La evaporación de azúcares al masticar', 'La combustión química por contacto con saliva']
          },
          {
            q: (n) => `Al fabricar gomitas ácidas o 'sour' (#${n}), ¿qué combinación de ácidos orgánicos cristalizados se espolvorea sobre la superficie?`,
            c: 'Ácido cítrico y ácido málico mezclados con azúcar',
            d: ['Ácido sulfúrico diluido con salmuera', 'Ácido acético concentrado con bicarbonato', 'Ácido láctico puro sin diluir']
          },
          {
            q: (n) => `En el proceso Mogul de manufactura de gomitas (#${n}), ¿cuál es la función de las camas de almidón de maíz en las bandejas?`,
            c: 'Crear cavidades con la forma deseada y absorber la humedad residual durante el secado',
            d: ['Impedir que las gomitas se enfríen durante el día', 'Aportar el 90% del sabor dulce de la golosina', 'Funcionar como conservante antibiótico']
          },
          {
            q: (n) => `Para lograr un acabado brillante y evitar adherencias en las gomitas empacadas (#${n}), ¿qué agente de glaseado vegetal es el estándar de la industria?`,
            c: 'Cera de carnauba refinada con aceite vegetal',
            d: ['Aceite mineral automotriz', 'Barniz sintético de poliuretano', 'Clara de huevo pasteurizada cruda']
          },
          {
            q: (n) => `En confitería moderna (#${n}), ¿qué gelificante de origen vegetal se utiliza para fabricar gomitas 100% aptas para vegetarianos y veganos?`,
            c: 'Pectina cítrica de frutas o agar-agar de algas',
            d: ['Gluten deshidratado de trigo', 'Proteína aislada de suero lácteo', 'Colágeno bovino hidrolizado']
          },
          {
            q: (n) => `Históricamente, ¿quién inventó los primeros ositos de goma ('Tanzbären') en 1922 en la ciudad alemana de Bonn (#${n})?`,
            c: 'Hans Riegel (fundador de Haribo)',
            d: ['Milton Hershey', 'Willy Wonka', 'Henri Nestlé']
          },
          {
            q: (n) => `Respecto a los sabores en gomitas (#${n}), ¿cuál de los siguientes es uno de los perfiles frutales clásicos y más populares a nivel mundial?`,
            c: 'Fresa silvestre, manzana verde y mora azul',
            d: ['Aceituna amarga y cebolla morada', 'Ajo tostado con pimienta', 'Apio fermentado al vapor']
          },
          {
            q: (n) => `En el control de calidad de gomitas (#${n}), ¿qué parámetro mide la fuerza o firmeza elástica del gel de gelatina?`,
            c: 'Los grados Bloom (típicamente entre 150 y 250 Bloom)',
            d: ['La escala de dureza de Mohs', 'El índice de octanaje térmico', 'Los grados Kelvin de viscosidad']
          },
          {
            q: (n) => `¿Qué función crucial desempeña el jarabe de glucosa al integrarse con la sacarosa en las gomitas (#${n})?`,
            c: 'Evitar la recristalización del azúcar y mantener la transparencia y textura gomosa',
            d: ['Hacer que la gomita flote en líquidos', 'Acelerar la fermentación alcohólica', 'Volver la mezcla opaca y quebradiza']
          },
          {
            q: (n) => `¿Qué empresa de golosinas introdujo en 1981 la emblemática forma de 'gusanos de goma' en el mercado internacional (#${n})?`,
            c: 'Trolli',
            d: ['Mars Confectionery', 'Cadbury Schweppes', 'Ferrero SpA']
          },
          {
            q: (n) => `En las gomitas nutricionales o funcionales (#${n}), ¿cuál es uno de los suplementos activos más habituales añadidos para el público infantil y adulto?`,
            c: 'Complejos vitamínicos (Vitamina C, D, Zinc y Melatonina)',
            d: ['Caldo de carne concentrado', 'Grasas trans hidrogenadas', 'Harina refinada de maíz crudo']
          },
          {
            q: (n) => `¿Por qué es fundamental que la actividad de agua (aw) de las gomitas se mantenga por debajo de 0.65 (#${n})?`,
            c: 'Para impedir la proliferación de bacterias y hongos asegurando una larga vida útil',
            d: ['Para que no se congelen en la nevera', 'Para permitir que el azúcar se disuelva en el aire', 'Para reducir el peso del empaque']
          },
          {
            q: (n) => `¿Qué colorante natural se utiliza habitualmente en gomitas para lograr atractivos tonos rojos y violetas (#${n})?`,
            c: 'Extracto de remolacha (betanina) o jugo concentrado de zanahoria morada',
            d: ['Sulfato ferroso de zinc', 'Carbón vegetal activado soluble', 'Extracto de óxido de titanio']
          },
          {
            q: (n) => `En la textura de gomitas (#${n}), ¿cómo se compara la mordida de una gomita de pectina frente a una de gelatina tradicional?`,
            c: 'La pectina ofrece una mordida más suave y limpia, mientras la gelatina es más elástica y masticable',
            d: ['La pectina es completamente dura como piedra', 'La gelatina se deshace en polvo seco', 'Ambas tienen idéntica estructura molecular']
          },
          {
            q: (n) => `¿Cuál de las siguientes condiciones ambientales es la ideal para almacenar gomitas y preservar su frescura (#${n})?`,
            c: 'Ambiente fresco y seco (entre 15 °C y 20 °C) protegido de la luz solar directa',
            d: ['Exposición directa al calor del sol', 'Ambiente con 95% de humedad relativa', 'Horno de secado constante a 50 °C']
          }
        ];

        let cIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = candyTemplates[cIdx % candyTemplates.length];
          const round = Math.floor(cIdx / candyTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Evaluación técnica: ' : round === 2 ? 'Destreza de confitería: ' : round === 3 ? 'Análisis de calidad: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c, tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          cIdx++;
        }
      } else if (isFood) {
        // Banco temático específico para COMIDAS / GASTRONOMÍA
        const foodTemplates = [
          {
            q: (n) => `En el arte culinario y la preparación de comidas (#${n}), ¿qué técnica consiste en cocinar alimentos a fuego lento en un medio graso sin dejar que tomen color dorado?`,
            c: 'El sudado o confitado a baja temperatura',
            d: ['El flameado directo con alcohol', 'El fritado profundo a alta temperatura', 'El gratinado al horno']
          },
          {
            q: (n) => `En la gastronomía latinoamericana (#${n}), ¿qué cereal milenario andino de alto valor proteico es considerado un superalimento básico en diversas comidas?`,
            c: 'La quinua (o quinoa)',
            d: ['El trigo sarraceno', 'El mijo forrajero', 'La cebada perlada']
          },
          {
            q: (n) => `Al preparar caldos, fondos y salsas en la cocina tradicional (#${n}), ¿cómo se denomina la mezcla aromática clásica de cebolla, zanahoria y apio picados?`,
            c: 'Mirepoix',
            d: ['Bouquet garni', 'Roux rubio', 'Chutney']
          },
          {
            q: (n) => `En el mundo de los postres y la repostería (#${n}), ¿qué técnica consiste en batir claras de huevo con azúcar hasta formar una espuma consistente y brillante?`,
            c: 'Elaboración de merengue (francés, suizo o italiano)',
            d: ['Caramelización en seco', 'Emulsión de ganache', 'Clarificación con gelatina']
          },
          {
            q: (n) => `Respecto a la cocción y textura de la pasta italiana en las comidas (#${n}), ¿qué significa el término 'Al dente'?`,
            c: 'Cocida en su punto óptimo, firme al morder en el centro pero sin sabor a harina cruda',
            d: ['Completamente deshecha y pasada de hervor', 'Enfriada previamente con agua corriente helada', 'Frita antes de hervir en agua']
          },
          {
            q: (n) => `En la cocina marina (#${n}), ¿cuál es el marisco o molusco cefalópodo protagonista de platos icónicos como el pulpo a la gallega?`,
            c: 'El pulpo común cocido en olla de cobre',
            d: ['La langosta de roca', 'El erizo de mar', 'El mejillón atlántico']
          },
          {
            q: (n) => `¿Qué hierba aromática fresca es indispensable en la cocina mediterránea para preparar el pesto genovés tradicional (#${n})?`,
            c: 'La albahaca fresca',
            d: ['El orégano seco', 'El eneldo silvestre', 'El romero leñoso']
          },
          {
            q: (n) => `En la ciencia de los alimentos y la nutrición (#${n}), ¿qué tipo de macronutriente es esencial para la formación de tejidos y masa muscular en el cuerpo?`,
            c: 'Las proteínas (animales o vegetales)',
            d: ['Los carbohidratos simples', 'Los azúcares añadidos', 'Los lípidos saturados']
          },
          {
            q: (n) => `¿Cuál de las siguientes comidas tradicionales mexicanas consiste en una tortilla de maíz doblada y rellena de carnes, verduras o queso (#${n})?`,
            c: 'El taco',
            d: ['La feijoada', 'El mofongo', 'El sushi roll']
          },
          {
            q: (n) => `En la cocción de carnes a la parrilla o sartén (#${n}), ¿qué reacción química entre azúcares y proteínas produce la corteza dorada y los aromas característicos?`,
            c: 'La reacción de Maillard',
            d: ['La fermentación butírica', 'La saponificación térmica', 'La oxidación enzimática']
          },
          {
            q: (n) => `¿Qué tipo de queso italiano de consistencia granulosa y maduración prolongada es el acompañamiento predilecto rallado sobre pastas (#${n})?`,
            c: 'El Parmigiano Reggiano (Parmesano)',
            d: ['El queso Ricotta fresco', 'El queso Brie francés', 'El queso Feta griego']
          },
          {
            q: (n) => `En la gastronomía tradicional colombiana (#${n}), ¿cuál de los siguientes platos típicos destaca por reunir frijoles, arroz, chicharrón, carne molida, huevo y arepa?`,
            c: 'La Bandeja Paisa',
            d: ['El Ajiaco santafereño', 'El Mote de queso', 'La Lechona tolimense']
          },
          {
            q: (n) => `Respecto a los métodos de conservación de comidas (#${n}), ¿qué técnica ancestral emplea humo y calor para deshidratar y aromatizar carnes y pescados?`,
            c: 'El ahumado',
            d: ['El escabechado en frío', 'El liofilizado industrial', 'La pasteurización UHT']
          },
          {
            q: (n) => `En la preparación de ensaladas y vinagretas (#${n}), ¿cuál es la proporción clásica recomendada de aceite y vinagre para lograr una emulsión balanceada?`,
            c: '3 partes de aceite por 1 parte de vinagre',
            d: ['1 parte de aceite por 3 partes de vinagre', 'Partes iguales de aceite y vinagre', '5 partes de vinagre por 1 de aceite']
          },
          {
            q: (n) => `¿Qué especia en polvo de color rojo vivo, obtenida al moler pimientos secos, es fundamental en el pimentón y el goulash (#${n})?`,
            c: 'El pimentón o paprika',
            d: ['La cúrcuma molida', 'El comino entero', 'El jengibre seco']
          }
        ];

        let fIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = foodTemplates[fIdx % foodTemplates.length];
          const round = Math.floor(fIdx / foodTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Enfoque gastronómico: ' : round === 2 ? 'Técnica de cocina: ' : round === 3 ? 'Cultura culinaria: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c, tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          fIdx++;
        }
      } else if (isHealth) {
        // Banco académico especializado para CIENCIAS DE LA SALUD, MEDICINA, ENFERMERÍA Y BIOMÉDICA
        const healthTemplates = [
          {
            q: (t, n) => `En el ejercicio clínico y académico de "${t}" (#${n}), ¿cuál es el objetivo fundamental de la valoración diagnóstica y la anamnesis?`,
            c: (t) => `Establecer el estado integral del paciente y fundamentar la conducta terapéutica en la mejor evidencia científica disponible`,
            d: ['Omitir los antecedentes médicos para acelerar la atención', 'Prescribir tratamientos farmacológicos sin verificar alergias', 'Realizar procedimientos invasivos de manera rutinaria']
          },
          {
            q: (t, n) => `En los principios bioéticos de "${t}" (#${n}), ¿qué postulado exige prioritariamente no infligir daño intencionado a la persona?`,
            c: (t) => `El principio de no maleficencia ('Primum non nocere')`,
            d: ['El utilitarismo selectivo', 'La autonomía condicional del profesional', 'La discrecionalidad sin consentimiento informado']
          },
          {
            q: (t, n) => `En la atención segura y protocolos de bioseguridad en "${t}" (#${n}), ¿cuál es la medida primordial para cortar la cadena de infecciones?`,
            c: (t) => `La higiene estricta de manos según los 5 momentos de la OMS y el uso correcto de barreras de protección personal`,
            d: ['La reutilización inmediata de insumos punzocortantes', 'El lavado de instrumental únicamente con agua fría', 'La desinfección semanal en áreas críticas']
          },
          {
            q: (t, n) => `Al administrar medicamentos o intervenir en "${t}" (#${n}), ¿qué regla estandarizada garantiza la seguridad del paciente?`,
            c: (t) => `La verificación de los 'correctos' (paciente, fármaco, dosis, vía, horario y registro documental)`,
            d: ['La modificación arbitraria de dosis según el tiempo disponible', 'Confiar en la memoria sin consultar la historia clínica', 'Suministrar fármacos sin verificar la identidad del paciente']
          },
          {
            q: (t, n) => `En la fisiología y homeostasis relacionada con "${t}" (#${n}), ¿qué mecanismo mantiene el equilibrio dinámico del medio interno?`,
            c: (t) => `Los circuitos de retroalimentación negativa y la regulación neuroendocrina integrada`,
            d: ['La alteración irreversible del pH plasmático', 'El colapso metabólico sostenido', 'La supresión del transporte activo celular']
          },
          {
            q: (t, n) => `Al evaluar signos de estabilidad hemodinámica en "${t}" (#${n}), ¿cuál de los siguientes conjuntos de parámetros es prioritario?`,
            c: (t) => `Los signos vitales (presión arterial, frecuencia cardíaca, frecuencia respiratoria, saturación y temperatura)`,
            d: ['El peso de la vestimenta externa', 'El color de los accesorios del usuario', 'La hora de asignación de la cita médica']
          },
          {
            q: (t, n) => `En el enfoque preventivo y de salud pública en "${t}" (#${n}), ¿qué nivel de prevención busca evitar la aparición de la enfermedad?`,
            c: (t) => `La prevención primaria (promoción de la salud, vacunación y estilos de vida saludables)`,
            d: ['La rehabilitación física terciaria', 'El tratamiento quirúrgico tardío', 'El cuidado paliativo terminal']
          },
          {
            q: (t, n) => `Al interpretar estudios paraclínicos o de laboratorio en "${t}" (#${n}), ¿qué concepto indica la probabilidad de clasificar correctamente a los individuos enfermos?`,
            c: (t) => `La sensibilidad diagnóstica de la prueba`,
            d: ['El sesgo de confirmación subjetivo', 'El valor predictivo nulo', 'La variabilidad no calibrada']
          }
        ];

        let hIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = healthTemplates[hIdx % healthTemplates.length];
          const round = Math.floor(hIdx / healthTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Enfoque clínico: ' : round === 2 ? 'Fundamento biomédico: ' : round === 3 ? 'Criterio profesional: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          hIdx++;
        }
      } else if (isEngineering) {
        // Banco académico especializado para INGENIERÍAS (Mecánica, Civil, Eléctrica, Industrial, Química, etc.)
        const engTemplates = [
          {
            q: (t, n) => `En el diseño y cálculo técnico en "${t}" (#${n}), ¿cuál es la función primordial del coeficiente o factor de seguridad?`,
            c: (t) => `Garantizar que el sistema estructural o mecánico soporte cargas superiores a las previstas ante incertidumbres reales`,
            d: ['Reducir deliberadamente la resistencia de los materiales a la mitad', 'Aumentar el costo de manufactura sin justificación técnica', 'Eliminar cualquier necesidad de mantenimiento preventivo']
          },
          {
            q: (t, n) => `Al modelar procesos energéticos en "${t}" (#${n}), ¿qué ley fundamental establece que la energía no se crea ni se destruye, solo se transforma?`,
            c: (t) => `La Primera Ley de la Termodinámica (Principio de conservación de la energía)`,
            d: ['La ley de dilatación infinita', 'El postulado de fricción nula', 'La regla de entropía decreciente en sistemas aislados']
          },
          {
            q: (t, n) => `En la optimización de procesos y operaciones de "${t}" (#${n}), ¿qué metodología se enfoca en eliminar desperdicios y maximizar el valor?`,
            c: (t) => `La metodología Lean Manufacturing / Six Sigma y el principio Kaizen de mejora continua`,
            d: ['La acumulación indiscriminada de inventario obsoleto', 'El trabajo sin estandarización de procedimientos', 'La aceptación de tolerancias defectuosas']
          },
          {
            q: (t, n) => `En los sistemas de control y automatización de "${t}" (#${n}), ¿qué elemento compara la variable del proceso con el valor de consigna (setpoint)?`,
            c: (t) => `El controlador de lazo cerrado (e.g. algoritmo PID) mediante retroalimentación`,
            d: ['Un interruptor manual sin sensores', 'Una válvula de alivio bloqueada', 'Un indicador pasivo no conectado']
          },
          {
            q: (t, n) => `Desde la ciencia de materiales en "${t}" (#${n}), ¿qué propiedad describe la capacidad de un material de deformarse plásticamente bajo tracción sin romperse?`,
            c: (t) => `La ductilidad y tenacidad del material`,
            d: ['La fragilidad súbita de rotura', 'La dureza vítrea no maleable', 'La porosidad desordenada']
          },
          {
            q: (t, n) => `En el análisis de fluidos y transferencia de calor de "${t}" (#${n}), ¿qué número adimensional permite predecir si un régimen de flujo es laminar o turbulento?`,
            c: (t) => `El Número de Reynolds (Re)`,
            d: ['El factor de potencia aparente', 'El módulo elástico de cizalladura', 'El índice de refracción estático']
          },
          {
            q: (t, n) => `En la gestión ambiental y sostenibilidad vinculada a "${t}" (#${n}), ¿qué instrumento técnico evalúa de forma previa los impactos sobre el entorno?`,
            c: (t) => `El Estudio de Impacto Ambiental (EIA) y el plan de manejo ambiental`,
            d: ['La auditoría fiscal contable', 'El balance general de activos', 'La prueba de esfuerzo de carga']
          },
          {
            q: (t, n) => `¿Por qué es indispensable el análisis dimensional y la verificación de unidades en los cálculos de "${t}" (#${n})?`,
            c: (t) => `Para asegurar la consistencia física de las ecuaciones y prevenir fallos catastróficos en la escala real`,
            d: ['Porque las unidades no influyen en el resultado real de una obra', 'Para limitar el uso de computadores en la ingeniería', 'Es un requisito meramente tipográfico sin relevancia']
          }
        ];

        let eIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = engTemplates[eIdx % engTemplates.length];
          const round = Math.floor(eIdx / engTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Cálculo y diseño: ' : round === 2 ? 'Fundamento físico: ' : round === 3 ? 'Aplicación industrial: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          eIdx++;
        }
      } else if (isLaw) {
        // Banco académico especializado para CIENCIAS JURÍDICAS, DERECHO Y POLÍTICA
        const lawTemplates = [
          {
            q: (t, n) => `En el ordenamiento jurídico de "${t}" (#${n}), ¿qué principio supremo garantiza que nadie puede ser juzgado sin el cumplimiento de las garantías procesales?`,
            c: (t) => `El principio del debido proceso y el derecho inalienable a la defensa`,
            d: ['La presunción automática de culpabilidad', 'La aplicación retroactiva de normas desfavorables', 'La ausencia de notificación judicial previa']
          },
          {
            q: (t, n) => `En la teoría del delito y dogmática aplicable a "${t}" (#${n}), ¿cuáles son los tres elementos estructurales para configurar una conducta punible?`,
            c: (t) => `La tipicidad, la antijuridicidad y la culpabilidad`,
            d: ['La acusación, la sospecha y la condena sumaria', 'El clamor popular, la notoriedad y la sanción', 'El daño hipotético sin nexo causal']
          },
          {
            q: (t, n) => `En el régimen probatorio de "${t}" (#${n}), ¿sobre quién recae esencialmente la carga de la prueba ('onus probandi')?`,
            c: (t) => `Sobre quien formula la pretensión o acusa la ocurrencia de un hecho jurídico`,
            d: ['Sobre la persona acusada, que debe demostrar su inocencia', 'Sobre los peritos de manera obligatoria', 'Exclusivamente sobre la opinión pública']
          },
          {
            q: (t, n) => `Dentro de la jerarquía normativa aplicable a "${t}" (#${n}), ¿qué postulado establece la primacía de la carta política sobre toda ley o decreto?`,
            c: (t) => `El principio de supremacía constitucional (Pirámide de Kelsen)`,
            d: ['La subordinación constitucional a ordenanzas locales', 'La derogación tácita de los derechos fundamentales', 'La igualdad jerárquica entre resoluciones y la constitución']
          },
          {
            q: (t, n) => `En las obligaciones y contratos de "${t}" (#${n}), ¿qué aforismo consagra que los pactos legalmente celebrados constituyen ley para las partes?`,
            c: (t) => `'Pacta sunt servanda' y el deber de ejecución de buena fe`,
            d: ['La rescisión unilateral caprichosa', 'La nulidad automática de todo acuerdo comercial', 'El enriquecimiento sin causa como regla']
          },
          {
            q: (t, n) => `En la protección de derechos en "${t}" (#${n}), ¿qué mecanismo constitucional ampara de forma expedita los derechos fundamentales vulnerados?`,
            c: (t) => `La acción de tutela o juicio de amparo constitucional`,
            d: ['El juicio de quiebra comercial', 'El recurso de casación mercantil ordinario', 'La demanda ejecutiva de cobro']
          }
        ];

        let lIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = lawTemplates[lIdx % lawTemplates.length];
          const round = Math.floor(lIdx / lawTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Fundamento jurídico: ' : round === 2 ? 'Criterio dogmático: ' : round === 3 ? 'Garantía legal: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          lIdx++;
        }
      } else if (isBusiness) {
        // Banco académico especializado para CIENCIAS ECONÓMICAS, CONTABILIDAD, FINANZAS Y ADMINISTRACIÓN
        const bizTemplates = [
          {
            q: (t, n) => `En la estructura contable bajo estándares NIIF/IFRS de "${t}" (#${n}), ¿cuál es la ecuación fundamental de posición financiera?`,
            c: (t) => `Activo = Pasivo + Patrimonio Neto`,
            d: ['Activo = Ingresos - Gastos operacionales', 'Pasivo = Activo + Utilidad neta', 'Patrimonio = Pasivo total * Inflación']
          },
          {
            q: (t, n) => `En la evaluación financiera de proyectos en "${t}" (#${n}), ¿qué indicador descuenta los flujos de caja proyectados al costo de capital?`,
            c: (t) => `El Valor Presente Neto (VPN) y la Tasa Interna de Retorno (TIR)`,
            d: ['El saldo nominal en caja menor', 'El volumen bruto de ventas sin costos', 'La rotación de inventarios obsoletos']
          },
          {
            q: (t, n) => `En la planeación estratégica y gestión empresarial de "${t}" (#${n}), ¿cuál es el propósito central del análisis DOFA / FODA?`,
            c: (t) => `Evaluar Fortalezas y Debilidades internas frente a Oportunidades y Amenazas externas para trazar ventajas competitivas`,
            d: ['Calcular el pago de impuestos tributarios', 'Auditar los códigos de barras de los productos', 'Liquidar la nómina de salarios']
          },
          {
            q: (t, n) => `En la teoría microeconómica de "${t}" (#${n}), ¿qué situación se alcanza en el punto donde se intersectan las curvas de oferta y demanda?`,
            c: (t) => `El equilibrio de mercado (precio y cantidad de equilibrio con vaciado de mercado)`,
            d: ['Una escasez permanente con inflación descontrolada', 'Un excedente ilimitado no comercializable', 'Un monopolio natural destructivo']
          },
          {
            q: (t, n) => `En el mercadeo contemporáneo de "${t}" (#${n}), ¿qué relación debe guardar el Valor de Vida del Cliente (LTV) respecto al Costo de Adquisición (CAC)?`,
            c: (t) => `El LTV debe ser significativamente mayor al CAC para garantizar rentabilidad y crecimiento sostenible`,
            d: ['El CAC debe ser diez veces superior al LTV', 'Ambos parámetros deben ser nulos', 'Los costos de adquisición no se deben medir']
          },
          {
            q: (t, n) => `En el comercio internacional de "${t}" (#${n}), ¿qué normas internacionales regulan la entrega de mercancías, costos y riesgos entre comprador y vendedor?`,
            c: (t) => `Los términos Incoterms de la Cámara de Comercio Internacional (CCI)`,
            d: ['Los códigos postales universales', 'Las directivas de propiedad intelectual de la OMPI', 'Los estatutos tributarios locales']
          }
        ];

        let bIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = bizTemplates[bIdx % bizTemplates.length];
          const round = Math.floor(bIdx / bizTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Análisis financiero: ' : round === 2 ? 'Enfoque directivo: ' : round === 3 ? 'Criterio económico: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          bIdx++;
        }
      } else if (isSocial) {
        // Banco académico especializado para CIENCIAS SOCIALES, PSICOLOGÍA, FILOSOFÍA, SOCIOLOGÍA Y PEDAGOGÍA
        const socTemplates = [
          {
            q: (t, n) => `En el estudio científico y comportamental de "${t}" (#${n}), ¿qué enfoque metodológico combina datos estadísticos con comprensión cualitativa contextual?`,
            c: (t) => `El enfoque mixto de investigación sociohumanística`,
            d: ['La especulación subjetiva sin marco teórico', 'La adopción acrítica de prejuicios', 'El rechazo de la evidencia contrastable']
          },
          {
            q: (t, n) => `En las teorías del aprendizaje y cognición vinculadas a "${t}" (#${n}), ¿qué concepto de Vygotsky define la brecha entre el desempeño autónomo y el asistido?`,
            c: (t) => `La Zona de Desarrollo Próximo (ZDP) y la mediación pedagógica`,
            d: ['La fijación en la etapa refleja', 'El determinismo conductual rígido', 'La atrofia cognitiva irreversible']
          },
          {
            q: (t, n) => `En la reflexión epistemológica de "${t}" (#${n}), ¿qué disciplina filosófica examina los fundamentos, límites y validez del saber científico?`,
            c: (t) => `La epistemología y la teoría del conocimiento`,
            d: ['La estética renacentista de las artes', 'La cronología numismática antigua', 'La fonética descriptiva']
          },
          {
            q: (t, n) => `Al analizar las estructuras y dinámicas colectivas de "${t}" (#${n}), ¿qué concepto sociológico acuñó Émile Durkheim para los fenómenos coercitivos externos al individuo?`,
            c: (t) => `Los hechos sociales`,
            d: ['Las motivaciones inconscientes individuales', 'Las preferencias aleatorias aisladas', 'Los reflejos biológicos innatos']
          },
          {
            q: (t, n) => `En la evaluación psicométrica y diagnóstica de "${t}" (#${n}), ¿qué cualidad garantiza que un instrumento mida con exactitud lo que pretende medir?`,
            c: (t) => `La validez (de contenido, constructo y criterio) y la confiabilidad estadística`,
            d: ['La longitud excesiva del cuestionario', 'La ambigüedad en los ítems de respuesta', 'La falta de baremación poblacional']
          }
        ];

        let sIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = socTemplates[sIdx % socTemplates.length];
          const round = Math.floor(sIdx / socTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Análisis social: ' : round === 2 ? 'Fundamento teórico: ' : round === 3 ? 'Criterio pedagógico: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          sIdx++;
        }
      } else if (isDesign) {
        // Banco académico especializado para ARQUITECTURA, URBANISMO, DISEÑO Y COMUNICACIÓN
        const desTemplates = [
          {
            q: (t, n) => `En la arquitectura y diseño formal de "${t}" (#${n}), ¿qué tríada clásica de Vitruvio equilibra los requerimientos esenciales de toda obra?`,
            c: (t) => `Firmitas (firmeza estructural), Utilitas (funcionalidad) y Venustas (belleza estética)`,
            d: ['El formalismo ciego sin habitabilidad', 'La edificación sin cálculo ni licencias', 'La estandarización monótona carente de contexto']
          },
          {
            q: (t, n) => `En la composición visual y comunicación gráfica de "${t}" (#${n}), ¿qué principio organiza los elementos según su relevancia para guiar el ojo del espectador?`,
            c: (t) => `La jerarquía visual y la teoría de la Gestalt (proximidad, contraste, escala y alineación)`,
            d: ['La saturación desordenada de estímulos', 'La colocación aleatoria sin retícula', 'El empleo de tipografías ilegibles']
          },
          {
            q: (t, n) => `En el periodismo y redacción informativa de "${t}" (#${n}), ¿qué técnica estructural sitúa los datos cruciales al inicio respondiendo a las preguntas clásicas (5W)?`,
            c: (t) => `La estructura de la pirámide invertida`,
            d: ['La crónica de suspenso en reversa', 'El ensayo subjetivo sin fuentes verificadas', 'La nota publicitaria encubierta']
          }
        ];

        let dIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = desTemplates[dIdx % desTemplates.length];
          const round = Math.floor(dIdx / desTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Enfoque proyectual: ' : round === 2 ? 'Criterio estético: ' : round === 3 ? 'Comunicación visual: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          dIdx++;
        }
      } else {
        // Banco temático adaptativo riguroso para CUALQUIER OTRO TEMA (100% sobre el tema y sin repetición)
        const topicTemplates = [
          {
            q: (t, n) => `En relación directa con "${t}" (#${n}), ¿cuál de los siguientes elementos define con mayor precisión su objetivo o característica central?`,
            c: (t) => `Las propiedades, normas y aplicaciones fundamentales que distinguen a ${t}`,
            d: ['Un factor secundario sin influencia en los resultados reales', 'Una práctica descartada por falta de sustento técnico', 'Un elemento incompatible que anula su propósito']
          },
          {
            q: (t, n) => `Históricamente, ¿qué acontecimiento o transformación (#${n}) marcó un antes y un después en el desarrollo de "${t}"?`,
            c: (t) => `La consolidación de sus métodos clave y el reconocimiento de sus aportes en ${t}`,
            d: ['El aislamiento total de sus practicantes frente a la sociedad', 'La prohibición sistemática de documentar sus avances', 'La ausencia prolongada de cualquier innovación o estudio']
          },
          {
            q: (t, n) => `Al analizar los principios fundamentales de "${t}" (#${n}), ¿qué criterio demuestra un estándar de calidad o dominio superior?`,
            c: (t) => `La capacidad de aplicar de manera coherente y rigurosa los conceptos de ${t}`,
            d: ['La improvisación constante sin respetar ningún criterio previo', 'La desestimación de todas las comprobaciones prácticas', 'La dependencia de factores enteramente aleatorios']
          },
          {
            q: (t, n) => `¿Cuál de las siguientes afirmaciones sobre "${t}" (#${n}) es técnicamente correcta y verificable?`,
            c: (t) => `Opera mediante una estructura definida de reglas, elementos y procedimientos característicos`,
            d: ['Carece por completo de distinciones respecto a cualquier otra temática', 'No admite ningún tipo de análisis, evaluación ni mejora', 'Es una invención reciente sin antecedentes ni bases previas']
          },
          {
            q: (t, n) => `En la práctica contemporánea de "${t}" (#${n}), ¿qué aspecto representa uno de sus mayores desafíos o campos de innovación?`,
            c: (t) => `La integración con nuevas tecnologías y la optimización continua en ${t}`,
            d: ['El abandono general de sus estándares para simplificar procesos', 'La renuncia explícita a la medición de resultados y eficacia', 'La pérdida irreversible de su relevancia en la actualidad']
          },
          {
            q: (t, n) => `¿Qué error común debe evitarse prioritariamente al trabajar o profundizar en "${t}" (#${n})?`,
            c: (t) => `Omitir los fundamentos y las pautas metodológicas que sostienen a ${t}`,
            d: ['Buscar asesoría de especialistas reconocidos en la materia', 'Realizar revisiones periódicas para verificar la calidad', 'Adaptar los métodos a los requerimientos del entorno']
          },
          {
            q: (t, n) => `Desde una perspectiva estructural de "${t}" (#${n}), ¿cuál es la interacción clave entre sus partes?`,
            c: (t) => `La complementariedad funcional orientada a maximizar la eficacia en ${t}`,
            d: ['La fragmentación desordenada de sus elementos', 'La anulación mutua de sus funciones básicas', 'La subordinación a reglas arbitrarias ajenas']
          },
          {
            q: (t, n) => `Al evaluar el impacto y evolución de "${t}" (#${n}), ¿qué evidencia respalda su valor disciplinar?`,
            c: (t) => `Los resultados empíricos contrastables y su aplicación práctica documentada`,
            d: ['La opinión subjetiva no verificada', 'La ausencia de registros históricos', 'El rechazo de estándares internacionales']
          },
          {
            q: (t, n) => `¿Qué principio metodológico asegura la consistencia y reproducibilidad en "${t}" (#${n})?`,
            c: (t) => `El apego a protocolos establecidos y la verificación sistemática`,
            d: ['La variación al azar en cada intento', 'La eliminación de registros de seguimiento', 'La dependencia exclusiva de la intuición']
          },
          {
            q: (t, n) => `En relación con el contexto global de "${t}" (#${n}), ¿cuál es una de sus aplicaciones más relevantes?`,
            c: (t) => `La solución estructurada de problemas concretos en su área de influencia`,
            d: ['El aislamiento absoluto respecto a otras disciplinas', 'La restricción a teorías abstractas sin uso', 'La duplicación ineficiente de procesos obsoletos']
          }
        ];

        let tIdx = 0;
        while (pool.length < count && loopCount < maxLoops) {
          loopCount++;
          if (pool.length % 150 === 0 && onProgress) {
            onProgress(pool.length, count);
            await new Promise(r => setTimeout(r, 0));
          }
          const tpl = topicTemplates[tIdx % topicTemplates.length];
          const round = Math.floor(tIdx / topicTemplates.length);
          const prefix = round === 0 ? '' : round === 1 ? 'Fundamento: ' : round === 2 ? 'Profundización: ' : round === 3 ? 'Análisis crítico: ' : `Pregunta #${qNum} - `;
          const qText = prefix + tpl.q(topic, qNum);
          const key = normKey(qText);
          if (!seenTexts.has(key)) {
            seenTexts.add(key);
            pool.push({
              text: qText,
              opts: [tpl.c(topic), tpl.d[0], tpl.d[1], tpl.d[2]],
              correct: 0,
              isBool: (type === 'boolean')
            });
            qNum++;
          }
          tIdx++;
        }
      }
    }

    // Selección garantizada sin duplicados
    const selected = pool.slice(0, count);

    // Mapear a la estructura de preguntas oficial de MENTIX según el tipo solicitado
    return selected.map((item, qIdx) => {
      let currentType = type;
      if (type === 'mixed') {
        const typesRotation = ['single', 'boolean', 'multi', 'text', 'poll'];
        currentType = typesRotation[qIdx % typesRotation.length];
      }

      if (currentType === 'boolean') {
        if (item.isBool) {
          return this.buildQuestionItem(item.text, ['Verdadero', 'Falso'], item.correct, 'boolean', timeLimit);
        } else {
          return this.buildQuestionItem(
            `En el ámbito de "${topic}": ¿Es verdad que "${item.opts[item.correct]}" es la respuesta a: ${item.text.replace(/^[¿\s]+|[?\s]+$/g, '')}?`,
            ['Verdadero', 'Falso'],
            0,
            'boolean',
            timeLimit
          );
        }
      }

      if (currentType === 'text') {
        const correctText = item.isBool ? (item.correct === 0 ? 'Verdadero' : 'Falso') : item.opts[item.correct];
        return this.buildQuestionItem(item.text, [], correctText, 'text', timeLimit);
      }

      if (currentType === 'poll') {
        const pollOpts = item.isBool 
          ? ['Totalmente de acuerdo', 'De acuerdo', 'En desacuerdo', 'Totalmente en desacuerdo']
          : item.opts;
        return this.buildQuestionItem(
          `📊 Opinión sobre "${topic}": ${item.text.replace(/^[¿\s]+|[?\s]+$/g, '')}`,
          pollOpts,
          null,
          'poll',
          timeLimit,
          0
        );
      }

      if (currentType === 'multi') {
        // Dos opciones correctas y dos incorrectas
        const correctText1 = item.opts[item.correct];
        const correctText2 = `Aspecto comprobado y esencial de ${topic}`;
        const distractor1 = item.opts.find((_, i) => i !== item.correct) || 'Elemento incompatible';
        const distractor2 = 'Criterio descartado por la evidencia histórica';
        const optsList = [correctText1, correctText2, distractor1, distractor2];
        return this.buildQuestionItem(
          `Respecto a "${topic}", selecciona las 2 opciones correctas que corresponden a: ${item.text.replace(/^[¿\s]+|[?\s]+$/g, '')}`,
          optsList,
          [0, 1],
          'multi',
          timeLimit
        );
      }

      // 'single' por defecto
      if (item.isBool) {
        return this.buildQuestionItem(item.text, ['Verdadero', 'Falso'], item.correct, 'boolean', timeLimit);
      }
      const shuffled = this.shuffleOptions(item.opts, item.correct);
      return this.buildQuestionItem(item.text, shuffled.options, shuffled.correctAnswer, 'single', timeLimit);
    });
  },

  importModal() {
    this.openFileImportModal();
  }
};

window.addEventListener('resize', () => {
  if (window.CreatorView) {
    window.CreatorView.autoResizeAllTextareas();
  }
});


