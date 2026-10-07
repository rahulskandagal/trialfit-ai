export function SyntheticDataBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border border-teal-600/40 bg-teal-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700 ${className}`}
      title="All patients and trials in this demonstration are synthetic. No real patient data is used."
    >
      <span aria-hidden>●</span>
      Synthetic Data
    </span>
  );
}
