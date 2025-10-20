import { Skeleton } from '@/components/ui/Skeleton';

export default function ClinicDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="w-56 h-56 rounded-2xl mx-auto" />
            </div>

            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-9 w-3/4" />
              
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <Skeleton className="w-5 h-5 rounded flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto gap-8">
          <div className="p-4">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="p-4 md:p-6">
            <div className="text-center max-w-2xl mx-auto">
              <Skeleton className="h-8 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6 mx-auto mb-6" />
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Skeleton className="h-12 w-full sm:w-48" />
                <Skeleton className="h-12 w-full sm:w-48" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex justify-center mb-4">
                  <Skeleton className="w-24 h-24 rounded-full" />
                </div>
                <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
