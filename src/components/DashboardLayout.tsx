import { ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  GraduationCap,
  MessageSquare,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpeg';

interface DashboardLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/dashboard' },
  { icon: FileText, label: 'Résultats', path: '/resultats' },
  { icon: Calendar, label: 'Événements', path: '/evenements' },
  { icon: GraduationCap, label: 'Formations', path: '/formations' },
  { icon: MessageSquare, label: 'Témoignages', path: '/temoignages' },
];

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const admin = authService.getCurrentAdmin();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    toast.success('Déconnexion réussie');
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-primary text-primary-foreground flex items-center justify-between px-4 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <img 
            src={logo} 
            alt="Institut Pierre Prie" 
            className="w-10 h-10 object-contain"
          />
          <div>
            <h1 className="font-bold text-sm">Institut Pierre Prie</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-primary-foreground hover:bg-sidebar-accent"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </Button>
      </header>

      {/* Sidebar Desktop + Mobile Overlay */}
      <aside className={cn(
        "fixed lg:static top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-screen w-64 bg-primary text-primary-foreground flex flex-col shadow-lg z-40 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo section - Desktop only */}
        <div className="hidden lg:flex p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Institut Pierre Prie" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="font-bold text-lg">Institut</h1>
              <p className="text-xs opacity-90">Pierre Prie</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => {
                  navigate(item.path);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' 
                    : 'hover:bg-sidebar-accent text-sidebar-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="mb-3 px-4 py-2">
            <p className="text-xs opacity-75">Connecté en tant que</p>
            <p className="font-medium text-sm">
              {admin?.prenom} {admin?.nom}
            </p>
          </div>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-30 top-16"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
};
