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

interface Resultat {
	id: number;
	categorie: string;
	filiere: string;
	niveau: string;
	semestre: number | string;
	annee: string;
	pdf: string;
	createdAt: string;
}

const API_URL = "http://localhost:3000/api/resultats"; // ⚙️ adapte selon ton backend

const Resultats = () => {
	const [resultats, setResultats] = useState<Resultat[]>([
		{
			id: 1,
			categorie: "Examen",
			filiere: "Informatique",
			niveau: "Licence 2",
			semestre: "2",
			annee: "2024-2025",
			pdf: "/PierreP.pdf",
			createdAt: new Date().toISOString(),
		},
		{
			id: 2,
			categorie: "Contrôle",
			filiere: "Gestion",
			niveau: "Licence 1",
			semestre: "1",
			annee: "2024-2025",
			pdf: "/PierreP.pdf",
			createdAt: new Date().toISOString(),
		},
		{
			id: 3,
			categorie: "Interrogation",
			filiere: "Mathématiques",
			niveau: "Licence 3",
			semestre: "2",
			annee: "2023-2024",
			pdf: "/PierreP.pdf",
			createdAt: new Date().toISOString(),
		},
	]);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);
	const [currentPdf, setCurrentPdf] = useState<string>("");
	const [editingId, setEditingId] = useState<number | null>(null);
	const [formData, setFormData] = useState({
		categorie: "Contrôle",
		filiere: "",
		niveau: "",
		semestre: "",
		annee: "",
		fichierPDF: null as File | null,
	});

	const handleSubmit = () => {
		const { categorie, filiere, niveau, semestre, annee } = formData;

		if (!filiere || !niveau || !semestre || !annee) {
			alert("Veuillez remplir tous les champs");
			return;
		}

		if (editingId) {
			setResultats((prev) =>
				prev.map((r) =>
					r.id === editingId
						? { ...r, categorie, filiere, niveau, semestre, annee }
						: r
				)
			);
			alert("Résultat modifié avec succès");
		} else {
			const newResultat: Resultat = {
				id: Math.max(...resultats.map((r) => r.id), 0) + 1,
				categorie,
				filiere,
				niveau,
				semestre,
				annee,
				pdf: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
				createdAt: new Date().toISOString(),
			};
			setResultats((prev) => [...prev, newResultat]);
			alert("Résultat ajouté avec succès");
		}

		resetForm();
	};

	const handleEdit = (r: Resultat) => {
		setFormData({
			categorie: r.categorie,
			filiere: r.filiere,
			niveau: r.niveau,
			semestre: r.semestre.toString(),
			annee: r.annee,
			fichierPDF: null,
		});
		setEditingId(r.id);
		setIsDialogOpen(true);
	};

	const handleDelete = (id: number) => {
		if (!confirm("Supprimer ce résultat ?")) return;
		setResultats((prev) => prev.filter((r) => r.id !== id));
		alert("Résultat supprimé");
	};

	const handleViewPdf = (pdfUrl: string) => {
		setCurrentPdf(pdfUrl);
		setIsPdfViewerOpen(true);
	};

	const resetForm = () => {
		setFormData({
			categorie: "Contrôle",
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
			<div className="min-h-scree">
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

									<div>
										<Label>Filière</Label>
										<Input
											value={formData.filiere}
											onChange={(e) =>
												setFormData({
													...formData,
													filiere: e.target.value,
												})
											}
											placeholder="Ex: Informatique, Gestion..."
										/>
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
										<Label>Fichier PDF</Label>
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
									</div>

									<div className="flex gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={resetForm}
											className="flex-1 hover:bg-red-600"
										>
											Annuler
										</Button>
										<Button
											onClick={handleSubmit}
											className="flex-1 bg-primary hover:scale-90 transition-all duration-200 text-white"
										>
											{editingId ? "Modifier" : "Ajouter"}
										</Button>
									</div>
								</div>
							</DialogContent>
						</Dialog>
					</div>

					{/* LISTE DES RÉSULTATS */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{resultats.map((r) => (
							<Card
								key={r.id}
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
										>
											<Edit className="w-4 h-4" />
										</Button>
										<Button
											size="icon"
											variant="ghost"
											onClick={() => handleDelete(r.id)}
											className="p-2 bg-slate-200 hover:bg-red-100"

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
										<a href={r.pdf} download>
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
