import type { CSSProperties } from "react";
export function Skeleton({ w, h = 14, r = 8, style }: { w?: number | string; h?: number; r?: number; style?: CSSProperties }) {
  return <div className="skel" style={{ width: w ?? "100%", height: h, borderRadius: r, ...style }} />;
}
