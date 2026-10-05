import { FaApple, FaGoogle } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";

/**
 * "or" divider + Google / Apple buttons shared by the login and signup pages.
 * Hover treatments: Google swaps the mono glyph for the full-colour mark and
 * lifts; Apple fills solid (adapts to the theme).
 */
export default function SocialAuthButtons() {
  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-sm text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="space-y-2">
        <Button
          variant="outline"
          size="lg"
          className="group w-full transition-all hover:-translate-y-0.5 hover:bg-background hover:shadow-md"
        >
          <FaGoogle className="text-muted-foreground group-hover:hidden" />
          <FcGoogle className="hidden group-hover:block" />
          Continue with Google
        </Button>
        <Button
          variant="outline"
          size="lg"
          className="group w-full transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-md"
        >
          <FaApple className="text-muted-foreground transition-colors group-hover:text-foreground" />
          Continue with Apple
        </Button>
      </div>
    </>
  );
}
