import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import CustomerForm from "@/app/(app)/customers/_components/CustomerForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;
  const customer = await prisma.customer.findUnique({ where: { id } });
  if (!customer) notFound();
  return <CustomerForm customer={customer} />;
}
