"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createInventoryItem, updateInventoryItem, type InventoryState } from "@/app/actions/inventory";

const initialState: InventoryState = { errors: undefined, message: undefined };

export default function InventoryItemForm({ item }: { item?: { id: string; name: string; category: string; unit: string; stock: number; minStock: number | null; notes: string | null } }) {
  const router = useRouter();
  const isEdit = !!item;
  const [state, formAction, pending] = useActionState(isEdit ? updateInventoryItem : createInventoryItem, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="id" value={item?.id} />
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {isEdit ? "Edit Item" : "New Item"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input name="name" defaultValue={item?.name} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Category</label>
            <input name="category" defaultValue={item?.category} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            {state?.errors?.category && <p className="mt-1 text-xs text-red-600">{state.errors.category}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Unit</label>
            <input name="unit" defaultValue={item?.unit} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            {state?.errors?.unit && <p className="mt-1 text-xs text-red-600">{state.errors.unit}</p>}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Stock</label>
            <input name="stock" type="number" min="0" defaultValue={item?.stock ?? 0} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            {state?.errors?.stock && <p className="mt-1 text-xs text-red-600">{state.errors.stock}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Min Stock</label>
            <input name="minStock" type="number" min="0" defaultValue={item?.minStock ?? ""} className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
            {state?.errors?.minStock && <p className="mt-1 text-xs text-red-600">{state.errors.minStock}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
          <textarea name="notes" rows={2} defaultValue={item?.notes ?? ""} className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
        </div>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button type="button" onClick={() => router.push("/inventory")} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Cancel
        </button>
      </div>
    </form>
  );
}
