export function normalizeVector(vector: number[], dimensions: number): Float32Array {
  if (vector.length !== dimensions || !vector.every(Number.isFinite)) {
    throw new TypeError('Embedding does not match the configured dimensions');
  }
  const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0));
  if (!Number.isFinite(norm) || norm === 0) throw new TypeError('Embedding must have a finite non-zero norm');
  return Float32Array.from(vector, value => value / norm);
}