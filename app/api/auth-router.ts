import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery, superadminQuery } from "./middleware";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserLastSignIn,
  updateUserPassword,
  getUserWithRoles,
  getUserRoles,
  addUserRole,
} from "./queries/users";
import { getDb } from "./queries/connection";
import { users } from "@db/schema";
import * as schema from "@db/schema";
import { eq, desc, and } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./lib/auth";
import { signSessionToken } from "./kimi/session";
import { getSessionCookieOptions, setCookieHeader } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";


const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const registerInput = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(["admin", "client"]).default("client"),
});

const resetPasswordInput = z.object({
  userId: z.number(),
});

export const authRouter = createRouter({
  login: publicQuery
    .input(loginInput)
    .mutation(async ({ input, ctx }) => {
      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciales inválidas",
        });
      }
      if (!user.isActive) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Cuenta desactivada",
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Credenciales inválidas",
        });
      }

      await updateUserLastSignIn(user.id);

      const token = await signSessionToken({ userId: user.id });

      const cookieOpts = getSessionCookieOptions(ctx.req.headers);
      setCookieHeader(ctx.resHeaders, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      const userWithRoles = await getUserWithRoles(user.id);
      return { user: userWithRoles };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    setCookieHeader(ctx.resHeaders, Session.cookieName, "", {
      httpOnly: true,
      secure: env.isProduction,
      sameSite: "Lax",
      maxAge: 0,
      path: "/",
    });
    return { success: true };
  }),

  me: publicQuery.query(async ({ ctx }) => {
    if (!ctx.userId) return { user: null };
    const user = await getUserWithRoles(ctx.userId);
    return { user };
  }),

  register: superadminQuery
    .input(registerInput)
    .mutation(async ({ input }) => {
      const existing = await findUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "El email ya está registrado",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const userId = await createUser({
        email: input.email,
        name: input.name || input.email.split("@")[0],
        passwordHash,
        isActive: true,
      });

      await addUserRole(userId, input.role, "global");

      return { userId };
    }),

  resetPassword: superadminQuery
    .input(resetPasswordInput)
    .mutation(async ({ input }) => {
      const user = await findUserById(input.userId);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuario no encontrado",
        });
      }

      const tempPassword = Math.random().toString(36).substring(2, 10);
      const passwordHash = await hashPassword(tempPassword);
      await updateUserPassword(input.userId, passwordHash);

      return { tempPassword };
    }),

  listUsers: superadminQuery.query(async () => {
    const allUsers = await getDb()
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    const result = [];
    for (const u of allUsers) {
      const roles = await getUserRoles(u.id);
      result.push({
        ...u,
        roles: roles.map((r) => ({ role: r.role, scope: r.scope, projectId: r.projectId })),
      });
    }
    return result;
  }),

  updateUser: superadminQuery
    .input(
      z.object({
        id: z.number(),
        isActive: z.boolean().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await getDb()
        .update(users)
        .set(data)
        .where(eq(users.id, id));
      return { success: true };
    }),

  // ── Client Management ──────────────────────────────────────

  listClients: adminQuery.query(async () => {
    const db = getDb();
    const allUsers = await db
      .select()
      .from(users)
      .orderBy(desc(users.createdAt));

    const result = [];
    for (const u of allUsers) {
      const roles = await getUserRoles(u.id);
      const isClient = roles.some((r) => r.role === "client");
      if (!isClient) continue;

      const clientRoles = roles.filter((r) => r.role === "client");
      const projectRoles = clientRoles.filter((r) => r.scope === "project" && r.projectId);
      const uploads = await db
        .select()
        .from(schema.clientUploads)
        .where(eq(schema.clientUploads.userId, u.id));

      result.push({
        ...u,
        roles: roles.map((r) => ({ role: r.role, scope: r.scope, projectId: r.projectId })),
        assignedProjects: projectRoles.map((r) => r.projectId),
        uploadCount: uploads.length,
      });
    }
    return result;
  }),

  assignProject: superadminQuery
    .input(
      z.object({
        userId: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      await addUserRole(input.userId, "client", "project", input.projectId);
      return { success: true };
    }),

  removeProject: superadminQuery
    .input(
      z.object({
        userId: z.number(),
        projectId: z.number(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .delete(schema.userRoles)
        .where(
          and(
            eq(schema.userRoles.userId, input.userId),
            eq(schema.userRoles.role, "client"),
            eq(schema.userRoles.scope, "project"),
            eq(schema.userRoles.projectId, input.projectId),
          ),
        );
      return { success: true };
    }),

  getClientUploads: adminQuery
    .input(z.object({ userId: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      return db
        .select()
        .from(schema.clientUploads)
        .where(eq(schema.clientUploads.userId, input.userId))
        .orderBy(desc(schema.clientUploads.createdAt));
    }),
});
