import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminUser } from "@/lib/admin-auth";
import { createServiceRoleClient } from "@/lib/supabase/server";
import { CreateSponsorButton } from "./CreateSponsorButton";

export default async function SponsorRequestsPage() {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");

  const supabase = createServiceRoleClient();
  const { data: requests } = await supabase
    .from("sponsor_requests")
    .select("id, name, email, phone, company, message, status, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-zinc-900">Sponsor requests</h1>
        <Link
          href="/admin/dashboard"
          className="text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Pools
        </Link>
      </div>
      <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50">
              <th className="px-4 py-3 text-left font-medium">Name</th>
              <th className="px-4 py-3 text-left font-medium">Email</th>
              <th className="px-4 py-3 text-left font-medium">Company</th>
              <th className="px-4 py-3 text-left font-medium">Message</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
              <th className="px-4 py-3 text-left font-medium">Submitted</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {(requests ?? []).map((req) => (
              <tr key={req.id} className="border-b border-zinc-100">
                <td className="px-4 py-3 font-medium">{req.name}</td>
                <td className="px-4 py-3 text-zinc-600">{req.email}</td>
                <td className="px-4 py-3 text-zinc-600">{req.company ?? "—"}</td>
                <td className="max-w-[240px] truncate px-4 py-3 text-zinc-600" title={req.message ?? undefined}>
                  {req.message ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs ${
                      req.status === "created"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-zinc-500">
                  {req.created_at
                    ? new Date(req.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  {req.status === "pending" && (
                    <CreateSponsorButton requestId={req.id} />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!requests || requests.length === 0) && (
          <p className="px-4 py-8 text-center text-zinc-500">No sponsor requests yet.</p>
        )}
      </div>
    </div>
  );
}
