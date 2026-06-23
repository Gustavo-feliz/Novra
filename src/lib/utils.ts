import { clearSession, lockPortal } from "./auth";

export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const num = (n: number) => n.toLocaleString("pt-BR");

// IDs únicos para registros locais. Usa crypto.randomUUID quando disponível
// (evita colisões de Math.random em volumes maiores); cai para um fallback.
export const uid = () => {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch { /* ignore */ }
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
};

/** Validação simples de e-mail para feedback de formulário (não é RFC completa). */
export const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Limite padrão para campos de texto livre enviados pelo usuário. */
export const MAX_TEXT = 2000;

/** Higieniza texto livre do usuário: remove caracteres de controle invisíveis
 *  (mantendo tab/quebra de linha) e corta no tamanho máximo. O React já escapa
 *  HTML ao renderizar, então isto foca em integridade dos dados e em evitar
 *  payloads abusivos no storage. */
export const sanitizeText = (input: string, max: number = MAX_TEXT) => {
  let out = "";
  for (const ch of input) {
    const code = ch.charCodeAt(0);
    if (code === 127) continue;                        // DEL
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) continue; // controles, exceto tab/LF/CR
    out += ch;
  }
  return out.slice(0, max);
};

export const pct = (a: number, b: number) => +(((b - a) / a) * 100).toFixed(1);
export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export function calcularIdade(dataNascimento: string): number {
  const nascimento = new Date(dataNascimento);
  if (Number.isNaN(nascimento.getTime())) return 0;
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario = hoje.getMonth() < nascimento.getMonth()
    || (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;
  return Math.max(0, idade);
}

export function logout(nav: (path: string) => void) {
  clearSession();
  lockPortal();
  nav("/login");
}

export function timeAgo(ts: number): string {
  const min = Math.floor(Math.max(0, Date.now() - ts) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h}h`;
  return `há ${Math.floor(h / 24)}d`;
}
