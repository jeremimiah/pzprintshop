"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UserSchema = z.object({
  name: z.string().min(1, "Name is required.").trim(),
  email: z.email("Please enter a valid email.").trim(),
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(["OWNER", "ADMIN", "STAFF"]),
  active: z.boolean(),
});

const UserUpdateSchema = UserSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters.").optional(),
});

export type UserState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createUser(state: UserState, formData: FormData): Promise<UserState> {
  await requireRole(["OWNER"]);

  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
    role: formData.get("role") as "OWNER" | "ADMIN" | "STAFF",
    active: formData.get("active") === "on",
  };

  const validated = UserSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: raw.email } });
  if (existing) {
    return { errors: { email: ["Email already in use."] } };
  }

  const passwordHash = await bcrypt.hash(raw.password, 10);

  await prisma.user.create({
    data: { name: raw.name, email: raw.email, passwordHash, role: raw.role, active: raw.active },
  });

  refresh();
  redirect("/users");
}

export async function updateUser(state: UserState, formData: FormData): Promise<UserState> {
  await requireRole(["OWNER"]);

  const id = formData.get("id") as string;
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string | undefined,
    role: formData.get("role") as "OWNER" | "ADMIN" | "STAFF",
    active: formData.get("active") === "on",
  };

  const validated = UserUpdateSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const existing = await prisma.user.findUnique({ where: { email: raw.email } });
  if (existing && existing.id !== id) {
    return { errors: { email: ["Email already in use."] } };
  }

  const data: { name: string; email: string; role: "OWNER" | "ADMIN" | "STAFF"; active: boolean; passwordHash?: string } = {
    name: raw.name,
    email: raw.email,
    role: raw.role,
    active: raw.active,
  };

  if (raw.password) {
    data.passwordHash = await bcrypt.hash(raw.password, 10);
  }

  await prisma.user.update({ where: { id }, data });
  refresh();
  redirect("/users");
}

export async function deleteUser(formData: FormData) {
  await requireRole(["OWNER"]);
  const id = formData.get("id") as string;
  await prisma.user.delete({ where: { id } });
  refresh();
  redirect("/users");
}
