import { z } from "zod";
import { eq, desc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contactSubmissions } from "@db/schema";

export const contactRouter = createRouter({
  // Public: submit contact form
  submit: publicQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        email: z.string().email().max(320),
        projectType: z.string().min(1).max(100),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(contactSubmissions).values(input);
      return { success: true };
    }),

  // Admin: list submissions
  list: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(contactSubmissions).orderBy(desc(contactSubmissions.createdAt));
  }),

  // Admin: mark as read
  markRead: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(contactSubmissions).set({ read: true }).where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),

  // Admin: delete submission
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contactSubmissions).where(eq(contactSubmissions.id, input.id));
      return { success: true };
    }),
});
