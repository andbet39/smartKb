const source = (fromLine, toLine = fromLine) => ({ file: 'doc-1/NIST.SP.330-2019.pdf.md', fromLine, toLine });

export const kb2Questions = [
  {
    id: 'si-light-speed',
    question: 'Secondo la brochure SI del NIST, qual è il valore esatto della velocità della luce nel vuoto in metri al secondo?',
    source: source(386),
    facts: [['299 792 458 m/s', /(?<![\d.+−-])299[ .]?792[ .]?458\s*(?:m\s*\/\s*s|m\s*[·⋅]?\s*s\s*\^?\s*[−-]1|metri al secondo)\b/i]],
  },
  {
    id: 'si-cesium-frequency',
    question: 'Qual è la frequenza esatta, in hertz, della transizione iperfine dello stato fondamentale imperturbato del cesio-133 usata per definire il secondo?',
    source: source(406),
    facts: [['9 192 631 770 Hz', /(?<![\d.+−-])9[ .]?192[ .]?631[ .]?770\s*(?:Hz|hertz)\b/i]],
  },
  {
    id: 'si-mole',
    question: 'Nella tabella delle unità di base SI, qual è l’unità della quantità di sostanza e qual è il suo simbolo?',
    source: source(496),
    facts: [['mole', /\bmole\b/i], ['mol', /\bmol\b/i]],
  },
  {
    id: 'si-candela',
    question: 'Nella definizione SI della candela, qual è la frequenza della radiazione monocromatica, in terahertz? Qual è il valore numerico fissato dell’efficacia luminosa, in lumen per watt?',
    source: source(654, 659),
    facts: [
      ['540 THz', /(?<![\d.+−-])540(?:\.0+)?\s*(?:THz|terahertz|[×x*]\s*10\s*\^?\s*\{?12\}?\s*Hz)\b/i],
      ['683 lm/W', /(?<![\d.+−-])683(?:\.0+)?\s*(?:lm\s*\/\s*W|lm\s*[·⋅]?\s*W\s*\^?\s*[−-]1|lumen per watt)\b/i],
    ],
  },
];