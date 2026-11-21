---
name: specifica-minima
description: "Genera una specifica Markdown breve da requisiti, appunti o codice. Usala per descrivere il contratto pubblico di un servizio, modulo o tool: metodi, tipi e modello dati solo se necessario."
---

# Specifica minima

Scrivi un solo file Markdown nella lingua della richiesta. Usa il percorso indicato; in sua assenza salva `<nome-componente>.spec.md` nella cartella del progetto. In chat restituisci solo il collegamento al file.

## Contenuto del file

Inizia con `# <Nome del componente>`. Usa solo le sezioni seguenti, in questo ordine; ometti quelle vuote.

- **Metodi di interfaccia**: mostra la firma di ogni metodo in un blocco di codice Markdown delimitato da tre backtick, con l'identificatore del linguaggio sorgente (per esempio `ts` per TypeScript). Mantieni sintassi e nomi pubblici originali, senza il corpo del metodo. Riunisci gli overload nello stesso blocco. Se parti da requisiti senza un linguaggio indicato, usa un blocco `text` con la notazione `nome(parametro: Tipo) -> Risultato`. Sotto il blocco aggiungi, solo se serve, una frase breve sul comportamento osservabile.
- **Tipi**: mostra le definizioni dei tipi non primitivi in blocchi di codice con la stessa convenzione di linguaggio delle firme, mai come elenco di dichiarazioni inline. Definisci ogni tipo una sola volta; raggruppa i tipi correlati e disponi i campi su più righe quando migliora la leggibilità. Conserva la distinzione tra campo facoltativo e valore nullo. Lascia fuori dai blocchi le note sui vincoli.
- **Modello dati**: includilo solo se entità, chiavi o relazioni sono richieste o indispensabili per capire il contratto. Non ripetere campi già descritti nei tipi.

## Regole di sintesi

- Parti dai requisiti forniti o dall'interfaccia pubblica del codice indicato. Non inventare metodi, campi, limiti o valori predefiniti. Se manca un dato che cambia il contratto, chiedi un chiarimento mirato prima di scrivere.
- Conserva i vincoli espliciti con numeri e unità. Non sostituire un limite indicativo con un massimo obbligatorio.
- Escludi introduzioni, architettura, dettagli implementativi, tutorial, esempi d'uso e conclusioni.
- Prima di salvare, elimina ogni frase che ripete una firma o un tipo. Non sacrificare un vincolo del contratto per accorciare il testo.
