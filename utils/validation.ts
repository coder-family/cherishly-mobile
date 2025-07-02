export function isValidRecordingId(id: string): boolean {
  return typeof id === 'string' && /^recording_\d+_[a-z0-9]+$/.test(id);
} 