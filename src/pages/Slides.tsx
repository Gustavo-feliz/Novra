import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pencil, Send, LayoutTemplate, ChevronLeft, ChevronRight, X, Check, Trash2, Lightbulb } from "lucide-react";
import { Card, Button, Chip, Field, Input, Modal } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { SLIDES, SLIDE_CATEGORIES } from "../lib/mock";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import type { SlideContent, SlideTemplate } from "../lib/types";
import { cx, uid } from "../lib/utils";

const CATEGORIAS_FORM = SLIDE_CATEGORIES.filter((c) => c !== "Todas");
const COLOR_PALETTE: [string, string][] = [
  ["#9DB99F", "#6E8C72"], ["#A2C2C9", "#739AA0"], ["#C9A2B0", "#9E7383"],
  ["#E0B48C", "#C98B5A"], ["#9FB6A0", "#6E8C72"], ["#B9A88C", "#8E7B5E"],
];
type LaminaForm = { titulo: string; corpo: string; destaque: string };
const LAMINA_VAZIA: LaminaForm = { titulo: "", corpo: "", destaque: "" };
const FORM_VAZIO = { titulo: "", categoria: CATEGORIAS_FORM[0], cor: COLOR_PALETTE[0], laminas: [{ ...LAMINA_VAZIA }] };

