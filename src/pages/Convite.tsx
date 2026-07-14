import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck,
  Phone, ShieldCheck, UserRound, Salad, AlertCircle,
} from "lucide-react";
import { Button } from "../components/ui";
import { AuthAside, AuthMobileBrand } from "../components/AuthAside";
import { isValidEmail } from "../lib/utils";
import { signUpPatient } from "../lib/auth";
import { getInviteInfo, useInvite, type InviteInfo } from "../lib/db";
import { PORTAL_ACCESS } from "../lib/mock";

type InviteState = "loading" | "none" | "valid" | "invalid" | "used" | "expired";

export default function Convite() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token");

  const [inviteState, setInviteState] = useState<InviteState>(token ? "loading" : "none");
  const [invite, setInvite] = useState<InviteInfo | null>(null);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!token) return;
    getInviteInfo(token).then((info) => {
      if (!info) { setInviteState("invalid"); return; }
      if (info.used_at) { setInviteState("used"); return; }
      if (new Date(info.expires_at) < new Date()) { setInviteState("expired"); return; }
      setInvite(info);
      setInviteState("valid");
      if (info.patient_email) setEmail(info.patient_email);
      if (info.patient_name) setNome(info.patient_name);
    }).catch(() => setInviteState("invalid"));
  }, [token]);

  async function submit() {
    if (loading) return;
    const cleanName = nome.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) { setError("Informe seu nome completo."); return; }
    if (!isValidEmail(cleanEmail)) { setError("Digite um e-mail válido."); return; }
    if (senha.length < 6) { setError("A senha precisa ter ao menos 6 caracteres."); return; }

    setLoading(true);
    setError("");
    try {
      const { session } = await signUpPatient({
        name: cleanName,
        email: cleanEmail,
        password: senha,
        telefone: telefone.trim() || undefined,
        invitedBy: invite?.invited_by,
      });

      if (session) {
        // Sessão imediata: tenta usar o convite via RPC como garantia extra
        if (token) await useInvite(token);
        nav(`/portal/${PORTAL_ACCESS.slug}`, { replace: true });
      } else {
        // Confirmação de e-mail ativa: salva token para processar no próximo login
        if (token) window.sessionStorage.setItem("novra.pending_invite", token);
        setSent(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      if (/registered|already/i.test(msg)) setError("Este e-mail já tem uma conta. Faça login.");
      else setError("Não foi possível criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  // ── Estados de erro do token ───────────────────────────────────────────────
  if (inviteState === "loading") {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div className="spinner" />
      </div>
    );
  }

  if (inviteState === "invalid" || inviteState === "used" || inviteState === "expired") {
    const titles = { invalid: "Link inválido", used: "Link já utilizado", expired: "Link expirado" };
    const msgs = {
      invalid: "Este link de convite não é válido. Verifique se você copiou corretamente.",
      used: "Este convite já foi usado. Se você já criou uma conta, faça login abaixo.",
      expired: "Este link expirou (validade de 7 dias). Peça ao seu nutricionista um novo link.",
    };
    return (
      <main className="auth">
        <AuthAside />
        <section className="auth-main">
          <AuthMobileBrand />
          <motion.div className="auth-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
            <div className="auth-reset-ic" style={{ color: "var(--amber)" }}><AlertCircle size={26} /></div>
            <h2 className="auth-title">{titles[inviteState]}</h2>
            <p className="auth-sub">{msgs[inviteState]}</p>
            <Button variant="primary" onClick={() => nav("/login")} style={{ marginTop: 8, width: "100%" }}>
              Ir para o login <ArrowRight size={16} />
            </Button>
          </motion.div>
          <footer className="auth-foot">
            <span>© 2026 Novra. Todos os direitos reservados.</span>
          </footer>
        </section>
      </main>
    );
  }

  // ── Formulário ─────────────────────────────────────────────────────────────
  const hasInvite = inviteState === "valid" && invite;
  const emailLocked = hasInvite && !!invite.patient_email;

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
          {sent ? (
            <>
              <div className="auth-reset-ic"><MailCheck size={26} /></div>
              <h2 className="auth-title">Confirme seu e-mail</h2>
              <p className="auth-sub">
                Enviamos um link de confirmação para <strong>{email.trim().toLowerCase()}</strong>.
                Acesse seu e-mail e clique no link para ativar sua conta e acessar seu portal de saúde.
              </p>
            </>
          ) : (
            <>
              {hasInvite && (
                <div style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 14px", background: "var(--surface2)",
                  borderRadius: 10, marginBottom: 4,
                }}>
                  <div className="brand-mark" style={{ width: 34, height: 34, borderRadius: 9, flexShrink: 0 }}>
                    <Salad size={15} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{invite.clinic_name}</div>
                    <div className="faint" style={{ fontSize: 11.5 }}>te convidou para o Novra</div>
                  </div>
                </div>
              )}

              <h2 className="auth-title">
                {hasInvite ? "Complete seu cadastro" : "Crie sua conta de paciente"}
              </h2>
              <p className="auth-sub">
                {hasInvite
                  ? "Crie sua senha e acesse seu portal de saúde personalizado."
                  : "Seu nutricionista te convidou. Preencha seus dados para continuar."}
              </p>

              <div className="auth-form">
                <label className="auth-field">
                  <span>Nome completo</span>
                  <div>
                    <UserRound size={18} />
                    <input
                      value={nome}
                      onChange={(e) => { setNome(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      type="text" placeholder="Como você se chama" autoComplete="name"
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span>E-mail</span>
                  <div>
                    <Mail size={18} />
                    <input
                      value={email}
                      onChange={(e) => { if (!emailLocked) { setEmail(e.target.value); setError(""); } }}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      type="email" placeholder="seu@email.com"
                      autoComplete="email" inputMode="email"
                      readOnly={emailLocked || undefined}
                      style={emailLocked ? { opacity: .7, cursor: "default" } : undefined}
                    />
                  </div>
                </label>

                <label className="auth-field">
                  <span>Celular (opcional)</span>
                  <div>
                    <Phone size={18} />
                    <input
                      value={telefone}
                      onChange={(e) => setTelefone(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      type="tel" placeholder="(11) 98888-7777" autoComplete="tel"
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
                      onKeyDown={(e) => e.key === "Enter" && submit()}
                      type={show ? "text" : "password"}
                      placeholder="Mínimo de 6 caracteres" autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="banner alert auth-banner"
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="primary" onClick={submit} className="auth-submit" disabled={loading}>
                  {loading ? "Criando conta…" : "Criar minha conta"}
                  {!loading && <ArrowRight size={18} />}
                </Button>

                <p className="auth-switch">
                  Já tem conta? <Link to="/login">Entrar <ArrowRight size={14} /></Link>
                </p>
              </div>
            </>
          )}
        </motion.div>

        <footer className="auth-foot">
          <span><ShieldCheck size={13} /> Seus dados estão protegidos com segurança de ponta a ponta.</span>
          <span>© 2026 Novra. Todos os direitos reservados.</span>
        </footer>
      </section>
    </main>
  );
}
