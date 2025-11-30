import { Card, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaymentTransactionDto } from "@/types/paymentTransaction";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Mars, Venus } from "lucide-react";

interface TransactionTableProps {
  transactions: PaymentTransactionDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
}

export default function TransactionTable({
  transactions,
  loading,
  currentPage,
  totalPages,
  totalCount,
  rowsPerPage,
  onPageChange,
}: TransactionTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      PENDING: { 
        label: "Đang chờ", 
        className: "bg-yellow-100 text-yellow-800 border-yellow-200" 
      },
      COMPLETED: { 
        label: "Hoàn thành", 
        className: "bg-green-100 text-green-800 border-green-200" 
      },
      FAILED: { 
        label: "Thất bại", 
        className: "bg-red-100 text-red-800 border-red-200" 
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      className: "bg-gray-100 text-gray-800 border-gray-200" 
    };
    
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getMethodLabel = (method: string) => {
    const methodLabels: Record<string, string> = {
      CASH: "Tiền mặt",
      BANK_TRANSFER: "Chuyển khoản",
    };
    return methodLabels[method] || method;
  };

  const calculateAge = (dateOfBirth: string | undefined): number | null => {
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

  const renderGender = (gender?: string) => {
    if (!gender) return "N/A";
    return gender === "M" ? <span className="flex items-center"><Mars className="text-blue-500 h-4 w-4 mr-1" />Nam</span> : <span className="text-pink-500 flex"><Venus className="h-4 w-4" />Nữ</span>;
  }

  return (
    <Card className="p-0 px-2">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã GD</TableHead>
                <TableHead>Bệnh nhân</TableHead>
                <TableHead>Giới tính</TableHead>
                <TableHead>Ngày sinh (Tuổi)</TableHead>
                <TableHead>Số tiền</TableHead>
                <TableHead>Phương thức</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ngày tạo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    {Array.from({ length: 8 }).map((_, cellIndex) => (
                      <TableCell key={cellIndex}>
                        <div className="h-4 bg-gray-200 animate-pulse rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    Không có giao dịch nào
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => {
                  const age = calculateAge(transaction.patientDateOfBirth);
                  return (
                    <TableRow key={transaction.paymentId}>
                      <TableCell className="font-medium">#{transaction.paymentId}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{transaction.patientName}</div>
                          <div className="text-sm text-gray-500">{transaction.patientPhone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{renderGender(transaction.patientGender)}</TableCell>
                      <TableCell>
                        {transaction.patientDateOfBirth ? (
                          <div>
                            <div>{format(new Date(transaction.patientDateOfBirth), "dd/MM/yyyy", { locale: vi })}</div>
                            {age !== null && <div className="text-sm text-gray-500">({age} tuổi)</div>}
                          </div>
                        ) : (
                          "N/A"
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell>{getMethodLabel(transaction.method)}</TableCell>
                      <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                      <TableCell>
                        {transaction.createdAt 
                          ? format(new Date(transaction.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
                          : "N/A"
                        }
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t">
          <div className="text-sm text-gray-500">
            Hiển thị {transactions.length > 0 ? (currentPage - 1) * rowsPerPage + 1 : 0} -{" "}
            {Math.min(currentPage * rowsPerPage, totalCount)} trong tổng số {totalCount} giao dịch
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Trang {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
