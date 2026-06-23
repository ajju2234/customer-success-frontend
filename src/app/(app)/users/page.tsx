"use client";

import { Button, Select, Tag } from "antd";
import { useEffect, useState } from "react";

import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { EmptyState, PageHeader, TableSkeleton } from "@/components/ui";
import { apiError, usersApi } from "@/lib/api";
import { Role, User } from "@/lib/types";
import { useAppSelector } from "@/store/hooks";

const ROLE_OPTIONS = [
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "csm", label: "CSM" },
];

export default function UsersPage() {
  const me = useAppSelector((s) => s.auth.user);
  const confirm = useConfirm();
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const page = await usersApi.list({ limit: 100 });
      setUsers(page.items);
    } catch (e) {
      toast.error(apiError(e, "Could not load users"));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (me?.role === "admin") load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.role]);

  // Client-side guard (the API enforces this too).
  if (me && me.role !== "admin") {
    return <EmptyState title="Access denied" hint="Only administrators can manage users." />;
  }

  async function changeRole(u: User, role: Role) {
    if (role === u.role) return;
    setSavingId(u.id);
    try {
      const updated = await usersApi.update(u.id, { role });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      toast.success(`${u.name} is now ${role}`);
    } catch (e) {
      toast.error(apiError(e, "Could not update role"));
    } finally {
      setSavingId(null);
    }
  }

  async function toggleActive(u: User) {
    const ok = await confirm({
      title: u.is_active ? "Deactivate user" : "Activate user",
      message: `${u.is_active ? "Deactivate" : "Activate"} ${u.name}?`,
      confirmLabel: u.is_active ? "Deactivate" : "Activate",
      danger: u.is_active,
    });
    if (!ok) return;
    setSavingId(u.id);
    try {
      const updated = await usersApi.update(u.id, { is_active: !u.is_active });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
      toast.success(`${u.name} ${updated.is_active ? "activated" : "deactivated"}`);
    } catch (e) {
      toast.error(apiError(e, "Could not update status"));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage team members and their roles (admin only)." />

      <div className="card">
        {loading ? (
          <TableSkeleton rows={5} cols={5} />
        ) : users.length === 0 ? (
          <EmptyState title="No users" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const isSelf = u.id === me?.id;
                  return (
                    <tr key={u.id}>
                      <td className="font-medium">
                        {u.name}
                        {isSelf && <span className="ml-2 text-xs text-slate-400">(you)</span>}
                      </td>
                      <td className="text-slate-600 dark:text-slate-300">{u.email}</td>
                      <td>
                        <Select
                          size="small"
                          className="w-32"
                          value={u.role}
                          loading={savingId === u.id}
                          disabled={isSelf}
                          options={ROLE_OPTIONS}
                          onChange={(v) => changeRole(u, v as Role)}
                        />
                      </td>
                      <td>
                        <Tag color={u.is_active ? "green" : "default"}>
                          {u.is_active ? "Active" : "Inactive"}
                        </Tag>
                      </td>
                      <td>
                        <div className="flex justify-end">
                          <Button
                            type="link"
                            size="small"
                            danger={u.is_active}
                            disabled={isSelf}
                            onClick={() => toggleActive(u)}
                          >
                            {u.is_active ? "Deactivate" : "Activate"}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
