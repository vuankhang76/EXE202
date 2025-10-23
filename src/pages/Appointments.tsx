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
import type { AppointmentDto } from "@/types/appointment";
import appointmentService from "@/services/appointmentService";
import { toast } from 'sonner';
import { useAuth } from "@/contexts/AuthContext";

export default function Appointments() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  const [appointments, setAppointments] = useState<AppointmentDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date());
  const [toDate, setToDate] = useState<Date | undefined>(new Date());

  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
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

  const loadAppointments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);

      const tenantId = checkTenantId(false);
      if (!tenantId) {
        setLoading(false);
        return;
      }

      const filter = {
        pageNumber: page,
        pageSize: pageSize,
        searchTerm: searchTerm || undefined,
        status: statusFilter && statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter && typeFilter !== 'all' ? typeFilter : undefined,
        fromDate: fromDate ? fromDate.toISOString() : undefined,
        toDate: toDate ? toDate.toISOString() : undefined,
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
              items = arrayValues[0];
              totalCount = items.length;
            } else {
              items = [];
            }
          }
        }

        setAppointments(items);
        setTotalPages(totalPages);
        setTotalCount(totalCount);
        setCurrentPage(page);
      } else {
        setAppointments([]);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (error) {
      setAppointments([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, fromDate, toDate, pageSize, checkTenantId]);

  const loadStats = useCallback(async () => {
    try {
      const tenantId = checkTenantId(false);
      if (!tenantId) {
        setStats({
          total: 0,
          pending: 0,
          confirmed: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0
        });
        return;
      }

      const statsData = await appointmentService.getAppointmentStats(tenantId);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        total: 0,
        pending: 0,
        confirmed: 0,
        inProgress: 0,
        completed: 0,
        cancelled: 0
      });
    }
  }, [checkTenantId]);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
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
  }, [currentPage, loadAppointments, loadStats]);

  useEffect(() => {
    const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : null;
    if (tenantId) {
      loadAppointments(1);
      loadStats();
    } else if (!hasShownTenantErrorRef.current) {
      toast.error('Không thể tải danh sách lịch hẹn. Vui lòng liên hệ quản trị viên.');
      hasShownTenantErrorRef.current = true;
    }
  }, [currentUser?.tenantId]);

  const handleRefresh = useCallback(() => {
    loadAppointments(1);
    loadStats();
  }, [loadAppointments, loadStats]);

  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && !loading) {
      loadAppointments(page);
    }
  }, [currentPage, loading, loadAppointments]);

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

  return (
    <AdminLayout
      breadcrumbTitle="Lịch hẹn và tái khám"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <CreateAppointmentDialog onSuccess={() => {
            loadAppointments(1);
            loadStats();
          }}
          />
        </div>
      }
    >

          <AppointmentStats stats={stats} loading={loading}/>

          <AppointmentFilters
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            fromDate={fromDate}
            toDate={toDate}
            onSearchChange={setSearchTerm}
            onStatusFilterChange={setStatusFilter}
            onTypeFilterChange={setTypeFilter}
            onFromDateChange={setFromDate}
            onToDateChange={setToDate}
            onSearch={() => {
              loadAppointments(1);
            }}
          />

          <AppointmentTable
            appointments={appointments}
            currentLoading={loading}
            currentPage={currentPage}
            totalPages={totalPages}
            totalCount={totalCount}
            onStatusChange={handleStatusChange}
            onView={handleView}
            onEdit={handleEdit}
            onPageChange={handlePageChange}
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
