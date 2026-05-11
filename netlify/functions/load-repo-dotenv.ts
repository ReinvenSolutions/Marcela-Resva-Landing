import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';

let attempted = false;

/**
 * Con `npm run dev` + @netlify/vite-plugin, el proceso de las funciones a veces no
 * recibe el `.env` de la raíz del repo en `process.env`.
 * Subimos desde `process.cwd()` hasta encontrar un `.env` (sin `import.meta.url`,
 * el bundler local puede emitir CJS y dejaría `import.meta` vacío).
 * En Netlify producción `STRIPE_SECRET_KEY` ya viene definida: no leemos archivos.
 */
export function loadRepoDotenvIfMissingStripe(): void {
  if (process.env.STRIPE_SECRET_KEY) return;
  if (attempted) return;
  attempted = true;

  const seen = new Set<string>();
  let dir = process.cwd();
  for (let i = 0; i < 12; i++) {
    const envPath = resolve(dir, '.env');
    if (!seen.has(envPath) && existsSync(envPath)) {
      config({ path: envPath, override: false });
      return;
    }
    seen.add(envPath);
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
}
