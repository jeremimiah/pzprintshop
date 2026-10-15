import { verifySession } from "@/lib/dal";
import InventoryItemForm from "../_components/InventoryItemForm";

export const dynamic = "force-dynamic";

export default async function NewInventoryItemPage() {
  await verifySession();
  return <InventoryItemForm />;
}
