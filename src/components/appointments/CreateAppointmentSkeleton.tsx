export default function CreateAppointmentSkeleton() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse mb-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Service Selection */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                    <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                  <div className="h-20 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Step 2: Date Selection */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-40 bg-gray-200 rounded animate-pulse" />
              </div>

              {/* Step 3: Time Selection */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-6 h-6 bg-gray-200 rounded-full animate-pulse" />
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="grid grid-cols-4 gap-3">
                  {[...Array(12)].map((_, i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="lg:col-span-1">
              <div className="sticky top-4">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-4" />
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i}>
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                        <div className="h-5 w-full bg-gray-200 rounded animate-pulse" />
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
