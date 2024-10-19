import type * as React from "react";
import {useCallback, useEffect, useMemo, useState} from "react";

import {EditorView, drawSelection, highlightActiveLine, highlightSpecialChars, lineNumbers} from "@codemirror/view";
import {EditorState, Extension} from "@codemirror/state";
import {bracketMatching, defaultHighlightStyle, foldGutter, syntaxHighlighting} from "@codemirror/language";
import {json} from "@codemirror/lang-json";
import {sql} from "@codemirror/lang-sql";

import {CodeMirror} from "./CodeMirror";
import {referenceDecorations} from "./HighlightDecoration";

const baseExtensions = [
    EditorState.readOnly.of(true),
    drawSelection(),
    highlightActiveLine(),
    highlightSpecialChars(),
    lineNumbers(),
    foldGutter(),
    syntaxHighlighting(defaultHighlightStyle),
    bracketMatching({}),
    referenceDecorations,
];

const languageExtensions = new Map<string, () => Extension> ([
    ["json", json],
    ["sql", sql],
]);

interface HighlightedViewProps {
    value: string;
    language: string;
}

export const HighlightedView: React.FC<HighlightedViewProps> = ({value, language}) => {
    const [view, setView] = useState<EditorView | null>(null);

    const viewWasCreated = useCallback((view: EditorView) => setView(view), [setView]);
    const viewWillBeDestroyed = useCallback((_view: EditorView) => setView(null), [setView]);

    const extensions = useMemo(() => {
        const langExt = languageExtensions.get(language);
        if (langExt === undefined) return baseExtensions;
        return baseExtensions.concat([langExt()]);
    }, [language]);

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
