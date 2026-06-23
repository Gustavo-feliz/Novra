// Sessão e segurança de acesso da demo.
//
// AVISO IMPORTANTE: este projeto é 100% front-end (sem backend). Tudo aqui roda
// no navegador, então NÃO substitui autenticação de servidor — qualquer pessoa
// com o devtools consegue ler/alterar o storage. O objetivo é (1) impedir acesso
// acidental por URL, (2) simular um fluxo de login realista e (3) aplicar boas
// práticas de UX de segurança (expiração, bloqueio por tentativas, sessão por
// aba). Para produção, mova a verificação de credenciais e a emissão de sessão
// para uma API com cookies httpOnly.

export type Role = "nutritionist" | "patient";

type Session = { role: Role; createdAt: number; lastSeen: number };
type Attempts = { count: number; lockedUntil: number };

const SESSION_KEY = "nutriflow.session";
const ATTEMPTS_KEY = "nutriflow.login.attempts";
const PORTAL_KEY = "nutriflow.portal.session";
const EXPIRED_FLAG = "nutriflow.session.expired";

/** Inatividade máxima antes da sessão expirar. */
export const SESSION_TTL = 8 * 60 * 60 * 1000; // 8h
/** Tentativas de login antes do bloqueio temporário. */
export const MAX_ATTEMPTS = 5;
/** Duração do bloqueio após estourar as tentativas. */
export const LOCK_MS = 5 * 60 * 1000; // 5 min

const hasWindow = typeof window !== "undefined";

/* ----------------------------- sessão de acesso ---------------------------- */

function rawSession(): { value: string; persistent: boolean } | null {
  if (!hasWindow) return null;
  const local = window.localStorage.getItem(SESSION_KEY);
  if (local) return { value: local, persistent: true };
  const session = window.sessionStorage.getItem(SESSION_KEY);
  if (session) return { value: session, persistent: false };
  return null;
}

function readSession(): Session | null {
  const raw = rawSession();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw.value) as Session;
    if (parsed.role !== "nutritionist" && parsed.role !== "patient") throw new Error("role inválida");
    if (Date.now() - parsed.lastSeen > SESSION_TTL) {
      clearSession();
      if (hasWindow) window.sessionStorage.setItem(EXPIRED_FLAG, "1");
      return null;
    }
    return parsed;
  } catch {
    clearSession();
    return null;
  }
}

export function getSession(): Session | null {
  return readSession();
}

export function isAuthenticated(): boolean {
  return readSession() !== null;
}

export function getRole(): Role | null {
  return readSession()?.role ?? null;
}

/** Cria uma nova sessão. `remember` decide entre persistir (localStorage) ou
 *  durar apenas enquanto a aba estiver aberta (sessionStorage). */
export function startSession(role: Role, remember: boolean) {
  if (!hasWindow) return;
  clearSession();
  window.sessionStorage.removeItem(EXPIRED_FLAG);
  const session: Session = { role, createdAt: Date.now(), lastSeen: Date.now() };
  const target = remember ? window.localStorage : window.sessionStorage;
  target.setItem(SESSION_KEY, JSON.stringify(session));
}

/** Renova o carimbo de atividade para evitar expiração durante o uso. */
export function touchSession() {
  const raw = rawSession();
  if (!raw) return;
  try {
    const session = JSON.parse(raw.value) as Session;
    session.lastSeen = Date.now();
    const target = raw.persistent ? window.localStorage : window.sessionStorage;
    target.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    clearSession();
  }
}

export function clearSession() {
  if (!hasWindow) return;
  window.localStorage.removeItem(SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_KEY);
}

/** Indica se a última sessão caiu por inatividade. Leitura não-destrutiva (segura
 *  sob StrictMode); o flag é limpo automaticamente no próximo startSession. */
export function wasSessionExpired(): boolean {
  return hasWindow && window.sessionStorage.getItem(EXPIRED_FLAG) === "1";
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
