import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { deleteCustomer } from "@/app/actions/customers";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await verifySession();
  const customers = await prisma.customer.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { orders: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Customers</h1>
        <Link
          href="/customers/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Customer
        </Link>
      </div>

      {customers.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No customers yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/customers/${c.id}/edit`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {c.name}
                    </Link>
                    {c.address && <p className="text-xs text-zinc-500 dark:text-zinc-400">{c.address}</p>}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.phone ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{c._count.orders}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/customers/${c.id}/edit`} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        Edit
                      </Link>
                      <form action={deleteCustomer}>
                        <input type="hidden" name="id" value={c.id} />
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
