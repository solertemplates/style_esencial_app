/* Función de servidor de Vercel: /api/improve
   - La clave se lee SOLO de la variable de entorno OPENAI_API_KEY.
   - Nunca se envía al navegador.
   - Opcional: APP_ACCESS_CODE para que solo tú puedas usar la IA.
   - Opcional: OPENAI_MODEL para cambiar el modelo (por defecto, uno económico). */

const DEFAULT_MODEL = "gpt-4o-mini";
const MAX_IMAGE_CHARS = 6 * 1024 * 1024; // ~4,5 MB de imagen en base64
const NETWORKS = ["facebook", "instagram", "tiktok", "youtube", "pinterest"];

const STYLE_TEXT = {
  cercano: "cercano, cálido y atractivo, como una recomendación entre amigas",
  elegante: "elegante, refinado y sobrio",
  directo: "directo y vendedor, con urgencia y beneficios claros"
};

const NETWORK_RULES = {
  facebook: "Facebook: tono conversacional, 1-3 párrafos, 2-3 hashtags como máximo.",
  instagram: "Instagram: gancho fuerte en la primera línea, emojis con moderación, saltos de línea, 8-15 hashtags al final.",
  tiktok: "TikTok: pie de vídeo breve y con gancho, 3-5 hashtags. Si es texto detallado, añade una mini idea de guion por segundos.",
  youtube: "YouTube: campo \"title\" (máx. 100 caracteres, sin enlace) y campo \"description\" con beneficios, enlace e invitación a suscribirse; 3 hashtags.",
  pinterest: "Pinterest: campo \"title\" (máx. 100 caracteres) y campo \"description\" rica en palabras clave (máx. 500 caracteres en total, aviso incluido), sin enlace (el enlace va aparte) y sin abusar de emojis."
};

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(data));
}

const str = (v, max) => (typeof v === "string" ? v.slice(0, max) : "");

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  const chunks = [];
  for await (const c of req) chunks.push(c);
  return JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
}

async function askOpenAI(messages, maxTokens, temperature = 0.8) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || DEFAULT_MODEL,
        messages,
        response_format: { type: "json_object" },
        max_tokens: maxTokens,
        temperature
      }),
      signal: controller.signal
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = (data.error && data.error.message) || `OpenAI respondió ${r.status}`;
      const err = new Error(msg);
      err.status = r.status === 401 ? 500 : 502;
      throw err;
    }
    const content = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
    return JSON.parse(content || "{}");
  } finally {
    clearTimeout(timer);
  }
}

function visionMessages(image, lang) {
  const language = lang === "en" ? "inglés" : "español";
  return [
    {
      role: "system",
      content: "Eres un asistente que extrae datos de productos a partir de capturas de tiendas online. Responde solo con JSON válido."
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text:
            `Lee esta captura de un producto y devuelve JSON con este formato exacto: ` +
            `{"name": "nombre del producto, corto y claro", "description": "descripción corta de 1-2 frases", "features": ["característica 1", "característica 2"]}. ` +
            `Máximo 6 características breves. Ignora precios, valoraciones, botones y datos de envío. ` +
            `Escribe los textos en ${language}. No inventes datos que no aparezcan.`
        },
        { type: "image_url", image_url: { url: image, detail: "auto" } }
      ]
    }
  ];
}

function translateMessages(body) {
  const product = body.product || {};
  const data = {
    name: str(product.name, 300),
    description: str(product.desc, 1000),
    features: (Array.isArray(product.features) ? product.features : []).slice(0, 12).map((f) => str(String(f), 300))
  };
  return [
    {
      role: "system",
      content:
        "You translate e-commerce product data into natural English. The text may come from OCR, so first fix " +
        "obvious OCR mistakes (misread letters such as l/I or 0/O, broken or merged words, stray symbols). " +
        "Keep brand names, model numbers and measurements. Do not invent information. " +
        'Reply only with JSON: {"name": "...", "description": "...", "features": ["..."]} with the same number of features.'
    },
    { role: "user", content: JSON.stringify(data) }
  ];
}

