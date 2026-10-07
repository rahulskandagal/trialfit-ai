import { NextResponse } from "next/server";
import { getPatientById } from "@/lib/data/patients";
import { getTrialById } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import { generateAiExplanation } from "@/lib/explain/aiExplain";
import { generateDeterministicExplanation } from "@/lib/explain/explanationEngine";

export async function POST(request: Request) {
  let body: { patientId?: string; trialId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const patient = body.patientId ? getPatientById(body.patientId) : undefined;
  const trial = body.trialId ? getTrialById(body.trialId) : undefined;
  if (!patient || !trial) {
    return NextResponse.json({ error: "Unknown patient or trial." }, { status: 404 });
  }

  // The deterministic engine is authoritative; the AI layer only narrates its result.
  const result = screenPatient(patient, trial);
  const keyConfigured = Boolean(process.env.ANTHROPIC_API_KEY);
  const aiText = keyConfigured ? await generateAiExplanation(patient, trial, result) : null;

  if (aiText) {
    return NextResponse.json({ text: aiText, mode: "ai" });
  }
  return NextResponse.json({
    text: generateDeterministicExplanation(patient, trial, result),
    mode: "deterministic",
    reason: keyConfigured ? "unavailable" : "not_configured",
  });
}
