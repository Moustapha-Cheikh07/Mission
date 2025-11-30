# Guide d'intégration Google Sheets

## Vue d'ensemble

Le système permet maintenant une **synchronisation automatique en temps réel** avec Google Sheets. Vos données de rebuts générées par votre logiciel dans Google Sheets sont automatiquement importées et affichées dans le tableau de bord.

## Avantages de l'intégration Google Sheets

✅ **Temps réel** : Actualisation automatique toutes les 30 secondes (optionnel)
✅ **Pas de téléchargement** : Connexion directe via API Google
✅ **Automatique** : Pas besoin de fichiers manuels
✅ **Fiable** : Utilise l'API officielle Google Sheets
✅ **Sécurisé** : Clé API stockée localement dans le navigateur
✅ **Flexible** : Compatible avec tout spreadsheet Google Sheets

---

## Étape 1 : Préparer votre Google Sheet

### 1.1 Format du spreadsheet

Votre Google Sheet doit contenir les colonnes suivantes (l'ordre n'est pas important) :

| Colonne | Variations acceptées | Type | Obligatoire |
|---------|---------------------|------|-------------|
| Date | DATE, date | Date | ✓ |
| Machine | MACHINE, machine | Texte | ✓ |
| Matériel | Material, materiel, code matériel | Texte | ✓ |
| Description | DESCRIPTION, description | Texte | ✓ |
| Quantité | Quantity, quantite, quantité de rebut | Nombre | ✓ |
| Prix unitaire | Unit Price, unitPrice, unit price | Nombre | ✓ |
| Coût total | Total Cost, totalCost, cout total | Nombre | |
| Raison | Reason, reason | Texte | |
| Opérateur | Operator, operateur, operator | Texte | |
| Centre | Workcenter, work center, centre | Texte | |

### 1.2 Exemple de spreadsheet

```
A          B        C                  D                                  E         F                G            H          I
Date       Machine  Matériel           Description                        Quantité  Prix unitaire    Coût total   Raison     Opérateur
2025-11-20 MS085    04294964BE-EMB     MAGNETIC CONTACT FRAME             589       0.07601          44.77        dimension  Jean Dupont
2025-11-19 MS123    AAV83736-OTS       20A MULTIPOLAR THERMAL SUB-ASSY    150       0.12173          18.26        fonction   Marie Martin
2025-11-18 MS120    04290013AC-EMB     MAGNETIC CONTACT FRAME 25A         300       0.10502          31.51        aspect     Pierre Bernard
```

### 1.3 Formats de date acceptés

- **YYYY-MM-DD** : 2025-11-20 (recommandé)
- **DD/MM/YYYY** : 20/11/2025
- **Date Google Sheets** : Formatée automatiquement

---

## Étape 2 : Créer une clé API Google

### 2.1 Accéder à Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Connectez-vous avec votre compte Google

### 2.2 Créer un projet (si nécessaire)

1. En haut à gauche, cliquez sur le nom du projet
2. Cliquez sur **"Nouveau projet"**
3. Donnez un nom (ex: "Dashboard Qualité Merlin Gerin")
4. Cliquez sur **"Créer"**

### 2.3 Activer l'API Google Sheets

1. Dans le menu, allez à **"API et services" > "Bibliothèque"**
2. Recherchez **"Google Sheets API"**
3. Cliquez sur **"Google Sheets API"**
4. Cliquez sur le bouton **"Activer"**

### 2.4 Créer une clé API

