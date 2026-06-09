import { getViteConfig } from 'astro/config';

// getViteConfig is designed to accept Vitest config but types don't reflect it
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default getViteConfig({ test: { environment: 'node' } } as any);
