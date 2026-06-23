import { useMemo, useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, UserPlus, LayoutGrid, Columns3, ChevronRight, Camera, Plus, X } from "lucide-react";
import { Card, Button, Avatar, Chip, Input, Field, Textarea, Segmented, Modal } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { PATIENTS, STATUS_META } from "../lib/mock";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import type { Patient, PatientStatus } from "../lib/types";
import { initials, cx, uid, calcularIdade } from "../lib/utils";
import { apiFetch, tryApiFetch } from "../lib/api";

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
  const FORM_VAZIO = { nome: "", email: "", sexo: "Masculino" as Patient["sexo"], dataNascimento: "", telefone: "", cpfCnpj: "", observacao: "" };
  const [form, setForm] = useState(FORM_VAZIO);
  const [formTags, setFormTags] = useState<string[]>([]);
  const [addingTag, setAddingTag] = useState(false);

  useEffect(() => { if (params.get("novo")) { setNovo(true); setParams({}, { replace: true }); } }, [params, setParams]);
  useEffect(() => {
    tryApiFetch<Patient[]>("/api/patients", patients).then((items) => {
      if (items.length) setPatients(items);
    });
  }, []);

  const filtered = useMemo(() => patients.filter((p) =>
    (status === "todos" || p.status === status) && p.nome.toLowerCase().includes(q.toLowerCase())
  ), [patients, q, status]);

  const resetForm = () => { setForm(FORM_VAZIO); setFormTags([]); setAddingTag(false); };
  const fecharModal = () => { setNovo(false); resetForm(); };
  const podeCriar = !!(form.nome.trim() && form.dataNascimento && form.telefone.trim());

  const criarPaciente = async () => {
    if (!podeCriar) return;
    const novoPaciente: Patient = {
      id: uid(),
      nome: form.nome.trim(),
      idade: calcularIdade(form.dataNascimento),
      sexo: form.sexo,
      objetivo: "Clínico",
      status: "ativo",
      tags: formTags,
      ultimaConsulta: "—",
      proximaAcao: "Primeira consulta",
      adesao: 0,
      cor: NOVO_PALETTE[patients.length % NOVO_PALETTE.length],
      email: form.email.trim() || undefined,
      telefone: form.telefone.trim(),
      cpfCnpj: form.cpfCnpj.trim() || undefined,
      dataNascimento: form.dataNascimento,
      observacao: form.observacao.trim() || undefined,
    };
    try {
      const saved = await apiFetch<Patient>("/api/patients", { method: "POST", body: JSON.stringify(novoPaciente) });
      setPatients([saved, ...patients.filter((p) => p.id !== saved.id)]);
      setStatus("todos");
      toast(`Paciente "${saved.nome}" criado no backend`);
      fecharModal();
      nav(`/patients/${saved.id}`);
    } catch {
      setPatients([novoPaciente, ...patients]);
      setStatus("todos");
      toast(`Paciente "${novoPaciente.nome}" criado localmente`);
      fecharModal();
      nav(`/patients/${novoPaciente.id}`);
    }
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
        <Modal title="Criar paciente" sub="Cadastro completo do paciente" onClose={fecharModal} max={560}
          footer={<>
            <Button variant="ghost" onClick={fecharModal}>Cancelar</Button>
            <Button variant="primary" disabled={!podeCriar} onClick={criarPaciente}>Criar paciente</Button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", gap: 14, alignItems: "flex-end" }}>
              <div className="upload" style={{ width: 64, height: 64, borderRadius: "50%", padding: 0, display: "grid", placeItems: "center", flexShrink: 0 }}
                onClick={() => toast("Selecione uma foto do paciente")} title="Adicionar foto">
                <Camera size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Nome *">
                  <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Nome"
                    onKeyDown={(e) => { if (e.key === "Enter" && podeCriar) criarPaciente(); }} />
                </Field>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Email">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email (opcional)" />
              </Field>
              <Field label="Gênero *">
                <div className="seg" style={{ width: "100%" }}>
                  {(["Masculino", "Feminino"] as const).map((s) => (
                    <button key={s} style={{ flex: 1 }} className={cx(form.sexo === s && "on")} onClick={() => setForm({ ...form, sexo: s })}>{s}</button>
                  ))}
                </div>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Data de nascimento *">
                <Input type="date" className="num" value={form.dataNascimento} onChange={(e) => setForm({ ...form, dataNascimento: e.target.value })} />
              </Field>
              <Field label="Celular com DDD *">
                <div style={{ display: "flex", gap: 7 }}>
                  <div className="input" style={{ width: 64, flexShrink: 0, display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 13 }}>BR +55</div>
                  <Input className="num" style={{ flex: 1 }} value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} placeholder="(11) 98888-7777" />
                </div>
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="CPF/CNPJ">
                <div style={{ display: "flex", gap: 7 }}>
                  <div className="input" style={{ width: 48, flexShrink: 0, display: "grid", placeItems: "center", color: "var(--muted)", fontSize: 13 }}>BR</div>
                  <Input className="num" style={{ flex: 1 }} value={form.cpfCnpj} onChange={(e) => setForm({ ...form, cpfCnpj: e.target.value })} placeholder="000.000.000-00" />
                </div>
              </Field>
            </div>

            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Tags</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                {formTags.map((t) => (
                  <span key={t} className="chip">{t}<button onClick={() => setFormTags(formTags.filter((x) => x !== t))}><X size={11} /></button></span>
                ))}
                {addingTag ? (
                  <input autoFocus className="input" style={{ height: 25, width: 130, fontSize: 12 }} placeholder="nova etiqueta…"
                    onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { setFormTags([...formTags, e.currentTarget.value.trim()]); setAddingTag(false); } if (e.key === "Escape") setAddingTag(false); }}
                    onBlur={() => setAddingTag(false)} />
                ) : <span className="chip add" onClick={() => setAddingTag(true)}><Plus size={12} /></span>}
              </div>
            </div>

            <Field label="Observação">
              <Textarea rows={3} value={form.observacao} onChange={(e) => setForm({ ...form, observacao: e.target.value })} placeholder="Adicione uma observação sobre o paciente" />
            </Field>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
