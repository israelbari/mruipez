import type { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import fs from "fs";
import path from "path";

type App = Hono<{ Bindings: HttpBindings }>;

export function serveStaticFiles(app: App) {
  const distPath = path.resolve(import.meta.dirname, "../dist/public");

  // Serve static assets (JS, CSS, images, etc.)
  app.use("/assets/*", serveStatic({ root: "./dist/public" }));
  app.use("/images/*", serveStatic({ root: "./dist/public" }));
  app.use("/logo.svg", serveStatic({ root: "./dist/public" }));
  app.use("/uploads/*", serveStatic({ root: "./public" }));

  // SPA fallback: serve index.html for all non-API routes
  // This must be after all other routes
  app.get("*", (c) => {
    const reqPath = c.req.path;
    // Skip API routes
    if (reqPath.startsWith("/api/")) {
      return c.json({ error: "Not Found" }, 404);
    }
    // Skip uploaded files (handled separately in boot.ts)
    if (reqPath.startsWith("/uploads/")) {
      return c.json({ error: "Not Found" }, 404);
    }

    // Serve index.html for all client-side routes
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      const content = fs.readFileSync(indexPath, "utf-8");
      return c.html(content);
    }
    return c.json({ error: "Not Found" }, 404);
  });
}
