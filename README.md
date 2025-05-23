# VR Hypno POC

Un POC (Proof of Concept) pour une application d'hypnose VR utilisant Electron et Vue.js.

## Fonctionnalités

- Création automatique d'un dossier `data/` au démarrage
- Génération d'un fichier `test.json` avec des données aléatoires
- Lecture et affichage automatique du contenu du fichier
- Interface utilisateur simple et réactive

## Prérequis

- Node.js 18 ou supérieur
- npm 9 ou supérieur

## Installation

1. Cloner le repository :
```bash
git clone [url-du-repo]
cd vr-hypno-poc
```

2. Installer les dépendances :
```bash
npm install
```

## Développement

Pour lancer l'application en mode développement :
```bash
npm run dev
```

## Build

Pour créer l'exécutable :
```bash
npm run build
```

L'exécutable sera créé dans le dossier `release`.

## Structure du Projet

```
/
├── src/
│   ├── main/           # Processus principal Electron
│   └── renderer/       # Application Vue.js
├── data/              # Dossier créé automatiquement
├── package.json
└── vite.config.ts
```

## Fonctionnement

1. Au démarrage, l'application :
   - Crée un dossier `data/` dans le répertoire de l'utilisateur
   - Génère un fichier `test.json` avec des données aléatoires
   - Affiche le contenu dans l'interface

2. Le fichier `test.json` contient :
   - Un ID unique (UUID)
   - Un timestamp
   - Un contenu aléatoire

## Technologies Utilisées

- Vue.js 3 avec Composition API
- Electron
- Vite
- TypeScript
- IPC pour la communication entre processus