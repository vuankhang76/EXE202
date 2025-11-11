import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from "@/services/tenantService";
import { toast } from "sonner";
import type { TenantDto } from "@/types";
import AdminLayout from "@/layout/AdminLayout";
import TenantManagementTab from "@/components/super-admin/TenantManagement";
import CreateTenantDialog from "@/components/super-admin/CreateTenantDialog";

export default function TenantManagement() {
  const { currentUser, logout } = useAuth();
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  
  const [tenantPage, setTenantPage] = useState(1);
  const [tenantTotalPages, setTenantTotalPages] = useState(1);
  const [tenantTotalCount, setTenantTotalCount] = useState(0);
  const [tenantRowsPerPage, setTenantRowsPerPage] = useState(10);
  const [tenantSearch, setTenantSearch] = useState("");

  useEffect(() => {
    if (currentUser?.role !== 'SystemAdmin') {
      toast.error('Bạn không có quyền truy cập trang này');
      logout();
    }
  }, [currentUser]);

  const loadTenants = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getTenants(
        tenantPage,
        tenantRowsPerPage,
        tenantSearch || undefined
      );

      if (response.success && response.data) {
        setTenants(response.data.data || []);
        setTenantTotalPages(response.data.totalPages || 1);
        setTenantTotalCount(response.data.totalCount || 0);
      } else {
        setTenants([]);
        setTenantTotalPages(1);
        setTenantTotalCount(0);
      }
    } catch (error) {
      toast.error("Không thể tải danh sách phòng khám");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadTenants();
    }
  }, [currentUser, tenantPage, tenantSearch, tenantRowsPerPage]);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Quản lý phòng khám"
      breadcrumbItems={[]}
      actions={
        <Button onClick={() => setCreateTenantOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phòng khám mới
        </Button>
      }
    >
      <TenantManagementTab
        tenants={tenants}
        loading={loading}
        currentPage={tenantPage}
        totalPages={tenantTotalPages}
        searchTerm={tenantSearch}
        onPageChange={setTenantPage}
        onSearchChange={setTenantSearch}
        onRefresh={loadTenants}
        totalCount={tenantTotalCount}
        rowsPerPage={tenantRowsPerPage}
        onRowsPerPageChange={setTenantRowsPerPage}
      />

      <CreateTenantDialog
        open={createTenantOpen}
        onOpenChange={setCreateTenantOpen}
        onSuccess={loadTenants}
      />
    </AdminLayout>
  );
}
