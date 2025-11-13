import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePierreHook } from '@/hooks/pierreHook';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { connected, loading } = usePierreHook();

  useEffect(() => {
    // Si le chargement est terminé et pas connecté, rediriger
    if (!loading && !connected) {
      navigate('/', { replace: true });
    }
  }, [connected, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!connected) {
    return null;
  }

  return <>{children}</>;
};