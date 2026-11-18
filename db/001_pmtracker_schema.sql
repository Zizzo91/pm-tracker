-- ═══════════════════════════════════════════════════════════════════
-- PM Tracker — schema dedicato `pmtracker` sul progetto Supabase
-- gfglazxhxxplhoteaahr (gestione-conti / eu-central-1).
--
-- ⚠️ ISOLAMENTO: tutto vive in `pmtracker.*`. Non tocca `public`,
--    `spesa`, `soundtube`, `storybook`. Nessuna tabella esistente
--    viene modificata o rinominata.
--
-- ⚠️ COME APPLICARLO:
--   1. Dashboard Supabase → SQL Editor → New query
--   2. Incolla questo file intero → RUN  (è idempotente: si può rieseguire)
--   3. Verifica in fondo: espone `pmtracker` a PostgREST in modo ADDITIVO.
--      Se il blocco segnala che la variabile non è impostata, aggiungi
--      `pmtracker` in Settings → API → Exposed schemas.
--
-- ⚠️ MODELLO DATI: una sola riga (`id = 'main'`) con l'intero array JSON
--    dei progetti, identico al vecchio data/projects.json. L'app continua
--    a leggere/scrivere il documento intero: nessuna migrazione di forma.
--    La vista `v_progetti` espone gli stessi dati "un progetto per riga"
--    in sola lettura, per query e report.
--
-- ⚠️ SICUREZZA: RLS attiva, accesso solo a utenti autenticati
--    (login PIN con l'account Supabase esistente). La anon key pubblica
--    nel frontend non permette di leggere nulla senza login.
-- ═══════════════════════════════════════════════════════════════════

create schema if not exists pmtracker;

-- ── Documento di stato (una riga) ───────────────────────────────────
create table if not exists pmtracker.state (
  id         text        primary key default 'main',
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  updated_by uuid
);

-- ── Trigger updated_at (usato dall'app per il controllo di conflitto) ─
create or replace function pmtracker.touch_state()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists trg_state_updated_at on pmtracker.state;
create trigger trg_state_updated_at
  before update on pmtracker.state
  for each row execute function pmtracker.touch_state();

-- ── Vista ad hoc: un progetto per riga (sola lettura) ────────────────
create or replace view pmtracker.v_progetti
with (security_invoker = true) as
select
  p->>'id'                                  as project_id,
  p->>'nome'                                as nome,
  nullif(p->>'progress', '')::numeric       as progress,
  nullif(p->>'devStart', '')                as dev_start,
  nullif(p->>'devEnd', '')                  as dev_end,
  nullif(p->>'dataIA', '')                  as data_ia,
  nullif(p->>'dataTest', '')                as data_test,
  nullif(p->>'dataProd', '')                as data_prod,
  nullif(p->>'dataUAT', '')                 as data_uat,
  nullif(p->>'dataBS', '')                  as data_bs,
  nullif(p->>'dataScadenzaStima', '')       as data_scadenza_stima,
  nullif(p->>'dataConfigSistema', '')       as data_config_sistema,
  nullif(p->>'stimaGgu', '')::numeric       as stima_ggu,
  nullif(p->>'rcFornitore', '')::numeric    as rc_fornitore,
  nullif(p->>'stimaCosto', '')::numeric     as stima_costo,
  coalesce((select array_agg(x order by x) from jsonb_array_elements_text(coalesce(p->'fornitori', '[]'::jsonb)) x), '{}') as fornitori,
  coalesce((select array_agg(x order by x) from jsonb_array_elements_text(coalesce(p->'owners',   '[]'::jsonb)) x), '{}') as owners,
  coalesce((p->>'hidden')::boolean, false)  as hidden,
  nullif(p->>'note', '')                    as note,
  coalesce(p->'jiraLinks', '[]'::jsonb)     as jira_links,
  p                                         as raw
from pmtracker.state s
cross join lateral jsonb_array_elements(s.data) p
where coalesce(p->>'type', '') <> 'meta'
  and p->>'id' is distinct from '__pm_tracker_meta__';

comment on view pmtracker.v_progetti is
  'Progetti PM Tracker in forma relazionale (sola lettura), derivata da pmtracker.state.data.';

-- ── Permessi ────────────────────────────────────────────────────────
grant usage on schema pmtracker to anon, authenticated, service_role, authenticator;
grant select, insert, update on pmtracker.state to authenticated, service_role;
revoke all on pmtracker.state from anon;
grant select on pmtracker.v_progetti to authenticated, service_role;
revoke all on pmtracker.v_progetti from anon;

-- ── RLS: solo utenti autenticati (login PIN) ────────────────────────
alter table pmtracker.state enable row level security;

drop policy if exists state_authenticated_all on pmtracker.state;
create policy state_authenticated_all on pmtracker.state
  for all to authenticated
  using (true) with check (true);

-- ── Esposizione a PostgREST (ADDITIVA: non rimuove gli altri schemi) ─
-- Su questo progetto il valore "vincolante" è quello impostato a livello
-- DATABASE per il ruolo authenticator (è quello che scrive il Dashboard).
-- Appendiamo `pmtracker` alla lista esistente, senza sostituirla.
do $$
declare cur text;
begin
  select split_part(x, '=', 2) into cur
  from pg_db_role_setting s
  join pg_roles r    on r.oid = s.setrole
  join pg_database d on d.oid = s.setdatabase
  cross join lateral unnest(s.setconfig) x
  where r.rolname = 'authenticator'
    and d.datname = current_database()
    and x like 'pgrst.db_schemas=%';

  if cur is null then
    raise notice 'ATTENZIONE: nessun override db-scoped. Aggiungi pmtracker in Settings -> API -> Exposed schemas.';
  elsif position('pmtracker' in cur) = 0 then
    execute format('alter role authenticator in database %I set pgrst.db_schemas = %L', current_database(), cur || ',pmtracker');
    raise notice 'pmtracker aggiunto a pgrst.db_schemas (db-scoped): %', cur || ',pmtracker';
  else
    raise notice 'pmtracker gia presente in pgrst.db_schemas: %', cur;
  end if;
end $$;

notify pgrst, 'reload config';
notify pgrst, 'reload schema';

-- ── Verifica rapida ─────────────────────────────────────────────────
-- select count(*) as progetti from pmtracker.v_progetti;
-- select id, updated_at, jsonb_array_length(data) as elementi from pmtracker.state;
