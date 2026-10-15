import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { deleteUser } from "@/app/actions/users";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await verifySession();
  const users = await prisma.user.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true, active: true, createdAt: true, _count: { select: { createdOrders: true, payments: true } } },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Users</h1>
        <Link href="/users/new" className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          New User
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No users yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/users/${user.id}/edit`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {user.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${user.role === "OWNER" ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400" : user.role === "ADMIN" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${user.active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{user._count.createdOrders}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/users/${user.id}/edit`} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                        Edit
                      </Link>
                      <form action={deleteUser}>
                        <input type="hidden" name="id" value={user.id} />
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
