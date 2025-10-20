import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import tenantService from '@/services/tenantService';
import type { PatientSearchDto } from '@/types';

export function usePatientSearch(tenantId: number) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [patients, setPatients] = useState<PatientSearchDto[]>([]);
  const [allFoundPatients, setAllFoundPatients] = useState<PatientSearchDto[]>([]); // Store all found patients
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    if (debouncedSearchTerm.length >= 2 && tenantId) {
      searchPatients(debouncedSearchTerm);
      setHasSearched(true);
    } else {
      setPatients([]);
      setHasSearched(false);
    }
  }, [debouncedSearchTerm, tenantId]);

  const searchPatients = async (term: string) => {
    setIsLoading(true);
    try {
      const response = await tenantService.searchPatientsInTenant(tenantId, term, 10);
      if (response.success && response.data) {
        setPatients(response.data);
        setAllFoundPatients(prev => {
          const newPatients = response.data || [];
          const combined = [...prev];
          newPatients.forEach(patient => {
            if (!combined.find(p => p.patientId === patient.patientId)) {
              combined.push(patient);
            }
          });
          return combined;
        });
      } else {
        setPatients([]);
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      setPatients([]);
    } finally {
      setIsLoading(false);
    }
  };

  const items = patients.map(patient => ({
    value: patient.patientId.toString(),
    label: `${patient.fullName} ${patient.primaryPhoneE164}`
  }));

  const selectedPatient = allFoundPatients.find(p => p.patientId.toString() === selectedPatientId);
  const selectedLabel = selectedPatient ? 
    `${selectedPatient.fullName} - ${selectedPatient.primaryPhoneE164}${selectedPatient.mrn ? ` (${selectedPatient.mrn})` : ''}` : 
    '';

  return {
    searchTerm,
    setSearchTerm,
    selectedPatientId,
    setSelectedPatientId,
    selectedLabel,
    items,
    isLoading,
    hasSearched,
    patients
  };
}

export type UsePatientSearchReturn = ReturnType<typeof usePatientSearch>;