import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Wand2, Plus, RefreshCw, Check, Salad, Send,
  Coffee, Apple, UtensilsCrossed, Moon, MousePointerClick, SlidersHorizontal,
  BrainCircuit, Target, ShieldCheck, Scale3D, AlertTriangle,
} from "lucide-react";
import { Card, Button, Field, Input, Chip, Skeleton, Avatar } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { REFEICOES_PADRAO, HORARIOS_PADRAO } from "../lib/mock";
import { initials } from "../lib/utils";
import { generateMealPlanWithOpenAI, type GeneratedMealPlan } from "../lib/openaiMeals";
import type { Patient, PatientPlan } from "../lib/types";
import { listPatients, savePlan } from "../lib/db";
import { getUserId } from "../lib/auth";

type State = "idle" | "loading" | "done" | "error";

const RESTRICOES = [
  "Sem lactose",
  "Vegetariano",
  "Sem gluten",
  "Low carb",
  "Sem frutos do mar",
  "Rico em ferro",
  "Pratico para trabalho",
  "Baixo enjoo",
  "Mais fibras",
  "Diabetes",
  "Hipertensao",
];

const MEAL_ICONS: Record<string, typeof Coffee> = {
  "Cafe da manha": Coffee,
  "Café da manhã": Coffee,
  "Lanche da manha": Apple,
  "Lanche da manhã": Apple,
  Almoco: UtensilsCrossed,
  "Almoço": UtensilsCrossed,
  "Lanche da tarde": Apple,
  Jantar: Moon,
  Ceia: Moon,
};

const emptyPlan: GeneratedMealPlan = {
  meals: [],
  totals: { kcal: 0, prot: 0, carb: 0, gord: 0 },
  target: { kcal: 0, prot: 0, carb: 0, gord: 0 },
  score: 0,
  strategy: [],
  substitutions: [],
};

const iconFor = (nome: string) => MEAL_ICONS[nome] ?? Salad;
const mealSlots = (count: number) => REFEICOES_PADRAO.slice(0, Math.min(Math.max(count || 5, 1), 6));

const EMPTY_PATIENT: Patient = { id: "", nome: "", idade: 0, sexo: "Feminino", objetivo: "Clínico", status: "ativo", tags: [], ultimaConsulta: "—", proximaAcao: "—", adesao: 0, cor: ["#9DB99F", "#6E8C72"] };

