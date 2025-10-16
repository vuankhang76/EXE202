import { Card, CardContent } from '../ui/Card';

interface ClinicCardSkeletonProps {
  itemsPerView: number;
}

export default function ClinicCardSkeleton({ itemsPerView }: ClinicCardSkeletonProps) {
  return (
    <div className="flex gap-4 h-full p-4">
      {Array.from({ length: itemsPerView }).map((_, index) => (
        <div 
          key={index} 
          className="flex-shrink-0 h-full animate-pulse"
          style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
        >
          <Card className="border border-gray-200 bg-white overflow-hidden h-full flex flex-col">
            <div className="relative h-48 flex-shrink-0 bg-gray-200"></div>
            <CardContent className="p-4 flex flex-col flex-grow space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="space-y-2 border-t border-gray-100 pt-3 mt-auto">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
