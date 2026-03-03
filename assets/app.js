const app = {
    data: [],
    config: {
        owner: '',
        repo: '',
        token: '',
        path: 'data/projects.json'
    },
    sha: null,
    editorModal: null,
    settingsModal: null,
    MAX_JIRA_LINKS: 10,
    MAX_CUSTOM_MILESTONES: 5,

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
        'simone': { bg: '#0d6efd', fg: '#ffffff' }, // blu
        'flavia': { bg: '#6f42c1', fg: '#ffffff' }, // viola
        'andrea': { bg: '#ffc107', fg: '#212529' }, // giallo
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

    csvToArray: function(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(s => (s || '').toString().trim()).filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    },

    normalizeProject: function(p) {
        const owners    = this.csvToArray(p.owners || p.owner);
        const fornitori = this.csvToArray(p.fornitori);
        const customMilestones = Array.isArray(p.customMilestones) ? p.customMilestones : [];
        const hidden = !!p.hidden;
        return { ...p, owners, fornitori, customMilestones, hidden };
    },

    isAutoStale: function(p) {
        try {
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
        if (kind === 'owner' && this.OWNER_COLORS[key]) {
            return this.OWNER_COLORS[key];
        }
        return this._autoColor(name, kind);
    },

    _badgeStyle: function(kind, name) {
        const c = this._badgeColor(kind, name);
        return `background: ${c.bg} !important; color: ${c.fg} !important; border: 1px solid rgba(0,0,0,0.12);`;
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
        return rows.map(row => {
            return {
                label: row.querySelector('.custom-ms-label').value.trim(),
                date: row.querySelector('.custom-ms-date').value
            };
        }).filter(m => m.label !== '' && m.date !== '');
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
            .map(u => `<a href="${u}" target="_blank" class="badge bg-primary text-decoration-none me-1 mb-1" title="${u}">${this.jiraLabel(u)} 🔗</a>`)
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
            out.value = '€ ' + (ggu * rc).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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

    loadData: async function() {
        if (!this.config.token) {
            this.showAlert('Nessun token impostato, vai su Config.', 'warning');
            return;
        }
        this.showAlert('Caricamento dati...', 'info');
        try {
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}?t=${new Date().getTime()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            });
            if (!response.ok) throw new Error(`Errore GitHub: ${response.status}`);
            const json = await response.json();
            this.sha  = json.sha;
            this.data = JSON.parse(decodeURIComponent(escape(atob(json.content)))).map(p => this.normalizeProject(p));
            this.populateFornitoreFilters();
            this.populateOwnerFilters();
            this.renderAll();
            this.showAlert('Dati aggiornati con successo!', 'success', 2000);
        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger');
        }
    },

    populateFornitoreFilters: function() {
        try {
            const allSuppliers = [...new Set(this.data.flatMap(p => p.fornitori || []))].sort();
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
        } catch (e) {
            console.error("populateFornitoreFilters error", e);
        }
    },

    populateOwnerFilters: function() {
        try {
            const allOwners = [...new Set(this.data.flatMap(p => p.owners || []))].sort((a, b) => (a||'').localeCompare(b||'', 'it'));
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
        } catch(e) {
            console.error("populateOwnerFilters error", e);
        }
    },

    saveProject: async function() {
        const dates = {
            stima:    document.getElementById('p_stima').value || null,
            ia:       document.getElementById('p_ia').value || null,
            devStart: document.getElementById('p_devStart').value || null,
            devEnd:   document.getElementById('p_devEnd').value || null,
            test:     document.getElementById('p_test').value || null,
            prod:     document.getElementById('p_prod').value || null,
            uat:      document.getElementById('p_uat').value || null,
            bs:       document.getElementById('p_bs').value || null
        };

        let errorMsg = '';
        if (dates.stima && dates.devStart && dates.stima > dates.devStart) errorMsg = 'Stima non può essere successiva a Dev Start';
        else if (dates.devStart && dates.devEnd && dates.devStart > dates.devEnd) errorMsg = 'Dev Start non può essere successivo a Dev End';
        else if (dates.devEnd && dates.test && dates.devEnd > dates.test) errorMsg = 'Dev End non può essere successivo al Test';
        else if (dates.test && dates.prod && dates.test > dates.prod) errorMsg = 'Il Test non può essere successivo a Prod';
        
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
            fornitori:         fornitori,
            owners:            owners,
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
            this.data[this.data.findIndex(p => p.id === id)] = newProj;
        } else {
            this.data.push(newProj);
        }
        await this.syncToGithub();
        this.editorModal.hide();
    },

    syncToGithub: async function() {
        this.showAlert('Salvataggio su GitHub in corso...', 'warning');
        try {
            const content = btoa(unescape(encodeURIComponent(JSON.stringify(this.data, null, 2))));
            const url = `https://api.github.com/repos/${this.config.owner}/${this.config.repo}/contents/${this.config.path}`;
            const response = await fetch(url, {
                method: 'PUT',
                headers: { 'Authorization': `token ${this.config.token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: `Update data via PM Tracker webapp - ${new Date().toISOString()}`, content, sha: this.sha })
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message || 'Salvataggio fallito');
            }
            this.sha = (await response.json()).content.sha;
            this.showAlert('Dati salvati su GitHub! Aggiornamento in corso...', 'success');
            await this.loadData();
        } catch (e) {
            console.error('Errore sync:', e);
            this.showAlert(`Errore salvataggio: ${e.message}`, 'danger');
        }
    },

    openModal: function(id = null) {
        document.getElementById('projectForm').reset();
        document.getElementById('dateValidationMsg').innerText = '';
        document.getElementById('p_stimaCosto').value = '';
        if (id) {
            const p = this.data.find(x => x.id === id);
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
        if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
            this.data = this.data.filter(p => p.id !== id);
            await this.syncToGithub();
        }
    },

    toggleHidden: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (p) {
            p.hidden = !p.hidden;
            if (!p.hidden && this.isAutoStale(p)) {
                this.showAlert('Progetto ripristinato, ma è vecchio di 1 mese. Rimuovi o modifica la data di Prod per renderlo visibile senza la spunta.', 'warning', 6000);
            }
            await this.syncToGithub();
        }
    },

    _sortGantt: function(data, mode) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const d = (val) => val ? new Date(val) : new Date(0);
        const inProgress = (p) => {
            const prod = p.dataProd ? new Date(p.dataProd) : null;
            return !prod || prod > today;
        };
        const sorted = [...data];
        switch (mode) {
            case 'prod_inprogress_first':
                sorted.sort((a, b) => {
                    const ia = inProgress(a) ? 0 : 1;
                    const ib = inProgress(b) ? 0 : 1;
                    if (ia !== ib) return ia - ib;
                    return d(a.dataProd) - d(b.dataProd);
                });
                break;
            case 'prod_asc':
                sorted.sort((a, b) => d(a.dataProd) - d(b.dataProd));
                break;
            case 'prod_desc':
                sorted.sort((a, b) => d(b.dataProd) - d(a.dataProd));
                break;
            case 'devStart_inprogress_first':
                sorted.sort((a, b) => {
                    const ia = inProgress(a) ? 0 : 1;
                    const ib = inProgress(b) ? 0 : 1;
                    if (ia !== ib) return ia - ib;
                    return d(a.devStart) - d(b.devStart);
                });
                break;
            case 'devStart_asc':
                sorted.sort((a, b) => d(a.devStart) - d(b.devStart));
                break;
            case 'devStart_desc':
                sorted.sort((a, b) => d(b.devStart) - d(a.devStart));
                break;
            case 'devEnd_inprogress_first':
                sorted.sort((a, b) => {
                    const ia = inProgress(a) ? 0 : 1;
                    const ib = inProgress(b) ? 0 : 1;
                    if (ia !== ib) return ia - ib;
                    return d(a.devEnd) - d(b.devEnd);
                });
                break;
            case 'test_inprogress_first':
                sorted.sort((a, b) => {
                    const ia = inProgress(a) ? 0 : 1;
                    const ib = inProgress(b) ? 0 : 1;
                    if (ia !== ib) return ia - ib;
                    return d(a.dataTest) - d(b.dataTest);
                });
                break;
            case 'alpha_asc':
                sorted.sort((a, b) => (a.nome||'').localeCompare(b.nome||'', 'it'));
                break;
            case 'alpha_desc':
                sorted.sort((a, b) => (b.nome||'').localeCompare(a.nome||'', 'it'));
                break;
        }
        return sorted;
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
        const tbody    = document.getElementById('projectsTableBody');
        const search   = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const filtForn = document.getElementById('tableFornitoreFilter')?.value || '';
        const filtOwn  = document.getElementById('tableOwnerFilter')?.value || '';
        const sortMode = document.getElementById('tableSortSelect')?.value || 'prod_inprogress_first';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = this.data.filter(p =>
            (showHidden || !this.isHiddenForUI(p)) &&
            (p.nome || '').toLowerCase().includes(search) &&
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
        );
        filtered = this._sortGantt(filtered, sortMode);

        tbody.innerHTML = filtered.map(p => {
            const isPast = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale = this.isAutoStale(p);
            const currentlyHidden = this.isHiddenForUI(p);

            let rowCls = '';
            if (currentlyHidden) {
                rowCls = 'class="table-warning opacity-75"';
            } else if (isPast) {
                rowCls = 'class="table-secondary opacity-75"';
            }

            const fornBadge = (p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'badge me-1 mb-1')).join('');
            const ownBadge  = (p.owners    || []).map(o => this._badgeSpan('owner', o, 'badge me-1 mb-1')).join('');

            const extraRows = [];
            if (p.stimaGgu   != null) extraRows.push(`<span class="badge bg-info text-dark me-1">⏱️ ${p.stimaGgu} gg/u</span>`);
            if (p.stimaCosto != null) extraRows.push(`<span class="badge bg-warning text-dark me-1">💰 € ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`);

            const links = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            const jiraHtml = this.jiraLinksHtml(links);

            let statusBadge = '';
            if (p.hidden) {
                statusBadge = '<span class="badge bg-dark ms-1">🚫 Archiviato</span>';
            } else if (autoStale) {
                statusBadge = '<span class="badge bg-secondary ms-1">🕐 Auto-archiviato</span>';
            } else if (isPast) {
                statusBadge = '<span class="badge bg-success ms-1">✅ Rilasciato</span>';
            }

            return `
            <tr ${rowCls}>
                <td>
                    <strong>${p.nome || 'Senza nome'}</strong>
                    ${statusBadge}
                    ${jiraHtml ? `<div class="mt-1">${jiraHtml}</div>` : ''}
                    ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                </td>
                <td>
                    <div class="d-flex flex-wrap">${fornBadge}</div>
                    ${ownBadge ? `<div class="mt-1 d-flex flex-wrap">${ownBadge}</div>` : ''}
                </td>
                <td class="text-muted small">${this.formatDate(p.dataStima)}</td>
                <td class="text-muted small">${this.formatDate(p.dataIA)}</td>
                <td class="small">${this.formatDate(p.devStart)} ➔ ${this.formatDate(p.devEnd)}</td>
                <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
                <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
                <td class="small text-muted" style="max-width: 250px; white-space: pre-wrap;">${p.note || ''}</td>
                <td>
                    <button class="btn btn-sm ${p.hidden ? 'btn-secondary' : 'btn-outline-secondary'} mb-1" onclick="app.toggleHidden('${p.id}')" title="${p.hidden ? 'Ripristina Progetto' : 'Archivia (Nascondi)'}">${p.hidden ? '👁️' : '🚫'}</button>
                    <button class="btn btn-sm btn-outline-primary mb-1" onclick="app.openModal('${p.id}')" title="Modifica">✏️</button>
                    <button class="btn btn-sm btn-outline-danger mb-1" onclick="app.deleteProject('${p.id}')" title="Elimina">🗑️</button>
                </td>
            </tr>`;
        }).join('');
    },

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;

        const filtForn = document.getElementById('ganttFornitoreFilter')?.value || '';
        const filtOwn  = document.getElementById('ganttOwnerFilter')?.value || '';
        const sortMode = document.getElementById('ganttSortSelect')?.value || 'prod_inprogress_first';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;

        let data = this.data.filter(p =>
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
        const updateRange = d => {
            if (!d) return;
            const dt = new Date(d);
            if (!minDate || dt < minDate) minDate = dt;
            if (!maxDate || dt > maxDate) maxDate = dt;
        };
        data.forEach(p => {
            [p.dataIA, p.devStart, p.devEnd, p.dataTest, p.dataProd,
             p.dataUAT, p.dataBS, p.dataScadenzaStima, p.dataConfigSistema].forEach(updateRange);
            if(p.customMilestones) {
                p.customMilestones.forEach(m => updateRange(m.date));
            }
        });

        if (!minDate || !maxDate) {
            minDate = new Date(); maxDate = new Date();
        }

        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        let maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxMonth <= minDate) maxMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        maxDate = maxMonth;

        const totalDays = Math.ceil((maxDate - minDate) / 86400000);
        const pct = d => {
            const days = (new Date(d) - minDate) / 86400000;
            return Math.min(Math.max((days / totalDays) * 100, 0), 100);
        };

        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        let cur = new Date(minDate);
        while (cur <= maxDate) {
            const name = dayjs(cur).format('MMM YYYY');
            const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
            html += `<div class="gantt-month" style="width:${((days/totalDays)*100).toFixed(2)}%">${name}</div>`;
            cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        }
        html += '</div></div></div><div class="gantt-body">';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        data.forEach(p => {
            const startD = p.devStart ? p.devStart : (p.dataTest || p.dataProd || p.dataIA);
            const endD   = p.devEnd   ? p.devEnd   : startD;
            
            const leftPct  = startD ? pct(startD) : 0;
            const widthPct = startD && endD ? Math.max(pct(endD) - leftPct, 0.5) : 0;
            const barOpacity = (p.devStart && p.devEnd) ? 1 : 0.2;

            const badgesHtml = [
                ...(p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge mb-1')),
                ...(p.owners    || []).map(o => this._badgeSpan('owner', o, 'gantt-supplier-badge mb-1'))
            ].join('');

            const isPast = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale = this.isAutoStale(p);
            const currentlyHidden = this.isHiddenForUI(p);

            let rowCls = isPast ? ' gantt-row--released' : '';
            if (currentlyHidden) rowCls += ' opacity-50';

            let statusIcon = '';
            if (p.hidden) statusIcon = '<span class="badge bg-dark ms-1">🚫</span>';
            else if (autoStale) statusIcon = '<span class="badge bg-secondary ms-1" title="Auto-archiviato">🕐</span>';

            let allMilestones = [
                { date: p.dataIA,            cls: 'ms-ia',         icon: '🤖', label: 'Consegna IA',           always: true  },
                { date: p.devStart,          cls: 'ms-dev-start',  icon: '▶️',  label: 'Inizio Sviluppo',       always: true  },
                { date: p.devEnd,            cls: 'ms-dev-end',    icon: '⏹️',  label: 'Fine Sviluppo',         always: true  },
                { date: p.dataUAT,           cls: 'ms-uat',        icon: '👥', label: 'UAT',                   always: false },
                { date: p.dataBS,            cls: 'ms-bs',         icon: '💼', label: 'Business Simulation',   always: false },
                { date: p.dataTest,          cls: 'ms-test',       icon: '🧪', label: 'Rilascio Test',         always: true  },
                { date: p.dataProd,          cls: 'ms-prod',       icon: '🚀', label: 'Rilascio Prod',         always: true  },
                { date: p.dataScadenzaStima, cls: 'ms-scad-stima', icon: '📥', label: 'Scad. Stima Fornitore', always: false },
                { date: p.dataConfigSistema, cls: 'ms-config-sis', icon: '🔧', label: 'Config Sistema',        always: false }
            ];

            if (p.customMilestones) {
                p.customMilestones.forEach(cm => {
                    allMilestones.push({
                        date: cm.date,
                        cls: 'ms-custom',
                        icon: '⭐',
                        label: cm.label,
                        always: false
                    });
                });
            }

            allMilestones = allMilestones.filter(m => m.date && m.date.trim() !== '');

            const dateGroups = {};
            allMilestones.forEach(m => { (dateGroups[m.date] = dateGroups[m.date] || []).push(m); });
            allMilestones.forEach(m => {
                const g = dateGroups[m.date];
                m.offsetPx = (g.indexOf(m) - (g.length - 1) / 2) * 20;
            });

            const milestonesHtml = allMilestones.map(m => {
                const translateX = (-16 + m.offsetPx).toFixed(0);
                const inlineColor = m.cls === 'ms-custom' ? 'color:#198754;' : '';
                const inlineLineColor = m.cls === 'ms-custom' ? 'background:#198754;' : '';
                return `<div class="gantt-milestone ${m.cls}" style="left:${pct(m.date).toFixed(2)}%;transform:translateX(${translateX}px);" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date" style="${inlineColor}">${dayjs(m.date).format('DD/MM')}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line" style="${inlineLineColor}"></span>
                </div>`;
            }).join('');

            html += `
                <div class="gantt-row${rowCls}">
                    <div class="gantt-project-col"><div><strong>${p.nome} ${statusIcon}</strong><div class="gantt-supplier-list">${badgesHtml}</div></div></div>
                    <div class="gantt-timeline-col" style="position:relative;">
                        <div class="gantt-bar" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;opacity:${barOpacity};" title="Sviluppo: ${dayjs(startD).format('DD/MM/YYYY')} - ${dayjs(endD).format('DD/MM/YYYY')}">
                            <span>⚙️ Sviluppo</span>
                        </div>
                        ${milestonesHtml}
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
            <div class="gantt-legend-item"><span class="legend-ms">🤖</span> Consegna IA</div>
            <div class="gantt-legend-item"><span class="legend-ms">▶️</span> Inizio Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">⏹️</span> Fine Sviluppo</div>
            ${hasUAT       ? '<div class="gantt-legend-item"><span class="legend-ms">👥</span> UAT</div>'                       : ''}
            ${hasBS        ? '<div class="gantt-legend-item"><span class="legend-ms">💼</span> Business Simulation</div>'        : ''}
            <div class="gantt-legend-item"><span class="legend-ms">🧪</span> Rilascio Test</div>
            <div class="gantt-legend-item"><span class="legend-ms">🚀</span> Rilascio Prod</div>
            ${hasScadStima ? '<div class="gantt-legend-item"><span class="legend-ms">📥</span> Scad. Stima Fornitore</div>'     : ''}
            ${hasConfigSis ? '<div class="gantt-legend-item"><span class="legend-ms">🔧</span> Config Sistema</div>'            : ''}
            ${hasCustom    ? '<div class="gantt-legend-item"><span class="legend-ms" style="color:#198754">⭐</span> Milestone Personalizzate</div>'            : ''}
        </div>`;

        html += '</div>';
        container.innerHTML = html;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const filtForn = document.getElementById('calendarFornitoreFilter')?.value || '';
        const filtOwn  = document.getElementById('calendarOwnerFilter')?.value    || '';
        const filtMile = document.getElementById('calendarMilestoneFilter')?.value || '';
        const showHidden = document.getElementById('globalShowHidden')?.checked || false;

        const activeMilestones = filtMile && filtMile !== 'custom'
            ? this.MILESTONES.filter(m => m.key === filtMile)
            : this.MILESTONES;

        const events = [];
        this.data
            .filter(p =>
                (showHidden || !this.isHiddenForUI(p)) &&
                (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
                (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
            )
            .forEach(p => {
                const currentlyHidden = this.isHiddenForUI(p);
                const autoStale = this.isAutoStale(p);
                
                if (filtMile !== 'custom') {
                    activeMilestones.forEach(m => {
                        const v = p[m.key];
                        if (v && v.trim() !== '') {
                            events.push({
                                date:      dayjs(v),
                                sortKey:   v,
                                nome:      p.nome,
                                fornitori: p.fornitori || [],
                                owners:    p.owners    || [],
                                label:     m.label,
                                badge:     m.badge,
                                manual:    p.hidden,
                                autoStale: autoStale,
                                hidden:    currentlyHidden
                            });
                        }
                    });
                }
                
                if ((filtMile === '' || filtMile === 'custom') && p.customMilestones) {
                    p.customMilestones.forEach(cm => {
                        if (cm.date && cm.date.trim() !== '') {
                            events.push({
                                date:      dayjs(cm.date),
                                sortKey:   cm.date,
                                nome:      p.nome,
                                fornitori: p.fornitori || [],
                                owners:    p.owners    || [],
                                label:     `⭐ ${cm.label}`,
                                badge:     'bg-success',
                                manual:    p.hidden,
                                autoStale: autoStale,
                                hidden:    currentlyHidden
                            });
                        }
                    });
                }
            });

        if (events.length === 0) {
            container.innerHTML = "<div class='col-12'><p class='text-center text-muted p-3'>Nessun evento da visualizzare per i filtri selezionati.</p></div>";
            return;
        }

        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });

        container.innerHTML = Object.keys(groups).sort().map(k => {
            const g = groups[k];
            const sorted = g.events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
            return `
                <div class="col-md-4 mb-4">
                    <div class="card cal-month-card shadow-sm h-100">
                        <div class="card-header bg-white fw-bold text-uppercase text-primary">${g.label}</div>
                        <div class="card-body">
                            ${sorted.map(ev => {
                                const fb = ev.fornitori.map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge mb-1')).join('');
                                const ob = ev.owners.map(o    => this._badgeSpan('owner', o, 'gantt-supplier-badge mb-1')).join('');
                                const opacityCls = ev.hidden ? 'opacity-50' : '';
                                
                                let statusIcon = '';
                                if (ev.manual) statusIcon = '🚫';
                                else if (ev.autoStale) statusIcon = '<span title="Auto-archiviato">🕐</span>';
                                
                                return `
                                <div class="cal-event-item d-flex align-items-start gap-2 mb-2 ${opacityCls}">
                                    <span class="cal-event-date">${ev.date.format('DD/MM')}</span>
                                    <div>
                                        <span class="badge ${ev.badge} me-1">${ev.label}</span>
                                        <span class="small fw-semibold">${ev.nome} ${statusIcon}</span>
                                        ${fb || ob ? `<div class="cal-supplier-list mt-1">${fb}${ob}</div>` : ''}
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>`;
        }).join('');
    },

    formatDate: function(d) {
        return d ? dayjs(d).format('DD/MM/YY') : 'N/A';
    },

    showAlert: function(msg, type = 'info', timeout = 0) {
        const div = document.getElementById('alertArea');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>`;
        if (timeout) setTimeout(() => { div.innerHTML = ''; }, timeout);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());