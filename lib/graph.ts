export type GNode = { id: number; title: string };
export type GEdge = { from: number; to: number };

export function hasCycle(nodes: GNode[], edges: GEdge[]): boolean {
  const adj = new Map<number, number[]>();
  const state = new Map<number, 0 | 1 | 2>(); // 0=unseen,1=visiting,2=done
  nodes.forEach(n => adj.set(n.id, []));
  edges.forEach(e => adj.get(e.from)!.push(e.to));

  const dfs = (u: number): boolean => {
    const st = state.get(u) ?? 0;
    if (st === 1) return true;
    if (st === 2) return false;
    state.set(u, 1);
    for (const v of adj.get(u)!) if (dfs(v)) return true;
    state.set(u, 2);
    return false;
  };

  for (const n of nodes) if ((state.get(n.id) ?? 0) === 0 && dfs(n.id)) return true;
  return false;
}

export function topoSort(nodes: GNode[], edges: GEdge[]): number[] {
  const indeg = new Map<number, number>();
  const adj = new Map<number, number[]>();
  nodes.forEach(n => { indeg.set(n.id, 0); adj.set(n.id, []); });
  edges.forEach(e => { adj.get(e.from)!.push(e.to); indeg.set(e.to, (indeg.get(e.to) ?? 0) + 1); });

  const q: number[] = [];
  for (const [id, d] of indeg) if (d === 0) q.push(id);

  const order: number[] = [];
  while (q.length) {
    const u = q.shift()!;
    order.push(u);
    for (const v of adj.get(u)!) {
      indeg.set(v, (indeg.get(v) ?? 0) - 1);
      if (indeg.get(v) === 0) q.push(v);
    }
  }
  return order.length === nodes.length ? order : [];
}

export function earliestStarts(nodes: GNode[], edges: GEdge[], durationDays = 1): Record<number, number> {
  const order = topoSort(nodes, edges);
  if (!order.length) throw new Error("Graph has a cycle");

  const preds = new Map<number, number[]>();
  nodes.forEach(n => preds.set(n.id, []));
  edges.forEach(e => preds.get(e.to)!.push(e.from));

  const ES: Record<number, number> = {};
  for (const id of order) {
    const p = preds.get(id)!;
    ES[id] = p.length ? Math.max(...p.map(pp => (ES[pp] ?? 0) + durationDays)) : 0;
  }
  return ES;
}

export function criticalPath(nodes: GNode[], edges: GEdge[], durationDays = 1): number[] {
  const order = topoSort(nodes, edges);
  if (!order.length) throw new Error("Graph has a cycle");

  const preds = new Map<number, number[]>();
  nodes.forEach(n => preds.set(n.id, []));
  edges.forEach(e => preds.get(e.to)!.push(e.from));

  const dist: Record<number, number> = {};
  const parent: Record<number, number | null> = {};
  nodes.forEach(n => { dist[n.id] = 0; parent[n.id] = null; });

  for (const id of order) {
    for (const p of preds.get(id)!) {
      if (dist[p] + durationDays > dist[id]) {
        dist[id] = dist[p] + durationDays;
        parent[id] = p;
      }
    }
  }

  let end = order[0];
  for (const id of order) if (dist[id] > dist[end]) end = id;

  const path: number[] = [];
  for (let cur: number | null = end; cur != null; cur = parent[cur]) path.push(cur);
  return path.reverse();
}
