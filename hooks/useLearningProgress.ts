"use client";

import { useSyncExternalStore } from "react";

import {
  defaultLearningProgress,
  LEARNING_PROGRESS_STORAGE_KEY,
  loadLearningProgress,
  saveLearningProgress,
} from "@/lib/learning-progress";
import type { LearningProgress } from "@/types/learning-progress";

type SetProgressAction =
  | LearningProgress
  | ((current: LearningProgress) => LearningProgress);

const PROGRESS_CHANGED_EVENT = "patto-learning-progress-changed";
let cachedRawProgress: string | null = null;
let cachedProgress: LearningProgress = defaultLearningProgress;

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener(PROGRESS_CHANGED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(PROGRESS_CHANGED_EVENT, onStoreChange);
  };
}

function getSnapshot() {
  const rawProgress = window.localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY);

  if (rawProgress === cachedRawProgress) {
    return cachedProgress;
  }

  cachedRawProgress = rawProgress;
  cachedProgress = loadLearningProgress();

  return cachedProgress;
}

function getServerSnapshot() {
  return defaultLearningProgress;
}

export function useLearningProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  function setProgress(action: SetProgressAction) {
    const current = loadLearningProgress();
    const next = typeof action === "function" ? action(current) : action;

    saveLearningProgress(next);
    cachedRawProgress = window.localStorage.getItem(LEARNING_PROGRESS_STORAGE_KEY);
    cachedProgress = next;
    window.dispatchEvent(new Event(PROGRESS_CHANGED_EVENT));
  }

  return {
    progress,
    setProgress,
  };
}
