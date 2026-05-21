import { API } from './api';

type ApiOptions = RequestInit & {
  timeoutMs?: number;
  retries?: number;
};

export async function apiFetch<T = any>(
  path: string,
  options: ApiOptions = {}
): Promise<T> {
  const {
    timeoutMs = 12000,
    retries = 1,
    ...fetchOptions
  } = options;

  const url = path.startsWith('http') ? path : `${API}${path}`;

  let lastError: any;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`API ${res.status}: ${res.statusText}`);
      }

      return (await res.json()) as T;
    } catch (error) {
      clearTimeout(timer);
      lastError = error;

      if (attempt === retries) break;
      await new Promise((resolve) => setTimeout(resolve, 350));
    }
  }

  throw lastError;
}

export async function apiPost<T = any>(path: string, body: any): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function apiDelete<T = any>(path: string): Promise<T> {
  return apiFetch<T>(path, {
    method: 'DELETE',
  });
}

export async function apiPatch<T = any>(path: string, body: any): Promise<T> {
  return apiFetch<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}
