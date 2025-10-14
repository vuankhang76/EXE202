import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/Pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import {
  Loader2,
  Edit,
  Eye,
  UserCheck,
  UserX,
  Mail,
  Plus,
} from "lucide-react";
import type { UserDto } from '@/types';
import { getRoleLabel, getRoleBadgeVariant, getStatusBadgeClass } from '@/types/account';

interface AccountTableProps {
  users: UserDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddClick: () => void;
  onEditClick?: (user: UserDto) => void;
  onViewClick?: (user: UserDto) => void;
  onToggleActiveClick?: (user: UserDto) => void;
}

export default function AccountTable({
  users,
  loading,
  currentPage,
  totalPages,
  onPageChange,
  onEditClick,
  onViewClick,
  onToggleActiveClick
}: AccountTableProps) {
  const getRoleBadge = (role: string) => {
    return <Badge variant={getRoleBadgeVariant(role)}>{getRoleLabel(role)}</Badge>;
  };
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex justify-center mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>

            {startPage > 1 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(1)}
                    className="cursor-pointer"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                {startPage > 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
              </>
            )}

            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => onPageChange(page)}
                  isActive={currentPage === page}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < totalPages && (
              <>
                {endPage < totalPages - 1 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}
                <PaginationItem>
                  <PaginationLink
                    onClick={() => onPageChange(totalPages)}
                    className="cursor-pointer"
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}

            <PaginationItem>
              <PaginationNext
                onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
        <p className="text-muted-foreground mt-2">Đang tải...</p>
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Plus className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p>Chưa có tài khoản nào</p>
      </div>
    );
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

  return (
    <div>
      <div className="border rounded-md bg-white flex flex-col overflow-hidden">
        <div className="flex-1 overflow-auto min-h-[500px] custom-scrollbar-thin">
          <div className="w-full">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead>Họ tên</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Số điện thoại</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">{user.fullName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
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
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onViewClick?.(user)}
                          title="Xem chi tiết"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onEditClick?.(user)}
                          title="Chỉnh sửa"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => onToggleActiveClick?.(user)}
                          title={user.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                        >
                          {user.isActive ? (
                            <UserX className="h-4 w-4 text-orange-600" />
                          ) : (
                            <UserCheck className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      {renderPagination()}
    </div>
  );
}