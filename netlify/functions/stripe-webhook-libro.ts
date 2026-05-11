import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { loadRepoDotenvIfMissingStripe } from './load-repo-dotenv';
import { loadLibroPdfBuffer } from './resolve-libro-pdf';

loadRepoDotenvIfMissingStripe();

const CHECKOUT_METADATA_PRODUCT = 'ebook_llego_mi_momento';
/** Debe coincidir con `LIBRO_PRICE_USD_CENTS` en create-checkout-session.ts */
const LIBRO_PRICE_USD_CENTS = 844;

function normalizeStripeSecret(raw: string | undefined): string {
  if (!raw) return '';
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function buildEmailHtml(nombre: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>¡Llegó mi momento!</title>
</head>
<body style="margin:0;padding:0;background:#FBF9F6;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FBF9F6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 24px rgba(80,34,70,0.08);">

          <!-- Header dorado -->
          <tr>
            <td style="background:linear-gradient(135deg,#502246 0%,#7B3B6B 100%);padding:40px 40px 32px;text-align:center;">
              <p style="margin:0 0 8px;color:#D4AF37;font-size:11px;letter-spacing:0.25em;text-transform:uppercase;font-family:Arial,sans-serif;">Marcela Resva · Shifting Souls</p>
              <h1 style="margin:0;color:#FFFFFF;font-size:26px;font-weight:700;line-height:1.3;">¡Llegó mi momento!</h1>
              <p style="margin:8px 0 0;color:#E8D5E8;font-size:14px;font-family:Arial,sans-serif;">He decidido reencarnar</p>
            </td>
          </tr>

          <!-- Cuerpo -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:17px;color:#2C242C;line-height:1.7;">
                Hola <strong style="color:#502246;">${nombre}</strong>,
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#4A3A4A;line-height:1.8;">
                Qué alegría saber que este libro llegó a tus manos. No es casualidad — las almas siempre encuentran el camino que necesitan recorrer.
              </p>
              <p style="margin:0 0 20px;font-size:16px;color:#4A3A4A;line-height:1.8;">
                <em>¡Llegó mi momento! He decidido reencarnar</em> nació desde un lugar muy profundo de mi corazón, guiado por la luz del arcángel Miguel y el amor de todas las almas que han decidido venir al mundo.
              </p>
              <p style="margin:0 0 28px;font-size:16px;color:#4A3A4A;line-height:1.8;">
                En estas páginas encontrarás el viaje del alma antes de nacer: su preparación, sus promesas, su amor infinito por ti.
              </p>

              <!-- Bloque descarga -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#FDF6FF;border:1px solid #D4AF37;border-radius:12px;padding:24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:13px;color:#7B3B6B;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">Tu libro digital</p>
                    <p style="margin:0 0 16px;font-size:15px;color:#2C242C;font-family:Arial,sans-serif;">El PDF está adjunto a este correo 🤍</p>
                    <p style="margin:0;font-size:13px;color:#7B3B6B;font-family:Arial,sans-serif;">Ábrelo desde tu dispositivo o guárdalo para leer cuando quieras.</p>
                  </td>
                </tr>
              </table>

              <!-- Separador -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="border-top:1px solid #E8DDE8;"></td>
                </tr>
              </table>

              <!-- Sugerencias -->
              <p style="margin:0 0 16px;font-size:15px;color:#2C242C;font-weight:bold;">Algunas sugerencias para leerlo:</p>
              <table cellpadding="0" cellspacing="0" style="width:100%;">
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#4A3A4A;line-height:1.6;">🌸 Busca un momento tranquilo, solo tuyo.</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#4A3A4A;line-height:1.6;">🤰 Si estás embarazada, puedes leerlo sintiendo a tu bebé cerca.</td>
                </tr>
                <tr>
                  <td style="padding:8px 0;font-size:15px;color:#4A3A4A;line-height:1.6;">✨ Déjate llevar. No hay prisa. Cada capítulo es un regalo.</td>
                </tr>
              </table>

              <!-- Separador -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="border-top:1px solid #E8DDE8;"></td>
                </tr>
              </table>

              <p style="margin:0 0 12px;font-size:15px;color:#4A3A4A;line-height:1.8;">
                Gracias por confiar en este mensaje del alma. Si quieres compartir cómo te llegó el libro, me encantaría saberlo.
              </p>
            </td>
          </tr>

          <!-- Footer firma -->
          <tr>
            <td style="background:#F5EFF5;padding:28px 40px;text-align:center;border-top:1px solid #E8DDE8;">
              <p style="margin:0 0 4px;font-size:16px;color:#502246;font-weight:bold;">Con mucho amor y luz,</p>
              <p style="margin:0 0 2px;font-size:17px;color:#2C242C;font-weight:bold;">Marcela Resva</p>
              <p style="margin:0;font-size:14px;color:#7B3B6B;font-family:Arial,sans-serif;">Shifting Souls 🤍</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildEmailText(nombre: string): string {
  return `Hola ${nombre},

Qué alegría saber que este libro llegó a tus manos. No es casualidad — las almas siempre encuentran el camino que necesitan recorrer.

¡Llegó mi momento! He decidido reencarnar nació desde un lugar muy profundo de mi corazón, guiado por la luz del arcángel Miguel y el amor de todas las almas que han decidido venir al mundo.

En estas páginas encontrarás el viaje del alma antes de nacer: su preparación, sus promesas, su amor infinito por ti.

Tu libro digital está adjunto a este correo como PDF. Ábrelo desde tu dispositivo o guárdalo para leer cuando quieras.

---

Algunas sugerencias para leerlo:

🌸 Busca un momento tranquilo, solo tuyo.
🤰 Si estás embarazada, puedes leerlo sintiendo a tu bebé cerca.
✨ Déjate llevar. No hay prisa. Cada capítulo es un regalo.

---

Gracias por confiar en este mensaje del alma. Si quieres compartir cómo te llegó el libro, me encantaría saberlo.

Con mucho amor y luz,

Marcela Resva
Shifting Souls 🤍`;
}

async function sendBookEmail(email: string, nombre: string): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY?.trim();
  if (!resendKey) {
    throw new Error('Falta RESEND_API_KEY en las variables de entorno');
  }

  const resend = new Resend(resendKey);
  const pdfBuffer = loadLibroPdfBuffer();

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || 'Marcela Resva <hola@marcelaresva.com>',
    to: email,
    subject: '🤍 Tu libro ya está aquí — ¡Llegó mi momento!',
    html: buildEmailHtml(nombre),
    text: buildEmailText(nombre),
    attachments: [
      {
        filename: 'Llego-Mi-Momento-Marcela-Resva.pdf',
        content: pdfBuffer,
      },
    ],
  });

  if (error) {
    throw new Error(`Resend error: ${JSON.stringify(error)}`);
  }
}

