import type { BrcaStatus, Patient, PregnancyStatus, Sex } from "@/lib/types";

export interface ImportRow {
  rowNumber: number;
  patient?: Patient;
  errors: string[];
  warnings: string[];
}

export interface ImportOutcome {
  rows: ImportRow[];
  fatal?: string;
  ignoredColumns: string[];
}

const NUMBER_FIELDS = [
  "age", "egfr", "hba1c", "bmi", "ecogStatus", "pdl1Expression", "bilirubinUlnRatio",
  "restingSystolicBP", "antihypertensiveMedCount", "diseaseDurationMonths",
] as const;
const BOOLEAN_FIELDS = [
  "dialysisDependent", "priorImmunotherapy", "autoimmuneDisease", "activeInfection",
  "historyOfPancreatitis", "priorPARPInhibitor",
] as const;
const LIST_FIELDS = ["diagnosisTags", "priorTherapies", "comorbidities"] as const;
const STRING_FIELDS = ["id", "codeName", "primaryDiagnosis", "notes"] as const;
const ENUM_FIELDS = ["sex", "pregnancyStatus", "brcaMutation"] as const;

export const TEMPLATE_COLUMNS = [
  ...STRING_FIELDS, ...ENUM_FIELDS, ...NUMBER_FIELDS, ...BOOLEAN_FIELDS, ...LIST_FIELDS,
];

const norm = (k: string) => k.toLowerCase().replace(/[\s_-]/g, "");

const CANONICAL = new Map<string, string>(TEMPLATE_COLUMNS.map((c) => [norm(c), c as string]));
// Common alternative names used by clinical record exports.
const ALIASES: Record<string, string> = {
  patientid: "id", hba1cpercent: "hba1c", glycatedhemoglobin: "hba1c", systolicbp: "restingSystolicBP",
  systolicbloodpressure: "restingSystolicBP", ecog: "ecogStatus", pdl1: "pdl1Expression",
  pdl1percent: "pdl1Expression", bilirubinxuln: "bilirubinUlnRatio", gender: "sex",
};
Object.entries(ALIASES).forEach(([k, v]) => CANONICAL.set(k, v));

// Direct identifiers are never imported: the prototype only works with de-identified or synthetic data.
const IDENTIFIER_COLUMNS = new Set([
  "name", "patientname", "fullname", "firstname", "lastname", "dob", "dateofbirth", "mrn",
  "address", "phone", "email", "ssn", "aadhaar",
]);

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') inQuotes = false;
      else cell += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((c) => c.trim() !== "")) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== "")) rows.push(row);
  return rows;
}

function isBlank(v: unknown): boolean {
  return v === undefined || v === null || (typeof v === "string" && v.trim() === "");
}

function toNumber(v: unknown, field: string, errors: string[]): number | undefined {
  if (isBlank(v)) return undefined;
  const n = typeof v === "number" ? v : Number(String(v).trim());
  if (Number.isNaN(n)) { errors.push(`${field}: "${v}" is not a number`); return undefined; }
  return n;
}

function toBool(v: unknown, field: string, errors: string[]): boolean | undefined {
  if (isBlank(v)) return undefined;
  if (typeof v === "boolean") return v;
  const s = String(v).trim().toLowerCase();
  if (["true", "yes", "y", "1"].includes(s)) return true;
  if (["false", "no", "n", "0"].includes(s)) return false;
  errors.push(`${field}: "${v}" must be yes/no or true/false`);
  return undefined;
}

function toList(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => String(x).trim()).filter(Boolean);
  if (isBlank(v)) return [];
  return String(v).split(/[;|]/).map((s) => s.trim()).filter(Boolean);
}

export function deriveDiagnosisTags(diagnosis: string): string[] {
  const d = diagnosis.toLowerCase();
  const tags: string[] = [];
  if (/(kidney|ckd)/.test(d) && /(stage\s*3|\b3[ab]?\b)/.test(d)) tags.push("CKD_STAGE_3");
  if (/(nsclc|non-small|lung)/.test(d)) tags.push("NSCLC");
  if (/(type\s*2\s*diabetes|t2dm)/.test(d)) tags.push("T2DM");
  if (/(hypertension|htn)/.test(d)) tags.push("HTN");
  if (/(rheumatoid|\bra\b)/.test(d)) tags.push("RA");
  if (/ovarian/.test(d)) tags.push("OVARIAN_CA");
  return tags;
}


