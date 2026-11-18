#!/usr/bin/env node
// Import / ripristino del documento progetti nel progetto Supabase (schema pmtracker).
//
// Uso:
//   SUPABASE_URL=https://<ref>.supabase.co \
//   SUPABASE_SERVICE_ROLE=<service_role key> \
//   node scripts/import-to-supabase.mjs [file.json] [--force]
//
// Senza --force si rifiuta di sovrascrivere una riga `main` già esistente.
// La service_role key è un SEGRETO: passarla solo da variabile d'ambiente,
// non scriverla nel repo.

import fs from 'node:fs';
import path from 'node:path';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE;
const args = process.argv.slice(2);
const force = args.includes('--force');
const file = args.find(a => !a.startsWith('--')) || 'data/projects.json';

if (!url || !key) {
  console.error('Mancano SUPABASE_URL e/o SUPABASE_SERVICE_ROLE.');
  process.exit(1);
}
if (!fs.existsSync(file)) {
  console.error(`File non trovato: ${file}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, 'utf8'));
if (!Array.isArray(data)) {
  console.error('Il file deve contenere un array di progetti.');
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  'Content-Type': 'application/json',
  'Content-Profile': 'pmtracker',
  Accept: 'application/json'
};

const base = `${url}/rest/v1/state`;

const existing = await fetch(`${base}?select=updated_at&id=eq.main`, { headers });
if (!existing.ok) {
  console.error('Lettura fallita:', existing.status, await existing.text());
  process.exit(1);
}
const rows = await existing.json();
if (rows.length && !force) {
  console.error(`Esiste già un documento (updated_at ${rows[0].updated_at}). Rilancia con --force per sovrascriverlo.`);
  process.exit(1);
}

const res = await fetch(`${base}?on_conflict=id`, {
  method: 'POST',
  headers: { ...headers, Prefer: 'resolution=merge-duplicates,return=representation' },
  body: JSON.stringify([{ id: 'main', data }])
});

if (!res.ok) {
  console.error('Import fallito:', res.status, await res.text());
  process.exit(1);
}

const saved = await res.json();
console.log(`Importato ${path.resolve(file)}: ${data.length} elementi, updated_at ${saved[0]?.updated_at}`);
