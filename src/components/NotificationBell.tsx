import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { EVENT_META, useEvents, type Audience } from "../lib/events";
import { cx, timeAgo } from "../lib/utils";

export function NotificationBell({ audience, patientId, linkKey, onNavigate }: {
  audience: Audience;
  patientId?: string;
  linkKey: "clinicLink" | "portalLink";
  onNavigate: (path: string) => void;
}) {
  const { events, unread, markRead, markAllRead } = useEvents(audience, patientId);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="iconbtn" onClick={() => setOpen((o) => !o)} aria-label="Notificações">
        <Bell size={16} />
        {unread > 0 && <span className="notif-dot">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-h">
            <span className="h3">Notificações</span>
            {unread > 0 && <button className="btn subtle sm" onClick={markAllRead}>Marcar tudo como lido</button>}
          </div>
          {events.length === 0 ? (
            <div className="faint" style={{ padding: "28px 16px", textAlign: "center", fontSize: 12.5 }}>Nenhuma notificação por aqui ainda.</div>
          ) : (
            events.slice(0, 20).map((e) => {
              const meta = EVENT_META[e.tipo];
              const Icon = meta.icon;
              const link = e[linkKey];
              return (
                <div key={e.id} className={cx("notif-row", !e.lido && "unread")}
                  onClick={() => { markRead(e.id); setOpen(false); if (link) onNavigate(link); }}>
                  <div className="notif-ic"><Icon size={15} color={meta.color} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600 }}>{e.titulo}</div>
                    {e.detalhe && <div className="faint" style={{ fontSize: 11.5, marginTop: 1 }}>{e.detalhe}</div>}
                    <div className="faint num" style={{ fontSize: 10.5, marginTop: 3 }}>{timeAgo(e.ts)}</div>
                  </div>
                  {!e.lido && <span className="notif-unread-pip" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
