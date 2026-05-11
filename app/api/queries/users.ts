import { eq, and, gt } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser } from "@db/schema";
import { getDb } from "./connection";

export async function findUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, email))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function createUser(data: InsertUser) {
  const result = await getDb().insert(schema.users).values(data);
  return Number(result[0].insertId);
}

export async function updateUserLastSignIn(id: number) {
  await getDb()
    .update(schema.users)
    .set({ lastSignInAt: new Date() })
    .where(eq(schema.users.id, id));
}

export async function updateUserPassword(id: number, passwordHash: string) {
  await getDb()
    .update(schema.users)
    .set({ passwordHash })
    .where(eq(schema.users.id, id));
}

export async function getUserRoles(userId: number) {
  return getDb()
    .select()
    .from(schema.userRoles)
    .where(eq(schema.userRoles.userId, userId));
}

export async function addUserRole(
  userId: number,
  role: string,
  scope?: string,
  projectId?: number,
) {
  await getDb().insert(schema.userRoles).values({
    userId,
    role,
    scope: scope ?? "global",
    projectId: projectId ?? null,
  });
}

export async function removeUserRole(userId: number, role: string) {
  await getDb()
    .delete(schema.userRoles)
    .where(
      and(
        eq(schema.userRoles.userId, userId),
        eq(schema.userRoles.role, role),
      ),
    );
}

export async function createTwoFactorCode(
  email: string,
  code: string,
  expiresAt: Date,
) {
  await getDb().insert(schema.twoFactorCodes).values({
    email,
    code,
    expiresAt,
    used: false,
  });
}

export async function findValidCode(email: string, code: string) {
  const rows = await getDb()
    .select()
    .from(schema.twoFactorCodes)
    .where(
      and(
        eq(schema.twoFactorCodes.email, email),
        eq(schema.twoFactorCodes.code, code),
        eq(schema.twoFactorCodes.used, false),
        gt(schema.twoFactorCodes.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return rows.at(0);
}

export async function markCodeUsed(id: number) {
  await getDb()
    .update(schema.twoFactorCodes)
    .set({ used: true })
    .where(eq(schema.twoFactorCodes.id, id));
}

export async function getUserWithRoles(userId: number) {
  const user = await findUserById(userId);
  if (!user) return null;
  const roles = await getUserRoles(userId);
  return { ...user, roles };
}
