import { verifySession } from "@/lib/dal";
import ServiceForm from "@/app/(app)/services/_components/ServiceForm";

export const dynamic = "force-dynamic";

export default async function NewServicePage() {
  await verifySession();
  return <ServiceForm />;
}
