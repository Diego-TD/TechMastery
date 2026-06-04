import type { DeviceKind, LifeArea } from "@shared/enums";
import type { Importance } from "@/lib/inventory/types";
import type { GraphEdgeKind } from "@/lib/inventory/derive";
import {
  AtSign,
  Banknote,
  Cloud,
  Gamepad2,
  GraduationCap,
  HardDrive,
  HelpCircle,
  Landmark,
  Laptop,
  LifeBuoy,
  Mail,
  Monitor,
  ShoppingBag,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";

export const LIFE_AREA_ICON: Record<LifeArea, LucideIcon> = {
  school_work: GraduationCap,
  email: Mail,
  phone: Smartphone,
  banking: Landmark,
  cloud: Cloud,
  social: AtSign,
  gaming: Gamepad2,
  shopping: ShoppingBag,
  government_health: Banknote,
  unknown: HelpCircle,
};

export const DEVICE_ICON: Record<DeviceKind, LucideIcon> = {
  phone: Smartphone,
  laptop: Laptop,
  desktop: Monitor,
  tablet: Tablet,
  other: HardDrive,
};

export const RECOVERY_ICON: LucideIcon = LifeBuoy;

/**
 * Importance badge variants. Deliberately NOT red — "critical" means *valuable*,
 * not *in danger*. Red is reserved for actual risk indicators so a secure-but-
 * important account doesn't look alarming.
 */
export const IMPORTANCE_BADGE: Record<Importance, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export type Severity = "blocked" | "at_risk" | "ok";

/** Foreground + soft background classes for a severity, used across sim + readiness. */
export const SEVERITY_CLASS: Record<Severity, string> = {
  blocked: "text-destructive bg-destructive/10 border-destructive/30",
  at_risk: "text-amber-600 bg-amber-500/10 border-amber-500/30 dark:text-amber-400",
  ok: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30 dark:text-emerald-400",
};

/**
 * Edge colors on the map. Concrete colors (not CSS vars) so the SVG arrow
 * markers render correctly; these read fine in both light and dark themes.
 */
export const EDGE_STYLE: Record<GraphEdgeKind, { stroke: string; dashed: boolean }> = {
  runs_on: { stroke: "#94a3b8", dashed: false },
  recovers: { stroke: "#10b981", dashed: true },
  depends_on: { stroke: "#f59e0b", dashed: false },
};

export const EDGE_KINDS = ["runs_on", "recovers", "depends_on"] as const;

/** Score → readiness level key (maps to `readiness.<level>` copy). */
export function readinessLevel(score: number): "notReady" | "inProgress" | "ready" | "mastered" {
  if (score < 40) return "notReady";
  if (score < 65) return "inProgress";
  if (score < 85) return "ready";
  return "mastered";
}

export function scoreColor(score: number): string {
  if (score < 40) return "text-destructive";
  if (score < 65) return "text-amber-600 dark:text-amber-400";
  return "text-emerald-600 dark:text-emerald-400";
}
