import { ApiConfig } from "./types";

export const DEFAULT_API_BASE_URL = "http://localhost:5000";


export function getApiConfig(): ApiConfig {
  const baseUrl =
    process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || DEFAULT_API_BASE_URL;
  return { baseUrl: baseUrl.replace(/\/+$/, "") };
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const { baseUrl } = getApiConfig();
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const text = await response.text();
  const payload = text ? safeJsonParse(text) : null;

  if (!response.ok) {
    const message =
      (payload && typeof payload === "object" && "error" in payload
        ? String((payload as { error: unknown }).error)
        : null) ??
      (payload && typeof payload === "object" && "title" in payload
        ? String((payload as { title: unknown }).title)
        : null) ??
      `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}


export function safeJsonParse(value: string) {
  try {
    return JSON.parse(value) as unknown;
  } catch {
    return value;
  }
}