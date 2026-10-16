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
        <li className="timeline-item">
        <span className="timeline-period">{formatPeriode(experience.date_debut, experience.date_fin)}</span>
        {experience.image_path && (
            <img className="timeline-logo" src={experience.image_path} alt={`Logo ${experience.entreprise}`} loading="lazy" />
        )}
        <h2>{experience.poste}</h2>
        <p className="timeline-company">
            {experience.entreprise}
            {experience.lieu && ` · ${experience.lieu}`}
            <span className="badge">{CONTRATS[experience.type_contrat]}</span>
        </p>
        <p>{experience.description}</p>
        {experience.competences.length > 0 && (
            <ul className="tags" aria-label="Compétences mobilisées">
            {experience.competences.map((c) => (
                <li key={c.id_competence}>{c.nom}</li>
            ))}
            </ul>
        )}
        {experience.lien && (
            <a className="link-arrow" href={experience.lien} target="_blank" rel="noopener noreferrer">
            En savoir plus
            </a>
        )}
        </li>
    );
}