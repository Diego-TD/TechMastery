import type { Lang } from "./ui";

export type LandingContent = {
  meta: {
    title: string;
    description: string;
  };
  nav: {
    product: string;
    workshops: string;
    approach: string;
    privacy: string;
    contact: string;
    app: string;
    github: string;
  };
  controls: {
    language: string;
    theme: string;
    github: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    trust: string[];
    shotAlt: string;
  };
  sections: {
    product: {
      eyebrow: string;
      title: string;
      body: string;
      features: Array<{
        title: string;
        body: string;
        shot: string;
        shotAlt: string;
      }>;
    };
    workshop: {
      eyebrow: string;
      title: string;
      body: string;
      steps: Array<{ title: string; body: string }>;
    };
    approach: {
      eyebrow: string;
      title: string;
      body: string;
      principles: Array<{ title: string; body: string }>;
      quote: string;
      quoteCite: string;
    };
    privacy: {
      eyebrow: string;
      title: string;
      body: string;
      storesTitle: string;
      avoidsTitle: string;
      stores: string[];
      avoids: string[];
    };
    evidence: {
      eyebrow: string;
      title: string;
      body: string;
      stats: Array<{ value: string; label: string }>;
    };
  };
  sdg: {
    eyebrow: string;
    title: string;
    body: string;
    alt: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    body: string;
    name: string;
    role: string;
  };
  openSource: {
    eyebrow: string;
    title: string;
    body: string;
    cta: string;
  };
  finalCta: {
    title: string;
    body: string;
    primaryCta: string;
    secondaryCta: string;
  };
  footer: {
    summary: string;
    app: string;
    github: string;
  };
};

