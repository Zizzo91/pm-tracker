# pm-tracker-main 4

## Descrizione
Progressive Web App per la gestione progetti e timeline di sviluppo. Include vista lista, diagramma di Gantt e calendario rilasci con promemoria manuali.

**Storage dati**: Supabase — schema dedicato `pmtracker` sul progetto `gfglazxhxxplhoteaahr` (gestione-conti, eu-central-1), stessa istanza usata da `spesa`, `soundtube`, `storybook`. Accesso protetto da login PIN (account Supabase esistente).

## Struttura
```
pm-tracker-main 4/
├── index.html                        — UI Bootstrap 5, tabs (lista, Gantt, calendario), login PIN
├── manifest.json                     — PWA manifest
├── service-worker.js                 — Service Worker (precache relativo, network-first per HTML, network-only per Supabase/GitHub)
├── redirect.html                     — Pagina redirect
├── configurazioni app.txt            — Note locali (⚠️ contiene un PAT, non committare)
├── data/projects.json                — Snapshot pre-migrazione (backup storico, non più letto dall'app)
├── db/001_pmtracker_schema.sql       — Schema Supabase (tabella state, vista v_progetti, RLS, esposizione)
└── assets/
    ├── app.js                        — ⚠️ UNICO file JS caricato: tutta la logica (dati, render, editor, calendario)
    ├── supabase-config.js            — url + anon key + schema pmtracker (anon key è pubblica by design)
    ├── styles.css                    — Stili custom: design token Telepass + Gantt stile Apple
    ├── brand/logo-telepass.svg       — Logo ufficiale Telepass usato nell'hero
    └── favicon.png, icon-192.png, icon-512.png  — Icone PWA
```

⚠️ `assets/app.data.js`, `app.render.js`, `app.editor.js`, `app.calendar.js`, `app.reminders.js` sono **copie storiche non caricate** da `index.html`. Non modificarle: le modifiche vanno fatte in `assets/app.js`.

## Modello dati
- `pmtracker.state` — **una riga** (`id = 'main'`) con colonna `data jsonb` contenente l'intero array dei progetti (stessa forma del vecchio `data/projects.json`):
  - progetti + un record meta (`id = '__pm_tracker_meta__'`) con promemoria manuali ed eventPrefs.
  - `updated_at` viene aggiornato da trigger; l'app lo usa per il controllo di conflitto (update condizionato).
- `pmtracker.v_progetti` — **vista in sola lettura**, un progetto per riga con colonne tipizzate (nome, date, fornitori/owners come array, stima ggu, costo, hidden, raw).

## Sicurezza
- RLS attiva su `pmtracker.state`: solo ruolo `authenticated` (nessun accesso con la sola anon key).
- Login: PIN a 6 cifre via `signInWithPassword` con l'account Supabase condiviso (`pinEmail` in `assets/supabase-config.js`, stessa password/PIN di storybook).
- `service_role` e password DB **non** stanno nel repo.

## Funzionalità
- 3 viste: Elenco Progetti, Gantt Sviluppo, Calendario Rilasci
- Milestone: pianificazione, IA, dev start/end, UAT, BS, test, prod + milestone personalizzate
- Dati economici: stima fornitore (gg/u), RC fornitore, costo calcolato
- Link Jira (fino a 10)
- Promemoria manuali con completamento
- Filtri avanzati: fornitore, owner, data test, data prod, milestone
- Ordinamento multiplo (prod, dev start, alfabetico, manuale drag&drop)
- Zoom Gantt (mensile/settimanale); il Gantt scorre con la pagina intera, header mesi sticky
- Navigazione "Vai a Oggi" nel calendario
- Banner offline/online
- Menu fornitori multi-selezione (preset + valori già usati + nuovo fornitore)
- Modalità archiviazione progetti
- Backup GitHub **opzionale** (Impostazioni → switch): copia il JSON nel repo, non blocca il salvataggio

## Stack
- HTML/CSS/JS vanilla, Bootstrap 5, Day.js, PWA
- `@supabase/supabase-js@2` (CDN)
- Supabase Postgres 17 + PostgREST, schema `pmtracker`

## Design system
- **Base Telepass** (token in `:root`, prefisso `--tp-`): blu notte `#002752`, blu autostrada `#003b7a`, blu casello `#0071eb`, giallo brand `#fee01a`. Sfondi chiari `#f4f7f9`, superfici bianche, elevazioni morbide, raggi 8–28px, CTA pill.
- **Gantt stile Apple** (token `--ap-*`): fondo bianco, hairline `#e6e6e6`, header mesi sticky, etichette e barre pulite, icone SVG in stile SF Symbols.
- **Font**: Galano Telepass non è distribuibile → sostituti liberi **Poppins** (display) e **Inter** (UI) da Google Fonts (`index.html`). Il font del Gantt usa la pila di sistema Apple (`-apple-system`).
- **Icone**: set SVG inline `PM_ICONS` in `assets/app.js`, usato con `app._icon('nome', 'classe')`. Niente emoji nell'interfaccia.
- **Riferimenti**: token estrapolati da `../reverse-brand/out/www.telepass.com/capture/snapshot.json` (`rootVars`) e `../reverse-brand/out/www.apple.com/tokens.css`.
- **Attenzione**: i `.dropdown-menu` interni alle card (calendario) hanno bisogno di `z-index` esplicito sul contenitore (`:has(.dropdown-menu.show)`) e non vanno animati con `transform`, altrimenti sovrascrivono il posizionamento di Popper.

## Setup / manutenzione
1. Schema: eseguire `db/001_pmtracker_schema.sql` nel SQL Editor (idempotente). Aggiunge `pmtracker` alla lista schemi esposti **senza rimuovere** gli altri.
2. Config frontend: `assets/supabase-config.js`.
3. Deploy: GitHub Pages da `main` (`https://zizzo91.github.io/pm-tracker/`). Dopo modifiche a JS/CSS incrementare `SW_VERSION` in `service-worker.js` e il `?v=` di `app.js` in `index.html`, altrimenti la PWA serve la cache vecchia.
