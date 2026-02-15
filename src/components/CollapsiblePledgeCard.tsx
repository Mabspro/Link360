"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PledgeForm } from "./PledgeForm";
import type { PricingConfig } from "./SpacePriceCalculator";

interface CollapsiblePledgeCardProps {
  poolId: string;
  poolSlug: string;
  poolTitle: string;
  pricing?: PricingConfig | null;
  initialExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onFormInteraction?: () => void;
}

export function CollapsiblePledgeCard({
  poolId,
  poolSlug,
  poolTitle,
  pricing,
  initialExpanded = false,
  onExpandedChange,
  onFormInteraction,
}: CollapsiblePledgeCardProps) {
  const [expanded, setExpanded] = useState(initialExpanded);

  const toggle = () => {
    const next = !expanded;
    setExpanded(next);
    onExpandedChange?.(next);
  };

  return (
    <div className="card overflow-hidden border-l-4 border-l-ocean bg-blue-50/40 shadow-sm">
      <button
        type="button"
        data-guide="pledge-accordion"
        onClick={toggle}
        aria-expanded={expanded}
        aria-controls="pledge-form-panel"
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-blue-100/50 transition-colors rounded-r-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <div>
          <h2 id="pledge-form-heading" className="heading-3 mb-1 text-zambia-green">Make your pledge</h2>
          <p className="text-sm text-green-800/90">
            No payment now. We&apos;ll contact you when the container is confirmed.
          </p>
        </div>
        <span className="text-zambia-green/80 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            id="pledge-form-panel"
            role="region"
            aria-labelledby="pledge-form-heading"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 pt-4 bg-gray-50/50">
              <PledgeForm poolId={poolId} poolSlug={poolSlug} poolTitle={poolTitle} pricing={pricing} onFormInteraction={onFormInteraction} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
