import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="heading-1 text-center">Page not found</h1>
      <p className="mt-2 text-body text-gray-600 text-center max-w-md">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link href="/" className="btn-primary">
          Home
        </Link>
        <Link href="/pricing" className="btn-secondary">
          Pricing
        </Link>
      </div>
    </div>
  );
}
