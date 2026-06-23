"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { useConfirm } from "@/components/ConfirmDialog";
import { InsightPanel } from "@/components/InsightPanel";
import { useToast } from "@/components/Toast";
import { EmptyState, Spinner } from "@/components/ui";
import { apiError, interactionsApi } from "@/lib/api";
import { Interaction } from "@/lib/types";

export default function InteractionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const confirm = useConfirm();
  const toast = useToast();

  const [interaction, setInteraction] = useState<Interaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setInteraction(await interactionsApi.get(id));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function regenerate() {
    setRegenerating(true);
    try {
      await interactionsApi.regenerate(id);
      await load();
      toast.success("AI insight regenerated");
    } catch (e) {
      toast.error(apiError(e, "Could not regenerate insight"));
    } finally {
      setRegenerating(false);
    }
  }

  async function onDelete() {
    const ok = await confirm({
      title: "Delete interaction",
      message: "This interaction and its AI insight will be removed.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await interactionsApi.remove(id);
      toast.success("Interaction deleted");
      router.replace("/interactions");
    } catch (e) {
      toast.error(apiError(e, "Could not delete interaction"));
    }
  }

  if (loading) return <Spinner />;
  if (!interaction) return <EmptyState title="Interaction not found" />;

  return (
    <div className="space-y-6">
      <Link href="/interactions" className="text-sm text-brand-600 hover:underline">
        ← Back to interactions
      </Link>

      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{interaction.title}</h1>
            <p className="mt-1 text-sm capitalize text-slate-500">
              {interaction.type} · {new Date(interaction.meeting_date).toLocaleString()}
            </p>
          </div>
          <Button danger icon={<DeleteOutlined />} onClick={onDelete}>
            Delete
          </Button>
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-500">Notes</p>
          <p className="mt-1 whitespace-pre-wrap text-slate-800 dark:text-slate-100">
            {interaction.notes || "No notes recorded."}
          </p>
        </div>
      </div>

      <InsightPanel
        insight={interaction.insight}
        onRegenerate={regenerate}
        regenerating={regenerating}
      />
    </div>
  );
}
