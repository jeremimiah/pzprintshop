import { verifySession } from "@/lib/dal";
import OrderForm from "../_components/OrderForm";

export const dynamic = "force-dynamic";

export default async function NewOrderPage() {
  await verifySession();
  return <OrderForm />;
}
