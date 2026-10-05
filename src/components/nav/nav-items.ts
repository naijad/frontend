import { BarChart3, Home, Send, User, Wallet } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Shared nav destinations used by both the desktop sidebar and the mobile
 * bottom nav. Transfer is kept separate — it's a promoted primary action
 * (CTA button in the sidebar, floating action button in the bottom nav),
 * not a plain nav row.
 */
export const navItems: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Transactions", to: "/transactions", icon: Wallet },
  { label: "Insights", to: "/analytics", icon: BarChart3 },
  { label: "Profile", to: "/profile", icon: User },
];

export const transferItem: NavItem = {
  label: "Transfer",
  to: "/transfer",
  icon: Send,
};
