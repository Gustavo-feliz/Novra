import { cx } from "../../lib/utils";
export function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return <div className={cx("toggle", on && "on")} onClick={onClick} role="switch" aria-checked={on}><span /></div>;
}
