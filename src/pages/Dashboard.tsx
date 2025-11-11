/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
	FileText,
	Calendar,
	GraduationCap,
	MessageSquare,
	Award,
	Users,
	Clock,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { StatsCard } from "@/components/StatsCard";
import { dashboardService } from "@/services/dataService";
import { DashboardStats } from "@/types";

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

		const interval = setInterval(loadStats, 5000);
		return () => clearInterval(interval);
	}, []);

	

	return (
		<DashboardLayout>
			<div className="p-4 sm:p-2">
				{/* Welcome Banner avec dégradé moderne */}
				<div className="relative overflow-hidden bg-primary rounded-2xl p-8 mb-8 shadow-xl">
					{/* Motifs décoratifs */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
					<div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

					<div className="relative z-10">
						<div className="flex items-center gap-3 mb-4">
							<Award className="w-12 h-12 text-white" />
							<h2 className="text-2xl sm:text-3xl font-bold text-white">
								Espace Administrateur
							</h2>
						</div>
						<p className="text-blue-100 text-base sm:text-lg mb-6 max-w-3xl leading-relaxed">
							Gérez l'ensemble des contenus de votre institut en
							toute simplicité. Publiez des résultats, organisez
							des événements et valorisez vos formations auprès
							des étudiants et partenaires.
						</p>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
							<div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
									<FileText className="w-5 h-5 text-white" />
								</div>
								<div>
									<h4 className="text-white font-semibold mb-1">
										Résultats scolaires
									</h4>
									<p className="text-blue-100 text-sm">
										Publication de PDF par filière et année
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
									<Calendar className="w-5 h-5 text-white" />
								</div>
								<div>
									<h4 className="text-white font-semibold mb-1">
										Événements
									</h4>
									<p className="text-blue-100 text-sm">
										Annonces et actualités de l'institut
									</p>
								</div>
							</div>

							<div className="flex items-start gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-4">
								<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
									<GraduationCap className="w-5 h-5 text-white" />
								</div>
								<div>
									<h4 className="text-white font-semibold mb-1">
										Formations
									</h4>
									<p className="text-blue-100 text-sm">
										Gestion complète des parcours
									</p>
								</div>
							</div>
						</div>
					</div>
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

				{/* Activité récente */}
				<div className="bg-white rounded-2xl border-2 border-slate-100 p-6 shadow-sm">
					<h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
						<Clock className="w-5 h-5 text-primary" />
						Activité récente
					</h2>
					<div className="space-y-3">
						<div className="flex items-center gap-4 p-3 bg-slate-100 rounded-lg">
							<div className="w-2 h-2 bg-primary rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-800">
									Résultats publiés - BTS Informatique 2024
								</p>
								<p className="text-xs text-slate-500">
									Il y a 2 heures
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
							<div className="w-2 h-2 bg-green-600 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-800">
									Événement ajouté - Journée Portes Ouvertes
								</p>
								<p className="text-xs text-slate-500">
									Il y a 5 heures
								</p>
							</div>
						</div>
						<div className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
							<div className="w-2 h-2 bg-purple-600 rounded-full"></div>
							<div className="flex-1">
								<p className="text-sm font-medium text-slate-800">
									Formation modifiée - Licence Comptabilité
								</p>
								<p className="text-xs text-slate-500">
									Hier à 14h30
								</p>
							</div>
						</div>
					</div>
				</div>
      </div>
		</DashboardLayout>
	);
};

export default Dashboard;
