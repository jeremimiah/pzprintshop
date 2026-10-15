"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

function generateOrderNo(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `ORD-${year}-${seq}`;
}

export async function createOrder(formData: FormData) {
  const user = await requireUser();

  const customerId = formData.get("customerId") as string;
  const dueDate = formData.get("dueDate") as string | null;
  const notes = formData.get("notes") as string | null;
  const itemsJson = formData.get("items") as string;

  if (!customerId || !itemsJson) {
    return;
  }

  const items = JSON.parse(itemsJson);
  if (!items.length) return;

  // Calculate totals from items
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const service = await prisma.service.findUnique({ where: { id: item.serviceId } });
    if (!service) continue;

    const unitPrice = item.unitPrice ?? service.price ?? 0;
    const subtotal = unitPrice * item.quantity;
    totalAmount += subtotal;

    orderItems.push({
      serviceId: item.serviceId,
      quantity: item.quantity,
      unitPrice,
      subtotal,
      specs: item.specs ? JSON.stringify(item.specs) : null,
      notes: item.notes || null,
    });
  }

  if (!orderItems.length) return;

  let orderNo = generateOrderNo();
  let existing = await prisma.order.findUnique({ where: { orderNo } });
  while (existing) {
    orderNo = generateOrderNo();
    existing = await prisma.order.findUnique({ where: { orderNo } });
  }

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerId,
      dueDate: dueDate ? new Date(dueDate) : null,
      notes,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      createdById: user.id,
      items: {
        create: orderItems,
      },
      statusLogs: {
        create: {
          to: "PENDING_CONFIRMATION",
          changedById: user.id,
        },
      },
    },
  });

  refresh();
  redirect(`/orders/${order.id}`);
}

export async function updateOrderStatus(formData: FormData) {
  const user = await requireUser();
  const orderId = formData.get("orderId") as string;
  const newStatus = formData.get("status") as string;
  const note = formData.get("note") as string | null;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus as any },
    }),
    prisma.orderStatusLog.create({
      data: {
        orderId,
        from: order.status,
        to: newStatus as any,
        changedById: user.id,
        note,
      },
    }),
  ]);

  refresh();
  redirect(`/orders/${orderId}`);
}

export async function deleteOrder(formData: FormData) {
  await requireUser();
  const id = formData.get("id") as string;
  await prisma.order.delete({ where: { id } });
  refresh();
  redirect("/orders");
}
