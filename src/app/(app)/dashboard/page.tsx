import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso, formatDate } from "@/lib/currency";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await verifySession();

  const [
    todayOrders,
    pendingJobs,
    upcomingDeadlines,
    totalRevenue,
    totalOutstanding,
    recentOrders,
    lowStockItems,
  ] = await Promise.all([
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.count({
      where: {
        status: { in: ["PENDING_CONFIRMATION", "CONFIRMED", "IN_PRODUCTION"] },
      },
    }),
    prisma.order.findMany({
      where: {
        dueDate: { not: null },
        status: { notIn: ["COMPLETED", "CANCELLED"] },
      },
      orderBy: { dueDate: "asc" },
      take: 5,
      include: { customer: { select: { name: true } } },
    }),
    prisma.payment.aggregate({
      _sum: { amount: true },
    }),
    prisma.order.aggregate({
      _sum: { balance: true },
      where: { balance: { gt: 0 } },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        customer: { select: { name: true } },
        items: { include: { service: { select: { name: true } } } },
      },
    }),
    prisma.inventoryItem.findMany({
      where: {
        minStock: { not: null },
        stock: { lte: prisma.inventoryItem.fields.minStock },
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Today's Orders" value={todayOrders.toString()} />
        <StatCard label="Pending Jobs" value={pendingJobs.toString()} />
        <StatCard label="Total Revenue" value={formatPeso(totalRevenue._sum.amount ?? 0)} />
        <StatCard label="Outstanding" value={formatPeso(totalOutstanding._sum.balance ?? 0)} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming deadlines */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Upcoming Deadlines</h2>
          {upcomingDeadlines.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No upcoming deadlines.</p>
          ) : (
            <ul className="space-y-2">
              {upcomingDeadlines.map((order) => (
                <li key={order.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{order.orderNo}</span>
                    <span className="ml-2 text-zinc-500 dark:text-zinc-400">{order.customer.name}</span>
                  </div>
                  <span className="text-zinc-500 dark:text-zinc-400">{formatDate(order.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Low stock */}
        <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">Low Stock Alerts</h2>
          {lowStockItems.length === 0 ? (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">No low stock items.</p>
          ) : (
            <ul className="space-y-2">
              {lowStockItems.map((item) => (
                <li key={item.id} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.name}</span>
                  <span className="text-red-600 dark:text-red-400">
                    {item.stock} {item.unit} (min: {item.minStock})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent orders */}
      <section className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recent Orders</h2>
          <Link href="/orders" className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
            View all
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                  <th className="pb-2 pr-4 font-medium">Order #</th>
                  <th className="pb-2 pr-4 font-medium">Customer</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 pr-4 font-medium">Total</th>
                  <th className="pb-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                    <td className="py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">{order.orderNo}</td>
                    <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{order.customer.name}</td>
                    <td className="py-2 pr-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-2 pr-4 text-zinc-600 dark:text-zinc-400">{formatPeso(order.totalAmount)}</td>
                    <td className="py-2 text-zinc-500 dark:text-zinc-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
