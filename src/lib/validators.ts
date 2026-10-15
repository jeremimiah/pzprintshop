import { z } from "zod";

export const LoginSchema = z.object({
  email: z.email({ error: "Please enter a valid email." }).trim(),
  password: z.string().min(1, { error: "Password is required." }),
});

export const ServiceSchema = z.object({
  name: z.string().min(1, { error: "Service name is required." }),
  slug: z.string().min(1, { error: "Slug is required." }).trim(),
  description: z.string().optional(),
  pricingType: z.enum(["FIXED", "QUOTATION"]),
  price: z.number().int().positive().optional(),
  unit: z.string().min(1, { error: "Unit is required." }).trim(),
  turnaroundDays: z.number().int().positive().optional(),
  fieldTemplate: z.array(z.object({
    key: z.string(),
    label: z.string(),
    type: z.enum(["text", "textarea", "number", "select", "checkbox"]),
    required: z.boolean(),
    options: z.array(z.string()).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    default: z.string().optional(),
    placeholder: z.string().optional(),
  })).optional(),
  active: z.boolean(),
}).refine((data) => data.pricingType !== "FIXED" || data.price != null, {
  message: "Price is required for FIXED pricing services.",
  path: ["price"],
});

export const CustomerSchema = z.object({
  name: z.string().min(1, { error: "Customer name is required." }).trim(),
  phone: z.string().optional().nullable(),
  email: z.email({ error: "Please enter a valid email." }).optional().nullable().or(z.literal("")),
  address: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const OrderItemSchema = z.object({
  serviceId: z.string().min(1, { error: "Service is required." }),
  quantity: z.number().int().positive({ error: "Quantity must be at least 1." }),
  unitPrice: z.number().int().positive({ error: "Unit price must be positive." }),
  specs: z.record(z.string(), z.unknown()).optional(),
  notes: z.string().optional().nullable(),
});

export const OrderSchema = z.object({
  customerId: z.string().min(1, { error: "Customer is required." }),
  dueDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(OrderItemSchema).min(1, { error: "At least one item is required." }),
});

export const PaymentSchema = z.object({
  orderId: z.string().min(1, { error: "Order is required." }),
  amount: z.number().positive({ error: "Amount must be positive." }),
  method: z.enum(["CASH", "GCASH", "BANK_TRANSFER", "MAYA"]),
  type: z.enum(["FULL", "PARTIAL"]),
  receiptNo: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const InventoryItemSchema = z.object({
  name: z.string().min(1, { error: "Item name is required." }).trim(),
  category: z.string().min(1, { error: "Category is required." }).trim(),
  unit: z.string().min(1, { error: "Unit is required." }).trim(),
  stock: z.number().int().min(0, { error: "Stock cannot be negative." }).default(0),
  minStock: z.number().int().min(0).optional().nullable(),
  notes: z.string().optional().nullable(),
});

export const InventoryMovementSchema = z.object({
  itemId: z.string().min(1, { error: "Item is required." }),
  type: z.enum(["IN", "OUT", "ADJUST"]),
  quantity: z.number().int().positive({ error: "Quantity must be positive." }),
  note: z.string().optional().nullable(),
});
