# 📝 Changelog - Dashboard Qualité

Tous les changements notables de ce projet sont documentés dans ce fichier.

---

## [2.0.0] - 2025-01-26 - Réorganisation Majeure

### ✨ Ajouté
- **Nouvelle documentation structurée** avec guides numérotés (00 à 05)
- **README principal** clair et concis avec badges
- **FAQ complète** avec solutions aux problèmes courants
- **Scripts utilitaires** pour faciliter installation et démarrage
  - `scripts/start.bat` (Windows)
  - `scripts/start.sh` (Linux/Mac)
  - `scripts/install.bat` (Installation automatique)
  - `scripts/backup.sh` (Sauvegarde automatique)
- **Module ServerSync** pour communication avec la base de données
- **Stockage permanent** en base de données SQLite

### 🔧 Modifié
- **Structure du projet** complètement réorganisée
- **Documentation** consolidée dans `/docs`
- **Anciens documents** archivés dans `/docs/archive-ancien-systeme`
- **Chargement dynamique** des machines 850MS (toutes les 24 machines)

### 🐛 Corrigé
- **Filtrage machines** : Affiche maintenant les 24 machines au lieu de 22
- **Lecture colonne WORKCENTER** : Support de la colonne WORKCENTER dans Excel
- **Format prix** : Conversion automatique virgule → point pour les prix
- **Perte de données** : Base de données SQLite au lieu de localStorage (en cours)

### 📚 Documentation
- `README.md` - Point d'entrée principal
- `docs/00-GUIDE-RAPIDE.md` - Démarrage en 5 minutes
- `docs/02-CONFIGURATION.md` - Configuration détaillée
- `docs/FAQ.md` - Questions fréquentes
- `CHANGELOG.md` - Ce fichier

---

## [1.5.0] - 2025-01-25 - Corrections et Améliorations

### 🐛 Corrigé
- Problème de filtrage des machines 850MS
- Conversion des prix (virgule vs point)
- Lecture de la colonne WORKCENTER

### ✨ Ajouté
- Support dynamique de toutes les machines depuis le fichier Excel
- Module data-connector.js amélioré
- Gestion des erreurs plus robuste

---

## [1.0.0] - 2025-01-20 - Version Initiale

### ✨ Fonctionnalités Initiales

#### Analyse de Production
- Suivi des quantités produites par machine 850MS
- Graphiques par îlot (PM1, PM2, BZ1, BZ2, GRM)
- Calcul du chiffre d'affaires
- Filtres par date et machine

#### Analyse des Rebuts
- Suivi des quantités rebutées
- Classification par motif
- Graphiques et statistiques
- Top machines à problèmes

#### Gestion Documentaire
- Upload de documents qualité
- Documents de formation
- Recherche et filtrage
- Stockage local (localStorage)

#### Fiches Étoile
- Création de fiches de non-conformité
- Suivi des actions correctives
- Historique complet

#### Système
- Backend Node.js + Express
- Frontend HTML/CSS/JS Vanilla
- Lecture fichiers Excel (XLSX)
- Base de données SQLite
- Authentification simple

---

## Types de Changements

- `✨ Ajouté` : Nouvelles fonctionnalités
- `🔧 Modifié` : Changements dans des fonctionnalités existantes
- `🐛 Corrigé` : Corrections de bugs
- `🗑️ Supprimé` : Fonctionnalités retirées
- `🔐 Sécurité` : Correctifs de sécurité
- `📚 Documentation` : Changements dans la documentation

---

## Format

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).
