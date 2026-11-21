# Benchmark searchAgent su KB1

Dalla root del repository, con dipendenze installate:

```sh
npm run build
node --env-file=kb-agent-cli/.env benchmarks/search-agent/run.mjs > benchmark-kb1.json
```

Il comando usa il file della CLI solo come fonte di variabili: non importa né avvia la CLI applicativa. Si può usare un altro file di configurazione o esportare le variabili. Il selettore usa `KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME`, le credenziali e l'endpoint `KB_SEARCH_AZURE_OPENAI_*`, e opzionalmente `KB_DECISION_THRESHOLD` e `KB_DECISION_MAX_DOCUMENTS` (vedi [configurazione di esempio](../../kb-agent-cli/.env.example)). Tutte le run usano lo stesso modello di ricerca: `KB_SEARCH_AZURE_OPENAI_MODEL` se configurato, altrimenti quello della [configurazione della root](../../.env.example).

Lo script chiama `KbSmartManager.getAgentSearchTool()` per le stesse 11 domande in tre modalità:

- `withoutDecision`: senza selettore, tutte le TOC nel prompt (baseline).
- `withDecision`: con selettore, solo le TOC dei candidati nel prompt.
- `withoutDecisionTocViaTools`: senza selettore e senza TOC nel prompt; catalogo e TOC dei documenti sono disponibili tramite tool.

Ogni domanda è indipendente. L'esecuzione usa deployment reali e consuma token. Avanzamento e riepilogo vanno su stderr. Il JSON su stdout contiene i tre report e due differenze rispetto alla baseline: `delta` per il selettore e `tocViaToolsDelta` per la TOC via tool. Un errore del selettore non invalida `tocViaToolsDelta`.

- **Accuratezza**: corrette / totale, incluse le richieste fallite nel denominatore. Per ogni domanda, il report include risposta attesa, risposta effettiva, fatti mancanti e riferimento nel corpus. Il punteggio è deterministico: verifica tutti i fatti attesi con regole testuali, senza un modello giudice. Non verifica negazioni, contraddizioni aggiuntive o la validità delle citazioni; in caso di dubbio, confrontare la risposta con il passaggio di riferimento.
- **Token**: input, output e totale del provider, con subtotali separati per ricerca e selezione. Il costo complessivo include i turni di tool calling e quelli del decision model. `observed` somma solo i turni misurati (oppure è `null` se nessuno ha riportato quel dato). Il delta è `null` quando la copertura non è completa in entrambe le run. Non è una stima monetaria.
- **Corpus**: due domande per ciascuno dei cinque documenti di riferimento, più `npw-ooe-context`, che chiede la soglia e le due categorie nelle righe successive a `Req *39`. Nella run live il modello sceglie il tool; il test offline verifica esplicitamente ricerca con contesto e citazione del range. Le fonti sono relative a KB1 e le righe partono da 1. Lo script apre la KB com'è sul disco: eventuali documenti locali aggiuntivi possono cambiare il costo o le risposte. Il report elenca i documenti effettivamente caricati, oltre a modello e deployment.
- **Errori**: se fallisce una ricerca o una chiamata al decision model, il benchmark continua, include l'errore nel report e termina con codice 1. In caso di errore del decision model l'agente usa il fallback di ricerca globale: il risultato non misura una selezione riuscita. Il delta di accuratezza è `null` in presenza di errori; le risposte errate non rendono fallito il processo.

Test offline, senza credenziali né richieste fatturate:

```sh
node --test benchmarks/search-agent/benchmark.test.mjs
```