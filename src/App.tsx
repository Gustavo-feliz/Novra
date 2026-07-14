import { lazy, Suspense, useEffect, useState, type ReactElement } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CommandPalette } from "./components/CommandPalette";
import { getRole, isAuthenticated, isAuthReady, onAuthChange, waitForAuth } from "./lib/auth";
import { PORTAL_ACCESS } from "./lib/mock";

const Login        = lazy(() => import("./pages/Login"));
const Cadastro     = lazy(() => import("./pages/Cadastro"));
const Convite      = lazy(() => import("./pages/Convite"));
const Onboarding   = lazy(() => import("./pages/Onboarding"));
const Dashboard    = lazy(() => import("./pages/Dashboard"));
const Patients     = lazy(() => import("./pages/Patients"));
const Diaries      = lazy(() => import("./pages/Diaries"));
const Questionnaires = lazy(() => import("./pages/Questionnaires"));
const Financial    = lazy(() => import("./pages/Financial"));
const Favorites    = lazy(() => import("./pages/Favorites"));
const VideoCall    = lazy(() => import("./pages/VideoCall"));
const Slides       = lazy(() => import("./pages/Slides"));
const Agenda       = lazy(() => import("./pages/Agenda"));
const BookingLink  = lazy(() => import("./pages/BookingLink"));
const Creator      = lazy(() => import("./pages/Creator"));
const WhatsApp     = lazy(() => import("./pages/WhatsApp"));
const Settings     = lazy(() => import("./pages/Settings"));
const Consultation = lazy(() => import("./pages/Consultation"));
const PatientProfile = lazy(() => import("./pages/PatientProfile"));
const Portal       = lazy(() => import("./pages/Portal"));
const Booking      = lazy(() => import("./pages/Booking"));

function PageFallback() {
  return <div style={{ minHeight: "60vh" }} aria-busy="true" aria-label="Carregando..." />;
}

/** Espelha a sessão do Supabase Auth de forma reativa para os guards de rota. */
function useAuthState() {
  const [state, setState] = useState(() => ({ ready: isAuthReady(), authed: isAuthenticated(), role: getRole() }));

  useEffect(() => {
    const update = () => setState({ ready: isAuthReady(), authed: isAuthenticated(), role: getRole() });
    if (!isAuthReady()) waitForAuth().then(update);
    return onAuthChange(update);
  }, []);

  return state;
}

/** Protege a área da clínica. Sem sessão → vai para o login guardando o destino
 *  pretendido (deep-link). Sessão de paciente → manda para o portal dele, pois
 *  não deve enxergar a área da nutricionista. */
function RequireClinic({ children }: { children: ReactElement }) {
  const location = useLocation();
  const { ready, authed, role } = useAuthState();

  if (!ready) return null;

  if (!authed) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }
  if (role === "patient") {
    return <Navigate to={`/portal/${PORTAL_ACCESS.slug}`} replace />;
  }
  return children;
}

export default function App() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/portal/");

  return (
    <>
      {!isPortal && <CommandPalette />}
      <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/convite" element={<Convite />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<RequireClinic><Shell /></RequireClinic>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patients" element={<Patients />} />
          <Route path="/diarios" element={<Diaries />} />
          <Route path="/questionarios" element={<Questionnaires />} />
          <Route path="/financeiro" element={<Financial />} />
          <Route path="/favoritos" element={<Favorites />} />
          <Route path="/videochamada" element={<VideoCall />} />
          <Route path="/laminas" element={<Slides />} />
          <Route path="/agenda" element={<Agenda />} />
          <Route path="/agendamento" element={<BookingLink />} />
          <Route path="/creator" element={<Creator />} />
          <Route path="/whatsapp" element={<WhatsApp />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
        <Route path="/portal/:slug/*" element={<Portal />} />
        <Route path="/agendar/:slug" element={<Booking />} />
        <Route path="/patients/:id" element={<RequireClinic><PatientProfile /></RequireClinic>} />
        <Route path="/consultation/:id" element={<RequireClinic><Consultation /></RequireClinic>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  );
}
