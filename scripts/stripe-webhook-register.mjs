/**
 * Crea en Stripe el endpoint de webhook del libro (si no existe ya con la misma URL).
 * Usa STRIPE_SECRET_KEY del .env: sk_test_… → modo test, sk_live_… → modo live.
 *
 * Requiere en .env:
 *   STRIPE_WEBHOOK_ENDPOINT_URL=https://tu-dominio/.netlify/functions/stripe-webhook-libro
 *
 * Uso: npm run stripe:webhook:register
 */
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import Stripe from 'stripe';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const key = process.env.STRIPE_SECRET_KEY?.trim();
const url = process.env.STRIPE_WEBHOOK_ENDPOINT_URL?.trim();
const events = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];

if (!key) {
  console.error('Falta STRIPE_SECRET_KEY en .env');
  process.exit(1);
}
if (!url) {
  console.error(
    'Falta STRIPE_WEBHOOK_ENDPOINT_URL en .env.\n' +
      'Ejemplo: STRIPE_WEBHOOK_ENDPOINT_URL=https://marcelaresva.com/.netlify/functions/stripe-webhook-libro',
  );
  process.exit(1);
}
if (!url.includes('/.netlify/functions/stripe-webhook-libro')) {
  console.warn(
    'Aviso: la URL no contiene /.netlify/functions/stripe-webhook-libro — comprueba que sea el endpoint correcto.\n',
  );
}

const stripe = new Stripe(key);

try {
  const list = await stripe.webhookEndpoints.list({ limit: 100 });
  const same = list.data.filter((w) => w.url === url);
  if (same.length > 0) {
    console.log(`Ya hay ${same.length} endpoint(s) en Stripe con esta URL:\n`);
    for (const w of same) {
      console.log(`  id=${w.id}  status=${w.status}`);
    }
    console.log(
      '\nEl signing secret (whsec_…) solo se muestra al crear el endpoint.\n' +
        'Opciones:\n' +
        '  • Stripe Dashboard → Developers → Webhooks → el endpoint → «Reveal» del Signing secret\n' +
        '  • O elimina ese endpoint en el Dashboard y vuelve a ejecutar: npm run stripe:webhook:register\n',
    );
    process.exit(0);
  }

  const created = await stripe.webhookEndpoints.create({
    url,
    enabled_events: events,
    description: 'Marcela Resva — PDF del libro tras checkout (Netlify)',
  });

  if (!created.secret) {
    console.error(
      'Stripe creó el endpoint pero no devolvió `secret` en la respuesta. Copia el Signing secret desde el Dashboard → Webhooks.',
    );
    console.log('Endpoint id:', created.id);
    process.exit(1);
  }

  const mode = key.startsWith('sk_live_') ? 'LIVE' : 'TEST';
  console.log(`\n✓ Endpoint creado (${mode}): ${created.id}\n`);
  console.log('Añade en Netlify → Site settings → Environment variables:\n');
  console.log(`  STRIPE_WEBHOOK_SECRET=${created.secret}\n`);
  console.log('Luego redeploy. En local, usa el whsec_ que muestra `npm run stripe:listen` (no este).\n');
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
