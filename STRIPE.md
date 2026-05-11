# Stripe en este repositorio (ebook «Llegó mi momento»)

Guía completa para desarrollo local, diagnóstico, variables de entorno y despliegue en Netlify.

---

## Arquitectura

| Pieza | Ubicación | Rol |
|--------|-----------|-----|
| Página de venta | `client/src/pages/libro.tsx` | Stripe.js + Embedded Checkout; llama a la función para obtener `clientSecret`. |
| Crear sesión de pago | `netlify/functions/create-checkout-session.ts` | Crea una Checkout Session (modo `embedded`), precio fijo **8,44 USD** (`844` centavos). |
| Webhook (post-pago) | `netlify/functions/stripe-webhook-libro.ts` | Verifica firma; en `checkout.session.completed` filtra por `metadata.product = ebook_llego_mi_momento`. |
| Diagnóstico | `netlify/functions/stripe-check.ts` | GET `/.netlify/functions/stripe-check` — valida la clave sin cobrar nada. |
| Config de Vite | `vite.config.ts` | `envDir` = raíz del repo; expone `VITE_STRIPE_PUBLISHABLE_KEY` al bundle. |

**Flujo:**

1. Usuario pulsa «Comprar» en `/libro`.
2. Navegador hace `POST /.netlify/functions/create-checkout-session` con `{ origin, mode: "embedded" }`.
3. La función usa `STRIPE_SECRET_KEY` para crear la sesión y devuelve `clientSecret`.
4. El front usa `@stripe/react-stripe-js` con `VITE_STRIPE_PUBLISHABLE_KEY` para mostrar el Embedded Checkout.
5. Tras pagar, Stripe redirige a `/libro/gracias?session_id=…`.
6. Stripe envía un evento al webhook configurado en Netlify (`stripe-webhook-libro`).

---

## Variables de entorno

| Variable | Dónde se usa | ¿Obligatoria? |
|----------|-------------|--------------|
| `VITE_STRIPE_PUBLISHABLE_KEY` | Bundle del navegador | **Sí** |
| `STRIPE_PUBLISHABLE_KEY` | Alternativa si no defines `VITE_*` | No (Vite la toma automáticamente) |
| `STRIPE_SECRET_KEY` | Función `create-checkout-session` | **Sí** |
| `STRIPE_WEBHOOK_SECRET` | Función `stripe-webhook-libro` | Sí (en producción) |
| `URL` | Fallback de origen si el POST no manda `origin` | Opcional |

**Claves opcionales:**

| Variable | Efecto |
|----------|--------|
| `VITE_LIBRO_CHECKOUT_URL` | Los botones de compra abren esta URL en lugar de usar Stripe integrado. |
| `VITE_LIBRO_PORTADA_URL` | Sustituye la imagen de portada por una URL externa. |

---

## 🔑 Claves TEST vs LIVE — ¡Lee esto primero!

| Entorno | Tipo de clave | Dónde obtenerlas |
|---------|--------------|-----------------|
| **Desarrollo local** | `pk_test_…` / `sk_test_…` | https://dashboard.stripe.com/test/apikeys |
| **Producción (Netlify)** | `pk_live_…` / `sk_live_…` | https://dashboard.stripe.com/apikeys |

**Por qué separar:** con claves live en `http://localhost` se cobran pagos reales y Stripe mostrará advertencias de HTTPS. Con claves test nunca se cobra dinero real.

**Tarjetas de prueba con claves test:**
- Visa éxito: `4242 4242 4242 4242`, cualquier fecha futura, cualquier CVC.
- Ver todas: https://stripe.com/docs/testing#cards

---

## Diagnóstico rápido (si algo no funciona)

### 1. Verificar que la clave es válida

```bash
# Con el dev server corriendo (npm run dev):
curl http://localhost:5176/.netlify/functions/stripe-check
```

O abre en el navegador: **http://localhost:5176/.netlify/functions/stripe-check**

Respuesta esperada:
```json
{
  "ok": true,
  "STRIPE_SECRET_KEY": "sk_test_51...（108 chars）",
  "stripeKeyValid": true,
  "keyMode": "TEST"
}
```

Si ves `"ok": false` con `"error": "Invalid API Key"`:
→ La clave es inválida o fue revocada.
→ **Solución:** Ve a Stripe Dashboard → Developers → API Keys → haz clic en «Reveal» junto a la clave secreta → cópiala completa → pégala en tu `.env`.

### 2. Verificar que las funciones responden (plugin activo)

Al iniciar `npm run dev`, el terminal debe mostrar:
```
[vite] Middleware loaded. Emulating features: ... functions ...
```

Si **no aparece ese mensaje**, las funciones no están activas y obtendrás 404:
- Asegúrate de tener `@netlify/vite-plugin` en tu `package.json` y en `vite.config.ts`.
- Verifica que existe el enlace simbólico: `client/netlify → ../netlify` (ejecuta `ls -la client/netlify`).
- Reinicia con `npm run dev` (no solo refresca el navegador).

### 3. Verificar variables de entorno en local

