import Link from "next/link";
import { logout } from "@/app/actions/auth";
import { getUser } from "@/lib/dal";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-56 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 md:flex">
        <div className="border-b border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">PzPrintshop</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">& Crafts</p>
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4">
          <NavLink href="/dashboard">Dashboard</NavLink>
          <NavLink href="/services">Services</NavLink>
          <NavLink href="/customers">Customers</NavLink>
          <NavLink href="/orders">Orders</NavLink>
          <NavLink href="/payments">Payments</NavLink>
          <NavLink href="/inventory">Inventory</NavLink>
          <NavLink href="/reports">Reports</NavLink>
          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <NavLink href="/users">Users</NavLink>
          )}
        </nav>
        <div className="border-t border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user?.name}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{user?.role}</p>
          <form action={logout}>
            <button type="submit" className="mt-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200">
              Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">PzPrintshop</h1>
          <form action={logout}>
            <button type="submit" className="text-sm text-zinc-500 dark:text-zinc-400">
              Sign out
            </button>
          </form>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-zinc-200 bg-white px-2 py-2 dark:border-zinc-800 dark:bg-zinc-900 md:hidden">
          <MobileNavLink href="/dashboard">Dashboard</MobileNavLink>
          <MobileNavLink href="/services">Services</MobileNavLink>
          <MobileNavLink href="/customers">Customers</MobileNavLink>
          <MobileNavLink href="/orders">Orders</MobileNavLink>
          <MobileNavLink href="/payments">Payments</MobileNavLink>
          <MobileNavLink href="/inventory">Inventory</MobileNavLink>
          <MobileNavLink href="/reports">Reports</MobileNavLink>
          {(user?.role === "OWNER" || user?.role === "ADMIN") && (
            <MobileNavLink href="/users">Users</MobileNavLink>
          )}
        </nav>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block rounded-md px-3 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-50"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
    >
      {children}
    </Link>
  );
}
