import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/utils";

type Variant = "primary" | "ghost" | "subtle";
interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  sm?: boolean;
  children: ReactNode;
}
export function Button({ variant = "ghost", sm, className, children, ...rest }: Props) {
  return (
    <button className={cx("btn", variant, sm && "sm", className)} {...rest}>
      {children}
    </button>
  );
}
export function IconButton({ className, children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cx("iconbtn", className)} {...rest}>{children}</button>;
}
