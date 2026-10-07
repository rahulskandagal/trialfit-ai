import { getPatientById } from "@/lib/data/patients";
import { getTrialById } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { ScreeningDecision } from "@/lib/types";

// Hand-labelled expected outcomes for the synthetic dataset, written from the
// protocol text independently of the engine. They test that the engine
// implements the protocols as written — they are NOT real-world clinical ground truth.
export const validationCases: { patientId: string; trialId: string; expected: ScreeningDecision }[] = [
  { patientId: "P-001", trialId: "T-001", expected: "ELIGIBLE" },
  { patientId: "P-002", trialId: "T-001", expected: "NOT_ELIGIBLE" },
  { patientId: "P-003", trialId: "T-002", expected: "ELIGIBLE" },
  { patientId: "P-004", trialId: "T-002", expected: "NOT_ELIGIBLE" },
  { patientId: "P-005", trialId: "T-003", expected: "NEEDS_REVIEW" },
  { patientId: "P-006", trialId: "T-003", expected: "NOT_ELIGIBLE" },
  { patientId: "P-007", trialId: "T-004", expected: "ELIGIBLE" },
  { patientId: "P-008", trialId: "T-004", expected: "NOT_ELIGIBLE" },
  { patientId: "P-009", trialId: "T-005", expected: "ELIGIBLE" },
  { patientId: "P-010", trialId: "T-005", expected: "NOT_ELIGIBLE" },
  { patientId: "P-011", trialId: "T-006", expected: "ELIGIBLE" },
  { patientId: "P-012", trialId: "T-006", expected: "NEEDS_REVIEW" },
  { patientId: "P-001", trialId: "T-002", expected: "NOT_ELIGIBLE" },
  { patientId: "P-003", trialId: "T-006", expected: "NOT_ELIGIBLE" },
  { patientId: "P-009", trialId: "T-001", expected: "NOT_ELIGIBLE" },
  { patientId: "P-007", trialId: "T-003", expected: "NOT_ELIGIBLE" },
];

export interface ValidationMetrics {
  total: number;
  correct: number;
  accuracy: number | null;
  precision: number | null; // ELIGIBLE class
  recall: number | null;
  f1: number | null;
  rows: { patientId: string; trialId: string; expected: ScreeningDecision; actual: ScreeningDecision }[];
}

export function runValidation(): ValidationMetrics {
  const rows = validationCases.map((c) => {
    const patient = getPatientById(c.patientId)!;
    const trial = getTrialById(c.trialId)!;
    return { ...c, actual: screenPatient(patient, trial).decision };
  });

  const total = rows.length;
  const correct = rows.filter((r) => r.expected === r.actual).length;
  const tp = rows.filter((r) => r.expected === "ELIGIBLE" && r.actual === "ELIGIBLE").length;
  const fp = rows.filter((r) => r.expected !== "ELIGIBLE" && r.actual === "ELIGIBLE").length;
  const fn = rows.filter((r) => r.expected === "ELIGIBLE" && r.actual !== "ELIGIBLE").length;

  const precision = tp + fp === 0 ? null : tp / (tp + fp);
  const recall = tp + fn === 0 ? null : tp / (tp + fn);
  const f1 = precision === null || recall === null || precision + recall === 0 ? null : (2 * precision * recall) / (precision + recall);

  return { total, correct, accuracy: total === 0 ? null : correct / total, precision, recall, f1, rows };
}
