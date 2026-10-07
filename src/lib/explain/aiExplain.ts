import type { Patient, ScreeningResult, Trial } from "@/lib/types";

/**
 * Optional live-model explanation path. Server-only: must never be imported
 * from a client component, since it reads ANTHROPIC_API_KEY.
 *
 * Returns null when no key is configured, or when the call fails for any
 * reason — callers must fall back to generateDeterministicExplanation() and
 * surface that fallback to the user rather than silently hiding it.
 */
export async function generateAiExplanation(
  patient: Patient,
  trial: Trial,
  result: ScreeningResult
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;

  const trace = result.evaluations.map((e) => ({
    criterion: e.criterion.label,
    rule: e.criterion.ruleText,
    mandatory: e.criterion.mandatory,
    patientValue: e.patientValueDisplay,
    status: e.status,
  }));

  const prompt = `You are generating a concise, clinically neutral explanation of an automated eligibility screening result. The deterministic rule engine — not you — made the decision below. Summarize WHY in 2-4 sentences using only the facts given. Never suggest a different decision, never add medical advice, never invent data.

Patient: ${patient.codeName}
Trial: ${trial.title}
Decision: ${result.decision}
Match score: ${result.matchScorePercent ?? "not available"}
Criteria trace: ${JSON.stringify(trace)}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    const text = data?.content?.[0]?.text;
    return typeof text === "string" && text.trim().length > 0 ? text.trim() : null;
  } catch {
    return null;
  }
}
