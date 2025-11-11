import { useState, useEffect } from 'react';
import { Plus, FileText, Trash2, Edit, Download } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { resultatsService } from '@/services/dataService';
import { authService } from '@/services/authService';
import { Resultat } from '@/types';
import { toast } from 'sonner';

const Resultats = () => {
  const [resultats, setResultats] = useState<Resultat[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    type: 'Contrôle' as 'Contrôle' | 'Interrogation' | 'Examen',
    filiere: '',
    niveau: '',
    semestre: '',
    fichierPDF: '',
  });

  const admin = authService.getCurrentAdmin();

  useEffect(() => {
    loadResultats();
  }, []);

  const loadResultats = () => {
    setResultats(resultatsService.getAll());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.filiere || !formData.niveau || !formData.semestre || !formData.fichierPDF) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (editingId) {
      resultatsService.update(editingId, formData);
      toast.success('Résultat modifié avec succès');
    } else {
      resultatsService.create({ ...formData, adminId: admin?.id || '1' });
      toast.success('Résultat ajouté avec succès');
    }

    resetForm();
    loadResultats();
  };

  const handleEdit = (resultat: Resultat) => {
    setFormData({
      type: resultat.type,
      filiere: resultat.filiere,
      niveau: resultat.niveau,
      semestre: resultat.semestre,
      fichierPDF: resultat.fichierPDF,
    });
    setEditingId(resultat.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce résultat ?')) {
      resultatsService.delete(id);
      toast.success('Résultat supprimé avec succès');
      loadResultats();
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Contrôle',
      filiere: '',
      niveau: '',
      semestre: '',
      fichierPDF: '',
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simuler le stockage du fichier (en production, uploader vers un serveur)
      const fileName = file.name;
      setFormData({ ...formData, fichierPDF: fileName });
      toast.success('Fichier sélectionné');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2">Résultats scolaires</h1>
            <p className="text-sm sm:text-base text-muted-foreground">Gérez les publications de résultats</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-primary hover:bg-primary-hover text-sm sm:text-base w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Ajouter un résultat</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingId ? 'Modifier le résultat' : 'Nouveau résultat'}
                </DialogTitle>
                <DialogDescription>
                  Remplissez les informations du résultat scolaire
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Contrôle">Contrôle</SelectItem>
                      <SelectItem value="Interrogation">Interrogation</SelectItem>
                      <SelectItem value="Examen">Examen</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="filiere">Filière</Label>
                  <Input
                    id="filiere"
                    value={formData.filiere}
                    onChange={(e) => setFormData({ ...formData, filiere: e.target.value })}
                    placeholder="Ex: Informatique"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="niveau">Niveau</Label>
                  <Input
                    id="niveau"
                    value={formData.niveau}
                    onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                    placeholder="Ex: Licence 2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semestre">Semestre</Label>
                  <Input
                    id="semestre"
                    value={formData.semestre}
                    onChange={(e) => setFormData({ ...formData, semestre: e.target.value })}
                    placeholder="Ex: Semestre 1"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pdf">Fichier PDF</Label>
                  <Input
                    id="pdf"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                  />
                  {formData.fichierPDF && (
                    <p className="text-xs text-muted-foreground">
                      Fichier: {formData.fichierPDF}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary-hover">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resultats.map((resultat) => (
            <Card key={resultat.id} className="p-6 card-hover shadow-card border-none">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEdit(resultat)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleDelete(resultat.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg">{resultat.type}</h3>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p><span className="font-medium">Filière:</span> {resultat.filiere}</p>
                  <p><span className="font-medium">Niveau:</span> {resultat.niveau}</p>
                  <p><span className="font-medium">Semestre:</span> {resultat.semestre}</p>
                  <p className="text-xs">
                    Publié le {new Date(resultat.datePublication).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <Button variant="outline" className="w-full mt-4 gap-2">
                <Download className="w-4 h-4" />
                {resultat.fichierPDF}
              </Button>
            </Card>
          ))}

          {resultats.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucun résultat publié pour le moment</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Resultats;
