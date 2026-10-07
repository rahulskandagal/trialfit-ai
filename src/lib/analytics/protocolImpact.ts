import { patients } from "@/lib/data/patients";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { Criterion, Patient, Trial } from "@/lib/types";

export interface ProtocolImpactResult {
  baselineEligible: number;
  simulatedEligible: number;
  deltaEligible: number;
  totalPatients: number;
  newlyEligiblePatientCodeNames: string[];
  newlyIneligiblePatientCodeNames: string[];
}

/**
 * Recomputes eligibility across the full synthetic patient pool with one
 * criterion's threshold value swapped out, so the UI can show the real
 * candidate-pool impact of a protocol amendment rather than an estimate.
 */
export function simulateProtocolChange(
  trial: Trial,
  criterionId: string,
  newValue: Criterion["value"],
  pool: Patient[] = patients
): ProtocolImpactResult {
  const baselineResults = pool.map((p) => ({ patient: p, result: screenPatient(p, trial) }));
  const baselineEligible = baselineResults.filter((r) => r.result.decision === "ELIGIBLE").length;

  const modifiedTrial: Trial = {
    ...trial,
    criteria: trial.criteria.map((c) => (c.id === criterionId ? { ...c, value: newValue } : c)),
  };

  const simulatedResults = pool.map((p) => ({ patient: p, result: screenPatient(p, modifiedTrial) }));
  const simulatedEligible = simulatedResults.filter((r) => r.result.decision === "ELIGIBLE").length;

  const newlyEligible = simulatedResults.filter(
    (sim, i) => sim.result.decision === "ELIGIBLE" && baselineResults[i].result.decision !== "ELIGIBLE"
  );
  const newlyIneligible = simulatedResults.filter(
    (sim, i) => sim.result.decision !== "ELIGIBLE" && baselineResults[i].result.decision === "ELIGIBLE"
  );

  return {
    baselineEligible,
    simulatedEligible,
    deltaEligible: simulatedEligible - baselineEligible,
    totalPatients: pool.length,
    newlyEligiblePatientCodeNames: newlyEligible.map((r) => r.patient.codeName),
    newlyIneligiblePatientCodeNames: newlyIneligible.map((r) => r.patient.codeName),
  };
}
