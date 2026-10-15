"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer, updateCustomer, type CustomerState } from "@/app/actions/customers";

const initialState: CustomerState = { errors: undefined, message: undefined };

export default function CustomerForm({ customer }: { customer?: { id: string; name: string; phone: string | null; email: string | null; address: string | null; notes: string | null } }) {
  const router = useRouter();
  const isEdit = !!customer;
  const [state, formAction, pending] = useActionState(isEdit ? updateCustomer : createCustomer, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="id" value={customer?.id} />

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {isEdit ? "Edit Customer" : "New Customer"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input
            name="name"
            defaultValue={customer?.name}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="Customer name"
          />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Phone</label>
          <input
            name="phone"
            defaultValue={customer?.phone ?? ""}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="09xx xxx xxxx"
          />
          {state?.errors?.phone && <p className="mt-1 text-xs text-red-600">{state.errors.phone}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input
            name="email"
            type="email"
            defaultValue={customer?.email ?? ""}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            placeholder="customer@email.com"
          />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Address</label>
          <textarea
            name="address"
            rows={2}
            defaultValue={customer?.address ?? ""}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          {state?.errors?.address && <p className="mt-1 text-xs text-red-600">{state.errors.address}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
          <textarea
            name="notes"
            rows={2}
            defaultValue={customer?.notes ?? ""}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
          {state?.errors?.notes && <p className="mt-1 text-xs text-red-600">{state.errors.notes}</p>}
        </div>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/customers")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
