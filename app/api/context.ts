import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import * as cookie from "cookie";
import { Session } from "@contracts/constants";
import { verifySessionToken } from "./kimi/session";
import { getUserRoles } from "./queries/users";

export type TrpcContext = {
  req: Request;
  resHeaders: Headers;
  userId?: number;
  roles?: { role: string; scope: string; projectId: number | null }[];
};

export async function createContext(
  opts: FetchCreateContextFnOptions,
): Promise<TrpcContext> {
  const ctx: TrpcContext = { req: opts.req, resHeaders: opts.resHeaders };
  try {
    const cookies = cookie.parse(opts.req.headers.get("cookie") || "");
    const token = cookies[Session.cookieName];
    if (!token) return ctx;

    const claim = await verifySessionToken(token);
    if (!claim) return ctx;

    ctx.userId = claim.userId;
    ctx.roles = await getUserRoles(claim.userId);
  } catch {
    // Authentication is optional here
  }
  return ctx;
}
