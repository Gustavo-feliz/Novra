import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Cake, CheckCircle2, Bell, Heart, Star, Pencil, Plus, Smartphone, Check } from "lucide-react";
import { Card, Button, Chip, Toggle, Modal, Textarea } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { WHATS_AUTOMATIONS, CLINIC } from "../lib/mock";
import { LOCAL_KEYS, type WhatsQueueItem, usePersistentState } from "../lib/localData";
import type { WhatsAutomation } from "../lib/types";
import { num, uid } from "../lib/utils";

const ICONS = { cake: Cake, check: CheckCircle2, bell: Bell, heart: Heart, star: Star };
const VARS = ["{nome}", "{nutri}", "{clinica}", "{data}", "{hora}", "{link}"];

function preview(t: string) {
  return t
    .replace(/{nome}/g, "Beatriz")
    .replace(/{nutri}/g, CLINIC.nutri)
    .replace(/{clinica}/g, CLINIC.nome)
    .replace(/{data}/g, "18/06")
    .replace(/{hora}/g, "14:00")
    .replace(/{link}/g, "nutriflow.app/sala/bn");
}

export default function WhatsApp() {
  const toast = useToast();
  const [list, setList] = usePersistentState<WhatsAutomation[]>(LOCAL_KEYS.whatsAutomations, WHATS_AUTOMATIONS);
  const [queue, setQueue] = usePersistentState<WhatsQueueItem[]>(LOCAL_KEYS.whatsQueue, []);
  const [edit, setEdit] = useState<WhatsAutomation | null>(null);
  const [draft, setDraft] = useState("");

  const toggle = (id: string) => setList(list.map((a) => a.id === id ? { ...a, ativo: !a.ativo } : a));
  const ativas = list.filter((a) => a.ativo).length;
  const total = list.reduce((a, x) => a + x.enviadas, 0);

  const save = () => {
    if (!edit) return;
    setList(list.map((a) => a.id === edit.id ? { ...a, template: draft } : a));
    setEdit(null); toast("Modelo de mensagem salvo");
  };
  const simulateSend = (automation: WhatsAutomation) => {
    const item: WhatsQueueItem = { id: uid(), automacao: automation.nome, paciente: "Mariana Costa", canal: "WhatsApp", quando: "Agora", status: "enviado" };
    setQueue([item, ...queue]);
    setList(list.map((a) => a.id === automation.id ? { ...a, enviadas: a.enviadas + 1 } : a));
    toast("Mensagem enviada e registrada na fila");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">WhatsApp automático</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Disparos automáticos de aniversário, confirmação e lembretes</div>
        </div>
        <Button variant="primary" onClick={() => toast("Nova automação")}><Plus size={15} />Nova automação</Button>
      </div>

      <div className="grow grow-resp" style={{ marginBottom: 18 }}>
        <Card pad style={{ flex: 2, minWidth: 240, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Smartphone size={20} color="var(--sage)" /></div>
          <div style={{ flex: 1 }}>
            <div className="h3" style={{ fontSize: 13 }}>Número conectado</div>
            <div className="num muted" style={{ fontSize: 13 }}>+55 21 99876-5432</div>
          </div>
          <Chip tone="sage"><span style={{ width: 7, height: 7, borderRadius: 99, background: "var(--sage)", display: "inline-block" }} />Conectado</Chip>
        </Card>
        <Card pad style={{ flex: 1, minWidth: 130 }}><div className="faint" style={{ fontSize: 11.5 }}>Automações ativas</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{ativas}<span className="faint" style={{ fontSize: 14 }}>/{list.length}</span></div></Card>
        <Card pad style={{ flex: 1, minWidth: 130 }}><div className="faint" style={{ fontSize: 11.5 }}>Enviadas no mês</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{num(total)}</div></Card>
        <Card pad style={{ flex: 1, minWidth: 130 }}><div className="faint" style={{ fontSize: 11.5 }}>Fila local</div><div className="num" style={{ fontSize: 24, fontWeight: 600, marginTop: 4 }}>{queue.length}</div></Card>
      </div>

      <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
        {list.map((a) => {
          const Icon = ICONS[a.icon];
          return (
            <Card key={a.id} pad style={{ display: "flex", flexDirection: "column", gap: 12, opacity: a.ativo ? 1 : .72 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 11, background: a.ativo ? "var(--sage-soft)" : "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} color={a.ativo ? "var(--sage)" : "var(--faint)"} /></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="h3">{a.nome}</div>
                  <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{a.gatilho}</div>
                </div>
                <Toggle on={a.ativo} onClick={() => toggle(a.id)} />
              </div>
              <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "10px 12px", fontSize: 12.5, lineHeight: 1.5, color: "var(--muted)" }}>
                {a.template.length > 110 ? a.template.slice(0, 110) + "…" : a.template}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 2 }}>
                <Chip><Bell size={11} />{a.quando}</Chip>
                <span className="faint num" style={{ fontSize: 11.5 }}>{a.enviadas} enviadas</span>
                <Button variant="subtle" sm style={{ marginLeft: "auto" }} onClick={() => simulateSend(a)}>Testar envio</Button>
                <Button variant="subtle" sm onClick={() => { setEdit(a); setDraft(a.template); }}><Pencil size={13} />Editar</Button>
              </div>
            </Card>
          );
        })}
      </div>

      {queue.length > 0 && (
        <Card pad style={{ marginTop: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <span className="eyebrow">Historico de disparos</span>
            <Button sm variant="subtle" onClick={() => setQueue([])}>Limpar fila</Button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {queue.slice(0, 6).map((item) => (
              <div key={item.id} style={{ display: "flex", gap: 10, alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
                <MessageCircle size={15} color="var(--sage)" />
                <div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 12.5 }}>{item.automacao}</div><div className="faint" style={{ fontSize: 11.5 }}>{item.paciente} · {item.quando}</div></div>
                <span className="chip sage">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {edit && (
        <Modal title={edit.nome} sub={edit.gatilho} onClose={() => setEdit(null)} max={560}
          footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancelar</Button><Button variant="primary" onClick={save}><Check size={15} />Salvar modelo</Button></>}>
          <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Variáveis disponíveis</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
            {VARS.map((v) => (
              <span key={v} className="chip" style={{ cursor: "pointer", height: 26 }} onClick={() => setDraft(draft + " " + v)}>{v}</span>
            ))}
          </div>
          <Textarea rows={4} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Escreva o modelo da mensagem…" />
          <div className="eyebrow" style={{ margin: "18px 0 8px" }}>Pré-visualização</div>
          <div style={{ background: "var(--surface2)", borderRadius: 14, padding: 16, display: "flex", justifyContent: "flex-end" }}>
            <div style={{ maxWidth: "85%", background: "linear-gradient(150deg, #25D366, #128C7E)", color: "#fff", borderRadius: "14px 14px 4px 14px", padding: "10px 13px", fontSize: 13.5, lineHeight: 1.5, boxShadow: "0 4px 14px -6px rgba(18,140,126,.6)" }}>
              {preview(draft)}
              <div style={{ textAlign: "right", fontSize: 10, opacity: .8, marginTop: 4 }}>09:00 ✓✓</div>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
