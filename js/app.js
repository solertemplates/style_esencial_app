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
    storeName: $("storeName"), storeNameWrap: $("storeNameWrap"), disclaimerPreview: $("disclaimerPreview"),
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
  function toast(msg, ms = 2200) {
    els.toast.textContent = msg;
    els.toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => els.toast.classList.remove("show"), ms);
  }

  async function copyText(text, btn, msg = "¡Copiado! ✅", ms) {
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
      toast(msg, ms);
      if (btn) {
        const old = btn.textContent;
        btn.textContent = "¡Copiado!";
        btn.classList.add("copied");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("copied"); }, 1500);
      }
    } else {
      toast("No se pudo copiar. Mantén pulsado el texto para copiarlo.");
    }
    return ok;
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
        store: { id: radio("store") || "amazon", name: els.storeName.value },
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
    if (data.store) {
      if (data.store.id) setRadio("store", data.store.id);
      els.storeName.value = data.store.name || "";
    }
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

  /* ================= Tienda y aviso de afiliado ================= */
  function getStoreName() {
    const store = radio("store") || "amazon";
    return store === "other" ? els.storeName.value.trim() : T.stores[store];
  }

  function getDisclaimer(lang) {
    const store = radio("store") || "amazon";
    if (store === "amazon") return T.disclaimers.amazon[lang];
    const name = getStoreName();
    if (!name) return T[lang].disclaimer;
    let txt = fill(T.disclaimers.other[lang], { store: name });
    if (lang === "en") txt = txt.replace(/^As a (?=[AEIOU])/i, "As an ");
    return txt;
  }

  function updateStoreUI() {
    els.storeNameWrap.hidden = radio("store") !== "other";
    els.disclaimerPreview.textContent = "Aviso: " + getDisclaimer(getSettings().lang);
  }

  /* ================= Traducción con IA (salida en inglés) ================= */
  let translation = { key: "", value: null };
  const productKey = (p) => JSON.stringify([p.name, p.desc, p.features]);

  // Devuelve los datos del producto para el idioma elegido
  // (la versión traducida si ya existe para estos mismos datos).
  function productFor(lang) {
    const p = getProduct();
    if (lang === "en" && translation.value && translation.key === productKey(p)) {
      return { ...translation.value, link: p.link };
    }
    return p;
  }

  async function translateProduct(p) {
    const key = productKey(p);
    if (translation.value && translation.key === key) return { ...translation.value, link: p.link };
    const res = await callAI({ mode: "translate", product: { name: p.name, desc: p.desc, features: p.features } });
    const value = {
      name: String(res.name || "").trim() || p.name,
      desc: String(res.description || "").trim() || p.desc,
      features: Array.isArray(res.features) && res.features.length ? res.features.map((f) => String(f).trim()).filter(Boolean) : p.features
    };
    translation = { key, value };
    return { ...value, link: p.link };
  }

  /* ================= Generador de publicaciones ================= */
  // Cada publicación es una lista de campos: { id, label, text, max }
  function buildPost(network, product, settings) {
    const L = T[settings.lang];
    const es = settings.lang === "es";
    const { style, length } = settings;
    const long = length === "long";
    const name = product.name || (es ? "este producto" : "this product");
    const desc = ensureDot(product.desc || L.defaultDesc);
    const link = product.link || (es ? "[pega aquí tu enlace]" : "[paste your link here]");
    const data = { name, desc, link };
    const hook = fill(pick(L.hooks[style]), data);
    const intro = pick(L.intros[style]);
    const closer = pick(L.closers[style]);
    const cta = fill(pick(L.cta[network]), data);
    const disclaimer = getDisclaimer(settings.lang);
    const descWithNotice = desc + "\n" + disclaimer; // aviso pegado a la descripción
    const feats = (n) => product.features.slice(0, n);
    const bullet = style === "elegante" ? "▫️" : style === "directo" ? "✅" : "✨";
    const bullets = (n) => feats(n).map((x) => `${bullet} ${x}`).join("\n");
    const featBlock = (n) => (feats(n).length ? pick(L.featureTitle) + "\n" + bullets(n) : "");
    const join = (parts) => parts.filter((p) => p && p.trim()).join("\n\n");
    const single = (text) => [{ id: "text", label: "", text }];

    switch (network) {
      case "facebook":
        return single(join([
          hook, descWithNotice,
          ...(long ? [intro, featBlock(8), closer] : [bullets(2)]),
          cta, buildHashtags(product, settings.lang, network, 3)
        ]));

      case "instagram":
        return single(join([
          hook, descWithNotice,
          long ? intro + "\n\n" + featBlock(8) : featBlock(3),
          long ? closer : "",
          cta, "·\n·\n" + buildHashtags(product, settings.lang, network, long ? 15 : 10)
        ]));

      case "tiktok": {
        const shortHook = truncate(hook, 150);
        const S = L.tiktokScript;
        return single(join([
          shortHook,
          long ? descWithNotice : truncate(desc, 120) + "\n" + disclaimer,
          long ? featBlock(4) : bullets(1),
          cta, buildHashtags(product, settings.lang, network, 5),
          long ? "———\n" + S.title + "\n" + S.steps.map((s) => "• " + fill(s, { hook: shortHook })).join("\n") : ""
        ]));
      }

      case "youtube": {
        const Y = L.youtube;
        return [
          { id: "title", label: "Título", text: truncate(fill(pick(Y.titles), data), 100), max: 100 },
          { id: "description", label: "Descripción", text: join([
            hook + "\n\n" + descWithNotice,
            ...(long ? [intro, featBlock(8), Y.chapters] : [bullets(3)]),
            cta, pick(Y.subscribe), buildHashtags(product, settings.lang, network, 3)
          ]), max: 5000 }
        ];
      }

      case "pinterest": {
        let body = desc + " " + intro;
        if (long && product.features.length) body += " " + feats(4).join(" · ") + ".";
        const tags = buildHashtags(product, settings.lang, network, 5);
        // Pinterest admite 500 caracteres: recorta el texto, nunca el aviso
        body = truncate(body, Math.min(long ? 420 : 250, 500 - disclaimer.length - tags.length - 4));
        return [
          { id: "title", label: "Título del pin", text: truncate(fill(pick(L.pinterestTitle), data), 100), max: 100 },
          { id: "description", label: "Descripción", text: body + "\n" + disclaimer + "\n\n" + tags, max: 500 },
          { id: "link", label: "Enlace", text: link }
        ];
      }
    }
    return single("");
  }

  function renderPost(network, fields, fromAI) {
    let card = els.results.querySelector(`.post[data-network="${network}"]`);
    if (!card) {
      card = document.createElement("article");
      card.className = "post";
      card.dataset.network = network;
      card.innerHTML = `
        <div class="post-head">
          <span class="badge badge-${network}">${NETWORK_LABELS[network]}</span>
          <span class="count count-main"></span>
        </div>
        <div class="post-fields"></div>
        <button type="button" class="btn btn-small post-regen">↻ Otra versión</button>`;
      els.results.appendChild(card);
      card.querySelector(".post-regen").addEventListener("click", () => {
        const s = getSettings();
        renderPost(network, buildPost(network, productFor(s.lang), s), false);
      });
    }
    const wrap = card.querySelector(".post-fields");
    wrap.innerHTML = "";
    const multi = fields.length > 1;
    fields.forEach((f) => {
      const block = document.createElement("div");
      block.className = "field-block";
      block.dataset.field = f.id;
      if (f.max) block.dataset.max = f.max;
      block.innerHTML = multi ? `<div class="field-head"><span class="field-title"></span><span class="count"></span></div>` : "";
      const ta = document.createElement("textarea");
      ta.className = "post-text" + (f.id === "title" || f.id === "link" ? " short" : "");
      ta.rows = f.id === "title" || f.id === "link" ? 2 : 6;
      ta.value = f.text;
      ta.setAttribute("aria-label", `${f.label || "Publicación"} – ${NETWORK_LABELS[network]}`);
      if (f.id === "link") { ta.spellcheck = false; ta.autocapitalize = "off"; }
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn-copy";
      btn.textContent = multi ? `Copiar ${f.label.toLowerCase()}` : "Copiar";
      btn.addEventListener("click", () => copyText(ta.value, btn));
      ta.addEventListener("input", () => { updateCount(card); autoGrow(ta); });
      block.appendChild(ta);
      block.appendChild(btn);
      if (multi) block.querySelector(".field-title").textContent = f.label;
      wrap.appendChild(block);
      requestAnimationFrame(() => autoGrow(ta));
    });
    const head = card.querySelector(".post-head");
    const flag = head.querySelector(".ai-flag");
    if (fromAI && !flag) head.querySelector(".badge").insertAdjacentHTML("afterend", '<span class="ai-flag">✨ IA</span>');
    if (!fromAI && flag) flag.remove();
    updateCount(card);
  }

  function updateCount(card) {
    const blocks = [...card.querySelectorAll(".field-block")];
    if (blocks.length === 1) {
      card.querySelector(".count-main").textContent = `${blocks[0].querySelector("textarea").value.length} caracteres`;
      return;
    }
    card.querySelector(".count-main").textContent = "";
    blocks.forEach((b) => {
      const n = b.querySelector("textarea").value.length;
      const max = Number(b.dataset.max) || 0;
      const c = b.querySelector(".count");
      c.textContent = max ? `${n}/${max}` : `${n}`;
      c.classList.toggle("over", max > 0 && n > max);
    });
  }

  // Lee los textos (posiblemente editados) de cada tarjeta
  function readPosts() {
    const posts = {};
    els.results.querySelectorAll(".post").forEach((card) => {
      const fields = {};
      card.querySelectorAll(".field-block").forEach((b) => {
        fields[b.dataset.field] = { label: b.querySelector(".field-title") ? b.querySelector(".field-title").textContent : "", text: b.querySelector("textarea").value, max: Number(b.dataset.max) || undefined };
      });
      posts[card.dataset.network] = fields;
    });
    return posts;
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
      btn.addEventListener("click", async () => {
        if (await copyText(b, null, "Copiado ✓", 1200)) {
          btn.classList.add("copied");
          setTimeout(() => btn.classList.remove("copied"), 1200);
        }
      });
      wrap.appendChild(btn);
    });
    els.boards.appendChild(wrap);
    const hint = document.createElement("p");
    hint.className = "hint";
    hint.textContent = "Toca un nombre para copiarlo.";
    els.boards.appendChild(hint);
  }

  /* ================= Generar todo ================= */
  function showResultsNote(text, ok) {
    const note = document.createElement("p");
    note.className = "notice results-note" + (ok ? " ok" : "");
    note.textContent = text;
    els.results.prepend(note);
  }

  async function generate() {
    const original = getProduct();
    const settings = getSettings();
    if (!original.name) {
      toast("Escribe al menos el nombre del producto.");
      els.name.focus();
      return;
    }
    if (!settings.networks.length) {
      toast("Elige al menos una red social.");
      return;
    }

    let product = original;
    let note = null;
    if (settings.lang === "en") {
      if (aiAvailable) {
        els.generateBtn.disabled = true;
        els.generateBtn.textContent = "Traduciendo al inglés…";
        try {
          product = await translateProduct(original);
          note = { text: "✨ Nombre, descripción y características traducidos al inglés y corregidos con IA. Revísalos antes de publicar.", ok: true };
        } catch (err) {
          note = { text: "No se pudo traducir con IA (" + err.message + "). Se han usado tus datos originales." };
        } finally {
          els.generateBtn.disabled = false;
          els.generateBtn.textContent = "Crear mis publicaciones";
        }
      } else {
        note = { text: "Para traducir al inglés activa Mejorar con IA" };
        toast("Para traducir al inglés activa Mejorar con IA");
      }
    }
    if (!original.link && !note) toast("Consejo: añade tu enlace de afiliado.");

    els.results.innerHTML = "";
    if (note) showResultsNote(note.text, note.ok);
    settings.networks.forEach((n) => renderPost(n, buildPost(n, product, settings), false));
    renderBoards(boardIdeas(product, settings.lang));
    els.aiBox.hidden = !aiAvailable;
    els.aiStatus.textContent = "";
    save();
    els.results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function resetForm() {
    if (!confirm("¿Seguro que quieres limpiar el formulario?\n\nSe borrarán la imagen, los datos del producto, el enlace y las publicaciones creadas. Esta acción no se puede deshacer.")) return;
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
    const s = getSettings();
    const lang = s.lang;
    const p = productFor(lang);
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
        T.referencePrefix[d.lang] + "\n",
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
      T.referencePrefix[d.lang] + "\n",
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
        T.referencePrefix[d.lang] + "\n",
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
      T.referencePrefix[d.lang] + "\n",
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

  // Coloca el aviso justo detrás de la descripción: si falta, lo inserta antes del enlace
  function ensureNoticeAndLink(text, disclaimer, link, needsLink) {
    let t = text.trim();
    if (!t.includes(disclaimer)) {
      const i = link ? t.indexOf(link) : -1;
      if (i > -1) {
        const lineStart = t.lastIndexOf("\n", i) + 1;
        t = (t.slice(0, lineStart).trimEnd() + "\n" + disclaimer + "\n\n" + t.slice(lineStart)).trim();
      } else {
        t += "\n" + disclaimer;
      }
    }
    if (needsLink && link && !t.includes(link)) t += "\n\n🔗 " + link;
    return t;
  }

  async function improveWithAI() {
    const current = readPosts();
    const networks = Object.keys(current);
    if (!networks.length) { toast("Primero pulsa Crear mis publicaciones."); return; }
    const settings = getSettings();
    const disclaimer = getDisclaimer(settings.lang);

    els.improveBtn.disabled = true;
    els.improveBtn.textContent = "✨ Mejorando…";
    els.aiStatus.textContent = "Esto puede tardar unos segundos.";
    try {
      let product = getProduct();
      if (settings.lang === "en") {
        // Usa la traducción guardada (o la crea) para no mezclar idiomas
        try { product = await translateProduct(product); } catch (e) { /* sigue con los datos originales */ }
      }
      // Solo se envían los campos de texto (el enlace de Pinterest va aparte y no se toca)
      const posts = {};
      networks.forEach((n) => {
        posts[n] = {};
        Object.keys(current[n]).forEach((f) => { if (f !== "link") posts[n][f] = current[n][f].text; });
      });
      const res = await callAI({
        mode: "posts",
        product,
        settings: { lang: settings.lang, style: settings.style, length: settings.length },
        networks,
        posts,
        disclaimer
      });
      let changed = 0;
      networks.forEach((n) => {
        const ai = res.posts && res.posts[n];
        if (!ai || typeof ai !== "object") return;
        const fields = Object.keys(current[n]).map((id) => {
          const f = current[n][id];
          let text = typeof ai[id] === "string" && ai[id].trim() ? ai[id].trim() : f.text;
          if (n === "pinterest" && id === "description" && product.link) {
            // En Pinterest el enlace va en su propio campo
            text = text.split(product.link).join("").replace(/[ \t]*🔗[ \t]*$/gm, "").replace(/\n{3,}/g, "\n\n").trim();
          }
          if (id === "text" || id === "description") {
            text = ensureNoticeAndLink(text, disclaimer, product.link, n !== "pinterest");
          }
          if (id === "title" && f.max) text = truncate(text.replace(/^["“]|["”]$/g, ""), f.max);
          return { id, label: f.label, text, max: f.max };
        });
        renderPost(n, fields, true);
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
  document.addEventListener("change", (e) => {
    if (e.target.matches("input[type=radio], input[type=checkbox]")) { updateStoreUI(); save(); }
  });
  [els.name, els.desc, els.features, els.link, els.accessCode, els.storeName].forEach((el) => el.addEventListener("input", save));
  els.storeName.addEventListener("input", updateStoreUI);

  load();
  updateStoreUI();
  checkAI();
})();
