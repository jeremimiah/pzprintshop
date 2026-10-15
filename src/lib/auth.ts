import "server-only";
import { prisma } from "./prisma";
import { decrypt } from "./session";
import { cookies } from "next/headers";
import { User } from "@prisma/client";

export type SessionUser = Pick<User, "id" | "email" | "name" | "role" | "active">;

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  const payload = await decrypt(session);

  if (!payload) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, name: true, role: true, active: true },
    });

    if (!user || !user.active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getSession();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(roles: string[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }
  return user;
}

export function isOwnerOrAdmin(role: string): boolean {
  return role === "OWNER" || role === "ADMIN";
}
