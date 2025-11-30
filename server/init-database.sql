-- ================================================================================
-- SCRIPT D'INITIALISATION COMPLET - BASE DE DONNÉES MERLIN GERIN DASHBOARD
-- ================================================================================
-- Version: 1.0
-- Date: 2025-11-30
-- Description: Crée toutes les tables nécessaires pour l'application
-- ================================================================================

-- ================================================================================
-- 1. CRÉATION DE LA BASE DE DONNÉES
-- ================================================================================

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS merlin_gerin_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE merlin_gerin_dashboard;

-- ================================================================================
-- 2. SUPPRESSION DES TABLES EXISTANTES (Pour réinitialisation complète)
-- ================================================================================

-- Désactiver les contraintes de clés étrangères temporairement
SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS fiche_etoile;
DROP TABLE IF EXISTS quality_documents;
DROP TABLE IF EXISTS training_documents;
DROP TABLE IF EXISTS quality_results;
DROP TABLE IF EXISTS quality_rejects;
DROP TABLE IF EXISTS recent_activities;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS system_config;

-- Réactiver les contraintes de clés étrangères
SET FOREIGN_KEY_CHECKS = 1;

-- ================================================================================
-- 3. TABLE: users (Gestion des utilisateurs)
-- ================================================================================

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'operator', 'quality', 'viewer') NOT NULL DEFAULT 'operator',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Table des utilisateurs de l''application';

-- ================================================================================
-- 4. TABLE: quality_documents (Documents Qualité)
-- ================================================================================

CREATE TABLE quality_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    machine VARCHAR(100) NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED COMMENT 'Taille du fichier en octets',
    file_type VARCHAR(50) COMMENT 'Type MIME du fichier',
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloads INT UNSIGNED DEFAULT 0 COMMENT 'Nombre de téléchargements',
    views INT UNSIGNED DEFAULT 0 COMMENT 'Nombre de consultations',
    is_archived BOOLEAN DEFAULT FALSE,

    INDEX idx_category (category),
    INDEX idx_machine (machine),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_is_archived (is_archived),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documents qualité par machine (contrôles, audits, procédures, etc.)';

-- ================================================================================
-- 5. TABLE: training_documents (Documents de Formation)
-- ================================================================================

