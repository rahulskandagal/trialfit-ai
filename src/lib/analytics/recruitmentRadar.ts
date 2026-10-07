import { patients } from "@/lib/data/patients";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { Patient, ScreeningDecision, Trial } from "@/lib/types";

export interface TrialFunnel {
  trial: Trial;
  totalScreened: number;
  eligible: number;
  notEligible: number;
  needsReview: number;
  bottlenecks: { criterionLabel: string; ruleText: string; blockedCount: number }[];
}

/**
 * Screens every synthetic patient against every trial and aggregates, per
 * trial, the funnel outcome counts and which mandatory criteria block the
 * most candidates. This is computed live from the current dataset — not a
 * canned statistic.
 */
export function buildRecruitmentRadar(trials: Trial[], pool: Patient[] = patients): TrialFunnel[] {
  return trials.map((trial) => {
    const results = pool.map((p) => screenPatient(p, trial));

    const counts: Record<ScreeningDecision, number> = {
      ELIGIBLE: 0,
      NOT_ELIGIBLE: 0,
      NEEDS_REVIEW: 0,
    };
    results.forEach((r) => {
      counts[r.decision] += 1;
    });

    const blockCountByCriterion = new Map<string, { label: string; ruleText: string; count: number }>();
    results.forEach((r) => {
      r.evaluations
        .filter((e) => e.criterion.mandatory && e.status === "FAIL")
        .forEach((e) => {
          const existing = blockCountByCriterion.get(e.criterion.id);
          if (existing) {
            existing.count += 1;
          } else {
            blockCountByCriterion.set(e.criterion.id, {
              label: e.criterion.label,
              ruleText: e.criterion.ruleText,
              count: 1,
            });
          }
        });
    });

    const bottlenecks = Array.from(blockCountByCriterion.values())
      .sort((a, b) => b.count - a.count)
      .map((b) => ({ criterionLabel: b.label, ruleText: b.ruleText, blockedCount: b.count }));

    return {
      trial,
      totalScreened: results.length,
      eligible: counts.ELIGIBLE,
      notEligible: counts.NOT_ELIGIBLE,
      needsReview: counts.NEEDS_REVIEW,
      bottlenecks,
    };
  });
}
