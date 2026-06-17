export const cx = (...a: (string | false | null | undefined)[]) => a.filter(Boolean).join(" ");
export const brl = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const num = (n: number) => n.toLocaleString("pt-BR");
export const uid = () => Math.random().toString(36).slice(2, 9);
export const pct = (a: number, b: number) => +(((b - a) / a) * 100).toFixed(1);
export const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

export function logout(nav: (path: string) => void) {
  try { localStorage.removeItem("nutriflow_demo_role"); } catch { /* ignore */ }
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
