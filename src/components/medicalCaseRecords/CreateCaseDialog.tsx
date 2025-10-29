import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import { medicalCaseRecordService } from "@/services/medicalCaseRecordService";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import patientService from "@/services/patientService";
import doctorService from "@/services/doctorService";
import appointmentService from "@/services/appointmentService";
import type { PatientDto } from "@/types";

interface CreateCaseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateCaseDialog({
  isOpen,
  onClose,
  onSuccess,
}: CreateCaseDialogProps) {
  const { currentUser } = useAuth();
  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : 0;

  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<PatientDto[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    patientId: "",
    doctorId: "",
    appointmentId: "",
    diagnosis: "",
    chiefComplaint: "",
    medicalHistory: "",
    physicalExam: "",
    labResults: "",
    treatmentPlan: "",
    progressNotes: "",
    dischargeSummary: "",
    status: "Ongoing",
  });

  const handleOpenDialog = async () => {
    try {
      // Load patients, doctors, appointments
      const [patientsRes, doctorsRes, appointmentsRes] = await Promise.all([
        patientService.getPatients(1, 100),
        doctorService.getAllDoctors(1, 100),
        appointmentService.getAppointments({ tenantId, pageNumber: 1, pageSize: 100 }),
      ]);

      if (patientsRes.success && patientsRes.data) {
        setPatients(patientsRes.data.data || []);
      }
      if (doctorsRes.success && doctorsRes.data) {
        setDoctors(doctorsRes.data.data || []);
      }
      if (appointmentsRes.success && appointmentsRes.data) {
        setAppointments(appointmentsRes.data.data || []);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.patientId || !formData.diagnosis) {
      toast.error("Vui lòng điền đầy đủ các trường bắt buộc");
      return;
    }

    try {
      setLoading(true);
      const result = await medicalCaseRecordService.createMedicalCaseRecord({
        tenantId,
        patientId: parseInt(formData.patientId),
        doctorId: formData.doctorId ? parseInt(formData.doctorId) : undefined,
        appointmentId: formData.appointmentId
          ? parseInt(formData.appointmentId)
          : undefined,
        diagnosis: formData.diagnosis,
        chiefComplaint: formData.chiefComplaint,
        medicalHistory: formData.medicalHistory,
        physicalExam: formData.physicalExam,
        labResults: formData.labResults,
        treatmentPlan: formData.treatmentPlan,
        progressNotes: formData.progressNotes,
        dischargeSummary: formData.dischargeSummary,
        status: formData.status,
      });

      if (result.success) {
        toast.success("Đã tạo ca bệnh mới");
        setFormData({
          patientId: "",
          doctorId: "",
          appointmentId: "",
          diagnosis: "",
          chiefComplaint: "",
          medicalHistory: "",
          physicalExam: "",
          labResults: "",
          treatmentPlan: "",
          progressNotes: "",
          dischargeSummary: "",
          status: "Ongoing",
        });
        onClose();
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error creating case:", error);
      toast.error("Có lỗi xảy ra khi tạo ca bệnh");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm ca bệnh mới</DialogTitle>
          <DialogDescription>
            Nhập thông tin ca bệnh cần tạo
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient Selection */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Bệnh nhân <span className="text-red-500">*</span>
            </label>
            <Select
              value={formData.patientId}
              onValueChange={(value) =>
                setFormData({ ...formData, patientId: value })
              }
            >
              <SelectTrigger 
                className="mt-1 w-full"
                onClick={handleOpenDialog}
              >
                <SelectValue placeholder="-- Chọn bệnh nhân --" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.patientId} value={patient.patientId.toString()}>
                    {patient.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor Selection */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Bác sĩ phụ trách
            </label>
            <Select
              value={formData.doctorId}
              onValueChange={(value) =>
                setFormData({ ...formData, doctorId: value })
              }
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="-- Chọn bác sĩ --" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.doctorId} value={doctor.doctorId.toString()}>
                    {doctor.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Appointment Selection */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Lịch hẹn liên quan
            </label>
            <Select
              value={formData.appointmentId}
              onValueChange={(value) =>
                setFormData({ ...formData, appointmentId: value })
              }
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue placeholder="-- Chọn lịch hẹn --" />
              </SelectTrigger>
              <SelectContent>
                {appointments.map((appointment) => (
                  <SelectItem
                    key={appointment.appointmentId}
                    value={appointment.appointmentId.toString()}
                  >
                    {appointment.appointmentId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Selection */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Trạng thái
            </label>
            <Select
              value={formData.status}
              onValueChange={(value) =>
                setFormData({ ...formData, status: value })
              }
            >
              <SelectTrigger className="mt-1 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Ongoing">Đang điều trị</SelectItem>
                <SelectItem value="Completed">Đã hoàn thành</SelectItem>
                <SelectItem value="Draft">Bản nháp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chief Complaint */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Triệu chứng chính
            </label>
            <Textarea
              value={formData.chiefComplaint}
              onChange={(e) =>
                setFormData({ ...formData, chiefComplaint: e.target.value })
              }
              placeholder="Nhập triệu chứng chính..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Diagnosis */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Chẩn đoán <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={formData.diagnosis}
              onChange={(e) =>
                setFormData({ ...formData, diagnosis: e.target.value })
              }
              placeholder="Nhập chẩn đoán..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tiền sử bệnh
            </label>
            <Textarea
              value={formData.medicalHistory}
              onChange={(e) =>
                setFormData({ ...formData, medicalHistory: e.target.value })
              }
              placeholder="Nhập tiền sử bệnh..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Physical Exam */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Khám sức khỏe
            </label>
            <Textarea
              value={formData.physicalExam}
              onChange={(e) =>
                setFormData({ ...formData, physicalExam: e.target.value })
              }
              placeholder="Nhập kết quả khám sức khỏe..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Lab Results */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kết quả xét nghiệm
            </label>
            <Textarea
              value={formData.labResults}
              onChange={(e) =>
                setFormData({ ...formData, labResults: e.target.value })
              }
              placeholder="Nhập kết quả xét nghiệm..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Treatment Plan */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kế hoạch điều trị
            </label>
            <Textarea
              value={formData.treatmentPlan}
              onChange={(e) =>
                setFormData({ ...formData, treatmentPlan: e.target.value })
              }
              placeholder="Nhập kế hoạch điều trị..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Progress Notes */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Ghi chú tiến triển
            </label>
            <Textarea
              value={formData.progressNotes}
              onChange={(e) =>
                setFormData({ ...formData, progressNotes: e.target.value })
              }
              placeholder="Nhập ghi chú tiến triển..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Discharge Summary */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Tóm tắt xuất viện
            </label>
            <Textarea
              value={formData.dischargeSummary}
              onChange={(e) =>
                setFormData({ ...formData, dischargeSummary: e.target.value })
              }
              placeholder="Nhập tóm tắt xuất viện..."
              rows={2}
              className="mt-1"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              className="bg-red-500 hover:bg-red-600"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Đang tạo..." : "Tạo ca bệnh"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
