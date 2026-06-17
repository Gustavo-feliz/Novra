import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Salad, FileText, BookOpen, ListChecks, Send, Plus } from "lucide-react";
import { Card, Button, Segmented } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { FAVORITES } from "../lib/mock";

type Tab = "alimentos" | "planos" | "instrucoes" | "questionarios";
const META: Record<Tab, { label: string; icon: typeof Star; tone: string }> = {
  alimentos: { label: "Alimentos", icon: Salad, tone: "var(--sage)" },
  planos: { label: "Planos alimentares", icon: FileText, tone: "var(--blue)" },
  instrucoes: { label: "Instruções", icon: BookOpen, tone: "var(--amber)" },
  questionarios: { label: "Questionários", icon: ListChecks, tone: "var(--terra)" },
};

export default function Favorites() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("alimentos");
  const [favs, setFavs] = useState(FAVORITES);

  const items = favs[tab];
  const Icon = META[tab].icon;

  const remove = (i: number) => { setFavs({ ...favs, [tab]: items.filter((_, j) => j !== i) }); toast("Removido dos favoritos"); };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 14, marginBottom: 18 }}>
        <div>
          <div className="h1">Meus favoritos</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>Itens marcados com ★ para acesso rápido na hora de prescrever</div>
        </div>
      </div>

      <div style={{ marginBottom: 18 }}>
        <Segmented<Tab>
          value={tab} onChange={setTab}
          options={(Object.keys(META) as Tab[]).map((k) => ({ value: k, label: `${META[k].label} · ${favs[k].length}` }))}
        />
      </div>

      {items.length === 0 ? (
        <Card pad style={{ textAlign: "center", padding: "48px 20px" }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--sage-soft)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}><Star size={26} color="var(--sage)" /></div>
          <div className="h3">Nenhum favorito em {META[tab].label.toLowerCase()}</div>
          <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Toque na estrela em qualquer item para guardá-lo aqui.</div>
        </Card>
      ) : (
        <div className="gcol" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
          {items.map((it, i) => (
            <Card key={i} pad style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--surface2)", display: "grid", placeItems: "center", flexShrink: 0 }}><Icon size={18} color={META[tab].tone} /></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="h3" style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{it.nome}</div>
                <div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{it.info}</div>
              </div>
              <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => remove(i)} title="Remover dos favoritos">
                <Star size={16} fill="var(--amber)" color="var(--amber)" />
              </button>
              <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={() => toast(tab === "questionarios" ? "Questionário enviado" : tab === "instrucoes" ? "Material enviado" : "Adicionado ao plano atual")}>
                {tab === "alimentos" || tab === "planos" ? <Plus size={16} /> : <Send size={15} />}
              </button>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
