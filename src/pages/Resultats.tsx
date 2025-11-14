/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
	Plus,
	FileText,
	Trash2,
	Edit,
	Download,
	Loader2,
	Eye,
	X,
} from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import axios from "axios";
import { Resultat } from "@/types";
import { usePierreHook } from "@/hooks/pierreHook";



const Resultats = () => {
	axios.defaults.withCredentials = true;

	const [resultats, setResultats] = useState<Resultat[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
	const [currentPdf, setCurrentPdf] = useState<string>("");
	const [editingId, setEditingId] = useState<string | null>(null);

	const { backendUrl } = usePierreHook();
	const [formData, setFormData] = useState({
		categorie: "Ordinaire",
		filiere: "",
		niveau: "",
		semestre: "",
		annee: "",
		fichierPDF: null as File | null,
	});

	useEffect(() => {
		fetchResultats();
	}, []);

	const fetchResultats = async () => {
		try {
			setIsLoading(true);
			const response = await axios.get(
				`${backendUrl}/api/resultat/get-all`
			);

			console.log("===============resultats================");
			console.log(response.data);
			console.log("====================================");
			if (response.data.success) {
				setResultats(response.data.resultats);
				toast.success("Résultats chargés");
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

	// CRÉER OU MODIFIER UN RÉSULTAT
	const handleSubmit = async () => {
		const { categorie, filiere, niveau, semestre, annee, fichierPDF } = formData;

		if (!filiere || !niveau || !semestre || !annee) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}

		// Si création, le PDF est obligatoire
		if (!editingId && !fichierPDF) {
			toast.error("Veuillez sélectionner un fichier PDF");
			return;
		}

		try {
			setIsLoading(true);

			const data = new FormData();
			data.append("categorie", categorie);
			data.append("filiere", filiere);
			data.append("niveau", niveau);
			data.append("semestre", semestre);
			data.append("annee", annee);

			if (fichierPDF) {
				data.append("pdf", fichierPDF);
			}

			if (editingId) {

				const response = await axios.put(
					`${backendUrl}/api/resultat/update/${editingId}`,
					data,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				console.log('=========== update =================');
				console.log(response.data);
				console.log('====================================');

				if (response.data.success) {
					toast.success("Résultat modifié avec succès");
					fetchResultats();
				}

			} else {

				const response = await axios.post(
					`${backendUrl}/api/resultat/create`,
					data,
					{
						headers: {
							"Content-Type": "multipart/form-data",
						},
					}
				);

				if (response.data.success) {
					toast.success("Résultat ajouté avec succès");
					fetchResultats();
				}
			}

			resetForm();
		} catch (error: any) {
			console.error("Erreur submit:", error);
			toast.error(
				error.response?.data?.message ||"Erreur lors de l'enregistrement"
			);
		} finally {
			setIsLoading(false);
		}
	};

	// PRÉPARER LA MODIFICATION
	const handleEdit = (r: Resultat) => {
		setFormData({
			categorie: r.categorie,
			filiere: r.filiere,
			niveau: r.niveau,
			semestre: r.semestre.toString(),
			annee: r.annee,
			fichierPDF: null,
		});
		setEditingId(r._id);
		setIsDialogOpen(true);
	};

	// SUPPRIMER UN RÉSULTAT
	const handleDelete = async (id: string) => {

		try {
			setIsLoading(true);

			const response = await axios.delete(
				`${backendUrl}/api/resultat/remove/${id}`);

			if (response.data.success) {
				toast.success("Résultat supprimé");
				fetchResultats();
			}
		} catch (error: any) {
			console.error("Erreur delete:", error);
			toast.error(
				error.response?.data?.message || "Erreur lors de la suppression"
			);
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewPdf = (url: string) => {
		toast.info("Ouverture du document...");
		window.open(url, "_blank");
	};

	const resetForm = () => {
		setFormData({
			categorie: "Ordinaire",
			filiere: "",
			niveau: "",
			semestre: "",
			annee: "",
			fichierPDF: null,
		});
		setEditingId(null);
		setIsDialogOpen(false);
	};

	const annees = Array.from({ length: 100 }, (_, i) => 2000 + i);

	return (
		<DashboardLayout>
			<div className="min-h-screen">
				<div className="p-6 lg:p-8 max-w-7xl mx-auto">
					{/* HEADER */}
					<div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
						<div>
							<h1 className="text-3xl font-bold text-gray-900 mb-1">
								Résultats scolaires
							</h1>
							<p className="text-gray-600 text-sm">
								Gérez les fichiers PDF des contrôles,
								interrogations et examens
							</p>
						</div>

						<Dialog
							open={isDialogOpen}
							onOpenChange={setIsDialogOpen}
						>
							<DialogTrigger asChild>
								<Button className="gap-2 bg-primary hover:scale-75 transition-all duration-200 cursor-pointer text-white mt-4 sm:mt-0">
									<Plus className="w-4 h-4" /> Ajouter un
									résultat
								</Button>
							</DialogTrigger>

							<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>
										{editingId
											? "Modifier le résultat"
											: "Nouveau résultat"}
									</DialogTitle>
									<DialogDescription>
										Téléversez le fichier PDF correspondant
										à la filière et au semestre.
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-4">
									<div>
										<Label>Session</Label>
										<Select
											value={formData.categorie}
											onValueChange={(v) =>
												setFormData({
													...formData,
													categorie: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionnez un type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Ordinaire">
													Ordinaire
												</SelectItem>
												<SelectItem value="Rattrapage">
													Rattrapage
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* <div>
										<Label>Filière</Label>
										<Input
											value={formData.filiere}
											onChange={(e) =>
												setFormData({ ...formData, filiere: e.target.value })
											}
											placeholder="Ex: Informatique, Gestion..."
										/>
									</div> */}
									<div>
										<Label>Filière</Label>
										<Select
											value={formData.filiere}
											onValueChange={(v) =>
												setFormData({
													...formData,
													filiere: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionnez une filière" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Génie industriel">
													Génie industriel
												</SelectItem>
												<SelectItem value="Génie mécanique">
													Génie mécanique
												</SelectItem>
												<SelectItem value="Génie électronique">
													Génie électronique
												</SelectItem>
												<SelectItem value="Génie électrotechnique">
													Génie électrotechnique
												</SelectItem>
												<SelectItem value="Génie civil">
													Génie civil
												</SelectItem>
												<SelectItem value="Informatique">
													Informatique
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Niveau</Label>
										<Select
											value={formData.niveau}
											onValueChange={(v) =>
												setFormData({
													...formData,
													niveau: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Ex: Licence 1" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Licence 1">
													Licence 1
												</SelectItem>
												<SelectItem value="Licence 2">
													Licence 2
												</SelectItem>
												<SelectItem value="Licence 3">
													Licence 3
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Semestre</Label>
										<Select
											value={formData.semestre}
											onValueChange={(v) =>
												setFormData({
													...formData,
													semestre: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Ex: Semestre 1" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													Semestre 1
												</SelectItem>
												<SelectItem value="2">
													Semestre 2
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Année académique</Label>
										<Select
											value={formData.annee}
											onValueChange={(v) =>
												setFormData({
													...formData,
													annee: v,
												})
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Ex: 2024-2025" />
											</SelectTrigger>
											<SelectContent>
												{annees.map((year) => (
													<SelectItem
														key={year}
														value={`${year}-${
															year + 1
														}`}
													>
														{year}-{year + 1}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>
											Fichier PDF{" "}
											{!editingId && (
												<span className="text-red-500">
													*
												</span>
											)}
										</Label>
										<Input
											type="file"
											accept="application/pdf"
											onChange={(e) =>
												setFormData({
													...formData,
													fichierPDF:
														e.target.files?.[0] ||
														null,
												})
											}
										/>
										{formData.fichierPDF && (
											<p className="text-xs text-gray-600 mt-1">
												{formData.fichierPDF.name}
											</p>
										)}
										{editingId && (
											<p className="text-xs text-gray-500 mt-1">
												Laisser vide pour conserver le
												PDF actuel
											</p>
										)}
									</div>

									<div className="flex gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={resetForm}
											className="flex-1 hover:bg-red-600"
											disabled={isLoading}
										>
											Annuler
										</Button>
										<Button
											onClick={handleSubmit}
											className="flex-1 bg-primary hover:scale-90 transition-all duration-200 text-white"
											disabled={isLoading}
										>
											{isLoading ? (
												<Loader2 className="w-4 h-4 animate-spin" />
											) : editingId ? (
												"Modifier"
											) : (
												"Ajouter"
											)}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>

					{/* LOADER */}
					{isLoading && resultats.length === 0 && (
						<div className="flex justify-center items-center h-64">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					)}

					{/* LISTE DES RÉSULTATS */}
					{!isLoading && resultats.length === 0 && (
						<div className="text-center bg-white py-[8rem] rounded-md">
							<FileText className="w-16 h-16 mx-auto text-gray-400 mb-4" />
							<p className="text-gray-500">
								Aucun résultat pour le moment
							</p>
						</div>
					)}

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{resultats.map((r) => (
							<Card
								key={r._id}
								className="p-6 shadow-md hover:shadow-lg transition"
							>
								<div className="flex justify-between items-start mb-4">
									<div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center">
										<FileText className="w-6 h-6" />
									</div>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleEdit(r)}
											className="p-2 bg-slate-200 hover:bg-primary"
											disabled={isLoading}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleDelete(r._id)}
											className="p-2 bg-slate-200 hover:bg-red-100"
											disabled={isLoading}
										>
											<Trash2 className="w-4 h-4 text-red-600" />
										</Button>
									</div>
								</div>

								<div className="space-y-1">
									<h3 className="font-semibold text-lg text-gray-900">
										{r.categorie}
									</h3>
									<p className="text-sm text-gray-600">
										Filière : {r.filiere}
									</p>
									<p className="text-sm text-gray-600">
										Niveau : {r.niveau}
									</p>
									<p className="text-sm text-gray-600">
										Semestre : {r.semestre}
									</p>
									<p className="text-sm text-gray-600">
										Année : {r.annee}
									</p>
									<p className="text-xs text-gray-500">
										Publié le{" "}
										{new Date(
											r.createdAt
										).toLocaleDateString("fr-FR")}
									</p>
								</div>

								<div className="flex gap-2 mt-4">
									<Button
										variant="outline"
										className="flex-1 hover:bg-primary hover:text-white"
										onClick={() => handleViewPdf(r.pdf)}
									>
										<Eye className="w-6 h-6 mr-2" /> Lire
									</Button>
									<Button
										variant="outline"
										className="flex-1"
										asChild
									>
										<a
											href={r.pdf}
											download
											target="_blank"
											rel="noopener noreferrer"
										>
											<Download className="w-4 h-4 mr-2" />{" "}
											Télécharger
										</a>
									</Button>
								</div>
							</Card>
						))}
					</div>

					{/* PDF VIEWER MODAL */}
					{isPdfViewerOpen && (
						<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
							<div className="bg-white rounded-lg w-full max-w-5xl h-[90vh] flex flex-col">
								<div className="flex justify-between items-center p-4 border-b">
									<h2 className="text-xl font-semibold">
										Visualisation du PDF
									</h2>
									<Button
										variant="ghost"
										size="icon"
										onClick={() =>
											setIsPdfViewerOpen(false)
										}
									>
										<X className="w-5 h-5" />
									</Button>
								</div>
								<div className="flex-1 overflow-hidden">
									<iframe
										src={currentPdf}
										className="w-full h-full"
										title="PDF Viewer"
									/>
								</div>
							</div>
						</div>
					)}
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Resultats;
