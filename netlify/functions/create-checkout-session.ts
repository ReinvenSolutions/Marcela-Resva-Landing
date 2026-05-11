import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { loadRepoDotenvIfMissingStripe } from './load-repo-dotenv';

loadRepoDotenvIfMissingStripe();

/** USD 8.44 — mismo precio acordado para el ebook */
const LIBRO_PRICE_USD_CENTS = 844;
const CHECKOUT_METADATA_PRODUCT = 'ebook_llego_mi_momento';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function resolveSiteOrigin(event: Parameters<Handler>[0], bodyOrigin: unknown): string | null {
  if (typeof bodyOrigin === 'string') {
    const o = bodyOrigin.trim().replace(/\/$/, '');
    if (
      o.startsWith('https://') ||
      o.startsWith('http://localhost') ||
      o.startsWith('http://127.0.0.1')
    ) {
      return o;
    }
  }
  const fromEnv = (process.env.URL || process.env.DEPLOY_PRIME_URL || '').trim().replace(/\/$/, '');
  if (fromEnv.startsWith('http')) return fromEnv;
  const host = event.headers.host || event.headers['x-forwarded-host'];
  const proto = event.headers['x-forwarded-proto'] || 'https';
  if (host) {
    return `${proto}://${host}`.replace(/\/$/, '');
  }
  return null;
}

function stripeErrorMessage(err: unknown): { message: string; hint?: string } {
  if (err instanceof Stripe.errors.StripeAuthenticationError) {
    return {
      message: 'La clave secreta de Stripe es inválida o fue revocada.',
      hint: 'Ve a Stripe Dashboard → Developers → API Keys y regenera la clave. Luego actualiza STRIPE_SECRET_KEY en tu .env (local) y en Netlify → Site settings → Environment variables (producción).',
    };
  }
  if (err instanceof Stripe.errors.StripeInvalidRequestError) {
    return { message: `Parámetro inválido en la solicitud a Stripe: ${err.message}` };
  }
  if (err instanceof Stripe.errors.StripeConnectionError) {
    return { message: 'No se pudo conectar con Stripe. Verifica tu conexión a internet.' };
  }
  if (err instanceof Error) {
    return { message: err.message };
  }
  return { message: 'Error desconocido al crear la sesión de pago.' };
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: CORS_HEADERS, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    console.error('create-checkout-session: falta STRIPE_SECRET_KEY en las variables de entorno');
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Stripe no está configurado en el servidor.',
        hint: 'Agrega STRIPE_SECRET_KEY=sk_... en tu archivo .env (local) o en Netlify → Site settings → Environment variables.',
      }),
    };
  }

  let bodyOrigin: unknown;
  let checkoutMode: 'embedded' | 'hosted' = 'embedded';
  try {
    const parsed = JSON.parse(event.body || '{}') as { origin?: unknown; mode?: string };
    bodyOrigin = parsed.origin;
    if (parsed.mode === 'hosted') checkoutMode = 'hosted';
  } catch {
    bodyOrigin = undefined;
  }

  const origin = resolveSiteOrigin(event, bodyOrigin);
  if (!origin) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'No se pudo determinar la URL del sitio.',
        hint: 'El POST debe incluir { "origin": "https://tudominio.com" } o define la variable URL en Netlify.',
      }),
    };
  }

  const stripe = new Stripe(secret);

  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
    {
      quantity: 1,
      price_data: {
        currency: 'usd',
        unit_amount: LIBRO_PRICE_USD_CENTS,
        product_data: {
          name: 'Ebook: ¡Llegó mi momento! He decidido reencarnar',
          description: 'Descarga digital (PDF por correo electrónico).',
        },
      },
    },
  ];

  const baseSession: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    metadata: { product: CHECKOUT_METADATA_PRODUCT },
    line_items: lineItems,
    customer_creation: 'always',
    automatic_tax: { enabled: false },
  };

  try {
    const session =
      checkoutMode === 'embedded'
        ? await stripe.checkout.sessions.create({
            ...baseSession,
            ui_mode: 'embedded',
            return_url: `${origin}/libro/gracias?session_id={CHECKOUT_SESSION_ID}`,
          })
        : await stripe.checkout.sessions.create({
            ...baseSession,
            success_url: `${origin}/libro/gracias?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/libro`,
          });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        clientSecret: session.client_secret ?? undefined,
        url: session.url ?? undefined,
      }),
    };
  } catch (err: unknown) {
    console.error('create-checkout-session error:', err);
    const { message, hint } = stripeErrorMessage(err);
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message, hint }),
    };
  }
};