function isLibroEbookPurchase(session: Stripe.Checkout.Session): boolean {
  if (session.metadata?.product === CHECKOUT_METADATA_PRODUCT) return true;
  if (
    session.mode === 'payment' &&
    session.currency === 'usd' &&
    session.amount_total === LIBRO_PRICE_USD_CENTS
  ) {
    console.warn('stripe-webhook-libro: metadata ausente o distinta; reconocido por importe USD 8,44', {
      sessionId: session.id,
      metadata: session.metadata,
    });
    return true;
  }
  return false;
}

function resolveBuyerEmail(session: Stripe.Checkout.Session): string | undefined {
  const d = session.customer_details?.email?.trim();
  if (d) return d;
  const ce = session.customer_email?.trim();
  if (ce) return ce;
  const cust = session.customer;
  if (cust && typeof cust === 'object' && !('deleted' in cust)) {
    const em = (cust as Stripe.Customer).email?.trim();
    if (em) return em;
  }
  return undefined;
}

function sessionIsPaid(session: Stripe.Checkout.Session): boolean {
  return session.payment_status === 'paid' || session.payment_status === 'no_payment_required';
}

/**
 * Envía el PDF si la sesión es del ebook, está cobrada y hay email.
 * Pagos asíncronos: la primera vez puede llegar `unpaid`; entonces esperamos `checkout.session.async_payment_succeeded`.
 */
async function tryFulfillLibroPurchase(stripe: Stripe, sessionFromEvent: Stripe.Checkout.Session): Promise<void> {
  let session = sessionFromEvent;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionFromEvent.id, {
      expand: ['customer'],
    });
  } catch (e) {
    console.warn('stripe-webhook-libro: retrieve falló; se usa el objeto del evento', e);
  }

  if (!isLibroEbookPurchase(session)) {
    console.log('stripe-webhook-libro: sesión ignorada (no es ebook libro)', session.id, session.metadata);
    return;
  }

  const email = resolveBuyerEmail(session);
  const nombre =
    session.customer_details?.name?.trim() ||
    (typeof session.customer === 'object' && session.customer && 'name' in session.customer
      ? (session.customer as Stripe.Customer).name?.trim()
      : undefined) ||
    'querida alma';

  console.log('stripe-webhook-libro: ebook detectado', {
    sessionId: session.id,
    email: email || '(sin email)',
    nombre,
    payment_status: session.payment_status,
    amountTotal: session.amount_total,
    metadata: session.metadata,
  });

  if (!sessionIsPaid(session)) {
    console.log(
      'stripe-webhook-libro: aún sin cobro en esta notificación — si es pago diferido, llegará otro evento',
      session.payment_status,
    );
    return;
  }

  if (!email) {
    console.error('stripe-webhook-libro: cobro registrado pero Stripe no devolvió email del comprador', session.id);
    throw new Error('Sesión de checkout sin email del comprador');
  }

  await sendBookEmail(email, nombre);
  console.log(`stripe-webhook-libro: libro enviado a ${email} (${nombre})`);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = normalizeStripeSecret(process.env.STRIPE_SECRET_KEY);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();

  if (!secret) {
    console.error('stripe-webhook-libro: falta STRIPE_SECRET_KEY');
    return { statusCode: 500, body: 'Config error' };
  }

  if (!webhookSecret) {
    console.error('stripe-webhook-libro: falta STRIPE_WEBHOOK_SECRET');
    return { statusCode: 500, body: 'Webhook no configurado' };
  }

  const stripe = new Stripe(secret);
  const sig = event.headers['stripe-signature'];
  if (!sig) {
    return { statusCode: 400, body: 'Missing stripe-signature' };
  }

  let stripeEvent: Stripe.Event;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body || '', sig, webhookSecret);
  } catch (err) {
    console.error('stripe-webhook-libro: firma inválida', err);
    return { statusCode: 400, body: 'Invalid signature' };
  }

  const libroCheckoutEvents = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'] as const;

  if ((libroCheckoutEvents as readonly string[]).includes(stripeEvent.type)) {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;
    try {
      await tryFulfillLibroPurchase(stripe, session);
    } catch (err) {
      console.error('stripe-webhook-libro: fallo al enviar el libro (Stripe reintentará si respondemos 500)', err);
      return {
        statusCode: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ received: false, error: err instanceof Error ? err.message : 'unknown' }),
      };
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
