// Motor de inteligência nutricional — 100% local, determinístico, sem API.
//
// Reúne as fórmulas clínicas clássicas (Mifflin-St Jeor, GET, distribuição de
// macros) e heurísticas de análise para gerar planos e "insights" sobre o
// paciente. Tudo roda no navegador a partir dos dados que o app já tem; nenhum
// dado de saúde sai do dispositivo.

export type Sexo = "Feminino" | "Masculino";
export type Objetivo = "Emagrecimento" | "Hipertrofia" | "Gestacional" | "Esportivo" | "Clínico" | "Infantil";
export type ActivityLevel = "sedentario" | "leve" | "moderado" | "intenso" | "atleta";

/** Linha de antropometria (a mais recente primeiro). */
export type AnthropRow = { data: string; peso: number; imc: number; gord?: number; cint?: number; quad?: number; rcq?: number };
/** Alimento do banco local: [nome, porção, kcal]. */
export type FoodTuple = [nome: string, porcao: string, kcal: number];
export type Macros = { proteinaG: number; carboG: number; gorduraG: number };
export type Insight = { id: string; nivel: "ok" | "alerta" | "info"; titulo: string; detalhe: string };

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, atleta: 1.9,
};
export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentario: "Sedentário", leve: "Leve (1-3x/sem)", moderado: "Moderado (3-5x/sem)",
  intenso: "Intenso (6-7x/sem)", atleta: "Atleta",
};

/** Ajuste calórico sobre o GET, por objetivo. Gestacional usa acréscimo fixo. */
const KCAL_ADJUST: Record<Objetivo, { fator: number; fixo: number }> = {
  Emagrecimento: { fator: -0.20, fixo: 0 },
  Hipertrofia: { fator: 0.10, fixo: 0 },
  Esportivo: { fator: 0.05, fixo: 0 },
  Gestacional: { fator: 0, fixo: 300 },
  Clínico: { fator: 0, fixo: 0 },
  Infantil: { fator: 0, fixo: 0 },
};

/** Proteína-alvo em g por kg de peso, por objetivo. */
const PROTEIN_PER_KG: Record<Objetivo, number> = {
  Emagrecimento: 1.8, Hipertrofia: 2.0, Esportivo: 1.8, Gestacional: 1.5, Clínico: 1.2, Infantil: 1.3,
};

/** Converte "DD/MM/YYYY" em Date (meia-noite local). */
export function parseDateBR(s: string): Date | null {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(s.trim());
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return Number.isNaN(d.getTime()) ? null : d;
}

/** Deriva a altura (cm) a partir de peso e IMC da medição mais recente:
 *  IMC = peso / altura² → altura = √(peso / IMC). */
export function deriveHeightCm(antrop: AnthropRow[]): number | null {
  const r = antrop[0];
  if (!r || !r.peso || !r.imc) return null;
  const m = Math.sqrt(r.peso / r.imc);
  return Math.round(m * 1000) / 10; // cm com 1 casa
}

/** Taxa metabólica basal (Mifflin-St Jeor). */
export function tmb({ sexo, pesoKg, alturaCm, idade }: { sexo: Sexo; pesoKg: number; alturaCm: number; idade: number }): number {
  const base = 10 * pesoKg + 6.25 * alturaCm - 5 * idade;
  return Math.round(base + (sexo === "Masculino" ? 5 : -161));
}

/** Gasto energético total = TMB × fator de atividade. */
export function get(tmbValue: number, level: ActivityLevel): number {
  return Math.round(tmbValue * ACTIVITY_FACTORS[level]);
}

/** Meta calórica diária ajustada pelo objetivo. */
export function targetKcal(getValue: number, objetivo: Objetivo): number {
  const { fator, fixo } = KCAL_ADJUST[objetivo];
  return Math.max(1000, Math.round(getValue * (1 + fator) + fixo));
}

/** Distribuição de macronutrientes (g) para uma meta calórica. */
export function macros(kcal: number, pesoKg: number, objetivo: Objetivo): Macros {
  const proteinaG = Math.round(PROTEIN_PER_KG[objetivo] * pesoKg);
  const gorduraG = Math.round((kcal * 0.27) / 9);
  const carboG = Math.max(0, Math.round((kcal - proteinaG * 4 - gorduraG * 9) / 4));
  return { proteinaG, carboG, gorduraG };
}

