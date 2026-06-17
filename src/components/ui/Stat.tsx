import type { ReactNode } from "react";
import { cx } from "../../lib/utils";
import { ArrowDown, ArrowUp } from "lucide-react";

export function Delta({ v, invert }: { v: number; invert?: boolean }) {
  const up = v > 0, flat = v === 0;
  const good = invert ? v < 0 : v > 0;
  const cls = flat ? "flat" : good ? "up" : "down";
  return (
    <span className={cx("delta", cls)}>
      {!flat && (up ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
      <span className="num">{up ? "+" : ""}{v}%</span>
    </span>
  );
}
export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="card pad" style={{ flex: 1, minWidth: 130 }}>
      <div className="faint" style={{ fontSize: 11.5 }}>{label}</div>
      <div className="num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ marginTop: 6 }}>{sub}</div>}
    </div>
  );
}
