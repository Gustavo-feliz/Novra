import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pencil, Send, LayoutTemplate, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card, Button, Chip } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { SLIDES, SLIDE_CATEGORIES } from "../lib/mock";
import type { SlideTemplate } from "../lib/types";
import { cx } from "../lib/utils";

export default function Slides() {
  const toast = useToast();
  const [cat, setCat] = useState("Todas");
  const [present, setPresent] = useState<SlideTemplate | null>(null);
  const [idx, setIdx] = useState(0);

  const filtered = useMemo(() => SLIDES.filter((s) => cat === "Todas" || s.categoria === cat), [cat]);

  const open = (s: SlideTemplate) => { setPresent(s); setIdx(0); };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Lâminas</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Modelos visuais para apresentar ao paciente durante a consulta</div>
        </div>
        <Button variant="primary" onClick={() => toast("Criando nova lâmina")}><Plus size={15} />Nova lâmina</Button>
      </div>

      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 18 }}>
        {SLIDE_CATEGORIES.map((c) => (
          <span key={c} className={cx("chip", cat === c && "sage")} style={{ cursor: "pointer", height: 30 }} onClick={() => setCat(c)}>{c}</span>
        ))}
      </div>

      <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
        {filtered.map((s) => (
          <Card key={s.id} style={{ overflow: "hidden", cursor: "pointer" }} className="slide-card" onClick={() => open(s)}>
            <div style={{ height: 148, background: `linear-gradient(150deg, ${s.cor[0]}, ${s.cor[1]})`, position: "relative", display: "flex", alignItems: "flex-end", padding: 14 }}>
              <div style={{ position: "absolute", top: 12, right: 12, background: "rgba(0,0,0,.3)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20, backdropFilter: "blur(4px)" }} className="num">{s.laminas} lâminas</div>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,.22)", display: "grid", placeItems: "center", color: "#fff" }}><LayoutTemplate size={18} /></div>
            </div>
            <div style={{ padding: 14 }}>
              <div className="h3" style={{ lineHeight: 1.3 }}>{s.titulo}</div>
              <Chip style={{ marginTop: 8 }}>{s.categoria}</Chip>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Button variant="primary" sm style={{ flex: 1 }} onClick={(e) => { e.stopPropagation(); open(s); }}><Play size={13} />Apresentar</Button>
                <Button variant="ghost" sm onClick={(e) => { e.stopPropagation(); toast("Abrindo editor de lâmina"); }}><Pencil size={13} /></Button>
                <Button variant="subtle" sm onClick={(e) => { e.stopPropagation(); toast("Lâmina enviada ao paciente"); }}><Send size={13} /></Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {present && (
        <div className="overlay" onMouseDown={() => setPresent(null)}>
          <div onMouseDown={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 720 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, color: "#fff" }}>
              <div style={{ fontWeight: 600 }}>{present.titulo}</div>
              <button className="iconbtn" onClick={() => setPresent(null)}><X size={17} /></button>
            </div>
            <div style={{ aspectRatio: "16 / 9", borderRadius: 16, background: `linear-gradient(150deg, ${present.cor[0]}, ${present.cor[1]})`, position: "relative", display: "grid", placeItems: "center", boxShadow: "var(--shadow-lg)" }}>
              <div style={{ textAlign: "center", color: "rgba(255,255,255,.96)", padding: 30 }}>
                <div style={{ fontSize: 12, letterSpacing: ".1em", textTransform: "uppercase", opacity: .8, marginBottom: 10 }}>{present.categoria}</div>
                <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: "-.02em", maxWidth: 460 }}>{present.titulo}</div>
                <div className="num" style={{ marginTop: 22, fontSize: 13, opacity: .85 }}>Lâmina {idx + 1} de {present.laminas}</div>
              </div>
              <button className="iconbtn" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0}><ChevronLeft size={18} /></button>
              <button className="iconbtn" style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)" }} onClick={() => setIdx((i) => Math.min(present.laminas - 1, i + 1))} disabled={idx === present.laminas - 1}><ChevronRight size={18} /></button>
            </div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 14 }}>
              {Array.from({ length: present.laminas }).map((_, i) => (
                <button key={i} onClick={() => setIdx(i)} style={{ width: i === idx ? 26 : 8, height: 8, borderRadius: 20, border: "none", cursor: "pointer", background: i === idx ? "#fff" : "rgba(255,255,255,.4)", transition: ".2s" }} />
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
