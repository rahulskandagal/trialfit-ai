import type { Trial } from "@/lib/types";

// All trials below are synthetic demonstration protocols. Sponsors,
// identifiers, and results are fabricated for the purpose of this
// prototype and do not represent real studies.
export const trials: Trial[] = [
  {
    id: "T-001",
    title: "NOVA-CKD3: eGFR Decline Study in Stage 3 Chronic Kidney Disease",
    phase: "Phase II",
    therapeuticArea: "Nephrology",
    condition: "Chronic Kidney Disease, Stage 3",
    investigationalAgent: "Renal-protective agent",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Evaluates a renal-protective agent in adults with stage 3 chronic kidney disease and moderately reduced kidney function.",
    protocolText: `Inclusion Criteria:
- Age between 18 and 80 years
- Confirmed diagnosis of Chronic Kidney Disease, Stage 3
- Estimated GFR between 30 and 59 mL/min/1.73m^2
- HbA1c no greater than 9.0%

Exclusion Criteria:
- Pregnant women are excluded
- Patients who are dialysis dependent are excluded`,
    criteria: [
      {
        id: "T001-C1",
        category: "inclusion",
        mandatory: true,
        label: "Age range",
        field: "age",
        operator: "between",
        value: [18, 80],
        unit: "years",
        ruleText: "Age between 18 and 80 years",
      },
      {
        id: "T001-C2",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["CKD_STAGE_3"],
        ruleText: "Confirmed diagnosis of CKD, Stage 3",
      },
      {
        id: "T001-C3",
        category: "inclusion",
        mandatory: true,
        label: "Estimated GFR",
        field: "egfr",
        operator: "between",
        value: [30, 59],
        unit: "mL/min/1.73m²",
        ruleText: "eGFR between 30 and 59 mL/min/1.73m²",
      },
      {
        id: "T001-C4",
        category: "inclusion",
        mandatory: false,
        label: "Glycemic control",
        field: "hba1c",
        operator: "lte",
        value: 9.0,
        unit: "%",
        ruleText: "HbA1c ≤ 9.0%",
      },
      {
        id: "T001-C5",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
      {
        id: "T001-C6",
        category: "exclusion",
        mandatory: true,
        label: "Dialysis dependency",
        field: "dialysisDependent",
        operator: "isTrue",
        ruleText: "Dialysis-dependent patients are excluded",
      },
    ],
  },
  {
    id: "T-002",
    title: "ONCO-NSCLC-7: PD-L1 Targeted Therapy in Advanced NSCLC",
    phase: "Phase III",
    therapeuticArea: "Oncology",
    condition: "Advanced Non-Small Cell Lung Cancer",
    investigationalAgent: "PD-L1 targeted agent",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Investigates a PD-L1 targeted agent in patients with advanced non-small cell lung cancer and preserved performance status.",
    protocolText: `Inclusion Criteria:
- Confirmed diagnosis of Non-Small Cell Lung Cancer (Stage IIIB-IV)
- ECOG performance status of 0 to 1
- PD-L1 expression of at least 1%
- Adequate hepatic function: bilirubin no greater than 1.5x ULN

Exclusion Criteria:
- Prior immunotherapy is excluded
- Pregnant women are excluded
- Active autoimmune disease is excluded`,
    criteria: [
      {
        id: "T002-C1",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["NSCLC"],
        ruleText: "Confirmed diagnosis of NSCLC, Stage IIIB–IV",
      },
      {
        id: "T002-C2",
        category: "inclusion",
        mandatory: true,
        label: "Performance status",
        field: "ecogStatus",
        operator: "between",
        value: [0, 1],
        ruleText: "ECOG performance status 0–1",
      },
      {
        id: "T002-C3",
        category: "inclusion",
        mandatory: true,
        label: "PD-L1 expression",
        field: "pdl1Expression",
        operator: "gte",
        value: 1,
        unit: "%",
        ruleText: "PD-L1 expression ≥ 1%",
      },
      {
        id: "T002-C4",
        category: "inclusion",
        mandatory: true,
        label: "Hepatic function",
        field: "bilirubinUlnRatio",
        operator: "lte",
        value: 1.5,
        unit: "× ULN",
        ruleText: "Bilirubin ≤ 1.5× ULN",
      },
      {
        id: "T002-C5",
        category: "exclusion",
        mandatory: true,
        label: "Prior immunotherapy",
        field: "priorImmunotherapy",
        operator: "isTrue",
        ruleText: "Prior immunotherapy is excluded",
      },
      {
        id: "T002-C6",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
      {
        id: "T002-C7",
        category: "exclusion",
        mandatory: true,
        label: "Autoimmune disease",
        field: "autoimmuneDisease",
        operator: "isTrue",
        ruleText: "Active autoimmune disease is excluded",
      },
    ],
  },
  {
    id: "T-003",
    title: "GLYCO-T2D-12: Novel GLP-1 Agonist in Type 2 Diabetes",
    phase: "Phase III",
    therapeuticArea: "Endocrinology",
    condition: "Type 2 Diabetes Mellitus",
    investigationalAgent: "GLP-1 receptor agonist",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Studies a GLP-1 receptor agonist for glycemic control in adults with inadequately controlled type 2 diabetes.",
    protocolText: `Inclusion Criteria:
- Confirmed diagnosis of Type 2 Diabetes Mellitus
- HbA1c between 7.0% and 10.5%
- BMI of at least 25 kg/m^2
- Age between 18 and 75 years

Exclusion Criteria:
- Estimated GFR below 30 mL/min/1.73m^2 is excluded
- Pregnant women are excluded
- History of pancreatitis is excluded`,
    criteria: [
      {
        id: "T003-C1",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["T2DM"],
        ruleText: "Confirmed diagnosis of Type 2 Diabetes Mellitus",
      },
      {
        id: "T003-C2",
        category: "inclusion",
        mandatory: true,
        label: "Glycemic control",
        field: "hba1c",
        operator: "between",
        value: [7.0, 10.5],
        unit: "%",
        ruleText: "HbA1c between 7.0% and 10.5%",
      },
      {
        id: "T003-C3",
        category: "inclusion",
        mandatory: true,
        label: "Body mass index",
        field: "bmi",
        operator: "gte",
        value: 25,
        unit: "kg/m²",
        ruleText: "BMI ≥ 25 kg/m²",
      },
      {
        id: "T003-C4",
        category: "inclusion",
        mandatory: true,
        label: "Age range",
        field: "age",
        operator: "between",
        value: [18, 75],
        unit: "years",
        ruleText: "Age between 18 and 75 years",
      },
      {
        id: "T003-C5",
        category: "exclusion",
        mandatory: true,
        label: "Renal function",
        field: "egfr",
        operator: "lt",
        value: 30,
        unit: "mL/min/1.73m²",
        ruleText: "eGFR < 30 mL/min/1.73m² is excluded",
      },
      {
        id: "T003-C6",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
      {
        id: "T003-C7",
        category: "exclusion",
        mandatory: true,
        label: "Pancreatitis history",
        field: "historyOfPancreatitis",
        operator: "isTrue",
        ruleText: "History of pancreatitis is excluded",
      },
    ],
  },
  {
    id: "T-004",
    title: "CARDIO-HTN-4: Resistant Hypertension Combination Therapy",
    phase: "Phase II",
    therapeuticArea: "Cardiology",
    condition: "Resistant Hypertension",
    investigationalAgent: "Add-on antihypertensive agent",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Evaluates an add-on antihypertensive agent in adults with blood pressure uncontrolled on three or more medications.",
    protocolText: `Inclusion Criteria:
- Confirmed diagnosis of Hypertension
- Resting systolic blood pressure of at least 140 mmHg despite 3 or more antihypertensive medications
- Age between 18 and 75 years

Exclusion Criteria:
- Estimated GFR below 30 mL/min/1.73m^2 is excluded
- Pregnant women are excluded`,
    criteria: [
      {
        id: "T004-C1",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["HTN"],
        ruleText: "Confirmed diagnosis of Hypertension",
      },
      {
        id: "T004-C2",
        category: "inclusion",
        mandatory: true,
        label: "Resting systolic BP",
        field: "restingSystolicBP",
        operator: "gte",
        value: 140,
        unit: "mmHg",
        ruleText: "Resting systolic BP ≥ 140 mmHg",
      },
      {
        id: "T004-C3",
        category: "inclusion",
        mandatory: true,
        label: "Medication count",
        field: "antihypertensiveMedCount",
        operator: "gte",
        value: 3,
        ruleText: "On ≥ 3 antihypertensive medications",
      },
      {
        id: "T004-C4",
        category: "inclusion",
        mandatory: true,
        label: "Age range",
        field: "age",
        operator: "between",
        value: [18, 75],
        unit: "years",
        ruleText: "Age between 18 and 75 years",
      },
      {
        id: "T004-C5",
        category: "exclusion",
        mandatory: true,
        label: "Renal function",
        field: "egfr",
        operator: "lt",
        value: 30,
        unit: "mL/min/1.73m²",
        ruleText: "eGFR < 30 mL/min/1.73m² is excluded",
      },
      {
        id: "T004-C6",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
    ],
  },
  {
    id: "T-005",
    title: "RHEUM-RA-9: IL-6 Inhibitor for Moderate-to-Severe Rheumatoid Arthritis",
    phase: "Phase III",
    therapeuticArea: "Rheumatology",
    condition: "Rheumatoid Arthritis",
    investigationalAgent: "IL-6 inhibitor",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Studies an IL-6 inhibitor in adults with rheumatoid arthritis and an inadequate response to methotrexate.",
    protocolText: `Inclusion Criteria:
- Confirmed diagnosis of Rheumatoid Arthritis
- Disease duration of at least 6 months
- Inadequate response to prior Methotrexate therapy

Exclusion Criteria:
- Active infection is excluded
- Pregnant women are excluded`,
    criteria: [
      {
        id: "T005-C1",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["RA"],
        ruleText: "Confirmed diagnosis of Rheumatoid Arthritis",
      },
      {
        id: "T005-C2",
        category: "inclusion",
        mandatory: true,
        label: "Disease duration",
        field: "diseaseDurationMonths",
        operator: "gte",
        value: 6,
        unit: "months",
        ruleText: "Disease duration ≥ 6 months",
      },
      {
        id: "T005-C3",
        category: "inclusion",
        mandatory: true,
        label: "Prior therapy",
        field: "priorTherapies",
        operator: "includesTherapy",
        value: ["Methotrexate"],
        ruleText: "Inadequate response to prior Methotrexate",
      },
      {
        id: "T005-C4",
        category: "exclusion",
        mandatory: true,
        label: "Active infection",
        field: "activeInfection",
        operator: "isTrue",
        ruleText: "Active infection is excluded",
      },
      {
        id: "T005-C5",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
    ],
  },
  {
    id: "T-006",
    title: "ONCO-BRCA-3: PARP Inhibitor Maintenance in BRCA-Mutated Ovarian Cancer",
    phase: "Phase II",
    therapeuticArea: "Oncology",
    condition: "BRCA-mutated Ovarian Cancer",
    investigationalAgent: "PARP inhibitor (maintenance)",
    sponsorLabel: "Synthetic Sponsor — Demonstration Protocol",
    summary:
      "Evaluates PARP inhibitor maintenance therapy in patients with BRCA-mutated ovarian cancer following platinum-based chemotherapy.",
    protocolText: `Inclusion Criteria:
- Confirmed diagnosis of Ovarian Cancer
- BRCA mutation positive
- ECOG performance status of 0 to 2

Exclusion Criteria:
- Pregnant women are excluded
- Prior PARP inhibitor use is excluded`,
    criteria: [
      {
        id: "T006-C1",
        category: "inclusion",
        mandatory: true,
        label: "Diagnosis",
        field: "diagnosisTags",
        operator: "includesTag",
        value: ["OVARIAN_CA"],
        ruleText: "Confirmed diagnosis of Ovarian Cancer",
      },
      {
        id: "T006-C2",
        category: "inclusion",
        mandatory: true,
        label: "BRCA status",
        field: "brcaMutation",
        operator: "eq",
        value: "positive",
        ruleText: "BRCA mutation positive",
      },
      {
        id: "T006-C3",
        category: "inclusion",
        mandatory: true,
        label: "Performance status",
        field: "ecogStatus",
        operator: "between",
        value: [0, 2],
        ruleText: "ECOG performance status 0–2",
      },
      {
        id: "T006-C4",
        category: "exclusion",
        mandatory: true,
        label: "Pregnancy",
        field: "pregnancyStatus",
        operator: "eq",
        value: "pregnant",
        ruleText: "Pregnant patients are excluded",
      },
      {
        id: "T006-C5",
        category: "exclusion",
        mandatory: true,
        label: "Prior PARP inhibitor",
        field: "priorPARPInhibitor",
        operator: "isTrue",
        ruleText: "Prior PARP inhibitor use is excluded",
      },
    ],
  },
];

export function getTrialById(id: string): Trial | undefined {
  return trials.find((t) => t.id === id);
}
