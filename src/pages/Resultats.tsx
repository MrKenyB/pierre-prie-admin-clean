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
	Upload,
	Lock,
	Unlock,
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
import { Checkbox } from "@/components/ui/checkbox";
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
	const [pdfPreview, setPdfPreview] = useState<string | null>(null);

	const { backendUrl } = usePierreHook();
	const [formData, setFormData] = useState({
		categorie: "Ordinaire",
		filiere: "",
		niveau: "",
		semestre: "",
		annee: "",
		fichierPDF: null as File | null,
		security: false,
		password: "",
	});

	useEffect(() => {
		fetchResultats();
	}, []);

	// Nettoyer l'URL de preview quand le composant se démonte
	useEffect(() => {
		return () => {
			if (pdfPreview) URL.revokeObjectURL(pdfPreview);
		};
	}, [pdfPreview]);

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

	const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (file.type !== "application/pdf") {
				toast.error("Veuillez sélectionner un fichier PDF valide");
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				toast.error("Le fichier ne doit pas dépasser 10 Mo");
				return;
			}

			// Nettoyer l'ancienne preview
			if (pdfPreview && !pdfPreview.startsWith("http")) {
				URL.revokeObjectURL(pdfPreview);
			}

			// Créer une nouvelle preview
			const previewUrl = URL.createObjectURL(file);
			setPdfPreview(previewUrl);
			setFormData({ ...formData, fichierPDF: file });
		}
	};

	const removePdfPreview = () => {
		if (pdfPreview && !pdfPreview.startsWith("http")) {
			URL.revokeObjectURL(pdfPreview);
		}
		setPdfPreview(null);
		setFormData({ ...formData, fichierPDF: null });
	};

	// CRÉER OU MODIFIER UN RÉSULTAT
	const handleSubmit = async () => {
		const { categorie, filiere, niveau, semestre, annee, fichierPDF, security, password } =
			formData;

		if (!filiere || !niveau || !semestre || !annee) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}

		// Si création, le PDF est obligatoire
		if (!editingId && !fichierPDF) {
			toast.error("Veuillez sélectionner un fichier PDF");
			return;
		}

		// Vérifier le mot de passe si sécurité activée
		if (security && !password.trim()) {
			toast.error("Veuillez entrer un mot de passe");
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
			data.append("security", security.toString());
			
			if (security) {
				data.append("password", password);
			}

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

				console.log("=========== update =================");
				console.log(response.data);
				console.log("====================================");

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
				error.response?.data?.message ||
					"Erreur lors de l'enregistrement"
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
			security: r.security || false,
			password: "",
		});
		setEditingId(r._id);
		
		if (r.pdf) {
			setPdfPreview(r.pdf);
		}
		
		setIsDialogOpen(true);
	};

	// SUPPRIMER UN RÉSULTAT
	const handleDelete = async (id: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer ce résultat ?")) {
			return;
		}

		try {
			setIsLoading(true);

			const response = await axios.delete(
				`${backendUrl}/api/resultat/remove/${id}`
			);

			if (response.data.success) {
				toast.success("Résultat supprimé");
				fetchResultats();
			}
		} catch (error: any) {
			console.error("Erreur delete:", error);
			toast.error(
				error.response?.data?.message ||
					"Erreur lors de la suppression"
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
			security: false,
			password: "",
		});
		setEditingId(null);
		setIsDialogOpen(false);

		// Nettoyer la preview
		if (pdfPreview && !pdfPreview.startsWith("http")) {
			URL.revokeObjectURL(pdfPreview);
		}
		setPdfPreview(null);
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
							onOpenChange={(open) => {
								setIsDialogOpen(open);
								if (!open) resetForm();
							}}
						>
							<DialogTrigger asChild>
								<Button className="gap-2 bg-primary hover:scale-75 transition-all duration-200 cursor-pointer text-white mt-4 sm:mt-0">
									<Plus className="w-4 h-4" /> Ajouter un
									résultat
								</Button>
							</DialogTrigger>

							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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

									{/* Section PDF avec Preview */}
									<div className="space-y-2">
										<Label>
											Fichier PDF{" "}
											{!editingId && (
												<span className="text-red-500">
													*
												</span>
											)}
										</Label>

										{!pdfPreview ? (
											<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
												<label
													htmlFor="pdf"
													className="cursor-pointer"
												>
													<div className="flex flex-col items-center gap-2">
														<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
															<FileText className="w-6 h-6 text-gray-400" />
														</div>
														<div>
															<p className="text-sm font-medium text-gray-700">
																Cliquez pour
																télécharger un
																PDF
															</p>
															<p className="text-xs text-gray-500 mt-1">
																PDF (max. 10
																Mo)
															</p>
														</div>
													</div>
												</label>
												<Input
													id="pdf"
													type="file"
													accept="application/pdf"
													onChange={handlePdfChange}
													className="hidden"
													required={!editingId}
												/>
											</div>
										) : (
											<div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
												<div className="bg-gray-100 p-4 flex items-center justify-center min-h-[200px]">
													<div className="text-center">
														<FileText className="w-16 h-16 text-primary mx-auto mb-2" />
														<p className="text-sm font-medium text-gray-700">
															{formData
																.fichierPDF
																?.name ||
																"Document PDF"}
														</p>
														<p className="text-xs text-gray-500 mt-1">
															Aperçu disponible
															après
															téléchargement
														</p>
													</div>
												</div>
												<div className="absolute top-2 right-2 flex gap-2">
													<label
														htmlFor="pdf"
														className="cursor-pointer"
													>
														<div className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors">
															<Upload className="w-5 h-5 text-gray-700" />
														</div>
													</label>
													<button
														type="button"
														onClick={
															removePdfPreview
														}
														className="bg-red-500/90 hover:bg-red-500 p-2 rounded-lg shadow-lg transition-colors"
													>
														<X className="w-5 h-5 text-white" />
													</button>
												</div>
												<Input
													id="pdf"
													type="file"
													accept="application/pdf"
													onChange={handlePdfChange}
													className="hidden"
												/>
											</div>
										)}

										{formData.fichierPDF && (
											<p className="text-sm text-muted-foreground flex items-center gap-1">
												<FileText className="w-4 h-4" />
												{formData.fichierPDF.name} (
												{(
													formData.fichierPDF.size /
													1024 /
													1024
												).toFixed(2)}{" "}
												Mo)
											</p>
										)}
									</div>

									{/* Section Sécurité */}
									<div className="space-y-3 pt-2 border-t">
										<div className="flex items-center space-x-2">
											<Checkbox
												id="security"
												checked={formData.security}
												onCheckedChange={(checked) =>
													setFormData({
														...formData,
														security:
															checked as boolean,
														password: checked
															? formData.password
															: "",
													})
												}
											/>
											<Label
												htmlFor="security"
												className="flex items-center gap-2 cursor-pointer"
											>
												{formData.security ? (
													<Lock className="w-4 h-4 text-primary" />
												) : (
													<Unlock className="w-4 h-4 text-gray-400" />
												)}
												Sécuriser le fichier avec un
												mot de passe
											</Label>
										</div>

										{formData.security && (
											<div className="pl-6 space-y-2 animate-in slide-in-from-top-2">
												<Label htmlFor="password">
													Mot de passe *
												</Label>
												<Input
													id="password"
													type="password"
													value={formData.password}
													onChange={(e) =>
														setFormData({
															...formData,
															password:
																e.target.value,
														})
													}
													placeholder="Entrez un mot de passe sécurisé"
													required={
														formData.security
													}
													className="border-primary/50 focus:border-primary"
												/>
												<p className="text-xs text-gray-500">
													Ce mot de passe sera
													nécessaire pour accéder au
													document
												</p>
											</div>
										)}
									</div>

									<div className="flex gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={resetForm}
											className="flex-1 hover:bg-red-600 hover:text-white"
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
									<div className="w-12 h-12 bg-primary text-white rounded-lg flex items-center justify-center relative">
										<FileText className="w-6 h-6" />
										{r.security && (
											<div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1">
												<Lock className="w-3 h-3 text-white" />
											</div>
										)}
									</div>
									<div className="flex gap-2">
										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleEdit(r)}
											className="p-2 bg-slate-200 hover:bg-primary hover:text-white"
											disabled={isLoading}
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={() =>
												handleDelete(r._id)
											}
											className="p-2 bg-slate-200 hover:bg-red-100"
											disabled={isLoading}
										>
											<Trash2 className="w-4 h-4 text-red-600" />
										</Button>
									</div>
								</div>

								<div className="space-y-1">
									<h3 className="font-semibold text-lg text-gray-900 flex items-center gap-2">
										{r.categorie}
										{r.security && (
											<Lock className="w-4 h-4 text-amber-500" />
										)}
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