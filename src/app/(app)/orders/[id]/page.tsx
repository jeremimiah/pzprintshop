import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDate, formatDateTime } from "@/lib/currency";
import { updateOrderStatus } from "@/app/actions/orders";
import Link from "next/link";

export const dynamic = "force-dynamic";

const STATUS_FLOW = ["PENDING_CONFIRMATION", "CONFIRMED", "IN_PRODUCTION", "READY_FOR_PICKUP", "COMPLETED"];

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await verifySession();
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { service: true } },
      payments: { orderBy: { paidAt: "desc" } },
      statusLogs: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { name: true } } },
      },
      createdBy: { select: { name: true } },
    },
  });

  if (!order) {
    return <p className="text-sm text-zinc-500">Order not found.</p>;
  }

  const currentIdx = STATUS_FLOW.indexOf(order.status);
  const nextStatus = currentIdx < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIdx + 1] : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/orders" className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            ← Back to Orders
          </Link>
          <h1 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{order.orderNo}</h1>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Order info */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Details</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Customer</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{order.customer.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Phone</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{order.customer.phone ?? "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Due Date</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{formatDate(order.dueDate)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Created By</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{order.createdBy.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Created</dt>
              <dd className="text-zinc-900 dark:text-zinc-50">{formatDateTime(order.createdAt)}</dd>
            </div>
          </dl>
          {order.notes && (
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Notes</p>
              <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{order.notes}</p>
            </div>
          )}
        </section>

        {/* Financial summary */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payment Summary</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Total Amount</dt>
              <dd className="font-medium text-zinc-900 dark:text-zinc-50">{formatPeso(order.totalAmount)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-zinc-500 dark:text-zinc-400">Paid</dt>
              <dd className="text-green-600 dark:text-green-400">{formatPeso(order.paidAmount)}</dd>
            </div>
            <div className="flex justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
              <dt className="font-medium text-zinc-900 dark:text-zinc-50">Balance</dt>
              <dd className={`font-medium ${order.balance > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                {formatPeso(order.balance)}
              </dd>
            </div>
          </dl>

          {nextStatus && order.status !== "CANCELLED" && (
            <form action={updateOrderStatus} className="mt-3 space-y-2">
              <input type="hidden" name="orderId" value={order.id} />
              <input type="hidden" name="status" value={nextStatus} />
              <button
                type="submit"
                className="w-full rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Move to {nextStatus.replace(/_/g, " ")}
              </button>
            </form>
          )}
        </section>
      </div>

      {/* Order items */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="pb-2 pr-4 font-medium">Service</th>
                <th className="pb-2 pr-4 font-medium">Qty</th>
                <th className="pb-2 pr-4 font-medium">Unit Price</th>
                <th className="pb-2 pr-4 font-medium">Subtotal</th>
                <th className="pb-2 font-medium">Specs</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{item.service.name}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{item.quantity}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{formatPeso(item.unitPrice)}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{formatPeso(item.subtotal)}</td>
                  <td className="py-2 text-zinc-500 dark:text-zinc-400">
                    {item.specs && (
                      <span className="text-xs">
                        {Object.entries(JSON.parse(item.specs)).map(([k, v]) => `${k}: ${v}`).join(", ")}
                      </span>
                    )}
                    {item.notes && <span className="text-xs italic">{item.notes}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Payments */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Payments</h2>
        {order.payments.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No payments recorded.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Method</th>
                <th className="pb-2 pr-4 font-medium">Type</th>
                <th className="pb-2 pr-4 font-medium">Amount</th>
                <th className="pb-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {order.payments.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{formatDateTime(p.paidAt)}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{p.method.replace(/_/g, " ")}</td>
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{p.type}</td>
                  <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{formatPeso(p.amount)}</td>
                  <td className="py-2 text-zinc-500 dark:text-zinc-400">{p.note ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Status history */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Status History</h2>
        {order.statusLogs.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No status changes.</p>
        ) : (
          <ul className="space-y-2">
            {order.statusLogs.map((log) => (
              <li key={log.id} className="flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">
                    {log.from ? `${log.from.replace(/_/g, " ")} → ` : ""}{log.to.replace(/_/g, " ")}
                  </span>
                  <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">by {log.changedBy.name}</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{formatDateTime(log.createdAt)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
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
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[status] ?? "bg-zinc-100 text-zinc-800"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
