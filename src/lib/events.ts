import { Bell, Calendar, Camera, Flame, ListChecks, MessageCircle, UserPlus, Wallet } from "lucide-react";
import { LOCAL_KEYS, usePersistentState } from "./localData";
import { uid } from "./utils";

export type EventType = "diario" | "questionario" | "agenda" | "financeiro" | "meta" | "mensagem" | "paciente";
export type Audience = "clinica" | "paciente" | "ambos";

export interface AppEvent {
  id: string;
  tipo: EventType;
  titulo: string;
  detalhe?: string;
  ts: number;
  audiencia: Audience;
  patientId?: string;
  clinicLink?: string;
  portalLink?: string;
  lido: boolean;
}

export const EVENT_META: Record<EventType, { icon: typeof Bell; color: string }> = {
  diario: { icon: Camera, color: "var(--sage)" },
  questionario: { icon: ListChecks, color: "var(--blue)" },
  agenda: { icon: Calendar, color: "var(--amber)" },
  financeiro: { icon: Wallet, color: "var(--terra)" },
  meta: { icon: Flame, color: "var(--terra)" },
  mensagem: { icon: MessageCircle, color: "var(--blue)" },
  paciente: { icon: UserPlus, color: "var(--sage)" },
};

export function pushEvent(e: Omit<AppEvent, "id" | "ts" | "lido">) {
  if (typeof window === "undefined") return;
  const raw = window.localStorage.getItem(LOCAL_KEYS.events);
  const events: AppEvent[] = raw ? JSON.parse(raw) : [];
  const novo: AppEvent = { ...e, id: uid(), ts: Date.now(), lido: false };
  window.localStorage.setItem(LOCAL_KEYS.events, JSON.stringify([novo, ...events].slice(0, 200)));
  window.dispatchEvent(new CustomEvent("nutriflow:localdata", { detail: { key: LOCAL_KEYS.events } }));
}

export function useEvents(audience: Audience, patientId?: string) {
  const [events, setEvents] = usePersistentState<AppEvent[]>(LOCAL_KEYS.events, []);
  const visible = events.filter((e) =>
    (e.audiencia === audience || e.audiencia === "ambos") && (!patientId || !e.patientId || e.patientId === patientId)
  );
  const unread = visible.filter((e) => !e.lido).length;

  const markRead = (id: string) => setEvents(events.map((e) => (e.id === id ? { ...e, lido: true } : e)));
  const markAllRead = () => {
    const ids = new Set(visible.map((e) => e.id));
    setEvents(events.map((e) => (ids.has(e.id) ? { ...e, lido: true } : e)));
  };

  return { events: visible, unread, markRead, markAllRead };
}
