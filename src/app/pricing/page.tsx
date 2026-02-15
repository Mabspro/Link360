import { STANDARD_BOXES, in3ToFt3 } from "@/lib/constants";
import { getAdminSettings } from "@/lib/get-admin-settings";
import { estShippingCost, estPickupFee } from "@/lib/pricing";
import { SpacePriceCalculator } from "@/components/SpacePriceCalculator";

export const metadata = {
  title: "Pricing",
  description: "Shipping rates by volume. Estimate cost with the calculator. Pickup in-city or out-of-city.",
};

export default async function PricingPage() {
  const pricing = await getAdminSettings();
  const examples = Object.entries(STANDARD_BOXES).map(([code, dim]) => {
    const in3 = dim.length * dim.width * dim.height;
    const ft3 = in3ToFt3(in3);
    const shipping = estShippingCost(in3, pricing ?? undefined);
    const pickupIn = estPickupFee("in_city", 1, pricing ?? undefined);
    const pickupOut = estPickupFee("out_of_city", 1, pricing ?? undefined);
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

  const ratePerIn3 = pricing?.rate_per_in3 ?? 0.0145;
  const inCityFee = pricing?.in_city_stop_fee ?? 25;
  const outCityBase = pricing?.out_of_city_base_fee ?? 25;
  const outCityPerBox = pricing?.out_of_city_per_box_fee ?? 15;

  return (
    <div className="container-narrow section">
      <header className="mb-10">
        <h1 className="heading-1">Pricing</h1>
        <p className="text-body-lg mt-2 text-gray-600">
          Shipping cost is by volume. Pickup fees depend on location.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="heading-3 mb-2">Estimate your cost</h2>
        <p className="text-body text-gray-600 mb-6">
          Use the calculator below to get a quick estimate before pledging.
        </p>
        <div className="max-w-xl mx-auto">
          <SpacePriceCalculator pricing={pricing} />
        </div>
      </section>

      <section className="mb-10">
        <div className="card p-6">
          <h2 className="heading-3 mb-4">Rates</h2>
          <ul className="space-y-2 text-body text-gray-700">
            <li>
              <strong className="text-gray-900">Shipping:</strong> ${ratePerIn3.toFixed(4)} per cubic inch (ft³ = in³ ÷ 1728)
            </li>
            <li>
              <strong className="text-gray-900">Pickup in city:</strong> ${inCityFee} per stop
            </li>
            <li>
              <strong className="text-gray-900">Pickup out of city:</strong> ${outCityBase} base + ${outCityPerBox} per box
            </li>
          </ul>
        </div>
      </section>

      <section className="mb-10">
        <div className="card overflow-hidden p-0">
          <div className="p-6 pb-0">
            <h2 className="heading-3">Example box calculations</h2>
            <p className="text-sm text-gray-600 mt-1">
              Reference totals for standard box sizes.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-y border-gray-200 bg-gray-50">
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Box</th>
                  <th className="py-3 px-4 text-left font-medium text-gray-700">Dimensions</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">ft³</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">Shipping</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">Pickup (in)</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">Pickup (out)</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">Total (in)</th>
                  <th className="py-3 px-4 text-right font-medium text-gray-700">Total (out)</th>
                </tr>
              </thead>
              <tbody>
                {examples.map((ex) => (
                  <tr key={ex.code} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 font-medium text-gray-900">{ex.code}</td>
                    <td className="py-3 px-4 text-gray-600">{ex.dims}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">{ex.ft3}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">${ex.shipping.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">${ex.pickupIn.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right tabular-nums text-gray-700">${ex.pickupOut.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium text-gray-900">${ex.totalIn}</td>
                    <td className="py-3 px-4 text-right tabular-nums font-medium text-gray-900">${ex.totalOut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <div className="card p-6 border-l-4 border-l-ocean bg-blue-50/30">
        <h3 className="heading-4 text-gray-900 mb-2">Planning to resell goods in Zambia?</h3>
        <p className="text-body text-gray-700">
          Keep clear records and accurate valuations. Some goods may need extra certification. We can point you in the right direction when the time comes.
        </p>
      </div>

      <p className="mt-8 text-sm text-gray-500 text-center">
        All amounts are estimates. Final cost may vary. No payment is due at pledge time.
      </p>
    </div>
  );
}
