/**
 * stripe-check — endpoint de diagnóstico (solo disponible en desarrollo / local)
 * GET /.netlify/functions/stripe-check
 * Verifica que STRIPE_SECRET_KEY sea válida sin cobrar nada.
 */
import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { loadRepoDotenvIfMissingStripe } from './load-repo-dotenv';

loadRepoDotenvIfMissingStripe();

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS_HEADERS, body: '' };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const pubKey = process.env.VITE_STRIPE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY;

  const resendKey = process.env.RESEND_API_KEY?.trim();
  const result: Record<string, unknown> = {
    STRIPE_SECRET_KEY: secret ? `${secret.slice(0, 12)}…(${secret.length} chars)` : 'FALTA',
    VITE_STRIPE_PUBLISHABLE_KEY: pubKey ? `${pubKey.slice(0, 12)}…(${pubKey.length} chars)` : 'FALTA',
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET
      ? `${process.env.STRIPE_WEBHOOK_SECRET.slice(0, 12)}…`
      : 'FALTA',
    RESEND_API_KEY: resendKey ? `${resendKey.slice(0, 6)}…(${resendKey.length} chars)` : 'FALTA (sin esto, el PDF no sale por Resend)',
    RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL?.trim() || '(opcional; hay valor por defecto en código)',
  };

  if (!secret) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, error: 'Falta STRIPE_SECRET_KEY', ...result }),
    };
  }

  try {
    const stripe = new Stripe(secret);
    const balance = await stripe.balance.retrieve();
    result.stripeKeyValid = true;
    result.liveMode = balance.livemode;
    result.keyMode = secret.startsWith('sk_live_') ? 'LIVE' : secret.startsWith('sk_test_') ? 'TEST' : 'DESCONOCIDO';
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    result.stripeKeyValid = false;
    result.error = msg;
    if (err instanceof Stripe.errors.StripeAuthenticationError) {
      result.fix =
        'La clave es INVÁLIDA o fue revocada. Ve a Stripe Dashboard → Developers → API Keys → Reveal secret key → cópiala de nuevo y actualiza STRIPE_SECRET_KEY en tu .env';
    }
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({ ok: false, ...result }),
    };
  }
};
