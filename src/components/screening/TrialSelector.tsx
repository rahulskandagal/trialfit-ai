"use client";

import { Select } from "@/components/ui/Select";
import { trials } from "@/lib/data/trials";

export function TrialSelector({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const selected = trials.find((t) => t.id === value);

  return (
    <div>
      <label htmlFor="trial-select" className="block text-sm font-medium text-navy-800">
        Clinical trial protocol
      </label>
      <Select
        id="trial-select"
        value={value}
        onChange={onChange}
        placeholder="Select a clinical trial protocol…"
        className="mt-1.5"
        options={trials.map((t) => ({ value: t.id, label: t.title }))}
      />
      {selected && (
        <div className="mt-3 rounded-sm border border-navy-900/10 bg-slate-50 p-3 text-sm">
          <p className="text-navy-900">{selected.summary}</p>
          <p className="mt-2 text-xs text-slate-500">
            {selected.phase} · {selected.therapeuticArea} · {selected.sponsorLabel}
          </p>
        </div>
      )}
    </div>
  );
}
