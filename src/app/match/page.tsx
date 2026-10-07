"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PatientSelector } from "@/components/screening/PatientSelector";
import { DecisionPill } from "@/components/ui/StatusPill";
import { findMatchingTrials } from "@/lib/engine/matching";
import { useAllPatients } from "@/lib/data/patientStore";
import { getTrialById } from "@/lib/data/trials";

function MatchWorkspace() {
  const params = useSearchParams();
  const [patientId, setPatientId] = useState(params.get("patient") ?? "");
  const [ran, setRan] = useState(Boolean(params.get("patient")));
  const [error, setError] = useState<string | null>(null);
  const allPatients = useAllPatients();
  const patient = allPatients.find((p) => p.id === patientId);

  const matches = useMemo(() => (patient && ran ? findMatchingTrials(patient) : []), [patient, ran]);
  const eligibleCount = matches.filter((m) => m.result.decision === "ELIGIBLE").length;
  const reviewCount = matches.filter((m) => m.result.decision === "NEEDS_REVIEW").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Multi-trial matching</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Screen one synthetic patient against every protocol in the catalog. Results are ranked by decision,
        then by the share of applicable criteria satisfied.
      </p>

      <div className="mt-6 max-w-xl rounded-sm border border-navy-900/10 bg-white p-5">
        <PatientSelector value={patientId} onChange={(v) => { setPatientId(v); setRan(false); setError(null); }} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => (patient ? (setRan(true), setError(null)) : setError("Select a synthetic patient to begin screening."))}
            className="rounded-sm bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
          >
            Find Matching Trials
          </button>
          {error && <p role="alert" className="text-sm font-medium text-clinical-red-700">{error}</p>}
        </div>
      </div>

      <div className="mt-8">
        {!ran || !patient ? (
          <div className="border border-dashed border-navy-900/20 bg-white p-8 text-center">
            <p className="font-semibold text-navy-900">Your matching workspace is ready.</p>
            <p className="mt-1 text-sm text-slate-600">Select a synthetic patient to evaluate every trial protocol.</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-navy-900" aria-live="polite">
              <strong>{patient.codeName}</strong>: {eligibleCount} eligible, {reviewCount} needing review,{" "}
              {matches.length - eligibleCount - reviewCount} not eligible across {matches.length} protocols.
            </p>
            {eligibleCount === 0 && (
              <p className="mt-1 text-sm text-slate-600">
                No eligible trials found. Review the failed criteria or search another protocol.
              </p>
            )}
            <div className="scroll-table mt-4 rounded-sm border border-navy-900/10 bg-white">
              <table className="w-full min-w-[720px] text-left text-sm">
                <caption className="sr-only">Trial matches ranked for {patient.codeName}</caption>
                <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">Trial</th>
                    <th scope="col" className="px-3 py-2">Decision</th>
                    <th scope="col" className="px-3 py-2">Match score</th>
                    <th scope="col" className="px-3 py-2">Primary reason</th>
                    <th scope="col" className="px-3 py-2"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map(({ result }) => {
                    const trial = getTrialById(result.trialId)!;
                    return (
                      <tr key={trial.id} className="border-b border-navy-900/5 align-top last:border-0">
                        <td className="px-3 py-3">
                          <p className="font-medium text-navy-900">{trial.title}</p>
                          <p className="text-xs text-slate-500">{trial.phase} · {trial.therapeuticArea}</p>
                        </td>
                        <td className="px-3 py-3"><DecisionPill decision={result.decision} /></td>
                        <td className="px-3 py-3 text-navy-900">
                          {result.matchScorePercent === null ? "Not available" : `${result.matchScorePercent}%`}
                          <p className="text-xs text-slate-500">
                            {result.mandatoryPassedCount}/{result.mandatoryTotalCount} mandatory passed
                          </p>
                        </td>
                        <td className="px-3 py-3 text-slate-700">{result.primaryReason}</td>
                        <td className="px-3 py-3">
                          <Link
                            href={`/screening?patient=${patient.id}&trial=${trial.id}`}
                            className="whitespace-nowrap text-sm font-medium text-teal-700 hover:underline"
                          >
                            View Decision Trace
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={null}>
      <MatchWorkspace />
    </Suspense>
  );
}
