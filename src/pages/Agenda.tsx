import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarPlus, Link2, ChevronLeft, ChevronRight, Check, X } from "lucide-react";
import { Button, Segmented, Modal, Field, Input } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { WEEKDAYS, HOURS } from "../lib/mock";
import { LOCAL_KEYS, type AppointmentRequest, usePersistentState } from "../lib/localData";
import { pushEvent } from "../lib/events";
import { initials, cx } from "../lib/utils";
import type { Appointment, Patient } from "../lib/types";
import { listAppointments, createAppointment, listPatients } from "../lib/db";
import { getUserId } from "../lib/auth";

type View = "dia" | "semana" | "mes";
const MONTH_DAYS = 30; // junho/2026 começa numa segunda-feira
const MONTH_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export default function Agenda() {
  const nav = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<View>("semana");
  const [nova, setNova] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [requests, setRequests] = usePersistentState<AppointmentRequest[]>(LOCAL_KEYS.appointmentRequests, []);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [form, setForm] = useState({ paciente: "", dia: "3", hora: "14:00", modo: "Online" as "Online" | "Presencial", tipo: "Retorno" });

  useEffect(() => { if (params.get("nova")) { setNova(true); setParams({}, { replace: true }); } }, [params, setParams]);
  useEffect(() => {
    listPatients().then((items) => {
      setPatients(items);
      if (items[0]) setForm((prev) => ({ ...prev, paciente: prev.paciente || items[0].nome }));
    }).catch(() => toast("Erro ao carregar pacientes"));
    listAppointments().then(setAppointments).catch(() => toast("Erro ao carregar agendamentos"));
  }, []);

  const salvarConsulta = async (appointment: Omit<Appointment, "id"> & { patientId?: string }) => {
    const userId = getUserId();
    if (!userId) throw new Error("not authenticated");
    return createAppointment(appointment, userId);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Agenda</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            <span className="muted" style={{ fontSize: 13 }}>Semana de 15 – 20 de junho · 2026</span>
            <span className="chip sage" style={{ height: 22 }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--sage)", display: "inline-block" }} />Google Calendar sincronizado</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={() => toast("Link público de agendamento copiado")}><Link2 size={15} />Link de booking</Button>
          <Button variant="primary" onClick={() => setNova(true)}><CalendarPlus size={15} />Nova consulta</Button>
        </div>
      </div>

      {requests.some((r) => r.status === "solicitado") && (
        <div className="card pad" style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center", marginBottom: 12 }}>
            <div><div className="h2">Solicitacoes do portal</div><div className="muted" style={{ fontSize: 12.5 }}>Pedidos de horario feitos pelo paciente.</div></div>
            <span className="chip amber">{requests.filter((r) => r.status === "solicitado").length} pendente(s)</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {requests.filter((r) => r.status === "solicitado").map((request) => (
              <div key={request.id} style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                <div style={{ flex: 1 }}>
                  <div className="h3">{request.paciente}</div>
                  <div className="faint" style={{ fontSize: 12 }}>{request.servico} · {request.data} · {request.hora} · {request.modo}</div>
                </div>
                <Button sm variant="subtle" onClick={() => {
                  setRequests(requests.map((r) => r.id === request.id ? { ...r, status: "recusado" } : r));
                  toast("Solicitacao recusada");
                  pushEvent({
                    tipo: "agenda", titulo: "Não foi possível confirmar esse horário",
                    detalhe: "Escolha outro horário disponível na agenda.", audiencia: "paciente",
                    patientId: request.patientId, portalLink: "agenda",
                  });
                }}><X size={13} />Recusar</Button>
                <Button sm variant="primary" onClick={async () => {
                  try {
                    const saved = await salvarConsulta({ patientId: request.patientId, paciente: request.paciente, hora: request.hora, dur: 45, tipo: request.servico, modo: request.modo, dia: 3 });
                    setAppointments([saved, ...appointments]);
                  } catch {
                    toast("Erro ao confirmar consulta");
                    return;
                  }
                  setRequests(requests.map((r) => r.id === request.id ? { ...r, status: "confirmado" } : r));
                  toast("Consulta confirmada e adicionada a agenda");
                  pushEvent({
                    tipo: "agenda", titulo: "Sua consulta foi confirmada",
                    detalhe: `${request.servico} · ${request.hora} · ${request.modo}`, audiencia: "paciente",
                    patientId: request.patientId, portalLink: "agenda",
                  });
                }}><Check size={13} />Confirmar</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
        <Segmented<View> value={view} onChange={setView} options={[{ value: "dia", label: "Dia" }, { value: "semana", label: "Semana" }, { value: "mes", label: "Mês" }]} />
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button className="iconbtn"><ChevronLeft size={16} /></button>
          <Button variant="subtle" sm>Hoje</Button>
          <button className="iconbtn"><ChevronRight size={16} /></button>
        </div>
      </div>

      {view === "semana" && (
        <div className="card" style={{ overflow: "auto", padding: 0 }}>
          <div style={{ minWidth: 720 }}>
            <div style={{ display: "grid", gridTemplateColumns: "58px repeat(6, 1fr)", borderBottom: "1px solid var(--border)", position: "sticky", top: 0, background: "var(--surface)", zIndex: 1 }}>
              <div />
              {WEEKDAYS.map((d, i) => (
                <div key={d} style={{ padding: "10px 8px", textAlign: "center", borderLeft: "1px solid var(--border)" }}>
                  <div className="faint" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>{d.slice(0, 3)}</div>
                  <div className="num" style={{ fontWeight: 600, fontSize: 15, color: i === 3 ? "var(--sage-strong)" : "var(--text)" }}>{15 + i}</div>
                </div>
              ))}
            </div>
            {HOURS.map((h) => (
              <div key={h} style={{ display: "grid", gridTemplateColumns: "58px repeat(6, 1fr)", minHeight: 56, borderBottom: "1px solid var(--border)" }}>
                <div className="num faint" style={{ fontSize: 11, padding: "6px 8px", textAlign: "right" }}>{h}</div>
                {WEEKDAYS.map((_, di) => {
                  const appt = appointments.find((a) => a.dia === di && a.hora === h);
                  const p = appt && patients.find((x) => x.nome === appt.paciente);
                  return (
                    <div key={di} style={{ borderLeft: "1px solid var(--border)", padding: 4 }}>
                      {appt && (
                        <div onClick={() => p && nav(`/patients/${p.id}`)}
                          style={{ cursor: "pointer", height: "100%", borderRadius: 9, padding: "6px 8px",
                            background: appt.modo === "Online" ? "rgb(var(--c-blue) / .14)" : "var(--sage-soft)",
                            borderLeft: `3px solid ${appt.modo === "Online" ? "var(--blue)" : "var(--sage)"}` }}>
                          <div style={{ fontSize: 11.5, fontWeight: 600, lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{appt.paciente.split(" ")[0]} {appt.paciente.split(" ")[1]?.[0]}.</div>
                          <div className="faint" style={{ fontSize: 10.5 }}>{appt.tipo}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {view === "dia" && (
        <div className="card" style={{ overflow: "hidden" }}>
          {HOURS.map((h) => {
            const appt = appointments.find((a) => a.dia === 3 && a.hora === h);
            const p = appt && patients.find((x) => x.nome === appt.paciente);
            return (
              <div key={h} style={{ display: "flex", gap: 14, padding: "12px 16px", borderTop: "1px solid var(--border)", minHeight: 56 }}>
                <div className="num faint" style={{ fontSize: 12, minWidth: 44 }}>{h}</div>
                {appt ? (
                  <div onClick={() => p && nav(`/patients/${p.id}`)} style={{ flex: 1, cursor: "pointer", borderRadius: 10, padding: "10px 12px", background: appt.modo === "Online" ? "rgb(var(--c-blue) / .12)" : "var(--sage-soft)", display: "flex", alignItems: "center", gap: 11 }}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 11, borderRadius: 8, background: p ? `linear-gradient(150deg, ${p.cor[0]}, ${p.cor[1]})` : undefined }}>{initials(appt.paciente)}</div>
                    <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 13 }}>{appt.paciente}</div><div className="faint" style={{ fontSize: 11.5 }}>{appt.tipo} · {appt.dur}min</div></div>
                    <span className={cx("chip", appt.modo === "Online" ? "blue" : "sage")}>{appt.modo}</span>
                  </div>
                ) : <div className="faint" style={{ fontSize: 12, alignSelf: "center" }}>livre</div>}
              </div>
            );
          })}
        </div>
      )}

      {view === "mes" && (
        <div className="card pad">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
            {MONTH_LABELS.map((d) => <div key={d} className="faint" style={{ fontSize: 11, textAlign: "center", fontWeight: 600, padding: "4px 0" }}>{d}</div>)}
            {Array.from({ length: MONTH_DAYS }).map((_, i) => {
              const day = i + 1;
              const count = [3, 9, 12, 16, 18, 23, 25].includes(day) ? (day % 3) + 1 : 0;
              const today = day === 16;
              return (
                <div key={day} style={{ minHeight: 78, borderRadius: 10, border: "1px solid var(--border)", padding: 8, background: today ? "var(--sage-soft)" : "var(--surface)" }}>
                  <div className="num" style={{ fontSize: 12.5, fontWeight: today ? 700 : 500, color: today ? "var(--sage-strong)" : "var(--muted)" }}>{day}</div>
                  {count > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: "var(--sage-strong)", background: "var(--surface)", borderRadius: 6, padding: "2px 5px" }}>{count} consulta{count > 1 ? "s" : ""}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {nova && (
        <Modal title="Nova consulta" onClose={() => setNova(false)}
          footer={<><Button variant="ghost" onClick={() => setNova(false)}>Cancelar</Button><Button variant="primary" onClick={async () => {
            const patientId = patients.find((p) => p.nome === form.paciente)?.id;
            try {
              const saved = await salvarConsulta({ patientId, paciente: form.paciente, hora: form.hora, dur: 60, tipo: form.tipo, modo: form.modo, dia: Number(form.dia) });
              setAppointments([saved, ...appointments]);
              setNova(false);
              toast("Consulta agendada");
            } catch {
              toast("Erro ao agendar consulta");
            }
          }}>Agendar</Button></>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Paciente"><select className="select" value={form.paciente} onChange={(e) => setForm({ ...form, paciente: e.target.value })}>{patients.map((p) => <option key={p.id}>{p.nome}</option>)}</select></Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label="Dia da semana"><select className="select" value={form.dia} onChange={(e) => setForm({ ...form, dia: e.target.value })}>{WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></Field>
              <Field label="Hora"><Input className="num" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} placeholder="14:00" /></Field>
            </div>
            <Field label="Tipo"><Input value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} /></Field>
            <Field label="Modalidade"><div className="seg" style={{ width: "100%" }}><button className={cx(form.modo === "Online" && "on")} onClick={() => setForm({ ...form, modo: "Online" })} style={{ flex: 1 }}>Online</button><button className={cx(form.modo === "Presencial" && "on")} onClick={() => setForm({ ...form, modo: "Presencial" })} style={{ flex: 1 }}>Presencial</button></div></Field>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