function flatten(obj: Record<string, unknown>, out: Record<string, unknown> = {}): Record<string, unknown> {
  for (const [key, value] of Object.entries(obj)) {
    if (value && typeof value === "object" && !Array.isArray(value)) flatten(value as Record<string, unknown>, out);
    else out[key] = value;
  }
  return out;
}

const isNone = (v: unknown) => isBlank(v) || /^(none|no|nil|n\/a|na)(?![a-z])/i.test(String(v).trim());
const truthy = (v: unknown) => v === true || /^(true|yes|y|1)$/i.test(String(v ?? "").trim());

/** Fills screening fields from nested clinical-history style records (diabetes flags, "128/82" BP, medication lists). */
function deriveFromClinical(flat: Record<string, unknown>, canon: Record<string, unknown>, notes: string[]) {
  const byNorm: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(flat)) byNorm[norm(k)] = v;

  const conditions: string[] = [];
  if (truthy(byNorm.diabetes)) {
    conditions.push(/2/.test(String(byNorm.diabetestype ?? "")) ? "Type 2 Diabetes Mellitus" : "Diabetes Mellitus");
  }
  if (truthy(byNorm.hypertension)) conditions.push("Hypertension");
  if (!isNone(byNorm.kidneydisease)) conditions.push(String(byNorm.kidneydisease));
  if (!isNone(byNorm.cancerhistory)) conditions.push(String(byNorm.cancerhistory));
  if (!isNone(byNorm.rheumatoidarthritis) && truthy(byNorm.rheumatoidarthritis)) conditions.push("Rheumatoid Arthritis");

  if (isBlank(canon.primaryDiagnosis) && conditions.length > 0) {
    canon.primaryDiagnosis = conditions[0];
    notes.push(`primary diagnosis taken from medical history: ${conditions[0]}`);
  }
  if (isBlank(canon.diagnosisTags) && conditions.length > 0) {
    const tags = deriveDiagnosisTags(conditions.join("; "));
    if (tags.length > 0) {
      canon.diagnosisTags = tags;
      notes.push(`diagnosis tags derived from medical history: ${tags.join(", ")}`);
    }
  }
  if (isBlank(canon.comorbidities)) {
    const co = conditions.filter((c) => c !== canon.primaryDiagnosis);
    const other = Array.isArray(byNorm.otherconditions) ? (byNorm.otherconditions as unknown[]).map(String) : [];
    if (co.length + other.length > 0) canon.comorbidities = [...co, ...other];
  }
  if (isBlank(canon.priorTherapies)) {
    const lists = [byNorm.previoustreatments, byNorm.currentmedications].flatMap((l) => (Array.isArray(l) ? l.map(String) : []));
    const names = Array.from(new Set(lists.map((t) => t.trim().split(/[\s(]/)[0]).filter(Boolean)));
    if (names.length > 0) {
      canon.priorTherapies = names;
      notes.push(`therapies taken from medication lists (drug names only): ${names.join(", ")}`);
    }
  }
  if (isBlank(canon.restingSystolicBP) && typeof byNorm.bloodpressure === "string") {
    const m = byNorm.bloodpressure.match(/^\s*(\d{2,3})\s*\/\s*\d{2,3}/);
    if (m) canon.restingSystolicBP = Number(m[1]);
  }
}

