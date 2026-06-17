import type { ReactNode, CSSProperties } from "react";
import { cx } from "../../lib/utils";

type Tone = "" | "sage" | "terra" | "amber" | "blue" | "red";
export function Chip({ tone = "", children, style, className }: { tone?: Tone; children: ReactNode; style?: CSSProperties; className?: string }) {
  return <span className={cx("chip", tone, className)} style={style}>{children}</span>;
}
