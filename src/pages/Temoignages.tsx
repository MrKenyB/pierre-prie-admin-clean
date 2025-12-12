/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
	Plus,
	Edit,
	Trash2,
	MessageSquare,
	Loader2,
	Search,
	ChevronLeft,
	ChevronRight,
	Play,
	X,
	Eye,
	Upload,
	Image as ImageIcon,
	Video as VideoIcon,
} from "lucide-react";
import axios from "axios";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Temoignage } from "@/types";
import { toast } from "sonner";
import { usePierreHook } from "@/hooks/pierreHook";

const Temoignages = () => {
	axios.defaults.withCredentials = true;
	const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
	const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
	const [selectedTemoignage, setSelectedTemoignage] =
		useState<Temoignage | null>(null);
	const [viewTemoignage, setViewTemoignage] = useState<Temoignage | null>(
		null
	);
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const { backendUrl } = usePierreHook();
	const [formData, setFormData] = useState({
		titre: "",
		description: "",
		imageFile: null as File | null,
		videoFile: null as File | null,
	});

	// États pour les previews
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [videoPreview, setVideoPreview] = useState<string | null>(null);

	const API_URL = `${backendUrl}/api/temoignage`;

	const [currentPage, setCurrentPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const [itemsPerPage, setItemsPerPage] = useState(10);
	const [searchTerm, setSearchTerm] = useState("");

	useEffect(() => {
		loadTemoignages();
	}, [currentPage, searchTerm]);

	// Nettoyer les URLs de preview quand le composant se démonte
	useEffect(() => {
		return () => {
			if (imagePreview) URL.revokeObjectURL(imagePreview);
			if (videoPreview) URL.revokeObjectURL(videoPreview);
		};
	}, [imagePreview, videoPreview]);

	const loadTemoignages = async () => {
		setIsLoading(true);
		try {
			const queryParams = new URLSearchParams();
			queryParams.append("page", currentPage.toString());
			queryParams.append("limit", itemsPerPage.toString());

			if (searchTerm) queryParams.append("search", searchTerm);

			const response = await axios.get(
				`${API_URL}/get-all?${queryParams.toString()}`
			);

			if (response.data.success) {
				setTemoignages(response.data.temoignages || []);
				setTotalPages(response.data.pagination?.totalPages || 1);
				setTotalItems(response.data.pagination?.totalItems || 0);
				setItemsPerPage(response.data.pagination?.itemsPerPage || 10);
			}
		} catch (error) {
			toast.error("Erreur lors du chargement des témoignages");
			console.error(error);
			setTemoignages([]);
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			titre: "",
			description: "",
			imageFile: null,
			videoFile: null,
		});
		setSelectedTemoignage(null);
		
		// Nettoyer les previews
		if (imagePreview) {
			URL.revokeObjectURL(imagePreview);
			setImagePreview(null);
		}
		if (videoPreview) {
			URL.revokeObjectURL(videoPreview);
			setVideoPreview(null);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.titre || !formData.description) {
			toast.error("Veuillez remplir tous les champs obligatoires");
			return;
		}

		if (!selectedTemoignage && !formData.imageFile) {
			toast.error("Une image est requise pour créer un témoignage");
			return;
		}

		setIsSubmitting(true);
		try {
			const submitFormData = new FormData();
			submitFormData.append("titre", formData.titre);
			submitFormData.append("description", formData.description);

			if (formData.imageFile) {
				submitFormData.append("image", formData.imageFile);
			}

			if (formData.videoFile) {
				submitFormData.append("video", formData.videoFile);
			}

			if (selectedTemoignage) {
				await axios.put(
					`${API_URL}/update/${selectedTemoignage._id}`,
					submitFormData
				);
				toast.success("Témoignage modifié avec succès");
			} else {
				await axios.post(`${API_URL}/create`, submitFormData);
				toast.success("Témoignage créé avec succès");
			}

			await loadTemoignages();
			setIsDialogOpen(false);
			resetForm();
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.message || "Une erreur est survenue";
			toast.error(errorMessage);
			console.error(error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (temoignage: Temoignage) => {
		setSelectedTemoignage(temoignage);
		setFormData({
			titre: temoignage.titre,
			description: temoignage.description,
			imageFile: null,
			videoFile: null,
		});
		
		// Afficher l'image existante comme preview
		if (temoignage.image) {
			setImagePreview(temoignage.image);
		}
		
		// Afficher la vidéo existante comme preview
		if (temoignage.video) {
			setVideoPreview(temoignage.video);
		}
		
		setIsDialogOpen(true);
	};

	const handleView = (temoignage: Temoignage) => {
		setViewTemoignage(temoignage);
		setIsViewDialogOpen(true);
	};

	const handlePlayVideo = (temoignage: Temoignage) => {
		setViewTemoignage(temoignage);
		setIsVideoDialogOpen(true);
	};

	const handleDelete = async () => {
		if (deleteId) {
			try {
				await axios.delete(`${API_URL}/remove/${deleteId}`);
				toast.success("Témoignage supprimé avec succès");
				await loadTemoignages();
				setIsDeleteDialogOpen(false);
				setDeleteId(null);
			} catch (error) {
				toast.error("Erreur lors de la suppression");
				console.error(error);
			}
		}
	};

	const openDeleteDialog = (id: string) => {
		setDeleteId(id);
		setIsDeleteDialogOpen(true);
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("image/")) {
				toast.error("Veuillez sélectionner une image valide");
				return;
			}
			if (file.size > 5 * 1024 * 1024) {
				toast.error("L'image ne doit pas dépasser 5 Mo");
				return;
			}
			
			// Nettoyer l'ancienne preview
			if (imagePreview && !imagePreview.startsWith('http')) {
				URL.revokeObjectURL(imagePreview);
			}
			
			// Créer une nouvelle preview
			const previewUrl = URL.createObjectURL(file);
			setImagePreview(previewUrl);
			setFormData({ ...formData, imageFile: file });
		}
	};

	const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			if (!file.type.startsWith("video/")) {
				toast.error("Veuillez sélectionner une vidéo valide");
				return;
			}
			if (file.size > 50 * 1024 * 1024) {
				toast.error("La vidéo ne doit pas dépasser 50 Mo");
				return;
			}
			
			// Nettoyer l'ancienne preview
			if (videoPreview && !videoPreview.startsWith('http')) {
				URL.revokeObjectURL(videoPreview);
			}
			
			// Créer une nouvelle preview
			const previewUrl = URL.createObjectURL(file);
			setVideoPreview(previewUrl);
			setFormData({ ...formData, videoFile: file });
		}
	};

	const removeImagePreview = () => {
		if (imagePreview && !imagePreview.startsWith('http')) {
			URL.revokeObjectURL(imagePreview);
		}
		setImagePreview(null);
		setFormData({ ...formData, imageFile: null });
	};

	const removeVideoPreview = () => {
		if (videoPreview && !videoPreview.startsWith('http')) {
			URL.revokeObjectURL(videoPreview);
		}
		setVideoPreview(null);
		setFormData({ ...formData, videoFile: null });
	};

	const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setSearchTerm(e.target.value);
		setCurrentPage(1);
	};

	const handlePageChange = (newPage: number) => {
		if (newPage >= 1 && newPage <= totalPages) {
			setCurrentPage(newPage);
		}
	};

	return (
		<DashboardLayout>
			<div className="p-4 sm:p-6 lg:p-8">
				<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-2xl sm:text-3xl font-bold text-gray-600 mb-1 sm:mb-2">
							Témoignages
						</h1>
						<p className="text-sm sm:text-base text-muted-foreground">
							Gérez les témoignages d'étudiants et anciens élèves
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
							<Button className="gap-2">
								<Plus className="w-4 h-4" />
								Nouveau témoignage
							</Button>
						</DialogTrigger>
						<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
							<DialogHeader>
								<DialogTitle>
									{selectedTemoignage
										? "Modifier le témoignage"
										: "Nouveau témoignage"}
								</DialogTitle>
								<DialogDescription>
									Remplissez les informations du témoignage
								</DialogDescription>
							</DialogHeader>

							<form onSubmit={handleSubmit} className="space-y-4">
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
										placeholder="Ex: Un parcours enrichissant"
										required
									/>
								</div>

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
										placeholder="Partagez votre expérience..."
										rows={5}
										required
									/>
								</div>

								{/* Section Image avec Preview */}
								<div className="space-y-2">
									<Label htmlFor="image">
										Image {!selectedTemoignage && "*"}
									</Label>
									
									{!imagePreview ? (
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
											<label htmlFor="image" className="cursor-pointer">
												<div className="flex flex-col items-center gap-2">
													<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
														<ImageIcon className="w-6 h-6 text-gray-400" />
													</div>
													<div>
														<p className="text-sm font-medium text-gray-700">
															Cliquez pour télécharger une image
														</p>
														<p className="text-xs text-gray-500 mt-1">
															PNG, JPG ou WEBP (max. 5 Mo)
														</p>
													</div>
												</div>
											</label>
											<Input
												id="image"
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
												required={!selectedTemoignage}
											/>
										</div>
									) : (
										<div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
											<img
												src={imagePreview}
												alt="Aperçu"
												className="w-full h-64 object-cover"
											/>
											<div className="absolute top-2 right-2 flex gap-2">
												<label htmlFor="image" className="cursor-pointer">
													<div className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors">
														<Upload className="w-5 h-5 text-gray-700" />
													</div>
												</label>
												<button
													type="button"
													onClick={removeImagePreview}
													className="bg-red-500/90 hover:bg-red-500 p-2 rounded-lg shadow-lg transition-colors"
												>
													<X className="w-5 h-5 text-white" />
												</button>
											</div>
											<Input
												id="image"
												type="file"
												accept="image/*"
												onChange={handleImageChange}
												className="hidden"
											/>
										</div>
									)}
									
									{formData.imageFile && (
										<p className="text-sm text-muted-foreground flex items-center gap-1">
											<ImageIcon className="w-4 h-4" />
											{formData.imageFile.name}
										</p>
									)}
								</div>

								{/* Section Vidéo avec Preview */}
								<div className="space-y-2">
									<Label htmlFor="video">
										Vidéo (optionnel)
									</Label>
									
									{!videoPreview ? (
										<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
											<label htmlFor="video" className="cursor-pointer">
												<div className="flex flex-col items-center gap-2">
													<div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
														<VideoIcon className="w-6 h-6 text-gray-400" />
													</div>
													<div>
														<p className="text-sm font-medium text-gray-700">
															Cliquez pour télécharger une vidéo
														</p>
														<p className="text-xs text-gray-500 mt-1">
															MP4, MOV ou WEBM (max. 50 Mo)
														</p>
													</div>
												</div>
											</label>
											<Input
												id="video"
												type="file"
												accept="video/*"
												onChange={handleVideoChange}
												className="hidden"
											/>
										</div>
									) : (
										<div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
											<video
												src={videoPreview}
												className="w-full h-64 object-cover bg-black"
												controls
											/>
											<div className="absolute top-2 right-2 flex gap-2">
												<label htmlFor="video" className="cursor-pointer">
													<div className="bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors">
														<Upload className="w-5 h-5 text-gray-700" />
													</div>
												</label>
												<button
													type="button"
													onClick={removeVideoPreview}
													className="bg-red-500/90 hover:bg-red-500 p-2 rounded-lg shadow-lg transition-colors"
												>
													<X className="w-5 h-5 text-white" />
												</button>
											</div>
											<Input
												id="video"
												type="file"
												accept="video/*"
												onChange={handleVideoChange}
												className="hidden"
											/>
										</div>
									)}
									
									{formData.videoFile && (
										<p className="text-sm text-muted-foreground flex items-center gap-1">
											<VideoIcon className="w-4 h-4" />
											{formData.videoFile.name}
										</p>
									)}
								</div>

								<div className="w-full flex justify-between gap-3 pt-4">
									<Button
										type="button"
										variant="outline"
										onClick={() => {
											setIsDialogOpen(false);
											resetForm();
										}}
										disabled={isSubmitting}
									>
										Annuler
									</Button>
									<Button
										type="submit"
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												{selectedTemoignage
													? "Modification..."
													: "Création..."}
											</>
										) : selectedTemoignage ? (
											"Modifier"
										) : (
											"Créer"
										)}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{isLoading ? (
					<div className="flex items-center justify-center p-12">
						<Loader2 className="w-8 h-8 animate-spin text-primary" />
					</div>
				) : temoignages.length === 0 ? (
					<div className="bg-card border border-border rounded-lg p-12 text-center">
						<MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
						<h3 className="text-lg font-medium text-foreground mb-2">
							Aucun témoignage
						</h3>
						<p className="text-muted-foreground mb-4">
							{searchTerm
								? "Aucun témoignage ne correspond à votre recherche"
								: "Commencez par créer votre premier témoignage"}
						</p>
					</div>
				) : (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{temoignages.map((temoignage) => (
								<div
									key={temoignage._id}
									className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
								>
									<div className="relative h-48 w-full overflow-hidden bg-muted">
										{temoignage.image ? (
											<img
												src={temoignage.image}
												alt={temoignage.titre}
												className="w-full h-full object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<MessageSquare className="w-12 h-12 text-muted-foreground" />
											</div>
										)}
										{temoignage.video && (
											<div className="absolute bottom-2 right-2 bg-black/70 p-2 rounded-full">
												<Play className="w-4 h-4 text-white" />
											</div>
										)}
									</div>

									<div className="p-4 space-y-3">
										<div>
											<h3 className="font-semibold text-lg line-clamp-1 mb-1">
												{temoignage.titre}
											</h3>
											<p className="text-sm text-muted-foreground line-clamp-2">
												{temoignage.description}
											</p>
										</div>
										
										<div>
											<p className="text-sm text-muted-foreground line-clamp-2">
												Publié le{" "}
												{new Date(
													temoignage.createdAt ||
														temoignage.datePublication
												).toLocaleDateString("fr-FR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</p>
										</div>

										<div className="flex items-center justify-between pt-2 border-t gap-2">
											<Button
												variant="outline"
												size="sm"
												onClick={() =>
													handleView(temoignage)
												}
												className="flex-1"
											>
												<Eye className="w-4 h-4 mr-1" />
												Voir
											</Button>

											<div className="flex gap-1">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() =>
														handleEdit(temoignage)
													}
												>
													<Edit className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8 hover:bg-red-500 hover:text-white"
													onClick={() =>
														openDeleteDialog(
															temoignage._id
														)
													}
												>
													<Trash2 className="w-4 h-4" />
												</Button>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						{totalPages > 1 && (
							<div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
								<p className="text-sm text-muted-foreground">
									Affichage de{" "}
									{(currentPage - 1) * itemsPerPage + 1} à{" "}
									{Math.min(
										currentPage * itemsPerPage,
										totalItems
									)}{" "}
									sur {totalItems} témoignages
								</p>
								<div className="flex items-center gap-2">
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handlePageChange(currentPage - 1)
										}
										disabled={currentPage === 1}
									>
										<ChevronLeft className="w-4 h-4" />
										Précédent
									</Button>
									<span className="text-sm">
										Page {currentPage} sur {totalPages}
									</span>
									<Button
										variant="outline"
										size="sm"
										onClick={() =>
											handlePageChange(currentPage + 1)
										}
										disabled={currentPage === totalPages}
									>
										Suivant
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
						)}
					</>
				)}

				<Dialog
					open={isViewDialogOpen}
					onOpenChange={setIsViewDialogOpen}
				>
					<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
						{viewTemoignage && (
							<>
								<DialogHeader>
									<DialogTitle className="text-2xl">
										{viewTemoignage.titre}
									</DialogTitle>
									<DialogDescription>
										Publié le{" "}
										{new Date(
											viewTemoignage.createdAt ||
												viewTemoignage.datePublication
										).toLocaleDateString("fr-FR", {
											day: "numeric",
											month: "long",
											year: "numeric",
										})}
									</DialogDescription>
								</DialogHeader>

								<div className="space-y-4">
									{viewTemoignage.image && (
										<div className="w-full h-64 rounded-lg overflow-hidden">
											<img
												src={viewTemoignage.image}
												alt={viewTemoignage.titre}
												className="w-full h-full object-cover"
											/>
										</div>
									)}

									<div className="prose prose-sm max-w-none">
										<p className="text-foreground whitespace-pre-wrap">
											{viewTemoignage.description}
										</p>
									</div>

									{viewTemoignage.video && (
										<Button
											onClick={() =>
												handlePlayVideo(viewTemoignage)
											}
											className="w-full gap-2"
											size="lg"
										>
											<Play className="w-5 h-5 fill-current" />
											Lire la vidéo
										</Button>
									)}
								</div>
							</>
						)}
					</DialogContent>
				</Dialog>

				<Dialog
					open={isVideoDialogOpen}
					onOpenChange={setIsVideoDialogOpen}
				>
					<DialogContent className="max-w-5xl p-0">
						<button
							onClick={() => setIsVideoDialogOpen(false)}
							className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
						>
							<X className="h-5 w-5" />
							<span className="sr-only">Fermer</span>
						</button>

						<div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
							{viewTemoignage?.video && (
								<video
									src={viewTemoignage.video}
									controls
									autoPlay
									className="w-full h-full"
								>
									Votre navigateur ne supporte pas la lecture
									de vidéos.
								</video>
							)}
						</div>
					</DialogContent>
				</Dialog>

				<AlertDialog
					open={isDeleteDialogOpen}
					onOpenChange={setIsDeleteDialogOpen}
				>
					<AlertDialogContent>
						<AlertDialogHeader>
							<AlertDialogTitle>
								Confirmer la suppression
							</AlertDialogTitle>
							<AlertDialogDescription>
								Êtes-vous sûr de vouloir supprimer ce
								témoignage ? Cette action est irréversible.
							</AlertDialogDescription>
						</AlertDialogHeader>
						<AlertDialogFooter>
							<AlertDialogCancel
								onClick={() => setDeleteId(null)}
							>
								Annuler
							</AlertDialogCancel>
							<AlertDialogAction
								onClick={handleDelete}
								className="bg-destructive text-destructive-foreground"
							>
								Supprimer
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>
			</div>
		</DashboardLayout>
	);
};

export default Temoignages;