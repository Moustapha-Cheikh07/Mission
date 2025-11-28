# 🔑 Créer votre clé API Google - Guide ultra-simple

## ⏱️ Temps nécessaire : 3 minutes

---

## 🎯 Étape 1 : Aller sur Google Cloud Console (30 secondes)

### Cliquez sur ce lien :
👉 **[CLIQUER ICI POUR OUVRIR GOOGLE CLOUD CONSOLE](https://console.cloud.google.com/)**

Vous arrivez sur une page bleue avec le logo Google Cloud.

---

## 🆕 Étape 2 : Créer un nouveau projet (1 minute)

### Actions à faire :

1. **En haut de la page**, vous voyez "Sélectionner un projet"
2. **Cliquez dessus**
3. Une fenêtre s'ouvre
4. **Cliquez sur** "NOUVEAU PROJET" (en haut à droite)

### Remplissez le formulaire :

```
┌───────────────────────────────────────────┐
│ Nom du projet *                           │
│ ┌───────────────────────────────────────┐ │
│ │ Dashboard-Qualite-Merlin-Gerin        │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Organisation : Aucune organisation        │
│                                           │
│                    [Annuler]  [CRÉER] ✓  │
└───────────────────────────────────────────┘
```

5. **Cliquez sur** "CRÉER"
6. **Attendez 10 secondes** (une barre de progression s'affiche)

✅ **Votre projet est créé !**

---

## 🔌 Étape 3 : Activer l'API Google Sheets (1 minute)

### Lien direct :
👉 **[CLIQUER ICI POUR ACTIVER GOOGLE SHEETS API](https://console.cloud.google.com/apis/library/sheets.googleapis.com)**

### Actions à faire :

1. **Sélectionnez votre projet** : "Dashboard-Qualite-Merlin-Gerin"
   - Si demandé, cliquez sur le nom du projet en haut
2. Vous voyez une page avec "Google Sheets API"
3. **Cliquez sur le bouton bleu** "ACTIVER"
4. **Attendez 5 secondes**

✅ **L'API est activée !**

---

## 🔑 Étape 4 : Créer votre clé API (1 minute)

### Lien direct :
👉 **[CLIQUER ICI POUR CRÉER LA CLÉ API](https://console.cloud.google.com/apis/credentials)**

### Actions à faire :

1. Vous êtes sur la page "Identifiants"
2. **En haut**, cliquez sur "+ CRÉER DES IDENTIFIANTS"
3. Dans le menu déroulant, **cliquez sur** "Clé API"

### Une fenêtre s'ouvre avec votre clé :

```
┌──────────────────────────────────────────────────────┐
│  ✓ Clé API créée                                     │
│                                                       │
│  Votre nouvelle clé API :                            │
│  ┌────────────────────────────────────────────────┐  │
│  │ AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx    │  │
│  │                                         [📋]  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  ⚠️ Conservez-la en lieu sûr                         │
│                                                       │
│               [Restreindre la clé]  [FERMER]         │
└──────────────────────────────────────────────────────┘
```

4. **Cliquez sur l'icône de copie** 📋 (à droite de la clé)
5. **OU** Sélectionnez toute la clé et copiez-la (Ctrl+C)

### 🎉 Votre clé ressemble à ça :
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

6. **IMPORTANT** : Collez cette clé dans un fichier texte temporaire (Notepad)
7. **Cliquez sur** "FERMER"

✅ **Votre clé API est créée !**

---

## 📋 Étape 5 : Copier votre clé API

**IMPORTANT** : Votre clé doit ressembler exactement à ceci :

```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

- ✅ Commence par `AIzaSy`
- ✅ Contient des lettres majuscules, minuscules, chiffres
- ✅ Longueur : environ 39 caractères
- ✅ PAS d'espaces

### Exemple de clé valide :
```
AIzaSyBxK7hI-GjmHnfP3QRs4TuVwX5yZ6-AbC0
```

### ❌ Erreurs courantes :
```
❌ AIzaSy xxx (avec des espaces)
❌ AIzaSy... (incomplète)
❌ Google API Key (texte au lieu de la clé)
```

---

## ✅ Récapitulatif : Vous avez maintenant

- ✅ Un projet Google Cloud : "Dashboard-Qualite-Merlin-Gerin"
- ✅ L'API Google Sheets activée
- ✅ Une clé API qui commence par `AIzaSy...`

---

## 🎯 Étape suivante : Configuration du dashboard

### Maintenant que vous avez votre clé API :

1. **Ouvrez** : `index.html` (le dashboard)
2. **Allez à** : Section "Analyse des Rebuts"
3. **Cliquez** : Bouton "Configuration" (vert avec icône ⚙️)

### Remplissez le formulaire :

```
┌─────────────────────────────────────────────────────┐
│ Configuration Google Sheets                         │
├─────────────────────────────────────────────────────┤
│                                                       │
│ Clé API Google *                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ [COLLEZ VOTRE CLÉ ICI]                          │ │
│ │ AIzaSyBxK7hI-GjmHnfP3QRs4TuVwX5yZ6-AbC0        │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ ID ou URL du Spreadsheet *                          │
│ ┌─────────────────────────────────────────────────┐ │
│ │ 1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo   │ │
│ └─────────────────────────────────────────────────┘ │
│ (Déjà rempli pour vous ✓)                           │
│                                                       │
│ Plage de données                                    │
│ ┌─────────────────────────────────────────────────┐ │
│ │ Sheet1!A:K                                       │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│              [Annuler]  [Sauvegarder] ✓             │
└─────────────────────────────────────────────────────┘
```

4. **Cliquez** : "Sauvegarder"
5. **Cliquez** : "Connecter" (bouton bleu)

### Vous devriez voir :
```
┌────────────────────────────────────────────────┐
│ ✓ Connecté à Google Sheets                    │
│ Dernière mise à jour: 20/11/2025 15:30        │
│ 45 rebuts chargés                             │
└────────────────────────────────────────────────┘
```

✅ **C'est fait ! Vos données sont synchronisées !**

---

## 🔓 IMPORTANT : Partager votre Google Sheet

**Avant de tester**, assurez-vous que votre Google Sheet est accessible :

1. **Ouvrez** : [Votre Google Sheet](https://docs.google.com/spreadsheets/d/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/edit)
2. **Cliquez** : "Partager" (bouton en haut à droite)
3. **Dans la popup** :
   - Cliquez sur "Modifier" sous "Accès général"
   - Sélectionnez "Tous les utilisateurs disposant du lien"
   - Vérifiez que le mode est "Lecteur"
   - Cliquez "Terminé"

⚠️ **Le mode "Lecteur" est essentiel** : permet la lecture mais pas la modification.

---

## 🧪 Test de connexion

Pour vérifier que tout fonctionne, **ouvrez cette URL** dans votre navigateur :

```
https://sheets.googleapis.com/v4/spreadsheets/1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo/values/Sheet1!A:K?key=VOTRE_CLE_API
```

**Remplacez** `VOTRE_CLE_API` par votre vraie clé !

### Résultats possibles :

✅ **Succès** : Vous voyez du JSON avec vos données
```json
{
  "range": "Sheet1!A:K",
  "values": [
    ["Date", "Machine", "Matériel", ...],
    ["2025-11-20", "MS085", "04294964BE-EMB", ...]
  ]
}
```

❌ **Erreur 403** : Le spreadsheet n'est pas partagé → Partagez-le en lecture
❌ **Erreur 400** : La plage est incorrecte → Vérifiez le nom de la feuille
❌ **Erreur "API key not valid"** : L'API n'est pas activée → Activez Google Sheets API

---

## 🔒 Sécurité

### ✅ Votre clé API est stockée :
- Dans le navigateur (localStorage)
- PAS sur Internet
- PAS sur un serveur

### ⚠️ Ne partagez JAMAIS votre clé API :
- ❌ Sur GitHub
- ❌ Par email
- ❌ Sur des forums publics
- ❌ Dans le code source public

### 💡 Pour plus de sécurité (optionnel) :

1. Dans Google Cloud Console, allez à "Identifiants"
2. Cliquez sur votre clé API
3. Sous "Restrictions relatives aux API" :
   - Sélectionnez "Restreindre la clé"
   - Cochez uniquement "Google Sheets API"
4. Cliquez "Enregistrer"

---

## ❌ Problèmes fréquents

### "Je ne trouve pas le bouton CRÉER"
→ Vérifiez que vous êtes sur la bonne page
→ Essayez le lien direct : https://console.cloud.google.com/projectcreate

### "On me demande de configurer la facturation"
→ Cliquez sur "Ignorer" ou "Plus tard"
→ Les 500 requêtes/jour sont gratuites

### "La clé ne fonctionne pas"
→ Vérifiez qu'elle est complète (environ 39 caractères)
→ Vérifiez qu'elle commence par `AIzaSy`
→ Recréez une nouvelle clé si nécessaire

### "Erreur 403 dans le dashboard"
→ Le spreadsheet n'est pas partagé en lecture publique
→ Partagez-le : "Tous les utilisateurs disposant du lien" en mode "Lecteur"

---

## 📞 Besoin d'aide ?

Si vous êtes bloqué :

1. **Prenez une capture d'écran** de l'erreur
2. **Ouvrez la console** du navigateur (F12)
3. **Vérifiez les messages** d'erreur
4. **Consultez** : `docs/CONFIGURATION_PERSONNALISEE.md` section Dépannage

---

## ✅ Checklist finale

Avant de dire "C'est fini", vérifiez :

- [ ] Projet Google Cloud créé ✓
- [ ] API Google Sheets activée ✓
- [ ] Clé API créée et copiée ✓
- [ ] Google Sheet partagé en lecture ✓
- [ ] Clé API collée dans le dashboard ✓
- [ ] ID du spreadsheet rempli : `1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo` ✓
- [ ] Plage remplie : `Sheet1!A:K` ✓
- [ ] Connexion réussie ✓
- [ ] Données affichées ✓

### 🎉 Tout est OK ? Profitez de votre dashboard en temps réel !

---

**Durée totale** : 3-5 minutes
**Niveau de difficulté** : ⭐⭐☆☆☆ (Facile)
**Une fois fait, c'est pour toujours** : Vous n'aurez plus jamais besoin de refaire ces étapes !
