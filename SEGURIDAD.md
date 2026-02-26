# 🔒 Guía de Seguridad - API Keys y Configuración

## ✅ Estado de Seguridad Actual

### Protecciones Implementadas

1. **✅ Variables de Entorno Protegidas**
   - `.env` está en `.gitignore` → NO se sube a Git
   - `.local/` está en `.gitignore` → NO se sube a Git
   - API keys solo se leen desde `process.env` en el servidor

2. **✅ Netlify Functions (Backend Serverless)**
   - Las API keys SOLO existen en el servidor (Netlify)
   - El cliente (navegador) NUNCA tiene acceso directo a las keys
   - Las functions validan requests antes de llamar a MailerLite

3. **✅ Sin Exposición en el Cliente**
   - El código del frontend NO contiene API keys
   - El frontend solo hace requests a `/.netlify/functions/`
   - Las Netlify Functions hacen las llamadas a MailerLite

## 🚨 Puntos Críticos de Seguridad

### 1. Archivo `.env` Local

**⚠️ NUNCA subas este archivo a Git**

```bash
# Verificar que .env está ignorado
git status

# Si aparece .env en la lista, significa que NO está ignorado (MAL)
# Asegúrate de que .gitignore contenga:
.env
.env.local
.env.production
```

### 2. Variables de Entorno en Netlify

Cuando configures Netlify:

```bash
# ✅ CORRECTO: Configurar en Netlify Dashboard
Site Settings → Environment Variables → Add variable

# ❌ INCORRECTO: Hardcodear en el código
const API_KEY = "eyJ0eXAiOiJKV1QiLCJh..."  // ¡NUNCA HAGAS ESTO!
```

### 3. Commits en Git

**Antes de hacer commit, SIEMPRE verifica:**

```bash
# Ver qué archivos vas a subir
git status

# Ver el contenido de los cambios
git diff

# Si ves alguna API key en el diff, NO HAGAS COMMIT
```

### 4. API Keys Expuestas Accidentalmente

Si accidentalmente subes una API key a Git:

1. **Rotar la API Key inmediatamente:**
   - Ve a MailerLite Dashboard
   - Revoca la API key expuesta
   - Genera una nueva
   - Actualiza `.env` local y Netlify

2. **Limpiar el historial de Git (opcional pero recomendado):**
   ```bash
   # Esto es avanzado, busca ayuda si no estás seguro
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

## 📋 Checklist de Seguridad

### Antes de Deploy

- [ ] `.env` está en `.gitignore`
- [ ] `.env` NO aparece en `git status`
- [ ] No hay API keys hardcodeadas en el código
- [ ] Variables configuradas en Netlify Dashboard

### Después de Deploy

- [ ] Verificar que las functions funcionan
- [ ] No hay errores de "API key missing"
- [ ] Los logs NO muestran API keys completas
- [ ] El formulario registra usuarios correctamente

## 🛡️ Mejores Prácticas

### 1. Separar Entornos

```bash
# Desarrollo (local)
.env

# Producción (Netlify)
Configurar en Netlify Dashboard
```

### 2. No Loguear Información Sensible

```javascript
// ❌ MALO
console.log('API Key:', process.env.MAILERLITE_API_KEY);

// ✅ BUENO
console.log('API Key presente:', !!process.env.MAILERLITE_API_KEY);
```

### 3. Validar en el Servidor

```javascript
// ✅ BUENO: Validar en Netlify Function
export const handler: Handler = async (event) => {
  const apiKey = process.env.MAILERLITE_API_KEY;
  
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Server configuration error' })
    };
  }
  
  // Usar apiKey para llamar a MailerLite
};
```

### 4. Rotación Regular de Keys

- Rotar API keys cada 3-6 meses
- Usar diferentes keys para desarrollo y producción si es posible

## 🔍 Cómo Verificar que Todo Está Seguro

### 1. Buscar API Keys en el Código

```bash
# Buscar strings que parezcan API keys
git grep -i "eyJ0eXAi"
git grep -i "MAILERLITE_API_KEY.*="

# No debería devolver resultados en archivos trackeados
```

### 2. Verificar .gitignore

```bash
# Probar si .env está ignorado
git check-ignore -v .env

# Debería mostrar: .gitignore:9:.env    .env
```

### 3. Ver Historial de Git

```bash
# Buscar en el historial si alguna vez se subió una API key
git log -S "eyJ0eXAi" --all

# No debería devolver resultados
```

## 📞 En Caso de Emergencia

### Si la API Key se Expone Públicamente:

1. **Inmediato (en 5 minutos):**
   - Ve a [MailerLite API Settings](https://dashboard.mailerlite.com/integrations/api/)
   - Revoca la API key comprometida
   - Genera una nueva API key

2. **Actualizar (en 10 minutos):**
   - Actualiza `.env` local con la nueva key
   - Actualiza Netlify → Site Settings → Environment Variables
   - Redeploy el sitio en Netlify

3. **Verificar (en 15 minutos):**
   - Prueba el formulario de suscripción
   - Verifica que funcione con la nueva key
   - Monitorea los logs de Netlify Functions

## 🎯 Arquitectura de Seguridad

```
Usuario (Navegador)
    ↓
    | Solo envía: firstName, email
    |
Netlify Functions (Servidor)
    ↓
    | Usa API Key desde process.env
    | API Key NUNCA llega al navegador
    |
MailerLite API
```

**Importante:** El navegador del usuario NUNCA ve la API key.

## ✅ Verificación Final

Ejecuta estos comandos para verificar:

```bash
# 1. Verificar que .env no está en git
git ls-files | grep .env
# Debería no devolver resultados

# 2. Verificar que .env está ignorado
git status --ignored | grep .env
# Debería mostrar .env como ignorado

# 3. Buscar API keys en código trackeado
git grep -E "(MAILERLITE_API_KEY|eyJ0eXAi)" -- '*.ts' '*.tsx' '*.js' '*.jsx'
# Solo debería encontrar: process.env.MAILERLITE_API_KEY
```

---

## 📚 Recursos Adicionales

- [Netlify Environment Variables](https://docs.netlify.com/environment-variables/overview/)
- [MailerLite API Security](https://developers.mailerlite.com/docs/authentication)
- [Git Secrets (herramienta)](https://github.com/awslabs/git-secrets)

---

**Última actualización:** 7 de febrero de 2026

**Recuerda:** La seguridad es responsabilidad de todos. Ante la duda, NO subas el archivo.
