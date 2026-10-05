import type { ReactNode } from "react";
import { CalendarDays, Mail, MapPin, Phone, User } from "lucide-react";

import { user } from "@/lib/mock-data";
import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

const accountLast4 = user.accountNumber.replace(/\s/g, "").slice(-4);

function Value({
  children,
  muted,
}: {
  children: ReactNode;
  muted?: boolean;
}) {
  return (
    <span
      className={
        muted
          ? "text-sm text-muted-foreground"
          : "text-sm font-medium text-foreground"
      }
    >
      {children}
    </span>
  );
}

export default function PersonalInformation() {
  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="ACCOUNT"
        heading="Personal information"
        subheading="Review the personal information associated with your Ajora account."
      />

      <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground">
          {user.avatarInitials}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{user.fullName}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Ajora account holder
          </p>
        </div>
      </div>

      <SettingsSection title="Personal details">
        <SettingsRow
          icon={User}
          tone="primary"
          label="Full name"
          control={<Value>{user.fullName}</Value>}
        />
        <SettingsRow
          icon={Mail}
          tone="info"
          label="Email address"
          control={<Value>{user.email}</Value>}
        />
        <SettingsRow
          icon={Phone}
          tone="success"
          label="Phone number"
          control={<Value>{user.phone}</Value>}
        />
        <SettingsRow
          icon={CalendarDays}
          tone="warning"
          label="Date of birth"
          control={<Value muted>Not provided</Value>}
        />
        <SettingsRow
          icon={MapPin}
          tone="danger"
          label="Address"
          control={<Value muted>Not provided</Value>}
        />
      </SettingsSection>

      <SettingsSection
        title="Account information"
        description="Some personal information may require additional verification before it can be changed."
      >
        <SettingsRow
          label="Account number"
          control={<Value>{`•••• ${accountLast4}`}</Value>}
        />
        <SettingsRow
          label="Account status"
          control={<span className="text-sm font-medium text-success">Active</span>}
        />
        <SettingsRow
          label="Verification"
          control={
            <span className="text-sm font-medium text-success">Verified</span>
          }
        />
      </SettingsSection>
    </div>
  );
}
