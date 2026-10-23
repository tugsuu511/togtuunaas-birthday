import { desc } from "drizzle-orm";
import { getDb } from "@/db";
import { rsvps } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const db = await getDb();
    const responses = await db.select().from(rsvps).orderBy(desc(rsvps.createdAt));
    return Response.json({ responses }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Could not load RSVP responses", error);
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
