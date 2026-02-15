import Link from "next/link";
import { getAdminUser } from "@/lib/admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAdminUser();

  return (
    <div className="min-h-screen bg-zinc-100">
      {user && (
        <header className="border-b border-zinc-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <Link href="/admin/dashboard" className="font-semibold text-zinc-900">
              Link360 Admin
            </Link>
            <div className="flex gap-4 text-sm">
              <Link href="/admin/dashboard" className="text-zinc-600 hover:text-zinc-900">
                Pools
              </Link>
              <Link href="/admin/sponsor-requests" className="text-zinc-600 hover:text-zinc-900">
                Sponsor requests
              </Link>
              <Link href="/" className="text-zinc-500 hover:underline">
                Public site
              </Link>
              <span className="text-zinc-400">{user.email}</span>
            </div>
          </div>
        </header>
      )}
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}
