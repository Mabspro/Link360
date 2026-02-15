import Link from "next/link";
import { SponsorRequestForm } from "./SponsorRequestForm";

export default function SponsorPage() {
  return (
    <div className="container-narrow section">
      <h1 className="heading-1">List a container</h1>
      <p className="text-body-lg mt-2">
        Interested in sponsoring a shipping pool? Tell us about your company and how you’d like to contribute. We’ll get back to you shortly.
      </p>

      <div className="mt-8 card p-6">
        <SponsorRequestForm />
      </div>

      <p className="mt-6 text-body">
        <Link href="/#pools" className="text-ocean font-medium hover:underline">
          ← Back to active shipping pools
        </Link>
      </p>
    </div>
  );
}
