const app = {
    data: [],
    config: { owner: '', repo: '', token: '', path: 'data/projects.json' },
    sha: null,
    lastETag: null,
    searchTimeout: null,
    editorModal: null,
    settingsModal: null,
    MAX_JIRA_LINKS: 10,
    MAX_CUSTOM_MILESTONES: 5,
    META_ID: '__pm_tracker_meta__',
    _editingReminderId: null,

    ALWAYS_HIGHLIGHT_KEYS: ['devStart', 'devEnd', 'dataTest'],

    MILESTONES: [
        { key: 'dataIA',            label: '🤖 Consegna IA',           badge: 'bg-info text-dark' },
        { key: 'devStart',          label: '▶️ Inizio Sviluppo',        badge: 'bg-primary' },
        { key: 'devEnd',            label: '⏹️ Fine Sviluppo',          badge: 'bg-secondary' },
        { key: 'dataUAT',           label: '👥 UAT',                    badge: 'bg-info' },
        { key: 'dataBS',            label: '💼 Business Simulation',    badge: 'bg-dark' },
        { key: 'dataTest',          label: '🧪 Rilascio Test',          badge: 'bg-warning text-dark' },
        { key: 'dataProd',          label: '🚀 Rilascio Prod',          badge: 'bg-success' },
        { key: 'dataScadenzaStima', label: '📥 Scad. Stima Fornitore', badge: 'bg-light text-dark border' },
        { key: 'dataConfigSistema', label: '🔧 Config Sistema',         badge: 'bg-light text-dark border' }
    ],

    OWNER_COLORS: {
        'simone': { bg: '#0d6efd', fg: '#ffffff' },
        'flavia': { bg: '#6f42c1', fg: '#ffffff' },
        'andrea': { bg: '#ffc107', fg: '#212529' },
    },

    // ─── HELPERS GENERICI ────────────────────────────────────────────────────

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

            ['p_stimaGgu', 'p_rcFornitore'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', () => this.calcCosto());
            });

            const savedCfg = localStorage.getItem('pm_tracker_config');
            if (savedCfg) {
                this.config = JSON.parse(savedCfg);
                this.loadData();
            } else {
                this.showSettings();
            }
        } catch (err) {
            console.error(err);
            this.showAlert(`Errore critico avvio: ${err.message}`, 'danger');
        }
    },

    debouncedRenderTable: function() {
        if (this.searchTimeout) clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => this.renderTable(), 300);
    },

    // ─── SETTINGS ────────────────────────────────────────────────────────────

    showSettings: function() {
        ['owner', 'repo', 'token', 'path'].forEach(k => this._setVal(`cfg_${k}`, this.config[k]));
        this.settingsModal.show();
    },

    saveSettings: function() {
        ['owner', 'repo', 'token'].forEach(k => this.config[k] = this._getVal(`cfg_${k}`).trim());
        this.config.path = this._getVal('cfg_path').trim() || 'data/projects.json';
        localStorage.setItem('pm_tracker_config', JSON.stringify(this.config));
        this.settingsModal.hide();
        this.loadData();
    },

    // ─── LOAD / SYNC DATA ────────────────────────────────────────────────────

    loadData: async function(force = false) {
        if (!this.config.token) {
            this.showAlert('Nessun token impostato, vai su Config.', 'warning');
            return;
        }
        this.showAlert('Caricamento dati...', 'info', 1000);
        try {
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}${force ? '?t=' + Date.now() : ''}`;
            const headers = { 'Authorization': `token ${this.config.token}`, 'Accept': 'application/vnd.github.v3+json' };
            if (!force && this.lastETag) headers['If-None-Match'] = this.lastETag;
            const response = await fetch(url, { headers, cache: force ? 'no-cache' : 'default' });
            if (response.status === 304) {
                this.renderAll();
                this.showAlert('Dati già aggiornati (Cache)', 'success', 2000);
                return;
            }
            if (!response.ok) throw new Error(`Errore GitHub: ${response.status}`);
            this.lastETag = response.headers.get('ETag');
            const json = await response.json();
            this.sha  = json.sha;
            this.data = JSON.parse(decodeURIComponent(escape(atob(json.content)))).map(p => this.normalizeProject(p));
            this.getMeta();
            this.populateFornitoreFilters();
            this.populateOwnerFilters();
            this.renderAll();
            this.showAlert('Dati scaricati con successo!', 'success', 2000);
        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger', 5000);
        }
    },

    syncToGithub: async function() {
        this.showAlert('Salvataggio in corso...', 'info', 2000);
        try {
            const content  = btoa(unescape(encodeURIComponent(JSON.stringify(this.data, null, 2))));
            const url      = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${this.config.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Update data via PM Tracker webapp - ${new Date().toISOString()}`, content, sha: this.sha })
            });
            if (!response.ok) {
                if (response.status === 409) throw new Error('⚠️ Conflitto di versione! Il file è stato modificato da un\'altra pagina o persona. Ricarica la pagina per evitare di perdere dati.');
                const err = await response.json();
                throw new Error(err.message || 'Salvataggio fallito');
            }
            const result = await response.json();
            this.sha = result.content.sha;
            this.lastETag = null;
            this.showAlert('Salvataggio completato!', 'success', 3000);
            await this.loadData();
        } catch (e) {
            console.error('Errore sync:', e);
            this.showAlert(`Errore salvataggio: ${e.message}`, 'danger', 8000);
        }
    },

    // ─── RENDER ALL ──────────────────────────────────────────────────────────

    renderAll: function() {
        try {
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
        } catch (err) {
            console.error('Errore in renderAll:', err);
            this.showAlert(`Errore visualizzazione: ${err.message}`, 'danger');
        }
    },

    // ─── UTILITY ─────────────────────────────────────────────────────────────

    formatDate: function(d) {
        return d ? dayjs(d).format('DD/MM/YY') : 'N/A';
    },

    showAlert: function(msg, type = 'info', timeout = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toastId = 'toast-' + Date.now();
        const icons   = { success: '✅', danger: '❌', warning: '⚠️', info: 'ℹ️' };
        const bgClass = type === 'warning' ? 'text-bg-warning' : type === 'info' ? 'text-bg-info text-dark' : `text-bg-${type}`;
        container.insertAdjacentHTML('beforeend', `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${timeout}">
            <div class="d-flex">
                <div class="toast-body fw-semibold d-flex align-items-center gap-2">
                    <span>${icons[type] || 'ℹ️'}</span><span>${msg}</span>
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
