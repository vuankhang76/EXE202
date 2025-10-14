import { useEffect, useState } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import userService from "@/services/userService";
import doctorService from "@/services/doctorService";
import { toast } from "sonner";
import type { UserDto, UserCreateDto, CreateDoctorDto, UserUpdateDto, DoctorAdminUpdateDto } from "@/types";
import { UserRole, AccountStatus } from "@/types/account";
import AccountStats from "@/components/accounts/AccountStats";
import AccountFilters from "@/components/accounts/AccountFilters";
import AccountTable from "@/components/accounts/AccountTable";
import CreateDoctorDialog, {
  type CreateDoctorFormData,
} from "@/components/accounts/CreateDoctorDialog";
import EditDoctorDialog, {
  type EditDoctorFormData,
} from "@/components/accounts/EditDoctorDialog";
import ViewDoctorDialog from "@/components/accounts/ViewDoctorDialog";

export default function Accounts() {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingDoctorDetails, setLoadingDoctorDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [tempSearchTerm, setTempSearchTerm] = useState("");
  const [tempRoleFilter, setTempRoleFilter] = useState("all");
  const [tempStatusFilter, setTempStatusFilter] = useState("all");
  const [stats, setStats] = useState({
    total: 0,
    doctors: 0,
    nurses: 0,
  });

  const loadUsers = async () => {
    if (!currentUser?.tenantId) return;

    setLoading(true);
    try {
      const response = await userService.getUsers(
        parseInt(currentUser.tenantId),
        pageNumber,
        10,
        searchTerm || undefined
      );

      if (response.success && response.data) {
        let userData = response.data.data || [];
        
        // Client-side filtering for role
        if (roleFilter !== 'all') {
          userData = userData.filter(u => u.role === roleFilter);
        }
        
        // Client-side filtering for status
        if (statusFilter !== 'all') {
          const isActive = statusFilter === AccountStatus.ACTIVE;
          userData = userData.filter(u => u.isActive === isActive);
        }
        
        setUsers(userData);
        setTotalPages(response.data.totalPages || 1);

        const total = response.data.totalCount || 0;
        const doctors = userData.filter((u) => u.role === UserRole.DOCTOR).length;
        const nurses = userData.filter((u) => u.role === UserRole.NURSE).length;

        setStats({ total, doctors, nurses });
      } else {
        setUsers([]);
        setTotalPages(1);
        setStats({ total: 0, doctors: 0, nurses: 0 });
      }
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Không thể tải danh sách tài khoản");
      setUsers([]);
      setTotalPages(1);
      setStats({ total: 0, doctors: 0, nurses: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchTerm(tempSearchTerm);
    setRoleFilter(tempRoleFilter);
    setStatusFilter(tempStatusFilter);
    setPageNumber(1);
  };

  useEffect(() => {
    if (currentUser?.tenantId) {
      loadUsers();
    }
  }, [currentUser?.tenantId, pageNumber, searchTerm, roleFilter, statusFilter]);

  const normalizePhoneNumber = (phone: string): string => {
    if (!phone) return phone;
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    if (cleaned.startsWith("0")) {
      return "+84" + cleaned.substring(1);
    }
    if (cleaned.startsWith("84") && !cleaned.startsWith("+84")) {
      return "+" + cleaned;
    }
    return cleaned;
  };

  const onSubmit = async (data: CreateDoctorFormData) => {
    if (!currentUser?.tenantId) {
      toast.error("Không tìm thấy thông tin phòng khám");
      return;
    }

    setCreating(true);
    try {
      const userData: UserCreateDto = {
        fullName: data.fullName,
        email: data.email,
        phoneE164: normalizePhoneNumber(data.phoneE164),
        password: data.password,
        role: UserRole.DOCTOR, // Doctor role
        tenantId: parseInt(currentUser.tenantId),
      };

      const userResponse = await userService.createUser(userData);

      if (!userResponse.success || !userResponse.data) {
        throw new Error(userResponse.message || "Không thể tạo tài khoản");
      }

      const doctorData: CreateDoctorDto = {
        specialty: data.specialty,
        licenseNumber: data.licenseNumber,
        title: data.title || undefined,
        positionTitle: data.positionTitle || undefined,
        yearStarted: data.yearStarted ? parseInt(data.yearStarted) : undefined,
        about: data.about || undefined,
      };

      const doctorResponse = await userService.createDoctorRecord(
        userResponse.data.userId,
        doctorData
      );

      if (doctorResponse.success) {
        toast.success("Tạo tài khoản bác sĩ thành công");
        setDialogOpen(false);
        loadUsers();
      } else {
        toast.error("Tạo hồ sơ bác sĩ thất bại", {
          description: doctorResponse.message,
        });
      }
    } catch (error: any) {
      console.error("Error creating doctor:", error);
      toast.error("Tạo tài khoản thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleViewClick = async (user: UserDto) => {
    setSelectedUser(user);
    setSelectedDoctorDetails(null); // Clear old data
    setViewDialogOpen(true); // Open dialog immediately
    
    if (user.role === UserRole.DOCTOR) {
      setLoadingDoctorDetails(true);
      try {
        const response = await userService.getUserWithDoctorInfo(user.userId);
        if (response.success && response.data) {
          setSelectedDoctorDetails(response.data);
        }
      } catch (error) {
        console.error("Error loading doctor details:", error);
        toast.error("Không thể tải thông tin bác sĩ");
      } finally {
        setLoadingDoctorDetails(false);
      }
    }
  };

  const handleEditClick = async (user: UserDto) => {
    setSelectedUser(user);
    setSelectedDoctorDetails(null); // Clear old data
    
    if (user.role === UserRole.DOCTOR) {
      setLoadingDoctorDetails(true);
      try {
        const response = await userService.getUserWithDoctorInfo(user.userId);
        if (response.success && response.data) {
          setSelectedDoctorDetails(response.data);
          setEditDialogOpen(true); // Only open after loading
        } else {
          toast.error("Không thể tải thông tin bác sĩ");
        }
      } catch (error) {
        console.error("Error loading doctor details:", error);
        toast.error("Không thể tải thông tin bác sĩ");
      } finally {
        setLoadingDoctorDetails(false);
      }
    } else {
      setEditDialogOpen(true); // Open immediately for non-doctor
    }
  };

  const handleEditSubmit = async (data: EditDoctorFormData) => {
    if (!selectedUser || !selectedDoctorDetails) return;

    setSaving(true);
    try {
      // Update user info
      const userUpdateResponse = await userService.updateUser(selectedUser.userId, {
        fullName: data.fullName,
        phoneE164: data.phoneE164,
      });

      if (!userUpdateResponse.success) {
        throw new Error(userUpdateResponse.message || "Không thể cập nhật thông tin người dùng");
      }

      // Update doctor info using admin API
      const doctorUpdateResponse = await doctorService.updateDoctorByAdmin(
        selectedDoctorDetails.doctorId,
        {
          fullName: data.fullName,
          phoneE164: data.phoneE164,
          specialty: data.specialty,
          licenseNumber: data.licenseNumber,
          title: data.title || undefined,
          positionTitle: data.positionTitle || undefined,
          yearStarted: data.yearStarted ? parseInt(data.yearStarted) : undefined,
          about: data.about || undefined,
        }
      );

      if (doctorUpdateResponse.success) {
        toast.success("Cập nhật thông tin bác sĩ thành công");
        setEditDialogOpen(false);
        loadUsers();
      } else {
        toast.error("Cập nhật thông tin bác sĩ thất bại", {
          description: doctorUpdateResponse.message,
        });
      }
    } catch (error: any) {
      console.error("Error updating doctor:", error);
      toast.error("Cập nhật thất bại", {
        description: error.message || "Có lỗi xảy ra",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (user: UserDto) => {
    const newStatus = !user.isActive;
    const action = newStatus ? 'kích hoạt' : 'vô hiệu hóa';
    
    try {
      if (newStatus) {
        const response = await userService.updateUser(user.userId, { 
          isActive: true,
          role: user.role,
        });
        if (response.success) {
          toast.success(`Đã ${action} tài khoản thành công`);
          loadUsers();
        } else {
          toast.error(`Không thể ${action} tài khoản`, {
            description: response.message,
          });
        }
      } else {
        const response = await userService.deactivateUser(user.userId);
        if (response.success) {
          toast.success(`Đã ${action} tài khoản thành công`);
          loadUsers();
        } else {
          toast.error(`Không thể ${action} tài khoản`, {
            description: response.message,
          });
        }
      }
    } catch (error: any) {
      console.error("Error toggling user active:", error);
      toast.error(`Không thể ${action} tài khoản`, {
        description: error.message || "Có lỗi xảy ra",
      });
    }
  };

  return (
    <AdminLayout
      breadcrumbTitle="Quản lý tài khoản"
      actions={
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm bác sĩ
        </Button>
      }
    >
      <div className="space-y-4">
        <AccountStats
          total={stats.total}
          doctors={stats.doctors}
          nurses={stats.nurses}
          loading={loading}
        />

        <AccountFilters
          searchTerm={tempSearchTerm}
          roleFilter={tempRoleFilter}
          statusFilter={tempStatusFilter}
          onSearchChange={setTempSearchTerm}
          onRoleFilterChange={setTempRoleFilter}
          onStatusFilterChange={setTempStatusFilter}
          onSearch={handleSearch}
        />

        <AccountTable
          users={users}
          loading={loading}
          currentPage={pageNumber}
          totalPages={totalPages}
          onPageChange={setPageNumber}
          onAddClick={() => setDialogOpen(true)}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onToggleActiveClick={handleToggleActive}
        />

        <CreateDoctorDialog
          open={dialogOpen}
          creating={creating}
          onOpenChange={setDialogOpen}
          onSubmit={onSubmit}
        />

        <EditDoctorDialog
          open={editDialogOpen}
          saving={saving}
          onOpenChange={setEditDialogOpen}
          onSubmit={handleEditSubmit}
          initialData={
            selectedUser && selectedDoctorDetails
              ? {
                  fullName: selectedUser.fullName,
                  email: selectedUser.email,
                  phoneE164: selectedUser.phoneE164,
                  specialty: selectedDoctorDetails.specialty || '',
                  licenseNumber: selectedDoctorDetails.licenseNumber || '',
                  title: selectedDoctorDetails.title || '',
                  positionTitle: selectedDoctorDetails.positionTitle || '',
                  yearStarted: selectedDoctorDetails.yearStarted?.toString() || '',
                  about: selectedDoctorDetails.about || '',
                }
              : null
          }
        />

        <ViewDoctorDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          doctor={selectedUser}
          doctorDetails={selectedDoctorDetails}
          loading={loadingDoctorDetails}
        />
      </div>
    </AdminLayout>
  );
}
