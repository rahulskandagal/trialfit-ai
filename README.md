# TrialFit AI

**Live demo**: https://rahulskandagal.github.io/trialfit-ai/

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

- **Screening** â€” patient Ã— protocol, decision, explainable match score, criteria table, decision trace, explanation, missing information
- **What-if simulator** â€” adjust a failed/unrecorded value and re-run the same engine on a temporary copy
- **Trial matching** â€” one patient against all protocols, ranked
- **Protocol intelligence** â€” free-text criteria â†’ structured rules (unrecognised lines are flagged, never guessed), candidate pool, protocol-change impact
- **Recruitment radar** â€” funnel, top blocking criteria, patient Ã— trial heatmap (live from the dataset)
- **Upload data** â€” import patients from CSV/JSON (template and `sample-data/sample-patients.csv` included), validated row by row, stored only in the browser, and compared against every protocol; uploaded patients then appear in every workspace. Identifier columns (name, DOB, MRNâ€¦) are never imported.
- **Validation** â€” accuracy/precision/recall/F1 computed against hand-labelled synthetic cases

## AI explanation mode

By default explanations come from a deterministic generator over the decision trace. Set `ANTHROPIC_API_KEY`
(server-side) to have Claude narrate the result; on any failure the app falls back to deterministic mode and says so.
The AI never alters the eligibility decision.

## Layout

`src/lib/engine` rule engine (single source of truth) Â· `src/lib/data` synthetic data Â· `src/lib/protocol` parser Â·
`src/lib/analytics` radar / impact / validation Â· `src/lib/explain` explanation layer

