import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, Stethoscope, Shield } from "lucide-react";

interface AccountStatsProps {
  total: number;
  doctors: number;
  nurses: number;
}

export default function AccountStats({ total, doctors, nurses }: AccountStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tổng tài khoản
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">
            Tài khoản đang hoạt động
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Bác sĩ
          </CardTitle>
          <Stethoscope className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{doctors}</div>
          <p className="text-xs text-muted-foreground">
            Tài khoản bác sĩ
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Y tá
          </CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{nurses}</div>
          <p className="text-xs text-muted-foreground">
            Tài khoản y tá
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
