import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SubpageHeaderProps {
  /** Small coloured label above the heading, e.g. "ACCOUNT". */
  eyebrow: string;
  heading: string;
  subheading: string;
  /** Where the back button goes. Default "/profile". */
  backTo?: string;
}

/**
 * Shared header for `/profile/*` subpages — back button, eyebrow, big heading,
 * subheading. Keeps every settings subpage feeling like one section.
 */
export default function SubpageHeader({
  eyebrow,
  heading,
  subheading,
  backTo = "/profile",
}: SubpageHeaderProps) {
  const navigate = useNavigate();

  return (
    <div>
      <Button
        variant="ghost"
        size="sm"
        className="-ml-2 mb-6"
        onClick={() => navigate(backTo)}
      >
        <ChevronLeft className="size-4" />
        <span className="hidden sm:inline">Back to Profile</span>
        <span className="sr-only sm:hidden">Back to Profile</span>
      </Button>

      <p className="text-xs font-semibold uppercase tracking-wider text-primary">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        {subheading}
      </p>
    </div>
  );
}
