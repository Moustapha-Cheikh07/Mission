# ⚡ Guide de Démarrage Ultra-Rapide

> **Objectif** : Mettre en route le Dashboard Qualité en 5 minutes chrono

---

## ✅ Prérequis (1 minute)

Vérifier que vous avez :
- [x] **Node.js installé** → Test : `node --version` (doit afficher v16 ou supérieur)
- [x] **Fichier Excel** dans `server/data/sap_export.xlsx`

**Pas Node.js ?** → [Télécharger ici](https://nodejs.org/) (prendre la version LTS)

---

## 🚀 Installation (2 minutes)

### Windows

Ouvrir **CMD** ou **PowerShell** :

```cmd
cd server
npm install
```

### Linux / Mac

Ouvrir **Terminal** :

```bash
cd server
npm install
```

⏳ **Patience** : L'installation prend ~1-2 minutes

---

## ▶️ Lancement (30 secondes)

```bash
node server.js
```

**Vous devez voir :**

```
🚀 Serveur démarré sur http://localhost:3000
📡 API disponible sur http://localhost:3000/api/data
📊 Total lignes Excel: 171825
✅ Lignes 850MS filtrées: 450
📊 Database connected
```

✅ **Parfait !** Le serveur tourne.

---

## 🌐 Accès Interface (30 secondes)

1. **Ouvrir navigateur** (Chrome, Firefox, Edge...)
2. **Aller sur** : http://localhost:3000
3. **Se connecter** :
   - **Login** : `admin`
   - **Mot de passe** : `admin123`

✅ **Bravo !** Vous êtes sur le dashboard.

---

## 🎯 Vérifications Rapides

### ✅ Checklist de fonctionnement

- [ ] Interface accessible sur http://localhost:3000
- [ ] Login fonctionne (admin/admin123)
- [ ] Section "Analyse Production" affiche des données
- [ ] Section "Analyse Rebuts" affiche des données
- [ ] Nombre de machines 850MS visible (normalement 24)

### ❌ Problèmes ?

**Le serveur ne démarre pas**
```bash
# Vérifier que le port 3000 n'est pas utilisé
netstat -ano | findstr :3000

# Solution : changer le port dans server/server.js ligne 10
```

**Aucune donnée affichée**
- Vérifier que le fichier Excel existe : `dir server\data\sap_export.xlsx`
- Vérifier la console du serveur pour les erreurs
- Ouvrir F12 dans le navigateur pour voir les erreurs

**Erreur "Cannot find module"**
```bash
# Réinstaller les dépendances
cd server
rm -rf node_modules
npm install
```

---

## 🎓 Prochaines Étapes

Maintenant que ça marche, apprenez à :

1. **[Configurer pour la production](02-CONFIGURATION.md)** - Pointer vers le vrai fichier Excel SAP
2. **[Déployer sur un serveur](03-DEPLOIEMENT.md)** - Installer sur le serveur de l'entreprise
3. **[Utiliser le dashboard](04-UTILISATION.md)** - Guide pour les utilisateurs finaux

---

## 💡 Astuce Pro

**Garder le serveur actif en permanence** :

```bash
npm install -g pm2
pm2 start server.js --name dashboard
pm2 save
```

Maintenant le serveur redémarre automatiquement même après un reboot !

---

## 📞 Besoin d'Aide ?

- 📖 [Documentation complète](README.md)
- ❓ [Questions fréquentes](FAQ.md)
- 🔧 [Guide de dépannage](05-MAINTENANCE.md#dépannage)

---

**🎉 Félicitations ! Vous avez mis en route le Dashboard Qualité !**
