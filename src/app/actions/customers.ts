"use server";

import { prisma } from "@/lib/prisma";
import { CustomerSchema } from "@/lib/validators";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

export type CustomerState = {
  errors?: {
    name?: string[];
    phone?: string[];
    email?: string[];
    address?: string[];
    notes?: string[];
  };
  message?: string;
};

export async function createCustomer(state: CustomerState, formData: FormData): Promise<CustomerState> {
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    address: formData.get("address") || null,
    notes: formData.get("notes") || null,
  };

  const validated = CustomerSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.customer.create({ data: validated.data });
  refresh();
  redirect("/customers");
}

export async function updateCustomer(state: CustomerState, formData: FormData): Promise<CustomerState> {
  const id = formData.get("id") as string;
  const raw = {
    name: formData.get("name"),
    phone: formData.get("phone") || null,
    email: formData.get("email") || null,
    address: formData.get("address") || null,
    notes: formData.get("notes") || null,
  };

  const validated = CustomerSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.customer.update({ where: { id }, data: validated.data });
  refresh();
  redirect("/customers");
}

export async function deleteCustomer(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.customer.delete({ where: { id } });
  refresh();
  redirect("/customers");
}
