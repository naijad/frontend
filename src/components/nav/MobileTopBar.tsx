import { Link } from "react-router-dom";
import { Bell } from "lucide-react";

/**
 * Mobile chrome: a minimal fixed top bar. Hidden at `lg` and up, where the
 * sidebar carries the branding.
 */
export default function MobileTopBar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background px-4 lg:hidden">
      <Link to="/dashboard" className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-900 text-sm font-black text-primary-foreground dark:bg-primary">
          A
        </span>
        <span className="text-lg font-bold tracking-tight">ajora</span>
      </Link>

      <button
        type="button"
        aria-label="Notifications"
        className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Bell className="size-5" />
      </button>
    </header>
  );
}