export default function Creator() {
  const toast = useToast();
  const [state, setState] = useState<State>("idle");
  const [patients, setPatients] = useState<Patient[]>([]);
  const [paciente, setPaciente] = useState("");
  const [kcal, setKcal] = useState("2350");
  const [refeicoes, setRefeicoes] = useState("5");
  const [restr, setRestr] = useState<string[]>(["Sem lactose", "Rico em ferro", "Baixo enjoo"]);
  const [focus, setFocus] = useState("gestante, praticidade, ferro, refeicoes leves a noite");
  const [added, setAdded] = useState<number[]>([]);
  const [plan, setPlan] = useState<GeneratedMealPlan>(emptyPlan);
  const [error, setError] = useState("");

  useEffect(() => {
    listPatients().then((items) => {
      setPatients(items);
      if (items[0]) setPaciente((prev) => prev || items[0].id);
    }).catch(() => toast("Erro ao carregar pacientes"));
  }, []);

  const pacienteAtual = patients.find((p) => p.id === paciente) ?? patients[0] ?? EMPTY_PATIENT;
  const toggleRestr = (r: string) => setRestr(restr.includes(r) ? restr.filter((x) => x !== r) : [...restr, r]);

  const gerar = async () => {
    setState("loading");
    setAdded([]);
    setError("");

    try {
      const generated = await generateMealPlanWithOpenAI({
        patient: pacienteAtual,
        kcal: Number(kcal) || 2000,
        refeicoes: Math.min(Math.max(Number(refeicoes) || 5, 1), 6),
        restricoes: restr,
        preferencias: focus,
      });
      setPlan(generated);
      setState("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao chamar a API da OpenAI.");
      setState("error");
    }
  };

  const publishPlan = async () => {
    const planToPublish: PatientPlan = {
      pacienteId: paciente,
      titulo: "Plano gerado com OpenAI GPT-4o",
      periodo: "Atualizado hoje",
      kcal: Number(kcal) || plan.totals.kcal,
      aguaMl: pacienteAtual.gestante ? 2600 : 2200,
      proteinaG: plan.totals.prot,
      refeicoes: plan.meals.map((m) => ({
        nome: m.refeicao,
        horario: HORARIOS_PADRAO[m.refeicao] ?? "21:30",
        itens: m.itens.map((nome) => ({ nome })),
        observacao: `${m.kcal} kcal · P ${m.prot}g · C ${m.carb}g · G ${m.gord}g. ${m.rationale}`,
      })),
      substituicoes: plan.substitutions,
    };

    const userId = getUserId();
    if (!userId) return;
    try {
      await savePlan(planToPublish, userId);
      toast(`Cardapio publicado no plano de ${pacienteAtual.nome.split(" ")[0]}`);
    } catch {
      toast("Erro ao publicar cardapio");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="brand-mark" style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(145deg, var(--sage), var(--blue))", boxShadow: "0 8px 20px -9px rgb(var(--c-blue) / .55)" }}><Sparkles size={16} /></div>
            <div className="h1">Novra Creator</div>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>IA conectada a OpenAI GPT-4o para gerar refeicoes, macros, alertas e substituicoes em JSON estruturado</div>
        </div>
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "340px 1fr", alignItems: "start" }}>
        <Card pad className="creator-panel" style={{ position: "sticky", top: 74 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><SlidersHorizontal size={13} color="var(--sage)" /></div>
            <span className="eyebrow" style={{ fontSize: 11.5 }}>Perfil da geracao</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Paciente">
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 7, top: 7, zIndex: 1 }}><Avatar initials={initials(pacienteAtual.nome)} size={22} gradient={pacienteAtual.cor} /></div>
                <select className="select" style={{ paddingLeft: 40 }} value={paciente} onChange={(e) => setPaciente(e.target.value)}>
                  {patients.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
            </Field>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Meta diaria">
                <div style={{ position: "relative" }}>
                  <Input className="num" value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" style={{ paddingRight: 38 }} />
                  <span className="faint num" style={{ position: "absolute", right: 12, top: 11, fontSize: 11.5, pointerEvents: "none" }}>kcal</span>
                </div>
              </Field>
              <Field label="Refeicoes"><Input className="num" value={refeicoes} onChange={(e) => setRefeicoes(e.target.value)} inputMode="numeric" /></Field>
            </div>

            <Field label="Preferencias para o GPT-4o">
              <Input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="ex.: sem peixe, marmita, pos-treino, pouco tempo" />
            </Field>

            <div style={{ borderTop: "1px solid var(--border)" }} />

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 9 }}>Restricoes e preferencias</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {RESTRICOES.map((r) => (
                  <span key={r} className="chip" style={{ cursor: "pointer", height: 28, background: restr.includes(r) ? "var(--sage-soft)" : "var(--surface2)", color: restr.includes(r) ? "var(--sage-strong)" : "var(--muted)", borderColor: restr.includes(r) ? "transparent" : "var(--border)" }} onClick={() => toggleRestr(r)}>
                    {restr.includes(r) && <Check size={11} />}{r}
                  </span>
                ))}
              </div>
            </div>

            <Button variant="primary" onClick={gerar} disabled={state === "loading"}>
              {state === "loading" ? <><RefreshCw size={15} className="spin" />Chamando GPT-4o...</> : <><Wand2 size={15} />Gerar com GPT-4o</>}
            </Button>
            {state === "done" && <Button variant="ghost" onClick={gerar}><RefreshCw size={14} />Gerar nova resposta</Button>}
          </div>
        </Card>

        <div>
          {state === "idle" && (
            <div>
              <div className="creator-props">
                <span className="creator-prop"><BrainCircuit size={13} />OpenAI GPT-4o</span>
                <span className="creator-prop"><Target size={13} />Saida estruturada</span>
                <span className="creator-prop"><ShieldCheck size={13} />Chave no servidor</span>
                <span className="creator-prop"><MousePointerClick size={13} />Publica com 1 clique</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {mealSlots(Number(refeicoes) || 5).map((nome) => {
                  const Icon = iconFor(nome);
                  return (
                    <div className="creator-ghost" key={nome}>
                      <div className="creator-ghost-ic"><Icon size={17} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="creator-ghost-title">{nome}</div>
                        <div className="creator-ghost-sub">Aguardando resposta da API da OpenAI</div>
                      </div>
                      <div className="creator-ghost-pill" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {state === "loading" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Skeleton h={64} r={14} />
              {[0, 1, 2].map((i) => (
                <Card key={i} pad>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}><Skeleton w={140} h={16} /><Skeleton w={70} h={16} /></div>
                  <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>{[0, 1, 2].map((j) => <Skeleton key={j} w={72} h={22} r={20} />)}</div>
                  <Skeleton h={12} style={{ marginBottom: 8 }} /><Skeleton h={12} w="80%" style={{ marginBottom: 8 }} /><Skeleton h={12} w="60%" />
                </Card>
              ))}
            </div>
          )}

          {state === "error" && (
            <Card pad>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <AlertTriangle size={18} color="var(--terra)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div className="h3" style={{ fontSize: 14 }}>Nao consegui chamar a OpenAI</div>
                  <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>{error}</div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 10 }}>Rode `npm run ai:server` com `OPENAI_API_KEY` configurada e deixe o Vite em outro terminal.</div>
                </div>
              </div>
            </Card>
          )}

          {state === "done" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="banner ok">
                <Sparkles size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>GPT-4o gerou: <b className="num">{plan.totals.kcal} kcal</b> · <b className="num">{plan.totals.prot}g</b> proteina · <b className="num">{plan.totals.carb}g</b> carboidrato · <b className="num">{plan.totals.gord}g</b> gordura. Score <b className="num">{plan.score}%</b>.</span>
              </div>

              <Card pad>
                <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 10 }}>
                  <BrainCircuit size={16} color="var(--sage)" />
                  <div className="h3" style={{ fontSize: 14 }}>Como o GPT-4o decidiu</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 9 }}>
                  {plan.strategy.map((item) => (
                    <div key={item} className="muted" style={{ fontSize: 12.5, padding: "9px 10px", border: "1px solid var(--border)", borderRadius: 10, background: "var(--surface2)" }}>{item}</div>
                  ))}
                </div>
              </Card>

              {plan.meals.map((m, i) => {
                const kcalP = m.prot * 4, kcalC = m.carb * 4, kcalG = m.gord * 9, tot = Math.max(kcalP + kcalC + kcalG, 1);
                const isAdded = added.includes(i);
                const MealIcon = iconFor(m.refeicao);
                return (
                  <Card key={`${m.refeicao}-${i}`} pad>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 10, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><MealIcon size={15} color="var(--sage)" /></div>
                        <div><div className="h3" style={{ fontSize: 14 }}>{m.refeicao}</div><div className="num faint" style={{ fontSize: 12, marginTop: 2 }}>{m.kcal} kcal</div></div>
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
                        <Chip tone="sage">P {m.prot}g</Chip><Chip tone="blue">C {m.carb}g</Chip><Chip tone="terra">G {m.gord}g</Chip>
                      </div>
                    </div>
                    <div className="bar" style={{ display: "flex", height: 7, marginBottom: 14, background: "transparent" }}>
                      <i style={{ width: `${(kcalP / tot) * 100}%`, background: "var(--sage)", borderRadius: 0 }} />
                      <i style={{ width: `${(kcalC / tot) * 100}%`, background: "var(--blue)", borderRadius: 0 }} />
                      <i style={{ width: `${(kcalG / tot) * 100}%`, background: "var(--terra)", borderRadius: 0 }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
                      {m.itens.map((it, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
                          <Salad size={14} className="faint" style={{ flexShrink: 0 }} /><span>{it}</span>
                        </div>
                      ))}
                    </div>
                    <div className="muted" style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12.5, marginBottom: 10 }}>
                      <Scale3D size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                      <span>{m.rationale}</span>
                    </div>
                    {m.alertas.length > 0 && (
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                        {m.alertas.map((alerta) => <Chip key={alerta} tone="amber">{alerta}</Chip>)}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <div className="faint" style={{ fontSize: 11.5 }}>Trocas: {m.substituicoes.slice(0, 3).join(" · ")}</div>
                      <Button variant={isAdded ? "subtle" : "ghost"} sm disabled={isAdded} onClick={() => { setAdded([...added, i]); toast(`${m.refeicao} adicionada ao plano`); }}>
                        {isAdded ? <><Check size={13} />No plano</> : <><Plus size={13} />Adicionar ao plano</>}
                      </Button>
                    </div>
                  </Card>
                );
              })}
              <Button variant="primary" onClick={publishPlan}><Send size={15} />Enviar cardapio ao plano alimentar</Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
