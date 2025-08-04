# Guía de Despliegue - Rama Automotores

## 🚀 Pasos para Deploy en Vercel

### 1. Preparar el Repositorio
\`\`\`bash
git add .
git commit -m "Ready for deployment"
git push origin main
\`\`\`

### 2. Configurar Vercel
1. Ve a [vercel.com](https://vercel.com)
2. Conecta tu repositorio de GitHub
3. Configura las variables de entorno:

#### Variables de Entorno Requeridas:
\`\`\`env
BLOB_READ_WRITE_TOKEN=vercel_blob_token
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
WHATSAPP_PHONE_NUMBER=5491123456789
\`\`\`

### 3. Configurar Supabase
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ejecuta los scripts SQL:
   - `scripts/create-tables.sql`
   - `scripts/create-users-table.sql`
3. Copia las credenciales a Vercel

### 4. Configurar Vercel Blob
1. Ve a tu dashboard de Vercel
2. Navega a Storage → Blob
3. Crea un nuevo Blob store
4. Copia el token a las variables de entorno

### 5. Deploy
1. Haz push a tu repositorio
2. Vercel desplegará automáticamente
3. Verifica que todo funcione correctamente

## 🔧 Configuración Post-Deploy

### Personalizar Información
1. Cambia el número de WhatsApp en el código
2. Actualiza la información de contacto
3. Modifica los datos de la empresa en el footer

### Usuarios Admin
- **admin** / rama2024
- **juan** / juan123  
- **maria** / maria456

### URLs Importantes
- **Sitio principal**: `/`
- **Catálogo**: `/autos`
- **Admin**: `/admin`
- **Contacto**: `/contacto`

## 📱 Funcionalidades
- ✅ Catálogo de autos con filtros
- ✅ Panel de administración completo
- ✅ Subida de imágenes
- ✅ Integración WhatsApp
- ✅ Formulario de contacto
- ✅ Base de datos Supabase
- ✅ Responsive design

## 🛠️ Mantenimiento
- Los datos se guardan en Supabase
- Las imágenes se almacenan en Vercel Blob
- Backups automáticos de Supabase
- Monitoreo en dashboard de Vercel
