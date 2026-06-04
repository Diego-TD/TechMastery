import { Handle, Position, type NodeProps } from "@xyflow/react";
import { AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type MapNodeData = {
  kind: "account" | "device" | "recovery" | "authenticator" | "phone";
  label: string;
  sublabel?: string;
  iconName: string;
  /** Shows a warning dot (e.g. no 2FA / no recovery). */
  risk?: boolean;
  /** Icon resolved at build time and passed down (keeps node dumb). */
  Icon: LucideIcon;
};

const TONE: Record<MapNodeData["kind"], string> = {
  account: "bg-card border-border",
  device: "bg-muted/60 border-border",
  recovery: "bg-primary/5 border-primary/30",
  authenticator: "bg-amber-500/5 border-amber-500/30",
  phone: "bg-primary/5 border-primary/30",
};

/**
 * One presentational node for every kind on the map. Account nodes are the only
 * clickable ones (handled by ReactFlow's onNodeClick); devices/recovery anchors
 * are context.
 */
export function MapNode({ data }: NodeProps) {
  const d = data as MapNodeData;
  const { Icon } = d;
  return (
    <div
      className={cn(
        "relative flex h-16 w-[190px] items-center gap-2.5 rounded-lg border px-3 shadow-sm",
        TONE[d.kind],
        d.kind === "account" && "cursor-pointer hover:border-primary/60",
      )}
    >
      <Handle type="target" position={Position.Top} className="!opacity-0" />
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-md",
          d.kind === "recovery" || d.kind === "phone"
            ? "bg-primary/10 text-primary"
            : d.kind === "authenticator"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
              : "bg-muted text-muted-foreground",
        )}
      >
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium leading-tight">{d.label}</div>
        {d.sublabel && (
          <div className="truncate text-xs text-muted-foreground">{d.sublabel}</div>
        )}
      </div>
      {d.risk && (
        <AlertTriangle className="size-4 shrink-0 text-amber-500" aria-hidden />
      )}
      <Handle type="source" position={Position.Bottom} className="!opacity-0" />
    </div>
  );
}
