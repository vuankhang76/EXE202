import { useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import CreatePaymentDialog from "@/components/payments/CreatePaymentDialog";
import PaymentStats from "@/components/payments/PaymentStats";
import PaymentFilters from "@/components/payments/PaymentFilters";
import PaymentTable from "@/components/payments/PaymentTable";
import ConfirmDialog from "@/components/ConfirmDialog";
import { paymentTransactionService } from "@/services/paymentTransactionService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  PaymentTransactionFilterDto,
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
    lastUpdated,
    cacheExpiration,
  } = usePaymentData();
  const loading = usePaymentLoading();
  const filters = usePaymentFilters();
  const appliedFilters = usePaymentAppliedFilters();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    paymentId: number | null;
  }>({
    isOpen: false,
    paymentId: null,
  });

  const loadData = useCallback(
    async (page: number = 1) => {
      try {
        dispatch(setLoading(true));

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
            appliedFilters.status && appliedFilters.status !== "all"
              ? appliedFilters.status
              : undefined,
          method:
            appliedFilters.method && appliedFilters.method !== "all"
              ? appliedFilters.method
              : undefined,
          fromDate: appliedFilters.fromDate
            ? appliedFilters.fromDate instanceof Date
              ? appliedFilters.fromDate.toISOString()
              : appliedFilters.fromDate
            : undefined,
          toDate: appliedFilters.toDate
            ? appliedFilters.toDate instanceof Date
              ? appliedFilters.toDate.toISOString()
              : appliedFilters.toDate
            : undefined,
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
        console.error("Error loading data:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        dispatch(clearPaymentData());
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      tenantId,
      appliedFilters.status,
      appliedFilters.method,
      appliedFilters.fromDate,
      appliedFilters.toDate,
      pageSize,
      dispatch,
    ]
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
    setConfirmDialog({
      isOpen: true,
      paymentId,
    });
  };

  const handleSearch = () => {
    dispatch(
      setAppliedFilters({
        status: filters.status,
        method: filters.method,
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        searchTerm: filters.searchTerm,
      })
    );
    loadData(1);
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.paymentId === null) return;

    try {
      const result = await paymentTransactionService.deletePaymentTransaction(
        confirmDialog.paymentId
      );
      if (result.success) {
        toast.success("Đã xóa giao dịch");
        setConfirmDialog({ isOpen: false, paymentId: null });
        loadData(currentPage);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa giao dịch");
    }
  };

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
        onCompletePayment={handleCompletePayment}
        onFailPayment={handleFailPayment}
        onDeletePayment={handleDeletePayment}
        onPageChange={loadData}
      />

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xóa giao dịch"
        description={`Bạn có chắc chắn muốn xóa giao dịch #${confirmDialog.paymentId}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, paymentId: null })}
      />
    </AdminLayout>
  );
}
