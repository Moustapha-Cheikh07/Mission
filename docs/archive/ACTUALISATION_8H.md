# 🕗 Actualisation Automatique à 8h

## ✅ Configuration Terminée

Le système d'actualisation automatique a été modifié pour se synchroniser **tous les jours à 8h du matin** au lieu de toutes les 30 secondes.

---

## 📋 Modifications Effectuées

### 1. `src/modules/google-sheets.js`

#### Configuration (lignes 3-10)
```javascript
config: {
    apiKey: 'AIzaSyBbmXLynxJbYr4RTXjHa30yyd6AAbw2d_0',
    spreadsheetId: '1H3PlSQJnUF1QIWHIUf4oEA4N8JtL83XkPxdeOQxe0uo',
    range: 'CONFIRMATION BRIDGE!A:AT',
    refreshHour: 8, // ⭐ Heure de rafraîchissement (8h)
    autoRefresh: false
}
```

#### Nouvelle Fonction : `getMillisecondsUntilNextRefresh()` (lignes 518-534)
Calcule le temps restant jusqu'à 8h du matin :
- Si on est avant 8h → calcule jusqu'à 8h aujourd'hui
- Si on est après 8h → calcule jusqu'à 8h demain

#### Fonction Modifiée : `startAutoRefresh()` (lignes 536-555)
- ❌ **Ancien** : `setInterval()` toutes les 30 secondes
- ✅ **Nouveau** : `setTimeout()` jusqu'à 8h, puis reprogramme pour le lendemain

#### Fonction Modifiée : `stopAutoRefresh()` (lignes 557-564)
- Changé de `clearInterval()` à `clearTimeout()`

### 2. `index.html`

#### Label de la checkbox (ligne 189)
```html
<!-- Avant -->
Actualisation auto (30s)

<!-- Après -->
Actualisation auto (tous les jours à 8h)
```

#### Description (ligne 171)
```html
<!-- Avant -->
Synchronisation automatique en temps réel avec votre document Google Sheets

<!-- Après -->
Synchronisation automatique quotidienne à 8h avec votre document Google Sheets
```

---

## 🚀 Comment Ça Marche

### Scénario 1 : Activation Avant 8h
```
Heure actuelle : 7h30
Action : Cocher "Actualisation auto"
Résultat : Premier refresh dans 30 minutes (à 8h00)
Console : "Auto-refresh activé : prochaine mise à jour dans 0 heures"
```

### Scénario 2 : Activation Après 8h
```
Heure actuelle : 14h00
Action : Cocher "Actualisation auto"
Résultat : Premier refresh demain à 8h00
Console : "Auto-refresh activé : prochaine mise à jour dans 18 heures"
```

### Scénario 3 : Refresh Effectué
```
Heure actuelle : 8h00
Événement : Refresh automatique déclenché
Console : "Auto-refreshing data at 8h..."
Résultat :
  - Données rechargées depuis Google Sheets
  - Message : "XX rebuts chargés depuis Google Sheets"
  - Prochain refresh programmé pour demain 8h
```

---

## 🎯 Utilisation

### Activer l'Actualisation Automatique
1. Ouvrir `index.html` dans votre navigateur
2. Aller dans la section "Analyse des Rebuts"
3. **Cocher** : ☑ Actualisation auto (tous les jours à 8h)
4. Le système affiche dans la console quand aura lieu le prochain refresh

### Désactiver l'Actualisation Automatique
1. **Décocher** : ☐ Actualisation auto (tous les jours à 8h)
2. Le timer est annulé
3. Les données ne se mettront plus à jour automatiquement

### Forcer une Actualisation Manuelle
**À tout moment**, vous pouvez cliquer sur le bouton **"Actualiser"** pour recharger les données immédiatement, que l'actualisation automatique soit activée ou non.

---

## 🔍 Vérification dans la Console

Ouvrez la console du navigateur (F12) pour voir les messages :

### Au Démarrage
```
Google Sheets module initialized
Connexion automatique à Google Sheets...
Connecté avec succès à Google Sheets
```

### Quand l'Auto-Refresh Est Activé
```
Auto-refresh activé : prochaine mise à jour dans X heures
Next refresh scheduled at: 20/11/2025 08:00:00
```

### Au Moment du Refresh (8h)
```
Auto-refreshing data at 8h...
Chargement des données...
XX rebuts chargés depuis Google Sheets
Next refresh scheduled at: 21/11/2025 08:00:00
```

---

## 🛠️ Personnalisation de l'Heure

Si vous voulez changer l'heure de refresh (par exemple 9h au lieu de 8h) :

