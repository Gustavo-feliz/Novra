import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserPlus, LayoutGrid, Columns3, ChevronRight } from "lucide-react";
import { Card, Button, Avatar, Chip, Input, Field, Segmented, Modal } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { PATIENTS, STATUS_META } from "../lib/mock";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import type { Patient, PatientStatus } from "../lib/types";
import { initials, cx, uid } from "../lib/utils";

type StatusFilter = "todos" | PatientStatus;
const KANBAN: { key: PatientStatus; label: string }[] = [
  { key: "ativo", label: "Ativos" }, { key: "pausa", label: "Em pausa" }, { key: "alta", label: "Alta" },
];
const NOVO_PALETTE: [string, string][] = [
  ["#9DB99F", "#6E8C72"], ["#A8B6C9", "#73839E"], ["#E0B48C", "#C98B5A"],
  ["#A2C2C9", "#739AA0"], ["#C9A2B0", "#9E7383"], ["#B9A88C", "#8E7B5E"],
];

function PatientCard({ p, onClick }: { p: Patient; onClick: () => void }) {
  const sm = STATUS_META[p.status];
  return (
    <Card pad onClick={onClick} className="patient-card" style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
        <Avatar initials={initials(p.nome)} size={44} gradient={p.cor} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
          <div className="faint" style={{ fontSize: 12 }}>{p.idade} anos · {p.objetivo}</div>
        </div>
        <Chip tone={sm.chip as any}>{sm.label}</Chip>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {p.tags.map((t) => <Chip key={t} tone={t === "Inadimplente" ? "red" : t === "Gestante" || t === "Alta prioridade" ? "sage" : ""}>{t}</Chip>)}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 11, borderTop: "1px solid var(--border)" }}>
        <div><div className="faint" style={{ fontSize: 10.5 }}>Última consulta</div><div className="num" style={{ fontSize: 12.5, fontWeight: 600 }}>{p.ultimaConsulta}</div></div>
        <div style={{ textAlign: "right" }}><div className="faint" style={{ fontSize: 10.5 }}>Próxima ação</div><div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--sage-strong)" }}>{p.proximaAcao}</div></div>
      </div>
    </Card>
  );
}

export default function Patients() {
  const nav = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [patients, setPatients] = usePersistentState<Patient[]>(LOCAL_KEYS.patients, PATIENTS);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("todos");
  const [view, setView] = useState<"grid" | "kanban">("grid");
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({ nome: "", idade: "", sexo: "Feminino" as Patient["sexo"], objetivo: "Emagrecimento" });

  useEffect(() => { if (params.get("novo")) { setNovo(true); setParams({}, { replace: true }); } }, [params, setParams]);

  const filtered = useMemo(() => patients.filter((p) =>
    (status === "todos" || p.status === status) && p.nome.toLowerCase().includes(q.toLowerCase())
  ), [patients, q, status]);

  const criarPaciente = () => {
    const nome = form.nome.trim();
    if (!nome) return;
    const novoPaciente: Patient = {
      id: uid(),
      nome,
      idade: Number(form.idade) || 0,
      sexo: form.sexo,
      objetivo: form.objetivo as Patient["objetivo"],
      status: "ativo",
      tags: [],
      ultimaConsulta: "—",
      proximaAcao: "Primeira consulta",
      adesao: 0,
      cor: NOVO_PALETTE[patients.length % NOVO_PALETTE.length],
    };
    setPatients([novoPaciente, ...patients]);
    setNovo(false);
    setStatus("todos");
    setForm({ nome: "", idade: "", sexo: "Feminino", objetivo: "Emagrecimento" });
    toast(`Paciente "${novoPaciente.nome}" criado`);
    nav(`/patients/${novoPaciente.id}`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Pacientes</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>{filtered.length} de {patients.length} pacientes</div>
        </div>
        <Button variant="primary" onClick={() => setNovo(true)}><UserPlus size={15} />Novo paciente</Button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} className="faint" style={{ position: "absolute", left: 12, top: 11 }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar paciente…" style={{ paddingLeft: 36 }} />
        </div>
        <Segmented<StatusFilter>
          value={status} onChange={setStatus}
          options={[{ value: "todos", label: "Todos" }, { value: "ativo", label: "Ativos" }, { value: "pausa", label: "Em pausa" }, { value: "alta", label: "Alta" }]}
        />
        <div className="seg">
          <button className={cx(view === "grid" && "on")} onClick={() => setView("grid")} style={{ display: "flex", alignItems: "center", gap: 5 }}><LayoutGrid size={14} />Lista</button>
          <button className={cx(view === "kanban" && "on")} onClick={() => setView("kanban")} style={{ display: "flex", alignItems: "center", gap: 5 }}><Columns3 size={14} />Kanban</button>
        </div>
      </div>

      {view === "grid" ? (
        <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
          {filtered.map((p) => <PatientCard key={p.id} p={p} onClick={() => nav(`/patients/${p.id}`)} />)}
        </div>
      ) : (
        <div className="gcol kanban-cols" style={{ gridTemplateColumns: "repeat(3, 1fr)", alignItems: "start" }}>
          {KANBAN.map((col) => {
            const items = filtered.filter((p) => p.status === col.key);
            return (
              <div key={col.key} style={{ background: "var(--surface2)", borderRadius: 14, padding: 12, border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "0 2px" }}>
                  <span className="h3">{col.label}</span><span className="chip">{items.length}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {items.map((p) => (
                    <div key={p.id} onClick={() => nav(`/patients/${p.id}`)} className="card pad" style={{ padding: 12, cursor: "pointer", display: "flex", gap: 10, alignItems: "center" }}>
                      <Avatar initials={initials(p.nome)} size={34} gradient={p.cor} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="h3" style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.nome}</div>
                        <div className="faint" style={{ fontSize: 11 }}>{p.objetivo}</div>
                      </div>
                      <ChevronRight size={15} className="faint" />
                    </div>
                  ))}
                  {items.length === 0 && <div className="faint" style={{ fontSize: 12, textAlign: "center", padding: "14px 0" }}>Vazio</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {novo && (
        <Modal title="Novo paciente" sub="Cadastro rápido — você completa os dados depois" onClose={() => setNovo(false)}
          footer={<>
            <Button variant="ghost" onClick={() => setNovo(false)}>Cancelar</Button>
            <Button variant="primary" disabled={!form.nome.trim()} onClick={criarPaciente}>Criar paciente</Button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Nome completo">
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Ana Beatriz Souza"
                onKeyDown={(e) => { if (e.key === "Enter" && form.nome.trim()) criarPaciente(); }} />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Idade"><Input className="num" value={form.idade} onChange={(e) => setForm({ ...form, idade: e.target.value })} inputMode="numeric" /></Field>
              <Field label="Sexo">
                <div className="seg" style={{ width: "100%" }}>
                  {(["Feminino", "Masculino"] as const).map((s) => (
                    <button key={s} style={{ flex: 1 }} className={cx(form.sexo === s && "on")} onClick={() => setForm({ ...form, sexo: s })}>{s}</button>
                  ))}
                </div>
              </Field>
            </div>
            <Field label="Objetivo">
              <select className="select" value={form.objetivo} onChange={(e) => setForm({ ...form, objetivo: e.target.value })}>
                {["Emagrecimento", "Hipertrofia", "Gestacional", "Esportivo", "Clínico", "Infantil"].map((o) => <option key={o}>{o}</option>)}
              </select>
            </Field>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
