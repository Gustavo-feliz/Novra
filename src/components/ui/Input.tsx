import type { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";
import { cx } from "../../lib/utils";

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="field"><label>{label}</label>{children}</div>;
}
export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx("input", className)} {...rest} />;
}
export function Textarea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cx("input", className)} {...rest} />;
}
export function Select({ className, children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return <select className={cx("select", className)} {...rest}>{children}</select>;
}
