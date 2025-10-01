import { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from "@/contexts/AuthContext";

export default function Appointments() {
  const { currentUser } = useAuth();
  const [todayAppointments, setTodayAppointments] = useState<AppointmentDto[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0
  });

  const [allAppointments, setAllAppointments] = useState<AppointmentDto[]>([]);
  const [allAppointmentsLoading, setAllAppointmentsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'today' | 'all'>('today');

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [loadingToday, setLoadingToday] = useState(false);

  // Dialogs state
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentDto | null>(null);
  const [viewDialogOpen,  setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const loadTodayAppointments = useCallback(async () => {
    try {
      setLoadingToday(true);
      const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : undefined;
      const data = await appointmentService.getTodayAppointments(tenantId);
      setTodayAppointments(data?.data || []);
    } catch (error) {
      console.error('Error loading today appointments:', error);
      setTodayAppointments([]);
    } finally {
      setLoadingToday(false);
    }
  }, [currentUser?.tenantId]);

  const loadAllAppointments = useCallback(async (page: number = 1) => {
    try {
      setAllAppointmentsLoading(true);

      const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : undefined;
      const filter = {
        pageNumber: page,
        pageSize: pageSize,
        status: statusFilter !== 'all' ? statusFilter : undefined,
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
              console.warn('Could not find array data in response:', result.data);
              items = [];
            }
          }
        }

        setAllAppointments(items);
        setTotalPages(totalPages);
        setTotalCount(totalCount);
        setCurrentPage(page);
      } else {
        setAllAppointments([]);
        setTotalPages(0);
        setTotalCount(0);
      }
    } catch (error) {
      console.error('Error loading all appointments:', error);
      setAllAppointments([]);
      setTotalPages(0);
      setTotalCount(0);
    } finally {
      setAllAppointmentsLoading(false);
    }
  }, [statusFilter, pageSize, currentUser?.tenantId]);

  const loadStats = useCallback(async () => {
    try {
      const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : undefined;
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
  }, [currentUser?.tenantId]);

  const [changingStatus, setChangingStatus] = useState(false);

  const handleStatusChange = useCallback(async (id: number, newStatus: string) => {
    try {
      setChangingStatus(true);

      // Call appropriate API based on status change
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

      // Reload data
      if (viewMode === 'today') {
        loadTodayAppointments();
        loadStats();
      } else {
        loadAllAppointments(currentPage);
      }
    } catch (error) {
      console.error('Error changing status:', error);
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái');
    } finally {
      setChangingStatus(false);
    }
  }, [viewMode, currentPage, loadTodayAppointments, loadStats, loadAllAppointments]);

  useEffect(() => {
    loadTodayAppointments();
    loadStats();
  }, []);

  useEffect(() => {
    if (viewMode === 'all') {
      loadAllAppointments(1);
    } else if (viewMode === 'today') {
      loadTodayAppointments();
      loadStats();
    }
  }, [viewMode, statusFilter, loadAllAppointments, loadTodayAppointments, loadStats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [viewMode]);

  const filteredTodayAppointments = useMemo(() => {
    return todayAppointments.filter(appointment => {
      const matchesSearch = !debouncedSearchTerm ||
        appointment.patientName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        appointment.doctorName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      const matchesStatus = !statusFilter || statusFilter === 'all' || appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [todayAppointments, debouncedSearchTerm, statusFilter]);

  const filteredAllAppointments = useMemo(() => {
    if (!allAppointments || !Array.isArray(allAppointments)) {
      return [];
    }

    return allAppointments.filter(appointment => {
      const matchesSearch = !debouncedSearchTerm ||
        appointment.patientName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        appointment.doctorName?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [allAppointments, debouncedSearchTerm]);

  const currentAppointments = viewMode === 'today' ? filteredTodayAppointments : filteredAllAppointments;
  const currentLoading = viewMode === 'today' ? loadingToday : allAppointmentsLoading;


  const handleRefresh = useCallback(() => {
    if (viewMode === 'today') {
      loadTodayAppointments();
      loadStats();
    } else {
      loadAllAppointments(1);
    }
  }, [viewMode, loadTodayAppointments, loadStats, loadAllAppointments]);

  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && !allAppointmentsLoading) {
      loadAllAppointments(page);
    }
  }, [currentPage, allAppointmentsLoading, loadAllAppointments]);

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
    if (viewMode === 'today') {
      loadTodayAppointments();
      loadStats();
    } else {
      loadAllAppointments(currentPage);
    }
  }, [viewMode, currentPage, loadTodayAppointments, loadStats, loadAllAppointments]);

  const isProcessing = changingStatus;

  return (
    <AdminLayout breadcrumbTitle="Lịch hẹn và tái khám">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch hẹn và tái khám</h1>
          <p className="text-muted-foreground">
            Quản lý lịch hẹn và tái khám của bệnh nhân
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={currentLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${currentLoading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <CreateAppointmentDialog onSuccess={() => {
            loadTodayAppointments();
            loadStats();
            if (viewMode === 'all') {
              loadAllAppointments(1);
            }
          }} />
        </div>
      </div>

      {/* Statistics Cards */}
      <AppointmentStats stats={stats} />

      {/* Filters */}
      <AppointmentFilters
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        debouncedSearchTerm={debouncedSearchTerm}
        isProcessing={isProcessing}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onClearFilters={() => {
          setSearchTerm('');
          setStatusFilter('all');
        }}
      />

      {/* Appointments Table with integrated view toggle */}
      <AppointmentTable
        viewMode={viewMode}
        appointments={currentAppointments}
        todayAppointments={todayAppointments}
        allAppointments={allAppointments}
        currentLoading={currentLoading}
        allAppointmentsLoading={allAppointmentsLoading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        onViewModeChange={setViewMode}
        onStatusChange={handleStatusChange}
        onView={handleView}
        onEdit={handleEdit}
        onPageChange={handlePageChange}
      />

      {/* Dialogs */}
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
