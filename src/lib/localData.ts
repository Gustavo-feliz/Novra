import { useEffect, useState } from "react";

export const LOCAL_KEYS = {
  patients: "nutriflow.patients",
  diaries: "nutriflow.diaries",
  portalPlan: "nutriflow.portal.plan",
  portalGoals: "nutriflow.portal.goals",
  portalDiary: "nutriflow.portal.diary",
  portalQuestionnaires: "nutriflow.portal.questionnaires",
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

  useEffect(() => {
    writeLocal(key, value);
  }, [key, value]);

  useEffect(() => {
    const sync = (event: Event) => {
      const custom = event as CustomEvent<{ key?: string }>;
      if (!custom.detail?.key || custom.detail.key === key) setValue(readLocal(key, fallback));
    };
    window.addEventListener("storage", sync);
    window.addEventListener("nutriflow:localdata", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("nutriflow:localdata", sync);
    };
  }, [fallback, key]);

  return [value, setValue] as const;
}
