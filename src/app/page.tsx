import Link from "next/link";
import { patients } from "@/lib/data/patients";
import { trials } from "@/lib/data/trials";
import { SyntheticDataBadge } from "@/components/layout/SyntheticDataBadge";

const totalCriteria = trials.reduce((sum, t) => sum + t.criteria.length, 0);

const differentiators = [
  { q: "WHY?", a: "Every decision carries a step-by-step decision trace back to the source data." },
  { q: "WHAT'S MISSING?", a: "Unrecorded fields are surfaced explicitly instead of being guessed at." },
  { q: "WHAT WOULD CHANGE IT?", a: "A What-If simulator recalculates the decision as values are adjusted." },
  { q: "WHICH OTHER TRIALS MATCH?", a: "One patient is screened against every active protocol at once." },
  { q: "WHERE IS RECRUITMENT BLOCKED?", a: "Recruitment Radar ranks the criteria rejecting the most candidates." },
  { q: "HOW WOULD A PROTOCOL CHANGE HELP?", a: "Protocol Impact recomputes the eligible pool for a proposed threshold." },
];

const workflow = ["Screen", "Explain", "Match", "Identify Gaps", "Simulate", "Analyze", "Optimize"];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-navy-900/10 bg-gradient-to-b from-navy-900 to-navy-950">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
          <SyntheticDataBadge />
          <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Clinical trial recruitment intelligence, not just an eligibility calculator.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-300">
            TrialFit AI converts natural-language protocol criteria into auditable eligibility rules,
            screens synthetic patients against them deterministically, and explains every decision in
            plain language — with AI assisting interpretation and narration, never the final call.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/screening"
              className="rounded-sm bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700"
            >
              Run AI Screening
            </Link>
            <Link
              href="/match"
              className="rounded-sm border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Find Matching Trials
            </Link>
          </div>

          <dl className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Synthetic patients</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{patients.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Trial protocols</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{trials.length}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-400">Eligibility rules</dt>
              <dd className="mt-1 text-2xl font-semibold text-white">{totalCriteria}</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">Demo dataset analysis — figures reflect the current synthetic dataset, not real-world recruitment.</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">The differentiator</h2>
        <p className="mt-2 max-w-2xl text-2xl font-semibold text-navy-900">
          Most screening systems answer &ldquo;is this patient eligible?&rdquo; TrialFit AI goes further.
        </p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-navy-900/10 bg-navy-900/10 sm:grid-cols-2 lg:grid-cols-3">
          {differentiators.map((d) => (
            <div key={d.q} className="bg-white p-5">
              <p className="text-sm font-semibold text-navy-900">{d.q}</p>
              <p className="mt-1.5 text-sm text-slate-600">{d.a}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-navy-900/10 bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">One coherent workflow</h2>
          <div className="mt-6 flex flex-wrap items-center gap-2 overflow-x-auto">
            {workflow.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <span className="whitespace-nowrap rounded-sm border border-navy-900/15 bg-navy-900/[0.03] px-3 py-1.5 text-sm font-medium text-navy-800">
                  {step}
                </span>
                {i < workflow.length - 1 && <span className="text-slate-400">→</span>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-navy-900/10 bg-slate-50 py-14">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-700">How AI is used</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>— Natural-language protocol interpretation</li>
              <li>— Explanation generation and summarization</li>
              <li>— Recruitment insight narration</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              The AI layer never overrides the deterministic eligibility engine. When no AI explanation
              service is configured, screening falls back to a deterministic explanation generator — and
              says so.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-navy-700">Deterministic by design</h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-700">
              <li>— Eligibility decisions</li>
              <li>— Rule evaluation</li>
              <li>— Decision trace construction</li>
              <li>— Validation metrics</li>
            </ul>
            <p className="mt-4 text-sm text-slate-600">
              A single rule engine is the authoritative source for every eligibility decision shown
              anywhere in this application.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
