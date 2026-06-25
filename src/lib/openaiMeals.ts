import type { Patient, PatientPlan } from "./types";
import { supabase } from "./supabaseClient";

export type MacroTotals = { kcal: number; prot: number; carb: number; gord: number };

export type MealSuggestion = {
  refeicao: string;
  kcal: number;
  prot: number;
  carb: number;
  gord: number;
  itens: string[];
  rationale: string;
  alertas: string[];
  substituicoes: string[];
};

export type GeneratedMealPlan = {
  meals: MealSuggestion[];
  totals: MacroTotals;
  target: MacroTotals;
  score: number;
  strategy: string[];
  substitutions: PatientPlan["substituicoes"];
};

export type MealGenerationRequest = {
  patient: Patient;
  kcal: number;
  refeicoes: number;
  restricoes: string[];
  preferencias: string;
};

export async function generateMealPlanWithOpenAI(input: MealGenerationRequest): Promise<GeneratedMealPlan> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sessão expirada. Faça login novamente.");

  const response = await fetch("/api/generate-meal-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error || "Erro ao chamar a API da OpenAI.");
  return payload as GeneratedMealPlan;
}
