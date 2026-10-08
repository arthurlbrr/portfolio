import { useEffect, useState } from 'react';
import { apiFetch } from '../api/client';

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export function useFetch<T>(path: string): FetchState<T> {
    const [state, setState] = useState<FetchState<T>>({ data: null, loading: true, error: null });
    useEffect(() => {
        let cancelled = false;
        apiFetch<T>(path)
        .then((data) => {
            if (!cancelled) setState({ data, loading: false, error: null });
        })
        .catch((err: Error) => {
            if (!cancelled) setState({ data: null, loading: false, error: err.message });
        });
        return () => {
        cancelled = true;
        };
    }, [path]);
    return state;
}