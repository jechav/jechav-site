import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const apiDir = join(import.meta.dirname, 'api');

describe('prompt API routes', () => {
  it('uses Astro dynamic route directories for prompt IDs', () => {
    expect(existsSync(join(apiDir, 'prompts', '[id].ts'))).toBe(true);
  });

  it('resolves shared API helpers from nested prompt action routes', () => {
    for (const action of ['restore.ts', 'permanent-delete.ts']) {
      const route = readFileSync(join(apiDir, 'prompts', '[id]', action), 'utf8');

      expect(route).toContain("from '../../../../lib/auth'");
      expect(route).toContain("from '../../../../lib/db'");
    }
  });
});
