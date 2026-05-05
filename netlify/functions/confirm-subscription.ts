import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { WAITLIST_MEMBRESIA_GROUP_ID } from './mailerliteWaitlistGroup';

const bodySchema = z.object({
  subscriberId: z.string().min(1),
  token: z.string().min(1),
  /** Si coincide con el alta desde /membresia, se re-asigna al grupo lista de espera tras activar. */
  source: z.enum(['waitlist_membresia']).optional(),
});

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const parsed = bodySchema.safeParse(JSON.parse(event.body || '{}'));
    if (!parsed.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Datos de confirmación inválidos',
        }),
      };
    }

    const { subscriberId, source } = parsed.data;

    const mailerLiteApiKey = process.env.MAILERLITE_API_KEY;
    const newsletterGroupId = process.env.MAILERLITE_GROUP_ID;
    const isWaitlist = source === 'waitlist_membresia';
    const groupIdAfterConfirm = isWaitlist
      ? WAITLIST_MEMBRESIA_GROUP_ID
      : newsletterGroupId;

    if (!mailerLiteApiKey) {
      console.error('MailerLite API key is missing!');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Configuración del servidor incompleta' }),
      };
    }

    void _confirmationToken;

    const confirmResponse = await fetch(
      `https://connect.mailerlite.com/api/subscribers/${subscriberId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mailerLiteApiKey}`,
          Accept: 'application/json',
        },
        body: JSON.stringify({
          status: 'active',
        }),
      },
    );

    if (confirmResponse.ok) {
      console.log('Suscriptor confirmado en MailerLite');

      if (groupIdAfterConfirm) {
        try {
          const groupResponse = await fetch(
            `https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${groupIdAfterConfirm}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${mailerLiteApiKey}`,
                Accept: 'application/json',
              },
            },
          );

          if (groupResponse.ok) {
            console.log(
              isWaitlist
                ? 'Suscriptor confirmado: grupo lista de espera membresía'
                : 'Suscriptor confirmado agregado al grupo newsletter',
            );
          } else {
            console.error('Error al agregar al grupo:', await groupResponse.text());
          }
        } catch (groupError) {
          console.error('Error al procesar grupo:', groupError);
        }
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: isWaitlist
            ? '¡Listo! Tu correo está confirmado y quedaste en la lista de espera de la membresía.'
            : 'Suscripción confirmada exitosamente. ¡Bienvenida!',
          confirmed: true,
          source: source ?? null,
        }),
      };
    }

    const errorText = await confirmResponse.text();
    console.error('Error confirmando en MailerLite:', errorText);

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'No se pudo confirmar la suscripción. El enlace puede haber expirado.',
      }),
    };
  } catch (error) {
    console.error('Error en función confirm-subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error interno del servidor. Por favor intenta de nuevo.',
      }),
    };
  }
};
