import "@xyflow/react/dist/style.css";
import { useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import {
  Background,
  Controls,
  MarkerType,
  ReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import { Plus } from "lucide-react";
import type { LifeArea } from "@shared/enums";
import { LIFE_AREAS } from "@shared/enums";
import { useGraph } from "@/lib/mock/store";
import type { GraphEdge, GraphNode } from "@/lib/mock/derive";
import {
  DEVICE_ICON,
  EDGE_KINDS,
  EDGE_STYLE,
  LIFE_AREA_ICON,
  RECOVERY_ICON,
} from "@/features/shared/display";
import { AccountDetailPanel } from "@/features/inventory/AccountDetailPanel";
import { AddAccountPanel } from "@/features/inventory/AddAccountPanel";
import { MapNode, type MapNodeData } from "./nodes";
import { layoutGraph } from "./layout";

const nodeTypes = { map: MapNode };
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ALL = "__all__";

function toRFNode(n: GraphNode, t: ReturnType<typeof useTranslation>["t"]): Node {
  let data: MapNodeData;
  if (n.kind === "account") {
    const a = n.account;
    data = {
      kind: "account",
      label: a.name,
      sublabel: t(($) => $.lifeAreas[a.lifeArea]),
      iconName: a.lifeArea,
      risk: a.twoFactor === "none" || a.recovery === "none" || a.recovery === "unknown",
      Icon: LIFE_AREA_ICON[a.lifeArea],
    };
  } else if (n.kind === "device") {
    data = {
      kind: "device",
      label: n.device.name,
      sublabel: t(($) => $.deviceKinds[n.device.kind]),
      iconName: n.device.kind,
      Icon: DEVICE_ICON[n.device.kind],
    };
  } else {
    data = { kind: "recovery", label: n.label, iconName: "recovery", Icon: RECOVERY_ICON };
  }
  return { id: n.id, type: "map", position: { x: 0, y: 0 }, data };
}

function toRFEdge(e: GraphEdge): Edge {
  const style = EDGE_STYLE[e.kind];
  return {
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    style: { stroke: style.stroke, strokeWidth: 1.5, strokeDasharray: style.dashed ? "5 4" : undefined },
    markerEnd: { type: MarkerType.ArrowClosed, color: style.stroke, width: 16, height: 16 },
  };
}

export function MapPage() {
  const { t } = useTranslation();
  const { resolvedTheme } = useTheme();
  const [area, setArea] = useState<string>(ALL);
  const [selected, setSelected] = useState<string | undefined>();
  const [adding, setAdding] = useState(false);

  const graph = useGraph(area === ALL ? undefined : (area as LifeArea));

  const { nodes, edges } = useMemo(() => {
    const rfNodes = graph.nodes.map((n) => toRFNode(n, t));
    const rfEdges = graph.edges.map(toRFEdge);
    return { nodes: layoutGraph(rfNodes, rfEdges), edges: rfEdges };
  }, [graph, t]);

  const isEmpty = graph.nodes.length === 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-semibold">{t(($) => $.map.title)}</h1>
          <p className="text-sm text-muted-foreground">{t(($) => $.map.subtitle)}</p>
        </div>
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>{t(($) => $.map.allAreas)}</SelectItem>
            {LIFE_AREAS.map((a) => (
              <SelectItem key={a} value={a}>
                {t(($) => $.lifeAreas[a])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      {isEmpty ? (
        <Empty className="flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Plus className="size-6" />
            </EmptyMedia>
            <EmptyTitle>{t(($) => $.map.emptyTitle)}</EmptyTitle>
            <EmptyDescription>{t(($) => $.map.emptyDesc)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button onClick={() => setAdding(true)}>{t(($) => $.map.emptyCta)}</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          <Legend />
          <div className="relative h-[64svh] w-full overflow-hidden rounded-xl border bg-muted/20 md:h-[calc(100svh-260px)]">
            <ReactFlow
              key={area}
              colorMode={resolvedTheme === "dark" ? "dark" : "light"}
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              fitView
              fitViewOptions={{ padding: 0.2 }}
              nodesDraggable={false}
              nodesConnectable={false}
              edgesFocusable={false}
              proOptions={{ hideAttribution: true }}
              onNodeClick={(_, node) => {
                if ((node.data as unknown as MapNodeData).kind === "account") setSelected(node.id);
              }}
            >
              <Background gap={18} className="opacity-50" />
              <Controls showInteractive={false} />
            </ReactFlow>
          </div>
        </>
      )}

      <AccountDetailPanel
        accountId={selected}
        open={selected !== undefined}
        onOpenChange={(o) => !o && setSelected(undefined)}
      />
      <AddAccountPanel open={adding} onOpenChange={setAdding} onAdded={(id) => setSelected(id)} />
    </div>
  );
}

function Legend() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border bg-muted/30 px-3 py-2 text-xs">
      <span className="font-medium text-muted-foreground">{t(($) => $.map.legendTitle)}:</span>
      {EDGE_KINDS.map((k) => (
        <span key={k} className="flex items-center gap-1.5">
          <span
            className="inline-block w-5"
            style={{
              borderBottom: `2px ${EDGE_STYLE[k].dashed ? "dashed" : "solid"} ${EDGE_STYLE[k].stroke}`,
            }}
          />
          {t(($) => $.map.edges[k])}
        </span>
      ))}
    </div>
  );
}
