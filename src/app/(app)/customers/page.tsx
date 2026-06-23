"use client";

import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Pagination, Select } from "antd";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CustomerFormModal } from "@/components/CustomerFormModal";
import { useConfirm } from "@/components/ConfirmDialog";
import { useToast } from "@/components/Toast";
import { EmptyState, HealthBar, PageHeader, StatusBadge, TableSkeleton } from "@/components/ui";
import { Customer, CustomerStatus } from "@/lib/types";
import { deleteCustomer, fetchCustomers } from "@/store/customersSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "prospect", label: "Prospect" },
  { value: "active", label: "Active" },
  { value: "at_risk", label: "At risk" },
  { value: "churned", label: "Churned" },
];

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toast = useToast();
  const { items, total, page, limit, status, error } = useAppSelector((s) => s.customers);

  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatus | "">("");
  const [pageNum, setPageNum] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);

  function load() {
    dispatch(fetchCustomers({ page: pageNum, limit: 10, status: statusFilter, q }));
  }

  useEffect(() => {
    const t = setTimeout(load, 250); // debounce search/filter
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, statusFilter, pageNum]);

  async function onDelete(c: Customer) {
    const ok = await confirm({
      title: "Delete customer",
      message: `Delete "${c.name}"? This also removes its interactions.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await dispatch(deleteCustomer(c.id));
    if (deleteCustomer.fulfilled.match(res)) {
      toast.success("Customer deleted");
      load();
    } else {
      toast.error((res.payload as string) || "Could not delete customer");
    }
  }

  return (
    <div>
      <PageHeader
        title="Customers"
        subtitle="Manage your accounts and their health."
        action={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditing(null);
              setModalOpen(true);
            }}
          >
            New customer
          </Button>
        }
      />

      <div className="card">
        <div className="mb-4 flex flex-wrap gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            className="max-w-xs"
            placeholder="Search name, company, email…"
            value={q}
            onChange={(e) => {
              setPageNum(1);
              setQ(e.target.value);
            }}
          />
          <Select
            className="w-44"
            value={statusFilter}
            onChange={(v) => {
              setPageNum(1);
              setStatusFilter(v as CustomerStatus | "");
            }}
            options={STATUS_OPTIONS}
          />
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {status === "loading" && items.length === 0 ? (
          <TableSkeleton rows={6} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState title="No customers yet" hint="Create your first customer to get started." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">
                      <Link href={`/customers/${c.id}`} className="text-brand-700 hover:underline">
                        {c.name}
                      </Link>
                    </td>
                    <td className="text-slate-600 dark:text-slate-300">{c.company || "—"}</td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                    <td>
                      <HealthBar score={c.health_score} />
                    </td>
                    <td>
                      <div className="flex justify-end gap-1">
                        <Button
                          type="link"
                          size="small"
                          onClick={() => {
                            setEditing(c);
                            setModalOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                        <Button type="link" size="small" danger onClick={() => onDelete(c)}>
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-slate-500">{total} total</span>
          <Pagination
            current={page}
            pageSize={limit}
            total={total}
            showSizeChanger={false}
            onChange={(p) => setPageNum(p)}
          />
        </div>
      </div>

      <CustomerFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        customer={editing}
      />
    </div>
  );
}
