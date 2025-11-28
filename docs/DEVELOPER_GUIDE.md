# Guide du Développeur - Dashboard Qualité

Ce guide est destiné aux développeurs qui reprennent ou maintiennent ce projet.

## 🎯 Objectif du Projet

Créer un dashboard web pour visualiser les données de qualité (rebuts et production) de l'usine Merlin Gerin, en remplacement d'une solution basée sur Google Sheets par une solution 100% locale utilisant des exports Excel SAP.

## 🏗️ Architecture Globale

### Principe de Fonctionnement

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│     SAP     │────────▶│ Fichier Excel│────────▶│  Serveur    │
│   (ERP)     │  Export │  (.xlsx)     │  Lecture│  Node.js    │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │ API REST
                                                         │ (JSON)
                                                         ▼
                                                  ┌─────────────┐
                                                  │  Dashboard  │
                                                  │    Web      │
                                                  └─────────────┘
```

### Technologies Utilisées

**Frontend**:
- HTML5, CSS3, JavaScript (Vanilla ES6+)
- Bootstrap 5 (UI Framework)
- Chart.js (Graphiques)
- Font Awesome (Icônes)
- LocalStorage (Cache et authentification)

**Backend**:
- Node.js + Express (Serveur HTTP)
- `xlsx` (Lecture de fichiers Excel)
- `cors` (Cross-Origin Resource Sharing)

## 📂 Organisation du Code

### Frontend (`src/`)

```
src/
├── core/               # Modules fondamentaux
│   ├── auth.js        # Gestion de l'authentification
│   ├── data-manager.js # Gestion centralisée des données
│   └── utils.js       # Fonctions utilitaires
│
├── ui/                # Interface utilisateur
│   ├── ui-manager.js  # Gestion générale de l'UI
│   └── auth-ui.js     # UI d'authentification
│
├── modules/           # Modules fonctionnels
│   ├── data-connector.js    # ⭐ Connexion au serveur local
│   ├── rejects.js           # Analyse des rebuts
│   ├── production.js        # Analyse de la production
│   ├── documents.js         # Gestion des documents
│   ├── training.js          # Module de formation
│   ├── forms.js             # Formulaires
│   ├── fiche-etoile.js      # Fiche produit défectueux
│   ├── results.js           # Résultats qualité
│   ├── navigation.js        # Navigation
│   ├── activity.js          # Activités récentes
│   ├── chart.js             # Configuration des graphiques
│   └── date-input-hybrid.js # Gestion des dates
│
└── app.js             # Point d'entrée (initialisation)
```

### Backend (`server/`)

```
server/
├── server.js          # ⭐ Serveur Express principal
├── package.json       # Dépendances npm
├── create_mock_data.js # Générateur de données de test
└── data/
    └── sap_export.xlsx # Fichier Excel SAP (généré)
