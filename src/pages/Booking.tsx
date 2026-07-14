import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Salad, Clock, MapPin, Calendar, ChevronLeft, ChevronRight, Check, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui";
import { getBookingPublic, requestAppointment } from "../lib/db";
import { brl, cx } from "../lib/utils";
import type { BookingConfig, BookingService } from "../lib/types";

function getNextDays(count: number): { label: string; short: string; day: number; month: number }[] {
  const result = [];
  const now = new Date();
  let checked = 0;
  let offset = 0;
  while (checked < count) {
    const d = new Date(now);
    d.setDate(now.getDate() + offset);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
      result.push({ label: DAYS[dow], short: DAYS[dow], day: d.getDate(), month: d.getMonth() + 1 });
      checked++;
    }
    offset++;
  }
  return result;
}

const DUR_MAP: Record<string, number> = { "60 min": 60, "45 min": 45, "30 min": 30 };

export default function Booking() {
  const { slug } = useParams<{ slug: string }>();
  const [config, setConfig] = useState<BookingConfig | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ok" | "not_found">("loading");

  const [svc, setSvc] = useState(0);
  const [diasPage, setDiasPage] = useState(0);
  const [diaIdx, setDiaIdx] = useState(0);
  const [hora, setHora] = useState<string | null>(null);
  const [nome, setNome] = useState("");
  const [nomeErr, setNomeErr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const DIAS = getNextDays(15);
  const PAGE_SIZE = 5;
  const diasVisiveis = DIAS.slice(diasPage * PAGE_SIZE, diasPage * PAGE_SIZE + PAGE_SIZE);
  const service: BookingService | undefined = config?.servicos[svc];

  useEffect(() => {
    if (!slug) { setLoadState("not_found"); return; }
    getBookingPublic(slug).then((cfg) => {
      if (!cfg || !cfg.ativo) { setLoadState("not_found"); return; }
      setConfig(cfg);
      setLoadState("ok");
    }).catch(() => setLoadState("not_found"));
  }, [slug]);

  const confirmar = async () => {
    if (!config || !service || !hora || submitting) return;
    const cleanNome = nome.trim();
    if (cleanNome.length < 2) { setNomeErr("Informe seu nome completo."); return; }
    setNomeErr("");
    setSubmitting(true);
    const diaReal = diasVisiveis[diaIdx];
    try {
      const ok = await requestAppointment(slug!, {
        nome: cleanNome,
        hora,
        tipo: service.nome,
        modo: service.modo.includes("Online") ? "Online" : "Presencial",
        dur: DUR_MAP[service.dur] ?? 60,
        dia: diaReal.day,
      });
      if (ok) setSuccess(true);
      else setNomeErr("Não foi possível confirmar. Tente novamente.");
    } catch {
      setNomeErr("Erro ao agendar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (loadState === "not_found") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 360 }}>
          <AlertCircle size={32} className="faint" style={{ marginBottom: 12 }} />
          <div className="h2" style={{ marginBottom: 8 }}>Link não disponível</div>
          <div className="muted" style={{ fontSize: 14 }}>Este link de agendamento não existe ou está desativado. Verifique com seu nutricionista.</div>
        </div>
      </div>
    );
  }

  if (success && service && hora) {
    const diaReal = diasVisiveis[diaIdx];
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: "center", maxWidth: 380 }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: "var(--sage-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}>
            <CheckCircle2 size={30} color="var(--sage)" />
          </div>
          <div className="h2" style={{ marginBottom: 8 }}>Solicitação enviada!</div>
          <div className="muted" style={{ fontSize: 14, lineHeight: 1.6 }}>
            Sua consulta de <strong>{service.nome}</strong> para o dia <strong>{diaReal.day}/{diaReal.month < 10 ? "0" + diaReal.month : diaReal.month}</strong> às <strong>{hora}</strong> foi enviada para confirmação. Em breve você receberá uma confirmação.
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", paddingBottom: 48 }}>
      <div style={{ maxWidth: 520, margin: "0 auto", padding: "0 16px" }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>

          {/* Header */}
          <div style={{ textAlign: "center", padding: "40px 0 28px" }}>
            <div className="brand-mark" style={{ width: 52, height: 52, borderRadius: 16, margin: "0 auto 14px" }}><Salad size={26} /></div>
            <div className="h2" style={{ fontSize: 22 }}>Agendar consulta</div>
            <div className="faint" style={{ fontSize: 13, marginTop: 4 }}>Escolha o serviço, dia e horário</div>
          </div>

          {/* Serviço */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>1 · Serviço</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {(config?.servicos ?? []).map((s, i) => (
              <button key={i} onClick={() => setSvc(i)} className={cx("card")} style={{ padding: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, borderColor: svc === i ? "var(--sage)" : "var(--border)", boxShadow: svc === i ? "0 0 0 3px var(--ring)" : "var(--shadow)", background: "var(--surface)", textAlign: "left" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: svc === i ? "var(--sage-soft)" : "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  <Clock size={16} color={svc === i ? "var(--sage)" : "var(--faint)"} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="h3" style={{ fontSize: 14 }}>{s.nome}</div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 2 }}><MapPin size={10} style={{ verticalAlign: "middle" }} /> {s.modo} · {s.dur}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div className="num" style={{ fontWeight: 600 }}>{brl(s.preco)}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Dia */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>2 · Dia</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
            <button className="iconbtn" style={{ width: 34, height: 44, flexShrink: 0 }} disabled={diasPage === 0} onClick={() => setDiasPage((p) => p - 1)}><ChevronLeft size={16} /></button>
            <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
              {diasVisiveis.map((d, i) => (
                <button key={i} onClick={() => { setDiaIdx(i); setHora(null); }} className={cx("card")} style={{ padding: "10px 4px", textAlign: "center", cursor: "pointer", border: "1px solid", borderColor: diaIdx === i ? "var(--sage)" : "var(--border)", background: diaIdx === i ? "var(--sage)" : "var(--surface)", color: diaIdx === i ? "#fff" : "var(--text)", boxShadow: diaIdx === i ? "0 0 0 3px var(--ring)" : "var(--shadow)" }}>
                  <div style={{ fontSize: 11, opacity: diaIdx === i ? .9 : .7 }}>{d.label}</div>
                  <div className="num" style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>{d.day}</div>
                </button>
              ))}
            </div>
            <button className="iconbtn" style={{ width: 34, height: 44, flexShrink: 0 }} disabled={(diasPage + 1) * PAGE_SIZE >= DIAS.length} onClick={() => setDiasPage((p) => p + 1)}><ChevronRight size={16} /></button>
          </div>

          {/* Horário */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>3 · Horário</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 24 }}>
            {(config?.horarios ?? []).map((h) => (
              <button key={h} onClick={() => setHora(h)} className={cx("btn", hora === h ? "primary" : "ghost", "sm")}>
                <span className="num">{h}</span>
              </button>
            ))}
          </div>

          {/* Nome */}
          <div className="eyebrow" style={{ marginBottom: 10 }}>4 · Seu nome</div>
          <input
            className="input"
            value={nome}
            onChange={(e) => { setNome(e.target.value); setNomeErr(""); }}
            placeholder="Nome completo"
            style={{ marginBottom: nomeErr ? 6 : 24, fontSize: 15 }}
          />
          <AnimatePresence>
            {nomeErr && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="banner alert" style={{ marginBottom: 16 }}>{nomeErr}</motion.div>
            )}
          </AnimatePresence>

          <Button variant="primary" style={{ width: "100%", height: 48, fontSize: 15 }} disabled={!hora || submitting} onClick={confirmar}>
            <Calendar size={17} />{submitting ? "Confirmando…" : hora ? `Confirmar ${diasVisiveis[diaIdx]?.day}/${diasVisiveis[diaIdx]?.month < 10 ? "0" + diasVisiveis[diaIdx]?.month : diasVisiveis[diaIdx]?.month} às ${hora}` : "Selecione um horário"}
            {!submitting && hora && <Check size={16} />}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
