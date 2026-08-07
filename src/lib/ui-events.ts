export const QUICK_CAPTURE_OPEN_EVENT = "mypersonaos:quick-capture:open";

export function openQuickCapture(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(QUICK_CAPTURE_OPEN_EVENT));
}
