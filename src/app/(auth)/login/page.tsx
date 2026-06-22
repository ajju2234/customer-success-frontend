"use client";

import { GithubOutlined, GoogleOutlined } from "@ant-design/icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Button, Divider, Input } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { useToast } from "@/components/Toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { login } from "@/store/authSlice";
import { LoginForm, loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const toast = useToast();
  const { error, status } = useAppSelector((s) => s.auth);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: LoginForm) {
    const res = await dispatch(login(data));
    if (login.fulfilled.match(res)) router.replace("/dashboard");
  }

  const notConfigured = () => toast.info("Not configured in this demo.");

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold">Welcome back</h2>
        <p className="text-sm text-slate-500">Sign in to your workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">Email address</label>
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
              <Input.Password {...field} size="large" placeholder="••••••••" status={errors.password ? "error" : ""} />
            )}
          />
          {errors.password && <p className="field-error">{errors.password.message}</p>}
          <div className="mt-1 text-right">
            <button type="button" onClick={notConfigured} className="text-sm font-medium text-brand-600 hover:underline">
              Forgot password?
            </button>
          </div>
        </div>

        {error && status === "unauthenticated" && <Alert type="error" message={error} showIcon />}

        <Button type="primary" htmlType="submit" size="large" block loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <Divider plain className="!text-slate-400">
        or continue with
      </Divider>

      <div className="grid grid-cols-2 gap-3">
        <Button size="large" icon={<GoogleOutlined />} onClick={notConfigured}>
          Google
        </Button>
        <Button size="large" icon={<GithubOutlined />} onClick={notConfigured}>
          GitHub
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:underline">
          Create one
        </Link>
      </p>
    </div>
  );
}
