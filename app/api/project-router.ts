import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects } from "@db/schema";

export const projectRouter = createRouter({
  // Public: list all projects
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(projects).orderBy(asc(projects.order));
  }),

  // Public: list featured projects
  featured: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(projects).where(eq(projects.featured, true)).orderBy(asc(projects.order));
  }),

  // Public: get single project
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(projects).where(eq(projects.id, input.id)).limit(1);
      return result[0] ?? null;
    }),

  // Admin: create project
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.enum(["Residential", "Commercial"]),
        subcategory: z.enum(["Interiors", "Exteriors"]),
        image: z.string().min(1).max(500),
        video: z.string().max(500).optional(),
        aspect: z.enum(["16:9", "3:4", "4:5"]).default("16:9"),
        order: z.number().default(0),
        featured: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(projects).values({
        name: input.name,
        category: input.category,
        subcategory: input.subcategory,
        image: input.image,
        video: input.video || null,
        aspect: input.aspect,
        order: input.order,
        featured: input.featured,
      });
      return { id: Number(result[0].insertId) };
    }),

  // Admin: update project
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255),
        category: z.enum(["Residential", "Commercial"]),
        subcategory: z.enum(["Interiors", "Exteriors"]),
        image: z.string().min(1).max(500),
        video: z.string().max(500).optional(),
        aspect: z.enum(["16:9", "3:4", "4:5"]).default("16:9"),
        order: z.number().default(0),
        featured: z.boolean().default(false),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(projects).set({
        ...data,
        video: data.video || null,
      }).where(eq(projects.id, id));
      return { success: true };
    }),

  // Admin: delete project
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),
});
