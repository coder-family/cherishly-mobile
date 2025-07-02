export function sanitizeLog(input: string): string {
  // Remove newlines and carriage returns
  return input.replace(/[\r\n]+/g, ' ');
} 