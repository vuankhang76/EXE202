import { useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import CreatePaymentDialog from "@/components/payments/CreatePaymentDialog";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentTable from "@/components/payments/PaymentTable";
import SepayQRDialog from "@/components/payments/SepayQRDialog";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  PaymentTransactionFilterDto,
  PaymentTransactionDto,
} from "@/types/paymentTransaction";
import {
  useAppDispatch,
  usePaymentData,
  usePaymentLoading,
  usePaymentFilters,
  usePaymentAppliedFilters,
  isCacheValid,
} from "@/stores/hooks";
import {
  setLoading,
  setPaymentData,
  setFilters,
  setAppliedFilters,
  setPageSize,
  clearPaymentData,
} from "@/stores/paymentSlice";
import { useState } from "react";

export default function PaymentTransaction() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const dispatch = useAppDispatch();
  const {
    payments,
    stats,
    currentPage,
    totalPages,
    pageSize,
    totalCount,
    lastUpdated,
    cacheExpiration,
  } = usePaymentData();
  const loading = usePaymentLoading();
  const filters = usePaymentFilters();
  const appliedFilters = usePaymentAppliedFilters();

  const [qrDialog, setQrDialog] = useState<{
    isOpen: boolean;
    payment: PaymentTransactionDto | null;
  }>({
    isOpen: false,
    payment: null,
  });

  const loadData = useCallback(
    async (page: number = 1, customFilters?: typeof appliedFilters, customPageSize?: number) => {
      try {
        dispatch(setLoading(true));

        if (!tenantId) {
          toast.error(
            "Không thể tải danh sách giao dịch. Vui lòng liên hệ quản trị viên."
          );
          return;
        }

        const filtersToUse = customFilters || appliedFilters;
        const pageSizeToUse = customPageSize !== undefined ? customPageSize : pageSize;

        const filter: PaymentTransactionFilterDto = {
          pageNumber: page,
          pageSize: pageSizeToUse,
          tenantId,
          status:
            filtersToUse.status && filtersToUse.status !== "all"
              ? filtersToUse.status
              : undefined,
          method:
            filtersToUse.method && filtersToUse.method !== "all"
              ? filtersToUse.method
              : undefined,
          fromDate: filtersToUse.fromDate ? `${filtersToUse.fromDate}T00:00:00+07:00` : undefined,
          toDate: filtersToUse.toDate ? `${filtersToUse.toDate}T23:59:59+07:00` : undefined,
          searchTerm: filtersToUse.searchTerm || undefined,
        };

        const [paymentsResult, statsResult] = await Promise.all([
          paymentTransactionService.getPaymentTransactions(filter),
          paymentTransactionService.getPaymentStatistics(tenantId),
        ]);

        // Update payments and stats
        if (paymentsResult.success && paymentsResult.data) {
          dispatch(
            setPaymentData({
              payments: paymentsResult.data.data || [],
              stats: statsResult.success ? statsResult.data : undefined,
              totalPages: paymentsResult.data.totalPages || 0,
              totalCount: paymentsResult.data.totalCount || 0,
              currentPage: page,
            })
          );
        } else {
          dispatch(
            setPaymentData({
              payments: [],
              stats: statsResult.success ? statsResult.data : undefined,
              totalPages: 0,
              totalCount: 0,
              currentPage: page,
            })
          );
        }
      } catch (error) {
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        dispatch(clearPaymentData());
      } finally {
        dispatch(setLoading(false));
      }
    },
    [tenantId, appliedFilters, pageSize, dispatch]
  );

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      // Use cached data, no need to reload
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadData(1);
  }, [lastUpdated, cacheExpiration, loadData]);

  const handleRefresh = () => {
    loadData(currentPage);
  };

  const handleShowPaymentQR = (payment: PaymentTransactionDto) => {
    setQrDialog({
      isOpen: true,
      payment,
    });
  };

  const handlePaymentCompleted = () => {
    toast.success("Thanh toán thành công!");
    setQrDialog({ isOpen: false, payment: null });
    loadData(currentPage); // Refresh data
  };

  const handleSearch = () => {
    const newFilters = {
      status: filters.status,
      method: filters.method,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      searchTerm: filters.searchTerm,
    };
    
    dispatch(setAppliedFilters(newFilters));
    loadData(1, newFilters);
  };

  const handleRowsPerPageChange = useCallback((newSize: number) => {
    dispatch(setPageSize(newSize));
    loadData(1, undefined, newSize);
  }, [dispatch, loadData]);

  const filteredPayments = payments.filter((payment) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
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
        searchTerm={filters.searchTerm}
        statusFilter={filters.status}
        typeFilter={filters.method}
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        onSearchChange={(term) =>
          dispatch(setFilters({ searchTerm: term }))
        }
        onStatusFilterChange={(status) =>
          dispatch(setFilters({ status }))
        }
        onTypeFilterChange={(method) =>
          dispatch(setFilters({ method }))
        }
        onFromDateChange={(date) =>
          dispatch(setFilters({ fromDate: date }))
        }
        onToDateChange={(date) =>
          dispatch(setFilters({ toDate: date }))
        }
        onSearch={handleSearch}
      />

      <PaymentTable
        payments={filteredPayments}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        rowsPerPage={pageSize}
        onShowPaymentQR={handleShowPaymentQR}
        onPageChange={loadData}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <SepayQRDialog
        isOpen={qrDialog.isOpen}
        payment={qrDialog.payment}
        onClose={() => setQrDialog({ isOpen: false, payment: null })}
        onPaymentCompleted={handlePaymentCompleted}
      />
    </AdminLayout>
  );
}
