# TrialFit AI

AI-assisted clinical trial screening and recruitment decision support. A deterministic rule engine makes every
eligibility decision; AI only assists with explanation and protocol interpretation.

All patients, trials and sponsors are **synthetic demonstration data**. This is a research prototype, not a
clinical tool.

## Run

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
```

## Features

- **Screening** — patient × protocol, decision, explainable match score, criteria table, decision trace, explanation, missing information
- **What-if simulator** — adjust a failed/unrecorded value and re-run the same engine on a temporary copy
- **Trial matching** — one patient against all protocols, ranked
- **Protocol intelligence** — free-text criteria → structured rules (unrecognised lines are flagged, never guessed), candidate pool, protocol-change impact
- **Recruitment radar** — funnel, top blocking criteria, patient × trial heatmap (live from the dataset)
- **Upload data** — import patients from CSV/JSON (template and `sample-data/sample-patients.csv` included), validated row by row, stored only in the browser, and compared against every protocol; uploaded patients then appear in every workspace. Identifier columns (name, DOB, MRN…) are never imported.
- **Validation** — accuracy/precision/recall/F1 computed against hand-labelled synthetic cases

## AI explanation mode

By default explanations come from a deterministic generator over the decision trace. Set `ANTHROPIC_API_KEY`
(server-side) to have Claude narrate the result; on any failure the app falls back to deterministic mode and says so.
The AI never alters the eligibility decision.

## Layout

`src/lib/engine` rule engine (single source of truth) · `src/lib/data` synthetic data · `src/lib/protocol` parser ·
`src/lib/analytics` radar / impact / validation · `src/lib/explain` explanation layer
