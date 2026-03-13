// app.reminders.js — Gestione promemoria manuali
Object.assign(app, {

    // ─── UI FORM ─────────────────────────────────────────────────────────────

    _updateReminderFormUI: function() {
        const isEditing = !!this._editingReminderId;
        const addBtn     = document.getElementById('rem_add_btn');
        const cancelBtn  = document.getElementById('rem_cancel_btn');
        const editBanner = document.getElementById('rem_edit_banner');
        if (addBtn)     addBtn.textContent       = isEditing ? '💾 Aggiorna promemoria' : '+ Aggiungi promemoria';
        if (cancelBtn)  cancelBtn.style.display  = isEditing ? 'inline-block' : 'none';
        if (editBanner) editBanner.style.display = isEditing ? 'flex' : 'none';
    },

    clearReminderInputs: function() {
        ['rem_date', 'rem_title', 'rem_note'].forEach(id => this._setVal(id, ''));
        this._editingReminderId = null;
        this._updateReminderFormUI();
    },

    // ─── EDIT ────────────────────────────────────────────────────────────────

    editReminder: function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        this._setVal('rem_date',  r.date  || '');
        this._setVal('rem_title', r.title || '');
        this._setVal('rem_note',  r.note  || '');
        this._editingReminderId = id;
        this._updateReminderFormUI();
        const dateEl  = document.getElementById('rem_date');
        const titleEl = document.getElementById('rem_title');
        if (dateEl)  dateEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (titleEl) titleEl.focus();
    },

    // ─── ADD / UPDATE ────────────────────────────────────────────────────────

    addReminder: async function() {
        const date  = this._getVal('rem_date');
        const title = this._getVal('rem_title').trim();
        const note  = this._getVal('rem_note').trim();
        if (!date || !title) {
            this.showAlert('Inserisci almeno Data e Titolo per il promemoria.', 'warning', 3000);
            return;
        }
        const meta = this.getMeta();
        if (this._editingReminderId) {
            const r = meta.manualReminders.find(x => x.id === this._editingReminderId);
            if (r) Object.assign(r, { date, title, note, updatedAt: new Date().toISOString() });
            this._editingReminderId = null;
        } else {
            meta.manualReminders.push({
                id:        Date.now().toString(),
                date, title, note,
                done:      false,
                createdAt: new Date().toISOString(),
                doneAt:    null
            });
        }
        meta.manualReminders.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
        this.clearReminderInputs();
        await this.syncToGithub();
    },

    // ─── TOGGLE DONE ────────────────────────────────────────────────────────

    toggleReminderDone: async function(id) {
        const meta = this.getMeta();
        const r = (meta.manualReminders || []).find(x => x.id === id);
        if (!r) return;
        r.done   = !r.done;
        r.doneAt = r.done ? new Date().toISOString() : null;
        await this.syncToGithub();
    },

    // ─── DELETE ──────────────────────────────────────────────────────────────

    deleteReminder: async function(id) {
        if (!confirm('Eliminare questo promemoria?')) return;
        if (this._editingReminderId === id) this.clearReminderInputs();
        const meta = this.getMeta();
        meta.manualReminders = (meta.manualReminders || []).filter(x => x.id !== id);
        await this.syncToGithub();
    },

    // ─── RENDER ──────────────────────────────────────────────────────────────

    renderReminders: function() {
        this._updateReminderFormUI();
    },

    _formatDoneAt: function(doneAt) {
        if (!doneAt) return '';
        try {
            return dayjs(doneAt).format('DD/MM/YYYY HH:mm');
        } catch(e) { return ''; }
    }

});
