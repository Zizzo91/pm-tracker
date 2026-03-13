// app.data.js — Gestione dati, normalizzazione, colori, badge, filtri, sort
Object.assign(app, {

    // ─── META / DATI ────────────────────────────────────────────────────────

    isMeta: function(p) {
        return !!p && (p.type === 'meta' || p.id === this.META_ID);
    },

    getMeta: function() {
        let meta = this.data.find(p => this.isMeta(p));
        if (!meta) {
            meta = { id: this.META_ID, type: 'meta', manualReminders: [], eventPrefs: {} };
            this.data.push(meta);
        }
        if (!Array.isArray(meta.manualReminders)) meta.manualReminders = [];
        if (!meta.eventPrefs) meta.eventPrefs = {};
        return meta;
    },

    getProjectsOnly: function() {
        return (this.data || []).filter(p => !this.isMeta(p));
    },

    csvToArray: function(val) {
        if (!val) return [];
        if (Array.isArray(val)) return val.map(s => (s || '').toString().trim()).filter(Boolean);
        if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
        return [];
    },

    normalizeProject: function(p) {
        if (p && (p.type === 'meta' || p.id === this.META_ID)) {
            return { ...p, id: p.id || this.META_ID, type: 'meta',
                manualReminders: Array.isArray(p.manualReminders) ? p.manualReminders : [],
                eventPrefs: p.eventPrefs || {} };
        }
        return { ...p,
            owners:           this.csvToArray(p.owners || p.owner),
            fornitori:        this.csvToArray(p.fornitori),
            customMilestones: Array.isArray(p.customMilestones) ? p.customMilestones : [],
            progress:         p.progress != null ? p.progress : null,
            hidden:           !!p.hidden
        };
    },

    isAutoStale: function(p) {
        try {
            if (!p || this.isMeta(p) || p.hidden) return false;
            if (!p.dataProd || p.dataProd.trim() === '') return false;
            const prodDate = new Date(p.dataProd);
            if (isNaN(prodDate.getTime())) return false;
            const today = new Date(); today.setHours(0, 0, 0, 0);
            const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
            return prodDate < oneMonthAgo;
        } catch (e) { console.error('Errore in isAutoStale:', e); return false; }
    },

    isHiddenForUI: function(p) {
        if (!p || this.isMeta(p)) return true;
        return p.hidden || this.isAutoStale(p);
    },

    // ─── COLOR / BADGE ───────────────────────────────────────────────────────

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
        return (kind === 'owner' && this.OWNER_COLORS[key]) ? this.OWNER_COLORS[key] : this._autoColor(name, kind);
    },

    _badgeStyle: function(kind, name) {
        const c = this._badgeColor(kind, name);
        return `background: ${c.bg} !important; color: ${c.fg} !important; border: 1px solid rgba(0,0,0,0.12);`;
    },

    _projectColors: function(name) {
        if (!name) return { bg: '#ffffff', border: '#dee2e6', barBg: '#0d6efd', barBorder: '#0a58ca' };
        const palette = [
            { bg: '#eef2ff', border: '#0d6efd', barBg: '#cfe2ff', barBorder: '#0a58ca' },
            { bg: '#f4f0ff', border: '#6f42c1', barBg: '#e0cffc', barBorder: '#59359a' },
            { bg: '#fdf8f5', border: '#c27b5e', barBg: '#f2d8cd', barBorder: '#9c543a' },
            { bg: '#f0fdf4', border: '#198754', barBg: '#d1f2e0', barBorder: '#146c43' },
            { bg: '#fff6f0', border: '#fd7e14', barBg: '#ffe5d0', barBorder: '#e0660b' },
            { bg: '#fff0f6', border: '#d63384', barBg: '#fccce1', barBorder: '#a32060' },
            { bg: '#f0fbff', border: '#0dcaf0', barBg: '#cff4fc', barBorder: '#0aa2c0' },
            { bg: '#fff5f5', border: '#dc3545', barBg: '#f8d7da', barBorder: '#b02a37' },
            { bg: '#fffbea', border: '#cfa00c', barBg: '#fae39d', barBorder: '#a88106' },
            { bg: '#f4f5fd', border: '#6610f2', barBg: '#e2d6fa', barBorder: '#520dc2' },
            { bg: '#f2fbf7', border: '#20c997', barBg: '#d1f7ea', barBorder: '#1aa179' },
            { bg: '#fcf3f4', border: '#9e2a2b', barBg: '#eed2d4', barBorder: '#7a2021' },
            { bg: '#fbf7f4', border: '#8b4513', barBg: '#e8d2c3', barBorder: '#66320e' },
            { bg: '#fcf0f8', border: '#8f2d56', barBg: '#ebd1e0', barBorder: '#6e2141' },
            { bg: '#f2f9f9', border: '#127369', barBg: '#cbe7e7', barBorder: '#0d544c' }
        ];
        return palette[this._hashString(`fixed_palette_${name}`) % palette.length];
    },

    _badgeSpan: function(kind, name, className) {
        const safeName = (name ?? '').toString();
        return `<span class="${className}" style="${this._badgeStyle(kind, safeName)}">${safeName}</span>`;
    },

    // ─── FILTRI ──────────────────────────────────────────────────────────────

    populateFornitoreFilters: function() {
        try {
            const values = [...new Set(this.getProjectsOnly().flatMap(p => p.fornitori || []))].sort();
            this._populateFilterSelects(
                ['ganttFornitoreFilter', 'tableFornitoreFilter', 'calendarFornitoreFilter'],
                values
            );
        } catch (e) { console.error('populateFornitoreFilters error', e); }
    },

    populateOwnerFilters: function() {
        try {
            const values = [...new Set(this.getProjectsOnly().flatMap(p => p.owners || []))]
                .sort((a, b) => (a || '').localeCompare(b || '', 'it'));
            this._populateFilterSelects(
                ['ganttOwnerFilter', 'tableOwnerFilter', 'calendarOwnerFilter'],
                values
            );
        } catch (e) { console.error('populateOwnerFilters error', e); }
    },

    // ─── SORT ────────────────────────────────────────────────────────────────

    _sortGantt: function(data, mode) {
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const d  = val => val ? new Date(val) : new Date(0);
        const ip = p   => { const prod = p.dataProd ? new Date(p.dataProd) : null; return !prod || prod > today; };
        const inProgressFirst = field => (a, b) => {
            const diff = (ip(a) ? 0 : 1) - (ip(b) ? 0 : 1);
            return diff !== 0 ? diff : d(a[field]) - d(b[field]);
        };
        const sorted = [...data];
        switch (mode) {
            case 'custom':                        sorted.sort((a, b) => (a.ganttOrder ?? 999999) - (b.ganttOrder ?? 999999)); break;
            case 'prod_inprogress_first':         sorted.sort(inProgressFirst('dataProd'));  break;
            case 'prod_asc':                      sorted.sort((a, b) => d(a.dataProd)  - d(b.dataProd));  break;
            case 'prod_desc':                     sorted.sort((a, b) => d(b.dataProd)  - d(a.dataProd));  break;
            case 'devStart_inprogress_first':     sorted.sort(inProgressFirst('devStart')); break;
            case 'devStart_asc':                  sorted.sort((a, b) => d(a.devStart)  - d(b.devStart));  break;
            case 'devStart_desc':                 sorted.sort((a, b) => d(b.devStart)  - d(a.devStart));  break;
            case 'devEnd_inprogress_first':       sorted.sort(inProgressFirst('devEnd'));   break;
            case 'test_inprogress_first':         sorted.sort(inProgressFirst('dataTest')); break;
            case 'alpha_asc':                     sorted.sort((a, b) => (a.nome||'').localeCompare(b.nome||'', 'it')); break;
            case 'alpha_desc':                    sorted.sort((a, b) => (b.nome||'').localeCompare(a.nome||'', 'it')); break;
        }
        return sorted;
    }

});
