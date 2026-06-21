import { useSyncExternalStore } from "react";
import { useResumeStore } from "@/store/useResumeStore";

export function useHasHydrated() {
  return useSyncExternalStore(
    (cb) => useResumeStore.persist.onFinishHydration(cb),
    () => useResumeStore.persist.hasHydrated(),
    () => false,
  );
}
