// Builds a public image URL from an R2 object key. Works client + server.
// Local site images ("/gallery/...") pass straight through.
export function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  if (key.startsWith("http") || key.startsWith("/")) return key;
  const base = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!base) return null;
  return `${base}/${key}`;
}
