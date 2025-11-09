import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import userService from '@/services/userService';
import type { DoctorSearchDto } from '@/types';

export function useDoctorSearch(tenantId: number) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctors, setDoctors] = useState<DoctorSearchDto[]>([]);
  const [allFoundDoctors, setAllFoundDoctors] = useState<DoctorSearchDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && tenantId) {
      searchDoctors(debouncedSearchTerm);
      setHasSearched(true);
    } else if (debouncedSearchTerm.length === 0 && tenantId) {
      loadDefaultDoctors();
      setHasSearched(false);
    } else {
      setDoctors([]);
      setHasSearched(false);
    }
  }, [debouncedSearchTerm, tenantId]);

  useEffect(() => {
    if (tenantId) {
      loadDefaultDoctors();
    }
  }, [tenantId]);

  const loadDefaultDoctors = async () => {
    setIsLoading(true);
    try {
      const response = await userService.searchDoctorsInTenant(tenantId, 'dr', 20);
      if (response.success && response.data) {
        setDoctors(response.data);
        setAllFoundDoctors(prev => {
          const newDoctors = response.data || [];
          const combined = [...prev];
          newDoctors.forEach(doctor => {
            if (!combined.find(d => d.userId === doctor.userId)) {
              combined.push(doctor);
            }
          });
          return combined;
        });
      } else {
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const searchDoctors = async (term: string) => {
    setIsLoading(true);
    try {
      const response = await userService.searchDoctorsInTenant(tenantId, term, 10);
      if (response.success && response.data) {
        setDoctors(response.data);
        setAllFoundDoctors(prev => {
          const newDoctors = response.data || [];
          const combined = [...prev];
          newDoctors.forEach(doctor => {
            if (!combined.find(d => d.userId === doctor.userId)) {
              combined.push(doctor);
            }
          });
          return combined;
        });
      } else {
        setDoctors([]);
      }
    } catch (error) {
      setDoctors([]);
    } finally {
      setIsLoading(false);
    }
  };

  const items = doctors.map(doctor => ({
    value: doctor.doctorId?.toString() || doctor.userId.toString(),
    label: `${doctor.fullName}${doctor.specialty ? ` - ${doctor.specialty}` : ''}${doctor.licenseNumber ? ` (${doctor.licenseNumber})` : ''}`
  }));

  const selectedDoctor = allFoundDoctors.find(d => {
    const docId = d.doctorId?.toString() || d.userId.toString();
    return docId === selectedDoctorId;
  });
  const selectedLabel = selectedDoctor ? 
    `${selectedDoctor.fullName}${selectedDoctor.specialty ? ` - ${selectedDoctor.specialty}` : ''}${selectedDoctor.licenseNumber ? ` (${selectedDoctor.licenseNumber})` : ''}` : 
    '';

  return {
    searchTerm,
    setSearchTerm,
    selectedDoctorId,
    setSelectedDoctorId,
    selectedLabel,
    items,
    isLoading,
    hasSearched,
    doctors
  };
}