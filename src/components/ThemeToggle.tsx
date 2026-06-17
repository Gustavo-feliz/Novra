import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button className="iconbtn" onClick={toggle} aria-label="Alternar tema">
      {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
