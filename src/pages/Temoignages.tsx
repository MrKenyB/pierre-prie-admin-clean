import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2, MessageSquare } from 'lucide-react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { temoignagesService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { Temoignage } from '@/types';
import { toast } from 'sonner';

const Temoignages = () => {
  const [temoignages, setTemoignages] = useState<Temoignage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTemoignage, setSelectedTemoignage] = useState<Temoignage | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    image: '',
    video: '',
  });

  const admin = authService.getCurrentAdmin();

  useEffect(() => {
    loadTemoignages();
  }, []);

  const loadTemoignages = () => {
    const data = temoignagesService.getAll();
    setTemoignages(data);
  };

  const resetForm = () => {
    setFormData({
      titre: '',
      description: '',
      image: '',
      video: '',
    });
    setSelectedTemoignage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.titre || !formData.description) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!admin) {
      toast.error('Vous devez être connecté');
      return;
    }

    try {
      if (selectedTemoignage) {
        temoignagesService.update(selectedTemoignage.id, formData);
        toast.success('Témoignage modifié avec succès');
      } else {
        temoignagesService.create({
          ...formData,
          adminId: admin.id,
        });
        toast.success('Témoignage créé avec succès');
      }

      loadTemoignages();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Une erreur est survenue');
    }
  };

  const handleEdit = (temoignage: Temoignage) => {
    setSelectedTemoignage(temoignage);
    setFormData({
      titre: temoignage.titre,
      description: temoignage.description,
      image: temoignage.image,
      video: temoignage.video,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = () => {
    if (deleteId) {
      temoignagesService.delete(deleteId);
      toast.success('Témoignage supprimé avec succès');
      loadTemoignages();
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">
              Témoignages
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Gérez les témoignages d'étudiants et anciens élèves
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Nouveau témoignage
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {selectedTemoignage ? 'Modifier le témoignage' : 'Nouveau témoignage'}
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
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    placeholder="Ex: Un parcours enrichissant"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Partagez votre expérience..."
                    rows={5}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL de l'image</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://exemple.com/image.jpg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="video">URL de la vidéo</Label>
                  <Input
                    id="video"
                    type="url"
                    value={formData.video}
                    onChange={(e) => setFormData({ ...formData, video: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {selectedTemoignage ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {temoignages.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Aucun témoignage
            </h3>
            <p className="text-muted-foreground mb-4">
              Commencez par créer votre premier témoignage
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Titre</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="hidden lg:table-cell">Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {temoignages.map((temoignage) => (
                  <TableRow key={temoignage.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {temoignage.image && (
                          <img
                            src={temoignage.image}
                            alt={temoignage.titre}
                            className="w-10 h-10 object-cover rounded"
                          />
                        )}
                        <span>{temoignage.titre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {temoignage.description}
                      </p>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {new Date(temoignage.datePublication).toLocaleDateString('fr-FR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(temoignage)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteDialog(temoignage.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer ce témoignage ? Cette action est irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteId(null)}>
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
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
