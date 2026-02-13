import { FAQ_ITEMS } from "@/lib/faq";

export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">FAQ</h1>
      <p className="mt-2 text-zinc-600">
        How it works, rules, and prohibited items.
      </p>

      <dl className="mt-8 space-y-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.q}>
            <dt className="font-semibold text-zinc-900">{item.q}</dt>
            <dd className="mt-1 text-zinc-600">{item.a}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
