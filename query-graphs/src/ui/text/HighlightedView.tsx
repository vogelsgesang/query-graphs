import type * as React from "react";
import {useCallback, useEffect, useState} from "react";

import {EditorView, drawSelection, highlightActiveLine, highlightSpecialChars, lineNumbers} from "@codemirror/view";
import {EditorState} from "@codemirror/state";
import {bracketMatching, defaultHighlightStyle, foldGutter, syntaxHighlighting} from "@codemirror/language";
import {json} from "@codemirror/lang-json";

import {CodeMirror} from "./CodeMirror";

const extensions = [
    EditorState.readOnly.of(true),
    drawSelection(),
    highlightActiveLine(),
    highlightSpecialChars(),
    lineNumbers(),
    foldGutter(),
    syntaxHighlighting(defaultHighlightStyle),
    bracketMatching({}),
    json(),
];

interface HighlightedViewProps {
    value: string;
}

export const HighlightedView: React.FC<HighlightedViewProps> = ({value: value}) => {
    const [view, setView] = useState<EditorView | null>(null);

    const viewWasCreated = useCallback((view: EditorView) => setView(view), [setView]);
    const viewWillBeDestroyed = useCallback((_view: EditorView) => setView(null), [setView]);

    // Effect to keep the editor content in sync
    useEffect(() => {
        // CodeMirror not set up yet?
        if (view === null) {
            return;
        }

        // Did the text change?
        const currentValue = view.state.doc.toString();
        if (currentValue !== value) {
            view.dispatch({
                changes: {
                    from: 0,
                    to: view.state.doc.length,
                    insert: value,
                },
            });
        }
    }, [view, value]);

    return <CodeMirror extensions={extensions} viewWasCreated={viewWasCreated} viewWillBeDestroyed={viewWillBeDestroyed} />;
};
