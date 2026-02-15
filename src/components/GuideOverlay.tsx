"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { clearPledgeIntent, prefersReducedMotion } from "@/lib/pledge-guide";

interface GuideOverlayProps {
  /** data-guide value of the target element */
  targetGuide: string;
  message: string;
  onSkip: () => void;
  /** When true, overlay is shown and will try to attach to target */
  active: boolean;
}

const PADDING = 8;
const RING_WIDTH = 3;

export function GuideOverlay({ targetGuide, message, onSkip, active }: GuideOverlayProps) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);
  const reducedMotion = typeof window !== "undefined" && prefersReducedMotion();

  const updateRect = useCallback(() => {
    if (typeof document === "undefined") return;
    const el = document.querySelector(`[data-guide="${targetGuide}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    const r = el.getBoundingClientRect();
    setRect(r);
  }, [targetGuide]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active || !mounted) return;
    updateRect();
    const ro = new ResizeObserver(updateRect);
    const el = document.querySelector(`[data-guide="${targetGuide}"]`);
    if (el) ro.observe(el);
    window.addEventListener("scroll", updateRect, { capture: true });
    window.addEventListener("resize", updateRect);
    return () => {
      ro.disconnect();
      window.removeEventListener("scroll", updateRect, { capture: true });
      window.removeEventListener("resize", updateRect);
    };
  }, [active, mounted, targetGuide, updateRect]);

  useEffect(() => {
    if (!active || !mounted) return;
    const t = setTimeout(updateRect, 150);
    return () => clearTimeout(t);
  }, [active, mounted, updateRect]);

  if (!active || !mounted) return null;

  const handleSkip = () => {
    clearPledgeIntent();
    onSkip();
  };

  const ringLeft = rect ? rect.left - PADDING - RING_WIDTH : 0;
  const ringTop = rect ? rect.top - PADDING - RING_WIDTH : 0;
  const ringW = rect ? rect.width + (PADDING + RING_WIDTH) * 2 : 0;
  const ringH = rect ? rect.height + (PADDING + RING_WIDTH) * 2 : 0;
  const vw = typeof window !== "undefined" ? window.innerWidth : 0;
  const vh = typeof window !== "undefined" ? window.innerHeight : 0;

  const overlay = (
    <div
      className="fixed inset-0 z-[9999] pointer-events-none"
      role="dialog"
      aria-label="Pledge guide"
    >
      {/* Dim bands: clickable to skip; hole so target stays clickable */}
      {rect && (
        <>
          <div
            className="absolute left-0 top-0 right-0 bg-black/40 pointer-events-auto cursor-pointer"
            style={{ height: Math.max(0, ringTop) }}
            onClick={handleSkip}
            aria-hidden
          />
          <div
            className="absolute left-0 right-0 bg-black/40 pointer-events-auto cursor-pointer"
            style={{ top: ringTop + ringH, height: Math.max(0, vh - ringTop - ringH) }}
            onClick={handleSkip}
            aria-hidden
          />
          <div
            className="absolute bg-black/40 pointer-events-auto cursor-pointer"
            style={{ left: 0, top: ringTop, width: Math.max(0, ringLeft), height: ringH }}
            onClick={handleSkip}
            aria-hidden
          />
          <div
            className="absolute bg-black/40 pointer-events-auto cursor-pointer"
            style={{ left: ringLeft + ringW, top: ringTop, width: Math.max(0, vw - ringLeft - ringW), height: ringH }}
            onClick={handleSkip}
            aria-hidden
          />
        </>
      )}
      {/* Highlight ring */}
      {rect && (
        <div
          className={`absolute rounded-xl border-[3px] border-ocean bg-transparent pointer-events-none ${
            reducedMotion ? "" : "animate-guide-pulse"
          }`}
          style={{
            left: ringLeft,
            top: ringTop,
            width: ringW,
            height: ringH,
          }}
        />
      )}
      {/* Tooltip above target with Skip */}
      {rect && (
        <div
          className="absolute z-[10000] pointer-events-auto"
          style={{
            left: Math.max(12, Math.min(rect.left + rect.width / 2 - 160, vw - 332)),
            bottom: vh - ringTop + 12,
            width: 320,
          }}
        >
          <div className="bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl relative pr-10">
            <p>{message}</p>
            <button
              type="button"
              onClick={handleSkip}
              className="absolute top-2 right-2 text-gray-400 hover:text-white text-xs font-medium"
              aria-label="Skip guide"
            >
              Skip
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return createPortal(overlay, document.body);
}
