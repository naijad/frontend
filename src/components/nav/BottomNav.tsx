import { Link, useLocation } from "react-router-dom";

import { cn } from "@/lib/utils";
import { navItems, transferItem, type NavItem } from "@/components/nav/nav-items";

/**
 * Mobile chrome: fixed bottom nav with a floating Transfer action in the
 * middle. Hidden at `lg` and up.
 *
 * Order: Home, Transactions, [Transfer FAB], Insights, Profile.
 */
export default function BottomNav() {
  const { pathname } = useLocation();

  const renderFlat = (item: NavItem) => {
    const Icon = item.icon;
    const active =
      pathname === item.to || pathname.startsWith(`${item.to}/`);

    return (
      <Link
        key={item.to}
        to={item.to}
        className="flex flex-1 flex-col items-center justify-center gap-1"
      >
        <Icon
          className={cn(
            "size-5 transition-colors",
            active ? "text-primary" : "text-muted-foreground",
          )}
        />
        <span
          className={cn(
            "text-[10px] font-medium transition-colors",
            active ? "text-primary" : "text-muted-foreground",
          )}
        >
          {item.label}
        </span>
      </Link>
    );
  };

  const [home, transactions, insights, profile] = navItems;
  const TransferIcon = transferItem.icon;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {renderFlat(home)}
        {renderFlat(transactions)}

        <Link
          to={transferItem.to}
          aria-label={transferItem.label}
          className="flex flex-1 items-center justify-center"
        >
          <span className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-brand transition-transform active:scale-95">
            <TransferIcon className="size-5" />
          </span>
        </Link>

        {renderFlat(insights)}
        {renderFlat(profile)}
      </div>
    </nav>
  );
}
