// services/temoignagesApiService.ts
import axios from "axios";
import { Temoignage } from "@/types";


const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeader = () => {
	const token = localStorage.getItem("token");
	return token ? { Authorization: `Bearer ${token}` } : {};
};

export interface PaginationParams {
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: "asc" | "desc";
	search?: string;
}

export interface PaginatedResponse {
	temoignages: Temoignage[];
	pagination: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
		hasNextPage: boolean;
		hasPrevPage: boolean;
	};
}

export const temoignagesApiService = {
	// Récupérer tous les témoignages avec pagination
	getAll: async (params?: PaginationParams): Promise<PaginatedResponse> => {
		try {
			const queryParams = new URLSearchParams();

			if (params?.page)
				queryParams.append("page", params.page.toString());
			if (params?.limit)
				queryParams.append("limit", params.limit.toString());
			if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
			if (params?.sortOrder)
				queryParams.append("sortOrder", params.sortOrder);
			if (params?.search) queryParams.append("search", params.search);

			const response = await axios.get(
				`${API_URL}/temoignages?${queryParams.toString()}`,
				{ headers: getAuthHeader() }
			);

			return {
				temoignages: response.data.temoignages,
				pagination: response.data.pagination,
			};
		} catch (error) {
			console.error("Erreur lors du chargement des témoignages:", error);
			throw error;
		}
	},

	// Récupérer un témoignage par ID
	getById: async (id: string): Promise<Temoignage> => {
		try {
			const response = await axios.get(`${API_URL}/temoignages/${id}`, {
				headers: getAuthHeader(),
			});
			return response.data.temoignage;
		} catch (error) {
			console.error("Erreur lors du chargement du témoignage:", error);
			throw error;
		}
	},

	// Créer un nouveau témoignage
	create: async (formData: FormData): Promise<Temoignage> => {
		try {
			const response = await axios.post(
				`${API_URL}/temoignages`,
				formData,
				{
					headers: {
						...getAuthHeader(),
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data.temoignage;
		} catch (error) {
			console.error("Erreur lors de la création du témoignage:", error);
			throw error;
		}
	},

	// Mettre à jour un témoignage
	update: async (id: string, formData: FormData): Promise<Temoignage> => {
		try {
			const response = await axios.put(
				`${API_URL}/temoignages/${id}`,
				formData,
				{
					headers: {
						...getAuthHeader(),
						"Content-Type": "multipart/form-data",
					},
				}
			);
			return response.data.temoignage;
		} catch (error) {
			console.error(
				"Erreur lors de la mise à jour du témoignage:",
				error
			);
			throw error;
		}
	},

	// Supprimer un témoignage
	delete: async (id: string): Promise<void> => {
		try {
			await axios.delete(`${API_URL}/temoignages/${id}`, {
				headers: getAuthHeader(),
			});
		} catch (error) {
			console.error(
				"Erreur lors de la suppression du témoignage:",
				error
			);
			throw error;
		}
	},
};
