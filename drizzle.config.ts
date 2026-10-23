import { defineConfig } from "drizzle-kit";
import { loadEnv } from "vite";

const localEnv = loadEnv("production", process.cwd(), "");

export default defineConfig({
  out: "./drizzle/neon",
  schema: "./db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL_UNPOOLED ??
      localEnv.DATABASE_URL_UNPOOLED ??
      process.env.DATABASE_URL ??
      localEnv.DATABASE_URL ??
      "postgresql://localhost:5432/togtuunaas_birthday",
  },
});
