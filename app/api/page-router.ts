import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { pages } from "@db/schema";

export const pageRouter = createRouter({
  // Public: list all active pages
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(pages).where(eq(pages.isActive, true)).orderBy(asc(pages.order));
  }),

  // Public: get page by slug with sections
  getBySlug: publicQuery
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(pages)
        .where(eq(pages.slug, input.slug))
        .limit(1);
      return result[0] ?? null;
    }),

  // Admin: create page
  create: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        slug: z.string().min(1).max(100),
        isActive: z.boolean().default(true),
        order: z.number().default(0),
        metaTitle: z.string().max(255).optional(),
        metaDescription: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(pages).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Admin: update page
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).max(255).optional(),
        slug: z.string().min(1).max(100).optional(),
        isActive: z.boolean().optional(),
        order: z.number().optional(),
        metaTitle: z.string().max(255).optional().nullable(),
        metaDescription: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(pages).set(data).where(eq(pages.id, id));
      return { success: true };
    }),

  // Admin: delete page
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(pages).where(eq(pages.id, input.id));
      return { success: true };
    }),
});
