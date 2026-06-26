import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MailCheck,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Button } from "../components/ui";
import { AuthAside, AuthMobileBrand } from "../components/AuthAside";
import { PORTAL_ACCESS } from "../lib/mock";
import { isValidEmail } from "../lib/utils";
import {
  clearFailedAttempts,
  getLockRemaining,
  getRole,
  LOCK_MS,
  login,
  recordFailedAttempt,
  resetPassword,
  signInWithGoogle,
} from "../lib/auth";

const DEMO = { email: "nutri123@gmail.com", password: "nutri123" };

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

export default function Login() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
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

  function trackCaps(e: KeyboardEvent<HTMLInputElement>) {
    setCapsLock(e.getModifierState("CapsLock"));
  }

  function fillDemo() {
    setEmail(DEMO.email);
    setSenha(DEMO.password);
    setError("");
  }

  async function submit() {
    if (locked || loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) { setError("Digite um e-mail válido."); return; }
    if (!senha) { setError("Digite sua senha."); return; }

    setLoading(true);
    try {
      await login(cleanEmail, senha);
      clearFailedAttempts();
      const loggedRole = getRole();
      const next = params.get("next");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      const target = loggedRole === "patient" ? `/portal/${PORTAL_ACCESS.slug}` : (safeNext ?? "/");
      nav(target, { replace: true });
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

  async function sendReset() {
    if (loading) return;
    const cleanEmail = email.trim().toLowerCase();
    if (!isValidEmail(cleanEmail)) { setError("Digite o e-mail da sua conta."); return; }
    setLoading(true);
    setError("");
    try {
      await resetPassword(cleanEmail);
      setResetSent(true);
    } catch {
      setError("Não foi possível enviar o link agora. Tente de novo.");
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    if (googleLoading) return;
    setGoogleLoading(true);
    setError("");
    try {
      await signInWithGoogle();
    } catch {
      setError("Login com Google indisponível no momento.");
      setGoogleLoading(false);
    }
  }

  function openReset() {
    setMode("reset");
    setResetSent(false);
    setError("");
  }

  function backToLogin() {
    setMode("login");
    setResetSent(false);
    setError("");
  }

  return (
    <main className="auth">
      <AuthAside />

      <section className="auth-main">
        <AuthMobileBrand />
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {mode === "login" ? (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
                <h2 className="auth-title">Bem-vinda de volta! <span className="auth-wave">👋</span></h2>
                <p className="auth-sub">Acesse sua conta e continue transformando vidas.</p>

                <div className="auth-form">
                  <label className="auth-field">
                    <span>E-mail</span>
                    <div>
                      <Mail size={18} />
                      <input
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setError(""); }}
                        type="email" placeholder="seu@email.com" autoComplete="email" inputMode="email" disabled={locked}
                      />
                    </div>
                  </label>

                  <label className="auth-field">
                    <span>Senha</span>
                    <div>
                      <Lock size={18} />
                      <input
                        value={senha}
                        onChange={(e) => { setSenha(e.target.value); setError(""); }}
                        onKeyUp={trackCaps}
                        onKeyDown={(e) => { trackCaps(e); if (e.key === "Enter") submit(); }}
                        type={show ? "text" : "password"} placeholder="Sua senha" autoComplete="current-password" disabled={locked}
                      />
                      <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {capsLock && <small className="auth-caps"><AlertTriangle size={12} />Caps Lock está ativado</small>}
                  </label>

                  <button type="button" className="auth-forgot" onClick={openReset}>Esqueceu sua senha?</button>

                  <AnimatePresence>
                    {(locked || error) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="banner alert auth-banner"
                      >
                        {locked
                          ? <><ShieldAlert size={15} /><span>Acesso bloqueado. Tente em <strong className="num">{formatLock(lockMs)}</strong>.</span></>
                          : error}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Button variant="primary" onClick={submit} className="auth-submit" disabled={loading || locked}>
                    {locked ? "Bloqueado" : loading ? "Entrando..." : "Entrar na sua conta"}
                    {!locked && !loading && <ArrowRight size={18} />}
                  </Button>

                  <div className="auth-sep"><span />ou continue com<span /></div>

                  <button type="button" className="auth-google" onClick={google} disabled={googleLoading}>
                    <GoogleIcon />{googleLoading ? "Conectando..." : "Entrar com Google"}
                  </button>

                  <p className="auth-switch">
                    Ainda não tem uma conta? <Link to="/cadastro">Criar conta <ArrowRight size={14} /></Link>
                  </p>

                  <button type="button" className="auth-demo" onClick={fillDemo}>Usar conta de demonstração</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="reset" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: .2 }}>
                {resetSent ? (
                  <>
                    <div className="auth-reset-ic"><MailCheck size={26} /></div>
                    <h2 className="auth-title">Verifique seu e-mail</h2>
                    <p className="auth-sub">Enviamos um link de recuperação para <strong>{email.trim().toLowerCase()}</strong>. Abra o link para criar uma nova senha.</p>
                    <Button variant="primary" onClick={backToLogin} className="auth-submit" style={{ marginTop: 22 }}>
                      <ArrowLeft size={18} />Voltar para o login
                    </Button>
                  </>
                ) : (
                  <>
                    <button type="button" className="auth-back" onClick={backToLogin}><ArrowLeft size={16} />Voltar</button>
                    <h2 className="auth-title">Recuperar acesso</h2>
                    <p className="auth-sub">Informe o e-mail da sua conta e enviaremos um link para redefinir a senha.</p>

                    <div className="auth-form">
                      <label className="auth-field">
                        <span>E-mail</span>
                        <div>
                          <Mail size={18} />
                          <input
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setError(""); }}
                            onKeyDown={(e) => { if (e.key === "Enter") sendReset(); }}
                            type="email" placeholder="seu@email.com" autoComplete="email" inputMode="email" autoFocus
                          />
                        </div>
                      </label>

                      <AnimatePresence>
                        {error && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="banner alert auth-banner">
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <Button variant="primary" onClick={sendReset} className="auth-submit" disabled={loading}>
                        {loading ? "Enviando..." : "Enviar link de recuperação"}{!loading && <ArrowRight size={18} />}
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <footer className="auth-foot">
          <span><ShieldCheck size={13} /> Seus dados estão protegidos com segurança de ponta a ponta.</span>
          <span>© 2026 Novra. Todos os direitos reservados.</span>
        </footer>
      </section>
    </main>
  );
}

function formatLock(ms: number): string {
  return `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
}
