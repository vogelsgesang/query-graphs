import ReactFlow, {MiniMap, Node, Controls, ReactFlowProvider} from "reactflow";
import "reactflow/dist/base.css";

import {layoutTree, TreeLayout} from "./tree-layout";
import {TreeDescription, TreeNode, visitTreeNodes, allChildren} from "../tree-description";
import {useMemo, useEffect, useRef, StrictMode, useCallback} from "react";
import {NodeData, QueryNode} from "./QueryNode";
import "./QueryGraph.css";
import {useGraphRenderingStore} from "./store";
import {Interpolator, useAnimatedTransition} from "./useAnimatedTransition";
import {assertNotNull} from "../loader-utils";

interface QueryGraphProps {
    treeDescription: TreeDescription;
}

function minimapNodeColor(n: Node<TreeNode>): string {
    if (n.data.nodeColor) return n.data.nodeColor;
    if (n.data.iconColor) return n.data.iconColor;
    return "hsl(0, 0%, 72%)";
}

const nodeTypes = {
    querynode: QueryNode,
};

function interpolateNumber(from: number, to: number, progress: number) {
    return from + progress * (to - from);
}

interface XYPosition {
    x: number;
    y: number;
}
type NodeAnim = [XYPosition, Node<NodeData>];

function interpolateNode([from, to]: NodeAnim, progress: number): Node<NodeData> {
    return {
        ...to,
        position: {
            x: interpolateNumber(from.x, to.position.x, progress),
            y: interpolateNumber(from.y, to.position.y, progress),
        },
    };
}

function withOpacity(n: Node<NodeData>, opacity: number): Node<NodeData> {
    const pointerEvents = opacity < 1 ? "none" : undefined;
    return {...n, style: {opacity, pointerEvents}};
}

// Opacity should be faded in only during the second half of the "entering" operation
function opacityDelay(p: number) {
    return Math.max(0, p - 0.5) * 2;
}

function interpolateGraphsFactory(parentMap: Map<string, string>, from: TreeLayout, to: TreeLayout): Interpolator<TreeLayout> {
    // Determine which nodes are new, erased and changed.
    // This is essentially a hash-based full outer join algorithm from your favorite database lecture.
    const fromIdIdx = new Map<string, Node<NodeData>>(from.nodes.map(e => [e.id, e]));
    const toIdIdx = new Map<string, Node<NodeData>>(to.nodes.map(e => [e.id, e]));
    type JoinResult = [Node<NodeData> | undefined, Node<NodeData>];
    const nodesJoinResult = to.nodes.map(n => [fromIdIdx.get(n.id), n] as JoinResult);
    const matchedNodes = nodesJoinResult.filter(n => n[0] !== undefined) as Array<[Node<NodeData>, Node<NodeData>]>;
    const newNodes = nodesJoinResult.filter(n => n[0] === undefined).map(e => e[1]);
    // Ok, I was a bit lazy... the above is just a left-outer join. Let's construct the other half
    // of the full outer join using an anti-join.
    const removedNodes = from.nodes.filter(n => !toIdIdx.has(n.id));

    // For matched nodes, we simply animate from the old to the new position
    const matchedNodesAnim = matchedNodes.map(e => [e[0].position, e[1]] as NodeAnim);

    // For new/removed nodes: Determine the start positions, but looking which parent was
    // already previously visible/will still be visible afterwards.
    console.log(parentMap);
    const newNodesAnim = newNodes.map(self => {
        let visibleParentId = self.id;
        while (!fromIdIdx.has(visibleParentId)) {
            const p = parentMap.get(visibleParentId);
            if (!p) return [{x: 0, y: 0}, self] as NodeAnim;
            visibleParentId = p;
        }
        const visibleParentNode = fromIdIdx.get(visibleParentId)!;
        return [visibleParentNode.position, self] as NodeAnim;
    });
    const removedNodesAnim = removedNodes.map(self => {
        let visibleParentId = self.id;
        while (!toIdIdx.has(visibleParentId)) {
            const p = parentMap.get(visibleParentId);
            if (!p) return [{x: 0, y: 0}, self] as NodeAnim;
            visibleParentId = p;
        }
        const visibleParentNode = toIdIdx.get(visibleParentId)!;
        return [self.position, {...self, position: visibleParentNode.position}] as NodeAnim;
    });

    // Determine which edges are new, erased and changed.
    const edgesFromSet = new Set<string>(from.edges.map(e => e.id));
    const edgesToSet = new Set<string>(to.edges.map(e => e.id));
    const matchedEdges = to.edges.filter(n => edgesFromSet.has(n.id));
    const newEdges = to.edges.filter(n => !edgesFromSet.has(n.id));
    const removedEdges = from.edges
        .filter(n => !edgesToSet.has(n.id))
        .map(e => {
            return {...e, className: e.className + " " + "anim-state-leaving"};
        });

    return (progress: number) => {
        // Fade in/out added/removed nodes
        const newNodesAnim2 = newNodesAnim.map(n => [n[0], withOpacity(n[1], opacityDelay(progress))] as NodeAnim);
        const removedNodesAnim2 = removedNodesAnim.map(n => [n[0], withOpacity(n[1], opacityDelay(1 - progress))] as NodeAnim);
        const visibleNodes = matchedNodesAnim.concat(newNodesAnim2).concat(progress < 1 ? removedNodesAnim2 : []);

        // Fade in/out added/removed edges
        const newEdges2 = newEdges.map(e => {
            return {...e, style: {opacity: opacityDelay(progress)}};
        });
        const removedEdges2 = removedEdges.map(e => {
            return {...e, style: {opacity: opacityDelay(1 - progress)}};
        });
        const visibleEdges = matchedEdges.concat(newEdges2).concat(progress < 1 ? removedEdges2 : []);

        return {
            nodes: visibleNodes.map(n => interpolateNode(n, progress)),
            edges: visibleEdges,
        };
    };
}

