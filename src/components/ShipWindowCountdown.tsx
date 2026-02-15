"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface ShipWindowCountdownProps {
  shipsAt: string | null;
}

function getTimeRemaining(target: Date) {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) return null;

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return { days, hours, minutes };
}

export function ShipWindowCountdown({ shipsAt }: ShipWindowCountdownProps) {
  const [remaining, setRemaining] = useState<{ days: number; hours: number; minutes: number } | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!shipsAt) return;

    const target = new Date(shipsAt + "T23:59:59");
    setRemaining(getTimeRemaining(target));

    const interval = setInterval(() => {
      const r = getTimeRemaining(target);
      setRemaining(r);
      if (!r) clearInterval(interval);
    }, 60_000); // update every minute

    return () => clearInterval(interval);
  }, [shipsAt]);

  if (!mounted || !shipsAt) return null;

  const target = new Date(shipsAt + "T23:59:59");
  const isPast = target.getTime() <= Date.now();

  if (isPast) {
    return (
      <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm">
        <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <span className="text-amber-800 font-medium">Ship window has passed — check for updates below</span>
      </div>
    );
  }

  if (!remaining) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
      <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-blue-900">Ship window countdown</p>
        <div className="flex items-baseline gap-3 mt-1">
          <CountdownUnit value={remaining.days} label="days" />
          <CountdownUnit value={remaining.hours} label="hrs" />
          <CountdownUnit value={remaining.minutes} label="min" />
        </div>
      </div>
      <p className="text-xs text-blue-600 whitespace-nowrap">
        {target.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </p>
    </div>
  );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <span className="text-center">
      <span className="text-lg font-bold text-blue-800 tabular-nums">{value}</span>
      <span className="text-xs text-blue-600 ml-0.5">{label}</span>
    </span>
  );
}
