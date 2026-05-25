import { drizzle } from "drizzle-orm/mysql2";
import { createConnection } from "mysql2";
import { projects, projectAssets, siteContent, pages, sections } from "./schema";
import { eq } from "drizzle-orm";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required");
}

const connection = createConnection(connectionString);
const db = drizzle(connection);

const seedProjects = [
  { name: "Villa Serena", category: "Residential" as const, subcategory: "Exteriors" as const, image: "/images/project-01.jpg", video: null, aspect: "16:9" as const, order: 1, featured: true },
  { name: "Atrium House", category: "Residential" as const, subcategory: "Interiors" as const, image: "/images/project-02.jpg", video: null, aspect: "3:4" as const, order: 2, featured: true },
  { name: "Casa del Sol", category: "Residential" as const, subcategory: "Interiors" as const, image: "/images/project-03.jpg", video: null, aspect: "3:4" as const, order: 3, featured: true },
  { name: "Loft Industrial", category: "Residential" as const, subcategory: "Interiors" as const, image: "/images/project-04.jpg", video: null, aspect: "3:4" as const, order: 4, featured: true },
  { name: "Penthouse 360", category: "Residential" as const, subcategory: "Exteriors" as const, image: "/images/project-05.jpg", video: null, aspect: "16:9" as const, order: 5, featured: true },
  { name: "Jardin Interior", category: "Commercial" as const, subcategory: "Interiors" as const, image: "/images/project-06.jpg", video: null, aspect: "3:4" as const, order: 6, featured: true },
  { name: "Marina Residences", category: "Residential" as const, subcategory: "Exteriors" as const, image: "/images/project-07.jpg", video: null, aspect: "16:9" as const, order: 7, featured: false },
  { name: "Office Horizon", category: "Commercial" as const, subcategory: "Interiors" as const, image: "/images/project-08.jpg", video: null, aspect: "3:4" as const, order: 8, featured: false },
  { name: "Casa Blanca", category: "Residential" as const, subcategory: "Exteriors" as const, image: "/images/project-09.jpg", video: null, aspect: "3:4" as const, order: 9, featured: false },
  { name: "Urban Spa", category: "Commercial" as const, subcategory: "Interiors" as const, image: "/images/project-10.jpg", video: null, aspect: "3:4" as const, order: 10, featured: false },
  { name: "Mountain Retreat", category: "Residential" as const, subcategory: "Exteriors" as const, image: "/images/project-11.jpg", video: null, aspect: "16:9" as const, order: 11, featured: false },
  { name: "Gallery Space", category: "Commercial" as const, subcategory: "Interiors" as const, image: "/images/project-12.jpg", video: null, aspect: "3:4" as const, order: 12, featured: false },
];

