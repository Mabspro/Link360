import { FAQ_ITEMS } from "@/lib/faq";

export const metadata = {
  title: "FAQ",
  description: "How Link360 shipping works, rules, prohibited items, and common questions.",
};

export default function FAQPage() {
  return (
    <div className="container-narrow section">
      <h1 className="heading-1">FAQ</h1>
      <p className="text-body-lg mt-2">
        How it works, rules, and prohibited items.
      </p>

      <dl className="mt-8 space-y-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q} className="card p-6">
            <dt className="heading-4">{item.q}</dt>
            <dd className="mt-2 text-body">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
