import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="font-semibold text-zinc-900">
          Link360
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-zinc-600 hover:text-zinc-900">
            Pricing
          </Link>
          <Link href="/faq" className="text-zinc-600 hover:text-zinc-900">
            FAQ
          </Link>
          <Link
            href="/admin"
            className="text-zinc-500 hover:text-zinc-700"
            aria-label="Admin"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
