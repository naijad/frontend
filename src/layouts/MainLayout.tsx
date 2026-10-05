import { useEffect, useState, type ReactNode } from "react";

import { hydrateSession } from "@/lib/auth";

import Sidebar from "@/components/nav/Sidebar";
import MobileTopBar from "@/components/nav/MobileTopBar";
import BottomNav from "@/components/nav/BottomNav";

type MainLayoutProps = {
  children: ReactNode;
};

/**
 * Authenticated app shell. Two layouts, one breakpoint (`lg` / 1024px):
 *
 * - below `lg`: full-viewport content, fixed mobile top bar + bottom nav.
 * - `lg` and up: fixed left sidebar, content fills the rest.
 *
 * The `app-shell` class opts these routes out of the global 430px mobile
 * frame (see `.landing-layout:has(.app-shell)` in index.css).
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const [, setSessionVersion] = useState(0);

  useEffect(() => {
    void hydrateSession().then(() => setSessionVersion((v) => v + 1));
  }, []);

  return (
    <div className="app-shell min-h-screen w-full bg-background text-foreground">
      <Sidebar />
      <MobileTopBar />

      <main className="min-h-screen pb-20 pt-14 lg:pb-0 lg:pl-64 lg:pt-0">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
