"use client";

type FilterSelectProps = {
  label: string;
  value: string;
  allHref: string;
  options: { value: string; label: string; href: string }[];
};

export function FilterSelect({
  label,
  value,
  allHref,
  options,
}: FilterSelectProps) {
  return (
    <label className="text-sm text-zinc-600">
      <span className="mr-2 font-medium">{label}</span>
      <select
        value={value}
        onChange={(e) => {
          const selected = e.target.value;
          if (!selected) {
            window.location.href = allHref;
            return;
          }
          const match = options.find((option) => option.value === selected);
          window.location.href = match?.href ?? allHref;
        }}
        className="rounded-lg border border-zinc-300 px-3 py-1.5 text-sm outline-none"
      >
        <option value="">All</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
