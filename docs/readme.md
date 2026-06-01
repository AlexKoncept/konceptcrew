# 🔮 KonceptCrew — Votre Équipe d'Élite IA Personnalisée

> **« Your AI Crew. Your Way. »**  
> Une plateforme d'orchestration de spécialistes IA ultra-personnalisés, dotée d'une interface utilisateur d'élite inspirée des meilleurs standards de design modernes. Conçue pour offrir des sessions de travail fluides, immersives et locales-premières.

---

## 🎨 Vue d'ensemble du Projet

**KonceptCrew** est une application web innovante structurée pour la création, la personnalisation et l'orchestration de spécialistes IA (les *crews*). Chaque spécialiste possède un profil sur-mesure (avatar, directives système, modèle d'IA, pack de connaissances RAG dédié).

L’application a été méticuleusement polie pour correspondre fidèlement aux maquettes de design les plus avancées : thèmes de couleurs harmonieux, transitions d'état fluides, animations micro-interactives et composants d'affichage riches (visualisations géométriques, rapports de sessions).

---

## ✨ Fonctionnalités Majeures

### 💻 1. Gestion d'Équipage Réactive & Favoris
* **Système de Favoris Dynamique** : Marquez vos spécialistes d'une étoile pour les épingler instantanément au sommet de votre sidebar dans la section exclusive `Favoris`.
* **Rendu d'État Avancé** : Indicateurs visuels dynamiques d'activité (*waves* audio décoratives interactives et indicateurs « En ligne »).
* **Création Holistique** : Créez ou modifiez un spécialiste avec le formulaire du `Studio de Création`, générez un avatar par IA ou importez le vôtre.

### 🎙️ 2. Écran Immersif de Session Vocale (Live Voice Mode)
* Un bandeau d'appel vocal interactif répliquant fidèlement la maquette de référence :
  * Double analyseur de spectre en temps réel (un spectre bleu électrique pour la voix de l'utilisateur, un spectre rose magenta pour l'écoute du spécialiste IA).
  * Avatar central magnifié par des anneaux lumineux et des ombres portées dynamiques multi-couleurs en gradient (`#5969F3`, `pink`, `cyan`).
  * Contrôle complet du microphone avec retours d'état visuels.

### 🖼️ 3. Ingénierie de Prompt & Génération d'Images Intégrée
* **Illustrations à la demande** : L'IA utilise la puissance multimodale pour traduire l'explication courante en image illustrative, au clic d'un bouton ou de façon proactive.
* **Génération d'Avatars** : Créez des visuels de profils via une IA visuelle depuis le Studio.
* **Agnostique au fournisseur** : Tous les appels de génération visuelle transitent par un proxy serveur interne robuste, prenant en charge Gemini (Imagen 3), OpenAI (DALL-E 3) et les LLM de pointe exécutés en local (LM Studio, Ollama).

### 📑 4. RAG expert & Export de Rapports Scientifiques
* **Docs & RAG** : Association et injection à la volée de packs de connaissances exclusifs textuels directement dans le contexte du modèle.
* **Export Markdown d'Élite** : Génération instantanée d'un compte rendu de session complet et structuré au format Markdown (`.md`) d'un seul clic.

### 🛡️ 5. Contrôle d'Usine & Sécurité
* **Purger d'Urgence** : Un panneau de confirmation modal hautement visuel avec avertissements de sécurité esthétiques pour réinitialiser le cache local ou vider l'historique sans risque d'erreur d’inattention.

---

## 🚀 Installation & Développement

### Prérequis
* **Node.js** v18+  
* **npm** ou **yarn**  

### Procédure de Lancement rapide

1. **Installer les dépendances** :
```bash
npm install
```

2. **Configurer les Variables d'Environnement** :
Créez un fichier `.env` à la racine à partir du modèle fourni dans `.env.example` :
```env
GEMINI_API_KEY=votre_clef_ici
```

3. **Lancer le serveur de développement** :
```bash
npm run dev
```
L'interface est accessible par défaut sur `http://localhost:3000`.

4. **Compiler pour la production** :
```bash
npm run build
```

---

## 📦 Préparation pour publication (checklist rapide)

Avant de rendre le dépôt public, vérifiez les points suivants :

- Le fichier `.env.example` est présent et **les vraies clés ne doivent jamais** être commitées.
- Le fichier `.gitignore` exclut `node_modules/`, `dist/` et les fichiers `.env*`.
- `README.md`, `CONTRIBUTING.md` et `LICENSE` sont présents (licence MIT par défaut).
- Le workflow CI est configuré pour exécuter `npm ci`, `npm run lint` et `npm run build`.

Commandes utiles pour publier (exemple) :

```bash
git init
git add .
git commit -m "Prepare project for public release"
# Créez le repo distant sur GitHub puis :
git remote add origin https://github.com/USER/REPO.git
git branch -M main
git push -u origin main
```

---

## 🔧 CI & Qualité

Un workflow GitHub Actions basique a été ajouté pour lancer le linting TypeScript et la construction de production sur push/PR. Cela aide à garantir que le build passe automatiquement avant la publication.

---

## 📂 Architecture des Dossiers

```text
/
├── docs/                      # Documentation technique
│   ├── readme.md              # Guide d'utilisation principal (ce fichier)
│   └── audit.md               # Audit de code et de conformité design
├── src/
│   ├── assets/                # Ressources statiques, icônes et logos
│   ├── components/            # Composants React modulaires et robustes
│   │   ├── ChatContainer.tsx  # Zone de discussion principale & Live Vocals
│   │   ├── Sidebar.tsx        # Navigation, Barre de recherche et Favoris
│   │   ├── StudioCreation.tsx # Panneau droit de modification de l'équipage
│   │   ├── SettingsPanel.tsx  # Configuration générale, clef API et Purge
│   │   └── StatsDashboard.tsx # Outil d'analyse financière et de quotas
│   ├── services/              # Proxy d'appels API & d'intégration LLM
│   ├── types.ts               # Types de données unifiés en TypeScript
│   ├── App.tsx                # Point de montage de l'application & routage
│   └── index.css              # Feuille de style globale propulsée par Tailwind CSS
```

---

## 💎 Design System & Palette de Couleurs

L'interface de KonceptCrew repose sur l'esthétique **Vibe Slate & Glassmorphism** de pointe :
* **Dégradé Principal (Glow / Purple-Indigo)** : `from-[#5969F3] via-[#7d51f7] to-[#ec4899]` sublimé par des halos lumineux d'arrière-plan en mode clair et en mode sombre.
* **Fonds Légers & Acolytes** : pour un confort oculaire optimal.
* **Typographie d'Élite** : Sans-serif par défaut à l'interligne aérée, complétée par des polices Monospace contrastées pour les données techniques.
