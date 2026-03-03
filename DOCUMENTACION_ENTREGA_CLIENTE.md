# Documentación del Proyecto
## Marcela Resva - Shifting Souls Landing Page

**Fecha de entrega:** Febrero 2026  
**Desarrollado por:** Felipe Reinven / Reinven Solutions

---

## Índice

1. [Resumen del Proyecto](#1-resumen-del-proyecto)
2. [Características del Sitio](#2-características-del-sitio)
3. [Páginas y Rutas](#3-páginas-y-rutas)
4. [Tecnologías Utilizadas](#4-tecnologías-utilizadas)
5. [Estructura del Proyecto](#5-estructura-del-proyecto)
6. [Requisitos Previos](#6-requisitos-previos)
7. [Instalación y Configuración](#7-instalación-y-configuración)
8. [Desarrollo Local](#8-desarrollo-local)
9. [Despliegue en Producción (Netlify)](#9-despliegue-en-producción-netlify)
10. [Configuración de MailerLite](#10-configuración-de-mailerlite)
11. [Cómo Personalizar el Contenido](#11-cómo-personalizar-el-contenido)
12. [Seguridad y Buenas Prácticas](#12-seguridad-y-buenas-prácticas)
13. [Solución de Problemas](#13-solución-de-problemas)
14. [Contacto y Soporte](#14-contacto-y-soporte)

---

## 1. Resumen del Proyecto

Este proyecto es una **landing page profesional** para **Marcela Resva** y su marca **Shifting Souls**. El sitio está diseñado para mujeres de 28-65 años que buscan transformación espiritual y ofrece:

- **Registro gratuito** a la newsletter con 4 regalos digitales
- **Double opt-in** (confirmación por email) para cumplir con normativas
- **Integración con MailerLite** para gestión de suscriptores y automatizaciones
- **Diseño responsive** optimizado para móvil y desktop
- **Compatibilidad con Instagram** (navegador in-app)

El sitio está desplegado en **Netlify** (hosting gratuito) y utiliza **funciones serverless** para el manejo de suscripciones, sin necesidad de servidor ni base de datos propia.

---

## 2. Características del Sitio

| Característica | Descripción |
|----------------|-------------|
| **Formulario de registro** | Captura nombre y email. Validación en tiempo real. |
| **Double opt-in** | MailerLite envía email de confirmación. El usuario debe hacer click para activar la suscripción. |
| **4 regalos digitales** | Audio canalizado, video, cápsulas de acción, comunidad. |
| **Videos Vimeo** | Reproducción embebida de contenido espiritual. |
| **Audio embebido** | Reproductor de audio para el mensaje canalizado. |
| **WhatsApp** | Enlace a grupo de comunidad. |
| **Instagram** | Compatibilidad especial para usuarios que llegan desde Instagram. |
| **Tema espiritual** | Gradientes púrpura/azul, partículas animadas, tipografía elegante. |

---

## 3. Páginas y Rutas

| Ruta | Página | Descripción |
|------|--------|--------------|
| `/` | Landing principal | Página de inicio con formulario de registro |
| `/membresia` | Membresía | Información sobre membresía |
| `/eventos` | Eventos | Próximos eventos |
| `/citas` | Citas | Reserva de citas |
| `/ultimo-paso` | Gracias | Página post-registro con video |
| `/audio-regalo` | Audio Regalo | Reproductor del audio canalizado |
| `/video-regalo` | Video Regalo | Video La Energía del Pétalo |
| `/email-confirmacion` | Confirmar email | Página de confirmación de suscripción |
| `/email-ya-confirmado` | Ya confirmado | Mensaje cuando el email ya fue confirmado |
| Cualquier otra | 404 | Página no encontrada |

---

## 4. Tecnologías Utilizadas

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS
- **Componentes UI:** Radix UI + shadcn/ui
- **Formularios:** React Hook Form + Zod (validación)
- **Hosting:** Netlify (sitio estático + funciones serverless)
- **Newsletter:** MailerLite API
- **Videos:** Vimeo
- **Fuentes:** Google Fonts (Cormorant Garamond, Poppins, Dancing Script)

---

## 5. Estructura del Proyecto

```
Marcela-Resva-Landing/
├── client/                      # Aplicación React (frontend)
│   ├── src/
│   │   ├── components/          # Componentes reutilizables
│   │   │   └── ui/              # Componentes de interfaz (botones, inputs, etc.)
│   │   ├── pages/               # Páginas del sitio
│   │   ├── lib/                 # Utilidades y configuración
│   │   └── assets/              # Imágenes y recursos
│   └── index.html
├── netlify/
│   └── functions/               # Funciones serverless (backend)
│       ├── subscribe.ts         # Registra suscriptores en MailerLite
│       ├── confirm-subscription.ts  # Confirma suscripciones
│       └── webhook-mailerlite.ts    # Recibe notificaciones de MailerLite
├── attached_assets/             # Assets adicionales
├── netlify.toml                 # Configuración de Netlify
├── vite.config.ts               # Configuración del build
├── package.json                 # Dependencias del proyecto
├── .env.example                 # Plantilla de variables de entorno
└── DOCUMENTACION_ENTREGA_CLIENTE.md  # Este documento
```

---

## 6. Requisitos Previos

Para trabajar con el proyecto necesitas:

- **Node.js** versión 20 o superior ([Descargar](https://nodejs.org/))
- **npm** (incluido con Node.js)
- **Cuenta de Netlify** (para despliegue)
- **Cuenta de MailerLite** con API Key (para newsletter)

---

## 7. Instalación y Configuración

### Paso 1: Clonar el repositorio

```bash
git clone https://github.com/ReinvenSolutions/Marcela-Resva-Landing.git
cd Marcela-Resva-Landing
```

### Paso 2: Instalar dependencias

```bash
npm install
```

### Paso 3: Configurar variables de entorno

Copia el archivo de ejemplo y edítalo con tus credenciales:

```bash
cp .env.example .env
```

Edita el archivo `.env` y agrega:

```
MAILERLITE_API_KEY=tu_api_key_de_mailerlite
MAILERLITE_GROUP_ID=tu_group_id_de_mailerlite
```

> ⚠️ **Importante:** El archivo `.env` contiene información sensible. Nunca lo subas a Git. Ya está configurado en `.gitignore`.

---

## 8. Desarrollo Local

Para ver el sitio en tu computadora:

```bash
npm run dev
```

El sitio estará disponible en: **http://localhost:5173**

> **Nota:** Las funciones de Netlify (suscripción) no funcionan en desarrollo local a menos que uses `netlify dev`. Para probar el formulario completo, usa el sitio desplegado en Netlify.

### Otros comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run build` | Genera la versión de producción en la carpeta `dist/` |
| `npm run preview` | Previsualiza el build de producción localmente |

---

## 9. Despliegue en Producción (Netlify)

El sitio está configurado para desplegarse en **Netlify**. Cada vez que hagas cambios y los subas a GitHub, Netlify desplegará automáticamente.

### Configuración del build en Netlify

| Configuración | Valor |
|--------------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |
| **Branch to deploy** | `main` |

### Variables de entorno en Netlify

**Obligatorio:** Configura estas variables en Netlify para que el formulario funcione:

1. Ve a tu sitio en Netlify → **Site configuration** → **Environment variables**
2. Agrega:
   - **MAILERLITE_API_KEY** — Tu API key de MailerLite
   - **MAILERLITE_GROUP_ID** — ID del grupo de suscriptores (ej: 160033952049923407)

3. **Importante:** Después de agregar o modificar variables, haz un **nuevo deploy** (Deploys → Trigger deploy → Deploy site)

### Dominio personalizado

Si tienes un dominio (ej: marcelaresva.com):

1. Netlify → Site settings → Domain management
2. Add custom domain
3. Sigue las instrucciones para configurar los DNS

---

## 10. Configuración de MailerLite

### Obtener la API Key

1. Inicia sesión en [MailerLite](https://www.mailerlite.com/)
2. Ve a **Integrations** → **API**
3. Genera una nueva API key
4. Copia la key (empieza con `eyJ...`)

### Obtener el Group ID

1. Ve a **Subscribers** → **Groups**
2. Selecciona tu grupo (ej: "Shifting Souls Community")
3. El ID está en la URL: `https://dashboard.mailerlite.com/groups/160033952049923407`
4. El número largo (160033952049923407) es el Group ID

### Double opt-in

El formulario usa double opt-in por defecto. En MailerLite:

1. **Settings** → **Forms** → Configura el double opt-in
2. Personaliza el email de confirmación con tu plantilla "AQUÍ CONFIRMAS TU CORREO"

### Webhook (opcional)

Para sincronización avanzada:

1. **Integrations** → **Webhooks** → Add webhook
2. **URL:** `https://tu-sitio.netlify.app/.netlify/functions/webhook-mailerlite`
3. **Events:** subscriber.confirmed, subscriber.active

---

## 11. Cómo Personalizar el Contenido

### Textos y contenido

- **Landing principal:** `client/src/pages/landing-clean.tsx` (o `landing.tsx`)
- **Página de gracias:** `client/src/pages/thank-you.tsx`
- **Otras páginas:** `client/src/pages/` — cada archivo corresponde a una página

### Estilos y colores

- **Variables CSS y tema:** `client/src/index.css`
- **Configuración Tailwind:** `tailwind.config.ts`

### Imágenes

- **Assets del proyecto:** `client/src/assets/` o `attached_assets/`
- Las imágenes se importan en los componentes

### Videos de Vimeo

Los IDs de video están en los componentes. Busca referencias a Vimeo en las páginas para cambiar los videos.

---

## 12. Seguridad y Buenas Prácticas

### ✅ Lo que está protegido

- Las API keys **nunca** se exponen en el navegador
- El archivo `.env` está en `.gitignore` y no se sube a Git
- Las credenciales solo existen en Netlify (servidor)

### ⚠️ Recomendaciones

1. **Nunca** subas el archivo `.env` a Git
2. **Nunca** pongas API keys directamente en el código
3. Rota la API key de MailerLite cada 6-12 meses
4. Si expones una key por error, revócala inmediatamente en MailerLite y genera una nueva

### En caso de emergencia

Si la API key se expone:

1. Ve a MailerLite → Integrations → API
2. Revoca la key comprometida
3. Genera una nueva
4. Actualiza la key en Netlify (Environment variables)
5. Haz un nuevo deploy

---

## 13. Solución de Problemas

### Error: "Configuración del servidor incompleta" o "MailerLite API key is missing"

**Causa:** Las variables de entorno no están configuradas en Netlify.

**Solución:**
1. Netlify → Site configuration → Environment variables
2. Agrega `MAILERLITE_API_KEY` y `MAILERLITE_GROUP_ID` con los valores correctos
3. Sin espacios al inicio o final del valor
4. Haz un nuevo deploy después de configurar

### Los emails de confirmación no llegan

- Verifica que el Group ID sea correcto
- Revisa en MailerLite → Subscribers si el usuario se registró
- Verifica la carpeta de spam
- Revisa la configuración de double opt-in en MailerLite

### El formulario no funciona en producción

1. Revisa los logs: Netlify → Functions → subscribe → Function logs
2. Verifica que las variables de entorno estén configuradas
3. Asegúrate de haber hecho deploy después de configurar las variables

### Error al hacer build

```bash
# Limpia e instala de nuevo
rm -rf node_modules dist
npm install
npm run build
```

### El sitio no se actualiza después de cambios

- Verifica que hiciste push a la rama `main` en GitHub
- Netlify despliega automáticamente. Revisa el estado en Deploys
- Puede tardar 2-3 minutos

---

## 14. Contacto y Soporte

**Desarrollador:** Felipe Reinven  
**Organización:** Reinven Solutions  
**Repositorio:** https://github.com/ReinvenSolutions/Marcela-Resva-Landing

Para soporte técnico o consultas sobre el proyecto, contacta al desarrollador.

---

## Resumen Rápido

| Acción | Comando o Ubicación |
|--------|---------------------|
| Ver el sitio en local | `npm run dev` |
| Generar build | `npm run build` |
| Variables de entorno | `.env` (local) / Netlify Dashboard (producción) |
| Cambiar textos | `client/src/pages/` |
| Cambiar estilos | `client/src/index.css` |
| Logs de errores | Netlify → Functions → Logs |

---

**Documento generado:** Febrero 2026  
**Versión del proyecto:** 1.0
