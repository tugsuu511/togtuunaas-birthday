import { env } from "cloudflare:workers";

export const runtime = "edge";
const PHOTO_KEY = "invitation/togtuun-hero";
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

function bucket() {
  if (!env.BUCKET) throw new Error("R2 binding `BUCKET` is unavailable.");
  return env.BUCKET;
}

export async function HEAD() {
  try {
    const object = await bucket().head(PHOTO_KEY);
    return object ? new Response(null, { status: 200 }) : new Response(null, { status: 404 });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export async function GET() {
  try {
    const object = await bucket().get(PHOTO_KEY);
    if (!object) return new Response(null, { status: 404 });
    return new Response(object.body, { headers: { "Content-Type": object.httpMetadata?.contentType || "image/jpeg", "Cache-Control": "public, max-age=300", ETag: object.httpEtag } });
  } catch {
    return new Response(null, { status: 404 });
  }
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const photo = form.get("photo");
    if (!(photo instanceof File)) return Response.json({ error: "photo_required" }, { status: 400 });
    if (!ALLOWED_TYPES.has(photo.type)) return Response.json({ error: "unsupported_type" }, { status: 415 });
    if (photo.size > 8 * 1024 * 1024) return Response.json({ error: "photo_too_large" }, { status: 413 });
    await bucket().put(PHOTO_KEY, photo.stream(), { httpMetadata: { contentType: photo.type }, customMetadata: { uploadedAt: new Date().toISOString(), originalName: photo.name.slice(0, 100) } });
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Photo upload failed", error);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
