import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDate } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  await verifySession();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [
    monthRevenue,
    yearRevenue,
    monthOrders,
    yearOrders,
    outstandingTotal,
    topServices,
    recentPayments,
    ordersByStatus,
  ] = await Promise.all([
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paidAt: { gte: startOfYear } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.order.count({ where: { createdAt: { gte: startOfYear } } }),
    prisma.order.aggregate({ _sum: { balance: true }, where: { balance: { gt: 0 } } }),
    prisma.orderItem.groupBy({
      by: ["serviceId"],
      _sum: { subtotal: true, quantity: true },
      orderBy: { _sum: { subtotal: "desc" } },
      take: 5,
    }),
    prisma.payment.findMany({
      orderBy: { paidAt: "desc" },
      take: 20,
      include: { order: { select: { orderNo: true } } },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const serviceIds = topServices.map((s) => s.serviceId);
  const services = await prisma.service.findMany({
    where: { id: { in: serviceIds } },
    select: { id: true, name: true },
  });
  const serviceMap = new Map(services.map((s) => [s.id, s.name]));

  const statusCounts: Record<string, number> = {};
  for (const s of ordersByStatus) {
    statusCounts[s.status] = s._count._all;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Reports</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Revenue (Month)" value={formatPeso(monthRevenue._sum.amount ?? 0)} />
        <StatCard label="Revenue (Year)" value={formatPeso(yearRevenue._sum.amount ?? 0)} />
        <StatCard label="Orders (Month)" value={monthOrders.toString()} />
        <StatCard label="Outstanding" value={formatPeso(outstandingTotal._sum.balance ?? 0)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Orders by status */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Orders by Status</h2>
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(statusCounts).map(([status, count]) => (
                <tr key={status} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 text-zinc-600 dark:text-zinc-400">{status.replace(/_/g, " ")}</td>
                  <td className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">{count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Top services */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Top Services (by revenue)</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="pb-2 font-medium">Service</th>
                <th className="pb-2 text-right font-medium">Qty</th>
                <th className="pb-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {topServices.map((s) => (
                <tr key={s.serviceId} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 text-zinc-900 dark:text-zinc-50">{serviceMap.get(s.serviceId) ?? "Unknown"}</td>
                  <td className="py-2 text-right text-zinc-600 dark:text-zinc-400">{s._sum.quantity}</td>
                  <td className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">{formatPeso(s._sum.subtotal ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {/* Recent payments */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="pb-2 pr-4 font-medium">Date</th>
                <th className="pb-2 pr-4 font-medium">Order</th>
                <th className="pb-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map((p) => (
                <tr key={p.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{formatDate(p.paidAt)}</td>
                  <td className="py-2 pr-4 text-zinc-900 dark:text-zinc-50">{p.order.orderNo}</td>
                  <td className="py-2 text-right font-medium text-zinc-900 dark:text-zinc-50">{formatPeso(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
    </div>
  );
}
