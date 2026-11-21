export function createProgressLogger() {
  const start = Date.now();
  let lastUpdate = start;
  let phase = "";
  const write = message => console.error(`[+${((Date.now() - start) / 1000).toFixed(1)}s] ${message}`);
  const timer = setInterval(() => {
    if (phase && Date.now() - lastUpdate >= 15000) write(`In attesa di aggiornamenti: ${phase}`);
  }, 15000);
  timer.unref();
  return {
    log(message) {
      phase = message;
      lastUpdate = Date.now();
      write(message);
    },
    close: () => clearInterval(timer),
  };
}
