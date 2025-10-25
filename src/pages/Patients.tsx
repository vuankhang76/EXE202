import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Plus, RefreshCw } from "lucide-react";
import { medicalCaseRecordService } from "@/services/medicalCaseRecordService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type {
  MedicalCaseRecordDto,
  MedicalCaseRecordFilterDto,
} from "@/types/medicalCaseRecord";
import ConfirmDialog from "@/components/ConfirmDialog";
import CaseDetailDialog from "@/components/medicalCaseRecords/CaseDetailDialog";
import CreateCaseDialog from "@/components/medicalCaseRecords/CreateCaseDialog";
import StatsCards from "@/components/medicalCaseRecords/MedicalCaseRecordsStats";
import FilterSection from "@/components/medicalCaseRecords/MedicalCaseRecordsFilter";
import RecordsTable from "@/components/medicalCaseRecords/MedicalCaseRecordsTable";

export default function Patients() {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [records, setRecords] = useState<MedicalCaseRecordDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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
        setLoading(true);

        if (!tenantId) {
          toast.error("Không thể tải danh sách. Vui lòng liên hệ quản trị viên.");
          return;
        }

        const filter: MedicalCaseRecordFilterDto = {
          tenantId,
          pageNumber: page,
          pageSize: pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
        };

        const response = await medicalCaseRecordService.getMedicalCaseRecords(filter);

        if (response.success && response.data) {
          setRecords(response.data.data || []);
          setTotalPages(response.data.totalPages || 0);
          setCurrentPage(page);
        } else {
          setRecords([]);
          setTotalPages(0);
        }
      } catch (error) {
        console.error("Error loading records:", error);
        toast.error("Có lỗi xảy ra khi tải dữ liệu");
      } finally {
        setLoading(false);
      }
    },
    [tenantId, statusFilter, pageSize]
  );

  useEffect(() => {
    loadRecords(1);
  }, [loadRecords]);

  const handleSearch = () => {
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
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
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
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
          onSearchTermChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
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
