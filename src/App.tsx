import { useEffect, useState, type ReactElement } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CommandPalette } from "./components/CommandPalette";
import { getRole, isAuthenticated, isAuthReady, onAuthChange, waitForAuth } from "./lib/auth";
import { PORTAL_ACCESS } from "./lib/mock";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Diaries from "./pages/Diaries";
import Questionnaires from "./pages/Questionnaires";
import Financial from "./pages/Financial";
import Favorites from "./pages/Favorites";
import VideoCall from "./pages/VideoCall";
import Slides from "./pages/Slides";
import Agenda from "./pages/Agenda";
import BookingLink from "./pages/BookingLink";
import Creator from "./pages/Creator";
import WhatsApp from "./pages/WhatsApp";
import Settings from "./pages/Settings";
import Consultation from "./pages/Consultation";
import PatientProfile from "./pages/PatientProfile";
import Portal from "./pages/Portal";

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
      <Routes>
        <Route path="/login" element={<Login />} />
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
        <Route path="/patients/:id" element={<RequireClinic><PatientProfile /></RequireClinic>} />
        <Route path="/consultation/:id" element={<RequireClinic><Consultation /></RequireClinic>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
