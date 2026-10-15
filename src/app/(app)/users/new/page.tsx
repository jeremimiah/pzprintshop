import { verifySession } from "@/lib/dal";
import UserForm from "@/app/(app)/users/_components/UserForm";

export const dynamic = "force-dynamic";

export default async function NewUserPage() {
  await verifySession();
  return <UserForm />;
}
