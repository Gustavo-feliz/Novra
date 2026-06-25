import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, LayoutDashboard, Users, Camera, ListChecks, Wallet, Star, Video,
  LayoutTemplate, CalendarDays, Link2, Sparkles, MessageCircle, Settings,
  UserPlus, CalendarPlus, CircleUser, Wand2,
} from "lucide-react";
import { PATIENTS } from "../lib/mock";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import { cx, initials } from "../lib/utils";

interface Item { id: string; label: string; icon: typeof Search; run: () => void; hint?: string; }

export function CommandPalette() {
  const nav = useNavigate();
  const [patients] = usePersistentState(LOCAL_KEYS.patients, PATIENTS);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((o) => !o); setQ(""); setSel(0); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const close = () => setOpen(false);
  const goNav = (to: string) => { nav(to); close(); };

  const base: Item[] = [
    { id: "dash", label: "Dashboard", icon: LayoutDashboard, run: () => goNav("/") },
    { id: "pat", label: "Pacientes", icon: Users, run: () => goNav("/patients") },
    { id: "dia", label: "Diários", icon: Camera, run: () => goNav("/diarios") },
    { id: "que", label: "Questionários", icon: ListChecks, run: () => goNav("/questionarios") },
    { id: "fin", label: "Financeiro", icon: Wallet, run: () => goNav("/financeiro") },
    { id: "fav", label: "Meus favoritos", icon: Star, run: () => goNav("/favoritos") },
    { id: "vid", label: "Videochamada", icon: Video, run: () => goNav("/videochamada") },
    { id: "lam", label: "Lâminas", icon: LayoutTemplate, run: () => goNav("/laminas") },
    { id: "age", label: "Agenda", icon: CalendarDays, run: () => goNav("/agenda") },
    { id: "book", label: "Link de agendamento", icon: Link2, run: () => goNav("/agendamento") },
    { id: "cre", label: "Novra Creator", icon: Sparkles, run: () => goNav("/creator") },
    { id: "wa", label: "WhatsApp automático", icon: MessageCircle, run: () => goNav("/whatsapp") },
    { id: "set", label: "Configurações", icon: Settings, run: () => goNav("/settings") },
    { id: "np", label: "Novo paciente", icon: UserPlus, hint: "ação", run: () => goNav("/patients?novo=1") },
    { id: "nc", label: "Nova consulta", icon: CalendarPlus, hint: "ação", run: () => goNav("/agenda?nova=1") },
    { id: "ng", label: "Gerar refeições com IA", icon: Wand2, hint: "ação", run: () => goNav("/creator") },
  ];
  const pacientes: Item[] = patients.map((p) => ({
    id: p.id, label: p.nome, icon: CircleUser, hint: "paciente", run: () => goNav(`/patients/${p.id}`),
  }));
  const all = [...base, ...pacientes];
  const results = q.trim() ? all.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) : all;

  useEffect(() => { if (sel >= results.length) setSel(0); }, [q, results.length, sel]);

  if (!open) return null;
  return (
    <div className="overlay" style={{ alignItems: "flex-start" }} onMouseDown={close}>
      <div className="cmd" style={{ marginTop: "10vh" }} onMouseDown={(e) => e.stopPropagation()}>
        <div className="cmd-in">
          <Search size={18} className="faint" />
          <input
            autoFocus placeholder="Buscar telas, pacientes, ações…" value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
              if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
              if (e.key === "Enter") results[sel]?.run();
            }}
          />
          <span className="kbd">esc</span>
        </div>
        <div className="cmd-list">
          {results.length === 0 && <div className="faint" style={{ padding: 16, fontSize: 13 }}>Nada encontrado.</div>}
          {results.map((it, i) => {
            const I = it.icon;
            const isPat = it.hint === "paciente";
            return (
              <div key={it.id} className={cx("cmd-row", i === sel && "sel")} onMouseEnter={() => setSel(i)} onClick={it.run}>
                {isPat ? <div className="avatar" style={{ width: 22, height: 22, fontSize: 9, borderRadius: 6 }}>{initials(it.label)}</div> : <I size={16} className={i === sel ? "" : "faint"} />}
                <span style={{ flex: 1 }}>{it.label}</span>
                {it.hint && <span className="ck">{it.hint}</span>}
                {i === sel && <span className="ck">↵</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
