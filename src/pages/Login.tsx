import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Info,
  Lock,
  Mail,
  Salad,
  ShieldAlert,
  Stethoscope,
  UserRound,
} from "lucide-react";
import { Button } from "../components/ui";
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
      <div className="site-login-top">
        <div className="site-login-brand"><div className="brand-mark"><Salad size={16} /></div><span>Novra</span></div>
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

            <div className="site-login-eyebrow">Caderno de nutrição clínica</div>
            <div className="site-login-copy">
              <h1>Sua agenda,<br />em ordem.</h1>
              <p>Pacientes, consultas e planos alimentares no mesmo lugar onde você já trabalha.</p>
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
              <Info size={14} />
              <span>Usar conta de demonstração</span>
            </button>
          </motion.div>

          <div className="site-login-foot">
            <span>© 2026 Novra</span>
          </div>
        </section>

        <aside className="site-login-visual">
          <div className="site-login-visual-top">
            <span>Ficha do dia</span>
            <time>{TODAY_LABEL}</time>
          </div>

          <div className="site-login-figure" aria-hidden="true">
            <svg viewBox="0 0 220 220" className="site-login-figure-svg">
              <circle cx="110" cy="110" r="108" className="slf-ring" />
              <path className="slf-coat" d="M70 214c-2-38 4-64 14-78-7-10-9-23-3-35 9-18 30-27 49-19 16 7 24 23 21 39 11 1 21 9 26 21 7 17 7 50 5 72-37 10-78 10-112 0Z" />
              <path className="slf-collar" d="M88 100c7 9 16 14 22 14s15-5 22-14l-6 22c-5 4-11 6-16 6s-11-2-16-6Z" />
              <circle className="slf-head" cx="110" cy="73" r="34" />
              <path className="slf-hair" d="M76 70c-2-22 13-40 34-40s36 18 34 40c-3-3-8-6-14-6-3-9-12-15-20-15s-17 6-20 15c-6 0-11 3-14 6Z" />
              <rect className="slf-stetho" x="100" y="118" width="20" height="34" rx="10" />
              <circle className="slf-badge" cx="146" cy="150" r="13" />
              <path className="slf-leaf" d="M140 150c0-9 7-16 16-16-1 9-7 15-16 16Z" />
            </svg>
            <div className="site-login-figure-tag">
              <Stethoscope size={13} />
              <span>Atendimento de hoje</span>
            </div>
          </div>

          <div className="site-login-ledger">
            <div className="site-login-ledger-row">
              <span className="num">08:30</span>
              <div>
                <strong>Avaliação inicial</strong>
                <small>Bioimpedância · Consultório</small>
              </div>
            </div>
            <div className="site-login-ledger-row">
              <span className="num">10:00</span>
              <div>
                <strong>Mariana Costa</strong>
                <small>Retorno gestacional · Online</small>
              </div>
            </div>
            <div className="site-login-ledger-row">
              <span className="num">14:30</span>
              <div>
                <strong>Plano alimentar · revisão</strong>
                <small>Reeducação alimentar · Presencial</small>
              </div>
            </div>
            <div className="site-login-ledger-row faded">
              <span className="num">16:00</span>
              <div>
                <strong>Retorno · acompanhamento</strong>
                <small>Disponível</small>
              </div>
            </div>
          </div>

          <div className="site-login-headline">
            <h2>Cada consulta, cada plano, no lugar certo.</h2>
            <p>Pensado para o ritmo de quem atende — não para um painel de métricas.</p>
          </div>
        </aside>
      </motion.section>
    </main>
  );
}

const TODAY_LABEL = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

function formatLock(ms: number): string {
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
}
