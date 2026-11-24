import { randomUUID } from 'node:crypto';
import { lstatSync, mkdirSync, readdirSync, readFileSync, renameSync, rmdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import type { ObjectStore } from '../contracts/interfaces.js';
import { validateFileSegment } from '../shared/file-key.js';

export class LocalObjectStore implements ObjectStore {
  private readonly directory: string;

  constructor(directory: string) {
    if (typeof directory !== 'string' || !directory) throw new TypeError('Expected an object store directory');
    this.directory = resolve(directory);
    mkdirSync(this.directory, { recursive: true });
  }

  async list(prefix = ''): Promise<string[]> {
    const keys: string[] = [];
    function visit(directory: string, parent: string): void {
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const key = parent + entry.name;
        if (entry.isFile() && key.startsWith(prefix)) keys.push(key);
        if (entry.isDirectory() && (key.startsWith(prefix) || prefix.startsWith(`${key}/`))) {
          visit(join(directory, entry.name), `${key}/`);
        }
      }
    }
    visit(this.directory, '');
    return keys.sort();
  }

  async read(key: string): Promise<Uint8Array | undefined> {
    const path = this.filePath(key);
    if (!lstatSync(path, { throwIfNoEntry: false })) return undefined;
    return readFileSync(path);
  }

  async write(key: string, body: Uint8Array): Promise<void> {
    const path = this.filePath(key);
    const directory = dirname(path);
    mkdirSync(directory, { recursive: true });
    const pending = join(directory, `.pending-${randomUUID()}`);
    try {
      writeFileSync(pending, body, { flush: true });
      renameSync(pending, path);
    } finally { rmSync(pending, { force: true }); }
  }

  async delete(key: string): Promise<void> {
    const path = this.filePath(key);
    if (!lstatSync(path, { throwIfNoEntry: false })) return;
    rmSync(path);
    for (let dir = dirname(path); dir !== this.directory && !readdirSync(dir).length; dir = dirname(dir)) {
      rmdirSync(dir);
    }
  }

  close(): void {}

  private filePath(key: string): string {
    let path = this.directory;
    for (const segment of key.split('/')) {
      validateFileSegment(segment);
      path = join(path, segment);
      if (lstatSync(path, { throwIfNoEntry: false })?.isSymbolicLink()) {
        throw new TypeError('Invalid file key: symbolic links are not supported');
      }
    }
    return path;
  }
}
