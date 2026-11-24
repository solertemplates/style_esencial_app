/* Style Essential – Affiliate Content Studio
   Lógica principal. Todo funciona en el navegador; la IA es opcional. */
(function () {
  "use strict";

  const T = window.SE_TEMPLATES;
  const STORAGE_KEY = "styleEssential:v1";
  const TESSERACT_URL = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
  const API_URL = "/api/improve";
  const NETWORK_LABELS = { facebook: "Facebook", instagram: "Instagram", tiktok: "TikTok", youtube: "YouTube", pinterest: "Pinterest" };

  const $ = (id) => document.getElementById(id);
  const els = {
    imageInput: $("imageInput"), fileName: $("fileName"), preview: $("preview"),
    ocrBtn: $("ocrBtn"), visionBtn: $("visionBtn"),
    ocrProgress: $("ocrProgress"), ocrBar: $("ocrBar"), ocrText: $("ocrText"),
    name: $("productName"), desc: $("productDesc"), features: $("productFeatures"), link: $("affiliateLink"),
    generateBtn: $("generateBtn"), resetBtn: $("resetBtn"),
    results: $("results"), boards: $("boards"),
    aiBox: $("aiBox"), improveBtn: $("improveBtn"), aiStatus: $("aiStatus"),
    aiConfigStatus: $("aiConfigStatus"), accessCodeWrap: $("accessCodeWrap"), accessCode: $("accessCode"),
    imgPromptBtn: $("imgPromptBtn"), vidPromptBtn: $("vidPromptBtn"),
    imgPromptBox: $("imgPromptBox"), vidPromptBox: $("vidPromptBox"),
    imgPrompt: $("imgPrompt"), vidPrompt: $("vidPrompt"),
    toast: $("toast")
  };

  let currentFile = null;
  let aiAvailable = false;

  /* ================= Utilidades ================= */
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => arr.map((v) => [Math.random(), v]).sort((a, b) => a[0] - b[0]).map((p) => p[1]);
  const fill = (str, data) => str.replace(/\{(\w+)\}/g, (m, k) => (data[k] !== undefined ? data[k] : m));
  const radio = (name) => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;
  const setRadio = (name, value) => {
    const el = document.querySelector(`input[name="${name}"][value="${CSS.escape(String(value))}"]`);
    if (el) el.checked = true;
  };
  const checkedNetworks = () => [...document.querySelectorAll('input[name="network"]:checked')].map((i) => i.value);
  const truncate = (s, n) => (s.length <= n ? s : s.slice(0, n - 1).replace(/\s+\S*$/, "") + "…");
  const ensureDot = (s) => (s && !/[.!?…]$/.test(s.trim()) ? s.trim() + "." : s.trim());

  let toastTimer;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  async function copyText(text, btn) {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch (e) {
      // Alternativa para navegadores antiguos / iOS sin permisos
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, text.length);
      try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
      document.body.removeChild(ta);
    }
    if (ok) {
      toast("¡Copiado! ✅");
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "¡Copiado!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("copied"); }, 1500);
      }
    } else {
      toast("No se pudo copiar. Mantén pulsado el texto para copiarlo.");
    }
  }

  function autoGrow(ta) {
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight + 4, 900) + "px";
  }

  /* ================= Datos del producto ================= */
  function getProduct() {
    return {
      name: els.name.value.trim(),
      desc: els.desc.value.trim(),
      features: els.features.value.split(/\r?\n/).map((f) => f.replace(/^[\s•·\-*▪●◦✓✔]+/, "").trim()).filter(Boolean),
      link: els.link.value.trim()
    };
  }

  function getSettings() {
    return {
      lang: radio("lang") || "es",
      style: radio("style") || "cercano",
      length: radio("length") || "short",
      networks: checkedNetworks(),
      visual: radio("visual") || "lujo",
      format: radio("format") || "9:16"
    };
  }

  /* ================= Guardado local ================= */
  function save() {
    try {
      const data = {
        settings: getSettings(),
        product: { name: els.name.value, desc: els.desc.value, features: els.features.value, link: els.link.value },
        accessCode: els.accessCode.value
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* almacenamiento no disponible: no pasa nada */ }
  }

  function load() {
    let data;
    try { data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (e) { data = null; }
    if (!data) return;
    const s = data.settings || {};
    ["lang", "style", "length", "visual", "format"].forEach((k) => s[k] && setRadio(k, s[k]));
    if (Array.isArray(s.networks)) {
      document.querySelectorAll('input[name="network"]').forEach((i) => { i.checked = s.networks.includes(i.value); });
    }
    const p = data.product || {};
    els.name.value = p.name || "";
    els.desc.value = p.desc || "";
    els.features.value = p.features || "";
    els.link.value = p.link || "";
    els.accessCode.value = data.accessCode || "";
  }

  /* ================= Categoría y hashtags ================= */
  function detectCategory(product) {
    const text = [product.name, product.desc, ...product.features].join(" ").toLowerCase();
    let best = null, bestScore = 0;
    T.categories.forEach((cat) => {
      let score = 0;
      cat.keywords.forEach((k) => {
        const re = new RegExp("(^|[^a-záéíóúñü])" + k.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
        if (re.test(text)) score += product.name.toLowerCase().includes(k.toLowerCase()) ? 3 : 1;
      });
      if (score > bestScore) { bestScore = score; best = cat; }
    });
    return best;
  }

  function toTag(word) {
    const clean = word.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9ñÑ]/g, "");
    return clean.toLowerCase();
  }

  function buildHashtags(product, lang, network, max) {
    const cat = detectCategory(product);
    const words = product.name.split(/\s+/).map(toTag)
      .filter((w) => w.length > 2 && !/^\d+$/.test(w) && !T.stopwords.includes(w));
    const nameTags = words.filter((w) => w.length > 3).slice(0, 2);
    const compact = words.slice(0, 2).join("");
    const pool = [
      ...nameTags,
      ...(compact.length > 4 && compact.length < 25 ? [compact] : []),
      ...(cat ? shuffle(cat.tags[lang]) : []),
      ...shuffle(T[lang].networkTags[network] || [])
    ];
    const unique = [...new Set(pool)].filter(Boolean).slice(0, max);
    return unique.map((t) => "#" + t).join(" ");
  }

  /* ================= Generador de publicaciones ================= */
  function buildPost(network, product, settings) {
    const L = T[settings.lang];
    const { style, length } = settings;
    const long = length === "long";
    const name = product.name || (settings.lang === "es" ? "este producto" : "this product");
    const desc = ensureDot(product.desc || L.defaultDesc);
    const link = product.link || (settings.lang === "es" ? "[pega aquí tu enlace]" : "[paste your link here]");
    const data = { name, desc, link };
    const hook = fill(pick(L.hooks[style]), data);
    const intro = pick(L.intros[style]);
    const closer = pick(L.closers[style]);
    const cta = fill(pick(L.cta[network]), data);
    const disclaimer = L.disclaimer;
    const feats = (n) => product.features.slice(0, n);
    const bullet = style === "elegante" ? "▫️" : style === "directo" ? "✅" : "✨";
    const featBlock = (n) => {
      const f = feats(n);
      return f.length ? pick(L.featureTitle) + "\n" + f.map((x) => `${bullet} ${x}`).join("\n") : "";
    };
    const parts = [];

    switch (network) {
      case "facebook":
        parts.push(hook, desc);
        if (long) parts.push(intro, featBlock(8), closer);
        else if (product.features.length) parts.push(feats(2).map((x) => `${bullet} ${x}`).join("\n"));
        parts.push(cta, buildHashtags(product, settings.lang, network, 3), disclaimer);
        break;

      case "instagram":
        parts.push(hook, desc);
        parts.push(long ? intro + "\n\n" + featBlock(8) : featBlock(3));
        if (long) parts.push(closer);
        parts.push(cta, disclaimer, "·\n·\n" + buildHashtags(product, settings.lang, network, long ? 15 : 10));
        break;

      case "tiktok": {
        const short = truncate(hook, 150);
        parts.push(short);
        if (long) {
          parts.push(desc, featBlock(4));
        } else if (product.features[0]) {
          parts.push(`${bullet} ${product.features[0]}`);
        }
        parts.push(cta, buildHashtags(product, settings.lang, network, 5), disclaimer);
        if (long) {
          const S = L.tiktokScript;
          parts.push("———\n" + S.title + "\n" + S.steps.map((s) => "• " + fill(s, { hook: short })).join("\n"));
        }
        break;
      }

      case "youtube": {
        const Y = L.youtube;
        const title = truncate(fill(pick(Y.titles), data), 100);
        const label = settings.lang === "es" ? "📌 Título:" : "📌 Title:";
        const descLabel = settings.lang === "es" ? "📝 Descripción:" : "📝 Description:";
        parts.push(`${label} ${title}`, descLabel + "\n" + hook + " " + desc);
        if (long) parts.push(intro, featBlock(8), Y.chapters);
        else if (product.features.length) parts.push(feats(3).map((x) => `${bullet} ${x}`).join("\n"));
        parts.push(cta, disclaimer, pick(Y.subscribe), buildHashtags(product, settings.lang, network, 3));
        break;
      }

      case "pinterest": {
        const title = truncate(fill(pick(L.pinterestTitle), data), 100);
        const label = settings.lang === "es" ? "📌 Título del pin:" : "📌 Pin title:";
        const descLabel = settings.lang === "es" ? "📝 Descripción:" : "📝 Description:";
        let body = desc + " " + intro;
        if (long && product.features.length) body += " " + feats(4).join(" · ") + ".";
        body = truncate(body, long ? 420 : 250);
        parts.push(`${label} ${title}`, descLabel + "\n" + body + "\n" + buildHashtags(product, settings.lang, network, 5), cta, disclaimer);
        break;
      }
    }
    return parts.filter((p) => p && p.trim()).join("\n\n");
  }

  function renderPost(network, text, fromAI) {
    let card = els.results.querySelector(`.post[data-network="${network}"]`);
    if (!card) {
      card = document.createElement("article");
      card.className = "post";
      card.dataset.network = network;
      card.innerHTML = `
        <div class="post-head">
          <span class="badge badge-${network}">${NETWORK_LABELS[network]}</span>
          <span class="count"></span>
        </div>
        <textarea class="post-text" aria-label="Publicación para ${NETWORK_LABELS[network]}"></textarea>
        <div class="post-actions">
          <button type="button" class="btn btn-copy">Copiar</button>
          <button type="button" class="btn btn-small btn-regen" title="Crear otra versión">↻ Otra versión</button>
        </div>`;
      els.results.appendChild(card);
      const ta = card.querySelector("textarea");
      ta.addEventListener("input", () => { updateCount(card); autoGrow(ta); });
      card.querySelector(".btn-copy").addEventListener("click", (e) => copyText(ta.value, e.currentTarget));
      card.querySelector(".btn-regen").addEventListener("click", () => {
        renderPost(network, buildPost(network, getProduct(), getSettings()), false);
      });
    }
    const ta = card.querySelector("textarea");
    ta.value = text;
    const head = card.querySelector(".post-head");
    const flag = head.querySelector(".ai-flag");
    if (fromAI && !flag) head.querySelector(".badge").insertAdjacentHTML("afterend", '<span class="ai-flag">✨ IA</span>');
    if (!fromAI && flag) flag.remove();
    updateCount(card);
    requestAnimationFrame(() => autoGrow(ta));
  }

  function updateCount(card) {
    const n = card.querySelector("textarea").value.length;
    card.querySelector(".count").textContent = `${n} caracteres`;
  }

  /* ================= Tableros Pinterest ================= */
  function boardIdeas(product, lang) {
    const cat = detectCategory(product);
    const list = shuffle([...(cat ? cat.boards[lang] : []), ...shuffle(T.genericBoards[lang]).slice(0, cat ? 2 : 6)]);
    return [...new Set(list)].filter((b) => b.trim().split(/\s+/).length <= 3).slice(0, 6);
  }

  function renderBoards(list) {
    els.boards.innerHTML = "";
    const wrap = document.createElement("div");
    wrap.className = "board-list";
    list.forEach((b) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "board";
      btn.textContent = b;
      btn.title = "Toca para copiar";
      btn.addEventListener("click", () => copyText(b));
      wrap.appendChild(btn);
    });
    els.boards.appendChild(wrap);
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Toca un nombre para copiarlo.";
    els.boards.appendChild(hint);
  }

  /* ================= Generar todo ================= */
  function generate() {
    const product = getProduct();
    const settings = getSettings();
    if (!product.name) {
      toast("Escribe al menos el nombre del producto.");
      els.name.focus();
      return;
    }
    if (!settings.networks.length) {
      toast("Elige al menos una red social.");
      return;
    }
    if (!product.link) toast("Consejo: añade tu enlace de afiliado.");

    els.results.innerHTML = "";
    settings.networks.forEach((n) => renderPost(n, buildPost(n, product, settings), false));
    renderBoards(boardIdeas(product, settings.lang));
    els.aiBox.hidden = !aiAvailable;
    els.aiStatus.textContent = "";
    save();
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    if (!confirm("¿Seguro que quieres limpiar el formulario?")) return;
    els.name.value = els.desc.value = els.features.value = els.link.value = "";
    els.imageInput.value = "";
    currentFile = null;
    els.preview.hidden = true;
    els.preview.removeAttribute("src");
    els.fileName.textContent = "Ningún archivo seleccionado";
    els.ocrBtn.disabled = true;
    els.visionBtn.disabled = true;
    els.results.innerHTML = '<p class="empty">Tus publicaciones aparecerán aquí. Completa los datos y pulsa <strong>Crear mis publicaciones</strong>.</p>';
    els.boards.innerHTML = '<p class="empty">Las ideas de tablero aparecerán al crear tus publicaciones.</p>';
    els.imgPromptBox.hidden = els.vidPromptBox.hidden = true;
    els.aiBox.hidden = true;
    save();
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast("Formulario limpio ✨");
  }

  /* ================= Prompts creativos ================= */
  function promptData() {
    const p = getProduct();
    const s = getSettings();
    const lang = s.lang;
    return {
      p, lang,
      name: p.name || (lang === "es" ? "el producto" : "the product"),
      feats: p.features.slice(0, 4).join(", "),
      visual: T.visualStyles[s.visual][lang],
      format: T.formats[s.format][lang],
      ratio: s.format
    };
  }

  function imagePrompt() {
    const d = promptData();
    if (d.lang === "es") {
      return [
        `Fotografía publicitaria profesional de ${d.name}${d.p.desc ? ` (${d.p.desc.replace(/\.$/, "")})` : ""}.`,
        d.feats ? `Resalta visualmente: ${d.feats}.` : "",
        `Estilo visual: ${d.visual}.`,
        `El producto es el protagonista, centrado y nítido, con enfoque perfecto y fondo ligeramente desenfocado.`,
        `Formato ${d.format}. Deja espacio libre arriba o abajo para añadir texto.`,
        `Calidad de estudio, alta resolución, colores realistas, sin marcas de agua, sin logotipos inventados y sin texto deformado.`,
        `Relación de aspecto: ${d.ratio}.`
      ].filter(Boolean).join("\n");
    }
    return [
      `Professional advertising photo of ${d.name}${d.p.desc ? ` (${d.p.desc.replace(/\.$/, "")})` : ""}.`,
      d.feats ? `Visually highlight: ${d.feats}.` : "",
      `Visual style: ${d.visual}.`,
      `The product is the hero, centered and sharp, perfect focus, slightly blurred background.`,
      `Format ${d.format}. Leave empty space at the top or bottom for text overlay.`,
      `Studio quality, high resolution, realistic colors, no watermarks, no made-up logos, no distorted text.`,
      `Aspect ratio: ${d.ratio}.`
    ].filter(Boolean).join("\n");
  }

  function videoPrompt() {
    const d = promptData();
    const f = d.p.features;
    if (d.lang === "es") {
      return [
        `Vídeo promocional de 15 segundos para ${d.name}.`,
        `Formato ${d.format}. Estilo visual: ${d.visual}.`,
        ``,
        `Escena 1 (0-3 s): plano de detalle muy atractivo del producto, movimiento lento de cámara hacia delante. Texto en pantalla: "${truncate(d.name, 40)}".`,
        `Escena 2 (3-7 s): el producto en uso en un entorno real, plano medio, movimiento suave.`,
        `Escena 3 (7-12 s): tres planos rápidos que muestran sus ventajas${f.length ? `: ${f.slice(0, 3).join(" / ")}` : ""}, con texto breve en pantalla.`,
        `Escena 4 (12-15 s): plano final del producto con espacio para el mensaje "Descúbrelo en el enlace".`,
        ``,
        `Música: ${d.visual.includes("lujo") ? "elegante y envolvente" : "alegre y moderna"}, sin voz. Transiciones suaves, iluminación coherente, sin texto deformado ni logotipos inventados.`
      ].join("\n");
    }
    return [
      `15-second promotional video for ${d.name}.`,
      `Format ${d.format}. Visual style: ${d.visual}.`,
      ``,
      `Scene 1 (0-3 s): eye-catching close-up of the product, slow push-in camera move. On-screen text: "${truncate(d.name, 40)}".`,
      `Scene 2 (3-7 s): the product in use in a real setting, medium shot, smooth motion.`,
      `Scene 3 (7-12 s): three quick shots showing its benefits${f.length ? `: ${f.slice(0, 3).join(" / ")}` : ""}, with short on-screen text.`,
      `Scene 4 (12-15 s): final hero shot of the product with space for the message "Find it at the link".`,
      ``,
      `Music: ${d.visual.includes("luxury") ? "elegant and immersive" : "upbeat and modern"}, no voiceover. Smooth transitions, consistent lighting, no distorted text or made-up logos.`
    ].join("\n");
  }

  function showPrompt(kind) {
    if (!els.name.value.trim()) toast("Consejo: escribe el nombre del producto para un prompt mejor.");
    const box = kind === "img" ? els.imgPromptBox : els.vidPromptBox;
    const ta = kind === "img" ? els.imgPrompt : els.vidPrompt;
    ta.value = kind === "img" ? imagePrompt() : videoPrompt();
    box.hidden = false;
    autoGrow(ta);
    save();
    box.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  /* ================= Imagen y OCR ================= */
  function onFile() {
    const file = els.imageInput.files && els.imageInput.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast("Elige un archivo de imagen."); return; }
    currentFile = file;
    els.fileName.textContent = file.name;
    const url = URL.createObjectURL(file);
    els.preview.onload = () => URL.revokeObjectURL(url);
    els.preview.src = url;
    els.preview.hidden = false;
    els.ocrBtn.disabled = false;
    els.visionBtn.disabled = !aiAvailable;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (window.Tesseract) return resolve();
      const s = document.createElement("script");
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error("No se pudo cargar Tesseract.js. Revisa tu conexión."));
      document.head.appendChild(s);
    });
  }

  function setProgress(pct, text) {
    els.ocrProgress.hidden = false;
    els.ocrBar.style.width = Math.round(pct * 100) + "%";
    els.ocrText.textContent = text;
  }

  const OCR_STATUS = {
    "loading tesseract core": "Cargando motor OCR…",
    "initializing tesseract": "Iniciando…",
    "loading language traineddata": "Descargando idiomas (solo la primera vez)…",
    "initializing api": "Preparando…",
    "recognizing text": "Leyendo texto…"
  };

  async function runOCR() {
    if (!currentFile) return;
    els.ocrBtn.disabled = true;
    setProgress(0.02, "Cargando motor OCR…");
    let worker;
    try {
      await loadScript(TESSERACT_URL);
      worker = await Tesseract.createWorker(["spa", "eng"], 1, {
        logger: (m) => {
          const label = OCR_STATUS[m.status] || "Procesando…";
          setProgress(m.status === "recognizing text" ? 0.3 + m.progress * 0.7 : Math.min(0.3, (m.progress || 0) * 0.3), label);
        }
      });
      const { data } = await worker.recognize(currentFile);
      const parsed = parseOcrText(data.text || "");
      if (!parsed.name && !parsed.desc && !parsed.features.length) {
        toast("No se ha encontrado texto claro. Prueba con una captura más nítida.");
      } else {
        applyExtracted(parsed);
        toast("Texto extraído. ¡Revísalo! 👀");
      }
      setProgress(1, "Listo. Comprueba los datos antes de publicar.");
    } catch (err) {
      console.error(err);
      setProgress(0, "Error: " + (err.message || "no se pudo leer la imagen."));
    } finally {
      if (worker) worker.terminate();
      els.ocrBtn.disabled = false;
    }
  }

  function parseOcrText(text) {
    const noise = /(€|\$|£|\bprecio\b|\bprice\b|valoraci|rating|estrellas|\bstars?\b|añadir|add to (cart|basket)|comprar ya|buy now|env[ií]o|shipping|cesta|carrito|devoluci|returns?\b|vendido por|sold by|opiniones|reviews?|\biva\b|en stock|in stock|cantidad|quantity|cup[oó]n|coupon|descuento|\boff\b|prime)/i;
    const headerRe = /^(caracter[ií]sticas|acerca de este (art[ií]culo|producto)|about this item|features|detalles|details|descripci[oó]n|description)\s*:?$/i;
    const bulletRe = /^[•·\-*▪●◦✓✔»>]\s*/;
    const lines = text.split(/\r?\n/)
      .map((l) => l.replace(/\s+/g, " ").replace(/[|_~]+/g, "").trim())
      .filter((l) => l.length > 2 && /[a-záéíóúñ]{2,}/i.test(l))
      .filter((l) => !noise.test(l));

    let name = "";
    const features = [];
    const descParts = [];
    let inFeatures = false;

    lines.forEach((line) => {
      if (headerRe.test(line)) { inFeatures = true; return; }
      if (!name && line.length >= 6 && !bulletRe.test(line)) { name = line; return; }
      if (bulletRe.test(line) || inFeatures) {
        features.push(line.replace(bulletRe, ""));
      } else if (descParts.join(" ").length < 220) {
        descParts.push(line);
      } else if (line.length <= 120) {
        features.push(line);
      }
    });

    // Si no hay características claras, usa las líneas de descripción sobrantes
    if (!features.length && descParts.length > 2) features.push(...descParts.splice(2));

    return {
      name: truncate(name, 120),
      desc: truncate(descParts.join(" "), 240),
      features: features.map((f) => truncate(f, 140)).slice(0, 8)
    };
  }

  function applyExtracted(d) {
    if (d.name) els.name.value = d.name;
    if (d.desc) els.desc.value = d.desc;
    if (d.features && d.features.length) els.features.value = d.features.join("\n");
    save();
  }

  /* ================= IA (opcional, vía /api) ================= */
  async function checkAI() {
    try {
      const r = await fetch(API_URL, { method: "GET", headers: { Accept: "application/json" } });
      if (!r.ok) throw new Error();
      const info = await r.json();
      aiAvailable = !!info.configured;
      els.accessCodeWrap.hidden = !info.accessCodeRequired;
      els.aiConfigStatus.innerHTML = aiAvailable
        ? '<span class="status-ok">✅ IA disponible.</span> Puedes usar "Leer con IA" y "Mejorar con IA".'
        : "La función de IA existe, pero falta la variable OPENAI_API_KEY en Vercel. La app funciona con plantillas.";
    } catch (e) {
      aiAvailable = false;
      els.aiConfigStatus.textContent = "IA no disponible aquí (por ejemplo, en GitHub Pages). La app funciona perfectamente con plantillas.";
    }
    document.querySelectorAll(".ai-only").forEach((el) => { el.hidden = !aiAvailable; });
    els.visionBtn.disabled = !aiAvailable || !currentFile;
  }

  async function callAI(payload) {
    const headers = { "Content-Type": "application/json" };
    const code = els.accessCode.value.trim();
    if (code) headers["X-Access-Code"] = code;
    const r = await fetch(API_URL, { method: "POST", headers, body: JSON.stringify(payload) });
    let data = {};
    try { data = await r.json(); } catch (e) { /* respuesta vacía */ }
    if (!r.ok) throw new Error(data.message || `Error ${r.status}`);
    return data;
  }

  // Reduce la imagen antes de enviarla (más rápido y barato)
  function imageToDataURL(file, maxSide = 1400) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo leer la imagen.")); };
      img.src = url;
    });
  }

  async function runVision() {
    if (!currentFile || !aiAvailable) return;
    els.visionBtn.disabled = true;
    setProgress(0.3, "La IA está leyendo la captura…");
    try {
      const image = await imageToDataURL(currentFile);
      const res = await callAI({ mode: "vision", image, lang: getSettings().lang });
      applyExtracted({
        name: res.name || "",
        desc: res.description || "",
        features: Array.isArray(res.features) ? res.features : []
      });
      setProgress(1, "Listo. Comprueba los datos antes de publicar.");
      toast("Datos extraídos con IA ✨");
    } catch (err) {
      setProgress(0, "Error de IA: " + err.message);
    } finally {
      els.visionBtn.disabled = false;
    }
  }

  async function improveWithAI() {
    const cards = [...els.results.querySelectorAll(".post")];
    if (!cards.length) { toast("Primero pulsa Crear mis publicaciones."); return; }
    const settings = getSettings();
    const product = getProduct();
    const posts = {};
    cards.forEach((c) => { posts[c.dataset.network] = c.querySelector("textarea").value; });

    els.improveBtn.disabled = true;
    els.improveBtn.textContent = "✨ Mejorando…";
    els.aiStatus.textContent = "Esto puede tardar unos segundos.";
    try {
      const res = await callAI({
        mode: "posts",
        product,
        settings: { lang: settings.lang, style: settings.style, length: settings.length },
        networks: Object.keys(posts),
        posts,
        disclaimer: T[settings.lang].disclaimer
      });
      let changed = 0;
      Object.keys(posts).forEach((n) => {
        let txt = res.posts && typeof res.posts[n] === "string" ? res.posts[n].trim() : "";
        if (!txt) return;
        // Garantiza que el enlace y el aviso de afiliado siguen ahí
        if (product.link && !txt.includes(product.link)) txt += "\n\n🔗 " + product.link;
        if (!txt.includes(T[settings.lang].disclaimer)) txt += "\n\n" + T[settings.lang].disclaimer;
        renderPost(n, txt, true);
        changed++;
      });
      if (Array.isArray(res.boards) && res.boards.length) {
        const boards = res.boards.map(String).map((b) => b.trim()).filter((b) => b && b.split(/\s+/).length <= 3).slice(0, 6);
        if (boards.length) renderBoards(boards);
      }
      els.aiStatus.textContent = changed ? "Textos mejorados con IA. Revísalos antes de publicar." : "La IA no devolvió cambios.";
    } catch (err) {
      els.aiStatus.textContent = "No se pudo mejorar: " + err.message + " Tus textos de plantilla siguen disponibles.";
    } finally {
      els.improveBtn.disabled = false;
      els.improveBtn.textContent = "✨ Mejorar con IA";
    }
  }

  /* ================= Eventos ================= */
  els.imageInput.addEventListener("change", onFile);
  els.ocrBtn.addEventListener("click", runOCR);
  els.visionBtn.addEventListener("click", runVision);
  els.generateBtn.addEventListener("click", generate);
  els.resetBtn.addEventListener("click", resetForm);
  els.improveBtn.addEventListener("click", improveWithAI);
  els.imgPromptBtn.addEventListener("click", () => showPrompt("img"));
  els.vidPromptBtn.addEventListener("click", () => showPrompt("vid"));
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    btn.addEventListener("click", () => copyText($(btn.dataset.copy).value, btn));
  });
  [els.imgPrompt, els.vidPrompt].forEach((ta) => ta.addEventListener("input", () => autoGrow(ta)));
  document.addEventListener("change", (e) => { if (e.target.matches("input[type=radio], input[type=checkbox]")) save(); });
  [els.name, els.desc, els.features, els.link, els.accessCode].forEach((el) => el.addEventListener("input", save));

  load();
  checkAI();
})();
