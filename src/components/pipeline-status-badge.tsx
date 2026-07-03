import { PIPELINE_STATUSES } from "@/lib/constants";

type PipelineStatusBadgeProps = {
  status: string;
};

export function PipelineStatusBadge({ status }: PipelineStatusBadgeProps) {
  const config = PIPELINE_STATUSES.find((item) => item.value === status);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
        config?.color ?? "bg-zinc-100 text-zinc-600"
      }`}
    >
      {config?.label ?? status}
    </span>
  );
}
