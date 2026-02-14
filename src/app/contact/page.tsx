import Link from "next/link";

const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@link360.com";

export default function ContactPage() {
  return (
    <div className="container-narrow section">
      <h1 className="heading-1">Contact</h1>
      <p className="text-body-lg mt-2">
        Get in touch with the Link360 team for questions about shipping pools, pledges, or coordination.
      </p>

      <div className="mt-8 card p-6">
        <h2 className="heading-4 mb-2">Email</h2>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="text-ocean font-medium hover:underline"
        >
          {CONTACT_EMAIL}
        </a>
        <p className="mt-3 text-sm text-gray-600">
          We aim to respond within 1–2 business days. For urgent questions about an existing pledge, please include the pool name and your email in your message.
        </p>
      </div>

      <p className="mt-6 text-body">
        <Link href="/#pools" className="text-ocean font-medium hover:underline">
          ← Back to active shipping pools
        </Link>
      </p>
    </div>
  );
}
