"use client";

import { createContext, useContext, ReactNode, useRef } from "react";

interface ApiContextType {
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
  invalidateCache: (pathPrefix?: string) => void;
}

const ApiContext = createContext<ApiContextType | null>(null);

// In-memory cache for ultra-fast instant data fetching (Stale-While-Revalidate pattern)
const cacheMap = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 15000; // 15 seconds fresh TTL

export function ApiProvider({ children }: { children: ReactNode }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  const invalidateCache = (pathPrefix?: string) => {
    if (!pathPrefix) {
      cacheMap.clear();
      return;
    }
    for (const key of cacheMap.keys()) {
      if (key.includes(pathPrefix)) {
        cacheMap.delete(key);
      }
    }
  };

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${apiBaseUrl}${path}`;
    const method = (options?.method || "GET").toUpperCase();

    // Check cache for GET requests
    if (method === "GET") {
      const cached = cacheMap.get(url);
      const isFresh = cached && Date.now() - cached.timestamp < CACHE_TTL_MS;

      if (isFresh) {
        // Return instantly from cache
        return cached.data as T;
      }
    }

    const headers = new Headers(options?.headers);
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    try {
      const response = await fetch(url, { ...options, headers });

      if (!response.ok) {
        // Fallback to cached stale data if available on error
        const cached = cacheMap.get(url);
        if (cached) return cached.data as T;
        throw new Error(`API Request Failed: ${response.statusText}`);
      }

      const isJson = response.headers.get("content-type")?.includes("application/json");
      if (!isJson) return {} as T;

      const data = (await response.json()) as T;

      // Cache GET responses
      if (method === "GET") {
        cacheMap.set(url, { data, timestamp: Date.now() });
      } else {
        // Invalidate cache on mutations (POST/PUT/DELETE)
        cacheMap.clear();
      }

      return data;
    } catch (err) {
      const cached = cacheMap.get(url);
      if (cached && method === "GET") {
        return cached.data as T;
      }
      throw err;
    }
  }

  return (
    <ApiContext.Provider value={{ request, invalidateCache }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApi() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error("useApi must be used within an ApiProvider");
  }
  return context;
}
