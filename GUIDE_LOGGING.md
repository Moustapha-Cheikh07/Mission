# 📋 Guide du Système de Logging

## 📌 Vue d'ensemble

Le projet utilise **Winston**, une bibliothèque professionnelle de logging pour Node.js, qui permet de tracer toutes les opérations et erreurs du système.

## 🎯 Objectifs

- **Traçabilité** : Suivre toutes les opérations importantes du système
- **Débogage** : Identifier rapidement l'origine des problèmes
- **Maintenance** : Faciliter la maintenance et le monitoring en production
- **Audit** : Conserver un historique des événements système

## 📂 Structure des Logs

### Fichiers de logs
Les logs sont stockés dans `backend/logs/` :

- **`combined.log`** : Tous les logs (INFO, WARN, ERROR)
- **`error.log`** : Uniquement les erreurs (ERROR)

### Rotation automatique
- Taille maximale par fichier : **5 MB**
- Nombre de fichiers conservés : **5**
- Les anciens fichiers sont automatiquement archivés

## 📊 Niveaux de logs

| Niveau | Utilisation | Exemple |
|--------|-------------|---------|
| **ERROR** | Erreurs critiques nécessitant une attention | Fichier Excel introuvable, échec de cache |
| **WARN** | Avertissements, situations anormales | Cache non initialisé, référence non trouvée |
| **INFO** | Informations sur les opérations importantes | Démarrage serveur, rafraîchissement cache |
| **DEBUG** | Détails techniques pour le débogage | Lecture fichier, requête API |

## 🗂️ Modules avec logging

Chaque module backend possède son propre logger identifiable :

| Module | Tag | Fichier |
|--------|-----|---------|
| Serveur principal | `[SERVER]` | `server.js` |
| Gestionnaire de cache | `[CACHE-MANAGER]` | `cache-manager.js` |
| Cache des îlots | `[ILOT-CACHE]` | `ilot-cache-manager.js` |
| Base de données | `[DATABASE]` | `database-manager.js` |
| Références produits | `[PRODUCT-REFS]` | `product-references.js` |

## 📖 Format des logs

```
2025-12-04 12:36:39 INFO [SERVER] Server running on http://10.192.14.223:1880
2025-12-04 12:36:40 ERROR [CACHE-MANAGER] Excel file not found: /path/to/file.xlsx
2025-12-04 12:36:41 WARN [ILOT-CACHE] Cache not found for ilot: PM1
```

**Format** : `[Date Heure] [NIVEAU] [MODULE] Message`

## 🔍 Comment utiliser les logs pour diagnostiquer

### 1. Vérifier les erreurs récentes
```bash
cd backend/logs
tail -50 error.log
```

### 2. Suivre les logs en temps réel
```bash
tail -f combined.log
```

### 3. Chercher un problème spécifique
```bash
# Chercher toutes les erreurs liées au cache
grep "CACHE" error.log

# Chercher les erreurs d'un jour spécifique
grep "2025-12-04" error.log
```

### 4. Voir les dernières opérations d'un module
```bash
# Voir toutes les opérations du serveur
grep "\[SERVER\]" combined.log | tail -20

# Voir les erreurs du cache manager
grep "\[CACHE-MANAGER\]" error.log
```

## 🚨 Scénarios courants de diagnostic

### Problème : Le serveur ne démarre pas
```bash
# Vérifier les logs au démarrage
grep "Server running" combined.log
grep "ERROR" error.log | tail -10
```

### Problème : Les données ne se chargent pas
```bash
# Vérifier le cache
grep "CACHE-MANAGER" combined.log | tail -20
grep "Cache refresh" combined.log
```

### Problème : Erreur sur un îlot spécifique
```bash
# Vérifier les logs des îlots
grep "ILOT-CACHE" combined.log | tail -30
grep "PM1\|BZ1\|GRM" combined.log
```

### Problème : Erreur lors d'une requête API
```bash
# Vérifier les requêtes API
grep "API request" combined.log | tail -20
grep "Error reading" error.log
```

## ⚙️ Configuration avancée

### Changer le niveau de logging

Modifier dans `.env.production` :
```env
# Valeurs possibles: error, warn, info, debug
LOG_LEVEL=info
```

- **Production** : `info` ou `warn` (recommandé)
- **Développement** : `debug` (pour plus de détails)
- **Problème critique** : `debug` (temporairement pour diagnostiquer)

### Désactiver les logs console en production

Les logs sont affichés dans la console ET sauvegardés dans les fichiers.
En production, seuls les fichiers sont utilisés (pas d'affichage console).

## 📦 Maintenance des logs

### Nettoyage manuel
```bash
# Supprimer les anciens logs (si nécessaire)
cd backend/logs
rm *.log

# Le système recréera automatiquement les fichiers
```

### Archivage
Pour archiver les logs avant nettoyage :
```bash
cd backend/logs
tar -czf logs-backup-$(date +%Y%m%d).tar.gz *.log
```

## 🔐 Sécurité

- Les fichiers de logs sont exclus du git (via `.gitignore`)
- Ne pas logger de données sensibles (mots de passe, tokens)
- Les logs contiennent des informations système pour le débogage uniquement

## ✅ Vérification du système de logging

Test rapide :
```bash
cd backend
node -e "const { createModuleLogger } = require('./logger'); const log = createModuleLogger('TEST'); log.info('Test OK'); log.error('Test erreur');"
```

Vérifier les fichiers créés :
```bash
ls -lh backend/logs/
cat backend/logs/combined.log
cat backend/logs/error.log
```

## 📞 Support

En cas de problème avec le système de logging :
1. Vérifier que le dossier `backend/logs/` existe
2. Vérifier les permissions d'écriture
3. Consulter les logs d'erreur : `backend/logs/error.log`
4. Vérifier que `winston` est installé : `npm list winston`

---

**Date de création** : 2025-12-04
**Version du système** : 1.0.0
**Mainteneur** : Équipe IT
