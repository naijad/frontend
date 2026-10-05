import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CircleHelp,
  LogOut,
  ShieldCheck,
  SlidersHorizontal,
  User,
  Loader2,
} from "lucide-react";

import { apiRequest } from "@/lib/api";
import { logout } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

type MeResponse = {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      fullName?: string | null;
      email: string;
      phone?: string | null;
      verified?: boolean;
    };
  };
};

export default function Profile() {
  const navigate = useNavigate();

  const [user, setUser] = useState<MeResponse["data"]["user"] | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");

        const response = await apiRequest<MeResponse>("/auth/me");

        if (!cancelled) {
          setUser(response.data.user);
        }
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load your profile."
        );
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  const fullName = useMemo(() => {
    if (!user) return "";

    if (user.fullName?.trim()) {
      return user.fullName.trim();
    }

    return [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();
  }, [user]);

  const avatarInitials = useMemo(() => {
    if (!user) return "AJ";

    const firstName = user.firstName?.trim() || "";
    const lastName = user.lastName?.trim() || "";

    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }

    if (fullName) {
      const parts = fullName.split(/\s+/).filter(Boolean);

      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }

      return parts[0].slice(0, 2).toUpperCase();
    }

    return user.email.slice(0, 2).toUpperCase();
  }, [user, fullName]);

  const handleSignOut = async () => {
    try {
      setSigningOut(true);

      await logout();

      navigate("/login", {
        replace: true,
      });
    } catch {
      /*
       * Even if a future logout implementation performs
       * additional cleanup and fails, don't leave the user
       * trapped on the profile screen.
       */
      navigate("/login", {
        replace: true,
      });
    } finally {
      setSigningOut(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-8">
        <div className="flex flex-col items-center text-center">
          <div className="size-20 animate-pulse rounded-full bg-muted" />

          <div className="mt-4 h-7 w-40 animate-pulse rounded bg-muted" />

          <div className="mt-2 h-4 w-52 animate-pulse rounded bg-muted" />

          <div className="mt-4 h-6 w-28 animate-pulse rounded-full bg-muted" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />

          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-28 animate-pulse rounded bg-muted" />

          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        </div>

        <div className="space-y-3">
          <div className="h-5 w-20 animate-pulse rounded bg-muted" />

          <div className="h-16 animate-pulse rounded-2xl bg-muted" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-danger/10">
            <User className="size-7 text-danger" />
          </div>

          <h1 className="mt-4 text-xl font-bold">
            Unable to load your profile
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error || "Your account information could not be loaded."}
          </p>

          <Button
            className="mt-6"
            onClick={() => window.location.reload()}
          >
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      {/* Identity */}
      <div className="flex flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
          {avatarInitials}
        </span>

        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          {fullName || "Ajora User"}
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {user.email}
        </p>

        {user.verified ? (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
            <span className="size-1.5 rounded-full bg-success" />
            Account verified
          </span>
        ) : (
          <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
            <span className="size-1.5 rounded-full bg-warning" />
            Verification pending
          </span>
        )}
      </div>

      {/* Account */}
      <SettingsSection title="Account">
        <SettingsRow
          icon={User}
          tone="primary"
          label="Personal information"
          description="Manage your account details"
          onClick={() => navigate("/profile/personal")}
        />

        <SettingsRow
          icon={ShieldCheck}
          tone="success"
          label="Security"
          description="Password, PIN and account security"
          onClick={() => navigate("/profile/security")}
        />
      </SettingsSection>

      {/* Preferences */}
      <SettingsSection title="Preferences">
        <SettingsRow
          icon={SlidersHorizontal}
          tone="info"
          label="App preferences"
          description="Appearance and app settings"
          onClick={() => navigate("/profile/preferences")}
        />

        <SettingsRow
          icon={Bell}
          tone="warning"
          label="Notifications"
          description="Choose what you hear about and how"
          onClick={() => navigate("/profile/notifications")}
        />
      </SettingsSection>

      {/* Support */}
      <SettingsSection title="Support">
        <SettingsRow
          icon={CircleHelp}
          tone="primary"
          label="Help & support"
          description="Get help with your Ajora account"
          onClick={() => navigate("/profile/help")}
        />
      </SettingsSection>

      {/* Sign out */}
      <div className="space-y-4">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="w-full text-danger transition-all hover:-translate-y-0.5 hover:border-danger hover:bg-danger hover:text-white hover:shadow-md"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Sign out of Ajora?
              </DialogTitle>

              <DialogDescription>
                You&apos;ll need to sign in again with your password to get
                back into your account.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <DialogClose asChild>
                <Button
                  variant="outline"
                  disabled={signingOut}
                >
                  Cancel
                </Button>
              </DialogClose>

              <Button
                className="bg-danger text-white hover:bg-danger/90"
                disabled={signingOut}
                onClick={handleSignOut}
              >
                {signingOut ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogOut className="size-4" />
                )}

                {signingOut ? "Signing out..." : "Sign out"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <p className="text-center text-xs text-muted-foreground">
          Ajora · Version 1.0.0
        </p>
      </div>
    </div>
  );
}