// Previsão de evolução de peso treinada no navegador.
//
// Treina uma regressão linear de verdade por descida de gradiente com
// TensorFlow.js (carregado sob demanda para não pesar o bundle inicial). Se o
// histórico for muito curto ou o tf falhar ao carregar, cai num ajuste de
// mínimos quadrados — assim a interface nunca quebra.
//
// LIMITAÇÃO honesta: com poucos pontos (dados de demonstração) a previsão é
// apenas uma extrapolação de tendência. O valor real aparece com histórico
// longo e regular de cada paciente.

import { parseDateBR, type AnthropRow } from "./nutrition";

export type WeightPoint = { dia: number; peso: number; data: string };
export type Forecast = {
  serie: WeightPoint[];
  previsao: { dia: number; peso: number; data: string }[];
  tendenciaKgSemana: number;
  r2: number;
  metodo: "tensorflow" | "minimos-quadrados";
  epochs: number;
};

/** Converte as medições (mais recente primeiro) numa série cronológica, com o
 *  eixo X em dias decorridos desde a primeira medição. */
export function buildSeries(antrop: AnthropRow[]): WeightPoint[] {
  const pts = antrop
    .map((r) => ({ date: parseDateBR(r.data), peso: r.peso, data: r.data }))
    .filter((p): p is { date: Date; peso: number; data: string } => p.date != null && Number.isFinite(p.peso))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
  if (!pts.length) return [];
  const base = pts[0].date.getTime();
  const DIA = 86400000;
  return pts.map((p) => ({ dia: Math.round((p.date.getTime() - base) / DIA), peso: p.peso, data: p.data }));
}

/** Regressão linear fechada (mínimos quadrados). Fallback determinístico. */
export function linearLeastSquares(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length;
  if (n === 0) return { slope: 0, intercept: 0 };
  if (n === 1) return { slope: 0, intercept: ys[0] };
  const mx = xs.reduce((s, x) => s + x, 0) / n;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let num = 0, den = 0;
  for (let i = 0; i < n; i++) { num += (xs[i] - mx) * (ys[i] - my); den += (xs[i] - mx) ** 2; }
  const slope = den === 0 ? 0 : num / den;
  return { slope, intercept: my - slope * mx };
}

/** Coeficiente de determinação R² entre valores reais e previstos. */
export function rSquared(ys: number[], preds: number[]): number {
  const n = ys.length;
  if (n < 2) return 0;
  const my = ys.reduce((s, y) => s + y, 0) / n;
  let ssRes = 0, ssTot = 0;
  for (let i = 0; i < n; i++) { ssRes += (ys[i] - preds[i]) ** 2; ssTot += (ys[i] - my) ** 2; }
  if (ssTot === 0) return 1;
  return Math.max(0, Math.min(1, 1 - ssRes / ssTot));
}

function forecastFromLine(serie: WeightPoint[], slope: number, intercept: number, horizonteDias: number, metodo: Forecast["metodo"], epochs: number): Forecast {
  const xs = serie.map((p) => p.dia);
  const ys = serie.map((p) => p.peso);
  const preds = xs.map((x) => slope * x + intercept);
  const r2 = rSquared(ys, preds);
  const ultimoDia = xs[xs.length - 1] ?? 0;
  const baseDate = parseDateBR(serie[0]?.data ?? "") ?? new Date();
  const previsao = [7, horizonteDias].map((d) => {
    const dia = ultimoDia + d;
    const date = new Date(baseDate.getTime() + dia * 86400000);
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    return { dia, peso: Math.round((slope * dia + intercept) * 10) / 10, data: `${dd}/${mm}/${date.getFullYear()}` };
  });
  return { serie, previsao, tendenciaKgSemana: Math.round(slope * 7 * 100) / 100, r2: Math.round(r2 * 100) / 100, metodo, epochs };
}

/** Treina o modelo e devolve a previsão. Usa TensorFlow.js quando há dados
 *  suficientes; caso contrário (ou em erro) usa mínimos quadrados. */
export async function trainWeightForecast(
  antrop: AnthropRow[],
  opts: { epochs?: number; horizonteDias?: number } = {},
): Promise<Forecast> {
  const epochs = opts.epochs ?? 200;
  const horizonteDias = opts.horizonteDias ?? 14;
  const serie = buildSeries(antrop);
  const xs = serie.map((p) => p.dia);
  const ys = serie.map((p) => p.peso);

  // Poucos pontos: não vale treinar, usa solução fechada.
  if (serie.length < 3) {
    const { slope, intercept } = linearLeastSquares(xs, ys);
    return forecastFromLine(serie, slope, intercept, horizonteDias, "minimos-quadrados", 0);
  }

  try {
    const tf = await import("@tensorflow/tfjs");
    // Normaliza (z-score) para o gradiente convergir bem.
    const mx = xs.reduce((s, x) => s + x, 0) / xs.length;
    const sx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0) / xs.length) || 1;
    const my = ys.reduce((s, y) => s + y, 0) / ys.length;
    const sy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0) / ys.length) || 1;

    const xt = tf.tensor2d(xs.map((x) => [(x - mx) / sx]));
    const yt = tf.tensor2d(ys.map((y) => [(y - my) / sy]));

    const model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));
    model.compile({ optimizer: tf.train.adam(0.1), loss: "meanSquaredError" });
    await model.fit(xt, yt, { epochs, verbose: 0 });

    // Recupera coeficientes na escala original: y = my + sy*(w*((x-mx)/sx)+b).
    const w = (model.getWeights()[0].dataSync() as Float32Array)[0];
    const b = (model.getWeights()[1].dataSync() as Float32Array)[0];
    const slope = (w * sy) / sx;
    const intercept = my + sy * b - slope * mx;

    xt.dispose(); yt.dispose(); model.dispose();
    return forecastFromLine(serie, slope, intercept, horizonteDias, "tensorflow", epochs);
  } catch {
    const { slope, intercept } = linearLeastSquares(xs, ys);
    return forecastFromLine(serie, slope, intercept, horizonteDias, "minimos-quadrados", 0);
  }
}
