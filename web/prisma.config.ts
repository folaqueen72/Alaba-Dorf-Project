import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL ?? process.env.NETLIFY_DATABASE_URL ?? "";
if (!databaseUrl) {
  throw new Error(
    "Set DATABASE_URL (local) or NETLIFY_DATABASE_URL (Netlify DB)."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
