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
}

export function CollapsiblePledgeCard({ poolId, poolSlug, poolTitle, pricing }: CollapsiblePledgeCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50/80 transition-colors"
      >
        <div>
          <h2 className="heading-3 mb-1">Make your pledge</h2>
          <p className="text-sm text-gray-600">
            No payment now. We&apos;ll contact you when the container is confirmed.
          </p>
        </div>
        <span className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 pt-4 bg-gray-50/50">
              <PledgeForm poolId={poolId} poolSlug={poolSlug} poolTitle={poolTitle} pricing={pricing} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
