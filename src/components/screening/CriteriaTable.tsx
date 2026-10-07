import { CriterionStatusPill } from "@/components/ui/StatusPill";
import type { CriterionEvaluation } from "@/lib/types";

export function CriteriaTable({ evaluations }: { evaluations: CriterionEvaluation[] }) {
  return (
    <div className="scroll-table rounded-sm border border-navy-900/10 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">Criteria analysis</caption>
        <thead className="border-b border-navy-900/10 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th scope="col" className="px-3 py-2">Criterion</th>
            <th scope="col" className="px-3 py-2">Type</th>
            <th scope="col" className="px-3 py-2">Protocol rule</th>
            <th scope="col" className="px-3 py-2">Patient value</th>
            <th scope="col" className="px-3 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {evaluations.map((e) => (
            <tr key={e.criterion.id} className="border-b border-navy-900/5 last:border-0">
              <td className="px-3 py-2.5 font-medium text-navy-900">{e.criterion.label}</td>
              <td className="px-3 py-2.5 text-slate-600">
                {e.criterion.category === "inclusion" ? "Inclusion" : "Exclusion"}
                {e.criterion.mandatory ? " · Mandatory" : " · Optional"}
              </td>
              <td className="px-3 py-2.5 text-slate-700">{e.criterion.ruleText}</td>
              <td className="px-3 py-2.5 text-slate-700">{e.patientValueDisplay}</td>
              <td className="px-3 py-2.5">
                <CriterionStatusPill status={e.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
