import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/Pagination";
import { Input } from "@/components/ui/Input";
import { Plus, Search, RefreshCw, Eye, Trash2, FileText } from "lucide-react";
import { medicalCaseRecordService } from "@/services/medicalCaseRecordService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type {
  MedicalCaseRecordDto,
  MedicalCaseRecordFilterDto,
} from "@/types/medicalCaseRecord";
import ConfirmDialog from "@/components/ConfirmDialog";
import TableSkeleton from "@/components/ui/TableSkeleton";
import CaseDetailDialog from "@/components/MedicalCaseRecords/CaseDetailDialog";
import CreateCaseDialog from "@/components/MedicalCaseRecords/CreateCaseDialog";

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
    <AdminLayout breadcrumbTitle="Bệnh án">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Tổng số ca bệnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ca bệnh đang điều trị
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {records.filter((r) => r.status === "Ongoing").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ca bệnh đã hoàn thành
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter((r) => r.status === "Completed").length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Trang {currentPage} / {totalPages}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-700">{currentPage}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Tìm kiếm và lọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm bệnh nhân, bác sĩ, chẩn đoán..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="Ongoing">Đang điều trị</option>
                <option value="Completed">Đã hoàn thành</option>
              </select>

              <div className="flex gap-2">
                <Button
                  onClick={handleSearch}
                  className="bg-red-500 hover:bg-red-600 flex-1"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRefresh}
                  disabled={loading}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Records Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">Danh sách bệnh án</CardTitle>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm ca bệnh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={10} columns={7} />
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Không có bệnh án nào
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Mã CA</TableHead>
                        <TableHead>Bệnh nhân</TableHead>
                        <TableHead>Bác sĩ</TableHead>
                        <TableHead>Chẩn đoán</TableHead>
                        <TableHead>Trạng thái</TableHead>
                        <TableHead>Ngày tạo</TableHead>
                        <TableHead>Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRecords.map((record) => (
                        <TableRow key={record.caseId} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            #{record.caseId}
                          </TableCell>
                          <TableCell>{record.patientName || "-"}</TableCell>
                          <TableCell>{record.doctorName || "-"}</TableCell>
                          <TableCell className="max-w-xs truncate">
                            {record.diagnosis || "-"}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                record.status === "Ongoing"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {record.status === "Ongoing"
                                ? "Đang điều trị"
                                : "Đã hoàn thành"}
                            </span>
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.createdAt), "dd/MM/yyyy", {
                              locale: vi,
                            })}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedCaseId(record.caseId);
                                  setIsDetailDialogOpen(true);
                                }}
                                title="Xem chi tiết"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-blue-600 hover:text-blue-700"
                                title="Xem file"
                              >
                                <FileText className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleDeleteRecord(record.caseId)}
                                title="Xóa"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => {
                              if (currentPage > 1) {
                                loadRecords(currentPage - 1);
                              }
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => {
                          const pageNum = i + 1;
                          const shouldShow =
                            pageNum === 1 ||
                            pageNum === totalPages ||
                            Math.abs(pageNum - currentPage) <= 1;

                          if (!shouldShow) return null;

                          return (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                onClick={() => loadRecords(pageNum)}
                                isActive={pageNum === currentPage}
                                className="cursor-pointer"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        })}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() => {
                              if (currentPage < totalPages) {
                                loadRecords(currentPage + 1);
                              }
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
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

      {/* Case Detail Dialog */}
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

      {/* Create Case Dialog */}
      <CreateCaseDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={() => loadRecords(1)}
      />
    </AdminLayout>
  );
}
