import { useNavigate } from "react-router-dom";
import { KeyRound, Lock, ShieldCheck } from "lucide-react";

import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

const tips = [
  "Never share your password or transaction PIN with anyone.",
  "Use a PIN that is difficult for others to guess.",
  "Contact Ajora support if you notice suspicious activity.",
];

export default function Security() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="ACCOUNT"
        heading="Security"
        subheading="Manage your password, transaction PIN, and other security settings."
      />

      <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <ShieldCheck className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">Your account is protected</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Keep your security details private and up to date.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          Secure
        </span>
      </div>

      <SettingsSection title="Security controls">
        <SettingsRow
          icon={Lock}
          tone="primary"
          label="Transaction PIN"
          description="Manage the PIN used to authorize transactions"
          onClick={() => navigate("/transaction-pin")}
        />
        <SettingsRow
          icon={KeyRound}
          tone="warning"
          label="Password"
          description="Change your account login password"
          onClick={() => navigate("/profile/security/password")}
        />
      </SettingsSection>

      <div className="rounded-xl border border-border bg-background p-5">
        <p className="text-sm font-semibold">Keep your account safe</p>
        <ul className="mt-4 space-y-3">
          {tips.map((tip) => (
            <li key={tip} className="flex gap-3 text-sm text-muted-foreground">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
