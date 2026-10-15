import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDate } from "@/lib/currency";
import { deleteOrder } from "@/app/actions/orders";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  await verifySession();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      items: { include: { service: { select: { name: true } } } },
      _count: { select: { payments: true } },
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Orders</h1>
        <Link
          href="/orders/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No orders yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Order #</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Items</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Balance</th>
                <th className="px-4 py-3 font-medium">Due</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/orders/${order.id}`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {order.orderNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{order.customer.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {order.items.map((i) => i.service.name).join(", ")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatPeso(order.totalAmount)}</td>
                  <td className="px-4 py-3">
                    <span className={order.balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}>
                      {formatPeso(order.balance)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{formatDate(order.dueDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/orders/${order.id}`} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        View
                      </Link>
                      <form action={deleteOrder}>
                        <input type="hidden" name="id" value={order.id} />
                        <button type="submit" className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    IN_PRODUCTION: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    READY_FOR_PICKUP: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    COMPLETED: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  };
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-zinc-100 text-zinc-800"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
