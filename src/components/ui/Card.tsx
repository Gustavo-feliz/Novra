import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/utils";

interface Props extends HTMLAttributes<HTMLDivElement> { pad?: boolean; glass?: boolean; children: ReactNode; }
export function Card({ pad, glass, className, children, ...rest }: Props) {
  return <div className={cx(glass ? "glass" : "card", pad && "pad", className)} {...rest}>{children}</div>;
}
