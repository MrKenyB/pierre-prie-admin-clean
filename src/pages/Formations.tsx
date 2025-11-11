import { useState, useEffect } from 'react';
import { Plus, GraduationCap, Trash2, Edit, ArrowRight } from 'lucide-react';
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
import { formationsService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { Formation } from '@/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

const Formations = () => {
  const [formations, setFormations] = useState<Formation[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomParcours: '',
    description: '',
    importance: '',
    debouches: [] as string[],
    debouchesInput: '',
  });

  const admin = authService.getCurrentAdmin();

  useEffect(() => {
    loadFormations();
  }, []);

  const loadFormations = () => {
    setFormations(formationsService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nomParcours || !formData.description || !formData.importance) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const debouches = formData.debouchesInput
      .split(',')
      .map(d => d.trim())
      .filter(d => d);

    if (editingId) {
      formationsService.update(editingId, {
        nomParcours: formData.nomParcours,
        description: formData.description,
        importance: formData.importance,
        debouches,
      });
      toast.success('Formation modifiée avec succès');
    } else {
      formationsService.create({
        nomParcours: formData.nomParcours,
        description: formData.description,
        importance: formData.importance,
        debouches,
        adminId: admin?.id || '1',
      });
      toast.success('Formation ajoutée avec succès');
    }

    resetForm();
    loadFormations();
  };

  const handleEdit = (formation: Formation) => {
    setFormData({
      nomParcours: formation.nomParcours,
      description: formation.description,
      importance: formation.importance,
      debouches: formation.debouches,
      debouchesInput: formation.debouches.join(', '),
    });
    setEditingId(formation.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      formationsService.delete(id);
      toast.success('Formation supprimée avec succès');
      loadFormations();
    }
  };

  const resetForm = () => {
    setFormData({
      nomParcours: '',
      description: '',
      importance: '',
      debouches: [],
      debouchesInput: '',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Formations</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gérez les parcours académiques</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-accent hover:opacity-90 text-sm sm:text-base w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter une formation</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Modifier la formation' : 'Nouvelle formation'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations de la formation
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomParcours">Nom du parcours</Label>
                  <Input
                    id="nomParcours"
                    value={formData.nomParcours}
                    onChange={(e) => setFormData({ ...formData, nomParcours: e.target.value })}
                    placeholder="Ex: Licence Informatique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Décrivez la formation..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="importance">Importance</Label>
                  <Input
                    id="importance"
                    value={formData.importance}
                    onChange={(e) => setFormData({ ...formData, importance: e.target.value })}
                    placeholder="Ex: Formation professionnalisante"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="debouches">Débouchés (séparés par des virgules)</Label>
                  <Textarea
                    id="debouches"
                    value={formData.debouchesInput}
                    onChange={(e) => setFormData({ ...formData, debouchesInput: e.target.value })}
                    placeholder="Ex: Développeur web, Ingénieur logiciel, Data scientist"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 bg-accent hover:opacity-90">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {formations.map((formation) => (
            <Card key={formation.id} className="p-6 card-hover shadow-card border-none">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent to-[hsl(160,70%,55%)] flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(formation)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(formation.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{formation.nomParcours}</h3>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {formation.description}
              </p>

              <div className="mb-3">
                <Badge variant="secondary" className="text-xs">
                  {formation.importance}
                </Badge>
              </div>

              {formation.debouches.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground">Débouchés:</p>
                  <div className="space-y-1">
                    {formation.debouches.slice(0, 3).map((debouche, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ArrowRight className="w-3 h-3 text-accent" />
                        <span>{debouche}</span>
                      </div>
                    ))}
                    {formation.debouches.length > 3 && (
                      <p className="text-xs text-muted-foreground">
                        +{formation.debouches.length - 3} autre(s)
                      </p>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))}

          {formations.length === 0 && (
            <div className="col-span-full text-center py-12">
              <GraduationCap className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune formation enregistrée pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Formations;
