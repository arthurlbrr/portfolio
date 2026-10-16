import { useFetch } from '../hooks/useFetch';
import type { Competence } from '../api/types';

function Level({ niveau }: { niveau: number }) {
    return (
        <span className="level" role="img" aria-label={`Niveau ${niveau} sur 5`}>
        {[1, 2, 3, 4, 5].map((n) => (
            <span key={n} className={n <= niveau ? 'on' : undefined} />
        ))}
        </span>
    );
    }
    function CompetenceGroup({ titre, competences }: { titre: string; competences: Competence[] }) {
    if (competences.length === 0) return null;
    return (
        <div className="skills-group">
        <h2>{titre}</h2>
        <ul className="skills-list">
            {competences.map((c) => (
            <li key={c.id_competence} className="skill">
                <span>{c.nom}</span>
                {c.niveau !== null && <Level niveau={c.niveau} />}
            </li>
            ))}
        </ul>
        </div>
    );
}

export default function Competences() {
    const { data: competences, loading, error } = useFetch<Competence[]>('/competences');
    return (
        <section>
        <div className="page-head">
            <p className="eyebrow">Compétences</p>
            <h1>Ce que je maîtrise</h1>
            <p className="lead">Compétences techniques et transversales, avec mon niveau estimé sur 5.</p>
        </div>
        {loading && <p>Chargement...</p>}
        {error && (
            <p className="notice notice-error" role="alert">
            Impossible de charger les compétences : {error}
            </p>
        )}
        {competences && competences.length === 0 && <p>Aucune compétence pour le moment.</p>}
        {competences && (
            <>
            <CompetenceGroup titre="Techniques" competences={competences.filter((c) => c.type === 'technique')} />
            <CompetenceGroup titre="Transversales" competences={competences.filter((c) => c.type === 'transversale')} />
            </>
        )}
        </section>
    );
}