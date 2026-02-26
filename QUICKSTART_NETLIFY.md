# 🚀 Quick Start - Deploy en Netlify

## ✅ Cambio Realizado

**Problema:** Node.js versión 20.16.11 no existe en Netlify  
**Solución:** Cambiado a Node.js 20 (versión LTS estable)

## 📝 Pasos para Deploy

### 1. Hacer Commit y Push

```bash
# Agregar todos los cambios
git add .

# Hacer commit
git commit -m "feat: migración completa a Netlify con Functions serverless"

# Subir a GitHub
git push origin main
```

### 2. Configurar Variables de Entorno en Netlify

Antes de que funcione el sitio, DEBES configurar estas variables:

1. Ve a tu sitio en Netlify
2. Site settings → Environment variables
3. Agrega estas 2 variables:

| Variable | Valor | Cómo obtenerlo |
|----------|-------|----------------|
| `MAILERLITE_API_KEY` | Tu API key | Ya la tienes guardada en `.env` local |
| `MAILERLITE_GROUP_ID` | El ID de tu grupo | Ve a https://dashboard.mailerlite.com/groups |

### 3. Redeploy

Una vez configuradas las variables:

1. Site overview → Deploys
2. Click "Trigger deploy" → "Deploy site"
3. Espera 2-3 minutos

## 🔍 Verificación de Seguridad

### ✅ Confirmado: API Keys NO Están Expuestas

- ✅ `.env` está en `.gitignore`
- ✅ `.env` NO se subió a Git
- ✅ API keys solo en el servidor (Netlify Functions)
- ✅ El frontend NO tiene acceso a las keys

### Comandos para verificar localmente:

```bash
# Verificar que .env no está en git
git ls-files | grep .env
# (No debe devolver resultados)

# Ver estado de git
git status
# (.env NO debe aparecer en la lista de cambios)
```

## 📊 Archivos que se Subirán a Git

### ✅ Se SUBEN (seguro):
- `netlify.toml` - Configuración de Netlify
- `netlify/functions/*.ts` - Funciones serverless
- `.nvmrc` - Versión de Node
- `.gitignore` - Lista de archivos ignorados
- `.env.example` - Template sin datos reales
- Código del frontend y configuración

### ❌ NO se SUBEN (protegido):
- `.env` - Contiene tu API key real
- `.local/` - Estado local
- `node_modules/` - Dependencias
- `dist/` - Build generado

## 🎯 Obtener el Group ID de MailerLite

Si aún no lo tienes:

1. Ve a https://dashboard.mailerlite.com/groups
2. Selecciona tu grupo (ej: "Shifting Souls Community")
3. La URL se verá así:
   ```
   https://dashboard.mailerlite.com/groups/160033952049923407
   ```
4. Copia el número largo: `160033952049923407`
5. Úsalo como `MAILERLITE_GROUP_ID` en Netlify

## 🔧 Si el Deploy Falla

### Error: "API key is missing"
→ Configura `MAILERLITE_API_KEY` en Netlify Environment Variables

### Error: "Function not found"
→ Asegúrate de que `netlify/functions/` se subió a Git

### Error: Build fails
→ Verifica que `package.json` y `netlify.toml` se subieron correctamente

## 📞 Soporte

Si tienes problemas:
1. Lee `SEGURIDAD.md` para verificar que las API keys están protegidas
2. Lee `DEPLOY_NETLIFY.md` para guía completa
3. Revisa los logs en Netlify → Functions → Function logs

---

## 🎉 Resumen

**Antes de deploy:**
```bash
git add .
git commit -m "feat: migración a Netlify"
git push origin main
```

**En Netlify Dashboard:**
1. Configurar `MAILERLITE_API_KEY`
2. Configurar `MAILERLITE_GROUP_ID`
3. Trigger deploy

**Resultado:**
✅ Sitio funcionando en Netlify  
✅ API keys seguras  
✅ $0/mes de costo  

---

**Última actualización:** 7 de febrero de 2026
