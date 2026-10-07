import Link from "next/link";
import { DecisionPill } from "@/components/ui/StatusPill";
import { trials } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import { buildVerdict } from "@/lib/explain/verdict";
import type { Patient, ScreeningDecision } from "@/lib/types";

const rank: Record<ScreeningDecision, number> = { ELIGIBLE: 0, NEEDS_REVIEW: 1, NOT_ELIGIBLE: 2 };
const marker = { PASS: "MET", FAIL: "NOT MET", UNKNOWN: "MISSING" } as const;
const markerStyle = {
  PASS: "text-clinical-green-700",
  FAIL: "text-clinical-red-700",
  UNKNOWN: "text-clinical-amber-700",
} as const;

export function PatientVerdictCard({ patient, onRemove }: { patient: Patient; onRemove: () => void }) {
  const rows = trials
    .map((trial) => {
      const result = screenPatient(patient, trial);
      return { trial, result, verdict: buildVerdict(result, patient) };
    })
    .sort((a, b) => rank[a.result.decision] - rank[b.result.decision]);

  const relevant = rows.filter((r) => r.verdict.diseaseMatches);
  const others = rows.filter((r) => !r.verdict.diseaseMatches);
  const eligible = rows.filter((r) => r.result.decision === "ELIGIBLE").length;
  const review = rows.filter((r) => r.result.decision === "NEEDS_REVIEW").length;

  return (
    <article className="border border-navy-900/10 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-navy-900/10 bg-slate-50 px-4 py-3">
        <div>
          <h3 className="text-base font-semibold text-navy-900">{patient.codeName}</h3>
          <p className="text-sm text-slate-600">
            {patient.age} · {patient.sex} · {patient.primaryDiagnosis}
          </p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold text-navy-900">
            {eligible > 0
              ? `Eligible for ${eligible} trial${eligible === 1 ? "" : "s"}`
              : review > 0
                ? "Not yet eligible for any trial"
                : "Not eligible for any trial"}
          </p>
          {review > 0 && <p className="text-clinical-amber-700">{review} need{review === 1 ? "s" : ""} more information</p>}
          <button type="button" onClick={onRemove} className="mt-1 text-xs font-medium text-clinical-red-700 hover:underline">
            Remove patient
          </button>
        </div>
      </header>

      <div className="divide-y divide-navy-900/10">
        {relevant.length === 0 && (
          <p className="px-4 py-4 text-sm text-slate-700">
            No protocol in the catalog targets this patient&apos;s recorded diagnosis, so no trial can be matched on
            disease. Check the diagnosis in the file.
          </p>
        )}
        {relevant.map(({ trial, result, verdict }) => (
          <section key={trial.id} className="px-4 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-navy-900">{trial.title}</p>
                <p className="mt-0.5 text-xs text-slate-600">
                  <span className="font-medium">Disease:</span> {trial.condition} ·{" "}
                  <span className="font-medium">Medicine under study:</span> {trial.investigationalAgent}
                </p>
              </div>
              <DecisionPill decision={result.decision} />
            </div>
            <p className="mt-3 text-sm font-medium text-navy-900">{verdict.headline}</p>
            <ul className="mt-2 space-y-1.5">
              {verdict.reasons.map((r) => (
                <li key={r.text} className="flex gap-2 text-sm text-slate-700">
                  <span className={`w-16 shrink-0 text-xs font-bold ${markerStyle[r.status]}`}>{marker[r.status]}</span>
                  <span>{r.text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-slate-500">
              Match score {result.matchScorePercent === null ? "not available" : `${result.matchScorePercent}%`} (share of
              evaluable criteria satisfied) ·{" "}
              <Link href={`/screening?patient=${patient.id}&trial=${trial.id}`} className="font-medium text-teal-700 hover:underline">
                View full decision trace
              </Link>
            </p>
          </section>
        ))}

        {others.length > 0 && relevant.length > 0 && (
          <details className="px-4 py-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">
              Other trials — the patient&apos;s disease does not match ({others.length})
            </summary>
            <ul className="mt-2 space-y-1 text-sm text-slate-700">
              {others.map(({ trial }) => (
                <li key={trial.id}>
                  <strong>{trial.id}</strong> {trial.condition} ({trial.investigationalAgent}): not eligible — the patient&apos;s
                  diagnosis is not {trial.condition}.
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );
}
