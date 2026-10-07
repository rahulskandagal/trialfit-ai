import type { Criterion, CriterionCategory } from "@/lib/types";

export interface ParsedLine {
  rawText: string;
  category: CriterionCategory;
  criterion: Criterion | null; // null when the line could not be structured
}

let autoId = 0;
function nextId(): string {
  autoId += 1;
  return `PARSED-${autoId}`;
}

interface Pattern {
  test: RegExp;
  build: (match: RegExpMatchArray, category: CriterionCategory) => Criterion;
}

// Keyword-driven patterns for common clinical-trial criterion phrasing.
// This is a lightweight rule-based NLU layer, not a language model: lines
// outside these patterns are reported as "requires manual review" rather
// than guessed at, per the no-fabrication rule.
const patterns: Pattern[] = [
  {
    test: /age\s+between\s+(\d+)\s+and\s+(\d+)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Age range",
      field: "age",
      operator: "between",
      value: [Number(m[1]), Number(m[2])],
      unit: "years",
      ruleText: `Age between ${m[1]} and ${m[2]} years`,
    }),
  },
  {
    test: /(?:eGFR|Estimated GFR)\s+between\s+(\d+(?:\.\d+)?)\s+and\s+(\d+(?:\.\d+)?)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Estimated GFR",
      field: "egfr",
      operator: "between",
      value: [Number(m[1]), Number(m[2])],
      unit: "mL/min/1.73m²",
      ruleText: `eGFR between ${m[1]} and ${m[2]} mL/min/1.73m²`,
    }),
  },
  {
    test: /(?:eGFR|Estimated GFR)\s+below\s+(\d+(?:\.\d+)?)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Renal function",
      field: "egfr",
      operator: "lt",
      value: Number(m[1]),
      unit: "mL/min/1.73m²",
      ruleText: `eGFR < ${m[1]} mL/min/1.73m²`,
    }),
  },
  {
    test: /HbA1c\s+(?:no greater than|≤|<=)\s*(\d+(?:\.\d+)?)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: false,
      label: "Glycemic control",
      field: "hba1c",
      operator: "lte",
      value: Number(m[1]),
      unit: "%",
      ruleText: `HbA1c ≤ ${m[1]}%`,
    }),
  },
  {
    test: /HbA1c\s+between\s+(\d+(?:\.\d+)?)%?\s+and\s+(\d+(?:\.\d+)?)%?/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Glycemic control",
      field: "hba1c",
      operator: "between",
      value: [Number(m[1]), Number(m[2])],
      unit: "%",
      ruleText: `HbA1c between ${m[1]}% and ${m[2]}%`,
    }),
  },
  {
    test: /ECOG performance status (?:of\s*)?(\d)\s*(?:to|-|–)\s*(\d)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Performance status",
      field: "ecogStatus",
      operator: "between",
      value: [Number(m[1]), Number(m[2])],
      ruleText: `ECOG performance status ${m[1]}–${m[2]}`,
    }),
  },
  {
    test: /BMI\s+of at least\s+(\d+(?:\.\d+)?)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Body mass index",
      field: "bmi",
      operator: "gte",
      value: Number(m[1]),
      unit: "kg/m²",
      ruleText: `BMI ≥ ${m[1]} kg/m²`,
    }),
  },
  {
    test: /PD-?L1 expression of at least\s+(\d+(?:\.\d+)?)%/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "PD-L1 expression",
      field: "pdl1Expression",
      operator: "gte",
      value: Number(m[1]),
      unit: "%",
      ruleText: `PD-L1 expression ≥ ${m[1]}%`,
    }),
  },
  {
    test: /bilirubin\s+no greater than\s+(\d+(?:\.\d+)?)x?\s*ULN/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Hepatic function",
      field: "bilirubinUlnRatio",
      operator: "lte",
      value: Number(m[1]),
      unit: "× ULN",
      ruleText: `Bilirubin ≤ ${m[1]}× ULN`,
    }),
  },
  {
    test: /systolic blood pressure of at least\s+(\d+)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Resting systolic BP",
      field: "restingSystolicBP",
      operator: "gte",
      value: Number(m[1]),
      unit: "mmHg",
      ruleText: `Resting systolic BP ≥ ${m[1]} mmHg`,
    }),
  },
  {
    test: /(\d+)\s+or more antihypertensive medications/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Medication count",
      field: "antihypertensiveMedCount",
      operator: "gte",
      value: Number(m[1]),
      ruleText: `On ≥ ${m[1]} antihypertensive medications`,
    }),
  },
  {
    test: /disease duration of at least\s+(\d+)\s+months?/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Disease duration",
      field: "diseaseDurationMonths",
      operator: "gte",
      value: Number(m[1]),
      unit: "months",
      ruleText: `Disease duration ≥ ${m[1]} months`,
    }),
  },
  {
    test: /inadequate response to prior Methotrexate/i,
    build: (_m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Prior therapy",
      field: "priorTherapies",
      operator: "includesTherapy",
      value: ["Methotrexate"],
      ruleText: "Inadequate response to prior Methotrexate",
    }),
  },
  {
    test: /BRCA mutation positive/i,
    build: (_m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "BRCA status",
      field: "brcaMutation",
      operator: "eq",
      value: "positive",
      ruleText: "BRCA mutation positive",
    }),
  },
  {
    test: /pregnan\w*/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Pregnancy",
      field: "pregnancyStatus",
      operator: "eq",
      value: "pregnant",
      ruleText: "Pregnant patients are excluded",
    }),
  },
  {
    test: /dialysis dependent/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Dialysis dependency",
      field: "dialysisDependent",
      operator: "isTrue",
      ruleText: "Dialysis-dependent patients are excluded",
    }),
  },
  {
    test: /prior immunotherapy/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Prior immunotherapy",
      field: "priorImmunotherapy",
      operator: "isTrue",
      ruleText: "Prior immunotherapy is excluded",
    }),
  },
  {
    test: /active autoimmune disease/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Autoimmune disease",
      field: "autoimmuneDisease",
      operator: "isTrue",
      ruleText: "Active autoimmune disease is excluded",
    }),
  },
  {
    test: /history of pancreatitis/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Pancreatitis history",
      field: "historyOfPancreatitis",
      operator: "isTrue",
      ruleText: "History of pancreatitis is excluded",
    }),
  },
  {
    test: /active infection/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Active infection",
      field: "activeInfection",
      operator: "isTrue",
      ruleText: "Active infection is excluded",
    }),
  },
  {
    test: /prior PARP inhibitor/i,
    build: () => ({
      id: nextId(),
      category: "exclusion",
      mandatory: true,
      label: "Prior PARP inhibitor",
      field: "priorPARPInhibitor",
      operator: "isTrue",
      ruleText: "Prior PARP inhibitor use is excluded",
    }),
  },
  {
    test: /diagnosis of ([A-Za-z0-9,\s-]+)/i,
    build: (m, category) => ({
      id: nextId(),
      category,
      mandatory: true,
      label: "Diagnosis",
      field: "primaryDiagnosis",
      operator: "containsText",
      value: m[1].trim().replace(/[,s]+$/, ""),
      ruleText: `Confirmed diagnosis of ${m[1].trim()}`,
    }),
  },
];

/**
 * Parses free-text protocol criteria (one per line, under "Inclusion
 * Criteria:" / "Exclusion Criteria:" headers) into structured Criterion
 * objects using keyword pattern matching. Lines that don't match a known
 * clinical pattern are returned with criterion: null so the UI can flag
 * them for manual review instead of fabricating a rule.
 */
export function parseProtocolText(text: string): ParsedLine[] {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let currentCategory: CriterionCategory = "inclusion";
  const results: ParsedLine[] = [];

  for (const line of lines) {
    if (/^inclusion criteria/i.test(line)) {
      currentCategory = "inclusion";
      continue;
    }
    if (/^exclusion criteria/i.test(line)) {
      currentCategory = "exclusion";
      continue;
    }

    const bulletText = line.replace(/^[-*•]\s*/, "");
    const pattern = patterns.find((p) => p.test.test(bulletText));
    const criterion = pattern ? pattern.build(bulletText.match(pattern.test)!, currentCategory) : null;

    results.push({ rawText: bulletText, category: currentCategory, criterion });
  }

  return results;
}
