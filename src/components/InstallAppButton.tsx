import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "./ui";
import { useToast } from "./ui/Toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredEvent: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredEvent = e as BeforeInstallPromptEvent;
    listeners.forEach((fn) => fn());
  });
  window.addEventListener("appinstalled", () => {
    deferredEvent = null;
    listeners.forEach((fn) => fn());
  });
}

/** Botão de "Instalar app" (PWA). Só aparece quando o navegador sinaliza que
 *  a instalação está disponível (Chrome/Edge/Android) — em navegadores sem
 *  suporte (ex: Safari iOS) o botão simplesmente não é renderizado. */
export function InstallAppButton({ sm }: { sm?: boolean }) {
  const toast = useToast();
  const [available, setAvailable] = useState(!!deferredEvent);

  useEffect(() => {
    const update = () => setAvailable(!!deferredEvent);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  if (!available) return null;

  async function install() {
    if (!deferredEvent) return;
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    deferredEvent = null;
    setAvailable(false);
    toast(outcome === "accepted" ? "App instalado" : "Instalação cancelada");
  }

  return (
    <Button variant="ghost" sm={sm} onClick={install}>
      <Download size={sm ? 13 : 15} />Instalar app
    </Button>
  );
}
