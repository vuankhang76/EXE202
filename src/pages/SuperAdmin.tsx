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
  
  // Pagination
  const [tenantPage, setTenantPage] = useState(1);
  const [adminPage, setAdminPage] = useState(1);
  const [tenantTotalPages, setTenantTotalPages] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  
  // Search
  const [tenantSearch, setTenantSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  // Check if user is SystemAdmin
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
        10,
        tenantSearch || undefined
      );

      if (response.success && response.data) {
        setTenants(response.data.data || []);
        setTenantTotalPages(response.data.totalPages || 1);
      } else {
        setTenants([]);
        setTenantTotalPages(1);
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
        undefined, // No tenant filter - get all users
        adminPage,
        10,
        adminSearch || undefined
      );

      if (response.success && response.data) {
        // Filter only admin roles
        const adminUsers = (response.data.data || []).filter(
          (u: UserDto) => u.role === 'ClinicAdmin' || u.role === 'SystemAdmin'
        );
        setAdmins(adminUsers);
        setAdminTotalPages(response.data.totalPages || 1);
      } else {
        setAdmins([]);
        setAdminTotalPages(1);
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
  }, [currentUser, tenantPage, tenantSearch]);

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadAdmins();
    }
  }, [currentUser, adminPage, adminSearch]);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Super Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Quản lý toàn bộ hệ thống phòng khám và tài khoản
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {currentUser?.fullName}
                </p>
                <p className="text-xs text-gray-500">System Administrator</p>
              </div>
              <Button variant="outline" onClick={logout}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
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

        {/* Tabs */}
        <Card>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="border-b px-6 pt-6">
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
            </div>

            <TabsContent value="tenants" className="p-6">
              <div className="mb-4 flex justify-end">
                <Button onClick={() => setCreateTenantOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo phòng khám mới
                </Button>
              </div>
              <TenantManagementTab
                tenants={tenants}
                loading={loading}
                currentPage={tenantPage}
                totalPages={tenantTotalPages}
                searchTerm={tenantSearch}
                onPageChange={setTenantPage}
                onSearchChange={setTenantSearch}
                onRefresh={loadTenants}
              />
            </TabsContent>

            <TabsContent value="admins" className="p-6">
              <div className="mb-4 flex justify-end">
                <Button onClick={() => setCreateAdminOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Tạo tài khoản Admin
                </Button>
              </div>
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
              />
            </TabsContent>
          </Tabs>
        </Card>

        {/* Dialogs */}
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
      </div>
    </div>
  );
}

