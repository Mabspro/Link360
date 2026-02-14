import { STANDARD_BOXES, in3ToFt3 } from "@/lib/constants";
import { getAdminSettings } from "@/lib/get-admin-settings";
import { estShippingCost, estPickupFee } from "@/lib/pricing";
import { SpacePriceCalculator } from "@/components/SpacePriceCalculator";

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
      <h1 className="heading-1">Pricing</h1>
      <p className="text-body-lg mt-2">
        Shipping cost is by volume. Pickup fees depend on location.
      </p>

      <section className="mt-8">
        <h2 className="heading-3">Estimate your cost</h2>
        <p className="text-body mt-2">
          Use the calculator below to get a quick estimate before pledging.
        </p>
        <div className="mt-6 max-w-xl mx-auto">
          <SpacePriceCalculator pricing={pricing} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="heading-3">Rates</h2>
        <ul className="mt-2 list-inside list-disc text-body">
          <li>
            <strong>Shipping:</strong> ${ratePerIn3.toFixed(4)} per cubic inch (ft³ = in³ ÷ 1728)
          </li>
          <li>
            <strong>Pickup in city:</strong> ${inCityFee} per stop
          </li>
          <li>
            <strong>Pickup out of city:</strong> ${outCityBase} base + ${outCityPerBox} per box
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="heading-3">Example box calculations</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-gray-200">
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
                <tr key={ex.code} className="border-b border-gray-100">
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

      <p className="mt-6 text-small text-gray-500">
        All amounts are estimates. Final cost may vary. No payment is due at pledge time.
      </p>
    </div>
  );
}
