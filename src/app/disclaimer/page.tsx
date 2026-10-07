export const metadata = { title: "Clinical Disclaimer — TrialFit AI" };

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Clinical disclaimer</h1>
      <p className="mt-4 border-l-4 border-teal-600 bg-white p-4 text-navy-900">
        TrialFit AI is a research and screening-support prototype. It does not provide medical diagnosis,
        treatment recommendations, or final clinical eligibility decisions. Screening outputs must be reviewed
        by qualified clinical professionals.
      </p>
      <h2 className="mt-8 text-lg font-semibold text-navy-900">Role of AI</h2>
      <p className="mt-2 text-sm text-slate-700">
        A deterministic rule engine produces every eligibility determination. AI, where configured, only assists
        with protocol interpretation and with narrating results. It never overrides the rule engine.
      </p>
      <h2 className="mt-6 text-lg font-semibold text-navy-900">Synthetic data</h2>
      <p className="mt-2 text-sm text-slate-700">
        All patients, trials, and sponsors shown are synthetic demonstration data. Figures derived from them are
        labelled as demo dataset analysis or synthetic validation results and do not represent real-world performance.
      </p>
    </div>
  );
}
