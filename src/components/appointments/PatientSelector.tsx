import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Combobox } from '@/components/ui/Combobox';
import { Plus } from 'lucide-react';
import { PatientRegistrationForm } from './PatientRegistrationForm';
import type { PatientRegistrationDto } from '@/types';

interface PatientSelectorProps {
  patientSearch: {
    selectedPatientId: string;
    setSelectedPatientId: (id: string) => void;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    items: Array<{ value: string; label: string }>;
    isLoading: boolean;
    hasSearched: boolean;
    patients: any[];
  };
  showRegisterForm: boolean;
  onShowRegisterForm: (show: boolean) => void;
  newPatientData: PatientRegistrationDto;
  registrationErrors: {
    fullName: string;
    phone: string;
    dateOfBirth: string;
  };
  isRegistering: boolean;
  onPatientFieldChange: (field: keyof PatientRegistrationDto, value: any) => void;
  onQuickRegister: () => void;
}

export function PatientSelector({
  patientSearch,
  showRegisterForm,
  onShowRegisterForm,
  newPatientData,
  registrationErrors,
  isRegistering,
  onPatientFieldChange,
  onQuickRegister
}: PatientSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="patient">Bệnh nhân *</Label>
      <Combobox
        selectedValue={patientSearch.selectedPatientId}
        onSelectedValueChange={patientSearch.setSelectedPatientId}
        searchValue={patientSearch.searchTerm}
        onSearchValueChange={patientSearch.setSearchTerm}
        items={patientSearch.items}
        isLoading={patientSearch.isLoading}
        hasSearched={patientSearch.hasSearched}
        placeholder="Chọn bệnh nhân..."
        searchPlaceholder="Tìm kiếm bệnh nhân..."
        emptyMessage="Không tìm thấy bệnh nhân"
      />
      
      {/* Show register button when search returns no results */}
      {patientSearch.hasSearched && 
       patientSearch.patients.length === 0 && 
       patientSearch.searchTerm.length >= 2 && 
       !patientSearch.isLoading &&
       !showRegisterForm && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            onShowRegisterForm(true);
            onPatientFieldChange('fullName', patientSearch.searchTerm);
            const phoneMatch = patientSearch.searchTerm.match(/^(\+84|0)[0-9]{9,10}$/);
            if (phoneMatch) {
              onPatientFieldChange('primaryPhoneE164', patientSearch.searchTerm);
            }
          }}
          className="w-full mt-2 border-dashed"
        >
          <Plus className="mr-2 h-4 w-4" />
          Đăng ký bệnh nhân mới
        </Button>
      )}

      {/* Quick registration form */}
      {showRegisterForm && (
        <PatientRegistrationForm
          data={newPatientData}
          errors={registrationErrors}
          isRegistering={isRegistering}
          onFieldChange={onPatientFieldChange}
          onSubmit={onQuickRegister}
          onCancel={() => onShowRegisterForm(false)}
        />
      )}
    </div>
  );
}
