import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Activity, CheckCircle, FileHeart, BookOpen } from "lucide-react";
import type { MedicalCaseRecordDto } from "@/types/medicalCaseRecord";

interface StatsCardsProps {
  records: MedicalCaseRecordDto[];
  currentPage: number;
  totalPages: number;
  loading?: boolean;
}

export default function StatsCards({
  records,
  currentPage,
  totalPages,
  loading,
}: StatsCardsProps) {
  const showSkeleton = loading && records.length === 0;
  if (showSkeleton) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-40 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const total = records.length;
  const ongoing = records.filter((r) => r.status === "Ongoing").length;
  const completed = records.filter((r) => r.status === "Completed").length;

  return (
    <div className="grid gap-4 md:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số ca bệnh</CardTitle>
          <FileHeart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            Tổng số hồ sơ y tế hiện có
          </p>
        </CardContent>
      </Card>

      {/* Đang điều trị */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đang điều trị</CardTitle>
          <Activity className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{ongoing}</div>
          <p className="text-xs text-muted-foreground">
            Ca bệnh đang trong quá trình điều trị
          </p>
        </CardContent>
      </Card>

      {/* Hoàn thành */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Đã hoàn thành</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completed}</div>
          <p className="text-xs text-muted-foreground">
            Ca bệnh đã kết thúc điều trị
          </p>
        </CardContent>
      </Card>

      {/* Số trang */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Trang hiện tại</CardTitle>
          <BookOpen className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-700">
            {currentPage} / {totalPages}
          </div>
          <p className="text-xs text-muted-foreground">
            Phân trang hồ sơ y tế
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
