import { defineConfig } from "drizzle-kit";

// drizzle-kit работает с машины/CI и ходит в Supabase НАПРЯМУЮ по session pooler,
// в обход Hyperdrive. DATABASE_URL берётся из .env (см. .env.example).
export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
