# Marcela Resva Landing Page

Landing page para Marcela Resva - Shifting Souls Community.

## 🚀 Tecnologías

- **Frontend:** React 18 + Vite + TypeScript
- **Estilos:** Tailwind CSS
- **UI Components:** Radix UI + shadcn/ui
- **Formularios:** React Hook Form + Zod
- **Funciones Serverless:** Netlify Functions
- **Newsletter:** MailerLite API
- **Pagos (ebook):** Stripe (Embedded Checkout) — ver **[STRIPE.md](./STRIPE.md)**

## 📋 Requisitos Previos

- Node.js 20.x o superior
- npm o yarn
- Cuenta de Netlify (para deploy)
- Cuenta de MailerLite con API Key

## 🛠️ Instalación

1. Clona el repositorio:
```bash
git clone <repo-url>
cd Marcela-Resva-Landing
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` basado en `.env.example`:
```bash
cp .env.example .env
```

4. Configura tus variables de entorno en `.env`:
```
MAILERLITE_API_KEY=tu_api_key_aqui
MAILERLITE_GROUP_ID=tu_group_id_aqui
```

## 🏃 Desarrollo Local

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

El sitio estará disponible en `http://localhost:5173`

## 📦 Build para Producción

```bash
npm run build
```

Los archivos de producción se generarán en el directorio `dist/`

## 🌐 Deploy en Netlify

### Opción 1: Deploy desde la UI de Netlify

1. Crea una cuenta en [Netlify](https://netlify.com)
2. Conecta tu repositorio de GitHub
3. Configura el build:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Agrega las variables de entorno en Netlify:
   - `MAILERLITE_API_KEY`
   - `MAILERLITE_GROUP_ID`
5. Haz click en "Deploy site"

### Opción 2: Deploy con Netlify CLI

```bash
# Instala Netlify CLI
npm install -g netlify-cli

# Inicia sesión
netlify login

# Deploy
netlify deploy --prod
```

## 🔧 Configuración de MailerLite

1. Obtén tu API Key desde [MailerLite Dashboard](https://dashboard.mailerlite.com/integrations/api/)
2. Crea un grupo/lista para los suscriptores
3. Obtén el Group ID de la URL o desde el API
4. Configura el double opt-in en MailerLite (Settings > Forms)
5. Configura el webhook (opcional):
   - URL: `https://tu-sitio.netlify.app/.netlify/functions/webhook-mailerlite`
   - Evento: `subscriber.confirmed`

## 📁 Estructura del Proyecto

```
├── client/                 # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── lib/           # Utilidades
│   │   └── assets/        # Imágenes y recursos
│   └── index.html
├── netlify/
│   └── functions/         # Netlify Functions (serverless)
├── attached_assets/       # Assets adicionales
├── netlify.toml          # Configuración de Netlify
└── vite.config.ts        # Configuración de Vite
```

## 🔐 Variables de Entorno

### Desarrollo
Crea un archivo `.env` en la raíz del proyecto:

```
MAILERLITE_API_KEY=tu_api_key
MAILERLITE_GROUP_ID=tu_group_id
```

### Producción (Netlify)
Configura las variables de entorno en Netlify:
- Site settings > Environment variables
- Agrega `MAILERLITE_API_KEY` y `MAILERLITE_GROUP_ID`

## 📝 Endpoints de las Functions

- `/.netlify/functions/subscribe` - Registra nuevos suscriptores
- `/.netlify/functions/confirm-subscription` - Confirma suscripciones
- `/.netlify/functions/webhook-mailerlite` - Recibe webhooks de MailerLite

## 🎨 Personalización

Los componentes de UI se encuentran en `client/src/components/ui/` y están construidos con Radix UI y Tailwind CSS. Puedes personalizarlos modificando:

- Colores y temas: `client/src/index.css`
- Componentes: `client/src/components/ui/`
- Páginas: `client/src/pages/`

## 📄 Licencia

MIT
