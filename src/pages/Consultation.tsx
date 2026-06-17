import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Mic, Video, MonitorUp, PhoneOff, Salad, Plus, FileText, Ruler } from "lucide-react";
import { Button, Avatar, Chip, Segmented, Textarea } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { PATIENTS } from "../lib/mock";
import { initials } from "../lib/utils";

export default function Consultation() {
  const { id } = useParams();
  const nav = useNavigate();
  const toast = useToast();
  const p = PATIENTS.find((x) => x.id === id) ?? PATIENTS[0];
  const [tab, setTab] = useState<"notas" | "prontuario" | "dados">("notas");
  const [nota, setNota] = useState("");
  const [secs, setSecs] = useState(0);
  useEffect(() => { const t = setInterval(() => setSecs((s) => s + 1), 1000); return () => clearInterval(t); }, []);
  const mmss = `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="topbar" style={{ position: "sticky", top: 0, zIndex: 30, height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600 }}><div className="brand-mark"><Salad size={15} /></div><span className="hide-sm">Consulta</span></div>
        <div className="crumb hide-sm"><span>Atendimento</span><span className="sep">/</span><b>{p.nome}</b></div>
        <div style={{ flex: 1 }} />
        <Chip tone="red"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--red)", display: "inline-block" }} />Ao vivo · <span className="num">{mmss}</span></Chip>
        <Button variant="ghost" onClick={() => nav(`/patients/${p.id}`)}>Encerrar e abrir perfil</Button>
      </header>

      <div style={{ flex: 1, display: "flex", minWidth: 0 }} className="consult-grid">
        <div style={{ flex: 1, padding: 24, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          <div style={{ flex: 1, borderRadius: 18, position: "relative", overflow: "hidden", minHeight: 320,
            background: `linear-gradient(150deg, ${p.cor[0]}, ${p.cor[1]})` }}>
            <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,.95)" }}>
                <div className="avatar" style={{ width: 88, height: 88, fontSize: 32, margin: "0 auto 14px", background: "rgba(255,255,255,.2)" }}>{initials(p.nome)}</div>
                <div style={{ fontWeight: 600, fontSize: 17 }}>{p.nome}</div>
                <div style={{ fontSize: 13, opacity: .85, marginTop: 2 }}>Câmera desligada · aguardando vídeo</div>
              </div>
            </div>
            <div style={{ position: "absolute", bottom: 14, right: 14, width: 132, height: 88, borderRadius: 12, background: "rgba(0,0,0,.35)", border: "1px solid rgba(255,255,255,.2)", display: "grid", placeItems: "center", color: "rgba(255,255,255,.85)", fontSize: 12 }}>Você</div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button className="iconbtn" style={{ width: 46, height: 46, borderRadius: 13 }} onClick={() => toast("Microfone alternado")}><Mic size={18} /></button>
            <button className="iconbtn" style={{ width: 46, height: 46, borderRadius: 13 }} onClick={() => toast("Câmera alternada")}><Video size={18} /></button>
            <button className="iconbtn" style={{ width: 46, height: 46, borderRadius: 13 }} onClick={() => toast("Compartilhando tela")}><MonitorUp size={18} /></button>
            <button className="iconbtn" style={{ width: 46, height: 46, borderRadius: 13, background: "var(--red)", borderColor: "transparent", color: "#fff" }} onClick={() => nav(`/patients/${p.id}`)}><PhoneOff size={18} /></button>
          </div>
        </div>

        <aside style={{ width: 380, borderLeft: "1px solid var(--border)", padding: 18, display: "flex", flexDirection: "column", minWidth: 0 }} className="consult-aside">
          <Segmented value={tab} onChange={setTab} full options={[{ value: "notas", label: "Anotações" }, { value: "prontuario", label: "Prontuário" }, { value: "dados", label: "Dados" }]} />
          <div style={{ marginTop: 16, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
            {tab === "notas" && (
              <>
                <div className="banner ok" style={{ marginBottom: 12 }}><FileText size={15} />As anotações desta chamada vão direto para o prontuário.</div>
                <Textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Anotações da consulta…" style={{ flex: 1, minHeight: 220 }} />
                <Button variant="primary" style={{ marginTop: 12 }} disabled={!nota.trim()} onClick={() => { toast("Anotação salva no prontuário"); setNota(""); }}><Plus size={15} />Salvar no prontuário</Button>
              </>
            )}
            {tab === "prontuario" && (
              <div className="tl">
                {[["12/06", "Ganho de peso acima da faixa; reforçado fracionamento."], ["08/05", "Melhora da disposição; ajuste de ferro."], ["06/03", "Início do 2º trimestre; boa adesão."]].map(([d, t], i) => (
                  <div key={i} className="tl-item"><div className="card pad" style={{ padding: 13 }}><div className="h3 num" style={{ marginBottom: 4 }}>{d}/2026</div><div className="muted" style={{ fontSize: 13 }}>{t}</div></div></div>
                ))}
              </div>
            )}
            {tab === "dados" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Peso atual", "75,3 kg"], ["IMC", "27,0"], ["% Gordura", "29,6%"], ["Objetivo", p.objetivo]].map(([l, v]) => (
                  <div key={l} className="card pad" style={{ padding: 13, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}><Ruler size={13} style={{ verticalAlign: "middle", marginRight: 6 }} />{l}</span>
                    <span className="num" style={{ fontWeight: 600 }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
