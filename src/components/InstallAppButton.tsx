import { useState } from "react";
import { Download, Share, MoreVertical } from "lucide-react";
import { Button, Modal } from "./ui";
import { useToast } from "./ui/Toast";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

let deferredEvent: BeforeInstallPromptEvent | null = null;

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredEvent = e as BeforeInstallPromptEvent;
  });
  window.addEventListener("appinstalled", () => {
    deferredEvent = null;
  });
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia?.("(display-mode: standalone)").matches
    || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIOS() {
  return typeof navigator !== "undefined" && /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Botão de "Instalar app" (PWA). Quando o navegador sinaliza que a instalação
 *  nativa está disponível, dispara o prompt direto; caso contrário (ex: Safari
 *  iOS, ou Chrome antes de atender aos critérios), mostra o passo a passo manual. */
export function InstallAppButton({ sm }: { sm?: boolean }) {
  const toast = useToast();
  const [helpOpen, setHelpOpen] = useState(false);

  if (isStandalone()) return null;

  async function install() {
    if (!deferredEvent) { setHelpOpen(true); return; }
    await deferredEvent.prompt();
    const { outcome } = await deferredEvent.userChoice;
    deferredEvent = null;
    toast(outcome === "accepted" ? "App instalado" : "Instalação cancelada");
  }

  return (
    <>
      <Button variant="ghost" sm={sm} onClick={install} title="Instalar app" aria-label="Instalar app">
        <Download size={sm ? 13 : 15} /><span className="iab-label">Instalar app</span>
      </Button>

      {helpOpen && (
        <Modal title="Instalar o app" sub="Adicione o Novra à tela inicial do seu celular." onClose={() => setHelpOpen(false)} max={420}>
          {isIOS() ? (
            <ol className="install-steps">
              <li><Share size={15} /> Toque no ícone de <strong>Compartilhar</strong> na barra do Safari.</li>
              <li>Escolha <strong>"Adicionar à Tela de Início"</strong>.</li>
              <li>Toque em <strong>Adicionar</strong> no canto superior direito.</li>
            </ol>
          ) : (
            <ol className="install-steps">
              <li><MoreVertical size={15} /> Toque no menu <strong>⋮</strong> do navegador.</li>
              <li>Escolha <strong>"Instalar app"</strong> ou <strong>"Adicionar à tela inicial"</strong>.</li>
              <li>Confirme em <strong>Instalar</strong>.</li>
            </ol>
          )}
        </Modal>
      )}
    </>
  );
}
