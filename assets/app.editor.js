// app.editor.js — Modal editor, Jira, milestone personalizzate, save/open/delete
Object.assign(app, {

    // ─── CUSTOM MILESTONES ───────────────────────────────────────────────────

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
            .map(row => ({
                label: row.querySelector('.custom-ms-label').value.trim(),
                date:  row.querySelector('.custom-ms-date').value
            }))
            .filter(m => m.label && m.date);
    },

    // ─── JIRA LINKS ─────────────────────────────────────────────────────────

    renderJiraFields: function(links) {
        const container = document.getElementById('jiraLinksContainer');
        container.innerHTML = '';
        (links && links.length > 0 ? links : ['']).forEach((url, i) => this._appendDynamicField('jira', url, null, i));
        this._refreshDynamicBtn('jira');
    },

    addJiraField: function() {
        const count = document.getElementById('jiraLinksContainer').querySelectorAll('.jira-link-input').length;
        if (count >= this.MAX_JIRA_LINKS) return;
        this._appendDynamicField('jira', '', null, count);
        this._refreshDynamicBtn('jira');
    },

    removeJiraField: function(btn) {
        btn.closest('[data-jira-index]').remove();
        this._refreshDynamicBtn('jira');
    },

    _getJiraLinksFromModal: function() {
        return Array.from(document.querySelectorAll('.jira-link-input'))
            .map(el => el.value.trim()).filter(Boolean);
    },

    // ─── CAMPO DINAMICO UNIFICATO (Jira + Milestone) ─────────────────────────

    _appendDynamicField: function(type, label, date, index) {
        const isMilestone = type === 'milestone';
        const container   = document.getElementById(isMilestone ? 'customMilestonesContainer' : 'jiraLinksContainer');
        const wrap = document.createElement('div');
        const safeLabel = (label || '').replace(/"/g, '&quot;');

        if (isMilestone) {
            wrap.className = 'd-flex align-items-center gap-2 mb-2 custom-milestone-row';
            wrap.dataset.milestoneIndex = index;
            wrap.innerHTML = `
                <input type="text"  class="form-control form-control-sm custom-ms-label" placeholder="Nome (es: Creare Story)" value="${safeLabel}">
                <input type="date"  class="form-control form-control-sm custom-ms-date" value="${date || ''}">
                <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeCustomMilestone(this)" title="Rimuovi">&times;</button>`;
        } else {
            wrap.className = 'd-flex align-items-center gap-2 mb-2';
            wrap.dataset.jiraIndex = index;
            wrap.innerHTML = `
                <input type="url" class="form-control jira-link-input" placeholder="https://..." value="${safeLabel}">
                <button type="button" class="btn btn-outline-danger btn-sm flex-shrink-0" onclick="app.removeJiraField(this)" title="Rimuovi">&times;</button>`;
        }
        container.appendChild(wrap);
    },

    _refreshDynamicBtn: function(type) {
        const isMilestone = type === 'milestone';
        const container   = document.getElementById(isMilestone ? 'customMilestonesContainer' : 'jiraLinksContainer');
        const btn = isMilestone
            ? document.querySelector('button[onclick="app.addCustomMilestone()"]')
            : document.getElementById('addJiraBtn');
        const selector = isMilestone ? '.custom-milestone-row' : '.jira-link-input';
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
        if (!jiraLinks || jiraLinks.length === 0) return '';
        return jiraLinks
            .filter(u => u && u.trim())
            .map(u => `<a href="${u}" target="_blank" class="badge bg-primary text-decoration-none me-1 mb-1" title="${u}">${this.jiraLabel(u)} 🔗</a>`)
            .join('');
    },

    // ─── CALCOLO COSTO ───────────────────────────────────────────────────────

    calcCosto: function() {
        const ggu = parseFloat(this._getVal('p_stimaGgu'));
        const rc  = parseFloat(this._getVal('p_rcFornitore'));
        this._setVal('p_stimaCosto',
            (!isNaN(ggu) && !isNaN(rc) && ggu >= 0 && rc >= 0)
                ? '€ ' + (ggu * rc).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : ''
        );
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
            [dates.stima,    dates.devStart, 'Stima non può essere successiva a Dev Start'],
            [dates.devStart, dates.devEnd,   'Dev Start non può essere successivo a Dev End'],
            [dates.devEnd,   dates.test,     'Dev End non può essere successivo al Test'],
            [dates.test,     dates.prod,     'Il Test non può essere successivo a Prod']
        ];
        for (const [a, b, msg] of dateChecks) {
            if (a && b && a > b) {
                document.getElementById('dateValidationMsg').innerText = `ERRORE: ${msg}`;
                return;
            }
        }
        document.getElementById('dateValidationMsg').innerText = '';

        const stimaGgu    = parseFloat(this._getVal('p_stimaGgu'));
        const rcFornitore = parseFloat(this._getVal('p_rcFornitore'));
        const progressRaw = parseInt(this._getVal('p_progress'), 10);
        const progress    = (!isNaN(progressRaw) && progressRaw >= 0 && progressRaw <= 100) ? progressRaw : null;

        const id        = this._getVal('p_id');
        const fornitori = this._getVal('p_fornitori').split(',').map(s => s.trim()).filter(Boolean);
        const owners    = this._getVal('p_owners').split(',').map(s => s.trim()).filter(Boolean);

        const newProj = {
            id:                id || Date.now().toString(),
            nome:              this._getVal('p_nome'),
            fornitori, owners,
            progress,
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
                if (old.hidden)                   newProj.hidden     = true;
                if (old.ganttOrder !== undefined)  newProj.ganttOrder = old.ganttOrder;
                this.data[idx] = newProj;
            }
        } else {
            newProj.ganttOrder = this.getProjectsOnly().length;
            this.data.push(newProj);
        }
        await this.syncToGithub();
        this.editorModal.hide();
    },

    // ─── OPEN / DELETE / TOGGLE ──────────────────────────────────────────────

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
                p_owners: this.csvToArray(p.owners || p.owner).join(', '),
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
            const links = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            this.renderJiraFields(links);
            this.renderCustomMilestoneFields(p.customMilestones || []);
        } else {
            this._setVal('p_id', '');
            this.renderJiraFields([]);
            this.renderCustomMilestoneFields([]);
        }
        this.editorModal.show();
    },

    deleteProject: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (p && this.isMeta(p)) return;
        if (confirm('Sei sicuro di voler eliminare questo progetto?')) {
            this.data = this.data.filter(x => x.id !== id);
            await this.syncToGithub();
        }
    },

    toggleHidden: async function(id) {
        const p = this.data.find(x => x.id === id);
        if (!p || this.isMeta(p)) return;
        p.hidden = !p.hidden;
        if (!p.hidden && this.isAutoStale(p))
            this.showAlert('Progetto ripristinato, ma è vecchio di 1 mese. Rimuovi o modifica la data di Prod per renderlo visibile senza la spunta.', 'warning', 6000);
        await this.syncToGithub();
    }

});
