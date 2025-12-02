import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users } from "lucide-react";
import { Skeleton } from "@/components/ui/Skeleton";

interface PatientStatsProps {
  total: number;
  loading?: boolean;
}

export default function PatientStats({
  total,
  loading = false,
}: PatientStatsProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-4 rounded-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tổng số bệnh nhân</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
        </CardContent>
      </Card>
    </div>
  );
}
