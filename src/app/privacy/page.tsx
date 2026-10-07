export const metadata = { title: "Privacy — TrialFit AI" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Privacy by design</h1>
      <p className="mt-4 text-sm text-slate-700">
        This prototype demonstrates screening on synthetic data only.
      </p>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-slate-700">
        <li>No real patient records are used, collected, or stored.</li>
        <li>All demonstration patients are synthetic.</li>
        <li>Screening runs on demonstration data included with the application.</li>
        <li>
          Text you paste into Protocol Intelligence is processed in your browser by a local parser and is not
          sent to any service.
        </li>
        <li>
          If an AI explanation service is configured by the deployer, only the structured decision trace for a
          synthetic patient is sent to it.
        </li>
      </ul>
      <p className="mt-6 text-sm text-slate-700">
        A production deployment would require appropriate security, access controls, and regulatory review. This
        prototype does not claim compliance with any healthcare privacy regulation.
      </p>
    </div>
  );
}
