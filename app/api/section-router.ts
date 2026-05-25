import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { sections, sectionMedia } from "@db/schema";

const sectionTypeSchema = z.enum([
  "hero",
  "services",
  "process",
  "stats",
  "cta",
  "gallery",
  "video_showcase",
  "fullscreen_slider",
  "before_after",
  "testimonials",
  "brands",
]);

export const sectionRouter = createRouter({
  // Public: list active sections by page slug
  listByPage: publicQuery
    .input(z.object({ pageId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const sectionList = await db
        .select()
        .from(sections)
        .where(eq(sections.pageId, input.pageId))
        .orderBy(asc(sections.order));

      const mediaList = await db
        .select()
        .from(sectionMedia)
        .orderBy(asc(sectionMedia.order));

      return sectionList.map((s) => ({
        ...s,
        media: mediaList.filter((m) => m.sectionId === s.id),
      }));
    }),

  // Public: get single section with media
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(sections)
        .where(eq(sections.id, input.id))
        .limit(1);
      const section = result[0] ?? null;
      if (!section) return null;

      const media = await db
        .select()
        .from(sectionMedia)
        .where(eq(sectionMedia.sectionId, section.id))
        .orderBy(asc(sectionMedia.order));

      return { ...section, media };
    }),

  // Admin: list all sections (with page filter optional)
  list: adminQuery
    .input(z.object({ pageId: z.number().optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(sections).orderBy(asc(sections.order));

      if (input?.pageId) {
        query = db
          .select()
          .from(sections)
          .where(eq(sections.pageId, input.pageId))
          .orderBy(asc(sections.order)) as typeof query;
      }

      const sectionList = await query;
      const mediaList = await db
        .select()
        .from(sectionMedia)
        .orderBy(asc(sectionMedia.order));

      return sectionList.map((s) => ({
        ...s,
        media: mediaList.filter((m) => m.sectionId === s.id),
      }));
    }),

  // Admin: create section
  create: adminQuery
    .input(
      z.object({
        pageId: z.number(),
        type: sectionTypeSchema,
        title: z.string().max(255).optional(),
        subtitle: z.string().max(500).optional(),
        data: z.record(z.string(), z.any()).default({}),
        settings: z.record(z.string(), z.any()).optional(),
        order: z.number().default(0),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(sections).values({
        ...input,
        settings: input.settings ?? {},
      });
      return { id: Number(result[0].insertId) };
    }),

  // Admin: update section
  update: adminQuery
    .input(
      z.object({
        id: z.number(),
        pageId: z.number().optional(),
        type: sectionTypeSchema.optional(),
        title: z.string().max(255).optional().nullable(),
        subtitle: z.string().max(500).optional().nullable(),
        data: z.record(z.string(), z.any()).optional(),
        settings: z.record(z.string(), z.any()).optional(),
        order: z.number().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const db = getDb();
      await db.update(sections).set(data).where(eq(sections.id, id));
      return { success: true };
    }),

  // Admin: delete section (and its media)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(sectionMedia).where(eq(sectionMedia.sectionId, input.id));
      await db.delete(sections).where(eq(sections.id, input.id));
      return { success: true };
    }),

  // Admin: reorder sections
  reorder: adminQuery
    .input(
      z.array(
        z.object({
          id: z.number(),
          order: z.number(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        await db
          .update(sections)
          .set({ order: item.order })
          .where(eq(sections.id, item.id));
      }
      return { success: true };
    }),

  // Admin: add media to section
  addMedia: adminQuery
    .input(
      z.object({
        sectionId: z.number(),
        url: z.string().min(1),
        type: z.enum(["image", "video"]),
        order: z.number().default(0),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(sectionMedia).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Admin: remove media
  removeMedia: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(sectionMedia).where(eq(sectionMedia.id, input.id));
      return { success: true };
    }),

  // Admin: reorder media
  reorderMedia: adminQuery
    .input(
      z.array(
        z.object({
          id: z.number(),
          order: z.number(),
        })
      )
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      for (const item of input) {
        await db
          .update(sectionMedia)
          .set({ order: item.order })
          .where(eq(sectionMedia.id, item.id));
      }
      return { success: true };
    }),
});
