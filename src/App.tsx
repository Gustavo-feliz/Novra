import { Routes, Route, useLocation } from "react-router-dom";
import { Shell } from "./components/Shell";
import { CommandPalette } from "./components/CommandPalette";
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

export default function App() {
  const location = useLocation();
  const isPortal = location.pathname.startsWith("/portal/");

  return (
    <>
      {!isPortal && <CommandPalette />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route element={<Shell />}>
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
        <Route path="/patients/:id" element={<PatientProfile />} />
        <Route path="/consultation/:id" element={<Consultation />} />
        <Route path="*" element={<Dashboard />} />
      </Routes>
    </>
  );
}
