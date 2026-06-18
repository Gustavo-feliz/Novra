import { useCallback, useEffect, useRef, useState } from "react";

export const LOCAL_KEYS = {
  patients: "nutriflow.patients",
  diaries: "nutriflow.diaries",
  planosAlimentares: "nutriflow.planos.alimentares",
  portalGoals: "nutriflow.portal.goals",
  portalDiary: "nutriflow.portal.diary",
  questionariosPaciente: "nutriflow.questionarios.paciente",
  portalFinance: "nutriflow.portal.finance",
  appointmentRequests: "nutriflow.appointment.requests",
  appointments: "nutriflow.appointments",
  financeTx: "nutriflow.finance.tx",
  whatsAutomations: "nutriflow.whats.automations",
  whatsQueue: "nutriflow.whats.queue",
  anthropometry: "nutriflow.anthropometry",
  events: "nutriflow.events",
  streaks: "nutriflow.streaks",
  achievements: "nutriflow.achievements",
  hidratacao: "nutriflow.hidratacao",
  slides: "nutriflow.slides",
  foods: "nutriflow.foods",
  manipulados: "nutriflow.manipulados",
};

export type AppointmentRequest = {
  id: string;
  patientId: string;
  paciente: string;
  servico: string;
  data: string;
  hora: string;
  modo: "Online" | "Presencial";
  status: "solicitado" | "confirmado" | "recusado";
};

export type WhatsQueueItem = {
  id: string;
  automacao: string;
  paciente: string;
  canal: "WhatsApp" | "E-mail";
  quando: string;
  status: "agendado" | "enviado" | "erro";
};

export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("nutriflow:localdata", { detail: { key } }));
}

export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readLocal(key, fallback));
  const valueRef = useRef(value);
  valueRef.current = value;
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;

  // Sincroniza com mudanças feitas por OUTRO componente/aba — só atualiza o
  // estado local, nunca regrava no storage. Regravar aqui é o que causava o
  // loop infinito (grava → dispara evento → todo consumidor relê com uma
  // referência nova do JSON.parse → "muda" de novo → regrava → ...), que por
  // sua vez sobrescrevia dados recém-criados (ex.: paciente novo) de volta
  // para o valor antigo.
  useEffect(() => {
    const sync = (event: Event) => {
      const custom = event as CustomEvent<{ key?: string }>;
      if (!custom.detail?.key || custom.detail.key === key) setValue(readLocal(key, fallbackRef.current));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("nutriflow:localdata", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("nutriflow:localdata", sync);
    };
  }, [key]);

  // Grava de forma síncrona, no próprio call stack de quem chamou o setter —
  // não dentro de um callback de useState/useEffect. Se isso ficar pendente
  // para o React processar depois, uma navegação imediata (nav() logo após
  // o setter) desmonta o componente antes da gravação acontecer.
  const setPersistent = useCallback((next: T | ((prev: T) => T)) => {
    const resolved = typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
    writeLocal(key, resolved);
    valueRef.current = resolved;
    setValue(resolved);
  }, [key]);

  return [value, setPersistent] as const;
}
