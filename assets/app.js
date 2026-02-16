const app = {
    data: [],
    config: {
        owner: '',
        repo: '',
        token: '',
        path: 'data/projects.json'
    },
    sha: null,
    gantt: null,
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

        const tasks = this.data.map(p => ({
            id: p.id,
            name: p.nome,
            start: p.devStart,
            end: p.devEnd,
            progress: 100,
            dependencies: ""
        }));

        if (tasks.length > 0) {
            try {
                this.gantt = new Gantt("#gantt-chart", tasks, {
                    view_mode: 'Month',
                    language: 'it',
                    date_format: 'YYYY-MM-DD',
                    bar_height: 30,
                    padding: 18
                });
            } catch(e) {
                container.innerHTML = `<p class='text-center p-3 text-danger'>Errore rendering Gantt: ${e.message}</p>`;
            }
        } else {
            container.innerHTML = "<p class='text-center p-3'>Nessun dato per il Gantt</p>";
        }
    },

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;

        const groups = {};
        this.data.forEach(p => {
            if (p.dataProd) {
                const m = dayjs(p.dataProd).format('MMMM YYYY');
                if(!groups[m]) groups[m] = [];
                groups[m].push(p);
            }
        });

        container.innerHTML = Object.keys(groups).sort().map(month => `
            <div class="col-md-4 mb-4">
                <div class="card cal-month-card shadow-sm h-100">
                    <div class="card-header bg-white fw-bold text-uppercase text-primary">${month}</div>
                    <div class="card-body">
                        ${groups[month].map(p => `
                            <div class="cal-event-item">
                                <span class="cal-event-date">${dayjs(p.dataProd).format('DD/MM')}</span>
                                <span>${p.nome}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
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
