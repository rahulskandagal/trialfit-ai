import type { Patient, ScreeningResult, Trial } from "@/lib/types";

/**
 * Deterministic natural-language explanation generator.
 *
 * This is the explanation layer used when no live model call is configured
 * (see aiExplain.ts). It is template-based NLG over the structured
 * screening result — not a large language model — so its output is fully
 * reproducible and never invents facts not present in the decision trace.
 */
export function generateDeterministicExplanation(
  patient: Patient,
  trial: Trial,
  result: ScreeningResult
): string {
  const sentences: string[] = [];

  if (result.decision === "ELIGIBLE") {
    sentences.push(
      `${patient.codeName} satisfies all ${result.mandatoryTotalCount} mandatory criteria for ${trial.title}.`
    );
    if (result.matchScorePercent !== null) {
      sentences.push(`${result.matchScorePercent}% of applicable criteria were satisfied overall.`);
    }
  } else if (result.decision === "NOT_ELIGIBLE") {
    const blocking = result.evaluations.filter((e) => e.criterion.mandatory && e.status === "FAIL");
    sentences.push(
      `${patient.codeName} does not meet ${blocking.length} mandatory criterion${
        blocking.length === 1 ? "" : "s"
      } for ${trial.title}.`
    );
    blocking.forEach((e) => {
      sentences.push(
        `${e.criterion.label}: recorded value is ${e.patientValueDisplay}, but the protocol requires ${e.criterion.ruleText}.`
      );
    });
  } else {
    const unknown = result.evaluations.filter((e) => e.criterion.mandatory && e.status === "UNKNOWN");
    sentences.push(
      `${patient.codeName} cannot yet be conclusively screened for ${trial.title} because ${unknown.length} mandatory criterion${
        unknown.length === 1 ? "" : "s"
      } lack${unknown.length === 1 ? "s" : ""} recorded data.`
    );
    unknown.forEach((e) => {
      sentences.push(`${e.criterion.label} (${e.criterion.ruleText}) has not been recorded for this patient.`);
    });
  }

  const nonMandatoryFails = result.evaluations.filter(
    (e) => !e.criterion.mandatory && e.status === "FAIL"
  );
  if (nonMandatoryFails.length > 0) {
    sentences.push(
      `Additionally, ${nonMandatoryFails.length} non-mandatory criterion${
        nonMandatoryFails.length === 1 ? "" : "s"
      } were not met: ${nonMandatoryFails.map((e) => e.criterion.label).join(", ")}.`
    );
  }

  return sentences.join(" ");
}
