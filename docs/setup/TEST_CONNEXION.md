# ✅ Test de votre connexion Google Sheets

## 🎉 Votre configuration actuelle

```javascript
Clé API     : AIzaSyBbmXLynxJbYr4RTXjHa30yyd6AAbw2d_0 ✅
Spreadsheet : 1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo ✅
Plage       : Sheet1!A:AT ✅
```

**Tout est configuré dans le code !** 🎊

---

## 🧪 Test immédiat (30 secondes)

### Méthode 1 : Test dans le navigateur

**Cliquez sur ce lien** pour vérifier que tout fonctionne :

👉 [**CLIQUER ICI POUR TESTER**](https://sheets.googleapis.com/v4/spreadsheets/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/values/Sheet1!A:AT?key=AIzaSyBbmXLynxJbYr4RTXjHa30yyd6AAbw2d_0)

### Résultats possibles :

#### ✅ **Succès !**
Vous voyez du JSON avec vos données :
```json
{
  "range": "Sheet1!A1:AT100",
  "majorDimension": "ROWS",
  "values": [
    ["Date", "Machine", "Matériel", "Description", ...],
    ["2025-11-20", "MS085", "04294964BE-EMB", ...]
  ]
}
```
**→ Parfait ! Passez à l'étape suivante.**

#### ❌ **Erreur 403 : "The caller does not have permission"**
```json
{
  "error": {
    "code": 403,
    "message": "The caller does not have permission"
  }
}
```
**→ Le spreadsheet n'est pas partagé. Suivez les instructions ci-dessous.**

#### ❌ **Erreur 400 : "Unable to parse range"**
```json
{
  "error": {
    "code": 400,
    "message": "Unable to parse range"
  }
}
```
**→ Le nom de votre feuille n'est pas "Sheet1". Vérifiez en bas de votre Google Sheet.**

---

## 🔓 Partager votre Google Sheet (OBLIGATOIRE)

### Étapes à suivre :

1. **Ouvrez votre Google Sheet** :
   👉 [Cliquer ici](https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit)

2. **En haut à droite**, cliquez sur le bouton **"Partager"** (ou "Share")

3. **Dans la popup** :
   - Cliquez sur **"Modifier"** (sous "Accès général" ou "General access")
   - Sélectionnez **"Tous les utilisateurs disposant du lien"** ("Anyone with the link")
   - **Important** : Mode = **"Lecteur"** ou **"Viewer"** (PAS éditeur !)
   - Cliquez **"Terminé"** ou **"Done"**

### Capture d'écran de ce que vous devez voir :

```
┌────────────────────────────────────────────────┐
│ Partager "Votre nom de spreadsheet"           │
├────────────────────────────────────────────────┤
│                                                │
│ Accès général                                  │
│ ┌────────────────────────────────────────────┐ │
│ │ 🌐 Tous les utilisateurs disposant du lien│ │
│ │    Lecteur ▼                    [Modifier]│ │
│ └────────────────────────────────────────────┘ │
│                                                │
│                              [Terminé]         │
└────────────────────────────────────────────────┘
```

4. **Testez à nouveau** le lien ci-dessus

---

## 🚀 Lancer le dashboard

### Une fois le spreadsheet partagé :

1. **Ouvrez** : `index.html` dans votre navigateur

2. **Attendez 1-2 secondes**
   - La configuration se charge automatiquement
   - La connexion s'établit automatiquement

3. **Vous devriez voir** dans la section "Connexion Google Sheets" :
   ```
   ✓ Connecté à Google Sheets
   Dernière mise à jour: 20/11/2025 15:45
   XX rebuts chargés
   ```

4. **Vos données s'affichent** automatiquement dans :
   - Les cartes statistiques (en haut)
   - Le graphique d'évolution
   - Les tableaux de détails

---

## 🔍 Vérifier le nom de votre feuille

Si vous avez l'erreur "Unable to parse range" :

1. **Ouvrez** votre Google Sheet
2. **Regardez en bas** de la page
3. **Notez le nom exact** de l'onglet (ex: "Sheet1", "Feuille 1", "Rebuts", etc.)

### Si ce n'est PAS "Sheet1" :

**Modifiez** `src/modules/google-sheets.js` ligne 7 :

```javascript
// Avant
range: 'Sheet1!A:AT',

// Après (remplacez VotreNomDeFeuille par le vrai nom)
range: 'VotreNomDeFeuille!A:AT',
```

**Exemples** :
- Si votre feuille s'appelle "Rebuts" → `range: 'Rebuts!A:AT',`
- Si votre feuille s'appelle "Feuille 1" → `range: 'Feuille 1!A:AT',`
- Si votre feuille s'appelle "Données" → `range: 'Données!A:AT',`

---

## 📊 Vérifier le format de vos données

### En-têtes requis (première ligne) :

Votre Google Sheet doit avoir **au minimum** ces colonnes :

```
Date | Machine | Matériel | Description | Quantité | Prix unitaire
```

### Exemple de données valides :

```
┌────────────┬─────────┬──────────────┬──────────────┬──────────┬────────────────┐
│ Date       │ Machine │ Matériel     │ Description  │ Quantité │ Prix unitaire  │
├────────────┼─────────┼──────────────┼──────────────┼──────────┼────────────────┤
│ 2025-11-20 │ MS085   │ 04294964BE..│ MAGNETIC...  │ 589      │ 0.07601        │
│ 2025-11-19 │ MS123   │ AAV83736-OTS│ 20A MULTI... │ 150      │ 0.12173        │
└────────────┴─────────┴──────────────┴──────────────┴──────────┴────────────────┘
```

### Formats acceptés :

- **Date** : `2025-11-20` ou `20/11/2025`
- **Machine** : `MS085`, `MS120`, etc.
- **Quantité** : Nombre entier (589, 150, etc.)
- **Prix unitaire** : Nombre décimal avec **point** (0.07601, pas 0,07601)

---

## 🎯 Checklist finale

Vérifiez que vous avez fait :

- [ ] Créé une clé API Google ✅ (vous l'avez !)
- [ ] Activé Google Sheets API ✅
- [ ] Partagé le spreadsheet en lecture publique ⚠️ (à vérifier)
- [ ] Testé le lien de test ci-dessus
- [ ] Vérifié le nom de la feuille (Sheet1 ou autre)
- [ ] Vérifié les en-têtes de colonnes
- [ ] Ouvert index.html
- [ ] Vu le message "Connecté à Google Sheets"
- [ ] Les données s'affichent dans le dashboard

---

## 🔄 Actualisation automatique

Pour activer l'actualisation automatique toutes les 30 secondes :

1. Dans le dashboard, **cochez** la case :
   ```
   ☑ Actualisation auto (30s)
   ```

2. Les données se mettent à jour automatiquement

3. Vous recevez une notification à chaque mise à jour

---

## ❌ Problèmes courants

### "Rien ne s'affiche dans le dashboard"

**Vérifications** :
1. Ouvrez la console du navigateur (F12)
2. Regardez s'il y a des erreurs en rouge
3. Vérifiez que le spreadsheet est bien partagé
4. Testez le lien de test en haut de ce document

### "0 rebuts chargés"

**Causes possibles** :
- Les noms de colonnes ne correspondent pas
- Les données sont invalides (dates, quantités = 0)
- La plage ne contient pas de données

**Solution** :
1. Ouvrez F12 → Console
2. Cherchez les warnings : "Ligne X ignorée"
3. Corrigez les données dans Google Sheets

### "The caller does not have permission"

**Solution** :
- Le spreadsheet n'est PAS partagé en lecture publique
- Suivez les instructions "Partager votre Google Sheet" ci-dessus

---

## 🎉 Tout fonctionne ?

### Vous devriez voir :

1. ✅ **Section verte** : "Connecté à Google Sheets"
2. ✅ **Statistiques** : Coût total, quantité, machine la plus coûteuse
3. ✅ **Graphique** : Évolution des rebuts par machine
4. ✅ **Tableaux** : Détails de tous les rebuts

### Prochaines étapes :

1. **Utilisez le dashboard** normalement
2. **Activez l'auto-refresh** si vous voulez des mises à jour automatiques
3. **Filtrez** par machine ou date pour analyser les données
4. **Profitez** de vos données en temps réel ! 🚀

---

## 📞 Support

Si quelque chose ne fonctionne pas :

1. **Testez** le lien de test en haut de ce document
2. **Ouvrez** F12 → Console pour voir les erreurs
3. **Consultez** : `docs/CONFIGURATION_PERSONNALISEE.md` (dépannage complet)
4. **Vérifiez** : Que le spreadsheet est bien partagé

---

**Votre configuration est prête ! Il ne reste qu'à partager le spreadsheet et tout fonctionnera ! 🎊**
