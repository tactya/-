import { useState, type Dispatch, type SetStateAction } from "react";
import type { SkinProps } from "./AppSkins";
import type { UiValue } from "./schema";
function matches(value: unknown, initial: UiValue): value is UiValue {
  return Array.isArray(initial)
    ? Array.isArray(value) && value.every((v) => typeof v === "string")
    : typeof value === typeof initial &&
        (typeof value !== "number" || Number.isFinite(value));
}
export function useSkinState<T extends UiValue>(
  p: Pick<SkinProps, "ui" | "onUi">,
  key: string,
  initial: T,
): [T, Dispatch<SetStateAction<T>>] {
  const [local, setLocal] = useState(initial);
  const stored = p.ui?.[key];
  const value = (matches(stored, initial) ? stored : local) as T;
  const set: Dispatch<SetStateAction<T>> = (next) => {
    const updated =
      typeof next === "function" ? (next as (value: T) => T)(value) : next;
    setLocal(updated);
    p.onUi?.(key, updated);
  };
  return [value, set];
}
