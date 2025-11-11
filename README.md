# Institut Pierre Prie - Dashboard Administrateur

## Description

Application web moderne de gestion administrative pour l'Institut Pierre Prie. Cette plateforme permet aux administrateurs de gérer efficacement les résultats scolaires, les événements et les formations.

## Fonctionnalités

- **Authentification sécurisée** : Système de connexion avec récupération de mot de passe par email
- **Gestion des résultats** : Publication et gestion des résultats scolaires (PDF)
- **Gestion des événements** : Annonces et actualités avec images
- **Gestion des formations** : Catalogue des formations disponibles
- **Interface responsive** : Compatible mobile, tablette et desktop

## Technologies utilisées

- **React** : Bibliothèque JavaScript pour l'interface utilisateur
- **TypeScript** : Langage de programmation typé
- **Vite** : Outil de build rapide
- **Tailwind CSS** : Framework CSS utilitaire
- **Shadcn UI** : Composants UI modernes
- **React Router** : Navigation côté client
- **Tanstack Query** : Gestion des données asynchrones

## Installation

### Prérequis

- Node.js (version 18 ou supérieure)
- npm ou yarn

### Étapes d'installation

```bash
# Cloner le dépôt
git clone <VOTRE_URL_GIT>

# Accéder au répertoire du projet
cd institut-pierre-prie

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:8080`

## Scripts disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Construire pour la production
npm run build

# Prévisualiser la version de production
npm run preview

# Linter le code
npm run lint
```

## Structure du projet

```
src/
├── components/      # Composants réutilisables
├── pages/          # Pages de l'application
├── services/       # Services (auth, data)
├── types/          # Types TypeScript
├── lib/            # Utilitaires
└── assets/         # Images et ressources
```

## Identifiants de démonstration

- **Email** : admin@institut-pierre-prie.fr
- **Mot de passe** : admin123

## Déploiement

Pour déployer l'application, exécutez :

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

## Licence

© 2024 Institut Pierre Prie. Tous droits réservés.
