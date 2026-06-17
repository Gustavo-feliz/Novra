import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Video, Mic, Link2, Calendar, Settings2, ArrowRight } from "lucide-react";
import { Card, Button, Avatar, Chip } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { VIDEO_ROOMS } from "../lib/mock";
import { initials, cx } from "../lib/utils";

const STATUS: Record<string, { label: string; tone: string }> = {
  agora: { label: "Disponível agora", tone: "sage" },
  proxima: { label: "Hoje", tone: "blue" },
  agendada: { label: "Agendada", tone: "" },
};

export default function VideoCall() {
  const nav = useNavigate();
  const toast = useToast();
  const [cam, setCam] = useState(true);
  const [mic, setMic] = useState(true);
  const agora = VIDEO_ROOMS.find((r) => r.status === "agora");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Videochamada</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Salas de consulta online seguras e integradas</div>
        </div>
        <Button variant="ghost" onClick={() => toast("Link da sala copiado")}><Link2 size={15} />Copiar link da sala</Button>
      </div>

      <div className="gcol gcol-resp" style={{ gridTemplateColumns: "1.3fr 1fr", marginBottom: 18 }}>
        <Card glass pad>
          <span className="eyebrow">Pré-visualização · teste seus dispositivos</span>
          <div style={{ aspectRatio: "16 / 10", borderRadius: 14, background: "linear-gradient(150deg, var(--surface2), var(--bg))", marginTop: 12, position: "relative", display: "grid", placeItems: "center", overflow: "hidden", border: "1px solid var(--border)" }}>
            {cam ? (
              <div style={{ textAlign: "center" }}>
                <Avatar initials="VL" size={72} />
                <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Câmera ativa · Vanessa da Luz</div>
              </div>
            ) : (
              <div className="faint" style={{ fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}><Video size={16} />Câmera desligada</div>
            )}
            <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
              <button className={cx("iconbtn")} style={{ width: 42, height: 42, borderRadius: 12, background: mic ? "var(--surface)" : "var(--red)", color: mic ? "var(--muted)" : "#fff", borderColor: mic ? "var(--border)" : "transparent" }} onClick={() => setMic(!mic)}><Mic size={17} /></button>
              <button className={cx("iconbtn")} style={{ width: 42, height: 42, borderRadius: 12, background: cam ? "var(--surface)" : "var(--red)", color: cam ? "var(--muted)" : "#fff", borderColor: cam ? "var(--border)" : "transparent" }} onClick={() => setCam(!cam)}><Video size={17} /></button>
              <button className="iconbtn" style={{ width: 42, height: 42, borderRadius: 12 }} onClick={() => toast("Abrindo configurações de áudio e vídeo")}><Settings2 size={17} /></button>
            </div>
          </div>
        </Card>

        <Card pad style={{ display: "flex", flexDirection: "column" }}>
          {agora ? (
            <>
              <Chip tone="sage" style={{ alignSelf: "flex-start" }}><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--sage)", display: "inline-block" }} />Sala aberta</Chip>
              <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "16px 0" }}>
                <Avatar initials={initials(agora.paciente)} size={52} gradient={agora.cor} />
                <div><div className="h2">{agora.paciente}</div><div className="muted" style={{ fontSize: 13 }}>{agora.tipo} · {agora.hora}</div></div>
              </div>
              <div className="muted" style={{ fontSize: 13, marginBottom: 16 }}>O paciente já pode entrar pelo link enviado. Suas anotações durante a chamada vão direto ao prontuário.</div>
              <Button variant="primary" style={{ marginTop: "auto" }} onClick={() => nav(`/consultation/${agora.id}`)}><Video size={16} />Entrar na sala<ArrowRight size={15} /></Button>
            </>
          ) : (
            <div style={{ textAlign: "center", margin: "auto 0" }}>
              <Calendar size={26} className="faint" />
              <div className="h3" style={{ marginTop: 10 }}>Nenhuma sala aberta agora</div>
            </div>
          )}
        </Card>
      </div>

      <div className="eyebrow" style={{ marginBottom: 11 }}>Consultas online</div>
      <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {VIDEO_ROOMS.map((r) => {
          const st = STATUS[r.status];
          return (
            <Card key={r.id + r.hora} pad style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Avatar initials={initials(r.paciente)} size={42} gradient={r.cor} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.paciente}</div>
                <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{r.tipo} · {r.hora}</div>
              </div>
              {r.status === "agora"
                ? <Button variant="primary" sm onClick={() => nav(`/consultation/${r.id}`)}>Entrar</Button>
                : <Chip tone={st.tone as any}>{st.label}</Chip>}
            </Card>
          );
        })}
      </div>
    </motion.div>
  );
}
