import { useFetch } from '../hooks/useFetch';
import type { Profil } from '../api/types';

export default function Accueil() {
    const { data: profil, loading, error } = useFetch<Profil>('/profil');
    if (loading) return <p>Chargement...</p>;
    if (error || !profil) return <p role="alert">Impossible de charger le profil : {error}</p>;
    return (
        <section className="hero">
        <p className="eyebrow">{profil.titre}</p>
        <h1>
            {profil.prenom} {profil.nom}
        </h1>
        {profil.bio && <p className="lead">{profil.bio}</p>}
        <div className="actions">
            {profil.cv_path && (
            <a className="btn" href="/api/profil/cv" download>
                Télécharger mon CV
            </a>
            )}
            <a className="btn btn-outline" href="/contact">
            Me contacter
            </a>
        </div>
        <ul className="links" aria-label="Liens et contact">
            {profil.github && (
            <li>
                <a className="link-arrow" href={profil.github} target="_blank" rel="noopener noreferrer">
                GitHub
                </a>
            </li>
            )}
            {profil.linkedin && (
            <li>
                <a className="link-arrow" href={profil.linkedin} target="_blank" rel="noopener noreferrer">
                LinkedIn
                </a>
            </li>
            )}
            <li>
            <a className="link-arrow" href={`mailto:${profil.email}`}>
                {profil.email}
            </a>
            </li>
        </ul>
        </section>
    );
}