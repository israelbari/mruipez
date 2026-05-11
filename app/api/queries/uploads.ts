import { eq, and, desc } from "drizzle-orm";
import * as schema from "@db/schema";
import { getDb } from "./connection";

export async function createUpload(data: schema.InsertClientUpload) {
  const result = await getDb().insert(schema.clientUploads).values(data);
  return Number(result[0].insertId);
}

export async function getUploadById(id: number) {
  const rows = await getDb()
    .select()
    .from(schema.clientUploads)
    .where(eq(schema.clientUploads.id, id))
    .limit(1);
  return rows.at(0);
}

export async function getUploadsByUser(userId: number) {
  return getDb()
    .select()
    .from(schema.clientUploads)
    .where(eq(schema.clientUploads.userId, userId))
    .orderBy(desc(schema.clientUploads.createdAt));
}

export async function getAllUploads() {
  return getDb()
    .select()
    .from(schema.clientUploads)
    .orderBy(desc(schema.clientUploads.createdAt));
}

export async function updateUploadStatus(
  id: number,
  status: "approved" | "rejected",
  approvedBy: number,
  rejectionReason?: string,
) {
  await getDb()
    .update(schema.clientUploads)
    .set({
      status,
      approvedBy,
      approvedAt: new Date(),
      rejectionReason: rejectionReason || null,
    })
    .where(eq(schema.clientUploads.id, id));
}

export async function setUploadPublic(id: number, isPublic: boolean) {
  await getDb()
    .update(schema.clientUploads)
    .set({ isPublic })
    .where(eq(schema.clientUploads.id, id));
}

export async function setUploadRequestedPublic(id: number, requested: boolean) {
  await getDb()
    .update(schema.clientUploads)
    .set({ requestedPublic: requested })
    .where(eq(schema.clientUploads.id, id));
}
