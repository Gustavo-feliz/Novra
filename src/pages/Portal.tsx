import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Apple,
  ArrowRight,
  Bell,
  BellRing,
  BookOpen,
  Calendar,
  Camera,
  Check,
  ChevronRight,
  ClipboardList,
  CreditCard,
  FileText,
  Flame,
  GlassWater,
  HelpCircle,
  Home,
  KeyRound,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Minus,
  Play,
  Plus,
  Receipt,
  Salad,
  ShieldCheck,
  Target,
  Trophy,
  Upload,
  Video,
  Wallet,
  X,
} from "lucide-react";
import { Button } from "../components/ui";
import { useToast } from "../components/ui/Toast";
import { ThemeToggle } from "../components/ThemeToggle";
import {
  AGENDA,
  BOOKING,
  CLINIC,
  DIARIES,
  PATIENTS,
  PLANOS_SEED,
  PORTAL_ACCESS,
  PORTAL_FINANCE,
  PORTAL_GOALS,
  PORTAL_INSTRUCTIONS,
  QUESTIONARIOS_SEED,
} from "../lib/mock";
import type { PatientPlan, PortalQuestionnaire } from "../lib/types";
import { LOCAL_KEYS, type AppointmentRequest, usePersistentState } from "../lib/localData";
import { pushEvent } from "../lib/events";
import { ACHIEVEMENTS, computeUnlocked, useAchievements, useStreak } from "../lib/engagement";
import { NotificationBell } from "../components/NotificationBell";
import { brl, cx, initials, logout, sanitizeText, uid } from "../lib/utils";
import { getPortalSlug, getRole, unlockPortal } from "../lib/auth";
import {
  DEFAULT_REMINDERS, REFEICAO_HORARIOS, notificationPermission, requestNotificationPermission,
  showLocalNotification, type ReminderPrefs,
} from "../lib/notifications";

type PortalPost = {
  id: string;
  refeicao: string;
  quando: string;
  desc: string;
  cor: [string, string];
  reacoes: number;
};

const CURRENT_PATIENT = PATIENTS.find((p) => p.id === PORTAL_ACCESS.patientId) ?? PATIENTS[0];

const SEED_PORTAL_POSTS: PortalPost[] = DIARIES.filter((d) => d.pacienteId === PORTAL_ACCESS.patientId).map((d) => ({
  id: d.id,
  refeicao: d.refeicao,
  quando: d.quando,
  desc: d.desc,
  cor: d.cor,
  reacoes: d.reacoes,
}));

function useQuestionariosPaciente(patientId: string) {
  const [map, setMap] = usePersistentState<Record<string, PortalQuestionnaire[]>>(LOCAL_KEYS.questionariosPaciente, QUESTIONARIOS_SEED);
  const questionarios = map[patientId] ?? [];
  const setQuestionarios = (next: PortalQuestionnaire[]) => setMap({ ...map, [patientId]: next });
  return { questionarios, setQuestionarios };
}

const MAIN_NAV = [
  { to: "", label: "Inicio", icon: Home, end: true },
  { to: "plano", label: "Plano", icon: Apple },
  { to: "diario", label: "Diario", icon: Camera },
  { to: "metas", label: "Metas", icon: Target },
  { to: "agenda", label: "Agenda", icon: Calendar },
];

const MORE_NAV = [
  { to: "questionarios", label: "Questionarios", icon: ClipboardList },
  { to: "financeiro", label: "Financeiro", icon: Wallet },
  { to: "instrucoes", label: "Instrucoes", icon: BookOpen },
  { to: "videochamada", label: "Videochamada", icon: Video },
];

function PortalLink({ item, onClick }: { item: (typeof MAIN_NAV)[number]; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink
      end={item.end}
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => cx("portal-navitem", isActive && "active")}
    >
      <Icon size={18} />
      <span>{item.label}</span>
    </NavLink>
  );
}

function MoreLink({ item, onClick }: { item: (typeof MORE_NAV)[number]; onClick?: () => void }) {
  const Icon = item.icon;
  return (
    <NavLink to={item.to} onClick={onClick} className={({ isActive }) => cx("portal-sheet-link", isActive && "active")}>
      <Icon size={18} />
      <span>{item.label}</span>
      <ChevronRight size={16} />
    </NavLink>
  );
}

