import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import bcrypt from "bcryptjs";

function createClient() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.DATABASE_AUTH_TOKEN;

  if (!url) throw new Error("DATABASE_URL environment variable is not set");

  if (url.startsWith("libsql://") || url.startsWith("https://")) {
    return new PrismaClient({ adapter: new PrismaLibSql({ url, authToken }) });
  }

  return new PrismaClient({ datasourceUrl: url });
}

const prisma = createClient();

async function main() {
  const email = process.env.SEED_OWNER_EMAIL || "owner@pzprintshop.com";
  const password = process.env.SEED_OWNER_PASSWORD || "changeme123";
  const name = process.env.SEED_OWNER_NAME || "Shop Owner";

  const passwordHash = await bcrypt.hash(password, 10);

  const owner = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name, passwordHash, role: "OWNER" },
  });

  console.log(`Seeded OWNER user: ${owner.email}`);

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

  console.log(`Seeded ${services.length} services`);

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
    if (!existing) {
      await prisma.inventoryItem.create({ data: item });
    }
  }

  console.log(`Seeded ${items.length} inventory items`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());