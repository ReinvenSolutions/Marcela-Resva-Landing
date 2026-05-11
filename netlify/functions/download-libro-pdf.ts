import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { loadRepoDotenvIfMissingStripe } from './load-repo-dotenv';
import { loadLibroPdfBuffer } from './resolve-libro-pdf';

loadRepoDotenvIfMissingStripe();

/** Igual que en create-checkout-session.ts y stripe-webhook-libro.ts */
const CHECKOUT_METADATA_PRODUCT = 'ebook_llego_mi_momento';
const LIBRO_PRICE_USD_CENTS = 844;

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' } as const;

function normalizeStripeSecret(raw: string | undefined): string {
  if (!raw) return '';
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function isLibroEbookPurchase(session: Stripe.Checkout.Session): boolean {
  if (session.metadata?.product === CHECKOUT_METADATA_PRODUCT) return true;
  if (
    session.mode === 'payment' &&
    session.currency === 'usd' &&
    session.amount_total === LIBRO_PRICE_USD_CENTS
  ) {
    return true;
  }
  return false;
}

function sessionAllowsDownload(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
}

/**
 * GET ?session_id=cs_… — Valida el pago en Stripe y devuelve JSON con el PDF en base64.
 * (Así evitamos que el emulador local no decodifique `isBase64Encoded` y el navegador guarde un PDF corrupto.)
 */
export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'HEAD') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = normalizeStripeSecret(process.env.STRIPE_SECRET_KEY);
  if (!secret) {
    console.error('download-libro-pdf: falta STRIPE_SECRET_KEY');
    return {
      statusCode: 503,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'Servicio no configurado' }),
    };
  }

  const sessionId = event.queryStringParameters?.session_id?.trim();
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return {
      statusCode: 400,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'Parámetro session_id inválido o ausente.' }),
    };
  }

  const stripe = new Stripe(secret);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (e) {
    console.error('download-libro-pdf: retrieve session', e);
    return {
      statusCode: 404,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'No se encontró la sesión de pago.' }),
    };
  }

  if (!isLibroEbookPurchase(session)) {
    return {
      statusCode: 403,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'Esta sesión no corresponde al ebook.' }),
    };
  }

  if (!sessionAllowsDownload(session)) {
    return {
      statusCode: 403,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'El pago de esta sesión aún no está confirmado.' }),
    };
  }

  if (event.httpMethod === 'HEAD') {
    return {
      statusCode: 200,
      headers: { ...JSON_HEADERS, 'Cache-Control': 'private, no-store' },
      body: '',
    };
  }

  let pdf: Buffer;
  try {
    pdf = loadLibroPdfBuffer();
  } catch (e) {
    console.error('download-libro-pdf: leer PDF', e);
    return {
      statusCode: 500,
      headers: JSON_HEADERS,
      body: JSON.stringify({ message: 'No se pudo cargar el archivo del libro.' }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      ...JSON_HEADERS,
      'Cache-Control': 'private, no-store',
    },
    body: JSON.stringify({
      filename: 'Llego-Mi-Momento-Marcela-Resva.pdf',
      pdfBase64: pdf.toString('base64'),
    }),
  };
};
