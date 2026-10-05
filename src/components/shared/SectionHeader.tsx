import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface SectionHeaderProps {
  title: string;
  /** Right-side "See all" style link. */
  action?: { label: string; to: string };
}

export default function SectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-base font-semibold">{title}</h2>
      {action ? (
        <Link
          to={action.to}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary transition-colors hover:underline"
        >
          {action.label}
          <ArrowRight className="size-4" />
        </Link>
      ) : null}
    </div>
  );
}
