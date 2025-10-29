import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from "@/services/tenantService";
import userService from "@/services/userService";
import { toast } from "sonner";
import type { TenantDto, UserDto } from "@/types";
import AdminLayout from "@/layout/AdminLayout";
import AdminManagementTab from "@/components/super-admin/AdminManagement";
import CreateAdminDialog from "@/components/super-admin/CreateAdminDialog";

export default function AdminManagement() {
  const { currentUser, logout } = useAuth();
  const [admins, setAdmins] = useState<UserDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminTotalCount, setAdminTotalCount] = useState(0);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);
  const [adminSearch, setAdminSearch] = useState("");

  useEffect(() => {
    if (currentUser?.role !== 'SystemAdmin') {
      toast.error('Bạn không có quyền truy cập trang này');
      logout();
    }
  }, [currentUser]);

  const loadAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const response = await userService.getUsers(
        undefined,
        adminPage,
        adminRowsPerPage,
        adminSearch || undefined
      );

      if (response.success && response.data) {
        const adminUsers = (response.data.data || []).filter(
          (u: UserDto) => u.role === 'ClinicAdmin' || u.role === 'SystemAdmin'
        );
        setAdmins(adminUsers);
        setAdminTotalPages(response.data.totalPages || 1);
        setAdminTotalCount(response.data.totalCount || 0);
      } else {
        setAdmins([]);
        setAdminTotalPages(1);
        setAdminTotalCount(0);
      }
    } catch (error) {
      console.error("Error loading admins:", error);
      toast.error("Không thể tải danh sách admin");
      setAdmins([]);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const loadTenants = async () => {
    try {
      const response = await tenantService.getTenants(1, 1000);
      if (response.success && response.data) {
        setTenants(response.data.data || []);
      }
    } catch (error) {
      console.error("Error loading tenants:", error);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadAdmins();
      loadTenants();
    }
  }, [currentUser, adminPage, adminSearch, adminRowsPerPage]);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Quản lý Admin"
      breadcrumbItems={[]}
      actions={
        <Button onClick={() => setCreateAdminOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo tài khoản Admin
        </Button>
      }
    >
      <AdminManagementTab
        admins={admins}
        loading={loadingAdmins}
        currentPage={adminPage}
        totalPages={adminTotalPages}
        searchTerm={adminSearch}
        onPageChange={setAdminPage}
        onSearchChange={setAdminSearch}
        onRefresh={loadAdmins}
        tenants={tenants}
        totalCount={adminTotalCount}
        rowsPerPage={adminRowsPerPage}
        onRowsPerPageChange={setAdminRowsPerPage}
      />

      <CreateAdminDialog
        open={createAdminOpen}
        onOpenChange={setCreateAdminOpen}
        onSuccess={loadAdmins}
        tenants={tenants}
      />
    </AdminLayout>
  );
}
