import { STANDARD_BOXES, in3ToFt3 } from "@/lib/constants";
import { estShippingCost, estPickupFee } from "@/lib/pricing";

export default function PricingPage() {
  const examples = Object.entries(STANDARD_BOXES).map(([code, dim]) => {
    const in3 = dim.length * dim.width * dim.height;
    const ft3 = in3ToFt3(in3);
    const shipping = estShippingCost(in3);
    const pickupIn = estPickupFee("in_city", 1);
    const pickupOut = estPickupFee("out_of_city", 1);
    return {
      code,
      dims: `${dim.length}×${dim.width}×${dim.height} in`,
      ft3: ft3.toFixed(2),
      shipping,
      pickupIn,
      pickupOut,
      totalIn: (shipping + pickupIn).toFixed(2),
      totalOut: (shipping + pickupOut).toFixed(2),
    };
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold text-zinc-900">Pricing</h1>
      <p className="mt-2 text-zinc-600">
        Shipping cost is by volume. Pickup fees depend on location.
      </p>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-900">Rates</h2>
        <ul className="mt-2 list-inside list-disc text-zinc-600">
          <li>
            <strong>Shipping:</strong> $0.0145 per cubic inch (ft³ = in³ ÷ 1728)
          </li>
          <li>
            <strong>Pickup in city:</strong> $25 per stop
          </li>
          <li>
            <strong>Pickup out of city:</strong> $25 base + $15 per box
          </li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-zinc-900">Example box calculations</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-zinc-200">
                <th className="py-2 text-left font-medium">Box</th>
                <th className="py-2 text-left font-medium">Dimensions</th>
                <th className="py-2 text-right font-medium">ft³</th>
                <th className="py-2 text-right font-medium">Shipping</th>
                <th className="py-2 text-right font-medium">Pickup (in-city)</th>
                <th className="py-2 text-right font-medium">Pickup (out)</th>
                <th className="py-2 text-right font-medium">Total (in)</th>
                <th className="py-2 text-right font-medium">Total (out)</th>
              </tr>
            </thead>
            <tbody>
              {examples.map((ex) => (
                <tr key={ex.code} className="border-b border-zinc-100">
                  <td className="py-2 font-medium">{ex.code}</td>
                  <td className="py-2 text-zinc-600">{ex.dims}</td>
                  <td className="py-2 text-right tabular-nums">{ex.ft3}</td>
                  <td className="py-2 text-right tabular-nums">${ex.shipping.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums">${ex.pickupIn.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums">${ex.pickupOut.toFixed(2)}</td>
                  <td className="py-2 text-right tabular-nums">${ex.totalIn}</td>
                  <td className="py-2 text-right tabular-nums">${ex.totalOut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <p className="mt-6 text-sm text-zinc-500">
        All amounts are estimates. Final cost may vary. No payment is due at pledge time.
      </p>
    </div>
  );
}
