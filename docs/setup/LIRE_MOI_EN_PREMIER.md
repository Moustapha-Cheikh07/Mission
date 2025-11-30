# 🚀 TOUT EST PRÊT ! Suivez ces 2 étapes

## ✅ Votre configuration est TERMINÉE !

```
Clé API     : AIzaSyBbmXLynxJbYr4RTXjHa30yyd6AAbw2d_0 ✅
Spreadsheet : 1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo ✅
Plage       : Sheet1!A:AT ✅
```

**Votre dashboard va se connecter automatiquement à Google Sheets !** 🎉

---

## 📝 Il ne reste QUE 2 choses à faire :

### ✅ Étape 1 : Partager votre Google Sheet (30 secondes)

**IMPORTANT** : Sans cette étape, le dashboard ne pourra pas lire vos données !

1. **Cliquez ici** pour ouvrir votre Google Sheet :
   👉 [**OUVRIR MON GOOGLE SHEET**](https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit)

2. **En haut à droite**, cliquez sur **"Partager"** ou **"Share"**

3. **Dans la popup** :
   - Cliquez sur **"Modifier"** (sous "Accès général")
   - Sélectionnez **"Tous les utilisateurs disposant du lien"**
   - **Mode** : **"Lecteur"** (très important !)
   - Cliquez **"Terminé"**

### Ce que vous devez voir :
```
┌───────────────────────────────────────────┐
│ Accès général                             │
│ ┌───────────────────────────────────────┐ │
│ │ 🌐 Tous... disposant du lien          │ │
│ │    Lecteur ▼                          │ │
│ └───────────────────────────────────────┘ │
└───────────────────────────────────────────┘
```

⚠️ **Le mode "Lecteur" est essentiel** : permet la lecture mais PAS la modification.

---

### ✅ Étape 2 : Tester le dashboard (10 secondes)

1. **Ouvrez** : `index.html` dans votre navigateur

2. **Attendez 1-2 secondes**
   - La configuration se charge automatiquement
   - La connexion s'établit automatiquement

3. **Allez à** la section "Analyse des Rebuts"

4. **Vous devriez voir** :
   ```
   ┌─────────────────────────────────────────┐
   │ ✓ Connecté à Google Sheets              │
   │ Dernière mise à jour: 20/11/2025 15:45  │
   │ XX rebuts chargés                       │
   └─────────────────────────────────────────┘
   ```

5. **Vos données s'affichent** dans les statistiques et graphiques ! 🎊

---

## 🧪 Test rapide AVANT d'ouvrir le dashboard

**Vérifiez que tout fonctionne** en cliquant sur ce lien :

👉 [**CLIQUER ICI POUR TESTER LA CONNEXION**](https://sheets.googleapis.com/v4/spreadsheets/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/values/Sheet1!A:AT?key=AIzaSyBbmXLynxJbYr4RTXjHa30yyd6AAbw2d_0)

### Résultats :

✅ **Vous voyez du JSON avec vos données** → Parfait ! Ouvrez le dashboard !

❌ **Erreur 403 "permission denied"** → Le spreadsheet n'est pas partagé (faites l'étape 1)

❌ **Erreur 400 "Unable to parse range"** → Le nom de votre feuille n'est pas "Sheet1"
   - Regardez en bas de votre Google Sheet pour voir le nom
   - Si c'est "Feuille 1" ou "Rebuts", lisez le fichier `TEST_CONNEXION.md`

---

## 📊 Format requis dans votre Google Sheet

### En-têtes (première ligne) :

Votre Google Sheet doit avoir ces colonnes **obligatoires** :

```
Date | Machine | Matériel | Description | Quantité | Prix unitaire
```

### Exemple de données :

```
2025-11-20 | MS085 | 04294964BE-EMB | MAGNETIC CONTACT FRAME | 589 | 0.07601
2025-11-19 | MS123 | AAV83736-OTS | 20A THERMAL SUB-ASSY   | 150 | 0.12173
```

**Points importants** :
- **Date** : Format `YYYY-MM-DD` (2025-11-20) ou `DD/MM/YYYY` (20/11/2025)
- **Prix unitaire** : Utilisez le **point** comme séparateur (0.07601, PAS 0,07601)
- **Quantité** : Nombre entier

---

## 🎯 Que se passe-t-il maintenant ?

### Quand vous ouvrez index.html :

1. ⚡ **Chargement automatique** de la configuration
2. 🔌 **Connexion automatique** à Google Sheets
3. 📊 **Chargement automatique** des données
4. 📈 **Affichage automatique** des statistiques et graphiques

**Vous n'avez RIEN à configurer manuellement !** Tout est déjà dans le code.

---

## 🔄 Actualisation automatique

Pour avoir les données en temps réel :

1. Dans le dashboard, **cochez** :
   ```
   ☑ Actualisation auto (30s)
   ```

2. Les données se mettent à jour toutes les 30 secondes

3. Vous recevez une notification à chaque mise à jour

---

## ❌ Si quelque chose ne fonctionne pas

### Problème : "Permission denied"

**Solution** : Le spreadsheet n'est pas partagé
→ Suivez l'étape 1 ci-dessus

### Problème : "0 rebuts chargés"

**Solutions** :
1. Vérifiez que la première ligne contient les en-têtes
2. Vérifiez que les noms de colonnes sont corrects
3. Ouvrez F12 → Console pour voir quelles lignes sont ignorées

### Problème : "Unable to parse range"

**Solution** : Le nom de votre feuille n'est pas "Sheet1"
→ Consultez `TEST_CONNEXION.md` section "Vérifier le nom de votre feuille"

### Problème : "API key not valid"

**Solution** : L'API Google Sheets n'est pas activée
→ Consultez `CREER_CLE_API.md` section "Activer l'API"

---

## 📚 Documentation complète

Si vous voulez plus de détails :

- **Test de connexion** : `TEST_CONNEXION.md`
- **Créer une clé API** : `CREER_CLE_API.md`
- **Configuration détaillée** : `docs/CONFIGURATION_PERSONNALISEE.md`
- **Guide complet** : `docs/INTEGRATION_COMPLETE.md`

---

## ✅ Checklist ultra-rapide

- [x] Clé API créée ✅
- [x] Configuration dans le code ✅
- [ ] Spreadsheet partagé en lecture ⚠️ **À FAIRE !**
- [ ] Dashboard testé

---

## 🎉 C'est tout !

Une fois le spreadsheet partagé (étape 1), **tout fonctionne automatiquement** !

**Ouvrez simplement index.html et profitez de vos données en temps réel ! 🚀**

---

**Dernière mise à jour** : 20 Novembre 2025
**Version** : Configuration automatique activée
