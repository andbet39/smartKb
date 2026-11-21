# Benchmark searchAgent su KB1

Dalla root del repository, con dipendenze installate:

```sh
npm run build
node --env-file=kb-agent-cli/.env benchmarks/search-agent/run.mjs > benchmark-kb1.json
```

Il comando usa il file della CLI solo come fonte di variabili: non importa né avvia la CLI applicativa. Si può usare un altro file di configurazione o esportare le variabili. Il selettore chiama `/systemone` sullo stesso gateway HTTPS della ricerca con `KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME` e le credenziali `KB_SEARCH_AZURE_OPENAI_*`; si possono impostare anche `KB_DECISION_THRESHOLD` e `KB_DECISION_MAX_DOCUMENTS` (vedi [configurazione di esempio](../../kb-agent-cli/.env.example)). Tutte le run usano lo stesso modello di ricerca: `KB_SEARCH_AZURE_OPENAI_MODEL` se configurato, altrimenti quello della [configurazione della root](../../.env.example).

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

## KB2: benchmark live con risposte verificate

Dalla root, prepara il corpus con `npm run benchmark:kb2:prepare` se non è già disponibile. Poi avvia il benchmark con i deployment reali, configurati come per KB1. Il comando carica di default il file di configurazione della CLI; `--env-file` consente di usarne un altro. **Questa esecuzione fa chiamate fatturate**.

```sh
npm run --silent benchmark:kb2:live -- --output documents/benchmark-kb2/live-2-4-6.json
```

Un unico report JSON raccoglie gli scenari con i primi **2, 4 e 6 PDF interi**; puoi rilanciarne uno con `--counts 4`. Le quattro [domande sul SI](kb2-questions.mjs) sono le stesse in tutti gli scenari: il primo PDF contiene le risposte, gli altri aumentano la dimensione del corpus e fungono da distrattori. In questo modo varia il corpus, non la difficoltà delle domande. Ogni domanda viene eseguita con TOC nel prompt, selettore e TOC via tool (36 ricerche indipendenti con i valori predefiniti, prima di contare eventuali turni aggiuntivi).

Come per KB1, il JSON riporta risposte effettive, fatti attesi e mancanti, passaggi di riferimento, accuratezza, tempi e token dichiarati dal provider, con ricerca e selezione separate e delta rispetto alla baseline. Il grading è deterministico: non verifica negazioni o la pertinenza delle citazioni restituite. Gli errori o fallback del selettore sono riportati e provocano un codice di uscita 1; una risposta errata riduce l'accuratezza ma non fa fallire il processo. Per un JSON puro su stdout, ometti `--output` e usa `npm run --silent benchmark:kb2:live`.

## KB2: simulazione offline del costo al variare di numero e dimensione dei PDF

Da root, prepara il corpus una volta con `npm run benchmark:kb2:prepare`: scarica e indicizza sei [pubblicazioni NIST](kb2-corpus.mjs). I PDF originali restano in `documents/benchmark-kb2/`, l'indice separato in `kb2/`; entrambi sono artefatti locali rigenerabili. L'indice estrae il testo nativo e usa una sezione per pagina con testo, senza OCR o riassunti AI. I rilanci riusano l'indice locale, senza download.

```sh
npm run benchmark:kb2 -- --help
npm run benchmark:kb2 -- --counts 1,3,6 --pages 4,12,20 \
	--search-input 2 --search-output 8 --decision-input 0.5 --decision-output 2 \
	--output documents/benchmark-kb2/simulation.json
npm run benchmark:kb2 -- --scenario 1x4 --scenario 6x20 \
	--output documents/benchmark-kb2/selected-scenarios.json
npm run --silent benchmark:kb2 -- --counts 2,4,6 --pages 20 \
	--output documents/benchmark-kb2/simulation-2-4-6.json
```

Senza opzioni si eseguono i nove scenari predefiniti. Ripeti `--scenario DOCUMENTIxPAGINE` per eseguire solo le coppie indicate, senza incrociarle; non combinarlo con `--counts` o `--pages`. `--output` salva il JSON e sovrascrive un report con lo stesso nome. Senza `--output`, usa `npm run --silent benchmark:kb2` per ottenere solo il JSON su stdout.

Le quattro tariffe sono **esempi**, non prezzi Azure: sono espresse per milione di token, nella valuta scelta con `--currency` (predefinita: USD). Se le ometti, il report contiene solo i token. I costi sono stimati per una domanda e proiettati su mille domande identiche. `--counts` e `--pages` accettano liste separate da virgole; ogni scenario conserva gli stessi primi documenti e le stesse prime pagine, senza modificare KB2. `corpusTextTokens` misura la dimensione del testo indicizzato, non i token inviati al modello.

La stessa domanda sulla pubblicazione SP 330-2019 viene eseguita con le tre modalità di ricerca, sia leggendo una pagina (`targeted`) sia leggendo tutto il documento disponibile (`fullDocument`). L'agente e i tool sono quelli reali, ma i turni del modello sono guidati da uno script; il selettore simulato restituisce sempre il documento corretto. Il conteggio stima i token di messaggi, schemi e risposte con `o200k_base`. Non misura fatturazione, cache, accuratezza, latenza o costo d'importazione e non fa richieste Azure.

### Risultati d'esempio

USD per 1.000 domande, **lettura mirata**, con le tariffe sopra:

| Documenti | Pagine per PDF | TOC nel prompt | Con selettore | TOC via tool |
|---:|---:|---:|---:|---:|
| 1 | 4 | 6,81 | 7,24 | 14,37 |
| 1 | 12 | 8,61 | 9,03 | 18,37 |
| 1 | 20 | 10,71 | 11,14 | 22,68 |
| 3 | 4 | 9,06 | 7,33 | 15,06 |
| 3 | 12 | 14,73 | 9,12 | 19,06 |
| 3 | 20 | 21,63 | 11,23 | 23,37 |
| 6 | 4 | 12,87 | 7,49 | 16,38 |
| 6 | 12 | 24,56 | 9,28 | 20,38 |
| 6 | 20 | 39,26 | 11,38 | 24,69 |

Nel caso 6 × 20, leggendo tutto il documento i valori diventano rispettivamente 58,12, 30,25 e 29,56 USD. Con un solo PDF il selettore aggiunge una chiamata senza ridurre il numero di documenti nel prompt; con più PDF, in questo scenario risparmia spazio perché ne seleziona uno solo.