```bash
# Variables presentes en el .env
grep -E '^(STRIPE_|VITE_STRIPE)' .env

# Verificar que los dos symlinks existen
ls -la client/netlify   # → ../netlify
ls -la client/.env      # → ../.env
```

Deberías ver las 3-4 variables con valores que empiecen por `pk_` o `sk_`, y ambos symlinks apuntando a los destinos correctos.

> **Error "Stripe no está configurado en el servidor"**: el symlink `client/.env` falta o está roto.
> **Error "404 function not found"**: el symlink `client/netlify` falta o está roto.
> **Error "Invalid API Key"**: la clave en `.env` está equivocada o fue revocada.

---

## Desarrollo local paso a paso

```bash
# 1. Verificar (o crear) los dos symlinks necesarios
ls -la client/netlify   # debe mostrar: client/netlify -> ../netlify
ls -la client/.env      # debe mostrar: client/.env -> ../.env

# Si no existen (en macOS/Linux):
ln -s ../netlify client/netlify   # para que el plugin encuentre las funciones
ln -s ../.env    client/.env      # para que las funciones lean las variables de entorno

# En Windows (PowerShell como admin):
# New-Item -ItemType Junction -Path client\netlify -Target ..\netlify
# New-Item -ItemType SymbolicLink -Path client\.env -Target ..\.env

# 2. Instalar dependencias (solo la primera vez)
npm install

# 3. Copiar .env.example → .env y completar con claves TEST de Stripe
cp .env.example .env
# → edita .env con tus pk_test_ y sk_test_ (ver sección "Claves TEST vs LIVE")

# 4. Iniciar el servidor de desarrollo
npm run dev
# Debe aparecer en consola:
# [vite] Middleware loaded. Emulating features: ... functions ...

# 5. Verificar la clave antes de probar el pago
# → Abre http://localhost:5176/.netlify/functions/stripe-check
# → Debe devolver: { "ok": true, "stripeKeyValid": true }

# 6. Probar pago con tarjeta de prueba (solo con claves test):
# 4242 4242 4242 4242 | 12/26 | 123 | nombre cualquiera
# → Redirige a http://localhost:5176/libro/gracias
```

> **¿Por qué dos symlinks?**
> - `client/netlify → ../netlify`: el `@netlify/vite-plugin` busca las funciones relativo al `root` de Vite (`client/`).
> - `client/.env → ../.env`: el plugin inyecta variables de entorno en las funciones leyendo `.env` relativo al `root` de Vite. Sin este symlink, `process.env.STRIPE_SECRET_KEY` es `undefined` dentro de la función y obtienes el error *"Stripe no está configurado en el servidor"*.



---

## Netlify (producción)

En **Site settings → Environment variables** define al menos:

- `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_live_…` (necesaria en **build** para el bundle del cliente).
- `STRIPE_SECRET_KEY` = `sk_live_…` (marcada como **secret**, solo accesible en funciones).
- `STRIPE_WEBHOOK_SECRET` = `whsec_…` del endpoint de webhook.
- `URL` = URL canónica del sitio (p. ej. `https://marcelaresva.com`).

Tras cada cambio de variables en Netlify, haz un **nuevo deploy**.

---

## Webhook en Stripe

### Producción
1. Stripe Dashboard → **Developers → Webhooks → Add endpoint**.
2. URL: `https://<tu-dominio>/.netlify/functions/stripe-webhook-libro`.
3. Eventos: `checkout.session.completed`.
4. Copia el **Signing secret** (`whsec_…`) → `STRIPE_WEBHOOK_SECRET` en Netlify.

### Local (para probar el webhook)
```bash
# Instala Stripe CLI: https://stripe.com/docs/stripe-cli
stripe login
stripe listen --forward-to http://localhost:5176/.netlify/functions/stripe-webhook-libro
# El CLI te dará un whsec_ temporal → ponlo en STRIPE_WEBHOOK_SECRET en tu .env
# Reinicia npm run dev
```

---

## Seguridad

- `.env` está en `.gitignore` — nunca se sube al repositorio.
- La clave **publicable** (`pk_…`) puede ir al front; la **secreta** (`sk_…`) solo en variables de servidor.
- Si alguna clave se filtró, **rótala inmediatamente** en Stripe Dashboard y actualiza Netlify + tu `.env` local.

---

## Archivos de referencia

| Archivo | Rol |
|---------|-----|
| `client/src/pages/libro.tsx` | UI y llamada `fetch('/.netlify/functions/create-checkout-session', …)` |
| `netlify/functions/create-checkout-session.ts` | Creación de sesión de pago |
| `netlify/functions/stripe-webhook-libro.ts` | Webhook post-pago |
| `netlify/functions/stripe-check.ts` | Diagnóstico / health-check |
| `vite.config.ts` | `envDir` y fallback `VITE_STRIPE_PUBLISHABLE_KEY` |
| `client/netlify` | Enlace simbólico `→ ../netlify` para que el plugin encuentre las funciones |
| `.env.example` | Plantilla de variables de entorno |
