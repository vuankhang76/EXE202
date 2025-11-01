import { useEffect, useState } from "react";
import { Building2, Users, Stethoscope, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import tenantService from "@/services/tenantService";
import userService from "@/services/userService";
import patientService from "@/services/patientService";
import { toast } from "sonner";
import type { UserDto } from "@/types";
import { Card } from "@/components/ui/Card";
import AdminLayout from "@/layout/AdminLayout";

export default function SuperAdmin() {
  const { currentUser, logout } = useAuth();
  const [totalTenants, setTotalTenants] = useState(0);
  const [totalAdmins, setTotalAdmins] = useState(0);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role !== 'SystemAdmin') {
      toast.error('Bạn không có quyền truy cập trang này');
      logout();
    }
  }, [currentUser]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [tenantsResponse, usersResponse, patientsResponse] = await Promise.all([
        tenantService.getTenants(1, 1),
        userService.getUsers(undefined, 1, 100),
        patientService.getPatients(1, 1)
      ]);

      if (tenantsResponse.success && tenantsResponse.data) {
        setTotalTenants(tenantsResponse.data.totalCount || 0);
      }

      if (usersResponse.success && usersResponse.data) {
        const allUsers = usersResponse.data.data || [];
        const adminCount = allUsers.filter(
          (u: UserDto) => u.role === 'ClinicAdmin' || u.role === 'SystemAdmin'
        ).length;
        const doctorCount = allUsers.filter(
          (u: UserDto) => u.role === 'Doctor'
        ).length;
        setTotalAdmins(adminCount);
        setTotalDoctors(doctorCount);
      }

      if (patientsResponse.success && patientsResponse.data) {
        setTotalPatients(patientsResponse.data.totalCount || 0);
      }
    } catch (error) {
      console.error("Error loading stats:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'SystemAdmin') {
      loadStats();
    }
  }, [currentUser]);

  if (currentUser?.role !== 'SystemAdmin') {
    return null;
  }

  return (
    <AdminLayout 
      breadcrumbTitle="Super Admin Dashboard"
      breadcrumbItems={[]}
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số phòng khám
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : totalTenants}
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
                {loading ? "..." : totalAdmins}
              </p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số Bác sĩ
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : totalDoctors}
              </p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <Stethoscope className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Tổng số Bệnh nhân
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : totalPatients}
              </p>
            </div>
            <div className="rounded-full bg-orange-100 p-3">
              <UserCircle className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

