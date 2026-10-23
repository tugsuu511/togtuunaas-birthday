import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

export async function getDb() {
  if (process.env.VERCEL === "1") {
    const { getVercelDb } = await import("./vercel");
    return getVercelDb();
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured. Add the Neon connection string to the deployment environment before using RSVP endpoints."
    );
  }

  return drizzle({ client: neon(databaseUrl), schema });
}
