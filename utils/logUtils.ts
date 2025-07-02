export function sanitizeLog(input: unknown): string {
    if (typeof input !== 'string') {
      input = String(input); // convert undefined, null, number, etc.
    }
    return input
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\u001b]/g, ''); // remove ESC character (used in terminal control)
  }
  