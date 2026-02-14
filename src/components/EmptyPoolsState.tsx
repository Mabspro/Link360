"use client";

import Link from "next/link";
import { Package } from "lucide-react";

export function EmptyPoolsState() {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Package className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Pools</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        We&apos;re preparing our next shipping window. Check back soon or visit our FAQ to learn how
        pooling works.
      </p>
      <Link href="/faq" className="btn-secondary">
        How it works
      </Link>
    </div>
  );
}
