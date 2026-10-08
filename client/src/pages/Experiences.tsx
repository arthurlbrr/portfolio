import { useFetch } from '../hooks/useFetch';
import type { Experience } from '../api/types';
import ExperienceCard from '../components/ExperienceCard';

export default function Experiences() {
    const { data: experiences, loading, error } = useFetch<Experience[]>('/experiences');
    return (
        <section>
        <h1>Expériences</h1>
        {loading && <p>Chargement...</p>}
        {error && <p role="alert">Impossible de charger les expériences : {error}</p>}
        {experiences && experiences.length === 0 && <p>Aucune expérience pour le moment.</p>}
        {experiences?.map((experience) => (
            <ExperienceCard key={experience.id_experience} experience={experience} />
        ))}
        </section>
    );
}