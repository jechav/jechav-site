import { createHmac, timingSafeEqual } from 'node:crypto';

const HMAC_PURPOSE = 'session-v1';

export function createAuth(password: string) {
  function hmac(data: string): string {
    return createHmac('sha256', password).update(data).digest('hex');
  }

  function isValidPassword(input: string): boolean {
    // Timing-safe comparison to prevent timing attacks
    const expected = Buffer.from(hmac(password));
    const actual   = Buffer.from(hmac(input));
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual) && input === password;
  }

  function sessionToken(): string {
    return hmac(HMAC_PURPOSE);
  }

  function isValidToken(token: string): boolean {
    const expected = Buffer.from(sessionToken());
    const actual   = Buffer.from(token);
    if (expected.length !== actual.length) return false;
    return timingSafeEqual(expected, actual);
  }

  return { isValidPassword, sessionToken, isValidToken };
}
