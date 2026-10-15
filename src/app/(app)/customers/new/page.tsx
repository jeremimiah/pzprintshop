import { verifySession } from "@/lib/dal";
import CustomerForm from "../_components/CustomerForm";

export const dynamic = "force-dynamic";

export default async function NewCustomerPage() {
  await verifySession();
  return <CustomerForm />;
}
