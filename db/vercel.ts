import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

let pool: Pool | undefined;

export function getVercelDb() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not configured. Add the pooled Neon connection string to the Vercel environment before using RSVP endpoints.",
    );
  }

  if (!pool) {
    pool = new Pool({ connectionString, max: 10, idleTimeoutMillis: 5_000 });
    attachDatabasePool(pool);
  }

  return drizzle(pool, { schema });
}
