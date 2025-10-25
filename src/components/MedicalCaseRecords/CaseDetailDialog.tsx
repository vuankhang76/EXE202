import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Plus, Trash2, Download } from "lucide-react";
import { medicalCaseRecordService } from "@/services/medicalCaseRecordService";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type {
  MedicalCaseRecordDto,
  MedicalCaseNoteDto,
  MedicalRecordFileDto,
} from "@/types/medicalCaseRecord";

interface CaseDetailDialogProps {
  isOpen: boolean;
  caseId: number | null;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function CaseDetailDialog({
  isOpen,
  caseId,
  onClose,
  onRefresh,
}: CaseDetailDialogProps) {
  const [caseRecord, setCaseRecord] = useState<MedicalCaseRecordDto | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<MedicalCaseNoteDto[]>([]);
  const [newNote, setNewNote] = useState("");
  const [noteType, setNoteType] = useState("General");

  // Files state
  const [files, setFiles] = useState<MedicalRecordFileDto[]>([]);

  // Form state for editing
  const [formData, setFormData] = useState({
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

  useEffect(() => {
    if (isOpen && caseId) {
      loadCaseDetail();
    }
  }, [isOpen, caseId]);

  const loadCaseDetail = async () => {
    try {
      setLoading(true);
      if (!caseId) return;

      const response = await medicalCaseRecordService.getMedicalCaseRecordById(
        caseId
      );
      if (response.success && response.data) {
        setCaseRecord(response.data);
        setNotes(response.data.notes || []);
        setFiles(response.data.files || []);

        setFormData({
          diagnosis: response.data.diagnosis || "",
          chiefComplaint: response.data.chiefComplaint || "",
          medicalHistory: response.data.medicalHistory || "",
          physicalExam: response.data.physicalExam || "",
          labResults: response.data.labResults || "",
          treatmentPlan: response.data.treatmentPlan || "",
          progressNotes: response.data.progressNotes || "",
          dischargeSummary: response.data.dischargeSummary || "",
          status: response.data.status || "Ongoing",
        });
      }
    } catch (error) {
      console.error("Error loading case detail:", error);
      toast.error("Có lỗi xảy ra khi tải chi tiết");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !caseId) {
      toast.error("Vui lòng nhập nội dung ghi chú");
      return;
    }

    try {
      const result = await medicalCaseRecordService.addNote(caseId, {
        noteType,
        noteContent: newNote,
      });

      if (result.success) {
        toast.success("Đã thêm ghi chú");
        setNewNote("");
        setNoteType("General");
        await loadCaseDetail();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm ghi chú");
    }
  };

  const handleDeleteFile = async (fileId: number) => {
    try {
      const result = await medicalCaseRecordService.deleteFile(
        fileId
      );
      if (result.success) {
        toast.success("Đã xóa file");
        setFiles(files.filter((f) => f.fileId !== fileId));
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa file");
    }
  };

  const handleUpdateCase = async () => {
    if (!caseId) return;

    try {
      const result = await medicalCaseRecordService.updateMedicalCaseRecord(
        caseId,
        formData
      );

      if (result.success) {
        toast.success("Đã cập nhật ca bệnh");
        setIsEditing(false);
        await loadCaseDetail();
        onRefresh?.();
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật");
    }
  };

  if (!isOpen || !caseRecord) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chi tiết ca bệnh #{caseRecord.caseId}</DialogTitle>
          <DialogDescription>
            Bệnh nhân: {caseRecord.patientName} | Bác sĩ:{" "}
            {caseRecord.doctorName || "-"}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin">⏳</div>
          </div>
        ) : (
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="info">Thông tin</TabsTrigger>
              <TabsTrigger value="notes">Ghi chú ({notes.length})</TabsTrigger>
              <TabsTrigger value="files">File ({files.length})</TabsTrigger>
              <TabsTrigger value="history">Lịch sử</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Trạng thái
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="Ongoing">Đang điều trị</option>
                      <option value="Completed">Đã hoàn thành</option>
                    </select>
                  ) : (
                    <p className="mt-1 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          caseRecord.status === "Ongoing"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {caseRecord.status === "Ongoing"
                          ? "Đang điều trị"
                          : "Đã hoàn thành"}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Ngày tạo
                  </label>
                  <p className="mt-1 text-sm">
                    {format(new Date(caseRecord.createdAt), "dd/MM/yyyy HH:mm", {
                      locale: vi,
                    })}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Chẩn đoán
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.diagnosis}
                    onChange={(e) =>
                      setFormData({ ...formData, diagnosis: e.target.value })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">{caseRecord.diagnosis || "-"}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Triệu chứng chính
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.chiefComplaint}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        chiefComplaint: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.chiefComplaint || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tiền sử bệnh
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.medicalHistory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        medicalHistory: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.medicalHistory || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Khám sức khỏe
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.physicalExam}
                    onChange={(e) =>
                      setFormData({ ...formData, physicalExam: e.target.value })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.physicalExam || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Kết quả xét nghiệm
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.labResults}
                    onChange={(e) =>
                      setFormData({ ...formData, labResults: e.target.value })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">{caseRecord.labResults || "-"}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Kế hoạch điều trị
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.treatmentPlan}
                    onChange={(e) =>
                      setFormData({ ...formData, treatmentPlan: e.target.value })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.treatmentPlan || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Ghi chú tiến triển
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.progressNotes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        progressNotes: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.progressNotes || "-"}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Tóm tắt xuất viện
                </label>
                {isEditing ? (
                  <Textarea
                    value={formData.dischargeSummary}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        dischargeSummary: e.target.value,
                      })
                    }
                    className="mt-1"
                    rows={2}
                  />
                ) : (
                  <p className="mt-1 text-sm">
                    {caseRecord.dischargeSummary || "-"}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end mt-6">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditing(false);
                        setFormData({
                          diagnosis: caseRecord.diagnosis || "",
                          chiefComplaint: caseRecord.chiefComplaint || "",
                          medicalHistory: caseRecord.medicalHistory || "",
                          physicalExam: caseRecord.physicalExam || "",
                          labResults: caseRecord.labResults || "",
                          treatmentPlan: caseRecord.treatmentPlan || "",
                          progressNotes: caseRecord.progressNotes || "",
                          dischargeSummary: caseRecord.dischargeSummary || "",
                          status: caseRecord.status || "Ongoing",
                        });
                      }}
                    >
                      Hủy
                    </Button>
                    <Button
                      className="bg-red-500 hover:bg-red-600"
                      onClick={handleUpdateCase}
                    >
                      Lưu thay đổi
                    </Button>
                  </>
                ) : (
                  <Button
                    className="bg-blue-500 hover:bg-blue-600"
                    onClick={() => setIsEditing(true)}
                  >
                    Chỉnh sửa
                  </Button>
                )}
              </div>
            </TabsContent>

            {/* Notes Tab */}
            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Thêm ghi chú mới</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Loại ghi chú
                    </label>
                    <select
                      value={noteType}
                      onChange={(e) => setNoteType(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="General">Chung</option>
                      <option value="Treatment">Điều trị</option>
                      <option value="Diagnosis">Chẩn đoán</option>
                      <option value="Progress">Tiến triển</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Nội dung
                    </label>
                    <Textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <Button
                    className="bg-red-500 hover:bg-red-600 w-full"
                    onClick={handleAddNote}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm ghi chú
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-center py-4 text-gray-500">
                    Không có ghi chú nào
                  </p>
                ) : (
                  notes.map((note) => (
                    <Card key={note.noteId}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="inline-block bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded">
                              {note.noteType}
                            </span>
                            {note.authorUserName && (
                              <p className="text-xs text-gray-500 mt-1">
                                Bởi: {note.authorUserName}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-500">
                            {caseRecord.createdAt && format(new Date(note.createdAt), "dd/MM/yyyy HH:mm", {
                              locale: vi,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          {note.noteContent}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* Files Tab */}
            <TabsContent value="files" className="space-y-4">
              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-center py-8 text-gray-500">
                    Không có file nào
                  </p>
                ) : (
                  files.map((file) => (
                    <Card key={file.fileId}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{file.fileUrl}</p>
                            {file.description && (
                              <p className="text-xs text-gray-500 mt-1">
                                {file.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-400 mt-2">
                              Loại: {file.fileType} | Ngày tải:{" "}
                              {format(new Date(file.uploadedAt), "dd/MM/yyyy", {
                                locale: vi,
                              })}
                            </p>
                            {file.uploadedByUserName && (
                              <p className="text-xs text-gray-400">
                                Tải lên bởi: {file.uploadedByUserName}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() => window.open(file.fileUrl, "_blank")}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() => handleDeleteFile(file.fileId)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Thông tin thay đổi</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Tạo lúc:</span>
                      <p>
                        {caseRecord.createdAt && format(
                          new Date(caseRecord.createdAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cập nhật lúc:</span>
                      <p>
                        {caseRecord.updatedAt && format(
                          new Date(caseRecord.updatedAt),
                          "dd/MM/yyyy HH:mm",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