function postsMessages(body) {
  const product = body.product || {};
  const settings = body.settings || {};
  const lang = settings.lang === "en" ? "en" : "es";
  const networks = (Array.isArray(body.networks) ? body.networks : []).filter((n) => NETWORKS.includes(n));
  const features = (Array.isArray(product.features) ? product.features : []).slice(0, 12).map((f) => str(f, 200));
  // Cada borrador es un objeto de campos: { text } o { title, description }
  const drafts = {};
  networks.forEach((n) => {
    const src = (body.posts && body.posts[n]) || {};
    drafts[n] = {};
    ["text", "title", "description"].forEach((f) => { if (typeof src[f] === "string") drafts[n][f] = str(src[f], 3000); });
  });
  const link = str(product.link, 500);
  const disclaimer = str(body.disclaimer, 200);

  const instructions = [
    `Eres una experta en marketing de afiliados y redes sociales.`,
    `Reescribe cada borrador para que suene natural, humano y atractivo, adaptado a su red.`,
    `Idioma de salida: ${lang === "en" ? "inglés" : "español"}.`,
    `Estilo: ${STYLE_TEXT[settings.style] || STYLE_TEXT.cercano}.`,
    `Longitud: ${settings.length === "long" ? "texto detallado" : "texto corto"}.`,
    `Reglas por red:\n${networks.map((n) => "- " + NETWORK_RULES[n]).join("\n")}`,
    link ? `En los campos "text" y en la "description" de YouTube incluye SIEMPRE este enlace exacto, sin cambiarlo: ${link}` : `No hay enlace todavía: deja el marcador que aparece en el borrador.`,
    `En cada campo "text" y "description" incluye SIEMPRE este aviso de afiliado exacto: "${disclaimer}".`,
    `Coloca el aviso en una línea propia JUSTO DESPUÉS de la descripción del producto y ANTES del enlace. Nunca lo pongas al final.`,
    `Devuelve exactamente los mismos campos que tiene cada borrador.`,
    `No inventes precios, descuentos, garantías ni afirmaciones médicas. Usa solo los datos dados.`,
    `Además propone 5 nombres de tablero de Pinterest de 3 palabras como máximo, en el mismo idioma.`,
    `Responde solo con JSON: {"posts": {${networks.map((n) => `"${n}": {${Object.keys(drafts[n]).map((f) => `"${f}": "..."`).join(", ")}}`).join(", ")}}, "boards": ["..."]}`
  ].join("\n");

  const data = {
    producto: { nombre: str(product.name, 200), descripcion: str(product.desc, 600), caracteristicas: features },
    borradores: drafts
  };

  return [
    { role: "system", content: instructions },
    { role: "user", content: JSON.stringify(data) }
  ];
}

module.exports = async function handler(req, res) {
  const configured = Boolean(process.env.OPENAI_API_KEY);

  if (req.method === "GET") {
    return send(res, 200, { configured, accessCodeRequired: Boolean(process.env.APP_ACCESS_CODE) });
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return send(res, 405, { message: "Método no permitido." });
  }
  if (!configured) {
    return send(res, 503, { error: "no_key", message: "La IA no está configurada (falta OPENAI_API_KEY)." });
  }
  if (process.env.APP_ACCESS_CODE && req.headers["x-access-code"] !== process.env.APP_ACCESS_CODE) {
    return send(res, 401, { message: "Código de acceso incorrecto. Revísalo en ⚙️ Mejorar con IA." });
  }

  let body;
  try {
    body = await readBody(req);
  } catch (e) {
    return send(res, 400, { message: "Datos no válidos." });
  }

  try {
    if (body.mode === "vision") {
      const image = str(body.image, MAX_IMAGE_CHARS + 1);
      if (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(image) || image.length > MAX_IMAGE_CHARS) {
        return send(res, 400, { message: "Imagen no válida o demasiado grande." });
      }
      const out = await askOpenAI(visionMessages(image, body.lang), 600);
      return send(res, 200, {
        name: str(out.name, 200),
        description: str(out.description, 600),
        features: (Array.isArray(out.features) ? out.features : []).slice(0, 8).map((f) => str(String(f), 200))
      });
    }

    if (body.mode === "translate") {
      const out = await askOpenAI(translateMessages(body), 1200, 0.2);
      return send(res, 200, {
        name: str(out.name, 200),
        description: str(out.description, 1000),
        features: (Array.isArray(out.features) ? out.features : []).slice(0, 12).map((f) => str(String(f), 300))
      });
    }

    if (body.mode === "posts") {
      const networks = (Array.isArray(body.networks) ? body.networks : []).filter((n) => NETWORKS.includes(n));
      if (!networks.length) return send(res, 400, { message: "No hay publicaciones que mejorar." });
      const out = await askOpenAI(postsMessages(body), 2500);
      const posts = {};
      networks.forEach((n) => {
        const src = out.posts && out.posts[n];
        if (!src) return;
        if (typeof src === "string") { posts[n] = { text: str(src, 5000) }; return; }
        posts[n] = {};
        ["text", "title", "description"].forEach((f) => { if (typeof src[f] === "string") posts[n][f] = str(src[f], 5000); });
      });
      const boards = (Array.isArray(out.boards) ? out.boards : []).slice(0, 8).map((b) => str(String(b), 60));
      return send(res, 200, { posts, boards });
    }

    return send(res, 400, { message: "Modo no válido." });
  } catch (err) {
    const aborted = err.name === "AbortError";
    return send(res, aborted ? 504 : err.status || 500, {
      message: aborted ? "La IA ha tardado demasiado. Inténtalo de nuevo." : "Error de IA: " + err.message
    });
  }
};
