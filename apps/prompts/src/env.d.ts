/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    db: ReturnType<typeof import('./lib/db').createDB>;
    auth: ReturnType<typeof import('./lib/auth').createAuth>;
    isAuthenticated: boolean;
  }
}
