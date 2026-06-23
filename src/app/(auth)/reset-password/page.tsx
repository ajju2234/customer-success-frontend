"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input } from "antd";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/components/Toast";
import { apiError, authApi } from "@/lib/api";
import { ResetPasswordForm, resetPasswordSchema } from "@/lib/validation";

function ResetPasswordInner() {
  const router = useRouter();
  const toast = useToast();
  const token = useSearchParams().get("token") || "";
  const [error, setError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirm: "" },
  });

  if (!token) {
    return (
      <div>
        <Alert type="error" showIcon message="Invalid reset link" description="This link is missing or malformed. Request a new one." />
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            Request a new link
          </Link>
        </p>
      </div>
    );
  }

  async function onSubmit(data: ResetPasswordForm) {
    setError(null);
    try {
      await authApi.resetPassword(token, data.password);
      toast.success("Password updated — please sign in");
      router.replace("/login");
    } catch (e) {
      setError(apiError(e, "Could not reset password"));
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Set a new password</h2>
        <p className="text-sm text-slate-500">Choose a strong password for your account.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">New password</label>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input.Password {...field} size="large" placeholder="At least 8 characters" status={errors.password ? "error" : ""} />
            )}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <div>
          <label className="label">Confirm password</label>
          <Controller
            control={control}
            name="confirm"
            render={({ field }) => (
              <Input.Password {...field} size="large" placeholder="Re-enter password" status={errors.confirm ? "error" : ""} />
            )}
          />
          {errors.confirm && <p className="field-error">{errors.confirm.message}</p>}
        </div>

        {error && <Alert type="error" message={error} showIcon />}

        <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
          Update password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}
