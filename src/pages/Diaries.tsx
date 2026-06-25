import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Heart, MessageCircle, Send, Camera, Stethoscope, Check, X } from "lucide-react";
import { Card, Avatar, Chip, Segmented, Input, Button } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { pushEvent } from "../lib/events";
import type { DiaryPost } from "../lib/types";
import { initials, cx } from "../lib/utils";
import { listDiaries, updateDiary } from "../lib/db";

type Filter = "todos" | "novos" | "revisados";

export default function Diaries() {
  const nav = useNavigate();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("todos");
  const [posts, setPosts] = useState<DiaryPost[]>([]);
  const [viewer, setViewer] = useState<DiaryPost | null>(null);
  const [draft, setDraft] = useState("");

  const filtered = useMemo(() => posts.filter((d) =>
    (filter === "todos" || (filter === "novos" ? !d.revisado : d.revisado)) &&
    (d.paciente.toLowerCase().includes(q.toLowerCase()) || d.refeicao.toLowerCase().includes(q.toLowerCase()))
  ), [posts, q, filter]);

  const naoRevisados = posts.filter((d) => !d.revisado).length;

  useEffect(() => { listDiaries().then(setPosts).catch(() => toast("Erro ao carregar diários")); }, []);

  const toggleLike = async (id: string) => {
    const target = posts.find((d) => d.id === id);
    if (!target) return;
    try {
      const updated = await updateDiary(id, { curtido: !target.curtido, reacoes: target.reacoes + (target.curtido ? -1 : 1), revisado: true });
      setPosts(posts.map((d) => d.id === id ? updated : d));
      setViewer((v) => v && v.id === id ? updated : v);
    } catch {
      toast("Erro ao atualizar diário");
    }
  };

  const sendComment = async (id: string, txt: string) => {
    if (!txt.trim()) return;
    const target = posts.find((d) => d.id === id);
    if (!target) return;
    const mensagem = { autor: "Você", texto: txt.trim(), quando: "Agora" };
    try {
      const updated = await updateDiary(id, { comentarios: target.comentarios + 1, revisado: true, mensagens: [...(target.mensagens ?? []), mensagem] });
      setPosts(posts.map((d) => d.id === id ? updated : d));
      setViewer(updated);
    } catch {
      toast("Erro ao enviar mensagem");
      return;
    }
    setDraft("");
    toast("Mensagem enviada ao paciente");
    pushEvent({
      tipo: "mensagem",
      titulo: `Nutricionista comentou sua refeição (${target.refeicao})`,
      detalhe: mensagem.texto,
      audiencia: "paciente",
      patientId: target.pacienteId,
      portalLink: "diario",
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Diários</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
            {naoRevisados > 0 ? <>{naoRevisados} registro{naoRevisados > 1 ? "s" : ""} aguardando seu feedback</> : "Todos os registros foram revisados ✓"}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={16} className="faint" style={{ position: "absolute", left: 12, top: 11 }} />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por paciente ou refeição…" style={{ paddingLeft: 36 }} />
        </div>
        <Segmented<Filter>
          value={filter} onChange={setFilter}
          options={[{ value: "todos", label: "Todos" }, { value: "novos", label: `Não revisados${naoRevisados ? ` · ${naoRevisados}` : ""}` }, { value: "revisados", label: "Revisados" }]}
        />
      </div>

      {filtered.length === 0 ? (
        <Card pad style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--sage-soft)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Camera size={26} color="var(--sage)" /></div>
          <div className="h3">Nenhum registro por aqui</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Quando seus pacientes postarem refeições, elas aparecem aqui para você reagir e comentar.</div>
        </Card>
      ) : (
        <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
          {filtered.map((d) => (
            <div key={d.id} className="diary" onClick={() => { setViewer(d); setDraft(""); }}>
              <div className="diary-img" style={{ background: `linear-gradient(150deg, ${d.cor[0]}, ${d.cor[1]})`, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span className="t">{d.refeicao}</span>
                  {!d.revisado && <span className="chip terra" style={{ height: 21, background: "rgba(255,255,255,.9)", color: "var(--terra)" }}>novo</span>}
                </div>
                <span className="t" style={{ alignSelf: "flex-start" }}>{d.quando}</span>
              </div>
              <div className="diary-bd">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initials={initials(d.paciente)} size={24} gradient={d.cor} />
                  <span className="h3" style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{d.paciente}</span>
                </div>
                <div className="diary-ft">
                  <span><Heart size={12} fill={d.curtido ? "var(--terra)" : "none"} color={d.curtido ? "var(--terra)" : "currentColor"} />{d.reacoes}</span>
                  <span><MessageCircle size={12} />{d.comentarios}</span>
                  {d.revisado && <span style={{ marginLeft: "auto", color: "var(--sage)" }}><Check size={13} /></span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {viewer && (
        <div className="overlay" onMouseDown={() => setViewer(null)}>
          <div className="modal" style={{ maxWidth: 460 }} onMouseDown={(e) => e.stopPropagation()}>
            <div className="modal-h">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Avatar initials={initials(viewer.paciente)} size={34} gradient={viewer.cor} />
                <div><div className="h3">{viewer.paciente}</div><div className="faint" style={{ fontSize: 11.5 }}>{viewer.refeicao} · {viewer.quando}</div></div>
              </div>
              <button className="iconbtn" onClick={() => setViewer(null)}><X size={17} /></button>
            </div>
            <div className="modal-b">
              <div style={{ height: 220, borderRadius: 12, background: `linear-gradient(150deg, ${viewer.cor[0]}, ${viewer.cor[1]})`, marginBottom: 14 }} />
              <div style={{ fontSize: 14, lineHeight: 1.6 }}>{viewer.desc}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                <Button variant="subtle" sm onClick={() => toggleLike(viewer.id)}>
                  <Heart size={14} fill={viewer.curtido ? "var(--terra)" : "none"} color={viewer.curtido ? "var(--terra)" : "currentColor"} />{viewer.reacoes}
                </Button>
                <Button variant="subtle" sm onClick={() => nav(`/patients/${viewer.pacienteId}`)}><Stethoscope size={14} />Abrir paciente</Button>
              </div>

              {(viewer.mensagens?.length ?? 0) > 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
                  {viewer.mensagens!.map((m, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Stethoscope size={13} color="var(--sage)" /></div>
                      <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "8px 11px", fontSize: 13, flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><b style={{ fontSize: 12 }}>{m.autor}</b><span className="faint" style={{ fontSize: 10.5 }}>{m.quando}</span></div>
                        <div style={{ marginTop: 2 }}>{m.texto}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <Input autoFocus placeholder="Comentar como nutricionista…" value={draft} onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") sendComment(viewer.id, draft); }} />
                <Button variant="primary" onClick={() => sendComment(viewer.id, draft)}><Send size={15} /></Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
