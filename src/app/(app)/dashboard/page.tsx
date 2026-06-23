"use client";

import {
  ArrowUpOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import Link from "next/link";
import { useEffect } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useThemeMode } from "@/components/Providers";
import { EmptyState, SentimentBadge, Spinner, StatCard, TypeBadge } from "@/components/ui";
import { InteractionType, Sentiment } from "@/lib/types";
import { fetchMetrics } from "@/store/dashboardSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

const STATUS_COLORS: Record<string, string> = {
  prospect: "#60a5fa",
  active: "#22c55e",
  at_risk: "#f59e0b",
  churned: "#ef4444",
};
const SENTIMENT_META: { key: Sentiment; label: string; color: string }[] = [
  { key: "neutral", label: "Neutral", color: "#94a3b8" },
  { key: "positive", label: "Positive", color: "#22c55e" },
  { key: "negative", label: "Negative", color: "#ef4444" },
];

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { dark } = useThemeMode();
  const { metrics, status, error } = useAppSelector((s) => s.dashboard);

  const axisColor = dark ? "#94a3b8" : "#64748b";
  const gridColor = dark ? "#1e293b" : "#e2e8f0";
  const tooltipStyle = {
    background: dark ? "#1e293b" : "#ffffff",
    border: `1px solid ${dark ? "#334155" : "#e2e8f0"}`,
    borderRadius: 8,
    fontSize: 12,
    boxShadow: "0 4px 14px rgba(0,0,0,0.12)",
  } as const;

  useEffect(() => {
    dispatch(fetchMetrics());
  }, [dispatch]);

  // Only show the full-page spinner on the very first load; keep showing the
  // existing dashboard while a refetch happens (no flash on revisit).
  if ((status === "loading" || status === "idle") && !metrics)
    return <Spinner label="Loading metrics…" />;
  if (error && !metrics) return <EmptyState title="Could not load dashboard" hint={error} />;
  if (!metrics) return null;

  const statusData = Object.entries(metrics.customers_by_status).map(([name, value]) => ({
    name,
    value,
  }));
  const sentimentTotal = SENTIMENT_META.reduce(
    (sum, s) => sum + (metrics.sentiment_breakdown[s.key] || 0),
    0
  );
  const sentimentData = SENTIMENT_META.map((s) => ({
    ...s,
    value: metrics.sentiment_breakdown[s.key] || 0,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex gap-2">
          <span className="badge bg-blue-50 text-blue-600">
            {metrics.cached ? "Cached" : "Live"}
          </span>
          <span className="badge bg-brand-50 text-brand-700">
            Scope: {metrics.scope === "all" ? "All" : "Mine"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total customers"
          value={metrics.total_customers}
          chipTone="green"
          chipText="All time"
          chipIcon={<ArrowUpOutlined />}
        />
        <StatCard
          label="At risk"
          value={metrics.at_risk_count}
          chipTone={metrics.at_risk_count > 0 ? "amber" : "green"}
          chipText={metrics.at_risk_count > 0 ? "Needs attention" : "All clear"}
          chipIcon={metrics.at_risk_count > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
        />
        <StatCard
          label="Interactions"
          value={metrics.total_interactions}
          chipTone="blue"
          chipText="Last 14 days"
          chipIcon={<CalendarOutlined />}
        />
        <StatCard
          label="Open risks"
          value={metrics.open_risks_count}
          chipTone={metrics.open_risks_count > 0 ? "red" : "green"}
          chipText={metrics.open_risks_count > 0 ? "Open" : "Clear"}
          chipIcon={metrics.open_risks_count > 0 ? <WarningOutlined /> : <CheckCircleOutlined />}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="mb-3 font-semibold">Customers by status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis
                dataKey="name"
                tickFormatter={(v) => v.replace("_", " ")}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fill: axisColor, fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: gridColor }}
              />
              <Tooltip
                cursor={{ fill: dark ? "rgba(148,163,184,0.10)" : "rgba(99,102,241,0.06)", radius: 6 }}
                contentStyle={tooltipStyle}
                labelStyle={{ color: dark ? "#cbd5e1" : "#334155", textTransform: "capitalize" }}
                itemStyle={{ color: dark ? "#e2e8f0" : "#0f172a" }}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                {statusData.map((d) => (
                  <Cell key={d.name} fill={STATUS_COLORS[d.name] ?? "#6366f1"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="mb-3 font-semibold">Sentiment breakdown</h2>
          <div className="flex items-center gap-8">
            <div className="relative" style={{ width: 140, height: 150 }}>
              <PieChart width={140} height={150}>
                <Pie
                  data={sentimentTotal ? sentimentData : [{ label: "none", value: 1, color: "#e2e8f0" }]}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={48}
                  outerRadius={68}
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {(sentimentTotal ? sentimentData : [{ color: "#e2e8f0" }]).map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
              <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-800 dark:text-slate-100">
                {sentimentTotal}
              </div>
            </div>
            <ul className="space-y-2 text-sm">
              {sentimentData.map((s) => (
                <li key={s.key} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />
                  {s.label} ({s.value})
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-semibold">Recent interactions</h2>
        {metrics.recent_interactions.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing yet.</p>
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
                {metrics.recent_interactions.map((r) => (
                  <tr key={r.id}>
                    <td>
                      <Link href={`/interactions/${r.id}`} className="text-brand-700 hover:underline">
                        {r.title}
                      </Link>
                    </td>
                    <td className="text-slate-600 dark:text-slate-300">{r.customer_name}</td>
                    <td>
                      <TypeBadge type={r.type as InteractionType} />
                    </td>
                    <td className="text-slate-600 dark:text-slate-300">{new Date(r.meeting_date).toLocaleDateString()}</td>
                    <td>
                      <SentimentBadge sentiment={r.sentiment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
