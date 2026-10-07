"use client";

import { useEffect, useMemo, useState } from "react";
import { DecisionPill } from "@/components/ui/StatusPill";
import { CriteriaTable } from "@/components/screening/CriteriaTable";
import { DecisionTrace } from "@/components/screening/DecisionTrace";
import { WhatIfPanel } from "@/components/screening/WhatIfPanel";
import { generateDeterministicExplanation } from "@/lib/explain/explanationEngine";
import type { Patient, ScreeningResult, Trial } from "@/lib/types";

interface Explanation {
  text: string;
  mode: "ai" | "deterministic";
  reason?: "not_configured" | "unavailable" | "local_only";
}

const accent = {
  ELIGIBLE: "border-clinical-green-600",
  NOT_ELIGIBLE: "border-clinical-red-600",
  NEEDS_REVIEW: "border-clinical-amber-600",
} as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-700">{title}</h3>
      {children}
    </section>
  );
}

export function ScreeningResultView({
  patient,
  trial,
  result,
}: {
  patient: Patient;
  trial: Trial;
  result: ScreeningResult;
}) {
  const [remoteExplanation, setRemoteExplanation] = useState<Explanation | null>(null);
  const isUploaded = patient.source === "uploaded";

  // Uploaded records stay in the browser: no server or AI call is made for them.
  const localExplanation = useMemo<Explanation | null>(
    () =>
      isUploaded
        ? { text: generateDeterministicExplanation(patient, trial, result), mode: "deterministic", reason: "local_only" }
        : null,
    [isUploaded, patient, trial, result]
  );
  const explanation = localExplanation ?? remoteExplanation;

  useEffect(() => {
    if (isUploaded) return;
    let cancelled = false;
    fetch("/api/explain", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ patientId: patient.id, trialId: trial.id }),
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("request failed"))))
      .then((data: Explanation) => !cancelled && setRemoteExplanation(data))
      .catch(() => {
        if (cancelled) return;
        setRemoteExplanation({
          text: generateDeterministicExplanation(patient, trial, result),
          mode: "deterministic",
          reason: "unavailable",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [isUploaded, patient, trial, result]);

  const missing = result.evaluations.filter((e) => e.status === "UNKNOWN");
  const blocking = result.evaluations.filter((e) => e.criterion.mandatory && e.status === "FAIL");

  return (
    <div>
      <div className={`border-l-4 ${accent[result.decision]} bg-white p-5 shadow-sm`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Final decision · rule engine</p>
            <div className="mt-2">
              <DecisionPill decision={result.decision} />
            </div>
            <p className="mt-3 max-w-xl text-base text-navy-900">{result.primaryReason}</p>
            {blocking[0] && (
              <dl className="mt-3 grid max-w-md grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt className="text-slate-500">Primary blocking criterion</dt>
                <dd className="font-medium text-navy-900">{blocking[0].criterion.label}</dd>
                <dt className="text-slate-500">Patient value</dt>
                <dd className="text-navy-900">{blocking[0].patientValueDisplay}</dd>
                <dt className="text-slate-500">Required</dt>
                <dd className="text-navy-900">{blocking[0].criterion.ruleText}</dd>
                <dt className="text-slate-500">Status</dt>
                <dd className="font-semibold text-clinical-red-700">FAIL</dd>
              </dl>
            )}
          </div>
          <div className="min-w-[200px] border-l border-navy-900/10 pl-5">
            <p className="text-xs uppercase tracking-wide text-slate-500">Match score</p>
            <p className="mt-1 text-4xl font-semibold text-navy-900">
              {result.matchScorePercent === null ? "Not available" : `${result.matchScorePercent}%`}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              {result.matchScorePercent === null
                ? "No evaluable criteria."
                : `${result.matchScorePercent}% of applicable criteria satisfied.`}
            </p>
            <dl className="mt-3 space-y-0.5 text-xs text-slate-700">
              <div className="flex justify-between gap-4">
                <dt>Mandatory passed</dt>
                <dd className="font-semibold">{result.mandatoryPassedCount} / {result.mandatoryTotalCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Blocking criteria</dt>
                <dd className="font-semibold">{result.blockingCriteriaCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Unknown criteria</dt>
                <dd className="font-semibold">{result.unknownCriteriaCount}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <Section title="Criteria analysis">
        <CriteriaTable evaluations={result.evaluations} />
      </Section>

      <Section title="Decision trace">
        <DecisionTrace result={result} />
      </Section>

      <Section title="AI explanation">
        <div className="rounded-sm border border-navy-900/10 bg-white p-4">
          {explanation === null ? (
            <p className="text-sm text-slate-500" role="status">Preparing explanation…</p>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-navy-900">{explanation.text}</p>
              <p className="mt-3 border-t border-navy-900/10 pt-3 text-xs text-slate-500">
                {explanation.mode === "ai"
                  ? "AI-generated narration of the rule engine's result. The decision above was made by the deterministic engine."
                  : explanation.reason === "local_only"
                    ? "Deterministic explanation mode — uploaded patient data stays in your browser and is never sent to an AI service."
                    : explanation.reason === "unavailable"
                    ? "AI explanation service unavailable. Using deterministic explanation mode."
                    : "Deterministic explanation mode — no AI service is configured for this deployment. The text is generated directly from the decision trace."}
              </p>
            </>
          )}
        </div>
      </Section>

      <Section title="Missing information">
        {missing.length === 0 ? (
          <p className="text-sm text-slate-600">No missing information. Every criterion could be evaluated.</p>
        ) : (
          <div className="border-l-4 border-clinical-amber-600 bg-clinical-amber-100 p-4">
            <p className="text-sm font-semibold text-clinical-amber-700">
              Additional information is required before eligibility can be determined.
            </p>
            <ul className="mt-2 space-y-1 text-sm text-navy-900">
              {missing.map((e) => (
                <li key={e.criterion.id}>
                  <strong>{e.criterion.label}</strong> ({e.criterion.ruleText}) — required information is
                  unavailable. This criterion cannot be conclusively evaluated.
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <Section title="What-if simulator">
        <div className="rounded-sm border border-navy-900/10 bg-white p-4">
          <WhatIfPanel key={`${patient.id}-${trial.id}`} patient={patient} trial={trial} result={result} />
        </div>
      </Section>
    </div>
  );
}
