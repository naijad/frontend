import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Send, WifiOff } from "lucide-react";

import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { navItems } from "@/components/nav/nav-items";

type DashboardResponse = {
  success: boolean;
  message?: string;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
    account: {
      accountNumber: string;
      balance: string;
      currency: string;
    } | null;
    recentTransactions: unknown[];
  };
};

type SidebarUser = {
  firstName: string;
  lastName: string;
  email: string;
};

function getInitials(firstName: string, lastName: string) {
  const first = firstName.trim().charAt(0);
  const last = lastName.trim().charAt(0);

  return `${first}${last}`.toUpperCase();
}

/**
 * Desktop chrome: a fixed left rail. Hidden below `lg`, where the mobile
 * top bar + bottom nav take over.
 */
export default function Sidebar() {
  const { pathname } = useLocation();

  const [user, setUser] = useState<SidebarUser | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const response =
          await apiRequest<DashboardResponse>("/dashboard");

        if (!mounted) return;

        const currentUser = response.data?.user;

        if (!currentUser) {
          return;
        }

        setUser({
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
        });
      } catch (error) {
        console.error(
          "Unable to load sidebar user:",
          error,
        );
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  const displayName = useMemo(() => {
    if (!user) {
      return "User";
    }

    return `${user.firstName} ${user.lastName}`.trim();
  }, [user]);

  const initials = useMemo(() => {
    if (!user) {
      return "U";
    }

    return getInitials(
      user.firstName,
      user.lastName,
    );
  }, [user]);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-background lg:flex">
      <Link
        to="/"
        className="flex items-center gap-2.5 p-6"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-lg font-black text-primary-foreground dark:bg-primary">
          A
        </span>

        <span className="text-xl font-bold tracking-tight">
          ajora
        </span>
      </Link>

      <div className="px-4 pb-4">
        <Button
          asChild
          size="lg"
          className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link to="/transfer">
            <Send className="size-4" />
            Send money
          </Link>
        </Button>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          const active =
            pathname === item.to ||
            pathname.startsWith(`${item.to}/`);

          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-5" />

              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="mx-4 mb-4 rounded-lg bg-accent p-3">
          <div className="flex gap-2 text-accent-foreground">
            <WifiOff className="mt-0.5 size-4 shrink-0" />

            <p className="text-xs leading-snug">
              Dial{" "}
              <span className="font-semibold">
                *347*AJORA#
              </span>{" "}
              when offline.
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="flex items-center gap-3 border-t border-border p-4 transition-colors hover:bg-muted"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
            {initials}
          </span>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {displayName}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {user?.email ?? ""}
            </p>
          </div>
        </Link>
      </div>
    </aside>
  );
}