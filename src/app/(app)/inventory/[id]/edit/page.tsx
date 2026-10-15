import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import InventoryItemForm from "@/app/(app)/inventory/_components/InventoryItemForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditInventoryItemPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;
  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) notFound();
  return <InventoryItemForm item={item} />;
}
