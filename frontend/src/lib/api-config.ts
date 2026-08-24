/**
 * Centralized API configuration for Hariyuka AI.
 * Automatically adapts between local development (http://localhost:8000)
 * and production deployment under reverse proxy (Caddy / domain /api/v1).
 */

const getApiBase = (): string => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    // If NEXT_PUBLIC_API_URL is set (e.g. "https://hariyuka.my.id/api/v1" or "http://localhost:8000/api/v1")
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "");
  }

  // In browser environment on non-localhost domain (e.g. hariyuka.my.id)
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      // Relative path: routes via Caddy / reverse proxy on same domain
      return "";
    }
  }

  // Default fallback for local development
  return "http://localhost:8000";
};

export const API_BASE = getApiBase();

export const getApiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const base = getApiBase();
  return `${base}${cleanEndpoint}`;
};
