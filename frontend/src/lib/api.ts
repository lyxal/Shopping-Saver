import type { ListSummary, ListProductsResponse } from "./types";

export type ApiConfig = {
  baseUrl: string;
};

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

export function normalizeLists(payload: unknown): ListSummary[] {
  if (!payload) return [];

  if (Array.isArray(payload)) {
    return payload
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const candidate = item as Partial<ListSummary>;
        if (typeof candidate.ListID !== "string") return null;
        return {
          ListID: candidate.ListID,
          ListName:
            typeof candidate.ListName === "string"
              ? candidate.ListName
              : "Untitled list",
          ProductCount: candidate.ProductCount ?? 0,
          CreatedAt: candidate.CreatedAt,
          LastEdited: candidate.LastEdited,
        };
      })
      .filter((item): item is ListSummary => item !== null);
  }

  if (typeof payload === "object" && "Lists" in payload) {
    return normalizeLists((payload as { Lists?: unknown }).Lists);
  }

  return [];
}

export function normalizeListProducts(payload: ListProductsResponse | unknown) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === "object" && "Products" in payload) {
    const products = (payload as { Products?: unknown }).Products;
    return Array.isArray(products) ? products : [];
  }

  return [];
}

export function formatCurrency(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatPercent(value?: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return "-";
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(1)}%`;
}
