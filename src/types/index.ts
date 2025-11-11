export interface Admin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

export interface Resultat {
  id: string;
  type: 'Contrôle' | 'Interrogation' | 'Examen';
  filiere: string;
  niveau: string;
  semestre: string;
  fichierPDF: string;
  datePublication: string;
  adminId: string;
}

export interface Evenement {
  id: string;
  image: string;
  titre: string;
  description: string;
  datePublication: string;
  adminId: string;
}

export interface Formation {
  id: string;
  nomParcours: string;
  description: string;
  importance: string;
  debouches: string[];
  adminId: string;
}

export interface Temoignage {
  id: string;
  titre: string;
  description: string;
  image: string;
  video: string;
  datePublication: string;
  adminId: string;
}

export interface DashboardStats {
  totalResultats: number;
  totalEvenements: number;
  totalFormations: number;
  totalTemoignages: number;
}
