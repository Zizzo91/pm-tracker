// ─── ICONE ───────────────────────────────────────────────────────────────
// Set minimale in stile SF Symbols (stroke 1.8, terminazioni tonde), inline
// così non servono font-icona né richieste di rete aggiuntive.
const PM_ICONS = {
    sparkles: '<path d="M12 3.2l1.55 4.05 4.05 1.55-4.05 1.55L12 14.4l-1.55-4.05L6.4 8.8l4.05-1.55L12 3.2z"/><path d="M18.6 14.1l.75 1.95 1.95.75-1.95.75-.75 1.95-.75-1.95-1.95-.75 1.95-.75.75-1.95z"/>',
    play: '<path d="M8.5 5.8v12.4a.6.6 0 00.92.5l9.3-6.2a.6.6 0 000-1L9.42 5.3a.6.6 0 00-.92.5z" fill="currentColor" stroke="none"/>',
    stop: '<rect x="7" y="7" width="10" height="10" rx="2.4" fill="currentColor" stroke="none"/>',
    users: '<circle cx="9.2" cy="8.6" r="3.1"/><path d="M3.4 19.2c0-2.9 2.6-4.8 5.8-4.8s5.8 1.9 5.8 4.8"/><path d="M16.2 6.2a2.7 2.7 0 010 5.2"/><path d="M17.4 14.9c2 .5 3.2 2 3.2 4.3"/>',
    briefcase: '<rect x="3.2" y="7.4" width="17.6" height="12.2" rx="2.6"/><path d="M9 7.4V5.8A1.8 1.8 0 0110.8 4h2.4A1.8 1.8 0 0115 5.8v1.6"/><path d="M3.2 12.4h17.6"/>',
    flask: '<path d="M9.6 3.2h4.8"/><path d="M10.4 3.2v5.1L5.7 17.4A2.3 2.3 0 007.8 20.8h8.4a2.3 2.3 0 002.1-3.4L13.6 8.3V3.2"/><path d="M7.6 14.4h8.8"/>',
    arrowUpRight: '<path d="M7.2 16.8L16.8 7.2"/><path d="M9.2 7.2h7.6v7.6"/>',
    trayDown: '<path d="M12 3.4v9.8"/><path d="M8.4 9.6L12 13.2l3.6-3.6"/><path d="M4.2 15.2v2.6a2.6 2.6 0 002.6 2.6h10.4a2.6 2.6 0 002.6-2.6v-2.6"/>',
    gear: '<circle cx="12" cy="12" r="3.1"/><path d="M19.4 15a1.7 1.7 0 00.34 1.87l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.7 1.7 0 00-1.87-.34 1.7 1.7 0 00-1.03 1.56V21a2 2 0 11-4 0v-.09a1.7 1.7 0 00-1.11-1.56 1.7 1.7 0 00-1.87.34l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.7 1.7 0 00.34-1.87 1.7 1.7 0 00-1.56-1.03H3a2 2 0 110-4h.09A1.7 1.7 0 004.65 8.8a1.7 1.7 0 00-.34-1.87l-.06-.06a2 2 0 112.83-2.83l.06.06a1.7 1.7 0 001.87.34H9a1.7 1.7 0 001.03-1.56V3a2 2 0 114 0v.09a1.7 1.7 0 001.03 1.56 1.7 1.7 0 001.87-.34l.06-.06a2 2 0 112.83 2.83l-.06.06a1.7 1.7 0 00-.34 1.87V9a1.7 1.7 0 001.56 1.03H21a2 2 0 110 4h-.09a1.7 1.7 0 00-1.51 1.03z"/>',
    star: '<path d="M12 3.6l2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.8-5.2 2.8 1-5.8-4.2-4.1 5.8-.8z" fill="currentColor" stroke="none"/>',
    rocket: '<path d="M12.4 3.6c3.3.5 6 3.2 6.5 6.5.4 2.6-.6 5-1.9 6.3-1.3 1.3-3.7 2.3-6.3 1.9-3.3-.5-6-3.2-6.5-6.5C3.8 9.2 4.8 6.8 6.1 5.5c1.3-1.3 3.7-2.3 6.3-1.9z"/><circle cx="12" cy="12" r="2.4"/><path d="M8 16l-3.4 3.4"/><path d="M6.6 6.6L3.2 3.2"/>',
    refresh: '<path d="M20.2 12a8.2 8.2 0 11-2.4-5.8"/><path d="M20.2 4.6v5.2h-5.2"/>',

    list: '<path d="M4 6.6h16"/><path d="M4 12h16"/><path d="M4 17.4h11"/>',
    gantt: '<path d="M3.6 6.8h7.2"/><path d="M3.6 12h12.4"/><path d="M3.6 17.2h9.4"/>',
    calendar: '<rect x="3.4" y="5.2" width="17.2" height="15.4" rx="3.2"/><path d="M3.4 9.8h17.2"/><path d="M8 3.4v3.2"/><path d="M16 3.4v3.2"/>',
    lock: '<rect x="4.4" y="10.4" width="15.2" height="10.2" rx="3.2"/><path d="M8.2 10.4V7.8a3.8 3.8 0 017.6 0v2.6"/>',
    person: '<circle cx="12" cy="8.4" r="3.6"/><path d="M4.8 20.2c0-3.4 3.2-5.6 7.2-5.6s7.2 2.2 7.2 5.6"/>',
    pencil: '<path d="M4.4 19.6h4.2L19.8 8.4a2.1 2.1 0 000-3l-1.2-1.2a2.1 2.1 0 00-3 0L4.4 15.4v4.2z"/><path d="M14.4 5.4l4.2 4.2"/>',
    trash: '<path d="M4.6 7.2h14.8"/><path d="M9.2 7.2V5.4a1.6 1.6 0 011.6-1.6h2.4a1.6 1.6 0 011.6 1.6v1.8"/><path d="M6.6 7.2l.8 11.6a2 2 0 002 1.8h5.2a2 2 0 002-1.8l.8-11.6"/>',
    eyeOff: '<path d="M4 4l16 16"/><path d="M10.6 6.6A9 9 0 0112 6.5c5 0 8.5 4 9.4 5.5a12 12 0 01-2.3 3"/><path d="M6.4 8.3A12.6 12.6 0 002.6 12c.9 1.5 4.4 5.5 9.4 5.5 1.3 0 2.5-.3 3.6-.7"/><path d="M9.9 9.9a3 3 0 004.2 4.2"/>',
    eye: '<path d="M2.6 12C3.5 10.5 7 6.5 12 6.5s8.5 4 9.4 5.5c-.9 1.5-4.4 5.5-9.4 5.5S3.5 13.5 2.6 12z"/><circle cx="12" cy="12" r="3"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 6.5"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="M8 12.3l2.8 2.8L16.2 9.6"/>',
    clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.4V12l3.2 2"/>',
    link: '<path d="M10.2 13.8a3.6 3.6 0 005.1 0l2.6-2.6a3.6 3.6 0 00-5.1-5.1L11.6 7.2"/><path d="M13.8 10.2a3.6 3.6 0 00-5.1 0l-2.6 2.6a3.6 3.6 0 005.1 5.1l1.2-1.1"/>',
    timer: '<circle cx="12" cy="13.4" r="7.4"/><path d="M12 9.8v3.9l2.4 1.5"/><path d="M9.4 3.4h5.2"/>',
    euro: '<path d="M16.6 6.2a6.4 6.4 0 100 11.6"/><path d="M4.6 10.4h8"/><path d="M4.6 13.6h8"/>',
    more: '<circle cx="12" cy="5.6" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="18.4" r="1.5" fill="currentColor" stroke="none"/>',
    sliders: '<path d="M4 7.2h6"/><path d="M14 7.2h6"/><circle cx="12" cy="7.2" r="2"/><path d="M4 16.8h9"/><path d="M17 16.8h3"/><circle cx="15" cy="16.8" r="2"/>',
    plus: '<path d="M12 5.4v13.2"/><path d="M5.4 12h13.2"/>',
    logout: '<path d="M15 8.2V6.4a2 2 0 00-2-2H6.4a2 2 0 00-2 2v11.2a2 2 0 002 2H13a2 2 0 002-2v-1.8"/><path d="M10 12h10"/><path d="M17 8.8L20.2 12 17 15.2"/>',
    halfCircle: '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4a8.6 8.6 0 000 17.2z" fill="currentColor" stroke="none"/>',
    archive: '<rect x="3.4" y="4.4" width="17.2" height="4.6" rx="1.8"/><path d="M4.8 9v8.4a2.2 2.2 0 002.2 2.2h10a2.2 2.2 0 002.2-2.2V9"/><path d="M10 13.2h4"/>',
    alert: '<path d="M12 4.2l8.4 15H3.6l8.4-15z"/><path d="M12 9.6v4"/><circle cx="12" cy="16.4" r=".9" fill="currentColor" stroke="none"/>',
    bell: '<path d="M18 8.4a6 6 0 10-12 0c0 5-2.2 6.6-2.2 6.6h16.4S18 13.4 18 8.4z"/><path d="M10.2 19.2a2 2 0 003.6 0"/>',
    info: '<circle cx="12" cy="12" r="8.8"/><path d="M12 11v5.2"/><circle cx="12" cy="8" r="1" fill="currentColor" stroke="none"/>',
    close: '<path d="M6.6 6.6l10.8 10.8"/><path d="M17.4 6.6L6.6 17.4"/>'
};

