import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/layout/AdminLayout";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import userService from "@/services/userService";
import doctorService from "@/services/doctorService";
import { toast } from "sonner";
import type { UserCreateDto, CreateDoctorDto } from "@/types";
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
import {
  useAppDispatch,
  useAccountData,
  useAccountLoading,
  useAccountSaving,
  useAccountFilters,
  useAccountAppliedFilters,
  isCacheValid,
} from "@/stores/hooks";
import {
  setLoading,
  setSaving,
  setAccountData,
  setFilters,
  setAppliedFilters,
  setPageNumber,
  setPageSize,
  clearAccountData,
} from "@/stores/accountSlice";

export default function Accounts() {
  const { currentUser } = useAuth();

  const dispatch = useAppDispatch();
  const {
    users,
    stats,
    pageNumber,
    pageSize,
    totalPages,
    totalCount,
    lastUpdated,
    cacheExpiration,
  } = useAccountData();
  const loading = useAccountLoading();
  const saving = useAccountSaving();
  const filters = useAccountFilters();
  const appliedFilters = useAccountAppliedFilters();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loadingDoctorDetails, setLoadingDoctorDetails] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState<any>(null);

  const loadUsers = useCallback(
    async (page: number = 1, customFilters?: typeof appliedFilters, customPageSize?: number) => {
      if (!currentUser?.tenantId) return;

      dispatch(setLoading(true));
      try {
        const filtersToUse = customFilters || appliedFilters;
        const pageSizeToUse = customPageSize !== undefined ? customPageSize : pageSize;

        const response = await userService.getUsers(
          parseInt(currentUser.tenantId),
          page,
          pageSizeToUse,
          filtersToUse.searchTerm || undefined
        );

        if (response.success && response.data) {
          let userData = response.data.data ?? [];
          
          if (filtersToUse.roleFilter !== 'all') {
            userData = userData.filter(u => u.role === filtersToUse.roleFilter);
          }
          
          if (filtersToUse.statusFilter !== 'all') {
            const isActive = filtersToUse.statusFilter === AccountStatus.ACTIVE;
            userData = userData.filter(u => u.isActive === isActive);
          }

          const total = response.data.totalCount ?? 0;
          const doctors = userData.filter((u) => u.role === UserRole.DOCTOR).length;
          const nurses = userData.filter((u) => u.role === UserRole.NURSE).length;

          dispatch(
            setAccountData({
              users: userData,
              stats: { total, doctors, nurses },
              totalPages: response.data.totalPages ?? 1,
            })
          );
          dispatch(setPageNumber(page));
        } else {
          dispatch(
            setAccountData({
              users: [],
              stats: { total: 0, doctors: 0, nurses: 0 },
              totalPages: 1,
            })
          );
        }
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Không thể tải danh sách tài khoản");
        dispatch(clearAccountData());
      } finally {
        dispatch(setLoading(false));
      }
    },
    [currentUser?.tenantId, appliedFilters, pageSize, dispatch]
  );

  useEffect(() => {
    // Check if we have valid cached data
    if (isCacheValid(lastUpdated, cacheExpiration)) {
      return;
    }

    // Load fresh data if cache is invalid or expired
    loadUsers(1);
  }, [lastUpdated, cacheExpiration, loadUsers]);

  const handleSearch = () => {
    const newFilters = {
      searchTerm: filters.searchTerm,
      roleFilter: filters.roleFilter,
      statusFilter: filters.statusFilter,
    };
    
    dispatch(setAppliedFilters(newFilters));
    dispatch(setPageNumber(1));
    loadUsers(1, newFilters);
  };

  const handleRowsPerPageChange = useCallback((newSize: number) => {
    dispatch(setPageSize(newSize));
    loadUsers(1, undefined, newSize);
  }, [dispatch, loadUsers]);

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

    dispatch(setSaving(true));
    try {
      const userData: UserCreateDto = {
        fullName: data.fullName,
        email: data.email,
        phoneE164: normalizePhoneNumber(data.phoneE164),
        password: data.password,
        role: UserRole.DOCTOR,
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
        loadUsers(1);
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
      dispatch(setSaving(false));
    }
  };

  const handleViewClick = async (user: any) => {
    setSelectedUser(user);
    setSelectedDoctorDetails(null);
    setViewDialogOpen(true);
    
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

  const handleEditClick = async (user: any) => {
    setSelectedUser(user);
    setSelectedDoctorDetails(null);
    
    if (user.role === UserRole.DOCTOR) {
      setLoadingDoctorDetails(true);
      try {
        const response = await userService.getUserWithDoctorInfo(user.userId);
        if (response.success && response.data) {
          setSelectedDoctorDetails(response.data);
          setEditDialogOpen(true);
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
      setEditDialogOpen(true);
    }
  };

  const handleEditSubmit = async (data: EditDoctorFormData) => {
    if (!selectedUser || !selectedDoctorDetails) return;

    dispatch(setSaving(true));
    try {
      const userUpdateResponse = await userService.updateUser(selectedUser.userId, {
        fullName: data.fullName,
        phoneE164: data.phoneE164,
      });

      if (!userUpdateResponse.success) {
        throw new Error(userUpdateResponse.message || "Không thể cập nhật thông tin người dùng");
      }

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
        loadUsers(1);
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
      dispatch(setSaving(false));
    }
  };

  const handleToggleActive = async (user: any) => {
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
          loadUsers(pageNumber);
        } else {
          toast.error(`Không thể ${action} tài khoản`, {
            description: response.message,
          });
        }
      } else {
        const response = await userService.deactivateUser(user.userId);
        if (response.success) {
          toast.success(`Đã ${action} tài khoản thành công`);
          loadUsers(pageNumber);
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
          searchTerm={filters.searchTerm}
          roleFilter={filters.roleFilter}
          statusFilter={filters.statusFilter}
          onSearchChange={(term) =>
            dispatch(setFilters({ searchTerm: term }))
          }
          onRoleFilterChange={(role) =>
            dispatch(setFilters({ roleFilter: role }))
          }
          onStatusFilterChange={(status) =>
            dispatch(setFilters({ statusFilter: status }))
          }
          onSearch={handleSearch}
        />

        <AccountTable
          users={users}
          loading={loading}
          currentPage={pageNumber}
          totalPages={totalPages}
          totalCount={totalCount}
          rowsPerPage={pageSize}
          onPageChange={(page) => {
            dispatch(setPageNumber(page));
            loadUsers(page);
          }}
          onAddClick={() => setDialogOpen(true)}
          onViewClick={handleViewClick}
          onEditClick={handleEditClick}
          onToggleActiveClick={handleToggleActive}
          onRowsPerPageChange={handleRowsPerPageChange}
        />

        <CreateDoctorDialog
          open={dialogOpen}
          creating={saving}
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
