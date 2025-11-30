# Configuration personnalisée pour votre Google Sheet

## 📋 Informations de votre spreadsheet

**URL de votre Google Sheet** :
```
https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit
```

**ID du Spreadsheet** (déjà extrait pour vous) :
```
1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo
```

---

## 🚀 Configuration rapide (3 étapes)

### Étape 1 : Obtenir une clé API Google (5 minutes)

#### 1.1 Accéder à Google Cloud Console

1. Ouvrez [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google

#### 1.2 Créer un projet

1. Cliquez sur le **sélecteur de projet** en haut (à côté de "Google Cloud")
2. Cliquez sur **"Nouveau projet"**
3. Nom du projet : `Dashboard Qualite Merlin Gerin`
4. Cliquez sur **"Créer"**
5. Attendez quelques secondes, puis sélectionnez votre nouveau projet

#### 1.3 Activer l'API Google Sheets

1. Dans le menu ☰ à gauche, allez à **"API et services"** → **"Bibliothèque"**
2. Dans la barre de recherche, tapez : `Google Sheets API`
3. Cliquez sur **"Google Sheets API"**
4. Cliquez sur le bouton bleu **"ACTIVER"**
5. Attendez l'activation (quelques secondes)

#### 1.4 Créer une clé API

1. Dans le menu ☰ à gauche, allez à **"API et services"** → **"Identifiants"**
2. En haut, cliquez sur **"+ CRÉER DES IDENTIFIANTS"**
3. Sélectionnez **"Clé API"**
4. Une popup s'ouvre avec votre clé : `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`
5. **IMPORTANT** : Copiez cette clé et gardez-la en sécurité
6. Cliquez sur **"FERMER"** (ou "Restreindre la clé" si vous voulez plus de sécurité)

#### 1.5 Restrictions de clé (optionnel mais recommandé)

Pour plus de sécurité :

1. Après création, cliquez sur votre clé API dans la liste
2. Sous **"Restrictions relatives aux API"** :
   - Cochez **"Restreindre la clé"**
   - Sélectionnez uniquement **"Google Sheets API"**
3. Cliquez sur **"ENREGISTRER"**

✅ **Vous avez maintenant votre clé API !**

---

### Étape 2 : Partager votre Google Sheet en lecture

#### 2.1 Ouvrir les paramètres de partage

1. Ouvrez votre Google Sheet : [Votre spreadsheet](https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit)
2. En haut à droite, cliquez sur le bouton **"Partager"**

#### 2.2 Modifier les permissions

1. Dans la popup, sous "Accès général", cliquez sur **"Modifier"**
2. Sélectionnez **"Tous les utilisateurs disposant du lien"**
3. Assurez-vous que le niveau d'accès est **"Lecteur"** (très important !)
4. Cliquez sur **"Terminé"**

⚠️ **Important** : Le mode "Lecteur" garantit que le dashboard peut LIRE mais jamais MODIFIER vos données.

✅ **Votre spreadsheet est maintenant accessible en lecture !**

---

### Étape 3 : Configurer le dashboard

#### 3.1 Ouvrir le dashboard

1. Ouvrez votre dashboard qualité (index.html)
2. Allez à la section **"Tableau de bord"**
3. Descendez jusqu'à **"Analyse des Rebuts"**
4. Vous verrez la section verte **"Connexion Google Sheets"**

#### 3.2 Configuration

1. Cliquez sur le bouton **"Configuration"** (vert, avec icône ⚙️)
2. Une fenêtre s'ouvre avec 3 champs à remplir

**Remplissez exactement comme suit** :

**Champ 1 : Clé API Google**
```
[COLLEZ ICI VOTRE CLÉ API]
Exemple : AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Champ 2 : ID ou URL du Spreadsheet**
```
1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo
```
ℹ️ Vous pouvez aussi coller l'URL complète, l'ID sera extrait automatiquement.

**Champ 3 : Plage de données**
```
Sheet1!A:K
```
ℹ️ Si votre feuille a un autre nom (ex: "Rebuts", "Données"), remplacez "Sheet1" par le nom exact.

3. Cliquez sur **"Sauvegarder"**

#### 3.3 Se connecter

1. Après avoir sauvegardé, cliquez sur le bouton **"Connecter"** (bleu, avec icône 🔗)
2. Le système se connecte à Google Sheets
3. Vous verrez un message : **"✓ Connecté à Google Sheets"**
4. Le nombre de rebuts chargés s'affiche

✅ **Configuration terminée !**

---

## 🔄 Activer l'actualisation automatique

Pour que les données se mettent à jour automatiquement toutes les 30 secondes :

1. Cochez la case **"Actualisation auto (30s)"**
2. Le système commence à actualiser automatiquement
3. Vous verrez une notification à chaque mise à jour

💡 **Conseil** : Activez l'auto-refresh uniquement quand vous utilisez le dashboard.

---

## 📊 Vérifier le format de vos données

### Format attendu dans votre Google Sheet

**Première ligne (en-têtes)** - obligatoire :
```
Date | Machine | Matériel | Description | Quantité | Prix unitaire | Coût total | Raison | Opérateur
```

**Lignes de données** - exemple :
```
2025-11-20 | MS085 | 04294964BE-EMB | MAGNETIC CONTACT FRAME | 589 | 0.07601 | 44.77 | dimension | Jean Dupont
```

### Colonnes obligatoires

| Nom colonne | Type | Exemple | Notes |
|-------------|------|---------|-------|
| **Date** | Date | 2025-11-20 | Format YYYY-MM-DD ou DD/MM/YYYY |
| **Machine** | Texte | MS085 | Code de la machine |
| **Matériel** | Texte | 04294964BE-EMB | Code du matériel |
| **Description** | Texte | MAGNETIC CONTACT... | Description du matériel |
| **Quantité** | Nombre | 589 | Quantité de rebut (entier) |
| **Prix unitaire** | Nombre | 0.07601 | Prix en euros (décimal avec point) |

### Colonnes optionnelles

| Nom colonne | Type | Calculé si absent |
|-------------|------|-------------------|
| Coût total | Nombre | Quantité × Prix unitaire |
| Raison | Texte | "other" |
| Opérateur | Texte | "Google Sheets" |
| Centre | Texte | "" (vide) |

### Valeurs acceptées pour "Raison"

- `dimension` ou `dimensionnelle` → Non-conformité dimensionnelle
- `aspect` ou `appearance` → Défaut d'aspect
- `fonction` ou `function` → Défaut fonctionnel
- `matière` ou `material` → Défaut matière
- `autre` ou `other` → Autre

---

## 🎯 Configuration complète en copier-coller

**Voici vos valeurs exactes à copier dans le dashboard** :

### Clé API Google
```
[VOTRE CLÉ ICI - commence par AIzaSy]
```

### ID du Spreadsheet
```
1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo
```

### Plage de données
```
Sheet1!A:K
```
ℹ️ Si le nom de votre feuille est différent, remplacez "Sheet1" par le nom exact (visible en bas du Google Sheet).

### Noms de feuille courants

Si votre feuille s'appelle :
- **Sheet1** → `Sheet1!A:K`
- **Feuille 1** → `Feuille 1!A:K`
- **Rebuts** → `Rebuts!A:K`
- **Données** → `Données!A:K`

---

## 🧪 Test de connexion

### Vérification étape par étape

#### 1. Test de l'URL de l'API

Vous pouvez tester si votre configuration fonctionne en ouvrant cette URL dans votre navigateur :

```
https://sheets.googleapis.com/v4/spreadsheets/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/values/Sheet1!A:K?key=VOTRE_CLE_API
```

⚠️ Remplacez `VOTRE_CLE_API` par votre vraie clé !

**Si ça fonctionne** : Vous verrez les données en format JSON
**Si erreur 403** : Le spreadsheet n'est pas partagé en lecture
**Si erreur 400** : La plage est incorrecte (vérifiez le nom de la feuille)
**Si erreur 403 "API key not valid"** : L'API Google Sheets n'est pas activée

#### 2. Test dans le dashboard

1. Ouvrez la console du navigateur (F12)
2. Cliquez sur "Connecter" dans le dashboard
3. Regardez les logs dans la console :
   - ✅ `Connected X rejects from Google Sheets` → Succès !
   - ❌ Erreur affichée → Voir la section Dépannage

---

## ❌ Dépannage

### Erreur : "API key not valid"

**Causes possibles** :
- ❌ L'API Google Sheets n'est pas activée
- ❌ La clé API est incorrecte ou incomplète
- ❌ Les restrictions de la clé bloquent l'accès

**Solutions** :
1. Vérifiez que vous avez activé "Google Sheets API" dans Google Cloud Console
2. Copiez à nouveau la clé API (elle commence par `AIzaSy`)
3. Vérifiez que la clé n'a pas de restrictions qui bloquent votre domaine
4. Si nécessaire, créez une nouvelle clé API sans restrictions

### Erreur : "The caller does not have permission"

**Causes possibles** :
- ❌ Le spreadsheet n'est pas partagé en lecture publique
- ❌ L'ID du spreadsheet est incorrect

**Solutions** :
1. Vérifiez que le spreadsheet est partagé : "Tous les utilisateurs disposant du lien" en mode "Lecteur"
2. Vérifiez l'ID : `1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo`
3. Essayez d'ouvrir le spreadsheet en navigation privée pour vérifier qu'il est bien public

### Erreur : "Unable to parse range"

**Causes possibles** :
- ❌ Le nom de la feuille est incorrect
- ❌ Le format de la plage est incorrect

**Solutions** :
1. Vérifiez le nom exact de votre feuille (visible en bas du Google Sheet)
2. Utilisez le format : `NomDeLaFeuille!A:K`
3. Si le nom contient des espaces : `'Nom avec espaces'!A:K`

### Erreur : "Aucune donnée trouvée"

**Causes possibles** :
- ❌ La feuille est vide
- ❌ La plage ne contient pas de données
- ❌ Les en-têtes sont manquants

**Solutions** :
1. Vérifiez que la première ligne contient les en-têtes de colonnes
2. Vérifiez qu'il y a au moins une ligne de données
3. Vérifiez que la plage inclut toutes les colonnes (A:K)

### "0 rebuts chargés" mais pas d'erreur

**Causes possibles** :
- ❌ Les colonnes obligatoires sont manquantes
- ❌ Les noms de colonnes ne correspondent pas
- ❌ Les données sont invalides (dates incorrectes, quantités = 0, etc.)

**Solutions** :
1. Ouvrez la console du navigateur (F12)
2. Regardez les warnings : `Ligne X ignorée (données manquantes)`
3. Vérifiez que les colonnes obligatoires ont les bons noms
4. Vérifiez le format des dates (YYYY-MM-DD recommandé)
5. Vérifiez que les quantités sont > 0

---

## 📱 Utilisation quotidienne

### Workflow recommandé

**Matin** :
1. Votre logiciel génère les données dans Google Sheets
2. Ouvrez le dashboard
3. Les données sont automatiquement chargées

**Pendant la journée** :
1. Activez "Actualisation auto (30s)"
2. Le dashboard se met à jour automatiquement
3. Consultez les statistiques en temps réel

**Analyse** :
1. Filtrez par machine ou date
2. Consultez les graphiques d'évolution
3. Exportez ou imprimez si nécessaire

### Commandes disponibles

| Action | Bouton | Description |
|--------|--------|-------------|
| 🔧 **Configuration** | Vert | Modifier la clé API / ID spreadsheet |
| 🔗 **Connecter** | Bleu | Se connecter à Google Sheets |
| 🔄 **Actualiser** | Orange | Recharger les données manuellement |
| ⏱️ **Auto (30s)** | Case à cocher | Actualisation automatique |
| 🔍 **Filtrer** | Dans la section filtres | Filtrer par machine/date |

---

## 🔒 Sécurité

### ✅ Ce qui est sécurisé

- La clé API est stockée uniquement dans votre navigateur (localStorage)
- Le dashboard ne peut que LIRE les données, jamais les modifier
- Communication HTTPS avec Google
- Aucune donnée n'est envoyée à des serveurs tiers

### ⚠️ Points d'attention

- La clé API est visible dans le localStorage du navigateur
- Le spreadsheet public est lisible par toute personne ayant le lien
- Ne commitez pas la clé API dans Git

### 💡 Recommandations

1. **Pour plus de sécurité** : Restreignez la clé API à votre domaine
2. **Sauvegarde** : Gardez une copie de votre clé API dans un endroit sûr
3. **Monitoring** : Surveillez l'utilisation de votre clé dans Google Cloud Console
4. **Rotation** : Changez la clé API périodiquement (tous les 6 mois)

---

## 📊 Quotas et limites

### API Google Sheets (gratuit)

- **500 requêtes/jour** : Quota par défaut
- **60 requêtes/minute** : Limite de débit

### Utilisation estimée

**Actualisation manuelle** : 1 requête par clic

**Actualisation automatique (30s)** :
- 2 requêtes/minute
- 120 requêtes/heure
- Pour 8h de travail = ~960 requêtes/jour

⚠️ **En dessous de la limite !**

💡 **Astuce** : Fermez le dashboard quand vous ne l'utilisez pas.

---

## 📞 Support

### En cas de problème

1. **Consultez cette documentation**
2. **Vérifiez la console du navigateur** (F12)
3. **Vérifiez votre configuration Google Cloud**
4. **Vérifiez les permissions du spreadsheet**
5. **Contactez l'administrateur système**

### Ressources

- **Documentation Google Sheets API** : https://developers.google.com/sheets/api
- **Google Cloud Console** : https://console.cloud.google.com/
- **Guide complet** : `GOOGLE_SHEETS_INTEGRATION.md`

---

## ✅ Checklist de configuration

Cochez au fur et à mesure :

- [ ] Compte Google Cloud créé
- [ ] Projet créé : "Dashboard Qualite Merlin Gerin"
- [ ] API Google Sheets activée
- [ ] Clé API créée et copiée
- [ ] Spreadsheet partagé en lecture publique
- [ ] ID du spreadsheet vérifié : `1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo`
- [ ] Nom de la feuille identifié (Sheet1, Feuille 1, etc.)
- [ ] Colonnes vérifiées dans le spreadsheet
- [ ] Dashboard configuré (clé API + ID + plage)
- [ ] Connexion réussie
- [ ] Données chargées et affichées
- [ ] ✅ **Tout fonctionne !**

---

**Bon courage pour la configuration ! 🚀**

Si vous avez des questions ou rencontrez des problèmes, consultez la section Dépannage ou contactez le support.
