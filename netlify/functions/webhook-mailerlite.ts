import { Handler } from '@netlify/functions';
import { WAITLIST_MEMBRESIA_GROUP_ID } from './mailerliteWaitlistGroup';

/** IDs de grupos del suscriptor; null si la API falló. */
async function fetchSubscriberGroupIds(
  apiKey: string,
  subscriberId: string,
): Promise<string[] | null> {
  const res = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${subscriberId}?include=groups`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
      },
    },
  );
  if (!res.ok) {
    console.error('webhook: GET subscriber include=groups', res.status, await res.text());
    return null;
  }
  const json = (await res.json()) as {
    data?: { groups?: Array<{ id: string }> };
  };
  const groups = json.data?.groups;
  if (!Array.isArray(groups)) return [];
  return groups.map((g) => g.id).filter(Boolean);
}

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' }),
    };
  }

  try {
    const webhookEvent = JSON.parse(event.body || '{}');
    console.log('MailerLite webhook recibido:', webhookEvent);

    if (webhookEvent.type === 'subscriber.confirmed') {
      const subscriberEmail = webhookEvent.data?.subscriber?.email;
      const mailerLiteSubscriberId = webhookEvent.data?.subscriber?.id;

      console.log(`Suscriptor ${subscriberEmail} confirmado vía webhook`);

      const mailerLiteApiKey = process.env.MAILERLITE_API_KEY;
      const mailerLiteGroupId = process.env.MAILERLITE_GROUP_ID;

      if (mailerLiteApiKey && mailerLiteGroupId && mailerLiteSubscriberId) {
        const groupIds = await fetchSubscriberGroupIds(
          mailerLiteApiKey,
          String(mailerLiteSubscriberId),
        );

        const inWaitlistMembresia =
          groupIds !== null &&
          groupIds.includes(WAITLIST_MEMBRESIA_GROUP_ID);

        if (inWaitlistMembresia) {
          console.log(
            'Suscriptor en lista de espera membresía: no se asigna el grupo newsletter desde el webhook.',
          );
        } else if (groupIds !== null) {
          try {
            const assignToGroupResponse = await fetch(
              `https://connect.mailerlite.com/api/subscribers/${mailerLiteSubscriberId}/groups/${mailerLiteGroupId}`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${mailerLiteApiKey}`,
                  Accept: 'application/json',
                },
              },
            );

            if (assignToGroupResponse.ok) {
              console.log(`Suscriptor confirmado ${subscriberEmail} agregado al grupo newsletter`);
            } else {
              console.error(
                'Error al agregar suscriptor confirmado al grupo:',
                await assignToGroupResponse.text(),
              );
            }
          } catch (groupError) {
            console.error('Error al procesar grupo:', groupError);
          }
        } else {
          console.warn(
            'Webhook: no se pudo leer grupos del suscriptor; se omite asignación automática al grupo newsletter.',
          );
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ received: true }),
    };
  } catch (error) {
    console.error('Error en webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' }),
    };
  }
};
