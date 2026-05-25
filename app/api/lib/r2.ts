import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "./env";

let s3Client: S3Client | null = null;

export function isR2Configured(): boolean {
  return !!(
    env.r2AccessKeyId &&
    env.r2SecretAccessKey &&
    env.r2Endpoint &&
    env.r2BucketName
  );
}

export function getR2Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: "auto",
      endpoint: env.r2Endpoint,
      credentials: {
        accessKeyId: env.r2AccessKeyId,
        secretAccessKey: env.r2SecretAccessKey,
      },
    });
  }
  return s3Client;
}

export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresInSeconds = 900
): Promise<string> {
  const client = getR2Client();
  const command = new PutObjectCommand({
    Bucket: env.r2BucketName,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(client, command, { expiresIn: expiresInSeconds });
}

export function getR2PublicUrl(key: string): string {
  if (env.r2PublicUrl) {
    const base = env.r2PublicUrl.endsWith("/") ? env.r2PublicUrl.slice(0, -1) : env.r2PublicUrl;
    return `${base}/${key}`;
  }
  return `${env.r2Endpoint}/${env.r2BucketName}/${key}`;
}
