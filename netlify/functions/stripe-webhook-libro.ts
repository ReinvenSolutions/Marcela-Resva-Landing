import type { Handler } from '@netlify/functions';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const CHECKOUT_METADATA_PRODUCT = 'ebook_llego_mi_momento';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    throw new Error('Falta RESEND_API_KEY en las variables de entorno');
  }

  const resend = new Resend(resendKey);

  const pdfPath = join(__dirname, 'assets', 'LLEGO_MI_MOMENTO_DIGITAL.pdf');
  const pdfBuffer = readFileSync(pdfPath);

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

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object as Stripe.Checkout.Session;

    if (session.metadata?.product !== CHECKOUT_METADATA_PRODUCT) {
      console.log('stripe-webhook-libro: sesión ignorada (producto distinto)', session.id);
    } else {
      const email = session.customer_details?.email || session.customer_email || undefined;
      const nombre = session.customer_details?.name || 'querida alma';
      const paid = session.payment_status === 'paid';

      console.log('stripe-webhook-libro: compra ebook', {
        sessionId: session.id,
        email: email || '(sin email)',
        nombre,
        paid,
        amountTotal: session.amount_total,
      });

      if (paid && email) {
        try {
          await sendBookEmail(email, nombre);
          console.log(`stripe-webhook-libro: libro enviado a ${email} (${nombre})`);
        } catch (err) {
          console.error('stripe-webhook-libro: error enviando libro', err);
          // Devolvemos 200 de todas formas para que Stripe no reintente el webhook.
          // El error queda en los logs de Netlify para revisión manual.
        }
      } else if (!email) {
        console.warn('stripe-webhook-libro: pago completado pero sin email — no se pudo enviar el libro');
      } else if (!paid) {
        console.warn('stripe-webhook-libro: sesión completada pero payment_status no es "paid"', session.payment_status);
      }
    }
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ received: true }),
  };
};