/** Classificação de IMC (OMS). */
export function imcCategory(imc: number): { label: string; nivel: Insight["nivel"] } {
  if (imc < 18.5) return { label: "Abaixo do peso", nivel: "alerta" };
  if (imc < 25) return { label: "Peso adequado", nivel: "ok" };
  if (imc < 30) return { label: "Sobrepeso", nivel: "info" };
  if (imc < 35) return { label: "Obesidade grau I", nivel: "alerta" };
  if (imc < 40) return { label: "Obesidade grau II", nivel: "alerta" };
  return { label: "Obesidade grau III", nivel: "alerta" };
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Estima as kcal de uma refeição casando os itens com o banco de alimentos. */
export function estimateMealKcal(itens: string[], foods: FoodTuple[]): number {
  const idx = foods.map((f) => ({ key: norm(f[0]), kcal: f[2] }));
  let total = 0;
  for (const item of itens) {
    const n = norm(item);
    if (!n) continue;
    const hit = idx.find((f) => n.includes(f.key) || f.key.includes(n));
    if (hit) total += hit.kcal;
  }
  return total;
}

const MEAL_WEIGHTS: Record<string, number> = {
  "Café da manhã": 0.25, "Lanche da manhã": 0.10, "Almoço": 0.30,
  "Lanche da tarde": 0.10, "Jantar": 0.20, "Ceia": 0.05,
};

export type GeneratedPlan = {
  pacienteId: string;
  titulo: string;
  periodo: string;
  kcal: number;
  aguaMl: number;
  proteinaG: number;
  refeicoes: { nome: string; horario: string; itens: { nome: string; porcao?: string; kcal?: number }[]; observacao?: string }[];
  substituicoes: { grupo: string; opcoes: string[] }[];
  resumo: { tmb: number; get: number; alturaCm: number | null; macros: Macros; nivel: ActivityLevel };
};

/** Gera um plano alimentar completo: calcula metas e monta as refeições
 *  escolhendo alimentos do banco até aproximar a meta calórica de cada uma. */
export function generatePlan(input: {
  pacienteId: string;
  sexo: Sexo;
  idade: number;
  objetivo: Objetivo;
  antrop: AnthropRow[];
  foods: FoodTuple[];
  nivel?: ActivityLevel;
  refeicoes: string[];
  horarios: Record<string, string>;
}): GeneratedPlan {
  const { pacienteId, sexo, idade, objetivo, antrop, foods, refeicoes, horarios } = input;
  const nivel = input.nivel ?? "leve";
  const pesoKg = antrop[0]?.peso ?? 70;
  const alturaCm = deriveHeightCm(antrop) ?? 165;
  const tmbValue = tmb({ sexo, pesoKg, alturaCm, idade });
  const getValue = get(tmbValue, nivel);
  const kcal = targetKcal(getValue, objetivo);
  const mac = macros(kcal, pesoKg, objetivo);

  const selecionadas = refeicoes.length ? refeicoes : Object.keys(MEAL_WEIGHTS);
  const somaPesos = selecionadas.reduce((s, n) => s + (MEAL_WEIGHTS[n] ?? 0.15), 0);

  let cursor = 0;
  const refeicoesOut = selecionadas.map((nome) => {
    const alvo = kcal * ((MEAL_WEIGHTS[nome] ?? 0.15) / somaPesos);
    const itens: { nome: string; porcao?: string; kcal?: number }[] = [];
    let acc = 0;
    let guard = 0;
    while (acc < alvo * 0.85 && guard < 6 && foods.length) {
      const f = foods[cursor % foods.length];
      cursor++; guard++;
      itens.push({ nome: f[0], porcao: f[1], kcal: f[2] });
      acc += f[2];
    }
    return { nome, horario: horarios[nome] ?? "—", itens, observacao: `Aprox. ${Math.round(acc)} kcal` };
  });

  // Substituições: agrupa o banco em faixas calóricas como opções equivalentes.
  const baixas = foods.filter((f) => f[2] <= 90).slice(0, 5).map((f) => f[0]);
  const medias = foods.filter((f) => f[2] > 90 && f[2] <= 160).slice(0, 5).map((f) => f[0]);
  const altas = foods.filter((f) => f[2] > 160).slice(0, 5).map((f) => f[0]);
  const substituicoes = [
    { grupo: "Opções leves (até 90 kcal)", opcoes: baixas },
    { grupo: "Opções médias (90-160 kcal)", opcoes: medias },
    { grupo: "Opções reforçadas (160+ kcal)", opcoes: altas },
  ].filter((g) => g.opcoes.length > 0);

  return {
    pacienteId,
    titulo: `Plano ${objetivo.toLowerCase()} gerado por IA`,
    periodo: "Sugestão automática",
    kcal,
    aguaMl: Math.round((35 * pesoKg) / 50) * 50,
    proteinaG: mac.proteinaG,
    refeicoes: refeicoesOut,
    substituicoes,
    resumo: { tmb: tmbValue, get: getValue, alturaCm, macros: mac, nivel },
  };
}

/** Analisa o paciente e devolve insights priorizados (alertas primeiro). */
export function analyzePatient(input: {
  sexo: Sexo;
  idade: number;
  objetivo: Objetivo;
  adesao?: number;
  antrop: AnthropRow[];
  openInvoices?: number;
  pendingQuestionnaires?: number;
}): Insight[] {
  const out: Insight[] = [];
  const { objetivo, adesao, antrop } = input;
  const recente = antrop[0];
  const anterior = antrop[1];

  if (recente) {
    const cat = imcCategory(recente.imc);
    out.push({ id: "imc", nivel: cat.nivel, titulo: `IMC ${recente.imc.toFixed(1)} — ${cat.label}`, detalhe: `Peso atual ${recente.peso.toFixed(1)} kg.` });
  }

  if (recente && anterior) {
    const delta = +(recente.peso - anterior.peso).toFixed(1);
    const sobe = delta > 0;
    const queremPerder = objetivo === "Emagrecimento" || objetivo === "Clínico";
    const queremGanhar = objetivo === "Hipertrofia";
    let nivel: Insight["nivel"] = "info";
    if (delta === 0) nivel = "info";
    else if (queremPerder) nivel = sobe ? "alerta" : "ok";
    else if (queremGanhar) nivel = sobe ? "ok" : "alerta";
    out.push({
      id: "peso",
      nivel,
      titulo: `Peso ${sobe ? "subiu" : delta === 0 ? "estável" : "caiu"} ${Math.abs(delta)} kg`,
      detalhe: `De ${anterior.peso.toFixed(1)} para ${recente.peso.toFixed(1)} kg desde ${anterior.data}.`,
    });
  }

  if (recente && recente.rcq != null) {
    const alto = input.sexo === "Feminino" ? recente.rcq >= 0.85 : recente.rcq >= 0.90;
    if (alto) out.push({ id: "rcq", nivel: "alerta", titulo: `Relação cintura-quadril elevada (${recente.rcq.toFixed(2)})`, detalhe: "Indicador de risco cardiometabólico aumentado." });
  }

  if (typeof adesao === "number") {
    if (adesao < 60) out.push({ id: "adesao", nivel: "alerta", titulo: `Adesão baixa (${adesao}%)`, detalhe: "Considere reforçar o acompanhamento ou simplificar o plano." });
    else if (adesao >= 85) out.push({ id: "adesao", nivel: "ok", titulo: `Ótima adesão (${adesao}%)`, detalhe: "Paciente engajado — bom momento para evoluir as metas." });
  }

  if (input.pendingQuestionnaires && input.pendingQuestionnaires > 0)
    out.push({ id: "quest", nivel: "info", titulo: `${input.pendingQuestionnaires} questionário(s) pendente(s)`, detalhe: "Aguardando resposta do paciente." });

  if (input.openInvoices && input.openInvoices > 0)
    out.push({ id: "fin", nivel: "alerta", titulo: `${input.openInvoices} fatura(s) em aberto`, detalhe: "Há pagamentos pendentes ou atrasados." });

  const ordem: Record<Insight["nivel"], number> = { alerta: 0, info: 1, ok: 2 };
  return out.sort((a, b) => ordem[a.nivel] - ordem[b.nivel]);
}
