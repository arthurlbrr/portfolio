import type { Projet } from '../api/types';
import { formatDate } from '../utils/format';

export default function ProjetCard({ projet }: { projet: Projet }) {
    return (
        <article className="card">
        {projet.image_path ? (
            <div className="card-media">
            <img src={projet.image_path} alt={`Aperçu du projet ${projet.titre}`} loading="lazy" />
            </div>
        ) : (
            <div className="card-media card-media-empty" aria-hidden="true">
            {projet.titre.charAt(0)}
            </div>
        )}
        <div className="card-body">
            {projet.date_realisation && (
            <time className="card-meta" dateTime={projet.date_realisation}>
                {formatDate(projet.date_realisation)}
            </time>
            )}
            <h2>{projet.titre}</h2>
            <p>{projet.description}</p>
            {projet.competences.length > 0 && (
            <ul className="tags" aria-label="Compétences utilisées">
                {projet.competences.map((c) => (
                <li key={c.id_competence}>{c.nom}</li>
                ))}
            </ul>
            )}
            {projet.lien && (
            <a className="link-arrow" href={projet.lien} target="_blank" rel="noopener noreferrer">
                Voir le projet
            </a>
            )}
        </div>
        </article>
    );
}