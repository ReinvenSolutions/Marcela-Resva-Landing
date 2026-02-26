import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    const webhookEvent = JSON.parse(event.body || '{}');
    console.log('MailerLite webhook recibido:', webhookEvent);

    // Manejar evento de confirmación de suscriptor
    if (webhookEvent.type === 'subscriber.confirmed') {
      const subscriberEmail = webhookEvent.data?.subscriber?.email;
      const mailerLiteSubscriberId = webhookEvent.data?.subscriber?.id;

      console.log(`Suscriptor ${subscriberEmail} confirmado vía webhook`);

      // Intentar agregar al grupo si está configurado
      const mailerLiteApiKey = process.env.MAILERLITE_API_KEY;
      const mailerLiteGroupId = process.env.MAILERLITE_GROUP_ID;

      if (mailerLiteApiKey && mailerLiteGroupId && mailerLiteSubscriberId) {
        try {
          const assignToGroupResponse = await fetch(
            `https://connect.mailerlite.com/api/subscribers/${mailerLiteSubscriberId}/groups/${mailerLiteGroupId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mailerLiteApiKey}`,
                'Accept': 'application/json'
              }
            }
          );

          if (assignToGroupResponse.ok) {
            console.log(`Suscriptor confirmado ${subscriberEmail} agregado al grupo`);
          } else {
            console.error(
              'Error al agregar suscriptor confirmado al grupo:',
              await assignToGroupResponse.text()
            );
          }
        } catch (groupError) {
          console.error('Error al procesar grupo:', groupError);
        }
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Error en webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook processing failed' })
    };
  }
};
