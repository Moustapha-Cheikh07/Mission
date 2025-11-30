#!/bin/bash
# ========================================
# Dashboard Qualité - Script de démarrage Linux/Mac
# ========================================

echo ""
echo "=========================================="
echo "  Dashboard Qualité - Démarrage"
echo "=========================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "[ERREUR] Node.js n'est pas installé !"
    echo ""
    echo "Installation :"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  CentOS/RHEL:   sudo yum install nodejs npm"
    echo "  Mac:           brew install node"
    echo ""
    exit 1
fi

echo "[OK] Node.js installé : $(node --version)"
echo ""

# Aller dans le dossier server
cd "$(dirname "$0")/../server" || exit 1

# Vérifier si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "[INFO] Première installation détectée"
    echo "[INFO] Installation des dépendances..."
    echo ""
    npm install
    if [ $? -ne 0 ]; then
        echo "[ERREUR] L'installation a échoué !"
        exit 1
    fi
    echo ""
    echo "[OK] Dépendances installées"
    echo ""
fi

echo "[INFO] Démarrage du serveur..."
echo ""
echo "=========================================="
echo ""

# Démarrer le serveur
node server.js
