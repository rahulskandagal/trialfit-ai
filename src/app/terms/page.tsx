export const metadata = { title: "Terms — TrialFit AI" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Terms of use</h1>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li>TrialFit AI is a prototype provided for demonstration and research purposes.</li>
        <li>It must not be used to make real clinical, enrolment, or treatment decisions.</li>
        <li>Do not enter real patient information. Only synthetic demonstration data is supported.</li>
        <li>Outputs are provided as-is, without warranty of accuracy or fitness for any clinical purpose.</li>
        <li>Screening outputs must be reviewed by qualified clinical professionals.</li>
      </ul>
    </div>
  );
}
