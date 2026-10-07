// Core domain types for TrialFit AI.
// The Patient and Trial shapes are deliberately flat so the rule engine
// can address any field by name without a nested-path resolver.

export type Sex = "male" | "female";

export type PregnancyStatus =
  | "not_pregnant"
  | "pregnant"
  | "not_applicable"
  | "unknown";

export type BrcaStatus = "positive" | "negative" | "unknown";

export interface Patient {
  id: string;
  codeName: string; // synthetic identifier shown in the UI, never a real name
  age: number;
  sex: Sex;
  primaryDiagnosis: string;
  diagnosisTags: string[]; // e.g. ["CKD_STAGE_3", "T2DM"]
  egfr?: number; // mL/min/1.73m^2
  hba1c?: number; // %
  bmi?: number; // kg/m^2
  ecogStatus?: number; // 0-4
  pdl1Expression?: number; // %
  bilirubinUlnRatio?: number; // x Upper Limit of Normal
  restingSystolicBP?: number; // mmHg
  antihypertensiveMedCount?: number;
  diseaseDurationMonths?: number;
  priorTherapies: string[];
  comorbidities: string[];
  dialysisDependent?: boolean;
  priorImmunotherapy?: boolean;
  autoimmuneDisease?: boolean;
  activeInfection?: boolean;
  historyOfPancreatitis?: boolean;
  priorPARPInhibitor?: boolean;
  brcaMutation?: BrcaStatus;
  pregnancyStatus: PregnancyStatus;
  notes?: string;
  source?: "synthetic" | "uploaded";
}

export type CriterionCategory = "inclusion" | "exclusion";

export type Operator =
  | "gte"
  | "lte"
  | "gt"
  | "lt"
  | "eq"
  | "neq"
  | "between"
  | "includesTag"
  | "includesTherapy"
  | "containsText"
  | "isTrue"
  | "isFalse";

export type CriterionValue = number | string | boolean | [number, number] | string[];

export interface Criterion {
  id: string;
  category: CriterionCategory;
  mandatory: boolean;
  label: string;
  field: keyof Patient;
  operator: Operator;
  value?: CriterionValue;
  unit?: string;
  ruleText: string;
}

export interface Trial {
  id: string;
  title: string;
  phase: string;
  therapeuticArea: string;
  condition: string; // disease the protocol targets
  investigationalAgent: string; // medicine class under study (synthetic protocol)
  sponsorLabel: string; // always "Synthetic Sponsor" style, never a real company
  summary: string;
  protocolText: string; // free-text version, used by the protocol parser demo
  criteria: Criterion[];
}

export type CriterionStatus = "PASS" | "FAIL" | "UNKNOWN";

export interface CriterionEvaluation {
  criterion: Criterion;
  status: CriterionStatus;
  patientValueDisplay: string;
  normalizedValueDisplay: string;
}

export type ScreeningDecision = "ELIGIBLE" | "NOT_ELIGIBLE" | "NEEDS_REVIEW";

export interface ScreeningResult {
  patientId: string;
  trialId: string;
  decision: ScreeningDecision;
  matchScorePercent: number | null; // null when not calculable ("Not available")
  mandatoryPassedCount: number;
  mandatoryTotalCount: number;
  unknownCriteriaCount: number;
  blockingCriteriaCount: number;
  primaryReason: string;
  evaluations: CriterionEvaluation[];
}
