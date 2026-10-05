import { useEffect, useState } from "react";

export type ThemeColors = {
  primary: string;
  success: string;
  warning: string;
  danger: string;
  info: string;
  accent: string;
  muted: string;
  border: string;
  mutedForeground: string;
  foreground: string;
  background: string;
};

const FALLBACK: ThemeColors = {
  primary: "#6d5ef8",
  success: "#18c47f",
  warning: "#f5a524",
  danger: "#e5484d",
  info: "#3b82f6",
  accent: "#f5f4ff",
  muted: "#f4f4f6",
  border: "#e5e5ea",
  mutedForeground: "#71717f",
  foreground: "#1e1e2f",
  background: "#ffffff",
};

function read(): ThemeColors {
  if (typeof document === "undefined") return FALLBACK;
  const style = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    style.getPropertyValue(name).trim() || fallback;
  return {
    primary: v("--color-ajora", FALLBACK.primary),
    success: v("--color-success", FALLBACK.success),
    warning: v("--color-warning", FALLBACK.warning),
    danger: v("--color-danger", FALLBACK.danger),
    info: v("--color-info", FALLBACK.info),
    accent: v("--accent", FALLBACK.accent),
    muted: v("--muted", FALLBACK.muted),
    border: v("--border", FALLBACK.border),
    mutedForeground: v("--muted-foreground", FALLBACK.mutedForeground),
    foreground: v("--foreground", FALLBACK.foreground),
    background: v("--background", FALLBACK.background),
  };
}

/**
 * Design-token colours for charts. Re-reads whenever the `.dark` class on
 * <html> flips, so recharts stays in sync with light/dark mode.
 */
export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState<ThemeColors>(read);

  useEffect(() => {
    const observer = new MutationObserver(() => setColors(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return colors;
}
