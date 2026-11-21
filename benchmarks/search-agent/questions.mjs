const and = 'and.pdf.md';
const stm32 = 'DS_CD00237391.pdf.md';
const xor = 'xor.pdf.md';
const stm8 = 'doc-3/STM8L050J3.pdf.md';
const npw = 'doc-5/NPW App.pptx.md';

function quantity(value, units) {
  return new RegExp(String.raw`(?<![\w.+−-])${value}(?:\.0+)?\s*(?:${units})(?![\w%])`, 'i');
}

export const questions = [
  {
    id: 'and-vcc',
    question: 'Secondo le condizioni operative raccomandate del DM7408, qual è il valore nominale della tensione di alimentazione VCC?',
    source: { file: and, fromLine: 41, toLine: 43 },
    facts: [['5 V', quantity(5, 'v|volt')]],
  },
  {
    id: 'and-tphl',
    question: 'Nel datasheet del DM7408, qual è il ritardo di propagazione massimo tPHL (uscita da HIGH a LOW) a VCC = 5 V e TA = 25 °C?',
    source: { file: and, fromLine: 79, toLine: 85 },
    facts: [['19 ns', quantity(19, 'ns|nanosecond[io]|nanoseconds?')]],
  },
  {
    id: 'stm32-clock',
    question: 'Qual è la frequenza massima della CPU Cortex-M3 dello STM32F205xx indicata nel datasheet?',
    source: { file: stm32, fromLine: 15, toLine: 15 },
    facts: [['120 MHz', quantity(120, 'mhz|megahertz')]],
  },
  {
    id: 'stm32-sram',
    question: 'Nella tabella delle varianti STM32F205Rx, qual è la capacità minima della SRAM di sistema (SRAM1 + SRAM2), senza contare la SRAM di backup?',
    source: { file: stm32, fromLine: 489, toLine: 495 },
    facts: [['64 Kbyte', quantity(64, 'k(?:i?b|bytes?)|kilobytes?')]],
  },
  {
    id: 'xor-gates',
    question: 'Quante porte XOR indipendenti a due ingressi contiene l’integrato SN74HC86?',
    source: { file: xor, fromLine: 370, toLine: 370 },
    facts: [['4 porte', /\b(?:4|quattro|four)\b(?![.,]\d)(?=\s*(?:[-–:,.!\n]|porte?\b|gates?\b|xor\b|indipendenti\b|in totale\b|$))/i]],
  },
  {
    id: 'xor-vcc',
    question: 'Qual è l’intervallo della tensione di alimentazione operativa dichiarato per SN74HC86? Indica minimo e massimo.',
    source: { file: xor, fromLine: 22, toLine: 22 },
    facts: [['da 2 V a 6 V', /(?<![\w.+−-])2(?:\.0+)?\s*(?:v(?:olt)?\s*)?(?:[–—−-]|\.{2,3}|a\b|e\b|to\b|[,;]\s*(?:e\s+)?massimo\s*:?\s*)\s*6(?:\.0+)?\s*v(?:olt)?\b/i]],
  },
  {
    id: 'stm8-flash',
    question: 'Quanta memoria Flash integrata ha il microcontrollore STM8L050J3?',
    source: { file: stm8, fromLine: 244, toLine: 244 },
    facts: [['8 Kbyte', quantity(8, 'k(?:i?b|bytes?)|kilobytes?')]],
  },
  {
    id: 'stm8-clock-ram',
    question: 'Quali sono la frequenza massima della CPU e la capacità della RAM dello STM8L050J3?',
    source: { file: stm8, fromLine: 277, toLine: 284 },
    facts: [['16 MHz', quantity(16, 'mhz|megahertz')], ['1 Kbyte', quantity(1, 'k(?:i?b|bytes?)|kilobytes?')]],
  },
  {
    id: 'npw-ooe',
    question: 'Nell’Analysis Page della NPW App, a quanto è fissata la soglia del tasso out of envelope (OOE%) usata nel Variable Chart?',
    source: { file: npw, fromLine: 137, toLine: 148 },
    facts: [['20%', quantity(20, String.raw`%|percento|per\s+cento|percent`)]],
  },
  {
    id: 'npw-criticality',
    question: 'Quali sono tutti gli stati ammessi nella colonna Criticality della Variable Table nell’Analysis Page della NPW App? Includi anche l’eventuale stato non definito.',
    source: { file: npw, fromLine: 129, toLine: 129 },
    facts: [
      ...['C1', 'C2', 'C3', 'C4'].map(state => [state, new RegExp(`\\b${state}\\b`, 'i')]),
      ['undefined', /\b(?:undefined|non definit[oa])\b/i],
    ],
  },
  {
    id: 'npw-ooe-context',
    question: 'Nel Variable Chart della NPW App, parti da «Req *39»: qual è la soglia OOE e come si chiamano le due categorie sopra soglia, rispettivamente senza e con commenti?',
    source: { file: npw, fromLine: 146, toLine: 148 },
    facts: [
      ['20%', quantity(20, String.raw`%|percento|per\s+cento|percent`)],
      ['bad without justification', /\bbad\s+(?:without\s+justification|senza\s+giustificazion[ei])\b/i],
      ['bad with justification', /\bbad\s+(?:with\s+justification|con\s+giustificazion[ei])\b/i],
    ],
  },
];

export function grade(answer, facts) {
  const text = answer.normalize('NFKC').replace(/[*_`]/g, '').replace(/(\d),(?=\d)/g, '$1.');
  return facts.filter(([, pattern]) => !pattern.test(text)).map(([label]) => label);
}