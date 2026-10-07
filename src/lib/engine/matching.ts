import { trials } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { Patient, ScreeningResult } from "@/lib/types";

export interface RankedMatch {
  result: ScreeningResult;
}

/** Screens one patient against every trial in the catalog and ranks by eligibility first, then match score. */
export function findMatchingTrials(patient: Patient): RankedMatch[] {
  const decisionRank = { ELIGIBLE: 0, NEEDS_REVIEW: 1, NOT_ELIGIBLE: 2 } as const;

  return trials
    .map((trial) => ({ result: screenPatient(patient, trial) }))
    .sort((a, b) => {
      const rankDiff = decisionRank[a.result.decision] - decisionRank[b.result.decision];
      if (rankDiff !== 0) return rankDiff;
      return (b.result.matchScorePercent ?? -1) - (a.result.matchScorePercent ?? -1);
    });
}
