import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Edit, Shield, ShieldOff } from "lucide-react";
import type { TenantDto, UserDto } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import TablePagination from "@/components/ui/TablePagination";
import EditAdminDialog from "./EditAdminDialog";
import userService from "@/services/userService";
import { toast } from "sonner";
import { TableSkeleton } from "../ui/TableSkeleton";

interface AdminManagementTabProps {
  admins: UserDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
  tenants: TenantDto[];
  totalCount?: number;
  rowsPerPage?: number;
  onRowsPerPageChange?: (rows: number) => void;
}

export default function AdminManagementTab({
  admins,
  loading,
  currentPage,
  totalPages,
  searchTerm,
  onPageChange,
  onSearchChange,
  onRefresh,
  tenants,
  totalCount = 0,
  rowsPerPage = 10,
  onRowsPerPageChange,
}: AdminManagementTabProps) {
    
  const [tempSearch, setTempSearch] = useState(searchTerm);
  const [editAdmin, setEditAdmin] = useState<UserDto | null>(null);

  const handleSearch = () => {
    onSearchChange(tempSearch);
    onPageChange(1);
  };

  const getTenantName = (tenantId?: number) => {
    if (!tenantId) return "-";
    const tenant = tenants.find((t) => t.tenantId === tenantId);
    return tenant?.name || "-";
  };

  const getRoleBadge = (role: string) => {
    if (role === "SystemAdmin") {
      return <Badge variant="destructive">System Admin</Badge>;
    }
    return <Badge variant="default">Clinic Admin</Badge>;
  };

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) {
      return <Badge variant="success">Hoạt động</Badge>;
    }
    return <Badge variant="secondary">Vô hiệu hóa</Badge>;
  };

  const handleToggleActive = async (admin: UserDto) => {
    const newStatus = !admin.isActive;
    const action = newStatus ? "kích hoạt" : "vô hiệu hóa";

    try {
      if (newStatus) {
        const response = await userService.updateUser(admin.userId, {
          isActive: true,
        });
        if (response.success) {
          toast.success(`Đã ${action} tài khoản thành công`);
          onRefresh();
        } else {
          toast.error(`Không thể ${action} tài khoản`, {
            description: response.message,
          });
        }
      } else {
        const response = await userService.deactivateUser(admin.userId);
        if (response.success) {
          toast.success(`Đã ${action} tài khoản thành công`);
          onRefresh();
        } else {
          toast.error(`Không thể ${action} tài khoản`, {
            description: response.message,
          });
        }
      }
    } catch (error: any) {
      console.error("Error toggling admin active:", error);
      toast.error(`Không thể ${action} tài khoản`, {
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-10"
          />
        </div>
        <Button className="h-10" onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Họ tên</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Vai trò</TableHead>
              <TableHead>Phòng khám</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="py-8 text-gray-500">Đang tải...</div>
                </TableCell>
              </TableRow>
            ) : admins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Shield className="mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm font-medium text-gray-900">
                      Không tìm thấy admin
                    </p>
                    <p className="text-sm text-gray-500">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              admins.map((admin) => (
                <TableRow key={admin.userId}>
                  <TableCell className="font-medium">{admin.fullName}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.phoneE164 || "-"}</TableCell>
                  <TableCell>{getRoleBadge(admin.role)}</TableCell>
                  <TableCell>{getTenantName(admin.tenantId)}</TableCell>
                  <TableCell>{getStatusBadge(admin.isActive)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditAdmin(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(admin)}
                      >
                        {admin.isActive ? (
                          <ShieldOff className="h-4 w-4 text-red-500" />
                        ) : (
                          <Shield className="h-4 w-4 text-green-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* Dialogs */}
      <EditAdminDialog
        admin={editAdmin}
        open={!!editAdmin}
        onOpenChange={(open) => !open && setEditAdmin(null)}
        onSuccess={() => {
          setEditAdmin(null);
          onRefresh();
        }}
        tenants={tenants}
      />
    </div>
  );
}

