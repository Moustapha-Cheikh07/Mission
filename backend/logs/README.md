# 📋 Dossier des Logs

Ce dossier contient les fichiers de logs générés par le système.

## 📁 Fichiers

- **`combined.log`** : Tous les logs du système (INFO, WARN, ERROR)
- **`error.log`** : Uniquement les erreurs critiques (ERROR)

## 🔍 Consultation rapide

### Voir les dernières erreurs
```bash
tail -n 50 error.log
```

### Suivre les logs en temps réel
```bash
tail -f combined.log
```

### Chercher un terme spécifique
```bash
grep "CACHE" combined.log
```

## 📖 Documentation complète

Consultez le **[Guide du Système de Logging](../../GUIDE_LOGGING.md)** pour plus d'informations.

## ⚠️ Important

- Les fichiers `.log` sont automatiquement ignorés par git
- Ne pas commiter de fichiers de logs dans le dépôt
- Les logs sont automatiquement nettoyés après 5 fichiers de 5MB chacun
