import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";
import { logActivity } from "@/lib/activity";

export async function GET(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const images = await prisma.galleryImage.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });
  return Response.json({ images });
}

export async function POST(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  try {
    if (!body?.imageKey) throw new Error("Upload a photo first.");
    const count = await prisma.galleryImage.count();
    const image = await prisma.galleryImage.create({
      data: {
        imageKey: body.imageKey,
        caption: body.caption?.trim() || null,
        sortOrder: count,
      },
    });
    await logActivity(prisma, {
      actorId: gate.user.id,
      action: "gallery photo added",
      entity: "gallery_image",
      entityId: image.id,
    });
    return Response.json({ image });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const body = await req.json().catch(() => null);
  try {
    const { id, caption, active, sortOrder, imageKey } = body ?? {};
    if (!id) throw new Error("Missing photo.");
    const image = await prisma.galleryImage.update({
      where: { id },
      data: {
        ...(caption !== undefined ? { caption: caption.trim() || null } : {}),
        ...(active !== undefined ? { active: !!active } : {}),
        ...(sortOrder !== undefined ? { sortOrder: Number(sortOrder) } : {}),
        ...(imageKey ? { imageKey } : {}),
      },
    });
    return Response.json({ image });
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Failed." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  const gate = await adminGuard(req, ["STUDIO"]);
  if ("error" in gate) return gate.error;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return Response.json({ error: "Missing photo." }, { status: 400 });
  await prisma.galleryImage.delete({ where: { id } });
  await logActivity(prisma, {
    actorId: gate.user.id,
    action: "gallery photo removed",
    entity: "gallery_image",
    entityId: id,
  });
  return Response.json({ ok: true });
}
