import type { TixelEvent } from "@/lib/events";

const STORAGE_KEY = "tixel.events.v1";

function canUseDOM() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadLocalEvents(): TixelEvent[] {
  if (!canUseDOM()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as TixelEvent[];
  } catch {
    return [];
  }
}

export function saveLocalEvents(events: TixelEvent[]) {
  if (!canUseDOM()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

export function addLocalEvent(event: TixelEvent) {
  const current = loadLocalEvents();
  saveLocalEvents([event, ...current]);
}

