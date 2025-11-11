/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Plus, GraduationCap, Trash2, Edit, ArrowRight, Upload, X } from 'lucide-react';

const Formations = () => {
  const [formations, setFormations] = useState([
    {
      id: 1,
      titre: 'Licence Informatique',
      image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
      description: 'Formation complète en développement logiciel et systèmes informatiques',
      debouche: ['Développeur Full Stack', 'Ingénieur Logiciel', 'Administrateur Systèmes'],
      aptitude: ['Logique mathématique', 'Résolution de problèmes', 'Anglais technique'],
      createdAt: new Date().toISOString()
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    image: '',
    description: '',
  });
  const [preview, setPreview] = useState<string | null>(null);
  const [aptitudes, setAptitudes] = useState<string[]>([]);
  const [debouches, setDebouches] = useState<string[]>([]);
  const [aptitudeInput, setAptitudeInput] = useState('');
  const [deboucheInput, setDeboucheInput] = useState('');

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setFormData({ ...formData, image: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  // Gestion des aptitudes
  const handleAptitudeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && aptitudeInput.trim() !== '') {
      e.preventDefault();
      if (!aptitudes.includes(aptitudeInput.trim())) {
        setAptitudes([...aptitudes, aptitudeInput.trim()]);
      }
      setAptitudeInput('');
    }
  };

  const removeAptitude = (index: number) => {
    setAptitudes(aptitudes.filter((_, i) => i !== index));
  };

  // Gestion des débouchés
  const handleDeboucheKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && deboucheInput.trim() !== '') {
      e.preventDefault();
      if (!debouches.includes(deboucheInput.trim())) {
        setDebouches([...debouches, deboucheInput.trim()]);
      }
      setDeboucheInput('');
    }
  };

  const removeDebouche = (index: number) => {
    setDebouches(debouches.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!formData.titre || !formData.description || !formData.image) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingId) {
      setFormations(formations.map(f =>
        f.id === editingId ? { ...f, ...formData, aptitude: aptitudes, debouche: debouches } : f
      ));
    } else {
      const newFormation = {
        id: Math.max(0, ...formations.map(f => f.id)) + 1,
        ...formData,
        aptitude: aptitudes,
        debouche: debouches,
        createdAt: new Date().toISOString(),
      };
      setFormations([...formations, newFormation]);
    }
    resetForm();
  };

  const handleEdit = (formation: any) => {
    setFormData({
      titre: formation.titre,
      image: formation.image,
      description: formation.description,
    });
    setPreview(formation.image);
    setAptitudes(formation.aptitude);
    setDebouches(formation.debouche);
    setEditingId(formation.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette formation ?')) {
      setFormations(formations.filter(f => f.id !== id));
    }
  };

  const resetForm = () => {
    setFormData({ titre: '', image: '', description: '' });
    setPreview(null);
    setAptitudes([]);
    setDebouches([]);
    setAptitudeInput('');
    setDeboucheInput('');
    setEditingId(null);
    setIsDialogOpen(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">


        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-1">Formations</h2>
              <p className="text-slate-600">Gérez les parcours académiques de l'institut</p>
            </div>
            <button
              onClick={() => setIsDialogOpen(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Plus className="w-5 h-5" /> Ajouter une formation
            </button>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {formations.map((formation) => (
              <div key={formation.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border">
                <div className="relative h-48 bg-slate-200">
                  <img src={formation.image} alt={formation.titre} className="w-full h-full object-cover" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={() => handleEdit(formation)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-slate-50">
                      <Edit className="w-4 h-4 text-slate-700" />
                    </button>
                    <button onClick={() => handleDelete(formation.id)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-red-50">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                <div className="p-2">
                  <div className="flex items-start gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{formation.titre}</h3>
                      <p className="text-sm text-slate-600">{formation.description}</p>
                    </div>
                  </div>

                {formation.aptitude.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-slate-700 mb-2">Aptitudes requises:</p>
                    <div className="flex flex-wrap gap-1">
                      {formation.aptitude.slice(0, 3).map((apt, index) => (
                        <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                          {apt}
                        </span>
                      ))}
                      {formation.aptitude.length > 3 && (
                        <span className="text-xs text-slate-500">+{formation.aptitude.length - 3}</span>
                      )}
                    </div>
                  </div>
                )}

                {formation.debouche.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-slate-700 mb-2">Débouchés:</p>
                    <div className="space-y-1">
                      {formation.debouche.slice(0, 3).map((deb, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-slate-600">
                          <ArrowRight className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                          <span className="truncate">{deb}</span>
                        </div>
                      ))}
                      {formation.debouche.length > 3 && (
                        <p className="text-xs text-slate-500 pl-5">
                          +{formation.debouche.length - 3} autre(s)
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              </div>
            ))}
          </div>
        </div>

        {/* Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{editingId ? 'Modifier la formation' : 'Nouvelle formation'}</h3>
                  <p className="text-sm text-slate-500">Remplissez les informations</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-slate-100 rounded-lg">
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Titre */}
                <div>
                  <label className="block text-sm font-medium mb-2">Titre *</label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>

                {/* Image */}
                <div>
                  <label className="block text-sm font-medium mb-2">Image locale *</label>
                  <div className="flex gap-2 items-center">
                    <input type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                    <Upload className="w-5 h-5 text-slate-600" />
                  </div>
                  {preview && (
                    <img src={preview} alt="Aperçu" className="mt-3 w-full h-40 object-cover rounded-lg border" />
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border rounded-lg resize-none"
                  />
                </div>

                {/* Aptitudes */}
                <div>
                  <label className="block text-sm font-medium mb-2">Aptitudes requises</label>
                  <input
                    type="text"
                    value={aptitudeInput}
                    onChange={(e) => setAptitudeInput(e.target.value)}
                    onKeyDown={handleAptitudeKeyDown}
                    placeholder="Appuyez sur Entrée pour ajouter"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {aptitudes.map((apt, index) => (
                      <span key={index} className="flex items-center bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-sm">
                        {apt}
                        <button onClick={() => removeAptitude(index)} className="ml-2 text-blue-500 hover:text-blue-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Débouchés */}
                <div>
                  <label className="block text-sm font-medium mb-2">Débouchés professionnels</label>
                  <input
                    type="text"
                    value={deboucheInput}
                    onChange={(e) => setDeboucheInput(e.target.value)}
                    onKeyDown={handleDeboucheKeyDown}
                    placeholder="Appuyez sur Entrée pour ajouter"
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {debouches.map((deb, index) => (
                      <span key={index} className="flex items-center bg-green-50 text-green-700 px-2 py-1 rounded-md text-sm">
                        {deb}
                        <button onClick={() => removeDebouche(index)} className="ml-2 text-green-500 hover:text-green-700">
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t">
                  <button onClick={resetForm} className="flex-1 border px-4 py-2 rounded-lg">Annuler</button>
                  <button onClick={handleSubmit} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg">
                    {editingId ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Formations;
