import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { writeFile, mkdir, readFile } from "fs/promises";
import { join, resolve } from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { findUserByEmail, createUser, addUserRole } from "./queries/users";
import { hashPassword } from "./lib/auth";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC_DIR = resolve(process.cwd(), "public");
const DIST_DIR = resolve(process.cwd(), "dist/public");

const app = new Hono<{ Bindings: HttpBindings }>();

app.use(bodyLimit({ maxSize: 50 * 1024 * 1024 }));

// Seed superadmin on first run
async function seedSuperadmin() {
  if (!env.superadminEmail || !env.superadminPassword) {
    console.warn("[seed] SUPERADMIN_EMAIL or SUPERADMIN_PASSWORD not set, skipping superadmin seed.");
    return;
  }

  try {
    const existing = await findUserByEmail(env.superadminEmail);
    if (existing) {
      console.log("[seed] Superadmin already exists.");
      return;
    }

    const passwordHash = await hashPassword(env.superadminPassword);
    const userId = await createUser({
      email: env.superadminEmail,
      name: "Superadmin",
      passwordHash,
      isActive: true,
    });

    await addUserRole(userId, "superadmin", "global");
    console.log(`[seed] Superadmin created: ${env.superadminEmail}`);
  } catch (error) {
    console.error("[seed] Failed to create superadmin:", error);
  }
}

// Run seed
seedSuperadmin();

// File upload
app.post("/api/upload", async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return c.json({ error: "No file provided" }, 400);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "video/mp4", "video/webm", "video/quicktime"];
    if (!allowedTypes.includes(file.type)) return c.json({ error: "Invalid file type" }, 400);

    const ext = file.name.split(".").pop() || "bin";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const filename = `${timestamp}-${random}.${ext}`;
    const isVideo = file.type.startsWith("video/");
    const subDir = isVideo ? "videos" : "images";
    const uploadDir = join(PUBLIC_DIR, "uploads", subDir);

    if (!existsSync(uploadDir)) await mkdir(uploadDir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filePath = join(uploadDir, filename);
    await writeFile(filePath, buffer);

    return c.json({ success: true, url: `/uploads/${subDir}/${filename}`, filename, type: file.type, size: file.size });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve uploaded files
app.get("/uploads/*", async (c) => {
  const reqPath = c.req.path;
  const filePath = join(PUBLIC_DIR, reqPath);
  if (!existsSync(filePath)) return c.json({ error: "File not found" }, 404);
  const file = await readFile(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    gif: "image/gif", mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime",
  };
  c.header("Content-Type", mimeTypes[ext || ""] || "application/octet-stream");
  return c.body(file);
});

// tRPC handler
app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

// API 404
app.all("/api/*", (c) => c.json({ error: "API route not found" }, 404));

// Serve static files from dist/public
app.get("/assets/*", async (c) => {
  const reqPath = c.req.path;
  const filePath = join(DIST_DIR, reqPath);
  if (!existsSync(filePath)) return c.json({ error: "Not found" }, 404);
  const file = await readFile(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    js: "application/javascript", css: "text/css", svg: "image/svg+xml",
    png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp",
    gif: "image/gif", woff2: "font/woff2", woff: "font/woff",
  };
  c.header("Content-Type", mimeTypes[ext || ""] || "application/octet-stream");
  return c.body(file);
});

app.get("/images/*", async (c) => {
  const reqPath = c.req.path;
  const filePath = join(DIST_DIR, reqPath);
  if (!existsSync(filePath)) return c.json({ error: "Not found" }, 404);
  const file = await readFile(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif",
  };
  c.header("Content-Type", mimeTypes[ext || ""] || "application/octet-stream");
  return c.body(file);
});

app.get("/videos/*", async (c) => {
  const reqPath = c.req.path;
  const filePath = join(DIST_DIR, reqPath);
  if (!existsSync(filePath)) return c.json({ error: "Not found" }, 404);
  const file = await readFile(filePath);
  const ext = filePath.split(".").pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    mp4: "video/mp4", webm: "video/webm", mov: "video/quicktime", ogv: "video/ogg",
  };
  c.header("Content-Type", mimeTypes[ext || ""] || "application/octet-stream");
  return c.body(file);
});

app.get("/logo.svg", async (c) => {
  const filePath = join(DIST_DIR, "logo.svg");
  if (!existsSync(filePath)) return c.json({ error: "Not found" }, 404);
  c.header("Content-Type", "image/svg+xml");
  return c.body(await readFile(filePath));
});

app.get("/acceso.html", async (c) => {
  const filePath = join(DIST_DIR, "acceso.html");
  if (!existsSync(filePath)) return c.json({ error: "Not found" }, 404);
  c.header("Content-Type", "text/html");
  return c.body(await readFile(filePath));
});

// SPA fallback - serve index.html for ALL remaining routes
app.get("*", async (c) => {
  const indexPath = join(DIST_DIR, "index.html");
  if (existsSync(indexPath)) {
    c.header("Content-Type", "text/html");
    return c.body(await readFile(indexPath));
  }
  return c.json({ error: "Not Found" }, 404);
});

export default app;

if (env.isProduction) {
  const { serve } = await import("@hono/node-server");
  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
