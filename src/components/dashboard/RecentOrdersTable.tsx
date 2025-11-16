import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import type { RecentOrder } from '@/types/dashboard';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import {  getTypeLabel } from '@/types/appointment';
interface RecentOrdersTableProps {
  orders: RecentOrder[];
  className?: string;
}

const getStatusBadgeVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'success' | 'outline' => {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'confirmed':
      return 'default';
    case 'pending':
    case 'scheduled':
      return 'secondary';
    case 'cancelled':
      return 'destructive';
    default:
      return 'outline';
  }
};

const getStatusLabel = (status: string): string => {
  const statusMap: Record<string, string> = {
    'Scheduled': 'Chờ xác nhận',
    'Confirmed': 'Đã xác nhận',
    'InProgress': 'Đang khám',
    'Completed': 'Hoàn thành',
    'Cancelled': 'Đã hủy',
  };
  return statusMap[status] || status;
};

export default function RecentOrdersTable({ orders, className }: RecentOrdersTableProps) {
  if (!orders || orders.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-base font-medium">Đơn đặt dịch vụ gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Chưa có đơn đặt dịch vụ nào
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base font-medium">Đơn đặt dịch vụ gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã đơn</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Bác sĩ</TableHead>
              <TableHead>Loại dịch vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Thời gian</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium">#{order.orderId}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.doctorName}</TableCell>
                <TableCell>{getTypeLabel(order.serviceType)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </TableCell>
                <TableCell>
                  {format(new Date(order.appointmentTime), 'dd/MM/yyyy HH:mm', { locale: vi })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
