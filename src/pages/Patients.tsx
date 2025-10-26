import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Plus, RefreshCw } from "lucide-react";
import { medicalCaseRecordService } from "@/services/medicalCaseRecordService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { MedicalCaseRecordFilterDto } from "@/types/medicalCaseRecord";
import ConfirmDialog from "@/components/ConfirmDialog";
import CaseDetailDialog from "@/components/medicalCaseRecords/CaseDetailDialog";
import CreateCaseDialog from "@/components/medicalCaseRecords/CreateCaseDialog";
import StatsCards from "@/components/medicalCaseRecords/MedicalCaseRecordsStats";
import FilterSection from "@/components/medicalCaseRecords/MedicalCaseRecordsFilter";
import RecordsTable from "@/components/medicalCaseRecords/MedicalCaseRecordsTable";
import {
  useAppDispatch,
  usePatientData,
  usePatientLoading,
  usePatientFilters,
  usePatientAppliedFilters,
  isCacheValid,
} from "@/stores/hooks";
import {
  setLoading,
  setPatientData,
  setFilters,
  setAppliedFilters,
  clearPatientData,
} from "@/stores/patientSlice";

export default function Patients() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const dispatch = useAppDispatch();
  const {
    records,
    currentPage,
    totalPages,
    pageSize,
    lastUpdated,
    cacheExpiration,
  } = usePatientData();
  const loading = usePatientLoading();
  const filters = usePatientFilters();
  const appliedFilters = usePatientAppliedFilters();

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    caseId: number | null;
  }>({
    isOpen: false,
    caseId: null,
  });

  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const loadRecords = useCallback(
    async (page: number = 1) => {
      try {
        dispatch(setLoading(true));

        if (!tenantId) {
          toast.error("Không thể tải danh sách. Vui lòng liên hệ quản trị viên.");
          return;
        }

        const filter: MedicalCaseRecordFilterDto = {
          tenantId,
          pageNumber: page,
          pageSize: pageSize,
          status:
            appliedFilters.status && appliedFilters.status !== "all"
              ? appliedFilters.status
              : undefined,
        };

        const response = await medicalCaseRecordService.getMedicalCaseRecords(filter);

        if (response.success && response.data) {
          dispatch(
            setPatientData({
              records: response.data.data ?? [],
              totalPages: response.data.totalPages ?? 0,
              currentPage: page,
            })
          );
        } else {
          dispatch(
            setPatientData({
              records: [],
              totalPages: 0,
              currentPage: page,
            })
          );
        }
      } catch (error) {
        console.error("Error loading records:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
        dispatch(clearPatientData());
      } finally {
        dispatch(setLoading(false));
      }
    },
    [tenantId, appliedFilters.status, pageSize, dispatch]
  );

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadRecords(1);
  }, [lastUpdated, cacheExpiration, loadRecords]);

  const handleSearch = () => {
    dispatch(
      setAppliedFilters({
        status: filters.status,
        searchTerm: filters.searchTerm,
      })
    );
    loadRecords(1);
  };

  const handleRefresh = () => {
    loadRecords(currentPage);
  };

  const handleDeleteRecord = async (caseId: number) => {
    setConfirmDialog({
      isOpen: true,
      caseId,
    });
  };

  const handleConfirmDelete = async () => {
    if (confirmDialog.caseId === null) return;

    try {
      const result = await medicalCaseRecordService.deleteMedicalCaseRecord(
        confirmDialog.caseId
      );
      if (result.success) {
        toast.success("Đã xóa hồ sơ ca bệnh");
        setConfirmDialog({ isOpen: false, caseId: null });
        loadRecords(currentPage);
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa hồ sơ");
    }
  };

  const filteredRecords = records.filter((record) => {
    if (!filters.searchTerm) return true;
    const search = filters.searchTerm.toLowerCase();
    return (
      record.patientName?.toLowerCase().includes(search) ||
      record.doctorName?.toLowerCase().includes(search) ||
      record.diagnosis?.toLowerCase().includes(search) ||
      record.chiefComplaint?.toLowerCase().includes(search)
    );
  });

  return (
    <AdminLayout 
      breadcrumbTitle="Bệnh án"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm ca bệnh
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <StatsCards
          records={records}
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
        />

        <FilterSection
          searchTerm={filters.searchTerm}
          statusFilter={filters.status}
          loading={loading}
          onSearchTermChange={(term) =>
            dispatch(setFilters({ searchTerm: term }))
          }
          onStatusFilterChange={(status) =>
            dispatch(setFilters({ status }))
          }
          onSearch={handleSearch}
        />

        <RecordsTable
          records={filteredRecords}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          onViewDetail={(caseId) => {
            setSelectedCaseId(caseId);
            setIsDetailDialogOpen(true);
          }}
          onDelete={handleDeleteRecord}
          onPageChange={loadRecords}
        />
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title="Xóa bệnh án"
        description={`Bạn có chắc chắn muốn xóa bệnh án #${confirmDialog.caseId}?`}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, caseId: null })}
      />

      {selectedCaseId && (
        <CaseDetailDialog
          isOpen={isDetailDialogOpen}
          caseId={selectedCaseId}
          onClose={() => {
            setIsDetailDialogOpen(false);
            setSelectedCaseId(null);
          }}
          onRefresh={() => loadRecords(currentPage)}
        />
      )}

      <CreateCaseDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => loadRecords(1)}
      />
    </AdminLayout>
  );
}