const app = {
    data: [],
    // Backup GitHub opzionale (disattivo di default): i dati vivono su Supabase.
    config: { owner: '', repo: '', token: '', path: 'data/projects.json', enabled: false },
    sb: null,               // client Supabase
    serverUpdatedAt: null,  // updated_at dell'ultima riga letta/scritta (controllo conflitti)
    userEmail: '',          // email dell'utente loggato (per il modal Impostazioni)
    sha: null,
    lastETag: null,
    searchTimeout: null,
    editorModal: null,
    settingsModal: null,
    loginModal: null,
    _fornitoriSelected: [],

    // Fornitori proposti nel menu "Nuovo Progetto" (uniti a quelli già presenti nei dati)
    FORNITORI_PRESET: ['Engineering', 'Accenture'],
    MAX_JIRA_LINKS: 10,
    MAX_CUSTOM_MILESTONES: 5,
    META_ID: '__pm_tracker_meta__',
    _editingReminderId: null,
    _highlightsObserver: null,

    ALWAYS_HIGHLIGHT_KEYS: ['devStart', 'devEnd', 'dataTest'],

    MILESTONES: [
        { key: 'dataIA',            label: 'Consegna IA',           badge: 'bg-info text-dark' },
        { key: 'devStart',          label: 'Inizio Sviluppo',        badge: 'bg-primary' },
        { key: 'devEnd',            label: 'Fine Sviluppo',          badge: 'bg-secondary' },
        { key: 'dataUAT',           label: 'UAT',                    badge: 'bg-info' },
        { key: 'dataBS',            label: 'Business Simulation',    badge: 'bg-dark' },
        { key: 'dataTest',          label: 'Rilascio Test',          badge: 'bg-warning text-dark' },
        { key: 'dataProd',          label: 'Rilascio Prod',          badge: 'bg-success' },
        { key: 'dataScadenzaStima', label: 'Scad. Stima Fornitore', badge: 'bg-light text-dark border' },
        { key: 'dataConfigSistema', label: 'Config Sistema',         badge: 'bg-light text-dark border' }
    ],

    // ─── HELPERS GENERICI ────────────────────────────────────────────────────

    get _today() {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    },

    _getVal: function(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    },

    _setVal: function(id, value) {
        const el = document.getElementById(id);
        if (el) el.value = value ?? '';
    },

    _getChecked: function(id) {
        const el = document.getElementById(id);
        return el ? el.checked : false;
    },

    // Icona SVG inline (set PM_ICONS). Sempre decorativa: aria-hidden.
    _icon: function(name, cls) {
        const body = PM_ICONS[name];
        if (!body) return '';
        return `<svg class="pm-icon${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
    },

    _populateFilterSelects: function(ids, values, currentValues = {}) {
        ids.forEach(id => {
            const sel = document.getElementById(id);
            if (!sel) return;
            const cur = currentValues[id] !== undefined ? currentValues[id] : sel.value;
            while (sel.options.length > 1) sel.remove(1);
            values.forEach(v => {
                const opt = document.createElement('option');
                opt.value = opt.textContent = v;
                sel.appendChild(opt);
            });
            if (cur && values.includes(cur)) sel.value = cur;
        });
    },

    _updateDynamicBtn: function(btnEl, count, max, labelNormal, labelLimit) {
        if (!btnEl) return;
        btnEl.disabled = count >= max;
        btnEl.textContent = count >= max ? labelLimit : labelNormal;
    },

    // ─── INIT ────────────────────────────────────────────────────────────────

    init: function() {
        try {
            this.editorModal   = new bootstrap.Modal(document.getElementById('editorModal'));
            this.settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));
            this.loginModal    = new bootstrap.Modal(document.getElementById('loginModal'));
            const remEl = document.getElementById('remindersOffcanvas');
            this.remindersOffcanvas = remEl ? new bootstrap.Offcanvas(remEl) : null;
            const agendaEl = document.getElementById('agendaOffcanvas');
            this.agendaOffcanvas = agendaEl ? new bootstrap.Offcanvas(agendaEl) : null;

            ['p_stimaGgu', 'p_rcFornitore'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', () => this.calcCosto());
            });

            this.initExternalLinks();
            this._initTheme();
            let compact = false, zoom = 'month';
            try {
                compact = localStorage.getItem('pm-table-compact') === '1';
                zoom = localStorage.getItem('pm-gantt-zoom') === 'week' ? 'week' : 'month';
            } catch (e) {}
            this._setTableCompact(compact, false);
            this._setVal('ganttZoomSelect', zoom);

            const savedCfg = localStorage.getItem('pm_tracker_config');
            if (savedCfg) {
                try { this.config = { ...this.config, ...JSON.parse(savedCfg) }; } catch (e) { console.warn('config non valida, ignorata'); }
            }

            this.initSupabase();
        } catch (err) {
            console.error(err);
            this.showAlert(`Errore critico avvio: ${err.message}`, 'danger');
        }
    },

    // ─── SUPABASE: CLIENT, SESSIONE, LOGIN ───────────────────────────────────

    initSupabase: async function() {
        const cfg = window.SUPABASE_CONFIG;
        if (!cfg || !window.supabase) {
            this.showAlert('Libreria Supabase non caricata (connessione assente?). Ricarica la pagina.', 'danger', 8000);
            return;
        }
        try {
            this.sb = window.supabase.createClient(cfg.url, cfg.anonKey, {
                db: { schema: cfg.schema || 'pmtracker' },
                auth: { persistSession: true, autoRefreshToken: true }
            });
            const { data } = await this.sb.auth.getSession();
            if (data && data.session) {
                this.userEmail = (data.session.user && data.session.user.email) || '';
                await this.loadData();
            } else {
                this.showLogin();
            }
        } catch (e) {
            console.error('initSupabase:', e);
            this.showLogin();
        }
    },

    showLogin: function() {
        const errEl = document.getElementById('loginError');
        if (errEl) { errEl.textContent = ''; errEl.style.display = 'none'; }
        this._setVal('loginPin', '');
        if (this.loginModal) this.loginModal.show();
        setTimeout(() => { const el = document.getElementById('loginPin'); if (el) el.focus(); }, 400);
    },

    doLogin: async function() {
        const pin   = (this._getVal('loginPin') || '').trim();
        const errEl = document.getElementById('loginError');
        const btn   = document.getElementById('loginBtn');
        const fail  = msg => { if (errEl) { errEl.textContent = msg; errEl.style.display = 'block'; } };

        if (!/^\d{4,8}$/.test(pin)) { fail('Inserisci il PIN numerico (6 cifre).'); return; }
        if (!this.sb) { fail('Client Supabase non inizializzato. Ricarica la pagina.'); return; }

        try {
            if (btn) { btn.disabled = true; btn.textContent = 'Accesso…'; }
            const { data, error } = await this.sb.auth.signInWithPassword({
                email: window.SUPABASE_CONFIG.pinEmail,
                password: pin
            });
            if (error) { fail('PIN errato o account non disponibile.'); return; }
            this.userEmail = (data && data.user && data.user.email) || '';
            if (errEl) errEl.style.display = 'none';
            if (this.loginModal) this.loginModal.hide();
            await this.loadData();
        } catch (e) {
            fail(`Errore di accesso: ${e.message}`);
        } finally {
            if (btn) { btn.disabled = false; btn.textContent = 'Entra'; }
        }
    },

    logout: async function() {
        if (!confirm('Vuoi uscire? Dovrai reinserire il PIN per rientrare.')) return;
        try { if (this.sb) await this.sb.auth.signOut(); } catch (e) { console.error(e); }
        this.data = [];
        this.serverUpdatedAt = null;
        this.sha = null;
        this.userEmail = '';
        if (this.settingsModal) this.settingsModal.hide();
        const tbody = document.getElementById('projectsTableBody'); if (tbody) tbody.innerHTML = '';
        const gantt = document.getElementById('gantt-chart');        if (gantt) gantt.innerHTML = '';
        const cal   = document.getElementById('calendarContainer');  if (cal)   cal.innerHTML = '';
        this.showLogin();
    },

    initExternalLinks: function() {
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#') || href.startsWith('javascript') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
            if (href.startsWith('http://') || href.startsWith('https://')) {
                link.addEventListener('click', e => {
                    e.preventDefault();
                    window.open(href, '_system');
                });
            }
        });
    },

    debouncedRenderTable: function() {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.renderTable(), 300);
    },

    // La ricerca globale filtra Elenco, Gantt e Calendario insieme.
    debouncedRenderAll: function() {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.renderAll(), 250);
    },

    // Filtri applicati in contemporanea alle tre viste.
    _globalFilters: function() {
        return {
            search:    (this._getVal('globalSearchInput') || '').trim().toLowerCase(),
            fornitore: this._getVal('globalFornitoreFilter'),
            showHidden: this._getChecked('globalShowHidden')
        };
    },

    _matchesGlobalFilters: function(p, f) {
        if (!f.showHidden && this.isHiddenForUI(p)) return false;
        if (f.fornitore && !(p.fornitori || []).includes(f.fornitore)) return false;
        if (f.search && !(p.nome || '').toLowerCase().includes(f.search)) return false;
        return true;
    },

    resetGlobalFilters: function() {
        this._setVal('globalFornitoreFilter', '');
        this._setVal('globalSearchInput', '');
        const hidden = document.getElementById('globalShowHidden');
        if (hidden) hidden.checked = false;

        // Filtri specifici delle singole viste: azzerati anche loro, così
        // "Reset filtri" riporta davvero tutto allo stato iniziale.
        this._setVal('ganttDataTestFilter', '');
        this._setVal('ganttDataProdFilter', '');
        this._setVal('calendarMilestoneFilter', '');
        const calHidden = document.getElementById('calShowHiddenPrefs');
        if (calHidden) calHidden.checked = false;
        if (typeof updateCalFilterBadge === 'function') updateCalFilterBadge();

        this.renderAll();
    },

    scrollToToday: function() {
        const scroll = () => {
            const todayKey = dayjs().format('YYYY-MM');
            const monthCard = document.querySelector(`[data-month="${todayKey}"]`);
            if (monthCard) {
                monthCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                this.showAlert('Nessun evento nel mese corrente.', 'info', 2500);
            }
        };
        const tabBtn = document.getElementById('calendar-tab');
        if (tabBtn && !tabBtn.classList.contains('active')) {
            bootstrap.Tab.getOrCreateInstance(tabBtn).show();
            setTimeout(scroll, 260);   // attende la transizione del tab
        } else {
            scroll();
        }
    },

    // ─── SEZIONE PROMEMORIA (offcanvas) / CALENDARIO ─────────────────────────
    // I promemoria personali vivono in un pannello laterale separato dal
    // calendario rilasci: nessuna commistione con le milestone.

    // ─── STICKY HIGHLIGHTS OBSERVER ──────────────────────────────────────────

    _initHighlightsSticky: function() {
        if (this._highlightsObserver) {
            this._highlightsObserver.disconnect();
            this._highlightsObserver = null;
        }
        const wrapper = document.querySelector('.cal-highlights-wrapper');
        if (!wrapper) return;
        // Sentinel: elemento 1px sopra il wrapper; quando esce dal viewport il wrapper è "incollato"
        const sentinel = document.createElement('div');
        sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;';
        wrapper.parentNode.insertBefore(sentinel, wrapper);
        this._highlightsObserver = new IntersectionObserver(
            ([entry]) => wrapper.classList.toggle('is-stuck', !entry.isIntersecting),
            { threshold: 0 }
        );
        this._highlightsObserver.observe(sentinel);
    },

    // ─── META / DATI ────────────────────────────────────────────────────────

    isMeta: function(p) {
        return !!p && (p.type === 'meta' || p.id === this.META_ID);
    },

    getMeta: function() {
        let meta = this.data.find(p => this.isMeta(p));
        if (!meta) {
            meta = { id: this.META_ID, type: 'meta', manualReminders: [], eventPrefs: {} };
            this.data.push(meta);
        }
        if (!Array.isArray(meta.manualReminders)) meta.manualReminders = [];
        if (!meta.eventPrefs) meta.eventPrefs = {};
        return meta;
    },

    getProjectsOnly: function() {
        return (this.data || []).filter(p => !this.isMeta(p));
    },

    csvToArray: function(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(s => (s || '').toString().trim()).filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    },

    normalizeProject: function(p) {
        if (p && (p.type === 'meta' || p.id === this.META_ID)) {
            return { ...p, id: p.id || this.META_ID, type: 'meta',
                manualReminders: Array.isArray(p.manualReminders) ? p.manualReminders : [],
                eventPrefs: p.eventPrefs || {} };
        }
        // `owners` non è più usato dall'interfaccia: se un vecchio record lo
        // contiene viene conservato com'è (nessun errore, nessuna perdita dati).
        return { ...p,
            owners:           this.csvToArray(p.owners || p.owner),
            fornitori:        this.csvToArray(p.fornitori),
            jiraLinks:        this._normalizeJiraLinks(
                                  Array.isArray(p.jiraLinks) && p.jiraLinks.length
                                      ? p.jiraLinks
                                      : (p.jira ? [p.jira] : [])
                              ),
            customMilestones: Array.isArray(p.customMilestones) ? p.customMilestones : [],
            progress:         p.progress != null ? p.progress : null,
            hidden:           !!p.hidden
        };
    },

    isAutoStale: function(p) {
        try {
            if (!p || this.isMeta(p) || p.hidden) return false;
            if (!p.dataProd || p.dataProd.trim() === '') return false;
            const prodDate = new Date(p.dataProd);
            if (isNaN(prodDate.getTime())) return false;
            const today = this._today;
            const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return prodDate < oneMonthAgo;
        } catch (e) { console.error('Errore in isAutoStale:', e); return false; }
    },

    isHiddenForUI: function(p) {
        if (!p || this.isMeta(p)) return true;
        return p.hidden || this.isAutoStale(p);
    },

    // ─── COLOR / BADGE ───────────────────────────────────────────────────────

    _hashString: function(str) {
        const s = (str || '').toString().trim().toLowerCase();
        let h = 0;
        for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
        return Math.abs(h);
    },

    _autoColor: function(name, kind) {
        const hue = this._hashString(`${kind}:${name}`) % 360;
        return { bg: `hsl(${hue}, 65%, 45%)`, fg: '#ffffff' };
    },

    _badgeColor: function(kind, name) {
        return this._autoColor(name, kind);
    },

    _badgeStyle: function(kind, name) {
        const c = this._badgeColor(kind, name);
        return `background: ${c.bg} !important; color: ${c.fg} !important; border: 1px solid rgba(0,0,0,0.12);`;
    },

    _projectColors: function(name) {
        if (!name) return { bg: '#ffffff', border: '#dee2e6', barBg: '#0071eb', barBorder: '#0071eb' };
        const palette = [
            { bg: '#eef2ff', border: '#0d6efd', barBg: '#0071eb', barBorder: '#0071eb' },
            { bg: '#f4f0ff', border: '#6f42c1', barBg: '#7c5cff', barBorder: '#7c5cff' },
            { bg: '#fdf8f5', border: '#c27b5e', barBg: '#0fb5a5', barBorder: '#0fb5a5' },
            { bg: '#f0fdf4', border: '#198754', barBg: '#17a34a', barBorder: '#17a34a' },
            { bg: '#fff6f0', border: '#fd7e14', barBg: '#f59e0b', barBorder: '#f59e0b' },
            { bg: '#fff0f6', border: '#d63384', barBg: '#e0447c', barBorder: '#e0447c' },
            { bg: '#f0fbff', border: '#0dcaf0', barBg: '#06a9c7', barBorder: '#06a9c7' },
            { bg: '#fff5f5', border: '#dc3545', barBg: '#e5484d', barBorder: '#e5484d' },
            { bg: '#fffbea', border: '#cfa00c', barBg: '#e8b102', barBorder: '#e8b102' },
            { bg: '#f4f5fd', border: '#6610f2', barBg: '#6d4aff', barBorder: '#6d4aff' },
            { bg: '#f2fbf7', border: '#20c997', barBg: '#12b886', barBorder: '#12b886' },
            { bg: '#fcf3f4', border: '#9e2a2b', barBg: '#b0392e', barBorder: '#b0392e' },
            { bg: '#fbf7f4', border: '#8b4513', barBg: '#5b6b7c', barBorder: '#5b6b7c' },
            { bg: '#fcf0f8', border: '#8f2d56', barBg: '#a4246f', barBorder: '#a4246f' },
            { bg: '#f2f9f9', border: '#127369', barBg: '#0e7c86', barBorder: '#0e7c86' },
        ];
        return palette[this._hashString(`fixed_palette_${name}`) % palette.length];
    },

    _badgeSpan: function(kind, name, className) {
        const safeName = (name ?? '').toString();
        return `<span class="${className}" style="${this._badgeStyle(kind, safeName)}">${this._escapeHtml(safeName)}</span>`;
    },

    // ─── CUSTOM MILESTONES MODAL ─────────────────────────────────────────────

    renderCustomMilestoneFields: function(milestones) {
        const container = document.getElementById('customMilestonesContainer');
        container.innerHTML = '';
        (milestones || []).forEach((m, i) => this._appendDynamicField('milestone', m.label, m.date, i));
        this._refreshDynamicBtn('milestone');
    },

    addCustomMilestone: function() {
        const count = document.getElementById('customMilestonesContainer').querySelectorAll('.custom-milestone-row').length;
        if (count >= this.MAX_CUSTOM_MILESTONES) return;
        this._appendDynamicField('milestone', '', '', count);
        this._refreshDynamicBtn('milestone');
    },

    removeCustomMilestone: function(btn) {
        btn.closest('.custom-milestone-row').remove();
        this._refreshDynamicBtn('milestone');
    },

    _getCustomMilestonesFromModal: function() {
        return Array.from(document.querySelectorAll('.custom-milestone-row'))
            .map(row => ({ label: row.querySelector('.custom-ms-label').value.trim(), date: row.querySelector('.custom-ms-date').value }))
            .filter(m => m.label && m.date);
    },

    // ─── JIRA LINKS MODAL (gerarchia epica → storie) ─────────────────────────

    // Forma canonica:
    //   jiraLinks: [{ url, type: 'epic'|'story'|'link', parent: url|null }]
    // I record storici avevano un array di sole URL (o il campo singolo `jira`):
    // vengono convertiti al volo in { url, type:'link' } senza perdere nulla.
    _normalizeJiraLinks: function(links) {
        if (!Array.isArray(links)) return [];
        return links.map(item => {
            if (typeof item === 'string') {
                const url = item.trim();
                return url ? { url, type: 'link', parent: null } : null;
            }
            if (item && typeof item === 'object') {
                const url = (item.url || '').toString().trim();
                if (!url) return null;
                const type = ['epic', 'story', 'link'].includes(item.type) ? item.type : 'link';
                return { url, type, parent: type === 'story' && item.parent ? String(item.parent) : null };
            }
            return null;
        }).filter(Boolean);
    },

    jiraLinksOf: function(p) {
        if (!p) return [];
        const list = this._normalizeJiraLinks(p.jiraLinks || []);
        if (list.length) return list;
        return p.jira ? this._normalizeJiraLinks([p.jira]) : [];
    },

    renderJiraFields: function(links) {
        const container = document.getElementById('jiraLinksContainer');
        if (!container) return;
        container.innerHTML = '';
        const items = this._normalizeJiraLinks(links);
        (items.length ? items : [{ url: '', type: 'link', parent: null }])
            .forEach((item, i) => this._appendJiraRow(item, i));
        this._refreshJiraParents();
        this._refreshDynamicBtn('jira');
    },

    _appendJiraRow: function(item, index) {
        const container = document.getElementById('jiraLinksContainer');
        if (!container) return;
        const wrap = document.createElement('div');
        wrap.className = 'jira-row';
        wrap.dataset.jiraIndex = index;
        wrap.dataset.prevUrl = item.url || '';
        wrap.innerHTML = `
            <select class="form-select form-select-sm jira-type-select" onchange="app.onJiraTypeChange(this)" title="Tipo di riferimento Jira" aria-label="Tipo di riferimento Jira">
                <option value="link">Link</option>
                <option value="epic">Epica</option>
                <option value="story">Storia</option>
            </select>
            <input type="url" class="form-control form-control-sm jira-link-input" placeholder="https://…" value="${this._escapeAttr(item.url || '')}" oninput="app.onJiraUrlInput(this)">
            <select class="form-select form-select-sm jira-parent-select" onchange="app.onJiraParentChange(this)" title="Epica di riferimento" aria-label="Epica di riferimento"></select>
            <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeJiraField(this)" title="Rimuovi">&times;</button>`;
        wrap.querySelector('.jira-type-select').value = item.type || 'link';
        wrap.querySelector('.jira-parent-select').dataset.pending = item.parent || '';
        container.appendChild(wrap);
    },

    addJiraField: function() {
        const count = document.querySelectorAll('#jiraLinksContainer .jira-row').length;
        if (count >= this.MAX_JIRA_LINKS) return;
        this._appendJiraRow({ url: '', type: 'link', parent: null }, count);
        this._refreshJiraParents();
        this._refreshDynamicBtn('jira');
    },

    removeJiraField: function(btn) {
        const row = btn.closest('.jira-row');
        if (row) row.remove();
        this._refreshJiraParents();
        this._refreshDynamicBtn('jira');
    },

    onJiraTypeChange: function(sel) {
        const row = sel.closest('.jira-row');
        if (row) this._syncJiraRow(row);
        this._refreshJiraParents();
    },

    // Se cambia l'URL di un'epica, le storie collegate la seguono.
    onJiraUrlInput: function(input) {
        const row = input.closest('.jira-row');
        if (!row) return;
        if (row.querySelector('.jira-type-select').value === 'epic') {
            const prev = row.dataset.prevUrl || '';
            const next = input.value.trim();
            if (prev && prev !== next) {
                document.querySelectorAll('#jiraLinksContainer .jira-row').forEach(r => {
                    if (r.querySelector('.jira-type-select').value !== 'story') return;
                    const ps = r.querySelector('.jira-parent-select');
                    if (ps && ps.value === prev) ps.dataset.pending = next;
                });
            }
            row.dataset.prevUrl = next;
        }
        this._refreshJiraParents();
    },

    onJiraParentChange: function() {},

    _syncJiraRow: function(row) {
        const type = row.querySelector('.jira-type-select').value;
        const parentSel = row.querySelector('.jira-parent-select');
        if (!parentSel) return;
        const isStory = type === 'story';
        if (!isStory) {
            if (parentSel.value) parentSel.dataset.pending = parentSel.value;
            parentSel.disabled = true;
            parentSel.innerHTML = '<option value="">Solo per le storie</option>';
            parentSel.value = '';
        } else {
            parentSel.disabled = false;
        }
    },

    _refreshJiraParents: function() {
        const rows = Array.from(document.querySelectorAll('#jiraLinksContainer .jira-row'));
        const epics = rows
            .filter(r => r.querySelector('.jira-type-select').value === 'epic')
            .map(r => r.querySelector('.jira-link-input').value.trim())
            .filter(Boolean);

        rows.forEach(r => {
            const type = r.querySelector('.jira-type-select').value;
            const parentSel = r.querySelector('.jira-parent-select');
            if (!parentSel) return;
            this._syncJiraRow(r);
            if (type !== 'story') return;

            const pending  = parentSel.dataset.pending || '';
            const current  = pending || parentSel.value || '';
            const options  = ['<option value="">Scegli l\'epica…</option>']
                .concat(epics.map(url =>
                    `<option value="${this._escapeAttr(url)}">${this._escapeHtml(this.jiraLabel(url))}</option>`));
            parentSel.innerHTML = options.join('');

            if (current && epics.includes(current)) {
                parentSel.value = current;
            } else if (current) {
                // L'epica non esiste più tra le righe: la manteniamo selezionata
                // finché l'utente non la corregge (al salvataggio viene validata).
                parentSel.insertAdjacentHTML('beforeend',
                    `<option value="${this._escapeAttr(current)}">${this._escapeHtml(this.jiraLabel(current))}</option>`);
                parentSel.value = current;
            }
            delete parentSel.dataset.pending;
        });
    },

    _collectJiraItems: function() {
        const rows = Array.from(document.querySelectorAll('#jiraLinksContainer .jira-row'));
        const items = [];
        rows.forEach(r => {
            const url = r.querySelector('.jira-link-input').value.trim();
            if (!url) return;
            const type = r.querySelector('.jira-type-select').value;
            const parent = type === 'story' ? (r.querySelector('.jira-parent-select').value || null) : null;
            items.push({ url, type, parent });
        });
        const epicUrls = new Set(items.filter(i => i.type === 'epic').map(i => i.url));
        items.forEach(i => {
            if (i.type === 'story' && (!i.parent || !epicUrls.has(i.parent))) i.parent = null;
        });
        return items;
    },

    _getJiraLinksFromModal: function() {
        return this._collectJiraItems();
    },

    // ─── MILESTONE PERSONALIZZATE ────────────────────────────────────────────

    _appendDynamicField: function(type, label, date, index) {
        const isMilestone = type === 'milestone';
        const container   = document.getElementById(isMilestone ? 'customMilestonesContainer' : 'jiraLinksContainer');
        const wrap = document.createElement('div');
        const safeLabel = (label || '').replace(/"/g, '&quot;');

        wrap.className = 'd-flex align-items-center gap-2 mb-2 custom-milestone-row';
        wrap.dataset.milestoneIndex = index;
        wrap.innerHTML = `
            <input type="text"  class="form-control form-control-sm custom-ms-label" placeholder="Nome (es: Creare Story)" value="${safeLabel}">
            <input type="date"  class="form-control form-control-sm custom-ms-date" value="${date || ''}">
            <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeCustomMilestone(this)" title="Rimuovi">&times;</button>`;
        container.appendChild(wrap);
    },

    _refreshDynamicBtn: function(type) {
        const isMilestone = type === 'milestone';
        const container   = document.getElementById(isMilestone ? 'customMilestonesContainer' : 'jiraLinksContainer');
        const btn = isMilestone
            ? document.querySelector('button[onclick="app.addCustomMilestone()"]')
            : document.getElementById('addJiraBtn');
        const selector = isMilestone ? '.custom-milestone-row' : '.jira-row';
        const max      = isMilestone ? this.MAX_CUSTOM_MILESTONES : this.MAX_JIRA_LINKS;
        const count    = container ? container.querySelectorAll(selector).length : 0;
        const label    = isMilestone ? 'Aggiungi Milestone Personalizzata' : 'Aggiungi Link Jira';
        this._updateDynamicBtn(btn, count, max, `+ ${label}`, `Limite raggiunto (${max})`);
    },

    // ─── JIRA LABEL ─────────────────────────────────────────────────────────

    jiraLabel: function(url) {
        if (!url || !url.trim()) return '';
        try {
            const parts = new URL(url.trim()).pathname.replace(/\/$/, '').split('/');
            return parts[parts.length - 1] || url;
        } catch (e) {
            const parts = url.trim().replace(/\/$/, '').split('/');
            return parts[parts.length - 1] || url;
        }
    },

    jiraLinksHtml: function(jiraLinks) {
        const items = this._normalizeJiraLinks(jiraLinks);
        if (!items.length) return '';

        const epicUrls = new Set(items.filter(i => i.type === 'epic').map(i => i.url));
        const chip = (item, extraCls) => {
            const cls = 'jira-chip' + (extraCls ? ' ' + extraCls : '');
            const title = item.type === 'story' && item.parent
                ? `Storia di ${this.jiraLabel(item.parent)}`
                : item.url;
            return `<a href="${this._escapeAttr(item.url)}" target="_blank" rel="noopener" class="${cls}" title="${this._escapeAttr(title)}">${this._icon('link')}<span>${this._escapeHtml(this.jiraLabel(item.url))}</span></a>`;
        };

        const parts = [];
        items.filter(i => i.type === 'epic').forEach(epic => {
            const stories = items.filter(i => i.type === 'story' && i.parent === epic.url);
            parts.push(
                `<div class="jira-tree__group">` +
                    `<div class="jira-tree__epic">${chip(epic, 'jira-chip--epic')}` +
                        (stories.length ? `<span class="jira-tree__count" title="${stories.length} storie collegate">${stories.length}</span>` : '') +
                    `</div>` +
                    (stories.length ? `<div class="jira-tree__children">${stories.map(s => chip(s, 'jira-chip--story')).join('')}</div>` : '') +
                `</div>`
            );
        });

        const loose = items.filter(i =>
            i.type === 'link' || (i.type === 'story' && (!i.parent || !epicUrls.has(i.parent))));
        if (loose.length) {
            parts.push(`<div class="jira-tree__loose">${loose.map(i => chip(i, i.type === 'story' ? 'jira-chip--story' : '')).join('')}</div>`);
        }

        return `<div class="jira-tree">${parts.join('')}</div>`;
    },

    // ─── CALCOLO COSTO ───────────────────────────────────────────────────────

    calcCosto: function() {
        const ggu = parseFloat(this._getVal('p_stimaGgu'));
        const rc  = parseFloat(this._getVal('p_rcFornitore'));
        this._setVal('p_stimaCosto',
            (!isNaN(ggu) && !isNaN(rc) && ggu >= 0 && rc >= 0)
                ? '\u20AC ' + (ggu * rc).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : ''
        );
    },

    // ─── SETTINGS ────────────────────────────────────────────────────────────

    showSettings: function() {
        ['owner', 'repo', 'token', 'path'].forEach(k => this._setVal(`cfg_${k}`, this.config[k]));
        const cb = document.getElementById('cfg_githubBackup');
        if (cb) cb.checked = !!this.config.enabled;
        this.toggleGithubBackupSection();
        const info = document.getElementById('settingsAccountInfo');
        if (info) info.textContent = this.userEmail ? `Connesso come ${this.userEmail}` : '';
        this.settingsModal.show();
    },

    toggleGithubBackupSection: function() {
        const on  = this._getChecked('cfg_githubBackup');
        const sec = document.getElementById('githubBackupSection');
        if (sec) sec.style.display = on ? 'block' : 'none';
    },

    saveSettings: function() {
        this.config = {
            ...this.config,
            owner:   (this._getVal('cfg_owner') || '').trim(),
            repo:    (this._getVal('cfg_repo')  || '').trim(),
            token:   (this._getVal('cfg_token') || '').trim(),
            path:    (this._getVal('cfg_path')  || '').trim() || 'data/projects.json',
            enabled: this._getChecked('cfg_githubBackup')
        };
        localStorage.setItem('pm_tracker_config', JSON.stringify(this.config));
        this.settingsModal.hide();
        this.showAlert('Impostazioni salvate.', 'success', 2000);
    },

    // ─── LOAD / SAVE DATA (Supabase) ────────────────────────────────────────

    loadData: async function(force = false) {
        if (!this.sb) { this.showAlert('Client Supabase non disponibile. Ricarica la pagina.', 'danger'); return; }

        try {
            const { data: sess } = await this.sb.auth.getSession();
            if (!sess || !sess.session) { this.showLogin(); return; }
            if (sess.session.user) this.userEmail = sess.session.user.email || '';

            this.showAlert('Caricamento dati...', 'info', 1000);

            const { data: row, error } = await this.sb
                .from('state')
                .select('data, updated_at')
                .eq('id', 'main')
                .maybeSingle();

            if (error) {
                if (error.code === 'PGRST106') throw new Error('schema pmtracker non esposto su PostgREST (Settings → API → Exposed schemas)');
                if (error.code === 'PGRST205') throw new Error('tabelle pmtracker non trovate: riesegui db/001_pmtracker_schema.sql');
                if (error.code === '42501' || error.status === 401) { this.showLogin(); throw new Error('sessione scaduta, rifai il login'); }
                throw error;
            }

            if (!row) {
                // Nessun documento ancora: stato iniziale vuoto, il primo salvataggio crea la riga.
                this.data = [];
                this.serverUpdatedAt = null;
                this.getMeta();
                this.renderAll();
                this.showAlert('Nessun dato presente: puoi iniziare a creare progetti.', 'info', 4000);
                return;
            }

            this.serverUpdatedAt = row.updated_at;
            const arr = Array.isArray(row.data) ? row.data : [];
            this.data = arr.map(p => this.normalizeProject(p));
            this.getMeta();
            this.populateFornitoreFilters();
            this.populateDataTestFilters();
            this.populateDataProdFilters();
            this.renderAll();
            this.showAlert('Dati caricati da Supabase!', 'success', 2000);
        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger', 6000);
        }
    },

    populateFornitoreFilters: function() {
        try {
            const values = [...new Set(this.getProjectsOnly().flatMap(p => p.fornitori || []))].sort();
            this._populateFilterSelects(['globalFornitoreFilter'], values);
        } catch (e) { console.error('populateFornitoreFilters error', e); }
    },

    populateDataTestFilters: function() {
        try {
            const values = [...new Set(this.getProjectsOnly().flatMap(p => p.dataTest || []))]
                .filter(v => v)
                .sort((a, b) => new Date(a) - new Date(b))
                .map(d => d.substring(0, 10));
            const labels = {};
            values.forEach(v => { labels[v] = this.formatDate(v); });
            this._populateFilterSelects(['ganttDataTestFilter'], values, labels);
        } catch (e) { console.error('populateDataTestFilters error', e); }
    },

    populateDataProdFilters: function() {
        try {
            const values = [...new Set(this.getProjectsOnly().flatMap(p => p.dataProd || []))]
                .filter(v => v)
                .sort((a, b) => new Date(a) - new Date(b))
                .map(d => d.substring(0, 10));
            const labels = {};
            values.forEach(v => { labels[v] = this.formatDate(v); });
            this._populateFilterSelects(['ganttDataProdFilter'], values, labels);
        } catch (e) { console.error('populateDataProdFilters error', e); }
    },

    // ─── PICKER FORNITORI (modal progetto) ───────────────────────────────────

    _escapeHtml: function(s) {
        return (s ?? '').toString()
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    _escapeAttr: function(s) { return this._escapeHtml(s); },

    // Elenco fornitori: preset del codice + quelli già usati nei progetti
    _allFornitori: function() {
        const fromData = this.getProjectsOnly().flatMap(p => p.fornitori || []);
        const seen = new Map();
        [...(this.FORNITORI_PRESET || []), ...fromData].forEach(v => {
            const name = (v || '').toString().trim();
            if (!name) return;
            const key = name.toLowerCase();
            if (!seen.has(key)) seen.set(key, name);
        });
        return [...seen.values()].sort((a, b) => a.localeCompare(b, 'it'));
    },

    _isFornitoreSelected: function(name) {
        const key = (name || '').toString().trim().toLowerCase();
        return this._fornitoriSelected.some(v => v.toLowerCase() === key);
    },

    // selected: array o stringa "A, B"
    renderFornitoriPicker: function(selected) {
        this._fornitoriSelected = this.csvToArray(selected || []);

        const menu = document.getElementById('fornitoriPickerMenu');
        if (!menu) return;

        const values = this._allFornitori();
        this._fornitoriSelected.forEach(v => {
            if (!values.some(x => x.toLowerCase() === v.toLowerCase())) values.push(v);
        });
        values.sort((a, b) => a.localeCompare(b, 'it'));

        const items = values.map(v => `
            <label class="dropdown-item d-flex align-items-center gap-2 py-1 mb-0" style="cursor:pointer;">
                <input class="form-check-input mt-0" type="checkbox" value="${this._escapeAttr(v)}"
                       ${this._isFornitoreSelected(v) ? 'checked' : ''}
                       onchange="app.toggleFornitore(this.value, this.checked)">
                <span>${this._escapeHtml(v)}</span>
            </label>`).join('');

        menu.innerHTML = (items || '<div class="text-muted small px-2 py-1">Nessun fornitore salvato</div>') + `
            <div class="dropdown-divider"></div>
            <div class="d-flex gap-2 p-1">
                <input type="text" class="form-control form-control-sm" id="fornitoriNewInput"
                       placeholder="Nuovo fornitore…"
                       onkeydown="if(event.key==='Enter'){event.preventDefault();app.addFornitoreCustom();}">
                <button class="btn btn-sm btn-success" type="button" onclick="app.addFornitoreCustom()" title="Aggiungi">＋</button>
            </div>`;

        this._syncFornitoriField();
    },

    toggleFornitore: function(name, checked) {
        const n = (name || '').toString().trim();
        if (!n) return;
        if (checked) {
            if (!this._isFornitoreSelected(n)) this._fornitoriSelected.push(n);
        } else {
            this._fornitoriSelected = this._fornitoriSelected.filter(v => v.toLowerCase() !== n.toLowerCase());
        }
        this._syncFornitoriField();
    },

    addFornitoreCustom: function() {
        const input = document.getElementById('fornitoriNewInput');
        const name  = (input && input.value ? input.value : '').trim();
        if (!name) return;
        if (!this._isFornitoreSelected(name)) this._fornitoriSelected.push(name);
        if (input) input.value = '';
        this.renderFornitoriPicker(this._fornitoriSelected);
        setTimeout(() => { const el = document.getElementById('fornitoriNewInput'); if (el) el.focus(); }, 60);
    },

    _syncFornitoriField: function() {
        const vals = this._fornitoriSelected || [];

        const hidden = document.getElementById('p_fornitori');
        if (hidden) hidden.value = vals.join(', ');

        const chips = document.getElementById('fornitoriChips');
        if (chips) {
            chips.innerHTML = vals.map(v => `
                <span class="badge rounded-pill fornitori-chip" style="${this._badgeStyle('supplier', v)}">
                    ${this._escapeHtml(v)}
                    <button type="button" class="chip-x" title="Rimuovi"
                            data-name="${this._escapeAttr(v)}"
                            onclick="app.toggleFornitore(this.dataset.name, false)">×</button>
                </span>`).join('');
        }

        const label = document.getElementById('fornitoriPickerLabel');
        if (label) {
            label.textContent = vals.length
                ? `${vals.length} selezionat${vals.length === 1 ? 'o' : 'i'}`
                : 'Seleziona fornitori…';
        }

        const menu = document.getElementById('fornitoriPickerMenu');
        if (menu) {
            menu.querySelectorAll('input[type=checkbox]').forEach(cb => {
                cb.checked = this._isFornitoreSelected(cb.value);
            });
        }
    },

    // ─── TEMA CHIARO/SCURO ───────────────────────────────────────────────────

    _initTheme: function() {
        const root = document.documentElement;
        const meta = document.getElementById('metaThemeColor');
        const theme = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        root.setAttribute('data-theme', theme);
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1420' : '#002752');
        this._syncThemeButton(theme);

        // Se l'utente non ha mai scelto, segui il sistema quando cambia.
        if (window.matchMedia) {
            const mq = window.matchMedia('(prefers-color-scheme: dark)');
            const onChange = e => {
                let saved = null;
                try { saved = localStorage.getItem('pm-theme'); } catch (err) {}
                if (saved === 'dark' || saved === 'light') return;
                this._applyTheme(e.matches ? 'dark' : 'light', false);
            };
            if (mq.addEventListener) mq.addEventListener('change', onChange);
            else if (mq.addListener) mq.addListener(onChange);
        }
    },

    _syncThemeButton: function(theme) {
        const btn = document.getElementById('themeToggleBtn');
        if (!btn) return;
        const next = theme === 'dark' ? 'chiaro' : 'scuro';
        btn.setAttribute('title', `Passa al tema ${next}`);
        btn.setAttribute('aria-label', `Passa al tema ${next}`);
        btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
    },

    _applyTheme: function(theme, persist) {
        document.documentElement.setAttribute('data-theme', theme);
        const meta = document.getElementById('metaThemeColor');
        if (meta) meta.setAttribute('content', theme === 'dark' ? '#0b1420' : '#002752');
        if (persist) {
            try { localStorage.setItem('pm-theme', theme); } catch (e) {}
        }
        this._syncThemeButton(theme);
    },

    toggleTheme: function() {
        const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        this._applyTheme(current === 'dark' ? 'light' : 'dark', true);
    },

    // ─── PROMEMORIA ──────────────────────────────────────────────────────────

    _updateReminderFormUI: function() {
        const isEditing = !!this._editingReminderId;
        const addBtn    = document.getElementById('rem_add_btn');
        const cancelBtn = document.getElementById('rem_cancel_btn');
        const editBanner= document.getElementById('rem_edit_banner');
        if (addBtn)     addBtn.textContent       = isEditing ? 'Aggiorna promemoria' : 'Aggiungi promemoria';
        if (cancelBtn)  cancelBtn.style.display  = isEditing ? 'inline-block' : 'none';
        if (editBanner) editBanner.style.display = isEditing ? 'flex' : 'none';
    },

    // Apre l'offcanvas dei promemoria (pannello laterale, indipendente dal tab).
    openReminders: function() {
        this._populateReminderProjects();
        this.renderRemindersSheet();
        if (this.remindersOffcanvas) {
            this.remindersOffcanvas.show();
        }
    },

    // Popola la tendina "Progetto collegato" con i progetti correnti.
    _populateReminderProjects: function() {
        const sel = document.getElementById('rem_project');
        if (!sel) return;
        const current = this._editingReminderId
            ? sel.value
            : '';
        const projects = this.getProjectsOnly().slice().sort((a, b) =>
            (a.nome || '').localeCompare(b.nome || '', 'it', { sensitivity: 'base' }));
        sel.innerHTML = '<option value="">Nessun progetto</option>' + projects.map(p =>
            `<option value="${this._escapeAttr(p.id)}">${this._escapeHtml(p.nome || 'Senza nome')}${p.hidden ? ' · archiviato' : ''}</option>`
        ).join('');
        if (current) sel.value = current;
    },

    _updateReminderBadge: function() {
        const meta = this.getMeta();
        const list = meta.manualReminders || [];
        const pending = list.filter(r => r && !r.done).length;
        const todayStr = dayjs().format('YYYY-MM-DD');
        const overdue = list.filter(r => r && !r.done && r.date && r.date < todayStr).length;

        ['remindersTopBadge'].forEach(id => {
            const badge = document.getElementById(id);
            if (!badge) return;
            badge.textContent = String(pending);
            badge.style.display = pending > 0 ? 'inline-flex' : 'none';
            badge.classList.toggle('tp-count-badge--alert', overdue > 0);
        });

        const stats = document.getElementById('remStats');
        if (stats) {
            if (!list.length) {
                stats.innerHTML = '';
            } else {
                stats.innerHTML = `
                    <span class="rem-stat">${this._icon('bell')}<strong>${pending}</strong> aperti</span>
                    ${overdue ? `<span class="rem-stat rem-stat--alert">${this._icon('alert')}<strong>${overdue}</strong> scaduti</span>` : ''}`;
            }
        }
    },

    // Elenco dei promemoria raggruppato per stato, dentro lo sheet.
    renderRemindersSheet: function() {
        const box = document.getElementById('remindersList');
        if (!box) return;
        const meta = this.getMeta();
        const showDone = this._getChecked('rem_show_done');
        const todayStr = dayjs().format('YYYY-MM-DD');
        const all = (meta.manualReminders || []).filter(r => r && r.date && r.title);

        this._updateReminderBadge();

        const pending = all.filter(r => !r.done);
        const done = all.filter(r => r.done);
        const overdue = pending.filter(r => r.date < todayStr);
        const today = pending.filter(r => r.date === todayStr);
        const upcoming = pending.filter(r => r.date > todayStr);

        if (all.length === 0) {
            box.innerHTML = `<div class="tp-sheet__empty">${this._icon('bell')}<p>Nessun promemoria.<br>Aggiungine uno qui sopra.</p></div>`;
            return;
        }
        if (pending.length === 0 && !showDone) {
            box.innerHTML = `<div class="tp-sheet__empty">${this._icon('checkCircle')}<p>Tutto fatto.<br>Nessun promemoria aperto.</p></div>`;
            return;
        }

        const group = (title, items, variant) => {
            if (!items.length) return '';
            return `
                <div class="tp-rem-group">
                    <div class="tp-rem-group__title ${variant ? 'tp-rem-group__title--' + variant : ''}">${title}<span>${items.length}</span></div>
                    ${items.map(r => this._renderReminderRow(r, todayStr)).join('')}
                </div>`;
        };

        box.innerHTML = [
            group('Scaduti', overdue, 'alert'),
            group('Oggi', today, 'today'),
            group('In arrivo', upcoming, ''),
            showDone ? group('Completati', done, 'done') : ''
        ].join('');
    },

    _renderReminderRow: function(r, todayStr) {
        const isOverdue = !r.done && r.date < todayStr;
        const isToday = !r.done && r.date === todayStr;
        const cls = r.done ? 'is-done' : isOverdue ? 'is-overdue' : isToday ? 'is-today' : '';
        const dateLabel = dayjs(r.date).isValid() ? dayjs(r.date).format('DD MMM YYYY') : r.date;
        const doneAt = (r.done && r.doneAt) ? `<span class="tp-rem__done">Completato il ${this._formatDoneAt(r.doneAt)}</span>` : '';
        const project = r.projectId
            ? this.getProjectsOnly().find(p => p.id === r.projectId)
            : null;
        const projectHtml = project
            ? `<button class="tp-rem__project" type="button" onclick="app.focusProject('${this._escapeAttr(project.id)}')" title="Vai al progetto nel Gantt e nell'elenco">${this._icon('briefcase')}<span class="tp-rem__project-txt">${this._escapeHtml(project.nome || 'Senza nome')}${project.hidden ? ' · archiviato' : ''}</span></button>`
            : '';
        return `
        <div class="tp-rem ${cls}">
            <div class="tp-rem__main">
                <div class="tp-rem__top">
                    <span class="tp-rem__date">${this._icon('calendar')}${dateLabel}</span>
                    ${isOverdue ? '<span class="tp-rem__tag">Scaduto</span>' : ''}
                    ${isToday ? '<span class="tp-rem__tag tp-rem__tag--today">Oggi</span>' : ''}
                    ${projectHtml}
                </div>
                <div class="tp-rem__title">${(r.title || '').replace(/</g, '&lt;')}</div>
                ${r.note ? `<div class="tp-rem__note">${(r.note || '').replace(/</g, '&lt;')}</div>` : ''}
                ${doneAt}
            </div>
            <div class="tp-rem__actions">
                <button class="tp-rem__btn ${r.done ? '' : 'tp-rem__btn--ok'}" type="button"
                    onclick="app.toggleReminderDone('${r.id}')"
                    title="${r.done ? 'Riapri' : 'Segna come fatto'}" aria-label="${r.done ? 'Riapri' : 'Segna come fatto'}">
                    ${r.done ? this._icon('refresh') : this._icon('check')}
                </button>
                <button class="tp-rem__btn" type="button" onclick="app.editReminder('${r.id}')" title="Modifica" aria-label="Modifica">${this._icon('pencil')}</button>
                <button class="tp-rem__btn tp-rem__btn--danger" type="button" onclick="app.deleteReminder('${r.id}')" title="Elimina" aria-label="Elimina">${this._icon('trash')}</button>
            </div>
        </div>`;
    },

    clearReminderInputs: function() {
        ['rem_date', 'rem_title', 'rem_note'].forEach(id => this._setVal(id, ''));
        this._setVal('rem_project', '');
        this._editingReminderId = null;
        this._updateReminderFormUI();
    },

    editReminder: function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        this._editingReminderId = id;
        this._populateReminderProjects();
        this._setVal('rem_date',  r.date  || '');
        this._setVal('rem_title', r.title || '');
        this._setVal('rem_note',  r.note  || '');
        this._setVal('rem_project', r.projectId || '');
        if (this.remindersOffcanvas) this.remindersOffcanvas.show();
        this.renderRemindersSheet();
        this._updateReminderFormUI();
        const titleEl = document.getElementById('rem_title');
        if (titleEl) titleEl.focus();
    },

    addReminder: async function() {
        const date  = this._getVal('rem_date');
        const title = this._getVal('rem_title').trim();
        const note  = this._getVal('rem_note').trim();
        const projectId = this._getVal('rem_project') || null;
        if (!date || !title) {
            this.showAlert('Inserisci almeno Data e Titolo per il promemoria.', 'warning', 3000);
            return;
        }
        const meta = this.getMeta();
        if (this._editingReminderId) {
            const r = meta.manualReminders.find(x => x.id === this._editingReminderId);
            if (r) Object.assign(r, { date, title, note, projectId, updatedAt: new Date().toISOString() });
            this._editingReminderId = null;
        } else {
            meta.manualReminders.push({ id: Date.now().toString(), date, title, note, projectId, done: false, createdAt: new Date().toISOString(), doneAt: null });
        }
        meta.manualReminders.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        this.clearReminderInputs();
        await this.saveData();
        this._populateReminderProjects();
    },

    toggleReminderDone: async function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        r.done   = !r.done;
        r.doneAt = r.done ? new Date().toISOString() : null;
        await this.saveData();
    },

    deleteReminder: async function(id) {
        if (!confirm('Eliminare questo promemoria?')) return;
        if (this._editingReminderId === id) this.clearReminderInputs();
        const meta = this.getMeta();
        meta.manualReminders = (meta.manualReminders || []).filter(x => x.id !== id);
        await this.saveData();
        this._populateReminderProjects();
    },

    // Dal promemoria al progetto: chiude il pannello, filtra l'elenco sul
    // progetto collegato e lo evidenzia (usato dal chip "progetto").
    focusProject: function(id) {
        const p = this.getProjectsOnly().find(x => x.id === id);
        if (!p) return;
        if (this.remindersOffcanvas) this.remindersOffcanvas.hide();

        this._setVal('globalFornitoreFilter', '');
        this._setVal('globalSearchInput', p.nome || '');
        const hiddenEl = document.getElementById('globalShowHidden');
        if (hiddenEl && this.isHiddenForUI(p)) hiddenEl.checked = true;

        const tabBtn = document.getElementById('list-tab');
        if (tabBtn && !tabBtn.classList.contains('active')) {
            bootstrap.Tab.getOrCreateInstance(tabBtn).show();
        }
        this.renderAll();
        setTimeout(() => {
            const row = document.querySelector(`#projectsTableBody tr[data-id="${this._escapeAttr(id)}"]`);
            if (!row) return;
            row.classList.add('tp-row-flash');
            row.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => row.classList.remove('tp-row-flash'), 2000);
        }, 220);
    },

    _syncReminderFormState: function() { this._updateReminderFormUI(); },

    _formatDoneAt: function(doneAt) {
        if (!doneAt) return '';
        try {
            return dayjs(doneAt).format('DD/MM/YYYY HH:mm');
        } catch(e) { return ''; }
    },

    // ─── SAVE PROJECT ────────────────────────────────────────────────────────

    saveProject: async function() {
        const g = id => this._getVal(id) || null;
        const dates = {
            stima:    g('p_stima'),
            ia:       g('p_ia'),
            devStart: g('p_devStart'),
            devEnd:   g('p_devEnd'),
            test:     g('p_test'),
            prod:     g('p_prod'),
            uat:      g('p_uat'),
            bs:       g('p_bs')
        };

        const dateChecks = [
            [dates.stima,    dates.devStart, 'Stima non pu\u00F2 essere successiva a Dev Start'],
            [dates.devStart, dates.devEnd,   'Dev Start non pu\u00F2 essere successivo a Dev End'],
            [dates.devEnd,   dates.test,     'Dev End non pu\u00F2 essere successivo al Test'],
            [dates.test,     dates.prod,     'Il Test non pu\u00F2 essere successivo a Prod']
        ];
        for (const [a, b, msg] of dateChecks) {
            if (a && b && a > b) { document.getElementById('dateValidationMsg').innerText = `ERRORE: ${msg}`; return; }
        }
        document.getElementById('dateValidationMsg').innerText = '';

        const jiraItems = this._getJiraLinksFromModal();
        const orphanStory = jiraItems.find(i => i.type === 'story' && !i.parent);
        if (orphanStory) {
            document.getElementById('dateValidationMsg').innerText =
                `ERRORE: la storia ${this.jiraLabel(orphanStory.url)} deve avere un'epica di riferimento.`;
            return;
        }

        const stimaGgu    = parseFloat(this._getVal('p_stimaGgu'));
        const rcFornitore = parseFloat(this._getVal('p_rcFornitore'));
        const progressRaw = parseInt(this._getVal('p_progress'), 10);
        const progress    = (!isNaN(progressRaw) && progressRaw >= 0 && progressRaw <= 100) ? progressRaw : null;

        const id        = this._getVal('p_id');
        const fornitori = this._getVal('p_fornitori').split(',').map(s => s.trim()).filter(Boolean);

        const newProj = {
            id:                id || Date.now().toString(),
            nome:              this._getVal('p_nome'),
            fornitori,
            progress,
            dataStima:         dates.stima,
            dataIA:            dates.ia,
            devStart:          dates.devStart,
            devEnd:            dates.devEnd,
            dataTest:          dates.test,
            dataProd:          dates.prod,
            dataUAT:           dates.uat,
            dataBS:            dates.bs,
            jiraLinks:         jiraItems,
            customMilestones:  this._getCustomMilestonesFromModal(),
            dataScadenzaStima: g('p_dataScadenzaStima'),
            dataConfigSistema: g('p_dataConfigSistema'),
            stimaGgu:          isNaN(stimaGgu)    ? null : stimaGgu,
            rcFornitore:       isNaN(rcFornitore) ? null : rcFornitore,
            stimaCosto:        (!isNaN(stimaGgu) && !isNaN(rcFornitore)) ? stimaGgu * rcFornitore : null,
            note:              this._getVal('p_note'),
            hidden:            false
        };

        if (id) {
            const idx = this.data.findIndex(p => p.id === id);
            if (idx >= 0) {
                const old = this.data[idx];
                if (old.hidden)                    newProj.hidden     = true;
                if (old.ganttOrder !== undefined)  newProj.ganttOrder = old.ganttOrder;
                // Campo legacy non più editabile: conservato per non perdere dati.
                if (Array.isArray(old.owners))     newProj.owners     = old.owners;
                this.data[idx] = newProj;
            }
        } else {
            newProj.ganttOrder = this.getProjectsOnly().length;
            this.data.push(newProj);
        }
        await this.saveData();
        this.editorModal.hide();
    },

    // Salvataggio principale: Supabase (schema pmtracker, riga unica 'main').
    // Il controllo su updated_at evita di sovrascrivere modifiche fatte altrove.
    saveData: async function() {
        this.showAlert('Salvataggio in corso...', 'info', 2000);
        try {
            if (!this.sb) throw new Error('client Supabase non inizializzato');

            const { data: sess } = await this.sb.auth.getSession();
            if (!sess || !sess.session) { this.showLogin(); return; }

            const payload = {
                data: this.data,
                updated_by: (sess.session.user && sess.session.user.id) || null
            };

            let saved = null;
            let error = null;

            if (!this.serverUpdatedAt) {
                // Prima scrittura (riga non ancora esistente)
                const res = await this.sb
                    .from('state')
                    .upsert({ id: 'main', ...payload }, { onConflict: 'id' })
                    .select('updated_at')
                    .maybeSingle();
                saved = res.data; error = res.error;
            } else {
                const res = await this.sb
                    .from('state')
                    .update(payload)
                    .eq('id', 'main')
                    .eq('updated_at', this.serverUpdatedAt)
                    .select('updated_at')
                    .maybeSingle();
                saved = res.data; error = res.error;
                if (!error && !saved) {
                    throw new Error('Conflitto di versione: i dati sono stati modificati da un\'altra pagina o persona. Ricarica prima di salvare.');
                }
            }

            if (error) throw error;
            if (saved && saved.updated_at) this.serverUpdatedAt = saved.updated_at;

            this.showAlert('Salvato su Supabase!', 'success', 2000);
            this.getMeta();
            this.populateFornitoreFilters();
            this.populateDataTestFilters();
            this.populateDataProdFilters();
            this.renderAll();

            // Backup opzionale su GitHub: non blocca il salvataggio
            await this.mirrorToGithub();
        } catch (e) {
            console.error('Errore salvataggio:', e);
            this.showAlert(`Errore salvataggio: ${e.message}`, 'danger', 8000);
        }
    },

    // Compatibilità: le chiamate storiche usavano syncToGithub()
    syncToGithub: async function() { return this.saveData(); },

    // Copia di sicurezza del JSON nel repo GitHub (solo se attivata nelle Impostazioni)
    mirrorToGithub: async function() {
        const c = this.config || {};
        if (!c.enabled || !c.token || !c.owner || !c.repo) return;
        try {
            const encoded = new TextEncoder().encode(JSON.stringify(this.data, null, 2));
            let bin = '';
            encoded.forEach(b => { bin += String.fromCharCode(b); });
            const content = btoa(bin);
            const url = `https://api.github.com/repos/${c.owner}/${c.repo}/contents/${c.path || 'data/projects.json'}`;
            const headers = { 'Authorization': `token ${c.token}`, 'Accept': 'application/vnd.github.v3+json' };

            if (!this.sha) {
                const g = await fetch(url, { headers });
                if (g.ok) { const j = await g.json(); this.sha = j.sha; }
            }

            const response = await fetch(url, {
                method: 'PUT',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Backup dati PM Tracker - ${new Date().toISOString()}`,
                    content,
                    sha: this.sha
                })
            });
            if (!response.ok) throw new Error(`GitHub ${response.status}`);
            const result = await response.json();
            this.sha = result.content.sha;
            this.showAlert('Backup su GitHub aggiornato.', 'success', 2500);
        } catch (e) {
            console.warn('Backup GitHub non riuscito:', e);
            this.showAlert(`Dati salvati su Supabase, ma il backup GitHub è fallito: ${e.message}`, 'warning', 6000);
        }
    },

    // ─── OPEN / DELETE / TOGGLE PROJECT ─────────────────────────────────────

    openModal: function(id = null) {
        document.getElementById('projectForm').reset();
        document.getElementById('dateValidationMsg').innerText = '';
        this._setVal('p_stimaCosto', '');
        if (id) {
            const p = this.data.find(x => x.id === id);
            if (!p || this.isMeta(p)) return;
            const fields = {
                p_id: p.id, p_nome: p.nome,
                p_fornitori: (p.fornitori || []).join(', '),
                p_progress: p.progress != null ? p.progress : '',
                p_stima: p.dataStima || '', p_ia: p.dataIA || '',
                p_devStart: p.devStart || '', p_devEnd: p.devEnd || '',
                p_test: p.dataTest || '', p_prod: p.dataProd || '',
                p_uat: p.dataUAT || '', p_bs: p.dataBS || '',
                p_dataScadenzaStima: p.dataScadenzaStima || '',
                p_dataConfigSistema: p.dataConfigSistema || '',
                p_stimaGgu:    p.stimaGgu    != null ? p.stimaGgu    : '',
                p_rcFornitore: p.rcFornitore != null ? p.rcFornitore : '',
                p_note: p.note || ''
            };
            Object.entries(fields).forEach(([fid, val]) => this._setVal(fid, val));
            this.calcCosto();
            const links = this.jiraLinksOf(p);
            this.renderJiraFields(links);
            this.renderCustomMilestoneFields(p.customMilestones || []);
        } else {
            this._setVal('p_id', '');
            this.renderJiraFields([]);
            this.renderCustomMilestoneFields([]);
        }
        // Menu a tendina fornitori: valori già usati + preset
        this.renderFornitoriPicker(this._getVal('p_fornitori') || []);
        this.editorModal.show();
    },

    deleteProject: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (p && this.isMeta(p)) return;
        if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
            this.data = this.data.filter(x => x.id !== id);
            await this.saveData();
        }
    },

    toggleHidden: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (!p || this.isMeta(p)) return;
        p.hidden = !p.hidden;
        if (!p.hidden && this.isAutoStale(p))
            this.showAlert('Progetto ripristinato, ma \u00E8 vecchio di 1 mese. Rimuovi o modifica la data di Prod per renderlo visibile senza la spunta.', 'warning', 6000);
        await this.saveData();
    },

    // ─── SORT ────────────────────────────────────────────────────────────────

    _sortGantt: function(data, mode) {
        const today = this._today;
        const d  = val => val ? new Date(val) : new Date(0);
        const ip = p   => { const prod = p.dataProd ? new Date(p.dataProd) : null; return !prod || prod > today; };
        const inProgressFirst = field => (a, b) => {
            const diff = (ip(a) ? 0 : 1) - (ip(b) ? 0 : 1);
            return diff !== 0 ? diff : d(a[field]) - d(b[field]);
        };
        const sorted = [...data];
        switch (mode) {
            case 'custom':
                sorted.sort((a, b) => (a.ganttOrder ?? 999999) - (b.ganttOrder ?? 999999)); break;
            case 'prod_inprogress_first':     sorted.sort(inProgressFirst('dataProd'));  break;
            case 'prod_asc':                  sorted.sort((a, b) => d(a.dataProd)  - d(b.dataProd));  break;
            case 'prod_desc':                 sorted.sort((a, b) => d(b.dataProd)  - d(a.dataProd));  break;
            case 'devStart_inprogress_first': sorted.sort(inProgressFirst('devStart')); break;
            case 'devStart_asc':              sorted.sort((a, b) => d(a.devStart)  - d(b.devStart));  break;
            case 'devStart_desc':             sorted.sort((a, b) => d(b.devStart)  - d(a.devStart));  break;
            case 'devEnd_inprogress_first':   sorted.sort(inProgressFirst('devEnd'));   break;
            case 'test_inprogress_first':     sorted.sort(inProgressFirst('dataTest')); break;
            case 'alpha_asc':                 sorted.sort((a, b) => (a.nome||'').localeCompare(b.nome||'', 'it')); break;
            case 'alpha_desc':                sorted.sort((a, b) => (b.nome||'').localeCompare(a.nome||'', 'it')); break;
        }
        return sorted;
    },

    // ─── DRAG & DROP ─────────────────────────────────────────────────────────

    handleDragStart: function(e, id) {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => e.currentTarget?.classList.add('dragging'), 10);
    },
    handleDragOver:  function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; },
    handleDragEnter: function(e) { e.preventDefault(); e.currentTarget?.classList.add('drag-over'); },
    handleDragLeave: function(e) { if (!e.currentTarget.contains(e.relatedTarget)) e.currentTarget?.classList.remove('drag-over'); },
    handleDragEnd:   function()  { document.querySelectorAll('.gantt-row').forEach(el => el.classList.remove('dragging', 'drag-over')); },
    handleDrop: function(e, targetId) {
        e.preventDefault(); e.stopPropagation();
        document.querySelectorAll('.gantt-row').forEach(el => el.classList.remove('dragging', 'drag-over'));
        const sourceId = e.dataTransfer.getData('text/plain');
        if (sourceId && sourceId !== targetId) this.reorderGantt(sourceId, targetId);
    },

    reorderGantt: async function(sourceId, targetId) {
        const projs = this.getProjectsOnly().sort((a, b) => (a.ganttOrder ?? 999999) - (b.ganttOrder ?? 999999));
        const si = projs.findIndex(p => p.id === sourceId);
        const ti = projs.findIndex(p => p.id === targetId);
        if (si < 0 || ti < 0) return;
        const [moved] = projs.splice(si, 1);
        projs.splice(ti, 0, moved);
        projs.forEach((p, i) => { p.ganttOrder = i; });
        this.renderGantt();
        await this.saveData();
    },

    // ─── RENDER ALL ──────────────────────────────────────────────────────────

    renderAll: function() {
        try {
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
            this._updateReminderBadge();
        } catch (err) {
            console.error('Errore in renderAll:', err);
            this.showAlert(`Errore visualizzazione: ${err.message}`, 'danger');
        }
    },

    // ─── RENDER TABLE ────────────────────────────────────────────────────────

    // Stessa selezione usata da Elenco ed export CSV: filtri globali + ordinamento.
    _tableProjects: function() {
        const sortMode = this._getVal('tableSortSelect') || 'prod_inprogress_first';
        const globals  = this._globalFilters();
        const data     = this.getProjectsOnly().filter(p => this._matchesGlobalFilters(p, globals));
        return this._sortGantt(data, sortMode);
    },

    renderTable: function() {
        const tbody = document.getElementById('projectsTableBody');
        if (!tbody) return;
        const today = this._today;
        tbody.innerHTML = this._tableProjects().map(p => this._htmlTableRow(p, today)).join('');
    },

    // ─── VISTA COMPATTA ──────────────────────────────────────────────────────

    toggleTableCompact: function() {
        const table = document.getElementById('projectsTable');
        if (!table) return;
        this._setTableCompact(!table.classList.contains('tp-table--compact'), true);
    },

    _setTableCompact: function(on, persist) {
        const table = document.getElementById('projectsTable');
        if (!table) return;
        table.classList.toggle('tp-table--compact', !!on);
        const btn = document.getElementById('tableCompactBtn');
        if (btn) {
            btn.classList.toggle('active', !!on);
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
            btn.title = on ? 'Mostra tutte le colonne' : 'Mostra solo le colonne principali';
        }
        const label = document.getElementById('tableCompactBtnLabel');
        if (label) label.textContent = on ? 'Vista completa' : 'Vista compatta';
        if (persist) {
            try { localStorage.setItem('pm-table-compact', on ? '1' : '0'); } catch (e) {}
        }
    },

    // ─── EXPORT CSV ──────────────────────────────────────────────────────────

    exportCsv: function() {
        const rows = this._tableProjects();
        if (!rows.length) {
            this.showAlert('Nessun progetto da esportare con i filtri attuali.', 'warning');
            return;
        }
        try {
            const csv = this._projectsCsv(rows);
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `pm-tracker-${dayjs().format('YYYY-MM-DD')}.csv`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            this.showAlert(`Esportati ${rows.length} progetti in CSV.`, 'success');
        } catch (e) {
            console.error('exportCsv:', e);
            this.showAlert(`Esportazione CSV non riuscita: ${e.message}`, 'danger');
        }
    },

    _projectsCsv: function(projects) {
        const cols = [
            ['Progetto',        p => p.nome || ''],
            ['Fornitori',       p => (p.fornitori || []).join(' | ')],
            ['Stato',           p => p.hidden ? 'Archiviato'
                                   : this.isAutoStale(p) ? 'Auto-archiviato'
                                   : (p.dataProd && new Date(p.dataProd) <= this._today) ? 'Rilasciato' : 'In corso'],
            ['Avanzamento %',   p => p.progress != null ? p.progress : ''],
            ['Stima',           p => p.dataStima || ''],
            ['IA',              p => p.dataIA || ''],
            ['Dev start',       p => p.devStart || ''],
            ['Dev end',         p => p.devEnd || ''],
            ['Test',            p => p.dataTest || ''],
            ['Prod',            p => p.dataProd || ''],
            ['UAT',             p => p.dataUAT || ''],
            ['BS',              p => p.dataBS || ''],
            ['Scadenza stima',  p => p.dataScadenzaStima || ''],
            ['Config sistema',  p => p.dataConfigSistema || ''],
            ['Stima gg/u',      p => p.stimaGgu != null ? p.stimaGgu : ''],
            ['Costo EUR',       p => p.stimaCosto != null ? Number(p.stimaCosto).toFixed(2).replace('.', ',') : ''],
            ['Milestone',       p => (p.customMilestones || []).map(m => `${m.label || ''}:${m.date || ''}`).join(' | ')],
            ['Jira',            p => this.jiraLinksOf(p).map(i => i.type === 'epic' ? `[EPICA] ${i.url}`
                                      : i.type === 'story' ? `[STORIA di ${this.jiraLabel(i.parent)}] ${i.url}` : i.url).join(' | ')],
            ['Note',            p => p.note || '']
        ];
        const cell = v => `"${String(v == null ? '' : v).replace(/"/g, '""')}"`;
        const lines = [cols.map(c => cell(c[0])).join(';')];
        projects.forEach(p => lines.push(cols.map(c => cell(c[1](p))).join(';')));
        return lines.join('\r\n');
    },

    _htmlTableRow: function(p, today) {
        const isPast    = p.dataProd && new Date(p.dataProd) <= today;
        const autoStale = this.isAutoStale(p);
        const isHidden  = this.isHiddenForUI(p);
        const rowCls    = isHidden ? 'class="table-warning opacity-75"' : isPast ? 'class="table-secondary opacity-75"' : '';

        const fornBadge = (p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'badge me-1 mb-1')).join('');

        const progressHtml = (p.progress != null)
            ? `<div class="progress mt-1" style="height:6px;min-width:80px;" title="Avanzamento: ${p.progress}%">
                 <div class="progress-bar ${p.progress >= 100 ? 'bg-success' : 'bg-primary'}" style="width:${p.progress}%"></div>
               </div>
               <div class="text-muted" style="font-size:0.7rem;">${p.progress}%</div>`
            : '';

        const extraRows = [
            p.stimaGgu   != null ? `<span class="badge bg-info text-dark me-1">${this._icon('timer')} ${p.stimaGgu} gg/u</span>` : '',
            p.stimaCosto != null ? `<span class="badge bg-warning text-dark me-1">${this._icon('euro')} ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2,maximumFractionDigits:2})} &euro;</span>` : ''
        ].filter(Boolean);

        const links    = this.jiraLinksOf(p);
        const jiraHtml = this.jiraLinksHtml(links);

        const compactDates = [
            p.dataStima ? `<span><b>Stima</b> ${this.formatDate(p.dataStima)}</span>` : '',
            p.dataIA    ? `<span><b>IA</b> ${this.formatDate(p.dataIA)}</span>` : '',
            (p.devStart || p.devEnd) ? `<span><b>Dev</b> ${this.formatDate(p.devStart)} \u27A0 ${this.formatDate(p.devEnd)}</span>` : ''
        ].filter(Boolean).join('');

        const statusBadge = p.hidden   ? '<span class="badge bg-dark ms-1">' + this._icon('archive') + ' Archiviato</span>'
                          : autoStale  ? '<span class="badge bg-secondary ms-1">' + this._icon('clock') + ' Auto-archiviato</span>'
                          : isPast     ? '<span class="badge bg-success ms-1">' + this._icon('check') + ' Rilasciato</span>'
                          : '';

        return `
        <tr ${rowCls} data-id="${this._escapeAttr(p.id)}">
            <td>
                <strong>${this._escapeHtml(p.nome || 'Senza nome')}</strong> ${statusBadge}
                ${jiraHtml  ? `<div class="mt-1">${jiraHtml}</div>` : ''}
                ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                ${compactDates ? `<div class="tp-compact-dates">${compactDates}</div>` : ''}
            </td>
            <td><div class="d-flex flex-wrap">${fornBadge}</div></td>
            <td data-col="prog">${progressHtml}</td>
            <td class="text-muted small" data-col="stima">${this.formatDate(p.dataStima)}</td>
            <td class="text-muted small" data-col="ia">${this.formatDate(p.dataIA)}</td>
            <td class="small" data-col="sviluppo">${this.formatDate(p.devStart)} \u27A0 ${this.formatDate(p.devEnd)}</td>
            <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
            <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
            <td class="small text-muted" data-col="note" style="max-width:250px;white-space:pre-wrap;">${this._escapeHtml(p.note || '')}</td>
            <td>
                <div class="d-flex gap-1">
                    <button class="btn btn-sm ${p.hidden ? 'btn-secondary' : 'btn-outline-secondary'}" onclick="app.toggleHidden('${p.id}')" title="${p.hidden ? 'Ripristina Progetto' : 'Archivia (Nascondi)'}" aria-label="${p.hidden ? 'Ripristina Progetto' : 'Archivia'}">${p.hidden ? this._icon('eye') : this._icon('eyeOff')}</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="app.openModal('${p.id}')" title="Modifica" aria-label="Modifica">${this._icon('pencil')}</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteProject('${p.id}')" title="Elimina" aria-label="Elimina">${this._icon('trash')}</button>
                </div>
            </td>
        </tr>`;
    },

    // ─── RENDER GANTT ────────────────────────────────────────────────────────

    setGanttZoom: function(zoom) {
        const value = zoom === 'week' ? 'week' : 'month';
        this._setVal('ganttZoomSelect', value);
        try { localStorage.setItem('pm-gantt-zoom', value); } catch (e) {}
        this.renderGantt();
    },

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;
        const filtDataTest = this._getVal('ganttDataTestFilter');
        const filtDataProd = this._getVal('ganttDataProdFilter');
        const sortMode   = this._getVal('ganttSortSelect') || 'prod_inprogress_first';
        const zoom       = this._getVal('ganttZoomSelect') === 'week' ? 'week' : 'month';
        const globals    = this._globalFilters();

        let data = this.getProjectsOnly().filter(p =>
            this._matchesGlobalFilters(p, globals) &&
            (!filtDataTest || (p.dataTest && p.dataTest.startsWith(filtDataTest))) &&
            (!filtDataProd || (p.dataProd && p.dataProd.startsWith(filtDataProd))) &&
            (p.devStart || p.devEnd || p.dataTest || p.dataProd || p.dataIA || (p.customMilestones && p.customMilestones.length > 0))
        );
        data = this._sortGantt(data, sortMode);

        if (data.length === 0) {
            container.innerHTML = "<p class='text-center p-3 text-muted'>Nessun progetto con date programmate trovato per i filtri selezionati. Prova a cambiare i filtri o la ricerca globale.</p>";
            return;
        }

        const { minDate, maxDate, totalDays, pct } = this._ganttDateRange(data);
        const today        = this._today;
        const isCustomSort = sortMode === 'custom';
        const todayPct     = pct(today).toFixed(2);
        const todayLabel   = dayjs(today).format('DD/MM');
        const scale        = this._ganttScale(minDate, totalDays, pct, zoom);
        const gridHtml     = scale.boundaries.map(x => `<i class="gantt-grid-line" style="left:${x.toFixed(2)}%"></i>`).join('');

        let html = this._ganttBuildHeader(scale, zoom);
        html += '<div class="gantt-body">';
        data.forEach(p => { html += this._htmlGanttRow(p, today, pct, todayPct, todayLabel, isCustomSort, gridHtml); });
        html += this._ganttBuildLegend(data);
        container.innerHTML = html;
    },

    _ganttDateRange: function(data) {
        let minDate = null, maxDate = null;
        const updateRange = d => {
            if (!d) return;
            const dt = new Date(d);
            if (!minDate || dt < minDate) minDate = dt;
            if (!maxDate || dt > maxDate) maxDate = dt;
        };
        data.forEach(p => {
            [p.dataIA, p.devStart, p.devEnd, p.dataTest, p.dataProd, p.dataUAT, p.dataBS, p.dataScadenzaStima, p.dataConfigSistema].forEach(updateRange);
            (p.customMilestones || []).forEach(m => updateRange(m.date));
        });
        if (!minDate || !maxDate) { minDate = new Date(); maxDate = new Date(); }
        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        let maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxMonth <= minDate) maxMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        maxDate = maxMonth;
        const totalDays = Math.ceil((maxDate - minDate) / 86400000);
        const pct = d => { const days = (new Date(d) - minDate) / 86400000; return Math.min(Math.max((days / totalDays) * 100, 0), 100); };
        return { minDate, maxDate, totalDays, pct };
    },

    // Colonne e linee di griglia per lo zoom selezionato (mensile o settimanale).
    _ganttScale: function(minDate, totalDays, pct, zoom) {
        const columns = [], boundaries = [];
        let cur;
        if (zoom === 'week') {
            cur = new Date(minDate);
            cur.setDate(cur.getDate() - ((cur.getDay() + 6) % 7)); // lunedì
        } else {
            cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        }
        let guard = 0;
        while (pct(cur) < 100 && guard++ < 400) {
            const next = new Date(cur);
            if (zoom === 'week') next.setDate(next.getDate() + 7);
            else next.setMonth(next.getMonth() + 1);
            const left  = Math.max(pct(cur), 0);
            const right = Math.min(pct(next), 100);
            const label = zoom === 'week' ? dayjs(cur).format('DD/MM') : dayjs(cur).format('MMM YYYY');
            columns.push({ label, width: Math.max(right - left, 0.01) });
            if (left > 0 && left < 100) boundaries.push(left);
            cur = next;
        }
        return { columns, boundaries };
    },

    _ganttBuildHeader: function(scale, zoom) {
        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        scale.columns.forEach(c => {
            html += `<div class="gantt-month${zoom === 'week' ? ' gantt-month--week' : ''}" style="width:${c.width.toFixed(2)}%">${this._escapeHtml(c.label)}</div>`;
        });
        html += '</div></div></div>';
        return html;
    },

    _htmlGanttRow: function(p, today, pct, todayPct, todayLabel, isCustomSort, gridHtml) {
        const startD = p.devStart || p.dataTest || p.dataProd || p.dataIA;
        const endD   = p.devEnd   || startD;
        const leftPct  = startD ? pct(startD) : 0;
        const widthPct = (startD && endD) ? Math.max(pct(endD) - leftPct, 0.5) : 0;
        const barOpacity = (p.devStart && p.devEnd) ? 1 : 0.2;

        const badgesHtml = (p.fornitori || [])
            .map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge mb-1'))
            .join('');
        const ganttJiraLinks = this.jiraLinksOf(p);
        const ganttJiraHtml  = this.jiraLinksHtml(ganttJiraLinks);
        const isPast    = p.dataProd && new Date(p.dataProd) <= today;
        const autoStale = this.isAutoStale(p);
        const isHidden  = this.isHiddenForUI(p);

        let rowCls = isPast ? ' gantt-row--released' : '';
        if (isHidden) rowCls += ' opacity-50';

        const statusIcon = p.hidden   ? `<span class="badge bg-dark ms-1" title="Archiviato">${this._icon('archive')}</span>`
                         : autoStale  ? `<span class="badge bg-secondary ms-1" title="Auto-archiviato">${this._icon('clock')}</span>`
                         : '';

        const ganttProgressHtml = (p.progress != null)
            ? `<div class="progress mt-1" style="height:4px;" title="Avanzamento: ${p.progress}%">
                 <div class="progress-bar ${p.progress >= 100 ? 'bg-success' : 'bg-primary'}" style="width:${p.progress}%"></div>
               </div>`
            : '';

        const milestonesHtml = this._htmlGanttMilestones(p, pct);
        const pColors = this._projectColors(p.nome);
        let rowAttr = '', dragHandleHtml = '';
        if (isCustomSort) {
            rowCls += ' draggable';
            rowAttr = `draggable="true" ondragstart="app.handleDragStart(event,'${p.id}')" ondragover="app.handleDragOver(event)" ondrop="app.handleDrop(event,'${p.id}')" ondragenter="app.handleDragEnter(event)" ondragleave="app.handleDragLeave(event)" ondragend="app.handleDragEnd(event)"`;
            dragHandleHtml = `<div class="drag-handle" title="Trascina per riordinare">${this._icon('gantt')}</div>`;
        }

        return `
        <div class="gantt-row${rowCls}" ${rowAttr} style="border-left:4px solid ${pColors.border};">
            <div class="gantt-project-col">
                ${dragHandleHtml}
                <div>
                    <strong>${this._escapeHtml(p.nome || 'Senza nome')} ${statusIcon}</strong>
                    ${ganttProgressHtml}
                    <div class="gantt-supplier-list">${badgesHtml}</div>
                    ${ganttJiraHtml ? `<div class="mt-1">${ganttJiraHtml}</div>` : ''}
                </div>
            </div>
            <div class="gantt-timeline-col">
                ${gridHtml}
                <div class="gantt-bar" role="button" tabindex="0" onclick="app.openModal('${p.id}')" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();app.openModal('${p.id}');}" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;opacity:${barOpacity};background-color:${pColors.barBg};border:1px solid ${pColors.barBorder};box-shadow:none;" title="${startD ? `Sviluppo: ${dayjs(startD).format('DD/MM/YYYY')} - ${dayjs(endD).format('DD/MM/YYYY')}` : 'Sviluppo: date non impostate'} — clicca per modificare">
                    ${p.progress != null && p.progress > 0 ? `<div class="gantt-bar-progress" style="width:${Math.max(0, Math.min(p.progress, 100))}%" title="Avanzamento: ${p.progress}%"></div>` : ''}
                    ${widthPct > 8 ? `<span>${this._icon('sliders')} Sviluppo</span>` : ''}
                </div>
                ${milestonesHtml}
                <div class="gantt-today-line" style="position:absolute;top:0;bottom:0;left:${todayPct}%;width:2px;background:rgba(220,53,69,0.65);pointer-events:none;z-index:5;" title="Oggi: ${dayjs(today).format('DD/MM/YYYY')}">
                    <span style="position:absolute;top:2px;left:4px;font-size:0.65rem;font-weight:700;color:#dc3545;white-space:nowrap;line-height:1;">${todayLabel}</span>
                </div>
            </div>
        </div>`;
    },

    _htmlGanttMilestones: function(p, pct) {
        const ic = k => this._icon(k);
        let allMilestones = [
            { date: p.dataIA,            cls: 'ms-ia',         icon: ic('sparkles'), label: 'Consegna IA',           always: true  },
            { date: p.devStart,          cls: 'ms-dev-start',  icon: ic('play'),     label: 'Inizio Sviluppo',       always: true  },
            { date: p.devEnd,            cls: 'ms-dev-end',    icon: ic('stop'),     label: 'Fine Sviluppo',         always: true  },
            { date: p.dataUAT,           cls: 'ms-uat',        icon: ic('users'),    label: 'UAT',                   always: false },
            { date: p.dataBS,            cls: 'ms-bs',         icon: ic('briefcase'),label: 'Business Simulation',   always: false },
            { date: p.dataTest,          cls: 'ms-test',       icon: ic('flask'),    label: 'Rilascio Test',         always: true  },
            { date: p.dataProd,          cls: 'ms-prod',       icon: ic('rocket'),   label: 'Rilascio Prod',         always: true  },
            { date: p.dataScadenzaStima, cls: 'ms-scad-stima', icon: ic('trayDown'), label: 'Scad. Stima Fornitore', always: false },
            { date: p.dataConfigSistema, cls: 'ms-config-sis', icon: ic('gear'),     label: 'Config Sistema',        always: false }
        ];
        (p.customMilestones || []).forEach(cm => allMilestones.push({ date: cm.date, cls: 'ms-custom', icon: ic('star'), label: cm.label, always: false }));
        allMilestones = allMilestones.filter(m => m.date && m.date.trim() !== '');

        const dateGroups = {};
        allMilestones.forEach(m => { (dateGroups[m.date] = dateGroups[m.date] || []).push(m); });
        allMilestones.forEach(m => { m.offsetPx = (dateGroups[m.date].indexOf(m) - (dateGroups[m.date].length - 1) / 2) * 26; });

        return allMilestones.map(m => {
            const isCustom   = m.cls === 'ms-custom';
            const translateX = (-16 + m.offsetPx).toFixed(0);
            return `<div class="gantt-milestone ${m.cls}" style="left:${pct(m.date).toFixed(2)}%;transform:translateX(${translateX}px);" title="${this._escapeAttr(m.label)}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                <span class="ms-date"${isCustom ? ' style="color:#198754;"' : ''}>${dayjs(m.date).format('DD/MM')}</span>
                <span class="ms-icon">${m.icon}</span>
                <span class="ms-line"${isCustom ? ' style="background:#198754;"' : ''}></span>
            </div>`;
        }).join('');
    },

    _ganttBuildLegend: function(data) {
        const has = key => data.some(p => p[key] && p[key].trim && p[key].trim() !== '');
        const hasCustom = data.some(p => p.customMilestones && p.customMilestones.length > 0);
        const hasProgress = data.some(p => p.progress != null && p.progress > 0);
        const item = (icon, label) => `<div class="gantt-legend-item"><span class="legend-ms">${this._icon(icon)}</span> ${label}</div>`;
        return `
        <div class="gantt-legend">
            <div class="gantt-legend-item"><span class="legend-bar"></span> Fase di Sviluppo</div>
            ${hasProgress ? `<div class="gantt-legend-item"><span class="legend-bar legend-bar--progress"></span> Avanzamento</div>` : ''}
            ${item('sparkles', 'Consegna IA')}
            ${item('play', 'Inizio Sviluppo')}
            ${item('stop', 'Fine Sviluppo')}
            ${has('dataUAT')           ? item('users', 'UAT') : ''}
            ${has('dataBS')            ? item('briefcase', 'Business Simulation') : ''}
            ${item('flask', 'Rilascio Test')}
            ${item('rocket', 'Rilascio Prod')}
            ${has('dataScadenzaStima') ? item('trayDown', 'Scad. Stima Fornitore') : ''}
            ${has('dataConfigSistema') ? item('gear', 'Config Sistema') : ''}
            ${hasCustom               ? `<div class="gantt-legend-item"><span class="legend-ms legend-ms--custom">${this._icon('star')}</span> Milestone Personalizzate</div>` : ''}
        </div></div>`;
    },

    // ─── AGENDA 14 GIORNI ───────────────────────────────────────────────────

    openAgenda: function() {
        if (!this.agendaOffcanvas) return;
        this.renderAgenda();
        this.agendaOffcanvas.show();
    },

    // Milestone dei progetti (con gli stessi filtri del calendario) + promemoria
    // aperti, limitati a oggi + 13 giorni. Nessun evento con data passata.
    _agendaEvents: function() {
        const start = dayjs(this._today).startOf('day');
        const end   = start.add(13, 'day');
        const inRange = d => {
            const x = dayjs(d).startOf('day');
            return x.isValid() && !x.isBefore(start) && !x.isAfter(end);
        };
        const globals = this._globalFilters();
        const showHiddenPrefs = this._getChecked('calShowHiddenPrefs');
        const prefs = this.getMeta().eventPrefs || {};
        const events = [];

        this.getProjectsOnly()
            .filter(p => this._matchesGlobalFilters(p, globals))
            .forEach(p => {
                const nome = p.nome || 'Senza nome';
                this.MILESTONES.forEach(m => {
                    const v = p[m.key];
                    if (!v || !inRange(v)) return;
                    if (prefs[`ms_${p.id}_${m.key}`] === 'hide' && !showHiddenPrefs) return;
                    events.push({ date: dayjs(v).format('YYYY-MM-DD'), title: `${nome} — ${m.label}`, label: m.label, kind: 'milestone', note: '' });
                });
                (p.customMilestones || []).forEach(cm => {
                    if (!cm.date || !inRange(cm.date)) return;
                    if (prefs[`custom_${p.id}_${this._hashString(cm.label)}`] === 'hide' && !showHiddenPrefs) return;
                    const label = `⭐ ${cm.label || 'Milestone'}`;
                    events.push({ date: dayjs(cm.date).format('YYYY-MM-DD'), title: `${nome} — ${label}`, label, kind: 'milestone', note: '' });
                });
            });

        (this.getMeta().manualReminders || []).forEach(r => {
            if (!r || !r.date || r.done || !inRange(r.date)) return;
            const proj = r.projectId ? this.data.find(p => p.id === r.projectId) : null;
            events.push({
                date: dayjs(r.date).format('YYYY-MM-DD'), title: r.title || 'Promemoria',
                label: 'Promemoria', kind: 'reminder', note: r.note || '', project: proj ? proj.nome : ''
            });
        });

        events.sort((a, b) => a.date.localeCompare(b.date) || a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
        return events;
    },

    renderAgenda: function() {
        const list = document.getElementById('agendaList');
        if (!list) return;
        const events = this._agendaEvents();
        const start = dayjs(this._today).startOf('day');
        const end   = start.add(13, 'day');
        const todayStr = start.format('YYYY-MM-DD');
        const range = document.getElementById('agendaRange');
        if (range) range.textContent = `${start.format('DD/MM/YYYY')} — ${end.format('DD/MM/YYYY')} · ${events.length} eventi`;

        const byDate = {};
        events.forEach(ev => { (byDate[ev.date] = byDate[ev.date] || []).push(ev); });
        const weekdays = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
        let html = '';
        for (let i = 0; i < 14; i++) {
            const d = start.add(i, 'day');
            const key = d.format('YYYY-MM-DD');
            const items = byDate[key] || [];
            html += `
            <div class="agenda-day${items.length ? '' : ' agenda-day--empty'}${key === todayStr ? ' agenda-day--today' : ''}">
                <div class="agenda-day__head">
                    <strong>${d.format('DD')} ${weekdays[d.day()]} ${d.format('MMM')}</strong>
                    ${key === todayStr ? '<span class="badge bg-danger">OGGI</span>' : ''}
                    <span class="agenda-day__count">${items.length}</span>
                </div>
                ${items.length ? items.map(ev => `
                    <div class="agenda-event agenda-event--${ev.kind}">
                        <span class="agenda-event__label">${this._escapeHtml(ev.label)}</span>
                        <div class="agenda-event__title">${this._escapeHtml(ev.title)}</div>
                        ${ev.note ? `<div class="agenda-event__note">${this._escapeHtml(ev.note)}</div>` : ''}
                    </div>`).join('') : '<div class="agenda-day__empty">Nessun evento</div>'}
            </div>`;
        }
        list.innerHTML = html;
    },

    exportAgendaIcs: function() {
        const events = this._agendaEvents();
        if (!events.length) {
            this.showAlert('Nessun evento nei prossimi 14 giorni da esportare.', 'warning');
            return;
        }
        try {
            const blob = new Blob([this._agendaIcs(events)], { type: 'text/calendar;charset=utf-8' });
            const url  = URL.createObjectURL(blob);
            const a    = document.createElement('a');
            a.href     = url;
            a.download = `pm-tracker-agenda-${dayjs().format('YYYY-MM-DD')}.ics`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 1000);
            this.showAlert(`Esportati ${events.length} eventi in .ics.`, 'success');
        } catch (e) {
            console.error('exportAgendaIcs:', e);
            this.showAlert(`Esportazione .ics non riuscita: ${e.message}`, 'danger');
        }
    },

    _agendaIcs: function(events) {
        const esc = s => String(s == null ? '' : s)
            .replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,')
            .replace(/\r?\n/g, '\\n');
        const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
        const lines = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//PM Tracker//Agenda 14 giorni//IT',
            'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:PM Tracker Agenda 14 giorni'
        ];
        events.forEach((ev, i) => {
            const d = dayjs(ev.date);
            const next = d.add(1, 'day');
            const desc = [ev.label, ev.project, ev.note].filter(Boolean).join(' — ');
            lines.push(
                'BEGIN:VEVENT',
                `UID:${d.format('YYYYMMDD')}-${i}-${this._hashString(ev.title)}@pmtracker`,
                `DTSTAMP:${stamp}`,
                `DTSTART;VALUE=DATE:${d.format('YYYYMMDD')}`,
                `DTEND;VALUE=DATE:${next.format('YYYYMMDD')}`,
                `SUMMARY:${esc(ev.title)}`,
                `DESCRIPTION:${esc(desc)}`,
                'END:VEVENT'
            );
        });
        lines.push('END:VCALENDAR');
        return lines.join('\r\n') + '\r\n';
    },

    // ─── RENDER CALENDAR ─────────────────────────────────────────────────────

    _calIsPast: function(dateStr, milestoneKey) {
        if (!dateStr) return false;
        if ((this.ALWAYS_HIGHLIGHT_KEYS || []).includes(milestoneKey)) return false;
        return new Date(dateStr) < this._today;
    },

    setEventPref: async function(key, pref) {
        const meta = this.getMeta();
        if (pref === 'show') delete meta.eventPrefs[key];
        else meta.eventPrefs[key] = pref;
        this.renderCalendar();
        await this.saveData();
    },

    _renderEventCard: function(ev, todayStr, compact) {
        const fb = (ev.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge me-1 mb-1')).join('');
        const calJiraHtml  = (!ev.reminder && ev.jiraLinks && ev.jiraLinks.length > 0) ? this.jiraLinksHtml(ev.jiraLinks) : '';
        const isReminder   = !!ev.reminder;
        const isPastGray   = !!ev.pastGray && !isReminder;
        const isUserGray   = !!ev.userGray;
        const isHiddenPref = !!ev.isHiddenPref;
        const isToday      = ev.date.format('YYYY-MM-DD') === todayStr;
        const isExpiredRem = isReminder && !ev.done && ev.date.format('YYYY-MM-DD') < todayStr;

        let opacityCls = isHiddenPref ? 'opacity-25' : ev.hidden ? 'opacity-50' : (isPastGray || isUserGray) ? 'opacity-75 cal-event--past' : '';
        const titleCls = (isReminder && ev.done) ? 'text-decoration-line-through' : ((isPastGray || isUserGray || isHiddenPref) ? 'text-muted' : '');

        let borderCls = 'border shadow-sm', bgCls = '', customStyle = '';
        if (isReminder) {
            bgCls     = isExpiredRem ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10';
            borderCls = isExpiredRem ? 'border border-danger border-opacity-75 shadow-sm' : 'border border-warning border-opacity-50 shadow-sm';
        } else {
            const pColors = this._projectColors(ev.nome);
            customStyle = `background-color:color-mix(in srgb, ${pColors.border} 12%, transparent);border-left:4px solid ${pColors.border} !important;border-top:1px solid var(--tp-border);border-right:1px solid var(--tp-border);border-bottom:1px solid var(--tp-border);`;
        }
        if (isToday) {
            borderCls    = 'border border-danger border-2 shadow';
            customStyle += isReminder ? '' : ' border-color:#dc3545 !important; border-left:4px solid #dc3545 !important;';
            if (isReminder) bgCls = 'bg-warning bg-opacity-25';
        }

        const statusIcon = ev.autoStale ? `<span title="Auto-archiviato">${this._icon('clock')}</span>`
                         : (isReminder && ev.done) ? `<span class="text-success" title="Completato">${this._icon('checkCircle')}</span>` : '';

        const doneAtHtml = (isReminder && ev.done && ev.doneAt)
            ? `<div class="text-muted mt-1" style="font-size:0.72rem;">${this._icon('check')} Completato il ${this._formatDoneAt(ev.doneAt)}</div>` : '';

        const reminderMenuItems = isReminder ? `
            <li><a class="dropdown-item py-2 ${ev.done ? 'text-secondary' : 'text-success fw-semibold'}" href="#" onclick="app.toggleReminderDone('${ev.reminderId}');return false;">${ev.done ? this._icon('refresh') + ' Riapri' : this._icon('check') + ' Segna come fatto'}</a></li>
            <li><a class="dropdown-item py-2" href="#" onclick="app.editReminder('${ev.reminderId}');return false;">${this._icon('pencil')} Modifica</a></li>
            <li><a class="dropdown-item py-2 text-danger" href="#" onclick="app.deleteReminder('${ev.reminderId}');return false;">${this._icon('trash')} Elimina</a></li>
            <li><hr class="dropdown-divider"></li>` : '';

        const visMenuItems = `
            ${ev.pref !== 'hide' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','hide');return false;">${this._icon('eyeOff')} Nascondi</a></li>` : ''}
            ${ev.pref !== 'gray' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','gray');return false;">${this._icon('halfCircle')} Ingrigisci</a></li>` : ''}
            ${ev.pref ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item py-2 text-success" href="#" onclick="app.setEventPref('${ev.prefKey}','show');return false;">${this._icon('eye')} Mostra Normale</a></li>` : ''}`;

        if (compact) {
            return `
            <div class="cal-event-item d-flex align-items-start gap-2 p-2 rounded mb-2 ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle}font-size:0.85rem;">
                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                        <span class="badge ${ev.badge} me-1" style="font-size:0.7rem;">${ev.label}</span>
                        <span class="text-muted" style="font-size:0.75rem;">${ev.date.format('DD/MM')}</span>
                        ${isExpiredRem ? '<span class="badge bg-danger ms-1 small">Scaduto</span>' : ''}
                        ${isHiddenPref ? '<span class="badge bg-dark" style="font-size:0.65rem;">Nascosto</span>' : ''}
                        ${isUserGray   ? '<span class="badge bg-secondary" style="font-size:0.65rem;">Ingrigito</span>' : ''}
                    </div>
                    <div class="fw-semibold ${titleCls}" style="font-size:0.85rem;word-break:break-word;">${ev.nome} ${statusIcon}</div>
                    ${doneAtHtml}
                    ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                    ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                    ${fb ? `<div class="mt-1 d-flex flex-wrap">${fb}</div>` : ''}
                </div>
                <div class="dropdown flex-shrink-0">
                    <button class="btn btn-sm cal-more-btn" type="button" data-bs-toggle="dropdown" aria-label="Opzioni">${this._icon('more')}</button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">${reminderMenuItems}${visMenuItems}</ul>
                </div>
            </div>`;
        }

        return `
        <div class="cal-event-item d-flex align-items-start gap-3 p-3 rounded ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle}">
            <div class="cal-event-date text-center" style="min-width:50px;">
                <div class="fw-bold fs-5 ${isToday ? 'text-danger' : (isPastGray||isUserGray||isHiddenPref ? 'text-muted' : isReminder ? 'text-warning text-dark' : 'text-primary')}">${ev.date.format('DD')}</div>
                <div class="small text-uppercase ${isToday ? 'text-danger fw-bold' : (isReminder&&!isPastGray&&!isUserGray ? 'text-warning text-dark' : 'text-muted')}">${ev.date.format('MMM')}</div>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
                    <span class="badge ${ev.badge}">${ev.label}</span>
                    ${isToday      ? '<span class="badge bg-danger">OGGI</span>' : ''}
                    ${isHiddenPref ? '<span class="badge bg-dark">Nascosto</span>' : ''}
                    ${isUserGray   ? '<span class="badge bg-secondary">Ingrigito</span>' : ''}
                </div>
                <div class="fw-semibold fs-6 ${titleCls}">${ev.nome} ${statusIcon}</div>
                ${doneAtHtml}
                ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2 ms-1">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                ${fb ? `<div class="mt-2 d-flex flex-wrap">${fb}</div>` : ''}
            </div>
            <div class="dropdown flex-shrink-0 ms-2">
                <button class="btn btn-sm cal-more-btn" type="button" data-bs-toggle="dropdown" title="Opzioni" aria-label="Opzioni">${this._icon('more')}</button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm small">${reminderMenuItems}${visMenuItems}</ul>
            </div>
        </div>`;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;
        const filtMile   = this._getVal('calendarMilestoneFilter');
        const calShowHiddenPrefs = this._getChecked('calShowHiddenPrefs');
        const globals    = this._globalFilters();

        const showProjectMilestones = true;
        const showCustomMilestones  = filtMile === '' || filtMile === 'custom';
        const milestonesToUse = (filtMile && filtMile !== 'custom')
            ? this.MILESTONES.filter(m => m.key === filtMile)
            : this.MILESTONES;

        const events = [];
        const meta     = this.getMeta();
        const prefs    = meta.eventPrefs || {};
        const todayStr = dayjs().format('YYYY-MM-DD');

        if (showProjectMilestones) {
            this.getProjectsOnly()
                .filter(p => this._matchesGlobalFilters(p, globals))
                .forEach(p => {
                    const isHidden  = this.isHiddenForUI(p);
                    const autoStale = this.isAutoStale(p);
                    const pJiraLinks = this.jiraLinksOf(p);

                    milestonesToUse.forEach(m => {
                        const v = p[m.key];
                        if (!v || v.trim() === '') return;
                        const prefKey = `ms_${p.id}_${m.key}`;
                        const pref    = prefs[prefKey];
                        if (pref === 'hide' && !calShowHiddenPrefs) return;
                        const pastGray = this._calIsPast(v, m.key);
                        events.push({
                            date: dayjs(v), sortKey: v, nome: p.nome,
                            fornitori: p.fornitori || [], jiraLinks: pJiraLinks,
                            label: m.label,
                            badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : m.badge,
                            pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                            prefKey, pref, milestoneKey: m.key, autoStale, hidden: isHidden
                        });
                    });

                    if (showCustomMilestones) {
                        (p.customMilestones || []).forEach(cm => {
                            if (!cm.date || cm.date.trim() === '') return;
                            const prefKey = `custom_${p.id}_${this._hashString(cm.label)}`;
                            const pref    = prefs[prefKey];
                            if (pref === 'hide' && !calShowHiddenPrefs) return;
                            const pastGray = this._calIsPast(cm.date, 'custom');
                            events.push({
                                date: dayjs(cm.date), sortKey: cm.date, nome: p.nome,
                                fornitori: p.fornitori || [], jiraLinks: pJiraLinks,
                                label: `\u2B50 ${cm.label}`,
                                badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : 'bg-success',
                                pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                                prefKey, pref, milestoneKey: 'custom', autoStale, hidden: isHidden
                            });
                        });
                    }
                });
        }

        this._syncReminderFormState();
        this.renderRemindersSheet();

        if (events.length === 0) {
            container.innerHTML = "<div class='col-12'><p class='text-center text-muted p-3'>Nessun evento da visualizzare per i filtri selezionati.</p></div>";
            return;
        }

        const hlMilestones = events.filter(ev => !ev.reminder && ev.sortKey === todayStr && !ev.isHiddenPref);
        hlMilestones.sort((a,b) => a.sortKey.localeCompare(b.sortKey));
        const hasHighlights = hlMilestones.length > 0;

        let html = `
        <div class="col-12 mb-3">
            <div class="cal-page-head">
                <h2 class="cal-page-title">${this._icon('calendar')} Calendario rilasci</h2>
            </div>
        </div>
        <div class="col-12">
            <div class="row g-4" style="position:relative;">`;

        if (hasHighlights) {
            html += `
            <div class="col-12 cal-highlights-wrapper">
                <div class="cal-highlights-card">
                    <div class="cal-highlights-header">
                        <span class="cal-highlights-icon">${this._icon('sparkles')}</span>
                        <span class="cal-highlights-title">Highlights di oggi</span>
                        <span class="cal-highlights-date">${dayjs().format('DD/MM/YYYY')}</span>
                    </div>
                    <div class="p-3">
                        <div class="small fw-semibold text-muted text-uppercase mb-2" style="letter-spacing:.05em;">${this._icon('rocket')} Milestone di oggi</div>
                        ${hlMilestones.map(ev => this._renderEventCard(ev, todayStr, true)).join('')}
                    </div>
                </div>
            </div>`;
        }

        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });

        Object.keys(groups).sort().forEach(k => {
            const sorted = groups[k].events.sort((a, b) => {
                const inactive = ev => (ev.isHiddenPref || ev.hidden || ev.userGray || (ev.pastGray && !ev.reminder) || (ev.reminder && ev.done)) ? 1 : 0;
                const diff = inactive(a) - inactive(b);
                return diff !== 0 ? diff : a.sortKey.localeCompare(b.sortKey);
            });
            html += `
            <div class="col-md-6 col-xl-4" data-month="${k}">
                <div class="card h-100 cal-month-card">
                    <div class="card-header cal-month-head">
                        <h6>${groups[k].label}</h6>
                        <span class="cal-month-count">${sorted.length}</span>
                    </div>
                    <div class="card-body p-3"><div class="d-flex flex-column gap-2">
                        ${sorted.map(ev => this._renderEventCard(ev, todayStr, false)).join('')}
                    </div></div>
                </div>
            </div>`;
        });

        html += `</div></div>`;
        container.innerHTML = html;

        // Attiva IntersectionObserver per lo sticky shadow sull'highlights wrapper
        this._initHighlightsSticky();
    },

    // ─── UTILITY ─────────────────────────────────────────────────────────────

    formatDate: function(d) {
        return d ? dayjs(d).format('DD/MM/YY') : 'N/A';
    },

    showAlert: function(msg, type = 'info', timeout = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toastId = 'toast-' + Date.now();
        const icons   = { success: this._icon('checkCircle'), danger: this._icon('alert'), warning: this._icon('alert'), info: this._icon('info') };
        const bgClass = type === 'warning' ? 'text-bg-warning' : type === 'info' ? 'text-bg-info text-dark' : `text-bg-${type}`;
        container.insertAdjacentHTML('beforeend', `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${timeout}">
            <div class="d-flex">
                <div class="toast-body fw-semibold d-flex align-items-center gap-2">
                    <span>${icons[type] || this._icon('info')}</span><span>${msg}</span>
                </div>
                <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`);
        const toastEl = document.getElementById(toastId);
        const toast   = new bootstrap.Toast(toastEl);
        toast.show();
        toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
