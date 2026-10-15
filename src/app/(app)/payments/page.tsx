import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDateTime } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
  await verifySession();
  const payments = await prisma.payment.findMany({
    orderBy: { paidAt: "desc" },
    take: 50,
    include: {
      order: { select: { orderNo: true, customer: { select: { name: true } } } },
      recordedBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Payments</h1>

      {payments.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Method</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Recorded By</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{formatDateTime(p.paidAt)}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{p.order.orderNo}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.order.customer.name}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.method.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{p.type}</td>
                  <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-50">{formatPeso(p.amount)}</td>
                  <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">{p.recordedBy.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
