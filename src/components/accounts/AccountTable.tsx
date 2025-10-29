import { Badge } from "@/components/ui/Badge";
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
  Edit,
  Eye,
  UserCheck,
  UserX,
  Plus,
} from "lucide-react";
import type { UserDto } from '@/types';
import { getRoleLabel, getRoleBadgeVariant, getStatusBadgeClass } from '@/types/account';
import { TableSkeleton } from "@/components/ui/TableSkeleton";
import TablePagination from "@/components/ui/TablePagination";

interface AccountTableProps {
  users: UserDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  onAddClick: () => void;
  onEditClick?: (user: UserDto) => void;
  onViewClick?: (user: UserDto) => void;
  onToggleActiveClick?: (user: UserDto) => void;
}

const formatPhone = (phone?: string) => {
  if (!phone) return "N/A";

  const digits = phone.replace(/\D/g, "");

  if (/^0\d{9}$/.test(digits)) {
    return digits.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  if (/^84\d{9}$/.test(digits)) {
    const local = "0" + digits.slice(2);
    return local.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
  }

  return phone;
};

const getRoleBadge = (role: string) => {
  return <Badge variant={getRoleBadgeVariant(role)}>{getRoleLabel(role)}</Badge>;
};

const renderActionButtons = (
  user: UserDto,
  onViewClick?: (user: UserDto) => void,
  onEditClick?: (user: UserDto) => void,
  onToggleActiveClick?: (user: UserDto) => void
) => {
  return (
    <div className="flex justify-end gap-2">
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onViewClick?.(user)}
        className="h-8 w-8 p-0"
        title="Xem chi tiết"
      >
        <Eye className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onEditClick?.(user)}
        className="h-8 w-8 p-0"
        title="Chỉnh sửa"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        onClick={() => onToggleActiveClick?.(user)}
        className="h-8 w-8 p-0"
        title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
      >
        {user.isActive ? (
          <UserX className="h-4 w-4 text-orange-600" />
        ) : (
          <UserCheck className="h-4 w-4 text-green-600" />
        )}
      </Button>
    </div>
  );
};

export default function AccountTable({
  users,
  loading,
  currentPage,
  totalPages,
  totalCount,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEditClick,
  onViewClick,
  onToggleActiveClick,
}: AccountTableProps) {
  const safeUsers = users || [];

  if (loading) {
    return (
      <div>
        <TableSkeleton rows={10} columns={6} />
      </div>
    );
  }

  if (safeUsers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>Chưa có tài khoản nào</p>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-md bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto custom-scrollbar-thin">
          <div className="w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="min-w-[120px]">Họ tên</TableHead>
                  <TableHead className="min-w-[150px]">Email</TableHead>
                  <TableHead className="min-w-[120px]">Số điện thoại</TableHead>
                  <TableHead className="min-w-[100px]">Vai trò</TableHead>
                  <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                  <TableHead className="min-w-[120px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {safeUsers.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {formatPhone(user.phoneE164) || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusBadgeClass(user.isActive)}>
                        {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {renderActionButtons(user, onViewClick, onEditClick, onToggleActiveClick)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      <TablePagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        totalCount={totalCount}
        rowsPerPage={rowsPerPage}
        onPageChange={onPageChange} 
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </>
  );
}