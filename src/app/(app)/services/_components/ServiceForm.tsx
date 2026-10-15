"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createService, updateService, type ServiceState } from "@/app/actions/services";
import type { Service } from "@/lib/types";

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

const initialState: ServiceState = { errors: undefined, message: undefined };

export default function ServiceForm({ service }: { service?: Service }) {
  const router = useRouter();
  const isEdit = !!service;

  const [name, setName] = useState(service?.name ?? "");
  const [slug, setSlug] = useState(service?.slug ?? "");
  const [description, setDescription] = useState(service?.description ?? "");
  const [pricingType, setPricingType] = useState<"FIXED" | "QUOTATION">(service?.pricingType ?? "FIXED");
  const [price, setPrice] = useState(service?.price ? (service.price / 100).toString() : "");
  const [unit, setUnit] = useState(service?.unit ?? "");
  const [turnaroundDays, setTurnaroundDays] = useState(service?.turnaroundDays?.toString() ?? "");
  const [active, setActive] = useState(service?.active ?? true);
  const [fields, setFields] = useState<FieldDef[]>(
    service?.fieldTemplate ? JSON.parse(service.fieldTemplate) : []
  );

  const [state, formAction, pending] = useActionState(
    isEdit ? updateService : createService,
    initialState
  );

  function addField() {
    setFields([...fields, { key: `field_${Date.now()}`, label: "", type: "text", required: false }]);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function updateField(index: number, updates: Partial<FieldDef>) {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  }

  function generateSlug() {
    setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-6">
      <input type="hidden" name="id" value={service?.id} />

      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
          {isEdit ? "Edit Service" : "New Service"}
        </h1>

        {/* Basic info */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Basic Information</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Name</label>
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                placeholder="e.g. Document Printing"
              />
              {state?.errors?.name && <p className="mt-1 text-xs text-red-600">{state.errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Slug</label>
              <div className="mt-1 flex gap-2">
                <input
                  name="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="document-printing"
                />
                <button
                  type="button"
                  onClick={generateSlug}
                  className="whitespace-nowrap rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
                >
                  Generate
                </button>
              </div>
              {state?.errors?.slug && <p className="mt-1 text-xs text-red-600">{state.errors.slug}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Description</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              placeholder="Brief description of the service"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Pricing Type</label>
              <select
                name="pricingType"
                value={pricingType}
                onChange={(e) => setPricingType(e.target.value as "FIXED" | "QUOTATION")}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              >
                <option value="FIXED">Fixed Price</option>
                <option value="QUOTATION">Quotation</option>
              </select>
            </div>

            {pricingType === "FIXED" && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Price (₱)</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  placeholder="0.00"
                />
                {state?.errors?.price && <p className="mt-1 text-xs text-red-600">{state.errors.price}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Unit</label>
              <input
                name="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                placeholder="page, piece, shirt"
              />
              {state?.errors?.unit && <p className="mt-1 text-xs text-red-600">{state.errors.unit}</p>}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Turnaround (days)</label>
              <input
                name="turnaroundDays"
                type="number"
                min="1"
                value={turnaroundDays}
                onChange={(e) => setTurnaroundDays(e.target.value)}
                className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input
                  type="checkbox"
                  name="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-zinc-300"
                />
                Active
              </label>
            </div>
          </div>
        </div>

        {/* Custom fields */}
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Custom Fields</h2>
            <button
              type="button"
              onClick={addField}
              className="rounded-md border border-zinc-300 px-2 py-1 text-xs text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            >
              + Add Field
            </button>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Define custom fields that staff will fill in when creating orders for this service.
          </p>

          {fields.length === 0 && (
            <p className="text-sm text-zinc-400 dark:text-zinc-500">No custom fields defined.</p>
          )}

          {fields.map((field, i) => (
            <div key={i} className="rounded-md border border-zinc-200 p-3 space-y-3 dark:border-zinc-700">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Field {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeField(i)}
                  className="text-xs text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  Remove
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <div>
                  <label className="block text-xs text-zinc-500 dark:text-zinc-400">Label</label>
                  <input
                    value={field.label}
                    onChange={(e) => updateField(i, { label: e.target.value })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="Field label"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 dark:text-zinc-400">Key</label>
                  <input
                    value={field.key}
                    onChange={(e) => updateField(i, { key: e.target.value })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="field_key"
                  />
                </div>
                <div>
                  <label className="block text-xs text-zinc-500 dark:text-zinc-400">Type</label>
                  <select
                    value={field.type}
                    onChange={(e) => updateField(i, { type: e.target.value as FieldDef["type"] })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                  >
                    <option value="text">Text</option>
                    <option value="textarea">Textarea</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                    <option value="checkbox">Checkbox</option>
                  </select>
                </div>
              </div>

              {field.type === "select" && (
                <div>
                  <label className="block text-xs text-zinc-500 dark:text-zinc-400">Options (comma-separated)</label>
                  <input
                    value={field.options?.join(", ") ?? ""}
                    onChange={(e) => updateField(i, { options: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })}
                    className="mt-0.5 block w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
                    placeholder="Option 1, Option 2, Option 3"
                  />
                </div>
              )}

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(i, { required: e.target.checked })}
                    className="rounded border-zinc-300"
                  />
                  Required
                </label>
              </div>
            </div>
          ))}

          <input type="hidden" name="fieldTemplate" value={JSON.stringify(fields)} />
          {state?.errors?.fieldTemplate && <p className="text-xs text-red-600">{state.errors.fieldTemplate}</p>}
        </div>
      </div>

      {state?.message && <p className="text-sm text-red-600">{state.message}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {pending ? "Saving..." : isEdit ? "Update Service" : "Create Service"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/services")}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