function PortalLogin({ slug, onUnlock }: { slug?: string; onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [help, setHelp] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  function submit() {
    // O código só vale para um portal existente: além de conferir o código, o
    // slug da URL precisa ser o do paciente. Assim, adivinhar a URL não basta.
    const codeOk = code.trim().toUpperCase() === PORTAL_ACCESS.code;
    const slugOk = slug === PORTAL_ACCESS.slug;
    if (!codeOk || !slugOk) {
      setError("Codigo nao encontrado. Confira o link ou fale com a clinica.");
      return;
    }
    setLoading(true);
    unlockPortal(PORTAL_ACCESS.slug);
    setTimeout(() => {
      onUnlock();
      toast("Portal liberado");
    }, 220);
  }

  return (
    <main className="portal-login">
      <div className="portal-login-glow" aria-hidden="true" />
      <div className="portal-login-top">
        <div className="site-login-brand"><div className="brand-mark"><Salad size={16} /></div>NutriFlow</div>
        <ThemeToggle />
      </div>

      <motion.section
        className="portal-login-card"
        initial={{ opacity: 0, y: 18, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .42 }}
      >
        <div className="brand-mark portal-logo"><Salad size={24} /></div>
        <div>
          <div className="eyebrow">Portal do paciente</div>
          <h1>Entre no seu acompanhamento</h1>
          <p>{CLINIC.nome}</p>
        </div>

        <label className="field portal-login-field">
          <span>Codigo de acesso</span>
          <input
            className="input code"
            value={code}
            onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="EX: MARIANA2026"
            autoFocus
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            inputMode="text"
          />
        </label>

        {error && <div className="banner alert">{error}</div>}

        <Button variant="primary" onClick={submit} disabled={loading} className="portal-login-submit">
          {loading ? "Entrando..." : "Acessar portal"} <ArrowRight size={16} />
        </Button>

        <div className="portal-login-trust"><ShieldCheck size={14} />Acesso protegido, exclusivo para sua nutricionista</div>

        <button type="button" className="site-login-demo" onClick={() => { setCode(PORTAL_ACCESS.code); setError(""); }}>
          <Check size={14} />
          <span>Codigo demo: <strong>{PORTAL_ACCESS.code}</strong></span>
        </button>

        <button type="button" className="portal-login-help-toggle" onClick={() => setHelp(!help)}>
          <HelpCircle size={14} />Nao encontra o seu codigo?
        </button>
        {help && (
          <div className="portal-login-help-card">
            <p><KeyRound size={14} />O codigo foi enviado pela sua nutricionista por WhatsApp ou e-mail, junto com o link do portal.</p>
            <p>Ainda com duvidas? Fale diretamente com <strong>{CLINIC.nutri}</strong>.</p>
          </div>
        )}
      </motion.section>
    </main>
  );
}

/** Agendador de lembretes locais: roda enquanto o portal está aberto e dispara
 *  notificações de hidratação (por intervalo) e de refeição (em horários fixos). */
function useReminders() {
  const [prefs] = usePersistentState<ReminderPrefs>(LOCAL_KEYS.reminders, DEFAULT_REMINDERS);
  const lastWater = useRef(Date.now());

  useEffect(() => {
    if (!prefs.enabled || notificationPermission() !== "granted") return;
    const slug = PORTAL_ACCESS.slug;
    const tick = () => {
      if (prefs.aguaIntervalMin > 0 && Date.now() - lastWater.current >= prefs.aguaIntervalMin * 60000) {
        lastWater.current = Date.now();
        showLocalNotification("Hora de se hidratar 💧", { body: "Beba um copo de água e registre na sua meta.", url: `/portal/${slug}/metas`, tag: "agua" });
      }
      if (prefs.refeicoes) {
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        if (REFEICAO_HORARIOS.includes(hhmm)) {
          showLocalNotification("Hora da refeição 🍽️", { body: "Que tal registrar no diário alimentar?", url: `/portal/${slug}/diario`, tag: `refeicao-${hhmm}` });
        }
      }
    };
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [prefs.enabled, prefs.aguaIntervalMin, prefs.refeicoes]);
}

export default function Portal() {
  const { slug } = useParams();
  const navigate = useNavigate();
  useReminders();
  // Libera o portal quando: (a) o paciente entrou por e-mail/senha (sessão de
  // login) OU (b) já validou o código de acesso antes (sessão de portal). Saber
  // apenas o slug da URL NÃO é mais suficiente.
  const [unlocked, setUnlocked] = useState(
    (getRole() === "patient" && slug === PORTAL_ACCESS.slug) || getPortalSlug() === slug,
  );
  const [sheet, setSheet] = useState(false);
  const patient = PATIENTS.find((p) => p.id === PORTAL_ACCESS.patientId) ?? PATIENTS[0];

  if (!unlocked) return <PortalLogin slug={slug} onUnlock={() => setUnlocked(true)} />;

  return (
    <div className="portal-shell">
      <header className="portal-topbar">
        <Link to={`/portal/${PORTAL_ACCESS.slug}`} className="portal-brand">
          <div className="brand-mark"><Salad size={16} /></div>
          <span>NutriFlow</span>
        </Link>
        <div className="portal-patient">
          <div className="avatar" style={{ width: 34, height: 34, fontSize: 12 }}>{initials(patient.nome)}</div>
          <div>
            <strong>{patient.nome.split(" ")[0]}</strong>
            <small>{CLINIC.nutri}</small>
          </div>
        </div>
        <NotificationBell audience="paciente" patientId={PORTAL_ACCESS.patientId} linkKey="portalLink"
          onNavigate={(path) => navigate(`/portal/${PORTAL_ACCESS.slug}/${path}`)} />
        <button className="iconbtn hide-sm" onClick={() => logout(navigate)} title="Sair"><LogOut size={16} /></button>
        <button className="iconbtn portal-menu-btn" onClick={() => setSheet(true)} aria-label="Abrir menu"><Menu size={17} /></button>
      </header>

      <div className="portal-layout">
        <aside className="portal-side">
          <div className="portal-side-card">
            <div className="avatar" style={{ width: 46, height: 46, fontSize: 16 }}>{initials(patient.nome)}</div>
            <div>
              <strong>{patient.nome}</strong>
              <small>{patient.objetivo} · {patient.adesao}% adesao</small>
            </div>
          </div>
          <nav className="portal-side-nav">
            {MAIN_NAV.map((item) => <PortalLink key={item.label} item={item} />)}
            <div className="navlbl">Mais</div>
            {MORE_NAV.map((item) => <MoreLink key={item.label} item={item} />)}
          </nav>
        </aside>

        <main className="portal-main">
          <Routes>
            <Route index element={<PortalHome patientName={patient.nome} />} />
            <Route path="plano" element={<PortalPlan />} />
            <Route path="diario" element={<PortalDiary />} />
            <Route path="metas" element={<PortalGoals />} />
            <Route path="agenda" element={<PortalAgenda />} />
            <Route path="questionarios" element={<PortalQuestionnaires />} />
            <Route path="financeiro" element={<PortalFinance />} />
            <Route path="instrucoes" element={<PortalInstructions />} />
            <Route path="videochamada" element={<PortalVideoCall />} />
            <Route path="*" element={<PortalHome patientName={patient.nome} />} />
          </Routes>
        </main>
      </div>

      <nav className="portal-bottom-nav">
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.label} end={item.end} to={item.to} className={({ isActive }) => cx("portal-bottom-item", isActive && "active")}>
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {sheet && (
        <div className="sheet-wrap" onMouseDown={() => setSheet(false)}>
          <div className="sheet portal-sheet" onMouseDown={(e) => e.stopPropagation()}>
            <div className="sheet-grab" />
            <div className="portal-sheet-head">
              <strong>Portal</strong>
              <button className="iconbtn" onClick={() => setSheet(false)}><X size={16} /></button>
            </div>
            {MAIN_NAV.map((item) => <PortalLink key={item.label} item={item} onClick={() => setSheet(false)} />)}
            <div className="navlbl">Mais</div>
            {MORE_NAV.map((item) => <MoreLink key={item.label} item={item} onClick={() => setSheet(false)} />)}
            <div className="portal-navitem" style={{ cursor: "pointer" }} onClick={() => logout(navigate)}><LogOut size={18} /><span>Sair</span></div>
          </div>
        </div>
      )}
    </div>
  );
}

function PortalHome({ patientName }: { patientName: string }) {
  const navigate = useNavigate();
  const { questionarios: questionnaires } = useQuestionariosPaciente(PORTAL_ACCESS.patientId);
  const [goals] = usePersistentState(LOCAL_KEYS.portalGoals, PORTAL_GOALS);
  const [finance] = usePersistentState(LOCAL_KEYS.portalFinance, PORTAL_FINANCE);
  const [planos] = usePersistentState<Record<string, PatientPlan>>(LOCAL_KEYS.planosAlimentares, PLANOS_SEED);
  const plan = planos[PORTAL_ACCESS.patientId] ?? PLANOS_SEED[PORTAL_ACCESS.patientId];
  const { streak } = useStreak(PORTAL_ACCESS.patientId);
  const pending = questionnaires.filter((q) => q.status === "pendente").length;
  const openInvoices = finance.filter((f) => f.status !== "Pago").length;
  const avgGoals = Math.round(goals.reduce((sum, goal) => sum + goal.progresso, 0) / Math.max(goals.length, 1));
  const next = AGENDA.find((a) => a.paciente === patientName);
  return (
    <div className="portal-page">
      <section className="portal-hero">
        <div>
          <span className="eyebrow">Hoje</span>
          <h1>Oi, {patientName.split(" ")[0]}</h1>
          <p>Seu plano esta ativo e sua proxima consulta esta organizada por aqui.</p>
        </div>
        <div className="portal-hero-stat">
          <strong>{plan.kcal}</strong>
          <span>kcal/dia</span>
        </div>
      </section>

      {streak.dias > 0 && (
        <article className="portal-streak" onClick={() => navigate("metas")}>
          <Flame size={22} />
          <div><strong>{streak.dias} dia{streak.dias > 1 ? "s" : ""} seguido{streak.dias > 1 ? "s" : ""}</strong><span>batendo a meta de hidratação 🔥</span></div>
          <ChevronRight size={17} />
        </article>
      )}

      <div className="portal-grid two">
        <article className="card pad portal-action" onClick={() => navigate("agenda")}>
          <Calendar size={19} />
          <div><strong>Proxima consulta</strong><span>{next ? `${next.tipo} · ${next.hora} · ${next.modo}` : "Solicite um horario"}</span></div>
          <ChevronRight size={17} />
        </article>
        <article className="card pad portal-action" onClick={() => navigate("questionarios")}>
          <ClipboardList size={19} />
          <div><strong>Questionarios pendentes</strong><span>{pending} formulario(s) aguardando resposta</span></div>
          <ChevronRight size={17} />
        </article>
      </div>

      <div className="portal-grid three">
        <Metric label="Agua" value={`${plan.aguaMl / 1000} L`} detail="meta diaria" />
        <Metric label="Proteina" value={`${plan.proteinaG} g`} detail="meta diaria" />
        <Metric label="Metas" value={`${avgGoals}%`} detail="progresso medio" />
      </div>
      {openInvoices > 0 && (
        <article className="card pad portal-action" onClick={() => navigate("financeiro")}>
          <Wallet size={19} />
          <div><strong>Financeiro</strong><span>{openInvoices} fatura(s) em aberto</span></div>
          <ChevronRight size={17} />
        </article>
      )}
    </div>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="card pad portal-metric"><span>{label}</span><strong className="num">{value}</strong><small>{detail}</small></div>;
}

function PortalPlan() {
  const [planos] = usePersistentState<Record<string, PatientPlan>>(LOCAL_KEYS.planosAlimentares, PLANOS_SEED);
  const plan = planos[PORTAL_ACCESS.patientId] ?? PLANOS_SEED[PORTAL_ACCESS.patientId];
  return (
    <div className="portal-page">
      <PageHead title="Meu plano alimentar" sub={`${plan.titulo} · ${plan.periodo}`} />
      <div className="portal-grid three">
        <Metric label="Energia" value={`${plan.kcal}`} detail="kcal por dia" />
        <Metric label="Agua" value={`${plan.aguaMl / 1000} L`} detail="meta diaria" />
        <Metric label="Proteina" value={`${plan.proteinaG} g`} detail="meta diaria" />
      </div>
      <div className="portal-meals">
        {plan.refeicoes.map((meal) => (
          <article className="meal" key={meal.nome}>
            <div className="meal-h"><strong>{meal.nome}</strong><span className="num">{meal.horario}</span></div>
            {meal.itens.map((item, i) => (
              <div className="meal-item" key={item.nome + i}>
                <Check size={14} color="var(--sage)" />
                <span style={{ flex: 1 }}>{item.nome}{item.porcao ? ` · ${item.porcao}` : ""}</span>
                {item.kcal != null && <span className="faint num" style={{ fontSize: 11.5 }}>{item.kcal} kcal</span>}
              </div>
            ))}
            {meal.observacao && <div className="portal-note">{meal.observacao}</div>}
          </article>
        ))}
      </div>
      <div className="portal-grid three">
        {plan.substituicoes.map((s) => (
          <article className="card pad" key={s.grupo}>
            <div className="h3">{s.grupo}</div>
            <div className="portal-tags">{s.opcoes.map((op) => <span className="chip" key={op}>{op}</span>)}</div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortalDiary() {
  const toast = useToast();
  const [posts, setPosts] = usePersistentState(LOCAL_KEYS.portalDiary, SEED_PORTAL_POSTS);
  const [meal, setMeal] = useState("Almoco");
  const [desc, setDesc] = useState("");

  function addPost() {
    const clean = sanitizeText(desc, 500).trim();
    const post: PortalPost = { id: uid(), refeicao: meal, quando: "Agora", desc: clean || "Foto enviada para avaliacao.", cor: ["#9DB99F", "#6E8C72"], reacoes: 0 };
    setPosts([post, ...posts]);
    setDesc("");
    toast("Registro enviado para a nutricionista");
    pushEvent({
      tipo: "diario",
      titulo: `${CURRENT_PATIENT.nome.split(" ")[0]} postou ${meal}`,
      detalhe: post.desc,
      audiencia: "clinica",
      patientId: PORTAL_ACCESS.patientId,
      clinicLink: "/diarios",
    });
  }

  return (
    <div className="portal-page">
      <PageHead title="Diario alimentar" sub="Envie fotos e comentarios das refeicoes." />
      <section className="card pad portal-upload-card">
        <div className="upload"><Upload size={20} /><strong>Adicionar foto da refeicao</strong><span>PNG ou JPG, ate 10 MB</span></div>
        <div className="portal-form-row">
          <select className="select" value={meal} onChange={(e) => setMeal(e.target.value)}>
            {["Cafe da manha", "Almoco", "Lanche", "Jantar", "Ceia"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <Button variant="primary" onClick={addPost}><Camera size={15} />Enviar</Button>
        </div>
        <textarea className="input" rows={3} maxLength={500} value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Comentario opcional" />
      </section>
      <div className="portal-diary-grid">
        {posts.map((post) => (
          <article className="diary" key={post.id}>
            <div className="diary-img" style={{ background: `linear-gradient(145deg, ${post.cor[0]}, ${post.cor[1]})` }}><span className="t">{post.refeicao}</span></div>
            <div className="diary-bd"><strong>{post.quando}</strong><p>{post.desc}</p><div className="diary-ft"><span><MessageCircle size={13} />{post.reacoes}</span></div></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function ReminderCard() {
  const toast = useToast();
  const [prefs, setPrefs] = usePersistentState<ReminderPrefs>(LOCAL_KEYS.reminders, DEFAULT_REMINDERS);
  const [perm, setPerm] = useState(notificationPermission());

  if (perm === "unsupported") return null;
  const ativo = prefs.enabled && perm === "granted";

  async function ativar() {
    let granted = perm === "granted";
    if (!granted) {
      const p = await requestNotificationPermission();
      setPerm(p);
      granted = p === "granted";
      if (!granted) { toast(p === "denied" ? "Notificações bloqueadas no navegador" : "Permissão não concedida"); return; }
    }
    setPrefs({ ...prefs, enabled: true });
    toast("Lembretes ativados");
    showLocalNotification("Lembretes ativados 🔔", { body: "Você vai receber avisos de água e refeições.", url: `/portal/${PORTAL_ACCESS.slug}/metas` });
  }

  return (
    <section className="card pad portal-reminders">
      <div className="portal-row between" style={{ alignItems: "center" }}>
        <div style={{ display: "flex", gap: 11, alignItems: "center" }}>
          <span className="portal-reminder-ic">{ativo ? <BellRing size={18} /> : <Bell size={18} />}</span>
          <div><strong>Lembretes no celular</strong><p>Avisos de hidratação e refeições, mesmo com o app em segundo plano.</p></div>
        </div>
        <button className={cx("toggle", ativo && "on")} onClick={() => (ativo ? (setPrefs({ ...prefs, enabled: false }), toast("Lembretes desativados")) : ativar())} aria-label="Ativar lembretes"><span /></button>
      </div>

      {ativo && (
        <div className="portal-reminder-opts">
          <label className="field">
            <span>Lembrete de hidratação</span>
            <select className="select" value={prefs.aguaIntervalMin} onChange={(e) => setPrefs({ ...prefs, aguaIntervalMin: Number(e.target.value) })}>
              <option value={60}>A cada 1 hora</option>
              <option value={120}>A cada 2 horas</option>
              <option value={180}>A cada 3 horas</option>
              <option value={0}>Desligado</option>
            </select>
          </label>
          <label className="portal-reminder-check">
            <input type="checkbox" checked={prefs.refeicoes} onChange={(e) => setPrefs({ ...prefs, refeicoes: e.target.checked })} />
            <span>Lembrar nos horários de refeição ({REFEICAO_HORARIOS.join(", ")})</span>
          </label>
          <button className="btn ghost sm" onClick={() => showLocalNotification("Notificação de teste 🔔", { body: "É assim que os lembretes vão aparecer.", url: `/portal/${PORTAL_ACCESS.slug}/metas` })}>Testar notificação</button>
        </div>
      )}

      {perm === "denied" && <div className="banner alert" style={{ marginTop: 12 }}>Notificações bloqueadas. Libere nas configurações do navegador para ativar os lembretes.</div>}
    </section>
  );
}

function PortalGoals() {
  const [goals, setGoals] = usePersistentState(LOCAL_KEYS.portalGoals, PORTAL_GOALS);
  const { questionarios: questionariosTodos } = useQuestionariosPaciente(PORTAL_ACCESS.patientId);
  const questionnaires = questionariosTodos.filter((q) => q.status !== "rascunho");
  const [diaryPosts] = usePersistentState(LOCAL_KEYS.portalDiary, SEED_PORTAL_POSTS);
  const { streak, registerHydrationComplete } = useStreak(PORTAL_ACCESS.patientId);
  const { unlockedIds, unlock } = useAchievements(PORTAL_ACCESS.patientId);

  const allGoalsComplete = goals.length > 0 && goals.every((g) => g.progresso >= 100);
  const allQuestionnairesAnswered = questionnaires.every((q) => q.status === "respondido");

  useEffect(() => {
    unlock(computeUnlocked({
      diaryCount: diaryPosts.length,
      waterStreak: streak.dias,
      allGoalsComplete,
      allQuestionnairesAnswered,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diaryPosts.length, streak.dias, allGoalsComplete, allQuestionnairesAnswered]);

  const setCopos = (goalId: string, copos: number) => {
    setGoals(goals.map((g) => {
      if (g.id !== goalId || !g.coposMeta) return g;
      const clamped = Math.max(0, Math.min(g.coposMeta, copos));
      if (clamped >= g.coposMeta) registerHydrationComplete(CURRENT_PATIENT.nome);
      return { ...g, coposAtuais: clamped, progresso: Math.round((clamped / g.coposMeta) * 100) };
    }));
  };

  return (
    <div className="portal-page">
      <PageHead title="Metas" sub="Acompanhe os combinados da consulta." />

      {streak.dias > 0 && (
        <article className="portal-streak">
          <Flame size={22} />
          <div><strong>{streak.dias} dia{streak.dias > 1 ? "s" : ""} seguido{streak.dias > 1 ? "s" : ""}</strong><span>batendo a meta de hidratação 🔥</span></div>
        </article>
      )}

      <ReminderCard />

      <div className="portal-list">
        {goals.map((goal) => {
          const isAgua = goal.coposMeta != null;
          const copoMl = goal.copoMl ?? 300;
          const copos = goal.coposAtuais ?? 0;
          return (
            <article className="card pad" key={goal.id}>
              <div className="portal-row between">
                <div><strong>{goal.titulo}</strong><p>{goal.detalhe}</p></div>
                <span className="chip sage">{goal.categoria}</span>
              </div>

              {isAgua ? (
                <div className="portal-water">
                  <div className="portal-water-cups">
                    {Array.from({ length: goal.coposMeta! }).map((_, i) => {
                      const filled = i < copos;
                      return (
                        <button key={i} type="button" className={cx("portal-cup", filled && "filled")}
                          onClick={() => setCopos(goal.id, i + 1 === copos ? i : i + 1)} aria-label={`Copo ${i + 1} de ${goal.coposMeta}`}>
                          <GlassWater size={18} />
                        </button>
                      );
                    })}
                  </div>
                  <div className="portal-water-readout">
                    <strong className="num">{copos}</strong><span>de {goal.coposMeta} copos</span>
                    <span className="faint num">{((copos * copoMl) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L de {((goal.coposMeta! * copoMl) / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} L</span>
                  </div>
                  <div className="portal-water-actions">
                    <button className="iconbtn" onClick={() => setCopos(goal.id, copos - 1)} disabled={copos <= 0} aria-label="Remover um copo"><Minus size={15} /></button>
                    <Button sm variant="primary" onClick={() => setCopos(goal.id, copos + 1)} disabled={copos >= goal.coposMeta!}><Plus size={13} />1 copo</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="portal-progress"><div className="bar"><i style={{ width: `${goal.progresso}%` }} /></div><span className="num">{goal.progresso}%</span></div>
                  <Button sm variant="subtle" onClick={() => setGoals(goals.map((g) => g.id === goal.id ? { ...g, progresso: Math.min(100, g.progresso + 5) } : g))}>Registrar progresso</Button>
                </>
              )}
            </article>
          );
        })}
      </div>

      <section className="portal-achv-section">
        <div className="h2">Conquistas</div>
        <p className="muted" style={{ fontSize: 12.5, marginTop: 2, marginBottom: 12 }}>{unlockedIds.length} de {ACHIEVEMENTS.length} desbloqueadas</p>
        <div className="portal-achv-grid">
          {ACHIEVEMENTS.map((a) => {
            const done = unlockedIds.includes(a.id);
            return (
              <article key={a.id} className={cx("portal-achv", done && "unlocked")}>
                <div className="portal-achv-icon">{done ? <Trophy size={18} /> : <Lock size={15} />}</div>
                <strong>{a.titulo}</strong>
                <span>{a.descricao}</span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function PortalAgenda() {
  const toast = useToast();
  const [hour, setHour] = useState("");
  const [requests, setRequests] = usePersistentState<AppointmentRequest[]>(LOCAL_KEYS.appointmentRequests, []);

  function requestAppointment() {
    const request: AppointmentRequest = {
      id: uid(),
      patientId: PORTAL_ACCESS.patientId,
      paciente: CURRENT_PATIENT.nome,
      servico: "Consulta de retorno",
      data: "10/07/2026",
      hora: hour,
      modo: "Online",
      status: "solicitado",
    };
    setRequests([request, ...requests]);
    setHour("");
    toast(`Solicitacao enviada para ${request.hora}`);
    pushEvent({
      tipo: "agenda",
      titulo: `${CURRENT_PATIENT.nome.split(" ")[0]} solicitou um horário (${request.hora})`,
      audiencia: "clinica",
      patientId: PORTAL_ACCESS.patientId,
      clinicLink: "/agenda",
    });
  }

  return (
    <div className="portal-page">
      <PageHead title="Agenda" sub="Veja consultas e solicite novo horario." />
      <article className="card pad portal-callout">
        <Calendar size={20} />
        <div><strong>Retorno confirmado</strong><span>10/07/2026 · 14:30 · Online</span></div>
      </article>
      <section className="card pad">
        <div className="h2">Solicitar novo horario</div>
        <div className="portal-slot-grid">
          {BOOKING.horarios.map((h) => {
            const disabled = BOOKING.ocupados.includes(h);
            return <button key={h} disabled={disabled} className={cx("btn", hour === h ? "primary" : "ghost", "sm")} onClick={() => setHour(h)}>{h}</button>;
          })}
        </div>
        <Button variant="primary" disabled={!hour} onClick={requestAppointment}>Solicitar horario</Button>
      </section>
      {requests.length > 0 && (
        <section className="card pad">
          <div className="h2">Solicitacoes enviadas</div>
          <div className="portal-list" style={{ marginTop: 12 }}>
            {requests.filter((r) => r.patientId === PORTAL_ACCESS.patientId).map((request) => (
              <div className="portal-row between" key={request.id}>
                <div><strong>{request.servico}</strong><p>{request.data} · {request.hora} · {request.modo}</p></div>
                <span className={cx("chip", request.status === "confirmado" ? "sage" : request.status === "recusado" ? "red" : "amber")}>{request.status}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function PortalQuestionnaires() {
  const toast = useToast();
  const { questionarios: todos, setQuestionarios } = useQuestionariosPaciente(PORTAL_ACCESS.patientId);
  const questionnaires = todos.filter((q) => q.status !== "rascunho");
  const [respostasDraft, setRespostasDraft] = useState<Record<string, Record<string, string>>>({});

  const setResposta = (qId: string, pId: string, valor: string) => setRespostasDraft((prev) => ({ ...prev, [qId]: { ...(prev[qId] ?? {}), [pId]: valor } }));

  const enviarRespostas = (q: PortalQuestionnaire) => {
    const draft = respostasDraft[q.id] ?? {};
    const respostas = Object.fromEntries(Object.entries(draft).map(([k, v]) => [k, sanitizeText(v, 1000)]));
    setQuestionarios(todos.map((item) => item.id === q.id ? { ...item, status: "respondido", respostas } : item));
    toast("Questionario enviado");
    pushEvent({
      tipo: "questionario",
      titulo: `${CURRENT_PATIENT.nome.split(" ")[0]} respondeu "${q.titulo}"`,
      audiencia: "clinica",
      patientId: PORTAL_ACCESS.patientId,
      clinicLink: "/patients/" + PORTAL_ACCESS.patientId,
    });
  };

  return (
    <div className="portal-page">
      <PageHead title="Questionarios" sub="Responda os formularios enviados pela clinica." />
      {questionnaires.length === 0 && <article className="card pad" style={{ textAlign: "center", padding: "32px 20px" }}><p style={{ margin: 0 }}>Nenhum questionario por aqui ainda.</p></article>}
      {questionnaires.map((q) => {
        const done = q.status === "respondido";
        const draft = respostasDraft[q.id] ?? {};
        return (
          <article className="card pad portal-question" key={q.id}>
            <div className="portal-row between">
              <div><span className="eyebrow">{q.categoria}</span><h2>{q.titulo}</h2><p>Prazo: {q.prazo}</p></div>
              <span className={cx("chip", done ? "sage" : "amber")}>{done ? "Respondido" : "Pendente"}</span>
            </div>
            {done ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {q.perguntas.map((p) => (
                  <div key={p.id}>
                    <div className="muted" style={{ fontSize: 12.5 }}>{p.texto}</div>
                    <div style={{ fontWeight: 600, marginTop: 2 }}>{q.respostas?.[p.id] || "—"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {q.perguntas.map((p) => (
                  <label className="field" key={p.id}>
                    <span>{p.texto}</span>
                    {p.tipo === "texto" && <textarea className="input" rows={3} value={draft[p.id] ?? ""} onChange={(e) => setResposta(q.id, p.id, e.target.value)} />}
                    {p.tipo === "escala" && <input className="input" type="range" min="1" max="5" value={draft[p.id] ?? "3"} onChange={(e) => setResposta(q.id, p.id, e.target.value)} />}
                    {p.tipo === "opcao" && <select className="select" value={draft[p.id] ?? ""} onChange={(e) => setResposta(q.id, p.id, e.target.value)}>
                      <option value="" disabled>Selecione…</option>
                      {p.opcoes?.map((op) => <option key={op}>{op}</option>)}
                    </select>}
                  </label>
                ))}
                <Button variant="primary" onClick={() => enviarRespostas(q)}>Enviar respostas</Button>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}

function PortalFinance() {
  const toast = useToast();
  const [finance, setFinance] = usePersistentState(LOCAL_KEYS.portalFinance, PORTAL_FINANCE);
  return (
    <div className="portal-page">
      <PageHead title="Financeiro" sub="Acompanhe faturas, vencimentos e recibos." />
      <div className="portal-list">
        {finance.map((f) => (
          <article className="card pad portal-row between" key={f.id}>
            <div><strong>{f.desc}</strong><p>{f.data} · venc. {f.vencimento}</p></div>
            <div className="portal-money"><strong className="num">{brl(f.valor)}</strong><span className={cx("chip", f.status === "Pago" ? "sage" : "amber")}>{f.status}</span></div>
            <Button sm variant="subtle" onClick={() => {
              if (f.status === "Pago") toast("Recibo baixado");
              else {
                setFinance(finance.map((item) => item.id === f.id ? { ...item, status: "Pago" } : item));
                toast("Pagamento registrado");
                pushEvent({
                  tipo: "financeiro",
                  titulo: `${CURRENT_PATIENT.nome.split(" ")[0]} pagou ${f.desc}`,
                  detalhe: brl(f.valor),
                  audiencia: "clinica",
                  patientId: PORTAL_ACCESS.patientId,
                  clinicLink: "/financeiro",
                });
              }
            }}>{f.status === "Pago" ? <Receipt size={14} /> : <CreditCard size={14} />}{f.status === "Pago" ? "Recibo" : "Pagar"}</Button>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortalInstructions() {
  return (
    <div className="portal-page">
      <PageHead title="Instrucoes recebidas" sub="Materiais e orientacoes enviados pela nutricionista." />
      <div className="portal-grid three">
        {PORTAL_INSTRUCTIONS.map((i) => (
          <article className="card pad portal-instruction" key={i.id}>
            <FileText size={20} />
            <span className="chip blue">{i.categoria}</span>
            <strong>{i.titulo}</strong>
            <p>{i.resumo}</p>
            <small>{i.enviadoEm} · {i.tempoLeitura}</small>
          </article>
        ))}
      </div>
    </div>
  );
}

function PortalVideoCall() {
  const toast = useToast();
  return (
    <div className="portal-page">
      <PageHead title="Videochamada" sub="Entre na sala quando sua consulta online estiver ativa." />
      <section className="portal-video card pad">
        <div className="portal-video-icon"><Video size={28} /></div>
        <h2>Sala de retorno</h2>
        <p>10/07/2026 · 14:30 · Vanessa da Luz</p>
        <Button variant="primary" onClick={() => toast("Entrando na sala de video")}><Play size={15} />Entrar na sala</Button>
      </section>
    </div>
  );
}

function PageHead({ title, sub }: { title: string; sub: string }) {
  return <div className="sechead portal-head"><div><div className="h1">{title}</div><p>{sub}</p></div></div>;
}
