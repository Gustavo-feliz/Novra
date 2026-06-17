import type { CSSProperties } from "react";
import { cx } from "../../lib/utils";

interface Props<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  full?: boolean;
  style?: CSSProperties;
}
export function Segmented<T extends string>({ options, value, onChange, full, style }: Props<T>) {
  return (
    <div className="seg" style={{ ...(full ? { width: "100%" } : {}), ...style }}>
      {options.map((o) => (
        <button key={o.value} className={cx(value === o.value && "on")} style={full ? { flex: 1 } : undefined} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