async function seed() {
  console.log("Seeding projects...");

  const existing = await db.select().from(projects);
  if (existing.length > 0) {
    console.log(`Found ${existing.length} existing projects. Skipping project seed.`);
  } else {
    for (const p of seedProjects) {
      const result = await db.insert(projects).values(p);
      const projectId = Number(result[0].insertId);
      console.log(`  - ${p.name} (id=${projectId})`);

      // Create asset for cover image
      await db.insert(projectAssets).values({
        projectId,
        url: p.image,
        type: "image",
        order: 0,
      });

      // Create asset for video if present
      if (p.video) {
        await db.insert(projectAssets).values({
          projectId,
          url: p.video,
          type: "video",
          order: 1,
        });
      }
    }
    console.log(`Seeded ${seedProjects.length} projects with assets.`);
  }

  // Seed site content (CMS)
  console.log("Seeding site content...");

  const seedContent = [
    {
      section: "hero" as const,
      data: {
        label: "Visualización Arquitectónica",
        heading: "Damos vida a la arquitectura por construir",
        subtext: "Desde Cartagena, España — creamos renders fotorrealistas para arquitectos y desarrolladores de todo el mundo",
        ctaText: "Ver nuestro trabajo",
        ctaLink: "/work",
        backgroundImage: "/videos/hero-bg.mp4",
      },
    },
    {
      section: "services" as const,
      data: {
        sectionLabel: "Qué hacemos",
        sectionTitle: "Del concepto al render fotorrealista",
        items: [
          { title: "Visualización 3D", description: "Renders fotorrealistas que comunican tu visión arquitectónica con claridad e impacto emocional.", icon: "Box" },
          { title: "Animación Walkthrough", description: "Movimientos de cámara cinematográficos a través de tus espacios, revelando cada detalle en movimiento.", icon: "Film" },
          { title: "Home Staging Virtual", description: "Amuebla espacios vacíos digitalmente para ayudar a los compradores a visualizar el potencial de cada habitación.", icon: "Armchair" },
        ],
      },
    },
    {
      section: "process" as const,
      data: {
        sectionLabel: "Nuestro Proceso",
        sectionTitle: "Del brief al render final",
        steps: [
          { number: "01", title: "Brief", description: "Estudiamos tus planos, referencias y visión para entender cada detalle del proyecto." },
          { number: "02", title: "Modelado", description: "La geometría 3D se construye con precisión, asegurando que cada proporción y material sea exacto." },
          { number: "03", title: "Materiales y Luz", description: "Texturas, shaders e iluminación se diseñan para crear atmósfera y realismo." },
          { number: "04", title: "Entrega", description: "Los renders finales se pulen y entregan en los formatos que necesitas para presentaciones y marketing." },
        ],
      },
    },
    {
      section: "stats" as const,
      data: {
        items: [
          { value: 120, suffix: "+", label: "Proyectos Entregados" },
          { value: 8, suffix: "", label: "Años de Experiencia" },
          { value: 50, suffix: "+", label: "Clientes Satisfechos" },
          { value: 24, suffix: "h", label: "Respuesta Promedio" },
        ],
      },
    },
    {
      section: "cta" as const,
      data: {
        heading: "¿Listo para visualizar tu próximo proyecto?",
        subtext: "Hablemos de cómo podemos dar vida a tu arquitectura.",
        ctaText: "Contáctanos →",
        ctaLink: "/contact",
      },
    },
  ];

  for (const c of seedContent) {
    const existingContent = await db.select().from(siteContent).where(eq(siteContent.section, c.section)).limit(1);
    if (existingContent.length === 0) {
      await db.insert(siteContent).values(c);
      console.log(`  - ${c.section}`);
    }
  }

  console.log("Site content seed complete.");

  // Seed pages
  console.log("Seeding pages...");
  const existingPages = await db.select().from(pages).limit(1);
  if (existingPages.length === 0) {
    await db.insert(pages).values({
      name: "Inicio",
      slug: "home",
      isActive: true,
      order: 0,
      metaTitle: "MRUIPEZ - Visualización Arquitectónica",
      metaDescription: "Renders fotorrealistas para arquitectos y desarrolladores",
    });
    console.log("  - Created page: Inicio");
  }

  // Seed sections from site_content
  console.log("Seeding sections...");
  const existingSections = await db.select().from(sections).limit(1);
  if (existingSections.length === 0) {
    const homePage = await db.select().from(pages).where(eq(pages.slug, "home")).limit(1);
    const pageId = homePage[0]?.id ?? 1;

    const siteContents = await db.select().from(siteContent);
    for (const sc of siteContents) {
      const titleMap: Record<string, string> = {
        hero: "Hero Principal",
        services: "Servicios",
        process: "Proceso de Trabajo",
        stats: "Estadísticas",
        cta: "Llamada a la Acción",
      };
      const orderMap: Record<string, number> = {
        hero: 0,
        services: 1,
        process: 2,
        stats: 3,
        cta: 4,
      };
      await db.insert(sections).values({
        pageId,
        type: sc.section,
        title: titleMap[sc.section] ?? sc.section,
        data: sc.data,
        settings: {},
        order: orderMap[sc.section] ?? 0,
        isActive: true,
      });
      console.log(`  - Created section: ${sc.section}`);
    }
  }

  connection.end();
}

seed().catch((err) => {
  console.error(err);
  connection.end();
  process.exit(1);
});
