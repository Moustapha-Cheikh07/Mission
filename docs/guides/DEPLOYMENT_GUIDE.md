# Guide de Déploiement - Serveur Local Merlin Gerin

Ce guide explique comment installer l'application Dashboard Qualité sur un serveur Windows de l'entreprise et configurer la lecture automatique du fichier Excel SAP.

## 1. Prérequis sur le Serveur
Avant de commencer, assurez-vous que le serveur (ou le PC faisant office de serveur) dispose de :
*   **Système d'exploitation** : Windows (7, 10, 11 ou Server).
*   **Node.js** : Téléchargez et installez la version "LTS" depuis [nodejs.org](https://nodejs.org/).
*   **Accès Réseau** : Le serveur doit être accessible par les autres PC de l'usine (avoir une IP fixe est recommandé).

## 2. Installation des Fichiers
1.  Créez un dossier sur le serveur, par exemple : `C:\Apps\DashboardQualite`.
2.  Copiez **l'intégralité** du dossier de votre projet (celui contenant `index.html`, `src`, `server`, etc.) dans ce dossier.

## 3. Configuration du Fichier Excel SAP
C'est l'étape la plus importante. Vous devez dire à l'application où SAP dépose son fichier Excel.

1.  Ouvrez le fichier `server/server.js` avec un éditeur de texte (Bloc-notes ou VS Code).
2.  Cherchez la ligne qui définit le chemin du fichier (vers la ligne 10-15) :
    ```javascript
    // CONFIGURATION DU CHEMIN DU FICHIER EXCEL
    // Option 1 : Le fichier est dans le dossier server/data (Par défaut)
    const EXCEL_FILE_PATH = path.join(__dirname, 'data', 'sap_export.xlsx');
    
    // Option 2 : Le fichier est ailleurs (Exemple sur un lecteur réseau ou dossier spécifique)
    // Décommentez la ligne ci-dessous et modifiez le chemin :
    // const EXCEL_FILE_PATH = 'Z:\\Production\\Qualité\\Exports\\rebuts_sap.xlsx';
    ```
3.  Modifiez cette ligne pour mettre le **vrai chemin** où SAP enregistre le fichier.
    *   *Attention : Sur Windows, utilisez des doubles anti-slashs `\\` dans le chemin.*
    *   Exemple : `'C:\\SAP_Exports\\Daily\\quality_data.xlsx'`

## 4. Démarrage de l'Application
Pour que le site soit accessible 24h/24 :

### Méthode Simple (Test)
Double-cliquez sur `start.bat`. Tant que la fenêtre noire reste ouverte, le site fonctionne.

### Méthode Robuste (Production)
Pour que le serveur redémarre tout seul si le PC redémarre, vous pouvez utiliser un gestionnaire de processus comme `pm2` (optionnel) ou simplement mettre le `start.bat` dans le dossier "Démarrage" de Windows.

## 5. Accès pour les Utilisateurs
Une fois le serveur lancé :
1.  Trouvez l'adresse IP du serveur (Ouvrez une commande cmd et tapez `ipconfig`). Disons que c'est `192.168.1.50`.
2.  Sur n'importe quel PC de l'usine, ouvrez Chrome ou Edge.
3.  Tapez l'adresse : `http://192.168.1.50:3000` (ou juste l'IP si vous avez configuré le port 80).
    *   *Note : Actuellement le serveur sert l'API sur le port 3000. Pour servir aussi le site web (HTML), une petite configuration supplémentaire dans `server.js` est recommandée pour servir les fichiers statiques (voir section suivante).*

## 6. Servir le Site Web via Node.js (Recommandé)
Par défaut, votre `server.js` ne sert que les données (API). Pour qu'il serve aussi le site web (les pages HTML), modifiez `server/server.js` :

Ajoutez ceci juste avant `app.listen(...)` :
```javascript
// Servir les fichiers statiques (le site web)
app.use(express.static(path.join(__dirname, '../')));
```
Ainsi, tout est accessible via `http://[IP-DU-SERVEUR]:3000`.

---

## Résumé du Mécanisme
1.  **SAP** génère le fichier Excel tous les matins à 8h00 dans `C:\SAP_Exports\`.
2.  **Node.js** surveille ce dossier.
3.  Quand un chef d'équipe ouvre le Dashboard sur sa tablette, le **Dashboard** interroge **Node.js**.
4.  **Node.js** lit le fichier Excel instantanément et renvoie les chiffres.
5.  Le **Dashboard** affiche les graphiques à jour.
