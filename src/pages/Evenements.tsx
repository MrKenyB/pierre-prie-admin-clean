import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, Edit, ImageIcon, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { evenementsService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { toast } from 'sonner';



interface Evenement {
  id: number;
  titre: string;
  description: string;
  image: string;
  adminId?: number;
  createdAt: string;
}

const API_URL = 'http://localhost:3000/api/actualites'; 

const Evenements = () => {

  const [evenements, setEvenements] = useState<Evenement[]>([
    {
      id: 1,
      titre: 'Journée Portes Ouvertes',
      description: 'Venez découvrir notre établissement et rencontrer nos enseignants. Inscriptions ouvertes pour la prochaine rentrée académique.',
      image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
      createdAt: new Date().toISOString(),
    },
    {
      id: 2,
      titre: 'Cérémonie de Remise des Diplômes',
      description: 'Célébration de la promotion 2024. Un moment solennel pour honorer la réussite de nos étudiants.',
      image: 'https://images.unsplash.com/photo-1576495199011-eb94736d05d6?w=800',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      titre: 'Semaine de la Culture',
      description: 'Une semaine dédiée aux activités culturelles, artistiques et sportives. Tous les étudiants sont invités à participer.',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    image: null as File | null,
    imagePreview: '',
  });

  // Charger les événements depuis l'API
  const loadEvenements = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.ok) {
        const result = await response.json();
        const data = result.actualites || result;
        if (data && data.length > 0) {
          setEvenements(data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      // Garde les exemples en dur en cas d'erreur
    }
  };

  useEffect(() => {
    loadEvenements();
  }, []);

  const handleSubmit = async () => {
    const { titre, description, image } = formData;

    if (!titre || !description) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!editingId && !image) {
      alert('Veuillez sélectionner une image');
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken');
      const data = new FormData();
      data.append('titre', titre);
      data.append('description', description);
      if (image) {
        data.append('file', image);
      }

      let response;
      if (editingId) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        });
      } else {
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        });
      }

      if (response.ok) {
        alert(editingId ? 'Événement modifié avec succès' : 'Événement ajouté avec succès');
        resetForm();
        loadEvenements();
      } else {
        throw new Error('Erreur lors de la requête');
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (evenement: Evenement) => {
    setFormData({
      titre: evenement.titre,
      description: evenement.description,
      image: null,
      imagePreview: evenement.image,
    });
    setEditingId(evenement.id);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        alert('Événement supprimé avec succès');
        loadEvenements();
      } else {
        throw new Error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error(error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      image: null,
      imagePreview: '',
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
  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
      <div className="p-6 lg:p-8 max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Événements</h1>
            <p className="text-gray-600 text-sm">Gérez les actualités et annonces</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter un événement</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Modifier l'événement" : 'Nouvel événement'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de l'événement
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre *</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Journée portes ouvertes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez l'événement..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image {!editingId && '*'}</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formData.imagePreview && (
                    <div className="mt-2">
                      <img
                        src={formData.imagePreview}
                        alt="Aperçu"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    {editingId ? 'Laisser vide pour conserver l\'image actuelle' : 'Image requise'}
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
                        Envoi...
                      </>
                    ) : editingId ? (
                      'Modifier'
                    ) : (
                      'Ajouter'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* LISTE DES ÉVÉNEMENTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evenements.map((evenement) => (
            <Card key={evenement.id} className="overflow-hidden shadow-md hover:shadow-lg transition">
              {evenement.image && (
                <div className="w-full h-48 bg-gray-200">
                  <img
                    src={evenement.image}
                    alt={evenement.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(evenement)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(evenement.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2 text-gray-900">
                  {evenement.titre}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {evenement.description}
                </p>
                <p className="text-xs text-gray-500">
                  Publié le {new Date(evenement.createdAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </Card>
          ))}

          {evenements.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Aucun événement publié pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </DashboardLayout>
  );
};

export default Evenements;
