/**
 * Soft-tinted background + colored foreground pairs for icon chips.
 *
 * The `-soft` tokens are light-mode only, so each pairs with a dark-mode
 * fallback at 10% opacity of the base colour, which reads correctly on dark
 * surfaces instead of glowing.
 */
export type Tone =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "primary"
  | "muted";

export const toneClass: Record<Tone, string> = {
  info: "bg-info-soft text-info dark:bg-info/10",
  success: "bg-success-soft text-success dark:bg-success/10",
  warning: "bg-warning-soft text-warning dark:bg-warning/10",
  danger: "bg-danger-soft text-danger dark:bg-danger/10",
  primary: "bg-accent text-primary",
  muted: "bg-muted text-muted-foreground",
};
