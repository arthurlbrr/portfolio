import { useFetch } from '../hooks/useFetch';
import type { Competence } from '../api/types';

function CompetenceList({ titre, competences }: { titre: string; competences: Competence[] }) {
    if (competences.length === 0) return null;
    return (
        <section>
        <h2>{titre}</h2>
        <ul>
            {competences.map((c) => (
            <li key={c.id_competence}>
                {c.nom}
                {c.niveau !== null && (
                <meter min={1} max={5} value={c.niveau} aria-label={`Niveau ${c.niveau} sur 5`}>
                    {c.niveau}/5
                </meter>
                )}
            </li>
            ))}
        </ul>
        </section>
    );
}

export default function Competences() {
    const { data: competences, loading, error } = useFetch<Competence[]>('/competences');
    return (
        <section>
        <h1>Compétences</h1>
        {loading && <p>Chargement...</p>}
        {error && <p role="alert">Impossible de charger les compétences : {error}</p>}
        {competences && competences.length === 0 && <p>Aucune compétence pour le moment.</p>}
        {competences && (
            <>
            <CompetenceList titre="Compétences techniques" competences={competences.filter((c) => c.type === 'technique')} />
            <CompetenceList titre="Compétences transversales" competences={competences.filter((c) => c.type === 'transversale')} />
            </>
        )}
        </section>
    );
}