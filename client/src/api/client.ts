export class ApiError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`/api${path}`, { credentials: 'include', ...options });
    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(res.status, data?.message ?? 'Erreur réseau');
    }
    return data as T;
}