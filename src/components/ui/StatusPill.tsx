import type { CriterionStatus, ScreeningDecision } from "@/lib/types";

const decisionStyles: Record<ScreeningDecision, { bg: string; text: string; border: string; label: string }> = {
  ELIGIBLE: {
    bg: "bg-clinical-green-100",
    text: "text-clinical-green-700",
    border: "border-clinical-green-700/30",
    label: "ELIGIBLE",
  },
  NOT_ELIGIBLE: {
    bg: "bg-clinical-red-100",
    text: "text-clinical-red-700",
    border: "border-clinical-red-700/30",
    label: "NOT ELIGIBLE",
  },
  NEEDS_REVIEW: {
    bg: "bg-clinical-amber-100",
    text: "text-clinical-amber-700",
    border: "border-clinical-amber-700/30",
    label: "NEEDS REVIEW",
  },
};

const criterionStyles: Record<CriterionStatus, { bg: string; text: string; label: string }> = {
  PASS: { bg: "bg-clinical-green-100", text: "text-clinical-green-700", label: "PASS" },
  FAIL: { bg: "bg-clinical-red-100", text: "text-clinical-red-700", label: "FAIL" },
  UNKNOWN: { bg: "bg-clinical-amber-100", text: "text-clinical-amber-700", label: "UNKNOWN" },
};

export function DecisionPill({ decision }: { decision: ScreeningDecision }) {
  const s = decisionStyles[decision];
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-sm border ${s.border} ${s.bg} ${s.text} px-3 py-1 text-sm font-semibold tracking-wide`}
    >
      <span aria-hidden className="h-2 w-2 rounded-full bg-current" />
      {s.label}
    </span>
  );
}

export function CriterionStatusPill({ status }: { status: CriterionStatus }) {
  const s = criterionStyles[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-sm ${s.bg} ${s.text} px-2 py-0.5 text-xs font-semibold`}>
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
