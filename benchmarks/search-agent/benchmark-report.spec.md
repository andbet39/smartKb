# Report dei benchmark searchAgent

## Tipi

Il benchmark live di KB2 restituisce un `Kb2Report`. Il benchmark live di KB1 restituisce direttamente un `Comparison`, senza la lista degli scenari. Questa specifica non riguarda il JSON della simulazione offline dei costi.

```ts
type Mode = 'withoutDecision' | 'withDecision' | 'withoutDecisionTocViaTools';
type Corpus = 'kb1' | 'kb2';
type Kb2Report = { corpus: 'kb2'; method: 'live'; scenarios: Scenario[] };
type Scenario = Comparison & { documentCount: number; pages: number };
type Comparison = Record<Mode, Run> & { delta: Delta; tocViaToolsDelta: Delta };

type Run = {
  corpus: Corpus;
  documents: DocumentSource[];
  model: string | null;
  deployment: string | null;
  tocMode: 'prompt' | 'tools';
  decision: Decision | null;
  summary: Summary;
  results: Result[];
};
type Decision = {
  model: string | null;
  deployment: string | null;
  threshold: number;
  maxDocuments: number;
};
type Summary = {
  questions: number;
  correct: number;
  incorrect: number;
  errors: number;
  accuracy: number;
  decisionErrors: number;
  tokens: TokenBreakdown;
};
type Result = {
  id: string;
  question: string;
  source: ExpectedSource;
  expected: string[];
  answer: string | null;
  references: Reference[];
  missing: string[];
  status: 'correct' | 'incorrect' | 'error';
  error: string | null;
  decisionError: string | null;
  durationMs: number;
  tokens: TokenBreakdown;
};

type ExpectedSource = { file: string; fromLine: number; toLine: number };
type DocumentSource = { documentId: number; originalFileName: string | null; title?: string };
type PageSpan = { pageNumber: number; fromLine: number; toLine: number };
type PassageSource = DocumentSource & {
  fromLine: number;
  toLine: number;
  pages: PageSpan[] | null;
  sectionId?: number;
  sectionTitle?: string;
};
type Reference =
  | { kind: 'passage'; source: PassageSource }
  | { kind: 'summary'; source: DocumentSource };

type TokenField = 'input' | 'output' | 'total';
type TokenMetric = { observed: number | null; turnsWithUsage: number };
type Usage = Record<TokenField, TokenMetric> & { modelTurns: number };
type TokenBreakdown = Usage & { search: Usage; decision: Usage };
type Delta = {
  correct: number | null;
  accuracy: number | null;
  tokens: Record<TokenField, number | null>;
};
```

## Modello dati

### Cosa viene testato

- **KB2:** scenari annidati da 2, 4 e 6 PDF interi per impostazione predefinita. Il primo PDF contiene le risposte; quelli aggiunti sono distrattori. Le stesse quattro domande chiedono velocità della luce, frequenza del cesio-133, unità e simbolo della quantità di sostanza, frequenza ed efficacia luminosa nella definizione della candela. La matrice predefinita contiene 3 scenari × 3 modalità × 4 domande = 36 esiti; un esito può richiedere più chiamate ai modelli. `pages` è la somma delle pagine dei PDF, non il numero di pagine lette dal modello.
- **KB1:** un solo corpus, con 11 domande attese su cinque documenti. Non attribuire a KB1 uno scenario KB2; il numero effettivo di documenti si ricava da `documents.length`.
- **Modalità:** `withoutDecision` mette tutti gli indici nel prompt (baseline); `withDecision` usa un selettore e mette nel prompt gli indici dei candidati; `withoutDecisionTocViaTools` non usa il selettore e rende catalogo e indici disponibili tramite tool. Ogni domanda è indipendente.

### Come interpretare gli esiti

- **Accuratezza:** `correct / questions`, con errori di ricerca inclusi nel denominatore. `correct + incorrect + errors = questions`. La verifica è deterministica: confronta il testo con regole sui fatti attesi. Non convalida negazioni, contraddizioni o citazioni. `source` è il riferimento atteso, con percorso relativo al corpus e righe inclusive a partire da 1; `references` contiene i riferimenti effettivamente restituiti dall'agente. Non confonderli.
- **Errori distinti:** `status: 'error'` indica una ricerca fallita; in quel caso `answer` è `null` e tutti i fatti attesi risultano mancanti. `decisionError` segnala invece un errore del selettore registrato prima del fallback: la risposta finale può comunque essere corretta. Mostra `decisionErrors` separatamente da `errors`. Un report può essere scritto anche con codice di uscita 1.
- **Token:** `tokens` al primo livello comprende già ricerca e selezione; `tokens.search` e `tokens.decision` sono la ripartizione. Per ogni metrica, il valore è completo solo se `observed` non è `null` e `turnsWithUsage === modelTurns`; altrimenti indica copertura parziale o assenza di dati. `modelTurns: 0` indica modello non chiamato, non un dato di consumo mancante. Non convertire i `null` in zero e non sommare i subtotali al totale. Non stimare importi senza tariffe esplicite, distinte per modello e direzione.
- **Differenze:** `delta` è selettore meno baseline; `tocViaToolsDelta` è indici via tool meno baseline. Un delta negativo nei token è un risparmio; un delta positivo di accuratezza è un miglioramento (moltiplicare per 100 per esprimerlo in punti percentuali). Le differenze di accuratezza e di risposte corrette sono `null` se la baseline o la variante hanno errori di ricerca o se la variante ha errori di selezione. I delta dei token sono calcolati separatamente per campo e richiedono copertura completa in entrambe le modalità, anche quando c'è un errore: non presentare un delta di una run fallita come risparmio valido.
- **Tempi:** `durationMs` misura la singola ricerca in millisecondi, inclusi selezione e turni dei tool, quando presenti. Non comprende preparazione del corpus e apertura della KB. Se si aggregano le latenze, indicare se si includono le richieste fallite.

### Struttura del report da costruire

1. Una riga per scenario e modalità: documenti, pagine (se disponibili), risposte corrette sul totale, accuratezza, errori di ricerca e di selezione, token input/output/totali con copertura, latenza mediana.
2. Un confronto per scenario con i due delta rispetto alla baseline. Per confrontare l'aumento del corpus, ordinare per `documentCount` e confrontare la stessa modalità tra scenari, senza fondere denominatori o sovrapporre report KB1 e KB2.
3. Un dettaglio per domanda, unendo per `id` tra le modalità dello stesso scenario: atteso, risposta effettiva, fatti mancanti, riferimento atteso, citazioni, tempo e token. Per identificare un esito in tutto il report usare scenario + modalità + `id`.