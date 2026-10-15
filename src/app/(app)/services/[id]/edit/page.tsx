import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import ServiceForm from "@/app/(app)/services/_components/ServiceForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;
  const service = await prisma.service.findUnique({ where: { id } });

  if (!service) notFound();

  return <ServiceForm service={service} />;
}
