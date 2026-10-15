import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { formatPeso } from "@/lib/currency";
import { deleteService } from "@/app/actions/services";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  await verifySession();
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Services</h1>
        <Link
          href="/services/new"
          className="rounded-md bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          New Service
        </Link>
      </div>

      {services.length === 0 ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">No services yet. Create your first service.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Pricing</th>
                <th className="px-4 py-3 font-medium">Unit</th>
                <th className="px-4 py-3 font-medium">Turnaround</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {services.map((svc) => (
                <tr key={svc.id} className="border-b border-zinc-100 dark:border-zinc-800/50">
                  <td className="px-4 py-3">
                    <Link href={`/services/${svc.id}/edit`} className="font-medium text-zinc-900 hover:underline dark:text-zinc-50">
                      {svc.name}
                    </Link>
                    {svc.description && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{svc.description}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {svc.pricingType === "FIXED" ? formatPeso(svc.price ?? 0) : "Quotation"}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{svc.unit}</td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                    {svc.turnaroundDays ? `${svc.turnaroundDays} day${svc.turnaroundDays > 1 ? "s" : ""}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${svc.active ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                      {svc.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/services/${svc.id}/edit`}
                        className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
                      >
                        Edit
                      </Link>
                      <form action={deleteService}>
                        <input type="hidden" name="id" value={svc.id} />
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
