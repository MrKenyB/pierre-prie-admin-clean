import { Admin } from '@/types';

const ADMINS_KEY = 'ipp_admins'; // Liste de tous les admins
const AUTH_TOKEN_KEY = 'ipp_auth_token';

// Données admin par défaut pour la démo
const DEFAULT_ADMINS: Admin[] = [
  {
    id: '1',
    nom: 'Admin',
    prenom: 'Institut',
    email: 'admin@institut-pierre-prie.fr',
    motDePasse: 'admin123',
  }
];

// Récupérer tous les admins
const getAdmins = (): Admin[] => {
  const stored = localStorage.getItem(ADMINS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_ADMINS;
};

// Sauvegarder tous les admins
const saveAdmins = (admins: Admin[]) => {
  localStorage.setItem(ADMINS_KEY, JSON.stringify(admins));
};

export const authService = {
  // Inscription d'un nouvel admin
  signup: (nom: string, prenom: string, email: string, password: string): { success: boolean; error?: string } => {
    const admins = getAdmins();
    
    // Vérifier si l'email existe déjà
    if (admins.some(admin => admin.email === email)) {
      return { success: false, error: 'Cette adresse email est déjà utilisée' };
    }

    // Créer le nouvel admin
    const newAdmin: Admin = {
      id: Date.now().toString(),
      nom,
      prenom,
      email,
      motDePasse: password,
    };

    admins.push(newAdmin);
    saveAdmins(admins);

    return { success: true };
  },

  login: (email: string, password: string): { success: boolean; admin?: Admin; error?: string } => {
    const admins = getAdmins();
    const admin = admins.find(a => a.email === email && a.motDePasse === password);

    if (admin) {
      // Créer un token simple
      const token = btoa(JSON.stringify({ id: admin.id, email: admin.email, timestamp: Date.now() }));
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      localStorage.setItem('ipp_current_admin', JSON.stringify(admin));
      
      return { success: true, admin };
    }

    return { success: false, error: 'Email ou mot de passe incorrect' };
  },

  logout: () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem('ipp_current_admin');
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    return !!token;
  },

  getCurrentAdmin: (): Admin | null => {
    const storedAdmin = localStorage.getItem('ipp_current_admin');
    return storedAdmin ? JSON.parse(storedAdmin) : null;
  },

  initializeAdmin: () => {
    if (!localStorage.getItem(ADMINS_KEY)) {
      saveAdmins(DEFAULT_ADMINS);
    }
  },

  // Demander la réinitialisation du mot de passe
  requestPasswordReset: (email: string): { success: boolean; message: string } => {
    const admins = getAdmins();
    const admin = admins.find(a => a.email === email);

    if (admin) {
      // Générer un code de réinitialisation
      const resetCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const resetData = {
        email,
        code: resetCode,
        timestamp: Date.now(),
        expiresAt: Date.now() + 15 * 60 * 1000, // Expire dans 15 minutes
      };
      
      localStorage.setItem('ipp_reset_code', JSON.stringify(resetData));
      
      // Simuler l'envoi d'email (afficher le code dans la console)
      console.log('===== EMAIL DE RÉINITIALISATION =====');
      console.log('Destinataire:', email);
      console.log('Code de réinitialisation:', resetCode);
      console.log('Valide pendant 15 minutes');
      console.log('=====================================');
      
      return { 
        success: true, 
        message: `Un code de réinitialisation a été envoyé à ${email}. Vérifiez votre boîte mail.` 
      };
    }

    return { 
      success: false, 
      message: 'Aucun compte associé à cette adresse email.' 
    };
  },

  // Vérifier le code de réinitialisation
  verifyResetCode: (email: string, code: string): { success: boolean; message: string } => {
    const resetData = localStorage.getItem('ipp_reset_code');
    
    if (!resetData) {
      return { success: false, message: 'Aucune demande de réinitialisation en cours.' };
    }

    const { email: savedEmail, code: savedCode, expiresAt } = JSON.parse(resetData);

    if (Date.now() > expiresAt) {
      localStorage.removeItem('ipp_reset_code');
      return { success: false, message: 'Le code a expiré. Veuillez faire une nouvelle demande.' };
    }

    if (email !== savedEmail || code.toUpperCase() !== savedCode) {
      return { success: false, message: 'Code incorrect.' };
    }

    return { success: true, message: 'Code validé.' };
  },

  // Réinitialiser le mot de passe
  resetPassword: (email: string, code: string, newPassword: string): { success: boolean; message: string } => {
    const verifyResult = authService.verifyResetCode(email, code);
    
    if (!verifyResult.success) {
      return verifyResult;
    }

    const admins = getAdmins();
    const adminIndex = admins.findIndex(a => a.email === email);

    if (adminIndex !== -1) {
      admins[adminIndex].motDePasse = newPassword;
      saveAdmins(admins);
      localStorage.removeItem('ipp_reset_code');
      
      return { success: true, message: 'Mot de passe réinitialisé avec succès.' };
    }

    return { success: false, message: 'Une erreur est survenue.' };
  },
};
