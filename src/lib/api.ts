const TOKEN_KEY = "nutriflow.api.token";
const USER_KEY = "nutriflow.api.user";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "nutritionist" | "patient";
  patientId?: string;
};

export function getApiToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setApiSession(token: string, user: ApiUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearApiSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getApiToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", headers.get("Content-Type") || "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(path, { ...init, headers });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error || "Erro ao chamar a API do NutriFlow.");
  }

  return payload as T;
}

export async function loginWithApi(email: string, password: string) {
  const session = await apiFetch<{ token: string; user: ApiUser }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setApiSession(session.token, session.user);
  return session;
}

export async function tryApiFetch<T>(path: string, fallback: T, init: RequestInit = {}): Promise<T> {
  try {
    return await apiFetch<T>(path, init);
  } catch {
    return fallback;
  }
}
