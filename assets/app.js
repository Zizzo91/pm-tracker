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

    init: function() {
        this.editorModal = new bootstrap.Modal(document.getElementById('editorModal'));
        this.settingsModal = new bootstrap.Modal(document.getElementById('settingsModal'));

        // Calcolo automatico costo al cambio di gg/u o RC
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

    // Calcola e aggiorna il campo costo in tempo reale
    calcCosto: function() {
        const ggu = parseFloat(document.getElementById('p_stimaGgu').value);
        const rc  = parseFloat(document.getElementById('p_rcFornitore').value);
        const out = document.getElementById('p_stimaCosto');
        if (!isNaN(ggu) && !isNaN(rc) && ggu >= 0 && rc >= 0) {
            const costo = ggu * rc;
            out.value = '€ ' + costo.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        } else {
            out.value = '';
        }
    },

    showSettings: function() {
        document.getElementById('cfg_owner').value = this.config.owner;
        document.getElementById('cfg_repo').value = this.config.repo;
        document.getElementById('cfg_token').value = this.config.token;
        document.getElementById('cfg_path').value = this.config.path;
        this.settingsModal.show();
    },

    saveSettings: function() {
        this.config = {
            owner: document.getElementById('cfg_owner').value.trim(),
            repo: document.getElementById('cfg_repo').value.trim(),
            token: document.getElementById('cfg_token').value.trim(),
            path: document.getElementById('cfg_path').value.trim() || 'data/projects.json'
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
            this.sha = json.sha;
            
            const content = decodeURIComponent(escape(atob(json.content)));
            this.data = JSON.parse(content);

            this.populateFornitoreFilters();
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
            this.showAlert('Dati aggiornati con successo!', 'success', 2000);

        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger');
        }
    },

    // Raccoglie tutti i fornitori univoci e popola i due <select> filtro
    populateFornitoreFilters: function() {
        const allSuppliers = [...new Set(
            this.data.flatMap(p => p.fornitori || [])
        )].sort();

        ['ganttFornitoreFilter', 'tableFornitoreFilter'].forEach(id => {
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
            document.getElementById('dateValidationMsg').innerText = "ERRORE: La sequenza temporale non \u00e8 rispettata! (Stima < IA < Dev < Test < Prod)";
            return;
        }

        const stimaGgu    = parseFloat(document.getElementById('p_stimaGgu').value);
        const rcFornitore = parseFloat(document.getElementById('p_rcFornitore').value);

        const id = document.getElementById('p_id').value;
        const newProj = {
            id:                  id || Date.now().toString(),
            nome:                document.getElementById('p_nome').value,
            fornitori:           document.getElementById('p_fornitori').value.split(',').map(s => s.trim()),
            dataStima:           dates.stima,
            dataIA:              dates.ia,
            devStart:            dates.devStart,
            devEnd:              dates.devEnd,
            dataTest:            dates.test,
            dataProd:            dates.prod,
            dataUAT:             dates.uat,
            dataBS:              dates.bs,
            jira:                document.getElementById('p_jira').value,
            // Campi opzionali aggiuntivi
            dataScadenzaStima:   document.getElementById('p_dataScadenzaStima').value || null,
            dataConfigSistema:   document.getElementById('p_dataConfigSistema').value || null,
            stimaGgu:            isNaN(stimaGgu)    ? null : stimaGgu,
            rcFornitore:         isNaN(rcFornitore) ? null : rcFornitore,
            stimaCosto:          (!isNaN(stimaGgu) && !isNaN(rcFornitore)) ? stimaGgu * rcFornitore : null
        };

        if (id) {
            const idx = this.data.findIndex(p => p.id === id);
            this.data[idx] = newProj;
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

            const body = {
                message: `Update data via PM Tracker webapp - ${new Date().toISOString()}`,
                content: content,
                sha: this.sha
            };

            const response = await fetch(url, {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${this.config.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Salvataggio fallito');
            }
            
            const resJson = await response.json();
            this.sha = resJson.content.sha;
            
            this.loadData();
            this.showAlert('Dati salvati su GitHub!', 'success');

        } catch (e) {
            console.error('Errore sync:', e);
            this.showAlert(`Errore salvataggio: ${e.message}`, 'danger');
        }
    },

    openModal: function(id = null) {
        document.getElementById('projectForm').reset();
        document.getElementById('dateValidationMsg').innerText = "";
        document.getElementById('p_stimaCosto').value = "";
        
        if (id) {
            const p = this.data.find(x => x.id === id);
            document.getElementById('p_id').value                = p.id;
            document.getElementById('p_nome').value              = p.nome;
            document.getElementById('p_fornitori').value         = p.fornitori.join(', ');
            document.getElementById('p_stima').value             = p.dataStima;
            document.getElementById('p_ia').value                = p.dataIA;
            document.getElementById('p_devStart').value          = p.devStart;
            document.getElementById('p_devEnd').value            = p.devEnd;
            document.getElementById('p_test').value              = p.dataTest;
            document.getElementById('p_prod').value              = p.dataProd;
            document.getElementById('p_uat').value               = p.dataUAT  || '';
            document.getElementById('p_bs').value                = p.dataBS   || '';
            document.getElementById('p_jira').value              = p.jira     || '';
            // Campi opzionali aggiuntivi
            document.getElementById('p_dataScadenzaStima').value = p.dataScadenzaStima || '';
            document.getElementById('p_dataConfigSistema').value = p.dataConfigSistema || '';
            document.getElementById('p_stimaGgu').value          = p.stimaGgu    != null ? p.stimaGgu    : '';
            document.getElementById('p_rcFornitore').value       = p.rcFornitore != null ? p.rcFornitore : '';
            this.calcCosto();
        } else {
            document.getElementById('p_id').value = "";
        }
        this.editorModal.show();
    },

    deleteProject: async function(id) {
        if(confirm("Sei sicuro di voler eliminare questo progetto?")) {
            this.data = this.data.filter(p => p.id !== id);
            await this.syncToGithub();
        }
    },

    renderTable: function() {
        const tbody  = document.getElementById('projectsTableBody');
        const search = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';
        const fSel   = document.getElementById('tableFornitoreFilter');
        const filt   = fSel ? fSel.value : '';

        tbody.innerHTML = this.data
            .filter(p => {
                const matchName = p.nome.toLowerCase().includes(search);
                const matchSupplier = !filt || (p.fornitori && p.fornitori.includes(filt));
                return matchName && matchSupplier;
            })
            .sort((a,b) => new Date(a.dataProd) - new Date(b.dataProd))
            .map(p => {
                // Badge fornitori
                const fornitoriBadges = p.fornitori.map(f => `<span class="badge bg-secondary me-1">${f}</span>`).join('');

                // Righe opzionali da mostrare solo se presenti
                const extraRows = [];
                if (p.dataScadenzaStima) extraRows.push(`<span class="badge bg-light text-dark border me-1" title="Scadenza stima fornitore">📅 Scad. Stima: ${this.formatDate(p.dataScadenzaStima)}</span>`);
                if (p.dataConfigSistema) extraRows.push(`<span class="badge bg-light text-dark border me-1" title="Data config sistema">🔧 Config: ${this.formatDate(p.dataConfigSistema)}</span>`);
                if (p.stimaGgu != null)  extraRows.push(`<span class="badge bg-info text-dark me-1" title="Stima fornitore in gg/u">⏱️ ${p.stimaGgu} gg/u</span>`);
                if (p.stimaCosto != null) extraRows.push(`<span class="badge bg-warning text-dark me-1" title="Stima costo">💰 € ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>`);

                return `
                <tr>
                    <td>
                        <strong>${p.nome}</strong><br>
                        <a href="${p.jira}" target="_blank" class="text-xs text-decoration-none">Jira 🔗</a>
                        ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                    </td>
                    <td>${fornitoriBadges}</td>
                    <td class="text-muted small">${this.formatDate(p.dataStima)}</td>
                    <td class="text-muted small">${this.formatDate(p.dataIA)}</td>
                    <td class="small">${this.formatDate(p.devStart)} ➝ ${this.formatDate(p.devEnd)}</td>
                    <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
                    <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary" onclick="app.openModal('${p.id}')">✏️</button>
                        <button class="btn btn-sm btn-outline-danger" onclick="app.deleteProject('${p.id}')">🗑️</button>
                    </td>
                </tr>
            `;}).join('');
    },

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;

        const fSel  = document.getElementById('ganttFornitoreFilter');
        const filt  = fSel ? fSel.value : '';
        const data  = filt
            ? this.data.filter(p => p.fornitori && p.fornitori.includes(filt))
            : this.data;

        if (data.length === 0) {
            container.innerHTML = "<p class='text-center p-3 text-muted'>Nessun progetto da visualizzare per il fornitore selezionato.</p>";
            return;
        }

        let minDate = null, maxDate = null;
        const updateRange = (dateStr) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (!minDate || d < minDate) minDate = d;
            if (!maxDate || d > maxDate) maxDate = d;
        };
        data.forEach(p => {
            updateRange(p.dataIA);
            updateRange(p.devStart);
            updateRange(p.devEnd);
            updateRange(p.dataTest);
            updateRange(p.dataProd);
            updateRange(p.dataUAT);
            updateRange(p.dataBS);
        });

        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        let maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxMonth <= minDate) maxMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        const lastDayOfMaxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxDate.getTime() === lastDayOfMaxMonth.getTime()) maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
        maxDate = maxMonth;

        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));

        const pct = (dateStr) => {
            const d = (new Date(dateStr) - minDate) / (1000 * 60 * 60 * 24);
            return Math.min(Math.max((d / totalDays) * 100, 0), 100);
        };

        // Intestazione mesi
        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        let currentMonth = new Date(minDate);
        while (currentMonth <= maxDate) {
            const monthName   = dayjs(currentMonth).format('MMM YYYY');
            const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const widthPct    = (daysInMonth / totalDays) * 100;
            html += `<div class="gantt-month" style="width: ${widthPct.toFixed(2)}%">${monthName}</div>`;
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        }
        html += '</div></div></div>';

        // Righe progetto
        html += '<div class="gantt-body">';
        data.forEach(p => {
            const start    = p.devStart;
            const end      = p.devEnd;
            const leftPct  = pct(start);
            const widthPct = Math.max(pct(end) - leftPct, 0.5);

            // Badge fornitori per la card
            const fornitoriHtml = (p.fornitori || []).map(f =>
                `<span class="gantt-supplier-badge">${f}</span>`
            ).join('');

            // Milestone attive
            const allMilestones = [
                { date: p.dataIA,   cls: 'ms-ia',        icon: '\ud83e\udd16', label: 'Consegna IA',         always: true  },
                { date: p.devStart, cls: 'ms-dev-start', icon: '\u25b6\ufe0f',  label: 'Inizio Sviluppo',     always: true  },
                { date: p.devEnd,   cls: 'ms-dev-end',   icon: '\u23f9\ufe0f',  label: 'Fine Sviluppo',       always: true  },
                { date: p.dataUAT,  cls: 'ms-uat',       icon: '\ud83d\udc65', label: 'UAT',                 always: false },
                { date: p.dataBS,   cls: 'ms-bs',        icon: '\ud83d\udcbc', label: 'Business Simulation', always: false },
                { date: p.dataTest, cls: 'ms-test',      icon: '\ud83e\uddea', label: 'Rilascio Test',       always: true  },
                { date: p.dataProd, cls: 'ms-prod',      icon: '\ud83d\ude80', label: 'Rilascio Prod',       always: true  }
            ].filter(m => m.date && (m.always || m.date.trim() !== ''));

            // Offset milestone coincidenti
            const dateGroups = {};
            allMilestones.forEach(m => {
                if (!dateGroups[m.date]) dateGroups[m.date] = [];
                dateGroups[m.date].push(m);
            });
            allMilestones.forEach(m => {
                const group = dateGroups[m.date];
                const idx   = group.indexOf(m);
                const count = group.length;
                m.offsetPx  = (idx - (count - 1) / 2) * 20;
            });

            const milestonesHtml = allMilestones.map(m => {
                const pos        = pct(m.date);
                const dateLabel  = dayjs(m.date).format('DD/MM');
                const translateX = (-16 + m.offsetPx).toFixed(0);
                return `<div class="gantt-milestone ${m.cls}" style="left: ${pos.toFixed(2)}%; transform: translateX(${translateX}px);" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date">${dateLabel}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line"></span>
                </div>`;
            }).join('');

            html += `
                <div class="gantt-row">
                    <div class="gantt-project-col">
                        <div>
                            <strong>${p.nome}</strong>
                            <div class="gantt-supplier-list">${fornitoriHtml}</div>
                        </div>
                    </div>
                    <div class="gantt-timeline-col" style="position:relative;">
                        <div class="gantt-bar" style="left: ${leftPct.toFixed(2)}%; width: ${widthPct.toFixed(2)}%;" title="Sviluppo: ${dayjs(start).format('DD/MM/YYYY')} - ${dayjs(end).format('DD/MM/YYYY')}">
                            <span>\u2699\ufe0f Sviluppo</span>
                        </div>
                        ${milestonesHtml}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        const hasUAT = data.some(p => p.dataUAT && p.dataUAT.trim() !== '');
        const hasBS  = data.some(p => p.dataBS  && p.dataBS.trim()  !== '');
        html += `
        <div class="gantt-legend">
            <div class="gantt-legend-item"><span class="legend-bar"></span> Fase di Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">\ud83e\udd16</span> Consegna IA</div>
            <div class="gantt-legend-item"><span class="legend-ms">\u25b6\ufe0f</span> Inizio Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">\u23f9\ufe0f</span> Fine Sviluppo</div>
            ${hasUAT ? '<div class="gantt-legend-item"><span class="legend-ms">\ud83d\udc65</span> UAT</div>' : ''}
            ${hasBS  ? '<div class="gantt-legend-item"><span class="legend-ms">\ud83d\udcbc</span> Business Simulation</div>' : ''}
            <div class="gantt-legend-item"><span class="legend-ms">\ud83e\uddea</span> Rilascio Test</div>
            <div class="gantt-legend-item"><span class="legend-ms">\ud83d\ude80</span> Rilascio Prod</div>
        </div>
        `;

        html += '</div>';
        container.innerHTML = html;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const milestones = [
            { key: 'dataIA',   label: '\ud83e\udd16 Consegna IA',         badge: 'bg-info text-dark' },
            { key: 'devStart', label: '\u25b6\ufe0f Inizio Sviluppo',      badge: 'bg-primary' },
            { key: 'devEnd',   label: '\u23f9\ufe0f Fine Sviluppo',        badge: 'bg-secondary' },
            { key: 'dataUAT',  label: '\ud83d\udc65 UAT',                  badge: 'bg-info' },
            { key: 'dataBS',   label: '\ud83d\udcbc Business Simulation',  badge: 'bg-dark' },
            { key: 'dataTest', label: '\ud83e\uddea Rilascio Test',        badge: 'bg-warning text-dark' },
            { key: 'dataProd', label: '\ud83d\ude80 Rilascio Prod',        badge: 'bg-success' },
            { key: 'dataScadenzaStima', label: '\ud83d\udcc5 Scad. Stima Fornitore', badge: 'bg-light text-dark border' },
            { key: 'dataConfigSistema', label: '\ud83d\udd27 Config Sistema',         badge: 'bg-light text-dark border' }
        ];

        const events = [];
        this.data.forEach(p => {
            milestones.forEach(m => {
                const dateVal = p[m.key];
                if (dateVal && dateVal.trim() !== '') {
                    events.push({
                        date:      dayjs(dateVal),
                        sortKey:   dateVal,
                        nome:      p.nome,
                        fornitori: p.fornitori || [],
                        label:     m.label,
                        badge:     m.badge
                    });
                }
            });
        });

        if (events.length === 0) {
            container.innerHTML = "<div class='col-12'><p class='text-center text-muted p-3'>Nessun evento da visualizzare</p></div>";
            return;
        }

        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });

        container.innerHTML = Object.keys(groups).sort().map(monthKey => {
            const group = groups[monthKey];
            const sortedEvents = group.events.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
            return `
                <div class="col-md-4 mb-4">
                    <div class="card cal-month-card shadow-sm h-100">
                        <div class="card-header bg-white fw-bold text-uppercase text-primary">${group.label}</div>
                        <div class="card-body">
                            ${sortedEvents.map(ev => {
                                const supplierBadges = ev.fornitori
                                    .map(f => `<span class="gantt-supplier-badge">${f}</span>`)
                                    .join('');
                                return `
                                <div class="cal-event-item d-flex align-items-start gap-2 mb-2">
                                    <span class="cal-event-date">${ev.date.format('DD/MM')}</span>
                                    <div>
                                        <span class="badge ${ev.badge} me-1">${ev.label}</span>
                                        <span class="small fw-semibold">${ev.nome}</span>
                                        ${supplierBadges ? `<span class="cal-supplier-list ms-1">${supplierBadges}</span>` : ''}
                                    </div>
                                </div>`;
                            }).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    },

    formatDate: function(d) {
        if (!d) return 'N/A';
        return dayjs(d).format('DD/MM/YY');
    },

    showAlert: function(msg, type = 'info', timeout = 0) {
        const div = document.getElementById('alertArea');
        if (!div) return;
        div.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${msg}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
        if (timeout) setTimeout(() => { div.innerHTML = ''; }, timeout);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    app.init();
});
