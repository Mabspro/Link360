"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { SpacePriceCalculator, type PricingConfig } from "./SpacePriceCalculator";

interface CollapsibleCalculatorProps {
  pricing?: PricingConfig | null;
}

export function CollapsibleCalculator({ pricing }: CollapsibleCalculatorProps = {}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls="calculator-panel"
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <div>
          <h2 className="heading-4 mb-1">Space + price calculator</h2>
          <p className="text-sm text-gray-600">
            Estimate volume and shipping cost before you pledge.
          </p>
        </div>
        <span className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            id="calculator-panel"
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 pt-4 bg-gray-50/50">
              <SpacePriceCalculator embedded pricing={pricing} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
