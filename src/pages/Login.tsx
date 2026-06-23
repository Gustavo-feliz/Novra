import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Activity,
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
<<<<<<< HEAD
  Search,
  ShieldAlert,
  Stethoscope,
  UserPlus,
  UserRound,
=======
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
>>>>>>> c807cfc (alterações back/login)
} from "lucide-react";
import { Button } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { PORTAL_ACCESS } from "../lib/mock";
<<<<<<< HEAD
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
=======
import { loginWithApi } from "../lib/api";
>>>>>>> c807cfc (alterações back/login)

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
<<<<<<< HEAD
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
=======
  const fillDemo = () => {
    setEmail("nutri123@gmail.com");
    setSenha("nutri123");
    setError("");
  };

  async function submit() {
    const cleanEmail = email.trim().toLowerCase();
    const user = Object.values(USERS).find((u) => u.email === cleanEmail && u.password === senha);
>>>>>>> c807cfc (alterações back/login)

    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) {
      setError("Digite um e-mail valido.");
      return;
    }
    if (!senha) {
      setError("Digite sua senha.");
      return;
    }

<<<<<<< HEAD
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
=======
    setLoading(true);
    try {
      const session = await loginWithApi(cleanEmail, senha);
      localStorage.setItem("nutriflow_demo_role", session.user.role === "patient" ? "patient" : "nutritionist");
      nav(user.target);
    } catch {
      localStorage.setItem("nutriflow_demo_role", user === USERS.patient ? "patient" : "nutritionist");
      nav(user.target);
    } finally {
      setLoading(false);
    }
>>>>>>> c807cfc (alterações back/login)
  }

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  const lockText = `${Math.floor(lockMs / 60000)}:${String(Math.floor((lockMs % 60000) / 1000)).padStart(2, "0")}`;

  return (
    <main className="site-login">
<<<<<<< HEAD
      <div className="site-login-bg" aria-hidden="true">
        <GhostDashboard />
      </div>
      <div className="site-login-mobile-hero" aria-hidden="true">
        <div className="site-login-mobile-glow" />
      </div>

=======
>>>>>>> c807cfc (alterações back/login)
      <div className="site-login-top">
        <div className="site-login-brand"><div className="brand-mark"><Salad size={16} /></div><span>NutriFlow</span></div>
        <ThemeToggle />
      </div>

      <motion.section
        className="site-login-shell"
        initial={{ opacity: 0, y: 18, scale: .985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: .42 }}
      >
<<<<<<< HEAD
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
=======
        <section className="site-login-formpane">
          <div className="site-login-kicker">Painel da nutricionista</div>
          <div className="site-login-copy">
            <h1>Acesse sua clínica</h1>
            <p>Organize pacientes, agenda, planos alimentares e mensagens em um painel seguro para o seu atendimento.</p>
          </div>

          <div className="site-login-form">
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
                />
              </div>
            </label>

            <label className="site-login-field">
              <span>Senha <button type="button">Esqueceu a senha?</button></span>
              <div>
                <Lock size={18} />
                <input
                  value={senha}
                  onChange={(e) => { setSenha(e.target.value); setError(""); }}
                  type={show ? "text" : "password"}
                  placeholder="Sua senha"
                  autoComplete="current-password"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                  {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
>>>>>>> c807cfc (alterações back/login)

            <div className="site-login-options">
              <label>
                <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                <span>Manter sessão ativa neste dispositivo</span>
              </label>
            </div>

<<<<<<< HEAD
          <button type="button" className="site-login-demo" onClick={() => selectRole(role)}>
            <CheckCircle2 size={14} />
            <span>Conta demo de {role === "patient" ? "paciente" : "nutricionista"}: <strong>{USERS[role].email}</strong> / <strong>{USERS[role].password}</strong></span>
          </button>
        </div>
=======
            {error && <div className="banner alert">{error}</div>}

            <Button variant="primary" onClick={submit} className="site-login-submit" disabled={loading}>
              {loading ? "Entrando..." : "Entrar no painel"} <span><ArrowRight size={17} /></span>
            </Button>

            <button className="site-login-demo" type="button" onClick={fillDemo}>
              <Info size={17} />
              <span>Ambiente de demonstração. Toque para preencher o acesso de exemplo.</span>
              <b>nutri123@gmail.com</b>
            </button>
          </div>

          <div className="site-login-foot">
            <span>© 2026 NutriFlow</span>
            <span><ShieldCheck size={13} /> API segura + GPT-4o no backend</span>
          </div>
        </section>

        <aside className="site-login-visual">
          <div className="site-login-visual-top">
            <div><Sparkles size={18} /> Clínica em ordem</div>
            <span>NutriFlow OS</span>
          </div>

          <div className="site-orb" />
          <div className="site-plate" />

          <article className="login-metric revenue">
            <div><BarChart3 size={18} /> Receita no mês</div>
            <strong>R$ 12.840</strong>
            <span>+18% vs. mês anterior</span>
          </article>

          <article className="login-metric dark">
            <div><Activity size={18} /> Adesão dos pacientes</div>
            <strong>91%</strong>
            <span>32 planos ativos acompanhados</span>
          </article>

          <article className="login-next">
            <div className="login-next-head">
              <span><CalendarDays size={16} /> Próxima consulta</span>
              <b>14:30</b>
            </div>
            <div className="login-patient-row">
              <i>MC</i>
              <div><strong>Mariana Costa</strong><small>Retorno gestacional · Online</small></div>
              <ChevronRight size={17} />
            </div>
          </article>

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
>>>>>>> c807cfc (alterações back/login)
      </motion.section>
    </main>
  );
}
