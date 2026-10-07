"use client";

import { useMemo, useSyncExternalStore } from "react";
import { patients as syntheticPatients } from "@/lib/data/patients";
import type { Patient } from "@/lib/types";

// Uploaded patients live only in this browser's localStorage. Nothing is sent to a server.
const KEY = "trialfit.uploadedPatients.v1";
const EMPTY: Patient[] = [];
let cache: Patient[] | null = null;
const listeners = new Set<() => void>();

function read(): Patient[] {
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? (JSON.parse(raw) as Patient[]) : EMPTY;
  } catch {
    cache = EMPTY;
  }
  return cache;
}

function write(next: Patient[]) {
  cache = next.length ? next : EMPTY;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable (private mode / quota): keep the in-memory copy for this session.
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function addUploadedPatients(list: Patient[]) {
  write([...read(), ...list]);
}
export function removeUploadedPatient(id: string) {
  write(read().filter((p) => p.id !== id));
}
export function clearUploadedPatients() {
  write([]);
}

export function useUploadedPatients(): Patient[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

/** Synthetic demo patients followed by any patients the user has uploaded. */
export function useAllPatients(): Patient[] {
  const uploaded = useUploadedPatients();
  return useMemo(() => [...syntheticPatients, ...uploaded], [uploaded]);
}
