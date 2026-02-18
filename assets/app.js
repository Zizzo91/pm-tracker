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
            stima: document.getElementById('p_stima').value,
            ia: document.getElementById('p_ia').value,
            devStart: document.getElementById('p_devStart').value,
            devEnd: document.getElementById('p_devEnd').value,
            test: document.getElementById('p_test').value,
            prod: document.getElementById('p_prod').value
        };

        if (dates.stima > dates.ia || dates.ia > dates.devStart || 
            dates.devStart > dates.devEnd || dates.devEnd > dates.test || 
            dates.test > dates.prod) {
            document.getElementById('dateValidationMsg').innerText = "ERRORE: La sequenza temporale non è rispettata! (Stima < IA < Dev < Test < Prod)";
            return;
        }

        const id = document.getElementById('p_id').value;
        const newProj = {
            id: id || Date.now().toString(),
            nome: document.getElementById('p_nome').value,
            fornitori: document.getElementById('p_fornitori').value.split(',').map(s => s.trim()),
            dataStima: dates.stima,
            dataIA: dates.ia,
            devStart: dates.devStart,
            devEnd: dates.devEnd,
            dataTest: dates.test,
            dataProd: dates.prod,
            jira: document.getElementById('p_jira').value
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
            document.getElementById('p_id').value = p.id;
            document.getElementById('p_nome').value = p.nome;
            document.getElementById('p_fornitori').value = p.fornitori.join(', ');
            document.getElementById('p_stima').value = p.dataStima;
            document.getElementById('p_ia').value = p.dataIA;
            document.getElementById('p_devStart').value = p.devStart;
            document.getElementById('p_devEnd').value = p.devEnd;
            document.getElementById('p_test').value = p.dataTest;
            document.getElementById('p_prod').value = p.dataProd;
            document.getElementById('p_jira').value = p.jira;
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

        let minDate = null, maxDate = null;
        this.data.forEach(p => {
            const start = new Date(p.devStart);
            const end = new Date(p.devEnd);
            if (!minDate || start < minDate) minDate = start;
            if (!maxDate || end > maxDate) maxDate = end;
        });

        minDate = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
        maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth() + 1, 0);

        const totalDays = Math.ceil((maxDate - minDate) / (1000 * 60 * 60 * 24));
        
        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        
        let currentMonth = new Date(minDate);
        while (currentMonth <= maxDate) {
            const monthName = dayjs(currentMonth).format('MMM YYYY');
            const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
            const widthPercent = (daysInMonth / totalDays) * 100;
            html += `<div class="gantt-month" style="width: ${widthPercent}%">${monthName}</div>`;
            currentMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
        }
        html += '</div></div></div>';

        html += '<div class="gantt-body">';
        this.data.forEach(p => {
            const start = new Date(p.devStart);
            const end = new Date(p.devEnd);
            const daysFromStart = Math.ceil((start - minDate) / (1000 * 60 * 60 * 24));
            const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            
            const leftPercent = (daysFromStart / totalDays) * 100;
            const widthPercent = (duration / totalDays) * 100;

            html += `
                <div class="gantt-row">
                    <div class="gantt-project-col">
                        <strong>${p.nome}</strong><br>
                        <small class="text-muted">${dayjs(start).format('DD/MM')} - ${dayjs(end).format('DD/MM')}</small>
                    </div>
                    <div class="gantt-timeline-col">
                        <div class="gantt-bar" style="left: ${leftPercent}%; width: ${widthPercent}%;" title="${p.nome}: ${dayjs(start).format('DD/MM/YYYY')} - ${dayjs(end).format('DD/MM/YYYY')}">
                            <span>${p.nome}</span>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div></div>';
        
        container.innerHTML = html;
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        // Definizione milestone da mostrare: { campo, etichetta, classe badge Bootstrap }
        const milestones = [
            { key: 'dataIA',   label: '🤖 Consegna IA',    badge: 'bg-info text-dark' },
            { key: 'devStart', label: '🚀 Inizio Sviluppo', badge: 'bg-primary' },
            { key: 'devEnd',   label: '🏁 Fine Sviluppo',   badge: 'bg-secondary' },
            { key: 'dataTest', label: '🧪 Rilascio Test',   badge: 'bg-warning text-dark' },
            { key: 'dataProd', label: '✅ Rilascio Prod',   badge: 'bg-success' }
        ];

        // Costruisce un array piatto di eventi {date, sortKey, nome, label, badge}
        const events = [];
        this.data.forEach(p => {
            milestones.forEach(m => {
                const dateVal = p[m.key];
                if (dateVal) {
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

        // Raggruppa per mese (chiave: 'YYYY-MM' per ordinamento corretto)
        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });

        // Ordina i mesi e gli eventi interni per data
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
