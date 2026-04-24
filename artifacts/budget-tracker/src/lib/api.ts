const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? "";

export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export function getApiUrl(path: string) {
  if (!API_BASE_URL) {
    return path;
  }

  return `${API_BASE_URL}${path}`;
}

export async function apiFetch(input: string, init?: RequestInit) {
  return fetch(getApiUrl(input), {
    credentials: "include",
    ...init,
  });
}
