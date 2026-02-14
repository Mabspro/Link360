import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-wide flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold text-ocean hover:text-ocean-700 transition-colors">
          Link360
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
            Pricing
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900 font-medium">
            FAQ
          </Link>
          <Link
            href="/admin"
            className="text-gray-500 hover:text-gray-700"
            aria-label="Admin"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}
