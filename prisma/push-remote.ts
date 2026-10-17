/**
 * Push the Prisma schema to a remote Turso database, then seed it.
 *
 * Usage:
 *   DATABASE_URL="libsql://your-db.turso.io" DATABASE_AUTH_TOKEN="eyJ..." npx tsx prisma/push-remote.ts
 */
import { createClient } from "@libsql/client";
import { execSync } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

type RemoteConfig = { url: string; authToken: string | undefined };

function getConfig(): RemoteConfig {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) throw new Error("DATABASE_URL is required");
  if (!url.startsWith("libsql://") && !url.startsWith("https://")) {
    throw new Error(`DATABASE_URL must be a Turso URL (libsql://...), got: ${url}`);
  }

  return { url, authToken };
}

async function pushSchema() {
  const { url, authToken } = getConfig();

  console.log("Generating SQL from Prisma schema...");
  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf8" }
  );

  writeFileSync("./schema-push.sql", sql);
  console.log("Wrote schema-push.sql");

  const client = createClient({ url, authToken });
  console.log("Applying schema to Turso...");

  // Strip all comment lines first, then split on semicolons
  const stripped = sql
    .split("\n")
    .filter((line) => !line.trim().startsWith("--"))
    .join("\n");

  // Make idempotent so the script is safe to re-run
  const idempotent = stripped
    .replace(/CREATE TABLE "(.*?)"/g, 'CREATE TABLE IF NOT EXISTS "$1"')
    .replace(/CREATE (UNIQUE )?INDEX "(.*?)"/g, 'CREATE $1INDEX IF NOT EXISTS "$2"');

  const statements = idempotent
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    await client.execute(stmt);
  }

  console.log(`Applied ${statements.length} statements`);
  client.close();
  unlinkSync("./schema-push.sql");
}

async function seed() {
  const { url, authToken } = getConfig();

  console.log("\nSeeding...");
  const prisma = new PrismaClient({ adapter: new PrismaLibSql({ url, authToken }) });

  const email = process.env.SEED_OWNER_EMAIL || "owner@pzprintshop.com";
  const password = process.env.SEED_OWNER_PASSWORD || "changeme123";
  const name = process.env.SEED_OWNER_NAME || "Shop Owner";

  const passwordHash = await bcrypt.hash(password, 10);
  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "OWNER" },
  });
  console.log(`Owner: ${owner.email}`);

  const services = [
    { name: "Document Printing", slug: "document-printing", pricingType: "FIXED" as const, price: 500, unit: "page", turnaroundDays: 1, description: "Black & white or colored document printing" },
    { name: "Photocopying", slug: "photocopying", pricingType: "FIXED" as const, price: 300, unit: "page", turnaroundDays: 1, description: "Standard photocopy service" },
    { name: "T-Shirt Printing", slug: "tshirt-printing", pricingType: "QUOTATION" as const, unit: "piece", turnaroundDays: 3, description: "Custom T-shirt printing with your design" },
    { name: "Silkscreening", slug: "silkscreening", pricingType: "QUOTATION" as const, unit: "piece", turnaroundDays: 5, description: "Bulk silkscreen printing service" },
    { name: "Sticker Printing", slug: "sticker-printing", pricingType: "QUOTATION" as const, unit: "piece", turnaroundDays: 2, description: "Custom sticker printing" },
  ];

  for (const svc of services) {
    await prisma.service.upsert({
      where: { slug: svc.slug },
      update: {},
      create: { ...svc, active: true },
    });
  }
  console.log(`Services: ${services.length}`);

  const items = [
    { name: "A4 Paper (80gsm)", category: "Paper", unit: "ream", stock: 50, minStock: 10 },
    { name: "Long Bond Paper", category: "Paper", unit: "ream", stock: 30, minStock: 5 },
    { name: "Black Ink Cartridge", category: "Ink", unit: "piece", stock: 8, minStock: 3 },
    { name: "Colored Ink Cartridge", category: "Ink", unit: "piece", stock: 6, minStock: 2 },
    { name: "Blank T-Shirt (Medium)", category: "Apparel", unit: "piece", stock: 100, minStock: 20 },
    { name: "Blank T-Shirt (Large)", category: "Apparel", unit: "piece", stock: 80, minStock: 20 },
  ];

  for (const item of items) {
    const existing = await prisma.inventoryItem.findFirst({ where: { name: item.name } });
    if (!existing) await prisma.inventoryItem.create({ data: item });
  }
  console.log(`Inventory: ${items.length}`);

  await prisma.$disconnect();
  console.log("\nDone!");
}

async function main() {
  await pushSchema();
  await seed();
}

main().catch((e) => {
  console.error("\nFailed:", e.message || e);
  process.exit(1);
});