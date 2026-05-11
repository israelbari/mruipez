import { authRouter } from "./auth-router";
import { projectRouter } from "./project-router";
import { contactRouter } from "./contact-router";
import { contentRouter } from "./content-router";
import { uploadRouter } from "./upload-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  project: projectRouter,
  contact: contactRouter,
  content: contentRouter,
  upload: uploadRouter,
});

export type AppRouter = typeof appRouter;
