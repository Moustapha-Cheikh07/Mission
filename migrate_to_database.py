#!/usr/bin/env python3
"""
Script de migration automatique pour passer du localStorage à la base de données SQLite
"""

import re
import os

def modify_documents_js():
    """Modifie src/modules/documents.js pour utiliser async/await"""
    filepath = 'src/modules/documents.js'

    if not os.path.exists(filepath):
        print(f"❌ Fichier {filepath} non trouvé")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Liste des modifications
    modifications = [
        # displayDocuments devient async
        (r'displayDocuments: function\(\)', 'displayDocuments: async function()'),

        # Tous les await pour getDocumentsByMachine
        (r'const documents = DataManager\.getDocumentsByMachine\(',
         'const documents = await DataManager.getDocumentsByMachine('),

        # Tous les await pour displayDocuments
        (r'this\.displayDocuments\(\);', 'await this.displayDocuments();'),

        # Upload devient await
        (r'const saved = DataManager\.addQualityDocument\(',
         'const saved = await DataManager.addQualityDocument('),

        # Delete devient await
        (r'const deleted = DataManager\.deleteQualityDocument\(',
         'const deleted = await DataManager.deleteQualityDocument('),
    ]

    for pattern, replacement in modifications:
        content = re.sub(pattern, replacement, content)

    # Sauvegarder
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ {filepath} modifié avec succès")

def modify_training_js():
    """Modifie src/modules/training.js pour utiliser async/await"""
    filepath = 'src/modules/training.js'

    if not os.path.exists(filepath):
        print(f"❌ Fichier {filepath} non trouvé")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    modifications = [
        # init devient async
        (r'init: function\(\)', 'init: async function()'),

        # loadTrainingDocuments devient async
        (r'loadTrainingDocuments: function\(\)', 'loadTrainingDocuments: async function()'),

        # Tous les await pour getTrainingDocuments
        (r'const documents = DataManager\.getTrainingDocuments\(\)',
         'const documents = await DataManager.getTrainingDocuments()'),

        # Tous les await pour loadTrainingDocuments
        (r'this\.loadTrainingDocuments\(\);', 'await this.loadTrainingDocuments();'),

        # Upload devient await
        (r'const saved = DataManager\.addTrainingDocument\(',
         'const saved = await DataManager.addTrainingDocument('),

        # Delete devient await
        (r'const deleted = DataManager\.deleteTrainingDocument\(',
         'const deleted = await DataManager.deleteTrainingDocument('),
    ]

    for pattern, replacement in modifications:
        content = re.sub(pattern, replacement, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✅ {filepath} modifié avec succès")

def modify_fiche_etoile_js():
    """Modifie src/modules/fiche-etoile.js pour utiliser la base de données"""
    filepath = 'src/modules/fiche-etoile.js'

    if not os.path.exists(filepath):
        print(f"❌ Fichier {filepath} non trouvé")
        return

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Ajouter les méthodes ServerSync si nécessaire
    # Note: Cette partie doit être adaptée selon la structure actuelle du fichier

    print(f"⚠️  {filepath} nécessite une modification manuelle")
    print("   Utilisez ServerSync.getFichesEtoile(), ServerSync.addFicheEtoile(), ServerSync.deleteFicheEtoile()")

def main():
    print("=" * 60)
    print("MIGRATION VERS BASE DE DONNÉES SQLite")
    print("=" * 60)
    print()

    print("Modifications en cours...")
    print()

    modify_documents_js()
    modify_training_js()
    modify_fiche_etoile_js()

    print()
    print("=" * 60)
    print("MIGRATION TERMINÉE")
    print("=" * 60)
    print()
    print("Prochaines étapes :")
    print("1. Vérifiez les fichiers modifiés")
    print("2. Redémarrez le serveur : cd server && node server.js")
    print("3. Testez l'upload de documents")
    print("4. Vérifiez que les données persistent après F5")
    print()

if __name__ == '__main__':
    main()
