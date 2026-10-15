"use server";

import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { LoginSchema } from "@/lib/validators";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

export type AuthState = {
  errors?: {
    email?: string[];
    password?: string[];
  };
  message?: string;
};

export async function login(state: AuthState, formData: FormData): Promise<AuthState> {
  const validatedFields = LoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { email, password } = validatedFields.data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !user.active) {
    return { message: "Invalid email or password." };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    return { message: "Invalid email or password." };
  }

  await createSession(user.id, user.role);
  redirect("/dashboard");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
