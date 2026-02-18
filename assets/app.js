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
        
        const savedCfg = localStorage.getItem('pm_tracker_config');
        if (savedCfg) {
            this.config = JSON.parse(savedCfg);
            this.loadData();
        } else {
            this.showSettings();
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
            
            this.renderTable();
            this.renderGantt();
            this.renderCalendar();
            this.showAlert('Dati aggiornati con successo!', 'success', 2000);

        } catch (error) {
            console.error(error);
            this.showAlert(`Impossibile caricare i dati: ${error.message}`, 'danger');
        }
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
            document.getElementById('dateValidationMsg').innerText = "ERRORE: La sequenza temporale non è rispettata! (Stima < IA < Dev < Test < Prod)";
            return;
        }

        const id = document.getElementById('p_id').value;
        const newProj = {
            id:        id || Date.now().toString(),
            nome:      document.getElementById('p_nome').value,
            fornitori: document.getElementById('p_fornitori').value.split(',').map(s => s.trim()),
            dataStima: dates.stima,
            dataIA:    dates.ia,
            devStart:  dates.devStart,
            devEnd:    dates.devEnd,
            dataTest:  dates.test,
            dataProd:  dates.prod,
            dataUAT:   dates.uat,
            dataBS:    dates.bs,
            jira:      document.getElementById('p_jira').value
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
        
        if (id) {
            const p = this.data.find(x => x.id === id);
            document.getElementById('p_id').value       = p.id;
            document.getElementById('p_nome').value     = p.nome;
            document.getElementById('p_fornitori').value = p.fornitori.join(', ');
            document.getElementById('p_stima').value    = p.dataStima;
            document.getElementById('p_ia').value       = p.dataIA;
            document.getElementById('p_devStart').value = p.devStart;
            document.getElementById('p_devEnd').value   = p.devEnd;
            document.getElementById('p_test').value     = p.dataTest;
            document.getElementById('p_prod').value     = p.dataProd;
            document.getElementById('p_uat').value      = p.dataUAT  || '';
            document.getElementById('p_bs').value       = p.dataBS   || '';
            document.getElementById('p_jira').value     = p.jira;
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
        const tbody = document.getElementById('projectsTableBody');
        const filter = document.getElementById('searchInput') ? document.getElementById('searchInput').value.toLowerCase() : '';
        
        tbody.innerHTML = this.data
            .filter(p => p.nome.toLowerCase().includes(filter))
            .sort((a,b) => new Date(a.dataProd) - new Date(b.dataProd))
            .map(p => `
            <tr>
                <td><strong>${p.nome}</strong><br><a href="${p.jira}" target="_blank" class="text-xs text-decoration-none">Jira 🔗</a></td>
                <td>${p.fornitori.map(f => `<span class="badge bg-secondary me-1">${f}</span>`).join('')}</td>
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
        `).join('');
    },

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;

        if (this.data.length === 0) {
            container.innerHTML = "<p class='text-center p-3'>Nessun progetto da visualizzare</p>";
            return;
        }

        // Calcola min/max su TUTTE le date rilevanti
        let minDate = null, maxDate = null;
        const updateRange = (dateStr) => {
            if (!dateStr) return;
            const d = new Date(dateStr);
            if (!minDate || d < minDate) minDate = d;
            if (!maxDate || d > maxDate) maxDate = d;
        };
        this.data.forEach(p => {
            updateRange(p.dataIA);
            updateRange(p.devStart);
            updateRange(p.devEnd);
            updateRange(p.dataTest);
            updateRange(p.dataProd);
            updateRange(p.dataUAT);
            updateRange(p.dataBS);
        });

        // Snap ai mesi
        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        let maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxMonth <= minDate) {
            maxMonth = new Date(minDate.getFullYear(), minDate.getMonth() + 2, 0);
        }
        const lastDayOfMaxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);
        if (maxDate.getTime() === lastDayOfMaxMonth.getTime()) {
            maxMonth = new Date(maxDate.getFullYear(), maxDate.getMonth() + 2, 0);
        }
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
            const monthName    = dayjs(currentMonth).format('MMM YYYY');
            const daysInMonth  = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const widthPercent = (daysInMonth / totalDays) * 100;
            html += `<div class="gantt-month" style="width: ${widthPercent.toFixed(2)}%">${monthName}</div>`;
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        }
        html += '</div></div></div>';

        // Righe progetto
        html += '<div class="gantt-body">';
        this.data.forEach(p => {
            const start      = p.devStart;
            const end        = p.devEnd;
            const leftPct    = pct(start);
            const endPlusOne = dayjs(end).add(1, 'day').format('YYYY-MM-DD');
            const widthPct   = Math.max(pct(endPlusOne) - leftPct, 0.5);

            // Milestone — devStart e devEnd inclusi sulla timeline, opzionali filtrate
            const allMilestones = [
                { date: p.dataIA,   cls: 'ms-ia',        icon: '🤖', label: 'Consegna IA',         always: true  },
                { date: p.devStart, cls: 'ms-dev-start', icon: '▶️',  label: 'Inizio Sviluppo',     always: true  },
                { date: p.devEnd,   cls: 'ms-dev-end',   icon: '⏹️',  label: 'Fine Sviluppo',       always: true  },
                { date: p.dataUAT,  cls: 'ms-uat',       icon: '👥', label: 'UAT',                 always: false },
                { date: p.dataBS,   cls: 'ms-bs',        icon: '💼', label: 'Business Simulation', always: false },
                { date: p.dataTest, cls: 'ms-test',      icon: '🧪', label: 'Rilascio Test',       always: true  },
                { date: p.dataProd, cls: 'ms-prod',      icon: '🚀', label: 'Rilascio Prod',       always: true  }
            ].filter(m => m.always || (m.date && m.date.trim() !== ''));

            const milestonesHtml = allMilestones.map(m => {
                if (!m.date) return '';
                const pos       = pct(m.date);
                const dateLabel = dayjs(m.date).format('DD/MM');
                return `<div class="gantt-milestone ${m.cls}" style="left: ${pos.toFixed(2)}%" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date">${dateLabel}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line"></span>
                </div>`;
            }).join('');

            html += `
                <div class="gantt-row">
                    <div class="gantt-project-col">
                        <strong>${p.nome}</strong>
                    </div>
                    <div class="gantt-timeline-col" style="position:relative;">
                        <div class="gantt-bar" style="left: ${leftPct.toFixed(2)}%; width: ${widthPct.toFixed(2)}%;" title="Sviluppo: ${dayjs(start).format('DD/MM/YYYY')} - ${dayjs(end).format('DD/MM/YYYY')}">
                            <span>⚙️ Sviluppo</span>
                        </div>
                        ${milestonesHtml}
                    </div>
                </div>
            `;
        });
        html += '</div>';

        // Legenda dinamica
        const hasUAT = this.data.some(p => p.dataUAT && p.dataUAT.trim() !== '');
        const hasBS  = this.data.some(p => p.dataBS  && p.dataBS.trim()  !== '');
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
        </div>
        `;

        html += '</div>';
        container.innerHTML = html;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const milestones = [
            { key: 'dataIA',   label: '🤖 Consegna IA',         badge: 'bg-info text-dark' },
            { key: 'devStart', label: '▶️ Inizio Sviluppo',      badge: 'bg-primary' },
            { key: 'devEnd',   label: '⏹️ Fine Sviluppo',        badge: 'bg-secondary' },
            { key: 'dataUAT',  label: '👥 UAT',                  badge: 'bg-info' },
            { key: 'dataBS',   label: '💼 Business Simulation',  badge: 'bg-dark' },
            { key: 'dataTest', label: '🧪 Rilascio Test',        badge: 'bg-warning text-dark' },
            { key: 'dataProd', label: '🚀 Rilascio Prod',        badge: 'bg-success' }
        ];

        const events = [];
        this.data.forEach(p => {
            milestones.forEach(m => {
                const dateVal = p[m.key];
                if (dateVal && dateVal.trim() !== '') {
                    events.push({
                        date: dayjs(dateVal),
                        sortKey: dateVal,
                        nome: p.nome,
                        label: m.label,
                        badge: m.badge
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
                            ${sortedEvents.map(ev => `
                                <div class="cal-event-item d-flex align-items-start gap-2 mb-2">
                                    <span class="cal-event-date">${ev.date.format('DD/MM')}</span>
                                    <div>
                                        <span class="badge ${ev.badge} me-1">${ev.label}</span>
                                        <span class="small">${ev.nome}</span>
                                    </div>
                                </div>
                            `).join('')}
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
