import { useEffect, useState } from 'react';
import { FileText, Calendar, GraduationCap, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { StatsCard } from '@/components/StatsCard';
import { dashboardService } from '@/services/dataService';
import { DashboardStats } from '@/types';

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalResultats: 0,
    totalEvenements: 0,
    totalFormations: 0,
    totalTemoignages: 0,
  });

  useEffect(() => {
    const loadStats = () => {
      const data = dashboardService.getStats();
      setStats(data);
    };

    loadStats();

    // Actualiser les stats toutes les 5 secondes pour refléter les changements
    const interval = setInterval(loadStats, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
            Tableau de bord
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Vue d'ensemble de votre plateforme administrative
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <StatsCard
            title="Résultats publiés"
            value={stats.totalResultats}
            icon={FileText}
            color="primary"
            trend="Total des documents"
          />
          <StatsCard
            title="Événements actifs"
            value={stats.totalEvenements}
            icon={Calendar}
            color="secondary"
            trend="Actualités et annonces"
          />
          <StatsCard
            title="Formations disponibles"
            value={stats.totalFormations}
            icon={GraduationCap}
            color="accent"
            trend="Parcours académiques"
          />
          <StatsCard
            title="Témoignages"
            value={stats.totalTemoignages}
            icon={MessageSquare}
            color="primary"
            trend="Expériences partagées"
          />
        </div>

        {/* Welcome Card */}
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white shadow-lg">
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">
            Bienvenue sur votre espace administrateur
          </h2>
          <p className="text-white/90 text-sm sm:text-base mb-4 sm:mb-6 max-w-2xl">
            Gérez efficacement les résultats scolaires, les événements et les formations de l'Institut Pierre Prie. 
            Utilisez le menu latéral pour accéder aux différentes sections de gestion.
          </p>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Publiez des résultats en PDF</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Annoncez des événements</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
              <span className="text-xs sm:text-sm">Gérez les formations</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
