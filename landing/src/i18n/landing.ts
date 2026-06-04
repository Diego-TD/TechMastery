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
    app: string;
  };
  controls: {
    language: string;
    theme: string;
  };
  hero: {
    eyebrow: string;
    title: string;
    titleAccent: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    trust: string[];
  };
  productMock: {
    title: string;
    scoreLabel: string;
    score: string;
    simulationLabel: string;
    nextActionLabel: string;
    nextAction: string;
    nodes: string[];
  };
  sections: {
    product: {
      eyebrow: string;
      title: string;
      body: string;
      features: Array<{ title: string; body: string }>;
    };
    workshop: {
      eyebrow: string;
      title: string;
      body: string;
      steps: string[];
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
      note: string;
    };
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
  };
};

export const landingContent: Record<Lang, LandingContent> = {
  en: {
    meta: {
      title: "TechMastery — see what holds your digital life together",
      description:
        "A warm, bilingual app for mapping your accounts, devices, and recovery paths — so you know what would break, and what to do next. No passwords stored, ever.",
    },
    nav: {
      product: "Product",
      workshops: "Workshops",
      approach: "Approach",
      privacy: "Privacy",
      app: "Open app",
    },
    controls: {
      language: "Language",
      theme: "Toggle theme",
    },
    hero: {
      eyebrow: "Made with CETYS students",
      title: "Know what holds your",
      titleAccent: "digital life together.",
      lead:
        "Your accounts, devices, and recovery paths are quietly tangled together. TechMastery helps you map them, see what would break if you lost your phone, and take one calm next step — no passwords, no shame.",
      primaryCta: "Map your first account",
      secondaryCta: "See how it works",
      trust: [
        "Bilingual, English & Spanish",
        "Metadata only — never your passwords",
        "Made for students",
      ],
    },
    productMock: {
      title: "Recovery readiness",
      scoreLabel: "Getting there",
      score: "68 / 100",
      simulationLabel: "Simulation",
      nextActionLabel: "Next action",
      nextAction: "Save backup codes for your main email.",
      nodes: ["Phone", "Gmail", "Banking", "Authenticator", "Laptop"],
    },
    sections: {
      product: {
        eyebrow: "What it does",
        title: "A living map of what you rely on",
        body:
          "Not a cybersecurity course. Not a password vault. TechMastery is a focused, friendly space to see your accounts, understand how they recover, and decide what to do next.",
        features: [
          {
            title: "Inventory",
            body:
              "Add your accounts, devices, phone numbers, and authenticator apps by hand — at your own pace.",
          },
          {
            title: "Account map",
            body:
              "Watch how accounts, devices, authentication, and recovery paths quietly depend on each other.",
          },
          {
            title: "Readiness",
            body:
              "A gentle continuity score that shows what's solid, what's unclear, and the one thing worth doing next.",
          },
          {
            title: "Simulations",
            body:
              "Play out the real fears: a lost phone, a locked email, a password manager you can't open.",
          },
        ],
      },
      workshop: {
        eyebrow: "In the classroom",
        title: "Built for workshops, useful on its own",
        body:
          "The app stands alone, but it shines in a room full of people. It gives talleres a shared, hands-on structure where students ask, compare, and learn from their own setup.",
        steps: [
          "Open with a real phishing or account-takeover story.",
          "Map one real account and one recovery dependency together.",
          "Run a simulation: what breaks if a phone, laptop, or email fails?",
          "Leave with one concrete action to finish this week.",
        ],
      },
      approach: {
        eyebrow: "Our approach",
        title: "Responsibility before mastery",
        body:
          "Security usually treats people as the weak point to be fixed. We don't. A person is never just a score or a graph — the map is a tool for your own agency, nothing more.",
        principles: [
          {
            title: "No shame",
            body:
              "\"Unknown\" is an honest place to start. We name the gaps without ever blaming you for them.",
          },
          {
            title: "Calm over fear",
            body:
              "Guidance teaches reasoning and continuity instead of leaning on doom-based security marketing.",
          },
          {
            title: "People first",
            body:
              "The best learning is face-to-face — so the tool is made to be talked through, questioned, and adapted.",
          },
        ],
        quote:
          "Security systems put too much burden on people. Our job is to make that burden understandable, teachable, and manageable.",
        quoteCite: "The TechMastery approach, informed by Levinas",
      },
      privacy: {
        eyebrow: "Data boundaries",
        title: "Built around metadata, not secrets",
        body:
          "TechMastery helps you understand your setup without ever becoming a vault for its most sensitive parts.",
        storesTitle: "Good to map",
        avoidsTitle: "Never asked for",
        stores: [
          "Account names, categories, importance, and providers",
          "Device relations and recovery method types",
          "Whether 2FA, backup codes, or key files exist",
        ],
        avoids: [
          "Passwords or secret recovery codes",
          "Full card numbers, ID documents, or private keys",
          "Any claim that you're now \"fully secure\"",
        ],
      },
      evidence: {
        eyebrow: "Why this, why now",
        title: "A focused answer to what students told us",
        body:
          "The first diagnosis came from a small CETYS Ensenada class survey — useful as participatory evidence, not a claim about every student.",
        stats: [
          { value: "90.5%", label: "received phishing attempts, or weren't sure" },
          { value: "61.9%", label: "wouldn't know what to do if their info were exposed" },
          { value: "95.2%", label: "were interested in a practical workshop" },
        ],
        note:
          "TechMastery aligns most directly with SDG 4: quality education — turning digital literacy into a skill you actually practice.",
      },
    },
    finalCta: {
      title: "Start with one account.",
      body:
        "The full map can grow over time. The first win is small and real: one account, one device, one recovery path, one clearer next step.",
      primaryCta: "Map your first account",
      secondaryCta: "Review privacy boundaries",
    },
    footer: {
      summary:
        "An open digital-readiness app for mapping accounts, devices, and recovery — built with students, at CETYS Ensenada.",
      app: "Open the app",
    },
  },
  es: {
    meta: {
      title: "TechMastery — descubre lo que sostiene tu vida digital",
      description:
        "Una app cálida y bilingüe para mapear tus cuentas, dispositivos y rutas de recuperación, ver qué se rompería y saber qué sigue. Nunca guarda contraseñas.",
    },
    nav: {
      product: "Producto",
      workshops: "Talleres",
      approach: "Enfoque",
      privacy: "Privacidad",
      app: "Abrir app",
    },
    controls: {
      language: "Idioma",
      theme: "Cambiar tema",
    },
    hero: {
      eyebrow: "Hecho con estudiantes de CETYS",
      title: "Descubre lo que sostiene",
      titleAccent: "tu vida digital.",
      lead:
        "Tus cuentas, dispositivos y rutas de recuperación están entrelazados sin que lo notes. TechMastery te ayuda a mapearlos, ver qué pasaría si pierdes tu teléfono y dar un siguiente paso con calma — sin contraseñas, sin culpas.",
      primaryCta: "Mapea tu primera cuenta",
      secondaryCta: "Ver cómo funciona",
      trust: [
        "Bilingüe, español e inglés",
        "Solo metadatos — nunca tus contraseñas",
        "Hecho para estudiantes",
      ],
    },
    productMock: {
      title: "Preparación de recuperación",
      scoreLabel: "Vas avanzando",
      score: "68 / 100",
      simulationLabel: "Simulación",
      nextActionLabel: "Siguiente acción",
      nextAction: "Guarda códigos de respaldo para tu correo principal.",
      nodes: ["Teléfono", "Gmail", "Banca", "Autenticador", "Laptop"],
    },
    sections: {
      product: {
        eyebrow: "Qué hace",
        title: "Un mapa vivo de lo que usas",
        body:
          "No es un curso de ciberseguridad. No es un gestor de contraseñas. TechMastery es un espacio enfocado y amable para ver tus cuentas, entender cómo se recuperan y decidir qué sigue.",
        features: [
          {
            title: "Inventario",
            body:
              "Agrega tus cuentas, dispositivos, teléfonos y apps de autenticación a mano, a tu ritmo.",
          },
          {
            title: "Mapa de cuentas",
            body:
              "Observa cómo tus cuentas, dispositivos, autenticación y rutas de recuperación dependen entre sí.",
          },
          {
            title: "Preparación",
            body:
              "Un puntaje de continuidad amable: qué está firme, qué no queda claro y lo único que vale la pena hacer ahora.",
          },
          {
            title: "Simulaciones",
            body:
              "Explora los miedos reales: perder el teléfono, quedar fuera del correo, no poder abrir el gestor de contraseñas.",
          },
        ],
      },
      workshop: {
        eyebrow: "En el salón",
        title: "Diseñada para talleres, útil por sí sola",
        body:
          "La app funciona sola, pero brilla en un salón lleno de gente. Le da a los talleres una estructura práctica y compartida donde los estudiantes preguntan, comparan y aprenden de su propia configuración.",
        steps: [
          "Abrir con un caso real de phishing o cuenta comprometida.",
          "Mapear juntos una cuenta real y una dependencia de recuperación.",
          "Simular: ¿qué se rompe si falla un teléfono, laptop o correo?",
          "Salir con una acción concreta para terminar esta semana.",
        ],
      },
      approach: {
        eyebrow: "Nuestro enfoque",
        title: "Responsabilidad antes que dominio",
        body:
          "La seguridad suele tratar a las personas como el punto débil que hay que corregir. Aquí no. Nadie es solo un puntaje o una gráfica — el mapa es una herramienta para tu propia agencia, nada más.",
        principles: [
          {
            title: "Sin culpas",
            body:
              "\"Desconocido\" es un punto de partida honesto. Nombramos los huecos sin culparte por ellos.",
          },
          {
            title: "Calma sobre miedo",
            body:
              "La guía enseña razonamiento y continuidad en vez de apoyarse en el marketing de seguridad basado en pánico.",
          },
          {
            title: "Primero las personas",
            body:
              "El mejor aprendizaje es presencial — la herramienta está hecha para conversarse, cuestionarse y adaptarse.",
          },
        ],
        quote:
          "Los sistemas de seguridad ponen demasiada carga sobre las personas. Nuestro trabajo es hacer esa carga entendible, enseñable y manejable.",
        quoteCite: "El enfoque de TechMastery, inspirado en Levinas",
      },
      privacy: {
        eyebrow: "Límites de datos",
        title: "Pensada para metadatos, no secretos",
        body:
          "TechMastery te ayuda a entender tu configuración sin convertirse jamás en una bóveda de sus partes más sensibles.",
        storesTitle: "Sí conviene mapear",
        avoidsTitle: "Nunca se pide",
        stores: [
          "Nombres de cuentas, categorías, importancia y proveedores",
          "Relaciones con dispositivos y tipos de recuperación",
          "Si existen 2FA, códigos de respaldo o archivos clave",
        ],
        avoids: [
          "Contraseñas o códigos secretos de recuperación",
          "Números completos de tarjetas, documentos de identidad o llaves privadas",
          "Cualquier promesa de que ya estás \"completamente seguro\"",
        ],
      },
      evidence: {
        eyebrow: "Por qué esto, por qué ahora",
        title: "Una respuesta enfocada a lo que nos dijeron",
        body:
          "El primer diagnóstico viene de una encuesta pequeña en CETYS Ensenada — sirve como evidencia participativa, no como afirmación sobre todos los estudiantes.",
        stats: [
          { value: "90.5%", label: "recibió intentos de phishing, o no estaba seguro" },
          { value: "61.9%", label: "no sabría qué hacer si se expone su información" },
          { value: "95.2%", label: "tenía interés en un taller práctico" },
        ],
        note:
          "TechMastery se alinea sobre todo con el ODS 4: educación de calidad — convierte la alfabetización digital en una habilidad que de verdad se practica.",
      },
    },
    finalCta: {
      title: "Empieza con una cuenta.",
      body:
        "El mapa completo puede crecer con el tiempo. La primera victoria es pequeña y real: una cuenta, un dispositivo, una ruta de recuperación, un siguiente paso más claro.",
      primaryCta: "Mapea tu primera cuenta",
      secondaryCta: "Revisar límites de privacidad",
    },
    footer: {
      summary:
        "Una app abierta de preparación digital para mapear cuentas, dispositivos y recuperación — hecha con estudiantes, en CETYS Ensenada.",
      app: "Abrir la app",
    },
  },
};
