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
                      <TableHead className="min-w-[80px]">Mã CA</TableHead>
                      <TableHead className="min-w-[120px]">Bệnh nhân</TableHead>
                      <TableHead className="min-w-[120px]">Bác sĩ</TableHead>
                      <TableHead className="min-w-[120px]">Ngày Hẹn</TableHead>
                      <TableHead className="min-w-[100px]">Giờ Hẹn</TableHead>
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
                        <TableCell>{record.patientName || "-"}</TableCell>
                        <TableCell>{record.doctorName || "-"}</TableCell>
                        <TableCell>
                          {record.appointmentStartAt
                            ? format(new Date(record.appointmentStartAt), "dd/MM/yyyy", {
                                locale: vi,
                              })
                            : "-"}
                        </TableCell>
                        <TableCell>
                          {record.appointmentStartAt
                            ? format(new Date(record.appointmentStartAt), "HH:mm", {
                                locale: vi,
                              })
                            : "-"}
                        </TableCell>
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
