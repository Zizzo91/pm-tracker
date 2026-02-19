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

    MILESTONES: [
        { key: 'dataIA',            label: '🤖 Consegna IA',            badge: 'bg-info text-dark' },
        { key: 'devStart',          label: '▶️ Inizio Sviluppo',         badge: 'bg-primary' },
        { key: 'devEnd',            label: '⏹️ Fine Sviluppo',           badge: 'bg-secondary' },
        { key: 'dataUAT',           label: '👥 UAT',                    badge: 'bg-info' },
        { key: 'dataBS',            label: '💼 Business Simulation',    badge: 'bg-dark' },
        { key: 'dataTest',          label: '🧪 Rilascio Test',          badge: 'bg-warning text-dark' },
        { key: 'dataProd',          label: '🚀 Rilascio Prod',          badge: 'bg-success' },
        { key: 'dataScadenzaStima',  label: '📥 Scad. Stima Fornitore',  badge: 'bg-light text-dark border' },
        { key: 'dataConfigSistema',  label: '🔧 Config Sistema',         badge: 'bg-light text-dark border' }
    ],

    init: function() {
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
    },

    csvToArray: function(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(s => (s || '').toString().trim()).filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    },

    normalizeProject: function(p) {
        // Supporto per legacy "owner" (stringa) trasformato in "owners" (array)
        const owners = this.csvToArray(p.owners || p.owner);
        const fornitori = this.csvToArray(p.fornitori);
        return { ...p, owners, fornitori };
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
        if (!this.config.token) return;
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
            
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
            this.showAlert('Dati aggiornati con successo!', 'success', 2000);
        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger');
        }
    },

    populateFornitoreFilters: function() {
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
    },

    populateOwnerFilters: function() {
        const allOwners = [...new Set(this.data.flatMap(p => p.owners || []))].sort((a,b) => a.localeCompare(b, 'it'));
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
    },

    saveProject: async function() {
        const dates = {
            stima:    document.getElementById('p_stima').value,
            ia:       document.getElementById('p_ia').value,
            devStart: document.getElementById('p_devStart').value,
            devEnd:   document.getElementById('p_devEnd').value,
            test:     document.getElementById('p_test').value,
            prod:     document.getElementById('p_prod').value,
            uat:      document.getElementById('p_uat').value  || null,
            bs:       document.getElementById('p_bs').value   || null
        };
        if (dates.stima > dates.ia || dates.ia > dates.devStart ||
            dates.devStart > dates.devEnd || dates.devEnd > dates.test ||
            dates.test > dates.prod) {
            document.getElementById('dateValidationMsg').innerText = 'ERRORE: La sequenza temporale non è rispettata! (Stima < IA < Dev < Test < Prod)';
            return;
        }
        const stimaGgu    = parseFloat(document.getElementById('p_stimaGgu').value);
        const rcFornitore = parseFloat(document.getElementById('p_rcFornitore').value);
        const id = document.getElementById('p_id').value;
        
        const fornitori = document.getElementById('p_fornitori').value.split(',').map(s => s.trim()).filter(Boolean);
        const owners = document.getElementById('p_owners').value.split(',').map(s => s.trim()).filter(Boolean);

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
            dataScadenzaStima: document.getElementById('p_dataScadenzaStima').value || null,
            dataConfigSistema: document.getElementById('p_dataConfigSistema').value || null,
            stimaGgu:          isNaN(stimaGgu)    ? null : stimaGgu,
            rcFornitore:       isNaN(rcFornitore) ? null : rcFornitore,
            stimaCosto:        (!isNaN(stimaGgu) && !isNaN(rcFornitore)) ? stimaGgu * rcFornitore : null
        };
        if (id) {
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
            document.getElementById('p_owners').value            = (p.owners || p.owner ? this.csvToArray(p.owners || p.owner) : []).join(', ');
            document.getElementById('p_stima').value             = p.dataStima;
            document.getElementById('p_ia').value                = p.dataIA;
            document.getElementById('p_devStart').value          = p.devStart;
            document.getElementById('p_devEnd').value            = p.devEnd;
            document.getElementById('p_test').value              = p.dataTest;
            document.getElementById('p_prod').value              = p.dataProd;
            document.getElementById('p_uat').value               = p.dataUAT  || '';
            document.getElementById('p_bs').value                = p.dataBS   || '';
            document.getElementById('p_dataScadenzaStima').value = p.dataScadenzaStima || '';
            document.getElementById('p_dataConfigSistema').value = p.dataConfigSistema || '';
            document.getElementById('p_stimaGgu').value          = p.stimaGgu    != null ? p.stimaGgu    : '';
            document.getElementById('p_rcFornitore').value       = p.rcFornitore != null ? p.rcFornitore : '';
            this.calcCosto();
            const links = p.jiraLinks && p.jiraLinks.length > 0
                ? p.jiraLinks
                : (p.jira ? [p.jira] : []);
            this.renderJiraFields(links);
        } else {
            document.getElementById('p_id').value = '';
            this.renderJiraFields([]);
        }
        this.editorModal.show();
    },

    deleteProject: async function(id) {
        if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
            this.data = this.data.filter(p => p.id !== id);
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
                sorted.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));
                break;
            case 'alpha_desc':
                sorted.sort((a, b) => b.nome.localeCompare(a.nome, 'it'));
                break;
        }
        return sorted;
    },

    renderTable: function() {
        const tbody    = document.getElementById('projectsTableBody');
        const search   = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const filtForn = document.getElementById('tableFornitoreFilter')?.value || '';
        const filtOwn  = document.getElementById('tableOwnerFilter')?.value || '';
        const sortMode = document.getElementById('tableSortSelect')?.value || 'prod_inprogress_first';

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filtered = this.data.filter(p => 
            p.nome.toLowerCase().includes(search) && 
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn || (p.owners && p.owners.includes(filtOwn)))
        );

        filtered = this._sortGantt(filtered, sortMode);

        tbody.innerHTML = filtered.map(p => {
                const isPast = p.dataProd && new Date(p.dataProd) <= today;
                const rowCls = isPast ? 'class="table-secondary opacity-75"' : '';

                const fornBadge = p.fornitori.map(f => `<span class="badge bg-secondary me-1">${f}</span>`).join('');
                const ownBadge = (p.owners || []).map(o => `<span class="badge bg-info text-dark me-1">${o}</span>`).join('');
                
                const extraRows = [];
                if (p.stimaGgu   != null) extraRows.push(`<span class="badge bg-info text-dark me-1">⏱️ ${p.stimaGgu} gg/u</span>`);
                if (p.stimaCosto != null) extraRows.push(`<span class="badge bg-warning text-dark me-1">💰 € ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`);

                const links = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
                const jiraHtml = this.jiraLinksHtml(links);

                return `
                <tr ${rowCls}>
                    <td>
                        <strong>${p.nome}</strong>
                        ${isPast ? '<span class="badge bg-success ms-1">✅ Rilasciato</span>' : ''}
                        ${jiraHtml ? `<div class="mt-1">${jiraHtml}</div>` : ''}
                        ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                    </td>
                    <td>
                        <div>${fornBadge}</div>
                        <div class="mt-1">${ownBadge}</div>
                    </td>
                    <td class="text-muted small">${this.formatDate(p.dataStima)}</td>
                    <td class="text-muted small">${this.formatDate(p.dataIA)}</td>
                    <td class="small">${this.formatDate(p.devStart)} ➔ ${this.formatDate(p.devEnd)}</td>
                    <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
                    <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.openModal('${p.id}')">📝</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteProject('${p.id}')">🗑️</button>
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

        let data = this.data.filter(p => 
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn || (p.owners && p.owners.includes(filtOwn)))
        );
        data = this._sortGantt(data, sortMode);

        if (data.length === 0) {
            container.innerHTML = "<p class='text-center p-3 text-muted'>Nessun progetto da visualizzare per i filtri selezionati.</p>";
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
        });

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
            const leftPct  = pct(p.devStart);
            const widthPct = Math.max(pct(p.devEnd) - leftPct, 0.5);
            
            const badgesHtml = [
                ...(p.fornitori || []).map(f => `<span class="gantt-supplier-badge">${f}</span>`),
                ...(p.owners || []).map(o => `<span class="gantt-supplier-badge bg-info text-dark">${o}</span>`)
            ].join('');

            const isPast = p.dataProd && new Date(p.dataProd) <= today;
            const rowCls = isPast ? ' gantt-row--released' : '';

            const allMilestones = [
                { date: p.dataIA,            cls: 'ms-ia',         icon: '🤖', label: 'Consegna IA',           always: true  },
                { date: p.devStart,          cls: 'ms-dev-start',  icon: '▶️',  label: 'Inizio Sviluppo',      always: true  },
                { date: p.devEnd,            cls: 'ms-dev-end',    icon: '⏹️',  label: 'Fine Sviluppo',        always: true  },
                { date: p.dataUAT,           cls: 'ms-uat',        icon: '👥', label: 'UAT',                   always: false },
                { date: p.dataBS,            cls: 'ms-bs',         icon: '💼', label: 'Business Simulation',   always: false },
                { date: p.dataTest,          cls: 'ms-test',       icon: '🧪', label: 'Rilascio Test',         always: true  },
                { date: p.dataProd,          cls: 'ms-prod',       icon: '🚀', label: 'Rilascio Prod',         always: true  },
                { date: p.dataScadenzaStima, cls: 'ms-scad-stima', icon: '📥', label: 'Scad. Stima Fornitore',  always: false },
                { date: p.dataConfigSistema, cls: 'ms-config-sis', icon: '🔧', label: 'Config Sistema',        always: false }
            ].filter(m => m.date && m.date.trim() !== '');

            const dateGroups = {};
            allMilestones.forEach(m => { (dateGroups[m.date] = dateGroups[m.date] || []).push(m); });
            allMilestones.forEach(m => {
                const g = dateGroups[m.date];
                m.offsetPx = (g.indexOf(m) - (g.length - 1) / 2) * 20;
            });

            const milestonesHtml = allMilestones.map(m => {
                const translateX = (-16 + m.offsetPx).toFixed(0);
                return `<div class="gantt-milestone ${m.cls}" style="left:${pct(m.date).toFixed(2)}%;transform:translateX(${translateX}px);" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date">${dayjs(m.date).format('DD/MM')}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line"></span>
                </div>`;
            }).join('');

            html += `
                <div class="gantt-row${rowCls}">
                    <div class="gantt-project-col"><div><strong>${p.nome}</strong><div class="gantt-supplier-list">${badgesHtml}</div></div></div>
                    <div class="gantt-timeline-col" style="position:relative;">
                        <div class="gantt-bar" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;" title="Sviluppo: ${dayjs(p.devStart).format('DD/MM/YYYY')} - ${dayjs(p.devEnd).format('DD/MM/YYYY')}">
                            <span>⚙️ Sviluppo</span>
                        </div>
                        ${milestonesHtml}
                    </div>
                </div>`;
        });
        html += '</div>';

        const hasUAT = data.some(p => p.dataUAT && p.dataUAT.trim() !== '');
        const hasBS  = data.some(p => p.dataBS && p.dataBS.trim() !== '');
        const hasScadStima = data.some(p => p.dataScadenzaStima && p.dataScadenzaStima.trim() !== '');
        const hasConfigSis = data.some(p => p.dataConfigSistema && p.dataConfigSistema.trim() !== '');

        html += `
        <div class="gantt-legend">
            <div class="gantt-legend-item"><span class="legend-bar"></span> Fase di Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">🤖</span> Consegna IA</div>
            <div class="gantt-legend-item"><span class="legend-ms">▶️</span> Inizio Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">⏹️</span> Fine Sviluppo</div>
            ${hasUAT ? '<div class="gantt-legend-item"><span class="legend-ms">👥</span> UAT</div>' : ''}
            ${hasBS  ? '<div class="gantt-legend-item"><span class="legend-ms">💼</span> Business Simulation</div>' : ''}
            <div class="gantt-legend-item"><span class="legend-ms">🧪</span> Rilascio Test</div>
            <div class="gantt-legend-item"><span class="legend-ms">🚀</span> Rilascio Prod</div>
            ${hasScadStima ? '<div class="gantt-legend-item"><span class="legend-ms">📥</span> Scad. Stima Fornitore</div>' : ''}
            ${hasConfigSis ? '<div class="gantt-legend-item"><span class="legend-ms">🔧</span> Config Sistema</div>' : ''}
        </div>`;

        html += '</div>';
        container.innerHTML = html;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const filtForn = document.getElementById('calendarFornitoreFilter')?.value || '';
        const filtOwn  = document.getElementById('calendarOwnerFilter')?.value || '';
        const filtMile = document.getElementById('calendarMilestoneFilter')?.value || '';

        const activeMilestones = filtMile 
            ? this.MILESTONES.filter(m => m.key === filtMile)
            : this.MILESTONES;

        const events = [];
        this.data
            .filter(p => 
                (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
                (!filtOwn  || (p.owners && p.owners.includes(filtOwn)))
            )
            .forEach(p => {
                activeMilestones.forEach(m => {
                    const v = p[m.key];
                    if (v && v.trim() !== '') {
                        events.push({
                            date:      dayjs(v),
                            sortKey:   v,
                            nome:      p.nome,
                            fornitori: p.fornitori || [],
                            owners:    p.owners || [],
                            label:     m.label,
                            badge:     m.badge
                        });
                    }
                });
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
                                const fb = ev.fornitori.map(f => `<span class="gantt-supplier-badge">${f}</span>`).join('');
                                const ob = ev.owners.map(o => `<span class="gantt-supplier-badge bg-info text-dark">${o}</span>`).join('');
                                return `
                                <div class="cal-event-item d-flex align-items-start gap-2 mb-2">
                                    <span class="cal-event-date">${ev.date.format('DD/MM')}</span>
                                    <div>
                                        <span class="badge ${ev.badge} me-1">${ev.label}</span>
                                        <span class="small fw-semibold">${ev.nome}</span>
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
            ${msg}<button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>`;
        if (timeout) setTimeout(() => { div.innerHTML = ''; }, timeout);
    }
};

document.addEventListener('DOMContentLoaded', () => app.init());
