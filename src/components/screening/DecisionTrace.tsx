"use client";

import { useState } from "react";
import { CriterionStatusPill } from "@/components/ui/StatusPill";
import type { CriterionEvaluation, ScreeningResult } from "@/lib/types";

function TraceStep({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex gap-3">
      <span className="w-40 shrink-0 text-xs uppercase tracking-wide text-slate-500">{label}</span>
      <span className="text-sm text-navy-900">{value}</span>
    </li>
  );
}

function TraceItem({ evaluation }: { evaluation: CriterionEvaluation }) {
  const { criterion: c } = evaluation;
  const ruleEval =
    evaluation.status === "UNKNOWN"
      ? "Cannot be evaluated — data not recorded"
      : c.category === "inclusion"
        ? evaluation.status === "PASS"
          ? "Value satisfies the inclusion rule"
          : "Value does not satisfy the inclusion rule"
        : evaluation.status === "PASS"
          ? "Patient does not match the exclusion condition"
          : "Patient matches the exclusion condition";

  return (
    <li className="border-b border-navy-900/5 py-4 last:border-0">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-navy-900">{c.label}</p>
        <CriterionStatusPill status={evaluation.status} />
      </div>
      <ol className="mt-2 space-y-1.5 border-l-2 border-teal-600/40 pl-4">
        <TraceStep label="Patient value" value={evaluation.patientValueDisplay} />
        <TraceStep label="Normalized value" value={evaluation.normalizedValueDisplay} />
        <TraceStep label="Protocol rule" value={`${c.category === "inclusion" ? "Inclusion" : "Exclusion"}: ${c.ruleText}`} />
        <TraceStep label="Rule evaluation" value={ruleEval} />
        <TraceStep
          label="Mandatory check"
          value={
            c.mandatory
              ? evaluation.status === "FAIL"
                ? "Mandatory criterion failed — blocks eligibility"
                : evaluation.status === "UNKNOWN"
                  ? "Mandatory criterion unresolved — requires review"
                  : "Mandatory criterion satisfied"
              : "Optional criterion — affects match score only"
          }
        />
      </ol>
    </li>
  );
}

export function DecisionTrace({ result }: { result: ScreeningResult }) {
  const [open, setOpen] = useState(false);
  const decisionText = {
    ELIGIBLE: "All mandatory criteria satisfied → ELIGIBLE",
    NOT_ELIGIBLE: `${result.blockingCriteriaCount} mandatory criterion failed → NOT ELIGIBLE`,
    NEEDS_REVIEW: `${result.unknownCriteriaCount} mandatory criterion unresolved → NEEDS REVIEW`,
  }[result.decision];

  return (
    <div className="rounded-sm border border-navy-900/10 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-navy-800 hover:bg-slate-50"
      >
        <span>View Decision Trace</span>
        <span aria-hidden>{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-navy-900/10 px-4">
          <ul>
            {result.evaluations.map((e) => (
              <TraceItem key={e.criterion.id} evaluation={e} />
            ))}
          </ul>
          <p className="border-t border-navy-900/10 py-3 text-sm font-semibold text-navy-900">
            Final decision: {decisionText}
          </p>
        </div>
      )}
    </div>
  );
}
