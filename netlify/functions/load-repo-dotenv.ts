import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';

let attempted = false;

/**
 * Con `npm run dev` + @netlify/vite-plugin, el proceso de las funciones a veces recibe
 * solo parte de las variables (p. ej. Stripe) pero no RESEND ni el .env completo.
 * Cargamos el `.env` de la raíz del repo si falta cualquiera de las claves críticas.
 * `override: false` no pisa variables ya inyectadas por Netlify/Vite.
 */
export function loadRepoDotenvIfMissingStripe(): void {
  if (attempted) return;

  const hasStripe = Boolean(process.env.STRIPE_SECRET_KEY?.trim());
  const hasResend = Boolean(process.env.RESEND_API_KEY?.trim());
  const hasWebhook = Boolean(process.env.STRIPE_WEBHOOK_SECRET?.trim());

  if (hasStripe && hasResend && hasWebhook) {
    attempted = true;
    return;
  }

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
