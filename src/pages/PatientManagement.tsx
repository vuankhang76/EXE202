import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import patientService from "@/services/patientService";
import { toast } from "sonner";
import type { PatientDto } from "@/types";
import { Card } from "@/components/ui/Card";
import AdminLayout from "@/layout/AdminLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Eye, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

export default function PatientManagement() {
  const { currentUser, logout } = useAuth();
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'SystemAdmin') {
      toast.error('Bạn không có quyền truy cập trang này');
      logout();
    }
  }, [currentUser]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      const response = await patientService.getPatients(
        pageNumber,
        pageSize,
        searchTerm
      );

      if (response.success && response.data) {
        setPatients(response.data.data || []);
        setTotalCount(response.data.totalCount || 0);
      } else {
        toast.error(response.message || "Không thể tải danh sách bệnh nhân");
      }
    } catch (error) {
      console.error("Error loading patients:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách bệnh nhân");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadPatients();
    }
  }, [currentUser, pageNumber, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1);
  };

  const handleViewDetail = (patient: PatientDto) => {
    setSelectedPatient(patient);
    setShowDetailDialog(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Quản lý Bệnh nhân"
      breadcrumbItems={[
        { title: "Super Admin", href: "/super-admin" },
        { title: "Quản lý Bệnh nhân" }
      ]}
    >
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách Bệnh nhân</h2>
            <p className="mt-1 text-sm text-gray-600">
              Tổng số: {totalCount} bệnh nhân
            </p>
          </div>
          <Button onClick={loadPatients} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Đang tải...</div>
          </div>
        ) : patients.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Không tìm thấy bệnh nhân nào</div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Họ và tên</TableHead>
                    <TableHead>Số điện thoại</TableHead>
                    <TableHead>Ngày sinh</TableHead>
                    <TableHead>Giới tính</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow key={patient.patientId}>
                      <TableCell className="font-medium">{patient.patientId}</TableCell>
                      <TableCell>{patient.fullName}</TableCell>
                      <TableCell>{patient.primaryPhoneE164}</TableCell>
                      <TableCell>
                        {patient.dateOfBirth 
                          ? new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')
                          : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {patient.gender === 'M' || patient.gender === 'Male' ? 'Nam' : 
                           patient.gender === 'F' || patient.gender === 'Female' ? 'Nữ' : 'Khác'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Trang {pageNumber} / {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageNumber === 1}
                    onClick={() => setPageNumber(pageNumber - 1)}
                  >
                    Trang trước
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pageNumber === totalPages}
                    onClick={() => setPageNumber(pageNumber + 1)}
                  >
                    Trang sau
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết Bệnh nhân</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về bệnh nhân
            </DialogDescription>
          </DialogHeader>
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.patientId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.primaryPhoneE164}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày sinh</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPatient.dateOfBirth 
                      ? new Date(selectedPatient.dateOfBirth).toLocaleDateString('vi-VN')
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Giới tính</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPatient.gender === 'M' || selectedPatient.gender === 'Male' ? 'Nam' : 
                     selectedPatient.gender === 'F' || selectedPatient.gender === 'Female' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Địa chỉ</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.address || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Liên hệ khẩn cấp</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.emergencyContact || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Nhóm máu</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedPatient.bloodType || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedPatient.createdAt 
                      ? new Date(selectedPatient.createdAt).toLocaleDateString('vi-VN')
                      : "N/A"}
                  </p>
                </div>
              </div>
              
              {selectedPatient.medicalHistory && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Tiền sử bệnh</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedPatient.medicalHistory}
                  </p>
                </div>
              )}
              
              {selectedPatient.allergies && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Dị ứng</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedPatient.allergies}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

