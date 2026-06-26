import { useState } from "react";
import { motion } from "framer-motion";
import { Link2, Copy, Check, Salad, Clock, MapPin, Calendar, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Card, Button, Field, Input, Toggle } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { BOOKING, CLINIC } from "../lib/mock";
import { brl, cx } from "../lib/utils";

const DIAS = [
  { d: "Seg", n: 15 }, { d: "Ter", n: 16 }, { d: "Qua", n: 17 }, { d: "Qui", n: 18 }, { d: "Sex", n: 19 },
];

export default function BookingLink() {
  const toast = useToast();
  const [slug, setSlug] = useState(BOOKING.slug);
  const [ativo, setAtivo] = useState(true);
  const [confirmAuto, setConfirmAuto] = useState(true);
  const [copied, setCopied] = useState(false);
  const [svc, setSvc] = useState(1);
  const [dia, setDia] = useState(2);
  const [hora, setHora] = useState<string | null>(null);
  const url = `novra.app/${slug}`;

  const copy = () => { setCopied(true); toast("Link copiado"); setTimeout(() => setCopied(false), 1600); };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Link de agendamento</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Seu paciente marca sozinho — você só confirma</div>
        </div>
        <Button variant="ghost" onClick={() => toast("Abrindo página pública")}><ExternalLink size={15} />Ver página</Button>
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "1fr 1.1fr", alignItems: "start" }}>
        {/* ----- Config ----- */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Card pad>
            <span className="eyebrow">Seu link público</span>
            <div style={{ display: "flex", gap: 8, marginTop: 12, alignItems: "center" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px", height: 38 }}>
                <Link2 size={15} className="faint" />
                <span className="num" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{url}</span>
              </div>
              <Button variant="primary" onClick={copy}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copiado" : "Copiar"}</Button>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div><div className="h3" style={{ fontSize: 13 }}>Agendamento ativo</div><div className="faint" style={{ fontSize: 12 }}>Pacientes podem marcar consultas</div></div>
              <Toggle on={ativo} onClick={() => setAtivo(!ativo)} />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              <div><div className="h3" style={{ fontSize: 13 }}>Confirmar automaticamente</div><div className="faint" style={{ fontSize: 12 }}>Sem aprovação manual de cada horário</div></div>
              <Toggle on={confirmAuto} onClick={() => setConfirmAuto(!confirmAuto)} />
            </div>
          </Card>

          <Card pad>
            <span className="eyebrow">Identidade da marca</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 12 }}>
              <Field label="Endereço do link (slug)"><Input className="num" value={slug} onChange={(e) => setSlug(e.target.value.replace(/[^a-z0-9-]/gi, "").toLowerCase())} /></Field>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Cor de destaque</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["var(--sage)", "var(--blue)", "var(--terra)", "var(--amber)"].map((c, i) => (
                    <div key={i} style={{ width: 28, height: 28, borderRadius: 9, background: c, cursor: "pointer", border: i === 0 ? "2px solid var(--text)" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>
            </div>
          </Card>

          <Card pad>
            <span className="eyebrow">Serviços oferecidos</span>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
              {BOOKING.servicos.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", border: "1px solid var(--border)", borderRadius: 10 }}>
                  <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 13 }}>{s.nome}</div><div className="faint" style={{ fontSize: 11.5 }}>{s.dur} · {s.modo}</div></div>
                  <span className="num" style={{ fontWeight: 600, fontSize: 13 }}>{brl(s.preco)}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* ----- Live preview ----- */}
        <Card glass pad style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--glass-brd)", display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ display: "flex", gap: 5 }}><i style={{ width: 9, height: 9, borderRadius: 99, background: "var(--red)", display: "inline-block" }} /><i style={{ width: 9, height: 9, borderRadius: 99, background: "var(--amber)", display: "inline-block" }} /><i style={{ width: 9, height: 9, borderRadius: 99, background: "var(--green)", display: "inline-block" }} /></span>
            <div style={{ flex: 1, textAlign: "center" }} className="num faint"><span style={{ fontSize: 11.5 }}>{url}</span></div>
          </div>
          <div style={{ padding: 22 }}>
            <div style={{ textAlign: "center", marginBottom: 22 }}>
              <div className="brand-mark" style={{ width: 44, height: 44, borderRadius: 13, margin: "0 auto 10px" }}><Salad size={22} /></div>
              <div className="h2">{CLINIC.nome}</div>
              <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{CLINIC.cidade} · {CLINIC.crn}</div>
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>1 · Escolha o serviço</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
              {BOOKING.servicos.map((s, i) => (
                <div key={i} onClick={() => setSvc(i)} className={cx("card")} style={{ padding: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 10, borderColor: svc === i ? "var(--sage)" : "var(--border)", boxShadow: svc === i ? "0 0 0 3px var(--ring)" : "var(--shadow)" }}>
                  <Clock size={15} className="faint" />
                  <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 13 }}>{s.nome}</div><div className="faint" style={{ fontSize: 11.5 }}><MapPin size={10} style={{ verticalAlign: "middle" }} /> {s.modo}</div></div>
                  <div style={{ textAlign: "right" }}><div className="num" style={{ fontWeight: 600, fontSize: 13 }}>{brl(s.preco)}</div><div className="faint num" style={{ fontSize: 11 }}>{s.dur}</div></div>
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>2 · Escolha o dia</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 18 }}>
              <button className="iconbtn" style={{ width: 30, height: 38 }}><ChevronLeft size={15} /></button>
              <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
                {DIAS.map((d, i) => (
                  <button key={i} onClick={() => setDia(i)} className={cx("card")} style={{ padding: "8px 0", textAlign: "center", cursor: "pointer", border: "none", background: dia === i ? "var(--sage)" : "var(--surface2)", color: dia === i ? "#fff" : "var(--text)" }}>
                    <div style={{ fontSize: 10.5, opacity: .8 }}>{d.d}</div><div className="num" style={{ fontWeight: 600, fontSize: 15 }}>{d.n}</div>
                  </button>
                ))}
              </div>
              <button className="iconbtn" style={{ width: 30, height: 38 }}><ChevronRight size={15} /></button>
            </div>

            <div className="eyebrow" style={{ marginBottom: 8 }}>3 · Escolha o horário</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
              {BOOKING.horarios.map((h) => {
                const ocupado = BOOKING.ocupados.includes(h);
                return (
                  <button key={h} disabled={ocupado} onClick={() => setHora(h)}
                    className={cx("btn", hora === h ? "primary" : "ghost", "sm")}
                    style={{ opacity: ocupado ? .4 : 1, textDecoration: ocupado ? "line-through" : "none" }}>
                    <span className="num">{h}</span>
                  </button>
                );
              })}
            </div>

            <Button variant="primary" style={{ width: "100%" }} disabled={!hora}
              onClick={() => { toast(`Consulta solicitada para dia ${DIAS[dia].n} às ${hora}`); setHora(null); }}>
              <Calendar size={15} />{hora ? `Confirmar ${DIAS[dia].n}/06 às ${hora}` : "Selecione um horário"}
            </Button>
          </div>
        </Card>
      </div>
    </motion.div>
  );
}
