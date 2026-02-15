"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function RouteRealityBlock() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        aria-controls="route-reality-panel"
        className="w-full flex items-center justify-between gap-4 p-6 text-left hover:bg-gray-50/80 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        <div>
          <h3 className="font-semibold text-gray-900 mb-1">Transit & timing</h3>
          <p className="text-sm text-gray-600">
            What to expect from ocean and inland transit.
          </p>
        </div>
        <span className="text-gray-400 flex-shrink-0">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </span>
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div
            id="route-reality-panel"
            role="region"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-100 overflow-hidden"
          >
            <div className="p-6 pt-4 space-y-3 text-sm text-gray-700">
              <p>
                Ocean transit depends on routing and may take several weeks.
              </p>
              <p>
                Inland trucking from Walvis Bay to Zambia typically takes about 1–2 weeks depending on border conditions.
              </p>
              <p>
                Zambia requires pre-clearance before arrival. Missing documents can delay release.
              </p>
              <p className="pt-2 text-gray-800 font-medium">
                We’ll share updates at key milestones: container closing, vessel departure, arrival at Walvis Bay, and arrival in Zambia.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
