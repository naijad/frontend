import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

type FlowHeroProps = {
  icon: LucideIcon;
  iconColor: "primary" | "success" | "warning" | "danger" | "info";
  title: string;
  description?: string;
  /** Mount animation (spring) on the icon. Default true. */
  animated?: boolean;
  /** Permanently spin the icon (processing state). */
  spin?: boolean;
};

const COLOR: Record<FlowHeroProps["iconColor"], string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-info/10 text-info",
};

export default function FlowHero({
  icon: Icon,
  iconColor,
  title,
  description,
  animated = true,
  spin = false,
}: FlowHeroProps) {
  return (
    <div className="text-center">
      <motion.div
        initial={animated ? { scale: 0.5, opacity: 0 } : false}
        animate={animated ? { scale: 1, opacity: 1 } : undefined}
        transition={{ type: "spring", stiffness: 220, damping: 16 }}
        className={cn(
          "mx-auto flex size-24 items-center justify-center rounded-full",
          COLOR[iconColor],
        )}
      >
        <Icon
          className={cn("size-10", spin && "animate-spin")}
          strokeWidth={1.75}
        />
      </motion.div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h1>
      {description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
    </div>
  );
}
