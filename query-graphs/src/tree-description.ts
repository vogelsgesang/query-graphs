export type IconName =
    | "run-query-symbol"
    | "filter-symbol"
    | "groupby-symbol"
    | "sort-symbol"
    | "inner-join-symbol"
    | "left-join-symbol"
    | "right-join-symbol"
    | "full-join-symbol"
    | "table-symbol"
    | "temp-table-symbol"
    | "virtual-table-symbol"
    | "const-table-symbol";

export interface TextDoc {
    /// The document id
    id: string;
    /// The title
    title: string;
    /// The title
    content: string;
    /// The language
    language: string;
}

export interface TextDocRef {
    /// Id of the document
    docId: string;
    /// Start offset
    startOffset: number;
    /// End offset
    endOffset: number;
}

export interface TreeNode {
    // The displayed node name
    name?: string;
    // Color applied to node rects
    nodeColor?: string;
    // The name of the icon rendered for this node
    icon?: IconName;
    // The color for the icon
    iconColor?: string;
    // Rendered in the tooltip
    properties?: Map<string, string>;

    // Additional CSS classes applied to the incoming link
    edgeClass?: string;
    // Label placed on the incoming edge
    edgeLabel?: string;
    // Width of the incoming edge
    edgeWidth?: number;

    // All child nodes visible by default
    children?: TreeNode[];
    // All collapsed child nodes
    collapsedChildren?: TreeNode[];
    // Whether collapsed children are shown by default
    expandedByDefault?: boolean;

    /// References into text documents (if any)
    textRefs?: TextDocRef[];
}

export interface Crosslink {
    source: TreeNode;
    target: TreeNode;
}

export interface TreeDescription {
    /// The tree root
    root: TreeNode;
    /// Metadata about the graph; displayed in the top-level tree label
    metadata?: Map<string, string>;
    /// Additional links between indirectly related nodes
    crosslinks?: Crosslink[];
    /// Related text documents
    textDocs?: TextDoc[];
}

// A recursive helper function for walking through all nodes
export function visitTreeNodes<T>(parent: T, visitFn: (n: T) => void, childrenFn: (n: T) => T[]) {
    if (!parent) {
        return;
    }
    visitFn(parent);
    for (const child of childrenFn(parent)) {
        visitTreeNodes(child, visitFn, childrenFn);
    }
}

interface TreeLike<T extends TreeLike<T>> {
    children?: T[];
    collapsedChildren?: T[];
}

// Returns all children of a node, including collapsed children
export function allChildren<T extends TreeLike<T>>(n: T): T[] {
    return (n.children ?? []).concat(n.collapsedChildren ?? []);
}
