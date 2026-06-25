import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  ChevronRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Salad,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { PORTAL_ACCESS } from "../lib/mock";
import { isValidEmail } from "../lib/utils";
import { clearFailedAttempts, getLockRemaining, getRole, LOCK_MS, login, recordFailedAttempt, type Role } from "../lib/auth";

const DEMO: Record<Role, { email: string; password: string; target: string }> = {
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
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [lockMs, setLockMs] = useState(getLockRemaining);

  const timer = useRef<ReturnType<typeof setInterval>>();
  const locked = lockMs > 0;

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
    setError("");
  }

  function fillDemo() {
    setEmail(DEMO[role].email);
    setSenha(DEMO[role].password);
    setError("");
  }

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  async function submit() {
    if (locked || loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Digite um e-mail valido.");
      return;
    }
    if (!senha) {
      setError("Digite sua senha.");
      return;
    }

    setLoading(true);
    try {
      await login(cleanEmail, senha);
      clearFailedAttempts();
      const loggedRole = getRole();
      const target = loggedRole === "patient" ? `/portal/${PORTAL_ACCESS.slug}` : "/";
      const next = params.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      nav(loggedRole === "patient" ? target : (safeNext ?? target), { replace: true });
    } catch {
      const left = recordFailedAttempt();
      if (left <= 0) {
        setLockMs(getLockRemaining());
        setError(`Muitas tentativas. Acesso bloqueado por ${Math.ceil(LOCK_MS / 60000)} minutos.`);
      } else {
        setError(`E-mail ou senha incorretos. ${left} tentativa(s) restante(s).`);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="site-login">
      <div className="site-login-aurora" aria-hidden="true">
        <span className="aurora a1" />
        <span className="aurora a2" />
        <span className="aurora a3" />
      </div>

      <div className="site-login-top">
        <div className="site-login-brand"><div className="brand-mark"><Salad size={16} /></div><span>Novra</span></div>
        <ThemeToggle />
      </div>

      <motion.section
        className="site-login-shell"
        initial={{ opacity: 0, y: 22, scale: .98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
      >
        <section className="site-login-formpane">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4, delay: .05 }}
          >
            <div className="seg site-login-roles">
              {ROLE_TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" className={id === role ? "on" : undefined} onClick={() => selectRole(id)}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>

            <div className="site-login-kicker"><Sparkles size={12} />Painel da nutricionista</div>
            <div className="site-login-copy">
              <h1>Acesse sua<br />clínica</h1>
              <p>Organize pacientes, agenda, planos alimentares e mensagens em um painel seguro para o seu atendimento.</p>
            </div>
          </motion.div>

          <motion.div
            className="site-login-form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .4, delay: .12 }}
          >
            <label className="site-login-field">
              <span>E-mail</span>
              <div>
                <Mail size={18} />
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
                <Lock size={18} />
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
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {capsLock && <small className="site-login-caps"><AlertTriangle size={12} />Caps Lock esta ativado</small>}
            </label>

            <div className="site-login-options">
              <label>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Manter sessão ativa neste dispositivo</span>
              </label>
            </div>

            <AnimatePresence mode="wait">
              {locked ? (
                <motion.div
                  key="locked"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="banner alert site-login-banner"
                >
                  <ShieldAlert size={15} />
                  <span>Acesso bloqueado por seguranca. Tente de novo em <strong className="num">{formatLock(lockMs)}</strong>.</span>
                </motion.div>
              ) : error ? (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="banner alert site-login-banner"
                >
                  {error}
                </motion.div>
              ) : null}
            </AnimatePresence>

            <Button variant="primary" onClick={submit} className="site-login-submit" disabled={loading || locked}>
              {locked ? "Bloqueado" : loading ? "Entrando..." : "Entrar no painel"} <span><ArrowRight size={17} /></span>
            </Button>

            <button className="site-login-demo" type="button" onClick={fillDemo}>
              <Info size={17} />
              <span>Ambiente de demonstração. Toque para preencher o acesso de exemplo.</span>
              <b>{DEMO[role].email}</b>
            </button>
          </motion.div>

          <div className="site-login-foot">
            <span>© 2026 Novra</span>
            <span><ShieldCheck size={13} /> Autenticação via Supabase + GPT-4o no backend</span>
          </div>
        </section>

        <aside className="site-login-visual">
          <div className="site-login-visual-top">
            <div><Sparkles size={18} /> Clínica em ordem</div>
            <span>Novra OS</span>
          </div>

          <div className="site-orb" />
          <div className="site-plate" />

          <motion.article
            className="login-metric revenue"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .25 }}
          >
            <div><BarChart3 size={18} /> Receita no mês</div>
            <strong>R$ 12.840</strong>
            <span>+18% vs. mês anterior</span>
          </motion.article>

          <motion.article
            className="login-metric dark"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .35 }}
          >
            <div><Activity size={18} /> Adesão dos pacientes</div>
            <strong>91%</strong>
            <span>32 planos ativos acompanhados</span>
          </motion.article>

          <motion.article
            className="login-next"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: .5, delay: .45 }}
          >
            <div className="login-next-head">
              <span><CalendarDays size={16} /> Próxima consulta</span>
              <b>14:30</b>
            </div>
            <div className="login-patient-row">
              <i>MC</i>
              <div><strong>Mariana Costa</strong><small>Retorno gestacional · Online</small></div>
              <ChevronRight size={17} />
            </div>
          </motion.article>

          <div className="site-login-headline">
            <h2>O controle da sua clínica, da agenda ao plano alimentar.</h2>
            <p>Pacientes, financeiro, evolução, diário alimentar e IA em um só lugar, feito para a rotina real do consultório.</p>
          </div>

          <div className="site-login-tags">
            <span><Users size={14} /> Pacientes</span>
            <span><Stethoscope size={14} /> Consultas</span>
            <span><Check size={14} /> Planos</span>
          </div>
        </aside>
      </motion.section>
    </main>
  );
}

function formatLock(ms: number): string {
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
}
