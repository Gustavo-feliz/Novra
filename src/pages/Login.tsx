import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  CalendarPlus,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Moon,
  Salad,
  Search,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  UserRound,
} from "lucide-react";
import { Button } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { PORTAL_ACCESS } from "../lib/mock";
import { cx, isValidEmail } from "../lib/utils";
import {
  clearFailedAttempts,
  getLockRemaining,
  LOCK_MS,
  recordFailedAttempt,
  startSession,
  unlockPortal,
  wasSessionExpired,
  type Role,
} from "../lib/auth";

const USERS: Record<Role, { email: string; password: string; target: string }> = {
  nutritionist: { email: "nutri123@gmail.com", password: "nutri123", target: "/" },
  patient: { email: "mariana@gmail.com", password: "teste123", target: `/portal/${PORTAL_ACCESS.slug}` },
};

const ROLE_TABS: { id: Role; label: string; icon: typeof Stethoscope }[] = [
  { id: "nutritionist", label: "Nutricionista", icon: Stethoscope },
  { id: "patient", label: "Paciente", icon: UserRound },
];

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>("nutritionist");
  const [email, setEmail] = useState(USERS.nutritionist.email);
  const [senha, setSenha] = useState(USERS.nutritionist.password);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [lockMs, setLockMs] = useState(getLockRemaining);
  const [expired] = useState(wasSessionExpired);
  const timer = useRef<ReturnType<typeof setInterval>>();

  const locked = lockMs > 0;

  // Conta regressiva enquanto o login estiver bloqueado por excesso de tentativas.
  useEffect(() => {
    if (!locked) return;
    timer.current = setInterval(() => {
      const remaining = getLockRemaining();
      setLockMs(remaining);
      if (remaining <= 0 && timer.current) clearInterval(timer.current);
    }, 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [locked]);

  function selectRole(next: Role) {
    setRole(next);
    setEmail(USERS[next].email);
    setSenha(USERS[next].password);
    setError("");
  }

  function submit() {
    if (locked) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Digite um e-mail valido.");
      return;
    }
    if (!senha) {
      setError("Digite sua senha.");
      return;
    }

    const matchedRole = (Object.keys(USERS) as Role[]).find(
      (key) => USERS[key].email === cleanEmail && USERS[key].password === senha,
    );

    if (!matchedRole) {
      const left = recordFailedAttempt();
      if (left <= 0) {
        setLockMs(getLockRemaining());
        setError(`Muitas tentativas. Acesso bloqueado por ${Math.ceil(LOCK_MS / 60000)} minutos.`);
      } else {
        setError(`E-mail ou senha incorretos. ${left} tentativa(s) restante(s).`);
      }
      return;
    }

    clearFailedAttempts();
    setLoading(true);
    startSession(matchedRole, remember);
    if (matchedRole === "patient") unlockPortal(PORTAL_ACCESS.slug);

    const next = params.get("next");
    const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
    const target = safeNext ?? USERS[matchedRole].target;
    setTimeout(() => nav(target, { replace: true }), 260);
  }

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  const lockText = `${Math.floor(lockMs / 60000)}:${String(Math.floor((lockMs % 60000) / 1000)).padStart(2, "0")}`;

  return (
    <main className="site-login">
      <div className="site-login-bg" aria-hidden="true">
        <GhostDashboard />
      </div>
      <div className="site-login-mobile-hero" aria-hidden="true">
        <div className="site-login-mobile-glow" />
      </div>

      <div className="site-login-top">
        <div className="site-login-brand"><div className="brand-mark"><Salad size={16} /></div>NutriFlow</div>
        <ThemeToggle />
      </div>

      <motion.section
        className="site-login-card"
        initial={{ opacity: 0, y: 18, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .42 }}
      >
        <div className="brand-mark site-login-logo"><Salad size={28} /></div>
        <div className="site-login-title">
          <h1>NutriFlow</h1>
          <p>Gestao inteligente para consultorios e clinicas</p>
        </div>

        <div className="seg site-login-roles">
          {ROLE_TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" className={cx(role === id && "on")} onClick={() => selectRole(id)}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        <div className="site-login-copy">
          <h2>{role === "patient" ? "Acesse seu acompanhamento" : "Bem-vinda de volta"}</h2>
          <p>{role === "patient" ? "Entre com os dados enviados pela sua nutricionista" : "Faca login para acessar sua conta"}</p>
        </div>

        {expired && (
          <div className="banner warn site-login-banner"><AlertTriangle size={15} /><span>Sua sessao expirou por inatividade. Entre novamente.</span></div>
        )}

        <div className="site-login-form">
          <label className="site-login-field">
            <span>E-mail</span>
            <div>
              <Mail size={17} />
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                inputMode="email"
                disabled={locked}
              />
            </div>
          </label>

          <label className="site-login-field">
            <span>Senha</span>
            <div>
              <Lock size={17} />
              <input
                value={senha}
                onChange={(e) => { setSenha(e.target.value); setError(""); }}
                onKeyUp={trackCaps}
                onKeyDown={(e) => { trackCaps(e); if (e.key === "Enter") submit(); }}
                type={show ? "text" : "password"}
                placeholder="Sua senha"
                autoComplete="current-password"
                disabled={locked}
              />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {capsLock && <small className="site-login-caps"><AlertTriangle size={12} />Caps Lock esta ativado</small>}
          </label>

          <div className="site-login-options">
            <label>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Lembrar de mim</span>
            </label>
            <button type="button">Esqueci minha senha</button>
          </div>

          {locked ? (
            <div className="banner alert site-login-banner"><ShieldAlert size={15} /><span>Acesso bloqueado por seguranca. Tente de novo em <strong className="num">{lockText}</strong>.</span></div>
          ) : error ? (
            <div className="banner alert">{error}</div>
          ) : null}

          <Button variant="primary" onClick={submit} className="site-login-submit" disabled={loading || locked}>
            {locked ? "Bloqueado" : loading ? "Entrando..." : "Entrar"} <span><ArrowRight size={16} /></span>
          </Button>

          <div className="site-login-sep"><span />ou continue com<span /></div>
          <button className="site-google" type="button">
            <b>G</b>
            Continuar com Google
          </button>

          <button type="button" className="site-login-demo" onClick={() => selectRole(role)}>
            <CheckCircle2 size={14} />
            <span>Conta demo de {role === "patient" ? "paciente" : "nutricionista"}: <strong>{USERS[role].email}</strong> / <strong>{USERS[role].password}</strong></span>
          </button>
        </div>
      </motion.section>
    </main>
  );
}

function GhostDashboard() {
  return (
    <div className="ghost-dashboard">
      <aside>
        <div className="ghost-logo"><Salad size={18} />NutriFlow</div>
        <div className="ghost-clinic">
          <div className="brand-mark"><Salad size={15} /></div>
          <div><strong>Vanessa da Luz</strong><span>CRN-4 25107574</span></div>
        </div>
        {["Dashboard", "Pacientes", "Diarios", "Questionarios", "Financeiro", "Videochamada"].map((item, i) => (
          <div key={item} className={i === 0 ? "active" : ""}>{item}{i === 2 && <small>6</small>}</div>
        ))}
      </aside>

      <section>
        <header>
          <div><h2>Bom dia, Vanessa</h2><p>Quarta-feira, 17 de Junho</p></div>
          <div className="ghost-actions">
            <button><UserPlus size={15} />Novo paciente</button>
            <button><CalendarPlus size={15} />Nova consulta</button>
            <button className="primary">Novo plano</button>
          </div>
        </header>

        <div className="ghost-stats">
          {["Pacientes ativos|47", "Consultas na semana|18", "Taxa de retorno|82%", "Planos vencendo|5"].map((raw) => {
            const [label, value] = raw.split("|");
            return <article key={label}><span>{label}</span><strong>{value}</strong><small>+6%</small></article>;
          })}
        </div>

        <div className="ghost-grid">
          <article className="ghost-panel large">
            <span>PROXIMOS ATENDIMENTOS</span>
            {["10:00  Rafael Andrade", "14:00  Joao Pedro", "09:00  Larissa Fontes"].map((row) => <p key={row}>{row}</p>)}
          </article>
          <article className="ghost-panel">
            <span>BUSCAR</span>
            <div className="ghost-search"><Search size={16} />Buscar</div>
            <Moon size={18} />
          </article>
          <article className="ghost-panel large bars">
            <span>CONSULTAS POR DIA</span>
            {[44, 58, 78, 62, 50, 32].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
          </article>
          <article className="ghost-panel tasks">
            <span>TAREFAS PENDENTES</span>
            {["Revisar exames do Rafael Andrade", "Enviar plano alimentar v2", "Confirmar retorno da Mariana"].map((task) => <p key={task}><CheckCircle2 size={17} />{task}</p>)}
          </article>
        </div>
      </section>
    </div>
  );
}
