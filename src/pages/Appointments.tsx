import { useState, useEffect, useCallback, useRef } from 'react';
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import CreateAppointmentDialog from "@/components/appointments/CreateAppointmentDialog";
import ViewAppointmentDialog from "@/components/appointments/ViewAppointmentDialog";
import EditAppointmentDialog from "@/components/appointments/EditAppointmentDialog";
import AppointmentStats from "@/components/appointments/AppointmentStats";
import AppointmentFilters from "@/components/appointments/AppointmentFilters";
import AppointmentTable from "@/components/appointments/AppointmentTable";
import appointmentService from "@/services/appointmentService";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";
import {
  useAppDispatch,
  useAppointmentData,
  useAppointmentLoading,
  useAppointmentFilters,
  useAppointmentAppliedFilters,
  isCacheValid,
} from "@/stores/hooks";
import {
  setLoading,
  setAppointmentData,
  setStats,
  setCurrentPage,
  setFilters,
  setAppliedFilters,
  clearAppointmentData,
  setPageSize,
} from "@/stores/appointmentSlice";

export default function Appointments() {
  const { currentUser } = useAuth();

  const dispatch = useAppDispatch();
  const {
    appointments,
    stats,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    lastUpdated,
    cacheExpiration,
  } = useAppointmentData();
  const loading = useAppointmentLoading();
  const filters = useAppointmentFilters();
  const appliedFilters = useAppointmentAppliedFilters();

  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const hasShownTenantErrorRef = useRef(false);

  const checkTenantId = useCallback((showToast: boolean = false) => {
    const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : null;
    if (!tenantId && showToast && !hasShownTenantErrorRef.current) {
      toast.error('Không thể tải danh sách lịch hẹn. Vui lòng liên hệ quản trị viên.');
      hasShownTenantErrorRef.current = true;
    }
    return tenantId;
  }, [currentUser?.tenantId]);

  const loadAppointments = useCallback(
    async (page: number = 1, customFilters?: typeof appliedFilters, customPageSize?: number) => {
      try {
        dispatch(setLoading(true));

        const tenantId = checkTenantId(false);
        if (!tenantId) {
          dispatch(setLoading(false));
          return;
        }

        const filtersToUse = customFilters || appliedFilters;
        const pageSizeToUse = customPageSize !== undefined ? customPageSize : pageSize;

        const filter = {
          pageNumber: page,
          pageSize: pageSizeToUse,
          searchTerm: filtersToUse.searchTerm || undefined,
          status: filtersToUse.statusFilter && filtersToUse.statusFilter !== 'all' ? filtersToUse.statusFilter : undefined,
          type: filtersToUse.typeFilter && filtersToUse.typeFilter !== 'all' ? filtersToUse.typeFilter : undefined,
          fromDate: filtersToUse.fromDate || undefined,
          toDate: filtersToUse.toDate || undefined,
          tenantId,
        };

        const result = await appointmentService.getAppointments(filter);

        if (result.success) {
          let items = [];
          let totalPages = 1;
          let totalCount = 0;

          if (Array.isArray(result.data)) {
            items = result.data;
            totalCount = items.length;
          } else if (result.data && result.data.data && Array.isArray(result.data.data)) {
            items = result.data.data;
            totalPages = result.data.totalPages || 1;
            totalCount = result.data.totalCount || items.length;
          } else if (result.data) {
            const possibleItemsKeys = ['items', 'data', 'results', 'appointments', 'content'];
            let foundItems = null;

            for (const key of possibleItemsKeys) {
              if ((result.data as any)[key] && Array.isArray((result.data as any)[key])) {
                foundItems = (result.data as any)[key];
                break;
              }
            }

            if (foundItems) {
              items = foundItems;
              totalPages = result.data.totalPages || (result.data as any).pageCount || 1;
              totalCount = result.data.totalCount || (result.data as any).total || (result.data as any).count || items.length;
            } else {
              const values = Object.values(result.data);
              const arrayValues = values.filter(v => Array.isArray(v));

              if (arrayValues.length > 0) {
                items = arrayValues[0] as any[];
                totalCount = items.length;
              } else {
                items = [];
              }
            }
          }

          dispatch(
            setAppointmentData({
              appointments: items,
              stats,
              totalPages,
              totalCount,
              currentPage: page,
            })
          );
        } else {
          dispatch(
            setAppointmentData({
              appointments: [],
              stats,
              totalPages: 0,
              totalCount: 0,
              currentPage: page,
            })
          );
        }
      } catch (error) {
        console.error('Error loading appointments:', error);
        dispatch(clearAppointmentData());
      } finally {
        dispatch(setLoading(false));
      }
    },
    [
      appliedFilters.searchTerm,
      appliedFilters.statusFilter,
      appliedFilters.typeFilter,
      appliedFilters.fromDate,
      appliedFilters.toDate,
      pageSize,
      checkTenantId,
      stats,
      dispatch,
    ]
  );

  const handleRowsPerPageChange = useCallback((newSize: number) => {
    dispatch(setPageSize(newSize));
    loadAppointments(1, undefined, newSize);
  }, [dispatch, loadAppointments]);

  const loadStats = useCallback(async () => {
    try {
      const tenantId = checkTenantId(false);
      if (!tenantId) {
        dispatch(
          setStats({
            total: 0,
            pending: 0,
            confirmed: 0,
            inProgress: 0,
            completed: 0,
            cancelled: 0,
          })
        );
        return;
      }

      const statsData = await appointmentService.getAppointmentStats(tenantId);
      dispatch(setStats(statsData));
    } catch (error) {
      console.error('Error loading stats:', error);
      dispatch(
        setStats({
          total: 0,
          pending: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
        })
      );
    }
  }, [checkTenantId, dispatch]);

  useEffect(() => {
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }
  
    const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : null;
    if (tenantId) {
      loadAppointments(1);
      loadStats();
    } else if (!hasShownTenantErrorRef.current) {
      toast.error('Không thể tải danh sách lịch hẹn. Vui lòng liên hệ quản trị viên.');
      hasShownTenantErrorRef.current = true;
    }
  }, [lastUpdated, cacheExpiration, currentUser?.tenantId, pageSize, loadAppointments, loadStats]);

  const handleStatusChange = useCallback(
    async (id: number, newStatus: string) => {
      try {
        switch (newStatus) {
          case 'Confirmed':
            await appointmentService.confirmAppointment(id);
            toast.success('Xác nhận lịch hẹn thành công!');
            break;
          case 'InProgress':
            await appointmentService.startAppointment(id);
            toast.success('Bắt đầu khám thành công!');
            break;
          case 'Completed':
            await appointmentService.completeAppointment(id);
            toast.success('Hoàn thành lịch hẹn thành công!');
            break;
          case 'Cancelled':
            const reason = prompt('Nhập lý do hủy lịch hẹn (tùy chọn):');
            await appointmentService.cancelAppointment(id, reason || undefined);
            toast.success('Hủy lịch hẹn thành công!');
            break;
          default:
            toast.info('Trạng thái không thay đổi');
            return;
        }

        loadAppointments(currentPage);
        loadStats();
      } catch (error) {
        console.error('Error changing status:', error);
        toast.error('Có lỗi xảy ra khi thay đổi trạng thái');
      }
    },
    [currentPage, loadAppointments, loadStats]
  );

  const handleRefresh = useCallback(() => {
    loadAppointments(1);
    loadStats();
  }, [loadAppointments, loadStats]);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page !== currentPage && !loading) {
        dispatch(setCurrentPage(page));
        loadAppointments(page);
      }
    },
    [currentPage, loading, loadAppointments, dispatch]
  );

  const handleView = useCallback(async (id: number) => {
    try {
      const result = await appointmentService.getAppointmentById(id, true);
      if (result.success && result.data) {
        setSelectedAppointment(result.data);
        setViewDialogOpen(true);
      } else {
        toast.error('Không thể tải thông tin lịch hẹn');
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin lịch hẹn');
    }
  }, []);

  const handleEdit = useCallback(async (id: number) => {
    try {
      const result = await appointmentService.getAppointmentById(id, true);
      if (result.success && result.data) {
        setSelectedAppointment(result.data);
        setEditDialogOpen(true);
      } else {
        toast.error('Không thể tải thông tin lịch hẹn');
      }
    } catch (error) {
      console.error('Error loading appointment:', error);
      toast.error('Có lỗi xảy ra khi tải thông tin lịch hẹn');
    }
  }, []);

  const handleEditSuccess = useCallback(() => {
    loadAppointments(currentPage);
    loadStats();
  }, [currentPage, loadAppointments, loadStats]);

  const handleSearchClick = () => {
    const newFilters = {
      searchTerm: filters.searchTerm,
      statusFilter: filters.statusFilter,
      typeFilter: filters.typeFilter,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
    };
    
    dispatch(setAppliedFilters(newFilters));
    loadAppointments(1, newFilters);
  };

  return (
    <AdminLayout
      breadcrumbTitle="Lịch hẹn và tái khám"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <CreateAppointmentDialog
            onSuccess={() => {
              loadAppointments(1);
              loadStats();
            }}
          />
        </div>
      }
    >
      <AppointmentStats stats={stats} loading={loading} />

      <AppointmentFilters
        searchTerm={filters.searchTerm}
        statusFilter={filters.statusFilter}
        typeFilter={filters.typeFilter}
        fromDate={filters.fromDate}
        toDate={filters.toDate}
        onSearchChange={(term) =>
          dispatch(setFilters({ searchTerm: term }))
        }
        onStatusFilterChange={(status) =>
          dispatch(setFilters({ statusFilter: status }))
        }
        onTypeFilterChange={(type) =>
          dispatch(setFilters({ typeFilter: type }))
        }
        onFromDateChange={(date) =>
          dispatch(setFilters({ fromDate: date }))
        }
        onToDateChange={(date) =>
          dispatch(setFilters({ toDate: date }))
        }
        onSearch={handleSearchClick}
      />

      <AppointmentTable
        appointments={appointments}
        currentLoading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        rowsPerPage={pageSize}
        onStatusChange={handleStatusChange}
        onView={handleView}
        onEdit={handleEdit}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />

      <ViewAppointmentDialog
        appointment={selectedAppointment}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
      />

      <EditAppointmentDialog
        appointment={selectedAppointment}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={handleEditSuccess}
      />
    </AdminLayout>
  );
}
