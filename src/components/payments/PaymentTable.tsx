import { Button } from "@/components/ui/Button";
import { QrCode } from "lucide-react";
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
import TablePagination from "../ui/TablePagination";

interface PaymentTableProps {
  payments: PaymentTransactionDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onShowPaymentQR?: (payment: PaymentTransactionDto) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
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

const calculateAge = (dateOfBirth?: string): number | null => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const getGenderLabel = (gender?: string): string => {
  if (!gender) return "N/A";
  return gender === "MALE" ? "Nam" : gender === "FEMALE" ? "Nữ" : "Khác";
};

export default function PaymentTable({
  payments,
  loading,
  currentPage,
  totalPages,
  totalCount,
  rowsPerPage,
  onShowPaymentQR,
  onPageChange,
  onRowsPerPageChange,
}: PaymentTableProps) {
  const safePayments = payments || [];

  return (
    <div>
      {loading ? (
        <div>
          <TableSkeleton rows={10} columns={6} />
        </div>
      ) : safePayments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          Không có giao dịch nào
        </div>
      ) : (
        <>
          <div className="border rounded-md bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="min-w-[1200px] w-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow>
                      <TableHead className="min-w-[80px]">Mã GD</TableHead>
                      <TableHead className="min-w-[100px]">Lịch hẹn</TableHead>
                      <TableHead className="min-w-[120px]">Bệnh nhân</TableHead>
                      <TableHead className="min-w-[100px]">Giới tính</TableHead>
                      <TableHead className="min-w-[80px]">Tuổi</TableHead>
                      <TableHead className="min-w-[120px]">Điện thoại</TableHead>
                      <TableHead className="min-w-[120px]">Bác sĩ</TableHead>
                      <TableHead className="min-w-[100px]">Số tiền</TableHead>
                      <TableHead className="min-w-[120px]">Phương thức</TableHead>
                      <TableHead className="min-w-[120px]">Trạng thái</TableHead>
                      <TableHead className="min-w-[140px]">Ngày tạo</TableHead>
                      <TableHead className="min-w-[150px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safePayments.map((payment) => (
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
                          <div className="font-medium">
                            {payment.patientName}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getGenderLabel(payment.patientGender)}
                        </TableCell>
                        <TableCell>
                          {calculateAge(payment.patientDateOfBirth) ?? "N/A"}
                        </TableCell>
                        <TableCell>
                          <div>{formatPhone(payment.patientPhone)}</div>
                        </TableCell>
                        <TableCell>{payment.doctorName}</TableCell>
                        <TableCell>
                          <div className="font-semibold">
                            {formatCurrency(payment.amount, payment.currency)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-lg mb-1.5">{getPaymentMethodIcon(payment.method)}</span>
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
                          {payment.status === "PENDING" && payment.method === "BANK_TRANSFER" && onShowPaymentQR && (
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => onShowPaymentQR(payment)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <QrCode className="h-4 w-4 mr-1" />
                              Thanh toán
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange} 
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
}

