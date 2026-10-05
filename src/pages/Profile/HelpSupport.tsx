import { useMemo, useState } from "react";
import {
  ChevronDown,
  Mail,
  MessageCircle,
  Phone,
  Search,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import SubpageHeader from "@/components/shared/SubpageHeader";
import SettingsSection from "@/components/shared/SettingsSection";
import SettingsRow from "@/components/shared/SettingsRow";
import EmptyState from "@/components/shared/EmptyState";

const faqs = [
  {
    question: "How do I make a transfer?",
    answer:
      "Open Send money from your dashboard, pick or enter the recipient, enter the amount, review the details, and confirm with your transaction PIN.",
  },
  {
    question: "Why is my transfer still pending?",
    answer:
      "A transfer can stay pending while Ajora or the receiving bank processes it. Check your transactions for the latest status before trying again.",
  },
  {
    question: "How do I change my transaction PIN?",
    answer:
      "Go to Profile → Security → Transaction PIN, then choose Change PIN. You'll verify your current PIN before setting a new one.",
  },
  {
    question: "What should I do if I forgot my PIN?",
    answer:
      "Use Reset PIN from your Transaction PIN settings and verify your password to set a new PIN.",
  },
  {
    question: "How do I change my password?",
    answer:
      "Open Profile → Security → Password and follow the steps to securely set a new password.",
  },
];

function FaqItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="p-4">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="text-sm font-medium">{question}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>
      {open ? (
        <p className="mt-2 text-sm text-muted-foreground">{answer}</p>
      ) : null}
    </div>
  );
}

export default function HelpSupport() {
  const [query, setQuery] = useState("");
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (f) =>
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <SubpageHeader
        eyebrow="SUPPORT"
        heading="Help & support"
        subheading="Find quick answers, or reach the Ajora team directly."
      />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpenIndex(null);
          }}
          placeholder="Search help articles"
          className="pl-9"
        />
      </div>

      {filtered.length > 0 ? (
        <SettingsSection title="Frequently asked">
          {filtered.map((faq) => {
            const realIndex = faqs.indexOf(faq);
            return (
              <FaqItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                open={openIndex === realIndex}
                onToggle={() =>
                  setOpenIndex((cur) =>
                    cur === realIndex ? null : realIndex,
                  )
                }
              />
            );
          })}
        </SettingsSection>
      ) : (
        <EmptyState
          icon={Search}
          heading="No matching articles"
          body="Try different words, or contact support below."
        />
      )}

      <SettingsSection
        title="Contact us"
        description="Support is available every day, 8am–8pm WAT."
      >
        <SettingsRow
          icon={MessageCircle}
          tone="primary"
          label="Chat with support"
          description="Usually replies within a few minutes"
          onClick={() => window.open("https://wa.me/2348000000000", "_blank")}
        />
        <SettingsRow
          icon={Mail}
          tone="info"
          label="Email support"
          description="support@ajora.com"
          onClick={() => {
            window.location.href = "mailto:support@ajora.com";
          }}
        />
        <SettingsRow
          icon={Phone}
          tone="success"
          label="Call us"
          description="0700 000 0000"
          onClick={() => {
            window.location.href = "tel:07000000000";
          }}
        />
      </SettingsSection>
    </div>
  );
}
