"use client";

import Link from "next/link";
import { Package, Mail } from "lucide-react";

export function EmptyPoolsState() {
  return (
    <div className="text-center py-16 px-6 bg-gradient-to-b from-gray-50 to-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
      <div className="w-20 h-20 rounded-full bg-ocean/10 flex items-center justify-center mx-auto mb-5">
        <Package className="w-10 h-10 text-ocean" aria-hidden />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Pools</h3>
      <p className="text-gray-600 mb-2 max-w-md mx-auto">
        We&apos;re preparing our next shipping window. Check back soon or get in touch to be notified when a pool opens.
      </p>
      <p className="text-sm text-gray-500 mb-6">Learn how community pooling works.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/faq" className="btn-secondary">
          How it works
        </Link>
        <Link href="/contact" className="btn-ghost inline-flex items-center gap-2">
          <Mail className="w-4 h-4" aria-hidden />
          Contact us
        </Link>
      </div>
    </div>
  );
}
