export default function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2 mb-6">
        {[60, 20, 80, 20, 120].map((w, i) => (
          <div
            key={i}
            className={`h-3 bg-stone-100 rounded`}
            style={{ width: w }}
          />
        ))}
      </div>

      {/* Main section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-3xl border border-stone-100 p-6 lg:p-10 mb-8">
        {/* Image */}
        <div className="space-y-3">
          <div className="aspect-square bg-stone-100 rounded-2xl" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-stone-100 rounded-xl" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-4">
          <div className="h-3 bg-stone-100 rounded w-1/4" />
          <div className="space-y-2">
            <div className="h-8 bg-stone-100 rounded w-3/4" />
            <div className="h-8 bg-stone-100 rounded w-1/2" />
          </div>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-4 h-4 bg-stone-100 rounded" />
            ))}
            <div className="h-4 bg-stone-100 rounded w-16 ml-2" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-stone-100 rounded" />
            <div className="h-3 bg-stone-100 rounded w-4/5" />
          </div>
          <div className="h-10 bg-stone-100 rounded-2xl w-1/3 mt-4" />
          <div className="h-12 bg-stone-100 rounded-2xl mt-2" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-stone-100 p-6 mb-8">
        <div className="flex gap-6 border-b border-stone-100 mb-6 pb-4">
          {[80, 100, 140, 80].map((w, i) => (
            <div
              key={i}
              className="h-4 bg-stone-100 rounded"
              style={{ width: w }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-4 bg-stone-100 rounded"
              style={{ width: `${90 - i * 10}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
