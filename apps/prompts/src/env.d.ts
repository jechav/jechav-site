/// <reference types="astro/client" />

import type { createDB } from './lib/db';
import type { createAuth } from './lib/auth';

declare namespace App {
  interface Locals {
    db: ReturnType<typeof createDB>;
    auth: ReturnType<typeof createAuth>;
    isAuthenticated: boolean;
  }
}
