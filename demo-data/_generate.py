import json, os, shutil

OUT = "demo-data"
specs = []  # (id, trial, expect, why, record)


def rec(pid, age, sex, dx, preg=None, labs=None, vitals=None, hist=None, treat=None, extra=None):
    if preg is None:
        preg = "Not applicable" if sex == "Male" else "Not pregnant"
    d = {
        "patient_id": pid,
        "patient_name": "Demo " + pid,
        "data_type": "synthetic",
        "purpose": "trialfit_live_demo",
        "primary_diagnosis": dx,
        "demographics": {"age": age, "sex": sex, "pregnancy_status": preg},
        "medical_history": hist or {},
        "vital_signs": vitals or {},
        "laboratory_results": labs or {},
        "treatment": treat or {},
    }
    if extra:
        d["clinical_information"] = extra
    return d


counter = [100]


def add(trial, expect, why, **kw):
    counter[0] += 1
    pid = f"SYN-{counter[0]}"
    specs.append((pid, trial, expect, why, rec(pid, **kw)))


CKD = "Chronic Kidney Disease Stage 3"
add("T-001", "ELIGIBLE", "eGFR 35 in range", age=52, sex="Male", dx=CKD, labs={"egfr": 35, "hba1c_percent": 6.5}, hist={"dialysis_dependent": False})
add("T-001", "ELIGIBLE", "eGFR 55, age 71", age=71, sex="Female", dx=CKD, labs={"egfr": 55, "hba1c_percent": 7.4}, hist={"dialysis_dependent": False})
add("T-001", "NOT_ELIGIBLE", "eGFR 24 below 30", age=60, sex="Male", dx=CKD, labs={"egfr": 24}, hist={"dialysis_dependent": False})
add("T-001", "NOT_ELIGIBLE", "eGFR 68 above 59", age=49, sex="Female", dx=CKD, labs={"egfr": 68}, hist={"dialysis_dependent": False})
add("T-001", "NOT_ELIGIBLE", "dialysis dependent", age=66, sex="Male", dx=CKD, labs={"egfr": 32}, hist={"dialysis_dependent": True})
add("T-001", "NOT_ELIGIBLE", "age 84 above 80", age=84, sex="Female", dx=CKD, labs={"egfr": 40}, hist={"dialysis_dependent": False})
add("T-001", "NEEDS_REVIEW", "dialysis status missing", age=57, sex="Male", dx=CKD, labs={"egfr": 42})

LUNG = "Non-Small Cell Lung Cancer Stage IV"
lung_ok = {"prior_immunotherapy": False, "autoimmune_disease": False}
add("T-002", "ELIGIBLE", "ECOG 0, PD-L1 80", age=58, sex="Male", dx=LUNG, labs={"pdl1_expression": 80, "bilirubin_uln_ratio": 0.8}, hist={"ecog_status": 0, **lung_ok})
add("T-002", "ELIGIBLE", "ECOG 1, PD-L1 5", age=64, sex="Female", dx="Non-Small Cell Lung Cancer Stage IIIB", preg="Not applicable (post-menopausal)", labs={"pdl1_expression": 5, "bilirubin_uln_ratio": 1.2}, hist={"ecog_status": 1, **lung_ok})
add("T-002", "NOT_ELIGIBLE", "ECOG 3 above 1", age=72, sex="Male", dx=LUNG, labs={"pdl1_expression": 50, "bilirubin_uln_ratio": 1.0}, hist={"ecog_status": 3, **lung_ok})
add("T-002", "NOT_ELIGIBLE", "prior immunotherapy", age=61, sex="Male", dx=LUNG, labs={"pdl1_expression": 60, "bilirubin_uln_ratio": 0.9}, hist={"ecog_status": 1, "prior_immunotherapy": True, "autoimmune_disease": False})
add("T-002", "NOT_ELIGIBLE", "PD-L1 0 below 1", age=55, sex="Female", dx=LUNG, labs={"pdl1_expression": 0, "bilirubin_uln_ratio": 0.9}, hist={"ecog_status": 1, **lung_ok})
add("T-002", "NOT_ELIGIBLE", "bilirubin 2.4 x ULN", age=67, sex="Male", dx=LUNG, labs={"pdl1_expression": 30, "bilirubin_uln_ratio": 2.4}, hist={"ecog_status": 1, **lung_ok})
add("T-002", "NOT_ELIGIBLE", "autoimmune disease", age=59, sex="Female", dx=LUNG, labs={"pdl1_expression": 40, "bilirubin_uln_ratio": 1.0}, hist={"ecog_status": 0, "prior_immunotherapy": False, "autoimmune_disease": True})
add("T-002", "NEEDS_REVIEW", "PD-L1 not tested", age=62, sex="Male", dx=LUNG, labs={"bilirubin_uln_ratio": 1.0}, hist={"ecog_status": 1, **lung_ok})

