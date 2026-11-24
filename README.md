# SmartDoc KB

Knowledge base modulare in TypeScript per Node.js **22.13+**. Converte documenti in Markdown, li indicizza e permette di cercarli per parole chiave o, con un modello di embedding, per similarità semantica.

- [Libreria SmartDoc KB](GUIDA.md): integrazione, API e demo.
- [Conversione documento → Markdown](src/services/document-to-markdown): modulo della libreria con OCR locale per i PDF scansionati.
- [KB Studio](#kb-studio): interfaccia da terminale per importare e interrogare documenti.
- [Design](<Knowledge Base modulare — Design.md>) e [contratti](contratti.spec.md).

## Build e test

Dalla root del repository:

```sh
npm ci
npm run build
npm test
```

I test compilano la libreria e non richiedono un deployment Azure. I sorgenti sono in `src/`, i test in `test/` e gli artefatti compilati in `dist/`.

## KB Studio

Usa [`.env.example`](kb-agent-cli/.env.example) come riferimento per creare `kb-agent-cli/.env` se non esiste già. Il file locale è escluso da Git; le variabili dell’ambiente di processo hanno precedenza. Non inserire le chiavi nel sorgente.

| Variabili | Uso |
| --- | --- |
| `AZURE_OPENAI_*` | Modello chat con tool calling. Configura modello, chiave, deployment, versione API e istanza oppure endpoint. |
| `KB_SEARCH_AZURE_OPENAI_*` | Ricerca semantica opzionale. Configura deployment di embeddings, chiave, versione API e istanza oppure endpoint. `EMBEDDINGS_DIMENSIONS` vale 3072 di default. |

Per le istanze configurate con `gpt-6-luna`, la CLI invia `reasoning_effort: "none"` per poter usare i tool su Chat Completions.

Dopo aver installato le dipendenze della libreria, installa quelle della CLI e avviala dalla root:

```sh
npm --prefix kb-agent-cli ci
npm --prefix kb-agent-cli start
```

Per eseguire i test della CLI: `npm --prefix kb-agent-cli test`.

La CLI apre `.kb/cli-v2` nella root. Puoi scegliere un’altra directory passando il percorso dopo `--`. Gli archivi di formato incompatibile non vengono migrati: usa una nuova directory e reimporta gli originali.

| Comando | Effetto |
| --- | --- |
| Una domanda al prompt `›` | Avvia una ricerca indipendente e mostra la risposta in Markdown. |
| `/tools`, `/tools on`, `/tools off` | Mostra lo stato oppure abilita o disabilita la visualizzazione dei risultati dei tool. |
| `/add "./Manuale tecnico.pdf"` | Salva una copia del file con un nuovo ID e la indicizza. I percorsi relativi partono dalla directory di lavoro della CLI. |
| `/delete <ID>` oppure `/delete #<ID>` | Rimuove la copia nella KB senza toccare il file sorgente. Racchiudi tra virgolette gli ID che iniziano letteralmente con `#`. |
| Invio a vuoto | Esce dalla CLI. |

Durante `/add`, la CLI mostra l’ID del documento, la percentuale e il messaggio del modulo in esecuzione. La percentuale può ripartire da zero passando da conversione a ingestion o indicizzazione. In modalità interattiva si aggiorna il pannello laterale; con input da pipe gli aggiornamenti restano nell’output. **Pronto nella KB** compare solo dopo l’indicizzazione.

La conversione e l’OCR avvengono in locale. Per creare la mappa delle sezioni, la CLI invia il Markdown al modello chat configurato; se la ricerca semantica è abilitata, invia anche il testo delle sezioni al deployment di embeddings.

L’agente usa i tool di sola lettura della KB: puoi chiedergli l’indice di uno o più documenti per ID, oppure gli indici dei documenti pertinenti a una ricerca. Senza embeddings usa la ricerca per parole chiave. Le domande e i risultati dei tool sono inviati al modello chat. L’agente cita ID e righe o pagine quando disponibili.

Con `/tools on`, la traccia mostra argomenti, risultati e tempi delle chiamate. Il riquadro delle metriche riporta durata, turni, errori e token quando disponibili.
