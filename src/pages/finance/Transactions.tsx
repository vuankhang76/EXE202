import { useEffect, useCallback, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import TransactionTable from "@/components/finance/TransactionTable";
import TransactionFilters from "@/components/finance/TransactionFilters";
import TransactionStats from "@/components/finance/TransactionStats";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  PaymentTransactionFilterDto,
  PaymentTransactionDto,
  PaymentStatisticsDto,
} from "@/types/paymentTransaction";

export default function Transactions() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PaymentTransactionDto[]>([]);
  const [stats, setStats] = useState<PaymentStatisticsDto | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [filters, setFilters] = useState<{
    status: string;
    method: string;
    fromDate: string | undefined;
    toDate: string | undefined;
    searchTerm: string;
  }>({
    status: "all",
    method: "all",
    fromDate: undefined,
    toDate: undefined,
    searchTerm: "",
  });

  const [appliedFilters, setAppliedFilters] = useState(filters);

  const loadData = useCallback(
    async (page: number = 1, customFilters?: typeof appliedFilters, customPageSize?: number) => {
      try {
        setLoading(true);

        if (!tenantId) {
          toast.error("Không thể tải danh sách giao dịch. Vui lòng liên hệ quản trị viên.");
          return;
        }

        const filtersToUse = customFilters || appliedFilters;
        const pageSizeToUse = customPageSize !== undefined ? customPageSize : pageSize;

        const filter: PaymentTransactionFilterDto = {
          pageNumber: page,
          pageSize: pageSizeToUse,
          tenantId,
          status: filtersToUse.status && filtersToUse.status !== "all" ? filtersToUse.status : undefined,
          method: filtersToUse.method && filtersToUse.method !== "all" ? filtersToUse.method : undefined,
          fromDate: filtersToUse.fromDate ? `${filtersToUse.fromDate}T00:00:00+07:00` : undefined,
          toDate: filtersToUse.toDate ? `${filtersToUse.toDate}T23:59:59+07:00` : undefined,
          searchTerm: filtersToUse.searchTerm || undefined,
        };

        const [paymentsResult, statsResult] = await Promise.all([
          paymentTransactionService.getPaymentTransactions(filter),
          paymentTransactionService.getPaymentStatistics(tenantId),
        ]);

        if (paymentsResult.success && paymentsResult.data) {
          setTransactions(paymentsResult.data.data || []);
          setTotalPages(paymentsResult.data.totalPages || 0);
          setTotalCount(paymentsResult.data.totalCount || 0);
          setCurrentPage(page);
        } else {
          setTransactions([]);
          setTotalPages(0);
          setTotalCount(0);
        }

        if (statsResult.success) {
          setStats(statsResult.data);
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    },
    [tenantId, appliedFilters, pageSize]
  );

  useEffect(() => {
    loadData(1);
  }, []);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handleSearch = () => {
    setAppliedFilters(filters);
    loadData(1, filters);
  };

  return (
    <AdminLayout
      breadcrumbTitle="Giao dịch"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      }
    >
      <TransactionStats stats={stats} loading={loading} />

      <TransactionFilters
        searchTerm={filters.searchTerm}
        statusFilter={filters.status}
        methodFilter={filters.method}
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        onSearchChange={(term: string) => setFilters({ ...filters, searchTerm: term })}
        onStatusFilterChange={(status: string) => setFilters({ ...filters, status })}
        onMethodFilterChange={(method: string) => setFilters({ ...filters, method })}
        onFromDateChange={(date: string | undefined) => setFilters({ ...filters, fromDate: date })}
        onToDateChange={(date: string | undefined) => setFilters({ ...filters, toDate: date })}
        onSearch={handleSearch}
      />

      <TransactionTable
        transactions={transactions}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        rowsPerPage={pageSize}
        onPageChange={loadData}
      />
    </AdminLayout>
  );
}
