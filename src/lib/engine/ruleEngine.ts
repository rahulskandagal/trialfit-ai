import type {
  Criterion,
  CriterionEvaluation,
  CriterionStatus,
  Patient,
  ScreeningDecision,
  ScreeningResult,
  Trial,
} from "@/lib/types";

function displayValue(value: unknown, unit?: string): string {
  if (value === undefined || value === null) return "Not recorded";
  if (Array.isArray(value)) return value.length ? value.map((v) => String(v).replace(/_/g, " ")).join(", ") : "None recorded";
  if (typeof value === "string") return value.replace(/_/g, " ");
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (unit) return `${value} ${unit}`;
  return String(value);
}

/** Evaluates whether the patient's raw field value satisfies the criterion's comparison, independent of inclusion/exclusion framing. */
function matchesComparison(raw: unknown, criterion: Criterion): boolean {
  const { operator, value } = criterion;
  switch (operator) {
    case "gte":
      return typeof raw === "number" && typeof value === "number" && raw >= value;
    case "lte":
      return typeof raw === "number" && typeof value === "number" && raw <= value;
    case "gt":
      return typeof raw === "number" && typeof value === "number" && raw > value;
    case "lt":
      return typeof raw === "number" && typeof value === "number" && raw < value;
    case "eq":
      return raw === value;
    case "neq":
      return raw !== value;
    case "between": {
      if (typeof raw !== "number" || !Array.isArray(value) || value.length !== 2) return false;
      const [min, max] = value as [number, number];
      return raw >= min && raw <= max;
    }
    case "includesTag": {
      const tags = raw as string[] | undefined;
      const targets = Array.isArray(value) ? (value as string[]) : [String(value)];
      return Array.isArray(tags) && targets.some((t) => tags.includes(t));
    }
    case "includesTherapy": {
      const list = raw as string[] | undefined;
      const targets = Array.isArray(value) ? (value as string[]) : [String(value)];
      return Array.isArray(list) && targets.some((t) => list.includes(t));
    }
    case "containsText":
      return typeof raw === "string" && typeof value === "string" && raw.toLowerCase().includes(value.toLowerCase());
    case "isTrue":
      return raw === true;
    case "isFalse":
      return raw === false;
    default:
      return false;
  }
}

function fieldIsMissing(raw: unknown, operator: Criterion["operator"]): boolean {
  if (raw === undefined || raw === null) return true;
  if (raw === "unknown") return true;
  // Arrays: an empty array is a known, recorded "none" — not missing data.
  if (Array.isArray(raw)) return false;
  if ((operator === "isTrue" || operator === "isFalse") && typeof raw !== "boolean") return true;
  return false;
}

export function evaluateCriterion(patient: Patient, criterion: Criterion): CriterionEvaluation {
  const raw = patient[criterion.field] as unknown;

  if (fieldIsMissing(raw, criterion.operator)) {
    return {
      criterion,
      status: "UNKNOWN",
      patientValueDisplay: "Not recorded",
      normalizedValueDisplay: "Insufficient data",
    };
  }

  const matches = matchesComparison(raw, criterion);
  // Inclusion criteria require a match to PASS; exclusion criteria require the
  // absence of a match to PASS (matching an excluded condition blocks the patient).
  const status: CriterionStatus =
    criterion.category === "inclusion"
      ? matches
        ? "PASS"
        : "FAIL"
      : matches
        ? "FAIL"
        : "PASS";

  return {
    criterion,
    status,
    patientValueDisplay: displayValue(raw, criterion.unit),
    normalizedValueDisplay: displayValue(raw, criterion.unit),
  };
}

export function screenPatient(patient: Patient, trial: Trial): ScreeningResult {
  const evaluations = trial.criteria.map((criterion) => evaluateCriterion(patient, criterion));

  const mandatoryEvals = evaluations.filter((e) => e.criterion.mandatory);
  const mandatoryPassedCount = mandatoryEvals.filter((e) => e.status === "PASS").length;
  const blockingEvals = mandatoryEvals.filter((e) => e.status === "FAIL");
  const unknownMandatoryEvals = mandatoryEvals.filter((e) => e.status === "UNKNOWN");

  const scored = evaluations.filter((e) => e.status !== "UNKNOWN");
  const matchScorePercent =
    scored.length === 0
      ? null
      : Math.round((scored.filter((e) => e.status === "PASS").length / scored.length) * 100);

  let decision: ScreeningDecision;
  let primaryReason: string;

  if (blockingEvals.length > 0) {
    decision = "NOT_ELIGIBLE";
    const first = blockingEvals[0];
    primaryReason = `Blocked by mandatory criterion: ${first.criterion.label} (${first.criterion.ruleText})`;
  } else if (unknownMandatoryEvals.length > 0) {
    decision = "NEEDS_REVIEW";
    primaryReason = `Missing information for mandatory criterion: ${unknownMandatoryEvals
      .map((e) => e.criterion.label)
      .join(", ")}`;
  } else {
    decision = "ELIGIBLE";
    primaryReason = "All mandatory criteria satisfied";
  }

  return {
    patientId: patient.id,
    trialId: trial.id,
    decision,
    matchScorePercent,
    mandatoryPassedCount,
    mandatoryTotalCount: mandatoryEvals.length,
    unknownCriteriaCount: unknownMandatoryEvals.length,
    blockingCriteriaCount: blockingEvals.length,
    primaryReason,
    evaluations,
  };
}
