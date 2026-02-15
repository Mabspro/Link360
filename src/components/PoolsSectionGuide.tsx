"use client";

import { useEffect, useRef, useState } from "react";
import { getPledgeIntent, clearPledgeIntent } from "@/lib/pledge-guide";
import { GuideOverlay } from "./GuideOverlay";

interface PoolsSectionGuideProps {
  children: React.ReactNode;
  hasPools?: boolean;
}

/** Runs on home page: when intent is from_hero, scrolls to section, flashes heading, shows guide on first pool CTA. */
export function PoolsSectionGuide({ children, hasPools = true }: PoolsSectionGuideProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [flashed, setFlashed] = useState(false);

  useEffect(() => {
    const intent = getPledgeIntent();
    if (intent !== "from_hero" || !hasPools) return;

    const section = document.getElementById("pools");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const flashTimer = setTimeout(() => {
      const h2 = sectionRef.current?.querySelector("h2");
      if (h2 && !flashed) {
        h2.classList.add("ring-2", "ring-ocean/40", "ring-offset-2", "rounded-lg");
        setFlashed(true);
        setTimeout(() => {
          h2.classList.remove("ring-2", "ring-ocean/40", "ring-offset-2", "rounded-lg");
        }, 1200);
      }
    }, 400);

    const guideTimer = setTimeout(() => setShowGuide(hasPools), 600);

    return () => {
      clearTimeout(flashTimer);
      clearTimeout(guideTimer);
    };
  }, [flashed, hasPools]);

  const handleSkip = () => {
    setShowGuide(false);
  };

  return (
    <>
      <div ref={sectionRef}>{children}</div>
      <GuideOverlay
        active={showGuide}
        targetGuide="pool-cta"
        message="Choose a pool to pledge into."
        onSkip={handleSkip}
      />
    </>
  );
}
