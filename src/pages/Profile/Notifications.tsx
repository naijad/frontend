import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  KeyRound,
  Mail,
  MessageSquare,
  ShieldAlert,
  Smartphone,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

import { user, savingsGoal } from "@/lib/mock-data";
import { Switch } from "@/components/ui/switch";
import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

function AlwaysOn() {
  return (
    <span className="rounded-full bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
      Always on
    </span>
  );
}

export default function Notifications() {
  const [push, setPush] = useState(true);
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);
  const [moneyReceived, setMoneyReceived] = useState(true);
  const [moneySent, setMoneySent] = useState(true);
  const [billPayments, setBillPayments] = useState(true);
  const [goalProgress, setGoalProgress] = useState(true);
  const [milestone, setMilestone] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="ACCOUNT"
        heading="Notifications"
        subheading="Choose what you hear about and how."
      />

      <SettingsSection
        title="Channels"
        description="Where notifications reach you."
      >
        <SettingsRow
          icon={Bell}
          tone="primary"
          label="Push notifications"
          description="In-app and browser notifications"
          control={
            <Switch
              checked={push}
              onCheckedChange={setPush}
              aria-label="Toggle push notifications"
            />
          }
        />
        <SettingsRow
          icon={Mail}
          tone="info"
          label="Email"
          description={user.email}
          control={
            <Switch
              checked={email}
              onCheckedChange={setEmail}
              aria-label="Toggle email notifications"
            />
          }
          footer={
            <Link
              to="/profile/personal"
              className="text-primary hover:underline"
            >
              Change email
            </Link>
          }
        />
        <SettingsRow
          icon={MessageSquare}
          tone="success"
          label="SMS"
          description={`${user.phone} · Standard rates apply`}
          control={
            <Switch
              checked={sms}
              onCheckedChange={setSms}
              aria-label="Toggle SMS notifications"
            />
          }
          footer={
            sms
              ? "Your carrier's standard messaging rates may apply."
              : undefined
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Money movement"
        description="What triggers a notification."
      >
        <SettingsRow
          icon={ArrowDownLeft}
          tone="success"
          label="Money received"
          description="When someone sends you money"
          control={
            <Switch
              checked={moneyReceived}
              onCheckedChange={setMoneyReceived}
              aria-label="Toggle money received notifications"
            />
          }
        />
        <SettingsRow
          icon={ArrowUpRight}
          tone="primary"
          label="Money sent"
          description="When you send money to someone"
          control={
            <Switch
              checked={moneySent}
              onCheckedChange={setMoneySent}
              aria-label="Toggle money sent notifications"
            />
          }
        />
        <SettingsRow
          icon={Zap}
          tone="warning"
          label="Bill payments"
          description="When you pay a bill (airtime, data, electricity)"
          control={
            <Switch
              checked={billPayments}
              onCheckedChange={setBillPayments}
              aria-label="Toggle bill payment notifications"
            />
          }
        />
        <SettingsRow
          icon={AlertCircle}
          tone="danger"
          label="Failed transactions"
          description="When a transaction doesn't go through"
          control={<AlwaysOn />}
        />
      </SettingsSection>

      {savingsGoal ? (
        <SettingsSection title="Savings & goals">
          <SettingsRow
            icon={Target}
            tone="primary"
            label="Goal progress updates"
            description="Weekly progress on your savings goals"
            control={
              <Switch
                checked={goalProgress}
                onCheckedChange={setGoalProgress}
                aria-label="Toggle goal progress notifications"
              />
            }
          />
          <SettingsRow
            icon={Trophy}
            tone="success"
            label="Milestone reached"
            description="When you hit 25%, 50%, 75%, or 100% of a goal"
            control={
              <Switch
                checked={milestone}
                onCheckedChange={setMilestone}
                aria-label="Toggle milestone notifications"
              />
            }
          />
        </SettingsSection>
      ) : null}

      <SettingsSection
        title="Account & security"
        description="These stay on to keep your account safe."
      >
        <SettingsRow
          icon={Smartphone}
          tone="info"
          label="New login alert"
          description="When someone signs in from a new device"
          control={<AlwaysOn />}
        />
        <SettingsRow
          icon={KeyRound}
          tone="warning"
          label="Password or PIN changed"
          description="Confirmation when security settings change"
          control={<AlwaysOn />}
        />
        <SettingsRow
          icon={ShieldAlert}
          tone="danger"
          label="Suspicious activity"
          description="Unusual sign-in attempts or transactions"
          control={<AlwaysOn />}
        />
      </SettingsSection>
    </div>
  );
}
