import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, ListChecks, Send, Copy, Pencil, FileText, X, GripVertical, Trash2 } from "lucide-react";
import { Card, Button, Chip, Input, Field, Modal } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { Q_CATEGORIES } from "../lib/mock";
import type { QuestionnaireTemplate } from "../lib/types";
import { cx, num } from "../lib/utils";
import { listQuestionnaires, createQuestionnaire } from "../lib/db";
import { getUserId } from "../lib/auth";

const TIPOS = ["Texto curto", "Texto longo", "Múltipla escolha", "Escala 0–10", "Sim / Não", "Número"];

export default function Questionnaires() {
  const toast = useToast();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todas");
  const [list, setList] = useState<QuestionnaireTemplate[]>([]);
  const [builder, setBuilder] = useState(false);
  const [name, setName] = useState("");
  const [perguntas, setPerguntas] = useState([{ t: "", tipo: "Texto curto" }]);

  const filtered = useMemo(() => list.filter((x) =>
    (cat === "Todas" || x.categoria === cat) && x.nome.toLowerCase().includes(q.toLowerCase())
  ), [list, q, cat]);

  const totalRespostas = list.reduce((a, x) => a + x.respostas, 0);

  useEffect(() => { listQuestionnaires().then(setList).catch(() => toast("Erro ao carregar questionários")); }, []);

  const criarQuestionario = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const saved = await createQuestionnaire({
        nome: name,
        categoria: "Consumo",
        perguntas: perguntas.filter((p) => p.t.trim()).length || 1,
        respostas: 0,
        atualizado: "Hoje",
        cor: "var(--sage)",
      }, userId);
      setList([saved, ...list]);
      toast("Questionário criado");
    } catch {
      toast("Erro ao criar questionário");
    }
    setBuilder(false);
  };

  const duplicar = async (t: QuestionnaireTemplate) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const saved = await createQuestionnaire({ nome: t.nome + " (cópia)", categoria: t.categoria, perguntas: t.perguntas, respostas: 0, atualizado: "Hoje", cor: t.cor }, userId);
      setList([saved, ...list]);
      toast("Questionário duplicado");
    } catch {
      toast("Erro ao duplicar questionário");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Questionários</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{list.length} modelos reutilizáveis · <span className="num">{num(totalRespostas)}</span> respostas recebidas</div>
        </div>
        <Button variant="primary" onClick={() => { setBuilder(true); setName(""); setPerguntas([{ t: "", tipo: "Texto curto" }]); }}><Plus size={15} />Novo questionário</Button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} className="faint" style={{ position: "absolute", left: 12, top: 11 }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar questionário…" style={{ paddingLeft: 36 }} />
        </div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
          {Q_CATEGORIES.map((c) => (
            <span key={c} className={cx("chip", cat === c && "sage")} style={{ cursor: "pointer", height: 30 }} onClick={() => setCat(c)}>{c}</span>
          ))}
        </div>
      </div>

      <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {filtered.map((t) => (
          <Card key={t.id} pad style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><ListChecks size={19} color={t.cor} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h3" style={{ lineHeight: 1.3 }}>{t.nome}</div>
                <Chip style={{ marginTop: 6 }}>{t.categoria}</Chip>
              </div>
            </div>
            <div style={{ display: "flex", gap: 16, padding: "10px 0", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
              <div><div className="faint" style={{ fontSize: 10.5 }}>Perguntas</div><div className="num" style={{ fontWeight: 600, fontSize: 15 }}>{t.perguntas}</div></div>
              <div><div className="faint" style={{ fontSize: 10.5 }}>Respostas</div><div className="num" style={{ fontWeight: 600, fontSize: 15 }}>{t.respostas}</div></div>
              <div><div className="faint" style={{ fontSize: 10.5 }}>Atualizado</div><div className="num" style={{ fontWeight: 600, fontSize: 12.5, marginTop: 2 }}>{t.atualizado}</div></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Button variant="primary" sm style={{ flex: 1 }} onClick={() => toast(`"${t.nome}" enviado ao paciente`)}><Send size={13} />Enviar</Button>
              <Button variant="ghost" sm onClick={() => toast("Abrindo editor")}><Pencil size={13} /></Button>
              <Button variant="subtle" sm onClick={() => duplicar(t)}><Copy size={13} /></Button>
            </div>
          </Card>
        ))}
      </div>

      {builder && (
        <Modal title="Novo questionário" sub="Monte uma vez e reutilize com todos os pacientes" onClose={() => setBuilder(false)} max={560}
          footer={<>
            <Button variant="ghost" onClick={() => setBuilder(false)}>Cancelar</Button>
            <Button variant="primary" disabled={!name.trim()} onClick={criarQuestionario}>Criar questionário</Button>
          </>}>
          <Field label="Nome do questionário"><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Hábitos alimentares — primeira consulta" /></Field>
          <div className="eyebrow" style={{ margin: "18px 0 10px" }}>Perguntas</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {perguntas.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <GripVertical size={15} className="faint" style={{ flexShrink: 0 }} />
                <Input value={p.t} placeholder={`Pergunta ${i + 1}…`} onChange={(e) => setPerguntas(perguntas.map((x, j) => j === i ? { ...x, t: e.target.value } : x))} />
                <select className="select" style={{ width: 150, flexShrink: 0 }} value={p.tipo} onChange={(e) => setPerguntas(perguntas.map((x, j) => j === i ? { ...x, tipo: e.target.value } : x))}>
                  {TIPOS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <button className="iconbtn" style={{ width: 32, height: 32, flexShrink: 0 }} onClick={() => setPerguntas(perguntas.length > 1 ? perguntas.filter((_, j) => j !== i) : perguntas)}><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
          <Button variant="subtle" sm style={{ marginTop: 12 }} onClick={() => setPerguntas([...perguntas, { t: "", tipo: "Texto curto" }])}><Plus size={13} />Adicionar pergunta</Button>
        </Modal>
      )}
    </motion.div>
  );
}
