import type { Projet } from '../api/types';
import { formatDate } from '../utils/format';

export default function ProjetCard({ projet }: { projet: Projet }) {
    return (
        <article>
        {projet.image_path && (
            <img src={projet.image_path} alt={`Aperçu du projet ${projet.titre}`} loading="lazy" />
        )}
        <h2>{projet.titre}</h2>
        {projet.date_realisation && (
            <time dateTime={projet.date_realisation}>{formatDate(projet.date_realisation)}</time>
        )}
        <p>{projet.description}</p>
        {projet.competences.length > 0 && (
            <ul aria-label="Compétences utilisées">
            {projet.competences.map((c) => (
                <li key={c.id_competence}>{c.nom}</li>
            ))}
            </ul>
        )}
        {projet.lien && (
            <a href={projet.lien} target="_blank" rel="noopener noreferrer">
            Voir le projet
            </a>
        )}
        </article>
    );
}