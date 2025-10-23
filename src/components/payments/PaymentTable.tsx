import { Button } from "@/components/ui/Button";
import { CheckCircle, XCircle, Trash2, RefreshCw } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  formatCurrency,
  getPaymentMethodLabel,
  getPaymentMethodIcon,
  getPaymentStatusLabel,
  getPaymentStatusColor,
} from "@/types/paymentTransaction";
import type { PaymentTransactionDto } from "@/types/paymentTransaction";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import TableSkeleton from "../ui/TableSkeleton";

interface PaymentTableProps {
  payments: PaymentTransactionDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onCompletePayment: (paymentId: number) => void;
  onFailPayment: (paymentId: number) => void;
  onDeletePayment: (paymentId: number) => void;
  onPageChange: (page: number) => void;
}

const formatPhone = (phone?: string) => {
  if (!phone) return "N/A";

  const digits = phone.replace(/\D/g, "");

  if (/^0\d{9}$/.test(digits)) {
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  if (/^84\d{9}$/.test(digits)) {
    const local = "0" + digits.slice(2);
    return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  return phone;
};

export default function PaymentTable({
  payments,
  loading,
  currentPage,
  totalPages,
  onCompletePayment,
  onFailPayment,
  onDeletePayment,
  onPageChange,
}: PaymentTableProps) {
  if (loading) {
    return (
        <TableSkeleton rows={10} columns={6} />
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Không có giao dịch nào
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto min-h-[500px]">
          <div className="min-w-[1200px] w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Mã GD</TableHead>
                  <TableHead>Lịch hẹn</TableHead>
                  <TableHead>Điện thoại</TableHead>
                  <TableHead>Bệnh nhân</TableHead>
                  <TableHead>Bác sĩ</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Phương thức</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.paymentId}>
                    <TableCell className="font-medium">
                      #{payment.paymentId}
                    </TableCell>
                    <TableCell>
                      {payment.appointmentId ? (
                        <div className="font-medium text-sm">
                          #{payment.appointmentId}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          -
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>{formatPhone(payment.patientPhone)}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {payment.patientName}
                      </div>
                    </TableCell>
                    <TableCell>{payment.doctorName}</TableCell>
                    <TableCell>{payment.appointmentType}</TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPaymentMethodIcon(payment.method)}</span>
                        <span>{getPaymentMethodLabel(payment.method)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          payment.status
                        )}`}
                      >
                        {getPaymentStatusLabel(payment.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.createdAt
                        ? format(
                            new Date(payment.createdAt),
                            "dd/MM/yyyy HH:mm",
                            { locale: vi }
                          )
                        : "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() =>
                            onCompletePayment(payment.paymentId)
                          }
                          disabled={payment.status !== "PENDING"}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Hoàn thành
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            onFailPayment(payment.paymentId)
                          }
                          disabled={payment.status !== "PENDING"}
                          className="disabled:cursor-not-allowed"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Thất bại
                        </Button>
                        {payment.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              onDeletePayment(payment.paymentId)
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Trang {currentPage} / {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Sau
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

