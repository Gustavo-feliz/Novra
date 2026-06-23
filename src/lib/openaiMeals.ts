import type { Patient, PatientPlan } from "./types";
import { apiFetch } from "./api";

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
  return apiFetch<GeneratedMealPlan>("/api/generate-meal-plan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
