import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Edit, Eye, Building2 } from "lucide-react";
import type { TenantDto } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import EditTenantDialog from "@/components/super-admin/EditTenantDialog";
import ViewTenantDialog from "@/components/super-admin/ViewTenantDialog";

interface TenantManagementTabProps {
  tenants: TenantDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  searchTerm: string;
  onPageChange: (page: number) => void;
  onSearchChange: (term: string) => void;
  onRefresh: () => void;
}

export default function TenantManagementTab({
  tenants,
  loading,
  currentPage,
  totalPages,
  searchTerm,
  onPageChange,
  onSearchChange,
  onRefresh,
}: TenantManagementTabProps) {
  const [tempSearch, setTempSearch] = useState(searchTerm);
  const [editTenant, setEditTenant] = useState<TenantDto | null>(null);
  const [viewTenant, setViewTenant] = useState<TenantDto | null>(null);

  const handleSearch = () => {
    onSearchChange(tempSearch);
    onPageChange(1);
  };

  const getStatusBadge = (status: number) => {
    if (status === 1) {
      return <Badge variant="success">Hoạt động</Badge>;
    }
    return <Badge variant="secondary">Không hoạt động</Badge>;
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên, mã, email, số điện thoại..."
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch}>Tìm kiếm</Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã</TableHead>
              <TableHead>Tên phòng khám</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
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
            ) : tenants.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  <div className="flex flex-col items-center justify-center py-12">
                    <Building2 className="mb-3 h-12 w-12 text-gray-300" />
                    <p className="text-sm font-medium text-gray-900">
                      Không tìm thấy phòng khám
                    </p>
                    <p className="text-sm text-gray-500">
                      Thử tìm kiếm với từ khóa khác
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              tenants.map((tenant) => (
                <TableRow key={tenant.tenantId}>
                  <TableCell className="font-medium">{tenant.code}</TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.email || "-"}</TableCell>
                  <TableCell>{tenant.phone || "-"}</TableCell>
                  <TableCell>{getStatusBadge(tenant.status || 0)}</TableCell>
                  <TableCell>
                    {tenant.createdAt
                      ? new Date(tenant.createdAt).toLocaleDateString("vi-VN")
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewTenant(tenant)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditTenant(tenant)}
                      >
                        <Edit className="h-4 w-4" />
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
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Trang {currentPage} / {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Trước
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <EditTenantDialog
        tenant={editTenant}
        open={!!editTenant}
        onOpenChange={(open: boolean) => !open && setEditTenant(null)}
        onSuccess={() => {
          setEditTenant(null);
          onRefresh();
        }}
      />

      <ViewTenantDialog
        tenant={viewTenant}
        open={!!viewTenant}
        onOpenChange={(open: boolean) => !open && setViewTenant(null)}
      />
    </div>
  );
}

