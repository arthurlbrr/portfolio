import type { Experience } from '../api/types';
import { formatPeriode } from '../utils/format';

const CONTRATS: Record<Experience['type_contrat'], string> = {
    stage: 'Stage',
    alternance: 'Alternance',
    emploi: 'Emploi',
    freelance: 'Freelance',
};

export default function ExperienceCard({ experience }: { experience: Experience }) {
    return (
        <article>
        {experience.image_path && (
            <img src={experience.image_path} alt={`Logo ${experience.entreprise}`} loading="lazy" />
        )}
        <h2>{experience.poste}</h2>
        <p>
            {experience.entreprise}
            {experience.lieu && ` · ${experience.lieu}`}
        </p>
        <p>
            {CONTRATS[experience.type_contrat]} · {formatPeriode(experience.date_debut, experience.date_fin)}
        </p>
        <p>{experience.description}</p>
        {experience.competences.length > 0 && (
            <ul aria-label="Compétences mobilisées">
            {experience.competences.map((c) => (
                <li key={c.id_competence}>{c.nom}</li>
            ))}
            </ul>
        )}
        {experience.lien && (
            <a href={experience.lien} target="_blank" rel="noopener noreferrer">
            En savoir plus
            </a>
        )}
        </article>
    );
}