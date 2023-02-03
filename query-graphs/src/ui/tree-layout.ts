import * as d3flextree from "d3-flextree";
import * as d3hierarchy from "d3-hierarchy";

import {NodeDimensions} from "./store";
import * as treeDescription from "../tree-description";
import {TreeDescription} from "../tree-description";
// TODO: import type; fix `prettier` first :/
import {Edge, Node} from "reactflow";
import {CSSProperties} from "react";
import {NodeData} from "./QueryNode"; // TODO: `import type`

export interface TreeLayout {
    nodes: Node<NodeData>[];
    edges: Edge[];
}

//
// Layout a tree
//
// Returns node and edge lists
export function layoutTree(
    treeData: TreeDescription,
    nodeDimensions: Record<string, NodeDimensions>,
    expandedNodes: Record<string, boolean>,
    expandedSubtrees: Record<string, boolean>,
    resizeObserver: ResizeObserver,
): TreeLayout {
    const root = d3hierarchy.hierarchy(treeData.root, d => {
        if (expandedSubtrees[d.id!]) return d._children;
        return d.children;
    });

    // Layout the tree
    const treelayout = d3flextree
        .flextree<treeDescription.TreeNode>()
        .nodeSize(d => {
            const id = d.data.id!;
            const dim = nodeDimensions[id];
            if (
                dim == undefined ||
                dim.headWidth === undefined ||
                dim.headHeight === undefined ||
                dim.bodyWidth === undefined ||
                dim.bodyHeight === undefined
            )
                return [50, 50];
            if (expandedNodes[id]) return [Math.max(dim.headWidth, dim.bodyWidth) + 20, dim.headHeight + dim.bodyHeight + 50];
            else return [dim.headWidth + 20, dim.headHeight + 50];
        })
        .spacing((a, b) => (a.parent === b.parent ? 0 : 40));
    const layout = treelayout(root);
    const d3nodes = layout.descendants().reverse();
    const d3edges = layout.links();

    // Transform tree representation from d3 into reactflow
    const nodes = d3nodes.map(n => {
        return {
            id: n.data.id,
            position: {x: n.x, y: n.y},
            type: "querynode",
            data: {...n.data, resizeObserver},
        } as Node;
    });
    const edges = d3edges.map(e => {
        const sourceId = e.source.data.id;
        const targetId = e.target.data.id;
        const style = {} as CSSProperties;
        if (e.target.data.edgeWidth) {
            const width = Math.max(1, 10 * Math.min(1, e.target.data.edgeWidth));
            style.strokeWidth = `${width}px`;
        }
        return {
            id: `${sourceId}->${targetId}`,
            source: sourceId,
            target: targetId,
            label: e.target.data.edgeLabel,
            className: e.target.data.edgeClass,
            style: style,
        } as Edge;
    });

    // Add crosslinks
    const visibleNodes = new Set(root.descendants().map(e => e.data.id));
    const crosslinks = [] as Edge[];
    for (const link of treeData.crosslinks ?? []) {
        const sourceId = link.sourceId;
        const targetId = link.targetId;
        if (!visibleNodes.has(targetId) || !visibleNodes.has(sourceId)) continue;
        crosslinks.push({
            id: `${sourceId}->${targetId}`,
            source: sourceId,
            target: targetId,
            className: "qg-crosslink",
        });
    }

    return {nodes: nodes, edges: edges.concat(crosslinks)};
}
