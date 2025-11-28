# Guide d'importation Excel - Analyse des Rebuts

## Vue d'ensemble

Le système d'analyse des rebuts permet d'importer automatiquement des données depuis un fichier Excel généré par votre logiciel. Cette fonctionnalité permet une synchronisation en temps réel des données de production.

## Format du fichier Excel requis

### Colonnes requises

Votre fichier Excel doit contenir les colonnes suivantes (l'ordre n'est pas important, mais les noms doivent correspondre) :

| Nom de colonne | Alias acceptés | Type | Obligatoire | Description |
|----------------|----------------|------|-------------|-------------|
| **Date** | DATE, date | Date ou texte | ✓ | Date de détection du rebut |
| **Machine** | MACHINE, machine | Texte | ✓ | Code de la machine (MS085, MS120, etc.) |
| **Matériel** | Material, material, Code matériel | Texte | ✓ | Code du matériel |
| **Description** | DESCRIPTION, description | Texte | ✓ | Description du matériel |
| **Quantité** | Quantity, quantity, Quantité de rebut | Nombre | ✓ | Quantité de rebut |
| **Prix unitaire** | Unit Price, unitPrice | Nombre | ✓ | Prix unitaire en euros |
| **Coût total** | Total Cost, totalCost | Nombre | | Coût total (calculé automatiquement si absent) |
| **Raison** | Reason, reason | Texte | | Raison du rebut |
| **Opérateur** | Operator, operator | Texte | | Nom de l'opérateur |
| **Centre** | Workcenter, workcenter | Texte | | Centre de travail |

### Formats de date acceptés

Le système accepte plusieurs formats de date :
- **YYYY-MM-DD** : 2025-11-20 (recommandé)
- **DD/MM/YYYY** : 20/11/2025
- **Numéro de série Excel** : 45620 (converti automatiquement)

### Valeurs acceptées pour "Raison"

- `dimension` ou `dimensionnelle` → Non-conformité dimensionnelle
- `aspect` ou `appearance` → Défaut d'aspect
- `fonction`, `function` ou `fonctionnel` → Défaut fonctionnel
- `matière`, `material` ou `matiere` → Défaut matière
- `autre` ou `other` → Autre

## Exemple de fichier Excel

### Tableau exemple

| Date | Machine | Matériel | Description | Quantité | Prix unitaire | Coût total | Raison | Opérateur |
|------|---------|----------|-------------|----------|---------------|------------|--------|-----------|
| 2025-11-20 | MS085 | 04294964BE-EMB | MAGNETIC CONTACT FRAME | 589 | 0.07601 | 44.77 | dimension | Jean Dupont |
| 2025-11-19 | MS123 | AAV83736-OTS | 20A MULTIPOLAR THERMAL SUB-ASSEMBLY | 150 | 0.12173 | 18.26 | fonction | Marie Martin |
| 2025-11-18 | MS120 | 04290013AC-EMB | MAGNETIC CONTACT FRAME 25A | 300 | 0.10502 | 31.51 | aspect | Pierre Bernard |

## Comment utiliser l'import Excel

### 1. Préparer votre fichier Excel

1. Assurez-vous que votre fichier Excel contient les colonnes requises
2. Vérifiez que les dates sont dans un format valide
3. Vérifiez que les codes machines correspondent aux machines de votre système
4. Sauvegardez le fichier au format `.xlsx` ou `.xls`

### 2. Importer le fichier

1. Ouvrez le tableau de bord
2. Allez à la section "Analyse des Rebuts"
3. Cliquez sur le bouton **"Charger Excel"** dans la zone verte en haut
4. Sélectionnez votre fichier Excel
5. Le système affichera un message de confirmation avec le nombre de rebuts importés

### 3. Activer les données Excel

1. Cochez la case **"Utiliser les données Excel"**
2. Les statistiques et graphiques se mettent à jour automatiquement
3. Les données Excel remplacent les données de l'application

### 4. Actualiser les données

Pour mettre à jour les données depuis le même fichier Excel :

1. Modifiez votre fichier Excel avec les nouvelles données
2. Cliquez sur le bouton **"Actualiser"**
3. Le système recharge le fichier et met à jour l'affichage

### 5. Revenir aux données de l'application

Pour utiliser les données saisies manuellement dans l'application :

1. Décochez la case **"Utiliser les données Excel"**
2. Les données reviennent automatiquement aux données locales

## Synchronisation en temps réel

### Méthode manuelle

Pour obtenir les données les plus récentes :
1. Assurez-vous que votre logiciel a généré un nouveau fichier Excel
2. Cliquez sur "Actualiser" dans le tableau de bord
3. Les nouvelles données sont chargées immédiatement

### Méthode automatique (à venir)

Dans une future version, le système pourra :
- Surveiller automatiquement le fichier Excel
- Recharger les données dès qu'une modification est détectée
- Afficher une notification lors de la mise à jour

## Dépannage

### Le fichier ne se charge pas

**Problème** : Message d'erreur lors de l'import

**Solutions** :
- Vérifiez que le fichier est bien au format `.xlsx` ou `.xls`
- Assurez-vous que le fichier n'est pas ouvert dans Excel
- Vérifiez que les colonnes requises sont présentes
- Vérifiez la console du navigateur (F12) pour plus de détails

### Aucune donnée n'apparaît après l'import

**Problème** : L'import réussit mais les tableaux sont vides

**Solutions** :
- Vérifiez que la case "Utiliser les données Excel" est cochée
- Vérifiez que les dates dans le fichier correspondent à la plage de filtrage
- Vérifiez que les lignes contiennent toutes les données obligatoires
- Consultez la console du navigateur pour voir les lignes ignorées

### Les dates ne sont pas correctes

**Problème** : Les dates affichées sont incorrectes

**Solutions** :
- Utilisez le format YYYY-MM-DD dans Excel
- Vérifiez le format de cellule dans Excel (doit être "Date")
- Évitez les formules de date complexes

### Les totaux ne correspondent pas

**Problème** : Le coût total ne correspond pas au calcul

**Solutions** :
- Le système calcule automatiquement : Quantité × Prix unitaire
- Vérifiez que les nombres utilisent le point comme séparateur décimal (0.07601, pas 0,07601)
- Vérifiez que les colonnes sont bien au format "Nombre" dans Excel

## Support technique

Pour toute question ou problème :
1. Vérifiez d'abord ce guide
2. Consultez la console du navigateur (F12) pour les messages d'erreur
3. Vérifiez le format de votre fichier Excel
4. Contactez l'administrateur système

## Notes importantes

- Les données Excel sont stockées dans le navigateur (localStorage)
- Les données persistent même après fermeture du navigateur
- Vous pouvez basculer entre données Excel et données manuelles à tout moment
- Le filtrage par machine et par date fonctionne aussi avec les données Excel
- Format de date recommandé : YYYY-MM-DD pour éviter les ambiguïtés
