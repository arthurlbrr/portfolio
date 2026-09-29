CREATE DATABASE IF NOT EXISTS portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE portfolio;

CREATE TABLE admin (
  id_admin INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  mot_de_passe VARCHAR(255) NOT NULL
);

CREATE TABLE profil (
  id_profil INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  prenom VARCHAR(100) NOT NULL,
  titre VARCHAR(150) NOT NULL,
  bio TEXT,
  email VARCHAR(255) NOT NULL,
  telephone VARCHAR(20),
  ville VARCHAR(100),
  cv_path VARCHAR(255),
  linkedin VARCHAR(255),
  github VARCHAR(255)
);

CREATE TABLE projet (
  id_projet INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  titre VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  lien VARCHAR(255),
  image_path VARCHAR(255),
  date_realisation DATE
);

CREATE TABLE competence (
  id_competence INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL UNIQUE,
  type ENUM('technique', 'transversale') NOT NULL,
  niveau TINYINT UNSIGNED CHECK (niveau BETWEEN 1 AND 5)
);

CREATE TABLE message (
  id_message INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  nom VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  contenu TEXT NOT NULL,
  date_envoi DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  est_lu BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE projet_competence (
  id_projet INT UNSIGNED NOT NULL,
  id_competence INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_projet, id_competence),
  FOREIGN KEY (id_projet) REFERENCES projet(id_projet) ON DELETE CASCADE,
  FOREIGN KEY (id_competence) REFERENCES competence(id_competence) ON DELETE CASCADE
);

CREATE TABLE experience (
  id_experience INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  poste VARCHAR(150) NOT NULL,
  entreprise VARCHAR(150) NOT NULL,
  lieu VARCHAR(100),
  type_contrat ENUM('stage', 'alternance', 'emploi', 'freelance') NOT NULL,
  date_debut DATE NOT NULL,
  date_fin DATE,
  description TEXT NOT NULL,
  lien VARCHAR(255),
  image_path VARCHAR(255)
);

CREATE TABLE experience_competence (
  id_experience INT UNSIGNED NOT NULL,
  id_competence INT UNSIGNED NOT NULL,
  PRIMARY KEY (id_experience, id_competence),
  FOREIGN KEY (id_experience) REFERENCES experience(id_experience) ON DELETE CASCADE,
  FOREIGN KEY (id_competence) REFERENCES competence(id_competence) ON DELETE CASCADE
);