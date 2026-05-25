import { z } from "zod";
import { eq, asc } from "drizzle-orm";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { projects, projectAssets } from "@db/schema";

export const projectRouter = createRouter({
  // Public: list all projects with assets
  list: publicQuery.query(async () => {
    const db = getDb();
    const projectList = await db.select().from(projects).orderBy(asc(projects.order));
    const assetList = await db.select().from(projectAssets).orderBy(asc(projectAssets.order));
    return projectList.map((p) => ({
      ...p,
      assets: assetList.filter((a) => a.projectId === p.id),
    }));
  }),

  // Public: list featured projects with assets
  featured: publicQuery.query(async () => {
    const db = getDb();
    const projectList = await db
      .select()
      .from(projects)
      .where(eq(projects.featured, true))
      .orderBy(asc(projects.order));
    const assetList = await db.select().from(projectAssets).orderBy(asc(projectAssets.order));
    return projectList.map((p) => ({
      ...p,
      assets: assetList.filter((a) => a.projectId === p.id),
    }));
  }),

  // Public: get single project with assets
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const result = await db
        .select()
        .from(projects)
        .where(eq(projects.id, input.id))
        .limit(1);
      const p = result[0] ?? null;
      if (!p) return null;
      const assets = await db
        .select()
        .from(projectAssets)
        .where(eq(projectAssets.projectId, p.id))
        .orderBy(asc(projectAssets.order));
      return { ...p, assets };
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
        assets: z
          .array(
            z.object({
              url: z.string().min(1),
              type: z.enum(["image", "video"]),
              order: z.number().default(0),
            })
          )
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { assets, ...projectData } = input;
      const result = await db.insert(projects).values({
        ...projectData,
        video: projectData.video || null,
      });
      const projectId = Number(result[0].insertId);

      // Insert assets
      if (assets.length > 0) {
        await db.insert(projectAssets).values(
          assets.map((a) => ({ ...a, projectId }))
        );
      } else {
        // Default: create asset from cover image
        await db.insert(projectAssets).values({
          projectId,
          url: projectData.image,
          type: "image",
          order: 0,
        });
        if (projectData.video) {
          await db.insert(projectAssets).values({
            projectId,
            url: projectData.video,
            type: "video",
            order: 1,
          });
        }
      }

      return { id: projectId };
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
        assets: z
          .array(
            z.object({
              url: z.string().min(1),
              type: z.enum(["image", "video"]),
              order: z.number().default(0),
            })
          )
          .default([]),
      })
    )
    .mutation(async ({ input }) => {
      const { id, assets, ...data } = input;
      const db = getDb();
      await db
        .update(projects)
        .set({
          ...data,
          video: data.video || null,
        })
        .where(eq(projects.id, id));

      // Sync assets: delete existing and insert new
      await db.delete(projectAssets).where(eq(projectAssets.projectId, id));
      if (assets.length > 0) {
        await db.insert(projectAssets).values(
          assets.map((a) => ({ ...a, projectId: id }))
        );
      } else {
        // Default: create asset from cover image
        await db.insert(projectAssets).values({
          projectId: id,
          url: data.image,
          type: "image",
          order: 0,
        });
        if (data.video) {
          await db.insert(projectAssets).values({
            projectId: id,
            url: data.video,
            type: "video",
            order: 1,
          });
        }
      }

      return { success: true };
    }),

  // Admin: delete project (and its assets)
  delete: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projectAssets).where(eq(projectAssets.projectId, input.id));
      await db.delete(projects).where(eq(projects.id, input.id));
      return { success: true };
    }),

  // Admin: add asset to project
  addAsset: adminQuery
    .input(
      z.object({
        projectId: z.number(),
        url: z.string().min(1),
        type: z.enum(["image", "video"]),
        order: z.number().default(0),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(projectAssets).values(input);
      return { id: Number(result[0].insertId) };
    }),

  // Admin: remove asset
  removeAsset: adminQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(projectAssets).where(eq(projectAssets.id, input.id));
      return { success: true };
    }),

  // Admin: update asset order
  reorderAssets: adminQuery
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
          .update(projectAssets)
          .set({ order: item.order })
          .where(eq(projectAssets.id, item.id));
      }
      return { success: true };
    }),
});
