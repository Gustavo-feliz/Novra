import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Salad, ArrowRight, ArrowLeft, Check, Upload, Building2, Palette, UserPlus } from "lucide-react";
import { Field, Input, Button } from "../components/ui";
import { cx } from "../lib/utils";
import { startSession } from "../lib/auth";

const SWATCHES = ["78 110 87", "188 98 66", "62 124 140", "120 86 140", "183 137 47"];
const STEPS = [
  { icon: Building2, t: "Sua clínica" },
  { icon: Palette, t: "Identidade" },
  { icon: UserPlus, t: "1º paciente" },
];

export default function Onboarding() {
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [cor, setCor] = useState(SWATCHES[0]);
  const [clinic, setClinic] = useState({ nome: "", crn: "", cidade: "" });
  const [pac, setPac] = useState({ nome: "", objetivo: "Emagrecimento" });

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ width: "100%", maxWidth: 540, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
          <div className="brand-mark"><Salad size={15} /></div>
          <span style={{ fontWeight: 600, letterSpacing: "-.02em" }}>Configurar NutriFlow</span>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 26 }}>
          {STEPS.map((s, i) => {
            const I = s.icon;
            const done = i < step, cur = i === step;
            return (
              <div key={i} style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 9, display: "grid", placeItems: "center", flexShrink: 0,
                    background: done || cur ? "var(--sage)" : "var(--surface2)", color: done || cur ? "#fff" : "var(--faint)",
                    border: "1px solid var(--border)" }}>
                    {done ? <Check size={14} /> : <I size={14} />}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: cur ? "var(--text)" : "var(--faint)" }} className="hide-sm">{s.t}</span>
                </div>
                <div className="bar" style={{ marginTop: 8 }}><i style={{ width: done ? "100%" : cur ? "50%" : "0%" }} /></div>
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .22 }}>
            {step === 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><div className="h2">Dados da clínica</div><p className="muted" style={{ fontSize: 13, marginTop: 3 }}>Aparecem em relatórios, recibos e atestados.</p></div>
                <Field label="Nome da clínica ou profissional"><Input value={clinic.nome} onChange={(e) => setClinic({ ...clinic, nome: e.target.value })} placeholder="Ex.: Vanessa da Luz · Nutrição" /></Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="CRN"><Input value={clinic.crn} onChange={(e) => setClinic({ ...clinic, crn: e.target.value })} placeholder="CRN-4 00000000" /></Field>
                  <Field label="Cidade"><Input value={clinic.cidade} onChange={(e) => setClinic({ ...clinic, cidade: e.target.value })} placeholder="Rio de Janeiro · RJ" /></Field>
                </div>
              </div>
            )}
            {step === 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div><div className="h2">Identidade visual</div><p className="muted" style={{ fontSize: 13, marginTop: 3 }}>Escolha a cor e o logotipo da sua marca.</p></div>
                <div className="field"><label>Cor principal</label>
                  <div style={{ display: "flex", gap: 9 }}>
                    {SWATCHES.map((s) => (
                      <button key={s} onClick={() => setCor(s)} style={{ width: 36, height: 36, borderRadius: 10, background: `rgb(${s})`, border: cor === s ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                        {cor === s && <Check size={16} color="#fff" />}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="upload"><Upload size={20} style={{ marginBottom: 6 }} /><div style={{ fontSize: 13, fontWeight: 600 }}>Enviar logotipo</div><div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>opcional · PNG ou SVG</div></div>
              </div>
            )}
            {step === 2 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div><div className="h2">Cadastre seu primeiro paciente</div><p className="muted" style={{ fontSize: 13, marginTop: 3 }}>Você pode pular e fazer isso depois.</p></div>
                <Field label="Nome do paciente"><Input value={pac.nome} onChange={(e) => setPac({ ...pac, nome: e.target.value })} placeholder="Ex.: Ana Beatriz Souza" /></Field>
                <Field label="Objetivo">
                  <select className="select" value={pac.objetivo} onChange={(e) => setPac({ ...pac, objetivo: e.target.value })}>
                    {["Emagrecimento", "Hipertrofia", "Gestacional", "Esportivo", "Clínico", "Infantil"].map((o) => <option key={o}>{o}</option>)}
                  </select>
                </Field>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 26 }}>
          <Button variant="subtle" onClick={() => (step === 0 ? nav("/login") : setStep(step - 1))}>
            <ArrowLeft size={15} />{step === 0 ? "Voltar" : "Anterior"}
          </Button>
          {step < 2 ? (
            <Button variant="primary" onClick={() => setStep(step + 1)}>Continuar <ArrowRight size={15} /></Button>
          ) : (
            <Button variant="primary" onClick={() => { startSession("nutritionist", true); nav("/"); }}>Concluir e abrir painel <Check size={15} /></Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
