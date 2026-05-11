import { z } from "zod";
import { eq } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { siteContent } from "@db/schema";

const sectionSchema = z.enum(["hero", "services", "process", "stats", "cta"]);

export const contentRouter = createRouter({
  // Public: get single section
  get: publicQuery
    .input(sectionSchema)
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, input))
        .limit(1);
      return result[0] ?? null;
    }),

  // Public: get all sections
  getAll: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(siteContent);
  }),

  // Admin: create or update section
  update: adminQuery
    .input(
      z.object({
        section: sectionSchema,
        data: z.record(z.string(), z.any()),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const existing = await db
        .select()
        .from(siteContent)
        .where(eq(siteContent.section, input.section))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(siteContent)
          .set({ data: input.data })
          .where(eq(siteContent.section, input.section));
      } else {
        await db.insert(siteContent).values({
          section: input.section,
          data: input.data,
        });
      }

      return { success: true };
    }),
});
