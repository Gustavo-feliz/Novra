// Sessão de acesso da clínica, baseada no Supabase Auth.
//
// O Supabase persiste e renova a sessão sozinho (localStorage + refresh token).
// Aqui mantemos só um cache em memória do papel/paciente atual (para checagens
// síncronas em rotas) e a lógica de bloqueio por tentativas de login, que o
// Supabase não oferece nativamente.

import type { Session } from "@supabase/supabase-js";
import { supabase, fetchProfile, type Role as ProfileRole } from "./supabaseClient";

export type Role = "nutritionist" | "patient";

type Attempts = { count: number; lockedUntil: number };
type AuthState = { userId: string; role: Role; patientId: string | null } | null;

const ATTEMPTS_KEY = "nutriflow.login.attempts";
const PORTAL_KEY = "nutriflow.portal.session";

/** Tentativas de login antes do bloqueio temporário. */
export const MAX_ATTEMPTS = 5;
/** Duração do bloqueio após estourar as tentativas. */
export const LOCK_MS = 5 * 60 * 1000; // 5 min

const hasWindow = typeof window !== "undefined";
const roleMap: Record<ProfileRole, Role> = { admin: "nutritionist", patient: "patient" };

let cached: AuthState = null;
let ready = false;
const listeners = new Set<() => void>();

async function syncFromSession(session: Session | null) {
  if (!session) {
    cached = null;
  } else {
    const profile = await fetchProfile(session.user.id);
    cached = { userId: session.user.id, role: roleMap[profile.role], patientId: profile.patient_id };
  }
  ready = true;
  listeners.forEach((fn) => fn());
}

const initPromise = supabase.auth.getSession().then(({ data }) => syncFromSession(data.session));
supabase.auth.onAuthStateChange((_event, session) => { syncFromSession(session); });

/** Assina mudanças de sessão (login/logout). Retorna função de cancelamento. */
export function onAuthChange(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

export function isAuthReady(): boolean {
  return ready;
}

/** Resolve quando a sessão inicial (persistida) terminou de carregar. */
export function waitForAuth(): Promise<void> {
  return initPromise;
}

export function isAuthenticated(): boolean {
  return cached !== null;
}

export function getRole(): Role | null {
  return cached?.role ?? null;
}

export function getPatientId(): string | null {
  return cached?.patientId ?? null;
}

export function getUserId(): string | null {
  return cached?.userId ?? null;
}

export async function login(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  await syncFromSession(data.session);
}

export async function logout() {
  await supabase.auth.signOut();
}

/* ------------------------- bloqueio por brute-force ------------------------ */

function readAttempts(): Attempts {
  if (!hasWindow) return { count: 0, lockedUntil: 0 };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(ATTEMPTS_KEY) || "");
    if (typeof parsed?.count === "number" && typeof parsed?.lockedUntil === "number") return parsed;
  } catch { /* ignore */ }
  return { count: 0, lockedUntil: 0 };
}

/** Milissegundos restantes de bloqueio (0 = liberado). */
export function getLockRemaining(): number {
  return Math.max(0, readAttempts().lockedUntil - Date.now());
}

/** Registra uma tentativa falha. Retorna quantas tentativas ainda restam
 *  antes do bloqueio (0 quando o bloqueio acabou de ser acionado). */
export function recordFailedAttempt(): number {
  if (!hasWindow) return MAX_ATTEMPTS;
  const current = readAttempts();
  const count = current.count + 1;
  if (count >= MAX_ATTEMPTS) {
    window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count: 0, lockedUntil: Date.now() + LOCK_MS }));
    return 0;
  }
  window.localStorage.setItem(ATTEMPTS_KEY, JSON.stringify({ count, lockedUntil: 0 }));
  return MAX_ATTEMPTS - count;
}

export function clearFailedAttempts() {
  if (hasWindow) window.localStorage.removeItem(ATTEMPTS_KEY);
}

/* --------------------------- sessão do portal ----------------------------- */

/** Slug do portal liberado por código de acesso (independe do login por e-mail). */
export function getPortalSlug(): string | null {
  return hasWindow ? window.localStorage.getItem(PORTAL_KEY) : null;
}

export function unlockPortal(slug: string) {
  if (hasWindow) window.localStorage.setItem(PORTAL_KEY, slug);
}

export function lockPortal() {
  if (hasWindow) window.localStorage.removeItem(PORTAL_KEY);
}
