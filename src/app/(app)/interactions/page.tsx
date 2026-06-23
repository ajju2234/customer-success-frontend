"use client";

import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination, Select } from "antd";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import { InteractionFormModal } from "@/components/InteractionFormModal";
import { EmptyState, PageHeader, SentimentBadge, Spinner, TableSkeleton, TypeBadge } from "@/components/ui";
import { customersApi } from "@/lib/api";
import { Customer, InteractionType, Sentiment } from "@/lib/types";
import { fetchInteractions } from "@/store/interactionsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "meeting", label: "Meeting" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
  { value: "note", label: "Note" },
];

const SENTIMENT_OPTIONS = [
  { value: "", label: "All sentiments" },
  { value: "positive", label: "Positive" },
  { value: "neutral", label: "Neutral" },
  { value: "negative", label: "Negative" },
];

function InteractionsInner() {
  const dispatch = useAppDispatch();
  const params = useSearchParams();
  const presetCustomer = params.get("customer_id") || "";

  const { items, total, page, limit, status, error } = useAppSelector((s) => s.interactions);
  const [type, setType] = useState<InteractionType | "">("");
  const [sentiment, setSentiment] = useState<Sentiment | "">("");
  const [pageNum, setPageNum] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const nameById = useMemo(() => {
    const m = new Map<string, string>();
    customers.forEach((c) => m.set(c.id, c.name));
    return m;
  }, [customers]);

  function load() {
    dispatch(
      fetchInteractions({
        page: pageNum,
        limit: 10,
        type: type || undefined,
        sentiment: sentiment || undefined,
        customer_id: presetCustomer || undefined,
      })
    );
  }

  useEffect(() => {
    customersApi.list({ limit: 100 }).then((p) => setCustomers(p.items));
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, sentiment, pageNum, presetCustomer]);

  return (
    <div>
      <PageHeader
        title="Interactions"
        subtitle="Meetings, calls and notes — with AI insights."
        action={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            Log interaction
          </Button>
        }
      />

      <div className="card">
        <div className="mb-4 flex flex-wrap gap-3">
          <Select
            className="w-40"
            value={type}
            onChange={(v) => {
              setPageNum(1);
              setType(v as InteractionType | "");
            }}
            options={TYPE_OPTIONS}
          />
          <Select
            className="w-44"
            value={sentiment}
            onChange={(v) => {
              setPageNum(1);
              setSentiment(v as Sentiment | "");
            }}
            options={SENTIMENT_OPTIONS}
          />
        </div>

        {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        {status === "loading" && items.length === 0 ? (
          <TableSkeleton rows={6} cols={5} />
        ) : items.length === 0 ? (
          <EmptyState title="No interactions found" hint="Log a meeting or call to generate AI insights." />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id}>
                    <td>
                      <Link href={`/interactions/${i.id}`} className="text-brand-700 hover:underline">
                        {i.title}
                      </Link>
                    </td>
                    <td className="text-slate-600 dark:text-slate-300">{nameById.get(i.customer_id) || "—"}</td>
                    <td>
                      <TypeBadge type={i.type} />
                    </td>
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

      <InteractionFormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSaved={load}
        defaultCustomerId={presetCustomer || undefined}
      />
    </div>
  );
}

export default function InteractionsPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <InteractionsInner />
    </Suspense>
  );
}
