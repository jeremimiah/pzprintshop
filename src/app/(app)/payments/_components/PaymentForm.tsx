"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/app/actions/payments";

export default function PaymentForm({ orderId, balance }: { orderId: string; balance: number }) {
  const router = useRouter();
  const [amount, setAmount] = useState((balance / 100).toString());
  const [method, setMethod] = useState("CASH");
  const [type, setType] = useState<"FULL" | "PARTIAL">("FULL");
  const [receiptNo, setReceiptNo] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData();
    formData.set("orderId", orderId);
    formData.set("amount", amount);
    formData.set("method", method);
    formData.set("type", type);
    formData.set("receiptNo", receiptNo);
    formData.set("note", note);

    const result = await recordPayment({ errors: undefined, message: undefined }, formData);
    if (result.errors || result.message) {
      setError(result.message ?? Object.values(result.errors ?? {}).flat()[0] ?? "Error recording payment");
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="orderId" value={orderId} />

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Amount (₱)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          max={balance / 100}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <p className="mt-1 text-xs text-zinc-500">Outstanding balance: ₱{(balance / 100).toFixed(2)}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Method</label>
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="CASH">Cash</option>
            <option value="GCASH">GCash</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="MAYA">Maya</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Payment Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as "FULL" | "PARTIAL")}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          >
            <option value="FULL">Full Payment</option>
            <option value="PARTIAL">Partial Payment</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Receipt No. (optional)</label>
        <input
          value={receiptNo}
          onChange={(e) => setReceiptNo(e.target.value)}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          placeholder="e.g. RCP-001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Recording..." : "Record Payment"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/orders/${orderId}`)}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
