"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createUser, updateUser, type UserState } from "@/app/actions/users";

const initialState: UserState = { errors: undefined, message: undefined };

export default function UserForm({ user }: { user?: { id: string; name: string; email: string; role: "OWNER" | "ADMIN" | "STAFF"; active: boolean } }) {
  const router = useRouter();
  const isEdit = !!user;
  const [state, formAction, pending] = useActionState(isEdit ? updateUser : createUser, initialState);

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <input type="hidden" name="id" value={user?.id} />

      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
        {isEdit ? "Edit User" : "New User"}
      </h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
          <input name="name" defaultValue={user?.name} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email</label>
          <input name="email" type="email" defaultValue={user?.email} required className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          {state?.errors?.email && <p className="mt-1 text-xs text-red-600">{state.errors.email}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Password {!isEdit && <span className="text-zinc-400">(min 8 chars)</span>}
          </label>
          <input name="password" type="password" defaultValue="" required={!isEdit} className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50" />
          {state?.errors?.password && <p className="mt-1 text-xs text-red-600">{state.errors.password}</p>}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Role</label>
            <select name="role" defaultValue={user?.role ?? "STAFF"} className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50">
              <option value="STAFF">Staff</option>
              <option value="ADMIN">Admin</option>
              <option value="OWNER">Owner</option>
            </select>
            {state?.errors?.role && <p className="mt-1 text-xs text-red-600">{state.errors.role}</p>}
          </div>
          <div className="flex items-end pb-2">
            <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
              <input type="checkbox" name="active" defaultChecked={user?.active ?? true} className="rounded border-zinc-300" />
              Active
            </label>
          </div>
        </div>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200">
          {pending ? "Saving..." : isEdit ? "Update" : "Create"}
        </button>
        <button type="button" onClick={() => router.push("/users")} className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800">
          Cancel
        </button>
      </div>
    </form>
  );
}
