"use client";

import { buildRecruitmentRadar } from "@/lib/analytics/recruitmentRadar";
import { useAllPatients } from "@/lib/data/patientStore";
import { trials } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { ScreeningDecision } from "@/lib/types";

const cellStyle: Record<ScreeningDecision, string> = {
  ELIGIBLE: "bg-clinical-green-100 text-clinical-green-700",
  NOT_ELIGIBLE: "bg-clinical-red-100 text-clinical-red-700",
  NEEDS_REVIEW: "bg-clinical-amber-100 text-clinical-amber-700",
};
const cellLabel: Record<ScreeningDecision, string> = { ELIGIBLE: "ELIG", NOT_ELIGIBLE: "NO", NEEDS_REVIEW: "REVIEW" };

export default function RecruitmentRadarPage() {
  const patients = useAllPatients();
  const radar = buildRecruitmentRadar(trials, patients);
  const matrix = patients.map((p) => ({ patient: p, results: trials.map((t) => screenPatient(p, t)) }));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Recruitment radar</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Every figure below is computed live by screening all {patients.length} patients (synthetic plus any you have uploaded) against all{" "}
        {trials.length} protocols. Demo dataset analysis — not real-world recruitment performance.
      </p>

      <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy-700">Recruitment funnel and bottlenecks</h2>
      <div className="mt-3 grid gap-4 lg:grid-cols-2">
        {radar.map((f) => (
          <section key={f.trial.id} className="border border-navy-900/10 bg-white p-4">
            <h3 className="text-sm font-semibold text-navy-900">{f.trial.title}</h3>
            <div className="mt-3 flex h-3 w-full overflow-hidden rounded-sm bg-slate-200" role="img"
              aria-label={`${f.eligible} eligible, ${f.needsReview} needs review, ${f.notEligible} not eligible of ${f.totalScreened}`}>
              <div className="bg-clinical-green-600" style={{ width: `${(f.eligible / f.totalScreened) * 100}%` }} />
              <div className="bg-clinical-amber-600" style={{ width: `${(f.needsReview / f.totalScreened) * 100}%` }} />
              <div className="bg-clinical-red-600" style={{ width: `${(f.notEligible / f.totalScreened) * 100}%` }} />
            </div>
            <p className="mt-2 text-xs text-slate-600">
              {f.eligible} eligible · {f.needsReview} needs review · {f.notEligible} not eligible (of {f.totalScreened})
            </p>
            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Top blocking criteria</p>
            {f.bottlenecks.length === 0 ? (
              <p className="mt-1 text-sm text-slate-600">No mandatory criterion blocks any candidate.</p>
            ) : (
              <ul className="mt-1 space-y-1.5">
                {f.bottlenecks.slice(0, 3).map((b) => (
                  <li key={b.criterionLabel + b.ruleText} className="text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-navy-900">{b.criterionLabel}: <span className="text-slate-600">{b.ruleText}</span></span>
                      <span className="font-semibold text-navy-900">{b.blockedCount}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-100">
                      <div className="h-1.5 bg-clinical-red-600" style={{ width: `${(b.blockedCount / f.totalScreened) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>

      <h2 className="mt-10 text-sm font-semibold uppercase tracking-wide text-navy-700">Eligibility heatmap</h2>
      <p className="mt-1 text-sm text-slate-600">Every patient against every trial. Labels are shown alongside color.</p>
      <div className="scroll-table mt-3 border border-navy-900/10 bg-white">
        <table className="w-full min-w-[720px] text-center text-xs">
          <caption className="sr-only">Patient by trial eligibility matrix</caption>
          <thead className="border-b border-navy-900/10 bg-slate-50 text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Patient</th>
              {trials.map((t) => (
                <th key={t.id} scope="col" className="px-2 py-2 font-semibold">{t.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ patient, results }) => (
              <tr key={patient.id} className="border-b border-navy-900/5 last:border-0">
                <th scope="row" className="px-3 py-1.5 text-left font-medium text-navy-900">{patient.codeName}</th>
                {results.map((r) => (
                  <td key={r.trialId} className="p-1">
                    <span className={`block rounded-sm px-1 py-1.5 font-semibold ${cellStyle[r.decision]}`}>
                      {cellLabel[r.decision]}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-3 grid gap-x-6 gap-y-1 text-xs text-slate-600 sm:grid-cols-2">
        {trials.map((t) => (
          <li key={t.id}><strong>{t.id}</strong> — {t.title}</li>
        ))}
      </ul>
    </div>
  );
}
