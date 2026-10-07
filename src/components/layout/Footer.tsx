import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-navy-900/10 bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-white">TrialFit AI</p>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              AI-assisted clinical trial screening and recruitment decision support. A deterministic rule
              engine makes every eligibility determination; AI assists with explanation and protocol
              interpretation only.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Trust &amp; Legal</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              <li>
                <Link href="/disclaimer" className="text-slate-400 hover:text-teal-400">
                  Clinical Disclaimer
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-teal-400">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-teal-400">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Data</p>
            <p className="mt-2 text-sm text-slate-400">
              Every patient and trial record is synthetic and generated for demonstration. No real
              patient data is stored, transmitted, or used anywhere in this application.
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-white/10 pt-6 text-xs text-slate-500">
          TrialFit AI is a research and screening-support prototype. It does not provide medical
          diagnosis, treatment recommendations, or final clinical eligibility decisions.
        </p>
      </div>
    </footer>
  );
}
