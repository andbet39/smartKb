import type { KbErrorCode } from './types.js';

export class KbError extends Error {
  constructor(readonly code: KbErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'KbError';
  }
}