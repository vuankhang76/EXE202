import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import userService from "@/services/userService";
import { toast } from "sonner";
import type { UserDto } from "@/types";
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
import { Search, Eye, Ban, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

export default function DoctorManagement() {
  const { currentUser, logout } = useAuth();
  const [doctors, setDoctors] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState<UserDto | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    if (currentUser?.role !== 'SystemAdmin') {
      toast.error('Bạn không có quyền truy cập trang này');
      logout();
    }
  }, [currentUser]);

  const loadDoctors = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(
        undefined,
        pageNumber,
        pageSize,
        searchTerm
      );

      if (response.success && response.data) {
        // Lọc chỉ lấy users có role là Doctor
        const doctorUsers = (response.data.data || []).filter(
          (user: UserDto) => user.role === 'Doctor'
        );
        setDoctors(doctorUsers);
        setTotalCount(doctorUsers.length);
      } else {
        toast.error(response.message || "Không thể tải danh sách bác sĩ");
      }
    } catch (error) {
      console.error("Error loading doctors:", error);
      toast.error("Có lỗi xảy ra khi tải danh sách bác sĩ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadDoctors();
    }
  }, [currentUser, pageNumber, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPageNumber(1);
  };

  const handleDeactivateDoctor = async (userId: number) => {
    if (!confirm("Bạn có chắc chắn muốn vô hiệu hóa tài khoản bác sĩ này?")) {
      return;
    }

    try {
      const response = await userService.deactivateUser(userId);
      if (response.success) {
        toast.success("Đã vô hiệu hóa tài khoản bác sĩ");
        loadDoctors();
      } else {
        toast.error(response.message || "Không thể vô hiệu hóa tài khoản");
      }
    } catch (error) {
      console.error("Error deactivating doctor:", error);
      toast.error("Có lỗi xảy ra khi vô hiệu hóa tài khoản");
    }
  };

  const handleViewDetail = (doctor: UserDto) => {
    setSelectedDoctor(doctor);
    setShowDetailDialog(true);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Quản lý Bác sĩ"
      breadcrumbItems={[
        { title: "Super Admin", href: "/super-admin" },
        { title: "Quản lý Bác sĩ" }
      ]}
    >
      <Card className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Danh sách Bác sĩ</h2>
            <p className="mt-1 text-sm text-gray-600">
              Tổng số: {totalCount} bác sĩ
            </p>
          </div>
          <Button onClick={loadDoctors} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
        </div>

        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
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
        ) : doctors.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-gray-500">Không tìm thấy bác sĩ nào</div>
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
                    <TableHead>Email</TableHead>
                    <TableHead>Phòng khám</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doctors.map((doctor) => (
                    <TableRow key={doctor.userId}>
                      <TableCell className="font-medium">{doctor.userId}</TableCell>
                      <TableCell>{doctor.fullName}</TableCell>
                      <TableCell>{doctor.phoneE164 || "N/A"}</TableCell>
                      <TableCell>{doctor.email || "N/A"}</TableCell>
                      <TableCell>Tenant #{doctor.tenantId}</TableCell>
                      <TableCell>
                        <Badge variant={doctor.isActive ? "default" : "destructive"}>
                          {doctor.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetail(doctor)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {doctor.isActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeactivateDoctor(doctor.userId)}
                            >
                              <Ban className="h-4 w-4 text-red-500" />
                            </Button>
                          )}
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
            <DialogTitle>Chi tiết Bác sĩ</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về tài khoản bác sĩ
            </DialogDescription>
          </DialogHeader>
          {selectedDoctor && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.userId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Họ và tên</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.fullName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Số điện thoại</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.phoneE164 || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.email || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Giới tính</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDoctor.gender === 'M' || selectedDoctor.gender === 'Male' ? 'Nam' : 
                     selectedDoctor.gender === 'F' || selectedDoctor.gender === 'Female' ? 'Nữ' : 'Khác'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Vai trò</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedDoctor.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Phòng khám</label>
                  <p className="mt-1 text-sm text-gray-900">Tenant #{selectedDoctor.tenantId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Trạng thái</label>
                  <p className="mt-1">
                    <Badge variant={selectedDoctor.isActive ? "default" : "destructive"}>
                      {selectedDoctor.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                    </Badge>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Ngày tạo</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDoctor.createdAt ? new Date(selectedDoctor.createdAt).toLocaleDateString('vi-VN') : "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Cập nhật lần cuối</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedDoctor.updatedAt ? new Date(selectedDoctor.updatedAt).toLocaleDateString('vi-VN') : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}

