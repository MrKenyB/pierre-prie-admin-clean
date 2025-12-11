/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
	Plus,
	Trash2,
	Edit,
	ArrowRight,
	Upload,
	X,
	Loader2,
	Eye,
	Filter,
	University,
	Search,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Formation } from "@/types";
import { usePierreHook } from "@/hooks/pierreHook";
import axios from "axios";
import { toast } from "sonner";



const Formations = () => {

  
	axios.defaults.withCredentials = true;

	const [classe, setClasse] = useState('');
	const [formations, setFormations] = useState<Formation[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [selectedFormation, setSelectedFormation] = useState<Formation | null>(null);
	const [editingId, setEditingId] = useState<string | null>(null);
	const { backendUrl } = usePierreHook();
	const [formData, setFormData] = useState({
		titre: "",
		classe: "",
		description: "",
		imageFile: null as File | null,
	});
	const [preview, setPreview] = useState<string | null>(null);
	const [aptitudes, setAptitudes] = useState<string[]>([]);
	const [debouches, setDebouches] = useState<string[]>([]);
	const [aptitudeInput, setAptitudeInput] = useState("");
	const [deboucheInput, setDeboucheInput] = useState("");

	useEffect(() => {
		fetchFormations();
	}, []);

	const fetchFormations = async (classeFilter?: string) => {
		try {
			setIsLoading(true);
			
			const url = classeFilter 
				? `${backendUrl}/api/parcours/formations?classe=${classeFilter}`
				: `${backendUrl}/api/parcours/formations`;
			
			const response = await axios.get(url);

			if (response.data.success) {
				setFormations(response.data.formations);
				toast.success("Formations chargées");
				console.log("====================================");
				console.log(response.data.formations);
				console.log("====================================");
			}
		} catch (error: any) {
			console.error("Erreur fetch:", error);
			toast.error(
				error.response?.data?.message || "Erreur de chargement"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSearch = () => {
		if (classe) {
			fetchFormations(classe);
		} else {
			toast.info("Veuillez sélectionner une classe");
		}
	};

	const handleResetFilter = () => {
		setClasse('');
		fetchFormations();
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onloadend = () => {
			setPreview(reader.result as string);
		};
		reader.readAsDataURL(file);

		setFormData({ ...formData, imageFile: file });
	};

	const handleAptitudeKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Enter" && aptitudeInput.trim() !== "") {
			e.preventDefault();
			if (!aptitudes.includes(aptitudeInput.trim())) {
				setAptitudes([...aptitudes, aptitudeInput.trim()]);
			}
			setAptitudeInput("");
		}
	};

	const removeAptitude = (index: number) => {
		setAptitudes(aptitudes.filter((_, i) => i !== index));
	};

	const handleDeboucheKeyDown = (
		e: React.KeyboardEvent<HTMLInputElement>
	) => {
		if (e.key === "Enter" && deboucheInput.trim() !== "") {
			e.preventDefault();
			if (!debouches.includes(deboucheInput.trim())) {
				setDebouches([...debouches, deboucheInput.trim()]);
			}
			setDeboucheInput("");
		}
	};

	const removeDebouche = (index: number) => {
		setDebouches(debouches.filter((_, i) => i !== index));
	};

	const handleSubmit = async () => {
		const { titre, classe, description, imageFile } = formData;

		console.log("============= to save====================");
		console.log(formData);
		console.log("====================================");
		if (!titre || !classe || !description) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (!editingId && !imageFile) {
			toast.error("Veuillez sélectionner une image");
			return;
		}

		try {
			setIsLoading(true);

			const data = new FormData();
			data.append("titre", titre);
			data.append("classe", classe);
			data.append("description", description);
			data.append("debouche", JSON.stringify(debouches));
			data.append("aptitude", JSON.stringify(aptitudes));

			if (imageFile) {
				data.append("image", imageFile);
			}

			if (editingId) {
				const response = await axios.put(
					`${backendUrl}/api/parcours/update/${editingId}`,
					data,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				if (response.data.success) {
					toast.success("Formation modifiée avec succès");
					resetForm();
					fetchFormations(classe); 
					setIsDialogOpen(false);
				}
			} else {
				const response = await axios.post(
					`${backendUrl}/api/parcours/create`,
					data,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				if (response.data.success) {
					toast.success("Formation ajoutée avec succès");
					resetForm();
					fetchFormations(classe); 
					setIsDialogOpen(false);
				}
			}
		} catch (error: any) {
			console.error("Erreur submit:", error);
			toast.error(
				error.response?.data?.message || "Erreur lors de l'opération"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleEdit = (formation: Formation) => {
		setFormData({
			titre: formation.titre,
			classe: formation.classe || "",
			description: formation.description,
			imageFile: null,
		});
		setPreview(formation.image);
		setAptitudes(formation.aptitude);
		setDebouches(formation.debouche);
		setEditingId(formation._id);
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette formation ?"))
			return;

		try {
			setIsLoading(true);

			const response = await axios.delete(
				`${backendUrl}/api/parcours/remove/${id}`
			);

			if (response.data.success) {
				toast.success("Formation supprimée");
				fetchFormations(classe); // Rafraîchir avec le filtre actuel
			}
		} catch (error: any) {
			console.log("Erreur delete:", error);
			toast.error("Erreur lors de la suppression");
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewDetails = (formation: Formation) => {
		setSelectedFormation(formation);
		setIsDetailsOpen(true);
	};

	const resetForm = () => {
		setFormData({
			titre: "",
			classe: "",
			description: "",
			imageFile: null,
		});
		setPreview(null);
		setAptitudes([]);
		setDebouches([]);
		setAptitudeInput("");
		setDeboucheInput("");
		setEditingId(null);
		setIsDialogOpen(false);
	};

	return (
		<DashboardLayout>
			<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
				<div className="max-w-7xl mx-auto px-4 py-8">
					<div className="flex justify-between items-center mb-8">
						<div>
							<h2 className="text-3xl font-bold text-slate-600 mb-1">
								Formations
							</h2>
							<p className="text-slate-600">
								Gérez les parcours académiques de l'institut
							</p>
						</div>
						<button
							onClick={() => setIsDialogOpen(true)}
							className="flex items-center gap-2 bg-primary hover:scale-90 cursor-pointer text-white px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
							disabled={isLoading}
						>
							<Plus className="w-5 h-5" /> Ajouter une formation
						</button>
					</div>

					<div className="w-full bg-white rounded-xl overflow-hidden shadow space-y-6 mb-9">
						<div className="w-full bg-primary flex items-center gap-3 text-white px-2 py-4">
							<Filter />
							<h1 className="text-lg font-bold">
								Filtrer par classe
							</h1>
						</div>

						<div className="p-3">
							<div>
								<label className="flex items-center gap-2 text-xs sm:text-sm font-semibold mb-1.5 text-gray-600">
									<University className="w-4 h-4" />
									Classe
								</label>
								<select
									value={classe}
									onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClasse(e.target.value)}
									className="w-full px-3 py-2.5 bg-slate-100 text-gray-500 border cursor-pointer border-gray-400 rounded-md focus:ring-first"
									disabled={isLoading}
								>
									<option value="">Toutes les classes</option>
									<option value="Seconde">Seconde</option>
									<option value="Première">Première</option>
									<option value="Terminale">Terminale</option>
								</select>
							</div>

							<div className="mt-4 flex justify-end gap-2">
								{classe && (
									<button 
										onClick={handleResetFilter}
										className="px-6 py-2.5 bg-slate-500 hover:bg-slate-600 font-semibold text-white rounded-lg flex items-center gap-2 transition"
										disabled={isLoading}
									>
										<X className="w-5 h-5" /> Réinitialiser
									</button>
								)}
								<button 
									onClick={handleSearch}
									className="px-6 py-2.5 bg-primary hover:bg-primary/90 font-semibold text-white rounded-lg flex items-center gap-2 transition"
									disabled={isLoading}
								>
									{isLoading ? (
										<Loader2 className="w-5 h-5 animate-spin" />
									) : (
										<Search className="w-5 h-5" />
									)}
									Rechercher
								</button>
							</div>
						</div>
					</div>

					{isLoading && formations.length === 0 && (
						<div className="flex justify-center items-center h-64">
							<Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
						</div>
					)}

					{!isLoading && formations.length === 0 && (
						<div className="text-center py-28 rounded-md bg-white">
							<div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
								<Plus className="w-8 h-8 text-slate-400" />
							</div>
							<p className="text-slate-500">
								{classe 
									? `Aucune formation trouvée pour la classe ${classe}`
									: "Aucune formation pour le moment"
								}
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{formations.map((formation) => (
							<div
								key={formation._id}
								className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border"
							>
								<div className="relative h-48 bg-slate-200">
									<img
										src={formation.image}
										alt={formation.titre}
										className="w-full h-full object-cover"
									/>
									<div className="absolute top-3 right-3 flex gap-2">
										<button
											onClick={() =>
												handleViewDetails(formation)
											}
											className="p-2 bg-white rounded-lg shadow-sm hover:bg-emerald-50"
											disabled={isLoading}
											title="Voir les détails"
										>
											<Eye className="w-4 h-4 text-emerald-600" />
										</button>

										<button
											onClick={() =>
												handleEdit(formation)
											}
											className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50"
											disabled={isLoading}
											title="Modifier"
										>
											<Edit className="w-4 h-4 text-slate-700" />
										</button>
										<button
											onClick={() =>
												handleDelete(formation._id)
											}
											className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50"
											disabled={isLoading}
											title="Supprimer"
										>
											<Trash2 className="w-4 h-4 text-red-600" />
										</button>
									</div>
									{formation.classe && (
										<div className="absolute top-3 left-3 bg-emerald-600 text-white px-3 py-1 rounded-lg text-sm font-semibold">
											{formation.classe}
										</div>
									)}
								</div>

								<div className="p-4">
									<div className="mb-3">
										<h3 className="font-semibold text-lg text-slate-900">
											{formation.titre}
										</h3>
										<p className="text-sm text-slate-600 line-clamp-2">
											{formation.description}
										</p>
									</div>

									{formation.aptitude.length > 0 && (
										<div className="mb-4">
											<p className="text-xs font-semibold text-slate-700 mb-2">
												Les disciplines enseignées:
											</p>
											<div className="flex flex-wrap gap-1">
												{formation.aptitude
													.slice(0, 3)
													.map((apt, index) => (
														<span
															key={index}
															className="text-xs bg-blue-50 text-primary px-2 py-1 rounded-md"
														>
															{apt}
														</span>
													))}
												{formation.aptitude.length >
													3 && (
													<span className="text-xs text-slate-500">
														+
														{formation.aptitude
															.length - 3}
													</span>
												)}
											</div>
										</div>
									)}

									{formation.debouche.length > 0 && (
										<div>
											<p className="text-xs font-semibold text-slate-700 mb-2">
												Débouchés:
											</p>
											<div className="space-y-1">
												{formation.debouche
													.slice(0, 2)
													.map((deb, index) => (
														<div
															key={index}
															className="flex items-center gap-2 text-sm text-slate-600"
														>
															<ArrowRight className="w-3 h-3 text-emerald-600 flex-shrink-0" />
															<span className="truncate">
																{deb}
															</span>
														</div>
													))}
												{formation.debouche.length >
													2 && (
													<p className="text-xs text-slate-500 pl-5">
														+
														{formation.debouche
															.length - 2}{" "}
														autre(s)
													</p>
												)}
											</div>
										</div>
									)}
								</div>
							</div>
						))}
					</div>
				</div>

				{/* Modal Détails */}
				{isDetailsOpen && selectedFormation && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
							<div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
								<div>
									<h3 className="text-2xl font-bold text-slate-900">
										{selectedFormation.titre}
									</h3>
									{selectedFormation.classe && (
										<p className="text-sm text-emerald-600 font-semibold">
											Classe: {selectedFormation.classe}
										</p>
									)}
									<p className="text-sm text-slate-500">
										Détails complets de la formation
									</p>
								</div>
								<button
									onClick={() => setIsDetailsOpen(false)}
									className="p-2 hover:bg-slate-100 rounded-lg transition"
								>
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="p-6">
								<div className="mb-6 rounded-xl overflow-hidden">
									<img
										src={selectedFormation.image}
										alt={selectedFormation.titre}
										className="w-full h-64 object-cover"
									/>
								</div>

								<div className="mb-6">
									<h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
										<div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
										Description
									</h4>
									<p className="text-slate-700 leading-relaxed pl-4">
										{selectedFormation.description}
									</p>
								</div>

								{selectedFormation.aptitude.length > 0 && (
									<div className="mb-6">
										<h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
											<div className="w-1 h-6 bg-blue-600 rounded-full"></div>
											Les disciplines enseignées
										</h4>
										<div className="flex flex-wrap gap-2 pl-4">
											{selectedFormation.aptitude.map(
												(apt, index) => (
													<span
														key={index}
														className="bg-blue-50 text-primary px-3 py-2 rounded-lg text-sm font-medium"
													>
														{apt}
													</span>
												)
											)}
										</div>
									</div>
								)}

								{selectedFormation.debouche.length > 0 && (
									<div>
										<h4 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
											<div className="w-1 h-6 bg-emerald-600 rounded-full"></div>
											Potentiels de débouchés
										</h4>
										<div className="space-y-2 pl-4">
											{selectedFormation.debouche.map(
												(deb, index) => (
													<div
														key={index}
														className="flex items-center gap-3 p-3 bg-emerald-50 rounded-lg"
													>
														<ArrowRight className="w-5 h-5 text-emerald-600 flex-shrink-0" />
														<span className="text-slate-700">
															{deb}
														</span>
													</div>
												)
											)}
										</div>
									</div>
								)}

								<div className="flex gap-3 mt-6 pt-6 border-t">
									<button
										onClick={() => {
											setIsDetailsOpen(false);
											handleEdit(selectedFormation);
										}}
										className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
									>
										<Edit className="w-4 h-4" />
										Modifier
									</button>
									<button
										onClick={() => setIsDetailsOpen(false)}
										className="flex-1 border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-lg transition"
									>
										Fermer
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Modal Ajouter/Modifier */}
				{isDialogOpen && (
					<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
						<div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
							<div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
								<div>
									<h3 className="text-xl font-bold">
										{editingId
											? "Modifier la formation"
											: "Nouvelle formation"}
									</h3>
									<p className="text-sm text-slate-500">
										Remplissez les informations
									</p>
								</div>
								<button
									onClick={resetForm}
									className="p-2 hover:bg-slate-100 rounded-lg"
								>
									<X className="w-5 h-5 text-slate-600" />
								</button>
							</div>

							<div className="p-6 space-y-5">
								<div>
									<label className="block text-sm font-medium mb-2">
										Titre{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.titre}
										onChange={(e) =>
											setFormData({
												...formData,
												titre: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
										placeholder="Ex: Électronique Industrielle"
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Classe{" "}
										<span className="text-red-500">*</span>
									</label>
									<input
										type="text"
										value={formData.classe}
										onChange={(e) =>
											setFormData({
												...formData,
												classe: e.target.value,
											})
										}
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
										placeholder="Ex: Terminale, Première, Seconde."
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Image{" "}
										{!editingId && (
											<span className="text-red-500">
												*
											</span>
										)}
									</label>
									<div className="flex gap-2 items-center">
										<input
											type="file"
											accept="image/*"
											onChange={handleImageChange}
											className="flex-1 text-sm"
										/>
										<Upload className="w-5 h-5 text-slate-600" />
									</div>
									{preview && (
										<img
											src={preview}
											alt="Aperçu"
											className="mt-3 w-full h-40 object-cover rounded-lg border"
										/>
									)}
									{editingId && (
										<p className="text-xs text-slate-500 mt-1">
											Laisser vide pour conserver l'image
											actuelle
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Description{" "}
										<span className="text-red-500">*</span>
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										rows={3}
										className="w-full px-4 py-2 border rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:outline-none"
										placeholder="Décrivez la formation..."
									/>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Les disciplines enseignées
									</label>
									<input
										type="text"
										value={aptitudeInput}
										onChange={(e) =>
											setAptitudeInput(e.target.value)
										}
										onKeyDown={handleAptitudeKeyDown}
										placeholder="Appuyez sur Entrée pour ajouter"
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none"
									/>
									<div className="flex flex-wrap gap-2 mt-2">
										{aptitudes.map((apt, index) => (
											<span
												key={index}
												className="flex items-center bg-blue-50 text-primary px-2 py-1 rounded-md text-sm"
											>
												{apt}
												<button
													onClick={() =>
														removeAptitude(index)
													}
													className="ml-2 text-blue-500 hover:text-primary"
												>
													×
												</button>
											</span>
										))}
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium mb-2">
										Potentiels de débouchés
									</label>
									<input
										type="text"
										value={deboucheInput}
										onChange={(e) =>
											setDeboucheInput(e.target.value)
										}
										onKeyDown={handleDeboucheKeyDown}
										placeholder="Appuyez sur Entrée pour ajouter"
										className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
									/>
									<div className="flex flex-wrap gap-2 mt-2">
										{debouches.map((deb, index) => (
											<span
												key={index}
												className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm"
											>
												{deb}
												<button
													onClick={() =>
														removeDebouche(index)
													}
													className="ml-2 text-green-500 hover:text-green-700"
												>
													×
												</button>
											</span>
										))}
									</div>
								</div>

								<div className="flex gap-3 pt-4 border-t">
									<button
										onClick={resetForm}
										className="flex-1 border px-4 py-2 rounded-lg hover:bg-slate-50 transition"
										disabled={isLoading}
									>
										Annuler
									</button>
									<button
										onClick={handleSubmit}
										className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition"
										disabled={isLoading}
									>
										{isLoading ? (
											<Loader2 className="w-4 h-4 animate-spin" />
										) : editingId ? (
											"Modifier"
										) : (
											"Ajouter"
										)}
									</button>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</DashboardLayout>
	);
};

export default Formations;