export interface Admin {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
}

export interface Resultat {
  _id: string;
  categorie: string;
  filiere: string;
  niveau: string;
  semestre: number | string;
  annee: string;
  pdf: string;
  createdAt: string;
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

export interface User {
  _id: string,
  nom: string,
  prenom: string,
  email: string
}


export interface Formation {
  _id: string;
  titre: string;
  image: string;
  description: string;
  debouche: string[];
  aptitude: string[];
  createdAt: string;
}

