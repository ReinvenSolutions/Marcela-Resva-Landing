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
    const body = JSON.parse(event.body || '{}');
    const { subscriberId, token } = body;

    if (!subscriberId || !token) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Datos de confirmación inválidos'
        })
      };
    }

    const mailerLiteApiKey = process.env.MAILERLITE_API_KEY;
    const mailerLiteGroupId = process.env.MAILERLITE_GROUP_ID;

    if (!mailerLiteApiKey) {
      console.error('MailerLite API key is missing!');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Configuración del servidor incompleta' })
      };
    }

    // Confirmar suscriptor en MailerLite
    const confirmResponse = await fetch(
      `https://connect.mailerlite.com/api/subscribers/${subscriberId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${mailerLiteApiKey}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          status: 'active'
        })
      }
    );

    if (confirmResponse.ok) {
      console.log('Suscriptor confirmado en MailerLite');

      // Agregar al grupo si está configurado
      if (mailerLiteGroupId) {
        try {
          const groupResponse = await fetch(
            `https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${mailerLiteGroupId}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${mailerLiteApiKey}`,
                'Accept': 'application/json'
              }
            }
          );

          if (groupResponse.ok) {
            console.log('Suscriptor confirmado agregado al grupo');
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: 'Suscripción confirmada exitosamente. ¡Bienvenida!',
          confirmed: true
        })
      };
    } else {
      const errorText = await confirmResponse.text();
      console.error('Error confirmando en MailerLite:', errorText);

      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'No se pudo confirmar la suscripción. El enlace puede haber expirado.'
        })
      };
    }
  } catch (error) {
    console.error('Error en función confirm-subscription:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error interno del servidor. Por favor intenta de nuevo.'
      })
    };
  }
};
