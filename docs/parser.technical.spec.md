# Specifica tecnica — Parser documentale

> **Superata.** Descrive l’API precedente a [KB Store](kbstore.technical.spec.md) (persistenza su cartelle, `tocMode`, selettore, nomi `kbFile*`, campi snake_case). Va riscritta.

Le voci **Enhancement** sono proposte. Il [contratto storico del parser](parser-kbmanager.spec.md#parser) conserva i precedenti nomi dell’API; per la persistenza attuale si veda [KB Store](kbstore.technical.spec.md).

## 1. Responsabilità, configurazione e ciclo di vita

Il parser trasforma byte già in memoria in un `ParsedDocument`: Markdown normalizzato, mappa semantica e, per i PDF, mappa delle pagine fisiche. Non apre il percorso indicato da `fileName` e non persiste automaticamente il risultato. Il flusso è: assegnazione dell’ID → conversione locale → segmentazione e sintesi tramite modello → calcolo delle coordinate → eventuale esportazione o persistenza a cura del chiamante.

`DocumentInput.documentId` è facoltativo. Il parser conserva un ID esplicito valido oppure, se omesso, genera un UUID v7. Il tipo pubblico `DocumentId` è `string | number`: una stringa deve essere un UUID v7 canonico in minuscolo; un ID numerico legacy deve essere un intero sicuro non negativo. Lo stesso ID è usato in `map.documentId` e negli eventi di avanzamento.

La factory richiede un modello con `withStructuredOutput` e un contatore `countTokens`. Configura tre operazioni strutturate per segmentazione, sintesi di sezione e sintesi del documento. `windowTokens` vale 4096 per default; se presente deve essere un intero positivo sicuro. Lo stesso vincolo vale per i singoli valori di `targetChars`. La configurazione è validata alla creazione; `sectionSize`, invece, è validato per input, con `minChars ≤ maxChars`. Gli errori durante il parsing sono incapsulati in `DocumentParseError` con ID e causa. `parseDocuments` procede in ordine, in sequenza, e rigetta al primo errore senza restituire risultati parziali. `onProgress` è un callback sincrono facoltativo che riceve un `DocumentParseProgress` strutturato (fase `conversion` → `segmentation` → `sections` → `overview` → `completed`, avanzamento `current`/`total`/`phasePercent`, percentuale complessiva `percent` monotona 0–100, posizione `batch` nei parse multipli e `message` descrittivo); non c'è un protocollo di cancellazione. Un documento con zero righe non invoca i runner del modello e ottiene una mappa con sintesi e descrizione vuote, senza keyword né sezioni.

**Considerazioni.** Il tokenizer deve essere coerente con il modello scelto. La conversione resta locale, ma finestre e sintesi sono inviate al modello configurato: l'OCR locale non rende privata l'intera pipeline.

**Enhancement.** Introdurre per prima cosa `AbortSignal`, timeout per fase e diagnostica strutturata (fase, righe o pagina, durata, causa). Se serve import massivo, aggiungere un'API separata con concorrenza limitata ed esito per documento, senza cambiare il comportamento fail-fast esistente.

Riferimenti: [orchestrazione e API](../src/parser/index.ts), [tipi ed errori](../src/parser/types.ts), [configurazione dell'analisi](../src/parser/analysis.ts).

## 2. Conversione e OCR

Il formato è rilevato prima dai byte e poi dal nome come fallback. Se non riconosciuto, il parsing fallisce. AnyDoc converte direttamente i formati non PDF; il parser normalizza CRLF e CR a LF e rimuove i newline finali. Il testo non viene altrimenti ripulito o impaginato dal parser.

Per un PDF, `pdf-lib` visita le pagine nell'ordine originale e copia ogni pagina da elaborare in un PDF isolato. Se la pagina non ha né contenuto PDF né annotazioni, viene registrata con `range: null` senza aggiungere righe. Per le altre pagine, AnyDoc prova l'estrazione nativa con OCR disabilitato. Il riconoscimento locale interviene se il testo nativo è vuoto o bianco, oppure se AnyDoc segnala `needsOcr` o il caso previsto `ImageBased`. Gli altri errori di estrazione non attivano l'OCR. Se la pagina elaborata non produce testo leggibile, il parser fallisce con un errore che identifica la pagina: non la tratta come una pagina strutturalmente vuota.

PDFium rasterizza la singola pagina in memoria, a una scala nominale di 300 DPI limitata a 3600 pixel sul lato lungo. Tesseract usa il modello italiano incluso nelle dipendenze, in modalità LSTM. L'inizializzazione è differita al primo fallback; il worker è riusato nel PDF e chiuso a fine conversione, anche in caso di errore. I progressi indicano la pagina e le fasi di rendering e riconoscimento. I testi delle pagine non vuote vengono uniti con un solo LF; non si aggiunge un separatore di pagina al testo canonico.

**Considerazioni.** Basta testo nativo non bianco per saltare l'OCR: una pagina mista può perdere testo presente soltanto nella parte raster. L'OCR restituisce testo, non una ricostruzione affidabile della struttura di tabelle o colonne. La conversione sequenziale limita il numero di pagine elaborate insieme, ma documento, immagini elaborate e Markdown sono gestiti in memoria.

**Enhancement.** Rendere configurabili lingua, politica per pagine illeggibili e soglia di fallback per pagine miste. Prima di cambiare i default, misurare qualità testuale, tempo e picco di memoria su PDF nativi, scansionati, misti e multilingue; una modalità tollerante dovrebbe esplicitare quali pagine sono state omesse.

Riferimenti: [conversione e fallback](../src/parser/convert.ts), [rendering e worker OCR](../src/parser/ocr.ts).

## 3. Finestre, segmentazione e sintesi

1. **Finestre.** Il Markdown è diviso in righe. Ogni riga del payload è numerata; alla finestra si antepongono fino a tre righe precedenti di solo contesto. Se il blocco di contesto non entra con la prima riga assegnata, viene rimosso per intero. Si aggiungono righe consecutive finché il payload numerato rientra nel budget. Una riga numerata che non entra da sola produce un errore. Il budget include prefissi, separatori e contesto del payload, non istruzioni, schema o risposta.
2. **Confini suggeriti.** Solo con `sectionSize`, il parser propone fine sezione dopo `minChars` se segue una riga vuota, un titolo ATX o si raggiunge `maxChars`. La scansione evita fence e confini tra due righe consecutive contenenti `|`; è un'euristica, non un parser Markdown. I suggerimenti sono marcati con `*`. Le dimensioni sono indicative, in unità UTF-16, e non vengono imposte all'output.
3. **Partizione.** Per ogni finestra il modello dà un titolo, un intervallo e metadati semantici per ciascun frammento. La validazione locale richiede copertura esatta delle righe assegnate, in ordine, senza buchi né sovrapposizioni; una sezione di una riga è valida. Solo dalla seconda finestra il modello può dichiarare che il primo frammento continua l'ultima sezione precedente. Gli schemi inviati al provider omettono alcuni vincoli non supportati da Azure, che vengono riapplicati localmente con Zod.
4. **Recupero.** Un output strutturato non valido provoca una seconda richiesta con il problema di validazione. Dopo due esiti non validi, il parser sintetizza le righe originali della finestra come una sezione unica, usa la descrizione breve come titolo e non la collega alla sezione precedente. Se la seconda risposta di sintesi non è valida, il parsing fallisce. Un'eccezione lanciata da `invoke` non attiva questi tentativi applicativi né il fallback: risale come errore di parsing.
5. **Ricomposizione.** Se il primo frammento continua la sezione precedente, ne estende il range e mantiene il titolo originale. Le sintesi dei frammenti vengono combinate a più livelli: ogni gruppo è composto da oggetti JSON separati da LF e deve rientrare nel budget. La riduzione fallisce se un singolo elemento è troppo grande o se un livello non riduce più il numero di elementi. Un unico frammento passa invariato. La sintesi del documento deriva dalle sintesi di sezione: con una sola sezione viene riusata, salvo `targetChars.documentSummary` esplicito, che forza una riscrittura. Nessun target tronca l'output.

**Considerazioni.** Copertura e coordinate sono validate, qualità semantica e aderenza delle sintesi al sorgente no. Variabilità del modello e confini delle finestre possono cambiare titoli, ordine degli ID rispetto a parse precedenti e livello di dettaglio. Il conteggio ripetuto di payload crescenti e le richieste sequenziali pesano sui documenti lunghi. Le istruzioni chiedono di trattare il testo come dati, non garantiscono che il modello lo faccia.

**Enhancement.** Misurare frequenza dei fallback, latenza e token per fase; usare una riserva esplicita per istruzioni e risposta. Per righe eccezionalmente lunghe, valutare frammenti interni con mappatura alla riga originale, senza cambiare l'unità delle citazioni. Confrontare l'euristica corrente con confini ottenuti da una struttura Markdown, misurando copertura e stabilità su corpus fisso prima di modificare la segmentazione.

Riferimenti: [finestre](../src/parser/windows.ts), [schema, retry e riduzione](../src/parser/analysis.ts), [nota sul sezionamento](sezionamento-documenti.md).

## 4. Coordinate, indici ed esportazione

Le coordinate canoniche sono inclusive e partono da 1. `id` e `order` delle sezioni sono assegnati nell'ordine del testo a partire da 1 e sono locali al documento. `tokens` conta il testo della sezione, senza numerazione né marcatori; `totalTokens` è il conteggio dell'intero Markdown, ripetuto in ciascuna sezione. Il `pageRange` va dalla prima all'ultima pagina con testo che interseca la sezione e può quindi attraversare pagine vuote. `pages` e `pageRange` non sono generati per gli altri formati. Il nome originale è ridotto al basename, incluse le convenzioni Windows; titolo globale, autore, tipo e tag sono supportati dallo schema ma non popolati dalla pipeline corrente.

`getDocumentTableOfContents` proietta gli ID e le descrizioni senza nuove richieste. `getSectionMarkdown` legge il range per ID e può inserire il tag di ogni pagina che interseca il passaggio, al primo punto citabile nella sezione. `saveDocumentMarkdown` sovrascrive la destinazione UTF-8, marcando tutte le pagine fisiche, anche vuote, ed eventualmente le sezioni. L'export annotato non è il Markdown canonico: le coordinate non vanno applicate alle sue righe fisiche.

**Enhancement.** Conservare nel manifest una revisione del documento e la provenienza di conversione, modello e tokenizer; non promettere ID di sezione stabili tra revisioni. Se l'export annotato serve a un editor, produrre una mappa esplicita tra righe della vista e righe canoniche.

Riferimento: [mappatura ed esportazione](../src/parser/index.ts).

## 5. Persistenza e integrità

Nel flusso attuale, il chiamante passa il `ParsedDocument` a `KbStore.add`, che usa `map.documentId` e rifiuta i duplicati. Non serve prenotare o rilasciare un ID prima o dopo il parsing.

### Persistenza storica (prima di KB Store)

`persist` crea la cartella e scrive prima il Markdown grezzo e poi il manifest `{ map, pages? }`. Con un nome noto aggiunge i suffissi `.md` e `.json` dopo il nome completo; senza nome usa `document.md` e `metadata.json`. `load` legge `metadata.json` se presente, altrimenti l'unico manifest regolare con suffisso `.json`; se ne trova più di uno senza quello legacy, fallisce. Il Markdown legacy `document.md` è il fallback se il percorso nominato manca (`ENOENT`), non se la lettura fallisce per un'altra causa.

La validazione verifica forma del manifest, range ordinati e positivi, limiti di riga rispetto a `lineCount` e unicità degli ID di sezione. Non verifica invece continuità e non sovrapposizione delle sezioni, coerenza tra `pageRange` e `pages` o parità del conteggio con il Markdown durante `load`. Le due scritture non sono atomiche e nomi uguali nella stessa cartella collidono.

**Enhancement prioritario.** Usare un manifest versionato con riferimento esplicito a un Markdown immutabile e relativo hash; pubblicare il manifest con sostituzione atomica solo dopo aver scritto il testo. Definire migrazione legacy e validazione incrociata. Test di accettazione: scrittura interrotta, stessi nomi e stesso numero di righe con testo alterato.

Riferimento: [persistenza e validazione](../src/parser/persistence.ts).

## 6. Verifica e ordine degli interventi

I [test del parser](../test/parser.test.mjs) coprono round trip, marcatori, pagine vuote e sezioni multipagina, recupero dei buchi, fusioni tra finestre, target indicativi, OCR italiano e fallimento prima dell'inferenza su input non elaborabili. I test con risposta simulata verificano la struttura, non la fedeltà delle sintesi reali.

Ordine proposto: **P1** integrità del salvataggio e diagnostica per fase; **P2** budget effettivo del provider e comportamento su righe lunghe; **P3** OCR configurabile e miglioramento della segmentazione, guidati da benchmark riproducibili.