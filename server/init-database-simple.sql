-- ================================================================================
-- SCRIPT D'INITIALISATION SIMPLE - BASE DE DONNÉES MERLIN GERIN
-- ================================================================================
-- Version: 1.0 (Simplifié)
-- Tables essentielles uniquement
-- ================================================================================

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS merlin_gerin_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE merlin_gerin_dashboard;

-- ================================================================================
-- TABLE 1: quality_documents (Documents Qualité)
-- ================================================================================

CREATE TABLE IF NOT EXISTS quality_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    machine VARCHAR(100) NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED,
    file_type VARCHAR(50),
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloads INT UNSIGNED DEFAULT 0,
    views INT UNSIGNED DEFAULT 0,

    INDEX idx_category (category),
    INDEX idx_machine (machine),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- TABLE 2: training_documents (Documents de Formation)
-- ================================================================================

CREATE TABLE IF NOT EXISTS training_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    description TEXT,
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(500) NOT NULL,
    file_size INT UNSIGNED,
    file_type VARCHAR(50),
    uploaded_by VARCHAR(100),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    downloads INT UNSIGNED DEFAULT 0,

    INDEX idx_category (category),
    INDEX idx_uploaded_at (uploaded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- TABLE 3: fiche_etoile (Fiches Étoile - Produits Défectueux)
-- ================================================================================

CREATE TABLE IF NOT EXISTS fiche_etoile (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_reference (reference),
    INDEX idx_emetteur (emetteur),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ================================================================================
-- Vérification
-- ================================================================================

SHOW TABLES;

SELECT '✅ 3 tables créées avec succès!' as message;
