import { useFetch } from '../hooks/useFetch';
import type { Experience } from '../api/types';
import ExperienceCard from '../components/ExperienceCard';

export default function Experiences() {
    const { data: experiences, loading, error } = useFetch<Experience[]>('/experiences');
    return (
        <section>
        <div className="page-head">
            <p className="eyebrow">Expériences</p>
            <h1>Mon parcours</h1>
            <p className="lead">Stages et expériences professionnelles, de la plus récente à la plus ancienne.</p>
        </div>
        {loading && <p>Chargement...</p>}
        {error && (
            <p className="notice notice-error" role="alert">
            Impossible de charger les expériences : {error}
            </p>
        )}
        {experiences && experiences.length === 0 && <p>Aucune expérience pour le moment.</p>}
        {experiences && experiences.length > 0 && (
            <ol className="timeline">
            {experiences.map((experience) => (
                <ExperienceCard key={experience.id_experience} experience={experience} />
            ))}
            </ol>
        )}
        </section>
    );
}