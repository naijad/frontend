import { useNavigate } from "react-router-dom";
import { Compass } from "lucide-react";

import FlowShell from "@/components/shared/FlowShell";
import EmptyState from "@/components/shared/EmptyState";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <FlowShell showBrand>
      <EmptyState
        icon={Compass}
        heading="Page not found"
        body="That link doesn't lead anywhere yet — it may have moved, or the feature is still on the way."
        action={{ label: "Go to homepage", onClick: () => navigate("/") }}
      />
    </FlowShell>
  );
}
