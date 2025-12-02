import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from "@/services/tenantService";
import userService from "@/services/userService";
import patientService from "@/services/patientService";
import { toast } from "sonner";
import type { TenantDto, UserDto, PatientDto } from "@/types";
import AdminLayout from "@/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import AdminManagementTab from "@/components/super-admin/AdminManagement";
import CreateAdminDialog from "@/components/super-admin/CreateAdminDialog";
import PatientStats from "@/components/super-admin/PatientStats";
import PatientFilters from "@/components/super-admin/PatientFilters";
import PatientTable from "@/components/super-admin/PatientTable";
import ViewPatientDialog from "@/components/super-admin/ViewPatientDialog";

export default function AdminManagement() {
  const { currentUser, logout } = useAuth();
  
  // Tab state
  const [activeTab, setActiveTab] = useState("admins");
  
  // Admin state
  const [admins, setAdmins] = useState<UserDto[]>([]);
  const [tenants, setTenants] = useState<TenantDto[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [createAdminOpen, setCreateAdminOpen] = useState(false);
  
  const [adminPage, setAdminPage] = useState(1);
  const [adminTotalPages, setAdminTotalPages] = useState(1);
  const [adminTotalCount, setAdminTotalCount] = useState(0);
  const [adminRowsPerPage, setAdminRowsPerPage] = useState(10);
  const [adminSearch, setAdminSearch] = useState("");

  // Patient accounts state
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [patientStats, setPatientStats] = useState({ total: 0 });
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientPageNumber, setPatientPageNumber] = useState(1);
  const [patientPageSize, setPatientPageSize] = useState(10);
  const [patientTotalPages, setPatientTotalPages] = useState(1);
  const [patientTotalCount, setPatientTotalCount] = useState(0);
  const [patientSearchTerm, setPatientSearchTerm] = useState("");
  const [patientAppliedSearchTerm, setPatientAppliedSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<PatientDto | null>(null);
  const [viewPatientDialogOpen, setViewPatientDialogOpen] = useState(false);

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
    }
  };

  const loadPatientAccounts = useCallback(
    async (page: number = 1, customSearchTerm?: string, customPageSize?: number) => {
      setPatientLoading(true);
      try {
        const searchTerm = customSearchTerm !== undefined ? customSearchTerm : patientAppliedSearchTerm;
        const pageSizeToUse = customPageSize !== undefined ? customPageSize : patientPageSize;

        const response = await patientService.getPatients(
          page,
          pageSizeToUse,
          searchTerm || undefined
        );

        if (response.success && response.data) {
          const patientData = response.data.data ?? [];
          const total = response.data.totalCount ?? 0;

          setPatients(patientData);
          setPatientStats({ total });
          setPatientTotalPages(response.data.totalPages ?? 1);
          setPatientTotalCount(total);
          setPatientPageNumber(page);
        } else {
          setPatients([]);
          setPatientStats({ total: 0 });
          setPatientTotalPages(1);
          setPatientTotalCount(0);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách bệnh nhân");
        setPatients([]);
        setPatientStats({ total: 0 });
      } finally {
        setPatientLoading(false);
      }
    },
    [patientAppliedSearchTerm, patientPageSize]
  );

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      if (activeTab === 'admins') {
        loadAdmins();
        loadTenants();
      } else if (activeTab === 'patients') {
        loadPatientAccounts(1);
      }
    }
  }, [currentUser, activeTab, adminPage, adminSearch, adminRowsPerPage]);

  const handlePatientSearch = () => {
    setPatientAppliedSearchTerm(patientSearchTerm);
    loadPatientAccounts(1, patientSearchTerm);
  };

  const handlePatientRowsPerPageChange = useCallback((newSize: number) => {
    setPatientPageSize(newSize);
    loadPatientAccounts(1, undefined, newSize);
  }, [loadPatientAccounts]);

  const handleViewPatient = (patient: PatientDto) => {
    setSelectedPatient(patient);
    setViewPatientDialogOpen(true);
  };

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Quản lý người dùng"
      breadcrumbItems={[]}
      actions={
        activeTab === "admins" ? (
          <Button onClick={() => setCreateAdminOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo tài khoản Admin
          </Button>
        ) : null
      }
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="admins">Quản lý Admin</TabsTrigger>
          <TabsTrigger value="patients">Bệnh nhân</TabsTrigger>
        </TabsList>

        <TabsContent value="admins" className="space-y-4">
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

        <TabsContent value="patients" className="space-y-4">
          <PatientStats
            total={patientStats.total}
            loading={patientLoading}
          />

          <PatientFilters
            searchTerm={patientSearchTerm}
            onSearchChange={setPatientSearchTerm}
            onSearch={handlePatientSearch}
          />

          <PatientTable
            patients={patients}
            loading={patientLoading}
            currentPage={patientPageNumber}
            totalPages={patientTotalPages}
            totalCount={patientTotalCount}
            rowsPerPage={patientPageSize}
            onPageChange={(page: number) => loadPatientAccounts(page)}
            onViewClick={handleViewPatient}
            onRowsPerPageChange={handlePatientRowsPerPageChange}
          />
        </TabsContent>
      </Tabs>

      <CreateAdminDialog
        open={createAdminOpen}
        onOpenChange={setCreateAdminOpen}
        onSuccess={loadAdmins}
        tenants={tenants}
      />

      <ViewPatientDialog
        open={viewPatientDialogOpen}
        onOpenChange={setViewPatientDialogOpen}
        patient={selectedPatient}
      />
    </AdminLayout>
  );
}
