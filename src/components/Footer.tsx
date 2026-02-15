import Link from "next/link";

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="container-wide py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-sm">
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-gray-900">
              FAQ
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact
            </Link>
            <Link href="/sponsor" className="text-gray-600 hover:text-gray-900">
              Sponsor
            </Link>
            <Link href="/admin" className="text-gray-600 hover:text-gray-900">
              Admin
            </Link>
          </div>
          <div className="text-center sm:text-right text-sm text-gray-500">
            <p>© {currentYear} Link360. All rights reserved.</p>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-100 text-center text-sm text-gray-500">
          <p>
            This site was built by{" "}
            <Link
              href="https://levrage-studio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-ocean hover:text-ocean-700 underline underline-offset-2"
            >
              LevrAge Innovation Studios
            </Link>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
