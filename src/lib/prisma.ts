import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = getConnectionString();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getConnectionString() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Add a PostgreSQL connection string to .env.local before starting Next.js.",
    );
  }

  if (databaseUrl.startsWith("prisma+postgres://")) {
    throw new Error(
      "DATABASE_URL uses a prisma+postgres URL, but the app runtime is configured with @prisma/adapter-pg and needs a postgres:// or postgresql:// connection string in .env.local.",
    );
  }

  try {
    const url = new URL(databaseUrl);
    const isSupabaseDirectHost = url.hostname.startsWith("db.") && url.hostname.endsWith(".supabase.co") && url.port === "5432";

    if (isSupabaseDirectHost) {
      console.warn(
        "[prisma] DATABASE_URL points at a Supabase direct connection. That host is IPv6-only unless your project has the IPv4 add-on. If you see 'Can't reach database server', replace it with the Supabase Session pooler connection string in .env.local.",
      );
    }
  } catch {
    throw new Error("DATABASE_URL is not a valid PostgreSQL connection string.");
  }

  return databaseUrl;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: ["query"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
