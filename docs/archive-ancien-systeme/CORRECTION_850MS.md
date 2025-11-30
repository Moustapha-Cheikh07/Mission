# Correction du problème de chargement des données 850MS

## Problème identifié

Le système affichait 0 lignes filtrées pour les machines 850MS car :

1. **Dans `server/server.js`** : Le code cherchait une colonne contenant "machine" dans son nom, mais le fichier Excel utilise la colonne "WORKCENTER"
2. **Dans `src/modules/data-connector.js`** : Le champ `workcenter` était laissé vide au lieu d'utiliser la valeur de la colonne WORKCENTER

## Corrections apportées

### 1. Fichier `server/server.js` (lignes 80-92)

**Avant :**
```javascript
const machineKey = Object.keys(row).find(key =>
    key.toLowerCase().includes('machine')
);
```

**Après :**
```javascript
const machineKey = Object.keys(row).find(key => {
    const lowerKey = key.toLowerCase();
    return lowerKey === 'workcenter' || lowerKey.includes('machine');
});
```

### 2. Fichier `src/modules/data-connector.js` (ligne 178)

**Avant :**
```javascript
workcenter: ''
```

**Après :**
```javascript
workcenter: machineVal || ''
```

## Comment tester

1. **Redémarrer le serveur :**
   ```bash
   cd server
   node server.js
   ```

2. **Vérifier dans la console du serveur :**
   - Vous devriez voir : "Lignes 850MS filtrées: X" (où X > 0)
   - Au lieu de : "Lignes 850MS filtrées: 0"

3. **Dans l'interface web :**
   - Ouvrir http://localhost:3000
   - Naviguer vers la section "Production" ou "Rebuts"
   - Les données des machines 850MS devraient maintenant s'afficher

## Colonnes Excel supportées

Le système cherche maintenant les colonnes suivantes (insensible à la casse) :
- **Machine/Workcenter :** `WORKCENTER`, `machine`, `Machine`
- **Date :** `date`, `confirmation date`, `Date`
- **Matériel :** `material`, `matériel`, `Matériel`
- **Description :** `description`, `designation`, `Description`
- **Quantité rebut :** `quantité`, `quantity`, `qte scrap`, `Quantité`
- **Quantité production :** `qte prod app`, `production quantity`, `QTE PROD APP`
- **Prix unitaire :** `prix unitaire`, `unit price`, `prix unit`, `Prix UNIT`, `PRIX UNIT`

## 3. Correction du problème de filtrage des machines (22 au lieu de 24)

**Problème :** L'analyse de production n'affichait que 22 machines au lieu de 24

**Cause :** La liste des machines était codée en dur dans `ProductionAnalysis.ilots` au lieu d'être chargée dynamiquement depuis les données réelles

**Solution :**

### a) Ajout de `getMSMachines()` dans `data-connector.js` (après ligne 114)
```javascript
// Get unique MS machines from cached data
getMSMachines: function () {
    try {
        const machines = new Set();
        this.cachedData.forEach(record => {
            if (record.machine && record.machine.includes('MS')) {
                machines.add(record.machine);
            }
        });
        return Array.from(machines).sort();
    } catch (e) {
        console.error('Error getting MS machines:', e);
        return [];
    }
},
```

### b) Modification de `getAllMSMachines()` dans `production.js` (ligne 25-44)
**Avant :** Utilisait une liste statique de 22 machines
**Après :** Récupère dynamiquement toutes les machines depuis les données du serveur

### c) Rafraîchissement du filtre dans `loadProductionData()` (ligne 176)
Ajout de `this.populateMachineFilter();` pour repeupler le filtre avec les données réelles après chargement

## Notes importantes

- Le filtre recherche les machines dont le nom commence par "850MS"
- La colonne WORKCENTER doit contenir des valeurs comme "850MS070", "850MS123", etc.
- Les données sont maintenant stockées en mémoire (pas de localStorage) pour supporter les gros fichiers Excel
- Les machines sont maintenant chargées **dynamiquement** depuis les données Excel au lieu d'une liste statique
- Le nombre de machines affiché s'adapte automatiquement aux données présentes dans le fichier Excel
