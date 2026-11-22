# Sezionamento dei documenti

Il parser divide il Markdown in **sezioni tematiche**, non in blocchi di lunghezza fissa. Le **finestre di analisi** servono solo a far rientrare il testo nel budget delle richieste al modello: una finestra può contenere più sezioni e una sezione può attraversare più finestre o pagine.

## 1. Dal file alle finestre di analisi

Il parser converte il file in Markdown e numera le righe a partire da 1. Per i PDF conserva anche la corrispondenza tra righe e pagine fisiche. Un documento senza testo non produce sezioni e non richiede chiamate al modello.

Ogni finestra contiene il maggior numero possibile di **righe intere consecutive** entro `windowTokens` (4096 token per impostazione predefinita). Nel budget contano anche i numeri di riga, gli eventuali marcatori e il contesto, ma non le istruzioni, lo schema o la risposta del modello. Dalla seconda finestra, il parser prova ad aggiungere fino a 3 righe precedenti come contesto. Se il contesto e la prima riga assegnata non rientrano insieme, il contesto viene scartato. Se neppure una riga numerata da sola rientra, il parsing si interrompe con un errore.

Quando è impostato `sectionSize`, il parser suggerisce punti di chiusura con un `*` accanto al numero di riga. Dopo `minChars`, cerca un punto prima di una riga vuota o di un titolo Markdown, oppure al raggiungimento di `maxChars`. Evita di suggerire tagli dentro blocchi di codice delimitati o tra due righe consecutive che contengono `|`, usate come indizio di una tabella. Le lunghezze sono espresse in unità UTF-16 e sono **indicative**: né i marcatori né `maxChars` obbligano il modello a tagliare in quel punto.

## 2. Come vengono scelti e verificati i confini

Per ogni finestra il modello restituisce uno o più segmenti con intervallo di righe, titolo, sintesi, descrizione breve e parole chiave. Indica inoltre con `continuesPrevious` se il primo segmento prosegue l’ultima sezione della finestra precedente. Le righe di contesto aiutano a decidere, ma non possono essere assegnate a un segmento.

Il parser accetta solo intervalli ordinati che coprono tutte le righe assegnate, senza buchi, sovrapposizioni o sconfinamenti. La prima finestra non può dichiararsi una continuazione. Se la risposta non è valida, il parser riprova una volta indicando il problema. Dopo due risposte non valide, crea una nuova sezione per l’intera finestra e ne chiede una sintesi a partire dal Markdown di quelle righe. Se anche questa sintesi è invalida dopo due tentativi, il parsing fallisce.

## 3. Come si forma la mappa finale

Quando `continuesPrevious` è vero, il parser estende la sezione precedente con il primo segmento della finestra corrente e conserva il titolo originale. Gli altri segmenti diventano nuove sezioni. Per esempio, se una sezione finisce alla riga 40 e la finestra successiva dichiara che le righe 41–55 la continuano, nella mappa compare una sola sezione che termina alla riga 55.

Per le sezioni estese su più finestre, il modello combina sintesi, descrizioni brevi e parole chiave dei frammenti. Dai metadati delle sezioni si ricava anche la sintesi del documento, raggruppando le richieste entro il budget. Se c’è una sola sezione, il parser ne riusa i metadati, salvo che `targetChars.documentSummary` richieda una sintesi dedicata.

Le sezioni finali sono numerate da 1 nell’ordine del documento. Ogni `range` contiene gli estremi inclusivi nel Markdown originale, senza numeri di riga o marcatori aggiunti. Per un PDF, `pageRange` va dalla prima all’ultima pagina che contiene righe della sezione e può includere pagine vuote intermedie. La KB usa questi intervalli per leggere le sezioni senza rieseguire il sezionamento.

**Riferimenti:** [costruzione delle finestre](../src/parser/windows.ts), [analisi e ricomposizione](../src/parser/analysis.ts), [mappa finale](../src/parser/index.ts), [contratto dei servizi](parser-kbmanager.spec.md).