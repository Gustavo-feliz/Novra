import { useState } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Users, Camera, ListChecks, Wallet, Star, Video,
  LayoutTemplate, CalendarDays, Link2, Sparkles, MessageCircle,
  Salad, Search, Settings, MoreHorizontal, X, LogOut,
} from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Avatar } from "./ui/Avatar";
import { NotificationBell } from "./NotificationBell";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import { cx, logout } from "../lib/utils";
import { CLINIC, DIARIES } from "../lib/mock";

type Item = { to: string; label: string; icon: typeof Search; end?: boolean; badge?: string };

const PRINCIPAL: Item[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/patients", label: "Pacientes", icon: Users },
  { to: "/diarios", label: "Diários", icon: Camera },
  { to: "/questionarios", label: "Questionários", icon: ListChecks },
  { to: "/financeiro", label: "Financeiro", icon: Wallet },
  { to: "/favoritos", label: "Meus favoritos", icon: Star },
  { to: "/videochamada", label: "Videochamada", icon: Video },
  { to: "/laminas", label: "Lâminas", icon: LayoutTemplate },
];

const FERRAMENTAS: Item[] = [
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
  { to: "/agendamento", label: "Link de agendamento", icon: Link2 },
  { to: "/creator", label: "Novra Creator", icon: Sparkles },
  { to: "/whatsapp", label: "WhatsApp", icon: MessageCircle },
];

const BOTTOM: Item[] = [
  { to: "/", label: "Início", icon: LayoutDashboard, end: true },
  { to: "/patients", label: "Pacientes", icon: Users },
  { to: "/diarios", label: "Diários", icon: Camera },
  { to: "/agenda", label: "Agenda", icon: CalendarDays },
];

function NavGroup({ label, items }: { label: string; items: Item[] }) {
  return (
    <>
      <div className="navlbl">{label}</div>
      <nav className="nav">
        {items.map((n) => {
          const I = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx("navitem", isActive && "active")}>
              <I size={16} /><span style={{ flex: 1 }}>{n.label}</span>
              {n.badge && <span className="navbadge">{n.badge}</span>}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}

export function Shell() {
  const nav = useNavigate();
  const loc = useLocation();
  const [more, setMore] = useState(false);
  const [diaries] = usePersistentState(LOCAL_KEYS.diaries, DIARIES);
  const naoRevisados = diaries.filter((d) => !d.revisado).length;
  const principal = PRINCIPAL.map((item) => item.to === "/diarios"
    ? { ...item, badge: naoRevisados > 0 ? String(naoRevisados) : undefined }
    : item);

  return (
    <div style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="topbar" style={topbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, fontWeight: 600, letterSpacing: "-.02em" }}>
          <div className="brand-mark"><Salad size={15} /></div>
          <span className="hide-sm">Novra</span>
        </div>
        <div style={{ flex: 1 }} />
        <button className="kbd-btn hide-sm" onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}>
          <Search size={14} /> Buscar <span className="kbd">⌘K</span>
        </button>
        <NotificationBell audience="clinica" linkKey="clinicLink" onNavigate={nav} />
        <ThemeToggle />
        <button onClick={() => nav("/settings")} style={{ border: "none", background: "none", cursor: "pointer", padding: 0 }} title="Configurações">
          <Avatar initials="VL" size={32} />
        </button>
        <button className="iconbtn" onClick={() => logout(nav)} title="Sair"><LogOut size={16} /></button>
      </header>

      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
        <aside className="app-side">
          <div className="navlbl" style={{ paddingTop: 4 }}>Clínica</div>
          <div className="card pad" style={{ padding: 12, marginBottom: 4, display: "flex", gap: 10, alignItems: "center" }}>
            <div className="brand-mark" style={{ width: 32, height: 32, borderRadius: 9 }}><Salad size={16} /></div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13, letterSpacing: "-.02em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{CLINIC.nutri}</div>
              <div className="faint" style={{ fontSize: 11 }}>{CLINIC.crn}</div>
            </div>
          </div>
          <NavGroup label="Principal" items={principal} />
          <NavGroup label="Ferramentas" items={FERRAMENTAS} />
        </aside>

        <main className="app-main"><Outlet /></main>
      </div>

      <nav className="bottom-nav">
        {BOTTOM.map((n) => {
          const I = n.icon;
          return (
            <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => cx("bn-item", isActive && "on")}>
              <I size={20} /><span>{n.label}</span>
            </NavLink>
          );
        })}
        <button className={cx("bn-item")} onClick={() => setMore(true)} style={{ background: "none", border: "none", cursor: "pointer" }}>
          <MoreHorizontal size={20} /><span>Mais</span>
        </button>
      </nav>

      {more && (
        <div className="sheet-wrap" onMouseDown={() => setMore(false)}>
          <div className="sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 8px 8px" }}>
              <span className="h3">Navegação</span>
              <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => setMore(false)}><X size={16} /></button>
            </div>
            <div className="navlbl">Principal</div>
            <nav className="nav">
              {principal.map((n) => { const I = n.icon; const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
                return <div key={n.to} className={cx("navitem", active && "active")} onClick={() => { nav(n.to); setMore(false); }}><I size={17} /><span style={{ flex: 1 }}>{n.label}</span>{n.badge && <span className="navbadge">{n.badge}</span>}</div>;
              })}
            </nav>
            <div className="navlbl">Ferramentas</div>
            <nav className="nav">
              {FERRAMENTAS.map((n) => { const I = n.icon; const active = loc.pathname.startsWith(n.to);
                return <div key={n.to} className={cx("navitem", active && "active")} onClick={() => { nav(n.to); setMore(false); }}><I size={17} /><span style={{ flex: 1 }}>{n.label}</span></div>;
              })}
              <div className="navitem" onClick={() => { nav("/settings"); setMore(false); }}><Settings size={17} /><span style={{ flex: 1 }}>Configurações</span></div>
              <div className="navitem" onClick={() => logout(nav)}><LogOut size={17} /><span style={{ flex: 1 }}>Sair</span></div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

const topbar: React.CSSProperties = {
  position: "sticky", top: 0, zIndex: 30, height: 58, display: "flex", alignItems: "center", gap: 12, padding: "0 18px",
};
