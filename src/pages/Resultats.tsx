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
	ShieldAlert,
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

	// États pour la modal de mot de passe
	const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
	const [passwordInput, setPasswordInput] = useState("");
	const [selectedResultatId, setSelectedResultatId] = useState<string>("");
	const [isVerifying, setIsVerifying] = useState(false);

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

			if (pdfPreview && !pdfPreview.startsWith("http")) {
				URL.revokeObjectURL(pdfPreview);
			}

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

	const handleSubmit = async () => {
		const { categorie, filiere, niveau, semestre, annee, fichierPDF, security, password } =
			formData;

		if (!filiere || !niveau || !semestre || !annee) {
			toast.error("Veuillez remplir tous les champs");
			return;
		}

		if (!editingId && !fichierPDF) {
			toast.error("Veuillez sélectionner un fichier PDF");
			return;
		}

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

	// ✅ Gestion de l'accès au PDF (sécurisé ou non)
	const handleViewPdf = (resultat: Resultat) => {
		if (resultat.security) {
			// Document sécurisé : ouvrir la modal de mot de passe
			setSelectedResultatId(resultat._id);
			setPasswordInput("");
			setIsPasswordDialogOpen(true);
		} else {
			// Document non sécurisé : ouvrir directement
			if (resultat.pdf) {
				toast.info("Ouverture du document...");
				window.open(resultat.pdf, "_blank");
			} else {
				toast.error("URL du PDF non disponible");
			}
		}
	};

	const handleVerifyPassword = async () => {
		if (!passwordInput.trim()) {
			toast.error("Veuillez entrer le mot de passe");
			return;
		}

		try {
			setIsVerifying(true);

			const response = await axios.post(
				`${backendUrl}/api/resultat/verify-password/${selectedResultatId}`,
				{ password: passwordInput }
			);

			if (response.data.success && response.data.pdf) {
				toast.success("Accès autorisé !");
				setIsPasswordDialogOpen(false);
				setPasswordInput("");
				
				// Ouvrir le PDF dans une nouvelle fenêtre
				setTimeout(() => {
					window.open(response.data.pdf, "_blank");
				}, 300);
			}
		} catch (error: any) {
			console.error("Erreur vérification:", error);
			toast.error(
				error.response?.data?.message || "Mot de passe incorrect"
			);
		} finally {
			setIsVerifying(false);
		}
	};

	// ✅ Gestion du téléchargement
	const handleDownload = (resultat: Resultat) => {
		if (resultat.security) {
			// Document sécurisé : demander le mot de passe
			setSelectedResultatId(resultat._id);
			setPasswordInput("");
			setIsPasswordDialogOpen(true);
		} else {
			// Document non sécurisé : télécharger directement
			if (resultat.pdf) {
				toast.info("Téléchargement en cours...");
				window.open(resultat.pdf, "_blank");
			}
		}
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
										à la filière et au trimestre.
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-4">
									<div>
										<Label>Type</Label>
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
												<SelectItem value="Examen">
													Examen
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Série</Label>
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
												<SelectItem value="Tronc commun industriel (STCI)">
													Tronc commun industriel (STCI)
												</SelectItem>
												<SelectItem value="Système d'information et du numérique">
													Système d'information et du numérique
												</SelectItem>
												<SelectItem value="Génie civil (F4)">
													Génie civil (F4)
												</SelectItem>
												<SelectItem value="Génie industriel (série E)">
													Génie industriel (série E)
												</SelectItem>
												<SelectItem value="Génie mécanique (série F1)">
													Génie mécanique (série F1)
												</SelectItem>
												<SelectItem value="Génie électronique (série F2)">
													Génie électronique (série F2)
												</SelectItem>
												<SelectItem value="Génie électrotechnique (série F3)">
													Génie électrotechnique (série F3)
												</SelectItem>
												<SelectItem value="Réseaux et télécommunication (H5)">
													Réseaux et télécommunication (H5)
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Classe</Label>
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
												<SelectValue placeholder="Ex: Seconde" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Seconde">
													Seconde
												</SelectItem>
												<SelectItem value="Première">
													Première
												</SelectItem>
												<SelectItem value="Terminale">
													Terminale
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div>
										<Label>Trimestre</Label>
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
												<SelectValue placeholder="Selectionner un trimestre" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">
													Premier trimestre
												</SelectItem>
												<SelectItem value="2">
													Deuxième trimestre
												</SelectItem>
												<SelectItem value="3">
													Troisième trimestre
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
													className="border-primary/50 outline-none focus:border-primary"
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
								className={`group relative flex flex-col h-full shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
									r.security 
										? 'border-2 border-amber-300 bg-gradient-to-br from-amber-50/30 to-white' 
										: 'border border-gray-200 hover:border-primary/30'
								}`}
							>
								{/* Badge sécurité en haut à droite */}
								{r.security && (
									<div className="absolute top-0 right-0 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-3 py-1 rounded-bl-lg shadow-md flex items-center gap-1 z-10">
										<Lock className="w-3 h-3" />
										<span className="text-xs font-semibold">Protégé</span>
									</div>
								)}

								{/* En-tête avec icône et actions */}
								<div className="p-6 pb-4">
									<div className="flex justify-between items-start mb-4">
										<div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
											r.security 
												? 'bg-gradient-to-br from-amber-400 to-amber-600' 
												: 'bg-gradient-to-br from-primary to-primary/80'
										}`}>
											<FileText className="w-7 h-7 text-white" />
										</div>
										<div className="flex gap-1.5">
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleEdit(r)}
												className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-primary hover:text-white transition-all duration-200"
												disabled={isLoading}
											>
												<Edit className="w-4 h-4" />
											</Button>
											<Button
												size="icon"
												variant="ghost"
												onClick={() => handleDelete(r._id)}
												className="h-9 w-9 rounded-lg bg-gray-100 hover:bg-red-500 hover:text-white transition-all duration-200"
												disabled={isLoading}
											>
												<Trash2 className="w-4 h-4" />
											</Button>
										</div>
									</div>

									{/* Titre */}
									<h3 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2 line-clamp-1">
										{r.categorie}
									</h3>

									{/* Informations principales */}
									<div className="space-y-2 mb-4">
										<div className="flex items-start gap-2">
											<span className="text-xs font-semibold text-gray-500 min-w-[70px]">Filière :</span>
											<span className="text-sm text-gray-700 font-medium line-clamp-2">{r.filiere}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs font-semibold text-gray-500 min-w-[70px]">Niveau :</span>
											<span className="text-sm text-gray-700">{r.niveau}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs font-semibold text-gray-500 min-w-[70px]">Trimestre :</span>
											<span className="text-sm text-gray-700">T{r.semestre}</span>
										</div>
										<div className="flex items-center gap-2">
											<span className="text-xs font-semibold text-gray-500 min-w-[70px]">Année :</span>
											<span className="text-sm text-gray-700 font-medium">{r.annee}</span>
										</div>
									</div>

									{/* Date de publication */}
									<div className="pt-3 border-t border-gray-100">
										<p className="text-xs text-gray-500 flex items-center gap-1">
											<span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
											Publié le {new Date(r.createdAt).toLocaleDateString("fr-FR", { 
												day: '2-digit', 
												month: 'short', 
												year: 'numeric' 
											})}
										</p>
									</div>
								</div>

								{/* Spacer pour pousser les boutons en bas */}
								<div className="flex-grow"></div>

								{/* Boutons d'action en bas */}
								<div className="p-6 pt-0 mt-auto">
									<div className="flex gap-2">
										<Button
											variant="outline"
											className={`flex-1 h-11 font-semibold transition-all duration-200 ${
												r.security
													? 'border-amber-300 text-amber-700 hover:bg-amber-500 hover:text-white hover:border-amber-500'
													: 'border-primary/30 text-primary hover:bg-primary hover:text-white hover:border-primary'
											}`}
											onClick={() => handleViewPdf(r)}
										>
											{r.security ? (
												<>
													<Lock className="w-4 h-4 mr-2" />
													Déverrouiller
												</>
											) : (
												<>
													<Eye className="w-4 h-4 mr-2" />
													Consulter
												</>
											)}
										</Button>
										<Button
											variant="outline"
											size="icon"
											className="h-11 w-11 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200"
											onClick={() => handleDownload(r)}
										>
											<Download className="w-5 h-5 text-gray-600" />
										</Button>
									</div>
								</div>
							</Card>
						))}
					</div>

					{/* ✅ MODAL DE MOT DE PASSE */}
					<Dialog
						open={isPasswordDialogOpen}
						onOpenChange={(open) => {
							setIsPasswordDialogOpen(open);
							if (!open) {
								setPasswordInput("");
								setSelectedResultatId("");
							}
						}}
					>
						<DialogContent className="max-w-md">
							<DialogHeader>
								<DialogTitle className="flex items-center gap-2">
									<Lock className="w-5 h-5 text-primary" />
									Document protégé
								</DialogTitle>
								<DialogDescription>
									Ce document est protégé par un mot de passe. Veuillez entrer le mot de passe pour y accéder.
								</DialogDescription>
							</DialogHeader>

							<div className="space-y-4 py-4">
								<div className="space-y-2">
									<Label htmlFor="access-password">
										Mot de passe
									</Label>
									<Input
										id="access-password"
										type="password"
										value={passwordInput}
										onChange={(e) =>
											setPasswordInput(e.target.value)
										}
										placeholder="Entrez le mot de passe"
										onKeyDown={(e) => {
											if (e.key === "Enter") {
												handleVerifyPassword();
											}
										}}
										disabled={isVerifying}
										autoFocus
										className="outline-0"
									/>
								</div>

								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsPasswordDialogOpen(false);
											setPasswordInput("");
										}}
										className="flex-1 cursor-pointer hover:bg-red-500"
										disabled={isVerifying}
									>
										Annuler
									</Button>
									<Button
										onClick={handleVerifyPassword}
										className="flex-1 bg-primary hover:bg-primary/75 text-white"
										disabled={isVerifying || !passwordInput.trim()}
									>
										{isVerifying ? (
											<>
												<Loader2 className="w-4 h-4 animate-spin mr-2" />
												Vérification...
											</>
										) : (
											<>
												<Unlock className="w-4 h-4 mr-2" />
												Accéder
											</>
										)}
									</Button>
								</div>
							</div>
						</DialogContent>
					</Dialog>

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