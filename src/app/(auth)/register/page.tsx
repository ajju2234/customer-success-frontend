"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Input, Select } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { register as registerThunk } from "@/store/authSlice";
import { RegisterForm, registerSchema } from "@/lib/validation";

const ROLE_OPTIONS = [
  { value: "csm", label: "CSM (own customers)" },
  { value: "manager", label: "Manager (org-wide)" },
  { value: "admin", label: "Admin (full access)" },
];

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { error, status } = useAppSelector((s) => s.auth);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "csm" },
  });

  async function onSubmit(data: RegisterForm) {
    const res = await dispatch(registerThunk(data));
    if (registerThunk.fulfilled.match(res)) router.replace("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Create your account</h2>
        <p className="text-sm text-slate-500">Start managing customer success.</p>
      </div>

      <div>
        <label className="label">Name</label>
        <Controller
          control={control}
          name="name"
          render={({ field }) => (
            <Input {...field} size="large" placeholder="Your name" status={errors.name ? "error" : ""} />
          )}
        />
        {errors.name && <p className="field-error">{errors.name.message}</p>}
      </div>

      <div>
        <label className="label">Email</label>
        <Controller
          control={control}
          name="email"
          render={({ field }) => (
            <Input {...field} size="large" type="email" placeholder="you@company.com" status={errors.email ? "error" : ""} />
          )}
        />
        {errors.email && <p className="field-error">{errors.email.message}</p>}
      </div>

      <div>
        <label className="label">Password</label>
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
        <label className="label">Role</label>
        <Controller
          control={control}
          name="role"
          render={({ field }) => <Select {...field} size="large" className="w-full" options={ROLE_OPTIONS} />}
        />
        <p className="mt-1 text-xs text-slate-400">Role is selectable here for demo/testing of RBAC.</p>
      </div>

      {error && status === "unauthenticated" && <Alert type="error" message={error} showIcon />}

      <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
