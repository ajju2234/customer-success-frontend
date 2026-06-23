"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "antd";

import { useConfirm } from "@/components/ConfirmDialog";
import { CustomerFormModal } from "@/components/CustomerFormModal";
import { useToast } from "@/components/Toast";
import { EmptyState, SentimentBadge, Spinner, StatusBadge } from "@/components/ui";
import { Customer, Interaction } from "@/lib/types";
import { customersApi, interactionsApi } from "@/lib/api";
import { deleteCustomer } from "@/store/customersSlice";
import { useAppDispatch } from "@/store/hooks";

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const confirm = useConfirm();
  const toast = useToast();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [c, ints] = await Promise.all([
        customersApi.get(id),
        interactionsApi.list({ customer_id: id, limit: 50 }),
      ]);
      setCustomer(c);
      setInteractions(ints.items);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Spinner />;
  if (!customer) return <EmptyState title="Customer not found" />;

  async function onDelete() {
    const ok = await confirm({
      title: "Delete customer",
      message: `Delete "${customer!.name}"? This also removes its interactions.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    const res = await dispatch(deleteCustomer(customer!.id));
    if (deleteCustomer.fulfilled.match(res)) {
      toast.success("Customer deleted");
      router.replace("/customers");
    } else {
      toast.error((res.payload as string) || "Could not delete customer");
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/customers" className="text-sm text-brand-600 hover:underline">
        ← Back to customers
      </Link>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-slate-500">{customer.company || "No company"}</p>
            <div className="mt-2">
              <StatusBadge status={customer.status} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setEditOpen(true)}>Edit</Button>
            <Button danger onClick={onDelete}>
              Delete
            </Button>
          </div>
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <dt className="text-slate-400">Email</dt>
            <dd>{customer.email || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Phone</dt>
            <dd>{customer.phone || "—"}</dd>
          </div>
          <div>
            <dt className="text-slate-400">Health score</dt>
            <dd>{customer.health_score ?? "—"}</dd>
          </div>
        </dl>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Interactions ({interactions.length})</h2>
          <Link href={`/interactions?customer_id=${customer.id}`}>
            <Button type="primary">+ Log interaction</Button>
          </Link>
        </div>
        {interactions.length === 0 ? (
          <EmptyState title="No interactions yet" hint="Log a meeting or call to generate AI insights." />
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {interactions.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link href={`/interactions/${i.id}`} className="text-brand-700 hover:underline">
                        {i.title}
                      </Link>
                    </td>
                    <td className="capitalize text-slate-600 dark:text-slate-300">{i.type}</td>
                    <td className="text-slate-600 dark:text-slate-300">{new Date(i.meeting_date).toLocaleDateString()}</td>
                    <td>
                      <SentimentBadge sentiment={i.insight?.sentiment ?? null} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CustomerFormModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSaved={load}
        customer={customer}
      />
    </div>
  );
}
