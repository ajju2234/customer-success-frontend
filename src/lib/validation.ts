import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginForm = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email"),
});
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Confirm your password"),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "manager", "csm"]),
});
export type RegisterForm = z.infer<typeof registerSchema>;

const phoneRegex = /^[+]?[0-9][0-9\s().-]{6,19}$/;

export const customerSchema = z.object({
  name: z.string().min(1, "Name is required").max(160),
  company: z.string().max(160, "Too long").optional().or(z.literal("")),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  phone: z
    .union([z.string().regex(phoneRegex, "Enter a valid phone number (7–20 digits)"), z.literal("")])
    .optional(),
  status: z.enum(["prospect", "active", "at_risk", "churned"]),
  health_score: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Min 0")
    .max(100, "Max 100")
    .nullable()
    .optional(),
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
