import { authRouter } from "./auth-router";
import { projectRouter } from "./project-router";
import { contactRouter } from "./contact-router";
import { contentRouter } from "./content-router";
import { uploadRouter } from "./upload-router";
import { pageRouter } from "./page-router";
import { sectionRouter } from "./section-router";
import { clientRouter } from "./client-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  project: projectRouter,
  contact: contactRouter,
  content: contentRouter,
  upload: uploadRouter,
  page: pageRouter,
  section: sectionRouter,
  client: clientRouter,
});

export type AppRouter = typeof appRouter;
