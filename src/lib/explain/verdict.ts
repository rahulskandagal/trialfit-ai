import type { CriterionEvaluation, Patient, ScreeningResult } from "@/lib/types";

export interface VerdictReason {
  status: "PASS" | "FAIL" | "UNKNOWN";
  text: string;
}

export interface Verdict {
  headline: string;
  reasons: VerdictReason[];
  diseaseMatches: boolean;
}

function describe(e: CriterionEvaluation, patient: Patient): VerdictReason {
  const c = e.criterion;
  if (c.field === "diagnosisTags" && e.status !== "UNKNOWN") {
    return e.status === "PASS"
      ? { status: "PASS", text: `Disease: recorded diagnosis "${patient.primaryDiagnosis}" matches "${c.ruleText}"` }
      : { status: "FAIL", text: `Disease: recorded diagnosis "${patient.primaryDiagnosis}" does not match "${c.ruleText}"` };
  }
  if (e.status === "UNKNOWN") {
    return { status: "UNKNOWN", text: `${c.label}: not recorded in the file (needed for "${c.ruleText}")` };
  }
  if (c.category === "inclusion") {
    return e.status === "PASS"
      ? { status: "PASS", text: `${c.label}: ${e.patientValueDisplay} meets "${c.ruleText}"` }
      : { status: "FAIL", text: `${c.label}: ${e.patientValueDisplay}, but the protocol requires "${c.ruleText}"` };
  }
  return e.status === "PASS"
    ? { status: "PASS", text: `${c.label}: ${e.patientValueDisplay} — exclusion "${c.ruleText}" does not apply` }
    : { status: "FAIL", text: `${c.label}: ${e.patientValueDisplay} — triggers the exclusion "${c.ruleText}"` };
}

/** Plain-language verdict built only from the rule engine's result: the reasons are the mandatory criteria that decided it. */
export function buildVerdict(result: ScreeningResult, patient: Patient): Verdict {
  const mandatory = result.evaluations.filter((e) => e.criterion.mandatory);
  const diseaseEval = result.evaluations.find((e) => e.criterion.field === "diagnosisTags");
  const diseaseMatches = diseaseEval ? diseaseEval.status === "PASS" : true;

  if (result.decision === "ELIGIBLE") {
    return {
      headline: `Eligible — all ${mandatory.length} mandatory criteria are satisfied.`,
      reasons: mandatory.map((e) => describe(e, patient)),
      diseaseMatches,
    };
  }
  if (result.decision === "NOT_ELIGIBLE") {
    const fails = mandatory.filter((e) => e.status === "FAIL");
    return {
      headline: `Not eligible — ${fails.length} mandatory criterion${fails.length === 1 ? "" : "s"} not met.`,
      reasons: [...fails, ...mandatory.filter((e) => e.status === "UNKNOWN")].map((e) => describe(e, patient)),
      diseaseMatches,
    };
  }
  const unknown = mandatory.filter((e) => e.status === "UNKNOWN");
  return {
    headline: `Needs review — nothing blocks this patient, but ${unknown.length} mandatory item${unknown.length === 1 ? " is" : "s are"} missing from the file.`,
    reasons: [...unknown.map((e) => describe(e, patient)), ...mandatory.filter((e) => e.status === "PASS").map((e) => describe(e, patient))],
    diseaseMatches,
  };
}
