/* =====================================================================
   Style Essential – PLANTILLAS EDITABLES
   ---------------------------------------------------------------------
   Aquí puedes cambiar todos los textos que usa la app para crear las
   publicaciones. Cada lista tiene varias frases: la app elige una al azar
   cada vez, así los textos no se repiten.

   Marcadores que se sustituyen automáticamente:
     {name}  → nombre del producto
     {desc}  → descripción corta
     {link}  → enlace de afiliado

   Consejo: añade tantas frases como quieras, separadas por comas,
   y respeta las comillas.
   ===================================================================== */

window.SE_TEMPLATES = {
  /* ---------------------------------------------------------------
     TIENDAS Y AVISOS DE AFILIADO
     {store} → nombre de la tienda
     --------------------------------------------------------------- */
  stores: { amazon: "Amazon", temu: "Temu", aliexpress: "AliExpress", shein: "Shein" },
  disclaimers: {
    amazon: {
      es: "Como afiliado de Amazon, gano con las compras que cumplen los requisitos.",
      en: "As an Amazon Associate I earn from qualifying purchases."
    },
    other: {
      es: "Como afiliado de {store}, puedo recibir una comisión.",
      en: "As a {store} affiliate, I may earn a commission."
    }
  },

  es: {
    /* Aviso genérico: solo se usa si eliges "Otra" tienda sin escribir el nombre */
    disclaimer: "Como afiliado, recibo una comisión por las compras que cumplen los requisitos.",
    defaultDesc: "Un producto práctico y bonito que merece un hueco en tu día a día.",

    hooks: {
      cercano: [
        "¿Ya conoces {name}? Te cuento por qué me ha conquistado 💕",
        "Tengo un nuevo favorito y te lo tengo que enseñar: {name} ✨",
        "Si estabas buscando algo así, esto te va a encantar 👇",
        "Confesión: desde que descubrí {name} no puedo vivir sin él 😍",
        "Mi hallazgo de la semana se llama {name} y es una maravilla 🙌",
        "Te presento algo que me ha alegrado la rutina: {name} 🌸"
      ],
      elegante: [
        "{name}: cuando la calidad se nota en cada detalle.",
        "Hay piezas que elevan lo cotidiano. {name} es una de ellas.",
        "Discreto, refinado y pensado para durar: {name}.",
        "La elegancia está en lo esencial. Descubre {name}.",
        "Un básico con carácter propio: {name}.",
        "Menos, pero mejor. Así es {name}."
      ],
      directo: [
        "🔥 {name}: lo que necesitas, al precio que buscas.",
        "¡Atención! {name} es de lo más buscado ahora mismo 🚀",
        "Deja de buscar: {name} lo resuelve.",
        "¿Quieres resultados? {name} es tu respuesta ✅",
        "Este es el producto que todos están comprando: {name} 🛒",
        "No lo pienses más: {name} merece la pena 💥"
      ]
    },

    intros: {
      cercano: [
        "Lo mejor es lo fácil que me lo pone todo.",
        "Es de esas cosas que no sabías que necesitabas hasta que las pruebas.",
        "Lo uso a diario y sigue sorprendiéndome.",
        "Te lo recomiendo como se lo recomendaría a una amiga."
      ],
      elegante: [
        "Un diseño cuidado que combina belleza y funcionalidad.",
        "Pensado para quienes valoran los detalles.",
        "Una elección atemporal que nunca pasa de moda.",
        "Calidad y estilo en perfecto equilibrio."
      ],
      directo: [
        "Práctico, eficaz y fácil de usar.",
        "Cumple lo que promete desde el primer día.",
        "Una compra inteligente que vas a notar enseguida.",
        "Calidad-precio difícil de superar."
      ]
    },

    featureTitle: [
      "Lo que más me gusta:",
      "Por qué merece la pena:",
      "Características destacadas:",
      "Puntos clave:"
    ],

    closers: {
      cercano: [
        "Ya me contarás qué te parece 😊",
        "Si lo pruebas, ¡cuéntamelo en comentarios!",
        "Guárdalo para no perderlo 💾"
      ],
      elegante: [
        "Un pequeño lujo al alcance de tu mano.",
        "Porque lo esencial merece lo mejor.",
        "Una inversión en tu día a día."
      ],
      directo: [
        "¡Que no te lo cuenten!",
        "Las unidades vuelan, aprovecha.",
        "Haz clic y compruébalo tú mismo."
      ]
    },

    cta: {
      facebook: [
        "👉 Míralo aquí: {link}",
        "Puedes verlo en este enlace: {link}",
        "Toda la información aquí 👇\n{link}"
      ],
      instagram: [
        "🔗 Enlace en mi bio o aquí: {link}",
        "Encuéntralo aquí 👉 {link}",
        "¿Lo quieres? Toca el enlace: {link}"
      ],
      tiktok: [
        "🔗 Link aquí: {link}",
        "Lo tienes aquí 👉 {link}",
        "Enlace en mi perfil o aquí: {link}"
      ],
      youtube: [
        "🛒 Compra o consulta el precio aquí: {link}",
        "🔗 Enlace del producto: {link}",
        "👉 Más información aquí: {link}"
      ],
      pinterest: [
        "Descúbrelo aquí: {link}",
        "Toca para ver más: {link}",
        "Más detalles en el enlace: {link}"
      ]
    },

    tiktokScript: {
      title: "🎬 Idea de vídeo:",
      steps: [
        "0-3 s: Gancho → muestra el producto de cerca y di: \"{hook}\"",
        "3-8 s: Enséñalo en uso, de forma natural.",
        "8-12 s: Destaca 2 o 3 ventajas con texto en pantalla.",
        "12-15 s: Cierre → \"Te dejo el enlace\" y señala hacia abajo."
      ]
    },

    youtube: {
      titles: [
        "{name}: ¿merece la pena? Mi opinión sincera",
        "Probé {name} y esto es lo que pienso",
        "{name} | Reseña rápida y honesta",
        "Todo lo que debes saber sobre {name}"
      ],
      chapters: "⏱️ Capítulos\n0:00 Introducción\n0:20 Primeras impresiones\n1:00 Características\n2:00 Mi opinión final",
      subscribe: [
        "Si te ha sido útil, suscríbete y activa la campanita 🔔",
        "Dale like y suscríbete para más recomendaciones 👍",
        "Cuéntame en los comentarios qué producto quieres que pruebe 💬"
      ]
    },

    pinterestTitle: [
      "{name} | Ideas y recomendaciones",
      "{name}: el básico que necesitas",
      "Descubre {name}",
      "{name} – favorito imprescindible"
    ],

    networkTags: {
      facebook: ["recomendacion"],
      instagram: ["recomendaciones", "hallazgos", "musthave", "compras", "favoritos", "estilodevida"],
      tiktok: ["tiktokmelohizocomprar", "hallazgos", "parati"],
      youtube: ["reseña", "opinion"],
      pinterest: ["ideas", "inspiracion"]
    }
  },

  en: {
    /* Generic notice: only used when "Otra" store has no name */
    disclaimer: "As an affiliate, I earn from qualifying purchases.",
    defaultDesc: "A practical, beautiful find that deserves a spot in your everyday routine.",

    hooks: {
      cercano: [
        "Have you tried {name} yet? Here's why I'm obsessed 💕",
        "I have a new favorite and I need to show you: {name} ✨",
        "If you've been looking for something like this, you'll love it 👇",
        "Confession: since I found {name}, I can't live without it 😍",
        "My find of the week is {name} and it's amazing 🙌",
        "Meet the little thing that made my routine better: {name} 🌸"
      ],
      elegante: [
        "{name}: quality you can see in every detail.",
        "Some pieces elevate the everyday. {name} is one of them.",
        "Understated, refined and made to last: {name}.",
        "Elegance lives in the essentials. Discover {name}.",
        "A timeless staple with character: {name}.",
        "Less, but better. That's {name}."
      ],
      directo: [
        "🔥 {name}: exactly what you need, at the price you want.",
        "Heads up! {name} is trending right now 🚀",
        "Stop searching: {name} has you covered.",
        "Want results? {name} is the answer ✅",
        "This is the product everyone is buying: {name} 🛒",
        "Don't overthink it: {name} is worth it 💥"
      ]
    },

    intros: {
      cercano: [
        "The best part is how easy it makes everything.",
        "It's one of those things you didn't know you needed until you try it.",
        "I use it every day and it still surprises me.",
        "I'm recommending it like I would to a friend."
      ],
      elegante: [
        "A thoughtful design that blends beauty and function.",
        "Made for those who appreciate the details.",
        "A timeless choice that never goes out of style.",
        "Quality and style in perfect balance."
      ],
      directo: [
        "Practical, effective and easy to use.",
        "It delivers from day one.",
        "A smart buy you'll notice right away.",
        "Value for money that's hard to beat."
      ]
    },

    featureTitle: [
      "What I love most:",
      "Why it's worth it:",
      "Key features:",
      "Highlights:"
    ],

    closers: {
      cercano: [
        "Let me know what you think 😊",
        "If you try it, tell me in the comments!",
        "Save this so you don't lose it 💾"
      ],
      elegante: [
        "A little luxury within reach.",
        "Because the essentials deserve the best.",
        "An investment in your everyday."
      ],
      directo: [
        "See it for yourself!",
        "These sell fast, don't miss out.",
        "Tap the link and check it out."
      ]
    },

    cta: {
      facebook: [
        "👉 Check it out here: {link}",
        "You can find it at this link: {link}",
        "All the details here 👇\n{link}"
      ],
      instagram: [
        "🔗 Link in bio or right here: {link}",
        "Find it here 👉 {link}",
        "Want it? Tap the link: {link}"
      ],
      tiktok: [
        "🔗 Link here: {link}",
        "Get it here 👉 {link}",
        "Link in my bio or here: {link}"
      ],
      youtube: [
        "🛒 Shop or check the price here: {link}",
        "🔗 Product link: {link}",
        "👉 More info here: {link}"
      ],
      pinterest: [
        "Discover it here: {link}",
        "Tap to see more: {link}",
        "More details at the link: {link}"
      ]
    },

    tiktokScript: {
      title: "🎬 Video idea:",
      steps: [
        "0-3 s: Hook → show the product up close and say: \"{hook}\"",
        "3-8 s: Show it in use, naturally.",
        "8-12 s: Highlight 2 or 3 benefits with on-screen text.",
        "12-15 s: Close → \"Link below\" and point down."
      ]
    },

    youtube: {
      titles: [
        "{name}: is it worth it? My honest review",
        "I tried {name} – here's what I think",
        "{name} | Quick, honest review",
        "Everything you need to know about {name}"
      ],
      chapters: "⏱️ Chapters\n0:00 Intro\n0:20 First impressions\n1:00 Features\n2:00 Final thoughts",
      subscribe: [
        "If this helped, subscribe and hit the bell 🔔",
        "Like and subscribe for more recommendations 👍",
        "Tell me in the comments what you'd like me to try next 💬"
      ]
    },

    pinterestTitle: [
      "{name} | Ideas & Recommendations",
      "{name}: the essential you need",
      "Discover {name}",
      "{name} – a must-have favorite"
    ],

    networkTags: {
      facebook: ["recommendation"],
      instagram: ["musthave", "founditonline", "favorites", "shopping", "lifestyle", "recommendations"],
      tiktok: ["tiktokmademebuyit", "musthave", "fyp"],
      youtube: ["review", "honestreview"],
      pinterest: ["ideas", "inspiration"]
    }
  },

  /* ---------------------------------------------------------------
     CATEGORÍAS: se detectan por palabras clave en el nombre,
     la descripción y las características. Sirven para los hashtags
     y para las ideas de tablero de Pinterest (máximo 3 palabras).
     --------------------------------------------------------------- */
  categories: [
    {
      id: "belleza",
      keywords: ["crema", "sérum", "serum", "maquillaje", "labial", "skincare", "cream", "makeup", "lipstick", "perfume", "fragancia", "fragrance", "champú", "shampoo", "acondicionador", "conditioner", "uñas", "nail", "facial", "piel", "skin", "rímel", "mascara", "colorete", "blush", "hidratante", "moisturizer", "cosmético", "cosmetic", "brocha", "brush", "secador", "plancha de pelo", "rizador", "cabello", "hair"],
      tags: { es: ["belleza", "skincare", "cuidadodelapiel", "maquillaje"], en: ["beauty", "skincare", "makeup", "selfcare"] },
      boards: {
        es: ["Belleza que enamora", "Rutina de skincare", "Básicos de belleza", "Glow natural", "Mi neceser ideal", "Autocuidado diario"],
        en: ["Beauty Must-Haves", "Skincare Routine", "Natural Glow", "Beauty Essentials", "Self-Care Daily", "Makeup Bag Favorites"]
      }
    },
    {
      id: "moda",
      keywords: ["vestido", "dress", "camisa", "shirt", "blusa", "blouse", "pantalón", "pants", "jeans", "vaqueros", "falda", "skirt", "chaqueta", "jacket", "abrigo", "coat", "zapato", "shoe", "zapatilla", "sneaker", "bolso", "bag", "handbag", "sandalia", "sandal", "bota", "boot", "jersey", "sweater", "camiseta", "t-shirt", "ropa", "clothing", "moda", "fashion", "cinturón", "belt", "gafas de sol", "sunglasses"],
      tags: { es: ["moda", "estilo", "outfit", "lookdeldia"], en: ["fashion", "style", "ootd", "outfitideas"] },
      boards: {
        es: ["Looks que inspiran", "Armario cápsula", "Estilo diario", "Moda atemporal", "Outfits de temporada", "Básicos de armario"],
        en: ["Outfit Inspiration", "Capsule Wardrobe", "Everyday Style", "Timeless Fashion", "Seasonal Outfits", "Wardrobe Basics"]
      }
    },
    {
      id: "joyeria",
      keywords: ["collar", "necklace", "pulsera", "bracelet", "anillo", "ring", "pendiente", "earring", "joya", "jewelry", "jewellery", "reloj", "watch", "oro", "gold", "plata", "silver"],
      tags: { es: ["joyas", "accesorios", "joyeria", "detalles"], en: ["jewelry", "accessories", "jewelrylover", "giftideas"] },
      boards: {
        es: ["Joyas con estilo", "Accesorios favoritos", "Detalles que brillan", "Ideas para regalar"],
        en: ["Jewelry Love", "Favorite Accessories", "Little Sparkles", "Gift Ideas"]
      }
    },
    {
      id: "hogar",
      keywords: ["lámpara", "lamp", "cojín", "cushion", "pillow", "manta", "blanket", "decoración", "decor", "jarrón", "vase", "vela", "candle", "alfombra", "rug", "cortina", "curtain", "espejo", "mirror", "estantería", "shelf", "organizador", "organizer", "sábana", "sheet", "toalla", "towel", "hogar", "home", "salón", "dormitorio", "bedroom", "baño", "bathroom", "mueble", "furniture"],
      tags: { es: ["hogar", "decoracion", "deco", "hogardulcehogar"], en: ["homedecor", "home", "interiordesign", "cozyhome"] },
      boards: {
        es: ["Hogar con encanto", "Ideas de decoración", "Rincones acogedores", "Casa en orden", "Deco minimalista"],
        en: ["Cozy Home", "Home Decor Ideas", "Cozy Corners", "Organized Home", "Minimalist Decor"]
      }
    },
    {
      id: "cocina",
      keywords: ["sartén", "pan", "olla", "pot", "cuchillo", "knife", "freidora", "air fryer", "batidora", "blender", "cafetera", "coffee", "taza", "mug", "cocina", "kitchen", "recipiente", "container", "tupper", "plato", "plate", "vaso", "glass", "robot de cocina", "horno", "oven", "tostadora", "toaster"],
      tags: { es: ["cocina", "recetas", "cocinaencasa", "menaje"], en: ["kitchen", "kitchengadgets", "homecooking", "foodie"] },
      boards: {
        es: ["Cocina práctica", "Básicos de cocina", "Recetas fáciles", "Cocina con estilo"],
        en: ["Kitchen Essentials", "Kitchen Gadgets", "Easy Recipes", "Stylish Kitchen"]
      }
    },
    {
      id: "tecnologia",
      keywords: ["auricular", "headphone", "earbuds", "cascos", "móvil", "phone", "smartphone", "cargador", "charger", "cable", "tablet", "portátil", "laptop", "altavoz", "speaker", "smartwatch", "cámara", "camera", "teclado", "keyboard", "ratón", "mouse", "bluetooth", "usb", "inalámbrico", "wireless", "power bank", "batería", "gadget", "led"],
      tags: { es: ["tecnologia", "gadgets", "tech", "novedades"], en: ["tech", "gadgets", "techgadgets", "musthavetech"] },
      boards: {
        es: ["Gadgets útiles", "Tecnología diaria", "Escritorio ideal", "Tech favorito"],
        en: ["Useful Gadgets", "Everyday Tech", "Desk Setup", "Tech Favorites"]
      }
    },
    {
      id: "fitness",
      keywords: ["yoga", "esterilla", "mat", "pesa", "dumbbell", "mancuerna", "fitness", "gym", "gimnasio", "deporte", "sport", "running", "correr", "botella", "bottle", "proteína", "protein", "banda elástica", "resistance band", "entrenamiento", "workout", "leggings", "mallas"],
      tags: { es: ["fitness", "vidasana", "deporte", "entrenamiento"], en: ["fitness", "workout", "healthylifestyle", "gymlife"] },
      boards: {
        es: ["Vida activa", "Rutina fitness", "Entreno en casa", "Bienestar diario"],
        en: ["Active Life", "Fitness Routine", "Home Workout", "Daily Wellness"]
      }
    },
    {
      id: "bebe",
      keywords: ["bebé", "baby", "infantil", "kids", "niño", "niña", "child", "juguete", "toy", "pañal", "diaper", "carrito de bebé", "stroller", "chupete", "pacifier", "biberón"],
      tags: { es: ["bebe", "maternidad", "crianza", "mamá"], en: ["baby", "momlife", "parenting", "babyessentials"] },
      boards: {
        es: ["Mundo bebé", "Básicos de maternidad", "Ideas para peques", "Juego y aprendizaje"],
        en: ["Baby Essentials", "Mom Life", "Kids Ideas", "Play and Learn"]
      }
    },
    {
      id: "mascotas",
      keywords: ["perro", "dog", "gato", "cat", "mascota", "pet", "correa", "leash", "collar para perro", "comedero", "bowl", "cama para", "pienso", "arenero"],
      tags: { es: ["mascotas", "perros", "gatos", "amoranimal"], en: ["pets", "doglover", "catlover", "petessentials"] },
      boards: {
        es: ["Amor peludo", "Mascotas felices", "Básicos para mascotas"],
        en: ["Furry Friends", "Happy Pets", "Pet Essentials"]
      }
    }
  ],

  /* Tableros genéricos cuando no se reconoce la categoría */
  genericBoards: {
    es: ["Hallazgos favoritos", "Ideas que inspiran", "Lista de deseos", "Imprescindibles", "Ideas para regalar", "Estilo de vida"],
    en: ["Favorite Finds", "Inspiring Ideas", "Wish List", "Must-Haves", "Gift Ideas", "Lifestyle Inspiration"]
  },

  /* Palabras que no se convierten en hashtags */
  stopwords: ["para", "con", "sin", "por", "los", "las", "del", "una", "uno", "unos", "unas", "que", "the", "and", "for", "with", "from", "your", "this", "that", "pack", "set", "nuevo", "new", "mujer", "hombre", "women", "men", "de", "la", "el", "y", "con", "of", "a", "an"],

  /* ---------------------------------------------------------------
     PROMPTS CREATIVOS (imagen y vídeo)
     --------------------------------------------------------------- */
  visualStyles: {
    lujo: {
      es: "estética de lujo, tonos negro, dorado y crema, materiales nobles como mármol y terciopelo, iluminación dramática y suave, sensación premium",
      en: "luxury aesthetic, black, gold and cream tones, rich materials like marble and velvet, soft dramatic lighting, premium feel"
    },
    minimalista: {
      es: "estética minimalista, fondo liso en tonos neutros, mucho espacio vacío, composición limpia, sombras suaves",
      en: "minimalist aesthetic, plain neutral background, lots of negative space, clean composition, soft shadows"
    },
    luminoso: {
      es: "estilo moderno y luminoso, luz natural abundante, tonos blancos y pastel, ambiente fresco y actual",
      en: "modern and bright style, abundant natural light, white and pastel tones, fresh contemporary mood"
    },
    natural: {
      es: "estilo natural y acogedor, madera, lino, plantas verdes, luz cálida de tarde, ambiente hogareño",
      en: "natural and cozy style, wood, linen, green plants, warm late-afternoon light, homey atmosphere"
    },
    colorido: {
      es: "estilo colorido y dinámico, colores vivos y saturados, formas geométricas, energía alegre y juvenil",
      en: "colorful and dynamic style, bold saturated colors, geometric shapes, playful youthful energy"
    }
  },

  /* Texto que va SIEMPRE al principio de los prompts de imagen y vídeo */
  referencePrefix: {
    es: "Usa como referencia exacta la foto del producto que adjunto. Reproduce el producto 100% igual: misma forma, colores, materiales y proporciones. No añadas objetos, cajas ni piezas extra. Colócalo en una posición natural y realista, por ejemplo un tablero apoyado plano sobre una mesa. Si aparecen personas o manos, deben tener anatomía y proporciones correctas y realistas, con el tamaño adecuado respecto al producto.",
    en: "Use the product photo I attach as an exact reference. Reproduce the product 100% identically: same shape, colors, materials and proportions. Do not add objects, boxes or extra pieces. Place it in a natural, realistic position, for example a board lying flat on a table. If people or hands appear, they must have correct, realistic anatomy and proportions, at the right size relative to the product."
  },

  formats: {
    "9:16": { es: "vertical 9:16 (Reels, TikTok, Stories, Shorts)", en: "vertical 9:16 (Reels, TikTok, Stories, Shorts)" },
    "1:1": { es: "cuadrado 1:1 (feed de Instagram y Facebook)", en: "square 1:1 (Instagram and Facebook feed)" },
    "16:9": { es: "horizontal 16:9 (YouTube y web)", en: "horizontal 16:9 (YouTube and web)" }
  }
};
