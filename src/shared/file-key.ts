export function validateFileSegment(name: string, label = 'file key'): void {
  if (!name || /[<>:"/\\|?*\x00-\x1f]|[ .]$|[\uD800-\uDFFF]/u.test(name) ||
      /^(?:con|prn|aux|nul|conin\$|conout\$|(?:com|lpt)[1-9¹²³]) *(?:\.|$)/i.test(name) ||
      name.length > 255 || (process.platform !== 'win32' && Buffer.byteLength(name) > 255)) {
    throw new TypeError(`Invalid ${label}: expected a single valid file name`);
  }
}
