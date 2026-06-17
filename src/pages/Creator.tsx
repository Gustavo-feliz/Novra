import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Wand2, Plus, RefreshCw, Check, Salad, Send } from "lucide-react";
import { Card, Button, Field, Input, Chip, Skeleton } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { CREATOR_SUGGESTIONS, PATIENTS } from "../lib/mock";
import { LOCAL_KEYS, writeLocal } from "../lib/localData";
import type { PatientPlan } from "../lib/types";

type State = "idle" | "loading" | "done";
const RESTRICOES = ["Sem lactose", "Vegetariano", "Sem glúten", "Low carb", "Sem frutos do mar", "Rico em ferro"];

export default function Creator() {
  const toast = useToast();
  const [state, setState] = useState<State>("idle");
  const [paciente, setPaciente] = useState(PATIENTS[0].id);
  const [kcal, setKcal] = useState("2350");
  const [refeicoes, setRefeicoes] = useState("5");
  const [restr, setRestr] = useState<string[]>(["Sem lactose", "Rico em ferro"]);
  const [added, setAdded] = useState<number[]>([]);

  const toggleRestr = (r: string) => setRestr(restr.includes(r) ? restr.filter((x) => x !== r) : [...restr, r]);
  const gerar = () => { setState("loading"); setAdded([]); setTimeout(() => setState("done"), 1500); };

  const sug = CREATOR_SUGGESTIONS;
  const totals = sug.reduce((a, m) => ({ kcal: a.kcal + m.kcal, prot: a.prot + m.prot, carb: a.carb + m.carb, gord: a.gord + m.gord }), { kcal: 0, prot: 0, carb: 0, gord: 0 });
  const publishPlan = () => {
    const plan: PatientPlan = {
      pacienteId: paciente,
      titulo: "Plano gerado pelo NutriFlow Creator",
      periodo: "Atualizado hoje",
      kcal: Number(kcal) || totals.kcal,
      aguaMl: 2600,
      proteinaG: totals.prot,
      refeicoes: sug.map((m, index) => ({
        nome: m.refeicao,
        horario: ["07:30", "10:30", "13:00", "16:30", "20:00"][index] ?? "21:30",
        itens: m.itens,
        observacao: `${m.kcal} kcal · P ${m.prot}g · C ${m.carb}g · G ${m.gord}g`,
      })),
      substituicoes: [
        { grupo: "Proteinas", opcoes: ["Frango", "Peixe", "Ovos", "Patinho", "Tofu"] },
        { grupo: "Carboidratos", opcoes: ["Arroz integral", "Batata-doce", "Mandioca", "Aveia"] },
        { grupo: "Lanches", opcoes: ["Iogurte", "Fruta", "Castanhas", "Pao integral"] },
      ],
    };
    writeLocal(LOCAL_KEYS.portalPlan, plan);
    toast("Cardapio publicado no portal do paciente");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <div className="brand-mark" style={{ width: 30, height: 30, borderRadius: 9, background: "linear-gradient(145deg, var(--sage), var(--blue))" }}><Sparkles size={16} /></div>
            <div className="h1">NutriFlow Creator</div>
          </div>
          <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>IA que monta refeições sob medida e define os macros de cada uma automaticamente</div>
        </div>
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "340px 1fr", alignItems: "start" }}>
        {/* ----- Config panel ----- */}
        <Card glass pad style={{ position: "sticky", top: 74 }}>
          <span className="eyebrow">Perfil da geração</span>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
            <Field label="Paciente">
              <select className="select" value={paciente} onChange={(e) => setPaciente(e.target.value)}>
                {PATIENTS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Meta diária (kcal)"><Input className="num" value={kcal} onChange={(e) => setKcal(e.target.value)} inputMode="numeric" /></Field>
              <Field label="Refeições"><Input className="num" value={refeicoes} onChange={(e) => setRefeicoes(e.target.value)} inputMode="numeric" /></Field>
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Restrições e preferências</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {RESTRICOES.map((r) => (
                  <span key={r} className="chip" style={{ cursor: "pointer", height: 28, background: restr.includes(r) ? "var(--sage-soft)" : "var(--surface2)", color: restr.includes(r) ? "var(--sage-strong)" : "var(--muted)", borderColor: restr.includes(r) ? "transparent" : "var(--border)" }} onClick={() => toggleRestr(r)}>
                    {restr.includes(r) && <Check size={11} />}{r}
                  </span>
                ))}
              </div>
            </div>
            <Button variant="primary" onClick={gerar} disabled={state === "loading"}>
              {state === "loading" ? <><RefreshCw size={15} className="spin" />Gerando…</> : <><Wand2 size={15} />Gerar refeições</>}
            </Button>
            {state === "done" && <Button variant="ghost" onClick={gerar}><RefreshCw size={14} />Gerar novamente</Button>}
          </div>
        </Card>

        {/* ----- Output ----- */}
        <div>
          {state === "idle" && (
            <Card pad style={{ textAlign: "center", padding: "60px 24px" }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, background: "linear-gradient(145deg, var(--sage-soft), rgb(var(--c-blue) / .12))", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Sparkles size={30} color="var(--sage)" /></div>
              <div className="h2">Pronto para criar</div>
              <div className="muted" style={{ fontSize: 13.5, marginTop: 6, maxWidth: 380, marginInline: "auto" }}>Ajuste o perfil ao lado e a IA monta um cardápio completo, equilibrando os macros refeição a refeição.</div>
            </Card>
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

          {state === "done" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .3 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="banner ok">
                <Sparkles size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>Cardápio gerado: <b className="num">{totals.kcal} kcal</b> · <b className="num">{totals.prot}g</b> proteína · <b className="num">{totals.carb}g</b> carboidrato · <b className="num">{totals.gord}g</b> gordura — alinhado à meta de <b className="num">{kcal} kcal</b>.</span>
              </div>
              {sug.map((m, i) => {
                const kcalP = m.prot * 4, kcalC = m.carb * 4, kcalG = m.gord * 9, tot = kcalP + kcalC + kcalG;
                const isAdded = added.includes(i);
                return (
                  <Card key={i} pad>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
                      <div><div className="h3" style={{ fontSize: 14 }}>{m.refeicao}</div><div className="num faint" style={{ fontSize: 12, marginTop: 2 }}>{m.kcal} kcal</div></div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Chip tone="sage">P {m.prot}g</Chip><Chip tone="blue">C {m.carb}g</Chip><Chip tone="terra">G {m.gord}g</Chip>
                      </div>
                    </div>
                    <div className="bar" style={{ display: "flex", height: 7, marginBottom: 14, background: "transparent" }}>
                      <i style={{ width: `${(kcalP / tot) * 100}%`, background: "var(--sage)", borderRadius: 0 }} />
                      <i style={{ width: `${(kcalC / tot) * 100}%`, background: "var(--blue)", borderRadius: 0 }} />
                      <i style={{ width: `${(kcalG / tot) * 100}%`, background: "var(--terra)", borderRadius: 0 }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 14 }}>
                      {m.itens.map((it, j) => (
                        <div key={j} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13.5 }}>
                          <Salad size={14} className="faint" style={{ flexShrink: 0 }} /><span>{it}</span>
                        </div>
                      ))}
                    </div>
                    <Button variant={isAdded ? "subtle" : "ghost"} sm disabled={isAdded} onClick={() => { setAdded([...added, i]); toast(`${m.refeicao} adicionada ao plano`); }}>
                      {isAdded ? <><Check size={13} />No plano</> : <><Plus size={13} />Adicionar ao plano</>}
                    </Button>
                  </Card>
                );
              })}
              <Button variant="primary" onClick={publishPlan}><Send size={15} />Enviar cardápio ao plano alimentar</Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
