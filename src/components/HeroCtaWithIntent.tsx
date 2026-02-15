"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { setPledgeIntent } from "@/lib/pledge-guide";

export function HeroCtaWithIntent() {
  return (
    <Link
      href="#pools"
      className="btn-primary btn-lg"
      onClick={() => setPledgeIntent("from_hero")}
    >
      Pledge Your Space
      <ArrowRight className="w-5 h-5" />
    </Link>
  );
}
