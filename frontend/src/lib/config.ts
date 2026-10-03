export const apiMode = process.env.NEXT_PUBLIC_API_MODE ?? "mock";

export const isMockMode = apiMode === "mock";

export const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";
