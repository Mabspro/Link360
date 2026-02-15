"use client";

import { useEffect, useState, useRef } from "react";
import { getPledgeIntent, clearPledgeIntent } from "@/lib/pledge-guide";
import { CollapsiblePledgeCard } from "./CollapsiblePledgeCard";
import { GuideOverlay } from "./GuideOverlay";
import type { PricingConfig } from "./SpacePriceCalculator";

interface PoolPagePledgeGuideProps {
  poolId: string;
  poolSlug: string;
  poolTitle: string;
  pricing?: PricingConfig | null;
}

type GuideStep = "accordion" | "email" | null;

export function PoolPagePledgeGuide({
  poolId,
  poolSlug,
  poolTitle,
  pricing,
}: PoolPagePledgeGuideProps) {
  const [guideStep, setGuideStep] = useState<GuideStep>(null);
  const [initialExpanded, setInitialExpanded] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const intent = getPledgeIntent();
    if (intent !== "from_pool_list") return;

    setInitialExpanded(true);
    setGuideStep("accordion");

    const scrollTimer = setTimeout(() => {
      const el = document.querySelector("[data-guide=\"pledge-accordion\"]");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);

    return () => clearTimeout(scrollTimer);
  }, []);

  const handleExpandedChange = (expanded: boolean) => {
    if (expanded && guideStep === "accordion") {
      setGuideStep("email");
    }
  };

  const handleFormInteraction = () => {
    clearPledgeIntent();
    setGuideStep(null);
  };

  const handleSkip = () => {
    clearPledgeIntent();
    setGuideStep(null);
  };

  return (
    <>
      <CollapsiblePledgeCard
        poolId={poolId}
        poolSlug={poolSlug}
        poolTitle={poolTitle}
        pricing={pricing}
        initialExpanded={initialExpanded}
        onExpandedChange={handleExpandedChange}
        onFormInteraction={handleFormInteraction}
      />
      {guideStep === "accordion" && (
        <GuideOverlay
          active
          targetGuide="pledge-accordion"
          message="Start here to reserve your space."
          onSkip={handleSkip}
        />
      )}
      {guideStep === "email" && (
        <GuideOverlay
          active
          targetGuide="pledge-email"
          message="Enter your email to begin."
          onSkip={handleSkip}
        />
      )}
    </>
  );
}

