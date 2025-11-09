import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PatientAppointments() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard
    navigate('/patient/dashboard');
  }, [navigate]);

  return null;
}
