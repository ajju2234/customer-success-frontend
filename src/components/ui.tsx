import { CustomerStatus, InteractionType, Sentiment } from "@/lib/types";

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 dark:border-slate-700 border-t-brand-600" />
      {label || "Loading…"}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
      <p className="font-medium text-slate-600 dark:text-slate-300">{title}</p>
      {hint && <p className="mt-1 text-sm text-slate-400">{hint}</p>}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="table-wrap">
      <table className="table">
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t border-slate-100 dark:border-slate-800">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <div className="skeleton h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- stat card (dashboard) ----
type ChipTone = "green" | "amber" | "red" | "blue" | "slate";
const CHIP_TONES: Record<ChipTone, string> = {
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  slate: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
};

export function StatCard({
  label,
  value,
  chipText,
  chipTone,
  chipIcon,
}: {
  label: string;
  value: React.ReactNode;
  chipText: string;
  chipTone: ChipTone;
  chipIcon?: React.ReactNode;
}) {
  return (
    <div className="card">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
      <span className={`badge mt-3 gap-1 ${CHIP_TONES[chipTone]}`}>
        {chipIcon}
        {chipText}
      </span>
    </div>
  );
}

// ---- health bar (customers) ----
export function HealthBar({ score }: { score: number | null }) {
  if (score == null) return <span className="text-slate-400">—</span>;
  const color = score >= 70 ? "bg-green-500" : score >= 40 ? "bg-amber-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className="text-slate-600 dark:text-slate-300">{score}</span>
    </div>
  );
}

// ---- badges ----
const STATUS_STYLES: Record<CustomerStatus, string> = {
  prospect: "bg-blue-50 text-blue-700",
  active: "bg-green-50 text-green-700",
  at_risk: "bg-amber-50 text-amber-700",
  churned: "bg-red-50 text-red-700",
};

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`badge ${STATUS_STYLES[status]}`}>{status.replace("_", " ")}</span>;
}

const TYPE_STYLES: Record<InteractionType, string> = {
  meeting: "bg-blue-50 text-blue-700",
  call: "bg-violet-50 text-violet-700",
  email: "bg-teal-50 text-teal-700",
  note: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
};

export function TypeBadge({ type }: { type: InteractionType | string }) {
  const cls = TYPE_STYLES[type as InteractionType] ?? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300";
  return <span className={`badge capitalize ${cls}`}>{type}</span>;
}

const SENTIMENT_STYLES: Record<Sentiment, string> = {
  positive: "bg-green-50 text-green-700",
  neutral: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300",
  negative: "bg-red-50 text-red-700",
};

export function SentimentBadge({ sentiment }: { sentiment: Sentiment | null }) {
  if (!sentiment) return <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-400">no insight</span>;
  return <span className={`badge ${SENTIMENT_STYLES[sentiment]}`}>{sentiment}</span>;
}
