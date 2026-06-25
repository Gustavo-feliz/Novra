import { useState, useMemo, useEffect, useRef, type ReactNode } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../lib/theme";
import { useToast } from "../components/ui/Toast";
import { PORTAL_ACCESS, REFEICOES_PADRAO, HORARIOS_PADRAO, PORTAL_GOALS, QUESTIONARIOS_SEED, WEEKDAYS } from "../lib/mock";
import { LOCAL_KEYS, usePersistentState } from "../lib/localData";
import { useStreak } from "../lib/engagement";
import { pushEvent } from "../lib/events";
import { NotificationBell } from "../components/NotificationBell";
import { cx, brl, uid, initials, pct, logout, calcularIdade } from "../lib/utils";
import type { Patient, Appointment, PatientPlan, PortalQuestionnaire } from "../lib/types";
import { analyzePatient, generatePlan, ACTIVITY_LABELS, type ActivityLevel, type Sexo, type Objetivo, type GeneratedPlan } from "../lib/nutrition";
import { trainWeightForecast, type Forecast } from "../lib/ml";
import { listPatients, updatePatient, listAppointments, createAppointment, getPlan, savePlan } from "../lib/db";
import { getUserId } from "../lib/auth";
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, XAxis, YAxis,
  Tooltip, CartesianGrid,
} from "recharts";
import {
  ChevronLeft, ChevronRight, Plus, Copy, Check, X, Eye, EyeOff,
  Sun, Moon, Search, Calendar, Heart, MessageCircle, Send, Download,
  Lock, AlertTriangle, ArrowUp, ArrowDown, User, Ruler, Flame, Calculator,
  Utensils, Baby, Pill, FileText, Microscope, ClipboardList, ListChecks,
  BookOpen, Camera, Lightbulb, Target, FileSignature, HeartPulse, FolderOpen,
  Folder, File as FileIcon, Receipt, Trash2, Upload, ShieldCheck,
  Salad, Stethoscope, Pencil, ArrowRight, Sparkles, Link2, Droplets, LogOut,
  GlassWater, Minus, CalendarPlus, RefreshCw,
} from "lucide-react";

/* ============================ DESIGN SYSTEM ============================ */
const CSS = `
@import url('https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600,700&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap');

.nf, .nf *{ box-sizing:border-box; }
.nf{
  --bg:#EBEDE8; --surface:#FBFBF8; --surface2:#F3F4EF;
  --glass:rgba(251,251,248,.66); --glass-brd:rgba(20,30,24,.07); --border:rgba(20,30,24,.085);
  --text:#1F2622; --muted:#5E665F; --faint:#8C938B;
  --sage:#4E6E57; --sage-strong:#3C5645; --sage-soft:rgba(78,110,87,.12);
  --terra:#BC6242; --terra-soft:rgba(188,98,66,.12);
  --amber:#B7892F; --blue:#3E7C8C; --red:#B14B36; --green:#4E8A52;
  --ring:rgba(78,110,87,.34);
  --shadow:0 1px 2px rgba(20,30,24,.05), 0 10px 28px -16px rgba(20,30,24,.16);
  --shadow-lg:0 1px 2px rgba(20,30,24,.06), 0 24px 60px -24px rgba(20,30,24,.28);
  color:var(--text);
  font-family:'General Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; font-size:14px; line-height:1.5;
}
.nf[data-theme="dark"]{
  --bg:#101411; --surface:#171C18; --surface2:#1E241F;
  --glass:rgba(23,28,24,.62); --glass-brd:rgba(255,255,255,.08); --border:rgba(255,255,255,.075);
  --text:#E8E7DF; --muted:#A7ADA4; --faint:#7C837A;
  --sage:#86A98C; --sage-strong:#9CBBA0; --sage-soft:rgba(134,169,140,.14);
  --terra:#D98463; --terra-soft:rgba(217,132,99,.14);
  --amber:#D2A24A; --blue:#6FA9B8; --red:#D77B63; --green:#7FB683;
  --ring:rgba(134,169,140,.40);
  --shadow:0 1px 2px rgba(0,0,0,.3), 0 14px 32px -18px rgba(0,0,0,.6);
  --shadow-lg:0 1px 2px rgba(0,0,0,.4), 0 30px 70px -28px rgba(0,0,0,.7);
}
.num{ font-family:'Geist Mono',ui-monospace,monospace; font-variant-numeric:tabular-nums; letter-spacing:-.01em; }

.nf-root{ position:relative; min-height:100%; width:100%; overflow-x:hidden; background:var(--bg); }
.nf-root::before{ content:""; position:fixed; inset:0; pointer-events:none; z-index:0;
  background:
    radial-gradient(120% 80% at 0% 0%, var(--sage-soft), transparent 55%),
    radial-gradient(120% 90% at 100% 100%, var(--terra-soft), transparent 55%),
    radial-gradient(80% 60% at 85% 8%, rgba(183,137,47,.05), transparent 60%); }
.shell{ position:relative; z-index:1; display:flex; flex-direction:column; min-height:100vh; }

.topbar{ position:sticky; top:0; z-index:30; height:58px; flex-shrink:0; display:flex; align-items:center; gap:12px; padding:0 18px;
  background:var(--glass); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%);
  border-bottom:1px solid var(--glass-brd); }
.brand{ display:flex; align-items:center; gap:9px; font-weight:600; letter-spacing:-.02em; }
.brand-mark{ width:26px; height:26px; border-radius:8px; display:grid; place-items:center;
  background:linear-gradient(145deg,var(--sage),var(--sage-strong)); color:#fff; box-shadow:var(--shadow); }
.crumb{ display:flex; align-items:center; gap:7px; color:var(--muted); font-size:13.5px; min-width:0; }
.crumb b{ color:var(--text); font-weight:600; } .crumb .sep{ color:var(--faint); } .spacer{ flex:1; }
.kbtn{ display:inline-flex; align-items:center; gap:7px; height:34px; padding:0 11px; border-radius:9px; border:1px solid var(--border);
  background:var(--surface); color:var(--muted); cursor:pointer; font-size:13px; font-weight:500; transition:.16s; }
.kbtn:hover{ color:var(--text); border-color:var(--ring); }
.kbd{ font-family:'Geist Mono',monospace; font-size:11px; padding:1px 5px; border-radius:5px; background:var(--surface2); border:1px solid var(--border); color:var(--faint); }
.iconbtn{ width:34px; height:34px; border-radius:9px; border:1px solid var(--border); background:var(--surface); color:var(--muted);
  display:grid; place-items:center; cursor:pointer; transition:.16s; }
.iconbtn:hover{ color:var(--text); border-color:var(--ring); transform:translateY(-1px); }

.body{ flex:1; display:flex; min-width:0; }
.side{ width:264px; flex-shrink:0; border-right:1px solid var(--border); padding:16px 12px 28px; position:sticky; top:58px; height:calc(100vh - 58px); overflow-y:auto; }
.main{ flex:1; min-width:0; padding:24px 28px 64px; max-width:1180px; }

.pcard{ background:var(--glass); backdrop-filter:blur(18px) saturate(170%); -webkit-backdrop-filter:blur(18px) saturate(170%);
  border:1px solid var(--glass-brd); border-radius:16px; padding:14px; box-shadow:var(--shadow); margin-bottom:14px; }
.pcard-top{ display:flex; gap:11px; align-items:center; }
.avatar{ border-radius:13px; background:linear-gradient(150deg,var(--sage),var(--sage-strong)); color:#fff; font-weight:600;
  display:grid; place-items:center; flex-shrink:0; box-shadow:0 6px 16px -8px rgba(60,86,69,.7); }
.pname{ font-weight:600; letter-spacing:-.02em; font-size:15px; line-height:1.2; }
.pmeta{ color:var(--muted); font-size:12px; margin-top:2px; }
.statusdot{ display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:500; color:var(--sage-strong); margin-top:7px; }
.statusdot i{ width:7px; height:7px; border-radius:50%; background:var(--sage); box-shadow:0 0 0 3px var(--sage-soft); }

.navlbl{ font-size:10.5px; font-weight:600; letter-spacing:.09em; text-transform:uppercase; color:var(--faint); padding:14px 10px 6px; }
.nav{ display:flex; flex-direction:column; gap:1px; }
.navitem{ display:flex; align-items:center; gap:10px; padding:8px 10px; border-radius:9px; cursor:pointer; color:var(--muted);
  font-size:13.5px; font-weight:500; transition:.14s; border:1px solid transparent; }
.navitem:hover{ background:var(--surface2); color:var(--text); }
.navitem.active{ background:var(--sage-soft); color:var(--sage-strong); border-color:var(--glass-brd); font-weight:600; }
.navitem.active svg{ color:var(--sage); }
.navitem .ix{ font-family:'Geist Mono',monospace; font-size:10px; color:var(--faint); width:15px; text-align:right; }
.navitem.active .ix{ color:var(--sage); }
.navbadge{ margin-left:auto; font-size:10px; font-weight:600; padding:1px 6px; border-radius:20px; background:var(--terra-soft); color:var(--terra); }

.card{ background:var(--surface); border:1px solid var(--border); border-radius:14px; box-shadow:var(--shadow); }
.card.pad{ padding:18px; }
.glass{ background:var(--glass); backdrop-filter:blur(20px) saturate(180%); -webkit-backdrop-filter:blur(20px) saturate(180%);
  border:1px solid var(--glass-brd); border-radius:16px; box-shadow:var(--shadow); }
.h1{ font-size:21px; font-weight:600; letter-spacing:-.03em; }
.h2{ font-size:16px; font-weight:600; letter-spacing:-.02em; }
.h3{ font-size:13px; font-weight:600; letter-spacing:-.01em; }
.eyebrow{ font-size:10.5px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; color:var(--faint); }
.muted{ color:var(--muted); } .faint{ color:var(--faint); }
.sechead{ display:flex; align-items:flex-start; justify-content:space-between; gap:16px; margin-bottom:18px; flex-wrap:wrap; }
.sechead p{ color:var(--muted); font-size:13px; margin-top:3px; max-width:62ch; }

.chip{ display:inline-flex; align-items:center; gap:6px; height:25px; padding:0 9px; border-radius:20px; font-size:11.5px; font-weight:500;
  background:var(--surface2); border:1px solid var(--border); color:var(--muted); white-space:nowrap; }
.chip.sage{ background:var(--sage-soft); border-color:transparent; color:var(--sage-strong); }
.chip.terra{ background:var(--terra-soft); border-color:transparent; color:var(--terra); }
.chip.amber{ background:rgba(183,137,47,.13); border-color:transparent; color:var(--amber); }
.chip.blue{ background:rgba(62,124,140,.13); border-color:transparent; color:var(--blue); }
.chip.red{ background:rgba(177,75,54,.13); border-color:transparent; color:var(--red); }
.chip button{ background:none; border:none; color:inherit; cursor:pointer; display:grid; place-items:center; opacity:.6; padding:0; }
.chip button:hover{ opacity:1; }
.chip.add{ cursor:pointer; border-style:dashed; color:var(--faint); }
.chip.add:hover{ color:var(--sage); border-color:var(--ring); }

.btn{ display:inline-flex; align-items:center; justify-content:center; gap:7px; height:36px; padding:0 14px; border-radius:10px;
  font-size:13.5px; font-weight:600; letter-spacing:-.01em; cursor:pointer; border:1px solid transparent;
  transition:transform .12s, background .16s, border-color .16s, box-shadow .16s; white-space:nowrap; }
.btn:active{ transform:scale(.975); }
.btn.primary{ background:linear-gradient(150deg,var(--sage),var(--sage-strong)); color:#fff; box-shadow:0 8px 20px -10px rgba(60,86,69,.7); }
.btn.primary:hover{ box-shadow:0 10px 26px -10px rgba(60,86,69,.85); transform:translateY(-1px); }
.nf[data-theme="dark"] .btn.primary{ color:#0f1410; }
.btn.ghost{ background:var(--surface); border-color:var(--border); color:var(--text); }
.btn.ghost:hover{ border-color:var(--ring); }
.btn.subtle{ background:var(--surface2); color:var(--muted); }
.btn.subtle:hover{ color:var(--text); }
.btn.sm{ height:30px; padding:0 10px; font-size:12.5px; border-radius:8px; }
.btn:disabled{ opacity:.5; cursor:not-allowed; }

.field{ display:flex; flex-direction:column; gap:6px; }
.field label{ font-size:12px; font-weight:500; color:var(--muted); }
.input,.select,textarea.input{ height:38px; width:100%; padding:0 12px; border-radius:10px; background:var(--surface);
  border:1px solid var(--border); color:var(--text); font-size:13.5px; font-family:inherit; transition:.16s; outline:none; }
textarea.input{ height:auto; padding:10px 12px; resize:vertical; line-height:1.55; }
.input:focus,.select:focus,textarea.input:focus{ border-color:var(--sage); box-shadow:0 0 0 3.5px var(--ring); }
.input::placeholder{ color:var(--faint); }
.select{ appearance:none; cursor:pointer; }

.seg{ display:inline-flex; padding:3px; background:var(--surface2); border:1px solid var(--border); border-radius:11px; gap:2px; flex-wrap:wrap; }
.seg button{ height:30px; padding:0 12px; border:none; background:none; border-radius:8px; cursor:pointer; font-size:12.5px; font-weight:500; color:var(--muted); transition:.14s; font-family:inherit; }
.seg button.on{ background:var(--surface); color:var(--text); box-shadow:var(--shadow); font-weight:600; }
.nf[data-theme="dark"] .seg button.on{ background:#283029; }

.toggle{ width:40px; height:23px; border-radius:20px; background:var(--surface2); border:1px solid var(--border); position:relative; cursor:pointer; transition:.18s; flex-shrink:0; }
.toggle.on{ background:var(--sage); border-color:transparent; }
.toggle span{ position:absolute; top:2px; left:2px; width:17px; height:17px; border-radius:50%; background:#fff; box-shadow:0 1px 3px rgba(0,0,0,.3); transition:.18s; }
.toggle.on span{ left:19px; }

.grid{ display:grid; gap:16px; } .row{ display:flex; gap:16px; flex-wrap:wrap; }
table.tbl{ width:100%; border-collapse:collapse; font-size:13px; }
.tbl th{ text-align:left; font-size:11px; font-weight:600; letter-spacing:.04em; text-transform:uppercase; color:var(--faint); padding:9px 12px; border-bottom:1px solid var(--border); }
.tbl td{ padding:10px 12px; border-bottom:1px solid var(--border); }
.tbl tr:last-child td{ border-bottom:none; }
.tbl tbody tr{ transition:background .12s; } .tbl tbody tr:hover{ background:var(--surface2); }
.tbl td.num,.tbl th.num{ text-align:right; }

.stat-val{ font-size:26px; font-weight:600; letter-spacing:-.03em; }
.delta{ display:inline-flex; align-items:center; gap:2px; font-size:11.5px; font-weight:600; padding:2px 7px; border-radius:20px; }
.delta.up{ background:var(--sage-soft); color:var(--sage-strong); }
.delta.down{ background:var(--terra-soft); color:var(--terra); }
.delta.flat{ background:var(--surface2); color:var(--muted); }
.bar{ height:7px; border-radius:20px; background:var(--surface2); overflow:hidden; }
.bar i{ display:block; height:100%; border-radius:20px; background:linear-gradient(90deg,var(--sage),var(--sage-strong)); }
.banner{ display:flex; gap:11px; align-items:flex-start; padding:12px 14px; border-radius:12px; font-size:13px; }
.banner.warn{ background:rgba(183,137,47,.1); border:1px solid rgba(183,137,47,.25); color:var(--amber); }
.banner.ok{ background:var(--sage-soft); border:1px solid var(--glass-brd); color:var(--sage-strong); }
.banner.alert{ background:rgba(177,75,54,.1); border:1px solid rgba(177,75,54,.25); color:var(--red); }

.diary{ border-radius:14px; overflow:hidden; border:1px solid var(--border); background:var(--surface); cursor:pointer; transition:transform .16s, box-shadow .16s; }
.diary:hover{ transform:translateY(-3px); box-shadow:var(--shadow-lg); }
.diary-img{ height:108px; position:relative; display:grid; place-items:end start; padding:9px; }
.diary-img .t{ font-size:11px; font-weight:600; color:#fff; background:rgba(0,0,0,.35); padding:2px 8px; border-radius:20px; backdrop-filter:blur(4px); }
.diary-bd{ padding:10px 11px; }
.diary-ft{ display:flex; align-items:center; gap:13px; margin-top:8px; color:var(--faint); font-size:11.5px; }
.diary-ft span{ display:inline-flex; align-items:center; gap:4px; }

.upload{ border:1.5px dashed var(--border); border-radius:14px; padding:26px; text-align:center; cursor:pointer; transition:.16s; color:var(--muted); background:var(--surface2); }
.upload:hover{ border-color:var(--ring); color:var(--text); background:var(--sage-soft); }
.upload.drag{ border-color:var(--sage); color:var(--sage-strong); background:var(--sage-soft); transform:scale(1.015); }
.spin{ animation:spin .9s linear infinite; } @keyframes spin{ to{ transform:rotate(360deg) } }
.folder{ border:1px solid var(--border); border-radius:13px; padding:15px; cursor:pointer; background:var(--surface); transition:.16s; }
.folder:hover{ border-color:var(--ring); transform:translateY(-2px); box-shadow:var(--shadow); }

.tl{ position:relative; padding-left:22px; }
.tl::before{ content:""; position:absolute; left:5px; top:6px; bottom:6px; width:1.5px; background:var(--border); }
.tl-item{ position:relative; padding-bottom:16px; }
.tl-item::before{ content:""; position:absolute; left:-21.5px; top:5px; width:9px; height:9px; border-radius:50%; background:var(--sage); box-shadow:0 0 0 3px var(--sage-soft); }
.meal{ border:1px solid var(--border); border-radius:13px; overflow:hidden; }
.meal-h{ display:flex; align-items:center; justify-content:space-between; padding:11px 13px; background:var(--surface2); }
.meal-item{ display:flex; align-items:center; gap:10px; padding:9px 13px; border-top:1px solid var(--border); font-size:13px; }

.overlay{ position:fixed; inset:0; z-index:60; background:rgba(15,20,16,.42); backdrop-filter:blur(3px); display:grid; place-items:center; padding:20px; animation:fade .18s ease; }
.modal{ width:100%; max-width:520px; max-height:88vh; overflow-y:auto; border-radius:18px; box-shadow:var(--shadow-lg); background:var(--surface); border:1px solid var(--glass-brd); animation:pop .2s cubic-bezier(.2,.9,.3,1.2); }
.modal-h{ display:flex; align-items:center; justify-content:space-between; padding:16px 18px; border-bottom:1px solid var(--border); position:sticky; top:0; background:var(--surface); z-index:1; }
.modal-b{ padding:18px; }
.modal-f{ display:flex; gap:10px; justify-content:flex-end; padding:14px 18px; border-top:1px solid var(--border); }
@keyframes fade{ from{opacity:0} to{opacity:1} }
@keyframes pop{ from{opacity:0; transform:scale(.96) translateY(8px)} to{opacity:1; transform:none} }
@keyframes slideup{ from{transform:translateY(100%)} to{transform:none} }

.cmd{ width:100%; max-width:560px; border-radius:16px; overflow:hidden; box-shadow:var(--shadow-lg); background:var(--glass); backdrop-filter:blur(24px) saturate(180%); border:1px solid var(--glass-brd); align-self:flex-start; margin-top:10vh; }
.cmd-in{ display:flex; align-items:center; gap:10px; padding:14px 16px; border-bottom:1px solid var(--glass-brd); }
.cmd-in input{ flex:1; border:none; background:none; outline:none; font-size:15px; color:var(--text); font-family:inherit; }
.cmd-list{ max-height:340px; overflow-y:auto; padding:6px; }
.cmd-row{ display:flex; align-items:center; gap:11px; padding:9px 11px; border-radius:10px; cursor:pointer; font-size:13.5px; }
.cmd-row.sel{ background:var(--sage-soft); color:var(--sage-strong); }
.cmd-row .ck{ margin-left:auto; font-family:'Geist Mono',monospace; font-size:10px; color:var(--faint); }

.toasts{ position:fixed; bottom:22px; right:22px; z-index:80; display:flex; flex-direction:column; gap:9px; }
.toast{ display:flex; align-items:center; gap:10px; padding:11px 15px; border-radius:12px; font-size:13px; font-weight:500; background:var(--surface); border:1px solid var(--glass-brd); box-shadow:var(--shadow-lg); animation:pop .22s; }
.toast i.dot{ width:8px; height:8px; border-radius:50%; background:var(--sage); }

.mobilebar{ display:none; }
.recharts-default-tooltip{ border-radius:10px !important; border:1px solid var(--glass-brd) !important; background:var(--surface) !important; box-shadow:var(--shadow-lg) !important; }

@media (max-width:920px){
  .side{ display:none; } .main{ padding:18px 16px 90px; } .topbar .hidem{ display:none; }
  .mobilebar{ display:flex; align-items:center; gap:10px; position:sticky; top:58px; z-index:25; padding:10px 16px; background:var(--glass); backdrop-filter:blur(18px) saturate(180%); border-bottom:1px solid var(--glass-brd); }
  .mobilebar .cur{ font-weight:600; letter-spacing:-.02em; display:flex; align-items:center; gap:9px; flex:1; }
  .sheet-wrap{ position:fixed; inset:0; z-index:70; display:flex; align-items:flex-end; background:rgba(15,20,16,.42); backdrop-filter:blur(3px); animation:fade .18s; }
  .sheet{ width:100%; max-height:80vh; overflow-y:auto; background:var(--surface); border-radius:22px 22px 0 0; border-top:1px solid var(--glass-brd); padding:8px 12px 22px; animation:slideup .26s cubic-bezier(.2,.9,.3,1); }
  .sheet-grab{ width:38px; height:4px; border-radius:20px; background:var(--border); margin:10px auto 6px; }
  .overlay{ align-items:flex-end; padding:0; }
  .modal{ max-width:100%; border-radius:22px 22px 0 0; max-height:90vh; animation:slideup .26s cubic-bezier(.2,.9,.3,1); }
  .cmd{ margin-top:auto; max-width:100%; border-radius:18px 18px 0 0; }
  .gcols>*{ flex:1 1 100% !important; }
}
@media (prefers-reduced-motion:reduce){ .nf *{ animation:none !important; transition:none !important; } }
`;

