-- Script de configuration MySQL pour Merlin Gerin Dashboard
-- Exécutez ce script dans MySQL pour créer la base de données

-- Créer la base de données
CREATE DATABASE IF NOT EXISTS merlin_gerin_dashboard
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Utiliser la base de données
USE merlin_gerin_dashboard;

-- Afficher les tables créées
SHOW TABLES;

-- Message de confirmation
SELECT 'Base de données merlin_gerin_dashboard créée avec succès!' AS Message;
