"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/orders";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox";
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  default?: string;
  placeholder?: string;
};

type OrderItem = {
  serviceId: string;
  quantity: number;
  unitPrice: number | null;
  specs: Record<string, unknown>;
  notes: string;
};

type Service = {
  id: string;
  name: string;
  pricingType: string;
  price: number | null;
  unit: string;
  fieldTemplate: string | null;
};

export default function OrderForm() {
  const router = useRouter();
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OrderItem[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/services").then((r) => r.json()).then(setServices);
    fetch("/api/customers").then((r) => r.json()).then(setCustomers);
  }, []);

  function addItem() {
    setItems([...items, { serviceId: "", quantity: 1, unitPrice: null, specs: {}, notes: "" }]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, updates: Partial<OrderItem>) {
    setItems(items.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  }

  function updateSpec(index: number, key: string, value: unknown) {
    const item = items[index];
    updateItem(index, { specs: { ...item.specs, [key]: value } });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("customerId", customerId);
    formData.set("dueDate", dueDate);
    formData.set("notes", notes);
    formData.set("items", JSON.stringify(items));
    await createOrder(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">New Order</h1>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Order Info</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Customer</label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            >
              <option value="">Select customer...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
          />
        </div>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Items</h2>
          <button
            type="button"
            onClick={addItem}
            className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            + Add Item
          </button>
        </div>

        {items.length === 0 && (
          <p className="text-sm text-zinc-400">No items yet. Add at least one item.</p>
        )}

        {items.map((item, i) => {
          const service = services.find((s) => s.id === item.serviceId);
          const fieldDefs: FieldDef[] = service?.fieldTemplate ? JSON.parse(service.fieldTemplate) : [];

          return (
            <div key={i} className="rounded-md border border-zinc-200 p-3 space-y-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Item {i + 1}</span>
                <button type="button" onClick={() => removeItem(i)} className="text-xs text-red-600">
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs text-zinc-500">Service</label>
                  <select
                    value={item.serviceId}
                    onChange={(e) => {
                      const svc = services.find((s) => s.id === e.target.value);
                      updateItem(i, { serviceId: e.target.value, unitPrice: svc?.price ?? null, specs: {} });
                    }}
                    required
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  >
                    <option value="">Select service...</option>
                    {services.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-zinc-500">Qty</label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(i, { quantity: parseInt(e.target.value) || 1 })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500">Unit Price (₱)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unitPrice != null ? item.unitPrice / 100 : ""}
                    onChange={(e) => updateItem(i, { unitPrice: e.target.value ? Math.round(parseFloat(e.target.value) * 100) : null })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  />
                </div>
              </div>

              {fieldDefs.length > 0 && (
                <div className="grid gap-3 md:grid-cols-2">
                  {fieldDefs.map((field) => (
                    <div key={field.key}>
                      <label className="block text-xs text-zinc-500">
                        {field.label} {field.required && "*"}
                      </label>
                      {field.type === "text" && (
                        <input
                          value={(item.specs[field.key] as string) ?? ""}
                          onChange={(e) => updateSpec(i, field.key, e.target.value)}
                          required={field.required}
                          className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                          placeholder={field.placeholder}
                        />
                      )}
                      {field.type === "textarea" && (
                        <textarea
                          value={(item.specs[field.key] as string) ?? ""}
                          onChange={(e) => updateSpec(i, field.key, e.target.value)}
                          required={field.required}
                          rows={2}
                          className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        />
                      )}
                      {field.type === "number" && (
                        <input
                          type="number"
                          value={(item.specs[field.key] as number) ?? ""}
                          onChange={(e) => updateSpec(i, field.key, parseFloat(e.target.value))}
                          required={field.required}
                          min={field.min}
                          max={field.max}
                          className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        />
                      )}
                      {field.type === "select" && (
                        <select
                          value={(item.specs[field.key] as string) ?? field.default ?? ""}
                          onChange={(e) => updateSpec(i, field.key, e.target.value)}
                          required={field.required}
                          className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                        >
                          <option value="">Select...</option>
                          {field.options?.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      )}
                      {field.type === "checkbox" && (
                        <label className="mt-1 flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                          <input
                            type="checkbox"
                            checked={(item.specs[field.key] as boolean) ?? false}
                            onChange={(e) => updateSpec(i, field.key, e.target.checked)}
                            className="rounded border-zinc-300"
                          />
                          Yes
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs text-zinc-500">Item Notes</label>
                <input
                  value={item.notes}
                  onChange={(e) => updateItem(i, { notes: e.target.value })}
                  className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="Optional notes for this item"
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Create Order
        </button>
        <button
          type="button"
          onClick={() => router.push("/orders")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
