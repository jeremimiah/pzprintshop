import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const services = await prisma.service.findMany({
    where: { active: true },
    select: { id: true, name: true, pricingType: true, price: true, unit: true, fieldTemplate: true },
  });
  return Response.json(services);
}
