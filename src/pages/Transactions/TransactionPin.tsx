import { useNavigate } from "react-router-dom";
import { Info, KeyRound, Lock, ShieldCheck } from "lucide-react";

import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

export default function TransactionPin() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="SECURITY"
        heading="Transaction PIN"
        subheading="Manage the 4-digit PIN you use to authorize transfers and other sensitive transactions."
        backTo="/profile/security"
      />

      {/* Status card */}
      <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
          <ShieldCheck className="size-6" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">PIN is active</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Your PIN protects sensitive transactions.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
          Active
        </span>
      </div>

      <SettingsSection title="Manage">
        <SettingsRow
          icon={Lock}
          tone="primary"
          label="Change PIN"
          description="Change to a new PIN using your current one"
          onClick={() => navigate("/transaction-pin/change")}
        />
        <SettingsRow
          icon={KeyRound}
          tone="warning"
          label="Reset PIN"
          description="Set a new PIN using your account password"
          onClick={() => navigate("/transaction-pin/reset")}
        />
      </SettingsSection>

      <div className="flex gap-3 rounded-xl border border-info/20 bg-info/5 p-4">
        <Info className="size-5 shrink-0 text-info" />
        <p className="text-sm text-muted-foreground">
          Ajora will never ask you for your transaction PIN. Never share it with
          anyone — not even our support team.
        </p>
      </div>
    </div>
  );
}
