"use server";

import { prisma } from "@/lib/prisma";
import { ServiceSchema } from "@/lib/validators";
import { requireRole } from "@/lib/auth";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

export type ServiceState = {
  errors?: {
    name?: string[];
    slug?: string[];
    price?: string[];
    unit?: string[];
    fieldTemplate?: string[];
  };
  message?: string;
};

export async function createService(state: ServiceState, formData: FormData): Promise<ServiceState> {
  await requireRole(["OWNER", "ADMIN"]);

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    pricingType: formData.get("pricingType"),
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    unit: formData.get("unit"),
    turnaroundDays: formData.get("turnaroundDays") ? Number(formData.get("turnaroundDays")) : undefined,
    fieldTemplate: formData.get("fieldTemplate") ? JSON.parse(formData.get("fieldTemplate") as string) : undefined,
    active: formData.get("active") === "on",
  };

  const validated = ServiceSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  const existing = await prisma.service.findUnique({ where: { slug: data.slug } });
  if (existing) {
    return { errors: { slug: ["Slug already exists."] } };
  }

  await prisma.service.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      pricingType: data.pricingType,
      price: data.price ?? null,
      unit: data.unit,
      turnaroundDays: data.turnaroundDays ?? null,
      fieldTemplate: data.fieldTemplate ? JSON.stringify(data.fieldTemplate) : null,
      active: data.active,
    },
  });

  refresh();
  redirect("/services");
}

export async function updateService(state: ServiceState, formData: FormData): Promise<ServiceState> {
  await requireRole(["OWNER", "ADMIN"]);

  const id = formData.get("id") as string;
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") || undefined,
    pricingType: formData.get("pricingType"),
    price: formData.get("price") ? Number(formData.get("price")) : undefined,
    unit: formData.get("unit"),
    turnaroundDays: formData.get("turnaroundDays") ? Number(formData.get("turnaroundDays")) : undefined,
    fieldTemplate: formData.get("fieldTemplate") ? JSON.parse(formData.get("fieldTemplate") as string) : undefined,
    active: formData.get("active") === "on",
  };

  const validated = ServiceSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const data = validated.data;

  const existing = await prisma.service.findUnique({ where: { slug: data.slug } });
  if (existing && existing.id !== id) {
    return { errors: { slug: ["Slug already exists."] } };
  }

  await prisma.service.update({
    where: { id },
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      pricingType: data.pricingType,
      price: data.price ?? null,
      unit: data.unit,
      turnaroundDays: data.turnaroundDays ?? null,
      fieldTemplate: data.fieldTemplate ? JSON.stringify(data.fieldTemplate) : null,
      active: data.active,
    },
  });

  refresh();
  redirect("/services");
}

export async function deleteService(formData: FormData) {
  await requireRole(["OWNER", "ADMIN"]);
  const id = formData.get("id") as string;
  await prisma.service.delete({ where: { id } });
  refresh();
  redirect("/services");
}
