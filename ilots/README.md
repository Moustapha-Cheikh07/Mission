# 🏭 Pages Îlots - Écrans d'Atelier

## 📋 Vue d'ensemble

Ce dossier contient les **5 pages dédiées aux îlots de production** pour affichage sur les écrans d'atelier. Chaque page affiche uniquement les données de son îlot spécifique avec actualisation automatique.

---

## 🎯 Pages Disponibles

| Îlot | Fichier | URL d'accès | Couleur Header |
|------|---------|-------------|----------------|
| **PM1** | `pm1.html` | `http://serveur:3000/ilots/pm1.html` | 🔵 Bleu |
| **PM2** | `pm2.html` | `http://serveur:3000/ilots/pm2.html` | 🟢 Vert |
| **BZ1** | `bz1.html` | `http://serveur:3000/ilots/bz1.html` | 🔴 Rouge/Rose |
| **BZ2** | `bz2.html` | `http://serveur:3000/ilots/bz2.html` | 🟡 Rose/Jaune |
| **GRM** | `grm.html` | `http://serveur:3000/ilots/grm.html` | 🟣 Cyan/Violet |

---

## ⚙️ Fonctionnement

### Système de Cache Journalier

Les pages îlots utilisent un **système de cache optimisé** pour éviter les blocages :

```
┌─────────────────────────────────────────────┐
│  Cron Job - 8h30 chaque matin               │
│  ↓                                          │
│  Lit fichier Excel SAP (1 seule fois)      │
│  ↓                                          │
│  Calcule données pour chaque îlot          │
│  ↓                                          │
│  Stocke en cache JSON                       │
│  - pm1-data.json                            │
│  - pm2-data.json                            │
│  - bz1-data.json                            │
│  - bz2-data.json                            │
│  - grm-data.json                            │
└─────────────────────────────────────────────┘
         ↓ (Lecture instantanée)
┌─────────────────────────────────────────────┐
│  Pages Îlots (écrans d'atelier)             │
│  ⚡ Chargement ultra-rapide (<0.1s)         │
│  ⚡ Pas de calcul, juste lecture JSON       │
│  ⚡ Données valables toute la journée       │
└─────────────────────────────────────────────┘
```

### Avantages

- ✅ **Chargement instantané** - Pas de latence
- ✅ **Pas de blocage** - Pas de calcul en temps réel
- ✅ **Données fraîches** - Mises à jour automatiquement à 8h30
- ✅ **Pas de surcharge serveur** - Lecture fichier Excel 1 fois/jour
- ✅ **Fiabilité** - Les écrans restent toujours réactifs

---

## 📊 Contenu des Pages

Chaque page îlot affiche :

### 1. Header Professionnel
- Logo Schneider Electric
- Nom de l'îlot en grand
- Date du jour
- Heure de dernière mise à jour

### 2. Statistiques Résumées
- **Coût Total Rebuts** (€)
- **Quantité Rebuts** (pièces)
- **Production Totale** (pièces)
- **Taux de Rebut** (%)

### 3. Graphiques Interactifs
- **Coût des Rebuts par Machine** (barres)
- **Répartition Rebuts par Motif** (donut)
- **Production par Machine** (barres)

### 4. Tableau Top Machines
- Liste des machines avec le plus de rebuts
- Quantités et coûts détaillés

---

## 🚀 Déploiement sur Écrans d'Atelier

### Configuration d'un Écran

1. **Connecter l'écran** au réseau de l'entreprise
2. **Ouvrir un navigateur** (Chrome, Edge, Firefox)
3. **Accéder à l'URL** de l'îlot correspondant :
   ```
   http://serveur:3000/ilots/pm1.html
   ```
4. **Mettre en plein écran** (F11)
5. **Configurer le navigateur** :
   - Désactiver la mise en veille
   - Désactiver les mises à jour automatiques
   - Configurer l'auto-refresh (optionnel)

### Exemple : Écran PM1

```bash
# URL à ouvrir sur l'écran près de l'îlot PM1
http://192.168.1.100:3000/ilots/pm1.html

# Remplacer 192.168.1.100 par l'IP du serveur
```

---

## 🔧 Configuration Serveur

