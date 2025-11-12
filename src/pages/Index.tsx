import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePierreHook } from '@/hooks/pierreHook';

const Index = () => {
  const navigate = useNavigate();
  const { connected, loading, checkAuth } = usePierreHook();

  useEffect(() => {
    // Lancer la vérification au montage
    checkAuth();
  }, []); // Seulement au montage

  useEffect(() => {
    if (!loading) {
      if (connected) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/auth', { replace: true });
      }
    }
  }, [loading, connected, navigate]); 

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return null;
};

export default Index;