# 🚀 Guía de Deploy en Netlify

## Resumen de Cambios Realizados

✅ **Servidor Express eliminado** - Ya no necesitas Railway ni servidores con Node.js corriendo 24/7  
✅ **Netlify Functions creadas** - Funciones serverless para manejar las suscripciones  
✅ **Sitio estático optimizado** - Frontend en React + Vite  
✅ **Integración con MailerLite** - Todo el manejo de newsletter se hace vía API de MailerLite  

## 📁 Estructura Actual

```
Marcela-Resva-Landing/
├── client/                    # Frontend React
├── netlify/
│   └── functions/            # 3 funciones serverless
│       ├── subscribe.ts      # Registra suscriptores
│       ├── confirm-subscription.ts
│       └── webhook-mailerlite.ts
├── netlify.toml              # Configuración de Netlify
└── dist/                     # Build de producción (generado)
```

## 🎯 Paso a Paso para Deploy

### 1. Preparar el Repositorio

Asegúrate de que tu código esté en Git:

```bash
git add .
git commit -m "Migración a Netlify Functions"
git push origin main
```

### 2. Crear Cuenta en Netlify

1. Ve a [netlify.com](https://netlify.com)
2. Regístrate con tu cuenta de GitHub
3. Autoriza a Netlify para acceder a tus repositorios

### 3. Conectar el Repositorio

1. Click en "Add new site" → "Import an existing project"
2. Selecciona "Deploy with GitHub"
3. Busca y selecciona el repositorio `Marcela-Resva-Landing`
4. Configuración del build:
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`

### 4. Configurar Variables de Entorno

En la configuración del sitio (Site settings → Environment variables):

Agrega estas 2 variables:

| Variable | Valor | Dónde obtenerlo |
|----------|-------|-----------------|
| `MAILERLITE_API_KEY` | `tu_api_key` | [MailerLite Dashboard → Integrations → API](https://dashboard.mailerlite.com/integrations/api/) |
| `MAILERLITE_GROUP_ID` | `tu_group_id` | [MailerLite → Groups → Selecciona tu grupo → Copia el ID de la URL](https://dashboard.mailerlite.com/groups) |

**Cómo obtener el Group ID:**
1. Ve a MailerLite → Groups
2. Haz click en el grupo que quieres usar (ej: "Shifting Souls Community")
3. Copia el número largo de la URL: `https://dashboard.mailerlite.com/groups/160033952049923407`
   - En este caso el ID es: `160033952049923407`

### 5. Deploy

1. Click en "Deploy site"
2. Espera 2-3 minutos mientras Netlify:
   - Instala las dependencias
   - Ejecuta el build
   - Despliega el sitio y las functions

### 6. Configurar Dominio Personalizado (Opcional)

Si tienes un dominio:
1. Ve a Site settings → Domain management
2. Click "Add custom domain"
3. Sigue las instrucciones para configurar los DNS

### 7. Configurar Webhook en MailerLite (Opcional)

Para recibir confirmaciones automáticas:

1. Ve a [MailerLite Dashboard → Integrations → Webhooks](https://dashboard.mailerlite.com/integrations/webhooks)
2. Click "Add webhook"
3. Configura:
   - **URL:** `https://tu-sitio.netlify.app/.netlify/functions/webhook-mailerlite`
   - **Events:** Selecciona `subscriber.confirmed`
4. Guarda

## ✅ Verificación

Una vez desplegado:

1. **Prueba el formulario:**
   - Visita tu sitio en Netlify
   - Llena el formulario con un email de prueba
   - Deberías recibir un email de confirmación de MailerLite

2. **Verifica las Functions:**
   - Ve a Site overview → Functions
   - Deberías ver 3 funciones activas:
     - `subscribe`
     - `confirm-subscription`
     - `webhook-mailerlite`

3. **Revisa los logs:**
   - En Functions → Click en cualquier función → Function logs
   - Verifica que no hay errores

## 🔄 Deploy Automático

De ahora en adelante, cada vez que hagas push a la rama `main`:
1. Netlify detectará el cambio automáticamente
2. Ejecutará el build
3. Desplegará la nueva versión

## 📊 Comparación: Railway vs Netlify

| Aspecto | Railway (antes) | Netlify (ahora) |
|---------|----------------|-----------------|
| **Costo mensual** | ~$5-10 | **GRATIS** |
| **Servidor** | Node.js 24/7 | Serverless |
| **Base de datos** | PostgreSQL (no usada) | Ninguna (no necesaria) |
| **Límites gratuitos** | 500 horas/mes | 100GB bandwidth, 300 min build |
| **Deploy** | Manual o CI/CD | **Automático desde Git** |
| **Escalabilidad** | Limitada | **Automática** |

## 🎉 Ventajas de esta Migración

1. ✅ **Costo:** Plan gratuito de Netlify es suficiente
2. ✅ **Simplicidad:** No hay servidor que mantener
3. ✅ **Velocidad:** CDN global de Netlify
4. ✅ **Seguridad:** Funciones serverless aisladas
5. ✅ **Deploy:** Automático en cada push a Git
6. ✅ **Sin base de datos:** Todo se maneja en MailerLite

## 🆘 Troubleshooting

### Error: "Function not found"
- Verifica que las funciones estén en `netlify/functions/`
- Revisa los logs de build en Netlify

### Error: "MailerLite API key missing"
- Ve a Site settings → Environment variables
- Verifica que `MAILERLITE_API_KEY` esté configurada

### Los emails no llegan
- Verifica que el Group ID sea correcto
- Revisa en MailerLite → Subscribers si el usuario se registró
- Verifica la configuración de double opt-in en MailerLite

### Error de CORS
- Netlify maneja CORS automáticamente
- Si persiste, verifica que las URLs de las functions sean correctas

## 📝 URLs de las Functions

En producción, tus functions estarán disponibles en:

- `https://tu-sitio.netlify.app/.netlify/functions/subscribe`
- `https://tu-sitio.netlify.app/.netlify/functions/confirm-subscription`
- `https://tu-sitio.netlify.app/.netlify/functions/webhook-mailerlite`

El frontend ya está configurado para usar estas URLs automáticamente.

## 🎊 ¡Listo!

Tu sitio ahora está desplegado en Netlify, es más rápido, más barato y más fácil de mantener.

**¿Preguntas?** Revisa la [documentación de Netlify](https://docs.netlify.com/) o la [documentación de MailerLite](https://developers.mailerlite.com/).