export const landingContent: Record<Lang, LandingContent> = {
  en: {
    meta: {
      title: "TechMastery — see what holds your digital life together",
      description:
        "A warm, bilingual, open-source app for mapping your accounts, devices, and recovery paths — so you understand your setup, feel in control, and know your next step.",
    },
    nav: {
      product: "Product",
      workshops: "Workshops",
      approach: "Approach",
      privacy: "Privacy",
      contact: "Contact",
      app: "Open app",
      github: "GitHub",
    },
    controls: {
      language: "Language",
      theme: "Toggle theme",
      github: "View source on GitHub",
    },
    hero: {
      eyebrow: "For everyday digital life",
      title: "Digital safety,",
      titleAccent: "made understandable.",
      lead: "TechMastery maps your accounts, devices, and recovery paths so you can see what depends on what, spot weak points, and take one practical next step — without storing passwords.",
      primaryCta: "Map your first account",
      secondaryCta: "See how it works",
      trust: [
        "Bilingual, English & Spanish",
        "Metadata, not passwords",
        "Free & open source",
      ],
      shotAlt:
        "TechMastery account map showing how accounts, devices, and recovery paths connect",
    },
    sections: {
      product: {
        eyebrow: "What it does",
        title: "A living map of what you rely on",
        body: "Not a cybersecurity course. Not a password vault. TechMastery is a focused, friendly space to see your accounts, understand how they recover, and decide what to do next — every screen built to lower the stakes, not pile on red warnings.",
        features: [
          {
            title: "Inventory",
            body: "Add your accounts, devices, phone numbers, and authenticator apps by hand — at your own pace.",
            shot: "inventory",
            shotAlt: "Inventory screen listing accounts and devices",
          },
          {
            title: "Account map",
            body: "Watch how accounts, devices, authentication, and recovery paths quietly depend on each other.",
            shot: "accountmap",
            shotAlt:
              "Account map screen showing connected accounts and devices",
          },
          {
            title: "Readiness",
            body: "A gentle readiness score that shows what's solid, what's unclear, and the one thing worth doing next.",
            shot: "readiness",
            shotAlt: "Readiness screen with a score and category breakdown",
          },
          {
            title: "Simulations",
            body: "Play out the real fears: a lost phone, a locked email, a password manager you can't open.",
            shot: "simulations",
            shotAlt:
              "Simulations screen asking what breaks if you lose a device",
          },
        ],
      },
      workshop: {
        eyebrow: "In the classroom",
        title: "Built for workshops, useful on its own",
        body: "The app stands alone, but it shines in a room full of people. It gives talleres a shared, hands-on structure where students ask, compare, and learn from their own setup.",
        steps: [
          {
            title: "Start with a story",
            body: "Open with a real phishing or account-takeover story.",
          },
          {
            title: "Map together",
            body: "Map one real account and one recovery dependency, side by side.",
          },
          {
            title: "Run a simulation",
            body: "Ask out loud: what breaks if a phone, laptop, or email fails?",
          },
          {
            title: "Leave with a plan",
            body: "Walk out with one concrete action to finish this week.",
          },
        ],
      },
      approach: {
        eyebrow: "Our approach",
        title: "Responsibility before mastery",
        body: "Security usually treats people as the weak point to be fixed. We don't. A person is never just a score or a graph — the map is a tool for your own agency, nothing more.",
        principles: [
          {
            title: "No shame",
            body: '"Unknown" is an honest place to start. We name the gaps without making you feel at fault for having them.',
          },
          {
            title: "Calm over fear",
            body: "Guidance explains the why and helps you stay in control of your accounts — instead of scaring you into acting.",
          },
          {
            title: "People first",
            body: "The best learning is face-to-face — so the tool is made to be talked through, questioned, and adapted.",
          },
        ],
        quote:
          "Security systems put too much burden on people. Our job is to make that burden understandable, teachable, and manageable.",
        quoteCite: "The TechMastery approach, informed by Emmanuel Levinas",
      },
      privacy: {
        eyebrow: "Mission & data",
        title: "Built around metadata, not secrets",
        body: "TechMastery exists to help you learn your own setup and feel genuinely confident managing it. To do that we work with metadata — the shape of your accounts and how they recover — and keep the secrets out of it: we'd rather not hold them, and you're better off keeping them safe yourself.",
        storesTitle: "Worth mapping here",
        avoidsTitle: "Best kept with you",
        stores: [
          "Account names, categories, importance, and providers",
          "Device relations and recovery method types",
          "Whether 2FA, backup codes, or key files exist",
        ],
        avoids: [
          "Passwords and one-time recovery codes",
          "Full card numbers, ID documents, or private keys",
          "Anything you'd be uneasy seeing in a plain list",
        ],
      },
      evidence: {
        eyebrow: "Why this, why now",
        title: "A focused answer to what students told us",
        body: "The first diagnosis came from a small CETYS Ensenada class survey — participatory evidence, not a claim about every student. The pattern was clear: people weren't short on tools so much as a clear picture of their own setup.",
        stats: [
          {
            value: "90.5%",
            label: "faced phishing — or weren't sure they could spot it",
          },
          {
            value: "61.9%",
            label: "wouldn't know their next move if an account was exposed",
          },
          {
            value: "38%",
            label: "use a password manager — the rest keep it in their head",
          },
          {
            value: "95.2%",
            label: "wanted a hands-on workshop to work through it",
          },
        ],
      },
    },
    sdg: {
      eyebrow: "Sustainable Development Goal 4",
      title: "Quality education you can practice",
      body: "TechMastery turns digital literacy into an applied skill — students don't just hear about account safety, they map it, simulate it, and act on it. That's our clearest contribution to SDG 4: Quality Education.",
      alt: "United Nations Sustainable Development Goal 4: Quality Education",
    },
    contact: {
      eyebrow: "Say hello",
      title: "Built by Diego Torres",
      body: "A student project at CETYS Ensenada. Questions, ideas, or want to run a workshop with it? Reach out — I'd love to hear how you'd use it.",
      name: "Diego Torres",
      role: "CETYS Ensenada",
    },
    openSource: {
      eyebrow: "Open source",
      title: "Built in the open",
      body: "TechMastery is free and open source. Read the code, suggest an idea, or fork it for your own community — nothing about how it works is hidden.",
      cta: "View on GitHub",
    },
    finalCta: {
      title: "Start with one account.",
      body: "The full map can grow over time. The first win is small and real: one account, one device, one recovery path, one clearer next step.",
      primaryCta: "Map your first account",
      secondaryCta: "Read the mission",
    },
    footer: {
      summary:
        "A free, open-source digital-readiness app for mapping accounts, devices, and recovery — built with students at CETYS Ensenada.",
      app: "Open the app",
      github: "GitHub",
    },
  },
  es: {
    meta: {
      title: "TechMastery — descubre lo que sostiene tu vida digital",
      description:
        "Una app cálida, bilingüe y de código abierto para mapear tus cuentas, dispositivos y rutas de recuperación — para entender tu configuración, sentirte en control y saber qué sigue.",
    },
    nav: {
      product: "Producto",
      workshops: "Talleres",
      approach: "Enfoque",
      privacy: "Privacidad",
      contact: "Contacto",
      app: "Abrir app",
      github: "GitHub",
    },
    controls: {
      language: "Idioma",
      theme: "Cambiar tema",
      github: "Ver código en GitHub",
    },
    hero: {
      eyebrow: "Para tu vida digital diaria",
      title: "Seguridad digital,",
      titleAccent: "fácil de entender.",
      lead: "TechMastery mapea tus cuentas, dispositivos y rutas de recuperación para ver qué depende de qué, detectar puntos débiles y dar un siguiente paso práctico — sin guardar contraseñas.",
      primaryCta: "Mapea tu primera cuenta",
      secondaryCta: "Ver cómo funciona",
      trust: [
        "Bilingüe, español e inglés",
        "Metadatos, no contraseñas",
        "Gratis y de código abierto",
      ],
      shotAlt:
        "Mapa de cuentas de TechMastery mostrando cómo se conectan cuentas, dispositivos y rutas de recuperación",
    },
    sections: {
      product: {
        eyebrow: "Qué hace",
        title: "Un mapa vivo de lo que usas",
        body: "No es un curso de ciberseguridad. No es un gestor de contraseñas. TechMastery es un espacio enfocado y amable para ver tus cuentas, entender cómo se recuperan y decidir qué sigue — cada pantalla pensada para bajar la tensión, no para sumar alertas rojas.",
        features: [
          {
            title: "Inventario",
            body: "Agrega tus cuentas, dispositivos, teléfonos y apps de autenticación a mano, a tu ritmo.",
            shot: "inventory",
            shotAlt: "Pantalla de inventario con cuentas y dispositivos",
          },
          {
            title: "Mapa de cuentas",
            body: "Observa cómo tus cuentas, dispositivos, autenticación y rutas de recuperación dependen entre sí.",
            shot: "accountmap",
            shotAlt:
              "Pantalla del mapa de cuentas con cuentas y dispositivos conectados",
          },
          {
            title: "Preparación",
            body: "Un puntaje de preparación amable: qué está firme, qué no queda claro y lo único que vale la pena hacer ahora.",
            shot: "readiness",
            shotAlt:
              "Pantalla de preparación con puntaje y desglose por categoría",
          },
          {
            title: "Simulaciones",
            body: "Explora los miedos reales: perder el teléfono, quedar fuera del correo, no poder abrir el gestor de contraseñas.",
            shot: "simulations",
            shotAlt:
              "Pantalla de simulaciones que pregunta qué se rompe si pierdes un dispositivo",
          },
        ],
      },
      workshop: {
        eyebrow: "En el salón",
        title: "Diseñada para talleres, útil por sí sola",
        body: "La app funciona sola, pero brilla en un salón lleno de gente. Le da a los talleres una estructura práctica y compartida donde los estudiantes preguntan, comparan y aprenden de su propia configuración.",
        steps: [
          {
            title: "Empieza con una historia",
            body: "Abre con un caso real de phishing o cuenta comprometida.",
          },
          {
            title: "Mapeen juntos",
            body: "Mapeen una cuenta real y una dependencia de recuperación, lado a lado.",
          },
          {
            title: "Haz una simulación",
            body: "Pregunten en voz alta: ¿qué se rompe si falla un teléfono, laptop o correo?",
          },
          {
            title: "Termina con un plan",
            body: "Sal con una acción concreta para terminar esta semana.",
          },
        ],
      },
      approach: {
        eyebrow: "Nuestro enfoque",
        title: "Responsabilidad antes que dominio",
        body: "La seguridad suele tratar a las personas como el punto débil que hay que corregir. Aquí no. Nadie es solo un puntaje o una gráfica — el mapa es una herramienta para tu propia autonomía, nada más.",
        principles: [
          {
            title: "Empieza donde estás",
            body: '"Desconocido" es un punto de partida honesto. Nombramos los huecos sin hacerte sentir mal por tenerlos.',
          },
          {
            title: "Calma sobre miedo",
            body: "La guía explica el porqué y te ayuda a no perder el control de tus cuentas — en vez de asustarte para que actúes.",
          },
          {
            title: "Primero las personas",
            body: "El mejor aprendizaje es presencial — la herramienta está hecha para conversarse, cuestionarse y adaptarse.",
          },
        ],
        quote:
          "Los sistemas de seguridad ponen demasiada carga sobre las personas. Nuestro trabajo es hacer esa carga entendible, enseñable y manejable.",
        quoteCite: "El enfoque de TechMastery, inspirado en Emmanuel Lévinas",
      },
      privacy: {
        eyebrow: "Misión y datos",
        title: "Pensada para metadatos, no secretos",
        body: "TechMastery existe para ayudarte a entender tu propia configuración y a sentirte de verdad seguro manejándola. Para eso trabajamos con metadatos — la forma de tus cuentas y cómo se recuperan — y dejamos los secretos fuera: preferimos no guardarlos, y a ti te conviene cuidarlos por tu cuenta.",
        storesTitle: "Sí conviene mapear",
        avoidsTitle: "Mejor que quede contigo",
        stores: [
          "Nombres de cuentas, categorías, importancia y proveedores",
          "Relaciones con dispositivos y tipos de recuperación",
          "Si existen 2FA, códigos de respaldo o archivos clave",
        ],
        avoids: [
          "Contraseñas y códigos de recuperación de un solo uso",
          "Números completos de tarjetas, documentos de identidad o llaves privadas",
          "Cualquier cosa que no quisieras ver en una lista simple",
        ],
      },
      evidence: {
        eyebrow: "Por qué esto, por qué ahora",
        title: "Una respuesta enfocada a lo que nos dijeron",
        body: "El primer diagnóstico viene de una encuesta pequeña en CETYS Ensenada — evidencia participativa, no una afirmación sobre todos los estudiantes. El patrón fue claro: más que herramientas, faltaba una imagen clara de la propia configuración.",
        stats: [
          {
            value: "90.5%",
            label: "se topó con phishing — o no supo reconocerlo",
          },
          {
            value: "61.9%",
            label: "no sabría qué hacer si se expone una cuenta",
          },
          {
            value: "38%",
            label:
              "usa un gestor de contraseñas — el resto lo lleva de memoria",
          },
          {
            value: "95.2%",
            label: "quería un taller práctico para resolverlo",
          },
        ],
      },
    },
    sdg: {
      eyebrow: "Objetivo de Desarrollo Sostenible 4",
      title: "Educación de calidad que se practica",
      body: "TechMastery convierte la alfabetización digital en una habilidad aplicada — los estudiantes no solo escuchan sobre seguridad de cuentas: la mapean, la simulan y actúan. Esa es nuestra contribución más clara al ODS 4: Educación de Calidad.",
      alt: "Objetivo de Desarrollo Sostenible 4 de la ONU: Educación de Calidad",
    },
    contact: {
      eyebrow: "Saluda",
      title: "Hecho por Diego Torres",
      body: "Un proyecto estudiantil en CETYS Ensenada. ¿Dudas, ideas o quieres organizar un taller con esto? Escríbeme — me encantaría saber cómo lo usarías.",
      name: "Diego Torres",
      role: "CETYS Ensenada",
    },
    openSource: {
      eyebrow: "Código abierto",
      title: "Hecho a la vista de todos",
      body: "TechMastery es gratuito y de código abierto. Revisa el código, propón una idea o adáptalo para tu propia comunidad — nada de cómo funciona está oculto.",
      cta: "Ver en GitHub",
    },
    finalCta: {
      title: "Empieza con una cuenta.",
      body: "El mapa completo puede crecer con el tiempo. La primera victoria es pequeña y real: una cuenta, un dispositivo, una ruta de recuperación, un siguiente paso más claro.",
      primaryCta: "Mapea tu primera cuenta",
      secondaryCta: "Lee la misión",
    },
    footer: {
      summary:
        "Una app gratuita y de código abierto de preparación digital para mapear cuentas, dispositivos y recuperación — hecha con estudiantes en CETYS Ensenada.",
      app: "Abrir la app",
      github: "GitHub",
    },
  },
};
