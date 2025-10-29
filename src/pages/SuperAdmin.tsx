import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Plus, Building2, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from "@/services/tenantService";
import userService from "@/services/userService";
import { toast } from "sonner";
import type { TenantDto, UserDto } from "@/types";
import { Card } from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import AdminLayout from "@/layout/AdminLayout";
import TenantManagementTab from "@/components/super-admin/TenantManagementTab";
import AdminManagementTab from "@/components/super-admin/AdminManagementTab";
import CreateTenantDialog from "@/components/super-admin/CreateTenantDialog";
import CreateAdminDialog from "@/components/super-admin/CreateAdminDialog";

export default function SuperAdmin() {
  const { currentUser, logout } = useAuth();
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [admins, setAdmins] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [createTenantOpen, setCreateTenantOpen] = useState(false);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("tenants");
  
  const [tenantPage, setTenantPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [tenantTotalPages, setTenantTotalPages] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [tenantTotalCount, setTenantTotalCount] = useState(0);
  const [adminTotalCount, setAdminTotalCount] = useState(0);
  const [tenantRowsPerPage, setTenantRowsPerPage] = useState(10);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);
  
  const [tenantSearch, setTenantSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

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
      console.error("Error loading tenants:", error);
      toast.error("Không thể tải danh sách phòng khám");
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadTenants();
    }
  }, [currentUser, tenantPage, tenantSearch, tenantRowsPerPage]);

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadAdmins();
    }
  }, [currentUser, adminPage, adminSearch, adminRowsPerPage]);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Super Admin Dashboard"
      breadcrumbItems={[]}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số phòng khám
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : tenants.length}
              </p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số Admin
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loadingAdmins ? "..." : admins.length}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tenants">
              <Building2 className="mr-2 h-4 w-4" />
              Phòng khám
            </TabsTrigger>
            <TabsTrigger value="admins">
              <Users className="mr-2 h-4 w-4" />
              Tài khoản Admin
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {activeTab === "tenants" && (
          <Button onClick={() => setCreateTenantOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo phòng khám mới
          </Button>
        )}
        {activeTab === "admins" && (
          <Button onClick={() => setCreateAdminOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo tài khoản Admin
          </Button>
        )}
      </div>

      <div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="tenants">
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
          </TabsContent>

          <TabsContent value="admins" className="">
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
          </TabsContent>
        </Tabs>
      </div>

      <CreateTenantDialog
        open={createTenantOpen}
        onOpenChange={setCreateTenantOpen}
        onSuccess={loadTenants}
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

