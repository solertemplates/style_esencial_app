# Style Essential – Affiliate Content Studio

**Tu contenido en dos idiomas. Convierte un producto en contenido.**

Aplicación web (HTML, CSS y JavaScript sencillos, sin frameworks) pensada para iPhone:

1. **Datos del producto**: sube una captura, léela con OCR (Tesseract.js, español + inglés) y revisa nombre, descripción, características, tienda (Amazon, Temu, AliExpress, Shein u otra) y enlace de afiliado.
2. **Configurar publicaciones**: idioma, estilo, longitud y redes (Facebook, Instagram, TikTok, YouTube, Pinterest).
3. **Publicaciones generadas**: una tarjeta por red, editable, con botón **Copiar**. El aviso de afiliado se adapta a la tienda y al idioma, y va justo después de la descripción y antes del enlace. En YouTube el título y la descripción se copian por separado; en Pinterest, el título, la descripción y el enlace.
   - Si el idioma es inglés y la IA está activa, el nombre, la descripción y las características se traducen y se corrigen los errores del OCR antes de crear las publicaciones.
4. **Ideas de tablero para Pinterest** (máximo 3 palabras). Toca una para copiarla.
5. **Prompt creativo** de imagen y de vídeo para tu herramienta de IA favorita.
6. **Mejorar con IA (opcional)**: usa OpenAI a través de una función segura en Vercel. Sin clave, la app funciona igual con plantillas.

La última configuración se guarda en el navegador (localStorage). No se publica nada automáticamente.

## Estructura

```
index.html            Página principal
css/styles.css        Estilos (móvil primero)
js/templates.js       ✏️ PLANTILLAS EDITABLES (frases, hashtags, tableros, prompts)
js/app.js             Lógica de la app
api/improve.js        Función de servidor de Vercel (lee OPENAI_API_KEY)
vercel.json           Configuración de la función
manifest.webmanifest  Para añadir la app a la pantalla de inicio
icons/                Iconos
```

Para cambiar los textos, edita `js/templates.js`: cada lista tiene varias frases y la app elige una al azar.

---

## 📱 Cómo publicarla en Vercel desde el iPhone (paso a paso)

Solo necesitas Safari y tu cuenta de GitHub (el código ya está en este repositorio).

### 1. Crea tu cuenta de Vercel
1. Abre Safari y entra en **vercel.com**.
2. Pulsa **Sign Up** (Registrarse).
3. Elige **Hobby** (gratis) y escribe tu nombre.
4. Pulsa **Continue with GitHub** y acepta los permisos.

### 2. Importa el proyecto
1. En el panel de Vercel pulsa **Add New…** → **Project**.
2. Si no ves tu repositorio, pulsa **Adjust GitHub App Permissions** (o *Configure GitHub App*) y da acceso a **style_esencial_app**.
3. Junto a **style_esencial_app** pulsa **Import**.
4. En **Framework Preset** deja **Other**. No cambies nada más.
5. Antes de desplegar, abre **Environment Variables** (lo explicamos abajo) si ya quieres activar la IA. Si no, puedes hacerlo luego.
6. Pulsa **Deploy** y espera un minuto.
7. Verás confeti 🎉 y una dirección del tipo `https://style-esencial-app.vercel.app`. ¡Esa es tu app!

> 💡 Vercel publica la rama principal (`main`). Si los cambios están en otra rama, en GitHub crea y fusiona un *Pull Request* hacia `main`, o en Vercel ve a **Settings → Git → Production Branch** y escribe el nombre de la rama.

### 3. Añade la clave de OpenAI (OPENAI_API_KEY)
1. Consigue tu clave en **platform.openai.com** → menú → **API keys** → **Create new secret key**. Cópiala (empieza por `sk-`). Asegúrate de tener saldo en *Billing*.
2. En Vercel, abre tu proyecto → **Settings** → **Environment Variables**.
3. Rellena:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: pega tu clave
   - Marca **Production**, **Preview** y **Development**.
4. Pulsa **Save**.
5. Ve a **Deployments**, toca los tres puntos `…` del último despliegue y pulsa **Redeploy**. (Las variables solo se aplican en un despliegue nuevo).
6. Abre tu app, despliega **⚙️ Mejorar con IA (opcional)** y verás **✅ IA disponible**.

**Variables opcionales** (mismo sitio):
- `APP_ACCESS_CODE`: un código secreto inventado por ti. Si lo pones, solo quien lo escriba en la app podrá usar la IA (así nadie más gasta tu saldo). **Muy recomendable.**
- `OPENAI_MODEL`: para cambiar el modelo. Por defecto usa `gpt-4o-mini`, que es económico y lee imágenes.

> 🔒 La clave **nunca** está en el código del navegador ni en GitHub: solo la lee la función `api/improve.js` dentro de Vercel. No la pegues nunca en ningún archivo.

### 4. Añádela a la pantalla de inicio del iPhone
1. Abre tu app en Safari.
2. Pulsa el botón **Compartir** (cuadrado con flecha).
3. Elige **Añadir a pantalla de inicio** → **Añadir**.

---

## GitHub Pages (opcional)
También funciona en GitHub Pages (**Settings → Pages → Deploy from a branch → main / root**), pero ahí no hay funciones de servidor: la app funciona solo con plantillas y el botón de IA no aparece.

## Notas
- El OCR descarga los idiomas la primera vez (unos MB); después va más rápido.
- Comprueba siempre los datos extraídos y cumple las normas de cada red y de tu programa de afiliados.
