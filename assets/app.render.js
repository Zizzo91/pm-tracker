// app.render.js — Render tabella, Gantt, drag & drop
Object.assign(app, {

    // ─── RENDER TABLE ────────────────────────────────────────────────────────

    renderTable: function() {
        const tbody      = document.getElementById('projectsTableBody');
        const search     = this._getVal('searchInput').toLowerCase();
        const filtForn   = this._getVal('tableFornitoreFilter');
        const filtOwn    = this._getVal('tableOwnerFilter');
        const sortMode   = this._getVal('tableSortSelect') || 'prod_inprogress_first';
        const showHidden = this._getChecked('globalShowHidden');
        const today = new Date(); today.setHours(0, 0, 0, 0);

        let filtered = this.getProjectsOnly().filter(p =>
            (showHidden || !this.isHiddenForUI(p)) &&
            (p.nome || '').toLowerCase().includes(search) &&
            (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
            (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
        );
        filtered = this._sortGantt(filtered, sortMode);

        tbody.innerHTML = filtered.map(p => {
            const isPast    = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale = this.isAutoStale(p);
            const isHidden  = this.isHiddenForUI(p);
            const rowCls    = isHidden ? 'class="table-warning opacity-75"' : isPast ? 'class="table-secondary opacity-75"' : '';

            const fornBadge = (p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'badge me-1 mb-1')).join('');
            const ownBadge  = (p.owners    || []).map(o => this._badgeSpan('owner',    o, 'badge me-1 mb-1')).join('');

            const progressHtml = (p.progress != null)
                ? `<div class="progress mt-1" style="height:6px;min-width:80px;" title="Avanzamento: ${p.progress}%">
                     <div class="progress-bar ${p.progress >= 100 ? 'bg-success' : 'bg-primary'}" style="width:${p.progress}%"></div>
                   </div>
                   <div class="text-muted" style="font-size:0.7rem;">${p.progress}%</div>`
                : '';

            const extraRows = [
                p.stimaGgu   != null ? `<span class="badge bg-info text-dark me-1">⏱️ ${p.stimaGgu} gg/u</span>` : '',
                p.stimaCosto != null ? `<span class="badge bg-warning text-dark me-1">💰 € ${p.stimaCosto.toLocaleString('it-IT', {minimumFractionDigits:2, maximumFractionDigits:2})}</span>` : ''
            ].filter(Boolean);

            const links    = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            const jiraHtml = this.jiraLinksHtml(links);

            const statusBadge = p.hidden   ? '<span class="badge bg-dark ms-1">🚫 Archiviato</span>'
                              : autoStale  ? '<span class="badge bg-secondary ms-1">🕐 Auto-archiviato</span>'
                              : isPast     ? '<span class="badge bg-success ms-1">✅ Rilasciato</span>'
                              : '';

            return `
            <tr ${rowCls}>
                <td>
                    <strong>${p.nome || 'Senza nome'}</strong> ${statusBadge}
                    ${jiraHtml  ? `<div class="mt-1">${jiraHtml}</div>` : ''}
                    ${extraRows.length ? `<div class="mt-1">${extraRows.join('')}</div>` : ''}
                </td>
                <td><div class="d-flex flex-wrap">${fornBadge}</div>${ownBadge ? `<div class="mt-1 d-flex flex-wrap">${ownBadge}</div>` : ''}</td>
                <td>${progressHtml}</td>
                <td class="text-muted small">${this.formatDate(p.dataStima)}</td>
                <td class="text-muted small">${this.formatDate(p.dataIA)}</td>
                <td class="small">${this.formatDate(p.devStart)} ➠ ${this.formatDate(p.devEnd)}</td>
                <td class="text-warning small fw-bold">${this.formatDate(p.dataTest)}</td>
                <td class="text-success small fw-bold">${this.formatDate(p.dataProd)}</td>
                <td class="small text-muted" style="max-width:250px;white-space:pre-wrap;">${p.note || ''}</td>
                <td>
                    <button class="btn btn-sm ${p.hidden ? 'btn-secondary' : 'btn-outline-secondary'} mb-1" onclick="app.toggleHidden('${p.id}')" title="${p.hidden ? 'Ripristina Progetto' : 'Archivia (Nascondi)'}">${p.hidden ? '👁️' : '🚫'}</button>
                    <button class="btn btn-sm btn-outline-primary mb-1"  onclick="app.openModal('${p.id}')"    title="Modifica">✏️</button>
                    <button class="btn btn-sm btn-outline-danger mb-1"   onclick="app.deleteProject('${p.id}')" title="Elimina">🗑️</button>
                </td>
            </tr>`;
        }).join('');
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
        await this.syncToGithub();
    },

    // ─── RENDER GANTT ────────────────────────────────────────────────────────

    renderGantt: function() {
        const container = document.getElementById('gantt-chart');
        if (!container) return;
        const filtForn   = this._getVal('ganttFornitoreFilter');
        const filtOwn    = this._getVal('ganttOwnerFilter');
        const sortMode   = this._getVal('ganttSortSelect') || 'prod_inprogress_first';
        const showHidden = this._getChecked('globalShowHidden');

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

        let html = '<div class="gantt-custom"><div class="gantt-header"><div class="gantt-project-col">Progetto</div><div class="gantt-timeline-col"><div class="gantt-months">';
        let cur = new Date(minDate);
        while (cur <= maxDate) {
            const days = new Date(cur.getFullYear(), cur.getMonth() + 1, 0).getDate();
            html += `<div class="gantt-month" style="width:${((days/totalDays)*100).toFixed(2)}%">${dayjs(cur).format('MMM YYYY')}</div>`;
            cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
        }
        html += '</div></div></div><div class="gantt-body">';

        const today = new Date(); today.setHours(0, 0, 0, 0);
        const isCustomSort = sortMode === 'custom';

        data.forEach(p => {
            const startD = p.devStart || p.dataTest || p.dataProd || p.dataIA;
            const endD   = p.devEnd   || startD;
            const leftPct  = startD ? pct(startD) : 0;
            const widthPct = (startD && endD) ? Math.max(pct(endD) - leftPct, 0.5) : 0;
            const barOpacity = (p.devStart && p.devEnd) ? 1 : 0.2;

            const badgesHtml = [
                ...(p.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge mb-1')),
                ...(p.owners    || []).map(o => this._badgeSpan('owner',    o, 'gantt-supplier-badge mb-1'))
            ].join('');
            const ganttJiraLinks = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);
            const ganttJiraHtml  = this.jiraLinksHtml(ganttJiraLinks);
            const isPast    = p.dataProd && new Date(p.dataProd) <= today;
            const autoStale = this.isAutoStale(p);
            const isHidden  = this.isHiddenForUI(p);

            let rowCls = isPast ? ' gantt-row--released' : '';
            if (isHidden) rowCls += ' opacity-50';

            const statusIcon = p.hidden   ? '<span class="badge bg-dark ms-1">🚫</span>'
                             : autoStale  ? '<span class="badge bg-secondary ms-1" title="Auto-archiviato">🕐</span>'
                             : '';

            const ganttProgressHtml = (p.progress != null)
                ? `<div class="progress mt-1" style="height:4px;" title="Avanzamento: ${p.progress}%">
                     <div class="progress-bar ${p.progress >= 100 ? 'bg-success' : 'bg-primary'}" style="width:${p.progress}%"></div>
                   </div>`
                : '';

            let allMilestones = [
                { date: p.dataIA,            cls: 'ms-ia',         icon: '🤖', label: 'Consegna IA'           },
                { date: p.devStart,          cls: 'ms-dev-start',  icon: '▶️', label: 'Inizio Sviluppo'       },
                { date: p.devEnd,            cls: 'ms-dev-end',    icon: '⏹️', label: 'Fine Sviluppo'         },
                { date: p.dataUAT,           cls: 'ms-uat',        icon: '👥', label: 'UAT'                   },
                { date: p.dataBS,            cls: 'ms-bs',         icon: '💼', label: 'Business Simulation'   },
                { date: p.dataTest,          cls: 'ms-test',       icon: '🧪', label: 'Rilascio Test'         },
                { date: p.dataProd,          cls: 'ms-prod',       icon: '🚀', label: 'Rilascio Prod'         },
                { date: p.dataScadenzaStima, cls: 'ms-scad-stima', icon: '📥', label: 'Scad. Stima Fornitore' },
                { date: p.dataConfigSistema, cls: 'ms-config-sis', icon: '🔧', label: 'Config Sistema'        }
            ];
            (p.customMilestones || []).forEach(cm => allMilestones.push({ date: cm.date, cls: 'ms-custom', icon: '⭐', label: cm.label }));
            allMilestones = allMilestones.filter(m => m.date && m.date.trim() !== '');

            const dateGroups = {};
            allMilestones.forEach(m => { (dateGroups[m.date] = dateGroups[m.date] || []).push(m); });
            allMilestones.forEach(m => { m.offsetPx = (dateGroups[m.date].indexOf(m) - (dateGroups[m.date].length - 1) / 2) * 20; });

            const milestonesHtml = allMilestones.map(m => {
                const isCustom   = m.cls === 'ms-custom';
                const translateX = (-16 + m.offsetPx).toFixed(0);
                return `<div class="gantt-milestone ${m.cls}" style="left:${pct(m.date).toFixed(2)}%;transform:translateX(${translateX}px);" title="${m.label}: ${dayjs(m.date).format('DD/MM/YYYY')}">
                    <span class="ms-date"${isCustom ? ' style="color:#198754;"' : ''}>${dayjs(m.date).format('DD/MM')}</span>
                    <span class="ms-icon">${m.icon}</span>
                    <span class="ms-line"${isCustom ? ' style="background:#198754;"' : ''}></span>
                </div>`;
            }).join('');

            const pColors = this._projectColors(p.nome);
            let rowAttr = '', dragHandleHtml = '';
            if (isCustomSort) {
                rowCls += ' draggable';
                rowAttr = `draggable="true" ondragstart="app.handleDragStart(event,'${p.id}')" ondragover="app.handleDragOver(event)" ondrop="app.handleDrop(event,'${p.id}')" ondragenter="app.handleDragEnter(event)" ondragleave="app.handleDragLeave(event)" ondragend="app.handleDragEnd(event)"`;
                dragHandleHtml = '<div class="drag-handle" title="Trascina per riordinare">☰</div>';
            }

            html += `
            <div class="gantt-row${rowCls}" ${rowAttr} style="background-color:${pColors.bg};border-left:4px solid ${pColors.border};margin-bottom:4px;border-radius:4px;">
                <div class="gantt-project-col">
                    ${dragHandleHtml}
                    <div>
                        <strong>${p.nome} ${statusIcon}</strong>
                        ${ganttProgressHtml}
                        <div class="gantt-supplier-list">${badgesHtml}</div>
                        ${ganttJiraHtml ? `<div class="mt-1">${ganttJiraHtml}</div>` : ''}
                    </div>
                </div>
                <div class="gantt-timeline-col" style="position:relative;">
                    <div class="gantt-bar" style="left:${leftPct.toFixed(2)}%;width:${widthPct.toFixed(2)}%;opacity:${barOpacity};background-color:${pColors.barBg};border:1px solid ${pColors.barBorder};box-shadow:none;" title="Sviluppo: ${dayjs(startD).format('DD/MM/YYYY')} - ${dayjs(endD).format('DD/MM/YYYY')}">
                        <span style="color:#212529;">⚙️ Sviluppo</span>
                    </div>
                    ${milestonesHtml}
                    <div class="gantt-today-line" style="position:absolute;top:0;bottom:0;left:${pct(today).toFixed(2)}%;width:2px;background:rgba(220,53,69,0.65);pointer-events:none;z-index:5;" title="Oggi: ${dayjs(today).format('DD/MM/YYYY')}"></div>
                </div>
            </div>`;
        });

        const has = key => data.some(p => p[key] && p[key].trim && p[key].trim() !== '');
        const hasCustom = data.some(p => p.customMilestones && p.customMilestones.length > 0);
        html += `
        <div class="gantt-legend">
            <div class="gantt-legend-item"><span class="legend-bar"></span> Fase di Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">🤖</span> Consegna IA</div>
            <div class="gantt-legend-item"><span class="legend-ms">▶️</span> Inizio Sviluppo</div>
            <div class="gantt-legend-item"><span class="legend-ms">⏹️</span> Fine Sviluppo</div>
            ${has('dataUAT')           ? '<div class="gantt-legend-item"><span class="legend-ms">👥</span> UAT</div>' : ''}
            ${has('dataBS')            ? '<div class="gantt-legend-item"><span class="legend-ms">💼</span> Business Simulation</div>' : ''}
            <div class="gantt-legend-item"><span class="legend-ms">🧪</span> Rilascio Test</div>
            <div class="gantt-legend-item"><span class="legend-ms">🚀</span> Rilascio Prod</div>
            ${has('dataScadenzaStima') ? '<div class="gantt-legend-item"><span class="legend-ms">📥</span> Scad. Stima Fornitore</div>' : ''}
            ${has('dataConfigSistema') ? '<div class="gantt-legend-item"><span class="legend-ms">🔧</span> Config Sistema</div>' : ''}
            ${hasCustom               ? '<div class="gantt-legend-item"><span class="legend-ms" style="color:#198754">⭐</span> Milestone Personalizzate</div>' : ''}
        </div></div>`;
        container.innerHTML = html;
    }

});
