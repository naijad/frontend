import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  FileText,
  Info,
  Moon,
  ShieldCheck,
  Volume2,
} from "lucide-react";

import { useTheme } from "@/context/ThemeContext";
import { Switch } from "@/components/ui/switch";
import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";

export default function AppPreferences() {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [sounds, setSounds] = useState(true);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="APP"
        heading="App preferences"
        subheading="Control how Ajora looks and behaves on this device."
      />

      <SettingsSection title="Appearance">
        <SettingsRow
          icon={Moon}
          tone="primary"
          label="Dark mode"
          description={
            isDark ? "Dark appearance is on" : "Light appearance is on"
          }
          control={
            <Switch
              checked={isDark}
              onCheckedChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="Notifications">
        <SettingsRow
          icon={Bell}
          tone="warning"
          label="Notifications"
          description="Channels, money movement, savings and security alerts"
          onClick={() => navigate("/profile/notifications")}
        />
      </SettingsSection>

      <SettingsSection title="Sounds">
        <SettingsRow
          icon={Volume2}
          tone="info"
          label="Transaction sounds"
          description="Play a sound when money moves in or out"
          control={
            <Switch
              checked={sounds}
              onCheckedChange={setSounds}
              aria-label="Toggle transaction sounds"
            />
          }
        />
      </SettingsSection>

      <SettingsSection title="About Ajora">
        <SettingsRow label="App version" control={<span className="text-sm text-muted-foreground">1.0.0</span>} />
        <SettingsRow
          icon={FileText}
          tone="muted"
          label="Terms of service"
          onClick={() => navigate("/terms")}
        />
        <SettingsRow
          icon={ShieldCheck}
          tone="muted"
          label="Privacy policy"
          onClick={() => navigate("/privacy")}
        />
        <SettingsRow
          icon={Info}
          tone="muted"
          label="Help & support"
          onClick={() => navigate("/profile/help")}
        />
      </SettingsSection>
    </div>
  );
}