CREATE TABLE training_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED COMMENT 'Taille du fichier en octets',
    file_type VARCHAR(50) COMMENT 'Type MIME du fichier',
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloads INT UNSIGNED DEFAULT 0 COMMENT 'Nombre de téléchargements',
    views INT UNSIGNED DEFAULT 0 COMMENT 'Nombre de consultations',
    is_archived BOOLEAN DEFAULT FALSE,

    INDEX idx_category (category),
    INDEX idx_uploaded_by (uploaded_by),
    INDEX idx_uploaded_at (uploaded_at),
    INDEX idx_is_archived (is_archived),
    FULLTEXT idx_search (title, description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Documents de formation (basics, contrôles, procédures, standards, outils)';

-- ================================================================================
-- 6. TABLE: fiche_etoile (Fiches Étoile - Produits Défectueux)
-- ================================================================================

CREATE TABLE fiche_etoile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(100) NOT NULL,
    emetteur VARCHAR(100) NOT NULL,
    date_fabrication VARCHAR(50) NOT NULL,
    date VARCHAR(50) NOT NULL,
    quantite INT NOT NULL,
    avis_qualite VARCHAR(100),
    description TEXT NOT NULL,
    actions TEXT NOT NULL,
    delai VARCHAR(50) NOT NULL,
    status ENUM('pending', 'in_progress', 'completed', 'cancelled') DEFAULT 'pending',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,

    INDEX idx_reference (reference),
    INDEX idx_emetteur (emetteur),
    INDEX idx_created_at (created_at),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    FULLTEXT idx_search (reference, description, actions)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Fiches étoile pour signalement de produits défectueux';

-- ================================================================================
-- 7. TABLE: quality_results (Résultats de Contrôle Qualité)
-- ================================================================================

CREATE TABLE quality_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    line ENUM('A', 'B', 'C', 'D') NOT NULL,
    reference VARCHAR(100) NOT NULL,
    status ENUM('success', 'warning', 'danger') NOT NULL,
    operator VARCHAR(100) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_date (date),
    INDEX idx_line (line),
    INDEX idx_reference (reference),
    INDEX idx_status (status),
    INDEX idx_operator (operator)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Résultats des contrôles qualité par ligne de production';

-- ================================================================================
-- 8. TABLE: quality_rejects (Rebuts/Rejets Qualité)
-- ================================================================================

CREATE TABLE quality_rejects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    machine VARCHAR(100) NOT NULL,
    workcenter VARCHAR(100) NOT NULL,
    material VARCHAR(100) NOT NULL,
    description TEXT,
    scrap_quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(12, 2) GENERATED ALWAYS AS (scrap_quantity * unit_price) STORED,
    reason ENUM('dimension', 'appearance', 'function', 'material', 'other') NOT NULL,
    reason_details TEXT,
    operator VARCHAR(100) NOT NULL,
    ilot VARCHAR(10) COMMENT 'PM1, PM2, BZ1, BZ2, GRM',
    is_analyzed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_date (date),
    INDEX idx_machine (machine),
    INDEX idx_workcenter (workcenter),
    INDEX idx_material (material),
    INDEX idx_reason (reason),
    INDEX idx_operator (operator),
    INDEX idx_ilot (ilot),
    INDEX idx_is_analyzed (is_analyzed),
    INDEX idx_total_cost (total_cost)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Rebuts et rejets qualité avec analyse des coûts';

-- ================================================================================
-- 9. TABLE: recent_activities (Activités Récentes)
-- ================================================================================

CREATE TABLE recent_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    activity_type ENUM('document_upload', 'training_upload', 'document_delete',
                       'training_delete', 'fiche_created', 'fiche_updated',
                       'quality_check', 'user_action') NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    user VARCHAR(100) NOT NULL,
    related_id INT COMMENT 'ID de l''élément concerné',
    related_type VARCHAR(50) COMMENT 'Type d''élément (document, fiche, etc.)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_activity_type (activity_type),
    INDEX idx_user (user),
    INDEX idx_created_at (created_at),
    INDEX idx_related (related_type, related_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Historique des activités récentes dans l''application';

-- ================================================================================
-- 10. TABLE: system_config (Configuration Système)
-- ================================================================================

CREATE TABLE system_config (
    id INT AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(100) NOT NULL UNIQUE,
    config_value TEXT,
    description TEXT,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_editable BOOLEAN DEFAULT TRUE,
    updated_by VARCHAR(100),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_config_key (config_key),
    INDEX idx_is_editable (is_editable)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Configuration système de l''application';

-- ================================================================================
-- 11. INSERTION DES DONNÉES INITIALES
-- ================================================================================

-- Utilisateurs par défaut
INSERT INTO users (username, full_name, email, password_hash, role) VALUES
('l.lalot', 'LALOT Ludovic', 'l.lalot@merlin-gerin.fr', '$2a$10$dummy_hash_lalot', 'admin'),
('a.boulenger', 'BOULENGER Antoine', 'a.boulenger@merlin-gerin.fr', '$2a$10$dummy_hash_boulenger', 'admin'),
('admin', 'Administrateur', 'admin@merlin-gerin.fr', '$2a$10$dummy_hash_admin', 'admin');

-- Configuration système par défaut
INSERT INTO system_config (config_key, config_value, description, data_type, is_editable) VALUES
('data_version', '3.4', 'Version actuelle des données', 'string', TRUE),
('excel_file_path', 'server/data/sap_export.xlsx', 'Chemin du fichier Excel SAP', 'string', TRUE),
('cache_refresh_time', '03:00', 'Heure de rafraîchissement du cache (HH:MM)', 'string', TRUE),
('ilot_cache_refresh_time', '08:30', 'Heure de rafraîchissement des caches îlots', 'string', TRUE),
('max_file_upload_size', '52428800', 'Taille max upload fichiers (50MB en octets)', 'number', TRUE),
('enable_auto_backup', 'true', 'Activer les sauvegardes automatiques', 'boolean', TRUE),
('backup_retention_days', '30', 'Durée de conservation des sauvegardes (jours)', 'number', TRUE),
('session_timeout', '86400', 'Durée de session utilisateur (secondes - 24h)', 'number', TRUE);

-- ================================================================================
-- 12. VUES UTILES
-- ================================================================================

-- Vue: Statistiques des fiches étoile par statut
CREATE OR REPLACE VIEW v_fiche_etoile_stats AS
SELECT
    status,
    priority,
    COUNT(*) as total,
    SUM(quantite) as total_quantite
FROM fiche_etoile
GROUP BY status, priority;

-- Vue: Top 10 machines avec le plus de rebuts
CREATE OR REPLACE VIEW v_top_machines_rejects AS
SELECT
    machine,
    COUNT(*) as reject_count,
    SUM(scrap_quantity) as total_scrap,
    SUM(total_cost) as total_cost,
    AVG(total_cost) as avg_cost
FROM quality_rejects
GROUP BY machine
ORDER BY total_cost DESC
LIMIT 10;

-- Vue: Activités récentes (derniers 7 jours)
CREATE OR REPLACE VIEW v_recent_activities_7days AS
SELECT *
FROM recent_activities
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;

-- Vue: Documents qualité les plus consultés
CREATE OR REPLACE VIEW v_popular_quality_docs AS
SELECT
    id,
    title,
    category,
    machine,
    views,
    downloads,
    uploaded_at
FROM quality_documents
WHERE is_archived = FALSE
ORDER BY views DESC, downloads DESC
LIMIT 20;

-- ================================================================================
-- 13. PROCÉDURES STOCKÉES UTILES
-- ================================================================================

-- Procédure: Archiver les documents anciens
DELIMITER //

CREATE PROCEDURE sp_archive_old_documents(IN days_old INT)
BEGIN
    -- Archive quality documents
    UPDATE quality_documents
    SET is_archived = TRUE
    WHERE uploaded_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND is_archived = FALSE;

    -- Archive training documents
    UPDATE training_documents
    SET is_archived = TRUE
    WHERE uploaded_at < DATE_SUB(NOW(), INTERVAL days_old DAY)
    AND is_archived = FALSE;

    SELECT ROW_COUNT() as archived_count;
END //

DELIMITER ;

-- Procédure: Nettoyer les vieilles activités
DELIMITER //

CREATE PROCEDURE sp_cleanup_old_activities(IN days_old INT)
BEGIN
    DELETE FROM recent_activities
    WHERE created_at < DATE_SUB(NOW(), INTERVAL days_old DAY);

    SELECT ROW_COUNT() as deleted_count;
END //

DELIMITER ;

-- Procédure: Obtenir les statistiques de production
DELIMITER //

CREATE PROCEDURE sp_get_production_stats(IN start_date DATE, IN end_date DATE)
BEGIN
    SELECT
        machine,
        ilot,
        COUNT(*) as total_rejects,
        SUM(scrap_quantity) as total_scrap_qty,
        SUM(total_cost) as total_cost,
        AVG(total_cost) as avg_cost_per_reject
    FROM quality_rejects
    WHERE date BETWEEN start_date AND end_date
    GROUP BY machine, ilot
    ORDER BY total_cost DESC;
END //

DELIMITER ;

-- ================================================================================
-- 14. TRIGGERS
-- ================================================================================

-- Trigger: Créer une activité lors de l'ajout d'une fiche étoile
DELIMITER //

CREATE TRIGGER tr_fiche_etoile_insert
AFTER INSERT ON fiche_etoile
FOR EACH ROW
BEGIN
    INSERT INTO recent_activities (
        activity_type,
        title,
        description,
        icon,
        user,
        related_id,
        related_type
    ) VALUES (
        'fiche_created',
        CONCAT('Nouvelle fiche étoile: ', NEW.reference),
        CONCAT('Quantité: ', NEW.quantite, ' - Émetteur: ', NEW.emetteur),
        'star',
        NEW.emetteur,
        NEW.id,
        'fiche_etoile'
    );
END //

DELIMITER ;

-- Trigger: Créer une activité lors de l'upload d'un document qualité
DELIMITER //

CREATE TRIGGER tr_quality_doc_insert
AFTER INSERT ON quality_documents
FOR EACH ROW
BEGIN
    INSERT INTO recent_activities (
        activity_type,
        title,
        description,
        icon,
        user,
        related_id,
        related_type
    ) VALUES (
        'document_upload',
        CONCAT('Document qualité ajouté: ', NEW.title),
        CONCAT('Machine: ', NEW.machine, ' - Catégorie: ', NEW.category),
        'file-upload',
        COALESCE(NEW.uploaded_by, 'Système'),
        NEW.id,
        'quality_document'
    );
END //

DELIMITER ;

-- ================================================================================
-- 15. INDEX SUPPLÉMENTAIRES POUR PERFORMANCE
-- ================================================================================

-- Index composites pour requêtes fréquentes
CREATE INDEX idx_quality_docs_machine_category ON quality_documents(machine, category);
CREATE INDEX idx_quality_docs_archived_date ON quality_documents(is_archived, uploaded_at);

CREATE INDEX idx_training_docs_category_date ON training_documents(category, uploaded_at);

CREATE INDEX idx_fiche_status_priority ON fiche_etoile(status, priority);
CREATE INDEX idx_fiche_date_range ON fiche_etoile(date, created_at);

CREATE INDEX idx_rejects_date_machine ON quality_rejects(date, machine);
CREATE INDEX idx_rejects_ilot_date ON quality_rejects(ilot, date);

-- ================================================================================
-- 16. VÉRIFICATION ET AFFICHAGE DES TABLES CRÉÉES
-- ================================================================================

-- Afficher toutes les tables
SELECT 'Tables créées:' as info;
SHOW TABLES;

-- Afficher le nombre de lignes dans chaque table
SELECT
    'users' as table_name,
    COUNT(*) as row_count
FROM users
UNION ALL
SELECT 'quality_documents', COUNT(*) FROM quality_documents
UNION ALL
SELECT 'training_documents', COUNT(*) FROM training_documents
UNION ALL
SELECT 'fiche_etoile', COUNT(*) FROM fiche_etoile
UNION ALL
SELECT 'quality_results', COUNT(*) FROM quality_results
UNION ALL
SELECT 'quality_rejects', COUNT(*) FROM quality_rejects
UNION ALL
SELECT 'recent_activities', COUNT(*) FROM recent_activities
UNION ALL
SELECT 'system_config', COUNT(*) FROM system_config;

-- Afficher les vues créées
SELECT 'Vues créées:' as info;
SHOW FULL TABLES WHERE Table_type = 'VIEW';

-- Afficher les procédures stockées créées
SELECT 'Procédures stockées créées:' as info;
SHOW PROCEDURE STATUS WHERE Db = 'merlin_gerin_dashboard';

-- Message de succès
SELECT '✅ Base de données initialisée avec succès!' as message;
SELECT CONCAT('📊 Base de données: merlin_gerin_dashboard') as info;
SELECT CONCAT('📋 Tables: ', COUNT(*), ' tables créées') as info
FROM information_schema.tables
WHERE table_schema = 'merlin_gerin_dashboard' AND table_type = 'BASE TABLE';

-- ================================================================================
-- FIN DU SCRIPT
-- ================================================================================