T2 = "Type 2 Diabetes Mellitus"


def t2(**k):
    hist = {"diabetes": True, "diabetes_type": "Type 2"}
    hist.update(k.pop("hist", {}))
    return dict(dx=T2, hist=hist, **k)


nopanc = {"history_of_pancreatitis": False}
add("T-003", "ELIGIBLE", "HbA1c 7.8, BMI 29", **t2(age=40, sex="Male", labs={"hba1c_percent": 7.8, "egfr": 90}, extra={"bmi": 29.0}, hist=nopanc))
add("T-003", "ELIGIBLE", "HbA1c 10.2, BMI 35", **t2(age=68, sex="Female", labs={"hba1c_percent": 10.2, "egfr": 65}, extra={"bmi": 35.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "HbA1c 6.4 below 7.0", **t2(age=50, sex="Male", labs={"hba1c_percent": 6.4, "egfr": 85}, extra={"bmi": 28.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "HbA1c 11.5 above 10.5", **t2(age=47, sex="Female", labs={"hba1c_percent": 11.5, "egfr": 80}, extra={"bmi": 31.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "BMI 23 below 25", **t2(age=45, sex="Male", labs={"hba1c_percent": 8.0, "egfr": 88}, extra={"bmi": 23.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "eGFR 25 excluded", **t2(age=63, sex="Female", labs={"hba1c_percent": 8.5, "egfr": 25}, extra={"bmi": 30.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "pancreatitis history", **t2(age=54, sex="Male", labs={"hba1c_percent": 9.0, "egfr": 78}, extra={"bmi": 32.0}, hist={"history_of_pancreatitis": True}))
add("T-003", "NOT_ELIGIBLE", "age 78 above 75", **t2(age=78, sex="Male", labs={"hba1c_percent": 8.2, "egfr": 60}, extra={"bmi": 27.0}, hist=nopanc))
add("T-003", "NOT_ELIGIBLE", "pregnant (exclusion)", **t2(age=31, sex="Female", preg="Pregnant", labs={"hba1c_percent": 8.1, "egfr": 92}, extra={"bmi": 30.0}, hist=nopanc))
add("T-003", "NEEDS_REVIEW", "pancreatitis history missing", **t2(age=44, sex="Female", labs={"hba1c_percent": 8.9, "egfr": 88}, extra={"bmi": 33.0}))
add("T-003", "NEEDS_REVIEW", "eGFR missing", **t2(age=51, sex="Male", labs={"hba1c_percent": 8.3}, extra={"bmi": 29.5}, hist=nopanc))

HT = "Resistant Hypertension"
add("T-004", "ELIGIBLE", "SBP 148, 3 medicines", age=55, sex="Female", dx=HT, labs={"egfr": 60}, vitals={"blood_pressure": "148/92"}, hist={"antihypertensive_med_count": 3, "hypertension": True})
add("T-004", "ELIGIBLE", "SBP 170, 5 medicines", age=69, sex="Male", dx=HT, labs={"egfr": 52}, vitals={"blood_pressure": "170/100"}, hist={"antihypertensive_med_count": 5, "hypertension": True})
add("T-004", "NOT_ELIGIBLE", "SBP 132 below 140", age=60, sex="Male", dx=HT, labs={"egfr": 70}, vitals={"blood_pressure": "132/84"}, hist={"antihypertensive_med_count": 3, "hypertension": True})
add("T-004", "NOT_ELIGIBLE", "only 2 medicines", age=58, sex="Female", dx=HT, labs={"egfr": 75}, vitals={"blood_pressure": "155/95"}, hist={"antihypertensive_med_count": 2, "hypertension": True})
add("T-004", "NOT_ELIGIBLE", "eGFR 28 excluded", age=71, sex="Male", dx=HT, labs={"egfr": 28}, vitals={"blood_pressure": "160/96"}, hist={"antihypertensive_med_count": 4, "hypertension": True})
add("T-004", "NEEDS_REVIEW", "medicine count missing", age=53, sex="Female", dx=HT, labs={"egfr": 68}, vitals={"blood_pressure": "152/94"}, hist={"hypertension": True})

RA = "Rheumatoid Arthritis"
add("T-005", "ELIGIBLE", "8 months, methotrexate", age=38, sex="Female", dx=RA, hist={"disease_duration_months": 8, "active_infection": False}, treat={"previous_treatments": ["Methotrexate"]})
add("T-005", "ELIGIBLE", "60 months, methotrexate", age=57, sex="Male", dx=RA, hist={"disease_duration_months": 60, "active_infection": False}, treat={"previous_treatments": ["Methotrexate", "Prednisolone"]})
add("T-005", "NOT_ELIGIBLE", "duration 4 months below 6", age=33, sex="Female", dx=RA, hist={"disease_duration_months": 4, "active_infection": False}, treat={"previous_treatments": ["Methotrexate"]})
add("T-005", "NOT_ELIGIBLE", "no methotrexate history", age=46, sex="Female", dx=RA, hist={"disease_duration_months": 20, "active_infection": False}, treat={"previous_treatments": ["Sulfasalazine"]})
add("T-005", "NOT_ELIGIBLE", "active infection", age=52, sex="Male", dx=RA, hist={"disease_duration_months": 30, "active_infection": True}, treat={"previous_treatments": ["Methotrexate"]})
add("T-005", "NOT_ELIGIBLE", "pregnant (exclusion)", age=29, sex="Female", preg="Pregnant", dx=RA, hist={"disease_duration_months": 18, "active_infection": False}, treat={"previous_treatments": ["Methotrexate"]})
add("T-005", "NEEDS_REVIEW", "infection status missing", age=44, sex="Female", dx=RA, hist={"disease_duration_months": 24}, treat={"previous_treatments": ["Methotrexate"]})

OV = "Ovarian Cancer"
pm = "Not applicable (post-menopausal)"
add("T-006", "ELIGIBLE", "BRCA positive, ECOG 0", age=59, sex="Female", dx=OV, preg=pm, hist={"ecog_status": 0, "brca_mutation": "positive", "prior_parp_inhibitor": False}, treat={"previous_treatments": ["Carboplatin", "Paclitaxel"]})
add("T-006", "ELIGIBLE", "BRCA positive, ECOG 2", age=66, sex="Female", dx=OV, preg=pm, hist={"ecog_status": 2, "brca_mutation": "positive", "prior_parp_inhibitor": False}, treat={"previous_treatments": ["Carboplatin"]})
add("T-006", "NOT_ELIGIBLE", "BRCA negative", age=54, sex="Female", dx=OV, hist={"ecog_status": 1, "brca_mutation": "negative", "prior_parp_inhibitor": False})
add("T-006", "NOT_ELIGIBLE", "ECOG 3 above 2", age=70, sex="Female", dx=OV, preg=pm, hist={"ecog_status": 3, "brca_mutation": "positive", "prior_parp_inhibitor": False})
add("T-006", "NOT_ELIGIBLE", "prior PARP inhibitor", age=62, sex="Female", dx=OV, preg=pm, hist={"ecog_status": 1, "brca_mutation": "positive", "prior_parp_inhibitor": True})
add("T-006", "NEEDS_REVIEW", "BRCA not tested", age=48, sex="Female", dx=OV, hist={"ecog_status": 0, "prior_parp_inhibitor": False})
add("T-006", "NEEDS_REVIEW", "ECOG missing", age=56, sex="Female", dx=OV, hist={"brca_mutation": "positive", "prior_parp_inhibitor": False})

# multi-trial: one patient matching two protocols
add("T-003+T-004", "ELIGIBLE", "diabetes AND resistant hypertension: eligible for two trials", age=56, sex="Male", dx=T2,
    labs={"hba1c_percent": 8.5, "egfr": 75}, extra={"bmi": 30.0}, vitals={"blood_pressure": "150/94"},
    hist={"diabetes": True, "diabetes_type": "Type 2", "hypertension": True, "history_of_pancreatitis": False, "antihypertensive_med_count": 3})

for d in ("patients", "batches"):
    shutil.rmtree(f"{OUT}/{d}", ignore_errors=True)
    os.makedirs(f"{OUT}/{d}")

by_trial = {}
for pid, trial, expect, why, r in specs:
    group = "multi" if "+" in trial else trial
    fn = f"{group}_{expect.lower()}_{pid}.json"
    with open(f"{OUT}/patients/{fn}", "w") as f:
        json.dump(r, f, indent=2)
    by_trial.setdefault(group, []).append(r)

for group, rs in by_trial.items():
    name = "multi_trial" if group == "multi" else group
    with open(f"{OUT}/batches/batch_{name}.json", "w") as f:
        json.dump({"patients": rs}, f, indent=2)
with open(f"{OUT}/batches/batch_all_patients.json", "w") as f:
    json.dump({"patients": [s[4] for s in specs]}, f, indent=2)
with open(f"{OUT}/_expected.json", "w") as f:
    json.dump([{"id": s[0], "trial": s[1], "expected": s[2], "why": s[3]} for s in specs], f, indent=2)
print(len(specs), "patients generated")