1. Dans le menu, allez à **"API et services" > "Identifiants"**
2. Cliquez sur **"Créer des identifiants"**
3. Sélectionnez **"Clé API"**
4. Une clé est générée (exemple : `AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
5. **IMPORTANT** : Copiez cette clé et conservez-la en sécurité

### 2.5 Restrictions (optionnel mais recommandé)

Pour plus de sécurité, vous pouvez restreindre votre clé API :

1. Cliquez sur votre clé API dans la liste
2. Sous **"Restrictions de l'application"** :
   - Sélectionnez **"Référents HTTP (sites web)"**
   - Ajoutez votre domaine (ex: `https://votre-domaine.com/*`)
3. Sous **"Restrictions relatives aux API"** :
   - Sélectionnez **"Restreindre la clé"**
   - Choisissez uniquement **"Google Sheets API"**
4. Cliquez sur **"Enregistrer"**

---

## Étape 3 : Partager votre Google Sheet

### 3.1 Obtenir l'ID du Spreadsheet

L'ID se trouve dans l'URL de votre Google Sheet :

```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                                      ↑_____________ID du Spreadsheet______________↑
```

Copiez cette partie de l'URL.

### 3.2 Rendre le spreadsheet accessible

**Option A : Partage public (recommandé pour la simplicité)**

1. Dans votre Google Sheet, cliquez sur **"Partager"** en haut à droite
2. Cliquez sur **"Modifier"** à côté de "Accès restreint"
3. Sélectionnez **"Tous les utilisateurs disposant du lien"**
4. Assurez-vous que le niveau d'accès est **"Lecteur"**
5. Cliquez sur **"Terminé"**

**Option B : Partage avec un compte de service (plus sécurisé)**

1. Créez un compte de service dans Google Cloud Console
2. Téléchargez la clé JSON
3. Partagez le spreadsheet avec l'email du compte de service

---

## Étape 4 : Configuration dans le Dashboard

### 4.1 Ouvrir le dashboard

1. Ouvrez votre dashboard qualité
2. Allez à la section **"Analyse des Rebuts"**
3. Vous verrez la section verte **"Connexion Google Sheets"**

### 4.2 Configurer la connexion

1. Cliquez sur le bouton **"Configuration"**
2. Remplissez le formulaire :

   **Clé API Google** :
   ```
   AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

   **ID ou URL du Spreadsheet** :
   ```
   1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
   ```
   OU l'URL complète :
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```

   **Plage de données** :
   ```
   Sheet1!A:K
   ```
   (Où "Sheet1" est le nom de votre feuille et A:K signifie "colonnes A à K")

3. Cliquez sur **"Sauvegarder"**

### 4.3 Se connecter

1. Après la configuration, cliquez sur **"Connecter"**
2. Le système se connecte et charge les données
3. Un message de succès s'affiche avec le nombre de rebuts chargés

### 4.4 Activer l'actualisation automatique (optionnel)

1. Cochez la case **"Actualisation auto (30s)"**
2. Les données seront automatiquement actualisées toutes les 30 secondes
3. Vous recevrez une notification à chaque actualisation

---

## Utilisation

### Actualisation manuelle

Pour recharger les dernières données depuis Google Sheets :

1. Cliquez sur le bouton **"Actualiser"**
2. Les nouvelles données sont chargées immédiatement
3. Les statistiques et graphiques se mettent à jour automatiquement

### Actualisation automatique

Si activée :
- Les données sont rechargées toutes les 30 secondes
- Une notification discrète confirme chaque actualisation
- Les graphiques et tableaux se mettent à jour automatiquement
- Vous voyez toujours les données les plus récentes

### Vérifier la connexion

La zone de statut affiche :
- ✅ **Connecté à Google Sheets** (vert) : Connexion active
- ⚠️ **Configuré mais non connecté** (orange) : Configuration OK mais déconnecté
- ℹ️ **Configuration requise** (bleu) : Pas encore configuré

Les informations affichées :
- Nom et ID du spreadsheet
- Nombre de rebuts chargés
- Heure de dernière mise à jour

---

## Dépannage

### Erreur "API key not valid"

**Problème** : La clé API n'est pas valide

**Solutions** :
1. Vérifiez que vous avez copié la clé complète
2. Vérifiez que l'API Google Sheets est activée dans votre projet
3. Vérifiez les restrictions de la clé API (domaine, API autorisées)
4. Créez une nouvelle clé API si nécessaire

### Erreur "The caller does not have permission"

**Problème** : Le spreadsheet n'est pas accessible

**Solutions** :
1. Vérifiez que le spreadsheet est partagé en lecture publique
2. Vérifiez l'ID du spreadsheet dans l'URL
3. Assurez-vous que le spreadsheet existe et n'est pas supprimé

### Erreur "Unable to parse range"

**Problème** : La plage spécifiée n'est pas valide

**Solutions** :
1. Vérifiez le nom de la feuille (Sheet1, Feuille 1, etc.)
2. Utilisez le format : `NomFeuille!ColonneDébut:ColonneFin`
3. Exemples valides :
   - `Sheet1!A:K`
   - `Feuille 1!A:L`
   - `Rebuts!A:Z`

### Aucune donnée chargée

**Problème** : 0 rebuts chargés malgré une connexion réussie

**Solutions** :
1. Vérifiez que la première ligne contient les en-têtes
2. Vérifiez que les noms de colonnes correspondent (voir section 1.1)
3. Vérifiez que les lignes contiennent toutes les données obligatoires
4. Consultez la console du navigateur (F12) pour voir les lignes ignorées

### Données incorrectes

**Problème** : Les données affichées sont incorrectes

**Solutions** :
1. Vérifiez le format des dates dans Google Sheets
2. Vérifiez que les nombres utilisent le point comme séparateur décimal
3. Vérifiez la plage de données (toutes les colonnes sont-elles incluses ?)
4. Actualisez les données manuellement

---

## Format détaillé des colonnes

### Colonnes obligatoires

#### Date
- **Format recommandé** : YYYY-MM-DD (2025-11-20)
- **Formats acceptés** : DD/MM/YYYY, dates formatées Google Sheets
- **Exemple** : 2025-11-20

#### Machine
- **Type** : Texte
- **Valeurs acceptées** : MS085, MS120, MS122, MS123, MS135, MS158, H1131, H1136, H1138
- **Exemple** : MS085

#### Matériel
- **Type** : Texte
- **Description** : Code du matériel
- **Exemple** : 04294964BE-EMB

#### Description
- **Type** : Texte
- **Description** : Description du matériel
- **Exemple** : MAGNETIC CONTACT FRAME

#### Quantité
- **Type** : Nombre entier
- **Description** : Quantité de rebut
- **Exemple** : 589

#### Prix unitaire
- **Type** : Nombre décimal
- **Description** : Prix unitaire en euros
- **Format** : Utiliser le point comme séparateur décimal
- **Exemple** : 0.07601

### Colonnes optionnelles

#### Coût total
- **Type** : Nombre décimal
- **Description** : Coût total (calculé automatiquement si absent)
- **Calcul** : Quantité × Prix unitaire
- **Exemple** : 44.77

#### Raison
- **Type** : Texte
- **Valeurs acceptées** :
  - `dimension` ou `dimensionnelle` : Non-conformité dimensionnelle
  - `aspect` ou `appearance` : Défaut d'aspect
  - `fonction`, `function` ou `fonctionnel` : Défaut fonctionnel
  - `matière`, `material` ou `matiere` : Défaut matière
  - `autre` ou `other` : Autre
- **Défaut** : other
- **Exemple** : dimension

#### Opérateur
- **Type** : Texte
- **Description** : Nom de l'opérateur
- **Défaut** : Google Sheets
- **Exemple** : Jean Dupont

#### Centre
- **Type** : Texte
- **Description** : Centre de travail
- **Exemple** : 850MS085

---

## Sécurité et bonnes pratiques

### Protection de la clé API

⚠️ **IMPORTANT** :
- Ne partagez JAMAIS votre clé API publiquement
- Ne commitez JAMAIS la clé dans Git
- La clé est stockée localement dans le navigateur (localStorage)
- Utilisez les restrictions de clé API (domaine, API)

### Partage du spreadsheet

✅ **Recommandé** :
- Partage en lecture seule publique pour simplicité
- Le dashboard ne peut que lire, jamais écrire
- Les données sont en lecture seule

⚠️ **Attention** :
- Ne partagez pas en écriture
- Ne mettez pas de données sensibles dans le spreadsheet public

### Performance

💡 **Conseils** :
- Limitez la plage aux colonnes nécessaires (A:K au lieu de A:Z)
- Évitez les spreadsheets avec des milliers de lignes
- Utilisez des filtres dans le dashboard pour limiter l'affichage
- L'actualisation automatique consomme des requêtes API (quota: 500/jour gratuit)

---

## Workflow recommandé

### Configuration initiale (une seule fois)

1. ✅ Créer un projet Google Cloud
2. ✅ Activer l'API Google Sheets
3. ✅ Créer une clé API
4. ✅ Partager le spreadsheet en lecture
5. ✅ Configurer le dashboard
6. ✅ Se connecter

### Utilisation quotidienne

1. Votre logiciel génère les données dans Google Sheets
2. Le dashboard charge automatiquement les données (si auto-refresh activé)
3. Vous consultez les statistiques et graphiques à jour
4. Vous pouvez actualiser manuellement à tout moment

---

## Limites et quotas

### API Google Sheets (gratuit)

- **Requêtes par jour** : 500 (quota par défaut)
- **Requêtes par minute** : 60
- **Requêtes par 100 secondes par utilisateur** : 100

### Calcul de l'utilisation

- **Actualisation manuelle** : 1 requête par clic
- **Actualisation automatique (30s)** :
  - 2 requêtes/minute
  - 120 requêtes/heure
  - ~2880 requêtes/jour (si le dashboard reste ouvert 24h)

⚠️ **Recommandation** :
- N'activez l'auto-refresh que quand nécessaire
- Fermez le dashboard quand vous ne l'utilisez pas
- Ou augmentez l'intervalle de rafraîchissement si nécessaire

---

## Support et assistance

### Ressources

- **Documentation Google Sheets API** : https://developers.google.com/sheets/api
- **Console développeur Google** : https://console.cloud.google.com/
- **Guide de démarrage rapide** : Ce document

### En cas de problème

1. Consultez la section **Dépannage** ci-dessus
2. Vérifiez la console du navigateur (F12) pour les erreurs
3. Vérifiez votre configuration dans Google Cloud Console
4. Vérifiez les permissions du spreadsheet
5. Contactez l'administrateur système si nécessaire

---

## Annexes

### Exemple complet de configuration

```javascript
// Configuration
Clé API: AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
Spreadsheet ID: 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
Plage: Sheet1!A:K
Auto-refresh: ✓ Activé
```

### URL complète de l'API utilisée

```
https://sheets.googleapis.com/v4/spreadsheets/{spreadsheetId}/values/{range}?key={apiKey}
```

### Exemple de réponse de l'API

```json
{
  "range": "Sheet1!A1:K100",
  "majorDimension": "ROWS",
  "values": [
    ["Date", "Machine", "Matériel", "Description", ...],
    ["2025-11-20", "MS085", "04294964BE-EMB", "MAGNETIC CONTACT FRAME", ...]
  ]
}
```

---

**Développé le** : 20 Novembre 2025
**Version** : 1.0
**Compatible avec** : Google Sheets API v4
**Testés sur** : Chrome, Firefox, Edge
