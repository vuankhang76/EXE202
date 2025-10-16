import { Card, CardContent } from '../ui/Card';

interface DoctorCardSkeletonProps {
  itemsPerView: number;
}

export default function DoctorCardSkeleton({ itemsPerView }: DoctorCardSkeletonProps) {
  return (
    <div className="flex gap-4 h-full p-4">
      {Array.from({ length: itemsPerView }).map((_, index) => (
        <div 
          key={index} 
          className="flex-shrink-0 h-full animate-pulse"
          style={{ width: `calc(${100 / itemsPerView}% - ${(itemsPerView - 1) * 16 / itemsPerView}px)` }}
        >
          <Card className="border border-gray-200 bg-white overflow-hidden flex flex-col">
            <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
              <div className="w-24 h-24 bg-gray-200 rounded-full"></div>
              <div className="w-full space-y-2">
                <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}
