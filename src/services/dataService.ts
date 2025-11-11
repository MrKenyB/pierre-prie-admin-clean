import { Resultat, Evenement, Formation, Temoignage, DashboardStats } from '@/types';

const RESULTATS_KEY = 'ipp_resultats';
const EVENEMENTS_KEY = 'ipp_evenements';
const FORMATIONS_KEY = 'ipp_formations';
const TEMOIGNAGES_KEY = 'ipp_temoignages';

// Helper pour générer des IDs uniques
const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Helper pour gérer le localStorage
const getFromStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const saveToStorage = <T>(key: string, data: T[]) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Service pour les résultats
export const resultatsService = {
  getAll: (): Resultat[] => getFromStorage<Resultat>(RESULTATS_KEY),

  getById: (id: string): Resultat | undefined => {
    const resultats = getFromStorage<Resultat>(RESULTATS_KEY);
    return resultats.find(r => r.id === id);
  },

  create: (resultat: Omit<Resultat, 'id' | 'datePublication'>): Resultat => {
    const resultats = getFromStorage<Resultat>(RESULTATS_KEY);
    const newResultat: Resultat = {
      ...resultat,
      id: generateId(),
      datePublication: new Date().toISOString(),
    };
    resultats.push(newResultat);
    saveToStorage(RESULTATS_KEY, resultats);
    return newResultat;
  },

  update: (id: string, data: Partial<Resultat>): Resultat | null => {
    const resultats = getFromStorage<Resultat>(RESULTATS_KEY);
    const index = resultats.findIndex(r => r.id === id);
    if (index === -1) return null;

    resultats[index] = { ...resultats[index], ...data };
    saveToStorage(RESULTATS_KEY, resultats);
    return resultats[index];
  },

  delete: (id: string): boolean => {
    const resultats = getFromStorage<Resultat>(RESULTATS_KEY);
    const filtered = resultats.filter(r => r.id !== id);
    if (filtered.length === resultats.length) return false;
    saveToStorage(RESULTATS_KEY, filtered);
    return true;
  },
};

// Service pour les événements
export const evenementsService = {
  getAll: (): Evenement[] => getFromStorage<Evenement>(EVENEMENTS_KEY),

  getById: (id: string): Evenement | undefined => {
    const evenements = getFromStorage<Evenement>(EVENEMENTS_KEY);
    return evenements.find(e => e.id === id);
  },

  create: (evenement: Omit<Evenement, 'id' | 'datePublication'>): Evenement => {
    const evenements = getFromStorage<Evenement>(EVENEMENTS_KEY);
    const newEvenement: Evenement = {
      ...evenement,
      id: generateId(),
      datePublication: new Date().toISOString(),
    };
    evenements.push(newEvenement);
    saveToStorage(EVENEMENTS_KEY, evenements);
    return newEvenement;
  },

  update: (id: string, data: Partial<Evenement>): Evenement | null => {
    const evenements = getFromStorage<Evenement>(EVENEMENTS_KEY);
    const index = evenements.findIndex(e => e.id === id);
    if (index === -1) return null;

    evenements[index] = { ...evenements[index], ...data };
    saveToStorage(EVENEMENTS_KEY, evenements);
    return evenements[index];
  },

  delete: (id: string): boolean => {
    const evenements = getFromStorage<Evenement>(EVENEMENTS_KEY);
    const filtered = evenements.filter(e => e.id !== id);
    if (filtered.length === evenements.length) return false;
    saveToStorage(EVENEMENTS_KEY, filtered);
    return true;
  },
};

// Service pour les formations
export const formationsService = {
  getAll: (): Formation[] => getFromStorage<Formation>(FORMATIONS_KEY),

  getById: (id: string): Formation | undefined => {
    const formations = getFromStorage<Formation>(FORMATIONS_KEY);
    return formations.find(f => f.id === id);
  },

  create: (formation: Omit<Formation, 'id'>): Formation => {
    const formations = getFromStorage<Formation>(FORMATIONS_KEY);
    const newFormation: Formation = {
      ...formation,
      id: generateId(),
    };
    formations.push(newFormation);
    saveToStorage(FORMATIONS_KEY, formations);
    return newFormation;
  },

  update: (id: string, data: Partial<Formation>): Formation | null => {
    const formations = getFromStorage<Formation>(FORMATIONS_KEY);
    const index = formations.findIndex(f => f.id === id);
    if (index === -1) return null;

    formations[index] = { ...formations[index], ...data };
    saveToStorage(FORMATIONS_KEY, formations);
    return formations[index];
  },

  delete: (id: string): boolean => {
    const formations = getFromStorage<Formation>(FORMATIONS_KEY);
    const filtered = formations.filter(f => f.id !== id);
    if (filtered.length === formations.length) return false;
    saveToStorage(FORMATIONS_KEY, filtered);
    return true;
  },
};

// Service pour les témoignages
export const temoignagesService = {
  getAll: (): Temoignage[] => getFromStorage<Temoignage>(TEMOIGNAGES_KEY),

  getById: (id: string): Temoignage | undefined => {
    const temoignages = getFromStorage<Temoignage>(TEMOIGNAGES_KEY);
    return temoignages.find(t => t.id === id);
  },

  create: (temoignage: Omit<Temoignage, 'id' | 'datePublication'>): Temoignage => {
    const temoignages = getFromStorage<Temoignage>(TEMOIGNAGES_KEY);
    const newTemoignage: Temoignage = {
      ...temoignage,
      id: generateId(),
      datePublication: new Date().toISOString(),
    };
    temoignages.push(newTemoignage);
    saveToStorage(TEMOIGNAGES_KEY, temoignages);
    return newTemoignage;
  },

  update: (id: string, data: Partial<Temoignage>): Temoignage | null => {
    const temoignages = getFromStorage<Temoignage>(TEMOIGNAGES_KEY);
    const index = temoignages.findIndex(t => t.id === id);
    if (index === -1) return null;

    temoignages[index] = { ...temoignages[index], ...data };
    saveToStorage(TEMOIGNAGES_KEY, temoignages);
    return temoignages[index];
  },

  delete: (id: string): boolean => {
    const temoignages = getFromStorage<Temoignage>(TEMOIGNAGES_KEY);
    const filtered = temoignages.filter(t => t.id !== id);
    if (filtered.length === temoignages.length) return false;
    saveToStorage(TEMOIGNAGES_KEY, filtered);
    return true;
  },
};

// Service pour les statistiques du dashboard
export const dashboardService = {
  getStats: (): DashboardStats => ({
    totalResultats: resultatsService.getAll().length,
    totalEvenements: evenementsService.getAll().length,
    totalFormations: formationsService.getAll().length,
    totalTemoignages: temoignagesService.getAll().length,
  }),
};
