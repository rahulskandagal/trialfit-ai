import { runValidation } from "@/lib/analytics/validation";
import { DecisionPill } from "@/components/ui/StatusPill";

const pct = (v: number | null) => (v === null ? "Not available" : `${(v * 100).toFixed(1)}%`);

export default function ValidationPage() {
  const m = runValidation();
  const metrics: [string, string][] = [
    ["Accuracy", pct(m.accuracy)],
    ["Precision (ELIGIBLE)", pct(m.precision)],
    ["Recall (ELIGIBLE)", pct(m.recall)],
    ["F1 (ELIGIBLE)", pct(m.f1)],
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Engine validation</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Synthetic validation result: the rule engine is checked against {m.total} hand-labelled expected outcomes
        written from the protocol text. This verifies the engine implements the protocols as written. It is not a
        measure of real-world clinical accuracy.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden border border-navy-900/10 bg-navy-900/10 sm:grid-cols-4">
        {metrics.map(([k, v]) => (
          <div key={k} className="bg-white p-4">
            <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
            <dd className="mt-1 text-2xl font-semibold text-navy-900">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-slate-500">{m.correct} of {m.total} cases matched the expected decision.</p>

      <div className="scroll-table mt-6 border border-navy-900/10 bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Validation cases</caption>
          <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-3 py-2">Patient</th>
              <th scope="col" className="px-3 py-2">Trial</th>
              <th scope="col" className="px-3 py-2">Expected</th>
              <th scope="col" className="px-3 py-2">Engine result</th>
              <th scope="col" className="px-3 py-2">Match</th>
            </tr>
          </thead>
          <tbody>
            {m.rows.map((r) => (
              <tr key={r.patientId + r.trialId} className="border-b border-navy-900/5 last:border-0">
                <td className="px-3 py-2">{r.patientId}</td>
                <td className="px-3 py-2">{r.trialId}</td>
                <td className="px-3 py-2"><DecisionPill decision={r.expected} /></td>
                <td className="px-3 py-2"><DecisionPill decision={r.actual} /></td>
                <td className="px-3 py-2 font-semibold">{r.expected === r.actual ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
