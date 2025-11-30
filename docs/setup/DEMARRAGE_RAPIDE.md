# 🚀 Démarrage rapide - Google Sheets

## Votre spreadsheet est prêt !

**URL** : https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit

**ID** : `1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo`

---

## ⚡ Configuration en 3 étapes (5 minutes)

### 📋 Étape 1 : Créer une clé API Google

1. **Ouvrir** : [Google Cloud Console](https://console.cloud.google.com/)
2. **Créer un projet** : "Dashboard Qualite"
3. **Activer** : Google Sheets API (menu API et services > Bibliothèque)
4. **Créer** : Clé API (menu API et services > Identifiants)
5. **Copier** : Votre clé (commence par `AIzaSy...`)

📖 **Guide détaillé** : Voir `docs/CONFIGURATION_PERSONNALISEE.md` section "Étape 1"

---

### 🔓 Étape 2 : Partager votre Google Sheet

1. **Ouvrir** : [Votre Google Sheet](https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit)
2. **Cliquer** : "Partager" (en haut à droite)
3. **Modifier** : "Tous les utilisateurs disposant du lien"
4. **Mode** : "Lecteur" (lecture seule)
5. **Terminer** : Cliquer "Terminé"

✅ C'est tout ! Votre spreadsheet est maintenant accessible.

---

### ⚙️ Étape 3 : Configurer le dashboard

#### Option A : Configuration manuelle (recommandée)

1. **Ouvrir** : Le dashboard (index.html)
2. **Aller à** : Section "Analyse des Rebuts"
3. **Cliquer** : Bouton "Configuration" (vert)
4. **Remplir** :

   ```
   Clé API Google : [COLLEZ VOTRE CLÉ ICI]
   ID Spreadsheet : 1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo
   Plage : Sheet1!A:K
   ```

5. **Sauvegarder** et **Connecter**

#### Option B : Configuration automatique (avancé)

1. **Éditer** : `src/config/google-sheets-config.example.js`
2. **Remplacer** : `VOTRE_CLE_API_ICI` par votre vraie clé
3. **Vérifier** : Le nom de la feuille (`Sheet1` par défaut)
4. **Inclure** dans `index.html` :

   ```html
   <script src="src/config/google-sheets-config.example.js"></script>
   ```

5. **Recharger** : La configuration se fait automatiquement !

---

## 📊 Format requis dans Google Sheets

### En-têtes (première ligne)

```
Date | Machine | Matériel | Description | Quantité | Prix unitaire
```

### Exemple de données

```
2025-11-20 | MS085 | 04294964BE-EMB | MAGNETIC CONTACT FRAME | 589 | 0.07601
2025-11-19 | MS123 | AAV83736-OTS | 20A THERMAL SUB-ASSEMBLY | 150 | 0.12173
```

### Colonnes obligatoires

- ✅ **Date** : Format YYYY-MM-DD ou DD/MM/YYYY
- ✅ **Machine** : Code machine (MS085, MS120, etc.)
- ✅ **Matériel** : Code du matériel
- ✅ **Description** : Description du matériel
- ✅ **Quantité** : Nombre entier
- ✅ **Prix unitaire** : Nombre décimal (avec point)

### Colonnes optionnelles

- **Coût total** : Calculé automatiquement si absent
- **Raison** : dimension, aspect, fonction, matière, autre
- **Opérateur** : Nom de l'opérateur
- **Centre** : Centre de travail

---

## ✅ Vérification rapide

### Test 1 : URL de l'API

Ouvrez cette URL dans votre navigateur (remplacez `VOTRE_CLE` par votre clé API) :

```
https://sheets.googleapis.com/v4/spreadsheets/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/values/Sheet1!A:K?key=VOTRE_CLE
```

**Résultat attendu** : Vous voyez les données en JSON ✅

### Test 2 : Dashboard

1. Ouvrez le dashboard
2. Allez à "Analyse des Rebuts"
3. Cliquez "Connecter"
4. Vérifiez le message : "✓ Connecté à Google Sheets - X rebuts chargés"

---

## 🔧 Dépannage express

### ❌ "API key not valid"

→ Activez "Google Sheets API" dans Google Cloud Console

### ❌ "Permission denied"

→ Partagez le spreadsheet en lecture publique

### ❌ "Unable to parse range"

→ Vérifiez le nom de la feuille (Sheet1, Feuille 1, etc.)

### ❌ "0 rebuts chargés"

→ Vérifiez que la première ligne contient les en-têtes
→ Ouvrez F12 pour voir quelles lignes sont ignorées

📖 **Dépannage complet** : `docs/CONFIGURATION_PERSONNALISEE.md` section "Dépannage"

---

## 🎯 Utilisation

### Actualisation automatique

1. **Cocher** : "Actualisation auto (30s)"
2. **Résultat** : Données mises à jour toutes les 30 secondes

### Actualisation manuelle

1. **Cliquer** : Bouton "Actualiser" (orange)
2. **Résultat** : Données rechargées immédiatement

### Filtrage

1. **Sélectionner** : Machine et/ou dates
2. **Cliquer** : "Filtrer"
3. **Résultat** : Affichage filtré

---

## 📚 Documentation complète

- **Configuration détaillée** : `docs/CONFIGURATION_PERSONNALISEE.md`
- **Guide Google Sheets** : `docs/GOOGLE_SHEETS_INTEGRATION.md`
- **Guide Excel (alternative)** : `docs/EXCEL_IMPORT_GUIDE.md`
- **Corrections techniques** : `docs/CORRECTIONS_REBUTS.md`
- **Résumé complet** : `docs/INTEGRATION_COMPLETE.md`

---

## 🎉 C'est parti !

Une fois configuré, votre dashboard affichera automatiquement les données de votre Google Sheet en temps réel.

**Profitez bien de votre dashboard ! 📊**

---

## 💡 Conseils

✅ **Activez l'auto-refresh** uniquement quand vous utilisez le dashboard
✅ **Fermez le dashboard** quand vous ne l'utilisez pas (économise les requêtes API)
✅ **Consultez la console** (F12) pour déboguer en cas de problème
✅ **Gardez votre clé API** en sécurité (ne la partagez pas)

---

## 🆘 Besoin d'aide ?

1. **Consultez** : `docs/CONFIGURATION_PERSONNALISEE.md` (guide complet)
2. **Vérifiez** : Console du navigateur (F12)
3. **Testez** : URL de l'API (voir section "Vérification rapide")
4. **Contactez** : Administrateur système si nécessaire

---

**Dernière mise à jour** : 20 Novembre 2025
**Version** : 1.0
