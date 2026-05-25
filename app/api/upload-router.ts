import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createRouter, authedQuery, superadminQuery } from "./middleware";
import {
  createUpload,
  getUploadsByUser,
  getAllUploads,
  updateUploadStatus,
  setUploadPublic,
  setUploadRequestedPublic,
} from "./queries/uploads";

export const uploadRouter = createRouter({
  // Public/Authed: Get Presigned Upload URL for Cloudflare R2 direct uploads
  getPresignedUrl: authedQuery
    .input(
      z.object({
        filename: z.string().min(1),
        fileType: z.string().min(1),
        isVideo: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const { isR2Configured, getUploadPresignedUrl, getR2PublicUrl } = await import("./lib/r2");
      
      if (!isR2Configured()) {
        return {
          uploadUrl: "",
          publicUrl: "",
          key: "",
          useFallback: true,
        };
      }

      const ext = input.filename.split(".").pop() || "bin";
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 10);
      const subDir = input.isVideo ? "videos" : "images";
      const key = `uploads/${subDir}/${timestamp}-${random}.${ext}`;

      try {
        const uploadUrl = await getUploadPresignedUrl(key, input.fileType);
        const publicUrl = getR2PublicUrl(key);
        return {
          uploadUrl,
          publicUrl,
          key,
          useFallback: false,
        };
      } catch (err) {
        console.error("Failed to generate presigned R2 URL:", err);
        return {
          uploadUrl: "",
          publicUrl: "",
          key: "",
          useFallback: true,
        };
      }
    }),

  // Client: create upload
  create: authedQuery
    .input(
      z.object({
        projectId: z.number(),
        filename: z.string().min(1),
        url: z.string().min(1),
        type: z.enum(["image", "document", "video"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const id = await createUpload({
        userId: ctx.userId!,
        projectId: input.projectId,
        filename: input.filename,
        url: input.url,
        type: input.type,
        status: "pending",
        isPublic: false,
        requestedPublic: false,
      });
      return { id };
    }),

  // Client: list my uploads
  myUploads: authedQuery.query(async ({ ctx }) => {
    return getUploadsByUser(ctx.userId!);
  }),

  // Superadmin: list all uploads
  list: superadminQuery.query(async () => {
    return getAllUploads();
  }),

  // Superadmin: approve/reject upload
  approve: superadminQuery
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        isPublic: z.boolean().optional(),
        rejectionReason: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await updateUploadStatus(
        input.id,
        input.status,
        ctx.userId!,
        input.rejectionReason,
      );
      if (input.isPublic !== undefined && input.status === "approved") {
        await setUploadPublic(input.id, input.isPublic);
      }
      return { success: true };
    }),

  // Superadmin: set public status directly
  setPublic: superadminQuery
    .input(z.object({ id: z.number(), isPublic: z.boolean() }))
    .mutation(async ({ input }) => {
      await setUploadPublic(input.id, input.isPublic);
      return { success: true };
    }),

  // Client: request public status
  requestPublic: authedQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const uploads = await getUploadsByUser(ctx.userId!);
      const upload = uploads.find((u) => u.id === input.id);
      if (!upload) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Upload no encontrado",
        });
      }
      if (upload.status !== "approved") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Solo uploads aprobados pueden solicitar ser públicos",
        });
      }
      await setUploadRequestedPublic(input.id, true);
      return { success: true };
    }),
});
