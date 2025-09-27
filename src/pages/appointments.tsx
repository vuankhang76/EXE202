import { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { RefreshCw } from "lucide-react";
import CreateAppointmentDialog from "@/components/appointments/CreateAppointmentDialog";
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

  const debouncedSearchTerm = useDebounce(searchTerm, 1000);

  const [loadingToday, setLoadingToday] = useState(false);

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

  const loadAllAppointments = useCallback(async (page: number = 1, resetData: boolean = false) => {
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


        // Always replace data for pagination (no more appending)
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

  const [confirmingAppointment, setConfirmingAppointment] = useState(false);

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

  const confirmAppointment = useCallback(async (id: number) => {
    try {
      setConfirmingAppointment(true);
      await appointmentService.confirmAppointment(id);
      toast.success('Xác nhận lịch hẹn thành công!');
      loadTodayAppointments();
      loadStats();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      toast.error('Có lỗi xảy ra khi xác nhận lịch hẹn');
    } finally {
      setConfirmingAppointment(false);
    }
  }, [loadTodayAppointments, loadStats]);

  const [startingAppointment, setStartingAppointment] = useState(false);

  const startAppointment = useCallback(async (id: number) => {
    try {
      setStartingAppointment(true);
      await appointmentService.startAppointment(id);
      toast.success('Bắt đầu khám thành công!');
      loadTodayAppointments();
      loadStats();
    } catch (error) {
      console.error('Error starting appointment:', error);
      toast.error('Có lỗi xảy ra khi bắt đầu khám');
    } finally {
      setStartingAppointment(false);
    }
  }, [loadTodayAppointments, loadStats]);

  const [completingAppointment, setCompletingAppointment] = useState(false);

  const completeAppointment = useCallback(async (id: number) => {
    try {
      setCompletingAppointment(true);
      await appointmentService.completeAppointment(id);
      toast.success('Hoàn thành lịch hẹn thành công!');
      loadTodayAppointments();
      loadStats();
    } catch (error) {
      console.error('Error completing appointment:', error);
      toast.error('Có lỗi xảy ra khi hoàn thành lịch hẹn');
    } finally {
      setCompletingAppointment(false);
    }
  }, [loadTodayAppointments, loadStats]);

  const [cancellingAppointment, setCancellingAppointment] = useState(false);

  const cancelAppointment = useCallback(async (id: number, reason?: string) => {
    try {
      setCancellingAppointment(true);
      await appointmentService.cancelAppointment(id, reason);
      toast.success('Hủy lịch hẹn thành công!');
      loadTodayAppointments();
      loadStats();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error('Có lỗi xảy ra khi hủy lịch hẹn');
    } finally {
      setCancellingAppointment(false);
    }
  }, [loadTodayAppointments, loadStats]);

  useEffect(() => {
    loadTodayAppointments();
    loadStats();
  }, []);

  useEffect(() => {
    if (viewMode === 'all') {
      loadAllAppointments(1, true);
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
      loadAllAppointments(1, true);
    }
  }, [viewMode, loadTodayAppointments, loadStats, loadAllAppointments]);

  const handlePageChange = useCallback((page: number) => {
    if (page !== currentPage && !allAppointmentsLoading) {
      loadAllAppointments(page, true); // Reset data for new page
    }
  }, [currentPage, allAppointmentsLoading, loadAllAppointments]);

  const handleConfirm = useCallback(async (id: number) => {
    await confirmAppointment(id);
  }, [confirmAppointment]);

  const handleStart = useCallback(async (id: number) => {
    await startAppointment(id);
  }, [startAppointment]);

  const handleComplete = useCallback(async (id: number) => {
    await completeAppointment(id);
  }, [completeAppointment]);

  const handleCancel = useCallback(async (id: number) => {
    const reason = prompt('Nhập lý do hủy lịch hẹn (tùy chọn):');
    await cancelAppointment(id, reason || undefined);
  }, [cancelAppointment]);

  const isProcessing = confirmingAppointment || startingAppointment || completingAppointment || cancellingAppointment;

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
              loadAllAppointments(1, true);
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
        onConfirm={handleConfirm}
        onStart={handleStart}
        onComplete={handleComplete}
        onCancel={handleCancel}
        onView={(id) => toast.info(`Xem chi tiết lịch hẹn #${id}`)}
        onEdit={(id) => toast.info(`Chỉnh sửa lịch hẹn #${id}`)}
        onPageChange={handlePageChange}
      />
    </AdminLayout>
  );
}
