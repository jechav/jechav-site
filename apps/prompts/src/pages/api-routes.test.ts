import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const apiDir = join(import.meta.dirname, 'api');

describe('prompt API routes', () => {
  it('uses Astro dynamic route directories for prompt IDs', () => {
    expect(existsSync(join(apiDir, 'prompts', '[id].ts'))).toBe(true);
  });
});
