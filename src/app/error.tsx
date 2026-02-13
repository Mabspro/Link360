"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Link360] Server/render error:", error.message, "Digest:", error.digest);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-zinc-900">Something went wrong</h1>
      <p className="mt-2 text-zinc-600">
        We couldn’t load this page. This is often due to missing or invalid configuration.
      </p>
      {error.digest && (
        <p className="mt-2 text-sm text-zinc-400">Error digest: {error.digest}</p>
      )}
      <p className="mt-4 text-sm text-zinc-500">
        If you just deployed: add{" "}
        <code className="rounded bg-zinc-200 px-1">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code className="rounded bg-zinc-200 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in Vercel
        → Settings → Environment Variables, then redeploy.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Try again
      </button>
    </div>
  );
}
