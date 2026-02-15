export default function PoolLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container-wide py-6">
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200 mb-4" />
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200 mb-2" />
          <div className="h-8 w-3/4 max-w-md animate-pulse rounded bg-gray-200 mb-6" />
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 w-24 animate-pulse rounded-xl bg-gray-100" />
            ))}
          </div>
        </div>
      </div>
      <div className="container-wide py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="card p-6">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200 mb-4" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
            </div>
            <div className="card p-6 border-l-4 border-l-amber-400">
              <div className="h-6 w-36 animate-pulse rounded bg-gray-200 mb-4" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-100 mb-2" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="card p-8">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-full animate-pulse rounded bg-gray-100" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
