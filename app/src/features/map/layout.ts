import Dagre from "@dagrejs/dagre";
import type { Edge, Node } from "@xyflow/react";

const NODE_W = 190;
const NODE_H = 64;

/**
 * Auto-layout with dagre so the map reads as a clean dependency tree rather than
 * a free-form board. Nodes aren't user-movable by design — the structure is the
 * point, not the arrangement.
 */
export function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  // Generous spacing + network-simplex keeps the hub-and-spoke shape readable
  // and cuts down on edge overlap on the dense "all areas" view.
  g.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 110, ranker: "network-simplex" });

  for (const n of nodes) g.setNode(n.id, { width: NODE_W, height: NODE_H });
  for (const e of edges) g.setEdge(e.source, e.target);

  Dagre.layout(g);

  return nodes.map((n) => {
    const p = g.node(n.id);
    return { ...n, position: { x: p.x - NODE_W / 2, y: p.y - NODE_H / 2 } };
  });
}
