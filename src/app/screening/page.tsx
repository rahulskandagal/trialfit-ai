"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { PatientSelector } from "@/components/screening/PatientSelector";
import { TrialSelector } from "@/components/screening/TrialSelector";
import { LoadingSteps, LOADING_STEP_COUNT } from "@/components/screening/LoadingSteps";
import { ScreeningResultView } from "@/components/screening/ScreeningResultView";
import { useAllPatients } from "@/lib/data/patientStore";
import { getTrialById } from "@/lib/data/trials";
import { screenPatient } from "@/lib/engine/ruleEngine";
import type { ScreeningResult } from "@/lib/types";

function ScreeningWorkspace() {
  const params = useSearchParams();
  const [patientId, setPatientId] = useState(params.get("patient") ?? "");
  const [trialId, setTrialId] = useState(params.get("trial") ?? "");
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [step, setStep] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const allPatients = useAllPatients();
  const patient = allPatients.find((p) => p.id === patientId);
  const trial = getTrialById(trialId);

  const autoRan = useRef(false);
  useEffect(() => {
    // Deep links (from Trial Matching / Upload) screen immediately. Uploaded patients load from
    // local storage after hydration, so wait until the linked patient is available.
    if (!autoRan.current && params.get("patient") && params.get("trial") && patient && trial) {
      autoRan.current = true;
      runScreening();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patient, trial]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  function runScreening() {
    if (!patient) return setError("Select a synthetic patient to begin screening.");
    if (!trial) return setError("Select a clinical trial protocol.");
    setError(null);
    setResult(null);
    let current = 0;
    setStep(current);
    const tick = () => {
      current += 1;
      if (current >= LOADING_STEP_COUNT) {
        setResult(screenPatient(patient, trial));
        setStep(null);
        return;
      }
      setStep(current);
      timer.current = setTimeout(tick, 280);
    };
    timer.current = setTimeout(tick, 280);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-navy-900">Screening workspace</h1>
      <p className="mt-1 max-w-2xl text-sm text-slate-600">
        Evaluate a synthetic patient profile against a protocol&apos;s inclusion and exclusion criteria. The
        deterministic rule engine makes the decision; the explanation layer narrates it.
      </p>

      <div className="mt-6 grid gap-6 rounded-sm border border-navy-900/10 bg-white p-5 md:grid-cols-2">
        <PatientSelector value={patientId} onChange={(v) => { setPatientId(v); setResult(null); }} />
        <TrialSelector value={trialId} onChange={(v) => { setTrialId(v); setResult(null); }} />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runScreening}
          disabled={step !== null}
          className="rounded-sm bg-navy-800 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-700 disabled:opacity-60"
        >
          Run AI Screening
        </button>
        {patient && (
          <Link
            href={`/match?patient=${patient.id}`}
            className="rounded-sm border border-navy-900/25 px-5 py-2.5 text-sm font-semibold text-navy-800 hover:bg-navy-900/5"
          >
            Find Matching Trials
          </Link>
        )}
        {error && <p role="alert" className="text-sm font-medium text-clinical-red-700">{error}</p>}
      </div>

      <div className="mt-8">
        {step !== null && <LoadingSteps activeStep={step} />}
        {step === null && !result && (
          <div className="border border-dashed border-navy-900/20 bg-white p-8 text-center">
            <p className="font-semibold text-navy-900">Your screening workspace is ready.</p>
            <p className="mt-1 text-sm text-slate-600">Select a synthetic patient and clinical trial to begin.</p>
          </div>
        )}
        {step === null && result && patient && trial && (
          <ScreeningResultView patient={patient} trial={trial} result={result} />
        )}
      </div>
    </div>
  );
}

export default function ScreeningPage() {
  return (
    <Suspense fallback={null}>
      <ScreeningWorkspace />
    </Suspense>
  );
}
