import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import UserForm from "@/app/(app)/users/_components/UserForm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();
  return <UserForm user={user} />;
}
