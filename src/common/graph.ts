export class Graph<TNode> {

    private _nodes = new Set<TNode>();
    private _edges = new Array<[TNode, TNode]>();

    public addNode(node: TNode) {
        this._nodes.add(node);
    }

    public addEdge(a: TNode, b: TNode) {
        if (this._edges.findIndex((e) => e[0] === a && e[1] === b) >= 0) {
            return;
        }
        this._edges.push([a, b]);
    }

    public topologicalSort(): TNode[] {
        const nodes = Array.from(this._nodes);
        const edges = [...this._edges];

        const hasIncomingEdge = ((node: TNode) => edges.findIndex((edge) => edge[1] === node) >= 0);

        const result = new Array<TNode>();
        const s = nodes.filter((node) => !hasIncomingEdge(node));
        while (s.length > 0) {
            const n = s.shift() as TNode;
            result.push(n);

            const outgoingEdges = edges.filter((edge) => edge[0] === n);
            for (const edge of outgoingEdges) {
                const ei = edges.findIndex((e) => e === edge);
                edges.splice(ei, 1);

                const m = edge[1];
                if (!hasIncomingEdge(m)) {
                    s.push(m);
                }
            }
        }

        if (edges.length > 0) {
            throw new Error('Graph is not acyclic');
        }

        return result;
    }
}
