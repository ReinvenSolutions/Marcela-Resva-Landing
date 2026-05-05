import { Handler } from '@netlify/functions';
import { z } from 'zod';
import { WAITLIST_MEMBRESIA_GROUP_ID } from './mailerliteWaitlistGroup';

const subscribeSchema = z.object({
  firstName: z.string(),
  email: z.string().email(),
  /** Origen: env + fallback al grupo lista de espera en MailerLite */
  source: z.enum(['waitlist_membresia']).optional()
});

/**
 * Lista de espera (/membresia): double opt-in en MailerLite + opcional confirmación en sitio.
 * Si quieres que /email-confirmacion asigne bien el grupo, el enlace debe incluir
 * ?subscriber_id=…&token=…&source=waitlist_membresia (según lo que permita tu plantilla MailerLite).
 */
export const handler: Handler = async (event) => {
  console.log('=== INICIO DE FUNCIÓN SUBSCRIBE ===');
  console.log('Método HTTP:', event.httpMethod);
  
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Method Not Allowed' })
    };
  }

  try {
    // Parsear y validar datos
    const body = JSON.parse(event.body || '{}');
    console.log('Datos recibidos:', { email: body.email, firstName: body.firstName });
    const validatedData = subscribeSchema.parse(body);

    // Obtener configuración de variables de entorno
    const mailerLiteApiKey = process.env.MAILERLITE_API_KEY;
    const isWaitlist = validatedData.source === 'waitlist_membresia';
    const defaultGroupId = process.env.MAILERLITE_GROUP_ID;
    const mailerLiteGroupId = isWaitlist ? WAITLIST_MEMBRESIA_GROUP_ID : defaultGroupId;

    console.log('Variables de entorno:');
    console.log('- API Key existe:', !!mailerLiteApiKey);
    console.log('- Origen suscripción:', isWaitlist ? 'lista_espera_membresia' : 'newsletter_default');
    console.log('- Group ID en uso:', !!mailerLiteGroupId);

    if (!mailerLiteApiKey) {
      console.error('❌ MailerLite API key is missing!');
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Configuración del servidor incompleta' })
      };
    }

    console.log('✅ Variables de entorno configuradas correctamente');
    console.log('Registrando suscriptor en MailerLite...');

    // Crear suscriptor en MailerLite
    const mailerLiteResponse = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mailerLiteApiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        email: validatedData.email,
        fields: {
          name: validatedData.firstName
        },
        groups: mailerLiteGroupId ? [mailerLiteGroupId] : [],
        status: 'unconfirmed' // Esto activa el double opt-in
      })
    });

    console.log('MailerLite Response Status:', mailerLiteResponse.status);
    console.log('MailerLite Response Headers:', Object.fromEntries(mailerLiteResponse.headers.entries()));

    if (mailerLiteResponse.ok) {
      const mailerLiteData = await mailerLiteResponse.json();
      console.log('Suscriptor registrado exitosamente:', mailerLiteData.data?.id);

      // Si hay un grupo configurado, agregar el suscriptor al grupo
      if (mailerLiteGroupId && mailerLiteData.data?.id) {
        try {
          const groupResponse = await fetch(
            `https://connect.mailerlite.com/api/subscribers/${mailerLiteData.data.id}/groups/${mailerLiteGroupId}`,
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
            console.log('Suscriptor agregado al grupo exitosamente');
          } else {
            console.error('Error al agregar suscriptor al grupo:', await groupResponse.text());
          }
        } catch (groupError) {
          console.error('Error al procesar grupo:', groupError);
        }
      }

      return {
        statusCode: 201,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: isWaitlist
            ? '¡Listo! Revisa tu correo para confirmar y quedar en la lista de espera de la membresía.'
            : '¡Registro exitoso! Revisa tu email para confirmar tu suscripción.',
          subscriber: {
            id: mailerLiteData.data?.id,
            firstName: validatedData.firstName,
            email: validatedData.email,
            requiresConfirmation: true
          }
        })
      };
    } else {
      const errorText = await mailerLiteResponse.text();
      console.error(`MailerLite API Error (${mailerLiteResponse.status}):`, errorText);

      // Manejar error de email duplicado
      if (mailerLiteResponse.status === 400 || mailerLiteResponse.status === 422) {
        return {
          statusCode: 400,
          body: JSON.stringify({
            message: isWaitlist
              ? 'Este correo ya está registrado o en proceso de confirmación para la lista de espera.'
              : 'Este email ya está registrado en nuestra newsletter'
          })
        };
      }

      return {
        statusCode: 500,
        body: JSON.stringify({
          message: 'Error al procesar la suscripción. Por favor intenta de nuevo.'
        })
      };
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Datos inválidos',
          errors: error.errors
        })
      };
    }

    console.error('Error en función subscribe:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Error interno del servidor. Por favor intenta de nuevo.'
      })
    };
  }
};
