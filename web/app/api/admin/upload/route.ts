import { adminGuard } from "@/lib/adminGuard";
import { uploadToR2 } from "@/lib/r2";

// POST /api/admin/upload?folder=menu|animals|sessions  (multipart: file)
export async function POST(req: Request) {
  const gate = await adminGuard(req);
  if ("error" in gate) return gate.error;
  const folder = new URL(req.url).searchParams.get("folder") as
    | "menu"
    | "animals"
    | "sessions"
    | null;
  if (!folder || !["menu", "animals", "sessions"].includes(folder))
    return Response.json({ error: "Invalid folder." }, { status: 400 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) throw new Error("No file attached.");
    const result = await uploadToR2(folder, file);
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Upload failed." },
      { status: 400 }
    );
  }
}
