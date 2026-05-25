import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, adminQuery, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { hashPassword } from "./lib/auth";
import {
  users,
  userRoles,
  clientProjects,
  clientProjectMedia,
  clientComments,
  clientTimeEntries,
  projects as portfolioProjects,
  projectAssets,
} from "@db/schema";
import { eq, and, desc, asc } from "drizzle-orm";

export const clientRouter = createRouter({
  // List clients with project and upload stats
  listClients: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

    const result = [];
    for (const u of allUsers) {
      const roles = await db
        .select()
        .from(userRoles)
        .where(and(eq(userRoles.userId, u.id), eq(userRoles.role, "client")));

      if (roles.length === 0) continue;

      const userProjects = await db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.clientId, u.id));

      let mediaCount = 0;
      for (const p of userProjects) {
        const media = await db
          .select()
          .from(clientProjectMedia)
          .where(eq(clientProjectMedia.projectId, p.id));
        mediaCount += media.length;
      }

      result.push({
        id: u.id,
        name: u.name,
        email: u.email,
        isActive: u.isActive,
        createdAt: u.createdAt,
        projectCount: userProjects.length,
        mediaCount,
      });
    }
    return result;
  }),

  // Get details for a single client
  getClient: adminQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
      const user = result[0];
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Cliente no encontrado",
        });
      }
      return user;
    }),

  // Create a new client (user + role)
  createClient: adminQuery
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        password: z.string().min(6),
        isActive: z.boolean().default(true),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if user exists
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, input.email))
        .limit(1);
      if (existing.length > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El email ya está registrado",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const result = await db.insert(users).values({
        name: input.name,
        email: input.email,
        passwordHash,
        isActive: input.isActive,
      });
      const userId = Number(result[0].insertId);

      // Assign role "client"
      await db.insert(userRoles).values({
        userId,
        role: "client",
        scope: "global",
      });

      return { id: userId };
    }),

  // Delete client user and cascade
  deleteClient: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      // Delete user roles
      await db.delete(userRoles).where(eq(userRoles.userId, input.id));
      
      // Get all projects of client to delete comments, entries, media
      const userProjects = await db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.clientId, input.id));

      for (const p of userProjects) {
        await db.delete(clientComments).where(eq(clientComments.projectId, p.id));
        await db.delete(clientTimeEntries).where(eq(clientTimeEntries.projectId, p.id));
        await db.delete(clientProjectMedia).where(eq(clientProjectMedia.projectId, p.id));
      }

      await db.delete(clientProjects).where(eq(clientProjects.clientId, input.id));
      await db.delete(users).where(eq(users.id, input.id));

      return { success: true };
    }),

  // Get projects for a specific client
  getClientProjects: adminQuery
    .input(z.object({ clientId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const projectsList = await db
        .select()
        .from(clientProjects)
        .where(eq(clientProjects.clientId, input.clientId))
        .orderBy(desc(clientProjects.createdAt));

      const result = [];
      for (const p of projectsList) {
        const media = await db
          .select()
          .from(clientProjectMedia)
          .where(eq(clientProjectMedia.projectId, p.id))
          .orderBy(desc(clientProjectMedia.createdAt));

        const comments = await db
          .select()
          .from(clientComments)
          .where(eq(clientComments.projectId, p.id))
          .orderBy(desc(clientComments.createdAt));

        const timeEntries = await db
          .select()
          .from(clientTimeEntries)
          .where(eq(clientTimeEntries.projectId, p.id))
          .orderBy(desc(clientTimeEntries.date));

        result.push({
          ...p,
          media,
          comments,
          timeEntries,
        });
      }
      return result;
    }),

  // Create a new client project
  createProject: adminQuery
    .input(
      z.object({
        clientId: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(clientProjects).values({
        clientId: input.clientId,
        name: input.name,
        description: input.description || null,
        status: "active",
      });
      return { id: Number(result[0].insertId) };
    }),

  // Delete client project
  deleteProject: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(clientComments).where(eq(clientComments.projectId, input.id));
      await db.delete(clientTimeEntries).where(eq(clientTimeEntries.projectId, input.id));
      await db.delete(clientProjectMedia).where(eq(clientProjectMedia.projectId, input.id));
      await db.delete(clientProjects).where(eq(clientProjects.id, input.id));
      return { success: true };
    }),

  // Update client project
  updateProject: adminQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1),
        description: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(clientProjects).set(data).where(eq(clientProjects.id, id));
      return { success: true };
    }),

  // Add media to client project
  addProjectMedia: adminQuery
    .input(
      z.object({
        projectId: z.number(),
        url: z.string().min(1),
        type: z.enum(["image", "video"]),
        visible: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(clientProjectMedia).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Delete project media
  deleteProjectMedia: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(clientProjectMedia).where(eq(clientProjectMedia.id, input.id));
      return { success: true };
    }),

  // Toggle media visibility
  toggleMediaVisibility: adminQuery
    .input(z.object({ id: z.number(), visible: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(clientProjectMedia)
        .set({ visible: input.visible })
        .where(eq(clientProjectMedia.id, input.id));
      return { success: true };
    }),

  // Create project comment
  createComment: adminQuery
    .input(
      z.object({
        projectId: z.number(),
        content: z.string().min(1),
        visible: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(clientComments).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Delete project comment
  deleteComment: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(clientComments).where(eq(clientComments.id, input.id));
      return { success: true };
    }),

  // Toggle comment visibility
  toggleCommentVisibility: adminQuery
    .input(z.object({ id: z.number(), visible: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(clientComments)
        .set({ visible: input.visible })
        .where(eq(clientComments.id, input.id));
      return { success: true };
    }),

  // Create time entry
  createTimeEntry: adminQuery
    .input(
      z.object({
        projectId: z.number(),
        description: z.string().min(1),
        hours: z.number().positive(),
        date: z.string().optional(),
        visible: z.boolean().default(false),
        billable: z.boolean().default(true),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const entryDate = input.date ? new Date(input.date) : new Date();
      const result = await db.insert(clientTimeEntries).values({
        projectId: input.projectId,
        description: input.description,
        hours: input.hours,
        date: entryDate,
        visible: input.visible,
        billable: input.billable,
        notes: input.notes || null,
      });
      return { id: Number(result[0].insertId) };
    }),

  // Delete time entry
  deleteTimeEntry: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(clientTimeEntries).where(eq(clientTimeEntries.id, input.id));
      return { success: true };
    }),

  // Toggle time entry visibility
  toggleTimeVisibility: adminQuery
    .input(z.object({ id: z.number(), visible: z.boolean() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(clientTimeEntries)
        .set({ visible: input.visible })
        .where(eq(clientTimeEntries.id, input.id));
      return { success: true };
    }),

  // Publish a client project or asset to public Portfolio
  publishToPortfolio: adminQuery
    .input(
      z.object({
        name: z.string().min(1).max(255),
        category: z.enum(["Residential", "Commercial"]),
        subcategory: z.enum(["Interiors", "Exteriors"]),
        image: z.string().min(1).max(500),
        aspect: z.enum(["16:9", "3:4", "4:5"]).default("16:9"),
        assets: z.array(z.string()).default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();

      // Create new portfolio project
      const result = await db.insert(portfolioProjects).values({
        name: input.name,
        category: input.category,
        subcategory: input.subcategory,
        image: input.image,
        aspect: input.aspect,
        order: 0,
        featured: false,
      });
      const newProjectId = Number(result[0].insertId);

      // Insert assets
      const mediaAssets = input.assets.length > 0 ? input.assets : [input.image];
      await db.insert(projectAssets).values(
        mediaAssets.map((url, index) => ({
          projectId: newProjectId,
          url,
          type: "image" as const,
          order: index,
        }))
      );

      return { portfolioId: newProjectId };
    }),
});
