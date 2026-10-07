"use client";

import { useMemo, useState } from "react";
import { Select } from "@/components/ui/Select";
import { DecisionPill } from "@/components/ui/StatusPill";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { Patient, ScreeningResult, Trial } from "@/lib/types";

type Override = number | boolean | string | undefined;

const ENUM_OPTIONS: Partial<Record<keyof Patient, string[]>> = {
  brcaMutation: ["positive", "negative"],
  pregnancyStatus: ["not_pregnant", "pregnant", "not_applicable"],
};

export function WhatIfPanel({
  patient,
  trial,
  result,
}: {
  patient: Patient;
  trial: Trial;
  result: ScreeningResult;
}) {
  const [overrides, setOverrides] = useState<Partial<Record<keyof Patient, Override>>>({});

  const editable = result.evaluations.filter(
    (e) =>
      e.status !== "PASS" &&
      e.criterion.operator !== "includesTag" &&
      e.criterion.operator !== "includesTherapy" &&
      e.criterion.field !== "age"
  );

  const simulated = useMemo(() => {
    const clean = Object.fromEntries(
      Object.entries(overrides).filter(([, v]) => v !== undefined && v !== "")
    );
    return screenPatient({ ...patient, ...clean } as Patient, trial);
  }, [overrides, patient, trial]);

  const changed = Object.values(overrides).some((v) => v !== undefined && v !== "");

  if (editable.length === 0) {
    return (
      <p className="text-sm text-slate-600">
        No failed or unresolved criteria are adjustable for this patient — every editable criterion already passes.
      </p>
    );
  }

  return (
    <div>
      <p className="text-sm text-slate-600">
        Adjust a failed or unrecorded value to see whether the decision would change. This runs the same
        rule engine on a temporary copy; the synthetic dataset is never modified.
      </p>
      <div className="mt-4 space-y-4">
        {editable.map((e) => {
          const field = e.criterion.field;
          const enumOpts = ENUM_OPTIONS[field];
          const isBool = e.criterion.operator === "isTrue" || e.criterion.operator === "isFalse";
          const current = overrides[field];
          return (
            <div key={e.criterion.id} className="grid gap-2 sm:grid-cols-[1fr_200px] sm:items-end">
              <div>
                <label htmlFor={`whatif-${e.criterion.id}`} className="block text-sm font-medium text-navy-900">
                  {e.criterion.label}
                </label>
                <p className="text-xs text-slate-500">
                  Rule: {e.criterion.ruleText} · Current: {e.patientValueDisplay}
                </p>
              </div>
              {enumOpts ? (
                <Select
                  id={`whatif-${e.criterion.id}`}
                  value={(current as string) ?? ""}
                  onChange={(v) => setOverrides((o) => ({ ...o, [field]: v || undefined }))}
                  placeholder="Unchanged"
                  options={enumOpts.map((o) => ({ value: o, label: o.replace("_", " ") }))}
                />
              ) : isBool ? (
                <Select
                  id={`whatif-${e.criterion.id}`}
                  value={current === undefined ? "" : String(current)}
                  onChange={(v) => setOverrides((o) => ({ ...o, [field]: v === "" ? undefined : v === "true" }))}
                  placeholder="Unchanged"
                  options={[{ value: "true", label: "Yes" }, { value: "false", label: "No" }]}
                />
              ) : (
                <input
                  id={`whatif-${e.criterion.id}`}
                  type="number"
                  step="any"
                  placeholder="New value"
                  value={current === undefined ? "" : String(current)}
                  onChange={(ev) =>
                    setOverrides((o) => ({ ...o, [field]: ev.target.value === "" ? undefined : Number(ev.target.value) }))
                  }
                  className="rounded-sm border border-navy-900/20 bg-white px-3 py-2 text-sm"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-navy-900/10 pt-4" aria-live="polite">
        <span className="text-sm text-slate-600">{changed ? "Simulated decision:" : "Original decision:"}</span>
        <DecisionPill decision={simulated.decision} />
        {changed && simulated.decision !== result.decision && (
          <span className="text-sm font-medium text-navy-900">
            Decision changes from {result.decision.replace("_", " ")} to {simulated.decision.replace("_", " ")}.
          </span>
        )}
        {changed && simulated.decision === result.decision && (
          <span className="text-sm text-slate-600">The decision does not change with these adjustments.</span>
        )}
        {changed && (
          <button
            type="button"
            onClick={() => setOverrides({})}
            className="ml-auto text-sm font-medium text-teal-700 hover:underline"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