### Étape 1 : Modifier `google-sheets.js`
```javascript
// Ligne 8
config: {
    // ...
    refreshHour: 9, // ⭐ Changer ici (9 pour 9h du matin)
    // ...
}
```

### Étape 2 : Mettre à jour `index.html`
```html
<!-- Ligne 189 -->
<span>Actualisation auto (tous les jours à 9h)</span>

<!-- Ligne 171 -->
<p>Synchronisation automatique quotidienne à 9h avec votre document Google Sheets</p>
```

---

## 💡 Avantages de l'Actualisation à 8h

### ✅ Avantages
1. **Performance** : Pas de requêtes constantes vers Google Sheets
2. **Quotas API** : Économie des appels API (1 appel/jour au lieu de 2880/jour)
3. **Batterie** : Pour les ordinateurs portables, moins de consommation
4. **Fraîcheur des données** : Les données sont actualisées chaque matin avec les nouveaux rebuts du jour précédent
5. **Prévisibilité** : Vous savez exactement quand les données seront à jour

### ⚠️ Points à Noter
1. Si vous avez besoin de données plus récentes, cliquez sur **"Actualiser"** manuellement
2. Le premier refresh après activation aura lieu à 8h (aujourd'hui si avant 8h, demain si après 8h)
3. Le timer persiste tant que la page reste ouverte (si vous fermez le navigateur, l'actualisation automatique s'arrête)

---

## 🔧 Dépannage

### Problème : "Le refresh ne se déclenche pas à 8h"
**Causes possibles :**
1. L'ordinateur est éteint ou en veille à 8h
2. Le navigateur est fermé
3. La checkbox n'est pas cochée

**Solution :**
- Le navigateur doit rester ouvert pour que le timer fonctionne
- Vérifiez que la checkbox est bien cochée
- Consultez la console pour voir l'heure du prochain refresh

### Problème : "Je ne sais pas quand aura lieu le prochain refresh"
**Solution :**
- Ouvrez la console (F12)
- Cherchez le message : `"Next refresh scheduled at: [date]"`
- Ou : `"Auto-refresh activé : prochaine mise à jour dans X heures"`

### Problème : "Je veux un refresh immédiat"
**Solution :**
- Cliquez sur le bouton **"Actualiser"** 🔄
- Les données se rechargeront immédiatement
- Le prochain refresh automatique reste programmé à 8h

---

## 📊 Comparaison Avant/Après

| Caractéristique | ❌ Avant (30s) | ✅ Après (8h) |
|-----------------|----------------|---------------|
| **Fréquence** | 2880 fois/jour | 1 fois/jour |
| **Appels API** | ~2880/jour | 1/jour |
| **Performance** | Charge constante | Charge minimale |
| **Quotas Google** | Risque de limite | Très sûr |
| **Fraîcheur** | Temps réel | Quotidienne |
| **CPU/Batterie** | Utilisation continue | Utilisation minimale |

---

## 🎯 Cas d'Usage

### Production Standard
```
Scénario : Analyse quotidienne des rebuts de la veille
Configuration : Actualisation automatique à 8h ✅
Raison : Les données d'hier sont consolidées le matin
```

### Monitoring Actif
```
Scénario : Surveillance en temps réel pendant la production
Configuration : Actualisation manuelle régulière 🔄
Raison : Cliquer sur "Actualiser" quand nécessaire
```

### Réunion de Début de Journée
```
Scénario : Présentation des données du jour précédent
Configuration : Actualisation automatique à 8h ✅
Raison : Données fraîches prêtes pour la réunion de 8h30
```

---

## ✅ Checklist de Vérification

- [x] Configuration modifiée dans `google-sheets.js`
- [x] Interface mise à jour dans `index.html`
- [x] Fonction de calcul du temps jusqu'à 8h
- [x] Fonction de programmation du refresh
- [x] Messages de console pour déboguer
- [x] Documentation mise à jour

---

## 📝 Notes Techniques

### Timer Persistent
Le timer utilise `setTimeout()` qui est reprogrammé après chaque refresh :
```javascript
setTimeout(() => {
    this.fetchData();
    scheduleNext(); // ⭐ Reprogramme pour demain
}, msUntilRefresh);
```

### Calcul Précis
Le calcul prend en compte :
- L'heure actuelle exacte
- La date du jour
- Le passage à minuit
- Les changements d'heure (DST)

### Persistance
L'état de la checkbox est sauvegardé dans `localStorage` :
```javascript
localStorage.setItem('googleSheetsAutoRefresh', this.config.autoRefresh);
```

Au rechargement de la page, l'état est restauré automatiquement.

---

**Date de mise à jour** : 20 Novembre 2025
**Version** : Actualisation quotidienne à 8h configurée
