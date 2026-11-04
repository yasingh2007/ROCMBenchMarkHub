import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function r2Configured() {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET,
  );
}

function getR2Client() {
  if (!r2Configured()) return null;

  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export function isR2Enabled() {
  return r2Configured();
}

export async function createArtifactUploadUrl(key: string) {
  const client = getR2Client();
  if (!client) {
    return null;
  }

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: key,
    ContentType: "application/octet-stream",
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 600 });
  const publicBase = process.env.R2_PUBLIC_URL;
  const publicUrl = publicBase
    ? `${publicBase.replace(/\/$/, "")}/${key}`
    : key;

  return { uploadUrl, publicUrl, key };
}
