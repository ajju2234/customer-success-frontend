import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "manager", "csm"]),
});
export type RegisterForm = z.infer<typeof registerSchema>;

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  company: z.string().max(160).optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),
  status: z.enum(["prospect", "active", "at_risk", "churned"]),
  health_score: z.number().min(0).max(100).nullable().optional(),
});
export type CustomerForm = z.infer<typeof customerSchema>;

export const interactionSchema = z.object({
  customer_id: z.string().min(1, "Select a customer"),
  type: z.enum(["meeting", "call", "email", "note"]),
  title: z.string().min(1, "Title is required").max(200),
  notes: z.string().optional().or(z.literal("")),
  meeting_date: z.string().min(1, "Date is required"),
});
export type InteractionForm = z.infer<typeof interactionSchema>;
