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
| Carga de `.env` en local | `netlify/functions/load-repo-dotenv.ts` | Si falta `STRIPE_SECRET_KEY`, lee el `.env` de la raíz del repo (evita depender del symlink `client/.env`). |
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

### Mensajes habituales en la consola del navegador

| Mensaje | Qué significa |
|---------|----------------|
| *You may test your Stripe.js integration over HTTP…* con `pk_live` en `http://localhost` | Aviso esperado: en local no hay HTTPS. Para evitarlo usa claves **test** en desarrollo. |
| *Content Security Policy… report-only* | Solo **informa**; no bloquea. Suele ser extensión del navegador o política corporativa. Si en algún entorno pasara a *enforce*, habría que permitir los orígenes que [documenta Stripe](https://docs.stripe.com/security/guide#content-security-policy) para `js.stripe.com` y APIs. |
| `GET https://api.stripe.com/v1/elements/sessions … 400` | Suele ser **`pk_…` y `sk_…` de cuentas distintas** o test/live mezclados. Revisa Dashboard → API keys y las variables en Netlify / `.env`. La página `/libro` usa `fetchClientSecret` en el proveedor para alinear sesión e iframe. |

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
# Variables presentes en el .env (en la raíz del repo, junto a package.json)
grep -E '^(STRIPE_|VITE_STRIPE)' .env

# Enlace para que el plugin encuentre las funciones (sigue siendo necesario)
ls -la client/netlify   # → ../netlify
```

Deberías ver las variables con valores que empiecen por `pk_` o `sk_`, y el enlace `client/netlify`.

> **Error "Stripe no está configurado en el servidor"**: no hay `STRIPE_SECRET_KEY` en el `.env` de la raíz, o la línea está mal escrita. Las funciones Stripe cargan ese archivo automáticamente si la variable no llegó por el plugin; no hace falta `client/.env`.
> **Error "404 function not found"**: el symlink `client/netlify` falta o está roto.
> **Error "Invalid API Key"**: la clave en `.env` está equivocada o fue revocada.

---

## Desarrollo local paso a paso

```bash
# 1. Enlace para que @netlify/vite-plugin encuentre netlify/functions (necesario)
ls -la client/netlify   # debe mostrar: client/netlify -> ../netlify

# Si no existe (macOS / Linux):
ln -s ../netlify client/netlify

# En Windows (PowerShell como admin):
# New-Item -ItemType Junction -Path client\netlify -Target ..\netlify

# Opcional: client/.env -> ../.env (ya no es obligatorio para Stripe; las funciones leen la raíz con dotenv)
# ln -s ../.env client/.env

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

> **¿Por qué `client/netlify`?** El `@netlify/vite-plugin` resuelve la carpeta de funciones relativa al `root` de Vite (`client/`). Sin ese enlace, las rutas `/.netlify/functions/*` devuelven 404 en local.
>
> Las funciones de Stripe llaman a `loadRepoDotenvIfMissingStripe()` al cargar el módulo: si `STRIPE_SECRET_KEY` no está definida, leen el `.env` de la raíz del repositorio (junto a `package.json`). Así funciona el checkout en local tras un `git clone` sin crear `client/.env`.



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
| `netlify/functions/load-repo-dotenv.ts` | Carga del `.env` raíz en local si falta `STRIPE_SECRET_KEY` |
| `vite.config.ts` | `envDir` y fallback `VITE_STRIPE_PUBLISHABLE_KEY` |
| `client/netlify` | Enlace simbólico `→ ../netlify` para que el plugin encuentre las funciones |
| `.env.example` | Plantilla de variables de entorno |
