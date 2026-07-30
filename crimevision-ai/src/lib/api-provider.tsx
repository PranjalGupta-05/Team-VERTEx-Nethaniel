"use client";

import { createContext, useContext, ReactNode } from "react";

interface ApiContextType {
  request: <T>(path: string, options?: RequestInit) => Promise<T>;
}

const ApiContext = createContext<ApiContextType | null>(null);

export function ApiProvider({ children }: { children: ReactNode }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  async function request<T>(path: string, options?: RequestInit): Promise<T> {
    const url = `${apiBaseUrl}${path}`;
    const headers = new Headers(options?.headers);
    headers.set("Content-Type", "application/json");

    const response = await fetch(url, { ...options, headers });
    
    if (!response.ok) {
      throw new Error(`API Request Failed: ${response.statusText}`);
    }

    const isJson = response.headers.get("content-type")?.includes("application/json");
    if (!isJson) return {} as T;

    return response.json() as T;
  }

  return (
    <ApiContext.Provider value={{ request }}>
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
