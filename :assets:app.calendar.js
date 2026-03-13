// app.calendar.js — Calendario rilasci, event card, preferenze visibilità
Object.assign(app, {

    // ─── HELPERS CALENDARIO ──────────────────────────────────────────────────

    _calIsPast: function(dateStr, milestoneKey) {
        if (!dateStr) return false;
        const today = new Date(); today.setHours(0, 0, 0, 0);
        if ((this.ALWAYS_HIGHLIGHT_KEYS || []).includes(milestoneKey)) return false;
        return new Date(dateStr) < today;
    },

    setEventPref: async function(key, pref) {
        const meta = this.getMeta();
        if (pref === 'show') delete meta.eventPrefs[key];
        else meta.eventPrefs[key] = pref;
        this.renderCalendar();
        await this.syncToGithub();
    },

    // ─── EVENT CARD ──────────────────────────────────────────────────────────

    _renderEventCard: function(ev, todayStr, compact) {
        const fb = (ev.fornitori || []).map(f => this._badgeSpan('supplier', f, 'gantt-supplier-badge me-1 mb-1')).join('');
        const ob = (ev.owners    || []).map(o => this._badgeSpan('owner',    o, 'gantt-supplier-badge me-1 mb-1')).join('');
        const calJiraHtml  = (!ev.reminder && ev.jiraLinks && ev.jiraLinks.length > 0) ? this.jiraLinksHtml(ev.jiraLinks) : '';
        const isReminder   = !!ev.reminder;
        const isPastGray   = !!ev.pastGray && !isReminder;
        const isUserGray   = !!ev.userGray;
        const isHiddenPref = !!ev.isHiddenPref;
        const isToday      = ev.date.format('YYYY-MM-DD') === todayStr;
        const isExpiredRem = isReminder && !ev.done && ev.date.format('YYYY-MM-DD') < todayStr;

        const opacityCls = isHiddenPref ? 'opacity-25' : ev.hidden ? 'opacity-50' : (isPastGray || isUserGray) ? 'opacity-75 cal-event--past' : '';
        const titleCls   = (isReminder && ev.done) ? 'text-decoration-line-through' : ((isPastGray || isUserGray || isHiddenPref) ? 'text-muted' : '');

        let borderCls = 'border shadow-sm', bgCls = '', customStyle = '';
        if (isReminder) {
            bgCls     = isExpiredRem ? 'bg-danger bg-opacity-10' : 'bg-warning bg-opacity-10';
            borderCls = isExpiredRem ? 'border border-danger border-opacity-75 shadow-sm' : 'border border-warning border-opacity-50 shadow-sm';
        } else {
            const pColors = this._projectColors(ev.nome);
            customStyle = `background-color:${pColors.bg};border-left:4px solid ${pColors.border} !important;border-top:1px solid rgba(0,0,0,0.05);border-right:1px solid rgba(0,0,0,0.05);border-bottom:1px solid rgba(0,0,0,0.05);`;
        }
        if (isToday) {
            borderCls    = 'border border-danger border-2 shadow';
            customStyle += isReminder ? '' : ' border-color:#dc3545 !important; border-left:4px solid #dc3545 !important;';
            if (isReminder) bgCls = 'bg-warning bg-opacity-25';
        }

        const statusIcon = ev.autoStale ? '<span title="Auto-archiviato">🕐</span>'
                         : (isReminder && ev.done) ? '<span title="Completato">✅</span>' : '';

        const doneAtHtml = (isReminder && ev.done && ev.doneAt)
            ? `<div class="text-muted mt-1" style="font-size:0.72rem;">✅ Completato il ${this._formatDoneAt(ev.doneAt)}</div>` : '';

        const reminderMenuItems = isReminder ? `
            <li><a class="dropdown-item py-2 ${ev.done ? 'text-secondary' : 'text-success fw-semibold'}" href="#" onclick="app.toggleReminderDone('${ev.reminderId}');return false;">${ev.done ? '↩️ Riapri' : '✅ Segna come fatto'}</a></li>
            <li><a class="dropdown-item py-2" href="#" onclick="app.editReminder('${ev.reminderId}');return false;">✏️ Modifica</a></li>
            <li><a class="dropdown-item py-2 text-danger" href="#" onclick="app.deleteReminder('${ev.reminderId}');return false;">🗑️ Elimina</a></li>
            <li><hr class="dropdown-divider"></li>` : '';

        const visMenuItems = `
            ${ev.pref !== 'hide' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','hide');return false;">🚫 Nascondi</a></li>` : ''}
            ${ev.pref !== 'gray' ? `<li><a class="dropdown-item py-2" href="#" onclick="app.setEventPref('${ev.prefKey}','gray');return false;">🌫️ Ingrigisci</a></li>` : ''}
            ${ev.pref ? `<li><hr class="dropdown-divider"></li><li><a class="dropdown-item py-2 text-success" href="#" onclick="app.setEventPref('${ev.prefKey}','show');return false;">👁️ Mostra Normale</a></li>` : ''}`;

        if (compact) {
            return `
            <div class="cal-event-item d-flex align-items-start gap-2 p-2 rounded mb-2 ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle}font-size:0.85rem;">
                <div class="flex-grow-1 min-w-0">
                    <div class="d-flex align-items-center flex-wrap gap-1 mb-1">
                        <span class="badge ${ev.badge} me-1" style="font-size:0.7rem;">${ev.label}</span>
                        <span class="text-muted" style="font-size:0.75rem;">${ev.date.format('DD/MM')}</span>
                        ${isExpiredRem ? '<span class="badge bg-danger ms-1 small">Scaduto</span>' : ''}
                        ${isHiddenPref ? '<span class="badge bg-dark" style="font-size:0.65rem;">Nascosto</span>' : ''}
                        ${isUserGray   ? '<span class="badge bg-secondary" style="font-size:0.65rem;">Ingrigito</span>' : ''}
                    </div>
                    <div class="fw-semibold ${titleCls}" style="font-size:0.85rem;word-break:break-word;">${ev.nome} ${statusIcon}</div>
                    ${doneAtHtml}
                    ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                    ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                    ${fb || ob ? `<div class="mt-1 d-flex flex-wrap">${fb}${ob}</div>` : ''}
                </div>
                <div class="dropdown flex-shrink-0">
                    <button class="btn btn-sm btn-light text-secondary border-0 p-0 px-1" type="button" data-bs-toggle="dropdown" style="line-height:1;"><strong>⋮</strong></button>
                    <ul class="dropdown-menu dropdown-menu-end shadow-sm small">${reminderMenuItems}${visMenuItems}</ul>
                </div>
            </div>`;
        }

        return `
        <div class="cal-event-item d-flex align-items-start gap-3 p-3 rounded ${opacityCls} ${borderCls} ${bgCls}" style="${customStyle}">
            <div class="cal-event-date text-center" style="min-width:50px;">
                <div class="fw-bold fs-5 ${isToday ? 'text-danger' : (isPastGray||isUserGray||isHiddenPref ? 'text-muted' : isReminder ? 'text-warning text-dark' : 'text-primary')}">${ev.date.format('DD')}</div>
                <div class="small text-uppercase ${isToday ? 'text-danger fw-bold' : (isReminder&&!isPastGray&&!isUserGray ? 'text-warning text-dark' : 'text-muted')}">${ev.date.format('MMM')}</div>
            </div>
            <div class="flex-grow-1">
                <div class="d-flex align-items-center flex-wrap gap-2 mb-1">
                    <span class="badge ${ev.badge}">${ev.label}</span>
                    ${isToday      ? '<span class="badge bg-danger">OGGI</span>' : ''}
                    ${isHiddenPref ? '<span class="badge bg-dark">Nascosto</span>' : ''}
                    ${isUserGray   ? '<span class="badge bg-secondary">Ingrigito</span>' : ''}
                </div>
                <div class="fw-semibold fs-6 ${titleCls}">${ev.nome} ${statusIcon}</div>
                ${doneAtHtml}
                ${ev.note ? `<div class="small text-muted mt-1 border-start border-warning border-2 ps-2 ms-1">${(ev.note||'').replace(/</g,'&lt;')}</div>` : ''}
                ${calJiraHtml ? `<div class="mt-1">${calJiraHtml}</div>` : ''}
                ${fb || ob ? `<div class="mt-2 d-flex flex-wrap">${fb}${ob}</div>` : ''}
            </div>
            <div class="dropdown flex-shrink-0 ms-2">
                <button class="btn btn-sm btn-light text-secondary border-0 p-1 px-2" type="button" data-bs-toggle="dropdown" title="Opzioni" style="line-height:1;"><strong>⋮</strong></button>
                <ul class="dropdown-menu dropdown-menu-end shadow-sm small">${reminderMenuItems}${visMenuItems}</ul>
            </div>
        </div>`;
    },

    // ─── RENDER CALENDAR ─────────────────────────────────────────────────────

    renderCalendar: function() {
        const container = document.getElementById('calendarContainer');
        if (!container) return;
        const filtForn   = this._getVal('calendarFornitoreFilter');
        const filtOwn    = this._getVal('calendarOwnerFilter');
        const filtMile   = this._getVal('calendarMilestoneFilter');
        const showHidden = this._getChecked('globalShowHidden');
        const calShowHiddenPrefs = this._getChecked('calShowHiddenPrefs');

        const showProjectMilestones = filtMile !== 'reminders';
        const showCustomMilestones  = filtMile === '' || filtMile === 'custom';
        const showReminders         = filtMile === '' || filtMile === 'reminders';
        const milestonesToUse = (filtMile && !['custom', 'reminders'].includes(filtMile))
            ? this.MILESTONES.filter(m => m.key === filtMile)
            : this.MILESTONES;

        const events   = [];
        const meta     = this.getMeta();
        const prefs    = meta.eventPrefs || {};
        const todayStr = dayjs().format('YYYY-MM-DD');

        if (showProjectMilestones) {
            this.getProjectsOnly()
                .filter(p =>
                    (showHidden || !this.isHiddenForUI(p)) &&
                    (!filtForn || (p.fornitori && p.fornitori.includes(filtForn))) &&
                    (!filtOwn  || (p.owners    && p.owners.includes(filtOwn)))
                )
                .forEach(p => {
                    const isHidden   = this.isHiddenForUI(p);
                    const autoStale  = this.isAutoStale(p);
                    const pJiraLinks = (p.jiraLinks && p.jiraLinks.length > 0) ? p.jiraLinks : (p.jira ? [p.jira] : []);

                    milestonesToUse.forEach(m => {
                        const v = p[m.key];
                        if (!v || v.trim() === '') return;
                        const prefKey = `ms_${p.id}_${m.key}`;
                        const pref    = prefs[prefKey];
                        if (pref === 'hide' && !calShowHiddenPrefs) return;
                        const pastGray = this._calIsPast(v, m.key);
                        events.push({
                            date: dayjs(v), sortKey: v, nome: p.nome,
                            fornitori: p.fornitori || [], owners: p.owners || [], jiraLinks: pJiraLinks,
                            label: m.label,
                            badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : m.badge,
                            pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                            prefKey, pref, milestoneKey: m.key, autoStale, hidden: isHidden
                        });
                    });

                    if (showCustomMilestones) {
                        (p.customMilestones || []).forEach(cm => {
                            if (!cm.date || cm.date.trim() === '') return;
                            const prefKey = `custom_${p.id}_${this._hashString(cm.label)}`;
                            const pref    = prefs[prefKey];
                            if (pref === 'hide' && !calShowHiddenPrefs) return;
                            const pastGray = this._calIsPast(cm.date, 'custom');
                            events.push({
                                date: dayjs(cm.date), sortKey: cm.date, nome: p.nome,
                                fornitori: p.fornitori || [], owners: p.owners || [], jiraLinks: pJiraLinks,
                                label: `⭐ ${cm.label}`,
                                badge: (pastGray || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : 'bg-success',
                                pastGray, userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                                prefKey, pref, milestoneKey: 'custom', autoStale, hidden: isHidden
                            });
                        });
                    }
                });
        }

        if (showReminders) {
            const showDone = this._getChecked('rem_show_done');
            (meta.manualReminders || [])
                .filter(r => r && r.date && r.title && (showDone || !r.done))
                .forEach(r => {
                    const prefKey = `rem_${r.id}`;
                    const pref    = prefs[prefKey];
                    if (pref === 'hide' && !calShowHiddenPrefs) return;
                    events.push({
                        date: dayjs(r.date), sortKey: r.date,
                        nome: r.title, fornitori: [], owners: [], jiraLinks: [],
                        label: '📝 Promemoria',
                        badge: (r.done || pref === 'gray' || pref === 'hide') ? 'bg-secondary' : 'bg-primary',
                        reminder: true, reminderId: r.id, done: !!r.done, doneAt: r.doneAt || null,
                        note: r.note || '', userGray: pref === 'gray', isHiddenPref: pref === 'hide',
                        prefKey, pref
                    });
                });
        }

        this.renderReminders();

        if (events.length === 0) {
            container.innerHTML = "<div class='col-12'><p class='text-center text-muted p-3'>Nessun evento da visualizzare per i filtri selezionati.</p></div>";
            return;
        }

        const hlReminders  = events.filter(ev => ev.reminder && !ev.done && ev.sortKey <= todayStr && !ev.isHiddenPref);
        const hlMilestones = events.filter(ev => !ev.reminder && ev.sortKey === todayStr && !ev.isHiddenPref);
        hlReminders.sort( (a, b) => a.sortKey.localeCompare(b.sortKey));
        hlMilestones.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
        const hasHighlights = hlReminders.length > 0 || hlMilestones.length > 0;

        let html = `
        <div class="col-12 mb-4">
            <div class="card shadow-sm border-0 bg-light">
                <div class="card-header bg-white d-flex justify-content-between align-items-center py-3 border-bottom-0 rounded-top">
                    <h5 class="mb-0 fw-bold text-primary">📅 Eventi in Calendario</h5>
                    <div class="form-check form-switch m-0">
                        <input class="form-check-input" type="checkbox" id="calShowHiddenPrefs" onchange="app.renderCalendar()" ${calShowHiddenPrefs ? 'checked' : ''}>
                        <label class="form-check-label small text-muted mt-1 ms-1" for="calShowHiddenPrefs">Mostra elementi nascosti</label>
                    </div>
                </div>
                <div class="card-body p-4"><div class="row g-4">`;

        if (hasHighlights) {
            html += `
            <div class="col-12">
                <div class="card border-0 shadow-sm" style="background:linear-gradient(135deg,#fff8e1 0%,#e8f5e9 100%);border-left:4px solid #ffc107 !important;">
                    <div class="card-header border-0 pb-0 pt-3 px-3" style="background:transparent;">
                        <h6 class="fw-bold mb-0" style="color:#856404;">⚡ Highlights &mdash; <span class="text-muted fw-normal" style="font-size:0.85rem;">Oggi ${dayjs().format('DD/MM/YYYY')}</span></h6>
                    </div>
                    <div class="card-body p-3"><div class="row g-3">
                        <div class="col-md-5">
                            ${hlReminders.length > 0
                                ? `<div class="small fw-semibold text-muted text-uppercase mb-2" style="letter-spacing:.05em;">📝 Promemoria attivi</div>${hlReminders.map(ev => this._renderEventCard(ev, todayStr, true)).join('')}`
                                : `<div class="text-muted small fst-italic p-2">Nessun promemoria attivo o scaduto.</div>`}
                        </div>
                        <div class="col-md-7">
                            ${hlMilestones.length > 0
                                ? `<div class="small fw-semibold text-muted text-uppercase mb-2" style="letter-spacing:.05em;">🚀 Milestone di oggi</div>${hlMilestones.map(ev => this._renderEventCard(ev, todayStr, true)).join('')}`
                                : `<div class="text-muted small fst-italic p-2">Nessuna milestone automatica per oggi.</div>`}
                        </div>
                    </div></div>
                </div>
            </div>`;
        }

        const groups = {};
        events.forEach(ev => {
            const key = ev.date.format('YYYY-MM');
            if (!groups[key]) groups[key] = { label: ev.date.format('MMMM YYYY'), events: [] };
            groups[key].events.push(ev);
        });

        Object.keys(groups).sort().forEach(k => {
            const sorted = groups[k].events.sort((a, b) => {
                const inactive = ev => (ev.isHiddenPref || ev.hidden || ev.userGray || (ev.pastGray && !ev.reminder) || (ev.reminder && ev.done)) ? 1 : 0;
                const diff = inactive(a) - inactive(b);
                return diff !== 0 ? diff : a.sortKey.localeCompare(b.sortKey);
            });
            html += `
            <div class="col-md-6 col-xl-4">
                <div class="card h-100 shadow-sm border-0">
                    <div class="card-header bg-white py-3 border-bottom">
                        <h6 class="mb-0 fw-bold text-uppercase text-primary d-flex align-items-center justify-content-between">
                            ${groups[k].label}
                            <span class="badge bg-secondary rounded-pill">${sorted.length}</span>
                        </h6>
                    </div>
                    <div class="card-body p-3 bg-white"><div class="d-flex flex-column gap-2">
                        ${sorted.map(ev => this._renderEventCard(ev, todayStr, false)).join('')}
                    </div></div>
                </div>
            </div>`;
        });

        html += `</div></div></div></div>`;
        container.innerHTML = html;
    }

});