/* ============================ HELPERS ============================ */

function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  return <div className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials}</div>;
}
function Modal({ title, sub, onClose, children, footer, max }: { title: string; sub?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; max?: number }) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" style={max ? { maxWidth: max } : undefined} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div><div className="h2">{title}</div>{sub && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div>}</div>
          <button className="iconbtn" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}
function Delta({ v, invert }: { v: number; invert?: boolean }) {
  const up = v > 0, flat = v === 0;
  const good = invert ? v < 0 : v > 0;
  const cls = flat ? "flat" : good ? "up" : "down";
  return (
    <span className={cx("delta", cls)}>
      {!flat && (up ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
      <span className="num">{up ? "+" : ""}{v}%</span>
    </span>
  );
}
function Spark({ data, k, color }: { data: any[]; k: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={42}>
      <AreaChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
        <defs><linearGradient id={"g" + k} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.28} /><stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient></defs>
        <Area type="monotone" dataKey={k} stroke={color} strokeWidth={2} fill={"url(#g" + k + ")"} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/* ============================ MOCK DATA ============================ */
const BASE_PAT = { nome: "Mariana Costa Ribeiro", iniciais: "MR", idade: 32, sexo: "Feminino",
  altura: 1.67, gestSemanas: 28, objetivo: "Gestacional", crn: "CRN-4 25107574" };
const EVO = [
  { data: "05/09", peso: 70.8, imc: 25.4, gordura: 31.0 }, { data: "03/10", peso: 67.9, imc: 24.3, gordura: 29.5 },
  { data: "07/11", peso: 65.0, imc: 23.3, gordura: 27.9 }, { data: "05/12", peso: 65.6, imc: 23.5, gordura: 28.0 },
  { data: "09/01", peso: 67.2, imc: 24.1, gordura: 28.3 }, { data: "06/02", peso: 69.1, imc: 24.8, gordura: 28.6 },
  { data: "06/03", peso: 70.9, imc: 25.4, gordura: 28.9 }, { data: "10/04", peso: 72.4, imc: 26.0, gordura: 29.1 },
  { data: "08/05", peso: 74.0, imc: 26.5, gordura: 29.4 }, { data: "12/06", peso: 75.3, imc: 27.0, gordura: 29.6 },
];
const GEST = [
  { sem: 4, min: 0.0, max: 1.0, ganho: 0.6 }, { sem: 8, min: 0.5, max: 2.0, ganho: 2.2 },
  { sem: 13, min: 1.0, max: 3.0, ganho: 4.1 }, { sem: 17, min: 2.5, max: 4.5, ganho: 5.9 },
  { sem: 22, min: 4.0, max: 6.5, ganho: 7.4 }, { sem: 26, min: 5.5, max: 8.5, ganho: 9.0 }, { sem: 28, min: 6.5, max: 9.5, ganho: 10.3 },
];
const ANTROP = [
  { data: "12/06/2026", peso: 75.3, imc: 27.0, gord: 29.6, cint: 92, quad: 104, rcq: 0.88 },
  { data: "08/05/2026", peso: 74.0, imc: 26.5, gord: 29.4, cint: 90, quad: 103, rcq: 0.87 },
  { data: "10/04/2026", peso: 72.4, imc: 26.0, gord: 29.1, cint: 88, quad: 102, rcq: 0.86 },
  { data: "06/03/2026", peso: 70.9, imc: 25.4, gord: 28.9, cint: 86, quad: 101, rcq: 0.85 },
  { data: "07/11/2025", peso: 65.0, imc: 23.3, gord: 27.9, cint: 79, quad: 98, rcq: 0.81 },
  { data: "05/09/2025", peso: 70.8, imc: 25.4, gord: 31.0, cint: 84, quad: 100, rcq: 0.84 },
];
const FIN = [
  { data: "12/06/2026", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
  { data: "08/05/2026", desc: "Consulta de retorno", valor: 250, forma: "Cartão", status: "Pago" },
  { data: "10/04/2026", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
  { data: "06/03/2026", desc: "Consulta + bioimpedância", valor: 320, forma: "Cartão", status: "Pago" },
  { data: "06/02/2026", desc: "Consulta de retorno", valor: 250, forma: "Pix", status: "Pago" },
  { data: "05/12/2025", desc: "Primeira consulta", valor: 380, forma: "Cartão", status: "Pago" },
  { data: "10/07/2026", desc: "Consulta de retorno (agendada)", valor: 250, forma: "—", status: "Pendente" },
];
const EXAMES = [
  { nome: "Hemoglobina", val: "11,2", un: "g/dL", ref: "12,0 – 16,0", flag: "low" },
  { nome: "Ferritina", val: "18", un: "ng/mL", ref: "30 – 200", flag: "low" },
  { nome: "Glicemia de jejum", val: "88", un: "mg/dL", ref: "70 – 99", flag: "ok" },
  { nome: "Vitamina D (25-OH)", val: "24", un: "ng/mL", ref: "30 – 60", flag: "low" },
  { nome: "TSH", val: "2,1", un: "mUI/L", ref: "0,4 – 4,0", flag: "ok" },
  { nome: "Colesterol total", val: "182", un: "mg/dL", ref: "< 190", flag: "ok" },
];
type Food = [string, string, number];
const FOODS_SEED: Food[] = [
  ["Ovo de galinha cozido", "1 un (50g)", 78], ["Pão integral", "1 fatia (30g)", 74],
  ["Banana prata", "1 un (90g)", 80], ["Aveia em flocos", "30 g", 117],
  ["Iogurte natural integral", "170 g", 102], ["Frango grelhado", "100 g", 165],
  ["Arroz integral cozido", "4 col (100g)", 124], ["Feijão carioca", "1 concha (80g)", 76],
  ["Brócolis cozido", "100 g", 35], ["Maçã", "1 un (130g)", 68],
  ["Abacate", "100 g", 96], ["Castanha-do-pará", "3 un (15g)", 98],
];
type Componente = [string, string];
type Prescricao = { nome: string; comp: Componente[]; pos: string; dur: string };
const MANIPULADOS_SEED: Record<string, Prescricao[]> = {
  [PORTAL_ACCESS.patientId]: [
    { nome: "Suporte gestacional", comp: [["Ácido fólico", "400 mcg"], ["Ferro quelato (bisglicinato)", "30 mg"], ["DHA (ômega-3)", "200 mg"]], pos: "1 cápsula ao dia, após o almoço", dur: "90 dias" },
    { nome: "Vitamina D3", comp: [["Colecalciferol", "2.000 UI"]], pos: "1 cápsula ao dia, pela manhã", dur: "60 dias" },
  ],
};

/* ============================ APP ============================ */
export default function PatientProfile() {
  const { theme, toggle } = useTheme();
  const toast = useToast();
  const { id } = useParams();
  const nav = useNavigate();
  const [allPatients, setAllPatients] = useState<Patient[]>([]);
  const [patientsReady, setPatientsReady] = useState(false);
  useEffect(() => { listPatients().then(setAllPatients).catch(() => toast("Erro ao carregar pacientes")).finally(() => setPatientsReady(true)); }, []);
  const EMPTY_PATIENT: Patient = { id: "", nome: "", idade: 0, sexo: "Feminino", objetivo: "Clínico", status: "ativo", tags: [], ultimaConsulta: "—", proximaAcao: "—", adesao: 0, cor: ["#9DB99F", "#6E8C72"] };
  const sel = allPatients.find((p) => p.id === id) ?? allPatients[0] ?? EMPTY_PATIENT;
  const PAT = { ...BASE_PAT, nome: sel.nome, iniciais: initials(sel.nome), idade: sel.idade, sexo: sel.sexo, objetivo: sel.objetivo };
  const [active, setActive] = useState("perfil");
  const [gestante, setGestante] = useState<boolean>(!!sel.gestante);
  useEffect(() => { setGestante(!!sel.gestante); }, [sel.id, sel.gestante]);
  const [mask, setMask] = useState(false);
  const [tags, setTags] = useState(["Gestante", "Acompanhamento", "Online", "Alta prioridade"]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addTag, setAddTag] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedInfo, setCopiedInfo] = useState(false);
  const portalPath = `/portal/${PORTAL_ACCESS.slug}`;
  const portalUrl = `${window.location.origin}${portalPath}`;

  /* ---- editar paciente ---- */
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ nome: "", email: "", sexo: "Feminino" as Patient["sexo"], dataNascimento: "", telefone: "", cpfCnpj: "", observacao: "" });
  const openEdit = () => {
    setEditForm({
      nome: sel.nome, email: sel.email ?? "", sexo: sel.sexo, dataNascimento: sel.dataNascimento ?? "",
      telefone: sel.telefone ?? "", cpfCnpj: sel.cpfCnpj ?? "", observacao: sel.observacao ?? "",
    });
    setEditOpen(true);
  };
  const saveEdit = async () => {
    const nome = editForm.nome.trim();
    if (!nome) return;
    const patch = {
      nome, sexo: editForm.sexo,
      idade: editForm.dataNascimento ? calcularIdade(editForm.dataNascimento) : sel.idade,
      email: editForm.email.trim() || undefined,
      telefone: editForm.telefone.trim() || undefined,
      cpfCnpj: editForm.cpfCnpj.trim() || undefined,
      dataNascimento: editForm.dataNascimento || sel.dataNascimento,
      observacao: editForm.observacao.trim() || undefined,
    };
    try {
      const saved = await updatePatient(sel.id, patch);
      setAllPatients(allPatients.map((p) => p.id === sel.id ? saved : p));
    } catch {
      toast("Erro ao salvar paciente");
      return;
    }
    setEditOpen(false);
    toast("Dados do paciente atualizados");
  };

  /* ---- agendamentos (compartilhado com a Agenda) ---- */
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  useEffect(() => { listAppointments().then(setAppointments).catch(() => toast("Erro ao carregar agendamentos")); }, []);
  const apptsDoPaciente = appointments.filter((a) => a.paciente === sel.nome);
  const [novoAgendamento, setNovoAgendamento] = useState(false);
  const [agendaForm, setAgendaForm] = useState({ dia: "3", hora: "14:00", tipo: "Retorno", modo: "Online" as "Online" | "Presencial" });
  const criarAgendamento = async () => {
    const userId = getUserId();
    if (!userId) return;
    try {
      const saved = await createAppointment({ patientId: sel.id, paciente: sel.nome, hora: agendaForm.hora, dur: 60, tipo: agendaForm.tipo, modo: agendaForm.modo, dia: Number(agendaForm.dia) }, userId);
      setAppointments([saved, ...appointments]);
      setNovoAgendamento(false);
      toast("Agendamento criado");
    } catch {
      toast("Erro ao criar agendamento");
    }
  };

  /* ---- hidratação ---- */
  const isPortalPatient = sel.id === PORTAL_ACCESS.patientId;
  const [portalGoals, setPortalGoals] = usePersistentState(LOCAL_KEYS.portalGoals, PORTAL_GOALS);
  const [hidratacaoMap, setHidratacaoMap] = usePersistentState<Record<string, { copos: number; meta: number }>>(LOCAL_KEYS.hidratacao, {});
  const { registerHydrationComplete } = useStreak(sel.id);
  const hidratacaoGoal = isPortalPatient ? portalGoals.find((g) => g.coposMeta != null) : undefined;
  const hidratacaoGenerica = hidratacaoMap[sel.id] ?? { copos: 0, meta: 8 };
  const copos = isPortalPatient ? (hidratacaoGoal?.coposAtuais ?? 0) : hidratacaoGenerica.copos;
  const metaCopos = isPortalPatient ? (hidratacaoGoal?.coposMeta ?? 8) : hidratacaoGenerica.meta;
  const [hidratacaoOpen, setHidratacaoOpen] = useState(false);
  const setCopos = (n: number) => {
    const clamped = Math.max(0, Math.min(metaCopos, n));
    if (isPortalPatient && hidratacaoGoal) {
      setPortalGoals(portalGoals.map((g) => g.id === hidratacaoGoal.id
        ? { ...g, coposAtuais: clamped, progresso: Math.round((clamped / metaCopos) * 100) } : g));
      if (clamped >= metaCopos) registerHydrationComplete(sel.nome);
    } else {
      setHidratacaoMap({ ...hidratacaoMap, [sel.id]: { copos: clamped, meta: metaCopos } });
    }
  };


  const SECTIONS: { id: string; label: string; icon: any; badge?: string }[] = [
    { id: "perfil", label: "Perfil do paciente", icon: User },
    { id: "ia", label: "Inteligência (IA)", icon: Sparkles },
    { id: "antrop", label: "Antropometria", icon: Ruler },
    { id: "energetico", label: "Cálculo energético", icon: Flame },
    { id: "plano", label: "Plano alimentar", icon: Utensils },
    ...(gestante ? [{ id: "gestacional", label: "Acompanhamento gestacional", icon: Baby, badge: "28s" }] : []),
    { id: "manipulado", label: "Manipulado", icon: Pill },
    { id: "exame", label: "Exame", icon: Microscope, badge: "3" },
    { id: "anamnese", label: "Anamnese", icon: ClipboardList },
    { id: "questionario", label: "Questionário", icon: ListChecks },
    { id: "diario", label: "Diário alimentar", icon: Camera },
    { id: "instrucao", label: "Instrução nutricional", icon: Lightbulb },
    { id: "prontuario", label: "Prontuário", icon: FileText },
    { id: "financeiro", label: "Financeiro e recibo", icon: Receipt },
    { id: "metas", label: "Metas", icon: Target },
    { id: "atestado", label: "Atestado", icon: FileSignature },
    { id: "saude", label: "Questionários de saúde", icon: HeartPulse },
    { id: "pasta", label: "Pasta do paciente", icon: FolderOpen },
  ];
  const activeSafe = SECTIONS.some((s) => s.id === active) ? active : "perfil";
  const curSec = SECTIONS.find((s) => s.id === activeSafe) || SECTIONS[0];

  const go = (id: string) => { setActive(id); setSheetOpen(false); window.scrollTo({ top: 0 }); };

  /* per-section state */
  const [antOpen, setAntOpen] = useState(false);
  const [antRows, setAntRows] = usePersistentState(LOCAL_KEYS.anthropometry, ANTROP);
  const [antF, setAntF] = useState({ data: "", peso: "", altura: "1.67", cint: "", quad: "" });
  const antImc = antF.peso && antF.altura ? (parseFloat(antF.peso) / (parseFloat(antF.altura) ** 2)) : null;
  const [enFormula, setEnFormula] = useState("Mifflin");
  const [enFator, setEnFator] = useState(1.55);
  const [enObj, setEnObj] = useState("manutencao");
  const [enAjuste, setEnAjuste] = useState(15);
  const [plano, setPlanoState] = useState<PatientPlan | null>(null);
  useEffect(() => { if (id) getPlan(id).then(setPlanoState).catch(() => toast("Erro ao carregar plano")); }, [id]);
  const setPlano = async (next: PatientPlan) => {
    const userId = getUserId();
    if (!userId) return;
    try {
      setPlanoState(await savePlan(next, userId));
    } catch {
      toast("Erro ao salvar plano");
    }
  };
  const [foods, setFoods] = usePersistentState<Food[]>(LOCAL_KEYS.foods, FOODS_SEED);

  /* ---- INTELIGÊNCIA (IA local) ---- */
  const [forecast, setForecast] = useState<Forecast | null>(null);
  const [treinando, setTreinando] = useState(false);
  const [planoIA, setPlanoIA] = useState<GeneratedPlan | null>(null);
  const [nivelIA, setNivelIA] = useState<ActivityLevel>("leve");

  async function treinarPrevisao() {
    setTreinando(true);
    try { setForecast(await trainWeightForecast(antRows)); }
    finally { setTreinando(false); }
  }
  // Treina automaticamente ao abrir a seção pela primeira vez.
  useEffect(() => {
    if (active === "ia" && !forecast && !treinando) treinarPrevisao();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function gerarPlanoIA() {
    setPlanoIA(generatePlan({
      pacienteId: sel.id, sexo: sel.sexo as Sexo, idade: sel.idade,
      objetivo: sel.objetivo as Objetivo, antrop: antRows, foods, nivel: nivelIA,
      refeicoes: REFEICOES_PADRAO, horarios: HORARIOS_PADRAO,
    }));
  }
  function aplicarPlanoIA() {
    if (!planoIA) return;
    setPlano({
      pacienteId: sel.id, titulo: planoIA.titulo, periodo: planoIA.periodo,
      kcal: planoIA.kcal, aguaMl: planoIA.aguaMl, proteinaG: planoIA.proteinaG,
      refeicoes: planoIA.refeicoes, substituicoes: planoIA.substituicoes,
    });
    toast("Plano da IA aplicado ao paciente");
    setPlanoIA(null);
    go("plano");
  }

  const [foodPick, setFoodPick] = useState<number | null>(null);
  const [foodQ, setFoodQ] = useState("");
  const [novoAlimento, setNovoAlimento] = useState(false);
  const [novoAlimentoForm, setNovoAlimentoForm] = useState({ nome: "", porcao: "", kcal: "" });
  const planTotal = plano ? plano.refeicoes.reduce((a, m) => a + m.itens.reduce((s, i) => s + (i.kcal ?? 0), 0), 0) : 0;
  const updateMeal = (idx: number, updater: (m: PatientPlan["refeicoes"][number]) => PatientPlan["refeicoes"][number]) => {
    if (!plano) return;
    setPlano({ ...plano, refeicoes: plano.refeicoes.map((m, i) => i === idx ? updater(m) : m) });
  };
  const adicionarAoMeal = (mi: number, f: Food) => { updateMeal(mi, (mm) => ({ ...mm, itens: [...mm.itens, { nome: f[0], porcao: f[1], kcal: f[2] }] })); setFoodPick(null); toast(f[0] + " adicionado"); };
  const criarAlimentoCustom = () => {
    const nome = novoAlimentoForm.nome.trim();
    if (!nome || foodPick === null) return;
    const novo: Food = [nome, novoAlimentoForm.porcao.trim() || "1 porção", Number(novoAlimentoForm.kcal) || 0];
    setFoods([...foods, novo]);
    adicionarAoMeal(foodPick, novo);
    setNovoAlimento(false);
    setNovoAlimentoForm({ nome: "", porcao: "", kcal: "" });
    toast(`"${nome}" criado e salvo na biblioteca`);
  };

  /* ---- manipulado ---- */
  const [manipuladosMap, setManipuladosMap] = usePersistentState<Record<string, Prescricao[]>>(LOCAL_KEYS.manipulados, MANIPULADOS_SEED);
  const prescricoes = manipuladosMap[sel.id] ?? [];
  const setPrescricoes = (next: Prescricao[]) => setManipuladosMap({ ...manipuladosMap, [sel.id]: next });
  const FORM_PRESCRICAO_VAZIO = { nome: "", pos: "", dur: "60 dias", comp: [["", ""]] as Componente[] };
  const [novaPrescricaoOpen, setNovaPrescricaoOpen] = useState(false);
  const [prescricaoForm, setPrescricaoForm] = useState(FORM_PRESCRICAO_VAZIO);
  const abrirNovaPrescricao = () => { setPrescricaoForm(FORM_PRESCRICAO_VAZIO); setNovaPrescricaoOpen(true); };
  const criarPrescricao = () => {
    const nome = prescricaoForm.nome.trim();
    const comp = prescricaoForm.comp.filter(([n]) => n.trim()) as Componente[];
    if (!nome || comp.length === 0) return;
    setPrescricoes([{ nome, comp, pos: prescricaoForm.pos.trim() || "—", dur: prescricaoForm.dur.trim() || "—" }, ...prescricoes]);
    setNovaPrescricaoOpen(false);
    toast("Prescrição manipulada criada");
  };

  /* ---- exame (upload do laudo) ---- */
  const [exameFile, setExameFile] = useState<{ nome: string; tamanho: string; data: string } | null>({ nome: "Hemograma_completo.pdf", tamanho: "240 KB", data: "12/06/2026" });
  const [exameDragOver, setExameDragOver] = useState(false);
  const [exameExtraindo, setExameExtraindo] = useState(false);
  const exameInputRef = useRef<HTMLInputElement>(null);
  const processarArquivoExame = (file: File) => {
    setExameExtraindo(true);
    setTimeout(() => {
      setExameFile({ nome: file.name, tamanho: `${Math.max(1, Math.round(file.size / 1024))} KB`, data: new Date().toLocaleDateString("pt-BR") });
      setExameExtraindo(false);
      toast("Valores extraídos com IA");
    }, 1100);
  };
  const onDropExame = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setExameDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processarArquivoExame(file);
  };

  /* ---- questionários do paciente ---- */
  const [questionariosMap, setQuestionariosMap] = usePersistentState<Record<string, PortalQuestionnaire[]>>(LOCAL_KEYS.questionariosPaciente, QUESTIONARIOS_SEED);
  const questionarios = questionariosMap[sel.id] ?? [];
  const setQuestionarios = (next: PortalQuestionnaire[]) => setQuestionariosMap({ ...questionariosMap, [sel.id]: next });

  type PerguntaTipo = "texto" | "escala" | "opcao";
  const FORM_QUESTIONARIO_VAZIO = { titulo: "", categoria: "Acompanhamento", prazo: "7 dias", perguntas: [{ texto: "", tipo: "texto" as PerguntaTipo }] };
  const [novoQuestionarioOpen, setNovoQuestionarioOpen] = useState(false);
  const [questionarioForm, setQuestionarioForm] = useState(FORM_QUESTIONARIO_VAZIO);
  const abrirNovoQuestionario = () => { setQuestionarioForm(FORM_QUESTIONARIO_VAZIO); setNovoQuestionarioOpen(true); };
  const addPerguntaForm = () => setQuestionarioForm({ ...questionarioForm, perguntas: [...questionarioForm.perguntas, { texto: "", tipo: "texto" }] });
  const removePerguntaForm = (i: number) => setQuestionarioForm({ ...questionarioForm, perguntas: questionarioForm.perguntas.length > 1 ? questionarioForm.perguntas.filter((_, x) => x !== i) : questionarioForm.perguntas });
  const updatePerguntaForm = (i: number, patch: Partial<{ texto: string; tipo: PerguntaTipo }>) => setQuestionarioForm({ ...questionarioForm, perguntas: questionarioForm.perguntas.map((p, x) => x === i ? { ...p, ...patch } : p) });
  const criarQuestionario = () => {
    const titulo = questionarioForm.titulo.trim();
    const perguntasValidas = questionarioForm.perguntas.filter((p) => p.texto.trim());
    if (!titulo || perguntasValidas.length === 0) return;
    const novo: PortalQuestionnaire = {
      id: uid(),
      titulo,
      categoria: questionarioForm.categoria.trim() || "Acompanhamento",
      prazo: questionarioForm.prazo.trim() || "—",
      status: "rascunho",
      perguntas: perguntasValidas.map((p) => ({ id: uid(), texto: p.texto.trim(), tipo: p.tipo })),
    };
    setQuestionarios([novo, ...questionarios]);
    setNovoQuestionarioOpen(false);
    toast("Questionário criado como rascunho");
  };
  const enviarQuestionario = (q: PortalQuestionnaire) => {
    setQuestionarios(questionarios.map((x) => x.id === q.id ? { ...x, status: "pendente" } : x));
    toast(`"${q.titulo}" enviado a ${sel.nome.split(" ")[0]}`);
    pushEvent({ tipo: "questionario", titulo: `Novo questionário: "${q.titulo}"`, audiencia: "paciente", patientId: sel.id, portalLink: "questionarios" });
  };
  const reenviarQuestionario = (q: PortalQuestionnaire) => toast(`Lembrete de "${q.titulo}" reenviado a ${sel.nome.split(" ")[0]}`);
  const [verRespostasId, setVerRespostasId] = useState<string | null>(null);
  const [registrarRespostasId, setRegistrarRespostasId] = useState<string | null>(null);
  const [respostasForm, setRespostasForm] = useState<Record<string, string>>({});
  const abrirRegistrarRespostas = (q: PortalQuestionnaire) => { setRespostasForm({}); setRegistrarRespostasId(q.id); };
  const salvarRespostas = () => {
    if (!registrarRespostasId) return;
    setQuestionarios(questionarios.map((q) => q.id === registrarRespostasId ? { ...q, status: "respondido", respostas: respostasForm } : q));
    setRegistrarRespostasId(null);
    toast("Respostas registradas");
  };

  /* ---- criar plano alimentar do zero ---- */
  const FORM_PLANO_VAZIO = { titulo: "", kcal: "2000", proteina: "100", agua: "2000", refeicoesSelecionadas: REFEICOES_PADRAO as string[] };
  const [criarPlanoOpen, setCriarPlanoOpen] = useState(false);
  const [planoForm, setPlanoForm] = useState(FORM_PLANO_VAZIO);
  const toggleRefeicaoForm = (nome: string) => setPlanoForm((f) => ({
    ...f, refeicoesSelecionadas: f.refeicoesSelecionadas.includes(nome) ? f.refeicoesSelecionadas.filter((x) => x !== nome) : [...f.refeicoesSelecionadas, nome],
  }));
  const abrirCriarPlano = () => {
    setPlanoForm({ ...FORM_PLANO_VAZIO, titulo: `Plano alimentar — ${sel.nome.split(" ")[0]}` });
    setCriarPlanoOpen(true);
  };
  const criarPlano = () => {
    if (planoForm.refeicoesSelecionadas.length === 0) return;
    const novo: PatientPlan = {
      pacienteId: sel.id,
      titulo: planoForm.titulo.trim() || "Plano alimentar",
      periodo: "Atualizado hoje",
      kcal: Number(planoForm.kcal) || 2000,
      proteinaG: Number(planoForm.proteina) || 0,
      aguaMl: Number(planoForm.agua) || 2000,
      refeicoes: REFEICOES_PADRAO.filter((nome) => planoForm.refeicoesSelecionadas.includes(nome)).map((nome) => ({ nome, horario: HORARIOS_PADRAO[nome] ?? "—", itens: [] })),
      substituicoes: [],
    };
    setPlano(novo);
    setCriarPlanoOpen(false);
    toast("Plano alimentar criado");
  };
  const [diary, setDiary] = useState([
    { id: "d1", ref: "Almoço", quando: "Hoje · 12:40", g: ["#9DB99F", "#6E8C72"], desc: "Arroz integral, feijão, frango grelhado e salada de folhas. Bebi 1 copo de suco de laranja natural.", react: 1, liked: true, comments: [{ a: "Você", t: "Ótimo prato! Tenta trocar o suco por fruta in natura para reduzir o pico de açúcar." }] },
    { id: "d2", ref: "Café da manhã", quando: "Hoje · 08:15", g: ["#E0B48C", "#C98B5A"], desc: "Tapioca com ovo mexido e café sem açúcar.", react: 0, liked: false, comments: [] },
    { id: "d3", ref: "Lanche", quando: "Ontem · 16:30", g: ["#C9A2B0", "#9E7383"], desc: "Iogurte natural com morangos e granola caseira.", react: 1, liked: true, comments: [] },
    { id: "d4", ref: "Jantar", quando: "Ontem · 20:10", g: ["#A8B6C9", "#73839E"], desc: "Sopa de abóbora com frango desfiado.", react: 0, liked: false, comments: [] },
  ]);
  const [viewer, setViewer] = useState<any>(null);
  const [cdraft, setCdraft] = useState<Record<string, string>>({});
  const [pront, setPront] = useState([
    { d: "12/06/2026", a: "Nutricionista", t: "Paciente em 28 semanas, ganho de peso ligeiramente acima da faixa recomendada. Reforçada distribuição de carboidratos ao longo do dia e fracionamento das refeições. Solicitada repetição de hemograma e ferritina." },
    { d: "08/05/2026", a: "Nutricionista", t: "Relata melhora da disposição. Ajustado aporte de ferro via alimentação e suplementação. Edema leve em membros inferiores no fim do dia." },
    { d: "06/03/2026", a: "Nutricionista", t: "Início do 2º trimestre. Náuseas resolvidas. Boa adesão ao plano. Orientações sobre fontes de cálcio e DHA." },
  ]);
  const [pdraft, setPdraft] = useState("");
  const [metas, setMetas] = useState([
    { id: "m1", t: "Manter ganho de peso dentro da curva gestacional", alvo: "Faixa 6,5–9,5 kg (28 sem)", p: 72, tipo: "Clínica" },
    { id: "m2", t: "Beber 2,5 L de água por dia", alvo: "Hábito diário · sequência de 12 dias", p: 85, tipo: "Hábito" },
    { id: "m3", t: "Incluir vegetais no almoço e no jantar", alvo: "Comportamental · 6 de 7 dias", p: 86, tipo: "Comportamental" },
    { id: "m4", t: "Caminhada leve 30 min, 4x/semana", alvo: "Atividade física", p: 50, tipo: "Hábito" },
  ]);
  const [metaOpen, setMetaOpen] = useState(false);
  const [metaF, setMetaF] = useState({ t: "", alvo: "", tipo: "Hábito" });
  const [atTipo, setAtTipo] = useState("Atestado");
  const [atDias, setAtDias] = useState("1");
  const [atCidOn, setAtCidOn] = useState(false);
  const [atCid, setAtCid] = useState("Z39.1");
  const [atObs, setAtObs] = useState("");
  const [risk, setRisk] = useState([
    { q: "Pressão arterial elevada / em tratamento?", w: 2, on: false },
    { q: "Histórico familiar de doença cardiovascular?", w: 1, on: true },
    { q: "Tabagismo atual?", w: 2, on: false },
    { q: "Sedentarismo (< 150 min ativos/semana)?", w: 1, on: true },
    { q: "Circunferência da cintura acima do ideal?", w: 1, on: true },
  ]);
  const riskScore = risk.reduce((a, r) => a + (r.on ? r.w : 0), 0);
  const riskClass = riskScore <= 1 ? { l: "Baixo", c: "sage" } : riskScore <= 3 ? { l: "Moderado", c: "amber" } : { l: "Alto", c: "red" };
  const [folder, setFolder] = useState<string | null>(null);
  const FOLDERS = [
    { n: "Exames", files: [["Hemograma_completo.pdf", "PDF · 240 KB", "12/06/2026"], ["Ultrassom_morfologico.pdf", "PDF · 1,8 MB", "20/05/2026"], ["Glicemia_curva.pdf", "PDF · 180 KB", "09/01/2026"]] },
    { n: "Planos alimentares", files: [["Plano_v3_gestacional.pdf", "PDF · 320 KB", "06/03/2026"], ["Plano_v2.pdf", "PDF · 300 KB", "05/12/2025"]] },
    { n: "Documentos", files: [["Termo_consentimento.pdf", "PDF · 120 KB", "05/12/2025"], ["Anamnese_inicial.pdf", "PDF · 210 KB", "05/12/2025"]] },
    { n: "Fotos de evolução", files: [["foto_frente_jun.jpg", "JPG · 2,1 MB", "12/06/2026"], ["foto_perfil_jun.jpg", "JPG · 1,9 MB", "12/06/2026"]] },
    { n: "Recibos", files: [["Recibo_jun2026.pdf", "PDF · 90 KB", "12/06/2026"], ["Recibo_mai2026.pdf", "PDF · 88 KB", "08/05/2026"]] },
  ];
  const [sentInstr, setSentInstr] = useState(["Hidratação na gestação"]);
  const INSTR = [
    ["Como montar um prato equilibrado", "Geral"], ["Hidratação na gestação", "Gestante"],
    ["Lanches práticos e nutritivos", "Praticidade"], ["Leitura de rótulos de alimentos", "Educação"],
    ["Fontes de ferro e como absorver melhor", "Gestante"], ["Controle de náuseas no 1º trimestre", "Gestante"],
  ];
  const firstAnt = EVO[0], lastAnt = EVO[EVO.length - 1];

  /* ---- PERFIL (dashboard) ---- */
  function renderPerfil() {
    const minis: { k: "peso" | "imc" | "gordura"; label: string; un: string; color: string; invert: boolean }[] = [
      { k: "peso", label: "Peso", un: "kg", color: "var(--sage)", invert: false },
      { k: "imc", label: "IMC", un: "", color: "var(--blue)", invert: false },
      { k: "gordura", label: "Massa gorda", un: "%", color: "var(--terra)", invert: true },
    ];
    const prev = EVO[EVO.length - 2];
    const hasAppts = apptsDoPaciente.length > 0;
    return (
      <>
        {/* identidade (contexto — visível também no mobile) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <Avatar initials={PAT.iniciais} size={48} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}><span className="h1" style={{ fontSize: 19 }}>{PAT.nome}</span><span className="statusdot" style={{ marginTop: 0 }}><i />Ativo</span></div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{PAT.sexo} · {PAT.idade} anos · <span className="num">{PAT.gestSemanas}</span> semanas · Objetivo {PAT.objetivo}</div>
          </div>
        </div>

        {/* Linha 1 — ações */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
          <button className="kbtn" style={{ height: 36 }} onClick={() => { navigator.clipboard?.writeText(portalUrl); setCopied(true); toast("Link real do portal copiado"); setTimeout(() => setCopied(false), 1600); }}>
            {copied ? <Check size={15} /> : <Link2 size={15} />}{copied ? "Link copiado" : "Link de acesso paciente"}</button>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <Link className="btn ghost" to={portalPath}><ArrowRight size={15} />Abrir portal</Link>
            <button className="btn ghost" onClick={() => setHidratacaoOpen(true)}><Droplets size={15} />Hidratação</button>
            <button className="btn ghost" onClick={openEdit}><Pencil size={15} />Editar paciente</button>
          </div>
        </div>

        {/* Linha 2 — Finanças + Tags */}
        <div className="grid gcols" style={{ gridTemplateColumns: "1.1fr 1fr", marginBottom: 16 }}>
          <div className="card pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <span className="eyebrow">Finanças</span>
              <div style={{ display: "flex", gap: 6 }}>
                <button className="iconbtn" style={{ width: 30, height: 30 }} title="Ocultar valores" onClick={() => setMask(!mask)}>{mask ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                <button className="iconbtn" style={{ width: 30, height: 30 }} title="Novo lançamento" onClick={() => go("financeiro")}><Plus size={15} /></button>
              </div>
            </div>
            <div className="row" style={{ gap: 30 }}>
              <div><div className="faint" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase" }}>Total</div><div className="stat-val num" style={{ marginTop: 2 }}>{mask ? "•• •••" : brl(2200)}</div></div>
              <div><div className="faint" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase" }}>Preço médio</div><div className="stat-val num" style={{ marginTop: 2 }}>{mask ? "•• •••" : brl(275)}</div></div>
            </div>
          </div>
          <div className="card pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span className="eyebrow">Tags</span>
              {!addTag && <button className="iconbtn" style={{ width: 30, height: 30 }} title="Adicionar etiqueta" onClick={() => setAddTag(true)}><Plus size={15} /></button>}
            </div>
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
              {tags.map((t) => (
                <span key={t} className={cx("chip", t === "Gestante" ? "sage" : t === "Alta prioridade" ? "terra" : "")}>
                  {t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X size={11} /></button></span>
              ))}
              {addTag && (
                <input autoFocus className="input" style={{ height: 25, width: 140, fontSize: 12 }} placeholder="nova etiqueta…"
                  onKeyDown={(e) => { if (e.key === "Enter" && e.currentTarget.value.trim()) { setTags([...tags, e.currentTarget.value.trim()]); setAddTag(false); } if (e.key === "Escape") setAddTag(false); }}
                  onBlur={() => setAddTag(false)} />
              )}
              {!addTag && tags.length === 0 && <span className="faint" style={{ fontSize: 12.5 }}>Nenhuma etiqueta ainda.</span>}
            </div>
          </div>
        </div>

        {/* Linha 3 — Agendamentos + Diários do paciente */}
        <div className="grid gcols" style={{ gridTemplateColumns: "1fr 1fr", marginBottom: 18 }}>
          <div className="card pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="eyebrow">Agendamentos</span>
              <button className="iconbtn" style={{ width: 30, height: 30 }} title="Novo agendamento" onClick={() => setNovoAgendamento(true)}><Plus size={15} /></button>
            </div>
            {hasAppts ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {apptsDoPaciente.map((a) => (
                  <div key={a.id} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ textAlign: "center", minWidth: 52 }}><div className="num" style={{ fontWeight: 600, fontSize: 15 }}>{a.hora}</div><div className="faint" style={{ fontSize: 11 }}>{WEEKDAYS[a.dia]}</div></div>
                    <div style={{ width: 1, alignSelf: "stretch", background: "var(--border)" }} />
                    <div style={{ flex: 1 }}><div className="h3">{a.tipo}</div><span className={cx("chip", a.modo === "Online" ? "blue" : "sage")} style={{ marginTop: 4, height: 22 }}>{a.modo}</span></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "22px 12px" }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--surface2)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}><Calendar size={22} className="faint" /></div>
                <div className="h3">Nenhum agendamento à frente</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4, maxWidth: "34ch", marginInline: "auto" }}>Não há consultas ou retornos agendados a partir de hoje para este paciente.</div>
              </div>
            )}
          </div>

          <div className="card pad">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span className="eyebrow">Diários do paciente</span>
              <button className="btn subtle sm" onClick={() => go("diario")}>Ver tudo<ArrowRight size={13} /></button>
            </div>
            <div className="grid gcols" style={{ gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
              {diary.slice(0, 4).map((d, i) => (
                <div key={d.id} className="diary" onClick={() => setViewer(d)}>
                  <div className="diary-img" style={{ height: 90, background: "linear-gradient(150deg," + d.g[0] + "," + d.g[1] + ")", display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: 8 }}>
                    <span className="t">{d.quando.split(" · ")[0]}</span>
                    <span style={{ display: "flex", gap: 7, color: "#fff" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11 }}><Heart size={11} fill={d.liked ? "#fff" : "none"} />{d.react}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 11 }}><MessageCircle size={11} />{d.comments.length}</span>
                    </span>
                  </div>
                  <div className="bar" style={{ height: 4, borderRadius: 0 }}><i style={{ width: (62 + i * 9) + "%" }} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Linha 4 — Evolução de avaliações */}
        <div className="card pad">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span className="eyebrow">Evolução de avaliações</span>
            <button className="btn subtle sm" onClick={() => go("antrop")}>Ver todos<ArrowRight size={13} /></button>
          </div>
          <div className="faint" style={{ fontSize: 11.5, marginTop: 3, marginBottom: 16 }}>Desde a 1ª avaliação em {firstAnt.data}</div>
          <div className="grid gcols" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
            {minis.map((mn, idx) => {
              const v1 = lastAnt[mn.k], vprev = prev[mn.k];
              const suf = mn.un === "%" ? "%" : "";
              return (
                <div key={mn.k} style={{ paddingLeft: idx ? 18 : 0, borderLeft: idx ? "1px solid var(--border)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="muted" style={{ fontSize: 12.5 }}>{mn.label}{mn.un && mn.un !== "%" ? <span className="faint"> ({mn.un})</span> : null}</span>
                    <Delta v={pct(vprev, v1)} invert={mn.invert} />
                  </div>
                  <div className="stat-val num" style={{ margin: "5px 0 1px" }}>{v1.toLocaleString("pt-BR")}{suf}</div>
                  <div className="faint num" style={{ fontSize: 11.5 }}>última avaliação {vprev.toLocaleString("pt-BR")}{suf}</div>
                  <div style={{ height: 72, marginTop: 8 }}>
                    <ResponsiveContainer>
                      <LineChart data={EVO} margin={{ top: 6, right: 4, left: 0, bottom: 0 }}>
                        <XAxis dataKey="data" tick={{ fontSize: 9, fill: "var(--faint)" }} tickLine={false} axisLine={false} interval={2} />
                        <Tooltip />
                        <Line type="monotone" dataKey={mn.k} stroke={mn.color} strokeWidth={2} dot={{ r: 2, fill: mn.color }} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {editOpen && (
          <Modal title="Editar paciente" sub={sel.nome} onClose={() => setEditOpen(false)} max={560}
            footer={<><button className="btn ghost" onClick={() => setEditOpen(false)}>Cancelar</button><button className="btn primary" disabled={!editForm.nome.trim()} onClick={saveEdit}><Check size={15} />Salvar alterações</button></>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Nome *</label><input className="input" value={editForm.nome} onChange={(e) => setEditForm({ ...editForm, nome: e.currentTarget.value })} /></div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label>Email</label><input className="input" type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.currentTarget.value })} placeholder="Email (opcional)" /></div>
                <div className="field"><label>Gênero</label><div className="seg" style={{ width: "100%" }}>{(["Masculino", "Feminino"] as const).map((s) => (
                  <button key={s} style={{ flex: 1 }} className={cx(editForm.sexo === s && "on")} onClick={() => setEditForm({ ...editForm, sexo: s })}>{s}</button>
                ))}</div></div>
              </div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label>Data de nascimento</label><input className="input num" type="date" value={editForm.dataNascimento} onChange={(e) => setEditForm({ ...editForm, dataNascimento: e.currentTarget.value })} /></div>
                <div className="field"><label>Celular com DDD</label><input className="input num" value={editForm.telefone} onChange={(e) => setEditForm({ ...editForm, telefone: e.currentTarget.value })} placeholder="(11) 98888-7777" /></div>
              </div>
              <div className="field"><label>CPF/CNPJ</label><input className="input num" value={editForm.cpfCnpj} onChange={(e) => setEditForm({ ...editForm, cpfCnpj: e.currentTarget.value })} placeholder="000.000.000-00" /></div>
              <div className="field"><label>Observação</label><textarea className="input" rows={3} value={editForm.observacao} onChange={(e) => setEditForm({ ...editForm, observacao: e.currentTarget.value })} placeholder="Adicione uma observação sobre o paciente" /></div>
            </div>
          </Modal>
        )}

        {novoAgendamento && (
          <Modal title="Novo agendamento" sub={sel.nome} onClose={() => setNovoAgendamento(false)}
            footer={<><button className="btn ghost" onClick={() => setNovoAgendamento(false)}>Cancelar</button><button className="btn primary" onClick={criarAgendamento}><CalendarPlus size={15} />Agendar</button></>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div className="field"><label>Dia da semana</label><select className="select" value={agendaForm.dia} onChange={(e) => setAgendaForm({ ...agendaForm, dia: e.currentTarget.value })}>{WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}</select></div>
                <div className="field"><label>Hora</label><input className="input num" value={agendaForm.hora} onChange={(e) => setAgendaForm({ ...agendaForm, hora: e.currentTarget.value })} placeholder="14:00" /></div>
              </div>
              <div className="field"><label>Tipo</label><input className="input" value={agendaForm.tipo} onChange={(e) => setAgendaForm({ ...agendaForm, tipo: e.currentTarget.value })} /></div>
              <div className="field"><label>Modalidade</label><div className="seg" style={{ width: "100%" }}>
                <button className={cx(agendaForm.modo === "Online" && "on")} style={{ flex: 1 }} onClick={() => setAgendaForm({ ...agendaForm, modo: "Online" })}>Online</button>
                <button className={cx(agendaForm.modo === "Presencial" && "on")} style={{ flex: 1 }} onClick={() => setAgendaForm({ ...agendaForm, modo: "Presencial" })}>Presencial</button>
              </div></div>
            </div>
          </Modal>
        )}

        {hidratacaoOpen && (
          <Modal title="Hidratação" sub={sel.nome} onClose={() => setHidratacaoOpen(false)}
            footer={<button className="btn ghost" onClick={() => setHidratacaoOpen(false)}>Fechar</button>}>
            <div className="portal-water">
              <div className="portal-water-cups">
                {Array.from({ length: metaCopos }).map((_, i) => {
                  const filled = i < copos;
                  return (
                    <button key={i} type="button" className={cx("portal-cup", filled && "filled")}
                      onClick={() => setCopos(i + 1 === copos ? i : i + 1)} aria-label={`Copo ${i + 1} de ${metaCopos}`}>
                      <GlassWater size={18} />
                    </button>
                  );
                })}
              </div>
              <div className="portal-water-readout">
                <strong className="num" style={{ fontSize: 22 }}>{copos}</strong><span>de {metaCopos} copos hoje</span>
              </div>
              <div className="portal-water-actions">
                <button className="iconbtn" onClick={() => setCopos(copos - 1)} disabled={copos <= 0} aria-label="Remover um copo"><Minus size={15} /></button>
                <button className="btn primary sm" onClick={() => setCopos(copos + 1)} disabled={copos >= metaCopos}><Plus size={13} />1 copo</button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- ANTROPOMETRIA ---- */
  function renderAntrop() {
    return (
      <>
        <div className="sechead">
          <div><div className="h1">Antropometria</div><p>Medidas, dobras cutâneas e composição corporal com cálculo automático de IMC e RCQ.</p></div>
          <button className="btn primary" onClick={() => setAntOpen(true)}><Plus size={16} />Nova avaliação</button>
        </div>
        <div className="row gcols" style={{ marginBottom: 16 }}>
          {[["Peso atual", lastAnt.peso + " kg"], ["IMC", lastAnt.imc], ["% Gordura", lastAnt.gordura + "%"], ["Avaliações", antRows.length]].map(([l, v]) => (
            <div key={l} className="card pad" style={{ flex: 1, minWidth: 130 }}><div className="faint" style={{ fontSize: 11.5 }}>{l}</div><div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{v}</div></div>
          ))}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="tbl">
            <thead><tr><th>Data</th><th className="num">Peso (kg)</th><th className="num">IMC</th><th className="num">% Gord.</th><th className="num">Cintura</th><th className="num">Quadril</th><th className="num">RCQ</th></tr></thead>
            <tbody>{antRows.map((r, i) => (
              <tr key={i}><td>{r.data}</td><td className="num">{r.peso.toLocaleString("pt-BR")}</td><td className="num">{r.imc}</td><td className="num">{r.gord}</td><td className="num">{r.cint}</td><td className="num">{r.quad}</td><td className="num">{r.rcq}</td></tr>
            ))}</tbody>
          </table>
        </div>
        {antOpen && (
          <Modal title="Nova avaliação antropométrica" sub="O IMC é calculado automaticamente" onClose={() => setAntOpen(false)}
            footer={<>
              <button className="btn ghost" onClick={() => setAntOpen(false)}>Cancelar</button>
              <button className="btn primary" disabled={!antF.data || !antF.peso} onClick={() => {
                const imc = antImc ? +antImc.toFixed(1) : 0;
                setAntRows([{ data: antF.data, peso: +antF.peso, imc, gord: 0, cint: +antF.cint || 0, quad: +antF.quad || 0, rcq: antF.cint && antF.quad ? +(+antF.cint / +antF.quad).toFixed(2) : 0 }, ...antRows]);
                setAntOpen(false); setAntF({ data: "", peso: "", altura: "1.67", cint: "", quad: "" }); toast("Avaliação registrada");
              }}>Salvar avaliação</button></>}>
            <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="field"><label>Data</label><input className="input" placeholder="dd/mm/aaaa" value={antF.data} onChange={(e) => setAntF({ ...antF, data: e.currentTarget.value })} /></div>
              <div className="field"><label>Peso (kg)</label><input className="input num" inputMode="decimal" value={antF.peso} onChange={(e) => setAntF({ ...antF, peso: e.currentTarget.value })} /></div>
              <div className="field"><label>Altura (m)</label><input className="input num" value={antF.altura} onChange={(e) => setAntF({ ...antF, altura: e.currentTarget.value })} /></div>
              <div className="field"><label>IMC (auto)</label><div className="input num" style={{ display: "flex", alignItems: "center", color: antImc ? "var(--sage-strong)" : "var(--faint)", background: "var(--surface2)" }}>{antImc ? antImc.toFixed(1) : "—"}</div></div>
              <div className="field"><label>Cintura (cm)</label><input className="input num" value={antF.cint} onChange={(e) => setAntF({ ...antF, cint: e.currentTarget.value })} /></div>
              <div className="field"><label>Quadril (cm)</label><input className="input num" value={antF.quad} onChange={(e) => setAntF({ ...antF, quad: e.currentTarget.value })} /></div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- CÁLCULO ENERGÉTICO ---- */
  function renderEnergetico() {
    const peso = lastAnt.peso, alt = PAT.altura * 100, idade = PAT.idade;
    let tmb;
    if (enFormula === "Mifflin") tmb = 10 * peso + 6.25 * alt - 5 * idade - 161;
    else if (enFormula === "Harris") tmb = 447.593 + 9.247 * peso + 3.098 * alt - 4.330 * idade;
    else tmb = 8.7 * peso + 829;
    tmb = Math.round(tmb);
    const get = Math.round(tmb * enFator);
    const mult = enObj === "deficit" ? 1 - enAjuste / 100 : enObj === "superavit" ? 1 + enAjuste / 100 : 1;
    const meta = Math.round(get * mult);
    const macros: [string, number, number, string][] = [["Proteínas", 0.25, 4, "var(--sage)"], ["Carboidratos", 0.50, 4, "var(--blue)"], ["Gorduras", 0.25, 9, "var(--terra)"]];
    return (
      <>
        <div className="sechead"><div><div className="h1">Cálculo energético</div><p>TMB e gasto energético total com fórmula selecionável e ajuste por objetivo.</p></div></div>
        <div className="grid gcols" style={{ gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card pad">
            <div className="field" style={{ marginBottom: 16 }}><label>Fórmula da taxa metabólica basal</label>
              <div className="seg">{[["Mifflin", "Mifflin-St Jeor"], ["Harris", "Harris-Benedict"], ["FAO", "FAO/OMS"]].map(([k, l]) => (
                <button key={k} className={cx(enFormula === k && "on")} onClick={() => setEnFormula(k)}>{l}</button>))}</div></div>
            <div className="field" style={{ marginBottom: 16 }}><label>Fator de atividade física</label>
              <select className="select" value={enFator} onChange={(e) => setEnFator(+e.currentTarget.value)}>
                <option value={1.2}>Sedentário — 1,2</option><option value={1.375}>Levemente ativo — 1,375</option>
                <option value={1.55}>Moderadamente ativo — 1,55</option><option value={1.725}>Muito ativo — 1,725</option><option value={1.9}>Extremamente ativo — 1,9</option></select></div>
            <div className="field" style={{ marginBottom: 14 }}><label>Objetivo</label>
              <div className="seg">{[["deficit", "Déficit"], ["manutencao", "Manutenção"], ["superavit", "Superávit"]].map(([k, l]) => (
                <button key={k} className={cx(enObj === k && "on")} onClick={() => setEnObj(k)}>{l}</button>))}</div></div>
            {enObj !== "manutencao" && (
              <div className="field"><label>Ajuste calórico — <span className="num">{enAjuste}%</span></label>
                <input type="range" min="5" max="30" step="5" value={enAjuste} onChange={(e) => setEnAjuste(+e.currentTarget.value)} style={{ accentColor: "var(--sage)" }} /></div>)}
          </div>
          <div className="card pad">
            <span className="eyebrow">Resultado</span>
            <div className="row" style={{ gap: 16, margin: "12px 0" }}>
              <div style={{ flex: 1 }}><div className="faint" style={{ fontSize: 11.5 }}>TMB</div><div className="num" style={{ fontSize: 20, fontWeight: 600 }}>{tmb} <span className="faint" style={{ fontSize: 12 }}>kcal</span></div></div>
              <div style={{ flex: 1 }}><div className="faint" style={{ fontSize: 11.5 }}>GET</div><div className="num" style={{ fontSize: 20, fontWeight: 600 }}>{get} <span className="faint" style={{ fontSize: 12 }}>kcal</span></div></div>
            </div>
            <div style={{ background: "var(--sage-soft)", borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div className="muted" style={{ fontSize: 12 }}>Meta calórica diária</div>
              <div className="num" style={{ fontSize: 30, fontWeight: 600, color: "var(--sage-strong)" }}>{meta} <span style={{ fontSize: 14 }}>kcal</span></div></div>
            <div className="eyebrow" style={{ marginBottom: 8 }}>Distribuição de macronutrientes</div>
            {macros.map(([l, pc, kcal, c]) => { const g = Math.round((meta * pc) / kcal);
              return (
                <div key={l} style={{ marginBottom: 9 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 4 }}>
                    <span>{l} <span className="faint num">· {Math.round(pc * 100)}%</span></span><span className="num" style={{ fontWeight: 600 }}>{g} g</span></div>
                  <div className="bar"><i style={{ width: pc * 100 + "%", background: c }} /></div>
                </div>);
            })}
          </div>
        </div>
      </>
    );
  }

  /* ---- PLANO ALIMENTAR ---- */
  function renderPlano() {
    return (
      <>
        <div className="sechead">
          <div>
            <div className="h1">Plano alimentar</div>
            <p>{plano ? <>{plano.titulo} <span className="chip sage" style={{ height: 21 }}>{plano.periodo}</span></> : `Nenhum plano alimentar criado para ${sel.nome.split(" ")[0]} ainda.`}</p>
          </div>
          <div style={{ display: "flex", gap: 9 }}>
            {plano && <button className="btn ghost" onClick={() => toast("Comparando versões")}>Histórico</button>}
            {plano && <button className="btn primary" onClick={() => toast("Plano enviado ao paciente")}><Send size={15} />Enviar ao paciente</button>}
            <button className={cx("btn", plano ? "ghost" : "primary")} onClick={abrirCriarPlano}><Plus size={15} />{plano ? "Novo plano" : "Criar plano alimentar"}</button>
          </div>
        </div>

        {!plano ? (
          <div className="card pad" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--sage-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Utensils size={26} color="var(--sage)" /></div>
            <div className="h3">Comece definindo a meta e as refeições</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: "44ch", marginInline: "auto" }}>Depois de criado, você adiciona os alimentos de cada refeição pela biblioteca — e é esse plano que {sel.nome.split(" ")[0]} passa a ver no portal dela.</div>
          </div>
        ) : (
          <>
            <div className="banner ok" style={{ marginBottom: 16 }}><Sparkles size={16} style={{ flexShrink: 0, marginTop: 1 }} />
              Total do dia: <b className="num" style={{ margin: "0 4px" }}>{planTotal} kcal</b> de meta de <b className="num" style={{ margin: "0 4px" }}>{plano.kcal.toLocaleString("pt-BR")} kcal</b>. Esse é o plano que a paciente vê no portal dela.</div>
            <div className="grid" style={{ gap: 12 }}>
              {plano.refeicoes.map((m, mi) => { const tot = m.itens.reduce((s, i) => s + (i.kcal ?? 0), 0);
                return (
                  <div key={mi} className="meal">
                    <div className="meal-h"><span className="h3">{m.nome}</span><span className="num faint" style={{ fontSize: 12 }}>{tot} kcal</span></div>
                    {m.itens.map((it, ii) => (
                      <div key={ii} className="meal-item">
                        <Salad size={15} className="faint" style={{ flexShrink: 0 }} /><span style={{ flex: 1 }}>{it.nome}</span>
                        {it.porcao && <span className="chip" style={{ height: 21 }}>{it.porcao}</span>}
                        {it.kcal != null && <span className="num faint" style={{ fontSize: 12, minWidth: 56, textAlign: "right" }}>{it.kcal} kcal</span>}
                        <button className="iconbtn" style={{ width: 26, height: 26 }} onClick={() => updateMeal(mi, (mm) => ({ ...mm, itens: mm.itens.filter((_, y) => y !== ii) }))}><Trash2 size={13} /></button>
                      </div>
                    ))}
                    {m.itens.length === 0 && <div className="faint" style={{ fontSize: 12.5, padding: "10px 13px" }}>Nenhum alimento ainda.</div>}
                    <div className="meal-item" style={{ background: "var(--surface2)" }}>
                      <button className="btn subtle sm" onClick={() => { setFoodPick(mi); setFoodQ(""); }}><Plus size={13} />Adicionar alimento</button></div>
                  </div>);
              })}
            </div>
          </>
        )}

        {foodPick !== null && plano && (
          <Modal title="Biblioteca de alimentos" sub={"Adicionando em " + plano.refeicoes[foodPick].nome} onClose={() => { setFoodPick(null); setNovoAlimento(false); }} max={460}>
            <div className="field" style={{ marginBottom: 12 }}><input autoFocus className="input" placeholder="Buscar alimento…" value={foodQ} onChange={(e) => setFoodQ(e.currentTarget.value)} /></div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, maxHeight: 280, overflowY: "auto" }}>
              {foods.filter((f) => f[0].toLowerCase().includes(foodQ.toLowerCase())).map((f, i) => (
                <div key={i} className="meal-item" style={{ border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer" }}
                  onClick={() => adicionarAoMeal(foodPick, f)}>
                  <span style={{ flex: 1 }}>{f[0]}</span><span className="chip" style={{ height: 21 }}>{f[1]}</span>
                  <span className="num faint" style={{ fontSize: 12 }}>{f[2]} kcal</span><Plus size={14} className="faint" /></div>
              ))}
              {foods.filter((f) => f[0].toLowerCase().includes(foodQ.toLowerCase())).length === 0 && (
                <div className="faint" style={{ fontSize: 12.5, padding: "10px 2px" }}>Nenhum alimento encontrado.</div>
              )}
            </div>

            {!novoAlimento ? (
              <button className="btn ghost sm" style={{ width: "100%", marginTop: 12 }}
                onClick={() => { setNovoAlimentoForm({ nome: foodQ, porcao: "", kcal: "" }); setNovoAlimento(true); }}>
                <Plus size={13} />Criar alimento{foodQ ? ` "${foodQ}"` : " personalizado"}
              </button>
            ) : (
              <div style={{ marginTop: 12, padding: 12, border: "1.5px dashed var(--border)", borderRadius: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="eyebrow" style={{ marginBottom: 2 }}>Novo alimento</div>
                <input autoFocus className="input" placeholder="Nome do alimento" value={novoAlimentoForm.nome} onChange={(e) => setNovoAlimentoForm({ ...novoAlimentoForm, nome: e.currentTarget.value })}
                  onKeyDown={(e) => { if (e.key === "Enter" && novoAlimentoForm.nome.trim()) criarAlimentoCustom(); }} />
                <div style={{ display: "flex", gap: 8 }}>
                  <input className="input" placeholder="Porção (ex.: 100 g)" value={novoAlimentoForm.porcao} onChange={(e) => setNovoAlimentoForm({ ...novoAlimentoForm, porcao: e.currentTarget.value })} />
                  <input className="input num" style={{ maxWidth: 100 }} placeholder="kcal" inputMode="numeric" value={novoAlimentoForm.kcal} onChange={(e) => setNovoAlimentoForm({ ...novoAlimentoForm, kcal: e.currentTarget.value })} />
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                  <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => setNovoAlimento(false)}>Cancelar</button>
                  <button className="btn primary sm" style={{ flex: 1 }} disabled={!novoAlimentoForm.nome.trim()} onClick={criarAlimentoCustom}><Check size={13} />Criar e adicionar</button>
                </div>
              </div>
            )}
          </Modal>
        )}

        {criarPlanoOpen && (
          <Modal title={plano ? "Novo plano alimentar" : "Criar plano alimentar"} sub={sel.nome} onClose={() => setCriarPlanoOpen(false)} max={520}
            footer={<>
              <button className="btn ghost" onClick={() => setCriarPlanoOpen(false)}>Cancelar</button>
              <button className="btn primary" disabled={planoForm.refeicoesSelecionadas.length === 0} onClick={criarPlano}><Check size={15} />Criar plano</button>
            </>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Título</label><input className="input" value={planoForm.titulo} onChange={(e) => setPlanoForm({ ...planoForm, titulo: e.currentTarget.value })} /></div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                <div className="field"><label>Meta (kcal)</label><input className="input num" value={planoForm.kcal} onChange={(e) => setPlanoForm({ ...planoForm, kcal: e.currentTarget.value })} inputMode="numeric" /></div>
                <div className="field"><label>Proteína (g)</label><input className="input num" value={planoForm.proteina} onChange={(e) => setPlanoForm({ ...planoForm, proteina: e.currentTarget.value })} inputMode="numeric" /></div>
                <div className="field"><label>Água (ml)</label><input className="input num" value={planoForm.agua} onChange={(e) => setPlanoForm({ ...planoForm, agua: e.currentTarget.value })} inputMode="numeric" /></div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 9 }}>Refeições incluídas</div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {REFEICOES_PADRAO.map((nome) => {
                    const on = planoForm.refeicoesSelecionadas.includes(nome);
                    return (
                      <span key={nome} className="chip" style={{ cursor: "pointer", height: 28, background: on ? "var(--sage-soft)" : "var(--surface2)", color: on ? "var(--sage-strong)" : "var(--muted)", borderColor: on ? "transparent" : "var(--border)" }} onClick={() => toggleRefeicaoForm(nome)}>
                        {on && <Check size={11} />}{nome}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- GESTACIONAL ---- */
  function renderGestacional() {
    const cur = GEST[GEST.length - 1];
    const acima = cur.ganho > cur.max;
    return (
      <>
        <div className="sechead"><div><div className="h1">Acompanhamento gestacional</div><p>Curva de ganho de peso por semana com faixa recomendada para IMC pré-gestacional normal (23,3).</p></div></div>
        <div className="row gcols" style={{ marginBottom: 16 }}>
          {[["Idade gestacional", "28 sem"], ["Ganho total", "+10,3 kg"], ["Faixa recomendada", "6,5–9,5 kg"], ["IMC pré-gest.", "23,3"]].map(([l, v]) => (
            <div key={l} className="card pad" style={{ flex: 1, minWidth: 140 }}><div className="faint" style={{ fontSize: 11.5 }}>{l}</div><div className="num" style={{ fontSize: 20, fontWeight: 600, marginTop: 4 }}>{v}</div></div>
          ))}
        </div>
        <div className={cx("banner", acima ? "warn" : "ok")} style={{ marginBottom: 16 }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          {acima ? <span>Ganho de peso <b>0,8 kg acima</b> da faixa recomendada para 28 semanas. Avaliar fracionamento e qualidade dos carboidratos.</span>
            : <span>Ganho de peso dentro da faixa recomendada para a idade gestacional.</span>}
        </div>
        <div className="card pad">
          <span className="eyebrow">Curva de ganho de peso (kg) × semana gestacional</span>
          <div style={{ height: 290, marginTop: 14 }}>
            <ResponsiveContainer>
              <AreaChart data={GEST} margin={{ top: 6, right: 8, left: -18, bottom: 0 }}>
                <defs><linearGradient id="band" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--sage)" stopOpacity={0.18} /><stop offset="100%" stopColor="var(--sage)" stopOpacity={0.04} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 4" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="sem" tick={{ fontSize: 11, fill: "var(--faint)" }} tickLine={false} axisLine={false} unit="s" />
                <YAxis tick={{ fontSize: 11, fill: "var(--faint)" }} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="max" stroke="none" fill="url(#band)" name="Máx. recomendado" />
                <Area type="monotone" dataKey="min" stroke="none" fill="var(--surface)" name="Mín. recomendado" />
                <Line type="monotone" dataKey="ganho" stroke="var(--terra)" strokeWidth={2.5} dot={{ r: 3, fill: "var(--terra)" }} name="Ganho real" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 18, marginTop: 10, fontSize: 12 }} className="muted">
            <span><i style={{ display: "inline-block", width: 18, height: 8, background: "var(--sage-soft)", borderRadius: 3, marginRight: 6, verticalAlign: "middle" }} />Faixa recomendada</span>
            <span><i style={{ display: "inline-block", width: 18, height: 3, background: "var(--terra)", borderRadius: 3, marginRight: 6, verticalAlign: "middle" }} />Ganho real da paciente</span>
          </div>
        </div>
      </>
    );
  }

  /* ---- MANIPULADO ---- */
  function renderManipulado() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Manipulado</div><p>Prescrição de fórmulas manipuladas com componentes, dosagem e posologia.</p></div>
          <button className="btn primary" onClick={abrirNovaPrescricao}><Plus size={16} />Nova prescrição</button></div>
        {prescricoes.length === 0 ? (
          <div className="card pad" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--terra-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><Pill size={26} color="var(--terra)" /></div>
            <div className="h3">Nenhuma prescrição manipulada ainda</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: "40ch", marginInline: "auto" }}>Crie uma prescrição com os componentes, a dosagem e a posologia.</div>
          </div>
        ) : (
          <div className="grid gcols" style={{ gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {prescricoes.map((p, i) => (
              <div key={i} className="card pad">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9 }}><div style={{ width: 30, height: 30, borderRadius: 9, background: "var(--terra-soft)", display: "grid", placeItems: "center" }}><Pill size={16} color="var(--terra)" /></div><span className="h3">{p.nome}</span></div>
                  <span className="chip" style={{ height: 22 }}>{p.dur}</span></div>
                {p.comp.map((c, ci) => (<div key={ci} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderTop: ci ? "1px solid var(--border)" : "none" }}><span className="muted">{c[0]}</span><span className="num">{c[1]}</span></div>))}
                <div style={{ marginTop: 10, padding: 10, background: "var(--surface2)", borderRadius: 10, fontSize: 12.5 }}><span className="faint">Posologia · </span>{p.pos}</div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn ghost sm" style={{ flex: 1 }} onClick={() => toast("Receita gerada em PDF")}><FileText size={14} />Imprimir</button>
                  <button className="btn subtle sm" style={{ flex: 1 }} onClick={() => toast("Prescrição enviada")}><Send size={14} />Enviar</button>
                  <button className="iconbtn" style={{ flexShrink: 0 }} onClick={() => setPrescricoes(prescricoes.filter((_, x) => x !== i))}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {novaPrescricaoOpen && (
          <Modal title="Nova prescrição manipulada" sub={sel.nome} onClose={() => setNovaPrescricaoOpen(false)} max={520}
            footer={<>
              <button className="btn ghost" onClick={() => setNovaPrescricaoOpen(false)}>Cancelar</button>
              <button className="btn primary" disabled={!prescricaoForm.nome.trim() || !prescricaoForm.comp.some(([n]) => n.trim())} onClick={criarPrescricao}><Check size={15} />Criar prescrição</button>
            </>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Nome da fórmula</label><input className="input" autoFocus value={prescricaoForm.nome} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, nome: e.currentTarget.value })} placeholder="Ex.: Suporte imunológico" /></div>

              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Componentes</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {prescricaoForm.comp.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <input className="input" style={{ flex: 1 }} placeholder="Componente (ex.: Vitamina D3)" value={c[0]}
                        onChange={(e) => setPrescricaoForm({ ...prescricaoForm, comp: prescricaoForm.comp.map((x, xi) => xi === i ? [e.currentTarget.value, x[1]] : x) })} />
                      <input className="input num" style={{ width: 130 }} placeholder="Dosagem" value={c[1]}
                        onChange={(e) => setPrescricaoForm({ ...prescricaoForm, comp: prescricaoForm.comp.map((x, xi) => xi === i ? [x[0], e.currentTarget.value] : x) })} />
                      <button className="iconbtn" style={{ flexShrink: 0 }} onClick={() => setPrescricaoForm({ ...prescricaoForm, comp: prescricaoForm.comp.filter((_, xi) => xi !== i) })} disabled={prescricaoForm.comp.length === 1}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <button className="btn subtle sm" style={{ marginTop: 8 }} onClick={() => setPrescricaoForm({ ...prescricaoForm, comp: [...prescricaoForm.comp, ["", ""]] })}><Plus size={13} />Adicionar componente</button>
              </div>

              <div className="field"><label>Posologia</label><input className="input" value={prescricaoForm.pos} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, pos: e.currentTarget.value })} placeholder="Ex.: 1 cápsula ao dia, após o almoço" /></div>
              <div className="field"><label>Duração</label><input className="input" value={prescricaoForm.dur} onChange={(e) => setPrescricaoForm({ ...prescricaoForm, dur: e.currentTarget.value })} placeholder="Ex.: 60 dias" /></div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- EXAME ---- */
  function renderExame() {
    const fora = EXAMES.filter((e) => e.flag !== "ok").length;
    return (
      <>
        <div className="sechead"><div><div className="h1">Exame</div><p>Upload de laudos com extração de valores por IA e sinalização do que está fora da referência.</p></div></div>
        <div className="grid gcols" style={{ gridTemplateColumns: "300px 1fr", gap: 16 }}>
          <div>
            <div className={cx("upload", exameDragOver && "drag")} style={{ cursor: exameExtraindo ? "default" : "pointer" }}
              onClick={() => !exameExtraindo && exameInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); if (!exameExtraindo) setExameDragOver(true); }}
              onDragLeave={() => setExameDragOver(false)}
              onDrop={(e) => { if (!exameExtraindo) onDropExame(e); else e.preventDefault(); }}>
              <input ref={exameInputRef} type="file" accept=".pdf,image/*" style={{ display: "none" }}
                onChange={(e) => { const file = e.target.files?.[0]; if (file) processarArquivoExame(file); e.currentTarget.value = ""; }} />
              {exameExtraindo ? (
                <><RefreshCw size={22} className="spin" style={{ marginBottom: 8 }} /><div style={{ fontWeight: 600, fontSize: 13 }}>Extraindo valores…</div></>
              ) : (
                <><Upload size={22} style={{ marginBottom: 8 }} /><div style={{ fontWeight: 600, fontSize: 13 }}>{exameDragOver ? "Solte para enviar" : "Arraste o laudo"}</div><div className="faint" style={{ fontSize: 12, marginTop: 2 }}>ou clique para selecionar · PDF até 10 MB</div></>
              )}
            </div>
            {exameFile && (
              <div className="card pad" style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={18} color="var(--terra)" /><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{exameFile.nome}</div><div className="faint" style={{ fontSize: 11 }}>{exameFile.tamanho} · {exameFile.data}</div></div>
                <span className="chip sage" style={{ height: 22 }}><Sparkles size={11} />IA</span></div>
            )}
          </div>
          <div className="card" style={{ overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="h3">Valores extraídos</span><span className="chip terra" style={{ height: 22 }}>{fora} fora da referência</span></div>
            <table className="tbl">
              <thead><tr><th>Exame</th><th className="num">Resultado</th><th className="num">Referência</th><th>Status</th></tr></thead>
              <tbody>{EXAMES.map((e, i) => (
                <tr key={i} style={e.flag !== "ok" ? { background: "var(--terra-soft)" } : undefined}>
                  <td>{e.nome}</td><td className="num" style={{ fontWeight: 600 }}>{e.val} {e.un}</td><td className="num faint">{e.ref}</td>
                  <td>{e.flag === "ok" ? <span className="chip sage" style={{ height: 22 }}><Check size={11} />Normal</span> : <span className="chip red" style={{ height: 22 }}><ArrowDown size={11} />Abaixo</span>}</td></tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </>
    );
  }

  /* ---- ANAMNESE ---- */
  function renderAnamnese() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Anamnese</div><p>Histórico de saúde, hábitos alimentares, histórico familiar e queixa principal.</p></div>
          <button className="btn primary" onClick={() => toast("Anamnese salva")}><Check size={16} />Salvar</button></div>
        <div className="grid" style={{ gap: 14 }}>
          <div className="card pad"><div className="eyebrow" style={{ marginBottom: 10 }}>Queixa principal</div>
            <textarea className="input" rows={2} defaultValue="Acompanhamento nutricional gestacional. Relata cansaço e episódios de azia no fim do dia." /></div>
          <div className="row gcols">
            <div className="card pad" style={{ flex: 1, minWidth: 260 }}><div className="eyebrow" style={{ marginBottom: 10 }}>Histórico de saúde</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 10 }}>{["Anemia ferropriva", "Refluxo leve"].map((t) => <span key={t} className="chip amber">{t}</span>)}</div>
              <textarea className="input" rows={3} defaultValue="Sem doenças crônicas. Gestação única, sem intercorrências até o momento. Suplementação de ferro e ácido fólico." /></div>
            <div className="card pad" style={{ flex: 1, minWidth: 260 }}><div className="eyebrow" style={{ marginBottom: 10 }}>Histórico familiar</div>
              <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>{["Diabetes tipo 2 (avó)", "Hipertensão (pai)", "Obesidade (mãe)"].map((t) => <span key={t} className="chip">{t}</span>)}<span className="chip add"><Plus size={12} />adicionar</span></div></div>
          </div>
          <div className="row gcols">
            {[["Refeições por dia", "5 a 6"], ["Consumo de água", "~1,8 L/dia"], ["Frituras/semana", "1 a 2x"], ["Álcool", "Não"], ["Intestino", "Regular"], ["Sono", "6 a 7h · fragmentado"]].map(([l, v]) => (
              <div key={l} className="field" style={{ flex: "1 1 28%", minWidth: 150 }}><label>{l}</label><input className="input" defaultValue={v} /></div>
            ))}
          </div>
          <div className="card pad"><div className="eyebrow" style={{ marginBottom: 10 }}>Restrições e preferências alimentares</div>
            <textarea className="input" rows={2} defaultValue="Intolerância leve à lactose. Não gosta de fígado. Boa aceitação de vegetais e frutas." /></div>
        </div>
      </>
    );
  }

  /* ---- QUESTIONÁRIO ---- */
  function renderQuestionario() {
    const STATUS_META: Record<string, { label: string; tone: string }> = {
      rascunho: { label: "Rascunho", tone: "" },
      pendente: { label: "Enviado", tone: "amber" },
      respondido: { label: "Respondido", tone: "sage" },
    };
    const verRespostasQ = questionarios.find((q) => q.id === verRespostasId);
    const registrarRespostasQ = questionarios.find((q) => q.id === registrarRespostasId);
    return (
      <>
        <div className="sechead"><div><div className="h1">Questionário</div><p>Questionários customizáveis enviados a {sel.nome.split(" ")[0]} e suas respostas.</p></div>
          <button className="btn primary" onClick={abrirNovoQuestionario}><Plus size={16} />Novo questionário</button></div>

        {questionarios.length === 0 ? (
          <div className="card pad" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: "var(--sage-soft)", display: "grid", placeItems: "center", margin: "0 auto 16px" }}><ListChecks size={26} color="var(--sage)" /></div>
            <div className="h3">Nenhum questionário ainda</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4, maxWidth: "40ch", marginInline: "auto" }}>Crie um questionário com as perguntas que quiser e envie para {sel.nome.split(" ")[0]}.</div>
          </div>
        ) : (
          <div className="grid" style={{ gap: 12 }}>
            {questionarios.map((q) => {
              const meta = STATUS_META[q.status];
              const desc = q.status === "rascunho" ? `${q.perguntas.length} pergunta(s) · não enviado`
                : q.status === "pendente" ? `Prazo: ${q.prazo} · aguardando resposta`
                : `${q.perguntas.length} pergunta(s) respondida(s)`;
              return (
                <div key={q.id} className="card pad" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--sage-soft)", display: "grid", placeItems: "center" }}><ListChecks size={18} color="var(--sage)" /></div>
                  <div style={{ flex: 1, minWidth: 160 }}><div className="h3">{q.titulo}</div><div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{desc}</div></div>
                  <span className={cx("chip", meta.tone)} style={{ height: 24 }}>{meta.label}</span>
                  {q.status === "rascunho" && <button className="btn subtle sm" onClick={() => enviarQuestionario(q)}><Send size={13} />Enviar</button>}
                  {q.status === "pendente" && <>
                    <button className="btn subtle sm" onClick={() => reenviarQuestionario(q)}><Send size={13} />Reenviar</button>
                    <button className="btn ghost sm" onClick={() => abrirRegistrarRespostas(q)}>Registrar respostas</button>
                  </>}
                  {q.status === "respondido" && <button className="btn ghost sm" onClick={() => setVerRespostasId(q.id)}>Ver respostas</button>}
                </div>
              );
            })}
          </div>
        )}

        {novoQuestionarioOpen && (
          <Modal title="Novo questionário" sub={sel.nome} onClose={() => setNovoQuestionarioOpen(false)} max={560}
            footer={<>
              <button className="btn ghost" onClick={() => setNovoQuestionarioOpen(false)}>Cancelar</button>
              <button className="btn primary" disabled={!questionarioForm.titulo.trim() || !questionarioForm.perguntas.some((p) => p.texto.trim())} onClick={criarQuestionario}><Check size={15} />Criar questionário</button>
            </>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="field"><label>Título</label><input className="input" autoFocus value={questionarioForm.titulo} onChange={(e) => setQuestionarioForm({ ...questionarioForm, titulo: e.currentTarget.value })} placeholder="Ex.: Check-in semanal" /></div>
              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="field"><label>Categoria</label><input className="input" value={questionarioForm.categoria} onChange={(e) => setQuestionarioForm({ ...questionarioForm, categoria: e.currentTarget.value })} /></div>
                <div className="field"><label>Prazo</label><input className="input" value={questionarioForm.prazo} onChange={(e) => setQuestionarioForm({ ...questionarioForm, prazo: e.currentTarget.value })} placeholder="Ex.: 7 dias" /></div>
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "var(--muted)", marginBottom: 8 }}>Perguntas</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {questionarioForm.perguntas.map((p, i) => (
                    <div key={i} style={{ display: "flex", gap: 8 }}>
                      <input className="input" style={{ flex: 1 }} placeholder={`Pergunta ${i + 1}…`} value={p.texto} onChange={(e) => updatePerguntaForm(i, { texto: e.currentTarget.value })} />
                      <select className="select" style={{ width: 130, flexShrink: 0 }} value={p.tipo} onChange={(e) => updatePerguntaForm(i, { tipo: e.currentTarget.value as PerguntaTipo })}>
                        <option value="texto">Texto</option><option value="escala">Escala 1–5</option><option value="opcao">Múltipla escolha</option>
                      </select>
                      <button className="iconbtn" style={{ flexShrink: 0 }} onClick={() => removePerguntaForm(i)} disabled={questionarioForm.perguntas.length === 1}><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
                <button className="btn subtle sm" style={{ marginTop: 8 }} onClick={addPerguntaForm}><Plus size={13} />Adicionar pergunta</button>
              </div>
            </div>
          </Modal>
        )}

        {verRespostasQ && (
          <Modal title="Respostas" sub={verRespostasQ.titulo} onClose={() => setVerRespostasId(null)} max={480}
            footer={<button className="btn ghost" onClick={() => setVerRespostasId(null)}>Fechar</button>}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {verRespostasQ.perguntas.map((p) => (
                <div key={p.id}>
                  <div className="muted" style={{ fontSize: 12.5 }}>{p.texto}</div>
                  <div style={{ fontWeight: 600, marginTop: 3, fontSize: 14 }}>{verRespostasQ.respostas?.[p.id] || "—"}</div>
                </div>
              ))}
            </div>
          </Modal>
        )}

        {registrarRespostasQ && (
          <Modal title="Registrar respostas" sub={registrarRespostasQ.titulo} onClose={() => setRegistrarRespostasId(null)} max={480}
            footer={<><button className="btn ghost" onClick={() => setRegistrarRespostasId(null)}>Cancelar</button><button className="btn primary" onClick={salvarRespostas}><Check size={15} />Salvar respostas</button></>}>
            <p className="muted" style={{ fontSize: 12.5, marginTop: -4, marginBottom: 14 }}>Use isso para registrar respostas obtidas por telefone ou presencialmente.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {registrarRespostasQ.perguntas.map((p) => (
                <div className="field" key={p.id}>
                  <label>{p.texto}</label>
                  {p.tipo === "opcao" ? (
                    <select className="select" value={respostasForm[p.id] ?? ""} onChange={(e) => setRespostasForm({ ...respostasForm, [p.id]: e.currentTarget.value })}>
                      <option value="" disabled>Selecione…</option>
                      {p.opcoes?.map((op) => <option key={op}>{op}</option>)}
                    </select>
                  ) : (
                    <input className="input" value={respostasForm[p.id] ?? ""} onChange={(e) => setRespostasForm({ ...respostasForm, [p.id]: e.currentTarget.value })} />
                  )}
                </div>
              ))}
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- DIÁRIO ALIMENTAR ---- */
  function renderDiario() {
    const addComment = (id: string, v: string) => { if (!v.trim()) return; setDiary(diary.map((x) => x.id === id ? { ...x, comments: [...x.comments, { a: "Você", t: v.trim() }] } : x)); setCdraft({ ...cdraft, [id]: "" }); toast("Comentário enviado"); };
    return (
      <>
        <div className="sechead"><div><div className="h1">Diário alimentar</div><p>Registros do paciente com foto. Reaja e comente para dar feedback.</p></div></div>
        <div className="grid" style={{ gap: 14, maxWidth: 640 }}>
          {diary.map((d) => (
            <div key={d.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px" }}>
                <Avatar initials={PAT.iniciais} size={32} />
                <div><div className="h3">{PAT.nome.split(" ")[0]}</div><div className="faint" style={{ fontSize: 11.5 }}>{d.ref} · {d.quando}</div></div>
              </div>
              <div style={{ height: 180, background: "linear-gradient(150deg," + d.g[0] + "," + d.g[1] + ")" }} />
              <div style={{ padding: 14 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{d.desc}</div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
                  <button className="btn subtle sm" onClick={() => setDiary(diary.map((x) => x.id === d.id ? { ...x, liked: !x.liked, react: x.react + (x.liked ? -1 : 1) } : x))}>
                    <Heart size={14} fill={d.liked ? "var(--terra)" : "none"} color={d.liked ? "var(--terra)" : "currentColor"} />{d.react}</button>
                  <span className="faint" style={{ fontSize: 12 }}><MessageCircle size={13} style={{ verticalAlign: "middle", marginRight: 4 }} />{d.comments.length} comentário(s)</span>
                </div>
                {d.comments.map((c, ci) => (
                  <div key={ci} style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <div style={{ width: 26, height: 26, borderRadius: 8, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Stethoscope size={13} color="var(--sage)" /></div>
                    <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "8px 11px", fontSize: 13 }}><b style={{ fontSize: 12 }}>{c.a}</b><div style={{ marginTop: 2 }}>{c.t}</div></div>
                  </div>
                ))}
                <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                  <input className="input" placeholder="Comentar como nutricionista…" value={cdraft[d.id] || ""} onChange={(e) => setCdraft({ ...cdraft, [d.id]: e.currentTarget.value })}
                    onKeyDown={(e) => { if (e.key === "Enter") addComment(d.id, e.currentTarget.value); }} />
                  <button className="btn primary" onClick={() => addComment(d.id, cdraft[d.id] || "")}><Send size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  /* ---- INSTRUÇÃO NUTRICIONAL ---- */
  function renderInstrucao() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Instrução nutricional</div><p>Biblioteca de orientações e materiais educativos para enviar ao paciente.</p></div></div>
        <div className="grid gcols" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
          {INSTR.map(([t, cat], i) => { const sent = sentInstr.includes(t);
            return (
              <div key={i} className="card pad" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "var(--sage-soft)", display: "grid", placeItems: "center" }}><BookOpen size={17} color="var(--sage)" /></div>
                <div><div className="h3" style={{ lineHeight: 1.3 }}>{t}</div><span className="chip" style={{ height: 21, marginTop: 6 }}>{cat}</span></div>
                <button className={cx("btn", sent ? "subtle" : "ghost", "sm")} style={{ marginTop: "auto" }} disabled={sent}
                  onClick={() => { setSentInstr([...sentInstr, t]); toast("Material enviado ao paciente"); }}>
                  {sent ? <><Check size={13} />Enviado</> : <><Send size={13} />Enviar</>}</button>
              </div>);
          })}
        </div>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Enviados ao paciente</div>
        <div className="card" style={{ overflow: "hidden" }}>
          {sentInstr.map((t, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderTop: i ? "1px solid var(--border)" : "none" }}><Check size={15} color="var(--sage)" /><span style={{ flex: 1, fontSize: 13 }}>{t}</span><span className="faint" style={{ fontSize: 12 }}>enviado</span></div>))}
        </div>
      </>
    );
  }

  /* ---- PRONTUÁRIO ---- */
  function renderProntuario() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Prontuário</div><p style={{ display: "flex", alignItems: "center", gap: 6 }}><Lock size={13} />Registro clínico cronológico — somente adição, entradas anteriores não são editáveis.</p></div></div>
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div className="eyebrow" style={{ marginBottom: 8 }}>Nova anotação</div>
          <textarea className="input" rows={3} placeholder="Registrar evolução da consulta…" value={pdraft} onChange={(e) => setPdraft(e.currentTarget.value)} />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button className="btn primary" disabled={!pdraft.trim()} onClick={() => { setPront([{ d: "16/06/2026", a: "Nutricionista", t: pdraft.trim() }, ...pront]); setPdraft(""); toast("Anotação adicionada ao prontuário"); }}><Plus size={15} />Adicionar ao prontuário</button>
          </div>
        </div>
        <div className="tl">
          {pront.map((p, i) => (
            <div key={i} className="tl-item">
              <div className="card pad" style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="h3 num">{p.d}</span><span className="chip" style={{ height: 21 }}><Lock size={10} />{p.a}</span></div>
                <div style={{ fontSize: 13.5, lineHeight: 1.55 }} className="muted">{p.t}</div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  /* ---- FINANCEIRO ---- */
  function renderFinanceiro() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Financeiro e recibo</div><p>Histórico de pagamentos, emissão de recibos e status de inadimplência.</p></div>
          <button className="iconbtn" onClick={() => setMask(!mask)}>{mask ? <EyeOff size={16} /> : <Eye size={16} />}</button></div>
        <div className="banner ok" style={{ marginBottom: 16 }}><Check size={16} />Pagamentos em dia. 1 cobrança agendada (não vencida).</div>
        <div className="row gcols" style={{ marginBottom: 16 }}>
          {[["Total recebido", brl(2200), "var(--sage-strong)"], ["Em aberto", brl(250), "var(--amber)"], ["Ticket médio", brl(275), "var(--text)"]].map(([l, v, c]) => (
            <div key={l} className="card pad" style={{ flex: 1, minWidth: 140 }}><div className="faint" style={{ fontSize: 11.5 }}>{l}</div><div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: c }}>{mask ? "••••" : v}</div></div>
          ))}
        </div>
        <div className="card" style={{ overflow: "hidden" }}>
          <table className="tbl">
            <thead><tr><th>Data</th><th>Descrição</th><th className="num">Valor</th><th>Forma</th><th>Status</th><th>Recibo</th></tr></thead>
            <tbody>{FIN.map((f, i) => (
              <tr key={i}><td className="num">{f.data}</td><td>{f.desc}</td><td className="num" style={{ fontWeight: 600 }}>{mask ? "••••" : brl(f.valor)}</td><td className="faint">{f.forma}</td>
                <td>{f.status === "Pago" ? <span className="chip sage" style={{ height: 22 }}>Pago</span> : <span className="chip amber" style={{ height: 22 }}>Pendente</span>}</td>
                <td>{f.status === "Pago" ? <button className="btn subtle sm" onClick={() => toast("Recibo emitido e baixado")}><Receipt size={13} />Emitir</button> : <span className="faint" style={{ fontSize: 12 }}>—</span>}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </>
    );
  }

  /* ---- METAS ---- */
  function renderMetas() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Metas</div><p>Metas de peso, hábitos e comportamentais com acompanhamento de progresso.</p></div>
          <button className="btn primary" onClick={() => setMetaOpen(true)}><Plus size={16} />Nova meta</button></div>
        <div className="grid" style={{ gap: 12 }}>
          {metas.map((m) => (
            <div key={m.id} className="card pad">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                <div><div className="h3">{m.t}</div><div className="faint" style={{ fontSize: 12, marginTop: 3 }}>{m.alvo}</div></div>
                <span className={cx("chip", m.tipo === "Clínica" ? "blue" : m.tipo === "Comportamental" ? "amber" : "sage")} style={{ height: 22 }}>{m.tipo}</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                <div className="bar" style={{ flex: 1 }}><i style={{ width: m.p + "%" }} /></div>
                <span className="num" style={{ fontWeight: 600, fontSize: 13, minWidth: 38, textAlign: "right" }}>{m.p}%</span>
                <button className="btn subtle sm" onClick={() => setMetas(metas.map((x) => x.id === m.id ? { ...x, p: Math.min(100, x.p + 10) } : x))}>+10%</button></div>
            </div>
          ))}
        </div>
        {metaOpen && (
          <Modal title="Nova meta" onClose={() => setMetaOpen(false)} footer={<>
            <button className="btn ghost" onClick={() => setMetaOpen(false)}>Cancelar</button>
            <button className="btn primary" disabled={!metaF.t.trim()} onClick={() => { setMetas([...metas, { id: uid(), t: metaF.t, alvo: metaF.alvo || "—", p: 0, tipo: metaF.tipo }]); setMetaOpen(false); setMetaF({ t: "", alvo: "", tipo: "Hábito" }); toast("Meta criada"); }}>Criar meta</button>
          </>}>
            <div className="grid" style={{ gap: 14 }}>
              <div className="field"><label>Meta</label><input className="input" placeholder="Ex.: Reduzir açúcar adicionado" value={metaF.t} onChange={(e) => setMetaF({ ...metaF, t: e.currentTarget.value })} /></div>
              <div className="field"><label>Alvo / descrição</label><input className="input" placeholder="Ex.: 7 dias por semana" value={metaF.alvo} onChange={(e) => setMetaF({ ...metaF, alvo: e.currentTarget.value })} /></div>
              <div className="field"><label>Tipo</label><div className="seg">{["Hábito", "Comportamental", "Clínica"].map((t) => <button key={t} className={cx(metaF.tipo === t && "on")} onClick={() => setMetaF({ ...metaF, tipo: t })}>{t}</button>)}</div></div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  /* ---- ATESTADO ---- */
  function renderAtestado() {
    const body = atTipo === "Atestado"
      ? "Atesto, para os devidos fins, que a paciente " + PAT.nome + " esteve em atendimento nutricional nesta data, necessitando de " + atDias + " dia(s) de afastamento de suas atividades" + (atCidOn ? " (CID " + atCid + ")" : "") + "."
      : "Declaro, para os devidos fins, que a paciente " + PAT.nome + " compareceu a consulta nutricional nesta data, no período da consulta.";
    return (
      <>
        <div className="sechead"><div><div className="h1">Atestado</div><p>Emissão de atestados e declarações com modelo customizável e assinatura.</p></div></div>
        <div className="grid gcols" style={{ gridTemplateColumns: "320px 1fr", gap: 16 }}>
          <div className="card pad" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="field"><label>Tipo de documento</label><div className="seg" style={{ width: "100%" }}>{["Atestado", "Declaração"].map((t) => <button key={t} style={{ flex: 1 }} className={cx(atTipo === t && "on")} onClick={() => setAtTipo(t)}>{t}</button>)}</div></div>
            {atTipo === "Atestado" && <div className="field"><label>Dias de afastamento</label><input className="input num" value={atDias} onChange={(e) => setAtDias(e.currentTarget.value)} /></div>}
            {atTipo === "Atestado" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <label style={{ fontSize: 12.5, color: "var(--muted)" }}>Incluir CID</label>
                <div className={cx("toggle", atCidOn && "on")} onClick={() => setAtCidOn(!atCidOn)}><span /></div></div>)}
            {atTipo === "Atestado" && atCidOn && <div className="field"><label>CID</label><input className="input num" value={atCid} onChange={(e) => setAtCid(e.currentTarget.value)} /></div>}
            <div className="field"><label>Observações</label><textarea className="input" rows={3} value={atObs} onChange={(e) => setAtObs(e.currentTarget.value)} placeholder="Opcional…" /></div>
            <button className="btn primary" onClick={() => toast("Documento assinado e gerado em PDF")}><FileSignature size={15} />Assinar e gerar PDF</button>
          </div>
          <div className="card pad">
            <div style={{ maxWidth: 560, margin: "0 auto", padding: "22px 8px" }}>
              <div style={{ textAlign: "center", borderBottom: "1px solid var(--border)", paddingBottom: 14, marginBottom: 22 }}>
                <div className="brand-mark" style={{ margin: "0 auto 8px" }}><Salad size={15} /></div>
                <div style={{ fontWeight: 600, letterSpacing: "-.02em" }}>Vanessa da Luz · Nutrição</div>
                <div className="faint" style={{ fontSize: 11.5 }}>{PAT.crn}</div></div>
              <div className="h2" style={{ textAlign: "center", marginBottom: 20 }}>{atTipo === "Atestado" ? "ATESTADO" : "DECLARAÇÃO DE COMPARECIMENTO"}</div>
              <p style={{ fontSize: 14, lineHeight: 1.8, textAlign: "justify" }}>{body}</p>
              {atObs && <p style={{ fontSize: 13, lineHeight: 1.7, marginTop: 14, color: "var(--muted)" }}>{atObs}</p>}
              <div style={{ marginTop: 40, textAlign: "center" }}>
                <div className="faint" style={{ fontSize: 12, marginBottom: 30 }}>Rio de Janeiro, 16 de junho de 2026.</div>
                <div style={{ borderTop: "1px solid var(--text)", width: 240, margin: "0 auto", paddingTop: 6, fontSize: 12.5 }}>Vanessa da Luz · {PAT.crn}</div></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ---- QUESTIONÁRIOS DE SAÚDE ---- */
  function renderSaude() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Questionários de saúde</div><p>Triagens de saúde com pontuação automática — pré-consulta e risco cardiovascular.</p></div></div>
        <div className="grid gcols" style={{ gridTemplateColumns: "1fr 300px", gap: 16 }}>
          <div className="card pad">
            <div className="eyebrow" style={{ marginBottom: 4 }}>Triagem de risco cardiovascular</div>
            <p className="faint" style={{ fontSize: 12, marginBottom: 14 }}>Marque os fatores presentes — a classificação é recalculada automaticamente.</p>
            {risk.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <span style={{ fontSize: 13.5, flex: 1, paddingRight: 12 }}>{r.q} <span className="faint num" style={{ fontSize: 11 }}>· peso {r.w}</span></span>
                <div className={cx("toggle", r.on && "on")} onClick={() => setRisk(risk.map((x, j) => j === i ? { ...x, on: !x.on } : x))}><span /></div></div>
            ))}
          </div>
          <div>
            <div className="card pad" style={{ textAlign: "center", marginBottom: 12 }}>
              <div className="eyebrow" style={{ marginBottom: 8 }}>Classificação de risco</div>
              <div style={{ width: 96, height: 96, borderRadius: "50%", margin: "0 auto", display: "grid", placeItems: "center",
                background: riskClass.c === "sage" ? "var(--sage-soft)" : riskClass.c === "amber" ? "rgba(183,137,47,.13)" : "rgba(177,75,54,.13)" }}>
                <div className="num" style={{ fontSize: 32, fontWeight: 600, color: riskClass.c === "sage" ? "var(--sage-strong)" : "var(--" + riskClass.c + ")" }}>{riskScore}</div></div>
              <span className={cx("chip", riskClass.c)} style={{ height: 26, marginTop: 14 }}>Risco {riskClass.l}</span></div>
            <div className="card pad" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={18} color="var(--sage)" /><div style={{ flex: 1 }}><div className="h3" style={{ fontSize: 12.5 }}>Pré-consulta</div><div className="faint" style={{ fontSize: 11.5 }}>Respondido</div></div>
              <button className="btn subtle sm" onClick={() => toast("Abrindo respostas")}>Ver</button></div>
          </div>
        </div>
      </>
    );
  }

  /* ---- PASTA DO PACIENTE ---- */
  function renderPasta() {
    return (
      <>
        <div className="sechead"><div><div className="h1">Pasta do paciente</div>
          <p style={{ display: "flex", alignItems: "center", gap: 6 }}>{folder ? <><span className="faint" style={{ cursor: "pointer" }} onClick={() => setFolder(null)}>Pasta</span> <ChevronRight size={13} /> {folder}</> : "Repositório de arquivos organizados por pasta."}</p></div>
          <button className="btn primary" onClick={() => toast("Selecione um arquivo para enviar")}><Upload size={16} />Enviar arquivo</button></div>
        {!folder ? (
          <div className="grid gcols" style={{ gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {FOLDERS.map((f) => (
              <div key={f.n} className="folder" onClick={() => setFolder(f.n)}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--sage-soft)", display: "grid", placeItems: "center" }}><Folder size={19} color="var(--sage)" fill="var(--sage-soft)" /></div>
                  <ChevronRight size={16} className="faint" /></div>
                <div className="h3" style={{ marginTop: 12 }}>{f.n}</div>
                <div className="faint num" style={{ fontSize: 12, marginTop: 2 }}>{f.files.length} arquivo(s)</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card" style={{ overflow: "hidden" }}>
            {(FOLDERS.find((f) => f.n === folder)?.files ?? []).map((file, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderTop: i ? "1px solid var(--border)" : "none" }}>
                <FileIcon size={17} className="faint" /><div style={{ flex: 1 }}><div style={{ fontSize: 13.5, fontWeight: 500 }}>{file[0]}</div><div className="faint num" style={{ fontSize: 11.5 }}>{file[1]}</div></div>
                <span className="faint num" style={{ fontSize: 12 }}>{file[2]}</span>
                <button className="iconbtn" style={{ width: 30, height: 30 }} onClick={() => toast("Baixando " + file[0])}><Download size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  }

  /* ---- INTELIGÊNCIA (IA local) ---- */
  function renderIA() {
    const insights = analyzePatient({
      sexo: sel.sexo as Sexo, idade: sel.idade, objetivo: sel.objetivo as Objetivo,
      adesao: sel.adesao, antrop: antRows,
      openInvoices: FIN.filter((f) => f.status !== "Pago").length,
    });
    const nivelCor = (n: string) => n === "alerta" ? "var(--terra)" : n === "ok" ? "var(--sage)" : "var(--blue)";
    const NivelIcon = ({ n }: { n: string }) => n === "alerta" ? <AlertTriangle size={16} /> : n === "ok" ? <Check size={16} /> : <Lightbulb size={16} />;
    const sobe = forecast ? forecast.tendenciaKgSemana > 0 : false;

    return (
      <>
        <div className="sechead">
          <div>
            <div className="h1">Inteligência (IA)</div>
            <p>Análises, previsão de evolução e geração de plano — tudo calculado no seu navegador.</p>
          </div>
          <span className="chip" style={{ background: "var(--sage-soft)", color: "var(--sage-strong)", border: "none" }}><ShieldCheck size={13} />100% local · sem enviar dados</span>
        </div>

        {/* Insights automáticos */}
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Sparkles size={16} color="var(--sage)" /><span className="h3">Análise automática do paciente</span></div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
            {insights.map((it) => (
              <div key={it.id} style={{ display: "flex", gap: 10, padding: 12, borderRadius: 12, background: "var(--surface2)", borderLeft: `3px solid ${nivelCor(it.nivel)}` }}>
                <span style={{ color: nivelCor(it.nivel), flexShrink: 0, marginTop: 1 }}><NivelIcon n={it.nivel} /></span>
                <div><div style={{ fontWeight: 600, fontSize: 13 }}>{it.titulo}</div><div className="faint" style={{ fontSize: 12, marginTop: 2 }}>{it.detalhe}</div></div>
              </div>
            ))}
            {insights.length === 0 && <div className="faint" style={{ fontSize: 13 }}>Sem dados suficientes para gerar análises.</div>}
          </div>
        </div>

        {/* Previsão de peso (ML) */}
        <div className="card pad" style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}><Flame size={16} color="var(--terra)" /><span className="h3">Previsão de evolução de peso</span></div>
            <button className="btn subtle sm" onClick={treinarPrevisao} disabled={treinando}><RefreshCw size={13} />{treinando ? "Treinando…" : "Treinar de novo"}</button>
          </div>
          {treinando && <div className="faint" style={{ fontSize: 13 }}>Treinando modelo no navegador…</div>}
          {!treinando && forecast && (
            <>
              <div className="row gcols" style={{ gap: 12, marginBottom: 12 }}>
                <div className="card pad" style={{ flex: 1, minWidth: 150, boxShadow: "none", border: "1px solid var(--border)" }}>
                  <div className="faint" style={{ fontSize: 11.5 }}>Tendência</div>
                  <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: sobe ? "var(--terra)" : "var(--sage-strong)", display: "flex", alignItems: "center", gap: 4 }}>
                    {sobe ? <ArrowUp size={18} /> : <ArrowDown size={18} />}{Math.abs(forecast.tendenciaKgSemana)} kg/sem
                  </div>
                </div>
                <div className="card pad" style={{ flex: 1, minWidth: 150, boxShadow: "none", border: "1px solid var(--border)" }}>
                  <div className="faint" style={{ fontSize: 11.5 }}>Confiança do ajuste (R²)</div>
                  <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{Math.round(forecast.r2 * 100)}%</div>
                </div>
                <div className="card pad" style={{ flex: 1, minWidth: 150, boxShadow: "none", border: "1px solid var(--border)" }}>
                  <div className="faint" style={{ fontSize: 11.5 }}>Modelo</div>
                  <div style={{ fontSize: 13, fontWeight: 600, marginTop: 6 }}>{forecast.metodo === "tensorflow" ? "Rede neural (TensorFlow.js)" : "Regressão linear"}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {forecast.previsao.map((p) => (
                  <span key={p.dia} className="chip" style={{ background: "var(--surface2)" }}>{p.data}: <b className="num" style={{ marginLeft: 4 }}>{p.peso} kg</b></span>
                ))}
              </div>
              <div className="faint" style={{ fontSize: 11.5, marginTop: 10 }}>Extrapolação de tendência a partir de {forecast.serie.length} medições. Quanto mais histórico, mais confiável.</div>
            </>
          )}
          {!treinando && !forecast && <div className="faint" style={{ fontSize: 13 }}>Sem medições suficientes para prever.</div>}
        </div>

        {/* Gerador de plano */}
        <div className="card pad">
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}><Utensils size={16} color="var(--blue)" /><span className="h3">Gerar plano alimentar automaticamente</span></div>
          <div className="row" style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ minWidth: 220 }}>
              <label>Nível de atividade</label>
              <select className="input" value={nivelIA} onChange={(e) => setNivelIA(e.currentTarget.value as ActivityLevel)}>
                {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => <option key={k} value={k}>{ACTIVITY_LABELS[k]}</option>)}
              </select>
            </div>
            <button className="btn primary" onClick={gerarPlanoIA}><Sparkles size={15} />Gerar plano</button>
          </div>

          {planoIA && (
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
                <div style={{ fontWeight: 600 }}>{planoIA.titulo}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn ghost sm" onClick={() => setPlanoIA(null)}><X size={14} />Descartar</button>
                  <button className="btn primary sm" onClick={aplicarPlanoIA}><Check size={14} />Aplicar ao paciente</button>
                </div>
              </div>
              <div className="row gcols" style={{ gap: 10, marginBottom: 12 }}>
                {[["Meta", planoIA.kcal + " kcal"], ["Proteína", planoIA.proteinaG + " g"], ["Carbo", planoIA.resumo.macros.carboG + " g"], ["Gordura", planoIA.resumo.macros.gorduraG + " g"], ["Água", (planoIA.aguaMl / 1000) + " L"]].map(([l, v]) => (
                  <div key={l} className="card pad" style={{ flex: 1, minWidth: 110, boxShadow: "none", border: "1px solid var(--border)" }}><div className="faint" style={{ fontSize: 11 }}>{l}</div><div className="num" style={{ fontSize: 18, fontWeight: 600, marginTop: 3 }}>{v}</div></div>
                ))}
              </div>
              <div className="faint" style={{ fontSize: 11.5, marginBottom: 10 }}>TMB {planoIA.resumo.tmb} kcal · GET {planoIA.resumo.get} kcal · altura estimada {planoIA.resumo.alturaCm ?? "—"} cm</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {planoIA.refeicoes.map((r) => (
                  <div key={r.nome} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", background: "var(--surface2)", fontSize: 13 }}><b>{r.nome}</b><span className="faint num">{r.horario} · {r.observacao}</span></div>
                    <div style={{ padding: "8px 12px", fontSize: 12.5 }}>{r.itens.map((it) => it.nome).join(" · ")}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  const RENDER: Record<string, () => ReactNode> = {
    perfil: renderPerfil, ia: renderIA, antrop: renderAntrop, energetico: renderEnergetico, plano: renderPlano,
    gestacional: renderGestacional, manipulado: renderManipulado, exame: renderExame, anamnese: renderAnamnese,
    questionario: renderQuestionario, diario: renderDiario, instrucao: renderInstrucao, prontuario: renderProntuario,
    financeiro: renderFinanceiro, metas: renderMetas, atestado: renderAtestado, saude: renderSaude, pasta: renderPasta,
  };

  /* ====================== SHELL ====================== */
  return (
    <div className="nf" data-theme={theme} style={{ height: "100%" }}>
      <style>{CSS}</style>
      <div className="nf-root">
        <div className="shell">
          {/* topbar */}
          <div className="topbar">
            <Link to="/patients" className="brand" style={{ textDecoration: "none", color: "inherit" }}><div className="brand-mark"><Salad size={15} /></div><span className="hidem">Novra</span></Link>
            <div className="crumb hidem"><ChevronLeft size={15} /><Link to="/patients" style={{ color: "inherit", textDecoration: "none" }}>Pacientes</Link><span className="sep">/</span><b>{PAT.nome}</b></div>
            <div className="spacer" />
            <Link to="/patients" className="kbtn hidem" style={{ textDecoration: "none" }}><ChevronLeft size={14} />Voltar aos pacientes</Link>
            <NotificationBell audience="clinica" patientId={sel.id} linkKey="clinicLink" onNavigate={nav} />
            <button className="iconbtn" onClick={toggle}>{theme === "light" ? <Moon size={16} /> : <Sun size={16} />}</button>
            <Avatar initials="VL" size={32} />
            <button className="iconbtn" onClick={() => logout(nav)} title="Sair"><LogOut size={16} /></button>
          </div>

          {/* mobile section bar */}
          <div className="mobilebar">
            <div className="cur"><curSec.icon size={17} color="var(--sage)" />{curSec.label}</div>
            <button className="kbtn" onClick={() => setSheetOpen(true)}>Seções<ChevronRight size={14} /></button>
          </div>

          <div className="body">
            {/* sidebar */}
            <aside className="side">
              <div className="pcard">
                <div className="pcard-top">
                  <Avatar initials={PAT.iniciais} size={46} />
                  <div style={{ minWidth: 0, flex: 1 }}><div className="pname">{PAT.nome}</div><div className="pmeta">{PAT.sexo} · {PAT.idade} anos</div><div className="statusdot"><i />Ativo</div></div>
                  <button className="iconbtn" style={{ width: 30, height: 30 }} title="Copiar informações do paciente"
                    onClick={() => { setCopiedInfo(true); toast("Informações do paciente copiadas"); setTimeout(() => setCopiedInfo(false), 1600); }}>
                    {copiedInfo ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, paddingTop: 11, borderTop: "1px solid var(--border)" }}>
                  <span className="muted" style={{ fontSize: 12 }}>Gestante</span>
                  <div className={cx("toggle", gestante && "on")} onClick={() => setGestante(!gestante)}><span /></div>
                </div>
              </div>
              <div className="navlbl">Seções do paciente</div>
              <nav className="nav">
                {SECTIONS.map((s, i) => { const I = s.icon;
                  return (
                    <div key={s.id} className={cx("navitem", active === s.id && "active")} onClick={() => go(s.id)}>
                      <span className="ix">{i + 1}</span><I size={16} /><span style={{ flex: 1 }}>{s.label}</span>
                      {s.badge && <span className="navbadge">{s.badge}</span>}
                    </div>
                  );
                })}
              </nav>
            </aside>

            {/* main */}
            <main className="main">{RENDER[activeSafe]()}</main>
          </div>
        </div>
      </div>

      {/* mobile sheet */}
      {sheetOpen && (
        <div className="sheet-wrap" onMouseDown={() => setSheetOpen(false)}>
          <div className="sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <div className="navlbl">Seções do paciente</div>
            <nav className="nav">
              {SECTIONS.map((s, i) => { const I = s.icon;
                return (
                  <div key={s.id} className={cx("navitem", active === s.id && "active")} onClick={() => go(s.id)}>
                    <span className="ix">{i + 1}</span><I size={17} /><span style={{ flex: 1 }}>{s.label}</span>
                    {s.badge && <span className="navbadge">{s.badge}</span>}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* diary viewer */}
      {viewer && (
        <Modal title={viewer.ref} sub={viewer.quando} onClose={() => setViewer(null)} max={460}>
          <div style={{ height: 220, borderRadius: 12, background: "linear-gradient(150deg," + viewer.g[0] + "," + viewer.g[1] + ")", marginBottom: 14 }} />
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{viewer.desc}</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14 }}>
            <button className="btn subtle sm" onClick={() => { setDiary(diary.map((x) => x.id === viewer.id ? { ...x, liked: !x.liked, react: x.react + (x.liked ? -1 : 1) } : x)); setViewer({ ...viewer, liked: !viewer.liked, react: viewer.react + (viewer.liked ? -1 : 1) }); }}>
              <Heart size={14} fill={viewer.liked ? "var(--terra)" : "none"} color={viewer.liked ? "var(--terra)" : "currentColor"} />{viewer.react}</button>
            <button className="btn ghost sm" onClick={() => { setViewer(null); go("diario"); }}><MessageCircle size={14} />Comentar</button>
          </div>
          {viewer.comments.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border)" }}>
              {viewer.comments.map((c: any, ci: number) => (
                <div key={ci} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 7, background: "var(--sage-soft)", display: "grid", placeItems: "center", flexShrink: 0 }}><Stethoscope size={12} color="var(--sage)" /></div>
                  <div style={{ background: "var(--surface2)", borderRadius: 10, padding: "7px 10px", fontSize: 12.5 }}><b>{c.a}</b><div>{c.t}</div></div>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

    </div>
  );
}
