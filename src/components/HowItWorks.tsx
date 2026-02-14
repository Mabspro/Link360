"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Package, Target, Megaphone, Loader2, Ship } from "lucide-react";

const steps = [
  {
    step: "1",
    title: "Make your pledge",
    desc: "Estimate your cargo volume and costs. No payment until the container is confirmed.",
    icon: Package,
    cta: "Pledge your space",
    ctaHref: "/#pools",
    collapsible: true,
  },
  {
    step: "2",
    title: "Threshold reached",
    desc: "When the community hits the target volume, we know there’s enough interest to move forward.",
    icon: Target,
    collapsible: false,
  },
  {
    step: "3",
    title: "Announcement",
    desc: "Container is confirmed and announced. Pledgers are notified and next steps are shared.",
    icon: Megaphone,
    collapsible: false,
  },
  {
    step: "4",
    title: "Loading reached",
    desc: "Container fills to capacity. Loading dates and instructions are communicated.",
    icon: Loader2,
    collapsible: false,
  },
  {
    step: "5",
    title: "Ship & tracking updates",
    desc: "Container ships. Tracking updates and announcements keep the community informed.",
    icon: Ship,
    collapsible: false,
  },
];

export function HowItWorks() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section className="section bg-gray-50">
      <div className="container-wide">
        <div className="max-w-4xl mx-auto">
          <h2 className="heading-2 text-center mb-2">How the community model works</h2>
          <p className="text-body text-center mb-10">
            From pledges to shipment—clear steps so everyone knows where we are
          </p>
          <div className="flex flex-col gap-4">
            {steps.map((item, index) => {
              const Icon = item.icon;
              const isExpanded = expandedStep === index;
              const isCollapsible = item.collapsible === true;

              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => isCollapsible && setExpandedStep(isExpanded ? null : index)}
                    className={`w-full flex items-center gap-4 p-5 text-left ${isCollapsible ? "cursor-pointer hover:bg-gray-50/80 transition-colors" : ""}`}
                  >
                    <div className="w-11 h-11 rounded-xl bg-ocean text-white flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900">{item.title}</h3>
                      {!isCollapsible && (
                        <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                      )}
                    </div>
                    {isCollapsible && (
                      <span className="text-gray-400 flex-shrink-0">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {isCollapsible && isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100 overflow-hidden"
                      >
                        <div className="p-5 pt-2 bg-gray-50/50">
                          <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                          {item.cta && item.ctaHref && (
                            <Link
                              href={item.ctaHref}
                              className="inline-flex items-center gap-2 text-sm font-medium text-ocean hover:text-ocean-700"
                            >
                              {item.cta}
                              <span aria-hidden>→</span>
                            </Link>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
