import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import userService from '@/services/userService';
import type { DoctorSearchDto } from '@/types';

export function useDoctorSearch(tenantId: number) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
  const [doctors, setDoctors] = useState<DoctorSearchDto[]>([]);
  const [allFoundDoctors, setAllFoundDoctors] = useState<DoctorSearchDto[]>([]); // Store all found doctors
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false); // Track if search has been performed

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && tenantId) {
      searchDoctors(debouncedSearchTerm);
      setHasSearched(true);
    } else if (debouncedSearchTerm.length === 0 && tenantId) {
      // Load default doctors when no search term
      loadDefaultDoctors();
      setHasSearched(false);
    } else {
      setDoctors([]);
      setHasSearched(false);
    }
  }, [debouncedSearchTerm, tenantId]);

  // Load default data on mount
  useEffect(() => {
    if (tenantId) {
      loadDefaultDoctors();
    }
  }, [tenantId]);

  const loadDefaultDoctors = async () => {
    setIsLoading(true);
    try {
      // Use a common search term or modify backend to support empty search
      const response = await userService.searchDoctorsInTenant(tenantId, 'dr', 10);
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
      console.error('Error loading default doctors:', error);
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
      console.error('Error searching doctors:', error);
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