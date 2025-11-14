/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { Plus, Calendar, Trash2, Edit, X, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Evenement } from "@/types";
import { usePierreHook } from "@/hooks/pierreHook";
import axios from "axios";

const Evenements = () => {
	axios.defaults.withCredentials = true;

	const [evenements, setEvenements] = useState<Evenement[]>([]);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [loading, setLoading] = useState(false);

	const { backendUrl } = usePierreHook();

	const [formData, setFormData] = useState({
		titre: "",
		description: "",
		image: null as File | null,
		imagePreview: "",
	});

	// Charger les événements depuis l'API
	const loadEvenements = async () => {
    try {
      setLoading(true)
			const response = await axios.get(`${backendUrl}/api/news/all`);
			if (response.data.success) {
				const data = response.data.actualites;
				if (data && data.length > 0) {
					setEvenements(data);
				} else {
					setEvenements([]);
				}
			}
		} catch (error) {
			console.error("Erreur lors du chargement:", error);
			toast.error("Erreur lors du chargement des événements");
    } finally {
      setLoading(false)
    }
	};

	useEffect(() => {
		loadEvenements();
	}, []);

	// créer un événement
	const handleCreate = async () => {
		const { titre, description, image } = formData;

		if (!titre || !description) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (!image) {
			toast.error("Veuillez sélectionner une image");
			return;
		}

		try {
			setIsLoading(true);

			const formDataToSend = new FormData();
			formDataToSend.append("titre", titre);
			formDataToSend.append("description", description);
			formDataToSend.append("image", image);

			const config = {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			};

			const response = await axios.post(
				`${backendUrl}/api/news/create`,
				formDataToSend,
				config
			);

			if (response.data.success) {
				toast.success("Événement créé avec succès");
				resetForm();
				loadEvenements();
			}
		} catch (error: any) {
			console.error("Erreur:", error);
			const errorMessage =
				error.response?.data?.message ||
				"Erreur lors de la création";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleUpdate = async () => {
		const { titre, description, image } = formData;

		if (!titre || !description) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (!editingId) {
			toast.error("ID de l'événement manquant");
			return;
		}

		try {
			setIsLoading(true);

			const formDataToSend = new FormData();
			formDataToSend.append("titre", titre);
			formDataToSend.append("description", description);

			if (image) {
				formDataToSend.append("image", image);
			}

			const config = {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			};

			const response = await axios.put(
				`${backendUrl}/api/news/update/${editingId}`,
				formDataToSend,
				config
			);

			if (response.data.success) {
				toast.success("Événement modifié avec succès");
				resetForm();
				loadEvenements();
			}
		} catch (error: any) {
			console.error("Erreur:", error);
			const errorMessage =
				error.response?.data?.message ||
				"Erreur lors de la modification";
			toast.error(errorMessage);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = async () => {
		if (editingId) {
			await handleUpdate();
		} else {
			await handleCreate();
		}
	};

	const handleEdit = (evenement: Evenement) => {
		setFormData({
			titre: evenement.titre,
			description: evenement.description,
			image: null,
			imagePreview: evenement.image,
		});
		setEditingId(evenement._id);
		setIsDialogOpen(true);
	};

	const handleDelete = async (id: string) => {
		
		try {
			const response = await axios.delete(
				`${backendUrl}/api/news/remove/${id}`
			);

			if (response.data.success) {
				toast.success("Événement supprimé avec succès");
				loadEvenements();
			}
		} catch (error: any) {
			console.error(error);
			const errorMessage =
				error.response?.data?.message ||
				"Erreur lors de la suppression";
			toast.error(errorMessage);
		}
	};

	const resetForm = () => {
		setFormData({
			titre: "",
			description: "",
			image: null,
			imagePreview: "",
		});
		setEditingId(null);
		setIsDialogOpen(false);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setFormData({
				...formData,
				image: file,
				imagePreview: URL.createObjectURL(file),
			});
		}
	};

	const handleRemoveImage = () => {
		setFormData({
			...formData,
			image: null,
			imagePreview: "",
		});
		const fileInput = document.getElementById("image") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
	};

	return (
		<DashboardLayout>
			<div className="p-6 md:p-8">
				<div className="max-w-7xl mx-auto space-y-6">
					{/* HEADER */}
					<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
						<div>
							<h1 className="text-2xl md:text-3xl font-bold text-gray-900">
								Événements
							</h1>
							<p className="text-gray-600 mt-1">
								Gérez les actualités et annonces
							</p>
						</div>

						<Dialog
							open={isDialogOpen}
							onOpenChange={setIsDialogOpen}
						>
							<DialogTrigger asChild>
								<Button
									className="bg-green-600 hover:bg-green-700 text-white"
									onClick={() => resetForm()}
								>
									<Plus className="w-4 h-4 mr-2" />
									Ajouter un événement
								</Button>
							</DialogTrigger>

							<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
								<DialogHeader>
									<DialogTitle>
										{editingId
											? "Modifier l'événement"
											: "Nouvel événement"}
									</DialogTitle>
									<DialogDescription>
										Remplissez les informations de
										l'événement
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-4 py-4">
									<div className="space-y-2">
										<Label htmlFor="titre">Titre *</Label>
										<Input
											id="titre"
											value={formData.titre}
											onChange={(e) =>
												setFormData({
													...formData,
													titre: e.target.value,
												})
											}
											placeholder="Ex: Journée portes ouvertes"
										/>
									</div>

									{/* Description */}
									<div className="space-y-2">
										<Label htmlFor="description">
											Description *
										</Label>
										<Textarea
											id="description"
											value={formData.description}
											onChange={(e) =>
												setFormData({
													...formData,
													description: e.target.value,
												})
											}
											placeholder="Décrivez l'événement..."
											rows={4}
										/>
									</div>

									{/* Image */}
									<div className="space-y-2">
										<Label htmlFor="image">
											Image {!editingId && "*"}
										</Label>
										<Input
											id="image"
											type="file"
											accept="image/*"
											onChange={handleImageChange}
										/>
										{formData.imagePreview && (
											<div className="mt-2 relative">
												<img
													src={formData.imagePreview}
													alt="Aperçu"
													className="w-full h-48 object-cover rounded-lg"
												/>
												<Button
													type="button"
													size="icon"
													variant="destructive"
													className="absolute top-2 right-2 h-8 w-8"
													onClick={handleRemoveImage}
													title="Supprimer l'image"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										)}
										<p className="text-xs text-gray-500">
											{editingId
												? "Laisser vide pour conserver l'image actuelle"
												: "Image requise (formats acceptés: JPG, PNG, WEBP, GIF)"}
										</p>
									</div>

									<div className="flex gap-2 pt-4">
										<Button
											type="button"
											variant="outline"
											onClick={resetForm}
											className="flex-1"
											disabled={isLoading}
										>
											Annuler
										</Button>
										<Button
											onClick={handleSubmit}
											className="flex-1 bg-green-600 hover:bg-green-700 text-white"
											disabled={isLoading}
										>
											{isLoading ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin mr-2" />
													{editingId
														? "Modification..."
														: "Création..."}
												</>
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
					{loading && evenements.length === 0 && (
						<div className="flex justify-center items-center h-[80vh]">
							<Loader2 className="w-8 h-8 animate-spin text-primary" />
						</div>
					)}

					{/* LISTE DES ÉVÉNEMENTS */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{evenements.map((evenement) => (
							<Card
								key={evenement.id}
								className="overflow-hidden shadow-md hover:shadow-lg transition"
							>
								{evenement.image && (
									<div className="w-full h-48 bg-gray-200 relative">
										<img
											src={evenement.image}
											alt={evenement.titre}
											className="w-full h-full object-cover"
										/>

										<div className="w-full absolute top-3 right-2 flex items-start justify-between px-3">
											<div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
												<Calendar className="w-5 h-5 text-white" />
											</div>
											<div className="flex gap-2">
												<Button
													size="icon"
													variant="ghost"
													className="bg-white/90 hover:bg-primary"
													onClick={() =>
														handleEdit(evenement)
													}
													title="Modifier"
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													size="icon"
													variant="ghost"
													className="bg-white/90 hover:bg-white"
													onClick={() =>
														handleDelete(
															evenement._id
														)
													}
													title="Supprimer"
												>
													<Trash2 className="w-4 h-4 text-red-600" />
												</Button>
											</div>
										</div>
									</div>
								)}
								<div className="p-6">
									<h3 className="font-semibold text-lg mb-2 text-gray-900">
										{evenement.titre}
									</h3>
									<p className="text-sm text-gray-600 mb-3 line-clamp-3">
										{evenement.description}
									</p>
									<p className="text-xs text-gray-500">
										Publié le{" "}
										{new Date(
											evenement.createdAt
										).toLocaleDateString("fr-FR", {
											day: "2-digit",
											month: "long",
											year: "numeric",
										})}
									</p>
								</div>
							</Card>
						))}

						{loading==false && evenements.length === 0 && (
							<div className="col-span-full text-center py-[8rem] rounded-md shadow-sm bg-white">
								<Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
								<p className="text-gray-500">
									Aucun événement publié pour le moment
								</p>
								<p className="text-xs text-gray-400 mt-2">
									Cliquez sur "Ajouter un événement" pour
									commencer
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</DashboardLayout>
	);
};

export default Evenements;