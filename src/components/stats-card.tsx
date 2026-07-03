import type { LucideIcon } from "lucide-react";

type StatsCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  icon: LucideIcon;
  accent?: "default" | "green" | "amber" | "blue";
};

const accentStyles = {
  default: "bg-zinc-100 text-zinc-700",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  blue: "bg-blue-100 text-blue-700",
};

export function StatsCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "default",
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-zinc-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {value}
          </p>
          {hint ? <p className="mt-1 text-xs text-zinc-400">{hint}</p> : null}
        </div>
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-lg ${accentStyles[accent]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
