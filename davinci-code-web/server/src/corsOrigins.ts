/**
 * Parse CLIENT_ORIGIN env (comma-separated) and normalize for CORS matching.
 */
export function parseClientOrigins(raw: string): string[] {
  return raw
    .split(',')
    .map((part) => normalizeOrigin(part))
    .filter((part) => part.length > 0);
}

export function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

export function isOriginAllowed(requestOrigin: string | undefined, allowed: string[]): boolean {
  if (!requestOrigin) {
    return true;
  }
  return allowed.includes(normalizeOrigin(requestOrigin));
}

export function resolveCorsOrigin(
  isDev: boolean,
  allowed: string[],
): boolean | string[] | ((origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void) {
  if (isDev) {
    return true;
  }
  if (allowed.length === 0) {
    return false;
  }
  if (allowed.length === 1) {
    return allowed;
  }
  return (origin, callback) => {
    if (isOriginAllowed(origin, allowed)) {
      callback(null, true);
      return;
    }
    callback(new Error('Not allowed by CORS'));
  };
}
