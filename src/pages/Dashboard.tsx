import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from "recharts";
import { UserPlus, CalendarPlus, FileText, Cake, CheckCircle2, Circle, ArrowRight, Radio } from "lucide-react";
import { Card, Button, Avatar, Chip, Stat } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { DASH, BIRTHDAYS, TASKS, CLINIC } from "../lib/mock";
import { EVENT_META, useEvents } from "../lib/events";
import { initials, timeAgo } from "../lib/utils";
import { useEffect, useState } from "react";
import { listPatients, listAppointments } from "../lib/db";
import type { Appointment, Patient } from "../lib/types";

export default function Dashboard() {
  const nav = useNavigate();
  const toast = useToast();
  const [tasks, setTasks] = useState(TASKS);
  const [apiPatients, setApiPatients] = useState<Patient[]>([]);
  const [apiAppointments, setApiAppointments] = useState<Appointment[]>([]);
  const { events } = useEvents("clinica");
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
  useEffect(() => {
    listPatients().then(setApiPatients).catch(() => toast("Erro ao carregar pacientes"));
    listAppointments().then(setApiAppointments).catch(() => toast("Erro ao carregar agendamentos"));
  }, []);
  const proximos = apiAppointments.slice(0, 4);
  const ativos = apiPatients.filter((p) => p.status === "ativo").length;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 22 }}>
        <div>
          <div className="h1">Bom dia, {CLINIC.nutri.split(" ")[0]}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3, textTransform: "capitalize" }}>{hoje}</div>
        </div>
        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <Button variant="ghost" onClick={() => nav("/patients?novo=1")}><UserPlus size={15} />Novo paciente</Button>
          <Button variant="ghost" onClick={() => nav("/agenda?nova=1")}><CalendarPlus size={15} />Nova consulta</Button>
          <Button variant="primary" onClick={() => toast("Criando novo plano alimentar")}><FileText size={15} />Novo plano</Button>
        </div>
      </div>

      <div className="grow grow-resp" style={{ marginBottom: 18 }}>
        <Stat label="Pacientes ativos" value={String(ativos)} sub={<span className="faint" style={{ fontSize: 11.5 }}>de {apiPatients.length} cadastrado{apiPatients.length === 1 ? "" : "s"}</span>} />
        <Stat label="Consultas na semana" value={String(apiAppointments.length)} sub={<span className="faint" style={{ fontSize: 11.5 }}>agendadas</span>} />
        <Stat label="Taxa de retorno" value="—" sub={<span className="faint" style={{ fontSize: 11.5 }}>sem histórico ainda</span>} />
        <Stat label="Planos vencendo" value="0" sub={<span className="faint" style={{ fontSize: 11.5 }}>nenhum por agora</span>} />
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "1.4fr 1fr" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card pad>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="eyebrow">Próximos atendimentos</span>
              <Button variant="subtle" sm onClick={() => nav("/agenda")}>Ver agenda<ArrowRight size={13} /></Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {proximos.map((a, i) => {
                const p = apiPatients.find((x) => x.nome === a.paciente);
                return (
                  <div key={a.id} onClick={() => p && nav(`/patients/${p.id}`)}
                    style={{ display: "flex", alignItems: "center", gap: 13, padding: "11px 0", borderTop: i ? "1px solid var(--border)" : "none", cursor: "pointer" }}>
                    <div style={{ textAlign: "center", minWidth: 46 }}>
                      <div className="num" style={{ fontWeight: 600, fontSize: 14 }}>{a.hora}</div>
                      <div className="faint" style={{ fontSize: 10 }}>{a.dur}min</div>
                    </div>
                    <Avatar initials={initials(a.paciente)} size={36} gradient={p?.cor} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="h3">{a.paciente}</div>
                      <div className="faint" style={{ fontSize: 12 }}>{a.tipo}</div>
                    </div>
                    <Chip tone={a.modo === "Online" ? "blue" : "sage"}>{a.modo}</Chip>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card pad>
            <span className="eyebrow">Consultas por dia · esta semana</span>
            <div style={{ height: 180, marginTop: 14 }}>
              <ResponsiveContainer>
                <BarChart data={DASH.semana} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                  <XAxis dataKey="dia" tick={{ fontSize: 11, fill: "var(--faint)" }} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "var(--sage-soft)" }} />
                  <Bar dataKey="consultas" radius={[6, 6, 0, 0]} maxBarSize={42}>
                    {DASH.semana.map((_, i) => <Cell key={i} fill={i === 2 ? "var(--sage)" : "var(--sage-soft)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Card pad>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="eyebrow">Atividade recente</span>
              {events.length > 0 && <Radio size={13} color="var(--sage)" />}
            </div>
            {events.length === 0 ? (
              <div className="faint" style={{ fontSize: 12.5, padding: "6px 0 2px" }}>As ações dos pacientes no portal vão aparecer aqui.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                {events.slice(0, 5).map((e, i) => {
                  const meta = EVENT_META[e.tipo];
                  const Icon = meta.icon;
                  return (
                    <div key={e.id} onClick={() => e.clinicLink && nav(e.clinicLink)}
                      style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "8px 4px", borderTop: i ? "1px solid var(--border)" : "none", cursor: e.clinicLink ? "pointer" : "default", borderRadius: 8 }}
                      onMouseEnter={(ev) => { if (e.clinicLink) ev.currentTarget.style.background = "var(--surface2)"; }}
                      onMouseLeave={(ev) => (ev.currentTarget.style.background = "transparent")}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0, marginTop: 1 }}><Icon size={13} color={meta.color} /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, lineHeight: 1.4 }}>{e.titulo}</div>
                        <div className="faint num" style={{ fontSize: 10.5, marginTop: 2 }}>{timeAgo(e.ts)}</div>
                      </div>
                      {!e.lido && <span style={{ width: 6, height: 6, borderRadius: 99, background: "var(--sage)", flexShrink: 0, marginTop: 6 }} />}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card pad>
            <span className="eyebrow">Aniversariantes</span>
            {BIRTHDAYS.length === 0 ? (
              <div className="faint" style={{ fontSize: 12.5, marginTop: 10 }}>Nenhum aniversariante nos próximos dias.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {BIRTHDAYS.map((b, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 11 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--terra-soft)", display: "grid", placeItems: "center" }}><Cake size={16} color="var(--terra)" /></div>
                    <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 13 }}>{b.nome}</div><div className="faint" style={{ fontSize: 11.5 }}>{b.quando} · faz {b.idade}</div></div>
                    <Button variant="subtle" sm onClick={() => toast("Mensagem de parabéns enviada")}>Parabenizar</Button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card pad>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="eyebrow">Tarefas pendentes</span>
              <span className="chip">{tasks.filter((t) => !t.done).length} abertas</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {tasks.map((t, i) => (
                <div key={i} onClick={() => setTasks(tasks.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 8px", borderRadius: 9, cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  {t.done ? <CheckCircle2 size={17} color="var(--sage)" /> : <Circle size={17} className="faint" />}
                  <span style={{ fontSize: 13, flex: 1, color: t.done ? "var(--faint)" : "var(--text)", textDecoration: t.done ? "line-through" : "none" }}>{t.t}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
