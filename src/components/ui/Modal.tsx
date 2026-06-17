import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({ title, sub, onClose, children, footer, max }: {
  title: string; sub?: string; onClose: () => void; children: ReactNode; footer?: ReactNode; max?: number;
}) {
  return (
    <div className="overlay" onMouseDown={onClose}>
      <div className="modal" style={max ? { maxWidth: max } : undefined} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-h">
          <div><div className="h2">{title}</div>{sub && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{sub}</div>}</div>
          <button className="iconbtn" onClick={onClose}><X size={17} /></button>
        </div>
        <div className="modal-b">{children}</div>
        {footer && <div className="modal-f">{footer}</div>}
      </div>
    </div>
  );
}
