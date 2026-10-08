export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}

export function formatPeriode(debut: string, fin: string | null): string {
    return `${formatDate(debut)} – ${fin ? formatDate(fin) : 'en cours'}`;
}