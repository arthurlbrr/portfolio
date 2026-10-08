export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString('fr-FR', {
        month: 'long',
        year: 'numeric',
        timeZone: 'UTC',
    });
}