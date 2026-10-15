"use client";

import { useActionState } from "react";
import { login } from "@/app/actions/auth";

const initialState = {
  errors: undefined,
  message: undefined,
};

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-8 shadow-sm dark:bg-zinc-900">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            PzPrintshop
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to your account
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="you@example.com"
            />
            {state?.errors?.email && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="••••••••"
            />
            {state?.errors?.password && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{state.errors.password}</p>
            )}
          </div>

          {state?.message && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.message}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
