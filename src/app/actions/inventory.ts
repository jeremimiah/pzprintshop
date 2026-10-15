"use server";

import { prisma } from "@/lib/prisma";
import { requireUser, requireRole } from "@/lib/auth";
import { InventoryItemSchema, InventoryMovementSchema } from "@/lib/validators";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

export type InventoryState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createInventoryItem(state: InventoryState, formData: FormData): Promise<InventoryState> {
  await requireRole(["OWNER", "ADMIN"]);

  const raw = {
    name: formData.get("name") ?? undefined,
    category: formData.get("category") ?? undefined,
    unit: formData.get("unit") ?? undefined,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : 0,
    minStock: formData.get("minStock") ? parseInt(formData.get("minStock") as string) : null,
    notes: formData.get("notes") ?? undefined,
  };

  const validated = InventoryItemSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.inventoryItem.create({ data: validated.data });
  refresh();
  redirect("/inventory");
}

export async function updateInventoryItem(state: InventoryState, formData: FormData): Promise<InventoryState> {
  await requireRole(["OWNER", "ADMIN"]);

  const id = formData.get("id") as string;
  const raw = {
    name: formData.get("name") ?? undefined,
    category: formData.get("category") ?? undefined,
    unit: formData.get("unit") ?? undefined,
    stock: formData.get("stock") ? parseInt(formData.get("stock") as string) : 0,
    minStock: formData.get("minStock") ? parseInt(formData.get("minStock") as string) : null,
    notes: formData.get("notes") ?? undefined,
  };

  const validated = InventoryItemSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  await prisma.inventoryItem.update({ where: { id }, data: validated.data });
  refresh();
  redirect("/inventory");
}

export async function deleteInventoryItem(formData: FormData) {
  await requireRole(["OWNER", "ADMIN"]);
  const id = formData.get("id") as string;
  await prisma.inventoryItem.delete({ where: { id } });
  refresh();
  redirect("/inventory");
}

export async function createInventoryMovement(state: InventoryState, formData: FormData): Promise<InventoryState> {
  const user = await requireUser();

  const raw = {
    itemId: formData.get("itemId") as string | undefined,
    type: formData.get("type") as string | undefined,
    quantity: formData.get("quantity") ? parseInt(formData.get("quantity") as string) : null,
    note: (formData.get("note") as string) || undefined,
  };

  const validated = InventoryMovementSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id: raw.itemId } });
  if (!item) {
    return { message: "Item not found." };
  }

  let newStock = item.stock;
  if (raw.type === "IN") newStock += raw.quantity!;
  else if (raw.type === "OUT") newStock -= raw.quantity!;
  else newStock = raw.quantity!;

  if (newStock < 0) {
    return { message: "Stock cannot go below zero." };
  }

  await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id: raw.itemId }, data: { stock: newStock } }),
    prisma.inventoryMovement.create({
      data: {
        itemId: raw.itemId!,
        type: validated.data.type,
        quantity: raw.quantity!,
        note: validated.data.note,
        createdById: user.id,
      },
    }),
  ]);

  refresh();
  redirect("/inventory");
}
