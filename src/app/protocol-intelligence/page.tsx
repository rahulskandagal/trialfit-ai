"use client";

import { useMemo, useState } from "react";
import { trials } from "@/lib/data/trials";
import { useAllPatients } from "@/lib/data/patientStore";
import { parseProtocolText, type ParsedLine } from "@/lib/protocol/protocolParser";
import { screenPatient } from "@/lib/engine/ruleEngine";
import { simulateProtocolChange } from "@/lib/analytics/protocolImpact";
import { Select } from "@/components/ui/Select";
import { DecisionPill } from "@/components/ui/StatusPill";
import type { Patient, Trial } from "@/lib/types";

export default function ProtocolIntelligencePage() {
  const patients = useAllPatients();
  const [sampleId, setSampleId] = useState(trials[0].id);
  const [text, setText] = useState(trials[0].protocolText);
  const [parsed, setParsed] = useState<ParsedLine[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  function analyze() {
    if (text.trim().length === 0) {
      setError("Paste or select protocol criteria text to analyze.");
      return;
    }
    setError(null);
    setParsed(parseProtocolText(text));
  }

  const structured = parsed?.filter((p) => p.criterion) ?? [];
  const unparsed = parsed?.filter((p) => !p.criterion) ?? [];

  const parsedTrial: Trial | null = useMemo(
    () =>
      structured.length === 0
        ? null
        : {
            id: "PARSED",
            title: "Parsed protocol",
            phase: "—",
            therapeuticArea: "—",
            condition: "—",
            investigationalAgent: "—",
            sponsorLabel: "Synthetic / user-supplied text",
            summary: "",
            protocolText: text,
            criteria: structured.map((s) => s.criterion!),
          },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parsed]
  );

  const candidatePool = useMemo(
    () =>
      parsedTrial
        ? patients.map((p) => ({ patient: p, result: screenPatient(p, parsedTrial) }))
        : [],
    [parsedTrial, patients]
  );
  const eligible = candidatePool.filter((c) => c.result.decision === "ELIGIBLE").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Protocol intelligence</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Convert natural-language trial criteria into auditable eligibility rules, then see how many synthetic
        patients qualify. Phrases the parser does not recognise are flagged for manual review, never guessed.
      </p>

      <div className="mt-6 rounded-sm border border-navy-900/10 bg-white p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <label htmlFor="protocol-sample" className="block text-sm font-medium text-navy-800">
              Load a sample protocol
            </label>
            <Select
              id="protocol-sample"
              value={sampleId}
              onChange={(v) => {
                setSampleId(v);
                const t = trials.find((x) => x.id === v);
                if (t) {
                  setText(t.protocolText);
                  setParsed(null);
                }
              }}
              className="mt-1.5 min-w-[22rem] max-w-full"
              options={trials.map((t) => ({ value: t.id, label: t.title }))}
            />
          </div>
          <p className="text-xs text-slate-500">Use &ldquo;Inclusion Criteria:&rdquo; and &ldquo;Exclusion Criteria:&rdquo; headings, one criterion per line.</p>
        </div>
        <label htmlFor="protocol-text" className="mt-4 block text-sm font-medium text-navy-800">
          Protocol criteria text
        </label>
        <textarea
          id="protocol-text"
          value={text}
          onChange={(e) => { setText(e.target.value); setParsed(null); }}
          rows={10}
          className="mt-1.5 w-full rounded-sm border border-navy-900/20 bg-white px-3 py-2 font-mono text-sm text-navy-900"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={analyze}
            className="rounded-sm bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-navy-700"
          >
            Analyze Protocol
          </button>
          {error && <p role="alert" className="text-sm font-medium text-clinical-red-700">{error}</p>}
        </div>
      </div>

      {parsed && (
        <div className="mt-8" aria-live="polite">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-700">
            Structured criteria — {structured.length} parsed, {unparsed.length} need manual review
          </h2>
          <div className="scroll-table mt-3 rounded-sm border border-navy-900/10 bg-white">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th scope="col" className="px-3 py-2">Source text</th>
                  <th scope="col" className="px-3 py-2">Type</th>
                  <th scope="col" className="px-3 py-2">Structured rule</th>
                  <th scope="col" className="px-3 py-2">Patient field</th>
                </tr>
              </thead>
              <tbody>
                {parsed.map((p, i) => (
                  <tr key={i} className="border-b border-navy-900/5 last:border-0">
                    <td className="px-3 py-2.5 text-slate-700">{p.rawText}</td>
                    <td className="px-3 py-2.5 capitalize text-slate-600">{p.category}</td>
                    <td className="px-3 py-2.5 text-navy-900">
                      {p.criterion ? p.criterion.ruleText : (
                        <span className="font-medium text-clinical-amber-700">Requires manual review — not recognised</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-600">{p.criterion?.field ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsedTrial && (
            <>
              <h2 className="mt-8 text-sm font-semibold uppercase tracking-wide text-navy-700">
                Candidate pool under this protocol
              </h2>
              <p className="mt-2 text-sm text-navy-900">
                <strong>{eligible}</strong> of {patients.length} patients are eligible under the
                parsed rules. <span className="text-slate-500">(Demo dataset analysis.)</span>
              </p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {candidatePool.map(({ patient, result }) => (
                  <li key={patient.id} className="flex items-center justify-between gap-3 border border-navy-900/10 bg-white px-3 py-2 text-sm">
                    <span className="text-navy-900">{patient.codeName}</span>
                    <DecisionPill decision={result.decision} />
                  </li>
                ))}
              </ul>

              <ProtocolImpact trial={parsedTrial} pool={patients} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ProtocolImpact({ trial, pool }: { trial: Trial; pool: Patient[] }) {
  const numeric = trial.criteria.filter(
    (c) => typeof c.value === "number" || (Array.isArray(c.value) && typeof c.value[0] === "number")
  );
  const [criterionId, setCriterionId] = useState(numeric[0]?.id ?? "");
  const criterion = numeric.find((c) => c.id === criterionId) ?? numeric[0];
  const [low, setLow] = useState<string>("");
  const [high, setHigh] = useState<string>("");
  const [impact, setImpact] = useState<ReturnType<typeof simulateProtocolChange> | null>(null);

  if (!criterion) {
    return (
      <p className="mt-8 text-sm text-slate-600">
        No numeric thresholds were parsed, so a protocol-change simulation is not available.
      </p>
    );
  }

  const isRange = Array.isArray(criterion.value);

  function simulate() {
    if (!criterion) return;
    const l = Number(low);
    const h = Number(high);
    const value = isRange ? ([l, h] as [number, number]) : l;
    if (low === "" || (isRange && high === "") || Number.isNaN(l) || Number.isNaN(h)) return;
    setImpact(simulateProtocolChange(trial, criterion.id, value, pool));
  }

  return (
    <div className="mt-8 rounded-sm border border-navy-900/10 bg-white p-5">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-700">Protocol change impact</h2>
      <p className="mt-1 text-sm text-slate-600">
        Propose a new threshold and recompute the eligible pool across all synthetic patients.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px_120px_auto] sm:items-end">
        <div>
          <label htmlFor="impact-criterion" className="block text-sm font-medium text-navy-800">Criterion</label>
          <Select
            id="impact-criterion"
            value={criterion.id}
            onChange={(v) => { setCriterionId(v); setImpact(null); setLow(""); setHigh(""); }}
            className="mt-1.5"
            options={numeric.map((c) => ({ value: c.id, label: c.ruleText }))}
          />
        </div>
        <div>
          <label htmlFor="impact-low" className="block text-sm font-medium text-navy-800">
            {isRange ? "New minimum" : "New threshold"}
          </label>
          <input id="impact-low" type="number" step="any" value={low} onChange={(e) => setLow(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-navy-900/20 px-3 py-2 text-sm" />
        </div>
        {isRange ? (
          <div>
            <label htmlFor="impact-high" className="block text-sm font-medium text-navy-800">New maximum</label>
            <input id="impact-high" type="number" step="any" value={high} onChange={(e) => setHigh(e.target.value)}
              className="mt-1.5 w-full rounded-sm border border-navy-900/20 px-3 py-2 text-sm" />
          </div>
        ) : <div />}
        <button
          type="button"
          onClick={simulate}
          className="rounded-sm border border-navy-900/25 px-4 py-2 text-sm font-semibold text-navy-800 hover:bg-navy-900/5"
        >
          Calculate Impact
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-500">
        Current value: {Array.isArray(criterion.value) ? criterion.value.join(" – ") : String(criterion.value)} {criterion.unit ?? ""}
      </p>

      {impact && (
        <div className="mt-4 border-t border-navy-900/10 pt-4 text-sm" aria-live="polite">
          <p className="text-navy-900">
            Eligible candidates: <strong>{impact.baselineEligible}</strong> → <strong>{impact.simulatedEligible}</strong>{" "}
            of {impact.totalPatients} ({impact.deltaEligible >= 0 ? "+" : ""}{impact.deltaEligible}).
          </p>
          {impact.newlyEligiblePatientCodeNames.length > 0 && (
            <p className="mt-1 text-clinical-green-700">Newly eligible: {impact.newlyEligiblePatientCodeNames.join(", ")}</p>
          )}
          {impact.newlyIneligiblePatientCodeNames.length > 0 && (
            <p className="mt-1 text-clinical-red-700">No longer eligible: {impact.newlyIneligiblePatientCodeNames.join(", ")}</p>
          )}
          {impact.deltaEligible === 0 && impact.newlyEligiblePatientCodeNames.length === 0 && impact.newlyIneligiblePatientCodeNames.length === 0 && (
            <p className="mt-1 text-slate-600">This change does not alter the eligible pool in the synthetic dataset.</p>
          )}
          <p className="mt-2 text-xs text-slate-500">Demo dataset analysis — not a real-world recruitment forecast.</p>
        </div>
      )}
    </div>
  );
}
