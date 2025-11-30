# Corrections et Améliorations - Module Analyse des Rebuts

## Date : 20 Novembre 2025

## Problèmes résolus

### 1. Problème de filtrage ❌ → ✅

#### Symptôme
- Lorsque l'utilisateur appliquait des filtres, aucune donnée n'était affichée
- Les statistiques affichaient 0€ et 0 pour tous les indicateurs
- Les tableaux et graphiques restaient vides après filtrage

#### Cause
Les filtres de date n'étaient pas initialisés correctement au chargement de la page. Les champs de saisie avaient des valeurs par défaut, mais l'objet `currentFilters` utilisé pour le filtrage restait avec des valeurs `null`, créant une incohérence entre l'affichage et le comportement réel.

#### Solution implémentée
**Fichier modifié** : `src/modules/rejects.js`

1. **Initialisation des filtres par défaut** (lignes 38-62)
   - Augmentation de la plage par défaut de 7 à 30 jours pour afficher plus de données
   - Synchronisation de `currentFilters` avec les valeurs des champs de saisie
   - Les filtres sont maintenant cohérents dès le chargement

```javascript
// Avant
currentFilters: {
    machine: 'all',
    startDate: null,    // ❌ Non initialisé
    endDate: null       // ❌ Non initialisé
}

// Après
this.currentFilters.startDate = monthAgoStr;  // ✅ Initialisé à 30 jours
this.currentFilters.endDate = todayStr;       // ✅ Initialisé à aujourd'hui
this.currentFilters.machine = 'all';          // ✅ Explicitement défini
```

2. **Amélioration du logging** (lignes 73-77)
   - Ajout de logs pour faciliter le débogage
   - Affichage du nombre d'enregistrements avant et après filtrage

### 2. Intégration Excel pour données en temps réel ✅

#### Besoin
L'utilisateur souhaitait connecter le tableau de bord à un fichier Excel généré automatiquement par un autre logiciel pour avoir des données en temps réel, sans saisie manuelle.

#### Solution implémentée

**Fichiers modifiés** :
- `src/modules/rejects.js` : Ajout de la logique d'import Excel
- `index.html` : Ajout de l'interface utilisateur
- `assets/styles/components.css` : Ajout des styles pour les notifications

#### Fonctionnalités ajoutées

##### A. Interface utilisateur (index.html, lignes 160-189)
- **Section d'import Excel** visible en haut de l'analyse des rebuts
- **Bouton "Charger Excel"** : Permet de sélectionner un fichier Excel (.xlsx ou .xls)
- **Bouton "Actualiser"** : Recharge le dernier fichier Excel importé
- **Case à cocher "Utiliser les données Excel"** : Bascule entre données Excel et données locales
- **Zone de statut** : Affiche le nom du fichier, le nombre de rebuts et l'heure de dernière mise à jour

##### B. Logique d'import (rejects.js)

**Nouvelles propriétés** (lignes 9-11) :
```javascript
excelFile: null,        // Fichier Excel actuellement chargé
excelData: [],          // Données converties depuis Excel
useExcelData: false,    // Flag pour utiliser les données Excel
```

**Fonctions principales** :

1. **`setupExcelImport()`** (lignes 451-497)
   - Configuration des événements pour les boutons
   - Gestion de la préférence utilisateur (sauvegardée dans localStorage)
   - Permet de basculer entre sources de données

2. **`importExcelFile(file)`** (lignes 499-544)
   - Lecture du fichier Excel avec la bibliothèque SheetJS
   - Conversion en JSON
   - Transformation au format de l'application
   - Sauvegarde dans localStorage
   - Affichage de notifications de succès/erreur

3. **`convertExcelToRejects(excelData)`** (lignes 546-584)
   - Mapping intelligent des colonnes Excel
   - Support de multiples noms de colonnes (français/anglais)
   - Validation des données
   - Calcul automatique du coût total si absent
   - Gestion des lignes invalides avec logs d'avertissement

4. **`parseExcelDate(excelDate)`** (lignes 586-618)
   - Support de multiples formats de date :
     - YYYY-MM-DD (ISO)
     - DD/MM/YYYY (format français)
     - Numéros de série Excel
   - Conversion automatique au format interne

5. **`mapExcelReason(excelReason)`** (lignes 620-639)
   - Mapping des raisons en français/anglais
   - Support de variantes (matière/matiere, fonction/fonctionnel)

6. **`getRejectsData()`** (lignes 670-676)
   - Retourne soit les données Excel, soit les données locales
   - Centralise la source de données

7. **`loadSavedExcelData()`** (lignes 655-668)
   - Charge les données Excel depuis localStorage au démarrage
   - Restaure l'état de l'import précédent

8. **`updateExcelStatus()`** (lignes 641-653)
   - Met à jour l'affichage du statut
   - Montre le nom du fichier et le nombre d'enregistrements

9. **`showMessage()`** (lignes 678-688)
   - Affiche des notifications toast
   - Support des types : success, error, warning, info

##### C. Bibliothèque SheetJS (index.html, ligne 713)
Ajout de la bibliothèque officielle SheetJS pour lire les fichiers Excel :
```html
<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>
```

##### D. Styles des notifications (components.css, lignes 732-738)
Ajout des styles manquants pour les notifications warning et info :
```css
.toast.warning {
    background: var(--warning-color);
}

.toast.info {
    background: var(--primary-color);
}
```

## Format Excel attendu

### Colonnes obligatoires

