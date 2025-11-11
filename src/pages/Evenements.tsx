import { useState, useEffect } from 'react';
import { Plus, Calendar, Trash2, Edit, ImageIcon } from 'lucide-react';
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
import { Evenement } from '@/types';
import { toast } from 'sonner';

const Evenements = () => {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    image: '',
  });

  const admin = authService.getCurrentAdmin();

  useEffect(() => {
    loadEvenements();
  }, []);

  const loadEvenements = () => {
    setEvenements(evenementsService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.description || !formData.image) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (editingId) {
      evenementsService.update(editingId, formData);
      toast.success('Événement modifié avec succès');
    } else {
      evenementsService.create({ ...formData, adminId: admin?.id || '1' });
      toast.success('Événement ajouté avec succès');
    }

    resetForm();
    loadEvenements();
  };

  const handleEdit = (evenement: Evenement) => {
    setFormData({
      titre: evenement.titre,
      description: evenement.description,
      image: evenement.image,
    });
    setEditingId(evenement.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      evenementsService.delete(id);
      toast.success('Événement supprimé avec succès');
      loadEvenements();
    }
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      image: '',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // En production, uploader vers un serveur et obtenir l'URL
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, image: imageUrl });
      toast.success('Image sélectionnée');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Événements</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gérez les actualités et annonces</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-secondary hover:bg-secondary-hover text-sm sm:text-base w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter un événement</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Modifier l\'événement' : 'Nouvel événement'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de l'événement
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="titre">Titre</Label>
                  <Input
                    id="titre"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Journée portes ouvertes"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez l'événement..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {formData.image && (
                    <div className="mt-2">
                      <img
                        src={formData.image}
                        alt="Aperçu"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 bg-secondary hover:bg-secondary-hover">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {evenements.map((evenement) => (
            <Card key={evenement.id} className="overflow-hidden card-hover shadow-card border-none">
              {evenement.image && (
                <div className="w-full h-48 bg-muted">
                  <img
                    src={evenement.image}
                    alt={evenement.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-secondary to-secondary-hover flex items-center justify-center">
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
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-2">{evenement.titre}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-3">
                  {evenement.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  Publié le {new Date(evenement.datePublication).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </Card>
          ))}

          {evenements.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun événement publié pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Evenements;
