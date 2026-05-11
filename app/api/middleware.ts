import { ErrorMessages } from "@contracts/constants";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { TrpcContext } from "./context";

const t = initTRPC.context<TrpcContext>().create({
  transformer: superjson,
});

export const createRouter = t.router;
export const publicQuery = t.procedure;

const requireAuth = t.middleware(async (opts) => {
  const { ctx, next } = opts;

  if (!ctx.userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: ErrorMessages.unauthenticated,
    });
  }

  return next({ ctx });
});

export const authedQuery = t.procedure.use(requireAuth);

function requireRole(role: string) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.userId || !ctx.roles) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }

    // Superadmin bypass: superadmin has access to everything
    const isSuperadmin = ctx.roles.some((r) => r.role === "superadmin");
    if (isSuperadmin) {
      return next({ ctx });
    }

    const hasRole = ctx.roles.some((r) => r.role === role);
    if (!hasRole) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx });
  });
}

export const adminQuery = authedQuery.use(requireRole("admin"));
export const superadminQuery = authedQuery.use(requireRole("superadmin"));

// Helper to check if user has at least one of the given roles
export function requireAnyRole(...roles: string[]) {
  return t.middleware(async (opts) => {
    const { ctx, next } = opts;

    if (!ctx.userId || !ctx.roles) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: ErrorMessages.unauthenticated,
      });
    }

    const isSuperadmin = ctx.roles.some((r) => r.role === "superadmin");
    if (isSuperadmin) {
      return next({ ctx });
    }

    const hasAny = ctx.roles.some((r) => roles.includes(r.role));
    if (!hasAny) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: ErrorMessages.insufficientRole,
      });
    }

    return next({ ctx });
  });
}
