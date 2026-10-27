import {
  BarChart3,
  FileText,
  Home,
  Send,
  User,
  Wallet,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

export interface NavItem {
  label: string;
  to: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
}

/**
 * Shared navigation destinations used by the desktop sidebar and mobile
 * bottom navigation.
 *
 * The first four entries must remain in this order because BottomNav uses
 * their positions for Home, Transactions, Insights and Profile.
 *
 * Transfer remains separate as a promoted primary action.
 */
export const navItems: NavItem[] = [
  { label: "Home", to: "/dashboard", icon: Home },
  { label: "Transactions", to: "/transactions", icon: Wallet },
  { label: "Insights", to: "/analytics", icon: BarChart3 },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Bills", to: "/bills", icon: FileText },
];

export const transferItem: NavItem = {
  label: "Transfer",
  to: "/transfer",
  icon: Send,
};