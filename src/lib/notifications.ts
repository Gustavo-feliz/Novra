// Lembretes locais do paciente (água, refeições, consulta).
//
// IMPORTANTE: são notificações LOCAIS, não "web push" de servidor. Disparam
// enquanto o app está aberto (ou em segundo plano, via service worker) usando a
// Notification API — sem precisar de backend/VAPID. Push de verdade (com o app
// fechado, empurrado pelo servidor) exige um backend e fica para uma próxima
// fase.

export type ReminderPrefs = {
  enabled: boolean;
  aguaIntervalMin: number; // intervalo entre lembretes de hidratação
  refeicoes: boolean;      // lembretes nos horários de refeição
};

export const DEFAULT_REMINDERS: ReminderPrefs = { enabled: false, aguaIntervalMin: 120, refeicoes: true };
export const REFEICAO_HORARIOS = ["08:00", "12:30", "16:00", "19:30"];

const hasWindow = typeof window !== "undefined";

export function notificationsSupported(): boolean {
  return hasWindow && "Notification" in window;
}

export function notificationPermission(): NotificationPermission | "unsupported" {
  return notificationsSupported() ? Notification.permission : "unsupported";
}

export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!notificationsSupported()) return "unsupported";
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
}

/** Dispara uma notificação local. Prefere o service worker (funciona melhor no
 *  mobile e fora do foco); cai para a Notification direta quando não há SW. */
export async function showLocalNotification(
  title: string,
  opts: { body?: string; url?: string; tag?: string } = {},
): Promise<boolean> {
  if (notificationPermission() !== "granted") return false;
  const options: NotificationOptions = {
    body: opts.body,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: opts.tag,
    data: { url: opts.url ?? "/" },
  };
  try {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(title, options);
      return true;
    }
  } catch { /* cai para Notification direta */ }
  try {
    new Notification(title, options);
    return true;
  } catch {
    return false;
  }
}