function computeParentMap(root: TreeNode) {
    const parentIdMap = new Map<string, string>();
    visitTreeNodes(
        root,
        n => {
            for (const c of allChildren(n)) {
                assertNotNull(c.id);
                assertNotNull(n.id);
                parentIdMap.set(c.id, n.id);
            }
        },
        allChildren,
    );
    console.log({root, parentIdMap});
    return parentIdMap;
}

function QueryGraphInternal({treeDescription}: QueryGraphProps) {
    // Create a ResizeObserver to keep track of the sizes of the nodes
    const resizeObserverRef = useRef<ResizeObserver>();
    const updateNodeDimensions = useGraphRenderingStore(s => s.updateNodeDimensions);

    const resizeObserver = useMemo(() => {
        resizeObserverRef.current?.disconnect();
        const observer = new ResizeObserver(updateNodeDimensions);
        resizeObserverRef.current = observer;
        return observer;
    }, [updateNodeDimensions]);

    useEffect(() => {
        return () => {
            resizeObserverRef.current?.disconnect();
        };
    }, []);

    // Layout the tree, using the actual measured sizes of the DOM nodes
    const nodeDimensions = useGraphRenderingStore(s => s.nodeDimensions);
    const expandedNodes = useGraphRenderingStore(s => s.expandedNodes);
    const expandedSubtrees = useGraphRenderingStore(s => s.expandedSubtrees);
    const goalLayout = useMemo(() => layoutTree(treeDescription, nodeDimensions, expandedNodes, expandedSubtrees, resizeObserver), [
        treeDescription,
        nodeDimensions,
        expandedNodes,
        expandedSubtrees,
        resizeObserver,
    ]);

    // Transition the tree
    const parentMap = useMemo(() => computeParentMap(treeDescription.root), [treeDescription]);
    const currentLayout = useAnimatedTransition(
        goalLayout,
        500,
        useCallback((from: TreeLayout, to: TreeLayout) => interpolateGraphsFactory(parentMap, from, to), [parentMap]),
    );

    console.log({rendered: currentLayout.nodes.find(n => n.id == "_379") !== undefined});

    // Render the graph
    return (
        <ReactFlow
            nodes={currentLayout.nodes}
            edges={currentLayout.edges}
            nodeOrigin={[0.5, 0]}
            nodeTypes={nodeTypes}
            fitView
            maxZoom={2}
            elementsSelectable={true}
            nodesDraggable={false}
            nodesConnectable={false}
            edgesFocusable={false}
            nodesFocusable={false}
            className={"query-graph"}
        >
            <MiniMap zoomable={true} pannable={true} nodeColor={minimapNodeColor} />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
}

export function QueryGraph(props: QueryGraphProps) {
    return (
        <StrictMode>
            <ReactFlowProvider>
                <QueryGraphInternal {...props} />
            </ReactFlowProvider>
        </StrictMode>
    );
}
