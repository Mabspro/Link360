import Link from "next/link";
import Image from "next/image";

export function Nav() {
  return (
    <nav className="border-b border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container-wide flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity" aria-label="Link360 home">
          <div className="relative h-9 w-[140px]">
            <Image
              src="/images/link360-logo.png"
              alt="Link360"
              fill
              className="object-contain object-left"
              priority
              sizes="140px"
            />
          </div>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
            Pricing
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900 font-medium">
            FAQ
          </Link>
          <Link href="/sponsor" className="text-gray-600 hover:text-gray-900 font-medium">
            Sponsor
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
