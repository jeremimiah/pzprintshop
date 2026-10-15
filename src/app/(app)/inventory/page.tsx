import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { deleteInventoryItem } from "@/app/actions/inventory";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  await verifySession();
  const items = await prisma.inventoryItem.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { movements: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Inventory</h1>
        <Link href="/inventory/new" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          New Item
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No inventory items yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Stock</th>
                <th className="px-4 py-3 font-medium">Min Stock</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/inventory/${item.id}/edit`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {item.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.category}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.stock} {item.unit}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{item.minStock ?? "—"}</td>
                  <td className="px-4 py-3">
                    {item.minStock != null && item.stock <= item.minStock ? (
                      <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-400">Low Stock</span>
                    ) : (
                      <span className="inline-block rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">OK</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/inventory/${item.id}/edit`} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">Edit</Link>
                      <form action={deleteInventoryItem}>
                        <input type="hidden" name="id" value={item.id} />
                        <button type="submit" className="text-xs text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300">Delete</button>
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
