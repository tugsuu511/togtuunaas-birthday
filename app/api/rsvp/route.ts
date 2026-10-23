import { getDb } from "@/db";
import { rsvps } from "@/db/schema";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const guestName = String(body.guestName || "").trim().slice(0, 80);
    const attendance = body.attendance === "no" ? "no" : "yes";
    const adultCount = attendance === "yes" ? Math.max(0, Math.min(20, Number(body.adults) || 0)) : 0;
    const childCount = attendance === "yes" ? Math.max(0, Math.min(20, Number(body.children) || 0)) : 0;
    const infantCount = attendance === "yes" ? Math.max(0, Math.min(20, Number(body.infants) || 0)) : 0;
    const note = String(body.note || "").trim().slice(0, 280);
    if (!guestName) return Response.json({ error: "guest_name_required" }, { status: 400 });
    if (attendance === "yes" && adultCount + childCount + infantCount < 1) return Response.json({ error: "guest_count_required" }, { status: 400 });

    const id = crypto.randomUUID();
    const db = await getDb();
    await db.insert(rsvps).values({ id, guestName, attendance, adultCount, childCount, infantCount, note, createdAt: Date.now() });
    return Response.json({ ok: true, id });
  } catch (error) {
    console.error("RSVP submission failed", error);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
