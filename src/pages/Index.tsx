import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    authService.initializeAdmin();
    
    if (authService.isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth', { replace: true });
    }
  }, [navigate]);

  return null;
};

export default Index;
