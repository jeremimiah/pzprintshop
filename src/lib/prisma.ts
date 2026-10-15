import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

function createClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) {
    throw new Error("DATABASE_URL environment variable is not set");
  }

  // Turso/LibSQL in production (remote URL), local SQLite file in development
  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    const adapter = new PrismaLibSql({ url, authToken });
    return new PrismaClient({ adapter });
  }

  return new PrismaClient({ datasourceUrl: url });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;