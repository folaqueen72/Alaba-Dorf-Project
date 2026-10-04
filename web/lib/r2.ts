import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 over the S3 API. Menu, animal and session images live here;
// the database stores only object keys. Without keys configured, uploads
// fail with a clear message instead of crashing.
export function r2Configured(): boolean {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET
  );
}

function client() {
  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function uploadToR2(
  folder: "menu" | "animals" | "sessions",
  file: File
): Promise<{ key: string; url: string }> {
  if (!r2Configured()) throw new Error("File storage is not configured yet.");
  if (!ALLOWED.has(file.type)) throw new Error("Only JPG, PNG or WebP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Max file size is 5 MB.");
  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const key = `${folder}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await client().send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET!,
      Key: key,
      Body: bytes,
      ContentType: file.type,
    })
  );
  const base = (process.env.R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  return { key, url: base ? `${base}/${key}` : key };
}
