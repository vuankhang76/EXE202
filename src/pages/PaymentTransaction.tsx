import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import CreatePaymentDialog from "@/components/payments/CreatePaymentDialog";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentTable from "@/components/payments/PaymentTable";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  PaymentTransactionDto,
  PaymentStatisticsDto,
  PaymentTransactionFilterDto,
} from "@/types/paymentTransaction";

export default function PaymentTransaction() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [stats, setStats] = useState<PaymentStatisticsDto | undefined>(
    undefined
  );
  const [payments, setPayments] = useState<PaymentTransactionDto[]>([]);
  const [loading, setLoading] = useState(false);

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

  const loadData = useCallback(
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

        // Load cả payments và stats cùng lúc
        const [paymentsResult, statsResult] = await Promise.all([
          paymentTransactionService.getPaymentTransactions(filter),
          paymentTransactionService.getPaymentStatistics(tenantId),
        ]);

        // Update payments
        if (paymentsResult.success && paymentsResult.data) {
          setPayments(paymentsResult.data.data || []);
          setTotalPages(paymentsResult.data.totalPages || 0);
          setTotalCount(paymentsResult.data.totalCount || 0);
          setCurrentPage(page);
        } else {
          setPayments([]);
          setTotalPages(0);
          setTotalCount(0);
        }

        // Update stats
        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
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

  useEffect(() => {
    loadData(1);
  }, [loadData]);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handleCompletePayment = async (paymentId: number) => {
    try {
      const result = await paymentTransactionService.completePayment(paymentId);
      if (result.success) {
        toast.success("Đã hoàn thành giao dịch");
        loadData(currentPage);
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
        loadData(currentPage);
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
        loadData(currentPage);
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
    loadData(1);
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
      breadcrumbTitle="Đơn dịch vụ và thanh toán"
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
              loadData(1);
            }}
          />
        </div>
      }
    >
      <PaymentStats stats={stats} loading={loading} />

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

      <PaymentTable
        payments={filteredPayments}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        onCompletePayment={handleCompletePayment}
        onFailPayment={handleFailPayment}
        onDeletePayment={handleDeletePayment}
        onPageChange={loadData}
      />
    </AdminLayout>
  );
}
