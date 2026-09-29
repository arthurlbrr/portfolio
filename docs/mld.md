# = clé primaire, * = clé étrangère

ADMIN (#id_admin, email, mot_de_passe)
PROFIL (#id_profil, nom, prenom, titre, bio, email, telephone, ville, cv_path, linkedin, github)
PROJET (#id_projet, titre, description, lien, image_path, date_realisation)
COMPETENCE (#id_competence, nom, type, niveau)
MESSAGE (#id_message, nom, email, contenu, date_envoi, est_lu)
PROJET_COMPETENCE (#id_projet*, #id_competence*)
EXPERIENCE (#id_experience, poste, entreprise, lieu, type_contrat, date_debut, date_fin, description, lien, image_path)
EXPERIENCE_COMPETENCE (#id_experience*, #id_competence*)