```

## 🔑 Modules Clés à Comprendre

### 1. `data-connector.js` (⭐ CRITIQUE)

**Rôle**: Remplace l'ancienne intégration Google Sheets. C'est le pont entre le frontend et le serveur Node.js.

**Fonctions principales**:
- `init()`: Initialise la connexion au serveur
- `connect()`: Établit la connexion et charge les données
- `fetchData()`: Récupère les données depuis `/api/data`
- `convertDataToRejects()`: Transforme les données Excel en format interne
- `getData()`: Retourne les données en cache

**Utilisé par**: `rejects.js`, `production.js`

### 2. `server.js` (⭐ CRITIQUE)

**Rôle**: Serveur backend qui lit le fichier Excel et expose une API REST.

**Endpoints**:
- `GET /api/data`: Retourne les données Excel en JSON
- `GET /health`: Health check du serveur
- `GET /`: Sert les fichiers statiques (le site web)

**Configuration importante**:
```javascript
// Ligne 15 - Chemin du fichier Excel
const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
```

### 3. `rejects.js`

**Rôle**: Module d'analyse des rebuts (pertes, coûts, statistiques par machine).

**Dépendances**: `DataConnectorModule` (pour les données)

**Fonctions clés**:
- `loadRejectData()`: Charge et filtre les données de rebuts
- `filterRejectData()`: Applique les filtres (date, machine, îlot)
- `updateStatistics()`: Calcule les statistiques
- `renderCostChart()`: Affiche le graphique des coûts

### 4. `production.js`

**Rôle**: Module d'analyse de la production (quantités, chiffre d'affaires).

**Particularité**: Filtre uniquement les machines `850MS*` et utilise le champ `productionQuantity`.

## 🔄 Flux de Données

### Au Démarrage de l'Application

1. **`app.js`** initialise tous les modules
2. **`DataConnectorModule.init()`** se connecte au serveur
3. Le serveur lit `sap_export.xlsx` et retourne les données
4. Les données sont stockées dans `localStorage` (clé: `rejectsData`)
5. **`RejectAnalysis`** et **`ProductionAnalysis`** chargent les données

### Lors d'un Rafraîchissement

1. L'utilisateur clique sur "Actualiser"
2. **`DataConnectorModule.fetchData()`** est appelé
3. Nouvelle requête à `/api/data`
4. Les modules consommateurs sont notifiés et rechargent leurs données

## 🛠️ Tâches de Maintenance Courantes

### Ajouter une Nouvelle Machine

1. Modifiez `rejects.js` et `production.js`:
```javascript
ilots: {
    PM1: ["122", "123", "135", "125", "NOUVEAU"],  // Ajoutez ici
    // ...
}
```

2. Aucune autre modification nécessaire (le système est dynamique).

### Modifier le Format des Données Excel

1. Ouvrez `data-connector.js`
2. Modifiez la fonction `convertDataToRejects()`:
```javascript
const getVal = (keys) => {
    // Ajoutez vos nouveaux noms de colonnes ici
    for (let k of keys) {
        const foundKey = Object.keys(row).find(rk => 
            rk.toLowerCase() === k.toLowerCase()
        );
        if (foundKey) return row[foundKey];
    }
    return null;
};
```

### Changer le Port du Serveur

1. `server/server.js` ligne 8:
```javascript
const PORT = 8080;  // Au lieu de 3000
```

2. `src/modules/data-connector.js` ligne 5:
```javascript
apiEndpoint: 'http://localhost:8080/api/data'
```

## 🧪 Tests et Débogage

### Générer des Données de Test

```bash
cd server
node create_mock_data.js
```

Cela crée 200 lignes de données réalistes dans `server/data/sap_export.xlsx`.

### Déboguer le Serveur

Ajoutez des logs dans `server.js`:
```javascript
console.log('Données lues:', jsonData.length, 'lignes');
```

### Déboguer le Frontend

Ouvrez la console du navigateur (F12):
```javascript
// Vérifier les données chargées
console.log(DataConnectorModule.getData());

// Vérifier la connexion
console.log(DataConnectorModule.isConnected);
```

## 📝 Conventions de Code

- **Nommage**: camelCase pour les variables et fonctions
- **Modules**: Pattern objet littéral avec méthodes
- **Commentaires**: En français, explicites
- **Indentation**: 4 espaces

## ⚠️ Points d'Attention

1. **Chemins Windows**: Toujours doubler les backslashes (`\\`)
2. **CORS**: Le serveur doit avoir `cors()` activé pour le développement local
3. **LocalStorage**: Limité à ~5-10MB, attention à la taille des données
4. **Compatibilité**: Testé sur Chrome, Edge, Firefox (pas IE11)

## 🚀 Déploiement

Voir le guide complet: [`docs/guides/DEPLOYMENT_GUIDE.md`](../guides/DEPLOYMENT_GUIDE.md)

**Checklist rapide**:
- [ ] Installer Node.js sur le serveur
- [ ] Copier l'ensemble du projet
- [ ] Configurer le chemin Excel dans `server.js`
- [ ] Exécuter `npm install` dans `server/`
- [ ] Lancer `node server.js`
- [ ] Vérifier l'accès via `http://[IP-SERVEUR]:3000`

## 📞 Questions Fréquentes

**Q: Pourquoi ne pas utiliser une base de données?**  
R: Le client veut utiliser directement les exports SAP sans transformation. Excel est le format natif.

**Q: Pourquoi Vanilla JS et pas React/Vue?**  
R: Simplicité de déploiement (pas de build), maintenance facile pour l'équipe interne.

**Q: Les données sont-elles sécurisées?**  
R: Oui, tout reste sur le réseau interne de l'entreprise. Pas d'accès externe.

---

**Bon courage pour la maintenance du projet !** 🎉
