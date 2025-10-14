import { Input } from "@/components/ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Search } from "lucide-react";
import { Button } from "../ui/Button";
import { UserRole, AccountStatus, getRoleLabel, getStatusLabel } from "@/types/account";

interface AccountFiltersProps {
  searchTerm: string;
  roleFilter: string;
  statusFilter: string;
  onSearchChange: (value: string) => void;
  onRoleFilterChange: (value: string) => void;
  onStatusFilterChange: (value: string) => void;
  onSearch: () => void;
}

export default function AccountFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  onSearchChange,
  onRoleFilterChange,
  onStatusFilterChange,
  onSearch
}: AccountFiltersProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3 items-center">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên, email, số điện thoại..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 h-10"
          />
        </div>
      </div>

      <div className="shrink-0">
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="h-10 truncate w-[140px]">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value={UserRole.TENANT}>{getRoleLabel(UserRole.TENANT)}</SelectItem>
            <SelectItem value={UserRole.NURSE}>{getRoleLabel(UserRole.NURSE)}</SelectItem>
            <SelectItem value={UserRole.RECEPTIONIST}>{getRoleLabel(UserRole.RECEPTIONIST)}</SelectItem>
            <SelectItem value={UserRole.CLINIC_ADMIN}>{getRoleLabel(UserRole.CLINIC_ADMIN)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="shrink-0">
        <Select value={statusFilter} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="h-10 truncate w-[180px]">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả trạng thái</SelectItem>
            <SelectItem value={AccountStatus.ACTIVE}>{getStatusLabel(AccountStatus.ACTIVE)}</SelectItem>
            <SelectItem value={AccountStatus.INACTIVE}>{getStatusLabel(AccountStatus.INACTIVE)}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onSearch} className="h-10 shrink-0">
        <Search className="h-4 w-4 mr-2" />
        Tìm kiếm
      </Button>
    </div>
  );
}