function normalizeRecord(raw: Record<string, unknown>, rowNumber: number, takenIds: Set<string>, autoIdSeed: () => string): ImportRow {
  const errors: string[] = [];
  const warnings: string[] = Array.isArray(raw.__notes) ? (raw.__notes as string[]) : [];

  const sexRaw = String(raw.sex ?? "").trim().toLowerCase();
  const sex: Sex | undefined = ["male", "m"].includes(sexRaw) ? "male" : ["female", "f"].includes(sexRaw) ? "female" : undefined;
  if (!sex) errors.push("sex: required (male or female)");

  const age = toNumber(raw.age, "age", errors);
  if (age === undefined && !errors.some((e) => e.startsWith("age"))) errors.push("age: required");
  else if (age !== undefined && (age < 0 || age > 120)) errors.push("age: must be between 0 and 120");

  const primaryDiagnosis = isBlank(raw.primaryDiagnosis) ? "" : String(raw.primaryDiagnosis).trim();
  if (!primaryDiagnosis) errors.push("primaryDiagnosis: required");

  let id = isBlank(raw.id) ? "" : String(raw.id).trim();
  if (id && takenIds.has(id)) errors.push(`id: "${id}" already exists`);
  if (!id) id = autoIdSeed();

  let diagnosisTags = toList(raw.diagnosisTags);
  if (diagnosisTags.length === 0 && primaryDiagnosis) {
    diagnosisTags = deriveDiagnosisTags(primaryDiagnosis);
    if (diagnosisTags.length > 0) warnings.push(`diagnosis tags derived from text: ${diagnosisTags.join(", ")}`);
    else warnings.push("no diagnosis tag recognised — diagnosis criteria will not match any protocol");
  }

  const pregRaw = String(raw.pregnancyStatus ?? "").trim().toLowerCase().replace(/[\s-]/g, "_");
  const pregMap: Record<string, PregnancyStatus> = {
    not_pregnant: "not_pregnant", no: "not_pregnant", pregnant: "pregnant", yes: "pregnant",
    not_applicable: "not_applicable", "n/a": "not_applicable", na: "not_applicable", unknown: "unknown",
  };
  // Free-text exports often add detail, e.g. "Not applicable (post-menopausal)", so fall back to prefix matching.
  const pregFuzzy: PregnancyStatus | undefined = /^(not_applicable|n\/a|na_)/.test(pregRaw) || /menopaus/.test(pregRaw)
    ? "not_applicable"
    : /^not_pregnant|^no(_|$)/.test(pregRaw)
      ? "not_pregnant"
      : /^pregnant|^yes(_|$)/.test(pregRaw)
        ? "pregnant"
        : undefined;
  let pregnancyStatus: PregnancyStatus | undefined = pregMap[pregRaw] ?? pregFuzzy;
  if (pregRaw && !pregnancyStatus) { errors.push(`pregnancyStatus: "${raw.pregnancyStatus}" not recognised`); pregnancyStatus = "unknown"; }
  if (!pregnancyStatus) {
    pregnancyStatus = sex === "male" ? "not_applicable" : "unknown";
    warnings.push(`pregnancyStatus not provided — recorded as ${pregnancyStatus.replace("_", " ")}`);
  }

  const brcaRaw = String(raw.brcaMutation ?? "").trim().toLowerCase();
  let brcaMutation: BrcaStatus | undefined;
  if (brcaRaw) {
    if (["positive", "negative", "unknown"].includes(brcaRaw)) brcaMutation = brcaRaw as BrcaStatus;
    else errors.push(`brcaMutation: "${raw.brcaMutation}" must be positive, negative or unknown`);
  }

  const num = (f: string) => toNumber(raw[f], f, errors);
  const bool = (f: string) => toBool(raw[f], f, errors);

  const patient: Patient = {
    id,
    codeName: isBlank(raw.codeName) ? `Uploaded Patient ${id}` : String(raw.codeName).trim(),
    age: age ?? 0,
    sex: sex ?? "male",
    primaryDiagnosis,
    diagnosisTags,
    egfr: num("egfr"),
    hba1c: num("hba1c"),
    bmi: num("bmi"),
    ecogStatus: num("ecogStatus"),
    pdl1Expression: num("pdl1Expression"),
    bilirubinUlnRatio: num("bilirubinUlnRatio"),
    restingSystolicBP: num("restingSystolicBP"),
    antihypertensiveMedCount: num("antihypertensiveMedCount"),
    diseaseDurationMonths: num("diseaseDurationMonths"),
    priorTherapies: toList(raw.priorTherapies),
    comorbidities: toList(raw.comorbidities),
    dialysisDependent: bool("dialysisDependent"),
    priorImmunotherapy: bool("priorImmunotherapy"),
    autoimmuneDisease: bool("autoimmuneDisease"),
    activeInfection: bool("activeInfection"),
    historyOfPancreatitis: bool("historyOfPancreatitis"),
    priorPARPInhibitor: bool("priorPARPInhibitor"),
    brcaMutation,
    pregnancyStatus,
    notes: isBlank(raw.notes) ? undefined : String(raw.notes).trim(),
    source: "uploaded",
  };

  if (errors.length === 0) takenIds.add(id);
  return { rowNumber, patient: errors.length === 0 ? patient : undefined, errors, warnings };
}

