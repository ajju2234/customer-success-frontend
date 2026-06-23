"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { apiError, authApi } from "@/lib/api";
import { ForgotPasswordForm, forgotPasswordSchema } from "@/lib/validation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema), defaultValues: { email: "" } });

  async function onSubmit(data: ForgotPasswordForm) {
    setError(null);
    try {
      const res = await authApi.forgotPassword(data.email);
      // Demo: no email is sent — if the account exists we get a token and go
      // straight to the reset step (simulating clicking the emailed link).
      if (res.reset_token) {
        router.replace(`/reset-password?token=${encodeURIComponent(res.reset_token)}`);
      } else {
        setSent(true);
      }
    } catch (e) {
      setError(apiError(e, "Could not process the request"));
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Forgot password</h2>
        <p className="text-sm text-slate-500">Enter your email to reset it.</p>
      </div>

      {sent ? (
        <Alert
          type="success"
          showIcon
          message="Check your email"
          description="If that email is registered, we've sent a password reset link. It expires in 30 minutes."
        />
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Email address</label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input {...field} size="large" type="email" autoComplete="email" placeholder="you@company.com" status={errors.email ? "error" : ""} />
              )}
            />
            {errors.email && <p className="field-error">{errors.email.message}</p>}
          </div>

          {error && <Alert type="error" message={error} showIcon />}

          <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
