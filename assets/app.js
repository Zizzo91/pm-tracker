const app = {
    data: [],
    config: {
        owner: '',
        repo: '',
        token: '',
        path: 'data/projects.json'
    },
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
        { key: 'dataIA',            label: '\uD83E\uDD16 Consegna IA',           badge: 'bg-info text-dark' },
        { key: 'devStart',          label: '\u25B6\uFE0F Inizio Sviluppo',        badge: 'bg-primary' },
        { key: 'devEnd',            label: '\u23F9\uFE0F Fine Sviluppo',          badge: 'bg-secondary' },
        { key: 'dataUAT',           label: '\uD83D\uDC65 UAT',                    badge: 'bg-info' },
        { key: 'dataBS',            label: '\uD83D\uDCBC Business Simulation',    badge: 'bg-dark' },
        { key: 'dataTest',          label: '\uD83E\uDDEA Rilascio Test',          badge: 'bg-warning text-dark' },
        { key: 'dataProd',          label: '\uD83D\uDE80 Rilascio Prod',          badge: 'bg-success' },
        { key: 'dataScadenzaStima', label: '\uD83D\uDCE5 Scad. Stima Fornitore', badge: 'bg-light text-dark border' },
        { key: 'dataConfigSistema', label: '\uD83D\uDD27 Config Sistema',         badge: 'bg-light text-dark border' }
    ],

    OWNER_COLORS: {
        'simone': { bg: '#0d6efd', fg: '#ffffff' },
        'flavia': { bg: '#6f42c1', fg: '#ffffff' },
        'andrea': { bg: '#ffc107', fg: '#212529' },
    },

    init: function() {
        try {
            this.editorModal = new bootstrap.Modal(document.getElementById('editorModal'));
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

    isMeta: function(p) {
        return !!p && ((p.type && p.type === 'meta') || p.id === this.META_ID);
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
        if (p && ((p.type && p.type === 'meta') || p.id === this.META_ID)) {
            const manualReminders = Array.isArray(p.manualReminders) ? p.manualReminders : [];
            const eventPrefs = p.eventPrefs || {};
            return { ...p, id: p.id || this.META_ID, type: 'meta', manualReminders, eventPrefs };
        }
        const owners    = this.csvToArray(p.owners || p.owner);
        const fornitori = this.csvToArray(p.fornitori);
        const customMilestones = Array.isArray(p.customMilestones) ? p.customMilestones : [];
        const hidden = !!p.hidden;
        return { ...p, owners, fornitori, customMilestones, hidden };
    },

    isAutoStale: function(p) {
        try {
            if (!p || this.isMeta(p)) return false;
            if (p.hidden) return false;
            if (!p.dataProd || p.dataProd.trim() === '') return false;
            const prodDate = new Date(p.dataProd);
            if (isNaN(prodDate.getTime())) return false;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return prodDate < oneMonthAgo;
        } catch (e) {
            console.error("Errore in isAutoStale:", e);
            return false;
        }
    },

    isHiddenForUI: function(p) {
        if (!p || this.isMeta(p)) return true;
        return p.hidden || this.isAutoStale(p);
    },

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
        const key = (name || '').toString().trim().toLowerCase();
        if (kind === 'owner' && this.OWNER_COLORS[key]) return this.OWNER_COLORS[key];
        return this._autoColor(name, kind);
    },

    _badgeStyle: function(kind, name) {
        const c = this._badgeColor(kind, name);
        return `background: ${c.bg} !important; color: ${c.fg} !important; border: 1px solid rgba(0,0,0,0.12);`;
    },

    _projectColors: function(name) {
        if (!name) return { bg: '#ffffff', border: '#dee2e6', barBg: '#0d6efd', barBorder: '#0a58ca' };
        const palette = [
            { bg: '#eef2ff', border: '#0d6efd', barBg: '#cfe2ff', barBorder: '#0a58ca' },
            { bg: '#f4f0ff', border: '#6f42c1', barBg: '#e0cffc', barBorder: '#59359a' },
            { bg: '#fdf8f5', border: '#c27b5e', barBg: '#f2d8cd', barBorder: '#9c543a' },
            { bg: '#f0fdf4', border: '#198754', barBg: '#d1f2e0', barBorder: '#146c43' },
            { bg: '#fff6f0', border: '#fd7e14', barBg: '#ffe5d0', barBorder: '#e0660b' },
            { bg: '#fff0f6', border: '#d63384', barBg: '#fccce1', barBorder: '#a32060' },
            { bg: '#f0fbff', border: '#0dcaf0', barBg: '#cff4fc', barBorder: '#0aa2c0' },
            { bg: '#fff5f5', border: '#dc3545', barBg: '#f8d7da', barBorder: '#b02a37' },
            { bg: '#fffbea', border: '#cfa00c', barBg: '#fae39d', barBorder: '#a88106' },
            { bg: '#f4f5fd', border: '#6610f2', barBg: '#e2d6fa', barBorder: '#520dc2' },
            { bg: '#f2fbf7', border: '#20c997', barBg: '#d1f7ea', barBorder: '#1aa179' },
            { bg: '#fcf3f4', border: '#9e2a2b', barBg: '#eed2d4', barBorder: '#7a2021' },
            { bg: '#fbf7f4', border: '#8b4513', barBg: '#e8d2c3', barBorder: '#66320e' },
            { bg: '#fcf0f8', border: '#8f2d56', barBg: '#ebd1e0', barBorder: '#6e2141' },
            { bg: '#f2f9f9', border: '#127369', barBg: '#cbe7e7', barBorder: '#0d544c' }
        ];
        const index = this._hashString(`fixed_palette_${name}`) % palette.length;
        return palette[index];
    },

    _badgeSpan: function(kind, name, className) {
        const safeName = (name ?? '').toString();
        return `<span class="${className}" style="${this._badgeStyle(kind, safeName)}">${safeName}</span>`;
    },

    renderCustomMilestoneFields: function(milestones) {
        const container = document.getElementById('customMilestonesContainer');
        container.innerHTML = '';
        const items = (milestones && milestones.length > 0) ? milestones : [];
        items.forEach((m, i) => this._appendCustomMilestoneField(m.label, m.date, i));
        this._updateAddCustomMilestoneBtn();
    },

    _appendCustomMilestoneField: function(label, date, index) {
        const container = document.getElementById('customMilestonesContainer');
        const wrap = document.createElement('div');
        wrap.className = 'd-flex align-items-center gap-2 mb-2 custom-milestone-row';
        wrap.dataset.milestoneIndex = index;
        wrap.innerHTML = `
            <input type="text" class="form-control form-control-sm custom-ms-label" placeholder="Nome (es: Creare Story)" value="${label ? label.replace(/"/g, '&quot;') : ''}">
            <input type="date" class="form-control form-control-sm custom-ms-date" value="${date || ''}">
            <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeCustomMilestone(this)" title="Rimuovi">&times;</button>
        `;
        container.appendChild(wrap);
    },

    addCustomMilestone: function() {
        const container = document.getElementById('customMilestonesContainer');
        const count = container.querySelectorAll('.custom-milestone-row').length;
        if (count >= this.MAX_CUSTOM_MILESTONES) return;
        this._appendCustomMilestoneField('', '', count);
        this._updateAddCustomMilestoneBtn();
    },

    removeCustomMilestone: function(btn) {
        btn.closest('.custom-milestone-row').remove();
        this._updateAddCustomMilestoneBtn();
    },

    _updateAddCustomMilestoneBtn: function() {
        const container = document.getElementById('customMilestonesContainer');
        const btn = document.querySelector('button[onclick="app.addCustomMilestone()"]');
        if (!btn) return;
        const count = container.querySelectorAll('.custom-milestone-row').length;
        btn.disabled = count >= this.MAX_CUSTOM_MILESTONES;
        btn.textContent = count >= this.MAX_CUSTOM_MILESTONES
            ? `Limite raggiunto (${this.MAX_CUSTOM_MILESTONES})`
            : '+ Aggiungi Milestone Personalizzata';
    },

    _getCustomMilestonesFromModal: function() {
        const rows = Array.from(document.querySelectorAll('.custom-milestone-row'));
        return rows.map(row => ({
            label: row.querySelector('.custom-ms-label').value.trim(),
            date: row.querySelector('.custom-ms-date').value
        })).filter(m => m.label !== '' && m.date !== '');
    },

    jiraLabel: function(url) {
        if (!url || !url.trim()) return '';
        try {
            const u = new URL(url.trim());
            const parts = u.pathname.replace(/\/$/, '').split('/');
            return parts[parts.length - 1] || url;
        } catch (e) {
            const parts = url.trim().replace(/\/$/, '').split('/');
            return parts[parts.length - 1] || url;
        }
    },

    jiraLinksHtml: function(jiraLinks) {
        if (!jiraLinks || jiraLinks.length === 0) return '';
        return jiraLinks
            .filter(u => u && u.trim())
            .map(u => `<a href="${u}" target="_blank" class="badge bg-primary text-decoration-none me-1 mb-1" title="${u}">${this.jiraLabel(u)} \uD83D\uDD17</a>`)
            .join('');
    },

    renderJiraFields: function(links) {
        const container = document.getElementById('jiraLinksContainer');
        container.innerHTML = '';
        const items = (links && links.length > 0) ? links : [''];
        items.forEach((url, i) => this._appendJiraField(url, i));
        this._updateAddJiraBtn();
    },

    _appendJiraField: function(value, index) {
        const container = document.getElementById('jiraLinksContainer');
        const wrap = document.createElement('div');
        wrap.className = 'd-flex align-items-center gap-2 mb-2';
        wrap.dataset.jiraIndex = index;
        wrap.innerHTML = `
            <input type="url" class="form-control jira-link-input" placeholder="https://..." value="${value ? value.replace(/"/g, '&quot;') : ''}">
            <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeJiraField(this)" title="Rimuovi">&times;</button>
        `;
        container.appendChild(wrap);
    },

    addJiraField: function() {
        const container = document.getElementById('jiraLinksContainer');
        const count = container.querySelectorAll('.jira-link-input').length;
        if (count >= this.MAX_JIRA_LINKS) return;
        this._appendJiraField('', count);
        this._updateAddJiraBtn();
    },

    removeJiraField: function(btn) {
        btn.closest('[data-jira-index]').remove();
        this._updateAddJiraBtn();
    },

    _updateAddJiraBtn: function() {
        const container = document.getElementById('jiraLinksContainer');
        const btn = document.getElementById('addJiraBtn');
        if (!btn) return;
        const count = container.querySelectorAll('.jira-link-input').length;
        btn.disabled = count >= this.MAX_JIRA_LINKS;
        btn.textContent = count >= this.MAX_JIRA_LINKS
            ? `Limite raggiunto (${this.MAX_JIRA_LINKS})`
            : '+ Aggiungi Link Jira';
    },

    _getJiraLinksFromModal: function() {
        return Array.from(document.querySelectorAll('.jira-link-input'))
            .map(el => el.value.trim())
            .filter(v => v !== '');
    },

    calcCosto: function() {
        const ggu = parseFloat(document.getElementById('p_stimaGgu').value);
        const rc  = parseFloat(document.getElementById('p_rcFornitore').value);
        const out = document.getElementById('p_stimaCosto');
        if (!isNaN(ggu) && !isNaN(rc) && ggu >= 0 && rc >= 0) {
            out.value = '\u20AC ' + (ggu * rc).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            out.value = '';
        }
    },

    showSettings: function() {
        document.getElementById('cfg_owner').value = this.config.owner;
        document.getElementById('cfg_repo').value  = this.config.repo;
        document.getElementById('cfg_token').value = this.config.token;
        document.getElementById('cfg_path').value  = this.config.path;
        this.settingsModal.show();
    },

    saveSettings: function() {
        this.config = {
            owner: document.getElementById('cfg_owner').value.trim(),
            repo:  document.getElementById('cfg_repo').value.trim(),
            token: document.getElementById('cfg_token').value.trim(),
            path:  document.getElementById('cfg_path').value.trim() || 'data/projects.json'
        };
        localStorage.setItem('pm_tracker_config', JSON.stringify(this.config));
        this.settingsModal.hide();
        this.loadData();
    },

    loadData: async function(force = false) {
        if (!this.config.token) {
            this.showAlert('Nessun token impostato, vai su Config.', 'warning');
            return;
        }
        this.showAlert('Caricamento dati...', 'info', 1000);
        try {
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}${force ? '?t=' + new Date().getTime() : ''}`;
            const headers = {
                'Authorization': `token ${this.config.token}`,
                'Accept': 'application/vnd.github.v3+json'
            };
            if (!force && this.lastETag) headers['If-None-Match'] = this.lastETag;
            const response = await fetch(url, { headers, cache: force ? 'no-cache' : 'default' });
            if (response.status === 304) {
                this.renderAll();
                this.showAlert('Dati gi\u00E0 aggiornati (Cache)', 'success', 2000);
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

    populateFornitoreFilters: function() {
        try {
            const projs = this.getProjectsOnly();
            const allSuppliers = [...new Set(projs.flatMap(p => p.fornitori || []))].sort();
            ['ganttFornitoreFilter', 'tableFornitoreFilter', 'calendarFornitoreFilter'].forEach(id => {
                const sel = document.getElementById(id);
                if (!sel) return;
                const current = sel.value;
                while (sel.options.length > 1) sel.remove(1);
                allSuppliers.forEach(f => {
                    const opt = document.createElement('option');
                    opt.value = f;
                    opt.textContent = f;
                    sel.appendChild(opt);
                });
                if (current && allSuppliers.includes(current)) sel.value = current;
            });
        } catch (e) { console.error("populateFornitoreFilters error", e); }
    },

    populateOwnerFilters: function() {
        try {
            const projs = this.getProjectsOnly();
            const allOwners = [...new Set(projs.flatMap(p => p.owners || []))].sort((a, b) => (a||'').localeCompare(b||'', 'it'));
            ['ganttOwnerFilter', 'tableOwnerFilter', 'calendarOwnerFilter'].forEach(id => {
                const sel = document.getElementById(id);
                if (!sel) return;
                const current = sel.value;
                while (sel.options.length > 1) sel.remove(1);
                allOwners.forEach(o => {
                    const opt = document.createElement('option');
                    opt.value = o;
                    opt.textContent = o;
                    sel.appendChild(opt);
                });
                if (current && allOwners.includes(current)) sel.value = current;
            });
        } catch(e) { console.error("populateOwnerFilters error", e); }
    },

    _updateReminderFormUI: function() {
        const isEditing = !!this._editingReminderId;
        const addBtn    = document.getElementById('rem_add_btn');
        const cancelBtn = document.getElementById('rem_cancel_btn');
        const editBanner= document.getElementById('rem_edit_banner');
        if (addBtn)     addBtn.textContent = isEditing ? '\uD83D\uDCBE Aggiorna promemoria' : '+ Aggiungi promemoria';
        if (cancelBtn)  cancelBtn.style.display = isEditing ? 'inline-block' : 'none';
        if (editBanner) editBanner.style.display = isEditing ? 'flex' : 'none';
    },

    clearReminderInputs: function() {
        const d = document.getElementById('rem_date');
        const t = document.getElementById('rem_title');
        const n = document.getElementById('rem_note');
        if (d) d.value = '';
        if (t) t.value = '';
        if (n) n.value = '';
        this._editingReminderId = null;
        this._updateReminderFormUI();
    },

    editReminder: function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        const dateEl  = document.getElementById('rem_date');
        const titleEl = document.getElementById('rem_title');
        const noteEl  = document.getElementById('rem_note');
        if (dateEl)  dateEl.value  = r.date  || '';
        if (titleEl) titleEl.value = r.title || '';
        if (noteEl)  noteEl.value  = r.note  || '';
        this._editingReminderId = id;
        this._updateReminderFormUI();
        dateEl && dateEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleEl && titleEl.focus();
    },

    addReminder: async function() {
        const dateEl  = document.getElementById('rem_date');
        const titleEl = document.getElementById('rem_title');
        const noteEl  = document.getElementById('rem_note');
        const date  = dateEl  ? dateEl.value         : '';
        const title = titleEl ? titleEl.value.trim() : '';
        const note  = noteEl  ? noteEl.value.trim()  : '';
        if (!date || !title) {
            this.showAlert('Inserisci almeno Data e Titolo per il promemoria.', 'warning', 3000);
            return;
        }
        const meta = this.getMeta();
        meta.manualReminders = meta.manualReminders || [];
        if (this._editingReminderId) {
            const r = meta.manualReminders.find(x => x.id === this._editingReminderId);
            if (r) { r.date = date; r.title = title; r.note = note; r.updatedAt = new Date().toISOString(); }
            this._editingReminderId = null;
        } else {
            meta.manualReminders.push({
                id: Date.now().toString(), date, title, note,
                done: false, createdAt: new Date().toISOString(), doneAt: null
            });
        }
        meta.manualReminders.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        if (titleEl) titleEl.value = '';
        if (noteEl)  noteEl.value  = '';
        if (dateEl)  dateEl.value  = '';
        this._updateReminderFormUI();
        await this.syncToGithub();
    },

    toggleReminderDone: async function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        r.done  = !r.done;
        r.doneAt = r.done ? new Date().toISOString() : null;
        await this.syncToGithub();
    },

    deleteReminder: async function(id) {
        if (!confirm('Eliminare questo promemoria?')) return;
        if (this._editingReminderId === id) this.clearReminderInputs();
        const meta = this.getMeta();
        meta.manualReminders = (meta.manualReminders || []).filter(x => x.id !== id);
        await this.syncToGithub();
    },

    renderReminders: function() {
        
        
        this._updateReminderFormUI();
    },

    saveProject: async function() {
        const dates = {
            stima:    document.getElementById('p_stima').value    || null,
            ia:       document.getElementById('p_ia').value       || null,
            devStart: document.getElementById('p_devStart').value || null,
            devEnd:   document.getElementById('p_devEnd').value   || null,
            test:     document.getElementById('p_test').value     || null,
            prod:     document.getElementById('p_prod').value     || null,
            uat:      document.getElementById('p_uat').value      || null,
            bs:       document.getElementById('p_bs').value       || null
        };
        let errorMsg = '';
        if (dates.stima && dates.devStart && dates.stima > dates.devStart) errorMsg = 'Stima non pu\u00F2 essere successiva a Dev Start';
        else if (dates.devStart && dates.devEnd && dates.devStart > dates.devEnd) errorMsg = 'Dev Start non pu\u00F2 essere successivo a Dev End';
        else if (dates.devEnd && dates.test && dates.devEnd > dates.test) errorMsg = 'Dev End non pu\u00F2 essere successivo al Test';
        else if (dates.test && dates.prod && dates.test > dates.prod) errorMsg = 'Il Test non pu\u00F2 essere successivo a Prod';
        if (errorMsg) {
            document.getElementById('dateValidationMsg').innerText = `ERRORE: ${errorMsg}`;
            return;
        }
        const stimaGgu    = parseFloat(document.getElementById('p_stimaGgu').value);
        const rcFornitore = parseFloat(document.getElementById('p_rcFornitore').value);
        const id = document.getElementById('p_id').value;
        const fornitori = document.getElementById('p_fornitori').value.split(',').map(s => s.trim()).filter(Boolean);
        const owners    = document.getElementById('p_owners').value.split(',').map(s => s.trim()).filter(Boolean);
        const newProj = {
            id:                id || Date.now().toString(),
            nome:              document.getElementById('p_nome').value,
            fornitori,
            owners,
            dataStima:         dates.stima,
            dataIA:            dates.ia,
            devStart:          dates.devStart,
            devEnd:            dates.devEnd,
            dataTest:          dates.test,
            dataProd:          dates.prod,
            dataUAT:           dates.uat,
            dataBS:            dates.bs,
            jiraLinks:         this._getJiraLinksFromModal(),
            customMilestones:  this._getCustomMilestonesFromModal(),
            dataScadenzaStima: document.getElementById('p_dataScadenzaStima').value || null,
            dataConfigSistema: document.getElementById('p_dataConfigSistema').value || null,
            stimaGgu:          isNaN(stimaGgu)    ? null : stimaGgu,
            rcFornitore:       isNaN(rcFornitore) ? null : rcFornitore,
            stimaCosto:        (!isNaN(stimaGgu) && !isNaN(rcFornitore)) ? stimaGgu * rcFornitore : null,
            note:              document.getElementById('p_note').value,
            hidden:            false
        };
        if (id) {
            const oldProj = this.data.find(p => p.id === id);
            if (oldProj && oldProj.hidden) newProj.hidden = true;
            if (oldProj && oldProj.ganttOrder !== undefined) newProj.ganttOrder = oldProj.ganttOrder;
            this.data[this.data.findIndex(p => p.id === id)] = newProj;
        } else {
            this.data.push(newProj);
        }
        await this.syncToGithub();
        this.editorModal.hide();
    },

    syncToGithub: async function() {
        this.showAlert('Salvataggio in corso...', 'info', 2000);
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(this.data, null, 2))));
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${this.config.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Update data via PM Tracker webapp - ${new Date().toISOString()}`, content, sha: this.sha })
            });
            if (!response.ok) {
                if (response.status === 409) throw new Error("\u26A0\uFE0F Conflitto di versione! Il file \u00E8 stato modificato da un'altra pagina o persona. Ricarica la pagina per evitare di perdere dati.");
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

    openModal: function(id = null) {
        document.getElementById('projectForm').reset();
        document.getElementById('dateValidationMsg').innerText = '';
        document.getElementById('p_stimaCosto').value = '';
        if (id) {
            const p = this.data.find(x => x.id === id);
            if (!p || this.isMeta(p)) return;
            document.getElementById('p_id').value                = p.id;
            document.getElementById('p_nome').value              = p.nome;
            document.getElementById('p_fornitori').value         = (p.fornitori || []).join(', ');
            document.getElementById('p_owners').value            = this.csvToArray(p.owners || p.owner).join(', ');
            document.getElementById('p_stima').value             = p.dataStima    || '';
            document.getElementById('p_ia').value                = p.dataIA       || '';
            document.getElementById('p_devStart').value          = p.devStart     || '';
            document.getElementById('p_devEnd').value            = p.devEnd       || '';
            document.getElementById('p_test').value              = p.dataTest     || '';
            document.getElementById('p_prod').value              = p.dataProd     || '';
            document.getElementById('p_uat').value               = p.dataUAT      || '';
            document.getElementById('p_bs').value                = p.dataBS       || '';
            document.getElementById('p_dataScadenzaStima').value = p.dataScadenzaStima || '';
            document.getElementById('p_dataConfigSistema').value = p.dataConfigSistema || '';
            document.getElementById('p_stimaGgu').value          = p.stimaGgu    != null ? p.stimaGgu    : '';
            document.getElementById('p_rcFornitore').value       = p.rcFornitore != null ? p.rcFornitore : '';
            document.getElementById('p_note').value              = p.note || '';
            this.calcCosto();
            const links = p.jiraLinks && p.jiraLinks.length > 0 ? p.jiraLinks : (p.jira ? [p.jira] : []);
            this.renderJiraFields(links);
            this.renderCustomMilestoneFields(p.customMilestones || []);
        } else {
            document.getElementById('p_id').value = '';
            this.renderJiraFields([]);
            this.renderCustomMilestoneFields([]);
        }
        this.editorModal.show();
    },

    deleteProject: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (p && this.isMeta(p)) return;
        if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
            this.data = this.data.filter(p => p.id !== id);
            await this.syncToGithub();
        }
    },

    toggleHidden: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (p && this.isMeta(p)) return;
        if (p) {
            p.hidden = !p.hidden;
            if (!p.hidden && this.isAutoStale(p)) {
                this.showAlert('Progetto ripristinato, ma \u00E8 vecchio di 1 mese. Rimuovi o modifica la data di Prod per renderlo visibile senza la spunta.', 'warning', 6000);
            }
            await this.syncToGithub();
        }
    },

    _sortGantt: function(data, mode) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const d = (val) => val ? new Date(val) : new Date(0);
        const inProgress = (p) => { const prod = p.dataProd ? new Date(p.dataProd) : null; return !prod || prod > today; };
        const sorted = [...data];
        switch (mode) {
            case 'custom':
                sorted.sort((a, b) => { const oa = a.ganttOrder !== undefined ? a.ganttOrder : 999999; const ob = b.ganttOrder !== undefined ? b.ganttOrder : 999999; return oa - ob; }); break;
            case 'prod_inprogress_first':
                sorted.sort((a, b) => { const ia = inProgress(a)?0:1; const ib = inProgress(b)?0:1; if (ia!==ib) return ia-ib; return d(a.dataProd)-d(b.dataProd); }); break;
            case 'prod_asc':    sorted.sort((a, b) => d(a.dataProd) - d(b.dataProd)); break;
            case 'prod_desc':   sorted.sort((a, b) => d(b.dataProd) - d(a.dataProd)); break;
            case 'devStart_inprogress_first':
                sorted.sort((a, b) => { const ia = inProgress(a)?0:1; const ib = inProgress(b)?0:1; if (ia!==ib) return ia-ib; return d(a.devStart)-d(b.devStart); }); break;
            case 'devStart_asc':  sorted.sort((a, b) => d(a.devStart) - d(b.devStart)); break;
            case 'devStart_desc': sorted.sort((a, b) => d(b.devStart) - d(a.devStart)); break;
            case 'devEnd_inprogress_first':
                sorted.sort((a, b) => { const ia = inProgress(a)?0:1; const ib = inProgress(b)?0:1; if (ia!==ib) return ia-ib; return d(a.devEnd)-d(b.devEnd); }); break;
            case 'test_inprogress_first':
                sorted.sort((a, b) => { const ia = inProgress(a)?0:1; const ib = inProgress(b)?0:1; if (ia!==ib) return ia-ib; return d(a.dataTest)-d(b.dataTest); }); break;
            case 'alpha_asc':  sorted.sort((a, b) => (a.nome||'').localeCompare(b.nome||'', 'it')); break;
            case 'alpha_desc': sorted.sort((a, b) => (b.nome||'').localeCompare(a.nome||'', 'it')); break;
        }
        return sorted;
    },

    handleDragStart: function(e, id) {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => { const row = e.currentTarget || e.target; if (row && row.classList) row.classList.add('dragging'); }, 10);
    },
    handleDragOver:  function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; return false; },
    handleDragEnter: function(e) { e.preventDefault(); const row = e.currentTarget; if (row && row.classList) row.classList.add('drag-over'); },
    handleDragLeave: function(e) { const row = e.currentTarget; if (row && row.classList && !row.contains(e.relatedTarget)) row.classList.remove('drag-over'); },
    handleDragEnd:   function(e) { document.querySelectorAll('.gantt-row').forEach(el => el.classList.remove('dragging', 'drag-over')); },
    handleDrop: function(e, targetId) {
        e.preventDefault(); e.stopPropagation();
        document.querySelectorAll('.gantt-row').forEach(el => el.classList.remove('dragging', 'drag-over'));
        const sourceId = e.dataTransfer.getData('text/plain');
        if (!sourceId || sourceId === targetId) return;
        this.reorderGantt(sourceId, targetId);
    },

    reorderGantt: async function(sourceId, targetId) {
        let allProjs = this.getProjectsOnly();
        allProjs.sort((a, b) => { const oa = a.ganttOrder!==undefined?a.ganttOrder:999999; const ob = b.ganttOrder!==undefined?b.ganttOrder:999999; return oa-ob; });
        const sourceIdx = allProjs.findIndex(p => p.id === sourceId);
        const targetIdx = allProjs.findIndex(p => p.id === targetId);
        if (sourceIdx >= 0 && targetIdx >= 0) {
            const [moved] = allProjs.splice(sourceIdx, 1);
            allProjs.splice(targetIdx, 0, moved);
            allProjs.forEach((p, index) => { p.ganttOrder = index; });
            allProjs.forEach(p => { const original = this.data.find(x => x.id === p.id); if (original) original.ganttOrder = p.ganttOrder; });
            this.renderGantt();
            await this.syncToGithub();
        }
    },

    renderAll: function() {
        try {
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
        } catch (err) {
            console.error("Errore in renderAll:", err);
            this.showAlert(`Errore visualizzazione: ${err.message}`, 'danger');
        }
    },

    renderTable: function() {
        const tbody      = document.getElementById('projectsTableBody');
        const search     = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const filtForn   = document.getElementById('tableFornitoreFilter')?.value || '';
        const filtOwn    = document.getElementById('tableOwnerFilter')?.value || '';
        const sortMode   = document.getElementById('tableSortSelect')?.value || 'prod_inprogress_first';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        let filtered = this.getProjectsOnly().filter(p =>
            (showHidden || !this.isHiddenForUI(p)) &&
            (p.nome || '').toLowerCase().includes(search) &&
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
        );
        filtered = this._sortGantt(filtered, sortMode);
        tbody.innerHTML = filtered.map(p => {
            const isPast          = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale       = this.isAutoStale(p);
            const currentlyHidden = this.isHiddenForUI(p);
            let rowCls = '';
            if (currentlyHidden) rowCls = 'class="table-warning opacity-75"';
            else if (isPast)     rowCls = 'class="table-secondary opacity-75"';
            const fornBadge = (p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'badge me-1 mb-1')).join('');
            const ownBadge  = (p.owners    || []).map(o => this._badgeSpan('owner', o, 'badge me-1 mb-1')).join('');
            const extraRows = [];
            if (p.stimaGgu   != null) extraRows.push(`<span class="badge bg-info text-dark me-1">\u23F1\uFE0F ${p.stimaGgu} gg/u</span>`);
            if (p.stimaCosto != null) extraRows.push(`<span class="badge bg-warning text-dark me-1">\uD83D\uDCB0 \u20AC ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`);
            const links    = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            const jiraHtml = this.jiraLinksHtml(links);
            let statusBadge = '';
            if (p.hidden)       statusBadge = '<span class="badge bg-dark ms-1">\uD83D\uDEAB Archiviato</span>';
            else if (autoStale) statusBadge = '<span class="badge bg-secondary ms-1">\uD83D\uDD50 Auto-archiviato</span>';
            else if (isPast)    statusBadge = '<span class="badge bg-success ms-1">\u2705 Rilasciato</span>';
            return `
            <tr ${rowCls}>
                <td>
                    <strong>${p.nome || 'Senza nome'}</strong>
                    ${statusBadge}
                    ${jiraHtml ? `<div class="mt-1">${jiraHtml}</div>` : ''}
                    ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                </td>
                <td><div class="d-flex flex-wrap">${fornBadge}</div>${ownBadge ? `<div class="mt-1 d-flex flex-wrap">${ownBadge}</div>` : ''}</td>
                <td class="text-muted small">${this.formatDate(p.dataStima)}</td>
                <td class="text-muted small">${this.formatDate(p.dataIA)}</td>
                <td class="small">${this.formatDate(p.devStart)} \u27A0 ${this.formatDate(p.devEnd)}</td>
                <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
                <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
                <td class="small text-muted" style="max-width: 250px; white-space: pre-wrap;">${p.note || ''}</td>
                <td>
                    <button class="btn btn-sm ${p.hidden ? 'btn-secondary' : 'btn-outline-secondary'} mb-1" onclick="app.toggleHidden('${p.id}')" title="${p.hidden ? 'Ripristina Progetto' : 'Archivia (Nascondi)'}">${p.hidden ? '\uD83D\uDC41\uFE0F' : '\uD83D\uDEAB'}</button>
                    <button class="btn btn-sm btn-outline-primary mb-1" onclick="app.openModal('${p.id}')" title="Modifica">\u270F\uFE0F</button>
                    <button class="btn btn-sm btn-outline-danger mb-1" onclick="app.deleteProject('${p.id}')" title="Elimina">\uD83D\uDDD1\uFE0F</button>
                </td>
            </tr>`;
        }).join('');
    },

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;
        const filtForn   = document.getElementById('ganttFornitoreFilter')?.value || '';
        const filtOwn    = document.getElementById('ganttOwnerFilter')?.value || '';
        const sortMode   = document.getElementById('ganttSortSelect')?.value || 'prod_inprogress_first';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;
        let data = this.getProjectsOnly().filter(p =>
            (showHidden || !this.isHiddenForUI(p)) &&
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn  || (p.owners    && p.owners.includes(filtOwn))) &&
            (p.devStart || p.devEnd || p.dataTest || p.dataProd || p.dataIA || (p.customMilestones && p.customMilestones.length > 0))
        );
        data = this._sortGantt(data, sortMode);
        if (data.length === 0) {
            container.innerHTML = "<p class='text-center p-3 text-muted'>Nessun progetto con date programmate trovato per i filtri selezionati.</p>";
            return;
        }
        let minDate = null, maxDate = null;
        const updateRange = d => { if (!d) return; const dt = new Date(d); if (!minDate || dt < minDate) minDate = dt; if (!maxDate || dt > maxDate) maxDate = dt; };
        data.forEach(p => {
            [p.dataIA, p.devStart, p.devEnd, p.dataTest, p.dataProd, p.dataUAT, p.dataBS, p.dataScadenzaStima, p.dataConfigSistema].forEach(updateRange);
            if (p.customMilestones) p.customMilestones.forEach(m => updateRange(m.date));
        });
        if (!minDate || !maxDate) { minDate = new Date(); maxDate = new Date(); }
        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        let maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxMonth <= minDate) maxMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        maxDate = maxMonth;
        const totalDays = Math.ceil((maxDate - minDate) / 86400000);
        const pct = d => { const days = (new Date(d) - minDate) / 86400000; return Math.min(Math.max((days / totalDays) * 100, 0), 100); };
        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        let cur = new Date(minDate);
        while (cur <= maxDate) {
            const name = dayjs(cur).format('MMM YYYY');
            const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
            html += `<div class="gantt-month" style="width:${((days/totalDays)*100).toFixed(2)}%">${name}</div>`;
            cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        }
        html += '</div></div></div><div class="gantt-body">';
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const isCustomSort = sortMode === 'custom';
        data.forEach(p => {
            const startD = p.devStart ? p.devStart : (p.dataTest || p.dataProd || p.dataIA);
            const endD   = p.devEnd   ? p.devEnd   : startD;
            const leftPct   = startD ? pct(startD) : 0;
            const widthPct  = startD && endD ? Math.max(pct(endD) - leftPct, 0.5) : 0;
            const barOpacity = (p.devStart && p.devEnd) ? 1 : 0.2;
            const badgesHtml = [
                ...(p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge mb-1')),
                ...(p.owners    || []).map(o => this._badgeSpan('owner', o, 'gantt-supplier-badge mb-1'))
            ].join('');
            const ganttJiraLinks = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            const ganttJiraHtml  = this.jiraLinksHtml(ganttJiraLinks);
            const isPast          = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale       = this.isAutoStale(p);
            const currentlyHidden = this.isHiddenForUI(p);
            let rowCls = isPast ? ' gantt-row--released' : '';
            if (currentlyHidden) rowCls += ' opacity-50';
            let statusIcon = '';
            if (p.hidden)       statusIcon = '<span class="badge bg-dark ms-1">\uD83D\uDEAB</span>';
            else if (autoStale) statusIcon = '<span class="badge bg-secondary ms-1" title="Auto-archiviato">\uD83D\uDD50</span>';
            let allMilestones = [
                { date: p.dataIA,            cls: 'ms-ia',         icon: '\uD83E\uDD16', label: 'Consegna IA',           always: true  },
                { date: p.devStart,          cls: 'ms-dev-start',  icon: '\u25B6\uFE0F', label: 'Inizio Sviluppo',       always: true  },
                { date: p.devEnd,            cls: 'ms-dev-end',    icon: '\u23F9\uFE0F', label: 'Fine Sviluppo',         always: true  },
                { date: p.dataUAT,           cls: 'ms-uat',        icon: '\uD83D\uDC65', label: 'UAT',                   always: false },
                { date: p.dataBS,            cls: 'ms-bs',         icon: '\uD83D\uDCBC', label: 'Business Simulation',   always: false },
                { date: p.dataTest,          cls: 'ms-test',       icon: '\uD83E\uDDEA', label: 'Rilascio Test',         always: true  },
                { date: p.dataProd,          cls: 'ms-prod',       icon: '\uD83D\uDE80', label: 'Rilascio Prod',         always: true  },
                { date: p.dataScadenzaStima, cls: 'ms-scad-stima', icon: '\uD83D\uDCE5', label: 'Scad. Stima Fornitore', always: false },
                { date: p.dataConfigSistema, cls: 'ms-config-sis', icon: '\uD83D\uDD27', label: 'Config Sistema',        always: false }
            ];
            if (p.customMilestones) p.customMilestones.forEach(cm => allMilestones.push({ date: cm.date, cls: 'ms-custom', icon: '\u2B50', label: cm.label, always: false }));
            allMilestones = allMilestones.filter(m => m.date && m.date.trim() !== '');
            const dateGroups = {};
            allMilestones.forEach(m => { (dateGroups[m.date] = dateGroups[m.date] || []).push(m); });
            allMilestones.forEach(m => { const g = dateGroups[m.date]; m.offsetPx = (g.indexOf(m) - (g.length - 1) / 2) * 20; });
            const milestonesHtml = allMilestones.map(m => {
                const translateX = (-16 + m.offsetPx).toFixed(0);
                const inlineColor     = m.cls === 'ms-custom' ? 'color:#198754;' : '';
                const inlineLineColor = m.cls === 'ms-custom' ? 'background:#198754;' : '';
                return `<div class="gantt-milestone ${m.cls}" style="left:${pct(m.date).toFixed(2)}%;transform:translateX(${translateX}px);" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date" style="${inlineColor}">${dayjs(m.date).format('DD/MM')}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line" style="${inlineLineColor}"></span>
                </div>`;
            }).join('');
            const pColors = this._projectColors(p.nome);
            let rowAttr = '';
            let dragHandleHtml = '';
            if (isCustomSort) {
                rowCls += ' draggable';
                rowAttr = `draggable="true" ondragstart="app.handleDragStart(event, '${p.id}')" ondragover="app.handleDragOver(event)" ondrop="app.handleDrop(event, '${p.id}')" ondragenter="app.handleDragEnter(event)" ondragleave="app.handleDragLeave(event)" ondragend="app.handleDragEnd(event)"`;
                dragHandleHtml = '<div class="drag-handle" title="Trascina per riordinare">\u2630</div>';
            }
            html += `
                <div class="gantt-row${rowCls}" ${rowAttr} style="background-color: ${pColors.bg}; border-left: 4px solid ${pColors.border}; margin-bottom: 4px; border-radius: 4px;">
                    <div class="gantt-project-col">
                        ${dragHandleHtml}
                        <div>
                            <strong>${p.nome} ${statusIcon}</strong>
                            <div class="gantt-supplier-list">${badgesHtml}</div>
                            ${ganttJiraHtml ? `<div class="mt-1">${ganttJiraHtml}</div>` : ''}
                        </div>
                    </div>
                    <div class="gantt-timeline-col" style="position:relative;">
                        <div class="gantt-bar" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;opacity:${barOpacity}; background-color: ${pColors.barBg}; border: 1px solid ${pColors.barBorder}; box-shadow: none;" title="Sviluppo: ${dayjs(startD).format('DD/MM/YYYY')} - ${dayjs(endD).format('DD/MM/YYYY')}">
                            <span style="color: #212529;">\u2699\uFE0F Sviluppo</span>
                        </div>
                        ${milestonesHtml}<div class="gantt-today-line" style="position:absolute;top:0;bottom:0;left:${pct(today).toFixed(2)}%;width:2px;background:rgba(220,53,69,0.65);pointer-events:none;z-index:5;" title="Oggi: ${dayjs(today).format('DD/MM/YYYY')}"></div>
                    </div>
                </div>`;
        });
        html += '</div>';
        const hasUAT       = data.some(p => p.dataUAT           && p.dataUAT.trim()           !== '');
        const hasBS        = data.some(p => p.dataBS            && p.dataBS.trim()            !== '');
        const hasScadStima = data.some(p => p.dataScadenzaStima && p.dataScadenzaStima.trim() !== '');
        const hasConfigSis = data.some(p => p.dataConfigSistema && p.dataConfigSistema.trim() !== '');
        const hasCustom    = data.some(p => p.customMilestones  && p.customMilestones.length  > 0);
        html += `
        <div class="gantt-legend">
            <div class="gantt-legend-item"><span class="legend-bar"></span> Fase di Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">\uD83E\uDD16</span> Consegna IA</div>
            <div class="gantt-legend-item"><span class="legend-ms">\u25B6\uFE0F</span> Inizio Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">\u23F9\uFE0F</span> Fine Sviluppo</div>
            ${hasUAT       ? '<div class="gantt-legend-item"><span class="legend-ms">\uD83D\uDC65</span> UAT</div>' : ''}
            ${hasBS        ? '<div class="gantt-legend-item"><span class="legend-ms">\uD83D\uDCBC</span> Business Simulation</div>' : ''}
            <div class="gantt-legend-item"><span class="legend-ms">\uD83E\uDDEA</span> Rilascio Test</div>
            <div class="gantt-legend-item"><span class="legend-ms">\uD83D\uDE80</span> Rilascio Prod</div>
            ${hasScadStima ? '<div class="gantt-legend-item"><span class="legend-ms">\uD83D\uDCE5</span> Scad. Stima Fornitore</div>' : ''}
            ${hasConfigSis ? '<div class="gantt-legend-item"><span class="legend-ms">\uD83D\uDD27</span> Config Sistema</div>' : ''}
            ${hasCustom    ? '<div class="gantt-legend-item"><span class="legend-ms" style="color:#198754">\u2B50</span> Milestone Personalizzate</div>' : ''}
        </div>`;
        html += '</div>';
        container.innerHTML = html;
    },

    _calIsPast: function(dateStr, milestoneKey) {
        if (!dateStr) return false;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const alwaysHighlight = this.ALWAYS_HIGHLIGHT_KEYS || [];
        if (milestoneKey && alwaysHighlight.includes(milestoneKey)) return false;
        return new Date(dateStr) < today;
    },

    setEventPref: async function(key, pref) {
        const meta = this.getMeta();
        if (!meta.eventPrefs) meta.eventPrefs = {};
        if (pref === 'show') delete meta.eventPrefs[key];
        else meta.eventPrefs[key] = pref;
        this.renderCalendar();
        await this.syncToGithub();
    },

    // Renderizza una singola card evento (usata sia negli Highlights che nel calendario mensile)
    _renderEventCard: function(ev, todayStr, compact) {
        const fb = (ev.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge me-1 mb-1')).join('');
        const ob = (ev.owners    || []).map(o => this._badgeSpan('owner',    o, 'gantt-supplier-badge me-1 mb-1')).join('');
        const calJiraHtml = (!ev.reminder && ev.jiraLinks && ev.jiraLinks.length > 0) ? this.jiraLinksHtml(ev.jiraLinks) : '';
        const isReminder   = !!ev.reminder;
        const isPastGray   = !!ev.pastGray && !isReminder;
        const isUserGray   = !!ev.userGray;
        const isHiddenPref = !!ev.isHiddenPref;
        const isToday      = ev.date.format('YYYY-MM-DD') === todayStr;
        const isExpiredRem = isReminder && !ev.done && ev.date.format('YYYY-MM-DD') < todayStr;

        let opacityCls = '';
        if (isHiddenPref)                    opacityCls = 'opacity-25';
        else if (ev.hidden)                  opacityCls = 'opacity-50';
        else if (isPastGray || isUserGray)   opacityCls = 'opacity-75 cal-event--past';

        const titleCls = (isReminder && ev.done) ? 'text-decoration-line-through' : ((isPastGray || isUserGray || isHiddenPref) ? 'text-muted' : '');

        let borderCls = 'border shadow-sm';
        let bgCls = '';
        let customStyle = '';
        if (isReminder) {
            bgCls = isExpiredRem ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10';
            borderCls = isExpiredRem
                ? 'border border-danger border-opacity-75 shadow-sm'
                : 'border border-warning border-opacity-50 shadow-sm';
        } else {
            const pColors = app._projectColors(ev.nome);
            customStyle = `background-color: ${pColors.bg}; border-left: 4px solid ${pColors.border} !important; border-top: 1px solid rgba(0,0,0,0.05); border-right: 1px solid rgba(0,0,0,0.05); border-bottom: 1px solid rgba(0,0,0,0.05);`;
        }
        if (isToday && !isReminder) {
            borderCls = 'border border-danger border-2 shadow';
            customStyle += ` border-color: #dc3545 !important; border-left: 4px solid #dc3545 !important;`;
        }
        if (isToday && isReminder) {
            borderCls = 'border border-danger border-2 shadow';
            bgCls = 'bg-warning bg-opacity-25';
        }

        let statusIcon = '';
        if (ev.autoStale)          statusIcon = '<span title="Auto-archiviato">\uD83D\uDD50</span>';
        if (isReminder && ev.done) statusIcon = '<span title="Completato">\u2705</span>';

        // In modalità compact (highlights) mostriamo card più snelle: no data grande, stile lista
        if (compact) {
            const dateLbl = ev.date.format('DD/MM');
            const expiredBadge = isExpiredRem ? '<span class="badge bg-danger ms-1 small">Scaduto</span>' : '';
            return `
            <div class="cal-event-item d-flex align-items-start gap-2 p-2 rounded mb-2 ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle} font-size:0.85rem;">
                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                        <span class="badge ${ev.badge} me-1" style="font-size:0.7rem;">${ev.label}</span>
                        <span class="text-muted" style="font-size:0.75rem;">${dateLbl}</span>
                        ${expiredBadge}
                        ${isHiddenPref ? '<span class="badge bg-dark" style="font-size:0.65rem;">Nascosto</span>' : ''}
                        ${isUserGray   ? '<span class="badge bg-secondary" style="font-size:0.65rem;">Ingrigito</span>' : ''}
                    </div>
                    <div class="fw-semibold ${titleCls}" style="font-size:0.85rem; word-break:break-word;">${ev.nome} ${statusIcon}</div>
                    ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                    ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                    ${fb || ob ? `<div class="mt-1 d-flex flex-wrap">${fb}${ob}</div>` : ''}
                </div>
                <div class="dropdown flex-shrink-0">
                    <button class="btn btn-sm btn-light text-secondary border-0 p-0 px-1" type="button" data-bs-toggle="dropdown" style="line-height:1;"><strong>\u22EE</strong></button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                        ${ev.pref !== 'hide' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','hide');return false;">\uD83D\uDEAB Nascondi</a></li>` : ''}
                        ${ev.pref !== 'gray' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','gray');return false;">\uD83C\uDF2B\uFE0F Ingrigisci</a></li>` : ''}
                        ${ev.pref ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item py-2 text-success" href="#" onclick="app.setEventPref('${ev.prefKey}','show');return false;">\uD83D\uDC41\uFE0F Mostra Normale</a></li>` : ''}
                    </ul>
                </div>
            </div>`;
        }

        // Card normale (calendario mensile)
        return `
        <div class="cal-event-item d-flex align-items-start gap-3 p-3 rounded ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle}">
            <div class="cal-event-date text-center" style="min-width: 50px;">
                <div class="fw-bold fs-5 ${isToday ? 'text-danger' : (isPastGray || isUserGray || isHiddenPref ? 'text-muted' : (isReminder ? 'text-warning text-dark' : 'text-primary'))}">${ev.date.format('DD')}</div>
                <div class="small text-uppercase ${isToday ? 'text-danger fw-bold' : (isReminder && !isPastGray && !isUserGray ? 'text-warning text-dark' : 'text-muted')}">${ev.date.format('MMM')}</div>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
                    <span class="badge ${ev.badge}">${ev.label}</span>
                    ${isToday ? '<span class="badge bg-danger">OGGI</span>' : ''}
                    ${isHiddenPref ? '<span class="badge bg-dark">Nascosto</span>' : ''}
                    ${isUserGray ? '<span class="badge bg-secondary">Ingrigito</span>' : ''}
                </div>
                <div class="fw-semibold fs-6 ${titleCls}">${ev.nome} ${statusIcon}</div>
                ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2 ms-1">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                ${fb || ob ? `<div class="mt-2 d-flex flex-wrap">${fb}${ob}</div>` : ''}
            </div>
            ${isReminder ? `<button class="btn btn-sm ${ev.done ? 'btn-success' : 'btn-outline-success'} me-1" onclick="app.toggleReminderDone('${ev.reminderId}')" title="${ev.done ? 'Riapri' : 'Segna fatto'}">${ev.done ? '\u21A9\uFE0F Riapri' : '\u2705 Fatto'}</button><button class="btn btn-sm btn-outline-warning me-1" onclick="app.editReminder('${ev.reminderId}')" title="Modifica">\u270F\uFE0F Modifica</button><button class="btn btn-sm btn-outline-danger me-1" onclick="app.deleteReminder('${ev.reminderId}')" title="Elimina">\uD83D\uDDD1\uFE0F</button>` : ''}<div class="dropdown flex-shrink-0 ms-2">
                <button class="btn btn-sm btn-light text-secondary border-0 p-1 px-2" type="button" data-bs-toggle="dropdown" title="Opzioni visibilit\u00E0" style="line-height: 1;"><strong>\u22EE</strong></button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm small">
                    ${ev.pref !== 'hide' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','hide');return false;">\uD83D\uDEAB Nascondi</a></li>` : ''}
                    ${ev.pref !== 'gray' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','gray');return false;">\uD83C\uDF2B\uFE0F Ingrigisci</a></li>` : ''}
                    ${ev.pref ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item py-2 text-success" href="#" onclick="app.setEventPref('${ev.prefKey}','show');return false;">\uD83D\uDC41\uFE0F Mostra Normale</a></li>` : ''}
                </ul>
            </div>
        </div>`;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;
        const filtForn   = document.getElementById('calendarFornitoreFilter')?.value || '';
        const filtOwn    = document.getElementById('calendarOwnerFilter')?.value    || '';
        const filtMile   = document.getElementById('calendarMilestoneFilter')?.value || '';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;
        const calShowHiddenPrefs = document.getElementById('calShowHiddenPrefs')?.checked || false;
        const showProjectMilestones = filtMile !== 'reminders';
        const showCustomMilestones  = (filtMile === '' || filtMile === 'custom');
        const showReminders         = (filtMile === '' || filtMile === 'reminders');
        const milestonesToUse = (filtMile && !['custom', 'reminders'].includes(filtMile))
            ? this.MILESTONES.filter(m => m.key === filtMile)
            : this.MILESTONES;
        const events = [];
        const meta = this.getMeta();
        const prefs = meta.eventPrefs || {};
        const todayStr = dayjs().format('YYYY-MM-DD');

        if (showProjectMilestones) {
            this.getProjectsOnly()
                .filter(p =>
                    (showHidden || !this.isHiddenForUI(p)) &&
                    (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
                    (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
                )
                .forEach(p => {
                    const currentlyHidden = this.isHiddenForUI(p);
                    const autoStale       = this.isAutoStale(p);
                    const pJiraLinks = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
                    milestonesToUse.forEach(m => {
                        const v = p[m.key];
                        if (v && v.trim() !== '') {
                            const prefKey = `ms_${p.id}_${m.key}`;
                            const pref = prefs[prefKey];
                            if (pref === 'hide' && !calShowHiddenPrefs) return;
                            const pastGray = this._calIsPast(v, m.key);
                            events.push({
                                date: dayjs(v), sortKey: v, nome: p.nome,
                                fornitori: p.fornitori || [], owners: p.owners || [], jiraLinks: pJiraLinks,
                                label: m.label,
                                badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : m.badge,
                                pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                                prefKey, pref, milestoneKey: m.key, autoStale, hidden: currentlyHidden
                            });
                        }
                    });
                    if (showCustomMilestones && p.customMilestones) {
                        p.customMilestones.forEach(cm => {
                            if (cm.date && cm.date.trim() !== '') {
                                const prefKey = `custom_${p.id}_${this._hashString(cm.label)}`;
                                const pref = prefs[prefKey];
                                if (pref === 'hide' && !calShowHiddenPrefs) return;
                                const pastGray = this._calIsPast(cm.date, 'custom');
                                events.push({
                                    date: dayjs(cm.date), sortKey: cm.date, nome: p.nome,
                                    fornitori: p.fornitori || [], owners: p.owners || [], jiraLinks: pJiraLinks,
                                    label: `\u2B50 ${cm.label}`,
                                    badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : 'bg-success',
                                    pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                                    prefKey, pref, milestoneKey: 'custom', autoStale, hidden: currentlyHidden
                                });
                            }
                        });
                    }
                });
        }

        if (showReminders) {
            const showDone = document.getElementById('rem_show_done')?.checked || false;
            (meta.manualReminders || [])
                .filter(r => r && r.date && r.title)
                .filter(r => showDone || !r.done)
                .forEach(r => {
                    const prefKey = `rem_${r.id}`;
                    const pref = prefs[prefKey];
                    if (pref === 'hide' && !calShowHiddenPrefs) return;
                    events.push({
                        date: dayjs(r.date), sortKey: r.date,
                        nome: r.title, fornitori: [], owners: [], jiraLinks: [],
                        label: '\uD83D\uDCDD Promemoria',
                        badge: r.done || pref === 'gray' || pref === 'hide' ? 'bg-secondary' : 'bg-primary',
                        reminder: true, reminderId: r.id, done: !!r.done, note: r.note || '',
                        userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                        prefKey, pref
                    });
                });
        }

        this.renderReminders();

        if (events.length === 0) {
            container.innerHTML = "<div class='col-12'><p class='text-center text-muted p-3'>Nessun evento da visualizzare per i filtri selezionati.</p></div>";
            return;
        }

        // --- HIGHLIGHTS: promemoria (oggi + scaduti non completati) + milestone di oggi ---
        const hlReminders  = events.filter(ev => ev.reminder && !ev.done && ev.sortKey <= todayStr && !ev.isHiddenPref);
        const hlMilestones = events.filter(ev => !ev.reminder && ev.sortKey === todayStr && !ev.isHiddenPref);
        const hasHighlights = hlReminders.length > 0 || hlMilestones.length > 0;

        hlReminders.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        hlMilestones.sort((a, b) => a.sortKey.localeCompare(b.sortKey));

        let html = `
        <div class="col-12 mb-4">
            <div class="card shadow-sm border-0 bg-light">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom-0 rounded-top">
                    <h5 class="mb-0 fw-bold text-primary">\uD83D\uDCC5 Eventi in Calendario</h5>
                    <div class="form-check form-switch m-0">
                        <input class="form-check-input" type="checkbox" id="calShowHiddenPrefs" onchange="app.renderCalendar()" ${calShowHiddenPrefs ? 'checked' : ''}>
                        <label class="form-check-label small text-muted mt-1 ms-1" for="calShowHiddenPrefs">Mostra elementi nascosti</label>
                    </div>
                </div>
                <div class="card-body p-4">
                    <div class="row g-4">`;

        // Sezione HIGHLIGHTS
        if (hasHighlights) {
            html += `
            <div class="col-12">
                <div class="card border-0 shadow-sm" style="background: linear-gradient(135deg, #fff8e1 0%, #e8f5e9 100%); border-left: 4px solid #ffc107 !important;">
                    <div class="card-header border-0 pb-0 pt-3 px-3" style="background:transparent;">
                        <h6 class="fw-bold mb-0" style="color:#856404;">\u26A1 Highlights &mdash; <span class="text-muted fw-normal" style="font-size:0.85rem;">Oggi ${dayjs().format('DD/MM/YYYY')}</span></h6>
                    </div>
                    <div class="card-body p-3">
                        <div class="row g-3">`;

            // Colonna sinistra: promemoria (oggi + scaduti)
            html += `<div class="col-md-5">`;
            if (hlReminders.length > 0) {
                html += `<div class="small fw-semibold text-muted text-uppercase mb-2" style="letter-spacing:.05em;">\uD83D\uDCDD Promemoria attivi</div>`;
                hlReminders.forEach(ev => { html += this._renderEventCard(ev, todayStr, true); });
            } else {
                html += `<div class="text-muted small fst-italic p-2">Nessun promemoria attivo o scaduto.</div>`;
            }
            html += `</div>`;

            // Colonna destra: milestone di oggi
            html += `<div class="col-md-7">`;
            if (hlMilestones.length > 0) {
                html += `<div class="small fw-semibold text-muted text-uppercase mb-2" style="letter-spacing:.05em;">\uD83D\uDE80 Milestone di oggi</div>`;
                hlMilestones.forEach(ev => { html += this._renderEventCard(ev, todayStr, true); });
            } else {
                html += `<div class="text-muted small fst-italic p-2">Nessuna milestone automatica per oggi.</div>`;
            }
            html += `</div>`;

            html += `</div></div></div></div>`; // chiude row, card-body, card, col-12
        }

        // --- Calendario mensile (tutti gli eventi, escluse le righe già mostrate in highlights) ---
        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });
        const sortedMonthKeys = Object.keys(groups).sort();

        sortedMonthKeys.forEach((k) => {
            const g = groups[k];
            const sorted = g.events.sort((a, b) => {
                const aInactive = (a.isHiddenPref || a.hidden || a.userGray || (a.pastGray && !a.reminder) || (a.reminder && a.done)) ? 1 : 0;
                const bInactive = (b.isHiddenPref || b.hidden || b.userGray || (b.pastGray && !b.reminder) || (b.reminder && b.done)) ? 1 : 0;
                if (aInactive !== bInactive) return aInactive - bInactive;
                return a.sortKey.localeCompare(b.sortKey);
            });
            html += `
            <div class="col-md-6 col-xl-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-header bg-white py-3 border-bottom">
                        <h6 class="mb-0 fw-bold text-uppercase text-primary d-flex align-items-center justify-content-between">
                            ${g.label}
                            <span class="badge bg-secondary rounded-pill">${sorted.length}</span>
                        </h6>
                    </div>
                    <div class="card-body p-3 bg-white">
                        <div class="d-flex flex-column gap-2">`;
            sorted.forEach(ev => { html += this._renderEventCard(ev, todayStr, false); });
            html += `</div></div></div></div>`;
        });

        html += `</div></div></div></div>`;
        container.innerHTML = html;
    },

    formatDate: function(d) {
        return d ? dayjs(d).format('DD/MM/YY') : 'N/A';
    },

    showAlert: function(msg, type = 'info', timeout = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        const toastId = 'toast-' + Date.now();
        let icon = '\u2139\uFE0F';
        if (type === 'success') icon = '\u2705';
        else if (type === 'danger') icon = '\u274C';
        else if (type === 'warning') icon = '\u26A0\uFE0F';
        const bgClass = type === 'warning' ? 'text-bg-warning' : (type === 'info' ? 'text-bg-info text-dark' : `text-bg-${type}`);
        const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${bgClass} border-0 mb-2 shadow" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="${timeout}">
            <div class="d-flex">
                <div class="toast-body fw-semibold d-flex align-items-center gap-2">
                    <span>${icon}</span>
                    <span>${msg}</span>
                </div>
                <button type="button" class="btn-close ${type === 'warning' ? '' : 'btn-close-white'} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>`;
        container.insertAdjacentHTML('beforeend', toastHtml);
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        toastElement.addEventListener('hidden.bs.toast', () => toastElement.remove());
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
