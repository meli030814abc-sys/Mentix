/**
 * ============================================================================
 * MENTIX 3D — CENTRO DE DETALLES DEL EXAMEN Y ALEATORIZACIÓN INTELIGENTE
 * Vista 3D a pantalla completa para Administradores y Creadores de Exámenes.
 * ============================================================================
 */
window.ExamDetailsView = {
  activeExam: null,
  draftConfig: null,
  draftMeta: null,
  activeTab: 'config',
  isDirty: false,
  demoSimMode: false,

  canConfigure(exam) {
    if (!exam) return false;
    const u = window.appState?.currentUser;
    const isAdmin = Boolean(u && (['admin', 'administrador'].includes(String(u.role).toLowerCase()) || u.isAdmin === true));
    if (isAdmin) return true;
    const isTeacherOwner = Boolean(window.TeacherView && typeof window.TeacherView.isOwnedByCurrentTeacher === 'function' && window.TeacherView.isOwnedByCurrentTeacher(exam));
    const isRouterOwner = Boolean(window.appRouter && typeof window.appRouter.isChallengeOwner === 'function' && window.appRouter.isChallengeOwner(exam));
    return isTeacherOwner || isRouterOwner;
  },

  open(examId, initialTab = 'config') {
    let exam = (window.appState?.challenges || []).find(c => c && String(c.id).trim() === String(examId).trim());
    if (!exam && typeof DEFAULT_CHALLENGES !== 'undefined') {
      exam = DEFAULT_CHALLENGES.find(c => c && String(c.id).trim() === String(examId).trim());
    }
    if (!exam) {
      this.showToast('⚠️ No se encontró la información del examen.', true);
      return;
    }
    if (!this.canConfigure(exam)) {
      this.showToast('🔒 Solo el administrador o el creador de este examen puede configurarlo.', true);
      return;
    }

    const total = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const defaultPerStudent = total > 0 ? Math.min(10, total) : 1;
    const existingCfg = (exam.randomizationConfig && typeof exam.randomizationConfig === 'object') ? exam.randomizationConfig : {};

    this.activeExam = exam;
    this.activeTab = initialTab || 'config';
    this.isDirty = false;
    this.demoSimMode = false;

    this.draftConfig = {
      enabled: typeof existingCfg.enabled === 'boolean' ? existingCfg.enabled : true,
      questionsPerStudent: Math.max(1, Math.min(parseInt(existingCfg.questionsPerStudent, 10) || defaultPerStudent, Math.max(1, total))),
      shuffleQuestions: typeof existingCfg.shuffleQuestions === 'boolean' ? existingCfg.shuffleQuestions : true,
      shuffleOptions: typeof existingCfg.shuffleOptions === 'boolean' ? existingCfg.shuffleOptions : true,
      mandatoryQuestionIds: Array.isArray(existingCfg.mandatoryQuestionIds) ? [...existingCfg.mandatoryQuestionIds.map(String)] : [],
      distributionEnabled: Boolean(existingCfg.distributionEnabled),
      distributionRules: Array.isArray(existingCfg.distributionRules) ? JSON.parse(JSON.stringify(existingCfg.distributionRules)) : [],
      customTopics: Array.isArray(existingCfg.customTopics) ? [...existingCfg.customTopics] : []
    };

    this.draftMeta = {
      title: exam.title || '',
      description: exam.description || '',
      categoryName: exam.categoryName || 'General',
      timePerQuestion: typeof exam.timePerQuestion === 'number' ? exam.timePerQuestion : 20
    };

    this.ensureContainers();
    this.render();

    const modal = document.getElementById('teacher-randomize-modal');
    if (modal) {
      modal.style.display = 'flex';
      const isDark = document.body.classList.contains('teacher-theme-dark') ||
                     document.getElementById('view-teacher')?.classList.contains('teacher-theme-dark') ||
                     document.querySelector('.teacher-panel-wrapper')?.classList.contains('teacher-theme-dark') ||
                     !document.body.classList.contains('light-theme');
      modal.classList.toggle('teacher-theme-dark', isDark);
    }
  },

  close() {
    const modal = document.getElementById('teacher-randomize-modal');
    if (modal) modal.style.display = 'none';
  },

  ensureContainers() {
    if (!document.getElementById('teacher-randomize-modal')) {
      const wrap = document.createElement('div');
      wrap.innerHTML = `
        <div id="teacher-randomize-modal" class="t3d-modal-backdrop" style="display: none;">
          <div class="t3d-modal-window is-rand-modal" id="teacher-randomize-modal-content"></div>
        </div>
      `;
      document.body.appendChild(wrap.firstElementChild);
    }
    if (!document.getElementById('teacher-mandatory-modal')) {
      const wrap2 = document.createElement('div');
      wrap2.innerHTML = `
        <div id="teacher-mandatory-modal" class="t3d-modal-backdrop" style="display: none; z-index: 10060;">
          <div class="t3d-modal-window" style="max-width: 700px; width: 92vw; max-height: 86vh; overflow-y: auto;">
            <div class="t3d-modal-header">
              <h3 class="t3d-modal-title">
                <span>📌</span>
                <span>Seleccionar Preguntas Obligatorias</span>
              </h3>
              <button class="t3d-modal-close" onclick="window.ExamDetailsView.closeMandatoryModal()">&times;</button>
            </div>
            <p style="font-size: 0.86rem; color: var(--text-secondary); margin-bottom: 1rem;">
              Marca las preguntas que <strong>siempre</strong> deberán aparecer en el cuestionario de cada estudiante, sin importar la selección aleatoria.
            </p>
            <div id="teacher-mandatory-list" style="display: flex; flex-direction: column; gap: 0.65rem; max-height: 52vh; overflow-y: auto; padding-right: 0.35rem;"></div>
            <div style="display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 1.4rem; padding-top: 1rem; border-top: 1px solid rgba(148,163,184,0.2);">
              <button class="t3d-btn t3d-btn-primary" onclick="window.ExamDetailsView.closeMandatoryModal()">
                <span>Confirmar Selección</span>
              </button>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(wrap2.firstElementChild);
    }
  },

  switchTab(tab) {
    this.activeTab = tab;
    this.render();
  },

  markDirty() {
    this.isDirty = true;
    const pill = document.getElementById('t3d-examhub-status-pill');
    if (pill) {
      pill.classList.add('is-dirty');
      pill.innerHTML = '<span>●</span><span>Cambios sin guardar</span>';
    }
  },

  showToast(msg, isError = false) {
    const existing = document.getElementById('t3d-examhub-toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.id = 't3d-examhub-toast';
    el.className = 't3d-examhub-toast';
    if (isError) {
      el.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      el.style.boxShadow = '0 5px 0 #991b1b, 0 14px 28px rgba(220,38,38,0.45)';
    }
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 3400);
  },

  toggleDemoSimMode() {
    this.demoSimMode = !this.demoSimMode;
    this.render();
  },

  getEffectiveTotal() {
    const realTotal = Array.isArray(this.activeExam?.questions) ? this.activeExam.questions.length : 0;
    return this.demoSimMode ? 20 : realTotal;
  },

  getAttempts() {
    if (!this.activeExam) return [];
    try {
      const raw = localStorage.getItem(`mentix_exam_attempts_${this.activeExam.id}`);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  },

  ico3d(path, cls = 't3d-ex-ico-sm') {
    return `<img src="https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/${path}" class="${cls}" alt="" />`;
  },

  render() {
    const content = document.getElementById('teacher-randomize-modal-content');
    const exam = this.activeExam;
    const cfg = this.draftConfig;
    if (!content || !exam || !cfg) return;

    const realTotal = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const attempts = this.getAttempts();
    const safeTitle = (this.draftMeta?.title || exam.title || 'Examen').replace(/</g, '&lt;');

    content.innerHTML = `
      <!-- BARRA SUPERIOR 3D FIJA -->
      <header class="t3d-examhub-topbar">
        <div class="t3d-examhub-top-left">
          <button type="button" class="t3d-examhub-back-btn" onclick="window.ExamDetailsView.close()">
            <span>←</span>
            <span>Volver</span>
          </button>
          <div class="t3d-rand-brand-crumbs" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
            ${this.ico3d('Graduation%20cap/3D/graduation_cap_3d.png', 't3d-ex-ico-sm')}
            <span>Mentix 3D</span>
            <span>›</span>
            <span>Cuestionarios</span>
            <span>›</span>
            <strong>${safeTitle}</strong>
          </div>
          <span id="t3d-examhub-status-pill" class="t3d-examhub-status-pill ${this.isDirty ? 'is-dirty' : ''}">
            <span>${this.isDirty ? '●' : '✓'}</span>
            <span>${this.isDirty ? 'Cambios sin guardar' : 'Guardado'}</span>
          </span>
        </div>

        <div class="t3d-rand-topbar-actions">
          <button type="button" class="t3d-rand-btn-preview" onclick="window.ExamDetailsView.previewExam()" title="Probar cómo lo verá el estudiante con esta configuración">
            ${this.ico3d('Eye/3D/eye_3d.png', 't3d-ex-ico-xs')}
            <span>Vista previa</span>
          </button>
          <button type="button" id="t3d-examhub-save-btn" class="t3d-rand-btn-save" onclick="window.ExamDetailsView.saveAll()">
            ${this.ico3d('Floppy%20disk/3D/floppy_disk_3d.png', 't3d-ex-ico-xs')}
            <span>Guardar cambios</span>
          </button>
        </div>
      </header>

      <!-- CUERPO A PANTALLA COMPLETA: SIDEBAR 3D + ÁREA DE TRABAJO -->
      <div class="t3d-examhub-body">
        <aside class="t3d-examhub-sidebar">
          <button type="button" class="t3d-examhub-nav-btn ${this.activeTab === 'general' ? 'active' : ''}" onclick="window.ExamDetailsView.switchTab('general')">
            ${this.ico3d('Identification%20card/3D/identification_card_3d.png', 't3d-ex-ico-sm')}
            <span>General</span>
          </button>
          <button type="button" class="t3d-examhub-nav-btn ${this.activeTab === 'questions' ? 'active' : ''}" onclick="window.ExamDetailsView.switchTab('questions')">
            ${this.ico3d('Books/3D/books_3d.png', 't3d-ex-ico-sm')}
            <span>Preguntas</span>
            <span class="t3d-examhub-nav-count">${realTotal}</span>
          </button>
          <button type="button" class="t3d-examhub-nav-btn ${this.activeTab === 'config' ? 'active' : ''}" onclick="window.ExamDetailsView.switchTab('config')">
            ${this.ico3d('Game%20die/3D/game_die_3d.png', 't3d-ex-ico-sm')}
            <span>Aleatorización</span>
            <span class="t3d-examhub-nav-count">${cfg.enabled ? 'ON' : 'OFF'}</span>
          </button>
          <button type="button" class="t3d-examhub-nav-btn ${this.activeTab === 'publish' ? 'active' : ''}" onclick="window.ExamDetailsView.switchTab('publish')">
            ${this.ico3d('Rocket/3D/rocket_3d.png', 't3d-ex-ico-sm')}
            <span>Publicación</span>
          </button>
          <button type="button" class="t3d-examhub-nav-btn ${this.activeTab === 'results' ? 'active' : ''}" onclick="window.ExamDetailsView.switchTab('results')">
            ${this.ico3d('Bar%20chart/3D/bar_chart_3d.png', 't3d-ex-ico-sm')}
            <span>Resultados</span>
            <span class="t3d-examhub-nav-count">${attempts.length}</span>
          </button>

          <div style="margin-top: auto; padding-top: 1rem; border-top: 2px dashed rgba(148,163,184,0.35);">
            <button type="button" class="t3d-btn t3d-btn-amber" style="width:100%; justify-content:center; font-size:0.86rem;" onclick="window.ExamDetailsView.openInCreator()">
              ${this.ico3d('Pencil/3D/pencil_3d.png', 't3d-ex-ico-xs')}
              <span>Editar Preguntas</span>
            </button>
          </div>
        </aside>

        <main class="t3d-examhub-workspace">
          ${this.activeTab === 'general' ? this.renderGeneralTab() : ''}
          ${this.activeTab === 'questions' ? this.renderQuestionsTab() : ''}
          ${this.activeTab === 'config' ? this.renderConfigTab() : ''}
          ${this.activeTab === 'publish' ? this.renderPublishTab() : ''}
          ${this.activeTab === 'results' ? this.renderResultsTab(attempts) : ''}
        </main>
      </div>
    `;

    if (this.activeTab === 'config') {
      this.updateSimulationPreview();
    }
  },

  renderGeneralTab() {
    const m = this.draftMeta;
    const exam = this.activeExam;
    const realTotal = Array.isArray(exam.questions) ? exam.questions.length : 0;
    return `
      <div class="t3d-rand-main-card" style="max-width: 820px;">
        <div class="t3d-rand-header-row">
          <div class="t3d-rand-header-ico">🪪</div>
          <div>
            <h2 class="t3d-rand-header-title">Información General del Examen</h2>
            <p class="t3d-rand-header-sub">Edita los datos principales de tu evaluación. Recuerda pulsar "Guardar cambios" arriba para persistir.</p>
          </div>
        </div>

        <div class="t3d-form-group">
          <label class="t3d-form-label">Título del Examen</label>
          <input type="text" class="t3d-form-input" value="${(m.title || '').replace(/"/g, '&quot;')}" oninput="window.ExamDetailsView.onMetaChange('title', this.value)" />
        </div>

        <div class="t3d-form-group">
          <label class="t3d-form-label">Descripción</label>
          <textarea class="t3d-form-input" rows="3" oninput="window.ExamDetailsView.onMetaChange('description', this.value)">${(m.description || '').replace(/</g, '&lt;')}</textarea>
        </div>

        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
          <div class="t3d-form-group">
            <label class="t3d-form-label">Categoría / Materia</label>
            <input type="text" class="t3d-form-input" value="${(m.categoryName || 'General').replace(/"/g, '&quot;')}" oninput="window.ExamDetailsView.onMetaChange('categoryName', this.value)" />
          </div>
          <div class="t3d-form-group">
            <label class="t3d-form-label">Tiempo por Pregunta (segundos, 0 = sin límite)</label>
            <input type="number" class="t3d-form-input" min="0" max="600" value="${m.timePerQuestion}" oninput="window.ExamDetailsView.onMetaChange('timePerQuestion', parseInt(this.value, 10) || 0)" />
          </div>
        </div>

        <div class="t3d-rand-setting-box" style="margin-top: 0.75rem;">
          <div class="t3d-rand-setting-info">
            <div class="t3d-rand-setting-ico">👨‍🏫</div>
            <div>
              <h4 class="t3d-rand-setting-title">Autor: ${(exam.author || 'Docente').replace(/</g, '&lt;')}</h4>
              <p class="t3d-rand-setting-desc">Banco actual: <strong>${realTotal}</strong> preguntas • Aleatorización: <strong>${this.draftConfig.enabled ? 'Activada' : 'Desactivada'}</strong></p>
            </div>
          </div>
          <button type="button" class="t3d-btn t3d-btn-primary" onclick="window.ExamDetailsView.switchTab('config')">
            <span>⚙️ Ir a Aleatorización</span>
          </button>
        </div>
      </div>
    `;
  },

  renderQuestionsTab() {
    const exam = this.activeExam;
    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const mandatorySet = new Set((this.draftConfig.mandatoryQuestionIds || []).map(String));

    return `
      <div class="t3d-rand-main-card">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
          <div class="t3d-rand-header-row" style="margin:0;">
            <div class="t3d-rand-header-ico">❓</div>
            <div>
              <h2 class="t3d-rand-header-title">Banco de Preguntas (${questions.length})</h2>
              <p class="t3d-rand-header-sub">Asigna temática, dificultad y marca preguntas obligatorias directamente desde aquí.</p>
            </div>
          </div>
          <button type="button" class="t3d-btn t3d-btn-primary" onclick="window.ExamDetailsView.openInCreator()">
            <span>➕ Agregar / Editar Preguntas</span>
          </button>
        </div>

        ${questions.length === 0 ? `
          <div style="text-align:center; padding:2.5rem; opacity:0.8;">
            <p style="font-size:1rem; font-weight:800;">Este examen aún no tiene preguntas.</p>
            <button type="button" class="t3d-btn t3d-btn-emerald" style="margin-top:0.75rem;" onclick="window.ExamDetailsView.openInCreator()">➕ Crear Preguntas Ahora</button>
          </div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            ${questions.map((q, idx) => {
              const qKey = String(q.id || idx);
              const isMand = mandatorySet.has(qKey);
              const diff = String(q.difficulty || 'media').toLowerCase();
              const diffCls = diff === 'baja' ? 'is-baja' : (diff === 'alta' ? 'is-alta' : 'is-media');
              const topic = q.topic || q.category || exam.categoryName || 'General';
              const qText = (q.text || q.question || `Pregunta #${idx + 1}`).replace(/</g, '&lt;');
              return `
                <div class="t3d-rand-setting-box" style="flex-wrap:wrap; align-items:center;">
                  <div style="flex:1; min-width:240px;">
                    <div style="font-weight:900; font-size:0.9rem; margin-bottom:0.2rem;">
                      <span class="t3d-sim-chip t3d-sim-chip-bank" style="margin-right:0.4rem;">${idx + 1}</span>
                      ${qText.slice(0, 130)}${qText.length > 130 ? '...' : ''}
                    </div>
                    <div style="font-size:0.76rem; color:#64748b;">
                      ${Array.isArray(q.options) ? `${q.options.length} opciones` : 'Pregunta abierta'}
                    </div>
                  </div>
                  <div style="display:flex; align-items:center; gap:0.55rem; flex-wrap:wrap;">
                    <input
                      type="text"
                      class="t3d-rand-input-sm"
                      style="width:140px;"
                      value="${String(topic).replace(/"/g, '&quot;')}"
                      placeholder="Temática"
                      title="Temática de la pregunta"
                      oninput="window.ExamDetailsView.onQuestionMetaChange(${idx}, 'topic', this.value)"
                    />
                    <select class="t3d-rand-select-diff ${diffCls}" title="Nivel de dificultad" onchange="window.ExamDetailsView.onQuestionMetaChange(${idx}, 'difficulty', this.value)">
                      <option value="baja" ${diff === 'baja' ? 'selected' : ''}>Baja</option>
                      <option value="media" ${diff === 'media' ? 'selected' : ''}>Media</option>
                      <option value="alta" ${diff === 'alta' ? 'selected' : ''}>Alta</option>
                    </select>
                    <button
                      type="button"
                      class="t3d-rand-btn-select-pill"
                      style="${isMand ? 'background:#fef3c7; border-color:#f59e0b; color:#b45309;' : ''}"
                      onclick="window.ExamDetailsView.toggleMandatoryDirect('${qKey.replace(/'/g, "\\'")}')"
                      title="Marcar o desmarcar como pregunta obligatoria"
                    >
                      <span>${isMand ? '📌 Obligatoria' : '📌 Opcional'}</span>
                    </button>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        `}
      </div>
    `;
  },

  renderConfigTab() {
    const exam = this.activeExam;
    const cfg = this.draftConfig;
    const realTotal = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const effTotal = this.getEffectiveTotal();
    const effPerStudent = this.demoSimMode
      ? Math.min(10, Math.max(1, cfg.questionsPerStudent === 1 && realTotal <= 1 ? 10 : cfg.questionsPerStudent))
      : Math.max(1, Math.min(cfg.questionsPerStudent, Math.max(1, realTotal)));
    const mandatoryCount = (cfg.mandatoryQuestionIds || []).length;
    const existingTopics = Array.from(new Set((exam.questions || []).map(q => q.topic || q.category || exam.categoryName || 'General').filter(Boolean)));
    if (existingTopics.length === 0) existingTopics.push('General');

    return `
      <div class="t3d-rand-layout">
        <!-- COLUMNA IZQUIERDA: CONFIGURACIÓN DEL DOCENTE -->
        <div class="t3d-rand-main-card">
          <div class="t3d-rand-header-row">
            <div class="t3d-rand-header-ico">${this.ico3d('Game%20die/3D/game_die_3d.png', 't3d-ex-ico-md')}</div>
            <div>
              <h2 class="t3d-rand-header-title">Aleatorización inteligente de preguntas y respuestas</h2>
              <p class="t3d-rand-header-sub">Activa o desactiva cada regla y observa al instante cómo se comporta el motor 3D en la vista previa derecha.</p>
            </div>
          </div>

          ${realTotal < 2 ? `
            <div class="t3d-rand-demo-banner">
              <div style="font-weight:900; font-size:0.9rem; color:#92400e;">
                💡 Este examen tiene actualmente <strong>${realTotal}</strong> pregunta en su banco.
              </div>
              <div style="font-size:0.82rem; color:#78350f; line-height:1.4;">
                Para que cada estudiante reciba combinaciones distintas, agrega al menos 2 o más preguntas al banco. Mientras tanto, puedes activar el <strong>Simulador de demostración (20 preguntas)</strong> para ver en vivo cómo funciona cada botón.
              </div>
              <div style="display:flex; gap:0.6rem; flex-wrap:wrap;">
                <button type="button" class="t3d-btn t3d-btn-primary" style="padding:0.45rem 0.9rem; font-size:0.82rem;" onclick="window.ExamDetailsView.openInCreator()">
                  <span>➕ Agregar preguntas a este examen</span>
                </button>
                <button type="button" class="t3d-btn t3d-btn-amber" style="padding:0.45rem 0.9rem; font-size:0.82rem;" onclick="window.ExamDetailsView.toggleDemoSimMode()">
                  <span>${this.demoSimMode ? '🔙 Volver a mi banco real (' + realTotal + ')' : '🧪 Probar simulador con 20 preguntas'}</span>
                </button>
              </div>
            </div>
          ` : ''}

          <!-- 1. Selección aleatoria de preguntas -->
          <div class="t3d-rand-setting-box ${cfg.enabled ? '' : 'is-off'}">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">${this.ico3d('Game%20die/3D/game_die_3d.png', 't3d-ex-ico-sm')}</div>
              <div>
                <h4 class="t3d-rand-setting-title">
                  Selección aleatoria de preguntas
                  <span class="t3d-func-pill ${cfg.enabled ? 'on' : 'off'}">${cfg.enabled ? 'Activado' : 'Desactivado'}</span>
                </h4>
                <p class="t3d-rand-setting-desc">
                  ${cfg.enabled
                    ? 'Activo: cada estudiante recibe un subconjunto único elegido al azar del banco.'
                    : 'Desactivado: todos los estudiantes responderán todas las preguntas del banco.'}
                </p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" ${cfg.enabled ? 'checked' : ''} onchange="window.ExamDetailsView.onConfigChange('enabled', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- 2. Banco disponible vs Preguntas por estudiante -->
          <div class="t3d-rand-stats-row">
            <div class="t3d-rand-stat-card">
              <div class="t3d-rand-stat-ico">${this.ico3d('Books/3D/books_3d.png', 't3d-ex-ico-sm')}</div>
              <div class="t3d-rand-stat-content">
                <div class="t3d-rand-stat-label">Preguntas disponibles ${this.demoSimMode ? '(Demo)' : ''}</div>
                <div class="t3d-rand-stat-num">${effTotal}</div>
                <div class="t3d-rand-stat-hint">Total en el banco del examen.</div>
              </div>
            </div>
            <div class="t3d-rand-stat-card ${cfg.enabled ? '' : 'is-disabled'}">
              <div class="t3d-rand-stat-ico">${this.ico3d('Clipboard/3D/clipboard_3d.png', 't3d-ex-ico-sm')}</div>
              <div class="t3d-rand-stat-content">
                <div class="t3d-rand-stat-label">Preguntas por estudiante <span style="color:#ef4444;">*</span></div>
                <input
                  type="number"
                  id="t3d-rand-input-count"
                  class="t3d-rand-stat-input"
                  value="${effPerStudent}"
                  min="1"
                  max="${Math.max(1, effTotal)}"
                  ${cfg.enabled ? '' : 'disabled'}
                  oninput="window.ExamDetailsView.onConfigChange('questionsPerStudent', parseInt(this.value, 10) || 1)"
                />
                <div class="t3d-rand-stat-hint">
                  ${cfg.enabled
                    ? `Cada estudiante responderá <strong>${effPerStudent}</strong> de ${effTotal} preguntas.`
                    : `Modo completo: se muestran todas (${effTotal}).`}
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Orden aleatorio de preguntas -->
          <div class="t3d-rand-setting-box ${cfg.shuffleQuestions ? '' : 'is-off'}">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">${this.ico3d('Shuffle%20tracks%20button/3D/shuffle_tracks_button_3d.png', 't3d-ex-ico-sm')}</div>
              <div>
                <h4 class="t3d-rand-setting-title">
                  Orden aleatorio de preguntas
                  <span class="t3d-func-pill ${cfg.shuffleQuestions ? 'on' : 'off'}">${cfg.shuffleQuestions ? 'Activado' : 'Orden fijo'}</span>
                </h4>
                <p class="t3d-rand-setting-desc">
                  ${cfg.shuffleQuestions
                    ? 'Mezcla la secuencia de preguntas para que ningún estudiante tenga el mismo orden.'
                    : 'Mantiene el orden secuencial original (1, 2, 3...) de las preguntas elegidas.'}
                </p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" ${cfg.shuffleQuestions ? 'checked' : ''} onchange="window.ExamDetailsView.onConfigChange('shuffleQuestions', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- 4. Orden aleatorio de opciones de respuesta -->
          <div class="t3d-rand-setting-box ${cfg.shuffleOptions ? '' : 'is-off'}">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">${this.ico3d('Input%20latin%20letters/3D/input_latin_letters_3d.png', 't3d-ex-ico-sm')}</div>
              <div>
                <h4 class="t3d-rand-setting-title">
                  Orden aleatorio de opciones de respuesta
                  <span class="t3d-func-pill ${cfg.shuffleOptions ? 'on' : 'off'}">${cfg.shuffleOptions ? 'Activado' : 'Orden fijo'}</span>
                </h4>
                <p class="t3d-rand-setting-desc">
                  ${cfg.shuffleOptions
                    ? 'Reordena (A, B, C, D) por estudiante conservando la calificación automática correcta.'
                    : 'Las opciones A, B, C, D aparecen siempre en el mismo orden en que fueron creadas.'}
                </p>
              </div>
            </div>
            <label class="t3d-ios-switch">
              <input type="checkbox" ${cfg.shuffleOptions ? 'checked' : ''} onchange="window.ExamDetailsView.onConfigChange('shuffleOptions', this.checked)">
              <span class="t3d-ios-slider"></span>
            </label>
          </div>

          <!-- 5. Preguntas obligatorias -->
          <div class="t3d-rand-setting-box">
            <div class="t3d-rand-setting-info">
              <div class="t3d-rand-setting-ico">${this.ico3d('Pushpin/3D/pushpin_3d.png', 't3d-ex-ico-sm')}</div>
              <div>
                <h4 class="t3d-rand-setting-title">
                  Preguntas obligatorias
                  <span class="t3d-func-pill ${mandatoryCount > 0 ? 'on' : 'off'}">${mandatoryCount} fijas</span>
                </h4>
                <p class="t3d-rand-setting-desc">Aparecen siempre en todos los cuestionarios (se resaltan con borde dorado en la simulación).</p>
              </div>
            </div>
            <button type="button" class="t3d-rand-btn-select-pill" onclick="window.ExamDetailsView.openMandatoryModal()">
              <span>Seleccionar (${mandatoryCount})</span>
              <span>›</span>
            </button>
          </div>

          <!-- 6. Distribución por temática y dificultad (opcional) -->
          <div class="t3d-rand-setting-box" style="flex-direction: column; align-items: stretch;">
            <div style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:1rem;">
              <div class="t3d-rand-setting-info">
                <div class="t3d-rand-setting-ico">${this.ico3d('Control%20knobs/3D/control_knobs_3d.png', 't3d-ex-ico-sm')}</div>
                <div>
                  <h4 class="t3d-rand-setting-title">
                    Distribución por temática y dificultad (opcional)
                    <span class="t3d-func-pill ${cfg.distributionEnabled ? 'on' : 'off'}">${cfg.distributionEnabled ? 'Activado' : 'Desactivado'}</span>
                  </h4>
                  <p class="t3d-rand-setting-desc">Define cuántas preguntas incluir por cada tema y nivel (Baja, Media, Alta).</p>
                </div>
              </div>
              <label class="t3d-ios-switch">
                <input type="checkbox" ${cfg.distributionEnabled ? 'checked' : ''} onchange="window.ExamDetailsView.onConfigChange('distributionEnabled', this.checked)">
                <span class="t3d-ios-slider"></span>
              </label>
            </div>

            ${cfg.distributionEnabled ? `
              <!-- Barra rápida 3D para crear nuevas temáticas personalizadas -->
              <div style="display:flex; align-items:center; gap:0.55rem; margin-top:0.85rem; flex-wrap:wrap;">
                <input
                  type="text"
                  id="t3d-new-topic-input"
                  class="t3d-rand-input-sm"
                  style="flex:1; min-width:190px; padding:0.5rem 0.75rem; border-radius:12px;"
                  placeholder="Escribe una nueva temática (ej: Historia, Álgebra, Ética)..."
                  onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.ExamDetailsView.createCustomTopicFromBar(); }"
                />
                <button
                  type="button"
                  class="t3d-btn-details-badge"
                  style="padding:0.48rem 0.95rem; font-size:0.8rem;"
                  onclick="window.ExamDetailsView.createCustomTopicFromBar()"
                >
                  <span>➕ Crear temática</span>
                </button>
              </div>

              <div class="t3d-rand-dist-table-wrap">
                <table class="t3d-rand-dist-table">
                  <thead>
                    <tr>
                      <th style="width: 44%;">Temática</th>
                      <th style="width: 26%;">Dificultad</th>
                      <th style="width: 18%;">Cantidad</th>
                      <th style="width: 12%;"></th>
                    </tr>
                  </thead>
                  <tbody>
                    ${this.renderDistributionRows(cfg.distributionRules, existingTopics)}
                  </tbody>
                </table>
              </div>
              <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                <button type="button" class="t3d-rand-btn-add-rule" onclick="window.ExamDetailsView.addDistributionRule()">
                  <span>+</span>
                  <span>Agregar regla</span>
                </button>
                <span style="font-size:0.78rem; font-weight:800; color:#64748b;">
                  Total en reglas: <strong>${(cfg.distributionRules || []).reduce((acc, r) => acc + (parseInt(r.count, 10) || 0), 0)}</strong> / ${effPerStudent} preguntas
                </span>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- COLUMNA DERECHA: EXPLICACIÓN + VISTA PREVIA INTERACTIVA + BENEFICIOS -->
        <div class="t3d-rand-right-col">
          <div class="t3d-rand-card-how">
            <h3 class="t3d-rand-card-how-title">
              ${this.ico3d('Direct%20hit/3D/direct_hit_3d.png', 't3d-ex-ico-sm')}
              <span>¿Cómo funciona?</span>
            </h3>
            <p class="t3d-rand-card-how-p">
              ${cfg.enabled
                ? `Con un banco de <strong>${effTotal}</strong> preguntas y una evaluación de <strong>${effPerStudent}</strong> preguntas, cada estudiante recibirá una selección aleatoria de <strong>${effPerStudent}</strong> preguntas${cfg.shuffleQuestions ? ' en orden distinto' : ' en orden secuencial'}${cfg.shuffleOptions ? ' y con opciones (A, B, C, D) reordenadas' : ' y con opciones en orden fijo'}.`
                : `La selección aleatoria está desactivada. Todos los estudiantes responderán las <strong>${effTotal}</strong> preguntas del banco${cfg.shuffleQuestions ? ' en orden aleatorio' : ' en orden original'}.`}
            </p>
          </div>

          <div class="t3d-rand-card-preview">
            <div class="t3d-rand-card-prev-title">
              <div style="display:flex; align-items:center; gap:0.5rem;">
                ${this.ico3d('Eye/3D/eye_3d.png', 't3d-ex-ico-sm')}
                <span>Vista previa en vivo</span>
              </div>
              <button type="button" class="t3d-btn-details-badge" style="padding:0.28rem 0.75rem; font-size:0.76rem;" onclick="window.ExamDetailsView.updateSimulationPreview()">
                <span>🔄 Simular ahora</span>
              </button>
            </div>

            <div class="t3d-rand-prev-box">
              <div class="t3d-rand-prev-box-label">
                ${this.ico3d('Books/3D/books_3d.png', 't3d-ex-ico-xs')}
                <span>Banco de preguntas (${effTotal}${this.demoSimMode ? ' — Modo Demo' : ''})</span>
              </div>
              <div class="t3d-sim-chips-container" id="t3d-sim-bank-chips"></div>
            </div>

            <div class="t3d-rand-arrow-down">↓</div>

            <div class="t3d-rand-engine-box">
              <div class="t3d-rand-engine-title">
                ${this.ico3d('Game%20die/3D/game_die_3d.png', 't3d-ex-ico-sm')}
                <span>Motor 3D de aleatorización</span>
              </div>
              <div class="t3d-rand-engine-desc">
                ${cfg.enabled ? `Elige ${effPerStudent} preguntas` : `Usa todas (${effTotal})`} •
                ${cfg.shuffleQuestions ? 'Preguntas mezcladas' : 'Orden fijo'} •
                ${cfg.shuffleOptions ? 'Opciones A-D mezcladas' : 'Opciones fijas'}
              </div>
            </div>

            <div class="t3d-rand-arrow-down">↓</div>

            <div class="t3d-rand-student-row s1">
              <div class="t3d-rand-student-header">${this.ico3d('Student/Default/3D/student_3d_default.png', 't3d-ex-ico-xs')}<span>Estudiante 1</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student1-chips"></div>
              <div class="t3d-opt-preview-row" id="t3d-sim-student1-opts"></div>
            </div>

            <div class="t3d-rand-student-row s2">
              <div class="t3d-rand-student-header">${this.ico3d('Student/Default/3D/student_3d_default.png', 't3d-ex-ico-xs')}<span>Estudiante 2</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student2-chips"></div>
              <div class="t3d-opt-preview-row" id="t3d-sim-student2-opts"></div>
            </div>

            <div class="t3d-rand-student-row s3">
              <div class="t3d-rand-student-header">${this.ico3d('Student/Default/3D/student_3d_default.png', 't3d-ex-ico-xs')}<span>Estudiante 3</span></div>
              <div class="t3d-sim-chips-container" id="t3d-sim-student3-chips"></div>
              <div class="t3d-opt-preview-row" id="t3d-sim-student3-opts"></div>
            </div>
          </div>

          <div class="t3d-rand-card-benefits">
            <h3 class="t3d-rand-card-ben-title">
              ${this.ico3d('Check%20mark%20button/3D/check_mark_button_3d.png', 't3d-ex-ico-sm')}
              <span>Beneficios activos</span>
            </h3>
            <ul class="t3d-rand-ben-list">
              <li><span>✓</span> Evaluaciones individualizadas por estudiante.</li>
              <li><span>✓</span> Reduce la copia entre estudiantes.</li>
              <li><span>✓</span> Calificación automática exacta aunque cambie el orden.</li>
              <li><span>✓</span> Conserva el mismo cuestionario si el alumno recarga la página.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  },

  renderPublishTab() {
    const exam = this.activeExam;
    return `
      <div class="t3d-rand-main-card" style="max-width: 820px;">
        <div class="t3d-rand-header-row">
          <div class="t3d-rand-header-ico">🚀</div>
          <div>
            <h2 class="t3d-rand-header-title">Publicación y Lanzamiento en Vivo</h2>
            <p class="t3d-rand-header-sub">Aplica este examen directamente con la configuración de aleatorización que acabas de definir.</p>
          </div>
        </div>

        <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem;">
          <div class="t3d-rand-setting-box" style="flex-direction:column; align-items:flex-start;">
            <h4 class="t3d-rand-setting-title">▶️ Probar como Estudiante</h4>
            <p class="t3d-rand-setting-desc">Ejecuta el cuestionario tal cual lo verá un alumno con el motor aleatorio.</p>
            <button type="button" class="t3d-btn t3d-btn-primary" style="width:100%; justify-content:center; margin-top:0.5rem;" onclick="window.ExamDetailsView.previewExam()">
              <span>Probar ahora</span>
            </button>
          </div>

          <div class="t3d-rand-setting-box" style="flex-direction:column; align-items:flex-start;">
            <h4 class="t3d-rand-setting-title">📺 Proyectar en Pantalla</h4>
            <p class="t3d-rand-setting-desc">Crea una sala en vivo estilo Kahoot proyectada en el salón.</p>
            <button type="button" class="t3d-btn t3d-btn-emerald" style="width:100%; justify-content:center; margin-top:0.5rem;" onclick="window.ExamDetailsView.launchRoom('presented')">
              <span>Lanzar Proyectado</span>
            </button>
          </div>

          <div class="t3d-rand-setting-box" style="flex-direction:column; align-items:flex-start;">
            <h4 class="t3d-rand-setting-title">📱 Examen en Móviles</h4>
            <p class="t3d-rand-setting-desc">Cada estudiante responde a su propio ritmo con su cuestionario único.</p>
            <button type="button" class="t3d-btn t3d-btn-cyan" style="width:100%; justify-content:center; margin-top:0.5rem;" onclick="window.ExamDetailsView.launchRoom('normal')">
              <span>Lanzar Individual</span>
            </button>
          </div>
        </div>
      </div>
    `;
  },

  renderResultsTab(attempts) {
    return `
      <div class="t3d-rand-main-card">
        <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:1rem; margin-bottom:1.25rem;">
          <div class="t3d-rand-header-row" style="margin:0;">
            <div class="t3d-rand-header-ico">📊</div>
            <div>
              <h2 class="t3d-rand-header-title">Resultados y Trazabilidad de Intentos (${attempts.length})</h2>
              <p class="t3d-rand-header-sub">Consulta el cuestionario exacto y el orden de preguntas que recibió cada estudiante.</p>
            </div>
          </div>
          ${attempts.length > 0 ? `
            <button type="button" class="t3d-rand-btn-preview" onclick="window.ExamDetailsView.clearAttempts()">
              <span>🗑️ Limpiar historial local</span>
            </button>
          ` : ''}
        </div>

        ${attempts.length === 0 ? `
          <div style="text-align:center; padding:2.5rem; color:#64748b;">
            <div style="font-size:2.2rem; margin-bottom:0.5rem;">🧾</div>
            <div style="font-weight:850; font-size:0.95rem;">Aún no hay intentos registrados para este examen.</div>
            <p style="font-size:0.84rem; margin-top:0.35rem;">Cuando un estudiante presente la evaluación (o uses "Vista previa"), aquí aparecerá el registro exacto de sus preguntas.</p>
          </div>
        ` : `
          <div class="t3d-rand-dist-table-wrap">
            <table class="t3d-rand-dist-table">
              <thead>
                <tr>
                  <th>Estudiante</th>
                  <th>Sala / PIN</th>
                  <th>Fecha y Hora</th>
                  <th>Preguntas asignadas (en orden exacto)</th>
                </tr>
              </thead>
              <tbody>
                ${attempts.slice().reverse().map(a => `
                  <tr>
                    <td><strong>👤 ${(a.studentName || 'Estudiante').replace(/</g, '&lt;')}</strong></td>
                    <td><code>${a.pin || 'SOLO'}</code></td>
                    <td>${a.timestamp ? new Date(a.timestamp).toLocaleString() : '—'}</td>
                    <td>
                      <div class="t3d-sim-chips-container">
                        ${(a.questionNumbers || []).map(n => `<span class="t3d-sim-chip t3d-sim-chip-s1">#${n}</span>`).join('')}
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    `;
  },

  renderDistributionRows(rules, existingTopics) {
    if (!Array.isArray(rules) || rules.length === 0) {
      return `
        <tr>
          <td colspan="4" style="text-align:center; padding:1rem; color:#94a3b8; font-size:0.82rem;">
            Pulsa "+ Agregar regla" o crea una nueva temática arriba para definir la distribución.
          </td>
        </tr>
      `;
    }
    const customTopics = Array.isArray(this.draftConfig?.customTopics) ? this.draftConfig.customTopics : [];
    return rules.map((r, idx) => {
      const diff = String(r.difficulty || 'media').toLowerCase();
      const diffCls = diff === 'baja' ? 'is-baja' : (diff === 'alta' ? 'is-alta' : 'is-media');
      const topicOptions = Array.from(new Set([r.topic, ...customTopics, ...existingTopics, 'Programación', 'Bases de Datos', 'Redes', 'General'].filter(Boolean)));
      const isEditingNew = this.creatingTopicRowIdx === idx;
      return `
        <tr>
          <td>
            ${isEditingNew ? `
              <div style="display:flex; align-items:center; gap:0.3rem;">
                <input
                  type="text"
                  id="t3d-inline-topic-input-${idx}"
                  class="t3d-rand-input-sm"
                  placeholder="Nombre de la temática..."
                  autofocus
                  onkeydown="if(event.key==='Enter'){ event.preventDefault(); window.ExamDetailsView.confirmInlineTopic(${idx}); } else if(event.key==='Escape'){ window.ExamDetailsView.cancelInlineTopic(); }"
                />
                <button type="button" class="t3d-btn-details-badge" style="padding:0.28rem 0.5rem; font-size:0.75rem;" title="Guardar temática" onclick="window.ExamDetailsView.confirmInlineTopic(${idx})">✓</button>
                <button type="button" class="t3d-rand-btn-del-rule" title="Cancelar" onclick="window.ExamDetailsView.cancelInlineTopic()">✕</button>
              </div>
            ` : `
              <select class="t3d-rand-input-sm" onchange="window.ExamDetailsView.onRuleChange(${idx}, 'topic', this.value)">
                ${topicOptions.map(t => `<option value="${String(t).replace(/"/g, '&quot;')}" ${t === r.topic ? 'selected' : ''}>${t}</option>`).join('')}
                <option value="__CREATE_NEW__">➕ Crear nueva temática...</option>
              </select>
            `}
          </td>
          <td>
            <select class="t3d-rand-select-diff ${diffCls}" onchange="window.ExamDetailsView.onRuleChange(${idx}, 'difficulty', this.value)">
              <option value="baja" ${diff === 'baja' ? 'selected' : ''}>Baja</option>
              <option value="media" ${diff === 'media' ? 'selected' : ''}>Media</option>
              <option value="alta" ${diff === 'alta' ? 'selected' : ''}>Alta</option>
            </select>
          </td>
          <td>
            <input type="number" class="t3d-rand-input-sm" min="1" max="100" value="${parseInt(r.count, 10) || 1}" onchange="window.ExamDetailsView.onRuleChange(${idx}, 'count', parseInt(this.value, 10) || 1)" />
          </td>
          <td style="text-align:center;">
            <button type="button" class="t3d-rand-btn-del-rule" title="Eliminar regla" onclick="window.ExamDetailsView.removeDistributionRule(${idx})">🗑️</button>
          </td>
        </tr>
      `;
    }).join('');
  },

  onMetaChange(field, value) {
    if (!this.draftMeta) return;
    this.draftMeta[field] = value;
    this.markDirty();
  },

  onQuestionMetaChange(qIdx, field, value) {
    if (!this.activeExam?.questions?.[qIdx]) return;
    this.activeExam.questions[qIdx][field] = value;
    this.markDirty();
    if (field === 'difficulty') this.render();
  },

  toggleMandatoryDirect(qKey) {
    const set = new Set((this.draftConfig.mandatoryQuestionIds || []).map(String));
    if (set.has(String(qKey))) set.delete(String(qKey));
    else set.add(String(qKey));
    this.draftConfig.mandatoryQuestionIds = Array.from(set);
    this.markDirty();
    this.render();
  },

  onConfigChange(field, value) {
    if (!this.draftConfig) return;
    const effTotal = this.getEffectiveTotal();
    if (field === 'questionsPerStudent') {
      let n = parseInt(value, 10) || 1;
      if (n < 1) n = 1;
      if (effTotal > 0 && n > effTotal) n = effTotal;
      this.draftConfig.questionsPerStudent = n;
    } else {
      this.draftConfig[field] = value;
      if (field === 'distributionEnabled' && value && (!this.draftConfig.distributionRules || this.draftConfig.distributionRules.length === 0)) {
        this.draftConfig.distributionRules = [{ topic: this.activeExam?.categoryName || 'General', difficulty: 'media', count: 2 }];
      }
    }
    this.markDirty();
    this.render();
  },

  addDistributionRule() {
    if (!this.draftConfig) return;
    if (!Array.isArray(this.draftConfig.distributionRules)) this.draftConfig.distributionRules = [];
    const topics = ['Programación', 'Bases de Datos', 'Redes', this.activeExam?.categoryName || 'General'];
    const diffs = ['media', 'alta', 'baja'];
    const i = this.draftConfig.distributionRules.length;
    this.draftConfig.distributionRules.push({
      topic: topics[i % topics.length],
      difficulty: diffs[i % diffs.length],
      count: 2
    });
    this.markDirty();
    this.render();
  },

  removeDistributionRule(idx) {
    if (!Array.isArray(this.draftConfig?.distributionRules)) return;
    this.draftConfig.distributionRules.splice(idx, 1);
    this.markDirty();
    this.render();
  },

  onRuleChange(idx, field, value) {
    if (!this.draftConfig?.distributionRules?.[idx]) return;
    if (field === 'topic' && value === '__CREATE_NEW__') {
      this.creatingTopicRowIdx = idx;
      this.render();
      setTimeout(() => {
        const inp = document.getElementById(`t3d-inline-topic-input-${idx}`);
        if (inp) inp.focus();
      }, 30);
      return;
    }
    this.draftConfig.distributionRules[idx][field] = value;
    this.markDirty();
    this.render();
  },

  createCustomTopicFromBar() {
    const inp = document.getElementById('t3d-new-topic-input');
    const name = (inp?.value || '').trim();
    if (!name) {
      this.showToast('⚠️ Escribe el nombre de la nueva temática.', true);
      if (inp) inp.focus();
      return;
    }
    if (!Array.isArray(this.draftConfig.customTopics)) this.draftConfig.customTopics = [];
    if (!this.draftConfig.customTopics.some(t => t.toLowerCase() === name.toLowerCase())) {
      this.draftConfig.customTopics.unshift(name);
    }
    if (!Array.isArray(this.draftConfig.distributionRules)) this.draftConfig.distributionRules = [];
    this.draftConfig.distributionRules.push({
      topic: name,
      difficulty: 'media',
      count: 2
    });
    this.markDirty();
    this.render();
    this.showToast(`✅ Temática "${name}" creada y agregada.`);
  },

  confirmInlineTopic(idx) {
    const inp = document.getElementById(`t3d-inline-topic-input-${idx}`);
    const name = (inp?.value || '').trim();
    if (!name) {
      this.showToast('⚠️ Escribe un nombre para la temática.', true);
      if (inp) inp.focus();
      return;
    }
    if (!Array.isArray(this.draftConfig.customTopics)) this.draftConfig.customTopics = [];
    if (!this.draftConfig.customTopics.some(t => t.toLowerCase() === name.toLowerCase())) {
      this.draftConfig.customTopics.unshift(name);
    }
    if (this.draftConfig.distributionRules?.[idx]) {
      this.draftConfig.distributionRules[idx].topic = name;
    }
    this.creatingTopicRowIdx = null;
    this.markDirty();
    this.render();
    this.showToast(`✅ Temática "${name}" creada.`);
  },

  cancelInlineTopic() {
    this.creatingTopicRowIdx = null;
    this.render();
  },

  openMandatoryModal() {
    const exam = this.activeExam;
    const cfg = this.draftConfig;
    const modal = document.getElementById('teacher-mandatory-modal');
    const list = document.getElementById('teacher-mandatory-list');
    if (!exam || !cfg || !modal || !list) return;

    const questions = Array.isArray(exam.questions) ? exam.questions : [];
    const selectedSet = new Set((cfg.mandatoryQuestionIds || []).map(String));

    if (questions.length === 0) {
      list.innerHTML = `<p style="text-align:center; color:#94a3b8; padding:1.5rem;">Este examen aún no tiene preguntas en su banco.</p>`;
    } else {
      list.innerHTML = questions.map((q, idx) => {
        const qKey = String(q.id || idx);
        const checked = selectedSet.has(qKey);
        const text = (q.text || q.question || `Pregunta #${idx + 1}`).replace(/</g, '&lt;');
        return `
          <label style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem 0.9rem; border-radius:12px; border:1.5px solid ${checked ? '#7c3aed' : 'rgba(148,163,184,0.3)'}; background:${checked ? 'rgba(124,58,237,0.08)' : 'transparent'}; cursor:pointer;">
            <input type="checkbox" ${checked ? 'checked' : ''} style="margin-top:0.2rem; width:18px; height:18px; accent-color:#7c3aed;" onchange="window.ExamDetailsView.toggleMandatoryInPicker('${qKey.replace(/'/g, "\\'")}', this.checked)" />
            <div style="flex:1;">
              <div style="font-weight:850; font-size:0.86rem;">Pregunta #${idx + 1}</div>
              <div style="font-size:0.82rem; opacity:0.85; line-height:1.35;">${text.slice(0, 150)}${text.length > 150 ? '...' : ''}</div>
            </div>
          </label>
        `;
      }).join('');
    }

    const isDark = document.getElementById('teacher-randomize-modal')?.classList.contains('teacher-theme-dark');
    modal.classList.toggle('teacher-theme-dark', Boolean(isDark));
    modal.style.display = 'flex';
  },

  toggleMandatoryInPicker(qKey, checked) {
    const set = new Set((this.draftConfig.mandatoryQuestionIds || []).map(String));
    if (checked) set.add(String(qKey));
    else set.delete(String(qKey));
    this.draftConfig.mandatoryQuestionIds = Array.from(set);
    this.markDirty();
  },

  closeMandatoryModal() {
    const modal = document.getElementById('teacher-mandatory-modal');
    if (modal) modal.style.display = 'none';
    this.render();
  },

  cryptoRand() {
    try {
      if (window.crypto && typeof window.crypto.getRandomValues === 'function') {
        const b = new Uint32Array(1);
        window.crypto.getRandomValues(b);
        return b[0] / 4294967296;
      }
    } catch (e) {}
    return Math.random();
  },

  strongMix(arr, avoidSame = true) {
    const out = [...arr];
    const n = out.length;
    if (n <= 1) return out;
    const orig = out.join(',');
    for (let pass = 0; pass < 2; pass++) {
      for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(this.cryptoRand() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
    }
    if (avoidSame && out.join(',') === orig) {
      const shift = 1 + Math.floor(this.cryptoRand() * (n - 1));
      return out.map((_, i) => out[(i + shift) % n]);
    }
    return out;
  },

  simulateStudent(total, target, mandatoryNums, cfg, previousOrders) {
    if (total <= 0) return [];
    let best = [];
    let bestScore = Infinity;

    for (let t = 0; t < 24; t++) {
      const picked = [];
      const seen = new Set();
      mandatoryNums.forEach(num => {
        if (num >= 1 && num <= total && !seen.has(num) && picked.length < target) {
          seen.add(num);
          picked.push(num);
        }
      });
      const pool = [];
      for (let i = 1; i <= total; i++) {
        if (!seen.has(i)) pool.push(i);
      }
      const mixedPool = cfg.enabled ? this.strongMix(pool, false) : pool;
      for (let i = 0; i < mixedPool.length && picked.length < target; i++) {
        picked.push(mixedPool[i]);
      }

      const finalOrder = cfg.shuffleQuestions
        ? this.strongMix(picked, true)
        : [...picked].sort((a, b) => a - b);

      // Evaluar dispersión respecto a estudiantes previos (mínimas coincidencias posicionales)
      let score = 0;
      const sig = finalOrder.join(',');
      if (cfg.shuffleQuestions && finalOrder.length > 1) {
        finalOrder.forEach((num, idx) => {
          if (num === idx + 1) score += 2;
        });
      }
      previousOrders.forEach(prev => {
        if (prev.join(',') === sig) score += 100;
        const prevSet = new Set(prev);
        finalOrder.forEach((num, idx) => {
          if (prev[idx] === num) score += 8;
          else if (prevSet.has(num)) score += 1;
        });
      });

      if (score < bestScore) {
        bestScore = score;
        best = finalOrder;
        if (score === 0) break;
      }
    }

    previousOrders.push(best);
    return best;
  },

  renderOptionPreviewHtml(shuffleOptions, usedOptSigs) {
    const baseOpts = [
      { id: 0, label: 'Resp. 1 ✓', correct: true },
      { id: 1, label: 'Resp. 2', correct: false },
      { id: 2, label: 'Resp. 3', correct: false },
      { id: 3, label: 'Resp. 4', correct: false }
    ];
    let arr = [...baseOpts];
    if (shuffleOptions) {
      for (let attempt = 0; attempt < 16; attempt++) {
        const cand = this.strongMix(baseOpts, true);
        const sig = cand.map(x => x.id).join(',');
        arr = cand;
        if (!usedOptSigs || !usedOptSigs.has(sig)) {
          if (usedOptSigs) usedOptSigs.add(sig);
          break;
        }
      }
    }
    const letters = ['A', 'B', 'C', 'D'];
    return `<span style="opacity:0.75; margin-right:0.2rem;">Opciones:</span>` + arr.map((o, i) => `
      <span class="t3d-opt-mini-pill ${o.correct ? 'is-correct' : ''}">${letters[i]}) ${o.label}</span>
    `).join('');
  },

  updateSimulationPreview() {
    const cfg = this.draftConfig;
    const exam = this.activeExam;
    if (!cfg || !exam) return;

    const realTotal = Array.isArray(exam.questions) ? exam.questions.length : 0;
    const total = this.getEffectiveTotal();
    const target = cfg.enabled
      ? (this.demoSimMode
          ? Math.min(10, Math.max(1, cfg.questionsPerStudent === 1 && realTotal <= 1 ? 10 : cfg.questionsPerStudent))
          : Math.max(1, Math.min(cfg.questionsPerStudent, Math.max(1, total))))
      : total;

    const bankEl = document.getElementById('t3d-sim-bank-chips');
    const s1El = document.getElementById('t3d-sim-student1-chips');
    const s2El = document.getElementById('t3d-sim-student2-chips');
    const s3El = document.getElementById('t3d-sim-student3-chips');
    const o1El = document.getElementById('t3d-sim-student1-opts');
    const o2El = document.getElementById('t3d-sim-student2-opts');
    const o3El = document.getElementById('t3d-sim-student3-opts');
    if (!bankEl || !s1El || !s2El || !s3El) return;

    if (total === 0) {
      bankEl.innerHTML = `<span style="font-size:0.78rem; color:#94a3b8;">Agrega preguntas al examen o activa el Modo Demo para simular.</span>`;
      s1El.innerHTML = s2El.innerHTML = s3El.innerHTML = `<span style="font-size:0.75rem; opacity:0.65;">Sin preguntas</span>`;
      if (o1El) o1El.innerHTML = o2El.innerHTML = o3El.innerHTML = '';
      return;
    }

    // Identificar números (1-based) de preguntas obligatorias
    const mandatoryIds = new Set((cfg.mandatoryQuestionIds || []).map(String));
    const mandatoryNums = [];
    (exam.questions || []).forEach((q, idx) => {
      if (mandatoryIds.has(String(q.id || idx))) mandatoryNums.push(idx + 1);
    });
    const mandSet = new Set(mandatoryNums);

    let bankHtml = '';
    if (total <= 12) {
      for (let i = 1; i <= total; i++) {
        bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank ${mandSet.has(i) ? 'is-mandatory' : ''}" title="${mandSet.has(i) ? 'Obligatoria' : 'Pregunta #' + i}">${i}</span>`;
      }
    } else {
      for (let i = 1; i <= 5; i++) bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank ${mandSet.has(i) ? 'is-mandatory' : ''}">${i}</span>`;
      bankHtml += `<span style="font-weight:900; color:#94a3b8; padding:0 4px;">...</span>`;
      for (let i = total - 4; i <= total; i++) bankHtml += `<span class="t3d-sim-chip t3d-sim-chip-bank ${mandSet.has(i) ? 'is-mandatory' : ''}">${i}</span>`;
    }
    bankEl.innerHTML = bankHtml;

    const prevOrders = [];
    const r1 = this.simulateStudent(total, target, mandatoryNums, cfg, prevOrders);
    const r2 = this.simulateStudent(total, target, mandatoryNums, cfg, prevOrders);
    const r3 = this.simulateStudent(total, target, mandatoryNums, cfg, prevOrders);

    const mkChips = (arr, cls) => arr.map(n => `<span class="t3d-sim-chip ${cls} ${mandSet.has(n) ? 'is-mandatory' : ''}" title="${mandSet.has(n) ? '📌 Pregunta Obligatoria #' + n : 'Pregunta #' + n}">${n}</span>`).join('');
    s1El.innerHTML = mkChips(r1, 't3d-sim-chip-s1');
    s2El.innerHTML = mkChips(r2, 't3d-sim-chip-s2');
    s3El.innerHTML = mkChips(r3, 't3d-sim-chip-s3');

    const usedOptSigs = new Set();
    if (o1El) o1El.innerHTML = this.renderOptionPreviewHtml(cfg.shuffleOptions, usedOptSigs);
    if (o2El) o2El.innerHTML = this.renderOptionPreviewHtml(cfg.shuffleOptions, usedOptSigs);
    if (o3El) o3El.innerHTML = this.renderOptionPreviewHtml(cfg.shuffleOptions, usedOptSigs);
  },

  async saveAll() {
    const exam = this.activeExam;
    const cfg = this.draftConfig;
    const meta = this.draftMeta;
    if (!exam || !cfg) return;

    const realTotal = Array.isArray(exam.questions) ? exam.questions.length : 0;
    if (cfg.enabled && realTotal > 0) {
      if (cfg.questionsPerStudent > realTotal) {
        cfg.questionsPerStudent = realTotal;
      }
      if ((cfg.mandatoryQuestionIds || []).length > cfg.questionsPerStudent) {
        this.showToast(`⚠️ Tienes ${cfg.mandatoryQuestionIds.length} obligatorias pero el límite es ${cfg.questionsPerStudent}.`, true);
        return;
      }
    }

    const saveBtn = document.getElementById('t3d-examhub-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span>⏳</span><span>Guardando...</span>';
    }

    // Aplicar cambios de metadatos y configuración
    if (meta) {
      if (meta.title && meta.title.trim()) exam.title = meta.title.trim();
      exam.description = meta.description || '';
      exam.categoryName = meta.categoryName || 'General';
      exam.timePerQuestion = typeof meta.timePerQuestion === 'number' ? meta.timePerQuestion : 20;
    }
    exam.randomizationConfig = JSON.parse(JSON.stringify(cfg));
    exam.updatedAt = new Date().toISOString();

    if (window.appState && Array.isArray(window.appState.challenges)) {
      const idx = window.appState.challenges.findIndex(c => c && String(c.id).trim() === String(exam.id).trim());
      if (idx !== -1) {
        window.appState.challenges[idx] = { ...window.appState.challenges[idx], ...exam };
      }
    }

    // Limpiar caché de intentos solo previos para reflejar la nueva configuración
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith(`mentix_rand_attempt_${exam.id}_`)) sessionStorage.removeItem(k);
      });
    } catch (e) {}

    if (typeof saveGlobalState === 'function') saveGlobalState(window.appState);

    let cloudOk = false;
    try {
      const apiBase = window.appRouter && typeof window.appRouter.getApiBase === 'function' ? window.appRouter.getApiBase() : '';
      const res = await fetch(`${apiBase}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challenge: exam })
      });
      cloudOk = res.ok;
    } catch (e) {
      console.warn('Error sincronizando examen en la nube:', e);
    }

    this.isDirty = false;
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = '<span>💾</span><span>Guardar cambios</span>';
    }
    this.render();
    if (window.appRouter?.currentView === 'teacher' && window.TeacherView?.render) window.TeacherView.render(true);
    if (window.appRouter?.currentView === 'admin' && window.AdminView?.render) window.AdminView.render();

    this.showToast(cloudOk ? '✅ ¡Cambios guardados en la nube y localmente!' : '✅ ¡Cambios guardados localmente!');
  },

  previewExam() {
    if (!this.activeExam) return;
    if (!Array.isArray(this.activeExam.questions) || this.activeExam.questions.length === 0) {
      this.showToast('⚠️ Agrega al menos 1 pregunta antes de abrir la vista previa.', true);
      return;
    }
    this.activeExam.randomizationConfig = JSON.parse(JSON.stringify(this.draftConfig));
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith(`mentix_rand_attempt_${this.activeExam.id}_SOLO`)) sessionStorage.removeItem(k);
      });
    } catch (e) {}
    const id = this.activeExam.id;
    this.close();
    if (window.appRouter && typeof window.appRouter.startSinglePlayer === 'function') {
      window.appRouter.startSinglePlayer(id);
    }
  },

  launchRoom(mode) {
    if (!this.activeExam) return;
    this.activeExam.randomizationConfig = JSON.parse(JSON.stringify(this.draftConfig));
    const id = this.activeExam.id;
    this.close();
    if (window.appRouter && typeof window.appRouter.hostRoom === 'function') {
      window.appRouter.hostRoom(id, mode || 'presented');
    }
  },

  openInCreator() {
    if (!this.activeExam) return;
    const id = this.activeExam.id;
    this.close();
    if (window.appRouter && typeof window.appRouter.editChallenge === 'function') {
      window.appRouter.editChallenge(id);
    }
  },

  clearAttempts() {
    if (!this.activeExam) return;
    try {
      localStorage.removeItem(`mentix_exam_attempts_${this.activeExam.id}`);
    } catch (e) {}
    this.render();
    this.showToast('🗑️ Historial local limpiado.');
  }
};
