import type { Config } from "tailwindcss";

const rgb = (v: string) => `rgb(var(${v}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: rgb("--c-bg"),
        surface: rgb("--c-surface"),
        surface2: rgb("--c-surface2"),
        line: rgb("--c-line"),
        text: rgb("--c-text"),
        muted: rgb("--c-muted"),
        faint: rgb("--c-faint"),
        sage: { DEFAULT: rgb("--c-sage"), strong: rgb("--c-sage-strong") },
        terra: rgb("--c-terra"),
        amber: rgb("--c-amber"),
        blue: rgb("--c-blue"),
        danger: rgb("--c-red"),
        success: rgb("--c-green"),
      },
      fontFamily: {
        sans: ["General Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        mono: ["Geist Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: { xl2: "16px", xl3: "20px" },
      boxShadow: {
        card: "var(--shadow)",
        lg2: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
} satisfies Config;
