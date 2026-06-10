import { ApiConfig, JSONValue } from "./types";

export const DEFAULT_API_BASE_URL = "http://localhost:5000";

export async function getAPI<T>(
  path: string,
  params: Record<string, string | number | boolean | null | undefined> = {}
): Promise<T> {
  const url = new URL(path, DEFAULT_API_BASE_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.append(key, String(value));
    }
  });

  console.log(`Making GET request to: ${url.toString()}`);

  const response = await fetch(url.toString());
  const result = await response.json();
  return result as T;
}

export async function postAPI<T>(path: string, body: JSONValue): Promise<T> {
  const url = new URL(path, DEFAULT_API_BASE_URL);
  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const result = await response.json();
  return result as T;
}