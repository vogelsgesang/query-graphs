import type * as React from "react";
import {useCallback, useEffect, useState} from "react";

import {EditorView, drawSelection, highlightActiveLine, highlightSpecialChars, lineNumbers} from "@codemirror/view";
import {ChangeSpec, EditorState} from "@codemirror/state";
//import {bracketMatching} from "@codemirror/matchbrackets";

import {CodeMirror} from "./CodeMirror";

const extensions = [
    EditorState.readOnly.of(true),
    EditorView.lineWrapping,
    lineNumbers(),
    drawSelection(),
    highlightActiveLine(),
    highlightSpecialChars(),
    //bracketMatching({}),
];

interface HighlightedViewProps {
    text: string;
}

export const HighlightedView: React.FC<HighlightedViewProps> = ({text}) => {
    const [view, setView] = useState<EditorView | null>(null);

    const viewWasCreated = useCallback((view: EditorView) => setView(view), [setView]);
    const viewWillBeDestroyed = useCallback((_view: EditorView) => setView(null), [setView]);

    // Effect to update the editor context whenever the script changes
    useEffect(() => {
        // CodeMirror not set up yet?
        if (view === null) {
            return;
        }

        const changes: ChangeSpec[] = [];
        // Did the script change?
        changes.push({
            from: 0,
            to: view.state.doc.length,
            insert: text,
        });
        view.dispatch({changes});
    }, [view, text]);

    return <CodeMirror extensions={extensions} viewWasCreated={viewWasCreated} viewWillBeDestroyed={viewWillBeDestroyed} />;
};
