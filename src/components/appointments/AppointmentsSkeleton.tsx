import { Skeleton } from "@/components/ui/Skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { StatsGridSkeleton } from "@/components/ui/StatCardSkeleton";
import { TableSkeleton } from "@/components/ui/TableSkeleton";

export default function AppointmentsSkeleton() {
  return (
    <div className="space-y-6">
      <StatsGridSkeleton count={6} />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40 mb-4" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-32 rounded-md" />
        </CardContent>
      </Card>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent>
          <TableSkeleton rows={8} columns={7} showHeader={true} />
          
          {/* Pagination Skeleton */}
          <div className="flex items-center justify-between mt-6">
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded-md" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
