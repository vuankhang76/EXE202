import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw, CheckCircle, XCircle, Trash2 } from "lucide-react";
import CreatePaymentDialog from "@/components/payments/CreatePaymentDialog";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
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
import type {
  PaymentTransactionDto,
  PaymentStatisticsDto,
  PaymentTransactionFilterDto,
} from "@/types/paymentTransaction";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

export default function PaymentTransaction() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [stats, setStats] = useState<PaymentStatisticsDto | undefined>(
    undefined
  );
  const [payments, setPayments] = useState<PaymentTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [, setTotalCount] = useState(0);
  const pageSize = 15;

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("");
  const [appliedMethodFilter, setAppliedMethodFilter] = useState<string>("");
  const [appliedFromDate, setAppliedFromDate] = useState<Date | undefined>(
    undefined
  );
  const [appliedToDate, setAppliedToDate] = useState<Date | undefined>(
    undefined
  );

  const loadPayments = useCallback(
    async (page: number = 1) => {
      try {
        setLoading(true);

        if (!tenantId) {
          toast.error(
            "Không thể tải danh sách giao dịch. Vui lòng liên hệ quản trị viên."
          );
          return;
        }

        const filter: PaymentTransactionFilterDto = {
          pageNumber: page,
          pageSize: pageSize,
          tenantId,
          status:
            appliedStatusFilter && appliedStatusFilter !== "all"
              ? appliedStatusFilter
              : undefined,
          method:
            appliedMethodFilter && appliedMethodFilter !== "all"
              ? appliedMethodFilter
              : undefined,
          fromDate: appliedFromDate ? appliedFromDate.toISOString() : undefined,
          toDate: appliedToDate ? appliedToDate.toISOString() : undefined,
        };

        const result = await paymentTransactionService.getPaymentTransactions(
          filter
        );

        if (result.success && result.data) {
          setPayments(result.data.data || []);
          setTotalPages(result.data.totalPages || 0);
          setTotalCount(result.data.totalCount || 0);
          setCurrentPage(page);
        } else {
          setPayments([]);
          setTotalPages(0);
          setTotalCount(0);
        }
      } catch (error) {
        console.error("Error loading payments:", error);
        toast.error("Có lỗi xảy ra khi tải danh sách giao dịch");
        setPayments([]);
      } finally {
        setLoading(false);
      }
    },
    [
      tenantId,
      appliedStatusFilter,
      appliedMethodFilter,
      appliedFromDate,
      appliedToDate,
      pageSize,
    ]
  );

  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);

      if (!tenantId) {
        return;
      }

      const result = await paymentTransactionService.getPaymentStatistics(
        tenantId
      );

      if (result.success && result.data) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, [tenantId]);

  useEffect(() => {
    loadPayments(1);
    loadStats();
  }, [loadPayments, loadStats]);

  const handleRefresh = () => {
    loadPayments(currentPage);
    loadStats();
  };

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

  const handleCompletePayment = async (paymentId: number) => {
    try {
      const result = await paymentTransactionService.completePayment(paymentId);
      if (result.success) {
        toast.success("Đã hoàn thành giao dịch");
        loadPayments(currentPage);
        loadStats();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi hoàn thành giao dịch");
    }
  };

  const handleFailPayment = async (paymentId: number) => {
    try {
      const result = await paymentTransactionService.failPayment(paymentId, {
        reason: "Đánh dấu thất bại bởi quản trị viên",
      });
      if (result.success) {
        toast.success("Đã đánh dấu giao dịch thất bại");
        loadPayments(currentPage);
        loadStats();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đánh dấu thất bại");
    }
  };

  const handleDeletePayment = async (paymentId: number) => {
    if (
      !confirm(
        "Bạn có chắc chắn muốn xóa giao dịch này? (Chỉ có thể xóa giao dịch PENDING)"
      )
    ) {
      return;
    }

    try {
      const result = await paymentTransactionService.deletePaymentTransaction(
        paymentId
      );
      if (result.success) {
        toast.success("Đã xóa giao dịch");
        loadPayments(currentPage);
        loadStats();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa giao dịch");
    }
  };

  const handleSearch = () => {
    setAppliedStatusFilter(statusFilter);
    setAppliedMethodFilter(methodFilter);
    setAppliedFromDate(fromDate);
    setAppliedToDate(toDate);
    loadPayments(1);
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      payment.patientName?.toLowerCase().includes(search) ||
      payment.patientPhone?.toLowerCase().includes(search) ||
      payment.paymentId.toString().includes(search)
    );
  });

  return (
    <AdminLayout
      breadcrumbTitle="Giao dịch thanh toán"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Làm mới
          </Button>
          <CreatePaymentDialog
            onSuccess={() => {
              loadPayments(1);
              loadStats();
            }}
          />
        </div>
      }
    >
      <PaymentStats stats={stats} loading={statsLoading} />

      <PaymentFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        typeFilter={methodFilter}
        fromDate={fromDate}
        toDate={toDate}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onTypeFilterChange={setMethodFilter}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onSearch={handleSearch}
      />

      <div>
        {loading ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">Đang tải...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Không có giao dịch nào
          </div>
        ) : (
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
                      {filteredPayments.map((payment) => (
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
                                  handleCompletePayment(payment.paymentId)
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
                                  handleFailPayment(payment.paymentId)
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
                                    handleDeletePayment(payment.paymentId)
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
                        onClick={() => loadPayments(currentPage - 1)}
                        disabled={currentPage === 1 || loading}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadPayments(currentPage + 1)}
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
        )}
      </div>
    </AdminLayout>
  );
}
