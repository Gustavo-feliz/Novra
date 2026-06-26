import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart3, ClipboardList, ShieldCheck, Users } from "lucide-react";

const FEATURES = [
  { icon: Users, title: "Gestão completa de pacientes", desc: "Histórico, evolução e acompanhamento em um só lugar." },
  { icon: ClipboardList, title: "Planos alimentares personalizados", desc: "Crie, ajuste e compartilhe planos com praticidade." },
  { icon: BarChart3, title: "Resultados que geram impacto", desc: "Acompanhe métricas, adesão e evolução com clareza." },
  { icon: ShieldCheck, title: "Segurança e privacidade", desc: "Seus dados e os dos seus pacientes protegidos com tecnologia de ponta." },
] as const;

export function NovraMark() {
  return (
    <svg className="auth-logo-mark" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M9 31V9l16.5 16.2c.4.4 1.1.1 1.1-.5V9" stroke="url(#novra-g)" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M27 13c3.8 1 6.4 4.3 6.4 8.3 0 .9-.1 1.7-.4 2.5-2-1-4.4-3.2-5.4-6.2-.4-1.4-.6-3-.6-4.6Z" fill="url(#novra-g)" />
      <defs>
        <linearGradient id="novra-g" x1="9" y1="9" x2="34" y2="33" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9DE3AE" />
          <stop offset="1" stopColor="#3FA46A" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function AuthAside() {
  return (
    <aside className="auth-aside">
      <div className="auth-aside-bg" aria-hidden="true">
        <svg className="auth-aside-botanic" viewBox="0 0 220 420" fill="none" preserveAspectRatio="xMinYMax slice">
          <path d="M70 420c0-120 6-210 -8-300" stroke="rgba(255,255,255,.10)" strokeWidth="2" strokeLinecap="round" />
          {[40, 95, 150, 205, 260].map((y, i) => (
            <g key={y} opacity={0.12 - i * 0.012}>
              <path d={`M62 ${y} C30 ${y - 22} 14 ${y - 6} 6 ${y + 14} C42 ${y + 12} 56 ${y - 2} 62 ${y}Z`} fill="#fff" />
              <path d={`M62 ${y - 8} C92 ${y - 32} 112 ${y - 18} 122 ${y + 2} C86 ${y + 2} 70 ${y - 6} 62 ${y - 8}Z`} fill="#fff" />
            </g>
          ))}
        </svg>
      </div>

      <div className="auth-aside-inner">
        <Link to="/login" className="auth-logo"><NovraMark /><span>novra</span></Link>

        <motion.h1
          className="auth-headline"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
        >
          Tecnologia que organiza. Você que <em>transforma.</em> <span className="auth-leaf">🌿</span>
        </motion.h1>

        <div className="auth-rule" />

        <p className="auth-lede">
          O Novra é a plataforma completa para nutricionistas que buscam eficiência na gestão de
          pacientes e mais tempo para o que realmente importa: cuidar.
        </p>

        <ul className="auth-features">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <motion.li
              key={title}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: .4, delay: .12 + i * 0.08 }}
            >
              <span className="auth-feature-ic"><Icon size={19} /></span>
              <div>
                <strong>{title}</strong>
                <small>{desc}</small>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
