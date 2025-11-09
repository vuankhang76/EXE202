import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import patientService from '@/services/patientService';
import conversationService from '@/services/conversationService';
import type { ClinicPatientDto } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MessageCircle, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

interface CreateConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CreateConversationDialog({ open, onOpenChange }: CreateConversationDialogProps) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [patients, setPatients] = useState<ClinicPatientDto[]>([]);

  const tenantId = currentUser?.tenantId ? parseInt(currentUser.tenantId) : null;

  const handleSearch = async () => {
    if (!searchTerm.trim() || !tenantId) {
      toast.error('Vui lòng nhập tên hoặc số điện thoại bệnh nhân');
      return;
    }

    setSearching(true);
    try {
      const response = await patientService.searchPatientsInTenant(tenantId, searchTerm, 10);
      
      if (response.success && response.data) {
        setPatients(response.data);
        if (response.data.length === 0) {
          toast.info('Không tìm thấy bệnh nhân nào');
        }
      }
    } catch (error: any) {
      console.error('Error searching patients:', error);
      toast.error('Không thể tìm kiếm bệnh nhân');
    } finally {
      setSearching(false);
    }
  };

  const handleCreateConversation = async (patientId: number, patientName: string) => {
    if (!tenantId) {
      toast.error('Thiếu thông tin clinic');
      return;
    }

    setCreating(true);
    try {
      const response = await conversationService.createConversation({ 
        patientId,
        title: `Tư vấn với ${patientName}`
      });

      if (response.success && response.data) {
        toast.success('Đã tạo cuộc trò chuyện');
        onOpenChange(false);
        navigate(`/clinic/chat/${response.data.conversationId}`);
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast.error(error.response?.data?.message || 'Không thể tạo cuộc trò chuyện');
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setPatients([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Tạo cuộc trò chuyện mới</DialogTitle>
          <DialogDescription>
            Tìm kiếm bệnh nhân để bắt đầu cuộc trò chuyện
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Nhập tên hoặc số điện thoại bệnh nhân..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch} disabled={searching || !searchTerm.trim()}>
              {searching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Tìm kiếm'
              )}
            </Button>
          </div>

          {/* Results */}
          <div className="border rounded-lg max-h-[400px] overflow-y-auto">
            {patients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <Search className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm">
                  {searchTerm ? 'Không tìm thấy bệnh nhân' : 'Nhập từ khóa để tìm kiếm'}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {patients.map((patient) => (
                  <div
                    key={patient.patientId}
                    className="flex items-center justify-between p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {patient.fullName || 'Chưa có tên'}
                        </h4>
                        <p className="text-sm text-gray-600">
                          {patient.primaryPhoneE164 || 'Chưa có SĐT'}
                        </p>
                        {patient.dateOfBirth && (
                          <p className="text-xs text-gray-500">
                            Sinh: {new Date(patient.dateOfBirth).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleCreateConversation(patient.patientId, patient.fullName || 'Bệnh nhân')}
                      disabled={creating}
                    >
                      {creating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Nhắn tin
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

