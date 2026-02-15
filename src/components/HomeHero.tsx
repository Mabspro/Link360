"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Package, Shield, Users, TrendingUp } from "lucide-react";
import { HeroCtaWithIntent } from "./HeroCtaWithIntent";

export function HomeHero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Subtle port background — credibility anchor */}
      <div className="absolute inset-0 -z-10">
        <img
          src="/images/hero-port.jpg"
          alt=""
          className="w-full h-full object-cover opacity-[0.22]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2540]/50 via-blue-50/70 to-white/95" />
      </div>
      <div className="container-wide text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Now accepting pledges
          </span>
          <h1 className="heading-display mb-6">
            Ship with Confidence from
            <br />
            <span className="text-gradient">NorCal to Zambia</span>
          </h1>
          <p className="text-body-lg max-w-2xl mx-auto mb-8">
            Join our community-driven shipping pools. Pledge your space, watch the container fill,
            and ship when we hit our goal. No payment until confirmed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <HeroCtaWithIntent />
            <Link href="#how-it-works" className="btn-secondary btn-lg">
              See How It Works
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-600" />
              No payment until confirmed
            </span>
            <span className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              Community-driven
            </span>
            <span className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              Transparent pricing
            </span>
            <span className="flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              Reliable delivery
            </span>
          </div>
        </motion.div>
      </div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
