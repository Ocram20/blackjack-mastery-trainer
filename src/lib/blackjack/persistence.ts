import type { Card } from "./cards";

export type TrainingMode = "random" | "split" | "double" | "soft";

export interface Progress {
  bankroll: number;
  runningCount: number;
  cardsDealt: number;
  shoe: Card[];
  stats: { correct: number; errors: number; quizOk: number; quizKo: number; wins: number; losses: number; pushes: number };
  players: number;
  mode: TrainingMode;
}

export const STORAGE_KEY = "bj-trainer-progress-v1";

export const emptyStats = {
  correct: 0,
  errors: 0,
  quizOk: 0,
  quizKo: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
};

export function loadProgress(): Partial<Progress> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Progress>;
    if (typeof parsed !== "object" || parsed === null) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveProgress(p: Progress) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* quota o storage non disponibile: ignoriamo */
  }
}

export function clearProgress() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
