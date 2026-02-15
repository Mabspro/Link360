"use client";

import { MessageCircle, Link as LinkIcon, Check } from "lucide-react";
import { useState } from "react";

interface WhatsAppShareButtonProps {
  poolTitle: string;
  poolSlug: string;
  pctFull: number;
  /** Variant: "pool" for pool page, "confirmation" for post-pledge */
  variant?: "pool" | "confirmation";
  className?: string;
}

export function WhatsAppShareButton({
  poolTitle,
  poolSlug,
  pctFull,
  variant = "pool",
  className = "",
}: WhatsAppShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const poolUrl = typeof window !== "undefined"
    ? `${window.location.origin}/pool/${poolSlug}`
    : `/pool/${poolSlug}`;

  const message =
    variant === "confirmation"
      ? `I just pledged space on Link360! 🚢\n\n"${poolTitle}" is ${Math.round(pctFull)}% full.\n\nPledge your space too:\n${poolUrl}`
      : `🚢 Shipping pool: ${poolTitle}\n\n${Math.round(pctFull)}% full — pledge your space before it fills up!\n\n${poolUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(poolUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#25D366] text-white rounded-lg font-medium text-sm hover:bg-[#20BD5A] transition-colors shadow-sm"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle className="w-4 h-4" />
        Share on WhatsApp
      </a>
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-3 py-2.5 border-2 border-gray-200 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        aria-label="Copy pool link"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-green-600" />
            <span className="text-green-600">Copied!</span>
          </>
        ) : (
          <>
            <LinkIcon className="w-4 h-4" />
            Copy link
          </>
        )}
      </button>
    </div>
  );
}
