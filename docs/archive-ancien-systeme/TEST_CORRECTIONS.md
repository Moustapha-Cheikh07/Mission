# Tests des corrections - Machines 850MS

## Étapes de test

### 1. Redémarrer le serveur
```bash
cd server
node server.js
```

**Vérifications dans la console :**
- ✅ Doit afficher : "Lignes 850MS filtrées: X" (où X > 0)
- ✅ Doit afficher : "Total lignes Excel: 171825"

### 2. Ouvrir l'interface web
Ouvrir http://localhost:3000 dans votre navigateur

### 3. Vérifier l'analyse des rebuts
1. Naviguer vers "Analyse des Rebuts"
2. Ouvrir le filtre "Machine"
3. **Vérification :** Compter le nombre de machines affichées
   - ✅ Devrait afficher toutes les machines 850MS présentes dans le fichier Excel

### 4. Vérifier l'analyse de production
1. Naviguer vers "Analyse de Production"
2. Ouvrir le filtre "Machine"
3. **Vérification :** Compter le nombre de machines affichées
   - ✅ Devrait maintenant afficher **le même nombre** que dans l'analyse des rebuts
   - ✅ Toutes les 24 machines (ou plus selon les données du fichier Excel)

### 5. Vérification dans la console du navigateur (F12)
Ouvrir la console du navigateur et vérifier les messages :
- ✅ "Production filter populated with X machines 850MS"
- ✅ "Filter populated with X machines" (pour les rebuts)
- Les deux valeurs X doivent être **identiques**

## Résultat attendu

**AVANT la correction :**
- Analyse des rebuts : 24 machines
- Analyse de production : 22 machines ❌

**APRÈS la correction :**
- Analyse des rebuts : 24 machines (ou plus selon Excel)
- Analyse de production : 24 machines (ou plus selon Excel) ✅

## Machines qui devraient maintenant apparaître

Les 2 machines manquantes dans l'ancienne version statique devraient maintenant s'afficher.
Le système charge maintenant **toutes** les machines présentes dans la colonne WORKCENTER du fichier Excel.

## En cas de problème

Si le nombre de machines ne correspond toujours pas :

1. **Vider le cache du navigateur :**
   - Appuyez sur Ctrl+Shift+Delete
   - Cochez "Cached images and files"
   - Cliquez sur "Clear data"

2. **Recharger la page avec Ctrl+F5**

3. **Vérifier la console du serveur** pour voir si des erreurs apparaissent

4. **Vérifier la console du navigateur (F12)** pour voir les messages de log
