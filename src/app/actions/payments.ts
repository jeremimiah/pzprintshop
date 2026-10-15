"use server";

import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { PaymentSchema } from "@/lib/validators";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";

export type PaymentState = {
  errors?: {
    orderId?: string[];
    amount?: string[];
    method?: string[];
    type?: string[];
  };
  message?: string;
};

export async function recordPayment(state: PaymentState, formData: FormData): Promise<PaymentState> {
  const user = await requireUser();

  const raw = {
    orderId: formData.get("orderId") as string,
    amount: formData.get("amount") ? Math.round(parseFloat(formData.get("amount") as string) * 100) : null,
    method: formData.get("method") as string,
    type: formData.get("type") as string,
    receiptNo: (formData.get("receiptNo") as string) || undefined,
    note: (formData.get("note") as string) || undefined,
  };

  const validated = PaymentSchema.safeParse(raw);
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const order = await prisma.order.findUnique({ where: { id: raw.orderId } });
  if (!order) {
    return { message: "Order not found." };
  }

  if (raw.amount! > order.balance) {
    return { errors: { amount: ["Amount exceeds outstanding balance."] } };
  }

  const newPaidAmount = order.paidAmount + raw.amount!;
  const newBalance = order.totalAmount - newPaidAmount;

  await prisma.$transaction([
    prisma.payment.create({
      data: {
        orderId: raw.orderId!,
        amount: raw.amount!,
        method: validated.data.method,
        type: validated.data.type,
        receiptNo: validated.data.receiptNo,
        note: validated.data.note,
        recordedById: user.id,
      },
    }),
    prisma.order.update({
      where: { id: raw.orderId },
      data: { paidAmount: newPaidAmount, balance: newBalance },
    }),
  ]);

  refresh();
  redirect(`/orders/${raw.orderId}`);
}

export async function deletePayment(formData: FormData) {
  await requireUser();
  const paymentId = formData.get("paymentId") as string;
  const orderId = formData.get("orderId") as string;

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) return;

  await prisma.$transaction([
    prisma.payment.delete({ where: { id: paymentId } }),
    prisma.order.update({
      where: { id: orderId },
      data: {
        paidAmount: order.paidAmount - payment.amount,
        balance: order.balance + payment.amount,
      },
    }),
  ]);

  refresh();
  redirect(`/orders/${orderId}`);
}
