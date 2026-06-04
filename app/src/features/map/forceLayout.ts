import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from "d3-force";
import type { Edge, Node } from "@xyflow/react";

interface SimNode extends SimulationNodeDatum {
  id: string;
}

/**
 * Obsidian-style layout: a force simulation with collision so nodes spread out
 * and don't overlap, letting you see every connection at once. Run to a settled
 * state up front; nodes stay draggable so the user can rearrange the web.
 */
export function forceLayout(nodes: Node[], edges: Edge[]): Node[] {
  const simNodes: SimNode[] = nodes.map((n, i) => ({
    id: n.id,
    // Seed on a ring so the simulation starts untangled and is deterministic.
    x: Math.cos((i / Math.max(1, nodes.length)) * 2 * Math.PI) * 220,
    y: Math.sin((i / Math.max(1, nodes.length)) * 2 * Math.PI) * 220,
  }));
  const links: SimulationLinkDatum<SimNode>[] = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  const sim = forceSimulation<SimNode>(simNodes)
    .force("charge", forceManyBody<SimNode>().strength(-520))
    .force(
      "link",
      forceLink<SimNode, SimulationLinkDatum<SimNode>>(links)
        .id((d) => d.id)
        .distance(150)
        .strength(0.35),
    )
    .force("center", forceCenter(0, 0))
    .force("collide", forceCollide<SimNode>(120))
    .stop();

  for (let i = 0; i < 320; i++) sim.tick();

  const byId = new Map(simNodes.map((n) => [n.id, n]));
  return nodes.map((n) => {
    const s = byId.get(n.id);
    return { ...n, position: { x: s?.x ?? 0, y: s?.y ?? 0 } };
  });
}