export function parseImport(text: string, filename: string, existingIds: string[]): ImportOutcome {
  const taken = new Set(existingIds);
  let counter = existingIds.filter((i) => i.startsWith("U-")).length;
  const nextId = () => {
    let id: string;
    do { counter += 1; id = `U-${String(counter).padStart(3, "0")}`; } while (taken.has(id));
    taken.add(id);
    return id;
  };

  let records: { raw: Record<string, unknown>; rowNumber: number }[] = [];
  const ignored = new Set<string>();

  if (filename.toLowerCase().endsWith(".json")) {
    let data: unknown;
    try { data = JSON.parse(text); } catch { return { rows: [], fatal: "The file is not valid JSON.", ignoredColumns: [] }; }
    const nested = (data as { patients?: unknown })?.patients;
    const isObject = !!data && typeof data === "object" && !Array.isArray(data);
    const list = Array.isArray(data) ? data : Array.isArray(nested) ? nested : isObject ? [data] : null;
    if (!list) return { rows: [], fatal: "JSON must be a patient object, an array of patient objects, or an object with a \"patients\" array.", ignoredColumns: [] };
    records = list.map((raw, i) => ({ raw: raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {}, rowNumber: i + 1 }));
  } else {
    const table = parseCsv(text);
    if (table.length < 2) return { rows: [], fatal: "The CSV needs a header row and at least one patient row.", ignoredColumns: [] };
    const headers = table[0].map((h) => h.trim());
    records = table.slice(1).map((cells, i) => {
      const raw: Record<string, unknown> = {};
      headers.forEach((h, idx) => { raw[h] = cells[idx]; });
      return { raw, rowNumber: i + 1 };
    });
  }

  records = records.map(({ raw, rowNumber }) => {
    const flat = flatten(raw);
    const canon: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(flat)) {
      const n = norm(key);
      const field = CANONICAL.get(n);
      if (field) canon[field] = value;
      else if (IDENTIFIER_COLUMNS.has(n)) ignored.add(`${key.trim()} (identifier, never imported)`);
      else ignored.add(key.trim());
    }
    const notes: string[] = [];
    deriveFromClinical(flat, canon, notes);
    canon.__notes = notes;
    return { raw: canon, rowNumber };
  });

  if (records.length === 0) return { rows: [], fatal: "No patient records were found in the file.", ignoredColumns: [] };

  const rows = records.map(({ raw, rowNumber }) => normalizeRecord(raw, rowNumber, taken, nextId));
  return { rows, ignoredColumns: Array.from(ignored) };
}

export function buildCsvTemplate(): string {
  const header = TEMPLATE_COLUMNS.join(",");
  const mk = (o: Record<string, string>) => TEMPLATE_COLUMNS.map((c) => (o[c] ?? "")).join(",");
  const r1 = mk({
    codeName: "Example Patient A", sex: "male", pregnancyStatus: "not_applicable", age: "58",
    primaryDiagnosis: "Chronic Kidney Disease Stage 3", egfr: "41", hba1c: "6.9", bmi: "27.1",
    dialysisDependent: "no", priorTherapies: "ACE inhibitor", comorbidities: "Hypertension",
  });
  const r2 = mk({
    codeName: "Example Patient B", sex: "female", pregnancyStatus: "not_pregnant", age: "52",
    primaryDiagnosis: "Type 2 Diabetes Mellitus", hba1c: "8.4", bmi: "30.2", historyOfPancreatitis: "no",
    priorTherapies: "Metformin",
  });
  return [header, r1, r2].join("\n") + "\n";
}
