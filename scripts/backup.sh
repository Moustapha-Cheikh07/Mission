#!/bin/bash
# ========================================
# Dashboard Qualité - Script de sauvegarde
# ========================================

BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="dashboard-backup-$DATE"

echo ""
echo "=========================================="
echo "  Sauvegarde Dashboard Qualité"
echo "=========================================="
echo ""

# Créer dossier backup
mkdir -p "$BACKUP_DIR"

echo "[1/3] Sauvegarde de la base de données..."
if [ -f "./server/database/dashboard.db" ]; then
    cp "./server/database/dashboard.db" "$BACKUP_DIR/dashboard-$DATE.db"
    echo "[OK] Base de données sauvegardée"
else
    echo "[ATTENTION] Base de données non trouvée"
fi
echo ""

echo "[2/3] Sauvegarde des documents uploadés..."
if [ -d "./assets/documents" ]; then
    tar -czf "$BACKUP_DIR/documents-$DATE.tar.gz" "./assets/documents"
    echo "[OK] Documents sauvegardés"
fi
if [ -d "./assets/training" ]; then
    tar -czf "$BACKUP_DIR/training-$DATE.tar.gz" "./assets/training"
    echo "[OK] Documents de formation sauvegardés"
fi
echo ""

echo "[3/3] Sauvegarde complète..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" \
    --exclude="node_modules" \
    --exclude="backups" \
    --exclude=".git" \
    .
echo "[OK] Sauvegarde complète créée"
echo ""

echo "=========================================="
echo "  Sauvegarde terminée !"
echo "=========================================="
echo ""
echo "Fichiers créés dans : $BACKUP_DIR/"
ls -lh "$BACKUP_DIR/" | grep "$DATE"
echo ""

# Nettoyage des anciennes sauvegardes (garder 7 dernières)
echo "Nettoyage des anciennes sauvegardes..."
cd "$BACKUP_DIR" && ls -t *.tar.gz 2>/dev/null | tail -n +8 | xargs -r rm
echo "[OK] Anciennes sauvegardes nettoyées (conservées : 7 dernières)"
echo ""
