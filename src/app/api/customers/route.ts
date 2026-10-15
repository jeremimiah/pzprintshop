import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const customers = await prisma.customer.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
  return Response.json(customers);
}
