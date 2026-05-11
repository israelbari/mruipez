import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery, superadminQuery } from "./middleware";
import {
  findUserByEmail,
  findUserById,
  createUser,
  updateUserLastSignIn,
  updateUserPassword,
  getUserWithRoles,
  getUserRoles,
  createTwoFactorCode,
  findValidCode,
  markCodeUsed,
  addUserRole,
} from "./queries/users";
import { getDb } from "./queries/connection";
import { users, userRoles } from "@db/schema";
import { eq, desc } from "drizzle-orm";
import { hashPassword, verifyPassword, generateTwoFactorCode } from "./lib/auth";
import { signSessionToken } from "./kimi/session";
import { getSessionCookieOptions, setCookieHeader } from "./lib/cookies";
import { Session } from "@contracts/constants";
import { env } from "./lib/env";

const loginInput = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const verify2FAInput = z.object({
  email: z.string().email(),
  code: z.string().length(6),
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
    .mutation(async ({ input }) => {
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

      // Generate and store 2FA code
      const code = generateTwoFactorCode();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      await createTwoFactorCode(input.email, code, expiresAt);

      // Log code for mock email (replace with real SMTP later)
      console.log(`[2FA] Código para ${input.email}: ${code}`);

      return { step: "2fa", email: input.email };
    }),

  verify2FA: publicQuery
    .input(verify2FAInput)
    .mutation(async ({ input, ctx }) => {
      const record = await findValidCode(input.email, input.code);
      if (!record) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Código inválido o expirado",
        });
      }

      await markCodeUsed(record.id);

      const user = await findUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Usuario no encontrado",
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
});
