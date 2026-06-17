import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
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
  UserPlus,
} from "lucide-react";
import { Button } from "../components/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { PORTAL_ACCESS } from "../lib/mock";

const USERS = {
  nutritionist: { email: "nutri123@gmail.com", password: "nutri123", target: "/" },
  patient: { email: "mariana@gmail.com", password: "teste123", target: `/portal/${PORTAL_ACCESS.slug}` },
};

export default function Login() {
  const nav = useNavigate();
  const [email, setEmail] = useState("nutri123@gmail.com");
  const [senha, setSenha] = useState("nutri123");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  function submit() {
    const cleanEmail = email.trim().toLowerCase();
    const user = Object.values(USERS).find((u) => u.email === cleanEmail && u.password === senha);

    if (!user) {
      setError("E-mail ou senha incorretos.");
      return;
    }

    localStorage.setItem("nutriflow_demo_role", user === USERS.patient ? "patient" : "nutritionist");
    nav(user.target);
  }

  return (
    <main className="site-login">
      <div className="site-login-bg" aria-hidden="true">
        <GhostDashboard />
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

        <div className="site-login-copy">
          <h2>Bem-vinda de volta</h2>
          <p>Faca login para acessar sua conta</p>
        </div>

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
                type={show ? "text" : "password"}
                placeholder="Sua senha"
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? "Ocultar senha" : "Mostrar senha"}>
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>

          <div className="site-login-options">
            <label>
              <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <span>Lembrar de mim</span>
            </label>
            <button type="button">Esqueci minha senha</button>
          </div>

          {error && <div className="banner alert">{error}</div>}

          <Button variant="primary" onClick={submit} className="site-login-submit">
            Entrar <span><ArrowRight size={16} /></span>
          </Button>

          <div className="site-login-sep"><span />ou continue com<span /></div>
          <button className="site-google" type="button">
            <b>G</b>
            Continuar com Google
          </button>

          <p className="site-login-hint">
            Nutri: <strong>nutri123@gmail.com</strong> / <strong>nutri123</strong><br />
            Paciente: <strong>mariana@gmail.com</strong> / <strong>teste123</strong>
          </p>
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
