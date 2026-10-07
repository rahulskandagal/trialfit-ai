"use client";

import { useAllPatients } from "@/lib/data/patientStore";
import { Select } from "@/components/ui/Select";
import type { Patient } from "@/lib/types";

export function PatientSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const patients = useAllPatients();
  const selected = patients.find((p) => p.id === value);

  return (
    <div>
      <label htmlFor="patient-select" className="block text-sm font-medium text-navy-800">
        Patient (synthetic or uploaded)
      </label>
      <Select
        id="patient-select"
        value={value}
        onChange={onChange}
        placeholder="Select a patient…"
        className="mt-1.5"
        options={patients.map((p) => ({
          value: p.id,
          label: `${p.codeName}${p.source === "uploaded" ? " (uploaded)" : ""} — ${p.primaryDiagnosis}`,
        }))}
      />
      {selected && <PatientSummary patient={selected} />}
    </div>
  );
}

function PatientSummary({ patient }: { patient: Patient }) {
  const facts: [string, string][] = [
    ["Age / Sex", `${patient.age} / ${patient.sex === "male" ? "Male" : "Female"}`],
    ["Primary diagnosis", patient.primaryDiagnosis],
    ["Comorbidities", patient.comorbidities.length ? patient.comorbidities.join(", ") : "None recorded"],
    ["Prior therapies", patient.priorTherapies.length ? patient.priorTherapies.join(", ") : "None recorded"],
  ];

  return (
    <dl className="mt-3 grid grid-cols-1 gap-2 rounded-sm border border-navy-900/10 bg-slate-50 p-3 text-sm sm:grid-cols-2">
      {facts.map(([k, v]) => (
        <div key={k}>
          <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
          <dd className="text-navy-900">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
