import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDateTime } from "@/lib/currency";
import PaymentForm from "../_components/PaymentForm";

export const dynamic = "force-dynamic";

export default async function NewPaymentPage() {
  await verifySession();
  const orders = await prisma.order.findMany({
    where: { balance: { gt: 0 }, status: { not: "CANCELLED" } },
    include: { customer: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Record Payment</h1>
      <PaymentFormWrapper orders={orders} />
    </div>
  );
}

function PaymentFormWrapper({ orders }: { orders: { id: string; orderNo: string; balance: number; customer: { name: string } }[] }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Select Order</label>
        <select
          id="orderSelect"
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          onChange={(e) => {
            const order = orders.find((o) => o.id === e.target.value);
            if (order) {
              window.location.href = `/payments/new?orderId=${order.id}`;
            }
          }}
        >
          <option value="">Select an order with balance...</option>
          {orders.map((o) => (
            <option key={o.id} value={o.id}>
              {o.orderNo} — {o.customer.name} — Balance: {formatPeso(o.balance)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
