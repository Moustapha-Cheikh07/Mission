# 🚀 Guide du Serveur Local (Remplacement Google Sheets)

Ce guide explique comment utiliser l'application avec un **serveur local** pour lire directement les fichiers Excel générés par SAP, sans passer par Google Sheets.

## 📋 Prérequis

1.  **Node.js** doit être installé sur le serveur (ou l'ordinateur qui héberge l'application).
    *   Télécharger ici : [https://nodejs.org/](https://nodejs.org/) (Version LTS recommandée)

## 🛠️ Installation du Serveur

Le dossier `server/` contient tout le nécessaire.

1.  Ouvrez un terminal (Invite de commandes ou PowerShell).
2.  Allez dans le dossier du serveur :
    ```bash
    cd server
    ```
3.  Installez les dépendances (à faire une seule fois) :
    ```bash
    npm install
    ```

## 🏃‍♂️ Démarrage

1.  Lancez le serveur :
    ```bash
    node server.js
    ```
2.  Vous devriez voir :
    ```
    Serveur local écoute sur http://localhost:3000
    API disponible sur http://localhost:3000/api/data
    ```
    ⚠️ **Ne fermez pas cette fenêtre** tant que l'application est utilisée.

## 📂 Mise en place des Données SAP

Le serveur lit le fichier Excel situé dans :
`server/data/sap_export.xlsx`

*   Configurez SAP (ou votre processus d'export) pour écraser ce fichier automatiquement lors des mises à jour.
*   Le serveur détectera les changements instantanément lors du prochain rafraîchissement de la page.

### Pour tester avec des fausses données :
Si vous n'avez pas encore de fichier SAP, générez un fichier de test :
```bash
node create_mock_data.js
```

## 🔗 Connexion depuis l'Application

1.  Ouvrez l'application (`index.html`).
2.  Allez dans l'onglet **Analyse des Rebuts**.
3.  Cliquez sur le bouton **Configuration** (roue dentée) ou **Connexion**.
4.  Dans la fenêtre qui s'ouvre, cliquez sur le bouton bleu **"Utiliser Serveur Local"** (en bas à gauche).
5.  L'application confirmera la connexion et rechargera les données depuis votre fichier Excel local.

## 🔄 Revenir à Google Sheets

Si vous voulez revenir à la version Google Sheets :
1.  Videz le cache de votre navigateur (ou supprimez la clé `useLocalServer` dans localStorage).
2.  Ou cliquez simplement sur le bouton de connexion Google Sheets habituel.

## ❓ Dépannage

*   **Erreur "Fichier Excel non trouvé"** : Vérifiez que `sap_export.xlsx` est bien dans le dossier `server/data/`.
*   **Erreur de connexion** : Vérifiez que la fenêtre noire (terminal) avec `node server.js` est toujours ouverte.
*   **Les données ne changent pas** : Actualisez la page web (F5).
