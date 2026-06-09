import { describe, it, expect } from 'vitest';
import { createAuth } from './auth';

describe('createAuth', () => {
  const auth = createAuth('super-secret');

  it('accepts the correct password', () => {
    expect(auth.isValidPassword('super-secret')).toBe(true);
  });

  it('rejects a wrong password', () => {
    expect(auth.isValidPassword('wrong')).toBe(false);
  });

  it('accepts the session token it generated', () => {
    expect(auth.isValidToken(auth.sessionToken())).toBe(true);
  });

  it('rejects a tampered token', () => {
    expect(auth.isValidToken('tampered-token')).toBe(false);
  });
});