Le serveur Node.js doit être configuré avec le cron job à 8h30 :

```javascript
// server/server.js (ligne 36)
cron.schedule('30 8 * * *', async () => {
    console.log('⏰ [CRON] Rafraîchissement caches îlots - 8h30');
    await ilotCacheManager.refreshIlotCaches();
}, {
    timezone: "Europe/Paris"
});
```

### Rafraîchissement Manuel

Si nécessaire, vous pouvez forcer la mise à jour des caches :

```bash
# Via API (POST)
curl -X POST http://localhost:3000/api/ilots/refresh

# Via navigateur
# Accéder à : http://localhost:3000/api/ilots/refresh
```

### Vérifier l'état des caches

```bash
# Via API (GET)
curl http://localhost:3000/api/ilots/info

# Via navigateur
# Accéder à : http://localhost:3000/api/ilots/info
```

---

## 🎨 Personnalisation

### Changer la Couleur d'un Îlot

Éditer le fichier HTML de l'îlot et modifier la ligne :

```css
/* Exemple pour PM1 */
.ilot-header {
    background: linear-gradient(135deg, #3C8CE7 0%, #00EAFF 100%);
}
```

### Changer l'Heure de Mise à Jour

Éditer `server/server.js` ligne 36 :

```javascript
// Exemple : 7h00 au lieu de 8h30
cron.schedule('0 7 * * *', async () => {
    await ilotCacheManager.refreshIlotCaches();
}, { timezone: "Europe/Paris" });
```

### Ajouter un Nouvel Îlot

1. Copier un fichier HTML existant
2. Modifier le nom de l'îlot dans le fichier
3. Ajouter l'îlot dans `server/ilot-cache-manager.js` :
   ```javascript
   const ILOTS = ['PM1', 'PM2', 'BZ1', 'BZ2', 'GRM', 'NOUVEAU'];
   ```
4. Mettre à jour la fonction `getIlotFromMachine()`

---

## 📁 Structure des Fichiers

```
ilots/
├── pm1.html              # Page îlot PM1
├── pm2.html              # Page îlot PM2
├── bz1.html              # Page îlot BZ1
├── bz2.html              # Page îlot BZ2
├── grm.html              # Page îlot GRM
├── customize-ilots.js    # Script de personnalisation
└── README.md             # Ce fichier

server/
├── ilot-cache-manager.js # Gestionnaire cache îlots
├── cache/
│   ├── pm1-data.json     # Cache PM1
│   ├── pm2-data.json     # Cache PM2
│   ├── bz1-data.json     # Cache BZ1
│   ├── bz2-data.json     # Cache BZ2
│   └── grm-data.json     # Cache GRM
└── server.js             # Serveur avec cron jobs
```

---

## 🐛 Dépannage

### Page blanche ou erreur de chargement

1. Vérifier que le serveur est démarré
2. Vérifier l'URL (majuscules/minuscules)
3. Vérifier que le cache existe : `ls server/cache/*.json`
4. Consulter les logs serveur

### Données non actualisées

1. Vérifier que le cron job s'est exécuté à 8h30
2. Forcer le rafraîchissement : `POST /api/ilots/refresh`
3. Vérifier les logs du serveur

### Écran figé ou lent

- Les pages îlots sont optimisées pour être ultra-rapides
- Si lent : problème réseau ou serveur arrêté
- Recharger la page (F5)

---

## 📞 Support

Pour toute question ou problème :
- Consulter les logs serveur : `pm2 logs dashboard-qualite`
- Vérifier l'état des caches : `GET /api/ilots/info`
- Contacter l'équipe IT

---

## ✅ Checklist de Déploiement

- [ ] Serveur démarré et accessible
- [ ] Cron job 8h30 configuré
- [ ] Caches îlots générés (vérifier `server/cache/`)
- [ ] URLs testées dans un navigateur
- [ ] Écrans d'atelier configurés
- [ ] Mode plein écran activé
- [ ] Mise en veille désactivée
- [ ] Tests de chargement réalisés

---

**🔥 Les pages îlots sont maintenant prêtes pour déploiement !**

Dernière mise à jour : 27 novembre 2025