export default function Slides() {
  const toast = useToast();
  const [slides, setSlides] = usePersistentState<SlideTemplate[]>(LOCAL_KEYS.slides, SLIDES);
  const [cat, setCat] = useState("Todas");
  const [present, setPresent] = useState<SlideTemplate | null>(null);
  const [idx, setIdx] = useState(0);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => slides.filter((s) => cat === "Todas" || s.categoria === cat), [slides, cat]);

  const open = (s: SlideTemplate) => { setPresent(s); setIdx(0); };

  useEffect(() => {
    if (!present) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") setIdx((i) => Math.min(present.laminas.length - 1, i + 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(0, i - 1));
      if (e.key === "Escape") setPresent(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [present]);

  const openNew = () => { setForm(FORM_VAZIO); setEditingId(null); setFormOpen(true); };
  const openEdit = (s: SlideTemplate) => {
    setForm({
      titulo: s.titulo, categoria: s.categoria, cor: s.cor,
      laminas: s.laminas.map((l) => ({ titulo: l.titulo, corpo: l.corpo.join("\n"), destaque: l.destaque ?? "" })),
    });
    setEditingId(s.id);
    setFormOpen(true);
  };
  const addLaminaForm = () => setForm({ ...form, laminas: [...form.laminas, { ...LAMINA_VAZIA }] });
  const removeLaminaForm = (i: number) => setForm({ ...form, laminas: form.laminas.length > 1 ? form.laminas.filter((_, x) => x !== i) : form.laminas });
  const updateLaminaForm = (i: number, patch: Partial<LaminaForm>) => setForm({ ...form, laminas: form.laminas.map((l, x) => x === i ? { ...l, ...patch } : l) });

  const salvar = () => {
    const titulo = form.titulo.trim();
    const laminasValidas = form.laminas.filter((l) => l.titulo.trim());
    if (!titulo || laminasValidas.length === 0) return;
    const laminas: SlideContent[] = laminasValidas.map((l) => ({
      titulo: l.titulo.trim(),
      corpo: l.corpo.split("\n").map((x) => x.trim()).filter(Boolean),
      destaque: l.destaque.trim() || undefined,
    }));
    if (editingId) {
      setSlides(slides.map((s) => s.id === editingId ? { ...s, titulo, categoria: form.categoria, cor: form.cor, laminas } : s));
      toast("Lâmina atualizada");
    } else {
      setSlides([{ id: uid(), titulo, categoria: form.categoria, cor: form.cor, laminas }, ...slides]);
      toast("Lâmina criada");
    }
    setFormOpen(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Lâminas</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Modelos visuais com conteúdo pronto para apresentar ao paciente durante a consulta</div>
        </div>
        <Button variant="primary" onClick={openNew}><Plus size={15} />Nova lâmina</Button>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {SLIDE_CATEGORIES.map((c) => (
          <span key={c} className={cx("chip", cat === c && "sage")} style={{ cursor: "pointer", height: 30 }} onClick={() => setCat(c)}>{c}</span>
        ))}
      </div>

      <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filtered.map((s) => (
          <Card key={s.id} style={{ overflow: "hidden", cursor: "pointer" }} className="slide-card" onClick={() => open(s)}>
            <div style={{ height: 148, background: `linear-gradient(150deg, ${s.cor[0]}, ${s.cor[1]})`, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "#fff" }}><LayoutTemplate size={18} /></div>
                <div style={{ background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, backdropFilter: "blur(4px)", height: "fit-content" }} className="num">{s.laminas.length} lâminas</div>
              </div>
              <div style={{ color: "rgba(255,255,255,.92)", fontSize: 12.5, lineHeight: 1.4 }}>{s.laminas[0]?.titulo}</div>
            </div>
            <div style={{ padding: 14 }}>
              <div className="h3" style={{ lineHeight: 1.3 }}>{s.titulo}</div>
              <Chip style={{ marginTop: 8 }}>{s.categoria}</Chip>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button variant="primary" sm style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); open(s); }}><Play size={13} />Apresentar</Button>
                <Button variant="ghost" sm onClick={(e) => { e.stopPropagation(); openEdit(s); }}><Pencil size={13} /></Button>
                <Button variant="subtle" sm onClick={(e) => { e.stopPropagation(); toast("Lâmina enviada ao paciente"); }}><Send size={13} /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {present && (() => {
        const slideAtual = present.laminas[idx];
        return (
          <div className="overlay" onMouseDown={() => setPresent(null)}>
            <div onMouseDown={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 760 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, color: "#fff" }}>
                <div style={{ fontWeight: 600 }}>{present.titulo}</div>
                <button className="iconbtn" onClick={() => setPresent(null)}><X size={17} /></button>
              </div>
              <div style={{ aspectRatio: "16 / 9", borderRadius: 16, background: `linear-gradient(150deg, ${present.cor[0]}, ${present.cor[1]})`, position: "relative", boxShadow: "var(--shadow-lg)", color: "#fff", padding: "clamp(24px, 5vw, 48px) clamp(28px, 7vw, 58px)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
                <span style={{ fontSize: 12, letterSpacing: ".12em", textTransform: "uppercase", opacity: .75, flexShrink: 0 }}>{present.categoria}</span>
                <div style={{ fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 700, letterSpacing: "-.02em", margin: "10px 0 20px", maxWidth: 560, flexShrink: 0 }}>{slideAtual.titulo}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12, overflowY: "auto" }}>
                  {slideAtual.corpo.map((linha, i) => (
                    <div key={i} style={{ display: "flex", gap: 11, alignItems: "flex-start", fontSize: "clamp(13px, 1.6vw, 15.5px)", lineHeight: 1.45, maxWidth: 580 }}>
                      <span style={{ width: 7, height: 7, borderRadius: 99, background: "rgba(255,255,255,.85)", marginTop: 8, flexShrink: 0 }} />
                      <span style={{ opacity: .97 }}>{linha}</span>
                    </div>
                  ))}
                </div>
                {slideAtual.destaque && (
                  <div style={{ marginTop: "auto", paddingTop: 16, flexShrink: 0 }}>
                    <div style={{ padding: "10px 15px", borderRadius: 12, background: "rgba(255,255,255,.16)", fontSize: 13, fontWeight: 500, display: "flex", gap: 9, alignItems: "flex-start", maxWidth: 480 }}>
                      <Lightbulb size={15} style={{ flexShrink: 0, marginTop: 1 }} />
                      <span>{slideAtual.destaque}</span>
                    </div>
                  </div>
                )}
                <div className="num" style={{ position: "absolute", bottom: 16, right: 20, fontSize: 12, opacity: .7 }}>{idx + 1} / {present.laminas.length}</div>
                <button className="iconbtn" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}><ChevronLeft size={18} /></button>
                <button className="iconbtn" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} onClick={() => setIdx((i) => Math.min(present.laminas.length - 1, i + 1))} disabled={idx === present.laminas.length - 1}><ChevronRight size={18} /></button>
              </div>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
                {present.laminas.map((_, i) => (
                  <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 26 : 8, height: 8, borderRadius: 20, border: "none", cursor: "pointer", background: i === idx ? "#fff" : "rgba(255,255,255,.4)", transition: ".2s" }} />
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {formOpen && (
        <Modal title={editingId ? "Editar lâmina" : "Nova lâmina"} sub={editingId ? "Atualize os dados desse modelo" : "Crie um novo modelo de apresentação"} onClose={() => setFormOpen(false)} max={620}
          footer={<>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancelar</Button>
            <Button variant="primary" disabled={!form.titulo.trim() || !form.laminas.some((l) => l.titulo.trim())} onClick={salvar}><Check size={15} />{editingId ? "Salvar alterações" : "Criar lâmina"}</Button>
          </>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Field label="Título do conjunto">
              <Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex.: Como montar um prato equilibrado" />
            </Field>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, alignItems: "end" }}>
              <Field label="Categoria">
                <select className="select" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS_FORM.map((c) => <option key={c}>{c}</option>)}
                </select>
              </Field>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Cor</div>
                <div style={{ display: "flex", gap: 7 }}>
                  {COLOR_PALETTE.map((c, i) => (
                    <button key={i} type="button" onClick={() => setForm({ ...form, cor: c })}
                      style={{ width: 28, height: 28, borderRadius: 9, background: `linear-gradient(150deg, ${c[0]}, ${c[1]})`, border: form.cor === c ? "2px solid var(--text)" : "2px solid transparent", cursor: "pointer", display: "grid", placeItems: "center" }}>
                      {form.cor === c && <Check size={12} color="#fff" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="eyebrow" style={{ marginBottom: 9 }}>Lâminas (slides)</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 340, overflowY: "auto", paddingRight: 2 }}>
                {form.laminas.map((l, i) => (
                  <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, padding: 12, display: "flex", flexDirection: "column", gap: 8, background: "var(--surface2)" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="chip" style={{ height: 22 }}>Lâmina {i + 1}</span>
                      <div style={{ flex: 1 }} />
                      <button className="iconbtn" style={{ width: 28, height: 28 }} onClick={() => removeLaminaForm(i)} disabled={form.laminas.length === 1}><Trash2 size={13} /></button>
                    </div>
                    <input className="input" placeholder="Título da lâmina" value={l.titulo} onChange={(e) => updateLaminaForm(i, { titulo: e.currentTarget.value })} />
                    <textarea className="input" rows={3} placeholder="Conteúdo — um tópico por linha" value={l.corpo} onChange={(e) => updateLaminaForm(i, { corpo: e.currentTarget.value })} />
                    <input className="input" placeholder="Destaque opcional (dica ou resumo)" value={l.destaque} onChange={(e) => updateLaminaForm(i, { destaque: e.currentTarget.value })} />
                  </div>
                ))}
              </div>
              <button className="btn subtle sm" style={{ marginTop: 9 }} onClick={addLaminaForm}><Plus size={13} />Adicionar lâmina</button>
            </div>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}
