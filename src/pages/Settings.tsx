import { useState } from "react";
import { motion } from "framer-motion";
import { Salad, Upload, Check, UserPlus, Crown, Link2, Copy } from "lucide-react";
import { Card, Button, Segmented, Field, Input, Chip, Avatar } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { CLINIC } from "../lib/mock";
import { cx } from "../lib/utils";

const INVITE_URL = "novra.app/convite";

const SWATCHES = ["78 110 87", "188 98 66", "62 124 140", "120 86 140", "183 137 47", "60 86 69"];
const TEAM = [
  { nome: "Vanessa da Luz", papel: "Administradora", email: "vanessa@novra.app", inic: "VL" },
  { nome: "Camila Restani", papel: "Nutricionista", email: "camila@novra.app", inic: "CR" },
];
const PLANS = [
  { nome: "Trial", preco: "Grátis", desc: "14 dias · todas as funções", atual: false },
  { nome: "Individual", preco: "R$ 89/mês", desc: "1 nutricionista · pacientes ilimitados", atual: true },
  { nome: "Clínica", preco: "R$ 249/mês", desc: "Até 6 nutricionistas · multi-agenda", atual: false },
];

export default function Settings() {
  const toast = useToast();
  const [tab, setTab] = useState<"marca" | "equipe" | "assinatura">("marca");
  const [cor, setCor] = useState(SWATCHES[0]);
  const [nome, setNome] = useState(CLINIC.nome);
  const [copied, setCopied] = useState(false);

  const copyInvite = () => {
    navigator.clipboard?.writeText(`https://${INVITE_URL}`);
    setCopied(true);
    toast("Link de cadastro copiado");
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div className="h1" style={{ marginBottom: 4 }}>Configurações</div>
      <div className="muted" style={{ fontSize: 13, marginBottom: 18 }}>Marca, equipe e assinatura da clínica.</div>

      <Card pad style={{ marginBottom: 18 }}>
        <span className="eyebrow">Convite de cadastro do paciente</span>
        <div className="faint" style={{ fontSize: 12, marginTop: 4, marginBottom: 12 }}>Envie esse link para o paciente (WhatsApp, e-mail etc). Ele se cadastra com os próprios dados e já entra direto no portal dele.</div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 10, padding: "0 12px", height: 38 }}>
            <Link2 size={15} className="faint" />
            <span className="num" style={{ fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{INVITE_URL}</span>
          </div>
          <Button variant="primary" onClick={copyInvite}>{copied ? <Check size={15} /> : <Copy size={15} />}{copied ? "Copiado" : "Copiar"}</Button>
        </div>
      </Card>

      <Segmented value={tab} onChange={setTab} options={[{ value: "marca", label: "Marca" }, { value: "equipe", label: "Equipe" }, { value: "assinatura", label: "Assinatura" }]} style={{ marginBottom: 18 }} />

      {tab === "marca" && (
        <div className="gcol gcol-resp" style={{ gridTemplateColumns: "1fr 360px" }}>
          <Card pad>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Identidade da clínica</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <Field label="Nome exibido em relatórios e na área do paciente"><Input value={nome} onChange={(e) => setNome(e.target.value)} /></Field>
              <div className="field">
                <label>Logotipo</label>
                <div className="upload" onClick={() => toast("Selecione um arquivo PNG/SVG")}><Upload size={20} style={{ marginBottom: 6 }} /><div style={{ fontSize: 13, fontWeight: 600 }}>Enviar logo</div><div className="faint" style={{ fontSize: 11.5, marginTop: 2 }}>PNG ou SVG, fundo transparente</div></div>
              </div>
              <div className="field">
                <label>Cor principal</label>
                <div style={{ display: "flex", gap: 9 }}>
                  {SWATCHES.map((s) => (
                    <button key={s} onClick={() => setCor(s)} style={{ width: 34, height: 34, borderRadius: 10, background: `rgb(${s})`, border: cor === s ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                      {cor === s && <Check size={15} color="#fff" />}
                    </button>
                  ))}
                </div>
              </div>
              <Button variant="primary" style={{ alignSelf: "flex-start" }} onClick={() => toast("Identidade salva")}>Salvar alterações</Button>
            </div>
          </Card>
          <Card pad>
            <div className="eyebrow" style={{ marginBottom: 14 }}>Pré-visualização</div>
            <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ height: 70, background: `linear-gradient(150deg, rgb(${cor}), rgb(${cor} / .7))`, display: "flex", alignItems: "center", gap: 10, padding: "0 16px", color: "#fff" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(255,255,255,.2)", display: "grid", placeItems: "center" }}><Salad size={17} /></div>
                <div style={{ fontWeight: 600, letterSpacing: "-.02em" }}>{nome}</div>
              </div>
              <div style={{ padding: 16 }}>
                <div className="h3">Área do paciente</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>Assim seus pacientes veem a sua marca nos relatórios e no diário alimentar.</div>
                <button className="btn sm" style={{ marginTop: 12, background: `rgb(${cor})`, color: "#fff" }}>Botão de exemplo</button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {tab === "equipe" && (
        <Card pad>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span className="eyebrow">Nutricionistas da clínica</span>
            <Button variant="ghost" sm onClick={() => toast("Convite enviado por e-mail")}><UserPlus size={14} />Convidar</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {TEAM.map((m, i) => (
              <div key={m.email} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <Avatar initials={m.inic} size={38} />
                <div style={{ flex: 1, minWidth: 0 }}><div className="h3">{m.nome}</div><div className="faint" style={{ fontSize: 12 }}>{m.email}</div></div>
                <Chip tone={m.papel === "Administradora" ? "sage" : ""}>{m.papel}</Chip>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === "assinatura" && (
        <div className="gcol gcol-resp" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
          {PLANS.map((pl) => (
            <Card pad key={pl.nome} style={{ border: pl.atual ? "1.5px solid var(--sage)" : undefined, position: "relative" }}>
              {pl.atual && <Chip tone="sage" style={{ position: "absolute", top: 14, right: 14 }}><Crown size={11} />Plano atual</Chip>}
              <div className="h3" style={{ fontSize: 14 }}>{pl.nome}</div>
              <div className="num" style={{ fontSize: 26, fontWeight: 600, margin: "8px 0 4px" }}>{pl.preco}</div>
              <div className="muted" style={{ fontSize: 12.5, minHeight: 34 }}>{pl.desc}</div>
              <Button variant={pl.atual ? "subtle" : "primary"} style={{ width: "100%", marginTop: 12 }} disabled={pl.atual} onClick={() => toast(`Mudando para o plano ${pl.nome}`)}>
                {pl.atual ? "Em uso" : "Selecionar"}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
