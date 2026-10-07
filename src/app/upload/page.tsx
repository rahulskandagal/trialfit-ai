"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { DecisionPill } from "@/components/ui/StatusPill";
import {
  addUploadedPatients,
  clearUploadedPatients,
  removeUploadedPatient,
  useAllPatients,
  useUploadedPatients,
} from "@/lib/data/patientStore";
import { buildCsvTemplate, parseImport, type ImportOutcome } from "@/lib/data/importPatients";
import { trials } from "@/lib/data/trials";
import { findMatchingTrials } from "@/lib/engine/matching";
import { screenPatient } from "@/lib/engine/ruleEngine";
import { PatientVerdictCard } from "@/components/upload/PatientVerdictCard";

export default function UploadPage() {
  const uploaded = useUploadedPatients();
  const allPatients = useAllPatients();
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [fileName, setFileName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validRows = outcome?.rows.filter((r) => r.patient) ?? [];
  const invalidRows = outcome?.rows.filter((r) => !r.patient) ?? [];

  async function onFile(file: File | undefined) {
    setMessage(null);
    if (!file) return;
    if (!/\.(csv|json)$/i.test(file.name)) {
      setOutcome(null);
      setMessage("Unsupported file type. Upload a .csv or .json file.");
      return;
    }
    if (file.size > 2_000_000) {
      setOutcome(null);
      setMessage("File is larger than 2 MB. Split it into smaller files.");
      return;
    }
    setFileName(file.name);
    const text = await file.text();
    const parsed = parseImport(text, file.name, allPatients.map((p) => p.id));
    setOutcome(parsed);
    const valid = parsed.rows.filter((r) => r.patient);
    if (valid.length > 0) {
      addUploadedPatients(valid.map((r) => r.patient!));
      setMessage(
        `Screened ${valid.length} patient${valid.length === 1 ? "" : "s"} against all ${trials.length} protocols. Results are below.` +
          (parsed.rows.length > valid.length ? ` ${parsed.rows.length - valid.length} row(s) were skipped — see the import report.` : "")
      );
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  function downloadTemplate() {
    const blob = new Blob([buildCsvTemplate()], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "trialfit-patient-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  const comparison = useMemo(
    () => uploaded.map((p) => ({ patient: p, results: trials.map((t) => screenPatient(p, t)), best: findMatchingTrials(p)[0] })),
    [uploaded]
  );
  const eligibleAnywhere = comparison.filter((c) => c.results.some((r) => r.decision === "ELIGIBLE")).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Upload patient data</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Import a CSV or JSON file of patients (a single patient record, a list, or a nested clinical record). Each record is validated, then compared against every trial
        protocol by the same deterministic rule engine used everywhere else in the app.
      </p>

      <div className="mt-5 border-l-4 border-clinical-amber-600 bg-clinical-amber-100 p-4 text-sm text-navy-900">
        <p className="font-semibold text-clinical-amber-700">Use de-identified or synthetic data only.</p>
        <p className="mt-1">
          Uploaded files are parsed and stored only in this browser (local storage). Nothing is sent to a server
          or AI service. Identifier columns such as name, date of birth, MRN, phone and email are ignored and
          never imported. This prototype is not approved for real patient records.
        </p>
      </div>

      <div className="mt-6 rounded-sm border border-navy-900/10 bg-white p-5">
        <label htmlFor="patient-file" className="block text-sm font-medium text-navy-800">
          Patient file (.csv or .json, max 2 MB)
        </label>
        <input
          id="patient-file"
          ref={inputRef}
          type="file"
          accept=".csv,.json"
          onChange={(e) => onFile(e.target.files?.[0])}
          className="mt-2 block w-full text-sm text-navy-900 file:mr-3 file:rounded-sm file:border-0 file:bg-navy-800 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-navy-700"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
          <button type="button" onClick={downloadTemplate} className="font-medium text-teal-700 hover:underline">
            Download CSV template
          </button>
          <span className="text-slate-500">
            Required columns: sex, age, primaryDiagnosis. Missing values are treated as unrecorded, so affected
            criteria show as UNKNOWN rather than being guessed. Lists use ; as a separator.
          </span>
        </div>
        {message && <p role="status" className="mt-3 text-sm font-medium text-navy-900">{message}</p>}
      </div>

      {outcome?.fatal && (
        <p role="alert" className="mt-4 text-sm font-medium text-clinical-red-700">{outcome.fatal}</p>
      )}

      {outcome && !outcome.fatal && (
        <section className="mt-6" aria-live="polite">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-700">
            Import report for {fileName} — {validRows.length} imported, {invalidRows.length} skipped
          </h2>
          {outcome.ignoredColumns.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">Ignored fields (not used for screening): {outcome.ignoredColumns.slice(0, 12).join(", ")}{outcome.ignoredColumns.length > 12 ? ` and ${outcome.ignoredColumns.length - 12} more` : ""}</p>
          )}
          <div className="scroll-table mt-3 border border-navy-900/10 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">Row</th>
                  <th scope="col" className="px-3 py-2">Patient</th>
                  <th scope="col" className="px-3 py-2">Status</th>
                  <th scope="col" className="px-3 py-2">Notes</th>
                </tr>
              </thead>
              <tbody>
                {outcome.rows.map((r) => (
                  <tr key={r.rowNumber} className="border-b border-navy-900/5 align-top last:border-0">
                    <td className="px-3 py-2">{r.rowNumber}</td>
                    <td className="px-3 py-2 text-navy-900">
                      {r.patient ? `${r.patient.codeName} · ${r.patient.age} ${r.patient.sex} · ${r.patient.primaryDiagnosis}` : "—"}
                    </td>
                    <td className="px-3 py-2 font-semibold">
                      {r.patient ? <span className="text-clinical-green-700">IMPORTED</span> : <span className="text-clinical-red-700">SKIPPED</span>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-700">
                      {r.errors.map((e) => <p key={e} className="text-clinical-red-700">{e}</p>)}
                      {r.warnings.map((w) => <p key={w}>{w}</p>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-700">
            Eligibility result for each patient
          </h2>
          {uploaded.length > 0 && (
            <button
              type="button"
              onClick={() => { if (window.confirm("Remove all uploaded patients from this browser?")) clearUploadedPatients(); }}
              className="text-sm font-medium text-clinical-red-700 hover:underline"
            >
              Clear all uploaded patients
            </button>
          )}
        </div>

        {uploaded.length === 0 ? (
          <div className="mt-3 border border-dashed border-navy-900/20 bg-white p-8 text-center">
            <p className="font-semibold text-navy-900">No uploaded patients yet.</p>
            <p className="mt-1 text-sm text-slate-600">
              Upload a file and every patient is screened against every protocol automatically. You can also{" "}
              <Link href="/screening" className="font-medium text-teal-700 hover:underline">screen the built-in synthetic patients</Link>.
            </p>
          </div>
        ) : (
          <>
            <p className="mt-2 text-sm text-navy-900">
              {uploaded.length} uploaded patient{uploaded.length === 1 ? "" : "s"}: {eligibleAnywhere} eligible for at least one
              trial. Each result lists the disease, the medicine under study, and the reasons.
            </p>
            <div className="mt-4 space-y-5">
              {uploaded.map((p) => (
                <PatientVerdictCard key={p.id} patient={p} onRemove={() => removeUploadedPatient(p.id)} />
              ))}
            </div>
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-navy-800">Compact comparison matrix (all patients × all trials)</summary>
            <div className="scroll-table mt-3 border border-navy-900/10 bg-white">
              <table className="w-full min-w-[900px] text-left text-sm">
                <caption className="sr-only">Uploaded patients compared with every trial</caption>
                <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-3 py-2">Patient</th>
                    {trials.map((t) => (
                      <th key={t.id} scope="col" className="px-2 py-2" title={t.title}>{t.id}</th>
                    ))}
                    <th scope="col" className="px-3 py-2">Best match</th>
                    <th scope="col" className="px-3 py-2"><span className="sr-only">Remove</span></th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map(({ patient, results, best }) => (
                    <tr key={patient.id} className="border-b border-navy-900/5 align-top last:border-0">
                      <th scope="row" className="px-3 py-2 text-left font-medium text-navy-900">
                        {patient.codeName}
                        <p className="text-xs font-normal text-slate-500">{patient.primaryDiagnosis}</p>
                      </th>
                      {results.map((r) => (
                        <td key={r.trialId} className="px-2 py-2">
                          <Link href={`/screening?patient=${patient.id}&trial=${r.trialId}`} className="block hover:opacity-80" title={r.primaryReason}>
                            <DecisionPill decision={r.decision} />
                            <p className="mt-1 text-xs text-slate-500">
                              {r.matchScorePercent === null ? "Not available" : `${r.matchScorePercent}%`}
                            </p>
                          </Link>
                        </td>
                      ))}
                      <td className="px-3 py-2 text-xs text-navy-900">
                        {best.result.decision === "NOT_ELIGIBLE"
                          ? "No eligible trial found"
                          : `${best.result.trialId} (${best.result.decision.replace("_", " ").toLowerCase()})`}
                      </td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => removeUploadedPatient(patient.id)} className="text-xs font-medium text-clinical-red-700 hover:underline">
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </details>
            <p className="mt-2 text-xs text-slate-500">
              Uploaded patients also appear in Screening, Trial Matching, Protocol Intelligence and Recruitment Radar.
              Decisions come from the rule engine; they are screening support, not clinical determinations.
            </p>
          </>
        )}
      </section>
    </div>
  );
}
