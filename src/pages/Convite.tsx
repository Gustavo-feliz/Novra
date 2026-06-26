import { useState, type KeyboardEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Lock, Mail, MailCheck, Phone, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "../components/ui";
import { AuthAside, AuthMobileBrand } from "../components/AuthAside";
import { isValidEmail } from "../lib/utils";
import { signUpPatient } from "../lib/auth";
import { PORTAL_ACCESS } from "../lib/mock";

export default function Convite() {
  const nav = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit() {
    if (loading) return;
    const cleanName = nome.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (cleanName.length < 2) { setError("Informe seu nome."); return; }
    if (!isValidEmail(cleanEmail)) { setError("Digite um e-mail válido."); return; }
    if (senha.length < 6) { setError("A senha precisa ter ao menos 6 caracteres."); return; }

    setLoading(true);
    setError("");
    try {
      const { session } = await signUpPatient({ name: cleanName, email: cleanEmail, password: senha, telefone: telefone.trim() || undefined });
      if (session) nav(`/portal/${PORTAL_ACCESS.slug}`, { replace: true });
      else setSent(true);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setError(/registered|already/i.test(msg) ? "Este e-mail já tem uma conta." : "Não foi possível criar sua conta agora.");
    } finally {
      setLoading(false);
    }
  }

  function onEnter(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
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
          {sent ? (
            <>
              <div className="auth-reset-ic"><MailCheck size={26} /></div>
              <h2 className="auth-title">Confirme seu e-mail</h2>
              <p className="auth-sub">Enviamos um link de confirmação para <strong>{email.trim().toLowerCase()}</strong>. Confirme para ativar sua conta e acessar seu portal.</p>
            </>
          ) : (
            <>
              <h2 className="auth-title">Crie sua conta de paciente</h2>
              <p className="auth-sub">Seu nutricionista te convidou. Complete seu cadastro para acessar seu portal.</p>

              <div className="auth-form">
                <label className="auth-field">
                  <span>Nome completo</span>
                  <div>
                    <UserRound size={18} />
                    <input value={nome} onChange={(e) => { setNome(e.target.value); setError(""); }} onKeyDown={onEnter} type="text" placeholder="Como você se chama" autoComplete="name" />
                  </div>
                </label>

                <label className="auth-field">
                  <span>E-mail</span>
                  <div>
                    <Mail size={18} />
                    <input value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} onKeyDown={onEnter} type="email" placeholder="seu@email.com" autoComplete="email" inputMode="email" />
                  </div>
                </label>

                <label className="auth-field">
                  <span>Celular (opcional)</span>
                  <div>
                    <Phone size={18} />
                    <input value={telefone} onChange={(e) => setTelefone(e.target.value)} onKeyDown={onEnter} type="tel" placeholder="(11) 98888-7777" autoComplete="tel" />
                  </div>
                </label>

                <label className="auth-field">
                  <span>Senha</span>
                  <div>
                    <Lock size={18} />
                    <input value={senha} onChange={(e) => { setSenha(e.target.value); setError(""); }} onKeyDown={onEnter} type={show ? "text" : "password"} placeholder="Mínimo de 6 caracteres" autoComplete="new-password" />
                    <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                      {show ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </label>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="banner alert auth-banner">
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button variant="primary" onClick={submit} className="auth-submit" disabled={loading}>
                  {loading ? "Criando..." : "Criar minha conta"}{!loading && <ArrowRight size={18} />}
                </Button>

                <p className="auth-switch">
                  Já é profissional? <Link to="/login">Entrar <ArrowRight size={14} /></Link>
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
