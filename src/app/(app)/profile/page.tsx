"use client";

import { CheckCircleOutlined } from "@ant-design/icons";
import { Tag } from "antd";

import { PageHeader, Spinner } from "@/components/ui";
import { Role } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

const ROLE_ACCESS: Record<Role, string[]> = {
  admin: [
    "Manage users and assign roles",
    "Full access to all customers and interactions",
    "Organisation-wide dashboard",
  ],
  manager: [
    "View and manage all customers and interactions",
    "Organisation-wide dashboard",
    "Cannot manage users",
  ],
  csm: [
    "Create and manage your own customers and interactions",
    "Dashboard scoped to your own accounts",
    "No access to other CSMs' data",
  ],
};

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
}

export default function ProfilePage() {
  const user = useAppSelector((s) => s.auth.user);
  if (!user) return <Spinner />;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Profile" subtitle="Your account and access level." />

      {/* Header card with gradient banner */}
      <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm dark:border-slate-800">
        <div className="bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-xl font-bold backdrop-blur">
              {initials(user.name)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{user.name}</p>
              <p className="truncate text-sm text-white/80">{user.email}</p>
              <span className="badge mt-1 bg-white/20 text-white">{user.role.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-4 bg-white p-5 dark:bg-slate-900">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Member since</dt>
            <dd className="mt-0.5 font-medium">{new Date(user.created_at).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-400">Account status</dt>
            <dd className="mt-0.5">
              <Tag color={user.is_active ? "green" : "default"}>
                {user.is_active ? "Active" : "Inactive"}
              </Tag>
            </dd>
          </div>
        </dl>
      </div>

      {/* Access for this role */}
      <div className="card mt-4">
        <h2 className="mb-3 font-semibold">
          Your access <span className="text-slate-400">·</span>{" "}
          <span className="text-brand-600 dark:text-brand-400">{user.role.toUpperCase()}</span>
        </h2>
        <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
          {ROLE_ACCESS[user.role].map((line) => (
            <li key={line} className="flex items-start gap-2.5">
              <CheckCircleOutlined className="mt-0.5 text-green-500" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
