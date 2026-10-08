export interface Competence {
    id_competence: number;
    nom: string;
    type: 'technique' | 'transversale';
    niveau: number | null;
}

export interface Projet {
    id_projet: number;
    titre: string;
    description: string;
    lien: string | null;
    image_path: string | null;
    date_realisation: string | null;
    competences: Competence[];
}

export interface Experience {
    id_experience: number;
    poste: string;
    entreprise: string;
    lieu: string | null;
    type_contrat: 'stage' | 'alternance' | 'emploi' | 'freelance';
    date_debut: string;
    date_fin: string | null;
    description: string;
    lien: string | null;
    image_path: string | null;
    competences: Competence[];
}

export interface Profil {
    nom: string;
    prenom: string;
    titre: string;
    bio: string | null;
    email: string;
    telephone: string | null;
    ville: string | null;
    cv_path: string | null;
    linkedin: string | null;
    github: string | null;
}