// Config Supabase per PM Tracker (anon key PUBBLICA, sicura per il frontend).
// Stesso progetto di gestione-conti/storybook/spesa: schema dedicato `pmtracker`.
// Non mettere qui service_role o password.
// Progetto: gfglazxhxxplhoteaahr (gestione-conti, eu-central-1)
//
// I dati vivono SOLO in pmtracker.state (una riga, id='main') e sono leggibili
// esclusivamente da utenti autenticati (login PIN). La anon key da sola non basta.
window.SUPABASE_CONFIG = {
  url: "https://gfglazxhxxplhoteaahr.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmZ2xhenhoeHhwbGhvdGVhYWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MTczNTMsImV4cCI6MjEwMzQ5MzM1M30.iVsfZ97Zrb9nK-hqyvPPs9SZKgqlV5n16LRzI14yWpY",
  schema: "pmtracker",
  pinEmail: "simone.marramao@hotmail.it"
};
