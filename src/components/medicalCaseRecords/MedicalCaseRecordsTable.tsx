import { Button } from "@/components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { Eye, Trash2, FileText } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import TableSkeleton from "@/components/ui/TableSkeleton";
import TablePagination from "@/components/ui/TablePagination";
import type { MedicalCaseRecordDto } from "@/types/medicalCaseRecord";
import { Mars, Venus } from "lucide-react";
interface RecordsTableProps {
  records: MedicalCaseRecordDto[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  rowsPerPage: number;
  onViewDetail: (caseId: number) => void;
  onDelete: (caseId: number) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

const renderActionButtons = (
  record: MedicalCaseRecordDto,
  onViewDetail: (caseId: number) => void,
  onDelete: (caseId: number) => void
) => {
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        variant="ghost"
        onClick={() => onViewDetail(record.caseId)}
        className="h-8 w-8 p-0"
        title="Xem chi tiết"
      >
        <Eye className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
        title="Xem file"
      >
        <FileText className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="ghost"
        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
        onClick={() => onDelete(record.caseId)}
        title="Xóa"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default function RecordsTable({
  records,
  loading,
  currentPage,
  totalPages,
  totalCount,
  rowsPerPage,
  onViewDetail,
  onDelete,
  onPageChange,
  onRowsPerPageChange,
}: RecordsTableProps) {
  const safeRecords = records || [];

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }

      if (dateString.includes('-')) {
        const parts = dateString.split('-');
        if (parts.length === 3) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]);
          const day = parseInt(parts[2]);
          if (year > 1900 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            const newDate = new Date(year, month - 1, day);
            return newDate.toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });
          }
        }
      }

      return dateString;
    } catch {
      return dateString;
    }
  };

  const age = (dateOfBirth?: string) => {
    if (!dateOfBirth) return "N/A";
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    return age;
  }

  const renderGender = (gender?: string) => {
    if (!gender) return "N/A";
    return gender === "M" ? <span className="flex items-center"><Mars className="text-blue-500 h-4 w-4 mr-1" />Nam</span> : <span className="text-pink-500 flex"><Venus className="h-4 w-4" />Nữ</span>;
  }

  return (
    <div>
      {loading ? (
        <div>
          <TableSkeleton rows={10} columns={9} />
        </div>
      ) : safeRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Không có bệnh án nào
        </div>
      ) : (
        <>
          <div className="border rounded-lg bg-white flex flex-col overflow-hidden">
            <div className="flex-1 overflow-auto">
              <div className="w-full">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                    <TableRow className="bg-gray-50">
                      <TableHead className="min-w-[65px]">Mã CA</TableHead>
                      <TableHead className="min-w-[80px]">Mã lịch hẹn</TableHead>
                      <TableHead className="min-w-[120px]">Bệnh nhân</TableHead>
                      <TableHead className="min-w-[120px]">Ngày sinh</TableHead>
                      <TableHead className="min-w-[80px]">Giới tính</TableHead>
                      <TableHead className="min-w-[120px]">Bác sĩ</TableHead>
                      <TableHead className="min-w-[200px]">Chẩn đoán</TableHead>
                      <TableHead className="min-w-[100px]">Trạng thái</TableHead>
                      <TableHead className="min-w-[120px]">Ngày tạo</TableHead>
                      <TableHead className="min-w-[120px]">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {safeRecords.map((record) => (
                      <TableRow key={record.caseId} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          #{record.caseId}
                        </TableCell>
                        <TableCell className="font-medium">{record.appointmentId ? `#${record.appointmentId}` : "-"}</TableCell>
                        <TableCell>{record.patientName}</TableCell>
                        <TableCell>
                            {record.dateOfBirth
                              ? `${formatDate(record.dateOfBirth)} (${age(record.dateOfBirth)} tuổi)`
                              : "N/A"}
                          </TableCell>
                        <TableCell>{renderGender(record.gender)}</TableCell>
                        <TableCell>{record.doctorName}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.diagnosis || "-"}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              record.status === "Ongoing"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {record.status === "Ongoing"
                              ? "Đang điều trị"
                              : "Đã hoàn thành"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {format(new Date(record.createdAt), "dd/MM/yyyy", {
                            locale: vi,
                          })}
                        </TableCell>
                        <TableCell>
                          {renderActionButtons(record, onViewDetail, onDelete)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <TablePagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            totalCount={totalCount}
            rowsPerPage={rowsPerPage}
            onPageChange={onPageChange} 
            onRowsPerPageChange={onRowsPerPageChange}
          />
        </>
      )}
    </div>
  );
}
