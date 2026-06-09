import type { PersistedAppState } from "./types";

const STORAGE_KEY = "shopping-saver-state-v3";

export function loadSnapshot(): PersistedAppState | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PersistedAppState;
  } catch {
    return null;
  }
}

export function saveSnapshot(snapshot: PersistedAppState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function clearSnapshot() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}
