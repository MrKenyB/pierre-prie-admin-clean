import { ReactNode, useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Calendar, 
  GraduationCap,
  MessageSquare,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ChevronLeft,
  User,
  Mail,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authService } from '@/services/authService';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import logo from '@/assets/logo.jpeg';
import { usePierreHook } from '@/hooks/pierreHook';

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
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const {user} = usePierreHook()

  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    toast.success('Déconnexion réussie');
    navigate('/');
  };
  
  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className={cn(
        "hidden lg:flex fixed left-0 top-0 h-screen bg-white border-r border-slate-200 flex-col shadow-sm transition-all duration-300 z-40",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        {/* Logo section */}
        <div className="p-4 flex items-center justify-between">
          {!isSidebarCollapsed && (
            <div className="flex items-center gap-3">
              <img 
                src={logo} 
                alt="Institut Pierre Prie" 
                className="w-10 h-10 object-contain rounded-lg"
              />
              <div>
                <h1 className="font-bold text-sm text-slate-800">Institut</h1>
                <p className="text-xs text-slate-500">Pierre Prie</p>
              </div>
            </div>
          )}
          {isSidebarCollapsed && (
            <img 
              src={logo} 
              alt="Institut Pierre Prie" 
              className="w-10 h-10 object-contain rounded-lg mx-auto"
            />
          )}
        </div>

        {/* navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                  'group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-primary/15 text-prmary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  isSidebarCollapsed && 'justify-center'
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 text-primary flex-shrink-0" />
                {!isSidebarCollapsed && (
                  <span className="font-medium text-sm">{item.label}</span>
                )}
                {isActive && !isSidebarCollapsed && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm font-medium">Réduire</span>
              </>
            )}
          </button>
        </div>

        {/* User section */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-t border-slate-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Déconnexion</span>
            </button>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar - Right Side */}
      <aside className={cn(
        "lg:hidden fixed right-0 top-0 h-screen w-64 bg-white border-l border-slate-200 flex flex-col shadow-lg z-50 transition-transform duration-300",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        {/* Logo section */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-2 bg-slate-300 rounded-md hover:bg-red-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <img 
              src={logo} 
              alt="Institut Pierre Prie" 
              className="w-14 h-14 object-contain rounded-lg"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
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
                  'group relative w-full flex items-center gap-3 px-3 py-2.5  rounded-lg transition-all duration-200',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User section - Mobile */}
        <div className="p-3 border-t border-slate-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Main content wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-h-screen transition-all duration-300",
        "lg:ml-64",
        isSidebarCollapsed && "lg:ml-20"
      )}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            {/* Left side - Logo for mobile */}
            <div className="flex items-center gap-2">
              <img 
                src={logo} 
                alt="Institut Pierre Prie" 
                className="w-12 h-12 object-contain rounded-lg lg:hidden"
              />
            </div>

            {/* Empty div for desktop to push profile to right */}
            <div className="hidden lg:block"></div>

            <div className="flex items-center gap-2">

              {/* User Profile - Desktop */}

              <div className="hidden lg:block relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-800 leading-tight">
                      {user?.prenom} {user?.nom}
                    </p>
                    <p className="text-xs text-slate-500">Administrateur</p>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 text-slate-400 transition-transform",
                    isProfileOpen && "rotate-90"
                  )} />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
                    <div className="bg-primary p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">
                            {user?.prenom} {user?.nom}
                          </p>
                          <p className="text-xs text-blue-100 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Administrateur
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-2">
                      <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-lg">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-500">Email</p>
                          <p className="text-sm text-slate-700 truncate">
                            {user?.email}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-slate-100 p-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-500 hover:text-white rounded-lg transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Menu button for mobile - Right side */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 bg-slate-200 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-slate-300">
          {children}
        </main>
      </div>
    </div>
  );
};