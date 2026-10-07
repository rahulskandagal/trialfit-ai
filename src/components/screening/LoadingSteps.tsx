const STEPS = [
  "Reading patient profile…",
  "Normalizing protocol criteria…",
  "Evaluating eligibility rules…",
  "Generating decision trace…",
  "Preparing explanation…",
];

export const LOADING_STEP_COUNT = STEPS.length;

export function LoadingSteps({ activeStep }: { activeStep: number }) {
  return (
    <div role="status" aria-live="polite" className="rounded-sm border border-navy-900/10 bg-white p-5">
      <p className="text-sm font-semibold text-navy-900">Screening in progress</p>
      <ol className="mt-3 space-y-2">
        {STEPS.map((label, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li key={label} className="flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold ${
                  done
                    ? "bg-clinical-green-600 text-white"
                    : active
                      ? "animate-pulse bg-teal-600 text-white"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {done ? "✓" : i + 1}
              </span>
              <span className={done || active ? "text-navy-900" : "text-slate-400"}>
                {done ? label.replace("…", "") + " — done" : label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