| Colonne | Alias acceptés | Type | Exemple |
|---------|----------------|------|---------|
| Date | DATE, date | Date | 2025-11-20 ou 20/11/2025 |
| Machine | MACHINE, machine | Texte | MS085 |
| Matériel | Material, Code matériel | Texte | 04294964BE-EMB |
| Description | DESCRIPTION, description | Texte | MAGNETIC CONTACT FRAME |
| Quantité | Quantity, Quantité de rebut | Nombre | 589 |
| Prix unitaire | Unit Price, unitPrice | Nombre | 0.07601 |

### Colonnes optionnelles

| Colonne | Alias acceptés | Calculé si absent |
|---------|----------------|-------------------|
| Coût total | Total Cost, totalCost | Quantité × Prix unitaire |
| Raison | Reason, reason | "other" |
| Opérateur | Operator, operator | "Excel Import" |
| Centre | Workcenter, workcenter | "" (vide) |

### Exemple de fichier Excel

| Date | Machine | Matériel | Description | Quantité | Prix unitaire | Raison | Opérateur |
|------|---------|----------|-------------|----------|---------------|--------|-----------|
| 2025-11-20 | MS085 | 04294964BE-EMB | MAGNETIC CONTACT FRAME | 589 | 0.07601 | dimension | Jean Dupont |
| 2025-11-19 | MS123 | AAV83736-OTS | 20A THERMAL SUB-ASSEMBLY | 150 | 0.12173 | fonction | Marie Martin |

## Utilisation

### Import initial

1. Cliquez sur **"Charger Excel"** dans la section verte
2. Sélectionnez votre fichier Excel (.xlsx ou .xls)
3. Un message de confirmation s'affiche avec le nombre de rebuts importés
4. Cochez **"Utiliser les données Excel"** pour afficher ces données

### Actualisation des données

Pour mettre à jour avec les nouvelles données du logiciel :

1. Le logiciel génère un nouveau fichier Excel avec les données à jour
2. Cliquez sur **"Actualiser"** dans le tableau de bord
3. Les nouvelles données sont chargées et affichées automatiquement

### Basculer entre sources de données

- **Cocher** "Utiliser les données Excel" : Affiche les données du fichier Excel
- **Décocher** "Utiliser les données Excel" : Revient aux données saisies manuellement

### Persistence des données

- Les données Excel sont sauvegardées dans le navigateur (localStorage)
- Elles persistent après fermeture du navigateur
- Vous pouvez basculer à tout moment entre Excel et données manuelles
- Le filtrage par machine et date fonctionne avec les deux sources

## Avantages de la solution

### Pour l'utilisateur

✅ **Pas de saisie manuelle** : Import automatique depuis Excel
✅ **Temps réel** : Actualisation en un clic
✅ **Flexibilité** : Possibilité de basculer entre sources de données
✅ **Format flexible** : Support de plusieurs noms de colonnes et formats de date
✅ **Validation** : Lignes invalides ignorées avec logs explicites
✅ **Persistence** : Données sauvegardées localement

### Technique

✅ **Pas de backend nécessaire** : Tout fonctionne côté client
✅ **Compatibilité** : Support Excel (.xlsx, .xls)
✅ **Performance** : Chargement rapide avec SheetJS
✅ **Robustesse** : Gestion d'erreurs complète
✅ **Maintenabilité** : Code modulaire et bien documenté

## Documentation créée

1. **`docs/EXCEL_IMPORT_GUIDE.md`** : Guide complet d'utilisation de l'import Excel
2. **`docs/CORRECTIONS_REBUTS.md`** : Ce document (récapitulatif des corrections)

## Tests recommandés

### Test du filtrage

1. Ouvrir le tableau de bord
2. Vérifier que des données s'affichent au chargement (30 derniers jours)
3. Modifier les dates de filtrage
4. Cliquer sur "Filtrer"
5. Vérifier que les données correspondent à la plage sélectionnée

### Test de l'import Excel

1. Créer un fichier Excel de test avec les colonnes requises
2. Cliquer sur "Charger Excel"
3. Sélectionner le fichier
4. Vérifier le message de succès
5. Cocher "Utiliser les données Excel"
6. Vérifier que les statistiques et graphiques correspondent aux données Excel

### Test de l'actualisation

1. Modifier le fichier Excel (ajouter/supprimer des lignes)
2. Cliquer sur "Actualiser"
3. Vérifier que les nouvelles données sont affichées

### Test de basculement

1. Avec des données Excel chargées
2. Décocher "Utiliser les données Excel"
3. Vérifier le retour aux données locales
4. Recocher la case
5. Vérifier le retour aux données Excel

## Notes importantes

- La bibliothèque SheetJS est chargée depuis un CDN (nécessite une connexion Internet)
- Les données Excel sont stockées dans localStorage (limite de ~5-10MB selon navigateur)
- Pour des fichiers très volumineux (>1000 lignes), considérer une solution backend
- Le format de date YYYY-MM-DD est recommandé pour éviter les ambiguïtés

## Support

Pour toute question :
1. Consulter `docs/EXCEL_IMPORT_GUIDE.md`
2. Vérifier la console du navigateur (F12) pour les logs
3. Vérifier le format du fichier Excel
4. Contacter l'équipe de développement

## Prochaines étapes possibles

### Améliorations futures
- [ ] Surveillance automatique du fichier Excel (avec File System Access API)
- [ ] Export des données vers Excel
- [ ] Graphiques personnalisables
- [ ] Filtres sauvegardés
- [ ] Comparaison de périodes
- [ ] Alertes sur seuils de rebuts
- [ ] API REST pour intégration backend
- [ ] Support de fichiers CSV
- [ ] Validation avancée des données
- [ ] Historique des imports

---

**Développé le** : 20 Novembre 2025
**Testés sur** : Chrome, Firefox, Edge
**Compatible avec** : Excel 2010+, LibreOffice Calc, Google Sheets (export .xlsx)
